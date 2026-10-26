// Sonsuz zoom pilotu: iç içe gravürler (galaksi → kum tanesi). Her görsel bir öncekinin içinde, ölçülmüş bir
// noktaya (p) ve genişliğe (s) yerleşir; kamera log uzayında sabit hızla dalar. Her kare t'nin saf fonksiyonudur.
import { W, H, ease, seg, lerp, clamp01 } from '../core.js';
import { C, F, setFont, grain } from '../tower.js';

// p: çocuğun ebeveyndeki merkezi (ebeveyn genişliği = 1, yüksekliği = 1,5), s: çocuğun genişliği (ebeveyne oranla)
// w: o levhanın gerçek görüş genişliği (m)
const LEVELS = [
  // s ≥ 0,12: ebeveyn görünür kaldığı sürece en çok ~8 kat büyür, bulanıklaşmaz (gerçek oran sayaçta)
  { file: 'z1.png', name: 'GALAKSİ', w: 1e21, p: [0.53, 0.72], s: 0.12 },
  { file: 'z2.png', name: 'GÜNEŞ SİSTEMİ', w: 4.5e11, p: [0.5, 0.75], s: 0.185 },
  { file: 'z3.png', name: 'DÜNYA', w: 1.31e7, p: [0.503, 0.693], s: 0.12 },
  { file: 'z4.png', name: 'MARMARA', w: 4e5, p: [0.5, 0.75], s: 0.15 },
  { file: 'z5.png', name: 'İSTANBUL', w: 6e3, p: [0.55, 0.75], s: 0.12 },
  { file: 'z6.png', name: 'KUMSAL', w: 4, p: [0.5, 0.725], s: 0.29 },
  { file: 'z7.png', name: 'BİR KUM TANESİ', w: 1.5e-3 },
];
const ASPECT = 1.5;                       // levha yüksekliği / genişliği
const VIEW = { y: 540, h: H - 540 };      // gravür penceresi; üstü kâğıt bant (yazılar)
const BASE = W;                           // seviye başında levha genişliği = ekran genişliği
const T0 = 0.15, SPEED = 1.45, TAIL = 1.6; // dalış başlangıcı (sn), log-zoom hızı (ln/sn), sondaki bekleme

// tr-TR: 10^n'i sıfırlarıyla yaz
function decimal(n) {
  if (n >= 0) return (10n ** BigInt(n)).toLocaleString('tr-TR');
  return '0,' + '0'.repeat(-n - 1) + '1';
}

export async function makeSonsuzZoomRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const load = f => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = '../assets/gen/sonsuz-zoom/' + f; });
  const raw = await Promise.all(LEVELS.map(l => load(l.file)));
  // kenarları yumuşatılmış kopyalar: çocuk levha ebeveynin üstüne dikiş göstermeden oturur
  const soft = raw.map(img => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const m = document.createElement('canvas'); m.width = img.width; m.height = img.height;
    const mg = m.getContext('2d');
    // eliptik yumuşatma: merkezden yarıçapın %55'ine kadar tam, kenarda sıfır (kare yama görünmesin)
    mg.save(); mg.translate(img.width / 2, img.height / 2); mg.scale(img.width / 2, img.height / 2);
    const gr = mg.createRadialGradient(0, 0, 0, 0, 0, 1);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    mg.fillStyle = gr; mg.fillRect(-1, -1, 2, 2); mg.restore();
    g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0);
    return c;
  });

  // seviye sınırları (log uzayında)
  const U = [0];
  for (let k = 0; k < LEVELS.length - 1; k++) U.push(U[k] + Math.log(1 / LEVELS[k].s));
  const UEND = U[U.length - 1];
  const DIVE = UEND / SPEED;
  const duration = T0 + DIVE + 0.9 + TAIL;

  // kamera: log-zoom u(t); başta 0,9 sn giriş eğrisiyle hızlanır, sonda 0,9 sn yavaşlar (sürekli hareket, doğrusal gövde)
  const ACC = 0.9;
  function camU(t) {
    const x = t - T0;
    if (x <= 0) return 0;
    const v = SPEED, a = v / ACC;          // sabit ivme ile hızlan / yavaşla
    const uAcc = 0.5 * a * ACC * ACC;
    const cruise = (UEND - 2 * uAcc) / v;
    if (x < ACC) return 0.5 * a * x * x;
    if (x < ACC + cruise) return uAcc + v * (x - ACC);
    const y = Math.min(x - ACC - cruise, ACC);
    return Math.min(UEND, uAcc + v * cruise + v * y - 0.5 * a * y * y) + Math.max(0, x - 2 * ACC - cruise) * 0.02;
  }

  // seviye k'nın merkezi: başta k'nın kendi merkezi (0,5; 0,75), sonda çocuğun yerleştiği p_k.
  // Ekran uzayında hedefe doğrusal kayar: c = p + (a − p)·(1 − f)·e^(−f·L)
  function frame(u) {
    let k = 0; while (k < LEVELS.length - 1 && u >= U[k + 1]) k++;
    const L = k < LEVELS.length - 1 ? U[k + 1] - U[k] : 1;
    const f = k < LEVELS.length - 1 ? (u - U[k]) / L : 0;
    const scale = BASE * Math.exp(u - U[k]);
    const a = [0.5, ASPECT / 2], p = LEVELS[k].p || a;
    const d = (1 - f) * Math.exp(-f * L);
    const c = [p[0] + (a[0] - p[0]) * d, p[1] + (a[1] - p[1]) * d];
    return { k, f, scale, c };
  }

  function drawLevel(img, x, y, w) { ctx.drawImage(img, x, y, w, w * ASPECT); }

  function render(t) {
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    const u = camU(t);
    const { k, f, scale, c } = frame(u);
    const cx = W / 2, cy = VIEW.y + VIEW.h / 2;
    // seviye k'nın sol üst köşesi (ekran)
    const x0 = cx - c[0] * scale, y0 = cy - c[1] * scale;
    ctx.save(); ctx.beginPath(); ctx.rect(0, VIEW.y, W, VIEW.h); ctx.clip();
    ctx.imageSmoothingQuality = 'high';
    // ebeveyn (k − 1): k'nın kenarları ekranı tam örtmeyebilir
    if (k > 0) {
      const P = LEVELS[k - 1], pw = scale / P.s;
      const px = x0 + (0.5 * scale) - P.p[0] * pw, py = y0 + (ASPECT / 2) * scale - P.p[1] * pw;
      drawLevel(raw[k - 1], px, py, pw);
    }
    // seviye başında yumuşak kenarlı (önceki karedeki çocukla aynı), sonra 0,3 seviye boyunca keskin kenara geçer
    drawLevel(k > 0 ? soft[k] : raw[k], x0, y0, scale);
    if (k > 0) { ctx.globalAlpha = ease.state(clamp01(f / 0.3)); drawLevel(raw[k], x0, y0, scale); ctx.globalAlpha = 1; }
    // çocuk ve torun
    let X = x0, Y = y0, S = scale;
    for (let j = k; j < Math.min(k + 2, LEVELS.length - 1); j++) {
      const L = LEVELS[j], cw = S * L.s;
      const nx = X + L.p[0] * S - 0.5 * cw, ny = Y + L.p[1] * S - (ASPECT / 2) * cw;
      if (cw > 2) drawLevel(soft[j + 1], nx, ny, cw);
      X = nx; Y = ny; S = cw;
    }
    ctx.restore();

    // üst bant: seviye adı ve ekran genişliği (sayaç)
    const lw = k < LEVELS.length - 1 ? lerp(Math.log10(LEVELS[k].w), Math.log10(LEVELS[k + 1].w), f) : Math.log10(LEVELS[k].w);
    const n = Math.floor(lw + 1e-9);
    ctx.fillStyle = C.ink; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.fillText('№ PİLOT · KAÇ SIFIR?', 90, 300);
    setFont(ctx, F.head(84)); ctx.fillStyle = C.ink;
    const nm = (f > 0.55 && k < LEVELS.length - 1) ? LEVELS[k + 1].name : LEVELS[k].name;
    ctx.fillText(nm, 90, 400);
    setFont(ctx, F.mono(34)); ctx.fillStyle = C.graphite; ctx.fillText('EKRANIN GENİŞLİĞİ', 90, 455);
    const num = decimal(n) + ' m';
    let fs = 46; setFont(ctx, F.head(fs));
    while (ctx.measureText(num).width > 830 && fs > 30) { fs -= 1; setFont(ctx, F.head(fs)); }
    ctx.fillStyle = C.red; ctx.fillText(num, 90, 510);
    ctx.globalAlpha = 0.5; ctx.drawImage(grain(), 0, 0); ctx.globalAlpha = 1;
  }
  return { duration, render };
}

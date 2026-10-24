// "Voyager" şablonu (Kaç Sıfır?): İnsanlığın en uzağa giden aracı 49 yılda nereye vardı?
// Kare 0: yıldız alanında gravür Voyager 1; kesik çizgi boyunca Dünya'ya sinyal dalgaları akar; soru başlık.
// l02–l04: sonda küçülerek Güneş Sistemi planına iner; kamera sondayı izleyerek uzaklaşır (her karede doğrusal ölçek,
// kayan ölçek çubuğu), yörüngeler gerçek yarıçaplarda; yıl sayacı kelimelere bağlı: Jüpiter 1979, Satürn 1980,
// helyopoz 2012 (121,6 AU), "iki bin yirmi altı"da 2026 = 1 ışık günü (173,1 AU).
// l05: sinyal sondadan Dünya'ya 24 saatte. Doruk: sinyal çizgisi tek bir kareye büzülür (ışığın 1 günü); "kırk dokuz"da
// sahne 49 yılın ≈ 18.000 gün karesiyle dolar, "aldı"da kırmızı. l08: ızgara Güneş'e çöker; log uzayında tek geri
// çekilme: ışık günü halkası Güneş'in yanında yarım piksele küçülür, 4,24 ışık yıllık çizgi uzar; ×100 büyüteç.
// Döngüde Güneş'in yanındaki Voyager noktası büyüyüp kare 0'daki sondaya döner.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { VOYAGER_CARD, drawVoyager, drawDSN, drawJupiter, drawSaturn, drawWaves } from '../voyager_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 660, y: 1236, r: 120 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const GR2 = '#5E594E';
const SUN = { x: 540, y: 1080 };
// gerçek yörünge yarıçapları (AU)
const ORBITS = [['MERKÜR', 0.39], ['VENÜS', 0.72], ['DÜNYA', 1.0], ['MARS', 1.52], ['JÜPİTER', 5.2], ['SATÜRN', 9.54], ['URANÜS', 19.2], ['NEPTÜN', 30.1]];
const HELIO = 121.6, LIGHTDAY = 173.1, PROXIMA = 268000, AU_KM = 149.6e6;
// yol (şematik açılar, gerçek uzaklıklar): yıl → (r AU, ekliptik boylam °)
const Y0 = 1977.68, YJ = 1979.18, YS = 1980.87, YH = 2012.65, YL = 2026.88, V = 3.555;   // V: Satürn sonrası AU/yıl (2026 sonunda 173,1 AU)
const rAt = y => y <= Y0 ? 1 : y < YJ ? 1 + 4.2 * ease.state((y - Y0) / (YJ - Y0)) : y < YS ? lerp(5.2, 9.54, (y - YJ) / (YS - YJ)) : 9.54 + V * (y - YS);
const thAt = y => y <= Y0 ? 343 : y < YJ ? lerp(343, 485, (y - Y0) / (YJ - Y0)) : y < YS ? lerp(485, 545, (y - YJ) / (YS - YJ)) : 618 - 73 * Math.exp(-(rAt(y) - 9.54) / 12);
// ekliptik boylam → ekran açısı: kaçış yönü (258°) sağ üste (−38°); fırlatma sağ altta, Jüpiter solda, Satürn sol üstte
const phi = th => ((-38 + (th - 618)) * Math.PI) / 180;
// gün ızgarası: 5 Eyl 1977 → 18 Kas 2026 ≈ 17.970 gün; 156 sütun × 116 satır
const DAYS = 17970, GC = 156, GRID = { x0: 92, y0: 830, w: 688, h: 470 };   // sağda Sıfır için boşluk

export function voyagerTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    launch: Wd('l02', 'fırlatıldı'), jup: Wd('l03', 'jüpiter'), sonra: Wd('l03', 'sonra'), sat: Wd('l03', 'satürn'), gecti: Wd('l03', 'geçti'), ve: Wd('l03', 've'),
    out: Wd('l03', 'çıktı'), today: L.l04.t0, on: Wd('l04', 'on'), iki: Wd('l04', 'iki'), reach: Wd('l04', 'ışık'),
    sig0: L.l05.t0, gunde: Wd('l05', 'günde'), cmp0: L.l06.t0 - 0.1, lightDone: Wd('l06', 'alıyor'), voy: Wd('l06', 'voyager'),
    hero: L.l07.t0 - 0.04, aldi: Wd('l07', 'aldı'), prox: L.l08.t0 - 0.1, yetmis: Wd('l08', 'yetmiş'), yil: Wd('l08', 'sürerdi') - 0.2, loop0: tl.loop0,
  };
  T.mapIn = L.l02.t0 - 0.2; T.follow = L.l08.end + 0.3;
  return T;
}

export async function makeVoyagerRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = voyagerTimes(tl);
  // yıl: anlatım kelimelerine bağlı; "Jüpiter'in"de 1979, "Satürn'ün … geçti"de 1980, "çıktı"da 2012, "iki bin yirmi altı"da 2026
  const yearAt = t => t < T.launch ? Y0 : t < T.jup ? lerp(Y0, YJ, ease.state(seg(t, T.launch, T.jup - T.launch))) : t < T.sonra ? YJ
    : t < T.sat ? lerp(YJ, YS, ease.state(seg(t, T.sonra, T.sat - T.sonra))) : t < T.ve ? YS
    : t < T.out ? lerp(YS, YH, ease.state(seg(t, T.ve, T.out - T.ve))) : t < T.today ? YH : t < T.iki ? lerp(YH, YL, ease.state(seg(t, T.today, T.iki - T.today))) : YL;
  // harita ölçeği: sonda Güneş'ten Dpx uzakta kalır (her karede doğrusal); başta iç gezegenler görünür
  const Dpx = t => 230 + 210 * ease.state(seg(t, T.launch, T.iki - T.launch));
  // duraklarda donmasın: fırlatma öncesi %12 yavaş yaklaşma, 2026'dan sonra %12 yavaş uzaklaşma (ışık günü halkası içeri girer)
  const zf = t => (1 + 0.12 * seg(t, T.mapIn + 0.8, T.launch - T.mapIn - 0.8)) * (1 - 0.12 * seg(t, T.iki, T.cmp0 - T.iki));
  const pxAU = t => Math.min(85, Dpx(t) / rAt(yearAt(t))) * zf(t);
  const P = (r, th, k) => [SUN.x + Math.cos(phi(th)) * r * k, SUN.y + Math.sin(phi(th)) * r * k];
  const rnd = mulberry32(49);
  const STARS = Array.from({ length: 240 }, () => [rnd() * W, STAGE_TOP + rnd() * (1440 - STAGE_TOP), rnd()]);
  const chip = (s, x, y, a = 1, col = C.ink, al = 'center', size = 32) => { if (a <= 0) return; setFont(ctx, F.mono(size)); ctx.textAlign = al; const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 8, y - size - 2, tw + 16, size + 14); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); };

  // ——— yıldız alanı: döngüsel kayma (kare 0 = son kare) ———
  function stars(t) {
    const ph = (t / D) * Math.PI * 2;
    ctx.save(); ctx.fillStyle = C.ink;
    for (const [x, y, s] of STARS) { const xx = x + Math.sin(ph) * 30 * (0.4 + s), yy = y + Math.cos(ph) * 12 * s; if (s > 0.93) { ctx.fillRect(xx - 4, yy - 0.8, 8, 1.6); ctx.fillRect(xx - 0.8, yy - 4, 1.6, 8); } else ctx.fillRect(xx - 1, yy - 1, 1.6 + s * 1.6, 1.6 + s * 1.6); }
    ctx.restore();
  }

  // ——— kare 0 / döngü: büyük sonda, Dünya'ya akan sinyal dalgaları ———
  const HERO = { x: 480, y: 990, s: 280 }, EARTH0 = { x: 170, y: 1330 };
  const WAVE_P = D / 25;   // döngüye tam bölünen dalga dönemi
  // açılışta sonda 0,9 ölçeğe ve 40 px sağ üste uzaklaşır; döngü sonunda Güneş'in yanındaki noktadan büyüyerek döner
  function heroPose(t) {
    const away = ease.state(seg(t, 2.6, T.mapIn - 2.6));
    if (t < T.loop0) return { x: HERO.x + 40 * away, y: HERO.y - 40 * away, s: HERO.s * (1 - 0.1 * away) };
    const g = ease.state(seg(t, T.loop0 + 0.05, 0.9)), v = proxView(t);
    return { x: lerp(v.vx, HERO.x, g), y: lerp(v.vy, HERO.y, g), s: lerp(4, HERO.s, g) };
  }
  function heroProbe(t, kProbe, kEarth) {
    const ph = (t / D) * Math.PI * 2, h = heroPose(t);
    if (kEarth > 0) {
      ctx.save(); ctx.globalAlpha = kEarth;
      const ax = h.x - 110 * h.s / HERO.s, ay = h.y + 90 * h.s / HERO.s;
      ctx.setLineDash([4, 9]); ctx.beginPath(); ctx.moveTo(EARTH0.x + 12, EARTH0.y - 8); ctx.lineTo(ax, ay); ctx.lineWidth = 1.6; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
      const ang = Math.atan2(EARTH0.y - ay, EARTH0.x - ax);
      for (let j = 0; j < 2; j++) { const u = ((t / WAVE_P) + j * 0.5) % 1; ctx.save(); ctx.translate(lerp(ax, EARTH0.x + 12, u), lerp(ay, EARTH0.y - 8, u)); drawWaves(ctx, ang, (t * 1.6) % 1, 0.8); ctx.restore(); }
      ctx.beginPath(); ctx.arc(EARTH0.x, EARTH0.y, 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      chip('DÜNYA', EARTH0.x + 22, EARTH0.y + 12, 1, C.ink, 'left', 32);
      ctx.restore();
    }
    if (kProbe > 0) { ctx.save(); ctx.globalAlpha = kProbe; ctx.translate(h.x + Math.sin(ph) * 8, h.y + Math.cos(ph) * 5); ctx.scale(1 + 0.03 * Math.sin(ph), 1 + 0.03 * Math.sin(ph)); drawVoyager(ctx, VOYAGER_CARD, { tilt: -0.1 + 0.05 * Math.sin(ph * 2), detail: clamp01(h.s / 120) }, h.s); ctx.restore(); }
  }

  // ——— Güneş Sistemi planı ———
  const SCALE_BLOCK = { x1: 470, y0: 1262 };   // sol alttaki ölçek çubuğu ve not
  function niceScale(k) { for (const v of [0.5, 1, 2, 5, 10, 20, 50, 100, 200]) if (v * k >= 70 && v * k <= 230) return v; return 10; }
  function map(t, k) {
    if (k <= 0) return null;
    const y = yearAt(t), r = rAt(y), K = pxAU(t);
    ctx.save(); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1440 - STAGE_TOP); ctx.clip();
    // yörüngeler (gerçek yarıçap)
    for (const [nm, a] of ORBITS) {
      const R = a * K; if (R < 6 || R > 1400) continue;
      ctx.beginPath(); ctx.arc(SUN.x, SUN.y, R, 0, Math.PI * 2); ctx.lineWidth = nm === 'DÜNYA' ? 2 : 1.4; ctx.strokeStyle = nm === 'DÜNYA' ? C.ink : C.graphite; ctx.setLineDash(nm === 'DÜNYA' ? [] : [6, 6]); ctx.stroke(); ctx.setLineDash([]);
    }
    // helyopoz ve bir ışık günü (yalnız üst yay: ölçek bloğunu ve Sıfır'ı kesmez)
    if (t >= T.out - 0.3) { const R = HELIO * K, a = ease.enter(seg(t, T.out - 0.3, 0.6)); ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(SUN.x, SUN.y, R, Math.PI * 0.95, Math.PI * 2.05); ctx.setLineDash([3, 7]); ctx.lineWidth = 2.4; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
    if (t >= T.reach - 0.3) { const R = LIGHTDAY * K, a = ease.enter(seg(t, T.reach - 0.3, 0.6)); ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(SUN.x, SUN.y, R, Math.PI * 0.95, Math.PI * 2.05); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
    // Güneş
    ctx.beginPath(); ctx.arc(SUN.x, SUN.y, 13, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + t * 0.4; ctx.beginPath(); ctx.moveTo(SUN.x + Math.cos(a) * 18, SUN.y + Math.sin(a) * 18); ctx.lineTo(SUN.x + Math.cos(a) * 26, SUN.y + Math.sin(a) * 26); ctx.lineWidth = 2; ctx.stroke(); }
    // iz: fırlatmadan bugüne
    ctx.beginPath(); const N = 140; for (let i = 0; i <= N; i++) { const yy = lerp(Y0, y, i / N), q = P(rAt(yy), thAt(yy), K); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.setLineDash([10, 6]); ctx.stroke(); ctx.setLineDash([]);
    const vq = P(r, thAt(y), K);
    // sonda (küçük kâğıt diskle), sonra gezegen noktaları üstte (sonda geçerken Jüpiter/Satürn görünür kalır)
    { const ph = (t / D) * Math.PI * 2; ctx.save(); ctx.translate(vq[0], vq[1]); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); drawVoyager(ctx, VOYAGER_CARD, { tilt: -0.3 + 0.04 * Math.sin(ph * 3), detail: 0.4 }, 46); ctx.restore(); }
    const pl = [[1, 343 + (y - Y0) * 360, 5], [5.2, 485 + (y - YJ) * 30.35, 9], [9.54, 545 + (y - YS) * 12.22, 8]];
    for (const [a, th, s] of pl) { const q = P(a, th, K); if (a * K < 4) continue; ctx.beginPath(); ctx.arc(q[0], q[1], s, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; ctx.stroke(); if (a === 9.54) { ctx.beginPath(); ctx.ellipse(q[0], q[1], s * 1.9, s * 0.6, -0.3, 0, Math.PI * 2); ctx.lineWidth = 1.6; ctx.stroke(); } }
    // yörünge adları: Dünya ve dış gezegenler, dıştan içe ≥ 60 px aralık; R ≥ 70; ölçek bloğuna 40 px'ten yakınsa yok
    let lastR = 1e9;
    for (const [nm, a] of [...ORBITS].reverse()) {
      if (['MERKÜR', 'VENÜS', 'MARS'].includes(nm)) continue;
      const R = a * K, lx = SUN.x - R * 0.707, ly = SUN.y + R * 0.707 + 12;
      if (R < 70 || R > 330 || lastR - R < 60) continue;
      if (ly > SCALE_BLOCK.y0 - 40 && lx - 170 < SCALE_BLOCK.x1 + 40) continue;
      chip(nm, lx, ly, clamp01((R - 70) / 10) * clamp01((330 - R) / 10), GR2, 'right', 32); lastR = R;
    }
    ctx.restore();
    // ölçek çubuğu ve dürüstlük notu (sol alt)
    const v = niceScale(K), len = v * K;
    ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SAFE.x0 + 10, 1336); ctx.lineTo(SAFE.x0 + 10 + len, 1336); ctx.moveTo(SAFE.x0 + 10, 1326); ctx.lineTo(SAFE.x0 + 10, 1346); ctx.moveTo(SAFE.x0 + 10 + len, 1326); ctx.lineTo(SAFE.x0 + 10 + len, 1346); ctx.stroke(); ctx.restore();
    const km = v * AU_KM, kmTxt = km >= 1e9 ? nf1.format(km / 1e9).replace(',0', '') + ' milyar km' : nf0.format(km / 1e6) + ' milyon km';
    chip(`${nf0.format(v)} AU = ${kmTxt}`, SAFE.x0, 1306, k, C.ink, 'left', 32);
    chip('YOL ŞEMATİK · UZAKLIKLAR GERÇEK', SAFE.x0, 1400, k, GR2, 'left', 32);
    // olay etiketleri sondanın solunda (x ≤ 920, Sıfır ve balondan uzak); başlıktaki bilgi tekrarlanmaz
    if (t >= T.out && t < T.reach - 0.3) { const a = k * ease.enter(seg(t, T.out, 0.4)) * (1 - seg(t, T.reach - 0.6, 0.3)); chip('HELYOPOZ · 2012', vq[0] - 44, vq[1] - 18, a, C.ink, 'right', 32); chip("GÜNEŞ'İN ETKİ ALANI BİTİYOR", vq[0] - 44, vq[1] + 26, a, GR2, 'right', 32); }
    if (t >= T.reach && t < T.cmp0 + 0.3) chip('1 IŞIK GÜNÜ', vq[0] - 44, vq[1] - 18, k * ease.enter(seg(t, T.reach, 0.4)), C.ink, 'right', 34);
    return vq;
  }
  // l05: sinyal sondadan Dünya'ya; "günde"de varır, saat 24
  const sigU = t => ease.state(seg(t, T.sig0 + 0.1, T.gunde - T.sig0 - 0.1));
  function signal(t, q) {
    if (!q || t < T.sig0 || t >= T.cmp0) return;
    const u = sigU(t), x = lerp(q[0], SUN.x, u), y = lerp(q[1], SUN.y, u), ang = Math.atan2(SUN.y - q[1], SUN.x - q[0]);
    ctx.save(); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(x, y); ctx.lineWidth = 2.5; ctx.setLineDash([2, 6]); ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]);
    if (u < 1) { ctx.translate(x, y); drawWaves(ctx, ang, (t * 2.2) % 1, 1.1); }
    ctx.restore();
  }

  // ——— doruk: gün ızgarası (1 kare = 1 gün) ———
  const pitchX = GRID.w / GC, rows = Math.ceil(DAYS / GC), pitchY = GRID.h / rows, SQ = 3;
  const cell = i => [GRID.x0 + (i % GC) * pitchX, GRID.y0 + Math.floor(i / GC) * pitchY];
  function grid(t, q) {
    if (t < T.cmp0 || t >= T.prox + 0.8) return;
    // ızgara Proxima geri çekilmesinde Güneş'in yerine (PX) çöker
    const col = ease.state(seg(t, T.prox, 0.7)), pv = proxView(t);
    ctx.save();
    if (col > 0) { const s = 1 - col; ctx.translate(lerp(0, pv.sx, col), lerp(0, pv.sy, col)); ctx.scale(s, s); }
    const zc = cell(0), z = 1 + 0.06 * seg(t, T.lightDone, T.hero - T.lightDone);
    ctx.translate(zc[0], zc[1]); ctx.scale(z, z); ctx.translate(-zc[0], -zc[1]);
    // geçiş: haritadaki sonda→Dünya sinyal çizgisi düzleşip tek kareye büzülür
    if (t < T.cmp0 + 0.7 && q) {
      const u = ease.state(seg(t, T.cmp0, 0.7)), a = [lerp(q[0], zc[0], u), lerp(q[1], zc[1], u)], b = [lerp(SUN.x, zc[0] + SQ, u), lerp(SUN.y, zc[1], u)];
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineWidth = lerp(2.5, 3, u); ctx.strokeStyle = C.ink; ctx.stroke();
    }
    const red = t >= T.aldi - 0.02;
    // "Voyager ise"de boş ızgara (soluk noktalar) satır satır belirir: 49 yılın yeri
    const ue = ease.state(seg(t, T.voy, 1.2)), ne = Math.floor(DAYS * ue);
    ctx.fillStyle = 'rgba(139,133,119,0.55)'; for (let i = 1; i < ne; i++) { const c = cell(i); ctx.fillRect(c[0] + 1, c[1] + 1, 1.4, 1.4); }
    // "kırk dokuz"da dolar (satır satır), "aldı"da kırmızı
    const uf = seg(t, T.hero, T.aldi - 0.06 - T.hero), nf = Math.floor(DAYS * uf);
    ctx.fillStyle = red ? C.red : C.ink; for (let i = 1; i < nf; i++) { const c = cell(i); ctx.fillRect(c[0], c[1], SQ, SQ); }
    // ışığın tek karesi: hep siyah, halkalı
    if (t >= T.cmp0 + 0.6) { ctx.fillStyle = C.ink; ctx.fillRect(zc[0] - 1, zc[1] - 1, SQ + 2, SQ + 2); const ak = ease.enter(seg(t, T.cmp0 + 0.6, 0.4)); ctx.beginPath(); ctx.arc(zc[0] + 1.5, zc[1] + 1.5, 14 * ak, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.restore();
    if (col < 0.2) {
      const a = 1 - col * 5;
      chip('IŞIK: 1 KARE = 1 GÜN', SAFE.x0, 800, a * ease.enter(seg(t, T.lightDone - 0.2, 0.4)), C.ink, 'left', 34);
      if (t >= T.aldi - 0.1) chip('VOYAGER: ≈ 18.000 KARE', SAFE.x0, 1350, a * ease.enter(seg(t, T.aldi - 0.1, 0.35)), C.red, 'left', 36);
    }
  }

  // ——— l08: tek log-uzay geri çekilme: Güneş → Proxima Centauri (268.000 AU) ———
  const PX = { x0: 150, x1: 870, y: 1110 };
  // ölçek: başta ışık günü halkası 440 px; "yetmiş"te Proxima 720 px'e oturur; sonra çok yavaş geri çekilme sürer
  function proxView(t) {
    const k0 = Math.log(440 / LIGHTDAY), k1 = Math.log((PX.x1 - PX.x0) / PROXIMA);
    const u = ease.state(seg(t, T.prox + 0.3, T.yetmis - T.prox - 0.3)), drift = 0.04 * seg(t, T.yetmis, T.loop0 - T.yetmis);
    const pxau = Math.exp(lerp(k0, k1, u) - drift);
    return { pxau, sx: PX.x0, sy: PX.y, vx: PX.x0 + LIGHTDAY * pxau, vy: PX.y };
  }
  function proxima(t) {
    if (t < T.prox || t >= T.loop0 + 0.6) return;
    const k = ease.state(seg(t, T.prox + 0.1, 0.5)) * (1 - ease.state(seg(t, T.loop0, 0.5)));
    const v = proxView(t), K = v.pxau, xp = PX.x0 + PROXIMA * K;
    ctx.save(); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1440 - STAGE_TOP); ctx.clip();
    // Güneş → Proxima çizgisi
    ctx.beginPath(); ctx.moveTo(PX.x0, PX.y); ctx.lineTo(Math.min(xp, W + 50), PX.y); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
    // bir ışık günü halkası: küçülür (Voyager üstünde)
    const R = LIGHTDAY * K;
    if (R > 1.5) { ctx.beginPath(); ctx.arc(PX.x0, PX.y, R, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); if (R > 90) chip('1 IŞIK GÜNÜ', PX.x0 + R * 0.707 + 8, PX.y - R * 0.707, clamp01((R - 90) / 30), C.ink, 'left', 32); }
    ctx.beginPath(); ctx.arc(PX.x0, PX.y, 13, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    chip('GÜNEŞ', PX.x0, PX.y + 62, 1, C.ink, 'center', 32);
    if (xp < W + 20) {
      ctx.beginPath(); ctx.arc(xp, PX.y, 10, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.3; ctx.beginPath(); ctx.moveTo(xp + Math.cos(a) * 15, PX.y + Math.sin(a) * 15); ctx.lineTo(xp + Math.cos(a) * 24, PX.y + Math.sin(a) * 24); ctx.lineWidth = 2; ctx.stroke(); }
      chip('PROXIMA', Math.min(xp, 880), PX.y - 40, clamp01((W + 20 - xp) / 80), C.ink, 'right', 32);
    }
    if (t >= T.yetmis - 0.2) chip('268.000 AU', 420, PX.y - 40, ease.enter(seg(t, T.yetmis - 0.2, 0.4)), GR2, 'center', 32);
    // bu hızla: hayalet nokta çizgi boyunca, "yıl"da Proxima'da
    const u = ease.state(seg(t, T.yetmis - 0.6, T.yil - T.yetmis + 0.6));
    if (u > 0 && u < 1) { const xg = lerp(v.vx, xp, u); ctx.beginPath(); ctx.arc(xg, PX.y, 7, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.restore();
    // ×100 büyüteç: Güneş ve bir ışık günü halkasında Voyager; yarım piksel notu
    const rk = ease.enter(seg(t, T.yetmis + 0.2, 0.4)) * (1 - ease.exit(seg(t, T.follow - 0.35, 0.3)));
    if (rk > 0.02) {
      const MR = { x: 330, y: 1290, r: 104 }, r = MR.r * ease.enter(rk);
      if (rk > 0.6) { ctx.beginPath(); ctx.moveTo(MR.x - r * 0.7, MR.y - r * 0.72); ctx.lineTo(PX.x0 + 18, PX.y + 16); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
      ctx.save(); ctx.beginPath(); ctx.arc(MR.x, MR.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip(); ctx.translate(MR.x, MR.y); ctx.scale(r / MR.r, r / MR.r);
      const k100 = K * 100, Rr = LIGHTDAY * k100;   // ×100: halka ≈ 47 px
      ctx.beginPath(); ctx.arc(-30, 10, 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.beginPath(); ctx.arc(-30, 10, Rr, 0, Math.PI * 2); ctx.setLineDash([4, 5]); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(-30 + Rr * Math.cos(-0.66), 10 + Rr * Math.sin(-0.66)); drawVoyager(ctx, VOYAGER_CARD, { tilt: -0.3, detail: 0.3 }, 34); ctx.restore();
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('×100', 20, -62);
      ctx.restore();
      ctx.beginPath(); ctx.arc(MR.x, MR.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
      chip("BU ÖLÇEKTE VOYAGER'IN", 452, 1178, rk, C.ink, 'left', 32); chip('49 YILI: YARIM PİKSEL', 452, 1222, rk, C.ink, 'left', 32);
    }
  }

  // ——— büyüteç (harita) ———
  function roundel(t, kind, k, at) {
    if (k <= 0) return;
    const R = ROUND, r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 40) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 32, at[1] - Math.sin(ang) * 32); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    const sf = mulberry32(7); ctx.fillStyle = C.ink; for (let i = 0; i < 40; i++) ctx.fillRect(-120 + sf() * 240, -120 + sf() * 240, 2, 2);
    if (kind === 'jup') {
      ctx.save(); ctx.translate(-30, 36); drawJupiter(ctx, 92, t); ctx.restore();
      const u = seg(t, T.jup - 0.2, T.sat - T.jup + 0.2); ctx.save(); ctx.translate(lerp(-110, 110, u), lerp(-80, -60, u)); drawVoyager(ctx, VOYAGER_CARD, { tilt: -0.4, detail: 0.3 }, 36); ctx.restore();
    } else if (kind === 'sat') {
      ctx.save(); ctx.translate(-10, 30); drawSaturn(ctx, 52, t); ctx.restore();
      const u = seg(t, T.sat - 0.1, T.gecti + 0.3 - T.sat + 0.1); ctx.save(); ctx.translate(lerp(-100, 100, u), lerp(-70, -96, u)); drawVoyager(ctx, VOYAGER_CARD, { tilt: -0.4, detail: 0.3 }, 36); ctx.restore();
    } else if (kind === 'cal') {
      // takvim yaprağı: 18 KASIM 2026
      ctx.save(); ctx.rotate(-0.05); ctx.fillStyle = C.paper; ctx.fillRect(-106, -90, 212, 176); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(-106, -90, 212, 176);
      ctx.fillStyle = C.ink; ctx.fillRect(-106, -90, 212, 46); setFont(ctx, F.mono(32)); ctx.fillStyle = C.paper; ctx.textAlign = 'center'; ctx.fillText('KASIM 2026', 0, -56);
      setFont(ctx, F.head(86)); ctx.fillStyle = C.ink; ctx.fillText('18', 0, 50); ctx.restore();
    } else if (kind === 'dsn') {
      ctx.fillStyle = C.paper; ctx.fillRect(-130, 70, 260, 60); ctx.beginPath(); ctx.moveTo(-130, 70); ctx.lineTo(130, 70); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.save(); ctx.translate(-10, 70); drawDSN(ctx, 170); ctx.restore();
      const u = sigU(t); if (u < 1) { ctx.save(); ctx.translate(lerp(120, 40, u), lerp(-110, -50, u)); drawWaves(ctx, Math.PI * 0.8, (t * 2.2) % 1, 1.2); ctx.restore(); }
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(u >= 1 ? '24 SAAT' : nf0.format(Math.floor(24 * u)) + ' saat', 0, -80);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const S1 = [[T.jup - 0.25, 'jup'], [T.sat - 0.1, 'sat'], [T.gecti + 0.3, null], [T.on - 0.05, 'cal'], [L.l04.end - 0.1, null], [T.sig0 - 0.05, 'dsn'], [T.cmp0 - 0.3, null]];
  function sched(t) {
    let i = -1; for (let k = 0; k < S1.length; k++) if (t >= S1[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S1[i], prev = i > 0 ? S1[i - 1][1] : null;
    if (prev && t < a + 0.16) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.launch, 'ayakta', 'mutlu'], [T.jup, 'ayakta', 'sayiyor'], [T.reach, 'sasirma', 'saskin'], [T.reach + 1.6, 'ayakta', 'dusunceli'],
    [T.aldi, 'sasirma', 'saskin'], [T.aldi + 1.4, 'ayakta', 'dusunceli'], [T.follow, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    // bölünmüş cümle (l06 + l07): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l07' ? L.l06.text + ' ' + ln.text : ln.id === 'l06' ? 'Işık o yolu bir günde alıyor. Ya Voyager?' : ln.text;
    const p = ln.id === 'l07' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    const ls = ['İnsanlığın en uzağa', 'giden aracı, 49 yılda', 'nereye vardı?'];
    let fs = 92; setFont(ctx, F.head(fs)); while (Math.max(...ls.map(s => ctx.measureText(s).width)) > SAFE.x1 - SAFE.x0 && fs > 56) { fs -= 2; setFont(ctx, F.head(fs)); }
    ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, 430 + i * fs * 1.0, fs, k, C.ink));
    setFont(ctx, F.mono(34)); revealText(ctx, "VOYAGER 1 · 1977'DEN BERİ YOLDA", SAFE.x0, 690, 34, k, GR2);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : GR2);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, GR2, 'right');
  }
  const distTxt = r => { const km = r * AU_KM; return km >= 1e9 ? nf1.format(km / 1e9) + ' milyar km' : nf0.format(km / 1e6) + ' milyon km'; };
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const p0 = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < T.sig0 - 0.06) {
      const y = yearAt(t), r = rAt(y);
      const ev = t >= T.reach ? '1 IŞIK GÜNÜ' : t >= T.out ? 'YILDIZLARARASI UZAY' : t >= T.ve ? "GÜNEŞ'TEN UZAKLAŞIYOR" : t >= T.sat ? 'SATÜRN' : t >= T.jup ? 'JÜPİTER' : t >= T.launch ? 'FIRLATILDI' : 'DÜNYA';
      row({ label: 'VOYAGER 1 · NASA', num: String(Math.floor(y + 1e-6)), unit: '', right1: t < T.launch ? '' : distTxt(r), right2: ev, p: p0 });
      return;
    }
    if (t < T.cmp0) { const u = sigU(t); row({ label: 'SİNYALİN YOLCULUĞU · IŞIK HIZIYLA', num: u >= 1 ? '24' : nf0.format(Math.floor(24 * u)), unit: 'saat', right1: '25,9 milyar km', right2: 'VOYAGER → DÜNYA', p: p0 }); return; }
    if (t < T.hero) { row({ label: 'AYNI YOL · IŞIK', num: '1', unit: 'gün', right1: t >= T.voy ? 'VOYAGER: ?' : '', right2: '', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.prox) { const red = t >= T.aldi - 0.02; row({ label: 'AYNI YOL · VOYAGER 1', num: '49', unit: 'yıl', red, right1: 'IŞIK: 1 gün', right2: '≈ 18.000 KAT UZUN' }); return; }
    const n = Math.round(75000 * ease.state(seg(t, T.yetmis - 0.6, T.yil - T.yetmis + 0.6)));
    row({ label: 'BU HIZLA EN YAKIN YILDIZA', num: t >= T.yetmis - 0.6 ? nf0.format(n) : '?', unit: 'yıl', right1: 'PROXIMA CENTAURI', right2: '4,24 IŞIK YILI', p: ease.enter(seg(t, T.prox, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2))) });
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    stars(t);
    // kare 0 / döngü: büyük sonda (Dünya çipi harita gelmeden söner); harita gelirken sonda küçülerek haritadaki yerine iner
    const kMap = t < T.mapIn ? 0 : t < T.cmp0 ? ease.state(seg(t, T.mapIn, 0.8)) : 1 - ease.state(seg(t, T.cmp0, 0.6));
    const kEarth = t < T.loop0 ? 1 - ease.state(seg(t, T.mapIn - 0.45, 0.4)) : ease.state(seg(t, T.loop0 + 0.4, 0.5));
    const kProbe = t < T.loop0 ? (t < T.mapIn ? 1 : 0) : 1;
    heroProbe(t, kProbe, kEarth);
    const q = map(t, kMap);
    if (q && t >= T.mapIn && t < T.mapIn + 0.8) { const h = heroPose(T.mapIn), u = ease.state(seg(t, T.mapIn, 0.8)), x = lerp(h.x, q[0], u), y = lerp(h.y, q[1], u), s = lerp(h.s, 46, u); ctx.save(); ctx.translate(x, y); drawVoyager(ctx, VOYAGER_CARD, { tilt: lerp(-0.1, -0.3, u), detail: 1 - u * 0.6 }, s); ctx.restore(); }
    signal(t, q);
    grid(t, q);
    proxima(t);
    const r1 = sched(t); if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, r1.k, r1.kind === 'cal' ? null : q);
    if (t >= T.follow && t < T.loop0) { const fa = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.25, 0.25)); chip('TAKİP ET', SAFE.x0, 1336, fa, C.ink, 'left', 42); chip('HER GÜN YENİ BİR SAYI', SAFE.x0, 1394, fa, C.ink, 'left', 40); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

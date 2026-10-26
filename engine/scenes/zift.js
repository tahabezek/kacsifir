// "Zift" şablonu (Hangisi daha şaşırtıcı?): Queensland zift damlası deneyi (1927; 1930'dan beri 9 damla) ve 1840'tan
// beri çalan Oxford Elektrikli Çanı. Omurga: iki mekanik sayaç (DAMLA ve ÇALMA).
// A: laboratuvar; zift huniye dökülür, çekiçle kırılır, uç kesilir, 1930 → 2014 yıl sayacıyla 9 damla beherde birikir.
// B: cam fanus altında iki çan ve kuru pil sütunları; bilye 2 Hz sallanır, el yazısı not, pilin kesiti; 1840 → 2026.
// Kıyas: tek damla büyür (9,3 yıllık şerit dolar), çan sayacı 0'dan koşar; sessizlikten sonra damla düşer: YARIM MİLYAR.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705, FLOOR = 1500;
const SIFIR = { x: 800, y: 1520, H: 92 };
const GLASS = '#F4EEE1', PITCH = '#2A2722';
// damla tarihleri (UQ): Ara 1938 … Nis 2014
const DROPS = [1938.92, 1947.12, 1954.29, 1962.37, 1970.62, 1979.29, 1988.54, 2000.91, 2014.31];
// sayaç kutusu: iki sahnede de aynı yer (nesne kesmenin öbür tarafına taşınır)
const ODO = { x: 590, y: 800 };

const norm = w => w.toLocaleLowerCase('tr').replace(/[^a-zçğıöşüâî0-9]/g, '');
function mapWords(text, ttsWords) {
  const tx = text.split(/\s+/).filter(Boolean), tw = ttsWords.map(w => norm(w.w)), out = [];
  let j = 0;
  for (let i = 0; i < tx.length; i++) {
    out.push(Math.min(j, tw.length - 1));
    if (/\d/.test(tx[i]) && i + 1 < tx.length) {
      const nx = norm(tx[i + 1]).slice(0, 4); j++;
      while (j < tw.length && !(nx && tw[j].startsWith(nx))) j++;
      if (j >= tw.length) j = out.at(-1) + 1;
    } else j++;
  }
  return { words: tx, at: out };
}

export function ziftTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    y1927: Wd('l02', 'bin'), pitch: Wd('l02', 'zifti'), funnel: Wd('l02', 'huniye'), pour: Wd('l02', 'döküyor'),
    hammer: Wd('l03', 'çekiçle'), hit: Wd('l03', 'vurunca'), crack: Wd('l03', 'kırılıyor'),
    three: Wd('l04', 'üç'), wait: Wd('l04', 'bekliyor'), cut: Wd('l04', 'kesiyor'),
    eight: Wd('l05', 'sekiz'), drop1: Wd('l05', 'düşüyor'),
    nobody: Wd('l06', 'kimse'), notSeen: Wd('l06', 'görmedi'),
    y2000: Wd('l06b', 'iki'), camera: Wd('l06b', 'kamera'), broke: Wd('l06b', 'arızalandı'),
    faint: Wd('l11b', 'neredeyse'),
    hundred: Wd('l07', 'yüz'), nine: Wd('l07', 'dokuz'),
    whip1: Wd('l08', 'bu'), canWord: Wd('l08', 'çan'),
    oxf: L.l09.t0, dome: Wd('l09', 'fanusun'), bells: Wd('l09', 'çan'),
    note: Wd('l10', 'notta'), y1840: Wd('l10', 'bin'),
    ball: Wd('l11', 'bilye'), same: Wd('l11', 'aynı'), swing: Wd('l11', 'sallanıyor'),
    pile: Wd('l12', 'pilin'), open: Wd('l12', 'açmak'),
    ten: Wd('l13', 'on'), rang: Wd('l13', 'çaldı'),
    cmp0: L.l14.t0 - 0.1, nine2: Wd('l15', 'dokuz'),
    hero: L.l17.words[0].t0 - 0.02, ask: L.l18.t0, loop0: tl.loop0,
  };
  T.whip0 = T.whip1 - 0.65;
  // A'nın yıl akışı: kesim → ilk damla (1930 → 1938,9), sonra l06 başından "dokuz"a kadar 1938,9 → 2014,3, ardından 2026
  T.run0 = L.l06.t0 - 0.1; T.run1 = T.nine; T.run2 = Math.max(T.nine + 1.2, L.l07.end + 0.4);
  // B'nin yıl akışı: "sallanıyor"dan "on"a kadar 1840 → 2026 (sayaç 10 milyara "on"da varır)
  T.brun0 = T.swing - 0.2; T.brun1 = T.ten;
  T.zoom0 = T.hero - 0.75;
  return T;
}

// A'nın yıl akışı (ses ipuçları da bunu kullanır)
export function ziftYear(T, t) {
  if (t < T.three) return 1927;
  if (t < T.cut) return lerp(1927, 1930, ease.state(seg(t, T.three, T.cut - T.three)));
  if (t < T.drop1) return lerp(1930, DROPS[0], ease.state(seg(t, T.cut + 0.2, T.drop1 - T.cut - 0.2)));
  if (t < T.run0) return DROPS[0];
  // 8. damla (Kasım 2000) "arızalandı"da düşer; 9. damla (2014) "dokuz"da
  if (t < T.y2000) return lerp(DROPS[0], 2000, seg(t, T.run0, T.y2000 - T.run0));
  if (t < T.broke) return lerp(2000, DROPS[7], seg(t, T.y2000, T.broke - T.y2000));
  if (t < T.run1) return lerp(DROPS[7], DROPS[8], ease.state(seg(t, T.broke, T.run1 - T.broke)));
  return lerp(DROPS[8], 2026, ease.state(seg(t, T.run1, T.run2 - T.run1)));
}
// her damlanın düştüğü an (yıl akışı o tarihi geçtiği kare)
export function ziftDropTimes(T) {
  const out = [];
  for (const d of DROPS) { let a = T.cut, b = T.run2; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (ziftYear(T, m) >= d) b = m; else a = m; } out.push(b); }
  return out;
}

export async function makeZiftRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = ziftTimes(tl);
  const maps = Object.fromEntries(ep.voice.lines.map(l => [l.id, mapWords(l.text, L[l.id].words)]));
  // döngü dikişi: sürekli döngülerin periyodu film süresine tam bölünür (son kare = kare 0)
  const per = p => D / Math.max(1, Math.round(D / p));
  const BALL = per(0.5);   // bilye: 2 Hz (bir gidiş-geliş 1 sn; her çana yarım saniyede bir)
  const SHEEN = per(6.0);  // cam fanusta yavaş ışık kayması
  const rnd = mulberry32(64);
  const shards = Array.from({ length: 14 }, () => ({ a: -Math.PI * (0.1 + rnd() * 0.8), v: 160 + rnd() * 260, r: (rnd() - 0.5) * 8, s: 10 + rnd() * 18 }));
  const toB = t => t < T.whip0 ? 0 : ease.state(seg(t, T.whip0, T.whip1 - T.whip0));

  // ——— A: yıl ve damla sayısı ———
  const yearA = t => ziftYear(T, t);
  const dropsAt = yr => DROPS.filter(d => yr >= d).length;
  const DT = ziftDropTimes(T);
  // asılı damlanın olgunluğu (0 → 1) ve son düşüşten bu yana geçen süre (düşüş animasyonu için)
  function dropState(t) {
    const yr = yearA(t), n = dropsAt(yr), prev = n ? DROPS[n - 1] : 1930, next = DROPS[n] ?? 2023.6;
    const grow = clamp01((yr - prev) / (next - prev));
    return { yr, n, grow, prev };
  }

  // ——— çizim parçaları ———
  function dome(cx, base, w, h, a = 1, t = 0) {
    // cam fanus: yarım silindir + kubbe; kontur ve hafif yansıma
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const x0 = cx - w / 2, x1 = cx + w / 2, top = base - h, r = w / 2;
    ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x0, top + r); ctx.arc(cx, top + r, r, Math.PI, 0); ctx.lineTo(x1, base);
    ctx.fillStyle = 'rgba(244,238,225,0.12)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // yansıma: yavaşça kayan iki ince çizgi
    const u = ((t / SHEEN) % 1);
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 10;
    const sx = lerp(x0 + 30, x1 + 60, 0.5 - 0.5 * Math.cos(2 * Math.PI * u)); // gidip gelir: dikişte ve periyot sonunda sıçrama yok
    ctx.beginPath(); ctx.moveTo(sx, top); ctx.lineTo(sx - 120, base); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx + 26, top); ctx.lineTo(sx - 94, base); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(x0 + 20, top + r * 0.7); ctx.quadraticCurveTo(x0 + 26, top + 30, cx - 40, top + 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.restore();
  }
  // huni düzeneği: (cx, FLOOR) tabanlı; s = ölçek; fill = zift doluluğu; cut = uç kesildi mi; drop = {grow, falling}
  function funnelRig(cx, s, o = {}) {
    const { fill = 1, cut = true, grow = 0, fall = -1, pile = 0, cap = 1 } = o;
    ctx.save(); ctx.translate(cx, FLOOR); ctx.scale(s, s);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    // ayaklı sehpa ve kelepçe
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-150, -30); ctx.lineTo(150, -30); ctx.lineTo(150, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-120, -30); ctx.lineTo(-120, -500); ctx.moveTo(-120, -470); ctx.lineTo(-40, -470); ctx.stroke();
    ctx.beginPath(); ctx.arc(-40, -470, 10, 0, Math.PI * 2); ctx.stroke();
    // beher (altta) ve içindeki damlalar
    const bx0 = -70, bx1 = 70, btop = -200, bbot = -34;
    ctx.fillStyle = GLASS; ctx.fillRect(bx0, btop, bx1 - bx0, bbot - btop);
    if (pile > 0) {
      // biriken zift: tabanda düzensiz bir tepe (damla sayısıyla büyür)
      const h = 12 + 9 * pile;
      ctx.beginPath(); ctx.moveTo(bx0 + 4, bbot); ctx.bezierCurveTo(bx0 + 10, bbot - h * 0.8, -20, bbot - h * 1.15, 0, bbot - h); ctx.bezierCurveTo(24, bbot - h * 0.95, bx1 - 10, bbot - h * 0.7, bx1 - 4, bbot); ctx.closePath();
      ctx.fillStyle = PITCH; ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(bx0, btop); ctx.lineTo(bx0, bbot); ctx.lineTo(bx1, bbot); ctx.lineTo(bx1, btop); ctx.stroke();
    // huni: koni -560 → -330, sap -330 → -260
    const cTop = -560, cBot = -330, sTip = -262, rw = 120, sw = 9;
    ctx.beginPath(); ctx.moveTo(-rw, cTop); ctx.lineTo(-sw, cBot); ctx.lineTo(-sw, sTip); ctx.lineTo(sw, sTip); ctx.lineTo(sw, cBot); ctx.lineTo(rw, cTop); ctx.closePath();
    ctx.fillStyle = GLASS; ctx.fill();
    if (fill > 0) {
      // zift: koninin tabanından yukarı dolar; üst yüzey hafif kubbeli
      const lv = lerp(cBot, cTop + 26, fill), wl = lerp(sw, rw - 4, (cBot - lv) / (cBot - cTop));
      ctx.save(); ctx.beginPath(); ctx.moveTo(-rw, cTop); ctx.lineTo(-sw, cBot); ctx.lineTo(-sw, sTip); ctx.lineTo(sw, sTip); ctx.lineTo(sw, cBot); ctx.lineTo(rw, cTop); ctx.closePath(); ctx.clip();
      ctx.beginPath(); ctx.moveTo(-wl, lv); ctx.quadraticCurveTo(0, lv - 14 * fill, wl, lv); ctx.lineTo(sw, cBot); ctx.lineTo(sw, cut ? sTip : sTip - 4); ctx.lineTo(-sw, cut ? sTip : sTip - 4); ctx.lineTo(-sw, cBot); ctx.closePath();
      ctx.fillStyle = PITCH; ctx.fill(); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(-rw, cTop); ctx.lineTo(-sw, cBot); ctx.lineTo(-sw, sTip); ctx.moveTo(sw, sTip); ctx.lineTo(sw, cBot); ctx.lineTo(rw, cTop); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, cTop, rw, 12, 0, 0, Math.PI * 2); ctx.stroke();
    // kapalı sap: kesilmeden önce ucunda bir kapak
    if (!cut && cap > 0) { ctx.save(); ctx.globalAlpha *= cap; ctx.fillStyle = C.ink; ctx.fillRect(-sw - 3, sTip - 2, 2 * sw + 6, 12); ctx.restore(); }
    // asılı damla: sap ucundan uzayan boyun + yuvarlak uç
    if (fill > 0 && cut && grow > 0) {
      const len = 8 + 70 * grow, r = 7 + 12 * Math.sqrt(grow);
      ctx.beginPath(); ctx.moveTo(-sw, sTip); ctx.bezierCurveTo(-sw, sTip + len * 0.5, -r, sTip + len - r * 1.2, -r, sTip + len - r * 0.2);
      ctx.arc(0, sTip + len - r * 0.2, r, Math.PI, 0, true); ctx.bezierCurveTo(r, sTip + len - r * 1.2, sw, sTip + len * 0.5, sw, sTip); ctx.closePath();
      ctx.fillStyle = PITCH; ctx.fill();
    }
    // düşen damla: sap ucundan behere (fall: 0 → 1)
    if (fall >= 0 && fall < 1) {
      const y = lerp(sTip + 70, bbot - 30 - 9 * pile, fall * fall);
      ctx.beginPath(); ctx.ellipse(0, y, 16, 22 + 10 * fall, 0, 0, Math.PI * 2); ctx.fillStyle = PITCH; ctx.fill();
    }
    ctx.restore();
  }
  // çan düzeneği: iki kuru pil sütunu, üstlerinde çanlar, ortada ipe asılı bilye
  function bellRig(cx, s, t, o = {}) {
    const { cutaway = 0 } = o;
    ctx.save(); ctx.translate(cx, FLOOR); ctx.scale(s, s);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    // ahşap taban
    ctx.fillStyle = '#D9CFBA'; ctx.fillRect(-210, -40, 420, 40); ctx.strokeRect(-210, -40, 420, 40);
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-200 + i * 30, -30 + i * 4); ctx.bezierCurveTo(-80, -34 + i * 5, 60, -26 + i * 3, 200, -32 + i * 4); ctx.lineWidth = 1; ctx.strokeStyle = C.graphite; ctx.stroke(); }
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
    // pil sütunları: kükürt kaplı, yatay disk çizgileri
    for (const px of [-120, 120]) {
      ctx.fillStyle = '#E3D9C2'; ctx.fillRect(px - 34, -380, 68, 340); ctx.strokeRect(px - 34, -380, 68, 340);
      ctx.lineWidth = 1.2; ctx.strokeStyle = C.graphite;
      for (let y = -372; y < -44; y += 9) { ctx.beginPath(); ctx.moveTo(px - 34, y); ctx.lineTo(px + 34, y); ctx.stroke(); }
      ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
      // pirinç çan (ters kase) sütunun üstünde
      ctx.beginPath(); ctx.moveTo(px - 46, -380); ctx.bezierCurveTo(px - 46, -440, px - 26, -458, px, -458); ctx.bezierCurveTo(px + 26, -458, px + 46, -440, px + 46, -380); ctx.closePath();
      ctx.fillStyle = '#C9A55A'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 30, -440); ctx.quadraticCurveTo(px - 20, -452, px - 6, -454); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
    }
    // pil kesiti: soldaki sütunun içi açılır, diskler ve soru işareti
    if (cutaway > 0) {
      ctx.save(); ctx.globalAlpha *= cutaway; const px = -120;
      ctx.fillStyle = C.paper; ctx.fillRect(px - 24, -360, 48, 300);
      for (let y = -356; y < -64; y += 12) { ctx.fillStyle = (Math.round(y / 12) % 2) ? '#B8B0A0' : '#7E7666'; ctx.fillRect(px - 24, y, 48, 6); }
      ctx.fillStyle = C.paper; ctx.fillRect(px - 22, -250, 44, 70); ctx.strokeRect(px - 22, -250, 44, 70);
      setFont(ctx, F.head(60)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('?', px, -194);
      ctx.restore();
    }
    // asma çubuğu ve bilye (2 Hz: her yarım saniyede bir çana değer)
    ctx.beginPath(); ctx.moveTo(-40, -560); ctx.lineTo(40, -560); ctx.moveTo(0, -560); ctx.lineTo(0, -600); ctx.stroke();
    const ph = (t / BALL) % 2, sw = ph < 1 ? ease.state(ph) : ease.state(2 - ph); // 0 → 1 → 0
    const bxp = lerp(-58, 58, sw), byp = -418;
    ctx.beginPath(); ctx.moveTo(0, -560); ctx.lineTo(bxp, byp); ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bxp, byp, 15, 0, Math.PI * 2); ctx.fillStyle = '#9C968A'; ctx.fill(); ctx.stroke();
    // değme anı: çanın yanında kısa titreşim çizgileri
    const hitK = Math.max(0, 1 - Math.min(Math.abs(sw - 1), Math.abs(sw)) * 9);
    if (hitK > 0) { ctx.save(); ctx.globalAlpha *= hitK; const side = sw > 0.5 ? 1 : -1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(side * 120, -420, 58 + i * 12, side > 0 ? -0.6 : Math.PI - 0.6, side > 0 ? 0.6 : Math.PI + 0.6); ctx.lineWidth = 2; ctx.stroke(); } ctx.restore(); }
    ctx.restore();
  }
  // el yazısı not kartı
  function noteCard(x, y, a, rot) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = '#F7F1E3'; ctx.fillRect(-150, -60, 300, 120); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(-150, -60, 300, 120);
    ctx.beginPath(); ctx.arc(-130, -40, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.font = 'italic 600 46px Georgia, serif'; ctx.fillStyle = '#3B2F22'; ctx.textAlign = 'center'; ctx.fillText('Set up in 1840', 0, 16);
    ctx.restore();
  }
  // mekanik sayaç: değer kayan noktalı; her hane kendi silindirinde yuvarlanır (alt hane 9'dan geçerken üst hane döner)
  function odometer(x, y, value, n, label, o = {}) {
    const { a = 1, red = false, sep = true, cw = 34, ch = 58 } = o;
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const groups = sep ? Math.floor((n - 1) / 3) : 0, gw = 12, totalW = n * cw + groups * gw + 16;
    ctx.fillStyle = C.ink; ctx.fillRect(x, y, totalW, ch + 16);
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(label, x, y - 16);
    setFont(ctx, F.mono(Math.round(ch * 0.74))); ctx.textAlign = 'center';
    let cx = x + 8;
    for (let i = n - 1; i >= 0; i--) {
      const p = 10 ** i, below = value % p, dig = Math.floor(value / p) % 10;
      const frac = i === 0 ? value % 1 : clamp01(below - (p - 1));
      ctx.save(); ctx.beginPath(); ctx.rect(cx, y + 8, cw - 3, ch); ctx.clip();
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(cx, y + 8, cw - 3, ch);
      ctx.fillStyle = red ? C.red : C.ink;
      const mid = y + 8 + ch / 2 + ch * 0.27;
      ctx.fillText(String(dig), cx + (cw - 3) / 2, mid - frac * ch);
      ctx.fillText(String((dig + 1) % 10), cx + (cw - 3) / 2, mid + (1 - frac) * ch);
      ctx.restore();
      cx += cw;
      if (sep && i > 0 && i % 3 === 0) { ctx.fillStyle = '#F4EEE1'; ctx.fillRect(cx + 3, y + ch + 2, 5, 8); cx += gw; }
    }
    ctx.restore();
    return totalW;
  }
  function chip(s, x, y, a = 1, al = 'left', col = C.ink, size = 40) {
    if (a <= 0) return; setFont(ctx, F.mono(size)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - size * 0.86, tw + 20, size * 1.3); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }
  function floor() {
    ctx.strokeStyle = 'rgba(139,133,119,0.45)'; ctx.lineWidth = 1.1;
    for (let y = FLOOR + 10, g = 6; y < 1920; y += g, g = Math.min(14, g + 0.6)) { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-200, FLOOR); ctx.lineTo(W + 200, FLOOR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— A: Brisbane laboratuvarı ———
  const FX = 330; // huninin ekseni
  function lab(t, dx) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    // yavaş yaklaşma (açılıştaki 1,05'ten devam eder)
    const z = 1.05 + 0.06 * seg(t, L.l02.t0, T.whip0 - L.l02.t0);
    ctx.translate(FX, FLOOR); ctx.scale(z, z); ctx.translate(-FX, -FLOOR);
    floor();
    const fill = ease.state(seg(t, T.funnel - 0.1, T.pour + 0.7 - T.funnel));
    const cutU = seg(t, T.cut, 0.35), cut = t >= T.cut;
    const ds = dropState(t);
    // damla düşüşü: her damla tarihinin hemen ardından kısa düşüş (0,35 sn)
    let fall = -1, pile = ds.n;
    if (ds.n > 0) { const tf = DT[ds.n - 1]; if (t < tf + 0.35) { fall = (t - tf) / 0.35; pile = ds.n - 1; } }
    const grow = cut ? (fall >= 0 ? 0 : ds.grow) : 0;
    funnelRig(FX, 1, { fill, cut, cap: 1 - cutU, grow, fall, pile });
    dome(FX, FLOOR - 30, 380, 640, ease.enter(seg(t, L.l02.t0 + 0.2, 0.5)) * (1 - seg(t, T.hammer - 0.3, 0.3)) + (t >= T.three ? ease.enter(seg(t, T.three, 0.5)) : 0), t);
    // l02: kazan döker (sağ üstten), zift ipi huniye
    if (t >= L.l02.t0 && t < T.hammer) {
      const k = ease.enter(seg(t, T.pitch - 0.3, 0.45)) * (1 - seg(t, T.pour + 0.9, 0.35)), tilt = 0.9 * ease.state(seg(t, T.funnel - 0.2, 0.5));
      if (k > 0) {
        ctx.save(); ctx.globalAlpha *= k; ctx.translate(FX + 210, FLOOR - 720); ctx.rotate(-tilt);
        ctx.fillStyle = '#B7AE9C'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-70, -40); ctx.lineTo(-60, 50); ctx.lineTo(60, 50); ctx.lineTo(70, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(70, -20); ctx.lineTo(110, -10); ctx.stroke();
        ctx.restore();
        if (tilt > 0.5 && fill < 0.98) { ctx.save(); ctx.globalAlpha *= k; ctx.beginPath(); ctx.moveTo(FX + 150, FLOOR - 740); ctx.bezierCurveTo(FX + 90, FLOOR - 720, FX + 20, FLOOR - 690, FX + 10, FLOOR - 560 - 0); ctx.lineWidth = 9; ctx.strokeStyle = PITCH; ctx.stroke(); ctx.restore(); }
      }
      // buhar kıvrımları: sıcak zift
      for (let i = 0; i < 3; i++) { const u = ((t * 0.7 + i / 3) % 1), a = Math.sin(u * Math.PI) * k * 0.6; if (a <= 0) continue; ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); const sx = FX + 180 + i * 26, sy = FLOOR - 780 - u * 90; ctx.moveTo(sx, sy + 30); ctx.bezierCurveTo(sx - 14, sy + 16, sx + 14, sy + 8, sx, sy - 6); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.restore(); }
    }
    // l03: çekiç ve kırılan zift parçası (sağda, örs üstünde)
    if (t >= T.hammer - 0.4 && t < T.three + 0.2) {
      const kin = ease.enter(seg(t, T.hammer - 0.4, 0.4)), kout = seg(t, T.three - 0.2, 0.35);
      ctx.save(); ctx.globalAlpha *= kin * (1 - kout);
      const ax = 560, ay = FLOOR;
      ctx.fillStyle = '#9C968A'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax - 110, ay); ctx.lineTo(ax - 80, ay - 60); ctx.lineTo(ax + 80, ay - 60); ctx.lineTo(ax + 110, ay); ctx.closePath(); ctx.fill(); ctx.stroke();
      const broke = t >= T.hit;
      if (!broke) { ctx.fillStyle = PITCH; ctx.beginPath(); ctx.moveTo(ax - 60, ay - 60); ctx.lineTo(ax - 50, ay - 110); ctx.lineTo(ax + 30, ay - 122); ctx.lineTo(ax + 64, ay - 60); ctx.closePath(); ctx.fill(); }
      else {
        const u = t - T.hit;
        for (const sh of shards) {
          const px = ax + Math.cos(sh.a) * sh.v * Math.min(u, 0.6), py = ay - 80 + Math.sin(sh.a) * sh.v * Math.min(u, 0.6) + 900 * Math.min(u, 0.6) ** 2;
          ctx.save(); ctx.translate(px, Math.min(py, ay - 64)); ctx.rotate(sh.r * Math.min(u, 0.6)); ctx.fillStyle = PITCH;
          ctx.beginPath(); ctx.moveTo(-sh.s, 0); ctx.lineTo(0, -sh.s * 0.8); ctx.lineTo(sh.s * 0.7, sh.s * 0.3); ctx.closePath(); ctx.fill(); ctx.restore();
        }
      }
      // çekiç: tutma noktası sağ altta; "çekiçle"de baş yukarı kalkar, "vurunca"da zift parçasına iner
      const up = ease.enter(seg(t, T.hammer - 0.2, 0.4)), down = ease.exit(seg(t, T.hit - 0.18, 0.18));
      const ang = lerp(lerp(-0.9, 0.15, up), -1.75, down);
      ctx.save(); ctx.translate(ax + 150, ay - 110); ctx.rotate(ang);
      ctx.fillStyle = '#C8B48A'; ctx.fillRect(-8, -200, 16, 210); ctx.strokeRect(-8, -200, 16, 210);
      ctx.fillStyle = '#6B655A'; ctx.fillRect(-55, -250, 110, 52); ctx.strokeRect(-55, -250, 110, 52);
      ctx.restore();
      ctx.restore();
    }
    // l04: kesim çizgisi (makas yerine kesik çizgi + kapak düşer)
    if (t >= T.cut - 0.3 && t < T.cut + 1.2) {
      const k = 1 - seg(t, T.cut + 0.7, 0.4);
      ctx.save(); ctx.globalAlpha *= k; ctx.setLineDash([10, 8]); ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(FX - 60, FLOOR - 266); ctx.lineTo(FX + 60, FLOOR - 266); ctx.stroke(); ctx.setLineDash([]);
      const u = seg(t, T.cut, 0.5); if (u > 0) { ctx.fillStyle = C.ink; ctx.fillRect(FX - 12, lerp(FLOOR - 264, FLOOR - 70, u * u), 24, 12); }
      ctx.restore();
    }
    ctx.restore();
    // yıl kutusu (kesimden sonra), damla sayacı: yakınlaşmadan bağımsız, sabit yerde okunur
    ctx.save(); ctx.translate(dx, 0);
    if (t >= T.three - 0.1) {
      const ka = ease.enter(seg(t, T.three - 0.1, 0.35));
      chip(`YIL ${Math.floor(yearA(t))}`, 600, 1190, ka, 'left', C.ink, 52);
    }
    if (t >= T.cut + 0.2) {
      const ko = ease.enter(seg(t, T.cut + 0.2, 0.4)), ds2 = dropState(t);
      // sayaç yalnız tam sayılarla tıklar (damla düştüğü karede)
      odometer(600, 960, ds2.n, 2, 'DAMLA', { a: ko, sep: false, cw: 96, ch: 140 });
    }
    // l06: "KİMSE GÖRMEDİ" — hunideki damla görünürken
    if (t >= T.notSeen - 0.05 && t < L.l07.t0 + 0.2) chip('KİMSE GÖRMEDİ', 600, 1290, ease.enter(seg(t, T.notSeen - 0.05, 0.3)) * (1 - seg(t, L.l07.t0, 0.25)), 'left');
    ctx.restore();
  }

  // ——— B: Oxford, Clarendon Laboratuvarı ———
  const BX = 340;
  function yearB(t) { return t < T.brun0 ? 1840 : lerp(1840, 2026, ease.state(seg(t, T.brun0, T.brun1 - T.brun0))); }
  const ringsB = t => t < T.brun0 ? 0 : 1e10 * clamp01((yearB(t) - 1840) / 186);
  function oxford(t, dx) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    // "bilye"de bilyeye yakınlaşma, l12'de geri
    const zin = ease.state(seg(t, T.ball - 0.2, 0.7)), zout = ease.state(seg(t, T.pile - 0.2, 0.7));
    const z = 1 + 0.04 * seg(t, T.whip1, T.cmp0 - T.whip1) + 0.32 * zin * (1 - zout);
    const fx = lerp(BX, BX, zin), fy = lerp(FLOOR, FLOOR - 300, zin * (1 - zout));
    ctx.translate(BX, fy); ctx.scale(z, z); ctx.translate(-fx, -fy);
    floor();
    bellRig(BX, 1, t, { cutaway: ease.enter(seg(t, T.pile - 0.1, 0.45)) * (1 - seg(t, T.ten - 0.2, 0.3)) });
    // fanus "fanusun"da yukarıdan iner
    const dk = ease.enter(seg(t, T.dome - 0.25, 0.55));
    if (dk > 0) { ctx.save(); ctx.translate(0, -260 * (1 - dk)); dome(BX, FLOOR - 40, 440, 640, dk, t); ctx.restore(); }
    // "AÇILMIYOR" etiketi
    if (t >= T.open - 0.05 && t < T.ten) chip('AÇILMIYOR', BX - 120, FLOOR - 420, ease.enter(seg(t, T.open - 0.05, 0.3)) * (1 - seg(t, T.ten - 0.3, 0.25)), 'center');
    ctx.restore();
    // sayaç ve not: yakınlaşmadan bağımsız (sabit yerde okunur)
    ctx.save(); ctx.translate(dx, 0);
    // not kartı sağdan kayarak girer ve çıkar (saydamlaşma yok)
    const nk = ease.enter(seg(t, T.y1840 - 0.25, 0.45)), nOut = ease.exit(seg(t, T.ball - 0.4, 0.6));
    if (nk > 0 && nOut < 1) noteCard(lerp(1260, 760, nk) + 520 * nOut, 1150, 1, -0.05);
    if (t >= T.brun0 - 0.2) {
      const ka = ease.enter(seg(t, T.brun0 - 0.2, 0.4));
      odometer(510, 830, ringsB(t), 11, 'ÇALMA', { a: ka, cw: 32, ch: 56 });
      chip(`YIL ${Math.floor(yearB(t))}`, 610, 990, ka, 'left', C.ink, 52);
    }
    ctx.restore();
  }

  // ——— kıyas: aynı saat ———
  function compare(t) {
    if (t < T.cmp0 || t >= T.ask) return;
    const kin = 1; // "Peki"de sert kesme
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.globalAlpha = kin; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    floor();
    // iki düzenek yan yana (küçük): solda huni, sağda çan
    const g0 = T.nine2 - 0.1, g = ease.state(seg(t, g0, T.hero - g0));
    const fallU = t >= T.hero ? seg(t, T.hero, 0.3) : -1;
    // kesmeden sonra iki düzenek iki yandan yerine kayar (huni soldan, çan sağdan)
    const sl = ease.enter(seg(t, T.cmp0, 0.7)), fxc = lerp(-180, 230, sl), bxc = lerp(1260, 590, sl);
    // dorukta (sayı okunurken) yalnız düzenekler yavaşça yaklaşır; yazılar yerinde kalır
    const hz = 1 + 0.05 * ease.state(seg(t, T.hero, T.ask - T.hero));
    ctx.save(); ctx.translate(410, FLOOR); ctx.scale(hz, hz); ctx.translate(-410, -FLOOR);
    funnelRig(fxc, 0.62, { fill: 1, cut: true, grow: fallU >= 0 ? 0 : 0.15 + 0.85 * g, fall: fallU >= 0 && fallU < 1 ? fallU : -1, pile: fallU >= 1 ? 1 : 0 });
    dome(fxc, FLOOR - 20, 260, 400, 1, t);
    bellRig(bxc, 0.62, t);
    dome(bxc, FLOOR - 25, 300, 400, 1, t);
    ctx.restore();
    // 9,3 yıllık şerit (üstte, iki düzeneğin üstünden): damla büyüdükçe dolar
    const bar = { x0: 120, x1: 900, y: 850 };
    // şerit kutusu kesmeden sonra soldan sağa çizilir; "YAKLAŞIK 9 YIL" yalnız "dokuz"da
    const ba = ease.enter(seg(t, T.cmp0 + 0.5, 0.3)), draw = ease.state(seg(t, T.cmp0 + 0.5, 1.2));
    if (ba > 0) {
      ctx.save(); ctx.globalAlpha *= ba;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(bar.x0, bar.y - 16, (bar.x1 - bar.x0) * draw, 32);
      ctx.fillStyle = C.ink; ctx.fillRect(bar.x0, bar.y - 16, (bar.x1 - bar.x0) * g, 32);
      if (t >= T.hero) { ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.strokeRect(bar.x0 - 8, bar.y - 24, bar.x1 - bar.x0 + 16, 48); ctx.setLineDash([]); }
      setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('1 DAMLA', bar.x0, bar.y - 34); if (t >= T.nine2 - 0.02) { ctx.textAlign = 'right'; ctx.fillText('YAKLAŞIK 9 YIL', bar.x1, bar.y - 34); }
      ctx.restore();
    }
    // çan sayacı: 0'dan yarım milyara doğru koşar (sessizlikte de döner); "yarım"da sayaç yerine yuvarlak ifade çıkar
    const v = 4.9e8 * ease.state(seg(t, g0 + 0.3, T.hero - g0 - 0.3));
    if (t < T.hero) odometer(230, 940, v, 9, 'ÇALMA SAYISI', { a: ease.enter(seg(t, g0 + 0.1, 0.4)), cw: 62, ch: 80 });
    else {
      const k = ease.enter(seg(t, T.hero, 0.3));
      setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText('ÇALMA SAYISI', 230, 908);
      ctx.save(); ctx.translate(0, 10 * (1 - k)); setFont(ctx, F.head(72)); ctx.fillStyle = C.red; ctx.fillText('YAKLAŞIK', 230, 972); ctx.fillText('YARIM MİLYAR', 230, 1034); ctx.restore();
    }
    ctx.restore();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(65); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.pitch, 'ayakta', 'dusunceli'], [T.hit, 'sasirma', 'saskin'], [T.hit + 1.2, 'ayakta', 'notr'], [T.eight, 'ayakta', 'uykulu'], [T.drop1, 'sasirma', 'saskin'], [T.drop1 + 1.2, 'ayakta', 'notr'],
    [T.nine, 'sayma', 'sayiyor'], [T.whip1, 'ayakta', 'notr'], [T.swing, 'ayakta', 'mutlu'], [T.pile, 'ayakta', 'dusunceli'], [T.ten, 'sasirma', 'saskin'], [T.ten + 1.6, 'ayakta', 'notr'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.drop1 + 0.2, T.drop1 + 1.5, 'Sekiz yıl?!']];
  function sifir(t, dx = 0) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.save(); ctx.translate(SIFIR.x + dx, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(40)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w + dx, y = SIFIR.y - 150;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let id = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) id = l.id;
    if (!id || id === 'l01') return;
    // bölünmüş doruk cümlesi (l16 + l17) tek kartta birikir: söylenmemiş kısım soluk, sayısı çizgi
    const ids = id === 'l16' || id === 'l17' ? ['l16', 'l17'] : [id];
    const words = [];
    for (const k of ids) { const mp = maps[k]; mp.words.forEach((w, i) => words.push({ w, ta: L[k].words[mp.at[i]]?.t0 ?? L[k].t0, ghost: ids.length > 1, num: k === 'l17' && i < 2 })); }
    const text = words.map(o => o.w).join(' ');
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    let wi = 0; const sp = ctx.measureText(' ').width;
    ls.slice(0, 4).forEach((s, li) => {
      let x = SAFE.x0;
      for (const w of s.split(' ')) {
        const o = words[wi], k = ease.enter(seg(t, o.ta - 0.05, 0.18)), y = y0 + li * lh;
        if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = o.num && t >= T.hero ? C.red : C.ink; ctx.textAlign = 'left'; ctx.fillText(w, x, y + 8 * (1 - k)); ctx.restore(); }
        else if (o.ghost) {
          ctx.save(); ctx.globalAlpha = ease.enter(seg(t, L.l16.t0 - 0.05, 0.3)); ctx.fillStyle = C.graphite; ctx.strokeStyle = C.graphite; ctx.textAlign = 'left';
          if (o.num) { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 2, y + 6); ctx.lineTo(x + ctx.measureText(w).width - 2, y + 6); ctx.stroke(); } else ctx.fillText(w, x, y);
          ctx.restore();
        }
        x += ctx.measureText(w).width + sp; wi++;
      }
    });
  }
  const TITLE = ['9 kez damlayan zift mi,', '186 yıldır neredeyse', 'hiç susmayan çan mı?'];
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'left'; const dy = 12 * (1 - k);
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText('HANGİSİ DAHA ŞAŞIRTICI?', SAFE.x0, 418 - dy);
    let fs = 84; setFont(ctx, F.head(fs)); while (fs > 64 && Math.max(...TITLE.map(s => ctx.measureText(s).width)) > SAFE.x1 - SAFE.x0) { fs -= 2; setFont(ctx, F.head(fs)); }
    ctx.fillStyle = C.ink; TITLE.forEach((s, i) => ctx.fillText(s, SAFE.x0, 512 + i * 88 - dy));
    ctx.restore();
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(40)); revealText(ctx, label, SAFE.x0, 590, 40, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(40));
    if (right1) revealText(ctx, right1, SAFE.x1, 632, 40, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 40, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pA = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < L.l08.t0 - 0.06) {
      const lab = 'QUEENSLAND ÜNİV. · AVUSTRALYA';
      if (t < T.y1927) return row({ label: lab, num: '', p: pA });
      if (t < T.hammer) return row({ label: lab, num: '1927', right1: t >= T.pitch ? 'ISITILMIŞ ZİFT' : '', right2: t >= T.funnel ? 'HUNİYE DÖKÜLÜYOR' : '', p: pA });
      if (t < T.three) return row({ label: lab, num: '1927', right1: 'ODA SICAKLIĞINDA', right2: t >= T.crack ? 'ÇEKİÇLE KIRILIYOR' : 'KATI', p: pA });
      if (t < T.eight) return row({ label: lab, num: '3', unit: 'yıl', right1: t >= T.cut ? '1930' : '', right2: t >= T.cut ? 'HUNİNİN UCU KESİLDİ' : 'BEKLEME', p: pA });
      if (t < L.l06.t0) return row({ label: lab, num: '8', unit: 'yıl sonra', right1: t >= T.drop1 ? '1938' : '', right2: t >= T.drop1 ? 'İLK DAMLA' : '', p: pA });
      if (t < L.l06b.t0) return row({ label: lab, num: '', right1: 'BİR DAMLANIN DÜŞÜŞÜ', right2: t >= T.notSeen ? 'KİMSE GÖRMEDİ' : '', p: pA });
      if (t < L.l07.t0) return row({ label: lab, num: t >= T.y2000 ? '2000' : '', right1: t >= T.camera ? 'KAMERA' : '', right2: t >= T.broke ? 'ARIZALANDI' : '', p: pA });
      if (t < T.nine) return row({ label: lab, num: '', right1: t >= T.hundred ? 'NEREDEYSE 100 YIL' : '', right2: '', p: pA });
      return row({ label: lab, num: '9', unit: 'damla', right1: 'NEREDEYSE 100 YIL', right2: '1930 – 2026', p: pA });
    }
    if (t < L.l09.t0 - 0.06) return;
    const pB = Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35))), labB = 'OXFORD ÜNİV. · İNGİLTERE';
    if (t < T.cmp0) {
      if (t < T.y1840) return row({ label: labB, num: '', right1: t >= T.dome ? 'CAM FANUS ALTINDA' : '', right2: t >= T.bells ? 'İKİ KÜÇÜK ÇAN' : '', p: pB });
      if (t < L.l11b.t0) return row({ label: labB, num: '1840', right1: t >= T.same ? 'AYNI PİL' : 'EL YAZISI NOT', right2: t >= T.swing ? 'NEREDEYSE DURMADAN' : 'KURULDU', p: pB });
      if (t < T.pile) return row({ label: labB, num: '1840', right1: 'CAMIN ARDINDA', right2: t >= T.faint ? 'NEREDEYSE DUYULMUYOR' : 'SES ÇOK ZAYIF', p: pB });
      if (t < T.ten) return row({ label: labB, num: '1840', right1: 'KURU PİL', right2: t >= T.open ? 'İÇİ BİLİNMİYOR' : '', p: pB });
      return row({ label: labB, num: '10 milyar+', unit: 'kez', right1: '', right2: '', p: pB });
    }
    if (t < T.hero) {
      const p = ease.enter(seg(t, T.cmp0, 0.35));
      return row({ label: 'AYNI SAAT', num: t >= T.nine2 ? '9' : '', unit: t >= T.nine2 ? 'yılda 1 damla' : '', right1: '', right2: t >= T.nine2 ? 'ORTALAMA' : '', p });
    }
    if (t < T.ask) return row({ label: 'O TEK DAMLA DÜŞENE KADAR', num: 'yarım milyar', unit: 'kez', red: true, right2: 'YAKLAŞIK' });
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(64)); revealText(ctx, 'Zift mi, çan mı?', SAFE.x0, 668, 64, p, C.ink);
  }

  // ——— kare 0 / soru: iki düzenek yan yana, iki sayaç ———
  function split(t, o = {}) {
    const { alpha = 1, dx = 0 } = o;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    // kamera: açılışta 1 → 1,05 (laboratuvar bu değerden devam eder), soruda geri; kare 0 = son kare
    const z = t < T.ask ? 1 + 0.05 * ease.state(seg(t, 0, L.l02.t0)) : 1 + 0.05 * (1 - ease.state(seg(t, T.ask, D - T.ask)));
    // soruda sahne aşağıdan yerine oturur (yan taşma yok); son kare = kare 0
    const dy = t < T.ask ? 0 : 90 * (1 - ease.state(seg(t, T.ask, D - T.ask - 0.4)));
    ctx.translate(540, FLOOR + dy); ctx.scale(z, z); ctx.translate(-540, -FLOOR);
    floor();
    ctx.save(); ctx.translate(dx, 0);
    // asılı damla döngüsü: yavaşça büyür (film boyunca tek döngü)
    const gl = 0.35 + 0.5 * (0.5 - 0.5 * Math.cos((t / D) * Math.PI * 2));
    funnelRig(230, 0.72, { fill: 1, cut: true, grow: gl, pile: 3 });
    dome(230, FLOOR - 22, 290, 470, 1, t);
    bellRig(590, 0.7, t);
    dome(590, FLOOR - 28, 320, 470, 1, t);
    odometer(110, 830, 9, 2, 'DAMLA', { sep: false, cw: 60, ch: 90 });
    // çan sayacı 10 milyarda durur: kesin sayı bilinmiyor, '+' ile
    const ow = odometer(300, 844, 1e10, 11, 'ÇALMA', { cw: 46, ch: 70 });
    setFont(ctx, F.head(72)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('+', 300 + ow + 8, 908);
    ctx.restore();
    ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const s = toB(t), op0 = L.l02.t0 - 0.5;
    // açılış: bölünmüş sahne sola çekilir, laboratuvar sağdan gelir (filmin baskın yönü: sağdan sola)
    if (t < op0) split(t);
    else if (t < L.l02.t0) { const u = ease.state(seg(t, op0, 0.5)); ctx.save(); ctx.translate(-W * u, 0); split(t); ctx.restore(); lab(t, W * (1 - u)); }
    if (t >= L.l02.t0 && t < T.cmp0) {
      if (s < 1) lab(t, -W * s);
      if (s > 0) oxford(t, W * (1 - s));
    }
    compare(t);
    if (t >= T.ask) split(t);
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET', SAFE.x0, 530, kf, 'left'); chip('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 584, kf, 'left'); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    if (s > 0 && s < 1) { sifir(t, -W * s); sifir(t, W * (1 - s)); } else sifir(t, 0);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

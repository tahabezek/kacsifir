// "Kaplumbağa" şablonu (Hangisi daha şaşırtıcı?): türünün son üyesi Yalnız George ve türünü kurtaran Diego.
// A: gravür küre Galapagos'a iner; kâğıt levhada Pinta Adası: keçiler bitkileri yer, kaplumbağalar teker teker kaybolur,
//    1971'de tek bir kaplumbağa kalır; ödül ilanı, açılmayan yumurtalar, 2012'de George'un ölümü (sessiz).
// B: Española'da 15 kaplumbağa; San Diego'dan Diego gelir (yay); Santa Cruz'daki programda yavrular akar; 2020'de dönüş.
// Doruk: soy ağacı — George'un dalı yok (0), Diego'nun yelpazesi 900 yaprak (kırmızı), sonra programın kalanı (%40).
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { geoInterpolate } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { GEORGE_CARD, DIEGO_CARD, drawTortoise, drawGoat, drawEgg, drawPoster } from '../kaplumbaga_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// yerler (boylam, enlem)
const PINTA = [-90.75, 0.58], ESP = [-89.67, -1.37], SCZ = [-90.30, -0.74], SANDIEGO = [-117.16, 32.72];
// Pinta levhası: ada merkezi ve yarıçapları; George'un yeri
const IS = { x: 600, y: 1020, rx: 290, ry: 215 }, GEO = { x: 650, y: 1080 };
// soy ağacı levhası
const TREE = { gx: 210, gy: 880, dx: 560, dy: 860, fx: 560, fy: 985, r0: 90, r1: 290, a: 0.78 };

export function kaplumbagaTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    goats: Wd('l02', 'keçiler'), gone: Wd('l02', 'yok'), one: Wd('l03', 'tek'), found: Wd('l03', 'bulunuyor'), name: Wd('l04', 'yalnız'), last: Wd('l04', 'son'),
    reward: Wd('l05', 'ödül'), none: Wd('l05', 'kimse'), eggs: Wd('l06', 'yumurtaların'), nohatch: Wd('l06', 'açılmıyor'), death: Wd('l07', 'ölüyor'),
    whip0: L.l07.end + 0.25, whip1: L.l08.t0 + 0.6, q: Wd('l08', 'kaplumbağa'), esp: Wd('l09', 'espanyola'), fifteen: Wd('l09', 'on'),
    usa: Wd('l10', 'amerika'), diego: Wd('l10', 'diego'), prog: Wd('l11', 'programında'), nine: Wd('l11', 'dokuz'), back: Wd('l12', 'adasına'),
    cmp0: L.l13.t0 - 0.1, zero: Wd('l14', 'sıfır'), dq: Wd('l14', 'diego'), hero: L.l15.t0 - 0.04, after: L.l16.t0, pct: Wd('l16', 'yüzde'), ask: L.l17.t0, loop0: tl.loop0,
  };
  T.plateA = T.goats - 0.55; T.plateAx = T.whip0 - 0.35;
  return T;
}

export async function makeKaplumbagaRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = kaplumbagaTimes(tl), Fx = ep.facts;
  const yearA = t => t < T.reward ? 1971 : Math.floor(lerp(1971, 2012, seg(t, T.reward, T.death - T.reward)));
  const hatched = t => Math.floor(Fx.diego.offspring * ease.state(seg(t, T.prog, T.nine + 0.35 - T.prog)));

  // ——— kamera ———
  const S0 = { c: [-80, -6], r: 420, cy: 1160 }, S0b = { c: [-96, -2], r: 420, cy: 1160 };
  const GAL = { c: [-90.25, -0.45], r: 15000, cy: 1080 };
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, c: [-80 - 3 * seg(t, 0, L.l02.t0), -6 + 1.5 * seg(t, 0, L.l02.t0)], r: S0.r * (1 + 0.03 * ease.enter(seg(t, 0, 0.6)) + 0.02 * seg(t, 0.6, L.l02.t0)) }) },
    { t0: L.l02.t0 - 0.3, t1: L.l02.t0 + 1.1, to: t => ({ c: [-90.25 - 0.15 * seg(t, L.l02.t0 + 1.1, 3), -0.45 + 0.25 * seg(t, L.l02.t0 + 1.1, 3)], r: GAL.r * (1 + 0.1 * seg(t, L.l02.t0 + 1.1, 3)), cy: 1080 }) },
    { t0: T.whip0, t1: T.whip1, to: t => ({ c: [-89.85, -1.12], r: 30000 * (1 + 0.12 * seg(t, T.whip1, T.usa - 0.4 - T.whip1)), cy: 1060 }) },
    { t0: T.usa - 0.4, t1: T.usa + 1.0, to: t => ({ c: [-104 + 3 * seg(t, T.usa + 1.0, L.l11.t0 - T.usa - 1.4), 15], r: 720 * (1 + 0.06 * seg(t, T.usa + 1.0, L.l11.t0 - T.usa - 1.4)), cy: 1110 }) },
    { t0: L.l11.t0 - 0.4, t1: L.l11.t0 + 0.9, to: t => ({ c: [-90.05, -0.95], r: 17000 * (1 + 0.12 * seg(t, L.l11.t0 + 0.9, T.cmp0 - L.l11.t0 - 0.9)), cy: 1080 }) },
    // soy ağacının arkasında başa dönülür; soruda küre yavaşça kare 0'daki konumuna gelir (döngü dikişinde aynı yön)
    { t0: T.cmp0 + 0.8, t1: T.cmp0 + 2.0, to: () => S0b },
    { t0: T.ask, t1: D - 0.04, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);

  // ——— kâğıt levhalar: alttan kayarak gelir, çıkışta aşağı iner ———
  const plate = (t, a, b) => t < a ? 0 : t < b ? ease.state(seg(t, a, 0.75)) : 1 - ease.state(seg(t, b, 0.6));
  const rnd = mulberry32(39);
  const inIsland = (x, y, s = 1) => ((x - IS.x) / (IS.rx * s)) ** 2 + ((y - IS.y) / (IS.ry * s)) ** 2 < 1;
  // ada kıyısı: tohumlu gürültülü halkalar (eş yükselti)
  const rings = Array.from({ length: 4 }, (_, k) => { const n = 72, ph = rnd() * 6, pts = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, s = 1 - k * 0.2, w = 1 + 0.07 * Math.sin(a * 3 + ph) + 0.04 * Math.sin(a * 7 + ph * 2); pts.push([IS.x + Math.cos(a) * IS.rx * s * w, IS.y + Math.sin(a) * IS.ry * s * w]); } return pts; });
  // bitkiler (çalı benekleri): her biri keçiler gelince kendi anında yenir
  const shrubs = []; while (shrubs.length < 360) { const x = IS.x + (rnd() * 2 - 1) * IS.rx, y = IS.y + (rnd() * 2 - 1) * IS.ry; if (inIsland(x, y, 0.92)) shrubs.push([x, y, rnd(), 4 + rnd() * 4]); }
  // kaplumbağalar: George (0) kalır, diğerleri teker teker kaybolur
  const torts = [[GEO.x, GEO.y, 0]]; while (torts.length < 14) { const x = IS.x + (rnd() * 2 - 1) * IS.rx * 0.8, y = IS.y + (rnd() * 2 - 1) * IS.ry * 0.8; if (inIsland(x, y, 0.8) && Math.hypot(x - GEO.x, y - GEO.y) > 70 && torts.every(p => Math.hypot(p[0] - x, p[1] - y) > 60)) torts.push([x, y, rnd()]); }
  const goats = Array.from({ length: 5 }, (_, i) => [IS.x + (rnd() * 2 - 1) * IS.rx * 0.6, IS.y + (rnd() * 2 - 1) * IS.ry * 0.5, rnd() * 6, i % 2 ? 1 : -1]);
  const goatK = t => ease.enter(seg(t, T.goats - 0.2, 0.5)) * (1 - ease.state(seg(t, T.reward, 1.2)));
  function plateA(t, k) {
    if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    ctx.save();
    // levha boyunca George'a doğru yavaş yaklaşma (%14)
    { const z = 1 + 0.14 * seg(t, T.plateA + 0.75, T.plateAx - T.plateA - 0.75); ctx.translate(GEO.x, GEO.y); ctx.scale(z, z); ctx.translate(-GEO.x, -GEO.y); }
    // deniz: yatay ince çizgiler; ada: kâğıt + eş yükselti halkaları
    ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineWidth = 1.1; for (let y = STAGE_TOP + 4; y < 1920; y += 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    rings.forEach((P, kk) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); if (kk === 0) { ctx.lineWidth = 16; ctx.strokeStyle = C.paper; ctx.stroke(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); } ctx.lineWidth = kk === 0 ? 2.6 : 1.3; ctx.strokeStyle = kk === 0 ? C.ink : C.graphite; ctx.stroke(); });
    // bitkiler: keçiler geldikten sonra sırayla yenir
    for (const [x, y, r, s] of shrubs) {
      const te = T.goats + 0.3 + r * (T.gone - T.goats + 0.6); if (t >= te + 0.3) continue;
      const u = t < te ? 1 : 1 - seg(t, te, 0.3);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - s * u, y); ctx.lineTo(x, y - s * 1.6 * u); ctx.lineTo(x + s * u, y); ctx.stroke();
    }
    // kaplumbağalar: diğerleri keçilerle birlikte teker teker kaybolur
    for (const [x, y, r] of torts) {
      const george = r === 0;
      let a = 1; if (!george) { const tv = T.goats + 0.6 + r * (T.one - T.goats - 1.2); a = 1 - seg(t, tv, 0.4); if (a <= 0) continue; }
      if (george) continue;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); drawTortoise(ctx, GEORGE_CARD, {}, 44); ctx.restore();
    }
    // keçiler: ada üstünde gezinir ve otlar
    const gk = goatK(t);
    if (gk > 0) for (const [x0, y0, ph, dir] of goats) {
      const x = x0 + Math.sin(t * 0.35 + ph) * 60, y = y0 + Math.cos(t * 0.27 + ph) * 26, grazing = Math.sin(t * 0.9 + ph) > 0.2;
      ctx.save(); ctx.globalAlpha = gk; ctx.translate(x, y); ctx.scale(Math.cos(t * 0.35 + ph) * dir >= 0 ? 1 : -1, 1); drawGoat(ctx, { walk: grazing ? null : t, graze: grazing ? 1 : 0 }, 56); ctx.restore();
    }
    // George: tek kalan; yavaşça yürür; ölümde başı yere eğilir, gözleri kapanır
    const dead = t >= T.death;
    const gx = GEO.x + (dead ? 0 : Math.sin((t - T.one) * 0.25) * 18);
    const walking = !dead && t >= T.name && t < T.death - 0.6;
    if (t >= T.one - 0.4) { const u = ease.enter(seg(t, T.one - 0.1, 0.6)); ctx.beginPath(); ctx.arc(GEO.x, GEO.y - 22, 70, -2.2, -2.2 + Math.PI * 2.15 * u); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.save(); ctx.translate(gx, GEO.y); drawTortoise(ctx, GEORGE_CARD, { walk: walking ? t : null, head: dead ? ease.state(seg(t, T.death, 1.2)) : 0, eyes: dead && t >= T.death + 0.9 ? 'closed' : 'open', slump: dead ? ease.state(seg(t, T.death + 0.2, 1.0)) : 0 }, 62); ctx.restore();
    ctx.restore();
    // etiketler (yakınlaşmanın dışında, kâğıt zeminde)
    setFont(ctx, F.mono(32)); ctx.textAlign = 'left';
    const chip = (s, x, y, a = 1) => { if (a <= 0) return; const tw = ctx.measureText(s).width; ctx.globalAlpha = a; ctx.fillStyle = C.paper; ctx.fillRect(x - 8, y - 32, tw + 16, 44); ctx.fillStyle = C.ink; ctx.fillText(s, x, y); ctx.globalAlpha = 1; };
    chip('PINTA ADASI · GALAPAGOS', SAFE.x0, 774);
    if (t >= T.name - 0.1) chip(dead ? 'YALNIZ GEORGE · 2012' : 'YALNIZ GEORGE', 560, 950, ease.enter(seg(t, T.name - 0.1, 0.35)));
    ctx.restore();
    return [GEO.x, GEO.y - 30];
  }

  // ——— soy ağacı levhası (doruk) ———
  const leaves = []; { const r2 = mulberry32(390); for (let i = 0; i < 2250; i++) { const a = (r2() * 2 - 1) * TREE.a, rr = Math.sqrt(lerp(TREE.r0 ** 2, TREE.r1 ** 2, r2())); leaves.push([TREE.fx + Math.sin(a) * rr, TREE.fy + Math.cos(a) * rr * 0.98]); } }
  const twigs = Array.from({ length: 22 }, (_, i) => { const a = -TREE.a + (2 * TREE.a * (i + 0.5)) / 22; return [TREE.fx + Math.sin(a) * 210, TREE.fy + Math.cos(a) * 205]; });
  function tree(t) {
    if (t < T.cmp0 || t >= T.ask) return;
    const out = t >= T.ask - 0.45, k = out ? 1 - ease.exit(seg(t, T.ask - 0.45, 0.45)) : ease.state(seg(t, T.cmp0, 0.6));
    if (out) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.restore(); }
    else { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.restore(); }
    if (k < 0.9 && !out) return;
    // soruya geçişte içerik levhayla birlikte söner (tek karede kaybolmaz)
    ctx.save(); ctx.globalAlpha = out ? k : 1; ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // kıyas boyunca yavaş yaklaşma (%10)
    const z = 1 + 0.12 * seg(t, T.cmp0 + 0.6, T.ask - T.cmp0 - 0.6); ctx.translate(520, 1080); ctx.scale(z, z); ctx.translate(-520, -1080);
    const red = t >= T.hero - 0.02 && t < T.ask;
    setFont(ctx, F.mono(32));
    const chip = (s, x, y, a = 1, col = C.ink, al = 'center') => { if (a <= 0) return; ctx.textAlign = al; const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 8, y - 32, tw + 16, 44); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); };
    // George: tek düğüm, dalı yok
    const ug = ease.enter(seg(t, T.cmp0 + 0.5, 0.5));
    ctx.save(); ctx.globalAlpha *= ug; ctx.translate(TREE.gx, TREE.gy); drawTortoise(ctx, GEORGE_CARD, {}, 120); ctx.restore();
    chip('GEORGE', TREE.gx, TREE.gy + 52, ug);
    if (ug > 0) { ctx.beginPath(); ctx.moveTo(TREE.gx, TREE.gy + 74); ctx.lineTo(TREE.gx, TREE.gy + 74 + 70 * ug); ctx.setLineDash([8, 7]); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]); }
    if (t >= T.zero - 0.05) { const p = spring(t - T.zero + 0.05, 120, 24); setFont(ctx, F.head(200)); ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.save(); ctx.translate(TREE.gx, TREE.gy + 330); ctx.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p); ctx.globalAlpha *= Math.min(1, p * 1.3); ctx.fillText('0', 0, 0); ctx.restore(); setFont(ctx, F.mono(32)); chip('YAVRU', TREE.gx, TREE.gy + 392, Math.min(1, p)); }
    // Diego: düğüm, dallar, yapraklar (yavrular)
    // soru satırında iki düğüm birlikte görünür; Diego'nun dalları adı geçince açılır
    const un = ease.enter(seg(t, T.cmp0 + 0.8, 0.5)), ud = ease.enter(seg(t, T.cmp0 + 1.4, 1.2));
    if (un > 0) { ctx.save(); ctx.globalAlpha *= un; ctx.translate(TREE.dx, TREE.dy); drawTortoise(ctx, DIEGO_CARD, {}, 120); ctx.restore(); chip('DIEGO', TREE.dx, TREE.dy + 52, un); }
    if (ud > 0) {
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; for (const [x, y] of twigs) { ctx.beginPath(); ctx.moveTo(TREE.fx, TREE.fy - 20); ctx.lineTo(lerp(TREE.fx, x, ud), lerp(TREE.fy - 20, y, ud)); ctx.stroke(); }
    }
    // Diego'nun 900 yavrusu: hızlanarak basılır, doruktan önceki sessizlikte tamamlanır; doruğun karesinde kırmızı
    const nD = Fx.diego.offspring;
    const u = clamp01((t - T.dq - 0.2) / Math.max(0.6, T.hero - T.dq - 0.2)), n = t >= T.hero - 0.02 ? nD : Math.min(nD, Math.floor(nD * u * (0.3 + 0.7 * u)));
    const pop = red ? spring(t - T.hero, 120, 24) : 1;
    ctx.fillStyle = red ? C.red : C.ink; const s = red ? 5 + 1.5 * Math.max(0, 1 - pop) : 5;
    for (let i = 0; i < n; i++) ctx.fillRect(leaves[i][0] - s / 2, leaves[i][1] - s / 2, s, s);
    if (n > 0 && t < T.hero - 0.02) chip(nf0.format(n), TREE.fx, TREE.fy + TREE.r1 + 46, 1, C.ink);
    if (t >= T.hero - 0.02 && t < T.after - 0.1) chip('900 YAVRU', TREE.fx, TREE.fy + TREE.r1 + 46, 1, red ? C.red : C.ink);
    // programın tamamı ayrı bir şerit: Diego'dan çizgi almaz; %40 kırmızı, %60 grafit
    const uo = ease.enter(seg(t, T.after - 0.1, 0.8));
    if (uo > 0) {
      const bx0 = TREE.fx - 330, bw = 460, by0 = TREE.fy + TREE.r1 + 24, w40 = bw * Fx.diego.share / 100;
      ctx.save(); ctx.globalAlpha *= uo; ctx.fillStyle = 'rgba(139,133,119,0.6)'; ctx.fillRect(bx0, by0, bw * uo, 22); ctx.fillStyle = red ? C.red : C.ink; ctx.fillRect(bx0, by0, Math.min(w40, bw * uo), 22); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(bx0, by0, bw * uo, 22); ctx.restore();
      chip("≈ PROGRAMIN %40'I", bx0 + bw / 2, by0 + 66, uo, red ? C.red : C.ink);
    }
    ctx.restore();
  }

  // ——— büyüteç ———
  const sand = Array.from({ length: 60 }, () => [rnd(), rnd()]);
  function ground(y0) { ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-130, y0, 260, 140); ctx.beginPath(); ctx.moveTo(-130, y0); ctx.lineTo(130, y0); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.fillStyle = C.ink; for (const [a, b] of sand) ctx.fillRect(-124 + a * 248, y0 + 8 + b * 90, 2, 2); }
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'goat') {
      // keçi çalıyı yer: çalı küçülür, yeniden döner (döngü)
      ground(60); const ph = (t * 0.7) % 1, sz = 1 - ph;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 8, 60); ctx.lineTo(40 + i * 14 * sz, 60 - 50 * sz); ctx.stroke(); }
      ctx.save(); ctx.translate(-40, 62); drawGoat(ctx, { graze: 0.6 + 0.4 * Math.sin(t * 5) ** 2 }, 150); ctx.restore();
    } else if (kind === 'one' || kind === 'rest') {
      // çıplak kaya: tek kaplumbağa; rüzgâr çizgileri (sürekli)
      ground(56);
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const x = 130 - ((t * 60 + i * 70) % 280); ctx.beginPath(); ctx.moveTo(x, -70 + i * 22); ctx.lineTo(x + 40, -70 + i * 22); ctx.stroke(); }
      const dead = kind === 'rest';
      ctx.save(); ctx.translate(-34, 58); drawTortoise(ctx, GEORGE_CARD, { head: dead ? ease.state(seg(t, T.death, 1.2)) : 0.1 + 0.08 * Math.sin(t * 0.8), eyes: dead && t >= T.death + 0.9 ? 'closed' : 'open', slump: dead ? ease.state(seg(t, T.death + 0.2, 1.0)) : 0 }, 148); ctx.restore();
    } else if (kind === 'poster') {
      ground(80);
      ctx.save(); ctx.translate(0, -8 + Math.sin(t * 1.3) * 2); drawPoster(ctx, 170, ['ARANIYOR', 'GEORGE İÇİN EŞ', '10.000 $ ÖDÜL'], F.head(30), F.mono(20)); ctx.restore();
    } else if (kind === 'eggs') {
      // kumda üç yumurta: hiçbiri çatlamaz; kum taneleri yavaşça kayar
      ground(40);
      ctx.fillStyle = C.ink; for (let i = 0; i < 8; i++) { const x = 120 - ((t * 25 + i * 34) % 250); ctx.fillRect(x, 20 + (i % 3) * 6, 3, 3); }
      [[-55, 0.1], [0, -0.15], [55, 0.2]].forEach(([x, a]) => { ctx.save(); ctx.translate(x, 46); drawEgg(ctx, 70, a); ctx.restore(); });
    } else if (kind === 'diego' || kind === 'diegobabies') {
      ground(60);
      ctx.save(); ctx.translate(-40, 62); drawTortoise(ctx, DIEGO_CARD, { head: 0.05 + 0.05 * Math.sin(t * 0.9) }, 150); ctx.restore();
      if (kind === 'diegobabies') for (const [x, ph] of [[62, 0], [92, 0.6]]) { ctx.save(); ctx.translate(x + Math.sin(t * 0.8 + ph) * 4, 62); drawTortoise(ctx, DIEGO_CARD, { baby: true, walk: t + ph }, 36); ctx.restore(); }
    } else if (kind === 'fifteen') {
      // Española'da kalan 15 kaplumbağa: 12 dişi, 3 erkek (erkekler mürekkep halkalı)
      ground(96);
      for (let i = 0; i < 15; i++) { const x = -92 + (i % 5) * 46, y = -30 + Math.floor(i / 5) * 42; ctx.save(); ctx.translate(x + Math.sin(t * 0.6 + i) * 2, y); drawTortoise(ctx, DIEGO_CARD, {}, 40); ctx.restore(); if (i >= 12) { ctx.beginPath(); ctx.arc(x, y - 14, 24, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); } }
    } else if (kind === 'zoo') {
      ground(64);
      ctx.save(); ctx.translate(-30 + Math.sin(t * 0.5) * 10, 66); drawTortoise(ctx, DIEGO_CARD, { walk: t }, 140); ctx.restore();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (let x = -120; x <= 120; x += 30) { ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x, 90); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-130, 0); ctx.lineTo(130, 0); ctx.moveTo(-130, 40); ctx.lineTo(130, 40); ctx.stroke();
    } else if (kind === 'hatch') {
      // kuluçka: yumurtalar sırayla açılır, yavrular yürüyüp çıkar (döngü)
      ground(60);
      for (let i = 0; i < 3; i++) {
        const ph = ((t - T.prog) * 0.9 + i / 3) % 1, x = -80 + i * 80;
        if (ph < 0.45) { ctx.save(); ctx.translate(x, 60); drawEgg(ctx, 74, Math.sin(ph * 40) * 0.08 * (ph > 0.3 ? 1 : 0)); ctx.restore(); }
        else { const u = (ph - 0.45) / 0.55; ctx.save(); ctx.translate(x + u * 50, 60); drawTortoise(ctx, DIEGO_CARD, { baby: true, walk: t }, 80); ctx.restore(); }
      }
    } else if (kind === 'walk') {
      // Diego adasında yürür: zemin akar
      ground(60); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; for (let i = 0; i < 4; i++) { const x = 140 - ((t * 40 + i * 80) % 320); ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x + 14, 46); ctx.lineTo(x + 30, 60); ctx.stroke(); }
      ctx.save(); ctx.translate(-34, 62); drawTortoise(ctx, DIEGO_CARD, { walk: t }, 150); ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ——— (George'un yalnızlığı ve ölümü boyunca gülümseme yok)
  const blinkR = mulberry32(60); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.gone, 'sasirma', 'saskin'], [T.gone + 1.4, 'ayakta', 'dusunceli'], [T.name, 'ayakta', 'notr'], [T.none, 'ayakta', 'dusunceli'], [T.death, 'ayakta', 'dusunceli'],
    [L.l08.t0, 'ayakta', 'notr'], [T.diego, 'ayakta', 'mutlu'], [T.nine, 'sasirma', 'saskin'], [T.nine + 1.6, 'ayakta', 'mutlu'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
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
    ctx.save(); ctx.globalAlpha = 1 - seg(t, T.loop0, 0.3);
    // bölünmüş cümle (l14 + l15): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l15' ? L.l14.text + ' ' + ln.text : ln.id === 'l14' ? "George'un ardında bıraktığı yavru sayısı sıfır. Ya Diego?" : ln.text;
    const p = ln.id === 'l15' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
    ctx.restore();
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42)); revealText(ctx, 'Türünün son üyesi Yalnız George mu,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, '900 yavrunun babası Diego mu?', SAFE.x0, 690, 42, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    if (t < L.l08.t0 - 0.06) {
      const pA = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
      if (t < L.l03.t0 - 0.06) { row({ label: 'PINTA ADASI · YÜZÖLÇÜMÜ', num: '60', unit: 'km²', right1: t >= T.goats ? 'KEÇİLER' : '', right2: t >= T.goats ? 'BİTKİLER YOK OLUYOR' : '', p: pA }); return; }
      const y = yearA(t);
      const r1 = t >= T.death ? '41 YIL YALNIZ' : t >= T.reward ? 'ÖDÜL: 10.000 $' : t >= T.name ? 'YALNIZ GEORGE' : 'TEK KAPLUMBAĞA';
      const r2 = t >= T.death ? 'TÜRÜNÜN SON ÜYESİ' : t >= T.eggs ? 'YUMURTALAR AÇILMIYOR' : t >= T.none ? 'EŞ BULUNAMIYOR' : t >= T.last ? 'TÜRÜNÜN SON ÜYESİ' : 'PINTA ADASI';
      // ödül ve yumurta yılları kesin değil: arada takvim yılı yerine yalnız geçen süre (yıl) sayılır
      const mid = t >= T.reward && t < T.death;
      row({ label: 'YALNIZ GEORGE · PINTA', num: mid ? String(y - 1971) : String(y), unit: mid ? 'yıl yalnız' : '', right1: r1, right2: r2, p: pA });
      return;
    }
    if (t < T.cmp0) {
      const pB = Math.max(0.35, ease.enter(seg(t, L.l08.t0 - 0.06, 0.35)));
      if (t < L.l10.t0 - 0.06) { row({ label: 'DIEGO · ESPAÑOLA ADASI', num: t >= T.fifteen ? '15' : '?', unit: 'kaplumbağa', right1: t >= T.fifteen ? '12 DİŞİ · 3 ERKEK' : '', right2: t >= T.esp ? 'KEÇİLER YÜZÜNDEN' : '', p: pB }); return; }
      if (t < L.l11.t0 - 0.06) { row({ label: 'DIEGO · ESPAÑOLA ADASI', num: '1977', unit: '', right1: 'SAN DIEGO', right2: 'HAYVANAT BAHÇESİNDEN', p: pB }); return; }
      if (t < L.l12.t0 - 0.06) { row({ label: 'DIEGO · YETİŞTİRME PROGRAMI', num: nf0.format(hatched(t)), unit: 'yavru', right1: 'BABA: DIEGO', right2: 'SANTA CRUZ ADASI', p: pB }); return; }
      row({ label: 'DIEGO · ESPAÑOLA ADASI', num: '2020', unit: '', right1: '100 YAŞINI GEÇMİŞ', right2: 'ADASINA DÖNÜŞ', p: pB });
      return;
    }
    if (t < T.hero) { row({ label: 'AYNI SOY AĞACINDA · GEORGE', num: t >= T.zero - 0.05 ? '0' : '?', unit: 'yavru', right1: t >= T.dq - 0.1 ? 'DIEGO: ?' : '', right2: '', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.ask) { row({ label: 'DIEGO, TEK BAŞINA', num: '900', unit: 'yavru', red: true, right1: 'GEORGE: 0', right2: t >= T.pct ? "PROGRAMIN %40'I" : '' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)), a = 1 - ease.exit(seg(t, T.loop0 + 0.05, 0.25));
    ctx.save(); ctx.globalAlpha = a; setFont(ctx, F.head(76)); revealText(ctx, 'George mu, Diego mu?', SAFE.x0, 652, 76, p, C.ink); ctx.restore();
  }

  // ——— kare ———
  const R_ARC = Array.from({ length: 41 }, (_, i) => geoInterpolate(SANDIEGO, [-90.2, -0.8])(i / 40));
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    G.draw();
    let at = null;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // kare 0 ve döngü: Galapagos noktası
    // A: Pinta'ya iniş
    if (t >= L.l02.t0 && t < T.plateA + 0.8) { G.ringAt(PINTA, seg(t, L.l02.t0 + 0.8, 0.6), 40); G.placeLabel(PINTA, 'PINTA', seg(t, L.l02.t0 + 0.8, 0.4), 30, -30); if (G.visible(PINTA)) at = G.proj(PINTA); }
    // B: Española, 15 kaplumbağa
    if (t >= T.whip0 && t < T.usa - 0.4) {
      G.ringAt(ESP, seg(t, T.whip1 - 0.4, 0.6), 70); G.placeLabel(ESP, 'ESPAÑOLA', seg(t, T.whip1 - 0.4, 0.4), 40, -64, C.ink, 'left', false);
      if (G.visible(ESP)) { const q = G.proj(ESP); at = q; if (t >= T.fifteen - 0.2) for (let i = 0; i < 15; i++) { const a = i * 2.39996, rr = 9 + 5.2 * Math.sqrt(i); const u = ease.enter(seg(t, T.fifteen - 0.2 + i * 0.04, 0.3)); ctx.beginPath(); ctx.arc(q[0] + Math.cos(a) * rr * 1.6, q[1] + Math.sin(a) * rr, 4.5 * u, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); } }
    }
    // B: San Diego → Galapagos yayı, üstünde Diego
    if (t >= T.usa - 0.4 && t < L.l11.t0 + 0.3) {
      const u = ease.state(seg(t, T.usa + 0.4, T.diego + 0.5 - T.usa - 0.4)), n = Math.max(1, Math.round(40 * u));
      G.line(R_ARC.slice(0, n + 1), { w: 4, dash: [10, 7] });
      G.placeLabel(SANDIEGO, 'SAN DIEGO', seg(t, T.usa, 0.4), 22, -22);
      G.placeLabel([-90.3, -0.6], 'GALAPAGOS', seg(t, T.usa + 0.2, 0.4), 22, 46, C.ink, 'right');
      const p = geoInterpolate(SANDIEGO, [-90.2, -0.8])(u);
      if (G.visible(p)) { const q = G.proj(p); ctx.save(); ctx.translate(q[0], q[1] - 6); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -14, 40, 24, 0, 0, Math.PI * 2); ctx.fill(); drawTortoise(ctx, DIEGO_CARD, {}, 56); ctx.restore(); at = q; }
    }
    // B: Santa Cruz programı: yavrular Española'ya akar; 2020'de Diego döner
    if (t >= L.l11.t0 - 0.4 && t < T.cmp0 + 0.6) {
      G.ringAt(SCZ, seg(t, L.l11.t0 + 0.6, 0.6), 46); G.placeLabel(SCZ, 'DARWIN İSTASYONU', seg(t, L.l11.t0 + 0.6, 0.4), 34, -56, C.ink, 'left');
      G.placeLabel(ESP, 'ESPAÑOLA', seg(t, L.l11.t0 + 0.8, 0.4), 64, -62, C.ink, 'right', false);
      if (G.visible(SCZ) && G.visible(ESP)) {
        const a = G.proj(SCZ), b = G.proj(ESP), mid = [(a[0] + b[0]) / 2 + 60, (a[1] + b[1]) / 2 - 30];
        const bez = u => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mid[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * mid[1] + u * u * b[1]];
        ctx.beginPath(); for (let i = 0; i <= 30; i++) { const p = bez(i / 30); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.setLineDash([8, 7]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
        if (t >= T.prog) for (let i = 0; i < 12; i++) { const u = (((t - T.prog) * 0.35 + i / 12) % 1); const p = bez(u); ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
        if (t >= L.l12.t0 - 0.06) { const u = ease.state(seg(t, L.l12.t0, T.back + 0.8 - L.l12.t0)), p = bez(u); ctx.save(); ctx.translate(p[0], p[1] - 4); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -14, 40, 24, 0, 0, Math.PI * 2); ctx.fill(); drawTortoise(ctx, DIEGO_CARD, { walk: t }, 56); ctx.restore(); at = p; }
        else at = a;
      }
    }
    ctx.restore();
    // levhalar
    const pa = plateA(t, plate(t, T.plateA, T.plateAx)); if (pa && t >= T.plateA + 0.6 && t < T.plateAx) at = pa;
    tree(t);
    // büyüteç: satırlara göre
    let kind = null, rk = 1;
    const cutT = L.l08.t0 - 0.06;
    if (t >= L.l02.t0 && t < L.l03.t0) kind = 'goat'; else if (t >= L.l03.t0 && t < L.l05.t0) kind = 'one'; else if (t >= L.l05.t0 && t < L.l06.t0) kind = 'poster'; else if (t >= L.l06.t0 && t < T.death - 0.3) kind = 'eggs'; else if (t >= T.death - 0.3 && t < cutT) kind = 'rest';
    else if (t >= cutT && t < L.l09.t0) kind = 'diego'; else if (t >= L.l09.t0 && t < L.l10.t0) kind = 'fifteen'; else if (t >= L.l10.t0 && t < L.l11.t0) kind = 'zoo'; else if (t >= L.l11.t0 && t < L.l12.t0) kind = 'hatch'; else if (t >= L.l12.t0 && t < T.cmp0) kind = 'walk';
    // kesmede büyüteç tam kapanır; ikinci aday sorunun "kaplumbağa" kelimesinde görünür
    if (t >= cutT - 0.3 && t < T.q + 0.45) { if (t < cutT) { rk = 1 - ease.exit(seg(t, cutT - 0.3, 0.3)); kind = 'rest'; } else if (t < T.q - 0.1) rk = 0; else rk = ease.enter(seg(t, T.q - 0.1, 0.45)); }
    if (t >= T.cmp0 - 0.35 && t < T.cmp0) { kind = 'walk'; rk = 1 - ease.exit(seg(t, T.cmp0 - 0.35, 0.35)); } else if (t >= T.cmp0 && t < T.ask) kind = null;
    if (kind && rk > 0.02) roundel(t, kind, ROUND, rk, at);
    // kare 0 ve soru: iki balon
    if (t < L.l02.t0) { roundel(t, 'one', ROUND, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35))); roundel(t, 'diegobabies', ROUND2, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35))); }
    if (t >= T.ask) { const kin = ease.enter(seg(t, T.ask, 0.45)); roundel(t, 'one', ROUND, kin); roundel(t, 'diegobabies', ROUND2, kin); }
    if (t < L.l02.t0 || t >= T.loop0 + 0.3) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.loop0 + 0.3, 0.4));
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.paper; ctx.globalAlpha = kk; ctx.fillRect(ROUND.x - 124, 1084, 248, 42); ctx.fillRect(482 - 62, 1096, 124, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'YALNIZ GEORGE', ROUND.x, 1116, 32, kk, C.ink, 'center'); revealText(ctx, 'DIEGO', 482, 1128, 32, kk, C.ink, 'center');
    }
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.3)) : 1;
      setFont(ctx, F.mono(32)); ctx.save(); ctx.globalAlpha = kout; ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(ROUND.x - 70, 1084, 140, 42); ctx.fillRect(482 - 62, 1096, 124, 42); ctx.globalAlpha = kout;
      revealText(ctx, 'GEORGE', ROUND.x, 1116, 32, kin, C.ink, 'center'); revealText(ctx, 'DIEGO', 482, 1128, 32, kin, C.ink, 'center'); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

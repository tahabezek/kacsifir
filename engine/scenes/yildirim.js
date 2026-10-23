// "Yıldırım" şablonu (Hangisi daha şaşırtıcı?): gökyüzüyle iki karşılaşma.
// A: Peru'ya yaklaşılır; kâğıt levhada gökyüzü kesiti (0–3.000 m): fırtına, kanada yıldırım, uçak parçalanır, koltuk
//    sırası dönerek ormana düşer. Levha yukarı kayar: kuşbakışı orman, dere boyunca 9 gün, kulübe; 92 kişiden 1.
// B: Virginia; Blue Ridge sırtı ve 1942–1977 zaman ekseni; korucu Roy'a 7 yıldırım. Doruk: 15.300 noktalık ızgarada
//    bir insan (ömür boyu ihtimal) ve aynı noktaya düşen 7 kırmızı yıldırım. Anlatım saattir. Her şey t'nin saf fonksiyonudur.
import { geoInterpolate } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { PLANE_CARD, drawPlane, SEAT_CARD, drawSeat, JULIANE_CARD, drawJuliane, ROY_CARD, drawRoy, drawBolt, boltGlyph, drawCanopy, drawCloud, drawTower, drawTruck, drawCabin, drawHut } from '../yildirim_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const LIMA = [-77.04, -12.05], PUC = [-74.55, -8.38], SHEN = [-78.45, 38.55];
// gökyüzü kesiti: orman tepesi 0 m, uçak 3.000 m
const SKY = { top: 860, ground: 1250 }, Y = m => SKY.ground - m * (SKY.ground - SKY.top) / 3000;
// Roy'un sırtı ve zaman ekseni
const AX = { x0: 130, x1: 860, y: 1100, y0: 1942, y1: 1977 }, yearX = y => lerp(AX.x0, AX.x1, (y - AX.y0) / (AX.y1 - AX.y0));
const ridgeY = x => 975 - 45 * Math.sin(x * 0.006 + 1) - 25 * Math.sin(x * 0.017 + 2) - 10 * Math.sin(x * 0.05);
// ızgara: 180 × 85 = 15.300 nokta
const GRID = { cols: 180, rows: 85, cell: 4.5, x0: 100, y0: 760 }, MARK = { c: 140, r: 50 };
const markP = [GRID.x0 + MARK.c * GRID.cell + 1.5, GRID.y0 + MARK.r * GRID.cell + 1.5];

export function yildirimTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    board: Wd('l02', 'uçağa'), storm: Wd('l03', 'fırtınaya'), bolt: Wd('l03', 'yıldırım'), breakup: Wd('l03', 'parçalanıyor'),
    fall0: Wd('l04', 'koltuğuna'), wake: L.l05.t0, advice: Wd('l06', 'suyu'), creek: Wd('l07', 'dere'), hut: Wd('l08', 'kulübede'), found: Wd('l08', 7), only: Wd('l08', 'uçaktaki'),
    whip0: L.l08.end + 0.25, whip1: L.l09.t0 + 0.6, adam: Wd('l09', 'adam'), day9: L.l08.t0,
    s1: Wd('l11', 'çarpıyor'), again: Wd('l12', 'yine'), s2: Wd('l12', 'kamyonunda'), s3: Wd('l12', 'bahçesinde'), s4: Wd('l12', 'kulübesinde'),
    y77: L.l13.t0, s7: Wd('l13', 'yedinci'), guin: Wd('l14', 'guinness'),
    cmp0: L.l15.t0 - 0.1, odds: Wd('l16', 'ihtimali'), mark: Wd('l16', 'yaklaşık'), tek: Wd('l17', 'tek'), hero: L.l18.t0 - 0.04, ask: L.l19.t0, loop0: tl.loop0,
  };
  T.plateA = L.l03.t0 - 0.55; T.land = L.l04.end + 0.15; T.plan = L.l07.t0 - 0.45; T.plateB = L.l10.t0 + 0.2;
  T.s5 = L.l12.end + 0.15; T.s6 = L.l12.end + 0.8;
  T.strikes = [T.s1, T.s2, T.s3, T.s4, T.s5, T.s6, T.s7];
  return T;
}
// ormandaki gün: uyanış 1. gün; dere boyunca doğrusal; kulübede 9
export function dayAt(T, t) { return t < T.creek ? 1 : t < T.day9 ? Math.min(8, 1 + Math.floor(8 * seg(t, T.creek, T.day9 - T.creek))) : 9; }

export async function makeYildirimRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = yildirimTimes(tl);
  const YEARS = ep.facts.sullivan.strikes;

  // ——— kamera ———
  const S0 = { c: [-76, 8], r: 430, cy: 1110 };
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, r: S0.r * (1 + 0.1 * ease.enter(seg(t, 0, 0.6)) + 0.05 * seg(t, 0.6, L.l02.t0)) }) },
    { t0: L.l02.t0 - 0.3, t1: L.l02.t0 + 1.0, to: t => ({ c: [-75.8, -10.2], r: 2600 * (1 + 0.08 * seg(t, L.l02.t0 + 1.0, T.plateA + 0.8 - L.l02.t0 - 1.0)), cy: 1080 }) },
    { t0: T.whip0, t1: T.whip1, to: t => ({ c: [-78.6, 38.3], r: 2800 * (1 + 0.08 * seg(t, T.whip1, T.plateB + 0.8 - T.whip1)), cy: 1080 }) },
    { t0: T.loop0, t1: D - 0.25, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);
  const flyU = t => 0.8 * ease.state(seg(t, L.l02.t0, T.plateA + 0.75 - L.l02.t0));
  const plate = (t, a, b) => t < a ? 0 : t < b ? ease.state(seg(t, a, 0.75)) : 1 - ease.state(seg(t, b, 0.6));
  const flick = (t, a, d = 0.32) => t >= a - 0.02 && t < a + d && Math.floor((t - a) * 30) % 3 !== 2;
  const rnd = mulberry32(37);

  // ——— gökyüzü kesiti ———
  const clouds = Array.from({ length: 6 }, (_, i) => [i * 250 + rnd() * 80, 752 + rnd() * 40, 0.85 + rnd() * 0.35, 90 + i]);
  const rain = Array.from({ length: 90 }, () => [rnd(), rnd()]);
  function cloudBand(t, y0 = 0) {
    for (const [x, y, sc, sd] of clouds) { const xx = ((x + t * 14) % 1500) - 210; drawCloud(ctx, xx, y + y0, sc, sd); }
  }
  function rainLines(t, y0, y1, a = 0.5) {
    ctx.strokeStyle = `rgba(28,27,24,${a})`; ctx.lineWidth = 1.4;
    for (const [a1, b1] of rain) { const x = ((a1 * 1200 + t * 60) % 1200) - 60, y = y0 + ((b1 * (y1 - y0) + t * 520) % (y1 - y0)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 22); ctx.stroke(); }
  }
  const fallU = t => { const u = seg(t, T.breakup + 0.2, T.land - T.breakup - 0.2); return Math.pow(u, 1.6); };
  const altAt = t => t < T.breakup + 0.2 ? 3000 : 3000 * (1 - fallU(t));
  const planeX = t => t < T.breakup ? lerp(250, 560, seg(t, T.plateA, T.breakup - T.plateA)) : 560 + 60 * seg(t, T.breakup, 2);
  const seatP = t => [560 - 40 * fallU(t) + 10 * Math.sin(t * 2.4) * (1 - fallU(t)), Y(altAt(t)) + 28];
  function section(t) {
    // levha boyunca yavaş yaklaşma (%10)
    const z = 1 + 0.1 * seg(t, T.plateA + 0.75, T.plan - T.plateA - 0.75), zp = p => [540 + (p[0] - 540) * z, 1080 + (p[1] - 1080) * z];
    ctx.translate(540, 1080); ctx.scale(z, z); ctx.translate(-540, -1080);
    rainLines(t, STAGE_TOP, SKY.ground, 0.4);
    cloudBand(t);
    // irtifa cetveli (sağda, Sıfır'ın üstünde biter)
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(900, Y(3000)); ctx.lineTo(900, Y(0)); ctx.stroke();
    setFont(ctx, F.mono(30)); ctx.textAlign = 'right';
    for (let m = 0; m <= 3000; m += 500) { const y = Y(m); ctx.beginPath(); ctx.moveTo(900, y); ctx.lineTo(m % 1000 ? 890 : 880, y); ctx.stroke(); if (m % 1000 === 0 && m > 0) { const s = nf0.format(m) + ' m', w = ctx.measureText(s).width; ctx.fillStyle = C.paper; ctx.fillRect(868 - w - 6, y - 24, w + 12, 34); ctx.fillStyle = C.ink; ctx.fillText(s, 868, y + 2); } }
    // uçak: fırtınada; yıldırım kanada; parçalanıp düşer (orman tepesinin altına inmez)
    const xP = planeX(t), v = seg(t, T.breakup + 0.3, 2.4);
    if (v < 1) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, SKY.ground - STAGE_TOP); ctx.clip();
      ctx.translate(xP + 220 * v, SKY.top + Math.sin(t * 3.1) * 4 * (1 - v) + 640 * v * v); ctx.rotate(0.5 * v);
      drawPlane(ctx, PLANE_CARD, { prop: t * 40, fire: ease.enter(seg(t, T.bolt, 0.4)), wing: Math.pow(seg(t, T.breakup, 1.3), 1.4), split: ease.state(seg(t, T.breakup + 0.15, 0.6)) }, 280);
      ctx.restore();
    }
    if (flick(t, T.bolt)) drawBolt(ctx, xP - 120, 720, xP + 0.02 * 280, SKY.top + 0.05 * 280, 31, { w: 6 });
    // orman tepesi ve koltuk sırası
    drawCanopy(ctx, 0, W, SKY.ground, 71);
    if (t >= T.breakup + 0.2) {
      const [x, y] = seatP(t), landed = t >= T.land;
      if (!landed) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const ox = -50 + i * 20, oy = 40 + ((i * 37 + t * 300) % 120); ctx.beginPath(); ctx.moveTo(x + ox, y - oy - 40); ctx.lineTo(x + ox, y - oy - 90); ctx.stroke(); } }
      const spin = landed ? 0.35 : fallU(t) * Math.PI * 2 * 3.35;
      ctx.save(); ctx.translate(x, y - (landed ? 14 : 0)); drawSeat(ctx, SEAT_CARD, { spin, eyes: t >= T.wake ? 'open' : 'closed' }, 104); ctx.restore();
      // iniş: yaprak kırıntıları
      if (landed && t < T.land + 0.8) { const u = seg(t, T.land, 0.8); ctx.fillStyle = C.ink; for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 13), r = 30 + 130 * u; ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r + 160 * u * u, 6, 4); } }
    }
    return zp(t >= T.breakup + 0.2 ? seatP(t) : [xP, SKY.top]);
  }

  // ——— kuşbakışı orman: dere, 9 gün, kulübe ———
  const crowns = []; for (let i = 0; i < 170; i++) { const x = rnd() * 1140 - 30, y = 690 + rnd() * 820, R = 16 + rnd() * 12; crowns.push([x, y, R], [x + R * 0.8, y + R * 0.3, R * 0.7], [x - R * 0.5, y + R * 0.7, R * 0.65]); }
  const catmull = (P, n = 10) => { const out = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)]; for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3))); } } out.push(P.at(-1)); return out; };
  const CK0 = [[210, 800], [290, 870], [250, 960], [350, 1030], [470, 1010], [560, 1080], [520, 1160], [600, 1230], [660, 1250]];
  const RIVER0 = [[660, 1250], [760, 1290], [900, 1320], [1100, 1340]];
  const CK = catmull(CK0), RIVER = catmull(RIVER0);
  const HUT = [700, 1222];
  function polyAt(P, u) {
    const ls = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); ls.push(l); tot += l; }
    let d = tot * clamp01(u); for (let i = 1; i < P.length; i++) { if (d <= ls[i - 1] || i === P.length - 1) { const f = clamp01(d / ls[i - 1]); return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f), Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])]; } d -= ls[i - 1]; }
    return [...P.at(-1), 0];
  }
  function water(P, w0, w1, t) {
    for (let i = 1; i < P.length; i++) { const w = lerp(w0, w1, i / (P.length - 1)); ctx.beginPath(); ctx.moveTo(P[i - 1][0], P[i - 1][1]); ctx.lineTo(P[i][0], P[i][1]); ctx.lineCap = 'round'; ctx.lineWidth = w + 6; ctx.strokeStyle = C.ink; ctx.stroke(); }
    for (let i = 1; i < P.length; i++) { const w = lerp(w0, w1, i / (P.length - 1)); ctx.beginPath(); ctx.moveTo(P[i - 1][0], P[i - 1][1]); ctx.lineTo(P[i][0], P[i][1]); ctx.lineWidth = w; ctx.strokeStyle = '#F4EEE1'; ctx.stroke(); }
    // akıntı: kesik çizgiler aşağı akar
    ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.setLineDash([10, 16]); ctx.lineDashOffset = -t * 34; ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  }
  function chip(text, x, y, align = 'center', size = 32) {
    setFont(ctx, F.mono(size)); const w = ctx.measureText(text).width, bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = C.paper; ctx.fillRect(bx - 8, y - size + 2, w + 16, size + 12); ctx.fillStyle = C.ink; ctx.textAlign = align; ctx.fillText(text, x, y);
  }
  const julU = t => 0.06 + 0.94 * seg(t, T.creek, T.hut - T.creek);
  function plan(t) {
    const z = 1 + 0.12 * seg(t, T.plan, T.whip0 - T.plan);
    ctx.translate(460, 1060); ctx.scale(z, z); ctx.translate(-460, -1060);
    // ağaç tepeleri
    ctx.fillStyle = C.ink; for (const [x, y, r] of crowns) { ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#F4EEE1'; for (const [x, y, r] of crowns) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(28,27,24,0.6)'; ctx.lineWidth = 1; for (const [x, y, r] of crowns) { ctx.beginPath(); ctx.arc(x - r * 0.1, y - r * 0.1, r * 0.72, 0.05 * Math.PI, 0.7 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(x - r * 0.15, y - r * 0.15, r * 0.45, 0.1 * Math.PI, 0.6 * Math.PI); ctx.stroke(); }
    water(CK, 14, 30, t); water(RIVER, 34, 46, t);
    // düşüş yeri: koltuk sırası
    ctx.save(); ctx.translate(CK[0][0] - 6, CK[0][1] - 18); drawSeat(ctx, SEAT_CARD, { spin: 0.35, eyes: 'open' }, 34); ctx.restore();
    // geçilen günler: dere boyunca noktalar
    const d = dayAt(T, t);
    for (let k = 1; k <= Math.min(d, 8); k++) { const p = polyAt(CK, 0.06 + 0.94 * (k - 1) / 8); ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    // kulübe ve ormancılar
    ctx.save(); ctx.translate(HUT[0], HUT[1]); drawHut(ctx, 86); ctx.restore();
    if (t >= T.hut) chip('KULÜBE', 600, 1150, 'right');
    if (t >= T.found) { const u = ease.enter(seg(t, T.found, 0.8)), cx = lerp(980, 790, u); ctx.save(); ctx.translate(cx, 1304 + Math.sin(t * 2) * 2); ctx.beginPath(); ctx.ellipse(0, 0, 62, 12, -0.12, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); for (const x of [-24, 20]) { ctx.beginPath(); ctx.arc(x, -14, 8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); } ctx.restore(); }
    // Juliane: dere boyunca suyun içinde yürür
    const p = polyAt(CK, t < T.creek ? 0.06 : julU(t)), moving = t >= T.creek && t < T.hut;
    ctx.beginPath(); ctx.ellipse(p[0], p[1] - 44, 30, 62, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(236,229,213,0.85)'; ctx.fill();
    ctx.save(); ctx.translate(p[0], p[1] + 8); if (Math.cos(p[2]) < -0.2) ctx.scale(-1, 1);
    drawJuliane(ctx, JULIANE_CARD, { phase: moving ? t * 6.5 : 0 }, 112);
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(p[0], p[1] + 6, 30, 9, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(p[0], p[1] + 6, 40 + 6 * Math.sin(t * 4), 13, 0, 0.1, Math.PI - 0.1); ctx.lineWidth = 1.4; ctx.strokeStyle = C.graphite; ctx.stroke();
    if (t < T.hut) chip('DERE', 360, 930, 'left');
    // 92 kişiden 1
    if (t >= T.only - 0.1) {
      const k = ease.enter(seg(t, T.only - 0.1, 0.4)), y0 = lerp(1100, 850, k);
      ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.5);
      ctx.beginPath(); ctx.roundRect(262, y0, 556, 206, 14); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('UÇAKTAKİ 92 KİŞİ', 290, y0 + 46);
      for (let i = 0; i < 92; i++) { const x = 296 + (i % 23) * 22, y = y0 + 82 + Math.floor(i / 23) * 24; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); if (i === 0) { ctx.fillStyle = C.ink; ctx.fill(); } else { ctx.lineWidth = 1.8; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.fillText('HAYATTA KALAN: 1', 290, y0 + 192);
      ctx.restore();
    }
    return [460 + (p[0] - 460) * z, 1060 + (p[1] - 40 - 1060) * z];
  }
  function plateA(t, k) {
    if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    // kesit → plan: içerik yukarı kayar (düşüşün yönü sürer)
    const v = ease.state(seg(t, T.plan, 0.8)), H = 1920 - STAGE_TOP;
    let at = null;
    if (v < 1) { ctx.save(); ctx.translate(0, -H * v); at = section(t); if (at) at = [at[0], at[1] - H * v]; ctx.restore(); }
    if (v > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP + H * (1 - v), W, H); ctx.clip(); ctx.translate(0, H * (1 - v)); const a2 = plan(t); ctx.restore(); if (v >= 1) at = a2; }
    ctx.restore();
    return at;
  }

  // ——— Roy: sırt, zaman ekseni, 7 yıldırım ———
  // varış: [zaman, x] — Roy bir sonraki çarpma yerine yürür
  const ARR = [[T.plateB, yearX(1942)], [T.s2 - 0.25, yearX(1969)], [T.s3 - 0.2, yearX(1970)], [T.s4 - 0.2, yearX(1972)], [T.s5 - 0.05, yearX(1973)], [T.s6 - 0.05, yearX(1976)], [T.y77 + 0.6, yearX(1977) - 26]];
  const DEP = [null, T.again + 0.3, T.s2 + 0.5, T.s3 + 0.5, T.s4 + 0.4, T.s5 + 0.05, T.s6 + 0.5];
  function royX(t) {
    let x = ARR[0][1], moving = false;
    for (let i = 1; i < ARR.length; i++) { const a = Math.min(DEP[i], ARR[i][0] - 0.1), b = ARR[i][0]; if (t >= b) x = ARR[i][1]; else if (t >= a) { x = lerp(ARR[i - 1][1], ARR[i][1], ease.state(seg(t, a, b - a))); moving = true; break; } else break; }
    return { x, moving };
  }
  const strikeN = t => T.strikes.filter(s => t >= s).length;
  function plateB(t, k) {
    if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    const z = 1 + 0.1 * seg(t, T.plateB + 0.75, T.cmp0 - T.plateB - 0.75);
    ctx.translate(560, 1080); ctx.scale(z, z); ctx.translate(-560, -1080);
    cloudBand(t, -15);
    // sırtlar (Blue Ridge): iki arka sıra grafit, ön sırt mürekkep; hepsi taralı
    for (const [dy, amp, col, gap, ph] of [[-95, 0.7, C.graphite, 9, 2.1], [-45, 0.85, C.graphite, 7, 4.2], [0, 1, C.ink, 6, 0]]) {
      const ry = x => dy + 975 - amp * (45 * Math.sin(x * 0.006 + 1 + ph) + 25 * Math.sin(x * 0.017 + 2 + ph) + 10 * Math.sin(x * 0.05 + ph));
      const yy = dy === 0 ? ridgeY : ry;
      ctx.beginPath(); ctx.moveTo(-20, AX.y - 10); for (let x = -20; x <= W + 20; x += 10) ctx.lineTo(x, yy(x)); ctx.lineTo(W + 20, AX.y - 10); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.strokeStyle = dy === 0 ? 'rgba(28,27,24,0.32)' : 'rgba(139,133,119,0.4)'; ctx.lineWidth = 1; for (let d = -1400; d < 1400; d += gap) { ctx.beginPath(); ctx.moveTo(d, 820); ctx.lineTo(d + 300, AX.y); ctx.stroke(); } ctx.restore();
      ctx.beginPath(); for (let x = -20; x <= W + 20; x += 10) (x === -20 ? ctx.moveTo(x, yy(x)) : ctx.lineTo(x, yy(x))); ctx.lineWidth = dy === 0 ? 3 : 2; ctx.strokeStyle = col; ctx.stroke();
    }
    // zaman ekseni 1942 → 1977
    ctx.beginPath(); ctx.moveTo(AX.x0, AX.y); ctx.lineTo(AX.x1, AX.y); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let y = 1945; y <= 1975; y += 5) { const x = yearX(y); ctx.beginPath(); ctx.moveTo(x, AX.y - 8); ctx.lineTo(x, AX.y + 8); ctx.lineWidth = 1.5; ctx.stroke(); }
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    for (const y of [1942, 1960, 1977]) ctx.fillText(String(y), yearX(y), AX.y + 40);
    const n = strikeN(t);
    for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(yearX(YEARS[i]), AX.y, 7, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    // durum simgesi (Roy'un solunda) ve Roy
    const { x, moving } = royX(t), gy = ridgeY(x);
    // durum simgeleri çarpma yerinde durur (Roy'un solunda); belirirken yerden büyür
    const SITS = [[-1, T.s2 - 0.45, 'tower', yearX(1942)], [T.s2 - 0.45, T.s3 - 0.4, 'truck', yearX(1969)], [T.s3 - 0.4, T.s4 - 0.4, 'yard', yearX(1970)], [T.s4 - 0.4, T.s5 - 0.3, 'cabin', yearX(1972)], [T.y77, 1e9, 'fish', yearX(1977) - 26]];
    let sit = null;
    for (const [a, b, kd, sx] of SITS) {
      if (t < a || t >= b) continue; sit = kd; if (kd === 'fish') continue;
      const g = a < 0 ? 1 : ease.enter(seg(t, a, 0.3)), gx = sx - 82;
      ctx.save(); ctx.translate(gx, ridgeY(gx) + 4); ctx.scale(1, g);
      if (kd === 'tower') drawTower(ctx, 190); else if (kd === 'truck') drawTruck(ctx, 130); else if (kd === 'cabin') drawCabin(ctx, 116);
      else { ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-50 + i * 24, 0); ctx.lineTo(-50 + i * 24, -40); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-58, -14); ctx.lineTo(56, -14); ctx.moveTo(-58, -30); ctx.lineTo(56, -30); ctx.stroke(); }
      ctx.restore();
    }
    if (sit === 'fish') { ctx.beginPath(); ctx.ellipse(x + 58, ridgeY(x + 58) + 14, 44, 12, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(x + 58, ridgeY(x + 58) + 14, 14 + 14 * ((t * 0.8 + i * 0.5) % 1), 4, 0, 0, Math.PI * 2); ctx.lineWidth = 1.2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    const jolt = T.strikes.reduce((a, s) => Math.max(a, t >= s && t < s + 0.45 ? 1 - seg(t, s, 0.45) : 0), 0);
    const fire = t >= T.s4 && t < T.s4 + 1.5 ? 1 - seg(t, T.s4 + 1.1, 0.4) : 0;
    ctx.save(); ctx.translate(x, gy + 2); drawRoy(ctx, ROY_CARD, { phase: t * 7, walk: moving ? 1 : 0, fish: sit === 'fish' ? ease.enter(seg(t, T.y77, 0.6)) : 0, fire, jolt, t }, 150); ctx.restore();
    T.strikes.forEach((s, i) => { if (flick(t, s, 0.34)) drawBolt(ctx, x - 40 + 30 * Math.sin(i * 2.3), 770, x + 2, gy - 158, 200 + i, { w: 5 }); });
    // çetele: 7 yıldırım yuvası
    for (let i = 0; i < 7; i++) { const f = i < n; boltGlyph(ctx, 400 + i * 62, 1262, 58, f ? C.ink : C.graphite, f); }
    ctx.restore();
    return [560 + (x - 560) * z, 1080 + (gy - 70 - 1080) * z];
  }

  // ——— doruk: 15.300 nokta, 7 kırmızı yıldırım ———
  const heroBolts = Array.from({ length: 7 }, (_, i) => [markP[0] + (i - 3) * 78 + (i % 2 ? 18 : -10), 712 + (i % 3) * 14]);
  function climax(t) {
    if (t < T.cmp0 || t >= T.loop0 + 0.6) return null;
    const k = ease.state(seg(t, T.cmp0, 0.6)) * (1 - ease.state(seg(t, T.loop0, 0.6)));
    ctx.save();
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k);
    ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k); ctx.clip();
    const z = 1 + 0.16 * seg(t, T.cmp0 + 0.6, T.loop0 - T.cmp0 - 0.6);
    ctx.translate(markP[0], markP[1]); ctx.scale(z, z); ctx.translate(-markP[0], -markP[1]);
    const cols = Math.floor(GRID.cols * ease.state(seg(t, T.cmp0 + 0.3, 1.6)));
    ctx.fillStyle = C.graphite;
    for (let c = 0; c < cols; c++) for (let r = 0; r < GRID.rows; r++) ctx.fillRect(GRID.x0 + c * GRID.cell, GRID.y0 + r * GRID.cell, 2.2, 2.2);
    const red = t >= T.hero - 0.02 && t < T.ask;
    if (t >= T.mark) {
      const u = ease.enter(seg(t, T.mark, 0.5));
      ctx.fillStyle = C.paper; ctx.fillRect(markP[0] - 9, markP[1] - 9, 18, 18);
      ctx.fillStyle = red ? C.red : C.ink; ctx.fillRect(markP[0] - 5, markP[1] - 5, 10, 10);
      ctx.beginPath(); ctx.arc(markP[0], markP[1], 22, -2.2, -2.2 + Math.PI * 2.15 * u); ctx.lineWidth = 3; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke();
    }
    if (t >= T.hero - 0.02) {
      heroBolts.forEach(([bx, by], i) => { const a = T.hero + i * 0.07; if (t < a) return; if (t < a + 0.2 && Math.floor((t - a) * 30) % 3 === 2) return; drawBolt(ctx, bx, by, markP[0], markP[1] - 8, 400 + i, { w: 5, color: red ? C.red : C.ink, branches: 1, jitter: 0.1 }); });
    }
    ctx.restore();
    // ölçek notu yakınlaşmanın dışında, ızgaranın sol üstünde sabit
    if (cols > 0 && t < T.ask && k > 0.99) chip('1 NOKTA = 1 İNSAN', GRID.x0 + 10, 800, 'left', 30);
    return markP;
  }

  // ——— büyüteç ———
  const drops = Array.from({ length: 24 }, () => [rnd(), rnd()]);
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0 || !kind) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    const rr = 130;
    const rainIn = (a = 0.6) => { ctx.strokeStyle = `rgba(28,27,24,${a})`; ctx.lineWidth = 1.6; for (const [a1, b1] of drops) { const x = -rr + a1 * 2 * rr + ((t * 60) % 40), y = -rr + ((b1 * 2 * rr + t * 380) % (2 * rr)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 20); ctx.stroke(); } };
    const ground = (y = 92) => { ctx.beginPath(); ctx.moveTo(-rr, y); ctx.lineTo(rr, y); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); };
    if (kind === 'cabin') {
      // kabin içi: pencerede fırtına; iki koltuk, anne ve kız (yandan); türbülansta sarsıntı
      const sh = t >= T.storm ? Math.sin(t * 23) * 3 : 0;
      ctx.translate(0, sh);
      ctx.beginPath(); ctx.ellipse(60, -40, 34, 48, 0, 0, Math.PI * 2); ctx.fillStyle = t >= T.storm ? C.ink : '#F4EEE1'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      if (t >= T.storm) { ctx.save(); ctx.beginPath(); ctx.ellipse(60, -40, 32, 46, 0, 0, Math.PI * 2); ctx.clip(); if (flick(t, T.bolt, 0.4)) drawBolt(ctx, 50, -100, 72, 10, 9, { w: 4, color: '#F4EEE1', halo: false, branches: 1 }); ctx.strokeStyle = 'rgba(244,238,225,0.6)'; ctx.lineWidth = 1.4; for (const [a1, b1] of drops.slice(0, 10)) { const x = 30 + a1 * 60, y = -90 + ((b1 * 100 + t * 300) % 100); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 14); ctx.stroke(); } ctx.restore(); }
      for (const [x, long] of [[-78, false], [-12, true]]) {
        ctx.beginPath(); ctx.roundRect(x - 34, -64, 24, 150, 10); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
        ctx.beginPath(); ctx.roundRect(x - 12, -8, 40, 70, 12); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 8, -32, 19, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 8, -32, 19, Math.PI * 0.55, Math.PI * 1.6); ctx.lineTo(x + 14, -46); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
        if (long) { ctx.fillRect(x - 11, -34, 12, 34); }
        ctx.beginPath(); ctx.arc(x + 20, -34, 2.6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      }
    } else if (kind === 'seat') {
      // düşen koltuk: rüzgâr çizgileri yukarı akar
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { const x = -110 + i * 27, y = 130 - ((i * 53 + ((t / D * 90) % 1) * 260) % 260); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 40); ctx.stroke(); }
      ctx.save(); ctx.rotate(Math.sin(2 * Math.PI * t / D * 8) * 0.5); drawSeat(ctx, SEAT_CARD, { spin: 0, eyes: 'closed' }, 150); ctx.restore();
    } else if (kind === 'wake') {
      rainIn(0.35);
      ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(-130, -60); ctx.quadraticCurveTo(-40, -90, 30, -130); ctx.moveTo(130, -20); ctx.quadraticCurveTo(70, -60, 40, -130); ctx.stroke();
      ground(96); ctx.save(); ctx.translate(-6, 40); drawSeat(ctx, SEAT_CARD, { spin: 0.25, eyes: (t - T.wake) % 2.6 < 0.14 ? 'closed' : 'open' }, 150); ctx.restore();
    } else if (kind === 'note') {
      // babasının öğüdü: kâğıt not ve akan su
      ctx.save(); ctx.rotate(-0.06); ctx.beginPath(); ctx.rect(-96, -96, 192, 92); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.name(40)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('SUYU BUL', 0, -36); ctx.restore();
      ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; for (let row = 0; row < 4; row++) { const y = 30 + row * 20, off = (t * 46) % 40; ctx.beginPath(); for (let x = -rr - 40 + off; x < rr + 40; x += 4) { const yy = y + Math.sin((x - off) * 0.12 + row) * 4; x === -rr - 40 + off ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-40, 112); ctx.lineTo(40, 112); ctx.lineTo(28, 102); ctx.moveTo(40, 112); ctx.lineTo(28, 122); ctx.lineWidth = 3; ctx.stroke();
    } else if (kind === 'wade' || kind === 'hut') {
      // yağmur ormanı: arkada gövdeler; önde su; Juliane yürür (su dizlerinde)
      ctx.lineWidth = 3; ctx.strokeStyle = C.graphite; for (const x0 of [-100, -40, 70, 110]) { const x = kind === 'wade' ? ((((x0 + 130 - t * 18) % 260) + 260) % 260) - 130 : x0; ctx.beginPath(); ctx.moveTo(x, -130); ctx.lineTo(x, 60); ctx.stroke(); }
      if (kind === 'hut') { ctx.save(); ctx.translate(70, 58); drawHut(ctx, 140); ctx.restore(); }
      ctx.save(); ctx.translate(kind === 'hut' ? -40 : -10, 96); drawJuliane(ctx, JULIANE_CARD, { phase: kind === 'wade' ? t * 6.5 : 0 }, 190); ctx.restore();
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-rr, 58, 2 * rr, 80);
      ctx.lineWidth = 2; ctx.strokeStyle = C.ink; for (let row = 0; row < 3; row++) { const y = 62 + row * 18, off = (t * 40) % 40; ctx.beginPath(); for (let x = -rr - 40 - off; x < rr + 40; x += 4) { const yy = y + Math.sin((x + off) * 0.14 + row + t * 2) * 3; x === -rr - 40 - off ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
    } else if (kind === 'roy' || kind === 'roybolt' || kind === 'tally' || kind === 'person') {
      ground(100);
      const breathe = Math.sin(2 * Math.PI * t / D * 28) * 0.01;
      ctx.save(); ctx.translate(0, 100); ctx.scale(1, 1 + breathe); drawRoy(ctx, ROY_CARD, { phase: 0, walk: 0, t }, 196); ctx.restore();
      if (kind === 'roybolt') drawBolt(ctx, -60, -130, 4, -104, 77, { w: 5, branches: 1 });
      if (kind === 'tally') for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + 0.76 * i / 6); boltGlyph(ctx, Math.cos(a) * 110, 10 + Math.sin(a) * 110, 30, C.ink, true); }
      if (kind === 'person' && t >= T.hero - 0.02) { const red = t < T.ask; for (let i = 0; i < 7; i++) { const a = T.hero + i * 0.07; if (t < a) continue; drawBolt(ctx, -110 + i * 34, -130, 4, -104, 500 + i, { w: 4, color: red ? C.red : C.ink, branches: 0, jitter: 0.12 }); } }
    } else if (kind === 'tower' || kind === 'truck' || kind === 'yard' || kind === 'cabin2' || kind === 'fish') {
      ground(100);
      const sIdx = { tower: 0, truck: 1, yard: 2, cabin2: 3, fish: 6 }[kind], ts = T.strikes[sIdx];
      if (kind === 'tower') { ctx.save(); ctx.translate(-60, 100); drawTower(ctx, 230); ctx.restore(); }
      if (kind === 'truck') { ctx.save(); ctx.translate(-20, 100); drawTruck(ctx, 190); ctx.restore(); }
      if (kind === 'cabin2') { ctx.save(); ctx.translate(-50, 100); drawCabin(ctx, 170); ctx.restore(); }
      if (kind === 'yard') { ctx.lineWidth = 3; ctx.strokeStyle = C.ink; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-120 + i * 26, 100); ctx.lineTo(-120 + i * 26, 40); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-130, 60); ctx.lineTo(20, 60); ctx.moveTo(-130, 80); ctx.lineTo(20, 80); ctx.stroke(); }
      if (kind === 'fish') { ctx.beginPath(); ctx.ellipse(70, 104, 80, 16, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
      const jolt = t >= ts && t < ts + 0.45 ? 1 - seg(t, ts, 0.45) : 0, fire = kind === 'cabin2' && t >= ts ? 1 : 0;
      const rx = kind === 'truck' ? 70 : kind === 'fish' ? -30 : 50;
      ctx.save(); ctx.translate(rx, 100); drawRoy(ctx, ROY_CARD, { phase: 0, walk: 0, fish: kind === 'fish' ? 1 : 0, fire, jolt, t }, 170); ctx.restore();
      if (flick(t, ts, 0.4)) drawBolt(ctx, rx - 50, -130, rx + 4, -76, 300 + sIdx, { w: 5, branches: 1 });
    } else if (kind === 'plane1') {
      ctx.save(); ctx.translate(0, 30); drawPlane(ctx, PLANE_CARD, { prop: t * 40, fire: 0 }, 230); ctx.restore();
      drawBolt(ctx, -30, -130, 4, 40, 61, { w: 5, branches: 1 });
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  // takvim: [başlangıç, tür]; her değişimde büyüteç tamamen kapanır, sonra yenisi açılır (0,25 + 0,25 sn)
  function sched(t, list) {
    for (let i = list.length - 1; i >= 1; i--) {
      const b = list[i][0];
      if (t >= b - 0.25 && t < b + 0.25) { const u = (t - (b - 0.25)) / 0.5; return u < 0.5 ? { kind: list[i - 1][1], k: list[i - 1][1] ? 1 - ease.exit(u * 2) : 0 } : { kind: list[i][1], k: list[i][1] ? ease.enter((u - 0.5) * 2) : 0 }; }
      if (t >= b + 0.25) return { kind: list[i][1], k: 1 };
    }
    return { kind: list[0][1], k: 1 };
  }
  const S1 = [[0, 'seat'], [L.l02.t0, 'cabin'], [L.l04.t0, 'seat'], [T.wake, 'wake'], [L.l06.t0, 'note'], [T.creek, 'wade'], [T.hut, 'hut'], [T.whip0 - 0.2, null],
    [T.adam - 0.1, 'roy'], [L.l11.t0, 'tower'], [T.s2 - 0.3, 'truck'], [T.s3 - 0.3, 'yard'], [T.s4 - 0.3, 'cabin2'], [T.y77, 'fish'], [T.guin, 'tally'], [T.cmp0, null],
    [T.mark, 'person'], [T.ask, 'seat']];
  const S2 = [[0, 'roybolt'], [L.l02.t0, null], [T.tek, 'plane1'], [T.ask, 'roybolt']];

  // ——— Sıfır ———
  const blinkR = mulberry32(59); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.storm, 'ayakta', 'dusunceli'], [T.bolt, 'sasirma', 'saskin'], [T.bolt + 1.6, 'ayakta', 'dusunceli'], [T.found, 'ayakta', 'notr'], [T.only, 'ayakta', 'dusunceli'],
    [T.s1, 'sasirma', 'saskin'], [T.s1 + 1.4, 'ayakta', 'notr'], [T.s4, 'sasirma', 'saskin'], [T.s4 + 1.6, 'ayakta', 'dusunceli'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.s4 + 0.2, T.s4 + 1.6, 'Yine mi?!', 222], [T.hero + 0.1, T.hero + 1.8, '7 kez mi?!', 310]];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text, dy] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - dy;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    // bölünmüş cümle (l17 + l18): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l18' ? L.l17.text + ' ' + ln.text : ln.id === 'l17' ? "Juliane'nin uçağına tek bir yıldırım düştü. Ya Roy?" : ln.text;
    const p = ln.id === 'l18' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50; setFont(ctx, F.name(fs0)); let ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0);
    for (const f2 of [44, 40, 36]) { if (ls.length <= (f2 === 44 ? 2 : 3)) break; fs0 = f2; setFont(ctx, F.name(fs0)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); }
    const lh = fs0 * 1.22, y0 = ls.length > 2 ? 420 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42)); revealText(ctx, '3 km yükseklikten düşüp yaşayan kız mı,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, '7 kez yıldırım çarpan adam mı?', SAFE.x0, 690, 42, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  const YR = t => t >= T.y77 ? 1977 : t >= T.s6 ? 1976 : t >= T.s5 ? 1973 : t >= T.s4 ? 1972 : t >= T.s3 ? 1970 : t >= T.s2 ? 1969 : 1942;
  const SIT = t => t >= T.guin ? 'GUINNESS REKORU' : t >= T.y77 ? 'BALIK TUTARKEN' : t >= T.s5 ? 'DEVRİYEDE' : t >= T.s4 ? 'KULÜBESİNDE' : t >= T.s3 ? 'BAHÇESİNDE' : t >= T.s2 ? 'KAMYONUNDA' : 'GÖZETLEME KULESİ';
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pA = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < L.l09.t0 - 0.06) {
      const lab = 'JULIANE KOEPCKE · 17 YAŞINDA';
      if (t < T.breakup + 0.2) row({ label: lab, num: '1971', unit: '', right1: t >= T.bolt ? 'KANADA YILDIRIM' : 'LANSA 508', right2: t >= T.storm ? 'FIRTINADA' : 'PERU · 24 ARALIK', p: pA });
      else if (t < T.wake) { const a = altAt(t), m = a > 0 ? Math.max(0, Math.round(a / 10) * 10) : 0; row({ label: lab, num: nf0.format(m), unit: 'm', right1: t < T.fall0 ? 'UÇAK PARÇALANIYOR' : 'KOLTUĞUNA BAĞLI', right2: t >= T.land ? 'YAĞMUR ORMANI' : 'DÜŞÜYOR', p: pA }); }
      else { const d = dayAt(T, t); row({ label: lab, num: d + '. gün', unit: '', right1: t >= T.only ? '92 KİŞİDEN 1' : t >= T.found ? 'BULUNDU' : 'ORMANDA TEK BAŞINA', right2: t >= T.only ? 'TEK KURTULAN' : t >= T.hut ? 'ORMANCILARIN KULÜBESİ' : t >= T.creek ? 'DERE BOYUNCA' : 'KÖPRÜCÜK KEMİĞİ KIRIK', p: pA }); }
      return;
    }
    if (t < T.cmp0) {
      const before = t < L.l11.t0 - 0.06;
      row({ label: 'ROY SULLIVAN · KORUCU', num: String(strikeN(t)), unit: 'yıldırım', right1: before ? 'SHENANDOAH' : 'YIL: ' + YR(t), right2: before ? 'ABD' : SIT(t), p: Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) {
      const cols = Math.floor(GRID.cols * ease.state(seg(t, T.cmp0 + 0.3, 1.6)));
      row({ label: t >= T.odds ? 'ÖMÜR BOYU YILDIRIM ÇARPMA İHTİMALİ' : 'HER NOKTA BİR İNSAN', num: t >= T.odds ? "15.300'de 1" : nf0.format(cols * GRID.rows), unit: t >= T.odds ? '' : 'insan', right1: t >= T.tek ? "JULIANE'NİN UÇAĞI" : '', right2: t >= T.tek ? '1 YILDIRIM' : '', p: ease.enter(seg(t, T.cmp0, 0.35)) });
      return;
    }
    if (t < T.ask) { row({ label: 'ROY SULLIVAN, TEK BİR İNSAN', num: '7', unit: 'kez', red: true, right1: "JULIANE'NİN UÇAĞI: 1", right2: "İHTİMAL: 15.300'DE 1" }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Juliane mi, Roy mu?', SAFE.x0, 672, 80, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    G.draw();
    let at = null;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // Peru: uçak Lima'dan Pucallpa'ya doğru
    if (t >= L.l02.t0 - 0.3 && t < T.plateA + 0.8) {
      const u = flyU(t), gi = geoInterpolate(LIMA, PUC), p = gi(u), p2 = gi(Math.min(1, u + 0.02));
      const trail = []; for (let i = 0; i <= 24; i++) trail.push(gi(u * i / 24));
      G.line(trail, { w: 4, dash: [10, 7] }); G.line([p, PUC], { w: 2, color: C.graphite, dash: [4, 8] });
      G.placeLabel(PUC, 'PUCALLPA', seg(t, L.l02.t0 + 0.6, 0.4), 20, -16, C.ink, 'left');
      if (G.visible(p)) { const q = G.proj(p), q2 = G.proj(p2), ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]); ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(ang); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, 0, 64, 22, 0, 0, Math.PI * 2); ctx.fill(); drawPlane(ctx, PLANE_CARD, { prop: t * 40 }, 120); ctx.restore(); at = q; }
    }
    if (t >= L.l02.t0 - 0.3 && t < T.plateA + 0.8) { G.placeLabel(LIMA, 'LIMA', seg(t, L.l02.t0, 0.4), 26, 14, C.ink, 'right'); G.placeLabel([-73.0, -10.4], 'PERU', seg(t, L.l02.t0 + 0.3, 0.4), 0, 0, C.graphite, 'center', false); }
    if (t >= L.l09.t0 - 0.1 && t < T.plateB + 0.8) { G.ringAt(SHEN, seg(t, L.l09.t0, 0.6), 40); G.placeLabel(SHEN, 'SHENANDOAH · ABD', seg(t, L.l09.t0, 0.4), 22, -18); at = G.visible(SHEN) ? G.proj(SHEN) : at; }
    if (t < L.l02.t0 || t >= T.loop0 + 0.4) G.placeLabel([-78.5, 38.0], 'ABD', t >= T.loop0 ? seg(t, T.loop0 + 0.4, 0.35) : 1, 20, -16);
    ctx.restore();
    const aA = plateA(t, plate(t, T.plateA, T.whip0 - 0.3)); if (aA) at = aA;
    const aB = plateB(t, plate(t, T.plateB, T.cmp0 + 0.6)); if (aB && t >= T.plateB + 0.4) at = aB;
    const aC = climax(t); if (aC) at = aC;
    // büyüteçler
    const r1 = sched(t, S1), r2 = sched(t, S2);
    const lead = t >= L.l02.t0 && t < T.ask ? at : null;
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, ROUND, r1.k, lead);
    if (r2.kind && r2.k > 0.02) roundel(t, r2.kind, ROUND2, r2.k, null);
    // kare 0 ve döngü: "3 km" / "7 YILDIRIM"; soru: JULIANE / ROY
    if (t < L.l02.t0 || t >= T.loop0 + 0.3) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.loop0 + 0.3, 0.4));
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kk; ctx.fillRect(ROUND.x - 62, 1084, 124, 42); ctx.fillRect(482 - 112, 1096, 224, 42); ctx.globalAlpha = 1;
      revealText(ctx, '3 km', ROUND.x, 1116, 34, kk, C.ink, 'center'); revealText(ctx, '7 YILDIRIM', 482, 1128, 34, kk, C.ink, 'center');
    }
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.3)) : 1;
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(ROUND.x - 82, 1084, 164, 42); ctx.fillRect(482 - 52, 1096, 104, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'JULIANE', ROUND.x, 1116, 34, kin * kout, C.ink, 'center'); revealText(ctx, 'ROY', 482, 1128, 34, kin * kout, C.ink, 'center');
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

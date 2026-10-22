// "Kaya" şablonu (Hangisi daha şaşırtıcı?): dağı yaran adam ve dağın altındaki 33 kişi.
// A: Hindistan'a yaklaşılır; kâğıt levhada kuşbakışı dağ (eş yükselti çizgileri), dağı dolanan 55 km'lik yol, Manjhi'nin
//    22 yılda açtığı yarık; mesafe 15 km'ye iner. B: Şili; dikey kesit (0–700 m, yanında Burç Halife), 33 kişilik sığınak,
//    17 gün sessizlik, sondaj ucu ve not, kapsülle kurtarma. Sonda izometrik kaya blokları: matkabın 250 m³'lük küpü,
//    Manjhi'nin yarığını doldurmak için ~30 kez basılır. Anlatım saattir. Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { MANJHI_CARD, drawManjhi, drawCapsule, drawNote } from '../kaya_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const GEHLAUR = [85.25, 24.87], COPIAPO = [-70.33, -27.37];
// dikey kesit: yüzey ve sığınak (700 m)
const SH = { y0: 790, y1: 1380 }, PXM = (SH.y1 - SH.y0) / 700;

export function kayaTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    fall: Wd('l02', 'düşüp'), road: Wd('l03', 'dolanıp'), start: Wd('l04', 'çekiç'), years0: L.l05.t0, open: Wd('l06', 'açıyor'), km15: Wd('l06', 'kilometreye') - 0.4,
    whip0: L.l06.end + 0.25, whip1: L.l07.t0 + 0.6, collapse: Wd('l08', 'çöküyor'), deep: Wd('l08', 'derinde'),
    silent0: L.l09.t0, probe: L.l10.t0, note: Wd('l10', 'sığınaktayız'), rescue: Wd('l11', 'kapsülle'), cmp0: L.l12.t0 - 0.1,
    drill: Wd('l13', 'matkap'), hero: L.l14.t0 - 0.04, after: L.l15.t0, ask: L.l16.t0, loop0: tl.loop0,
  };
  T.plateA = T.fall - 0.6; T.plateB = T.collapse - 0.5; T.rescued = L.l11.end + 0.6; T.stamp0 = T.drill + 0.45;
  return T;
}

export async function makeKayaRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = kayaTimes(tl), Fx = ep.facts;
  const yearAt = t => lerp(Fx.manjhi.start, Fx.manjhi.end, seg(t, T.years0, T.open - T.years0));
  const cutU = t => seg(t, T.start, T.open - T.start);

  // ——— kamera (yalnız konum için kısa küre anları) ———
  const S0 = { c: [80, 22], r: 430, cy: 1110 };
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, c: [80 + 4 * seg(t, 0, T.plateA), 22 + 1.5 * seg(t, 0, T.plateA)], r: S0.r * (1 + 1.6 * ease.state(seg(t, 0.6, T.plateA - 0.6))) }) },
    { t0: T.whip0, t1: T.whip1, to: t => ({ c: [-70 + 8 * seg(t, T.cmp0, T.loop0 - T.cmp0), -26], r: 1500 * (1 + 0.08 * seg(t, T.whip1, T.plateB - T.whip1) + 0.1 * seg(t, T.cmp0, T.loop0 - T.cmp0)), cy: 1080 }) },
    { t0: T.loop0, t1: D - 0.08, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);

  // levha: alttan kayarak gelir (nesneyle geçiş), çıkışta aşağı iner
  const plate = (t, a, b) => t < a ? 0 : t < b ? ease.state(seg(t, a, 0.75)) : 1 - ease.state(seg(t, b, 0.6));
  const rnd = mulberry32(35);
  // dağ: tohumlu gürültüyle bozulmuş iç içe eş yükselti halkaları (dikey uzanan sırt)
  const ridge = Array.from({ length: 7 }, (_, k) => { const n = 64, pts = []; const ph = rnd() * 6; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr = 1 - k * 0.13; const w = (150 + 18 * Math.sin(a * 3 + ph) + 10 * Math.sin(a * 7 + ph * 2)) * rr, h = (300 + 30 * Math.sin(a * 2 + ph)) * rr; pts.push([540 + Math.cos(a) * w, 1060 + Math.sin(a) * h]); } return pts; });
  const VA = { x: 170, y: 1060 }, VB = { x: 910, y: 1060 }, CUT = { x0: 380, x1: 700, y: 1060 };
  const loopPath = [[VA.x, VA.y], [230, 1200], [360, 1330], [540, 1352], [720, 1330], [850, 1200], [VB.x, VB.y]];
  function polyLen(P, u) { const segL = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); segL.push(l); tot += l; } let d = tot * u; ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) { if (d >= segL[i - 1]) { ctx.lineTo(P[i][0], P[i][1]); d -= segL[i - 1]; } else { const f = d / segL[i - 1]; ctx.lineTo(lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)); break; } } }
  function plateMountain(t, k) {
    if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    // levha boyunca yarığa doğru yavaş yaklaşma (%9): plan hiçbir karede donmaz
    { const z = 1 + 0.09 * seg(t, T.plateA + 0.75, T.whip0 - T.plateA - 0.75); ctx.translate(540, 1060); ctx.scale(z, z); ctx.translate(-540, -1060); }
    // dağ: dıştan içe sıklaşan tarama + eş yükselti çizgileri
    ridge.forEach((P, kk) => {
      ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      if (kk === 0) { ctx.fillStyle = '#F4EEE1'; ctx.fill(); }
      ctx.lineWidth = kk === 0 ? 2.6 : 1.4; ctx.strokeStyle = kk === 0 ? C.ink : C.graphite; ctx.stroke();
    });
    ctx.save(); ctx.beginPath(); ridge[2].forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1; for (let d = -800; d < 800; d += 7) { ctx.beginPath(); ctx.moveTo(540 + d - 400, 660); ctx.lineTo(540 + d + 400, 1460); ctx.stroke(); } ctx.restore();
    // köyler
    for (const [v, name, al] of [[VA, 'GEHLAUR', 'left'], [VB, 'KASABA', 'right']]) {
      ctx.fillStyle = C.ink; for (let i = 0; i < 5; i++) ctx.fillRect(v.x - 22 + (i % 3) * 16, v.y - 14 + Math.floor(i / 3) * 16, 11, 11);
      setFont(ctx, F.mono(32)); ctx.textAlign = al; ctx.fillStyle = C.paper; const tw = ctx.measureText(name).width; ctx.fillRect(al === 'left' ? v.x - 30 : v.x + 30 - tw - 8, v.y - 76, tw + 8, 40); ctx.fillStyle = C.ink; ctx.fillText(name, al === 'left' ? v.x - 26 : v.x + 26, v.y - 46);
    }
    // eski yol: dağı dolanır (55 km)
    const ru = ease.state(seg(t, T.road, 1.2));
    if (ru > 0) { ctx.beginPath(); polyLen(loopPath, ru); ctx.setLineDash([12, 9]); ctx.lineWidth = 4; ctx.strokeStyle = t >= T.km15 ? C.graphite : C.ink; ctx.stroke(); ctx.setLineDash([]); if (ru > 0.6) { setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.fillRect(470, 1360, 140, 44); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('55 km', 540, 1394); } }
    // yarık: 22 yılda dağın içinden ilerler
    const cu = cutU(t), cx1 = lerp(CUT.x0, CUT.x1, cu);
    if (cu > 0) { ctx.fillStyle = C.paper; ctx.fillRect(CUT.x0, CUT.y - 16, cx1 - CUT.x0, 32); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(CUT.x0, CUT.y - 16); ctx.lineTo(cx1, CUT.y - 16); ctx.moveTo(CUT.x0, CUT.y + 16); ctx.lineTo(cx1, CUT.y + 16); ctx.stroke(); }
    // yeni yol (15 km)
    if (t >= T.km15 - 0.2) { const u = ease.state(seg(t, T.km15 - 0.2, 0.7)); ctx.beginPath(); ctx.moveTo(VA.x + 30, VA.y); ctx.lineTo(lerp(VA.x + 30, VB.x - 30, u), VB.y); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke(); if (u > 0.8) { setFont(ctx, F.mono(34)); ctx.textAlign = 'center'; ctx.fillStyle = C.paper; ctx.fillRect(220, 1090, 140, 44); ctx.fillRect(470, 1090, 140, 44); ctx.fillStyle = C.ink; ctx.fillText('15 km', 290, 1124); ctx.fillText('110 m', 540, 1124); } }
    // Manjhi yarığın ucunda vurur
    let at = null;
    if (t >= T.start && t < T.km15) { ctx.save(); ctx.translate(cx1 - 30, CUT.y + 14); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -36, 34, 44, 0, 0, Math.PI * 2); ctx.fill(); drawManjhi(ctx, MANJHI_CARD, { swing: Math.abs(Math.sin(t * Math.PI * 1.6)) }, 90); ctx.restore(); at = [cx1 - 18, CUT.y]; }
    ctx.restore();
    return at;
  }
  // dikey kesit (Şili)
  const men = Array.from({ length: 33 }, (_, i) => [430 + (i % 11) * 19 + (Math.floor(i / 11) % 2) * 9, SH.y1 - 10 - Math.floor(i / 11) * 13]);
  const burj = [[0, 0], [0, -1], [0.06, -1], [0.06, -0.86], [0.12, -0.86], [0.12, -0.66], [0.2, -0.66], [0.2, -0.42], [0.3, -0.42], [0.3, -0.2], [0.4, -0.2], [0.4, 0]];
  function plateSection(t, k) {
    if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    // levha boyunca sığınağa doğru yavaş yaklaşma (%10)
    { const z = 1 + 0.16 * seg(t, T.plateB + 0.75, T.drill - T.plateB - 0.75); ctx.translate(520, 1300); ctx.scale(z, z); ctx.translate(-520, -1300); }
    // kaya: çapraz tarama; yüzey çizgisi; çöl
    ctx.save(); ctx.beginPath(); ctx.rect(0, SH.y0, 760, 1920 - SH.y0); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.3)'; ctx.lineWidth = 1; for (let d = -1400; d < 1400; d += 8) { ctx.beginPath(); ctx.moveTo(d, SH.y0); ctx.lineTo(d + 1200, SH.y0 + 1200); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, SH.y0); ctx.lineTo(760, SH.y0); ctx.lineTo(760, 1920); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // Burç Halife: sığınak seviyesinden yukarı (828 m) — derinliğin ölçeği
    ctx.save(); ctx.translate(670, SH.y1); ctx.scale(150, 828 * PXM); ctx.beginPath(); burj.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.restore();
    ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
    // etiket kesitin içinde (kulenin tepesi yüzeyi 128 m aşar; üst bantta kalmasın)
    setFont(ctx, F.mono(28)); ctx.textAlign = 'left'; ctx.fillStyle = C.graphite; ctx.fillText('BURÇ HALİFE', 778, SH.y0 + 66); ctx.fillText('828 m', 778, SH.y0 + 98);
    // derinlik cetveli
    const AX = 760; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    setFont(ctx, F.mono(30)); ctx.textAlign = 'left';
    for (let m = 0; m <= 700; m += 100) { const y = SH.y0 + m * PXM; ctx.beginPath(); ctx.moveTo(AX, y); ctx.lineTo(AX + 16, y); ctx.stroke(); if (m % 200 === 0 && m <= 200) { ctx.fillStyle = C.ink; ctx.fillText(m + ' m', AX + 24, y + 10); } }
    // maden kuyusu (çöken galeri) ve sığınak
    ctx.fillStyle = C.paper; ctx.fillRect(380, SH.y0, 26, SH.y1 - SH.y0 - 20);
    ctx.beginPath(); ctx.moveTo(380, SH.y0); ctx.lineTo(380, SH.y1 - 20); ctx.moveTo(406, SH.y0); ctx.lineTo(406, SH.y1 - 20); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    if (t >= T.collapse) { const u = ease.enter(seg(t, T.collapse, 0.6)); ctx.fillStyle = C.ink; for (let i = 0; i < 9; i++) { const y = SH.y0 + 240 + i * 22 * u; ctx.beginPath(); ctx.moveTo(376, y); ctx.lineTo(410, y + 10); ctx.lineTo(402, y + 18); ctx.lineTo(378, y + 12); ctx.closePath(); ctx.fill(); } }
    ctx.beginPath(); ctx.roundRect(400, SH.y1 - 52, 250, 60, 10); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    setFont(ctx, F.mono(24)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center'; ctx.fillText('SIĞINAK (ölçeksiz)', 525, SH.y1 + 34);
    const saved = t < T.rescue ? 0 : Math.floor(33 * ease.state(seg(t, T.rescue, T.rescued - T.rescue)));
    if (t >= T.deep) men.forEach(([x, y], i) => { if (i < saved) return; ctx.beginPath(); ctx.arc(x, y - 4, 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); });
    // başlık çerçevesi (yüzeyde)
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(370, SH.y0); ctx.lineTo(393, SH.y0 - 70); ctx.lineTo(416, SH.y0); ctx.moveTo(393, SH.y0 - 70); ctx.lineTo(393, SH.y0); ctx.stroke();
    // sondaj ucu: yüzeyden sığınağa (17. gün), not yukarı çıkar
    const px = 560;
    let at = [525, SH.y1 - 22];
    if (t >= T.silent0) {
      const u = ease.state(seg(t, T.silent0, T.probe - T.silent0)), yb = lerp(SH.y0, SH.y1 - 52, u);
      ctx.beginPath(); ctx.moveTo(px, SH.y0); ctx.lineTo(px, yb); ctx.lineWidth = t >= T.rescue - 0.3 ? 9 : 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 6, yb); ctx.lineTo(px + 6, yb); ctx.lineTo(px, yb + 12); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
      if (t >= T.probe && t < T.rescue) { const v = ease.state(seg(t, T.probe + 0.2, T.note - T.probe)), ny = lerp(SH.y1 - 60, SH.y0 - 20, v); ctx.save(); ctx.translate(px + 26, ny); drawNote(ctx, 44, null); ctx.restore(); at = [px + 26, ny]; }
      if (t >= T.rescue && t < T.rescued + 0.8) { const ph = ((t - T.rescue) * 0.9) % 1, cy = lerp(SH.y1 - 40, SH.y0 - 30, ph < 0.5 ? ph * 2 : 2 - ph * 2); ctx.save(); ctx.translate(px, cy); drawCapsule(ctx, 46); ctx.restore(); at = [px, cy]; }
    }
    ctx.restore();
    return at;
  }

  // ——— izometrik kaya blokları ———
  const ISO = { x0: 150, y0: 1090, s: 10 };   // 1 m = 12,2 px (küp 77 px)
  const iso = (x, y, z) => [ISO.x0 + (x + y * 0.55) * ISO.s, ISO.y0 - (z + y * 0.32) * ISO.s];
  function box(x, y, z, a, b, c, fill, ink = C.ink, lw = 2) {
    const P = (i, j, k) => iso(x + i * a, y + j * b, z + k * c);
    const faces = [[P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)]];
    faces.forEach((f, i) => { ctx.beginPath(); f.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = fill[i]; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke(); });
  }
  function blocks(t) {
    if (t < T.drill - 0.6 || t >= T.loop0 + 0.6) return;
    // soru anında levha çekilir (etiketler bloğa binmesin)
    const k = ease.state(seg(t, T.drill - 0.6, 0.6)) * (1 - ease.state(seg(t, T.loop0, 0.6)));
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k);
    if (k < 0.9) return;
    // kıyas boyunca bloğa doğru yavaş yaklaşma (%10): sahne hiçbir karede donmaz
    ctx.save(); const z = 1 + 0.14 * seg(t, T.drill, T.loop0 - T.drill), zc = ISO.x0 + 340;
    ctx.translate(zc, ISO.y0); ctx.scale(z, z); ctx.translate(-zc, -ISO.y0);
    const cube = Math.cbrt(Fx.chile.holeVolumeM3), hero = t >= T.hero - 0.02, red = hero && t < T.ask;
    // tek matkap küpü solda üstte; Manjhi'nin kayası aynı küplerden bir duvar: 31 küp (8 × 4, son sırada 7)
    const WALL = { x: 3.0, cols: 8, n: 31 };
    const c0 = ease.enter(seg(t, T.drill - 0.2, 0.5));
    if (c0 > 0) {
      // matkap küpü duvarın sol üstünde, yazısı sağında
      const cz = 4 * cube + 3 + 4 * (1 - c0); box(WALL.x, 0, cz, cube, cube, cube, ['#F4EEE1', '#E6DCC6', '#FFFFFF'], C.ink, 2.5);
      const cp = iso(WALL.x + cube, 0, cz + cube * 0.5); setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('MATKAP: 1 küp = 250 m³', cp[0] + 34, cp[1] + 10);
    }
    // basılan küpler: hızlanarak (u·(0,35 + 0,65u)), doruktan önceki sessizlikte tamamlanır
    const u = clamp01((t - T.stamp0) / Math.max(0.6, T.hero - T.stamp0)), n = hero ? WALL.n : Math.min(WALL.n, Math.floor(WALL.n * u * (0.35 + 0.65 * u)));
    for (let i = 0; i < n; i++) {
      const col = i % WALL.cols, row = Math.floor(i / WALL.cols);
      box(WALL.x + col * cube, 0, row * cube, cube, cube, cube, red ? ['rgba(224,57,28,0.88)', 'rgba(224,57,28,0.72)', 'rgba(224,57,28,0.58)'] : ['#F4EEE1', '#E6DCC6', '#FFFFFF'], red ? C.paper : C.ink, 1.8);
    }
    if (n > 0) {
      const ep2 = iso(WALL.x + WALL.cols * cube, 0, 4 * cube);
      const lp = iso(WALL.x, 0, 0); if (t < T.ask) setFont(ctx, F.mono(38)); else ctx.font = '0px a'; ctx.fillStyle = red ? C.red : C.ink; ctx.textAlign = 'left'; ctx.fillText(nf0.format(n) + ' küp' + (hero ? ' ≈ 7.700 m³' : ''), lp[0], lp[1] + 46); void ep2;
    }
    ctx.restore();
  }

  // ——— büyüteç ———
  const chips = Array.from({ length: 10 }, () => [rnd(), rnd(), rnd()]);
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'slope') {
      // dik yamaç ve kırık su testisi (kişi yok)
      ctx.beginPath(); ctx.moveTo(-130, -40); ctx.lineTo(130, 90); ctx.lineTo(130, 130); ctx.lineTo(-130, 130); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.moveTo(-130, -40); ctx.lineTo(130, 90); ctx.lineTo(130, 130); ctx.lineTo(-130, 130); ctx.closePath(); ctx.clip(); ctx.lineWidth = 1; for (let d = -300; d < 300; d += 7) { ctx.beginPath(); ctx.moveTo(d, -60); ctx.lineTo(d + 120, 140); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.translate(30, 44); ctx.rotate(0.45); ctx.beginPath(); ctx.ellipse(0, 0, 26, 22, 0, 0.3, Math.PI * 1.7); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(-30, 18); ctx.rotate(-0.4); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(10, -8); ctx.lineTo(14, 8); ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke(); ctx.restore();
    } else if (kind === 'hammer') {
      // kaya yüzü sağda; vuruşta yonga sıçrar (döngüsel)
      ctx.beginPath(); ctx.rect(50, -130, 90, 260); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.rect(50, -130, 90, 260); ctx.clip(); ctx.lineWidth = 1.2; for (let d = -300; d < 300; d += 7) { ctx.beginPath(); ctx.moveTo(d, -140); ctx.lineTo(d + 140, 140); ctx.stroke(); } ctx.restore();
      ctx.beginPath(); ctx.moveTo(-130, 92); ctx.lineTo(50, 92); ctx.lineWidth = 2.5; ctx.stroke();
      const sw = Math.abs(Math.sin(t * Math.PI * 1.6)), hit = (t * 1.6) % 1;
      ctx.save(); ctx.translate(-36, 92); drawManjhi(ctx, MANJHI_CARD, { swing: sw }, 190); ctx.restore();
      if (hit < 0.35) for (const [a, b, c] of chips) { const u = hit / 0.35, x = 48 - u * (30 + a * 50), y = -14 - u * (20 + b * 40) + u * u * 60; ctx.fillStyle = C.ink; ctx.fillRect(x, y, 4 + c * 4, 3 + c * 3); }
    } else if (kind === 'refuge' || kind === 'refuge33' || kind === 'note' || kind === 'capsule') {
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-130, -130, 260, 260);
      ctx.save(); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(28,27,24,0.5)'; for (let d = -300; d < 300; d += 7) { ctx.beginPath(); ctx.moveTo(d, -140); ctx.lineTo(d + 140, 140); ctx.stroke(); } ctx.restore();
      ctx.beginPath(); ctx.roundRect(-110, -10, 220, 90, 14); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      if (kind === 'note') { ctx.save(); ctx.translate(0, -40); drawNote(ctx, 220, 'SIĞINAKTAYIZ,\n33 KİŞİ İYİYİZ', F.name(26)); ctx.restore(); }
      else if (kind === 'capsule') { const ph = ((t - T.rescue) * 0.9) % 1, cy = lerp(40, -150, ph < 0.5 ? ph * 2 : 2 - ph * 2); ctx.save(); ctx.translate(0, cy); drawCapsule(ctx, 120); ctx.restore(); }
      const saved = kind === 'refuge33' || t < T.rescue ? 0 : Math.floor(33 * ease.state(seg(t, T.rescue, T.rescued - T.rescue)));
      for (let i = 0; i < 33; i++) { if (i < saved) continue; const x = -96 + (i % 11) * 19, y = 18 + Math.floor(i / 11) * 22; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(57); const blinks = []; for (let b = 1.4; b < D; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.fall, 'sasirma', 'saskin'], [T.fall + 1.4, 'ayakta', 'dusunceli'], [T.years0, 'ayakta', 'sayiyor'], [T.km15, 'sasirma', 'mutlu'],
    [T.collapse, 'sasirma', 'saskin'], [T.collapse + 1.6, 'ayakta', 'dusunceli'], [T.note, 'sasirma', 'mutlu'], [T.note + 1.8, 'ayakta', 'notr'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[L.l05.t0 + 0.3, L.l05.t0 + 1.8, 'Deli mi?!'], [T.note + 0.2, T.note + 1.8, 'Yaşıyorlar!'], [T.hero + 0.1, T.hero + 1.8, '31 küp mü?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - 310;
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
    const txt = ln.id === 'l14' ? L.l13.text + ' ' + ln.text : ln.id === 'l13' ? 'Kurtarma kuyusu için dev bir matkap, yaklaşık 250 m³ kaya deldi. Ya Manjhi?' : ln.text;
    const p = ln.id === 'l14' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50; setFont(ctx, F.name(fs0)); let ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0);
    if (ls.length > 2) { fs0 = 44; setFont(ctx, F.name(fs0)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); }
    const lh = fs0 * 1.22, y0 = ls.length > 2 ? 420 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42)); revealText(ctx, 'Dağı 22 yılda elle yaran adam mı,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, '700 metre derinde 69 gün bekleyen 33 kişi mi?', SAFE.x0, 690, 42, k, C.ink);
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
    if (t < L.l07.t0 - 0.06) {
      const y = t < T.start ? 1959 : t < T.years0 ? 1960 : Math.floor(yearAt(t)), kmNow = t >= T.km15 ? Math.round(lerp(55, 15, ease.state(seg(t, T.km15, 0.8)))) : 55;
      row({ label: 'DASHRATH MANJHI · KÖYLÜ', num: String(y), unit: '', right1: 'YOL: ' + kmNow + ' km', right2: t >= T.start ? 'ÇEKİÇ VE KESKİ' : 'GEHLAUR, HİNDİSTAN', p: Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) });
      return;
    }
    if (t < T.cmp0) {
      const day = t < T.silent0 ? 0 : t < T.probe ? Math.floor(17 * seg(t, T.silent0, T.probe - T.silent0)) : t < L.l11.t0 - 0.06 ? 17 : 69;
      const saved = t < T.rescue ? 0 : Math.floor(33 * ease.state(seg(t, T.rescue, T.rescued - T.rescue)));
      row({ label: '33 MADENCİ · ŞİLİ', num: String(day), unit: 'gün', right1: '700 m DERİNDE', right2: t >= T.rescue ? 'KURTARILAN: ' + saved : t >= T.note ? 'HEPSİ HAYATTA' : t >= T.silent0 ? 'SES YOK' : 'SAN JOSÉ MADENİ', p: Math.max(0.35, ease.enter(seg(t, L.l07.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) { row({ label: 'AYNI KAYAYLA · MATKAP', num: t >= T.drill ? '250' : '0', unit: 'm³', right1: 'MANJHI: ?', right2: '', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.ask) { row({ label: 'MANJHI, ELLERİYLE', num: '7.700', unit: 'm³', red: true, right1: 'MATKAP: 250 m³', right2: '30 KATTAN FAZLA' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(68)); revealText(ctx, 'Manjhi mi, madenciler mi?', SAFE.x0, 670, 68, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    G.draw();
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    if (t < T.plateA + 0.8 || t >= T.loop0 + 0.4) G.placeLabel(GEHLAUR, 'HİNDİSTAN', t >= T.loop0 ? seg(t, T.loop0 + 0.4, 0.35) : 1, 20, -16);
    if (t >= T.whip1 - 0.2 && t < T.plateB + 0.8) G.placeLabel(COPIAPO, 'ŞİLİ', seg(t, T.whip1, 0.4), 20, -16);
    ctx.restore();
    const atA = plateMountain(t, plate(t, T.plateA, T.whip0 - 0.3));
    const atB = plateSection(t, plate(t, T.plateB, T.drill + 0.1));
    blocks(t);
    // büyüteç
    let kind = null, rk = 1, at = null;
    const cutT = L.l07.t0 - 0.06;
    if (t >= L.l02.t0 && t < T.start) kind = 'slope'; else if (t >= T.start && t < cutT) { kind = 'hammer'; at = atA; }
    else if (t >= T.deep && t < T.note) { kind = 'refuge'; at = atB; } else if (t >= T.note && t < T.rescue) { kind = 'note'; at = atB; } else if (t >= T.rescue && t < T.cmp0) { kind = 'capsule'; at = atB; }
    if (t >= cutT - 0.3 && t < cutT + 0.3) { const u = seg(t, cutT - 0.3, 0.6); rk = u < 0.5 ? 1 - ease.exit(u * 2) : 0; }
    if (kind === 'refuge') rk = Math.min(rk, ease.enter(seg(t, T.deep, 0.45)));
    if (t >= T.cmp0 && t < T.cmp0 + 0.3) { kind = 'capsule'; rk = 1 - ease.exit(seg(t, T.cmp0, 0.3)); }
    if (kind && rk > 0.02) roundel(t, kind, ROUND, rk, at);
    if (t >= T.after && t < T.ask) roundel(t, 'hammer', ROUND, ease.enter(seg(t, T.after, 0.45)) * (1 - ease.exit(seg(t, T.ask - 0.3, 0.3))));
    if (t < L.l02.t0) roundel(t, 'refuge33', ROUND2, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)));
    if (t < L.l02.t0 || t >= T.ask) roundel(t, 'hammer', ROUND, 1);
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.6)) : 1;
      roundel(t, 'refuge33', ROUND2, kin);
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(482 - 112, 1096, 224, 42); ctx.fillRect(ROUND.x - 72, 1084, 144, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'MADENCİLER', 482, 1128, 34, kin * kout, C.ink, 'center'); revealText(ctx, 'MANJHI', ROUND.x, 1116, 34, kin * kout, C.ink, 'center');
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

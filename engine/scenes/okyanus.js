// "Okyanus" şablonu (Hangisi daha şaşırtıcı?): okyanusta hayatta kalmak — yatay ve dikey.
// A: balıkçı Alvarenga'nın teknesi gravür kürede Meksika'dan Marşal Adaları'na 438 gün sürüklenir.
// B: kâğıt levha yukarı kayar, deniz kesiti: römorkör alabora olur, 30 m dibe iner; aşçı Okene hava cebinde 60 saat;
//    dalgıcın lambası karanlığı yarar, iki el birbirini tutar. Sonda 438 günlük takvimde Okene'nin 2,5 günü kırmızı.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { geoInterpolate } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { BOAT_CARD, drawBoat, TUG_CARD, drawTug, OKENE_CARD, drawOkene, DIVER_CARD, drawDiver, drawHands } from '../okyanus_chars.js';
import { buildYolTimeline, densify, pointAt, slice } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
// deniz kesitinde büyüteç sağ üstte, gövdenin üstündeki açık suda (derinlik cetvelini örtmez)
const ROUND_SEA = { x: 812, y: 936, r: 108 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// sürüklenme (şematik): Chiapas kıyısı → Pasifik boyunca batıya → Ebon Atolü (Marşal Adaları)
const DRIFT = [[-93.35, 15.55], [-97, 13.5], [-110, 12.2], [-125, 11.0], [-140, 10.2], [-155, 9.0], [-170, 7.4], [178, 6.0], [168.65, 4.6]];
const WRECK = [4.55, 4.75];   // Escravos açıkları (şematik), denizde
// deniz kesiti: yüzey ve dip (30 m)
const SEA = { y0: 830, y1: 1360 }, PXM = (SEA.y1 - SEA.y0) / 30;

export function okyanusTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    sail: Wd('l02', 'açılıyor'), storm: Wd('l03', 'fırtına'), drift0: Wd('l03', 'sürükleniyor'), eat: L.l04.t0, friend: Wd('l05', 'arkadaşını'),
    land: Wd('l06', 'adaya'), whip0: L.l06.end + 0.25, whip1: L.l07.t0 + 0.6,
    capsize: Wd('l08', 'alabora'), sunk: Wd('l08', 'batıyor', 't1') + 0.5, pocket: Wd('l09', 'hava'), dark: L.l10.t0,
    diver: L.l11.t0, hand: Wd('l11', 'el'), grip: Wd('l12', 'tutuyor'), cmp0: L.l13.t0 - 0.1, fill0: L.l14.t0, fill1: Wd('l14', 'sürüklendi', 't1'),
    hero: L.l15.t0 - 0.04, after: L.l16.t0, ask: L.l17.t0, loop0: tl.loop0,
  };
  T.sect0 = T.capsize - 0.5;
  return T;
}

export async function makeOkyanusRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = okyanusTimes(tl), Fx = ep.facts;
  const DR = densify(DRIFT, 80);

  // ——— takvim: gün sayısı yolculuk boyunca doğrusal; tekne aynı oranla ilerler ———
  // açılıştan fırtınaya kadar ilk gün (kısa av); sürüklenme 'sürükleniyor' kelimesinde başlar, inişte 438
  const dayU = t => t < T.drift0 ? seg(t, T.sail, T.drift0 - T.sail) / Fx.alvarenga.days : lerp(1 / Fx.alvarenga.days, 1, seg(t, T.drift0, T.land - T.drift0));
  const boatS = t => DR.at(-1).km * dayU(t);
  const boatP = t => pointAt(DR, boatS(t));
  const hours = t => Fx.okene.hours * seg(t, T.pocket, L.l11.t0 - T.pocket);   // "60 saat sonra" cümlesinde 60

  // ——— kamera ———
  const S0 = { c: [-118, 12], r: 430, cy: 1110 };
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, r: S0.r * (1 + 0.12 * ease.enter(seg(t, 0, 0.6)) + 0.06 * seg(t, 0.6, T.sail)) }) },
    { t0: T.sail - 0.3, t1: T.sail + 0.9, to: t => ({ c: [-95, 14], r: 1350 * (1 + 0.06 * seg(t, T.sail + 0.9, T.drift0 - T.sail)), cy: 1080 }) },
    { t0: T.drift0 - 0.2, t1: T.drift0 + 1.4, to: t => ({ c: geoInterpolate(boatP(t - 0.4), [-150, 10])(0.35), r: 560, cy: 1090 }) },
    { t0: T.land - 0.9, t1: T.land + 0.4, to: t => ({ c: [166, 6], r: 1100 * (1 + 0.06 * seg(t, T.land + 0.4, T.whip0 - T.land)), cy: 1080 }) },
    { t0: T.whip0, t1: T.whip1, to: t => ({ c: [6, 5], r: 1700 * (1 + 0.15 * seg(t, T.whip1, T.sect0 - T.whip1)), cy: 1080 }) },
    { t0: T.loop0, t1: D - 0.08, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);

  // ——— deniz kesiti (kâğıt levha) ———
  const rnd = mulberry32(34), sand = Array.from({ length: 160 }, () => [rnd(), rnd()]);
  const sectK = t => t < T.sect0 ? 0 : t < T.cmp0 + 0.6 ? ease.state(seg(t, T.sect0, 0.75)) : 0;
  const TUG = { x: 600, size: 400 };
  function tugPose(t) {
    // yüzeyde → alabora (180°) → dibe iner; ters gövde süperstrüktürü üzerine oturur
    const r = Math.PI * ease.state(seg(t, T.capsize, 0.9));
    const y = lerp(SEA.y0 + 6, SEA.y1 - TUG.size * 0.36, ease.state(seg(t, T.capsize + 0.5, T.sunk - T.capsize - 0.5)));
    return { r, y };
  }
  function section(t, k) {
    if (k <= 0) return;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip();
    ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    // kesit boyunca gövdeye doğru yavaş yaklaşma (%10)
    { const z = 1 + 0.1 * seg(t, T.sect0 + 0.75, T.cmp0 - T.sect0 - 0.75); ctx.translate(600, 1200); ctx.scale(z, z); ctx.translate(-600, -1200); }
    // gökyüzü kâğıt; deniz: derinleştikçe sıklaşan yatay çizgiler (gravürde koyuluk = sıklık, gradyan yok)
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2;
    for (let y = SEA.y0 + 4, g = 9; y < SEA.y1; y += g, g = Math.max(4.2, g - 0.09)) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // yüzey: hafif dalgalı çizgi (sürekli hareket)
    ctx.beginPath(); for (let x = 0; x <= W; x += 8) { const y = SEA.y0 + Math.sin(x * 0.03 + t * 2.2) * 3; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // dip: kum noktalaması
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(0, SEA.y1, W, 1920 - SEA.y1);
    ctx.beginPath(); ctx.moveTo(0, SEA.y1); ctx.lineTo(W, SEA.y1); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.fillStyle = C.ink; for (const [a, b] of sand) ctx.fillRect(a * W, SEA.y1 + 8 + b * 90, 2, 2);
    // derinlik cetveli
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    ctx.beginPath(); ctx.moveTo(SAFE.x0, SEA.y0); ctx.lineTo(SAFE.x0, SEA.y1); ctx.stroke();
    for (let m = 0; m <= 30; m += 5) { const y = SEA.y0 + m * PXM; ctx.beginPath(); ctx.moveTo(SAFE.x0, y); ctx.lineTo(SAFE.x0 + (m % 10 ? 10 : 20), y); ctx.stroke(); if (m % 10 === 0) { ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 26, y - 22, 86, 30); ctx.fillStyle = C.ink; ctx.fillText(m + ' m', SAFE.x0 + 30, y + 2); } }
    // römorkör
    const p = tugPose(t);
    ctx.save(); ctx.translate(TUG.x, p.y); drawTug(ctx, TUG_CARD, { roll: p.r, mast: p.r < 2 }, TUG.size); ctx.restore();
    // hava cebi işareti: ters gövdede kesit penceresi (inişten sonra)
    const pk = ease.enter(seg(t, T.pocket, 0.5));
    const PK = { x: TUG.x + 30, y: p.y - TUG.size * 0.1 };
    if (pk > 0 && t >= T.sunk - 0.2) {
      ctx.save(); ctx.beginPath(); ctx.rect(PK.x - 26, PK.y - 16, 52, 30); ctx.fillStyle = C.ink; ctx.fill();
      ctx.fillStyle = C.paper; ctx.fillRect(PK.x - 22, PK.y - 12, 44, 9 * pk); ctx.restore();
      ctx.beginPath(); ctx.arc(PK.x, PK.y, 38 + 6 * (1 - pk), 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      if (t < T.hand - 0.8) { setFont(ctx, F.mono(30)); ctx.fillStyle = C.paper; const lbl = 'HAVA CEBİ · 1,2 m', tw = ctx.measureText(lbl).width; ctx.fillRect(PK.x - 52 - tw, PK.y - 30, tw + 12, 40); ctx.fillStyle = C.ink; ctx.fillText(lbl, PK.x - 46 - tw, PK.y); }
    }
    // dalgıç: yüzeyden iner, lambasının ışığı karanlığı yarar
    if (t >= T.diver - 0.2 && t < T.cmp0) {
      const u = ease.state(seg(t, T.diver, T.hand - T.diver));
      const dx = lerp(250, TUG.x - TUG.size * 0.56, u), dy = lerp(SEA.y0 + 40, PK.y + 52, u);
      // gövdenin yan açıklığı (ters dönmüş güverte kapısı): dalgıç oraya yanaşır
      ctx.beginPath(); ctx.rect(TUG.x - TUG.size * 0.5, PK.y + 34, 26, 36); ctx.fillStyle = C.ink; ctx.fill();
      // ışık: başından hava cebine doğru, uzunluğu varışa göre (içeriye vurur)
      { const hx = dx + 40, hy = dy - 4, ang = Math.atan2(PK.y - hy, PK.x - hx), L = Math.min(240, Math.hypot(PK.x - hx, PK.y - hy)) * (0.6 + 0.4 * u);
        ctx.save(); ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(ang - 0.28) * L, hy + Math.sin(ang - 0.28) * L); ctx.lineTo(hx + Math.cos(ang + 0.28) * L, hy + Math.sin(ang + 0.28) * L); ctx.closePath(); ctx.fillStyle = 'rgba(244,238,225,0.92)'; ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.translate(dx, dy); drawDiver(ctx, DIVER_CARD, { phase: t * 1.4 }, 160); ctx.restore();
      ctx.beginPath(); ctx.moveTo(dx - 10, SEA.y0); ctx.lineTo(dx - 4, dy - 8); ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    return PK;
  }

  // ——— takvim ızgarası: 438 hücre (24 × 19), Alvarenga mürekkep, Okene kırmızı 2,5 hücre ———
  const GR = { cols: 22, cell: 28, gap: 4, x0: SAFE.x0, y0: 790 };   // 22 × 20: 438 hücrenin hepsi, x 90–794, y 790–1430
  function calendar(t) {
    if (t < T.cmp0 || t >= T.loop0 + 0.7) return;
    const k = ease.state(seg(t, T.cmp0, 0.6)) * (1 - ease.state(seg(t, T.loop0, 0.7)));
    ctx.save(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k);
    // kıyas boyunca kırmızı hücrelere doğru yavaş yaklaşma (%8): takvim hiçbir karede donmaz
    ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    const z = 1 + 0.12 * seg(t, T.cmp0 + 0.6, T.loop0 - T.cmp0 - 0.6), zx = GR.x0 + 352, zy = GR.y0 + 320;
    ctx.translate(zx, zy); ctx.scale(z, z); ctx.translate(-zx, -zy);
    const n = Math.floor(Fx.alvarenga.days * ease.state(seg(t, T.fill0, T.fill1 - T.fill0)));
    const step = GR.cell + GR.gap;
    for (let i = 0; i < Fx.alvarenga.days; i++) {
      const x = GR.x0 + (i % GR.cols) * step, y = GR.y0 + Math.floor(i / GR.cols) * step;
      if (y + GR.cell > STAGE_TOP + (1920 - STAGE_TOP) * k) continue;
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.strokeRect(x + 0.5, y + 0.5, GR.cell, GR.cell);
      if (i < n) { ctx.fillStyle = C.ink; ctx.fillRect(x + 3, y + 3, GR.cell - 5, GR.cell - 5); }
    }
    if (t >= T.hero - 0.02 && t < T.loop0) {
      // DORUK: Okene'nin 60 saati = 2,5 gün: iki tam hücre ve yarım hücre kırmızı
      const pop = spring(t - T.hero, 120, 24);
      for (let i = 0; i < 3; i++) {
        const x = GR.x0 + i * step, y = GR.y0, w = i < 2 ? GR.cell : GR.cell / 2;
        ctx.fillStyle = C.paper; ctx.fillRect(x + 1, y + 1, GR.cell - 1, GR.cell - 1);
        ctx.fillStyle = C.red; ctx.fillRect(x + 3 - 2 * pop, y + 3 - 2 * pop, w - 5 + 4 * pop, GR.cell - 5 + 4 * pop);
      }
      setFont(ctx, F.mono(38)); ctx.textAlign = 'left'; const ol = '↓ OKENE: 2,5 gün', ow = ctx.measureText(ol).width; ctx.fillStyle = C.paper; ctx.fillRect(GR.x0 - 6, GR.y0 - 50, ow + 16, 44); ctx.fillStyle = C.red; ctx.fillText(ol, GR.x0, GR.y0 - 16);
    }
    ctx.restore();
  }

  // ——— büyüteç ———
  const drops = Array.from({ length: 26 }, () => [rnd(), rnd()]);
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    const rr = 124;
    if (kind === 'boat' || kind === 'storm' || kind === 'island') {
      const storm = kind === 'storm', amp = storm ? 12 : 5;
      // gökyüzü: gün–gece döngüsü (güneş ve ay yay çizer; her tur bir gün)
      const ph = ((t - T.sail) * 1.1) % 1, ax = Math.cos(Math.PI * (1 - ph * 2)) * 66, ay = -78 - Math.sin(Math.PI * ((ph * 2) % 1)) * 26;
      if (!storm) { ctx.beginPath(); ctx.arc(ax, ay, 12, 0, Math.PI * 2); if (ph < 0.5) { ctx.lineWidth = 2; ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(ax + Math.cos(a) * 16, ay + Math.sin(a) * 16); ctx.lineTo(ax + Math.cos(a) * 22, ay + Math.sin(a) * 22); ctx.stroke(); } } else { ctx.fillStyle = C.ink; ctx.fill(); } }
      if (storm) { ctx.lineWidth = 1.6; for (const [a, b] of drops) { const x = -130 + a * 260 + ((t * 90) % 40), y = -130 + ((b * 200 + t * 420) % 200); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 22); ctx.stroke(); } }
      if (kind === 'island') { ctx.beginPath(); ctx.ellipse(60, 52, 70, 14, 0, Math.PI, 0); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(70, 40); ctx.quadraticCurveTo(64, 0, 72, -30); ctx.lineWidth = 4; ctx.stroke(); for (const a of [-2.6, -1.9, -1.2, -0.5]) { ctx.beginPath(); ctx.moveTo(72, -30); ctx.quadraticCurveTo(72 + Math.cos(a) * 30, -30 + Math.sin(a) * 30 - 6, 72 + Math.cos(a) * 46, -30 + Math.sin(a) * 46 + 14); ctx.lineWidth = 3; ctx.stroke(); } }
      // dalgalar (sürekli)
      ctx.lineWidth = 2;
      for (let row = 0; row < 4; row++) { const y = 48 + row * 18, sp = 40, off = (t * 40 * (1 + row * 0.3)) % sp; ctx.beginPath(); for (let x = -rr - sp + off; x < rr + sp; x += 4) { const yy = y + Math.sin((x - off) * 0.16 + t * 3 + row) * amp * 0.4; x === -rr - sp + off ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
      const crew = t >= T.friend && t < T.ask ? 1 : 2, roll = Math.sin(t * (storm ? 3.4 : 1.6)) * (storm ? 0.16 : 0.07);
      ctx.save(); ctx.translate(kind === 'island' ? -40 : 0, 44 + Math.sin(t * 1.6) * 3); drawBoat(ctx, BOAT_CARD, { roll, crew }, 200); ctx.restore();
    } else if (kind === 'pocket' || kind === 'dark') {
      // ters gövdenin içi: üstte hava (kâğıt), altta su; zifiri karanlık = sık çapraz tarama; su yavaşça yükselir
      const wl = lerp(10, -6, seg(t, T.pocket, T.grip - T.pocket));
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-rr, -rr, 2 * rr, rr + wl);
      ctx.save(); ctx.beginPath(); ctx.rect(-rr, wl, 2 * rr, rr); ctx.clip(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = wl; y < rr; y += 6) { ctx.beginPath(); ctx.moveTo(-rr, y); ctx.lineTo(rr, y); ctx.stroke(); } ctx.restore();
      ctx.beginPath(); ctx.moveTo(-rr, wl); for (let x = -rr; x <= rr; x += 6) ctx.lineTo(x, wl + Math.sin(x * 0.08 + t * 2) * 1.6); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.save(); ctx.translate(0, wl); drawOkene(ctx, OKENE_CARD, { look: kind === 'dark' ? Math.sin(t * 0.5) * 0.6 : 0, breathe: (Math.sin(t * 1.9) + 1) / 2 }, 220); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-rr, -86); ctx.lineTo(rr, -86); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke(); // gövde tabanı (artık tavan)
      if (kind === 'dark') {
        const dk = ease.enter(seg(t, T.dark, 0.8)) * (1 - ease.state(seg(t, T.hand - 0.6, 0.6)));
        ctx.save(); ctx.globalAlpha = 0.55 * dk; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2;
        for (let d = -300; d < 300; d += 5) { ctx.beginPath(); ctx.moveTo(d - 130, -130); ctx.lineTo(d + 130, 130); ctx.stroke(); }
        for (let d = -300; d < 300; d += 7) { ctx.beginPath(); ctx.moveTo(d + 130, -130); ctx.lineTo(d - 130, 130); ctx.stroke(); }
        ctx.restore();
      }
    } else if (kind === 'hands') {
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = -rr; y < rr; y += 6) { ctx.beginPath(); ctx.moveTo(-rr, y); ctx.lineTo(rr, y); ctx.stroke(); }
      ctx.save(); ctx.beginPath(); ctx.moveTo(-140, -30); ctx.lineTo(40, -10); ctx.lineTo(40, 30); ctx.lineTo(-140, 60); ctx.closePath(); ctx.fillStyle = 'rgba(244,238,225,0.95)'; ctx.fill(); ctx.restore(); // lamba ışığı
      drawHands(ctx, ease.state(seg(t, T.hand + 0.2, T.grip - T.hand - 0.1)), 230);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(55); const blinks = []; for (let b = 1.4; b < D; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.storm, 'sasirma', 'saskin'], [T.storm + 1.4, 'ayakta', 'notr'], [T.friend, 'ayakta', 'dusunceli'], [T.land, 'ayakta', 'mutlu'],
    [T.capsize, 'sasirma', 'saskin'], [T.capsize + 1.6, 'ayakta', 'dusunceli'], [T.grip, 'sasirma', 'saskin'], [T.grip + 1.8, 'ayakta', 'mutlu'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.land + 0.1, Math.min(T.land + 1.6, T.whip0 + 0.3), '438 gün!'], [T.grip + 0.1, T.grip + 1.7, 'Yaşıyor!'], [T.hero + 0.1, T.hero + 1.8, '2,5 gün mü?!']];
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
    // bölünmüş cümle (l14 + l15): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l15' ? L.l14.text + ' ' + ln.text : ln.id === 'l14' ? "Alvarenga 438 gün sürüklendi. Ya\u00A0Okene?" : ln.text;
    const p = ln.id === 'l15' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
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
    setFont(ctx, F.name(42)); revealText(ctx, '438 gün okyanusta sürüklenen balıkçı mı,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, '30 metre dipte 60 saat yaşayan aşçı mı?', SAFE.x0, 690, 42, k, C.ink);
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
      const d = Math.floor(Fx.alvarenga.days * dayU(t)), km = Math.round(Fx.alvarenga.km * dayU(t) / 10) * 10;
      row({ label: 'ALVARENGA · BALIKÇI', num: nf0.format(t >= T.land ? 438 : d), unit: 'gün', right1: nf0.format(t >= T.land ? Fx.alvarenga.km : km) + ' km', right2: t >= T.land ? 'MARŞAL ADALARI' : t >= T.friend ? 'TEK BAŞINA' : t >= T.drift0 ? 'SÜRÜKLENİYOR' : 'MEKSİKA', p: Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) });
      return;
    }
    if (t < T.cmp0) {
      const h = Math.floor(hours(t));
      row({ label: 'HARRISON OKENE · AŞÇI', num: String(h), unit: 'saat', right1: t >= T.sunk ? '30 m DİPTE' : t >= T.capsize ? 'BATIYOR' : 'RÖMORKÖR', right2: t >= T.pocket ? 'HAVA CEBİ' : 'NİJERYA', p: Math.max(0.35, ease.enter(seg(t, L.l07.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) { row({ label: 'AYNI TAKVİMDE · ALVARENGA', num: nf0.format(Math.floor(Fx.alvarenga.days * ease.state(seg(t, T.fill0, T.fill1 - T.fill0)))), unit: 'gün', right1: 'OKENE: ?', right2: '', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.ask) { row({ label: 'OKENE, KARANLIKTA', num: '2,5', unit: 'gün', red: true, right1: 'ALVARENGA: 438 gün', right2: '175 KAT' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Balıkçı mı, aşçı mı?', SAFE.x0, 672, 80, p, C.ink);
  }

  // ——— kare ———
  const MEX = DRIFT[0], EBON = DRIFT.at(-1);
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    G.draw();
    let at = null;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // sürüklenme izi: dalgalı kesik çizgi; döngü sonunda geri sarılır
    const wipe = 1 - ease.state(seg(t, T.loop0 + 0.1, 0.6));
    const s = boatS(t) * wipe;
    if (s > 0 && t < T.whip1) G.line(slice(DR, 0, s), { w: 4, dash: [10, 7] });
    if (t >= T.drift0 - 0.4 && t < T.whip0 + 0.3) G.ringAt(EBON, seg(t, T.drift0, 0.6), 30);
    // tekne (haritada): dalgada sallanır
    if (t < T.whip0 + 0.2 || t >= T.loop0 + 0.5) {
      const p = t >= T.loop0 ? MEX : boatP(t);
      if (G.visible(p)) { const q = G.proj(p); ctx.save(); ctx.translate(q[0], q[1]); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -10, 50, 26, 0, 0, Math.PI * 2); ctx.fill(); drawBoat(ctx, BOAT_CARD, { roll: Math.sin(t * 1.6) * 0.08, crew: t >= T.friend && t < T.loop0 ? 1 : 2 }, 80); ctx.restore(); at = q; }
    }
    if (t < T.drift0 + 1.5 || t >= T.loop0 + 0.5) G.placeLabel(MEX, 'MEKSİKA', t >= T.loop0 ? seg(t, T.loop0 + 0.5, 0.35) : 1, 20, 46);
    if (t >= T.drift0 && t < T.whip0 + 0.3) G.placeLabel(EBON, 'MARŞAL ADALARI', seg(t, T.drift0 + 0.3, 0.4), 0, -44, C.ink, 'center', false);
    // Nijerya: römorkör noktası
    if (t >= T.whip1 - 0.2 && t < T.sect0 + 0.8) {
      if (G.visible(WRECK)) { const q = G.proj(WRECK); ctx.save(); ctx.translate(q[0], q[1] + Math.sin(t * Math.PI) * 4); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -12, 56, 34, 0, 0, Math.PI * 2); ctx.fill(); drawTug(ctx, TUG_CARD, { roll: Math.sin(t * Math.PI) * 0.05 }, 90); ctx.restore(); at = q; }
      G.placeLabel([7.5, 8.0], 'NİJERYA', seg(t, T.whip1, 0.4), 0, 0, C.ink, 'center', false);
    }
    ctx.restore();
    // deniz kesiti
    const PK = section(t, sectK(t));
    if (PK && t >= T.pocket) at = [PK.x, PK.y];
    calendar(t);
    // büyüteç
    let kind = null, rk = 1;
    const cutT = L.l07.t0 - 0.06;
    if (t < T.storm) kind = 'boat'; else if (t < T.eat) kind = 'storm'; else if (t < T.land) kind = 'boat'; else if (t < cutT) kind = 'island';
    else if (t < T.pocket) kind = null; else if (t < T.dark) kind = 'pocket'; else if (t < T.hand) kind = 'dark'; else if (t < T.cmp0) kind = 'hands';
    if (t >= cutT - 0.3 && t < cutT + 0.3) { const u = seg(t, cutT - 0.3, 0.6); rk = u < 0.5 ? 1 - ease.exit(u * 2) : 0; if (u >= 0.5) kind = null; }
    if (kind === 'pocket' || kind === 'dark' || kind === 'hands') rk = Math.min(rk, ease.enter(seg(t, T.pocket, 0.45)));
    if (t >= T.cmp0) { kind = 'hands'; rk = 1 - ease.exit(seg(t, T.cmp0, 0.3)); }
    const RS = kind === 'pocket' || kind === 'dark' || kind === 'hands' ? ROUND_SEA : ROUND;
    if (kind && rk > 0.02) roundel(t, kind, RS, rk, t < T.cmp0 ? at : null);
    // doruk sonrası: Okene karanlıkta (bilmiyordu)
    if (t >= T.after - 1.2 && t < T.ask) roundel(t, 'dark', ROUND, ease.enter(seg(t, T.after - 1.2, 0.45)) * (1 - ease.exit(seg(t, T.ask - 0.3, 0.3))));
    // kare 0 ve soru: iki balon
    if (t < L.l02.t0) roundel(t, 'pocket', ROUND2, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)));
    if (t < L.l02.t0 || t >= T.ask) roundel(t, 'boat', ROUND, 1, t >= T.loop0 + 0.5 || t < L.l02.t0 ? at : null);
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.6)) : 1;
      roundel(t, 'pocket', ROUND2, kin);
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(482 - 52, 1096, 104, 42); ctx.fillRect(ROUND.x - 82, 1084, 164, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'AŞÇI', 482, 1128, 34, kin * kout, C.ink, 'center'); revealText(ctx, 'BALIKÇI', ROUND.x, 1116, 34, kin * kout, C.ink, 'center');
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

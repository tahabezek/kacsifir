// "Demir" şablonu (Hangisi daha şaşırtıcı?): kafasından demir çubuk geçen Phineas Gage ve balinanın ağzına giren dalgıç
// Michael Packard. A: yandan demiryolu yarması (1848); barut sıkıştırılır, patlar, demir uçar; kafatası kesiti levhasında
//    çubuğun yolu (sol yanak → tepe); demir 25 m öteye düşer (cetvel); Gage kalkar, konuşur; 12 yıl. B: su altı kesiti
//    (0–20 m): dalgıç 14 m'de, kambur balina ağzı açık hamle eder, karanlık, kronometre, yüzey ve tükürme.
//    Doruk "aynı terazi": 6 kg demir ile 30 ton balina; 5.000 demirlik ızgara. Anlatım saattir. Kan yok; kırmızı yalnız dorukta.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { GAGE_CARD, drawGage, drawRod, drawSkull, drawDiver, drawWhale, drawScale } from '../demir_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// A: yarma (yandan), 1 m = 18 px; Gage 700'de, delik 742'de; demir 25 m sola düşer
const GROUND = 1300, MPX = 18, GAGE_X = 700, HOLE_X = 742, LAND_X = GAGE_X - 25 * MPX;
// B: deniz kesiti 0–20 m
const SEA = { y0: 840, y1: 1380 }, SPM = (1380 - 840) / 20;
// doruk: terazi
const SC = { x: 520, y: 1330, size: 560 };

export function demirTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    tamp: Wd('l02', 'sıkıştırıyor'), blast: Wd('l03', 'patlıyor'), through: Wd('l03', 'kafasının'), entry: Wd('l04', 'sol'), exit: Wd('l04', 'tepesinden'), land: Wd('l04', 'yirmi'),
    talk: Wd('l05', 'konuşuyor'), walk: Wd('l05', 'yürüyor'), years: L.l06.t0, whip0: L.l06.end + 0.25, whip1: L.l07.t0 + 0.6, adam: Wd('l07', 'adam'),
    dive: L.l08.t0, dark: Wd('l09', 'kararıyor'), whale: Wd('l09', 'kambur'), gulp: Wd('l09', 'ağzına'), wait: L.l10.t0, sec30: Wd('l10', 'otuz'),
    surface: Wd('l11', 'yüzeye'), shake: Wd('l11', 'başını'), spit: Wd('l11', 'tükürüyor'), ok: L.l12.t0,
    cmp0: L.l13.t0 - 0.1, rodOn: Wd('l14', 'demir'), whaleOn: Wd('l14', 'balina'), hero: L.l15.t0 - 0.04, ton30: Wd('l15', 'otuz'), grid: Wd('l16', 'beş'), ask: L.l17.t0, loop0: tl.loop0,
  };
  T.skull0 = T.blast + 0.5; T.skull1 = T.land - 1.2; T.seaIn = T.whip0; T.seaDone = L.l07.t0 - 0.06;
  return T;
}

export async function makeDemirRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = demirTimes(tl), Fx = ep.facts;
  const rnd = mulberry32(43);
  const plate = (t, a, b) => t < a ? 0 : t < b ? ease.state(seg(t, a, 0.75)) : 1 - ease.state(seg(t, b, 0.6));
  const rocks = Array.from({ length: 40 }, () => [rnd(), rnd(), rnd()]);
  const bubbles = Array.from({ length: 24 }, () => [rnd(), rnd(), rnd()]);

  // ——— A: demiryolu yarması (yandan); kare 0 ve döngü de bu sahnedir ———
  // demirin uçuşu: patlamada delikten yukarı fırlar, yay çizip 25 m sola düşer
  const rodFly = t => {
    const u = clamp01((t - T.blast) / Math.max(0.6, T.land - T.blast));
    const x = lerp(HOLE_X, LAND_X, ease.state(u)), y = GROUND - 40 - Math.sin(u * Math.PI) * 520 - (u < 0.08 ? 0 : 0);
    const ang = lerp(-Math.PI / 2, Math.PI * 0.62, u);
    return { x, y: Math.min(GROUND - 6, y), ang, u };
  };
  function sceneA(t, back) {
    const tt = back ? 0 : t;
    // sahne boyunca yavaş yaklaşma (%8): kare hiçbir zaman donmaz; döngüde %94 → %100
    const z = back ? 1 - 0.06 * (1 - seg(t, T.ask, D - T.ask)) : 1 + 0.05 * ease.state(seg(t, 0, 2)) + 0.05 * seg(t, 2, T.whip0 - 2);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.translate(GAGE_X - 120, GROUND - 200); ctx.scale(z, z); ctx.translate(-(GAGE_X - 120), -(GROUND - 200));
    // gökyüzü: seyrek yatay tarama; uzak tepeler
    ctx.strokeStyle = 'rgba(139,133,119,0.35)'; ctx.lineWidth = 1; for (let y = STAGE_TOP + 20; y < GROUND - 160; y += 9) { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-200, GROUND - 150); for (let x = -200; x <= W + 200; x += 20) ctx.lineTo(x, GROUND - 150 - 60 * Math.sin(x * 0.006 + 1) - 30 * Math.sin(x * 0.017)); ctx.lineTo(W + 200, GROUND); ctx.lineTo(-200, GROUND); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
    // kaya yüzü (sağda, taralı) ve delik
    const rock = () => { ctx.beginPath(); ctx.moveTo(HOLE_X + 30, GROUND); ctx.lineTo(HOLE_X + 50, GROUND - 260); ctx.lineTo(HOLE_X + 120, GROUND - 330); ctx.lineTo(W + 200, GROUND - 380); ctx.lineTo(W + 200, GROUND); ctx.closePath(); };
    rock(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.save(); rock(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.lineWidth = 1.2; for (let d = -800; d < 800; d += 7) { ctx.beginPath(); ctx.moveTo(HOLE_X + d, GROUND - 400); ctx.lineTo(HOLE_X + d + 400, GROUND); ctx.stroke(); } ctx.restore();
    rock(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // zemin ve demiryolu traversleri (solda)
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-200, GROUND, W + 400, 140); ctx.beginPath(); ctx.moveTo(-200, GROUND); ctx.lineTo(W + 200, GROUND); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.fillStyle = C.ink; for (let x = -180; x < HOLE_X - 60; x += 46) ctx.fillRect(x, GROUND + 8, 30, 9); ctx.fillRect(-200, GROUND + 4, HOLE_X - 40 + 200, 4);
    ctx.beginPath(); ctx.ellipse(HOLE_X, GROUND + 2, 10, 5, 0, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    // patlama: kâğıt beyazlaması + mürekkep ışınlar ve uçan taşlar (ateş/kırmızı yok)
    if (!back && tt >= T.blast) {
      const u = seg(tt, T.blast, 1.0);
      if (u < 1) { ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = -Math.PI + (i / 11) * Math.PI; ctx.beginPath(); ctx.moveTo(HOLE_X + Math.cos(a) * 20, GROUND + Math.sin(a) * 20); ctx.lineTo(HOLE_X + Math.cos(a) * (40 + 160 * u), GROUND + Math.sin(a) * (40 + 160 * u)); ctx.stroke(); } for (const [a, b, c] of rocks.slice(0, 14)) { const ang = -Math.PI * (0.15 + 0.7 * a), d = 220 * u * (0.4 + b); ctx.fillStyle = C.ink; ctx.fillRect(HOLE_X + Math.cos(ang) * d, GROUND + Math.sin(ang) * d + 300 * u * u, 4 + c * 6, 4 + c * 5); } ctx.restore(); }
    }
    // demir: önce Gage'in elinde (sıkıştırma), patlamada uçar, 25 m sola düşer
    if (!back && tt >= T.blast) {
      const r = rodFly(tt);
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.ang); drawRod(ctx, 1.1 * MPX * 6); ctx.restore();
      // 25 m cetveli (iniş kelimesinden itibaren)
      const cu = ease.enter(seg(tt, T.land - 0.2, 0.6));
      if (cu > 0) {
        const y = GROUND + 60; ctx.beginPath(); ctx.moveTo(GAGE_X, y); ctx.lineTo(lerp(GAGE_X, LAND_X, cu), y); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
        for (let m = 0; m <= 25; m += 5) { const x = GAGE_X - m * MPX; if (x < lerp(GAGE_X, LAND_X, cu) - 1) continue; ctx.beginPath(); ctx.moveTo(x, y - (m % 25 ? 8 : 16)); ctx.lineTo(x, y + (m % 25 ? 8 : 16)); ctx.lineWidth = 2; ctx.stroke(); }
        if (cu > 0.6) { const bx = (GAGE_X + LAND_X) / 2 + 110; ctx.fillStyle = C.paper; ctx.fillRect(bx - 12, y - 14, 24, 28); ctx.beginPath(); ctx.moveTo(bx - 14, y + 12); ctx.lineTo(bx - 4, y - 12); ctx.moveTo(bx + 4, y + 12); ctx.lineTo(bx + 14, y - 12); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
        if (cu > 0.9) { setFont(ctx, F.mono(34)); const lb = '25 m', tw = ctx.measureText(lb).width, mx = (GAGE_X + LAND_X) / 2; ctx.fillStyle = C.paper; ctx.fillRect(mx - tw / 2 - 10, y + 16, tw + 20, 44); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, mx, y + 50); }
      }
    }
    // Gage: sıkıştırır → patlamada geriye düşer → kalkar, konuşur, yürür
    let pose;
    if (back || tt < T.blast) pose = { arms: back || tt < T.tamp - 0.4 ? 'down' : 'tamp', phase: tt, lean: Math.sin(t * 0.9) * 0.02 };
    else if (tt < T.talk - 0.6) pose = { fallen: ease.enter(seg(tt, T.blast, 0.35)) * 0.92, eyes: 'closed' };
    else if (tt < T.walk) pose = { fallen: 0.92 * (1 - ease.state(seg(tt, T.talk - 0.6, 0.6))), arms: 'talk', phase: tt };
    else pose = { walk: tt, arms: 'down' };
    const gx = !back && tt >= T.walk ? GAGE_X - 140 * ease.state(seg(tt, T.walk, T.whip0 - T.walk)) : GAGE_X;
    ctx.save(); ctx.translate(gx, GROUND); if (!back && tt >= T.walk) ctx.scale(-1, 1); drawGage(ctx, GAGE_CARD, pose, 340); ctx.restore();
    ctx.restore();
    return [gx + 6, GROUND - 300];
  }

  // ——— kafatası kesiti levhası ———
  function skullPlate(t) {
    const k = plate(t, T.skull0, T.skull1); if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    ctx.save(); const z = 1 + 0.1 * seg(t, T.skull0 + 0.75, T.skull1 - T.skull0 - 0.75); ctx.translate(520, 1060); ctx.scale(z, z); ctx.translate(-520, -1060);
    const rodU = ease.state(seg(t, T.through - 0.2, 1.6));
    ctx.save(); ctx.beginPath(); ctx.arc(520, 1060, 330, 0, Math.PI * 2); ctx.clip(); ctx.translate(520, 1080); drawSkull(ctx, 520, rodU); ctx.restore();
    ctx.beginPath(); ctx.arc(520, 1060, 330, 0, Math.PI * 2); ctx.setLineDash([6, 8]); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
    // giriş / çıkış etiketleri (sol yanak, kafatası tepesi): kâğıt zeminli, kesik çizgiyle
    const lab = (s, x, y, px, py, u) => { if (u <= 0) return; setFont(ctx, F.mono(32)); const tw = ctx.measureText(s).width; ctx.globalAlpha = u; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x + (x < px ? tw + 8 : -8), y - 10); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.fillStyle = C.paper; ctx.fillRect(x - 8, y - 34, tw + 16, 46); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(s, x, y); ctx.globalAlpha = 1; };
    lab('GİRİŞ: SOL YANAK', 150, 1340, 520 + 0.16 * 520, 1080 + 0.24 * 520, ease.enter(seg(t, T.entry - 0.1, 0.35)));
    lab('ÇIKIŞ: TEPE', 290, 860, 520 + 0.04 * 520, 1080 - 0.46 * 520 + 10, ease.enter(seg(t, T.exit - 0.1, 0.35)));
    ctx.restore();
    // ölçü: 1,1 m · 6 kg · 3,2 cm (sağ üstte)
    const mu = ease.enter(seg(t, T.through, 0.4));
    if (mu > 0) { setFont(ctx, F.mono(32)); ctx.globalAlpha = mu; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('DEMİR: 1,1 m · 6 kg', SAFE.x0, 1236); ctx.fillText('ÇAP: 3,2 cm', SAFE.x0, 1276); ctx.globalAlpha = 1; }
    ctx.restore();
    return [520, 900];
  }

  // ——— B: deniz kesiti ———
  const DIVER = { x: 600, y: SEA.y0 + 14 * SPM };
  const whaleP = t => {
    // yaklaşma (sol alttan), ağız açık hamle, yutma, yüzeye çıkış, baş sallama
    if (t < T.whale) return { x: -340, y: DIVER.y + 120, open: 0, rot: -0.25 };
    if (t < T.gulp) { const u = ease.state(seg(t, T.whale, T.gulp - T.whale)); return { x: lerp(-340, DIVER.x - 140, u), y: lerp(DIVER.y + 120, DIVER.y + 10, u), open: ease.enter(seg(t, T.whale, 0.6)), rot: lerp(-0.25, -0.1, u) }; }
    if (t < T.surface) { const u = seg(t, T.gulp, T.surface - T.gulp); return { x: DIVER.x - 140 + 30 * u, y: lerp(DIVER.y + 10, DIVER.y - 60, u), open: 1 - ease.state(seg(t, T.gulp, 0.5)), rot: -0.1 - 0.15 * u }; }
    const u = ease.state(seg(t, T.surface, T.shake - T.surface)), sh = t >= T.shake && t < T.shake + 0.8 ? Math.sin((t - T.shake) / 0.8 * Math.PI * 2 * 3) * (6 * Math.PI / 180) : 0;
    return { x: DIVER.x - 110, y: lerp(DIVER.y - 60, SEA.y0 + 34, u), sc: lerp(1, 0.7, u), open: t >= T.spit ? ease.enter(seg(t, T.spit, 0.3)) * (1 - seg(t, T.spit + 1.0, 0.6)) : 0, rot: lerp(-0.25, -0.44, u) + sh };
  };
  function sea(t) {
    const k = t < T.seaIn ? 0 : t < T.cmp0 + 0.6 ? ease.state(seg(t, T.seaIn, T.seaDone - T.seaIn)) : 0; if (k <= 0) return null;
    // levha sağdan gelir (bölümler arası tek baskın yön: sola)
    const dx = W * (1 - k);
    ctx.save(); ctx.beginPath(); ctx.rect(dx, STAGE_TOP, W - dx, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    const z = 1 + 0.1 * seg(t, T.whip1, T.cmp0 - T.whip1); ctx.translate(DIVER.x, DIVER.y); ctx.scale(z, z); ctx.translate(-DIVER.x, -DIVER.y);
    // su: derinleştikçe sıklaşan yatay çizgiler; karanlık anında çapraz tarama
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = SEA.y0 + 4, g = 10; y < SEA.y1; y += g, g = Math.max(4.4, g - 0.12)) { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); ctx.stroke(); }
    ctx.beginPath(); for (let x = -200; x <= W + 200; x += 8) { const y = SEA.y0 + Math.sin(x * 0.03 + t * 2.2) * 3; x === -200 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-200, SEA.y1, W + 400, 200); ctx.beginPath(); ctx.moveTo(-200, SEA.y1); ctx.lineTo(W + 200, SEA.y1); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // derinlik cetveli (solda)
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; setFont(ctx, F.mono(30)); ctx.textAlign = 'left';
    ctx.beginPath(); ctx.moveTo(SAFE.x0, SEA.y0); ctx.lineTo(SAFE.x0, SEA.y1); ctx.stroke();
    for (let m = 0; m <= 20; m += 5) { const y = SEA.y0 + m * SPM; ctx.beginPath(); ctx.moveTo(SAFE.x0, y); ctx.lineTo(SAFE.x0 + 16, y); ctx.stroke(); if (m % 10 === 0) { ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 22, y - 22, 92, 32); ctx.fillStyle = C.ink; ctx.fillText(m + ' m', SAFE.x0 + 26, y + 4); } }
    // 14 m işareti
    const y14 = DIVER.y; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(SAFE.x0, y14); ctx.lineTo(DIVER.x - 120, y14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 22, y14 - 22, 92, 32); ctx.fillStyle = C.ink; ctx.fillText('14 m', SAFE.x0 + 26, y14 + 4);
    // karanlık: 'kararıyor' kelimesinden yutmaya, sonra yüzeye çıkışla açılır
    const dk = ease.state(seg(t, T.dark, 0.5)) * (1 - ease.state(seg(t, T.surface, 0.8)));
    if (dk > 0) { ctx.save(); ctx.globalAlpha = 0.45 * dk; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; for (let d = -1600; d < 1600; d += 6) { ctx.beginPath(); ctx.moveTo(d, SEA.y0); ctx.lineTo(d + 600, SEA.y1); ctx.stroke(); } ctx.restore(); }
    // balina ve dalgıç
    const wp = whaleP(t);
    ctx.save(); ctx.translate(wp.x, wp.y); ctx.rotate(wp.rot); drawWhale(ctx, 620 * (wp.sc || 1), wp.open, t); ctx.restore();
    let at = [DIVER.x, DIVER.y];
    if (t < T.gulp) { ctx.save(); ctx.translate(DIVER.x + Math.sin(t * 0.8) * 10, DIVER.y); drawDiver(ctx, 150, t); ctx.restore(); }
    else if (t >= T.spit) {
      // tükürülen dalgıç yüzeye fırlar ve yüzer
      const u = ease.enter(seg(t, T.spit, 0.9)); const x = lerp(wp.x + 200, DIVER.x + 170, u), y = lerp(SEA.y0 - 40, SEA.y0 + 10, u) - Math.sin(u * Math.PI) * 40;
      ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 3); drawDiver(ctx, 140, t * 0.5); ctx.restore(); at = [x, y];
    } else at = [wp.x + 200, wp.y];
    // kabarcıklar (sürekli döngü)
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; for (const [a, b, c] of bubbles) { const ph = ((t * (0.3 + c * 0.3)) + a) % 1, x = DIVER.x - 40 + b * 120 + Math.sin(ph * 9 + a * 6) * 8, y = lerp(DIVER.y - 20, SEA.y0 + 6, ph); ctx.beginPath(); ctx.arc(x, y, 3 + c * 5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    return at;
  }

  // ——— doruk: terazi ———
  function scalePlate(t) {
    if (t < T.cmp0 || t >= T.ask) return null;
    const out = t >= T.ask - 0.45, k = out ? 1 - ease.exit(seg(t, T.ask - 0.45, 0.45)) : ease.state(seg(t, T.cmp0, 0.6));
    if (out) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.restore(); } else { ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k); }
    if (k < 0.9 && !out) return null;
    ctx.save(); ctx.globalAlpha = out ? k : 1; ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    const z = 1 + 0.1 * seg(t, T.cmp0 + 0.6, T.ask - T.cmp0 - 0.6); ctx.translate(SC.x, 1100); ctx.scale(z, z); ctx.translate(-SC.x, -1100);
    const red = t >= T.ton30 - 0.02;
    // zemin
    ctx.beginPath(); ctx.moveTo(40, SC.y); ctx.lineTo(W - 40, SC.y); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // kiriş (− sol kefe aşağı): demir sağa hafif; balina konunca sola yavaş; dorukta sert durak (kefe yerde); 5.000 demirle dengeye döner
    const TMAX = -0.6, nG = t >= T.grid - 0.2 ? Math.floor(5000 * ease.state(seg(t, T.grid - 0.2, Math.max(0.9, L.l16.end - T.grid)))) : 0;
    let tilt = t < T.rodOn ? 0 : 0.06 * ease.enter(seg(t, T.rodOn, 0.4));
    if (t >= T.whaleOn) tilt = lerp(0.06, -0.14, ease.state(seg(t, T.whaleOn, T.hero - T.whaleOn)));
    if (t >= T.hero - 0.02) { const s = clamp01((t - T.hero + 0.02) / 0.14); tilt = lerp(-0.14, TMAX, s * s) - (s >= 1 ? 0.025 * Math.exp(-(t - T.hero - 0.12) * 9) * Math.sin((t - T.hero - 0.12) * 40) : 0); }
    if (nG > 0) tilt = lerp(TMAX, 0, ease.state(nG / 5000));
    const rodIn = ease.enter(seg(t, T.rodOn - 0.1, 0.4)), whIn = ease.enter(seg(t, T.whaleOn - 0.1, 0.5));
    ctx.save(); ctx.translate(SC.x, SC.y);
    drawScale(ctx, SC.size, tilt,
      () => { if (whIn > 0) { ctx.save(); ctx.translate(0, -52 - 120 * (1 - whIn)); ctx.globalAlpha *= whIn; drawWhale(ctx, 640, 0, t); ctx.restore(); } },
      () => {
        if (rodIn > 0) { ctx.save(); ctx.translate(0, -8 - 30 * (1 - rodIn)); ctx.globalAlpha *= rodIn; drawRod(ctx, 110, 1.5); ctx.restore(); }
        // 5.000 demir: kefede yığın (100 × 50 kısa çizgi), sayaçla dolar
        if (nG > 0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.1; ctx.beginPath(); for (let i = 0; i < nG; i++) { const cx = -100 + (i % 100) * 2, cy = -12 - Math.floor(i / 100) * 3; ctx.moveTo(cx, cy); ctx.lineTo(cx + 1.6, cy); } ctx.stroke(); }
      });
    ctx.restore();
    // etiketler (kirişle birlikte hareket eder): balina solda üstte, demir sağda kefenin altında
    const ex = Math.cos(tilt) * SC.size * 0.5, ey = Math.sin(tilt) * SC.size * 0.5, py = SC.y - 0.62 * SC.size;
    const chipAt = (s, x, y, col) => { setFont(ctx, F.mono(36)); const tw = ctx.measureText(s).width; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 10, y - 36, tw + 20, 48); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(s, x, y); };
    if (whIn > 0) { ctx.globalAlpha = whIn * (out ? k : 1); chipAt(red ? '30 ton' : '? ton', SC.x - ex, py - ey - 40, red ? C.red : C.ink); }
    if (rodIn > 0) { ctx.globalAlpha = rodIn * (out ? k : 1); chipAt('6 kg', SC.x + ex - 150, py + ey + 0.2 * SC.size, C.ink); }
    if (nG > 0) { ctx.globalAlpha = out ? k : 1; chipAt(nf0.format(nG) + ' DEMİR', SC.x + ex, py + ey + 0.26 * SC.size - 170, C.red); }
    ctx.globalAlpha = 1;
    ctx.restore();
    return null;
  }

  // ——— büyüteç ———
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'skull') { ctx.save(); ctx.translate(-6, 20); drawSkull(ctx, 210, 0.62); ctx.restore(); }
    else if (kind === 'tamp') {
      // delikte barut ve demirin ucu: aşağı yukarı sıkıştırma
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-130, 20, 260, 120); ctx.save(); ctx.beginPath(); ctx.rect(-130, 20, 260, 120); ctx.clip(); ctx.lineWidth = 1.2; for (let d = -300; d < 300; d += 7) { ctx.beginPath(); ctx.moveTo(d, 20); ctx.lineTo(d + 120, 140); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = C.paper; ctx.fillRect(-16, 20, 32, 110); ctx.lineWidth = 2.5; ctx.strokeRect(-16, 20, 32, 110);
      ctx.fillStyle = C.ink; for (let i = 0; i < 40; i++) { const a = (i * 37 % 100) / 100, b = (i * 53 % 100) / 100; ctx.fillRect(-13 + a * 24, 80 + b * 46, 3, 3); }
      const s = Math.abs(Math.sin(t * Math.PI * 2 / 0.8)); ctx.save(); ctx.translate(0, 70 - 50 * s); ctx.rotate(-Math.PI / 2); drawRod(ctx, 300); ctx.restore();
    } else if (kind === 'blast') {
      const u = seg(t, T.blast, 1.2); ctx.save(); ctx.globalAlpha = 1 - u * 0.6; ctx.lineWidth = 3; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 20, 40 + Math.sin(a) * 20); ctx.lineTo(Math.cos(a) * (60 + 90 * u), 40 + Math.sin(a) * (60 + 90 * u)); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.translate(0, 40 - 260 * ease.enter(u)); ctx.rotate(-Math.PI / 2); drawRod(ctx, 260); ctx.restore();
    } else if (kind === 'talk') {
      // başında sargı, konuşur (yakın plan)
      ctx.save(); ctx.translate(-14, 270); drawGage(ctx, GAGE_CARD, { arms: 'talk', phase: t }, 300); ctx.restore();
      ctx.beginPath(); ctx.ellipse(-12, 270 - 300 * 0.885 - 6, 22, 9, -0.1, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
    } else if (kind === 'portrait') {
      // bilinen dagerotip: Gage demiri elinde tutar (oval çerçeve)
      ctx.beginPath(); ctx.ellipse(0, 0, 96, 116, 0, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.stroke(); ctx.save(); ctx.clip();
      ctx.save(); ctx.translate(-10, 230); drawGage(ctx, GAGE_CARD, { arms: 'down' }, 300); ctx.restore();
      ctx.save(); ctx.translate(40, 20); ctx.rotate(-1.35); drawRod(ctx, 240); ctx.restore(); ctx.restore();
    } else if (kind === 'diver') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = -124; y < 124; y += 7) { ctx.beginPath(); ctx.moveTo(-124, y); ctx.lineTo(124, y); ctx.stroke(); } ctx.save(); ctx.translate(Math.sin(t) * 6, 10); drawDiver(ctx, 220, t); ctx.restore(); }
    else if (kind === 'mouth') {
      // ağzın içi: karanlık, dalgıç ve kabarcıklar; kronometre halkası (30–40 sn)
      ctx.fillStyle = C.ink; ctx.fillRect(-130, -130, 260, 260);
      ctx.save(); ctx.translate(0, 20 + Math.sin(t * 1.4) * 6); ctx.rotate(-0.2); drawDiver(ctx, 200, t * 0.6); ctx.restore();
      ctx.strokeStyle = C.paper; ctx.lineWidth = 1.6; for (const [a, b, c] of bubbles.slice(0, 10)) { const ph = ((t * 0.5) + a) % 1; ctx.beginPath(); ctx.arc(-60 + b * 120, lerp(60, -110, ph), 3 + c * 4, 0, Math.PI * 2); ctx.stroke(); }
      const s = t < T.sec30 ? seg(t, T.gulp, T.sec30 - T.gulp) * 0.75 : 0.75 + 0.25 * seg(t, T.sec30, T.surface - T.sec30); ctx.beginPath(); ctx.arc(0, 0, 112, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s); ctx.lineWidth = 8; ctx.strokeStyle = C.paper; ctx.stroke();
    } else if (kind === 'surface') {
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = 20; y < 130; y += 6) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
      ctx.beginPath(); for (let x = -130; x <= 130; x += 6) { const y = 20 + Math.sin(x * 0.05 + t * 3) * 4; x === -130 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.save(); ctx.translate(0, 20 + Math.sin(t * 2) * 3); drawDiver(ctx, 190, t * 0.4); ctx.restore();
    } else if (kind === 'whale') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = -124; y < 124; y += 7) { ctx.beginPath(); ctx.moveTo(-124, y); ctx.lineTo(124, y); ctx.stroke(); } ctx.save(); ctx.translate(-30, 10); ctx.rotate(-0.15); drawWhale(ctx, 300, 0.8, t); ctx.restore(); ctx.save(); ctx.translate(90, -10); drawDiver(ctx, 60, t); ctx.restore(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  // büyüteç programı: geçişte eski balon tam kapanır, yenisi açılır; kafatası levhası sırasında kapalı
  const S1 = [[0, 'skull'], [L.l02.t0, 'tamp'], [T.blast, 'blast'], [T.skull0 + 0.2, null], [T.talk - 0.3, 'talk'], [T.years, 'portrait'], [T.whip0 - 0.1, null],
    [T.adam - 0.1, 'diver'], [T.dark, 'whale'], [T.gulp + 0.2, 'mouth'], [T.surface, 'whale'], [T.spit, 'surface'], [T.cmp0, null], [T.ask, 'skull']];
  function sched(t, S) {
    let i = -1; for (let k = 0; k < S.length; k++) if (t >= S[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S[i], prev = i > 0 ? S[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: i === 0 ? 1 : ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  // patlamadan Gage'in hikâyesinin sonuna kadar gülümseme yok
  const reacts = [[0, 'ayakta', 'notr'], [T.blast, 'sasirma', 'saskin'], [T.blast + 1.6, 'ayakta', 'dusunceli'], [T.talk, 'sasirma', 'saskin'], [T.talk + 1.6, 'ayakta', 'dusunceli'],
    [L.l07.t0, 'ayakta', 'notr'], [T.gulp, 'sasirma', 'saskin'], [T.gulp + 1.6, 'ayakta', 'dusunceli'], [T.spit, 'sasirma', 'saskin'], [T.ok, 'ayakta', 'mutlu'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubblesS = [[T.spit + 0.2, T.spit + 1.6, 'Tükürdü!', 300], [T.hero + 0.1, T.hero + 1.8, '30 ton mu?!', 170]];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text, dy] of bubblesS) {
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
    // bölünmüş cümle (l14 + l15): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l15' ? L.l14.text + ' ' + ln.text : ln.id === 'l14' ? "Gage'in kafasından geçen demir 6 kiloydu. Ya balina?" : ln.text;
    const p = ln.id === 'l15' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42)); revealText(ctx, 'Kafasından demir geçen adam mı,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, 'balinanın ağzından çıkan dalgıç mı?', SAFE.x0, 690, 42, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.ink, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    if (t < L.l07.t0 - 0.06) {
      const y = t < T.years ? 1848 : Math.round(lerp(1848, 1860, ease.state(seg(t, T.years, L.l06.end - T.years))));
      const r2 = t >= T.years ? '12 YIL DAHA YAŞIYOR' : t >= T.talk ? 'KONUŞUYOR, YÜRÜYOR' : t >= T.land ? '25 m ÖTEYE DÜŞTÜ' : t >= T.exit ? 'KAFATASINDAN GEÇTİ' : 'VERMONT, ABD';
      row({ label: 'PHINEAS GAGE · USTABAŞI', num: String(y), unit: '', right1: t >= T.blast ? 'DEMİR: 1,1 m · 6 kg' : 'DEMİRYOLU', right2: r2, p: Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) });
      return;
    }
    if (t < T.cmp0) {
      const inMouth = t >= T.gulp && t < T.spit, sec = inMouth ? (t < T.sec30 ? String(Math.floor(30 * seg(t, T.gulp, T.sec30 - T.gulp))) : '30–40') : null;
      const r1 = t >= T.ok ? 'HAFİF YARALI' : t >= T.spit ? 'TÜKÜRÜLDÜ' : t >= T.surface ? 'YÜZEYE ÇIKIYOR' : t >= T.gulp ? 'BALİNANIN AĞZINDA' : 'CAPE COD, ABD';
      row({ label: 'MICHAEL PACKARD · DALGIÇ', num: sec != null ? sec : t >= T.spit ? '0' : t >= T.dive ? '14' : '2021', unit: sec != null ? 'saniye' : t >= T.spit ? 'm · yüzeyde' : t >= T.dive ? 'm derinde' : '', right1: r1, right2: t >= T.gulp && t < T.surface ? 'TAHMİNİ: 30–40 sn' : t >= T.dive ? '2021' : '', p: Math.max(0.35, ease.enter(seg(t, L.l07.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) { row({ label: 'AYNI TERAZİDE · DEMİR', num: '6', unit: 'kg', right1: t >= T.whaleOn - 0.1 ? 'BALİNA: ?' : '', right2: '', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.ask) { row({ label: 'KAMBUR BALİNA', num: t >= T.ton30 - 0.02 ? '30' : '?', unit: 'ton', red: true, right1: 'DEMİR: 6 kg', right2: t >= T.grid - 0.2 ? '5.000 KAT' : '' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    let fs = 80; const q = 'Gage mi, Packard mı?'; setFont(ctx, F.head(fs)); while (ctx.measureText(q).width > SAFE.x1 - SAFE.x0 && fs > 50) { fs -= 2; setFont(ctx, F.head(fs)); }
    revealText(ctx, q, SAFE.x0, 672, fs, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    // A sahnesi: hikâye boyunca ve doruktan sonra (levha arkasında, kare 0 hâli)
    const back = t >= T.cmp0 + 0.6;
    let at = sceneA(t, back);
    const sk = skullPlate(t); if (sk && t >= T.skull0 + 0.6 && t < T.skull1) at = sk;
    const sb = sea(t); if (sb) at = sb;
    scalePlate(t);
    const r1 = sched(t, S1);
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, ROUND, r1.k, t >= L.l02.t0 && t < T.cmp0 ? at : null);
    // kare 0 ve soru: iki balon
    if (t < L.l02.t0) roundel(t, 'whale', ROUND2, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)));
    if (t >= T.ask) roundel(t, 'whale', ROUND2, ease.enter(seg(t, T.ask, 0.45)));
    if (t < L.l02.t0 || t >= T.loop0 + 0.3) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.loop0 + 0.3, 0.4));
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kk; ctx.fillRect(ROUND.x - 92, 1084, 184, 42); ctx.fillRect(482 - 92, 1096, 184, 42); ctx.globalAlpha = 1;
      revealText(ctx, '6 kg DEMİR', ROUND.x, 1116, 34, kk, C.ink, 'center'); revealText(ctx, 'BALİNA', 482, 1128, 34, kk, C.ink, 'center');
    }
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.6)) : 1;
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(482 - 90, 1096, 180, 42); ctx.fillRect(ROUND.x - 60, 1084, 120, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'PACKARD', 482, 1128, 34, kin * kout, C.ink, 'center'); revealText(ctx, 'GAGE', ROUND.x, 1116, 34, kin * kout, C.ink, 'center');
      // takip çağrısı: soru beklemesinde, döngüden önce söner
      const fk = ease.enter(seg(t, T.ask + 0.8, 0.4)) * (1 - ease.exit(seg(t, T.loop0 - 0.3, 0.3)));
      if (fk > 0) { setFont(ctx, F.mono(30)); const s = 'TAKİP ET · HER HAFTA YENİ BİR HANGİSİ?', tw = ctx.measureText(s).width; ctx.globalAlpha = fk; ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 2, 744, tw + 16, 46); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(SAFE.x0 + 2, 744, tw + 16, 46); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(s, SAFE.x0 + 10, 777); ctx.globalAlpha = 1; }
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

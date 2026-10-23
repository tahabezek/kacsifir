// "Yıldırım" karakterleri ve nesneleri: Lockheed Electra (yandan), koltuk sırasına bağlı Juliane, suda yürüyen Juliane,
// korucu Roy Sullivan (kampanya şapkası), tohumlu yıldırım, orman tepesi, gözetleme kulesi, kamyon, kulübe, orman kulübesi.
// Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Birim: boy ya da uzunluk = 1.
import { mulberry32 } from './core.js';

const INK = '#1C1B18', PAPER = '#F4EEE1';
const lerp = (a, b, u) => a + (b - a) * u;
function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -2; d < 2; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 2, -dx * d - dy * 2); ctx.lineTo(dy * d + dx * 2, -dx * d + dy * 2); ctx.stroke(); }
  ctx.restore();
}
const limbFn = (ctx, lw) => (x0, y0, x1, y1, w) => { ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = PAPER; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };

// ——— Lockheed L-188 Electra, yandan (sağa uçar). Kök: gövde ortası; birim = gövde boyu ———
export const PLANE_CARD = Object.freeze({ name: 'Lockheed L-188 Electra (LANSA 508), dört pervaneli', stroke: 0.006 });
// pose: { prop: faz (rad), wing: 0..1 (yakın kanat kopar, düşer), fire: 0..1, split: 0..1 (gövde ikiye ayrılır) }
export function drawPlane(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.3 / size), sp = pose.split || 0, wg = pose.wing || 0;
  const body = () => { ctx.beginPath(); ctx.moveTo(-0.46, -0.03); ctx.lineTo(0.36, -0.05); ctx.quadraticCurveTo(0.5, -0.045, 0.52, 0.0); ctx.quadraticCurveTo(0.5, 0.05, 0.38, 0.055); ctx.lineTo(-0.36, 0.05); ctx.lineTo(-0.5, -0.02); ctx.closePath(); };
  const fin = () => { ctx.beginPath(); ctx.moveTo(-0.36, -0.04); ctx.lineTo(-0.47, -0.2); ctx.lineTo(-0.41, -0.2); ctx.lineTo(-0.26, -0.046); ctx.closePath(); };
  // uzak kanat (gövdenin arkasında, grafit)
  ctx.beginPath(); ctx.moveTo(0.06, 0.0); ctx.lineTo(-0.12, 0.0); ctx.lineTo(-0.2, -0.05); ctx.lineTo(0.0, -0.05); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // gövde: iki parça (kesik x = -0.06), her biri kendi dönüşümüyle
  for (const half of [0, 1]) {
    ctx.save();
    if (sp > 0) { if (half === 0) { ctx.translate(0.05 * sp, 0.06 * sp); ctx.rotate(0.45 * sp); } else { ctx.translate(-0.05 * sp, 0.1 * sp); ctx.rotate(-0.35 * sp); } }
    ctx.beginPath(); if (half === 0) ctx.rect(-0.06, -0.3, 0.7, 0.6); else ctx.rect(-0.7, -0.3, 0.64, 0.6); ctx.clip();
    fin(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    body(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    hatchClip(ctx, () => { ctx.beginPath(); ctx.rect(-0.6, 0.022, 1.2, 0.05); body(); }, 0.012, 0, lw * 0.6);
    ctx.fillStyle = INK; for (let x = -0.3; x < 0.32; x += 0.042) ctx.fillRect(x, -0.022, 0.018, 0.016);
    ctx.beginPath(); ctx.moveTo(0.43, -0.035); ctx.lineTo(0.48, -0.03); ctx.lineTo(0.47, -0.012); ctx.lineTo(0.42, -0.014); ctx.closePath(); ctx.fill();
    // kırık kenar: tırtıklı mürekkep
    if (sp > 0.05) { ctx.beginPath(); const x = -0.06; for (let i = 0; i <= 8; i++) ctx.lineTo(x + (i % 2 ? 0.012 : -0.006) * (half ? -1 : 1), -0.05 + i * 0.013); ctx.lineWidth = lw * 1.6; ctx.stroke(); }
    ctx.restore();
  }
  // yakın (sağ) kanat ve iki motor: yıldırımdan sonra kopar
  ctx.save();
  if (wg > 0) { ctx.translate(-0.12 * wg, 0.42 * wg * wg + 0.05 * wg); ctx.rotate(1.1 * wg); }
  ctx.beginPath(); ctx.moveTo(0.1, 0.03); ctx.lineTo(-0.14, 0.03); ctx.lineTo(-0.22, 0.075); ctx.lineTo(0.06, 0.075); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  for (const ex of [0.11, -0.03]) {
    ctx.beginPath(); ctx.ellipse(ex, 0.05, 0.05, 0.014, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    const pl = Math.abs(Math.cos(pose.prop || 0)) * 0.045 + 0.006; ctx.beginPath(); ctx.moveTo(ex + 0.055, 0.05 - pl); ctx.lineTo(ex + 0.055, 0.05 + pl); ctx.lineWidth = lw * 1.4; ctx.stroke();
  }
  if ((pose.fire || 0) > 0) {
    // alev: kanat kökünde titreyen mürekkep dilleri (faz pervaneyle aynı saatten)
    const f = pose.fire, ph = pose.prop || 0;
    for (let i = 0; i < 4; i++) { const x = 0.02 - i * 0.035, h = (0.05 + 0.03 * Math.abs(Math.sin(ph * 0.7 + i * 1.7))) * f; ctx.beginPath(); ctx.moveTo(x - 0.012, 0.03); ctx.quadraticCurveTo(x - 0.016, 0.03 - h * 0.6, x - 0.03, 0.03 - h); ctx.quadraticCurveTo(x + 0.008, 0.03 - h * 0.5, x + 0.012, 0.03); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); }
  }
  ctx.restore();
  ctx.restore();
}

// ——— Koltuk sırası (önden) ortada Juliane, kemerli. Kök: sıranın ortası; birim = koltuk yüksekliği ———
export const SEAT_CARD = Object.freeze({ name: 'üçlü koltuk sırası, ortada Juliane (17, omuz boyu saç)', stroke: 0.02 });
export function drawSeat(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(pose.spin || 0); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size);
  for (let i = -1; i <= 1; i++) {
    const x = i * 0.44;
    ctx.beginPath(); ctx.roundRect(x - 0.2, -0.5, 0.4, 0.72, 0.08); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    if (i !== 0) hatchClip(ctx, () => { ctx.beginPath(); ctx.roundRect(x - 0.2, -0.5, 0.4, 0.72, 0.08); }, 0.05, 60, lw * 0.5);
    ctx.beginPath(); ctx.roundRect(x - 0.21, 0.18, 0.42, 0.16, 0.05); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  }
  // Juliane: baş, saç, omuz; kemer kucakta
  ctx.beginPath(); ctx.moveTo(-0.15, 0.2); ctx.quadraticCurveTo(-0.15, -0.12, 0, -0.14); ctx.quadraticCurveTo(0.15, -0.12, 0.15, 0.2); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.27, 0.1, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.11, -0.16); ctx.quadraticCurveTo(-0.14, -0.38, 0, -0.39); ctx.quadraticCurveTo(0.14, -0.38, 0.11, -0.16); ctx.lineTo(0.08, -0.26); ctx.quadraticCurveTo(0, -0.33, -0.08, -0.26); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  if (pose.eyes !== 'closed') { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-0.035, -0.26, 0.012, 0, Math.PI * 2); ctx.arc(0.035, -0.26, 0.012, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.lineWidth = lw * 0.7; ctx.beginPath(); ctx.moveTo(-0.05, -0.26); ctx.lineTo(-0.02, -0.26); ctx.moveTo(0.02, -0.26); ctx.lineTo(0.05, -0.26); ctx.stroke(); }
  ctx.lineWidth = lw * 2.2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-0.2, 0.14); ctx.lineTo(0.2, 0.14); ctx.stroke();
  ctx.fillStyle = PAPER; ctx.fillRect(-0.035, 0.115, 0.07, 0.05); ctx.lineWidth = lw * 0.8; ctx.strokeRect(-0.035, 0.115, 0.07, 0.05);
  ctx.restore();
}

// ——— Juliane yürür (yandan, sağa). Kök: ayak tabanı; birim = boy. Sağ kol göğüste (kırık köprücük kemiği) ———
export const JULIANE_CARD = Object.freeze({ name: 'Juliane Koepcke (17, kısa elbise, omuz boyu saç)', stroke: 0.014 });
export function drawJuliane(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), ph = pose.phase || 0, limb = limbFn(ctx, lw);
  const s = Math.sin(ph), c = Math.cos(ph);
  // bacaklar: kalça (0, -0.48); adım ±22°
  const leg = (a, k) => { const kx = Math.sin(a) * 0.24, ky = -0.48 + Math.cos(a) * 0.24, b = a - k; limb(0, -0.48, kx, ky, 0.05); limb(kx, ky, kx + Math.sin(b) * 0.23, ky + Math.cos(b) * 0.23, 0.045); };
  leg(-0.38 * s, Math.max(0, -c) * 0.5); leg(0.38 * s, Math.max(0, c) * 0.5);
  // elbise
  ctx.beginPath(); ctx.moveTo(-0.07, -0.78); ctx.lineTo(0.07, -0.78); ctx.lineTo(0.13, -0.42); ctx.lineTo(-0.12, -0.42); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.moveTo(-0.07, -0.78); ctx.lineTo(0.07, -0.78); ctx.lineTo(0.13, -0.42); ctx.lineTo(-0.12, -0.42); ctx.closePath(); }, 0.03, 70, lw * 0.5);
  // sol kol sallanır; sağ kol göğse bükülü
  limb(0, -0.76, Math.sin(-0.5 * s) * 0.15, -0.62, 0.035); limb(Math.sin(-0.5 * s) * 0.15, -0.62, Math.sin(-0.5 * s) * 0.2 + 0.02, -0.5, 0.032);
  limb(0.02, -0.76, 0.1, -0.66, 0.035); limb(0.1, -0.66, 0.03, -0.62, 0.032);
  // baş ve saç
  ctx.beginPath(); ctx.arc(0.02, -0.87, 0.065, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.07, -0.9); ctx.quadraticCurveTo(0.04, -0.97, -0.04, -0.93); ctx.quadraticCurveTo(-0.08, -0.86, -0.06, -0.77); ctx.lineTo(-0.02, -0.8); ctx.quadraticCurveTo(-0.02, -0.88, 0.07, -0.9); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0.06, -0.875, 0.009, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ——— Korucu Roy Sullivan (yandan, sağa). Kök: ayak tabanı; birim = boy ———
export const ROY_CARD = Object.freeze({ name: 'Roy Sullivan, park korucusu (kampanya şapkası, rozetli gömlek)', stroke: 0.014 });
// pose: { phase: yürüme fazı, walk: 0|1, fish: 0..1 (olta), fire: 0..1 (saç tutuşur), jolt: 0..1 (çarpma anı), t }
export function drawRoy(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), limb = limbFn(ctx, lw), w = pose.walk ? 1 : 0, ph = pose.phase || 0, j = pose.jolt || 0;
  const s = Math.sin(ph) * w;
  const leg = (a) => { const kx = Math.sin(a) * 0.25, ky = -0.5 + Math.cos(a) * 0.25; limb(0, -0.5, kx, ky, 0.06); limb(kx, ky, kx + Math.sin(a * 0.6) * 0.24, ky + Math.cos(a * 0.6) * 0.24, 0.055); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(kx + Math.sin(a * 0.6) * 0.24 + 0.03, ky + Math.cos(a * 0.6) * 0.24, 0.045, 0.018, 0, 0, Math.PI * 2); ctx.fill(); };
  leg(-0.4 * s - 0.1 * j); leg(0.4 * s + 0.1 * j);
  // gövde: gömlek, kemer, rozet
  ctx.beginPath(); ctx.moveTo(-0.09, -0.82); ctx.lineTo(0.09, -0.82); ctx.lineTo(0.08, -0.5); ctx.lineTo(-0.08, -0.5); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(-0.085, -0.54, 0.17, 0.03);
  ctx.beginPath(); ctx.moveTo(0.04, -0.74); ctx.lineTo(0.065, -0.72); ctx.lineTo(0.04, -0.68); ctx.lineTo(0.015, -0.72); ctx.closePath(); ctx.fill();
  // kollar: yürürken sallanır, oltada öne uzanır, çarpmada iki yana açılır
  const fa = pose.fish || 0;
  const arm = (side) => {
    const sw = -0.45 * s * side;
    const ex = lerp(lerp(Math.sin(sw) * 0.16, 0.14, fa), side * 0.2, j), ey = lerp(lerp(-0.66, -0.68, fa), -0.8, j);
    const hx = lerp(lerp(Math.sin(sw) * 0.2 + 0.02, 0.26, fa), side * 0.3, j), hy = lerp(lerp(-0.52, -0.62, fa), -0.94, j);
    limb(0, -0.8, ex, ey, 0.045); limb(ex, ey, hx, hy, 0.04); return [hx, hy];
  };
  arm(-1); const hand = arm(1);
  if (fa > 0) { ctx.lineWidth = lw * 1.2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(hand[0] - 0.04, hand[1] + 0.03); ctx.lineTo(hand[0] + 0.42 * fa, hand[1] - 0.36 * fa); ctx.stroke(); ctx.lineWidth = lw * 0.5; ctx.beginPath(); ctx.moveTo(hand[0] + 0.42 * fa, hand[1] - 0.36 * fa); ctx.lineTo(hand[0] + 0.46 * fa, hand[1] + 0.55 * fa); ctx.stroke(); }
  // baş
  ctx.beginPath(); ctx.arc(0.02, -0.9, 0.065, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.06, -0.9, 0.009, 0, Math.PI * 2); ctx.fill();
  // saç tutuşur: şapkanın arkasından titreyen alev dilleri
  if ((pose.fire || 0) > 0) {
    const f = pose.fire, tt = pose.t || 0;
    for (let i = 0; i < 3; i++) { const x = -0.05 + i * 0.035, h = (0.07 + 0.04 * Math.abs(Math.sin(tt * 13 + i * 2.1))) * f; ctx.beginPath(); ctx.moveTo(x - 0.018, -0.96); ctx.quadraticCurveTo(x - 0.025, -0.96 - h * 0.6, x - 0.04, -0.96 - h); ctx.quadraticCurveTo(x + 0.012, -0.96 - h * 0.5, x + 0.018, -0.96); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); }
  }
  // kampanya şapkası: geniş düz siper, sıkıştırılmış tepe
  ctx.beginPath(); ctx.ellipse(0.02, -0.955, 0.15, 0.022, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.055, -0.96); ctx.lineTo(-0.04, -1.04); ctx.lineTo(0.02, -1.07); ctx.lineTo(0.08, -1.04); ctx.lineTo(0.095, -0.96); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.02, -1.07); ctx.lineTo(0.02, -1.0); ctx.lineWidth = lw * 0.6; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(-0.055, -0.985, 0.15, 0.02);
  ctx.restore();
}

// ——— yıldırım: tohumlu zikzak; uçlar sabit, ara noktalar dik yönde sapar; iki dal. Kâğıt hale + renk ———
export function drawBolt(ctx, x0, y0, x1, y1, seed, { w = 5, color = INK, branches = 2, jitter = 0.13, halo = true } = {}) {
  const r = mulberry32(seed), n = 9, L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
  const P = []; for (let i = 0; i <= n; i++) { const u = i / n, o = i === 0 || i === n ? 0 : (r() * 2 - 1) * L * jitter * (1 - Math.abs(u - 0.5)); P.push([lerp(x0, x1, u) + nx * o, lerp(y0, y1, u) + ny * o]); }
  const B = []; for (let k = 0; k < branches; k++) { const i = 2 + Math.floor(r() * (n - 4)), [bx, by] = P[i], ang = Math.atan2(y1 - y0, x1 - x0) + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.4), len = L * (0.14 + r() * 0.12); const Q = [[bx, by]]; for (let m = 1; m <= 3; m++) Q.push([bx + Math.cos(ang) * len * m / 3 + (r() * 2 - 1) * len * 0.15, by + Math.sin(ang) * len * m / 3 + (r() * 2 - 1) * len * 0.15]); B.push(Q); }
  const stroke = (pts, lwid, col) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = lwid; ctx.strokeStyle = col; ctx.lineJoin = 'miter'; ctx.lineCap = 'round'; ctx.stroke(); };
  if (halo) { stroke(P, w + 8, PAPER); B.forEach(Q => stroke(Q, w * 0.5 + 6, PAPER)); }
  stroke(P, w, color); B.forEach(Q => stroke(Q, w * 0.5, color));
}
// küçük yıldırım simgesi (çetele): birim = boy
export function boltGlyph(ctx, x, y, h, color = INK, fill = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(h, h);
  ctx.beginPath(); ctx.moveTo(0.12, -0.5); ctx.lineTo(-0.2, 0.05); ctx.lineTo(0.02, 0.05); ctx.lineTo(-0.12, 0.5); ctx.lineTo(0.22, -0.08); ctx.lineTo(0.0, -0.08); ctx.lineTo(0.16, -0.5); ctx.closePath();
  if (fill) { ctx.fillStyle = color; ctx.fill(); } ctx.lineWidth = 2.2 / h; ctx.strokeStyle = color; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

// ——— orman tepesi (yandan): iki sıra; her taç üç dairenin birleşimi (önce mürekkep, sonra kâğıt: tek kontur),
// gölge tarafı taralı. x0..x1, taç tabanı y; altı zemin kâğıdıyla dolar ———
export function drawCanopy(ctx, x0, x1, y, seed, sc = 1) {
  const r = mulberry32(seed);
  const row = (yy, s, ink) => { const cs = []; for (let x = x0 - 40; x < x1 + 60; x += (46 + r() * 30) * s) { const R = (30 + r() * 18) * s; cs.push([x, yy - r() * 18 * s, R], [x - R * 0.7, yy + R * 0.25, R * 0.72], [x + R * 0.75, yy + R * 0.2, R * 0.68]); } return { cs, ink }; };
  const rows = [row(y - 34 * sc, 0.8 * sc, '#8B8577'), row(y, sc, INK)];
  for (const { cs, ink } of rows) {
    ctx.fillStyle = ink; for (const [x, yy, R] of cs) { ctx.beginPath(); ctx.arc(x, yy, R + 2.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = PAPER; for (const [x, yy, R] of cs) { ctx.beginPath(); ctx.arc(x, yy, R, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    for (const [x, yy, R] of cs) { ctx.save(); ctx.beginPath(); ctx.arc(x, yy, R, -0.1 * Math.PI, 0.75 * Math.PI); ctx.lineTo(x + R * 0.1, yy - R * 0.1); ctx.closePath(); ctx.clip(); for (let d = -R * 2; d < R * 2; d += 5) { ctx.beginPath(); ctx.moveTo(x + d, yy - R); ctx.lineTo(x + d + R, yy + R); ctx.stroke(); } ctx.restore(); }
    ctx.fillStyle = PAPER; ctx.fillRect(x0, y + 26 * sc, x1 - x0, 1200);
  }
  ctx.beginPath(); ctx.moveTo(x0, y + 26 * sc); ctx.lineTo(x1, y + 26 * sc); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
}
// bulut kümesi: elipslerin birleşimi tek kontur; alt yarısı yatay taralı (fırtına)
export function drawCloud(ctx, cx, cy, s, seed) {
  const r = mulberry32(seed), E = [];
  for (let i = 0; i < 6; i++) E.push([cx + (i - 2.5) * 34 * s + (r() - 0.5) * 20 * s, cy + (r() - 0.5) * 16 * s - (i > 0 && i < 5 ? 14 * s : 0), (44 + r() * 26) * s, (24 + r() * 14) * s]);
  const path = (g = 0) => { ctx.beginPath(); for (const [x, y, a, b] of E) { ctx.moveTo(x + a + g, y); ctx.ellipse(x, y, a + g, b + g, 0, 0, Math.PI * 2); } };
  path(2.6); ctx.fillStyle = INK; ctx.fill(); path(0); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); path(0); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 1.3; for (let y = cy - 4 * s; y < cy + 60 * s; y += 4.5) { ctx.beginPath(); ctx.moveTo(cx - 260 * s, y); ctx.lineTo(cx + 260 * s, y); ctx.stroke(); } ctx.restore();
}

// ——— durum simgeleri (yandan); kök: taban ortası; birim = boy ———
export function drawTower(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-0.22, 0); ctx.lineTo(-0.1, -0.75); ctx.moveTo(0.22, 0); ctx.lineTo(0.1, -0.75); for (let k = 0; k < 4; k++) { const y0 = -k * 0.19, y1 = y0 - 0.19, xa = 0.22 - k * 0.03, xb = xa - 0.03; ctx.moveTo(-xa, y0); ctx.lineTo(xb, y1); ctx.moveTo(xa, y0); ctx.lineTo(-xb, y1); } ctx.stroke();
  ctx.beginPath(); ctx.rect(-0.17, -0.95, 0.34, 0.2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(-0.12, -0.9, 0.24, 0.07);
  ctx.beginPath(); ctx.moveTo(-0.22, -0.95); ctx.lineTo(0, -1.05); ctx.lineTo(0.22, -0.95); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.restore();
}
export function drawTruck(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-0.5, -0.12); ctx.lineTo(-0.5, -0.36); ctx.lineTo(0.02, -0.36); ctx.lineTo(0.06, -0.62); ctx.lineTo(0.3, -0.62); ctx.lineTo(0.36, -0.38); ctx.lineTo(0.5, -0.34); ctx.lineTo(0.5, -0.12); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.1, -0.58); ctx.lineTo(0.27, -0.58); ctx.lineTo(0.32, -0.4); ctx.lineTo(0.1, -0.4); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  for (const x of [-0.3, 0.32]) { ctx.beginPath(); ctx.arc(x, -0.11, 0.11, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); ctx.beginPath(); ctx.arc(x, -0.11, 0.04, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); }
  ctx.restore();
}
export function drawCabin(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.rect(-0.45, -0.5, 0.9, 0.5); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  for (let y = -0.42; y < 0; y += 0.08) { ctx.beginPath(); ctx.moveTo(-0.45, y); ctx.lineTo(0.45, y); ctx.lineWidth = lw * 0.6; ctx.stroke(); }
  ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-0.56, -0.48); ctx.lineTo(0, -0.86); ctx.lineTo(0.56, -0.48); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.moveTo(-0.56, -0.48); ctx.lineTo(0, -0.86); ctx.lineTo(0.56, -0.48); ctx.closePath(); }, 0.04, 30, lw * 0.6);
  ctx.beginPath(); ctx.rect(0.1, -0.36, 0.18, 0.36); ctx.fillStyle = INK; ctx.fill(); ctx.beginPath(); ctx.rect(-0.32, -0.36, 0.2, 0.16); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.restore();
}
// orman kulübesi: kazıklar üstünde, yaprak çatı
export function drawHut(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  for (const x of [-0.36, -0.12, 0.12, 0.36]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, -0.28); ctx.stroke(); }
  ctx.beginPath(); ctx.rect(-0.42, -0.3, 0.84, 0.06); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.5, -0.3); ctx.lineTo(0, -0.75); ctx.lineTo(0.5, -0.3); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  for (let k = 0; k < 7; k++) { const x = -0.42 + k * 0.14; ctx.beginPath(); ctx.moveTo(x, -0.3); ctx.lineTo(lerp(x, 0, 0.6), -0.57); ctx.lineWidth = lw * 0.6; ctx.stroke(); }
  ctx.restore();
}

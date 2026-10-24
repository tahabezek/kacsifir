// "Voyager" nesneleri: Voyager 1 sondası (yüksek kazançlı çanak, on köşeli gövde, manyetometre kolu, RTG kolu,
// bilim kolu ve tarama platformu), Derin Uzay Ağı çanağı, Jüpiter ve Satürn yakın planları, sinyal dalgası.
// Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yok.
// Birim: sondada çanak çapı = 1 (size px), kök çanağın merkezi.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -2; d < 2; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 2, -dx * d - dy * 2); ctx.lineTo(dy * d + dx * 2, -dx * d + dy * 2); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };

export const VOYAGER_CARD = Object.freeze({ name: 'Voyager 1 (3,7 m çanak, 13 m manyetometre kolu, 3 RTG, tarama platformu)', stroke: 0.012 });
// pose: { tilt: rad, detail: 0..1 (küçük boyda ince ayrıntılar söner) }
export function drawVoyager(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(pose.tilt || 0); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), det = pose.detail ?? 1;
  ctx.strokeStyle = INK; ctx.fillStyle = PAPER;
  // manyetometre kolu: uzun, ince, bölmeli (sol üste)
  ctx.lineWidth = lw * 1.2; ctx.beginPath(); ctx.moveTo(-0.08, 0.42); ctx.lineTo(-1.55, -0.62); ctx.stroke();
  if (det > 0.3) for (let k = 1; k < 9; k++) { const u = k / 9, x = -0.08 + (-1.47) * u, y = 0.42 + (-1.04) * u; ctx.beginPath(); ctx.moveTo(x - 0.025, y + 0.035); ctx.lineTo(x + 0.025, y - 0.035); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(-1.55, -0.62, 0.035, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  // RTG kolu: sol alta, ucunda üç silindir
  ctx.lineWidth = lw * 1.6; ctx.beginPath(); ctx.moveTo(-0.1, 0.5); ctx.lineTo(-0.82, 0.86); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-0.5 - i * 0.13, 0.7 + i * 0.065); ctx.rotate(0.46); poly(ctx, [[-0.06, -0.05], [0.06, -0.05], [0.06, 0.05], [-0.06, 0.05]]); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, () => poly(ctx, [[-0.06, -0.05], [0.06, -0.05], [0.06, 0.05], [-0.06, 0.05]]), 0.018, 0, lw * 0.6); poly(ctx, [[-0.06, -0.05], [0.06, -0.05], [0.06, 0.05], [-0.06, 0.05]]); ctx.lineWidth = lw; ctx.stroke(); ctx.restore(); }
  // bilim kolu: sağ alta, ucunda tarama platformu (kameralar)
  ctx.lineWidth = lw * 1.6; ctx.beginPath(); ctx.moveTo(0.12, 0.5); ctx.lineTo(0.78, 0.82); ctx.stroke();
  poly(ctx, [[0.7, 0.72], [0.92, 0.72], [0.92, 0.9], [0.7, 0.9]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.81, 0.81, 0.045, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  poly(ctx, [[0.92, 0.76], [1.02, 0.74], [1.02, 0.84], [0.92, 0.84]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  // on köşeli gövde (çanağın arkasında, alt)
  const bus = () => poly(ctx, Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return [Math.cos(a) * 0.22, 0.48 + Math.sin(a) * 0.1]; }));
  bus(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, bus, 0.02, 90, lw * 0.7); bus(); ctx.lineWidth = lw; ctx.stroke();
  // yüksek kazançlı çanak: hafif eğik elips, iç halkalar (gravür), merkezde besleme boynuzu ve üç destek
  ctx.beginPath(); ctx.ellipse(0, 0, 0.5, 0.42, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 0.5, 0.42, 0, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.6; for (let r = 0.06; r < 0.5; r += 0.045) { ctx.beginPath(); ctx.ellipse(0.02, 0.02, r, r * 0.84, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (det > 0.3) for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 0.5, Math.sin(a) * 0.42); ctx.stroke(); }
  // gölge hilali (sağ alt, sık tarama)
  ctx.beginPath(); ctx.ellipse(0, 0, 0.5, 0.42, 0, 0, Math.PI * 2); ctx.ellipse(-0.07, -0.06, 0.5, 0.42, 0, 0, Math.PI * 2); ctx.clip('evenodd');
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.8; for (let d = -1; d < 1; d += 0.016) { ctx.beginPath(); ctx.moveTo(d - 0.5, -0.5); ctx.lineTo(d + 0.5, 0.5); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, 0, 0.5, 0.42, 0, 0, Math.PI * 2); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = lw; for (const a of [0.5, 2.6, 4.7]) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.46, Math.sin(a) * 0.38); ctx.lineTo(-0.02, -0.04); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(-0.02, -0.04, 0.05, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Derin Uzay Ağı çanağı (70 m): kaide, ayak, gökyüzüne dönük parabol; birim = çanak çapı; kök zemin ortası
export function drawDSN(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size; ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.fillStyle = PAPER; ctx.lineWidth = lw;
  poly(ctx, [[-0.28, 0], [0.28, 0], [0.2, -0.22], [-0.2, -0.22]]); ctx.fill(); hatchClip(ctx, () => poly(ctx, [[-0.28, 0], [0.28, 0], [0.2, -0.22], [-0.2, -0.22]]), 0.03, 0, lw * 0.6); poly(ctx, [[-0.28, 0], [0.28, 0], [0.2, -0.22], [-0.2, -0.22]]); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.06, -0.22); ctx.lineTo(-0.02, -0.4); ctx.moveTo(0.06, -0.22); ctx.lineTo(0.02, -0.4); ctx.stroke();
  ctx.save(); ctx.translate(0, -0.42); ctx.rotate(-0.5);
  ctx.beginPath(); ctx.moveTo(-0.5, -0.12); ctx.quadraticCurveTo(0, 0.22, 0.5, -0.12); ctx.lineTo(0.5, -0.1); ctx.quadraticCurveTo(0, 0.12, -0.5, -0.1); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -0.11, 0.5, 0.07, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.6; for (let r = 0.08; r < 0.5; r += 0.07) { ctx.beginPath(); ctx.ellipse(0, -0.11, r, r * 0.14, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-0.3, -0.1); ctx.lineTo(0, -0.42); ctx.lineTo(0.3, -0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.42, 0.03, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
  ctx.restore();
}

// Jüpiter: bantlı disk, Büyük Kırmızı Leke (yalnız kontur); r px; faz t (bantlar yavaş kayar)
export function drawJupiter(ctx, r, t) {
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.clip();
  const bands = [[-0.62, 0.08], [-0.38, 0.11], [-0.12, 0.06], [0.1, 0.12], [0.36, 0.08], [0.6, 0.07]];
  for (const [y, h] of bands) { ctx.save(); ctx.beginPath(); ctx.rect(-r, (y - h / 2) * r, 2 * r, h * r); ctx.clip(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; for (let x = -r * 2; x < r * 2; x += 5) { const xx = x + ((t * 14) % 5); ctx.beginPath(); ctx.moveTo(xx, (y - h / 2) * r); ctx.lineTo(xx + h * r, (y + h / 2) * r); ctx.stroke(); } ctx.restore(); }
  ctx.beginPath(); ctx.ellipse(r * 0.25 + Math.sin(t * 0.3) * 4, r * 0.28, r * 0.17, r * 0.09, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke();
  // gece yüzü (sağ)
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.arc(-r * 0.25, 0, r * 1.02, 0, Math.PI * 2); ctx.clip('evenodd'); ctx.strokeStyle = INK; ctx.lineWidth = 1; for (let d = -r * 3; d < r * 3; d += 4) { ctx.beginPath(); ctx.moveTo(d - r, -r); ctx.lineTo(d + r, r); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
}

// Satürn: disk ve halkalar (ön halka diskin önünden geçer); r px
export function drawSaturn(ctx, r, t) {
  const ring = (front) => { ctx.save(); ctx.beginPath(); if (front) ctx.rect(-r * 3, 0, r * 6, r * 3); else ctx.rect(-r * 3, -r * 3, r * 6, r * 3); ctx.clip(); for (const k of [1.35, 1.6, 1.85, 2.05]) { ctx.beginPath(); ctx.ellipse(0, 0, r * k, r * k * 0.28, -0.18, 0, Math.PI * 2); ctx.lineWidth = k === 1.6 ? 6 : 2; ctx.strokeStyle = k === 1.6 ? GRAPH : INK; ctx.stroke(); } ctx.restore(); };
  ring(false);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.clip();
  ctx.strokeStyle = GRAPH; ctx.lineWidth = 1.2; for (let y = -r; y < r; y += 7) { ctx.beginPath(); ctx.moveTo(-r, y + Math.sin(t + y) * 0.5); ctx.lineTo(r, y); ctx.stroke(); }
  ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  ring(true);
}

// sinyal dalgası: yöne bakan üç yay; u 0..1 faz
export function drawWaves(ctx, ang, u, s = 1) {
  ctx.save(); ctx.rotate(ang); ctx.strokeStyle = INK; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const v = (u + k / 3) % 1; ctx.globalAlpha = 1 - v; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(0, 0, (10 + v * 34) * s, -0.6, 0.6); ctx.stroke(); }
  ctx.restore();
}

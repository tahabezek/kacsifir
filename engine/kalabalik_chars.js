// "Kalabalık" karakterleri: üstten görülen insan (baş + omuzlar) ve yandan küçük yürüyen kişi.
// Tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur). Birim: omuz genişliği = 1 (size px).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

export const TOP_CARD = Object.freeze({ name: 'üstten insan (omuz 0,45 m, baş 0,2 m)', shoulder: 1, head: 0.42, stroke: 0.06 });
// pose: { ang: rad (yüzün baktığı yön), hair: 0..1 (saç koyuluğu), sway: px }
export function drawPersonTop(ctx, card, pose, size) {
  ctx.save(); ctx.rotate(pose.ang || 0); ctx.scale(size, size); ctx.lineJoin = 'round';
  const lw = Math.max(card.stroke, 1.3 / size);
  // omuzlar: yuvarlak köşeli elips
  ctx.beginPath(); ctx.ellipse(0, 0, 0.5, 0.24, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // kol çizgileri
  ctx.beginPath(); ctx.moveTo(-0.36, -0.12); ctx.lineTo(-0.36, 0.14); ctx.moveTo(0.36, -0.12); ctx.lineTo(0.36, 0.14); ctx.lineWidth = lw * 0.7; ctx.stroke();
  // baş ve saç
  ctx.beginPath(); ctx.arc(0, 0.02, card.head / 2, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0.06, card.head / 2 - lw, Math.PI * 0.05, Math.PI * 0.95); ctx.fillStyle = (pose.hair ?? 1) > 0.5 ? INK : GRAPH; ctx.fill();
  // burun yönü
  ctx.beginPath(); ctx.moveTo(-0.03, -0.19); ctx.lineTo(0, -0.25); ctx.lineTo(0.03, -0.19); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// yandan küçük kişi (akan kalabalık için): boy = 1, kök ayak; phase ile yürür
export function drawWalker(ctx, phase, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.09, 1.4 / size);
  const w = Math.sin(phase * Math.PI * 2);
  ctx.beginPath(); ctx.moveTo(0, -0.5); ctx.lineTo(0.18 * w, 0); ctx.moveTo(0, -0.5); ctx.lineTo(-0.18 * w, 0); ctx.moveTo(0, -0.5); ctx.lineTo(0, -0.85); ctx.moveTo(0, -0.78); ctx.lineTo(-0.16 * w, -0.5); ctx.moveTo(0, -0.78); ctx.lineTo(0.16 * w, -0.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.95, 0.1, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.restore();
}

// "Otomobil" karakterleri: yandan sedan (gravür: kâğıt gövde, mürekkep kontur, cam taraması, dönen jantlar).
// Tek çizim fonksiyonu; boy = 1 (size px = otomobil boyu), kök tekerleklerin yere değdiği orta nokta, sağa gider.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

export const CAR_CARD = Object.freeze({ name: 'sedan (4,5 m; tavan 1,45 m)', len: 1, roof: 0.32, stroke: 0.012 });
// pose: { wheel: rad (jant açısı), tone: 0..1 (gövde taraması), bob: px }
export function drawCar(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.3 / size), r = 0.075;
  const body = () => { ctx.beginPath(); ctx.moveTo(-0.5, -0.07); ctx.lineTo(-0.5, -0.17); ctx.quadraticCurveTo(-0.46, -0.2, -0.3, -0.21); ctx.lineTo(-0.2, -0.31); ctx.quadraticCurveTo(-0.12, -0.33, 0.08, -0.32); ctx.lineTo(0.2, -0.21); ctx.lineTo(0.44, -0.19); ctx.quadraticCurveTo(0.5, -0.17, 0.5, -0.1); ctx.lineTo(0.5, -0.07); ctx.closePath(); };
  body(); ctx.fillStyle = PAPER; ctx.fill();
  if (pose.tone) { ctx.save(); body(); ctx.clip(); ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.6; for (let x = -0.6; x < 0.6; x += 0.03 / pose.tone) { ctx.beginPath(); ctx.moveTo(x, -0.35); ctx.lineTo(x + 0.25, 0); ctx.stroke(); } ctx.restore(); }
  body(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // camlar
  ctx.beginPath(); ctx.moveTo(-0.27, -0.215); ctx.lineTo(-0.19, -0.295); ctx.lineTo(-0.06, -0.3); ctx.lineTo(-0.06, -0.215); ctx.closePath(); ctx.moveTo(-0.03, -0.215); ctx.lineTo(-0.03, -0.3); ctx.lineTo(0.07, -0.298); ctx.lineTo(0.16, -0.215); ctx.closePath();
  ctx.fillStyle = INK; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1;
  // kapı çizgisi, far
  ctx.beginPath(); ctx.moveTo(-0.045, -0.2); ctx.lineTo(-0.045, -0.08); ctx.lineWidth = lw * 0.7; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.47, -0.15, 0.015, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  // tekerlekler
  for (const x of [-0.3, 0.3]) {
    ctx.beginPath(); ctx.arc(x, -r, r, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
    ctx.beginPath(); ctx.arc(x, -r, r * 0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
    const a = pose.wheel || 0; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.45, -r + Math.sin(a) * r * 0.45); ctx.lineTo(x - Math.cos(a) * r * 0.45, -r - Math.sin(a) * r * 0.45); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  }
  ctx.restore();
}

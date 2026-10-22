// "Kaya" karakterleri: çekiç ve keskiyle vuran adam (Manjhi), sığınaktaki madenci noktası, Fénix kapsülü, not kâğıdı.
// Tek çizim fonksiyonları; boy = 1, kök ayak tabanı. Gravür dili.
const INK = '#1C1B18', PAPER = '#F4EEE1';
const rad = d => (d * Math.PI) / 180;

export const MANJHI_CARD = Object.freeze({ name: 'Manjhi (zayıf, sakallı, başında sarık, çekiç ve keski)', stroke: 0.014 });
// pose: { swing: 0..1 (0 kalkık, 1 vuruş anı) } — sağa bakar, keski sol elde kayaya dayalı
export function drawManjhi(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), sw = pose.swing ?? 0;
  const limb = (x0, y0, x1, y1, w) => { ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = PAPER; ctx.lineWidth = w - lw * 0.2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  // diz çökmüş duruş: arka diz yerde, ön ayak basık
  // arka bacak: diz yerde, kaval yere yatık; ön bacak: çömelmiş, ayak basık
  limb(-0.02, -0.38, -0.05, -0.05, 0.055); limb(-0.05, -0.05, -0.3, -0.03, 0.05);
  limb(0.03, -0.38, 0.19, -0.33, 0.055); limb(0.19, -0.33, 0.17, -0.02, 0.05);
  ctx.beginPath(); ctx.ellipse(0.2, -0.015, 0.045, 0.016, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  // gövde (öne eğik), dhoti
  ctx.beginPath(); ctx.moveTo(-0.06, -0.66); ctx.lineTo(0.08, -0.64); ctx.lineTo(0.07, -0.38); ctx.lineTo(-0.07, -0.38); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.08, -0.42); ctx.lineTo(0.09, -0.42); ctx.lineTo(0.12, -0.3); ctx.lineTo(-0.1, -0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
  // keski: sol el, kayaya dayalı (sağda)
  limb(0.06, -0.62, 0.2, -0.5, 0.04); ctx.lineWidth = 0.018; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0.2, -0.5); ctx.lineTo(0.32, -0.47); ctx.stroke();
  // çekiç kolu: omuzdan yay çizerek keskiye iner
  // kalkık (yukarı-geri) → vuruş (keskinin başına): üst kol −115° → +15°, ön kol bileğe doğru açılır
  const a = rad(lerp(-115, 15, sw)), ex = 0.04 + Math.cos(a) * 0.14, ey = -0.64 + Math.sin(a) * 0.14;
  const b = a + rad(lerp(-25, 20, sw)), hx = ex + Math.cos(b) * 0.13, hy = ey + Math.sin(b) * 0.13;
  limb(0.04, -0.64, ex, ey, 0.04); limb(ex, ey, hx, hy, 0.038);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(b + Math.PI / 2); ctx.fillStyle = INK; ctx.fillRect(-0.008, -0.12, 0.016, 0.12); ctx.fillRect(-0.04, -0.15, 0.08, 0.04); ctx.restore();
  // baş: sarık, sakal
  ctx.beginPath(); ctx.arc(0.04, -0.74, 0.055, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.035, -0.785, 0.062, 0.03, -0.1, Math.PI, 0); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-0.02, -0.79 + i * 0.012); ctx.lineTo(0.09, -0.8 + i * 0.012); ctx.lineWidth = lw * 0.5; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0.05, -0.72, 0.045, 0.15 * Math.PI, 0.85 * Math.PI); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0.075, -0.75, 0.008, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
const lerp = (a, b, u) => a + (b - a) * u;

// Fénix kapsülü: dar uzun silindir, kafes çizgili; birim = boy
export function drawCapsule(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size + 0.01;
  ctx.beginPath(); ctx.roundRect(-0.12, -0.5, 0.24, 1, 0.1); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  for (let y = -0.38; y < 0.45; y += 0.12) { ctx.beginPath(); ctx.moveTo(-0.12, y); ctx.lineTo(0.12, y); ctx.lineWidth = lw * 0.6; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, -0.5); ctx.lineTo(0, -0.7); ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}

// not kâğıdı (el yazısı yerine mürekkep satırlar + kısa metin); birim = genişlik
export function drawNote(ctx, size, text, F) {
  ctx.save(); ctx.translate(0, 0); ctx.rotate(-0.05);
  const w = size, h = size * 0.62;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2 + 4); ctx.lineTo(w / 2 - 3, h / 2); ctx.lineTo(-w / 2 + 2, h / 2 - 3); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  if (text) { ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = F; const ls = text.split('\n'); ls.forEach((s, i) => ctx.fillText(s, 0, -h / 2 + h * (0.34 + i * 0.32))); }
  ctx.restore();
}

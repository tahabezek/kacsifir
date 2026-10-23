// "Saat" karakterleri ve nesneleri: Randy Gardner (17, 1963), iki arkadaşı, Clive Wearing (müzisyen, şef), karısı Deborah,
// piyano, kronometre ve 24 saatlik kadran. Tek kişi çizim fonksiyonu (iskelet: eklem açıları), kimlik kartla kilitli.
// Birim: kişide boy = 1 (size px), kök ayak tabanı, sağa bakar. Gravür dili; kırmızı yok.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;
const lerp = (a, b, u) => a + (b - a) * u;

function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -1.2; d < 1.2; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 1.2, -dx * d - dy * 1.2); ctx.lineTo(dy * d + dx * 1.2, -dx * d + dy * 1.2); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function limb(ctx, x0, y0, x1, y1, w, lw, fill = PAPER) { ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = fill; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }

// Kimlik kartları (oranlar baş = 0,12 boy; palet: kâğıt / mürekkep / grafit tarama)
export const RANDY_CARD = Object.freeze({ name: 'Randy Gardner (17, 1963: kısa saç, açık renk kazak, koyu pantolon)', hair: 'short', top: 'sweater', trousers: 'ink', glasses: false, skirt: false, stroke: 0.012 });
export const FRIEND_CARD = Object.freeze({ name: 'arkadaş (gömlek, defter tutar)', hair: 'side', top: 'shirt', trousers: 'ink', glasses: false, skirt: false, stroke: 0.012 });
export const FRIEND2_CARD = Object.freeze({ name: 'ikinci arkadaş (çizgili tişört)', hair: 'curly', top: 'stripes', trousers: 'ink', glasses: false, skirt: false, stroke: 0.012 });
export const CLIVE_CARD = Object.freeze({ name: 'Clive Wearing (47, 1985: kır saç, koyu takım, beyaz gömlek)', hair: 'grey', top: 'suit', trousers: 'ink', glasses: false, skirt: false, stroke: 0.012 });
export const DEBORAH_CARD = Object.freeze({ name: 'Deborah (koyu saç topuz, uzun etek)', hair: 'bun', top: 'blouse', trousers: 'graphite', glasses: false, skirt: true, stroke: 0.012 });

// pose: { walk: faz sn | null, arms: 'down' | 'up' | 'conduct' | 'piano' | 'write' | 'notebook' | 'wave', phase: sn (kol döngüsü),
//         eyes: 'open' | 'wide' | 'closed' | 'heavy', sit: bool, lean: rad, mouth: 'flat' | 'smile' | 'open' }
export function drawPerson(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.rotate(pose.lean || 0);
  const lw = Math.max(card.stroke, 1.4 / size), w = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2 / 0.9) : 0, ph = pose.phase || 0;
  const hip = [0, pose.sit ? -0.3 : -0.5];
  // bacaklar
  if (card.skirt && !pose.sit) {
    const sk = () => poly(ctx, [[-0.07, -0.55], [0.07, -0.55], [0.12 + w * 0.02, -0.06], [-0.12 + w * 0.02, -0.06]]);
    sk(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, sk, 0.022, 80, lw * 0.7, GRAPH); sk(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0.03 + w * 0.05, -0.015, 0.04, 0.014, 0, 0, Math.PI * 2); ctx.ellipse(-0.03 - w * 0.05, -0.015, 0.04, 0.014, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    const L = pose.sit ? [[80, 85], [70, 80]] : [[18 * w, Math.max(0, -24 * w)], [-18 * w, Math.max(0, 24 * w)]];
    const col = card.trousers === 'ink' ? INK : GRAPH;
    for (const [a, k] of L) {
      const kx = hip[0] + Math.sin(rad(a)) * 0.25, ky = hip[1] + Math.cos(rad(a)) * 0.25, fx = kx + Math.sin(rad(a - k)) * 0.25, fy = ky + Math.cos(rad(a - k)) * 0.25;
      ctx.strokeStyle = col; ctx.lineWidth = 0.072; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(fx + 0.03, fy - 0.005, 0.045, 0.016, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
    }
  }
  // gövde
  const y0 = hip[1] - 0.3, torso = () => poly(ctx, [[-0.078, y0], [0.078, y0], [0.07, hip[1]], [-0.07, hip[1]]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill();
  if (card.top === 'sweater') hatchClip(ctx, torso, 0.03, 0, lw * 0.6, GRAPH);
  if (card.top === 'stripes') hatchClip(ctx, torso, 0.045, 0, lw * 1.4, INK);
  if (card.top === 'suit') { hatchClip(ctx, torso, 0.016, 75, lw * 0.9, INK); poly(ctx, [[-0.02, y0], [0.02, y0], [0.0, y0 + 0.12]]); ctx.fillStyle = PAPER; ctx.fill(); }
  torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // kollar
  const sh = [0.004, y0 + 0.02], arms = pose.arms || 'down';
  let A;
  if (arms === 'up') A = [[150 + 8 * Math.sin(ph * 6), -10], [-150 - 8 * Math.sin(ph * 6), 10]];
  else if (arms === 'conduct') A = [[70 + 35 * Math.sin(ph * 4.2), 40 + 25 * Math.sin(ph * 4.2 + 1)], [-20, 20]];
  else if (arms === 'piano') A = [[62, 30 + 8 * Math.sin(ph * 9)], [58, 34 + 8 * Math.sin(ph * 9 + 2)]];
  else if (arms === 'write') A = [[55, 40 + 6 * Math.sin(ph * 11)], [20, 10]];
  else if (arms === 'notebook') A = [[45, 55], [30, 70]];
  else if (arms === 'wave') A = [[140, -30 + 20 * Math.sin(ph * 7)], [-12, 8]];
  else A = [[10 + w * 16, 8], [-10 - w * 16, 8]];
  const hands = [];
  A.forEach(([a, e], i) => { const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.038, lw, card.top === 'suit' ? GRAPH : PAPER); limb(ctx, ex, ey, hx, hy, 0.034, lw, card.top === 'suit' ? GRAPH : PAPER); hands.push([hx, hy]); });
  if (arms === 'conduct') { const [hx, hy] = hands[0]; ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.9; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 0.1 * Math.cos(rad(-40 + 30 * Math.sin(ph * 4.2))), hy + 0.1 * Math.sin(rad(-40 + 30 * Math.sin(ph * 4.2)))); ctx.stroke(); }
  if (arms === 'notebook') { const [hx, hy] = hands[1]; ctx.save(); ctx.translate(hx, hy - 0.04); ctx.rotate(-0.2); ctx.fillStyle = PAPER; ctx.fillRect(-0.05, -0.06, 0.1, 0.12); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(-0.05, -0.06, 0.1, 0.12); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-0.035, -0.035 + k * 0.025); ctx.lineTo(0.035, -0.035 + k * 0.025); ctx.lineWidth = lw * 0.5; ctx.stroke(); } ctx.restore(); }
  // baş
  const hy = y0 - 0.085;
  ctx.beginPath(); ctx.arc(0.01, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = card.hair === 'grey' ? GRAPH : INK;
  if (card.hair === 'short' || card.hair === 'grey') { ctx.beginPath(); ctx.arc(0.0, hy - 0.012, 0.062, Math.PI * 1.02, Math.PI * 1.98); ctx.fill(); }
  else if (card.hair === 'side') { ctx.beginPath(); ctx.arc(0.0, hy - 0.01, 0.064, Math.PI * 0.95, Math.PI * 1.9); ctx.fill(); }
  else if (card.hair === 'curly') { for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-0.045 + i * 0.018, hy - 0.05 - (i % 2) * 0.008, 0.022, 0, Math.PI * 2); ctx.fill(); } }
  else if (card.hair === 'bun') { ctx.beginPath(); ctx.arc(-0.02, hy - 0.015, 0.06, Math.PI * 0.6, Math.PI * 1.8); ctx.fill(); ctx.beginPath(); ctx.arc(-0.07, hy - 0.04, 0.03, 0, Math.PI * 2); ctx.fill(); }
  // gözler: açık / iri / kapalı / ağır
  const ex = 0.045, ey = hy - 0.002, eyes = pose.eyes || 'open';
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.8;
  if (eyes === 'closed') { ctx.beginPath(); ctx.moveTo(ex - 0.014, ey); ctx.quadraticCurveTo(ex, ey + 0.008, ex + 0.014, ey); ctx.stroke(); }
  else if (eyes === 'wide') { ctx.beginPath(); ctx.arc(ex, ey, 0.014, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(ex + 0.003, ey, 0.006, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  else if (eyes === 'heavy') { ctx.beginPath(); ctx.arc(ex, ey + 0.002, 0.007, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(ex - 0.014, ey - 0.004); ctx.lineTo(ex + 0.014, ey - 0.002); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(ex, ey, 0.008, 0, Math.PI * 2); ctx.fill(); }
  if (card.glasses) { ctx.beginPath(); ctx.arc(ex, ey, 0.02, 0, Math.PI * 2); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  const m = pose.mouth || 'flat';
  ctx.lineWidth = lw * 0.8; ctx.beginPath();
  if (m === 'smile') { ctx.arc(0.04, hy + 0.025, 0.018, 0.1 * Math.PI, 0.8 * Math.PI); } else if (m === 'open') { ctx.ellipse(0.045, hy + 0.032, 0.01, 0.014, 0, 0, Math.PI * 2); } else { ctx.moveTo(0.03, hy + 0.033); ctx.lineTo(0.058, hy + 0.033); }
  ctx.stroke();
  ctx.restore();
}

// dik piyano (yandan; çalan solda oturur, tuş rafı sola uzanır); birim = yükseklik; kök zemin, gövdenin sol alt köşesi
export function drawPiano(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = lw;
  const body = () => poly(ctx, [[0, -1], [0.34, -1], [0.34, 0], [0, 0]]);
  body(); ctx.fill(); hatchClip(ctx, body, 0.022, 90, lw * 0.9); body(); ctx.stroke();
  // tuş rafı ve nota sehpası
  poly(ctx, [[-0.2, -0.56], [0, -0.56], [0, -0.5], [-0.2, -0.5]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; for (let x = -0.19; x < -0.01; x += 0.035) ctx.fillRect(x, -0.56, 0.015, 0.025);
  poly(ctx, [[-0.02, -0.8], [0.02, -0.8], [0.0, -0.6], [-0.06, -0.6]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.17, -0.5); ctx.lineTo(-0.17, 0); ctx.lineWidth = lw * 2; ctx.stroke();
  ctx.restore();
}

// saat kadranı: 24 saat (Randy) ya da 30 saniye (Clive kronometresi); m: 0 → 1 iki kadran arası geçiş
// value: 24 saatlikte saat (0–24), kronometrede saniye (0–30)
export function drawDial(ctx, r, m, value, F) {
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r - 10, 0, Math.PI * 2); ctx.lineWidth = 1.2; ctx.stroke();
  // kronometre kulağı ve düğmesi (geçişte büyür)
  if (m > 0) { ctx.save(); ctx.globalAlpha = m; ctx.fillStyle = PAPER; ctx.fillRect(-14, -r - 26, 28, 22); ctx.strokeRect(-14, -r - 26, 28, 22); ctx.beginPath(); ctx.arc(0, -r - 30, 10, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  const n = m < 0.5 ? 24 : 30;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2, big = m < 0.5 ? i % 6 === 0 : i % 5 === 0;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * (r - 12), Math.sin(a) * (r - 12)); ctx.lineTo(Math.cos(a) * (r - (big ? 34 : 22)), Math.sin(a) * (r - (big ? 34 : 22))); ctx.lineWidth = big ? 3.5 : 1.6; ctx.stroke();
  }
  ctx.font = F; ctx.fillStyle = INK; ctx.textAlign = 'center';
  const labs = m < 0.5 ? [[0, '0'], [6, '6'], [12, '12'], [18, '18']] : [[0, '0'], [10, '10'], [20, '20']];
  for (const [v, s] of labs) { const a = (v / n) * Math.PI * 2 - Math.PI / 2; ctx.globalAlpha = Math.abs(m - 0.5) * 2; ctx.fillText(s, Math.cos(a) * (r - 58), Math.sin(a) * (r - 58) + 10); }
  ctx.globalAlpha = 1;
  const a = (value / (m < 0.5 ? 24 : 30)) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(-Math.cos(a) * 16, -Math.sin(a) * 16); ctx.lineTo(Math.cos(a) * (r - 80), Math.sin(a) * (r - 80)); ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

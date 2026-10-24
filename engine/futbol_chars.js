// "Futbol" karakterleri ve nesneleri: Carlos Kaiser (80'ler Brezilya: kıvırcık saç, bıyık, çizgili forma), Kazuyoshi
// Miura (düz saç, 11 numara; yaşla kırlaşır), hakem, kulüp patronu, tribün, top, kale, tuğla telefon, gazete, kart,
// sözleşme. Tek oyuncu çizim fonksiyonu (iskelet: eklem açıları), kimlik kartla kilitli. Gravür dili; kırmızı yok.
// Birim: kişide boy = 1 (size px), kök ayak tabanı, sağa bakar.
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

// Kimlik kartları
export const KAISER_CARD = Object.freeze({ name: 'Carlos Kaiser (1980\'ler: kıvırcık saç, bıyık, yatay çizgili forma)', hair: 'curly', moustache: true, kit: 'hoops', number: '', stroke: 0.012 });
export const KAZU_CARD = Object.freeze({ name: 'Kazuyoshi Miura (düz koyu saç, sade forma 11 numara; yaş parametresiyle kır saç)', hair: 'straight', moustache: false, kit: 'plain', number: '11', stroke: 0.012 });
export const REF_CARD = Object.freeze({ name: 'hakem (koyu forma, düdük)', hair: 'short', moustache: false, kit: 'dark', number: '', stroke: 0.012 });
export const PATRON_CARD = Object.freeze({ name: 'kulüp patronu (iri, takım elbise)', hair: 'slick', moustache: true, kit: 'suit', number: '', stroke: 0.012 });

// pose: { run: faz sn | null, arms: 'down'|'up'|'phone'|'point'|'fists'|'thigh'|'pen', kick: 0..1, sit: bool, limp: bool,
//         lean: rad, age: 0..1 (saç kırlaşır), mouth: 'flat'|'open'|'smile', eyes: 'open'|'closed' }
export function drawPlayer(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.rotate(pose.lean || 0);
  const lw = Math.max(card.stroke, 1.4 / size), r = pose.run != null ? Math.sin(pose.run * Math.PI * 2 / 0.55) : 0, suit = card.kit === 'suit';
  const big = suit ? 1.18 : 1;
  const hip = [0, pose.sit ? -0.3 : -0.5];
  // bacaklar: şort + çorap (oyuncu) ya da pantolon (patron)
  let L;
  if (pose.sit) L = [[80, 85], [70, 80]];
  else if (pose.kick > 0) L = [[-20, 10], [lerp(-40, 70, pose.kick), lerp(60, 0, pose.kick)]];
  else if (pose.thigh) L = [[6, 0], [-28, 50]];
  else L = [[26 * r, Math.max(0, -40 * r)], [-26 * r, Math.max(0, 40 * r)]];
  L.forEach(([a, k], i) => {
    const kx = hip[0] + Math.sin(rad(a)) * 0.25, ky = hip[1] + Math.cos(rad(a)) * 0.25, fx = kx + Math.sin(rad(a - k)) * 0.25, fy = ky + Math.cos(rad(a - k)) * 0.25;
    if (suit) { ctx.strokeStyle = INK; ctx.lineWidth = 0.08; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke(); }
    else {
      limb(ctx, hip[0], hip[1], kx, ky, 0.052, lw); limb(ctx, kx, ky, fx, fy, 0.046, lw);
      // çorap: kaval kemiğinin alt yarısı mürekkep
      const sx = lerp(kx, fx, 0.35), sy = lerp(ky, fy, 0.35); ctx.strokeStyle = card.kit === 'dark' ? INK : GRAPH; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fx, fy); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(fx + 0.035, fy - 0.006, 0.05, 0.018, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  });
  // şort
  if (!suit) { poly(ctx, [[-0.075, hip[1] - 0.06], [0.075, hip[1] - 0.06], [0.085, hip[1] + 0.07], [0.005, hip[1] + 0.06], [-0.085, hip[1] + 0.07]]); ctx.fillStyle = card.kit === 'dark' ? INK : PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
  // gövde: forma
  const y0 = hip[1] - 0.3 * big, w0 = 0.08 * big, torso = () => poly(ctx, [[-w0, y0], [w0, y0], [w0 - 0.005, hip[1]], [-w0 + 0.005, hip[1]]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill();
  if (card.kit === 'hoops') { ctx.save(); torso(); ctx.clip(); hatchClip(ctx, () => { ctx.beginPath(); for (let k = 0; k < 4; k++) ctx.rect(-0.2, y0 + 0.03 + k * 0.075, 0.4, 0.035); }, 0.012, 0, lw * 0.9); ctx.restore(); }
  if (card.kit === 'dark' || suit) hatchClip(ctx, torso, suit ? 0.016 : 0.012, suit ? 75 : 0, lw * 0.9);
  if (suit) { poly(ctx, [[-0.02, y0], [0.02, y0], [0, y0 + 0.13]]); ctx.fillStyle = PAPER; ctx.fill(); }
  torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  if (card.number) { ctx.fillStyle = INK; ctx.font = `800 ${0.11}px Archivo`; ctx.textAlign = 'center'; ctx.fillText(card.number, 0.0, y0 + 0.17); }
  // kollar
  const sh = [0.004, y0 + 0.02], arms = pose.arms || 'down', ph = pose.phase || 0;
  let A;
  if (arms === 'up') A = [[150 + 8 * Math.sin(ph * 6), -10], [-150 - 8 * Math.sin(ph * 6), 10]];
  else if (arms === 'phone') A = [[150, -150], [-12, 8]];
  else if (arms === 'point') A = [[95 + 10 * Math.sin(ph * 6), -5], [-30, 20]];
  else if (arms === 'fists') A = [[120 + 25 * Math.sin(ph * 9), -40], [70 + 25 * Math.sin(ph * 9 + 2), -50]];
  else if (arms === 'thigh') A = [[-25, -10], [-40, 5]];
  else if (arms === 'pen') A = [[55, 40 + 6 * Math.sin(ph * 11)], [20, 10]];
  else A = [[12 - 30 * r, 10], [-12 + 30 * r, 10]];
  const hands = [];
  A.forEach(([a, e]) => { const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.036 * big, lw, suit ? GRAPH : PAPER); limb(ctx, ex, ey, hx, hy, 0.032 * big, lw, PAPER); hands.push([hx, hy]); });
  // tuğla telefon (oyuncak): kulakta
  if (arms === 'phone') { const [hx, hy] = hands[0]; ctx.save(); ctx.translate(hx + 0.01, hy - 0.02); ctx.rotate(0.3); ctx.fillStyle = INK; ctx.fillRect(-0.022, -0.08, 0.044, 0.12); ctx.fillRect(-0.006, -0.12, 0.012, 0.045); ctx.restore(); }
  // baş
  const hy = y0 - 0.085;
  ctx.beginPath(); ctx.arc(0.01, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  const age = pose.age || 0, hairCol = age > 0.5 ? GRAPH : INK;
  ctx.fillStyle = hairCol;
  if (card.hair === 'curly') { for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-0.055 + i * 0.017, hy - 0.05 - (i % 2) * 0.01, 0.024, 0, Math.PI * 2); ctx.fill(); } ctx.beginPath(); ctx.arc(-0.05, hy - 0.01, 0.03, 0, Math.PI * 2); ctx.fill(); }
  else if (card.hair === 'straight') { ctx.beginPath(); ctx.arc(0.0, hy - 0.008, 0.064, Math.PI * 0.98, Math.PI * 2.0); ctx.lineTo(0.06, hy - 0.02); ctx.lineTo(-0.02, hy - 0.035); ctx.lineTo(-0.064, hy + 0.01); ctx.closePath(); ctx.fill(); }
  else if (card.hair === 'slick') { ctx.beginPath(); ctx.arc(0.0, hy - 0.012, 0.062, Math.PI * 1.02, Math.PI * 1.98); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0.0, hy - 0.012, 0.062, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); }
  ctx.fillStyle = INK;
  if (pose.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(0.032, hy - 0.002); ctx.quadraticCurveTo(0.045, hy + 0.006, 0.058, hy - 0.002); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0.045, hy - 0.002, 0.008, 0, Math.PI * 2); ctx.fill(); }
  if (card.moustache) { ctx.beginPath(); ctx.ellipse(0.045, hy + 0.024, 0.022, 0.008, 0, 0, Math.PI * 2); ctx.fill(); }
  const m = pose.mouth || 'flat'; ctx.lineWidth = lw * 0.8; ctx.beginPath();
  if (m === 'smile') ctx.arc(0.042, hy + 0.028, 0.016, 0.1 * Math.PI, 0.8 * Math.PI); else if (m === 'open') ctx.ellipse(0.046, hy + 0.036, 0.01, 0.013, 0, 0, Math.PI * 2); else { ctx.moveTo(0.032, hy + 0.038); ctx.lineTo(0.058, hy + 0.038); }
  ctx.stroke();
  // sakatlık: arka adalede kırık çizgiler
  if (pose.thigh) { ctx.strokeStyle = INK; ctx.lineWidth = lw; for (let i = 0; i < 3; i++) { const a = -2.4 + i * 0.4; ctx.beginPath(); ctx.moveTo(-0.08 + Math.cos(a) * 0.06, -0.38 + Math.sin(a) * 0.06); ctx.lineTo(-0.08 + Math.cos(a) * 0.11, -0.38 + Math.sin(a) * 0.11); ctx.stroke(); } }
  ctx.restore();
}

// top (gravür: beşgen yamalar); birim = çap
export function drawBall(ctx, size, spin = 0) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(spin); const lw = 1.6 / size;
  ctx.beginPath(); ctx.arc(0, 0, 0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  poly(ctx, Array.from({ length: 5 }, (_, i) => [Math.cos(i * 1.2566 - 1.57) * 0.17, Math.sin(i * 1.2566 - 1.57) * 0.17])); ctx.fillStyle = INK; ctx.fill();
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.17, Math.sin(a) * 0.17); ctx.lineTo(Math.cos(a) * 0.5, Math.sin(a) * 0.5); ctx.stroke(); }
  ctx.restore();
}

// kale (yandan, ağlı); birim = yükseklik; kök direğin dibi
export function drawGoal(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -1); ctx.lineTo(0.9, -1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.9, -1); ctx.lineTo(1.4, 0); ctx.lineWidth = lw; ctx.stroke();
  ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.6;
  for (let x = 0.1; x < 1.4; x += 0.1) { ctx.beginPath(); ctx.moveTo(x, -1 + Math.max(0, x - 0.9) * 2); ctx.lineTo(x, 0); ctx.stroke(); }
  for (let y = -0.9; y < 0; y += 0.1) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(0.9 + (y + 1) * 0.5, y); ctx.stroke(); }
  ctx.restore();
}

// kart (kırmızı değil: mürekkep tarama + kenar); birim = yükseklik
export function drawCard(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  const P = () => { ctx.beginPath(); ctx.roundRect(-0.33, -0.5, 0.66, 1, 0.06); };
  P(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, P, 0.06, 0, lw * 1.6); hatchClip(ctx, P, 0.06, 90, lw * 1.6); P(); ctx.lineWidth = lw * 1.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// gazete (manşetli); birim = genişlik
export function drawPaper(ctx, size, head, fs = 0.085) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(-0.06); const lw = 1.6 / size;
  ctx.fillStyle = PAPER; ctx.fillRect(-0.5, -0.36, 1, 0.72); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(-0.5, -0.36, 1, 0.72);
  ctx.fillStyle = INK; ctx.font = `800 ${fs}px Archivo`; ctx.textAlign = 'left';
  head.split('\n').forEach((s, i) => ctx.fillText(s, -0.45, -0.36 + fs * 1.15 * (i + 1)));
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-0.45, 0.05 + i * 0.06); ctx.lineTo(i % 2 ? 0.1 : 0.45, 0.05 + i * 0.06); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  ctx.restore();
}

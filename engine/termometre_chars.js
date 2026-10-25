// "Termometre" karakterleri ve nesneleri: Anna Bågenholm (1999, kayakçı: örgü bere, parka; sonra beyaz önlük) ve
// Ludger Sylbaris (1902: kısa saç, gömlek). Tek insan çizim fonksiyonu (iskelet: eklem açıları), kimlik kartla kilitli.
// Gerçek kişiler: yüz ayrıntısı yok (tek göz noktası), gravür dili; kırmızı yok.
// Birim: boy = 1 (size px), kök ayak tabanı, sağa bakar.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;

function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -1.4; d < 1.4; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 1.4, -dx * d - dy * 1.4); ctx.lineTo(dy * d + dx * 1.4, -dx * d + dy * 1.4); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function limb(ctx, x0, y0, x1, y1, w, lw, fill = PAPER) {
  ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = fill; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}

// Kimlik kartları (oranlar: baş yarıçapı 0,062, gövde 0,3, bacak 2 × 0,25, kol 2 × 0,15)
export const ANNA_CARD = Object.freeze({ name: 'Anna Bågenholm (1999: örgü bere, kapitone parka, kayak pantolonu)', hat: 'beanie', top: 'parka', legs: 'ski', stroke: 0.012 });
export const DOCTOR_CARD = Object.freeze({ name: 'Anna Bågenholm (sonra: beyaz önlük, toplu saç)', hat: 'bun', top: 'coat', legs: 'plain', stroke: 0.012 });
export const STAFF_CARD = Object.freeze({ name: 'hastane görevlisi (önlük, kısa saç; kimliksiz)', hat: 'short', top: 'coat', legs: 'plain', stroke: 0.012 });
export const SYLBARIS_CARD = Object.freeze({ name: 'Ludger Sylbaris (1902: kısa saç, açık gömlek, koyu pantolon)', hat: 'short', top: 'shirt', legs: 'dark', stroke: 0.012 });

// pose: iskelet açıları (derece; 0 = aşağı, + = ileri). hip, knee: [sol, sağ]; sh, el: [sol, sağ]; body: gövde eğimi;
// sit: kalça yüksekliği; eyes: 'open'|'closed'
export const PERSON_POSES = {
  stand: { body: 0, hip: [-6, 6], knee: [0, 0], sh: [-14, 14], el: [8, -8] },
  ski: { body: 14, hip: [-18, 22], knee: [-30, -30], sh: [-40, 30], el: [-20, -10] },
  fall: { body: 170, hip: [-20, 25], knee: [-30, -10], sh: [150, -150], el: [20, -20] },
  float: { body: 28, hip: [-14, 18], knee: [-35, -15], sh: [150, 170], el: [10, -10] },
  still: { body: 82, hip: [-4, 6], knee: [-8, -4], sh: [30, 40], el: [5, 5], eyes: 'closed' },
  crouch: { body: 20, hip: [95, 100], knee: [-150, -150], sh: [60, 70], el: [-100, -100], sit: 0.22 },
  wave: { body: 0, hip: [-6, 6], knee: [0, 0], sh: [-14, 160], el: [8, 20] },
  cprUp: { body: 22, hip: [-6, 6], knee: [0, 0], sh: [8, 14], el: [0, 0] },
  cprDown: { body: 34, hip: [-6, 6], knee: [-6, -6], sh: [0, 6], el: [0, 0] },
  walkA: { body: 2, hip: [-24, 22], knee: [-4, -26], sh: [22, -20], el: [-10, -12] },
  walkB: { body: 2, hip: [22, -24], knee: [-26, -4], sh: [-20, 22], el: [-12, -10] },
  point: { body: -4, hip: [-6, 6], knee: [0, 0], sh: [-14, 95], el: [8, 0] },
};
// iki poz arası: dizi ve sayılar ara değerlenir (eksik sayı 0 sayılır: sit, body), diğerleri (eyes) yarıda değişir
export const mixPersonPose = (a, b, u) => {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    if (Array.isArray(x) || Array.isArray(y)) o[k] = (x || y).map((v, i) => (x ? x[i] : 0) + ((y ? y[i] : 0) - (x ? x[i] : 0)) * u);
    else if (typeof x === 'number' || typeof y === 'number') o[k] = (x ?? 0) + ((y ?? 0) - (x ?? 0)) * u;
    else o[k] = u < 0.5 ? x : y;
  }
  return o;
};

export function drawPerson(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size);
  const hipY = -(0.5 - (pose.sit || 0)), b = rad(pose.body || 0);
  ctx.translate(0, hipY); ctx.rotate(b); // kalça kök; bütün figür kalça çevresinde eğilir (düşme, yüzme, yatma)
  // bacaklar (kalçadan aşağı)
  for (let i = 0; i < 2; i++) {
    const a = rad(pose.hip[i]), k = rad(pose.knee[i]);
    const kx = Math.sin(a) * 0.25, ky = Math.cos(a) * 0.25, fx = kx + Math.sin(a + k) * 0.25, fy = ky + Math.cos(a + k) * 0.25;
    const fill = card.legs === 'dark' || card.legs === 'ski' ? GRAPH : PAPER;
    limb(ctx, 0, 0, kx, ky, card.legs === 'ski' ? 0.062 : 0.05, lw, fill); limb(ctx, kx, ky, fx, fy, card.legs === 'ski' ? 0.056 : 0.045, lw, fill);
    ctx.beginPath(); ctx.ellipse(fx + Math.cos(a + k) * 0.035, fy - Math.sin(a + k) * 0.006, 0.05, 0.02, -(a + k) + 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  }
  // gövde (kalçadan yukarı)
  const T = 0.3, w0 = card.top === 'parka' ? 0.095 : 0.08;
  const torso = () => poly(ctx, [[-w0, -T], [w0, -T], [w0 * 0.95, card.top === 'coat' ? 0.12 : 0.02], [-w0 * 0.95, card.top === 'coat' ? 0.12 : 0.02]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill();
  if (card.top === 'parka') { ctx.save(); torso(); ctx.clip(); hatchClip(ctx, () => { ctx.beginPath(); for (let k = 0; k < 5; k++) ctx.rect(-0.2, -T + 0.03 + k * 0.06, 0.4, 0.028); }, 0.011, 0, lw * 0.8); ctx.restore(); }
  if (card.top === 'shirt') { ctx.beginPath(); ctx.moveTo(0, -T); ctx.lineTo(0, 0.02); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke(); }
  if (card.top === 'coat') { ctx.beginPath(); ctx.moveTo(0, -T); ctx.lineTo(0.01, 0.12); ctx.moveTo(-0.03, -T); ctx.lineTo(0, -T + 0.08); ctx.lineTo(0.03, -T); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke(); }
  torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // kollar
  for (let i = 0; i < 2; i++) {
    const a = rad(pose.sh[i]), e = rad(pose.el[i]);
    const sx = 0.004, sy = -T + 0.025, ex = sx + Math.sin(a) * 0.15, ey = sy + Math.cos(a) * 0.15, hx = ex + Math.sin(a + e) * 0.14, hy = ey + Math.cos(a + e) * 0.14;
    const fill = card.top === 'parka' ? GRAPH : PAPER;
    limb(ctx, sx, sy, ex, ey, card.top === 'parka' ? 0.044 : 0.034, lw, fill); limb(ctx, ex, ey, hx, hy, card.top === 'parka' ? 0.04 : 0.03, lw, fill);
    ctx.beginPath(); ctx.arc(hx, hy, 0.022, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke();
  }
  // baş
  const hy = -T - 0.085;
  ctx.beginPath(); ctx.arc(0.008, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK;
  if (card.hat === 'beanie') { ctx.beginPath(); ctx.arc(0.004, hy - 0.006, 0.066, Math.PI * 1.0, Math.PI * 2.0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0.004, hy - 0.08, 0.02, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = PAPER; ctx.fillRect(-0.064, hy - 0.016, 0.13, 0.012); }
  else if (card.hat === 'bun') { ctx.beginPath(); ctx.arc(0.004, hy - 0.01, 0.064, Math.PI * 0.95, Math.PI * 2.0); ctx.lineTo(-0.02, hy - 0.03); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(-0.06, hy - 0.04, 0.026, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0.004, hy - 0.012, 0.062, Math.PI * 1.04, Math.PI * 1.96); ctx.fill(); }
  ctx.fillStyle = INK;
  if (pose.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(0.03, hy); ctx.quadraticCurveTo(0.043, hy + 0.008, 0.056, hy); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0.043, hy, 0.008, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// termometre ikonu (küçük); birim = yükseklik
export function drawThermoIcon(ctx, size, level = 0.5) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  ctx.beginPath(); ctx.roundRect(-0.07, -0.5, 0.14, 0.8, 0.07); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0.36, 0.13, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.fillRect(-0.03, 0.3 - 0.75 * level, 0.06, 0.75 * level);
  ctx.restore();
}

// buz kristali (altı kollu); birim = çap
export function drawCrystal(ctx, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineWidth = 2.2 / size; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    ctx.save(); ctx.rotate(i * Math.PI / 3);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -0.5); ctx.moveTo(0, -0.3); ctx.lineTo(-0.12, -0.42); ctx.moveTo(0, -0.3); ctx.lineTo(0.12, -0.42); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// kül bulutu (gravür: üst üste kubbeler, alt yarı taramalı); birim = genişlik; ph: kabarma fazı (sürekli döngü)
export function drawAshCloud(ctx, size, ph = 0, seed = 1) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  const puffs = [[-0.32, 0.02, 0.2], [-0.14, -0.08, 0.24], [0.08, -0.06, 0.26], [0.28, 0.02, 0.2], [-0.02, 0.06, 0.24], [0.4, 0.08, 0.14], [-0.44, 0.1, 0.12]];
  const shape = () => { ctx.beginPath(); puffs.forEach(([x, y, r], i) => { const rr = r * (1 + 0.05 * Math.sin(ph * Math.PI * 2 + i * 1.7 + seed)); ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, Math.PI * 2); }); };
  shape(); ctx.fillStyle = PAPER; ctx.fill();
  hatchClip(ctx, shape, 0.024, 20, lw * 0.9);
  ctx.save(); shape(); ctx.clip(); ctx.fillStyle = 'rgba(28,27,24,0.35)'; ctx.fillRect(-0.7, 0.08, 1.4, 0.4); ctx.restore();
  ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK;
  puffs.forEach(([x, y, r], i) => { const rr = r * (1 + 0.05 * Math.sin(ph * Math.PI * 2 + i * 1.7 + seed)); ctx.beginPath(); ctx.arc(x, y, rr, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); });
  ctx.restore();
}

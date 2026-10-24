// "Takvim" nesneleri: Büyük Patlama, Güneş ve Dünya, sauropod dinozor ve göktaşı, ilk insan, piramit, bugünün insanı.
// Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yok.
// Birim: boy = 1 (size px); kök: zemin çizgisinin ortası (Büyük Patlama ve Güneş'te merkez).
import { mulberry32 } from './core.js';

const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -1.5; d < 1.5; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 1.5, -dx * d - dy * 1.5); ctx.lineTo(dy * d + dx * 1.5, -dx * d + dy * 1.5); ctx.stroke(); }
  ctx.restore();
}

// Büyük Patlama: merkezden açılan ışınlar, genişleyen halka, dağılan madde noktaları; u: 0..1 açılış, t: sürekli döngü
const BANG_DOTS = (() => { const r = mulberry32(48); return Array.from({ length: 70 }, () => [r() * Math.PI * 2, 0.15 + r() * 0.85, 0.004 + r() * 0.01]); })();
export function drawBang(ctx, u, t, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  const k = Math.max(0.05, u);
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2 + t * 0.15, r0 = 0.05, r1 = (0.18 + 0.27 * k) * (i % 2 ? 0.8 : 1); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
  for (let j = 0; j < 3; j++) { const ph = ((t * 0.5 + j / 3) % 1); ctx.beginPath(); ctx.arc(0, 0, 0.08 + ph * 0.42 * k, 0, Math.PI * 2); ctx.globalAlpha = 1 - ph; ctx.lineWidth = lw * 1.4; ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.fillStyle = INK;
  for (const [a, d, s] of BANG_DOTS) { const r = d * 0.46 * k + 0.02 * Math.sin(t + a * 3); ctx.beginPath(); ctx.arc(Math.cos(a + t * 0.05) * r, Math.sin(a + t * 0.05) * r, s, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, 0.05, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.5; ctx.stroke();
  ctx.restore();
}

// Güneş (taralı, kısa ışınlar) ve kesik yörüngede dönen Dünya
export function drawSunEarth(ctx, t, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.ellipse(0, 0, 0.4, 0.17, 0, 0, Math.PI * 2); ctx.setLineDash([0.02, 0.018]); ctx.stroke(); ctx.setLineDash([]);
  const a = t * 0.9, ex = Math.cos(a) * 0.4, ey = Math.sin(a) * 0.17, behind = Math.sin(a) < 0;
  const earth = () => { ctx.beginPath(); ctx.arc(ex, ey, 0.045, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.2; ctx.stroke(); hatchClip(ctx, () => { ctx.beginPath(); ctx.arc(ex + 0.015, ey, 0.045, 0, Math.PI * 2); }, 0.008, 90, lw * 0.6); };
  if (behind) earth();
  for (let i = 0; i < 16; i++) { const b = (i / 16) * Math.PI * 2, r0 = 0.15, r1 = i % 2 ? 0.2 : 0.23; ctx.beginPath(); ctx.moveTo(Math.cos(b) * r0, Math.sin(b) * r0); ctx.lineTo(Math.cos(b) * r1, Math.sin(b) * r1); ctx.lineWidth = lw * 1.2; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 0.13, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.arc(0.03, 0.03, 0.12, 0, Math.PI * 2); }, 0.014, 45, lw * 0.6, GRAPH);
  if (!behind) earth();
  ctx.restore();
}

// sauropod (yandan, sağa bakar): pose.walk faz (sn), pose.fall 0..1 (yan yatıp kontura söner — saygılı, kansız)
export function drawDino(ctx, pose, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size, ph = (pose.walk || 0) * Math.PI * 2 / 1.4, f = pose.fall || 0;
  ctx.rotate(-0.05 * f); ctx.globalAlpha = 1 - 0.6 * f;
  ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // bacaklar (arka çift grafit, ön çift mürekkep)
  const legs = [[-0.2, 0.0], [0.15, Math.PI], [-0.14, Math.PI], [0.21, 0]];
  legs.forEach(([x, o], i) => { const s = Math.sin(ph + o) * 0.04 * (1 - f); ctx.beginPath(); ctx.moveTo(x, -0.3); ctx.lineTo(x + s, -0.02); ctx.lineWidth = 0.075; ctx.strokeStyle = i < 2 ? GRAPH : INK; ctx.stroke(); });
  // gövde, kuyruk, boyun, baş
  const body = () => { ctx.beginPath(); ctx.moveTo(-0.62, -0.28); ctx.quadraticCurveTo(-0.35, -0.36, -0.28, -0.42); ctx.quadraticCurveTo(0.0, -0.55, 0.26, -0.42); ctx.quadraticCurveTo(0.36, -0.52, 0.42, -0.72); ctx.quadraticCurveTo(0.46, -0.84, 0.56, -0.84); ctx.quadraticCurveTo(0.62, -0.82, 0.6, -0.78); ctx.quadraticCurveTo(0.52, -0.76, 0.48, -0.68); ctx.quadraticCurveTo(0.42, -0.42, 0.3, -0.28); ctx.quadraticCurveTo(0.0, -0.2, -0.3, -0.28); ctx.quadraticCurveTo(-0.45, -0.27, -0.62, -0.28); ctx.closePath(); };
  body(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, body, 0.022, 70, lw * 0.7, GRAPH); body(); ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.555, -0.815, 0.008, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// göktaşı: kuyruklu çizgi, u: 0..1 yaklaşma
export function drawAsteroid(ctx, u, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  const x = 0.5 - u * 0.7, y = -0.9 + u * 0.75;
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 0.02 * i, y - 0.02 * i); ctx.lineTo(x + 0.3 + 0.03 * i, y - 0.3 - 0.01 * i); ctx.globalAlpha = 1 - i * 0.18; ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, 0.05, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.5; ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.arc(x + 0.01, y + 0.01, 0.045, 0, Math.PI * 2); }, 0.012, 45, lw * 0.7);
  ctx.restore();
}

// ilk insan (avcı toplayıcı): mızraklı, yürür; boy = 1, kök ayak tabanı
export function drawHuman(ctx, pose, size) {
  ctx.save(); ctx.scale(size, size); const lw = Math.max(0.012, 1.4 / size), w = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2 / 0.9) : 0;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const limb = (x0, y0, x1, y1, wd) => { ctx.strokeStyle = INK; ctx.lineWidth = wd + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = PAPER; ctx.lineWidth = wd - lw * 0.2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  limb(0, -0.5, 0.12 * w, -0.02, 0.05); limb(0, -0.5, -0.12 * w, -0.02, 0.05);
  // gövde: post (taralı)
  const torso = () => poly(ctx, [[-0.07, -0.8], [0.07, -0.8], [0.08, -0.48], [-0.08, -0.48]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, torso, 0.02, 60, lw * 0.7); torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // mızrak ve kollar
  ctx.beginPath(); ctx.moveTo(0.16, -1.05); ctx.lineTo(0.12, 0.0); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  poly(ctx, [[0.16, -1.05], [0.19, -0.97], [0.14, -0.97]]); ctx.fillStyle = INK; ctx.fill();
  limb(0, -0.78, 0.14, -0.62, 0.035); limb(0, -0.78, -0.1 - 0.06 * w, -0.55, 0.035);
  // baş, saç, sakal
  ctx.beginPath(); ctx.arc(0.01, -0.88, 0.065, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(-0.005, -0.9, 0.068, Math.PI * 0.9, Math.PI * 2.05); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0.02, -0.85, 0.045, 0.1 * Math.PI, 0.9 * Math.PI); ctx.fill();
  ctx.beginPath(); ctx.arc(0.045, -0.885, 0.008, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  ctx.restore();
}

// piramit (yandan, sağ yüz taralı); boy = 1 (taban genişliği 1,6)
export function drawPyramid(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  const P = [[-0.8, 0], [0, -1], [0.8, 0]];
  poly(ctx, P); ctx.fillStyle = PAPER; ctx.fill();
  hatchClip(ctx, () => poly(ctx, [[0, -1], [0.8, 0], [0.12, 0]]), 0.03, 20, lw * 0.8);
  for (let i = 1; i < 9; i++) { const y = -i / 9, hw = 0.8 * (1 - i / 9); ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.lineWidth = lw * 0.5; ctx.strokeStyle = GRAPH; ctx.stroke(); }
  poly(ctx, P); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// bugünün insanı (sen): sade figür; pose.wave el sallar; boy = 1
export function drawYou(ctx, pose, size) {
  ctx.save(); ctx.scale(size, size); const lw = Math.max(0.012, 1.4 / size), ph = pose.phase || 0;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const limb = (x0, y0, x1, y1, wd) => { ctx.strokeStyle = INK; ctx.lineWidth = wd + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = PAPER; ctx.lineWidth = wd - lw * 0.2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  ctx.strokeStyle = INK; ctx.lineWidth = 0.07; ctx.beginPath(); ctx.moveTo(-0.04, -0.5); ctx.lineTo(-0.05, -0.02); ctx.moveTo(0.04, -0.5); ctx.lineTo(0.05, -0.02); ctx.stroke();
  const torso = () => poly(ctx, [[-0.08, -0.8], [0.08, -0.8], [0.075, -0.48], [-0.075, -0.48]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  limb(0, -0.78, -0.12, -0.52, 0.035);
  const wa = pose.wave ? -2.2 + 0.35 * Math.sin(ph * 7) : 0.3;
  limb(0, -0.78, Math.cos(wa) * 0.26, -0.78 + Math.sin(wa) * 0.26, 0.035);
  ctx.beginPath(); ctx.arc(0.0, -0.88, 0.065, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.0, -0.905, 0.066, Math.PI * 1.02, Math.PI * 1.98); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0.03, -0.885, 0.008, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0.025, -0.86, 0.018, 0.1 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = lw * 0.8; ctx.stroke();
  ctx.restore();
}

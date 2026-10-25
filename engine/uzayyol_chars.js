// "Yol" (053) öğeleri: koltukta telefonla video izleyen kişi, Güneş, Samanyolu sarmalı, hız oku.
// Kişi TEK çizim fonksiyonudur (dondurulmuş kart); önce iskelet (kalça, diz, omuz, dirsek eklemleri), sonra hacimler.
// Gravür dili: kâğıt dolgu, mürekkep kontur, gölge tarafında tarama. Birim: oturan kişinin baş-kalça yüksekliği = 1.
import { mulberry32 } from './core.js';

const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

export const SITTER_CARD = Object.freeze({
  name: 'koltukta video izleyen kişi (yandan, sağa bakar)',
  head: { r: 0.17 },                 // baş = 1/3 gövde
  torso: 0.62, thigh: 0.5, shin: 0.5, upper: 0.36, fore: 0.32,
  hip: [0, 0], lean: -0.12,          // sırt koltuğa hafif yaslı (rad)
  palette: { ink: INK, paper: PAPER, graphite: GRAPH },
  stroke: 0.035,
});

// pose: { look: baş eğimi (rad, + aşağı), phone: telefonun ekran ışığı 0..1 (kâğıt rengi, parlama değil) }
export function drawSitter(ctx, card, pose, size) {
  const s = size, P = card.palette, lw = card.stroke * s;
  const L = (x1, y1, x2, y2, w = lw) => { ctx.beginPath(); ctx.moveTo(x1 * s, y1 * s); ctx.lineTo(x2 * s, y2 * s); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.strokeStyle = P.ink; ctx.stroke(); };
  ctx.save();
  // koltuk: oturak, arka, kolçak (kâğıt + mürekkep, gölge taraması)
  ctx.fillStyle = P.paper; ctx.strokeStyle = P.ink; ctx.lineWidth = lw * 0.9; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-0.42 * s, -1.02 * s); ctx.lineTo(-0.2 * s, -1.06 * s); ctx.lineTo(-0.1 * s, 0.05 * s); ctx.lineTo(0.62 * s, 0.05 * s); ctx.lineTo(0.62 * s, 0.32 * s); ctx.lineTo(-0.42 * s, 0.32 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.lineWidth = lw * 0.35; for (let x = -0.6; x < 0.8; x += 0.06) { ctx.beginPath(); ctx.moveTo(x * s, 0.32 * s); ctx.lineTo((x - 0.3) * s, -1.1 * s); ctx.stroke(); } ctx.restore();
  L(-0.36, 0.32, -0.38, 0.48); L(0.56, 0.32, 0.58, 0.48);
  // iskelet: kalça (0,0) → omuz; kalça → diz → ayak
  const a = card.lean, sh = [Math.sin(a) * card.torso, -Math.cos(a) * card.torso];
  const knee = [card.thigh, -0.02], foot = [knee[0] + 0.06, knee[1] + card.shin];
  // bacak (hacim: kalın mürekkep + kâğıt iç)
  for (const [w, c] of [[0.2, P.ink], [0.2 - 2 * card.stroke, P.paper]]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(knee[0] * s, knee[1] * s); ctx.lineTo(foot[0] * s, foot[1] * s); ctx.lineWidth = w * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = c; ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse((foot[0] + 0.07) * s, (foot[1] + 0.06) * s, 0.12 * s, 0.05 * s, 0, 0, Math.PI * 2); ctx.fillStyle = P.ink; ctx.fill();
  // gövde
  for (const [w, c] of [[0.3, P.ink], [0.3 - 2 * card.stroke, P.paper]]) { ctx.beginPath(); ctx.moveTo(0, -0.02 * s); ctx.lineTo(sh[0] * s, sh[1] * s); ctx.lineWidth = w * s; ctx.lineCap = 'round'; ctx.strokeStyle = c; ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.moveTo(-0.15 * s, 0); ctx.lineTo((sh[0] - 0.15) * s, sh[1] * s); ctx.lineTo((sh[0] - 0.02) * s, sh[1] * s); ctx.lineTo(-0.02 * s, 0); ctx.clip(); ctx.lineWidth = lw * 0.35; ctx.strokeStyle = P.ink; for (let y = -0.7; y < 0.1; y += 0.05) { ctx.beginPath(); ctx.moveTo(-0.2 * s, y * s); ctx.lineTo(0.1 * s, (y - 0.12) * s); ctx.stroke(); } ctx.restore();
  // kol: omuz → dirsek (dizin üstü) → el (telefon)
  const elbow = [sh[0] + 0.2, sh[1] + 0.3], hand = [elbow[0] + 0.28, elbow[1] - 0.12];
  for (const [w, c] of [[0.13, P.ink], [0.13 - 2 * card.stroke, P.paper]]) { ctx.beginPath(); ctx.moveTo(sh[0] * s, sh[1] * s); ctx.lineTo(elbow[0] * s, elbow[1] * s); ctx.lineTo(hand[0] * s, hand[1] * s); ctx.lineWidth = w * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = c; ctx.stroke(); }
  // telefon: ekranı kişiye dönük, küçük küre simgesi
  ctx.save(); ctx.translate((hand[0] + 0.04) * s, (hand[1] - 0.1) * s); ctx.rotate(-0.25);
  ctx.fillStyle = P.ink; ctx.fillRect(-0.035 * s, -0.11 * s, 0.07 * s, 0.22 * s);
  ctx.fillStyle = P.paper; ctx.globalAlpha = 0.55 + 0.45 * (pose.phone ?? 1); ctx.fillRect(-0.024 * s, -0.095 * s, 0.048 * s, 0.17 * s); ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(0, -0.01 * s, 0.016 * s, 0, Math.PI * 2); ctx.lineWidth = lw * 0.3; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.restore();
  // boyun ve baş (telefona eğik)
  const look = pose.look ?? 0.35, hc = [sh[0] + 0.07 + Math.sin(look) * 0.05, sh[1] - card.head.r - 0.04 + (1 - Math.cos(look)) * 0.05];
  L(sh[0], sh[1], hc[0] - 0.02, hc[1] + card.head.r * 0.7, 0.07 * s);
  ctx.beginPath(); ctx.arc(hc[0] * s, hc[1] * s, card.head.r * s, 0, Math.PI * 2); ctx.fillStyle = P.paper; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = P.ink; ctx.stroke();
  // saç (arka yarı tarama) ve göz (telefona bakar)
  ctx.save(); ctx.beginPath(); ctx.arc(hc[0] * s, hc[1] * s, card.head.r * s, Math.PI * 0.7 + look, Math.PI * 1.75 + look); ctx.closePath(); ctx.clip(); ctx.lineWidth = lw * 0.4; for (let d = -0.3; d < 0.3; d += 0.035) { ctx.beginPath(); ctx.moveTo((hc[0] + d) * s, (hc[1] - 0.2) * s); ctx.lineTo((hc[0] + d - 0.12) * s, (hc[1] + 0.2) * s); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.arc((hc[0] + 0.09) * s, (hc[1] + 0.02 + look * 0.05) * s, 0.018 * s, 0, Math.PI * 2); ctx.fillStyle = P.ink; ctx.fill();
  ctx.restore();
}

// Güneş: kâğıt disk + mürekkep kontur + dönen kısa ışınlar (ışın açısı t'ye bağlı, sürekli doğrusal dönüş)
export function drawSun(ctx, r, t) {
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = Math.max(2, r * 0.08); ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip(); ctx.lineWidth = 1; for (let d = -r; d < r; d += 5) { ctx.beginPath(); ctx.moveTo(d + r * 0.4, -r); ctx.lineTo(d + r * 0.4 + r, r); ctx.globalAlpha = 0.35; ctx.stroke(); } ctx.restore();
  const n = 16;
  for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n + t * 0.25, l = i % 2 ? 0.35 : 0.55; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25); ctx.lineTo(Math.cos(a) * r * (1.25 + l), Math.sin(a) * r * (1.25 + l)); ctx.lineWidth = Math.max(1.5, r * 0.07); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}

// Samanyolu: çubuklu sarmal; iki ana kol + iki küçük kol, tohumlu mürekkep noktaları (bir kez üretilir).
// Noktalar galaksi biriminde (yarıçap 1 ≈ 50.000 ışık yılı). Güneş: merkezden 0,52 (≈ 26.000 ışık yılı), Orion kolu.
let GAL = null;
export function galaxyStars() {
  if (GAL) return GAL;
  const r = mulberry32(2026053), pts = [];
  const gauss = () => Math.sqrt(-2 * Math.log(1 - r() * 0.999)) * Math.cos(2 * Math.PI * r());
  // çekirdek ve çubuk
  for (let i = 0; i < 900; i++) { const u = r() * 2 - 1, x = u * 0.22 + gauss() * 0.03, y = gauss() * 0.045; const a = 0.45; pts.push([x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), 0.6 + r() * 0.4]); }
  // kollar: logaritmik sarmal, eğim ~13°
  const arms = [[0, 1], [Math.PI, 1], [Math.PI * 0.5, 0.55], [Math.PI * 1.5, 0.55]];
  for (const [ph, w] of arms) for (let i = 0; i < 1500 * w; i++) {
    const s = 0.2 + r() * 0.85, th = ph + Math.log(s / 0.2) / Math.tan(13 * Math.PI / 180) * 0.42 + 0.45, sp = 0.035 + 0.05 * s;
    pts.push([s * Math.cos(th) + gauss() * sp, s * Math.sin(th) + gauss() * sp, 0.25 + r() * 0.6]);
  }
  for (let i = 0; i < 700; i++) { const s = Math.sqrt(r()) * 1.05, th = r() * Math.PI * 2; pts.push([s * Math.cos(th), s * Math.sin(th), 0.1 + r() * 0.25]); }
  GAL = pts; return GAL;
}
export const SUN_IN_GALAXY = Object.freeze({ r: 0.52, th: 2.35 });   // Güneş'in yeri (galaksi biriminde), Orion kolu arası

// galaksiyi (cx, cy) merkezli, R yarıçapla, rot açısıyla çizer (eğim yok: üstten bakış)
export function drawGalaxy(ctx, cx, cy, R, rot, alpha = 1) {
  const pts = galaxyStars(), c = Math.cos(rot), s = Math.sin(rot);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = INK;
  for (const [x, y, b] of pts) { const X = cx + (x * c - y * s) * R, Y = cy + (x * s + y * c) * R; const d = 1 + b * 1.8; ctx.globalAlpha = alpha * (0.35 + 0.65 * b); ctx.fillRect(X - d / 2, Y - d / 2, d, d); }
  ctx.restore();
}

// hız oku: (x1,y1) → (x2,y2), dolu uç
export function drawArrow(ctx, x1, y1, x2, y2, w = 3, col = INK) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 7 + w * 3;
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * h * 0.6, y2 - Math.sin(a) * h * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(a - 0.4) * h, y2 - Math.sin(a - 0.4) * h); ctx.lineTo(x2 - Math.cos(a + 0.4) * h, y2 - Math.sin(a + 0.4) * h); ctx.closePath(); ctx.fill();
  ctx.restore();
}

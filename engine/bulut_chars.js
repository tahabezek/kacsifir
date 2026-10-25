// "Bulut" karakterleri ve nesneleri: gravür fil (karakter kartı + eklem açılı poz), tohumlu kümülüs bulutu,
// İstanbul silueti, Galata Kulesi (ölçek), martı, su damlası, tel kafes küp izdüşümü.
// Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yalnız sahnede (doruk).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
function hatch(ctx, path, gap, ang, lw, col = INK, ext = 2) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -ext; d < ext; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * ext, -dx * d - dy * ext); ctx.lineTo(dy * d + dx * ext, -dx * d + dy * ext); ctx.stroke(); }
  ctx.restore();
}
export function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ——— FİL: karakter kartı (birim = omuz yüksekliği 1; kök = ayakların ortası, yer) ———
// Afrika fili yandan: omuz yüksekliği 1, gövde (göğüs–sağrı) 1,25, baş 0,5, hortum yere ~0,1 kala, bacak 0,52.
export const ELEPHANT_CARD = Object.freeze({
  name: 'gravür fil (Afrika fili, yandan; ≈ 5 ton, omuz ≈ 3 m)',
  shoulderH: 1, bodyL: 1.15, headL: 0.42, legL: 0.5, legW: 0.2, ear: { w: 0.36, h: 0.46 },
  stroke: 0.022, palette: { ink: INK, paper: PAPER, shade: GRAPH },
  // iskelet: eklemler (x ileri +, y yukarı −): omuz önde ve yüksek, kalça arkada, baş omuzun önünde
  joints: { shoulder: [0.28, -0.52], hip: [-0.42, -0.5], head: [0.56, -0.92] },
});
// pose: { walk: 0..1 faz (8 karelik döngü), trunk: −1 (kıvrık) .. 1 (öne uzanık), ear: 0..1 açıklık }
export function elephantLegs(phase) {
  // dört bacak, çapraz eş (sol ön + sağ arka); açı (+ ileri) ve kaldırma
  const p = phase * Math.PI * 2, s = Math.sin(p), c = Math.cos(p);
  return { fl: 0.22 * s, hr: 0.22 * s, fr: -0.22 * s, hl: -0.22 * s, liftF: Math.max(0, c) * 0.05, liftB: Math.max(0, -c) * 0.05 };
}
export function drawElephant(ctx, card, pose = {}, size = 100, opt = {}) {
  ctx.save(); ctx.scale(size, size); if (opt.facing === -1) ctx.scale(-1, 1);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.3 / size), J = card.joints, L = elephantLegs(pose.walk || 0);
  const bob = Math.abs(Math.sin((pose.walk || 0) * Math.PI * 2)) * 0.012;
  const fill = opt.fill || PAPER, ink = opt.ink || INK, shade = !opt.flat && size > 24;
  // bacak: kalın sütun, alta doğru hafif genişler; kök gövde içinde (y −0,62), ayak yerde (0)
  const leg = (x, a, lift, far) => {
    const top = -0.62 - bob, w = card.legW * (far ? 0.9 : 1), len = -top - lift;
    ctx.save(); ctx.translate(x, top); ctx.rotate(-a * 0.35);
    const path = () => { ctx.beginPath(); ctx.moveTo(-w * 0.5, 0); ctx.bezierCurveTo(-w * 0.56, len * 0.45, -w * 0.46, len * 0.7, -w * 0.54, len); ctx.lineTo(w * 0.54, len); ctx.bezierCurveTo(w * 0.46, len * 0.7, w * 0.56, len * 0.45, w * 0.5, 0); ctx.closePath(); };
    path(); ctx.fillStyle = far ? '#DCD3C2' : fill; ctx.fill();
    if (shade) { ctx.save(); path(); ctx.clip(); hatch(ctx, () => { ctx.beginPath(); ctx.rect(w * 0.12, 0, w, len); }, 0.04, 75, lw * 0.45, far ? GRAPH : ink); ctx.restore(); }
    path(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke();
    if (size > 30) { ctx.beginPath(); for (const k of [-0.28, 0.02, 0.3]) { ctx.moveTo(w * k - 0.022, len); ctx.arc(w * k, len - 0.004, 0.022, Math.PI, 0); } for (const k of [0.62, 0.7]) { ctx.moveTo(-w * 0.42, len * k); ctx.quadraticCurveTo(0, len * k + 0.02, w * 0.42, len * k); } ctx.lineWidth = lw * 0.6; ctx.stroke(); }
    ctx.restore();
  };
  // uzak bacaklar
  leg(J.shoulder[0] - 0.08, L.fr, L.liftF, true);
  leg(J.hip[0] + 0.1, L.hl, L.liftB, true);
  ctx.translate(0, -bob);
  // kuyruk
  ctx.beginPath(); ctx.moveTo(-0.6, -0.86); ctx.quadraticCurveTo(-0.72, -0.66 + 0.02 * Math.sin((pose.walk || 0) * 6.28), -0.68, -0.46); ctx.lineWidth = lw * 1.1; ctx.strokeStyle = ink; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-0.68, -0.43, 0.016, 0.04, 0.2, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill();
  // gövde: omuzda en yüksek, sağrıya inen sırt, yuvarlak sağrı, sarkık karın
  const body = () => {
    ctx.beginPath(); ctx.moveTo(-0.62, -0.62);
    ctx.bezierCurveTo(-0.68, -0.86, -0.5, -0.98, -0.22, -1.0);
    ctx.bezierCurveTo(0.02, -1.03, 0.24, -1.06, 0.4, -1.0);
    ctx.lineTo(0.5, -0.62);
    ctx.bezierCurveTo(0.42, -0.44, 0.2, -0.4, -0.06, -0.42);
    ctx.bezierCurveTo(-0.32, -0.42, -0.5, -0.44, -0.58, -0.5);
    ctx.bezierCurveTo(-0.62, -0.54, -0.62, -0.58, -0.62, -0.62); ctx.closePath();
  };
  body(); ctx.fillStyle = fill; ctx.fill();
  if (shade) { ctx.save(); body(); ctx.clip(); hatch(ctx, () => { ctx.beginPath(); ctx.ellipse(-0.1, -0.4, 0.62, 0.2, 0, 0, Math.PI * 2); }, 0.026, 62, lw * 0.55, ink); hatch(ctx, () => { ctx.beginPath(); ctx.ellipse(-0.62, -0.7, 0.12, 0.3, 0, 0, Math.PI * 2); }, 0.03, 62, lw * 0.5, ink); ctx.restore(); }
  body(); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = ink; ctx.stroke();
  if (size > 30) { ctx.beginPath(); for (const [x, y] of [[-0.05, -0.62], [0.05, -0.7], [-0.3, -0.7]]) { ctx.moveTo(x - 0.06, y); ctx.quadraticCurveTo(x, y - 0.02, x + 0.06, y); } ctx.lineWidth = lw * 0.5; ctx.stroke(); }
  // yakın bacaklar
  ctx.translate(0, bob);
  leg(J.shoulder[0], L.fl, L.liftF, false);
  leg(J.hip[0], L.hr, L.liftB, false);
  ctx.translate(0, -bob);
  // baş: iri alın kubbesi, yanaktan hortuma; hortum kalın kökten incelerek yere iner
  const tr = pose.trunk ?? 0, tx = 0.86 + 0.12 * tr, ty = -0.1 - 0.1 * Math.max(0, -tr) - 0.06 * Math.max(0, tr);
  const head = () => {
    ctx.beginPath(); ctx.moveTo(0.34, -1.02);
    ctx.bezierCurveTo(0.42, -1.2, 0.68, -1.22, 0.76, -1.06);
    ctx.bezierCurveTo(0.82, -0.94, 0.84, -0.82, 0.84, -0.72);
    ctx.bezierCurveTo(0.86, -0.5, 0.86 + 0.04 * tr, -0.3, tx + 0.02, ty);
    ctx.lineTo(tx - 0.06, ty + 0.012);
    ctx.bezierCurveTo(0.78 + 0.04 * tr, -0.3, 0.76, -0.48, 0.72, -0.58);
    ctx.bezierCurveTo(0.66, -0.64, 0.56, -0.62, 0.5, -0.6); ctx.lineTo(0.42, -0.7); ctx.closePath();
  };
  head(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = ink; ctx.stroke();
  if (size > 30) { ctx.beginPath(); for (let k = 0; k < 8; k++) { const u = k / 8, y = lerp(-0.62, ty + 0.05, u), x0 = lerp(0.73, tx - 0.05, u), x1 = lerp(0.85, tx + 0.01, u); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + 0.014, x1, y); } ctx.lineWidth = lw * 0.55; ctx.stroke(); }
  // fildişi
  ctx.beginPath(); ctx.moveTo(0.73, -0.62); ctx.quadraticCurveTo(0.9, -0.52, 0.98, -0.62); ctx.quadraticCurveTo(0.88, -0.58, 0.76, -0.66); ctx.closePath(); ctx.fillStyle = '#FBF8F0'; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  // kulak: başın arkasında yelpaze, omuza sarkar
  const ea = pose.ear ?? 0.3;
  ctx.save(); ctx.translate(0.5, -1.04); ctx.rotate(-0.06 * ea);
  const ear = () => { ctx.beginPath(); ctx.moveTo(0.02, 0); ctx.bezierCurveTo(-0.16 - 0.06 * ea, -0.04, -0.3 - 0.06 * ea, 0.08, -0.28 - 0.04 * ea, 0.26); ctx.bezierCurveTo(-0.26, 0.4, -0.12, 0.46, -0.02, 0.4); ctx.bezierCurveTo(0.06, 0.3, 0.08, 0.12, 0.02, 0); ctx.closePath(); };
  ear(); ctx.fillStyle = fill; ctx.fill(); if (shade) hatch(ctx, ear, 0.032, 115, lw * 0.45, ink); ear(); ctx.lineWidth = lw * 1.1; ctx.stroke();
  ctx.restore();
  // göz
  ctx.beginPath(); ctx.ellipse(0.66, -0.92, 0.02, 0.013, -0.2, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill();
  if (size > 30) { ctx.beginPath(); ctx.moveTo(0.62, -0.96); ctx.quadraticCurveTo(0.66, -0.98, 0.7, -0.95); ctx.lineWidth = lw * 0.6; ctx.stroke(); }
  ctx.restore();
}
const lerp = (a, b, u) => a + (b - a) * u;

// ——— KÜMÜLÜS: tohumlu puf kümesi; birim = bulut genişliği 1 (kök = taban ortası). t: kaynama fazı (0..1 döngü) ———
export function cloudPuffs(seed) {
  const r = mulberry(seed), P = [];
  // taban: düz, geniş; gövde: üstte karnabahar
  for (let i = 0; i < 9; i++) { const u = i / 8; P.push({ x: lerp(-0.42, 0.42, u), y: -0.08 - r() * 0.04, r: 0.1 + r() * 0.04, ph: r() * 6.28 }); }
  for (let i = 0; i < 7; i++) { const u = i / 6; P.push({ x: lerp(-0.32, 0.32, u) + (r() - 0.5) * 0.04, y: -0.24 - r() * 0.06, r: 0.13 + r() * 0.05, ph: r() * 6.28 }); }
  for (let i = 0; i < 5; i++) { const u = i / 4; P.push({ x: lerp(-0.2, 0.22, u) + (r() - 0.5) * 0.05, y: -0.42 - r() * 0.07, r: 0.12 + r() * 0.05, ph: r() * 6.28 }); }
  for (let i = 0; i < 3; i++) P.push({ x: -0.08 + i * 0.1 + (r() - 0.5) * 0.04, y: -0.58 - r() * 0.06, r: 0.1 + r() * 0.03, ph: r() * 6.28 });
  return P;
}
export function tallCloudPuffs(seed) {
  const r = mulberry(seed), P = [];
  const rows = [[-0.08, 9, 0.44, 0.1, 0.04], [-0.24, 8, 0.4, 0.12, 0.04], [-0.42, 7, 0.36, 0.13, 0.05], [-0.6, 6, 0.3, 0.13, 0.04], [-0.76, 4, 0.22, 0.12, 0.04], [-0.88, 2, 0.1, 0.1, 0.02]];
  for (const [y, n, hw, r0, rr] of rows) for (let i = 0; i < n; i++) { const u = n === 1 ? 0.5 : i / (n - 1); P.push({ x: lerp(-hw, hw, u) + (r() - 0.5) * 0.04, y: y - r() * 0.04, r: r0 + r() * rr, ph: r() * 6.28 }); }
  return P;
}
// bulutun ana hattı (kırpma için): pufların birleşimi; birim px
export function cloudPath(ctx, puffs, w, ph = 0) {
  ctx.beginPath();
  for (const p of puffs) { const R = p.r * w * (1 + 0.035 * Math.sin(ph * Math.PI * 2 + p.ph)), X = p.x * w + 0.008 * w * Math.sin(ph * Math.PI * 2 * 2 + p.ph); ctx.moveTo(X + R, p.y * w); ctx.arc(X, p.y * w, R, 0, Math.PI * 2); }
}
export function drawCloud(ctx, puffs, w, ph = 0, opt = {}) {
  const alpha = opt.alpha ?? 1, lw = opt.lw ?? 3;
  ctx.save(); ctx.globalAlpha *= alpha;
  const R = p => p.r * w * (1 + 0.035 * Math.sin(ph * Math.PI * 2 + p.ph)), X = p => p.x * w + 0.008 * w * Math.sin(ph * Math.PI * 2 * 2 + p.ph), Y = p => p.y * w;
  const base = 0; // taban kesik: tabanın altı çizilmez
  const clipBase = () => { ctx.beginPath(); ctx.rect(-w, -w * 1.2, w * 2, w * 1.2 + base); };
  ctx.save(); clipBase(); ctx.clip();
  // dış kontur: büyük çizgi + kâğıt dolgu (iç çizgiler silinir)
  ctx.strokeStyle = opt.ink || INK; ctx.lineWidth = lw * 2;
  for (const p of puffs) { ctx.beginPath(); ctx.arc(X(p), Y(p), R(p), 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = opt.fill || PAPER;
  for (const p of puffs) { ctx.beginPath(); ctx.arc(X(p), Y(p), R(p), 0, Math.PI * 2); ctx.fill(); }
  // gravür gölge: silüetin alt-sağ kenarında tarama bandı (bulut, yukarı-sola kaydırılmış kendisinden çıkarılır)
  if (!opt.flat) {
    const union = (dx, dy) => { for (const p of puffs) { ctx.moveTo(X(p) + R(p) + dx, Y(p) + dy); ctx.arc(X(p) + dx, Y(p) + dy, R(p), 0, Math.PI * 2); } };
    ctx.save(); ctx.beginPath(); union(0, 0); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.5)'; ctx.lineWidth = Math.max(0.8, lw * 0.32); const g = Math.max(4, w * 0.008);
    for (let d = -1.4 * w; d < 1.4 * w; d += g) { ctx.beginPath(); ctx.moveTo(d, -1.2 * w); ctx.lineTo(d + 1.2 * w, 0); ctx.stroke(); }
    // kaydırılmış bulut kâğıtla örtülür: tarama yalnız alt-sağ kenar bandında kalır
    ctx.beginPath(); union(-0.055 * w, -0.05 * w); ctx.fillStyle = opt.fill || PAPER; ctx.fill();
    ctx.restore();
    // pufları ayıran kısa iç kıvrımlar (alt-sağ çeyrek), ince
    ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.lineWidth = Math.max(0.8, lw * 0.4);
    for (const p of puffs) if (p.y < -0.14) { ctx.beginPath(); ctx.arc(X(p), Y(p), R(p) * 0.97, Math.PI * 0.08, Math.PI * 0.62); ctx.stroke(); }
    // taban gölgesi: çapraz tarama bandı (pufların içinde)
    ctx.save(); ctx.beginPath(); for (const p of puffs) { ctx.moveTo(X(p) + R(p), Y(p)); ctx.arc(X(p), Y(p), R(p), 0, Math.PI * 2); } ctx.clip();
    ctx.beginPath(); ctx.rect(-w, -0.15 * w, 2 * w, 0.15 * w); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.34)'; ctx.lineWidth = Math.max(0.8, lw * 0.3);
    const g2 = Math.max(4, w * 0.01); for (let d = -w; d < w; d += g2) { ctx.beginPath(); ctx.moveTo(d, -0.15 * w); ctx.lineTo(d - 0.15 * w, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(d, -0.15 * w); ctx.lineTo(d + 0.15 * w, 0); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = Math.max(0.8, lw * 0.45);
  }
  ctx.restore();
  // taban: hafif dalgalı düz çizgi
  ctx.beginPath(); ctx.moveTo(-0.5 * w, 0); for (let x = -0.5; x <= 0.5; x += 0.05) ctx.lineTo(x * w, Math.sin(x * 19 + ph * 6.28) * w * 0.004); ctx.lineWidth = lw; ctx.strokeStyle = opt.ink || INK; ctx.stroke();
  ctx.restore();
}

// ——— Galata Kulesi: birim = yükseklik (63 m); kök = taban ortası ———
export function drawGalata(ctx, h, col = INK) {
  ctx.save(); ctx.scale(h, h); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-0.13, 0); ctx.lineTo(-0.115, -0.66); ctx.lineTo(-0.15, -0.68); ctx.lineTo(-0.15, -0.72); ctx.lineTo(-0.12, -0.72);
  ctx.lineTo(0, -1); ctx.lineTo(0.12, -0.72); ctx.lineTo(0.15, -0.72); ctx.lineTo(0.15, -0.68); ctx.lineTo(0.115, -0.66); ctx.lineTo(0.13, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// ——— İstanbul silueti: birim px; kök = sol taban; w genişlik. Galata, Süleymaniye kubbesi + minareler, evler ———
export function drawSkyline(ctx, w, h, col = INK) {
  const r = mulberry(55); ctx.save(); ctx.fillStyle = col;
  // evler
  for (let x = 0; x < w; ) { const bw = 18 + r() * 30, bh = h * (0.12 + r() * 0.16); ctx.fillRect(x, -bh, bw - 2, bh); x += bw; }
  // cami: kubbe + yarım kubbeler + 4 minare
  const mx = w * 0.62, mw = h * 0.95;
  ctx.beginPath(); ctx.rect(mx - mw * 0.5, -h * 0.34, mw, h * 0.34); ctx.fill();
  ctx.beginPath(); ctx.ellipse(mx, -h * 0.34, mw * 0.3, h * 0.26, 0, Math.PI, 0); ctx.fill();
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(mx + s * mw * 0.3, -h * 0.34, mw * 0.16, h * 0.13, 0, Math.PI, 0); ctx.fill(); }
  ctx.fillRect(mx - 1.5, -h * 0.66, 3, h * 0.08);
  for (const [dx, hh] of [[-0.6, 0.86], [-0.5, 0.74], [0.5, 0.74], [0.6, 0.86]]) { const x = mx + dx * mw; ctx.fillRect(x - 3.5, -h * hh, 7, h * hh); ctx.beginPath(); ctx.moveTo(x - 4.5, -h * hh); ctx.lineTo(x, -h * hh - h * 0.1); ctx.lineTo(x + 4.5, -h * hh); ctx.fill(); }
  // Galata
  ctx.save(); ctx.translate(w * 0.24, 0); drawGalata(ctx, h * 0.78, col); ctx.restore();
  ctx.restore();
}

// ——— martı: birim = kanat açıklığı; ph kanat fazı ———
export function drawGull(ctx, s, ph, col = INK) {
  const f = Math.sin(ph * Math.PI * 2) * 0.22;
  ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-0.5, -f); ctx.quadraticCurveTo(-0.22, -0.18 - f * 0.5, 0, 0); ctx.quadraticCurveTo(0.22, -0.18 - f * 0.5, 0.5, -f);
  ctx.lineWidth = 0.06; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
}

// ——— su damlası (küre): r yarıçap px; gravür: dolgu + yansıma + alt gölge taraması ———
export function drawDroplet(ctx, r, opt = {}) {
  ctx.save(); const lw = opt.lw ?? Math.max(1, r * 0.06);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = opt.fill || '#FBF8F0'; ctx.fill();
  if (r > 6) hatch(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.moveTo(r * 1.2, -r * 0.2); ctx.arc(-r * 0.15, -r * 0.25, r * 0.95, 0, Math.PI * 2, true); }, Math.max(2.5, r * 0.12), 45, lw * 0.6, INK, r * 1.5);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  if (r > 4) { ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }
  ctx.restore();
}

// ——— tel kafes küp (eğik izdüşüm): kenar a px, derinlik kayması (dx, dy) = a·(0,38, −0,30); kök = ön alt sol köşe.
// k: 0..1 çizim ilerlemesi (12 kenar sırayla); döner: köşe noktaları
export const CUBE_DEPTH = [0.38, -0.3];
export function cubeCorners(a) {
  const [dx, dy] = CUBE_DEPTH, d = [dx * a, dy * a];
  const F = [[0, 0], [a, 0], [a, -a], [0, -a]], B = F.map(([x, y]) => [x + d[0], y + d[1]]);
  return { F, B };
}
export function drawCubeWire(ctx, a, k = 1, opt = {}) {
  const { F, B } = cubeCorners(a);
  const E = [[F[0], F[1]], [F[1], F[2]], [F[2], F[3]], [F[3], F[0]], [F[1], B[1]], [F[2], B[2]], [F[3], B[3]], [B[1], B[2]], [B[2], B[3]], [F[0], B[0]], [B[0], B[1]], [B[3], B[0]]];
  const hidden = new Set([9, 10, 11]);   // arka-alt-sol kenarlar kesik
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = opt.col || INK;
  E.forEach(([p, q], i) => {
    const u = Math.max(0, Math.min(1, k * E.length - i)); if (u <= 0) return;
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u);
    ctx.setLineDash(hidden.has(i) ? [opt.dash || 10, opt.dash || 10] : []); ctx.lineWidth = opt.lw || 3; ctx.stroke();
  });
  ctx.restore();
  return { F, B };
}

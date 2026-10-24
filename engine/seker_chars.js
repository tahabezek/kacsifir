// "Şeker" karakterleri ve nesneleri: ince belli çay bardağı ve tabağı, şeker küpü, kalabalıktaki küçük insan, el,
// cilt hücreleri, DNA sarmalı, atom (elektron bulutu + görünmeyecek kadar küçük çekirdek), üstten stadyum, bezelye.
// Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yalnız sahnede (doruk).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577', BG = '#ECE5D5';
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function hatch(ctx, path, gap, ang, lw, col = INK, ext = 1.5) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -ext; d < ext; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * ext, -dx * d - dy * ext); ctx.lineTo(dy * d + dx * ext, -dx * d + dy * ext); ctx.stroke(); }
  ctx.restore();
}
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ——— ince belli çay bardağı: birim = yükseklik; kök tabanın ortası. tea: 0..1 doluluk; steam: faz ———
export const GLASS_CARD = Object.freeze({ name: 'ince belli Türk çay bardağı (≈ 10 cm), tavşan kanı çay', w: 0.62, stroke: 0.012 });
export function drawTeaGlass(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), tilt = pose.tilt || 0;
  ctx.rotate(tilt);
  // lale biçimi: dar bel 0,55 yükseklikte
  const P = []; const N = 48;
  const KP = [[0, 0.16], [0.1, 0.228], [0.26, 0.256], [0.42, 0.214], [0.58, 0.158], [0.7, 0.168], [0.86, 0.212], [1, 0.246]];
  const prof = f => { let j = 0; while (j < KP.length - 2 && f > KP[j + 1][0]) j++; const p0 = KP[Math.max(0, j - 1)], p1 = KP[j], p2 = KP[j + 1], p3 = KP[Math.min(KP.length - 1, j + 2)], u = (f - p1[0]) / (p2[0] - p1[0]);
    const m1 = (p2[1] - p0[1]) / Math.max(1e-6, p2[0] - p0[0]) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / Math.max(1e-6, p3[0] - p1[0]) * (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2; };
  for (let i = 0; i <= N; i++) P.push([prof(i / N), -i / N]);
  const outline = () => { ctx.beginPath(); P.forEach(([w, y], i) => (i ? ctx.lineTo(w, y) : ctx.moveTo(w, y))); for (let i = P.length - 1; i >= 0; i--) ctx.lineTo(-P[i][0], P[i][1]); ctx.closePath(); };
  outline(); ctx.fillStyle = PAPER; ctx.fill();
  // çay (tavşan kanı): doluluk çizgisine kadar seyrek eğik tarama (gravürde koyuluk = sıklık)
  const lv = -(pose.tea ?? 0.82);
  const sl = Math.tan(pose.slosh || 0);
  ctx.save(); outline(); ctx.clip(); hatch(ctx, () => { ctx.beginPath(); ctx.moveTo(-1, lv - sl); ctx.lineTo(1, lv + sl); ctx.lineTo(1, 1); ctx.lineTo(-1, 1); ctx.closePath(); }, 0.022, 82, lw * 0.75, INK); ctx.restore();
  // yüzey ve yansıma
  const wl = P[Math.round(-lv * N)][0];
  ctx.save(); outline(); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, lv, wl * 1.05, 0.02, Math.atan(sl / Math.max(0.01, wl)) * 0, 0, Math.PI * 2); ctx.restore(); ctx.beginPath(); ctx.moveTo(-wl, lv - sl * wl); ctx.lineTo(wl, lv + sl * wl); ctx.lineWidth = lw * 1.1; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.17, -0.2); ctx.quadraticCurveTo(-0.12, -0.5, -0.2, -0.85); ctx.lineWidth = lw * 2.4; ctx.strokeStyle = PAPER; ctx.stroke();
  outline(); ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -1, P[N][0], 0.025, 0, 0, Math.PI * 2); ctx.lineWidth = lw; ctx.stroke();
  // buhar: üç ince kıvrım (sürekli döngü)
  if (pose.steam != null) {
    ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.9;
    for (let k = 0; k < 3; k++) { const ph = (pose.steam * 0.5 + k / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * ph); ctx.beginPath(); for (let s = 0; s <= 1; s += 0.1) { const x = -0.08 + k * 0.08 + Math.sin(s * 6 + pose.steam * 2 + k) * 0.03, y = -1.05 - ph * 0.3 - s * 0.25; s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
}
// tabak: birim = genişlik; kök üst yüzeyin ortası. crack: 0..1
export function drawSaucer(ctx, size, crack = 0, pieces = 0) {
  if (pieces > 0) {
    const cuts = [[-Math.PI, -0.35, -0.06, 0.02, -0.12], [-0.35, 0.55, 0.0, 0.05, 0.08], [0.55, Math.PI, 0.07, 0.03, 0.14]];
    for (const [a0, a1, dx, dy, rot] of cuts) { ctx.save(); ctx.translate(dx * size * pieces, dy * size * pieces); ctx.rotate(rot * pieces * 0.4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, size, a0, a1); ctx.closePath(); ctx.clip(); drawSaucer(ctx, size, 0, 0); ctx.restore(); }
    return;
  }
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.beginPath(); ctx.ellipse(0, 0.02, 0.5, 0.07, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0.0, 0.3, 0.035, 0, 0, Math.PI * 2); ctx.lineWidth = lw * 0.8; ctx.stroke();
  hatch(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 0.035, 0.5, 0.06, 0, 0, Math.PI); }, 0.012, 0, lw * 0.6, GRAPH);
  if (crack > 0) { ctx.beginPath(); ctx.moveTo(0.06, 0.0); ctx.lineTo(0.06 + 0.1 * crack, 0.03); ctx.lineTo(0.03 + 0.18 * crack, 0.06); ctx.moveTo(0.06, 0); ctx.lineTo(0.0 - 0.12 * crack, 0.045); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
// şeker küpü: izometrik; birim = kenar; kök alt ön köşe ortası. fill: 'paper' | 'red'
export function drawSugarCube(ctx, size, fill = 'paper', redCol = '#E0391C') {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size;
  const top = [[-0.5, -0.78], [0.06, -1.05], [0.62, -0.78], [0.06, -0.52]], left = [[-0.5, -0.78], [0.06, -0.52], [0.06, 0.2], [-0.5, -0.06]], right = [[0.06, -0.52], [0.62, -0.78], [0.62, -0.06], [0.06, 0.2]];
  const f = fill === 'red' ? [redCol, 'rgba(224,57,28,0.82)', 'rgba(224,57,28,0.66)'] : ['#FFFFFF', PAPER, '#E6DCC6'];
  [[top, f[0]], [left, f[1]], [right, f[2]]].forEach(([P, c]) => { poly(ctx, P); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = fill === 'red' ? PAPER : INK; ctx.stroke(); });
  if (fill !== 'red') { const r = mulberry(7); ctx.fillStyle = GRAPH; for (let i = 0; i < 40; i++) { const u = r(), v = r(); const x = -0.5 + u * 0.56 + (r() < 0.5 ? 0 : 0.56), y = -0.7 + v * 0.75 + (x > 0.06 ? -(x - 0.06) * 0.46 : (x + 0.5) * 0.46); ctx.fillRect(x, y, 0.025, 0.025); } }
  ctx.restore();
}
// kalabalıktaki küçük insan: birim = boy; kök ayak; ph: yürüme fazı
export function drawTinyPerson(ctx, size, ph = 0, col = INK) {
  ctx.save(); ctx.scale(size, size); ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(0, -0.86, 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-0.13, -0.72, 0.26, 0.4, 0.08); ctx.fill();
  const w = Math.sin(ph) * 0.08; ctx.fillRect(-0.11 + w, -0.36, 0.08, 0.36); ctx.fillRect(0.03 - w, -0.36, 0.08, 0.36);
  ctx.restore();
}

// ——— on'un kuvvetleri katmanları (her biri kendi gerçek ölçeğinde; birim = katmanın gerçek genişliği; kök = merkez) ———
// el: açık avuç; birim = 1 (≈ 12 cm genişlik)
export function drawHand(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const palm = () => { ctx.beginPath(); ctx.moveTo(-0.3, 0.55); ctx.quadraticCurveTo(-0.36, 0.1, -0.28, -0.05); ctx.lineTo(0.3, -0.05); ctx.quadraticCurveTo(0.38, 0.2, 0.26, 0.55); ctx.closePath(); };
  const fingers = [[-0.22, -0.02, 0.085, 0.45, -0.08], [-0.08, -0.02, 0.09, 0.55, -0.02], [0.07, -0.02, 0.09, 0.51, 0.03], [0.21, -0.02, 0.08, 0.41, 0.08]];
  const finger = ([x, y, w, h, a]) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.roundRect(-w / 2, -h, w, h + 0.08, w / 2); ctx.restore(); };
  const thumb = () => { ctx.save(); ctx.translate(-0.27, 0.22); ctx.rotate(-1.0); ctx.beginPath(); ctx.roundRect(-0.052, -0.36, 0.104, 0.42, 0.052); ctx.restore(); };
  const all = [palm, thumb, ...fingers.map(f => () => finger(f))];
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 2.6; for (const s of all) { s(); ctx.stroke(); }
  ctx.fillStyle = PAPER; for (const s of all) { s(); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.6;
  for (const [x, y, w, h, a] of fingers) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); for (const k of [0.36, 0.68]) { ctx.beginPath(); ctx.moveTo(-w * 0.3, -h * k); ctx.lineTo(w * 0.3, -h * k); ctx.stroke(); } ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-0.24, 0.12); ctx.quadraticCurveTo(0, 0.22, 0.24, 0.08); ctx.moveTo(-0.2, 0.3); ctx.quadraticCurveTo(0.02, 0.2, 0.2, 0.32); ctx.stroke();
  ctx.restore();
}
// cilt hücreleri: düzensiz altıgen döşeme, her hücrede çekirdek; birim = 1 (≈ 200 µm)
const CELLS = (() => { const r = mulberry(11), out = []; const s = 0.14; for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) { const x = (i + (j % 2 ? 0.5 : 0)) * s, y = j * s * 0.87; const pts = []; for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3, rr = s * 0.56 * (0.88 + r() * 0.2); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.95]); } out.push({ x: x + (r() - 0.5) * 0.02, y: y + (r() - 0.5) * 0.02, pts, n: 0.016 + r() * 0.008 }); } return out; })();
export function drawCells(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.4 / size;
  ctx.fillStyle = BG; ctx.fillRect(-0.5, -0.5, 1, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(-0.5, -0.5, 1, 1); ctx.clip();
  for (const c of CELLS) { poly(ctx, c.pts); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.arc(c.x, c.y, c.n, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke(); hatch(ctx, () => { ctx.beginPath(); ctx.arc(c.x, c.y, c.n, 0, Math.PI * 2); }, 0.005, 45, lw * 0.5, INK, 0.7); }
  ctx.restore();
  ctx.restore();
}
// hücre çekirdeği: zar ve kromatin kıvrımları; birim = 1 (≈ 6 µm)
const CHROM = (() => { const r = mulberry(31), out = []; for (let k = 0; k < 26; k++) { let x = (r() - 0.5) * 0.7, y = (r() - 0.5) * 0.7; const pts = [[x, y]]; for (let i = 0; i < 14; i++) { x += (r() - 0.5) * 0.08; y += (r() - 0.5) * 0.08; pts.push([x, y]); } out.push(pts); } return out; })();
export function drawNucleus(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.fillStyle = BG; ctx.fillRect(-0.5, -0.5, 1, 1);
  ctx.beginPath(); ctx.arc(0, 0, 0.44, 0, Math.PI * 2); ctx.fillStyle = BG; ctx.fill(); ctx.lineWidth = lw * 2.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 0.43, 0, Math.PI * 2); ctx.clip(); ctx.lineWidth = lw * 1.4; for (const P of CHROM) { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); } ctx.restore();
  ctx.restore();
}
// DNA sarmalı: birim = 1 (≈ 20 nm parça; sarmal genişliği 2 nm = 0,1)
export function drawDNA(ctx, size, ph = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  ctx.fillStyle = BG; ctx.fillRect(-0.5, -0.5, 1, 1);
  for (let s = 0; s < 2; s++) { ctx.beginPath(); for (let x = -0.5; x <= 0.5; x += 0.003) { const y = Math.sin(x * 37 + ph + s * Math.PI) * 0.05; x === -0.5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = lw * 2.4; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.lineWidth = lw; for (let x = -0.5; x <= 0.5; x += 0.017) { const y1 = Math.sin(x * 37 + ph) * 0.05, y2 = -y1; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); }
  ctx.restore();
}
// atom: elektron bulutu (noktalama, merkeze doğru sıklaşır); çekirdek bu ölçekte görünmez; birim = 1 (≈ 0,3 nm)
const CLOUD = (() => { const r = mulberry(23), pts = []; for (let i = 0; i < 650; i++) { const rr = Math.sqrt(-Math.log(1 - r() * 0.98)) * 0.12, a = r() * Math.PI * 2; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return pts; })();
export function drawAtom(ctx, size, ph = 0) {
  ctx.save(); ctx.scale(size, size);
  ctx.fillStyle = BG; ctx.fillRect(-0.5, -0.5, 1, 1);
  ctx.fillStyle = INK; const s = Math.max(0.003, 2.2 / size);
  CLOUD.forEach(([x, y], i) => { const w = 0.004 * Math.sin(ph * 2 + i); ctx.fillRect(x + w, y - w, s, s); });
  ctx.restore();
}
// üstten stadyum: pxPerM dışarıdan; oval tribün ve çim (≈ 250 × 190 m)
export function drawStadium(ctx, pxPerM) {
  ctx.save(); const W = 250 * pxPerM, H = 190 * pxPerM, w = 105 * pxPerM, h = 68 * pxPerM;
  ctx.beginPath(); ctx.ellipse(0, 0, W / 2, H / 2, 0, 0, Math.PI * 2); ctx.fillStyle = '#EFE6D3'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, W / 2, H / 2, 0, 0, Math.PI * 2); ctx.ellipse(0, 0, W / 2 - 34 * pxPerM, H / 2 - 30 * pxPerM, 0, 0, Math.PI * 2); ctx.clip('evenodd');
  ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 1; for (let a = 0; a < Math.PI * 2; a += 0.06) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * W * 0.32, Math.sin(a) * H * 0.3); ctx.lineTo(Math.cos(a) * W * 0.52, Math.sin(a) * H * 0.52); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, 0, W / 2 - 34 * pxPerM, H / 2 - 30 * pxPerM, 0, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = PAPER; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 9.15 * pxPerM, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
// bezelye: birim = çap
export function drawPea(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  ctx.beginPath(); ctx.arc(0, 0, 0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  hatch(ctx, () => { ctx.beginPath(); ctx.arc(0.08, 0.08, 0.45, 0, Math.PI * 2); }, 0.06, 45, lw * 0.8, INK, 0.7);
  ctx.beginPath(); ctx.arc(-0.16, -0.16, 0.1, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  ctx.restore();
}

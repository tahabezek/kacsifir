// "Metal" karakterleri ve nesneleri: Michel Lotito (koyu dalgalı saç, bıyık, çizgili tişört), Charles Osborne
// (çiftçi: geniş kenarlı şapka, tulum; yaş parametresiyle kır saç ve hafif kambur). Cessna 150 (yandan; yenen
// parçalar sırayla kalkar), bisiklet, alışveriş arabası, tüplü televizyon, rekor plaketi, domuz, kantar.
// Tek kişi çizim fonksiyonu (iskelet: eklem açıları), kimlik kartla kilitli. Gravür dili; kırmızı yok.
// Birim: kişide boy = 1 (size px), kök ayak tabanı, sağa bakar.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;
const lerp = (a, b, u) => a + (b - a) * u;

let GHOST = false;
export function hatch(ctx, path, gap, ang, lw, col = INK) {
  if (GHOST) return;
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -1.4; d < 1.4; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 1.4, -dx * d - dy * 1.4); ctx.lineTo(dy * d + dx * 1.4, -dx * d + dy * 1.4); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function limb(ctx, x0, y0, x1, y1, w, lw, fill = PAPER) { ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = fill; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }

// Kimlik kartları (oranlar: baş yarıçapı 0,062 · boy 1)
export const LOTITO_CARD = Object.freeze({ name: 'Michel Lotito (1970\'ler: koyu dalgalı saç, bıyık, yatay çizgili tişört, koyu pantolon)', hair: 'wavy', moustache: true, top: 'stripes', hat: false, stroke: 0.012 });
export const OSBORNE_CARD = Object.freeze({ name: 'Charles Osborne (Iowa çiftçisi: geniş kenarlı şapka, tulum, açık gömlek)', hair: 'short', moustache: false, top: 'overalls', hat: true, stroke: 0.012 });

// pose: { arms: 'down'|'eat'|'lift'|'saw'|'hold'|'up'|'point', walk: faz|null, fall: 0..1 (arkaya devrilme),
//         hic: 0..1 (hıçkırık sarsıntısı: omuz ve baş yukarı), age: 0..1, mouth: 'flat'|'open'|'smile'|'o', eyes: 'open'|'closed', phase }
export function drawMan(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), age = pose.age || 0, hic = pose.hic || 0;
  // düşme: ayak tabanı çevresinde arkaya dönüş
  // düşme: ayak tabanı çevresinde öne (sağa) devrilme; pose.fallDir = -1 arkaya
  if (pose.fall) { const d = pose.fallDir || 1; ctx.translate(0.25 * pose.fall * d, 0); ctx.rotate(rad(80) * pose.fall * d); }
  ctx.rotate(rad(4 * age));
  const r = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2) : 0;
  const hip = [0, -0.5];
  const L = [[24 * r, Math.max(0, -36 * r)], [-24 * r, Math.max(0, 36 * r)]];
  L.forEach(([a, k]) => {
    const kx = hip[0] + Math.sin(rad(a)) * 0.25, ky = hip[1] + Math.cos(rad(a)) * 0.25, fx = kx + Math.sin(rad(a - k)) * 0.25, fy = ky + Math.cos(rad(a - k)) * 0.25;
    limb(ctx, hip[0], hip[1], kx, ky, 0.058, lw, card.top === 'overalls' ? PAPER : GRAPH); limb(ctx, kx, ky, fx, fy, 0.052, lw, card.top === 'overalls' ? PAPER : GRAPH);
    ctx.beginPath(); ctx.ellipse(fx + 0.04, fy - 0.008, 0.055, 0.02, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  });
  // gövde
  const y0 = hip[1] - 0.32 + hic * 0.015, w0 = 0.085, torso = () => poly(ctx, [[-w0, y0], [w0, y0], [w0 - 0.006, hip[1] + 0.02], [-w0 + 0.006, hip[1] + 0.02]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill();
  if (card.top === 'stripes') { ctx.save(); torso(); ctx.clip(); ctx.fillStyle = INK; for (let k = 0; k < 6; k++) ctx.fillRect(-0.2, y0 + 0.03 + k * 0.05, 0.4, 0.018); ctx.restore(); }
  if (card.top === 'overalls') { const bib = () => poly(ctx, [[-0.06, y0 + 0.08], [0.06, y0 + 0.08], [0.075, hip[1] + 0.02], [-0.075, hip[1] + 0.02]]); hatch(ctx, bib, 0.014, 90, lw * 0.8); bib(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-0.05, y0 + 0.08); ctx.lineTo(-0.06, y0); ctx.moveTo(0.05, y0 + 0.08); ctx.lineTo(0.06, y0); ctx.lineWidth = lw * 1.6; ctx.stroke(); }
  torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // kollar
  const sh = [0.004, y0 + 0.025 - hic * 0.02], arms = pose.arms || 'down', ph = pose.phase || 0;
  let A;
  if (arms === 'eat') A = [[150, -165 + 10 * Math.sin(ph * 7)], [25, 40]];
  else if (arms === 'lift') A = [[95, -40], [80, -30]];
  else if (arms === 'saw') A = [[70 + 18 * Math.sin(ph * 9), 30], [40, 30]];
  else if (arms === 'hold') A = [[70, 40], [60, 40]];
  else if (arms === 'up') A = [[150, -10], [-150, 10]];
  else if (arms === 'point') A = [[100, -5], [-20, 15]];
  else A = [[10 - 28 * r + hic * 25, 12], [-10 + 28 * r - hic * 25, 12]];
  const hands = [];
  A.forEach(([a, e]) => { const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.038, lw); limb(ctx, ex, ey, hx, hy, 0.034, lw); hands.push([hx, hy]); });
  // baş (hıçkırıkta küçük yukarı sıçrama)
  const hy = y0 - 0.088 - hic * 0.022;
  ctx.beginPath(); ctx.arc(0.01, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  const hairCol = age > 0.5 ? GRAPH : INK; ctx.fillStyle = hairCol;
  if (card.hair === 'wavy') { for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-0.05 + i * 0.019, hy - 0.048 - (i % 2) * 0.008, 0.022, 0, Math.PI * 2); ctx.fill(); } ctx.beginPath(); ctx.arc(-0.048, hy - 0.012, 0.026, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0.0, hy - 0.012, 0.062, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); }
  if (card.hat) {
    ctx.fillStyle = PAPER; ctx.beginPath(); ctx.ellipse(0.005, hy - 0.05, 0.11, 0.018, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    poly(ctx, [[-0.055, hy - 0.05], [-0.045, hy - 0.115], [0.055, hy - 0.115], [0.065, hy - 0.05]]); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.052, hy - 0.065); ctx.lineTo(0.062, hy - 0.065); ctx.lineWidth = lw * 2.2; ctx.stroke();
  }
  ctx.fillStyle = INK; ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK;
  if (pose.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(0.032, hy - 0.002); ctx.quadraticCurveTo(0.045, hy + 0.006, 0.058, hy - 0.002); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0.045, hy - 0.002, 0.008, 0, Math.PI * 2); ctx.fill(); }
  if (age > 0.4) { ctx.beginPath(); ctx.moveTo(0.03, hy + 0.012); ctx.lineTo(0.05, hy + 0.016); ctx.lineWidth = lw * 0.6; ctx.stroke(); ctx.lineWidth = lw * 0.8; }
  if (card.moustache) { ctx.beginPath(); ctx.ellipse(0.045, hy + 0.024, 0.022, 0.008, 0, 0, Math.PI * 2); ctx.fill(); }
  const m = hic > 0.5 ? 'o' : pose.mouth || 'flat'; ctx.beginPath();
  if (m === 'smile') ctx.arc(0.042, hy + 0.028, 0.016, 0.1 * Math.PI, 0.8 * Math.PI); else if (m === 'open') ctx.ellipse(0.046, hy + 0.036, 0.011, 0.014, 0, 0, Math.PI * 2); else if (m === 'o') ctx.ellipse(0.047, hy + 0.034, 0.008, 0.009, 0, 0, Math.PI * 2); else { ctx.moveTo(0.032, hy + 0.038); ctx.lineTo(0.058, hy + 0.038); }
  ctx.stroke();
  ctx.restore();
  return hands;
}

// ——— Cessna 150 (yandan, sağa bakar; birim = gövde boyu ≈ 7,3 m) ———
// Parçalar yenme sırasıyla: pervane, teker kaplamaları, iniş takımı, kanat dikmeleri, kapı, kuyruk, kanat, motor kaputu, gövde.
// eaten: 0..1 → kalan parçalar; sınırdaki parça kesik çizgiyle "yarım" çizilir. Yenen yerde ince kesik kontur (hayalet) kalır.
const CESSNA_PARTS = [
  ['pervane', ctx => { ctx.beginPath(); ctx.moveTo(0.505, -0.2); ctx.lineTo(0.515, -0.03); ctx.lineTo(0.505, 0.14); ctx.lineWidth = 0.014; ctx.stroke(); ctx.beginPath(); ctx.arc(0.5, -0.03, 0.022, 0, Math.PI * 2); ctx.fill(); }],
  ['teker', ctx => { for (const [x, y] of [[0.36, 0.2], [-0.02, 0.21]]) { ctx.beginPath(); ctx.arc(x, y, 0.045, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, 0.016, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); } }],
  ['iniş takımı', ctx => { ctx.beginPath(); ctx.moveTo(0.36, 0.06); ctx.lineTo(0.36, 0.17); ctx.moveTo(0.06, 0.07); ctx.lineTo(-0.02, 0.18); ctx.lineWidth = 0.012; ctx.stroke(); }],
  ['dikme', ctx => { ctx.beginPath(); ctx.moveTo(0.12, 0.04); ctx.lineTo(0.0, -0.17); ctx.lineWidth = 0.01; ctx.stroke(); }],
  ['kapı', ctx => { poly(ctx, [[0.1, -0.15], [0.26, -0.15], [0.28, 0.02], [0.1, 0.03]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); hatch(ctx, () => poly(ctx, [[0.115, -0.135], [0.245, -0.135], [0.255, -0.06], [0.115, -0.06]]), 0.012, 60, 0.004); }],
  ['kuyruk', ctx => { poly(ctx, [[-0.44, -0.04], [-0.48, -0.3], [-0.4, -0.3], [-0.3, -0.06]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); poly(ctx, [[-0.47, -0.02], [-0.3, -0.03], [-0.3, 0.0], [-0.47, 0.0]]); ctx.fill(); ctx.stroke(); }],
  ['kanat', ctx => { poly(ctx, [[-0.12, -0.2], [0.34, -0.2], [0.34, -0.165], [-0.12, -0.17]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); hatch(ctx, () => poly(ctx, [[-0.12, -0.2], [0.34, -0.2], [0.34, -0.165], [-0.12, -0.17]]), 0.01, 0, 0.003, GRAPH); }],
  ['motor kaputu', ctx => { poly(ctx, [[0.32, -0.12], [0.46, -0.1], [0.5, -0.04], [0.48, 0.05], [0.32, 0.06]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(0.36 + i * 0.03, -0.08); ctx.lineTo(0.36 + i * 0.03, 0.03); ctx.lineWidth = 0.004; ctx.stroke(); } }],
  ['gövde', ctx => { poly(ctx, [[-0.46, -0.03], [-0.1, -0.08], [0.06, -0.17], [0.3, -0.17], [0.32, 0.06], [0.06, 0.07], [-0.46, 0.0]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); hatch(ctx, () => poly(ctx, [[-0.46, -0.03], [-0.1, -0.08], [0.06, -0.17], [0.3, -0.17], [0.32, 0.06], [0.06, 0.07], [-0.46, 0.0]]), 0.016, 0, 0.003, GRAPH); }],
];
export const CESSNA_PART_NAMES = CESSNA_PARTS.map(p => p[0]);
export function drawCessna(ctx, size, eaten = 0, ghost = true) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = 2.2 / size, n = CESSNA_PARTS.length, gone = eaten * n;
  // arkadakiler önce (gövde, kanat, kuyruk …), öndekiler sonra; k = yenme sırası (0 = pervane)
  for (const k of [8, 6, 5, 7, 4, 3, 2, 1, 0]) {
    const done = gone >= k + 1, part = !done && gone > k;
    ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw;
    if (done) {
      // yenmiş parça: yalnız ince kesik kontur (dolgu ve tarama yok)
      if (ghost) { ctx.globalAlpha = 0.28; ctx.setLineDash([0.014, 0.012]); GHOST = true; ctx.fill = () => {}; CESSNA_PARTS[k][1](ctx); delete ctx.fill; GHOST = false; }
      ctx.restore(); continue;
    }
    if (part) ctx.globalAlpha = 1 - 0.65 * (gone - k);
    CESSNA_PARTS[k][1](ctx);
    ctx.restore();
  }
  ctx.restore();
}

// küçük nesneler (birim = yükseklik; kök tabanın ortası)
export function drawBike(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  for (const x of [-0.45, 0.45]) { ctx.beginPath(); ctx.arc(x, -0.32, 0.32, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x, -0.32, 0.03, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-0.45, -0.32); ctx.lineTo(-0.1, -0.32); ctx.lineTo(0.25, -0.72); ctx.lineTo(-0.2, -0.72); ctx.closePath(); ctx.moveTo(-0.2, -0.72); ctx.lineTo(-0.45, -0.32); ctx.moveTo(0.25, -0.72); ctx.lineTo(0.45, -0.32); ctx.moveTo(-0.2, -0.72); ctx.lineTo(-0.24, -0.82); ctx.moveTo(-0.32, -0.84); ctx.lineTo(-0.14, -0.84); ctx.moveTo(0.25, -0.72); ctx.lineTo(0.22, -0.9); ctx.lineTo(0.34, -0.92); ctx.lineWidth = lw * 1.3; ctx.stroke();
  ctx.restore();
}
export function drawCart(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  const box = () => poly(ctx, [[-0.5, -0.95], [0.45, -0.95], [0.35, -0.35], [-0.42, -0.35]]);
  box(); ctx.fillStyle = PAPER; ctx.fill(); ctx.save(); box(); ctx.clip(); for (let x = -0.5; x < 0.5; x += 0.08) { ctx.beginPath(); ctx.moveTo(x, -1); ctx.lineTo(x, -0.3); ctx.stroke(); } for (let y = -0.9; y < -0.35; y += 0.1) { ctx.beginPath(); ctx.moveTo(-0.6, y); ctx.lineTo(0.6, y); ctx.stroke(); } ctx.restore(); box(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.5, -0.95); ctx.lineTo(-0.62, -1.08); ctx.lineTo(-0.72, -1.08); ctx.moveTo(-0.42, -0.35); ctx.lineTo(-0.36, -0.12); ctx.lineTo(0.3, -0.12); ctx.lineTo(0.35, -0.35); ctx.lineWidth = lw * 1.3; ctx.stroke();
  for (const x of [-0.32, 0.26]) { ctx.beginPath(); ctx.arc(x, -0.06, 0.06, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore();
}
export function drawTV(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.roundRect(-0.55, -1, 1.1, 0.82, 0.08); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  hatch(ctx, () => { ctx.beginPath(); ctx.roundRect(-0.55, -1, 1.1, 0.82, 0.08); }, 0.03, 0, lw * 0.5, GRAPH);
  ctx.beginPath(); ctx.roundRect(-0.45, -0.92, 0.72, 0.62, 0.12); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.4, -0.75, 0.05, 0, Math.PI * 2); ctx.arc(0.4, -0.55, 0.05, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.3, -0.18); ctx.lineTo(-0.36, 0); ctx.moveTo(0.3, -0.18); ctx.lineTo(0.36, 0); ctx.moveTo(-0.1, -1); ctx.lineTo(-0.3, -1.25); ctx.moveTo(0.1, -1); ctx.lineTo(0.3, -1.22); ctx.lineWidth = lw * 1.3; ctx.stroke();
  ctx.restore();
}
// rekor plaketi (pirinç: çift kenar, kabartma çizgiler; marka adı YOK); birim = genişlik; bite: 0..1 ısırık izi
export function drawPlaque(ctx, size, bite = 0, bg = '#ECE5D5') {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size;
  ctx.beginPath(); ctx.roundRect(-0.5, -0.36, 1, 0.72, 0.04); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-0.44, -0.3, 0.88, 0.6, 0.03); ctx.lineWidth = lw; ctx.stroke();
  hatch(ctx, () => { ctx.beginPath(); ctx.roundRect(-0.5, -0.36, 1, 0.72, 0.04); }, 0.03, 30, lw * 0.5, GRAPH);
  // yazı yok (uydurma metin olmasın): kabartma çizgiler ve madalyon
  ctx.beginPath(); ctx.arc(0, -0.1, 0.1, 0, Math.PI * 2); ctx.lineWidth = lw * 1.2; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.1, 0.07, 0, Math.PI * 2); ctx.lineWidth = lw * 0.6; ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-0.3 + i * 0.06, 0.08 + i * 0.06); ctx.lineTo(0.3 - i * 0.06, 0.08 + i * 0.06); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  // ısırık: sağ kenardan üç yarım daire, zemin rengiyle oyulur; kenar mürekkeple çizilir
  if (bite > 0) for (let i = 0; i < 3; i++) {
    const r = 0.13 * Math.min(1, bite * 3 - i) ; if (r <= 0) continue;
    const cy = -0.2 + i * 0.2; ctx.beginPath(); ctx.arc(0.5, cy, r, Math.PI * 0.5, Math.PI * 1.5); ctx.closePath(); ctx.fillStyle = bg; ctx.fill();
    ctx.beginPath(); ctx.arc(0.5, cy, r, Math.PI * 0.5, Math.PI * 1.5); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = INK; ctx.stroke();
  }
  ctx.restore();
}
// domuz (yandan, sağa bakar); birim = boy
export function drawHog(ctx, size, hang = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.ellipse(0, -0.32, 0.46, 0.25, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  hatch(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -0.32, 0.46, 0.25, 0, 0, Math.PI * 2); }, 0.03, 10, lw * 0.5, GRAPH);
  ctx.beginPath(); ctx.ellipse(0.47, -0.36, 0.13, 0.12, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.58, -0.34, 0.04, 0.055, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.42, -0.46); ctx.lineTo(0.38, -0.56); ctx.lineTo(0.48, -0.48); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.5, -0.4, 0.014, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  const leg = hang * 0.5;
  for (const x of [-0.3, -0.15, 0.18, 0.3]) { ctx.beginPath(); ctx.moveTo(x, -0.12); ctx.lineTo(x + leg * 0.1, 0); ctx.lineWidth = lw * 3.2; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-0.46, -0.36); ctx.bezierCurveTo(-0.56, -0.44, -0.52, -0.3, -0.6, -0.36); ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}
// kantar (asma tartı): kanca + kadran; birim = yükseklik; needle: 0..1
export function drawScale(ctx, size, needle = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, -0.82); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.62, 0.2, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.stroke();
  for (let i = 0; i <= 10; i++) { const a = -Math.PI * 0.75 + i * Math.PI * 0.15; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.16, -0.62 + Math.sin(a) * 0.16); ctx.lineTo(Math.cos(a) * 0.19, -0.62 + Math.sin(a) * 0.19); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  const a = -Math.PI * 0.75 + needle * Math.PI * 1.5; ctx.beginPath(); ctx.moveTo(0, -0.62); ctx.lineTo(Math.cos(a) * 0.15, -0.62 + Math.sin(a) * 0.15); ctx.lineWidth = lw * 1.2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -0.42); ctx.lineTo(0, -0.3); ctx.arc(-0.05, -0.3, 0.05, 0, Math.PI, false); ctx.lineWidth = lw * 1.2; ctx.stroke();
  ctx.restore();
}
// metal blok (1 ton): birim = kenar
export function drawBlock(ctx, size, label) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  poly(ctx, [[-0.5, 0], [0.5, 0], [0.5, -0.7], [-0.5, -0.7]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  poly(ctx, [[-0.5, -0.7], [-0.32, -0.86], [0.68, -0.86], [0.5, -0.7]]); ctx.fill(); ctx.stroke();
  poly(ctx, [[0.5, 0], [0.68, -0.16], [0.68, -0.86], [0.5, -0.7]]); ctx.fill(); ctx.stroke();
  hatch(ctx, () => poly(ctx, [[0.5, 0], [0.68, -0.16], [0.68, -0.86], [0.5, -0.7]]), 0.04, 70, lw * 0.6);
  hatch(ctx, () => poly(ctx, [[-0.5, 0], [0.5, 0], [0.5, -0.7], [-0.5, -0.7]]), 0.06, 0, lw * 0.4, GRAPH);
  if (label) { ctx.fillStyle = INK; ctx.font = `500 ${0.31}px "IBM Plex Mono"`; ctx.textAlign = 'center'; ctx.fillText(label, 0, -0.24); }
  ctx.restore();
}
// alyans (evlilik) ve çocuk silüeti (birim = yükseklik)
export function drawRing(ctx, size) { ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw * 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.ellipse(0, -0.4, 0.34, 0.4, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -0.4, 0.26, 0.32, 0, 0, Math.PI * 2); ctx.lineWidth = lw; ctx.stroke(); ctx.restore(); }
export function drawChild(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.arc(0, -0.82, 0.14, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  poly(ctx, [[-0.16, -0.66], [0.16, -0.66], [0.2, -0.3], [-0.2, -0.3]]); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.08, -0.3); ctx.lineTo(-0.1, 0); ctx.moveTo(0.08, -0.3); ctx.lineTo(0.1, 0); ctx.lineWidth = lw * 2.4; ctx.stroke();
  ctx.restore();
}
// ahır (yandan, gravür): birim = genişlik
export function drawBarn(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  const body = () => poly(ctx, [[-0.5, 0], [0.5, 0], [0.5, -0.5], [0, -0.8], [-0.5, -0.5]]);
  body(); ctx.fillStyle = PAPER; ctx.fill(); hatch(ctx, body, 0.03, 90, lw * 0.5, GRAPH); body(); ctx.stroke();
  poly(ctx, [[-0.56, -0.48], [0, -0.86], [0.56, -0.48]]); ctx.lineWidth = lw * 2.2; ctx.stroke();
  ctx.lineWidth = lw; ctx.beginPath(); ctx.rect(-0.16, -0.42, 0.32, 0.42); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.16, -0.42); ctx.lineTo(0.16, 0); ctx.moveTo(0.16, -0.42); ctx.lineTo(-0.16, 0); ctx.stroke();
  ctx.beginPath(); ctx.rect(-0.07, -0.66, 0.14, 0.12); ctx.fill(); ctx.stroke();
  ctx.restore();
}

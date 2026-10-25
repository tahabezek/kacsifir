// "Doz" karakterleri ve nesneleri: Anatoli Bugorski (1978, laboratuvar önlüğü, kısa saç) ve Joseph Samuel (1803, mahkûm
// gömleği, pantolon, bağlı eller). Tek kişi çizim fonksiyonu (iskelet: eklem açıları), kimlik kartla kilitli. Yüz yok:
// gravür genel figür (göz noktası, ağız çizgisi). Nesneler: ışın borusu ve mıknatıslar, U-70 halkası (üstten), uyarı
// lambası, yüz şeması, darağacı, araba, ip ve ilmik, karar kâğıdı, doktora diploması. Kırmızı yok (yalnız doruk sahnede).
// Birim: kişide boy = 1 (size px), kök ayak tabanı, sağa bakar.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;
const lerp = (a, b, u) => a + (b - a) * u;

function hatchClip(ctx, path, gap, ang, lw, col = INK, span = 1.4) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -span; d < span; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * span, -dx * d - dy * span); ctx.lineTo(dy * d + dx * span, -dx * d + dy * span); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function limb(ctx, x0, y0, x1, y1, w, lw, fill = PAPER) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = fill; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}

// Kimlik kartları (oranlar: baş yarıçapı 0,062; omuz 0,08; bacak 2 × 0,25)
export const BUGORSKI_CARD = Object.freeze({ name: 'Anatoli Bugorski (1978: 36 yaşında fizikçi; kısa koyu saç, beyaz laboratuvar önlüğü, koyu pantolon)', hair: 'short', coat: true, stroke: 0.012 });
export const SAMUEL_CARD = Object.freeze({ name: 'Joseph Samuel (1803: genç mahkûm; uzun saç arkada bağlı, bol gömlek, yelek, diz altı pantolon)', hair: 'tied', coat: false, vest: true, stroke: 0.012 });
export const OFFICER_CARD = Object.freeze({ name: 'vali / görevli (1803: uzun ceket, üç köşeli şapka)', hair: 'hat', coat: true, dark: true, stroke: 0.012 });

// pose: { walk: faz sn | null, lean: derece (gövde öne), neck: derece (baş öne eğilir), arms: 'down'|'clip'|'bound'|'face'|'write'|'up',
//         kneel: bool, sit: bool, mouth: 'flat'|'open', eyes: 'open'|'closed' }
export function drawPerson(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size);
  const r = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2 / 0.9) : 0;
  const down = pose.kneel ? 0.22 : pose.sit ? 0.26 : 0;
  const hip = [0, -0.5 + down];
  // bacaklar
  let Lg;
  if (pose.kneel) Lg = [[15, 105], [5, 95]];
  else if (pose.sit) Lg = [[85, 85], [78, 80]];
  else Lg = [[22 * r, Math.max(0, -35 * r)], [-22 * r, Math.max(0, 35 * r)]];
  Lg.forEach(([a, k]) => {
    const kx = hip[0] + Math.sin(rad(a)) * 0.25, ky = hip[1] + Math.cos(rad(a)) * 0.25, fx = kx + Math.sin(rad(a - k)) * 0.25, fy = ky + Math.cos(rad(a - k)) * 0.25;
    const col = card.coat ? '#3A3833' : PAPER;
    limb(ctx, hip[0], hip[1], kx, ky, 0.056, lw, col); limb(ctx, kx, ky, fx, fy, 0.05, lw, col);
    ctx.beginPath(); ctx.ellipse(fx + 0.035, fy - 0.008, 0.05, 0.02, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  });
  // gövde (öne eğilme kalçadan döner)
  ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(rad(pose.lean || 0)); ctx.translate(-hip[0], -hip[1]);
  const y0 = hip[1] - 0.3, torso = () => poly(ctx, [[-0.08, y0], [0.08, y0], [0.07, hip[1] + 0.02], [-0.07, hip[1] + 0.02]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill();
  if (card.vest) hatchClip(ctx, () => poly(ctx, [[-0.08, y0 + 0.04], [-0.01, y0 + 0.04], [-0.02, hip[1] - 0.02], [-0.07, hip[1] - 0.02]]), 0.012, 70, lw * 0.8, INK, 1);
  if (card.dark) hatchClip(ctx, torso, 0.014, 75, lw * 0.9, INK, 1);
  torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // önlük: kalçanın altına inen etek parçası
  if (card.coat) { poly(ctx, [[-0.08, hip[1] - 0.02], [0.075, hip[1] - 0.02], [0.095, hip[1] + 0.2], [-0.095, hip[1] + 0.2]]); ctx.fillStyle = card.dark ? '#3A3833' : PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0.0, y0 + 0.04); ctx.lineTo(0.0, hip[1] + 0.2); ctx.stroke(); }
  // kollar
  const sh = [0.004, y0 + 0.025], arms = pose.arms || 'down', ph = pose.phase || 0;
  let A;
  if (arms === 'clip') A = [[60, 70], [40, 80]];
  else if (arms === 'bound') A = [[12, 45], [4, 52]];
  else if (arms === 'face') A = [[95, 100], [-10, 10]];
  else if (arms === 'write') A = [[70, 40 + 6 * Math.sin(ph * 11)], [55, 50]];
  else if (arms === 'up') A = [[150, -10], [-150, 10]];
  else A = [[10 - 25 * r, 8], [-10 + 25 * r, 8]];
  const hands = [];
  A.forEach(([a, e]) => { const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.038, lw, PAPER); limb(ctx, ex, ey, hx, hy, 0.034, lw, PAPER); hands.push([hx, hy]); });
  if (arms === 'bound') { const [a, b] = hands; ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  if (arms === 'clip') { const [hx, hy] = hands[1]; ctx.save(); ctx.translate(hx + 0.02, hy - 0.04); ctx.rotate(-0.25); ctx.fillStyle = PAPER; ctx.fillRect(-0.04, -0.06, 0.08, 0.11); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(-0.04, -0.06, 0.08, 0.11); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-0.028, -0.03 + i * 0.025); ctx.lineTo(0.028, -0.03 + i * 0.025); ctx.lineWidth = lw * 0.6; ctx.stroke(); } ctx.restore(); }
  // baş (boyundan öne eğilir)
  ctx.save(); ctx.translate(0.01, y0 - 0.01); ctx.rotate(rad(pose.neck || 0)); ctx.translate(-0.01, -(y0 - 0.01));
  const hy = y0 - 0.085;
  ctx.beginPath(); ctx.arc(0.01, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK;
  if (card.hair === 'short') { ctx.beginPath(); ctx.arc(0.0, hy - 0.012, 0.063, Math.PI * 1.02, Math.PI * 1.96); ctx.fill(); }
  else if (card.hair === 'tied') { ctx.beginPath(); ctx.arc(0.0, hy - 0.01, 0.064, Math.PI * 0.9, Math.PI * 1.96); ctx.lineTo(-0.02, hy - 0.02); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.ellipse(-0.075, hy + 0.01, 0.018, 0.03, 0.3, 0, Math.PI * 2); ctx.fill(); }
  else if (card.hair === 'hat') { poly(ctx, [[-0.1, hy - 0.04], [0.11, hy - 0.04], [0.06, hy - 0.11], [-0.05, hy - 0.11]]); ctx.fill(); }
  if (pose.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(0.032, hy - 0.002); ctx.quadraticCurveTo(0.045, hy + 0.006, 0.058, hy - 0.002); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0.045, hy - 0.002, 0.008, 0, Math.PI * 2); ctx.fill(); }
  ctx.lineWidth = lw * 0.8; ctx.beginPath();
  if (pose.mouth === 'open') ctx.ellipse(0.046, hy + 0.034, 0.009, 0.012, 0, 0, Math.PI * 2); else { ctx.moveTo(0.034, hy + 0.036); ctx.lineTo(0.056, hy + 0.036); }
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

// Işın borusu (yandan): boru, flanşlar, iki tarama mıknatıs bloğu; gap: [x0, x1] borunun açık (arızalı) kesimi
export function drawPipe(ctx, x0, x1, y, r, gap, lw = 3) {
  ctx.save(); ctx.lineWidth = lw; ctx.strokeStyle = INK;
  const seg = (a, b) => { ctx.fillStyle = PAPER; ctx.fillRect(a, y - r, b - a, 2 * r); ctx.beginPath(); ctx.moveTo(a, y - r); ctx.lineTo(b, y - r); ctx.moveTo(a, y + r); ctx.lineTo(b, y + r); ctx.stroke(); };
  if (gap) { seg(x0, gap[0]); seg(gap[1], x1); for (const x of gap) { ctx.fillStyle = PAPER; ctx.fillRect(x - 6, y - r - 10, 12, 2 * r + 20); ctx.strokeRect(x - 6, y - r - 10, 12, 2 * r + 20); } }
  else seg(x0, x1);
  // flanşlar
  for (let x = x0 + 60; x < x1; x += 180) { if (gap && x > gap[0] - 20 && x < gap[1] + 20) continue; ctx.beginPath(); ctx.moveTo(x, y - r - 6); ctx.lineTo(x, y + r + 6); ctx.stroke(); }
  ctx.restore();
}
export function drawMagnet(ctx, x, y, w, h) {
  ctx.save();
  const P = () => { ctx.beginPath(); ctx.rect(x - w / 2, y - h / 2, w, h); };
  P(); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); P(); ctx.clip(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; for (let k = -h; k < w + h; k += 9) { ctx.beginPath(); ctx.moveTo(x - w / 2 + k, y + h / 2); ctx.lineTo(x - w / 2 + k + h, y - h / 2); ctx.stroke(); } ctx.restore();
  P(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  // bobin sargısı (ortada açık şerit)
  ctx.fillStyle = PAPER; ctx.fillRect(x - w / 2 + 10, y - 12, w - 20, 24); ctx.strokeRect(x - w / 2 + 10, y - 12, w - 20, 24);
  for (let i = 1; i < 8; i++) { const xx = x - w / 2 + 10 + i * (w - 20) / 8; ctx.beginPath(); ctx.moveTo(xx, y - 12); ctx.lineTo(xx, y + 12); ctx.lineWidth = 1.2; ctx.stroke(); }
  ctx.restore();
}

// U-70 halkası (üstten şema): mıknatıs kesimleri; t ile ışın atımları döner. Birim = yarıçap (px)
export function drawRing(ctx, R, t = 0, pulses = 6, speed = 0.5) {
  ctx.save(); ctx.strokeStyle = INK;
  ctx.lineWidth = R * 0.12; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = R * 0.12 - 5; ctx.strokeStyle = PAPER; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.94, Math.sin(a) * R * 0.94); ctx.lineTo(Math.cos(a) * R * 1.06, Math.sin(a) * R * 1.06); ctx.stroke(); }
  for (let k = 0; k < pulses; k++) { const a = t * speed * Math.PI * 2 + k / pulses * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * R, Math.sin(a) * R, R * 0.035, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore();
}

// uyarı lambası (direkte); broken: camı çatlak, sönük
export function drawLamp(ctx, size, broken) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -0.7); ctx.stroke();
  ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(0, -0.85, 0.16, Math.PI, 0); ctx.lineTo(0.16, -0.7); ctx.lineTo(-0.16, -0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-0.13 + i * 0.13, -0.7); ctx.lineTo(-0.13 + i * 0.13, -0.92 + Math.abs(i - 1) * 0.04); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  if (broken) { ctx.lineWidth = lw * 1.4; ctx.beginPath(); ctx.moveTo(-0.08, -0.95); ctx.lineTo(0.0, -0.84); ctx.lineTo(-0.04, -0.78); ctx.lineTo(0.06, -0.72); ctx.stroke(); }
  ctx.fillStyle = PAPER; ctx.fillRect(-0.12, -0.04, 0.24, 0.04); ctx.lineWidth = lw; ctx.strokeRect(-0.12, -0.04, 0.24, 0.04);
  ctx.restore();
}

// yüz şeması (önden, anatomi yok): sol yarı tarama (felç); beam: ışının giriş/çıkış noktaları. Birim = yükseklik
export function drawFaceDiagram(ctx, size, opts = {}) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size;
  const P = () => { ctx.beginPath(); ctx.ellipse(0, 0, 0.36, 0.47, 0, 0, Math.PI * 2); };
  P(); ctx.fillStyle = PAPER; ctx.fill();
  // izleyicinin sağı = kişinin solu
  if (opts.half > 0) { ctx.save(); P(); ctx.clip(); ctx.globalAlpha = opts.half; hatchClip(ctx, () => { ctx.beginPath(); ctx.rect(0, -0.6, 0.6, 1.2); }, 0.03, 60, lw * 0.8, GRAPH, 1); ctx.restore(); }
  P(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; for (const x of [-0.13, 0.13]) { ctx.beginPath(); ctx.arc(x, -0.06, 0.025, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(0, -0.02); ctx.lineTo(-0.025, 0.1); ctx.lineTo(0.02, 0.11); ctx.lineWidth = lw * 0.8; ctx.stroke();
  ctx.beginPath(); if (opts.half > 0.5) { ctx.moveTo(-0.12, 0.22); ctx.quadraticCurveTo(0, 0.25, 0.12, 0.25); } else { ctx.moveTo(-0.12, 0.22); ctx.lineTo(0.12, 0.22); } ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -0.5); ctx.lineTo(0, 0.5); ctx.setLineDash([0.03, 0.03]); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = GRAPH; ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}
// baş profili (yandan, sade kontur; anatomi yok). Birim = yükseklik; sağa bakar
export function headProfile(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size;
  ctx.beginPath();
  ctx.moveTo(-0.05, 0.5); ctx.lineTo(-0.06, 0.28);
  ctx.bezierCurveTo(-0.3, 0.24, -0.38, -0.05, -0.32, -0.25);
  ctx.bezierCurveTo(-0.25, -0.48, 0.05, -0.55, 0.22, -0.4);
  ctx.bezierCurveTo(0.3, -0.32, 0.3, -0.18, 0.29, -0.08);
  ctx.lineTo(0.36, 0.04); ctx.lineTo(0.3, 0.07); ctx.lineTo(0.31, 0.16); ctx.lineTo(0.29, 0.2); ctx.lineTo(0.3, 0.27);
  ctx.bezierCurveTo(0.25, 0.34, 0.15, 0.33, 0.12, 0.33); ctx.lineTo(0.12, 0.5);
  ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // saç
  ctx.beginPath(); ctx.moveTo(-0.32, -0.2); ctx.bezierCurveTo(-0.28, -0.46, 0.05, -0.56, 0.22, -0.4); ctx.bezierCurveTo(0.1, -0.42, -0.1, -0.36, -0.2, -0.12); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0.19, -0.1, 0.022, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// darağacı (1803, yandan): iki direk, kiriş, payandalar; birim = yükseklik; kök sol direğin dibi
export function drawGallows(ctx, size, span = 1.1) {
  ctx.save(); ctx.scale(size, size); const lw = 2.4 / size;
  const post = (x) => { ctx.fillStyle = PAPER; ctx.fillRect(x - 0.035, -1, 0.07, 1); hatchClip(ctx, () => { ctx.beginPath(); ctx.rect(x - 0.035, -1, 0.07, 1); }, 0.025, 90, lw * 0.5, GRAPH, 1.2); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(x - 0.035, -1, 0.07, 1); };
  post(0); post(span);
  ctx.fillStyle = PAPER; ctx.fillRect(-0.08, -1.06, span + 0.16, 0.07); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(-0.08, -1.06, span + 0.16, 0.07);
  for (const [x, d] of [[0, 1], [span, -1]]) { ctx.beginPath(); ctx.moveTo(x + d * 0.035, -0.82); ctx.lineTo(x + d * 0.2, -0.99); ctx.lineWidth = lw * 1.6; ctx.stroke(); }
  ctx.restore();
}
// iki tekerlekli araba (yandan); birim = genişlik; kök sol alt (zemin)
export function drawCart(ctx, size, spin = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2.4 / size;
  ctx.fillStyle = PAPER; ctx.fillRect(0, -0.42, 1, 0.12); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(0, -0.42, 1, 0.12);
  for (let x = 0.12; x < 1; x += 0.12) { ctx.beginPath(); ctx.moveTo(x, -0.42); ctx.lineTo(x, -0.3); ctx.lineWidth = lw * 0.6; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(1, -0.36); ctx.lineTo(1.45, -0.3); ctx.lineWidth = lw * 1.4; ctx.stroke();
  ctx.save(); ctx.translate(0.5, -0.17); ctx.rotate(spin);
  ctx.beginPath(); ctx.arc(0, 0, 0.17, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 0.17, Math.sin(a) * 0.17); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}
// ip: kirişten (x, y) aşağı len; state: 'noose' (ilmikli, sağlam) | 'snapped' (kopuk, kısa uç) | 'slipped' (boş ilmik);
// sway: radyan. Birim px.
export function drawRope(ctx, x, y, len, state, sway = 0, lw = 3) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(sway); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineCap = 'round';
  const L = state === 'snapped' ? len * 0.45 : len;
  ctx.beginPath(); for (let yy = 0; yy <= L; yy += 6) { const xx = Math.sin(yy * 0.35) * lw * 0.35; yy ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
  if (state === 'snapped') { for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, L); ctx.lineTo(i * 4, L + 10 + Math.abs(i) * 2); ctx.lineWidth = lw * 0.5; ctx.stroke(); } }
  else { ctx.beginPath(); ctx.ellipse(0, L + len * 0.13, len * 0.08, len * 0.13, 0, 0, Math.PI * 2); ctx.lineWidth = lw; ctx.stroke(); }
  ctx.restore();
}
// karar kâğıdı (mühürlü); birim = genişlik
export function drawDecree(ctx, size, lines) {
  ctx.save(); ctx.scale(size, size); const lw = 1.8 / size;
  ctx.fillStyle = PAPER; ctx.fillRect(-0.5, -0.66, 1, 1.32); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(-0.5, -0.66, 1, 1.32);
  for (let i = 0; i < lines; i++) { ctx.beginPath(); ctx.moveTo(-0.38, -0.48 + i * 0.1); ctx.lineTo(i % 3 === 2 ? 0.1 : 0.38, -0.48 + i * 0.1); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0.26, 0.42, 0.11, 0, Math.PI * 2); ctx.lineWidth = lw * 1.4; ctx.stroke(); ctx.beginPath(); ctx.arc(0.26, 0.42, 0.075, 0, Math.PI * 2); ctx.lineWidth = lw * 0.7; ctx.stroke();
  ctx.restore();
}
// diploma (rulo kurdeleli); birim = genişlik
export function drawDiploma(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.8 / size;
  ctx.fillStyle = PAPER; ctx.fillRect(-0.5, -0.36, 1, 0.72); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(-0.5, -0.36, 1, 0.72); ctx.strokeRect(-0.46, -0.32, 0.92, 0.64);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-0.3, -0.12 + i * 0.09); ctx.lineTo(0.3, -0.12 + i * 0.09); ctx.lineWidth = lw * 0.6; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0.32, 0.22, 0.07, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}
// kalabalık (başlar ve omuzlar): row yüksekliği h; t ile hafif kıpırdar (sürekli, tohumlu faz)
export function drawCrowd(ctx, x0, x1, y, h, phases, t, quiet) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 2;
  phases.forEach(([dx, ph], i) => {
    const x = x0 + dx + (quiet ? 0 : Math.sin(t * 1.7 + ph * 2) * 2.2); if (x > x1) return;
    const yy = y + Math.sin(t * (quiet ? 1.1 : 2.9) + ph) * (quiet ? 1 : 3.6);
    ctx.beginPath(); ctx.arc(x, yy - h * 0.62, h * 0.2, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - h * 0.32, yy); ctx.quadraticCurveTo(x, yy - h * 0.5, x + h * 0.32, yy); ctx.stroke();
    if (i % 4 === 1) { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x, yy - h * 0.8, h * 0.26, h * 0.06, 0, 0, Math.PI * 2); ctx.fill(); }
  });
  ctx.restore();
}

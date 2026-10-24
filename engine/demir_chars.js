// "Demir" karakterleri ve nesneleri: demiryolu ustabaşı Phineas Gage (1848), sıkıştırma demiri, kafatası kesiti,
// ıstakoz dalgıcı Michael Packard (2021), kambur balina, terazi. Tek çizim fonksiyonları; gravür dili; kan yok, kırmızı yok.
// Birim: kişide boy = 1 (size px), kök ayak tabanı, sağa bakar. Balinada boy = 1, kök gövde ortası, ağız sağda.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;
const lerp = (a, b, u) => a + (b - a) * u;

function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -1.4; d < 1.4; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 1.4, -dx * d - dy * 1.4); ctx.lineTo(dy * d + dx * 1.4, -dx * d + dy * 1.4); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function limb(ctx, x0, y0, x1, y1, w, lw, fill = PAPER) { ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = fill; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }

// ——— Phineas Gage (25, 1848): geniş kenarlı şapka, yelek, gömlek kolları sıvalı, koyu pantolon ———
export const GAGE_CARD = Object.freeze({ name: 'Phineas Gage (1848 ustabaşı: şapka, yelek, sıvalı gömlek)', stroke: 0.012 });
// pose: { walk: faz sn | null, arms: 'tamp' | 'down' | 'talk', phase: sn, lean: rad, eyes: 'open' | 'closed', fallen: 0..1 }
export function drawGage(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), w = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2 / 1.0) : 0, ph = pose.phase || 0;
  // yere düşme: ayak tabanı çevresinde arkaya döner
  if (pose.fallen) ctx.rotate(-Math.PI / 2 * pose.fallen);
  ctx.rotate(pose.lean || 0);
  const hip = [0, -0.5];
  for (const [a, k] of [[16 * w, Math.max(0, -22 * w)], [-16 * w, Math.max(0, 22 * w)]]) {
    const kx = hip[0] + Math.sin(rad(a)) * 0.25, ky = hip[1] + Math.cos(rad(a)) * 0.25, fx = kx + Math.sin(rad(a - k)) * 0.25, fy = ky + Math.cos(rad(a - k)) * 0.25;
    ctx.strokeStyle = INK; ctx.lineWidth = 0.075; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(fx + 0.035, fy - 0.006, 0.05, 0.018, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  }
  // gövde: gömlek + yelek (taralı)
  const torso = () => poly(ctx, [[-0.08, -0.8], [0.08, -0.8], [0.072, -0.5], [-0.072, -0.5]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  const vest = () => poly(ctx, [[-0.08, -0.78], [-0.01, -0.78], [0.0, -0.52], [-0.072, -0.52]]);
  vest(); hatchClip(ctx, vest, 0.016, 75, lw * 0.9); vest(); ctx.stroke();
  // kollar
  const sh = [0.004, -0.78];
  let A;
  if (pose.arms === 'tamp') { const s = Math.sin(ph * Math.PI * 2 / 0.8); A = [[150 - 25 * s, -10], [140 - 25 * s, -5]]; }
  else if (pose.arms === 'talk') A = [[50 + 12 * Math.sin(ph * 5), 50], [-10, 8]];
  else A = [[10 + w * 16, 8], [-10 - w * 16, 8]];
  const hands = [];
  A.forEach(([a, e]) => { const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.038, lw); limb(ctx, ex, ey, hx, hy, 0.034, lw); hands.push([hx, hy]); });
  // sıkıştırma demiri iki elde, dikey (deliğe iner)
  if (pose.arms === 'tamp') { const [hx, hy] = hands[0]; ctx.save(); ctx.translate(hx + 0.02, hy); ctx.fillStyle = INK; ctx.fillRect(-0.012, -0.06, 0.024, 0.9); ctx.restore(); }
  // baş ve şapka
  const hy = -0.885;
  ctx.beginPath(); ctx.arc(0.01, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.005, hy - 0.05, 0.11, 0.018, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.roundRect(-0.055, hy - 0.12, 0.11, 0.07, 0.02); ctx.fill();
  if (pose.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(0.034, hy - 0.002); ctx.lineTo(0.058, hy - 0.002); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0.045, hy - 0.002, 0.008, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  // bıyık
  ctx.beginPath(); ctx.moveTo(0.035, hy + 0.025); ctx.quadraticCurveTo(0.05, hy + 0.035, 0.068, hy + 0.024); ctx.lineWidth = lw * 1.4; ctx.stroke();
  ctx.restore();
}

// ——— sıkıştırma demiri: 1,1 m, ucu sivri (birim = boy, yatay, sivri uç sağda) ———
export function drawRod(ctx, size, lw = 3) {
  ctx.save(); ctx.scale(size, size);
  ctx.beginPath(); ctx.moveTo(-0.5, -0.0145); ctx.lineTo(0.38, -0.0145); ctx.lineTo(0.5, 0); ctx.lineTo(0.38, 0.0145); ctx.lineTo(-0.5, 0.0145); ctx.closePath();
  ctx.fillStyle = INK; ctx.fill(); ctx.lineWidth = lw / size; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// ——— kafatası kesiti (soldan görünüş, yüz sağda); birim = yükseklik; kök kafatası merkezi ———
// rod: 0..1 çubuğun geçiş ilerlemesi; diyagram: kan yok, yol kesik çizgi + çubuk mürekkep
export function drawSkull(ctx, size, rod = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2.2 / size;
  // kafatası dış çizgisi + çene
  const skull = () => { ctx.beginPath(); ctx.ellipse(-0.04, -0.12, 0.36, 0.3, 0, Math.PI * 0.95, Math.PI * 2.32); ctx.lineTo(0.3, 0.12); ctx.lineTo(0.26, 0.2); ctx.lineTo(0.18, 0.3); ctx.lineTo(0.02, 0.32); ctx.lineTo(-0.06, 0.16); ctx.lineTo(-0.3, 0.08); ctx.closePath(); };
  skull(); ctx.fillStyle = PAPER; ctx.fill();
  hatchClip(ctx, skull, 0.03, 60, lw * 0.4, GRAPH);
  // beyin bölgesi (açık), göz çukuru, elmacık
  ctx.beginPath(); ctx.ellipse(-0.06, -0.16, 0.29, 0.21, 0, 0, Math.PI * 2); ctx.fillStyle = '#EFE7D6'; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = GRAPH; ctx.stroke();
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-0.2 + i * 0.09, -0.2 + (i % 2) * 0.05, 0.06, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0.22, -0.02, 0.06, 0.05, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  skull(); ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK; ctx.stroke();
  // çubuğun yolu: sol yanak (alt ön) → göz arkası → tepe (ön)
  const A = [0.16, 0.24], B = [0.04, -0.46];
  ctx.setLineDash([0.025, 0.018]); ctx.beginPath(); ctx.moveTo(A[0] + (A[0] - B[0]) * 0.25, A[1] + (A[1] - B[1]) * 0.25); ctx.lineTo(B[0] - (A[0] - B[0]) * 0.25, B[1] - (A[1] - B[1]) * 0.25); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke(); ctx.setLineDash([]);
  if (rod > 0) {
    // çubuk aşağıdan girer, yukarıdan çıkar (uç önde)
    const ang = Math.atan2(B[1] - A[1], B[0] - A[0]), len = 0.95, d = lerp(-0.95, 1.1, rod);
    const tip = [A[0] + Math.cos(ang) * d, A[1] + Math.sin(ang) * d];
    ctx.save(); ctx.translate(tip[0] - Math.cos(ang) * len / 2, tip[1] - Math.sin(ang) * len / 2); ctx.rotate(ang); ctx.scale(1 / size, 1 / size); drawRod(ctx, len * size, 2); ctx.restore();
  }
  ctx.restore();
}

// ——— dalgıç (Packard): yatay yüzer; tüp, maske, palet; birim = boy; kök gövde ortası, baş sağda ———
export function drawDiver(ctx, size, ph = 0) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; const lw = 1.6 / size;
  const k = Math.sin(ph * 4);
  // bacaklar ve paletler
  for (const s of [1, -1]) { const a = 0.18 * k * s; ctx.save(); ctx.translate(-0.2, 0.02 * s); ctx.rotate(a); limb(ctx, 0, 0, -0.26, 0.02, 0.07, lw, INK); ctx.beginPath(); ctx.moveTo(-0.26, 0.0); ctx.lineTo(-0.42, -0.06); ctx.lineTo(-0.42, 0.08); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
  // gövde (dalış elbisesi koyu), tüp
  ctx.beginPath(); ctx.roundRect(-0.22, -0.07, 0.4, 0.14, 0.06); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.roundRect(-0.16, -0.16, 0.3, 0.08, 0.04); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // kollar öne
  limb(ctx, 0.12, 0.0, 0.3, 0.06 + 0.03 * k, 0.05, lw, INK);
  // baş, maske, regülatör hortumu
  ctx.beginPath(); ctx.arc(0.26, -0.03, 0.07, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.roundRect(0.27, -0.07, 0.07, 0.05, 0.015); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.1, -0.13); ctx.quadraticCurveTo(0.3, -0.18, 0.31, 0.0); ctx.lineWidth = lw * 1.2; ctx.stroke();
  ctx.restore();
}

// ——— kambur balina (yandan): uzun yüzgeç, boğaz kıvrımları, başta yumrular; open: 0..1 alt çene açılır ———
export function drawWhale(ctx, size, open = 0, ph = 0) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; const lw = 2.2 / size;
  const jaw = rad(28) * open;
  // kuyruk
  const tail = Math.sin(ph * 1.6) * 0.04;
  ctx.beginPath(); ctx.moveTo(-0.44, -0.01); ctx.lineTo(-0.58, -0.09 + tail); ctx.quadraticCurveTo(-0.55, -0.01, -0.58, 0.07 + tail); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  // üst gövde (sırt koyu)
  const upper = () => { ctx.beginPath(); ctx.moveTo(-0.45, 0.0); ctx.quadraticCurveTo(-0.2, -0.14, 0.1, -0.12); ctx.quadraticCurveTo(0.36, -0.1, 0.5, -0.02); ctx.lineTo(0.5, 0.0); ctx.lineTo(-0.45, 0.02); ctx.closePath(); };
  upper(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, upper, 0.012, 0, lw * 0.6); upper(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // sırt yüzgeci (küçük)
  ctx.beginPath(); ctx.moveTo(-0.18, -0.12); ctx.lineTo(-0.15, -0.16); ctx.lineTo(-0.1, -0.125); ctx.fillStyle = INK; ctx.fill();
  // boğaz (kıvrımlı) menteşenin arkasında kalır, ağız açılınca şişer; alt çene menteşeden (göz altı) aşağı döner
  const H = [0.08, 0.0], bulge = 0.1 + 0.12 * open;
  const throat = () => { ctx.beginPath(); ctx.moveTo(-0.46, 0.02); ctx.lineTo(H[0], 0.0); ctx.quadraticCurveTo(H[0] - 0.02, bulge, -0.12, bulge + 0.01); ctx.quadraticCurveTo(-0.32, bulge * 0.8, -0.46, 0.03); ctx.closePath(); };
  throat(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); throat(); ctx.clip(); ctx.lineWidth = lw * 0.6; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(H[0], 0.012 + i * 0.016 * (1 + open)); ctx.quadraticCurveTo(-0.15, 0.03 + i * 0.02 * (1 + open), -0.42, 0.025 + i * 0.004); ctx.stroke(); } ctx.restore();
  const tipL = 0.42, jx = H[0] + Math.cos(jaw) * tipL, jy = H[1] + Math.sin(jaw) * tipL;
  // ağız içi karanlık: üst çene çizgisi ile dönen alt çene arası
  if (open > 0) { ctx.beginPath(); ctx.moveTo(H[0], 0.0); ctx.lineTo(0.5, -0.01); ctx.lineTo(jx, jy); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); }
  ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate(jaw);
  const lower = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(tipL, 0); ctx.quadraticCurveTo(tipL - 0.04, 0.07, 0.1, 0.09); ctx.quadraticCurveTo(0.02, 0.08, 0, 0.06); ctx.closePath(); };
  lower(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); lower(); ctx.clip(); ctx.lineWidth = lw * 0.6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(tipL - 0.04, 0.015 + i * 0.016); ctx.quadraticCurveTo(0.2, 0.03 + i * 0.016, 0.0, 0.02 + i * 0.012); ctx.stroke(); } ctx.restore();
  ctx.restore();
  // uzun göğüs yüzgeci
  ctx.beginPath(); ctx.moveTo(0.14, 0.02); ctx.quadraticCurveTo(0.02, 0.2 + 0.03 * Math.sin(ph), -0.12, 0.26); ctx.quadraticCurveTo(0.04, 0.18, 0.2, 0.04); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  // baştaki yumrular ve göz
  ctx.fillStyle = INK; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(0.3 + i * 0.03, -0.085 + i * 0.012, 0.007, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0.22, -0.03, 0.01, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ——— terazi: kiriş eğimi (rad, + sağ kefe aşağı); birim = kiriş boyu; kök direğin tabanı ———
export function drawScale(ctx, size, tilt = 0, left = null, right = null) {
  ctx.save(); ctx.scale(size, size); const lw = 2.4 / size;
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw * 1.4;
  ctx.beginPath(); ctx.moveTo(-0.16, 0); ctx.lineTo(0.16, 0); ctx.moveTo(0, 0); ctx.lineTo(0, -0.62); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.62, 0.02, 0, Math.PI * 2); ctx.fill();
  const ex = Math.cos(tilt) * 0.5, ey = Math.sin(tilt) * 0.5;
  ctx.beginPath(); ctx.moveTo(-ex, -0.62 - ey); ctx.lineTo(ex, -0.62 + ey); ctx.lineWidth = lw * 1.8; ctx.stroke();
  for (const [s, draw] of [[-1, left], [1, right]]) {
    const px = s * ex, py = -0.62 + s * ey;
    ctx.lineWidth = lw * 0.7; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 0.14, py + 0.26); ctx.moveTo(px, py); ctx.lineTo(px + 0.14, py + 0.26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 0.18, py + 0.26); ctx.quadraticCurveTo(px, py + 0.34, px + 0.18, py + 0.26); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
    if (draw) { ctx.save(); ctx.translate(px, py + 0.26); ctx.scale(1 / size, 1 / size); draw(); ctx.restore(); }
  }
  ctx.restore();
}

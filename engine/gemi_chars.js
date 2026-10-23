// "Gemi" karakterleri ve nesneleri: Olympic sınıfı yolcu gemisi (Olympic, Titanik, hastane gemisi Britannic), kruvazör
// HMS Hawke, buzdağı, filika, mayın, pervane, buharlı tren; hostes/hemşire Violet ve gemi tasarımcısı Yamaguchi.
// Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yok.
// Birim: gemide boy = 1 (size px), kök su çizgisinin ortası, pruva sağda. Kişilerde boy = 1, kök ayak tabanı.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const lerp = (a, b, u) => a + (b - a) * u;

function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -1.2; d < 1.2; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 1.2, -dx * d - dy * 1.2); ctx.lineTo(dy * d + dx * 1.2, -dx * d + dy * 1.2); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };

// ——— Olympic sınıfı yolcu gemisi ———
export const LINER_CARD = Object.freeze({ name: 'Olympic sınıfı (269 m, 4 baca, 2 direk)', funnels: [-0.23, -0.1, 0.03, 0.16], stroke: 0.006 });
// pose: { livery: 'star' | 'hospital', tilt: rad (+ pruva aşağı), sink: 0..1, smoke: faz (sn), water: true → su altı kırpılır, dent: 0..1 }
export function drawLiner(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.3 / size), hosp = pose.livery === 'hospital';
  if (pose.water !== false) { ctx.beginPath(); ctx.rect(-2, -2, 4, 2); ctx.clip(); }
  ctx.translate(0, (pose.sink || 0) * 0.32); ctx.rotate(pose.tilt || 0);
  // duman: bacalardan geriye savrulan halkalar (sürekli döngü)
  if (pose.smoke != null) {
    ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.9;
    card.funnels.forEach((fx, i) => { for (let k = 0; k < 3; k++) { const ph = ((pose.smoke * 0.6 + k / 3 + i * 0.17) % 1); ctx.beginPath(); ctx.arc(fx - 0.02 - ph * 0.12, -0.2 - ph * 0.05, 0.012 + ph * 0.02, 0, Math.PI * 2); ctx.globalAlpha = 1 - ph; ctx.stroke(); } });
    ctx.globalAlpha = 1;
  }
  // direkler ve teller
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(0.37, -0.08); ctx.lineTo(0.355, -0.25); ctx.moveTo(-0.36, -0.08); ctx.lineTo(-0.375, -0.24); ctx.stroke();
  ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.6; ctx.beginPath(); ctx.moveTo(0.355, -0.25); ctx.lineTo(-0.375, -0.24); ctx.moveTo(0.355, -0.25); ctx.lineTo(0.49, -0.085); ctx.moveTo(-0.375, -0.24); ctx.lineTo(-0.49, -0.07); ctx.stroke();
  // bacalar (geriye yatık), üstleri mürekkep
  for (const fx of card.funnels) {
    const P = [[fx - 0.018, -0.098], [fx + 0.018, -0.098], [fx + 0.004, -0.19], [fx - 0.03, -0.19]];
    poly(ctx, P); ctx.fillStyle = PAPER; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
    poly(ctx, [[fx + 0.0065, -0.168], [fx + 0.004, -0.19], [fx - 0.03, -0.19], [fx - 0.0265, -0.168]]); ctx.fillStyle = hosp ? PAPER : INK; ctx.fill(); ctx.stroke();
  }
  // üst yapı: kayık güvertesi, köprü
  poly(ctx, [[-0.34, -0.078], [0.3, -0.078], [0.3, -0.1], [-0.34, -0.1]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
  poly(ctx, [[0.24, -0.1], [0.31, -0.1], [0.31, -0.11], [0.24, -0.11]]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; for (let x = -0.32; x < 0.28; x += 0.018) ctx.fillRect(x, -0.092, 0.007, 0.006);
  // filikalar (kayık güvertesinde)
  ctx.fillStyle = PAPER; ctx.lineWidth = lw * 0.7; for (const x of [-0.3, -0.26, -0.18, -0.14, 0.12, 0.2, 0.24]) { ctx.beginPath(); ctx.ellipse(x, -0.104, 0.014, 0.005, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  // gövde (su üstü + su altı); kıç yuvarlak, pruva dik
  const hull = () => poly(ctx, [[-0.5, -0.05], [-0.485, -0.076], [0.46, -0.08], [0.5, -0.084], [0.49, 0], [0.47, 0.045], [-0.44, 0.045], [-0.5, 0.005]]);
  hull(); ctx.fillStyle = PAPER; ctx.fill();
  if (!hosp) {
    // White Star: siyah gövde = sık tarama; üstte beyaz kuşak
    hatchClip(ctx, () => poly(ctx, [[-0.5, -0.05], [-0.49, -0.064], [0.47, -0.068], [0.497, -0.07], [0.49, 0], [0.47, 0.045], [-0.44, 0.045], [-0.5, 0.005]]), 0.006, 0, lw * 1.1);
  } else {
    // hastane gemisi: beyaz gövde, boyunca kuşak, gövdede haç (kontur)
    ctx.fillStyle = INK; poly(ctx, [[-0.495, -0.034], [0.494, -0.04], [0.493, -0.032], [-0.497, -0.026]]); ctx.fill();
    ctx.lineWidth = lw * 1.2; ctx.strokeStyle = INK;
    for (const cx of [-0.22, 0.14]) { const s = 0.016; ctx.beginPath(); ctx.rect(cx - s * 0.35, -0.072, s * 0.7, s * 2); ctx.rect(cx - s, -0.072 + s * 0.65, s * 2, s * 0.7); ctx.stroke(); }
  }
  // lombar sırası
  ctx.fillStyle = hosp ? INK : PAPER; for (let x = -0.44; x < 0.44; x += 0.02) ctx.fillRect(x, -0.058, 0.006, 0.005);
  hull(); ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.3; ctx.stroke();
  // çarpma izi (Hawke): kıç sancakta yarık
  if (pose.dent > 0) { ctx.save(); ctx.translate(-0.33, -0.03); ctx.scale(pose.dent, pose.dent); poly(ctx, [[-0.025, -0.03], [0.025, -0.03], [0.008, 0.03], [-0.006, 0.03]]); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
  ctx.restore();
}

// ——— kruvazör HMS Hawke: alçak gri gövde, mahmuz pruva, 2 baca ———
export const CRUISER_CARD = Object.freeze({ name: 'HMS Hawke (Edgar sınıfı kruvazör, 115 m)', stroke: 0.008 });
export function drawCruiser(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.3 / size);
  if (pose.water !== false) { ctx.beginPath(); ctx.rect(-2, -2, 4, 2); ctx.clip(); }
  ctx.rotate(pose.tilt || 0);
  ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(0.2, -0.07); ctx.lineTo(0.2, -0.3); ctx.moveTo(-0.22, -0.07); ctx.lineTo(-0.22, -0.26); ctx.stroke();
  for (const fx of [-0.06, 0.06]) { poly(ctx, [[fx - 0.03, -0.1], [fx + 0.03, -0.1], [fx + 0.02, -0.2], [fx - 0.04, -0.2]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); }
  poly(ctx, [[-0.16, -0.07], [0.18, -0.07], [0.18, -0.1], [-0.16, -0.1]]); ctx.fill(); ctx.stroke();
  const hull = () => poly(ctx, [[-0.5, -0.05], [-0.48, -0.075], [0.44, -0.075], [0.47, -0.04], [0.52, 0.03], [0.44, 0.05], [-0.44, 0.05], [-0.5, 0.0]]);
  hull(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, hull, 0.012, 0, lw * 0.9, GRAPH);
  hull(); ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// ——— buzdağı (su üstü kısmı), birim = genişlik ———
export function drawIceberg(ctx, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round';
  const P = [[-0.5, 0], [-0.36, -0.3], [-0.22, -0.36], [-0.12, -0.62], [0.02, -0.5], [0.14, -0.7], [0.26, -0.4], [0.4, -0.3], [0.5, 0]];
  poly(ctx, P); ctx.fillStyle = PAPER; ctx.fill();
  hatchClip(ctx, () => poly(ctx, [[0.02, -0.5], [0.14, -0.7], [0.26, -0.4], [0.4, -0.3], [0.5, 0], [0.06, 0]]), 0.035, 70, 1.4 / size, GRAPH);
  poly(ctx, P); ctx.lineWidth = 2.4 / size; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// ——— filika: kürekçiler; numara pruvada; birim = boy ———
// pose: { oar: faz (sn), n: numara, seated: kişi sayısı, empty: bool }
export function drawLifeboat(ctx, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = 1.6 / size, ph = Math.sin((pose.oar || 0) * Math.PI * 2 / 1.2);
  if (!pose.empty) for (let i = 0; i < (pose.seated ?? 4); i++) {
    const x = -0.3 + i * 0.2;
    ctx.beginPath(); ctx.roundRect(x - 0.035, -0.2, 0.07, 0.12, 0.02); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, -0.24, 0.035, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (i % 2 === 0) { ctx.beginPath(); ctx.moveTo(x, -0.15); ctx.lineTo(x - 0.16 + ph * 0.08, 0.12); ctx.lineWidth = lw * 1.3; ctx.stroke(); }
  }
  const hull = () => { ctx.beginPath(); ctx.moveTo(-0.5, -0.1); ctx.quadraticCurveTo(-0.45, 0.06, -0.3, 0.07); ctx.lineTo(0.32, 0.07); ctx.quadraticCurveTo(0.47, 0.05, 0.5, -0.12); ctx.closePath(); };
  hull(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.47, -0.05); ctx.lineTo(0.47, -0.06); ctx.lineWidth = lw * 0.7; ctx.stroke();
  if (pose.n) { ctx.fillStyle = INK; ctx.font = `600 ${0.1}px Archivo`; ctx.textAlign = 'center'; ctx.fillText(String(pose.n), 0.33, 0.03); }
  ctx.restore();
}

// ——— mayın: boynuzlu küre; birim = çap ———
export function drawMine(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.8 / size;
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.4, Math.sin(a) * 0.4); ctx.lineTo(Math.cos(a) * 0.62, Math.sin(a) * 0.62); ctx.lineWidth = lw * 2; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 0.45, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.arc(0.08, 0.08, 0.42, 0, Math.PI * 2); }, 0.07, 45, lw * 0.6, GRAPH);
  ctx.beginPath(); ctx.moveTo(0, 0.45); ctx.lineTo(0, 1.4); ctx.setLineDash([0.06, 0.05]); ctx.lineWidth = lw * 0.8; ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}

// ——— pervane: 3 kanat, a açısıyla döner; birim = çap ———
export function drawPropeller(ctx, a, size) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(a); const lw = 2 / size;
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(0.12, -0.08, 0.44, -0.16, 0.48, 0.02); ctx.bezierCurveTo(0.4, 0.12, 0.14, 0.1, 0, 0); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); hatchClip(ctx, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(0.12, -0.08, 0.44, -0.16, 0.48, 0.02); ctx.bezierCurveTo(0.4, 0.12, 0.14, 0.1, 0, 0); }, 0.05, 20, lw * 0.5, GRAPH); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, 0.08, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// ——— buharlı tren: lokomotif + 2 vagon, sağa gider; birim = toplam boy; kök raylar ———
export function drawTrain(ctx, ph, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; const lw = 1.5 / size;
  ctx.strokeStyle = INK; ctx.lineWidth = lw;
  const wheel = (x, r) => { ctx.beginPath(); ctx.arc(x, -r, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); const a = ph * 9; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, -r + Math.sin(a) * r); ctx.lineTo(x - Math.cos(a) * r, -r - Math.sin(a) * r); ctx.stroke(); };
  // vagonlar
  for (const x0 of [-0.5, -0.17]) { ctx.beginPath(); ctx.roundRect(x0, -0.13, 0.3, 0.1, 0.01); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; for (let k = 0; k < 4; k++) ctx.fillRect(x0 + 0.03 + k * 0.065, -0.115, 0.04, 0.035); wheel(x0 + 0.05, 0.022); wheel(x0 + 0.25, 0.022); }
  // lokomotif
  ctx.beginPath(); ctx.rect(0.17, -0.1, 0.22, 0.07); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.rect(0.17, -0.1, 0.22, 0.07); }, 0.012, 0, lw * 0.7);
  ctx.beginPath(); ctx.rect(0.15, -0.16, 0.08, 0.13); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(0.33, -0.15, 0.025, 0.05); ctx.fill(); ctx.stroke();
  wheel(0.22, 0.03); wheel(0.3, 0.03); wheel(0.37, 0.02);
  // buhar
  ctx.strokeStyle = GRAPH; for (let k = 0; k < 3; k++) { const u = (ph * 1.4 + k / 3) % 1; ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.arc(0.34 - u * 0.2, -0.17 - u * 0.06, 0.015 + u * 0.03, 0, Math.PI * 2); ctx.stroke(); }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ——— kişi iskeleti: eklem açılarıyla (derece), boy = 1, kök ayak tabanı, sağa bakar ———
const rad = d => (d * Math.PI) / 180;
function limb(ctx, x0, y0, x1, y1, w, lw) { ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.strokeStyle = PAPER; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
function legs(ctx, hip, ang, lw, thigh = 0.25, shin = 0.25) {
  const pts = [];
  for (const [a, k] of ang) { const kx = hip[0] + Math.sin(rad(a)) * thigh, ky = hip[1] + Math.cos(rad(a)) * thigh, fx = kx + Math.sin(rad(a - k)) * shin, fy = ky + Math.cos(rad(a - k)) * shin; pts.push([kx, ky, fx, fy]); }
  return pts;
}
// pose: { walk: faz (sn, yoksa durur), arms: 'down' | 'shield' | 'gesture' | 'up' | 'boat', lean: rad }
export const VIOLET_CARD = Object.freeze({ name: 'Violet Jessop (hostes/hemşire: koyu uzun elbise, beyaz önlük, başlık)', stroke: 0.012 });
export function drawViolet(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.rotate(pose.lean || 0);
  const lw = Math.max(card.stroke, 1.4 / size), w = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2 / 0.9) : 0;
  // ayaklar (etek altından)
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0.03 + w * 0.05, -0.01, 0.04, 0.014, 0, 0, Math.PI * 2); ctx.ellipse(-0.03 - w * 0.05, -0.01, 0.04, 0.014, 0, 0, Math.PI * 2); ctx.fill();
  // uzun koyu etek (tarama) ve önlük
  const skirt = () => poly(ctx, [[-0.07, -0.55], [0.07, -0.55], [0.13 + w * 0.02, -0.03], [-0.13 + w * 0.02, -0.03]]);
  skirt(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, skirt, 0.018, 80, lw * 0.8); skirt(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  poly(ctx, [[-0.04, -0.52], [0.06, -0.52], [0.08, -0.12], [-0.05, -0.12]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  // gövde
  poly(ctx, [[-0.065, -0.78], [0.065, -0.78], [0.07, -0.54], [-0.07, -0.54]]); ctx.fill(); hatchClip(ctx, () => poly(ctx, [[-0.065, -0.78], [0.065, -0.78], [0.07, -0.54], [-0.07, -0.54]]), 0.018, 80, lw * 0.8); poly(ctx, [[-0.065, -0.78], [0.065, -0.78], [0.07, -0.54], [-0.07, -0.54]]); ctx.stroke();
  // kollar
  const arms = pose.arms || 'down', sh = [0, -0.76];
  const A = arms === 'up' ? [[-150, 20], [150, -20]] : arms === 'boat' ? [[40, 50], [60, 40]] : [[12 + w * 18, 8], [-12 - w * 18, 8]];
  for (const [a, e] of A) { const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.036, lw); limb(ctx, ex, ey, hx, hy, 0.032, lw); }
  // baş: topuz saç, başlık
  ctx.beginPath(); ctx.arc(0.01, -0.86, 0.058, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(-0.035, -0.88, 0.042, Math.PI * 0.5, Math.PI * 1.6); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(-0.07, -0.85, 0.025, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-0.05, -0.915); ctx.lineTo(0.05, -0.925); ctx.lineTo(0.04, -0.9); ctx.lineTo(-0.04, -0.895); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.04, -0.865, 0.008, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  if (pose.bandage) { ctx.beginPath(); ctx.ellipse(0.0, -0.885, 0.065, 0.02, -0.1, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  ctx.restore();
}

export const YAMA_CARD = Object.freeze({ name: 'Tsutomu Yamaguchi (29 yaşında; beyaz gömlek, koyu pantolon, kısa saç; yaralıyken sargılı)', stroke: 0.012 });
// pose: { walk, arms: 'down' | 'shield' | 'gesture' | 'case', bandage: 0..1, sit: bool }
export function drawYamaguchi(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.rotate(pose.lean || 0);
  const lw = Math.max(card.stroke, 1.4 / size), w = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2 / 0.9) : 0;
  const hip = [0, -0.5];
  const L = pose.sit ? [[80, 80], [70, 70]] : [[18 * w, Math.max(0, -22 * w)], [-18 * w, Math.max(0, 22 * w)]];
  for (const [kx, ky, fx, fy] of legs(ctx, hip, L, lw)) {
    // koyu pantolon: kontur + tarama yerine kalın mürekkep
    ctx.strokeStyle = INK; ctx.lineWidth = 0.075; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(fx + 0.03, fy - 0.005, 0.045, 0.016, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  }
  // gövde: beyaz gömlek
  const torso = () => poly(ctx, [[-0.075, -0.8], [0.075, -0.8], [0.07, -0.5], [-0.07, -0.5]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.07, -0.52); ctx.lineTo(0.07, -0.52); ctx.lineWidth = lw * 2.2; ctx.stroke();
  // kollar
  const arms = pose.arms || 'down', sh = [0.005, -0.78];
  const A = arms === 'shield' ? [[160, -100], [150, -90]] : arms === 'gesture' ? [[60, 50], [20, 10]] : arms === 'case' ? [[8 + w * 16, 6], [-10 - w * 16, 8]] : [[10 + w * 16, 8], [-10 - w * 16, 8]];
  A.forEach(([a, e], i) => { const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.038, lw); limb(ctx, ex, ey, hx, hy, 0.034, lw);
    if (pose.bandage > 0 && i === 1) { ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.6; for (let k = 0.2; k < 0.9; k += 0.2) { const x = lerp(ex, hx, k), y = lerp(ey, hy, k); ctx.beginPath(); ctx.moveTo(x - 0.025, y - 0.01); ctx.lineTo(x + 0.025, y + 0.01); ctx.stroke(); } }
    if (arms === 'case' && i === 0) { ctx.beginPath(); ctx.rect(hx - 0.05, hy, 0.1, 0.07); ctx.fillStyle = INK; ctx.fill(); } });
  // baş: kısa koyu saç; yanık/sargı (sol yan)
  ctx.beginPath(); ctx.arc(0.01, -0.88, 0.06, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.0, -0.9, 0.06, Math.PI * 1.02, Math.PI * 1.98); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0.045, -0.88, 0.008, 0, Math.PI * 2); ctx.fill();
  if (pose.bandage > 0) {
    ctx.globalAlpha = pose.bandage; ctx.beginPath(); ctx.ellipse(-0.005, -0.885, 0.068, 0.026, -0.12, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 0.8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.06, -0.9); ctx.lineTo(0.06, -0.875); ctx.lineWidth = lw * 0.5; ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

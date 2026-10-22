// "Okyanus" karakterleri ve nesneleri: balıkçı teknesi (Alvarenga), römorkör (Jascon-4), hava cebindeki aşçı (Okene),
// dalgıç ve birbirini tutan iki el. Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama).
// Birim: boy = 1 (size px). Kök: teknede su çizgisinin ortası; başta boyun tabanı; dalgıçta gövde merkezi.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -2; d < 2; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 2, -dx * d - dy * 2); ctx.lineTo(dy * d + dx * 2, -dx * d + dy * 2); ctx.stroke(); }
  ctx.restore();
}
// oturan kişi (teknede): baş, şapka, sakal, omuz; birim = kişi boyu
function seated(ctx, x, lw, cap = true) {
  ctx.save(); ctx.translate(x, 0);
  ctx.beginPath(); ctx.roundRect(-0.05, -0.2, 0.1, 0.2, 0.03); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.25, 0.045, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.005, -0.235, 0.04, 0.1 * Math.PI, 0.9 * Math.PI); ctx.fillStyle = INK; ctx.fill(); // sakal
  if (cap) { ctx.beginPath(); ctx.moveTo(-0.05, -0.27); ctx.quadraticCurveTo(0, -0.33, 0.05, -0.27); ctx.lineTo(0.08, -0.265); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore();
}

export const BOAT_CARD = Object.freeze({ name: 'açık balıkçı teknesi (panga), 7,6 m', len: 1, hull: 0.17, stroke: 0.012 });
// pose: { roll: rad, crew: 2 | 1 }
export function drawBoat(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(pose.roll || 0); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), h = card.hull;
  // kişiler önce (tekne bordası önlerini örter)
  seated(ctx, -0.12, lw); if ((pose.crew ?? 2) > 1) seated(ctx, 0.14, lw);
  // ölü motor kıçta
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.rect(-0.53, -0.16, 0.07, 0.1); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.5, -0.06); ctx.lineTo(-0.5, 0.12); ctx.stroke();
  // gövde: yukarı kalkık pruva
  const hull = () => { ctx.beginPath(); ctx.moveTo(-0.48, -0.04); ctx.lineTo(0.38, -0.04); ctx.quadraticCurveTo(0.5, -0.06, 0.55, -0.12); ctx.quadraticCurveTo(0.46, h * 0.7, 0.25, h * 0.85); ctx.lineTo(-0.44, h * 0.8); ctx.closePath(); };
  hull(); ctx.fillStyle = PAPER; ctx.fill();
  hatchClip(ctx, hull, 0.02, 0, lw * 0.5);
  hull(); ctx.lineWidth = lw * 1.3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.46, 0.02); ctx.lineTo(0.45, 0.02); ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}

export const TUG_CARD = Object.freeze({ name: 'römorkör (Jascon-4 tipi açık deniz römorkörü)', stroke: 0.01 });
// Kök: su çizgisi ortası (dik hâlde); ters dönükken aynı fonksiyon 180° döndürülür
export function drawTug(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(pose.roll || 0); ctx.lineJoin = 'round';
  const lw = Math.max(card.stroke, 1.4 / size);
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  // üst yapı: köprü, pencereler, direk, baca
  ctx.beginPath(); ctx.rect(-0.08, -0.26, 0.26, 0.16); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(-0.02, -0.36, 0.16, 0.1); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = INK; ctx.fillRect(0.0 + i * 0.033, -0.34, 0.02, 0.04); }
  ctx.beginPath(); ctx.rect(-0.2, -0.2, 0.07, 0.1); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  if (pose.mast !== false) { ctx.beginPath(); ctx.moveTo(0.06, -0.36); ctx.lineTo(0.06, -0.48); ctx.stroke(); }
  // gövde: geniş, alçak kıç (çekme güvertesi)
  const hull = () => { ctx.beginPath(); ctx.moveTo(-0.5, -0.1); ctx.lineTo(0.42, -0.1); ctx.quadraticCurveTo(0.52, -0.12, 0.54, -0.18); ctx.quadraticCurveTo(0.5, 0.1, 0.36, 0.14); ctx.lineTo(-0.46, 0.14); ctx.quadraticCurveTo(-0.52, 0.06, -0.5, -0.1); ctx.closePath(); };
  hull(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, hull, 0.018, 0, lw * 0.5); hull(); ctx.lineWidth = lw * 1.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.5, -0.03); ctx.lineTo(0.5, -0.03); ctx.lineWidth = lw; ctx.stroke();
  for (const x of [-0.38, -0.24]) { ctx.beginPath(); ctx.arc(x, -0.12, 0.025, 0, Math.PI * 2); ctx.stroke(); } // bağlama babaları
  ctx.restore();
}

export const OKENE_CARD = Object.freeze({ name: 'aşçı (hava cebinde, baş ve omuzlar su üstünde)', head: 0.3, stroke: 0.03 });
// Kök: su çizgisi (boyun tabanı). pose: { look: -1..1, breathe: 0..1 }
export function drawOkene(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), r = card.head / 2, b = (pose.breathe || 0) * 0.012;
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  // omuzlar suyun hemen altında (su çizgisinde kesilir)
  ctx.beginPath(); ctx.ellipse(0, 0.05, 0.42, 0.12, 0, Math.PI, 0); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(-0.06, -0.12, 0.12, 0.13); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.12 - r - b, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  // kısa saç: başın üst yarısı mürekkep
  ctx.beginPath(); ctx.arc(0, -0.12 - r - b, r, Math.PI * 1.08, Math.PI * 1.92); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  // yüz: göz (yukarı, ışığa bakar), ağız
  const lx = (pose.look || 0) * 0.03;
  ctx.fillStyle = INK; for (const x of [-0.05, 0.05]) { ctx.beginPath(); ctx.arc(x + lx, -0.12 - r - 0.01 - b, 0.017, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-0.035 + lx, -0.12 - r * 0.45 - b); ctx.lineTo(0.035 + lx, -0.12 - r * 0.45 - b); ctx.lineWidth = lw * 0.8; ctx.stroke();
  ctx.restore();
}

export const DIVER_CARD = Object.freeze({ name: 'dalgıç (tüp, maske, kafa lambası, palet)', stroke: 0.012 });
// Kök: gövde merkezi, yön +x (başı sağda). pose: { phase } palet vuruşu
export function drawDiver(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), k = Math.sin((pose.phase || 0) * Math.PI * 2) * 0.05;
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  // bacaklar ve paletler (makas vuruşu)
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-0.15, 0.01); ctx.lineTo(-0.38, s * k + 0.01); ctx.lineWidth = 0.05; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-0.37, s * k); ctx.lineTo(-0.52, s * k * 1.8 - 0.02); ctx.lineTo(-0.5, s * k * 1.8 + 0.04); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); }
  ctx.lineWidth = lw;
  // tüp
  ctx.beginPath(); ctx.roundRect(-0.16, -0.1, 0.24, 0.06, 0.03); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  // gövde (koyu tulum)
  ctx.beginPath(); ctx.ellipse(0, 0, 0.18, 0.05, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  // kol öne uzanmış
  ctx.beginPath(); ctx.moveTo(0.08, 0.02); ctx.lineTo(0.2, 0.08); ctx.lineWidth = 0.035; ctx.strokeStyle = INK; ctx.stroke();
  // baş, maske, lamba
  ctx.beginPath(); ctx.arc(0.22, -0.01, 0.045, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.roundRect(0.235, -0.03, 0.035, 0.025, 0.006); ctx.fillStyle = PAPER; ctx.fill();
  ctx.beginPath(); ctx.arc(0.245, -0.055, 0.014, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// iki el: soldan dalgıcın eldivenli eli (koyu), sağdan Okene'nin eli (kâğıt). u: 0 uzak, 1 kenetlenmiş
export function drawHands(ctx, u, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = 1.6 / size + 0.008, gap = 0.34 * (1 - u);
  const arm = (dir, dark) => {
    ctx.save(); ctx.scale(dir, 1); ctx.translate(-0.02 - gap, 0);
    ctx.beginPath(); ctx.moveTo(-0.7, 0.09); ctx.lineTo(-0.16, 0.05); ctx.lineTo(-0.16, -0.06); ctx.lineTo(-0.7, -0.08); ctx.closePath();
    ctx.fillStyle = dark ? INK : PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    // avuç ve parmaklar: dört yuvarlak uç, başparmak yukarı
    ctx.beginPath(); ctx.ellipse(-0.08, 0, 0.1, 0.075, 0, 0, Math.PI * 2); ctx.fillStyle = dark ? INK : PAPER; ctx.fill(); ctx.stroke();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0.04, -0.05 + i * 0.033, 0.05, 0.016, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(-0.06, -0.085, 0.045, 0.02, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (!dark) { ctx.lineWidth = lw * 0.5; for (let x = -0.62; x < -0.2; x += 0.04) { ctx.beginPath(); ctx.moveTo(x, 0.06); ctx.lineTo(x + 0.03, 0.02); ctx.stroke(); } }
    ctx.restore();
  };
  arm(1, true); arm(-1, false);
  ctx.restore();
}

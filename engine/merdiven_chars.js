// "Merdiven" karakterleri ve nesneleri: Ay'a merdivenle tırmanan kişi (yaşı ilerledikçe saçı ağarır, sırtı eğilir,
// en sonda baston), Everest, Uluslararası Uzay İstasyonu, GPS uydusu, Ay, Apollo 11 roketi, evler.
// Tek çizim fonksiyonları; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yok.
// Birim: kişide boy = 1 (size px), kök ayak tabanı, sağa bakar (merdiven sağa yukarı çıkar).
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

// Kimlik kartı: genç tırmanıcı (18 yaşında başlar): kısa koyu saç, tişört, sırt çantası, koyu pantolon
export const CLIMBER_CARD = Object.freeze({ name: 'tırmanıcı (18 → 90 yaş): kısa saç, çizgili tişört, sırt çantası', stroke: 0.013, stepRise: 0.17 });
// pose: { phase: adım fazı (0–1 bir basamak), age: 0 (18) → 1 (90), still: bool }
// Basamak çıkışı: ön ayak bir basamak yukarıda (sağ-üst), arka ayak aşağıda; faz boyunca ağırlık öne geçer
export function drawClimber(ctx, card, pose, size, step = { run: 0.2, rise: 0.2 }) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), a = Math.max(0, Math.min(1, pose.age || 0)), ph = pose.still ? 0 : ((pose.phase || 0) % 1 + 1) % 1;
  const lean = rad(6 + 16 * a);   // yaşla öne eğilme
  const bob = pose.still ? 0 : Math.sin(ph * Math.PI * 2) * 0.012;
  // ayaklar: basan ayak bir üst basamakta sabit; salınan ayak kökten iki basamak yukarı kavis çizer. Kök (alt basamak)
  // merdivenle birlikte bir basamak aşağı kayarken kalça aynı oranda yükselir: ekranda kalça sabit, döngü kesintisiz
  const lift = pose.still ? 0 : ph, e = lift * lift * (3 - 2 * lift);
  // ayak basamağın ortasına basar (kök = basamak köşesi; ayak yarım basamak geride)
  const hip = [step.run * lift, -0.5 - step.rise * (0.5 + lift) + bob];
  const feet = [[step.run * 0.5, -step.rise], [lerp(-0.5 * step.run, 1.5 * step.run, e), lerp(0, -2 * step.rise, e) - Math.sin(e * Math.PI) * 0.07]];
  for (const [fx, fy] of feet) {
    // iki kemik (uyluk = baldır = 0,25): diz ayakla kalçanın ortasından dik yönde, öne (sağa) bükülür
    const dx = fx - hip[0], dy = fy - hip[1], L = Math.max(1e-4, Math.hypot(dx, dy)), half = Math.min(0.249, L / 2);
    const mx = hip[0] + dx / 2, my = hip[1] + dy / 2, k = Math.sqrt(0.25 * 0.25 - half * half);
    let nx = -dy / L, ny = dx / L; if (nx < 0) { nx = -nx; ny = -ny; }
    const kx = mx + nx * k, ky = my + ny * k;
    ctx.strokeStyle = INK; ctx.lineWidth = 0.07; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy - 0.01); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(fx + 0.03, fy - 0.012, 0.045, 0.016, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  }
  ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(lean);
  // sırt çantası
  ctx.beginPath(); ctx.roundRect(-0.13, -0.27, 0.07, 0.2, 0.02); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.roundRect(-0.13, -0.27, 0.07, 0.2, 0.02); }, 0.02, 0, lw * 0.6, GRAPH);
  // gövde: çizgili tişört
  const torso = () => poly(ctx, [[-0.075, -0.3], [0.075, -0.3], [0.068, 0], [-0.068, 0]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, torso, 0.05, 0, lw * 1.2); torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // kollar: yürürken sallanır; yaşlıyken ön kol bastona
  const sw = pose.still ? 0 : Math.sin(ph * Math.PI * 2) * 22, sh = [0.005, -0.28];
  const cane = a > 0.72;
  const A = cane ? [[40, 30], [-14 - sw * 0.3, 10]] : [[18 + sw, 10], [-18 - sw, 10]];
  const hands = [];
  A.forEach(([ang, e]) => { const ex = sh[0] + Math.sin(rad(ang)) * 0.15, ey = sh[1] + Math.cos(rad(ang)) * 0.15, hx = ex + Math.sin(rad(ang + e)) * 0.14, hy = ey + Math.cos(rad(ang + e)) * 0.14; limb(ctx, sh[0], sh[1], ex, ey, 0.036, lw); limb(ctx, ex, ey, hx, hy, 0.032, lw); hands.push([hx, hy]); });
  // baş: saç koyu → grafit → beyaz (kontur) ; yaşlıyken seyrek
  const hy = -0.38;
  ctx.beginPath(); ctx.arc(0.012, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  const hairCol = a < 0.35 ? INK : a < 0.65 ? GRAPH : PAPER;
  ctx.beginPath(); ctx.arc(0.0, hy - 0.012, 0.062, Math.PI * (1.02 + 0.15 * a), Math.PI * (1.98 - 0.1 * a)); ctx.fillStyle = hairCol; ctx.fill(); if (a >= 0.65) { ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  if (a > 0.5) { ctx.beginPath(); ctx.arc(0.02, hy + 0.035, 0.035, 0.1 * Math.PI, 0.9 * Math.PI); ctx.fillStyle = hairCol; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke(); } // sakal
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.048, hy - 0.004, 0.008, 0, Math.PI * 2); ctx.fill();
  if (a > 0.4) { ctx.lineWidth = lw * 0.5; ctx.beginPath(); ctx.moveTo(0.032, hy - 0.022); ctx.lineTo(0.06, hy - 0.026); ctx.stroke(); } // kırışık
  ctx.restore();
  // baston: ön elden basamağa
  if (cane) { const [hx, hy2] = hands[0]; const c = Math.cos(lean), s = Math.sin(lean); const gx = hip[0] + hx * c - hy2 * s, gy = hip[1] + hx * s + hy2 * c; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(step.run * 0.9, -step.rise); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.arc(gx + 0.02, gy, 0.025, Math.PI, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}

// Everest: zirve (0,0), taban genişliği w, yükseklik h (px); kar başlığı ve tarama
export function drawMountain(ctx, w, h) {
  ctx.save(); ctx.lineJoin = 'round';
  const P = [[-w / 2, h], [-w * 0.18, h * 0.35], [-w * 0.08, h * 0.42], [0, 0], [w * 0.12, h * 0.3], [w * 0.22, h * 0.26], [w / 2, h]];
  poly(ctx, P); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); poly(ctx, P); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.lineWidth = 1.3; for (let d = -w; d < w * 2; d += 7) { ctx.beginPath(); ctx.moveTo(d, h * 0.25); ctx.lineTo(d - h, h * 1.3); ctx.stroke(); } ctx.restore();
  poly(ctx, [[-w * 0.13, h * 0.22], [0, 0], [w * 0.09, h * 0.2], [w * 0.02, h * 0.16], [-w * 0.05, h * 0.24]]); ctx.fillStyle = PAPER; ctx.fill();
  poly(ctx, P); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// Uzay İstasyonu: kafes kiriş, güneş panelleri; birim = genişlik
export function drawISS(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size; ctx.strokeStyle = INK; ctx.lineWidth = lw;
  ctx.fillStyle = PAPER; ctx.fillRect(-0.5, -0.02, 1, 0.04); ctx.strokeRect(-0.5, -0.02, 1, 0.04);
  for (const x of [-0.45, -0.28, 0.28, 0.45]) { for (const y of [-0.26, 0.04]) { ctx.fillStyle = PAPER; ctx.fillRect(x - 0.06, y, 0.12, 0.22); hatchClip(ctx, () => { ctx.beginPath(); ctx.rect(x - 0.06, y, 0.12, 0.22); }, 0.03, 90, lw * 0.6); ctx.strokeRect(x - 0.06, y, 0.12, 0.22); } }
  ctx.beginPath(); ctx.roundRect(-0.12, -0.06, 0.24, 0.12, 0.04); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-0.04, -0.12, 0.08, 0.24, 0.03); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// GPS uydusu: gövde + iki panel; birim = genişlik
export function drawSat(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size; ctx.strokeStyle = INK; ctx.lineWidth = lw;
  for (const s of [-1, 1]) { const x = s * 0.3; ctx.fillStyle = PAPER; ctx.fillRect(x - 0.2, -0.1, 0.4, 0.2); hatchClip(ctx, () => { ctx.beginPath(); ctx.rect(x - 0.2, -0.1, 0.4, 0.2); }, 0.04, 0, lw * 0.6); ctx.strokeRect(x - 0.2, -0.1, 0.4, 0.2); }
  ctx.beginPath(); ctx.rect(-0.1, -0.14, 0.2, 0.28); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0.14); ctx.lineTo(0, 0.24); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0.26, 0.04, 0, Math.PI); ctx.stroke();
  ctx.restore();
}
// Ay: gravür küre (kraterler, sağdan gölge taraması); r px
export function drawMoon(ctx, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); ctx.clip();
  for (const [x, y, s] of [[-0.35, -0.3, 0.18], [0.2, -0.45, 0.12], [0.1, 0.15, 0.22], [-0.45, 0.35, 0.14], [0.45, 0.4, 0.1], [-0.05, -0.05, 0.08]]) { ctx.beginPath(); ctx.arc(x * r, y * r, s * r, 0, Math.PI * 2); ctx.lineWidth = 1.6; ctx.strokeStyle = GRAPH; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.1, r * 1.05, 0, Math.PI * 2); ctx.rect(-2 * r, -2 * r, 4 * r, 4 * r); ctx.clip('evenodd');
  ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = 1.1; for (let d = -2 * r; d < 2 * r; d += 6) { ctx.beginPath(); ctx.moveTo(d - r, -r); ctx.lineTo(d + r, r); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// Apollo 11 (Saturn V): ince uzun roket, yukarı bakar; birim = boy; kök burun ucu (0,0)
export function drawRocket(ctx, size, flame = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size; ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  if (flame > 0) { poly(ctx, [[-0.05, 1], [0.05, 1], [0, 1 + 0.35 * flame]]); ctx.fillStyle = INK; ctx.fill(); }
  poly(ctx, [[0, 0], [0.04, 0.12], [0.06, 0.2], [0.06, 1], [-0.06, 1], [-0.06, 0.2], [-0.04, 0.12]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  for (const y of [0.35, 0.6, 0.8]) { ctx.beginPath(); ctx.moveTo(-0.06, y); ctx.lineTo(0.06, y); ctx.stroke(); }
  ctx.fillStyle = INK; ctx.fillRect(-0.06, 0.82, 0.12, 0.06);
  for (const s of [-1, 1]) { poly(ctx, [[s * 0.06, 0.86], [s * 0.12, 1.02], [s * 0.06, 1]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
// evler (yer): taban y = 0, genişlik w px
export function drawHouses(ctx, w) {
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.fillStyle = PAPER;
  for (let i = 0; i < Math.ceil(w / 70); i++) { const x = i * 70; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, -40); ctx.lineTo(x + 30, -62); ctx.lineTo(x + 60, -40); ctx.lineTo(x + 60, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(x + 22, -26, 14, 14); ctx.fillStyle = PAPER; }
  ctx.restore();
}

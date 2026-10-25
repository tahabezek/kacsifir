// "Pi" nesneleri: pi basamakları (BigInt ile hesaplanır, elle yazılmaz), gravür pi işareti, güneş, parmak ucu,
// hidrojen atomu, sarmal galaksi ve uzak galaksi işaretleri. Her biri tek çizim fonksiyonu; gravür dili
// (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yok (kırmızıyı sahne yalnız dorukta kullanır).
import { mulberry32 } from './core.js';

const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

// ——— pi basamakları: Machin formülü, n ondalık basamak (tam doğru; son 10 hane koruma payı) ———
// Dönüş: "3,1415926535…" (virgül dahil; ondalık sayısı n)
export function piString(n) {
  const G = 10n ** BigInt(n + 10);
  const arctanInv = x => { const X = BigInt(x), X2 = X * X; let term = G / X, sum = term, k = 1n, sign = -1n; while (term !== 0n) { term /= X2; const d = term / (2n * k + 1n); if (d === 0n) break; sum += sign * d; sign = -sign; k++; } return sum; };
  const pi = 16n * arctanInv(5) - 4n * arctanInv(239);
  const s = pi.toString();   // "31415926535…" (n + 11 hane)
  return s[0] + ',' + s.slice(1, n + 1);
}
// bilinen ilk 50 ondalıkla öz denetim (yanlış hesap sahneyi açmaz)
export const PI_CHECK = '3,14159265358979323846264338327950288419716939937510';

export const PI_CARD = Object.freeze({ name: 'pi işareti (gravür, iki bacak + üst kiriş)', stroke: 0.03 });
// pi işareti: birim = yükseklik (size px); kök merkez
export function drawPiMark(ctx, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = 2 / size;
  const shape = () => {
    ctx.beginPath();
    // üst kiriş (sol uçta hafif kıvrım)
    ctx.moveTo(-0.5, -0.24); ctx.quadraticCurveTo(-0.46, -0.42, -0.3, -0.42); ctx.lineTo(0.52, -0.42); ctx.lineTo(0.52, -0.3); ctx.lineTo(-0.3, -0.3); ctx.quadraticCurveTo(-0.4, -0.3, -0.42, -0.2); ctx.closePath();
    // sol bacak (aşağıda sola kıvrılır)
    ctx.moveTo(-0.2, -0.32); ctx.lineTo(-0.08, -0.32); ctx.quadraticCurveTo(-0.12, 0.2, -0.3, 0.44); ctx.quadraticCurveTo(-0.36, 0.5, -0.42, 0.46); ctx.quadraticCurveTo(-0.24, 0.18, -0.2, -0.32); ctx.closePath();
    // sağ bacak (aşağıda sağa kıvrılır)
    ctx.moveTo(0.18, -0.32); ctx.lineTo(0.3, -0.32); ctx.quadraticCurveTo(0.26, 0.24, 0.32, 0.36); ctx.quadraticCurveTo(0.38, 0.46, 0.5, 0.38); ctx.lineTo(0.52, 0.42); ctx.quadraticCurveTo(0.36, 0.56, 0.22, 0.44); ctx.quadraticCurveTo(0.14, 0.3, 0.18, -0.32); ctx.closePath();
  };
  shape(); ctx.fillStyle = PAPER; ctx.fill();
  // gravür tarama (45°)
  ctx.save(); shape(); ctx.clip(); ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.9;
  for (let d = -1.2; d < 1.2; d += 0.028) { ctx.beginPath(); ctx.moveTo(d - 0.6, -0.6); ctx.lineTo(d + 0.6, 0.6); ctx.stroke(); }
  ctx.restore();
  shape(); ctx.lineWidth = lw * 2.2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// Güneş: dolu disk + kısa ışınlar (yavaş döner); birim = disk yarıçapı
export function drawSun(ctx, r, rot = 0) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.4, r * 0.12);
  for (let k = 0; k < 12; k++) { const a = rot + (k * Math.PI) / 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35); ctx.lineTo(Math.cos(a) * r * (k % 2 ? 1.7 : 1.95), Math.sin(a) * r * (k % 2 ? 1.7 : 1.95)); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); ctx.clip(); ctx.lineWidth = Math.max(0.8, r * 0.06); for (let d = -r; d < r; d += Math.max(2.2, r * 0.18)) { ctx.beginPath(); ctx.moveTo(d, -r); ctx.lineTo(d + r, r); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = Math.max(1.5, r * 0.14); ctx.stroke();
  ctx.restore();
}

// Parmak ucu (yukarı bakar): tırnak genişliği = nailW px; kök tırnağın alt kenarının ortası
export function drawFingertip(ctx, nailW) {
  const s = nailW / 1.0; // birim = tırnak genişliği
  ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round'; const lw = 2.2 / s;
  // parmak: yuvarlak uçlu sütun (genişlik 1,55 tırnak)
  const finger = () => { ctx.beginPath(); ctx.moveTo(-0.78, 2.6); ctx.lineTo(-0.78, -0.55); ctx.bezierCurveTo(-0.78, -1.45, 0.78, -1.45, 0.78, -0.55); ctx.lineTo(0.78, 2.6); };
  finger(); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); finger(); ctx.closePath(); ctx.clip(); ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.6; for (let y = -1.4; y < 2.6; y += 0.11) { ctx.beginPath(); ctx.moveTo(0.35, y); ctx.lineTo(0.78, y + 0.05); ctx.stroke(); } ctx.restore();
  finger(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
  // tırnak: kök (0,0) alt kenar ortası, genişlik 1
  ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.lineTo(-0.5, -0.78); ctx.bezierCurveTo(-0.5, -1.18, 0.5, -1.18, 0.5, -0.78); ctx.lineTo(0.5, 0); ctx.quadraticCurveTo(0, 0.12, -0.5, 0); ctx.closePath();
  ctx.fillStyle = '#FBF8F1'; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.36, -0.86); ctx.quadraticCurveTo(0, -1.02, 0.36, -0.86); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = GRAPH; ctx.stroke();
  ctx.restore();
}

// Hidrojen atomu: çekirdek (proton) + noktalı elektron bulutu; d = atom çapı px; t: bulut titreşimi
export function drawHydrogen(ctx, d, t = 0) {
  const r = d / 2, rnd = mulberry32(17);
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  ctx.fillStyle = INK;
  for (let i = 0; i < 260; i++) {
    const a = rnd() * Math.PI * 2 + t * (0.3 + rnd() * 0.4), q = Math.sqrt(-Math.log(1 - rnd() * 0.97)) * 0.42, rr = Math.min(0.98, q) * r;
    ctx.fillRect(Math.cos(a) * rr - 1, Math.sin(a) * rr - 1, 2, 2);
  }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.setLineDash([5, 5]); ctx.lineWidth = 1.6; ctx.strokeStyle = GRAPH; ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(0, 0, Math.max(3, r * 0.06), 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// Sarmal galaksi (gravür): iki kol + çekirdek; r = yarıçap px; rot = dönüş
export function drawSpiral(ctx, r, rot = 0, seed = 3) {
  const rnd = mulberry32(seed);
  ctx.save(); ctx.rotate(rot); ctx.fillStyle = INK;
  for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 520; i++) {
    const u = rnd(), th = arm * Math.PI + u * 3.4 * Math.PI * 0.62, rr = (0.08 + u * 0.92) * r, sc = (0.05 + 0.18 * u) * r * (rnd() - 0.5);
    const x = Math.cos(th) * rr - Math.sin(th) * sc, y = (Math.sin(th) * rr + Math.cos(th) * sc) * 0.62, s = Math.min(3.2, Math.max(1, r * 0.012 * (1.4 - u)));
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  ctx.beginPath(); ctx.ellipse(0, 0, Math.min(r * 0.1, 18), Math.min(r * 0.065, 12), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Uzak galaksi işareti (küçük elips + çekirdek); s = boy px
export function drawGalaxyMark(ctx, s, ang) {
  ctx.save(); ctx.rotate(ang); ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.42, 0, 0, Math.PI * 2); ctx.lineWidth = Math.max(1, s * 0.16); ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, Math.max(1, s * 0.22), 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
}

// Jüpiter (küçük, bantlı): r yarıçap
export function drawJupiterSmall(ctx, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.clip();
  ctx.strokeStyle = INK; for (const [y, w] of [[-0.55, 0.12], [-0.25, 0.18], [0.1, 0.1], [0.4, 0.16]]) { ctx.lineWidth = w * r; ctx.beginPath(); ctx.moveTo(-r, y * r); ctx.lineTo(r, y * r + 0.05 * r); ctx.stroke(); }
  ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
}

// Dünya (küçük, kıta lekeli)
export function drawEarthSmall(ctx, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.clip();
  ctx.fillStyle = GRAPH; ctx.beginPath(); ctx.ellipse(-0.25 * r, -0.2 * r, 0.42 * r, 0.3 * r, 0.5, 0, Math.PI * 2); ctx.ellipse(0.35 * r, 0.35 * r, 0.3 * r, 0.22 * r, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
}

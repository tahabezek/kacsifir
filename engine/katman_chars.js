// "Katman" nesneleri: Göbeklitepe T-sütunu (tilki kabartmalı, kollu), Keops Piramidi, yünlü mamut (yürüyüş döngüsü),
// çivi yazılı kil tablet, tahta tekerlek, Kleopatra sikkesi, Ay ayak izi. Tek çizim fonksiyonları; gravür dili
// (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yok. Kök: nesnenin taban ortası (sikke ve izde merkez).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

function hatch(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -2; d < 2; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 2, -dx * d - dy * 2); ctx.lineTo(dy * d + dx * 2, -dx * d + dy * 2); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };

// T-sütunu: birim = yükseklik. Gövde (ince, yüksek) + üstte yatay başlık (T). Ön yüzde kabartma kollar ve kemer,
// yan yüzde tilki. opts: { relief: 0..1 } (kabartmanın görünürlüğü)
export const PILLAR_CARD = Object.freeze({ name: 'Göbeklitepe T-sütunu (Enclosure D, ~5,5 m; kollar, kemer, tilki kabartması)', stroke: 0.008 });
export function drawTPillar(ctx, size, opts = {}) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(PILLAR_CARD.stroke, 1.4 / size), rel = opts.relief ?? 1;
  // gövde (hafif daralan), yan yüz (gölge tarafı) taralı
  const shaft = () => poly(ctx, [[-0.1, 0], [0.1, 0], [0.09, -0.78], [-0.09, -0.78]]);
  const side = () => poly(ctx, [[0.1, 0], [0.135, -0.02], [0.125, -0.79], [0.09, -0.78]]);
  shaft(); ctx.fillStyle = PAPER; ctx.fill();
  side(); ctx.fill(); hatch(ctx, side, 0.012, 80, lw * 0.7);
  // başlık (T)
  const head = () => poly(ctx, [[-0.2, -0.78], [0.19, -0.78], [0.19, -1], [-0.2, -1]]);
  const headSide = () => poly(ctx, [[0.19, -0.78], [0.225, -0.8], [0.225, -1.02], [0.19, -1]]);
  head(); ctx.fill(); headSide(); ctx.fill(); hatch(ctx, headSide, 0.012, 80, lw * 0.7);
  // taş dokusu: yatay ince grafit çizikler (tohumsuz, sabit)
  ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.5;
  for (let y = -0.05; y > -0.97; y -= 0.06) { ctx.beginPath(); ctx.moveTo(-0.055, y); ctx.lineTo(-0.02 + ((y * 37) % 0.04), y - 0.004); ctx.stroke(); }
  // kabartmalar: kollar gövdenin ön yüzünde aşağı iner, eller kemerin üstünde; kemer; yan yüzde tilki
  ctx.save(); ctx.globalAlpha = rel; ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.4;
  // kollar: omuzdan kenar boyunca iner, belde içe kıvrılır (eller kemerin üstünde buluşur)
  ctx.beginPath(); ctx.moveTo(-0.075, -0.74); ctx.lineTo(-0.075, -0.47); ctx.quadraticCurveTo(-0.075, -0.41, -0.03, -0.405); ctx.moveTo(0.075, -0.74); ctx.lineTo(0.075, -0.47); ctx.quadraticCurveTo(0.075, -0.41, 0.03, -0.405); ctx.stroke();
  for (const s of [-1, 1]) for (let f = 0; f < 4; f++) { ctx.beginPath(); ctx.moveTo(s * (0.022 - f * 0.004), -0.4 + f * 0.006); ctx.lineTo(s * (0.006 - f * 0.002), -0.395 + f * 0.006); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  ctx.lineWidth = lw * 1.2; ctx.beginPath(); ctx.moveTo(-0.095, -0.38); ctx.lineTo(0.095, -0.38); ctx.moveTo(-0.095, -0.355); ctx.lineTo(0.095, -0.355); ctx.stroke();
  // tilki: başlığın altında, gövdenin ön yüzünde sıçrayan siluet
  ctx.save(); ctx.translate(0, -0.6); ctx.beginPath(); ctx.moveTo(-0.04, 0.02); ctx.quadraticCurveTo(-0.01, -0.03, 0.035, -0.02); ctx.lineTo(0.05, -0.04); ctx.lineTo(0.048, -0.015); ctx.lineTo(0.03, 0.0); ctx.lineTo(0.035, 0.03); ctx.moveTo(-0.02, 0.0); ctx.lineTo(-0.035, 0.03); ctx.moveTo(-0.04, 0.02); ctx.quadraticCurveTo(-0.07, 0.03, -0.075, 0.0); ctx.lineWidth = lw * 1.1; ctx.stroke(); ctx.restore();
  ctx.restore();
  // konturlar
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.3; shaft(); ctx.stroke(); side(); ctx.stroke(); head(); ctx.stroke(); headSide(); ctx.stroke();
  ctx.restore();
}

// Keops Piramidi (yandan, iki yüz görünür): birim = taban genişliği; kök taban ortası. Gölge yüz sık tarama.
export function drawPyramid(ctx, size, opts = {}) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round';
  const lw = Math.max(0.006, 1.4 / size), h = 0.64;
  const lit = () => poly(ctx, [[-0.5, 0], [0.12, 0], [0, -h]]), dark = () => poly(ctx, [[0.12, 0], [0.5, 0], [0, -h]]);
  lit(); ctx.fillStyle = PAPER; ctx.fill(); dark(); ctx.fill();
  hatch(ctx, dark, 0.014, 60, lw * 0.9);
  // taş sıraları (aydınlık yüzde ince yatay çizgiler)
  ctx.save(); lit(); ctx.clip(); ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.5; for (let y = -0.03; y > -h; y -= 0.035) { ctx.beginPath(); ctx.moveTo(-0.5, y); ctx.lineTo(0.5, y); ctx.stroke(); } ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.4; lit(); ctx.stroke(); dark(); ctx.stroke();
  if (opts.ground !== false) { ctx.beginPath(); ctx.moveTo(-0.62, 0); ctx.lineTo(0.62, 0); ctx.lineWidth = lw; ctx.stroke(); }
  ctx.restore();
}

// yünlü mamut: sağa yürür; birim = gövde boyu; kök ayak tabanı ortası. phase: yürüyüş (sn)
export const MAMMOTH_CARD = Object.freeze({ name: 'yünlü mamut (Wrangel, küçük boy; kıvrık dişler, kubbe kafa, sırt tümseği)', stroke: 0.01 });
export function drawMammoth(ctx, size, phase = 0) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(MAMMOTH_CARD.stroke, 1.4 / size), w = Math.sin(phase * Math.PI * 2 / 1.1), bob = Math.abs(w) * 0.008;
  ctx.translate(0, -bob);
  // bacaklar (çaprazlar birlikte), arkadakiler grafit
  const leg = (x, sw, back) => { ctx.strokeStyle = back ? GRAPH : INK; ctx.lineWidth = 0.075; ctx.beginPath(); ctx.moveTo(x, -0.3); ctx.lineTo(x + sw * 0.04, -0.01); ctx.stroke(); };
  leg(-0.24, -w, true); leg(0.2, w, true); leg(-0.3, w, false); leg(0.26, -w, false);
  // gövde: sırt tümseği, kubbe kafa (sağda), yünlü alt kenar
  const body = () => { ctx.beginPath(); ctx.moveTo(-0.42, -0.3); ctx.quadraticCurveTo(-0.45, -0.6, -0.2, -0.66); ctx.quadraticCurveTo(0.05, -0.74, 0.2, -0.66); ctx.quadraticCurveTo(0.36, -0.78, 0.44, -0.62); ctx.quadraticCurveTo(0.5, -0.5, 0.44, -0.38); ctx.lineTo(0.36, -0.28);
    for (let x = 0.36; x > -0.42; x -= 0.05) ctx.lineTo(x - 0.025, -0.24 - ((x * 100) % 2) * 0.01); ctx.closePath(); };
  body(); ctx.fillStyle = PAPER; ctx.fill(); hatch(ctx, body, 0.02, 75, lw * 0.6, GRAPH); body(); ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.3; ctx.stroke();
  // hortum ve dişler
  ctx.strokeStyle = INK; ctx.lineWidth = 0.05; ctx.beginPath(); ctx.moveTo(0.45, -0.5); ctx.quadraticCurveTo(0.56, -0.3, 0.5, -0.12 + w * 0.01); ctx.stroke();
  const tusk = () => { ctx.beginPath(); ctx.moveTo(0.42, -0.41); ctx.bezierCurveTo(0.64, -0.3, 0.72, -0.5, 0.6, -0.6); };
  ctx.strokeStyle = INK; ctx.lineWidth = 0.045; tusk(); ctx.stroke(); ctx.strokeStyle = PAPER; ctx.lineWidth = 0.028; tusk(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.38, -0.56, 0.012, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// çivi yazılı kil tablet; birim = genişlik; kök merkez
export function drawTablet(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.beginPath(); ctx.roundRect(-0.5, -0.36, 1, 0.72, 0.08); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = -0.38 + c * 0.15, y = -0.22 + r * 0.15; poly(ctx, [[x, y], [x + 0.06, y + 0.02], [x, y + 0.04]]); ctx.fill(); if ((r + c) % 3 === 0) { ctx.fillRect(x + 0.06, y + 0.015, 0.04, 0.01); } }
  ctx.restore();
}
// tahta tekerlek (tam disk, üç tahta); birim = çap
export function drawWheel(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.beginPath(); ctx.arc(0, 0, 0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.17, -0.47); ctx.lineTo(-0.17, 0.47); ctx.moveTo(0.17, -0.47); ctx.lineTo(0.17, 0.47); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 0.09, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
// Kleopatra sikkesi (profil, taç bandı, kenar boncukları); birim = çap
export function drawCoin(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.beginPath(); ctx.arc(0, 0, 0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; for (let i = 0; i < 36; i++) { const a = i * Math.PI / 18; ctx.beginPath(); ctx.arc(Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0.012, 0, Math.PI * 2); ctx.fill(); }
  // profil (sağa bakar): alın, burun, dudak, çene, boyun; topuz
  ctx.beginPath(); ctx.moveTo(0.02, -0.3); ctx.quadraticCurveTo(0.12, -0.28, 0.14, -0.14); ctx.lineTo(0.2, -0.06); ctx.lineTo(0.14, -0.04); ctx.lineTo(0.16, 0.0); ctx.lineTo(0.13, 0.03); ctx.quadraticCurveTo(0.14, 0.1, 0.06, 0.12); ctx.lineTo(0.06, 0.3); ctx.lineTo(-0.14, 0.3); ctx.quadraticCurveTo(-0.2, 0.0, -0.16, -0.18); ctx.quadraticCurveTo(-0.1, -0.32, 0.02, -0.3); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.1; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(-0.12, -0.12, 0.13, 0, Math.PI * 2); ctx.clip(); ctx.lineWidth = lw * 0.6; for (let y = -0.26; y < 0.02; y += 0.025) { ctx.beginPath(); ctx.moveTo(-0.26, y); ctx.lineTo(0.0, y + 0.03); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(-0.12, -0.27); ctx.quadraticCurveTo(0.06, -0.24, 0.12, -0.2); ctx.lineWidth = lw * 1.6; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.07, -0.13, 0.012, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// Ay ayak izi (bot tabanı izi, üstten); birim = uzunluk
export function drawBootprint(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size;
  ctx.beginPath(); ctx.ellipse(0, 0, 0.2, 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 0.2, 0.5, 0, 0, Math.PI * 2); ctx.clip(); ctx.lineWidth = lw * 1.2; for (let y = -0.42; y < 0.46; y += 0.07) { ctx.beginPath(); ctx.moveTo(-0.22, y); ctx.lineTo(0.22, y + 0.02); ctx.stroke(); } ctx.restore();
  ctx.restore();
}
// buğday başağı (tarım simgesi); birim = yükseklik
export function drawWheat(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.6 / size; ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.2;
  ctx.beginPath(); ctx.moveTo(0, 0.5); ctx.lineTo(0, -0.45); ctx.stroke();
  for (let i = 0; i < 6; i++) { const y = -0.4 + i * 0.12; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 0.06, y, 0.05, 0.09, s * 0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); } }
  ctx.restore();
}

// akıllı telefon (bugün); birim = yükseklik; kök alt orta
export function drawPhone(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.8 / size;
  ctx.beginPath(); ctx.roundRect(-0.25, -1, 0.5, 1, 0.07); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-0.2, -0.92, 0.4, 0.8, 0.03); ctx.fillStyle = '#E6DCC6'; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.fillStyle = INK; for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) ctx.fillRect(-0.16 + i * 0.12, -0.86 + j * 0.13, 0.08, 0.08);
  ctx.beginPath(); ctx.arc(0, -0.06, 0.025, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// ay modülü (iniş kademesi, bacaklar); birim = genişlik; kök ayaklar
export function drawLander(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 1.8 / size; ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.2;
  ctx.beginPath(); ctx.moveTo(-0.3, -0.35); ctx.lineTo(-0.5, 0); ctx.moveTo(0.3, -0.35); ctx.lineTo(0.5, 0); ctx.moveTo(-0.6, 0); ctx.lineTo(-0.4, 0); ctx.moveTo(0.4, 0); ctx.lineTo(0.6, 0); ctx.stroke();
  poly(ctx, [[-0.32, -0.32], [0.32, -0.32], [0.38, -0.55], [-0.38, -0.55]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  hatch(ctx, () => poly(ctx, [[-0.32, -0.32], [0.32, -0.32], [0.38, -0.55], [-0.38, -0.55]]), 0.06, 80, lw * 0.6);
  poly(ctx, [[-0.22, -0.55], [0.22, -0.55], [0.26, -0.82], [0, -0.92], [-0.26, -0.82]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -0.92); ctx.lineTo(0, -1.05); ctx.stroke();
  ctx.restore();
}

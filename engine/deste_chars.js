// "Deste" nesneleri: iskambil kartı (yüz ve arka), dört takım işareti, kartları tutan el, karıştıran kişi.
// Gravür dili: kâğıt dolgu, mürekkep kontur; kırmızı yok (kupa ve karo içi boş kontur, maça ve sinek dolu).
// Birim: kartta yükseklik = 1 (size px), kök kartın merkezi; elde kök bilek; kişide boy = 1, kök ayak tabanı.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const CARD = Object.freeze({ w: 0.7, r: 0.06, stroke: 0.012 });

// takım işareti, merkez (0,0), boy 1; suit: 0 maça, 1 kupa, 2 karo, 3 sinek
export function suitPath(ctx, suit) {
  ctx.beginPath();
  if (suit === 1) { // kupa
    ctx.moveTo(0, 0.45); ctx.bezierCurveTo(-0.55, 0.05, -0.5, -0.5, 0, -0.18); ctx.bezierCurveTo(0.5, -0.5, 0.55, 0.05, 0, 0.45);
  } else if (suit === 2) { // karo
    ctx.moveTo(0, -0.5); ctx.quadraticCurveTo(0.2, -0.15, 0.36, 0); ctx.quadraticCurveTo(0.2, 0.15, 0, 0.5); ctx.quadraticCurveTo(-0.2, 0.15, -0.36, 0); ctx.quadraticCurveTo(-0.2, -0.15, 0, -0.5);
  } else if (suit === 0) { // maça
    ctx.moveTo(0, -0.48); ctx.bezierCurveTo(0.55, -0.05, 0.5, 0.42, 0.04, 0.16); ctx.lineTo(0.14, 0.48); ctx.lineTo(-0.14, 0.48); ctx.lineTo(-0.04, 0.16); ctx.bezierCurveTo(-0.5, 0.42, -0.55, -0.05, 0, -0.48);
  } else { // sinek
    for (const [x, y] of [[0, -0.24], [-0.24, 0.08], [0.24, 0.08]]) { ctx.moveTo(x + 0.2, y); ctx.arc(x, y, 0.2, 0, Math.PI * 2); }
    ctx.moveTo(-0.05, 0.1); ctx.lineTo(-0.15, 0.48); ctx.lineTo(0.15, 0.48); ctx.lineTo(0.05, 0.1); ctx.closePath();
  }
}
export function drawSuit(ctx, suit, size, lw = 1.6) {
  ctx.save(); ctx.scale(size, size); suitPath(ctx, suit);
  if (suit === 0 || suit === 3) { ctx.fillStyle = INK; ctx.fill(); }
  else { ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw / size; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}

// kart: i = 0..51 (takım = i / 13, değer = i % 13); face: true yüz, false arka
export function drawCard(ctx, i, face, size, F) {
  const w = CARD.w, h = 1, lw = Math.max(CARD.stroke, 1.3 / size);
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, CARD.r); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  if (!face) {
    // arka: iç çerçeve + çapraz kafes tarama + orta madalyon
    ctx.beginPath(); ctx.roundRect(-w / 2 + 0.05, -h / 2 + 0.05, w - 0.1, h - 0.1, CARD.r * 0.6); ctx.save(); ctx.clip();
    ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.55;
    for (let d = -1.2; d < 1.2; d += 0.055) { ctx.beginPath(); ctx.moveTo(d - 0.6, -0.6); ctx.lineTo(d + 0.6, 0.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(d + 0.6, -0.6); ctx.lineTo(d - 0.6, 0.6); ctx.stroke(); }
    ctx.restore(); ctx.beginPath(); ctx.roundRect(-w / 2 + 0.05, -h / 2 + 0.05, w - 0.1, h - 0.1, CARD.r * 0.6); ctx.lineWidth = lw; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 0.16, 0.22, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    drawSuit(ctx, 0, 0.18, lw);
    ctx.restore(); return;
  }
  // gravür gölgesi: sağ ve alt kenarda ince tarama şeridi
  ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, CARD.r); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.lineWidth = lw * 0.5;
  for (let d = -1; d < 1; d += 0.022) { ctx.beginPath(); ctx.moveTo(w / 2 - 0.06 + d * 0.0, -h / 2 + (d + 1) * 0.5); ctx.lineTo(w / 2, -h / 2 + (d + 1) * 0.5 - 0.06); ctx.stroke(); }
  for (let d = -w / 2; d < w / 2; d += 0.022) { ctx.beginPath(); ctx.moveTo(d, h / 2 - 0.05); ctx.lineTo(d + 0.05, h / 2); ctx.stroke(); }
  ctx.restore();
  const s = Math.floor(i / 13), r = RANKS[i % 13];
  // köşe: değer + küçük takım (sol üst, sağ alt ters)
  for (const k of [1, -1]) {
    ctx.save(); if (k < 0) ctx.rotate(Math.PI);
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = F(0.17); ctx.fillText(r, -w / 2 + 0.11, -h / 2 + 0.19);
    ctx.save(); ctx.translate(-w / 2 + 0.11, -h / 2 + 0.29); drawSuit(ctx, s, 0.11, lw); ctx.restore();
    ctx.restore();
  }
  // orta: büyük takım işareti (resimli kartlarda çerçeve içinde harf)
  if (i % 13 >= 10) { ctx.beginPath(); ctx.rect(-0.16, -0.27, 0.32, 0.54); ctx.lineWidth = lw * 0.8; ctx.stroke(); ctx.font = F(0.28); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(r, 0, 0.1); }
  else drawSuit(ctx, s, 0.34, lw);
  ctx.restore();
}

// el: avuç yukarı, kartları alttan tutar; kök bilek (0,0), boy ~1 (size px), parmak ucu yukarıda
export function drawHand(ctx, size, mirror = false) {
  ctx.save(); ctx.scale(mirror ? -size : size, size); const lw = 1.8 / size;
  ctx.lineJoin = 'round';
  // kol yeni
  ctx.beginPath(); ctx.moveTo(-0.16, 0.6); ctx.lineTo(-0.12, 0.05); ctx.lineTo(0.14, 0.05); ctx.lineTo(0.2, 0.6); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = GRAPH; ctx.lineWidth = lw * 0.6; for (let y = 0.1; y < 0.6; y += 0.035) { ctx.beginPath(); ctx.moveTo(-0.2, y); ctx.lineTo(0.22, y); ctx.stroke(); } ctx.restore();
  // avuç
  ctx.beginPath(); ctx.moveTo(-0.15, 0.06); ctx.bezierCurveTo(-0.24, -0.1, -0.2, -0.26, -0.06, -0.3); ctx.lineTo(0.16, -0.28); ctx.bezierCurveTo(0.24, -0.2, 0.22, -0.02, 0.15, 0.06); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // başparmak (kartların önünden)
  ctx.beginPath(); ctx.moveTo(-0.13, -0.08); ctx.quadraticCurveTo(-0.3, -0.24, -0.22, -0.42); ctx.quadraticCurveTo(-0.15, -0.46, -0.1, -0.38); ctx.quadraticCurveTo(-0.12, -0.24, -0.02, -0.14); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.restore();
}

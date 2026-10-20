// Canlılar: her biri TEK bir çizim fonksiyonu ve dondurulmuş bir karakter kartıyla çizilir.
// Önce iskelet (eklem noktaları), sonra hacimler, en son türün kendine özgü ayrıntısı.
// Birim: baş uzunluğu = 1. Çizim gövde ekseni +x yönünde, merkez (0,0) göğüs ortası.

export const ANT_CARD = Object.freeze({
  name: 'karınca (işçi)',
  lengthMM: 5,                 // gerçek boy: yaklaşık 5 mm
  // oranlar (baş = 1)
  head: { len: 1.0, wid: 0.92, x: 1.55 },
  thorax: { len: 1.55, wid: 0.56, x: 0.25 },
  petiole: { len: 0.32, wid: 0.34, x: -0.86 },
  gaster: { len: 1.75, wid: 1.24, x: -1.95 },
  totalLen: 4.65,
  // bacak kökleri göğüs üzerinde (x), açılar derece (0 = ileri), segment boyları
  legs: [
    // kalça açısı (0 = ileri), diz ve bilek kırılımı (derece, + = geriye), segment boyları
    { x: 0.62, ang: 52, knee: -34, ankle: -16, fem: 0.92, tib: 1.0, tar: 0.62 },
    { x: 0.24, ang: 82, knee: 36, ankle: 16, fem: 1.0, tib: 1.06, tar: 0.66 },
    { x: -0.12, ang: 112, knee: 34, ankle: 14, fem: 1.16, tib: 1.3, tar: 0.76 },
  ],
  segW: [0.16, 0.11, 0.075],   // uyluk, kaval, ayak: incelen çizgi
  antenna: { scape: 0.95, scapeAng: 50, fun: 1.1, funAng: -30 },
  stroke: 0.1,                 // çizgi kalınlığı (birim)
  swing: 14,                   // yürüme salınımı (derece)
  palette: { body: '#1C1B18', sheen: 'rgba(236,229,213,0.16)' },
});

const rad = d => (d * Math.PI) / 180;

// Tripod yürüyüşü: (sol1, sağ2, sol3) aynı fazda, diğer üçü ters fazda.
function legPhase(side, i, phase) {
  const group = (i % 2 === 0) === (side > 0) ? 0 : Math.PI;
  return Math.sin(phase * Math.PI * 2 + group);
}

// pose: { phase: 0..1 yürüme döngüsü, lift: 0..1 bacak kaldırma, splay: bacak açıklığı çarpanı }
export function drawAnt(ctx, card, pose, sizePx, color) {
  const u = sizePx / card.totalLen;           // 1 birim kaç piksel
  const ink = color || card.palette.body;
  ctx.save();
  ctx.scale(u, u);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const lw = Math.max(card.stroke, 0.9 / u);   // ekranda en az ~0,9 px

  // 1) İSKELET → bacaklar (gövdenin altında kalsın diye önce)
  ctx.lineWidth = lw;
  for (const side of [1, -1]) {
    card.legs.forEach((L, i) => {
      const sw = legPhase(side, i, pose.phase) * card.swing * (pose.splay ?? 1);
      const a0 = rad(L.ang + sw) * side;
      const kx = L.x + Math.cos(a0) * L.fem, ky = Math.sin(a0) * L.fem;           // diz
      const a1 = a0 + rad(L.knee) * side;
      const fx = kx + Math.cos(a1) * L.tib, fy = ky + Math.sin(a1) * L.tib;     // bilek
      const a2 = a1 + rad(L.ankle) * side;
      const tx = fx + Math.cos(a2) * L.tar, ty = fy + Math.sin(a2) * L.tar;     // ayak ucu
      const seg3 = [[L.x, 0, kx, ky], [kx, ky, fx, fy], [fx, fy, tx, ty]];
      seg3.forEach(([x0, y0, x1, y1], k) => {
        ctx.lineWidth = Math.max(card.segW[k], 0.9 / u);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      });
    });
  }
  // antenler (dirsekli)
  const A = card.antenna;
  for (const side of [1, -1]) {
    const hx = card.head.x + card.head.len * 0.32;
    const wob = Math.sin(pose.phase * Math.PI * 4 + (side > 0 ? 0 : 1.3)) * 6;
    const a0 = rad(A.scapeAng + wob) * side;
    const ex = hx + Math.cos(a0) * A.scape, ey = Math.sin(a0) * A.scape;
    const a1 = a0 + rad(A.funAng) * side;
    const ox = ex + Math.cos(a1) * A.fun, oy = ey + Math.sin(a1) * A.fun;
    ctx.beginPath(); ctx.moveTo(hx, side * 0.18); ctx.lineTo(ex, ey); ctx.lineTo(ox, oy); ctx.stroke();
  }

  // 2) HACİMLER
  const ell = (x, len, wid) => { ctx.beginPath(); ctx.ellipse(x, 0, len / 2, wid / 2, 0, 0, Math.PI * 2); ctx.fill(); };
  ell(card.gaster.x, card.gaster.len, card.gaster.wid);
  ell(card.petiole.x, card.petiole.len, card.petiole.wid);
  // göğüs: iki loblu
  ell(card.thorax.x + 0.35, card.thorax.len * 0.6, card.thorax.wid);
  ell(card.thorax.x - 0.32, card.thorax.len * 0.5, card.thorax.wid * 0.82);
  ell(card.head.x, card.head.len, card.head.wid);
  // boyun ve bel bağlantıları
  ctx.lineWidth = card.thorax.wid * 0.5;
  ctx.beginPath(); ctx.moveTo(card.head.x - 0.3, 0); ctx.lineTo(card.thorax.x + 0.6, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(card.thorax.x - 0.6, 0); ctx.lineTo(card.gaster.x + 0.5, 0); ctx.stroke();

  // 3) TÜRE ÖZGÜ AYRINTI: çeneler ve karın üstündeki parlak bantlar (yalnızca yeterince büyükken)
  if (sizePx > 40) {
    ctx.lineWidth = lw * 1.1;
    for (const side of [1, -1]) {
      ctx.beginPath();
      ctx.moveTo(card.head.x + card.head.len * 0.45, side * 0.16);
      ctx.quadraticCurveTo(card.head.x + card.head.len * 0.78, side * 0.32, card.head.x + card.head.len * 0.7, side * 0.04);
      ctx.stroke();
    }
    ctx.strokeStyle = card.palette.sheen;
    ctx.lineWidth = 0.07;
    for (let k = 0; k < 3; k++) {
      const gx = card.gaster.x + 0.45 - k * 0.42;
      ctx.beginPath(); ctx.ellipse(gx, 0, 0.08, card.gaster.wid * 0.42 * (1 - k * 0.12), 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(card.head.x + 0.1, -0.18, 0.22, 0.1, -0.3, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

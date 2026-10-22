// "Zaman" karakterleri: kozmonot (Sergey Krikalev, Mir) ve asker (Hiroo Onoda, Lubang).
// Her biri TEK çizim fonksiyonu + dondurulmuş kart; iskelet → hacim → ayrıntı. Boy = 1, kök ayak tabanı (kozmonotta gövde merkezi).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;

function kit(ctx, lw) {
  const seg = (x0, y0, x1, y1, w = lw, col = INK) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  const limb = (x0, y0, x1, y1, w) => { seg(x0, y0, x1, y1, w + lw * 1.6, INK); seg(x0, y0, x1, y1, w - lw * 0.2, PAPER); };
  return { seg, limb };
}

export const SOLDIER_CARD = Object.freeze({
  name: 'asker (Japon teğmen, kasket ve ense örtüsü, tüfek)',
  head: { r: 0.062, y: 0.9 }, hip: 0.47, shoulder: 0.78, thigh: 0.23, shin: 0.235, upperArm: 0.15, foreArm: 0.14,
  stroke: 0.014, stride: 0.42,
});

// pose: { mode: 'stand' | 'walk' | 'crouch' | 'present', phase }
export function drawSoldier(ctx, card, pose, size) {
  const c = card, s = size;
  ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(c.stroke, 1.4 / s); const { seg, limb } = kit(ctx, lw);
  const crouch = pose.mode === 'crouch' ? 1 : 0;
  const walking = pose.mode === 'walk', ph = walking ? pose.phase : 0;
  const bob = walking ? Math.abs(Math.sin(ph * Math.PI * 2)) * 0.012 : 0;
  const drop = crouch * 0.18;
  const hipY = -(c.hip - bob - drop), shY = -(c.shoulder - bob - drop * 1.05), lean = crouch * 0.07;
  const hipX = 0, shX = 0.03 + lean;
  const leg = side => {
    let th, kn;
    if (walking) { const p = (ph + (side > 0 ? 0 : 0.5)) % 1, sw = p < 0.5; th = sw ? 22 - 44 * (p / 0.5) : -22 + 44 * ((p - 0.5) / 0.5); kn = sw ? 4 : 8 + 48 * Math.sin(Math.PI * (p - 0.5) / 0.5); }
    else if (crouch) { th = side > 0 ? 75 : 20; kn = side > 0 ? 85 : 110; }
    else { th = side * 3; kn = 2; }
    const kx = hipX + Math.sin(rad(th)) * c.thigh, ky = hipY + Math.cos(rad(th)) * c.thigh;
    const fx = kx + Math.sin(rad(th - kn)) * c.shin, fy = Math.min(ky + Math.cos(rad(th - kn)) * c.shin, 0);
    limb(hipX, hipY, kx, ky, 0.058); limb(kx, ky, fx, fy, 0.052);
    ctx.beginPath(); ctx.ellipse(fx + 0.03, fy - 0.004, 0.05, 0.02, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  };
  const arm = (side, angA, angB) => {
    const ex = shX + Math.sin(rad(angA)) * c.upperArm, ey = shY + Math.cos(rad(angA)) * c.upperArm;
    const hx = ex + Math.sin(rad(angB)) * c.foreArm, hy = ey + Math.cos(rad(angB)) * c.foreArm;
    limb(shX, shY, ex, ey, 0.048); limb(ex, ey, hx, hy, 0.044);
    return [hx, hy];
  };
  const sw = walking ? Math.sin(ph * Math.PI * 2) * 22 : 0;
  // arka kol, arka bacak
  arm(-1, -sw - 6 + (crouch ? 40 : 0), -sw + 10 + (crouch ? 70 : 0));
  leg(-1);
  // tüfek: sırtta çapraz (teslimde elde yatay)
  if (pose.mode !== 'present') { ctx.save(); ctx.translate(shX - 0.07, shY + 0.02); ctx.rotate(rad(-28)); ctx.fillStyle = INK; ctx.fillRect(-0.012, -0.22, 0.024, 0.42); ctx.fillRect(-0.02, 0.12, 0.04, 0.09); ctx.restore(); }
  // gövde: üniforma, kemer
  ctx.beginPath(); ctx.moveTo(shX - 0.07, shY - 0.025); ctx.quadraticCurveTo(shX, shY - 0.05, shX + 0.075, shY - 0.02); ctx.lineTo(hipX + 0.07, hipY + 0.05); ctx.lineTo(hipX - 0.075, hipY + 0.05); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.clip(); for (let y = shY; y < hipY + 0.06; y += 0.018) seg(shX - 0.1, y, shX + 0.1, y + 0.03, lw * 0.45); ctx.restore();
  seg(hipX - 0.072, hipY + 0.005, hipX + 0.07, hipY + 0.005, lw * 2.2);
  leg(1);
  // baş: kasket (siper öne), ense örtüsü
  const hx = shX + 0.02, hy = -(c.head.y - bob - drop * 1.05);
  ctx.beginPath(); ctx.arc(hx, hy, c.head.r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.arc(hx + c.head.r * 0.45, hy - c.head.r * 0.05, 0.008, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx - c.head.r * 1.05, hy - c.head.r * 0.2); ctx.quadraticCurveTo(hx, hy - c.head.r * 1.75, hx + c.head.r * 1.05, hy - c.head.r * 0.3);
  ctx.lineTo(hx - c.head.r * 1.05, hy - c.head.r * 0.2); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  seg(hx + c.head.r * 0.6, hy - c.head.r * 0.32, hx + c.head.r * 1.55, hy - c.head.r * 0.12, lw * 1.6); // siper
  ctx.beginPath(); ctx.moveTo(hx - c.head.r * 1.05, hy - c.head.r * 0.2); ctx.lineTo(hx - c.head.r * 1.2, hy + c.head.r * 1.0); ctx.lineTo(hx - c.head.r * 0.35, hy + c.head.r * 0.65); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke(); // ense örtüsü
  // ön kol
  if (pose.mode === 'present') {
    // teslim: kılıç iki elde yatay, öne uzatılmış
    const h = arm(1, 70, 95); arm(-1, 75, 100);
    ctx.save(); ctx.translate(h[0] + 0.02, h[1] - 0.01); ctx.fillStyle = INK; ctx.fillRect(-0.05, -0.008, 0.38, 0.016); ctx.fillRect(-0.09, -0.012, 0.05, 0.024); ctx.restore();
  } else arm(1, sw + 6 + (crouch ? 50 : 0), sw - 8 + (crouch ? 80 : 0));
  ctx.restore();
}

export const COSMONAUT_CARD = Object.freeze({
  name: 'kozmonot (Sokol tulumu, yuvarlak kask, göğüs paneli)',
  helmet: 0.17, body: { w: 0.24, h: 0.34 }, limb: 0.06, stroke: 0.014,
});
// pose: { spin: açı (rad), reach: 0..1 kol açıklığı }. Kök: gövde merkezi.
export function drawCosmonaut(ctx, card, pose, size) {
  const c = card, s = size;
  ctx.save(); ctx.scale(s, s); ctx.rotate(pose.spin || 0); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(c.stroke, 1.4 / s); const { seg, limb } = kit(ctx, lw);
  const B = c.body, re = pose.reach ?? 0.5;
  // bacaklar (hafif bükük, ağırlıksız duruş), kollar
  limb(-0.05, B.h / 2 - 0.02, -0.09, B.h / 2 + 0.17, c.limb + 0.01); limb(-0.09, B.h / 2 + 0.17, -0.04, B.h / 2 + 0.32, c.limb);
  limb(0.05, B.h / 2 - 0.02, 0.1, B.h / 2 + 0.16, c.limb + 0.01); limb(0.1, B.h / 2 + 0.16, 0.08, B.h / 2 + 0.31, c.limb);
  limb(-B.w / 2, -B.h / 2 + 0.06, -B.w / 2 - 0.12, -B.h / 2 + 0.06 + 0.12 - re * 0.2, c.limb);
  ctx.beginPath(); ctx.roundRect(-B.w / 2, -B.h / 2, B.w, B.h, 0.07); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-0.06, -0.06, 0.12, 0.09, 0.015); ctx.stroke(); for (let i = 0; i < 3; i++) seg(-0.04 + i * 0.04, -0.03, -0.04 + i * 0.04, 0.0, lw * 1.4);
  limb(B.w / 2, -B.h / 2 + 0.06, B.w / 2 + 0.13, -B.h / 2 + 0.06 + 0.1 - re * 0.22, c.limb);
  // kask: yuvarlak, vizör koyu, ışık yansıması kâğıt
  const hy = -B.h / 2 - c.helmet * 0.75;
  ctx.beginPath(); ctx.arc(0, hy, c.helmet, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.02, hy + 0.01, c.helmet * 0.72, c.helmet * 0.6, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-0.04, hy - 0.04, 0.03, 0.016, -0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  ctx.restore();
}

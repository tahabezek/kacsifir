// "Yolculuk" karakterleri: kıyı çamurçulluğu (Limosa lapponica) ve yürüyen adam (Karl Bushby).
// Her biri TEK çizim fonksiyonu + dondurulmuş karakter kartı. Önce iskelet (eklem/kanat açısı), sonra hacimler,
// en son türün ayrıntısı. Gravür dili: kâğıt dolgu, mürekkep kontur, gölge tarafında tarama.
// Birim: kuşta gaga ucundan kuyruk ucuna boy = 1; adamda ayakta boy = 1. Kök: kuşta gövde merkezi, adamda ayak tabanı.

const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;

export const GODWIT_CARD = Object.freeze({
  name: 'kıyı çamurçulluğu (genç)',
  body: { x: 0, y: 0, rx: 0.2, ry: 0.085 },
  head: { x: 0.25, y: -0.052, r: 0.05 },
  bill: { len: 0.25, up: 0.03, w: 0.017 },     // hafif yukarı kıvrık uzun gaga (türün imzası)
  tail: { x: -0.18, len: 0.11, w: 0.06, bars: 4 },
  // kanat planı (açıklık u, kiriş v; v + = ileri): uzun, sivri, uca doğru geriye süpürülmüş
  wing: { sx: 0.045, sy: -0.05, sweep: 0.42,
    plan: [[0, 0.06], [0.16, 0.06], [0.32, 0.02], [0.47, -0.07], [0.52, -0.13], [0.46, -0.14], [0.41, -0.115], [0.38, -0.15], [0.33, -0.125], [0.28, -0.155], [0.2, -0.14], [0.08, -0.15], [0, -0.13]] },
  flapDeg: [-50, 70],                            // aşağı / yukarı uç açıları
  stroke: 0.012,
  palette: { ink: INK, paper: PAPER, graphite: GRAPH },
});

// pose: { flap: -1..1 (−1 en aşağı, +1 en yukarı) }. size: boy (px). Yön +x.
// Kanat gövde ekseni etrafında döner: plan noktası (u, v) → ekran (sx + v − u·sweep, sy − u·sin a).
export function drawGodwit(ctx, card, pose, size) {
  const c = card, s = size, P = c.palette;
  const a = rad(c.flapDeg[0] + (c.flapDeg[1] - c.flapDeg[0]) * (pose.flap + 1) / 2);
  ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(c.stroke, 1.3 / s);
  ctx.lineWidth = lw; ctx.strokeStyle = P.ink;
  const W = c.wing;
  const wingPath = (k, dx, dy) => {
    ctx.beginPath();
    W.plan.forEach(([u, v], i) => { const x = W.sx + dx + v - u * k * W.sweep, y = W.sy + dy - u * k * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath();
  };
  // 1) arka kanat: gölgede, koyu
  wingPath(0.88, -0.02, -0.012); ctx.fillStyle = P.ink; ctx.fill();

  // 2) bacaklar: uçuşta geriye uzanır, kuyruğu biraz geçer
  ctx.beginPath(); ctx.moveTo(-0.04, 0.06); ctx.lineTo(-0.27, 0.06); ctx.lineTo(-0.31, 0.055);
  ctx.lineWidth = lw * 0.9; ctx.stroke(); ctx.lineWidth = lw;

  // 3) kuyruk: çizgili (bar-tailed) kama
  const T = c.tail;
  ctx.beginPath(); ctx.moveTo(T.x + 0.03, -T.w / 2); ctx.lineTo(T.x - T.len, -T.w * 0.22); ctx.lineTo(T.x - T.len, T.w * 0.3); ctx.lineTo(T.x + 0.03, T.w / 2); ctx.closePath();
  ctx.fillStyle = P.paper; ctx.fill(); ctx.stroke();
  for (let i = 1; i <= T.bars; i++) { const x = T.x - (T.len * i) / (T.bars + 1); ctx.beginPath(); ctx.moveTo(x, -T.w * 0.3); ctx.lineTo(x, T.w * 0.36); ctx.stroke(); }

  // 4) gövde + boyun + baş: tek siluet
  const B = c.body, Hd = c.head;
  const silhouette = () => {
    ctx.beginPath(); ctx.ellipse(B.x, B.y, B.rx, B.ry, -0.06, 0, Math.PI * 2);
    ctx.moveTo(B.rx * 0.55, -B.ry * 0.85);
    ctx.quadraticCurveTo(Hd.x - 0.05, Hd.y - Hd.r * 0.95, Hd.x, Hd.y - Hd.r);
    ctx.arc(Hd.x, Hd.y, Hd.r, -Math.PI / 2, Math.PI * 0.72);
    ctx.quadraticCurveTo(B.rx * 0.95, B.ry * 0.2, B.rx * 0.6, B.ry * 0.8); ctx.closePath();
  };
  silhouette(); ctx.fillStyle = P.paper; ctx.fill('nonzero');
  ctx.save(); silhouette(); ctx.clip('nonzero');
  ctx.strokeStyle = P.ink;
  // karın: yatay ince tarama (ışık sol üstten, alt taraf gölgede)
  ctx.lineWidth = lw * 0.5;
  for (let y = 0.012; y < B.ry + 0.02; y += 0.014) { ctx.beginPath(); ctx.moveTo(-B.rx, y + 0.01); ctx.lineTo(B.rx + 0.12, y); ctx.stroke(); }
  // sırt: benekli (genç kuşun pullu sırtı) — kısa çapraz çentikler
  ctx.lineWidth = lw * 0.6;
  for (let i = 0; i < 10; i++) { const x = -0.15 + i * 0.03, y = -0.055 + 0.006 * Math.sin(i * 2.3); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.014, y - 0.012); ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = lw; ctx.strokeStyle = P.ink;
  // dış kontur: gövde ve baş; boyun birleşimi çizgisiz
  ctx.beginPath(); ctx.ellipse(B.x, B.y, B.rx, B.ry, -0.06, Math.PI * 0.12 * -1 + Math.PI * 2 * 0, Math.PI * 1.86, false); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(B.rx * 0.55, -B.ry * 0.85); ctx.quadraticCurveTo(Hd.x - 0.05, Hd.y - Hd.r * 0.95, Hd.x, Hd.y - Hd.r);
  ctx.arc(Hd.x, Hd.y, Hd.r, -Math.PI / 2, Math.PI * 0.72); ctx.quadraticCurveTo(B.rx * 0.95, B.ry * 0.2, B.rx * 0.6, B.ry * 0.8); ctx.stroke();
  // göz
  ctx.beginPath(); ctx.arc(Hd.x + 0.014, Hd.y - 0.008, 0.01, 0, Math.PI * 2); ctx.fillStyle = P.ink; ctx.fill();
  // gaga: hafif yukarı kıvrık, uca doğru incelir
  const Bl = c.bill, gx = Hd.x + Hd.r * 0.92, gy = Hd.y + 0.006;
  ctx.beginPath(); ctx.moveTo(gx, gy - Bl.w / 2);
  ctx.quadraticCurveTo(gx + Bl.len * 0.6, gy - Bl.w * 0.3, gx + Bl.len, gy - Bl.up);
  ctx.quadraticCurveTo(gx + Bl.len * 0.6, gy + Bl.w * 0.35, gx, gy + Bl.w / 2); ctx.closePath();
  ctx.fillStyle = P.ink; ctx.fill();

  // 5) ön kanat: kâğıt dolgu, kontur, uç tüyleri; aşağı vuruşta alt yüz (gölge) taranır
  wingPath(1, 0, 0); ctx.fillStyle = P.paper; ctx.fill(); ctx.stroke();
  ctx.save(); wingPath(1, 0, 0); ctx.clip(); ctx.lineWidth = lw * 0.6;
  const under = Math.sin(a) < 0;
  for (let k = 0; k < 7; k++) {
    const u = 0.2 + k * 0.05, x0 = W.sx + 0.04 - u * W.sweep, y0 = W.sy - u * Math.sin(a);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - 0.2, y0 + 0.02 * Math.cos(a)); ctx.stroke();
  }
  if (under) for (let k = 0; k < 14; k++) { const v = -0.15 + k * 0.016; ctx.beginPath(); ctx.moveTo(W.sx + v - 0.6 * W.sweep, W.sy - 0.6 * Math.sin(a)); ctx.lineTo(W.sx + v, W.sy); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}

// küre üzerindeki küçük işaret: tepeden bakışta kuş silueti (çapraz kanat), yön +x
export function drawGodwitGlyph(ctx, size, flap) {
  const s = size, k = 0.55 + 0.45 * Math.abs(flap);
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = INK;
  ctx.beginPath(); ctx.ellipse(0, 0, 0.32, 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0.3, -0.01); ctx.lineTo(0.62, -0.03); ctx.lineTo(0.3, 0.02); ctx.fill();
  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0.1, 0); ctx.lineTo(-0.18, sg * 0.62 * k); ctx.lineTo(-0.12, 0); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-0.3, 0); ctx.lineTo(-0.48, -0.08); ctx.lineTo(-0.48, 0.08); ctx.closePath(); ctx.fill();
  ctx.restore();
}

export const WALKER_CARD = Object.freeze({
  name: 'yürüyen adam (eski asker, sakallı, şapkalı, sırt çantalı, el arabalı)',
  head: { r: 0.062, y: 0.9 },
  hip: 0.47, shoulder: 0.78, thigh: 0.23, shin: 0.235, upperArm: 0.15, foreArm: 0.14,
  pack: { w: 0.13, h: 0.24, dx: -0.115 },
  cart: { dx: -0.42, w: 0.26, h: 0.13, wheel: 0.075, handleY: 0.5 },
  stroke: 0.014,
  stride: 0.42,          // bir adım döngüsünde ilerleme (boy cinsinden)
  palette: { ink: INK, paper: PAPER, graphite: GRAPH },
});

// İki kemikli bacak: kalçadan ayağa açılar. phase 0..1 yürüme döngüsü (yer temasında ayak kaymaz: zemin aynı adım boyuyla kayar)
function legAngles(phase, side) {
  const p = (phase + (side > 0 ? 0 : 0.5)) % 1;
  const swing = p < 0.5;                       // 0..0.5 yerde (geri), 0.5..1 havada (ileri)
  const thigh = swing ? 24 - 48 * (p / 0.5) : -24 + 48 * ((p - 0.5) / 0.5);
  const knee = swing ? 4 : 8 + 50 * Math.sin(Math.PI * (p - 0.5) / 0.5);
  return { thigh, knee };
}

// pose: { mode: 'walk' | 'stand' | 'swim', phase: 0..1, cart: bool }. size: boy (px). Kök: ayak tabanı, yön +x.
export function drawWalker(ctx, card, pose, size) {
  const c = card, P = c.palette, s = size;
  ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(c.stroke, 1.4 / s);
  const seg = (x0, y0, x1, y1, w = lw) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  const limb = (x0, y0, x1, y1, w) => { ctx.strokeStyle = P.ink; seg(x0, y0, x1, y1, w + lw * 1.6); ctx.strokeStyle = P.paper; seg(x0, y0, x1, y1, w - lw * 0.2); ctx.strokeStyle = P.ink; };
  ctx.strokeStyle = P.ink;

  if (pose.mode === 'swim') {
    // serbest stil: gövde yatay, baş su üstünde, kollar karşılıklı kulaç
    const ph = pose.phase * Math.PI * 2;
    ctx.save(); ctx.translate(0, -0.04);
    const arm = (o, back) => {
      const ang = ph + o, x = Math.cos(ang) * 0.26, y = -Math.abs(Math.sin(ang)) * 0.16 * (Math.sin(ang) > 0 ? 1 : -0.35);
      if ((Math.sin(ang) < 0) !== back) return;
      limb(0.12, -0.02, 0.12 + x, y, 0.06);
    };
    arm(Math.PI, true);
    ctx.beginPath(); ctx.ellipse(-0.06, 0, 0.24, 0.065, 0, 0, Math.PI * 2); ctx.fillStyle = P.paper; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
    // bacak çırpması
    const kick = Math.sin(ph * 2) * 0.03;
    limb(-0.28, 0, -0.5, kick, 0.055); limb(-0.28, 0.01, -0.5, -kick + 0.01, 0.055);
    ctx.beginPath(); ctx.arc(0.22, -0.035, 0.06, 0, Math.PI * 2); ctx.fillStyle = P.paper; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0.22, -0.035, 0.06, Math.PI * 0.95, Math.PI * 1.85); ctx.fillStyle = P.ink; ctx.lineTo(0.22, -0.035); ctx.fill(); // bone
    arm(0, false);
    ctx.restore(); ctx.restore(); return;
  }

  const walking = pose.mode === 'walk';
  const ph = walking ? pose.phase : 0;
  const bob = walking ? Math.abs(Math.sin(ph * Math.PI * 2)) * 0.012 : 0;
  const hipY = -(c.hip - bob), shY = -(c.shoulder - bob), hipX = 0, shX = 0.03;

  // el arabası (adamın arkasında, sap kalçada beline bağlı): tek tekerlek dönmesi yürüyüşe bağlı
  if (pose.cart) {
    const C = c.cart, wx = C.dx, wy = -C.wheel;
    ctx.lineWidth = lw; ctx.strokeStyle = P.ink;
    seg(hipX - 0.03, hipY + 0.02, wx + C.w / 2, -C.wheel - C.h * 0.8, lw * 1.1);
    ctx.beginPath(); ctx.roundRect(wx - C.w / 2, -C.wheel - C.h - 0.03, C.w, C.h, 0.015); ctx.fillStyle = P.paper; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.roundRect(wx - C.w / 2, -C.wheel - C.h - 0.03, C.w, C.h, 0.015); ctx.clip();
    ctx.lineWidth = lw * 0.5; for (let x = wx - C.w / 2; x < wx + C.w / 2; x += 0.022) seg(x, -C.wheel - C.h - 0.03, x + 0.04, -C.wheel - 0.03, lw * 0.5);
    ctx.restore();
    ctx.beginPath(); ctx.arc(wx, wy, C.wheel, 0, Math.PI * 2); ctx.fillStyle = P.paper; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
    const rot = -ph * 2 * Math.PI * (c.stride / (2 * Math.PI * C.wheel));
    for (let k = 0; k < 3; k++) { const an = rot + (k * Math.PI) / 3; seg(wx + Math.cos(an) * C.wheel, wy + Math.sin(an) * C.wheel, wx - Math.cos(an) * C.wheel, wy - Math.sin(an) * C.wheel, lw * 0.6); }
  }

  // bacaklar (arkadaki önce)
  const leg = side => {
    const { thigh, knee } = walking ? legAngles(ph, side) : { thigh: side * 3, knee: 2 };
    const kx = hipX + Math.sin(rad(thigh)) * c.thigh, ky = hipY + Math.cos(rad(thigh)) * c.thigh;
    const fx = kx + Math.sin(rad(thigh - knee)) * c.shin, fy = ky + Math.cos(rad(thigh - knee)) * c.shin;
    limb(hipX, hipY, kx, ky, 0.055); limb(kx, ky, fx, fy, 0.05);
    ctx.beginPath(); ctx.ellipse(fx + 0.025, Math.min(fy, -0.012) + 0.0, 0.045, 0.018, 0, 0, Math.PI * 2); ctx.fillStyle = P.ink; ctx.fill();
  };
  const arm = side => {
    const sw = walking ? Math.sin((ph + (side > 0 ? 0.5 : 0)) * Math.PI * 2) * 26 : -4;
    const ex = shX + Math.sin(rad(sw)) * c.upperArm, ey = shY + Math.cos(rad(sw)) * c.upperArm;
    const hx = ex + Math.sin(rad(sw + 18)) * c.foreArm, hy = ey + Math.cos(rad(sw + 18)) * c.foreArm;
    limb(shX, shY, ex, ey, 0.045); limb(ex, ey, hx, hy, 0.042);
  };
  arm(-1); leg(-1);
  // sırt çantası
  ctx.beginPath(); ctx.roundRect(shX + c.pack.dx - c.pack.w / 2, shY - 0.03, c.pack.w, c.pack.h, 0.025); ctx.fillStyle = P.paper; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.save(); ctx.clip(); for (let y = shY; y < shY + c.pack.h; y += 0.02) seg(shX + c.pack.dx - c.pack.w / 2, y, shX + c.pack.dx + c.pack.w / 2, y + 0.012, lw * 0.5); ctx.restore();
  // gövde (ceket)
  ctx.beginPath(); ctx.moveTo(shX - 0.07, shY - 0.025); ctx.quadraticCurveTo(shX, shY - 0.05, shX + 0.075, shY - 0.02); ctx.lineTo(hipX + 0.07, hipY + 0.05); ctx.lineTo(hipX - 0.075, hipY + 0.05); ctx.closePath();
  ctx.fillStyle = P.paper; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  leg(1);
  // baş: sakal, geniş kenarlı şapka
  const hx = shX + 0.025, hy = -(c.head.y - bob);
  ctx.beginPath(); ctx.arc(hx, hy, c.head.r, 0, Math.PI * 2); ctx.fillStyle = P.paper; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx + c.head.r * 0.9, hy + c.head.r * 0.35); ctx.quadraticCurveTo(hx + c.head.r * 0.55, hy + c.head.r * 1.5, hx - c.head.r * 0.35, hy + c.head.r * 0.9);
  ctx.quadraticCurveTo(hx + c.head.r * 0.1, hy + c.head.r * 0.55, hx + c.head.r * 0.9, hy + c.head.r * 0.35); ctx.closePath(); ctx.fillStyle = P.ink; ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + c.head.r * 0.95, hy - c.head.r * 0.1); ctx.lineTo(hx + c.head.r * 1.25, hy + c.head.r * 0.2); ctx.lineTo(hx + c.head.r * 0.92, hy + c.head.r * 0.3); ctx.lineWidth = lw * 0.8; ctx.stroke();
  ctx.beginPath(); ctx.arc(hx + c.head.r * 0.45, hy - c.head.r * 0.12, 0.008, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx - c.head.r * 1.8, hy - c.head.r * 0.55); ctx.lineTo(hx + c.head.r * 1.8, hy - c.head.r * 0.55); ctx.lineWidth = lw * 1.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx - c.head.r * 0.95, hy - c.head.r * 0.55); ctx.quadraticCurveTo(hx - c.head.r * 0.9, hy - c.head.r * 1.6, hx, hy - c.head.r * 1.55);
  ctx.quadraticCurveTo(hx + c.head.r * 0.9, hy - c.head.r * 1.6, hx + c.head.r * 0.95, hy - c.head.r * 0.55); ctx.closePath(); ctx.fillStyle = P.ink; ctx.fill();
  arm(1);
  ctx.restore();
}

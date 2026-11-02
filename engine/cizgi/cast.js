// Kadro: tek çizim fonksiyonu, dondurulmuş karakter kartları.
//   drawCharacter(ctx, card, pose, t)
// Sıra: iskelet (eklemler, ileri kinematik) → hacimler (gövde, uzuvlar, baş) → tuhaflık (saç, bıyık, gözlük, eşya).
// Birim: baş yüksekliği = 1 (U). pose.s = 1 U'nun piksel karşılığı. Kök: iki ayağın ortasında zemin noktası.
// Açılar derece; 0 = dümdüz aşağı. Yan görünüşte + = ileri (bakış yönü). Önden görünüşte kollar/bacaklar için
// + = gövdeden dışarı.
import { mulberry32 } from '../core.js';

export const INK = '#1F2421';
const D = Math.PI / 180;

// ——— karakter kartları (DONDURULMUŞ: oran, palet, çizgi, siluet buradan değişir, sahnede değişmez) ———
export const CARDS = {
  sen: {
    key: 'sen', name: 'Sen', role: 'dışarıdaki beden (izleyicinin yerine)', seed: 11,
    head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.06,
    torso: { len: 0.8, shoulder: 0.64, hip: 0.56, depth: 0.42, belly: 0, color: '#E8A33D', shade: '#C8852A' },
    arm: { upper: 0.38, lower: 0.36, w: 0.2, color: '#E8A33D', shade: '#C8852A', hand: 0.13 },
    leg: { upper: 0.38, lower: 0.36, w: 0.22, color: '#3F4A57', shade: '#2E3740' },
    shoe: { color: '#262626', len: 0.3, h: 0.12 },
    skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#3B2A20',
    eyes: { gap: 0.36, w: 0.2, h: 0.24, y: 0.02 }, line: 0.05, idle: { blink: [2.5, 5.5] },
    features: ['hoodie', 'hairMessy'],
  },
  mudur: {
    key: 'mudur', name: 'Müdür Bey', role: 'karar masası (ön beyin)', seed: 23,
    head: { w: 0.82, h: 1.06, ear: 0.12 }, neck: 0.1,
    torso: { len: 1.04, shoulder: 0.76, hip: 0.5, depth: 0.4, belly: 0, color: '#6A4C38', shade: '#523A2B' },
    arm: { upper: 0.5, lower: 0.47, w: 0.17, color: '#6A4C38', shade: '#523A2B', hand: 0.12 },
    leg: { upper: 0.5, lower: 0.48, w: 0.18, color: '#5C4231', shade: '#463224' },
    shoe: { color: '#2A1E17', len: 0.34, h: 0.11 },
    skin: '#E9B98F', skinShade: '#D29E74', hair: '#9A9590',
    eyes: { gap: 0.3, w: 0.17, h: 0.2, y: 0.04, lid: 0.32 }, line: 0.05, idle: { blink: [3, 6] },
    features: ['suit', 'tie', 'baldSides', 'mustacheThick', 'glassesRect'],
  },
  nevin: {
    key: 'nevin', name: 'Nevin Hanım', role: 'arşiv (hafıza)', seed: 37,
    head: { w: 1, h: 1, ear: 0.12 }, neck: 0.04,
    torso: { len: 0.86, shoulder: 0.7, hip: 0.86, depth: 0.55, belly: 0.1, color: '#9B5B6B', shade: '#7E4655' },
    arm: { upper: 0.36, lower: 0.34, w: 0.21, color: '#9B5B6B', shade: '#7E4655', hand: 0.13 },
    leg: { upper: 0.28, lower: 0.28, w: 0.2, color: '#4D4A5C', shade: '#3B3948' },
    shoe: { color: '#5A2E2A', len: 0.27, h: 0.11 },
    skin: '#F0C3A0', skinShade: '#D9A683', hair: '#B9B4AE',
    eyes: { gap: 0.36, w: 0.18, h: 0.21, y: 0.03 }, line: 0.05, idle: { blink: [2.8, 5] },
    features: ['cardigan', 'skirt', 'bun', 'glassesCat'],
  },
  cevdet: {
    key: 'cevdet', name: 'Zilci Cevdet', role: 'alarm (amigdala)', seed: 41,
    head: { w: 1.02, h: 1, ear: 0.15 }, neck: 0.03,
    torso: { len: 0.62, shoulder: 0.6, hip: 0.5, depth: 0.4, belly: 0, color: '#D8572A', shade: '#B4431D' },
    arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#F1EDE2', shade: '#D6D0C2', hand: 0.12 },
    leg: { upper: 0.27, lower: 0.26, w: 0.18, color: '#3B3F47', shade: '#2B2E34' },
    shoe: { color: '#1E1E1E', len: 0.27, h: 0.11 },
    skin: '#E7B48A', skinShade: '#CF9A70', hair: '#2A211C',
    eyes: { gap: 0.38, w: 0.23, h: 0.29, y: 0.0 }, line: 0.05, idle: { blink: [2, 4] },
    features: ['vest', 'hairSpiky'], stance: { knee: 14 },
  },
  riza: {
    key: 'riza', name: 'Çaycı Rıza', role: 'ödül servisi (dopamin)', seed: 53,
    head: { w: 0.88, h: 1, ear: 0.12 }, neck: 0.08,
    torso: { len: 0.9, shoulder: 0.6, hip: 0.48, depth: 0.36, belly: 0, color: '#F4F1EA', shade: '#D9D4C8' },
    arm: { upper: 0.44, lower: 0.42, w: 0.15, color: '#F4F1EA', shade: '#D9D4C8', hand: 0.115 },
    leg: { upper: 0.45, lower: 0.43, w: 0.16, color: '#2F3338', shade: '#22252A' },
    shoe: { color: '#1A1A1A', len: 0.3, h: 0.1 },
    skin: '#D9A27A', skinShade: '#C08760', hair: '#1E1A17',
    eyes: { gap: 0.32, w: 0.17, h: 0.21, y: 0.03 }, line: 0.05, idle: { blink: [2.5, 5] },
    features: ['jacket', 'hairSlick', 'mustacheThin'],
  },
};

// ——— ifadeler (6 temel; poz kâğıdında hepsi görünür) ———
// brow: kaş yüksekliği (U), browTilt: iç uç aşağı (+) / yukarı (−), eye: göz açıklığı çarpanı,
// pupil: göz bebeği çarpanı, curve: ağız eğrisi (+ gülüş), open: ağız açıklığı, w: ağız genişliği
export const EXPR = {
  notr:   { brow: 0, browTilt: 0, eye: 1, pupil: 1, curve: 0.12, open: 0, w: 1 },
  mutlu:  { brow: 0.03, browTilt: -0.1, eye: 0.7, pupil: 1, curve: 0.75, open: 0.35, w: 1.25, smileEyes: true },
  saskin: { brow: 0.09, browTilt: -0.05, eye: 1.3, pupil: 0.7, curve: 0, open: 0.75, w: 0.55, round: true },
  korku:  { brow: 0.07, browTilt: -0.6, eye: 1.25, pupil: 0.6, curve: -0.45, open: 0.35, w: 1.2 },
  yorgun: { brow: -0.02, browTilt: 0.05, eye: 0.42, pupil: 1, curve: -0.12, open: 0, w: 0.9 },
  kizgin: { brow: -0.03, browTilt: 0.65, eye: 0.85, pupil: 0.9, curve: -0.5, open: 0.15, w: 1.05 },
};
export const EXPR_NAMES = { notr: 'nötr', mutlu: 'mutlu', saskin: 'şaşkın', korku: 'korku', yorgun: 'yorgun', kizgin: 'kızgın' };

export function mixExpr(a, b, u) {
  const A = typeof a === 'string' ? EXPR[a] : a, B = typeof b === 'string' ? EXPR[b] : b;
  const o = {};
  for (const k of Object.keys(EXPR.notr)) o[k] = A[k] + (B[k] - A[k]) * u;
  o.smileEyes = u < 0.5 ? A.smileEyes : B.smileEyes;
  o.round = u < 0.5 ? A.round : B.round;
  return o;
}

// ——— göz kırpma: tohumlu aralıklar, t'nin saf fonksiyonu ———
export function blinkAt(card, t, seedOff = 0) {
  const r = mulberry32(card.seed * 977 + seedOff);
  const [a, b] = card.idle.blink;
  let s = 0.6 + r() * a;
  while (s < t + 0.2) {
    const d = t - s;
    if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
    s += a + r() * (b - a);
  }
  return 0;
}

// ——— hazır pozlar ———
export function basePose(card, view = 'front') {
  const k = card.stance?.knee || 0;
  return {
    view, x: 0, y: 0, s: 100, facing: 1, lean: 0, bob: 0,
    head: { tilt: 0, look: [0, 0] },
    armL: view === 'front' ? { sh: 8, el: -4 } : { sh: -4, el: 8 },
    armR: view === 'front' ? { sh: 8, el: -4 } : { sh: 6, el: 10 },
    legL: view === 'front' ? { hip: 3, knee: k } : { hip: k * 0.5, knee: k },
    legR: view === 'front' ? { hip: 3, knee: k } : { hip: k * 0.5, knee: k },
    expr: 'notr', talk: 0, blink: null, props: {},
  };
}

// Yürüme döngüsü (yan görünüş): faz 0..1, 8 kare = 0, 1/8, ...
export function walkPose(card, phase, base) {
  const p = structuredClone(base || basePose(card, 'side'));
  const a = phase * Math.PI * 2;
  const k = card.stance?.knee || 0;
  const swing = 24;
  // bacak: kalça salınımı ±24°, diz salınım bacağında bükülür
  const leg = (ph) => {
    const hip = Math.sin(ph) * swing + k * 0.5;
    const knee = k + Math.max(0, Math.sin(ph + Math.PI * 0.55)) * 38 + 4;
    return { hip, knee };
  };
  p.legL = leg(a); p.legR = leg(a + Math.PI);
  p.armL = { sh: -Math.sin(a) * 20, el: 12 + Math.max(0, -Math.sin(a)) * 14 };
  p.armR = { sh: Math.sin(a) * 20, el: 12 + Math.max(0, Math.sin(a)) * 14 };
  p.bob = -Math.abs(Math.cos(a)) * 0.035 + 0.035;
  p.lean = 4;
  return p;
}

// ——— iskelet: ileri kinematik ———
function rot(len, ang) { return [Math.sin(ang * D) * len, Math.cos(ang * D) * len]; }

export function skeleton(card, pose) {
  const c = card, side = pose.view === 'side';
  // bacak ucu (ayak bileği) göreli konumu
  const legVec = (L, mirror) => {
    if (side) {
      const t = rot(c.leg.upper, L.hip), sh = rot(c.leg.lower, L.hip - L.knee);
      return { knee: t, ankle: [t[0] + sh[0], t[1] + sh[1]] };
    }
    // önden: diz bükümü kısalma olarak görünür
    const up = c.leg.upper * Math.cos(L.knee * 0.5 * D), lo = c.leg.lower * Math.cos(L.knee * 0.5 * D);
    const t = rot(up, mirror * L.hip), sh = rot(lo, mirror * L.hip * 0.6);
    return { knee: t, ankle: [t[0] + sh[0], t[1] + sh[1]] };
  };
  const lv = legVec(pose.legL, -1), rv = legVec(pose.legR, 1);
  const footH = c.shoe.h * 0.75;
  const pelvisH = Math.max(lv.ankle[1], rv.ankle[1]) + footH;
  const pelvis = [0, -pelvisH - (pose.bob || 0)];
  const hipOff = side ? 0 : c.torso.hip * 0.28;
  const hipL = [pelvis[0] - hipOff, pelvis[1]], hipR = [pelvis[0] + hipOff, pelvis[1]];
  const lean = pose.lean || 0;
  const up = (len, extra = 0) => { const v = rot(len, lean + extra); return [v[0], -v[1]]; };
  const chestV = up(c.torso.len);
  const neck = [pelvis[0] + chestV[0], pelvis[1] + chestV[1]];
  const shOff = side ? 0 : c.torso.shoulder * 0.42;
  const shY = neck[1] + 0.1;
  const shL = [neck[0] - shOff, shY], shR = [neck[0] + shOff, shY];
  const armVec = (A, mirror) => {
    if (side) {
      const u = rot(c.arm.upper, A.sh + lean), l = rot(c.arm.lower, A.sh + A.el + lean);
      return { el: u, hand: [u[0] + l[0], u[1] + l[1]] };
    }
    const u = rot(c.arm.upper, mirror * A.sh), l = rot(c.arm.lower, mirror * (A.sh + A.el));
    return { el: u, hand: [u[0] + l[0], u[1] + l[1]] };
  };
  const al = armVec(pose.armL, -1), ar = armVec(pose.armR, 1);
  const headUp = up(c.neck + c.head.h * 0.5, (pose.head.tilt || 0) * 0.3);
  const head = [neck[0] + headUp[0], neck[1] + headUp[1]];
  return {
    pelvis, neck, head,
    hipL, kneeL: [hipL[0] + lv.knee[0], hipL[1] + lv.knee[1]], ankleL: [hipL[0] + lv.ankle[0], hipL[1] + lv.ankle[1]],
    hipR, kneeR: [hipR[0] + rv.knee[0], hipR[1] + rv.knee[1]], ankleR: [hipR[0] + rv.ankle[0], hipR[1] + rv.ankle[1]],
    shL, elL: [shL[0] + al.el[0], shL[1] + al.el[1]], handL: [shL[0] + al.hand[0], shL[1] + al.hand[1]],
    shR, elR: [shR[0] + ar.el[0], shR[1] + ar.el[1]], handR: [shR[0] + ar.hand[0], shR[1] + ar.hand[1]],
  };
}

// ——— yardımcı çizim ———
function limb(ctx, pts, w, color, lw) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p);
  ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 2; ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
}
function blob(ctx, x, y, rx, ry, fill, lw, a = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
}
function fillStroke(ctx, fill, lw) { ctx.fillStyle = fill; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); } }

// ——— ana fonksiyon ———
export function drawCharacter(ctx, card, pose, t = 0) {
  const c = card, side = pose.view === 'side';
  const sk = skeleton(c, pose);
  const lw = c.line;
  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.scale(pose.s * (side ? pose.facing : 1), pose.s);

  // gölge
  ctx.beginPath(); ctx.ellipse(0, 0, c.torso.hip * 0.75 + 0.1, 0.07, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(31,36,33,0.16)'; ctx.fill();

  if (side) drawSide(ctx, c, pose, sk, lw, t); else drawFront(ctx, c, pose, sk, lw, t);
  ctx.restore();
  return sk;
}

function shoe(ctx, c, ankle, lw, side, dir = 1, shade = false) {
  const L = c.shoe.len, h = c.shoe.h;
  ctx.beginPath();
  if (side) {
    const [x, y] = ankle;
    ctx.moveTo(x - L * 0.3, y - h * 0.2);
    ctx.quadraticCurveTo(x - L * 0.32, y + h * 0.75, x - L * 0.1, y + h * 0.75);
    ctx.lineTo(x + L * 0.62, y + h * 0.75);
    ctx.quadraticCurveTo(x + L * 0.78, y + h * 0.7, x + L * 0.7, y + h * 0.15);
    ctx.quadraticCurveTo(x + L * 0.4, y - h * 0.45, x - L * 0.3, y - h * 0.2);
  } else {
    const [x, y] = ankle;
    ctx.ellipse(x + dir * L * 0.08, y + h * 0.3, L * 0.38, h * 0.55, 0, 0, Math.PI * 2);
  }
  fillStroke(ctx, shade ? shadeOf(c.shoe.color) : c.shoe.color, lw);
}
const shadeOf = hex => {
  const n = parseInt(hex.slice(1), 16), f = 0.82;
  return `rgb(${Math.round((n >> 16) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`;
};

function hand(ctx, c, p, lw, shade, skinShade) {
  blob(ctx, p[0], p[1], c.arm.hand, c.arm.hand, shade ? c.skinShade : c.skin, lw);
}

// Gövde (önden): omuzdan kalçaya yuvarlatılmış yamuk, karın şişkinliği
function torsoFront(ctx, c, sk, lw) {
  const T = c.torso, n = sk.neck, p = sk.pelvis;
  const sw = T.shoulder / 2, hw = T.hip / 2, b = T.belly;
  const top = n[1] + 0.02, bot = p[1] + 0.12;
  const dx = n[0] - p[0];
  ctx.beginPath();
  ctx.moveTo(n[0] - sw + 0.06, top);
  ctx.quadraticCurveTo(n[0], top - 0.05, n[0] + sw - 0.06, top);
  ctx.quadraticCurveTo(n[0] + sw + 0.02, top + 0.02, n[0] + sw, top + 0.14);
  ctx.bezierCurveTo(n[0] + sw + b, (top + bot) / 2, p[0] + hw + b * 1.4 + dx * 0.2, bot - 0.2, p[0] + hw, bot);
  ctx.quadraticCurveTo(p[0], bot + 0.06, p[0] - hw, bot);
  ctx.bezierCurveTo(p[0] - hw - b * 1.4 + dx * 0.2, bot - 0.2, n[0] - sw - b, (top + bot) / 2, n[0] - sw, top + 0.14);
  ctx.quadraticCurveTo(n[0] - sw - 0.02, top + 0.02, n[0] - sw + 0.06, top);
  fillStroke(ctx, T.color, lw);
  return { top, bot, sw, hw };
}

function torsoSide(ctx, c, sk, lw) {
  const T = c.torso, n = sk.neck, p = sk.pelvis, d = T.depth / 2, b = T.belly;
  const top = n[1] + 0.02, bot = p[1] + 0.12;
  ctx.beginPath();
  ctx.moveTo(n[0] - d * 0.7, top + 0.02);
  ctx.quadraticCurveTo(n[0], top - 0.06, n[0] + d * 0.8, top + 0.04);
  ctx.bezierCurveTo(n[0] + d + 0.02, top + 0.25, p[0] + d + b * 1.6, bot - 0.25, p[0] + d * 0.9, bot);
  ctx.quadraticCurveTo(p[0], bot + 0.06, p[0] - d * 0.95, bot);
  ctx.bezierCurveTo(p[0] - d - b * 0.6, bot - 0.3, n[0] - d - 0.03, top + 0.3, n[0] - d * 0.7, top + 0.02);
  fillStroke(ctx, T.color, lw);
  return { top, bot, d };
}

function drawFront(ctx, c, pose, sk, lw, t) {
  const f = c.features;
  // arka saç (topuz vb.)
  // bacaklar
  limb(ctx, [sk.hipL, sk.kneeL, sk.ankleL], c.leg.w, c.leg.color, lw);
  limb(ctx, [sk.hipR, sk.kneeR, sk.ankleR], c.leg.w, c.leg.color, lw);
  shoe(ctx, c, sk.ankleL, lw, false, -1); shoe(ctx, c, sk.ankleR, lw, false, 1);
  if (f.includes('skirt')) {
    const p = sk.pelvis, hw = c.torso.hip / 2 + 0.04;
    ctx.beginPath();
    ctx.moveTo(p[0] - hw + 0.02, p[1] - 0.05); ctx.lineTo(p[0] + hw - 0.02, p[1] - 0.05);
    ctx.lineTo(p[0] + hw + 0.06, p[1] + 0.34); ctx.quadraticCurveTo(p[0], p[1] + 0.39, p[0] - hw - 0.06, p[1] + 0.34);
    ctx.closePath(); fillStroke(ctx, c.leg.color, lw);
  }
  // boyun
  limb(ctx, [[sk.neck[0], sk.neck[1] + 0.06], [sk.head[0], sk.head[1] + c.head.h * 0.3]], 0.2, c.skin, lw);
  const tb = torsoFront(ctx, c, sk, lw);
  clothesFront(ctx, c, sk, tb, lw);
  // kollar (gövdenin önünde)
  limb(ctx, [sk.shL, sk.elL, sk.handL], c.arm.w, c.arm.color, lw);
  limb(ctx, [sk.shR, sk.elR, sk.handR], c.arm.w, c.arm.color, lw);
  if (f.includes('vest') || f.includes('jacket') && false) {}
  hand(ctx, c, sk.handL, lw); hand(ctx, c, sk.handR, lw);
  propsAt(ctx, c, pose, sk, lw, t);
  headFront(ctx, c, pose, sk.head, lw, t);
}

function drawSide(ctx, c, pose, sk, lw, t) {
  const f = c.features;
  // uzak kol ve bacak (gölge tonda)
  limb(ctx, [sk.shL, sk.elL, sk.handL], c.arm.w, c.arm.shade, lw);
  hand(ctx, c, sk.handL, lw, true);
  limb(ctx, [sk.hipL, sk.kneeL, sk.ankleL], c.leg.w, c.leg.shade, lw);
  shoe(ctx, c, sk.ankleL, lw, true, 1, true);
  limb(ctx, [sk.hipR, sk.kneeR, sk.ankleR], c.leg.w, c.leg.color, lw);
  shoe(ctx, c, sk.ankleR, lw, true, 1);
  if (f.includes('skirt')) {
    const p = sk.pelvis, d = c.torso.depth / 2 + 0.06;
    ctx.beginPath();
    ctx.moveTo(p[0] - d, p[1] - 0.05); ctx.lineTo(p[0] + d, p[1] - 0.05);
    ctx.lineTo(p[0] + d + 0.08, p[1] + 0.34); ctx.quadraticCurveTo(p[0], p[1] + 0.38, p[0] - d - 0.06, p[1] + 0.34);
    ctx.closePath(); fillStroke(ctx, c.leg.color, lw);
  }
  limb(ctx, [[sk.neck[0], sk.neck[1] + 0.06], [sk.head[0] - 0.04, sk.head[1] + c.head.h * 0.3]], 0.19, c.skin, lw);
  const tb = torsoSide(ctx, c, sk, lw);
  clothesSide(ctx, c, sk, tb, lw);
  propsAt(ctx, c, pose, sk, lw, t, 'far');
  headSide(ctx, c, pose, sk.head, lw, t);
  // yakın kol (en önde)
  limb(ctx, [sk.shR, sk.elR, sk.handR], c.arm.w, c.arm.color, lw);
  hand(ctx, c, sk.handR, lw);
  propsAt(ctx, c, pose, sk, lw, t, 'near');
}

// ——— kıyafet ayrıntıları ———
function clothesFront(ctx, c, sk, tb, lw) {
  const f = c.features, n = sk.neck, p = sk.pelvis;
  ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  if (f.includes('hoodie')) {
    // kapüşon yakası ve cep
    ctx.beginPath(); ctx.moveTo(n[0] - 0.2, tb.top + 0.02); ctx.quadraticCurveTo(n[0], tb.top + 0.22, n[0] + 0.2, tb.top + 0.02); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(n[0] - 0.05, tb.top + 0.14); ctx.lineTo(n[0] - 0.06, tb.top + 0.3); ctx.moveTo(n[0] + 0.05, tb.top + 0.14); ctx.lineTo(n[0] + 0.06, tb.top + 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p[0] - 0.16, tb.bot - 0.26); ctx.lineTo(p[0] + 0.16, tb.bot - 0.26); ctx.lineTo(p[0] + 0.22, tb.bot - 0.08); ctx.lineTo(p[0] - 0.22, tb.bot - 0.08); ctx.closePath();
    ctx.fillStyle = c.torso.shade; ctx.fill(); ctx.stroke();
  }
  if (f.includes('suit')) {
    // gömlek V'si, kravat, ceket yakası ve düğme
    ctx.beginPath(); ctx.moveTo(n[0] - 0.16, tb.top + 0.01); ctx.lineTo(n[0], tb.top + 0.36); ctx.lineTo(n[0] + 0.16, tb.top + 0.01); ctx.closePath();
    ctx.fillStyle = '#F1EDE2'; ctx.fill(); ctx.stroke();
    if (f.includes('tie')) {
      ctx.beginPath(); ctx.moveTo(n[0] - 0.035, tb.top + 0.04); ctx.lineTo(n[0] + 0.035, tb.top + 0.04); ctx.lineTo(n[0] + 0.06, tb.top + 0.42);
      ctx.lineTo(n[0], tb.top + 0.5); ctx.lineTo(n[0] - 0.06, tb.top + 0.42); ctx.closePath(); ctx.fillStyle = '#B23A2E'; ctx.fill(); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(n[0] - 0.17, tb.top); ctx.lineTo(n[0] - 0.04, tb.top + 0.5); ctx.moveTo(n[0] + 0.17, tb.top); ctx.lineTo(n[0] + 0.04, tb.top + 0.5); ctx.stroke();
    blob(ctx, n[0] + 0.02, tb.top + 0.62, 0.025, 0.025, INK, 0);
  }
  if (f.includes('cardigan')) {
    ctx.beginPath(); ctx.moveTo(n[0] - 0.13, tb.top + 0.01); ctx.quadraticCurveTo(n[0], tb.top + 0.16, n[0] + 0.13, tb.top + 0.01); ctx.closePath();
    ctx.fillStyle = '#F1EDE2'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(n[0], tb.top + 0.1); ctx.lineTo(p[0], tb.bot); ctx.stroke();
    for (let i = 0; i < 3; i++) blob(ctx, n[0] + (p[0] - n[0]) * (0.3 + i * 0.22) + 0.04, tb.top + 0.25 + i * 0.18, 0.022, 0.022, '#F1EDE2', lw * 0.5);
  }
  if (f.includes('vest')) {
    // yelek: kolsuz, altında beyaz gömlek omuzlarda görünür; göğüste düdük kordonu
    ctx.beginPath(); ctx.moveTo(n[0] - 0.12, tb.top + 0.01); ctx.lineTo(n[0], tb.top + 0.2); ctx.lineTo(n[0] + 0.12, tb.top + 0.01); ctx.closePath();
    ctx.fillStyle = '#F1EDE2'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p[0] - 0.24, tb.bot - 0.16); ctx.lineTo(p[0] + 0.24, tb.bot - 0.16); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = '#F2D14B'; ctx.stroke();
    ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK;
  }
  if (f.includes('jacket')) {
    ctx.beginPath(); ctx.moveTo(n[0] - 0.11, tb.top + 0.01); ctx.lineTo(n[0], tb.top + 0.18); ctx.lineTo(n[0] + 0.11, tb.top + 0.01); ctx.closePath();
    ctx.fillStyle = '#2F3338'; ctx.fill(); ctx.stroke();
    // papyon
    ctx.beginPath(); ctx.moveTo(n[0], tb.top + 0.05); ctx.lineTo(n[0] - 0.08, tb.top + 0.0); ctx.lineTo(n[0] - 0.08, tb.top + 0.1); ctx.closePath();
    ctx.moveTo(n[0], tb.top + 0.05); ctx.lineTo(n[0] + 0.08, tb.top + 0.0); ctx.lineTo(n[0] + 0.08, tb.top + 0.1); ctx.closePath();
    ctx.fillStyle = '#B23A2E'; ctx.fill(); ctx.stroke();
    for (let i = 0; i < 3; i++) blob(ctx, n[0] + (p[0] - n[0]) * (0.35 + i * 0.22), tb.top + 0.3 + i * 0.17, 0.022, 0.022, '#C9A64A', lw * 0.5);
  }
}
function clothesSide(ctx, c, sk, tb, lw) {
  const f = c.features, n = sk.neck;
  ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK;
  if (f.includes('suit') && f.includes('tie')) {
    ctx.beginPath(); ctx.moveTo(n[0] + tb.d * 0.75, tb.top + 0.06); ctx.lineTo(n[0] + tb.d + 0.03, tb.top + 0.42); ctx.lineTo(n[0] + tb.d * 0.86, tb.top + 0.46); ctx.closePath();
    ctx.fillStyle = '#B23A2E'; ctx.fill(); ctx.stroke();
  }
  if (f.includes('hoodie')) {
    ctx.beginPath(); ctx.moveTo(n[0] - tb.d * 0.75, tb.top + 0.04); ctx.quadraticCurveTo(n[0] - tb.d - 0.12, tb.top - 0.1, n[0] - tb.d * 0.5, tb.top - 0.2);
    ctx.lineTo(n[0] - tb.d * 0.2, tb.top + 0.04); ctx.closePath(); ctx.fillStyle = c.torso.shade; ctx.fill(); ctx.stroke();
  }
  if (f.includes('vest')) {
    ctx.beginPath(); ctx.moveTo(sk.pelvis[0] - tb.d, tb.bot - 0.16); ctx.lineTo(sk.pelvis[0] + tb.d, tb.bot - 0.16); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = '#F2D14B'; ctx.stroke();
  }
}

// ——— baş (önden) ———
function eyesFront(ctx, c, ex, hx, hy, look, blink, lw) {
  const E = c.eyes, open = Math.max(0.06, ex.eye * (1 - blink));
  for (const sgn of [-1, 1]) {
    const x = hx + sgn * E.gap / 2, y = hy + E.y;
    const w = E.w / 2 * Math.min(1.15, Math.max(0.9, ex.eye)), h = E.h / 2 * Math.min(1.3, Math.max(1, ex.eye));
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); ctx.fillStyle = '#FBF8F1'; ctx.fill();
    ctx.clip();
    // göz bebeği
    blob(ctx, x + look[0] * w * 0.45, y + look[1] * h * 0.4 + 0.01, w * 0.55 * ex.pupil, h * 0.5 * ex.pupil, INK, 0);
    blob(ctx, x + look[0] * w * 0.45 - w * 0.18, y + look[1] * h * 0.4 - h * 0.18, w * 0.13, w * 0.13, '#FBF8F1', 0);
    // üst kapak (yorgunluk / kırpma)
    const lid = (c.eyes.lid || 0) * (ex.eye < 1 ? 1 : 0.5);
    const cover = Math.min(1, Math.max(0, 1 - open + lid * 0.6));
    if (cover > 0) { ctx.fillStyle = c.skin; ctx.fillRect(x - w - 0.02, y - h - 0.02, w * 2 + 0.04, (h * 2 + 0.04) * cover); }
    // gülen göz: alt kapak yukarı kıvrılır
    if (ex.smileEyes) { ctx.beginPath(); ctx.ellipse(x, y + h * 1.25, w * 1.3, h * 0.85, 0, 0, Math.PI * 2); ctx.fillStyle = c.skin; ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = INK; ctx.stroke();
    if (cover > 0.02) {
      const ly = y - h + (h * 2) * cover;
      ctx.beginPath(); ctx.moveTo(x - w * 0.98, ly); ctx.quadraticCurveTo(x, ly + 0.012, x + w * 0.98, ly); ctx.lineWidth = lw * 0.8; ctx.stroke();
    }
    // kaş
    const by = y - h - 0.07 - ex.brow, tilt = ex.browTilt * 0.06;
    ctx.beginPath(); ctx.moveTo(x - sgn * w * 1.1 * -1 * -1 - (sgn > 0 ? w * 1.1 : -w * 1.1) * 0, by);
    const inner = x - sgn * w * 0.9, outer = x + sgn * w * 1.1;
    ctx.beginPath(); ctx.moveTo(inner, by + tilt); ctx.quadraticCurveTo(x, by - 0.03, outer, by - tilt * 0.4);
    ctx.lineWidth = lw * 1.2; ctx.lineCap = 'round'; ctx.stroke();
  }
}

function mouthAt(ctx, c, ex, x, y, talk, lw, scale = 1) {
  const w = 0.14 * ex.w * scale, open = Math.min(1, ex.open + talk * 0.5);
  ctx.lineWidth = lw * 0.9; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (open < 0.04) {
    ctx.beginPath(); ctx.moveTo(x - w, y - ex.curve * 0.03); ctx.quadraticCurveTo(x, y + ex.curve * 0.07, x + w, y - ex.curve * 0.03); ctx.stroke();
    return;
  }
  const h = open * 0.15 * scale;
  ctx.beginPath();
  if (ex.round) {
    ctx.ellipse(x, y + h * 0.3, w * 0.8 + open * 0.02, h * 0.75, 0, 0, Math.PI * 2);
  } else {
    ctx.moveTo(x - w, y - ex.curve * 0.03);
    ctx.quadraticCurveTo(x, y - ex.curve * 0.02 + 0.01, x + w, y - ex.curve * 0.03);
    ctx.quadraticCurveTo(x, y + h + ex.curve * 0.06, x - w, y - ex.curve * 0.03);
  }
  ctx.fillStyle = '#5B2422'; ctx.fill(); ctx.stroke();
  // dil
  ctx.save(); ctx.clip();
  blob(ctx, x, y + h * 0.9, w * 0.55, h * 0.45, '#C9564F', 0);
  ctx.restore();
}

function headFront(ctx, c, pose, [hx, hy], lw, t) {
  const H = c.head, f = c.features, ex = typeof pose.expr === 'string' ? EXPR[pose.expr] : pose.expr;
  const blink = pose.blink ?? blinkAt(c, t);
  const tilt = (pose.head.tilt || 0) * D;
  const look = pose.head.look || [0, 0];
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(tilt);
  const w = H.w / 2, h = H.h / 2;
  // arka saç
  if (f.includes('bun')) { blob(ctx, 0, -h * 1.02, 0.2, 0.17, c.hair, lw); ctx.beginPath(); ctx.moveTo(0.06, -h - 0.22); ctx.lineTo(0.2, -h - 0.02); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = '#E2B13C'; ctx.stroke(); }
  // kulaklar
  for (const s of [-1, 1]) blob(ctx, s * w * 0.98, 0.04, H.ear, H.ear * 1.2, c.skin, lw);
  // kafa (hafif çene)
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.bezierCurveTo(w * 1.12, -h, w * 1.04, h * 0.55, w * 0.55, h * 0.9);
  ctx.quadraticCurveTo(0, h * 1.1, -w * 0.55, h * 0.9);
  ctx.bezierCurveTo(-w * 1.04, h * 0.55, -w * 1.12, -h, 0, -h);
  fillStroke(ctx, c.skin, lw);
  // ön saç
  hairFront(ctx, c, w, h, lw);
  eyesFront(ctx, c, ex, 0, 0, look, blink, lw);
  // burun
  ctx.beginPath(); ctx.moveTo(0.012, 0.1); ctx.quadraticCurveTo(0.05, 0.18, 0, 0.2); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = INK; ctx.stroke();
  // yanak
  if (ex.curve > 0.4) for (const s of [-1, 1]) blob(ctx, s * w * 0.62, 0.2, 0.07, 0.04, 'rgba(214,96,80,0.35)', 0);
  mouthAt(ctx, c, ex, 0, 0.32, pose.talk || 0, lw);
  if (f.includes('mustacheThick')) mustache(ctx, 0, 0.25, 0.17, 0.07, c, lw);
  if (f.includes('mustacheThin')) mustache(ctx, 0, 0.255, 0.13, 0.035, c, lw);
  if (f.includes('glassesRect')) glasses(ctx, c, 'rect', lw);
  if (f.includes('glassesCat')) glasses(ctx, c, 'cat', lw);
  ctx.restore();
}

function hairFront(ctx, c, w, h, lw) {
  const f = c.features;
  ctx.fillStyle = c.hair; ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  if (f.includes('hairMessy')) {
    ctx.beginPath();
    ctx.moveTo(-w * 1.02, -h * 0.05);
    ctx.bezierCurveTo(-w * 1.1, -h * 0.9, -w * 0.4, -h * 1.15, 0.02, -h * 1.08);
    ctx.bezierCurveTo(w * 0.5, -h * 1.18, w * 1.15, -h * 0.85, w * 1.02, -h * 0.1);
    ctx.lineTo(w * 0.8, -h * 0.42); ctx.lineTo(w * 0.62, -h * 0.28); ctx.lineTo(w * 0.42, -h * 0.5);
    ctx.lineTo(w * 0.1, -h * 0.34); ctx.lineTo(-w * 0.2, -h * 0.52); ctx.lineTo(-w * 0.5, -h * 0.36);
    ctx.lineTo(-w * 0.78, -h * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  if (f.includes('baldSides')) {
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(s * w * 0.98, -h * 0.4); ctx.quadraticCurveTo(s * w * 1.12, -h * 0.05, s * w * 0.96, h * 0.22);
      ctx.lineTo(s * w * 0.86, h * 0.05); ctx.quadraticCurveTo(s * w * 0.9, -h * 0.2, s * w * 0.8, -h * 0.42); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // tepede tek tutam (tuhaflık)
    ctx.beginPath(); ctx.moveTo(-0.02, -h); ctx.quadraticCurveTo(0.06, -h - 0.14, 0.14, -h - 0.08); ctx.lineWidth = lw * 1.1; ctx.stroke();
  }
  if (f.includes('bun')) {
    ctx.beginPath();
    ctx.moveTo(-w * 1.03, h * 0.05);
    ctx.bezierCurveTo(-w * 1.12, -h * 1.36, w * 1.12, -h * 1.36, w * 1.03, h * 0.05);
    ctx.quadraticCurveTo(w * 0.9, -h * 0.45, w * 0.1, -h * 0.55);
    ctx.quadraticCurveTo(-w * 0.2, -h * 0.4, -w * 0.4, -h * 0.55);
    ctx.quadraticCurveTo(-w * 0.9, -h * 0.45, -w * 1.03, h * 0.05);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  if (f.includes('hairSpiky')) {
    ctx.beginPath();
    ctx.moveTo(-w * 1.02, -h * 0.15);
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = -w * 1.02 + u * w * 2.04;
      const base = -h * (0.55 + 0.4 * Math.sin(u * Math.PI));
      ctx.lineTo(x - w * 0.12, base);
      ctx.lineTo(x + (u - 0.5) * 0.12, base - 0.2 - 0.06 * Math.sin(u * Math.PI));
    }
    ctx.lineTo(w * 1.02, -h * 0.15);
    ctx.quadraticCurveTo(w * 0.5, -h * 0.5, 0, -h * 0.45); ctx.quadraticCurveTo(-w * 0.5, -h * 0.5, -w * 1.02, -h * 0.15);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  if (f.includes('hairSlick')) {
    ctx.beginPath();
    ctx.moveTo(-w * 1.02, -h * 0.05);
    ctx.bezierCurveTo(-w * 1.1, -h * 1.4, w * 1.1, -h * 1.4, w * 1.02, -h * 0.05);
    ctx.quadraticCurveTo(w * 0.95, -h * 0.5, w * 0.2, -h * 0.62);
    ctx.quadraticCurveTo(-w * 0.6, -h * 0.68, -w * 1.02, -h * 0.05);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w * 0.3, -h * 0.88); ctx.quadraticCurveTo(w * 0.2, -h * 0.92, w * 0.6, -h * 0.7);
    ctx.lineWidth = lw * 0.5; ctx.strokeStyle = '#4A4038'; ctx.stroke();
  }
}

function mustache(ctx, x, y, w, h, c, lw) {
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.3);
  ctx.bezierCurveTo(x + w * 0.5, y - h * 0.9, x + w * 1.05, y - h * 0.2, x + w, y + h * 0.6);
  ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.1, x, y + h * 0.35);
  ctx.quadraticCurveTo(x - w * 0.5, y + h * 0.1, x - w, y + h * 0.6);
  ctx.bezierCurveTo(x - w * 1.05, y - h * 0.2, x - w * 0.5, y - h * 0.9, x, y - h * 0.3);
  ctx.fillStyle = c.features.includes('mustacheThick') ? '#4A3B33' : c.hair; ctx.fill();
  ctx.lineWidth = lw * 0.7; ctx.strokeStyle = INK; ctx.stroke();
}

function glasses(ctx, c, kind, lw) {
  const E = c.eyes;
  ctx.lineWidth = lw * 0.9; ctx.strokeStyle = INK; ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (const s of [-1, 1]) {
    const x = s * E.gap / 2, y = E.y;
    ctx.beginPath();
    if (kind === 'rect') ctx.roundRect(x - 0.13, y - 0.1, 0.26, 0.2, 0.04);
    else { ctx.moveTo(x - s * 0.12, y - 0.07); ctx.quadraticCurveTo(x, y - 0.12, x + s * 0.145, y - 0.1); ctx.quadraticCurveTo(x + s * 0.15, y + 0.09, x, y + 0.1); ctx.quadraticCurveTo(x - s * 0.13, y + 0.09, x - s * 0.12, y - 0.07); }
    ctx.fill(); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-E.gap / 2 + 0.12, E.y - 0.02); ctx.quadraticCurveTo(0, E.y - 0.06, E.gap / 2 - 0.12, E.y - 0.02); ctx.stroke();
  if (false) { // zincir: yakın planda yüzü bölüyordu, kaldırıldı (tuhaflık: topuzdaki kalem)
    ctx.beginPath(); ctx.moveTo(-E.gap / 2 - 0.15, E.y); ctx.quadraticCurveTo(-0.56, 0.3, -0.5, 0.7); ctx.moveTo(E.gap / 2 + 0.15, E.y); ctx.quadraticCurveTo(0.56, 0.3, 0.5, 0.7);
    ctx.lineWidth = lw * 0.4; ctx.strokeStyle = '#B8933A'; ctx.stroke();
  }
}

// ——— baş (yan) ———
function headSide(ctx, c, pose, [hx, hy], lw, t) {
  const H = c.head, f = c.features, ex = typeof pose.expr === 'string' ? EXPR[pose.expr] : pose.expr;
  const blink = pose.blink ?? blinkAt(c, t);
  const tilt = (pose.head.tilt || 0) * D;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(tilt);
  const w = H.w / 2 * 1.05, h = H.h / 2;
  if (f.includes('bun')) { blob(ctx, -w * 0.95, -h * 0.55, 0.19, 0.17, c.hair, lw); ctx.beginPath(); ctx.moveTo(-w * 0.9, -h * 0.95); ctx.lineTo(-w * 1.05, -h * 0.25); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = '#E2B13C'; ctx.stroke(); }
  // kafa: arkası yuvarlak, önde burun
  ctx.beginPath();
  ctx.moveTo(w * 0.15, -h);
  ctx.bezierCurveTo(w * 0.85, -h, w * 1.02, -h * 0.4, w * 0.98, 0.0);
  ctx.quadraticCurveTo(w * 1.18, h * 0.12, w * 1.0, h * 0.26); // burun
  ctx.quadraticCurveTo(w * 0.98, h * 0.75, w * 0.4, h * 0.95);
  ctx.quadraticCurveTo(-w * 0.2, h * 1.05, -w * 0.55, h * 0.7);
  ctx.bezierCurveTo(-w * 1.15, h * 0.3, -w * 1.15, -h, w * 0.15, -h);
  fillStroke(ctx, c.skin, lw);
  blob(ctx, -w * 0.22, 0.07, H.ear * 0.8, H.ear * 1.1, c.skin, lw);
  ctx.beginPath(); ctx.arc(-w * 0.22, 0.07, H.ear * 0.45, -1.2, 1.2); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke();
  hairSide(ctx, c, w, h, lw);
  // göz
  const E = c.eyes, ew = E.w / 2 * 0.8, eh = E.h / 2 * Math.min(1.3, Math.max(1, ex.eye)), exx = w * 0.62, ey = E.y;
  const open = Math.max(0.06, ex.eye * (1 - blink));
  ctx.save(); ctx.beginPath(); ctx.ellipse(exx, ey, ew, eh, 0, 0, Math.PI * 2); ctx.fillStyle = '#FBF8F1'; ctx.fill(); ctx.clip();
  blob(ctx, exx + ew * 0.35, ey + 0.01, ew * 0.6 * ex.pupil, eh * 0.5 * ex.pupil, INK, 0);
  const lid = (E.lid || 0) * (ex.eye < 1 ? 1 : 0.5), cover = Math.min(1, Math.max(0, 1 - open + lid * 0.6));
  if (cover > 0) { ctx.fillStyle = c.skin; ctx.fillRect(exx - ew - 0.02, ey - eh - 0.02, ew * 2 + 0.04, (eh * 2 + 0.04) * cover); }
  if (ex.smileEyes) { ctx.beginPath(); ctx.ellipse(exx, ey + eh * 1.25, ew * 1.3, eh * 0.85, 0, 0, Math.PI * 2); ctx.fillStyle = c.skin; ctx.fill(); }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(exx, ey, ew, eh, 0, 0, Math.PI * 2); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = INK; ctx.stroke();
  const by = ey - eh - 0.07 - ex.brow;
  ctx.beginPath(); ctx.moveTo(exx - ew * 1.1, by - ex.browTilt * 0.02); ctx.quadraticCurveTo(exx, by - 0.03, exx + ew * 1.0, by + ex.browTilt * 0.05);
  ctx.lineWidth = lw * 1.2; ctx.lineCap = 'round'; ctx.stroke();
  // ağız (yan: yarım ağız)
  mouthAt(ctx, c, ex, w * 0.78, 0.33, pose.talk || 0, lw, 0.6);
  if (f.includes('mustacheThick') || f.includes('mustacheThin')) {
    const th = f.includes('mustacheThick') ? 1 : 0.55;
    ctx.beginPath(); ctx.moveTo(w * 0.62, 0.22); ctx.quadraticCurveTo(w * 0.95, 0.19, w * 1.02, 0.24);
    ctx.quadraticCurveTo(w * 1.0, 0.24 + 0.07 * th, w * 0.85, 0.24 + 0.08 * th); ctx.quadraticCurveTo(w * 0.7, 0.24 + 0.06 * th, w * 0.62, 0.22);
    ctx.fillStyle = f.includes('mustacheThick') ? '#4A3B33' : c.hair; ctx.fill(); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = INK; ctx.stroke();
  }
  if (f.includes('glassesRect') || f.includes('glassesCat')) {
    ctx.beginPath(); ctx.roundRect(exx - 0.08, ey - 0.1, 0.18, 0.2, 0.04); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill(); ctx.lineWidth = lw * 0.9; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(exx - 0.08, ey - 0.03); ctx.lineTo(-w * 0.1, ey - 0.02); ctx.stroke();
  }
  ctx.restore();
}

function hairSide(ctx, c, w, h, lw) {
  const f = c.features;
  ctx.fillStyle = c.hair; ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (f.includes('hairMessy')) {
    ctx.moveTo(w * 0.85, -h * 0.55);
    ctx.bezierCurveTo(w * 0.7, -h * 1.2, -w * 0.9, -h * 1.2, -w * 1.08, -h * 0.1);
    ctx.quadraticCurveTo(-w * 0.95, h * 0.3, -w * 0.6, h * 0.25);
    ctx.lineTo(-w * 0.45, -h * 0.2); ctx.lineTo(-w * 0.1, -h * 0.45); ctx.lineTo(w * 0.2, -h * 0.4); ctx.lineTo(w * 0.5, -h * 0.6);
    ctx.closePath();
  } else if (f.includes('baldSides')) {
    ctx.moveTo(-w * 0.05, -h * 0.22); ctx.quadraticCurveTo(-w * 0.9, -h * 0.45, -w * 1.1, -h * 0.05);
    ctx.quadraticCurveTo(-w * 1.05, h * 0.45, -w * 0.62, h * 0.62); ctx.quadraticCurveTo(-w * 0.75, h * 0.2, -w * 0.4, h * 0.02);
    ctx.quadraticCurveTo(-w * 0.25, -h * 0.12, -w * 0.05, -h * 0.22);
    ctx.closePath();
  } else if (f.includes('bun')) {
    ctx.moveTo(w * 0.9, -h * 0.35);
    ctx.bezierCurveTo(w * 0.7, -h * 1.15, -w * 1.1, -h * 1.15, -w * 1.08, h * 0.15);
    ctx.quadraticCurveTo(-w * 0.7, h * 0.3, -w * 0.4, h * 0.1);
    ctx.quadraticCurveTo(-w * 0.3, -h * 0.4, w * 0.9, -h * 0.35);
    ctx.closePath();
  } else if (f.includes('hairSpiky')) {
    ctx.moveTo(w * 0.85, -h * 0.5);
    for (let i = 0; i <= 6; i++) {
      const u = i / 6, a = -0.3 * Math.PI + u * -0.75 * Math.PI;
      const r1 = h * 0.95, r2 = h * 1.38;
      ctx.lineTo(Math.cos(a) * r1 * 1.05, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a - 0.15) * r2 * 1.02, Math.sin(a - 0.15) * r2);
    }
    ctx.lineTo(-w * 1.05, h * 0.1); ctx.quadraticCurveTo(-w * 0.5, -h * 0.3, w * 0.85, -h * 0.5);
    ctx.closePath();
  } else if (f.includes('hairSlick')) {
    ctx.moveTo(w * 0.8, -h * 0.6);
    ctx.bezierCurveTo(w * 0.6, -h * 1.12, -w * 1.1, -h * 1.1, -w * 1.06, h * 0.05);
    ctx.quadraticCurveTo(-w * 0.75, h * 0.2, -w * 0.45, h * 0.0);
    ctx.quadraticCurveTo(-w * 0.2, -h * 0.55, w * 0.8, -h * 0.6);
    ctx.closePath();
  }
  ctx.fill(); ctx.stroke();
}

// ——— eşyalar: pose.props = { L: 'folder' | 'bell' | 'tray' | 'stamp' | 'phone', R: ... } ———
function propsAt(ctx, c, pose, sk, lw, t, layer) {
  const P = pose.props || {};
  for (const sideKey of ['L', 'R']) {
    const kind = P[sideKey]; if (!kind) continue;
    if (pose.view === 'side' && layer && ((sideKey === 'R') !== (layer === 'near'))) continue;
    const hp = sideKey === 'L' ? sk.handL : sk.handR;
    drawProp(ctx, kind, hp[0], hp[1], lw, t, c);
  }
}

export function drawProp(ctx, kind, x, y, lw, t = 0, c = null) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  if (kind === 'folder') {
    ctx.rotate(-0.08);
    ctx.beginPath(); ctx.roundRect(-0.26, -0.1, 0.5, 0.36, 0.02); ctx.fillStyle = '#D9A75A'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-0.26, -0.15, 0.2, 0.07, 0.02); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-0.18, 0.0, 0.34, 0.12, 0.01); ctx.fillStyle = '#F4EFE3'; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.stroke();
  } else if (kind === 'bell') {
    ctx.beginPath(); ctx.moveTo(0, -0.02); ctx.lineTo(0, 0.12); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = '#6B4A2B'; ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(-0.07, 0.14); ctx.quadraticCurveTo(-0.08, 0.3, -0.17, 0.36); ctx.lineTo(0.17, 0.36); ctx.quadraticCurveTo(0.08, 0.3, 0.07, 0.14); ctx.closePath();
    ctx.fillStyle = '#E2B13C'; ctx.fill(); ctx.stroke();
    blob(ctx, 0, 0.39, 0.04, 0.04, '#B8933A', lw * 0.7);
  } else if (kind === 'tray') {
    ctx.beginPath(); ctx.ellipse(0, -0.02, 0.34, 0.07, 0, 0, Math.PI * 2); ctx.fillStyle = '#C9C3B6'; ctx.fill(); ctx.stroke();
    for (const gx of [-0.16, 0.0, 0.16]) teaGlass(ctx, gx, -0.05, 0.75, lw);
  } else if (kind === 'stamp') {
    ctx.beginPath(); ctx.roundRect(-0.05, -0.14, 0.1, 0.14, 0.03); ctx.fillStyle = '#6B4A2B'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-0.12, 0.0, 0.24, 0.08, 0.015); ctx.fillStyle = '#2B2B2B'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.rect(-0.12, 0.08, 0.24, 0.025); ctx.fillStyle = '#D2412F'; ctx.fill();
  } else if (kind === 'phone') {
    ctx.beginPath(); ctx.roundRect(-0.07, -0.13, 0.14, 0.26, 0.03); ctx.fillStyle = '#2B2F33'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-0.05, -0.1, 0.1, 0.2, 0.015); ctx.fillStyle = '#E9EEE6'; ctx.fill();
  } else if (kind === 'tea') {
    teaGlass(ctx, 0, -0.02, 1, lw);
  }
  ctx.restore();
}

// İnce belli çay bardağı (tabaklı)
export function teaGlass(ctx, x, y, k, lw) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.ellipse(0, 0.0, 0.1, 0.025, 0, 0, Math.PI * 2); ctx.fillStyle = '#E8E2D4'; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-0.055, -0.22); ctx.quadraticCurveTo(-0.06, -0.15, -0.032, -0.1); ctx.quadraticCurveTo(-0.06, -0.04, -0.045, -0.005);
  ctx.lineTo(0.045, -0.005); ctx.quadraticCurveTo(0.06, -0.04, 0.032, -0.1); ctx.quadraticCurveTo(0.06, -0.15, 0.055, -0.22); ctx.closePath();
  ctx.fillStyle = '#B4521E'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.055, -0.22); ctx.lineTo(0.055, -0.22); ctx.lineTo(0.05, -0.19); ctx.lineTo(-0.05, -0.19); ctx.closePath(); ctx.fillStyle = '#F2EBDD'; ctx.fill();
  ctx.restore();
}

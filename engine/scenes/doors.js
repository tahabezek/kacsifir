// Sahne: üç kapı (Monty Hall). Seçim → sunucu bir keçi gösterir → "değiştirmeli misin?" → cevap %67 →
// 100 kapı ile sezgi: 98 keçi açılır, geriye seçtiğin kapı ve bir kapı kalır; araba o kapıdadır.
import { W, H, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };

export function buildDoorsTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, heroLand: T.reveal, silence0: T.reveal - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function doorsSummary(ep) {
  const tl = buildDoorsTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, tl.host + 0.8, tl.ask + 1.0, tl.heroLand + 0.4, tl.hundred + 1.0, tl.open98[1] + 0.3, tl.car + 0.5, tl.kick + 0.6, tl.rw0 + 0.3],
    fast: (tl.open98[0] + tl.open98[1]) / 2, lastLand: tl.car, firstLand: tl.host + 0.4 };
}
export function doorsCues(ep) {
  const tl = buildDoorsTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.open98[0], t1: tl.open98[1], hero: false }],
    lands: [tl.host + 0.3, tl.ask + 0.2, tl.car, tl.kick], tallies: [0, 1, 2].map(k => ({ t: tl.ask + 1.0 + k, accent: false })) };
}

export function makeDoorsRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildDoorsTimeline(ep);
  const D = tl.duration;
  const rnd = mulberry32(100);
  const CAR100 = 64;                                        // 100 kapıda arabanın yeri (sabit, tohumlu seçilmiş)

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // simgeler
  function goat(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = C.ink; ctx.fillStyle = C.paper; ctx.lineWidth = 3 / s; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(24, -14, 8, 10, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, -22); ctx.quadraticCurveTo(16, -34, 8, -30); ctx.moveTo(27, -22); ctx.quadraticCurveTo(26, -36, 18, -36); ctx.stroke();
    ctx.beginPath(); for (const lx of [-14, -6, 8, 16]) { ctx.moveTo(lx, 10); ctx.lineTo(lx, 26); } ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, -8); ctx.lineTo(31, 0); ctx.stroke();
    ctx.restore();
  }
  function car(x, y, s, red) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = red ? C.red : C.ink; ctx.fillStyle = red ? 'rgba(224,57,28,0.18)' : C.paper; ctx.lineWidth = 3 / s; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-36, 6); ctx.lineTo(-34, -6); ctx.lineTo(-18, -8); ctx.lineTo(-8, -20); ctx.lineTo(14, -20); ctx.lineTo(24, -8); ctx.lineTo(36, -6); ctx.lineTo(36, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -17); ctx.lineTo(4, -17); ctx.lineTo(4, -8); ctx.lineTo(-14, -8); ctx.closePath(); ctx.moveTo(8, -17); ctx.lineTo(13, -17); ctx.lineTo(20, -8); ctx.lineTo(8, -8); ctx.closePath(); ctx.stroke();
    for (const wx of [-20, 20]) { ctx.beginPath(); ctx.arc(wx, 7, 7, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    ctx.restore();
  }
  // kapı: yay tepeli dikdörtgen; open 0..1 kanadın açıklığı; içerik açılınca görünür
  function door(x, y, w, h, n, open, content, sel, red, labelSize) {
    ctx.save();
    const top = y - h, r = w / 2;
    const path = new Path2D(); path.moveTo(x, y); path.lineTo(x, top + r); path.arc(x + r, top + r, r, Math.PI, 0); path.lineTo(x + w, y); path.closePath();
    ctx.fillStyle = '#D9D1BE'; ctx.fill(path);
    if (open > 0.05 && content) { ctx.save(); ctx.clip(path); content(x + w / 2, y - h * 0.32, w / 90); ctx.restore(); }
    // kanat: perspektifle daralan (açıldıkça sola katlanır)
    const kw = w * (1 - open * 0.85);
    if (kw > 1) { ctx.save(); ctx.clip(path); ctx.fillStyle = '#EFE7D3'; ctx.fillRect(x, top, kw, h); ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(x + kw * 0.15, top + h * 0.3, kw * 0.7, h * 0.25); ctx.strokeRect(x + kw * 0.15, top + h * 0.62, kw * 0.7, h * 0.25);
      ctx.beginPath(); ctx.arc(x + kw * 0.85, y - h * 0.45, Math.max(2, w * 0.035), 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore(); }
    ctx.lineWidth = sel ? 7 : 3; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke(path);
    if (labelSize) { setFont(ctx, F.head(labelSize)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(`${n}`, x + w / 2, top + r * 0.9 + labelSize * 0.35); ctx.textAlign = 'left'; }
    ctx.restore();
  }

  // 1) üç kapı
  function three(t, a, red) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const w = 200, h = 330, gap = 46, x0 = 466 - (3 * w + 2 * gap) / 2, y = 1360;
    const pick = 0, goatDoor = 2, carDoor = 1;
    for (let i = 0; i < 3; i++) {
      let open = 0;
      if (i === goatDoor) open = ease.state(seg(t, tl.host, 0.6));
      if (t >= tl.heroLand && i === carDoor) open = ease.state(seg(t, tl.heroLand + 0.6, 0.6));
      if (t >= tl.heroLand && i === pick) open = ease.state(seg(t, tl.heroLand + 1.0, 0.6));
      const content = i === carDoor ? (x, yy, s) => car(x, yy, s * 1.25, red) : (x, yy, s) => goat(x + 8, yy + 20, s * 0.95);
      const sel = i === pick && t < tl.heroLand || i === carDoor && t >= tl.heroLand;
      door(x0 + i * (w + gap), y, w, h, i + 1, open, content, sel, red && i === carDoor, 64);
    }
    // seçim oku
    const sx = x0 + (t >= tl.heroLand ? 1 : 0) * (w + gap) + w / 2;
    ctx.fillStyle = red ? C.red : C.ink; ctx.beginPath(); ctx.moveTo(sx, y + 22); ctx.lineTo(sx - 16, y + 48); ctx.lineTo(sx + 16, y + 48); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // 2) yüz kapı: 98 keçi açılır, seçilen (1) ve araba kapısı kalır
  function hundred(t, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const cols = 10, w = 50, h = 36, gx = 64, gy = 44, x0 = 470 - (cols * gx) / 2 + (gx - w) / 2, y0 = 948;
    const order = [...Array(100).keys()].filter(i => i !== 0 && i !== CAR100);
    for (let i = 0; i < 100; i++) {
      const c = i % cols, r = Math.floor(i / cols), x = x0 + c * gx, y = y0 + r * gy + h;
      const k = order.indexOf(i);
      const ot = k >= 0 ? tl.open98[0] + (tl.open98[1] - tl.open98[0]) * (k / order.length) : Infinity;
      const open = ease.state(seg(t, ot, 0.25));
      const carOpen = i === CAR100 ? ease.state(seg(t, tl.car, 0.5)) : 0;
      const content = i === CAR100 ? (xx, yy, s) => car(xx, yy, s * 0.9, true) : (xx, yy, s) => goat(xx + 3, yy + 6, s * 0.8);
      door(x, y, w, h, i + 1, Math.max(open, carOpen), content, i === 0 || (i === CAR100 && t >= tl.car), i === CAR100 && t >= tl.car, 0);
    }
    ctx.restore();
  }

  const SAYS = ep.says.map((s, i, arr) => ({ t0: s.t, t1: arr[i + 1] ? arr[i + 1].t - 0.22 : tl.rw0, text: s.text, red: !!s.red }));
  function says(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  function counter(t) {
    let label, num, unit = '', red = false;
    if (t < tl.heroLand) { label = ep.label.before; num = '?'; }
    else if (t < tl.hundred) { label = ep.label.switch; num = '%67'; unit = ep.label.unit; red = true; }
    else { label = ep.label.hundred; num = '%99'; unit = ep.label.unit; red = t >= tl.car; }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const land = t < tl.hundred ? tl.heroLand : tl.car;
    const sc = red ? lerp(0.9, 1, spring(t - land, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); if (unit) ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }
  // seçenekler (soru anında)
  function choices(t) {
    const a = ease.enter(seg(t, tl.ask + 0.2, 0.4)) * (1 - ease.exit(seg(t, tl.silence0, 0.3)));
    if (a <= 0) return;
    ctx.save();
    ep.choices.forEach((c, i) => {
      const x = SAFE.x0 + i * 280, y = 908, w = 266, h = 70;
      ctx.globalAlpha = a * ease.enter(seg(t, tl.ask + 0.2 + i * 0.08, 0.35));
      ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x, y, w, h);
      setFont(ctx, F.head(40)); ctx.fillStyle = C.ink; ctx.fillText(c.k, x + 16, y + 50);
      setFont(ctx, F.name(32)); ctx.fillText(c.v, x + 58, y + 46);
    });
    ctx.restore();
  }

  // Sıfır: 1. kapıyı gösterir, keçide şaşırır, soruda 3-2-1 sayar, cevapta zıplar, 100 kapıda terler, arabada sevinir
  const actorScript = [
    { type: 'happy', t0: 0, t1: tl.host, },
    { type: 'surprise', t0: tl.host + 0.3, t1: tl.host + 1.15 },
    { type: 'think', t0: tl.host + 1.15, t1: tl.ask + 1.0 },
    { type: 'count', t0: tl.ask + 1.0, t1: tl.silence0, from: 1, valueAt: t => Math.max(1, 3 - Math.floor(t - tl.ask - 1.0)), bubble: 'top' },
    { type: 'idle', t0: tl.silence0, t1: tl.heroLand - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'sweat', t0: tl.hundred, t1: tl.car - 0.05 },
    { type: 'surprise', t0: tl.car - 0.05, t1: tl.car + 0.85 },
    { type: 'happy', t0: tl.car + 0.85, t1: tl.rw0 },
    { type: 'happy', t0: tl.rw0, t1: Infinity },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    const vt = t >= tl.rw0 ? 0 : t;
    const to100 = t >= tl.rw0 ? 1 - ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4)) : ease.state(seg(t, tl.hundred - 0.1, 0.6));
    const hold = (a, b) => 1 + 0.04 * Math.max(0, Math.min(1, (t - a) / (b - a)));
    const zAll = hold(0.2, tl.host) * hold(tl.host + 0.7, tl.ask) * hold(tl.heroLand + 1.6, tl.hundred) * hold(tl.car + 0.6, tl.rw0);
    const z = t < tl.rw0 ? zAll : lerp(zAll, 1, ease.state(seg(t, tl.rw0, 0.4))); // sıçramasız geri sarma
    ctx.save(); ctx.beginPath(); ctx.rect(0, 900, W, 540); ctx.clip();
    ctx.translate(505, 1180); ctx.scale(z, z); ctx.translate(-505, -1180);
    ctx.save(); ctx.translate(-to100 * 1080, 0); three(t >= tl.rw0 ? 0 : t, 1, t >= tl.heroLand && t < tl.hundred + 0.6); ctx.restore();
    if (to100 > 0) { ctx.save(); ctx.translate((1 - to100) * 1080, 0); hundred(t >= tl.rw0 ? tl.rw0 : t, 1); ctx.restore(); }
    ctx.restore();
    choices(t);
    counter(t >= tl.rw0 ? (t >= tl.rw0 + 0.4 ? 0 : tl.rw0 - 0.01) : t);
    if (t < tl.rw0 + 0.2) says(t);
    else if (t > tl.rw1 - 0.5) { setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink)); }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

// Sahne: görsel ispat (merdiven). 1'den n'e kare sütunlardan bir merdiven; Sıfır tek tek toplar. Merdivenin kopyası
// 180° döner ve üstüne oturur: n × (n+1) dikdörtgen. Bir merdiven yarısıdır. Sonra n büyür (10 → 100): aynı şekil.
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

export function buildProofTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, heroLand: T.hero, silence0: T.hero - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function proofSummary(ep) {
  const tl = buildProofTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, (tl.count[0] + tl.count[1]) / 2, tl.copy[1] + 0.3, tl.rect + 0.6, tl.half + 0.6, tl.grow[1] + 0.3, tl.heroLand + 0.4, tl.kick + 0.6, tl.rw0 + 0.3],
    fast: (tl.copy[0] + tl.copy[1]) / 2, lastLand: tl.kick, firstLand: tl.rect };
}
export function proofCues(ep) {
  const tl = buildProofTimeline(ep);
  const n = ep.n1, step = (tl.count[1] - tl.count[0]) / n;
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.grow[0], t1: tl.grow[1], hero: false }],
    lands: [tl.copy[1], tl.rect, tl.half, tl.kick], tallies: Array.from({ length: n }, (_, i) => ({ t: tl.count[0] + i * step, accent: false })) };
}

export function makeProofRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildProofTimeline(ep);
  const D = tl.duration;
  const n1 = ep.n1, n2 = ep.n2;
  const BOX = { x: 250, y: 1395, w: 440, h: 484 };      // dikdörtgenin sol alt köşesi ve boyu (n × (n+1))

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // basamak sayısı: 10'dan 100'e logaritmik geçiş (kare boyu küçülür, şekil aynı kalır)
  function nAt(t) { return Math.round(Math.exp(lerp(Math.log(n1), Math.log(n2), ease.state(seg(t, tl.grow[0], tl.grow[1] - tl.grow[0]))))); }
  function counted(t) { const step = (tl.count[1] - tl.count[0]) / n1; return Math.max(0, Math.min(n1, Math.floor((t - tl.count[0]) / step) + 1)); }

  // merdiven: sütun i (1..n) i kare yüksekliğinde; kare boyu = BOX.w / n
  function stair(t, n, opts) {
    const q = BOX.w / n, qh = BOX.h / (n + 1);
    const { fill, hatch, rot, dx, dy, a, upto } = opts;
    ctx.save(); ctx.globalAlpha *= a;
    // döndürme: dikdörtgenin merkezi etrafında 180°
    const cx = BOX.x + BOX.w / 2, cy = BOX.y - BOX.h / 2;
    ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.translate(-cx, -cy);
    for (let i = 1; i <= n; i++) {
      const x = BOX.x + (i - 1) * q, hcol = i * qh;
      const on = upto == null || i <= upto;
      ctx.fillStyle = on ? fill : '#F4EEDF'; ctx.fillRect(x, BOX.y - hcol, q, hcol);
      if (hatch && on) { ctx.save(); ctx.beginPath(); ctx.rect(x, BOX.y - hcol, q, hcol); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 2; for (let k = -BOX.h; k < BOX.h; k += 12) { ctx.beginPath(); ctx.moveTo(x + k, BOX.y); ctx.lineTo(x + k + BOX.h, BOX.y - BOX.h); ctx.stroke(); } ctx.restore(); }
      if (n <= 20) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; for (let j = 0; j < i; j++) ctx.strokeRect(x, BOX.y - (j + 1) * qh, q, qh); }
    }
    // dış çizgi (basamak profili)
    ctx.beginPath(); ctx.moveTo(BOX.x, BOX.y);
    for (let i = 1; i <= n; i++) { const x = BOX.x + (i - 1) * q; ctx.lineTo(x, BOX.y - i * qh); ctx.lineTo(x + q, BOX.y - i * qh); }
    ctx.lineTo(BOX.x + BOX.w, BOX.y); ctx.closePath(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }
  // ölçü çizgileri: alt (n) ve sol (n+1)
  function dims(t, n, a, red) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = red ? C.red : C.ink; ctx.fillStyle = red ? C.red : C.ink; ctx.lineWidth = 3;
    const yb = BOX.y + 30, xl = BOX.x - 30;
    ctx.beginPath(); ctx.moveTo(BOX.x, yb); ctx.lineTo(BOX.x + BOX.w, yb); ctx.moveTo(BOX.x, yb - 10); ctx.lineTo(BOX.x, yb + 10); ctx.moveTo(BOX.x + BOX.w, yb - 10); ctx.lineTo(BOX.x + BOX.w, yb + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xl, BOX.y); ctx.lineTo(xl, BOX.y - BOX.h); ctx.moveTo(xl - 10, BOX.y); ctx.lineTo(xl + 10, BOX.y); ctx.moveTo(xl - 10, BOX.y - BOX.h); ctx.lineTo(xl + 10, BOX.y - BOX.h); ctx.stroke();
    setFont(ctx, F.head(40)); ctx.textAlign = 'center'; ctx.fillText(nf.format(n), BOX.x + BOX.w / 2, yb + 44);
    ctx.save(); ctx.translate(xl - 22, BOX.y - BOX.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(nf.format(n + 1), 0, 0); ctx.restore();
    ctx.textAlign = 'left'; ctx.restore();
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
    let label, num, red = false;
    if (t < tl.copy[0]) { const k = counted(t); label = k ? `1 + 2 + … + ${k}` : `1 + 2 + … + ${n2}`; num = k ? nf.format((k * (k + 1)) / 2) : '?'; }
    else if (t < tl.half) { label = `${n1} × ${n1 + 1}`; num = nf.format(n1 * (n1 + 1)); }
    else if (t < tl.grow[0]) { label = `${n1} × ${n1 + 1} ÷ 2`; num = nf.format((n1 * (n1 + 1)) / 2); }
    else if (t < tl.heroLand) { const n = nAt(t); label = `${n} × ${n + 1} ÷ 2`; num = '?'; }
    else { label = `1 + 2 + … + ${n2}`; num = nf.format((n2 * (n2 + 1)) / 2); red = t < tl.rw0; }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    ctx.restore();
  }

  // Sıfır: tek tek toplar (balonda ara toplam), kopya gelince düşünür, 55'te sevinir, 5.050'de zıplar
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.count[0], expr: 'notr' },
    { type: 'count', t0: tl.count[0], t1: tl.count[1] + 0.2, from: 1, valueAt: t => { const k = counted(t); return Math.max(1, (k * (k + 1)) / 2); }, bubble: 'top' },
    { type: 'sweat', t0: tl.count[1] + 0.2, t1: tl.copy[0] },
    { type: 'think', t0: tl.copy[0], t1: tl.half - 0.05 },
    { type: 'happy', t0: tl.half - 0.05, t1: tl.grow[0] },
    { type: 'lookUp', t0: tl.grow[0], t1: tl.heroLand - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'happy', t0: tl.heroLand + 0.85, t1: tl.rw0 },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    // geri sarma: kopya kalkar, merdiven 10'a döner; son kare = kare 0
    const vt = t >= tl.rw0 ? lerp(tl.copy[1], 0, ease.state(seg(t, tl.rw0 + 0.3, (tl.rw1 - tl.rw0) - 0.7))) : t;
    const n = t >= tl.rw0 ? n1 : nAt(vt);
    const red = t >= tl.heroLand && t < tl.rw0;
    // beklemelerde %4 yaklaşma
    const hold = (a, b) => 1 + 0.04 * Math.max(0, Math.min(1, (t - a) / (b - a)));
    const z = t < tl.rw0 ? hold(tl.rect, tl.half) * hold(tl.half, tl.grow[0]) * hold(tl.heroLand, tl.rw0) / (t > tl.grow[0] && t < tl.heroLand ? 1 : 1) : 1;
    ctx.save(); ctx.translate(BOX.x + BOX.w / 2, BOX.y - BOX.h / 2); ctx.scale(z, z); ctx.translate(-(BOX.x + BOX.w / 2), -(BOX.y - BOX.h / 2));
    // kopya: ters döner ve yukarıdan oturur
    const cu = ease.state(seg(vt, tl.copy[0], tl.copy[1] - tl.copy[0]));
    const halfA = vt >= tl.half ? 1 - ease.exit(seg(vt, tl.half, 0.4)) * 0.75 : 1; // yarıya inince kopya soluklaşır
    if (vt >= tl.copy[0]) stair(vt, n, { fill: '#D9D1BE', hatch: true, rot: Math.PI * cu, dx: lerp(260, 0, cu), dy: lerp(-120, 0, cu), a: halfA * Math.min(1, cu * 3), upto: null });
    stair(vt, n, { fill: red ? 'rgba(224,57,28,0.85)' : '#EDE3C8', hatch: false, rot: 0, dx: 0, dy: 0, a: 1, upto: vt < tl.copy[0] ? Math.max(0, counted(vt)) : null });
    dims(vt, n, ease.enter(seg(vt, tl.rect, 0.4)), red);
    ctx.restore();
    counter(t >= tl.rw0 ? vt : t);
    if (t < tl.rw0 + 0.2) says(t);
    else if (t > tl.rw1 - 0.5) { setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink)); }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

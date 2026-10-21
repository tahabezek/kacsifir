// Sahne: "kaç X eder?" — bir şeklin kopyaları ızgaraya tek tek basılır. Ara basamaklarda gruplar boyanır,
// dorukta bütün ızgara dolar ve tek bir hücre kırmızı olur. Açılışta büyük şekil, ilk hücreye küçülerek iner.
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { GEO } from '../geo/shapes.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };

export function buildTilesTimeline(ep) {
  const T = ep.timing;
  // basım zamanları: her basamak arasında hızlanarak (ilk aralık → son aralık, geometrik)
  const stamp = [{ k: 1, t: 0 }];
  let prevN = 1;
  T.runs.forEach(([t0, t1], i) => {
    const n1 = i < ep.milestones.length ? ep.milestones[i].n : ep.hero.n;
    const cnt = n1 - prevN, w = Array.from({ length: cnt }, (_, j) => Math.pow(0.93, j)), sum = w.reduce((a, b) => a + b, 0);
    let acc = 0;
    for (let j = 0; j < cnt; j++) { stamp.push({ k: prevN + j + 1, t: t0 + (t1 - t0) * (acc / sum) }); acc += w[j]; }
    prevN = n1;
  });
  const lands = ep.milestones.map((m, i) => ({ ...m, t: T.runs[i][1] + 0.12 }));
  const heroLand = T.heroLand;
  return { beat: 60 / ep.bpm, stamp, lands, shrink: T.shrink, heroLand, silence0: T.runs[T.runs.length - 1][1] + 0.05, redAt: heroLand + (T.redDelay ?? 1.4), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function tilesSummary(ep) {
  const tl = buildTilesTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.2, tl.shrink[1] + 0.2, ...tl.lands.flatMap(l => [l.t - 1, l.t + 0.4]), tl.heroLand - 0.6, tl.heroLand + 0.3, tl.redAt + 0.5, tl.rw0 + 0.3],
    fast: tl.lands.length ? tl.lands[tl.lands.length - 1].t + 1.5 : 3, lastLand: tl.redAt, firstLand: tl.lands[0]?.t ?? 2 };
}
export function tilesCues(ep) {
  const tl = buildTilesTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [], lands: [...tl.lands.map(l => l.t), tl.redAt], tallies: tl.stamp.slice(1).map(s => ({ t: s.t, accent: false })) };
}

export function makeTilesRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildTilesTimeline(ep);
  const D = tl.duration;
  const G = GEO[ep.shape];
  const [bw, bh] = G.bboxKm;
  const g = ep.grid, cw = g.w / g.cols, ch = g.h / g.rows;
  const sk = Math.min((cw * 0.9) / bw, (ch * 0.86) / bh);  // hücre ölçeği (px/km)
  const BIGK = 760 / bw, BIG = { x: 505, y: g.y + g.h * 0.42 };
  const path = (() => { const p = new Path2D(); for (const r of G.rings) r.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; })();
  const cell = k => { const i = (k - 1) % g.cols, j = Math.floor((k - 1) / g.cols); return { x: g.x + (i + 0.5) * cw, y: g.y + (j + 0.5) * ch }; };

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  // kaçıncı hücre ne zaman basıldı; grup dolguları
  const stampAt = k => tl.stamp[k - 1]?.t ?? Infinity;
  const groups = ep.milestones.map((m, i) => ({ from: i ? ep.milestones[i - 1].n + 1 : 1, to: m.n, fill: m.fill, t: tl.lands[i].t }));
  function shape(x, y, k, fill, a, lw = 2) {
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(k, k);
    if (fill === 'ink') { ctx.fillStyle = C.graphite; ctx.fill(path); }
    else if (fill === 'red') { ctx.fillStyle = C.red; ctx.fill(path); }
    else if (fill === 'hatch') {
      ctx.fillStyle = '#F4EEDF'; ctx.fill(path);
      ctx.save(); ctx.clip(path); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      for (let d = -60; d < 60; d += 7) { ctx.beginPath(); ctx.moveTo(x + d, y - 30); ctx.lineTo(x + d + 30, y + 30); ctx.stroke(); }
      ctx.restore();
    } else { ctx.fillStyle = '#F4EEDF'; ctx.fill(path); }
    ctx.lineWidth = lw / k; ctx.lineJoin = 'round'; ctx.strokeStyle = fill === 'red' ? C.red : C.ink; ctx.stroke(path);
    ctx.restore();
  }

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  function counterN(t) { let n = 1; for (const s of tl.stamp) if (s.t <= t) n = s.k; return n; }
  function counter(t, vt) {
    const red = t >= tl.heroLand && t < tl.rw0;
    const n = red ? ep.hero.n : counterN(vt);
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite;
    ctx.fillText(red ? ep.hero.label : n === 1 ? ep.label.one : ep.label.many, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; const num = `${n}`; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width;
    setFont(ctx, F.name(56)); ctx.fillText(ep.unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  const SAYS = [{ t0: 0, t1: tl.stamp[1].t + 0.6, text: ep.say.hook },
    ...tl.lands.map((l, i) => ({ t0: l.t - 0.04, t1: i + 1 < tl.lands.length ? tl.lands[i + 1].t - 2.2 : tl.silence0 - 0.3, text: l.say })),
    { t0: tl.heroLand - 0.04, t1: tl.redAt - 0.22, text: ep.say.hero, red: true },
    { t0: tl.redAt - 0.04, t1: tl.rw0, text: ep.say.kicker, red: true }];
  function says(t) {
    let line0 = 0;
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      const L = wrap(ctx, s.text, SAFE.x1 - SAFE.x0);
      const y0 = counterY + 76 + (s.line ? line0 * 59 : 0);
      L.forEach((ln, i) => revealText(ctx, ln, SAFE.x0, y0 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
      if (!s.line) line0 = L.length;
    }
  }

  function grid(t, vt) {
    // beklemelerde ızgara ortasına doğru %4 yaklaşma (donmuş kare olmaz)
    let z = 1;
    const holds = [...tl.lands.map((l, i) => [l.t, (tl.lands[i + 1] ? tl.stamp[ep.milestones[i].n].t : tl.stamp[ep.milestones[i].n]?.t) ?? tl.silence0]), [tl.heroLand, tl.rw0]];
    for (const [a, b] of holds) if (vt >= a) z *= 1 + 0.04 * Math.max(0, Math.min(1, (vt - a) / (b - a)));
    if (t >= tl.rw0) z = lerp(z, 1, ease.state(seg(t, tl.rw0, 0.5)));
    const cx = g.x + g.w / 2, cy = g.y + g.h / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
    // boş hücre izleri: kesik çerçeveler (yazılacak yer)
    ctx.strokeStyle = 'rgba(28,27,24,0.10)'; ctx.lineWidth = 1;
    for (let k = 1; k <= g.cols * g.rows; k++) { const c = cell(k); ctx.strokeRect(c.x - cw / 2 + 3, c.y - ch / 2 + 3, cw - 6, ch - 6); }
    for (let k = 1; k <= ep.hero.n; k++) {
      const st = stampAt(k);
      if (vt < st) continue;
      if (k === 1 && vt < tl.shrink[1]) continue; // açılıştaki büyük şekil
      const u = ease.enter(seg(vt, st, 0.18)), c = cell(k);
      const grp = groups.find(g => k >= g.from && k <= g.to && vt >= g.t);
      let fill = grp ? grp.fill : 'none';
      if (k === 1 && t >= tl.redAt && t < tl.rw0) fill = 'red';
      const pop = fill === 'red' ? lerp(1, 1.3, spring(t - tl.redAt, 120, 24)) : 1; // tek kırmızı hücre öne çıkar
      shape(c.x, c.y - (1 - u) * 14, sk * lerp(1.25, 1, u) * pop, fill, u, k === 1 ? 3 : 2);
    }
    ctx.restore();
  }
  function bigShape(vt) {
    if (vt >= tl.shrink[1]) return;
    const u = ease.state(seg(vt, tl.shrink[0], tl.shrink[1] - tl.shrink[0])), c = cell(1);
    shape(lerp(BIG.x, c.x, u), lerp(BIG.y, c.y, u), Math.exp(lerp(Math.log(BIGK), Math.log(sk), u)), 'none', 1, lerp(4, 3, u));
    if (u < 0.3) { setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.globalAlpha = 1 - u / 0.3; ctx.textAlign = 'center'; ctx.fillText(ep.bigLabel, BIG.x, BIG.y + bh * BIGK / 2 + 50); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
  }

  // Sıfır: hücreleri sayar, basamaklarda şaşırır, ızgara hızlanınca köşesine dolmadan patinajla kaçar, dorukta geri gelir
  const last = ep.milestones[ep.milestones.length - 1];
  const fastT = tl.stamp[last.n]?.t ?? tl.silence0;
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.stamp[1].t, expr: 'notr' },
    { type: 'count', t0: tl.stamp[1].t, t1: tl.lands[0].t - 0.05, from: 2, valueAt: t => counterN(t), bubble: 'top' },
    { type: 'surprise', t0: tl.lands[0].t - 0.05, t1: tl.lands[0].t + 0.85 },
    { type: 'lookUp', t0: tl.lands[0].t + 0.85, t1: tl.lands[1] ? tl.stamp[ep.milestones[0].n].t : fastT, expr: 'saskin' },
    ...(tl.lands[1] ? [{ type: 'count', t0: tl.stamp[ep.milestones[0].n].t, t1: tl.lands[1].t - 0.05, from: 2, valueAt: t => counterN(t), bubble: 'top' },
      { type: 'sweat', t0: tl.lands[1].t - 0.05, t1: fastT }] : []),
    { type: 'flee', t0: fastT, t1: fastT + 1.3, dir: 1, dist: 500 },
    { type: 'gone', t0: fastT + 1.3, t1: tl.heroLand + 0.3 },
    { type: 'enterSkid', t0: tl.heroLand + 0.3, t1: tl.heroLand + 1.4, dir: -1, dist: 420 },
    { type: 'lookUp', t0: tl.heroLand + 1.4, t1: tl.redAt - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.redAt - 0.05, t1: tl.redAt + 0.85 },
    { type: 'happy', t0: tl.redAt + 0.85, t1: tl.rw0 },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    // geri sarma: basılan hücreler tersine kalkar, büyük şekil geri gelir; son kare = kare 0
    const vt = t >= tl.rw0 ? lerp(tl.rw0, 0, ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4))) : t;
    grid(t, vt);
    bigShape(vt);
    counter(t, vt);
    if (t < tl.rw0) says(t);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

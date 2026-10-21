// Sahne: derinlik. Yüzeyden aşağı inilen bir kuyu gerçek ölçekte çizilir; kamera logaritmik olarak geri çekilir,
// katmanlar (kabuk, manto, dış çekirdek, iç çekirdek) eş merkezli yaylar olarak belirir. Sonunda bütün Dünya kesiti.
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

export function buildDepthTimeline(ep) {
  const T = ep.timing;
  const stops = ep.stops.map((s, i) => ({ ...s, t0: T.stops[i][0], t1: T.stops[i][1] }));
  const hero = stops[stops.length - 1];
  return { beat: 60 / ep.bpm, drill: T.drill, stops, heroLand: hero.t1, silence0: hero.t1 - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function depthSummary(ep) {
  const tl = buildDepthTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, (tl.drill[0] + tl.drill[1]) / 2, tl.drill[1] + 0.4, ...tl.stops.flatMap(s => [(s.t0 + s.t1) / 2, s.t1 + 0.4]), tl.heroLand + 1.5, tl.rw0 + 0.3],
    fast: (tl.stops[1].t0 + tl.stops[1].t1) / 2, lastLand: tl.stops[tl.stops.length - 2].t1, firstLand: tl.drill[1] };
}
export function depthCues(ep) {
  const tl = buildDepthTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.drill[0], t1: tl.drill[1], hero: false }, ...tl.stops.slice(0, -1).map(s => ({ t0: s.t0, t1: s.t1, hero: false }))],
    lands: [tl.drill[1], ...tl.stops.slice(0, -1).map(s => s.t1)], tallies: [] };
}

export function makeDepthRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildDepthTimeline(ep);
  const D = tl.duration;
  const R = ep.earthKm;
  const X0 = 430, GS = 925;                           // kuyunun ağzı (yüzey) ekranda
  const HOLE = ep.hole.km;
  const fitS = km => 470 / km;                        // gösterilen derinlik 400 px'e sığar
  const S0 = fitS(ep.startKm);

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // kamera: duraklarda logaritmik geri çekilme (%25 gecikme), beklemelerde %6 yaklaşma
  function scale(t) {
    let s = S0, prev = S0;
    const holds = [[tl.drill[1], tl.stops[0].t0]];
    s *= 1 + 0.06 * Math.max(0, Math.min(1, (t - holds[0][0]) / (holds[0][1] - holds[0][0])));
    prev = S0 * 1.06;
    for (const [i, st] of tl.stops.entries()) {
      if (t < st.t0) break;
      const d = st.t1 - st.t0, target = fitS(st.fitKm), next = tl.stops[i + 1] ? tl.stops[i + 1].t0 : tl.rw0, settle = st.t0 + d * 1.1;
      const u = ease.state(seg(t, st.t0 + d * 0.15, d * 0.95));
      s = Math.exp(lerp(Math.log(prev), Math.log(target), u)) * (1 + 0.06 * Math.max(0, Math.min(1, (t - settle) / (next - settle))));
      prev = target * 1.06;
    }
    return s;
  }
  // kuyunun inilen derinliği
  const drilled = t => HOLE * ease.state(seg(t, tl.drill[0], tl.drill[1] - tl.drill[0]));

  // Dünya kesiti: merkez yüzeyin R km altında; katmanlar eş merkezli
  function earth(s, t, red) {
    const cy = GS + R * s;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 905, W, 1440 - 905); ctx.clip();
    // gökyüzü tarafı boş; yüzeyin altı katmanlar (dıştan içe)
    for (const L of ep.layers) {
      const r = (R - L.topKm) * s;
      ctx.beginPath(); ctx.arc(X0, cy, Math.max(0.5, r), 0, Math.PI * 2);
      ctx.fillStyle = L.fill; ctx.fill();
      if (L.hatch) { ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.14)'; ctx.lineWidth = 2; for (let k = -1400; k < 1400; k += 16) { ctx.beginPath(); ctx.moveTo(X0 + k, 900); ctx.lineTo(X0 + k + 600, 1500); ctx.stroke(); } ctx.restore(); }
      ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    }
    // yüzey çizgisi ve çimen çentikleri (yakın planda)
    if (R * s > 3000) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, GS); ctx.lineTo(W, GS); ctx.stroke();
    }
    // Mariana çukuru seviyesi (deniz seviyesinden) — yakın planda kesik çizgi
    if (R * s > 2000) {
      const y = GS + ep.trench.km * s;
      ctx.setLineDash([12, 10]); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(SAFE.x0, y); ctx.lineTo(X0 - 40, y); ctx.stroke(); ctx.setLineDash([]);
      setFont(ctx, F.mono(26)); ctx.fillStyle = C.ink; ctx.fillText(ep.trench.label, SAFE.x0, y - 12);
    }
    // kuyu: gerçek genişlik (23 cm) çizilemez; en az 4 px, matkap ucu döner (sürekli)
    const dk = drilled(t), hy = GS + dk * s;
    ctx.fillStyle = red ? C.red : C.ink; ctx.fillRect(X0 - 3, GS, red ? 8 : 6, Math.max(2, dk * s));
    if (t >= tl.drill[0] && t < tl.drill[1] + 0.3 && R * s > 2000) {
      const rot = (t * 14) % 1;
      ctx.save(); ctx.translate(X0, hy); ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(-16, -24); ctx.lineTo(16, -24); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.paper; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { const yy = -22 + ((k / 3 + rot) % 1) * 28; ctx.beginPath(); ctx.moveTo(-14 + (yy + 22) * 0.5, yy); ctx.lineTo(14 - (yy + 22) * 0.5, yy + 6); ctx.stroke(); }
      ctx.restore();
    }
    if (R * s > 1500) { setFont(ctx, F.mono(26)); ctx.fillStyle = C.ink; ctx.fillText(ep.hole.label, X0 + 18, Math.min(hy, 1400) - 10); }
    // uzaktan: kuyunun yeri kırmızı halka ve etiketle (kuyu artık bir pikselden küçük)
    if (red) { const a = ease.enter(seg(t, tl.heroLand + 0.3, 0.4)); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.red; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(X0, GS + 2, 16, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X0 + 18, GS + 6); ctx.lineTo(X0 + 70, GS + 40); ctx.stroke();
      setFont(ctx, F.mono(28)); ctx.fillStyle = C.red; ctx.fillText(ep.hole.heroLabel, X0 + 78, GS + 50); ctx.restore(); }
    // katman adları: yay görünür olduğunda, kuyunun sağında
    for (const L of ep.layers) {
      if (!L.label || (red && L.topKm < 100)) continue; // dorukta kabuk ve manto adı kırmızı etiketle çakışmasın
      const yTop = GS + L.topKm * s, yBot = L.botKm != null ? GS + L.botKm * s : cy;
      const y = Math.min(Math.max((yTop + Math.min(yBot, 1400)) / 2, 940), 1400);
      const a = ease.enter(seg(t, L.appear ?? 0, 0.4)) * (yTop > 900 && yTop < 1390 && (yBot - yTop) > 34 ? 1 : 0);
      if (a <= 0) continue;
      setFont(ctx, F.mono(28)); ctx.globalAlpha = a; ctx.fillStyle = C.ink; ctx.fillText(L.label, X0 + 70, y + 10); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  const S = tl.stops;
  const SAYS = [{ t0: 0, t1: tl.drill[1] - 0.25, text: ep.say.hook },
    { t0: tl.drill[1] - 0.04, t1: S[0].t0 + 0.2, text: ep.say.hole },
    ...S.slice(0, -1).map((s, i) => ({ t0: s.t1 - 0.04, t1: S[i + 1].hero ? tl.silence0 : S[i + 1].t0 + 0.2, text: s.say })),
    { t0: tl.heroLand - 0.04, t1: tl.rw0, text: S[S.length - 1].say, red: true }];
  function says(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  function counter(t) {
    const red = t >= tl.heroLand && t < tl.rw0;
    let label, num, unit;
    if (red) { label = ep.label.hero; num = ep.heroNum; unit = ''; }
    else {
      let cur = null; for (const s of S) if (t >= s.t1 - 0.04 && !s.hero) cur = s;
      if (!cur) { label = ep.label.hole; num = nf1.format(Math.floor(drilled(t) * 10) / 10); unit = 'km'; }
      else { label = cur.label; num = nf.format(cur.km); unit = 'km'; }
    }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); if (unit) ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: kuyuyu izler (matkap dönerken sayar), kamera geri çekildikçe terler, merkeze ulaşınca zıplar
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.drill[0], expr: 'notr' },
    { type: 'count', t0: tl.drill[0], t1: tl.drill[1] - 0.05, from: 1, valueAt: t => Math.max(1, Math.ceil(drilled(t))), label: n => `${n} km`, bubble: 'top' },
    { type: 'happy', t0: tl.drill[1] - 0.05, t1: S[0].t0 },
    { type: 'lookUp', t0: S[0].t0, t1: S[1].t0, expr: 'saskin' },
    { type: 'sweat', t0: S[1].t0, t1: tl.heroLand - 0.05 },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'lookUp', t0: tl.heroLand + 0.85, t1: tl.rw0, expr: 'saskin' },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    const vt = t >= tl.rw0 ? lerp(tl.rw0, 0, ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4))) : t;
    earth(scale(vt), vt, t >= tl.heroLand && t < tl.rw0);
    counter(t >= tl.rw0 ? vt : t);
    if (t < tl.rw0) says(t);
    else if (t > tl.rw1 - 0.5) { // döngü: kanca yazısı son yarım saniyede geri gelir (dikişte birden belirmez)
      setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink));
    }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

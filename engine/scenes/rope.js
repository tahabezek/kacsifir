// Sahne: ip paradoksu. Ekvatoru saran ipe 1 metre eklenir ve her yerden eşit kaldırılır. Önce tahmin istenir,
// sonra kamera yere iner: ip 15,9 cm yukarıda. Ardından aynı şey bir futbol topunda: cevap yine 15,9 cm.
// Son: Δr = 1 m ÷ 2π. Birimler metre; kamera ölçeği logaritmik geçer.
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

export function buildRopeTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, heroLand: T.reveal[1], silence0: T.reveal[0] - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function ropeSummary(ep) {
  const tl = buildRopeTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.5, tl.add + 0.8, tl.ask + 1.0, tl.heroLand + 0.4, tl.ball + 1.2, tl.ballLand + 0.4, tl.formula + 0.8, tl.rw0 + 0.3],
    fast: (tl.reveal[0] + tl.reveal[1]) / 2, lastLand: tl.formula + 0.4, firstLand: tl.add + 0.4 };
}
export function ropeCues(ep) {
  const tl = buildRopeTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: 0.3, t1: 2.2, hero: false }],
    lands: [tl.add + 0.3, tl.ask + 0.2, tl.ballLand, tl.formula + 0.2], tallies: [0, 1, 2].map(k => ({ t: tl.ask + 1.2 + k, accent: false })) };
}

export function makeRopeRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildRopeTimeline(ep);
  const D = tl.duration;
  const R = ep.earthR, DR = 1 / (2 * Math.PI), RB = ep.ballR;
  const E = { x: 470, y: 1210, r: 190 };                 // geniş planda Dünya
  const GROUND = { x: 470, y: 1310 };                    // yakın planda zemin noktası
  const S_FAR = E.r / R, S_NEAR = 1450;                  // px/m

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // halat: kalın mürekkep + bükülmüş doku (kesik açık çizgi), akış yönünde kayar
  function ropeStroke(path, t, w = 7) {
    ctx.save(); ctx.lineWidth = w; ctx.strokeStyle = C.ink; ctx.stroke(path);
    ctx.setLineDash([7, 9]); ctx.lineDashOffset = -(t / D) * Math.round(D) * 32; ctx.lineWidth = w * 0.42; ctx.strokeStyle = 'rgba(236,229,213,0.85)'; ctx.stroke(path);
    ctx.restore();
  }
  function globeLines(x, y, r, t) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 2;
    const rot = ((t / D) * Math.round(D / 6)) % 1;
    for (let k = 0; k < 6; k++) { const ph = ((k / 6 + rot) % 1) * Math.PI; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.5, Math.abs(Math.cos(ph)) * r), r, 0, 0, Math.PI * 2); ctx.stroke(); }
    for (const la of [-0.5, 0.5]) { const hw = r * Math.cos(Math.asin(la)); ctx.beginPath(); ctx.moveTo(x - hw, y + la * r); ctx.lineTo(x + hw, y + la * r); ctx.stroke(); }
    ctx.restore();
  }

  // 1) Dünya ve ip: ip 0,3–2,2 sn arasında Dünya'yı sarar; sonra yakın plana iniş (log ölçek)
  function earthScene(t, zoomU, red) {
    // kamera: Dünya'nın tepe noktası (0,0); merkez (0, R). Geniş planda merkez E'de, yakında zemin GROUND'da
    const s = Math.exp(lerp(Math.log(S_FAR), Math.log(S_NEAR), zoomU));
    const top = { x: lerp(E.x, GROUND.x, zoomU), y: lerp(E.y - E.r, GROUND.y, zoomU) };
    const rs = R * s, cx = top.x, cy = top.y + rs;
    const wrapU = ease.state(seg(t, 0.3, 1.9));
    if (rs < 4000) {
      ctx.beginPath(); ctx.arc(cx, cy, rs, 0, Math.PI * 2); ctx.fillStyle = '#E6DDC8'; ctx.fill();
      globeLines(cx, cy, rs, t);
      ctx.beginPath(); ctx.arc(cx, cy, rs, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      // ip: Dünya'yı sarar (çizim ilerler), 1 m eklenince gözle görülmez kadar açılır
      const lift = t >= tl.add ? DR * ease.state(seg(t, tl.add + 0.4, 0.8)) : 0;
      const rr = (R + lift) * s + 6;
      const p = new Path2D(); p.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * wrapU); ropeStroke(p, t);
    } else {
      // yakın plan: zemin düz bir çizgi, ip 15,9 cm yukarıda
      ctx.fillStyle = '#E6DDC8'; ctx.fillRect(0, top.y, W, 1440 - top.y);
      ctx.save(); ctx.beginPath(); ctx.rect(0, top.y, W, 1440 - top.y); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.22)'; ctx.lineWidth = 2;
      for (let x = -40; x < W + 40; x += 26) { ctx.beginPath(); ctx.moveTo(x, top.y + 8); ctx.lineTo(x + 20, top.y + 44); ctx.stroke(); }
      ctx.restore();
      ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, top.y); ctx.lineTo(W, top.y); ctx.stroke();
      const liftU = ease.state(seg(t, tl.add + 1.9, 1.0)); // ip yerden eşit kalkar
      const ry = top.y - 5 - DR * s * liftU;
      const p = new Path2D(); p.moveTo(-20, ry); p.lineTo(W + 20, ry); ropeStroke(p, t, 9);
      // telefon: 14,7 cm, ipin altında ayakta
      const ph = ep.phone.h * s, pw = ep.phone.w * s, px = top.x - 230;
      const a = ease.enter(seg(t, tl.heroLand + 0.4, 0.4));
      if (a > 0) {
        ctx.save(); ctx.globalAlpha = a;
        ctx.beginPath(); ctx.roundRect(px - pw / 2, top.y - ph, pw, ph, pw * 0.16); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
        ctx.beginPath(); ctx.roundRect(px - pw / 2 + 9, top.y - ph + 9, pw - 18, ph - 18, pw * 0.1); ctx.fillStyle = '#D9D1BE'; ctx.fill();
        setFont(ctx, F.mono(26)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(ep.phone.label, px, top.y + 44); ctx.textAlign = 'left';
        ctx.restore();
      }
      // ölçü oku: kırmızı, 15,9 cm
      const ax = top.x + 160;
      ctx.save(); ctx.strokeStyle = red ? C.red : C.ink; ctx.fillStyle = red ? C.red : C.ink; ctx.lineWidth = 4;
      if (liftU <= 0.95) { ctx.restore(); return; }
      ctx.beginPath(); ctx.moveTo(ax, ry + 8); ctx.lineTo(ax, top.y - 8); ctx.stroke();
      for (const [y, d] of [[ry + 8, 1], [top.y - 8, -1]]) { ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(ax - 12, y + 18 * d); ctx.lineTo(ax + 12, y + 18 * d); ctx.closePath(); ctx.fill(); }
      if (liftU > 0.95) { setFont(ctx, F.head(54)); ctx.fillText(red ? ep.answer : '?', ax + 24, (ry + top.y) / 2 + 18);
        if (!red) { setFont(ctx, F.mono(28)); ctx.fillStyle = C.graphite; ctx.fillText(ep.gapLabel, ax + 72, (ry + top.y) / 2 + 12); } }
      ctx.restore();
    }
  }
  // 2) futbol topu: aynı soru, aynı cevap
  function ballScene(t, a) {
    if (a <= 0) return;
    const s = 250 / (RB + DR), cx = 470, cy = 1170, r = RB * s;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#F4EEDF'; ctx.fill();
    // top deseni: ortada beşgen, çevrede beş beşgen (sade)
    ctx.save(); ctx.clip(); ctx.fillStyle = C.ink;
    const pent = (x, y, rr, rot) => { ctx.beginPath(); for (let k = 0; k < 5; k++) { const an = rot + (k / 5) * Math.PI * 2; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } ctx.closePath(); ctx.fill(); };
    const spin = (t / D) * Math.PI * 2;
    pent(cx, cy, r * 0.22, -Math.PI / 2 + spin * 0.1);
    for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + (k / 5) * Math.PI * 2 + spin * 0.1; pent(cx + Math.cos(an) * r * 0.78, cy + Math.sin(an) * r * 0.78, r * 0.2, an); }
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // ip: önce topa sarılı, sonra 1 m eklenip açılır
    const lift = DR * ease.state(seg(t, tl.ball + 1.4, 0.9));
    const p = new Path2D(); p.arc(cx, cy, (RB + lift) * s + 5, 0, Math.PI * 2); ropeStroke(p, t, 6);
    // ölçü: sağda yatay ok
    if (t >= tl.ballLand - 0.05) {
      const red = t >= tl.ballLand;
      ctx.strokeStyle = red ? C.red : C.ink; ctx.fillStyle = red ? C.red : C.ink; ctx.lineWidth = 4;
      const x0 = cx + r + 8, x1 = cx + (RB + DR) * s - 4, y = cy;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (const [x, d] of [[x0, 1], [x1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18 * d, y - 11); ctx.lineTo(x + 18 * d, y + 11); ctx.closePath(); ctx.fill(); }
      setFont(ctx, F.head(48)); ctx.textAlign = 'center'; ctx.fillText(ep.answer, (x0 + x1) / 2, y - 26); ctx.textAlign = 'left';
    }
    setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(ep.ballLabel, cx, cy + (RB + DR) * s + 50); ctx.textAlign = 'left';
    ctx.restore();
  }
  // 3) formül: iki çember yan yana ve Δr = 1 m ÷ 2π
  function formulaScene(t, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const zf = 1 + 0.06 * Math.max(0, Math.min(1, (t - tl.formula - 0.9) / (tl.rw0 - tl.formula - 0.9))); // beklemede yaklaşma
    ctx.translate(505, 1180); ctx.scale(zf, zf); ctx.translate(-505, -1180);
    setFont(ctx, F.head(96)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    const pu = ease.enter(seg(t, tl.formula + 0.1, 0.5));
    revealText(ctx, ep.formula[0], 505, 1010, 96, pu, C.ink, 'center');
    setFont(ctx, F.head(124)); revealText(ctx, ep.formula[1], 505, 1150, 124, ease.enter(seg(t, tl.formula + 0.5, 0.5)), C.red, 'center');
    ctx.textAlign = 'left';
    // altında iki küçük çizim: Dünya ve top, ikisinde de aynı aralık (halat akar, sürekli)
    const ma = ease.enter(seg(t, tl.formula + 0.9, 0.5));
    if (ma > 0) {
      ctx.save(); ctx.globalAlpha *= ma;
      for (const [x, r, name] of [[330, 62, 'Dünya'], [680, 26, 'Top']]) {
        const y = 1352 - r - 18;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = name === 'Top' ? '#F4EEDF' : '#E6DDC8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
        const ring = new Path2D(); ring.arc(x, y, r + 18, 0, Math.PI * 2); ropeStroke(ring, t, 5);
        setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(name, x, 1395); ctx.textAlign = 'left';
      }
      ctx.restore();
    }
    ctx.restore();
  }
  // seçenekler: soru anında üç kutu
  function choices(t) {
    const a = ease.enter(seg(t, tl.ask + 0.3, 0.4)) * (1 - ease.exit(seg(t, tl.reveal[0], 0.3)));
    if (a <= 0) return;
    const reveal = t >= tl.heroLand;
    ctx.save(); ctx.globalAlpha = a;
    ep.choices.forEach((c, i) => {
      const x = SAFE.x0 + i * 280, y = 908, w = 266, h = 92;
      const u = ease.enter(seg(t, tl.ask + 0.3 + i * 0.08, 0.35));
      ctx.globalAlpha = a * u;
      ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x, y, w, h);
      setFont(ctx, F.head(44)); ctx.fillStyle = C.ink; ctx.fillText(c.k, x + 16, y + 62);
      setFont(ctx, F.head(34)); ctx.fillText(c.v, x + 62, y + 42); setFont(ctx, F.mono(26)); ctx.fillStyle = C.graphite; ctx.fillText(c.what, x + 62, y + 76);
    });
    ctx.restore();
  }

  const SAYS = [{ t0: 0, t1: tl.add - 0.2, text: ep.say.hook }, { t0: tl.add, t1: tl.ask - 0.2, text: ep.say.add },
    { t0: tl.ask, t1: tl.silence0, text: ep.say.ask }, { t0: tl.heroLand - 0.04, t1: tl.ball - 0.2, text: ep.say.hero, red: true },
    { t0: tl.ball, t1: tl.ballLand - 0.2, text: ep.say.ball }, { t0: tl.ballLand - 0.04, t1: tl.formula - 0.2, text: ep.say.ballHero },
    { t0: tl.formula, t1: tl.rw0, text: ep.say.formula }];
  function says(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  function counter(t) {
    let label, num, unit, red = false;
    if (t < tl.add + 0.3) { label = ep.label.rope; num = '40.075'; unit = 'km ip'; }
    else if (t < tl.heroLand) { label = ep.label.added; num = '+1'; unit = 'metre'; }
    else if (t < tl.ball) { label = ep.label.lift; num = ep.answerNum; unit = 'cm'; red = true; }
    else if (t < tl.ballLand) { label = ep.label.ball; num = '+1'; unit = 'metre'; }
    else { label = ep.label.lift; num = ep.answerNum; unit = 'cm'; red = true; }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const land = t < tl.ball ? tl.heroLand : tl.ballLand;
    const sc = red ? lerp(0.9, 1, spring(t - land, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: ipi izler, soruda düşünür ve 3-2-1 sayar, cevapta zıplar, topta yine şaşırır, formülde sevinir
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.ask, expr: 'notr' },
    { type: 'think', t0: tl.ask, t1: tl.ask + 1.2 },
    { type: 'count', t0: tl.ask + 1.2, t1: tl.silence0, from: 1, valueAt: t => Math.max(1, 3 - Math.floor(t - tl.ask - 1.2)), bubble: 'top' },
    { type: 'idle', t0: tl.silence0, t1: tl.heroLand - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'think', t0: tl.ball, t1: tl.ballLand - 0.05 },
    { type: 'surprise', t0: tl.ballLand - 0.05, t1: tl.ballLand + 0.85 },
    { type: 'happy', t0: tl.formula, t1: tl.rw0 },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    // sahneler aynı yatay eksende kayarak değişir (Dünya → top → formül); geri sarma tersine kayar
    const toBall = t >= tl.rw0 ? 1 - ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4)) : ease.state(seg(t, tl.ball - 0.1, 0.6));
    const toFormula = t >= tl.rw0 ? 1 - ease.state(seg(t, tl.rw0, 0.5)) : ease.state(seg(t, tl.formula - 0.1, 0.6));
    const zoomU = t >= tl.rw0 ? 0 : ease.state(seg(t, tl.add + 0.4, 1.4)); // yere iniş: soru resimden okunsun
    // beklemelerde %4 yaklaşma
    const hold = (a, b) => 1 + 0.04 * Math.max(0, Math.min(1, (t - a) / (b - a)));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 900, W, 540); ctx.clip();
    ctx.save(); ctx.translate(-toBall * 1080, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    const z1 = t < tl.reveal[0] ? hold(tl.add + 1.2, tl.reveal[0]) : hold(tl.heroLand, tl.ball);
    ctx.translate(470, 1200); ctx.scale(z1, z1); ctx.translate(-470, -1200);
    earthScene(t >= tl.rw0 ? 0 : t, zoomU, t >= tl.heroLand && t < tl.rw0);
    ctx.restore();
    if (toBall > 0) { ctx.save(); ctx.translate((1 - toBall) * 1080 - toFormula * 1080, 0); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); ballScene(t, 1); ctx.restore(); }
    if (toFormula > 0) { ctx.save(); ctx.translate((1 - toFormula) * 1080, 0); formulaScene(t, 1); ctx.restore(); }
    ctx.restore();
    choices(t);
    counter(t >= tl.rw0 ? 0 : t);
    if (t < tl.rw0 + 0.2) says(t);
    else if (t > tl.rw1 - 0.5) { setFont(ctx, F.name(50)); wrap(ctx, ep.say.hook, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink)); }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

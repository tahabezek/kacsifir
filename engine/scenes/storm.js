// Sahne: fırtına. 1 km uzağa şimşek düşer; ışık anında gelir, ses dalgası gerçek hızla ilerler (gerçek zaman).
// Sonra aynı sürede ışığın Ay'a gidip döndüğü gösterilir (yine gerçek zaman). Doruk: hız oranı.
import { W, H, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

export function buildStormTimeline(ep) {
  const T = ep.timing, dt = ep.distM / ep.soundMS;           // sesin gecikmesi (sn)
  const strike = T.strike, thunder = T.strike + dt;
  const moonGo = T.moon, moonDt = (2 * ep.moonKm) / ep.lightKmS; // gidiş-dönüş
  return { beat: 60 / ep.bpm, strike, dt, thunder, scene2: T.scene2, moonGo, moonDt, moonBack: moonGo + moonDt, moonEnd: moonGo + dt,
    heroLand: T.heroLand, silence0: T.heroLand - (T.silence ?? 0.5), kickAt: T.heroLand + (T.kickDelay ?? 2.6), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function stormSummary(ep) {
  const tl = buildStormTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, tl.strike + 0.1, tl.strike + 1.5, tl.thunder + 0.3, tl.scene2 + 0.6, tl.moonGo + 1.2, tl.moonBack + 0.3, tl.moonEnd + 0.6, tl.heroLand + 0.4, tl.kickAt + 0.5, tl.rw0 + 0.3],
    fast: tl.strike + 0.1, lastLand: tl.moonEnd, firstLand: tl.thunder };
}
export function stormCues(ep) {
  const tl = buildStormTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [], lands: [tl.strike, tl.thunder, tl.moonGo + tl.moonDt / 2, tl.moonBack, tl.kickAt],
    tallies: [1, 2].map(k => ({ t: tl.strike + k, accent: false })) };
}

export function makeStormRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildStormTimeline(ep);
  const D = tl.duration;
  const GY = 1336, SX = 210, OX = 868;                      // zemin, şimşeğin düştüğü yer, Sıfır
  const rnd = mulberry32(31);
  const BOLT = (() => { const pts = [[0, 0]]; let x = 0; for (let i = 1; i <= 9; i++) { x += (rnd() - 0.5) * 70; pts.push([x, i / 9]); } pts[9][0] = 0; return pts; })();
  const RAIN = Array.from({ length: 70 }, () => ({ x: rnd() * 560 + 60, y: rnd(), l: 18 + rnd() * 18 }));

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // ——— 1. sahne: fırtına ———
  function cloud(t, a) {
    const drift = Math.sin((t / D) * Math.PI * 2) * 12; // döngüye kilitli hafif kayma
    const cx = 330 + drift, cy = 1045;
    const p = new Path2D();
    p.moveTo(cx - 230, cy + 40);
    p.bezierCurveTo(cx - 290, cy + 40, cx - 280, cy - 40, cx - 210, cy - 30);
    p.bezierCurveTo(cx - 200, cy - 100, cx - 90, cy - 110, cx - 60, cy - 60);
    p.bezierCurveTo(cx - 20, cy - 130, cx + 110, cy - 120, cx + 120, cy - 50);
    p.bezierCurveTo(cx + 200, cy - 70, cx + 250, cy, cx + 200, cy + 40);
    p.closePath();
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#D9D1BE'; ctx.fill(p); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(p); ctx.restore();
  }
  function rain(t, a) {
    ctx.save(); ctx.globalAlpha *= a * 0.5; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    const fall = (t / D) * Math.round(D / 0.7);              // döngüye kilitli düşüş
    for (const r of RAIN) {
      const y = 1090 + ((r.y + fall) % 1) * (GY - 1100);
      ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x - 6, y + r.l); ctx.stroke();
    }
    ctx.restore();
  }
  function ground(a) {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(SAFE.x0 - 20, GY); ctx.lineTo(SAFE.x1 + 30, GY); ctx.stroke();
    // 1 km ölçü çizgisi
    const y = GY + 34; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(SX, y); ctx.lineTo(OX - 60, y); ctx.moveTo(SX, y - 10); ctx.lineTo(SX, y + 10); ctx.moveTo(OX - 60, y - 10); ctx.lineTo(OX - 60, y + 10); ctx.stroke();
    setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(ep.distLabel, (SX + OX - 60) / 2, y + 36); ctx.textAlign = 'left';
    ctx.restore();
  }
  function bolt(t, a) {
    const u = t - tl.strike; if (u < 0 || u > 0.5) return;
    const k = u < 0.06 ? u / 0.06 : 1 - ease.exit(seg(u, 0.25, 0.25));
    ctx.save(); ctx.globalAlpha *= a * k; ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineJoin = 'miter';
    const y0 = 1078, h = GY - y0;
    ctx.beginPath(); BOLT.forEach(([x, v], i) => (i ? ctx.lineTo(SX + x, y0 + v * h) : ctx.moveTo(SX + x, y0 + v * h))); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
    // ışık: anında Sıfır'a (kesik ışın)
    ctx.setLineDash([14, 10]); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SX, GY - 60); ctx.lineTo(OX - 50, GY - 150); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  function soundWaves(t, a) {
    if (t < tl.strike) return;
    const u = (t - tl.strike) / tl.dt;
    const front = Math.min(u, 1.15) * (OX - 60 - SX);
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = C.ink;
    for (let k = 0; k < 4; k++) {
      const r = front - k * 34; if (r <= 0) continue;
      ctx.globalAlpha = a * Math.max(0, 0.9 - k * 0.2) * (u > 1.05 ? 1 - ease.exit(seg(u, 1.05, 0.15)) : 1);
      ctx.lineWidth = 5 - k; ctx.beginPath(); ctx.arc(SX, GY, r, -Math.PI * 0.5, 0); ctx.stroke();
    }
    ctx.restore();
  }
  // ——— 2. sahne: Dünya – Ay (gerçek zaman ışık) ———
  const E2 = { x: 160, y: 1110, r: 54 }, M2 = { x: 820, r: 20 };
  function moonScene(t, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    // Dünya ve Ay
    ctx.beginPath(); ctx.arc(E2.x, E2.y, E2.r, 0, Math.PI * 2); ctx.fillStyle = '#E2D9C4'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(M2.x, E2.y, M2.r, 0, Math.PI * 2); ctx.fillStyle = '#F4EEDF'; ctx.fill(); ctx.stroke();
    setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText('DÜNYA', E2.x, E2.y + E2.r + 44); ctx.fillText('AY', M2.x, E2.y + M2.r + 44);
    setFont(ctx, F.mono(24)); ctx.fillStyle = C.graphite; ctx.fillText(ep.moonNote, (E2.x + M2.x) / 2, E2.y + 150); ctx.textAlign = 'left';
    // ışık atımı: gerçek zaman (gidiş 1,28 sn, dönüş 1,28 sn), sonra yola devam
    const x0 = E2.x + E2.r, x1 = M2.x - M2.r, L = x1 - x0;
    if (t >= tl.moonGo) {
      const tt = t - tl.moonGo, legT = tl.moonDt / 2;
      let x, dir;
      if (tt < legT) { x = x0 + L * (tt / legT); dir = 1; } else if (tt < tl.moonDt) { x = x1 - L * ((tt - legT) / legT); dir = -1; } else { x = x0 + L * Math.min(1, (tt - tl.moonDt) / legT); dir = 1; }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      // gidilen iz: üstte gidiş, altta dönüş
      ctx.beginPath(); ctx.moveTo(x0, E2.y - 12); ctx.lineTo(tt < legT ? x : x1, E2.y - 12); ctx.stroke();
      if (tt >= legT) { ctx.beginPath(); ctx.moveTo(x1, E2.y + 12); ctx.lineTo(tt < tl.moonDt ? x : x0, E2.y + 12); ctx.stroke(); }
      if (tt >= tl.moonDt) { ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(x0, E2.y); ctx.lineTo(x, E2.y); ctx.stroke(); ctx.setLineDash([]); }
      const yy = tt < legT ? E2.y - 12 : tt < tl.moonDt ? E2.y + 12 : E2.y;
      if (t < tl.moonEnd + 0.05) { ctx.beginPath(); ctx.arc(x, yy, 11, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
        for (let k = 1; k <= 4; k++) { ctx.globalAlpha = a * (0.45 - k * 0.09); ctx.fillRect(x - dir * k * 22 - 9, yy - 3, 18, 6); } ctx.globalAlpha = a; }
      // ses aynı sürede: Dünya üstünde ancak 1 km (görünmez kadar küçük) — minik halka
      const su = Math.min(1, tt / tl.dt);
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(E2.x, E2.y - E2.r, 3 + su * 6, Math.PI, 0); ctx.stroke();
      if (tt > 0.6) { setFont(ctx, F.mono(24)); ctx.fillStyle = C.ink; ctx.fillText(ep.soundNote, E2.x - 40, E2.y - E2.r - 26); }
    }
    ctx.restore();
  }

  // ——— yazılar ———
  const SAYS = [{ t0: 0, t1: tl.thunder - 0.25, text: ep.say.hook },
    { t0: tl.thunder - 0.04, t1: tl.scene2 + 0.2, text: ep.say.thunder },
    { t0: tl.scene2 + 0.4, t1: tl.moonEnd - 0.25, text: ep.say.moonAsk },
    { t0: tl.moonEnd - 0.04, t1: tl.silence0, text: ep.say.moon },
    { t0: tl.heroLand - 0.04, t1: tl.kickAt - 0.22, text: ep.say.hero, red: true },
    { t0: tl.kickAt - 0.04, t1: tl.rw0, text: ep.say.kicker }];
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
    // geri sarma: doruk 0,25 sn'de söner, sonra kronometre kare 0'daki gibi 0
    if (t >= tl.rw0) {
      const u = seg(t, tl.rw0, 0.25);
      ctx.save(); ctx.globalAlpha = u < 1 ? 1 - ease.exit(u) : ease.enter(seg(t, tl.rw0 + 0.25, 0.25));
      const hero = u < 1;
      setFont(ctx, F.mono(36)); ctx.fillStyle = hero ? C.red : C.graphite; ctx.fillText(hero ? ep.label.hero : ep.label.stopwatch, SAFE.x0, counterY - 118);
      const n2 = hero ? nf.format(ep.ratio) : '0', u2 = hero ? 'kat' : 'sn';
      setFont(ctx, F.head(124)); ctx.fillStyle = hero ? C.red : C.ink; ctx.fillText(n2, SAFE.x0, counterY);
      const w2 = ctx.measureText(n2).width; setFont(ctx, F.name(56)); ctx.fillText(u2, SAFE.x0 + w2 + 18, counterY);
      ctx.restore(); return;
    }
    if (red) { label = ep.label.hero; num = nf.format(ep.ratio); unit = 'kat'; }
    else {
      const s0 = t < tl.scene2 ? tl.strike : tl.moonGo, s1 = t < tl.scene2 ? tl.thunder : tl.moonEnd;
      const el = t < s0 ? 0 : Math.min(t, s1) - s0;
      label = t < tl.scene2 ? ep.label.stopwatch : ep.label.same; num = nf1.format(Math.floor(el * 10) / 10); unit = 'sn';
    }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: şimşeği görür, saniyeleri sayar (gerçek), gök gürlerken zıplar; Ay sahnesinde bakar; dorukta yine zıplar
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.strike + 0.05, expr: 'notr' },
    { type: 'count', t0: tl.strike + 0.05, t1: tl.thunder - 0.05, from: 1, valueAt: t => Math.max(1, Math.ceil(t - tl.strike - 1e-6)), label: n => `${n}…`, bubble: 'top' },
    { type: 'surprise', t0: tl.thunder - 0.05, t1: tl.thunder + 0.85 },
    { type: 'sweat', t0: tl.thunder + 0.85, t1: tl.scene2 },
    { type: 'lookUp', t0: tl.scene2, t1: tl.heroLand - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'happy', t0: tl.heroLand + 0.85, t1: tl.rw0 },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: OX, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    // sahne geçişi: fırtına sola kayarak çıkar, Dünya–Ay sağdan girer (aynı yatay eksen); geri sarmada tersi
    const out = t < tl.rw0 ? ease.state(seg(t, tl.scene2, 0.6)) : 1 - ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 905, W, 1440 - 905); ctx.clip(); ctx.translate(-out * 1080, 0);
    cloud(t, 1); rain(t, 1); ground(1); bolt(t, 1); soundWaves(t, 1);
    ctx.restore();
    // beklemelerde Dünya–Ay sahnesine %6 yavaş yaklaşma
    let zf = 1; for (const [a0, b0] of [[tl.moonEnd, tl.silence0], [tl.heroLand, tl.rw0]]) zf *= 1 + 0.06 * Math.max(0, Math.min(1, (t - a0) / (b0 - a0)));
    if (t >= tl.rw0) zf = lerp(1.06 * 1.06, 1, ease.state(seg(t, tl.rw0, 0.4)));
    ctx.save(); ctx.translate((1 - out) * 1080, 0); ctx.translate(490, 1110); ctx.scale(zf, zf); ctx.translate(-490, -1110); moonScene(t, out > 0 ? 1 : 0); ctx.restore();
    counter(t);
    if (t < tl.rw0) says(t);
    else if (t > tl.rw1 - 0.5) { // döngü: kanca yazısı son yarım saniyede geri gelir (dikişte birden belirmez)
      setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink));
    }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

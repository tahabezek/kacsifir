// Sahne: ışık yolculuğu. Güneş'ten çıkan bir foton, ölçekli mesafelerde yörüngeleri geçerek Dünya'ya gelir.
// Kronometre hızlandırılmış gerçek süreyi gösterir. Mesafeler ölçekli, gök cisimleri okunabilsin diye büyütülmüş.
import { W, H, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

export function buildLightTimeline(ep) {
  const T = ep.timing, c = ep.cKmS;
  const total = ep.target.km / c;                        // gerçek süre (sn)
  const go0 = T.go[0], go1 = T.go[1];
  const at = km => go0 + (go1 - go0) * (km / ep.target.km);
  const marks = ep.marks.map(m => ({ ...m, t: at(m.km), sec: m.km / c }));
  return { beat: 60 / ep.bpm, total, go0, go1, marks, heroLand: go1, silence0: go1 - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function lightSummary(ep) {
  const tl = buildLightTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.2, ...tl.marks.flatMap(m => [m.t - 1, m.t + 0.4]), tl.heroLand - 0.3, tl.heroLand + 0.3, tl.heroLand + 1.5, tl.rw0 + 0.3],
    fast: (tl.go0 + tl.go1) / 2, lastLand: tl.marks[tl.marks.length - 1].t, firstLand: tl.marks[0].t };
}
export function lightCues(ep) {
  const tl = buildLightTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.go0, t1: tl.silence0, hero: false }],
    lands: tl.marks.map(m => m.t), tallies: [] };
}

// 499 sn → "8 dk 19 sn"
function clock(sec) {
  const s = Math.floor(sec + 1e-6), m = Math.floor(s / 60), r = s % 60;
  return m ? { num: `${m}`, unit: `dk ${r} sn` } : { num: `${r}`, unit: 'sn' };
}

export function makeLightRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildLightTimeline(ep);
  const D = tl.duration;
  const Y = 1130;                                       // ışık yolu
  const SUN = { x: -90, r: 260 }, EARTH_X = 790;
  const kx = (EARTH_X - SUN.x) / ep.target.km;           // px/km
  const X = km => SUN.x + km * kx;
  const rnd = mulberry32(8);
  const STARS = Array.from({ length: 70 }, () => ({ x: rnd() * W, y: 800 + rnd() * 620, r: 0.8 + rnd() * 1.6 }));

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  // fotonun yolu (km) ve gerçek geçen süre
  function photonKm(t) {
    if (t >= tl.rw0) return ep.target.km * (1 - ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4)));
    return ep.target.km * Math.max(0, Math.min(1, (t - tl.go0) / (tl.go1 - tl.go0)));
  }

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  function space(t) {
    // yıldız noktaları: yavaş, döngüye kilitli kayma (sürekli döngü 1)
    const drift = ((t / D) * 48) % 48;
    ctx.fillStyle = 'rgba(28,27,24,0.35)';
    for (const s of STARS) { const x = (s.x - drift + W) % W; ctx.beginPath(); ctx.arc(x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
  }
  function sun(t) {
    // Güneş: mürekkep halka + çapraz tarama; kenarında dönen kısa çizgiler (sürekli döngü 2, döngüye kilitli)
    ctx.save();
    ctx.beginPath(); ctx.arc(SUN.x, Y, SUN.r, 0, Math.PI * 2); ctx.fillStyle = '#E9DFC6'; ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.22)'; ctx.lineWidth = 2;
    for (let k = -SUN.r * 2; k < SUN.r * 2; k += 14) { ctx.beginPath(); ctx.moveTo(SUN.x + k, Y - SUN.r); ctx.lineTo(SUN.x + k + SUN.r, Y + SUN.r); ctx.stroke(); }
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(SUN.x, Y, SUN.r, 0, Math.PI * 2); ctx.stroke();
    const rot = (t / D) * Math.PI * 2;
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const a = rot + (i / 18) * Math.PI * 2, r0 = SUN.r + 14, r1 = SUN.r + 14 + (i % 2 ? 16 : 28);
      ctx.beginPath(); ctx.moveTo(SUN.x + Math.cos(a) * r0, Y + Math.sin(a) * r0); ctx.lineTo(SUN.x + Math.cos(a) * r1, Y + Math.sin(a) * r1); ctx.stroke();
    }
    setFont(ctx, F.mono(30)); const gw = ctx.measureText('GÜNEŞ').width; ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 - 8, Y + 70, gw + 16, 42); ctx.fillStyle = C.ink; ctx.fillText('GÜNEŞ', SAFE.x0, Y + 101);
  }
  function orbits(t) {
    for (const m of tl.marks) {
      const r = X(m.km) - SUN.x;
      const passed = photonKm(t) >= m.km;
      ctx.save(); ctx.setLineDash([10, 9]); ctx.lineDashOffset = -(t / D) * 19 * Math.round(D);
      ctx.strokeStyle = passed ? C.ink : C.graphite; ctx.lineWidth = passed ? 3 : 2;
      const ha = Math.asin(Math.min(1, 215 / r)); // yay yazının altında kalır
      ctx.beginPath(); ctx.arc(SUN.x, Y, r, -ha, ha); ctx.stroke(); ctx.restore();
      // gezegen: yörüngesinde, yolun dışında (gerçek dizilim değil)
      const pa = Math.sign(m.angle) * Math.min(Math.abs(m.angle), Math.asin(Math.min(1, 215 / r)) * 0.8);
      ctx.beginPath(); ctx.arc(SUN.x + Math.cos(pa) * r, Y + Math.sin(pa) * r, m.dot, 0, Math.PI * 2);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(30)); ctx.fillStyle = passed ? C.ink : C.graphite; ctx.textAlign = 'center';
      ctx.fillText(m.name.toLocaleUpperCase('tr-TR'), SUN.x + Math.cos(pa) * r, Y + Math.sin(pa) * r + (pa < 0 ? -m.dot - 16 : m.dot + 40));
      ctx.textAlign = 'left';
    }
  }
  function earth(t) {
    const r = 36, x = EARTH_X, y = Y;
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#F4EEDF'; ctx.fill(); ctx.clip();
    // kıta lekeleri döner (sürekli)
    const rot = ((t / D) * 2 % 2) * r * 2;
    ctx.fillStyle = 'rgba(28,27,24,0.3)';
    for (const [ox, oy, w, h] of [[-20, -10, 18, 12], [6, 4, 14, 16], [24, -14, 12, 9]]) for (const sh of [-r * 2, 0, r * 2]) { ctx.beginPath(); ctx.ellipse(x + ((ox + rot + sh + r * 3) % (r * 4)) - r * 2, y + oy, w / 2, h / 2, 0.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('DÜNYA', x, y - r - 22); ctx.textAlign = 'left';
    if (t >= tl.heroLand && t < tl.heroLand + 0.9) { const u = ease.enter(seg(t, tl.heroLand, 0.9)); ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, r + 12 + u * 120, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  }
  function path(t) {
    const km = photonKm(t), x = X(km), x0 = SUN.x + SUN.r;
    ctx.save(); ctx.setLineDash([4, 12]); ctx.strokeStyle = C.graphite; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(EARTH_X - 32, Y); ctx.stroke(); ctx.setLineDash([]);
    // gidilen yol: dolu çizgi; foton: mürekkep nokta + hız izi
    if (x > x0) { ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, Y); ctx.lineTo(Math.min(x, EARTH_X - 32), Y); ctx.stroke(); }
    const moving = t > tl.go0 && t < tl.go1;
    if (moving) for (let k = 1; k <= 5; k++) { ctx.globalAlpha = 0.5 - k * 0.08; ctx.fillStyle = C.ink; ctx.fillRect(x - k * 26, Y - 3, 18, 6); }
    ctx.globalAlpha = 1;
    // vardıktan sonra ışık akmaya devam eder: yol boyunca kayan foton dizisi (sürekli döngü)
    if (t >= tl.go1 && t < tl.rw0) {
      const a = ease.enter(seg(t, tl.go1 + 0.4, 0.6)) * (1 - ease.exit(seg(t, tl.rw0 - 0.3, 0.3)));
      const gap = 64, off = ((t - tl.go1) * 260) % gap;
      ctx.globalAlpha = a; ctx.fillStyle = C.ink;
      for (let px = x0 + off; px < EARTH_X - 44; px += gap) { ctx.beginPath(); ctx.arc(px, Y, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(px - 30, Y - 2.5, 22, 5); }
      ctx.globalAlpha = 1;
    }
    if (x < EARTH_X - 30 || t < tl.go1) { ctx.beginPath(); ctx.arc(Math.max(x, x0 + 4), Y, 11, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    ctx.restore();
    // ölçek cetveli
    const ry = Y + 262;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0) + SUN.r * 0 + 150, ry); ctx.lineTo(X(150e6), ry); ctx.stroke();
    setFont(ctx, F.mono(24)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center';
    for (const v of [50e6, 100e6, 150e6]) { ctx.beginPath(); ctx.moveTo(X(v), ry - 8); ctx.lineTo(X(v), ry + 8); ctx.stroke(); ctx.fillText(`${nf.format(v / 1e6)}`, X(v), ry + 36); }
    ctx.textAlign = 'left'; ctx.fillText(ep.scaleNote, X(0) + 150, ry - 18);
  }
  // altyazılar: geçişlerde ve doruğda
  const SAYS = [{ t0: 0, t1: tl.marks[0].t - 0.4, text: ep.say.hook },
    ...tl.marks.map((m, i) => ({ t0: m.t - 0.04, t1: i + 1 < tl.marks.length ? tl.marks[i + 1].t - 0.4 : tl.silence0, text: m.say })),
    { t0: tl.heroLand - 0.04, t1: tl.rw0, text: ep.say.hero, red: true }];
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
    const sec = red ? tl.total : tl.total * photonKm(t) / ep.target.km;
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(red ? ep.label.arrived : ep.label.travel, SAFE.x0, counterY - 118);
    const c = clock(sec);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(c.num, SAFE.x0, counterY);
    const w = ctx.measureText(c.num).width;
    setFont(ctx, F.name(56)); ctx.fillText(c.unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: Dünya'nın yanında ışığı bekler; uyuklar, yörünge geçişlerinde uyanır, ışık gelince zıplar
  const M = tl.marks;
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: 2.2, expr: 'notr' },
    { type: 'sleep', t0: 2.2, t1: M[0].t - 0.1 },
    { type: 'lookUp', t0: M[0].t - 0.1, t1: M[0].t + 1.3, expr: 'saskin' },
    { type: 'sleep', t0: M[0].t + 1.3, t1: M[1].t - 0.1 },
    { type: 'lookUp', t0: M[1].t - 0.1, t1: tl.silence0, expr: 'saskin' },
    { type: 'idle', t0: tl.silence0, t1: tl.heroLand - 0.05, expr: 'saskin' },
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
    space(t);
    sun(t);
    orbits(t);
    earth(t);
    path(t);
    counter(t);
    if (t < tl.rw0) says(t);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

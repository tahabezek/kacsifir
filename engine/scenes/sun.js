// Sahne: hacim. Tek bir Dünya → Güneş gerçek oranda belirir (Dünya bir noktaya küçülür) → çap boyunca Dünyalar
// dizilir → Güneş alttan yukarı Dünya dokusuyla dolar, sayaç hacim oranına çıkar.
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

export function buildSunTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, heroLand: T.fill[1], silence0: T.fill[1] - (T.silence ?? 0.5), kickAt: T.fill[1] + (T.kickDelay ?? 2.6), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function sunSummary(ep) {
  const tl = buildSunTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.0, tl.reveal[1] + 0.3, (tl.row[0] + tl.row[1]) / 2, tl.row[1] + 0.4, (tl.fill[0] + tl.fill[1]) / 2, tl.heroLand + 0.4, tl.kickAt + 0.5, tl.rw0 + 0.3],
    fast: (tl.fill[0] + tl.fill[1]) / 2, lastLand: tl.row[1], firstLand: tl.reveal[1] };
}
export function sunCues(ep) {
  const tl = buildSunTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.row[0], t1: tl.row[1], hero: false }, { t0: tl.fill[0], t1: tl.silence0, hero: true }],
    lands: [tl.reveal[1], tl.row[1], tl.kickAt], tallies: [] };
}

export function makeSunRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildSunTimeline(ep);
  const D = tl.duration;
  const SUN = { x: 470, y: 1172, r: 245 };
  const ratio = ep.diameterRatio;                     // 109,2
  const er = SUN.r / ratio;                           // gerçek oranda Dünya yarıçapı (px)
  const N = Math.round(ratio);                        // çap boyunca tane

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  // Dünya dokusu: altıgen dizilmiş küçük daireler (bir kez)
  const TEX = (() => {
    const d = er * 2, c = document.createElement('canvas'); c.width = Math.round(d * 10); c.height = Math.round(d * Math.sqrt(3) * 5) * 2;
    const x = c.getContext('2d'); x.fillStyle = '#EDE3C8'; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = 'rgba(28,27,24,0.55)'; x.lineWidth = 1;
    for (let j = 0; j * d * 0.866 < c.height + d; j++) for (let i = -1; i * d < c.width + d; i++) {
      const cx = i * d + (j % 2 ? d / 2 : 0), cy = j * d * 0.866;
      x.beginPath(); x.arc(cx, cy, er * 0.92, 0, Math.PI * 2); x.stroke();
    }
    return ctx.createPattern(c, 'repeat');
  })();

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  function earth(x, y, r, a = 1) {
    ctx.save(); ctx.globalAlpha *= a;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#E2D9C4'; ctx.fill();
    if (r > 14) { ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = Math.max(1, r * 0.02); // enlem-boylam ağı (Ay'a benzemesin)
      for (const k of [0.35, 0.75]) { ctx.beginPath(); ctx.ellipse(x, y, r * k, r, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
      for (const la of [-0.5, 0, 0.5]) { const hw = r * Math.cos(Math.asin(la)); ctx.beginPath(); ctx.moveTo(x - hw, y + la * r); ctx.lineTo(x + hw, y + la * r); ctx.stroke(); }
      ctx.restore(); }
    ctx.lineWidth = Math.max(1.2, Math.min(4, r * 0.07)); ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
  }
  // sahne: açılışta büyük Dünya; Güneş belirirken Dünya gerçek oranına küçülür ve Güneş'in sol kenarına iner
  function scene(t, red) {
    const u = ease.state(seg(t, tl.reveal[0], tl.reveal[1] - tl.reveal[0]));
    // Güneş: kenar çizgisi ve döner kısa ışınlar (sürekli döngü, döngüye kilitli)
    if (u > 0) {
      const sa = u;
      ctx.save(); ctx.globalAlpha = sa;
      ctx.beginPath(); ctx.arc(SUN.x, SUN.y, SUN.r, 0, Math.PI * 2); ctx.fillStyle = '#F4EEDF'; ctx.fill();
      // hacim dolumu: alttan yukarı Dünya dokusu, dolum çizgisinde perspektif dilim
      const f = ease.state(seg(t, tl.fill[0], tl.fill[1] - tl.fill[0]));
      if (f > 0) {
        const hy = SUN.y + SUN.r - f * 2 * SUN.r;
        ctx.save(); ctx.beginPath(); ctx.arc(SUN.x, SUN.y, SUN.r, 0, Math.PI * 2); ctx.clip();
        ctx.beginPath(); ctx.rect(SUN.x - SUN.r, hy, SUN.r * 2, SUN.r * 2); ctx.fillStyle = red ? 'rgba(224,57,28,0.85)' : TEX; ctx.fill();
        const half = Math.sqrt(Math.max(0, SUN.r * SUN.r - (hy - SUN.y) * (hy - SUN.y)));
        if (f < 1) { ctx.beginPath(); ctx.ellipse(SUN.x, hy, half, half * 0.18, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(28,27,24,0.12)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
        ctx.restore();
      }
      ctx.lineWidth = 5; ctx.strokeStyle = red ? C.red : C.ink; ctx.beginPath(); ctx.arc(SUN.x, SUN.y, SUN.r, 0, Math.PI * 2); ctx.stroke();
      const rot = (t / D) * Math.PI * 2;
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 24; i++) { const a = rot + (i / 24) * Math.PI * 2, r0 = SUN.r + 12, r1 = r0 + (i % 2 ? 12 : 22);
        ctx.beginPath(); ctx.moveTo(SUN.x + Math.cos(a) * r0, SUN.y + Math.sin(a) * r0); ctx.lineTo(SUN.x + Math.cos(a) * r1, SUN.y + Math.sin(a) * r1); ctx.stroke(); }
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.fillText('GÜNEŞ', SUN.x + SUN.r * 0.72, SUN.y - SUN.r * 0.82);
      ctx.restore();
    }
    // çap boyunca Dünyalar (dolum başlayınca dokuya karışır)
    const shown = t < tl.row[0] ? 1 : Math.min(N, 1 + Math.floor((N - 1) * ease.state(seg(t, tl.row[0], tl.row[1] - tl.row[0])) + 1e-6));
    const rowA = 1 - ease.exit(seg(t, tl.fill[0], 0.6));
    if (rowA > 0 && u > 0.98) for (let k = 0; k < shown; k++) earth(SUN.x - SUN.r + er + k * er * 2 * (ratio / N), SUN.y, er, rowA);
    // tek Dünya: büyükten gerçek orana
    const x0 = 470, y0 = 1150, r0 = 120, xe = SUN.x - SUN.r + er;
    if (u < 0.999) {
      earth(lerp(x0, xe, u), lerp(y0, SUN.y, u), Math.exp(lerp(Math.log(r0), Math.log(er), u)), 1);
      if (u < 0.3) { setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.globalAlpha = 1 - u / 0.3; ctx.textAlign = 'center'; ctx.fillText('DÜNYA', x0, y0 + r0 + 50); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
    }
    // büyüteç: sıranın sol başındaki Dünyalar tek tek görünür
    const la = ease.enter(seg(t, tl.row[0] + 0.3, 0.4)) * (1 - ease.exit(seg(t, tl.fill[0], 0.5)));
    if (la > 0 && u > 0.98) {
      const L = { x: SUN.x - 110, y: SUN.y - 120, r: 92 }, zoom = 9, fx = SUN.x - SUN.r + er * 6, fy = SUN.y;
      ctx.save(); ctx.globalAlpha = la;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(L.x - L.r * 0.7, L.y + L.r * 0.7); ctx.stroke();
      ctx.beginPath(); ctx.arc(fx, fy, er * 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2); ctx.fillStyle = '#F4EEDF'; ctx.fill(); ctx.save(); ctx.clip();
      // büyük Güneş kenarı + dizilen Dünyalar
      ctx.translate(L.x, L.y); ctx.scale(zoom, zoom); ctx.translate(-fx, -fy);
      ctx.lineWidth = 5 / zoom; ctx.beginPath(); ctx.arc(SUN.x, SUN.y, SUN.r, 0, Math.PI * 2); ctx.stroke();
      for (let k = 0; k < Math.min(shown, 14); k++) { const ex = SUN.x - SUN.r + er + k * er * 2 * (ratio / N); ctx.beginPath(); ctx.arc(ex, SUN.y, er * 0.95, 0, Math.PI * 2); ctx.fillStyle = '#E2D9C4'; ctx.fill(); ctx.lineWidth = 1.2 / zoom * 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
      ctx.restore();
      ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // çap ölçüsü
    if (t >= tl.row[1] - 0.05 && t < tl.fill[0] + 0.6) {
      const a = ease.enter(seg(t, tl.row[1], 0.3)) * (1 - ease.exit(seg(t, tl.fill[0], 0.6)));
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      const y = SUN.y + 34; ctx.beginPath(); ctx.moveTo(SUN.x - SUN.r, y); ctx.lineTo(SUN.x + SUN.r, y); ctx.stroke();
      setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(ep.rowLabel, SUN.x, y + 40); ctx.textAlign = 'left'; ctx.restore();
    }
  }

  const SAYS = [{ t0: 0, t1: tl.reveal[1] - 0.2, text: ep.say.hook },
    { t0: tl.reveal[1] - 0.04, t1: tl.row[0] + 0.2, text: ep.say.reveal },
    { t0: tl.row[1] - 0.04, t1: tl.fill[0] + 0.2, text: ep.say.row },
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
  function count(t) {
    if (t < tl.row[0]) return 1;
    if (t < tl.fill[0]) return Math.min(N, 1 + Math.floor((N - 1) * ease.state(seg(t, tl.row[0], tl.row[1] - tl.row[0])) + 1e-6));
    const f = ease.state(seg(t, tl.fill[0], tl.fill[1] - tl.fill[0]));
    // hacim: kürenin alttan f oranında dolan kesri (küresel kapak)
    const h = 2 * f, frac = (h * h * (3 - h)) / 4;
    return Math.max(N, ep.volumeRatio * frac);
  }
  function counter(t) {
    const red = t >= tl.heroLand && t < tl.rw0;
    const n = red ? ep.volumeRatio : count(t);
    let num = nf.format(Math.round(n)), unit = 'Dünya';
    if (n >= 1e6) { num = nf1.format(Math.round((n / 1e6) * 10) / 10); unit = 'milyon Dünya'; }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(t < tl.fill[0] ? ep.label.row : ep.label.volume, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: Dünya'ya bakar, Güneş belirince şaşırır, dizilen Dünyaları sayar, dolarken terler, dorukta zıplar
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.reveal[1] - 0.05, expr: 'notr' },
    { type: 'surprise', t0: tl.reveal[1] - 0.05, t1: tl.reveal[1] + 0.85 },
    { type: 'count', t0: tl.row[0], t1: tl.row[1] + 0.3, from: 1, valueAt: t => count(Math.min(t, tl.fill[0] - 0.01)), bubble: 'top' },
    { type: 'lookUp', t0: tl.row[1] + 0.3, t1: tl.fill[0], expr: 'saskin' },
    { type: 'sweat', t0: tl.fill[0], t1: tl.heroLand - 0.05 },
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
    const vt = t >= tl.rw0 ? lerp(tl.rw0, 0, ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4))) : t;
    const red = t >= tl.heroLand && t < tl.rw0;
    // beklemelerde %5 yaklaşma
    const holds = [[tl.reveal[1], tl.row[0]], [tl.row[1], tl.fill[0]], [tl.heroLand, tl.rw0]];
    let zf = 1; for (const [a, b] of holds) zf *= 1 + 0.05 * Math.max(0, Math.min(1, (vt - a) / (b - a)));
    ctx.save(); ctx.translate(SUN.x, SUN.y); ctx.scale(zf, zf); ctx.translate(-SUN.x, -SUN.y);
    scene(vt, red);
    ctx.restore();
    counter(t >= tl.rw0 ? vt : t);
    if (t < tl.rw0) says(t);
    else if (t > tl.rw1 - 0.5) { // döngü: kanca yazısı son yarım saniyede geri gelir (dikişte birden belirmez)
      setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink));
    }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

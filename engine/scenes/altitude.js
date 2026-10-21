// Sahne: yükseklik. Bir şey (Everest) Dünya yüzeyinden üst üste dizilir; kamera logaritmik olarak geri çekilir.
// Yolda gerçek yükseklikteki duraklar belirir (uçak, uzay sınırı, istasyon, uydular), sonunda Ay.
// Birim km. Dünya yüzeyi başta düz bir yay, uzaklaştıkça küçük bir daireye dönüşür.
import { W, H, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const R_EARTH = 6371, R_MOON = 1737;

export function buildAltitudeTimeline(ep) {
  const T = ep.timing;
  const runs = ep.stops.map((s, i) => ({ ...s, t0: T.runs[i][0], t1: T.runs[i][1], from: i ? ep.stops[i - 1].n : 1 }));
  const hero = runs[runs.length - 1];
  return { beat: 60 / ep.bpm, runs, heroLand: hero.t1, silence0: hero.t1 - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function altitudeSummary(ep) {
  const tl = buildAltitudeTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.2, ...tl.runs.flatMap(r => [(r.t0 + r.t1) / 2, r.t1 + 0.4]), tl.heroLand + 1.5, tl.rw0 + 0.3],
    fast: (tl.runs[2].t0 + tl.runs[2].t1) / 2, lastLand: tl.runs[tl.runs.length - 2].t1, firstLand: tl.runs[0].t1 };
}
export function altitudeCues(ep) {
  const tl = buildAltitudeTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: tl.runs.map((r, i) => ({ t0: r.t0, t1: i === tl.runs.length - 1 ? tl.silence0 : r.t1, hero: i === tl.runs.length - 1 })),
    lands: tl.runs.slice(0, -1).map(r => r.t1), tallies: [] };
}

export function makeAltitudeRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildAltitudeTimeline(ep);
  const D = tl.duration;
  const E = ep.unitKm;                              // bir Everest (km)
  const X0 = 400, GY = 1372;                        // yığının ekrandaki tabanı
  const FITPX = 420;                                // tepe yüksekliği bu kadar piksele sığdırılır (tepedeki durak görünür kalır)
  const MOON_D = ep.moon.surfaceKm;                 // yüzeyden yüzeye
  const rnd = mulberry32(5);
  const STARS = Array.from({ length: 90 }, () => ({ x: rnd() * W, y: 760 + rnd() * 660, r: 0.8 + rnd() * 1.7 }));

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  // kaç Everest (gerçek sayı): koşu içinde logaritmik büyür
  function count(t) {
    let n = 1;
    for (const r of tl.runs) {
      if (t < r.t0) break;
      const u = ease.state(seg(t, r.t0, r.t1 - r.t0));
      n = Math.exp(lerp(Math.log(r.from), Math.log(r.n), u));
    }
    return n;
  }
  // kamera: tepe FITPX'e sığar, %25 gecikmeyle; beklemelerde %5 yaklaşır
  const fitS = n => FITPX / Math.max(n * E, 1e-9);
  function scale(t) {
    let s = fitS(1), prev = fitS(1);
    for (const [i, r] of tl.runs.entries()) {
      if (t < r.t0) break;
      const d = r.t1 - r.t0, target = i === tl.runs.length - 1 ? (FITPX - 120) / MOON_D : fitS(r.n); // Ay'ın büyütülmüş gövdesine yer kalır
      const u = ease.state(seg(t, r.t0 + d * 0.25, d * 0.85));
      const next = tl.runs[i + 1] ? tl.runs[i + 1].t0 : tl.rw0, settle = r.t0 + d * 1.1;
      s = Math.exp(lerp(Math.log(prev), Math.log(target), u)) * (1 + 0.09 * Math.max(0, Math.min(1, (t - settle) / (next - settle))));
      prev = target * 1.09;
    }
    return s;
  }

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  const Y = (km, s) => GY - km * s;

  function sky(s, t) {
    // uzay sınırının üstünde yıldızlar belirir (ölçek küçüldükçe)
    const a = Math.max(0, Math.min(1, (Math.log(fitS(10)) - Math.log(s)) / 2.2));
    if (a <= 0) return;
    const drift = ((t / D) * 40) % 40;
    ctx.fillStyle = `rgba(28,27,24,${0.32 * a})`;
    for (const st of STARS) { const y = st.y + drift; ctx.beginPath(); ctx.arc(st.x, y > 1420 ? y - 660 : y, st.r, 0, Math.PI * 2); ctx.fill(); }
  }
  function earth(s, t) {
    const r = Math.max(R_EARTH * s, 96), cy = GY + r; // uzaktan okunabilsin diye en az 70 px
    ctx.save();
    ctx.beginPath(); ctx.arc(X0, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#E2D9C4'; ctx.fill();
    // uzaktan bakınca kıtalar döner (sürekli döngü, döngüye kilitli)
    if (r < 400) { ctx.save(); ctx.clip(); const rot = ((t / D) * 3) % 1; ctx.fillStyle = 'rgba(28,27,24,0.28)';
      for (const [ox, oy, w, h] of [[-0.6, -0.55, 0.5, 0.3], [0.1, -0.7, 0.35, 0.22], [0.5, -0.4, 0.4, 0.35], [-0.2, -0.25, 0.3, 0.2]]) for (const sh of [-2, 0, 2]) {
        ctx.beginPath(); ctx.ellipse(X0 + (((ox + rot * 2 + sh + 3) % 4) - 2) * r, cy + oy * r, w * r * 0.5, h * r * 0.5, 0.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore(); }
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(X0, cy, r, 0, Math.PI * 2); ctx.stroke();
    // atmosfer çizgisi (100 km): yalnızca dünya küçükken
    ctx.restore();
    if (r > 4000) { // yakın plan: zemin dokusu
      ctx.save(); ctx.beginPath(); ctx.rect(0, GY, W, 60); ctx.clip();
      ctx.strokeStyle = 'rgba(28,27,24,0.18)'; ctx.lineWidth = 2;
      for (let x = -40; x < W + 40; x += 22) { ctx.beginPath(); ctx.moveTo(x, GY + 6); ctx.lineTo(x + 18, GY + 40); ctx.stroke(); }
      ctx.restore();
    }
    if (R_EARTH * s < 140) { setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.fillText('DÜNYA', X0 + r * 0.75 + 16, GY + 34); }
  }
  function moon(s, t) {
    const r = Math.max(R_MOON * s, 58), y = Y(MOON_D, s) - r; // yüzeyi yığının tepesine değer
    if (y + r < 905) return;
    ctx.save(); ctx.beginPath(); ctx.arc(X0, y, Math.max(r, 2), 0, Math.PI * 2); ctx.fillStyle = '#F4EEDF'; ctx.fill();
    ctx.clip(); ctx.fillStyle = 'rgba(28,27,24,0.16)';
    for (const [ox, oy, rr] of [[-0.35, -0.2, 0.22], [0.3, 0.25, 0.16], [0.1, -0.45, 0.12], [-0.1, 0.4, 0.1]]) { ctx.beginPath(); ctx.arc(X0 + ox * r, y + oy * r, rr * r, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(X0, y, Math.max(r, 2), 0, Math.PI * 2); ctx.stroke();
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.fillText('AY', X0 + r + 22, y + 10);
    if (R_MOON * s < 58) { setFont(ctx, F.mono(26)); ctx.fillStyle = C.graphite; ep.scaleNote.split('; ').forEach((ln, i) => ctx.fillText(ln, 560, 1010 + i * 34)); }
  }
  // yığın: tek tek dağlar; dağlar 3 px'ten küçülünce ince bir sütun
  function stack(n, s, t, red) {
    const e = E * s, w = 1.25 * E * s;
    const top = Y(n * E, s);
    const col = red ? C.red : C.ink;
    if (e >= 3) {
      const whole = Math.floor(n), frac = n - whole;
      const visible = Math.min(whole, Math.ceil((GY - 560) / e) + 1);
      for (let i = 0; i < visible; i++) mountain(X0, GY - i * e, w, e, 1, col, i === 0);
      if (frac > 0.02 && whole < visible + 1) mountain(X0, GY - whole * e, w, e, frac, col, false);
    } else {
      ctx.fillStyle = col; const cw = red ? 8 : Math.max(3, w * 0.6);
      ctx.fillRect(X0 - cw / 2, Math.max(top, 0), cw, GY - Math.max(top, 0));
      // zikzak dokusu: aşağı doğru kayan küçük çentikler (dağların sürekli dizildiğini hissettirir)
    }
    return top;
  }
  function mountain(x, base, w, h, frac, col, first) {
    // Everest silueti: iki omuzlu tepe; frac < 1 ise aşağıdan yukarı doluyor
    const hh = h * frac;
    ctx.save();
    ctx.beginPath(); ctx.rect(x - w, base - hh, w * 2, hh + 1); ctx.clip();
    ctx.beginPath();
    ctx.moveTo(x - w / 2, base); ctx.lineTo(x - w * 0.24, base - h * 0.58); ctx.lineTo(x - w * 0.14, base - h * 0.5);
    ctx.lineTo(x, base - h); ctx.lineTo(x + w * 0.12, base - h * 0.74); ctx.lineTo(x + w * 0.2, base - h * 0.8); ctx.lineTo(x + w / 2, base); ctx.closePath();
    ctx.fillStyle = '#F4EEDF'; ctx.fill();
    // kar: tepenin üst %25'i
    ctx.save(); ctx.clip(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - w, base - h, w * 2, h * 0.25); ctx.restore();
    ctx.lineWidth = Math.max(1.5, Math.min(4, h * 0.012)); ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.stroke();
    ctx.restore();
  }

  // duraklar: gerçek yükseklikte simge ve etiket
  function marker(m, s, t, n) {
    const y = Y(m.km, s);
    if (y < 900 || y > GY - 34) return; // yüzeye yapışan durak gizlenir
    const reached = n * E >= m.km;
    const a = ease.enter(seg(t, m.appear ?? 0, 0.4));
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a * (reached ? 1 : 0.55);
    if (m.kind === 'line') {
      ctx.setLineDash([12, 10]); ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(SAFE.x0, y); ctx.lineTo(SAFE.x1, y); ctx.stroke(); ctx.setLineDash([]);
    } else icon(m.kind, X0 + 86, y, t);
    // uydu: Dünya'ya doğru yayın dalgaları (ulaşıldıktan sonra, sürekli)
    if (m.kind === 'sat' && reached) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      for (let k = 0; k < 3; k++) { const u = (((t - (m.appear ?? 0)) / 0.9) + k / 3) % 1; ctx.globalAlpha = a * (1 - u) * 0.8;
        ctx.beginPath(); ctx.arc(X0 + 86, y + 10, 24 + u * 150, Math.PI * 0.25, Math.PI * 0.75); ctx.stroke(); }
      ctx.globalAlpha = a;
    }
    setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
    const [nm, val] = m.label.split(' · ');
    const lx = m.kind === 'line' ? 560 : X0 + 140;
    ctx.fillText(nm, lx, y - (m.kind === 'line' ? 44 : 6)); ctx.fillStyle = C.graphite; ctx.fillText(val, lx, y + (m.kind === 'line' ? -12 : 26));
    ctx.restore();
  }
  function icon(kind, x, y, t) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = C.ink; ctx.fillStyle = C.paper; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    if (kind === 'plane') {
      ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-30, -6, -20, -6); ctx.lineTo(26, -6); ctx.quadraticCurveTo(34, -3, 26, 3); ctx.lineTo(-20, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(-12, 16); ctx.lineTo(-4, 16); ctx.lineTo(10, -3); ctx.moveTo(-24, -5); ctx.lineTo(-30, -16); ctx.lineTo(-24, -16); ctx.lineTo(-16, -5); ctx.stroke();
    } else if (kind === 'iss') {
      ctx.fillRect(-6, -6, 12, 12); ctx.strokeRect(-6, -6, 12, 12);
      ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.stroke();
      for (const sx of [-34, -22, 22, 34]) { ctx.fillRect(sx - 5, -16, 10, 32); ctx.strokeRect(sx - 5, -16, 10, 32); }
    } else if (kind === 'sat') {
      ctx.fillRect(-8, -8, 16, 16); ctx.strokeRect(-8, -8, 16, 16);
      for (const sx of [-1, 1]) { ctx.fillRect(sx * 12 + (sx < 0 ? -22 : 0), -6, 22, 12); ctx.strokeRect(sx * 12 + (sx < 0 ? -22 : 0), -6, 22, 12); }
      ctx.beginPath(); ctx.arc(0, 14, 8, Math.PI, 0); ctx.stroke();
    }
    ctx.restore();
  }

  const SAYS = [{ t0: 0, t1: tl.runs[0].t1 - 0.25, text: ep.say.hook },
    ...tl.runs.slice(0, -1).map((r, i) => ({ t0: r.t1 - 0.04, t1: tl.runs[i + 1].t0 + 0.2, text: r.say })),
    { t0: tl.heroLand - 0.04, t1: tl.rw0, text: tl.runs[tl.runs.length - 1].say, red: true }];
  function says(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  function counter(t, n) {
    const red = t >= tl.heroLand && t < tl.rw0;
    const nn = red ? tl.runs[tl.runs.length - 1].n : Math.floor(n + 1e-6);
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite;
    ctx.fillText(`YÜKSEKLİK · ${nf.format(red ? MOON_D : Math.round(nn * E))} km`, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; const num = nf.format(nn); ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(ep.unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: dağları sayar, uzaya çıkınca zıplar, istasyonda bakar, uydulara giderken terler, Ay'da zıplar
  const R = tl.runs;
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: R[0].t0, expr: 'notr' },
    { type: 'count', t0: R[0].t0, t1: R[0].t1 - 0.05, from: 1, valueAt: t => Math.floor(count(t) + 1e-6), bubble: 'top' },
    { type: 'surprise', t0: R[0].t1 - 0.05, t1: R[0].t1 + 0.85 },
    { type: 'lookUp', t0: R[0].t1 + 0.85, t1: R[2].t0, expr: 'saskin' },
    { type: 'sweat', t0: R[2].t0, t1: R[3].t0 },
    { type: 'lookUp', t0: R[3].t0, t1: tl.heroLand - 0.05, expr: 'saskin' },
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
    // geri sarma: yığın hızla iner; son kare = kare 0
    const vt = t >= tl.rw0 ? lerp(tl.rw0, 0, ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4))) : t;
    const s = scale(vt), n = count(vt);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 905, W, 1440 - 905); ctx.clip();
    sky(s, t);
    earth(s, t);
    for (const m of ep.markers) marker(m, s, vt, n);
    moon(s, vt);
    stack(n, s, vt, t >= tl.heroLand && t < tl.rw0);
    ctx.restore();
    counter(t, n);
    if (t < tl.rw0) says(t);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

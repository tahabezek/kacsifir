// Sahne: nabız. Gerçek hızda atan kalp ve EKG şeridi; şerit önce saniyeleri, sonra bir günü, bir yılı ve bütün
// bir ömrü gösterecek kadar sıkışır. Atışlar sayılır; en sonda ömür cetvelinde kişisel bir işaret (yaş).
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
const YEAR = 365.25 * 86400;

export function buildPulseTimeline(ep) {
  const T = ep.timing;
  const zooms = ep.zooms.map((z, i) => ({ ...z, t0: T.zooms[i][0], t1: T.zooms[i][1] }));
  const hero = zooms[zooms.length - 1];
  return { beat: 60 / ep.bpm, zooms, hook: T.hook, heroLand: hero.t1, silence0: hero.t1 - (T.silence ?? 0.5), kickAt: hero.t1 + (T.kickDelay ?? 2.2), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function pulseSummary(ep) {
  const tl = buildPulseTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.0, 2.0, ...tl.zooms.flatMap(z => [(z.t0 + z.t1) / 2, z.t1 + 0.4]), tl.kickAt + 0.5, tl.rw0 + 0.3],
    fast: (tl.zooms[0].t0 + tl.zooms[0].t1) / 2, lastLand: tl.kickAt, firstLand: tl.zooms[0].t1 };
}
export function pulseCues(ep) {
  const tl = buildPulseTimeline(ep), per = 60 / ep.heartBpm;
  const beats = []; for (let b = per * 0.35; b < tl.hook; b += per) beats.push(b);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: tl.zooms.map((z, i) => ({ t0: z.t0, t1: i === tl.zooms.length - 1 ? tl.silence0 : z.t1, hero: false })),
    lands: [...beats, ...tl.zooms.slice(0, -1).map(z => z.t1), tl.kickAt], tallies: [] };
}

// EKG dalgası: P, QRS, T (Gauss toplamı), faz 0..1
const G = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s));
const ecg = p => 0.12 * G(p, 0.16, 0.025) - 0.12 * G(p, 0.285, 0.008) + 1.0 * G(p, 0.3, 0.009) - 0.28 * G(p, 0.318, 0.009) + 0.3 * G(p, 0.55, 0.04);

export function makePulseRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildPulseTimeline(ep);
  const D = tl.duration;
  const PER = 60 / ep.heartBpm, PH0 = 0.35;          // ilk atış PH0 * PER sonra
  const ST = { x0: 100, x1: 795, y: 1150, amp: 150 }; // şerit (sağı Sıfır'ın balonuna boş kalır)
  const LIFE = ep.lifeYears * YEAR;

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  // geçen süre (sn): açılışta gerçek zaman, sonra her yakınlaştırmada logaritmik büyür
  function elapsed(t) {
    // kare 0'da şeritte zaten E0 saniye var (kare 0 boş olmaz)
    let E = ep.E0 + Math.min(Math.max(0, t), tl.hook);
    let prev = ep.E0 + tl.hook;
    for (const z of tl.zooms) {
      if (t < z.t0) break;
      const u = ease.state(seg(t, z.t0, z.t1 - z.t0));
      E = Math.exp(lerp(Math.log(prev), Math.log(z.sec), u));
      prev = z.sec;
    }
    return E;
  }
  const beatsIn = E => Math.floor(E / PER + (1 - PH0));   // ilk atış PH0*PER'de

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // EKG kâğıdı: ince ızgara + kalın ızgara, sola akar (sürekli döngü, döngüye kilitli)
  function paper(t) {
    const top = ST.y - ST.amp - 30, bot = ST.y + ST.amp * 0.55 + 30;
    const step = 20, off = ((t / D) * Math.round(D * 40 / step) * step) % (step * 5);
    ctx.save(); ctx.beginPath(); ctx.rect(ST.x0, top, ST.x1 - ST.x0, bot - top); ctx.clip();
    for (let x = ST.x1 - off; x > ST.x0 - step * 5; x -= step) {
      const major = Math.round((ST.x1 - off - x) / step) % 5 === 0;
      ctx.strokeStyle = major ? 'rgba(28,27,24,0.16)' : 'rgba(28,27,24,0.07)'; ctx.lineWidth = major ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, top); ctx.lineTo(Math.round(x) + 0.5, bot); ctx.stroke();
    }
    for (let y = top, k = 0; y < bot; y += step, k++) {
      ctx.strokeStyle = k % 5 === 0 ? 'rgba(28,27,24,0.16)' : 'rgba(28,27,24,0.07)'; ctx.lineWidth = k % 5 === 0 ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(ST.x0, Math.round(y) + 0.5); ctx.lineTo(ST.x1, Math.round(y) + 0.5); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(ST.x0, top, ST.x1 - ST.x0, bot - top);
  }
  // şerit: soldan sağa 0 → E; açılışta son 3,5 sn görünür
  function trace(t, E, red) {
    const Wn = Math.max(ep.minWindow, E), t0 = E - Wn;
    const n = ST.x1 - ST.x0, spp = Wn / n; // saniye / piksel
    ctx.save(); ctx.strokeStyle = red ? C.red : C.ink; ctx.fillStyle = red ? C.red : C.ink; ctx.lineJoin = 'round'; ctx.lineWidth = 4;
    const yOf = v => ST.y - v * ST.amp;
    if (spp < PER / 60) { // tek tek dalgalar
      ctx.beginPath(); let started = false;
      for (let i = 0; i <= n * 2; i++) {
        const tt = t0 + (i / 2) * spp; if (tt < 0) continue;
        if (tt > E) break;
        const ph = ((tt / PER) + (1 - PH0) + 0.3) % 1; // R tepesi PH0*PER anına denk gelir
        const x = ST.x0 + i / 2, y = yOf(ecg(ph));
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const xe = ST.x0 + (E - t0) / spp; const ph = ((E / PER) + (1 - PH0) + 0.3) % 1;
      ctx.beginPath(); ctx.arc(xe, yOf(ecg(ph)), 9, 0, Math.PI * 2); ctx.fill();
    } else { // sıkışmış: atış içeren her piksel sütunu dikey bir çizgi (barkod), atışlar yoğunlaştıkça bant
      const dens = spp / PER;                       // piksel başına atış
      ctx.globalAlpha = dens >= 1 ? 0.62 : lerp(1, 0.62, dens);
      const yHi = yOf(1), yLo = yOf(-0.28), yBase = yOf(0.04);
      const xEnd = Math.min(n, (E - Math.max(0, t0)) / spp);
      if (dens >= 1) ctx.fillRect(ST.x0, yHi, xEnd, yLo - yHi);
      else {
        ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i < xEnd; i++) {
          const tA = Math.max(0, t0 + i * spp) - PH0 * PER, tB = t0 + (i + 1) * spp - PH0 * PER;
          if (Math.floor(tB / PER) > Math.floor(tA / PER)) { ctx.moveTo(ST.x0 + i + 0.5, yHi); ctx.lineTo(ST.x0 + i + 0.5, yLo); }
        }
        ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ST.x0, yBase); ctx.lineTo(ST.x0 + xEnd, yBase); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  // zaman cetveli: pencereye göre birim seçer
  function ruler(E) {
    const Wn = Math.max(ep.minWindow, E), t0 = E - Wn, spp = Wn / (ST.x1 - ST.x0), y = ST.y + ST.amp * 0.55 + 62;
    // adım: en fazla ~7 çentik olacak şekilde
    const M = 86400 * 30.44;
    const steps = [[1, 1, 'sn'], [5, 1, 'sn'], [15, 1, 'sn'], [60, 60, 'dk'], [300, 60, 'dk'], [900, 60, 'dk'], [3600, 3600, 'sa'], [3 * 3600, 3600, 'sa'], [6 * 3600, 3600, 'sa'], [86400, 86400, 'gün'], [7 * 86400, 86400, 'gün'], [M, M, 'ay'], [2 * M, M, 'ay'], [YEAR, YEAR, 'yıl'], [5 * YEAR, YEAR, 'yıl'], [10 * YEAR, YEAR, 'yıl'], [20 * YEAR, YEAR, 'yıl']];
    const [stepS, div, name] = steps.find(st => Wn / st[0] <= 7) || steps[steps.length - 1];
    setFont(ctx, F.mono(26)); ctx.fillStyle = C.graphite; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.textAlign = 'center';
    for (let v = Math.ceil(Math.max(0, t0) / stepS) * stepS; v <= E + 1e-6; v += stepS) {
      const x = ST.x0 + (v - t0) / spp;
      ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x, y - 6); ctx.stroke();
      ctx.fillText(`${nf.format(v / div)} ${name}`, x, y + 22);
    }
    ctx.textAlign = 'left';
  }
  // kalp: iki lop + uç; her atışta kısa büyüme (yay), mürekkep kontur
  function heart(t, E, red) {
    const x = 812, y = counterY - 58;
    // her fazda gerçek nabız: dakikada 70 (R tepesiyle aynı an)
    const sinceBeat = (((t / PER) + (1 - PH0)) % 1) * PER;
    const pulse = Math.exp(-sinceBeat * 9) * 0.16;
    const s = 84 * (1 + pulse);
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
    const p = new Path2D('M0 35 C -10 25 -60 0 -60 -30 C -60 -60 -20 -70 0 -40 C 20 -70 60 -60 60 -30 C 60 0 10 25 0 35 Z');
    ctx.fillStyle = red ? C.red : C.ink; ctx.fill(p);
    ctx.lineWidth = 7; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke(p);
    ctx.restore();
  }

  const Z = tl.zooms;
  const SAYS = [{ t0: 0, t1: Z[0].t0 + 0.4, text: ep.say.hook },
    ...Z.slice(0, -1).map((z, i) => ({ t0: z.t1 - 0.04, t1: Z[i + 1].t0 + 0.2, text: z.say })),
    { t0: tl.heroLand - 0.04, t1: tl.kickAt - 0.22, text: Z[Z.length - 1].say, red: true },
    { t0: tl.kickAt - 0.04, t1: tl.rw0, text: ep.say.kicker, red: true }];
  function says(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  const WORDS = [[1e9, 'milyar'], [1e6, 'milyon']];
  function counter(t, E) {
    const red = t >= tl.heroLand && t < tl.rw0;
    const b = red ? ep.heroBeats : beatsIn(E);
    let num = nf.format(b), word = '';
    if (b >= 1e7) for (const [lim, w] of WORDS) if (b >= lim) { num = nf1.format((red ? Math.round : Math.floor)((b / lim) * 10) / 10); word = w; break; }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite;
    ctx.fillText(red ? ep.label.hero : ep.label.travel, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(word ? `${word} ${ep.unit}` : ep.unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }
  // kişisel işaret: ömür şeridinde yaş
  function ageMark(t) {
    const a = ease.enter(seg(t, tl.kickAt, 0.5)) * (t < tl.rw0 ? 1 : 1 - ease.exit(seg(t, tl.rw0, 0.25)));
    if (a <= 0) return;
    const x = ST.x0 + (ep.age / ep.lifeYears) * (ST.x1 - ST.x0), top = ST.y - ST.amp - 30;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(236,229,213,0.72)'; ctx.fillRect(x, top, ST.x1 - x, ST.amp * 1.55 + 60);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, top - 26); ctx.lineTo(x, ST.y + ST.amp * 0.55 + 30); ctx.stroke();
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(ep.ageLabel, x, top - 38); ctx.textAlign = 'left';
    ctx.restore();
  }

  // Sıfır: elini kalbine koyup atışları sayar (gerçek zamanlı), şerit sıkışınca terler, ömürde zıplar, yaşında göz kırpar
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: PH0 * PER, expr: 'notr' },
    { type: 'count', t0: PH0 * PER, t1: Z[0].t0 + 0.4, from: 1, valueAt: t => Math.max(1, beatsIn(ep.E0 + Math.min(t, tl.hook))), label: n => `${n}. atım`, bubble: 'top' },
    { type: 'lookUp', t0: Z[0].t0 + 0.4, t1: Z[1].t0, expr: 'saskin' },
    { type: 'sweat', t0: Z[1].t0, t1: tl.heroLand - 0.05 },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'lookUp', t0: tl.heroLand + 0.85, t1: tl.kickAt, expr: 'saskin' },
    { type: 'happy', t0: tl.kickAt, t1: tl.rw0 },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    // geri sarma: şerit hızla açılır, son kare = kare 0
    const E = t >= tl.rw0 ? Math.exp(lerp(Math.log(ep.lifeYears * YEAR), Math.log(ep.E0), ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4)))) : elapsed(t);
    const red = t >= tl.heroLand && t < tl.rw0;
    paper(t);
    trace(t, E, red && t < tl.kickAt);
    ruler(E);
    ageMark(t);
    heart(t, E, red);
    counter(t, E);
    if (t < tl.rw0) says(t);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

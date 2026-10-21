// Sahne: zaman çizgisi. Yatay bir zaman cetveli; bir okuyucu kafa soldan sağa ilerler, işaretler (bayraklar)
// geçildiğinde dikilir, aralıklar (köşeli parantez) belirir. Sayaç: başlangıçtan bu yana geçen saniye ya da yıl.
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const DAY = 86400;

export function buildTimelineTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, heroLand: T.hero, silence0: T.hero - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function timelineSummary(ep) {
  const tl = buildTimelineTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, ...ep.marks.map(m => m.t + 0.4), tl.heroLand + 0.4, tl.kick + 0.6, tl.rw0 + 0.3],
    fast: (tl.run[0] + ep.marks[0].t) / 2, lastLand: tl.kick, firstLand: ep.marks[0].t };
}
export function timelineCues(ep) {
  const tl = buildTimelineTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.run[0], t1: tl.silence0, hero: false }],
    lands: [...ep.marks.filter(m => !m.hero).map(m => m.t), tl.kick], tallies: [] };
}

// tarih → gün (UTC, 1 Ocak 1970'ten); "MÖ" yılları negatif yıl olarak verilebilir (yaklaşık, gün = yıl × 365,25)
// gün → "7 TEMMUZ 1955" (Türkçe büyük harf)
const AYLAR = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
const dateLabel = d => { const dt = new Date(Math.floor(d) * 864e5); return `${dt.getUTCDate()} ${AYLAR[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`; };
const dayOf = d => (typeof d === 'number' ? (d - 1970) * 365.25 : Date.UTC(d[0], d[1] - 1, d[2]) / 864e5);

export function makeTimelineRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildTimelineTimeline(ep);
  const D = tl.duration;
  const A = { x0: 110, x1: 800, y: 1330 };                 // cetvel
  const d0 = dayOf(ep.axis.from), d1 = dayOf(ep.axis.to);
  const X = d => A.x0 + ((d - d0) / (d1 - d0)) * (A.x1 - A.x0);
  const marks = ep.marks.map(m => ({ ...m, d: dayOf(m.date) }));

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // okuyucu kafanın tarihi: işaretler arasında parça parça (her işarette varılır), doğrusal ilerler
  function headDay(t) {
    const pts = [{ t: tl.run[0], d: d0 }, ...marks.map(m => ({ t: m.t, d: m.d }))];
    if (t <= pts[0].t) return d0;
    for (let i = 1; i < pts.length; i++) if (t <= pts[i].t) return lerp(pts[i - 1].d, pts[i].d, ease.state(seg(t, pts[i - 1].t + 0.05, pts[i].t - pts[i - 1].t - 0.05)));
    return pts[pts.length - 1].d;
  }
  function ruler(t, hd) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(A.x0, A.y); ctx.lineTo(A.x1, A.y); ctx.stroke();
    // geçilen kısım kalın
    ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(A.x0, A.y); ctx.lineTo(X(hd), A.y); ctx.stroke();
    setFont(ctx, F.mono(26)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center';
    for (const y of ep.axis.ticks) {
      const x = X(dayOf(y)); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x, A.y + 10); ctx.lineTo(x, A.y + 26); ctx.stroke();
      ctx.fillText(y < 0 ? `MÖ ${-y}` : `${y}`, x, A.y + 58);
    }
    ctx.textAlign = 'left';
    // okuyucu kafa: sayfa üstünde kalem ucu
    const hx = X(hd);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(hx, A.y, 14, 0, Math.PI * 2); ctx.fill();
  }
  // bayrak: işaret geçilince dikilir (direk büyür, etiket açılır)
  function flags(t, hd) {
    for (const [i, m] of marks.entries()) {
      if (hd < m.d - 1e-6 && t < m.t) continue;
      const u = ease.enter(seg(t, m.t - 0.05, 0.35));
      const x = X(m.d), h = (m.h ?? (150 + (i % 2) * 90)) * u;
      const red = m.hero && t >= tl.heroLand && t < tl.rw0;
      ctx.strokeStyle = red ? C.red : C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, A.y); ctx.lineTo(x, A.y - h); ctx.stroke();
      if (u > 0.6) {
        const a = ease.enter(seg(t, m.t + 0.05, 0.3));
        ctx.save(); ctx.globalAlpha = a;
        setFont(ctx, F.head(38)); const lw = ctx.measureText(m.label).width; setFont(ctx, F.mono(27)); const sw = ctx.measureText(m.sub || '').width;
        const bw = Math.max(lw, sw) + 24, right = x + bw + 4 < SAFE.x1 + 10;
        const bx = right ? x : x - bw;
        ctx.fillStyle = red ? '#F6DCD3' : C.paper; ctx.fillRect(bx, A.y - h - 78, bw, 78);
        ctx.strokeRect(bx, A.y - h - 78, bw, 78);
        setFont(ctx, F.head(38)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(m.label, bx + 12, A.y - h - 38);
        setFont(ctx, F.mono(27)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(m.sub || '', bx + 12, A.y - h - 10);
        ctx.restore();
      }
    }
  }
  // aralıklar: iki tarih arası köşeli parantez + uzunluk etiketi
  function spans(t) {
    for (const s of ep.spans || []) {
      const a = ease.enter(seg(t, s.t, 0.4)) * (t < tl.rw0 ? 1 : 1 - ease.exit(seg(t, tl.rw0, 0.3)));
      if (a <= 0) continue;
      const xa = X(dayOf(s.from)), xb = lerp(xa, X(dayOf(s.to)), ease.state(seg(t, s.t, 0.6))), y = A.y + 100 + (s.row ?? 0) * 70;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = s.red ? C.red : C.ink; ctx.fillStyle = s.red ? C.red : C.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(xa, y - 14); ctx.lineTo(xa, y); ctx.lineTo(xb, y); ctx.lineTo(xb, y - 14); ctx.stroke();
      setFont(ctx, F.head(32)); ctx.textAlign = 'center'; ctx.fillText(s.label, (xa + xb) / 2, y + 38); ctx.textAlign = 'left';
      ctx.restore();
    }
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
  function counter(t, hd) {
    const red = t >= tl.heroLand && t < tl.rw0;
    let num, unit, label;
    if (ep.counter.mode === 'seconds') { const s = red ? ep.counter.heroValue : Math.max(0, (hd - d0)) * DAY; num = nf.format(Math.floor(s)); unit = 'saniye'; }
    else { const y = red ? ep.counter.heroValue : Math.max(0, (hd - d0) / 365.25); num = nf.format(Math.floor(y + 1e-6)); unit = 'yıl'; }
    label = red ? ep.counter.heroLabel : ep.counter.label || dateLabel(hd);
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    let size = 124; setFont(ctx, F.head(size)); while (ctx.measureText(num).width > 640 && size > 80) { size -= 4; setFont(ctx, F.head(size)); }
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: gerçek saniyeleri saymaya başlar, kafa uçarken terler, dorukta zıplar, sonra sevinir
  const actorScript = [
    { type: 'count', t0: 0.3, t1: marks[0].t, from: 1, valueAt: t => Math.max(1, Math.floor(t - 0.3) + 1), label: n => `${n} sn`, bubble: 'top' },
    { type: 'sweat', t0: marks[0].t, t1: tl.heroLand - 0.05 },
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
    const vt = t >= tl.rw0 ? lerp(tl.heroLand, 0, ease.state(seg(t, tl.rw0 + 0.3, (tl.rw1 - tl.rw0) - 0.7))) : t;
    const hd = headDay(vt);
    const holds = [[tl.heroLand, tl.rw0]];
    let z = 1; for (const [a, b] of holds) z *= 1 + 0.04 * Math.max(0, Math.min(1, (t - a) / (b - a)));
    if (t >= tl.rw0) z = lerp(1.04, 1, ease.state(seg(t, tl.rw0, 0.4)));
    ctx.save(); ctx.translate(460, 1150); ctx.scale(z, z); ctx.translate(-460, -1150);
    ruler(vt, hd); flags(vt, hd); spans(t);
    ctx.restore();
    counter(t >= tl.rw0 ? vt : t, hd);
    if (t < tl.rw0 + 0.2) says(t);
    else if (t > tl.rw1 - 0.5) { setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink)); }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

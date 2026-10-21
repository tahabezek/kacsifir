// Sahne: sıfırlar düşer. Gravür üslubunda bir banknot; sıfırlar tek tek kopar, yerçekimiyle düşer ve yerde birikir,
// kalan rakamlar yeniden ortalanır. Doruk: kalan sayı kırmızı damga. Kıyas: başka bir banknot yandan gelir.
import { W, H, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };

export function buildZerosTimeline(ep) {
  const T = ep.timing;
  const n = ep.drop.count;
  const drops = Array.from({ length: n }, (_, i) => T.drop[0] + i * ((T.drop[1] - T.drop[0]) / Math.max(1, n - 1)));
  return { beat: 60 / ep.bpm, drops, heroLand: T.heroLand, silence0: T.heroLand - (T.silence ?? 0.5), kickAt: T.kick, otherAt: T.other, says: T.says, rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function zerosSummary(ep) {
  const tl = buildZerosTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.5, tl.says[1] + 1, tl.drops[0] + 0.5, tl.drops[Math.floor(tl.drops.length / 2)] + 0.3, tl.drops[tl.drops.length - 1] + 0.6, tl.heroLand + 0.4, tl.kickAt + 0.6, tl.otherAt + 1.2, tl.rw0 + 0.3],
    fast: tl.drops[0] + 0.3, lastLand: tl.otherAt + 1, firstLand: tl.drops[0] + 0.6 };
}
export function zerosCues(ep) {
  const tl = buildZerosTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [], lands: [...tl.drops.map(t => t + 0.55), tl.kickAt, tl.otherAt + 0.6], tallies: tl.drops.map(t => ({ t, accent: true })) };
}

export function makeZerosRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildZerosTimeline(ep);
  const D = tl.duration;
  const NOTE = { x: 460, y: 1085, w: 700, h: 330 };
  const FLOOR = 1396;
  const rnd = mulberry32(20);

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  // banknot üzerindeki sayı: karakterler; hangi sıfırlar hangi sırayla düşer (sağdan sola)
  const chars = ep.note.number.split('');
  const zeroIdx = []; for (let i = chars.length - 1; i >= 0 && zeroIdx.length < ep.drop.count; i--) if (chars[i] === '0') zeroIdx.push(i);
  const dropOf = i => zeroIdx.indexOf(i);                     // -1: kalır
  // nokta: sağındaki üç hane gidince söner
  const dotGone = (i, k) => { const right = chars.slice(i + 1).map((c, j) => i + 1 + j).filter(j => chars[j] !== '.'); return right.slice(0, 3).every(j => dropOf(j) >= 0 && dropOf(j) < k); };
  const NUM = 100;
  const PILE = Array.from({ length: ep.drop.count }, (_, k) => ({ x: 130 + k * 88 + (rnd() - 0.5) * 14, rot: (rnd() - 0.5) * 0.5 }));

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // gravür banknot: çift çerçeve, gilyoş dalgaları, köşe rozetleri, filigran oval; gerçek bir tasarımı taklit etmez
  function note(t, cx, cy, text, sub, a, phase, tint) {
    if (a <= 0) return;
    const { w, h } = NOTE;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy);
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 14); ctx.fillStyle = tint; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.13)'; ctx.lineWidth = 1.5;
    for (let k = 0; k < 16; k++) { ctx.beginPath(); for (let x = -w / 2; x <= w / 2; x += 6) { const y = -h / 2 + 30 + k * 20 + Math.sin(x / 38 + k * 0.6 + phase) * 9; x === -w / 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    for (const [rx, ry] of [[-w / 2 + 70, -h / 2 + 70], [w / 2 - 70, -h / 2 + 70], [-w / 2 + 70, h / 2 - 70], [w / 2 - 70, h / 2 - 70]]) {
      ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1.5;
      for (let k = 0; k < 12; k++) { const an = (k / 12) * Math.PI + phase * 0.5; ctx.beginPath(); ctx.ellipse(rx, ry, 42, 15, an, 0, Math.PI * 2); ctx.stroke(); }
    }
    // filigran oval (sol)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-w / 2 + 150, 10, 80, 110, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(28,27,24,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 14); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8); ctx.stroke();
    setFont(ctx, F.mono(24)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText(sub, 60, h / 2 - 40);
    ctx.textAlign = 'left';
    ctx.restore();
  }
  // sayı: kalan karakterler yeniden ortalanır; düşen sıfırlar ayrı çizilir
  function layout(k) { // k sıfır düştükten sonra görünen karakterler ve x konumları
    setFont(ctx, F.head(NUM));
    const vis = chars.map((c, i) => ({ c, i })).filter(({ c, i }) => !(dropOf(i) >= 0 && dropOf(i) < k) && !(c === '.' && dotGone(i, k)));
    const widths = vis.map(v => ctx.measureText(v.c).width);
    const total = widths.reduce((a, b) => a + b, 0);
    let x = NOTE.x + 40 - total / 2; const pos = {};
    vis.forEach((v, j) => { pos[v.i] = x; x += widths[j]; });
    return pos;
  }
  const LAYOUTS = Array.from({ length: ep.drop.count + 1 }, (_, k) => layout(k));
  function numberOnNote(t, red) {
    let k = 0; for (const d of tl.drops) if (t >= d) k++;
    const prev = LAYOUTS[Math.max(0, k - 1)], cur = LAYOUTS[k];
    const u = k ? ease.state(seg(t, tl.drops[k - 1] + 0.12, 0.35)) : 1;
    const y = NOTE.y + 30;
    setFont(ctx, F.head(NUM));
    for (const [i, c] of chars.entries()) {
      const di = dropOf(i);
      if (di >= 0 && t >= tl.drops[di]) continue; // düşüyor ya da yerde
      if (c === '.' && dotGone(i, k)) {
        // nokta söner
        const lastNeeded = Math.max(...chars.map((cc, j) => j).filter(j => j > i && j <= i + 3 && dropOf(j) >= 0).map(j => dropOf(j)));
        const a = 1 - ease.exit(seg(t, tl.drops[lastNeeded], 0.25));
        if (a <= 0) continue;
        ctx.globalAlpha = a; ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(c, prev[i] ?? cur[i] ?? NOTE.x, y); ctx.globalAlpha = 1; continue;
      }
      const x = lerp(prev[i] ?? cur[i], cur[i] ?? prev[i], u);
      ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(c, x, y);
    }
  }
  function fallingZeros(t) {
    setFont(ctx, F.head(NUM));
    const zw = ctx.measureText('0').width;
    for (const [di, i] of zeroIdx.entries()) {
      const t0 = tl.drops[di];
      if (t < t0) continue;
      const x0 = LAYOUTS[di][i], y0 = NOTE.y + 30;
      const p = PILE[di];
      const ft = 0.55, u = Math.min(1, (t - t0) / ft);
      // yerçekimi: y = y0 + (FLOOR - y0) · u²; x yığındaki yerine kayar; hafif dönüş
      const x = lerp(x0, p.x, ease.state(u)), y = lerp(y0, FLOOR - 10, u * u);
      const rot = p.rot * u;
      ctx.save(); ctx.translate(x + zw / 2, y - NUM * 0.36); ctx.rotate(rot);
      // iniş ezilmesi (60 ms)
      const sq = u >= 1 ? 1 - 0.12 * Math.max(0, 1 - (t - t0 - ft) / 0.08) : 1;
      ctx.scale(1 / sq, sq);
      ctx.fillStyle = C.ink; ctx.fillText('0', -zw / 2, NUM * 0.36);
      ctx.restore();
    }
    // zemin çizgisi
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SAFE.x0, FLOOR); ctx.lineTo(760, FLOOR); ctx.stroke();
  }
  // doruk damgası: kırmızı çerçeveli "YTL" damgası
  function stamp(t) {
    if (t < tl.heroLand || t >= tl.rw0 + 0.3) return;
    const a = t < tl.rw0 ? 1 : 1 - ease.exit(seg(t, tl.rw0, 0.3));
    const second = t >= tl.kickAt;
    const s = lerp(1.25, 1, ease.enter(seg(t, second ? tl.kickAt : tl.heroLand, 0.18)));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(NOTE.x - 175, NOTE.y - 40); ctx.rotate(-0.14); ctx.scale(s, s);
    ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.strokeRect(-110, -44, 220, 88);
    setFont(ctx, F.head(64)); ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.fillText(second ? ep.stamp2 : ep.stamp, 0, 22); ctx.textAlign = 'left';
    ctx.restore();
  }

  const S = tl.says;
  const SAYS = [{ t0: 0, t1: S[1] - 0.2, text: ep.say[0] },
    { t0: S[1], t1: S[2] - 0.2, text: ep.say[1] },
    { t0: S[2], t1: tl.silence0, text: ep.say[2] },
    { t0: tl.heroLand - 0.04, t1: tl.kickAt - 0.2, text: ep.say[3], red: true },
    { t0: tl.kickAt, t1: tl.otherAt - 0.2, text: ep.say[4] },
    { t0: tl.otherAt + 0.5, t1: tl.rw0, text: ep.say[5] }];
  function says(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  function counter(t) {
    let k = 0; for (const d of tl.drops) if (t >= d) k++;
    const red = t >= tl.heroLand && t < tl.kickAt;
    let label, num, unit;
    if (t >= tl.otherAt + 0.5) { label = ep.other.label; num = `${ep.other.zeros}`; unit = 'sıfır'; }
    else if (t >= tl.kickAt) { label = ep.kick.label; num = ep.hero.num; unit = ep.kick.unit; }
    else if (t >= tl.heroLand) { label = ep.hero.label; num = ep.hero.num; unit = ep.hero.unit; }
    else { label = k ? ep.label.dropped : ep.label.zeros; num = `${k ? k : ep.label.total}`; unit = k ? 'sıfır silindi' : 'sıfır'; }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: banknota bakar; sıfırlar düşmeye başlayınca terler (kendisi de bir sıfır), dorukta şaşırır, sonra sevinir
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.drops[0], expr: 'notr' },
    { type: 'sweat', t0: tl.drops[0], t1: tl.heroLand - 0.05 },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'happy', t0: tl.heroLand + 0.85, t1: tl.otherAt + 0.4 },
    { type: 'surprise', t0: tl.otherAt + 0.4, t1: tl.otherAt + 1.25 },
    { type: 'lookUp', t0: tl.otherAt + 1.25, t1: tl.rw0, expr: 'saskin' },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    // geri sarma: sıfırlar yerden kalkıp banknota döner (zaman tersine), son kare = kare 0
    const vt = t >= tl.rw0 ? lerp(tl.otherAt - 0.01, 0, ease.state(seg(t, tl.rw0 + 0.3, (tl.rw1 - tl.rw0) - 0.7))) : t;
    const phase = (t / D) * Math.PI * 2 * Math.round(D / 6); // gilyoş dalgaları yavaşça akar (döngüye kilitli)
    // ikinci banknot: yandan gelir, ilki sola kayar (aynı yatay eksen)
    const sw = t >= tl.rw0 ? 1 - ease.state(seg(t, tl.rw0, 0.4)) : ease.state(seg(t, tl.otherAt, 0.6));
    ctx.save(); ctx.translate(-sw * 1080, 0);
    const tl2 = vt >= tl.kickAt && t < tl.rw0;
    note(t, NOTE.x, NOTE.y, '', vt >= tl.heroLand ? (tl2 ? ep.note.subFinal : ep.note.subAfter) : ep.note.sub, 1, phase, '#ECE7D6');
    numberOnNote(vt, t >= tl.heroLand && t < tl.kickAt);
    stamp(t);
    fallingZeros(vt);
    ctx.restore();
    if (sw > 0) {
      ctx.save(); ctx.translate((1 - sw) * 1080, 0);
      note(t, NOTE.x, NOTE.y, '', ep.other.sub, 1, phase, '#E7E3D2');
      setFont(ctx, F.head(ep.other.size)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(ep.other.number, NOTE.x + 40, NOTE.y + 22); ctx.textAlign = 'left';
      ctx.restore();
    }
    counter(t >= tl.rw0 ? (t >= tl.rw0 + 0.3 ? vt : tl.otherAt + 0.6) : t);
    if (t < tl.rw0 + 0.2) says(t);
    else if (t > tl.rw1 - 0.5) { setFont(ctx, F.name(50)); wrap(ctx, ep.say[0], SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink)); }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

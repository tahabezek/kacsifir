// Sahne: samanlıkta iğne. Olasılıklar saniyeye çevrilir; yıl takvimi gün gün dolar; sonra kamera tek bir güne,
// saate, dakikaya ve en sonda tek bir saniyeye dalar (kırmızı). "Kazanmak = bu sürenin içinden tek saniyeyi bilmek."
import { W, H, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
const DAY = 86400, YEARD = 365.25;

export function buildNeedleTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, heroLand: T.dive[T.dive.length - 1][1], silence0: T.dive[T.dive.length - 1][1] - (T.silence ?? 0.5), duration: T.rewind[1], rw0: T.rewind[0], rw1: T.rewind[1] };
}
export function needleSummary(ep) {
  const tl = buildNeedleTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.2, tl.balls[1] + 0.3, tl.fill[0] + 0.5, tl.oldLand + 0.4, tl.fill[1] + 0.4, ...tl.dive.map(d => d[1] - 0.05), tl.heroLand + 1.5, tl.rw0 + 0.3],
    fast: (tl.fill[0] + tl.fill[1]) / 2, lastLand: tl.fill[1], firstLand: tl.balls[1] };
}
export function needleCues(ep) {
  const tl = buildNeedleTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.fill[0], t1: tl.fill[1], hero: false }],
    lands: [...ep.picks.map((_, i) => lerp(tl.balls[0], tl.balls[1], (i + 1) / ep.picks.length)), tl.oldLand, tl.fill[1], ...tl.dive.slice(0, -1).map(d => d[1])], tallies: [] };
}

export function makeNeedleRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildNeedleTimeline(ep);
  const D = tl.duration;
  const TOTAL = ep.combos;                                   // saniye
  const YEARS = Math.ceil(TOTAL / (YEARD * DAY));            // satır sayısı
  const CAL = { x: 130, y: 905, w: 670, h: 460 };            // takvim alanı
  const rowH = CAL.h / YEARS, dayW = CAL.w / 366;
  const target = ep.target;                                   // {year, day, hour, minute, second}

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }

  // ——— 1) toplar: 9 × 10 ızgara, 6'sı sırayla seçilir ———
  function balls(t, a) {
    if (a <= 0) return;
    const cols = 10, r = 30, gx = 82, gy = 52, x0 = 140, y0 = 940;
    ctx.save(); ctx.globalAlpha *= a;
    setFont(ctx, F.mono(22)); ctx.textAlign = 'center';
    for (let n = 1; n <= 90; n++) {
      const i = (n - 1) % cols, j = Math.floor((n - 1) / cols), x = x0 + i * gx, y = y0 + j * gy;
      const k = ep.picks.indexOf(n);
      const on = k >= 0 && t >= lerp(tl.balls[0], tl.balls[1], (k + 1) / ep.picks.length) - 0.05;
      const p = on ? spring(t - lerp(tl.balls[0], tl.balls[1], (k + 1) / ep.picks.length), 320, 30) : 0;
      ctx.beginPath(); ctx.arc(x, y, r * 0.72 * (1 + 0.15 * p), 0, Math.PI * 2);
      ctx.fillStyle = on ? C.ink : '#F4EEDF'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = on ? C.paper : C.ink; ctx.fillText(`${n}`, x, y + 8);
    }
    ctx.textAlign = 'left'; ctx.restore();
  }

  // ——— 2) takvim: her satır bir yıl; günler soldan sağa dolar ———
  function filled(t) { // dolan saniye
    // önce eski oyunun süresine kadar sabit hız (162 gün), sonra aynı hızla bir süre, sonra logaritmik hızlanma
    if (t < tl.fill[0]) return 0;
    const rate = ep.oldCombos / (tl.oldLand - tl.fill[0]);
    if (t <= tl.accel) return rate * (t - tl.fill[0]);
    const sa = rate * (tl.accel - tl.fill[0]);
    const u = ease.enter(seg(t, tl.accel, tl.fill[1] - tl.accel));
    return Math.exp(lerp(Math.log(sa), Math.log(TOTAL), u));
  }
  function calendar(t, a, zoom) {
    if (a <= 0) return;
    const sec = filled(t), days = sec / DAY;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.beginPath(); ctx.rect(20, 880, SAFE.x1 - 10, 520); ctx.clip();
    // yakınlaşma: hedef günün hücresine doğru (zoom ≥ 1)
    const tx = CAL.x + (target.day + 0.5) * dayW, ty = CAL.y + (target.year + 0.5) * rowH;
    ctx.translate(tx, ty); ctx.scale(zoom, zoom); ctx.translate(-tx, -ty);
    for (let y = 0; y < YEARS; y++) {
      const yy = CAL.y + y * rowH, rowDays = Math.max(0, Math.min(YEARD, days - y * YEARD));
      ctx.fillStyle = '#F4EEDF'; ctx.fillRect(CAL.x, yy + 2, YEARD * dayW, rowH - 4);
      if (rowDays > 0) { ctx.fillStyle = y * YEARD + rowDays <= ep.oldCombos / DAY ? C.ink : C.graphite; ctx.fillRect(CAL.x, yy + 2, rowDays * dayW, rowH - 4); }
      // eski oyunun bittiği yer: ilk satırda mürekkep, sonrası grafit
      if (y === 0 && days > ep.oldCombos / DAY) { ctx.fillStyle = C.ink; ctx.fillRect(CAL.x, yy + 2, (ep.oldCombos / DAY) * dayW, rowH - 4); }
      ctx.lineWidth = 1.5 / zoom; ctx.strokeStyle = 'rgba(28,27,24,0.5)'; ctx.strokeRect(CAL.x, yy + 2, YEARD * dayW, rowH - 4);
      if (zoom < 3 && (y % 5 === 4 || y === 0)) { setFont(ctx, F.mono(22)); ctx.fillStyle = C.graphite; ctx.textAlign = 'right'; ctx.fillText(`${y + 1}. yıl`, CAL.x - 10, yy + rowH * 0.75); ctx.textAlign = 'left'; }
    }
    // dolum ucu: kalem
    if (sec > 0 && sec < TOTAL && zoom < 2) {
      const y = Math.floor(days / YEARD), x = CAL.x + (days - y * YEARD) * dayW, yy = CAL.y + y * rowH;
      ctx.fillStyle = C.ink; ctx.fillRect(x - 2, yy - 4, 5, rowH + 8);
    }
    // eski oyun işareti
    if (t >= tl.oldLand - 0.05 && zoom < 2) {
      const x = CAL.x + (ep.oldCombos / DAY) * dayW, yy = CAL.y;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, yy - 30); ctx.lineTo(x, yy + rowH); ctx.stroke();
      setFont(ctx, F.mono(24)); ctx.fillStyle = C.ink; ctx.fillText(ep.oldLabel, x + 8, yy - 12);
    }
    ctx.restore();
  }

  // ——— 3) dalış: gün → 24 saat → 60 dakika → 60 saniye; her seviye bir şerit ———
  const LEVELS = [{ n: 24, name: 'saat', pick: target.hour }, { n: 60, name: 'dakika', pick: target.minute }, { n: 60, name: 'saniye', pick: target.second }];
  function dive(t) {
    const S = { x: SAFE.x0 + 10, w: 810, y: 1040, h: 130 };
    // doruk: seçilen anın tam zamanı, kırmızı
    if (t >= tl.heroLand && t < tl.rw0) {
      const a = ease.enter(seg(t, tl.heroLand + 0.5, 0.4));
      const pad = n => String(n).padStart(2, '0');
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.red; ctx.globalAlpha = a;
      ctx.fillText(`${target.year + 1}. yıl · ${target.day + 1}. gün · ${pad(target.hour)}:${pad(target.minute)}:${pad(target.second)}`, S.x, S.y + S.h + 100);
      ctx.globalAlpha = 1;
    }
    for (const [i, L] of LEVELS.entries()) {
      const [a, b] = tl.dive[i];
      const next = tl.dive[i + 1];
      const pin = ease.enter(seg(t, a, b - a));
      const pout = next ? ease.exit(seg(t, next[0], 0.35)) : (t >= tl.rw0 ? ease.exit(seg(t, tl.rw0, 0.3)) : 0);
      if (pin <= 0 || pout >= 1) continue;
      // önceki seviyenin seçili hücresi bu şeride açılır: x ölçeği büyür
      const cw = S.w / L.n, sx = S.x, grow = lerp(0.04, 1, pin);
      const cx = S.x + (L.pick + 0.5) * cw;
      ctx.save(); ctx.globalAlpha = 1 - pout;
      ctx.translate(cx, S.y + S.h / 2); ctx.scale(grow, 1); ctx.translate(-cx, -(S.y + S.h / 2));
      for (let k = 0; k < L.n; k++) {
        const x = sx + k * cw;
        const isPick = k === L.pick, last = i === LEVELS.length - 1;
        ctx.fillStyle = isPick ? (last && t >= tl.heroLand && t < tl.rw0 ? C.red : C.ink) : '#F4EEDF';
        ctx.fillRect(x + 1.5, S.y, cw - 3, S.h);
        ctx.lineWidth = 1.5 / grow; ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.strokeRect(x + 1.5, S.y, cw - 3, S.h);
      }
      ctx.restore();
      if (pin > 0.9 && pout < 0.1) {
        setFont(ctx, F.mono(26)); ctx.fillStyle = C.graphite;
        ctx.fillText(`1 ${LEVELS[i - 1] ? LEVELS[i - 1].name : 'gün'} = ${L.n} ${L.name}`, S.x, S.y + S.h + 44);
        // seçilen hücrenin üstünde işaret
        ctx.fillStyle = C.ink; const px = S.x + (L.pick + 0.5) * cw;
        ctx.beginPath(); ctx.moveTo(px, S.y - 12); ctx.lineTo(px - 10, S.y - 30); ctx.lineTo(px + 10, S.y - 30); ctx.closePath(); ctx.fill();
      }
    }
  }

  // ——— yazılar ———
  const SAYS = [{ t0: 0, t1: tl.balls[1] + 0.2, text: ep.say.hook },
    { t0: tl.balls[1] + 0.2, t1: tl.fill[0] - 0.1, text: ep.say.combos },
    { t0: tl.oldLand - 0.04, t1: tl.fill[1] - 0.35, text: ep.say.old },
    { t0: tl.fill[1] - 0.04, t1: tl.dive[0][0] + 0.2, text: ep.say.full },
    { t0: tl.dive[0][0] + 0.3, t1: tl.silence0, text: ep.say.dive },
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
    let label, num, unit;
    if (t < tl.fill[0]) {
      label = 'ÇILGIN SAYISAL LOTO · 6 SEÇ'; num = t >= tl.balls[1] ? nf.format(TOTAL) : '90'; unit = t >= tl.balls[1] ? 'olasılık' : 'top';
    } else if (t < tl.dive[0][0]) {
      const s = filled(t), d = s / DAY;
      label = 'HER OLASILIK 1 SANİYE';
      if (d < 365) { num = nf.format(Math.floor(d)); unit = 'gün'; } else { num = nf1.format(Math.floor((d / YEARD) * 10) / 10); unit = 'yıl'; }
    } else { label = red ? 'KAZANMAK' : 'BU SÜRENİN İÇİNDEN'; num = '1'; unit = 'saniye'; }
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText(unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: topları sayar, takvim dolarken uyuklar (20 yıl!), dalışta dikkat kesilir, tek saniyede zıplar
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.balls[0], expr: 'notr' },
    { type: 'count', t0: tl.balls[0], t1: tl.balls[1] + 0.3, from: 1, valueAt: t => Math.max(1, ep.picks.filter((_, i) => t >= lerp(tl.balls[0], tl.balls[1], (i + 1) / ep.picks.length) - 0.05).length), label: n => `${n}. top`, bubble: 'top' },
    { type: 'think', t0: tl.balls[1] + 0.3, t1: tl.fill[0] + 0.6 },
    { type: 'lookUp', t0: tl.fill[0] + 0.6, t1: tl.oldLand + 0.8, expr: 'saskin' },
    { type: 'sleep', t0: tl.oldLand + 0.8, t1: tl.fill[1] + 0.2 },
    { type: 'surprise', t0: tl.fill[1] + 0.2, t1: tl.fill[1] + 1.05 },
    { type: 'lookUp', t0: tl.fill[1] + 1.05, t1: tl.heroLand - 0.05, expr: 'saskin' },
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
    // geri sarma: dalış söner, takvim boşalır, toplar geri gelir; son kare = kare 0
    const rw = t >= tl.rw0 ? ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4)) : 0;
    const vt = t >= tl.rw0 ? lerp(tl.fill[1], 0, rw) : t;
    const ballsA = vt < tl.fill[0] ? 1 : 1 - ease.exit(seg(vt, tl.fill[0], 0.4));
    const holds = [[tl.balls[1], tl.fill[0]], [tl.fill[1], tl.dive[0][0]], [tl.heroLand, tl.rw0]];
    let zf = 1; for (const [a, b] of holds) zf *= 1 + 0.05 * Math.max(0, Math.min(1, (t - a) / (b - a)));
    if (t >= tl.rw0) zf = lerp(zf, 1, ease.state(seg(t, tl.rw0, 0.4)));
    ctx.save(); ctx.translate(505, 1140); ctx.scale(zf, zf); ctx.translate(-505, -1140);
    balls(vt, ballsA);
    const calA = t >= tl.rw0 ? (vt > tl.fill[0] ? 1 : 0) : ease.enter(seg(t, tl.fill[0], 0.4)) * (1 - ease.exit(seg(t, tl.dive[0][0], 0.5)));
    const zoom = t >= tl.dive[0][0] && t < tl.rw0 ? Math.exp(lerp(0, Math.log(40), ease.state(seg(t, tl.dive[0][0], 0.6)))) : 1;
    calendar(vt, calA, zoom);
    if (t < tl.rw0 + 0.4) dive(t);
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

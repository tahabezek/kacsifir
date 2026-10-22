// Sahne: Venüs'te bir gün mü uzun, bir yıl mı? Tepeden görünüş: Güneş ortada, Venüs yörüngede. Venüs'ün üstündeki
// bayrak kendi çevresindeki dönüşünü gösterir (ters yönde). Hızlandırılmış zamanda yörünge 224,7 günde kapanır; bayrak
// o anda turunun %92'sinde: yıl bitti, gün bitmedi. 243. günde gün de biter. Boyutlar ölçeksiz (yörünge şeması).
import { ease, seg, lerp, spring } from '../core.js';
import { drawActor } from '../actor.js';
import { SAFE, TAU, nf0, nf1, win, loadPlanets, makePlate } from './plate.js';

export function buildVenusTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, year: ep.venus.year, day: ep.venus.day, duration: T.end, rw0: T.ret[0], rw1: T.end };
}
// geçen Dünya günü: hızlanarak 'fast' noktasına, sonra yavaşlayarak bir yıla (doruk); doruktan sonra bir güne
export function daysAt(tl, t) {
  const [a, b] = tl.run, f = tl.fastDays;
  if (t < a) return 0;
  if (t < b) return f * seg(t, a, b - a) ** 1.25;                       // durağandan başlar, hızlanır
  if (t < tl.hero) return lerp(f, tl.year, ease.state(seg(t, b, tl.hero - b)));
  if (t < tl.dayRun[0]) return tl.year + 3.6 * ease.state(seg(t, tl.hero + 0.6, tl.dayRun[0] - tl.hero - 0.6));   // doruk sonrası yavaş sürünme (ölü kare yok)
  if (t < tl.dayRun[1]) return lerp(tl.year + 3.6, tl.day, ease.state(seg(t, tl.dayRun[0], tl.dayRun[1] - tl.dayRun[0])));
  if (t < tl.ret[0]) return tl.day + 4 * seg(t, tl.dayRun[1], tl.ret[0] - tl.dayRun[1]);
  return tl.day * (1 - ease.state(seg(t, tl.ret[0], tl.ret[1] - tl.ret[0] - 0.2)));
}
export function venusSummary(ep) {
  const tl = buildVenusTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.hero, cover: 0,
    keys: [0, 1.2, 3.6, 6.6, 9.6, tl.ask + 0.9, tl.hero + 0.3, tl.hero + 1.5, tl.dayRun[1] + 0.3, tl.dirs + 0.8, tl.rw0 + 0.6],
    fast: tl.run[1] - 0.5, lastLand: tl.dayRun[1], firstLand: 3.6 };
}
export function venusCues(ep) {
  const tl = buildVenusTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence[0], tl: tl.hero },
    grows: [{ t0: tl.run[0], t1: tl.run[1], hero: false }, { t0: tl.dayRun[0], t1: tl.dayRun[1], hero: false }],
    lands: [tl.dayRun[1], tl.dirs], tallies: [] };
}

export async function makeVenusRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildVenusTimeline(ep), D = tl.duration, G = ep.geom;
  const P = makePlate(ctx, ep, await loadPlanets());
  const { C, F, setFont, revealText } = P;
  const S = { x: G.sx, y: G.sy };

  const sun = (x, y, r) => P.sun(x, y, r);

  const orbAng = d => -TAU * d / tl.year;                 // saat yönünün tersine (kuzeyden bakış)
  const spinAng = d => TAU * d / tl.day;                  // ters dönüş: saat yönünde
  function venusAt(d) { const a = orbAng(d); return { x: S.x + G.orbitR * Math.cos(a), y: S.y + G.orbitR * Math.sin(a), a }; }

  function venus(t, d) {
    const v = venusAt(d), r = G.venusR;
    P.planet('venus', v.x, v.y, r);
    // gece yarısı: Güneş'e bakmayan yarım (taralı)
    const toSun = Math.atan2(S.y - v.y, S.x - v.x);
    ctx.save(); ctx.beginPath(); ctx.arc(v.x, v.y, r * 0.985, toSun + Math.PI / 2, toSun + 3 * Math.PI / 2); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = -2 * r; k < 2 * r; k += 6) { ctx.moveTo(v.x + k, v.y - r); ctx.lineTo(v.x + k + 2 * r, v.y + r); } ctx.stroke(); ctx.restore();
    // bayrak: kendi çevresindeki dönüş (kare 0'da Güneş'e bakar: öğle)
    const fa = Math.PI + spinAng(d), ux = Math.cos(fa), uy = Math.sin(fa);
    const b0 = { x: v.x + ux * r * 0.6, y: v.y + uy * r * 0.6 }, b1 = { x: v.x + ux * (r + 52), y: v.y + uy * (r + 52) };
    ctx.save(); ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.stroke();
    const px = -uy, py = ux;                              // bayrak bezi, direğe dik
    ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b1.x - ux * 16 + px * 30, b1.y - uy * 16 + py * 30); ctx.lineTo(b1.x - ux * 32, b1.y - uy * 32); ctx.closePath(); ctx.fill();
    ctx.restore();
    // dönüş ilerlemesi: Venüs'ün çevresinde ince yay (bayrağın taradığı açı)
    const sp = Math.min(spinAng(d), TAU);
    if (sp > 0.01) { ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(v.x, v.y, r + 66, Math.PI, Math.PI + sp); ctx.stroke(); ctx.restore(); }
    // doruk: bayrağın daha gitmesi gereken yol (kesik kırmızı) — yıl bitti, gün bitmedi
    const mu = win(t, tl.hero + 0.1, tl.dayRun[0] + 0.2, 0.4);
    if (mu > 0 && sp < TAU) { ctx.save(); ctx.setLineDash([8, 7]); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(v.x, v.y, r + 66, Math.PI + sp, Math.PI + sp + (TAU - sp) * mu); ctx.stroke(); ctx.restore(); }
    return v;
  }

  function arrowArc(cx, cy, R, a0, a1, color, u) {
    if (u <= 0) return;
    const a = lerp(a0, a1, u);
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.min(a0, a), Math.max(a0, a)); ctx.stroke();
    const dir = Math.sign(a1 - a0), tx = -Math.sin(a) * dir, ty = Math.cos(a) * dir, ex = cx + R * Math.cos(a), ey = cy + R * Math.sin(a);
    ctx.beginPath(); ctx.moveTo(ex + tx * 14, ey + ty * 14); ctx.lineTo(ex - ty * 9, ey + tx * 9); ctx.lineTo(ex + ty * 9, ey - tx * 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function render(t) {
    P.paper();
    const d = daysAt(tl, t);
    P.stage(() => {
      const zk = (tt, dz) => dz * spring(t - tt, 170, 26);
      const zz = zk(tl.hero, 0.3) - zk(tl.zoomOut, 0.3);
      const z = 1 + 0.04 * seg(t, 0, tl.ret[0]) * (1 - ease.state(seg(t, tl.ret[0], tl.ret[1] - tl.ret[0])));
      const vf = venusAt(tl.year), fx = lerp(S.x, vf.x, Math.min(1, zz / 0.3)), fy = lerp(S.y, vf.y, Math.min(1, zz / 0.3));
      ctx.save(); ctx.translate(fx, fy); ctx.scale(z + zz, z + zz); ctx.translate(-fx, -fy);
      // yörünge: kesik çizgi; geçen kısım mürekkeple (yıl ilerlemesi)
      ctx.save(); ctx.setLineDash([9, 9]); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(S.x, S.y, G.orbitR, 0, TAU); ctx.stroke(); ctx.restore();
      const yu = Math.min(d / tl.year, 1);
      if (yu > 0.002) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(S.x, S.y, G.orbitR, -TAU * yu, 0); ctx.stroke(); ctx.restore(); }
      sun(S.x, S.y, G.sunR);
      const v = venus(t, d);
      // yönler (kapanışta): yörünge saat yönünün tersine, dönüş saat yönünde
      const au = win(t, tl.dirs, tl.ret[0] + 0.2, 0.6);
      if (au > 0) {
        arrowArc(S.x, S.y, G.orbitR + 36, -2.0, -3.0, C.ink, au);
        arrowArc(v.x, v.y, G.venusR + 88, -0.6, 0.7, C.ink, ease.enter(seg(t, tl.dirs + 0.07, 0.6)) * au);
        setFont(ctx, F.name(40)); const lu = ease.enter(seg(t, tl.dirs + 0.4, 0.4)) * au;
        revealText(ctx, ep.label.orbitDir, S.x + (G.orbitR + 70) * Math.cos(-2.5), S.y + (G.orbitR + 70) * Math.sin(-2.5), 40, lu, C.ink, 'center');
        revealText(ctx, ep.label.spinDir, v.x + G.venusR + 104, v.y + 14, 40, lu, C.ink, 'left');
      }
      ctx.restore();
      // adlar
      const tu = win(t, 0, tl.run[0] + 3.0);
      P.tag({ x: S.x, y: S.y + G.sunR }, ep.label.sun, 0, 40, tu);
    });
    P.header();
    const L = ep.label;
    const dn = d >= 200 ? nf1.format(Math.floor(d * 10) / 10) : nf0.format(Math.floor(d));
    if (t < tl.hero) P.counter({ label: L.elapsed, num: dn + ' ' + L.days, sub: L.def, pin: 1 });
    else if (t < tl.dayRun[1]) P.counter({ label: L.yearDone, num: nf1.format(tl.year) + ' ' + L.days, sub: L.notYet + ' %' + Math.floor(100 * Math.min(d, tl.day) / tl.day), subInk: true, red: true, pin: ease.enter(seg(t, tl.hero, 0.4)), pop: t - tl.hero });
    else if (t < tl.ret[1] - 0.6) P.counter({ label: L.dayDone, num: nf0.format(tl.day) + ' ' + L.days, sub: L.longer, subInk: true, pin: ease.enter(seg(t, tl.dayRun[1], 0.4)) });
    else P.counter({ label: L.elapsed, num: dn + ' ' + L.days, sub: L.def, pin: ease.enter(seg(t, tl.ret[1] - 0.6, 0.4)) });
    P.says(ep.says, t, tl, null);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }

  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.ask, expr: 'notr' },
    { type: 'think', t0: tl.ask, t1: tl.silence[0] },
    { type: 'idle', t0: tl.silence[0], t1: tl.hero - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.hero - 0.05, t1: tl.hero + 0.85 },
    { type: 'lookUp', t0: tl.hero + 0.85, t1: tl.dayRun[1], expr: 'saskin' },
    { type: 'happy', t0: tl.dayRun[1], t1: tl.ret[0] + 0.4 },
    { type: 'lookUp', t0: tl.ret[0] + 0.4, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: G.actorX, y: 1414, facing: -1 };

  return { render, duration: D, timeline: tl };
}

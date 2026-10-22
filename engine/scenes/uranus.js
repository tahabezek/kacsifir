// Sahne: Uranüs'ün kutbunda gece kaç yıl sürer? Yörünge eğik bakışla elips; Uranüs'ün ekseni yörünge düzleminde
// yatar (98°) ve uzayda sabit yönü gösterir. Kuzey kutbu Güneş'e bakan taraftayken gündüz, öbür taraftayken gecedir.
// Kare 0 kuzey kutbunda gün batımı; 42 yıl gece (Sıfır uyur), doruk: güneş doğar; 42 yıl gündüz; 84. yılda film başa
// döner (yörünge kendiliğinden kapanır). Boyutlar ölçeksiz (yörünge şeması).
import { ease, seg, lerp, spring } from '../core.js';
import { drawActor } from '../actor.js';
import { SAFE, TAU, nf0, win, loadPlanets, makePlate } from './plate.js';

export function buildUranusTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, year: ep.uranus.year, half: ep.uranus.year / 2, duration: T.end, rw0: T.dayRun[1], rw1: T.end };
}
// geçen yıl: gece 0 → 42 (doruğa yavaşlayarak), gündüz 42 → 84 (döngü dikişine yavaşlayarak)
export function yearsAt(tl, t) {
  const [a, b] = tl.nightRun, [c, d] = tl.dayRun;
  if (t < a) return 0;
  if (t < b) return tl.half * ease.state(seg(t, a, b - a));
  if (t < c) return tl.half;
  return lerp(tl.half, tl.year, ease.state(seg(t, c, d - c)));
}
export function uranusSummary(ep) {
  const tl = buildUranusTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.hero, cover: 0,
    keys: [0, 1.0, 3.6, 7.2, 10.8, tl.ask + 0.9, tl.hero + 0.3, tl.hero + 1.5, (tl.dayRun[0] + tl.dayRun[1]) / 2, tl.dayRun[1] - 0.6, tl.end - 0.1],
    fast: (tl.nightRun[0] + tl.nightRun[1]) / 2, lastLand: tl.hero, firstLand: 3.6 };
}
export function uranusCues(ep) {
  const tl = buildUranusTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence[0], tl: tl.hero },
    grows: [{ t0: tl.nightRun[0], t1: tl.nightRun[1], hero: false }, { t0: tl.dayRun[0], t1: tl.dayRun[1], hero: false }],
    lands: [tl.dayRun[1]], tallies: [] };
}

export async function makeUranusRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildUranusTimeline(ep), D = tl.duration, G = ep.geom;
  const P = makePlate(ctx, ep, await loadPlanets());
  const { C, F, setFont, revealText } = P;
  const S = { x: G.sx, y: G.sy };
  // eksen yörünge düzleminde yatar (98° → düzlemden 8°) ve izleyiciye doğru bakar; eğik bakışta derinlik ekranda
  // b/a oranında kısalır. Kuzey kutbu diskin önünde görünür.
  const al = G.axisTilt * Math.PI / 180, AX = { x: Math.sin(al), y: Math.cos(al) * G.b / G.a };

  // yörünge açısı: kare 0'da sağda (gün batımı), önden (alt) geçerken gece, solda gün doğumu, arkadan (üst) gündüz
  const th = y => -al + TAU * y / tl.year;
  const posAt = y => { const a = th(y); return { x: S.x + G.a * Math.cos(a), y: S.y + G.b * Math.sin(a), a }; };
  // kuzey kutbu Güneş'i görüyor mu: Güneş yönü ile eksenin iç çarpımı (gerçek 3B'de x bileşeni)
  const poleLit = y => Math.sin(TAU * y / tl.year) < -1e-6;

  function orbitPath(from, to) {
    ctx.beginPath();
    for (let k = 0; k <= 120; k++) { const a = lerp(from, to, k / 120), x = S.x + G.a * Math.cos(a), y = S.y + G.b * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  }
  function uranus(t, yrs) {
    const u = posAt(yrs), r = G.ur;
    P.planet('uranus', u.x, u.y, r);
    // gece yarısı: Güneş'e bakmayan yarım
    const toSun = Math.atan2(S.y - u.y, S.x - u.x);
    ctx.save(); ctx.beginPath(); ctx.arc(u.x, u.y, r * 0.985, toSun + Math.PI / 2, toSun + 3 * Math.PI / 2); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.6)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = -2 * r; k < 2 * r; k += 6) { ctx.moveTo(u.x + k, u.y - r); ctx.lineTo(u.x + k + 2 * r, u.y + r); } ctx.stroke(); ctx.restore();
    // eksen: iki kutuptan dışarı taşan çizgi; kuzey ucunda bayrak (gündüzse dolu, geceyse çizgi)
    const L = (r + 70) / Math.hypot(AX.x, AX.y) * 0.62, n = { x: u.x + AX.x * L, y: u.y + AX.y * L }, s = { x: u.x - AX.x * L, y: u.y - AX.y * L };
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(n.x, n.y); ctx.stroke();
    // kutup işareti (yüzeyde): gecede dolu mürekkep disk, gündüzde açık disk ve ışınlar
    const lit = t >= tl.hero && yrs < tl.year - 0.05, pp = { x: u.x + AX.x * r, y: u.y + AX.y * r };
    ctx.beginPath(); ctx.arc(pp.x, pp.y, 22, 0, TAU); ctx.fillStyle = lit ? C.paper : C.ink; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
    if (lit) { ctx.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * TAU / 8; ctx.beginPath(); ctx.moveTo(pp.x + Math.cos(a) * 29, pp.y + Math.sin(a) * 29); ctx.lineTo(pp.x + Math.cos(a) * 45, pp.y + Math.sin(a) * 45); ctx.stroke(); } }
    ctx.restore();
    return { u, n };
  }

  function render(t) {
    P.paper();
    const yrs = yearsAt(tl, t);
    let pos;
    P.stage(() => {
      const zk = (tt, dz) => dz * spring(t - tt, 170, 26);
      const zz = zk(tl.silence[0], 0.15) - zk(tl.hero + 1.0, 0.15);
      const z = 1 + 0.04 * seg(t, 0, tl.dayRun[0]) - 0.04 * ease.state(seg(t, tl.dayRun[1] - 2, 2));
      const uh = posAt(tl.half), k = Math.min(1, Math.max(0, zz / 0.15)), fx = lerp(S.x, uh.x, k), fy = lerp(S.y, uh.y, k);
      ctx.save(); ctx.translate(fx, fy); ctx.scale(z + zz, z + zz); ctx.translate(-fx, -fy);
      const u = posAt(yrs), behind = Math.sin(u.a) < 0;                 // üst yarı: Güneş'in arkası
      ctx.save(); ctx.setLineDash([9, 9]); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5; orbitPath(Math.PI, TAU); ctx.stroke(); ctx.restore();
      if (behind) pos = uranus(t, yrs);
      P.sun(S.x, S.y, G.sunR);
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (let q = 0; q < 8; q++) { const a = q * TAU / 8 + TAU / 16; ctx.beginPath(); ctx.moveTo(S.x + Math.cos(a) * (G.sunR + 10), S.y + Math.sin(a) * (G.sunR + 10)); ctx.lineTo(S.x + Math.cos(a) * (G.sunR + 26), S.y + Math.sin(a) * (G.sunR + 26)); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.setLineDash([9, 9]); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5; orbitPath(0, Math.PI); ctx.stroke(); ctx.restore();
      if (!behind) pos = uranus(t, yrs);
      ctx.restore();
      const tu = Math.max(win(t, 0, 3.5), t >= tl.end - 0.6 ? ease.enter(seg(t, tl.end - 0.6, 0.5)) : 0);
      P.tag({ x: S.x, y: S.y + G.sunR * z }, ep.label.sun, 0, 40, tu);
      const nu = win(t, 3.6, 9.5, 0.5);
      if (nu > 0) { const n = { x: S.x + (pos.n.x - S.x) * z, y: S.y + (pos.n.y - S.y) * z }; P.tag(n, ep.label.pole, -70, 40, nu); }
    });
    const iu = win(t, tl.tiltAt, tl.dayRun[1] - 0.4, 0.6);
    if (iu > 0) {
      const cx = G.insetX, cy = G.insetY, R0 = 54;
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 26, 0, TAU); ctx.stroke();
      ctx.setLineDash([6, 6]); ctx.strokeStyle = C.graphite; ctx.beginPath(); ctx.moveTo(cx, cy + R0); ctx.lineTo(cx, cy - R0); ctx.stroke(); ctx.setLineDash([]);
      const ang = -Math.PI / 2 + 98 * Math.PI / 180 * ease.state(seg(t, tl.tiltAt + 0.1, 0.6));
      ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(cx - Math.cos(ang) * R0, cy - Math.sin(ang) * R0); ctx.lineTo(cx + Math.cos(ang) * R0, cy + Math.sin(ang) * R0); ctx.stroke();
      ctx.strokeStyle = C.red; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(cx, cy, 40, -Math.PI / 2, ang); ctx.stroke(); ctx.restore();
      setFont(ctx, F.head(44)); revealText(ctx, '98°', cx + 70, cy + 14, 44, ease.enter(seg(t, tl.tiltAt + 0.5, 0.35)) * iu, C.red, 'left');
    }
    P.header();
    const L = ep.label;
    if (t < tl.nightRun[0] + 0.2 || t >= tl.end - 0.5) P.counter({ label: L.yearLabel, num: nf0.format(tl.year) + ' ' + L.years, sub: L.def, pin: t < 1 ? 1 : ease.enter(seg(t, tl.end - 0.5, 0.4)) });
    else if (t < tl.hero) P.counter({ label: L.night, num: nf0.format(Math.min(41, Math.floor(yrs))) + ' ' + L.yearShort, sub: L.def, pin: ease.enter(seg(t, tl.nightRun[0] + 0.2, 0.4)) });
    else if (t < tl.dayRun[0] + 0.3) P.counter({ label: L.sunrise, num: nf0.format(tl.half) + ' ' + L.yearShort, sub: L.def, red: true, pin: ease.enter(seg(t, tl.hero, 0.4)), pop: t - tl.hero });
    else P.counter({ label: L.day, num: nf0.format(Math.min(tl.half, Math.round(yrs - tl.half))) + ' ' + L.yearShort, sub: L.def, pin: ease.enter(seg(t, tl.dayRun[0] + 0.3, 0.4)) });
    P.says(ep.says, t, tl, tl.end - 0.5);
    drawActor(ctx, actorScript, t, actorHome, AH, D);
  }

  // Sıfır: kuzey kutbunda yaşadığını düşünelim. Gece boyunca uyur, sessizlikte uyanır, gün doğunca zıplar, gündüz
  // boyunca sevinir; sona doğru yine güneş batar ve kare 0 duruşuna döner
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.nightRun[0] + 0.8, expr: 'notr' },
    { type: 'sleep', t0: tl.nightRun[0] + 0.8, t1: tl.ask },
    { type: 'think', t0: tl.ask, t1: tl.silence[0] },
    { type: 'idle', t0: tl.silence[0], t1: tl.hero - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.hero - 0.05, t1: tl.hero + 0.85 },
    { type: 'happy', t0: tl.hero + 0.85, t1: tl.dayRun[1] - 1.2 },
    { type: 'lookUp', t0: tl.dayRun[1] - 1.2, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: G.actorX, y: 1414, facing: -1 };
  const AH = G.actorH || 100;

  return { render, duration: D, timeline: tl };
}

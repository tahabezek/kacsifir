// Sahne: yerçekimi tüneli. Dünya'nın kesitinde düz tüneller; içine bırakılan cisim basit harmonik hareketle
// öbür uca varır. Tek tünel → 42 dk; sonra üç farklı uzunlukta tünel aynı anda bırakılır ve hepsi birlikte varır.
// Varsayım: Dünya her yerde aynı yoğunlukta, sürtünme yok. Zaman hızlandırılmış.
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';
import { SIFIR_CARD, drawSifir, POSES } from '../sifir.js';

const SAFE = { x0: 90, x1: 920 };

export function buildTunnelTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, heroLand: T.fall2[1], silence0: T.fall2[1] - (T.silence ?? 0.5), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function tunnelSummary(ep) {
  const tl = buildTunnelTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, (tl.fall1[0] + tl.fall1[1]) / 2, tl.fall1[1] + 0.4, tl.twist + 0.8, (tl.fall2[0] + tl.fall2[1]) / 2, tl.heroLand + 0.4, tl.kick + 0.6, tl.rw0 + 0.3],
    fast: (tl.fall1[0] + tl.fall1[1]) / 2, lastLand: tl.kick, firstLand: tl.fall1[1] };
}
export function tunnelCues(ep) {
  const tl = buildTunnelTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: tl.fall1[0], t1: tl.fall1[1], hero: false }, { t0: tl.fall2[0], t1: tl.silence0, hero: false }],
    lands: [tl.fall1[1], tl.twist + 0.4, tl.kick], tallies: [] };
}

export function makeTunnelRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildTunnelTimeline(ep);
  const D = tl.duration;
  const E = { x: 470, y: 1160, r: 248 };
  const MIN = ep.minutes;                                  // yarım periyot (dk)

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // kesit: kabuk, manto, dış ve iç çekirdek (ölçekli yarıçaplar)
  function earth(t) {
    const L = [[1, '#E9DFC6'], [3480 / 6371, '#D9CCAA'], [1220 / 6371, '#C4B188']];
    for (const [k, fill] of L) { ctx.beginPath(); ctx.arc(E.x, E.y, E.r * k, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = k === 1 ? 4 : 2; ctx.strokeStyle = C.ink; ctx.stroke(); }
    // dış çekirdekte yavaş akış (sürekli döngü)
    ctx.save(); ctx.setLineDash([10, 14]); ctx.lineDashOffset = -(t / D) * Math.round(D) * 24; ctx.strokeStyle = 'rgba(28,27,24,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(E.x, E.y, E.r * 0.42, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  // tünel: düşey kiriş, merkezden yatay uzaklık d (R biriminde)
  const chord = d => { const hh = Math.sqrt(1 - d * d) * E.r; return { x: E.x + d * E.r, y0: E.y - hh, y1: E.y + hh }; };
  function tunnel(c, a, red) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = C.paper; ctx.fillRect(c.x - 14, c.y0, 28, c.y1 - c.y0);
    ctx.strokeStyle = red ? C.red : C.ink; ctx.lineWidth = 3; ctx.strokeRect(c.x - 14, c.y0, 28, c.y1 - c.y0);
    ctx.restore();
  }
  // düşen: basit harmonik hareket, y = orta − (yarı uzunluk) · cos(π·u)
  function faller(c, u, a, label) {
    if (a <= 0) return;
    const mid = (c.y0 + c.y1) / 2, half = (c.y1 - c.y0) / 2;
    const uu = Math.min(2, Math.max(0, u)); // 0→1 aşağı, 1→2 geri yukarı (salınım)
    const y = mid - half * Math.cos(Math.PI * uu);
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(c.x, y + 26);
    const moving = (uu > 0 && uu < 1) || (uu > 1 && uu < 2);
    drawSifir(ctx, SIFIR_CARD, moving ? { ...POSES.sasirma, tilt: 0 } : POSES.ayakta, moving ? 'saskin' : 'mutlu', 26);
    ctx.restore();
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
  const clock = m => { const mm = Math.floor(m + 1e-6), ss = Math.floor((m - mm) * 60 + 1e-6); return { num: `${mm}`, unit: `dk ${String(ss).padStart(2, '0')} sn` }; };
  function counter(t) {
    const f2 = t >= tl.fall2[0];
    const [a, b] = f2 ? tl.fall2 : tl.fall1;
    const m = MIN * Math.max(0, Math.min(1, (t - a) / (b - a)));
    const red = t >= tl.heroLand && t < tl.rw0;
    const c = red ? { num: `${Math.round(MIN)}`, unit: 'dakika' } : clock(m);
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(red ? ep.label.hero : f2 ? ep.label.three : ep.label.one, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(c.num, SAFE.x0, counterY);
    const w = ctx.measureText(c.num).width; setFont(ctx, F.name(56)); ctx.fillText(c.unit, SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır (büyük): izler, ilk varışta sevinir, üç tünelde düşünür, hepsi birlikte varınca zıplar
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.fall1[1] - 0.05, expr: 'saskin' },
    { type: 'happy', t0: tl.fall1[1] - 0.05, t1: tl.twist },
    { type: 'think', t0: tl.twist, t1: tl.fall2[0] },
    { type: 'lookUp', t0: tl.fall2[0], t1: tl.heroLand - 0.05, expr: 'saskin' },
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
    const vt = t >= tl.rw0 ? lerp(tl.fall1[1], 0, ease.state(seg(t, tl.rw0 + 0.3, (tl.rw1 - tl.rw0) - 0.7))) : t;
    const holds = [[tl.fall1[1], tl.twist], [tl.heroLand, tl.rw0]];
    let z = 1; for (const [a, b] of holds) z *= 1 + 0.04 * Math.max(0, Math.min(1, (t - a) / (b - a)));
    if (t >= tl.rw0) z = lerp(1.04 * 1.04, 1, ease.state(seg(t, tl.rw0, 0.4)));
    ctx.save(); ctx.translate(E.x, E.y); ctx.scale(z, z); ctx.translate(-E.x, -E.y);
    earth(t);
    const red = t >= tl.heroLand && t < tl.rw0;
    const main = chord(0);
    const others = ep.chords.map(d => chord(d));
    const oa = t >= tl.rw0 ? 1 - ease.exit(seg(t, tl.rw0, 0.3)) : ease.enter(seg(t, tl.twist + 0.3, 0.5));
    tunnel(main, 1, red);
    others.forEach(c => tunnel(c, oa, red));
    // birinci düşüş, sonra ikinci (üçü birlikte)
    if (vt < tl.twist + 0.6) faller(main, (vt - tl.fall1[0]) / (tl.fall1[1] - tl.fall1[0]), 1);
    else {
      const u = 1 + Math.max(0, Math.min(1, (vt - tl.fall2[0]) / (tl.fall2[1] - tl.fall2[0]))); // hepsi dipten yukarı
      faller(main, u, 1); others.forEach(c => faller(c, u, oa));
    }
    // varsayım notu
    setFont(ctx, F.mono(27)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center'; ctx.fillText(ep.note, E.x, E.y + E.r + 40); ctx.textAlign = 'left';
    ctx.restore();
    counter(t >= tl.rw0 ? 0 : t);
    if (t < tl.rw0 + 0.2) says(t);
    else if (t > tl.rw1 - 0.5) { setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink)); }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

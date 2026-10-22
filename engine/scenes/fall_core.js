// № 027 "Hangisi önce yere düşer?" — saf çekirdek: iki topun kapalı formüllü hareketi, üç tur (2 → 30 → 900 m/s),
// stroboskop zamanları, özet ve ses ipuçları. Tarayıcı (fall.js) ve node (ses, kritik) aynı dosyayı okur.
// Fizik: y(τ) = y0 − ½gτ²; yatay hız düşüşü değiştirmez. 1,5 m'den düşüş süresi T = √(2h/g) = 0,553 sn.
import { ease, seg, clamp01 } from '../core.js';

export const G = 9.81, H0 = 1.5, R = 0.08;          // düşüş yüksekliği (top altı → yer) ve top yarıçapı (m)
export const T = Math.sqrt((2 * H0) / G);            // 0,553 sn
export const X0 = 0.14, ZA = -0.1, ZB = 0.1;         // topların başlangıcı: blok kenarının ötesi; A arkada (solda), B önde (sağda)
export const Y0 = H0 + R;
export const XB = X0 + 0.24;                         // B'nin başlangıcı (kendi rafının ucu)
export const GHOST_DT = 0.05, GHOSTS = 11;           // stroboskop: her 0,05 sn (gerçek zaman)
const E = 0.28;                                      // sekme katsayısı (kâğıt zemin)

export function buildFallTimeline(ep) {
  const rounds = ep.rounds.map((r, i) => ({ ...r, i, land: r.launch + T * r.slow }));
  const D = ep.timing.duration;
  const r3 = rounds[rounds.length - 1];
  return {
    rounds, duration: D, beat: 60 / ep.bpm, land: r3.land, silence0: r3.land - ep.timing.silence,
    riser: ep.timing.riser, dive: ep.timing.dive, says: ep.says,
    // yeniden dolum: tur başlamadan 1,0 sn önce yeni toplar düşer, eskiler küçülerek çekilir
    reload: rounds.slice(1).map(r => r.launch - 1.1),
  };
}

// τ: turun gerçek (fiziksel) zamanı; t film zamanı. Tur başlamadan önce null.
export const tauOf = (r, t) => (t < r.launch ? null : (t - r.launch) / r.slow);

// Bir topun konumu (gerçek zaman τ, yatay hız v). İnişten sonra tek küçük sekme ve sürtünmeyle duruş.
export function ballAt(tau, v, z) {
  const x0 = z === ZB ? XB : X0;
  if (tau === null) return { x: x0, y: Y0, z, landed: false };
  const k = v > 100 ? 0.0002 : Math.min(0.02, 1 / Math.max(v, 1e-6));   // inişten sonra yatay yavaşlama (hızlı top ≈ 0,2 m'de durur)
  if (tau <= T) return { x: x0 + v * tau, y: Y0 - 0.5 * G * tau * tau, z, landed: false };
  const s = tau - T, vb = E * G * T, tb = (2 * vb) / G;
  const y = s < tb ? R + vb * s - 0.5 * G * s * s : R;
  // orta hız (2. tur): 0,4 m yuvarlanıp durur (0,25 sn gerçek); diğerleri üstel yavaşlama
  const slide = v > 10 && v < 100 ? 0.4 * (1 - Math.pow(1 - Math.min(1, s / 0.25), 2)) : v * k * (1 - Math.exp(-s / k));
  return { x: x0 + v * T + slide, y, z, landed: true };
}

// Tur r'nin topları t anında: tur yeniden dolumla değiştirilene kadar sahnede (küçülerek çekilir)
export function roundBalls(tl, i, t) {
  const r = tl.rounds[i];
  const tau = tauOf(r, t);
  const born = i === 0 ? -1e9 : tl.reload[i - 1];
  const gone = i + 1 < tl.rounds.length ? tl.reload[i] : tl.dive[0] + 0.4;
  const grow = i === 0 ? 1 : ease.enter(seg(t, born, 0.25));
  const shrink = 1 - ease.exit(seg(t, gone, 0.4));
  const drop = 0;                                    // yeni toplar masada büyür (metnin içinden geçen düşüş yok)
  const A = ballAt(tau, 0, ZA), B = ballAt(tau, r.v, ZB);
  if (tau === null) { A.y += drop; B.y += drop; }
  return { r, tau, A, B, scale: grow * shrink, alive: t >= born && shrink > 0.001 };
}

// Yeni döngü topları (dalıştan sonra): kare 0 ile birebir aynı duruş
export function loopBalls(tl, t) {
  const born = tl.dive[0] + 0.3;
  return { A: { x: X0, y: Y0, z: ZA }, B: { x: XB, y: Y0, z: ZB }, scale: ease.enter(seg(t, born, 0.25)), alive: t >= born };
}

// Sayaç: o anki turun gerçek süresi (0,000 → 0,553), dalışın ortasında sıfırlanır
export function clockAt(tl, t) {
  const mid = tl.dive[1] - 0.35;                     // sahne kurulduktan sonra sıfırlanır
  if (t >= mid) return { v: 0, round: 0 };
  let cur = null;
  for (const r of tl.rounds) if (t >= r.launch) cur = r;
  if (!cur) return { v: 0, round: 0 };
  return { v: Math.min(T, (t - cur.launch) / cur.slow), round: cur.i };
}

export function fallSummary(ep) {
  const tl = buildFallTimeline(ep), [r1, r2, r3] = tl.rounds, D = tl.duration;
  return {
    duration: D, rw0: tl.dive[0], rw1: D, heroTl: r3.land, cover: 0,
    keys: [0, 0.6, (r1.launch + r1.land) / 2, r1.land + 0.3, r2.launch + 0.6, r2.land + 0.3, r3.launch - 0.6, (r3.launch + r3.land) / 2, r3.land + 0.3, r3.land + 2.5, r3.land + 6, tl.dive[0] + 0.3, D - 0.4],
    fast: tl.dive[0] + 0.9, firstLand: r1.land + 0.3, lastLand: r3.land + 2.5,
  };
}

export const MERGE = { delay: 1.6, dur: 0.9 };      // 1. tur inişinden sonra
export const mergeU = (tl, t) => ease.state(seg(t, tl.rounds[0].land + MERGE.delay, MERGE.dur));

export function fallCues(ep) {
  const tl = buildFallTimeline(ep);
  const ghosts = [];
  for (const r of tl.rounds) for (let g = 1; g <= GHOSTS; g++) ghosts.push({ t: r.launch + g * GHOST_DT * r.slow, round: r.i });
  const bounces = tl.rounds.map(r => ({ t: r.land + 2 * E * T * r.slow, round: r.i }));
  return { tl, ghosts, bounces };
}

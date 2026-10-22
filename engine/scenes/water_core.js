// № 025 · Bütün su bir top olsa — saf çekirdek: zaman çizelgesi, top boyları ve yolu, coğrafi konumlar, özet, ses ipuçları.
// Tarayıcı (water.js) ve node (ses, kritik) aynı dosyayı okur.
import { ease, seg, clamp01 } from '../core.js';

export const R_E = 6371e3;                    // Dünya yarıçapı (m)
export const DIAM = { all: 1385e3, fresh: 273e3, lake: 56e3 };   // USGS / Scientific American
// dünya kökeni: masanın teğet olduğu nokta (Kars; küre geometrisinin bir köşesine denk gelir: 0,5° ızgara)
export const ORIGIN = { lat: 40.5, lon: 43.0 };
// Türkiye'nin doğu–batı ölçü çizgisi (39,6°K boyunca 26,0°D → 44,8°D ≈ 1.613 km; ölçü ≈ 1.600 km)
export const TR_LINE = { lat: 39.6, w: 26.0, e: 44.8 };
// Kırmızı top Trakya'da oluşur, doğuya yuvarlanır; doğu kenarı 42,3°D'de durur: 2,5° × 85,8 km ≈ 215 km kalır
export const ROLL = { from: { lat: 41.2, lon: 26.6 }, to: { lat: 39.6, lon: 26.0 + (DIAM.all / 2) / (111.32e3 * Math.cos(39.6 * Math.PI / 180)) } };   // batı kenarı Türkiye'nin batı ucunda
export const BALLS = { fresh: { lat: 37.5, lon: 43.8 }, lake: { lat: 41.15, lon: 42.85 } };
export const GAP_KM = 1600 - 1385;           // 215

export function buildWaterTimeline(ep) {
  const T = ep.timing;
  return { ...T, beat: 60 / ep.bpm, duration: T.duration, says: ep.says };
}
// top yarıçapı oranı 0 → 1 (boşalma); boşalan deniz alanı hacimle orantılı: kesir = (r/R)³
export function drainAt(tl, t) {
  const [a, b] = tl.drain;
  return ease.state(clamp01((t - a) / (b - a)));
}
export function drainCap(d) {
  const frac = d * d * d;
  return { frac, th: Math.acos(Math.max(-1, Math.min(1, 2 * frac - 1))) };   // th'den uzak denizler boşaldı
}
// yuvarlanma: yol oranı 0 → 1; hızlanır, sessizlikte yavaşlayarak durur
export function rollAt(tl, t) {
  const [a, b] = tl.roll;
  return ease.state(clamp01((t - a) / (b - a)));
}
export function ballR(tl, t, which) {
  if (which === 'all') return (DIAM.all / 2) * drainAt(tl, t);
  const [a, b] = tl[which];
  return (DIAM[which] / 2) * ease.enter(seg(t, a, b - a));
}

export function waterSummary(ep) {
  const tl = buildWaterTimeline(ep), D = tl.duration;
  return {
    duration: D, rw0: tl.dive[0], rw1: D, heroTl: tl.land, cover: 0,
    keys: [0, 1.2, 2.2, 3.4, 4.6, (tl.drain[0] + tl.drain[1]) / 2, tl.drain[1] + 0.3, (tl.roll[0] + tl.roll[1]) / 2, tl.land + 0.3, tl.land + 1.6, tl.land + 3.6, tl.fresh[1] + 0.8, tl.fresh[1] + 3.5, tl.lake[1] + 0.8, tl.lake[1] + 4, tl.dive[0] + 0.3, (tl.dive[0] + tl.dive[1]) / 2, D - 0.4],
    fast: (tl.pull[0] + tl.pull[1]) / 2, firstLand: tl.pull[1], lastLand: tl.lake[1] + 1.5,
  };
}
export function waterCues(ep) {
  const tl = buildWaterTimeline(ep);
  return { tl, duration: tl.duration, land: tl.land, silence0: tl.land - tl.silence };
}

// Geri çekiliş (masa → Dünya): log10(ölçek) düğümleri; Sıfır'dan yavaş uzaklaşma → orta ölçekler hızlı → Dünya'ya yavaş varış
export const PULL = { S0: 0.0047, S1: 0.85 * R_E, M0: 11.8, M1: 9.5 };
const PK = [[0, Math.log10(PULL.S0)], [0.14, -1.95], [0.5, 4.3], [0.76, 6.1], [1, Math.log10(PULL.S1)]];
function mono(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  m[0] = 0; m[n - 1] = 0;
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (xs[i + 1] - xs[i - 1])) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]);
  return x => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], q = (x - xs[i]) / h;
    return (2 * q ** 3 - 3 * q ** 2 + 1) * ys[i] + (q ** 3 - 2 * q ** 2 + q) * h * m[i] + (-2 * q ** 3 + 3 * q ** 2) * ys[i + 1] + (q ** 3 - q ** 2) * h * m[i + 1];
  };
}
const PULL_LOG = mono(PK.map(k => k[0]), PK.map(k => k[1]));
export function pullCam(tl, t) {
  const x = clamp01((t - tl.pull[0]) / (tl.pull[1] - tl.pull[0])), lg = PULL_LOG(x);
  const u = (lg - PK[0][1]) / (PK[PK.length - 1][1] - PK[0][1]);
  return { S: Math.pow(10, lg), M: PULL.M0 + (PULL.M1 - PULL.M0) * u, u };
}
export const kadraj = c => 0.30144 * c.M * c.S;
// on'un her kuvvetinin geçildiği an (ses tıkları aynı takvimi okur)
export function decadeTicks(tl) {
  const out = []; let prev = Math.floor(Math.log10(kadraj(pullCam(tl, tl.pull[0]))));
  for (let t = tl.pull[0]; t <= tl.pull[1]; t += 0.001) {
    const d = Math.floor(Math.log10(kadraj(pullCam(tl, t))));
    if (d !== prev) { out.push({ t, d }); prev = d; }
  }
  return out;
}

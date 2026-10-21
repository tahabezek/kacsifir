// Domino zinciri (№ 023) — saf çekirdek: taş geometrisi, film içi temas takvimi, birim devrilme eğrisi,
// açı zinciri, kamera izi, özet ve ses ipuçları. Tarayıcı (domino.js) ve node (ses, kritik) aynı dosyayı okur.
// Fizik: Whitehead 1983 — bir taş kendisinden ~1,5 kat büyük taşı devirir. Bütün taşlar benzer olduğu için
// devrilme eğrisi tek bir birim taş için bir kez hesaplanır (pişirilir); her taş onu kendi süresiyle okur.
import { ease, seg, lerp, clamp01 } from '../core.js';

export const H1 = 0.005;                      // 1. taş: 5 mm
export const RATIO = 1.5;
export const THICK = 0.16, WIDE = 0.5, GAP = 0.55;   // kalınlık, genişlik, aralık (boya oranla)
export const N = 37;                          // kırmızı taş
export const N_NEXT = 14;                     // döngünün sonraki zincirinden görünen taşlar (≤ 1 m)
export const FPS = 30;

export const hOf = k => H1 * Math.pow(RATIO, k - 1);

// Taş k'nın arka yüzünün x'i (zincir +x yönünde devrilir). Pivot: ön alt kenar.
export function chainXs(n) {
  const xs = [0, 0];
  for (let k = 1; k < n; k++) xs[k + 1] = xs[k] + (THICK + GAP) * hOf(k);
  return xs;
}
const XS = chainXs(N);
export const xOf = k => XS[k];

// ——— Birim taş: ön alt kenar çevresinde dönen dikdörtgen levha (boy 1, kalınlık THICK, g = 1) ———
// θ'' = 3[(1/2)sinθ − (t/2)cosθ] / (1 + t²); başlangıç açısal hızı ω0 (darbe). RK4, sabit adım; bir kez.
export const THETA_C = Math.asin(GAP);        // üst ön köşe sonraki taşın arka yüzüne değer
function bakeFall() {
  const t = THICK, w0 = 0.95, dt = 1e-4;
  const acc = th => (3 * (0.5 * Math.sin(th) - 0.5 * t * Math.cos(th))) / (1 + t * t);
  let th = 0, om = w0, time = 0;
  const samples = [[0, 0]];
  let tc = null;
  while (th < Math.PI / 2) {
    const k1o = acc(th), k1t = om;
    const k2o = acc(th + k1t * dt / 2), k2t = om + k1o * dt / 2;
    const k3o = acc(th + k2t * dt / 2), k3t = om + k2o * dt / 2;
    const k4o = acc(th + k3t * dt), k4t = om + k3o * dt;
    om += (dt / 6) * (k1o + 2 * k2o + 2 * k3o + k4o);
    th += (dt / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
    time += dt;
    if (tc === null && th >= THETA_C) tc = time;
    samples.push([time, Math.min(th, Math.PI / 2)]);
  }
  return { samples, tc, t90: time };
}
const FALL = bakeFall();
function thetaAtTime(time) {
  const s = FALL.samples;
  if (time <= 0) return 0;
  if (time >= FALL.t90) return Math.PI / 2;
  const i = Math.min(s.length - 2, Math.floor(time / 1e-4));
  const a = s[i], b = s[i + 1];
  return lerp(a[1], b[1], (time - a[0]) / (b[0] - a[0] || 1));
}
// Serbest düşüş: u = 0 → değme anı (θ_C) arasında; u > 1 yalnızca son taş için (yere kadar)
export const freeFall = u => thetaAtTime(u * FALL.tc);
export const LAND_U = FALL.t90 / FALL.tc;     // son taşın yere yattığı u
export function uAtTheta(th) {               // freeFall'ın tersi: açıya ulaşılan u
  const s = FALL.samples;
  for (let i = 1; i < s.length; i++) if (s[i][1] >= th) return s[i][0] / FALL.tc;
  return LAND_U;
}

// ——— Kısıt: taş i'nin üst ön köşesi, φ açısıyla dönen taş i+1'in arka yüzünde kayar ———
// Bütün çiftler benzer (oran 1,5) olduğu için θ_i = G(φ_{i+1}) tek bir tablo.
function bakeConstraint() {
  const h0 = 1, t0 = THICK, h1 = RATIO, t1 = THICK * RATIO;
  const P = [t0, 0];                            // i'nin pivotu (arka yüz x=0)
  const x1 = t0 + GAP;                          // i+1'in arka yüzü
  const P1 = [x1 + t1, 0];                      // i+1'in pivotu
  const tab = [];
  let th = THETA_C;
  for (let j = 0; j <= 900; j++) {
    const ph = (j / 900) * (Math.PI / 2);
    // i+1'in arka yüz doğrusu: B + s(sinφ, cosφ), B = P1 + (−t1 cosφ, t1 sinφ)
    const B = [P1[0] - t1 * Math.cos(ph), t1 * Math.sin(ph)], d = [Math.sin(ph), Math.cos(ph)];
    // köşe C(θ) = P + h0 (sinθ, cosθ); cross(C − B, d) = 0 → Newton
    for (let it = 0; it < 30; it++) {
      const C = [P[0] + h0 * Math.sin(th), P[1] + h0 * Math.cos(th)];
      const f = (C[0] - B[0]) * d[1] - (C[1] - B[1]) * d[0];
      const df = h0 * Math.cos(th) * d[1] + h0 * Math.sin(th) * d[0];
      const step = f / df;
      th -= step;
      if (Math.abs(step) < 1e-10) break;
    }
    tab.push(th);
  }
  return tab;
}
const GTAB = bakeConstraint();
export function constrained(ph) {
  const x = clamp01(ph / (Math.PI / 2)) * 900, i = Math.min(899, Math.floor(x));
  return lerp(GTAB[i], GTAB[i + 1], x - i);
}

// ——— Film takvimi: c[k] = taş k'nın itildiği an. Duraklarda yavaş çekim (dalga hiç durmaz) ———
export function buildDominoTimeline(ep) {
  const T = ep.timing;
  const c = [];
  c[1] = T.push;
  for (const [a, b, ta, tb] of T.segments) {
    const w = [];
    for (let i = a; i < b; i++) {
      let v = 1 + 2.2 * Math.exp(-((b - 1 - i) ** 2) / 2);   // durağa yaklaşırken yavaşla
      if (a > 1) v += 2.6 * Math.exp(-((i - a) ** 2) / 3);    // duraktan sonra yavaş kalkış
      if (a === 1 && i === 1) v += 0.6;                       // ilk itiş
      w.push(v);
    }
    const sum = w.reduce((s, v) => s + v, 0);
    let t = ta;
    for (let i = a; i < b; i++) { c[i] = t; t += (w[i - a] / sum) * (tb - ta); }
    c[b] = tb;
  }
  const land = T.land;                         // kırmızı taş yere değer (tek impact)
  const dur = T.duration;
  return {
    beat: 60 / ep.bpm, c, land, duration: dur, silence0: land - T.silence,
    says: ep.says, stops: ep.stops, dive: T.dive, push: T.push,
  };
}

// Taş açıları (rad) t anında: sondan başa, çünkü bir taş devrildikten sonra açısını sonrakinden alır.
export function anglesAt(tl, t, thetaHit = Math.PI / 2) {
  const uHit = uAtTheta(thetaHit);
  const a = new Float64Array(N + 2);
  const c = tl.c;
  for (let k = N; k >= 1; k--) {
    if (t < c[k]) { a[k] = 0; continue; }
    if (k === N) {
      const u = (t - c[N]) / ((tl.land - c[N]) / uHit);
      a[k] = Math.min(thetaHit, freeFall(Math.min(u, uHit)));
      continue;
    }
    if (t < c[k + 1]) a[k] = freeFall((t - c[k]) / (c[k + 1] - c[k]));
    else a[k] = constrained(a[k + 1]);
  }
  return a;
}

// Dalga cephesi: sürekli k (taş indeksi, kesirli) — kamera ve sayaç bunu okur
export function frontK(tl, t) {
  const c = tl.c;
  if (t <= c[1]) return 1;
  if (t >= c[N]) return N + clamp01((t - c[N]) / (tl.land - c[N]));
  let k = 1;
  while (k < N && t >= c[k + 1]) k++;
  return k + (t - c[k]) / (c[k + 1] - c[k]);
}

// Fritsch–Carlson monoton kübik: düğümler arasında kırılmasız, aşmasız
export function monotone(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (xs[i + 1] - xs[i - 1])) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]);
  return x => {
    if (x <= xs[0]) return ys[0] + m[0] * (x - xs[0]);
    if (x >= xs[n - 1]) return ys[n - 1] + m[n - 1] * (x - xs[n - 1]);
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], s = (x - xs[i]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

// Biçim: tr-TR, birim boya göre
const nf = d => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
export function fmtLen(m) {
  if (m < 0.01) return { num: nf(Math.abs(m * 1000 - Math.round(m * 1000)) < 0.05 ? 0 : 1).format(m * 1000), unit: 'mm' };
  if (m < 1) return { num: nf(m < 0.1 ? 1 : 0).format(m * 100), unit: 'cm' };
  if (m < 10) return { num: nf(2).format(m), unit: 'm' };
  if (m < 1000) return { num: nf(0).format(m), unit: 'm' };
  return { num: nf(1).format(m / 1000), unit: 'km' };
}

export function dominoSummary(ep) {
  const tl = buildDominoTimeline(ep);
  const c = tl.c, D = tl.duration;
  const stops = ep.stops.map(s => c[s.k]);
  return {
    duration: D, rw0: tl.dive[0], rw1: D, heroTl: tl.land, cover: 0,
    keys: [0, 0.6, (c[1] + c[16]) / 2, ...stops.map(t => t + 0.6), c[N] + 0.5, tl.land + 0.3, tl.land + 2.5, tl.land + 6.5, tl.dive[0] + 0.3, (tl.dive[0] + tl.dive[1]) / 2, D - 0.4],
    fast: (tl.dive[0] + tl.dive[1]) / 2, firstLand: c[16] + 0.6, lastLand: tl.land + 2.5,
  };
}

// Ses ipuçları: her temas (taş k, k+1'e değer), kırmızı taşın yere değişi, sessizlik, riser, dalış
export function dominoCues(ep) {
  const tl = buildDominoTimeline(ep);
  const hits = [];
  hits.push({ t: tl.c[1], k: 0, push: true });
  for (let k = 1; k < N; k++) hits.push({ t: tl.c[k + 1], k });
  return { beat: tl.beat, duration: tl.duration, hits, land: tl.land, silence0: tl.silence0, dive: tl.dive, riser: ep.timing.riser, push: tl.push };
}

// Hesap satırı (aha cümlesinin altında): "n adım · 1,5^n kat", n = 1 → 36. Görüntü ve ses aynı takvimi okur.
export const CALC = { delay: 2.2, dur: 2.0, n: N - 1 };
export function calcN(tl, t) {
  const u = ease.state(seg(t, tl.land + CALC.delay, CALC.dur));
  return 1 + Math.round((CALC.n - 1) * u);
}
export function calcTicks(tl) {
  const out = [];
  let prev = calcN(tl, tl.land + CALC.delay);
  for (let t = tl.land + CALC.delay; t <= tl.land + CALC.delay + CALC.dur + 0.01; t += 0.001) {
    const n = calcN(tl, t);
    if (n !== prev) { out.push({ t, n }); prev = n; }
  }
  return out;
}

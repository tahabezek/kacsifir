// "Bir arada olsa" (sürü) şablonunun saf çekirdeği: zaman çizelgesi, sayı, halı şekli, kamera, ses ipuçları.
// Tarayıcı (çizim) ve node (ses) aynı fonksiyonları okur.
import { ease, seg, lerp } from './core.js';
import { GEO } from './geo/shapes.js';

export function buildSwarmTimeline(ep) {
  const beat = 60 / ep.bpm;
  const B = b => b * beat;
  let cur = 0;
  const stops = ep.stops.map((s, i) => {
    const g0 = cur, g1 = i === 0 ? 0 : cur + s.grow;
    const land = s.hero ? g1 + ep.silenceBeats : g1;
    const h1 = land + s.hold;
    cur = h1;
    return { ...s, i, t0: B(g0), t1: B(g1), tl: B(land), t2: B(h1) };
  });
  const rw0 = B(cur), rw1 = B(cur + ep.rewindBeats);
  return { beat, stops, hero: stops.find(s => s.hero), rw0, rw1, duration: rw1 };
}

// t anında bir aradaki canlı sayısı (sürekli)
export function countAt(tl, t) {
  const S = tl.stops;
  if (t >= tl.rw0) {
    const r = ease.state(seg(t, tl.rw0, tl.rw1 - tl.rw0));
    return Math.exp(lerp(Math.log(S[S.length - 1].n), Math.log(S[0].n), r));
  }
  let n = S[0].n;
  for (let i = 1; i < S.length; i++) {
    const s = S[i];
    if (t < s.t0) break;
    const u = ease.state(seg(t, s.t0, s.t1 - s.t0));
    n = Math.exp(lerp(Math.log(S[i - 1].n), Math.log(s.n), u));
  }
  return n;
}

export function stopAt(tl, t) {
  let a = tl.stops[0];
  for (const s of tl.stops) if (t >= s.t1) a = s;
  return a;
}

// ——— referans nesneler (mm) ———
export const REF_BOX = {
  coin: { w: 26.15, h: 26.15 },
  card: { w: 85.6, h: 53.98 },
  plate: { w: 270, h: 270 },
  tile: { w: 600, h: 600 },
  bed: { w: 1600, h: 2000 },
  room: { w: 5300, h: 5300 },
  pitch: { w: 105000, h: 68000 },
};
export function refBox(ref) {
  if (ref.kind === 'geo') { const g = GEO[ref.key]; return { w: g.bboxKm[0] * 1e6, h: g.bboxKm[1] * 1e6 }; }
  return REF_BOX[ref.kind];
}

// ——— halının şekli: sayıyı kapsayan ilk durağın şekli ———
export function shapeStop(tl, n) {
  for (const s of tl.stops) if (n <= s.n * 1.000001) return s;
  return tl.stops[tl.stops.length - 1];
}
// Halının dünya geometrisi (mm): tür + sınır kutusu (+ tarama için x eşiği)
export function carpetGeom(tl, ep, n) {
  const A = n * ep.cellMM * ep.cellMM;
  const s = shapeStop(tl, n);
  const kind = s.shape || 'square';
  if (kind === 'rect') {
    const R = refBox(s.ref), a = R.w / R.h;
    const w = Math.sqrt(A * a);
    return { kind, A, w, h: A / w };
  }
  if (kind === 'geo') {
    const g = GEO[s.ref.key], f = Math.sqrt(A / (g.areaKm2 * 1e12));
    return { kind, A, key: s.ref.key, f, w: g.bboxKm[0] * 1e6 * f, h: g.bboxKm[1] * 1e6 * f };
  }
  if (kind === 'sweep') {
    const g = GEO[s.ref.key], frac = Math.min(1, A / (g.areaKm2 * 1e12));
    const T = g.sweep;
    let x = T[T.length - 1][0];
    for (let i = 1; i < T.length; i++) if (T[i][1] >= frac) { const [x0, f0] = T[i - 1], [x1, f1] = T[i]; x = x0 + (x1 - x0) * ((frac - f0) / Math.max(1e-9, f1 - f0)); break; }
    const xmin = T[0][0];
    return { kind, A, key: s.ref.key, xcutKm: x, frac, w: (x - xmin) * 1e6, h: g.bboxKm[1] * 1e6, full: refBox(s.ref) };
  }
  if (kind === 'flood') {
    const g = GEO[s.ref.key], frac = Math.min(1, A / (g.areaKm2 * 1e12));
    const T = g.flood.table;
    let r = T[T.length - 1][0];
    for (let i = 1; i < T.length; i++) if (T[i][1] >= frac) { const [r0, f0] = T[i - 1], [r1, f1] = T[i]; r = r0 + (r1 - r0) * ((frac - f0) / Math.max(1e-9, f1 - f0)); break; }
    return { kind, A, key: s.ref.key, rKm: r, origin: g.flood.origin, frac, w: 2 * r * 1e6, h: 2 * r * 1e6, full: refBox(s.ref) };
  }
  const side = Math.sqrt(A);
  return { kind: 'square', A, w: side, h: side };
}

// Kamera: px/mm. Halının ve görünen referansın kutusunu bölgeye sığdırır;
// bekleme sırasında %8 doğrusal geri çekilme (sürekli hareket; yazılar sabit).
// Yayılma (flood) durağı için kamera: önceki durağın çerçevesinden (merkez = yayılma kökeni)
// ülke çerçevesine logaritmik açılış. Dönüş: { scale, cx, cy } (mm, ülke koordinatı) ya da null.
export function floodCamera(tl, ep, t, zone) {
  const fs = tl.stops.find(s => s.shape === 'flood');
  if (!fs) return null;
  const prev = tl.stops[fs.i - 1];
  const fit = (w, h) => Math.min(zone.w / w, zone.h / h);
  const A = refBox(prev.ref), B = refBox(fs.ref), o = GEO[fs.ref.key].flood.origin.map(v => v * 1e6);
  const sA = fit(A.w * 1.04, A.h * 1.04), sB = fit(B.w * 1.04, B.h * 1.04);
  let u;
  if (t < fs.t0) return null;
  if (t < tl.rw0) u = ease.state(seg(t, fs.t0, (fs.t1 - fs.t0) * 0.8));
  else {
    u = 1 - ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) * 0.35));
    if (u <= 0) return null;
  }
  let scale = Math.exp(lerp(Math.log(sA), Math.log(sB), u));
  if (t >= fs.t1 && t < tl.rw0) scale /= 1 + 0.08 * seg(t, fs.t1, Math.max(0.01, fs.t2 - fs.t1));
  return { scale, cx: lerp(o[0], 0, u), cy: lerp(o[1], 0, u) };
}

export function cameraScale(tl, ep, t, zone) {
  const fc = floodCamera(tl, ep, t, zone);
  if (fc) return fc.scale;
  const fit = (w, h) => Math.min(zone.w / w, zone.h / h);
  const n = countAt(tl, t);
  const g = carpetGeom(tl, ep, n);
  // tek canlı büyükken bacak ve antenler de kadraja girsin
  const minBox = ep.cellMM * 1.45;
  let bw = Math.max(g.full ? g.full.w : g.w, minBox), bh = Math.max(g.full ? g.full.h : g.h, minBox);
  if (t < tl.rw0) {
    for (const s of tl.stops) {
      if (t >= s.t1 && t < s.t2 && s.ref) {
        const p = ease.state(seg(t, s.t1, 0.6));
        const R = refBox(s.ref);
        bw = Math.max(bw, lerp(bw, R.w * 1.04, p));
        bh = Math.max(bh, lerp(bh, R.h * 1.04, p));
      }
    }
    const s = stopAt(tl, t);
    return fit(bw, bh) / (1 + 0.08 * seg(t, s.t1, Math.max(0.01, s.t2 - s.t1)));
  }
  // geri sarma: kamera halıya kilitli; son referans kadrajından halıya yumuşak geçiş
  const last = tl.stops[tl.stops.length - 1];
  const r = ease.state(seg(t, tl.rw0, tl.rw1 - tl.rw0));
  const g0 = carpetGeom(tl, ep, last.n);
  const R = last.ref ? refBox(last.ref) : { w: g0.w, h: g0.h };
  const s0 = fit(R.w * 1.04, R.h * 1.04) / 1.08, sc0 = fit(Math.max(g0.full ? g0.full.w : g0.w, minBox), Math.max(g0.full ? g0.full.h : g0.h, minBox));
  return fit(bw, bh) * lerp(s0 / sc0, 1, ease.state(Math.min(1, r * 2.5)));
}

// Ses ipuçları: tower ile aynı biçim (audio.mjs ortak sentezleyicisi okur)
export function swarmCues(ep) {
  const tl = buildSwarmTimeline(ep);
  return {
    beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: tl.hero ? { t1: tl.hero.t1, tl: tl.hero.tl } : null,
    grows: tl.stops.slice(1).map(s => ({ t0: s.t0, t1: s.t1, hero: !!s.hero })),
    lands: tl.stops.slice(1).filter(s => !s.hero).map(s => s.t1),
    tallies: [],
  };
}

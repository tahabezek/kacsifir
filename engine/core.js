// Ortak çekirdek: tarayıcıdaki çizim ve node'daki ses sentezi aynı zaman çizelgesini okur.
// Her şey t'nin saf fonksiyonudur; kareler arasında durum taşınmaz.

export const W = 1080, H = 1920, FPS = 30;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// cubic-bezier(x1,y1,x2,y2) → f(x)
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = s => ((ax * s + bx) * s + cx) * s;
  const sy = s => ((ay * s + by) * s + cy) * s;
  const dx = s => (3 * ax * s + 2 * bx) * s + cx;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(s) - x, d = dx(s);
      if (Math.abs(e) < 1e-6) return sy(s);
      if (Math.abs(d) < 1e-6) break;
      s -= e / d;
    }
    let lo = 0, hi = 1; s = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(s);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = s; else hi = s;
      s = (lo + hi) / 2;
    }
    return sy(s);
  };
}

export const ease = {
  enter: bezier(0.16, 1, 0.3, 1),
  exit: bezier(0.6, 0, 0.9, 0.35),
  state: bezier(0.65, 0, 0.35, 1),
};

export const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
export const seg = (t, a, d) => clamp01((t - a) / d);
export const lerp = (a, b, u) => a + (b - a) * u;

// Birim basamak tepkisi, kütle 1. Ön ayarlar: arayüz 320/30 · kamera 170/26 · büyük yazı 120/24
export function spring(t, k, c) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k), z = c / (2 * w0);
  if (Math.abs(z - 1) < 1e-4) return 1 - (1 + w0 * t) * Math.exp(-w0 * t);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  const r = w0 * Math.sqrt(z * z - 1);
  const r1 = -z * w0 + r, r2 = -z * w0 - r;
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

// Sayı biçimi (tr-TR). units: [{upTo, div, name}] taban birimde; dec: bu değerin altı 1 ondalık
const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export function formatValue(v, fmt) {
  const u = fmt.units.find(u => v < u.upTo) || fmt.units[fmt.units.length - 1];
  const x = v / u.div;
  return { num: x < fmt.dec ? nf1.format(x) : nf0.format(x), unit: u.name };
}

// Zaman çizelgesi: vuruş ızgarası üzerinde kurulur, saniyeye çevrilir.
export function buildTimeline(ep) {
  const beat = 60 / ep.bpm;
  const B = b => b * beat;
  let cur = 0;
  const items = ep.items.map((it, i) => {
    const g0 = cur, g1 = cur + it.grow;
    const land = it.hero ? g1 + ep.silenceBeats : g1;
    const h1 = land + it.hold;
    cur = h1;
    return { ...it, i, t0: B(g0), t1: B(g1), tl: B(land), t2: B(h1) };
  });
  const rw0 = B(cur), rw1 = B(cur + ep.rewindBeats);
  const hero = items.find(it => it.hero);
  return { beat, items, hero, rw0, rw1, duration: rw1, startFrac: ep.startFrac ?? 0.3 };
}

// Sütun i'nin t anındaki yüksekliği (dünya birimi). 0 → görünmez.
export function barHeight(tl, i, t) {
  const it = tl.items[i];
  let h;
  if (i === 0) {
    const u = ease.state(seg(t, it.t0, it.t1 - it.t0));
    h = it.value * lerp(tl.startFrac, 1, u);
  } else {
    if (t < it.t0) return 0;
    const prev = tl.items[i - 1].value;
    const u = ease.state(seg(t, it.t0, it.t1 - it.t0));
    h = Math.exp(lerp(Math.log(prev), Math.log(it.value), u));
  }
  if (t > tl.rw0) {
    const c = rewindCap(tl, t);
    if (i > 0 && c <= tl.items[i - 1].value * 1.0001) return 0;
    h = Math.min(h, c);
  }
  return h;
}

export function rewindCap(tl, t) {
  const vmax = tl.items[tl.items.length - 1].value;
  const vmin = tl.items[0].value * tl.startFrac;
  const r = ease.state(seg(t, tl.rw0, tl.rw1 - tl.rw0));
  return Math.exp(lerp(Math.log(vmax), Math.log(vmin), r));
}

// Kamera: ekranda tutulacak dünya yüksekliği. Büyüme sırasında sütunu 0,12 sn gecikmeyle izler.
// Bekleme sırasında kamera doğrusal olarak %8 geri çekilir (sürekli hareket; yazılar sabit kalır).
const DRIFT = 0.08;
function holdDrift(tl, t) {
  let f = 1, base = tl.items[0].value;
  for (const it of tl.items) {
    if (t >= it.t1) { base = it.value; f = 1 + DRIFT * seg(t, it.t1, it.t2 - it.t1); }
  }
  return base * f;
}

export function cameraHeight(tl, t) {
  const v0 = tl.items[0].value;
  if (t > tl.rw0) {
    const r = ease.state(seg(t, tl.rw0, tl.rw1 - tl.rw0));
    return Math.max(v0, rewindCap(tl, t) * lerp(1 + DRIFT, 1, r));
  }
  const lag = 0.12;
  let hmax = Math.max(v0, holdDrift(tl, t));
  // gecikmeli izleme; ama sütun alanın %91'ini asla aşmaz (0,78 / 0,86)
  for (let i = 1; i < tl.items.length; i++) hmax = Math.max(hmax, barHeight(tl, i, t - lag), 0.86 * barHeight(tl, i, t));
  return hmax;
}

// Ölçü çentikleri: bekleme süresince sütuna cetvel gibi işlenir. Görüntü ve ses aynı takvimi okur.
export function tallyPlan(tl, ep, i) {
  const it = tl.items[i];
  const u = ep.format.units.find(u => it.value < u.upTo) || ep.format.units[ep.format.units.length - 1];
  const x = it.value / u.div;
  const step = x <= 60 ? 1 : Math.pow(10, Math.ceil(Math.log10(x / 60)));
  const n = Math.floor(x / step);
  const start = it.tl + (it.hero ? 0.45 : 0.15);
  const dur = Math.max(0.8, Math.min(n * 0.09, it.t2 - start - 0.5));
  return { n, start, dur, stepBase: step * u.div };
}

// Aktif öğe: büyümesi başlamış en son öğe (geri sarma sırasında görünür olan en son öğe).
export function activeIndex(tl, t) {
  let a = 0;
  for (let i = 0; i < tl.items.length; i++) if (t >= tl.items[i].t0 && barHeight(tl, i, t) > 0) a = i;
  return a;
}

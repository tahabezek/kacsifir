// Natural Earth (kamu malı) verisinden gerekli sınırları çıkarır, sadeleştirir, alanları doğrular.
//   node tools/geo_extract.mjs <admin0.geojson> <admin1.geojson>  → engine/geo/shapes.json
import fs from 'node:fs';

const [a0, a1, osmVa, osmIst] = process.argv.slice(2);
const countries = JSON.parse(fs.readFileSync(a0, 'utf8')).features;
const provinces = JSON.parse(fs.readFileSync(a1, 'utf8')).features;

const KM_LAT = 110.574, KM_LON = 111.32;
// Sinüzoidal (eşit alanlı) projeksiyon, km; y aşağı doğru artar (ekran yönü)
const proj = (lon0) => ([lon, lat]) => [(lon - lon0) * Math.cos((lat * Math.PI) / 180) * KM_LON, -lat * KM_LAT];
const ringArea = r => { let s = 0; for (let i = 0; i < r.length; i++) { const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % r.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s) / 2; };
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  let idx = 0, dmax = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const L = Math.hypot(bx - ax, by - ay) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= tol) return [pts[0], pts[pts.length - 1]];
  return [...dp(pts.slice(0, idx + 1), tol).slice(0, -1), ...dp(pts.slice(idx), tol)];
}
function dpRing(ring, tol) {
  const r = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring.slice(0, -1) : ring;
  let far = 0, dm = 0;
  for (let i = 1; i < r.length; i++) { const d = Math.hypot(r[i][0] - r[0][0], r[i][1] - r[0][1]); if (d > dm) { dm = d; far = i; } }
  const a = dp(r.slice(0, far + 1), tol), b = dp([...r.slice(far), r[0]], tol);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}
const polys = g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);

function shape(feature, lon0, tol, minKm2) {
  const P = proj(lon0);
  const rings = [];
  let area = 0;
  for (const poly of polys(feature.geometry)) {
    const outer = poly[0].map(P);
    const a = ringArea(outer) - poly.slice(1).reduce((s, h) => s + ringArea(h.map(P)), 0);
    if (a < minKm2) continue;
    area += a;
    rings.push(dpRing(outer, tol).map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]));
  }
  // merkezle (km)
  let mx = 0, my = 0, n = 0;
  for (const r of rings) for (const [x, y] of r) { mx += x; my += y; n++; }
  const xs = rings.flat().map(p => p[0]), ys = rings.flat().map(p => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return { areaKm2: +area.toFixed(4), rings: rings.map(r => r.map(([x, y]) => [+(x - cx).toFixed(4), +(y - cy).toFixed(4)])),
    bboxKm: [+(Math.max(...xs) - Math.min(...xs)).toFixed(3), +(Math.max(...ys) - Math.min(...ys)).toFixed(3)], center: [cx, cy] };
}

const tr = countries.find(f => f.properties.ADM0_A3 === 'TUR');
const va = osmVa ? JSON.parse(fs.readFileSync(osmVa, 'utf8')).features[0] : countries.find(f => f.properties.ADM0_A3 === 'VAT');
const ist = osmIst ? JSON.parse(fs.readFileSync(osmIst, 'utf8')).features[0] : provinces.find(f => f.properties.adm0_a3 === 'TUR' && /stanbul/i.test(f.properties.name || ''));
const out = {
  source: 'Natural Earth 1:10m (kamu malı), sinüzoidal eşit alanlı projeksiyon, km',
  turkey: shape(tr, 35, 0.8, 30),
  vatican: shape(va, 12.45, 0.002, 0),
  istanbul: shape(ist, 29, 0.15, 1),
};

// Türkiye'yi batıdan doğuya dolduran tarama: x eşiğine göre kümülatif alan oranı
function clipArea(rings, X) {
  let s = 0;
  for (const r of rings) {
    // Sutherland–Hodgman: x <= X yarı düzlemi
    const outp = [];
    for (let i = 0; i < r.length; i++) {
      const A = r[i], B = r[(i + 1) % r.length];
      const ain = A[0] <= X, bin = B[0] <= X;
      if (ain) outp.push(A);
      if (ain !== bin) { const t = (X - A[0]) / (B[0] - A[0]); outp.push([X, A[1] + t * (B[1] - A[1])]); }
    }
    if (outp.length > 2) s += ringArea(outp);
  }
  return s;
}
const T = out.turkey;
const xs = T.rings.flat().map(p => p[0]);
const xmin = Math.min(...xs), xmax = Math.max(...xs);
const total = clipArea(T.rings, xmax + 1);
const sweep = [];
for (let k = 0; k <= 400; k++) { const X = xmin + (xmax - xmin) * k / 400; sweep.push([+X.toFixed(3), +(clipArea(T.rings, X) / total).toFixed(5)]); }
out.turkey.sweep = sweep;

// hedef: dünyadaki bütün karıncalar 500.000 km² (2e16 × 25 mm²); Türkiye resmî 783.562 km²
const frac = 500000 / 783562;
let Xf = xmin;
for (const [X, f] of sweep) if (f <= frac) Xf = X;
// o hizadaki il merkezleri (etiket noktaları), aynı projeksiyon
const P = proj(35);
const trProv = provinces.filter(f => f.properties.adm0_a3 === 'TUR').map(f => {
  const [x, y] = P([f.properties.longitude, f.properties.latitude]);
  return { name: f.properties.name, x: x - T.center[0], y: y - T.center[1], lon: f.properties.longitude };
});
out.turkey.sweepFrac = frac;
out.turkey.sweepX = Xf;
out.turkey.provincesNearSweep = trProv.filter(p => Math.abs(p.x - Xf) < 45).sort((a, b) => a.y - b.y).map(p => `${p.name} (${p.lon.toFixed(2)}°D, ${(p.x - Xf).toFixed(0)} km)`);
out.turkey.sweepLon = 35 + (Xf + T.center[0]) / (KM_LON * Math.cos((39 * Math.PI) / 180));

fs.mkdirSync('engine/geo', { recursive: true });
fs.writeFileSync('engine/geo/shapes.json', JSON.stringify(out));
console.log({
  turkeyKm2: T.areaKm2, vaticanKm2: out.vatican.areaKm2, istanbulKm2: out.istanbul.areaKm2,
  istanbulName: ist && (ist.properties.name || ist.properties.display_name), points: { tr: T.rings.reduce((s, r) => s + r.length, 0), ist: out.istanbul.rings.reduce((s, r) => s + r.length, 0), va: out.vatican.rings.reduce((s, r) => s + r.length, 0) },
  frac: frac.toFixed(4), sweepLonApprox: out.turkey.sweepLon.toFixed(2), near: out.turkey.provincesNearSweep,
  bytes: fs.statSync('engine/geo/shapes.json').size,
});

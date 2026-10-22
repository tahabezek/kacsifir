// Gravür küre: gerçek dünya verisi (Natural Earth, world-atlas) ortografik izdüşümle bakır gravür dilinde çizilir.
// Kamera tek bir dönüşümdür {c: [boylam, enlem], r: yarıçap px, cx, cy}; yarıçap log uzayda ara değerlenir.
// Deniz yatay ince çizgi, kara açık kâğıt + mürekkep kıyı, sınırlar kesik grafit, gölge hilali çapraz tarama.
import { geoOrthographic, geoPath, geoGraticule, geoInterpolate, geoDistance, geoArea } from 'd3-geo';
import { feature, mesh, merge } from 'topojson-client';
import { W, ease, lerp } from './core.js';
import { C, F, setFont } from './tower.js';

export const LAND_PAPER = '#F4EEE1';

// d3 küresel poligonlarda halka yönüne bakar: alanı yarım küreden büyük çıkan parça ters sarılmıştır (10m verisinde
// bir parça) ve "dünyanın geri kalanını" doldurur. Bu parçaların halkaları ters çevrilir.
function rewind(f) {
  for (const ft of f.features || [f]) {
    const g = ft.geometry; if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const p of polys) if (geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI) p.forEach(r => r.reverse());
  }
  return f;
}

export async function loadWorld() {
  const get = async u => (await fetch(u)).json();
  const [land50, land10, countries] = await Promise.all([
    get('../node_modules/world-atlas/land-50m.json'),
    get('../node_modules/world-atlas/land-10m.json'),
    get('../node_modules/world-atlas/countries-50m.json'),
  ]);
  const geoms = countries.objects.countries.geometries;
  return {
    LAND: rewind(feature(land50, land50.objects.land)), LAND10: rewind(feature(land10, land10.objects.land)),
    BORDERS: mesh(countries, countries.objects.countries, (a, b) => a !== b),
    GRAT: geoGraticule().step([30, 30])(),
    country: id => feature(countries, geoms.find(g => g.id === id)),
    union: ids => merge(countries, geoms.filter(g => ids.includes(g.id))),
    bordersAmong: ids => mesh(countries, countries.objects.countries, (a, b) => a !== b && ids.includes(a.id) && ids.includes(b.id)),
  };
}

export const mixCam = (a, b, u) => ({
  c: geoInterpolate(a.c, b.c)(u), r: Math.exp(lerp(Math.log(a.r), Math.log(b.r), u)),
  cx: lerp(a.cx ?? 540, b.cx ?? 540, u), cy: lerp(a.cy, b.cy, u),
});

// segs: [{t0, t1, to: t => kamera}] — her geçiş önceki durumdan (işlev olabilir: takip) yenisine durum eğrisiyle
export function camAt(t, start, segs) {
  let prev = () => start;
  for (const s of segs) {
    if (t < s.t0) return prev(t);
    if (t < s.t1) return mixCam(prev(t), s.to(t), ease.state((t - s.t0) / (s.t1 - s.t0)));
    prev = s.to;
  }
  return prev(t);
}

export function makeGlobe(ctx, world, stageTop) {
  const proj = geoOrthographic().clipAngle(90).precision(0.4);
  const path = geoPath(proj, ctx);
  let CAM = null;
  // ekran dışı kırpma: çok yakın planda (r ≫ ekran) ufuk yayı onbinlerce piksel uzakta kalır; dikdörtgen kırpma
  // dolgu yönünü korur ve çizimi hızlandırır
  proj.clipExtent([[-60, stageTop - 60], [W + 60, 1980]]);
  const setCam = k => { CAM = k; proj.rotate([-k.c[0], -k.c[1]]).scale(k.r).translate([k.cx ?? 540, k.cy]); };
  const visible = p => geoDistance(CAM.c, p) < Math.PI / 2 - 0.02;

  function draw(extraLand) {
    const k = CAM, r = k.r, cx = k.cx ?? 540, cy = k.cy;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, stageTop, W, 1920 - stageTop); ctx.clip();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineWidth = 1.1;
    const y0 = Math.max(stageTop, cy - r), y1 = Math.min(1920, cy + r);
    for (let y = Math.ceil(y0 / 7) * 7; y < y1; y += 7) { ctx.beginPath(); ctx.moveTo(Math.max(0, cx - r), y + 0.5); ctx.lineTo(Math.min(W, cx + r), y + 0.5); ctx.stroke(); }
    ctx.beginPath(); path(world.GRAT); ctx.strokeStyle = 'rgba(139,133,119,0.7)'; ctx.lineWidth = 1; ctx.stroke();
    const LD = r > 9000 ? world.LAND10 : world.LAND;
    ctx.beginPath(); path(LD); ctx.lineWidth = 16; ctx.strokeStyle = C.paper; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = LAND_PAPER; ctx.fill();
    if (extraLand) extraLand();
    ctx.beginPath(); path(world.BORDERS); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(139,133,119,0.85)'; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); path(LD); ctx.lineWidth = 1.7; ctx.strokeStyle = C.ink; ctx.stroke();
    if (r < 2600) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 1.04, 0, Math.PI * 2); ctx.clip('evenodd');
      ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 1;
      for (let d = -2 * r; d < 2 * r; d += 6) { ctx.beginPath(); ctx.moveTo(cx + d - r, cy - r); ctx.lineTo(cx + d + r, cy + r); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    if (r < 2600) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.restore();
  }
  // bir bölgeyi taramayla doldurur (kâğıt üstüne çapraz mürekkep çizgi), açı ve aralıkla
  function hatch(geo, { gap = 7, angle = 45, color = 'rgba(28,27,24,0.55)', w = 1.3 } = {}) {
    ctx.save(); ctx.beginPath(); path(geo); ctx.clip();
    const a = (angle * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
    ctx.strokeStyle = color; ctx.lineWidth = w;
    for (let d = -2400; d < 2400; d += gap) { ctx.beginPath(); ctx.moveTo(540 + dy * d - dx * 2400, 1000 - dx * d - dy * 2400); ctx.lineTo(540 + dy * d + dx * 2400, 1000 - dx * d + dy * 2400); ctx.stroke(); }
    ctx.restore();
  }
  function line(coords, { color = C.ink, w = 4, dash = null } = {}) {
    if (coords.length < 2) return;
    ctx.beginPath(); path({ type: 'LineString', coordinates: coords });
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  function ringAt(p, u, rad = 26, color = C.ink) {
    if (u <= 0 || !visible(p)) return; const q = proj(p);
    ctx.beginPath(); ctx.arc(q[0], q[1], rad, -2.2, -2.2 + Math.PI * 2.15 * ease.enter(u)); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke();
  }
  function placeLabel(p, text, u, dx = 18, dy = -14, color = C.ink, align = 'left', dot = true) {
    if (u <= 0 || !visible(p)) return; const q = proj(p);
    if (q[0] < 20 || q[0] > W - 20 || q[1] + dy < stageTop + 44) return;   // noktası ekran dışındaysa ad yazılmaz
    ctx.save();
    if (dot) { ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
    setFont(ctx, F.mono(30));
    // ekran kenarına taşmaz: önce öbür yana geçer, yine sığmazsa içeri kaydırılır (40 px pay)
    { const tw0 = ctx.measureText(text).width; if (align === 'right' && q[0] - dx - tw0 < 40) align = 'left'; else if (align === 'left' && q[0] + dx + tw0 > W - 40) align = 'right'; }
    let x = align === 'right' ? q[0] - dx : align === 'center' ? q[0] : q[0] + dx;
    { const tw1 = ctx.measureText(text).width; x = align === 'left' ? Math.max(40, Math.min(x, W - 40 - tw1)) : align === 'right' ? Math.min(W - 40, Math.max(x, 40 + tw1)) : Math.max(40 + tw1 / 2, Math.min(x, W - 40 - tw1 / 2)); }
    ctx.textAlign = align;
    ctx.lineWidth = 7; ctx.strokeStyle = C.paper; ctx.lineJoin = 'round'; ctx.textAlign = align;
    const k = ease.enter(u), wdt = ctx.measureText(text).width;
    ctx.beginPath();
    if (align === 'right') ctx.rect(x - wdt * k - 4, q[1] + dy - 34, wdt * k + 8, 46);
    else if (align === 'center') ctx.rect(x - wdt / 2 - 4, q[1] + dy - 34, wdt * k + 8, 46);
    else ctx.rect(x - 4, q[1] + dy - 34, wdt * k + 8, 46);
    ctx.clip();
    ctx.strokeText(text, x, q[1] + dy); ctx.fillStyle = color; ctx.fillText(text, x, q[1] + dy);
    ctx.restore();
  }
  return { proj, path, setCam, visible, draw, hatch, line, ringAt, placeLabel, get cam() { return CAM; } };
}

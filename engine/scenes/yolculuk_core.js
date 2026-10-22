// "Yolculuk" çekirdeği: anlatımın ölçülmüş sürelerinden zaman çizelgesi (ses saattir), rotalar ve
// film zamanı → yol/tarih/km eşlemesi. Tarayıcıdaki çizim ve node'daki ses aynı fonksiyonları okur.
import { geoInterpolate, geoDistance } from 'd3-geo';
import { clamp01, seg, lerp } from '../core.js';

const R_KM = 6371.0088;

// Satır arası boşluklar (sn). Varsayılan 0,3; doruktan önce gerçek sessizlik (l13 → l14).
const GAP = { l01: 0.25, l04: 1.0, l05: 0.15, l07: 0.2, l08: 0.15, l09: 1.6, l10: 0.2, l11: 0.9, l12: 0.35, l13: 0.8, l14: 1.3, l15: 0.7 };
const LEAD = 0.12, ASK_HOLD = 2.6, LOOP = 1.2;

export function buildYolTimeline(ep, voice) {
  const L = {};
  let t = LEAD;
  for (const ln of ep.voice.lines) {
    const v = voice[ln.id];
    const dur = v.dur ?? v.words.at(-1).t1;
    const words = (v.words || []).map(w => ({ ...w, t0: t + w.t0, t1: t + w.t1 }));
    L[ln.id] = { id: ln.id, text: ln.text, t0: t, t1: t + dur, end: words.at(-1)?.t1 ?? t + dur, words };
    // satır, konuşmanın ölçülmüş bitişinde biter (dosya sonundaki sessizlik sayılmaz)
    t += Math.min(dur, (v.words?.at(-1)?.t1 ?? dur) + 0.12) + ((ep.voice.gaps || GAP)[ln.id] ?? 0.3);
  }
  const last = L[ep.voice.lines.at(-1).id];
  const askEnd = last.end + ASK_HOLD;
  // kelime zamanı: satırdaki n'inci kelime (0'dan) ya da kelimenin başladığı yer (önek eşleşmesi)
  const W = (id, key, edge = 't0') => {
    const ws = L[id].words;
    const w = typeof key === 'number' ? ws[Math.min(key, ws.length - 1)] : ws.find(w => w.w.toLocaleLowerCase('tr').startsWith(key.toLocaleLowerCase('tr')));
    if (!w) throw new Error(`kelime yok: ${id} ${key}`);
    return w[edge];
  };
  return { L, W, duration: askEnd + LOOP, loop0: askEnd, askEnd };
}

// ——— Rotalar (şematik; büyük daire parçalarıyla sıklaştırılır) ———
// Kuş: 2022 genç kıyı çamurçulluğu, etiket 234684. Alaska → Kiribati üstü (19 Eki) → Vanuatu (21 Eki) →
// Yeni Kaledonya → Avustralya kıyısı açıkları → Tazmanya, Ansons Bay (24 Eki).
export const BIRD = [[-164.6, 60.9], [-170.5, 45], [-176, 22], [175.5, 2.0], [168.3, -16.0], [165.0, -21.5], [157.5, -30.5], [154.0, -36.5], [150.4, -40.0], [148.28, -41.03]];

// Adam: Karl Bushby (Goliath Expedition). d = yaklaşık tarih (ondalık yıl), kind = bu noktaya giden parçanın türü.
export const WALK = [
  { p: [-70.91, -53.16], d: 1998.83, name: 'PUNTA ARENAS' },
  { p: [-68.3, -38.95], d: 1999.4 },
  { p: [-70.6, -24.0], d: 1999.85 },
  { p: [-77.03, -12.05], d: 2000.3 },
  { p: [-78.5, -0.2], d: 2000.6 },
  { p: [-74.08, 4.6], d: 2000.85 },
  { p: [-77.4, 7.9], d: 2001.1, name: 'DARİÉN' },
  { p: [-84.1, 9.9], d: 2001.35 },
  { p: [-90.5, 14.6], d: 2001.6 },
  { p: [-99.13, 19.43], d: 2001.95 },
  { p: [-110.94, 31.33], d: 2002.33 },
  { p: [-115.1, 36.2], d: 2002.5 },
  { p: [-111.9, 48.6], d: 2003.0 },
  { p: [-135.05, 60.72], d: 2004.0 },
  { p: [-147.72, 64.84], d: 2005.0 },
  { p: [-160.8, 63.9], d: 2005.9 },
  { p: [-168.1, 65.6], d: 2006.2, name: 'BERİNG BOĞAZI' },
  { p: [-169.8, 66.16], d: 2006.25, kind: 'ice' },
  { p: [174.0, 67.0], d: 2007.5 },
  { p: [153.7, 67.45], d: 2011.3 },
  { p: [129.73, 62.03], d: 2016.0 },
  { p: [104.3, 52.29], d: 2017.2 },
  { p: [106.92, 47.92], d: 2017.6 },
  { p: [87.6, 43.8], d: 2018.5 },
  { p: [76.9, 43.24], d: 2018.9 },
  { p: [69.24, 41.3], d: 2019.45 },
  { p: [64.42, 39.77], d: 2019.6 },
  { p: [58.38, 37.95], d: 2019.8, name: 'İRAN SINIRI', wait: 2024.55 },
  { p: [52.4, 42.0], d: 2024.58, kind: 'link' },
  { p: [49.87, 40.41], d: 2024.75, kind: 'swim', name: 'HAZAR DENİZİ' },
  { p: [44.8, 41.72], d: 2025.0 },
  { p: [41.27, 39.9], d: 2025.15 },
  { p: [32.85, 39.93], d: 2025.25 },
  { p: [28.98, 41.01], d: 2025.33, name: 'İSTANBUL' },
  { p: [26.56, 41.68], d: 2025.67 },
  { p: [23.32, 42.7], d: 2025.72 },
  { p: [19.04, 47.5], d: 2025.87 },
  { p: [16.37, 48.21], d: 2026.3 },
  { p: [8.68, 50.11], d: 2026.4 },
  { p: [4.35, 50.85], d: 2026.45 },
  { p: [1.86, 50.95], d: 2026.74 },
  { p: [1.31, 51.13], d: 2026.76, kind: 'swim', name: 'DOVER' },
];
export const HULL = { p: [-0.33, 53.74], name: 'HULL' };

// Bir çoklu çizgiyi büyük daire boyunca sıklaştırır; her noktada birikimli uzunluk (km) ve parça indeksi.
export function densify(pts, stepKm = 60) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], d = geoDistance(a, b) * R_KM, n = Math.max(1, Math.ceil(d / stepKm)), f = geoInterpolate(a, b);
    for (let k = i ? 1 : 0; k <= n; k++) out.push({ p: f(k / n), seg: i, km: 0 });
  }
  for (let i = 1; i < out.length; i++) out[i].km = out[i - 1].km + geoDistance(out[i - 1].p, out[i].p) * R_KM;
  return out;
}

// uzunluk tablosunda s km'deki nokta (ikili arama + büyük daire ara değeri)
export function pointAt(D, s) {
  if (s <= 0) return D[0].p;
  const n = D.length - 1;
  if (s >= D[n].km) return D[n].p;
  let lo = 0, hi = n;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (D[m].km <= s) lo = m; else hi = m; }
  const u = (s - D[lo].km) / (D[hi].km - D[lo].km || 1);
  return geoInterpolate(D[lo].p, D[hi].p)(u);
}
// s km'ye kadar olan kısım: noktalar + uçtaki ara nokta
export function slice(D, s0, s1) {
  const pts = [pointAt(D, s0)];
  for (const q of D) if (q.km > s0 && q.km < s1) pts.push(q.p);
  pts.push(pointAt(D, s1));
  return pts;
}
export const heading = (D, s, ds = 40) => { const a = pointAt(D, Math.max(0, s - ds)), b = pointAt(D, s + ds); return [a, b]; };

// Yürüyüş rotası: parçalara ayrılır (her parçanın türü ve uzunluk aralığı), durak noktalarının km'si
export function walkRoute() {
  const D = densify(WALK.map(w => w.p), 50);
  const nodeKm = [0];
  for (let i = 0; i < WALK.length - 1; i++) nodeKm.push(D.findLast(q => q.seg === i).km);
  const parts = WALK.slice(1).map((w, i) => ({ kind: w.kind || 'walk', s0: nodeKm[i], s1: nodeKm[i + 1] }));
  return { D, nodeKm, parts, total: nodeKm.at(-1) };
}
export function birdRoute() { const D = densify(BIRD, 60); return { D, total: D.at(-1).km }; }

// çizim uzunluğu → gerçek km: Bering'e kadar 27.000, Dover'da 49.500 (aradakiler çizim uzunluğuyla orantılı)
export function realKm(route, s, facts) {
  const iB = WALK.findIndex(w => w.name === 'BERİNG BOĞAZI') + 1, sB = route.nodeKm[iB];
  if (s <= sB) return facts.walk.kmBering * s / sB;
  return lerp(facts.walk.kmBering, facts.walk.kmDover, clamp01((s - sB) / (route.total - sB)));
}
// çizim uzunluğu → tarih (ondalık yıl), durak noktaları arasında doğrusal
export function dateAt(route, s) {
  const k = route.nodeKm;
  for (let i = 0; i < k.length - 1; i++) if (s <= k[i + 1]) return lerp(WALK[i].wait ?? WALK[i].d, WALK[i + 1].d, clamp01((s - k[i]) / (k[i + 1] - k[i] || 1)));
  return WALK.at(-1).d;
}

// ——— Film zamanı → yolculuk ———
// Kuş: havalanıştan inişe sabit hız (gerçekte de sabit uçar). Adam: anlatımdaki kelimelere bağlı duraklar;
// duraklar arasında sabit hız; bekleme durağında yol durur, takvim akar.
export function travelPlan(tl, route) {
  const { W, L } = tl;
  const bird = { t0: W('l02', 'havalan'), t1: W('l04', 'iniyor') + 0.1 };
  const idx = name => WALK.findIndex(w => w.name === name);
  const K = route.nodeKm;
  const wk = [
    { t: L.l06.t0 + 0.35, s: 0 },               // yürüyüş cümleyle başlar (ölü bekleme yok)
    { t: W('l08', 'donmuş'), s: K[idx('BERİNG BOĞAZI')] },
    { t: W('l08', 'geçiyor', 't1'), s: K[idx('BERİNG BOĞAZI') + 1] },
    { t: W('l09', 'aşıyor', 't1') + 0.15, s: K[idx('İRAN SINIRI')] },
    // bekleme: yol sabit, takvim 2019,8 → 2024,55
    { t: L.l09.end + 1.2, s: K[idx('İRAN SINIRI')], wait: true },
    { t: W('l10', 'yüzerek', 't1'), s: K[idx('HAZAR DENİZİ')] },
    { t: W('l10', 'istanbul'), s: K[idx('İSTANBUL')] },
    { t: W('l11', 'manş'), s: K[idx('DOVER') - 1] },
    { t: W('l11', 'çıktı'), s: K[idx('DOVER')] },
  ];
  const waitT = [wk[3].t, wk[4].t];
  const walkS = t => {
    if (t <= wk[0].t) return 0;
    for (let i = 0; i < wk.length - 1; i++) if (t <= wk[i + 1].t) return lerp(wk[i].s, wk[i + 1].s, seg(t, wk[i].t, wk[i + 1].t - wk[i].t));
    return route.total;
  };
  const walkDate = t => {
    if (t >= waitT[0] && t <= waitT[1]) return lerp(WALK[idx('İRAN SINIRI')].d, WALK[idx('İRAN SINIRI')].wait, seg(t, waitT[0], waitT[1] - waitT[0]));
    return dateAt(route, walkS(t));
  };
  // yürüyüş modu: parça türü (yüzme/buz/bekleme)
  const walkMode = t => {
    if (t >= waitT[0] && t < waitT[1]) return 'wait';
    const s = walkS(t);
    const p = route.parts.find(p => s >= p.s0 && s < p.s1) || route.parts.at(-1);
    return p.kind;
  };
  return { bird, wk, waitT, walkS, walkDate, walkMode };
}

// ses ipuçları (tools/audio_yolculuk.mjs): görüntüyle aynı anlar
export function yolCues(ep, voice) {
  const tl = buildYolTimeline(ep, voice);
  const { W, L } = tl;
  return {
    tl,
    whip: [L.l04.end + 0.55, L.l05.t0 + 0.2],
    hero: { silence0: L.l13.end + 0.12, land: L.l14.t0 - 0.04 },
    ring: W('l03', 'hiç') - 0.1,
    landBird: W('l04', 'iniyor') + 0.1,
    dover: W('l11', 'çıktı'),
    duration: tl.duration, loop0: tl.loop0,
  };
}

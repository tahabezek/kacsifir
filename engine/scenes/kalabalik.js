// "Kalabalık" şablonu (Kaç Sıfır?): Türkiye'deki herkes Kadıköy'e sığar mı?
// Kare 0: soru başlık; gravür kürede Türkiye, şehirlerde nüfus noktaları, Kadıköy'de halka. Sayaç 85.664.944'e çıkar;
// İstanbul'a dalış, kâğıt levhada Kadıköy planı (25,2 km², alanı ölçekli); büyüteçte 1 m²'de 4 kişi; şehirlerden
// Kadıköy'e akan nokta dereleri; doruk: Kadıköy'ün içinde gerçek ölçekli 21,4 km²'lik insan alanı (kırmızı), kalan
// 3,8 km² boş; sonda İstanbul ili (5.461 km²) ve bütün insanlık (≈2.075 km²) aynı ölçekte iki kare.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { geoInterpolate, geoContains } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { TOP_CARD, drawPersonTop } from '../kalabalik_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const KADC = [29.062, 40.983], IST = [28.98, 41.07], R_EARTH = 6371;
// şehirler: [ad, boylam, enlem, nüfus milyon (TÜİK 2024, yuvarlak)] — nokta yoğunluğu ve akış kaynakları
const CITIES = [['İSTANBUL', 28.98, 41.01, 15.7], ['ANKARA', 32.85, 39.93, 5.86], ['İZMİR', 27.14, 38.42, 4.49], ['BURSA', 29.06, 40.19, 3.24], ['ANTALYA', 30.71, 36.89, 2.72],
  ['KONYA', 32.49, 37.87, 2.32], ['ADANA', 35.32, 37.0, 2.27], ['ŞANLIURFA', 38.79, 37.16, 2.24], ['GAZİANTEP', 37.38, 37.07, 2.18], ['KOCAELİ', 29.92, 40.77, 2.12],
  ['MERSİN', 34.64, 36.8, 1.93], ['DİYARBAKIR', 40.23, 37.91, 1.82], ['HATAY', 36.16, 36.2, 1.54], ['MANİSA', 27.43, 38.61, 1.47], ['KAYSERİ', 35.49, 38.73, 1.45],
  ['SAMSUN', 36.33, 41.29, 1.38], ['BALIKESİR', 27.88, 39.65, 1.28], ['TEKİRDAĞ', 27.51, 40.98, 1.19], ['AYDIN', 27.84, 37.85, 1.17], ['VAN', 43.38, 38.5, 1.13],
  ['KAHRAMANMARAŞ', 36.94, 37.58, 1.12], ['SAKARYA', 30.4, 40.76, 1.1], ['DENİZLİ', 29.09, 37.78, 1.06], ['MUĞLA', 28.36, 37.21, 1.05], ['ESKİŞEHİR', 30.52, 39.78, 0.92],
  ['MARDİN', 40.74, 37.31, 0.89], ['TRABZON', 39.72, 41.0, 0.82], ['ERZURUM', 41.27, 39.9, 0.75], ['MALATYA', 38.31, 38.35, 0.74], ['SİVAS', 37.02, 39.75, 0.64],
  ['EDİRNE', 26.56, 41.68, 0.42], ['HAKKARİ', 43.74, 37.58, 0.28], ['ORDU', 37.88, 40.98, 0.77], ['ELAZIĞ', 39.22, 38.67, 0.6], ['BATMAN', 41.13, 37.88, 0.64]];
const FLOW_LABELS = ['EDİRNE', 'İZMİR', 'ANKARA', 'TRABZON', 'HAKKARİ'];
// Kadıköy ilçe sınırı (yaklaşık; boylam, enlem): Haydarpaşa → kuzey sınırı (Üsküdar) → doğu (Ataşehir, Maltepe) → kıyı
const KAD = [[29.016, 41.000], [29.028, 41.004], [29.042, 41.006], [29.058, 41.009], [29.072, 41.004], [29.085, 40.996], [29.103, 40.985], [29.110, 40.972],
  [29.104, 40.958], [29.098, 40.952], [29.083, 40.957], [29.066, 40.962], [29.050, 40.966], [29.038, 40.962], [29.032, 40.970], [29.026, 40.978], [29.021, 40.986],
  [29.022, 40.991], [29.016, 40.995]];
const KAD_LAND_EDGE = 10;   // ilk 10 köşe kara sınırı (komşu ilçeler), kalanı kıyı
// komşu kara (Üsküdar, Ataşehir, Maltepe): kuzey ve doğu
const LAND = [[29.016, 41.000], [29.004, 41.012], [29.015, 41.05], [29.05, 41.09], [29.085, 41.13], [29.11, 41.2], [29.15, 41.3], [29.6, 41.3], [29.6, 40.8], [29.3, 40.86], [29.13, 40.94], [29.098, 40.952]];
// Kadıköy planı kürenin kendi izdüşümünde çizilir: kamera 1 km = 75 px yakınlıkta Kadıköy'e iner (kıyı haritanın üstüne oturur)
const PXKM = 75, RPLAN = PXKM * 6371, PCY = 1010;
// İstanbul ili (yaklaşık sınır; denize taşan kısım Türkiye kara sınırıyla kırpılır): Silivri–Karadeniz–Şile–Gebze
const PROV = [[27.97, 40.95], [27.98, 41.20], [28.05, 41.40], [28.12, 41.62], [28.70, 41.62], [29.30, 41.45], [29.92, 41.30], [29.92, 41.18], [29.86, 41.05], [29.62, 40.95], [29.40, 40.84], [29.30, 40.70], [28.90, 40.78], [28.40, 40.86]];

export function kalabalikTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    pop0: L.l02.t0, dive: Wd('l03', 'kadıköy'), km: Wd('l03', 'yirmi'), four: Wd('l04', 'dört'), flow0: L.l05.t0, hero: L.l06.t0 - 0.04, fit: Wd('l06', 'sığıyor'),
    free: Wd('l07', 'dört'), world: L.l08.t0, ist: Wd('l08', 'istanbul'), half: Wd('l08', 'yarısına'), loop0: tl.loop0,
  };
  // plan A: dalıştan l05'e; plan B: doruktan l08'e (planlar yerinde, ~6 karede belirir ve söner)
  T.inA = T.dive + 0.85; T.outA = L.l05.t0 - 0.35; T.inB = T.hero - 0.4; T.outB = L.l08.t0 - 0.35; T.follow = L.l08.end + 0.3;
  return T;
}

export async function makeKalabalikRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, { ...world, GRAT: { type: 'MultiLineString', coordinates: [] } }, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = kalabalikTimes(tl), Fx = ep.facts;
  const rnd = mulberry32(40);

  // ——— nüfus noktaları: şehirlerin çevresine nüfusla orantılı, kalanı Türkiye sınırı içine serpiştirilir ———
  const TR = world.country('792');
  const DOTS = [];
  const N = 2600, popSum = CITIES.reduce((a, c) => a + c[3], 0);
  for (const [, lon, lat, pop] of CITIES) {
    const n = Math.round(N * 0.82 * pop / popSum), sp = 0.12 + 0.07 * Math.sqrt(pop);
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(-2 * Math.log(1 - rnd() * 0.999)) * sp * 0.6; const p = [lon + Math.cos(a) * d / Math.cos(lat * Math.PI / 180), lat + Math.sin(a) * d]; if (geoContains(TR, p)) DOTS.push({ p, city: lon }); }
  }
  for (let k = 0; DOTS.length < N && k < 20000; k++) { const p = [26 + rnd() * 19, 36 + rnd() * 6]; if (geoContains(TR, p)) DOTS.push({ p, city: p[0] }); }
  // akış: her nokta Kadıköy'e; uzaktaki erken çıkar, hepsi 'sığıyor'dan önce varır
  DOTS.forEach(d => { const dist = Math.hypot(d.p[0] - KADC[0], d.p[1] - KADC[1]); d.s0 = T.flow0 + 0.2 + 1.4 * (1 - dist / 16) * rnd(); d.dur = 1.4 + 0.25 * dist / 16 + rnd() * 0.3; d.f = geoInterpolate(d.p, KADC); d.lit = (d.p[0] - 26) / 19; });

  // ——— Kadıköy poligonu: alanı 25,2 km²'ye eşitlenir (merkez etrafında ölçek) ———
  const KMLON = 111.32 * Math.cos(KADC[1] * Math.PI / 180), KMLAT = 110.57;
  const area = P => { let a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
  const g = Math.sqrt(Fx.kadikoyKm2 / area(KAD.map(([lo, la]) => [(lo - KADC[0]) * KMLON, (la - KADC[1]) * KMLAT])));
  const sc = ([lo, la]) => [KADC[0] + (lo - KADC[0]) * g, KADC[1] + (la - KADC[1]) * g];
  const KADg = KAD.map(sc), LANDg = LAND.map(sc);
  const lons = KADg.map(p => p[0]), lats = KADg.map(p => p[1]);
  const KC = [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
  const insideP = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  // batıdan doğuya birikimli alan: insan alanının (21,4 km²) bittiği boylam
  const sweepLon = (P, frac, ok = () => true, step = 0.0004) => {
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const cum = []; let acc = 0; for (let x = x0; x <= x1; x += step) { for (let y = y0; y <= y1; y += step) if (insideP(x, y, P) && ok([x, y])) acc++; cum.push([x, acc]); }
    const target = frac * acc; for (const [x, a] of cum) if (a >= target) return { cut: x, x0, x1 }; return { cut: x1, x0, x1 };
  };
  const SW = sweepLon(KADg, Fx.needKm2 / Fx.kadikoyKm2);
  const TRc = world.country('792');
  const SWP = sweepLon(PROV, Fx.worldKm2 / Fx.istanbulKm2, p => geoContains(TRc, p), 0.012);
  // ekran px → boylam/enlem (plan yakınlığında etiket çapaları)
  const ll = (x, y) => [KC[0] + (x - 540) / (PXKM * KMLON), KC[1] - (y - PCY) / (PXKM * KMLAT)];
  const ANCH = { usk: ll(440, 770), ata: ll(840, 860), mal: ll(848, 1110), mar: ll(520, 1335), kad: ll(500, 1020) };

  // ——— kamera ———
  const S0 = { c: [35.3, 38.9], r: 2900, cy: 1130 }, S1 = { c: [34.6, 39.3], r: 2700, cy: 1120 };
  const KZ = t => ({ c: KC, r: RPLAN * (1 + 0.1 * (t < T.flow0 ? seg(t, T.dive + 1.0, T.outA - T.dive - 0.8) : seg(t, T.hero - 0.25, T.outB - T.hero + 0.1))), cy: PCY });
  const IZ = { c: [28.95, 41.17], r: 21000, cy: 1060 };
  // dalış iki adımda: önce orta yakınlıkta Kadıköy'e kayılır, sonra Kadıköy merkezde tutularak yakınlaşılır (ara karede boş deniz kalmaz); çıkış ters sırayla
  const MID = { c: KC, r: 9000, cy: PCY };
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, c: [35.3 - 0.8 * seg(t, 0, T.dive), 38.9 + 0.3 * seg(t, 0, T.dive)], r: S0.r * (1 + 0.04 * ease.enter(seg(t, 0, 0.6)) + 0.06 * seg(t, 0.6, T.dive)) }) },
    { t0: T.dive - 0.25, t1: T.dive + 0.3, to: () => MID },
    { t0: T.dive + 0.3, t1: T.dive + 1.1, to: KZ },
    { t0: T.outA + 0.1, t1: T.outA + 0.7, to: () => MID },
    { t0: T.outA + 0.7, t1: T.outA + 1.3, to: t => ({ ...S1, r: S1.r * (1 + 0.05 * seg(t, T.outA + 1.3, T.hero - T.outA - 2.9)) }) },
    { t0: T.hero - 1.45, t1: T.hero - 0.95, to: () => MID },
    { t0: T.hero - 0.95, t1: T.hero - 0.2, to: KZ },
    { t0: T.outB + 0.1, t1: T.outB + 0.7, to: () => ({ c: KC, r: 30000, cy: PCY }) },
    { t0: T.outB + 0.7, t1: T.outB + 1.3, to: t => ({ ...IZ, r: IZ.r * (1 + 0.08 * seg(t, T.outB + 1.3, T.loop0 - T.outB - 1.3)) }) },
    { t0: T.loop0, t1: D - 0.04, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);
  const chip = (s, x, y, a = 1, col = C.ink, al = 'center', size = 30) => { if (a <= 0) return; setFont(ctx, F.mono(size)); ctx.textAlign = al; const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 8, y - size - 2, tw + 16, size + 14); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); };
  const pathOf = P => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
  const pr = P => P.map(p => G.proj(p));

  // ——— Kadıköy planı (kürenin izdüşümünde; opaklıkla belirir) ———
  function planOverlay(t, a, B) {
    if (a <= 0) return;
    const KADpx = pr(KADg), LANDpx = pr(LANDg);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineWidth = 1.1; for (let y = STAGE_TOP + 4; y < 1920; y += 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    pathOf([...LANDpx, ...KADpx.slice(KAD_LAND_EDGE), KADpx[0]]); ctx.fillStyle = '#F4EEE1'; ctx.fill();
    pathOf(KADpx); ctx.fillStyle = C.paper; ctx.fill();
    const yTop = Math.min(...KADpx.map(p => p[1])) - 10, yBot = Math.max(...KADpx.map(p => p[1])) + 10;
    const xOf = lon => G.proj([lon, KC[1]])[0], X0 = xOf(SW.x0), XC = xOf(SW.cut), X1 = xOf(SW.x1);
    if (B) {
      const u = ease.state(seg(t, T.hero, T.fit + 0.3 - T.hero)), xc = lerp(X0, XC, u), red = t >= T.hero - 0.02 && t < T.free;
      ctx.save(); pathOf(KADpx); ctx.clip(); ctx.beginPath(); ctx.rect(X0 - 4, yTop, xc - X0 + 4, yBot - yTop); ctx.clip();
      ctx.fillStyle = red ? 'rgba(224,57,28,0.22)' : 'rgba(28,27,24,0.15)'; ctx.fillRect(X0 - 4, yTop, xc - X0 + 4, yBot - yTop);
      ctx.strokeStyle = red ? C.red : C.ink; ctx.lineWidth = 1.6; for (let d = -900; d < 900; d += 6) { ctx.beginPath(); ctx.moveTo(X0 + d, yTop); ctx.lineTo(X0 + d + 300, yBot); ctx.stroke(); }
      ctx.restore();
      if (t >= T.free - 0.1) { const v = ease.enter(seg(t, T.free - 0.1, 0.4)); ctx.save(); pathOf(KADpx); ctx.clip(); ctx.beginPath(); ctx.rect(XC, yTop, X1 - XC + 6, yBot - yTop); ctx.clip(); ctx.globalAlpha *= v; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; for (let d = -900; d < 900; d += 14) { ctx.beginPath(); ctx.moveTo(XC + d, yTop); ctx.lineTo(XC + d - 200, yBot); ctx.stroke(); } ctx.restore(); }
      if (u > 0.02) { ctx.beginPath(); ctx.moveTo(xc, yTop + 4); ctx.lineTo(xc, yBot - 4); ctx.lineWidth = 3; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke(); }
    }
    ctx.beginPath(); KADpx.slice(0, KAD_LAND_EDGE).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.setLineDash([10, 7]); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); KADpx.slice(KAD_LAND_EDGE - 1).concat([KADpx[0]]).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 3.5; ctx.stroke();
    ctx.beginPath(); LANDpx.slice(0, 7).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); LANDpx.slice(8).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    // ölçek çubuğu (1 km = kameranın ölçeği) ve etiketler (çapa noktalarında)
    const pk = G.cam.r / 6371, sb = { x: 400, y: 1395 };
    ctx.beginPath(); ctx.moveTo(sb.x, sb.y); ctx.lineTo(sb.x + pk, sb.y); ctx.moveTo(sb.x, sb.y - 8); ctx.lineTo(sb.x, sb.y + 8); ctx.moveTo(sb.x + pk, sb.y - 8); ctx.lineTo(sb.x + pk, sb.y + 8); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    chip('1 km', sb.x + pk + 14, sb.y + 10, 1, C.ink, 'left');
    const at = k => G.proj(ANCH[k]);
    chip('ÜSKÜDAR', ...at('usk')); chip('ATAŞEHİR', ...at('ata')); chip('MALTEPE', ...at('mal')); chip('MARMARA DENİZİ', ...at('mar'), 1, C.graphite);
    if (!B) chip('KADIKÖY · 25 km²', ...at('kad'), ease.enter(seg(t, T.km - 0.1, 0.4)), C.ink, 'center', 34);
    else {
      const red = t >= T.hero - 0.02 && t < T.free, q = at('kad');
      chip('86 MİLYON KİŞİ · 21,4 km²', (X0 + XC) / 2 - 20, q[1] + 30, ease.enter(seg(t, T.fit - 0.2, 0.4)), red ? C.red : C.ink, 'center', 32);
      // kalan boş şerit: ayırıcının sağında, şeridin üstünde, bağ çizgisiyle
      const v = ease.enter(seg(t, T.free, 0.4));
      if (v > 0) { const lx = XC + 18, ly = yTop - 6; ctx.save(); ctx.globalAlpha *= v; ctx.beginPath(); ctx.moveTo(lx + 30, ly + 8); ctx.lineTo((XC + X1) / 2, q[1] - 40); ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); chip('≈ 4 km² BOŞ', lx, ly, v, C.ink, 'left', 30); }
    }
    ctx.restore();
  }

  // ——— İstanbul ili: yaklaşık sınır (karayla kırpılır), bütün insanlık ilin %38'i kadar tarama ———
  function province(t) {
    if (t < T.ist - 0.3 || t >= T.loop0 + 0.6) return;
    const kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.5)) : 1;
    const P = pr(PROV), ua = ease.state(seg(t, T.ist - 0.3, 0.9)), ub = ease.state(seg(t, T.half, 0.9));
    ctx.save(); ctx.globalAlpha = kout;
    ctx.beginPath(); G.path(TRc); ctx.clip();
    // sınır: saat yönünde çizilerek belirir
    const len = P.reduce((a, p, i) => a + (i ? Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) : 0), 0) + Math.hypot(P[0][0] - P.at(-1)[0], P[0][1] - P.at(-1)[1]);
    pathOf(P); ctx.setLineDash([12, 8]); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.globalAlpha = kout * Math.min(1, ua * 1.5); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = kout; void len;
    if (ub > 0) {
      const xOf = lon => G.proj([lon, 41.1])[0], x0 = xOf(SWP.x0), xc = lerp(x0, xOf(SWP.cut), ub);
      ctx.save(); pathOf(P); ctx.clip(); ctx.beginPath(); ctx.rect(x0 - 4, STAGE_TOP, xc - x0 + 4, 1920 - STAGE_TOP); ctx.clip();
      ctx.fillStyle = 'rgba(28,27,24,0.18)'; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; for (let d = -1400; d < 1400; d += 7) { ctx.beginPath(); ctx.moveTo(540 + d - 400, STAGE_TOP); ctx.lineTo(540 + d + 400, 1920); ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(xc, G.proj([SWP.cut, 41.55])[1]); ctx.lineTo(xc, G.proj([SWP.cut, 40.9])[1]); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    }
    ctx.restore();
    const top = G.proj([28.9, 41.62]), bot = G.proj([28.6, 40.82]);
    chip('İSTANBUL İLİ · 5.461 km²', top[0], top[1] - 18, ua * kout, C.ink, 'center', 30);
    chip('BÜTÜN İNSANLIK · ≈ 2.075 km²', Math.max(250, bot[0]), bot[1] + 56, ease.enter(seg(t, T.half + 0.5, 0.4)) * kout, C.ink, 'center', 30);
  }

  // ——— büyüteç: 1 m²'de 4 kişi ———
  function roundel(t, k) {
    if (k <= 0) return;
    const R = ROUND, r = R.r * ease.enter(k);
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    const s = 150; ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.setLineDash([8, 6]); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(-s / 2, -s / 2, s, s); ctx.setLineDash([]);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([i, j], n) => { ctx.save(); ctx.translate(i * 38 + Math.sin(t * 2.1 + n * 1.9) * 6, j * 38 + Math.cos(t * 1.7 + n * 1.3) * 6); drawPersonTop(ctx, TOP_CARD, { ang: Math.sin(t * 1.3 + n * 1.7) * 0.6, hair: n % 2 }, 62); ctx.restore(); });
    setFont(ctx, F.mono(26)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('1 m', 0, s / 2 + 30);
    ctx.save(); ctx.translate(s / 2 + 26, 0); ctx.rotate(-Math.PI / 2); ctx.fillText('1 m', 0, 0); ctx.restore();
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(41); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.km, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'mutlu'], [T.world, 'sasirma', 'saskin'], [T.world + 1.6, 'ayakta', 'mutlu'], [T.follow, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.fit + 0.1, T.fit + 1.6, 'Sığdı!', 270]];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text, dy] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - dy;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const p = ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    let fs = 100; setFont(ctx, F.head(fs)); while (Math.max(ctx.measureText("Türkiye'deki herkes").width, ctx.measureText("Kadıköy'e sığar mı?").width) > SAFE.x1 - SAFE.x0 && fs > 60) { fs -= 2; setFont(ctx, F.head(fs)); }
    revealText(ctx, "Türkiye'deki herkes", SAFE.x0, 480, fs, k, C.ink); revealText(ctx, "Kadıköy'e sığar mı?", SAFE.x0, 480 + fs * 1.02, fs, k, C.ink);
    setFont(ctx, F.mono(34)); revealText(ctx, '86 MİLYON KİŞİ · 25 km²', SAFE.x0, 686, 34, k, C.graphite);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const p0 = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < L.l03.t0 - 0.06) { const n = Math.round(Fx.population * ease.state(seg(t, L.l02.t0, L.l02.end - L.l02.t0))); row({ label: 'TÜRKİYE NÜFUSU · TÜİK 2024', num: nf0.format(n), unit: '', right1: n >= Fx.population ? '≈ 86 MİLYON' : '', right2: '', p: p0 }); return; }
    if (t < L.l04.t0 - 0.06) { row({ label: 'KADIKÖY · İSTANBUL · ANADOLU YAKASI', num: '25,2', unit: 'km²', right1: 'TÜRKİYE: 86 MİLYON', right2: '', p: p0 }); return; }
    if (t < L.l05.t0 - 0.06) { row({ label: 'OMUZ OMUZA', num: '4', unit: 'kişi / m²', right1: 'KADIKÖY: 25,2 km²', right2: '', p: p0 }); return; }
    if (t < T.hero) { const arr = DOTS.reduce((a, d) => a + ease.state(clamp01((t - d.s0) / d.dur)), 0) / DOTS.length; row({ label: "KADIKÖY'E VARAN", num: nf0.format(Math.round(Fx.population * arr)), unit: '', right1: '4 kişi / m²', right2: '', p: p0 }); return; }
    if (t < T.free) { const v = ease.state(seg(t, T.hero, T.fit + 0.3 - T.hero)); row({ label: '86 MİLYON KİŞİ', num: nf1.format(Fx.needKm2 * v), unit: 'km²', red: true, right1: 'KADIKÖY: 25,2 km²', right2: 'SIĞIYOR' }); return; }
    if (t < T.world - 0.06) { row({ label: 'KALAN BOŞ ALAN', num: '3,8', unit: 'km²', right1: 'KADIKÖY: 25,2 km²', right2: '≈ 4 km² BOŞ' }); return; }
    row({ label: t >= T.half ? 'BÜTÜN İNSANLIK · YAKLAŞIK' : 'BÜTÜN İNSANLIK', num: t >= T.half ? '2.075' : '8,3', unit: t >= T.half ? 'km²' : 'milyar kişi', right1: 'İSTANBUL: 5.461 km²', right2: t >= T.half ? 'YARISINDAN AZ' : '', p: ease.enter(seg(t, T.world - 0.06, 0.35)) });
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    // Sıfır'ın çevresinde elips kâğıt zemin: kıyı ve sınır çizgileri başından ve gövdesinden geçmez
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1920); ctx.ellipse(SIFIR.x, SIFIR.y - 52, 64, 82, 0, 0, Math.PI * 2); ctx.clip('evenodd');
    G.draw();
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // nüfus noktaları: kare 0'da grafit; l02'de batıdan doğuya mürekkebe döner; l05'te Kadıköy'e akar; plan gelene kadar her yakınlıkta
    const wave = t >= T.loop0 ? 0 : ease.state(seg(t, L.l02.t0, L.l02.end - L.l02.t0 + 0.4));
    for (const d of DOTS) {
      let p = d.p;
      if (t >= T.flow0 && t < T.loop0) { const u = clamp01((t - d.s0) / d.dur); if (u >= 1) continue; p = d.f(ease.state(u)); }
      if (!G.visible(p)) continue;
      const q = G.proj(p); if (q[0] < -10 || q[0] > W + 10 || q[1] < STAGE_TOP - 10 || q[1] > 1930) continue;
      ctx.fillStyle = d.lit <= wave * 1.05 && t < T.loop0 ? C.ink : C.graphite; ctx.fillRect(q[0] - 2, q[1] - 2, 4, 4);
    }
    if (k.r < 20000) {
      if (t >= T.flow0 && t < T.hero) for (const nm of FLOW_LABELS) { const c = CITIES.find(x => x[0] === nm); G.placeLabel([c[1], c[2]], nm, seg(t, T.flow0 + 0.6 + FLOW_LABELS.indexOf(nm) * 0.12, 0.3), 14, -14); }
      G.ringAt(KADC, t < T.dive ? 1 : seg(t, T.flow0 + 0.6, 0.6), 22);
      if (t < T.dive || t >= T.loop0 + 0.3) G.placeLabel(KADC, 'KADIKÖY', t >= T.loop0 ? seg(t, T.loop0 + 0.3, 0.35) : 1, 26, -22, C.ink, 'left', false);
    }
    province(t);
    // plan, kameranın yakınlığıyla belirir (dalışta iki kıyı üst üste görünmez; çıkışta aynı yolla söner)
    const az = clamp01((Math.log(k.r) - Math.log(60000)) / (Math.log(260000) - Math.log(60000)));
    planOverlay(t, az, t >= T.hero - 1.3 && t < T.loop0);
    ctx.restore();
    ctx.restore();
    // büyüteç: 1 m²'de 4 kişi (l04 boyunca; akıştan önce tam kapanır)
    const rk = t < L.l04.t0 - 0.1 ? 0 : t < T.flow0 - 0.6 ? ease.enter(seg(t, L.l04.t0 - 0.1, 0.4)) : 1 - ease.exit(seg(t, T.flow0 - 0.6, 0.3));
    roundel(t, rk);
    // takip çağrısı (son satırdan sonra; döngüden önce söner)
    if (t >= T.follow && t < T.loop0) chip('TAKİP ET · HER GÜN YENİ BİR SAYI', SAFE.x0, 1392, ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.25, 0.25)), C.ink, 'left', 32);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

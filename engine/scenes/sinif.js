// "Sınıf" şablonu (050, 1 Kasım: Harf Devrimi): 1927'de 100 kişiden kaçı okuma yazma biliyordu?
// Dil: arkadan, yüksekten bakılan gravür sınıf; 100 sıra = 100 kişi. Oda loş (taralı zemin); okuyabilen kişinin
// lambası yanar, kitabı açılır, sırasının çevresi aydınlanır. Öğretmen Sıfır kara tahtada.
// Kare 0: soru başlık; tahtada "28 EKİM 1927" (ilk sayımın günü), bütün lambalar sönük.
// l02: Sıfır tahtaya tebeşirle Türkiye'yi çizer; sayaç 13,6 milyon "on" kelimesinde.
// l03: 11 lamba yanar (100'de 11). l04: bütün sıralar kız öğrenci olur (örgüler); 6 lamba söner → 100'de 5.
// l05: tahta silinir, "A B C Ç D E F G" yazılır (1 Kasım 1928); kamera log uzayında geri çekilir: sınıf, Türkiye
//      haritasını dolduran yüzlerce sınıftan biri olur (Millet Mektepleri). Sessizlikte geri dalış.
// l06 (doruk): lambalar ön sıradan arkaya dalga hâlinde yanar; sayaç 5 → 98, "doksan"da kırmızı; duvarda bayrak.
//      Yanmayan 2 lamba sönük kalır (ikisi de kız: kadınlarda oran biraz düşük).
// l07: kamera bir sıradaki açık kitaba iner; kitap sayfaya dönüşür: "Bu yazıyı okuyabiliyorsan…". Takip çağrısı.
// Döngü: sayfa kitaba döner, kamera kare 0'a çekilir, lambalar arkadan öne söner, tahta yeniden "28 EKİM 1927".
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose, walkPose } from '../sifir.js';
import { STUDENT_CARD, drawStudent, drawDesk, drawBook, drawLamp, drawBoard, drawFlag, drawClassTile, CHALK_COLOR } from '../sinif_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ANCHOR = { x: 540, y: 1130 };            // kamera çapası (ekran); kimlik: f = çapa, z = 1
const ROOM = { x0: -20, x1: 1100, y0: 705, y1: 1925 }, TILE = { w: 1160, h: 1300 }, HOME = { x: 540, y: 1315 };
const BOARD = { x: 264, y: 728, w: 566, h: 132 };
const FLOOR_Y = 884, FEET_Y = 902, SIF_H = 100;
const POSTER = { x: 126, y: 742, w: 124, h: 112 };
const SIF_X = 892;   // dinlenme yeri: tahtanın sağ kenarının dışında (yakın planda yazıyı örtmez)
// kamera çerçeveleri: sınıf (kare 0) ve tahta yakın planı
const CL = [1.08, 540, 1115], CU = [1.2, 597, 1019];
const LIGHT = '#FAF6EC', DIM = '#DDD4C0';
// sıralar: 10 × 10; öndeki sıra (tahtaya yakın) küçük, arkadaki büyük (yalancı perspektif)
const ROWS = 10, COLS = 10;
const rowS = r => 0.74 + 0.26 * r / (ROWS - 1);
const SEATS = (() => {
  const out = []; let y = 936;
  for (let r = 0; r < ROWS; r++) {
    const s = rowS(r), h = 52 * s, pitch = 86 * s; y += h / 2;
    for (let c = 0; c < COLS; c++) out.push({ i: r * COLS + c, r, c, x: 540 + (c - 4.5) * pitch, y, u: pitch });
    y += h / 2;
  }
  return out;
})();

export function sinifTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    l02: L.l02.t0, l03: L.l03.t0, l04: L.l04.t0, l05: L.l05.t0, l06: L.l06.t0, l07: L.l07.t0,
    census: Wd('l02', 'on'), turkiye: Wd('l02', 'türkiye'), mapEnd: Wd('l02', 'on'),
    lit0: Wd('l03', 'kişiden'), on: Wd('l03', 'on'),
    kadin: Wd('l04', 'kadınlarda'), bes: Wd('l04', 'beş'),
    yeni: Wd('l05', 'yeni'), geldi: Wd('l05', 'geldi'), butun: Wd('l05', 'bütün'), sinifa: Wd('l05', 'sınıfa'),
    doksan: Wd('l06', 'doksan'), pageNum: Wd('l07', 'doksan'), ask: Wd('l01', 'yüz'), kaci: Wd('l01', 'kaçı'), loop0: tl.loop0,
  };
  T.erase0 = L.l05.t0 - 0.05; T.write0 = T.yeni - 0.1; T.write1 = T.geldi + 0.35;
  T.pull0 = T.butun - 0.15; T.pull1 = T.pull0 + 1.3; T.back0 = T.pull1 + 0.4; T.ret1 = T.back0 + 0.75; T.hero = L.l06.t0 - 0.04; T.sil0 = T.hero - 0.72;
  T.relight = L.l05.t0;
  // satırın konuşma başlangıcı (mp3 başındaki sessizlik ölçülüp ilk kelimeye yazıldı)
  T.s = id => L[id].words[0].t0;
  T.inkHero = T.doksan + 2.2; T.page0 = L.l07.t0 - 0.15; T.follow = L.l07.end + 0.35;
  return T;
}

export async function makeSinifRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = sinifTimes(tl);
  const cyc = (t, per) => { const n = Math.max(1, Math.round(D / per)); return ((t / D) * n) % 1; };   // dikişte aynı fazda biter

  // ——— harita: Türkiye ve komşular, Merkator; Ankara = bizim sınıfın merkezi; 1° boylam ≈ 1832 dünya px ———
  const countries = await (await fetch('../node_modules/world-atlas/countries-50m.json')).json();
  const geoms = countries.objects.countries.geometries, ctry = id => feature(countries, geoms.find(g => g.id === id));
  const TR = ctry('792'), NEIGH = ['300', '100', '268', '051', '031', '364', '368', '760', '196', '422', '804', '642', '643'].map(id => geoms.find(g => g.id === id) && ctry(id)).filter(Boolean);
  const proj0 = geoMercator().scale(104960).translate([0, 0]), ank = proj0([32.854, 39.92]);
  const proj = geoMercator().scale(104960).translate([HOME.x - ank[0], HOME.y - ank[1]]);
  const trPath = new Path2D(geoPath(proj)(TR)), neighPaths = NEIGH.map(f => new Path2D(geoPath(proj)(f)));
  const trCenter = proj([35.25, 38.95]);
  const ZMAP = 0.0236;
  // döşemeler: merkezi Türkiye içinde kalan sınıflar; bizimki (0,0)
  const probe = new OffscreenCanvas(4, 4).getContext('2d');
  const TILES = [];
  for (let j = -9; j <= 9; j++) for (let i = -20; i <= 22; i++) {
    if (!i && !j) continue;
    const x = HOME.x + i * TILE.w, y = HOME.y + j * TILE.h;
    if (probe.isPointInPath(trPath, x, y)) TILES.push({ x, y, d: Math.hypot(i, j * 0.74), seed: (i + 40) * 97 + j + 20 });
  }
  const dMax = Math.max(...TILES.map(t => t.d));
  // tahtadaki tebeşir Türkiye: aynı izdüşüm tahtaya sığdırılır
  const boardProj = geoMercator().fitExtent([[BOARD.x + 272, BOARD.y + 18], [BOARD.x + BOARD.w - 34, BOARD.y + BOARD.h - 18]], TR);
  const chalkTR = (() => { const pts = []; const g = TR.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    const rings = polys.map(p => p[0]).sort((a, b) => b.length - a.length);
    for (const ring of rings.slice(0, 2)) { const pr = ring.map(c => boardProj(c)); pts.push(pr); } return pts; })();
  const chalkLen = chalkTR.map(r => { let s = 0; for (let k = 1; k < r.length; k++) s += Math.hypot(r[k][0] - r[k - 1][0], r[k][1] - r[k - 1][1]); return s; });

  // ——— kim okuyabiliyor: tohumlu seçimler ———
  const rnd = mulberry32(50);
  const shuffled = SEATS.map(s => ({ s, k: rnd() })).sort((a, b) => a.k - b.k).map(o => o.s.i);
  const S11 = shuffled.slice(0, 11), S5 = S11.slice(0, 5), OFF6 = S11.slice(5);
  const rest = shuffled.slice(11);
  const U2 = [rest.find(i => SEATS[i].r === 3 && SEATS[i].c >= 6) ?? rest[0], rest.find(i => SEATS[i].r === 7 && SEATS[i].c <= 3) ?? rest[1]];
  const G50 = new Set([...S5, ...U2]); for (const i of rest) { if (G50.size >= 50) break; if (!U2.includes(i)) G50.add(i); }
  const HERO_SEAT = SEATS.find(s => s.r === 8 && s.c === 6 && !U2.includes(s.i)) || SEATS[86];
  // yanma zamanları
  const onA = {}; S11.forEach((i, k) => { onA[i] = lerp(T.lit0, T.on - 0.06, k / 10); });
  const offB = {}; OFF6.forEach((i, k) => { offB[i] = lerp(T.kadin + 0.15, T.bes - 0.06, k / 5); });
  const reB = {}; OFF6.forEach((i, k) => { reB[i] = T.relight + k * 0.06; });
  const onD = {}; { const ord = SEATS.filter(s => !S11.includes(s.i) && !U2.includes(s.i)).sort((a, b) => a.r - b.r || ((a.r % 2 ? -1 : 1) * (a.c - b.c)));
    ord.forEach((s, k) => { onD[s.i] = lerp(T.hero + 0.05, T.doksan - 0.05, k / (ord.length - 1)); }); }
  const offLoop = i => lerp(T.loop0 + 0.25, D - 0.35, (ROWS - 1 - SEATS[i].r) / (ROWS - 1) * 0.9 + SEATS[i].c * 0.01);
  function litAt(i, t) {
    if (t >= T.loop0 + 0.25) { const a = offLoop(i); return (S11.includes(i) || onD[i] != null) ? 1 - ease.state(seg(t, a, 0.18)) : 0; }
    if (t >= T.hero && onD[i] != null) return ease.enter(seg(t, onD[i], 0.22));
    if (S5.includes(i)) return t >= onA[i] ? ease.enter(seg(t, onA[i], 0.22)) : 0;
    if (OFF6.includes(i)) return t < onA[i] ? 0 : t < offB[i] ? ease.enter(seg(t, onA[i], 0.22)) : t < reB[i] ? 1 - ease.state(seg(t, offB[i], 0.2)) : ease.state(seg(t, reB[i], 0.1));
    return 0;
  }
  const glowR = mulberry32(77), glowPh = SEATS.map(() => glowR() * 40);
  const preGlow = (i, t) => (t < T.ret1 || t >= T.hero + 0.3 || onD[i] == null || litAt(i, t) > 0.05) ? 0 : 0.5 * Math.pow(Math.max(0, Math.sin(glowPh[i] + t * 13.7) * Math.sin(glowPh[i] * 0.7 + t * 5.3)), 3) * seg(t, T.ret1, 0.3);
  const litCount = t => SEATS.reduce((n, s) => n + (litAt(s.i, t) > 0.5 ? 1 : 0), 0);
  function girlAt(i, t) {
    const s = SEATS[i];
    if (t < T.l04 - 0.1) return 0;
    if (t < T.l05) return ease.enter(seg(t, T.l04 - 0.1 + s.r * 0.04, 0.3));
    if (t < T.loop0 + 0.25) return G50.has(i) ? 1 : 1 - ease.state(seg(t, T.l05 + 0.1 + s.r * 0.04, 0.3));
    return G50.has(i) ? 1 - ease.state(seg(t, offLoop(i), 0.2)) : 0;
  }

  // ——— kamera: [t, z, fx, fy, eğri]; zoom log uzayında ———
  const pageCam = { z: 4.2, x: HERO_SEAT.x - 0.08 * HERO_SEAT.u, y: HERO_SEAT.y - 0.2 * HERO_SEAT.u };
  const LAMP0 = SEATS.find(s => s.r === 0 && s.c === 5 && !S11.includes(s.i)) || SEATS.find(s => s.r === 0 && !S11.includes(s.i));
  const C0 = [CL[0] * 1.15, (CL[1] + LAMP0.x + 0.27 * LAMP0.u) / 2, (CL[2] + LAMP0.y - 0.2 * LAMP0.u) / 2];
  const KEYS = [
    [0, ...C0],
    [0.6, ...CL, 'state'],
    [T.l02 - 0.1, CL[0] * 1.02, CL[1], CL[2] - 5, 'lin'],
    [T.l02 + 0.6, ...CU, 'state'],
    [T.l03 - 0.35, CU[0] * 1.03, CU[1], CU[2] - 3, 'lin'],
    [T.l03 + 0.35, ...CL, 'state'],
    [T.erase0 - 0.05, CL[0] * 1.05, CL[1], CL[2] - 8, 'lin'],
    [T.erase0 + 0.6, ...CU, 'state'],
    [T.pull0, CU[0] * 1.03, CU[1], CU[2] - 3, 'lin'],
    [T.pull1, ZMAP, trCenter[0], trCenter[1], 'state'],
    [T.back0, ZMAP * 1.05, trCenter[0], trCenter[1], 'lin'],
    [T.ret1, ...CL, 'state'],
    [T.doksan, CL[0] * 1.03, CL[1], CL[2] - 5, 'lin'],
    [T.doksan + 0.6, CL[0] * 1.08, CL[1], CL[2] - 10, 'state'],
    [T.page0, CL[0] * 1.1, CL[1], CL[2] - 12, 'lin'],
    [T.page0 + 0.8, pageCam.z, pageCam.x, pageCam.y, 'state'],
    [T.loop0, pageCam.z * 1.07, pageCam.x, pageCam.y, 'lin'],   // sayfa sabit; arkadaki sınıf yavaşça yaklaşır
    [D - 0.7, ...CL, 'state'],
    [D - 0.1, ...C0, 'state'],   // son kareler kare 0 çerçevesinde durur (dikiş)
    [D + 1, ...C0, 'lin'],
  ];
  function camAt(t) {
    let k = 0; while (k < KEYS.length - 2 && t >= KEYS[k + 1][0]) k++;
    const a = KEYS[k], b = KEYS[k + 1], u0 = clamp01((t - a[0]) / Math.max(1e-6, b[0] - a[0])), u = b[4] === 'lin' ? u0 : ease.state(u0);
    const za = Math.log(a[1]), zb = Math.log(b[1]), z = Math.exp(lerp(za, zb, u));
    // büyük zoomlarda odak, ekran uzayında doğrusal kayar (log zoom ile birlikte sapmasız)
    const w = Math.abs(zb - za) > 0.5 ? (z - b[1]) / (a[1] - b[1]) : 1 - u;
    return { z, x: b[2] + (a[2] - b[2]) * w, y: b[3] + (a[3] - b[3]) * w };
  }

  // ——— Sıfır (öğretmen): [t, x, yön, poz, ifade]; yürürken adım fazı konumdan ———
  const SK = [
    [0, SIF_X, -1, 'ayakta', 'notr'],
    [T.ask - 0.6, SIF_X, -1, 'ayakta', 'notr'],
    [T.kaci, 730, -1, 'isaret', 'sayiyor'],
    [T.l02 - 0.2, 730, -1, 'isaret', 'sayiyor'],
    [T.l02 + 0.45, SIF_X, -1, 'ayakta', 'sayiyor'],
    [T.l02 + 0.8, SIF_X, -1, 'isaret', 'sayiyor'],
    [T.l03 - 0.25, SIF_X, -1, 'isaret', 'sayiyor'],
    [T.l03 + 0.25, SIF_X, -1, 'ayakta', 'dusunceli'],
    [T.erase0, SIF_X, -1, 'ayakta', 'dusunceli'],
    [T.write0, SIF_X, -1, 'isaret', 'notr'],
    [T.write1, SIF_X, -1, 'isaret', 'mutlu'],
    [T.back0, SIF_X, -1, 'ayakta', 'mutlu'],
    [T.ret1, SIF_X, -1, 'ayakta', 'notr'],
    [T.doksan - 0.02, SIF_X, -1, 'ayakta', 'saskin'],
    [T.doksan + 0.3, SIF_X, -1, 'sasirma', 'mutlu'],
    [T.doksan + 1.6, SIF_X, -1, 'ayakta', 'mutlu'],
    [T.loop0 + 0.4, SIF_X, -1, 'ayakta', 'notr'],
    [D + 1, SIF_X, -1, 'ayakta', 'notr'],
  ];
  const sifX = t => { let k = 0; while (k < SK.length - 2 && t >= SK[k + 1][0]) k++; const a = SK[k], b = SK[k + 1]; return lerp(a[1], b[1], ease.state(clamp01((t - a[0]) / Math.max(1e-6, b[0] - a[0])))); };
  const blinkR = mulberry32(51); const blinks = []; for (let b = 1.3; b < D - 1; b += 2.4 + blinkR() * 2.8) blinks.push(b);
  function sifir(t) {
    let k = 0; while (k < SK.length - 2 && t >= SK[k + 1][0]) k++;
    const a = SK[k], b = SK[k + 1], x = sifX(t), v = (sifX(t + 0.04) - sifX(t - 0.04)) / 0.08;
    const moving = clamp01(Math.abs(v) / 120), u = ease.state(clamp01((t - a[0]) / Math.max(1e-6, Math.min(0.3, b[0] - a[0]))));
    // poz: hedef poza geçiş, yürürken yürüme döngüsü (adım fazı = konum / adım boyu)
    const target = mixPose(POSES[a[3]], POSES[b[3]], ease.state(clamp01((t - a[0]) / Math.max(1e-6, b[0] - a[0]))));
    const pose = mixPose(target, walkPose(x / 44), moving);
    const facing = Math.abs(v) > 30 ? Math.sign(v) : (clamp01((t - a[0]) / Math.max(1e-6, b[0] - a[0])) > 0.5 ? b[2] : a[2]);
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? a[4] : b[4]] };
    if (blinks.some(bb => t >= bb && t < bb + 0.12)) expr.eye = 'closed';
    ctx.save(); ctx.translate(x, FEET_Y); drawSifir(ctx, SIFIR_CARD, pose, expr, SIF_H, { facing }); ctx.restore();
  }

  // ——— tahta yazıları ———
  function chalkText(s, x, y, size, k, align = 'left') {
    if (k <= 0) return;
    setFont(ctx, F.name(size)); ctx.textAlign = align; const w = ctx.measureText(s).width, x0 = align === 'center' ? x - w / 2 : x;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 4, y - size, (w + 8) * k, size * 1.4); ctx.clip();
    ctx.fillStyle = CHALK_COLOR; ctx.globalAlpha *= 0.92; ctx.fillText(s, x, y); ctx.restore();
  }
  function wipeClip(t, a, dur) { const u = ease.state(seg(t, a, dur)); return BOARD.x + BOARD.w * u; }
  function boardContent(t) {
    ctx.save(); ctx.beginPath(); ctx.rect(BOARD.x, BOARD.y, BOARD.w, BOARD.h); ctx.clip();
    // 1) tarih + harita (kare 0 → l05 silme); döngüde tarih yeniden yazılır
    const loopWrite = t >= T.loop0 + 0.55;
    const phase1 = t < T.erase0 + 0.45 || loopWrite;
    if (phase1) {
      ctx.save();
      if (!loopWrite && t >= T.erase0) { const ex = wipeClip(t, T.erase0, 0.45); ctx.beginPath(); ctx.rect(ex, BOARD.y, BOARD.x + BOARD.w - ex, BOARD.h); ctx.clip(); }
      const dk = loopWrite ? seg(t, T.loop0 + 0.55, 0.28) : 1;
      chalkText('28 EKİM', BOARD.x + 26, BOARD.y + 56, 40, dk); chalkText('1927', BOARD.x + 26, BOARD.y + 104, 40, loopWrite ? seg(t, T.loop0 + 0.78, 0.22) : 1);
      if (!loopWrite && t >= T.l02 + 0.15) {
        const k = ease.state(seg(t, T.l02 + 0.15, T.turkiye + 0.3 - T.l02 - 0.15));
        ctx.strokeStyle = CHALK_COLOR; ctx.globalAlpha = 0.9; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        chalkTR.forEach((r, ri) => { const total = chalkLen[ri]; ctx.setLineDash([total * k, total + 10]); ctx.beginPath(); r.forEach((p, q) => (q ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); });
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
    // 2) yeni harfler (l05 → döngü silmesi)
    if (t >= T.write0 && t < T.loop0 + 0.55) {
      ctx.save();
      if (t >= T.loop0 + 0.1) { const ex = wipeClip(t, T.loop0 + 0.1, 0.45); ctx.beginPath(); ctx.rect(ex, BOARD.y, BOARD.x + BOARD.w - ex, BOARD.h); ctx.clip(); }
      const k = seg(t, T.write0, T.write1 - T.write0);
      chalkText('A  B  C  Ç  D  E  F  G', BOARD.x + 262, BOARD.y + 72, 56, k, 'center');
      chalkText('1 KASIM 1928 · YENİ HARFLER', BOARD.x + 262, BOARD.y + 116, 28, seg(t, T.yeni, 0.5), 'center');
      ctx.restore();
    }
    // silgi: silme sırasında sağa kayan silgi
    for (const a of [T.erase0, T.loop0 + 0.1]) if (t >= a && t < a + 0.5) { const ex = wipeClip(t, a, 0.45); ctx.fillStyle = C.paper; ctx.fillRect(ex - 34, BOARD.y + 30, 34, 70); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(ex - 34, BOARD.y + 30, 34, 70); ctx.fillStyle = C.graphite; ctx.fillRect(ex - 34, BOARD.y + 30, 34, 18); }
    ctx.restore();
  }

  // ——— oda ———
  const floorPoly = [[540 - 360, FLOOR_Y], [540 + 360, FLOOR_Y], [1100, ROOM.y1], [-20, ROOM.y1]];
  function room(t, z) {
    // duvar
    ctx.fillStyle = C.paper; ctx.fillRect(ROOM.x0, ROOM.y0, ROOM.x1 - ROOM.x0, ROOM.y1 - ROOM.y0);
    ctx.strokeStyle = 'rgba(28,27,24,0.12)'; ctx.lineWidth = 1 / Math.max(z, 0.2); ctx.beginPath();
    for (let x = ROOM.x0 + 10; x < ROOM.x1; x += 22) { ctx.moveTo(x, ROOM.y0); ctx.lineTo(x, FLOOR_Y); }
    ctx.stroke();
    // zemin: loş (koyu kâğıt + sık tarama)
    ctx.save(); ctx.beginPath(); floorPoly.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = DIM; ctx.fill(); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.34)'; ctx.lineWidth = 1.1; ctx.beginPath();
    for (let x = -600; x < 1700; x += 10) { ctx.moveTo(x, FLOOR_Y); ctx.lineTo(x - 640, ROOM.y1); }
    ctx.stroke();
    // ışık havuzları (yanan lambalar): taramanın üstünde açık kâğıt
    for (const s of SEATS) { const l = litAt(s.i, t); if (l <= 0.01) continue; ctx.save(); ctx.globalAlpha = l; ctx.beginPath(); ctx.ellipse(s.x + 0.1 * s.u, s.y - 0.14 * s.u, 0.56 * s.u * (0.7 + 0.3 * l), 0.42 * s.u * (0.7 + 0.3 * l), 0, 0, Math.PI * 2); ctx.fillStyle = LIGHT; ctx.fill(); ctx.restore(); }
    ctx.restore();
    ctx.beginPath(); floorPoly.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // tahta
    ctx.save(); ctx.translate(BOARD.x, BOARD.y); drawBoard(ctx, BOARD.w, BOARD.h); ctx.restore();
    boardContent(t);
    poster(t);
    // tebeşir tozu (sürekli döngü): tahta önünde yavaşça yükselen zerreler
    const r2 = mulberry32(13);
    for (let i = 0; i < 26; i++) { const ph = r2(), x0 = BOARD.x + r2() * BOARD.w, sp = 0.6 + r2() * 0.5; const u = (ph + cyc(t, 6.4 / sp)) % 1;
      const x = x0 + 16 * Math.sin(u * 6.28 * 1.3 + i), y = FLOOR_Y + 20 - u * 190; ctx.globalAlpha = Math.sin(u * Math.PI) * 0.55; ctx.fillStyle = C.graphite; ctx.fillRect(x, y, 2.4, 2.4); }
    ctx.globalAlpha = 1;
  }
  // loş oda: yanan lambaların ışık havuzu dışındaki her yer gölgede (sıralar ve öğrenciler dahil)
  function shade(t) {
    ctx.save(); ctx.beginPath(); floorPoly.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.clip();
    ctx.beginPath(); ctx.rect(ROOM.x0, FLOOR_Y, ROOM.x1 - ROOM.x0, ROOM.y1 - FLOOR_Y);
    for (const s of SEATS) { const l = litAt(s.i, t); if (l <= 0.01) continue; const e = Math.sqrt(l), cx = s.x + 0.1 * s.u, cy = s.y - 0.12 * s.u; ctx.moveTo(cx + 0.6 * s.u * e, cy); ctx.ellipse(cx, cy, 0.6 * s.u * e, 0.47 * s.u * e, 0, 0, Math.PI * 2); }
    ctx.clip('evenodd');
    ctx.fillStyle = 'rgba(28,27,24,0.2)'; ctx.fillRect(ROOM.x0, FLOOR_Y, ROOM.x1 - ROOM.x0, ROOM.y1 - FLOOR_Y);
    ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 1.3; ctx.beginPath();
    for (let x = -1800; x < 1800; x += 8) { ctx.moveTo(x, FLOOR_Y); ctx.lineTo(x + 1040, ROOM.y1); }
    ctx.stroke(); ctx.restore();
  }
  function seats(t) {
    for (const s of SEATS) {
      const l = litAt(s.i, t), u = s.u;
      ctx.save(); ctx.translate(s.x, s.y);
      ctx.save(); ctx.translate(0, -0.2 * u); drawDesk(ctx, 0.8 * u, 0.24 * u); ctx.restore();
      ctx.save(); ctx.translate(-0.08 * u, -0.2 * u); drawBook(ctx, 0.3 * u, l); ctx.restore();
      ctx.save(); ctx.translate(0, 0.08 * u); drawStudent(ctx, STUDENT_CARD, { girl: girlAt(s.i, t), read: l }, u); ctx.restore();
      ctx.restore();
    }
  }

  function lamps(t) {
    for (const s of SEATS) { const u = s.u, l = Math.max(litAt(s.i, t), preGlow(s.i, t)); ctx.save(); ctx.translate(s.x + 0.27 * u, s.y - 0.2 * u); drawLamp(ctx, 0.08 * u, l, t * 3 + s.i * 1.7); ctx.restore(); }
  }

  // ——— harita (geri çekilme) ———
  function mapLayer(t, z) {
    const k = clamp01((0.7 - z) / 0.25); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k;
    // deniz: ekran ölçeğinde yatay ince çizgiler
    const inv = 1 / z;
    ctx.fillStyle = C.paper; ctx.fillRect(-1e6, -1e6, 2e6, 2e6);
    ctx.strokeStyle = 'rgba(28,27,24,0.16)'; ctx.lineWidth = inv; ctx.beginPath();
    const cam = camAt(t), vy0 = cam.y + (STAGE_TOP - ANCHOR.y) * inv, vy1 = cam.y + (1920 - ANCHOR.y) * inv, vx0 = cam.x - 600 * inv, vx1 = cam.x + 600 * inv;
    for (let y = Math.floor(vy0 / (7 * inv)) * 7 * inv; y < vy1; y += 7 * inv) { ctx.moveTo(vx0, y); ctx.lineTo(vx1, y); }
    ctx.stroke();
    for (const p of neighPaths) { ctx.fillStyle = C.paper; ctx.fill(p); ctx.lineWidth = 1.2 * inv; ctx.strokeStyle = C.graphite; ctx.stroke(p); }
    ctx.fillStyle = LIGHT; ctx.fill(trPath);
    ctx.save(); ctx.clip(trPath);
    for (const tile of TILES) {
      const a = T.pull0 + 0.25 + (tile.d / dMax) * (T.pull1 - T.pull0 - 0.35);
      const g = t >= T.back0 ? 1 : ease.enter(seg(t, a, 0.3)); if (g <= 0) continue;
      ctx.save(); ctx.translate(tile.x, tile.y); ctx.scale(g, g); drawClassTile(ctx, TILE.w * 0.86, TILE.h * 0.86, 0.06, tile.seed, 1.1 * inv); ctx.restore();
    }
    ctx.restore();
    ctx.lineWidth = 2.6 * inv; ctx.strokeStyle = C.ink; ctx.stroke(trPath);
    ctx.restore();
  }

  // ——— sayfa (l07): kitap, sahneyi dolduran sayfaya dönüşür ———
  const PAGE = { x0: 96, y0: 772, x1: 984, y1: 1392 };
  function page(t) {
    const tin = T.page0 + 0.35;
    if (t < tin) return;
    const kin = ease.enter(seg(t, tin, 0.55)), kout = t >= T.loop0 ? ease.state(seg(t, T.loop0, 0.5)) : 0;
    const k = kin * (1 - kout); if (k <= 0) return;
    // kitabın ekrandaki yeri (kamera ile)
    const cam = camAt(t), bx = ANCHOR.x + (HERO_SEAT.x - 0.08 * HERO_SEAT.u - cam.x) * cam.z, by = ANCHOR.y + (HERO_SEAT.y - 0.2 * HERO_SEAT.u - cam.y) * cam.z;
    const bw = 0.3 * HERO_SEAT.u * cam.z, bh = bw * 0.62;
    const x0 = lerp(bx - bw / 2, PAGE.x0, k), x1 = lerp(bx + bw / 2, PAGE.x1, k), y0 = lerp(by - bh / 2, PAGE.y0, k), y1 = lerp(by + bh / 2, PAGE.y1, k);
    // sayfa açıkken sınıf kâğıt örtüyle geri çekilir (göz sayfada kalır)
    ctx.fillStyle = `rgba(236,229,213,${(0.68 * k).toFixed(3)})`; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    // tebeşir tozu (sürekli döngü, ekran ölçeği): sayfanın arkasında yavaşça yükselir
    { const r3 = mulberry32(31); for (let i = 0; i < 60; i++) { const ph = r3(), xx = 30 + r3() * 1020, sp = 0.7 + r3() * 0.6, sz = 3 + r3() * 3, u = (ph + cyc(t, 4.4 / sp)) % 1; ctx.globalAlpha = k * Math.sin(u * Math.PI) * 0.85; ctx.fillStyle = C.graphite; ctx.fillRect(xx + 18 * Math.sin(u * 8 + i), 1600 - u * 900, sz, sz); } ctx.globalAlpha = 1; }
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.fillStyle = LIGHT; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip();
    const sx = (x1 - x0) / (PAGE.x1 - PAGE.x0), sy = (y1 - y0) / (PAGE.y1 - PAGE.y0);
    ctx.translate(x0, y0); ctx.scale(sx, sy);
    // çizgili defter: yatay grafit çizgiler, solda çift kenar çizgisi
    ctx.strokeStyle = 'rgba(139,133,119,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let y = 120; y < PAGE.y1 - PAGE.y0; y += 96) { ctx.moveTo(0, y); ctx.lineTo(PAGE.x1 - PAGE.x0, y); }
    ctx.moveTo(78, 0); ctx.lineTo(78, PAGE.y1 - PAGE.y0); ctx.moveTo(86, 0); ctx.lineTo(86, PAGE.y1 - PAGE.y0); ctx.stroke();
    // metin: satırlara oturur
    const tk = clamp01((k - 0.6) / 0.4) * ease.enter(seg(t, L.l07.t0, 0.35));
    if (tk > 0) {
      const lines = ['Bu yazıyı', 'okuyabiliyorsan,', 'sen de o 98', 'kişiden birisin.'];
      setFont(ctx, F.head(78)); lines.forEach((s, i) => revealText(ctx, s, 116, 120 + 96 * (i + 1) - 16, 78, tk, C.ink));
      const uk = ease.state(seg(t, T.pageNum - 0.04, 0.45));
      if (uk > 0 && t < T.loop0 + 0.1) {
        const x0 = 116 + ctx.measureText('sen de o ').width, w = ctx.measureText('98').width, y = 120 + 96 * 3 + 6, px = u => x0 - 8 + (w + 16) * u, py = u => y + 3 * Math.sin(u * 7);
        ctx.beginPath(); for (let q = 0; q <= 20; q++) { const u = q / 20 * uk; q ? ctx.lineTo(px(u), py(u)) : ctx.moveTo(px(u), py(u)); } ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.stroke();
      }
      // kalem: çizginin ucunda gelir, çizgi bitince sağa yukarı çekilir
      { const x0 = 116 + ctx.measureText('sen de o ').width, w = ctx.measureText('98').width, y = 120 + 96 * 3 + 6, uu = Math.max(uk, 0);
        const lift = ease.exit(seg(t, T.pageNum + 0.45, 0.35)), pin = ease.enter(seg(t, T.pageNum - 0.3, 0.26));
        if (pin > 0 && lift < 1 && t < T.loop0) { ctx.save(); ctx.globalAlpha = (1 - lift) * pin; ctx.translate(x0 - 8 + (w + 16) * uu + 110 * lift + 60 * (1 - pin), y + 3 * Math.sin(uu * 7)); ctx.rotate(-0.05); drawPencil(ctx, 230); ctx.restore(); } }
      // köşede küçük Türk bayrağı (yalnız l07)
      const fk = ease.enter(seg(t, L.l07.t0 + 0.3, 0.4)); if (fk > 0) { ctx.save(); ctx.globalAlpha = fk; ctx.translate(PAGE.x1 - PAGE.x0 - 160, 18 + 10 * (1 - fk)); drawFlag(ctx, 84, 0, 0); ctx.restore(); }
    }
    ctx.restore(); ctx.restore();
  }

  // kalem (yandan): uç kökte, gövde +x yönünde
  function drawPencil(c, len) {
    const h = len * 0.085; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(len * 0.12, -h / 2); c.lineTo(len, -h / 2); c.lineTo(len, h / 2); c.lineTo(len * 0.12, h / 2); c.closePath(); c.fillStyle = LIGHT; c.fill(); c.lineWidth = 3; c.strokeStyle = C.ink; c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(len * 0.045, -h * 0.19); c.lineTo(len * 0.045, h * 0.19); c.closePath(); c.fillStyle = C.ink; c.fill();
    c.beginPath(); c.moveTo(len * 0.12, 0); c.lineTo(len * 0.88, 0); c.moveTo(len * 0.88, -h / 2); c.lineTo(len * 0.88, h / 2); c.lineWidth = 1.5; c.stroke();
  }

  // ——— üst blok ———
  const SPLIT = { l02: [T.census, '13,6'], l03: [T.on, "11'i"], l04: [T.bes, "5'i"], l06: [T.doksan, "98'i"] };
  function narration(t) {
    if (t < T.s('l02') - 0.04 || t >= T.page0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= T.s(l.id) - 0.04) ln = L[l.id];
    if (!ln || ln.id === 'l01' || ln.id === 'l07') return;
    const out = ln.id === 'l06' ? 1 - ease.exit(seg(t, T.page0, 0.25)) : 1;
    const p = ease.enter(seg(t, T.s(ln.id) - 0.04, 0.3)) * out;
    const split = SPLIT[ln.id], idx = split ? ln.text.indexOf(split[1]) : -1, p2 = split ? ease.enter(seg(t, split[0] - 0.04, 0.3)) * out : p;
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    let off = 0;
    ls.slice(0, 3).forEach((s, i) => {
      const at = ln.text.indexOf(s, off); off = at + s.length; const y = y0 + i * lh;
      if (idx < 0 || at + s.length <= idx) return revealText(ctx, s, SAFE.x0, y, fs0, p, C.ink);
      if (at >= idx) return revealText(ctx, s, SAFE.x0, y, fs0, p2, C.ink);
      const a = s.slice(0, idx - at), b = s.slice(idx - at); revealText(ctx, a, SAFE.x0, y, fs0, p, C.ink); revealText(ctx, b, SAFE.x0 + ctx.measureText(a).width, y, fs0, p2, C.ink);
    });
  }
  const TITLE = ["1927'de 100 kişiden", 'kaçı okuma yazma', 'biliyordu?'];
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, T.s('l02') - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    let fs = 96; setFont(ctx, F.head(fs)); while (Math.max(...TITLE.map(s => ctx.measureText(s).width)) > SAFE.x1 - SAFE.x0 && fs > 60) { fs -= 2; setFont(ctx, F.head(fs)); }
    TITLE.forEach((s, i) => revealText(ctx, s, SAFE.x0, 470 + i * fs * 1.0, fs, k, C.ink));
  }
  function row({ label, num, unit, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.ink);
    if (num) { setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink); if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); } }
  }
  const fmt1 = v => v.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  function counters(t) {
    if (t < T.census - 0.04 || t >= T.loop0 + 0.3) return;
    const fade = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    if (t < L.l03.t0 - 0.06) { const v = 13.6 * ease.enter(seg(t, T.census - 0.04, 0.45)); row({ label: '1927 · NÜFUS', num: `${fmt1(v)} milyon`, unit: 'kişi', p: ease.enter(seg(t, T.census - 0.04, 0.3)) * fade }); return; }
    if (t < L.l04.t0 - 0.06) { if (t < T.lit0) return; const pn = ease.enter(seg(t, T.on - 0.04, 0.3)) * fade; row({ label: '1927 · OKUMA YAZMA BİLEN', p: ease.enter(seg(t, T.lit0, 0.3)) * fade }); if (pn > 0) row({ label: '', num: '11', unit: '/ 100 kişi', p: pn }); return; }
    if (t < T.erase0) { row({ label: 'KADINLARDA · OKUMA YAZMA BİLEN', p: ease.enter(seg(t, T.s('l04') - 0.04, 0.3)) * fade }); const pn = ease.enter(seg(t, T.bes - 0.04, 0.3)) * fade; if (pn > 0) row({ label: '', num: '5', unit: '/ 100 kadın', p: pn }); return; }
    if (t < T.hero) { if (t < T.yeni - 0.04) return; row({ label: '1 KASIM 1928', num: 'Yeni harfler', p: ease.enter(seg(t, T.yeni - 0.04, 0.3)) * (1 - ease.exit(seg(t, T.hero - 0.3, 0.25))) }); return; }
    const red = t >= T.doksan - 0.04 && t < T.inkHero;
    row({ label: 'BUGÜN · OKUMA YAZMA BİLEN', num: String(t >= T.doksan - 0.04 ? 98 : Math.min(97, litCount(t))), unit: '/ 100 kişi', red, p: ease.enter(seg(t, T.hero, 0.3)) * fade });
  }
  // sahne etiketi (kâğıt zeminli, alt kenar)
  function tag(s, x, y, k, align = 'left') {
    if (k <= 0) return; setFont(ctx, F.mono(32)); const tw = ctx.measureText(s).width, x0 = align === 'center' ? x - tw / 2 : x;
    ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - 32, tw + 20, 44); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(x0 - 10, y - 32, tw + 20, 44);
    ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }
  function poster(t) {
    const away = (a, b) => t >= a && t < b + 0.3 ? (t < b - 0.05 ? 1 - ease.exit(seg(t, a, 0.2)) : ease.enter(seg(t, b - 0.05, 0.3))) : 1;
    const k = Math.min(away(T.l02 - 0.1, T.l03 + 0.35), away(T.erase0 - 0.05, T.ret1), t < 0.75 ? ease.enter(seg(t, 0.45, 0.3)) : 1 - ease.exit(seg(t, D - 0.8, 0.2))); if (k <= 0) return;
    const sw = t >= T.l04 - 0.06 && t < T.erase0 ? ['100', 'KADIN'] : t >= T.erase0 && t < T.loop0 ? ['100', 'KİŞİ'] : ['1 SIRA', '1 KİŞİ'];
    const ch = t >= T.l04 - 0.06 && t < T.l04 + 0.25 ? ease.enter(seg(t, T.l04 - 0.06, 0.3)) : t >= T.erase0 && t < T.erase0 + 0.3 ? ease.enter(seg(t, T.erase0, 0.3)) : 1;
    ctx.save(); ctx.globalAlpha = k; const { x, y, w, h } = POSTER;
    ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(x, y, w, h);
    ctx.beginPath(); ctx.moveTo(x + 16, y + h / 2); ctx.lineTo(x + w - 16, y + h / 2); ctx.lineWidth = 1.5; ctx.stroke();
    setFont(ctx, F.mono(30)); revealText(ctx, sw[0], x + w / 2, y + 42, 30, ch, C.ink, 'center'); revealText(ctx, sw[1], x + w / 2, y + 96, 30, ch, C.ink, 'center');
    ctx.restore();
  }
  function tags(t, cam) {
    // harita etiketleri
    const mk = clamp01((0.12 - cam.z) / 0.06);
    if (mk > 0) { tag('TÜRKİYE', 540, 1352, mk * ease.enter(seg(t, T.sinifa - 0.1, 0.3)), 'center'); tag('MİLLET MEKTEPLERİ · 1929', 540, 1406, mk * ease.enter(seg(t, T.sinifa + 0.2, 0.3)), 'center'); }
  }
  function follow(t) {
    if (t < T.follow || t >= T.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 505;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 1300, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 1300, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 1345); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const cam = camAt(t);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.translate(ANCHOR.x, ANCHOR.y); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    mapLayer(t, cam.z);
    // bizim sınıf: yakında tam ayrıntı, uzakta simge
    const detail = clamp01((cam.z - 0.1) / 0.1);
    if (detail < 1) { ctx.save(); ctx.globalAlpha = 1 - detail; ctx.translate(HOME.x, HOME.y); drawClassTile(ctx, TILE.w * 0.86, TILE.h * 0.86, 0.06, 7, 1.1 / cam.z); ctx.restore(); }
    if (detail > 0) {
      ctx.save(); ctx.globalAlpha = detail; ctx.beginPath(); ctx.rect(ROOM.x0, ROOM.y0, ROOM.x1 - ROOM.x0, ROOM.y1 - ROOM.y0); ctx.clip();
      room(t, cam.z); seats(t); shade(t); lamps(t);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = `rgba(236,229,213,${(0.08 + i * 0.075).toFixed(3)})`; ctx.fillRect(ROOM.x0, 1428 + i * 14, ROOM.x1 - ROOM.x0, 14); }
      ctx.fillStyle = C.paper; ctx.fillRect(ROOM.x0, 1596, ROOM.x1 - ROOM.x0, ROOM.y1 - 1596);
      ctx.restore();
      if (cam.z < 0.9) { ctx.save(); ctx.globalAlpha = detail; ctx.lineWidth = 2.6 / cam.z; ctx.strokeStyle = C.ink; ctx.strokeRect(ROOM.x0, ROOM.y0, ROOM.x1 - ROOM.x0, ROOM.y1 - ROOM.y0); ctx.restore(); }
    }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    if (detail > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 600, W, 1320); ctx.clip(); ctx.globalAlpha = detail; ctx.translate(ANCHOR.x, ANCHOR.y); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y); sifir(t); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); page(t); ctx.restore();
    tags(t, cam);
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    follow(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

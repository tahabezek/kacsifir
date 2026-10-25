// "Yol" şablonu (053, Kaç Sıfır?): Bu videoyu izlerken uzayda ne kadar yol alacaksın?
// Omurga: kilometre sayacı kare 0'dan itibaren GERÇEK film süresiyle akar (Güneş'e göre 29,78 km/sn × t; l06'dan sonra
// galaksi merkezine göre 230 km/sn × t). İki hareket toplanmaz, ayrı sayaç ve etiketle gösterilir.
// Tek nesne (gravür küre) kamerayla taşınır: kare 0'da Türkiye'li küre → l03'te Güneş yörüngesinde nokta → l04'te Türkiye
// haritası (İstanbul'dan doğuya, büyük daire parçalarıyla gerçek ölçekli iz; Ankara 350 km) → l06'da Samanyolu'nda
// Güneş noktası → l07 (soru) dünya küresi: aynı mesafe İstanbul'dan Tokyo yönüne → sessizlik → l08 doruk (video sonunda
// 230 × D km; kuş uçuşu İstanbul–Tokyo 8.944 km, "neredeyse") kırmızı → l09 koltuktaki izleyici → döngü kare 0.
// Anlatım kartındaki sayılar yalnız söylendikleri kelimede açılır (NUMW).
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { geoInterpolate, geoDistance } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { SITTER_CARD, drawSitter, drawSun, drawGalaxy, drawArrow, SUN_IN_GALAXY } from '../uzayyol_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1262, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const GR2 = '#5E594E';
const R_KM = 6371.0088;
const V_ORB = 29.78, V_GAL = 230;           // km/sn: NASA Earth Fact Sheet; NASA StarChild (828.000 km/sa)
// Türkiye içi iz: İstanbul → Ankara → Sivas → Erzurum → Kars (her parça büyük daire, kuş uçuşu)
const ROUTE = [['İSTANBUL', 28.979, 41.015], ['ANKARA', 32.854, 39.92], ['SİVAS', 37.016, 39.748], ['ERZURUM', 41.276, 39.905], ['KARS', 43.097, 40.602]];
const IST = [28.979, 41.015], TOK = [139.69, 35.69];
const SEN = [34.6, 39.3];
const NUMW = { l03: { '30': 'otuz' }, l05: { '1.100': 'bin' }, l06: { '230': 'iki' } };
const MONO = 40;

export function yolTimeline(ep, voice) {
  const tl = buildYolTimeline(ep, voice), loop0 = tl.L.l09.end + 1.8;
  return { ...tl, loop0, askEnd: loop0, duration: loop0 + 1.2 };
}

export function yolTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    sit: Wd('l02', 'kıpırdamadan'), orbit0: L.l03.t0 - 0.15, v30: Wd('l03', 'otuz'), map0: L.l04.t0 - 0.4,
    ghost: Wd('l05', 'bin'), gal0: L.l06.t0 - 0.25, v230: Wd('l06', 'iki'), world0: L.l06.end + 0.15,
    video: Wd('l07', 'video'), hero: L.l08.t0 - 0.05, tok: Wd('l08', 'tokyo'), back: L.l09.t0 - 0.15, ink: L.l09.t0, loop0: tl.loop0,
    ankW: Wd('l04', 'ankara'), gsw: Wd('l06', 'galaksinin') - 0.04,
  };
  T.imp = T.hero - 0.05;   // impact: sessizliğin sonunda, konuşmadan önce
  T.titleOut = L.l02.t0 - 0.3; T.follow = Wd('l09', 'hiçbirini');   // takip çağrısı ≥ 2 sn tam opak
  T.ank = 350.2 / V_ORB;   // sayaç Ankara'yı geçtiği an (kuş uçuşu 350 km)
  return T;
}

export async function makeYolRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = yolTimeline(ep, voice), { L } = tl, D = tl.duration, T = yolTimes(tl);
  const kmOrb = t => V_ORB * t, kmGal = t => V_GAL * t;
  const END_ORB = kmOrb(D), END_GAL = kmGal(D);

  // ——— Türkiye izi: birikimli büyük daire uzunlukları ———
  const RSEG = [];
  { let acc = 0; for (let i = 1; i < ROUTE.length; i++) { const a = ROUTE[i - 1].slice(1), b = ROUTE[i].slice(1), d = geoDistance(a, b) * R_KM; RSEG.push({ a, b, d0: acc, d, f: geoInterpolate(a, b) }); acc += d; } }
  const CUM = [0, ...RSEG.map(s => s.d0 + s.d)];
  const routeAt = k => { for (const s of RSEG) if (k <= s.d0 + s.d) return s.f(clamp01((k - s.d0) / s.d)); const s = RSEG.at(-1); return s.f(1); };
  const routeLine = k => { const pts = [ROUTE[0].slice(1)]; for (let x = 15; x < k; x += 15) pts.push(routeAt(x)); pts.push(routeAt(k)); return pts; };
  // dünya izi: İstanbul → Tokyo büyük dairesi
  const DTOK = geoDistance(IST, TOK) * R_KM, ftok = geoInterpolate(IST, TOK);
  const tokAt = k => ftok(k / DTOK);
  const tokLine = (k0, k1) => { const pts = []; for (let x = k0; x < k1; x += 60) pts.push(tokAt(x)); pts.push(tokAt(k1)); return pts; };

  // ——— sahne geometrisi ———
  const SUN0 = { x: 280, y: 1070 }, EARTH_O = { x: 735, y: 990 };
  const ORB_R = Math.hypot(EARTH_O.x - SUN0.x, EARTH_O.y - SUN0.y);
  const GALC = { x: 540, y: 1075, R: 330 };
  const galRot = t => 0.35 + 0.06 * t;
  const sunGal = t => { const a = SUN_IN_GALAXY.th + galRot(t); return { x: GALC.x + Math.cos(a) * SUN_IN_GALAXY.r * GALC.R, y: GALC.y + Math.sin(a) * SUN_IN_GALAXY.r * GALC.R, a }; };

  // ——— kamera (tek dönüşüm; yarıçap log uzayda) ———
  const S0 = { c: [33.6, 38.6], r: 260, cx: 590, cy: 1030 };
  const MAP = { c: [35.0, 39.6], r: 4950, cx: 540, cy: 1050 };
  const WORLD = { c: [88, 42], r: 480, cx: 540, cy: 1200 };
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, c: [S0.c[0] + 10 * seg(t, 0, T.orbit0), S0.c[1]], r: S0.r * (1 + 0.12 * seg(t, 0, T.orbit0)) }) },
    { t0: T.orbit0, t1: T.orbit0 + 0.9, to: t => ({ c: [37, 39], r: 9 * (1 + 0.04 * seg(t, T.orbit0 + 0.9, T.map0 - T.orbit0)), cx: EARTH_O.x, cy: EARTH_O.y }) },
    { t0: T.map0, t1: T.map0 + 1.0, to: t => { const u = ease.state(seg(t, T.map0 + 1.0, T.gal0 - T.map0 - 1.0)); return { ...MAP, c: [lerp(MAP.c[0], 39.0, u), lerp(MAP.c[1], 39.45, u)], r: MAP.r * (1 + 0.3 * u) }; } },   // yavaş başlayan kayma: İstanbul noktası kenardan uzak
    { t0: T.gal0, t1: T.gal0 + 1.1, to: t => { const s = sunGal(t); return { c: [37, 39], r: 4, cx: s.x, cy: s.y }; } },
    { t0: T.world0, t1: T.world0 + 1.1, to: t => { const u = seg(t, T.world0 + 1.1, T.loop0 - T.world0 - 1.1); return { ...WORLD, c: [WORLD.c[0] + 14 * u, WORLD.c[1] + 2 * u], r: WORLD.r * (1 + 0.12 * u) }; } },
    { t0: T.loop0, t1: D - 0.04, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);

  const chip = (s, x, y, a = 1, col = C.ink, al = 'center', size = 32) => { if (a <= 0) return; setFont(ctx, F.mono(size)); ctx.textAlign = al; const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 8, y - size - 2, tw + 16, size + 14); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); };

  // ——— yıldızlar: sola akar (Dünya sağa gidiyor); D'de tam bir tur → kare 0 = son kare ———
  const rnd = mulberry32(53);
  const STARS = Array.from({ length: 230 }, () => [rnd() * W, STAGE_TOP + 6 + rnd() * (1440 - STAGE_TOP), rnd()]);
  function stars(t, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.ink;
    for (const [x, y, s] of STARS) {
      const xx = ((x - (t / D) * W * (2 + Math.floor(s * 3))) % W + W) % W;
      if (s > 0.94) { ctx.fillRect(xx - 4, y - 0.8, 8, 1.6); ctx.fillRect(xx - 0.8, y - 4, 1.6, 8); } else ctx.fillRect(xx - 1, y - 1, 1.6 + s * 1.6, 1.6 + s * 1.6);
    }
    ctx.restore();
  }

  // ——— katman ağırlıkları ———
  const kOrbit = t => t < T.orbit0 + 0.3 ? 0 : t < T.map0 ? ease.state(seg(t, T.orbit0 + 0.3, 0.5)) : 1 - ease.state(seg(t, T.map0, 0.45));
  const kGal = t => t < T.gal0 + 0.75 ? 0 : t < T.world0 ? ease.state(seg(t, T.gal0 + 0.75, 0.6)) : 1 - ease.state(seg(t, T.world0, 0.5));
  const kRoute = t => t < T.map0 + 0.6 ? 0 : t < T.gal0 ? ease.enter(seg(t, T.map0 + 0.6, 0.4)) : 1 - ease.exit(seg(t, T.gal0, 0.35));
  const kWorld = t => t < T.world0 + 0.6 ? 0 : t < T.loop0 ? ease.enter(seg(t, T.world0 + 0.6, 0.4)) : 1 - ease.exit(seg(t, T.loop0, 0.4));
  const kStars = t => {
    if (t < T.map0) return 1;
    if (t < T.world0) return 1 - ease.state(seg(t, T.map0, 0.5)) + ease.state(seg(t, T.gal0 + 0.75, 0.6)) * 0.5;
    return 0.5 + 0.5 * ease.state(seg(t, T.world0, 0.6));
  };

  // ——— Güneş yörüngesi (l03): boyutlar ölçeksiz; Dünya'nın 38 sn'lik gerçek yeri değişmez, hız oku gösterir ———
  function orbit(t, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.arc(SUN0.x, SUN0.y, ORB_R, 0, Math.PI * 2); ctx.setLineDash([8, 8]); ctx.lineDashOffset = t * 60; ctx.lineWidth = 2.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.save(); ctx.translate(SUN0.x, SUN0.y); drawSun(ctx, 40, t * 4); ctx.restore();
    // hız oku: yörüngeye teğet (saat yönünün tersi, kuzeyden bakış)
    const a = Math.atan2(EARTH_O.y - SUN0.y, EARTH_O.x - SUN0.x), tx = Math.sin(a), ty = -Math.cos(a);
    const u = ease.enter(seg(t, T.v30 - 0.1, 0.5));
    if (u > 0) drawArrow(ctx, EARTH_O.x + tx * 26, EARTH_O.y + ty * 26, EARTH_O.x + tx * (26 + 150 * u), EARTH_O.y + ty * (26 + 150 * u), 4);
    chip('GÜNEŞ', SUN0.x, SUN0.y + 116, 1, C.ink, 'center', MONO);
    chip('DÜNYA', EARTH_O.x - 30, EARTH_O.y + 70, 1, C.ink, 'center', MONO);
    if (u > 0) chip('SANİYEDE 30 KM', EARTH_O.x + tx * 186 - 20, EARTH_O.y + ty * 186 - 18, u, C.ink, 'right', MONO);
    chip('BİR TUR: 1 YIL, 940 MİLYON KM', SAFE.x0, 1290, ease.enter(seg(t, T.v30 + 0.6, 0.4)), GR2, 'left', MONO);
    chip('BOYUTLAR ÖLÇEKSİZ', SAFE.x0, 1350, 1, GR2, 'left', MONO);
    ctx.restore();
  }

  // harita etiketi: nokta + kâğıt zeminli mono yazı (≥ 40 px); ekran kenarına taşmaz
  function mapLabel(pt, text, a, dy, col = C.ink, dot = true, align = 'center') {
    if (a <= 0 || !G.visible(pt)) return; const q = G.proj(pt);
    if (q[0] < 10 || q[0] > W - 10) return;
    if (dot) { ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(q[0], q[1], 7, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    setFont(ctx, F.mono(MONO)); const tw = ctx.measureText(text).width;
    if (align === 'right') { chip(text, Math.max(SAFE.x0 + tw, q[0] - 14), q[1] + dy, a, col, 'right', MONO); return; }
    const x = Math.max(SAFE.x0 + tw / 2, Math.min(SAFE.x1 - tw / 2, q[0]));
    chip(text, x, q[1] + dy, a, col, 'center', MONO);
  }
  const pulseRing = (q, t, col = C.ink) => { const u = (t * 1.1) % 1; ctx.save(); ctx.globalAlpha *= 1 - u; ctx.beginPath(); ctx.arc(q[0], q[1], 12 + 26 * u, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); };

  // ——— Türkiye izi (l04–l05) ———
  function route(t, k) {
    if (k <= 0) return;
    const km = Math.min(kmOrb(t), CUM.at(-1));
    // giriş: iz İstanbul'dan o anki uzunluğa 0,7 sn'de çizilir, sonra gerçek zamanla uzar
    const draw = km * ease.state(seg(t, T.map0 + 0.6, 0.7));
    ctx.save(); ctx.globalAlpha = k;
    // video sonu: hayalet kesik çizgi ve halka ("bin"de)
    const g = ease.enter(seg(t, T.ghost - 0.05, 0.45));
    if (g > 0) {
      ctx.lineDashOffset = -t * 40; G.line(routeLine(END_ORB).slice(Math.floor(draw / 15)), { color: C.graphite, w: 3, dash: [6, 8] }); ctx.lineDashOffset = 0;
      G.ringAt(routeAt(END_ORB), g, 22, C.ink);
    }
    G.line(routeLine(draw), { color: C.ink, w: 5 });
    // geçilen şehirler: nokta ve ad, sayaç geçtiğinde
    ROUTE.forEach(([nm, lon, lat], i) => {
      // Ankara etiketi harita kayarken kenara sıkışmadan çekilir (üst satırda ANKARA: 350 KM kalır)
      const passed = i === 0 ? 1 : i === 1 ? ease.enter(seg(t, T.ankW - 0.04, 0.3)) * (1 - ease.exit(seg(t, T.ghost + 1.2, 0.35))) : ease.enter(seg(kmOrb(t), CUM[i] - 1, 40));
      if (i === ROUTE.length - 1 && kmOrb(t) < CUM[i]) return;
      const lab = i === 0 ? 'İSTANBUL' : `${nm}: ${nf0.format(Math.round(CUM[i]))} KM`;
      mapLabel([lon, lat], lab, passed * clamp01(draw / Math.max(1, CUM[i]) * 3 - 2 + (i === 0 ? 3 : 0)), i === 0 ? -22 : 62, C.ink, true, i === 1 ? 'right' : 'center');   // Ankara etiketi solda: doğuya giden iz ve uçtaki halka üstünden geçmez
    });
    if (g > 0) for (const i of [2, 3]) if (kmOrb(t) < CUM[i]) mapLabel(ROUTE[i].slice(1), ROUTE[i][0], g, i === 2 ? -24 : 62, GR2);   // Sivas üstte: Ankara etiketine binmez
    if (g > 0) { const q = G.proj(routeAt(END_ORB)); chip('VİDEO SONU', Math.min(SAFE.x1, q[0] + 24), q[1] - 36, g, C.ink, 'right', MONO); chip(`${nf0.format(Math.round(END_ORB))} KM`, Math.min(SAFE.x1, q[0] + 24), q[1] - 92, g, C.ink, 'right', MONO); }
    // baş: SEN (iz ucunda)
    const h = G.proj(routeAt(draw)); pulseRing(h, t);
    ctx.beginPath(); ctx.arc(h[0], h[1], 9, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
    chip('KUŞ UÇUŞU · GERÇEK ÖLÇEK', SAFE.x0, 1350, 1, GR2, 'left', MONO);
    ctx.restore();
  }

  // ——— Samanyolu (l06) ———
  function galaxy(t, k) {
    if (k <= 0) return;
    const rot = galRot(t), s = sunGal(t);
    ctx.save(); ctx.globalAlpha = k;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1440 - STAGE_TOP); ctx.clip();
    drawGalaxy(ctx, GALC.x, GALC.y, GALC.R, rot, k);
    ctx.restore();
    // Güneş halkası ve dönüş oku
    ctx.beginPath(); ctx.arc(s.x, s.y, 13, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    const u = ease.enter(seg(t, T.v230 - 0.1, 0.5));
    if (u > 0) { const tx = -Math.sin(s.a), ty = Math.cos(s.a); drawArrow(ctx, s.x + tx * 24, s.y + ty * 24, s.x + tx * (24 + 140 * u), s.y + ty * (24 + 140 * u), 4); chip('SANİYEDE 230 KM', SAFE.x1, s.y + ty * 170 + 46, u, C.ink, 'right', MONO); }
    chip('GÜNEŞ VE SEN', Math.max(SAFE.x0 + 270, s.x - 22), s.y - 24, ease.enter(seg(t, T.gal0 + 0.9, 0.4)), C.ink, 'right', MONO);
    chip('MERKEZE 26.000 IŞIK YILI', SAFE.x0, 1290, ease.enter(seg(t, T.gal0 + 1.0, 0.4)), GR2, 'left', MONO);
    chip('BİR TUR: 230 MİLYON YIL', SAFE.x0, 1350, ease.enter(seg(t, T.v230 + 0.6, 0.4)), GR2, 'left', MONO);
    ctx.restore();
  }

  // ——— dünya (l07): aynı mesafe İstanbul → Tokyo yönünde ———
  function worldRoute(t, k) {
    if (k <= 0) return;
    const km = Math.min(kmGal(t), END_GAL), draw = km * ease.state(seg(t, T.world0 + 0.6, 0.8)), red = t >= T.hero - 0.02 && t < T.ink;
    ctx.lineDashOffset = -t * 40;
    ctx.save(); ctx.globalAlpha = k;
    const g = ease.enter(seg(t, T.video - 0.05, 0.45));
    if (g > 0 && draw < END_GAL - 1) G.line(tokLine(draw, END_GAL), { color: red ? C.red : C.graphite, w: 3, dash: [6, 8] });
    ctx.lineDashOffset = 0;
    G.line(tokLine(0, Math.max(1, draw)), { color: C.ink, w: 5 });
    mapLabel(IST, 'İSTANBUL', 1, 62);
    const ht = ease.enter(seg(t, T.tok - 0.06, 0.3)), vs = 1 - ease.exit(seg(t, T.tok - 0.3, 0.2));
    if (g > 0) {
      G.ringAt(tokAt(END_GAL), g, 20, red ? C.red : C.ink);
      const q = G.proj(tokAt(END_GAL)); chip('VİDEO SONU', Math.min(SAFE.x1, q[0] + 24), q[1] - 72, g * vs, C.ink, 'right', MONO);
    }
    if (ht > 0) { const q = G.proj(TOK); chip('TOKYO', Math.min(SAFE.x1, q[0] + 24), q[1] - 60, ht, red ? C.red : C.ink, 'right', MONO); }
    const h = G.proj(tokAt(Math.max(1, draw))); if (draw < END_GAL - 5) pulseRing(h, t);
    ctx.beginPath(); ctx.arc(h[0], h[1], 9, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
    chip('İSTANBUL–TOKYO: 8.944 KM', SAFE.x0, 1290, ease.enter(seg(t, T.tok - 0.04, 0.35)) * (1 - ease.exit(seg(t, T.back, 0.3))), C.ink, 'left', MONO);
    chip('KUŞ UÇUŞU MESAFESİ', SAFE.x0, 1350, ease.enter(seg(t, T.world0 + 1.0, 0.4)) * (1 - ease.exit(seg(t, T.back, 0.3))), GR2, 'left', MONO);
    ctx.restore();
  }

  // ——— kare 0 / SEN işareti (küre büyükken) ———
  function senMark(t, a) {
    if (a <= 0 || !G.visible(SEN)) return;
    const q = G.proj(SEN), pulse = (t * 1.2) % 1;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(q[0], q[1], 10 + 22 * pulse, 0, Math.PI * 2); ctx.globalAlpha = a * (1 - pulse); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
    chip('SEN', q[0] + 20, q[1] - 16, a, C.ink, 'left', MONO);
  }

  // ——— büyüteç: koltukta izleyen kişi ———
  function roundel(t, k, at) {
    if (k <= 0) return;
    const R = ROUND, r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 40) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 20, at[1] - Math.sin(ang) * 20); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    const z = 1 + 0.08 * seg(t, T.sit, 3);
    ctx.scale(z, z);
    ctx.beginPath(); ctx.moveTo(-140, 92); ctx.lineTo(140, 92); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.translate(-36, 34); drawSitter(ctx, SITTER_CARD, { look: 0.38, phone: 1 }, 92); ctx.restore();
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const kRound = t => {
    if (t >= T.sit - 0.1 && t < T.orbit0 + 0.2) return t < T.orbit0 - 0.15 ? ease.enter(seg(t, T.sit - 0.1, 0.35)) : 1 - ease.exit(seg(t, T.orbit0 - 0.15, 0.3));
    if (t >= T.back && t < T.follow) return t < T.follow - 0.3 ? ease.enter(seg(t, T.back, 0.35)) : 1 - ease.exit(seg(t, T.follow - 0.3, 0.25));
    return 0;
  };

  // ——— Sıfır ———
  const blinkR = mulberry32(531); const blinks = []; for (let b = 1.6; b < D - 1; b += 2.4 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.sit, 'ayakta', 'mutlu'], [T.v30, 'sasirma', 'saskin'], [T.v30 + 1.4, 'ayakta', 'sayiyor'], [T.ank, 'ayakta', 'mutlu'],
    [T.v230, 'sasirma', 'saskin'], [T.v230 + 1.4, 'ayakta', 'dusunceli'], [T.video, 'ayakta', 'sayiyor'], [T.hero, 'sasirma', 'saskin'], [T.back, 'ayakta', 'dusunceli'], [T.follow, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
  }

  // ——— üst blok ———
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, T.titleOut, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    const ls = ['Bu videoyu izlerken', 'uzayda ne kadar', 'yol alacaksın?'];
    let fs = 96; setFont(ctx, F.head(fs)); while (Math.max(...ls.map(s => ctx.measureText(s).width)) > SAFE.x1 - SAFE.x0 && fs > 56) { fs -= 2; setFont(ctx, F.head(fs)); }
    ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, 432 + i * fs * 1.0, fs, k, C.ink));
    setFont(ctx, F.mono(MONO)); revealText(ctx, 'SAYAÇ VİDEOYLA BİRLİKTE BAŞLADI', SAFE.x0, 690, MONO, k, GR2);
  }
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const p = ease.enter(seg(t, ln.t0 - 0.06, 0.3)) * (t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1);
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (ls.length <= 2) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 1 ? 400 : 430, nums = NUMW[ln.id] || {};
    ls.slice(0, 3).forEach((s, i) => {
      // sayı içeren sözcük söylendiği kelimede açılır; diğerleri satırla birlikte
      if (!Object.keys(nums).some(n => s.includes(n))) { revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink); return; }
      setFont(ctx, F.name(fs0)); let x = SAFE.x0;
      for (const tok of s.split(' ')) {
        const key = Object.keys(nums).find(n => tok.startsWith(n)), pw = key ? ease.enter(seg(t, tl.W(ln.id, nums[key]) - 0.04, 0.25)) : p;
        if (key && pw < 1) { const tw = ctx.measureText(tok).width; ctx.save(); ctx.globalAlpha *= p * p * (1 - pw); ctx.fillStyle = C.ink; ctx.fillRect(x, y0 + i * lh + 6, tw, 3); ctx.restore(); }
        revealText(ctx, tok, x, y0 + i * lh, fs0, Math.min(p, pw), C.ink); x += ctx.measureText(tok + ' ').width;
      }
    });
  }
  // sayaç satırı (üst blok) ve kare 0'daki sahne sayacı: aynı sayı, başlık çıkarken yukarı taşınır
  function row({ label, num, unit, right1, right2, red = false, p = 1, carry = 1 }) {
    setFont(ctx, F.mono(MONO)); revealText(ctx, label, SAFE.x0, 590, MONO, p, red ? C.red : GR2);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; if (carry >= 1) revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit && carry >= 1) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(MONO));
    if (right1) revealText(ctx, right1, SAFE.x1, 634, MONO, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, MONO, p, GR2, 'right');
  }
  function odometer(t) {
    // kare 0 ve döngü: sahnede büyük sayaç (sol alt); başlık çıkarken üst satıra taşınır
    const km = kmOrb(t), txt = nf0.format(Math.floor(km));
    const inLoop = t >= T.loop0;
    const tl0 = inLoop ? D : t;
    const kmShown = inLoop ? 0 : km;
    const carry = inLoop ? 0 : ease.state(seg(t, T.titleOut - 0.05, 0.6));
    if (carry < 1 && (!inLoop || t >= T.loop0 + 0.7)) {
      const a = inLoop ? ease.enter(seg(t, T.loop0 + 0.7, 0.35)) : 1;
      const s = lerp(76, 88, carry), x = SAFE.x0, y = lerp(1412, 680, carry);
      ctx.save(); ctx.globalAlpha = a;
      if (carry < 0.4) { setFont(ctx, F.mono(MONO)); ctx.fillStyle = GR2; ctx.textAlign = 'left'; ctx.globalAlpha = a * (1 - carry / 0.4); ctx.fillText("GÜNEŞ'E GÖRE YOLUN", x, 1338); ctx.globalAlpha = a; }
      setFont(ctx, F.head(s)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; const n = nf0.format(Math.floor(kmShown)); ctx.fillText(n, x, y);
      const nw = ctx.measureText(n).width; setFont(ctx, F.name(lerp(40, 44, carry))); ctx.fillText('km', x + nw + 12, y);
      ctx.restore();
    }
    void tl0; void txt;
    return carry;
  }
  function counters(t, carry) {
    if (t < T.titleOut - 0.05 || t >= T.loop0 + 0.3) return;
    const pOut = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    const p0 = Math.max(0.35, ease.enter(seg(t, T.titleOut, 0.35))) * pOut;
    const orb = nf0.format(Math.floor(kmOrb(t))), gal = nf0.format(Math.floor(kmGal(t)));
    if (t < T.gsw) {
      const r2 = t >= T.ankW - 0.04 && t < T.gal0 + 0.3 ? 'ANKARA: 350 KM' : t >= T.v30 && t < T.map0 ? 'SANİYEDE 30 KM' : '';
      row({ label: "GÜNEŞ'E GÖRE YOLUN", num: orb, unit: 'km', right1: '', right2: r2, p: p0, carry });
      return;
    }
    if (t < T.hero - 0.02) {
      const pg = ease.enter(seg(t, T.gsw, 0.35));
      row({ label: 'GALAKSİ MERKEZİNE GÖRE', num: gal, unit: 'km', right1: '', right2: t >= T.v230 - 0.04 ? 'SANİYEDE 230 KM' : '', p: pg * pOut });
      return;
    }
    row({ label: 'GALAKSİ MERKEZİNE GÖRE', num: nf0.format(Math.round(END_GAL)), unit: 'km · video sonunda', right1: '', right2: '', red: t < T.ink, p: pOut });
  }

  // ——— kare ———
  function render(t) {
    // bağlam durumu her karede sıfırlanır (G.line lineCap'i kalıcı bırakır): kareler arasında durum taşınmaz
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.textAlign = 'left';
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const K = cam(t); G.setCam(K);
    stars(t, kStars(t));
    galaxy(t, kGal(t));
    orbit(t, kOrbit(t));
    // küre: çok küçükken nokta (Güneş yörüngesinde Dünya, galakside Güneş'in içinde kaybolur)
    if (K.r >= 7) G.draw();
    else if (t < T.gal0 + 0.6 || t >= T.world0) { ctx.beginPath(); ctx.arc(K.cx, K.cy, Math.max(3, K.r), 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    if (K.r > 150 && K.r < 900) senMark(t, (t < T.orbit0 ? 1 : 1 - ease.exit(seg(t, T.orbit0, 0.25))) * (t < T.world0 ? 1 : 0) + (t >= T.loop0 ? ease.enter(seg(t, T.loop0 + 0.5, 0.4)) : 0));
    route(t, kRoute(t));
    worldRoute(t, kWorld(t));
    const kr = kRound(t); if (kr > 0.02) roundel(t, kr, t < T.orbit0 && G.visible(SEN) ? G.proj(SEN) : null);
    if (t >= T.follow && t < T.loop0) { const fa = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.25, 0.25)); chip('TAKİP ET', SAFE.x0, 1336, fa, C.ink, 'left', 42); chip('HER GÜN YENİ BİR SAYI', SAFE.x0, 1394, fa, C.ink, 'left', 40); }
    // üst bant kâğıdı: sahne yukarı taşmaz
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, STAGE_TOP);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t);
    const carry = odometer(t);
    counters(t, carry);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

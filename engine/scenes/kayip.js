// "Kayıp" şablonu (Hangisi daha şaşırtıcı?): zamanını kaybeden Michel Siffre (1962, Scarasson mağarası, 130 m) ve yönünü
// kaybeden Mauro Prosperi (1994, Sahra). A: dağın kesiti; kamera kuyudan buzul mağarasına iner, simgeler (saat, takvim,
// güneş) çizilir, telefon üç kez çalar, iki takvim yaprağı ve aradaki 25 gün düşer. B: gravür küre (Fas–Cezayir): şematik
// parkur, kum fırtınası, dolanan iz, türbe, Cezayir sınırı, yaklaşık bulunma yeri. Kıyas: aynı harita, Alpler'de 0 km'lik
// nokta ve Sahra'da 291 km'lik doğru (dorukta kırmızı). Anlatım saattir (yolculuk_core.buildYolTimeline); her şey t'nin
// saf fonksiyonudur.
import { geoInterpolate, geoDistance } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, mixCam } from '../globe.js';
import { SIFFRE_CARD, PROSPERI_CARD, GIRL_CARD, drawFigure, drawTent, drawPhone, drawCalendar, drawIcon, drawShrine, drawBat, drawFootprints, drawGoat } from '../kayip_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const ROUND_B = { x: 225, y: 862, r: 124 };   // Sahra haritasında büyüteç sol üstte (bulunduğu yer sol altta kalır)
const SIFIR = { x: 872, y: 1412, H: 92 };
const CY = 1100;                      // mağara dünyasının ekrandaki dikey merkezi
const PX_M = 900 / 130;               // mağara dünyası: 130 m = 900 px
// coğrafya
const SCARASSON = [7.68, 44.13];
const ROUTE = [[-6.87, 30.08], [-6.6, 30.24], [-6.3, 30.34], [-5.98, 30.42]];   // şematik parkur (Foum Zguid'den kuzeydoğuya)
const LOST = ROUTE[2];                                                              // fırtına noktası (Fas içinde, sınıra ~60 km)
const R_KM = 6371.0088;
function dest([lon, lat], km, brg) {
  const d = km / R_KM, b = brg * Math.PI / 180, f1 = lat * Math.PI / 180, l1 = lon * Math.PI / 180;
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
  return [l2 * 180 / Math.PI, f2 * 180 / Math.PI];
}
// bulunduğu yer yaklaşık: Tindouf yönünde (212°), parkurun EN YAKIN noktasına 291 km olacak uzaklıkta (fırtına noktasına
// 343 km); Cezayir içinde, Tindouf'a ~4 km (d3 geoContains / geoDistance ile denetlendi)
const FOUND = dest(LOST, 342.78, 212);
const CAM_MOR = { c: [-6.95, 29.0], r: 6600, cx: 700, cy: 1100 };   // parkur y≈950, bulunduğu yer y≈1250; kıyı, Marakeş ve okyanus kadrajda
const CAM_WIDE = { c: [0.5, 35.6], r: 1800, cx: 615, cy: 1120 };

// n'inci (1'den) önek eşleşmesi: "yüz" iki kez geçer (1962 ve 130)
function Wn(tl, id, key, nth = 1) {
  const ws = tl.L[id].words.filter(w => w.w.toLocaleLowerCase('tr').startsWith(key.toLocaleLowerCase('tr')));
  if (!ws[nth - 1]) throw new Error(`kelime yok: ${id} ${key} #${nth}`);
  return ws[nth - 1].t0;
}

export function kayipTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    t130: Wn(tl, 'l02', 'yüz', 2), saat: Wd('l03', 'saat'), takvim: Wd('l03', 'takvim'), gun: Wd('l03', 'gün'),
    wake: Wd('l04', 'uyanınca'), eat: Wd('l04', 'yemek'), sleep: Wd('l04', 'uyumadan'), ekip: Wd('l05', 'ekip'),
    aug: Wd('l06', 'yirmi'), oysa: Wd('l06', 'oysa'), sep: Wd('l06', 'on'), lost25: Wd('l07', 'yirmi'),
    whip0: L.l07.end + 0.95, whip1: L.l08.t0 + 0.55, adam: Wd('l08', 'adam'),
    fas: Wd('l09', 'fas'), ultra: Wd('l09', 'ultramaratona'), storm: Wd('l10', 'kum'), lostW: Wd('l10', 'yolunu'),
    turbe: Wd('l11', 'türbeye'), yarasa: Wd('l11', 'yarasaların'), found: L.l12.t0, tuareg: Wd('l12', 'göçebe'), dz: Wd('l12', 'cezayir'),
    kilo: Wd('l13', 'on'), cmp0: L.l14.t0 - 0.1, cmp1: L.l14.end + 0.25, s25: Wd('l15', 'yirmi'),
    // doruk ikiye bölünür: "Prosperi ise 9 günde yolundan" · sessizlik · "291 kilometre saptı." (vuruş ve kırmızı ikinci yarıda)
    p16: L.l16.t0, nine: Wd('l16', 'dokuz'), hero: L.l17.t0 - 0.05, n291: L.l17.t0, ask: L.l18.t0, loop0: tl.loop0,
  };
  return T;
}

export async function makeKayipRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = kayipTimes(tl);
  const DZ = world.country('012'), BORDER = world.bordersAmong(['012', '504']);
  // döngü dikişi: sürekli döngülerin hızı film süresine tam bölünecek biçimde yuvarlanır (son kare = kare 0)
  const rq = r => Math.round(r * D) / D;
  const rnd = mulberry32(61);
  const drips = Array.from({ length: 9 }, () => [lerp(200, 860, rnd()), rnd(), lerp(0.9, 1.6, rnd())]);
  const snow = Array.from({ length: 40 }, () => [rnd() * 1600 - 300, rnd(), lerp(0.08, 0.16, rnd())]);
  const sand = Array.from({ length: 90 }, () => [rnd(), rnd(), lerp(0.6, 1.4, rnd()), lerp(30, 90, rnd())]);
  const days = Array.from({ length: 25 }, (_, i) => [i % 5, Math.floor(i / 5), lerp(-0.6, 0.6, rnd())]);
  // dolanan iz: fırtına noktasından bulunduğu yere, tohumlu kıvrımlarla (gün sayısı 9)
  const WANDER = (() => {
    const pts = [], n = 120, gi = geoInterpolate(LOST, FOUND);
    for (let i = 0; i <= n; i++) {
      const u = i / n, p = gi(u), side = Math.sin(u * Math.PI * 5.2 + 0.7) * 0.22 * Math.sin(Math.PI * u) + Math.sin(u * 23) * 0.03 * Math.sin(Math.PI * u);
      pts.push([p[0] + side * 0.9, p[1] - side * 0.5]);
    }
    return pts;
  })();
  const SHRINE_AT = WANDER[48];
  // 291 km: parkurun bulunma yerine en yakın noktasından (yoğun örnekle), gerçek ölçekte
  const NEAR = (() => { let best = null, bd = 1e9; for (let i = 0; i < ROUTE.length - 1; i++) for (let k = 0; k <= 200; k++) { const p = geoInterpolate(ROUTE[i], ROUTE[i + 1])(k / 200), d = geoDistance(p, FOUND); if (d < bd) { bd = d; best = p; } } return best; })();
  const MID = geoInterpolate(NEAR, FOUND)(0.5);
  const CAM_HERO = { c: [MID[0] + 0.6, MID[1] - 0.25], r: 4900, cx: 540, cy: 1060 };

  // ——— mağara dünyası ———
  const ySurf = x => {
    const P = [[-700, 40], [-200, 12], [80, -70], [300, -170], [520, -235], [720, -150], [920, -60], [1250, 0], [1900, 30]];
    for (let i = 0; i < P.length - 1; i++) if (x <= P[i + 1][0]) { const [a, b] = [P[i], P[i + 1]]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); }
    return 30;
  };
  const SHAFT = [[330, -160], [372, 60], [300, 300], [392, 560], [348, 800], [430, 900]];
  const CAVE = { x: 560, y: 965, rx: 430, ry: 175 };
  const TENT = [770, 1060], PHONE = [640, 1052], SIF = [520, 1064], CAMP = [150, ySurf(150)];
  const cavePath = () => { ctx.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, w = 1 + 0.06 * Math.sin(a * 5 + 1) + 0.04 * Math.sin(a * 9); const x = CAVE.x + Math.cos(a) * CAVE.rx * w, y = CAVE.y + Math.sin(a) * CAVE.ry * w * (Math.sin(a) > 0 ? 0.8 : 1); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
  const CAM_OV = { z: 0.55, oy: 430, cx: 500 }, CAM_SURF = { z: 1.0, oy: 60, cx: 520 }, CAM_C0 = { z: 1.0, oy: 930, cx: 560 }, CAM_C = { z: 1.3, oy: 905, cx: 600 };
  const mixA = (a, b, u) => ({ z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), oy: lerp(a.oy, b.oy, u), cx: lerp(a.cx, b.cx, u) });
  // genel plan: saniyede %2 yavaş yaklaşma; döngü sonunda aynı hızla gelip kare 0'a oturur (dikişte hız da tutar)
  const camOV = t => ({ ...CAM_OV, z: CAM_OV.z * (t < D / 2 ? 1 + 0.02 * t : 1 - 0.02 * (D - t)) });
  function camA(t) {
    if (t < L.l02.t0) return camOV(t);
    const tS = L.l02.t0 + 1.2;
    if (t < tS) return mixA(camOV(L.l02.t0), CAM_SURF, ease.state(seg(t, L.l02.t0, 1.2)));
    if (t < T.t130 + 0.15) return mixA(CAM_SURF, CAM_C0, ease.state(seg(t, tS, T.t130 + 0.15 - tS)));
    if (t < L.l03.t0 + 1.0) return mixA(CAM_C0, CAM_C, ease.state(seg(t, T.t130 + 0.15, L.l03.t0 + 1.0 - T.t130 - 0.15)));
    // mağarada yavaş yaklaşma (%8): sahne hiçbir karede donmaz
    const k = 1 + 0.08 * seg(t, L.l03.t0 + 1.0, T.whip1 - L.l03.t0 - 1.0);
    return { ...CAM_C, z: CAM_C.z * k };
  }
  const depthAt = t => clamp01((camA(t).oy - CAM_SURF.oy) / (CAM_C0.oy - CAM_SURF.oy)) * 130;

  // x0..x1: geçişte sert kenar (küre öbür yanda; çift pozlama yok)
  function caveWorld(t, dx, cam, x0 = 0, x1 = W) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, STAGE_TOP, x1 - x0, 1920 - STAGE_TOP); ctx.clip();
    ctx.fillStyle = C.paper; ctx.fillRect(x0, STAGE_TOP, x1 - x0, 1920 - STAGE_TOP);
    ctx.translate(dx + 540, CY); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.oy);
    const lw = 1 / cam.z;
    // döngü kısmında sahne durumu kare 0 ile aynıdır (cetvel görünür, Siffre oturur); sürekli döngüler gerçek t ile akar
    const ts = t >= T.loop0 ? t - D : t;
    // gök ve kar taneleri (sürekli döngü)
    ctx.fillStyle = C.paper; ctx.fillRect(-900, -900, 3200, 900);
    ctx.fillStyle = C.ink;
    for (const [x0, ph, sp] of snow) { const u = (ph + t * rq(sp)) % 1, x = x0 + Math.sin(u * 6.28 + ph * 9) * 20, y = lerp(-520, 40, u); if (y < ySurf(x) - 4) { ctx.beginPath(); ctx.arc(x, y, 2.6 * lw * 1.4, 0, Math.PI * 2); ctx.fill(); } }
    // kaya: dağ profili ve altı, eğik tarama
    const rock = () => { ctx.beginPath(); ctx.moveTo(-900, 40); for (let x = -900; x <= 2200; x += 40) ctx.lineTo(x, ySurf(x)); ctx.lineTo(2200, 1900); ctx.lineTo(-900, 1900); ctx.closePath(); };
    rock(); ctx.fillStyle = '#E6DECC'; ctx.fill();
    ctx.save(); rock(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.22)'; ctx.lineWidth = 1.2 * lw;
    for (let d = -1400; d < 3400; d += 14) { ctx.beginPath(); ctx.moveTo(d - 900, -400); ctx.lineTo(d + 1700, 2200); ctx.stroke(); }
    // kar örtüsü (zirve)
    ctx.beginPath(); ctx.moveTo(260, ySurf(260)); for (let x = 260; x <= 820; x += 20) ctx.lineTo(x, ySurf(x)); for (let x = 820; x >= 260; x -= 20) ctx.lineTo(x, ySurf(x) + 34 + Math.sin(x * 0.05) * 10); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-900, 40); for (let x = -900; x <= 2200; x += 40) ctx.lineTo(x, ySurf(x)); ctx.lineWidth = 3 * lw * 1.2; ctx.strokeStyle = C.ink; ctx.stroke();
    // kuyu
    ctx.beginPath(); SHAFT.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 46; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.lineWidth = 40; ctx.strokeStyle = C.paper; ctx.stroke();
    // mağara: kâğıt, buzul tabanı yatay ince tarama, sarkıtlar
    cavePath(); ctx.fillStyle = C.paper; ctx.fill();
    ctx.save(); cavePath(); ctx.clip();
    ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineWidth = 1.1 * lw; for (let y = 1030; y < 1200; y += 7) { ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(1000, y + Math.sin(y) * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(120, 1030); ctx.bezierCurveTo(400, 1018, 700, 1036, 1000, 1024); ctx.lineWidth = 2.4 * lw; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.fillStyle = C.ink; for (let i = 0; i < 14; i++) { const x = 180 + i * 56 + Math.sin(i * 3.1) * 14, y = CAVE.y - CAVE.ry * (0.86 - 0.12 * Math.cos((x - CAVE.x) / CAVE.rx * 1.5)), h = 16 + (i * 7) % 22; ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill(); }
    // damlalar (sürekli döngü)
    for (const [x, ph, sp] of drips) { const u = (ph + t * rq(1 / sp)) % 1; const y0 = CAVE.y - CAVE.ry * 0.7, y1 = 1026; const y = lerp(y0, y1, u * u); ctx.beginPath(); ctx.ellipse(x, y, 3.2, 5.2, 0, 0, Math.PI * 2); ctx.fill(); if (u > 0.92) { ctx.beginPath(); ctx.ellipse(x, y1, 10 * (u - 0.92) / 0.08, 2.4, 0, 0, Math.PI * 2); ctx.lineWidth = 1.4 * lw; ctx.strokeStyle = C.ink; ctx.stroke(); } }
    ctx.restore();
    cavePath(); ctx.lineWidth = 3 * lw * 1.2; ctx.strokeStyle = C.ink; ctx.stroke();
    // telefon hattı: mağaradan kuyu boyunca yüzeydeki çadıra; çağrıda bir atım yukarı koşar
    const wire = [[PHONE[0] - 30, PHONE[1] - 20], [430, 900], ...SHAFT.slice().reverse().map(([x, y]) => [x + 6, y]), [230, ySurf(230) - 34]];
    ctx.beginPath(); wire.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineWidth = 1.6 * lw * 1.3; ctx.strokeStyle = C.ink; ctx.setLineDash([10, 6]); ctx.stroke(); ctx.setLineDash([]);
    for (const tc of [T.wake, T.eat, T.sleep]) {
      const u = seg(t, tc, 1.1); if (u <= 0 || u >= 1) continue;
      let acc = 0; const segL = wire.slice(1).map((p, i) => Math.hypot(p[0] - wire[i][0], p[1] - wire[i][1])), tot = segL.reduce((a, b) => a + b, 0), want = tot * ease.state(u);
      for (let i = 0; i < segL.length; i++) { if (acc + segL[i] >= want) { const k = (want - acc) / segL[i], x = lerp(wire[i][0], wire[i + 1][0], k), y = lerp(wire[i][1], wire[i + 1][1], k); ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); break; } acc += segL[i]; }
    }
    // yüzey kampı: çadır ve ekip (iki küçük figür)
    ctx.save(); ctx.translate(230, ySurf(230) + 3); drawTent(ctx, 70); ctx.restore();
    for (const [x, f] of [[CAMP[0] - 10, 1], [CAMP[0] - 50, -1]]) { ctx.save(); ctx.translate(x, ySurf(x) + 2); if (f < 0) ctx.scale(-1, 1); drawFigure(ctx, SIFFRE_CARD, { arms: 'down' }, 120); ctx.restore(); }
    // mağara kampı: çadır, telefon, Siffre
    ctx.save(); ctx.translate(TENT[0], TENT[1]); drawTent(ctx, 120, Math.sin(t * rq(0.7) * 6.283) * 0.3); ctx.restore();
    const ring = [T.wake, T.eat, T.sleep].some(tc => ts >= tc && ts < tc + 0.9) ? Math.abs(Math.sin(t * 40)) : 0;
    ctx.save(); ctx.translate(PHONE[0], PHONE[1]); drawPhone(ctx, 64, ring); ctx.restore();
    const onPhone = [T.wake, T.eat, T.sleep].some(tc => ts >= tc - 0.2 && ts < tc + 1.0);
    const sit = ts >= L.l05.t0 && ts < T.whip0 || ts < L.l03.t0;
    ctx.save(); ctx.translate(SIF[0], SIF[1]); drawFigure(ctx, SIFFRE_CARD, onPhone ? { arms: 'phone', lamp: 0.6 } : sit ? { sit: true, arms: 'down', lamp: 0.5 + 0.2 * Math.sin(t * rq(0.5) * 6.283) } : { arms: 'down', lamp: 0.7 }, 210); ctx.restore();
    // derinlik cetveli (sağda): 0'dan 130 m'ye, her 10 m çentik, 50 m'de etiket
    const RX = 880;
    ctx.save(); ctx.globalAlpha = 1 - ease.exit(seg(ts, L.l03.t0 + 0.6, 0.4));
    ctx.beginPath(); ctx.moveTo(RX, 0); ctx.lineTo(RX, 900); ctx.lineWidth = 2.4 * lw * 1.2; ctx.strokeStyle = C.ink; ctx.stroke();
    // etiketler ekranda ≥ 40 px; "130 m" yalnız söylendiği kelimeden sonra (öncesinde yalnız çentik)
    const rfs = Math.round(42 / cam.z); setFont(ctx, F.mono(rfs)); ctx.fillStyle = C.ink; ctx.textAlign = 'right';
    for (let m = 0; m <= 130; m += 10) { const y = m * PX_M, big = m % 50 === 0 || m === 130; ctx.beginPath(); ctx.moveTo(RX, y); ctx.lineTo(RX - (big ? 26 : 14), y); ctx.lineWidth = 2 * lw * 1.2; ctx.stroke(); if (big && (m < 130 || ts >= T.t130 - 0.04)) { ctx.fillStyle = C.paper; const s = `${m} m`, tw = ctx.measureText(s).width; ctx.fillRect(RX - 34 - tw - 6, y - rfs * 0.85, tw + 12, rfs * 1.2); ctx.fillStyle = C.ink; ctx.fillText(s, RX - 34, y); } }
    ctx.restore();
    ctx.restore();
  }

  // ——— küre: Fas–Cezayir ———
  const toB = t => (t < T.whip0 ? 0 : t < T.whip1 ? ease.state(seg(t, T.whip0, T.whip1 - T.whip0)) : t < T.loop0 ? 1 : 1 + ease.state(seg(t, T.loop0, 0.95)));
  // geniş plan: l15–l16 boyunca %10 yaklaşma; "iki yüz doksan bir"de 600 ms'de Sahra'ya itiş (291 km ≥ 200 px);
  // soruda 0,9 sn'de geniş plana geri çekilir ve döngüye dek yavaşça kaymayı sürdürür (kuyruk donmaz)
  const wideAt = t => ({ ...CAM_WIDE, r: CAM_WIDE.r * (1 + 0.10 * seg(t, T.cmp1, T.hero - T.cmp1) + 0.05 * seg(t, T.ask, T.loop0 + 0.95 - T.ask)), cy: CAM_WIDE.cy - 50 * seg(t, T.ask, T.loop0 + 0.95 - T.ask) });
  const heroAt = t => ({ ...CAM_HERO, r: CAM_HERO.r * (1 + 0.05 * seg(t, T.n291 + 0.6, T.ask - T.n291 - 0.6)) });
  function camB(t) {
    const drift = 1 + 0.08 * seg(t, T.whip1, T.cmp0 - T.whip1);
    const mor = { ...CAM_MOR, r: CAM_MOR.r * drift };
    let k;
    if (t < T.cmp0) k = mor;
    else if (t < T.cmp1) k = mixCam(mor, wideAt(t), ease.state(seg(t, T.cmp0, T.cmp1 - T.cmp0)));
    else if (t < T.n291) k = wideAt(t);
    else if (t < T.ask) k = mixCam(wideAt(t), heroAt(t), ease.enter(seg(t, T.n291, 0.6)));
    else k = mixCam(heroAt(t), wideAt(t), ease.state(seg(t, T.ask, 0.9)));
    const s = toB(t), base = k.cx ?? 540, cx = s <= 1 ? base + W * (1 - s) : base - W * (s - 1);
    return { ...k, cx };
  }
  // dolanan iz: yumuşak başlar, sonra sabit hızla (doğrusal) ilerler; donuk kuyruk yok
  const wanderU = t => { const u = seg(t, T.lostW, T.dz - T.lostW); return (u < 0.15 ? u * u / 0.3 : u - 0.075) / 0.925; };
  // harita etiketi: ≥ 40 px, güvenli alanda (x 90–920) kalır; noktası sahne dışındaysa yazılmaz
  function mapLabel(p, text, u, dx = 18, dy = -14, color = C.ink, align = 'left', fs = 40) {
    if (u <= 0 || !G.visible(p)) return; const q = G.proj(p), y = q[1] + dy;
    if (q[0] < 0 || q[0] > W || y - fs < STAGE_TOP + 12 || y > 1420) return;
    setFont(ctx, F.mono(fs)); const tw = ctx.measureText(text).width;
    let x0 = align === 'right' ? q[0] - dx - tw : align === 'center' ? q[0] - tw / 2 : q[0] + dx;
    x0 = Math.max(SAFE.x0 + 10, Math.min(SAFE.x1 - 10 - tw, x0));
    chip(text, x0, y, ease.enter(u), 'left', color, fs);
  }
  function globe(t) {
    const s = toB(t); if (s <= 0 || s >= 2) return null;
    G.setCam(camB(t));
    G.draw(() => { if (t >= T.dz - 0.2) G.hatch(DZ, { gap: 9, angle: -40, color: `rgba(28,27,24,${0.32 * ease.enter(seg(t, T.dz - 0.2, 0.5))})`, w: 1.1 }); });
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
        const wide = t >= T.cmp0 + 0.3;
    if (t >= T.dz - 0.2) { ctx.beginPath(); G.path(BORDER); ctx.lineWidth = wide ? 2 : 3; ctx.strokeStyle = wide ? C.graphite : C.ink; ctx.setLineDash(wide ? [6, 6] : [12, 7]); ctx.stroke(); ctx.setLineDash([]); }
    // hafif kum akışı (her planda): harita hiçbir karede donmaz
    ctx.save(); ctx.globalAlpha = 0.34; ctx.strokeStyle = C.graphite; ctx.lineCap = 'round';
    for (const [px, py, sp, len] of sand.slice(0, 60)) { const x = ((px + t * rq(sp * 0.3)) % 1) * (W + 300) - 150, y = STAGE_TOP + 60 + py * 1150; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * 0.6, y + 2); ctx.stroke(); }
    ctx.restore();
    // ülke adları (nokta yok)
    if (!wide) {
      mapLabel([-5.9, 31.2], 'FAS', ease.enter(seg(t, T.fas - 0.1, 0.4)), 0, 0, C.ink, 'center');
      mapLabel([-7.99, 31.63], 'MARAKEŞ', 1, 18, -12, C.graphite, 'left');
      if (G.visible([-7.99, 31.63])) { const q = G.proj([-7.99, 31.63]); ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, Math.PI * 2); ctx.fillStyle = C.graphite; ctx.fill(); }
      mapLabel([-11.85, 29.0], 'ATLAS', 1, 0, -22, C.graphite, 'center'); mapLabel([-11.85, 29.0], 'OKYANUSU', 1, 0, 24, C.graphite, 'center');
      if (t >= T.dz - 0.1) mapLabel([-6.3, 28.3], 'CEZAYİR', ease.enter(seg(t, T.dz - 0.1, 0.4)), 0, 0, C.ink, 'center');
    } else if (t < T.n291 || t >= T.ask + 0.5) mapLabel([-5.0, 31.6], 'FAS', 1, 0, 0, C.graphite, 'center');
    // parkur (şematik)
    const pu = ease.state(seg(t, T.ultra - 0.2, 0.9));
    if (pu > 0) {
      const gi = (a, b, u) => geoInterpolate(a, b)(u), n = ROUTE.length - 1, f = pu * n, coords = [];
      for (let i = 0; i < n && i < f; i++) { coords.push(ROUTE[i]); if (f < i + 1) coords.push(gi(ROUTE[i], ROUTE[i + 1], f - i)); }
      if (f >= n) coords.push(ROUTE[n]);
      G.line(coords, wide ? { w: 3 } : { w: 6, dash: [14, 9] });
      if (!wide && t < T.lostW) mapLabel(ROUTE[0], 'PARKUR (ŞEMATİK)', ease.enter(seg(t, T.ultra, 0.4)), -20, 62, C.ink, 'left');
    }
    // koşucu noktası: parkurda, fırtınada kaybolma noktası, sonra dolanan iz; l16'da iz bir kez daha yürünür (9 gün)
    const wu = wanderU(t);
    if (t >= T.ultra) {
      let p;
      if (t < T.lostW) { const u = ease.state(seg(t, T.ultra, T.lostW - T.ultra)) * 2 / 3, gi = u < 1 / 3 ? geoInterpolate(ROUTE[0], ROUTE[1])(u * 3) : geoInterpolate(ROUTE[1], ROUTE[2])(u * 3 - 1); p = gi; }
      else {
        const n = Math.max(1, Math.floor(wu * (WANDER.length - 1)));
        G.line(WANDER.slice(0, n + 1), wide ? { w: 3, dash: [2, 7], color: C.graphite } : { w: 5, dash: [3, 9] });
        p = WANDER[n];
        if (t >= T.p16 - 0.1 && t < T.hero) p = WANDER[Math.round(ease.state(seg(t, T.p16, T.hero - T.p16 - 0.15)) * (WANDER.length - 1))];
      }
      const show = t < T.cmp0 || (t >= T.p16 - 0.1 && t < T.hero);
      if (G.visible(p) && show) { const q = G.proj(p), pulse = 1 + 0.15 * Math.sin(t * rq(1.3) * 6.283), rr = wide ? 0.7 : 1; ctx.beginPath(); ctx.arc(q[0], q[1], 10 * pulse * rr, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.beginPath(); ctx.arc(q[0], q[1], 18 * pulse * rr, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); }
    }
    if (t >= T.lostW - 0.2 && !wide) mapLabel(LOST, 'FIRTINA', ease.enter(seg(t, T.lostW - 0.2, 0.4)), 24, -30, C.ink, 'left');
    // türbe (ikon)
    if (t >= T.turbe - 0.1 && G.visible(SHRINE_AT) && !wide) { const q = G.proj(SHRINE_AT), u = ease.enter(seg(t, T.turbe - 0.1, 0.35)); ctx.save(); ctx.translate(q[0] + 34, q[1] + 4); ctx.scale(u, u); drawShrine(ctx, 56); ctx.restore(); }
    // bulunduğu yer (yaklaşık)
    if (t >= T.tuareg - 0.1) {
      const pr = 1 + 0.08 * Math.sin(t * rq(1.1) * 6.283);
      G.ringAt(FOUND, seg(t, T.tuareg - 0.1, 0.5), (wide ? 16 : 26) * pr);
      if (!wide) { const u = ease.enter(seg(t, T.dz, 0.45)); mapLabel(FOUND, 'BULUNDUĞU YER', u, 40, -4, C.ink, 'right'); mapLabel(FOUND, '(YAKLAŞIK)', u, 40, 46, C.ink, 'right'); }
    }
    // kıyas: Siffre'nin noktası (0 km), l15'te dolan 25 gün; dorukta en yakın parkur noktasından 291 km'lik doğru
    if (wide) {
      const a = ease.enter(seg(t, T.cmp0 + 0.3, 0.5)) * (1 - seg(t, T.loop0, 0.12));
      if (G.visible(SCARASSON)) {
        const q = G.proj(SCARASSON); ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
        const pr = 1 + 0.1 * Math.sin(t * rq(1.2) * 6.283); ctx.beginPath(); ctx.arc(q[0], q[1], 26 * pr, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      }
      mapLabel(SCARASSON, 'SIFFRE', a, 44, 14, C.ink, 'right');
      if (t >= T.s25 - 0.04 && G.visible(SCARASSON)) {
        mapLabel(SCARASSON, '0 km · 25 GÜN', ease.enter(seg(t, T.s25 - 0.04, 0.4)) * (1 - seg(t, T.loop0, 0.12)), 44, 68, C.ink, 'right');
        // 25 günlük çubuk: birer birer dolar (60 ms arayla)
        const q = G.proj(SCARASSON), x1 = Math.min(SAFE.x1 - 10, q[0] - 44), y = q[1] + 92;
        for (let i = 0; i < 25; i++) { const u = ease.enter(seg(t, T.s25 + i * 0.06, 0.2)), x = x1 - (25 - i) * 15; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x, y, 11, 26); if (u > 0) { ctx.fillStyle = C.ink; ctx.fillRect(x, y + 26 * (1 - u), 11, 26 * u); } }
      }
      const hold = t >= T.n291 && t < T.ask;   // Sahra'ya itişte ad solda, sayı sağda; geniş planda ikisi de sağda
      mapLabel(FOUND, 'PROSPERI', a, 34, hold ? 12 : -34, C.ink, hold ? 'right' : 'left');
      if (t >= T.ask) mapLabel(FOUND, '291 km (YAKLAŞIK)', ease.enter(seg(t, T.ask + 0.3, 0.4)) * (1 - seg(t, T.loop0, 0.12)), 34, 16, C.ink, 'left');
      if (t >= T.hero) {
        const u = ease.enter(seg(t, T.hero, 0.45)), red = t < T.ask, col = red ? C.red : C.ink;
        G.line([NEAR, geoInterpolate(NEAR, FOUND)(u)], { color: col, w: 10 }); if (u > 0.95) G.ringAt(FOUND, 1, 20, col);
        if (G.visible(NEAR)) { const q = G.proj(NEAR); ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
        if (t >= T.n291 - 0.04 && t < T.ask + 0.3 && G.visible(MID)) {
          const q = G.proj(MID), k = ease.enter(seg(t, T.n291 - 0.04, 0.3)) * (1 - ease.exit(seg(t, T.ask, 0.3)));
          setFont(ctx, F.head(72)); const tw = ctx.measureText('291 km').width, x0 = Math.max(SAFE.x0 + 10, Math.min(SAFE.x1 - tw - 10, q[0] + 50));
          ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, q[1] - 62, tw + 20, 78); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText('291 km', x0, q[1] + 2); ctx.restore();
          chip('(YAKLAŞIK)', x0, q[1] + 56, k, 'left', col, 40);
        }
      }
    }
    // kum fırtınası: ekran boyunca soldan sağa kum çizgileri
    const st = t < T.storm - 0.1 ? 0 : t < T.turbe ? ease.enter(seg(t, T.storm - 0.1, 0.5)) : 1 - ease.exit(seg(t, T.turbe, 0.9));
    if (st > 0) {
      ctx.save(); ctx.globalAlpha = st; ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
      for (const [px, py, sp, len] of sand) { const x = ((px + t * sp * 0.9) % 1) * (W + 300) - 150, y = STAGE_TOP + 40 + py * 1100 + Math.sin(t * 3 + px * 20) * 12; ctx.lineWidth = 1.6 + sp; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + len * 0.08); ctx.stroke(); }
      ctx.fillStyle = `rgba(139,133,119,${0.18 * st})`; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
      ctx.restore();
    }
    ctx.restore();
    return null;
  }

  // ——— üst katman: simgeler, telefon çipleri, takvimler (mağara sahnesi) ———
  function overlayA(t, dx) {
    if (t < L.l03.t0 - 0.1 || t >= T.whip1) return;
    ctx.save(); ctx.translate(dx, 0);
    // simgeler: saat, takvim, güneş; her biri kendi kelimesinde gelir ve üstü çizilir (l03), l05'te çekilir
    const iconsOut = 1 - ease.exit(seg(t, T.wake - 0.35, 0.3));
    [['clock', T.saat], ['calendar', T.takvim], ['sun', T.gun]].forEach(([k, tk], i) => {
      const u = ease.enter(seg(t, tk - 0.04, 0.3)); if (u <= 0 || iconsOut <= 0) return;
      ctx.save(); ctx.globalAlpha = iconsOut; ctx.translate(250 + i * 230, 850); ctx.scale(u, u); drawIcon(ctx, 150, k, ease.state(seg(t, tk + 0.25, 0.35))); ctx.restore();
    });
    // telefon: üç çağrı çipi (l04)
    [['UYANINCA', T.wake], ['YEMEKTE', T.eat], ['UYUMADAN ÖNCE', T.sleep]].forEach(([s, tk], i) => {
      const u = ease.enter(seg(t, tk - 0.04, 0.3)); if (u <= 0) return; const out = 1 - ease.exit(seg(t, L.l05.t0, 0.3));
      chip(s, [100, 330, 545][i], 790, u * out, 'left', C.ink, 40);
    });
    // iki takvim yaprağı (l06) ve aradaki 25 gün (l07'de düşer)
    if (t >= T.aug - 0.06) {
      const ua = ease.enter(seg(t, T.aug - 0.04, 0.35)), ub = ease.enter(seg(t, T.sep - 0.04, 0.35));
      const outC = 1 - ease.exit(seg(t, T.whip0 - 0.1, 0.35));
      ctx.save(); ctx.globalAlpha = outC;
      ctx.save(); ctx.translate(215, 770 + 30 * (1 - ua)); ctx.globalAlpha *= ua; drawCalendar(ctx, 200, '20', 'AĞUSTOS'); ctx.restore();
      if (ua > 0) chip('SIFFRE', 215, 1060, ua * outC, 'center', C.ink, 40);
      if (ub > 0) { ctx.save(); ctx.translate(805, 770 + 30 * (1 - ub)); ctx.globalAlpha *= ub; drawCalendar(ctx, 200, '14', 'EYLÜL'); ctx.restore(); chip('GERÇEK', 805, 1060, ub * outC, 'center', C.ink, 40); }
      // 25 gün: 5 × 5 kare; 14 Eylül gelince belirir, l07'de birer birer düşer
      if (t >= T.sep) {
        for (const [c, r, sw] of days) {
          const i = r * 5 + c, a = ease.enter(seg(t, T.sep + 0.2 + i * 0.025, 0.25));
          const t0 = T.lost25 + i * ((L.l07.end - T.lost25 + 0.2) / 25), dt = Math.max(0, t - t0);
          const y = 790 + r * 46 + 600 * dt * dt, x = 400 + c * 46 + sw * 120 * dt, rot = sw * 2.4 * dt, fa = 1 - seg(dt, 0.35, 0.4);
          if (a <= 0 || fa <= 0) continue;
          ctx.save(); ctx.globalAlpha *= a * fa; ctx.translate(x + 18, y + 18); ctx.rotate(rot); ctx.fillStyle = C.paper; ctx.fillRect(-18, -18, 36, 36); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(-18, -18, 36, 36); ctx.fillStyle = C.ink; ctx.fillRect(-18, -18, 36, 8); ctx.restore();
        }
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function chip(s, x, y, a = 1, al = 'left', col = C.ink, fs = 32) {
    if (a <= 0) return; setFont(ctx, F.mono(fs)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - fs, tw + 20, fs + 14); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }

  // ——— büyüteç ———
  function roundel(t, kind, R = ROUND, k = 1) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'sand') {
      // kumda kaybolan iz: dalgalı kum çizgileri, izler rüzgârla silinir
      ctx.strokeStyle = 'rgba(139,133,119,0.7)'; ctx.lineWidth = 1.4;
      for (let y = -110; y < 120; y += 12) { ctx.beginPath(); for (let x = -130; x <= 130; x += 10) { const yy = y + Math.sin(x * 0.05 + y) * 4; x === -130 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
      ctx.save(); ctx.translate(-104, 40); ctx.rotate(-0.35); drawFootprints(ctx, 30, 8, 0.45 + 0.1 * Math.sin(t * rq(0.6) * 6.283), 0.12, 2); ctx.restore();
    } else if (kind === 'phone') {
      ctx.save(); ctx.translate(-20, 150); drawFigure(ctx, SIFFRE_CARD, { arms: 'phone', lamp: 0.6 }, 290); ctx.restore(); ctx.save(); ctx.translate(70, 110); drawPhone(ctx, 70, Math.abs(Math.sin(t * 40))); ctx.restore();
    } else if (kind === 'runner') {
      ctx.save(); ctx.translate(-10, 190); drawFigure(ctx, PROSPERI_CARD, { run: t }, 320); ctx.restore();
      ctx.strokeStyle = 'rgba(139,133,119,0.7)'; ctx.lineWidth = 1.4; for (let y = 120; y < 140; y += 8) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
    } else if (kind === 'storm') {
      ctx.save(); ctx.translate(0, 190); drawFigure(ctx, PROSPERI_CARD, { walk: t, weary: 0.6, arms: 'shade' }, 320); ctx.restore();
      ctx.strokeStyle = C.ink; for (let i = 0; i < 26; i++) { const x = ((i * 0.137 + t * 0.9) % 1) * 300 - 150, y = -110 + (i * 37) % 220; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y + 3); ctx.stroke(); }
    } else if (kind === 'shrine') {
      ctx.save(); ctx.translate(0, 100); drawShrine(ctx, 190); ctx.restore();
      for (let i = 0; i < 3; i++) { const ph = (t * rq(1.6) + i / 3) % 1; ctx.save(); ctx.translate(-70 + i * 60 + Math.sin(t * 2 + i) * 10, -70 + Math.cos(t * 2.4 + i) * 8); drawBat(ctx, 48, ph); ctx.restore(); }
    } else if (kind === 'girl') {
      ctx.save(); ctx.translate(-40, 160); drawFigure(ctx, GIRL_CARD, { arms: 'down' }, 260); ctx.restore();
      ctx.save(); ctx.translate(30, 115); drawGoat(ctx, 85, (t * rq(0.8)) % 1); ctx.restore();
    } else if (kind === 'weary') {
      ctx.save(); ctx.translate(0, 190); drawFigure(ctx, PROSPERI_CARD, { walk: t * 0.6, weary: 1 }, 320); ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const S1 = [[0, 'sand'], [L.l02.t0, null], [T.wake - 0.3, 'phone'], [L.l05.t0, null], [T.adam - 0.1, 'runner'], [T.storm - 0.1, 'storm'], [T.turbe - 0.1, 'shrine'], [T.tuareg - 0.1, 'girl'], [L.l13.t0, 'weary'], [T.cmp0, null], [T.loop0 + 0.2, 'sand']];
  function sched(t, S) {
    let i = -1; for (let k = 0; k < S.length; k++) if (t >= S[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S[i], prev = i > 0 ? S[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: i === 0 ? 1 : ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(62); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.t130, 'sasirma', 'saskin'], [T.t130 + 1.3, 'ayakta', 'notr'], [T.saat, 'ayakta', 'dusunceli'], [T.aug, 'ayakta', 'notr'], [T.oysa, 'sasirma', 'saskin'],
    [T.lost25, 'ayakta', 'dusunceli'], [T.adam, 'ayakta', 'notr'], [T.storm, 'ayakta', 'dusunceli'], [T.dz, 'sasirma', 'saskin'], [T.dz + 1.3, 'ayakta', 'dusunceli'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'notr'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[L.l07.end + 0.05, T.whip0 + 0.1, 'Nereye gittiler?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(40)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - 300;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  // sayı yalnız söylendiği kelimede açılır: önceki karelerde yerinde ___ durur
  const MASKS = { l02: [['130', T.t130]], l06: [['20', T.aug], ['14', T.sep]], l07: [['25', T.lost25]], l13: [['15', T.kilo]], l15: [['25', T.s25]], l16: [['9', T.nine], ['291', T.n291]] };
  const CARD16 = L.l16.text + ' ' + L.l17.text;
  function masked(id, text, t) {
    const ws = text.split(' '), used = new Set();
    for (const [tok, tm] of MASKS[id] || []) {
      if (t >= tm - 0.04) { const j = ws.findIndex((w, k) => !used.has(k) && w.replace(/[^0-9]/g, '') === tok && /^\d/.test(w)); if (j >= 0) used.add(j); continue; }
      const j = ws.findIndex((w, k) => !used.has(k) && /^\d/.test(w) && w.match(/^\d+/)[0] === tok);
      if (j >= 0) { used.add(j); ws[j] = '___' + ws[j].slice(tok.length).replace(/^[0-9.,]+/, ''); }
    }
    return ws.join(' ');
  }
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const card = ln.id === 'l16' || ln.id === 'l17';
    const txt = card ? masked('l16', CARD16, t) : masked(ln.id, ln.text, t);
    const p = ease.enter(seg(t, (card ? L.l16.t0 : ln.t0) - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.head(66)); revealText(ctx, '25 GÜN mü, 291 KM mi?', SAFE.x0, 670, 66, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(40)); revealText(ctx, label, SAFE.x0, 590, 40, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  const dayNow = t => (t < T.lostW ? 1 : 1 + Math.min(8, Math.floor(wanderU(t) * 8.999)));
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pIn = id => Math.max(0.35, ease.enter(seg(t, L[id].t0 - 0.06, 0.35)));
    if (t < L.l08.t0 - 0.06) {
      if (t < L.l03.t0) { const d = t < L.l02.t0 + 1.2 ? 0 : Math.round(depthAt(t)); row({ label: 'MICHEL SIFFRE · 1962', num: String(t >= T.t130 - 0.04 ? 130 : Math.min(129, d)), unit: 'metre', right1: 'ALPLER', right2: 'BUZUL MAĞARASI', p: pIn('l02') }); return; }
      if (t < L.l05.t0) { row({ label: 'MICHEL SIFFRE · 1962', num: '130', unit: 'metre altında', right1: t >= T.takvim ? 'SAAT YOK · TAKVİM YOK' : t >= T.saat ? 'SAAT YOK' : '', right2: t >= T.gun ? 'GÜN IŞIĞI YOK' : '' }); return; }
      if (t < L.l06.t0) { row({ label: 'MICHEL SIFFRE · 1962', num: 'İki', unit: 'ay', right1: '16 TEMMUZ', right2: 'İNDİ' }); return; }
      if (t < L.l07.t0) { row({ label: "SIFFRE'NİN HESABI", num: t >= T.aug - 0.04 ? '20 Ağustos' : '', unit: '', right1: t >= T.sep - 0.04 ? 'GERÇEK:' : '', right2: t >= T.sep - 0.04 ? '14 EYLÜL' : '' }); return; }
      row({ label: 'HESABINDAN DÜŞEN', num: t >= T.lost25 - 0.04 ? '25' : '', unit: t >= T.lost25 - 0.04 ? 'gün' : '', right1: '20 AĞUSTOS →', right2: '14 EYLÜL' }); return;
    }
    if (t < L.l09.t0 - 0.06) return;
    if (t < T.cmp0) {
      const p = pIn('l09');
      if (t < L.l10.t0) { row({ label: 'MAURO PROSPERI · 1994', num: 'Sahra', unit: '', right1: t >= T.fas ? 'FAS' : '', right2: t >= T.ultra ? 'ULTRAMARATON' : '', p }); return; }
      if (t < L.l13.t0) { const d = dayNow(t); row({ label: t >= T.dz ? 'CEZAYİR · FARKINDA OLMADAN' : t >= T.turbe ? 'TERK EDİLMİŞ BİR TÜRBE' : '4. ETAP · KUM FIRTINASI', num: t >= T.lostW ? `${d}.` : '1.', unit: 'gün', right1: t >= T.lostW ? 'KAYIP' : '', right2: '', p }); return; }
      row({ label: 'DOKUZ GÜNDE', num: t >= T.kilo - 0.04 ? '15' : '', unit: t >= T.kilo - 0.04 ? 'kilo verdi' : '', right1: 'DOKTOR', right2: 'RAPORUNA GÖRE', p }); return;
    }
    if (t < L.l15.t0) { row({ label: 'AYNI HARİTA · AYNI ÖLÇEK', num: '', unit: '', right1: 'ALPLER', right2: 'SAHRA', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.p16 - 0.06) { row({ label: 'SIFFRE · YERİNDEN AYRILMADAN', num: t >= T.s25 - 0.04 ? '25' : '', unit: t >= T.s25 - 0.04 ? 'gün kayıp' : '', right1: 'YOL: 0 km', right2: '' }); return; }
    if (t < T.ask) { const on = t >= T.n291 - 0.04; row({ label: t >= T.nine - 0.04 ? 'PROSPERI · 9 GÜNDE' : 'PROSPERI', num: on ? '291' : '', unit: on ? 'km saptı' : '', red: t >= T.hero, right1: 'SIFFRE: 25 GÜN', right2: '0 km', p: Math.max(0.35, ease.enter(seg(t, T.p16 - 0.06, 0.35))) }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Siffre mi, Prosperi mi?', SAFE.x0, 672, 80, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const s = toB(t);
    // A sahnesi: s=0 yerinde, s∈(0,1) sola kayar; döngüde (s∈(1,2)) sağdan girer ve kare 0'a oturur
    // sert kenar: mağara ve küre aynı anda yalnız kendi yarısında çizilir (çift pozlama yok)
    const edge = s < 1 ? W * (1 - s) : W * (2 - s);
    if (s < 1) caveWorld(t, -W * s, t < T.whip0 ? camA(t) : camA(T.whip0), 0, edge);
    if (s > 1) caveWorld(t, W * (2 - s), camOV(t), edge, W);
    if (s > 0 && s < 2) { ctx.save(); ctx.beginPath(); s < 1 ? ctx.rect(edge, 0, W - edge, 1920) : ctx.rect(0, 0, edge, 1920); ctx.clip(); globe(t); ctx.restore(); }
    if (s < 1) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, edge, 1920); ctx.clip(); overlayA(t, -W * s); ctx.restore(); }
    if ((s > 0 && s < 1) || (s > 1 && s < 2)) { ctx.beginPath(); ctx.moveTo(edge, STAGE_TOP); ctx.lineTo(edge, 1920); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    const r1 = sched(t, S1);
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, ['runner', 'storm', 'shrine', 'girl', 'weary'].includes(r1.kind) ? ROUND_B : ROUND, r1.k);
    // kare 0 ve döngü: iki etiket (soru karesinde haritadaki SIFFRE / PROSPERI etiketleri yeter)
    if (t < L.l02.t0 || t >= T.loop0) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.loop0 + 0.3, 0.4));
      chip('PROSPERI', ROUND.x, 1112, kk, 'center', C.ink, 40);
      // Siffre: mağaranın üstünde (kare 0 kamerası), döngüde mağarayla birlikte sağdan girer
      const co = camOV(t), dxs = s > 1 && s < 2 ? W * (2 - s) : 0, q = [(SIF[0] - co.cx) * co.z + 540 + dxs, (SIF[1] - 140 - co.oy) * co.z + CY];
      chip('SIFFRE', q[0], q[1] - 30, t < L.l02.t0 ? kk : 1, 'center', C.ink, 40);
    }
    // takip çağrısı: soru boyunca, döngüden önce söner
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET:', SAFE.x0, 532, kf, 'left', C.ink, 40); chip('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 590, kf, 'left', C.ink, 40); }   // tek satırda 864 px: güvenli alana sığmaz
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

// "Uçuş" şablonu (Hangisi daha şaşırtıcı?): 1958–59 Hacienda uçuşu (Cessna 172, 64 gün 22 saat yere inmeden) ve ebabil
// (Apus apus, ~40 g; kayıt cihazlarına göre bazıları 10 ay hiç inmiyor). Omurga: gravür bir YIL ÇEMBERİ (dairesel takvim,
// Ocak tepede, saat yönünde). Kare 0: gökte büyük çember, üstünde uçak ve ebabil. A: kamera yere iner; çöl yolu, kalkış,
// kamyondan hortumla yakıt, yemek ve su, gece otopilot, iniş; çember sol altta küçülür ve uçağın yayı günlerle dolar.
// B: gökte büyük ebabil (40 g, sırtında kayıt cihazı), sonra gravür küre: İsveç → Afrika → İsveç (şematik), ay sayacı.
// Kıyas: çember büyür; 65 günlük yay ebabilin 300 günlük yayına kopya kopya dizilir (dorukta kırmızı, ×4,6).
// Anlatım saattir (yolculuk_core.buildYolTimeline); her şey t'nin saf fonksiyonudur.
import { geoInterpolate } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, mixCam } from '../globe.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const SIFIR = { x: 872, y: 1412, H: 92 };
const RING_BIG = { x: 540, y: 1072, R: 262 };
const RING_MINI = { x: 190, y: 1185, R: 96 };
const GROUND = 1332, GROUND_OFF = 2380;   // A'da yer çizgisi; kare 0 ve kıyasta kamera gökte (yer kadraj dışında)
const PLANE_X = 590, PLANE_L = 340;
// yıl: gün (0 = 1 Ocak) → açı; Ocak tepede, saat yönünde
const ang = d => -Math.PI / 2 + (2 * Math.PI * d) / 365;
const MONTH0 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const MONTHS = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];
const PLANE_D0 = 337, PLANE_DAYS = 64.93;   // 4 Aralık 1958 → 7 Şubat 1959
const SWIFT_D0 = 221, SWIFT_DAYS = 300;     // ~10 Ağustos → ~6 Haziran (anlatımdaki "yaklaşık 300 gün")
const COPIES = SWIFT_DAYS / PLANE_DAYS;     // 4,62
// küre: şematik göç (İsveç → İber → Batı Afrika → Kongo havzası, kış dolaşması, dönüş)
const SWE = [13.2, 55.7];
const ROUTE = [SWE, [9, 52], [3, 47], [-3, 41], [-6, 34], [-9, 25], [-8, 16], [-3, 10], [6, 5], [15, 1],
  [21, -2], [25, 2], [19, 5], [16, -3], [23, -5], [27, 0],
  [20, 9], [12, 16], [5, 24], [2, 33], [5, 41], [9, 48], [12, 53], SWE];
const LEG_S = 9 / 23, LEG_W = 15 / 23;      // ROUTE kesirleri: güney bacağı sonu, kış dolaşması sonu
const CAM_GLOBE = { c: [12, 26], r: 640, cx: 600, cy: 1080 };

function Wn(tl, id, key, nth = 1) {
  const ws = tl.L[id].words.filter(w => w.w.toLocaleLowerCase('tr').startsWith(key.toLocaleLowerCase('tr')));
  if (!ws[nth - 1]) throw new Error(`kelime yok: ${id} ${key} #${nth}`);
  return ws[nth - 1].t0;
}

export function ucusTimes(tl) {
  const { L, W: Wd } = tl;
  return {
    cut: L.l02.t0 - 0.02, b1958: Wd('l02', 'bin'), havalan: Wd('l02', 'havalanıyor'), inme: Wd('l03', 'inmeden'),
    alcak: Wd('l04', 'alçaktan'), kamyon: Wd('l04', 'kamyondan'), hortum: Wd('l04', 'hortum'),
    yemek: Wd('l05', 'yemek'), banyo: Wd('l05', 'banyo'),
    d36: Wd('l06', 'otuz'), uyu: Wd('l06', 'uyuyakalıyor'), oto: Wd('l06', 'otomatik'),
    n64: Wd('l07', 'altmış'), n22: Wd('l07', 'yirmi'), land: Wd('l07', 'iniyorlar'),
    whip0: L.l07.end + 0.95, whip1: L.l08.t0 + 0.55, kus: Wd('l08', 'kuş'),
    kirk: Wd('l09', 'kırk'), isvec: Wd('l10', 'isveçli'), kayit: Wd('l10', 'kayıt'),
    gl0: L.l11.t0 - 0.25, gl1: L.l11.t0 + 0.55, afrika: Wd('l11', 'afrika'), kis: Wd('l11', 'kışı'),
    avlan: Wd('l12', 'avlanıyorlar'), uyku: Wd('l12', 'uyu'),
    on10: Wd('l13', 'on'), inmiyor: Wd('l13', 'inmiyor'),
    cmp0: L.l14.t0 - 0.1, cmp1: L.l14.end + 0.25,
    n65: Wd('l15', 'altmış'), n10: Wd('l15', 'on'), n300: Wd('l15', 'üç'),
    p16: L.l16.t0, kirk2: Wd('l16', 'kırk'), hero: L.l17.t0 - 0.05, nered: Wd('l17', 'neredeyse'), bes: Wd('l17', 'beş'),
    ask: L.l18.t0, loop0: tl.loop0,
  };
}

// ——— çizim: Cessna 172 (yandan, burun +x), kamyon, ebabil (üstten), termos, damla ———
function drawPlane(ctx, L, t, { night = 0 } = {}) {
  ctx.save(); ctx.scale(L, L); const lw = 1 / L;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // dikey kuyruk
  ctx.beginPath(); ctx.moveTo(-0.30, -0.08); ctx.lineTo(-0.43, -0.29); ctx.lineTo(-0.50, -0.29); ctx.lineTo(-0.48, -0.05); ctx.closePath();
  ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3 * lw; ctx.strokeStyle = C.ink; ctx.stroke();
  // gövde
  ctx.beginPath(); ctx.moveTo(0.48, 0.0); ctx.lineTo(0.43, -0.06); ctx.lineTo(0.30, -0.07); ctx.lineTo(0.20, -0.155); ctx.lineTo(0.02, -0.165);
  ctx.bezierCurveTo(-0.15, -0.14, -0.30, -0.09, -0.47, -0.065); ctx.lineTo(-0.48, -0.035); ctx.bezierCurveTo(-0.30, -0.02, -0.10, 0.04, 0.04, 0.055);
  ctx.lineTo(0.36, 0.05); ctx.lineTo(0.46, 0.03); ctx.closePath();
  ctx.fillStyle = C.paper; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1.2 * lw;
  for (let x = -0.5; x < 0.5; x += 0.018) { ctx.beginPath(); ctx.moveTo(x, 0.0); ctx.lineTo(x + 0.03, 0.06); ctx.stroke(); }
  // gövde boyunca iki ince şerit (Hacienda boyası yerine yalın çizgi)
  ctx.lineWidth = 2.2 * lw; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(0.44, -0.035); ctx.bezierCurveTo(0.1, -0.03, -0.25, -0.055, -0.47, -0.05); ctx.stroke();
  ctx.restore();
  ctx.lineWidth = 3 * lw; ctx.strokeStyle = C.ink; ctx.stroke();
  // yatay kuyruk
  ctx.beginPath(); ctx.moveTo(-0.33, -0.06); ctx.lineTo(-0.50, -0.07); ctx.lineWidth = 6 * lw; ctx.stroke();
  // kabin camları
  ctx.beginPath(); ctx.moveTo(0.19, -0.135); ctx.lineTo(0.035, -0.145); ctx.lineTo(0.035, -0.07); ctx.lineTo(0.17, -0.07); ctx.closePath();
  ctx.fillStyle = night > 0.5 ? '#D9C88F' : '#CFC7B4'; ctx.fill(); ctx.lineWidth = 2.4 * lw; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.01, -0.145); ctx.lineTo(-0.11, -0.13); ctx.lineTo(-0.11, -0.07); ctx.lineTo(-0.01, -0.07); ctx.closePath(); ctx.fill(); ctx.stroke();
  // üst kanat (yandan ince profil) ve dikme
  ctx.beginPath(); ctx.moveTo(0.23, -0.168); ctx.bezierCurveTo(0.15, -0.205, -0.02, -0.2, -0.08, -0.172); ctx.lineTo(0.23, -0.168);
  ctx.fillStyle = C.ink; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0.02, 0.045); ctx.lineTo(0.13, -0.17); ctx.lineWidth = 3 * lw; ctx.stroke();
  // iniş takımı
  ctx.beginPath(); ctx.moveTo(0.05, 0.05); ctx.lineTo(0.03, 0.10); ctx.moveTo(0.36, 0.05); ctx.lineTo(0.36, 0.10); ctx.lineWidth = 3 * lw; ctx.stroke();
  for (const [x, r] of [[0.03, 0.032], [0.36, 0.026]]) { ctx.beginPath(); ctx.arc(x, 0.105, r, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
  // pervane: dönen bıçak (sürekli) + ince disk
  ctx.beginPath(); ctx.ellipse(0.495, 0.0, 0.012, 0.13, 0, 0, Math.PI * 2); ctx.lineWidth = 1.2 * lw; ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.stroke();
  const pb = Math.sin(t * 47) * 0.13; ctx.beginPath(); ctx.moveTo(0.495, -pb); ctx.lineTo(0.495, pb); ctx.lineWidth = 4 * lw; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.restore();
}
// kabin camının yeri (uçak koordinatında, L ile çarpılır)
const COCKPIT = [0.11, -0.11];

function drawTruck(ctx, L, t, spin) {
  ctx.save(); ctx.scale(L, L); const lw = 1 / L; ctx.lineJoin = 'round';
  // tank
  ctx.beginPath(); ctx.roundRect(-0.5, -0.40, 0.66, 0.29, 0.13); ctx.fillStyle = C.paper; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = 1.3 * lw; for (let y = -0.38; y < -0.1; y += 0.022) { ctx.beginPath(); ctx.moveTo(-0.5, y); ctx.lineTo(0.2, y); ctx.stroke(); } ctx.restore();
  ctx.lineWidth = 3 * lw; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.17, -0.40); ctx.lineTo(-0.17, -0.11); ctx.lineWidth = 2 * lw; ctx.stroke();
  // kabin
  ctx.beginPath(); ctx.moveTo(0.20, -0.08); ctx.lineTo(0.20, -0.40); ctx.lineTo(0.36, -0.40); ctx.lineTo(0.44, -0.24); ctx.lineTo(0.52, -0.22); ctx.lineTo(0.52, -0.08); ctx.closePath();
  ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3 * lw; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.25, -0.36); ctx.lineTo(0.34, -0.36); ctx.lineTo(0.40, -0.25); ctx.lineTo(0.25, -0.25); ctx.closePath(); ctx.fillStyle = '#CFC7B4'; ctx.fill(); ctx.lineWidth = 2.2 * lw; ctx.stroke();
  // şasi
  ctx.beginPath(); ctx.moveTo(-0.52, -0.09); ctx.lineTo(0.52, -0.09); ctx.lineWidth = 5 * lw; ctx.stroke();
  // makara (hortumun çıktığı yer)
  ctx.beginPath(); ctx.arc(-0.05, -0.44, 0.045, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5 * lw; ctx.stroke();
  // tekerlekler (dönen jant çizgileri)
  for (const x of [-0.36, -0.20, 0.38]) {
    ctx.save(); ctx.translate(x, -0.075); ctx.beginPath(); ctx.arc(0, 0, 0.075, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 0.035, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill();
    ctx.rotate(spin); ctx.beginPath(); ctx.moveTo(-0.035, 0); ctx.lineTo(0.035, 0); ctx.moveTo(0, -0.035); ctx.lineTo(0, 0.035); ctx.lineWidth = 2 * lw; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
const REEL = [-0.05, -0.44];

// ebabil, üstten (baş +x); S = kanat açıklığı. flap: kanat ucunun ileri-geri salınımı (−1..1)
function drawSwift(ctx, S, flap = 0, { logger = 0 } = {}) {
  ctx.save(); ctx.scale(S, S); const lw = 1 / S; ctx.lineJoin = 'round';
  const k = 0.82 + 0.18 * Math.cos(flap * Math.PI), sw = 0.06 * Math.sin(flap * Math.PI);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0.05, 0.02 * s);
    ctx.bezierCurveTo(0.06, 0.20 * s * k, -0.04 + sw, 0.42 * s * k, -0.20 + sw, 0.50 * s * k);
    ctx.bezierCurveTo(-0.13 + sw, 0.40 * s * k, -0.06, 0.18 * s * k, -0.05, 0.03 * s);
    ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
    // kanat üstünde ince açık tarama (gravür ışığı)
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(236,229,213,0.35)'; ctx.lineWidth = 1.4 * lw;
    for (let i = 0; i < 9; i++) { const u = i / 9; ctx.beginPath(); ctx.moveTo(0.02 - u * 0.05, (0.06 + u * 0.4) * s * k); ctx.lineTo(-0.06 - u * 0.12 + sw * u, (0.08 + u * 0.42) * s * k); ctx.stroke(); }
    ctx.restore();
  }
  // gövde, baş, çatal kuyruk
  ctx.beginPath(); ctx.ellipse(0.0, 0, 0.17, 0.055, 0, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  ctx.beginPath(); ctx.arc(0.16, 0, 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-0.12, -0.025); ctx.lineTo(-0.27, -0.06); ctx.lineTo(-0.19, 0); ctx.lineTo(-0.27, 0.06); ctx.lineTo(-0.12, 0.025); ctx.closePath(); ctx.fill();
  // sırt: kayıt cihazı (açık renk küçük kutu)
  if (logger > 0) { ctx.save(); ctx.globalAlpha = logger; ctx.beginPath(); ctx.roundRect(-0.045, -0.018, 0.05, 0.036, 0.008); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 1.5 * lw; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function drawThermos(ctx, s) {
  ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.roundRect(-0.22, -0.5, 0.44, 1.0, 0.1); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3 / s; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.fillRect(-0.26, -0.62, 0.52, 0.16); ctx.fillRect(-0.22, 0.05, 0.44, 0.08); ctx.restore();
}
function drawDrop(ctx, s) {
  ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -0.55); ctx.bezierCurveTo(0.35, -0.05, 0.42, 0.5, 0, 0.5); ctx.bezierCurveTo(-0.42, 0.5, -0.35, -0.05, 0, -0.55);
  ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3 / s; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.14, 0.05); ctx.bezierCurveTo(-0.16, 0.25, -0.05, 0.32, 0.05, 0.32); ctx.lineWidth = 2 / s; ctx.stroke(); ctx.restore();
}

export async function makeUcusRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = ucusTimes(tl);
  const rq = r => Math.round(r * D) / D;   // sürekli döngüler: film süresine tam bölünen hız (son kare = kare 0)
  const rnd = mulberry32(62);
  const clouds = Array.from({ length: 9 }, () => [rnd(), lerp(STAGE_TOP + 40, 1250, rnd()), lerp(120, 260, rnd()), lerp(0.012, 0.03, rnd()), 3 + Math.floor(rnd() * 3)]);
  const stars = Array.from({ length: 46 }, () => [rnd() * W, lerp(STAGE_TOP + 20, 1240, rnd()), rnd()]);
  const mesas = Array.from({ length: 7 }, (_, i) => [i * 420 + rnd() * 120, lerp(70, 150, rnd()), lerp(160, 300, rnd())]);
  const shrubs = Array.from({ length: 14 }, (_, i) => [i * 160 + rnd() * 90, lerp(0.6, 1.2, rnd())]);
  const bugs = Array.from({ length: 14 }, () => [rnd() * 6.283, lerp(40, 110, rnd()), rnd()]);

  // ——— A: yer hızı (px/sn) ve kaydırma; kare başına sabit adımla toplanır (saf, deterministik) ———
  const V = 430;
  const speed = t => {
    if (t < L.l02.t0 + 0.5) return 0;
    const up = ease.state(seg(t, L.l02.t0 + 0.5, T.havalan + 0.6 - L.l02.t0 - 0.5));
    const down = 1 - ease.state(seg(t, T.land + 0.3, 1.9));
    return V * up * down;
  };
  const SX = (() => { const dt = 1 / 120, n = Math.ceil((T.whip1 + 1) / dt) + 2, a = new Float32Array(n); for (let i = 1; i < n; i++) a[i] = a[i - 1] + speed((i - 0.5) * dt) * dt; return a; })();
  const sxAt = t => { const k = Math.min(SX.length - 2, Math.max(0, Math.floor(t * 120))); return lerp(SX[k], SX[k + 1], clamp01(t * 120 - k)); };
  const SX_END = sxAt(T.whip1 + 0.9);
  const groundY = t => (t < T.cut ? GROUND_OFF : t < T.whip0 ? GROUND : lerp(GROUND, GROUND_OFF, ease.state(seg(t, T.whip0, T.whip1 - T.whip0))));
  // uçağın yere yüksekliği (tekerlek altı, px)
  const CRUISE = 400, LOW = 280;
  function alt(t) {
    let h = CRUISE * ease.state(seg(t, T.havalan - 0.1, 2.0));
    h = lerp(h, LOW, ease.state(seg(t, T.alcak - 0.25, 1.0)));
    h = lerp(h, CRUISE, ease.state(seg(t, L.l06.t0 - 0.1, 1.3)));
    return lerp(h, 0, ease.state(seg(t, T.land - 0.35, 1.7)));
  }
  const pitch = t => { const e = 0.04, v = (alt(t + e) - alt(t - e)) / (2 * e); return Math.max(-0.12, Math.min(0.1, -v * 0.0003)) - 0.06 * ease.state(seg(t, T.land - 0.1, 0.5)) * (1 - ease.state(seg(t, T.land + 0.9, 0.5))); };
  const nightK = t => (t >= L.l06.t0 - 0.05 && t < L.l07.t0 - 0.01 ? 1 : 0);   // gece sert kesmeyle başlar ve biter
  // kamyon ekran x'i: yetişir, hortum süresince uçağın altında, gecede geride kalır
  const truckX = t => lerp(lerp(-320, PLANE_X - 36, ease.enter(seg(t, T.alcak - 0.35, 1.3))), -420, ease.exit(seg(t, L.l06.t0 + 0.05, 1.1)));
  const hoseK = t => ease.enter(seg(t, T.hortum - 0.08, 0.5)) * (1 - ease.exit(seg(t, L.l06.t0 - 0.1, 0.45)));
  // gün sayacı (yerden kopuş → 36 → 64 → 64 gün 22 saat); söylenen kelimeye kilitli
  const dayA = t => (t < L.l03.t0 ? 0 : t < T.d36 ? lerp(0, 36, seg(t, L.l03.t0, T.d36 - L.l03.t0)) : t < L.l06.end ? 36 : t < T.n64 ? lerp(36, 64, seg(t, L.l06.end, T.n64 - L.l06.end)) : lerp(64, PLANE_DAYS, seg(t, T.n22, 0.4)));
  // ebabil ayları (göç başı → "on" kelimesi)
  const monB = t => (t < L.l11.t0 ? 0 : lerp(0, 10, seg(t, L.l11.t0, T.on10 - 0.04 - L.l11.t0)));
  const routeU = t => (t < T.gl1 ? 0 : t < T.kis + 0.5 ? LEG_S * ease.state(seg(t, T.gl1, T.kis + 0.5 - T.gl1))
    : t < L.l13.t0 ? lerp(LEG_S, LEG_W, seg(t, T.kis + 0.5, L.l13.t0 - T.kis - 0.5)) : lerp(LEG_W, 1, ease.state(seg(t, L.l13.t0, T.inmiyor + 0.3 - L.l13.t0))));
  const ROUTE_D = (() => { const out = []; for (let i = 0; i < ROUTE.length - 1; i++) for (let k = 0; k < 12; k++) out.push(geoInterpolate(ROUTE[i], ROUTE[i + 1])(k / 12)); out.push(SWE); return out; })();
  const routeAt = u => { const f = u * (ROUTE_D.length - 1), i = Math.min(ROUTE_D.length - 2, Math.floor(f)); return geoInterpolate(ROUTE_D[i], ROUTE_D[i + 1])(f - i); };

  // ——— tek dünya: gök (bulutlar), A'da yer; kesik çizgili kayma yok. A'nın sonunda kamera göğe kalkar (yer aşağı iner),
  // küre aşağıdan yükselir ve büyük ebabil İsveç noktasına küçülerek iner; kıyasta küre aşağı iner, çember büyür ———
  const globeCy = t => CAM_GLOBE.cy + 1700 * (1 - ease.state(seg(t, T.gl0, T.gl1 - T.gl0))) + 1700 * ease.state(seg(t, T.cmp0, T.cmp1 - T.cmp0));
  function globeCam(t) { return { ...CAM_GLOBE, r: CAM_GLOBE.r * (1 + 0.08 * seg(t, T.gl1, T.cmp0 - T.gl1)), cy: globeCy(t) }; }

  function cloudsLayer(t, dx) {
    ctx.save(); ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineCap = 'round';
    for (const [x0, y, w, v, n] of clouds) {
      const x = ((x0 - t * rq(v)) % 1 + 1) % 1 * (W + 600) - 300 + dx;
      for (let i = 0; i < n; i++) { const ww = w * (1 - Math.abs(i - (n - 1) / 2) * 0.28); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x - ww / 2 + i * 9, y + i * 11); ctx.lineTo(x + ww / 2 + i * 9, y + i * 11); ctx.stroke(); }
    }
    ctx.restore();
  }

  function worldA(t, dx) {
    const gY = groundY(t), sx = sxAt(Math.min(t, T.whip1 + 0.9)), nk = nightK(t);
    ctx.fillStyle = C.paper; ctx.fillRect(dx, STAGE_TOP, W, 1920 - STAGE_TOP);
    cloudsLayer(t, dx);
    if (gY < 1920) {
      // uzak masalar (yavaş paralaks)
      ctx.save(); ctx.translate(dx, 0);
      for (const [x0, h, w] of mesas) { const per = 7 * 420, x = ((x0 - sx * 0.12) % per + per) % per - 300; ctx.beginPath(); ctx.moveTo(x, gY); ctx.lineTo(x + w * 0.18, gY - h); ctx.lineTo(x + w * 0.82, gY - h); ctx.lineTo(x + w, gY); ctx.closePath(); ctx.fillStyle = '#E2D9C6'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
      // yer: yol bandı + kesik orta çizgi + çöl taraması
      ctx.fillStyle = '#E6DECC'; ctx.fillRect(0, gY, W, 1920 - gY);
      ctx.save(); ctx.beginPath(); ctx.rect(0, gY + 46, W, 1920); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.2)'; ctx.lineWidth = 1.2;
      const hs = ((-sx) % 16 + 16) % 16; for (let x = -300 + hs; x < W + 300; x += 16) { ctx.beginPath(); ctx.moveTo(x, gY + 46); ctx.lineTo(x - 260, gY + 600); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = '#D8CFBB'; ctx.fillRect(0, gY + 6, W, 40);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, gY); ctx.lineTo(W, gY); ctx.moveTo(0, gY + 46); ctx.lineTo(W, gY + 46); ctx.stroke();
      ctx.lineWidth = 3; ctx.setLineDash([34, 30]); ctx.lineDashOffset = sx; ctx.beginPath(); ctx.moveTo(0, gY + 26); ctx.lineTo(W, gY + 26); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      // çalılar (yer hızında)
      for (const [x0, s] of shrubs) { const per = 14 * 160, x = ((x0 - sx) % per + per) % per - 120, y = gY + 80 + s * 30; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + k * 9 * s, y - 22 * s - Math.abs(k) * -3); ctx.stroke(); } }
      // havalimanı: kalkışta (dünya x 0) ve inişte (dünya x SX_END), aynı yer: Las Vegas
      for (const ax of [0, SX_END]) {
        const x = ax - sx + PLANE_X; if (x < -900 || x > W + 900) continue;
        ctx.fillStyle = '#CFC7B4'; ctx.fillRect(x - 700, gY - 4, 1400, 10); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x - 700, gY - 4, 1400, 10);
        const tx = x + 290; ctx.fillStyle = C.paper; ctx.fillRect(tx - 22, gY - 170, 44, 166); ctx.strokeRect(tx - 22, gY - 170, 44, 166);
        ctx.beginPath(); ctx.moveTo(tx - 46, gY - 170); ctx.lineTo(tx + 46, gY - 170); ctx.lineTo(tx + 34, gY - 214); ctx.lineTo(tx - 34, gY - 214); ctx.closePath(); ctx.fillStyle = '#CFC7B4'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke();
        chipRaw('LAS VEGAS', Math.min(tx + 40, SAFE.x1 - 10), gY - 236, 1, 'right', C.ink, 40);
      }
      ctx.restore();
      // gece: gök ve yer kararır, yıldızlar ve ay
      if (nk > 0) {
        ctx.save(); ctx.globalAlpha = nk; ctx.fillStyle = 'rgba(28,27,24,0.84)'; ctx.fillRect(dx, STAGE_TOP, W, 1920 - STAGE_TOP);
        for (const [x, y, ph] of stars) if (y < gY - 20) { const a = 0.5 + 0.5 * Math.sin(t * 3 + ph * 20); ctx.fillStyle = `rgba(236,229,213,${0.35 + 0.5 * a})`; ctx.fillRect(x + dx, y, 3, 3); }
        ctx.beginPath(); ctx.arc(820 + dx, 820, 46, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.beginPath(); ctx.arc(842 + dx, 806, 42, 0, Math.PI * 2); ctx.fillStyle = 'rgb(56,54,49)'; ctx.fill();
        ctx.restore();
      }
    }
    // uçak, kamyon, hortum (yalnız A bölümünde)
    if (t >= T.cut && t < T.whip1 + 0.1) {
      const h = alt(t), py = gY - h - PLANE_L * 0.135, px = PLANE_X + dx;
      // kamyon ve hortum
      const tx = truckX(t) + dx, TL = 290, hk = hoseK(t);
      if (tx > -400 && tx < W + 300 && t >= T.alcak - 0.4) {
        const spin = sx / (0.075 * TL);
        ctx.save(); ctx.translate(tx, gY + 34); drawTruck(ctx, TL, t, spin); ctx.restore();
        if (hk > 0) {
          const a = [tx + REEL[0] * TL, gY + 34 + REEL[1] * TL], b = [px - 0.02 * PLANE_L, py + 0.055 * PLANE_L], e = [lerp(a[0], b[0], hk), lerp(a[1], b[1], hk)];
          const sag = 18 * Math.sin(t * rq(0.9) * 6.283) * hk;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + e[0]) / 2 + sag, (a[1] + e[1]) / 2, e[0], e[1]); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke();
          // akış: hortum boyunca yukarı koşan açık çizgiler
          ctx.setLineDash([10, 18]); ctx.lineDashOffset = -t * 90; ctx.lineWidth = 2.4; ctx.strokeStyle = C.paper; ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
          // termos ve su damlası hortumdan çıkar
          for (const [tk, kind] of [[T.yemek, 'thermos'], [T.banyo, 'drop']]) {
            const u = ease.state(seg(t, tk - 0.05, 0.9)); if (u <= 0 || u >= 1) continue;
            const x = lerp(a[0], b[0], u) + 26, y = lerp(a[1], b[1], u);
            ctx.save(); ctx.translate(x, y); kind === 'thermos' ? drawThermos(ctx, 46) : drawDrop(ctx, 46); ctx.restore();
          }
        }
      }
      ctx.save(); ctx.translate(px, py); ctx.rotate(pitch(t)); drawPlane(ctx, PLANE_L, t, { night: nk }); ctx.restore();
      // gece: kabinden yükselen z harfleri (uyuyakalma) — sürekli
      if (t >= T.uyu - 0.05 && nk > 0.05) {
        setFont(ctx, F.name(40)); ctx.textAlign = 'left';
        for (let i = 0; i < 3; i++) { const ph = ((t - T.uyu) * 0.7 + i / 3) % 1; ctx.fillStyle = `rgba(236,229,213,${(1 - ph) * nk})`; ctx.fillText('z', px + COCKPIT[0] * PLANE_L + 20 + ph * 60, py + COCKPIT[1] * PLANE_L - 20 - ph * 110); }
      }
    }
  }

  function worldB1(t, dx) {
    // kamera göğe kalkarken kuş sağdan girer: boş gök kalmaz
    const in0 = T.whip0 + 0.4;
    if (t < in0 || t >= T.gl1) return;
    let xIn = lerp(1350, 450, ease.enter(seg(t, in0, T.kus + 0.45 - in0)));
    let S = lerp(620, 760, ease.state(seg(t, T.kayit - 0.3, 0.8)));
    let y = 1010 - 40 * ease.state(seg(t, T.kayit - 0.3, 0.8));
    const flap = (t * rq(2.6)) % 1 * 2 - 1;
    let lg = ease.enter(seg(t, T.kayit - 0.05, 0.35));
    // göçün başı: kuş küreye, İsveç noktasına küçülerek iner (nesne kesmenin öbür yanına taşınır)
    const cu = ease.state(seg(t, T.gl0, T.gl1 - T.gl0));
    if (cu > 0) { G.setCam(globeCam(t)); const q = G.proj(SWE); xIn = lerp(xIn, q[0], cu); y = lerp(y, q[1], cu); S = Math.exp(lerp(Math.log(S), Math.log(92), cu)); lg *= 1 - cu; }
    const chipK = 1 - ease.exit(seg(t, T.gl0, 0.3));
    ctx.save(); ctx.translate(xIn + dx, y); drawSwift(ctx, S, flap, { logger: lg }); ctx.restore();
    // 40 g: kuşun yanında
    if (t >= T.kirk - 0.04) chipRaw('40 g', xIn + dx + 0.24 * S, y - 0.06 * S, ease.enter(seg(t, T.kirk - 0.04, 0.3)) * chipK, 'left', C.ink, 56);
    // kayıt cihazı: işaret çizgisi
    if (lg > 0) {
      const lx = xIn + dx - 0.02 * S, ly = y;
      ctx.save(); ctx.globalAlpha = lg; ctx.beginPath(); ctx.moveTo(lx + 0.02 * S, ly + 0.02 * S); ctx.lineTo(lx + 0.12 * S, ly + 0.15 * S); ctx.lineTo(lx + 0.24 * S, ly + 0.15 * S); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      chipRaw('KAYIT CİHAZI', lx + 0.25 * S, ly + 0.15 * S + 14, lg * chipK, 'left', C.ink, 44);
    }
  }

  function worldB2(t, dx) {
    if (t < T.gl0 || t >= T.cmp1) return;
    const cam = globeCam(t);
    G.setCam(cam);
    ctx.save(); ctx.beginPath(); ctx.arc(cam.cx, cam.cy, cam.r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.restore();
    G.draw();
    ctx.save(); ctx.beginPath(); ctx.rect(dx, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    const u = routeU(t), pts = [];
    const n = Math.floor(u * (ROUTE_D.length - 1));
    for (let i = 0; i <= n; i++) pts.push(ROUTE_D[i]);
    const p = routeAt(u); pts.push(p);
    if (u > 0) G.line(pts, { w: 5, dash: [3, 10] });
    G.ringAt(SWE, 1, 18);
    label(SWE, 'İSVEÇ', seg(t, T.gl1 - 0.2, 0.35), 30, 16, 'left');
    if (t >= T.afrika - 0.05) label([18, 14], 'AFRİKA', ease.enter(seg(t, T.afrika - 0.05, 0.4)), 0, 0, 'center');
    label([-26, 33], '(ŞEMATİK)', ease.enter(seg(t, T.afrika + 0.4, 0.4)), 0, 0, 'center', C.graphite);
    // kuş: rotanın başında; baş, gidiş yönüne
    if (G.visible(p) && t >= T.gl1) {
      const q = G.proj(p), q2 = G.proj(routeAt(Math.min(1, u + 0.004))), hd = Math.atan2(q2[1] - q[1], q2[0] - q[0]) || 0;
      // havada avlanma: kuşun çevresinde beliren ve yutulan böcekler (l12)
      if (t >= T.avlan - 0.1 && t < L.l13.t0 + 0.3) for (const [a0, r, ph] of bugs) { const c = (t * rq(0.8) + ph) % 1; if (c > 0.8) continue; const aa = a0 + t * 0.6; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(q[0] + Math.cos(aa) * r * (1 - c), q[1] + Math.sin(aa) * r * (1 - c), 4, 0, Math.PI * 2); ctx.fill(); }
      ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(hd); drawSwift(ctx, 92, (t * rq(2.6)) % 1 * 2 - 1); ctx.restore();
    }
    ctx.restore();
  }
  function label(p, text, u, dx = 18, dy = -14, align = 'left', color = C.ink, fs = 44) {
    if (u <= 0 || !G.visible(p)) return; const q = G.proj(p); setFont(ctx, F.mono(fs)); const tw = ctx.measureText(text).width;
    let x0 = align === 'right' ? q[0] - dx - tw : align === 'center' ? q[0] - tw / 2 : q[0] + dx;
    x0 = Math.max(SAFE.x0 + 10, Math.min(SAFE.x1 - 10 - tw, x0));
    chipRaw(text, x0, q[1] + dy, ease.enter(u), 'left', color, fs);
  }
  function chipRaw(s, x, y, a = 1, al = 'left', col = C.ink, fs = 44) {
    if (a <= 0) return; setFont(ctx, F.mono(fs)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - fs, tw + 20, fs + 14); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }


  // ——— yıl çemberi ———
  function ringGeom(t) {
    const mix = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), R: Math.exp(lerp(Math.log(a.R), Math.log(b.R), u)) });
    if (t < T.cmp0) return t < T.cut ? RING_BIG : RING_MINI;   // kare 0 → A: sert kesme
    // kıyasta yavaş yaklaşma (%5), soruda geri; döngü dikişinde kare 0 ölçüsü
    const g = mix(RING_MINI, RING_BIG, ease.state(seg(t, T.cmp0, T.cmp1 - T.cmp0)));
    const z = 1 + 0.05 * seg(t, T.cmp1, T.ask - T.cmp1) - 0.05 * ease.state(seg(t, T.ask, T.loop0 + 0.6 - T.ask));
    return { ...g, R: g.R * z };
  }
  const arc = (g, r, d0, d1, w, col, dash = null) => {
    if (d1 - d0 < 0.05) return; ctx.beginPath(); ctx.arc(g.x, g.y, r, ang(d0), ang(d1)); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'butt';
    if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  };
  const onRing = (g, r, d) => [g.x + Math.cos(ang(d)) * r, g.y + Math.sin(ang(d)) * r];
  // kare 0 ve döngü: uçak dış izde 4 Aralık'tan, ebabil iç izde Ağustos'tan yavaşça döner (dikişte konum ve hız tutar)
  const ORBIT = 2.2;   // gün/sn
  function ring(t) {
    const g = ringGeom(t), big = clamp01((g.R - 140) / (RING_BIG.R - 140));
    const rP = g.R * 0.82, rS = g.R * 0.6, w = g.R * 0.085;
    ctx.save();
    ctx.beginPath(); ctx.arc(g.x, g.y, g.R + 4, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill();
    // ince eşmerkezli gravür halkalar
    ctx.strokeStyle = 'rgba(139,133,119,0.5)'; ctx.lineWidth = 1.2; for (let r = g.R * 0.36; r < g.R * 0.94; r += g.R * 0.045) { ctx.beginPath(); ctx.arc(g.x, g.y, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(g.x, g.y, g.R, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // çentikler: ay sınırları uzun, her 5 gün kısa (büyükken)
    for (const d of MONTH0) { const a = ang(d); ctx.beginPath(); ctx.moveTo(g.x + Math.cos(a) * g.R * 0.9, g.y + Math.sin(a) * g.R * 0.9); ctx.lineTo(g.x + Math.cos(a) * g.R, g.y + Math.sin(a) * g.R); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    if (big > 0.05) { ctx.globalAlpha = big; for (let d = 0; d < 365; d += 5) { const a = ang(d); ctx.beginPath(); ctx.moveTo(g.x + Math.cos(a) * g.R * 0.96, g.y + Math.sin(a) * g.R * 0.96); ctx.lineTo(g.x + Math.cos(a) * g.R, g.y + Math.sin(a) * g.R); ctx.lineWidth = 1.4; ctx.stroke(); } ctx.globalAlpha = 1; }
    // ay adları: çemberin dışında, ≥ 40 px (yalnız büyükken)
    if (big > 0.6) {
      setFont(ctx, F.mono(44)); ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.globalAlpha = (big - 0.6) / 0.4;
      MONTHS.forEach((m, i) => { const a = ang(MONTH0[i] + 15), x = g.x + Math.cos(a) * (g.R + 50), y = g.y + Math.sin(a) * (g.R + 50) + 15; ctx.fillText(m, x, y); });
      ctx.globalAlpha = 1;
    }
    // izler
    ctx.strokeStyle = 'rgba(139,133,119,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
    for (const r of [rP, rS]) { ctx.beginPath(); ctx.arc(g.x, g.y, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.setLineDash([]);
    // yaylar
    const loopOut = 1 - ease.exit(seg(t, T.loop0, 0.55));
    if (t >= L.l03.t0 && t < T.loop0 + 0.6) {
      const pd = (t < T.cmp0 ? dayA(t) : PLANE_DAYS) * loopOut;
      const planeCol = t >= T.whip0 && t < T.cmp1 ? C.graphite : C.ink;
      arc(g, rP, PLANE_D0, PLANE_D0 + pd, w, planeCol);
      if (t < T.cmp0 && pd > 0.2) { const q = onRing(g, rP, PLANE_D0 + pd); ctx.beginPath(); ctx.arc(q[0], q[1], w * 0.8, 0, Math.PI * 2); ctx.fillStyle = planeCol; ctx.fill(); }
    }
    if (t >= L.l11.t0 && t < T.loop0 + 0.6) {
      const sd = (t < T.cmp0 ? (monB(t) / 10) * SWIFT_DAYS : SWIFT_DAYS) * loopOut;
      const dim = t >= T.hero && t < T.loop0;
      arc(g, rS, SWIFT_D0, SWIFT_D0 + sd, w, dim ? 'rgba(139,133,119,0.55)' : C.ink);
      if (t < T.cmp0 && sd > 0.2) { const q = onRing(g, rS, SWIFT_D0 + sd); ctx.beginPath(); ctx.arc(q[0], q[1], w * 0.8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    }
    // kıyas: l15'te sayılar kendi kelimelerinde yayların yanında
    if (t >= T.cmp1 && t < T.loop0 + 0.3) {
      const k = 1 - ease.exit(seg(t, T.loop0, 0.3));
      if (t >= T.n65 - 0.04) { const q = onRing(g, (rP + rS) / 2, PLANE_D0 + PLANE_DAYS / 2); chipRaw('UÇAK', q[0], q[1] + 16, ease.enter(seg(t, T.n65 - 0.04, 0.3)) * k, 'center', C.ink, 40); }
      if (t >= T.n300 - 0.04 && t < T.hero) { const q = onRing(g, rS - w * 1.9, SWIFT_D0 + 210); chipRaw('EBABİL', q[0], q[1] + 14, ease.enter(seg(t, T.n300 - 0.04, 0.3)), 'center', C.ink, 40); }
    }
    // doruk: 65 günlük yay ebabilin izine kopya kopya dizilir (kırmızı, 110 ms arayla; son kopya 0,62)
    if (t >= T.hero && t < T.loop0 + 0.6) {
      const red = t < T.ask ? C.red : C.ink;
      for (let i = 0; i < 5; i++) {
        const len = Math.min(1, COPIES - i), u = ease.enter(seg(t, T.hero + i * 0.11, 0.32));
        const d0 = SWIFT_D0 + i * PLANE_DAYS; arc(g, rS, d0, d0 + PLANE_DAYS * len * u * loopOut, w * 1.15, red);
        // kopya sınırı: ince kâğıt çizgi
        if (u > 0.9 && i > 0) { const a = ang(d0); ctx.beginPath(); ctx.moveTo(g.x + Math.cos(a) * (rS - w), g.y + Math.sin(a) * (rS - w)); ctx.lineTo(g.x + Math.cos(a) * (rS + w), g.y + Math.sin(a) * (rS + w)); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke(); }
      }
      // merkez: kopya sayısı (×1 … ×4, "beş"te ×4,6)
      const n = t >= T.bes - 0.04 ? '×4,6' : `×${Math.max(1, Math.min(4, 1 + Math.floor((t - T.hero) / 0.11)))}`;
      const k = 1 - ease.exit(seg(t, T.loop0, 0.4));
      setFont(ctx, F.head(t >= T.bes - 0.04 ? 118 : 96)); ctx.textAlign = 'center'; ctx.globalAlpha = k; ctx.fillStyle = red; ctx.fillText(n, g.x, g.y + 36);
      setFont(ctx, F.mono(48)); ctx.fillStyle = C.ink; if (t >= T.bes - 0.04) ctx.fillText('KAT', g.x, g.y + 104);
      ctx.globalAlpha = 1;
    }
    // kıyas boyunca: uçak kendi yayında, ebabil kendi yayında uçar (sahne donmaz)
    if (t >= T.cmp1 && t < T.loop0 + 0.3) {
      const ko = ease.enter(seg(t, T.cmp1, 0.4)) * (1 - ease.exit(seg(t, T.loop0, 0.3)));
      for (const [r, d0, len, rate, kind] of [[rP, PLANE_D0, PLANE_DAYS, 0.5, 'plane'], [rS, SWIFT_D0, SWIFT_DAYS, 0.22, 'swift']]) {
        const ph = ((t - T.cmp1) * rq(rate)) % 1, sc = ko * Math.min(1, ph / 0.08, (1 - ph) / 0.08), d = d0 + len * ph;
        if (sc <= 0 || (kind === 'swift' && t >= T.hero - 0.3)) continue; const q = onRing(g, r, d);
        ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(ang(d) + Math.PI / 2); ctx.scale(sc, sc);
        if (kind === 'plane') { ctx.translate(0, -6); drawPlane(ctx, 120, t); } else { ctx.translate(0, -2); drawSwift(ctx, 96, (t * rq(2.6)) % 1 * 2 - 1); }
        ctx.restore();
      }
    }
    // kare 0 ve döngü: dönen uçak ve ebabil simgeleri
    const iconIn = t < T.cut ? 1 : t >= T.loop0 ? ease.enter(seg(t, T.loop0 + 0.45, 0.45)) : 0;
    if (iconIn > 0) {
      const tt = t >= T.loop0 ? t - D : t;
      const dp = PLANE_D0 - 6 + ORBIT * tt, ds = SWIFT_D0 - 6 + ORBIT * tt;
      for (const [r, d, kind] of [[rP, dp, 'plane'], [rS, ds, 'swift']]) {
        const q = onRing(g, r, d), a = ang(d) + Math.PI / 2;
        ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(a); ctx.scale(iconIn, iconIn);
        if (kind === 'plane') { ctx.translate(0, 8); drawPlane(ctx, 175, t); } else drawSwift(ctx, 160, (t * rq(2.6)) % 1 * 2 - 1);
        ctx.restore();
      }
      // çemberin anlamı: bir yıl
      ctx.save(); ctx.globalAlpha = iconIn; ctx.textAlign = 'center'; ctx.fillStyle = C.ink; setFont(ctx, F.head(64)); ctx.fillText('BİR YIL', g.x, g.y + 8);
      setFont(ctx, F.mono(48)); ctx.fillStyle = C.ink; ctx.fillText('365 GÜN', g.x, g.y + 66); ctx.restore();
    }
    ctx.restore();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(63); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'bakma_yukari', 'notr'], [L.l02.t0 + 0.4, 'ayakta', 'notr'], [T.havalan, 'bakma_yukari', 'notr'], [T.hortum, 'sasirma', 'saskin'], [T.hortum + 1.2, 'bakma_yukari', 'dusunceli'],
    [T.uyu, 'ayakta', 'uykulu'], [L.l07.t0, 'ayakta', 'notr'], [T.n64, 'sasirma', 'saskin'], [T.n64 + 1.3, 'ayakta', 'notr'], [T.kus, 'bakma_yukari', 'notr'], [T.kirk, 'sasirma', 'saskin'],
    [T.kirk + 1.2, 'ayakta', 'dusunceli'], [T.uyku, 'ayakta', 'dusunceli'], [T.inmiyor, 'sasirma', 'saskin'], [T.inmiyor + 1.4, 'ayakta', 'dusunceli'], [T.cmp0, 'ayakta', 'dusunceli'],
    [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'notr'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'bakma_yukari', 'notr']];
  const bubbles = [[L.l13.end + 0.05, T.cmp0 + 0.25, 'Hiç mi inmiyor?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)];
    // döngü dikişi: son tepki (bakma_yukari) kare 0 ile aynı
    const u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
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
  const MASKS = { l02: [['1958', T.b1958]], l06: [['36', T.d36]], l07: [['64', T.n64], ['22', T.n22]], l09: [['40', T.kirk]], l13: [['10', T.on10]],
    l15: [['65', T.n65], ['10', T.n10], ['300', T.n300]], l16: [['40', T.kirk2], ['5', T.bes]] };
  const CARD16 = L.l16.text + ' ' + L.l17.text;
  function masked(id, text, t) {
    const ws = text.split(' '), used = new Set();
    for (const [tok, tm] of MASKS[id] || []) {
      if (t >= tm - 0.04) { const j = ws.findIndex((w, k) => !used.has(k) && /^\d/.test(w) && w.match(/^\d+/)[0] === tok); if (j >= 0) used.add(j); continue; }
      const j = ws.findIndex((w, k) => !used.has(k) && /^\d/.test(w) && w.match(/^\d+/)[0] === tok);
      if (j >= 0) { used.add(j); ws[j] = '___' + ws[j].slice(tok.length); }
    }
    return ws.join(' ');
  }
  function narration(t) {
    if (t < T.cut || t >= T.loop0 + 0.3) return;   // kesmeden önce başlık tek başına
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
    const pout = t < T.loop0 ? (t < T.cut ? 1 : 0) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.head(66)); revealText(ctx, 'Uçak mı, kuş mu?', SAFE.x0, 670, 66, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(44)); revealText(ctx, label, SAFE.x0, 590, 44, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(40));
    if (right1) revealText(ctx, right1, SAFE.x1, 634, 40, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 40, p, C.ink, 'right');
  }
  function counters(t) {
    if (t < T.cut || t >= T.loop0 + 0.3) return;
    const pIn = id => Math.max(0.35, ease.enter(seg(t, L[id].t0 - 0.06, 0.35)));
    if (t < L.l08.t0 - 0.06) {
      if (t < L.l03.t0) { row({ label: 'HACIENDA UÇUŞU', num: 'Cessna', unit: '172', right1: 'İKİ PİLOT', right2: 'LAS VEGAS', p: pIn('l02') }); return; }
      const d = Math.floor(dayA(t) + 1e-6);
      const r = t >= L.l07.t0 ? ['7 ŞUBAT 1959', t >= T.land - 0.04 ? 'İNİŞ' : ''] : t >= L.l06.t0 ? [t >= T.d36 - 0.04 ? '36. GÜN · GECE' : 'GECE', t >= T.oto - 0.04 ? 'OTOMATİK PİLOT' : '']
        : t >= L.l05.t0 ? [t >= T.yemek - 0.04 ? 'YEMEK' : '', t >= T.banyo - 0.04 ? 'BANYO SUYU' : ''] : t >= L.l04.t0 ? [t >= T.kamyon - 0.04 ? 'YAKIT: KAMYONDAN' : '', t >= T.hortum - 0.04 ? 'HORTUMLA' : ''] : ['HEDEF:', 'HİÇ İNMEMEK'];
      row({ label: 'YERE İNMEDEN', num: String(d), unit: t >= T.n22 - 0.04 ? 'gün 22 saat' : 'gün', right1: r[0], right2: r[1], p: pIn('l03') }); return;
    }
    if (t < L.l09.t0 - 0.06) return;
    if (t < L.l11.t0 - 0.06) { row({ label: 'EBABİL · APUS APUS', num: t >= T.kirk - 0.04 ? '40' : '', unit: t >= T.kirk - 0.04 ? 'gram' : '', right1: t >= T.isvec - 0.04 ? 'İSVEÇLİ BİLİM İNSANLARI' : '', right2: t >= T.kayit - 0.04 ? 'SIRTINDA KAYIT CİHAZI' : '', p: pIn('l09') }); return; }
    if (t < T.cmp0) {
      const m = Math.floor(monB(t) + 1e-6);
      const r = t >= L.l13.t0 ? [t >= T.inmiyor - 0.04 ? 'YERE İNİŞ:' : '', t >= T.inmiyor - 0.04 ? '0' : ''] : t >= L.l12.t0 ? [t >= T.avlan - 0.04 ? 'HAVADA AVLANIYOR' : '', t >= T.uyku - 0.04 ? 'UYKU: ?' : ''] : ['İSVEÇTEN', t >= T.afrika - 0.04 ? 'AFRİKA' : ''];
      row({ label: 'EBABİL · HAVADA', num: String(m), unit: 'ay', right1: r[0], right2: r[1], p: pIn('l11') }); return;
    }
    if (t < L.l15.t0) { row({ label: 'AYNI TAKVİM · AYNI ÖLÇEK', num: '', unit: '', right1: 'DIŞTA: UÇAK', right2: 'İÇTE: EBABİL', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.p16 - 0.06) { row({ label: 'İNSAN REKORU', num: t >= T.n65 - 0.04 ? '65' : '', unit: t >= T.n65 - 0.04 ? 'gün' : '', right1: t >= T.n300 - 0.04 ? 'EBABİL:' : '', right2: t >= T.n300 - 0.04 ? '300 GÜN' : '' }); return; }
    if (t < T.ask) { row({ label: '300 GÜN ÷ 65 GÜN', num: '', unit: '', red: t >= T.hero, p: Math.max(0.35, ease.enter(seg(t, T.p16 - 0.06, 0.35))) }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Uçak mı, ebabil mi?', SAFE.x0, 672, 80, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    worldA(t, 0); worldB2(t, 0); worldB1(t, 0);
    ctx.restore();
    ring(t);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, STAGE_TOP);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    // takip çağrısı: soru boyunca, döngüden önce söner
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chipRaw('TAKİP ET:', SAFE.x0, 530, kf, 'left', C.ink, 46); chipRaw('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 592, kf, 'left', C.ink, 46); }
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

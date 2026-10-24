// "Otomobil" şablonu (Kaç Sıfır?): Türkiye'deki bütün otomobiller arka arkaya dizilse Dünya'yı sarar mı?
// Kare 0: soru başlık; gravür kürede İstanbul. Sayaç 17,4 milyon; büyüteçte tampon tampona otomobiller (4,5 m);
// kuyruk İstanbul'dan doğuya giden büyük daire boyunca uzar, Dünya'yı dolanır (ikinci tur yanında, küçük bir kaymayla);
// doruk: 78.300 km = 1,95 tur, kuyruk kırmızı; sonda kuyruğun yanından geçen bir otomobil, gün sayacı 33.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { geoRotation, geoContains } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { CAR_CARD, drawCar } from '../otomobil_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const IST = [28.98, 41.01], R_EARTH = 6371, DEG = 180 / Math.PI;
// büyük daire: İstanbul'dan doğuya; döndürülmüş çerçevede ekvator (λ, 0); ikinci tur 5° içeride ayrı bir halka
const ROT = geoRotation([-IST[0], -IST[1]]);
const routeAt = (km, off = 0) => ROT.invert([km / R_EARTH * DEG, off]);

export function otomobilTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    count: L.l02.t0, carLen: Wd('l03', 'dört'), line: Wd('l03', 'dizelim'), go: L.l04.t0, circ: Wd('l05', 'kırk'), eight: Wd('l05', 'sekiz'),
    hero: L.l06.t0 - 0.04, pass: L.l07.t0, three: Wd('l07', 'üç'), loop0: tl.loop0,
  };
  // kuyruk büyüteç açıkken (l03) başlar; 1. tur 'kırk'ta kapanır, 0,4 sn durur; 'sekiz'de 78.300 km
  T.grow0 = L.l03.t0 + 0.5; T.go1 = L.l04.end; T.hold = T.circ + 0.4; T.follow = L.l07.end + 0.3;
  return T;
}

export async function makeOtomobilRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = otomobilTimes(tl), Fx = ep.facts;
  const QUEUE = Fx.queueKm, LAP = Fx.earthKm;
  // Türkiye'de otomobil noktaları (l02'de sayaçla birlikte belirir; şehirlere yakın yoğun)
  const rnd = mulberry32(45), TR = world.country('792'), CARS = [];
  const HUBS = [[28.98, 41.01, 6], [32.85, 39.93, 2.5], [27.14, 38.42, 2], [29.06, 40.19, 1.5], [30.71, 36.89, 1.2], [35.32, 37.0, 1], [32.49, 37.87, 1], [36.33, 41.29, 0.6], [39.72, 41.0, 0.5], [40.23, 37.91, 0.6], [43.38, 38.5, 0.4]];
  for (let k = 0; CARS.length < 900 && k < 30000; k++) { const h = HUBS[Math.floor(rnd() * HUBS.length)], useHub = rnd() < 0.7, a = rnd() * Math.PI * 2, d = rnd() * 0.9; const p = useHub && rnd() < h[2] / 6 ? [h[0] + Math.cos(a) * d, h[1] + Math.sin(a) * d * 0.7] : [26 + rnd() * 19, 36 + rnd() * 6]; if (geoContains(TR, p)) CARS.push(p); }

  // kuyruk boyu (km): kare 0'da bitiş hâli (iki tur), ilk 0,5 sn'de İstanbul'a geri sarılır; sonra kelimelere bağlı parçalar
  const V1 = (25000 - 3000) / (T.go1 - T.go);   // l04 boyunca sabit hız (km/sn)
  const hermite = (u, len, m0) => len * (3 * u * u - 2 * u * u * u) + m0 * (u * u * u - 2 * u * u + u);
  const qKm = t => {
    if (t < T.grow0) return t < 0.6 ? QUEUE * (1 - ease.state(seg(t, 0.1, 0.5))) : 0;
    if (t < T.go) return 3000 * ease.enter(seg(t, T.grow0, T.go - T.grow0));
    if (t < T.go1) return 3000 + V1 * (t - T.go);
    if (t < T.circ) { const d = T.circ - T.go1; return 25000 + hermite((t - T.go1) / d, LAP - 25000, V1 * d); }
    if (t < T.hold) return LAP;
    if (t < T.eight) return LAP + (QUEUE - LAP) * ease.state(seg(t, T.hold, T.eight - T.hold));
    return QUEUE;
  };
  const headLam = km => km / R_EARTH * DEG;
  // kamera: 1. turda başı izler (baş + 20°), İstanbul'u geçince ön yüzde durur ve yavaşça kayar; ikinci tur arkadan dolanıp İstanbul'un hemen önünde biter
  const OFF2 = 5;   // ikinci turun halkası (5° içeride: ayrı bir halka gibi okunur)
  const camLam = t => t < T.circ ? headLam(qKm(Math.max(t, T.go))) + 5 : 365 + 6 * seg(t, T.circ, T.loop0 - T.circ);
  const S0 = { c: ROT.invert([365, 14]), r: 430, cy: 1185 };
  const lapCam = t => ({ c: ROT.invert([camLam(t), 12]), r: 460, cy: 1190 });
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, c: ROT.invert([365 + 4 * seg(t, 0, L.l02.t0), 14]), r: S0.r * (1 + 0.04 * ease.enter(seg(t, 0, 0.6))) }) },
    { t0: L.l02.t0 - 0.2, t1: L.l02.t0 + 0.9, to: t => ({ c: [31.5, 39.6], r: 2600 * (1 + 0.1 * seg(t, L.l02.t0 + 0.9, T.go - L.l02.t0 - 1.2)), cy: 1100 }) },
    { t0: T.go - 0.3, t1: T.go + 1.0, to: lapCam },
    { t0: T.loop0, t1: D - 0.04, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);
  const GR2 = '#5E594E';
  const chip = (s, x, y, a = 1, col = C.ink, al = 'center', size = 30) => { if (a <= 0) return; setFont(ctx, F.mono(size)); ctx.textAlign = al; const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 8, y - size - 2, tw + 16, size + 14); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); };

  // ——— kuyruk (kürede) ———
  function queue(t) {
    const km = qKm(t); if (km <= 0.5) return null;
    const red = t >= T.hero - 0.02 && t < T.pass;
    const pts = (a, b, off) => { const out = []; for (let k = a; k < b; k += 300) out.push(routeAt(k, off)); out.push(routeAt(b, off)); return out; };
    const l1 = Math.min(km, LAP), l2 = Math.max(0, km - LAP);
    G.line(pts(0, l1, 0), { color: red ? C.red : C.ink, w: 6 });
    if (l2 > 0) G.line(pts(0, l2, OFF2), { color: red ? C.red : C.ink, w: 6 });
    const lap2 = km > LAP, hk = lap2 ? km - LAP : km, off = lap2 ? OFF2 : 0, p = routeAt(hk, off), p2 = routeAt(hk + 200, off);
    if (km > 400 && G.visible(p) && t >= T.grow0 && km < QUEUE - 1) { const q = G.proj(p), q2 = G.proj(p2), ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]); ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(ang); drawCar(ctx, CAR_CARD, { wheel: t * 12 }, 70); ctx.restore(); }
    return G.visible(p) ? G.proj(p) : null;
  }
  // doruk: başla İstanbul arasında eksik kalan ≈ 1.850 km (ayraç ikinci halkanın dışında)
  function gapBracket(t) {
    if (t < T.hero - 0.02 || t >= T.pass) return;
    const a = QUEUE - LAP, b = LAP, off = OFF2 + 4, u = ease.enter(seg(t, T.hero + 0.3, 0.5));
    const P = []; for (let k = a; k <= b; k += 100) P.push(routeAt(k, off));
    G.line(P, { color: C.red, w: 3 });
    for (const k of [a, b]) G.line([routeAt(k, OFF2 + 1), routeAt(k, off)], { color: C.red, w: 3 });
    const m = routeAt((a + b) / 2, off + 4); if (G.visible(m)) { const q = G.proj(m); chip('≈ 1.850 km EKSİK', q[0], q[1], u, C.red, 'center', 32); }
  }

  // ——— büyüteç: tampon tampona otomobiller, 4,5 m ———
  function roundel(t, k) {
    if (k <= 0) return;
    const R = ROUND, r = R.r * ease.enter(k);
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    ctx.beginPath(); ctx.moveTo(-130, 40); ctx.lineTo(130, 40); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    const sz = 118, off = ((t - L.l03.t0) * 30) % sz;
    for (let i = -2; i <= 2; i++) { ctx.save(); ctx.translate(i * sz + off, 40); drawCar(ctx, CAR_CARD, { wheel: (t - L.l03.t0) * 2, tone: (i + 2) % 2 }, sz); ctx.restore(); }
    // ölçü oku: ortadaki otomobil (yakınlaşan kayma olmadan sabit konumda bir kopyası)
    ctx.beginPath(); ctx.moveTo(-sz / 2, -38); ctx.lineTo(sz / 2, -38); ctx.moveTo(-sz / 2, -46); ctx.lineTo(-sz / 2, -30); ctx.moveTo(sz / 2, -46); ctx.lineTo(sz / 2, -30); ctx.lineWidth = 2.5; ctx.stroke();
    setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('4,5 m', 0, -56);
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— kuyruğun yanından geçen otomobil (l07) ———
  function passer(t) {
    if (t < T.pass || t >= T.loop0) return;
    const P = (QUEUE / LAP) * ease.state(seg(t, T.pass + 0.2, T.three - T.pass - 0.2 + 0.3)), lap = Math.min(1, Math.floor(P)), fr = P - Math.floor(P);
    if (P >= QUEUE / LAP - 0.001) return;
    const lam = camLam(t) - 70 + 140 * fr, off = lap ? OFF2 - 3 : -3, p = ROT.invert([lam, off]), p2 = ROT.invert([lam + 2, off]);
    if (!G.visible(p)) return;
    const q = G.proj(p), q2 = G.proj(p2), ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]);
    ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(ang); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -16, 64, 26, 0, 0, Math.PI * 2); ctx.fill(); drawCar(ctx, CAR_CARD, { wheel: t * 24, tone: 1 }, 110); ctx.restore();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(44); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.carLen, 'ayakta', 'dusunceli'], [T.circ, 'ayakta', 'sayiyor'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'mutlu'], [T.follow, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.hero + 0.1, T.hero + 1.8, 'Az kaldı!', 340]];
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
    const ls = ["Türkiye'deki bütün", 'otomobiller dizilse', "Dünya'yı sarar mı?"];
    let fs = 92; setFont(ctx, F.head(fs)); while (Math.max(...ls.map(s => ctx.measureText(s).width)) > SAFE.x1 - SAFE.x0 && fs > 56) { fs -= 2; setFont(ctx, F.head(fs)); }
    ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, 430 + i * fs * 1.0, fs, k, C.ink));
    setFont(ctx, F.mono(34)); revealText(ctx, '17,4 MİLYON OTOMOBİL · ARKA ARKAYA', SAFE.x0, 690, 34, k, GR2);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : GR2);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, GR2, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const p0 = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < L.l03.t0 - 0.06) { const n = Math.round(Fx.cars * ease.state(seg(t, L.l02.t0, L.l02.end - L.l02.t0))); row({ label: 'KAYITLI OTOMOBİL · TÜİK ARALIK 2025', num: nf0.format(n), unit: '', right1: n >= Fx.cars ? '≈ 17,4 MİLYON' : '', right2: '', p: p0 }); return; }
    if (t < T.go - 0.06) { row({ label: 'BİR OTOMOBİL · ORTALAMA', num: '4,5', unit: 'metre', right1: 'TAMPON TAMPONA', right2: '17,4 MİLYON TANE', p: p0 }); return; }
    if (t < T.hero) { const km = qKm(t), shown = Math.abs(km - LAP) < 1 ? LAP : km >= 78000 ? 78000 : Math.round(km / 100) * 100; row({ label: 'KUYRUK UZUNLUĞU', num: (km >= 78000 ? '≈ ' : '') + nf0.format(shown), unit: 'km', right1: 'ÇEVRE: 40.075 km', right2: 'TUR: ' + nf2.format(km / LAP), p: p0 }); return; }
    if (t < T.pass - 0.06) { row({ label: 'KUYRUK · ≈ 78.000 km', num: '1,95', unit: 'tur', red: true, right1: "DÜNYA'YI NEREDEYSE", right2: 'İKİ KEZ SARIYOR' }); return; }
    const d = t >= T.three ? 33 : 32.6 * ease.state(seg(t, T.pass + 0.2, T.three - T.pass - 0.2));
    row({ label: 'SAATTE 100 km İLE YANINDAN', num: nf0.format(Math.floor(d)), unit: 'gün', right1: '783 SAAT', right2: 'HİÇ DURMADAN', p: ease.enter(seg(t, T.pass - 0.06, 0.35)) });
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    G.draw();
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.rect(SIFIR.x - 92, SIFIR.y - 132, 184, 180); ctx.clip('evenodd');
    // otomobil noktaları: l02 sayacıyla belirir, kuyruk başlamadan söner
    if (t >= L.l02.t0 && t < T.grow0 + 0.3) { const n = Math.floor(CARS.length * ease.state(seg(t, L.l02.t0, L.l02.end - L.l02.t0))), f = 1 - seg(t, T.grow0 - 0.3, 0.5); ctx.fillStyle = C.ink; ctx.globalAlpha = f; for (let i = 0; i < n; i++) { if (!G.visible(CARS[i])) continue; const q = G.proj(CARS[i]); ctx.fillRect(q[0] - 3, q[1] - 1.5, 6, 3); } ctx.globalAlpha = 1; }
    G.ringAt(IST, 1, 18);
    queue(t); gapBracket(t); passer(t);
    // İstanbul etiketi: kâğıt zeminli, opaklıkla (harf harf açılmaz); l04 başında söner, 1. tur kapanınca döner
    if (G.visible(IST)) {
      const q = G.proj(IST), a = t < T.go + 0.6 ? 1 - seg(t, T.go + 0.2, 0.4) : t < T.circ - 0.6 ? 0 : t < T.loop0 ? ease.enter(seg(t, T.circ - 0.6, 0.4)) : 1;
      chip('İSTANBUL', q[0] + 24, q[1] - 22, a, C.ink, 'left', 30);
      // birinci tur: 'kırk'ta İstanbul'un yanında, yukarı kayarak girer
      if (t >= T.circ - 0.05 && t < T.loop0 + 0.3) { const v = ease.enter(seg(t, T.circ - 0.05, 0.4)) * (1 - seg(t, T.follow - 0.35, 0.3)); chip('1 TUR · 40.075 km', q[0] - 24, q[1] + 56 + 14 * (1 - v), v, C.ink, 'right', 30); }
    }
    ctx.restore();
    // büyüteç: tampon tampona (l03)
    const rk = t < L.l03.t0 - 0.1 ? 0 : t < T.go ? ease.enter(seg(t, L.l03.t0 - 0.1, 0.4)) : 1 - ease.exit(seg(t, T.go, 0.3));
    roundel(t, rk);
    if (t >= T.follow && t < T.loop0) { const fa = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.25, 0.25)); chip('TAKİP ET', SAFE.x0, 1336, fa, C.ink, 'left', 42); chip('HER GÜN YENİ BİR SAYI', SAFE.x0, 1394, fa, C.ink, 'left', 40); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

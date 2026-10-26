// "Dalga" şablonu (Hangisi daha şaşırtıcı?): 4.800 km öteden duyulan Krakatoa (1883) ve 10.000 km öteden duyulan Hunga
// Tonga (2022). Tek gravür küre: A'da kamera Krakatoa'ya döner; basınç dalgası küre üstünde gerçek büyük daire halkası
// olarak açılır, istasyon noktaları geçişte yanar, ses halkası Rodrigues'e varır. Doğuya hızlı dönüşle B: Tonga'nın dalgası
// 6 günde 4 tur atar, ses halkası Alaska'ya ulaşır. Kıyas: küre küçülür, iki ses yolu aynı km cetvelinde iki çubuğa
// iner; Tonga çubuğu Krakatoa'nın iki boyunu geçer (dorukta kırmızı). Yıkım, dalga felaketi, ölü görseli yok.
// Anlatım saattir (yolculuk_core.buildYolTimeline); her şey t'nin saf fonksiyonudur.
import { geoInterpolate, geoDistance, geoCircle } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, mixCam } from '../globe.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 500, y: 1290, r: 124 };    // A: Rodrigues çizgisinin altında
const ROUND_B = { x: 215, y: 960, r: 124 };   // B: Tonga altta kaldığı için sol üstte
const SIFIR = { x: 812, y: 1412, H: 92 };   // sağ kenar ≤ 920
const R_KM = 6371.0088;
const DEG_KM = (Math.PI * R_KM) / 180;
// coğrafya
export const KRAKATOA = [105.423, -6.102];
export const RODRIGUES = [63.42, -19.72];              // Krakatoa'ya 4.781 km (büyük daire)
export const TONGA = [-175.39, -20.55];
const FAIRBANKS = [-147.72, 64.84];
function bearing([l1, f1], [l2, f2]) {
  const r = Math.PI / 180, y = Math.sin((l2 - l1) * r) * Math.cos(f2 * r), x = Math.cos(f1 * r) * Math.sin(f2 * r) - Math.sin(f1 * r) * Math.cos(f2 * r) * Math.cos((l2 - l1) * r);
  return Math.atan2(y, x) / r;
}
function dest([lon, lat], km, brg) {
  const d = km / R_KM, b = brg * Math.PI / 180, f1 = lat * Math.PI / 180, l1 = lon * Math.PI / 180;
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
  return [l2 * 180 / Math.PI, f2 * 180 / Math.PI];
}
// Alaska: gümbürtüler eyaletin dört bir yanında duyuldu (UAF, NSF: yaklaşık 10.000 km / 6.200 mil); işaret eyaletin
// ortasında, Fairbanks'te (Tonga'ya 9.786 km)
export const ALASKA = FAIRBANKS;
const K_DEG = 4800 / DEG_KM, T_DEG = 10000 / DEG_KM;   // ses halkalarının açısal yarıçapı
// 1883'te barografı dalgayı kaydeden kentlerden bir seçki (konumlar; etiketsiz istasyon noktası olarak)
const STATIONS = [[106.8, -6.2], [103.8, 1.3], [88.4, 22.6], [72.9, 19.1], [80.3, 13.1], [79.9, 6.9], [57.5, -20.2], [151.2, -33.9], [145.0, -37.8],
  [138.6, -34.9], [115.9, -32.0], [121.0, 14.6], [114.2, 22.3], [139.7, 35.7], [18.4, -33.9], [-0.1, 51.5], [2.35, 48.85], [13.4, 52.5], [30.3, 59.9],
  [16.4, 48.2], [12.5, 41.9], [-79.4, 43.7], [-77.0, 38.9], [-74.0, 40.7], [116.4, 39.9], [100.5, 13.75], [96.2, 16.8], [174.8, -36.8], [147.3, -42.9], [55.3, 25.3]];

const CAM0 = { c: [157, -4], r: 430, cx: 540, cy: 1085 };          // kare 0 ve döngü: iki yanardağ birlikte
const CAM_K = { c: [88, -12], r: 600, cx: 560, cy: 1075 };          // Krakatoa ve Rodrigues
const CAM_T = { c: [-168, 28], r: 430, cx: 560, cy: 1060 };         // Tonga (altta) ve Alaska (üstte)
const CAM_C = { c: [128, -6], r: 205, cx: 540, cy: 930 };           // kıyas: küre küçülür, cetvel altta

const RULER = { x0: 120, x1: 700, y: 1335, kmMax: 10000 };
const kmX = km => RULER.x0 + (RULER.x1 - RULER.x0) * km / RULER.kmMax;
const BAR_K = 1150, BAR_T = 1238;

export function dalgaTimes(tl) {
  const { L, W: Wd } = tl;
  return {
    boomK: Wd('l02', 'patlıyor'), basinc: Wd('l03', 'basınç'), elli: Wd('l04', 'elliyi'), baro: Wd('l04', 'istasyon'),
    saatler: L.l05.t0, rod: Wd('l05', 'rodrigez'), top: Wd('l05', 'top'), oysa: Wd('l06', 'oysa'), k4800: Wd('l07', 'dört'),
    whip0: L.l07.end + 0.6, whip1: Wd('l08', 'yanardağ'), yanardag: Wd('l08', 'yanardağ'),
    boomT: Wd('l09', 'patlıyor'), deniz: Wd('l09', 'denizin'), ayni: Wd('l10', 'aynı'), alti: Wd('l11', 'altı'), dort: Wd('l11', 'dört'),
    alaska: Wd('l12', 'alaska'), t10000: Wd('l13', 'on'), cmp0: L.l14.t0 - 0.1, cmp1: L.l14.end + 0.3,
    k15: Wd('l15', 'dört'), // l17 başında 0,12 sn sessizlik var (TRIM_EDGE): vuruş konuşmadan 0,15 sn önce, "2" kelimeden 0,04 sn önce açılır
    p16: L.l16.t0, hero: L.l17.t0 - 0.03, iki: Wd('l17', 'iki') + 0.12, ask: L.l18.t0, loop0: tl.loop0,
  };
}

export async function makeDalgaRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = dalgaTimes(tl);
  const rq = r => Math.round(r * D) / D;   // sürekli döngüler film süresine tam bölünür (son kare = kare 0)
  const rnd = mulberry32(65);
  const circ = (c, deg) => geoCircle().center(c).radius(Math.max(0.01, Math.min(179.9, deg))).precision(1.5)();
  // Tonga'nın basınç dalgası: patlamadan "dört"e kadar tam 4 tur (kaynak → karşı kutup → kaynak)
  const lambPhase = t => 4 * clamp01((t - T.boomT) / (T.dort - T.boomT));
  // Krakatoa'nın basınç dalgası: l03–l04 boyunca tek tur (karşı kutba gider, "kaydediyor" biterken kaynağa döner)
  const kPhase = t => clamp01((t - T.basinc + 0.3) / (L.l05.t0 - T.basinc + 0.3)) * 1.499;
  const ringDeg = ph => 180 - Math.abs(180 - (ph % 1) * 360);

  // ——— kamera ———
  // tutuşlarda yavaş yaklaşma ve doğuya dönüş (filmin baskın yönü doğu): sahne hiçbir karede donmaz
  const drift = (k, t0, t1, z = 0.08, rot = 10) => t => ({ ...k, c: [k.c[0] + rot * seg(t, t0, t1 - t0), k.c[1]], r: k.r * (1 + z * seg(t, t0, t1 - t0)) });
  const camOpen = t => ({ ...CAM0, r: CAM0.r * (t < D / 2 ? 1 + 0.025 * t : 1 - 0.025 * (D - t)) });
  const camKd = drift(CAM_K, T.boomK, T.whip0, 0.1, 16);
  // B: patlamaya dek Tonga'ya daha hızlı yaklaşma (%8), sonra yavaş sürüklenme
  const camTd = t => { const k = drift(CAM_T, T.boomT, T.cmp0, 0.06, 16)(t); return { ...k, r: k.r * (1 + 0.03 * seg(t, T.whip1, T.boomT - 1.8 - T.whip1)) * (1 + 0.08 * ease.state(seg(t, T.boomT - 1.8, 1.8))) }; };
  const camCd = t => ({ ...CAM_C, c: [CAM_C.c[0] + 32 * seg(t, T.cmp1, T.loop0 - T.cmp1), CAM_C.c[1]], r: CAM_C.r * (1 + 0.1 * seg(t, T.cmp1, T.loop0 - T.cmp1)) });
  function cam(t) {
    if (t < L.l02.t0) return camOpen(t);
    // kare 0'dan Krakatoa'ya: patlama kelimesine dek süren yavaş geçiş (tutuş yok)
    if (t < T.boomK) return mixCam(camOpen(L.l02.t0), CAM_K, ease.state(seg(t, L.l02.t0, T.boomK - L.l02.t0)));
    if (t < T.whip0) return camKd(t);
    // doğuya hızlı dönüş: 105° / 1,3 sn (≈ 2,7°/kare)
    if (t < T.whip1) return mixCam(camKd(T.whip0), CAM_T, ease.state(seg(t, T.whip0, T.whip1 - T.whip0)));
    if (t < T.cmp0) return camTd(t);
    if (t < T.cmp1) return mixCam(camTd(T.cmp0), camCd(t), ease.state(seg(t, T.cmp0, T.cmp1 - T.cmp0)));
    if (t < T.loop0) return camCd(t);
    return mixCam(camCd(T.loop0), camOpen(t), ease.state(seg(t, T.loop0, 1.0)));
  }
  const loopK = t => (t < T.loop0 ? 0 : ease.state(seg(t, T.loop0, 1.0)));   // 1 = kare 0 durumu
  const openK = t => (t < L.l02.t0 ? 1 : 1 - ease.exit(seg(t, L.l02.t0, 0.5)));
  const frame0K = t => Math.max(openK(t), loopK(t));

  // ——— yardımcılar ———
  function chip(s, x, y, a = 1, al = 'left', col = C.ink, fs = 40) {
    if (a <= 0) return; setFont(ctx, F.mono(fs)); const tw = ctx.measureText(s).width;
    let x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    x0 = Math.max(SAFE.x0, Math.min(SAFE.x1 - tw, x0));
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - fs, tw + 20, fs + 14); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }
  function mapChip(p, s, a, dx = 0, dy = -40, al = 'center', col = C.ink, fs = 40) {
    if (a <= 0 || !G.visible(p)) return; const q = G.proj(p);
    if (q[1] + dy - fs < STAGE_TOP + 10 || q[1] + dy > 1420) return;
    chip(s, q[0] + dx, q[1] + dy, a, al, col, fs);
  }
  function geoStroke(geo, { color = C.ink, w = 3, dash = null, a = 1 } = {}) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); G.path(geo); ctx.lineWidth = w; ctx.strokeStyle = color; ctx.setLineDash(dash || []); ctx.stroke(); ctx.restore();
  }
  // yanardağ simgesi: gravür koni, krater, kısa duman çizgileri (yıkım yok)
  function volcano(p, a, puff, s = 1) {
    if (a <= 0 || !G.visible(p)) return; const q = G.proj(p);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(q[0], q[1]); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-8, -30); ctx.lineTo(8, -30); ctx.lineTo(30, 0); ctx.closePath();
    ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1.2; for (let d = -40; d < 40; d += 6) { ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + 30, -30); ctx.stroke(); } ctx.restore();
    if (puff > 0) for (let i = 0; i < 3; i++) { const u = (puff + i / 3) % 1; ctx.globalAlpha = a * (1 - u); ctx.beginPath(); ctx.arc(-6 + i * 6, -40 - u * 34, 6 + u * 9, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.stroke(); }
    ctx.restore();
  }
  // patlama anı: ekran uzayında üç hızlı halka (vuruş)
  function burst(p, t, t0) {
    const u = seg(t, t0, 0.9); if (u <= 0 || u >= 1 || !G.visible(p)) return; const q = G.proj(p);
    for (let i = 0; i < 3; i++) { const v = clamp01(u * 1.4 - i * 0.18); if (v <= 0) continue; ctx.beginPath(); ctx.arc(q[0], q[1] - 18, 20 + 110 * ease.enter(v), 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(28,27,24,${0.8 * (1 - v)})`; ctx.stroke(); }
  }
  // sürekli ses yayılımı: kaynaktan küçük eşmerkezli halkalar (yarıçapı en çok maxDeg)
  function emit(p, t, maxDeg, a, period = 1.6, n = 3) {
    if (a <= 0) return;
    for (let i = 0; i < n; i++) { const u = ((t * rq(1 / period)) + i / n) % 1; geoStroke(circ(p, maxDeg * u), { w: 3, color: C.ink, a: a * 0.8 * (1 - u) }); }
  }

  // ——— küre ———
  function globe(t) {
    G.setCam(cam(t));
    G.draw();
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    const f0 = frame0K(t), inA = t >= L.l02.t0 && t < T.whip1, inB = t >= T.whip0 && t < T.loop0;
    const cmpK = t < T.cmp0 ? 0 : t < T.loop0 ? ease.state(seg(t, T.cmp0, 0.9)) : 1 - loopK(t);
    // kare 0, döngü ve kıyas: iki yanardağ küçük ses halkaları yayar (sahne hiçbir karede donmaz)
    const em = Math.max(f0, cmpK);
    if (em > 0) { emit(KRAKATOA, t, 13 + cmpK, em, 1.3 - 0.1 * cmpK); emit(TONGA, t, 22 + 2 * cmpK, em, 1.3 - 0.1 * cmpK, 3); }
    // patlamadan sonra kaynak sürekli küçük halkalar yayar
    if (t >= T.boomK && t < T.whip0 + 0.4) emit(KRAKATOA, t, 12, 0.7 * (1 - seg(t, T.whip0 - 0.3, 0.3)), 1.3, 3);
    if (t >= T.boomT && t < T.cmp0 + 0.4) emit(TONGA, t, 14, 0.7 * (1 - seg(t, T.cmp0 - 0.3, 0.3)), 1.3, 3);
    // A — basınç dalgası (l03–l04): küre üstünde büyük daire halkası, istasyonlar geçişte yanar
    const kOn = t >= T.basinc - 0.6 && t < T.whip0 + 0.3;
    if (kOn) {
      const a = ease.enter(seg(t, T.basinc - 0.6, 0.4)) * (1 - seg(t, L.l05.t0, 0.6));
      const ph = kPhase(t), deg = ringDeg(ph);
      if (a > 0) geoStroke(circ(KRAKATOA, deg), { w: 5, a });
      if (a > 0 && ph >= 0.5) geoStroke(circ(KRAKATOA, ringDeg(ph - 0.5)), { w: 3, a: a * 0.8 });
      for (const s of STATIONS) {
        if (!G.visible(s)) continue; const q = G.proj(s), dd = geoDistance(KRAKATOA, s) * 180 / Math.PI;
        const hit = Math.max(0, 1 - Math.abs(dd - deg) / 9), lit = t >= T.basinc && a > 0 ? hit : 0;
        ctx.beginPath(); ctx.arc(q[0], q[1], 9 + 5 * lit, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.beginPath(); ctx.arc(q[0], q[1], 6 + 5 * lit, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
        if (lit > 0) { ctx.beginPath(); ctx.arc(q[0], q[1], 12 + 14 * lit, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(28,27,24,${lit})`; ctx.stroke(); }
      }
    }
    // A — ses halkası: "Saatler sonra"dan Rodrigues'e (4.800 km) kadar açılır, sonra kesik çizgi olarak kalır
    if (t >= T.saatler - 0.1 && t < T.whip1) {
      const u = ease.state(seg(t, T.saatler - 0.1, T.rod - T.saatler + 0.1));
      geoStroke(circ(KRAKATOA, K_DEG * u), { w: 4, dash: [14, 9], a: 1 - seg(t, T.whip0 - 0.3, 0.3) });
      emit(KRAKATOA, t, K_DEG * u * 0.9, 0.6 * (1 - seg(t, T.whip0 - 0.3, 0.3)), 1.4, 3);
    }
    if (t >= T.rod - 0.1 && inA) {
      const u = ease.enter(seg(t, T.rod - 0.1, 0.4)) * (1 - seg(t, T.whip0 - 0.3, 0.3));
      G.ringAt(RODRIGUES, u, 22 * (1 + 0.1 * Math.sin(t * rq(1.2) * 6.283)));
      mapChip(RODRIGUES, 'RODRIGUES', u, 0, -40);
    }
    if (t >= T.k4800 - 0.6 && inA) {
      const u = ease.state(seg(t, T.k4800 - 0.6, 0.6)), out = 1 - seg(t, T.whip0 - 0.3, 0.3);
      const gi = geoInterpolate(KRAKATOA, RODRIGUES), pts = Array.from({ length: 41 }, (_, i) => gi(i / 40 * u));
      ctx.save(); ctx.globalAlpha = out; G.line(pts, { w: 7 }); ctx.restore();
      if (t >= T.k4800 - 0.04) mapChip(gi(0.5), '4.800 km', ease.enter(seg(t, T.k4800 - 0.04, 0.3)) * out, 0, 10, 'center', C.ink, 44);
    }
    // B — Tonga basınç dalgası 4 tur
    if (t >= T.boomT && t < T.cmp0 + 0.3) {
      const ph = lambPhase(t), a = t < T.dort ? 1 : 0;
      if (ph < 4 && a > 0) geoStroke(circ(TONGA, ringDeg(ph)), { w: 5, a });
      if (t >= T.dort) geoStroke(circ(TONGA, ringDeg((t - T.boomT) / ((T.dort - T.boomT) / 4))), { w: 3, a: 0.45 * ease.enter(seg(t, T.dort, 0.4)) * (1 - seg(t, T.cmp0 - 0.3, 0.3)) });
      // tur bitince kaynaktan çıkan kısa yanıp sönme
      for (let k = 1; k <= 4; k++) { const tk = T.boomT + (T.dort - T.boomT) * k / 4; burst(TONGA, t, tk - 0.05); }
    }
    // B — ses halkası Tonga'dan Alaska'ya (10.000 km)
    if (t >= L.l12.t0 - 0.1 && t < T.cmp0 + 0.5) {
      const u = ease.state(seg(t, L.l12.t0 - 0.1, T.alaska - L.l12.t0 + 0.1)), out = 1 - seg(t, T.cmp0 - 0.3, 0.3);
      geoStroke(circ(TONGA, T_DEG * u), { w: 4, dash: [14, 9], a: out });
      emit(TONGA, t, T_DEG * u * 0.9, 0.6 * out, 1.4, 3);
    }
    if (t >= T.alaska - 0.1 && t < T.cmp0 + 0.5) {
      const u = ease.enter(seg(t, T.alaska - 0.1, 0.4)) * (1 - seg(t, T.cmp0 - 0.3, 0.3));
      G.ringAt(ALASKA, u, 22 * (1 + 0.1 * Math.sin(t * rq(1.2) * 6.283)));
      mapChip(ALASKA, 'ALASKA', u, 0, 70);
    }
    if (t >= T.t10000 - 0.6 && t < T.cmp0 + 0.5) {
      const u = ease.state(seg(t, T.t10000 - 0.6, 0.6)), out = 1 - seg(t, T.cmp0 - 0.3, 0.3);
      const gi = geoInterpolate(TONGA, ALASKA), pts = Array.from({ length: 61 }, (_, i) => gi(i / 60 * u));
      ctx.save(); ctx.globalAlpha = out; G.line(pts, { w: 7 }); ctx.restore();
      if (t >= T.t10000 - 0.04) mapChip(gi(0.55), '10.000 km', ease.enter(seg(t, T.t10000 - 0.04, 0.3)) * out, 30, 0, 'left', C.ink, 44);
    }
    // yanardağlar: her zaman yerinde; dumanı sürekli döngü
    const pf = (t * rq(0.7)) % 1;
    volcano(KRAKATOA, 1, pf, cmpK > 0 ? lerp(1, 0.7, cmpK) : 1);
    volcano(TONGA, 1, pf, cmpK > 0 ? lerp(1, 0.7, cmpK) : 1);
    burst(KRAKATOA, t, T.boomK - 0.05); burst(TONGA, t, T.boomT - 0.05);
    // adlar
    const ka = f0 > 0 ? f0 : inA ? ease.enter(seg(t, Math.max(L.l02.t0, Math.min(T.boomK, L.l02.t0 + 1.2)), 0.4)) * (1 - seg(t, T.whip0 - 0.3, 0.3)) : cmpK;
    mapChip(KRAKATOA, 'KRAKATOA', ka, 0, cmpK > 0.5 ? -50 : -64, 'center', C.ink, cmpK > 0.5 ? 34 : 40);
    const ta = f0 > 0 ? f0 : t >= T.yanardag - 0.1 && t < T.cmp0 ? ease.enter(seg(t, T.yanardag - 0.1, 0.4)) : cmpK;
    mapChip(TONGA, 'TONGA', ta, 0, cmpK > 0.5 ? -50 : -64, 'center', C.ink, cmpK > 0.5 ? 34 : 40);
    if (inB && t >= T.deniz - 0.04 && t < T.cmp0) mapChip(TONGA, 'DENİZ ALTINDA', ease.enter(seg(t, T.deniz - 0.04, 0.3)) * (1 - seg(t, L.l11.t0, 0.3)), 0, 70);
    ctx.restore();
  }

  // ——— kıyas cetveli: iki ses yolu aynı km ölçeğinde ———
  function ruler(t) {
    if (t < T.cmp0 + 0.2) return;
    const a = ease.enter(seg(t, T.cmp0 + 0.2, 0.5)) * (t < T.loop0 ? 1 : 0);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.moveTo(RULER.x0, RULER.y); ctx.lineTo(RULER.x1, RULER.y); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    setFont(ctx, F.mono(34)); ctx.fillStyle = C.ink;
    for (let km = 0; km <= 10000; km += 1000) {
      const x = kmX(km), big = km % 5000 === 0; ctx.beginPath(); ctx.moveTo(x, RULER.y); ctx.lineTo(x, RULER.y + (big ? 22 : 12)); ctx.lineWidth = 2; ctx.stroke();
      if (big) { ctx.textAlign = km === 10000 ? 'right' : 'center'; ctx.fillText(km === 0 ? '0' : km === 5000 ? '5.000' : '10.000 km', km === 10000 ? x + 12 : x, RULER.y + 60); }
    }
    ctx.restore();
    // Krakatoa çubuğu: "dört bin sekiz yüz"de 4.800'e uzar
    const kU = ease.enter(seg(t, T.k15 - 0.3, 0.7)), out = t < T.loop0 ? 1 : 0;
    const bar = (y, km, col, lbl, la) => {
      const x1 = kmX(km); ctx.save(); ctx.globalAlpha = out; ctx.fillStyle = col; ctx.fillRect(RULER.x0, y - 18, x1 - RULER.x0, 36);
      // ses çubuk boyunca akar: kâğıt renkli ince çentikler soldan sağa kayar (sürekli döngü)
      ctx.fillStyle = C.paper; for (let i = 0; i < 8; i++) { const x = RULER.x0 + (((t * rq(0.45)) + i / 8) % 1) * (x1 - RULER.x0 - 10); ctx.fillRect(x, y - 18, 9, 36); }
      ctx.restore();
      chip(lbl, RULER.x0, y - 34, la * out, 'left', col === C.red ? C.red : C.ink, 34);
    };
    const kLbl = ease.enter(seg(t, L.l15.t0 - 0.06, 0.35));
    if (kLbl > 0) bar(BAR_K, 4800 * kU, C.ink, kU > 0.98 ? 'KRAKATOA → RODRIGUES · 4.800 km' : 'KRAKATOA → RODRIGUES', kLbl);
    // Tonga çubuğu: l16'da 4.800'e kadar (iki çubuk eşit), sessizlikte bekler, "iki"de iki Krakatoa boyunu geçip 10.000'e
    if (t >= T.p16 - 0.06) {
      const red = t >= T.hero && t < T.ask + 0.4;
      const km = t < T.hero ? 4800 * ease.state(seg(t, T.p16, 1.1)) : 4800 + 5200 * ease.enter(seg(t, T.hero, 0.9));
      bar(BAR_T, km, red ? C.red : C.ink, t >= T.hero + 0.6 ? 'TONGA → ALASKA · 10.000 km' : 'TONGA → ALASKA', ease.enter(seg(t, T.p16 - 0.06, 0.35)));
      // iki Krakatoa boyu: kesik ölçü çizgileri 4.800 ve 9.600'de
      if (t >= T.hero) {
        const u = ease.enter(seg(t, T.hero + 0.2, 0.4)) * out;
        ctx.save(); ctx.globalAlpha = u; ctx.setLineDash([6, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink;
        for (const km of [4800, 9600]) { const x = kmX(km); ctx.beginPath(); ctx.moveTo(x, BAR_K - 26); ctx.lineTo(x, BAR_T + 30); ctx.stroke(); }
        ctx.setLineDash([]); ctx.restore();
        // iki parantez: 1× ve 2× Krakatoa
        setFont(ctx, F.mono(32)); ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = C.ink; ctx.textAlign = 'center';
        ctx.fillText('1×', (kmX(0) + kmX(4800)) / 2, BAR_T + 54); ctx.fillText('2×', (kmX(4800) + kmX(9600)) / 2, BAR_T + 54); ctx.restore();
      }
    }
  }

  // ——— büyüteç ———
  function roundel(t, kind, k = 1) {
    if (k <= 0) return; const R = kind === 'baro2' || kind === 'deniz' ? ROUND_B : ROUND, r = R.r * ease.enter(k);
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (kind === 'baro' || kind === 'baro2') {
      // barograf: dönen tambur ve mürekkep izi; iz sola kayar, spike tamburun ortasından geçer
      const two = kind === 'baro2', rows = two ? [-40, 46] : [10];
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(139,133,119,0.7)'; for (let y = -100; y <= 100; y += 14) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
      const sc = (t * rq(0.35)) % 1;
      for (let i = 0; i < rows.length; i++) {
        const y0 = rows[i]; ctx.beginPath();
        for (let x = -130; x <= 130; x += 3) { const xx = x + sc * 60, sp = Math.exp(-Math.pow(((x + 130 - sc * 260 + 520) % 260) - 130, 2) / 90) * (two ? 46 : 70), w = Math.sin(xx * 0.09) * 3; x === -130 ? ctx.moveTo(x, y0 - sp + w) : ctx.lineTo(x, y0 - sp + w); }
        ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
        setFont(ctx, F.mono(26)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(two ? ['1883', '2022'][i] : 'BAROGRAF', -96, y0 + (two ? 30 : 64));
      }
    } else if (kind === 'deniz') {
      // deniz altındaki yanardağ: dalgalı yüzey, kesitte koni, yükselen kabarcıklar; patlamada yüzeyi kubbe gibi iter
      const b = ease.enter(seg(t, T.boomT - 0.05, 0.5)) * (1 - ease.exit(seg(t, T.boomT + 0.6, 0.5)));
      ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath();
      for (let x = -130; x <= 130; x += 4) { const y = -40 + Math.sin(x * 0.07 + t * rq(1.2) * 6.283) * 5 - b * 46 * Math.exp(-x * x / 1800); x === -130 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(139,133,119,0.6)'; ctx.lineWidth = 1.2; for (let y = -20; y < 130; y += 9) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-110, 130); ctx.lineTo(-22, 30); ctx.lineTo(22, 30); ctx.lineTo(110, 130); ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.save(); ctx.clip(); ctx.lineWidth = 1.3; for (let d = -140; d < 140; d += 7) { ctx.beginPath(); ctx.moveTo(d, 130); ctx.lineTo(d + 100, 30); ctx.stroke(); } ctx.restore();
      for (let i = 0; i < 7; i++) { const u = ((t * rq(0.8)) + i / 7) % 1; ctx.beginPath(); ctx.arc(Math.sin(i * 2.1 + u * 5) * 14, 26 - u * 62, 3 + 3 * u, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); }
    } else if (kind === 'top') {
      // eski top: gövde, tekerlek, namludan çıkan ses yayları
      ctx.save(); ctx.translate(-30, 30); ctx.rotate(-0.18);
      ctx.beginPath(); ctx.moveTo(-70, -16); ctx.lineTo(60, -10); ctx.lineTo(60, 10); ctx.lineTo(-70, 18); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
      ctx.beginPath(); ctx.arc(-74, 1, 18, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(-40, 62, 30, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
      for (let k2 = 0; k2 < 8; k2++) { const a = k2 * Math.PI / 4; ctx.beginPath(); ctx.moveTo(-40, 62); ctx.lineTo(-40 + Math.cos(a) * 30, 62 + Math.sin(a) * 30); ctx.lineWidth = 2.5; ctx.stroke(); }
      for (let i = 0; i < 3; i++) { const u = ((t * rq(0.9)) + i / 3) % 1; ctx.beginPath(); ctx.arc(40, 6, 20 + u * 70, -0.7, 0.4); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(28,27,24,${1 - u})`; ctx.stroke(); }
      // "oysa": top değil — çizgiyle üstü çizilir
      const x = ease.state(seg(t, T.oysa, 0.35));
      if (x > 0) { ctx.beginPath(); ctx.moveTo(-100, -80); ctx.lineTo(-100 + 200 * x, -80 + 160 * x); ctx.lineWidth = 7; ctx.strokeStyle = C.ink; ctx.stroke(); }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const S1 = [[0, null], [T.elli - 0.35, 'baro'], [T.top - 0.3, 'top'], [L.l07.t0, null], [T.whip1 + 0.3, 'deniz'], [T.boomT + 1.2, null], [T.ayni - 0.3, 'baro2'], [L.l11.t0, null]];
  function sched(t) {
    let i = -1; for (let k = 0; k < S1.length; k++) if (t >= S1[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S1[i], prev = i > 0 ? S1[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ——— (felaket hikâyesi: patlamadan sonra gülümsemez)
  const blinkR = mulberry32(66); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.boomK, 'sasirma', 'saskin'], [T.boomK + 1.3, 'ayakta', 'dusunceli'], [T.oysa, 'sasirma', 'saskin'], [T.oysa + 1.3, 'ayakta', 'dusunceli'],
    [T.boomT, 'sasirma', 'saskin'], [T.boomT + 1.3, 'ayakta', 'dusunceli'], [T.alaska, 'sasirma', 'saskin'], [T.alaska + 1.3, 'ayakta', 'dusunceli'],
    [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'dusunceli'], [T.loop0 + 0.5, 'ayakta', 'notr']];
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
  // sayı yalnız söylendiği kelimede açılır: önceki karelerde yerinde ___ durur
  const MASKS = { l04: [['50', T.elli]], l07: [['4.800', T.k4800]], l11: [['6', T.alti], ['4', T.dort]], l13: [['10.000', T.t10000]], l15: [['4.800', T.k15]], l16: [['2', T.iki]] };
  const CARD16 = L.l16.text + ' ' + L.l17.text;
  function masked(id, text, t) {
    const ws = text.split(' ');
    for (const [tok, tm] of MASKS[id] || []) {
      if (t >= tm - 0.04) continue;
      const j = ws.findIndex(w => w.startsWith(tok) && !/^\d/.test(w.slice(tok.length)));
      if (j >= 0) ws[j] = '___' + ws[j].slice(tok.length);
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
    setFont(ctx, F.head(66)); revealText(ctx, '4.800 km mi, 10.000 km mi?', SAFE.x0, 670, 66, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(40)); revealText(ctx, label, SAFE.x0, 590, 40, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  const on = (t, tm) => t >= tm - 0.04;
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0) return;
    const pIn = id => Math.max(0.35, ease.enter(seg(t, L[id].t0 - 0.06, 0.35)));
    if (t < L.l08.t0 - 0.06) {
      if (t < L.l03.t0) { row({ label: 'KRAKATOA · 1883', num: '27 Ağustos', unit: '', right1: 'ENDONEZYA', right2: on(t, T.boomK) ? 'SAAT 10.02' : '', p: pIn('l02') }); return; }
      if (t < L.l04.t0) { row({ label: 'BASINÇ DALGASI', num: 'Günlerce', unit: '', right1: 'DÜNYANIN', right2: 'ÇEVRESİNDE' }); return; }
      if (t < L.l05.t0) { row({ label: 'BASINÇ DALGASI', num: on(t, T.elli) ? '50+' : '', unit: on(t, T.elli) ? 'istasyon' : '', right1: on(t, T.baro) ? 'BAROMETRE' : '', right2: on(t, T.baro) ? 'KAYDI' : '' }); return; }
      if (t < L.l07.t0) { row({ label: 'RODRIGUES ADASI', num: 'Saatler', unit: 'sonra', right1: 'HİNT OKYANUSU', right2: on(t, T.oysa) ? 'TOP DEĞİL' : on(t, T.top) ? '"TOP SESİ"' : '' }); return; }
      row({ label: 'ADA İLE YANARDAĞ ARASI', num: on(t, T.k4800) ? '4.800' : '', unit: on(t, T.k4800) ? 'km' : '', right1: on(t, T.k4800) ? 'YAKLAŞIK' : '', right2: '' }); return;
    }
    if (t < L.l09.t0 - 0.06) return;
    if (t < T.cmp0) {
      if (t < L.l10.t0) { row({ label: 'HUNGA TONGA · 2022', num: '15 Ocak', unit: '', right1: 'PASİFİK', right2: on(t, T.deniz) ? 'DENİZ ALTINDA' : '', p: pIn('l09') }); return; }
      if (t < L.l11.t0) { row({ label: 'BASINÇ DALGASI', num: on(t, T.ayni) ? 'Aynı' : '', unit: on(t, T.ayni) ? 'büyüklükte' : '', right1: 'KRAKATOA', right2: '1883' }); return; }
      if (t < L.l12.t0) { const n = Math.min(4, Math.floor(lambPhase(t) + 1e-6)); row({ label: on(t, T.alti) ? 'BASINÇ DALGASI · 6 GÜNDE' : 'BASINÇ DALGASI', num: n > 0 ? String(n) : '0', unit: 'tur', right1: 'DÜNYANIN', right2: 'ÇEVRESİ' }); return; }
      if (t < L.l13.t0) { row({ label: 'GÜMBÜRTÜLER', num: on(t, T.alaska) ? "Alaska'da" : '', unit: on(t, T.alaska) ? 'duyuluyor' : '', right1: '', right2: '' }); return; }
      row({ label: 'TONGA İLE ALASKA ARASI', num: on(t, T.t10000) ? '10.000' : '', unit: on(t, T.t10000) ? 'km' : '', right1: on(t, T.t10000) ? 'YAKLAŞIK' : '', right2: '' }); return;
    }
    if (t < L.l15.t0 - 0.06) { row({ label: 'AYNI ÖLÇEK', num: '', unit: '', right1: 'KRAKATOA', right2: 'TONGA', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.p16 - 0.06) { row({ label: 'KRAKATOA · 1883', num: on(t, T.k15) ? '4.800' : '', unit: on(t, T.k15) ? 'km' : '', right1: '', right2: '' }); return; }
    if (t < T.ask) { const hit = on(t, T.iki); row({ label: 'TONGA · 2022', num: hit ? '10.000' : '', unit: hit ? 'km' : '', red: hit, right1: 'KRAKATOA: 4.800 km', right2: hit ? 'YAKLAŞIK 2 KATI' : '', p: Math.max(0.35, ease.enter(seg(t, T.p16 - 0.06, 0.35))) }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (t < T.loop0 ? 1 : 0);
    setFont(ctx, F.head(80)); revealText(ctx, 'Krakatoa mı, Tonga mı?', SAFE.x0, 672, 80, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    globe(t);
    ruler(t);
    const r1 = sched(t); if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, r1.k);
    // takip çağrısı: soru boyunca, döngüden önce söner
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (t < T.loop0 ? 1 : 0); chip('TAKİP ET:', SAFE.x0, 532, kf, 'left', C.ink, 40); chip('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 590, kf, 'left', C.ink, 40); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

// "Ömür" şablonu (Hangisi daha şaşırtıcı?): 122 yıl 164 gün yaşayan Jeanne Calment (1875–1997) ve yaşı göz merceğinden
// ölçülen Grönland köpekbalığı (Nielsen ve ark. 2016: yaklaşık 392 yıl, %95 aralık 272–512). A: Calment'ın hayatı bir
// halka diski olarak büyür (her halka 1 yıl); Eyfel (1889), Van Gogh (1888, kendi anlatımı), bisiklet (100 yaş) halkasına
// iliştirilir. B: buzlu, karanlık Kuzey Atlantik'te yüzen köpekbalığı; 28 köpekbalığı; büyüteç göze iner, merceğin kesiti
// büyüyüp kıyas diskine dönüşür (kesmenin öbür yanına taşınan nesne). Kıyas: merceğin yarıçapı bir yaş cetveli; Calment'ın
// 122 yılı içeriden üç kez sığar, dorukta kırmızı. Anlatım saattir (yolculuk_core.buildYolTimeline); her şey t'nin saf
// fonksiyonudur. Kare 0 = başlık + boş halka kılavuzu; köpekbalığı halkası 3. karede çizilmeye başlar, döngü sonunda
// kıyas diski kılavuza geri sarılır. Paneller arası sert kesme: disk merkezi doğum noktası, sonra köpekbalığının gözü olur.
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe } from '../globe.js';
import { drawShark, SHARK_EYE, drawEiffel, drawPalette, drawBicycle, lensRings } from '../omur_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 205, y: 885, r: 118 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// kıyas diski: yarıçap = yaş (köpekbalığının tahmini 392 yılı = 320 px)
const DC = { x: 540, y: 1125 }, R0 = 320;
// Calment diski (A): her halka bir yıl; merkezi kıyas diskinin merkezi (kesmede taşınan nokta)
const DA = DC, KA = 2.8;
const ARLES = [4.63, 43.68], GREENLAND = [-42, 69];
const EIFFEL = { x: 160, y: 1000, h: 210, age: 14 }, PALETTE = { x: 858, y: 905, s: 118, age: 13 }, BIKE = { x: 190, y: 1402, s: 200, age: 100 };

function Wn(tl, id, key, nth = 1) {
  const ws = tl.L[id].words.filter(w => w.w.toLocaleLowerCase('tr').startsWith(key.toLocaleLowerCase('tr')));
  if (!ws[nth - 1]) throw new Error(`kelime yok: ${id} ${key} #${nth}`);
  return ws[nth - 1].t0;
}

export function omurTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    born: Wd('l02', 'bin'), arl: Wd('l02', 'arl'), eyfel: Wd('l03', 'eyfel'), age14: Wd('l03', 'on'), van: Wd('l04', 'van'),
    yuz: Wd('l05', 'yüz'), bis: Wd('l05', 'bisiklete'), died: Wd('l06', 'bin'), n122: Wd('l07', 'yüz'), n164: Wn(tl, 'l07', 'yüz', 2),
    cutA: L.l02.t0, cutB: L.l08.t0 - 0.15,
    kopek: Wd('l08', 'köpekbalığı'), gron: L.l09.t0, buz: Wd('l09', 'buz'), karanlik: Wd('l09', 'karanlık'), y150: Wd('l10', 'yüz'),
    y2016: Wd('l11', 'iki'), n28: Wd('l11', 'yirmi'), goz: Wd('l11', 'göz'), morph0: L.l12.t0 - 0.2, morph1: L.l12.t0 + 0.8,
    y1500: Wd('l12', 'bin'), y1700: Wn(tl, 'l12', 'bin', 2), n392: Wd('l13', 'üç'), cmp0: L.l14.t0 - 0.1, cmp1: L.l14.end + 0.25, s122: Wd('l15', 'yüz'),
    p16: L.l16.t0, ann2: Wd('l16', 'ise'), ann3: Wd('l16', 'ömrün'), hero: L.l17.t0 - 0.05, n3: L.l17.t0, ask: L.l18.t0, loop0: tl.loop0,
  };
  return T;
}

export async function makeOmurRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = omurTimes(tl);
  // döngü dikişi: sürekli döngülerin hızı film süresine tam bölünür (son kare = kare 0)
  const rq = r => Math.round(r * D) / D;
  const TAU = Math.PI * 2;
  const rnd = mulberry32(63);
  const snow = Array.from({ length: 46 }, () => [rnd(), rnd(), lerp(0.03, 0.07, rnd()), lerp(1.6, 3.2, rnd())]);
  // buz kütleleri: düzensiz, farklı boyda; su altındaki gövde (omurga) yüzeydekinden derin
  const floes = [[-60, 230, 70], [205, 150, 46], [390, 300, 96], [730, 120, 38], [880, 260, 80]].map(([x, w, h]) => {
    const n = 9, P = [];
    for (let i = 0; i <= n; i++) { const u = i / n; P.push([x + w * u, STAGE_TOP + h * (0.55 + 0.45 * Math.sin(Math.PI * u)) * lerp(0.75, 1.1, rnd())]); }
    return { x, w, P };
  });

  function chip(s, x, y, a = 1, al = 'left', col = C.ink, fs = 40) {
    if (a <= 0) return; setFont(ctx, F.mono(fs)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - fs, tw + 20, fs + 14); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }
  const ring = (x, y, r, lw, col, a0 = -Math.PI / 2, sweep = 1, dash = null) => {
    if (r <= 0 || sweep <= 0) return; ctx.beginPath(); ctx.arc(x, y, r, a0, a0 + TAU * sweep); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  };
  // kırmızıdan mürekkebe (doruk sonrası); u=1 kırmızı
  const INK80 = 'rgba(28,27,24,0.82)';
  const redInk = u => `rgb(${Math.round(lerp(28, 224, u))},${Math.round(lerp(27, 57, u))},${Math.round(lerp(24, 28, u))})`;

  // ——— deniz karı (sürekli döngü; B ve kıyas) ———
  function marineSnow(t, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.ink;
    for (const [px, py, sp, s] of snow) { const u = (py + t * rq(sp)) % 1, x = px * W + Math.sin(u * TAU * 2 + px * 30) * 18, y = STAGE_TOP + 10 + u * (1920 - STAGE_TOP); ctx.globalAlpha = a * 0.4; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  // ——— kıyas diski (merceğin kesiti) ———
  // cx, cy, R: ekrandaki yer ve 392 yılın yarıçapı; ts: durum zamanı; full: kıyas katmanları çizilsin mi
  function lensDisc(t, ts, cx, cy, R, full = true) {
    const k = R / 392, rot = t * rq(0.12) * TAU;
    // belirsizlik bandı (272–512): disk kenarından önce, arkada
    const bandU = full ? ease.state(seg(ts, T.n392 + 0.1, 0.7)) : 0;
    if (bandU > 0) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 512 * k, 0, TAU); ctx.arc(cx, cy, 272 * k, 0, TAU, true); ctx.clip('evenodd');
      ctx.strokeStyle = `rgba(139,133,119,${0.45 * bandU})`; ctx.lineWidth = 1.2;
      for (let d = -520; d < 520; d += 11) { ctx.beginPath(); ctx.moveTo(cx + d - 400, cy - 400); ctx.lineTo(cx + d + 400, cy + 400); ctx.stroke(); }
      ctx.restore();
      ring(cx, cy, 512 * k, 2, C.graphite, -Math.PI / 2, bandU, [8, 7]);
    }
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = C.paper; ctx.fill();
    ctx.save(); ctx.translate(cx, cy); lensRings(ctx, R, 39, rot, 1, 3); ctx.restore();
    if (bandU > 0) ring(cx, cy, 272 * k, 2, C.graphite, -Math.PI / 2, bandU, [8, 7]);
    ring(cx, cy, R, 3.5, C.ink);
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
    if (!full) return;
    // doğum aralığı (l12–l13): merkezde 1500'ler–1700'ler, kenarda 2016 (yakalandığı yıl)
    const ya = ease.enter(seg(ts, T.y1500 - 0.04, 0.35)) * (1 - ease.exit(seg(ts, T.cmp0 + 0.1, 0.3)));
    if (ya > 0) {
      const ang = -55 * Math.PI / 180, ux = Math.cos(ang), uy = Math.sin(ang);
      ctx.save(); ctx.globalAlpha *= ya; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + ux * R, cy + uy * R); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      chip(ts >= T.y1700 - 0.04 ? "1500'LER–1700'LER" : "1500'LER–", cx, cy + 62, ya, 'center', C.ink, 40);
      const u = ease.enter(seg(ts, T.y1500 + 0.3, 0.35)) * (1 - ease.exit(seg(ts, T.cmp0 + 0.1, 0.3)));
      ctx.save(); ctx.globalAlpha *= u; ctx.beginPath(); ctx.arc(cx + ux * R, cy + uy * R, 7, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore();
      chip('2016', cx + ux * R + 18, cy + uy * R + 14, u, 'left', C.ink, 40);
    }
    // bant etiketi
    if (bandU > 0) { chip('%95 ARALIK:', SAFE.x0, 1350, ease.enter(seg(ts, T.n392 + 0.5, 0.4)), 'left', INK80, 44); chip('272–512 YIL', SAFE.x0, 1404, ease.enter(seg(ts, T.n392 + 0.6, 0.4)), 'left', INK80, 44); }
    // kıyas: yaş cetveli (yarıçap) ve Calment'ın 122 yılı; doruğa kadar iki kopya daha
    const ca = ease.enter(seg(ts, T.cmp0 + 0.2, 0.4));
    if (ca <= 0) return;
    const redU = ts < T.hero ? 0 : ease.enter(seg(ts, T.hero, 0.3)) * (1 - ease.state(seg(ts, T.ask + 0.2, 0.5)));
    const col = redInk(redU);
    const steps = [[T.s122 - 0.04, 1], [T.ann2 - 0.04, 2], [T.ann3 - 0.04, 3]];
    // kalan dilim (366–392) dorukta kırmızı tarama
    if (redU > 0) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.arc(cx, cy, 3 * 122.45 * k, 0, TAU, true); ctx.clip('evenodd'); ctx.strokeStyle = `rgba(224,57,28,${0.6 * redU})`; ctx.lineWidth = 2.4; for (let d = -400; d < 400; d += 9) { ctx.beginPath(); ctx.moveTo(cx + d - 300, cy - 300); ctx.lineTo(cx + d + 300, cy + 300); ctx.stroke(); } ctx.restore(); }
    for (const [tk, n] of steps) {
      const u = ease.enter(seg(ts, tk, 0.45)); if (u <= 0) continue;
      const r0 = (n - 1) * 122.45 * k, r1 = n * 122.45 * k;
      // ilk halka (Calment): hafif tarama dolgusu
      if (n === 1) { ctx.save(); ctx.globalAlpha *= u; ctx.beginPath(); ctx.arc(cx, cy, r1, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1.3; for (let d = -120; d < 120; d += 8) { ctx.beginPath(); ctx.moveTo(cx + d - 100, cy + 100); ctx.lineTo(cx + d + 100, cy - 100); ctx.stroke(); } ctx.restore(); }
      ring(cx, cy, r1, 5, col, Math.PI * 0.5, u);
      // cetvel parçası
      ctx.beginPath(); ctx.moveTo(cx + r0, cy); ctx.lineTo(cx + lerp(r0, r1, u), cy); ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + r1, cy - 14); ctx.lineTo(cx + r1, cy + 14); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke();
      chip(String(n * 122), cx + r1, cy + 62, u, 'center', col, 40);
    }
    // cetvelin kalanı ve uçları
    ctx.save(); ctx.globalAlpha *= ca;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R, cy); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + R, cy - 18); ctx.lineTo(cx + R, cy + 18); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    chip('0', cx - 4, cy + 62, ca, 'center', C.ink, 40);
    chip('392', cx + R, cy - 30, ca, 'center', C.ink, 40);
    chip('KÖPEKBALIĞI', cx, cy - R - 16, ca, 'center', C.ink, 40);
    chip('CALMENT', cx - 4, cy - 122.45 * k - 14, ease.enter(seg(ts, T.s122, 0.4)), 'center', col, 36);
  }

  // ——— A: Calment'ın halka diski ———
  function ageAt(t) {
    if (t < T.born) return 0;
    if (t < T.age14) return 14 * seg(t, T.born, T.age14 - T.born);
    // Van Gogh (1888) anlatılırken sayaç 1890'ı geçmez; sonra zaman akar: "yüz" kelimesinde 100
    if (t < T.van + 0.7) return 14 + 0.9 * seg(t, T.age14, T.van + 0.7 - T.age14);
    if (t < T.yuz) return 14.9 + 85.1 * ease.state(seg(t, T.van + 0.7, T.yuz - T.van - 0.7));
    if (t < L.l05.end) return 100 + 0.9 * seg(t, T.yuz, L.l05.end - T.yuz);
    if (t < T.died) return 100.9 + 21.1 * ease.state(seg(t, L.l05.end, T.died - L.l05.end));
    return 122 + 0.45 * ease.state(seg(t, T.n122, T.n164 + 0.6 - T.n122));
  }
  function panelA(t) {
    // ilk yıllarda diske yakın plan: yaş büyüdükçe kamera geri çekilir (log uzayda; 70 yaşında genel plan)
    const a = ageAt(t), rot = t * rq(0.1) * TAU, kz = KA * Math.exp(Math.log(3.2) * (1 - clamp01(a / 70)))
      * (1 + 0.3 * seg(t, T.age14, T.van + 0.7 - T.age14) * (1 - clamp01((a - 14.9) / 40)));   // Eyfel → Van Gogh: diske yavaş yaklaşma
    // halkalar: her yıl ince, her 10 yıl koyu; büyüyen dış halka kalın mürekkep
    for (let y = 1; y <= Math.floor(a); y++) {
      const r = y * kz; ctx.beginPath();
      for (let k = 0; k <= 60; k++) { const an = k / 60 * TAU, w = 1 + 0.01 * Math.sin(an * 3 + y * 1.3 + rot) + 0.006 * Math.sin(an * 7 - y + rot * 1.5); const x = DA.x + Math.cos(an) * r * w, yy = DA.y + Math.sin(an) * r * w; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.closePath(); ctx.lineWidth = y % 10 === 0 ? 1.6 : 0.8; ctx.strokeStyle = y % 10 === 0 ? 'rgba(28,27,24,0.8)' : 'rgba(139,133,119,0.75)'; ctx.stroke();
    }
    if (t >= T.cutA) { const pulse = 1 + 0.25 * Math.sin(t * rq(1.2) * TAU); ctx.beginPath(); ctx.arc(DA.x, DA.y, 6 * pulse, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); }
    if (a > 0.3) ring(DA.x, DA.y, a * kz, t >= T.died ? 5 : 3, C.ink);
    // zaman ibresi: merkezden büyüyen halkaya, saniyede yarım tur (sürekli döngü; yıllar akar, sahne hiç donmaz)
    if (t >= T.born && a > 0.3) {
      const an = -Math.PI / 2 + t * rq(0.5) * TAU, rr = a * kz, ux = Math.cos(an), uy = Math.sin(an);
      // ibrenin arkasında tarama dilimi (geçen zaman)
      ctx.beginPath(); ctx.moveTo(DA.x, DA.y); ctx.arc(DA.x, DA.y, 352, an - 0.7, an); ctx.closePath(); ctx.fillStyle = "rgba(139,133,119,0.16)"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(DA.x + ux * rr, DA.y + uy * rr); ctx.lineTo(DA.x + ux * 352, DA.y + uy * 352); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.setLineDash([5, 7]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(DA.x, DA.y); ctx.lineTo(DA.x + ux * rr, DA.y + uy * rr); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.arc(DA.x + ux * rr, DA.y + uy * rr, 8, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
    }
    // ölüm: son halka bir kez daha çizilir
    if (t >= T.died) ring(DA.x, DA.y, a * kz + 9, 2, C.ink, -Math.PI / 2, ease.state(seg(t, T.died, 0.8)), [10, 7]);
    // iliştirmeler: simgeden ilgili yaş halkasına kesik çizgi
    const attach = (P, tk, ax, ay) => {
      const u = ease.enter(seg(t, tk - 0.04, 0.4)); if (u <= 0) return 0;
      const dx = ax - DA.x, dy = ay - DA.y, d = Math.hypot(dx, dy), r = P.age * kz, px = DA.x + dx / d * r, py = DA.y + dy / d * r;
      ctx.save(); ctx.globalAlpha = u; ctx.beginPath(); ctx.moveTo(lerp(ax, px, 0), lerp(ay, py, 0)); ctx.lineTo(lerp(ax, px, u), lerp(ay, py, u)); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); ring(DA.x, DA.y, r, 2.5, C.ink, Math.atan2(dy, dx) - 0.5 * u, u * 0.16); ctx.restore();
      return u;
    };
    // Eyfel (l03): roundel kalkınca aynı köşede
    { const u = attach(EIFFEL, T.eyfel, EIFFEL.x + 40, EIFFEL.y - 90); if (u > 0) { ctx.save(); ctx.globalAlpha = u; ctx.translate(EIFFEL.x, EIFFEL.y + 30 * (1 - u)); drawEiffel(ctx, EIFFEL.h); ctx.restore(); chip('1889', SAFE.x0, EIFFEL.y + 62, u); chip('14 YAŞ', SAFE.x0, EIFFEL.y + 118, ease.enter(seg(t, T.age14 - 0.04, 0.35))); } }
    { const u = attach(PALETTE, T.van, PALETTE.x - 50, PALETTE.y + 10); if (u > 0) { ctx.save(); ctx.globalAlpha = u; ctx.translate(PALETTE.x, PALETTE.y); ctx.rotate(0.12 * Math.sin(t * rq(0.4) * TAU)); drawPalette(ctx, PALETTE.s); ctx.restore(); chip('1888', SAFE.x1, 772, u, 'right'); chip('VAN GOGH', SAFE.x1, 828, u, 'right'); } }
    { const u = attach(BIKE, T.bis, BIKE.x + 70, BIKE.y - 120); if (u > 0) { ctx.save(); ctx.globalAlpha = u; ctx.translate(BIKE.x, BIKE.y); drawBicycle(ctx, BIKE.s, t * rq(0.8) * TAU); ctx.restore(); chip('1975', SAFE.x0, 1222, u); chip('100 YAŞ', SAFE.x0, 1278, u); } }
    if (t >= T.died - 0.04) chip('1997', SAFE.x1, DA.y + 14, ease.enter(seg(t, T.died - 0.04, 0.35)), 'right');
    // Arles: roundel'de gerçek harita (l02), Eyfel gelince çekilir
    const rk = ease.enter(seg(t, T.cutA, 0.4)) * (1 - ease.exit(seg(t, T.eyfel - 0.35, 0.3)));
    if (rk > 0) globeRoundel(t, { c: [ARLES[0] + 2 - 1.5 * seg(t, T.cutA, 3), ARLES[1] - 1], r: 900 }, ARLES, 'ARLES', rk, T.arl);
  }

  function globeRoundel(t, cam, pin, name, k, tName) {
    const r = ROUND.r * ease.enter(k);
    ctx.save(); ctx.beginPath(); ctx.arc(ROUND.x, ROUND.y, r, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    G.setCam({ ...cam, cx: ROUND.x, cy: ROUND.y }); G.draw();
    if (G.visible(pin)) { const q = G.proj(pin), pr = 1 + 0.2 * Math.sin(t * rq(1.1) * TAU); ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); ctx.beginPath(); ctx.arc(q[0], q[1], 18 * pr, 0, TAU); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(ROUND.x, ROUND.y, r, 0, TAU); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
    chip(name, ROUND.x, ROUND.y + ROUND.r + 52, k * ease.enter(seg(t, tName - 0.04, 0.35)), 'center');
  }

  // ——— B: Kuzey Atlantik ———
  const SH = { L: 700, y: DC.y - SHARK_EYE[1] * 700 };
  const SX0 = DC.x - SHARK_EYE[0] * 700;
  const sharkX = t => lerp(SX0, SX0 - 240, seg(t, T.cutB, T.morph1 - T.cutB));
  function ocean(t, a = 1) {
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    // gravür deniz: derine indikçe koyulaşan yatay çizgiler, hafif dalgalı (sürekli döngü)
    for (let y = STAGE_TOP + 6; y < 1920; y += 7) { const d = (y - STAGE_TOP) / 1215; ctx.strokeStyle = `rgba(28,27,24,${0.22 + 0.5 * d})`; ctx.lineWidth = 1 + 1.1 * d; ctx.beginPath(); for (let x = 0; x <= W; x += 40) { const yy = y + Math.sin(x * 0.012 + y * 0.05 + t * rq(0.3) * TAU) * 1.6; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
    // buz kütleleri (üstte): kâğıt, dikey tarama, mürekkep kenar; çok yavaş kayar
    const drift = -40 * seg(t, T.cutB, T.morph1 - T.cutB);
    for (const f of floes) {
      const path = () => { ctx.beginPath(); ctx.moveTo(f.x + drift, STAGE_TOP - 2); f.P.forEach(([px, py]) => ctx.lineTo(px + drift, py)); ctx.lineTo(f.x + f.w + drift, STAGE_TOP - 2); ctx.closePath(); };
      path(); ctx.fillStyle = '#F4EEE1'; ctx.fill();
      ctx.save(); path(); ctx.clip(); ctx.strokeStyle = 'rgba(139,133,119,0.7)'; ctx.lineWidth = 1.1; for (let xx = f.x - 120; xx < f.x + f.w + 40; xx += 7) { ctx.beginPath(); ctx.moveTo(xx + drift, STAGE_TOP); ctx.lineTo(xx + drift + 90, STAGE_TOP + 110); ctx.stroke(); } ctx.restore();
      path(); ctx.lineWidth = 2.4; ctx.strokeStyle = C.ink; ctx.stroke();
    }
    ctx.restore();
  }
  function panelB(t) {
    // dönüşümde okyanus saydamlaşmaz: büyüyen merceğin kâğıt halesi üstünü örter (hayalet kare yok)
    const fade = 1;
    ocean(t, fade);
    ctx.save(); ctx.globalAlpha = fade;
    marineSnow(t, 1);
    const sx = sharkX(t);
    ctx.save(); ctx.translate(sx, SH.y); drawShark(ctx, SH.L, t * rq(0.45), 0.035); ctx.restore();
    // kesmede taşınan nokta: göz, yarım saniye halkayla işaretli
    { const k = 1 - ease.exit(seg(t, T.cutB + 0.3, 0.4)); if (k > 0) { const ex = sx + SHARK_EYE[0] * SH.L, ey = SH.y + SHARK_EYE[1] * SH.L; ctx.save(); ctx.globalAlpha *= k; ring(ex, ey, 18, 3, C.ink); ctx.restore(); } }
    // 28 köpekbalığı: birer birer damga (50 ms arayla), sol altta 4 × 7
    if (t >= T.n28 - 0.04) for (let i = 0; i < 28; i++) {
      const u = ease.enter(seg(t, T.n28 - 0.04 + i * 0.05, 0.25)); if (u <= 0) continue;
      const c = i % 7, r = Math.floor(i / 7);
      ctx.save(); ctx.globalAlpha = fade * u; ctx.translate(140 + c * 84, 1268 + r * 46); drawShark(ctx, 72, (t * rq(0.45) + i * 0.13) % 1, 0.03); ctx.restore();
    }
    ctx.restore();
    if (t >= T.gron - 0.1) {
      const rk = ease.enter(seg(t, T.gron - 0.1, 0.4)) * (1 - ease.exit(seg(t, T.y2016 - 0.35, 0.3)));
      if (rk > 0) globeRoundel(t, { c: [GREENLAND[0] - 4 + 3 * seg(t, T.gron, 4), GREENLAND[1] - 8], r: 330 }, GREENLAND, 'GRÖNLAND', rk * fade, T.gron);
    }
  }
  // büyüteç göze iner (l11 "göz"), l12'de merceğin kesiti kıyas diskine dönüşür
  function lensGeom(t) {
    const sx = sharkX(t), ex = sx + SHARK_EYE[0] * SH.L, ey = SH.y + SHARK_EYE[1] * SH.L;
    const k1 = ease.enter(seg(t, T.goz - 0.04, 0.5));
    const L0 = { x: lerp(ex, ex + 150, k1), y: lerp(ey, ey - 210, k1), r: lerp(12, 108, k1) };
    const m = ease.state(seg(t, T.morph0, T.morph1 - T.morph0));
    const cx = lerp(L0.x, DC.x, m), cy = lerp(L0.y, DC.y, m), r = Math.exp(lerp(Math.log(L0.r), Math.log(R0), m));
    return { ex, ey, k1, m, cx, cy, r };
  }
  function lensMorph(t) {
    if (t < T.goz - 0.04 || t >= T.morph1 + 0.05) return null;
    const { ex, ey, k1, m, cx, cy, r } = lensGeom(t);
    // kâğıt hale: merceğin çevresinden büyüyüp okyanusu örter
    if (t >= T.morph0) { const ri = r + 1500 * ease.state(seg(t, T.morph0 + 0.2, T.morph1 - T.morph0 - 0.2)); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, ri, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip(); marineSnow(t, 0.8); ctx.restore(); if (ri < 1400) ring(cx, cy, ri, 2, C.graphite); }
    // büyüteç sapı ve göze bağlantı (dönüşümde söner)
    if (m < 1) { ctx.save(); ctx.globalAlpha = 1 - m; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(cx - r * 0.5, cy + r * 0.86); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(ex, ey, 16, 0, TAU); ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    lensDisc(t, t, cx, cy, r, false);
    if (m < 0.6) chip('GÖZ MERCEĞİ', cx, cy - r - 16, k1 * (1 - seg(m, 0.2, 0.4)), 'center', C.ink, 36);
    return { cx, cy, r };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(64); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.age14, 'sasirma', 'saskin'], [T.age14 + 1.2, 'ayakta', 'notr'], [T.bis, 'ayakta', 'dusunceli'], [T.n122, 'sasirma', 'saskin'], [T.n122 + 1.4, 'ayakta', 'notr'],
    [T.kopek, 'ayakta', 'dusunceli'], [T.y150, 'sasirma', 'saskin'], [T.y150 + 1.2, 'ayakta', 'notr'], [T.n392, 'sasirma', 'saskin'], [T.n392 + 1.4, 'ayakta', 'dusunceli'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'notr'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[L.l07.end + 0.05, T.cutB - 0.3, 'Daha uzunu var mı?']];
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
      setFont(ctx, F.name(44)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - 390;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 38, w, 64, 32); ctx.moveTo(x + w - 30, y + 26); ctx.lineTo(x + w + 6, y + 70); ctx.lineTo(x + w - 54, y + 26);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  const MASKS = { l02: [['1875', T.born]], l03: [['14', T.age14]], l05: [['100', T.yuz]], l06: [['1997', T.died]], l07: [['122', T.n122], ['164', T.n164]],
    l10: [['150', T.y150]], l11: [['2016', T.y2016], ['28', T.n28]], l12: [['1500', T.y1500], ['1700', T.y1700]], l13: [['392', T.n392]], l15: [['122', T.s122]], l16: [['3', T.n3]] };
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
    setFont(ctx, F.head(66)); revealText(ctx, '122 yıl mı, 392 yıl mı?', SAFE.x0, 670, 66, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(40)); revealText(ctx, label, SAFE.x0, 590, 40, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(44));
    if (right1) revealText(ctx, right1, SAFE.x1, 630, 44, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 44, p, INK80, 'right');
  }
  const on = tk => (t => t >= tk - 0.04);
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pIn = id => Math.max(0.35, ease.enter(seg(t, L[id].t0 - 0.06, 0.35)));
    if (t < L.l08.t0 - 0.06) {
      const a = ageAt(t);
      if (t < L.l07.t0) { row({ label: 'JEANNE CALMENT · ARLES', num: t >= T.born - 0.04 ? String(1875 + Math.floor(a)) : '', unit: t >= T.born - 0.04 ? `· ${Math.floor(a)} yaşında` : '', right1: 'HER HALKA', right2: '1 YIL', p: pIn('l02') }); return; }
      row({ label: 'JEANNE CALMENT · 1875–1997', num: on(T.n122)(t) ? '122 yıl' : '', unit: on(T.n164)(t) ? '164 gün' : '', right1: 'BELGELENMİŞ', right2: 'EN UZUN ÖMÜR' }); return;
    }
    if (t < L.l09.t0 - 0.06) return;
    if (t < L.l10.t0 - 0.06) { row({ label: 'GRÖNLAND KÖPEKBALIĞI', num: 'Kuzey Atlantik', unit: '', right1: t >= T.buz ? 'BUZ GİBİ' : '', right2: t >= T.karanlik ? 'KARANLIK' : '', p: pIn('l09') }); return; }
    if (t < L.l11.t0 - 0.06) { row({ label: 'GRÖNLAND KÖPEKBALIĞI', num: on(T.y150)(t) ? '150' : '', unit: on(T.y150)(t) ? 'yaşına yakın yetişkin' : '', right1: '', right2: '' }); return; }
    if (t < L.l12.t0 - 0.06) { row({ label: on(T.y2016)(t) ? 'BİLİM İNSANLARI · 2016' : 'BİLİM İNSANLARI', num: on(T.n28)(t) ? '28' : '', unit: on(T.n28)(t) ? 'köpekbalığı' : '', right1: t >= T.goz - 0.04 ? 'GÖZ MERCEĞİ' : '', right2: t >= T.goz - 0.04 ? 'RADYOKARBON' : '' }); return; }
    if (t < L.l13.t0 - 0.06) { row({ label: 'EN BÜYÜĞÜ · DOĞUMU', num: on(T.y1700)(t) ? '1500–1700' : on(T.y1500)(t) ? '1500–' : '', unit: on(T.y1700)(t) ? 'arası' : '', right1: 'MUHTEMELEN', right2: '' }); return; }
    if (t < T.cmp0) { row({ label: 'EN BÜYÜĞÜ · TAHMİNİ YAŞ', num: on(T.n392)(t) ? '392' : '', unit: on(T.n392)(t) ? 'yaşında' : '', right1: 'YAKLAŞIK', right2: '' }); return; }
    if (t < L.l15.t0 - 0.06) { row({ label: 'AYNI CETVEL', num: '', unit: '', right1: 'MERKEZ: DOĞUM', right2: 'KENAR: 2016', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.p16 - 0.06) { row({ label: 'CALMENT', num: on(T.s122)(t) ? '122' : '', unit: on(T.s122)(t) ? 'yıl' : '' }); return; }
    if (t < T.ask) { const o = on(T.n3)(t); row({ label: 'KÖPEKBALIĞI · TAHMİN', num: o ? '3' : '', unit: o ? 'katından fazla' : '', red: t >= T.hero, right1: 'CALMENT: 122 YIL', right2: 'KÖPEKBALIĞI: 392', p: Math.max(0.35, ease.enter(seg(t, T.p16 - 0.06, 0.35))) }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    let fs = 80; setFont(ctx, F.head(fs)); while (ctx.measureText('Calment mi, köpekbalığı mı?').width > SAFE.x1 - SAFE.x0 && fs > 50) { fs -= 2; setFont(ctx, F.head(fs)); }
    revealText(ctx, 'Calment mi, köpekbalığı mı?', SAFE.x0, 672, fs, p, C.ink);
  }

  // ——— kare ———
  // kılavuz: boş halka ve yaş ekseni (kare 0 ve döngü sonu)
  function guide() {
    ring(DC.x, DC.y, R0, 2, C.graphite, -Math.PI / 2, 1, [10, 9]);
    ctx.beginPath(); ctx.moveTo(DC.x, DC.y); ctx.lineTo(DC.x + R0, DC.y); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(DC.x, DC.y, 7, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
  }
  const wedge = (a0, a1) => { ctx.beginPath(); ctx.moveTo(DC.x, DC.y); ctx.arc(DC.x, DC.y, 1400, a0, a1); ctx.closePath(); ctx.clip(); };
  // kanca: 3. karede köpekbalığı halkası çizilmeye başlar, eksen 0,9 sn'de 392'ye uzar; l02'den önce disk merkezine çekilir
  function hook(t) {
    const u = ease.enter(seg(t, 0.1, 0.9)), sh = 1 - ease.exit(seg(t, T.cutA - 0.35, 0.35));
    ctx.save(); ctx.translate(DC.x, DC.y); ctx.scale(sh, sh); ctx.translate(-DC.x, -DC.y);
    guide();
    if (u > 0) {
      ctx.save(); wedge(-Math.PI / 2, -Math.PI / 2 + TAU * u); lensDisc(t, t, DC.x, DC.y, R0, false); ctx.restore();
      ctx.beginPath(); ctx.moveTo(DC.x, DC.y); ctx.lineTo(DC.x + R0 * u, DC.y); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(DC.x + R0 * u, DC.y - 16); ctx.lineTo(DC.x + R0 * u, DC.y + 16); ctx.lineWidth = 3; ctx.stroke();
      chip('0', DC.x - 4, DC.y + 62, u, 'center');
      chip(String(Math.round(392 * u)), DC.x + R0 * u, DC.y - 30, u, 'center');
      chip('KÖPEKBALIĞI', DC.x, DC.y - R0 - 16, ease.enter(seg(t, 0.6, 0.4)), 'center');
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(DC.x, DC.y, 7, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
  }
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const stage = fn => { ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); fn(); ctx.restore(); };
    if (t < T.cutA) stage(() => { marineSnow(t, 0.8); hook(t); });
    else if (t < T.cutB) stage(() => {
      // A, kesmeden önce doğum noktasına çekilir; kesmede nokta köpekbalığının gözü olur
      const s = ease.exit(seg(t, T.cutB - 0.35, 0.35));
      ctx.save(); if (s > 0) { ctx.translate(DA.x, DA.y); ctx.scale(1 - s, 1 - s); ctx.translate(-DA.x, -DA.y); } panelA(t); ctx.restore();
      if (s > 0) { ctx.beginPath(); ctx.arc(DA.x, DA.y, 8, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); }
    });
    else if (t < T.morph1 + 0.05) stage(() => { panelB(t); lensMorph(t); });
    else stage(() => {
      marineSnow(t, 0.8);
      // döngü sonu: kıyas diski saat yönünde geri sarılır, kılavuz kalır (kare 0)
      const uw = ease.state(seg(t, T.loop0 + 0.1, 0.8));
      guide();
      if (uw < 1) { ctx.save(); wedge(-Math.PI / 2 + TAU * uw, -Math.PI / 2 + TAU); lensDisc(t, t, DC.x, DC.y, R0, true); ctx.restore(); }
    });
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    // takip çağrısı: soru boyunca, döngüden önce söner
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET:', SAFE.x0, 532, kf, 'left', C.ink, 40); chip('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 590, kf, 'left', C.ink, 40); }
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

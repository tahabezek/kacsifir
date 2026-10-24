// "Şeker" şablonu (Kaç Sıfır?): Bütün insanlık bir çay şekerine sığar mı?
// Kare 0: soru başlık; ince belli çay bardağı, tabakta şeker küpü, küpe huni gibi akan kalabalık.
// l02: on'un kuvvetleri zoom'u (her katman gerçek boyunda, log uzayında): insan 2 m → el 12 cm → cilt hücreleri
//      0,2 mm → hücre çekirdeği 6 µm → DNA 20 nm → atom 0,3 nm; "boşluk"ta çekirdek işaretlenir (görünmez).
// l03: atom 700 m'lik daireye dönüşür (1 px = 1 m): 250 m'lik stadyum, merkezde 7 mm'lik bezelye (büyüteçte);
//      sonra daire küçülerek şeker küpünün yerine iner (nesne taşınır).
// l04: perspektifli meydanda kalabalık; "boşluğu"nda bardağın arkasından küpe çöker (1,3 sn), 0,4 sn tutulur.
// l05 (doruk): küp beyazlar, kırmızıya döner; kamera 600 ms'de küpe iter; "küçük"te kırmızı küp 4 cm³'lük kesik
//      konturun içine (kenar × 0,82) küçülür. l06: 500 milyon ton: bardak zıplar ve yatar, çay çalkalanır, tabak üç
//      parçaya ayrılır, masa kırılır; l07: küp düşer, kamera log uzayında uzaklaşarak izler (masa, zemin, toprak,
//      derinlik işaretleri gerçek ölçekte: 1 cm = 33 px). Döngü: hızlı geri sarma. Anlatım saattir; t'nin saf fonksiyonu.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { GLASS_CARD, drawTeaGlass, drawSaucer, drawSugarCube, drawTinyPerson, drawHand, drawCells, drawNucleus, drawDNA, drawAtom, drawStadium, drawPea } from '../seker_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// masa sahnesi (dünya koordinatı = kare 0 ekranı); gerçek ölçek: bardak 10 cm = 330 px → 1 cm = 33 px
const TABLE = 1330, SAUCER = { x: 420, w: 400 }, GLASS = { x: 392, h: 330 }, CUBE = { x: 548, y: 1344, s: 64 };
const PXCM = 33, FLOOR = TABLE + 75 * PXCM, PXM = 100 * PXCM;
const ZC = { x: 505, y: 1050 };   // zoom ve levha merkezi
const BASE = { x: 540, y: 1150 };  // dünya kamerası: odak = çapa iken kimlik dönüşümü

export function sekerTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    atoms: Wd('l02', 'atomlardan'), empty: Wd('l02', 'boşluk'), pea: Wd('l03', 'bezelye'), stadium: Wd('l03', 'stadyumdan'), olurdu: Wd('l03', 'olurdu'),
    crowd: L.l04.t0, sekiz: Wd('l04', 'sekiz'), remove: Wd('l04', 'boşluğu'), hero: L.l05.t0 - 0.04, kucuk: Wd('l05', 'küçük'), ton: Wd('l06', 'beş'),
    heavy: L.l07.t0, fallEnd: L.l07.end, loop0: tl.loop0,
  };
  T.zoom0 = L.l02.t0 - 0.1; T.zoom1 = T.empty - 0.15; T.plate = L.l03.t0 - 0.35; T.back = L.l04.t0 - 0.45; T.shrink = T.back - 0.4;
  T.imp1 = T.hero - 0.4; T.fall0 = T.ton + 0.35; T.inkTon = T.ton + 1.15; T.follow = L.l07.end + 0.35;
  return T;
}

export async function makeSekerRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = sekerTimes(tl);
  const rnd = mulberry32(47);
  const cyc = (t, per) => { const n = Math.max(1, Math.round(D / per)); return ((t / D) * n) % 1; };   // dikişte aynı fazda biter

  // ——— on'un kuvvetleri: katmanlar (gerçek genişlik m), çocuk merkezi ebeveyn biriminde ———
  const LEV = [
    { name: 'MASA', w: 50 },
    { name: 'İNSAN', w: 2, c: [0, 0] },
    { name: 'EL', w: 0.12, c: [0.11, 0.02] },
    { name: 'CİLT HÜCRELERİ', w: 2e-4, c: [-0.09, -0.5] },
    { name: 'HÜCRE ÇEKİRDEĞİ', w: 6e-6, c: [0, 0] },
    { name: 'DNA', w: 2e-8, c: [0.05, 0.03] },
    { name: 'ATOM', w: 3e-10, c: [0.12, -0.048] },
  ];
  const NL = LEV.length, K = 830 / 2;   // Zf = 0'da insan katmanı (2 m) ekrana sığar
  const Z = LEV.map(l => Math.log10(2 / l.w));
  const O = [[0, 0]];
  for (let i = 1; i < NL; i++) O.push([O[i - 1][0] + LEV[i].c[0] * LEV[i - 1].w, O[i - 1][1] + LEV[i].c[1] * LEV[i - 1].w]);
  const ZMIN = Z[0] + 0.12, ZMAX = Z[NL - 1] + 0.08;
  // her katmanda kısa duraklama: anahtar kareler katmanın ekranı doldurduğu yakınlıkta
  const ZK = [ZMIN, ...Z.slice(1, NL - 1), ZMAX], ZW = [0, 0.13, 0.15, 0.16, 0.14, 0.14, 0.14, 0.14];
  const zoomAt = t => { if (t < T.zoom0) return ZMIN; let a = T.zoom0; const span = T.zoom1 - T.zoom0; for (let i = 1; i < ZK.length; i++) { const b = a + span * ZW[i]; if (t < b || i === ZK.length - 1) return lerp(ZK[i - 1], ZK[i], ease.state(seg(t, a, b - a))); a = b; } return ZMAX; };
  // kamera: ekran uzayında geçiş (kalan pay büyütmeyle küçülür; milyon kat büyütmede sapma yok)
  function camF(z) {
    for (let i = 0; i < NL - 1; i++) if (z < Z[i + 1]) { const u = clamp01((z - Z[i]) / (Z[i + 1] - Z[i])), w = (1 - ease.state(u)) * Math.pow(10, Math.max(Z[i], ZMIN) - z); return [O[i + 1][0] - (O[i + 1][0] - O[i][0]) * w, O[i + 1][1] - (O[i + 1][1] - O[i][1]) * w]; }
    return O[NL - 1];
  }
  const fmtLen = m => { const f = (v, d) => v.toLocaleString('tr-TR', { maximumFractionDigits: d }); return m >= 1 ? `${f(m, 1)} m` : m >= 0.01 ? `${f(m * 100, 1)} cm` : m >= 1e-3 ? `${f(m * 1000, 1)} mm` : m >= 1e-6 ? `${f(m * 1e6, 1)} µm` : `${f(m * 1e9, 2)} nm`; };

  // ——— masa sahnesi parçaları ———
  const HERO_P = { x: 700, y: 1030 };
  const stream = Array.from({ length: 170 }, (_, i) => ({ off: (i / 170 + rnd() * 0.004) % 1, lane: rnd(), ph: rnd() * 6 }));
  function streamPeople(t, k) {
    if (k <= 0.01) return;
    for (const s of stream) {
      const u = (s.off + cyc(t, 6.2)) % 1, e = Math.pow(u, 1.25);
      const x0 = lerp(560, 900, s.lane), y0 = 790 + 40 * Math.sin(s.lane * 9), x = lerp(x0, CUBE.x + 8, e), y = lerp(y0, CUBE.y - 56, e), sz = lerp(30, 5, Math.pow(u, 0.9));
      ctx.save(); ctx.globalAlpha = k * Math.min(1, u * 10) * clamp01((1 - u) * 12); ctx.translate(x, y); drawTinyPerson(ctx, sz, s.ph + t * 7); ctx.restore();
    }
  }
  // küpün dış konturu (orijinal 4 cm³ küp): kesik çizgi
  function cubeOutline(x, y, size) {
    const P = [[-0.5, -0.78], [0.06, -1.05], [0.62, -0.78], [0.62, -0.06], [0.06, 0.2], [-0.5, -0.06]];
    ctx.save(); ctx.translate(x, y); ctx.beginPath(); P.forEach(([a, b], i) => (i ? ctx.lineTo(a * size, b * size) : ctx.moveTo(a * size, b * size))); ctx.closePath();
    ctx.setLineDash([size * 0.09, size * 0.07]); ctx.lineWidth = Math.max(1.5, size * 0.035); ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
  }
  // durum: masa, bardak, tabak, küp — st: { jump, tilt, slosh, pieces, brk, fallPx, cubeK, cubeCol, outline, dense, streamK }
  function tableFront(t, st) {
    ctx.save(); ctx.translate(SAUCER.x, TABLE - 6); drawSaucer(ctx, SAUCER.w, 0, st.pieces || 0); ctx.restore();
    ctx.save(); ctx.translate(GLASS.x + (st.pieces || 0) * -14, TABLE - 8 + (st.jump || 0)); drawTeaGlass(ctx, GLASS_CARD, { tea: 0.8, steam: cyc(t, 2.4) * 2.4, tilt: -(st.tilt || 0), slosh: st.slosh || 0 }, GLASS.h); ctx.restore();
    if (st.outline) cubeOutline(CUBE.x, CUBE.y, CUBE.s);
    // küp: düşerken de çizilir (dünya ölçeğinde; çok uzaktayken ekranda en az 16 px)
    const sz = CUBE.s * (st.cubeK ?? 1), y = CUBE.y + (st.fallPx || 0);
    const minW = 16 / (st.z || 1), drawSz = Math.max(sz, minW);
    ctx.save(); ctx.translate(CUBE.x, y);
    if (st.cubeCol === 'flash') { drawSugarCube(ctx, drawSz * 1.1, 'paper'); const P = [[-0.5, -0.78], [0.06, -1.05], [0.62, -0.78], [0.62, -0.06], [0.06, 0.2], [-0.5, -0.06]], q = drawSz * 1.1; ctx.beginPath(); P.forEach(([a, b], i) => (i ? ctx.lineTo(a * q, b * q) : ctx.moveTo(a * q, b * q))); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(); }
    else drawSugarCube(ctx, drawSz, st.cubeCol === 'red' ? 'red' : 'paper');
    if (st.dense > 0) { ctx.beginPath(); ctx.moveTo(-0.5 * drawSz, -0.78 * drawSz); ctx.lineTo(0.06 * drawSz, -1.05 * drawSz); ctx.lineTo(0.62 * drawSz, -0.78 * drawSz); ctx.lineTo(0.62 * drawSz, -0.06 * drawSz); ctx.lineTo(0.06 * drawSz, 0.2 * drawSz); ctx.lineTo(-0.5 * drawSz, -0.06 * drawSz); ctx.closePath(); ctx.lineWidth = 2 + 4 * st.dense; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.restore();
    streamPeople(t, st.streamK || 0);
  }
  function tableLine(st) {
    // masa üstü: kırılınca küpün altında açılan delik
    const b = st.brk || 0, hw = 70 * b;
    ctx.beginPath(); ctx.moveTo(-2000, TABLE); ctx.lineTo(CUBE.x - hw, TABLE); if (b > 0) { ctx.moveTo(CUBE.x + hw, TABLE); } ctx.lineTo(3000, TABLE); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // masa tablası (3 cm) ve kalınlık taraması
    ctx.save(); ctx.beginPath(); ctx.rect(-2000, TABLE, 5000, 3 * PXCM); if (b > 0) { ctx.moveTo(CUBE.x - hw, TABLE); ctx.lineTo(CUBE.x - hw * 0.6, TABLE + 3 * PXCM); ctx.lineTo(CUBE.x + hw * 0.7, TABLE + 3 * PXCM); ctx.lineTo(CUBE.x + hw, TABLE); ctx.closePath(); }
    ctx.clip('evenodd'); ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = 1.2; for (let x = -2000; x < 3000; x += 7) { ctx.beginPath(); ctx.moveTo(x, TABLE + 3 * PXCM); ctx.lineTo(x + 40, TABLE); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(-2000, TABLE + 3 * PXCM); ctx.lineTo(CUBE.x - hw * 0.6, TABLE + 3 * PXCM); ctx.moveTo(CUBE.x + hw * 0.7, TABLE + 3 * PXCM); ctx.lineTo(3000, TABLE + 3 * PXCM); ctx.lineWidth = 2; ctx.stroke();
    if (b > 0) { ctx.beginPath(); for (const [a, c2] of [[-1, -1.8], [1, 1.9], [-0.6, -1.2], [0.7, 1.4]]) { ctx.moveTo(CUBE.x + hw * a, TABLE + 4); ctx.lineTo(CUBE.x + hw * c2 * b, TABLE + 3 * PXCM * 0.8); } ctx.lineWidth = 2; ctx.stroke(); }
  }
  // masanın altı: bacaklar, oda, zemin döşemesi, toprak ve derinlik çizgileri (dünya ölçeği; yalnız görünen bölge)
  function underWorld(st, vy0, vy1, z) {
    if (vy1 < TABLE + 3 * PXCM) return;
    ctx.save();
    ctx.lineWidth = 3 / z; ctx.strokeStyle = C.ink; ctx.fillStyle = C.paper;
    // masa bacakları yalnız düşüşte (yakın planda kadraj dışında kalırlar)
    if (st.legK > 0) { ctx.save(); ctx.globalAlpha = st.legK; for (const lx of [120, 960]) { ctx.beginPath(); ctx.rect(lx - 2 * PXCM, TABLE + 3 * PXCM, 4 * PXCM, FLOOR - TABLE - 3 * PXCM); ctx.fill(); ctx.stroke(); } ctx.restore(); }
    if (st.fallPx <= 0 && !(st.legK > 0)) { ctx.restore(); return; }
    // döşeme (10 cm) ve delik
    const fh = 10 * PXCM, pass = st.fallPx > FLOOR - CUBE.y;
    ctx.save(); ctx.beginPath(); ctx.rect(-60000, FLOOR, 120000, fh); if (pass) { ctx.rect(CUBE.x - 3 * PXCM, FLOOR, 7 * PXCM, fh); } ctx.clip('evenodd');
    ctx.fillStyle = '#E6DCC6'; ctx.fillRect(-60000, FLOOR, 120000, fh); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-60000, FLOOR); ctx.lineTo(60000, FLOOR); ctx.moveTo(-60000, FLOOR + fh); ctx.lineTo(60000, FLOOR + fh); ctx.lineWidth = 3 / z; ctx.stroke();
    // toprak: ekranda ~7 px aralıklı eğik tarama, seyrek taşlar
    const sy0 = Math.max(FLOOR + fh, vy0), sy1 = vy1;
    if (sy1 > sy0) {
      ctx.save(); ctx.beginPath(); ctx.rect(-60000, sy0, 120000, sy1 - sy0); ctx.clip();
      const g = 9 / z; ctx.strokeStyle = 'rgba(28,27,24,0.32)'; ctx.lineWidth = 1 / z;
      const x0 = BASE.x - 900 / z, x1 = BASE.x + 900 / z;
      for (let x = Math.floor(x0 / g) * g; x < x1 + (sy1 - sy0); x += g) { ctx.beginPath(); ctx.moveTo(x, sy0); ctx.lineTo(x - (sy1 - sy0), sy1); ctx.stroke(); }
      const r = mulberry32(5); for (let i = 0; i < 420; i++) { const y = FLOOR + fh + r() * 24 * PXM, x = CUBE.x + (r() - 0.5) * 40 * PXM, rr = (0.5 + r() * 4) * PXCM * (1 + y / PXM * 0.05); if (y < sy0 - rr || y > sy1 + rr) continue; ctx.beginPath(); ctx.ellipse(x, y, rr * 1.4, rr, r(), 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 1.6 / z; ctx.strokeStyle = C.ink; ctx.stroke(); }
      ctx.restore();
    }
    // küpün izi (kesik çizgi) masadan küpe
    if (st.fallPx > 0) { ctx.beginPath(); ctx.moveTo(CUBE.x + 4, TABLE); ctx.lineTo(CUBE.x + 4, CUBE.y + st.fallPx - CUBE.s); ctx.setLineDash([10 / z, 8 / z]); ctx.lineWidth = 2 / z; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
  }
  // perspektifli meydan zemini (kalabalık için): ufuk ve kaçış çizgileri
  function plaza(k, grow) {
    if (k <= 0 || grow <= 0) return;
    ctx.save(); ctx.globalAlpha = k; const vp = [540, 744];
    ctx.beginPath(); ctx.moveTo(540 - 480 * grow, 770); ctx.lineTo(540 + 480 * grow, 770); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(139,133,119,0.55)';
    for (let i = -12; i <= 12; i++) { const ax = lerp(vp[0], 540 + i * 140, 0.06); ctx.beginPath(); ctx.moveTo(ax, 770); ctx.lineTo(lerp(ax, 540 + i * 140, grow), lerp(770, TABLE, grow)); ctx.stroke(); }
    for (let f = 0; f < 1; f += 0.08) { if (f > grow) break; const y = lerp(770, TABLE, f * f), hw = lerp(480, 560, f) * grow; ctx.beginPath(); ctx.moveTo(540 - hw, y); ctx.lineTo(540 + hw, y); ctx.stroke(); }
    ctx.restore();
  }

  // ——— on'un kuvvetleri zoom'u ———
  function zoomStage(t) {
    const z = zoomAt(t), cam = camF(z), s = K * Math.pow(10, z);
    const cu = ease.state(clamp01((z - ZMIN) / 1.2)), cx0 = lerp(HERO_P.x, ZC.x, cu), cy0 = lerp(HERO_P.y, ZC.y, cu);
    const toS = P => [cx0 + (P[0] - cam[0]) * s, cy0 + (P[1] - cam[1]) * s];
    // masa katmanı: kahraman kişi kökte; akış ve masa büyürken söner (dev siluet ve şerit kalmaz)
    const g = (LEV[0].w * s) / (LEV[0].w * K * Math.pow(10, ZMIN));
    if (g < 5) {
      const [hx, hy] = toS(O[0]);
      ctx.save(); ctx.globalAlpha = clamp01((5 - g) / 3); ctx.translate(hx, hy); ctx.scale(g, g); ctx.translate(-HERO_P.x, -HERO_P.y);
      tableLine({}); tableFront(t, { streamK: clamp01((1.6 - g) / 0.6) }); ctx.restore();
    }
    for (let i = 1; i < NL; i++) {
      const p = LEV[i].w * s; if (p < 10 || (i < NL - 1 && LEV[i + 1].w * s > 4000)) continue;
      const [x, y] = toS(O[i]);
      // bir alt katman ekranı doldururken bu katman söner (atom DNA ipliğinin ortasında kalmaz)
      const fadeK = i === NL - 2 ? clamp01((900 - LEV[i + 1].w * s) / 500) : 1;
      ctx.save(); ctx.globalAlpha = fadeK; ctx.translate(x, y);
      if (i >= 3) { ctx.beginPath(); ctx.rect(-p / 2, -p / 2, p, p); ctx.clip(); }
      if (i === 1) { ctx.save(); ctx.translate(0, p * 0.42); drawTinyPerson(ctx, p * 0.85, 0); ctx.restore(); }
      else if (i === 2) drawHand(ctx, p);
      else if (i === 3) drawCells(ctx, p);
      else if (i === 4) drawNucleus(ctx, p);
      else if (i === 5) drawDNA(ctx, p, t * 0.6);
      else drawAtom(ctx, p, t);
      ctx.restore();
      if (p < 700 && i >= 2) { ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(x - p / 2, y - p / 2, p, p); if (p > 40) { setFont(ctx, F.mono(32)); const lb = LEV[i].name, tw = ctx.measureText(lb).width; const lx = Math.min(SAFE.x1 - tw - 6, Math.max(SAFE.x0, x + p / 2 + 12)), ly = Math.max(STAGE_TOP + 48, y - p / 2 + 28); ctx.fillStyle = C.paper; ctx.fillRect(lx - 6, ly - 30, tw + 12, 40); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(lb, lx, ly); } ctx.restore(); }
    }
    // atomda: çekirdek burada (görünmez); levha gelmeden kapanır
    if (t >= T.empty - 0.3 && t < T.plate) {
      const k = ease.enter(seg(t, T.empty - 0.3, 0.4)) * (1 - seg(t, T.plate - 0.2, 0.2)), [x, y] = toS(O[NL - 1]);
      ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(32)); ctx.textAlign = 'left'; const l1 = 'ÇEKİRDEK BURADA', l2 = 'bu ölçekte görünmez', tw = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width);
      const bx = Math.min(SAFE.x1 - tw - 8, x + 100), by = y - 222;
      ctx.beginPath(); ctx.moveTo(x + 12, y - 12); ctx.lineTo(bx + 10, by + 84); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = C.paper; ctx.fillRect(bx - 8, by, tw + 16, 86); ctx.fillStyle = C.ink; ctx.fillText(l1, bx, by + 36); ctx.fillText(l2, bx, by + 74); ctx.restore();
    }
    let li = 1; for (let i = 1; i < NL; i++) if (z >= Z[i] - 0.3) li = i;
    return { z, levelName: LEV[li].name, realW: 830 / s };
  }

  // ——— stadyum levhası (l03): 1 px = 1 m; sonda daire küpün yerine küçülür ———
  function stadiumPlate(t) {
    if (t < T.plate || t >= T.back + 0.05) return null;
    const kin = ease.state(seg(t, T.plate, 0.5));
    ctx.save();
    if (t >= T.shrink) { const e = ease.state(seg(t, T.shrink, T.back + 0.05 - T.shrink)), sc = lerp(1, 0.012, e); ctx.translate(lerp(ZC.x, CUBE.x + 6, e), lerp(ZC.y, CUBE.y - 32, e)); ctx.scale(sc, sc); ctx.translate(-ZC.x, -ZC.y); }
    else ctx.globalAlpha = kin;
    const R = 350;
    // levha zemini daire (küçülürken dikdörtgen kalmaz)
    ctx.beginPath(); ctx.arc(ZC.x, ZC.y, t >= T.shrink ? R + 10 : 2000, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill();
    const z = 1 + 0.1 * seg(t, T.plate, T.shrink - T.plate); ctx.translate(ZC.x, ZC.y); ctx.scale(z, z); ctx.translate(-ZC.x, -ZC.y);
    ctx.fillStyle = C.ink; const r2 = mulberry32(9); for (let i = 0; i < 700; i++) { const a = r2() * Math.PI * 2, rr = R * (0.55 + 0.45 * Math.sqrt(r2())); ctx.fillRect(ZC.x + Math.cos(a) * rr, ZC.y + Math.sin(a) * rr, 2.2, 2.2); }
    ctx.beginPath(); ctx.arc(ZC.x, ZC.y, R, 0, Math.PI * 2); ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
    const us = ease.enter(seg(t, T.stadium - 0.2, 0.6));
    if (us > 0) { ctx.save(); ctx.translate(ZC.x, ZC.y); const k2 = lerp(0.6, 1, us); ctx.scale(k2, k2); ctx.globalAlpha *= us; drawStadium(ctx, 1); ctx.restore(); }
    ctx.beginPath(); ctx.arc(ZC.x, ZC.y, 12, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    setFont(ctx, F.mono(32)); ctx.textAlign = 'left';
    const lab = (s, x, y, a = 1) => { if (a <= 0) return; const tw = ctx.measureText(s).width; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x - 6, y - 30, tw + 12, 40); ctx.fillStyle = C.ink; ctx.fillText(s, x, y); ctx.restore(); };
    lab('ATOM', ZC.x + 90, ZC.y - R + 110);
    lab('STADYUM', ZC.x - 70, ZC.y + 128, us);
    lab('ÇEKİRDEK', ZC.x + 26, ZC.y - 18, ease.enter(seg(t, T.pea - 0.1, 0.4)));
    ctx.restore();
    return [ZC.x, ZC.y];
  }

  // ——— kalabalık ve çöküş ———
  const CROWD = []; for (let row = 0; row < 15; row++) { const f = row / 14, y = lerp(800, 1300, Math.pow(f, 1.25)), sz = lerp(12, 38, f), gap = sz * 0.85; for (let x = 90 + (row % 2) * gap / 2; x < 960; x += gap) { if (x > 760 && y > 1160) continue; CROWD.push({ x: x + (rnd() - 0.5) * gap * 0.4, y, d: rnd(), ph: rnd() * 6, s: sz, row }); } }
  const implode = t => ease.state(seg(t, T.remove, T.imp1 - T.remove));
  function crowdScene(t) {
    const v = implode(t), cx = CUBE.x + 8, cy = CUBE.y - 56;
    for (const p of CROWD) {
      const w = clamp01((v - p.d * 0.3) / 0.7), e = w * w * (3 - 2 * w);
      if (e >= 0.995) continue;
      const dx = p.x - cx, dy = p.y - cy, r = Math.hypot(dx, dy) * (1 - e), th = Math.atan2(dy, dx) + e * 0.35;
      // giriş: sıralar önden arkaya 30 ms arayla ayağa kalkar (toplam ≤ 450 ms)
      const g = ease.enter(seg(t, T.crowd - 0.05 + (14 - p.row) * 0.03, 0.35)); if (g <= 0) continue;
      ctx.save(); ctx.translate(cx + Math.cos(th) * r, cy + Math.sin(th) * r); ctx.scale(1, g); drawTinyPerson(ctx, p.s * (1 - e * 0.88), p.ph + t * 6); ctx.restore();
    }
  }

  // ——— dünya kamerası (l04 → döngü) ———
  const fallPxAt = t => { if (t < T.fall0) return 0; const u = seg(t, T.fall0, T.fallEnd - T.fall0); const dur = T.fallEnd - T.fall0, v = 2 * 11.5 / dur, a = Math.max(0, t - T.fallEnd); return (11.5 * u * u + v * 1.4 * (1 - Math.exp(-a / 1.4)) + 0.8 * a) * PXM; };
  function camWorld(t) {
    if (t < T.remove) return { z: 1, f: [BASE.x, BASE.y] };
    const cubeF = [CUBE.x + 6, CUBE.y - 44];
    if (t < T.hero) { const u = ease.state(seg(t, T.remove, T.hero - T.remove)); return { z: 1 + 0.12 * u, f: [lerp(BASE.x, cubeF[0], u), lerp(BASE.y, cubeF[1], u)] }; }
    if (t < T.fall0) { const u = ease.state(seg(t, T.hero, 0.6)); return { z: lerp(1.12, 2.4, u) * (1 + 0.04 * seg(t, T.hero + 0.6, T.fall0 - T.hero - 0.6)), f: [cubeF[0], cubeF[1] + 6 * u] }; }
    const fp = fallPxAt(t), z0 = 2.4 * 1.04, z = 650 / (fp * 1.15 + 650 / z0);
    return { z, f: [cubeF[0], cubeF[1] + fp * 0.55], anchorY: lerp(BASE.y, 1080, clamp01(fp / 2000)) };
  }

  // ——— büyüteç (l03: bezelye, gerçek boy) ———
  function roundel(t, R, k, at) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x); ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 16, at[1] - Math.sin(ang) * 16); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    drawPea(ctx, 120);
    ctx.beginPath(); ctx.moveTo(-60, 82); ctx.lineTo(60, 82); ctx.moveTo(-60, 74); ctx.lineTo(-60, 90); ctx.moveTo(60, 74); ctx.lineTo(60, 90); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('7 mm', 0, 116);
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.empty, 'sasirma', 'saskin'], [T.empty + 1.4, 'ayakta', 'dusunceli'], [T.stadium, 'sasirma', 'saskin'], [T.stadium + 1.4, 'ayakta', 'notr'],
    [T.remove, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'notr'], [T.ton, 'sasirma', 'saskin'], [T.heavy + 0.4, 'ayakta', 'mutlu'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.hero + 0.15, T.hero + 1.7, 'Şekere mi?!'], [T.fall0 + 1.2, T.fall0 + 2.8, 'Dur!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.save(); ctx.beginPath(); ctx.ellipse(SIFIR.x, SIFIR.y - 46, 72, 70, 0, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = 850 - w, y = SIFIR.y - 330;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 60); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const p = ease.enter(seg(t, ln.t0 - 0.06, 0.3)) * (t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1);
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(96)); revealText(ctx, 'Bütün insanlık', SAFE.x0, 470, 96, k, C.ink); revealText(ctx, 'bir çay şekerine', SAFE.x0, 566, 96, k, C.ink); revealText(ctx, 'sığar mı?', SAFE.x0, 662, 96, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.ink);
    if (num) { setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink); if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); } }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.ink, 'right');
  }
  let lastZoom = null;
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const fade = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    const p = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) * fade;
    if (t < L.l03.t0 - 0.06) {
      const zs = lastZoom, real = zs && zs.z >= Z[1] - 0.15 ? zs.realW : 2, [num, unit] = fmtLen(real).split(' ');
      row({ label: 'LOG ÖLÇEK · GÖRÜŞ ALANI', num, unit, right1: zs ? zs.levelName : 'İNSAN', right2: '', p }); return;
    }
    if (t < L.l04.t0 - 0.06) {
      if (t < T.pea - 0.04) return;
      const pk = ease.enter(seg(t, T.pea - 0.04, 0.3)) * fade;
      if (t < T.olurdu - 0.04) { row({ label: 'ÇEKİRDEK = BEZELYE', num: '7', unit: 'mm', right1: t >= T.stadium - 0.04 ? 'ATOM ≈ 700 m' : '', right2: t >= T.stadium - 0.04 ? 'STADYUM ≈ 250 m' : '', p: pk }); return; }
      row({ label: 'ATOM, ÇEKİRDEKTEN', num: '100.000', unit: 'kat büyük', right1: '', right2: '', p: ease.enter(seg(t, T.olurdu - 0.04, 0.3)) * fade }); return;
    }
    if (t < T.hero - 0.02) { if (t < T.sekiz - 0.04) return; row({ label: 'İNSANLIK', num: '8 milyar', unit: 'kişi', right1: '', right2: '', p: ease.enter(seg(t, T.sekiz - 0.04, 0.3)) * fade }); return; }
    if (t < T.ton - 0.04) { row({ label: 'BOŞLUKSUZ İNSANLIK', num: '2,2', unit: 'cm³', red: true, right1: t >= T.kucuk - 0.04 ? 'ÇAY ŞEKERİ ≈ 4 cm³' : '', right2: '', p: fade }); return; }
    row({ label: 'AYNI ŞEKER KÜPÜNÜN AĞIRLIĞI', num: '500 milyon', unit: 'ton', red: t < T.inkTon, right1: '', right2: '', p: fade });
  }
  function follow(t) {
    if (t < T.follow || t >= T.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 470;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 760, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 760, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 805); ctx.restore();
  }

  // ——— dünya sahnesi (masaya dönüşten döngüye) ———
  function worldStage(t) {
    // döngü: hızlı geri sarma (fiziksel durum geriye, kamera log uzayında kare 0'a)
    const r = t >= T.loop0 ? ease.state(seg(t, T.loop0, D - T.loop0 - 0.06)) : 0;
    const te = t >= T.loop0 ? lerp(T.loop0, T.ton - 0.05, clamp01(r / 0.8)) : t;
    let cam = camWorld(t >= T.loop0 ? T.loop0 : t);
    // geri sarmada odak sapması ekran uzayında doğrusal küçülür (masa erken görünür, boş oda karesi kalmaz)
    if (r > 0) { const z1 = Math.exp(lerp(Math.log(cam.z), 0, r)), w = (cam.z * (1 - r)) / z1; cam = { z: z1, f: [BASE.x + (cam.f[0] - BASE.x) * w, BASE.y + (cam.f[1] - BASE.y) * w], anchorY: lerp(cam.anchorY ?? BASE.y, BASE.y, r) }; }
    const z = cam.z, ay = cam.anchorY ?? BASE.y;
    const tau = te - T.ton;
    const st = {
      z, fallPx: fallPxAt(te), brk: ease.enter(seg(te, T.ton, 0.3)), pieces: ease.enter(seg(te, T.ton + 0.05, 0.5)),
      jump: tau > 0 ? -34 * Math.exp(-6 * tau) * Math.abs(Math.sin(17.9 * tau)) : 0,
      tilt: tau > 0 ? 0.07 * (1 - Math.exp(-8 * tau)) - 0.03 * Math.exp(-6 * tau) * Math.sin(17.9 * tau) : 0,
      slosh: tau > 0 ? 0.28 * Math.exp(-2.5 * tau) * Math.sin(9 * tau) : 0,
      cubeK: t >= T.loop0 ? lerp(0.82, 1, r) : te >= T.kucuk ? lerp(1, 0.82, ease.state(seg(te, T.kucuk, 0.5))) : 1,
      cubeCol: (t >= T.loop0 && r > 0.75) || te < T.hero - 0.02 ? 'paper' : te < T.hero + 0.12 ? 'flash' : 'red',
      outline: te >= T.kucuk - 0.1 && te < T.fall0 + 0.2, dense: te >= T.remove && te < T.hero ? clamp01((te - T.remove) / (T.imp1 - T.remove)) : 0,
      streamK: t >= T.loop0 ? r : 0, legK: clamp01((te - T.ton) / 0.4),
    };
    ctx.save(); ctx.translate(BASE.x, ay); ctx.scale(z, z); ctx.translate(-cam.f[0], -cam.f[1]);
    const vy0 = cam.f[1] + (STAGE_TOP - ay) / z, vy1 = cam.f[1] + (1920 - ay) / z;
    // kalabalık evresi: meydan zemini ve kalabalık bardağın ARKASINDA
    if (t < T.hero + 0.4) { plaza(1 - ease.state(seg(t, T.imp1, 0.5)), ease.enter(seg(t, T.crowd - 0.2, 0.6))); if (t < T.hero) crowdScene(t); }
    underWorld(st, vy0, vy1, z);
    tableLine(st);
    tableFront(t, st);
    if (r > 0.6) { const ph = 2 * K * Math.pow(10, ZMIN), g = ease.enter(clamp01((r - 0.6) / 0.4)); ctx.save(); ctx.translate(HERO_P.x, HERO_P.y + ph * 0.42); ctx.scale(1, g); drawTinyPerson(ctx, ph * 0.85, 0); ctx.restore(); }
    ctx.restore();
    // uzaktan küp: halka ve ad (ekran ölçeğinde)
    if (st.fallPx > 0.6 * PXM && t < T.loop0 + 0.3) {
      const sx = BASE.x + (CUBE.x + 6 - cam.f[0]) * z, sy = ay + (CUBE.y + st.fallPx - 30 - cam.f[1]) * z, k = clamp01((st.fallPx - 0.6 * PXM) / (0.8 * PXM)) * (1 - r);
      ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.red; ctx.stroke();
      setFont(ctx, F.mono(32)); ctx.textAlign = 'right'; const tw = ctx.measureText('ŞEKER KÜPÜ').width; ctx.fillStyle = C.paper; ctx.fillRect(sx - 48 - tw - 6, sy - 26, tw + 12, 40); ctx.fillStyle = C.ink; ctx.fillText('ŞEKER KÜPÜ', sx - 48, sy + 6); ctx.restore();
    }
    // derinlik işaretleri (gerçek ölçek, sol kenarda): masa, zemin, 1 / 2 / 5 / 10 m
    if (st.fallPx > 0.2 * PXM) {
      const marks = [['MASA', TABLE], ['ZEMİN', FLOOR], ['1 m', FLOOR + PXM], ['2 m', FLOOR + 2 * PXM], ['5 m', FLOOR + 5 * PXM], ['10 m', FLOOR + 10 * PXM], ['20 m', FLOOR + 20 * PXM]];
      setFont(ctx, F.mono(32)); ctx.textAlign = 'left';
      const k = clamp01((st.fallPx - 0.2 * PXM) / (0.3 * PXM)) * (1 - r); let lastY = -1e9;
      const yMin = t >= T.follow - 0.2 ? 860 : STAGE_TOP + 40;   // takip çipinin altında kalır
      for (const [lb, wy] of marks) {
        const sy = ay + (wy - cam.f[1]) * z; if (sy < yMin || sy > 1400 || sy - lastY < 46) continue; lastY = sy;
        ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(SAFE.x0, sy); ctx.lineTo(SAFE.x0 + 40, sy); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
        const tw = ctx.measureText(lb).width; ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 46, sy - 22, tw + 12, 40); ctx.fillStyle = C.ink; ctx.fillText(lb, SAFE.x0 + 52, sy + 10); ctx.restore();
      }
    }
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    lastZoom = null;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    if (t < T.zoom0 - 0.01) {
      // kare 0: masa; çok yavaş itme (%4) kahraman kişiye doğru
      ctx.save(); const z = 1 + 0.04 * seg(t, 0, T.zoom0); ctx.translate(HERO_P.x, HERO_P.y); ctx.scale(z, z); ctx.translate(-HERO_P.x, -HERO_P.y);
      tableLine({}); tableFront(t, { streamK: 1 });
      const ph = 2 * K * Math.pow(10, ZMIN); ctx.save(); ctx.translate(HERO_P.x, HERO_P.y + ph * 0.42); drawTinyPerson(ctx, ph * 0.85, 0); ctx.restore(); ctx.restore();
    } else if (t < T.shrink) {
      if (t < T.plate + 0.5) lastZoom = zoomStage(t);
      stadiumPlate(t);
    } else {
      worldStage(t);
      stadiumPlate(t);   // daire küçülerek küpün yerine iner
    }
    ctx.restore();
    if (t >= T.pea - 0.2 && t < T.shrink + 0.05) roundel(t, ROUND, ease.enter(seg(t, T.pea - 0.2, 0.4)) * (1 - ease.exit(seg(t, T.shrink - 0.3, 0.3))), [ZC.x, ZC.y]);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    follow(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

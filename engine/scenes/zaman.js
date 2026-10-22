// "Zaman" şablonu (Hangisi daha şaşırtıcı?): zaman onlarsız akarken. Kozmonot yörüngedeyken ülkesi haritadan silinir;
// asker savaş bittikten sonra 28,5 yıl ormanda savaşır. Sonda iki süre aynı cetvelde: 90 gün ve 10.433 gün.
// Gravür küre (engine/globe.js), anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { geoInterpolate } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { SOLDIER_CARD, drawSoldier, COSMONAUT_CARD, drawCosmonaut } from '../zaman_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const USSR = ['643', '804', '112', '398', '860', '795', '417', '762', '031', '051', '268', '498', '440', '428', '233'];
const BAIKONUR = [63.31, 45.96], ARKALYK = [66.9, 50.25], LUBANG = [120.12, 13.83], LUBANG_C = [120.13, 13.79];
const AYLAR = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
const dateStr = ms => { const d = new Date(ms); return `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

export function zamanTimes(tl) {
  const { L, W: Wd } = tl;
  return {
    launch: Wd('l02', 'uzaya'), plan: L.l03.t0, split0: Wd('l04', 'dağılıyor'), split1: Wd('l04', 'bölünüyor', 't1'),
    land: Wd('l06', 'indiği'), kz: Wd('l06', 'kazakistan'), whip0: L.l06.end + 0.45, whip1: L.l07.t0 + 0.25,
    island: Wd('l08', 'küçük'), sent: Wd('l08', 'gönderiliyor', 't1'), order: Wd('l09', 'asla'), warEnd: L.l10.t0 + 0.1,
    leaflets: Wd('l10', 'atılan'), moon: Wd('l11', 'ay'), cmdr: Wd('l12', 'komutanı'), surrender: Wd('l12', 'teslim'), cmp0: L.l13.t0 - 0.1,
    row1: Wd('l14', 'doksan'), row2: Wd('l14', 'asker'), hero: L.l15.t0 - 0.04, ratio: Wd('l16', 'yüz'), ask: L.l17.t0, loop0: tl.loop0,
  };
}

export async function makeZamanRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world, moonImg] = await Promise.all([
    (await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld(),
    new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = '../assets/planets/ay.png'; }),
  ]);
  const SSCB = world.union(USSR), SPLIT = world.bordersAmong(USSR), KZ = world.country('398'), PH = world.country('608');
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = zamanTimes(tl), Fx = ep.facts;

  // ——— takvimler ———
  const day = ms => ms / 864e5, Dt = s => Date.parse(s + 'T12:00Z');
  const dayNo = ms => Math.floor(ms / 864e5), dDays = (a, b) => dayNo(a) - dayNo(b);
  const K = { launch: Dt(Fx.krikalev.launch), end: Dt(Fx.krikalev.ussrEnd), land: Dt(Fx.krikalev.land) };
  // uzayda: kalkış → dağılma (söylendiği an) → iniş; parçalı doğrusal
  const kDate = t => t < T.split0 ? lerp(K.launch, K.end, seg(t, T.launch, T.split0 - T.launch)) : lerp(K.end, K.land, seg(t, T.split0 + 0.8, T.land - T.split0 - 0.8));
  const O = { arrive: Dt(Fx.onoda.arrive), war: Dt(Fx.onoda.warEnd), moon: Dt('1969-07-20'), surr: Dt(Fx.onoda.surrender) };
  const oDate = t => t < T.warEnd ? lerp(O.arrive, O.war, seg(t, T.sent, T.warEnd - T.sent))
    : t < T.moon ? lerp(O.war, O.moon, seg(t, T.warEnd, T.moon - T.warEnd)) : lerp(O.moon, O.surr, seg(t, T.moon, T.surrender - T.moon));

  // ——— kamera ———
  const S0 = { c: [72, 50], r: 400, cy: 1110 };
  const segs = [
    { t0: 0, t1: T.split0 - 0.4, to: t => ({ ...S0, c: [72 + 8 * seg(t, 0, T.split0), 50], r: S0.r * (1 + 0.1 * ease.enter(seg(t, 0, T.split0))) }) },
    { t0: T.split0 - 0.4, t1: T.split0 + 0.6, to: t => ({ c: [72, 52], r: 520 * (1 + 0.04 * seg(t, T.split0 + 0.6, 3)), cy: 1080 }) },
    { t0: T.land - 0.9, t1: T.land + 0.3, to: t => ({ c: [68, 49], r: 1250 * (1 + 0.12 * seg(t, T.land + 0.3, T.whip0 - T.land - 0.3)), cy: 1060 }) },
    { t0: T.whip0, t1: T.whip1, to: t => ({ c: [121, 13], r: 1400 * (1 + 0.12 * seg(t, T.whip1, T.island - T.whip1)), cy: 1060 }) },
    { t0: T.island, t1: T.island + 1.3, to: t => ({ c: LUBANG, r: 52000 * (1 + 0.18 * seg(t, T.island + 1.3, T.cmp0 - T.island - 1.3)), cy: 1080 }) },
    { t0: T.cmp0, t1: T.cmp0 + 1.2, to: t => ({ c: [lerp(110, 80, seg(t, T.cmp0, T.ask - T.cmp0)) - 4 * Math.max(0, t - T.ask), 25], r: 300, cy: 1300 }) },
    { t0: T.loop0, t1: D - 0.08, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);

  // ——— yörünge: küre çevresinde eğik elips; istasyon arkadayken küre onu örter ———
  const orbitPt = (k, th) => { const rx = k.r * 1.16, ry = k.r * 0.34, a = -0.32; const x = Math.cos(th) * rx, y = Math.sin(th) * ry; return [540 + x * Math.cos(a) - y * Math.sin(a), k.cy + x * Math.sin(a) + y * Math.cos(a), Math.sin(th) > 0]; };
  const inOrbit = t => t < T.land;
  const theta = t => 0.4 + t * 1.9;   // ~3,3 sn'de bir tur (hızlandırılmış)
  function orbit(k, t, front) {
    if (t >= T.whip0 || k.r > 470) return;
    const n = 90; ctx.save();
    if (!front) { ctx.beginPath(); ctx.rect(0, 0, W, 1920); ctx.arc(540, k.cy, k.r, 0, Math.PI * 2); ctx.clip('evenodd'); } ctx.setLineDash([8, 7]); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); let pen = false;
    for (let i = 0; i <= n; i++) { const p = orbitPt(k, (i / n) * Math.PI * 2); if (p[2] === front) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; }
    ctx.stroke(); ctx.restore();
    if (inOrbit(t)) { const p = orbitPt(k, theta(t)); if (p[2] === front) station(p[0], p[1], 1.7); }
  }
  function station(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink;
    ctx.fillRect(-14, -5, 28, 10); ctx.lineWidth = 2;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.rect(sx * 18 - 7, -16, 14, 32); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke(); for (let yy = -12; yy < 16; yy += 6) { ctx.beginPath(); ctx.moveTo(sx * 18 - 7, yy); ctx.lineTo(sx * 18 + 7, yy); ctx.stroke(); } }
    ctx.restore();
  }

  // ——— büyüteç ———
  const rnd = mulberry32(33), leaves = Array.from({ length: 22 }, () => [rnd(), rnd(), rnd()]), papers = Array.from({ length: 9 }, () => [rnd(), rnd(), rnd()]);
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6 && G.visible(at)) { const q = G.proj(at), ang = Math.atan2(q[1] - R.y, q[0] - R.x); ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(q[0], q[1]); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'space') {
      // pencereden Dünya'nın kenarı (taralı yay) ağır ağır döner; kozmonot sabit hızla döner (ağırlıksız)
      ctx.save(); ctx.beginPath(); ctx.arc(0, 330, 260, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); ctx.clip();
      ctx.lineWidth = 1.2; const off = (t * 14) % 9; for (let x = -300; x < 300; x += 9) { ctx.beginPath(); ctx.moveTo(x + off, 60); ctx.lineTo(x + off + 60, 200); ctx.stroke(); }
      ctx.restore();
      for (const [a, b] of leaves.slice(0, 10)) { ctx.beginPath(); ctx.arc(-110 + a * 220, -110 + b * 130, 1.6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
      ctx.save(); ctx.translate(0, -10); drawCosmonaut(ctx, COSMONAUT_CARD, { spin: -0.3 + (t - T.launch) * 0.22, reach: 0.6 }, 150); ctx.restore();
    } else if (kind === 'steppe') {
      ctx.beginPath(); ctx.moveTo(-130, 66); ctx.lineTo(130, 66); ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(46, 66, 40, Math.PI, 0); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.stroke(); // iniş kapsülü
      ctx.save(); ctx.translate(-30, 12); drawCosmonaut(ctx, COSMONAUT_CARD, { spin: 0, reach: 0.2 }, 120); ctx.restore();
    } else {
      // orman: taranmış yapraklar (sabit), yerde çimen çizgileri
      ctx.lineWidth = 2;
      for (const [a, b, c] of leaves) { const x = -130 + a * 260, y = -120 + b * 110; ctx.save(); ctx.translate(x, y); ctx.rotate(c * 3); ctx.beginPath(); ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(24, 0); ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.moveTo(-130, 74); ctx.lineTo(130, 74); ctx.lineWidth = 2.5; ctx.stroke();
      const walking = kind === 'jwalk', gx = walking ? -(t * 110) : 0;
      for (const [a, b] of leaves) { const x = (((a * 300 + gx) % 300) + 300) % 300 - 150; ctx.beginPath(); ctx.moveTo(x, 74); ctx.lineTo(x - 6, 52 - b * 18); ctx.moveTo(x + 6, 74); ctx.lineTo(x + 10, 56 - b * 14); ctx.lineWidth = 1.6; ctx.stroke(); }
      if (kind === 'present') {
        // komutan sağdan gelir (sola bakar), Onoda'nın karşısında durur
        const u = ease.state(seg(t, T.cmdr, 1.2)), cx = lerp(170, 62, u), walking = u > 0 && u < 1;
        ctx.save(); ctx.translate(cx, 74); ctx.scale(-1, 1); drawSoldier(ctx, SOLDIER_CARD, { mode: walking ? 'walk' : 'stand', phase: (t * 1.5) % 1 }, 150); ctx.restore();
      }
      const mode = kind === 'jwalk' ? 'walk' : kind === 'present' ? (t >= T.surrender ? 'present' : 'stand') : kind === 'jstand' ? 'stand' : 'crouch';
      ctx.save(); ctx.translate(kind === 'present' ? -40 : 0, 74); drawSoldier(ctx, SOLDIER_CARD, { mode, phase: (t * 1.5) % 1 }, 150); ctx.restore();
      if (kind === 'leaflets') for (const [a, b, c] of papers) {
        const y = -150 + (((t - T.leaflets) * (60 + c * 40) + b * 260) % 260), x = -110 + a * 220 + Math.sin(t * 2 + c * 6) * 10;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.7 + c * 5) * 0.6); ctx.fillStyle = C.paper; ctx.fillRect(-14, -10, 28, 20); ctx.lineWidth = 1.5; ctx.strokeRect(-14, -10, 28, 20);
        for (let i = -5; i <= 5; i += 5) { ctx.beginPath(); ctx.moveTo(-9, i); ctx.lineTo(9, i); ctx.lineWidth = 1; ctx.stroke(); } ctx.restore();
      }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(55); const blinks = []; for (let b = 1.4; b < D; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.launch, 'bakma_yukari', 'sayiyor'], [T.split0, 'sasirma', 'saskin'], [T.split0 + 1.7, 'ayakta', 'notr'],
    [T.whip1, 'ayakta', 'dusunceli'], [T.moon, 'bakma_yukari', 'saskin'], [T.moon + 1.6, 'ayakta', 'notr'], [T.cmp0, 'ayakta', 'dusunceli'],
    [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.split1 - 0.2, T.split1 + 1.4, '15 ülke mi?!'], [T.moon + 0.1, T.moon + 1.6, 'Ay mı?!'], [T.hero + 0.1, T.hero + 1.9, '28,5 yıl mı?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    // kâğıt basamak: Sıfır bir defterin üstünde durur (havada değil); ön yüzü taralı
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - 310;
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
    // bölünmüş cümle (l14 + l15) tek blok: l15 gelince önceki satır kalır, ikinci satır eklenir
    const text = ln.id === 'l15' ? L.l14.text + ' ' + ln.text : ln.id === 'l14' ? 'Kozmonot, ülkesi olmadan 90 gün yaşadı. Ya asker?' : ln.text;
    const p = ln.id === 'l15' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    // uzun cümle iki satıra sığmazsa yazı küçülür (en çok üç satır); kelime kesilmez
    const txt = text;
    let fs0 = 50; setFont(ctx, F.name(fs0)); let ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0);
    if (ls.length > 2) { fs0 = 44; setFont(ctx, F.name(fs0)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); }
    const lh = fs0 * 1.22, y0 = ls.length > 2 ? 420 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.25, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42)); revealText(ctx, 'Uzaydayken ülkesi yok olan kozmonot mu,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, 'savaş bitince 28,5 yıl direnen asker mi?', SAFE.x0, 690, 42, k, C.ink);
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
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.25) return;
    if (t < L.l07.t0 - 0.06) {
      const ms = t < T.launch ? K.launch : kDate(t), d = Math.max(0, dDays(ms, K.launch));
      const r2 = ms >= K.end ? `ÜLKESİZ: ${t >= T.land ? 90 : dDays(ms, K.end)} GÜN` : t >= L.l03.t0 && t < L.l04.t0 ? 'PLAN: 5 AY' : 'SSCB';
      row({ label: 'SERGEY KRIKALEV · KOZMONOT', num: t >= T.land ? '311' : nf0.format(d), unit: 'gün', right1: dateStr(ms), right2: r2, p: ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)) });
      return;
    }
    if (t < T.cmp0) {
      const ms = t < T.sent ? O.arrive : oDate(t), y = new Date(ms).getUTCFullYear(), after = ms > O.war ? Math.floor(day(ms - O.war) / 365.25) : -1;
      row({ label: 'HIROO ONODA · TEĞMEN', num: String(y), unit: '', right1: after >= 0 ? (t < T.warEnd + 1.6 ? 'SAVAŞ BİTTİ · 15 AĞU 1945' : `SAVAŞ BİTELİ ${after} YIL`) : 'SAVAŞ SÜRÜYOR', right2: 'LUBANG ADASI', p: Math.max(0.35, ease.enter(seg(t, L.l07.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) { const r1 = t >= T.row1; row({ label: r1 ? 'KOZMONOT · ÜLKESİZ' : 'AYNI CETVELLE ÖLÇÜLÜRSE', num: r1 ? '90' : '0', unit: 'gün', right1: r1 ? 'ASKER: ?' : '', right2: '', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.ask) { row({ label: 'ASKER, SAVAŞ BİTTİKTEN SONRA', num: '28,5', unit: 'yıl', red: true, right1: '10.433 gün', right2: t >= T.ratio ? '116 KAT' : 'KOZMONOT: 90 gün' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0, 0.25)));
    setFont(ctx, F.head(76)); revealText(ctx, 'Kozmonot mu, asker mi?', SAFE.x0, 672, 76, p, C.ink);
  }

  // ——— asker cetveli: savaşın bitişinden teslime (28,56 yıl = 811 px); öncesi (1944'ün sonu) solda kısa grafit ———
  // Lubang bölümünde yıllar geçtikçe dolar; kıyasta aynı yerde kalır, sessizlikte kırmızı ölçü üstünden geçer.
  const RX0 = 109, RX1 = SAFE.x1, RY = 792, KY = 938;
  const yr = ms => 1970 + ms / (365.25 * 864e5);
  const pxYr = (RX1 - RX0) / (yr(O.surr) - yr(O.war)), xOf = ms => RX0 + (yr(ms) - yr(O.war)) * pxYr;
  function band(h, k) { ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, h * k); ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + h * k); ctx.lineTo(W, STAGE_TOP + h * k); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke(); }
  function rulers(t) {
    const on = t >= T.sent - 0.4 && t < T.loop0 + 0.4;
    if (!on) return;
    const kin = ease.enter(seg(t, T.sent - 0.4, 0.5)), kout = 1 - ease.exit(seg(t, T.loop0, 0.4)), k = kin * kout;
    const cmp = t >= T.cmp0;
    band(cmp ? lerp(150, 268, ease.state(seg(t, T.cmp0, 0.6))) : 150, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, (cmp ? 268 : 150) * k); ctx.clip();
    setFont(ctx, F.mono(30));
    revealText(ctx, 'ASKER · SAVAŞTAN SONRA', RX0, RY - 22, 30, k, C.graphite);
    // taban çizgisi ve 5 yıllık çentikler
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(RX0 - 19, RY + 24); ctx.lineTo(RX1, RY + 24); ctx.stroke();
    for (let y = 1945; y <= 1975; y += 5) { const x = RX0 + (y - yr(O.war)) * pxYr; if (x < RX0 - 20 || x > RX1 + 1) continue; ctx.beginPath(); ctx.moveTo(x, RY + 24); ctx.lineTo(x, RY + 34); ctx.stroke(); revealText(ctx, String(y), x, RY + 62, 26, k, C.graphite, 'center'); }
    // dolan çubuk: tarih ilerledikçe (kıyasta tam)
    const ms = cmp ? O.surr : t < T.sent ? O.arrive : oDate(t);
    const xe = Math.min(xOf(ms), RX1);
    ctx.fillStyle = C.graphite; ctx.fillRect(RX0 - 19, RY, Math.max(0, Math.min(xe, RX0) - (RX0 - 19)), 22);
    if (xe > RX0) { ctx.fillStyle = C.ink; ctx.fillRect(RX0, RY, xe - RX0, 22); }
    // olaylar: savaşın bitişi ve Ay'a iniş
    if (ms >= O.war) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(RX0, RY - 8); ctx.lineTo(RX0, RY + 24); ctx.stroke(); }
    if (ms >= O.moon) { const x = xOf(O.moon); ctx.beginPath(); ctx.arc(x, RY - 12, 7, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); }
    if (cmp) {
      // DORUK: sessizlikte kırmızı ölçü soldan sağa geçer, teslim noktasına oturur
      const u = ease.state(seg(t, L.l14.end, T.hero - L.l14.end));
      if (t >= T.row2) { ctx.fillStyle = C.red; ctx.fillRect(RX0, RY, (RX1 - RX0) * (t >= T.hero ? 1 : u), 22); }
      // 116 kat: kozmonotun 90 günü çubuk boyunca 116 kez işaretlenir (toplam gecikme ≤ 1 sn)
      if (t >= T.ratio) {
        const u = clamp01((t - T.ratio + 0.4) / 2.0), n = Math.min(116, Math.floor(116 * u * u)), w90 = 90 / 365.25 * pxYr;
        ctx.fillStyle = C.ink;
        for (let i = 0; i < n; i++) { const x = RX0 + i * w90; ctx.fillRect(x, RY + 3, Math.max(1, w90 - 1.6), 16); }
        setFont(ctx, F.mono(32)); ctx.fillStyle = n >= 116 ? C.red : C.ink; ctx.textAlign = 'right'; ctx.fillText('×' + n, RX1, RY - 14);
      }
      // kozmonot: aynı ölçekte 90 gün (7 px)
      const k2 = ease.enter(seg(t, T.row1 - 0.3, 0.4));
      setFont(ctx, F.mono(30)); revealText(ctx, 'KOZMONOT · ÜLKESİZ', RX0, KY - 22, 30, k2 * kout, C.graphite);
      if (t >= T.row1) { const w = (90 / 365.25) * pxYr * ease.enter(seg(t, T.row1, 0.4)); ctx.fillStyle = C.ink; ctx.fillRect(RX0, KY, Math.max(3, w), 22); revealText(ctx, '90 gün', RX0 + 22, KY + 20, 28, kout, C.ink); }
    }
    ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    const splitU = seg(t, T.split0, T.split1 - T.split0 + 0.3);
    // yörüngenin arka yarısı kürenin arkasında
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); orbit(k, t, false); ctx.restore();
    G.draw(() => {
      // SSCB: dağılana kadar tek parça tarama; sonra tarama incelir, Kazakistan inişte koyulaşır
      const ussrOn = t < T.whip1 || t >= T.loop0 + 0.3;
      if (ussrOn) G.hatch(SSCB, { gap: lerp(7, 14, ease.state(splitU) * (t < T.loop0 ? 1 : 0)), color: 'rgba(28,27,24,0.5)' });
      if (t >= T.kz - 0.2 && t < T.whip1) G.hatch(KZ, { gap: 6, angle: -45, color: 'rgba(28,27,24,0.55)' });
      if (t >= T.whip0 && t < T.cmp0 + 1.2) G.hatch(PH, { gap: 5, angle: 80, color: 'rgba(28,27,24,0.42)', w: 1.1 });
    });
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // SSCB dış sınırı ve dağılma: iç sınırlar kalınca çizilir
    if (t < T.whip1 || t >= T.loop0 + 0.3) {
      ctx.beginPath(); G.path(SSCB); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      if (splitU > 0 && t < T.loop0) {
        ctx.save(); ctx.setLineDash([2400 * ease.state(splitU), 99999]); ctx.beginPath(); G.path(SPLIT); ctx.lineWidth = 3.2; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      }
    }
    // kalkış: Baykonur'dan yörüngeye kavis; iniş: yörüngeden Arkalık'a
    const bq = G.proj(BAIKONUR);
    if (t >= T.launch && t < T.launch + 2 && G.visible(BAIKONUR)) {
      const u = ease.state(seg(t, T.launch, 1.0)), o = orbitPt(k, theta(T.launch + 1.0));
      ctx.beginPath(); ctx.moveTo(bq[0], bq[1]); ctx.quadraticCurveTo(bq[0] + 20, lerp(bq[1], o[1], 0.8), lerp(bq[0], o[0], u), lerp(bq[1], o[1], u)); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    }
    if (t < T.split0) G.placeLabel(BAIKONUR, 'BAYKONUR', seg(t, T.launch - 0.6, 0.4), 18, 30);
    if (t >= T.land - 0.9 && t < T.whip0 + 0.2) {
      const aq = G.proj(ARKALYK), u = ease.state(seg(t, T.land - 0.9, 0.9));
      ctx.beginPath(); ctx.moveTo(aq[0], aq[1] - 380 * (1 - u)); ctx.lineTo(aq[0], aq[1] - 380); ctx.setLineDash([6, 7]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
      const py = aq[1] - 380 * (1 - u);
      const sag = ease.state(seg(t, T.land, 0.6)), ch = 22 * (1 - 0.75 * sag);
      ctx.save(); ctx.translate(aq[0] + 18 * sag, py - 34 + 26 * sag); ctx.rotate(1.1 * sag);
      ctx.beginPath(); ctx.ellipse(0, 0, 22, ch, 0, Math.PI, 0); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      if (sag < 0.5) { ctx.beginPath(); ctx.moveTo(aq[0] - 22, py - 34); ctx.lineTo(aq[0], py - 4); ctx.lineTo(aq[0] + 22, py - 34); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(aq[0], py, 7, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      G.placeLabel(ARKALYK, 'KAZAKİSTAN', seg(t, T.kz, 0.4), 30, 46, C.ink, 'left', false);
    }
    // kıyas: iki yer sırayla yanar (Baykonur, Lubang)
    if (t >= T.cmp0 + 0.4 && t < T.ask) { G.placeLabel(BAIKONUR, 'BAYKONUR', seg(t, T.cmp0 + 0.6, 0.4), 14, -12); G.placeLabel(LUBANG_C, 'LUBANG', seg(t, T.cmp0 + 1.3, 0.4), 14, -12); }
    // Onoda: Filipinler, sonra Lubang adası
    if (t >= T.whip1 - 0.2 && t < T.cmp0) {
      if (t < T.island + 0.6) G.placeLabel([121.8, 14.6], 'FİLİPİNLER', seg(t, T.whip1, 0.4), 0, -10, C.ink, 'center', false);
      if (t >= T.whip1 && t < T.island + 0.3) G.placeLabel(LUBANG_C, 'LUBANG', seg(t, T.island - 0.7, 0.4), 16, -12, C.ink, 'left', true);
      if (t >= T.island) { G.ringAt(LUBANG_C, seg(t, T.island + 0.6, 0.6), 150, C.ink); G.placeLabel(LUBANG_C, 'LUBANG ADASI', seg(t, T.island + 0.9, 0.4), 0, -168, C.ink, 'center', false); }
    }
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); orbit(k, t, true); ctx.restore();
    // Ay: 20 Temmuz 1969 (Onoda ormandayken)
    if (t >= T.moon - 0.2 && t < T.surrender) {
      const u = ease.enter(seg(t, T.moon - 0.2, 0.5)) * (1 - ease.exit(seg(t, T.surrender - 0.4, 0.4))), mx = 215, my = 975, mr = 70 * u;
      if (mr > 1) { ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.drawImage(moonImg, mx - mr * 1.04, my - mr * 1.04, mr * 2.08, mr * 2.08); ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
      setFont(ctx, F.mono(30)); revealText(ctx, '20 TEMMUZ 1969', mx, my + 120, 30, u, C.ink, 'center');
    }
    // büyüteç
    let kind = null, rk = 1;
    if (t < T.launch + 0.8) kind = 'space';
    else if (t < T.land) kind = 'space';
    else if (t < T.whip0 + (T.whip1 - T.whip0) / 2) kind = 'steppe';
    else if (t < T.cmp0) kind = t < T.order ? 'jwalk' : t < T.warEnd ? 'jstand' : t < T.cmdr ? (t >= T.leaflets && t < T.moon ? 'leaflets' : 'hide') : 'present';
    if (t >= T.whip0 && t < T.whip1) rk = Math.abs(1 - 2 * seg(t, T.whip0, T.whip1 - T.whip0));
    if (t >= T.cmp0 && t < T.cmp0 + 0.3) { kind = 'present'; rk = 1 - ease.exit(seg(t, T.cmp0, 0.3)); }
    if (kind && t < T.cmp0 + 0.3) roundel(t, kind, ROUND, rk, t < L.l02.t0 ? BAIKONUR : null);
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.6)) : 1;
      roundel(t, 'hide', { x: 482, y: 1268, r: 112 }, kin, LUBANG_C);
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(482 - 62, 1096, 124, 42); ctx.fillRect(ROUND.x - 92, 1084, 184, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'ASKER', 482, 1128, 34, kin * kout, C.ink, 'center'); revealText(ctx, 'KOZMONOT', ROUND.x, 1116, 34, kin * kout, C.ink, 'center');
      roundel(t, 'space', ROUND, 1, BAIKONUR);
    }
    if (t < L.l02.t0) roundel(t, 'hide', { x: 482, y: 1268, r: 112 }, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)), LUBANG_C);
    rulers(t);
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

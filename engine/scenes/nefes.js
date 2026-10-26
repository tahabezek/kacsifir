// "Nefes" şablonu (Hangisi daha şaşırtıcı?): oksijen destekli 29 dk 3 sn nefes tutan Vitomir Maričić (2025) ile tek dalışı
// 222 dakika süren Cuvier gagalı balinası (Quick ve ark. 2020). Omurga: solda büyük bir kronometre (bir tur = 60 dk; içte
// saat sayacı, altta dijital okuma). Sağda sahneler: otel havuzu kesiti (oksijen, havuz dibinde sırtüstü bekleyiş, hakemler)
// → balinanın büyüteci → 3.000 m'lik okyanus kesiti (ışık katmanları, dalış izi) → etiket kaydı (uzun dalışın derinlik izi)
// → aynı kronometrede kıyas: insanın 29 dakikalık dilimi, balinanın dalışına 7,6 kez sığar (mini kadranlar tek tek dizilir).
// Doruk: 7. dilim, "yedi"nin başında (tek kırmızı). Anlatım saattir (yolculuk_core.buildYolTimeline); her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { PERSON_POSES as PP, mixPersonPose } from '../termometre_chars.js';
import { DIVER_CARD, JUDGE_CARD, DIVER_POSES as DP, drawFigure, drawBeakedWhale, drawTank } from '../nefes_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const SX0 = 350, SHIFT = 800;                 // sahne bölgesi (kronometre sütununun sağı) ve geçiş kayması
const SIFIR = { x: 208, y: 1412, H: 92 };   // kronometre sütununun altında, sahneye bakar
const PAPER2 = '#F4EEE1';
const DIAL = { x: 208, y: 905, r: 116 };      // kronometre: bir tur = 60 dakika
const RECORD_A = 29 + 3 / 60, OLD_A = 24 + 37 / 60, WHALE = 222;
// okyanus kesiti: yüzey → 3.000 m
const SEA = { top: 790, bot: 1440, x0: SX0 + 10, x1: 1060 };
const yD = m => SEA.top + (m / 3000) * (SEA.bot - SEA.top);

// sayılar, söylendikleri kelimede açılır (öncesinde aynı genişlikte boşluk çizgisi)
const NUMW = { l02: { "2025'te": 'iki' }, l04: { '3': 'üç' }, l05: { '10': 'on', '20': 'yirmi' }, l06: { '5': 'beş', '4': 'dört' }, l07: { '29': 'yirmi', '3': 'üç' },
  l10: { '3.000': 'üç' }, l11: { '1': 4 }, l13b: { '3': 'üç', '42': 'kırk' }, l15: { '29': 'yirmi' }, l16b: { '7': 'yedi' } };

export function nefesTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    y2025: Wd('l02', 'iki'), oxy: L.l03.t0, lie: Wd('l04', 'havuzun'), down: Wd('l04', 'uzanıyor'), m10: Wd('l05', 'on'), m20: Wd('l05', 'yirmi'),
    judges: Wd('l06', 'beş'), rekor: Wd('l06', 'rekorunu'), dort: Wd('l06', 'dört'), stopA: Wd('l07', 'yirmi'), sec3: Wd('l07', 'üç'),
    whip0: Wd('l08', 'balina') - 0.3, balina: Wd('l08', 'balina'), sea: L.l09.t0, deep: Wd('l10', 'üç'), dark: Wd('l10', 'zifiri'),
    hour: tl.W('l11', 4), est: Wd('l12', 'yarım'), tag: L.l13.t0, cikmiyor: Wd('l13', 'çıkmıyor'), h3: Wd('l13b', 'üç'), m42: Wd('l13b', 'kırk'),
    cmp0: L.l14.t0 - 0.1, krono: Wd('l14', 'kronometreye'), human: Wd('l15', 'yirmi'), sweep0: L.l16.t0,
    hero: Wd('l16b', 'yedi'), uzun: Wd('l16b', 'uzun'), ask: L.l17.t0, loop0: tl.loop0,
  };
  T.hit = T.hero;
  return T;
}

// parça parça doğrusal eşleme (kronometre ibresi sürekli hareket: doğrusal)
const pw = (t, K) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K.at(-1)[1]; };

export async function makeNefesRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = nefesTimes(tl);
  // döngü dikişi: sürekli döngülerin frekansı film süresine tam bölünür (son kare = kare 0)
  const wq = w => Math.round(w * D / (2 * Math.PI)) * 2 * Math.PI / D, rq = r => Math.round(r * D) / D;
  const rnd = mulberry32(66);
  const snow = Array.from({ length: 110 }, () => [rnd(), rnd(), 0.6 + rnd() * 0.9]);
  const caus = Array.from({ length: 12 }, () => [rnd(), rnd(), 40 + rnd() * 90]);

  // ——— kronometre zamanı (dakika) ———
  // A: havuzun dibine uzandığı an 0; söylenen her sayı kendi kelimesinde (10, 20, eski rekor, 29:03)
  const KA = [[T.down, 0], [T.m10, 10], [T.m20, 20], [T.rekor + 0.25, OLD_A], [T.stopA, RECORD_A]];
  // B1: dalış "inebiliyor"dan başlar; "bir saat"te 60 dk. B2: etiketli balina; "üç"te 180, "kırk"ta 222
  const KB1 = [[T.sea + 0.5, 0], [T.hour, 60]];
  const KB2 = [[T.tag + 0.2, 0], [T.cikmiyor, 75], [T.h3, 180], [T.m42, WHALE]];
  // kıyas: önce insanın dilimi (0 → 29,05), sonra balina ibresi dilim dilim; 7. dilim vuruş karesinde dolar
  const KC = [[T.krono, 0], [T.human, RECORD_A], [T.sweep0, RECORD_A], [T.hit, 7 * RECORD_A], [T.uzun + 0.3, WHALE]];
  function minutes(t) {
    // açılış: kronometre 28:00'den 29:03'e (kare 0 = döngünün son karesi)
    if (t < L.l02.t0) return 28 + (RECORD_A - 28) * ease.state(seg(t, 0, 1.5));
    if (t >= T.ask) return t < T.ask + 0.5 ? null : 28 * ease.enter(seg(t, T.ask + 0.5, D - T.ask - 0.5));
    if (t < T.whip0) return pw(t, KA);
    if (t < T.tag) return t < T.sea + 0.5 ? null : pw(t, KB1);
    if (t < T.cmp0) return pw(t, KB2);
    return t < T.krono ? null : t < T.sweep0 ? pw(t, KC) : sweepC(t);
  }
  // kıyas süpürmesi: hızlanarak (riser) 7 dilime; vuruştan sonra 222'ye
  function sweepC(t) {
    if (t < T.hit) return lerp(RECORD_A, 7 * RECORD_A, ease.state(seg(t, T.sweep0, T.hit - T.sweep0)) * 0.35 + 0.65 * Math.pow(seg(t, T.sweep0, T.hit - T.sweep0), 2));
    return lerp(7 * RECORD_A, WHALE, ease.state(seg(t, T.hit + 0.15, 1.05)));
  }
  const fmt = m => { if (m < 60) { const s = Math.floor(m * 60 + 1e-6); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; } const mm = Math.floor(m + 1e-6); return `${Math.floor(mm / 60)} sa ${String(mm % 60).padStart(2, '0')} dk`; };

  // ——— sahne pencereleri: her geçiş 0,5 sn'lik sola kayma (filmin tek baskın yönü) ———
  const PANELS = [['intro', -1e9], ['pool', L.l02.t0], ['whale', T.whip0], ['sea', T.sea], ['tag', T.tag], ['cmp', T.cmp0], ['intro', T.ask]];
  function panelsAt(t) {
    const out = [];
    for (let i = 0; i < PANELS.length; i++) {
      const [name, a] = PANELS[i], b = i + 1 < PANELS.length ? PANELS[i + 1][1] : 1e9;
      const uIn = i === 0 ? 1 : ease.state(seg(t, a - 0.25, 0.5)), uOut = ease.state(seg(t, b - 0.25, 0.5));
      if (uIn <= 0 || uOut >= 1) continue;
      out.push({ name, dx: SHIFT * (1 - uIn) - SHIFT * uOut, k: i });
    }
    return out;
  }

  // ——— kronometre (omurga) ———
  function dial(t) {
    const { x, y, r } = DIAL, m = minutes(t);
    // taç ve düğmeler
    ctx.fillStyle = C.ink; ctx.fillRect(x - 14, y - r - 34, 28, 22); ctx.fillRect(x - 24, y - r - 44, 48, 12);
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.75); ctx.fillRect(-8, -r - 22, 16, 16); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r + 10, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill();
    const ang = mm => (mm / 60) * Math.PI * 2;
    // kıyas: insanın 29 dakikalık dilimi kalıcı (koyu tarama); kronometre her turda yeni dilim sayar
    const humanK = t >= T.human - 0.04 && t < T.ask + 0.3 ? ease.enter(seg(t, T.human - 0.04, 0.3)) * (1 - ease.exit(seg(t, T.ask, 0.3))) : 0;
    // geçen süre dilimi (içinde bulunulan tur): açık tarama
    if (m != null && !(t >= T.sweep0 && t < T.ask)) {
      const a1 = ang(m % 60 === 0 && m > 0 ? 60 : m % 60);
      if (a1 > 0.001) { ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r - 4, -Math.PI / 2, -Math.PI / 2 + a1); ctx.closePath(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1.4; for (let k = -2 * r; k < 2 * r; k += 8) { ctx.beginPath(); ctx.moveTo(x + k, y - r); ctx.lineTo(x + k + r, y + r); ctx.stroke(); } ctx.restore(); }
    }
    if (humanK > 0) { ctx.save(); ctx.globalAlpha = humanK; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r - 4, -Math.PI / 2, -Math.PI / 2 + ang(Math.min(RECORD_A, m ?? RECORD_A))); ctx.closePath(); ctx.fillStyle = 'rgba(28,27,24,0.55)'; ctx.fill(); ctx.restore(); }
    // çentikler ve rakamlar (60/15/30/45)
    for (let i = 0; i < 60; i++) { const a = ang(i), big = i % 5 === 0; ctx.beginPath(); ctx.moveTo(x + Math.sin(a) * r * (big ? 0.84 : 0.9), y - Math.cos(a) * r * (big ? 0.84 : 0.9)); ctx.lineTo(x + Math.sin(a) * r * 0.97, y - Math.cos(a) * r * 0.97); ctx.lineWidth = big ? 3 : 1.4; ctx.strokeStyle = C.ink; ctx.stroke(); }
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    [[0, '60'], [15, '15'], [30, '30'], [45, '45']].forEach(([v, s]) => { const a = ang(v); ctx.fillText(s, x + Math.sin(a) * r * 0.66, y - Math.cos(a) * r * 0.66 + 14); });
    // eski rekor çentiği (24:37) ve "yarım saat" hesabı çentiği
    const notch = (mm, k, label) => { if (k <= 0) return; const a = ang(mm); ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(x + Math.sin(a) * r * 0.5, y - Math.cos(a) * r * 0.5); ctx.lineTo(x + Math.sin(a) * (r + 22), y - Math.cos(a) * (r + 22)); ctx.lineWidth = 4; ctx.setLineDash([8, 6]); ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); };
    notch(OLD_A, t >= T.rekor - 0.2 && t < T.whip0 + 0.2 ? ease.enter(seg(t, T.rekor - 0.2, 0.35)) * (1 - seg(t, T.whip0, 0.3)) : 0);
    notch(30, t >= T.est - 0.04 && t < T.tag + 0.2 ? ease.enter(seg(t, T.est - 0.04, 0.35)) * (1 - seg(t, T.tag, 0.3)) : 0);
    // saat sayacı (iç küçük kadran: 0–4 saat)
    const sx = x, sy = y + r * 0.27, sr = r * 0.16, hrs = m == null ? 0 : m / 60;
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(sx + Math.sin(a) * sr * 0.7, sy - Math.cos(a) * sr * 0.7); ctx.lineTo(sx + Math.sin(a) * sr, sy - Math.cos(a) * sr); ctx.lineWidth = 2; ctx.stroke(); }
    { const a = (hrs / 4) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.sin(a) * sr * 0.85, sy - Math.cos(a) * sr * 0.85); ctx.lineWidth = 3; ctx.stroke(); }
    // ibre: sahne yokken (açılış, büyüteç) kronometre boşta, ibre sürekli ve yavaş döner (döngü dikişine kilitli)
    const idle = t >= T.ask && t < T.ask + 0.5 ? ang(lerp(WHALE % 60, 60, ease.state(seg(t, T.ask, 0.5)))) : 0;
    const a = m == null ? idle : ang(m % 60);
    const red = t >= T.hit && t < T.ask;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, r * 0.18); ctx.lineTo(0, -r * 0.9); ctx.lineWidth = 5; ctx.strokeStyle = red ? C.red : C.ink; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    // dijital okuma
    const rd = m == null ? '' : fmt(m);
    if (rd) { setFont(ctx, F.head(rd.length > 6 ? 46 : 64)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(rd, x, y + r + 84); }
    else { setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center'; ctx.fillText('KRONOMETRE', x, y + r + 76); }
  }

  // ——— sahne: otel havuzu kesiti ———
  const POOL = { x0: 560, x1: 1050, top: 1010, bot: 1320 }, DECK = 350;
  const lieX = 780, lieSize = 250;
  function pool(t, dx) {
    // kamera: sahne boyunca sürekli, yavaş yaklaşma (havuz dibine doğru)
    const z = 1 + 0.12 * seg(t, L.l02.t0, T.down - L.l02.t0) + 0.08 * seg(t, T.down, T.whip0 - T.down);
    ctx.save(); ctx.translate(dx, 0); ctx.translate(lieX, 1240); ctx.scale(z, z); ctx.translate(-lieX, -1240);
    // lobi: iki sütun ve kemer (sade)
    ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 2;
    for (const cx of [620, 1000]) { ctx.strokeRect(cx - 22, 790, 44, POOL.top - 790); ctx.strokeRect(cx - 32, 778, 64, 12); }
    ctx.beginPath(); ctx.arc(810, 950, 190, Math.PI, 0); ctx.stroke();
    // zemin (güverte) taraması
    ctx.fillStyle = PAPER2; ctx.fillRect(DECK, POOL.top, POOL.x0 - DECK, 470); ctx.fillRect(POOL.x1, POOL.top, 200, 470); ctx.fillRect(DECK, POOL.bot, 920, 170);
    ctx.save(); ctx.beginPath(); ctx.rect(DECK, POOL.top, POOL.x0 - DECK, 470); ctx.rect(POOL.x1, POOL.top, 200, 470); ctx.rect(DECK, POOL.bot, 920, 170); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = 1.2; for (let k = 0; k < 1500; k += 11) { ctx.beginPath(); ctx.moveTo(k, 1480); ctx.lineTo(k + 520, POOL.top); ctx.stroke(); } ctx.restore();
    // havuz: fayans ızgarası, su
    ctx.fillStyle = C.paper; ctx.fillRect(POOL.x0, POOL.top, POOL.x1 - POOL.x0, POOL.bot - POOL.top);
    ctx.strokeStyle = 'rgba(28,27,24,0.12)'; ctx.lineWidth = 1; for (let x = POOL.x0; x < POOL.x1; x += 38) { ctx.beginPath(); ctx.moveTo(x, POOL.top + 30); ctx.lineTo(x, POOL.bot); ctx.stroke(); } for (let y = POOL.top + 30; y < POOL.bot; y += 38) { ctx.beginPath(); ctx.moveTo(POOL.x0, y); ctx.lineTo(POOL.x1, y); ctx.stroke(); }
    // ışık desenleri dipte (sürekli döngü)
    ctx.save(); ctx.beginPath(); ctx.rect(POOL.x0, POOL.top, POOL.x1 - POOL.x0, POOL.bot - POOL.top); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 2;
    for (const [cx, cy, len] of caus) { const x = POOL.x0 + (((cx + t * rq(0.05)) % 1)) * (POOL.x1 - POOL.x0), y = POOL.bot - 10 - cy * 26; ctx.beginPath(); for (let j = 0; j <= 8; j++) ctx[j ? 'lineTo' : 'moveTo'](x + j * len / 8, y + 4 * Math.sin(j * 1.3 + t * wq(2.2) + cx * 9)); ctx.stroke(); }
    ctx.restore();
    // su yüzeyi: dalgacık (sürekli döngü)
    ctx.beginPath(); for (let x = POOL.x0; x <= POOL.x1; x += 8) ctx[x === POOL.x0 ? 'moveTo' : 'lineTo'](x, POOL.top + 22 + 3 * Math.sin(x * 0.04 - t * wq(2.6))); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // havuz duvarları
    ctx.beginPath(); ctx.moveTo(POOL.x0, POOL.top); ctx.lineTo(POOL.x0, POOL.bot); ctx.lineTo(POOL.x1, POOL.bot); ctx.lineTo(POOL.x1, POOL.top); ctx.lineWidth = 3.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(DECK, POOL.top); ctx.lineTo(POOL.x0, POOL.top); ctx.moveTo(POOL.x1, POOL.top); ctx.lineTo(1240, POOL.top); ctx.stroke();
    // 3 m ölçüsü (havuzun sağ duvarında), "üç"te açılır
    const dk = t >= T.lie ? ease.enter(seg(t, Math.max(T.lie, tl.W('l04', 'üç')) - 0.04, 0.35)) : 0;
    if (dk > 0) { ctx.save(); ctx.globalAlpha = dk; const xx = POOL.x1 - 36; ctx.beginPath(); ctx.moveTo(xx, POOL.top + 22); ctx.lineTo(xx, POOL.bot); ctx.moveTo(xx - 12, POOL.top + 22); ctx.lineTo(xx + 12, POOL.top + 22); ctx.moveTo(xx - 12, POOL.bot); ctx.lineTo(xx + 12, POOL.bot); ctx.lineWidth = 3; ctx.stroke(); chip('3 m', xx - 16, (POOL.top + POOL.bot) / 2 + 14, 1, 'right'); ctx.restore(); }
    // oksijen tüpü (güvertede) ve hortum
    const tankK = 1 - ease.exit(seg(t, T.down - 0.2, 0.4));
    if (tankK > 0) { ctx.save(); ctx.globalAlpha = tankK; ctx.translate(405, POOL.top); drawTank(ctx, 180); ctx.restore(); }
    // dalgıç: güvertede oturur (maske), "havuzun"da suya iner, "uzanıyor"da dipte sırtüstü
    const go = ease.state(seg(t, T.lie - 0.2, Math.max(1.4, T.down - T.lie + 0.6)));
    const sitX = 485, sitY = POOL.top, bottomX = lieX, bottomY = POOL.bot - 0.08 * lieSize + 0.5 * lieSize;
    const px = lerp(sitX, bottomX, go), py = lerp(sitY, bottomY, ease.enter(seg(go, 0.25, 0.75)));
    const pose = go <= 0 ? { ...DP.sitMask, body: 6 + 4 * Math.sin(t * wq(1.4)) } : mixPersonPose(DP.sitMask, DP.supine, ease.state(seg(go, 0.1, 0.8)));
    ctx.save(); ctx.translate(px, py); drawFigure(ctx, DIVER_CARD, pose, lerp(220, lieSize, go)); ctx.restore();
    // maske hortumu (oksijen solurken)
    if (t >= T.oxy - 0.3 && go < 0.05) { const k = ease.enter(seg(t, T.oxy - 0.3, 0.4)); ctx.save(); ctx.globalAlpha = k * tankK; ctx.beginPath(); ctx.moveTo(405, POOL.top - 190); ctx.bezierCurveTo(405, POOL.top - 250, sitX + 50, POOL.top - 250, sitX + 14, POOL.top - 0.885 * 220); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * rq(1.5) * 22; ctx.lineWidth = 2; ctx.strokeStyle = C.paper; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
    // hakemler: "beş"te güverteye gelir; ellerinde kronometre, kollar nefes ritminde
    const jk = t >= T.judges - 0.3 ? ease.enter(seg(t, T.judges - 0.3, 0.6)) : 0;
    if (jk > 0) for (let i = 0; i < 2; i++) { const hx = 478 + i * 62 - 140 * (1 - jk), ph = 0.5 + 0.5 * Math.sin(t * wq(1.1) + i * 2); ctx.save(); ctx.translate(hx, POOL.top); drawFigure(ctx, JUDGE_CARD, mixPersonPose(PP.stand, PP.point, 0.4 + 0.3 * ph), 230); ctx.restore(); }
    ctx.restore();
    const ck = ease.enter(seg(t, L.l02.t0 + 0.3, 0.4));
    chip(t >= T.down ? 'UZMAN İŞİ · DENEMEYİN' : t >= T.oxy - 0.06 ? 'SAF OKSİJEN' : 'OPATIJA · HIRVATİSTAN', 360 + dx, 1376, ck);
  }

  // ——— sahne: "Yoksa bu balina mı?" — büyüteç ———
  function whale(t, dx) {
    const k = ease.enter(seg(t, T.balina - 0.1, 0.4)), R = 220 * (0.6 + 0.4 * k) * (1 + 0.04 * seg(t, T.balina, T.sea - T.balina));
    const X = 650 + dx, Y = 1040;
    if (k <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.arc(X, Y, R, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.clip();
    darkWater(X - R, Y - R, 2 * R, 2 * R, t, 0.5);
    ctx.save(); ctx.translate(X + 10 + 8 * Math.sin(t * wq(0.9)), Y + 6 * Math.sin(t * wq(0.7))); ctx.rotate(-0.08); drawBeakedWhale(ctx, R * 1.75, t * wq(4.2)); ctx.restore();
    ctx.restore();
    ctx.beginPath(); ctx.arc(X, Y, R, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    chip('CUVIER GAGALI BALİNASI', X, Y + R + 56, k, 'center');
  }
  // koyu su: seyrek dikey tarama + aşağı süzülen deniz karı (sürekli döngü)
  function darkWater(x0, y0, w, h, t, dens = 1) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    ctx.strokeStyle = `rgba(28,27,24,${0.22 * dens})`; ctx.lineWidth = 1.2; for (let k = x0 - h; k < x0 + w; k += 7) { ctx.beginPath(); ctx.moveTo(k, y0 + h); ctx.lineTo(k + h * 0.25, y0); ctx.stroke(); }
    ctx.fillStyle = 'rgba(28,27,24,0.55)'; for (const [sx, sy, sp] of snow) { const yy = y0 + (((sy + t * rq(0.06) * sp) % 1)) * h, xx = x0 + sx * w + 6 * Math.sin(t * wq(0.6) + sx * 30); ctx.fillRect(xx, yy, 3 * sp, 3 * sp); }
    ctx.restore();
  }

  // ——— sahne: 3.000 m'lik okyanus kesiti ———
  function sea(t, dx) {
    ctx.save(); ctx.translate(dx, 0);
    const X0 = SEA.x0, X1 = SEA.x1;
    // katmanlar: 0–200 m güneşli (açık), 200–1.000 m alacakaranlık (seyrek tarama), 1.000 m altı gece (sık tarama)
    ctx.fillStyle = PAPER2; ctx.fillRect(X0, SEA.top, X1 - X0, SEA.bot - SEA.top);
    ctx.save(); ctx.beginPath(); ctx.rect(X0, yD(200), X1 - X0, yD(1000) - yD(200)); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.3)'; ctx.lineWidth = 1.2; for (let k = X0 - 400; k < X1; k += 12) { ctx.beginPath(); ctx.moveTo(k, yD(1000)); ctx.lineTo(k + 180, yD(200)); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(X0, yD(1000), X1 - X0, SEA.bot - yD(1000)); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.62)'; ctx.lineWidth = 1.5; for (let k = X0 - 600; k < X1; k += 6) { ctx.beginPath(); ctx.moveTo(k, SEA.bot); ctx.lineTo(k + 450, yD(1000)); ctx.stroke(); } ctx.restore();
    // deniz karı (sürekli döngü)
    ctx.fillStyle = 'rgba(28,27,24,0.5)'; for (const [sx, sy, sp] of snow) { const yy = SEA.top + 20 + (((sy + t * rq(0.05) * sp) % 1)) * (SEA.bot - SEA.top - 20), xx = X0 + sx * (X1 - X0); ctx.fillRect(xx, yy, 3.2 * sp, 3.2 * sp); }
    // yüzey dalgası ve güneş ışınları
    ctx.beginPath(); for (let x = X0; x <= X1; x += 8) ctx[x === X0 ? 'moveTo' : 'lineTo'](x, SEA.top + 4 * Math.sin(x * 0.03 - t * wq(2))); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.strokeStyle = 'rgba(28,27,24,0.25)'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { const x = X0 + 60 + i * 95 + 14 * Math.sin(t * wq(0.5) + i); ctx.beginPath(); ctx.moveTo(x, SEA.top + 8); ctx.lineTo(x - 50, yD(200)); ctx.stroke(); } ctx.restore();
    // derinlik cetveli (sol kenar)
    setFont(ctx, F.mono(40)); ctx.textAlign = 'left';
    for (const [m, s] of [[1000, '1.000 m'], [2000, '2.000 m'], [3000, '3.000 m']]) { const y = yD(m); ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X0 + 22, y); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); const show = m < 3000 || t >= T.deep - 0.04; if (show) chip(s, X0 + 32, y + (m === 3000 ? -14 : 14), m < 3000 ? 1 : ease.enter(seg(t, T.deep - 0.04, 0.3))); }
    // dalış izi: yüzeyden inip "üç"te 3.000 m'ye, "bir saat"e kadar dipte, sonra yüzeye doğru
    const pathAt = u => { // u: 0..1 → [x, y]
      // başta yataya yakın (büyük balina yavaşça döner), sonra dik iniş
      if (u < 0.4) { const v = u / 0.4; return [X0 + 330 + 120 * Math.sin(v * Math.PI / 2), lerp(960, yD(2990), ease.state(v))]; }
      if (u < 0.7) { const v = (u - 0.4) / 0.3; return [lerp(X0 + 450, X0 + 560, v), yD(2990 - 120 * Math.sin(v * Math.PI))]; }
      const v = (u - 0.7) / 0.3; return [lerp(X0 + 560, X0 + 660, v), yD(lerp(2990, 0, ease.state(v)))];
    };
    const D0 = T.sea + 0.5, uT = t < D0 ? 0 : t < T.deep ? 0.4 * seg(t, D0, T.deep - D0) : t < T.hour ? 0.4 + 0.3 * seg(t, T.deep, T.hour - T.deep) : 0.7 + 0.3 * seg(t, T.hour, T.tag - 0.3 - T.hour);
    if (uT > 0) { ctx.save(); ctx.beginPath(); for (let k = 0; k <= 60; k++) { const p = pathAt(uT * k / 60); ctx[k ? 'lineTo' : 'moveTo'](p[0], p[1]); } ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
    // balina: iz boyunca, burnu hareket yönünde
    { const p = pathAt(Math.max(0.001, uT)), q = pathAt(Math.min(1, uT + 0.01)); const a = uT >= 1 ? -1.2 : Math.atan2(q[1] - p[1], q[0] - p[0]);
      // açılışta büyük (≥ 600 px) ve yatay; inerken ölçeğe küçülür
      const pre = t < D0 ? [X0 + 290 + 40 * seg(t, T.sea - 0.3, D0 - T.sea + 0.3), 960] : p, Lw = lerp(640, 170, ease.state(seg(uT, 0, 0.22)));
      ctx.save(); ctx.translate(pre[0], pre[1]); ctx.rotate(t < D0 ? 0 : a * ease.state(seg(uT, 0, 0.12))); drawBeakedWhale(ctx, Lw, t * wq(5)); ctx.restore(); }
    // ölçek için balinanın boyu: "yaklaşık 3.000 metre"de dibe bir 828 m'lik kule silueti gerekmez; bölgeler yeter
    ctx.restore();
    // tek etiket: balina tanıtılırken yalnız üst satır konuşur; çip "zifiri"de başlar
    if (t >= T.dark - 0.04) chip(t >= T.est - 0.04 ? 'HESAP: YARIM SAAT' : t >= T.hour - 0.04 ? 'TİPİK DALIŞ · 1 SAAT' : 'IŞIKSIZ · 1.000 m ALTI', 380 + dx, 880, ease.enter(seg(t, T.dark - 0.04, 0.3)));
  }

  // ——— sahne: etiket kaydı (uzun dalış) ———
  function tagScene(t, dx) {
    ctx.save(); ctx.translate(dx, 0);
    const X0 = SX0 + 10, X1 = 1060;
    darkWater(X0, STAGE_TOP + 20, X1 - X0, 1480 - STAGE_TOP - 20, t, 1.2);
    // derinlik izi şeridi (kâğıt kart): zaman yatay, derinlik aşağı (şematik; ölçü yok)
    const KX0 = X0 + 20, KX1 = X1 - 30, KY0 = 770, KY1 = 960, mm = minutes(t) ?? 0;
    ctx.fillStyle = PAPER2; ctx.fillRect(KX0, KY0, KX1 - KX0, KY1 - KY0); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(KX0, KY0, KX1 - KX0, KY1 - KY0);
    const xm = v => KX0 + 20 + (v / 240) * (KX1 - KX0 - 40);
    // saat çentikleri, geçildikçe
    setFont(ctx, F.mono(40)); ctx.textAlign = 'center';
    for (let h = 1; h <= 3; h++) { const x = xm(h * 60), k = mm >= h * 60 ? ease.enter(seg(mm, h * 60, 8)) : 0; ctx.beginPath(); ctx.moveTo(x, KY1); ctx.lineTo(x, KY1 - 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); if (k > 0) { ctx.globalAlpha = k; ctx.fillStyle = C.ink; ctx.fillText(`${h} sa`, x, KY1 + 50); ctx.globalAlpha = 1; } }
    const prof = v => { const d = v < 8 ? v / 8 : v > WHALE - 10 ? (WHALE - v) / 10 : 1; return KY0 + 26 + d * (KY1 - KY0 - 50) * (0.93 + 0.03 * Math.sin(v * 0.07)); };
    ctx.beginPath(); for (let v = 0; v <= mm; v += 1) ctx[v ? 'lineTo' : 'moveTo'](xm(v), prof(v)); if (mm > 0) ctx.lineTo(xm(mm), prof(mm)); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    if (mm > 0) { ctx.beginPath(); ctx.arc(xm(mm), prof(mm), 7, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    // balina (büyük, etiketli): soldan sağa süzülür; etiket sinyali halkaları yukarı (sürekli döngü)
    const wx = lerp(560, 760, seg(t, T.tag, T.cmp0 - T.tag)), wy = 1220 + 8 * Math.sin(t * wq(0.6));
    for (let i = 0; i < 3; i++) { const u = (t * rq(0.8) + i / 3) % 1; ctx.save(); ctx.globalAlpha = 0.7 * (1 - u); ctx.beginPath(); ctx.arc(wx - 50, wy - 70, 20 + 70 * u, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.translate(wx, wy); drawBeakedWhale(ctx, 520, t * wq(3.4), { tag: true }); ctx.restore();
    ctx.restore();
    chip(t >= T.m42 - 0.04 ? 'TEK DALIŞ · 222 DAKİKA' : 'UYDU ETİKETİ', 380 + dx, 1400, ease.enter(seg(t, T.tag + 0.3, 0.4)));
  }

  // ——— sahne: aynı kronometrede kıyas — mini kadranlar ———
  function cmpScene(t, dx) {
    const out = 1 - ease.exit(seg(t, T.ask - 0.25, 0.25));
    const m = minutes(t) ?? 0, n = m / RECORD_A;   // kaç dilim doldu
    const GX = 440 + dx, GY = 900, GAPX = 158, GAPY = 240, r = 60;
    for (let i = 0; i < 8; i++) {
      const fill = clamp01(n - i); if (fill <= 0 && i > 0) continue;
      const cx = GX + (i % 4) * GAPX, cy = GY + Math.floor(i / 4) * GAPY;
      const app = ease.enter(seg(fill, 0, 0.25)) * out; if (app <= 0) continue;
      const hero = i === 6 && t >= T.hit, col = hero ? C.red : C.ink;
      ctx.save(); ctx.globalAlpha = app; ctx.translate(cx, cy); ctx.scale(0.7 + 0.3 * app, 0.7 + 0.3 * app);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r - 5, -Math.PI / 2, -Math.PI / 2 + fill * (RECORD_A / 60) * Math.PI * 2); ctx.closePath(); ctx.fillStyle = hero ? C.red : 'rgba(28,27,24,0.55)'; ctx.fill();
      setFont(ctx, F.mono(40)); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(i === 7 ? '' : `×${i + 1}`, 0, r + 50);
      ctx.restore();
    }
    // etiketler: insanın dilimi, balinanın toplamı
    const hk = (t >= T.human - 0.04 ? ease.enter(seg(t, T.human - 0.04, 0.35)) : 0) * out;
    chip('İNSAN · 29 DK', GX - 70, GY - 90, hk);
    const wk = (t >= T.uzun ? ease.enter(seg(t, T.uzun, 0.4)) : 0) * out;
    chip('BALİNA · 222 DK', GX - 70, GY + GAPY * 2 - 50, wk);
    // iki sürekli döngü: arkada süzülen küçük balina silueti ve yükselen kabarcıklar
    const k0 = ease.enter(seg(t, T.cmp0 + 0.2, 0.5)) * out;
    if (k0 > 0) { ctx.save(); ctx.globalAlpha = k0 * 0.85; ctx.translate(780 + dx + 30 * Math.sin(t * wq(0.4)), 1380); drawBeakedWhale(ctx, 220, t * wq(4)); ctx.restore();
      ctx.save(); ctx.globalAlpha = k0; for (let i = 0; i < 6; i++) { const u = (t * rq(0.35) + i / 6) % 1; ctx.beginPath(); ctx.arc(980 + dx + 10 * Math.sin(u * 9 + i), 1300 - u * 520, 5 + (i % 3) * 3, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); } ctx.restore(); }
  }

  // ——— açılış ve soru karesi: havuzun dibinde sırtüstü dalgıç (tek büyüteç) ———
  // kamera hep içeri: açılışta 1 → 1,03, soru boyunca 0,97 → 1 (son kare = kare 0, hız yönü aynı)
  function intro(t, dx) {
    const zi = t < T.ask ? 1 + 0.03 * seg(t, 0, 2) : lerp(0.97, 1, seg(t, T.ask, D - T.ask));
    const R = { x: 650 + dx, y: 1080, r: 290 };
    ctx.save(); ctx.translate(R.x, R.y); ctx.scale(zi, zi); ctx.translate(-R.x, -R.y);
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, R.r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.14)'; ctx.lineWidth = 1; for (let x = R.x - 320; x < R.x + 320; x += 44) { ctx.beginPath(); ctx.moveTo(x, R.y - 320); ctx.lineTo(x, R.y + 320); ctx.stroke(); } for (let y = R.y - 320; y < R.y + 320; y += 44) { ctx.beginPath(); ctx.moveTo(R.x - 320, y); ctx.lineTo(R.x + 320, y); ctx.stroke(); }
    // su yüzeyi (üstte) ve dipte ışık desenleri: sürekli döngü
    ctx.beginPath(); for (let x = R.x - 320; x <= R.x + 320; x += 8) ctx[x === R.x - 320 ? 'moveTo' : 'lineTo'](x, R.y - 200 + 4 * Math.sin(x * 0.04 - t * wq(2.6))); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.strokeStyle = 'rgba(28,27,24,0.3)'; ctx.lineWidth = 2;
    for (const [cx, cy, len] of caus) { const x = R.x - 320 + (((cx + t * rq(0.05)) % 1)) * 640, y = R.y + 150 - cy * 40; ctx.beginPath(); for (let j = 0; j <= 8; j++) ctx[j ? 'lineTo' : 'moveTo'](x + j * len / 8, y + 4 * Math.sin(j * 1.3 + t * wq(2.2) + cx * 9)); ctx.stroke(); }
    const FL = R.y + 170;
    ctx.fillStyle = PAPER2; ctx.fillRect(R.x - 320, FL, 640, 200); ctx.beginPath(); ctx.moveTo(R.x - 320, FL); ctx.lineTo(R.x + 320, FL); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(R.x - 320, FL, 640, 200); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = 1.2; for (let k = -400; k < 700; k += 11) { ctx.beginPath(); ctx.moveTo(R.x + k, FL + 200); ctx.lineTo(R.x + k + 200, FL); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(R.x - 30, FL - 0.08 * 420 + 0.5 * 420); drawFigure(ctx, DIVER_CARD, DP.supine, 420); ctx.restore();
    ctx.restore(); ctx.beginPath(); ctx.arc(R.x, R.y, R.r, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }

  function chip(s, x, y, a = 1, al = 'left', col = C.ink, size = 40) {
    if (a <= 0) return; setFont(ctx, F.mono(size)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - size * 0.82, tw + 20, size * 1.18); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(67); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'dusunceli'], [T.down, 'ayakta', 'saskin'], [T.m20, 'sasirma', 'saskin'], [T.m20 + 1.4, 'ayakta', 'dusunceli'], [T.stopA, 'sasirma', 'saskin'], [T.stopA + 1.2, 'ayakta', 'dusunceli'],
    [T.balina, 'ayakta', 'saskin'], [T.sea, 'ayakta', 'dusunceli'], [T.deep, 'sasirma', 'saskin'], [T.deep + 1.2, 'ayakta', 'dusunceli'], [T.h3, 'sasirma', 'saskin'], [T.h3 + 1.4, 'ayakta', 'dusunceli'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'dusunceli'], [T.loop0 + 0.5, 'ayakta', 'dusunceli']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: 1 }); ctx.restore();
  }

  // ——— üst blok ———
  function lineText(ln, t) {
    const map = NUMW[ln.id] || {};
    return ln.text.split(' ').map(tok => {
      const key = Object.keys(map).find(k => tok.startsWith(k));
      if (!key || t >= tl.W(ln.id, map[key]) - 0.04) return tok;
      return tok.replace(key, key.replace(/[0-9.,]/g, '_'));
    }).join(' ');
  }
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const acc = ln.id === 'l16' ? [L.l15, L.l16] : ln.id === 'l16b' ? [L.l15, L.l16, L.l16b] : [ln];
    const full = acc.map(l => l.text).join(' '), txt = acc.map(l => lineText(l, t)).join(' ');
    const p = acc.length > 1 ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, full, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const toks = txt.split(' '); let k = 0;
    const shown = ls.map(s => { const n = s.split(' ').length; const r = toks.slice(k, k + n).join(' '); k += n; return r; });
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    shown.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(132)); revealText(ctx, 'Nefessiz', SAFE.x0, 488, 132, k, C.ink);
    setFont(ctx, F.head(64)); revealText(ctx, 'Hangisi daha şaşırtıcı?', SAFE.x0, 566, 64, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(40)); revealText(ctx, label, SAFE.x0, 590, 40, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = num ? ctx.measureText(num).width : 0; if (num) revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + (num ? 14 : 0), 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(40));
    if (right1) revealText(ctx, right1, SAFE.x1, 634, 40, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 40, p, C.graphite, 'right');
  }
  const on = (t, w) => t >= w - 0.04;
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pA = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < L.l03.t0 - 0.06) return row({ label: 'VITOMIR MARIČIĆ · HIRVATİSTAN', num: on(t, T.y2025) ? '2025' : '', right1: 'SERBEST DALIŞ', right2: 'OPATIJA', p: pA });
    if (t < L.l04.t0 - 0.06) return row({ label: 'HAZIRLIK · GUINNESS KURALI', num: 'Saf oksijen', p: 1 });
    if (t < L.l05.t0 - 0.06) return row({ label: 'HAVUZUN DİBİ', num: on(t, tl.W('l04', 'üç')) ? '3' : '', unit: on(t, tl.W('l04', 'üç')) ? 'metre' : '', right1: on(t, T.down) ? 'SIRTÜSTÜ' : '', right2: on(t, T.down) ? 'NEFES YOK' : '', p: 1 });
    if (t < L.l06.t0 - 0.06) return row({ label: 'NEFES ALMADAN', num: on(t, T.m20) ? '20' : on(t, T.m10) ? '10' : '', unit: on(t, T.m10) ? 'dakika' : '', p: 1 });
    if (t < L.l07.t0 - 0.06) return row({ label: on(t, T.judges) ? '5 HAKEM' : 'HAKEMLER', num: on(t, T.dort) ? '+4' : '', unit: on(t, T.dort) ? 'dakikadan fazla' : '', right2: on(t, T.rekor) ? 'ESKİ REKOR 24:37' : '', p: 1 });
    if (t < L.l08.t0 - 0.06) return row({ label: 'YENİ DÜNYA REKORU', num: on(t, T.stopA) ? '29 dk' : '', unit: on(t, T.sec3) ? '3 sn' : '', right1: 'OKSİJEN', right2: 'DESTEKLİ', p: 1 });
    if (t < L.l09.t0 - 0.06) return;
    const pB = Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35)));
    if (t < L.l10.t0 - 0.06) return row({ label: 'CUVIER GAGALI BALİNASI', num: '', p: pB });
    if (t < L.l11.t0 - 0.06) return row({ label: 'DALIŞ DERİNLİĞİ', num: on(t, T.deep) ? '3.000' : '', unit: on(t, T.deep) ? 'metre' : '', right1: on(t, T.deep) ? 'YAKLAŞIK' : '', right2: on(t, T.dark) ? 'ZİFİRİ KARANLIK' : '', p: 1 });
    if (t < L.l12.t0 - 0.06) return row({ label: 'TİPİK DALIŞ', num: on(t, T.hour) ? '1' : '', unit: on(t, T.hour) ? 'saat' : '', right1: on(t, T.hour) ? 'YAKLAŞIK' : '', p: 1 });
    if (t < L.l13.t0 - 0.06) return row({ label: 'HESAPLARA GÖRE OKSİJEN', num: on(t, T.est) ? 'Yarım saat' : '', right2: on(t, T.est) ? 'YETMELİYDİ' : '', p: 1 });
    if (t < L.l13b.t0 - 0.06) return row({ label: 'ETİKETLİ BİR BALİNA', num: 'Dalışta', right1: 'YÜZEYE', right2: on(t, T.cikmiyor) ? 'ÇIKMIYOR' : '', p: 1 });
    if (t < T.cmp0) return row({ label: 'TEK DALIŞ', num: on(t, T.h3) ? '3 sa' : '', unit: on(t, T.m42) ? '42 dk' : '', right1: on(t, T.m42) ? '222 DAKİKA' : '', p: 1 });
    if (t < L.l15.t0 - 0.06) return row({ label: 'AYNI KRONOMETREDE', num: '?', p: ease.enter(seg(t, T.cmp0, 0.35)) });
    if (t < L.l16.t0 - 0.06) return row({ label: 'İNSAN · OKSİJEN DESTEĞİYLE', num: on(t, T.human) ? '29' : '', unit: on(t, T.human) ? 'dakika' : '', p: 1 });
    if (t < T.ask - 0.06) {
      const n = Math.min(7, Math.floor((minutes(t) ?? 0) / RECORD_A + 1e-6));
      if (!on(t, T.hit)) return row({ label: 'BALİNANIN TEK DALIŞI', num: `×${Math.max(1, n)}`, right2: 'İNSAN: 29 DK' });
      row({ label: 'BALİNANIN TEK DALIŞI', num: '7 katından', unit: 'uzun', red: true });
      // oran kendi satırında, kırmızı sayının ~60 px altında (hiçbir şeye değmez)
      if (on(t, T.uzun)) { setFont(ctx, F.mono(40)); revealText(ctx, 'YAKLAŞIK 7,6 KAT', SAFE.x1, 748, 40, ease.enter(seg(t, T.uzun - 0.04, 0.3)), C.graphite, 'right'); }
      return;
    }
    if (t < T.ask + 0.15) return;
    const p = ease.enter(seg(t, T.ask + 0.15, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Dalgıç mı, balina mı?', SAFE.x0, 556, 80, p, C.ink);
  }

  // ——— kare ———
  const SCENES = { intro, pool, whale, sea, tag: tagScene, cmp: cmpScene };
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    ctx.save(); ctx.beginPath(); ctx.rect(SX0 - 10, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    for (const p of panelsAt(t)) { ctx.save(); ctx.beginPath(); ctx.rect(SX0 - 10 + p.dx, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); SCENES[p.name](t, p.dx); ctx.restore(); }
    ctx.restore();
    dial(t);
    if (t >= T.ask + 0.4 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.4, 0.25)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET', SAFE.x0, 630, kf, 'left', C.ink, 44); chip('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 686, kf, 'left', C.ink, 44); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

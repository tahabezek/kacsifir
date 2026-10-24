// "Merdiven" şablonu (Kaç Sıfır?): Ay'a merdivenle çıksan kaç yıl sürer?
// Yandan gravür merdiven; tırmanan kişi ekranda sabit durur, dünya aşağı kayar. İrtifa logaritmik ölçekte: her on kat
// eşit aralık (Kaç Sıfır). Kilometre taşları gerçek irtifalarında: Everest 8.849 m, uzayın sınırı 100 km, Uzay
// İstasyonu ~408 km, GPS 20.200 km, Ay 384.400 km. Sayaçlar tek fonksiyondan: basamak = irtifa / 0,17 m,
// süre = basamak × 1 sn. Doruk: Ay'a varış, 72 yıl; ölçek küçülür ve bütün yol tek bakışta görünür; Apollo 11 aynı
// yolu 3 günde geçer. Anlatım saattir (yolculuk_core). Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { CLIMBER_CARD, drawClimber, drawMountain, drawISS, drawSat, drawMoon, drawRocket, drawHouses } from '../merdiven_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND_R = { x: 690, y: 1190, r: 110 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const CL = { x: 440 };                 // tırmanıcının ayağı (ekranda sabit x)
const RULER = { x: 936, y0: 800, y1: 1200 };
const STEP_M = 0.17, H0 = 1.7, MOON = 384400e3;
const MILES = [
  { h: 8849, key: 'everest', label: ['EVEREST', '8.849 m'] },
  { h: 1e5, key: 'karman', label: ['UZAYIN SINIRI', '100 km'] },
  { h: 408e3, key: 'iss', label: ['UZAY İSTASYONU', '408 km'] },
  { h: 20200e3, key: 'gps', label: ['GPS UYDULARI', '20.200 km'] },
];

export function merdivenTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    rule: L.l02.t0, everest: Wd('l03', 'zirvesini'), karman: Wd('l04', 'sınırındasın'), iss: Wd('l05', 'varıyorsun'), gps: Wd('l06', 'ulaşıyorsun'),
    steps: Wd('l07', 'iki'), hero: Wd('l08', 'yetmiş') - 0.04, life: L.l09.t0, apollo: L.l10.t0, days3: Wd('l10', 'üç'), loop0: tl.loop0,
  };
  T.follow = L.l10.end + 0.3;
  return T;
}

// süre biçimi: saniye → "14,5 saat", "7 gün", "3,8 yıl", "72 yıl"
export function fmtTime(s) {
  if (s < 60) return [nf0.format(Math.round(s)), 'saniye'];
  if (s < 3600) return [nf0.format(Math.max(1, Math.round(s / 60))), 'dakika'];
  if (s < 2 * 86400) return [nf1.format(s / 3600), 'saat'];
  if (s < 365.25 * 86400) return [nf0.format(Math.round(s / 86400)), 'gün'];
  const y = s / (365.25 * 86400);
  return [y < 10 ? nf1.format(y) : nf0.format(Math.round(y)), 'yıl'];
}
const fmtAlt = h => h < 10 ? nf1.format(h) + ' m' : h < 10000 ? nf0.format(Math.round(h)) + ' m' : nf0.format(Math.round(h / 1000)) + ' km';
const fmtSteps = n => n < 1e6 ? nf0.format(Math.round(n)) : n < 1e9 ? nf2.format(n / 1e6) + ' milyon' : nf2.format(n / 1e9) + ' milyar';

export async function makeMerdivenRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = merdivenTimes(tl);

  // ——— irtifa: anahtar karelerde log10(h) arasında hiç durmayan yumuşak geçiş ———
  const K = [[0, H0], [L.l02.t0, 3], [L.l03.t0, 600], [T.everest, 8849], [T.everest + 0.5, 8849], [T.karman, 1e5], [T.karman + 0.5, 1e5], [T.iss, 408e3], [T.iss + 0.5, 408e3], [T.gps, 20200e3], [T.gps + 0.5, 20200e3], [L.l07.t0, 3e7], [T.hero, MOON]];
  const soft = u => u * u * (3 - 2 * u);
  function logH(t) {
    if (t >= T.loop0) return lerp(Math.log10(MOON), Math.log10(H0), ease.state(seg(t, T.loop0, D - 0.2 - T.loop0)));   // geri sarma
    if (t >= T.hero) return Math.log10(MOON);
    for (let i = 1; i < K.length; i++) if (t < K[i][0]) { const u = soft(seg(t, K[i - 1][0], K[i][0] - K[i - 1][0])); return lerp(Math.log10(K[i - 1][1]), Math.log10(K[i][1]), u); }
    return Math.log10(MOON);
  }
  const altAt = t => Math.pow(10, logH(t));
  // kamera: on kat başına px (S) ve tırmanıcının ekran y'si (Yc); dorukta bütün yol görünür, döngüde geri gelir
  const ov = t => t < L.l09.t0 - 0.4 ? 0 : t < T.loop0 ? ease.state(seg(t, L.l09.t0 - 0.4, 1.2)) : 1 - ease.state(seg(t, T.loop0, D - 0.2 - T.loop0));
  // genel bakış yerine oturunca da yavaşça kayar (ölçek 50 → 60 px, 960 → 990): sahne hiçbir karede donmaz
  const drift = t => t < T.hero ? 0 : seg(t, L.l09.t0 + 0.8, T.loop0 - L.l09.t0 - 0.8);
  const camAt = t => { const k = ov(t), d = drift(t) * k; return { S: lerp(170, 50, k) + 10 * d, Yc: lerp(1150, 960, k) + 30 * d }; };
  const yOf = (h, t, cam) => cam.Yc - cam.S * (Math.log10(h) - logH(t));
  // tırmanıcının yaşı: 18 yaşında başlar, geçen süre kadar yaşlanır (72 yılda 90)
  const ageU = t => clamp01((altAt(t) / STEP_M) / (365.25 * 86400) / 72);
  // adım fazı: tırmanırken saniyede 1,8 basamak (simge; zaman hızlandırılmış); Ay'da durur
  // geri sarmada faz tam sayıya iner: son kare kare 0 ile aynı basamak hizasında
  const phaseAt = t => t < T.hero ? t * 1.8 : t < T.loop0 ? T.hero * 1.8 : lerp(T.hero * 1.8, Math.ceil(T.hero * 1.8), ease.state(seg(t, T.loop0, D - 0.2 - T.loop0)));

  const rnd = mulberry32(42);
  const stars = Array.from({ length: 160 }, () => [rnd(), 5.1 + rnd() * 4]);   // x, log10 irtifa
  const clouds = Array.from({ length: 7 }, () => [rnd(), 3.25 + rnd() * 0.65, 0.7 + rnd() * 0.6]);

  // ——— sahne ———
  const STEP = { run: 40, rise: 40 }, MX = CL.x + 40 + 82;   // Ay'ın merkezi: son basamağın hemen sağında
  function stage(t) {
    const cam = camAt(t), lh = logH(t), Yc = cam.Yc, S = cam.S;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.save();   // varış itmesi yalnız dünyaya uygulanır (yazılar ve cetvel sabit)
    { const zi = 1 + (0.1 * ease.enter(seg(t, T.hero, 0.6)) + 0.03 * seg(t, T.hero + 0.6, 1.6)) * (1 - ov(t)) * (t < T.loop0 ? 1 : 0); ctx.translate(CL.x + 60, Yc - 60); ctx.scale(zi, zi); ctx.translate(-(CL.x + 60), -(Yc - 60)); }
    // atmosfer: alçakta sık, yükseldikçe seyrelen yatay çizgiler (1 m – 100 km); üstünde yıldızlar
    for (let k = 0; k <= 100; k++) { const lg = k * 0.05, y = Yc - S * (lg - lh); if (y < STAGE_TOP || y > 1920) continue; ctx.strokeStyle = `rgba(139,133,119,${0.5 * (1 - lg / 5.2)})`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = C.ink; for (const [x, lg] of stars) { const y = Yc - S * (lg - lh); if (y < STAGE_TOP || y > 1920) continue; ctx.fillRect(40 + x * 860, y, 2.6, 2.6); }
    // bulutlar (2–8 km)
    for (const [x, lg, s] of clouds) { const y = Yc - S * (lg - lh); if (y < STAGE_TOP - 40 || y > 1960) continue; const cx = 560 + x * 300; ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); for (const [dx, dy, r] of [[-40, 0, 22], [-10, -14, 28], [25, -4, 22], [48, 4, 16]]) ctx.arc(cx + dx * s, y + dy * s, r * s, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx - 62 * s, y + 18 * s); ctx.lineTo(cx + 64 * s, y + 18 * s); ctx.stroke(); }
    // yer (1 m'nin altı): evler ve toprak
    const yG = Yc - S * (0 - lh), gA = Math.max(ov(t), 1 - seg(lh, 1.7, 0.5));
    if (yG < 1960 && gA > 0) { ctx.save(); ctx.globalAlpha = gA; ctx.fillStyle = '#F4EEE1'; ctx.fillRect(0, yG, W, 1920 - yG); ctx.beginPath(); ctx.moveTo(0, yG); ctx.lineTo(W, yG); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.save(); ctx.translate(470, yG); drawHouses(ctx, 210); ctx.restore(); ctx.restore(); }
    // kilometre taşları (gerçek irtifalarında); tırmanırken geçilen taş tırmanıcının altında söner, genel bakışta hepsi kalır
    const over = ov(t) > 0.5;
    for (const m of MILES) {
      const y = Yc - S * (Math.log10(m.h) - lh); if (y < STAGE_TOP - 200 || y > 1960) continue;
      const a = over ? 1 : 1 - seg(y, Yc + 10, 110);
      if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha = a;
      if (m.key === 'everest') { const base = Yc - S * (3 - lh); ctx.save(); ctx.translate(250, y); drawMountain(ctx, 300, Math.max(30, base - y)); ctx.restore(); }
      if (m.key === 'karman') { ctx.setLineDash([12, 9]); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(RULER.x - 10, y); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]); }
      if (m.key === 'iss') { ctx.save(); ctx.translate(330, y); ctx.rotate(-0.08); drawISS(ctx, over ? 70 : 100); ctx.restore(); }
      if (m.key === 'gps') { ctx.save(); ctx.translate(330, y); ctx.rotate(0.12 + Math.sin(t * 0.8) * 0.04); drawSat(ctx, over ? 60 : 84); ctx.restore(); }
      ctx.restore();
    }
    // merdiven: tırmanıcının ayağından geçen sonsuz basamaklar; Ay'ın hizasında biter, yerin altına inmez
    const ph = phaseAt(t), fr = ph - Math.floor(ph), yMoon = Yc - S * (Math.log10(MOON) - lh);
    ctx.save(); if (gA > 0.02) { ctx.beginPath(); ctx.rect(0, 0, W, yG); ctx.clip(); }
    ctx.beginPath(); let started = false;
    for (let j = -16; j <= 18; j++) {
      const x = CL.x + (j - fr) * STEP.run, y = Yc - (j - fr) * STEP.rise;
      if (y < yMoon + 2) break;
      if (!started) { ctx.moveTo(x, y); started = true; }
      ctx.lineTo(x, y - STEP.rise); ctx.lineTo(x + STEP.run, y - STEP.rise);
    }
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // basamakların altı: taralı taşıyıcı
    ctx.save(); ctx.beginPath();
    { const xa = CL.x - 16 * STEP.run, ya = Yc + 16 * STEP.rise, top = Math.max(yMoon, Yc - 18 * STEP.rise), xb = CL.x + (Yc - top) / STEP.rise * STEP.run; ctx.moveTo(xa, ya); ctx.lineTo(xb, top); ctx.lineTo(xb + 26, top + 26); ctx.lineTo(xa + 26, ya + 26); ctx.closePath(); }
    ctx.fillStyle = C.paper; ctx.fill(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 1.2; for (let d = -1400; d < 1400; d += 7) { ctx.beginPath(); ctx.moveTo(d, 600); ctx.lineTo(d + 1400, 2000); ctx.stroke(); } ctx.restore();
    ctx.restore();
    // kilometre taşı etiketleri: solda, iki satır, kâğıt zeminli; genel bakışta gizli (cetvel ölçeği taşır)
    for (const m of MILES) {
      const y = Yc - S * (Math.log10(m.h) - lh); if (y < STAGE_TOP + 40 || y > 1960) continue;
      const a = (1 - ov(t)) * (1 - seg(y, Yc + 10, 110)); if (a <= 0.01) continue;
      const ly = m.key === 'everest' ? y - 50 : m.key === 'karman' ? y + 44 : y - 92;
      setFont(ctx, F.mono(32)); const tw = Math.max(ctx.measureText(m.label[0]).width, ctx.measureText(m.label[1]).width);
      const ta = a * clamp01((ly - 30 - 800) / 30) * (1 - seg(ly + 48, 1090, 40)); if (ta <= 0.01) continue;
      ctx.save(); ctx.globalAlpha = ta; ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 14, ly - 32, tw + 16, 82); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(m.label[0], SAFE.x0 + 22, ly); ctx.fillText(m.label[1], SAFE.x0 + 22, ly + 38); ctx.restore();
    }
    // Ay: gerçek irtifasında (ekrana girince); tepesine merdiven dayanır
    if (yMoon > STAGE_TOP - 200) { ctx.save(); ctx.translate(MX, yMoon); drawMoon(ctx, 82); ctx.restore();
      const la = clamp01((yMoon - 860) / 60) * (t < T.loop0 ? 1 : 0); if (la > 0 && !over) { setFont(ctx, F.mono(32)); const lb = 'AY · 384.400 km', tw = ctx.measureText(lb).width; ctx.save(); ctx.globalAlpha = la; ctx.fillStyle = C.paper; ctx.fillRect(MX - tw / 2 - 8, yMoon + 96, tw + 16, 44); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, MX, yMoon + 128); ctx.restore(); } }
    // tırmanıcı
    // Ay'da faz donar (adım ortasında durur); geri sarma aynı fazdan devam eder: kesinti yok
    ctx.save(); ctx.translate(CL.x - fr * STEP.run, Yc + fr * STEP.rise);
    drawClimber(ctx, CLIMBER_CARD, { phase: fr, age: ageU(t) }, 150, { run: STEP.run / 150, rise: STEP.rise / 150 });
    ctx.restore();
    // Apollo 11: yerden Ay'a 2 sn'de (aynı log ölçekte), iz çizgisi
    if (t >= T.apollo && t < T.follow + 0.6) {
      const u = ease.state(seg(t, T.apollo + 0.1, T.days3 + 0.4 - T.apollo - 0.1)), y0 = Yc - S * (0.3 - lh), y1 = yMoon + 82, x0 = 730, x1 = MX, y = lerp(y0, y1, u), x = lerp(x0, x1, u), ang = Math.atan2(x1 - x0, -(y1 - y0));
      const k = 1 - seg(t, T.follow, 0.6);
      ctx.save(); ctx.globalAlpha = k;
      ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.lineWidth = 2.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); drawRocket(ctx, 90, u < 1 ? 1 : 0); ctx.restore();
      if (t >= T.apollo + 0.3) { const ym = lerp(y0, y1, 0.45), xm = lerp(x0, x1, 0.45); setFont(ctx, F.mono(32)); const tw = ctx.measureText('APOLLO 11').width; ctx.fillStyle = C.paper; ctx.fillRect(xm - 24 - tw - 16, ym - 32, tw + 16, 82); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText('APOLLO 11', xm - 32, ym); if (t >= T.days3 - 0.1) ctx.fillText('3 GÜN', xm - 32, ym + 38); }
      ctx.restore();
    }
    // varışta kırmızı etiket: "72 YIL" (yalnız doruk)
    if (false) { const pop = 1; setFont(ctx, F.head(52)); const lb = '72 YIL'; const tw = ctx.measureText(lb).width; ctx.save(); ctx.translate(CL.x - 40 - tw / 2, Yc - 170); ctx.scale(pop, pop); ctx.fillStyle = C.paper; ctx.fillRect(-tw / 2 - 10, -46, tw + 20, 58); ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.fillText(lb, 0, 0); ctx.restore(); }
    ctx.restore();
    // hedef (kare 0 ve döngü): Ay ekranın dışında; köşede sembolik Ay ve uzaklığı
    const pin = t < 3.0 ? 1 - seg(t, 2.6, 0.4) : t >= T.loop0 ? seg(t, T.loop0 + 0.4, 0.5) : 0;
    if (pin > 0) { setFont(ctx, F.mono(34)); const lb = 'AY · 384.400 km', tw = ctx.measureText(lb).width; ctx.save(); ctx.globalAlpha = pin; ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 4, 718, tw + 70, 48); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(SAFE.x0 + 4, 718, tw + 70, 48);
      ctx.beginPath(); ctx.moveTo(SAFE.x0 + 30, 756); ctx.lineTo(SAFE.x0 + 30, 728); ctx.moveTo(SAFE.x0 + 20, 738); ctx.lineTo(SAFE.x0 + 30, 726); ctx.lineTo(SAFE.x0 + 40, 738); ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(lb, SAFE.x0 + 56, 754); ctx.restore(); }
    if (false) { ctx.save(); ctx.globalAlpha = pin; ctx.translate(190, 820); drawMoon(ctx, 46); ctx.restore(); ctx.save(); ctx.globalAlpha = pin; setFont(ctx, F.mono(30)); ctx.fillStyle = C.paper; const lb = 'AY · 384.400 km', tw = ctx.measureText(lb).width; ctx.fillRect(250, 800, tw + 16, 42); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(lb, 258, 832); ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(190, 868); ctx.lineTo(CL.x + 120, Yc - 260); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
    // logaritmik irtifa cetveli (sağda): her on kat eşit aralık
    ctx.save(); ctx.beginPath(); ctx.rect(0, RULER.y0, W, RULER.y1 - RULER.y0); ctx.clip();
    ctx.beginPath(); ctx.moveTo(RULER.x, RULER.y0); ctx.lineTo(RULER.x, RULER.y1); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    const LBL = ['1 m', '10 m', '100 m', '1 km', '10 km', '100 km', '1.000 km', '10.000 km', '100.000 km', '1 milyon km'];
    for (let k = 0; k <= 9; k++) {
      for (let s = 1; s < 10; s++) { const y = Yc - S * (k + Math.log10(s) - lh); if (y < RULER.y0 || y > RULER.y1) continue; ctx.beginPath(); ctx.moveTo(RULER.x, y); ctx.lineTo(RULER.x - (s === 1 ? 18 : 8), y); ctx.lineWidth = s === 1 ? 2.5 : 1.2; ctx.stroke(); }
      const y = Yc - S * (k - lh); if (y < RULER.y0 + 16 || y > RULER.y1 - 6) continue;
      if (over && k % 3 !== 0) continue;   // genel bakışta seyrek
      setFont(ctx, F.mono(32)); const tw = ctx.measureText(LBL[k]).width; ctx.fillStyle = C.paper; ctx.fillRect(RULER.x - 26 - tw - 10, y - 26, tw + 20, 44); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText(LBL[k], RULER.x - 26, y + 10);
    }
    // tırmanıcının işareti
    ctx.beginPath(); ctx.moveTo(RULER.x + 4, Yc); ctx.lineTo(RULER.x + 18, Yc - 9); ctx.lineTo(RULER.x + 18, Yc + 9); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
    ctx.restore();
    // log ölçek açıklaması (kanca bitince sona kadar): sahnenin tepesinde
    { const k = t < T.loop0 ? ease.enter(seg(t, 3.2, 0.4)) : 1 - seg(t, T.loop0, 0.3); if (k > 0) { setFont(ctx, F.mono(34)); const lb = 'LOG ÖLÇEK · HER ÇİZGİ 10 KAT', tw = ctx.measureText(lb).width; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 + 4, 718, tw + 24, 48); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(lb, SAFE.x0 + 16, 754); ctx.restore(); } }
    ctx.restore();
    return [CL.x + 10, Yc - 150];
  }

  // ——— büyüteç ———
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'step') {
      // bir basamak ve ölçüsü: 17 cm; ayak basar
      const ph = (t * 1.2) % 1;
      ctx.beginPath(); ctx.moveTo(-130, 70); ctx.lineTo(-20, 70); ctx.lineTo(-20, -20); ctx.lineTo(130, -20); ctx.lineTo(130, 130); ctx.lineTo(-130, 130); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 3.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-40, 70); ctx.lineTo(-40, -20); ctx.moveTo(-48, 70); ctx.lineTo(-32, 70); ctx.moveTo(-48, -20); ctx.lineTo(-32, -20); ctx.lineWidth = 2; ctx.stroke();
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('17 cm', 0, 44);
      const fx = lerp(-90, 40, ease.state(clamp01(ph * 1.6))), fy = ph < 0.6 ? lerp(66, -24, ease.state(clamp01(ph * 1.6))) - Math.sin(clamp01(ph * 1.6) * Math.PI) * 30 : -24;
      ctx.beginPath(); ctx.ellipse(fx, fy - 8, 34, 12, 0, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.beginPath(); ctx.moveTo(fx - 10, fy - 14); ctx.lineTo(fx - 30, fy - 120); ctx.lineWidth = 22; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(28)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center'; ctx.fillText('1 sn', 40, 102);
    } else if (kind === 'summit') {
      // zirvede rüzgâr ve bayraklar; tırmanıcı geçer
      ctx.save(); ctx.translate(0, -40); drawMountain(ctx, 300, 200); ctx.restore();
      for (let i = 0; i < 4; i++) { const x = -40 + i * 26, y = -30 + i * 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 12, y - 4 + Math.sin(t * 6 + i) * 4, x + 24, y + 2); ctx.lineWidth = 3; ctx.stroke(); }
      ctx.save(); ctx.translate(10, -36); drawClimber(ctx, CLIMBER_CARD, { phase: t * 1.4, age: 0 }, 120); ctx.restore();
    } else if (kind === 'iss') {
      ctx.fillStyle = C.ink; for (let i = 0; i < 26; i++) ctx.fillRect(-120 + ((i * 53) % 240), -120 + ((i * 97) % 240), 2.5, 2.5);
      ctx.save(); ctx.translate(-10 + Math.sin(t * 0.6) * 6, -10); ctx.rotate(-0.1); drawISS(ctx, 230); ctx.restore();
    } else if (kind === 'odometer') {
      // basamak sayacı: rakamlar yuvarlanır
      const n = Math.min(2261176471, Math.round((altAt(t) / STEP_M)));
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-120, -48, 240, 96); ctx.lineWidth = 3; ctx.strokeRect(-120, -48, 240, 96);
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(nf0.format(n), 0, 10);
      setFont(ctx, F.mono(24)); ctx.fillStyle = C.graphite; ctx.fillText('BASAMAK', 0, 82);
    } else if (kind === 'old') {
      // Ay'da, bastonlu yaşlı tırmanıcı; uzakta Dünya
      ctx.beginPath(); ctx.arc(0, 260, 220, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(-60, -60, 26, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); ctx.save(); ctx.beginPath(); ctx.arc(-60, -60, 26, 0, Math.PI * 2); ctx.clip(); ctx.lineWidth = 1; for (let d = -60; d < 60; d += 5) { ctx.beginPath(); ctx.moveTo(-60 + d, -90); ctx.lineTo(-30 + d, -30); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.translate(30, 44); ctx.scale(-1, 1); drawClimber(ctx, CLIMBER_CARD, { age: 1, still: true }, 170, { run: 0.06, rise: 0 }); ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const S1 = [[0, null], [L.l02.t0 + 0.2, 'step'], [T.everest - 0.7, 'summit'], [L.l04.t0 + 0.4, null], [L.l05.t0, 'iss'], [L.l06.t0 + 0.2, null], [T.steps - 0.3, 'odometer'], [T.hero, null]];
  function sched(t, S) {
    let i = -1; for (let k = 0; k < S.length; k++) if (t >= S[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S[i], prev = i > 0 ? S[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.everest, 'sasirma', 'saskin'], [T.everest + 1.4, 'ayakta', 'notr'], [T.iss, 'ayakta', 'mutlu'], [T.gps, 'ayakta', 'dusunceli'],
    [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.apollo + 1.2, 'sasirma', 'saskin'], [T.follow, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  // doruk balonu yok: Ay'ın üstüne binerdi; vurguyu kırmızı sayaç ve '72 YIL' taşır
  const bubbles = [];
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
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = 780 - w, y = SIFIR.y - 310;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 40, y + 120); ctx.lineTo(x + w - 54, y + 24);
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
  // kare 0 ve döngü: soru başlık (l01 ile aynı cümle)
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(96)); revealText(ctx, "Ay'a merdivenle", SAFE.x0, 470, 96, k, C.ink); revealText(ctx, 'çıksan kaç yıl', SAFE.x0, 566, 96, k, C.ink); revealText(ctx, 'sürer?', SAFE.x0, 662, 96, k, C.ink);
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
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const p = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) * (t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1);
    const h = altAt(t), n = h / STEP_M;
    if (t < T.hero - 0.02) { const [v, u] = fmtTime(n); row({ label: 'GEÇEN SÜRE', num: v, unit: u, right1: 'İRTİFA: ' + fmtAlt(h), right2: 'BASAMAK: ' + fmtSteps(n), p }); return; }
    if (t < T.apollo) { row({ label: "AY'A VARIŞ", num: '72', unit: 'yıl', red: true, right1: 'İRTİFA: 384.400 km', right2: t >= T.life ? 'NEREDEYSE BİR ÖMÜR' : 'BASAMAK: 2,26 milyar', p }); return; }
    row({ label: 'APOLLO 11', num: t >= T.days3 - 0.1 ? '3' : '1969', unit: t >= T.days3 - 0.1 ? 'gün' : '', right1: 'MERDİVENLE: 72 yıl', right2: 'AYNI YOL', p });
  }
  function follow(t) {
    if (t < T.follow || t >= T.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 430;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 1346, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 1346, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 1391); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const at = stage(t);
    const r1 = sched(t, S1);
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, ROUND, r1.k, at);
    if (t >= T.life - 0.2 && t < T.apollo + 0.3) roundel(t, 'old', ROUND_R, ease.enter(seg(t, T.life - 0.2, 0.4)) * (1 - ease.exit(seg(t, T.apollo, 0.3))), null);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    follow(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

// "Saat" şablonu (Hangisi daha şaşırtıcı?): 11 gün uyumayan Randy Gardner ve hafızası 30 saniye süren Clive Wearing.
// A: kâğıt oda; 24 saatlik kadran her gün bir tur döner, pencerede gece ve gündüz akar; iki arkadaş defter tutar.
// B: kadran kesmeden geçerek 30 saniyelik kronometreye dönüşür; şef Clive, beyin, günlük sayfası, kapıdan giren karısı,
//    piyano. Doruk: Randy'nin 264 saati 11 turluk bir sarmal; Clive'ın 30 saniyesi aynı ölçekte kırmızı bir çentik.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Harita yok. Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { RANDY_CARD, FRIEND_CARD, FRIEND2_CARD, CLIVE_CARD, DEBORAH_CARD, drawPerson, drawPiano, drawDial } from '../saat_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const FLOOR = 1392, CLK = { x: 730, y: 896, r: 130 }, WIN = { x0: 110, x1: 450, y0: 760, y1: 980 };
const PEOPLE = { f1: 385, randy: 505, f2: 625 };
// doruk: sarmal (11 tur = 264,4 saat) ve büyüteç
const SP = { x: 520, y: 1080, r0: 60, r1: 300, turns: 11 };
const MAG = { x: 830, y: 800, r: 68 };

export function saatTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    fair: Wd('l02', 'bilim'), friends: L.l03.t0, cranky: Wd('l04', 'huysuzlaşıyor'), forget: Wd('l04', 'unutkanlaşıyor'), halluc: Wd('l04', 'hayal'),
    d11: L.l05.t0, count0: Wd('l05', 'geriye'), stop65: Wd('l05', 'altmış'), forgot: Wd('l05', 'unutuyor'), final: L.l06.t0, rec: Wd('l06', 'yirmi'),
    whip0: L.l07.t0 - 0.3, whip1: L.l07.t0 + 0.8, adam: Wd('l07', 'adam'), clive: L.l08.t0, virus: Wd('l09', 'virüs'), erase: Wd('l09', 'yok'),
    mem30: Wd('l10', 'otuz'), diary: L.l11.t0, quote: Wd('l11', 'şimdi'), wife: L.l12.t0, greet: Wd('l12', 'sevinçle'), piano: Wd('l13', 'piyanonun'),
    cmp0: L.l14.t0 - 0.1, hero: L.l16.t0 - 0.04, after: L.l17.t0, resets: Wd('l17', 'otuz'), ask: L.l18.t0, loop0: tl.loop0,
  };
  T.notebook = T.diary - 0.3; T.notebookX = T.wife - 0.2;
  return T;
}

export async function makeSaatRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = saatTimes(tl), Fx = ep.facts;
  const HOURS = Fx.gardner.hours;
  // Randy'nin saati: 1. gün l02–l03, 2. gün l03, 3–10. günler l04'te, 11. gün l05'te; 'yirmi beş dakika'da 264,4 saat
  const hoursAt = t => t < L.l02.t0 ? 1.5 * seg(t, 0.3, L.l02.t0 - 0.3) : t < L.l03.t0 ? lerp(1.5, 24, seg(t, L.l02.t0, L.l03.t0 - L.l02.t0)) : t < L.l04.t0 ? lerp(24, 48, seg(t, L.l03.t0, L.l04.t0 - L.l03.t0))
    : t < L.l05.t0 ? lerp(48, 240, seg(t, L.l04.t0, L.l05.t0 - L.l04.t0)) : t < T.rec ? lerp(240, HOURS, seg(t, L.l05.t0, T.rec - L.l05.t0)) : HOURS;
  const dayOf = h => Math.min(11, Math.floor(h / 24) + 1);
  // kronometre: 'otuz' kelimesinden sonra gerçek zamanda 0–30 sn döner (kare 0 ve döngüde 24 saatlik kadran)
  const secAt = t => t < T.mem30 ? 0 : t < T.wife + 0.3 ? (t - T.mem30) % 30 : (t - T.wife - 0.3) % 30;
  const plate = (t, a, b) => t < a ? 0 : t < b ? ease.state(seg(t, a, 0.75)) : 1 - ease.state(seg(t, b, 0.6));
  const rnd = mulberry32(38);
  const stars = Array.from({ length: 22 }, () => [rnd(), rnd()]);
  const notes = Array.from({ length: 14 }, () => [rnd(), rnd(), rnd()]);

  // ——— oda (A) ve Clive'ın odası (B): aynı kâğıt sahne; kesmede sola kayar, yenisi sağdan gelir ———
  // sahne kayması: A'dan B'ye (whip0–whip1) −1 → 0
  const shiftAB = t => t < T.whip0 ? 0 : t < T.whip1 ? ease.state(seg(t, T.whip0, T.whip1 - T.whip0)) : 1;
  function sky(t, h) {
    // pencere: gece/gündüz saatin değerinden (6–18 gündüz); güneş ve ay yay çizer
    ctx.save(); ctx.beginPath(); ctx.rect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0); ctx.clip();
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
    const hh = ((h % 24) + 24) % 24, night = hh < 6 || hh >= 18, k = night ? 1 : 0;
    if (night) { ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 1.3; for (let y = WIN.y0; y < WIN.y1; y += 6) { ctx.beginPath(); ctx.moveTo(WIN.x0, y); ctx.lineTo(WIN.x1, y); ctx.stroke(); } ctx.fillStyle = C.paper; for (const [a, b] of stars) ctx.fillRect(WIN.x0 + a * 340, WIN.y0 + b * 150, 3, 3); }
    const u = night ? (((hh + 6) % 24) / 12) : (hh - 6) / 12, sx = lerp(WIN.x0 + 20, WIN.x1 - 20, u), sy = WIN.y1 - 40 - Math.sin(u * Math.PI) * 140;
    ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    if (!night) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 28, sy + Math.sin(a) * 28); ctx.lineTo(sx + Math.cos(a) * 36, sy + Math.sin(a) * 36); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(sx + 9, sy - 5, 19, 0, Math.PI * 2); ctx.fillStyle = 'rgba(28,27,24,0.75)'; ctx.fill(); }
    // çatılar (pencereden San Diego)
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { const x = WIN.x0 + 10 + i * 70; ctx.beginPath(); ctx.moveTo(x, WIN.y1); ctx.lineTo(x, WIN.y1 - 34); ctx.lineTo(x + 30, WIN.y1 - 54); ctx.lineTo(x + 60, WIN.y1 - 34); ctx.lineTo(x + 60, WIN.y1); ctx.fill(); ctx.stroke(); }
    void k; ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.strokeRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo((WIN.x0 + WIN.x1) / 2, WIN.y0); ctx.lineTo((WIN.x0 + WIN.x1) / 2, WIN.y1); ctx.stroke();
  }
  function staff(t, k) {
    // Clive'ın nota çizgisi: pencerenin yerinde; notalar sola akar; virüsten sonra silinir
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(WIN.x0, WIN.y0 + 60 + i * 22); ctx.lineTo(WIN.x1 + 40, WIN.y0 + 60 + i * 22); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
    const er = t >= T.erase ? ease.state(seg(t, T.erase, 0.9)) : 0;
    notes.forEach(([a, b, c], i) => {
      const x = WIN.x1 + 40 - (((a * 400 + (t - T.clive) * 60) % 400)), y = WIN.y0 + 60 + Math.floor(b * 9) * 11;
      if (x < WIN.x0 + 6) return;
      ctx.save(); ctx.globalAlpha = k * (1 - er * (i % 3 === 2 ? 1 : 1));
      ctx.beginPath(); ctx.ellipse(x, y, 9, 6.5, -0.4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + 8, y - 38); ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; ctx.stroke();
      if (c > 0.6) { ctx.beginPath(); ctx.moveTo(x + 8, y - 38); ctx.quadraticCurveTo(x + 22, y - 28, x + 16, y - 14); ctx.stroke(); }
      ctx.restore();
    });
    ctx.restore();
  }
  function room(t) {
    // doruktan sonra (levha arkasında) oda kare 0 hâlindedir: Randy ayakta, saat 0, kadran 24 saatlik
    const back = t >= T.cmp0 + 0.6, tA = back ? 0 : t;
    const s = back ? 0 : shiftAB(t), dx = -W * s, h = hoursAt(tA);
    // sahne boyunca yavaş yaklaşma (%8, kadrana doğru); soruda %94'ten kare 0'daki %100'e (aynı yön): oda hiçbir karede donmaz
    const z = back ? 1 - 0.06 * (1 - seg(t, T.ask, D - T.ask)) : 1 + 0.08 * (t < T.whip0 ? seg(t, 0, T.whip0) : seg(t, T.whip1, T.notebook - T.whip1)) + 0.07 * seg(t, T.notebookX, T.cmp0 + 0.6 - T.notebookX);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.translate(CLK.x, CLK.y); ctx.scale(z, z); ctx.translate(-CLK.x, -CLK.y);
    ctx.beginPath(); ctx.moveTo(-200, FLOOR); ctx.lineTo(W + 200, FLOOR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // A: Randy'nin odası
    if (s < 1) {
      ctx.save(); ctx.translate(dx, 0);
      sky(t, h);
      const awake = tA < T.rec + 1.2, eyes = !awake ? 'closed' : tA >= T.cranky ? (Math.floor(t * 1.3) % 4 === 0 ? 'heavy' : 'wide') : 'open';
      for (const [x, card, arms] of [[PEOPLE.f1, FRIEND_CARD, 'notebook'], [PEOPLE.f2, FRIEND2_CARD, 'down']]) { ctx.save(); ctx.translate(x, FLOOR); if (x > PEOPLE.randy) ctx.scale(-1, 1); drawPerson(ctx, card, { arms, eyes: 'open', lean: Math.sin(t * 0.8 + x) * 0.02 }, 336); ctx.restore(); }
      // Randy: ayakta, hafif sallanır; rekordan sonra oturup uyur
      ctx.save(); ctx.translate(PEOPLE.randy, FLOOR);
      if (awake) drawPerson(ctx, RANDY_CARD, { eyes, lean: Math.sin(t * 1.1) * (tA >= T.cranky ? 0.05 : 0.02), mouth: 'flat' }, 350);
      else drawPerson(ctx, RANDY_CARD, { sit: true, eyes: 'closed', lean: -0.08 }, 350);
      ctx.restore();
      if (!awake) { setFont(ctx, F.name(40)); ctx.fillStyle = C.graphite; const zk = (t - T.rec - 1.2) * 1.5; for (let i = 0; i < 3; i++) { const u = (zk + i / 3) % 1; ctx.globalAlpha = 1 - u; ctx.fillText('z', PEOPLE.randy + 30 + u * 50, FLOOR - 300 - u * 70); } ctx.globalAlpha = 1; }
      // belirtiler (l04): baş çevresinde karalama (huysuz), soru işareti (unutkan), gölge biçim (hayal)
      const hx = PEOPLE.randy + 6, hy = FLOOR - 320;
      // Randy etiketi: kim olduğu ilk saniyeden belli (kesmeye kadar)
      if (!back && t >= L.l02.t0 && t < T.whip0) { const k = ease.enter(seg(t, L.l02.t0, 0.35)) * (1 - seg(t, T.whip0 - 0.25, 0.25)); setFont(ctx, F.mono(34)); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(PEOPLE.randy - 42, hy - 102, 124, 42); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('RANDY', PEOPLE.randy + 20, hy - 70); ctx.globalAlpha = 1; }
      if (!back && t >= T.cranky && t < T.d11 + 0.4) { const u = ease.enter(seg(t, T.cranky, 0.35)); ctx.save(); ctx.globalAlpha = u * (1 - seg(t, T.d11, 0.4)); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 24; i++) { const a = i * 0.9 + t * 3, r = 14 + (i % 5) * 3; ctx.lineTo(hx - 46 + Math.cos(a) * r, hy - 36 + Math.sin(a) * r); } ctx.stroke(); ctx.restore(); }
      if (!back && t >= T.forget && t < T.d11 + 0.4) { const u = ease.enter(seg(t, T.forget, 0.35)); ctx.save(); ctx.globalAlpha = u * (1 - seg(t, T.d11, 0.4)); setFont(ctx, F.head(70)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('?', hx + 50, hy - 26 + Math.sin(t * 3) * 6); ctx.restore(); }
      if (!back && t >= T.halluc && t < T.d11 + 0.4) { const u = ease.enter(seg(t, T.halluc, 0.5)); ctx.save(); ctx.globalAlpha = 0.85 * u * (1 - seg(t, T.d11, 0.4)); ctx.translate(PEOPLE.f2 + 120 + Math.sin(t * 1.7) * 10, FLOOR); ctx.scale(-1, 1); ctx.setLineDash([6, 6]); drawPerson(ctx, FRIEND_CARD, { eyes: 'closed' }, 290); ctx.restore(); }
      ctx.restore();
    }
    // B: Clive'ın odası (sağdan gelir)
    if (s > 0) {
      ctx.save(); ctx.translate(dx + W, 0);
      staff(t, t < T.notebook + 0.8 ? 1 : 0);
      // kapı (sağda): karısı buradan girer
      const DOOR = { x: 650, w: 120 };
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(DOOR.x, FLOOR - 300, DOOR.w, 300); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(DOOR.x, FLOOR - 300, DOOR.w, 300);
      const open = ease.state(seg(t, T.wife, 0.6)) * (1 - ease.state(seg(t, T.piano - 0.6, 0.6)));
      ctx.beginPath(); ctx.moveTo(DOOR.x + DOOR.w, FLOOR - 300); ctx.lineTo(DOOR.x + DOOR.w - DOOR.w * (1 - open * 0.75), FLOOR - 300 + 14 * open); ctx.lineTo(DOOR.x + DOOR.w - DOOR.w * (1 - open * 0.75), FLOOR - 14 * open); ctx.lineTo(DOOR.x + DOOR.w, FLOOR); ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
      // piyano (l13): Clive oturur ve çalar
      const atPiano = t >= T.piano - 0.3;
      if (atPiano) { ctx.save(); ctx.translate(430, FLOOR); ctx.scale(-1, 1); drawPiano(ctx, 290); ctx.restore(); }
      ctx.save(); ctx.translate(atPiano ? 560 : PEOPLE.randy, FLOOR); if (atPiano) ctx.scale(-1, 1);
      const pose = atPiano ? { sit: true, arms: 'piano', phase: t, eyes: 'closed' }
        : t >= T.greet - 0.1 && t < T.piano - 0.3 ? { arms: 'up', phase: t, mouth: 'open', eyes: 'wide' }
        : t < T.virus ? { arms: 'conduct', phase: t } : t < T.diary ? { arms: 'down', eyes: 'open', lean: Math.sin(t * 0.7) * 0.03 } : { arms: 'down', eyes: 'open' };
      drawPerson(ctx, CLIVE_CARD, pose, 350); ctx.restore();
      if (atPiano) for (let i = 0; i < 4; i++) { const u = ((t - T.piano) * 0.7 + i / 4) % 1; if (u < 0) continue; const x = 420 + Math.sin(u * 6 + i) * 30, y = FLOOR - 340 - u * 200; ctx.save(); ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.ellipse(x, y, 10, 7, -0.4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 9, y); ctx.lineTo(x + 9, y - 36); ctx.lineWidth = 2.4; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
      // Deborah: kapıdan girer, Clive'a doğru yürür
      if (t >= T.wife + 0.2 && t < T.piano - 0.3) { const u = ease.state(seg(t, T.wife + 0.2, T.greet - T.wife)); ctx.save(); ctx.translate(lerp(DOOR.x + DOOR.w / 2, PEOPLE.randy + 120, u), FLOOR); ctx.scale(-1, 1); drawPerson(ctx, DEBORAH_CARD, { walk: u < 1 ? t : null, mouth: 'smile' }, 336); ctx.restore(); }
      ctx.restore();
    }
    // kadran: kesmeden geçen nesne — 24 saat → 30 saniyelik kronometre (aynı yer, aynı boy)
    const m = back ? 0 : ease.state(seg(t, T.whip0, T.whip1 - T.whip0));
    const v = t < T.whip0 ? h % 24 : t < T.mem30 ? lerp(h % 24 * 30 / 24, 0, m) : secAt(t);
    ctx.save(); ctx.translate(CLK.x, CLK.y); drawDial(ctx, CLK.r, m, m < 0.5 ? h % 24 : v, F.mono(30)); ctx.restore();
    ctx.restore();
  }

  // ——— günlük sayfası (l11) ———
  const ENTRIES = [['8.31', 'Şimdi gerçekten, tamamen uyanığım.'], ['9.06', 'Şimdi gerçekten, tamamen uyanığım.'], ['9.34', 'Şimdi gerçekten, tamamen uyanığım.']];
  function notebook(t) {
    const k = plate(t, T.notebook, T.notebookX); if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    const z = 1 + 0.1 * seg(t, T.notebook + 0.75, T.notebookX - T.notebook - 0.75); ctx.translate(500, 1000); ctx.scale(z, z); ctx.translate(-500, -1000);
    // defter: çizgili sayfa, sol kenar boşluğu
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(110, 760, 810, 600); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(110, 760, 810, 600);
    ctx.strokeStyle = 'rgba(139,133,119,0.6)'; ctx.lineWidth = 1.4; for (let y = 830; y < 1350; y += 52) { ctx.beginPath(); ctx.moveTo(110, y); ctx.lineTo(920, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(220, 760); ctx.lineTo(220, 1360); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.stroke();
    // girişler 'şimdi' kelimesinden başlayarak sırayla; yenisi gelince eskisi soluklaşır (hatırlanmaz)
    const a0 = L.l11.t0 + 0.3, step = (T.notebookX - a0) / ENTRIES.length;
    ENTRIES.forEach(([tm, tx], i) => {
      const a = a0 + i * step, u = ease.enter(seg(t, a, 0.5)); if (u <= 0) return;
      const fade = t >= a + step ? 1 - 0.65 * ease.state(seg(t, a + step, 0.5)) : 1;
      const y = 870 + i * 104;
      ctx.save(); ctx.globalAlpha = fade;
      setFont(ctx, F.mono(30)); revealText(ctx, tm, 130, y, 30, u, C.ink);
      setFont(ctx, F.name(34)); revealText(ctx, tx, 236, y, 34, u, C.ink);
      setFont(ctx, F.mono(30)); revealText(ctx, '(1. kez)', 236, y + 44, 30, u, C.graphite);
      ctx.restore();
      // üstü çizilir: yeni giriş gelince eskisi 'hatırlanmaz'
      if (t >= a + step) { setFont(ctx, F.name(34)); const tw = ctx.measureText(tx).width, v = ease.state(seg(t, a + step, 0.35)); ctx.beginPath(); ctx.moveTo(230, y - 12); ctx.lineTo(230 + (tw + 12) * v, y - 12); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    });
    ctx.restore();
    return [236, 870];
  }

  // ——— sarmal: Randy'nin 264,4 saati (11 tur); Clive'ın 30 saniyesi kırmızı çentik ———
  const spiralPt = th => { const r = SP.r0 + (SP.r1 - SP.r0) * th / (SP.turns * 2 * Math.PI); return [SP.x + r * Math.cos(th - Math.PI / 2), SP.y + r * Math.sin(th - Math.PI / 2)]; };
  const TH_END = 2 * Math.PI * SP.turns * (HOURS / 264);
  function spiral(t) {
    if (t < T.cmp0 || t >= T.ask) return null;
    const out = t >= T.ask - 0.2, k = out ? 1 - ease.exit(seg(t, T.ask - 0.2, 0.2)) : ease.state(seg(t, T.cmp0, 0.45));
    if (out) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.restore(); } else { ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k); }
    if (k < 0.9 && !out) return null;
    ctx.save(); ctx.globalAlpha = out ? k : 1; ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // kıyas boyunca sarmalın ucuna doğru yavaş yaklaşma (%12)
    const z = 1 + 0.12 * seg(t, T.cmp0 + 0.6, T.ask - T.cmp0 - 0.6), end = spiralPt(TH_END);
    ctx.translate(end[0], end[1]); ctx.scale(z, z); ctx.translate(-end[0], -end[1]);
    // sarmal: 'on bir gün' cümlesinde çizilir
    const u = 0.4 * ease.state(seg(t, T.cmp0 + 0.15, 0.6)) + 0.6 * ease.state(seg(t, T.cmp0 + 0.75, L.l15.t0 + 1.6 - T.cmp0 - 0.75)), th1 = TH_END * u;
    ctx.beginPath(); for (let th = 0; th <= th1; th += 0.04) { const p = spiralPt(th); th ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.stroke();
    // gün çentikleri: her turun başı
    for (let d = 1; d <= 11; d++) { const th = 2 * Math.PI * d; if (th > th1) break; const p = spiralPt(th), r = Math.hypot(p[0] - SP.x, p[1] - SP.y); ctx.beginPath(); ctx.moveTo(p[0], p[1] - 9); ctx.lineTo(p[0], p[1] + 9); ctx.lineWidth = 2.5; ctx.stroke(); void r; }
    setFont(ctx, F.mono(32)); ctx.textAlign = 'center'; ctx.fillStyle = C.graphite;
    if (u > 0.05) { ctx.fillStyle = C.paper; ctx.fillRect(SP.x - 70, SP.y - 22, 140, 40); ctx.fillStyle = C.graphite; ctx.fillText('1. gün', SP.x, SP.y + 10); }
    if (u > 0.98) { ctx.fillStyle = C.paper; ctx.fillRect(SP.x - 230, end[1] - 70, 190, 40); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText('264 saat', SP.x - 46, end[1] - 40); }
    // sıfırlanmalar (l17): her 30 sn bir çentik; 31.728 çentik sarmalı boydan boya kaplar (sayaçla birlikte ilerler)
    const red = t >= T.hero - 0.02;
    if (t >= T.resets - 0.3) {
      const v = ease.state(seg(t, T.resets - 0.3, L.l17.end - 0.4 - T.resets + 0.3)), thr = TH_END * v;
      ctx.beginPath(); for (let th = 0; th <= thr; th += 0.04) { const p = spiralPt(th); th ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.lineWidth = 13; ctx.strokeStyle = 'rgba(224,57,28,0.38)'; ctx.stroke();
    }
    // Clive'ın 30 saniyesi: aynı ölçekte 30 / 951.840 tur — 2 px'lik çentik ve halka
    if (t >= L.l15.t0 + 1.6) {
      const p = end, ang = TH_END - Math.PI / 2;
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = red ? C.red : C.ink; ctx.fillRect(-1.2, -26, 2.4, 52); ctx.restore();
      ctx.beginPath(); ctx.arc(p[0], p[1], 30, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke();
    }
    ctx.restore();
    return end;
  }
  function magnifier(t, k) {
    if (k <= 0) return;
    const r = MAG.r * ease.enter(k), red = t >= T.hero - 0.02, end = spiralPt(TH_END);
    if (k > 0.6) { ctx.beginPath(); ctx.moveTo(end[0] + 30, end[1] - 8); ctx.lineTo(MAG.x - r * 0.9, MAG.y + r * 0.4); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.arc(MAG.x, MAG.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(MAG.x, MAG.y); ctx.scale(r / MAG.r, r / MAG.r);
    // 30 saniyelik kadran dilimi (kronometre), dorukta kırmızı
    ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    const sw = red ? secAt(t + 30 - T.hero) / 30 : 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sw); ctx.closePath(); ctx.fillStyle = red ? 'rgba(224,57,28,0.85)' : 'rgba(28,27,24,0.25)'; ctx.fill();
    setFont(ctx, F.mono(30)); ctx.fillStyle = red ? C.red : C.ink; ctx.textAlign = 'center'; ctx.fillText('30 sn', 0, 10);
    ctx.restore();
    ctx.beginPath(); ctx.arc(MAG.x, MAG.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke();
  }

  // ——— büyüteç ———
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'randy' || kind === 'sleep') {
      // yakın plan yüz: iri gözler, göz altı gölgesi; uyurken kapalı
      const sleep = kind === 'sleep';
      ctx.save(); ctx.translate(-8, 726); drawPerson(ctx, RANDY_CARD, { eyes: sleep ? 'closed' : t >= T.cranky ? 'wide' : 'open', lean: sleep ? -0.02 : Math.sin(t * 1.1) * 0.006 }, 820); ctx.restore();
      if (!sleep && t >= T.cranky) { ctx.strokeStyle = 'rgba(28,27,24,0.6)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(30, 22, 14 + i * 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); } }
      if (sleep) { setFont(ctx, F.name(44)); ctx.fillStyle = C.graphite; for (let i = 0; i < 3; i++) { const u = ((t - T.rec) * 1.2 + i / 3) % 1; ctx.globalAlpha = 1 - u; ctx.fillText('z', 50 + u * 40, -70 - u * 50); } ctx.globalAlpha = 1; }
    } else if (kind === 'log') {
      // arkadaşların defteri: saat saat kayıt
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-100, -110, 200, 220); ctx.lineWidth = 3; ctx.strokeRect(-100, -110, 200, 220);
      setFont(ctx, F.mono(22)); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      const h0 = Math.floor(hoursAt(t)); for (let i = 0; i < 6; i++) { const hh = h0 - 5 + i; if (hh < 0) continue; ctx.fillText(`${String(hh % 24).padStart(2, '0')}.00  uyanık`, -84, -76 + i * 34); }
    } else if (kind === 'count') {
      // 100'den yedişer geri sayma: 65'te durur
      const seq = [100, 93, 86, 79, 72, 65], n = Math.min(seq.length, 1 + Math.floor(seg(t, T.count0, T.stop65 - T.count0 + 0.2) * seq.length));
      setFont(ctx, F.head(38)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
      for (let i = 0; i < n; i++) ctx.fillText(String(seq[i]), -72 + (i % 3) * 72, -40 + Math.floor(i / 3) * 56);
      if (t >= T.forgot - 0.1) { setFont(ctx, F.head(70)); ctx.fillText('?', 0, 96); }
    } else if (kind === 'clive' || kind === 'conduct') {
      ctx.save(); ctx.translate(-10, kind === 'clive' ? 726 : 140); drawPerson(ctx, CLIVE_CARD, kind === 'clive' ? { eyes: 'open', lean: Math.sin(t * 0.9) * 0.006 } : { arms: 'conduct', phase: t }, kind === 'clive' ? 820 : 260); ctx.restore();
    } else if (kind === 'brain') {
      // baş profili; hafıza bölgesi (hipokamp) taralı, 'yok' kelimesinde silinir ve kesik çizgi kalır
      ctx.beginPath(); ctx.ellipse(-6, -10, 86, 70, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-50 + i * 20, -40 + (i % 2) * 18, 18, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 2; ctx.stroke(); }
      const er = t >= T.erase ? ease.state(seg(t, T.erase, 0.8)) : 0;
      const g = 0.25 + 0.75 * ease.enter(seg(t, T.virus, T.erase - T.virus)); ctx.save(); ctx.beginPath(); ctx.ellipse(10, 22, 30 * g, 15 * g, -0.3, 0, Math.PI * 2); ctx.clip(); ctx.globalAlpha = 1 - er; ctx.lineWidth = 1.6; for (let d = -60; d < 60; d += 5) { ctx.beginPath(); ctx.moveTo(d - 20, -10); ctx.lineTo(d + 20, 50); ctx.stroke(); } ctx.restore();
      ctx.beginPath(); ctx.ellipse(10, 22, 30, 15, -0.3, 0, Math.PI * 2); ctx.setLineDash(er > 0 ? [5, 5] : []); ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]);
      setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('HAFIZA', 10, 80);
    } else if (kind === 'watch') {
      ctx.save(); drawDial(ctx, 96, 1, secAt(t), F.mono(22)); ctx.restore();
    } else if (kind === 'pen') {
      // kalem ve yazılan cümle (yakın plan)
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-130, -130, 260, 260);
      ctx.strokeStyle = 'rgba(139,133,119,0.6)'; ctx.lineWidth = 1.2; for (let y = -90; y < 130; y += 40) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
      const u = ((t - L.l11.t0) * 0.45) % 1; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (let row = 0; row < 2; row++) { const w = clamp01(u * 2 - row) * 190; ctx.beginPath(); for (let x = 0; x <= w; x += 4) { const y = -30 + row * 40 + Math.sin(x * 0.35) * 5; x ? ctx.lineTo(-96 + x, y) : ctx.moveTo(-96, y); } ctx.stroke(); }
      const px = -96 + 200 * clamp01(u * 1.5), py = u < 0.33 ? -30 : 10; ctx.save(); ctx.translate(px, py); ctx.rotate(-0.7); ctx.fillStyle = C.paper; ctx.fillRect(-6, -90, 12, 90); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(-6, -90, 12, 90); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(0, 14); ctx.lineTo(6, 0); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore();
    } else if (kind === 'greet') {
      // karısını görür: kollar havada, yüz yakın plan
      ctx.save(); ctx.translate(-30, 210); drawPerson(ctx, CLIVE_CARD, { arms: 'up', phase: t, eyes: 'wide', mouth: 'open' }, 300); ctx.restore();
      ctx.save(); ctx.translate(70, 220); ctx.scale(-1, 1); drawPerson(ctx, DEBORAH_CARD, { mouth: 'smile' }, 290); ctx.restore();
    } else if (kind === 'keys') {
      // piyano tuşları ve eller
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-130, 0, 260, 100); for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 22, 0); ctx.lineTo(i * 22, 100); ctx.lineWidth = 2; ctx.stroke(); if (i % 7 !== 2 && i % 7 !== -5) { ctx.fillStyle = C.ink; ctx.fillRect(i * 22 + 14, 0, 14, 58); } }
      for (let f = 0; f < 8; f++) { const x = -84 + f * 24, y = -6 - Math.abs(Math.sin(t * 7 + f * 1.3)) * 14; ctx.beginPath(); ctx.moveTo(x, y - 70); ctx.lineTo(x, y); ctx.lineWidth = 12; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = C.paper; ctx.stroke(); }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  // büyüteç programı: [başlangıç, tür]; geçişte eski balon tam kapanır, yenisi açılır
  const S1 = [[0, 'clive'], [L.l02.t0, 'randy'], [T.friends, 'log'], [T.cranky, 'randy'], [T.count0, 'count'], [T.final, 'randy'], [T.rec + 1.0, 'sleep'], [T.whip0 + 0.2, null],
    [T.adam - 0.1, 'clive'], [T.clive + 0.4, 'conduct'], [T.virus, 'brain'], [L.l11.t0, 'pen'], [T.wife + 0.3, null], [T.greet - 0.2, 'greet'], [T.piano, 'keys'], [T.cmp0, null], [T.ask, 'clive']];
  function sched(t, S) {
    let i = -1; for (let k = 0; k < S.length; k++) if (t >= S[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S[i], prev = i > 0 ? S[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: i === 0 ? 1 : ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(60); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.halluc, 'sasirma', 'saskin'], [T.halluc + 1.4, 'ayakta', 'dusunceli'], [T.stop65, 'sasirma', 'saskin'], [T.rec, 'sasirma', 'saskin'], [T.rec + 1.6, 'ayakta', 'notr'], [T.virus, 'ayakta', 'dusunceli'],
    [T.erase, 'sasirma', 'saskin'], [T.erase + 1.6, 'ayakta', 'dusunceli'], [T.piano + 0.6, 'ayakta', 'mutlu'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.rec + 0.2, T.rec + 1.7, '11 gün mü?!', 230]];
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
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = Math.min(SIFIR.x - 20, 900) - w, y = SIFIR.y - dy;
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
    // bölünmüş cümle (l15 + l16): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l16' ? L.l15.text + ' ' + ln.text : ln.id === 'l15' ? 'Randy 11 gün boyunca hiç uyumadı. Ya Clive?' : ln.text;
    const p = ln.id === 'l16' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42)); revealText(ctx, '11 gün hiç uyumayan genç mi,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, 'hafızası 30 saniye süren adam mı?', SAFE.x0, 690, 42, k, C.ink);
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
    if (t < L.l07.t0 - 0.06) {
      const h = hoursAt(t), done = t >= T.rec;
      const st = t >= T.final ? 'REKOR' : t >= T.count0 ? "100'DEN GERİYE 7'ŞER" : t >= T.cranky ? 'HUYSUZ · UNUTKAN' : t >= T.friends ? 'İKİ ARKADAŞ İZLİYOR' : t >= T.fair ? 'BİLİM FUARI · SAN DIEGO' : 'SAN DIEGO, ABD';
      row({ label: 'RANDY GARDNER · 17 YAŞINDA', num: done ? '11 gün' : dayOf(h) + '. gün', unit: done ? '25 dk' : '', right1: 'UYANIK: ' + nf0.format(Math.floor(h)) + ' saat', right2: st, p: Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) });
      return;
    }
    if (t < T.cmp0) {
      const s = t >= T.mem30 ? Math.floor(secAt(t)) : null;
      const st = t >= T.piano ? 'PİYANODA' : t >= T.wife ? 'KARISI DEBORAH' : t >= T.diary ? 'GÜNLÜĞÜ' : t >= T.mem30 ? 'SONRA SIFIRLANIR' : t >= T.virus ? 'VİRÜS · BEYİN' : 'MÜZİSYEN · ŞEF';
      row({ label: 'CLIVE WEARING · İNGİLTERE', num: s != null ? String(s) : t >= T.virus ? '1985' : 'ŞEF', unit: s != null ? 'saniye' : '', right1: t >= T.mem30 ? 'HAFIZA: EN FAZLA 30 sn' : t >= T.virus ? 'HAFIZA MERKEZİ' : '', right2: st, p: Math.max(0.35, ease.enter(seg(t, L.l07.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) { row({ label: 'AYNI SAATTE · RANDY', num: nf0.format(Math.floor(HOURS * (0.4 * ease.state(seg(t, T.cmp0 + 0.15, 0.6)) + 0.6 * ease.state(seg(t, T.cmp0 + 0.75, L.l15.t0 + 1.6 - T.cmp0 - 0.75))))), unit: 'saat', right1: t >= L.l15.t0 + 1.6 ? 'CLIVE: ?' : '', right2: '11 TUR', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.resets - 0.3) { row({ label: "CLIVE'IN HAFIZASI", num: '30', unit: 'saniye', red: true, right1: 'RANDY: 264 saat', right2: '' }); return; }
    if (t < T.ask) { const n = Math.round(Fx.resets * ease.state(seg(t, T.resets - 0.3, L.l17.end - 0.4 - T.resets + 0.3))); row({ label: 'SIFIRLANMA SAYISI', num: nf0.format(n), unit: 'kez', red: true, right1: '≈ 32 BİN KEZ', right2: 'HER 30 SANİYEDE BİR' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Randy mi, Clive mı?', SAFE.x0, 672, 80, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    room(t);
    const nb = notebook(t);
    const sp = spiral(t);
    let at = nb ? null : sp;
    if (!at && t >= T.mem30 && t < T.quote) at = [CLK.x - CLK.r, CLK.y];
    // büyüteç
    const r1 = sched(t, S1);
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, ROUND, r1.k, t >= L.l02.t0 && t < T.ask ? at : null);
    if (t >= L.l15.t0 + 1.6 && t < T.ask) magnifier(t, ease.enter(seg(t, L.l15.t0 + 1.8, 0.45)) * (1 - ease.exit(seg(t, T.ask - 0.45, 0.4))));
    // kare 0 ve soru: iki balon
    if (t < L.l02.t0 || t >= T.loop0 + 0.3) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.loop0 + 0.3, 0.4));
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kk; ctx.fillRect(ROUND.x - 100, 1084, 200, 42); ctx.fillRect(PEOPLE.randy - 50, 980, 140, 42); ctx.globalAlpha = 1;
      revealText(ctx, '30 SANİYE', ROUND.x, 1116, 34, kk, C.ink, 'center'); revealText(ctx, '11 GÜN', PEOPLE.randy + 20, 1012, 34, kk, C.ink, 'center');
    }
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.6)) : 1;
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(PEOPLE.randy - 50, 980, 140, 42); ctx.fillRect(ROUND.x - 70, 1084, 140, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'RANDY', PEOPLE.randy + 20, 1012, 34, kin * kout, C.ink, 'center'); revealText(ctx, 'CLIVE', ROUND.x, 1116, 34, kin * kout, C.ink, 'center');
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

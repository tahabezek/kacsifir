// "Doz" şablonu (Hangisi daha şaşırtıcı?): kafasından proton ışını geçen fizikçi Anatoli Bugorski (1978) ve üç kez
// asılıp ölmeyen Joseph Samuel (1803). A: yandan laboratuvar; ışın borusu, açık (arızalı) kesim, eğilen figür, ışın
// çizgisi ve gravür ışık demeti; büyüteçte U-70 halkası, yüz şeması (sol yarı felç), diploma. B: uzak plan Parramatta;
// darağacı, araba, kalabalık; üç deneme doğrudan "ip koptu / ilmik kaydı" karesine kesilir (asılı beden hiç yok).
// Doruk: kâğıt pano; solda üç kopuk ip ve "3", sağda log ölçekli doz sütunu: 5 Gy (tüm vücut öldürücü) → 2.000 Gy
// (yerel, baş); "400 KAT" dorukta kırmızı. Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonu.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { BUGORSKI_CARD, SAMUEL_CARD, OFFICER_CARD, drawPerson, drawPipe, drawMagnet, drawRing, drawLamp, drawFaceDiagram, headProfile, drawGallows, drawCart, drawRope, drawDecree, drawDiploma, drawCrowd } from '../doz_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705, FLOOR = 1392;
const SIFIR = { x: 872, y: 1412, H: 92 };
const ROUND = { x: 772, y: 905, r: 118 };
// laboratuvar
const PIPE = { y: 1118, r: 16, gap: [452, 640] }, BUG = { x: 372, size: 330 };
// Parramatta
const GAL = { x: 196, size: 400, span: 1.0 }, ROPE_X = 396, CART = { size: 250, x: 271 }, MAN = { size: 225 };
const CART_TOP = FLOOR - 0.42 * CART.size;
// doruk panosu
const BAR = { x: 600, w: 90, y0: 1300, y1: 830 }, LOGMIN = 0, LOGMAX = 4; // 1 Gy … 10.000 Gy

export function dozTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    lab: L.l02.t0, check: Wd('l02', 'arızayı'), safety: L.l03.t0, still: Wd('l03', 'çalışıyor'),
    bend: L.l04.t0, beam: Wd('l04', 'proton'), through: Wd('l04', 'geçiyor'), flash: Wd('l05', 'parlak'), nopain: Wd('l05', 'acı'),
    doctors: L.l06.t0, palsy: Wd('l06', 'felç'), lives: L.l07.t0, phd: Wd('l07', 'doktorasını'), phys: Wd('l07', 'fizikçi'),
    whip0: L.l07.end + 0.3, whip1: L.l08.t0 + 0.55, adam: Wd('l08', 'adam'),
    idam: Wd('l09', 'idama'), a1: L.l10.t0, e1: Wd('l10', 'kopuyor'), a2: L.l11.t0, e2: Wd('l11', 'kayıyor'), fall2: Wd('l11', 'düşüyor'),
    a3: L.l12.t0, e3: Wd('l12', 'kopuyor'), gov: L.l13.t0, sign: Wd('l13', 'işaret'), life: Wd('l13', 'kaldırıyor'),
    cmp0: L.l14.t0 - 0.1, three: Wd('l15', 'üç'), q: L.l16.t0, lethal: Wd('l16', 'öldürücü'), kac: Wd('l16', 'kaç'),
    hero: L.l17.t0 - 0.04, four: Wd('l17', 'dört'), ask: L.l18.t0, loop0: tl.loop0,
  };
  return T;
}

export async function makeDozRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = dozTimes(tl);
  // döngü dikişi: sürekli döngülerin hızı film süresine tam bölünür (son kare = kare 0)
  const rq = r => Math.round(r * D) / D;
  const rnd = mulberry32(59);
  const crowdA = Array.from({ length: 22 }, (_, i) => [i * 52 + rnd() * 10, rnd() * 6.28]);
  const crowdB = Array.from({ length: 21 }, (_, i) => [26 + i * 52 + rnd() * 10, rnd() * 6.28]);

  // sahne seçimi: 0 lab, 1 Parramatta (A → B sola kayar); pano cmp0 → ask; soruda lab (kare 0 hâli)
  const toB = t => t >= T.cmp0 + 0.5 ? 0 : t < T.whip0 ? 0 : ease.state(seg(t, T.whip0, T.whip1 - T.whip0));

  // ——— laboratuvar ———
  function lab(t, dx) {
    ctx.save(); ctx.beginPath(); ctx.rect(dx, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    const back = t >= T.cmp0, tA = back ? 0 : t;
    // A boyunca yavaş yaklaşma (%7); soruda %95'ten kare 0'daki %100'e
    const z = back ? 1 - 0.05 * (1 - seg(t, T.ask, D - T.ask)) : 1 + 0.06 * ease.enter(seg(t, 0, 1.2)) + 0.06 * seg(t, 1.2, T.whip0 - 1.2);
    ctx.translate(500, 1150); ctx.scale(z, z); ctx.translate(-500, -1150);
    // ışın monitörü: duvarda kayan dalga (sürekli döngü)
    { const mx = 40, my = 840, mw = 250, mh = 130; ctx.fillStyle = '#F4EEE1'; ctx.fillRect(mx, my, mw, mh); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(mx, my, mw, mh);
      ctx.save(); ctx.beginPath(); ctx.rect(mx + 6, my + 6, mw - 12, mh - 12); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.2)'; ctx.lineWidth = 1; for (let gx = mx + 30; gx < mx + mw; gx += 30) { ctx.beginPath(); ctx.moveTo(gx, my); ctx.lineTo(gx, my + mh); ctx.stroke(); }
      const ph = t * rq(0.7) * Math.PI * 2; ctx.beginPath(); for (let gx = 0; gx <= mw - 12; gx += 3) { const y = my + mh / 2 + Math.sin(gx * 0.09 - ph * 3) * 26 * (0.6 + 0.4 * Math.sin(gx * 0.023 + ph)); gx ? ctx.lineTo(mx + 6 + gx, y) : ctx.moveTo(mx + 6, y); } ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
    // duvar panelleri ve kablo kanalı
    ctx.strokeStyle = 'rgba(28,27,24,0.16)'; ctx.lineWidth = 1.5;
    for (let x = -120; x < W + 120; x += 150) { ctx.beginPath(); ctx.moveTo(x, STAGE_TOP + 40); ctx.lineTo(x, FLOOR - 40); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-120, 790); ctx.lineTo(W + 120, 790); ctx.moveTo(-120, 806); ctx.lineTo(W + 120, 806); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(28,27,24,0.3)'; ctx.stroke();
    // zemin
    ctx.beginPath(); ctx.moveTo(-120, FLOOR); ctx.lineTo(W + 120, FLOOR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(-120, FLOOR, W + 240, 140); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.22)'; ctx.lineWidth = 1.2; for (let x = -200; x < W + 200; x += 14) { ctx.beginPath(); ctx.moveTo(x, FLOOR + 140); ctx.lineTo(x + 140, FLOOR); ctx.stroke(); } ctx.restore();
    // boru, mıknatıslar, ayaklar
    for (const x of [140, 930]) { ctx.beginPath(); ctx.moveTo(x - 50, PIPE.y + 100); ctx.lineTo(x - 50, FLOOR); ctx.moveTo(x + 50, PIPE.y + 100); ctx.lineTo(x + 50, FLOOR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    drawPipe(ctx, -140, W + 140, PIPE.y, PIPE.r, PIPE.gap);
    drawMagnet(ctx, 140, PIPE.y, 190, 200); drawMagnet(ctx, 930, PIPE.y, 190, 200);
    // ışın atımları: boru içinde sağa akan kısa çizgiler (sürekli döngü); açık kesimde görünmez (protonlar görünmez)
    const sp = rq(0.8);
    ctx.save(); ctx.beginPath(); ctx.rect(-140, PIPE.y - 6, PIPE.gap[0] + 140, 12); ctx.rect(PIPE.gap[1], PIPE.y - 6, W + 280, 12); ctx.clip();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 7; for (let k = 0; k < 16; k++) { const x = -140 + (((t * sp + k / 16) % 1) * (W + 280)); ctx.beginPath(); ctx.moveTo(x, PIPE.y); ctx.lineTo(x + 40, PIPE.y); ctx.stroke(); }
    ctx.restore();
    // uyarı lambası: l03'ten sonra çatlak ve sönük
    ctx.save(); ctx.translate(250, FLOOR); drawLamp(ctx, 250, tA >= T.safety); ctx.restore();
    // masa (l07): sahnenin sağında belirir
    const desk = !back && t >= T.lives ? ease.enter(seg(t, T.lives, 0.4)) : 0;
    if (desk > 0) { ctx.save(); ctx.globalAlpha = desk; ctx.fillStyle = '#F4EEE1'; ctx.fillRect(560, FLOOR - 150, 240, 14); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(560, FLOOR - 150, 240, 14); ctx.beginPath(); ctx.moveTo(580, FLOOR - 136); ctx.lineTo(580, FLOOR); ctx.moveTo(780, FLOOR - 136); ctx.lineTo(780, FLOOR); ctx.stroke(); ctx.restore(); }
    // Bugorski: kare 0'da panoyla bekler; l02 yürür ve kontrol eder; l04 eğilir; l05 elleri yüzde; l06 durur; l07 masada
    let x = BUG.x, pose = { arms: 'clip' };
    if (tA >= T.lab && tA < T.bend) pose = { arms: 'clip', neck: 14 * ease.state(seg(tA, T.check - 0.3, 0.5)), lean: 6 * ease.state(seg(tA, T.check - 0.3, 0.5)) };
    else if (tA >= T.bend && tA < T.flash) pose = { arms: 'clip', lean: 26 * ease.state(seg(tA, T.bend, 0.5)), neck: 22 * ease.state(seg(tA, T.bend + 0.2, 0.4)) };
    else if (tA >= T.flash && tA < T.doctors) pose = { arms: 'face', lean: 26 * (1 - ease.state(seg(tA, T.flash, 0.5))), neck: 10, mouth: 'open' };
    else if (tA >= T.doctors && tA < T.lives) pose = { arms: 'down', neck: 6 };
    else if (tA >= T.lives && tA < T.cmp0) { x = 650; pose = { sit: true, arms: 'write', phase: t }; }
    if (x !== 650) { ctx.save(); ctx.translate(x, FLOOR); drawPerson(ctx, BUGORSKI_CARD, pose, BUG.size); ctx.restore(); }
    else { ctx.save(); ctx.translate(560, FLOOR); ctx.fillStyle = '#F4EEE1'; ctx.fillRect(0, -110, 60, 10); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(0, -110, 60, 10); ctx.beginPath(); ctx.moveTo(8, -100); ctx.lineTo(8, 0); ctx.moveTo(52, -100); ctx.lineTo(52, 0); ctx.stroke(); ctx.restore(); ctx.save(); ctx.translate(600, FLOOR); drawPerson(ctx, BUGORSKI_CARD, pose, BUG.size); ctx.restore(); }
    // ışın: eğilmiş başın içinden geçen ince çizgi (l04 "proton" → l05 sonu)
    if (!back && t >= T.beam && t < T.doctors) {
      const u = ease.enter(seg(t, T.beam, 0.25)), out = 1 - seg(t, T.doctors - 0.3, 0.3);
      ctx.save(); ctx.globalAlpha = out; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([18, 8]); ctx.lineDashOffset = -t * 160;
      ctx.beginPath(); ctx.moveTo(PIPE.gap[0], PIPE.y); ctx.lineTo(lerp(PIPE.gap[0], PIPE.gap[1], u), PIPE.y); ctx.stroke(); ctx.restore();
    }
    // "bin güneşten parlak": gravür ışık demeti (çizgi ışınları), kısa ve sönen
    if (!back && t >= T.flash - 0.05 && t < T.flash + 1.4) {
      const u = seg(t, T.flash - 0.05, 0.25), dec = 1 - ease.exit(seg(t, T.flash + 0.5, 0.9));
      ctx.save(); ctx.translate(PIPE.gap[0] + 40, PIPE.y); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.globalAlpha = dec;
      for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r0 = 70, r1 = r0 + (90 + (i % 3) * 40) * ease.enter(u); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  }

  // ——— Parramatta, 1803 ———
  // her deneme: line başında figür arabada, ilmik boynunda; olay kelimesinde doğrudan kesme: figür yerde diz çökmüş,
  // ip kopuk ya da boş ilmik sallanır, araba sağa çekilir. Asılı beden hiçbir karede yok.
  const attempts = () => [[T.a1, T.e1, 'snapped'], [T.a2, T.e2, 'slipped'], [T.a3, T.e3, 'snapped']];
  function attemptState(t) {
    let st = { k: 0, phase: 'ready', ev: null, kind: 'noose' };
    for (const [a, e, kind] of attempts()) { if (t >= a) st = { k: st.k + 1, phase: t >= e ? 'after' : 'ready', ev: e, kind: t >= e ? kind : 'noose' }; }
    if (t >= T.gov) st.phase = 'after';
    return st;
  }
  function parra(t, dx) {
    ctx.save(); ctx.beginPath(); ctx.rect(dx, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    const z = 1 + 0.12 * seg(t, T.whip1, T.cmp0 - T.whip1); ctx.translate(420, 1200); ctx.scale(z, z); ctx.translate(-420, -1200);
    { let bz = 0; for (const e of [T.e1, T.e2, T.e3]) bz = Math.max(bz, ease.state(seg(t, e, 0.4)) * (1 - ease.state(seg(t, e + 0.95, 0.6)))); const zb = 1 + 0.25 * bz, by = FLOOR - 0.99 * GAL.size + 40; ctx.translate(ROPE_X, by); ctx.scale(zb, zb); ctx.translate(-ROPE_X, -by); }
    // "Yoksa bu adam mı?": Samuel'e 1,6x yaklaş (600 ms), idam cümlesinde genişe dön
    { const zs = ease.state(seg(t, T.adam - 0.25, 0.6)) * (1 - ease.state(seg(t, T.idam + 0.6, 0.8))), zz = 1 + 0.6 * zs, sx = ROPE_X - 150, sy = FLOOR - 200; ctx.translate(sx, sy); ctx.scale(zz, zz); ctx.translate(-sx, -sy); }
    // sürüklenen bulutlar (taralı, sürekli döngü)
    for (let c = 0; c < 3; c++) { const u = (t * rq(0.035) + c / 3) % 1, cx = lerp(W + 260, -260, u), cy = 800 + c * 46, cw = 200 + c * 40;
      const P = () => { ctx.beginPath(); ctx.ellipse(cx, cy, cw / 2, 26, 0, 0, Math.PI * 2); ctx.ellipse(cx - cw * 0.22, cy - 18, cw * 0.22, 24, 0, 0, Math.PI * 2); ctx.ellipse(cx + cw * 0.18, cy - 14, cw * 0.2, 22, 0, 0, Math.PI * 2); };
      P(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.save(); P(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 1.4; for (let y = cy - 50; y < cy + 30; y += 6) { ctx.beginPath(); ctx.moveTo(cx - cw, y); ctx.lineTo(cx + cw, y); ctx.stroke(); } ctx.restore(); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; P(); ctx.stroke(); }
    // ufuk, tepeler, okaliptüs silueti
    ctx.fillStyle = '#F4EEE1'; ctx.beginPath(); ctx.moveTo(-120, 1010); ctx.quadraticCurveTo(200, 930, 460, 990); ctx.quadraticCurveTo(760, 1040, W + 120, 960); ctx.lineTo(W + 120, 1060); ctx.lineTo(-120, 1060); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.18)'; ctx.lineWidth = 1; for (let y = 930; y < 1060; y += 7) { ctx.beginPath(); ctx.moveTo(-120, y); ctx.lineTo(W + 120, y); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(-120, 1010); ctx.quadraticCurveTo(200, 930, 460, 990); ctx.quadraticCurveTo(760, 1040, W + 120, 960); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
    for (const [tx, th] of [[760, 150], [830, 110]]) { ctx.beginPath(); ctx.moveTo(tx, 1040); ctx.lineTo(tx, 1040 - th); ctx.lineWidth = 3; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.beginPath(); ctx.ellipse(tx, 1040 - th, th * 0.32, th * 0.22, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); }
    // kalabalık: iki sıra (denemeler sırasında daha hareketli)
    const st = attemptState(t), busy = st.k > 0 && t < T.gov + 1.2;
    for (let b = 0; b < 4; b++) { const u = (t * rq(0.06) + b * 0.27) % 1, bx = lerp(W + 80, -80, u), by = 820 + b * 34 + Math.sin(u * 12 + b) * 10, fl = Math.sin(t * 9 + b * 2) * 7; ctx.beginPath(); ctx.moveTo(bx - 14, by - fl); ctx.quadraticCurveTo(bx - 6, by - 6, bx, by); ctx.quadraticCurveTo(bx + 6, by - 6, bx + 14, by - fl); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    drawCrowd(ctx, -60, W + 60, 1110, 56, crowdA, t, false);
    drawCrowd(ctx, -60, W + 60, 1168, 64, crowdB, t + 0.7, false);
    // zemin
    ctx.fillStyle = C.paper; ctx.fillRect(-120, 1180, W + 240, FLOOR - 1180);
    ctx.strokeStyle = 'rgba(139,133,119,0.45)'; ctx.lineWidth = 1.1; for (let y = 1188, g = 6; y < FLOOR; y += g, g = Math.min(14, g + 0.6)) { ctx.beginPath(); ctx.moveTo(-120, y); ctx.lineTo(W + 120, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-120, FLOOR); ctx.lineTo(W + 120, FLOOR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // darağacı
    ctx.save(); ctx.translate(GAL.x, FLOOR); drawGallows(ctx, GAL.size, GAL.span); ctx.restore();
    const beamY = FLOOR - 0.99 * GAL.size;
    // araba: sapı solda; olaydan sonra sola çekilir (1,2 sn), Sıfır'ın önünden geçmez; yeni deneme başında yine ip altında
    const cartOut = st.phase === 'after' && st.ev != null ? ease.state(seg(t, st.ev, 1.2)) : 0;
    const cx = CART.x - 700 * cartOut, spin = (cartOut * 700) / (0.17 * CART.size);
    ctx.save(); ctx.translate(cx + CART.size, FLOOR); ctx.scale(-1, 1); drawCart(ctx, CART.size, spin); ctx.restore();
    // ip ve figür
    const ropeLen = 100;
    const sway = st.phase === 'after' && st.ev != null ? 0.32 * Math.exp(-(t - st.ev) * 1.4) * Math.sin((t - st.ev) * 6.2) : 0;
    if (st.k === 0) {
      // hüküm satırı: arabanın yanında ayakta, eller bağlı; ilmik boş
      ctx.save(); ctx.translate(ROPE_X - 150, FLOOR); drawPerson(ctx, SAMUEL_CARD, { arms: 'bound', neck: 8 }, MAN.size * 1.3); ctx.restore();
      if (t >= T.adam - 0.1) chip('JOSEPH SAMUEL', ROPE_X - 150, FLOOR - MAN.size * 1.3 - 24, ease.enter(seg(t, T.adam - 0.1, 0.3)), 'center');
      drawRope(ctx, ROPE_X, beamY, ropeLen - 8, 'noose', 0.05 * Math.sin(t * rq(0.8) * 6.283), 3);
    } else if (st.phase === 'ready') {
      // arabada ayakta, eller bağlı; ilmik başının çevresinde (asılı değil)
      ctx.save(); ctx.translate(ROPE_X - 4, CART_TOP); drawPerson(ctx, SAMUEL_CARD, { arms: 'bound', neck: 4 }, MAN.size); ctx.restore();
      drawRope(ctx, ROPE_X, beamY, ropeLen - 8, 'noose', 0, 3);
    } else {
      drawRope(ctx, ROPE_X, beamY, ropeLen - 8, t >= T.gov ? 'slipped' : st.kind, sway, 3);
      const gov = t >= T.gov, up = gov ? ease.state(seg(t, T.life, 0.5)) : 0;
      ctx.save(); ctx.translate(ROPE_X + 10, FLOOR); drawPerson(ctx, SAMUEL_CARD, up > 0.5 ? { arms: 'down', neck: 6 } : { kneel: true, arms: 'bound', neck: 16 }, MAN.size); ctx.restore();
    }
    // görevli (l13): sağdan girer, karar kâğıdıyla
    if (t >= T.gov) {
      const u = ease.enter(seg(t, T.gov, 0.9));
      ctx.save(); ctx.translate(lerp(1020, 640, u), FLOOR); ctx.scale(-1, 1); drawPerson(ctx, OFFICER_CARD, u < 1 ? { walk: t } : { arms: 'clip' }, 240); ctx.restore();
    }
    ctx.restore();
  }

  // ——— doruk panosu ———
  const ly = v => lerp(BAR.y0, BAR.y1, (Math.log10(v) - LOGMIN) / (LOGMAX - LOGMIN));
  function board(t) {
    if (t < T.cmp0 || t >= T.ask) return;
    const out = t >= T.ask - 0.35, k = out ? 1 - ease.exit(seg(t, T.ask - 0.35, 0.35)) : ease.state(seg(t, T.cmp0, 0.45));
    // giriş: perde yukarıdan iner; çıkış: perde yukarı toplanır (saydamlık yok)
    const hh = (1920 - STAGE_TOP) * k, y0 = out ? 1920 - hh : STAGE_TOP;
    ctx.fillStyle = C.paper; ctx.fillRect(0, y0, W, hh);
    ctx.beginPath(); ctx.moveTo(0, out ? y0 : y0 + hh); ctx.lineTo(W, out ? y0 : y0 + hh); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, hh); ctx.clip();
    // pano boyunca yavaş yaklaşma 0,925 → 1,0 (göreli 1,08; 1,0'da bütün yazılar güvenli alanda), zemin ızgarası sürekli kayar
    const z = 0.925 + 0.075 * ease.state(seg(t, T.cmp0 + 0.45, T.ask - T.cmp0 - 0.8)); ctx.translate(500, 1080); ctx.scale(z, z); ctx.translate(-500, -1080);
    // milimetrik kâğıt (log grafiğin zemini): ince ızgara, her 5 çizgide bir koyu
    { const ga = ease.enter(seg(t, T.cmp0 + 0.2, 0.5)); ctx.save(); ctx.globalAlpha *= ga; const gd = ((t - T.cmp0) * 22) % 130; for (let i = -6; i <= 54; i++) { const x = i * 26 - gd, y = STAGE_TOP - 80 + i * 26 - gd; ctx.strokeStyle = i % 5 ? 'rgba(28,27,24,0.07)' : 'rgba(28,27,24,0.14)'; ctx.lineWidth = i % 5 ? 1 : 1.6; ctx.beginPath(); ctx.moveTo(x, STAGE_TOP - 100); ctx.lineTo(x, 1920); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(W + 100, y); ctx.stroke(); } ctx.restore(); }
    const la = ease.enter(seg(t, T.cmp0 + 0.15, 0.4));
        setFont(ctx, F.mono(40)); revealText(ctx, 'SAMUEL', 110, 780, 40, la, C.ink); revealText(ctx, 'BUGORSKI', 500, 780, 40, la, C.ink);
    // doruk anahtarı: "dört" kelimesi; Samuel tarafı 400 ms'de küçülüp grileşir, yer "400 KAT"a açılır
    const T4 = T.four - 0.04, hk = ease.state(seg(t, T.four - 0.26, 0.2));
    // sol: kiriş (pano açılınca çizilir), üç kopuk ip ("üç"te art arda), büyük 3
    ctx.save(); ctx.globalAlpha *= 1 - 0.7 * hk; ctx.translate(0, -60 * hk); ctx.translate(100, 870); ctx.scale(1 - 0.3 * hk, 1 - 0.3 * hk); ctx.translate(-100, -870);
    { const g = ease.state(seg(t, T.cmp0 + 0.4, 1.6)); if (g > 0) { ctx.beginPath(); ctx.moveTo(100, 870); ctx.lineTo(lerp(100, 420, g), 870); ctx.lineWidth = 7; ctx.strokeStyle = hk > 0.5 ? C.graphite : C.ink; ctx.stroke(); } }
    for (let i = 0; i < 3; i++) {
      const a = ease.enter(seg(t, T.three + i * 0.12, 0.3)); if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha *= a; const x = 150 + i * 110;
      drawRope(ctx, x, 870, 150, i === 1 ? 'slipped' : 'snapped', 0.09 * Math.sin(t * rq(1.3) * 6.283 + i * 1.7), 4);
      ctx.globalAlpha *= 1 - hk; setFont(ctx, F.mono(36)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), x, 1080); ctx.restore();
    }
    ctx.restore();
    if (t >= T.three) {
      const u = ease.enter(seg(t, T.three, 0.35)), fs3 = lerp(220, 110, hk), x3 = lerp(225, 200, hk), b3 = lerp(1270, 1290, hk), col = hk > 0.5 ? C.graphite : C.ink;
      setFont(ctx, F.head(fs3)); revealText(ctx, '3', x3, b3, fs3, u, col, 'center');
      setFont(ctx, F.mono(36)); revealText(ctx, 'KEZ ASILDI', x3, b3 + lerp(46, 40, hk), 36, u, col, 'center');
    }
    // dorukta: kırmızı sütunun yanında büyük "400 KAT"
    if (t >= T4) {
      const u = ease.enter(seg(t, T4, 0.35));
      setFont(ctx, F.head(72)); const kw = ctx.measureText('KAT').width; revealText(ctx, 'KAT', 585, 1120, 72, u, C.red, 'right');
      setFont(ctx, F.head(200)); revealText(ctx, '400', 585 - kw - 16, 1120, 200, u, C.red, 'right');
    }
    // sağ: log ölçekli doz sütunu (her çizgi 10 kat)
    const ra = ease.enter(seg(t, T.cmp0 + 0.5, 0.4));
    if (ra > 0) {
      ctx.save(); ctx.globalAlpha *= ra;
      const ag = ease.state(seg(t, T.cmp0 + 0.6, T.lethal - T.cmp0 - 0.6)), ayTop = lerp(BAR.y0, BAR.y1 - 20, ag); ctx.beginPath(); ctx.moveTo(BAR.x + BAR.w + 20, BAR.y0); ctx.lineTo(BAR.x + BAR.w + 20, ayTop); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
      for (let e = LOGMIN; e <= LOGMAX; e++) { const y = ly(10 ** e), xa = BAR.x + BAR.w + 20; if (y < ayTop - 1) continue; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xa + 14, y); ctx.lineWidth = 3; ctx.stroke(); ctx.fillText(new Intl.NumberFormat('tr-TR').format(10 ** e), xa + 24, y + 10); }
      setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText('LOG ÖLÇEK · 10 KAT', BAR.x + BAR.w + 20, BAR.y0 + 80);
      // 5 Gy: tüm vücut öldürücü (l16 "öldürücü" kelimesinde)
      const lu = ease.enter(seg(t, T.lethal, 0.35));
      if (lu > 0) {
        const y5 = ly(5), yf = lerp(BAR.y0, y5, ease.state(seg(t, T.lethal, 0.9))); ctx.save(); ctx.globalAlpha *= lu; ctx.fillStyle = '#F4EEE1'; ctx.fillRect(BAR.x, yf, BAR.w, BAR.y0 - yf); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(BAR.x, yf, BAR.w, BAR.y0 - yf);
        ctx.beginPath(); ctx.moveTo(BAR.x - 8, y5); ctx.lineTo(BAR.x + BAR.w + 20, y5); ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
        setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText('5 Gy', BAR.x - 16, y5 - 14); ctx.fillText('ÖLDÜRÜCÜ', BAR.x - 16, y5 + 50); ctx.fillText('TÜM VÜCUT', BAR.x - 16, y5 + 100); ctx.restore();
      }
      // "?": soru boyunca 5 Gy'nin üstünde bekler; "kaç"ta kesikli hayalet sütun 10 → 100 → 1.000 tırmanır, ucunda "?";
      // sessizlikte durur. "dört"te gerçek sütun (kırmızı) 2.000'e yükselir.
      if (t >= T.q + 0.3 && t < T4) {
        const u = ease.enter(seg(t, T.q + 0.3, 0.3)), gh = t >= T.kac ? ease.enter(seg(t, T.kac, 0.25)) : 0;
        const e = Math.log10(8) + (1 - Math.log10(8)) * ease.state(seg(t, T.kac, 0.3)) + ease.state(seg(t, T.kac + 0.35, 0.3)) + ease.state(seg(t, T.kac + 0.7, 0.3));
        const yg = ly(10 ** e);
        if (gh > 0) { ctx.save(); ctx.globalAlpha *= gh; ctx.setLineDash([12, 8]); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(BAR.x, yg, BAR.w, ly(5) - yg); ctx.setLineDash([]); ctx.restore(); }
        setFont(ctx, F.head(90)); revealText(ctx, '?', BAR.x + BAR.w / 2, yg - 14, 90, u, C.ink, 'center');
      }
      if (t >= T4) {
        const p = Math.min(1.04, spring(t - T4, 120, 24)), v = 5 * Math.pow(400, clamp01(p)), yv = ly(Math.min(2400, v)), y5 = ly(5);
        ctx.fillStyle = C.red; ctx.fillRect(BAR.x, yv, BAR.w, y5 - yv); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(BAR.x, yv, BAR.w, BAR.y0 - yv);
        ctx.beginPath(); ctx.moveTo(BAR.x, y5); ctx.lineTo(BAR.x + BAR.w, y5); ctx.lineWidth = 2; ctx.stroke();
        const lu2 = ease.enter(seg(t, T4 + 0.2, 0.3));
        setFont(ctx, F.mono(40)); revealText(ctx, '2.000 Gy', BAR.x + BAR.w, 836, 40, lu2, C.red, 'right'); revealText(ctx, 'BAŞA · YEREL', BAR.x + BAR.w, 884, 40, lu2, C.ink, 'right');
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // ——— büyüteç ———
  function roundel(t, kind, k = 1, at = null, R = ROUND) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / ROUND.r, r / ROUND.r); ctx.strokeStyle = C.ink;
    if (kind === 'ring') { drawRing(ctx, 74, t, 6, rq(0.35)); setFont(ctx, F.mono(26)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('U-70', 0, 10); }
    else if (kind === 'lamp') { ctx.save(); ctx.translate(0, 95); drawLamp(ctx, 190, true); ctx.restore(); }
    else if (kind === 'beam') { ctx.save(); ctx.translate(-10, 20); headProfile(ctx, 200); ctx.restore(); const u = ease.enter(seg(t, T.beam, 0.3)); ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.setLineDash([16, 7]); ctx.lineDashOffset = -t * 120; ctx.beginPath(); ctx.moveTo(-130, -2); ctx.lineTo(lerp(-130, 130, u), -2); ctx.stroke(); ctx.restore(); }
    else if (kind === 'face') { drawFaceDiagram(ctx, 190, { half: ease.enter(seg(t, T.palsy, 0.4)) }); }
    else if (kind === 'phd') { drawDiploma(ctx, 190); setFont(ctx, F.mono(24)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('DOKTORA', 0, -38); }
    else if (kind === 'rope') { const st = attemptState(t); ctx.beginPath(); ctx.moveTo(-90, -86); ctx.lineTo(90, -86); ctx.lineWidth = 8; ctx.stroke(); drawRope(ctx, 0, -86, 150, st.k === 0 || st.phase === 'ready' ? 'noose' : st.kind, st.phase === 'after' && st.ev != null ? 0.25 * Math.exp(-(t - st.ev) * 1.4) * Math.sin((t - st.ev) * 6.2) : 0, 5); }
    else if (kind === 'decree') { drawDecree(ctx, 150, 9); }
    else if (kind === 'beamHook') { ctx.save(); ctx.translate(-10, 20); headProfile(ctx, 200); ctx.restore(); ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.setLineDash([16, 7]); ctx.lineDashOffset = -t * 120; ctx.beginPath(); ctx.moveTo(-130, -2); ctx.lineTo(130, -2); ctx.stroke(); ctx.restore(); }
    else if (kind === 'teaser') { ctx.beginPath(); ctx.moveTo(-90, -86); ctx.lineTo(90, -86); ctx.lineWidth = 8; ctx.stroke(); drawRope(ctx, 0, -86, 150, 'snapped', 0.12 * Math.sin(t * rq(0.9) * 6.283), 5); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const S1 = [[0, null], [T.lab, 'ring'], [T.safety, 'lamp'], [T.bend, 'beam'], [T.doctors, 'face'], [T.phd - 0.2, 'phd'], [T.whip0, null],
    [T.adam - 0.1, 'rope'], [T.gov + 0.3, 'decree'], [T.cmp0, null]];
  function sched(t, S) {
    let i = -1; for (let k = 0; k < S.length; k++) if (t >= S[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S[i], prev = i > 0 ? S[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: i === 0 ? 1 : ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }
  const anchorOf = (t, kind) => {
    const s = toB(t);
    if (kind === 'beam' || kind === 'lamp' || kind === 'face' || kind === 'phd') { if (s > 0.05) return null; if (kind === 'lamp') return [250, FLOOR - 230]; if (kind === 'phd') return [650, FLOOR - 230]; return [PIPE.gap[0] + 30, PIPE.y]; }
    if (kind === 'rope' || kind === 'decree') { if (s < 0.95) return null; return kind === 'rope' ? [ROPE_X, FLOOR - 0.99 * GAL.size + 60] : [660, FLOOR - 200]; }
    return null;
  };

  // ——— Sıfır ———
  // ağır anlarda (ölüm beklentisi, idam denemeleri) Sıfır gülmez: düşünceli / şaşkın
  const blinkR = mulberry32(62); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'dusunceli'], [T.beam, 'sasirma', 'saskin'], [T.flash + 1.2, 'ayakta', 'dusunceli'], [T.phd, 'ayakta', 'notr'], [T.whip0, 'ayakta', 'dusunceli'],
    [T.adam, 'ayakta', 'dusunceli'], [T.e1, 'sasirma', 'saskin'], [T.e1 + 1.1, 'ayakta', 'dusunceli'], [T.e2, 'sasirma', 'saskin'], [T.e2 + 1.1, 'ayakta', 'dusunceli'],
    [T.e3, 'sasirma', 'saskin'], [T.gov, 'ayakta', 'dusunceli'], [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'dusunceli'], [T.loop0 + 0.5, 'ayakta', 'dusunceli']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
  }

  // ——— üst blok ———
  // sayı, söylendiği kelimeden önce ekranda görünmez: "___" yer tutucusu
  const NUMS = { l17: [['400', 'dört']] };
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01' || ln.id === 'l18') return;
    let txt = ln.text;
    for (const [num, w] of NUMS[ln.id] || []) if (t < tl.W(ln.id, w) - 0.04) txt = txt.replace(num, '___');
    const p = ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(40)); revealText(ctx, 'Işın kafasından geçen adam mı,', SAFE.x0, 640, 40, k, C.ink); revealText(ctx, 'üç kez asılamayan adam mı?', SAFE.x0, 690, 40, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1, labelInk = false }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : labelInk ? C.ink : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    if (t < L.l08.t0 - 0.06) {
      const st = t >= T.phd ? 'DOKTORA · FİZİKÇİ' : t >= T.palsy ? 'YÜZÜN SOL YARISI FELÇ' : t >= T.doctors ? 'ÖLMESİ BEKLENİYOR' : t >= T.nopain ? 'ACI YOK' : t >= T.beam ? 'PROTON IŞINI' : t >= T.safety ? 'GÜVENLİK ARIZALI' : 'ARIZA KONTROLÜ';
      row({ label: 'ANATOLI BUGORSKI · SSCB', num: '1978', unit: '', right1: 'U-70 · PROTVINO', right2: st, p: Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) });
      return;
    }
    if (t < L.l09.t0 - 0.06) return;
    if (t < T.cmp0) {
      const p = Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35))), st = attemptState(t);
      if (st.k === 0) row({ label: 'JOSEPH SAMUEL · AVUSTRALYA', num: '1803', unit: '', right1: 'YENİ GÜNEY GALLER', right2: t >= T.idam ? 'İDAM KARARI' : '', p });
      else {
        const res = t >= T.life ? 'İDAM KALDIRILDI' : st.phase === 'ready' ? 'İLMİK BOYNUNDA' : st.k === 2 ? 'İLMİK KAYDI' : st.k === 3 ? 'İP YİNE KOPTU' : 'İP KOPTU';
        row({ label: 'JOSEPH SAMUEL · AVUSTRALYA', num: st.k + '.', unit: 'deneme', right1: '26 EYLÜL 1803', right2: res, p });
      }
      return;
    }
    if (t < T.q - 0.06) { const p = ease.enter(seg(t, T.cmp0, 0.35)); row({ label: t >= T.three ? 'SAMUEL' : 'YAN YANA', labelInk: t >= T.three, num: t >= T.three ? '3' : '', unit: t >= T.three ? 'kez asıldı' : '', right1: '', right2: '', p }); return; }
    if (t < T.hero) { const p = ease.enter(seg(t, T.q - 0.06, 0.35)); row({ label: 'BUGORSKI · BAŞINA ÇARPAN DOZ', labelInk: true, num: '?', unit: 'kat', right1: t >= T.lethal ? 'ÖLDÜRÜCÜ: 5 Gy' : '', right2: t >= T.lethal ? 'TÜM VÜCUT' : '', p }); return; }
    if (t < T.ask) { const four = t >= tl.W('l17', 'dört') - 0.04; row({ label: 'YAKLAŞIK · ÖLDÜRÜCÜ DOZUN', num: four ? '400' : '___', unit: 'katı', red: true, right1: four ? '2.000 Gy · BAŞA' : '', right2: '5 Gy · TÜM VÜCUT' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Bugorski mi, Samuel mi?', SAFE.x0, 672, 80, p, C.ink);
  }
  function chip(s, x, y, a = 1, al = 'left', col = C.ink) {
    if (a <= 0) return; setFont(ctx, F.mono(32)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - 32, tw + 20, 46); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const s = toB(t);
    if (s < 1) lab(t, -W * s);
    if (s > 0) parra(t, W * (1 - s));
    board(t);
    const r1 = sched(t, S1);
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, r1.k, anchorOf(t, r1.kind));
    // kare 0 ve soru: iki etiket (büyüteçte SAMUEL, sahnede BUGORSKİ)
    if (t < L.l02.t0 || t >= T.ask) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.ask, 0.4));
      roundel(t, 'beamHook', kk, null, { x: 245, y: 925, r: 150 }); roundel(t, 'teaser', kk, null, { x: 770, y: 925, r: 150 });
      chip('BUGORSKI', 245, 1112, kk, 'center'); chip('SAMUEL', 770, 1112, kk, 'center');
    }
    // takip çağrısı: soru boyunca, döngüden önce söner
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET · HER HAFTA YENİ BİR HANGİSİ?', 540, 760, kf, 'center'); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

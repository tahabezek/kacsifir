// "Termometre" şablonu (Hangisi daha şaşırtıcı?): vücudu 13,7 °C'ye düşüp yaşayan Anna Bågenholm (1999) ile Pelée'nin
// kızgın kül bulutundan taş hücresinde kurtulan Ludger Sylbaris (1902). Omurga: solda dürüst, kırık eksenli bir termometre
// (0–40 °C doğrusal, 40 °C üstü sıkışık; kırık işaretli). Sağda sahneler: buzlu nehir kesiti → hastane (EKG, saat, kalp-akciğer
// makinesi) → Sylbaris'in büyüteci → gravür Martinik haritası ve bulut → hücre kesiti → sirk afişi → aynı termometrede kıyas.
// Doruk: kente ulaşan bulutun 350–400 °C bandı (tek kırmızı). Ton: 28 bin ölümlü felaket; yıkım görüntüsü yok, Sıfır gülmez.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe } from '../globe.js';
import { ANNA_CARD, DOCTOR_CARD, SYLBARIS_CARD, STAFF_CARD, PERSON_POSES as PP, mixPersonPose, drawPerson, drawCrystal, drawAshCloud } from '../termometre_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const SX0 = 300, SHIFT = 800;                 // sahne bölgesi (termometre sütununun sağı) ve geçiş kayması
const SIFIR = { x: 884, y: 1412, H: 92 };
const PAPER2 = '#F4EEE1';
// termometre: 0–40 °C doğrusal (9 px/°C), 100–400 °C sıkışık (0,27 px/°C); arada kırık
const TH = { x: 165, top: 772, bot: 1302, bulbY: 1334, bulbR: 34, tw: 26 };
export const yT = T => T <= 40 ? 1288 - T * 9 : T >= 100 ? 868 - (T - 100) * 0.27 : lerp(928, 868, (T - 40) / 60);
const BREAK_Y = 898;
// Martinik (gravür harita): Saint-Pierre, Pelée zirvesi
const ST_PIERRE = [-61.176, 14.743], PELEE = [-61.165, 14.809];
const MAP0 = { c: [-61.05, 14.66], r: 64000, cy: 1075 }, MAP1 = { c: [-61.13, 14.73], r: 92000, cy: 1075 };

// sayılar, söylendikleri kelimede açılır (öncesinde aynı genişlikte boşluk çizgisi)
const NUMW = { l02: { "1999'da": 'bin' }, l03: { '40': 'kırk' }, l04: { '13,7': 'on' }, l06: { '10': 'on' }, l09: { "1902'de": 'bin' }, l11: { '28': 'yirmi' }, l15: { '37': 'otuz', '13,7': 'on' }, l16b: { '350': 'üç', '400': 'dört' } };

export function termometreTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    y1999: Wd('l02', 'bin'), fall: Wd('l02', 'buzu'), river: Wd('l02', 'nehre'), pocket: Wd('l03', 'hava'), m40: Wd('l03', 'kırk'),
    stop: Wd('l04', 'kalbi'), temp: Wd('l04', 'on'), hosp: Wd('l04', 'hastaneye'), iki: Wd('l05', 'iki'), warm: Wd('l06', 'ısıtıyorlar'),
    wake: Wd('l06', 'uyanıyor'), d10: Wd('l06', 'on'), years: Wd('l06', 'yıllar'), doctor: Wd('l06', 'radyolog'),
    whip0: Wd('l08', 'adam') - 0.3, adam: Wd('l08', 'adam'), map: L.l09.t0, y1902: Wd('l09', 'bin'), cell0: Wd('l09', 'penceresiz'),
    erupt: Wd('l10', 'patlıyor'), wiped: Wd('l10', 'yok'), deaths: Wd('l11', 'yirmi'), cell: L.l12.t0, rescue: Wd('l12', 'çıkarılıyor'),
    circus: L.l13.t0, cmp0: L.l14.t0 - 0.1, thermo: Wd('l14', 'termometreye'), w37: Wd('l15', 'otuz'), anna: Wd('l15', 'on'),
    // doruk: "tahminen"den sonraki sessizlik; vuruş, kırmızı 350 ve sütun "üç"ün başında aynı karede
    hero: Wd('l16b', 'üç'), w400: Wd('l16b', 'dört') + 0.13, ask: L.l17.t0, loop0: tl.loop0,
  };
  T.hit = T.hero;
  // kalp, ısıtma başlar başlamaz yeniden atar ("ısıtıyorlar" sürerken)
  T.beat = T.warm + 0.4;
  return T;
}

export async function makeTermometreRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = termometreTimes(tl);
  // döngü dikişi: sürekli döngülerin frekansı film süresine tam bölünür (son kare = kare 0)
  const wq = w => Math.round(w * D / (2 * Math.PI)) * 2 * Math.PI / D, rq = r => Math.round(r * D) / D;
  const rnd = mulberry32(60);
  const snow = Array.from({ length: 120 }, () => [rnd(), rnd(), 0.7 + rnd() * 0.9]);
  const bubbles = Array.from({ length: 14 }, () => [rnd(), rnd(), 0.7 + rnd() * 0.6]);
  const ash = Array.from({ length: 90 }, () => [rnd(), rnd(), 0.5 + rnd()]);
  const flow = Array.from({ length: 26 }, () => [rnd(), rnd(), 40 + rnd() * 120]);

  // ——— sahne pencereleri: her geçiş 0,5 sn'lik sola kayma (filmin tek baskın yönü) ———
  const PANELS = [['intro', -1e9], ['river', L.l02.t0], ['hosp', T.hosp], ['adam', T.whip0], ['map', T.map], ['cell', T.cell], ['poster', T.circus], ['cmp', T.cmp0], ['intro', T.ask]];
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

  // ——— termometre ———
  function mercury(t) {
    if (t < T.stop) return t < T.pocket ? 37 : lerp(37, 30, ease.state(seg(t, T.pocket, T.stop - T.pocket)));
    if (t < T.warm) return lerp(30, 13.7, ease.state(seg(t, T.stop, T.temp - T.stop)));
    if (t < T.cmp0) return lerp(13.7, 36.4, ease.state(seg(t, T.warm, T.beat + 1.2 - T.warm)));
    if (t < T.w37) return 36.4 + 0.6 * seg(t, T.cmp0, T.w37 - T.cmp0);
    if (t < T.ask) return lerp(37, 13.7, ease.state(seg(t, T.w37 + 0.1, T.anna - T.w37 - 0.1)));
    return lerp(13.7, 37, ease.state(seg(t, T.ask, 0.9)));
  }
  function thermo(t) {
    const x = TH.x, m = mercury(t);
    // tüp ve hazne
    ctx.beginPath(); ctx.roundRect(x - TH.tw / 2, TH.top, TH.tw, TH.bulbY - TH.top, TH.tw / 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, TH.bulbY, TH.bulbR, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    // cıva: hazneden okumaya; ince parlak çizgi yok (parlama yok)
    const ym = yT(m); ctx.fillStyle = C.ink; ctx.fillRect(x - 6, ym, 12, TH.bulbY - ym);
    ctx.beginPath(); ctx.moveTo(x - 6, ym); ctx.lineTo(x + 6, ym); ctx.lineWidth = 2; ctx.stroke();
    // çentikler ve değerler
    const ticks = [[0, '0'], [10, ''], [20, ''], [30, ''], [37, '37'], [100, '100'], [200, ''], [300, ''], [400, '400']];
    setFont(ctx, F.mono(40)); ctx.textAlign = 'left';
    for (const [v, s] of ticks) {
      const y = yT(v); ctx.beginPath(); ctx.moveTo(x + TH.tw / 2, y); ctx.lineTo(x + TH.tw / 2 + (s ? 16 : 9), y); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
      if (s) { ctx.fillStyle = C.ink; ctx.fillText(s, x + 36, y + 14); }
    }
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText('°C', x - 22, TH.top - 16);
    // kırık işareti: tüpün iki yanında zikzak (ölçek değişir)
    ctx.save(); ctx.fillStyle = C.paper; ctx.fillRect(x - TH.tw / 2 - 12, BREAK_Y - 7, TH.tw + 24, 14);
    ctx.beginPath(); for (const dy of [-7, 7]) { ctx.moveTo(x - TH.tw / 2 - 12, BREAK_Y + dy); for (let k = 0; k <= 6; k++) ctx.lineTo(x - TH.tw / 2 - 12 + k * (TH.tw + 24) / 6, BREAK_Y + dy + (k % 2 ? -5 : 5)); }
    ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
    if (m > 40 || BREAK_Y > ym) { /* cıva kırığın altında kalır: sorun yok */ }
    const sk = t >= T.cmp0 && t < T.ask + 0.3 ? ease.enter(seg(t, T.cmp0, 0.4)) * (1 - ease.exit(seg(t, T.ask, 0.3))) : 0;
    if (sk > 0) { ctx.save(); ctx.globalAlpha = sk; setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; const nw = ctx.measureText('40 °C ÜSTÜ SIKIŞIK').width; ctx.fillStyle = C.paper; ctx.fillRect(x + TH.bulbR + 6, TH.bulbY + 2, nw + 32, 66); ctx.fillStyle = C.graphite; ctx.fillText('40 °C ÜSTÜ SIKIŞIK', x + TH.bulbR + 22, TH.bulbY + 50); ctx.restore(); }
    // Anna'nın 13,7'si: söylendiği kelimede açılan çentik
    const a13 = (t >= T.temp - 0.04 && t < T.whip0 + 0.3) ? ease.enter(seg(t, T.temp - 0.04, 0.3)) * (1 - seg(t, T.whip0, 0.3)) : (t >= T.anna - 0.04 && t < T.ask + 0.2) ? ease.enter(seg(t, T.anna - 0.04, 0.3)) * (1 - seg(t, T.ask, 0.25)) : 0;
    if (a13 > 0) { const y = yT(13.7); ctx.save(); ctx.globalAlpha = a13; ctx.beginPath(); ctx.moveTo(x + TH.tw / 2, y); ctx.lineTo(x + TH.tw / 2 + 16, y); ctx.lineWidth = 3; ctx.stroke(); setFont(ctx, F.mono(40)); if (t < T.cmp0) { ctx.fillStyle = C.paper; ctx.fillRect(x + 32, y - 22, 104, 44); ctx.fillStyle = C.ink; ctx.fillText('13,7', x + 36, y + 14); } ctx.restore(); }
    // doruk: vuruş karesinde kırmızı sütun Anna'nın 13,7'sinden 1 sn içinde 350'ye dolar, "dört"te 400'e; sol yanda 350–400 ayracı
    const hb = t >= T.hit && t < T.ask + 0.3 ? 1 - ease.exit(seg(t, T.ask, 0.3)) : 0;
    if (hb > 0) {
      const y0 = yT(400), y1 = yT(350), xb = x + TH.tw / 2 + 8;
      const top = t < T.w400 - 0.04 ? lerp(yT(13.7), y1, ease.enter(seg(t, T.hit, 1.0))) : lerp(y1, y0, ease.state(seg(t, T.w400 - 0.04, 0.4)));
      ctx.save(); ctx.globalAlpha = hb; ctx.fillStyle = C.red; ctx.fillRect(x - 6, top, 12, yT(13.7) - top);
      ctx.fillStyle = C.ink; ctx.fillRect(x - 6, ym, 12, TH.bulbY - ym);
      const bk = seg(t, T.hit + 0.6, 0.3);
      if (bk > 0) { ctx.globalAlpha = hb * bk; ctx.beginPath(); ctx.moveTo(xb - 8, Math.min(top, y1 - 8)); ctx.lineTo(xb, Math.min(top, y1 - 8)); ctx.lineTo(xb, y1); ctx.lineTo(xb - 8, y1); ctx.lineWidth = 4; ctx.strokeStyle = C.red; ctx.stroke(); }
      ctx.restore();
    }
  }

  // ——— sahne: buzlu nehir (kesit) ———
  const ICE = 930, WATER1 = 1290, HOLE = 640, POCK = { x: 520, w: 150, h: 46 };
  const FLOAT = { x: POCK.x - 36, y: ICE + 50 + 168 }, STILL = { x: POCK.x - 76, y: ICE + 50 + 111 };
  function river(t, dx) {
    const z = 1.05 + 0.25 * ease.state(seg(t, L.l02.t0, T.hosp - L.l02.t0));
    ctx.save(); ctx.translate(dx, 0); ctx.translate(POCK.x, 1000); ctx.scale(z, z); ctx.translate(-POCK.x, -1000);
    // dağ silueti ve kar
    ctx.beginPath(); ctx.moveTo(SX0 - 60, 905); [[380, 800], [470, 860], [560, 770], [690, 850], [780, 790], [900, 870], [1000, 820], [1140, 900]].forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(1140, ICE); ctx.lineTo(SX0 - 60, ICE); ctx.closePath();
    ctx.fillStyle = PAPER2; ctx.fill(); ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineWidth = 1.1; for (let k = -400; k < 1200; k += 9) { ctx.beginPath(); ctx.moveTo(k, ICE); ctx.lineTo(k + 160, 760); ctx.stroke(); } ctx.restore();
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // buz tabakası (taralı) ve delik
    const holeU = t >= T.fall ? ease.enter(seg(t, T.fall, 0.25)) : 0, hw = 54 * holeU;
    ctx.fillStyle = C.paper; ctx.fillRect(SX0 - 60, ICE, 1200, 26);
    ctx.save(); ctx.beginPath(); ctx.rect(SX0 - 60, ICE, HOLE - hw - SX0 + 60, 26); ctx.rect(HOLE + hw, ICE, 1200, 26); ctx.clip();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; for (let k = SX0 - 80; k < 1200; k += 8) { ctx.beginPath(); ctx.moveTo(k, ICE + 26); ctx.lineTo(k + 26, ICE); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(SX0 - 60, ICE); ctx.lineTo(1200, ICE); ctx.moveTo(SX0 - 60, ICE + 26); ctx.lineTo(1200, ICE + 26); ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
    // su: akış çizgileri sola akar (sürekli döngü); hava cebi buzun altında kubbe
    ctx.save(); ctx.beginPath(); ctx.rect(SX0 - 60, ICE + 26, 1200, WATER1 - ICE - 26); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.32)'; ctx.lineWidth = 1.4;
    for (const [fx, fy, len] of flow) { const x = SX0 - 80 + (((fx - t * rq(0.06)) % 1 + 1) % 1) * 880, y = ICE + 46 + fy * (WATER1 - ICE - 70); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(POCK.x, ICE + 26, POCK.w / 2, POCK.h, 0, 0, Math.PI); ctx.fillStyle = PAPER2; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // nehir yatağı
    ctx.beginPath(); ctx.moveTo(SX0 - 60, WATER1); for (let x = SX0 - 60; x <= 1140; x += 40) ctx.lineTo(x, WATER1 + Math.sin(x * 0.03) * 6); ctx.lineTo(1140, 1480); ctx.lineTo(SX0 - 60, 1480); ctx.closePath(); ctx.fillStyle = PAPER2; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.lineWidth = 1.3; for (let k = -200; k < 1200; k += 10) { ctx.beginPath(); ctx.moveTo(k, 1480); ctx.lineTo(k + 190, WATER1 - 10); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(SX0 - 60, WATER1); for (let x = SX0 - 60; x <= 1140; x += 40) ctx.lineTo(x, WATER1 + Math.sin(x * 0.03) * 6); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    // Anna: kar üstünde kayak (sola), deliğe düşer, buzun altında hava cebine sürüklenir; kalp durunca kıpırtısız
    let x, y, pose, rot = 0;
    if (t < T.fall) { const u = seg(t, L.l02.t0 - 0.3, T.fall - L.l02.t0 + 0.3); x = lerp(960, HOLE + 10, u); y = ICE; pose = PP.ski; }
    // kök ayak tabanı, dönme kalçada: baş hava cebinde kalacak kök konumları (boy 200: kalça kökün 100 px üstü, baş kalçadan 77 px)
    else if (t < T.pocket) { const u = ease.state(seg(t, T.fall, T.pocket - T.fall)); x = lerp(HOLE, FLOAT.x, u); y = lerp(ICE + 20, FLOAT.y, u); pose = mixPersonPose(PP.fall, PP.float, u); }
    else { const s = t < T.stop ? 0 : ease.state(seg(t, T.stop, 0.8)); x = lerp(FLOAT.x, STILL.x, s); y = lerp(FLOAT.y, STILL.y, s) + (1 - s) * 5 * Math.sin(t * wq(2.4)); pose = mixPersonPose(PP.float, PP.still, s); }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); drawPerson(ctx, ANNA_CARD, pose, 200); ctx.restore();
    if (t < T.fall) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(-70, -2); ctx.lineTo(90, -2); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
    // kabarcıklar: hava cebinden önce delikten, sonra cebe doğru (kalp durunca seyrelir)
    if (t >= T.fall && t < T.hosp) {
      const live = t < T.stop ? 1 : 1 - seg(t, T.stop, 1.2);
      for (const [bx, by, sp] of bubbles) {
        const ph = ((by + t * rq(0.5) * sp) % 1), xx = POCK.x + 40 + (bx - 0.5) * 60 + Math.sin(ph * 12 + bx * 9) * 6, yy = ICE + 200 - ph * 150;
        if (yy < ICE + 30) continue; ctx.save(); ctx.globalAlpha = live; ctx.beginPath(); ctx.arc(xx, yy, 4 + bx * 5, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      }
    }
    // kar yağışı (sürekli döngü)
    ctx.fillStyle = C.ink;
    for (const [sx, sy, sp] of snow) { const yy = 740 + (((sy + t * rq(0.16) * sp) % 1)) * (ICE - 750), xx = SX0 - 40 + sx * 820 + Math.sin(t * wq(0.8) + sx * 20) * 10; ctx.beginPath(); ctx.arc(xx, yy, 3.4 * sp, 0, Math.PI * 2); ctx.fill(); }
    // buz kristalleri: sıcaklık düşerken suda belirir
    if (t >= T.pocket) { const k = seg(t, T.pocket, T.temp - T.pocket); for (let i = 0; i < 6; i++) { const cx = 420 + i * 95 + 14 * Math.sin(t * wq(0.6) + i), cy = ICE + 120 + (((i * 0.37 + t * rq(0.05)) % 1)) * 260; ctx.save(); ctx.globalAlpha = k * 0.8; ctx.translate(cx, cy); ctx.rotate(t * wq(0.6) * (i % 2 ? 1 : -1)); drawCrystal(ctx, 44); ctx.restore(); } }
    ctx.restore();
    chip('NARVİK · NORVEÇ', 330 + dx, 1376, ease.enter(seg(t, L.l02.t0 + 0.3, 0.4)));
  }

  // ——— sahne: hastane (EKG, saat, kalp-akciğer makinesi, takvim) ———
  function hosp(t, dx) {
    const z = 1 + 0.14 * seg(t, T.hosp, T.whip0 - T.hosp);
    ctx.save(); ctx.translate(dx, 0); ctx.translate(640, 1060); ctx.scale(z, z); ctx.translate(-640, -1060);
    // duvar saati: 19.40 → 22.15 (kalbin atmadığı süre), l05 boyunca süpürür
    const clockU = ease.state(seg(t, T.iki - 0.2, L.l05.end - T.iki + 0.4)), mins = lerp(19 * 60 + 40, 22 * 60 + 15, clockU) + (t > L.l05.end ? (t - L.l05.end) * 2 : 0);
    const CX = 410, CY = 850, CR = 76;
    ctx.beginPath(); ctx.arc(CX, CY, CR, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(CX + Math.sin(a) * CR * 0.82, CY - Math.cos(a) * CR * 0.82); ctx.lineTo(CX + Math.sin(a) * CR * 0.95, CY - Math.cos(a) * CR * 0.95); ctx.lineWidth = i % 3 ? 2 : 4; ctx.stroke(); }
    const ha = (mins / 60 % 12) * Math.PI / 6, ma = (mins % 60) * Math.PI / 30;
    ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX + Math.sin(ha) * CR * 0.5, CY - Math.cos(ha) * CR * 0.5); ctx.lineWidth = 7; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX + Math.sin(ma) * CR * 0.78, CY - Math.cos(ma) * CR * 0.78); ctx.lineWidth = 4; ctx.stroke(); ctx.lineCap = 'butt';
    // EKG monitörü: kalp durunca düz çizgi, "atmaya"da vuruşlar; tarama imleci sürekli döner
    const MX = 500, MY = 770, MW = 360, MH = 170;
    ctx.fillStyle = PAPER2; ctx.fillRect(MX, MY, MW, MH); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.strokeRect(MX, MY, MW, MH);
    ctx.save(); ctx.beginPath(); ctx.rect(MX + 4, MY + 4, MW - 8, MH - 8); ctx.clip(); ctx.strokeStyle = 'rgba(139,133,119,0.35)'; ctx.lineWidth = 1; for (let x = MX; x < MX + MW; x += 20) { ctx.beginPath(); ctx.moveTo(x, MY); ctx.lineTo(x, MY + MH); ctx.stroke(); } for (let y = MY; y < MY + MH; y += 20) { ctx.beginPath(); ctx.moveTo(MX, y); ctx.lineTo(MX + MW, y); ctx.stroke(); }
    // tarama: imleç ekranı 1/rq(0.45) sn'de geçer; her noktanın örnek zamanı imleçten geriye sayılır
    const sv = rq(0.45), sweep = ((t * sv) % 1) * MW;
    // kalp masajı sürerken her basıda dalga (masaj artefaktı), kalp atınca QRS vuruşları
    const pulse = s => { if (s < T.beat) { if (s < T.hosp || s >= T.warm) return 0; const n = Math.floor(s * 1.67), c = s * 1.67 - n, h = ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1; return c < 0.22 ? -(4 + 9 * h) * Math.sin(Math.PI * c / 0.22) * (h > 0.18 ? 1 : 0) : 0; } const ph = ((s - T.beat) * 1.25) % 1; return ph < 0.06 ? -64 * Math.sin(ph / 0.06 * Math.PI) : ph < 0.1 ? 22 * Math.sin((ph - 0.06) / 0.04 * Math.PI) : 0; };
    ctx.beginPath(); let pen = false;
    for (let xx = 0; xx <= MW; xx += 2) {
      if (xx > sweep && xx < sweep + 16) { pen = false; continue; }
      const back = xx <= sweep ? sweep - xx : sweep + MW - xx, s = t - back / (MW * sv), y = MY + MH / 2 + pulse(s);
      if (!pen) { ctx.moveTo(MX + xx, y); pen = true; } else ctx.lineTo(MX + xx, y);
    }
    ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
    // yatak ve Anna (uyanınca doğrulur); "yıllar"da yatak sola kayar, beyaz önlüklü Anna sağdan girer
    const bedOut = ease.state(seg(t, T.years - 0.1, 0.6)), docIn = seg(t, T.years + 0.2, Math.min(1.4, T.whip0 - 0.3 - T.years));
    ctx.save(); ctx.translate(-700 * bedOut, 0);
    const BX = 520, BY = 1230;
    ctx.fillStyle = PAPER2; ctx.fillRect(BX - 20, BY - 30, 380, 30); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(BX - 20, BY - 30, 380, 30);
    ctx.beginPath(); ctx.moveTo(BX - 10, BY); ctx.lineTo(BX - 10, BY + 70); ctx.moveTo(BX + 350, BY); ctx.lineTo(BX + 350, BY + 70); ctx.moveTo(BX - 20, BY - 30); ctx.lineTo(BX - 20, BY - 110); ctx.lineWidth = 5; ctx.stroke();
    const sitU = ease.state(seg(t, T.wake, 0.8));
    ctx.save(); ctx.translate(BX + 150, BY - 34 - 30 * sitU); drawPerson(ctx, ANNA_CARD, sitU > 0 ? mixPersonPose({ ...PP.still, sh: [20, 30] }, { ...PP.still, body: 30, eyes: 'open', sh: [40, 60] }, sitU) : PP.still, 220); ctx.restore();
    // görevliler: kalp durukken masaj (dakikada ~100 bası), ısıtma başlayınca biri makinede, biri yatak başında
    if (t < T.d10 - 0.6) {
      const ph = 0.5 + 0.5 * Math.sin(t * wq(10.5)), cpr = t < T.warm;
      ctx.save(); ctx.translate(BX + 40, BY + 4); drawPerson(ctx, STAFF_CARD, cpr ? mixPersonPose(PP.cprUp, PP.cprDown, ph) : mixPersonPose(PP.stand, PP.point, 0.5 + 0.5 * Math.sin(t * wq(0.8))), 300); ctx.restore();
      ctx.save(); ctx.translate(BX + 262, BY + 4); ctx.scale(-1, 1); drawPerson(ctx, STAFF_CARD, cpr ? mixPersonPose(PP.stand, PP.point, 0.5 + 0.5 * Math.sin(t * wq(1.3))) : mixPersonPose(PP.cprUp, PP.stand, 0.5 + 0.5 * Math.sin(t * wq(0.9))), 300); ctx.restore();
    }
    // kalp-akciğer makinesi: döner pompa ve tüplerde akış (ısıtma başlayınca)
    const PX = 390, PY = 1120, warmOn = t >= T.warm - 0.2;
    ctx.fillStyle = PAPER2; ctx.fillRect(PX - 70, PY - 60, 140, 200); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(PX - 70, PY - 60, 140, 200);
    const rot = warmOn ? (t - T.warm) * wq(3.2) : 0;
    ctx.beginPath(); ctx.arc(PX, PY, 44, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.stroke(); for (let i = 0; i < 3; i++) { const a = rot + i * 2.094; ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(PX + Math.cos(a) * 40, PY + Math.sin(a) * 40); ctx.stroke(); ctx.beginPath(); ctx.arc(PX + Math.cos(a) * 34, PY + Math.sin(a) * 34, 8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
    if (t >= T.warm - 0.4) {
      const k = ease.enter(seg(t, T.warm - 0.4, 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 5; ctx.setLineDash([16, 10]); ctx.lineDashOffset = -t * 60;
      ctx.beginPath(); ctx.moveTo(PX + 70, PY + 30); ctx.bezierCurveTo(PX + 160, PY + 40, BX + 60, BY - 120, BX + 120, BY - 70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PX + 70, PY + 80); ctx.bezierCurveTo(PX + 170, PY + 100, BX + 120, BY - 20, BX + 190, BY - 60); ctx.stroke(); ctx.setLineDash([]);
      // ısıtıcıdan yükselen ısı dalgaları (sürekli döngü)
      const hk = k * (1 - seg(t, T.d10 - 0.9, 0.3)); ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const u = (t * rq(0.9) + i / 3) % 1; ctx.globalAlpha = hk * (1 - u); ctx.beginPath(); for (let j = 0; j <= 12; j++) { const yy = PY - 70 - u * 110 - j * 5; ctx[j ? 'lineTo' : 'moveTo'](PX - 30 + i * 30 + 7 * Math.sin(j * 0.9 + t * wq(6)), yy); } ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    // takvim: 20 MAYIS → 30 MAYIS ("on"da sayfalar çevrilir)
    if (t >= T.d10 - 0.6) {
      const k = ease.enter(seg(t, T.d10 - 0.6, 0.4)) * (1 - ease.exit(seg(t, T.years - 0.2, 0.3)));
      const day = 20 + Math.min(10, Math.floor(10 * ease.state(seg(t, T.d10 - 0.04, 0.6))));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(400, 995); ctx.scale(0.8, 0.8);
      ctx.fillStyle = PAPER2; ctx.fillRect(-80, -70, 160, 150); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(-80, -70, 160, 150); ctx.fillStyle = C.ink; ctx.fillRect(-80, -70, 160, 36);
      ctx.fillRect(-80, -70, 160, 46); setFont(ctx, F.mono(40)); ctx.fillStyle = C.paper; ctx.textAlign = 'center'; ctx.fillText('MAYIS', 0, -34); setFont(ctx, F.head(80)); ctx.fillStyle = C.ink; ctx.fillText(String(day), 0, 50); ctx.restore();
    }
    // radyolog: "radyolog"da soldan ışıklı film panosu girer; tarama ışığı film boyunca iner (sürekli döngü)
    if (t >= T.doctor - 0.3) {
      const k = ease.enter(seg(t, T.doctor - 0.3, 0.5)), LX = 340 - 260 * (1 - k), LY = 990, LW = 220, LH = 260;
      ctx.save(); ctx.fillStyle = PAPER2; ctx.fillRect(LX - 12, LY - 12, LW + 24, LH + 24); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(LX - 12, LY - 12, LW + 24, LH + 24);
      ctx.fillStyle = C.ink; ctx.fillRect(LX, LY, LW, LH);
      ctx.strokeStyle = C.paper; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(LX + LW / 2, LY + 24); ctx.lineTo(LX + LW / 2, LY + LH - 20); ctx.stroke();
      ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const yy = LY + 50 + i * 30; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(LX + LW / 2 + sd * 8, yy); ctx.quadraticCurveTo(LX + LW / 2 + sd * 90, yy - 18, LX + LW / 2 + sd * 82, yy + 26); ctx.stroke(); } }
      const sy = LY + ((t * rq(0.7)) % 1) * LH; ctx.globalAlpha = 0.45; ctx.fillStyle = C.paper; ctx.fillRect(LX, sy, LW, 8);
      ctx.restore();
    }
    // doktor Anna (beyaz önlük): yıllar sonra, monitörün önünde
    if (docIn > 0) { const walking = docIn < 1, ph = 0.5 + 0.5 * Math.sin(t * wq(7)); ctx.save(); ctx.translate(lerp(980, 690, docIn), 1190); ctx.scale(-1, 1); drawPerson(ctx, DOCTOR_CARD, walking ? mixPersonPose(PP.walkA, PP.walkB, ph) : mixPersonPose(PP.stand, PP.point, ease.state(seg(t, T.doctor + 0.5, 0.5))), 330); ctx.restore(); }
    ctx.restore();
    chip(t >= T.years ? 'YILLAR SONRA' : 'TROMSØ · HASTANE', 330 + dx, 1376, ease.enter(seg(t, T.hosp + 0.2, 0.4)));
  }

  // ——— sahne: "Yoksa bu adam mı?" — Sylbaris'in büyüteci ———
  function adam(t, dx) {
    const k = ease.enter(seg(t, T.adam - 0.1, 0.4)), R = 210 * (0.6 + 0.4 * k) * (1 + 0.04 * seg(t, T.adam, T.map - T.adam));
    const X = 600 + dx, Y = 1040;
    if (k <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.arc(X, Y, R, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.clip();
    // taş duvar dokusu ve figür (gövde ve baş)
    ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = 1.5; for (let r = 0; r < 12; r++) for (let c = 0; c < 8; c++) { const bx = X - 260 + c * 70 + (r % 2) * 35, by = Y - 260 + r * 44; ctx.strokeRect(bx, by, 70, 44); }
    ctx.save(); ctx.translate(X - 10, Y + R * 2.5); drawPerson(ctx, SYLBARIS_CARD, { ...PP.stand, sh: [-10, 10] }, R * 3.2); ctx.restore();
    ctx.restore();
    ctx.beginPath(); ctx.arc(X, Y, R, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    chip('LUDGER SYLBARIS', X, Y + R + 56, k, 'center');
  }

  // ——— sahne: Martinik haritası, Pelée ve kızgın bulut ———
  function mapScene(t, dx) {
    const u = seg(t, T.map - 0.25, T.erupt - T.map + 0.25), z = 1 + 0.2 * ease.state(seg(t, T.erupt, T.cell - T.erupt));
    const cam = { c: [lerp(MAP0.c[0], MAP1.c[0], u), lerp(MAP0.c[1], MAP1.c[1], u)], r: Math.exp(lerp(Math.log(MAP0.r), Math.log(MAP1.r), u)) * z, cy: MAP0.cy, cx: 660 + dx };
    G.setCam(cam); G.draw();
    const P = p => G.proj(p);
    { const m0 = P(PELEE), pre = 1 - seg(t, T.erupt, 0.4);
      if (pre > 0) for (let i = 0; i < 6; i++) { const u = ((t * rq(0.22) + i / 6) % 1); ctx.save(); ctx.globalAlpha = pre * (1 - u) * 0.9; ctx.translate(m0[0] + 30 * u + 8 * Math.sin(u * 7 + i), m0[1] - 30 - 190 * u); drawAshCloud(ctx, 70 + 150 * u, t * rq(0.3) + i * 0.2, i); ctx.restore(); }
      if (t >= T.erupt) { ctx.save(); ctx.fillStyle = 'rgba(28,27,24,0.5)'; ctx.globalAlpha = seg(t, T.erupt, 1.2); for (const [ax, ay, s2] of ash) { const yy = STAGE_TOP + (((ay + t * rq(0.16 * s2)) % 1)) * 720, xx = SX0 + ((ax - t * rq(0.06)) % 1 + 1) % 1 * 780; ctx.fillRect(xx, yy, 5 * s2, 5 * s2); } ctx.restore(); } }
    // bulut: Pelée'den Saint-Pierre'e (anlatım "yok ediyor"da kente varır), arkasında taralı iz
    if (t >= T.erupt) {
      const v = ease.state(seg(t, T.erupt, T.wiped - T.erupt)), a = P(PELEE), b = P(ST_PIERRE);
      const sp = 1 + 0.6 * seg(t, T.wiped, 1.5), cx = lerp(a[0], b[0] - 20, v), cy = lerp(a[1], b[1] + 10, v);
      ctx.save(); ctx.beginPath(); ctx.moveTo(a[0] - 30, a[1]); ctx.lineTo(cx - 90 * sp, cy); ctx.lineTo(cx + 90 * sp, cy + 30); ctx.lineTo(a[0] + 30, a[1]); ctx.closePath(); ctx.clip();
      ctx.strokeStyle = 'rgba(28,27,24,0.5)'; ctx.lineWidth = 1.4; for (let k = -1400; k < 1400; k += 9) { ctx.beginPath(); ctx.moveTo(cx + k, cy - 400); ctx.lineTo(cx + k + 300, cy + 400); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.translate(cx, cy); drawAshCloud(ctx, 260 * sp * (0.5 + 0.5 * v), t * rq(0.5), 3); ctx.restore();
    }
    // kent: "yirmi"de kent alanı çapraz taranır (ağır, sade)
    const town = t >= T.deaths ? ease.enter(seg(t, T.deaths - 0.04, 0.5)) : 0;
    const q = P(ST_PIERRE);
    if (town > 0) { ctx.save(); ctx.globalAlpha = town; ctx.beginPath(); ctx.ellipse(q[0], q[1], 44, 26, -0.6, 0, Math.PI * 2); ctx.fillStyle = 'rgba(28,27,24,0.55)'; ctx.fill(); ctx.restore(); }
    // dağ işareti
    const m = P(PELEE); ctx.beginPath(); ctx.moveTo(m[0] - 34, m[1] + 22); ctx.lineTo(m[0], m[1] - 24); ctx.lineTo(m[0] + 34, m[1] + 22); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
    const mlab = (p, s, a, ox, oy, al, col = C.ink, dot = false) => { const r = P(p); if (dot && a > 0) { ctx.beginPath(); ctx.arc(r[0], r[1], 8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); } chip(s, r[0] + ox, r[1] + oy, a, al, col); };
    mlab(ST_PIERRE, 'SAINT-PIERRE', ease.enter(seg(t, T.map + 0.3, 0.4)), 24, 58, 'left', C.ink, true);
    mlab(PELEE, 'PELÉE', ease.enter(seg(t, T.map + 0.6, 0.4)), 50, -14, 'left');
    if (t >= T.erupt + 0.4) chip('YAKLAŞIK 8 km', 330 + dx, 1376, ease.enter(seg(t, T.erupt + 0.4, 0.4)));
    // "penceresiz"de kentin içinden hücre kesiti açılır (iç pencere); kül, patlamadan önce de seyrek yağıyordu
    const ik = t >= T.cell0 - 0.04 ? ease.enter(seg(t, T.cell0 - 0.04, 0.45)) : 0;
    if (ik > 0) {
      const IX = 590 + dx, IY = 1225, IR = 100 * (0.4 + 0.6 * ik);
      ctx.save(); ctx.globalAlpha = ik; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(IX - IR * 0.8, IY - IR * 0.6); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
      cellRoundel(IX, IY, IR, t, 0.4 + 0.6 * seg(t, T.erupt, 1)); ctx.restore();
    }
  }

  // ——— sahne: hücre kesiti ———
  function cellScene(t, dx) {
    const z = 1 + 0.07 * seg(t, T.cell, T.circus - T.cell);
    ctx.save(); ctx.translate(dx, 0); ctx.translate(640, 1080); ctx.scale(z, z); ctx.translate(-640, -1080);
    const GR = 1010;
    // gökyüzünde kayan kül tabakası (sağdan sola; kurtarmadan sonra açılır)
    const clear = seg(t, T.rescue - 0.6, 1.2);
    ctx.save(); ctx.beginPath(); ctx.rect(SX0 - 40, STAGE_TOP, 900, GR - STAGE_TOP); ctx.clip(); ctx.globalAlpha = 1 - clear;
    for (let i = 0; i < 4; i++) { const x = 1100 - (((t * rq(0.08) + i * 0.27) % 1)) * 1000; ctx.save(); ctx.translate(x, 860 + (i % 2) * 70); drawAshCloud(ctx, 360, t * rq(0.3) + i * 0.3, i); ctx.restore(); }
    ctx.fillStyle = 'rgba(28,27,24,0.55)'; for (const [ax, ay, s] of ash) { const yy = 760 + (((ay + t * rq(0.12) * s) % 1)) * (GR - 760), xx = SX0 + ((ax - t * rq(0.05)) % 1 + 1) % 1 * 800; ctx.fillRect(xx, yy, 2.5 * s, 2.5 * s); }
    ctx.restore();
    // zemin ve kısmen yeraltındaki taş hücre
    ctx.fillStyle = PAPER2; ctx.fillRect(SX0 - 40, GR, 900, 420);
    ctx.save(); ctx.beginPath(); ctx.rect(SX0 - 40, GR, 900, 420); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1.2; for (let k = -200; k < 1300; k += 11) { ctx.beginPath(); ctx.moveTo(k, GR + 420); ctx.lineTo(k + 420, GR); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(SX0 - 40, GR); ctx.lineTo(1100, GR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    const CXL = 430, CXR = 820, CT = 900, CB = 1250, WT = 46;
    ctx.fillStyle = C.paper; ctx.fillRect(CXL, CT, CXR - CXL, CB - CT);
    // taş duvar (tuğla deseni), iç oda boş kâğıt
    ctx.save(); ctx.beginPath(); ctx.rect(CXL, CT, CXR - CXL, CB - CT); ctx.rect(CXL + WT, CT + WT, CXR - CXL - 2 * WT, CB - CT - 2 * WT); ctx.clip('evenodd');
    ctx.fillStyle = PAPER2; ctx.fillRect(CXL, CT, CXR - CXL, CB - CT); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
    for (let r = 0; r * 23 < CB - CT; r++) for (let c = -1; c * 46 < CXR - CXL; c++) ctx.strokeRect(CXL + c * 46 + (r % 2) * 23, CT + r * 23, 46, 23);
    ctx.restore();
    ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.strokeRect(CXL, CT, CXR - CXL, CB - CT); ctx.strokeRect(CXL + WT, CT + WT, CXR - CXL - 2 * WT, CB - CT - 2 * WT);
    // kapı (yanardağa ters yönde, solda) ve dar ızgara
    const doorOpen = ease.state(seg(t, T.rescue - 0.3, 0.6));
    ctx.fillStyle = C.paper; ctx.fillRect(CXL - 2, 1080, WT + 4, 140);
    ctx.save(); ctx.translate(CXL, 1080); ctx.rotate(-1.2 * doorOpen); ctx.fillStyle = PAPER2; ctx.fillRect(0, 0, 14, 140); ctx.lineWidth = 3; ctx.strokeRect(0, 0, 14, 140); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(2, 20 + i * 9); ctx.lineTo(12, 20 + i * 9); ctx.lineWidth = 2; ctx.stroke(); } ctx.restore();
    // Sylbaris: içeride çömelmiş; kurtarılınca kapıdan dışarı çıkar
    const out = ease.state(seg(t, T.rescue + 0.2, 1.4));
    ctx.save(); ctx.translate(lerp(620, 462, seg(out, 0.35, 0.65)), CB - WT); if (out > 0.35) ctx.scale(-1, 1); drawPerson(ctx, SYLBARIS_CARD, out > 0 ? mixPersonPose(PP.crouch, PP.stand, Math.min(1, out / 0.35)) : PP.crouch, 230); ctx.restore();
    // yanardağ yönü: sağ üstte siluet
    ctx.beginPath(); ctx.moveTo(900, GR); ctx.lineTo(1010, 820); ctx.lineTo(1040, 830); ctx.lineTo(1150, GR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
    chip(t >= T.rescue ? 'GÜNLER SONRA' : 'TAŞ HÜCRE', 330 + dx, 1376, ease.enter(seg(t, T.cell + 0.2, 0.4)));
  }

  // ——— sahne: sirk afişi ———
  function poster(t, dx) {
    const z = 1 + 0.14 * seg(t, T.circus, T.cmp0 - T.circus);
    ctx.save(); ctx.translate(dx, 0); ctx.translate(575, 1060); ctx.scale(z, z); ctx.translate(-650, -1060);
    const X0 = 350, X1 = 800, Y0 = 770, Y1 = 1320;
    ctx.fillStyle = PAPER2; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.strokeRect(X0, Y0, X1 - X0, Y1 - Y0); ctx.lineWidth = 2; ctx.strokeRect(X0 + 14, Y0 + 14, X1 - X0 - 28, Y1 - Y0 - 28);
    // tepe ışıkları: sırayla yanıp söner (sürekli döngü; parlama yok, dolgu değişir)
    for (let i = 0; i < 8; i++) { const on = Math.floor(t * rq(4) + i) % 3 === 0; ctx.beginPath(); ctx.arc(X0 + 50 + i * 50, Y0 + 44, 10, 0, Math.PI * 2); ctx.fillStyle = on ? C.ink : PAPER2; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); }
    setFont(ctx, F.head(54)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('BARNUM &', (X0 + X1) / 2, Y0 + 118); ctx.fillText('BAILEY', (X0 + X1) / 2, Y0 + 172);
    // sahne ışığı konisi (tarama, yavaşça döner) ve figür
    ctx.save(); { const cxp = (X0 + X1) / 2, a = 0.24 * Math.sin(t * wq(1.6)); ctx.translate(cxp, Y0 + 200); ctx.rotate(a); ctx.translate(-cxp, -(Y0 + 200)); } ctx.beginPath(); ctx.moveTo((X0 + X1) / 2 - 30, Y0 + 200); ctx.lineTo(X0 + 80, Y1 - 60); ctx.lineTo(X1 - 80, Y1 - 60); ctx.lineTo((X0 + X1) / 2 + 30, Y0 + 200); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.25)'; ctx.lineWidth = 1.2; for (let k = -600; k < 600; k += 10) { ctx.beginPath(); ctx.moveTo((X0 + X1) / 2 + k, Y0 + 200); ctx.lineTo((X0 + X1) / 2 + k * 1.4, Y1); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate((X0 + X1) / 2, Y1 - 70); drawPerson(ctx, SYLBARIS_CARD, { ...PP.wave, sh: [-14, 150 + 18 * Math.sin(t * wq(5))], el: [8, 10 + 20 * Math.sin(t * wq(5) + 1)] }, 250); ctx.restore();
    ctx.beginPath(); ctx.moveTo(X0 + 60, Y1 - 68); ctx.lineTo(X1 - 60, Y1 - 68); ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
  }

  // ——— sahne: aynı termometrede kıyas ———
  function cmpScene(t, dx) {
    const lab = (s, y, a, col = C.ink, icon = null) => {
      if (a <= 0) return; const x0 = TH.x + 150 + dx;
      ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(TH.x + 116, y); ctx.lineTo(x0 - 28, y); ctx.lineWidth = 2; ctx.strokeStyle = col === C.red ? C.red : C.graphite; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]);
      setFont(ctx, F.mono(40)); const tw = ctx.measureText(s).width; ctx.globalAlpha = Math.min(1, a * 4); ctx.fillStyle = C.paper; ctx.fillRect(x0 - 24, y - 48, tw + 48, 78); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y + 12);
      if (icon) icon(x0 + tw + 50, y);
      ctx.restore();
    };
    const a1 = ease.enter(seg(t, T.cmp0 + 0.2, 0.4)), a2 = ease.enter(seg(t, T.cmp0 + 0.4, 0.4)), a3 = ease.enter(seg(t, T.cmp0 + 0.6, 0.4));
    const out = 1 - ease.exit(seg(t, T.ask - 0.25, 0.25));
    // kar (soğuk bölge) ve kül (sıcak bölge) etiketlerin arkasında
    { const k0 = ease.enter(seg(t, T.cmp0, 0.6)) * out; if (k0 > 0) { ctx.save(); ctx.globalAlpha = k0;
      ctx.fillStyle = C.ink; for (const [sx, sy, sp] of snow) { const yy = yT(37) + 30 + (((sy + t * rq(0.2 * sp)) % 1)) * (yT(0) - yT(37) + 40), xx = SX0 + 20 + sx * 560 + dx + 10 * Math.sin(t * wq(1) + sx * 30); ctx.beginPath(); ctx.arc(xx, yy, 4.2 * sp, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(28,27,24,0.55)'; for (const [ax, ay, s2] of ash) { const yy = yT(100) + 10 - (((ay + t * rq(0.25 * s2)) % 1)) * (yT(100) - STAGE_TOP + 10), xx = SX0 + 20 + ax * 640 + dx; ctx.fillRect(xx, yy, 5 * s2, 5 * s2); }
      ctx.restore(); } }
    const pre = 1 - ease.exit(seg(t, T.hit, 0.3));
    lab('SU KAYNAR · 100 °C', yT(100), a1 * out * pre);
    lab('NORMAL VÜCUT · 37 °C', yT(37), (t >= T.w37 - 0.04 ? 1 : a2) * out * pre);
    lab('SU DONAR · 0 °C', yT(0), a3 * out);
    const big = (s1, s2, y, a, col, icon) => {
      if (a <= 0) return; const x0 = TH.x + 150 + dx;
      ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); if (col === C.red) { ctx.moveTo(TH.x + TH.tw / 2 + 8, yT(350)); ctx.lineTo(TH.x + TH.tw / 2 + 40, y); } else ctx.moveTo(TH.x + TH.tw / 2 + 20, y); ctx.lineTo(x0 - 28, y); ctx.lineWidth = col === C.red ? 4 : 3; ctx.strokeStyle = col; ctx.stroke();
      setFont(ctx, F.mono(40)); const w1 = ctx.measureText(s1).width; setFont(ctx, F.head(72)); const w2 = ctx.measureText(s2).width;
      ctx.globalAlpha = Math.min(1, a * 4); ctx.fillStyle = C.paper; ctx.fillRect(x0 - 26, y - 92, Math.max(w1, w2) + 52, 146); ctx.globalAlpha = a; setFont(ctx, F.mono(40)); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s1, x0, y - 36); setFont(ctx, F.head(72)); ctx.fillText(s2, x0, y + 30);
      if (icon) icon(x0 + Math.max(w1, w2) + 70, y); ctx.restore();
    };
    big('ANNA', '13,7 °C', yT(13.7), (t >= T.anna - 0.04 ? ease.enter(seg(t, T.anna - 0.04, 0.4)) : 0) * out, C.ink, (x, y) => { ctx.save(); ctx.translate(x, y); ctx.rotate(t * wq(0.4)); drawCrystal(ctx, 80); ctx.restore(); });
    // doruk: bulut tepeden termometreye iner (sessizliğin sonunda), sayı "üç"te kırmızı
    const cl = ease.enter(seg(t, T.hit, 0.45));
    // iki sürekli döngü: altta dönen buz kristali, üstte kabaran bulut (doruğun vuruşunda değerine iner)
    { const k0 = ease.enter(seg(t, T.cmp0 + 0.3, 0.5)) * out; if (k0 > 0) { ctx.save(); ctx.globalAlpha = k0; ctx.translate(760 + dx, yT(0)); ctx.rotate(t * wq(0.5)); drawCrystal(ctx, 60); ctx.restore();
      ctx.save(); ctx.globalAlpha = k0; ctx.translate(lerp(890 + 12 * Math.sin(t * wq(0.7)), 850, cl) + dx, lerp(905, 790, cl)); drawAshCloud(ctx, lerp(130, 170, cl), t * rq(0.35), 5); ctx.restore(); } }
    big('KENTE ULAŞAN BULUT', t >= T.w400 - 0.04 ? '350–400 °C' : '350 °C', 820, (t >= T.hit ? ease.enter(seg(t, T.hit, 0.3)) : 0) * out, C.red);
    const nk = (t >= T.hit + 0.35 ? ease.enter(seg(t, T.hit + 0.35, 0.4)) : 0) * out;
    if (nk > 0) { const x0 = TH.x + 150 + dx; ctx.save(); ctx.globalAlpha = nk; setFont(ctx, F.mono(40)); const nw = ctx.measureText('YANIK İZLERİNE GÖRE').width; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 26, 870, nw + 52, 112); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText('TAHMİNİ · KENTTEKİ', x0, 912); ctx.fillText('YANIK İZLERİNE GÖRE', x0, 958); ctx.restore(); }
  }

  // ——— açılış ve soru karesi: iki büyüteç ———
  function intro(t, dx) {
    const zr = 0.035, zi = t < T.ask ? 1 + zr * t : 1 - zr * (D - t);
    ctx.save(); ctx.translate(600 + dx, 1010); ctx.scale(zi, zi); ctx.translate(-600 - dx, -1010);
    const R1 = { x: 470 + dx, y: 965, r: 162 }, R2 = { x: 728 + dx, y: 1058, r: 150 };
    const ph = t;
    // Anna: buzun altında, hava cebinde; kabarcıklar
    ctx.save(); ctx.beginPath(); ctx.arc(R1.x, R1.y, R1.r, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.clip();
    ctx.fillStyle = C.paper; ctx.fillRect(R1.x - 200, R1.y - 200, 400, 110);
    ctx.save(); ctx.beginPath(); ctx.rect(R1.x - 200, R1.y - 90, 400, 22); ctx.clip(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; for (let k = -220; k < 220; k += 8) { ctx.beginPath(); ctx.moveTo(R1.x + k, R1.y - 68); ctx.lineTo(R1.x + k + 22, R1.y - 90); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(R1.x - 200, R1.y - 68); ctx.lineTo(R1.x + 200, R1.y - 68); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.strokeStyle = 'rgba(28,27,24,0.3)'; ctx.lineWidth = 1.4; for (const [fx, fy, len] of flow.slice(0, 16)) { const x = R1.x - 200 + (((fx - ph * rq(0.22)) % 1 + 1) % 1) * 400, y = R1.y - 40 + fy * 180; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * 0.6, y); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(R1.x - 10, R1.y - 68, 70, 30, 0, 0, Math.PI); ctx.fillStyle = PAPER2; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.translate(R1.x - 37, R1.y + 76 + 4 * Math.sin(ph * wq(2.4))); drawPerson(ctx, ANNA_CARD, PP.float, 150); ctx.restore();
    for (const [bx, by, sp] of bubbles) { const p2 = ((by + ph * rq(0.7 * sp)) % 1); const yy = R1.y + 80 - p2 * 120; if (yy < R1.y - 60) continue; ctx.beginPath(); ctx.arc(R1.x + 20 + (bx - 0.5) * 70, yy, 4 + bx * 6, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.restore(); ctx.beginPath(); ctx.arc(R1.x, R1.y, R1.r, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    cellRoundel(R2.x, R2.y, R2.r, ph);
    chip('ANNA', R1.x, R1.y + R1.r - 22, 1, 'center');
    chip('SYLBARIS', R2.x, R2.y + R2.r - 22, 1, 'center');
    ctx.restore();
  }

  // Sylbaris'in hücresi (büyüteç): taş duvar, çömelmiş figür, dışarıda kayan kül; ölçü r = 150 için çizilir
  function cellRoundel(x, y, r, ph, ashK = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(r / 150, r / 150);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.fillStyle = PAPER2; ctx.fill(); ctx.clip();
    ctx.save(); ctx.globalAlpha *= ashK;
    ctx.fillStyle = 'rgba(28,27,24,0.55)'; for (const [ax, ay, s2] of ash.slice(0, 40)) { const yy = -150 + (((ay + ph * rq(0.3 * s2)) % 1)) * 300, xx = -150 + ((ax - ph * rq(0.1)) % 1 + 1) % 1 * 300; ctx.fillRect(xx, yy, 4.5 * s2, 4.5 * s2); }
    for (let i = 0; i < 2; i++) { const cx = 200 - (((ph * rq(0.32) + i * 0.5) % 1)) * 420; ctx.save(); ctx.translate(cx, -105); drawAshCloud(ctx, 200, ph * rq(0.3) + i * 0.4, i + 7); ctx.restore(); }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; for (let rr = 0; rr < 7; rr++) for (let c = -1; c < 7; c++) { const bx = -160 + c * 46 + (rr % 2) * 23, by = -50 + rr * 23; if (bx > -90 && bx < 70 && by > -20 && by < 120) continue; ctx.strokeRect(bx, by, 46, 23); }
    ctx.save(); ctx.translate(-5, 108); drawPerson(ctx, SYLBARIS_CARD, PP.crouch, 160); ctx.restore();
    ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.lineWidth = 4 * 150 / r; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
  }

  function chip(s, x, y, a = 1, al = 'left', col = C.ink, size = 40) {
    if (a <= 0) return; setFont(ctx, F.mono(size)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - size * 0.82, tw + 20, size * 1.18); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(62); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'dusunceli'], [T.fall, 'sasirma', 'saskin'], [T.fall + 1.4, 'ayakta', 'dusunceli'], [T.beat, 'sasirma', 'saskin'], [T.beat + 1.2, 'ayakta', 'dusunceli'],
    [T.adam, 'ayakta', 'saskin'], [L.l09.t0, 'ayakta', 'dusunceli'], [T.erupt, 'sasirma', 'saskin'], [T.erupt + 1.2, 'ayakta', 'dusunceli'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'dusunceli'], [T.loop0 + 0.5, 'ayakta', 'dusunceli']];
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
  function lineText(ln, t) {
    // sayılar söylendikleri kelimeye kadar aynı uzunlukta boşluk çizgisiyle tutulur
    const map = NUMW[ln.id] || {};
    return ln.text.split(' ').map(tok => {
      const key = Object.keys(map).find(k => tok.startsWith(k));
      if (!key || t >= tl.W(ln.id, map[key]) - 0.04) return tok;
      return tok.replace(key, key.replace(/[0-9,]/g, '_'));
    }).join(' ');
  }
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    // bölünmüş kıyas (l15 + l16): l16 boyunca iki cümle birlikte
    const acc = ln.id === 'l16' ? [L.l15, L.l16] : ln.id === 'l16b' ? [L.l15, L.l16, L.l16b] : [ln];
    const full = acc.map(l => l.text).join(' '), txt = acc.map(l => lineText(l, t)).join(' ');
    const p = acc.length > 1 ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, full, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    // satır kırılımları son metinden; gösterilen metin aynı kelime sayısıyla bölünür (sayı açılınca yer değiştirmez)
    const toks = txt.split(' '); let k = 0;
    const shown = ls.map(s => { const n = s.split(' ').length; const r = toks.slice(k, k + n).join(' '); k += n; return r; });
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    shown.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(132)); revealText(ctx, '13,7 °C', SAFE.x0, 488, 132, k, C.ink);
    setFont(ctx, F.head(64)); revealText(ctx, 'Hangisi daha şaşırtıcı?', SAFE.x0, 566, 64, k, C.ink);
    const sub = 'Vücudu 13,7 dereceye düşen doktor mu, yanardağ bulutundan hücresi sayesinde kurtulan adam mı?';
    let fs1 = 40, ls; for (const f of [40, 38, 36]) { fs1 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, sub, SAFE.x1 - SAFE.x0); if (ls.length <= 2) break; }
    ls.slice(0, 2).forEach((l, i) => revealText(ctx, l, SAFE.x0, 630 + i * fs1 * 1.2, fs1, k, C.ink));
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
    if (t < L.l03.t0 - 0.06) return row({ label: 'ANNA BÅGENHOLM · NORVEÇ', num: on(t, T.y1999) ? '1999' : '', right1: 'KAYAK', right2: on(t, T.fall) ? 'BUZU KIRIP DÜŞTÜ' : '', p: pA });
    if (t < L.l04.t0 - 0.06) return row({ label: 'BUZUN ALTINDA · HAVA CEBİ', num: on(t, T.m40) ? '40' : '', unit: on(t, T.m40) ? 'dakika' : '', right1: 'NEHİR', right2: 'BUZ ALTI', p: 1 });
    if (t < L.l05.t0 - 0.06) return row({ label: on(t, T.temp) ? 'VÜCUT SICAKLIĞI' : on(t, T.stop) ? 'KALP DURDU' : 'BUZUN ALTINDA', num: on(t, T.temp) ? '13,7' : '', unit: on(t, T.temp) ? '°C' : '', right1: on(t, T.temp) ? 'HASTANEYE VARIŞTA' : '', right2: on(t, T.temp) ? 'KALP DURMUŞ' : '', p: 1 });
    if (t < L.l06.t0 - 0.06) return row({ label: 'KALP ATMIYOR', num: on(t, T.iki) ? '2 sa 35 dk' : '', right1: on(t, T.iki) ? '19.40–22.15' : '', right2: on(t, T.iki) ? '' : 'KALP MASAJI', p: 1 });
    if (t < T.d10 - 0.06) return row({ label: 'KALP-AKCİĞER MAKİNESİ', num: 'Isıtılıyor', right1: 'KAN', right2: 'MAKİNEDEN GEÇİYOR', p: 1 });
    if (t < L.l08.t0 - 0.06) return row({ label: 'ANNA BÅGENHOLM', num: on(t, T.doctor) ? 'Radyolog' : on(t, T.d10) ? '10' : '', unit: on(t, T.doctor) ? '' : on(t, T.d10) ? 'gün sonra uyanıyor' : '', right1: on(t, T.doctor) ? 'TROMSØ' : '', right2: on(t, T.doctor) ? 'AYNI HASTANEDE' : '', p: 1 });
    if (t < L.l09.t0 - 0.06) return;
    const pB = Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35)));
    if (t < L.l10.t0 - 0.06) return row({ label: 'LUDGER SYLBARIS · MARTİNİK', num: on(t, T.y1902) ? '1902' : '', right1: 'SAINT-PIERRE', right2: on(t, T.cell0) ? 'TAŞ HÜCRE' : '', p: pB });
    if (t < L.l11.t0 - 0.06) return row({ label: 'PELÉE YANARDAĞI', num: on(t, T.erupt) ? 'Patlama' : '', right1: on(t, T.erupt) ? 'KIZGIN KÜL BULUTU' : '', right2: on(t, T.wiped) ? 'BİRKAÇ DAKİKADA' : '', p: 1 });
    if (t < L.l12.t0 - 0.06) return row({ label: 'SAINT-PIERRE', num: on(t, T.deaths) ? '28 bin' : '', unit: on(t, T.deaths) ? 'kişi' : '', right1: on(t, T.deaths) ? 'HAYATINI KAYBETTİ' : '', right2: '', p: 1 });
    if (t < L.l13.t0 - 0.06) return row({ label: 'LUDGER SYLBARIS', num: 'Günler', unit: 'sonra', right1: 'AĞIR YANIKLARLA', right2: on(t, T.rescue) ? 'HÜCREDEN ÇIKARILDI' : '', p: 1 });
    if (t < T.cmp0) return row({ label: 'BARNUM & BAILEY SİRKİ', num: '', right1: '“KIYAMET GÜNÜNÜ', right2: 'ATLATAN ADAM”', p: 1 });
    if (t < L.l15.t0 - 0.06) return row({ label: 'AYNI TERMOMETREDE', num: '?', p: ease.enter(seg(t, T.cmp0, 0.35)) });
    if (t < L.l16.t0 - 0.06) return row({ label: 'ANNA · VÜCUT SICAKLIĞI', num: on(t, T.anna) ? '13,7' : on(t, T.w37) ? '37' : '', unit: on(t, T.w37) ? '°C' : '', right2: on(t, T.anna) ? 'NORMALİ 37 °C' : '', p: 1 });
    if (t < T.ask) return on(t, T.hit) ? row({ label: 'BULUT · TAHMİNİ', num: on(t, T.w400) ? '350–400' : '350', unit: '°C', red: true, right2: on(t, T.w400) ? '' : 'ANNA: 13,7 °C' }) : row({ label: 'DIŞARIDAKİ BULUT', num: '?', right2: 'ANNA: 13,7 °C' });
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Anna mı, Sylbaris mi?', SAFE.x0, 556, 80, p, C.ink);
  }

  // ——— kare ———
  const SCENES = { intro, river, hosp, adam, map: mapScene, cell: cellScene, poster, cmp: cmpScene };
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    // sahne bölgesi (termometre sütununun sağı)
    ctx.save(); ctx.beginPath(); ctx.rect(TH.x + TH.tw / 2 + 4, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // her pano kendi yuvasına kırpılır (opak maske): giden pano yakınlaşmış olsa da gelenin içine taşmaz
    for (const p of panelsAt(t)) { ctx.save(); ctx.beginPath(); const x0 = p.name === 'cmp' ? TH.x + TH.tw / 2 + 4 : SX0 - 10; ctx.rect(x0 + p.dx, STAGE_TOP, W - x0, 1920 - STAGE_TOP); ctx.clip(); SCENES[p.name](t, p.dx); ctx.restore(); }
    ctx.restore();
    thermo(t);
    // takip çağrısı: soru boyunca, döngüden önce söner
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET', SAFE.x0, 626, kf, 'left', C.ink, 44); chip('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 682, kf, 'left', C.ink, 40); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

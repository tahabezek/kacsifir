// "Katman" şablonu: Piramitler bile Göbeklitepe'nin yanında yeni kalıyor.
// Dikey toprak kesiti = DOĞRUSAL zaman (yukarısı bugün; her yıl aynı derinlik). Kare 0'da önde dev bir T-sütunu,
// arkada küçücük bir piramit; sütun kesmede kendi katmanına (MÖ 9500) iner. Kamera katmanlar arasında gezer: yazı ve
// tekerlek çok yukarıda, piramit 7.000 yıl yukarıda. Doruk: kesitteki iki aralık yatay çubuklara döner ve yan yana
// kıyaslanır (Göbeklitepe→piramit ≈ 7.000 yıl kırmızı; piramit→bugün 4.600). Sonra mamut ve Kleopatra.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { drawTPillar, drawPyramid, drawMammoth, drawTablet, drawWheel, drawCoin, drawBootprint, drawWheat, drawPhone, drawLander } from '../katman_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// kesit: ekran ortası CY; dünya birimi K px/yıl (z = 1'de)
const CY = 1062, K = 0.0533, RULER = 112, ITEM_X = 480;
// yıl önce (2026'dan): Göbeklitepe MÖ 9500, yazı ~MÖ 3200, tekerlek ~MÖ 3500, Keops MÖ 2560, son mamutlar ~4.000,
// Kleopatra MÖ 30, Ay'a iniş 1969
const Y = { gt: 11525, writing: 5225, wheel: 5525, pyramid: 4585, mammoth: 4000, cleo: 2055, moon: 57 };
// doruk çubukları (aynı ölçek: 0,1 px/yıl)
const BAR = { x0: 110, k: 0.1, yA: 1262, yB: 1346 };

export function katmanTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    poster1: L.l02.t0 - 0.35, gt: Wd('l02', 'göbeklitepe'), writing: Wd('l03', 'yazı'), wheel: Wd('l03', 'tekerlek'), hunters: Wd('l03', 'avcı'),
    pyr: Wd('l04', 'keops'), dort: Wd('l04', 'dört'), onbir: Wd('l02', 'on'), gap: L.l05.t0, hero: L.l06.t0 - 0.04, today: L.l07.t0, mammoth: Wd('l08', 'mamutlar'), cleo: Wd('l09', 'kleopatra'),
    moon: Wd('l09', "ay'a"), end: L.l09.end, loop0: tl.loop0,
  };
  T.poster2 = T.poster1 + 0.8;
  return T;
}

export async function makeKatmanRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = katmanTimes(tl);

  // ——— kamera: {c: ekran ortasındaki yıl, z: yakınlık}; z log uzayında, durum eğrisiyle ———
  const K0 = { c: 10900, z: 3.2 };
  const keys = [
    [T.poster1, 0.8, () => ({ c: 10900, z: 3.2 })],
    [L.l02.t0 + 0.5, 4.0, t => ({ c: 10900 - 260 * seg(t, L.l02.t0 + 0.5, L.l04.t0 - L.l02.t0 - 0.5), z: 3.2 })],
    [L.l04.t0 - 0.1, T.dort - L.l04.t0 + 0.25, t => ({ c: 4900 - 120 * seg(t, T.dort + 0.15, T.gap - T.dort - 0.15), z: 3.2 })],
    [T.gap, 1.1, t => ({ c: 6000 - 160 * seg(t, T.gap + 1.1, L.l08.t0 - T.gap - 1.1), z: 1.0 })],
    [L.l08.t0 - 0.1, 1.0, t => ({ c: 4150 - 140 * seg(t, L.l08.t0 + 0.9, L.l09.t0 - L.l08.t0 - 0.9), z: 4.0 })],
    [L.l09.t0 - 0.1, 1.0, t => ({ c: 2974 - 90 * seg(t, L.l09.t0 + 0.9, T.end - L.l09.t0 - 0.9) + 700 * seg(t, T.end, T.loop0 - T.end), z: 2.0 })],
    // döngü: kamera Göbeklitepe katmanına iner, sütun oradan afişe kalkar
    [T.loop0, 0.55, () => ({ c: 10900, z: 3.2 })],
  ];
  function cam(t) {
    let cur = K0;
    for (const [t0, dur, to] of keys) {
      if (t < t0) break;
      const target = to(t), u = ease.state(seg(t, t0, dur));
      cur = u >= 1 ? target : { c: lerp(cur.c, target.c, u), z: Math.exp(lerp(Math.log(cur.z), Math.log(target.z), u)) };
    }
    return cur;
  }
  const sy = (yr, cm) => CY + (yr - cm.c) * K * cm.z;
  const sizeK = z => clamp01((z - 0.75) / (3.2 - 0.75)) * 0.6 + 0.45;

  // ——— afiş (kare 0 ve döngü sonu): önde dev T-sütunu, arkada küçücük piramit ———
  // afiş → kesit geçişi: sütun kendi katmanındaki yerine iner (nesne kesmeyi taşır)
  const posterK = t => t < T.poster1 ? 1 : t < T.poster2 ? 1 - ease.state(seg(t, T.poster1, 0.8)) : t >= T.loop0 + 0.5 ? ease.state(seg(t, T.loop0 + 0.5, D - T.loop0 - 0.8)) : 0;
  const rnd = mulberry32(45);
  const waves = Array.from({ length: 40 }, () => [rnd() * 6, 0.6 + rnd() * 0.8]);
  const grains = Array.from({ length: 120 }, () => [rnd(), rnd()]);

  // geçişte ufuk (zemin) çizgisi: afişte y 1180; kesite geçerken sahne tepesine yükselir, altında katmanlar açılır
  const horizonY = pk => lerp(STAGE_TOP - 4, 1180, ease.state(pk));
  function poster(t, pk) {
    if (pk <= 0) return;
    const hy = horizonY(pk);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, hy - STAGE_TOP + (pk >= 0.999 ? 400 : 2)); ctx.clip();
    // açılışta %8 doğrusal itme; döngü sonunda %98'den kare 0'daki %100'e (aynı yön)
    const z = t < T.loop0 ? 1 + 0.08 * seg(t, 0, T.poster1) : 1 - 0.02 * (1 - seg(t, T.loop0 + 0.5, D - T.loop0 - 0.5));
    ctx.translate(540, 1300); ctx.scale(z, z); ctx.translate(-540, -1300);
    // kuş: gökyüzünde süzülür (kare 0'dan itibaren küçük bir eylem)
    { const u = ((t + 0.4) % 6) / 6, bx = lerp(980, 120, u), by = 880 + Math.sin(u * 9) * 14, f = Math.sin(t * 9) * 7; ctx.beginPath(); ctx.moveTo(bx - 16, by - f); ctx.quadraticCurveTo(bx - 6, by - 4, bx, by); ctx.quadraticCurveTo(bx + 6, by - 4, bx + 16, by - f); ctx.lineWidth = 2.4; ctx.strokeStyle = C.ink; ctx.stroke(); }
    if (pk >= 0.999) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = 1186; y < 1420; y += 9) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    ctx.beginPath(); ctx.moveTo(0, 1180); ctx.quadraticCurveTo(300, 1150, 600, 1176); ctx.quadraticCurveTo(820, 1190, 1080, 1168); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    // piramit: geçişte küçülüp yukarı, kendi (daha genç) katmanının yönüne çekilir
    const u = ease.state(1 - pk);
    ctx.save(); ctx.translate(780, lerp(1180, 760, u)); drawPyramid(ctx, lerp(190, 90, u), { ground: false }); ctx.restore();
    ctx.restore();
    // ufuk çizgisi (geçişte yükselen zemin)
    if (pk < 0.999) { ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(W, hy); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    // afiş etiketleri: "yıl önce" (süre değil); geçişte hızla söner
    const la = pk * pk * pk; if (la > 0.01) { chip('GÖBEKLİTEPE', 540, 900, la, C.ink, 30); chip('11.500 YIL ÖNCE', 540, 944, la, C.ink, 30); chip('KEOPS · 4.600 YIL ÖNCE', 560, 1056, la, C.ink, 30); }
  }
  // geçişte sütunun konumu ve boyu (afişte büyük; kesitte katmanında)
  function pillarPose(t, cm, pk) {
    const sec = { x: 430, y: sy(Y.gt, cm) + 24, s: 210 * sizeK(cm.z) };
    const pos = { x: 330, y: 1412, s: 640 };
    const u = ease.state(1 - pk);
    // boy log uzayında değişir (tek kamera dönüşümü gibi)
    return { x: lerp(pos.x, sec.x, u), y: lerp(pos.y, sec.y, u), s: Math.exp(lerp(Math.log(pos.s), Math.log(sec.s), u)) };
  }

  // ——— kesit ———
  function section(t, cm, top) {
    if (top >= 1180) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, top, W, 1440 - top); ctx.clip();
    const y0 = sy(0, cm);
    // gökyüzü (bugünün üstü) kâğıt; toprak katmanları 500 yılda bir
    const step = 500, yrTop = cm.c - (CY - STAGE_TOP) / (K * cm.z), yrBot = cm.c + (1440 - CY) / (K * cm.z);
    for (let i = Math.max(0, Math.floor(yrTop / step)); i * step < yrBot && i < 30; i++) {
      const a = sy(i * step, cm), b = sy((i + 1) * step, cm), [ph, am] = waves[i % waves.length];
      const edge = (y, k) => { for (let x = -10; x <= W + 10; x += 20) { const yy = y + Math.sin(x * 0.012 + ph + k) * am * 4; x === -10 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } };
      ctx.beginPath(); edge(a, 0); for (let x = W + 10; x >= -10; x -= 20) ctx.lineTo(x, b + Math.sin(x * 0.012 + waves[(i + 1) % waves.length][0]) * waves[(i + 1) % waves.length][1] * 4); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#E6DCC6' : '#EDE4D0'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.16)'; ctx.lineWidth = 1; const g = i % 3 === 0 ? 7 : i % 3 === 1 ? 10 : 13;
      for (let y = a - 8; y < b + 8; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 3); ctx.stroke(); }
      ctx.fillStyle = 'rgba(28,27,24,0.35)'; for (let k = 0; k < 24; k++) { const [u, v] = grains[(i * 24 + k) % grains.length]; ctx.fillRect(u * W, a + v * (b - a), 2.5, 2.5); }
      ctx.restore();
      ctx.beginPath(); edge(a, 0); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.stroke();
    }
    // yüzey: bugün (çim çizgisi, küçük şehir silueti)
    if (y0 > STAGE_TOP - 60) {
      ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, Math.max(0, y0 - STAGE_TOP));
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const x = 600 + i * 46, h = 22 + ((i * 37) % 30); ctx.beginPath(); ctx.rect(x, y0 - h, 34, h); ctx.fill(); ctx.stroke(); }
      for (let x = 20; x < 560; x += 14) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 4, y0 - 8); ctx.lineWidth = 1.4; ctx.stroke(); }
    }
    // cetvel: 1.000 yılda bir (yakında 500)
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(RULER, Math.max(STAGE_TOP, y0)); ctx.lineTo(RULER, 1440); ctx.stroke();
    const tick = cm.z >= 2.5 ? 500 : 1000, every = cm.z < 1.3 ? 2000 : 1000;
    setFont(ctx, F.mono(30)); ctx.textAlign = 'left';
    for (let yr = 0; yr <= 12000; yr += tick) {
      const y = sy(yr, cm); if (y < STAGE_TOP + 20 || y > 1420) continue;
      const big = yr % 1000 === 0; ctx.beginPath(); ctx.moveTo(RULER, y); ctx.lineTo(RULER + (big ? 22 : 12), y); ctx.lineWidth = big ? 2.5 : 1.5; ctx.strokeStyle = C.ink; ctx.stroke();
      // balon açıkken altındaki etiketler söner (balonun arkasında yazı kalmaz)
      const hid = roundOpen > 0.02 && y > ROUND.y - ROUND.r - 26;
      if (big && !hid && yr % every === 0) { const s = yr === 0 ? 'BUGÜN' : nf0.format(yr), tw = ctx.measureText(s).width; ctx.fillStyle = C.paper; ctx.fillRect(RULER + 26, y - 20, tw + 12, 38); ctx.fillStyle = C.ink; ctx.fillText(s, RULER + 32, y + 10); }
    }
    if (y0 > STAGE_TOP + 10) { setFont(ctx, F.mono(30)); const s = 'YIL ÖNCE ↓', tw = ctx.measureText(s).width; ctx.fillStyle = C.paper; ctx.fillRect(RULER + 26, y0 + 30, tw + 12, 38); ctx.fillStyle = C.graphite; ctx.fillText(s, RULER + 32, y0 + 60); }
    ctx.restore();
  }

  // katmandaki nesneler ve etiketleri; görünürlük z'ye göre
  const roundOpenAt = t => { const r = sched(t); return r.kind ? r.k : 0; };
  let roundOpen = 0;
  function chip(s, x, y, a = 1, col = C.ink, size = 32, al = 'left') {
    if (a <= 0) return; setFont(ctx, F.mono(size)); const tw = ctx.measureText(s).width; let x0 = al === 'left' ? x : al === 'right' ? x - tw : x - tw / 2; x0 = Math.max(SAFE.x0, Math.min(x0, 910 - tw));
    // Sıfır'ın başı ve gövdesi (x ≥ 780, y ≥ 1280) üstüne düşen etiket söner
    if (x0 + tw > 760 && y > 1230) a *= clamp01((1260 - y) / 30);
    if (roundOpen > 0.02 && x0 < ROUND.x + ROUND.r + 10 && y > ROUND.y - ROUND.r - 30) a *= 1 - roundOpen; if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 8, y - size * 0.82, tw + 16, size * 1.24); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }
  function items(t, cm, top) {
    if (top >= 1180) return null;
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1440 - top); ctx.clip();
    const sk = sizeK(cm.z), at = {};
    const vis = y => y > STAGE_TOP - 120 && y < 1560;
    const lab = cm.z >= 1.6 ? 1 : clamp01((cm.z - 1.1) / 0.5);
    // sürprizler kendi satırlarında belirir: mamut l08'de, Kleopatra ve Ay izi l09'da
    const aM = ease.enter(seg(t, L.l08.t0 - 0.3, 0.5)), aC = ease.enter(seg(t, L.l09.t0 - 0.3, 0.5));
    // boş yıllar: yazının olmadığı uzun katmanlar seyrek işaretlenir
    for (const yr of [10500, 9000, 7500, 6200]) { const y = sy(yr, cm); if (y > STAGE_TOP + 30 && y < 1250) chip('· YAZI YOK ·', 640, y + 10, lab * 0.9, C.graphite, 30); }
    // Ay'a iniş (1969): çizme izi + küçük ay modülü
    let y = sy(Y.moon, cm); if (vis(y) && aC > 0) { ctx.save(); ctx.globalAlpha *= aC; ctx.save(); ctx.translate(ITEM_X - 30, y); ctx.rotate(-0.4); drawBootprint(ctx, 48 * sk); ctx.restore(); ctx.save(); ctx.translate(ITEM_X + 30, y + 14); drawLander(ctx, 52 * sk); ctx.restore(); chip("AY'A İNİŞ · 1969", ITEM_X + 70, y + 12, lab, C.ink, 30); at.moon = [ITEM_X, y]; ctx.restore(); }
    // Kleopatra (MÖ 30)
    y = sy(Y.cleo, cm); if (vis(y) && aC > 0) { ctx.save(); ctx.globalAlpha *= aC; ctx.save(); ctx.translate(ITEM_X, y); drawCoin(ctx, 74 * sk); ctx.restore(); chip('KLEOPATRA · MÖ 30', ITEM_X + 60, y + 12, lab, C.ink, 30); at.cleo = [ITEM_X, y]; ctx.restore(); }
    // mamutlar: derinden ~4.000'e kadar uzanan "MAMUTLAR YAŞIYOR" bandı piramit katmanını örter; mamut piramidin yanında yürür
    if (aM > 0) {
      const yTop = sy(Y.mammoth, cm), yBot = Math.min(1440, sy(12000, cm));
      ctx.save(); ctx.globalAlpha *= aM;
      ctx.beginPath(); ctx.rect(744, yTop, 30, yBot - yTop); ctx.fillStyle = C.paper; ctx.fill(); ctx.save(); ctx.clip(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; for (let d = yTop - 40; d < yBot; d += 8) { ctx.beginPath(); ctx.moveTo(740, d); ctx.lineTo(780, d + 26); ctx.stroke(); } ctx.restore();
      ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(744, yTop, 30, yBot - yTop);
      chip('MAMUTLAR YAŞIYOR', 560, yTop - 18, lab, C.ink, 30); chip('~4.000 YIL ÖNCEYE KADAR', 560, yTop + 24, lab * (cm.z > 3 ? 1 : 0), C.graphite, 28);
      const yw = sy(4300, cm), walk = t >= L.l08.t0 - 0.2 && t < T.loop0, mx = walk ? lerp(190, 360, seg(t, L.l08.t0 - 0.2, T.end - L.l08.t0 + 0.4)) : 360;
      if (vis(yw)) { ctx.save(); ctx.translate(mx, yw + 6); drawMammoth(ctx, 120 * sk, walk ? t : 0); ctx.restore(); at.mammoth = [mx, yw - 30 * sk]; }
      ctx.restore();
    }
    // Keops Piramidi (MÖ 2560)
    y = sy(Y.pyramid, cm); if (vis(y)) { ctx.save(); ctx.translate(ITEM_X, y); drawPyramid(ctx, 190 * sk); ctx.restore(); chip('KEOPS · 4.600', ITEM_X + 110 * sk, y - 20, lab, C.ink, 30); at.pyr = [ITEM_X, y - 60 * sk]; }
    // yazı ve tekerlek: simgeler sağda, kısa etiketler solda (Sıfır'a ve birbirine binmez)
    y = sy(Y.writing, cm); if (vis(y)) { ctx.save(); ctx.translate(640, y); drawTablet(ctx, 64 * sk); ctx.restore(); chip('İLK YAZI · ~5.200', 250, y + 10, lab * underFollow(t, y + 10), C.ink, 30); }
    y = sy(Y.wheel, cm); if (vis(y)) { ctx.save(); ctx.translate(640, y); drawWheel(ctx, 48 * sk); ctx.restore(); chip('TEKERLEK · ~5.500', 250, y + 10, lab * underFollow(t, y + 10), C.ink, 30); }
    // Göbeklitepe çemberi: arka duvar yayı (öndeki büyük sütun geçiş katmanında çizilir)
    y = sy(Y.gt, cm); if (vis(y)) {
      ctx.save(); ctx.translate(480, y + 24); ctx.beginPath(); ctx.ellipse(0, 0, 230 * sk, 46 * sk, 0, Math.PI, 0); ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; ctx.stroke();
      for (let k = 0; k < 9; k++) { const a = Math.PI + (k + 0.5) * Math.PI / 9, px = Math.cos(a) * 230 * sk, py = Math.sin(a) * 46 * sk; ctx.save(); ctx.translate(px, py); drawTPillar(ctx, 52 * sk, { relief: 0 }); ctx.restore(); }
      ctx.restore();
      ctx.save(); ctx.translate(560, y + 24); drawTPillar(ctx, 190 * sk, { relief: 0.6 }); ctx.restore();
      chip('GÖBEKLİTEPE · 11.500', 600, y - 150 * sk, lab, C.ink, 30); at.gt = [470, y - 80 * sk];
    }
    ctx.restore();
    return at;
  }

  // ——— yukarı oklar (l03): yazı ve tekerlek çok sonra ———
  function upArrows(t, cm) {
    const a = ease.enter(seg(t, T.writing - 0.1, 0.4)) * (1 - ease.exit(seg(t, L.l04.t0, 0.3)));
    const b = ease.enter(seg(t, T.wheel - 0.1, 0.4)) * (1 - ease.exit(seg(t, L.l04.t0, 0.3)));
    if (a <= 0 && b <= 0) return;
    chip('↑ İLK YAZI: 6.300 yıl sonra', 380, 790, a, C.ink, 34);
    chip('↑ TEKERLEK: 6.000 yıl sonra', 380, 846, b, C.ink, 34);
  }

  // ——— doruk: kesit söner; aynı zaman ekseni yatay tek çizgide (soldan sağa: geçmiş → bugün, doğrusal) ———
  const LY = 1000, AX0 = 190, AX1 = 860;
  function overlay(k) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1440 - STAGE_TOP); ctx.restore(); }
  function spanLabel(x1, x2, num, col, a, sub, subAl = 'center') {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1 + 4, LY + 88); ctx.lineTo(x1 + 4, LY + 102); ctx.lineTo(x2 - 4, LY + 102); ctx.lineTo(x2 - 4, LY + 88); ctx.stroke();
    setFont(ctx, F.head(54)); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(num, (x1 + x2) / 2, LY + 166);
    if (sub) { setFont(ctx, F.mono(32)); ctx.fillStyle = C.ink; const sw = ctx.measureText(sub).width; ctx.textAlign = 'left'; const sx = subAl === 'left' ? Math.max(SAFE.x0, x1 - 20) : subAl === 'right' ? Math.min(SAFE.x1, x2 + 20) - sw : (x1 + x2) / 2 - sw / 2; ctx.fillText(sub, sx, LY + 208); }
    ctx.restore();
  }
  function axis(t, k, marks, segs) {
    // marks: [[x, kind, label]]; segs: [[x1, x2, col, w, u]]
    ctx.save(); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.moveTo(AX0, LY); ctx.lineTo(AX1, LY); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
    for (const [x1, x2, col, w, u] of segs) { if (u <= 0) continue; ctx.beginPath(); ctx.moveTo(x1, LY); ctx.lineTo(lerp(x1, x2, u), LY); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); }
    for (const [x, kind, label] of marks) {
      ctx.beginPath(); ctx.arc(x, LY, 9, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.save(); ctx.translate(x, LY - 22);
      if (kind === 'gt') drawTPillar(ctx, 120); else if (kind === 'pyr') drawPyramid(ctx, 150, { ground: false }); else if (kind === 'coin') { ctx.translate(0, -46); drawCoin(ctx, 84); } else if (kind === 'moon') { ctx.save(); ctx.translate(-24, -50); ctx.rotate(-0.4); drawBootprint(ctx, 70); ctx.restore(); ctx.translate(26, -4); drawLander(ctx, 66); }
      else if (kind === 'today') drawPhone(ctx, 96);
      ctx.restore();
      setFont(ctx, F.mono(30)); const tw = ctx.measureText(label).width, lx = Math.max(SAFE.x0, Math.min(x - tw / 2, SAFE.x1 - tw)); ctx.fillStyle = C.paper; ctx.fillRect(lx - 8, LY + 24, tw + 16, 40); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(label, lx, LY + 52);
    }
    ctx.restore();
  }
  function climaxLine(t) {
    const k = ease.state(seg(t, T.gap + 0.5, 0.6)) * (1 - ease.state(seg(t, L.l08.t0 - 0.4, 0.4)));
    if (k <= 0) return;
    overlay(k);
    // eksen boyunca yavaş yaklaşma (%10): sahne hiçbir karede donmaz
    const zz = 1 + 0.1 * seg(t, T.gap + 0.5, L.l08.t0 - T.gap - 0.5); ctx.save(); ctx.translate(540, LY + 80); ctx.scale(zz, zz); ctx.translate(-540, -LY - 80);
    const X = yr => AX1 - yr * ((AX1 - AX0) / Y.gt), red = t >= T.hero - 0.02;
    const uA = ease.state(seg(t, T.gap + 0.9, 1.4)), uB = ease.state(seg(t, T.today - 0.1, 0.9));
    axis(t, k, [[X(Y.gt), 'gt', 'GÖBEKLİTEPE'], [X(Y.pyramid), 'pyr', 'KEOPS'], [X(0), 'today', 'BUGÜN']],
      [[X(Y.gt), X(Y.pyramid), red ? C.red : C.ink, red ? 14 : 8, uA], [X(Y.pyramid), X(0), C.ink, 8, uB]]);
    ctx.save(); ctx.globalAlpha = k;
    spanLabel(X(Y.gt), X(Y.pyramid), t >= T.hero - 0.02 ? '≈ 7.000 YIL' : '?', red ? C.red : C.ink, ease.enter(seg(t, T.gap + 1.6, 0.4)));
    spanLabel(X(Y.pyramid), X(0), '4.600 YIL', C.ink, ease.enter(seg(t, T.today + 0.5, 0.4)));
    // karşılaştırma: iki aralık alt alta, soldan hizalı (aynı ölçek)
    // zaman noktası: Göbeklitepe'den bugüne yavaşça yürür (doğrusal)
    if (uA >= 1) { const ph = ((t - T.gap - 2.3) / 6) % 1; if (ph > 0) { ctx.beginPath(); ctx.arc(lerp(X(Y.gt), X(0), ph), LY, 7, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); } }
    const uC = ease.state(seg(t, T.today + 1.4, 0.8)); if (uC > 0) { const lA = X(Y.pyramid) - X(Y.gt), lB = X(0) - X(Y.pyramid), yA = LY + 262, yB = LY + 300;
      ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(AX0, yA); ctx.lineTo(AX0 + lA * uC, yA); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.beginPath(); const bx = lerp(X(Y.pyramid), AX0, uC); ctx.moveTo(bx, yB); ctx.lineTo(bx + lB, yB); ctx.stroke(); }
    ctx.restore(); ctx.restore();
  }
  // l09: aynı dil: piramit → Kleopatra → Ay'a iniş (Kleopatra Ay'a daha yakın)
  function cleoLine(t) {
    const k = ease.state(seg(t, T.moon - 0.4, 0.6)) * (1 - ease.state(seg(t, T.end + 0.35, 0.4)));
    if (k <= 0) return;
    overlay(k);
    const zz = 1 + 0.1 * seg(t, T.moon - 0.4, T.end + 0.75 - T.moon + 0.4); ctx.save(); ctx.translate(540, LY + 80); ctx.scale(zz, zz); ctx.translate(-540, -LY - 80);
    const X = yr => AX1 - (yr - Y.moon) * ((AX1 - AX0) / (Y.pyramid - Y.moon));
    const u1 = ease.state(seg(t, T.moon - 0.2, 0.8)), u2 = ease.state(seg(t, T.moon + 0.3, 0.8));
    axis(t, k, [[X(Y.pyramid), 'pyr', 'KEOPS'], [X(Y.cleo), 'coin', 'KLEOPATRA'], [X(Y.moon), 'moon', "AY'A İNİŞ"]],
      [[X(Y.pyramid), X(Y.cleo), C.ink, 8, u1], [X(Y.cleo), X(Y.moon), C.ink, 8, u2]]);
    ctx.save(); ctx.globalAlpha = k;
    spanLabel(X(Y.pyramid), X(Y.cleo), '≈ 2.530 YIL', C.ink, ease.enter(seg(t, T.moon + 0.2, 0.4)));
    spanLabel(X(Y.cleo), X(Y.moon), '≈ 2.000 YIL', C.ink, ease.enter(seg(t, T.moon + 0.7, 0.4)));
    ctx.restore(); ctx.restore();
  }

  // ——— büyüteç ———
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    if (kind === 'relief') {
      // tilki kabartması yakın plan: sütunun üst gövdesi, ışık soldan gezer
      ctx.save(); ctx.translate(-10, 340); drawTPillar(ctx, 560, { relief: 1 }); ctx.restore();
      const sx = -130 + ((t * 40) % 260); ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = C.paper; ctx.fillRect(sx, -130, 40, 260); ctx.restore();
    } else if (kind === 'nothing') {
      // yazı, tekerlek, tarım: henüz yok (üstü çizili)
      const items3 = [[-62, -40, 'tablet'], [62, -40, 'wheel'], [0, 60, 'wheat']];
      items3.forEach(([x, y, w], i) => {
        const a = ease.enter(seg(t, [T.writing, T.wheel, T.hunters][i] - 0.1, 0.35)); if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
        if (w === 'tablet') drawTablet(ctx, 74); else if (w === 'wheel') drawWheel(ctx, 64); else drawWheat(ctx, 70);
        ctx.beginPath(); ctx.moveTo(-40, 34); ctx.lineTo(40, -34); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      });
    } else if (kind === 'pyramid') {
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = 50; y < 130; y += 8) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
      const sx = Math.cos(t * 0.5) * 70; ctx.beginPath(); ctx.arc(sx, -70, 16, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.save(); ctx.translate(0, 50); drawPyramid(ctx, 220); ctx.restore();
    } else if (kind === 'mammoth') {
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = 60; y < 130; y += 8) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y); ctx.stroke(); }
      ctx.save(); ctx.translate(70, 60); drawPyramid(ctx, 120, { ground: false }); ctx.restore();
      ctx.save(); ctx.translate(-40 + Math.sin(t * 0.6) * 10, 62); drawMammoth(ctx, 180, t); ctx.restore();
    } else if (kind === 'coin') {
      ctx.save(); ctx.rotate(Math.sin(t * 0.8) * 0.12); drawCoin(ctx, 210); ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const S1 = [[T.poster2, 'relief'], [L.l03.t0, 'nothing'], [L.l04.t0 + 1.6, 'pyramid'], [T.gap, null], [L.l08.t0 + 0.9, 'mammoth'], [L.l09.t0 + 0.8, 'coin'], [T.moon - 0.35, null]];
  function sched(t) {
    let i = -1; for (let k = 0; k < S1.length; k++) if (t >= S1[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S1[i], prev = i > 0 ? S1[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.gt, 'ayakta', 'dusunceli'], [T.pyr, 'sasirma', 'saskin'], [T.pyr + 1.5, 'ayakta', 'notr'], [T.gap, 'ayakta', 'dusunceli'],
    [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.mammoth, 'sasirma', 'saskin'], [T.mammoth + 1.6, 'ayakta', 'mutlu'], [T.end + 0.3, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.hero + 0.1, T.hero + 1.8, '7.000 yıl mı?!', 236]];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    // arkasında kâğıt zemin: katman çizgileri Sıfır'ın içinden geçmez
    ctx.beginPath(); ctx.ellipse(SIFIR.x, SIFIR.y - 52, 62, 72, 0, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text, dy] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = 900 - w, y = SIFIR.y - dy;
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
    // bölünmüş cümle (l05 + l06): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l06' ? L.l05.text + ' ' + ln.text : ln.id === 'l05' ? "Göbeklitepe'den piramitlere ne kadar zaman geçti?" : ln.text;
    const p = ln.id === 'l06' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    let fs = 92; setFont(ctx, F.head(fs)); let ls = wrap(ctx, L.l01.text, SAFE.x1 - SAFE.x0);
    while (ls.length > 3 && fs > 60) { fs -= 4; setFont(ctx, F.head(fs)); ls = wrap(ctx, L.l01.text, SAFE.x1 - SAFE.x0); }
    const lh = fs * 1.04, y0 = 690 - (ls.length - 1) * lh - 8;
    ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs, k, C.ink));
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
    const p = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < L.l04.t0 - 0.06) { const on = t >= T.onbir; row({ label: 'GÖBEKLİTEPE · ŞANLIURFA', num: on ? '11.500' : '', unit: on ? 'yıl önce' : '', right1: on ? 'MÖ 9500' : '', right2: '', p }); return; }
    if (t < T.dort) { const yr = Math.round(lerp(11500, 4600, ease.state(seg(t, L.l04.t0 - 0.1, T.dort - L.l04.t0 + 0.1))) / 100) * 100; row({ label: 'ZAMANDA YUKARI · YIL ÖNCE', num: nf0.format(yr), unit: 'yıl önce', right1: '', right2: '' }); return; }
    if (t < T.gap - 0.06) { row({ label: 'KEOPS PİRAMİDİ · GİZE', num: '4.600', unit: 'yıl önce', right1: 'MÖ 2560', right2: '' }); return; }
    if (t < T.hero) { row({ label: 'GÖBEKLİTEPE → PİRAMİT', num: '?', unit: 'yıl', right1: '', right2: '' }); return; }
    if (t < T.today - 0.06) { row({ label: 'GÖBEKLİTEPE → PİRAMİT', num: '≈ 7.000', unit: 'yıl', red: true, right1: '', right2: '' }); return; }
    if (t < L.l08.t0 - 0.06) { row({ label: 'PİRAMİT → BUGÜN', num: '4.600', unit: 'yıl', right1: '', right2: '' }); return; }
    if (t < L.l09.t0 - 0.06) { row({ label: 'SON MAMUTLAR · WRANGEL ADASI', num: t >= T.mammoth ? '≈ 4.000' : '', unit: t >= T.mammoth ? 'yıl önce' : '', right1: '', right2: '' }); return; }
    if (t < T.loop0) { row({ label: t >= T.moon ? "KLEOPATRA → AY'A İNİŞ" : 'KLEOPATRA', num: t >= T.moon ? '≈ 2.000' : 'MÖ 30', unit: t >= T.moon ? 'yıl' : '', right1: '', right2: '' }); return; }
    // geri sarma: kamera Göbeklitepe'ye inerken
    row({ label: 'BUGÜN → GÖBEKLİTEPE', num: '11.500', unit: 'yıl', right1: '', right2: '', p: 1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)) });
  }
  // takip kutusu açıkken onun bölgesindeki etiketler söner (üst üste binmez)
  function underFollow(t, y) {
    if (y < 1230) return 1;
    return 1 - ease.enter(seg(t, T.end + 0.4, 0.4)) * (1 - ease.exit(seg(t, T.loop0 - 0.25, 0.25)));
  }
  function follow(t) {
    const k = ease.enter(seg(t, T.end + 0.6, 0.4)) * (1 - ease.exit(seg(t, T.loop0 - 0.25, 0.25)));
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; setFont(ctx, F.mono(40));
    const l1 = 'TAKİP ET', l2 = 'HER GÜN YENİ BİR SAYI', w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width);
    const fx = 250; ctx.fillStyle = C.paper; ctx.fillRect(fx - 12, 1286, w + 24, 116); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(fx - 12, 1286, w + 24, 116);
    ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(l1, fx, 1334); ctx.fillText(l2, fx, 1384); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const cm = cam(t), pk = posterK(t), top = pk <= 0.001 ? STAGE_TOP : horizonY(pk);
    roundOpen = roundOpenAt(t);
    section(t, cm, top);
    const at = items(t, cm, top);
    poster(t, pk);
    // geçiş katmanı: T-sütunu afiş ile kesit arasında taşınır (kesitte kendi katmanında)
    { const p = pillarPose(t, cm, pk); ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, (pk > 0.5 ? 1920 : 1440) - STAGE_TOP); ctx.clip(); ctx.translate(p.x, p.y); drawTPillar(ctx, p.s, { relief: 1 }); ctx.restore(); }
    upArrows(t, cm);
    climaxLine(t); cleoLine(t);
    // büyüteç
    const r1 = sched(t);
    const lead = r1.kind === 'relief' || r1.kind === 'nothing' ? at?.gt : r1.kind === 'pyramid' ? at?.pyr : r1.kind === 'mammoth' ? at?.mammoth : r1.kind === 'coin' ? at?.cleo : null;
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, ROUND, r1.k, lead);
    follow(t);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

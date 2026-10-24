// "Deste" şablonu (Kaç Sıfır?): 52 kartın 52! sırası; her karıştırma büyük ihtimalle evrende bir ilk.
// Kare 0: masada tohumlu karışık sırada açılmış yelpaze ve soru başlık. l01: yelpaze kapanır, deste ters döner ve üç kez
// gerçek bir riffle ile karıştırılır (iki paket, görünür kalınlık, iç köşeler bükülür, kartlar 1–3'lük öbeklerle düşer).
// l02 "kart": 52 kapalı kart yuvalara dağıtılır; l03: "elli iki", "elli bir", "elli" kelimelerinde ilk üç kart açılır, sonra
// açılış hızlanır. l04: kartlar desteye toplanır, deste 68 basamaklı sayıyı satır satır basar ("altmış"ta 68). l05: duvar
// paydanın yerine küçülür; altta küre, üstte karıştırma sayacı saatle aynı t'den büyür. l06: kesir çizgisi "oranı"nda.
// l07 (doruk): "0," ve 40 sıfır, sonunda 45 (kırmızı), en az 1,5 sn tutulur. l08: kesir yukarı çekilir, yelpaze Sıfır'ın
// yanından gelir; döngü kare 0'a. Anlatım saattir; her şey t'nin saf işlevidir.
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe } from '../globe.js';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { drawCard } from '../deste_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const BIG = '80658175170943878571660636856403766975289505440883277824000000000000';
const group = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const DECK = { x: 500, y: 1090, h: 420, fanH: 300 };   // masadaki deste (üstten) ve yelpaze kartı
const LOW = { x: 500, y: 1300, h: 150 };              // l02'de yuvaların altına inen deste
const GRID = { cols: 13, rows: 4, h: 84, gap: 5, x0: 93, y0: 770 };
const CARD_FONT = s => `800 ${s}px Archivo`;
const RIF = { n: 3, dur: 1.45, split: 0.16, drop0: 0.18, dropDur: 1.0, square: 1.2 };
const WALL = { font: 90, perLine: 3, y0: 812, lh: 84 };
const FRAC = { num: 862, line: 892, den0: 938, denLh: 44, denFont: 36, zx: SAFE.x0 };
const ZER = { x: 262, y: 1160, lh: 64, font: 58 };

export function desteTimes(tl) {
  const { L, W: Wd } = tl;
  const w = (id, i) => L[id].words[i].t0;
  const T = {
    close: 0.3, flip: 0.75, riffle0: 1.05, grid: L.l02.t0, deal: Wd('l02', 'kart'),
    c52: w('l03', 3), c51: w('l03', 9), c50: w('l03', 12), mult: Wd('l04', 'hepsini'), digits: Wd('l04', 'altmış'),
    earth: L.l05.t0 - 0.1, bang: Wd('l05', 'büyük'), every: w('l05', 6), ratioIn: Wd('l06', 'karıştırmaların'), olasi: Wd('l06', 'olası'), oran: Wd('l06', 'oranı'),
    hero: L.l07.t0 - 0.04, kirk: Wd('l07', 'kırk'), never: L.l08.t0 - 0.1, loop0: tl.loop0,
  };
  T.flip3 = T.c50 + 0.35; T.gather = T.mult; T.print0 = T.mult + 0.3; T.zeros0 = Wd('l07', 'ardından'); T.zeros1 = T.kirk + 0.4;
  return T;
}
// riffle'da düşen kart öbekleri: [zaman, taraf(-1 sol / 1 sağ), kaçıncı kart] — çizim ve ses aynı listeyi okur
export function riffleDrops(T) {
  const out = [];
  for (let c = 0; c < RIF.n; c++) {
    const r = mulberry32(700 + c), t0 = T.riffle0 + c * RIF.dur + RIF.drop0;
    let left = 26, right = 26, k = 0, side = r() < 0.5 ? -1 : 1;
    const clumps = [];
    while (left + right > 0) { let m = 1 + Math.floor(r() * 3); if (side < 0) { m = Math.min(m, left); left -= m; } else { m = Math.min(m, right); right -= m; } if (m > 0) clumps.push([side, m]); side = left === 0 ? 1 : right === 0 ? -1 : -side; }
    const dt = RIF.dropDur / clumps.length;
    clumps.forEach(([s, m], j) => { for (let q = 0; q < m; q++) out.push([t0 + j * dt + q * 0.02, s, k++, c]); });
  }
  return out;
}

export async function makeDesteRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = desteTimes(tl);
  const rnd = mulberry32(46);
  // 52 kartın tohumlu karışık sırası: yuvalar ve yelpaze aynı sırayı gösterir ("işte bu sıra")
  const perm = Array.from({ length: 52 }, (_, i) => i); for (let i = 51; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const FAN = perm.slice(0, 13);
  const DROPS = riffleDrops(T);
  // kara maskesi: eşdikdörtgen izdüşümde bir kez çizilir, noktalar piksel okumasıyla seçilir
  const crowd = []; {
    const mc = document.createElement('canvas'); mc.width = 720; mc.height = 360; const mx = mc.getContext('2d', { willReadFrequently: true });
    const pr = geoEquirectangular().scale(720 / (2 * Math.PI)).translate([360, 180]); mx.fillStyle = '#000'; mx.beginPath(); geoPath(pr, mx)(world.LAND); mx.fill();
    const px = mx.getImageData(0, 0, 720, 360).data, r2 = mulberry32(146);
    for (let k = 0; crowd.length < 700 && k < 20000; k++) { const p = [-180 + r2() * 360, -56 + r2() * 128], q = pr(p), i = (Math.floor(q[1]) * 720 + Math.floor(q[0])) * 4 + 3; if (px[i] > 128) crowd.push([p, r2()]); }
  }

  // ——— deste (üstten): n kart; görünür kalınlık (sağ alt kenarda kat çizgileri) ———
  function stack(x, y, n, rot = 0, h = DECK.h, bend = 0, side = 0) {
    if (n <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const w = h * 0.7, d = Math.min(h * 0.045, n * h * 0.0009);
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    for (let k = d; k > 0.5; k -= Math.max(1.2, d / 8)) { ctx.beginPath(); ctx.roundRect(-w / 2 + k * 0.55, -h / 2 + k, w, h, h * 0.06); ctx.fill(); ctx.stroke(); }
    drawCard(ctx, 0, false, h, CARD_FONT);
    // bırakılan iç köşe: kart yay gibi bükülür (iç kenarda kıvrık ışık çizgileri)
    if (bend > 0) {
      const ex = side * w / 2;
      ctx.save(); ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink;
      for (let i = 0; i < 3; i++) { const o = (i + 1) * 0.05 * h * bend; ctx.beginPath(); ctx.moveTo(ex - side * o, -h / 2 + 6); ctx.quadraticCurveTo(ex - side * (o + 0.08 * h * bend), 0, ex - side * o, h / 2 - 6); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  }
  // yelpaze: 13 kart yüz yukarı (karışık sıra), pivot altta; k: 0 kapalı → 1 açık
  function fan(k, x = DECK.x, y = DECK.y, sway = 0, h = DECK.fanH) {
    const n = FAN.length;
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * 0.12 * k + sway;
      ctx.save(); ctx.translate(x, y + 240); ctx.rotate(a); ctx.translate(0, -240 - 40 * k);
      drawCard(ctx, FAN[i], true, h, CARD_FONT); ctx.restore();
    }
  }
  // riffle: üç tohumlu tur; paketler ayrılır, öbekler sırayla ortaya düşer, deste toplanır
  function riffle(t) {
    const c = Math.min(RIF.n - 1, Math.floor((t - T.riffle0) / RIF.dur)), tc = t - (T.riffle0 + c * RIF.dur);
    if (tc >= RIF.dur || t >= T.riffle0 + RIF.n * RIF.dur) { stack(DECK.x, DECK.y, 52); return; }
    const sp = ease.state(clamp01(tc / RIF.split)) * (1 - ease.state(clamp01((tc - RIF.square) / 0.22)));
    const xs = 185 * sp, rot = 0.17 * sp;
    const mine = DROPS.filter(d => d[3] === c);
    const landed = mine.filter(d => t >= d[0] + 0.07), flying = mine.filter(d => t >= d[0] && t < d[0] + 0.07);
    const leftOut = mine.filter(d => d[1] < 0 && t >= d[0]).length, rightOut = mine.filter(d => d[1] > 0 && t >= d[0]).length;
    const releasing = tc >= RIF.drop0 && tc < RIF.drop0 + RIF.dropDur;
    // ortadaki yığın (düşenler) önce, paketler üstte
    stack(DECK.x, DECK.y + 4, landed.length, 0, DECK.h * 0.98);
    stack(DECK.x - xs, DECK.y - 8, 26 - leftOut, -rot, DECK.h, releasing ? 1 : 0, 1);
    stack(DECK.x + xs, DECK.y - 8, 26 - rightOut, rot, DECK.h, releasing ? 1 : 0, -1);
    for (const d of flying) { const f = (t - d[0]) / 0.07, x = lerp(DECK.x + d[1] * (xs - 60), DECK.x, ease.state(f)), y = lerp(DECK.y - 8, DECK.y + 4, f) - Math.sin(f * Math.PI) * 18; stack(x, y, 1, d[1] * rot * (1 - f), DECK.h * 0.98); }
  }
  // yuvalar: kartın düştüğü yuva ve açılma zamanı
  const slotXY = i => { const c = i % GRID.cols, r = Math.floor(i / GRID.cols), w = GRID.h * 0.7; return [GRID.x0 + c * (w + GRID.gap) + w / 2, GRID.y0 + r * (GRID.h + 8) + GRID.h / 2]; };
  const dealT = i => T.deal + i * 0.04;
  const flipT = i => i === 0 ? T.c52 : i === 1 ? T.c51 : i === 2 ? T.c50 : T.flip3 + (T.mult - 0.08 - T.flip3) * Math.pow((i - 3) / 49, 0.75);
  function grid(t) {
    const gIn = ease.enter(seg(t, T.grid, 0.4));
    // yuvalar boyunca yavaş yaklaşma (%10): sahne hiçbir karede donmaz
    ctx.save(); { const z = 1 + 0.1 * seg(t, T.grid, T.mult - T.grid); ctx.translate(GRID.x0, GRID.y0); ctx.scale(z, z); ctx.translate(-GRID.x0, -GRID.y0); }
    const g = t >= T.gather ? ease.state(seg(t, T.gather, 0.4)) : 0;
    for (let i = 0; i < 52; i++) {
      const [x, y] = slotXY(i), w = GRID.h * 0.7;
      if (g < 1) { ctx.save(); ctx.globalAlpha = gIn * (1 - g); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.strokeStyle = C.graphite; ctx.beginPath(); ctx.roundRect(x - w / 2, y - GRID.h / 2, w, GRID.h, 5); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      if (t < dealT(i)) continue;
      // dağıtım: alttaki desteden yuvaya 0,22 sn'de uçar; toplama: yuvadan sağ üstteki desteye
      const f = ease.enter(seg(t, dealT(i), 0.22));
      let cx = lerp(LOW.x, x, f), cy = lerp(LOW.y, y, f);
      if (g > 0) { const gi = ease.state(seg(t, T.gather + i * 0.004, 0.36)); cx = lerp(cx, 850, gi); cy = lerp(cy, 790, gi); }
      const fl = seg(t, flipT(i), 0.16), sx = Math.abs(Math.cos(fl * Math.PI)), face = fl >= 0.5;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - f) * 0.35); ctx.scale(Math.max(0.03, fl > 0 && fl < 1 ? sx : 1), 1);
      drawCard(ctx, perm[i], face, GRID.h * (g > 0 ? lerp(1, 1.3, g) : 1), CARD_FONT); ctx.restore();
      // seçenek sayısı: ilk üç kart, kendi kelimesinde
      if (i < 3 && t >= flipT(i) && g < 0.3) { setFont(ctx, F.mono(34)); ctx.textAlign = 'center'; const s = String(52 - i), tw = ctx.measureText(s).width; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 6, y - GRID.h / 2 - 42, tw + 12, 38); ctx.fillStyle = C.ink; ctx.fillText(s, x, y - GRID.h / 2 - 12); }
    }
    ctx.restore();
    // alttaki deste: dağıtırken incelir
    const left = 52 - Math.min(52, Math.max(0, Math.floor((t - T.deal) / 0.04) + 1));
    if (t < T.deal + 2.2) stack(LOW.x, LOW.y, t < T.deal ? 52 : left, 0, LOW.h);
  }
  // 68 basamaklı sayı: büyük duvar (rakam 96 px, satırda 3 grup, 8 satır) ve payda (36 px, satırda 8 grup, 3 satır).
  // Her rakam ve nokta iki yerleşim arasında kendi yolunda uçar (kesmeden geçen nesne).
  const BIGG = group(BIG).split('.');
  const ITEMS = []; {
    const place = (perLine, fs, y0, lh) => { const out = []; let d = 0; BIGG.forEach((g, gi) => { const row = Math.floor(gi / perLine), col = gi % perLine; let cx = 0; for (let k = gi - col; k < gi; k++) cx += BIGG[k].length + 1; for (let c = 0; c <= g.length; c++) { if (c === g.length && gi === BIGG.length - 1) break; out.push({ x: SAFE.x0 + (cx + c) * fs * 0.6, y: y0 + row * lh }); } }); return out; };
    const A = place(WALL.perLine, WALL.font, WALL.y0, WALL.lh), B = place(8, FRAC.denFont, FRAC.den0, FRAC.denLh);
    let d = 0, k = 0; BIGG.forEach((g, gi) => { for (let c = 0; c <= g.length; c++) { if (c === g.length && gi === BIGG.length - 1) break; const dot = c === g.length; ITEMS.push({ ch: dot ? '.' : g[c], dot, d: dot ? d - 1 : d, a: A[k], b: B[k] }); if (!dot) d++; k++; } });
  }
  const typedF = t => t < T.print0 ? 0 : 68 * seg(t, T.print0, T.digits - T.print0) + 6 * seg(t, T.digits, 0.3);   // 'altmış'ta 68 (+ yerleşme payı)
  function wall(t, m) {
    const nf = typedF(t), nDig = Math.min(68, Math.floor(nf));
    ctx.textAlign = 'left'; ctx.fillStyle = C.ink;
    for (const it of ITEMS) {
      if (it.d >= nDig) continue;
      const u = ease.state(clamp01(m * 1.5 - (it.d / 68) * 0.5)), fs = lerp(WALL.font, FRAC.denFont, u);
      const drop = it.dot ? 0 : clamp01(1 - (nf - it.d) / 3) * lerp(18, 6, u);
      setFont(ctx, F.mono(Math.round(fs))); ctx.fillText(it.ch, lerp(it.a.x, it.b.x, u), lerp(it.a.y, it.b.y, u) - drop);
    }
  }
  // karıştırma sayacı: saatle aynı t'den; karıştırma = 8,3 milyar × geçen yıl × 3,156e7 sn (2 anlamlı basamak)
  const years = t => 13.8e9 * seg(t, T.bang, L.l05.end - T.bang);
  const shufStr = t => {
    const v = 8.3e9 * years(t) * 3.156e7; if (v < 1) return '0';
    const e = Math.floor(Math.log10(v)), m = Math.round(v / Math.pow(10, e - 1));
    const s = e >= 1 ? String(m) + '0'.repeat(Math.max(0, e - 1)) : String(Math.round(v));
    return group(s);
  };
  function shufNum(t) { if (t < T.bang) return; setFont(ctx, F.mono(36)); ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.fillText(shufStr(t), SAFE.x0, FRAC.num); }

  // ——— büyüteç: karıştıran eller (her saniye) ———
  function roundel(t, k) {
    if (k <= 0) return;
    const R = ROUND, r = R.r * ease.enter(k);
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    const u = (t * 2) % 1;
    for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 44, 30); ctx.rotate(s * 0.25); for (let k2 = 0; k2 < 4; k2++) { ctx.save(); ctx.translate(0, -k2 * 2); drawCard(ctx, 0, false, 100, CARD_FONT); ctx.restore(); } ctx.restore(); }
    for (let j = 0; j < 3; j++) { const v = (u + j / 3) % 1, s = j % 2 ? 1 : -1; ctx.save(); ctx.translate(lerp(s * 44, 0, v), 30 - Math.sin(v * Math.PI) * 30); ctx.rotate(s * 0.25 * (1 - v)); drawCard(ctx, 0, false, 100, CARD_FONT); ctx.restore(); }
    setFont(ctx, F.mono(32)); const lb = 'HER SANİYE', tw = ctx.measureText(lb).width; ctx.fillStyle = C.paper; ctx.fillRect(-tw / 2 - 8, -104, tw + 16, 42); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, 0, -72);
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.digits, 'sasirma', 'saskin'], [T.digits + 1.6, 'ayakta', 'dusunceli'],
    [T.hero, 'sasirma', 'saskin'], [T.never, 'ayakta', 'mutlu'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [];   // duvar sahneyi doldurur: baloncuk yok, şaşkın yüz yeter
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
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - dy;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  function title(t) {
    // açılışta yazı tam durur ve silinerek çıkar; döngüde yarım harf görünmesin diye bütün hâlde belirir
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const fade = t < T.loop0 ? 1 : ease.state(seg(t, T.loop0 + 0.3, 0.4));
    if (Math.min(pout, fade) <= 0) return;
    const txt = L.l01.text;
    let fs = 64, ls; for (const f of [64, 60, 56, 52]) { fs = f; setFont(ctx, F.head(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 4) break; }
    const lh = fs * 1.12, y0 = 690 - (ls.length - 1) * lh - 14;
    ctx.save(); ctx.globalAlpha = fade; ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs, pout, C.ink)); ctx.restore();
  }
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    // l06 + l07: ses neyse ekranda o; dorukta tam cümle
    const txt = ln.id === 'l07' ? L.l06.text + ' ' + ln.text : ln.text;
    const p = ln.id === 'l07' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    const out = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.3)) : 1;
    ctx.save(); ctx.globalAlpha = out; ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink)); ctx.restore();
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, red ? C.red : C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pIn = ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)), out = 1 - ease.exit(seg(t, T.loop0, 0.3));
    ctx.save(); ctx.globalAlpha = out;
    if (t < T.mult) {
      // yalnız söylenen sayılar: "elli iki", "elli bir", "elli"
      const num = t < T.c52 ? '?' : t < T.c51 ? '52' : t < T.c50 ? '52 × 51' : '52 × 51 × 50 …';
      row({ label: 'OLASI SIRA', num, unit: '', right1: '52 KART', right2: '', p: pIn });
    } else if (t < T.earth) {
      // basamak sayacı yalnız yukarı; 'altmış'ta tam 68
      row({ label: 'OLASI SIRA · 52!', num: String(Math.min(68, Math.floor(typedF(t)))), unit: 'basamak', right1: '52 × 51 × … × 1', right2: t >= T.digits ? '≈ 8 × 10⁶⁷' : '' });
    } else if (t < T.ratioIn) {
      const y = years(t) / 1e9;
      row({ label: "BÜYÜK PATLAMA'DAN BERİ", num: t < T.bang ? '0' : y.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), unit: 'milyar yıl', right1: t >= T.bang ? '8,3 MİLYAR KİŞİ' : '', right2: t >= T.every ? 'HER SANİYE 1 DESTE' : '' });
    } else if (t < T.hero) {
      row({ label: 'ORAN', num: '?', unit: '', right1: 'KARIŞTIRMA', right2: 'OLASI SIRA' });
    } else {
      const z = t < T.zeros0 ? 0 : Math.min(40, Math.floor(40 * seg(t, T.zeros0, T.zeros1 - T.zeros0)));
      const landed = t >= T.zeros1 + 0.3;
      row({ label: 'ORAN · VİRGÜLDEN SONRA', num: String(z), unit: 'sıfır', red: t < T.never, right1: landed ? '0,000…045' : '', right2: landed ? '≈ 4,5 × 10⁻⁴¹' : '' });
    }
    ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.strokeStyle = 'rgba(139,133,119,0.25)'; ctx.lineWidth = 1; for (let y = STAGE_TOP + 4; y < 1920; y += 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const back = t >= T.never;
    // A. yelpaze → ters çevirme → üç riffle → deste aşağı iner (l02)
    if (t < T.deal || back) {
      if (back) {
        // l08: kesir yukarı çekilirken yelpaze Sıfır'ın yanından (sağ alttan) gelir; son karede kare 0'daki gibi
        const inn = ease.enter(seg(t, T.never + 0.3, 0.8)), open = ease.state(seg(t, T.never + 0.5, 0.9));
        const z = 1 + 0.04 * (1 - seg(t, T.never, D - T.never));
        ctx.save(); ctx.translate(DECK.x, DECK.y); ctx.scale(z, z); ctx.translate(-DECK.x, -DECK.y);
        fan(open, lerp(1180, DECK.x, inn), lerp(1500, DECK.y, inn), 0.015 * Math.sin((t - D) * 1.3) * (1 - seg(t, D - 1.2, 1.2)));
        ctx.restore();
      } else {
        const z = 1 + 0.05 * seg(t, 0, T.grid);
        ctx.save(); ctx.translate(DECK.x, DECK.y); ctx.scale(z, z); ctx.translate(-DECK.x, -DECK.y);
        if (t < T.flip) fan(1 - ease.state(seg(t, T.close, T.flip - T.close)));
        else if (t < T.riffle0) {
          // ters çevirme (yüz → arka) ve büyüme (yelpaze kartı → deste)
          const u = seg(t, T.flip, T.riffle0 - T.flip), sx = Math.abs(Math.cos(u * Math.PI));
          ctx.save(); ctx.translate(DECK.x, DECK.y); ctx.scale(Math.max(0.03, sx), 1); ctx.translate(-DECK.x, -DECK.y);
          if (u < 0.5) fan(0); else stack(DECK.x, DECK.y, 52, 0, lerp(DECK.fanH, DECK.h, ease.state(u))); ctx.restore();
        } else if (t < T.grid) riffle(t);
        else {
          // l02: deste yuvaların altına iner ve küçülür
          const u = ease.state(seg(t, T.grid, T.deal - T.grid));
          stack(lerp(DECK.x, LOW.x, u), lerp(DECK.y, LOW.y, u), 52, 0, lerp(DECK.h, LOW.h, u));
        }
        ctx.restore();
      }
    }
    // B. yuvalar: dağıtım, açılma, toplama
    if (t >= T.grid && t < T.gather + 0.5) grid(t);
    // C. 68 basamak: deste (sağ üst) satır satır basar; l05'te rakamlar paydanın yerine uçar; l08'de yukarı çekilir
    if (t >= T.print0 && t < T.never + 0.6) {
      const m = ease.state(seg(t, T.earth, 1.0)), out = 1 - ease.state(seg(t, T.never, 0.45)), up = ease.state(seg(t, T.never, 0.55)) * -420;
      const dim = t < T.earth ? 1 : t < T.olasi ? lerp(1, 0.35, m) : lerp(0.35, 1, ease.state(seg(t, T.olasi, 0.4)));
      const z = t < T.earth ? 1 + 0.02 * seg(t, T.digits, T.earth - T.digits) : 1 + 0.05 * seg(t, T.ratioIn, T.never - T.ratioIn);
      const zy = t < T.earth ? WALL.y0 : FRAC.line;
      ctx.save(); ctx.globalAlpha = out * dim; ctx.translate(0, up); ctx.translate(SAFE.x0, zy); ctx.scale(z, z); ctx.translate(-SAFE.x0, -zy);
      wall(t, m);
      ctx.restore();
      // basan deste (sağ üst): basım sürerken titrer, sonra rakamlarla birlikte söner
      if (t < T.earth + 0.4) { const shake = t < T.digits ? Math.sin(t * 60) * 1.5 : 0; ctx.save(); ctx.globalAlpha = 1 - seg(t, T.earth, 0.4); stack(850 + shake, 790, 52, 0, 110); ctx.restore(); }
    }
    // D. küre (l05): altta; noktalar karıştırıyor; kesirde aşağı kayıp çıkar
    const kEarth = t < T.earth ? 0 : t < T.ratioIn ? ease.enter(seg(t, T.earth + 0.85, 0.6)) : 1;   // rakamlar paydaya uçtuktan sonra
    const eOut = ease.state(seg(t, T.ratioIn, 0.6));
    if (kEarth > 0 && eOut < 1) {
      G.setCam({ c: [30 + 18 * seg(t, T.earth, T.oran - T.earth), 22], r: 175, cx: 590, cy: 1225 + eOut * 500 });
      ctx.save(); ctx.globalAlpha = kEarth; G.draw();
      for (const [p, ph] of crowd) { if (!G.visible(p)) continue; const q = G.proj(p), on = ((t * 3 + ph * 7) % 1) < 0.5; ctx.fillStyle = on ? C.ink : C.graphite; ctx.fillRect(q[0] - 1.5, q[1] - 1.5, 3, 3); }
      ctx.restore();
    }
    // E. pay (karıştırma sayacı), kesir çizgisi ("oranı"), doruk sıfırları; l08'de yukarı çekilir
    if (t >= T.bang && t < T.never + 0.6) {
      const out = 1 - ease.state(seg(t, T.never, 0.45)), up = ease.state(seg(t, T.never, 0.55)) * -420;
      const z = t >= T.ratioIn ? 1 + 0.05 * seg(t, T.ratioIn, T.never - T.ratioIn) : 1;
      ctx.save(); ctx.globalAlpha = out; ctx.translate(0, up); ctx.translate(FRAC.zx, FRAC.line); ctx.scale(z, z); ctx.translate(-FRAC.zx, -FRAC.line);
      shufNum(t);
      if (t >= T.oran - 0.1) { const u = ease.state(seg(t, T.oran - 0.1, 0.4)); ctx.beginPath(); ctx.moveTo(SAFE.x0, FRAC.line); ctx.lineTo(lerp(SAFE.x0, 860, u), FRAC.line); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(); }
      if (t >= T.hero - 0.02) {
        const col = C.red;
        setFont(ctx, F.head(150)); revealText(ctx, '0,', SAFE.x0, ZER.y + 112, 150, ease.enter(seg(t, T.hero, 0.3)), col);
        const z0 = t < T.zeros0 ? 0 : Math.min(40, Math.floor(40 * seg(t, T.zeros0, T.zeros1 - T.zeros0)));
        setFont(ctx, F.mono(ZER.font)); ctx.textAlign = 'left'; const cw = ctx.measureText('0').width;
        for (let i = 0; i < z0; i++) { const r = Math.floor(i / 10), c = i % 10, x = ZER.x + c * cw + Math.floor(c / 5) * 18, y = ZER.y + r * ZER.lh; const pop = 1 - seg(t, T.zeros0 + (i / 40) * (T.zeros1 - T.zeros0), 0.12); ctx.fillStyle = col; ctx.fillText('0', x, y - pop * 8); }
        if (z0 >= 40) { const u = ease.enter(seg(t, T.zeros1, 0.3)); setFont(ctx, F.head(80)); revealText(ctx, '45', ZER.x + 10 * cw + 18 + 20, ZER.y + 3 * ZER.lh + 6, 80, u, col); }
        if (z0 >= 40) { setFont(ctx, F.mono(36)); revealText(ctx, '↑ 40 SIFIR', ZER.x, ZER.y + 3 * ZER.lh + 52, 36, ease.enter(seg(t, T.zeros1, 0.3)), col); }
      }
      ctx.restore();
    }
    ctx.restore();
    // büyüteç: herkes her saniye ('her saniye' kelimesinde)
    const kR = t < T.every ? 0 : t < T.ratioIn ? ease.enter(seg(t, T.every, 0.4)) : 1 - ease.exit(seg(t, T.ratioIn, 0.3));
    if (kR > 0.02) roundel(t, kR);
    // son: "bu sıra daha önce hiç olmadı" ve takip çağrısı (yelpazenin üstünde, Sıfır'dan uzak)
    if (t >= T.never + 0.6 && t < T.loop0 + 0.3) {
      const u = ease.enter(seg(t, T.never + 0.6, 0.4)) * (1 - ease.exit(seg(t, T.loop0, 0.3)));
      setFont(ctx, F.mono(40)); const s1 = 'BU SIRA DAHA ÖNCE HİÇ OLMADI', w1 = ctx.measureText(s1).width;
      ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = C.paper; ctx.fillRect(DECK.x - w1 / 2 - 14, 752, w1 + 28, 56); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(DECK.x - w1 / 2 - 14, 752, w1 + 28, 56); ctx.restore();
      revealText(ctx, s1, DECK.x, 792, 40, u, C.ink, 'center');
    }
    if (t >= L.l08.end + 0.2 && t < T.loop0 + 0.3) {
      const u = ease.enter(seg(t, L.l08.end + 0.2, 0.4)) * (1 - ease.exit(seg(t, T.loop0, 0.3)));
      setFont(ctx, F.mono(40)); const s2 = 'TAKİP ET · HER GÜN YENİ BİR SAYI', w2 = ctx.measureText(s2).width;
      ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = C.paper; ctx.fillRect(DECK.x - w2 / 2 - 14, 826, w2 + 28, 56); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(DECK.x - w2 / 2 - 14, 826, w2 + 28, 56); ctx.restore();
      revealText(ctx, s2, DECK.x, 866, 40, u, C.ink, 'center');
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

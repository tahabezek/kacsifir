// "Ağaç" şablonu (Kaç Sıfır?): Dünyada mı daha çok ağaç var, Samanyolu'nda mı daha çok yıldız?
// Kare 0: soru başlık; sahnede gece göğü (Samanyolu bandı, döngüde yavaş dönen yıldızlar) ve altta gravür orman.
// l02: kamera yukarı eğilir, orman aşağı iner; bandın yıldızları 20 × 20'lik bloğa uçar (her nokta 1 milyar):
//      "yüz"de 100 dolu yıldız, "dört"te 300 soluk yıldız daha (tahmin aralığı 100–400 milyar).
// l03: blok sol üstte kalır; altında üstten orman (ağaç taçları), üstünden geçen uydu ve tarama ızgarası,
//      "yerde"de bir sayım parseli, içindeki taçlar tek tek işaretlenir.
// l04: taçlar söner, 80 sütunluk ağaç ızgarası dolar (3.040 nokta, her nokta 1 milyar); "üç"te sayaç.
// l05 (doruk): yıldız bloğu 80 × 5'lik banda dönüşüp ağaç ızgarasına iner ve 7 kez damgalanır (7 × 400 = 2.800);
//      7. damga "yedi"de kırmızı. Kalan 240 nokta damgasız kalır ("en az").
// l06: 370 nokta ağaca dönüşüp bir insanın çevresinde koru olur (gerçek sayı). l07: koru yeniden noktalara döner;
//      ızgara uygarlık öncesine (5.600) uzar, aradaki 2.560 nokta boş ağaç izi ("yok olanlar").
// Döngü: ızgara söner, kamera aşağı eğilerek kare 0'daki göğe ve ormana döner. Anlatım saattir; t'nin saf fonksiyonu.
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { drawTree, drawStump, drawCanopy, drawSatellite, drawPerson } from '../agac_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705, STAGE_BOT = 1920;
const SIFIR = { x: 872, y: 1412, H: 92 };
const ANCHOR = { x: 540, y: 1060 };               // kamera: odak bu ekran noktasına gelir
const COLS = 80;
const SB = { x: 200, y: 725, n: 20, c: 9 };       // yıldız bloğu (dünya koordinatı)
const TG = { x: 190, y: 920, c: 7.8 };            // ağaç ızgarası (bugün: 38 satır)
const TG2 = { x: 250, y: 725, c: 6.9 };           // l07: uygarlık öncesi (70 satır)
const N_STAR = 400, N_TREE = 3040, N_ALL = 5600, N_GROVE = 370, STAMPS = 7, BAND = 5;
const GR2 = '#5E594E';

export function agacTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    yuz: Wd('l02', 'yüz'), dort: Wd('l02', 'dört'), uydu: Wd('l03', 'uydu'), yerde: Wd('l03', 'yer'), sayim: Wd('l03', 'sayım'),
    uc: Wd('l04', 'üç'), cikti: Wd('l04', 'çıktı'), yedi: Wd('l05', 'yedi'), uc6: Wd('l06', 'üç'), yarisi: Wd('l07', 'yarısı'),
    loop0: tl.loop0,
  };
  T.gather0 = L.l02.t0 - 0.25; T.canopy0 = Math.min(L.l03.t0 - 0.4, L.l02.end - 0.9); T.fill0 = L.l04.t0 - 0.05; T.fill1 = T.uc + 0.4;
  T.hero = L.l05.t0 - 0.04; T.morph1 = T.hero + 0.45; T.grove0 = L.l06.t0 - 0.4; T.back0 = L.l07.t0 - 0.4;
  T.follow = L.l07.end + 0.4; T.l07on = L.l07.words[0].t0 - 0.04; T.lost0 = T.l07on + 0.35;
  return T;
}

export async function makeAgacRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = agacTimes(tl);
  const rnd = mulberry32(56);
  const KINDS = ['pine', 'oak', 'cypress'];
  const chip = (s, x, y, a = 1, col = C.ink, al = 'left', size = 40) => {
    if (a <= 0) return; setFont(ctx, size >= 40 ? F.name(size) : F.mono(size)); ctx.textAlign = al;
    const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 8, y - size - 2, tw + 16, size + 14); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
  };

  // "HER ▲ = 1 MİLYAR AĞAÇ": üçgen, fontta olmayabileceği için çizilir
  const chipTri = (x, y, a = 1) => {
    if (a <= 0) return; setFont(ctx, F.name(40)); ctx.textAlign = 'left';
    const pre = 'HER ', post = '= 1 MİLYAR AĞAÇ', w1 = ctx.measureText(pre).width, tri = 30, w2 = ctx.measureText(post).width, tw = w1 + tri + 10 + w2;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x - 8, y - 42, tw + 16, 54); ctx.fillStyle = C.ink; ctx.fillText(pre, x, y);
    ctx.beginPath(); ctx.moveTo(x + w1 + tri / 2, y - 28); ctx.lineTo(x + w1 + tri, y); ctx.lineTo(x + w1, y); ctx.closePath(); ctx.fill();
    ctx.fillText(post, x + w1 + tri + 10, y); ctx.restore();
  };

  // ——— kamera: dünya → ekran (zoom log uzayında) ———
  const IDENT = { z: 1, f: [ANCHOR.x, ANCHOR.y] };
  const SBC = [SB.x + SB.n * SB.c / 2, SB.y + SB.n * SB.c / 2];
  const ZOOM = { z: 2.1, f: SBC };
  const mixCam = (a, b, u) => ({ z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), f: [lerp(a.f[0], b.f[0], u), lerp(a.f[1], b.f[1], u)] });
  function cam(t) {
    // l02: yıldız bloğuna yaklaş; l03'te geri; sonra her evrede yavaş yaklaşma (donma olmasın)
    if (t < T.gather0) return IDENT;
    if (t < T.canopy0) { const u = ease.state(seg(t, T.gather0, 0.7)), c = mixCam(IDENT, ZOOM, u); c.z *= 1 + 0.06 * seg(t, T.gather0 + 0.7, T.canopy0 - T.gather0 - 0.7); return c; }
    const back = { z: ZOOM.z * 1.06, f: ZOOM.f };
    if (t < T.canopy0 + 0.7) return mixCam(back, { z: 1, f: [ANCHOR.x, 1045] }, ease.state(seg(t, T.canopy0, 0.7)));
    const creepA = (a, b, k) => 1 + k * seg(t, a, b - a);
    if (t < T.hero) return { z: creepA(T.canopy0 + 0.7, T.hero, 0.05), f: [ANCHOR.x, 1045] };
    if (t < T.grove0) return { z: lerp(1.05, 1, ease.state(seg(t, T.hero, 0.5))) * creepA(T.hero + 0.5, T.grove0, 0.07), f: [ANCHOR.x, 1045] };
    return { z: creepA(T.back0, T.loop0, 0.12), f: [ANCHOR.x, 1035] };
  }
  const toS = (c, x, y) => [ANCHOR.x + (x - c.f[0]) * c.z, ANCHOR.y + (y - c.f[1]) * c.z];

  // ——— gök ve orman (kare 0 ve döngü) ———
  const SKY = Array.from({ length: 260 }, () => [rnd() * W, STAGE_TOP + 10 + rnd() * 520, rnd()]);
  // Samanyolu bandı: sol alttan sağ üste çapraz, yoğun; ilk 400'ü bloğa uçar
  const BANDS = Array.from({ length: 1100 }, () => { const u = rnd(), v = (rnd() + rnd() + rnd() - 1.5) * 0.55; return [lerp(40, 1060, u) + v * 60, lerp(1230, 740, u) + v * 110, rnd()]; });
  const FOREST = []; { const r = mulberry32(5601); for (let x = 60; x < 1040; x += 26 + r() * 22) { const h = 95 + r() * 85, hill = 1330 + 28 * Math.sin(x / 140) + 14 * Math.sin(x / 53); FOREST.push({ x, y: hill, h, k: KINDS[Math.floor(r() * 3)], s: Math.floor(r() * 1000) }); } FOREST.sort((a, b) => a.y - b.y); }
  const rot = t => 0.035 * Math.sin((t / D) * Math.PI * 2);   // döngüde aynı fazda biten yavaş dönüş
  const POLE = [960, 640];
  const rotP = (x, y, a) => { const dx = x - POLE[0], dy = y - POLE[1], c = Math.cos(a), s = Math.sin(a); return [POLE[0] + dx * c - dy * s, POLE[1] + dx * s + dy * c]; };
  const NIGHT = '#23221E';
  const skyK = t => t < T.loop0 ? 1 + 0.15 * ease.state(seg(t, 0.3, 3.7)) : lerp(1.15, 1, ease.state(seg(t, T.loop0 + 0.05, D - T.loop0 - 0.12)));
  const skyXY = (t, x, y) => { const k = skyK(t); return [540 + (x - 540) * k, 1100 + (y - 1100) * k]; };
  const hillY = x => 1330 + 28 * Math.sin(x / 140) + 14 * Math.sin(x / 53);
  function starGlyph(x, y, s, col = C.ink) { ctx.fillStyle = col; ctx.fillRect(x - s, y - 0.7, s * 2, 1.4); ctx.fillRect(x - 0.7, y - s, 1.4, s * 2); }
  // tilt: 0 = kare 0; 1 = orman kadraj dışında, gök soluk
  function skyScene(t, tilt, skyA, bandSkip) {
    const a = rot(t), dy = SLIDE * tilt;
    if (dy > 1900) return;
    // gece paneli (koyu mürekkep) ve yıldızları tek parça olarak kayar
    ctx.save(); ctx.beginPath(); ctx.moveTo(-200, STAGE_TOP - 420 + dy); ctx.lineTo(W + 200, STAGE_TOP - 420 + dy); for (let x = W + 200; x >= -200; x -= 20) ctx.lineTo(x, hillY(x) + dy); ctx.closePath();
    ctx.fillStyle = NIGHT; ctx.fill(); ctx.clip();
    ctx.globalAlpha = skyA;
    for (const [x0, y0, s] of SKY) { const [x, y] = rotP(x0, y0, a); if (s > 0.92) { const tw = 0.6 + 0.4 * Math.sin((t / D) * Math.PI * 2 * 9 + s * 40); starGlyph(x, y + dy, 3 + 2.5 * tw, C.paper); } else { ctx.fillStyle = C.paper; ctx.fillRect(x - 1, y + dy - 1, 1.6 + s * 1.8, 1.6 + s * 1.8); } }
    for (let i = bandSkip; i < BANDS.length; i++) { const [x0, y0, s] = BANDS[i], [x, y] = rotP(x0, y0, a); ctx.fillStyle = C.paper; ctx.globalAlpha = skyA * (0.5 + 0.5 * s); ctx.fillRect(x - 1.2, y + dy - 1.2, 2.2 + s * 1.8, 2.2 + s * 1.8); }
    ctx.restore();
    // orman: tepe çizgisi + ağaçlar (aşağı kayar)
    {
      ctx.save(); ctx.translate(0, dy);
      ctx.beginPath(); ctx.moveTo(0, 1500); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 1330 + 28 * Math.sin(x / 140) + 14 * Math.sin(x / 53)); ctx.lineTo(W, 1500); ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill();
      ctx.beginPath(); for (let x = 0; x <= W; x += 20) { const y = 1330 + 28 * Math.sin(x / 140) + 14 * Math.sin(x / 53); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineWidth = 2.4; ctx.strokeStyle = C.ink; ctx.stroke();
      for (const f of FOREST) { ctx.save(); ctx.translate(f.x, f.y + 6); drawTree(ctx, f.k, f.h, f.s, 1); ctx.restore(); }
      ctx.restore();
    }
  }

  // ——— ızgaralar ———
  const cellW = (i, g) => [g.x + (i % COLS) * g.c + g.c / 2, g.y + Math.floor(i / COLS) * g.c + g.c / 2];
  const starCell = i => [SB.x + (i % SB.n) * SB.c + SB.c / 2, SB.y + Math.floor(i / SB.n) * SB.c + SB.c / 2];
  const treeGlyph = (x, y, s, fill = true) => { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.8, y + s * 0.7); ctx.lineTo(x - s * 0.8, y + s * 0.7); ctx.closePath(); if (fill) { ctx.fillStyle = C.ink; ctx.fill(); } else { ctx.lineWidth = 1.5; ctx.strokeStyle = GR2; ctx.stroke(); } };
  // bandın yıldızı → blok hücresi uçuşu
  const flyStart = i => (i < 100 ? T.gather0 + 0.12 + 0.38 * (i / 99) : T.dort - 0.12 + 0.42 * ((i - 100) / 299));
  const flyU = (t, i) => ease.state(seg(t, flyStart(i), i < 100 ? Math.max(0.3, T.yuz + 0.06 - flyStart(i)) : 0.42));
  // l05: bant biçimi (80 × 5) ve damga zamanları
  const stampT = k => lerp(T.morph1, T.yedi, k / (STAMPS - 1));
  // l06: koru konumları (tam 370 ağaç; uzak → yakın)
  const GROVE = (() => {
    const P = { x: 540, y: 1330 };
    for (let sp = 1.4; sp > 0.3; sp -= 0.01) {
      const out = []; const r = mulberry32(3700);
      for (let row = 0; row < 13; row++) {
        const f = row / 12, y = lerp(800, 1400, Math.pow(f, 1.2)), size = lerp(30, 76, f), step = size * sp;
        for (let x = 80 + (row % 2) * step / 2; x < 1000; x += step) {
          const jx = x + (r() - 0.5) * step * 0.3;
          if (Math.abs(jx - P.x) < size * 0.5 + 55 && y > 1150) continue;          // insanın çevresi açık
          if (jx > 780 && y > 1270) continue;                                       // Sıfır'ın yeri
          out.push({ x: jx, y, size, k: KINDS[Math.floor(r() * 3)], s: Math.floor(r() * 9999), row });
        }
      }
      if (out.length >= N_GROVE) {
        // fazlası en uzak sıradan eşit aralıkla çıkarılır
        let extra = out.length - N_GROVE; const far = out.filter(o => o.row === 0), drop = new Set();
        for (let j = 0; j < extra && j < far.length; j++) drop.add(far[Math.floor((j + 0.5) * far.length / extra)]);
        const res = out.filter(o => !drop.has(o)); if (res.length === N_GROVE) return { trees: res, person: P };
      }
    }
    throw new Error('koru 370 ağaca oturmadı');
  })();
  const groveIdx = k => Math.floor((k + 0.5) * N_TREE / N_GROVE);   // ızgaradan seçilen nokta
  const groveOf = new Map(); for (let k = 0; k < N_GROVE; k++) groveOf.set(groveIdx(k), k);

  const sweep = (t, x) => {
    const win = (a, b) => t >= a && t < b ? lerp(120, 980, ((t - a) / 1.7) % 1) : null;
    const sx = win(T.fill1, T.hero) ?? win(T.yarisi + 0.3, T.loop0); if (sx === null) return 1;
    const d = (x - sx) / 46; return 1 + 0.45 * Math.exp(-d * d);
  };
  function grids(t, c) {
    const S = (x, y) => toS(c, x, y);
    // — yıldızlar —
    const starA = t < T.canopy0 + 0.7 ? 1 : t < T.grove0 ? 1 : 1 - ease.exit(seg(t, T.grove0, 0.35));
    const mor = ease.state(seg(t, T.hero, T.morph1 - T.hero));
    if (t >= T.gather0 && starA > 0) {
      const tw = (i) => 0.75 + 0.25 * Math.sin((t / D) * Math.PI * 2 * 7 + i * 1.7);
      for (let i = 0; i < N_STAR; i++) {
        const u = flyU(t, i); if (u <= 0) continue;
        const cw = starCell(i), bw = cellW(i, TG), wx = lerp(cw[0], bw[0], mor), wy = lerp(cw[1], bw[1], mor);
        const [tx, ty] = S(wx, wy);
        let x = tx, y = ty;
        if (u < 1) { const [bx0, by0] = skyXY(t, ...rotP(BANDS[i][0], BANDS[i][1], rot(t)).map((v, j) => v + (j ? SLIDE * tiltAt(t) : 0))); x = lerp(bx0, tx, u); y = lerp(by0, ty, u) - Math.sin(u * Math.PI) * 60; }
        const sure = i < 100 || mor > 0;
        ctx.save(); ctx.globalAlpha = starA * (mor > 0 ? lerp(1, 0.9, mor) : 1);
        starGlyph(x, y, (SB.c * 0.42) * c.z * (u < 1 ? lerp(0.6, 1, u) : 1) * (mor > 0 ? lerp(1, TG.c / SB.c, mor) : 1) * (sure ? 1 : 0.85), sure ? C.ink : C.graphite);
        if (sure && i % 23 === 0) { ctx.globalAlpha *= 1 - tw(i); starGlyph(x, y, SB.c * 0.2 * c.z, C.paper); }
        ctx.restore();
      }
    }
    // — ağaçlar —
    if (t >= T.fill0) {
      const gA = t < T.grove0 ? 1 : t < T.back0 ? 0 : 1;
      const back = ease.state(seg(t, T.back0, 0.7));                     // l07: düzen 2'ye geçiş
      const toGrove = ease.state(seg(t, T.grove0, 0.75)), fromGrove = back;
      const span = T.fill1 - T.fill0 - 0.15;
      for (let i = 0; i < N_TREE; i++) {
        const app = seg(t, T.fill0 + 0.15 + span * Math.pow(i / N_TREE, 0.85), 0.14); if (app <= 0) continue;
        const p1 = cellW(i, TG), p2 = cellW(i, TG2);
        const wx = lerp(p1[0], p2[0], back), wy = lerp(p1[1], p2[1], back), cc = lerp(TG.c, TG2.c, back);
        const gk = groveOf.get(i);
        if (t >= T.grove0 && gk !== undefined) {
          // koruya giden ve geri dönen 370 nokta: korudan önce/sonra uçuş
          const g = GROVE.trees[gk], [gx, gy] = groveScreen(t, g);
          const [sx, sy] = S(wx, wy);
          const u = t < T.back0 ? toGrove : 1 - fromGrove;
          if (u > 0.98) continue;                                          // ağaç olarak çiziliyor
          ctx.save(); treeGlyph(lerp(sx, gx, u), lerp(sy, gy - g.size * 0.3, u), cc * 0.38 * c.z * (1 + u * 1.5)); ctx.restore();
          continue;
        }
        let a = app * (t < T.grove0 ? 1 : t < T.back0 ? 1 - ease.exit(seg(t, T.grove0, 0.35)) : ease.enter(seg(t, T.back0 + 0.2 + 0.3 * (i / N_TREE), 0.3)));
        if (a <= 0) continue;
        const [x, y] = S(wx, wy);
        ctx.save(); ctx.globalAlpha = a; treeGlyph(x, y, cc * 0.38 * c.z * lerp(0.4, 1, app) * sweep(t, x)); ctx.restore();
      }
      // l07: yok olan 2.560 ağacın izi
      if (t >= T.lost0) {
        const R0 = N_TREE / COLS, RN = (N_ALL - N_TREE) / COLS;
        for (let i = N_TREE; i < N_ALL; i++) {
          const rr = Math.floor(i / COLS) - R0, col = i % COLS;
          const st = lerp(T.lost0, T.yarisi - 0.2, rr / (RN - 1)) + 0.15 * (col / COLS);
          const a = ease.enter(seg(t, st, 0.3)); if (a <= 0) continue;
          const [wx, wy] = cellW(i, TG2), [x, y] = S(wx, wy);
          const stump = ((i * 2654435761) >>> 0) % 5 === 0 ? ease.state(seg(t, st + 0.35, 0.3)) : 0;
          const yy = y - 36 * (1 - a);
          ctx.save(); ctx.globalAlpha = a * (1 - stump); ctx.lineWidth = 1.5; treeGlyph(x, yy, TG2.c * 0.34 * c.z * sweep(t, x), false); ctx.restore();
          if (stump > 0) { ctx.save(); ctx.globalAlpha = a * stump; ctx.translate(x, yy + TG2.c * 0.45 * c.z); drawStump(ctx, TG2.c * 1.5 * c.z, i); ctx.restore(); }
        }
      }
    }
  }

  // ——— l03: üstten orman, uydu, sayım parseli (dünya koordinatı; ağaç ızgarasının yerinde) ———
  const CANOPY = []; { const r = mulberry32(5603); for (let row = 0; row < 7; row++) for (let x = 226 + (row % 2) * 30; x < 800; x += 60) CANOPY.push({ x: x + (r() - 0.5) * 10, y: 948 + row * 47 + (r() - 0.5) * 8, d: 52 + r() * 14, s: Math.floor(r() * 999) }); }
  const PLOT = { x: 600, y: 1010, w: 150, h: 150 };
  const inPlot = cp => cp.x > PLOT.x && cp.x < PLOT.x + PLOT.w && cp.y > PLOT.y && cp.y < PLOT.y + PLOT.h;
  const PLOTTED = CANOPY.filter(inPlot);
  function canopyScene(t, c) {
    if (t < T.canopy0 + 0.2 || t > T.fill1 + 0.3) return;
    const S = (x, y) => toS(c, x, y);
    const fillU = seg(t, T.fill0, T.fill1 - T.fill0);
    for (const cp of CANOPY) {
      const app = ease.enter(seg(t, T.canopy0 + 0.2 + 0.45 * ((cp.x - 200) / 720), 0.35));
      const gone = ease.exit(seg(fillU, Math.max(0, (cp.y - 948) / 300 * 0.6), 0.25));
      const k = app * (1 - gone); if (k <= 0.01) continue;
      const counted = inPlot(cp) ? ease.enter(seg(t, T.yerde + 0.2 + 0.09 * PLOTTED.indexOf(cp), 0.15)) : 0;
      const [x, y] = S(cp.x, cp.y); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); drawCanopy(ctx, cp.d * c.z, cp.s, counted); ctx.restore();
    }
    const vis = 1 - ease.exit(seg(t, T.fill0, 0.4));
    if (vis <= 0) return;
    // uydu: bölgenin üstünden doğrusal geçiş; arkasında tarama ızgarası
    const su = seg(t, T.canopy0 + 0.3, T.fill0 - T.canopy0 - 0.3), sxw = lerp(430, 950, su);
    const [sx, sy] = S(sxw, 905);
    ctx.save(); ctx.globalAlpha = vis * ease.enter(seg(t, T.canopy0 + 0.3, 0.3));
    const [gx0, gy0] = S(200, 920), [gx1, gy1] = S(830, 1243);
    ctx.beginPath(); ctx.rect(gx0, gy0, Math.max(0, Math.min(sx, gx1) - gx0), gy1 - gy0); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.22)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = gx0; x < gx1; x += 24 * c.z) { ctx.moveTo(x, gy0); ctx.lineTo(x, gy1); } for (let y = gy0; y < gy1; y += 24 * c.z) { ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); } ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = vis * ease.enter(seg(t, T.canopy0 + 0.3, 0.3));
    ctx.beginPath(); ctx.moveTo(sx, sy + 18); ctx.lineTo(sx, gy1); ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]);
    ctx.translate(sx, sy); drawSatellite(ctx, 44 * c.z); ctx.restore();
    chip('UYDU GÖRÜNTÜSÜ', Math.min(SAFE.x1, sx + 70), sy - 34, vis * ease.enter(seg(t, T.uydu - 0.04, 0.3)), C.ink, sx + 70 > 560 ? 'right' : 'left');
    // sayım parseli
    const pk = ease.enter(seg(t, T.yerde - 0.04, 0.3)) * vis;
    if (pk > 0) {
      const [px, py] = S(PLOT.x, PLOT.y);
      ctx.save(); ctx.globalAlpha = pk; ctx.setLineDash([8, 6]); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(px, py, PLOT.w * c.z, PLOT.h * c.z); ctx.setLineDash([]); ctx.restore();
      chip('YERDE SAYIM', px, py + PLOT.h * c.z + 50, pk);
    }
  }

  // ——— l06: koru ———
  function groveCreep(t) { return 1 + 0.07 * seg(t, T.grove0 + 0.75, T.back0 - T.grove0 - 0.75); }
  function groveScreen(t, g) { const z = groveCreep(t), P = GROVE.person; return [P.x + (g.x - P.x) * z, P.y + (g.y - P.y) * z]; }
  function grove(t) {
    if (t < T.grove0 + 0.3 || t > T.back0 + 0.75) return;
    const u = t < T.back0 ? ease.state(seg(t, T.grove0, 0.75)) : 1 - ease.state(seg(t, T.back0, 0.7));
    const grow = clamp01((u - 0.55) / 0.45);
    const z = groveCreep(t), P = GROVE.person;
    // zemin çizgisi
    ctx.save(); ctx.globalAlpha = grow; ctx.beginPath(); ctx.moveTo(SAFE.x0 - 40, P.y + (790 - P.y) * z); ctx.lineTo(1000, P.y + (790 - P.y) * z); ctx.lineWidth = 1.6; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.restore();
    for (const g of GROVE.trees) {
      if (grow <= 0) break;
      const [x, y] = groveScreen(t, g);
      ctx.save(); ctx.translate(x, y); ctx.scale(grow, grow); drawTree(ctx, g.k, g.size * z, g.s, g.size > 46 ? 1 : 0); ctx.restore();
      if (Math.abs(g.x - P.x) < 120 && g.y > 1200 && false) break;
    }
    // insan (en önde)
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(1, grow); drawPerson(ctx, 140 * z); ctx.restore();
    chip('1 KİŞİ', P.x, P.y - 140 * z - 26, grow * ease.enter(seg(t, L.l06.t0, 0.3)), C.ink, 'center');
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(57); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.yuz, 'bakma_yukari', 'saskin'], [T.dort + 1.0, 'ayakta', 'dusunceli'], [T.uydu, 'bakma_yukari', 'notr'],
    [T.uc, 'ayakta', 'saskin'], [T.uc + 1.3, 'ayakta', 'notr'], [T.yedi, 'ayakta', 'saskin'], [T.yedi + 1.4, 'ayakta', 'mutlu'], [L.l06.t0, 'ayakta', 'notr'],
    [L.l07.t0 - 0.2, 'ayakta', 'dusunceli'], [T.loop0 + 0.7, 'ayakta', 'notr']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    if (tiltAt(t) >= 1) { ctx.save(); ctx.beginPath(); ctx.ellipse(SIFIR.x, SIFIR.y - 46, 72, 70, 0, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.restore(); }
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
  }

  // ——— üst blok ———
  function narration(t) {
    // kart, ölçülen ilk kelimeden 0,04 sn önce gelir (mp3 başındaki sessizlik sayılmaz)
    const on = l => l.words[0].t0 - 0.04;
    if (t < on(L.l02) || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= on(L[l.id])) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const p = ease.enter(seg(t, on(ln), 0.3)) * (t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1);
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  const TITLE = (() => { const txt = ep.voice.lines[0].text; for (const f of [96, 88, 80, 74]) { setFont(ctx, F.head(f)); const ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 4 && (ls.length <= 3 || f <= 80)) return { f, ls }; } setFont(ctx, F.head(70)); return { f: 70, ls: wrap(ctx, txt, SAFE.x1 - SAFE.x0) }; })();
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.words[0].t0 - 0.3, 0.22)) : 1;
    if (pin <= 0 || pout <= 0) return;
    const { f, ls } = TITLE, lh = f * 1.02, yl = 676 - 12 * (1 - pout), y0 = yl - (ls.length - 1) * lh;
    ctx.save(); ctx.globalAlpha = pout; setFont(ctx, F.head(f)); ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, f, pin, C.ink)); ctx.restore();
  }
  function row({ label, num, unit, right1, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.ink);
    if (num) { setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink); if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); } }
    if (right1) { setFont(ctx, F.mono(32)); revealText(ctx, right1, SAFE.x1, 680, 32, p, C.ink, 'right'); }
  }
  function counters(t) {
    if (t < T.yuz - 0.04 || t >= T.loop0 + 0.3) return;
    const fade = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    const inP = a => ease.enter(seg(t, a - 0.04, 0.3)) * fade;
    if (t < T.uc - 0.04) {
      row({ label: 'SAMANYOLU · YILDIZ (TAHMİN)', num: t < T.dort - 0.04 ? '100' : '100–400', unit: 'milyar', p: t < T.dort - 0.04 ? inP(T.yuz) : fade }); return;
    }
    if (t < T.yedi - 0.04) { row({ label: 'DÜNYA · AĞAÇ', num: '3', unit: 'trilyon', right1: 'YILDIZ: 100–400 MİLYAR', p: inP(T.uc) }); return; }
    if (t < T.uc6 - 0.04) { const red = t < L.l06.t0 - 0.2; row({ label: 'AĞAÇ ÷ YILDIZ (ÜST TAHMİN)', num: 'en az 7', unit: 'kat', red, p: inP(T.yedi) }); return; }
    if (t < T.l07on) { row({ label: 'İNSAN BAŞINA', num: '370', unit: 'ağaç', p: inP(T.uc6) }); return; }
    if (t < T.yarisi - 0.04) { row({ label: 'UYGARLIK BAŞLADIĞINDAN BERİ · YAKLAŞIK', p: inP(T.l07on + 0.04) }); return; }
    row({ label: 'UYGARLIK BAŞLADIĞINDAN BERİ · YAKLAŞIK', num: '%46', unit: 'azaldı', p: inP(T.yarisi) });
  }
  // sahne etiketleri (ekran uzayında, kamera ile)
  function stageLabels(t, c) {
    // yıldız bloğu etiketi
    if (t >= T.yuz - 0.1 && t < T.grove0 + 0.2) {
      const a = ease.enter(seg(t, T.yuz - 0.04, 0.3)) * (1 - ease.exit(seg(t, T.grove0, 0.25)));
      const [x0, y0] = toS(c, SB.x, SB.y), [x1, y1] = toS(c, SB.x + SB.n * SB.c, SB.y + SB.n * SB.c);
      if (c.z > 1.4) { chip('HER + = 1 MİLYAR YILDIZ', (x0 + x1) / 2, y1 + 58, a, C.ink, 'center'); }
      else {
        const mv = ease.state(seg(t, T.hero, 0.45)), [lx0, ly] = toS(c, SB.x + SB.n * SB.c + 24, SB.y), lx = lerp(lx0, SAFE.x0, mv);
        if (mv < 0.5) chip('SAMANYOLU', lx, ly + 42, a * (1 - mv * 2)); else chip('HER BANT = 400 MİLYAR YILDIZ (ÜST SINIR)', lx, ly + 42, a * (mv * 2 - 1));
        chip('HER + = 1 MİLYAR YILDIZ', lx, ly + 100, a);
      }
    }
    if (t >= T.uc - 0.1 && t < T.grove0 + 0.2) {
      const a = ease.enter(seg(t, T.uc - 0.04, 0.3)) * (1 - ease.exit(seg(t, T.grove0, 0.25)));
      const mv = ease.state(seg(t, T.hero, 0.45)), [lx0, ly] = toS(c, SB.x + SB.n * SB.c + 24, SB.y);
      chipTri(lerp(lx0, SAFE.x0, mv), ly + 158, a);
    }
    // damgalar: bant çerçevesi + sayı (sol kenarda)
    if (t >= T.morph1 - 0.05 && t < T.grove0 + 0.3) {
      const out = 1 - ease.exit(seg(t, T.grove0, 0.3));
      for (let k = 0; k < STAMPS; k++) {
        const s = stampT(k); if (t < s - 0.05) break;
        const drop = k === 0 ? 1 : ease.enter(seg(t, s - 0.05, 0.22));
        const top = TG.y + k * BAND * TG.c, prevTop = TG.y + Math.max(0, k - 1) * BAND * TG.c, wy = lerp(prevTop, top, drop);
        const [x0, y0] = toS(c, TG.x, wy), [x1, y1] = toS(c, TG.x + COLS * TG.c, wy + BAND * TG.c);
        const red = k === STAMPS - 1 && t < L.l06.t0 - 0.2, col = red ? C.red : C.ink;
        ctx.save(); ctx.globalAlpha = out; ctx.lineWidth = red ? 4 : 2.5; ctx.strokeStyle = col; ctx.strokeRect(x0 - 1, y0, x1 - x0 + 2, y1 - y0);
        if (k > 0) { ctx.globalAlpha = out * 0.55 * drop; for (let i = 0; i < N_STAR; i += 1) { const [wx2, wy2] = [TG.x + (i % COLS) * TG.c + TG.c / 2, wy + Math.floor(i / COLS) * TG.c + TG.c / 2], [sx, sy] = toS(c, wx2, wy2); if (i % 2 === 0) starGlyph(sx, sy, TG.c * 0.32 * c.z, col); } }
        ctx.restore();
        setFont(ctx, F.head(40)); ctx.save(); ctx.globalAlpha = out * drop; ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.fillText(`${k + 1}×`, x0 - 14, (y0 + y1) / 2 + 14); ctx.restore();
      }
      if (t >= T.yedi + 0.1) {
        const [x0, y0] = toS(c, TG.x, TG.y + STAMPS * BAND * TG.c), [, y1] = toS(c, 0, TG.y + (N_TREE / COLS) * TG.c);
        setFont(ctx, F.head(40)); ctx.save(); ctx.globalAlpha = out * ease.enter(seg(t, T.yedi + 0.1, 0.3)); ctx.fillStyle = C.graphite; ctx.textAlign = 'right'; ctx.fillText('+240', x0 - 14, (y0 + y1) / 2 + 16); ctx.restore();
      }
    }
    // l07: bugün / yok olanlar
    if (t >= T.back0 + 0.4) {
      const a = ease.enter(seg(t, T.back0 + 0.6, 0.3)) * (t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.3)) : 1);
      const [, ya] = toS(c, 0, TG2.y + 19 * TG2.c), [, yb] = toS(c, 0, TG2.y + 54 * TG2.c);
      chip('BUGÜN', SAFE.x0, ya + 14, a);
      const ka = a * ease.enter(seg(t, T.lost0 - 0.05, 0.25));
      chip('YOK', SAFE.x0, yb - 10, ka); chip('OLAN', SAFE.x0, yb + 44, ka);
    }
  }
  // kare 0 ve döngü sonu: iki yarışmacı
  function contenders(t) {
    const k0 = 1 - ease.exit(seg(t, T.gather0, 0.3)), kL = t >= T.loop0 ? ease.enter(seg(t, T.loop0 + 0.5, 0.4)) : k0;
    if (kL > 0) { chip('SAMANYOLU · YILDIZ', SAFE.x1, 800, kL, C.ink, 'right'); chip('DÜNYA · AĞAÇ', SAFE.x0, 1226, kL, C.ink, 'left'); }
  }
  function follow(t) {
    if (t < T.follow || t >= T.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 455;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 1330, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 1330, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 1375); ctx.restore();
  }

  // eğim: l02'de 0 → 1, döngüde 1 → 0
  function tiltAt(t) { if (t < T.gather0) return 0; if (t < T.loop0) return ease.exit(seg(t, T.gather0, 0.45)); return 1 - ease.enter(seg(t, D - 0.62, 0.5)); }
  const SLIDE = 1180;   // panelin tamamı sahne dışına çıkar

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, STAGE_BOT - STAGE_TOP); ctx.clip();
    const tilt = tiltAt(t);
    // kare 0: 0,3 sn'den 4 sn'de 1,15x; eğim boyunca tutulur, döngüde 1'e döner
    const creep0 = skyK(t);
    if (tilt < 1) {
      const skyA = 1;
      ctx.save(); ctx.translate(540, 1100); ctx.scale(creep0, creep0); ctx.translate(-540, -1100);
      const flown = t >= T.gather0 && t < T.loop0 ? N_STAR : 0;
      skyScene(t, tilt, skyA, flown); ctx.restore();
    }
    const c = cam(t);
    const gridA = t >= T.loop0 ? 1 - ease.exit(seg(t, D - 0.85, 0.3)) : 1;
    if (gridA > 0) { ctx.save(); ctx.globalAlpha = gridA; canopyScene(t, c); grids(t, c); ctx.restore(); }
    grove(t);
    ctx.save(); ctx.globalAlpha = gridA; stageLabels(t, c); ctx.restore();
    contenders(t);
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    follow(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

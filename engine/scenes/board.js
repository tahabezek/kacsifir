// Sahne: satranç tahtası. Her karede buğday ikiye katlanır; yığınlar gerçek ölçekte, gerçek yığılma açısıyla büyür.
// Eğik bakış (tahta) → kamera yere iner (yan kesit, yapılarla kıyas) → tepeden bakış (Türkiye haritası, doruk).
// Tek kamera: { s: px/m, tilt: 0 yan · 1 tepe, ox, oy: dünya merkezinin ekrandaki yeri }. Her kare t'nin saf fonksiyonu.
import { W, H, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { GEO } from '../geo/shapes.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

// ——— Fizik: tane kütlesi, yığın yoğunluğu, yığılma açısı (bölüm dosyasından) ———
function physics(ep) {
  const P = ep.physics;
  const g = P.grainKg / P.bulkKgM3;                  // bir tanenin yığın içindeki hacmi (m³)
  const tan = Math.tan((P.reposeDeg * Math.PI) / 180);
  const cone = n => { const V = n * g; const r = Math.cbrt((3 * V) / (Math.PI * tan)); return { r, h: r * tan }; };
  return { g, tan, cone, sq: P.squareM };
}

// ——— Zaman çizelgesi ———
export function buildBoardTimeline(ep) {
  const T = ep.timing;
  const sqTimes = [{ k: 1, t: 0 }];
  T.double.forEach((t, i) => sqTimes.push({ k: i + 2, t }));                 // 2..12
  T.cover.forEach((t, i) => sqTimes.push({ k: 13 + i, t }));                 // 13..17
  const ladder = ep.ladder.map((L, i) => ({ ...L, t0: T.ladder[i][0], t1: T.ladder[i][1] }));
  const coverLand = T.cover[T.cover.length - 1] + 0.35;
  const tiltUp0 = T.tiltUp[0], tiltUp1 = T.tiltUp[1];
  const heroLand = T.heroLand, fill0 = heroLand - 0.35;
  const rw0 = T.rewind[0], rw1 = T.rewind[1];
  return { beat: 60 / ep.bpm, sqTimes, ladder, coverLand, tiltDown: T.tiltDown, tiltUp0, tiltUp1, silence0: fill0 - 0.5, fill0, heroLand, rw0, rw1, duration: rw1 };
}

export function boardSummary(ep) {
  const tl = buildBoardTimeline(ep);
  return {
    duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, 1.5, 3.2, tl.sqTimes[11].t + 0.4, tl.coverLand + 0.4, ...tl.ladder.map(L => L.t1 + 0.4), tl.tiltUp1 - 0.1, tl.heroLand + 0.3, tl.heroLand + 1.6, tl.rw0 + 0.3],
    fast: tl.ladder[0].t0 + 0.4, lastLand: tl.ladder[tl.ladder.length - 1].t1, firstLand: tl.sqTimes[1].t + 0.3,
  };
}

export function boardCues(ep) {
  const tl = buildBoardTimeline(ep);
  return {
    beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: tl.ladder.map(L => ({ t0: L.t0, t1: L.t1 - 0.05, hero: false })),
    lands: [...tl.sqTimes.slice(1).map(s => s.t + 0.04), ...tl.ladder.map(L => L.t1)],
    tallies: [],
  };
}

// Sayı → "65.536" ya da "536,9 milyon"
const WORDS = [[1e18, 'kentilyon'], [1e15, 'katrilyon'], [1e12, 'trilyon'], [1e9, 'milyar'], [1e6, 'milyon']];
function fmtBig(n) {
  if (n < 1e7) return { num: nf.format(Math.round(n)), word: '' };
  for (const [lim, w] of WORDS) if (n >= lim) { const x = n / lim; return { num: x < 100 ? nf1.format(Math.floor(x * 10) / 10) : nf.format(Math.floor(x)), word: w }; }
}

export function makeBoardRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildBoardTimeline(ep);
  const D = tl.duration;
  const PH = physics(ep);
  const SQ = PH.sq;                                   // kare kenarı (m)
  const S0 = 70 / SQ;                                 // tahta evresinde px/m (kare = 70 px)
  const BOARD_O = { x: 440, y: 1110 }, GROUND_O = { x: 470, y: 1300 };
  const OBL = 0.36;                                   // eğik bakışta tilt (yükseklik açısı ~21°)
  const G = GEO.turkey, MAP_K = 700 / G.bboxKm[0] / 1000; // px/m (Türkiye 700 px genişlikte)
  const MAP_C = { x: 500, y: 1060 };
  const ist = { x: MAP_C.x + G.flood.origin[0] * 1000 * MAP_K, y: MAP_C.y + G.flood.origin[1] * 1000 * MAP_K };

  // ——— tane dokusu (tohumlu, bir kez) ———
  const TEX = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 96;
    const x = c.getContext('2d'), rnd = mulberry32(64);
    x.fillStyle = '#E9DFC6'; x.fillRect(0, 0, 96, 96);
    for (let i = 0; i < 150; i++) {
      const px = rnd() * 96, py = rnd() * 96, a = rnd() * Math.PI;
      for (const [ox, oy] of [[0, 0], [96, 0], [-96, 0], [0, 96], [0, -96]]) {
        x.beginPath(); x.ellipse(px + ox, py + oy, 4.2, 2.1, a, 0, Math.PI * 2);
        x.fillStyle = rnd() < 0.5 ? '#CDBF9C' : '#D9CCAA'; x.fill();
        x.lineWidth = 1; x.strokeStyle = 'rgba(28,27,24,0.55)'; x.stroke();
      }
    }
    return ctx.createPattern(c, 'repeat');
  })();
  // tek tek taneler (küçük sayılar): kare içinde tohumlu yerler
  const GRAINS = (() => { const rnd = mulberry32(2); return Array.from({ length: 40 }, () => ({ u: rnd() * 0.76 - 0.38, v: rnd() * 0.76 - 0.38, a: rnd() * Math.PI })); })();

  const sqPos = k => { const i = (k - 1) % 8, j = Math.floor((k - 1) / 8); return { x: (i - 3.5) * SQ, y: (3.5 - j) * SQ }; };

  // ——— kamera: t'nin saf fonksiyonu ———
  const fit = r => Math.min(S0, 940 / (2 * r));
  const ladderS = tl.ladder.map(L => fit(PH.cone(L.n).r));
  function camera(t) {
    const [d0, d1] = tl.tiltDown;
    let s = S0, tilt = OBL, scr = { ...BOARD_O };
    // odak: tahtanın ortasından 17. karenin yığınına kayar
    const f17 = sqPos(17), fu = ease.state(seg(t, tl.sqTimes[12].t, tl.coverLand - tl.sqTimes[12].t));
    const focus = { x: f17.x * fu, y: f17.y * fu };
    if (t >= d0) {
      const u = ease.state(seg(t, d0, d1 - d0));
      tilt = lerp(OBL, 0, u); scr = { x: lerp(BOARD_O.x, GROUND_O.x, u), y: lerp(BOARD_O.y, GROUND_O.y, u) };
    }
    // beklemelerde kamera doğrusal olarak %6 yaklaşır (donmuş kare olmaz; yazı sabit kalır)
    const DRIFT = 0.06;
    const drift = (a, b) => 1 + DRIFT * Math.max(0, Math.min(1, (t - a) / (b - a)));
    s = S0 * drift(tl.coverLand, tl.ladder[0].t0);
    // basamaklar: kamera yığının arkasından %30 gecikmeyle gelir (logaritmik uzayda), sonra bekler ve yaklaşır
    let prevS = S0 * (1 + DRIFT);
    for (const [i, L] of tl.ladder.entries()) {
      if (t < L.t0) break;
      const d = L.t1 - L.t0, settle = L.t0 + d * 1.15, next = tl.ladder[i + 1] ? tl.ladder[i + 1].t0 : tl.tiltUp0;
      const u = ease.state(seg(t, L.t0 + d * 0.3, d * 0.85));
      s = Math.exp(lerp(Math.log(prevS), Math.log(ladderS[i]), u)) * drift(settle, next);
      prevS = ladderS[i] * (1 + DRIFT);
    }
    if (t >= tl.tiltUp0) {
      const u = ease.state(seg(t, tl.tiltUp0, tl.tiltUp1 - tl.tiltUp0));
      s = Math.exp(lerp(Math.log(s), Math.log(MAP_K), u)) * drift(tl.tiltUp1, tl.rw0);
      tilt = lerp(0, 1, u);
      scr = { x: lerp(GROUND_O.x, ist.x, u), y: lerp(GROUND_O.y, ist.y, u) };
    }
    // dünya (0,0) tahtanın ortası; odak noktası ekranda scr'ye gelir
    const o = { x: scr.x - focus.x * s, y: scr.y - focus.y * s * tilt };
    return { s, tilt, o, focus };
  }
  // perspektif: odak noktasına göre derinlik; eğik bakışta güçlü, yan ve tepe bakışta yok
  const P = (cam, x, y, z = 0) => {
    const pk = cam.tilt > 0.99 ? 0 : 1.15 * Math.min(1, cam.tilt / OBL) * Math.min(1, (1 - cam.tilt) / (1 - OBL)) * Math.min(1, cam.s / S0);
    const k = 1 / (1 - (y - cam.focus.y) * pk);
    const fx = cam.o.x + cam.focus.x * cam.s, fy = cam.o.y + cam.focus.y * cam.s * cam.tilt;
    return [fx + (x - cam.focus.x) * cam.s * k, fy + ((y - cam.focus.y) * cam.s * cam.tilt - z * cam.s * Math.sqrt(1 - cam.tilt * cam.tilt)) * k];
  };

  // ——— hangi karede kaç tane: zamanla ———
  function squareCount(k, t) { // k. karedeki tane (görünen), büyüme 0,3 sn
    const st = tl.sqTimes.find(s => s.k === k);
    if (!st || t < st.t) return 0;
    return Math.pow(2, k - 1) * ease.enter(seg(t, st.t, 0.3));
  }
  function ladderN(t) { // yan kesitteki tek yığının tane sayısı (log uzayda büyür)
    let n = Math.pow(2, 16), k = 17;
    for (const L of tl.ladder) {
      if (t < L.t0) break;
      const u = ease.state(seg(t, L.t0, L.t1 - L.t0));
      n = Math.exp(lerp(Math.log(n), Math.log(L.n), u)); k = u >= 1 ? L.k : Math.floor(Math.log2(n)) + 1;
    }
    return { n, k };
  }

  // ——— çizimler ———
  function drawBoard(cam, a = 1, cur = null) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    const half = 4 * SQ, th = 0.022;
    // ön yüz (kalınlık)
    const [fx0, fy0] = P(cam, -half, half), [fx1] = P(cam, half, half), [, fyz] = P(cam, -half, half, -th);
    ctx.fillStyle = '#D8CFBB'; ctx.fillRect(fx0, fy0, fx1 - fx0, fyz - fy0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(fx0, fy0, fx1 - fx0, fyz - fy0);
    // o an dolan kare: kalın mürekkep çerçeve
    if (cur) { const p = sqPos(cur.k), h2 = SQ / 2; const q = [P(cam, p.x - h2, p.y - h2), P(cam, p.x + h2, p.y - h2), P(cam, p.x + h2, p.y + h2), P(cam, p.x - h2, p.y + h2)];
      ctx.save(); ctx.globalAlpha *= cur.a; ctx.lineWidth = 5; ctx.beginPath(); q.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke(); ctx.restore(); }
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
      const q = [P(cam, (i - 4) * SQ, (3 - j) * SQ), P(cam, (i - 3) * SQ, (3 - j) * SQ), P(cam, (i - 3) * SQ, (4 - j) * SQ), P(cam, (i - 4) * SQ, (4 - j) * SQ)];
      ctx.fillStyle = (i + j) % 2 === 0 ? '#BFB49C' : '#F4EEDF';
      ctx.beginPath(); q.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
    }
    const qb = [P(cam, -half, -half), P(cam, half, -half), P(cam, half, half), P(cam, -half, half)];
    ctx.lineWidth = 3; ctx.beginPath(); qb.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
    // koordinat harfleri: tahtanın önünde, mono
    if (cam.tilt > 0.3) {
      setFont(ctx, F.mono(22)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center';
      'abcdefgh'.split('').forEach((ch, i) => { const [x] = P(cam, (i - 3.5) * SQ, half); ctx.fillText(ch, x, fyz + 26); });
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }
  function drawGrains(cam, k, n) {
    const p = sqPos(k), m = Math.round(n);
    for (let q = 0; q < Math.min(m, 40); q++) {
      const g = GRAINS[q];
      const [x, y] = P(cam, p.x + g.u * SQ, p.y + g.v * SQ);
      ctx.beginPath(); ctx.ellipse(x, y, 5.5, 3, g.a, 0, Math.PI * 2);
      ctx.fillStyle = '#E2D3AE'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = C.ink; ctx.stroke();
    }
  }
  // koni: taban elipsi + tepe; dokulu dolgu, soldan ışık
  function drawCone(cam, x, y, n, opts = {}) {
    const { r, h } = PH.cone(n);
    const [cx, cy] = P(cam, x, y), [ax, ay] = P(cam, x, y, h);
    const rx = r * cam.s, ry = Math.max(0.5, r * cam.s * cam.tilt);
    if (rx < 0.6) return { cx, cy, ax, ay, rx };
    ctx.save();
    ctx.beginPath();
    if (ay < cy - ry * 1.02) { ctx.moveTo(ax, ay); ctx.lineTo(cx + rx, cy); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); ctx.lineTo(ax, ay); }
    else ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
    // tane dokusu ölçekle küçülür; tane 2 px'in altına inince düz ton
    const grainPx = 0.006 * cam.s;
    const texA = Math.max(0, Math.min(1, (grainPx - 1.5) / 3));
    ctx.fillStyle = '#D9CCAA'; ctx.fill();
    if (texA > 0) { ctx.save(); ctx.globalAlpha *= texA; const sc = Math.min(1, grainPx / 7); TEX.setTransform(new DOMMatrix([sc, 0, 0, sc, cx, cy])); ctx.fillStyle = TEX; ctx.fill(); ctx.restore(); }
    const sh = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.55, 'rgba(28,27,24,0)'); sh.addColorStop(1, 'rgba(28,27,24,0.22)');
    ctx.fillStyle = sh; ctx.fill();
    ctx.lineWidth = opts.lw ?? 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
    return { cx, cy, ax, ay, rx };
  }

  // ——— gerçek ölçekli yapılar (metre, taban ortası = 0) ———
  const SIL = {
    person: () => { const p = new Path2D(); p.arc(0, -1.64, 0.11, 0, Math.PI * 2); p.roundRect(-0.21, -1.5, 0.42, 0.66, 0.12); p.roundRect(-0.17, -0.86, 0.14, 0.86, 0.06); p.roundRect(0.03, -0.86, 0.14, 0.86, 0.06); return p; },
    galata: () => { const p = new Path2D(); const pts = [[-8.2, 0], [-8.2, -51], [-9.6, -51], [-9.6, -55.5], [-8.6, -55.5], [0, -66.9], [8.6, -55.5], [9.6, -55.5], [9.6, -51], [8.2, -51], [8.2, 0]]; pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; },
    burj: () => { const p = new Path2D(); const half = [[57, 0], [57, -160], [46, -160], [46, -300], [36, -300], [36, -420], [27, -420], [27, -520], [18, -520], [18, -600], [9, -600], [9, -690], [3.5, -690], [0, -828]]; const pts = [...half.map(([x, y]) => [-x, y]), ...half.reverse().map(([x, y]) => [x, y])]; pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; },
    agri: () => { const p = new Path2D(); const pts = [[-22000, 0], [-9000, -2600], [-3500, -4300], [-900, -5000], [0, -5137], [1200, -4950], [4200, -4000], [7600, -3300], [9800, -3300], [12600, -3896], [15200, -3100], [21000, -1200], [26000, 0]]; pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; },
  };
  function drawLandmark(cam, L, a) {
    if (a <= 0) return;
    const [bx, by] = P(cam, L.x, 0);
    ctx.save(); ctx.globalAlpha *= a;
    ctx.translate(bx, by); ctx.scale(cam.s, cam.s);
    const path = SIL[L.sil]();
    ctx.fillStyle = C.paper; ctx.fill(path);
    if (L.sil === 'agri') { // kar örtüsü
      ctx.save(); ctx.clip(path); ctx.fillStyle = '#FBF8F0'; ctx.fillRect(-30000, -6000, 60000, 6000 - 4100); ctx.restore();
    }
    ctx.lineWidth = 3 / cam.s; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.stroke(path);
    ctx.restore();
    // etiket: yapının adı ve yüksekliği, zeminin altında
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.globalAlpha = a; ctx.fillText(L.label, Math.min(Math.max(bx, 230), 560), by + 46); ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }

  // ——— Türkiye haritası (tepeden) ———
  const mapPath = (() => { const p = new Path2D(); for (const r of G.rings) r.forEach(([x, y], i) => (i ? p.lineTo(x * 1000, y * 1000) : p.moveTo(x * 1000, y * 1000))); p.closePath(); return p; })();
  function drawMap(cam, a, fill) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    // dünya merkezi = İstanbul; harita km → m, kamera ölçeğiyle
    const fx = cam.o.x + cam.focus.x * cam.s, fy = cam.o.y + cam.focus.y * cam.s * cam.tilt;
    const ox = fx - G.flood.origin[0] * 1000 * cam.s, oy = fy - G.flood.origin[1] * 1000 * cam.s;
    ctx.translate(ox, oy); ctx.scale(cam.s, cam.s);
    ctx.fillStyle = '#F4EEDF'; ctx.fill(mapPath);
    if (fill > 0) {
      ctx.save(); ctx.clip(mapPath);
      ctx.beginPath(); ctx.arc(G.flood.origin[0] * 1000, G.flood.origin[1] * 1000, fill * 1.7e6, 0, Math.PI * 2);
      ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
    }
    ctx.lineWidth = 2.5 / cam.s; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.stroke(mapPath);
    ctx.restore();
  }
  // doruk sonrası kesit: 1,5 m katman ve 1,75 m insan (aynı ölçek)
  function drawSection(t) {
    const a = ease.enter(seg(t, tl.heroLand + 0.9, 0.5));
    if (a <= 0) return;
    const x0 = 120, x1 = 470, gy = 1330, k = 50; // px/m
    ctx.save(); ctx.globalAlpha *= a;
    const layer = ep.hero.layerM;
    ctx.fillStyle = C.red; ctx.fillRect(x0, gy - layer * k * a, x1 - x0, layer * k * a);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 10, gy); ctx.lineTo(x1 + 10, gy); ctx.stroke();
    ctx.save(); ctx.translate(x1 - 70, gy); ctx.scale(k, k); const pp = SIL.person(); ctx.fillStyle = C.paper; ctx.fill(pp); ctx.lineWidth = 3 / k; ctx.strokeStyle = C.ink; ctx.stroke(pp); ctx.restore();
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.fillText(ep.hero.layerLabel, x1 + 26, gy - layer * k + 12);
    ctx.restore();
  }

  // ——— yazılar ———
  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 64 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * 2 + 190;
  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // altyazı: inişten 0,04 sn önce gelir, bir sonraki büyüme başlarken 180 ms'de çıkar
  const SAYS = [{ t0: 0, t1: tl.sqTimes[12].t, text: ep.say.hook },
    { t0: tl.coverLand - 0.04, t1: tl.ladder[0].t0, text: ep.say.cover },
    ...tl.ladder.map((L, i) => ({ t0: L.t1 - 0.04, t1: i + 1 < tl.ladder.length ? tl.ladder[i + 1].t0 : tl.tiltUp0, text: L.say })),
    { t0: tl.heroLand - 0.04, t1: tl.rw0, text: ep.say.hero, red: true }];
  function drawSay(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  function drawCounter(t, label, n, unit, red) {
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(label, SAFE.x0, counterY - 118);
    const c = fmtBig(n);
    let sc = 1;
    if (red) sc = lerp(0.9, 1, spring(t - tl.heroLand, 120, 24));
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(c.num, SAFE.x0, counterY);
    const x = SAFE.x0 + ctx.measureText(c.num).width + 18;
    setFont(ctx, F.name(56)); ctx.fillText(c.word ? `${c.word} ${unit}` : unit, x, counterY);
    ctx.restore();
  }

  // ——— Sıfır: tane sayar (kare numarası), tahta dolarken terler, tek yığın tahtayı kaplayınca patinajla kaçar ———
  // Sıfır: kareleri sayar → tahta dolarken terler → tek yığın tahtayı kaplayınca patinajla kaçar →
  // kamera yere inince frenle geri gelir, her yapıya bakar, Ağrı Dağı'nda zıplar, doruğa şaşırır
  const L0 = tl.ladder[0], LN = tl.ladder[tl.ladder.length - 1];
  const actorScript = [
    { type: 'idle', t0: 0, t1: tl.sqTimes[1].t, expr: 'notr' },
    { type: 'count', t0: tl.sqTimes[1].t, t1: tl.sqTimes[12].t, from: 2, valueAt: t => tl.sqTimes.filter(s => s.t <= t).length, label: n => `${n}. kare`, bubble: 'top' },
    { type: 'sweat', t0: tl.sqTimes[12].t, t1: tl.sqTimes[15].t },
    { type: 'flee', t0: tl.sqTimes[15].t, t1: tl.sqTimes[15].t + 1.3, dir: 1, dist: 500 },
    { type: 'gone', t0: tl.sqTimes[15].t + 1.3, t1: tl.tiltDown[1] - 0.2 },
    { type: 'enterSkid', t0: tl.tiltDown[1] - 0.2, t1: tl.tiltDown[1] + 1.1, dir: -1, dist: 420 },
    ...tl.ladder.slice(0, -1).map((L, i) => ({ type: 'lookUp', t0: i ? L.t0 : tl.tiltDown[1] + 1.1, t1: tl.ladder[i + 1].t0, expr: i ? 'saskin' : 'notr' })),
    { type: 'sweat', t0: LN.t0, t1: LN.t1 - 0.05 },
    { type: 'surprise', t0: LN.t1 - 0.05, t1: LN.t1 + 0.85 },
    { type: 'lookUp', t0: LN.t1 + 0.85, t1: tl.heroLand - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'happy', t0: tl.heroLand + 0.85, t1: tl.rw0 },
    { type: 'idle', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function scene(t, real) {
    const cam = camera(t);
    const groundA = 1 - cam.tilt / 0.12; // yan kesitte zemin çizgisi
    // zemin çizgisi ve ölçü
    if (cam.tilt < 0.12 && t >= tl.tiltDown[0]) {
      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, groundA)); ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(SAFE.x0, cam.o.y); ctx.lineTo(SAFE.x1, cam.o.y); ctx.stroke(); ctx.restore();
    }
    // harita (tepeden bakışa geçerken)
    const mapA = ease.enter(seg(t, tl.tiltUp0 + (tl.tiltUp1 - tl.tiltUp0) * 0.62, 0.4));
    const fill = t >= tl.fill0 && t < tl.rw0 + 0.5 ? ease.enter(seg(t, tl.fill0, 0.35)) : 0;
    drawMap(cam, mapA, fill);
    // tahta: kamera yere inince çizgiye dönüşür
    const boardA = 1 - ease.exit(seg(cam.s, S0 * 0.25, -S0 * 0.2)); // s küçüldükçe kaybolur
    const curK = tl.sqTimes.filter(s => s.t <= t).length;
    drawBoard(cam, cam.s > S0 * 0.06 ? 1 : 0, curK <= 12 && t < tl.sqTimes[12].t + 0.4 ? { k: curK, a: 1 - ease.exit(seg(t, tl.sqTimes[12].t, 0.4)) } : null);
    // tahta evresi: her karede yığın ya da taneler (arkadan öne)
    const ladderOn = t >= tl.ladder[0].t0;
    if (!ladderOn || cam.s > S0 * 0.2) {
      const order = [];
      for (let k = 1; k <= 17; k++) order.push(k);
      order.sort((a, b) => sqPos(a).y - sqPos(b).y);
      for (const k of order) {
        const n = squareCount(k, t);
        if (n <= 0) continue;
        const p = sqPos(k);
        if (Math.pow(2, k - 1) <= 32) drawGrains(cam, k, n);
        else drawCone(cam, p.x, p.y, n, { lw: cam.s > S0 * 0.5 ? 2.5 : 2 });
      }
    }
    // basamaklar: 17. karenin yığını büyümeye devam eder (yan kesit)
    if (ladderOn) {
      const { n } = ladderN(t);
      const p = sqPos(17);
      const yX = 0;
      // önceki yapı silinir, yenisi iner
      for (const [i, L] of tl.ladder.entries()) {
        const next = tl.ladder[i + 1];
        const a = ease.enter(seg(t, L.t1 - 0.25, 0.4)) * (next ? 1 - ease.exit(seg(t, next.t0 + 0.2, 0.3)) : (t < tl.tiltUp0 ? 1 : 1 - ease.exit(seg(t, tl.tiltUp0, 0.3))));
        if (L.sil && a > 0) drawLandmark(cam, { ...L, x: p.x + PH.cone(L.n).r * 0.62 }, a);
      }
      const cone = drawCone(cam, p.x, p.y, n);
      // tepe ölçüsü: kesik çizgi + yükseklik
      if (cam.tilt < 0.2 && t < tl.tiltUp0 + 0.2) {
        const L = tl.ladder.findLast(L => t >= L.t1 - 0.05);
        if (L) {
          const a = ease.enter(seg(t, L.t1, 0.3)) * (t < tl.tiltUp0 ? 1 : 1 - ease.exit(seg(t, tl.tiltUp0, 0.2)));
          const nn = tl.ladder.find(x => x.t0 > L.t0);
          const out = nn && t > nn.t0 ? 1 - ease.exit(seg(t, nn.t0, 0.2)) : 1;
          ctx.save(); ctx.globalAlpha = a * out; ctx.setLineDash([10, 8]); ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cone.ax, cone.ay); ctx.lineTo(SAFE.x1 - 4, cone.ay); ctx.stroke(); ctx.setLineDash([]);
          setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText(L.heightLabel, SAFE.x1 - 4, cone.ay - 14); ctx.textAlign = 'left';
          ctx.restore();
        }
      }
    }
    // sayaç
    if (t < tl.heroLand - 0.04 || !real) {
      let label, n;
      if (!ladderOn) { const k = tl.sqTimes.filter(s => s.t <= t).length; label = `${k}. KARE`; n = Math.pow(2, k - 1); }
      else { const L = ladderN(t); label = `${L.k}. KARE`; n = Math.pow(2, L.k - 1) * (L.n / Math.pow(2, L.k - 1)); }
      drawCounter(t, label, n, 'tane', false);
    } else drawCounter(t, ep.hero.label, ep.hero.value, ep.hero.unit, true);
  }

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    // geri sarma: sahne hızla geriye oynar (kırmızı önce söner), son kare = kare 0
    const vt = t >= tl.rw0 ? lerp(tl.rw0, 0, ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4))) : t;
    if (t >= tl.rw0) {
      const fade = ease.exit(seg(t, tl.rw0, 0.3));
      ctx.save(); ctx.globalAlpha = 1 - fade;
      drawCounter(t, ep.hero.label, ep.hero.value, ep.hero.unit, true); ctx.restore();
      ctx.save(); ctx.globalAlpha = fade; scene(vt, false); ctx.restore();
    } else {
      scene(vt, true);
      drawSay(t);
      drawSection(t);
    }
    if (t >= tl.rw0) { /* altyazı yok */ }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }

  return { render, duration: D, timeline: tl };
}

// "Şeker" şablonu (Kaç Sıfır?): Bütün insanlık bir çay şekerine sığar mı?
// Kare 0: soru başlık; ince belli çay bardağı, tabakta şeker küpü, uzaktan küpe akan küçük insanlar.
// l02: on'un kuvvetleri zoom'u (her katman gerçek boyunda, log uzayında): insan 2 m → el 12 cm → cilt hücreleri
//      0,2 mm → DNA 20 nm → atom 0,3 nm; "boşluk"ta çekirdek işaretlenir (bu ölçekte görünmez).
// l03: atom halkası 700 m'lik daireye dönüşür (1 px = 1 m): içinde 250 m'lik stadyum, merkezde 7 mm'lik bezelye
//      (büyüteçte). l04: masaya dönülür, 8,3 milyarın simgesi kalabalık; "boşluğu"nda küpe çöker. l05 (doruk): küp
//      kırmızı, ≈ 2,2 cm³. l06: 500 milyon ton: tabak çatlar, küp masayı delip yere gömülür. Anlatım saattir.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { GLASS_CARD, drawTeaGlass, drawSaucer, drawSugarCube, drawTinyPerson, drawHand, drawCells, drawDNA, drawAtom, drawStadium, drawPea } from '../seker_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// masa sahnesi
const TABLE = 1330, SAUCER = { x: 420, w: 400 }, GLASS = { x: 392, h: 330 }, CUBE = { x: 540, y: 1342, s: 52 };
const ZC = { x: 505, y: 1050 };   // zoom ve levha merkezi

export function sekerTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    atoms: Wd('l02', 'atomlardan'), empty: Wd('l02', 'boşluk'), pea: Wd('l03', 'bezelye'), stadium: Wd('l03', 'stadyumdan'),
    crowd: L.l04.t0, remove: Wd('l04', 'boşluğu'), hero: L.l05.t0 - 0.04, ton: Wd('l06', 'beş'), heavy: L.l07.t0, loop0: tl.loop0,
  };
  T.zoom0 = L.l02.t0 - 0.1; T.zoom1 = T.empty - 0.15; T.plate = L.l03.t0 - 0.35; T.back = L.l04.t0 - 0.45; T.follow = L.l07.end + 0.35;
  return T;
}

export async function makeSekerRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = sekerTimes(tl), Fx = ep.facts;
  const rnd = mulberry32(47);
  // döngüler: dikişte aynı fazda biter (D'ye tam bölünen periyot)
  const cyc = (t, per) => { const n = Math.max(1, Math.round(D / per)); return ((t / D) * n) % 1; };

  // ——— on'un kuvvetleri: katmanlar (gerçek genişlik m), çocuk merkezi ebeveyn biriminde ———
  const LEV = [
    { name: 'MASA', w: 50, draw: null },
    { name: 'İNSAN', w: 2, c: [0, 0] },
    { name: 'EL', w: 0.12, c: [0.11, 0.02] },
    { name: 'CİLT HÜCRELERİ', w: 2e-4, c: [-0.1, -0.5] },
    { name: 'DNA', w: 2e-8, c: [0.0, 0.0] },
    { name: 'ATOM', w: 3e-10, c: [0.12, 0.0415] },
  ];
  const K = 830 / 2;   // Zf = 0'da insan katmanı (2 m) ekrana sığar
  const Z = LEV.map(l => Math.log10(2 / l.w));   // her katmanın ekranı doldurduğu yakınlık
  // katman kökleri (dünya, m): masa sahnesinde kahraman kişinin konumu kökün yanında
  const O = [[0, 0]];
  for (let i = 1; i < LEV.length; i++) O.push([O[i - 1][0] + LEV[i].c[0] * LEV[i - 1].w, O[i - 1][1] + LEV[i].c[1] * LEV[i - 1].w]);
  const ZMIN = Z[0] + 0.12, ZMAX = Z[5] + 0.08;
  const zoomAt = t => t < T.zoom0 ? ZMIN : lerp(ZMIN, ZMAX, ease.state(seg(t, T.zoom0, T.zoom1 - T.zoom0)));
  function camF(z) {
    for (let i = 0; i < LEV.length - 1; i++) if (z < Z[i + 1]) { const u = ease.state(clamp01((z - Z[i]) / (Z[i + 1] - Z[i]))); return [lerp(O[i][0], O[i + 1][0], u), lerp(O[i][1], O[i + 1][1], u)]; }
    return O[LEV.length - 1];
  }
  const fmtLen = m => m >= 1 ? `${(m).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} m` : m >= 0.01 ? `${(m * 100).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} cm` : m >= 1e-3 ? `${(m * 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} mm` : m >= 1e-6 ? `${(m * 1e6).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} µm` : `${(m * 1e9).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} nm`;

  // masa sahnesi: kahraman kişi (zoom'un girdiği) akışın içinde, kökte
  const HERO_P = { x: 690, y: 1060 };   // ekran konumu (Zf = ZMIN)
  const stream = Array.from({ length: 44 }, (_, i) => ({ off: i / 44, lane: (rnd() - 0.5) * 2, ph: rnd() * 6 }));
  // yol: sağ üstten küpe (Sıfır'ın solundan)
  const PATH = [[880, 760], [800, 860], [740, 980], [690, 1060], [640, 1170], [590, 1270], [CUBE.x + 10, CUBE.y - 40]];
  const pathAt = u => { const n = PATH.length - 1, f = clamp01(u) * n, i = Math.min(n - 1, Math.floor(f)), v = f - i; return [lerp(PATH[i][0], PATH[i + 1][0], v), lerp(PATH[i][1], PATH[i + 1][1], v)]; };
  function tableScene(t, opt = {}) {
    // masa çizgisi ve gölge taraması
    const crack = opt.crack || 0, sink = opt.sink || 0;
    ctx.beginPath(); ctx.moveTo(60, TABLE); ctx.lineTo(1020, TABLE); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(60, TABLE, 960, 70); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1; for (let x = 0; x < 1100; x += 7) { ctx.beginPath(); ctx.moveTo(x, TABLE + 70); ctx.lineTo(x + 40, TABLE); ctx.stroke(); } ctx.restore();
    // masa kırığı (500 milyon ton)
    if (crack > 0) { ctx.save(); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(CUBE.x - 40 * crack, TABLE - 2); ctx.lineTo(CUBE.x - 10, TABLE + 72); ctx.lineTo(CUBE.x + 50, TABLE + 72); ctx.lineTo(CUBE.x + 60 * crack + 10, TABLE - 2); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      for (const [a, b, c2, d] of [[-60, 0, -110, 40], [70, 0, 130, 50], [-30, 10, -70, 70], [40, 10, 90, 70]]) { ctx.beginPath(); ctx.moveTo(CUBE.x + a * crack, TABLE + b); ctx.lineTo(CUBE.x + c2 * crack, TABLE + d * crack); ctx.lineWidth = 2; ctx.stroke(); } ctx.restore(); }
    ctx.save(); ctx.translate(SAUCER.x, TABLE - 6); ctx.rotate(-0.04 * crack); drawSaucer(ctx, SAUCER.w, crack); ctx.restore();
    ctx.save(); ctx.translate(GLASS.x, TABLE - 8); drawTeaGlass(ctx, GLASS_CARD, { tea: 0.8, steam: cyc(t, 2.4) * 2.4, tilt: -0.05 * crack }, GLASS.h); ctx.restore();
    // şeker küpü
    if (!opt.noCube) { ctx.save(); ctx.translate(CUBE.x, CUBE.y + sink * 260); drawSugarCube(ctx, CUBE.s * (opt.cubeScale || 1), opt.red ? 'red' : 'paper'); ctx.restore(); }
    // akan insanlar: uzaktan büyük, küpe yaklaştıkça küçülür
    if (opt.stream !== false) {
      const k = opt.stream ?? 1;
      for (const s of stream) {
        const u = (s.off + cyc(t, 4.4)) % 1, [x, y] = pathAt(u), sz = lerp(30, 4, Math.pow(u, 0.8)) * k;
        if (sz < 1) continue;
        ctx.save(); ctx.globalAlpha = Math.min(1, u * 8) * clamp01((1 - u) * 14); ctx.translate(x + s.lane * 14 * (1 - u), y); drawTinyPerson(ctx, sz, s.ph + t * 7); ctx.restore();
      }
    }
  }
  // on'un kuvvetleri: masadan atoma
  function zoomStage(t) {
    const z = zoomAt(t), cam = camF(z), s = K * Math.pow(10, z);   // px / m
    const cu = ease.state(clamp01((z - ZMIN) / 1.2)), cx0 = lerp(HERO_P.x, ZC.x, cu), cy0 = lerp(HERO_P.y, ZC.y, cu);
    const toS = P => [cx0 + (P[0] - cam[0]) * s, cy0 + (P[1] - cam[1]) * s];
    // masa katmanı: kahraman kişi kökte; sahne kendi pikselleriyle büyür
    const pMasa = LEV[0].w * s;   // masa katmanının piksel genişliği
    if (pMasa < 60000) {
      const g = pMasa / (LEV[0].w * K * Math.pow(10, ZMIN)), [hx, hy] = toS(O[0]);
      ctx.save(); ctx.translate(hx, hy); ctx.scale(g, g); ctx.translate(-HERO_P.x, -HERO_P.y);
      tableScene(t, { stream: 1 }); ctx.restore();
    }
    // insan → el → hücre → DNA → atom: kutu içinde, kâğıt zemin, kendi gerçek boyunda
    for (let i = 1; i < LEV.length; i++) {
      const p = LEV[i].w * s; if (p < 10 || (i < LEV.length - 1 && LEV[i + 1].w * s > 4000)) continue;
      const [x, y] = toS(O[i]);
      ctx.save(); ctx.translate(x, y);
      if (i >= 3) { ctx.beginPath(); ctx.rect(-p / 2, -p / 2, p, p); ctx.clip(); }
      if (i === 1) { if (p > 300) { ctx.globalAlpha = clamp01((p - 300) / 300); ctx.fillStyle = C.paper; ctx.fillRect(-p / 2, -p / 2, p, p); ctx.globalAlpha = 1; } ctx.save(); ctx.translate(0, p * 0.42); drawTinyPerson(ctx, p * 0.85, 0); ctx.restore(); }
      else if (i === 2) { ctx.fillStyle = C.paper; ctx.fillRect(-p / 2, -p / 2, p, p); drawHand(ctx, p); }
      else if (i === 3) drawCells(ctx, p);
      else if (i === 4) drawDNA(ctx, p, t * 0.6);
      else drawAtom(ctx, p, t);
      ctx.restore();
      // kutu çerçevesi ve adı (küçükken): bir sonraki katman burada
      if (p < 700 && i >= 2) { ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(x - p / 2, y - p / 2, p, p); if (p > 40) { setFont(ctx, F.mono(30)); const lb = LEV[i].name, tw = ctx.measureText(lb).width; const lx = Math.min(SAFE.x1 - tw - 6, Math.max(SAFE.x0, x + p / 2 + 12)), ly = Math.max(STAGE_TOP + 48, y - p / 2 + 26); ctx.fillStyle = C.paper; ctx.fillRect(lx - 6, ly - 28, tw + 12, 38); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(lb, lx, ly); } ctx.restore(); }
    }
    // atomda: çekirdek burada (görünmeyecek kadar küçük)
    if (t >= T.empty - 0.3) {
      const k = ease.enter(seg(t, T.empty - 0.3, 0.4)), [x, y] = toS(O[5]);
      ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 14, y - 14); ctx.lineTo(x + 120, y - 150); ctx.lineWidth = 2; ctx.stroke();
      setFont(ctx, F.mono(32)); ctx.textAlign = 'left'; const l1 = 'ÇEKİRDEK BURADA', l2 = 'bu ölçekte görünmez'; const tw = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width);
      ctx.fillStyle = C.paper; ctx.fillRect(x + 112, y - 222, tw + 16, 84); ctx.fillStyle = C.ink; ctx.fillText(l1, x + 120, y - 186); ctx.fillStyle = C.graphite; ctx.fillText(l2, x + 120, y - 150); ctx.restore();
    }
    let li = 1; for (let i = 1; i < LEV.length; i++) if (z >= Z[i] - 0.5) li = i;
    return { z, levelName: LEV[li].name, realW: 830 / s };
  }

  // ——— stadyum levhası (l03): 1 px = 1 m; atom 700 m'lik daireye dönüşür ———
  function stadiumPlate(t, k) {
    if (k <= 0) return null;
    ctx.save(); ctx.globalAlpha = t < T.back - 0.4 ? k : 1;
    if (t >= T.back - 0.4) { const e = ease.exit(seg(t, T.back - 0.4, 0.45)), sc = lerp(1, 0.02, e); ctx.translate(lerp(ZC.x, CUBE.x + 6, e), lerp(ZC.y, CUBE.y - 26, e)); ctx.scale(sc, sc); ctx.translate(-ZC.x, -ZC.y); }
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    const z = 1 + 0.1 * seg(t, T.plate, T.back - T.plate); ctx.translate(ZC.x, ZC.y); ctx.scale(z, z); ctx.translate(-ZC.x, -ZC.y);
    // atom bulutu sınırı: 700 m çaplı daire (noktalı bulut kenarı)
    const R = 350;
    ctx.fillStyle = C.ink; const r2 = mulberry32(9); for (let i = 0; i < 900; i++) { const a = r2() * Math.PI * 2, rr = R * (0.55 + 0.45 * Math.sqrt(r2())); ctx.fillRect(ZC.x + Math.cos(a) * rr, ZC.y + Math.sin(a) * rr, 2.2, 2.2); }
    ctx.beginPath(); ctx.arc(ZC.x, ZC.y, R, 0, Math.PI * 2); ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
    // stadyum 'stadyumdan'da çizilir
    const us = ease.enter(seg(t, T.stadium - 0.2, 0.6));
    if (us > 0) { ctx.save(); ctx.translate(ZC.x, ZC.y); ctx.scale(lerp(0.6, 1, us), lerp(0.6, 1, us)); ctx.globalAlpha = k * us; drawStadium(ctx, 1); ctx.restore(); }
    // merkez: bezelye 7 mm = 0,007 px (görünmez) → halka
    ctx.beginPath(); ctx.arc(ZC.x, ZC.y, 12, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // etiketler
    setFont(ctx, F.mono(32)); ctx.textAlign = 'left';
    const lab = (s, x, y, a = 1) => { if (a <= 0) return; const tw = ctx.measureText(s).width; ctx.save(); ctx.globalAlpha = k * a; ctx.fillStyle = C.paper; ctx.fillRect(x - 6, y - 28, tw + 12, 38); ctx.fillStyle = C.ink; ctx.fillText(s, x, y); ctx.restore(); };
    lab('ATOM ≈ 700 m', ZC.x + 140, ZC.y - R + 40);
    lab('STADYUM ≈ 250 m', ZC.x - 130, ZC.y + 128, us);
    lab('ÇEKİRDEK = 7 mm', ZC.x + 26, ZC.y - 18, ease.enter(seg(t, T.pea - 0.1, 0.4)));
    ctx.restore();
    return [ZC.x, ZC.y];
  }

  // ——— kalabalık ve çöküş (l04–l05) ———
  const CROWD = Array.from({ length: 820 }, () => { let x, y; do { x = 110 + rnd() * 800; y = 760 + rnd() * 520; } while ((x > 260 && x < 560 && y > 960) || (x > 760 && y > 1180)); return { x, y, d: rnd(), ph: rnd() * 6, s: 10 + rnd() * 8 }; });
  const implode = t => ease.state(seg(t, T.remove, T.hero - T.remove));
  function crowdScene(t) {
    const v = implode(t), cx = CUBE.x + 6, cy = CUBE.y - 26;
    for (const p of CROWD) {
      const w = clamp01((v - p.d * 0.35) / 0.65), e = w * w * (3 - 2 * w);
      if (e >= 0.999) continue;
      const a = e * 2.2, dx = p.x - cx, dy = p.y - cy, r = Math.hypot(dx, dy) * (1 - e), th = Math.atan2(dy, dx) + a;
      const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r, sz = p.s * (1 - e * 0.9);
      ctx.save(); ctx.translate(x, y); drawTinyPerson(ctx, sz, p.ph + t * 6); ctx.restore();
    }
  }

  // ——— büyüteç ———
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 16, at[1] - Math.sin(ang) * 16); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    if (kind === 'pea') {
      // gerçek boy: 7 mm'lik bezelye, cetvel
      drawPea(ctx, 120);
      ctx.beginPath(); ctx.moveTo(-60, 86); ctx.lineTo(60, 86); ctx.moveTo(-60, 78); ctx.lineTo(-60, 94); ctx.moveTo(60, 78); ctx.lineTo(60, 94); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('7 mm', 0, 122);
    } else if (kind === 'cube') {
      // çay şekeri yakın planı: 2,2 cm³ (kırmızı) ve tipik çay şekeri 4 cm³ (kesik çizgi)
      ctx.save(); ctx.translate(-8, 64); drawSugarCube(ctx, 138, 'paper'); ctx.restore();
      ctx.save(); ctx.translate(-8, 64); drawSugarCube(ctx, 112, t >= T.hero - 0.02 ? 'red' : 'paper'); ctx.restore();
      setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('≈ 2,2 cm³', 0, 104);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.empty, 'sasirma', 'saskin'], [T.empty + 1.4, 'ayakta', 'dusunceli'], [T.stadium, 'sasirma', 'saskin'], [T.stadium + 1.4, 'ayakta', 'notr'],
    [T.remove, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'notr'], [T.ton, 'sasirma', 'saskin'], [T.heavy, 'ayakta', 'mutlu'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.hero + 0.15, T.hero + 1.7, 'Şekere mi?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.save(); ctx.beginPath(); ctx.ellipse(SIFIR.x, SIFIR.y - 46, 72, 70, 0, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = 840 - w, y = SIFIR.y - 250;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 60); ctx.lineTo(x + w - 54, y + 24);
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
    setFont(ctx, F.head(96)); revealText(ctx, 'Bütün insanlık', SAFE.x0, 470, 96, k, C.ink); revealText(ctx, 'bir çay şekerine', SAFE.x0, 566, 96, k, C.ink); revealText(ctx, 'sığar mı?', SAFE.x0, 662, 96, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.ink, 'right');
  }
  let lastZoom = null;
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const p = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) * (t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1);
    if (t < L.l03.t0 - 0.06) {
      const zs = lastZoom; const real = zs ? zs.realW : 2;
      const [num, unit] = fmtLen(real).split(' ');
      row({ label: 'GÖRÜŞ ALANI', num, unit, right1: zs ? zs.levelName : 'İNSAN', right2: 'HER ADIMDA 10 KAT', p });
      return;
    }
    if (t < L.l04.t0 - 0.06) { row({ label: 'ATOM / ÇEKİRDEK', num: '100.000', unit: 'kat', right1: 'ATOM ≈ 700 m', right2: 'ÇEKİRDEK = 7 mm', p }); return; }
    if (t < T.hero - 0.02) { row({ label: 'İNSANLIK', num: '8,3 milyar', unit: 'kişi', right1: '≈ 515 MİLYON TON', right2: 'ORTALAMA 62 kg', p }); return; }
    if (t < T.ton - 0.04) { row({ label: 'BOŞLUKSUZ İNSANLIK', num: '2,2', unit: 'cm³', red: true, right1: 'ÇAY ŞEKERİ ≈ 4 cm³', right2: 'DAHA KÜÇÜK', p }); return; }
    row({ label: 'AYNI ŞEKER KÜPÜNÜN AĞIRLIĞI', num: '500 milyon', unit: 'ton', red: true, right1: 'HACMİ ≈ 2,2 cm³', right2: '', p });
  }
  function follow(t) {
    if (t < T.follow || t >= T.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 470;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 760, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 760, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 805); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    let at = null; lastZoom = null;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    const inZoom = t >= T.zoom0 - 0.01 && t < T.plate + 0.5;
    const back = t >= T.back;
    if (!back) {
      if (inZoom) { lastZoom = zoomStage(t); }
      else {
        // kare 0: masa; çok yavaş itme (%4) kahraman kişiye doğru (zoom'un başlangıcıyla süreklilik)
        ctx.save(); const z = 1 + 0.04 * seg(t, 0, T.zoom0); ctx.translate(HERO_P.x, HERO_P.y); ctx.scale(z, z); ctx.translate(-HERO_P.x, -HERO_P.y); tableScene(t); ctx.restore();
      }
      at = stadiumPlate(t, t >= T.plate ? ease.state(seg(t, T.plate, 0.5)) : 0);
    } else {
      // masaya dönüş: kalabalık, çöküş, doruk, ağırlık
      const kin = ease.state(seg(t, T.back, 0.45));
      const crack = ease.enter(seg(t, T.ton, 0.5)), sink = ease.state(seg(t, T.ton + 0.2, 1.4));
      const loopK = t >= T.loop0 ? ease.state(seg(t, T.loop0, D - T.loop0 - 0.05)) : 0;   // döngü: masa eski hâline
      const hero = t >= T.hero - 0.02 && t < T.loop0;
      // sahne itişi: dorukta küpe %8; döngüde kare 0'ın hâline
      const z = t < T.hero ? 1 + 0.06 * seg(t, T.back, T.hero - T.back) : lerp(1.06 + 0.06 * seg(t, T.hero, T.loop0 - T.hero), 1, loopK);
      const zx = lerp(CUBE.x, HERO_P.x, loopK), zy = lerp(CUBE.y - 30, HERO_P.y, loopK);
      ctx.save(); ctx.globalAlpha = kin; ctx.translate(zx, zy); ctx.scale(z, z); ctx.translate(-zx, -zy);
      tableScene(t, { stream: loopK, crack: crack * (1 - loopK), sink: sink * (1 - loopK), red: hero, noCube: false });
      if (t < T.hero + 0.3) crowdScene(t);
      ctx.restore();
      // doruk yakın planı ve ağırlık etiketi
      if (t >= T.hero - 0.02 && t < T.loop0) {
        const pop = spring(t - T.hero, 120, 24);
        setFont(ctx, F.mono(34)); ctx.textAlign = 'left'; const l1 = t >= T.ton ? '≈ 500 MİLYON TON' : 'BÜTÜN İNSANLIK ≈ 2,2 cm³';
        const tw = ctx.measureText(l1).width, lx = 600, ly = 1150 + sink * (1 - loopK) * 120;
        ctx.save(); ctx.globalAlpha = Math.min(1, pop * 1.3); ctx.fillStyle = C.paper; ctx.fillRect(lx - 8, ly - 30, tw + 16, 42); ctx.fillStyle = C.red; ctx.fillText(l1, lx, ly); ctx.restore();
        ctx.beginPath(); ctx.moveTo(lx - 10, ly - 4); ctx.lineTo(CUBE.x + 30, CUBE.y - 30 + sink * 260 * (1 - loopK)); ctx.lineWidth = 2; ctx.strokeStyle = C.red; ctx.stroke();
      }
      at = [CUBE.x, CUBE.y - 26];
    }
    ctx.restore();
    // büyüteç: l03 bezelye, doruk çay şekeri yakın planı
    if (t >= T.pea - 0.2 && t < T.back) roundel(t, 'pea', ROUND, ease.enter(seg(t, T.pea - 0.2, 0.4)) * (1 - ease.exit(seg(t, T.back - 0.35, 0.3))), [ZC.x, ZC.y]);
    if (t >= T.hero - 0.1 && t < T.ton) roundel(t, 'cube', ROUND, ease.enter(seg(t, T.hero - 0.1, 0.4)) * (1 - ease.exit(seg(t, T.ton - 0.3, 0.3))), null);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    follow(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
    void at;
  }
  return { duration: D, timeline: { T }, render };
}

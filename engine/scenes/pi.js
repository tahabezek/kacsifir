// "Pi" şablonu (Kaç Sıfır?): Bütün evreni ölçmek için pi sayısının kaç basamağı yeter?
// Kare 0: soru başlık; gravür pi işareti, çevresinde pi basamaklarından bir halka ve ters dönen ikinci halka.
// l02: "sonsuza" ile iç ve dış halkalar belirir (basamaklar kaldığı yerden sürer); "bilgisayarlar" ile halkalar
//      hızlanır; "üç yüz on dört trilyon" sayaçta. l03: ana halka düz bir şeride açılır (nesne taşınır):
//      3,141592653589793 mürekkep, gerisi gri; "on beş"te 15. ondalıktan sonra kesik çizgi; üstte uzay aracı.
// l04: şerit kadrajı dolduran çembere kıvrılır: merkezde Güneş, çemberde Voyager 1 ve canlı uzaklık sayacı
//      (17 km/sn); büyüteç: gerçek çember ile 15 basamaklı çember arasında 1 cm, ölçek için parmak ucu.
// l05: log ölçekte geri çekil (her halka gerçek yarıçap; solda HER ÇİZGİ 10 KAT cetveli), "46 milyar ışık yılı"
//      ≥ 1,25 sn kalır. l06: evren küçülür, büyüteçte hidrojen atomu; sayaçta gri "?". Sessizlik. l06b (doruk):
//      "otuz yedi"de 37 ondalık basamak iki satır, kırmızı ayraç ve kırmızı 37. l07: kalan basamaklar üçüncü
//      satırda akar, şerit yeniden halkaya kıvrılır; takip. Anlatım saattir; her kare t'nin saf fonksiyonu.
import { W, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { piString, PI_CHECK, drawPiMark, drawSun, drawFingertip, drawHydrogen, drawSpiral, drawGalaxyMark, drawJupiterSmall, drawEarthSmall } from '../pi_chars.js';
import { drawVoyager, VOYAGER_CARD } from '../voyager_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const SIFIR = { x: 872, y: 1412, H: 92 };
const LAB = 40;                                     // sahne etiketleri (mono, telefonda okunur)
const RC = { x: 500, y: 1062 }, R0 = 330;          // pi halkası
const CC = { x: 520, y: 1130 }, CR = 420;          // Voyager çemberi (kadrajı doldurur) ve log ölçek merkezi
const UEND = 340 / CR;                             // log ölçeğin sonunda evren çemberi 340 px
const UC2 = { x: 590, y: 900 }, UR2 = 170;         // doruğa doğru küçülen evren
const LENS_CM = { a: (225 * Math.PI) / 180 }, LENS_R = 120;
const LENS_H = { x: 300, y: 1230 };                 // hidrojen büyüteci (küçük evrenin sol altında, çizgiyle bağlı)
const TAPE = { x: 90, y: 1010, fs: 76 };            // l03 şeridi
const HERO = { y1: 1214, y2: 1290, y3: 1366, fs: 52 }; // doruk basamak satırları (3. satır: akan gri basamaklar)
const LY = 9.4607e15;
const LEVELS = [
  { R: 2.577e13, name: 'VOYAGER 1' },
  { R: 4.0e16, name: 'EN YAKIN YILDIZ' },
  { R: 4.73e20, name: 'SAMANYOLU' },
  { R: 4.73e22, name: 'YEREL GRUP' },
  { R: 4.35e26, name: 'GÖZLEMLENEBİLİR EVREN' },
];
// sayaç başlığındaki bölge adı (log yarıçapa göre)
const REGIONS = [[13.55, 'VOYAGER 1'], [16.9, 'YILDIZLAR ARASI'], [20.9, 'SAMANYOLU'], [23.0, 'YEREL GRUP'], [26.2, 'GALAKSİLER ARASI'], [99, 'GÖZLEMLENEBİLİR EVREN']];

export function piTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    sonsuz: Wd('l02', 'sonsuza'), bilg: Wd('l02', 'bilgisayarlar'), uc: Wd('l02', 'üç'),
    nasa: Wd('l03', 'NASA'), uzay: Wd('l03', 'uzay'), on: Wd('l03', 'on'),
    voy: Wd('l04', 'Voyager'), birin: Wd('l04', "bir'in"), cm: Wd('l04', 10),
    hyd: Wd('l06', 'hidrojen'), hes: Wd('l06', 'hesaplamak'), otuz: Wd('l06b', 'otuz'),
    loop0: tl.loop0,
  };
  T.unroll = L.l03.t0 - 0.35; T.tape = T.unroll + 0.75;
  T.curl = L.l04.t0 - 0.3; T.circ = T.curl + 0.7; T.lens = T.cm - 0.45;
  T.zoom0 = L.l05.t0 - 0.1; T.zoom1 = L.l06.t0 - 0.2; T.shrink = L.l06.t0 + 0.3;
  T.hero = T.otuz - 0.04;
  T.rest = L.l07.t0; T.recurl = L.l07.t0 + 1.0; T.ring = T.recurl + 0.8;
  T.follow = L.l07.end + 0.35;
  return T;
}

export async function makePiRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = piTimes(tl);
  const PI = piString(1600);
  if (!PI.startsWith(PI_CHECK)) throw new Error('pi basamakları hatalı');
  const cyc = (t, per) => { const n = Math.max(1, Math.round(D / per)); return ((t / D) * n) % 1; };   // dikişte aynı fazda biter

  // ——— halkalar: her halka basamakları kaldığı yerden sürdürür ———
  const RINGS = [];
  { let idx = 0; const spec = [[R0, 30], [R0 + 46, 27], [R0 - 46, 27], [R0 + 92, 26], [R0 - 92, 25], [R0 + 138, 26], [R0 - 138, 24], [R0 + 184, 26], [R0 + 230, 26]];
    for (const [r, fs] of spec) { const step = fs * 0.64, n = Math.floor((2 * Math.PI * r) / step); RINGS.push({ r, fs, n, i0: idx, da: (2 * Math.PI) / n }); idx += n; } }
  // dönüş: film boyunca tam 3 tur (dikişte aynı açı) + l02'de yarım tur hızlanma (halka gizliyken sıfırlanır)
  const ringAng = t => -Math.PI / 2 - 2 * Math.PI * ((3 * t) / D + (t < T.recurl - 0.05 ? 0.5 * ease.state(seg(t, T.bilg, T.unroll - T.bilg)) : 0));
  const ringMul = k => (k === 2 ? -1 : k % 2 ? -0.8 : 1);
  const ringPos = (k, j, t) => { const R = RINGS[k], a = ringAng(t) * ringMul(k) + j * R.da; return [RC.x + Math.cos(a) * R.r, RC.y + Math.sin(a) * R.r, a + Math.PI / 2]; };
  function glyph(ch, x, y, rot, fs, col, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); if (rot) ctx.rotate(rot); setFont(ctx, F.mono(fs)); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 0); ctx.restore();
  }
  // ek halkalar: l02'de sırayla girer, l03'te söner; l07'de geri gelir, döngüde söner. İç halka (k=2) kare 0'dan
  // itibaren yarı soluk ve ters yönde döner (kanca hareketi; dikişte de aynı)
  const extraK = (k, t) => {
    if (k === 0) return 1;
    const inA = ease.enter(seg(t, T.sonsuz + 0.08 * (k - 1), 0.5)) * (1 - ease.exit(seg(t, T.unroll - 0.05, 0.3)));
    const inF = ease.enter(seg(t, T.ring + 0.08 * (k - 1), 0.5)) * (1 - ease.exit(seg(t, T.loop0 + 0.2, 0.5)));
    const base = k !== 2 ? 0 : 0.5 * (t < T.ring ? 1 - ease.exit(seg(t, T.unroll - 0.05, 0.3)) : ease.enter(seg(t, T.ring, 0.5)));
    return Math.max(inA, inF, base);
  };
  function rings(t, mainK = 1) {
    for (let k = RINGS.length - 1; k >= 0; k--) {
      const K = k === 0 ? mainK : extraK(k, t); if (K <= 0) continue;
      const R = RINGS[k], slide = k === 0 || k === 2 ? 0 : (1 - K) * (R0 - R.r);
      for (let j = 0; j < R.n - (k === 0 ? 2 : 0); j++) {
        const [x0, y0, rot] = ringPos(k, j, t), ux = (x0 - RC.x) / R.r, uy = (y0 - RC.y) / R.r;
        const x = x0 + ux * slide, y = y0 + uy * slide;
        if (y < STAGE_TOP - 20 || x < -30 || x > W + 30) continue;
        glyph(PI[R.i0 + j], x, y, rot, R.fs, k === 0 ? C.ink : C.graphite, K);
      }
    }
  }
  function piMark(t, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k; ctx.translate(RC.x, RC.y); drawPiMark(ctx, 300); ctx.restore();
  }
  function paperLabel(s, x, y, align = 'left', col = C.ink) {
    const tw = ctx.measureText(s).width, x0 = align === 'left' ? x : align === 'right' ? x - tw : x - tw / 2;
    const xa = Math.max(SAFE.x0, Math.min(SAFE.x1 - tw, x0));
    ctx.fillStyle = C.paper; ctx.fillRect(xa - 8, y - 34, tw + 16, 46); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, xa, y);
  }

  // ——— şerit (l03) ———
  let CW = 0; { setFont(ctx, F.mono(TAPE.fs)); CW = ctx.measureText('0').width; }
  const tapeX = i => TAPE.x + i * CW + CW / 2;
  const heroCW = (() => { setFont(ctx, F.mono(HERO.fs)); return ctx.measureText('0').width; })();
  const tailCW = (() => { setFont(ctx, F.mono(LAB)); return ctx.measureText('0').width; })();
  const heroPos = i => (i < 20 ? [SAFE.x0 + i * heroCW + heroCW / 2, HERO.y1, HERO.fs] : i < 39 ? [SAFE.x0 + (i - 20) * heroCW + heroCW / 2, HERO.y2, HERO.fs] : [SAFE.x0 + (i - 39) * tailCW + tailCW / 2, HERO.y3, LAB]);
  // açılış: ana halkanın ilk 40 karakteri şeride uçar (sırayla, toplam ≤ 0,75 sn)
  const NFLY = 40;
  function unroll(t, reverse = false) {
    const t0 = reverse ? T.recurl : T.unroll;
    for (let i = 0; i < NFLY; i++) {
      const u = ease.state(seg(t, t0 + 0.009 * i, 0.42)), v = reverse ? 1 - u : u;
      const [rx, ry, rot] = ringPos(0, i, t);
      const [tx, ty, tfs] = reverse ? heroPos(i) : [tapeX(i), TAPE.y, TAPE.fs];
      glyph(PI[i], lerp(rx, tx, v), lerp(ry, ty, v), rot * (1 - v), lerp(RINGS[0].fs, tfs, v), reverse ? (i < 39 ? C.ink : C.graphite) : i < 17 ? C.ink : C.graphite);
    }
    const rest = reverse ? ease.enter(seg(t, T.recurl + 0.3, 0.4)) : 1 - ease.exit(seg(t, T.unroll, 0.3));
    if (rest > 0) for (let j = NFLY; j < RINGS[0].n - 2; j++) { const [x, y, rot] = ringPos(0, j, t); glyph(PI[j], x, y, rot, RINGS[0].fs, C.ink, rest); }
  }
  const E = { x: 150, y: 862 }, J = { x: 790, y: 818 };
  const arc = u => [lerp(E.x, J.x, u), lerp(E.y, J.y, u) - Math.sin(Math.PI * u) * 96];
  function planets(k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k;
    ctx.beginPath(); for (let u = 0; u <= 1.001; u += 0.02) { const [x, y] = arc(u); u ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.setLineDash([6, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(E.x, E.y); drawEarthSmall(ctx, 26); ctx.restore();
    ctx.save(); ctx.translate(J.x, J.y); drawJupiterSmall(ctx, 44); ctx.restore();
    setFont(ctx, F.mono(LAB)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('DÜNYA', E.x + 6, E.y + 72); ctx.fillText('JÜPİTER', J.x, J.y + 94);
    ctx.restore();
  }
  function tapeScene(t) {
    const cut = ease.enter(seg(t, T.on, 0.3));
    const drift = ease.state(seg(t, T.on + 0.2, 1.4)) * 160 + 14 * seg(t, T.tape, T.curl - T.tape);
    const zz = 1 + 0.04 * seg(t, T.tape, T.curl - T.tape);   // yavaş itme
    ctx.save(); ctx.translate(540, 1000); ctx.scale(zz, zz); ctx.translate(-540, -1000);
    for (let i = 0; i < 60; i++) {
      let x = tapeX(i); if (i >= 17) x += drift;
      if (x > W + 50) break;
      const fadeX = i >= 17 ? clamp01((1040 - x) / 300) * (1 - 0.45 * cut) : 1;
      glyph(PI[i], x, TAPE.y, 0, TAPE.fs, i < 17 ? C.ink : C.graphite, fadeX);
    }
    if (cut > 0) {
      const xa = tapeX(2) - CW / 2, xb = tapeX(16) + CW / 2, y = TAPE.y + 62;
      ctx.save(); ctx.globalAlpha = cut; ctx.beginPath(); ctx.moveTo(xa, y - 12); ctx.lineTo(xa, y); ctx.lineTo(xb, y); ctx.lineTo(xb, y - 12); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(LAB)); ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.fillText('15 ONDALIK BASAMAK', xa, y + 56);
      const xc = xb + 8 + drift * 0.08; ctx.beginPath(); ctx.moveTo(xc, TAPE.y - 80); ctx.lineTo(xc, TAPE.y + 40); ctx.setLineDash([9, 7]); ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
    planets(ease.enter(seg(t, T.uzay - 0.2, 0.4)) * (1 - ease.exit(seg(t, T.curl - 0.2, 0.2))));
    const k = ease.enter(seg(t, T.uzay - 0.2, 0.4)) * (1 - ease.exit(seg(t, T.curl - 0.2, 0.2)));
    if (k > 0) {
      const u = ease.state(seg(t, T.uzay, L.l03.end + 0.4 - T.uzay)), [x, y] = arc(0.05 + 0.78 * u), [x2, y2] = arc(0.06 + 0.78 * u);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(x, y); drawVoyager(ctx, VOYAGER_CARD, { tilt: Math.atan2(y2 - y, x2 - x) * 0.3, detail: 0.3 }, 50); ctx.restore();
    }
    ctx.restore();
  }

  // ——— Voyager çemberi (l04) ———
  const lensCM = () => [CC.x + Math.cos(LENS_CM.a) * CR, CC.y + Math.sin(LENS_CM.a) * CR];
  const VA = (-60 * Math.PI) / 180;
  function curlIn(t) {
    for (let i = 0; i < 24; i++) {
      const u = ease.state(seg(t, T.curl + 0.012 * i, 0.4)), a = -Math.PI / 2 - 0.7 + i * 0.058;
      const x = lerp(tapeX(i) + (i >= 17 ? 160 : 0), CC.x + Math.cos(a) * CR, u), y = lerp(TAPE.y, CC.y + Math.sin(a) * CR, u);
      glyph(PI[i], x, y, u * (a + Math.PI / 2), lerp(TAPE.fs, 26, u), i < 17 ? C.ink : C.graphite, 1 - seg(t, T.curl + 0.35 + 0.012 * i, 0.25));
    }
  }
  function voyagerScene(t, k = 1) {
    if (k <= 0) return;
    const draw = ease.state(seg(t, T.curl + 0.2, 0.6)), creep = 1 + 0.05 * seg(t, T.circ, T.zoom0 - T.circ);
    ctx.save(); ctx.globalAlpha *= k; ctx.translate(CC.x, CC.y); ctx.scale(creep, creep); ctx.translate(-CC.x, -CC.y);
    ctx.beginPath(); ctx.arc(CC.x, CC.y, CR, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * draw); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    const ks = ease.enter(seg(t, T.curl + 0.35, 0.3));
    if (ks > 0) { ctx.save(); ctx.globalAlpha *= ks; ctx.translate(CC.x, CC.y); drawSun(ctx, 20, t * 0.25); ctx.restore(); ctx.save(); ctx.globalAlpha *= ks; setFont(ctx, F.mono(LAB)); paperLabel('GÜNEŞ', CC.x + 44, CC.y + 66); ctx.restore(); }
    const kv = ease.enter(seg(t, T.voy - 0.1, 0.4));
    if (kv > 0) {
      const vx = CC.x + Math.cos(VA) * CR, vy = CC.y + Math.sin(VA) * CR;
      ctx.save(); ctx.globalAlpha *= kv;
      ctx.beginPath(); ctx.moveTo(CC.x, CC.y); ctx.lineTo(lerp(CC.x, vx, kv), lerp(CC.y, vy, kv)); ctx.setLineDash([8, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(vx, vy); drawVoyager(ctx, VOYAGER_CARD, { tilt: -0.3, detail: 0.5 }, 60); ctx.restore();
      setFont(ctx, F.mono(LAB)); paperLabel('VOYAGER 1', vx - 64, vy + 18, 'right');
      // Güneş'e uzaklık (JPL Horizons, 4 Kasım 2026: 172,24 AU = 25,77 milyar km)
      const mx = lerp(CC.x, vx, 0.5) + 10, my = lerp(CC.y, vy, 0.5);
      paperLabel("GÜNEŞ'E UZAKLIK", mx, my - 8, 'center'); paperLabel('YAKLAŞIK 25,8 MİLYAR km', mx, my + 40, 'center');
      ctx.restore();
    }
    ctx.restore();
  }
  // büyüteç; mode 'cm': Voyager çemberinin üzerinde; 'h': küçük evrenin yanında, çizgiyle bağlı
  function lens(t, k, mode) {
    if (k <= 0) return;
    const [px, py] = mode === 'cm' ? lensCM() : [LENS_H.x, LENS_H.y], r = LENS_R * ease.enter(k);
    if (mode === 'h') { const ta = (150 * Math.PI) / 180, cx = UC2.x + Math.cos(ta) * UR2, cy = UC2.y + Math.sin(ta) * UR2, ang = Math.atan2(cy - py, cx - px); ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(px + Math.cos(ang) * (r + 4), py + Math.sin(ang) * (r + 4)); ctx.lineTo(cx, cy); ctx.lineWidth = 2.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(px, py); ctx.scale(r / LENS_R, r / LENS_R);
    if (mode === 'cm') {
      // gerçek çember (dolu) ve 15 basamaklı çember (kesik) arası 1 cm = 60 px; parmak ucu tırnağı 1 cm
      ctx.beginPath(); ctx.moveTo(-30, -130); ctx.lineTo(-30, 130); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, -130); ctx.lineTo(30, 130); ctx.setLineDash([10, 8]); ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(0, 96); drawFingertip(ctx, 60); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-30, -62); ctx.lineTo(30, -62); ctx.moveTo(-30, -72); ctx.lineTo(-30, -52); ctx.moveTo(30, -72); ctx.lineTo(30, -52); ctx.lineWidth = 2.5; ctx.stroke();
      setFont(ctx, F.mono(LAB)); const tw = ctx.measureText('1 cm').width; ctx.textAlign = 'center'; ctx.fillStyle = C.paper; ctx.fillRect(-tw / 2 - 6, -118, tw + 12, 46); ctx.fillStyle = C.ink; ctx.fillText('1 cm', 0, -84);
    } else {
      // hata (0,085 nm) < hidrojen atomu (0,1 nm = 120 px)
      ctx.save(); ctx.translate(0, 8); drawHydrogen(ctx, 120, t); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-51, -130); ctx.lineTo(-51, 130); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(51, -130); ctx.lineTo(51, 130); ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
    if (k > 0.6) { setFont(ctx, F.mono(LAB)); ctx.save(); ctx.globalAlpha = clamp01((k - 0.6) / 0.4); paperLabel(mode === 'cm' ? 'BÜYÜTEÇ' : 'BÜYÜTEÇ: HİDROJEN ATOMU', px - LENS_R, py + LENS_R + 50); ctx.restore(); }
  }

  // ——— log ölçek: Voyager → gözlemlenebilir evren ———
  const z0 = Math.log10(LEVELS[0].R), z1 = Math.log10(LEVELS[4].R);
  const zAt = t => lerp(z0, z1, ease.state(seg(t, T.zoom0, T.zoom1 - T.zoom0)));
  const zoomK = t => lerp(1.05, UEND, ease.state(seg(t, T.zoom0, T.zoom1 - T.zoom0)));
  const GAL = (() => { const r = mulberry32(57), a = []; for (let i = 0; i < 300; i++) { const q = Math.sqrt(r()) * 0.94, th = r() * Math.PI * 2; a.push({ x: Math.cos(th) * q, y: Math.sin(th) * q, s: 2.5 + r() * 5, ang: r() * 3, ph: r() * 6 }); } return a; })();
  const FIELD = (() => { const r = mulberry32(71), a = []; for (let i = 0; i < 1300; i++) { const lz = lerp(13.2, 26.75, r()), th = r() * Math.PI * 2; a.push({ R: Math.pow(10, lz), th, gal: lz > 21.6, sz: 1.6 + r() * 1.6, ang: r() * 3 }); } return a; })();
  function field(t, s, center) {
    for (const o of FIELD) {
      const r = o.R * s; if (r < 7 || r > 1250) continue;
      const x = center.x + Math.cos(o.th) * r, y = center.y + Math.sin(o.th) * r; if (y < STAGE_TOP + 4 || x < -10 || x > W + 10) continue;
      const a = clamp01((r - 7) / 30) * clamp01((1250 - r) / 400); if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha *= a * 0.85; ctx.translate(x, y);
      if (o.gal) drawGalaxyMark(ctx, o.sz * 1.6, o.ang); else { ctx.fillStyle = C.ink; ctx.fillRect(-o.sz / 2, -o.sz / 2, o.sz, o.sz); }
      ctx.restore();
    }
  }
  function universe(t, z, center = CC, scaleK = 1, labels = true, lab0 = true) {
    const s = (CR / Math.pow(10, z)) * scaleK;
    field(t, s, center);
    for (let li = 0; li < LEVELS.length; li++) {
      const lv = LEVELS[li], r = lv.R * s;
      if (r < 5 || r > 1700) continue;
      if (li === 2 && r > 14 && r < 520) { ctx.save(); ctx.translate(center.x, center.y); ctx.globalAlpha = clamp01((r - 14) / 40) * clamp01((520 - r) / 180); drawSpiral(ctx, r, 0.4 + t * 0.03, 5); ctx.restore(); }
      if (li === 4) {
        const ga = clamp01((900 - r) / 300);
        if (ga > 0) { const ga0 = t * 0.02, cg = Math.cos(ga0), sg = Math.sin(ga0); for (const g of GAL) { const x = center.x + (g.x * cg - g.y * sg) * r, y = center.y + (g.x * sg + g.y * cg) * r; if (y < STAGE_TOP + 6) continue; ctx.save(); ctx.globalAlpha = ga * (0.75 + 0.25 * Math.sin(g.ph + 2 * Math.PI * cyc(t, 2.4))); ctx.translate(x, y); drawGalaxyMark(ctx, g.s * Math.min(1, r / 340), g.ang); ctx.restore(); } }
      }
      if (li === 1 && r > 10 && r < 1400) { ctx.save(); ctx.translate(center.x + r * 0.7071, center.y - r * 0.7071); ctx.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); } ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.arc(center.x, center.y, r, 0, Math.PI * 2); ctx.lineWidth = li === 4 ? 3.5 : li === 0 ? 3 : 2.5; ctx.strokeStyle = li === 4 || li === 0 ? C.ink : C.graphite; if (li !== 4 && li !== 0) ctx.setLineDash([8, 7]); ctx.stroke(); ctx.setLineDash([]);
      if (labels && li < 4 && (li > 0 || lab0) && r > 40 && r < 640) {
        setFont(ctx, F.mono(LAB)); const a = (-120 * Math.PI) / 180, lx = center.x + Math.cos(a) * r, ly = center.y + Math.sin(a) * r;
        if (ly > STAGE_TOP + 50) { ctx.save(); ctx.globalAlpha = clamp01((r - 40) / 40) * clamp01((640 - r) / 120); paperLabel(lv.name, lx - 10, ly - 14, 'right'); ctx.restore(); }
      }
    }
    const sr = Math.max(2, 20 * clamp01(1 - (z - z0) / 2)); ctx.save(); ctx.translate(center.x, center.y); if (sr > 4) drawSun(ctx, sr, t * 0.25); else { ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); } ctx.restore();
  }
  // HER ÇİZGİ 10 KAT cetveli: 10^13 … 10^27 m, imleç güncel yarıçapta
  function logRuler(t, k) {
    if (k <= 0) return;
    const y0 = 800, y1 = 1380, zA = 13, zB = 27, yz = z => lerp(y1, y0, (z - zA) / (zB - zA));
    ctx.save(); ctx.globalAlpha = k;
    // evren çemberi yazının üstünden geçerken yazı söner
    const rU = (LEVELS[4].R * CR * zoomK(t)) / Math.pow(10, zAt(t)), la = Math.max(clamp01((rU - 1500) / 200), clamp01((372 - rU) / 24));
    if (la > 0) { ctx.save(); ctx.globalAlpha *= la; setFont(ctx, F.mono(LAB)); paperLabel('HER ÇİZGİ 10 KAT', SAFE.x0, 762); ctx.restore(); }
    ctx.beginPath(); ctx.moveTo(SAFE.x0 + 6, y0); ctx.lineTo(SAFE.x0 + 6, y1); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let z = zA; z <= zB; z++) { const y = yz(z); ctx.beginPath(); ctx.moveTo(SAFE.x0 + 6, y); ctx.lineTo(SAFE.x0 + (z % 5 === 0 ? 40 : 26), y); ctx.lineWidth = 2.5; ctx.stroke(); }
    const ym = yz(zAt(t)); ctx.beginPath(); ctx.moveTo(SAFE.x0 + 46, ym); ctx.lineTo(SAFE.x0 + 66, ym - 11); ctx.lineTo(SAFE.x0 + 66, ym + 11); ctx.closePath(); ctx.fillStyle = C.ink; ctx.fill();
    ctx.restore();
  }
  const fmtR = m => {
    const f = (v, d = 0) => v.toLocaleString('tr-TR', { maximumFractionDigits: d, minimumFractionDigits: d });
    if (m < 1e14) return [`${f(m / 1e12, 1)} milyar`, 'km'];
    const ly = m / LY;
    if (ly < 1) return [f(ly, 2), 'ışık yılı'];
    if (ly < 10) return [f(ly, 1), 'ışık yılı'];
    if (ly < 1e6) return [f(Math.round(ly / (ly < 1e3 ? 10 : 1000)) * (ly < 1e3 ? 10 : 1000)), 'ışık yılı'];
    if (ly < 1e9) return [`${f(ly / 1e6, ly < 1e7 ? 1 : 0)} milyon`, 'ışık yılı'];
    return [`${f(ly / 1e9, 0)} milyar`, 'ışık yılı'];
  };
  const region = z => REGIONS.find(([zz]) => z < zz)[1];

  // ——— doruk: 37 ondalık ———
  const N37 = 39;  // "3," + 37 ondalık
  function heroScene(t, k = 1) {
    if (k <= 0) return;
    const mv = ease.state(seg(t, T.shrink, 0.7));
    const center = { x: lerp(CC.x, UC2.x, mv), y: lerp(CC.y, UC2.y, mv) }, sc = lerp(UEND, UR2 / CR, mv) * (1 + 0.05 * seg(t, L.l06.t0, T.rest - L.l06.t0));
    ctx.save(); ctx.globalAlpha *= k;
    { const rot = 0.06 * Math.max(0, t - L.l06.t0); ctx.save(); ctx.translate(center.x, center.y); ctx.rotate(rot); ctx.translate(-center.x, -center.y); universe(t, z1, center, sc, false); ctx.restore(); }
    const lk = ease.enter(seg(t, T.shrink + 0.5, 0.4)); if (lk > 0) { ctx.globalAlpha *= lk; setFont(ctx, F.mono(LAB)); paperLabel('GÖZLEMLENEBİLİR', SAFE.x0, UC2.y - 26); paperLabel('EVREN', SAFE.x0, UC2.y + 22); }
    ctx.restore();
    // basamaklar: "otuz yedi"de 15 ms arayla; sonra 3. satırda gri basamaklar saniyede 4 tane akar (x ≤ 780)
    const tail = Math.floor(Math.max(0, t - (T.hero + 1.0)) * 4);
    for (let i = 0; i < N37 + Math.min(tail, 28); i++) {
      if (t >= T.recurl && i < NFLY) continue;   // halkaya uçanlar unroll(reverse) ile çizilir
      const ti = i < N37 ? T.otuz + 0.015 * i : T.hero + 1.0 + (i - N37) / 4;
      const p = ease.enter(seg(t, ti, 0.22)); if (p <= 0) continue;
      const [x, y, fs] = heroPos(i);
      const rk = t >= T.recurl ? 1 - seg(t, T.recurl, 0.3) : 1;
      glyph(PI[i], x, y + (1 - p) * 14, 0, fs, i < N37 ? C.ink : C.graphite, p * rk * (i < N37 ? 1 : 0.8));
    }
    // NASA 15 ayracı (üstte, mürekkep) ve 37 ayracı (altta, kırmızı yalnız doruk)
    const b15 = ease.enter(seg(t, T.otuz + 0.35, 0.3)) * (1 - seg(t, T.recurl - 0.2, 0.3));
    if (b15 > 0) {
      const xa = heroPos(2)[0] - heroCW / 2, xb = heroPos(16)[0] + heroCW / 2, y = HERO.y1 - 52;
      ctx.save(); ctx.globalAlpha = b15; ctx.beginPath(); ctx.moveTo(xa, y + 10); ctx.lineTo(xa, y); ctx.lineTo(xb, y); ctx.lineTo(xb, y + 10); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      setFont(ctx, F.mono(LAB)); paperLabel('NASA · 15', xa, y - 12); ctx.restore();
    }
    const b37 = ease.enter(seg(t, T.otuz + 0.5, 0.3)) * (1 - ease.exit(seg(t, T.rest, 0.3)));
    if (b37 > 0) {
      const segs = [[heroPos(2)[0] - heroCW / 2, heroPos(19)[0] + heroCW / 2, HERO.y1 + 26], [heroPos(20)[0] - heroCW / 2, heroPos(38)[0] + heroCW / 2, HERO.y2 + 26]];
      ctx.save(); ctx.globalAlpha = b37; ctx.strokeStyle = C.red; ctx.lineWidth = 3;
      for (const [a, b, yy] of segs) { ctx.beginPath(); ctx.moveTo(a, yy - 8); ctx.lineTo(a, yy); ctx.lineTo(b, yy); ctx.lineTo(b, yy - 8); ctx.stroke(); }
      ctx.restore();
    }
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.sonsuz, 'ayakta', 'saskin'], [T.uc + 0.9, 'ayakta', 'dusunceli'], [T.on, 'sasirma', 'saskin'], [T.on + 1.4, 'ayakta', 'notr'],
    [T.cm, 'sasirma', 'saskin'], [T.cm + 1.5, 'ayakta', 'dusunceli'], [T.hyd, 'ayakta', 'saskin'], [T.hero, 'sasirma', 'saskin'], [T.rest + 0.6, 'ayakta', 'mutlu'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.save(); ctx.beginPath(); ctx.ellipse(SIFIR.x, SIFIR.y - 46, 72, 70, 0, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
  }

  // ——— üst blok ———
  // anlatım kartı: sözcükler söylendiği anda gelir (0,05 sn önce); rakamlı sözcük kendi sayı kelimesinde (0,02 sn önce)
  const NUMCUE = { l02: { '314': T.uc }, l03: { '15': T.on }, l04: { "1'in": T.birin, '1': T.cm }, l06b: { '37': T.otuz } };
  const norm = w => w.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9']/g, '');
  const WORDT = {};
  for (const l of ep.voice.lines) {
    const sp = L[l.id].words, cues = NUMCUE[l.id] || {}; let j = 0, prev = L[l.id].t0;
    WORDT[l.id] = l.text.split(' ').map(w => {
      const key = w.replace(/[.,?!]$/, '');
      if (/\d/.test(w) && cues[key] != null) { prev = cues[key]; const k = sp.findIndex(q => Math.abs(q.t0 - prev) < 0.02); if (k >= 0) j = k + 1; return { t: prev, num: true }; }
      const n = norm(w).slice(0, 4);
      for (let k = j; k < sp.length; k++) if (norm(sp[k].w).startsWith(n)) { j = k + 1; prev = sp[k].t0; return { t: prev }; }
      return { t: prev };
    });
  }
  // l06 ve l06b tek kart: iki parça birikir (ilk parça yarım cümle olarak tek başına kalmaz)
  const CARDS = { l06: ['l06', 'l06b'], l06b: ['l06', 'l06b'] };
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const out = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    const ids = CARDS[ln.id] || [ln.id], words = ids.flatMap(id => L[id].text.split(' ')), wt = ids.flatMap(id => WORDT[id]);
    let fs0 = 50, lines;
    for (const f of [50, 46, 42]) { fs0 = f; setFont(ctx, F.name(f)); lines = []; let cur = []; for (const w of words) { const tryS = [...cur, w].join(' '); if (ctx.measureText(tryS).width > SAFE.x1 - SAFE.x0 && cur.length) { lines.push(cur); cur = [w]; } else cur.push(w); } if (cur.length) lines.push(cur); if (lines.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = lines.length > 2 ? 410 : 432, sp = ctx.measureText(' ').width;
    let wi = 0;
    lines.slice(0, 3).forEach((ws, li) => {
      let x = SAFE.x0;
      for (const w of ws) {
        const q = wt[wi++], p = ease.enter(seg(t, q.t - (q.num ? 0.02 : 0.05), 0.2)) * out;
        revealText(ctx, w, x, y0 + li * lh, fs0, p, C.ink); x += ctx.measureText(w).width + sp;
      }
    });
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 + 0.05, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    let fs = 96, ls; for (const f of [96, 90, 84]) { fs = f; setFont(ctx, F.head(f)); ls = wrap(ctx, ep.voice.lines[0].text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const y0 = 690 - (ls.length - 1) * fs * 1.0;
    ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * fs * 1.0 - 22, fs, k, C.ink));
  }
  function row({ label, num, unit, red = false, gray = false, p = 1, pn = 1 }) {
    setFont(ctx, F.mono(LAB)); revealText(ctx, label, SAFE.x0, 592, LAB, p, C.ink);
    if (num && pn > 0) {
      const col = red ? C.red : gray ? C.graphite : C.ink, sc = lerp(0.92, 1, pn);
      ctx.save(); ctx.globalAlpha *= pn * p; ctx.translate(SAFE.x0, 684); ctx.scale(sc, sc); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; ctx.fillText(num, 0, 0);
      if (unit) { setFont(ctx, F.name(44)); ctx.fillText(unit, nw + 14, 0); }
      ctx.restore();
    }
  }
  const popIn = a => ease.enter(seg(t0clamp(a), 0, 0.3));
  const t0clamp = a => Math.max(0, a);
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const fade = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    const pin = a => ease.enter(seg(t, a, 0.3)) * fade;
    if (t < L.l03.t0 - 0.06) { if (t < T.uc - 0.02) return; row({ label: 'BUGÜNE KADAR HESAPLANAN', num: '314 trilyon', unit: 'basamak', p: pin(T.uc - 0.02), pn: popIn(t - T.uc + 0.02) }); return; }
    if (t < L.l04.t0 - 0.06) { row({ label: 'NASA JPL · EN HASSAS HESAP', num: '15', unit: 'ondalık basamak', p: pin(L.l03.t0 - 0.06), pn: popIn(t - T.on + 0.02) }); return; }
    if (t < L.l05.t0 - 0.06) { { const hit = t >= T.cm - 0.02; row({ label: 'VOYAGER ÇEMBERİNDE HATA', num: hit ? '1' : '?', unit: 'cm', gray: !hit, p: pin(L.l04.t0 - 0.06), pn: hit ? popIn(t - T.cm + 0.02) : 1 }); } return; }
    if (t < T.hes - 0.06) { const z = zAt(t), [n, u] = fmtR(Math.pow(10, z)); row({ label: `${region(z)} · YARIÇAP`, num: n, unit: u, p: pin(L.l05.t0 - 0.06) }); return; }
    if (t < L.l07.t0 - 0.06) {
      const hit = t >= T.otuz - 0.02;
      row({ label: 'ATOM HASSASİYETİ İÇİN GEREKEN', num: hit ? '37' : '?', unit: 'ondalık basamak', red: hit, gray: !hit, p: pin(T.hes - 0.06), pn: hit ? popIn(t - T.otuz + 0.02) : 1 });
      return;
    }
    row({ label: 'BUGÜNE KADAR HESAPLANAN', num: '314 trilyon', unit: 'basamak', p: pin(L.l07.t0 - 0.06) });
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
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    if (t < T.unroll) {
      ctx.save(); const z = 1 + 0.04 * Math.sin(Math.PI * seg(t, 0, T.unroll)); ctx.translate(RC.x, RC.y); ctx.scale(z, z); ctx.translate(-RC.x, -RC.y);
      piMark(t); rings(t); ctx.restore();
    } else if (t < T.tape) {
      piMark(t, 1 - ease.exit(seg(t, T.unroll, 0.3))); rings(t, 0); unroll(t);
    } else if (t < T.curl) {
      tapeScene(t);
    } else if (t < T.zoom0) {
      if (t < T.circ) { planets(1 - ease.exit(seg(t, T.curl - 0.2, 0.2))); curlIn(t); }
      voyagerScene(t);
      lens(t, ease.enter(seg(t, T.lens, 0.4)) * (1 - ease.exit(seg(t, T.zoom0 - 0.3, 0.3))), 'cm');
    } else if (t < L.l06.t0) {
      universe(t, zAt(t), CC, zoomK(t), true, t > T.zoom0 + 0.4);
      const vk = 1 - ease.exit(seg(t, T.zoom0, 0.4)); if (vk > 0) { const sc = Math.pow(10, z0 - zAt(t)) * zoomK(t) / 1.05; ctx.save(); ctx.translate(CC.x, CC.y); ctx.scale(sc, sc); ctx.translate(-CC.x, -CC.y); voyagerScene(t, vk); ctx.restore(); }
      logRuler(t, ease.enter(seg(t, T.zoom0 + 0.2, 0.4)));
    } else if (t < T.ring) {
      heroScene(t, t >= T.recurl ? 1 - ease.exit(seg(t, T.recurl, 0.45)) : 1);
      logRuler(t, 1 - ease.exit(seg(t, T.shrink, 0.3)));
      lens(t, ease.enter(seg(t, T.hyd - 0.15, 0.4)) * (1 - ease.exit(seg(t, T.hes + 0.6, 0.3))), 'h');
      if (t >= T.recurl) { piMark(t, ease.enter(seg(t, T.recurl + 0.3, 0.5))); unroll(t, true); }
    } else {
      piMark(t, ease.enter(seg(t, T.recurl + 0.3, 0.5))); rings(t, 1);
    }
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

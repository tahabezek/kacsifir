// "Karınca" şablonu (Kaç Sıfır?): Dünyada kaç karınca var?
// Tek dünya, tek kamera ([t, zoom, x, zemin-y] anahtarları; zoom log uzayında), baskın yön sağa.
// Kare 0: soru başlık; yakın planda ağzında "0" taşıyan karınca zeminde sağa yürür (bacak fazı yürünen yoldan:
//   ayak kaymaz). l02: önünde 489 araştırma kâğıdı yağar ve yığılır (sayaç kâğıtla birlikte).
// l03: karınca "2"nin yanına sıfırını koyar: "yirmi" kelimesinde 20 olur. Sessizlikte 15 karınca soldan gelir.
// l04 (doruk): her karınca bir "0" bırakır; 15. sıfır "on beş"te yerine oturur, sayaç ve sıfırlar kırmızı;
//   kamera sayının tamamına geri çekilir (20.000.000.000.000.000).
// l05: sağa: ayakta insan ve çevresinde 2.400 nokta (her nokta 1.000 karınca). l06: tahterevalli: karınca yığını
//   (12) kuş (2) + memeli (7) kasalarından ağır gelir. l07: sağa, zemine in: karınca yolu; öndeki karınca yine
//   "0" taşır; kare 0 ile aynı kadraj (zemin dokusu periyodik) → döngü. Her kare t'nin saf fonksiyonu.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { ANT_CARD, drawAnt, antMouth, drawZeroGlyph, drawAntTop, drawStandingPerson, drawSeesaw, drawBirdIcon, drawElephantIcon, drawPaperSheet, drawShoe } from '../karinca_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const U = 34;                       // karınca birimi (dünya px; baş boyu)
const PERIOD = 1600;                // zemin dokusu periyodu (döngü dikişi)
const STEP = PERIOD / Math.round(PERIOD / (U * ANT_CARD.stride * 2.2));   // bir yürüme döngüsünde alınan yol; periyodu tam böler (dikişte aynı faz)
const DH = 90, PLINTH = 165, PLANK = 16;   // sayı rakamı yüksekliği; masa üstü (dünya): karıncalar masanın altından yürür
const Z0 = 2.8, ZN = 1.25;          // kare 0 yakınlığı ve sayı sahnesi yakınlığı
const SIF = { x: 872, H: 92 };

export function karincaTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    l02: L.l02.t0, yuz: Wd('l02', 'yüzlerce'), hesap: Wd('l02', 'hesapladı'), l03: L.l03.t0, yirmi: Wd('l03', 'yirmi'), katr: Wd('l03', 'katrilyon'),
    l04: L.l04.t0, on: Wd('l04', 'on'), sifir: Wd('l04', 'sıfır'), l05: L.l05.t0, iki: Wd('l05', 'iki'), milyon: Wd('l05', 'milyon'),
    l06: L.l06.t0, kus: Wd('l06', 'kuşlarla'), memeli: Wd('l06', 'memelilerin'), agir: Wd('l06', 'ağır'), l07: L.l07.t0, l07end: L.l07.end, loop0: tl.loop0,
  };
  // 15 sıfır sessizlikte başlar, 15.'si "on beş"te oturur (~175 ms/sıfır); tam kadraj ve vuruş "gelir"den sonraki boşlukta
  T.z0 = L.l03.end + 0.25; T.z14 = T.on - 0.03; T.z11 = T.z0 + (T.z14 - T.z0) * 11 / 14;
  T.l04end = L.l04.end; T.hit = L.l04.end + 0.45;
  T.follow = T.l07end + 0.3;
  return T;
}

export async function makeKarincaRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = karincaTimes(tl);

  // ——— sayı yerleşimi (dünya): rakamlar rafın üstünde, karıncalar rafın önünde ———
  setFont(ctx, F.head(Math.round(DH * 1.36)));
  const ADV = ctx.measureText('0').width + 10, DOT = 40;
  const chars = ['2', '0', '.', '0', '0', '0', '.', '0', '0', '0', '.', '0', '0', '0', '.', '0', '0', '0', '.', '0', '0', '0'];
  // kahraman karınca: t = 0'da x = 540; "yirmi"de sıfırını 2'nin yanına koyar
  const X0 = 540, V = 150;                                  // yürüme hızı (dünya px/sn)
  const heroArrive = T.yirmi - 0.25;
  const mouth0 = antMouth(ANT_CARD, { carry: 1, phase: 0 });
  const ZOFF = mouth0[0] * U + ADV * 0.42;                   // karınca kökünden taşınan sıfırın merkezine
  const ZROOT = mouth0[1] * U + 0.32 * DH;                   // taşınan sıfırın taban yüksekliği (dünya)
  const NX0 = X0 + V * heroArrive + ZOFF - ADV * 1.5;        // "2"nin sol kenarı
  const CX = []; { let x = NX0; for (const c of chars) { CX.push(x + (c === '.' ? DOT / 2 : ADV / 2)); x += c === '.' ? DOT : ADV; } }
  const NW = CX.at(-1) + ADV / 2 - NX0, NMID = NX0 + NW / 2;
  const zeroIdx = chars.map((c, i) => (c === '0' && i > 1 ? i : -1)).filter(i => i >= 0);   // 15 sıfır
  const placeT = k => lerp(T.z0, T.z14, k / 14);
  const PILE = { x: X0 + V * 6.4, w: 120 };
  const PERSON = { x: CX.at(-1) + 1900, h: 1500 };
  const SEESAW = { x: PERSON.x + 3300, len: 360, h: 140 };
  // döngü karıncası: kare 0 ile aynı zemin fazında (x ≡ X0 mod PERIOD) ve aynı yürüme fazında
  const XE = X0 + PERIOD * Math.ceil((SEESAW.x + 2600 - X0) / PERIOD);
  const SHOE = { x: XE - 900, L: 560 };
  const loopAntX = t => XE + V * (t - D);
  const heroX = t => X0 + V * Math.min(t, heroArrive);
  const phaseOf = x => (x / STEP) * Math.PI * 2;

  // ——— kamera: anahtarlar [t, zoom, x, zemin-ekran-y]; zoom log uzayında, geçişler durum eğrisiyle ———
  const fitZ = 820 / NW, xFit = NMID + (540 - 505) / fitZ;   // doruk: sayı 820 px (Sıfır bu sahnede yok)
  const lz = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));
  const camFollow = t => heroX(t) + lerp(55 * Z0, 250, ease.state(seg(t, T.l02 - 0.2, 2.6))) / zFollow(t);
  const zFollow = t => lz(Z0, ZN, ease.state(seg(t, T.l02 - 0.2, heroArrive - T.l02 + 0.2)));
  function camera(t) {
    // 1) karıncayı izle (kare 0 → "yirmi")
    let z = zFollow(t), x = camFollow(t), g = 1330;
    if (t < heroArrive) return { z, x, g };
    // 2) "20" ve gelen taşıyıcılar
    const xa = camFollow(heroArrive), x2 = CX[1] + 210, u2 = ease.state(seg(t, heroArrive, 1.2));
    x = lerp(xa, x2, u2) + 18 * seg(t, heroArrive, T.z0 - heroArrive); z = ZN * (1 + 0.04 * seg(t, heroArrive, T.z0 - heroArrive));
    if (t < T.z0) return { z, x, g };
    // 3) sıfırlar: ilk 12'de sayının çoğuna geri çekil; son üç sıfıra 1,4x yaklaş (600 ms); "gelir"den sonra tam kadraj
    const zb = ZN * 1.04, xb = x2 + 18, zMid = 0.62, xMid = (NX0 + CX[zeroIdx[11]]) / 2 + 60;
    const u3 = ease.state(seg(t, T.z0, T.z11 - T.z0));
    z = lz(zb, zMid, u3); x = lerp(xb, xMid, u3); g = lerp(1330, 1290, u3);
    if (t < T.z11) return { z, x, g };
    const xPush = CX[zeroIdx[13]], u4 = ease.state(seg(t, T.z11, 0.6));
    z = lz(zMid, zMid * 1.4, u4) * (1 + 0.03 * seg(t, T.z11 + 0.6, T.l04end - T.z11 - 0.6)); x = lerp(xMid, xPush, u4); g = lerp(1290, 1270, u4);
    if (t < T.l04end) return { z, x, g };
    const u5 = ease.state(seg(t, T.l04end, T.hit - T.l04end));
    z = lz(zMid * 1.4 * 1.03, fitZ, u5) * (1 + 0.04 * seg(t, T.hit, T.l05 - 0.35 - T.hit)); x = lerp(xPush, xFit, u5); g = lerp(1270, 1250, u5);
    if (t < T.l05 - 0.35) return { z, x, g };
    // 4) insan ve nokta ızgarası (sağa): insan ekranda solda (x ≈ 230), ızgara ortada
    const zP = ZP, k4 = ease.state(seg(t, T.l05 - 0.35, 1.0)), xP = XP;
    z = lz(fitZ * 1.04, zP, k4) * (1 + 0.04 * seg(t, T.l05 + 0.65, T.l06 - T.l05 - 1.05)); x = lerp(xFit, xP, k4); g = lerp(1250, 1380, k4);
    if (t < T.l06 - 0.4) return { z, x, g };
    // 5) tahterevalli (merkezi ekranda x 450)
    const zS = 0.85, k5 = ease.state(seg(t, T.l06 - 0.4, 1.0));
    z = lz(zP * 1.04, zS, k5) * (1 + 0.05 * seg(t, T.l06 + 0.6, T.l07 - T.l06 - 0.9)); x = lerp(xP, SEESAW.x + 90 / zS, k5); g = lerp(1380, 1330, k5);
    if (t < T.l07 - 0.3) return { z, x, g };
    // 6) ayakkabının yanından geçen karınca yolu → döngü kadrajı (kare 0 ile aynı: Z0, karınca + 55, zemin 1330)
    const k6 = ease.state(seg(t, T.l07 - 0.3, 1.2)), xs = SHOE.x + 300;
    z = lz(zS * 1.05, 0.9, k6); x = lerp(SEESAW.x + 90 / zS, xs, k6);
    const k7 = ease.state(seg(t, T.l07 + 1.9, T.loop0 - T.l07 - 1.9));
    if (k7 > 0) { z = lz(0.9, Z0, k7); x = lerp(xs + 60 * seg(t, T.l07 + 0.9, 1.0), loopAntX(t) + 55, k7); }
    if (t >= T.loop0) { z = Z0; x = loopAntX(t) + 55; }
    return { z, x, g: 1330 };
  }
  const toS = (cam, wx, wy) => [540 + (wx - cam.x) * cam.z, cam.g + wy * cam.z];

  // ——— zemin (periyodik doku) ———
  const TEX = (() => { const r = mulberry32(54), a = []; for (let i = 0; i < 46; i++) a.push({ x: r() * PERIOD, y: 6 + r() * 120, rx: 3 + r() * 11, ry: 2 + r() * 6, rot: r() * 3 }); return a; })();
  const GRASS = (() => { const r = mulberry32(55), a = []; for (let i = 0; i < 70; i++) a.push({ x: r() * PERIOD, h: 10 + r() * 34, lean: (r() - 0.5) * 0.7, w: r() }); return a; })();
  function ground(cam, t) {
    const x0 = cam.x - 560 / cam.z, x1 = cam.x + 560 / cam.z;
    // zemin altı tarama
    const gy = cam.g;
    ctx.save(); ctx.beginPath(); ctx.rect(0, gy, W, 1920 - gy); ctx.clip();
    ctx.strokeStyle = 'rgba(28,27,24,0.22)'; ctx.lineWidth = 1.1; const gap = 9;
    const off = ((-(cam.x % PERIOD) * cam.z) % gap + gap) % gap;
    for (let x = -1000 + off; x < W + 1000; x += gap) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x - 900, gy + 900); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = C.paper;
    for (let k = Math.floor(x0 / PERIOD) - 1; k <= Math.floor(x1 / PERIOD) + 1; k++) {
      for (const p of TEX) { const [sx, sy] = toS(cam, k * PERIOD + p.x, p.y); if (sx < -60 || sx > W + 60) continue; ctx.beginPath(); ctx.ellipse(sx, sy, Math.max(1.2, p.rx * cam.z), Math.max(0.8, p.ry * cam.z), p.rot, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = Math.max(0.8, 1.6 * Math.min(1.5, cam.z)); ctx.strokeStyle = C.ink; ctx.stroke(); }
    }
    // çim: zeminin üstünde ince kalem çizgileri
    ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    for (let k = Math.floor(x0 / PERIOD) - 1; k <= Math.floor(x1 / PERIOD) + 1; k++) for (const gp of GRASS) {
      const [sx] = toS(cam, k * PERIOD + gp.x, 0); if (sx < -40 || sx > W + 40) continue;
      const h = gp.h * cam.z, sw = Math.sin((t / D) * Math.PI * 2 * 7 + gp.w * 9) * 0.06;   // döngü boyunca tam 7 salınım
      ctx.beginPath(); ctx.moveTo(sx, gy); ctx.quadraticCurveTo(sx + (gp.lean + sw) * h * 0.4, gy - h * 0.6, sx + (gp.lean + sw) * h, gy - h); ctx.lineWidth = Math.max(0.8, 1.6 * Math.min(1.4, cam.z)); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— karınca (dünya konumu) ———
  function ant(cam, wx, opts = {}) {
    const [sx, sy] = toS(cam, wx, opts.dy || 0), s = U * cam.z * (opts.scale || 1);
    if (sx < -s * 4 || sx > W + s * 4) return null;
    const pose = { phase: opts.phase ?? phaseOf(wx), carry: opts.carry ? 1 : 0, look: opts.look || 0, antWave: opts.wave };
    ctx.save(); ctx.translate(sx, sy); drawAnt(ctx, ANT_CARD, pose, s); ctx.restore();
    const m = antMouth(ANT_CARD, pose);
    return [sx + m[0] * s, sy + m[1] * s];
  }
  // taşınan sıfır: çeneler sıfırın sol alt kenarını tutar
  function carriedZero(cam, mouth, col = C.ink, sc = 1) {
    if (!mouth) return;
    const h = DH * cam.z * sc;
    ctx.save(); ctx.translate(mouth[0] + ADV * cam.z * 0.42 * sc, mouth[1] + h * 0.32); drawZeroGlyph(ctx, h, col); ctx.restore();
  }

  // ——— araştırma yığını (489 kâğıt) ———
  const SHEETS = (() => { const r = mulberry32(489), a = []; for (let i = 0; i < 489; i++) a.push({ dx: (r() - 0.5) * 14, rot: (r() - 0.5) * 0.12, land: lerp(T.yuz - 0.05, T.hesap + 0.1, Math.pow(i / 488, 0.85)), sway: r() * 6 }); return a; })();
  const sheetsLanded = t => SHEETS.reduce((n, s) => n + (t >= s.land ? 1 : 0), 0);
  function pile(cam, t) {
    if (t < T.yuz - 0.6) return;
    const th = 0.8, w = PILE.w * cam.z;
    for (let i = 0; i < SHEETS.length; i++) {
      const s = SHEETS[i]; if (t < s.land - 0.45) break;
      const yRest = -(i + 0.5) * th, fall = clamp01((t - (s.land - 0.45)) / 0.45);
      const wy = lerp(-950, yRest, fall * fall), wx = PILE.x + s.dx + (1 - fall) * Math.sin(s.sway + t * 4) * 30;
      const [sx, sy] = toS(cam, wx, wy);
      if (fall < 1) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(s.rot + (1 - fall) * Math.sin(s.sway) * 0.6); ctx.scale(1, lerp(0.35, 0.08, fall)); drawPaperSheet(ctx, w, i); ctx.restore(); }
      else { ctx.save(); ctx.translate(sx, sy); ctx.rotate(s.rot * 0.3); ctx.fillStyle = i % 2 ? C.paper : '#F4EEE1'; ctx.fillRect(-w / 2, -th * cam.z * 0.5 - 0.6, w, Math.max(1.2, th * cam.z + 0.4)); ctx.fillStyle = C.ink; ctx.fillRect(-w / 2, 0, w, Math.max(0.6, 0.25 * cam.z)); ctx.restore(); }
    }
    // yığının kenar çizgileri
    const n = sheetsLanded(t);
    // yığının tepesinde sayaç etiketi (yığınla birlikte yükselir)
    if (n > 0 && t < T.l03 + 0.5) {
      const [tx, ty] = toS(cam, PILE.x, -n * th); const k = ease.enter(seg(t, T.yuz, 0.3)) * (1 - ease.exit(seg(t, T.l03, 0.3)));
      setFont(ctx, F.name(44)); const s = `${n} ÇALIŞMA`, tw = ctx.measureText(s).width, lx = Math.max(SAFE.x0, Math.min(SAFE.x1 - tw, tx - tw / 2)), ly = Math.max(STAGE_TOP + 70, ty - 26);
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(lx - 8, ly - 42, tw + 16, 56); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(lx - 8, ly - 42, tw + 16, 56); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(s, lx, ly); ctx.restore();
    }
    if (n > 2) { const [lx, ty] = toS(cam, PILE.x - PILE.w / 2 - 7, -n * th), [rx, by] = toS(cam, PILE.x + PILE.w / 2 + 7, 0); ctx.beginPath(); ctx.moveTo(lx, by); ctx.lineTo(lx, ty); ctx.moveTo(rx, by); ctx.lineTo(rx, ty); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); }
  }

  // ——— sayı: masa, "2", sıfırlar, noktalar; 15 taşıyıcı karınca (iki sıra, tren gibi birlikte gelir) ———
  // çift k arka sıra (yukarıda, küçük), tek k ön sıra: aynı sıradaki iki karınca arası ≥ 2 yuva (üst üste binmez)
  const ROW = k => (k % 2 === 0 ? { dy: -34, sc: 0.8 } : { dy: 0, sc: 1 });
  const VT = 420, TA = T.z0 - 0.15;                    // tren hızı ve varış (konuşmadan hemen önce)
  const mouthX = sc => (mouth0[0] * U + ADV * 0.42) * sc;
  const carrierX = (k, t) => { const slot = CX[zeroIdx[k]] - mouthX(ROW(k).sc); return t < TA ? slot - VT * (TA - t) : slot; };
  const liftOf = (sc, dy) => -(PLINTH + (mouth0[1] * U + 0.32 * DH) * sc + dy);   // taşınan sıfır tabanından masa üstüne
  function table(cam) {
    const [kx0, ky0] = toS(cam, NX0 - 40, -PLINTH), [kx1, ky1] = toS(cam, CX.at(-1) + ADV / 2 + 40, -PLINTH + PLANK);
    if (kx1 < -10 || kx0 > W + 10) return;
    const [, gy] = toS(cam, 0, 0), lw = Math.max(1.5, 2.5 * Math.min(1, cam.z));
    // ayaklar (her 4 yuvada bir, uçlarda)
    ctx.fillStyle = '#F4EEE1'; ctx.strokeStyle = C.ink; ctx.lineWidth = lw;
    for (let x = NX0 - 25; x <= CX.at(-1) + ADV / 2 + 30; x += ADV * 4) { const [lx] = toS(cam, x, 0), w = Math.max(3, 9 * cam.z); ctx.beginPath(); ctx.rect(lx - w / 2, ky1, w, gy - ky1); ctx.fill(); ctx.stroke(); }
    const [lx] = toS(cam, CX.at(-1) + ADV / 2 + 25, 0), w = Math.max(3, 9 * cam.z); ctx.beginPath(); ctx.rect(lx - w / 2, ky1, w, gy - ky1); ctx.fill(); ctx.stroke();
    // tabla
    ctx.beginPath(); ctx.rect(kx0, ky0, kx1 - kx0, ky1 - ky0); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(kx0, ky0, kx1 - kx0, ky1 - ky0); ctx.clip(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(28,27,24,0.5)'; for (let x = kx0 - 40; x < kx1; x += 6) { ctx.beginPath(); ctx.moveTo(x, ky1); ctx.lineTo(x + (ky1 - ky0), ky0); ctx.stroke(); } ctx.restore();
  }
  function glyphs(cam, t, red) {
    const h = DH * cam.z;
    const glyph = (i, ch, col, k = 1, lift = 0) => {
      const [sx, sy] = toS(cam, CX[i], -PLINTH - lift); if (sx < -h || sx > W + h) return;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(k, k);
      // masadaki rakamlar mürekkeple dolu (uzakta da okunur); taşınan sıfırlar kâğıt dolgulu
      if (ch === '0') drawZeroGlyph(ctx, h, col, col);
      else if (ch === '.') { ctx.beginPath(); ctx.arc(0, -h * 0.07, h * 0.08, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
      else { setFont(ctx, F.head(h * 1.36)); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, h * 0.07); ctx.strokeStyle = col; ctx.strokeText(ch, 0, 0); ctx.fillStyle = col; ctx.fillText(ch, 0, 0); }
      ctx.restore();
    };
    const col = red ? C.red : C.ink;
    glyph(0, '2', col);
    // kahramanın sıfırı: ağızdan masaya kaldırılır ("yirmi"de oturur)
    if (t >= heroArrive) glyph(1, '0', col, 1, (1 - ease.state(seg(t, heroArrive, 0.3))) * liftOf(1, 0));
    zeroIdx.forEach((ci, k) => {
      const tk = placeT(k); if (t < tk) return;
      const r = ROW(k);
      const e = ease.state(seg(t, tk, 0.24)); ctx.save(); if (r.sc < 1) ctx.globalAlpha = lerp(0.55, 1, e); glyph(ci, '0', col, lerp(r.sc, 1, e), (1 - e) * liftOf(r.sc, r.dy)); ctx.restore();
      if (chars[ci - 1] === '.') glyph(ci - 1, '.', col, ease.enter(seg(t, tk, 0.2)));
    });
  }
  function carriers(cam, t, back) {
    if (t < T.l03) return;
    // arka sıra daha soluk (derinlik): sabit opaklık, belirme değil
    ctx.save(); if (back) ctx.globalAlpha = 0.55;
    for (let k = back ? 0 : 1; k < 15; k += 2) {
      const r = ROW(k), wx = carrierX(k, t), tk = placeT(k), moving = t < TA, carry = t < tk;
      const ph = phaseOf(Math.min(wx, carrierX(k, TA))) * 0.55 + k;   // hızlı yürüyüşte faz yavaşlatılır (titreme olmasın)
      const m = ant(cam, wx, { phase: ph, carry, scale: r.sc, dy: r.dy, look: carry ? (t > tk - 0.25 ? -14 * ease.state(seg(t, tk - 0.25, 0.25)) : 0) : -8 + Math.sin(t * 2 + k) * 4, wave: t * 3 + k });
      if (carry) carriedZero(cam, m, C.ink, r.sc);
    }
    ctx.restore();
  }

  // ——— insan ve 2.400 nokta (her nokta 1.000 karınca): insanın yanında 60 × 40'lık düzgün ızgara (8 px; moiré yok) ———
  const ZP = 0.34, XP = PERSON.x + 310 / ZP;
  const GRID = { cols: 60, rows: 40, cell: 8 / ZP, x0: XP + (392 - 540) / ZP, y0: (900 - 1380) / ZP };
  function personScene(cam, t) {
    if (t < T.l05 - 0.5 || t > T.l07 + 0.6) return;
    const n = Math.round(2400 * ease.state(seg(t, T.l05 + 0.1, T.milyon + 0.3 - T.l05)));
    ctx.fillStyle = C.ink; const d = Math.max(2, 3 * cam.z / ZP);
    for (let i = 0; i < n; i++) {
      const c = i % GRID.cols, r = Math.floor(i / GRID.cols);
      const [sx, sy] = toS(cam, GRID.x0 + c * GRID.cell, GRID.y0 + r * GRID.cell); if (sx < -5 || sx > W + 5) continue;
      ctx.fillRect(sx - d / 2, sy - d / 2, d, d);
    }
    const [px, py] = toS(cam, PERSON.x, 0);
    ctx.save(); ctx.translate(px, py); drawStandingPerson(ctx, PERSON.h * cam.z); ctx.restore();
    // etiketler (44 px, kâğıt zeminli)
    const k = ease.enter(seg(t, T.iki - 0.04, 0.3)) * (1 - ease.exit(seg(t, T.l06 - 0.5, 0.3)));
    if (k > 0) {
      setFont(ctx, F.name(44)); ctx.textAlign = 'left';
      const lab = (str, x, y) => { const tw = ctx.measureText(str).width; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - 6, y - 40, tw + 12, 54); ctx.fillStyle = C.ink; ctx.fillText(str, x, y); ctx.restore(); return tw; };
      const top = py - PERSON.h * cam.z;
      lab('1 KİŞİ', SAFE.x0, top - 24);
      const [gx, gy] = toS(cam, GRID.x0, GRID.y0);
      lab('1 NOKTA = 1.000 KARINCA', gx - 2, gy - 40);
    }
  }

  // ——— tahterevalli ———
  function seesawScene(cam, t) {
    if (t < T.l06 - 0.6 || t > T.loop0) return;
    const [sx, sy] = toS(cam, SEESAW.x, -SEESAW.h); if (sx < -900 || sx > W + 900) return;
    const z = cam.z, len = SEESAW.len * z, h = SEESAW.h * z;
    const tilt = 0.17 * spring(Math.max(0, t - T.agir + 0.05), 120, 24);   // + sol aşağı (karınca tarafı)
    ctx.save(); ctx.translate(sx, sy); drawSeesaw(ctx, len, tilt, h); ctx.restore();
    const endPt = s => [sx + Math.cos(-tilt) * len * 0.78 * s, sy - Math.sin(-tilt) * len * 0.78 * s - 16];
    // sol: karınca yığını (üstten karıncalar)
    const kA = ease.enter(seg(t, T.l06 - 0.1, 0.5));
    const [ax, ay] = endPt(-1);
    if (kA > 0) {
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(tilt);
      const r = mulberry32(12), mw = 150 * z * lerp(0.6, 1, kA), mh = 100 * z * kA;   // yığın büyüyerek gelir
      ctx.beginPath(); ctx.moveTo(-mw, 0); ctx.quadraticCurveTo(0, -mh * 2, mw, 0); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.save(); ctx.clip(); for (let i = 0; i < 120; i++) { const x = (r() - 0.5) * 2 * mw, y = -r() * mh * 1.1, a = r() * 6.28; ctx.save(); ctx.translate(x + Math.sin(t * 2 + i) * 2, y); ctx.rotate(a + t * 0.3 * (i % 2 ? 1 : -1)); drawAntTop(ctx, 22 * z, t * 8 + i); ctx.restore(); } ctx.restore();
      ctx.restore();
    }
    // sağ: kuş (2) ve memeli (7) kasaları
    const [bx, by] = endPt(1);
    const crate = (dx, w, hh, k, icon) => {
      if (k <= 0) return;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(tilt); ctx.translate(dx * z, -(1 - k) * 220 * z);   // kasa yukarıdan iner
      ctx.beginPath(); ctx.rect(-w * z / 2, -hh * z, w * z, hh * z); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.rect(-w * z / 2, -hh * z, w * z, hh * z); ctx.clip(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(28,27,24,0.3)'; for (let y = -hh * z; y < 0; y += 10) { ctx.beginPath(); ctx.moveTo(-w * z / 2, y); ctx.lineTo(w * z / 2, y); ctx.stroke(); } ctx.restore();
      ctx.translate(0, -hh * z / 2); icon(); ctx.restore();
    };
    crate(-70, 100, 95, ease.enter(seg(t, T.kus - 0.05, 0.4)), () => drawBirdIcon(ctx, 78 * z, t * 6));
    crate(62, 150, 140, ease.enter(seg(t, T.memeli - 0.05, 0.4)), () => drawElephantIcon(ctx, 130 * z));
    // etiketler (ekran ölçeği, kâğıt zeminli)
    setFont(ctx, F.name(44)); ctx.textAlign = 'left';
    const lab = (s, y, k, tx, ty) => {
      if (k <= 0) return; const tw = ctx.measureText(s).width, lx = SAFE.x0;
      ctx.save(); ctx.globalAlpha = k;
      ctx.beginPath(); ctx.moveTo(lx + tw + 12, y - 14); ctx.lineTo(tx, ty); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.fillStyle = C.paper; ctx.fillRect(lx - 6, y - 40, tw + 12, 54); ctx.fillStyle = C.ink; ctx.fillText(s, lx, y); ctx.restore();
    };
    const kK = ease.enter(seg(t, T.kus - 0.05, 0.4)), kM = ease.enter(seg(t, T.memeli - 0.05, 0.4));
    lab('KARINCALAR · 12', 800, kA, ax, ay - 90 * z);
    lab('YABANİ KUŞLAR · 2', 866, kK, bx - 70 * z, by - 100 * z);
    lab('YABANİ MEMELİLER · 7', 932, kM, bx + 62 * z, by - 145 * z);
  }

  // ——— karınca yolu (l07 ve döngü): öndeki karınca "0" taşır ———
  function trail(cam, t) {
    if (t < T.l07 - 0.5) return;
    // ayakkabı (insan ölçeğinde değil, simge boyunda): karıncalar önünden geçer
    const [shx, shy] = toS(cam, SHOE.x, 0); if (shx > -SHOE.L * cam.z && shx < W + SHOE.L * cam.z) { ctx.save(); ctx.translate(shx, shy); drawShoe(ctx, SHOE.L * cam.z); ctx.restore(); }
    for (let k = 1; k <= 24; k++) { const wx = loopAntX(t) - 260 - (k - 1) * 170 - (k % 3) * 30; ant(cam, wx, { wave: t * 3 + k }); }
    const m = ant(cam, loopAntX(t), { carry: true }); carriedZero(cam, m);
  }

  // ——— Sıfır (zeminde, sağda) ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  // Sıfır: sayı, insan ve tahterevalli sahnelerinde kadrajdan çıkar (sayı 820 px'e yayılır, nesnelere binmez)
  const reacts = [[0, 'ayakta', 'notr'], [T.yuz, 'ayakta', 'dusunceli'], [T.l03 - 0.1, 'kosma', 'notr'], [T.l07, 'kosma', 'notr'], [T.l07 + 0.75, 'ayakta', 'saskin'], [T.l07 + 2.2, 'ayakta', 'mutlu'], [T.loop0 + 0.4, 'ayakta', 'notr']];
  const sifX = t => t < T.l03 ? SIF.x : t < T.l07 ? lerp(SIF.x, 1200, ease.exit(seg(t, T.l03, 0.75))) : lerp(1200, SIF.x, ease.enter(seg(t, T.l07, 0.75)));
  function sifir(t, cam) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    const x = sifX(t); if (x > W + 80) return;
    const y = Math.min(1412, cam.g), exiting = t >= T.l03 && t < T.l07;
    ctx.save(); ctx.translate(x, y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIF.H, { facing: exiting ? 1 : -1 }); ctx.restore();
  }

  // ——— üst blok ———
  // anlatım kartı: kelimeler söylendikleri anda belirir (sayı söylenmeden ekrana gelmez)
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const fade = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    // metin kelimeleri ↔ ses kelimeleri: rakamlı kelime ("2,4") sesteki ilk kelimesine ("iki") eşlenir,
    // sonraki metin kelimesi seste bulunana kadar ses kelimeleri atlanır ("virgül dört")
    const ws = ln.words, tws = ln.text.split(/\s+/), wt = [];
    {
      const norm = w => w.toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]/g, '');
      let j = 0;
      for (let i = 0; i < tws.length; i++) {
        wt.push(ws[Math.min(j, ws.length - 1)]?.t0 ?? ln.t0);
        if (/\d/.test(tws[i]) && i + 1 < tws.length) {
          const nx = norm(tws[i + 1]); let k2 = j + 1;
          while (k2 < ws.length && k2 < j + 6 && norm(ws[k2].w) !== nx) k2++;
          j = k2 < ws.length && norm(ws[k2].w) === nx ? k2 : j + 1;
        } else j++;
      }
    }
    let wi = 0;
    ls.slice(0, 3).forEach((s, row) => {
      let x = SAFE.x0;
      for (const word of s.split(' ')) {
        const k = ease.enter(seg(t, wt[Math.min(wi, wt.length - 1)] - 0.05, 0.16)) * fade;
        setFont(ctx, F.name(fs0)); const w = ctx.measureText(word + ' ').width;
        if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(word, x, y0 + row * lh + (1 - k) * 6); ctx.restore(); }
        x += w; wi++;
      }
    });
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    // maske alt payı +12 px: kuyruklu harfler (ç, y) geçişte kesilmez
    const rev = (s, y) => { const lh = 112 * 1.26 + 12; ctx.save(); ctx.beginPath(); ctx.rect(SAFE.x0 - 4, y - 112 * 0.98, 1000, lh + 2); ctx.clip(); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, SAFE.x0, y + (1 - k) * lh); ctx.restore(); };
    setFont(ctx, F.head(112)); rev('Dünyada kaç', 500); rev('karınca var?', 620);
  }
  function row({ label, num, unit, right1, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.ink);
    if (num) { setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink); if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); } }
    if (right1) { setFont(ctx, F.mono(34)); revealText(ctx, right1, SAFE.x1, 680, 34, p, C.ink, 'right'); }
  }
  function counters(t) {
    if (t < T.yuz - 0.05 || t >= T.loop0 + 0.3) return;
    const fade = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    const pin = a => ease.enter(seg(t, a - 0.04, 0.3)) * fade;
    if (t < T.yirmi - 0.04) { const n = sheetsLanded(t); row({ label: 'BİRLEŞTİRİLEN ARAŞTIRMA', num: n.toLocaleString('tr-TR'), unit: 'çalışma', p: pin(T.yuz) }); return; }
    if (t < T.z0 - 0.04) { row({ label: 'DÜNYADAKİ KARINCA', num: '20', unit: t >= T.katr - 0.04 ? 'katrilyon' : '', p: pin(T.yirmi) }); return; }
    if (t < T.l05 - 0.06) {
      let n = 0; for (let k = 0; k < 15; k++) if (t >= placeT(k)) n = k + 1;
      if (t < T.z14) { row({ label: "20'NİN ARKASINDAKİ SIFIR", num: String(n), unit: 'sıfır', p: fade }); return; }
      // doruk: sayının tamamı, kırmızı
      const out = 1 - ease.exit(seg(t, T.l05 - 0.4, 0.3));
      setFont(ctx, F.mono(32)); revealText(ctx, "20'NİN ARKASINDA 15 SIFIR", SAFE.x0, 590, 32, out, C.red);
      setFont(ctx, F.head(66)); revealText(ctx, '20.000.000.000.000.000', SAFE.x0, 676, 66, Math.min(out, ease.enter(seg(t, T.z14, 0.3))), C.red); return;
    }
    if (t < T.l06 - 0.06) { if (t < T.iki - 0.04) return; row({ label: 'KİŞİ BAŞINA', num: '2,4 milyon', unit: 'karınca', p: pin(T.iki) }); return; }
    if (t < T.l07 - 0.06) { row({ label: 'KARINCALARIN KURU KÜTLESİ', num: '12 milyon ton', unit: 'karbon', p: pin(T.l06) }); return; }
  }
  function follow(t) {
    if (t < T.follow || t >= T.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 505;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 600, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 600, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 645); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const cam = camera(t), red = t >= T.z14 && t < T.l05 + 1.2;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ground(cam, t);
    pile(cam, t);
    personScene(cam, t);
    seesawScene(cam, t);
    carriers(cam, t, true);
    table(cam);
    // kahraman karınca: kare 0'dan "yirmi"ye sıfır taşır, sonra 2'nin önünde durur
    if (t < T.l05) { const hx = heroX(t), carry = t < heroArrive; const m = ant(cam, hx, { carry, phase: phaseOf(hx), look: carry ? 0 : -6, wave: carry ? undefined : t * 3 }); if (carry) carriedZero(cam, m); }
    carriers(cam, t, false);
    glyphs(cam, t, red);
    trail(cam, t);
    sifir(t, cam);
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t); follow(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

// "Bulut" şablonu (Kaç Sıfır?): Bir bulut kaç ton?
// Dünya koordinatı metre (x sağa, y yukarı eksi; yer y = 0). Bulut: yüksek kümülüs, 1 km genişlik ve yükseklik, taban 600 m.
// Kare 0: soru başlık; gravür kümülüs, önde İstanbul silueti; tabandan "? TON" etiketi. 0–0,4 sn etiket ağırlıkla
//      sarkar, "?" yerinde sayaç rakamları akar; 0,5 sn'den kamera buluta 1,15x (yay 170/26); "kaç"ta ip gerilir.
// l02: "yaklaşık"ta 1 km'lik tel kafes küp çizilmeye başlar (bulut küpü doldurur); yanında aynı ölçekte Galata.
// l03: log uzayında 1 m³'e dalış (hedef halkası, sis); "yarım"da damlacıklar tek damlaya toplanır; büyüteçte 1 cm.
// l04: geri çekilme; küp yüzünde 1 m / 10 m / 100 m kafes ("HER KARE …"); "milyar"da sayaç.
// l05a "O bulut yaklaşık" → 0,6 sn gerçek sessizlik → l05b "beş"te impact ve kırmızı 500 (doruk); ikinci "yüz"de
//      bulutun içine (bulut sınırına kırpılı) 10 × 10 gravür fil dizilir. l06: filler çıkar, damlacık merceği.
// l07: kare 0 çerçevesi, fillerin silik geçidi, etiket "500 TON" (mürekkep); son 0,4 sn'de "? TON" ve ip toplanır.
// Anlatım saattir; her kare t'nin saf fonksiyonu.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { ELEPHANT_CARD, drawElephant, tallCloudPuffs, cloudPath, drawCloud, drawGalata, drawGull, drawDroplet, drawCubeWire } from '../bulut_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ANCHOR = { x: 540, y: 1080 };
const ROUND = { x: 215, y: 1262, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const CLOUD = { w: 1000, base: -600 };                       // m
const CUBE0 = [-500, -600], KM = 1000;                         // ön alt sol köşe, kenar (m)
const M3 = [0, -900];                                          // 1 m³ küpün ön alt sol köşesi (bulutun içi, ön yüzde)
const M3C = [M3[0] + 0.69, M3[1] - 0.65];                      // izdüşüm merkezi
const VIEW0 = { s: 0.4, f: [0, -850] }, VIEWPUSH = { s: 0.46, f: [0, -900] }, VIEWCUBE = { s: 0.36, f: [190, -1250] }, VIEWHERO = { s: 0.58, f: [100, -1100] };
const TAIL = 1.5;                                              // anlatım bitiminden döngüye

// zaman çizelgesi: ortak çekirdek + kısa kuyruk (sahne, özet ve ses aynı fonksiyonu okur)
export function bulutTimeline(ep, voice) {
  const tl = buildYolTimeline(ep, voice), last = tl.L[ep.voice.lines.at(-1).id];
  const loop = tl.duration - tl.loop0;
  tl.loop0 = tl.askEnd = last.end + TAIL; tl.duration = tl.loop0 + loop;
  return tl;
}
export function bulutTimes(tl) {
  const { L, W: Wd } = tl;
  const on = id => L[id].words[0].t0;                          // ölçülmüş konuşma başlangıcı
  const T = {
    kac: Wd('l01', 'kaç'), cube0: Wd('l02', 'yaklaşık'), km3: Wd('l02', 'kilometreküp'), m3: Wd('l03', 'metreküpünde'), yarim: Wd('l03', 'yarım'), milyar: Wd('l04', 'milyar'),
    hero: on('l05b'), fil: L.l05b.words.filter(w => w.w.toLocaleLowerCase('tr').startsWith('yüz')).at(-1).t0,
    neden: on('l06'), cunku: Wd('l06', 'çünkü'), minicik: Wd('l06', 'minicik'), back: on('l07'), gok: Wd('l07', 'gökyüzüne'),
    loop0: tl.loop0, end: tl.duration,
  };
  T.dive0 = on('l03') - 0.2; T.dive1 = T.m3 + 0.55; T.pull0 = on('l04') - 0.1; T.pull1 = T.milyar + 0.2;
  T.push = T.hero - 0.02; T.eleIn = T.fil - 0.35; T.eleOut = T.neden - 0.1; T.lens0 = T.cunku - 0.25; T.lens1 = T.back - 0.35;
  T.home = T.back - 0.1; T.follow = L.l07.end + 0.3; T.tagBack = tl.duration - 0.4;
  return T;
}

export async function makeBulutRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = bulutTimeline(ep, voice), { L } = tl, D = tl.duration, T = bulutTimes(tl);
  const cyc = (t, per) => { const n = Math.max(1, Math.round(D / per)); return ((t / D) * n) % 1; };   // dikişte aynı fazda biter
  const PUFFS = tallCloudPuffs(7);
  const on = id => L[id].words[0].t0;

  // ——— kamera: hareketler sırayla; s log uzayında; pivotlu hareketlerde hedef nokta ekranda doğrusal yaklaşır ———
  const MOVES = [
    { t0: 0.5, d: 1.2, to: VIEWPUSH, spring: true },
    { t0: 1.7, d: T.cube0 - 1.7, to: { s: 0.47, f: VIEWPUSH.f } },
    { t0: T.cube0, d: 1.25, to: VIEWCUBE },
    { t0: T.cube0 + 1.25, d: T.dive0 - T.cube0 - 1.25, to: { s: 0.372, f: VIEWCUBE.f } },
    { t0: T.dive0, d: T.dive1 - T.dive0, to: { s: 290, f: M3C }, pivot: M3C },
    { t0: T.dive1, d: T.pull0 - T.dive1, to: { s: 305, f: M3C } },
    { t0: T.pull0, d: T.pull1 - T.pull0, to: VIEWCUBE, pivot: M3C },
    { t0: T.pull1, d: T.push - T.pull1, to: { s: 0.378, f: VIEWCUBE.f } },
    { t0: T.push, d: 0.65, to: VIEWHERO },
    { t0: T.push + 0.65, d: T.home - T.push - 0.65, to: { s: 0.6, f: VIEWHERO.f } },
    { t0: T.home, d: 1.1, to: VIEWPUSH },
    { t0: T.home + 1.1, d: T.loop0 - T.home - 1.1, to: { s: 0.44, f: [0, -880] } },
    { t0: T.loop0, d: D - T.loop0, to: VIEW0 },
  ];
  function camera(t) {
    let s = VIEW0.s, f = [...VIEW0.f];
    for (const m of MOVES) {
      if (t < m.t0) break;
      const u = m.spring ? Math.min(1, spring(t - m.t0, 170, 26)) : ease.state(seg(t, m.t0, m.d)), s1 = Math.exp(lerp(Math.log(s), Math.log(m.to.s), u));
      if (m.pivot) {
        const P = m.pivot, d0 = [(P[0] - f[0]) * s, (P[1] - f[1]) * s], d1 = [(P[0] - m.to.f[0]) * m.to.s, (P[1] - m.to.f[1]) * m.to.s];
        const dx = lerp(d0[0], d1[0], u), dy = lerp(d0[1], d1[1], u);
        f = [P[0] - dx / s1, P[1] - dy / s1];
      } else f = [lerp(f[0], m.to.f[0], u), lerp(f[1], m.to.f[1], u)];
      s = s1;
    }
    return { s, f };
  }
  const toS = (cam, P) => [ANCHOR.x + (P[0] - cam.f[0]) * cam.s, ANCHOR.y + (P[1] - cam.f[1]) * cam.s];

  // ——— yer: kıyı çizgisi, önde İstanbul silueti (yakın plan; ölçek anahtarı Galata ayrı), deniz taraması ———
  const r0 = mulberry32(55), HOUSES = []; for (let x = -40; x < 1120;) { const w = 22 + r0() * 34; HOUSES.push([x, w - 3, 16 + r0() * 34]); x += w; }
  function ground(cam) {
    if (cam.s > 2) return;
    const [, gy] = toS(cam, [0, 0]); if (gy > 1960) return;
    const k = Math.sqrt(cam.s / 0.4), px = -(cam.f[0] * cam.s) * 0.35;   // hafif paralaks
    ctx.save(); ctx.fillStyle = C.ink;
    for (const [x, w, h] of HOUSES) { const X = x + px; if (X > 560 && X < 740) continue; ctx.fillRect(X, gy - h * k, w, h * k); }
    // cami: kubbe, yarım kubbeler, dört minare
    const mx = 650 + px, mh = 120 * k;
    ctx.fillRect(mx - 0.55 * mh, gy - 0.32 * mh, 1.1 * mh, 0.32 * mh);
    ctx.beginPath(); ctx.ellipse(mx, gy - 0.32 * mh, 0.32 * mh, 0.28 * mh, 0, Math.PI, 0); ctx.fill();
    for (const s2 of [-1, 1]) { ctx.beginPath(); ctx.ellipse(mx + s2 * 0.33 * mh, gy - 0.32 * mh, 0.17 * mh, 0.14 * mh, 0, Math.PI, 0); ctx.fill(); }
    ctx.fillRect(mx - 2, gy - 0.68 * mh, 4, 0.1 * mh);
    for (const [dx, hh] of [[-0.62, 0.92], [-0.52, 0.78], [0.52, 0.78], [0.62, 0.92]]) { const x = mx + dx * mh; ctx.fillRect(x - 3.5, gy - hh * mh, 7, hh * mh); ctx.beginPath(); ctx.moveTo(x - 5, gy - hh * mh); ctx.lineTo(x, gy - hh * mh - 0.12 * mh); ctx.lineTo(x + 5, gy - hh * mh); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 1.2;
    for (let y = gy + 10, k2 = 0; y < 1920; y += 9 + k2 * 0.6, k2++) { const off = (k2 * 37) % 60; for (let x = -off; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 46, y); ctx.stroke(); } }
  }
  const GULLS = [[0.0, -260, 0.9], [0.37, -330, 1.0], [0.71, -220, 0.8]];
  function gulls(t, cam, k) {
    if (k <= 0 || cam.s > 2) return;
    for (const [ph, y, sz] of GULLS) {
      const u = (cyc(t, D) + ph) % 1, x = lerp(-900, 900, u);
      const [sx, sy] = toS(cam, [x, y + 20 * Math.sin(u * 12)]);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(sx, sy); drawGull(ctx, 26 * sz * (cam.s / 0.46), cyc(t, 0.9) + ph); ctx.restore();
    }
  }

  // ——— bulut (saydamken ara katmanda çizilir: iç konturlar görünmez) ———
  const layer = document.createElement('canvas'); layer.width = W; layer.height = 1920; const lctx = layer.getContext('2d');
  function cloud(t, cam, opt = {}) {
    const k = opt.alpha ?? clamp01((3.2 - cam.s) / 1.6); if (k <= 0) return;
    const [bx, by] = toS(cam, [0, CLOUD.base]);
    const c2 = k < 1 ? lctx : ctx;
    if (k < 1) { lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, 1920); }
    c2.save(); c2.translate(bx, by); drawCloud(c2, PUFFS, CLOUD.w * cam.s, cyc(t, 8.4), { lw: 3 * Math.min(1.4, Math.max(0.8, cam.s / 0.46)), flat: opt.flat }); c2.restore();
    if (k < 1) { ctx.save(); ctx.globalAlpha = k; ctx.drawImage(layer, 0, 0); ctx.restore(); }
  }
  function clipToCloud(t, cam) { const [bx, by] = toS(cam, [0, CLOUD.base]); ctx.translate(bx, by); cloudPath(ctx, PUFFS, CLOUD.w * cam.s, cyc(t, 8.4)); ctx.translate(-bx, -by); ctx.clip(); }
  // bulutun içi: sis noktaları (ekran uzayında); yakın planda görünür; "yarım"da küpün içindekiler damlaya toplanır
  const FOG = [], fr = mulberry32(31); for (let i = 0; i < 900; i++) FOG.push({ x: fr() * W, y: STAGE_TOP + fr() * (1920 - STAGE_TOP), r: 1 + fr() * 1.6, ph: fr() * 6.28, sp: 6 + fr() * 10 });
  function fog(t, cam, gather) {
    const k = clamp01((Math.log10(cam.s) - 0.15) / 0.6); if (k <= 0) return;
    const [cx, cy] = toS(cam, M3C), a = cam.s, H = 1920 - STAGE_TOP;
    ctx.save(); ctx.fillStyle = C.ink;
    for (const p of FOG) {
      let x = (p.x + Math.sin(t * 0.7 + p.ph) * 8) % W, y = STAGE_TOP + ((p.y - STAGE_TOP - t * p.sp) % H + H) % H;
      const inCube = Math.abs(x - cx) < a * 0.5 && Math.abs(y - cy) < a * 0.5;
      if (inCube && gather > 0) { const g = ease.state(clamp01(gather * 1.2 - (p.ph / 6.28) * 0.2)); x = lerp(x, cx, g); y = lerp(y, cy, g); if (g > 0.97) continue; }
      ctx.globalAlpha = k * 0.55; ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // ——— etiket yazısı (≥ 42 px, kâğıt zeminli) ———
  function label(s, x, y, a = 1, align = 'left', size = 42) {
    if (a <= 0) return; setFont(ctx, F.mono(size)); const tw = ctx.measureText(s).width, lx = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(lx - 6, y - size * 0.95, tw + 12, size * 1.25); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(s, lx, y); ctx.restore();
  }

  // ——— 1 km'lik tel kafes küp, kafes ızgarası, 1 m³ ———
  function kmCube(t, cam) {
    const kin = seg(t, T.cube0, 1.1), out = (1 - ease.exit(seg(t, T.push - 0.25, 0.35))) * clamp01((3 - cam.s) / 1.5); if (kin <= 0 || out <= 0 || t >= T.push + 0.2) return;
    const [x0, y0] = toS(cam, CUBE0);
    ctx.save(); ctx.globalAlpha = out; ctx.translate(x0, y0); drawCubeWire(ctx, KM * cam.s, ease.state(kin), { lw: 3, dash: 9 }); ctx.restore();
  }
  function lattice(t, cam) {
    const k = seg(t, T.pull0, 0.3) * (1 - ease.exit(seg(t, T.pull1 + 1.2, 0.6))); if (k <= 0) return;
    const [x0, y0] = toS(cam, CUBE0), a = KM * cam.s;
    let best = null, bestA = 0;
    ctx.save(); ctx.beginPath(); ctx.rect(Math.max(0, x0), Math.max(STAGE_TOP, y0 - a), Math.min(W, x0 + a) - Math.max(0, x0), Math.min(1920, y0) - Math.max(STAGE_TOP, y0 - a)); ctx.clip();
    ctx.strokeStyle = C.ink;
    for (let e = 0; e <= 2; e++) {
      const g = Math.pow(10, e) * cam.s; if (g < 7 || g > 900) continue;
      const al = clamp01((g - 7) / 25) * clamp01((900 - g) / 500) * 0.34 * k; if (al <= 0) continue;
      if (al > bestA) { bestA = al; best = e; }
      ctx.globalAlpha = al; ctx.lineWidth = e === 0 ? 1 : 1.4;
      const ix0 = Math.max(0, Math.floor((0 - x0) / g)), ix1 = Math.min(Math.round(a / g), Math.ceil((W - x0) / g));
      for (let i = ix0; i <= ix1; i++) { const x = x0 + i * g; ctx.beginPath(); ctx.moveTo(x, y0 - a); ctx.lineTo(x, y0); ctx.stroke(); }
      const iy0 = Math.max(0, Math.floor((y0 - 1920) / g)), iy1 = Math.min(Math.round(a / g), Math.ceil((y0 - STAGE_TOP) / g));
      for (let i = iy0; i <= iy1; i++) { const y = y0 - i * g; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + a, y); ctx.stroke(); }
    }
    ctx.restore();
    if (best != null) label(`HER KARE ${['1', '10', '100'][best]} m`, SAFE.x0, Math.max(STAGE_TOP + 70, Math.min(1384, y0 + 56)), clamp01(bestA / 0.25));
  }
  function meterCube(t, cam) {
    const a = cam.s; if (a < 25) return;
    const k = clamp01((a - 25) / 60) * (t < T.pull0 + 1.2 ? 1 : 0); if (k <= 0) return;
    const [x0, y0] = toS(cam, M3);
    ctx.save(); ctx.globalAlpha = k; ctx.translate(x0, y0); drawCubeWire(ctx, a, 1, { lw: 3, dash: 9 }); ctx.restore();
    if (y0 + 52 < 1400) label('1 m', x0 + a / 2, y0 + 52, k, 'center');
    const g = ease.enter(seg(t, T.yarim - 0.1, 0.7));
    if (g > 0) { const [cx, cy] = toS(cam, M3C), r = Math.max(2.4, 0.0049 * a); ctx.save(); ctx.globalAlpha = k * g; ctx.translate(cx, cy); drawDroplet(ctx, r, { lw: 1.2 }); ctx.restore(); }
  }
  function reticle(t, cam) {
    const k = ease.enter(seg(t, T.dive0 - 0.1, 0.3)) * clamp01((90 - cam.s) / 50) * (t < T.pull0 ? 1 : 0); if (k <= 0) return;
    const [cx, cy] = toS(cam, M3C), r = 34;
    ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); for (const [a, b] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { ctx.moveTo(cx + a * (r + 6), cy + b * (r + 6)); ctx.lineTo(cx + a * (r + 20), cy + b * (r + 20)); } ctx.stroke(); ctx.restore();
    label('1 m³', cx + r + 26, cy + 14, k);
  }
  function dropRoundel(t, cam) {
    const k = ease.enter(seg(t, T.yarim + 0.25, 0.4)) * (1 - ease.exit(seg(t, T.pull0 + 0.1, 0.3))); if (k <= 0) return;
    const [cx, cy] = toS(cam, M3C), r = ROUND.r * k;
    const ang = Math.atan2(cy - ROUND.y, cx - ROUND.x); ctx.beginPath(); ctx.moveTo(ROUND.x + Math.cos(ang) * (r + 4), ROUND.y + Math.sin(ang) * (r + 4)); ctx.lineTo(cx - Math.cos(ang) * 10, cy - Math.sin(ang) * 10); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(ROUND.x, ROUND.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(ROUND.x, ROUND.y); ctx.scale(k, k);
    ctx.save(); ctx.translate(0, -14); drawDroplet(ctx, 59, { lw: 2.5 }); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-60, 66); ctx.lineTo(60, 66); ctx.moveTo(-60, 58); ctx.lineTo(-60, 74); ctx.moveTo(60, 58); ctx.lineTo(60, 74); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    setFont(ctx, F.mono(34)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('1 cm', 0, 106);
    ctx.restore();
    ctx.beginPath(); ctx.arc(ROUND.x, ROUND.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  function cubeLabels(t, cam) {
    const k = ease.enter(seg(t, T.km3 + 0.2, 0.4)) * (1 - ease.exit(seg(t, T.dive0, 0.3))); if (k <= 0) return;
    const [x0, y0] = toS(cam, CUBE0), a = KM * cam.s;
    label('1 km', x0 + a / 2, y0 + 14, k, 'center');
    label('1 km', x0 + a + 14, y0 - a * 0.42, k);
    const gx = x0 - 110, gy = y0, h = 63 * cam.s;
    ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(gx - 40, gy); ctx.lineTo(gx + 40, gy); ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.setLineDash([]);
    ctx.translate(gx, gy); drawGalata(ctx, h, C.ink); ctx.restore();
    label('GALATA 63 m', SAFE.x0, gy + 52, k); label('AYNI ÖLÇEK', SAFE.x0, gy + 100, k);
  }

  // ——— etiket: tabandan sarkan kâğıt etiket; kare 0'da ip toplu, 0–0,4 sn sarkar; "kaç"ta gerilir ———
  function tag(t, cam) {
    if (cam.s > 2) return;
    const vis = t < T.cube0 ? 1 - ease.exit(seg(t, T.cube0, 0.3))
      : t < T.eleIn ? ease.enter(seg(t, T.push, 0.35)) * (1 - ease.exit(seg(t, T.eleIn - 0.1, 0.3)))
      : ease.enter(seg(t, T.home + 0.6, 0.4));
    if (vis <= 0) return;
    const drop = ease.state(seg(t, 0, 0.4)) * (1 - ease.state(seg(t, T.tagBack, 0.38)));
    let len = lerp(14, 46, drop);
    // ip gerilmesi: "kaç"ta 80 ms'de 12 px aşağı, 320 ms'de yerine (salınım yok)
    if (t >= T.kac - 0.04) len += 12 * (t < T.kac + 0.04 ? ease.enter(seg(t, T.kac - 0.04, 0.08)) : 1 - ease.state(seg(t, T.kac + 0.04, 0.32)));
    const [ax, ay] = toS(cam, [-250, CLOUD.base]), sc = Math.min(1.15, cam.s / 0.46), sw = Math.sin(cyc(t, 3.2) * Math.PI * 2) * 0.05 * drop;
    const hero = t >= T.hero - 0.02 && t < T.eleIn + 0.3;
    const red = hero;
    const roll = t >= 0.3 && t < T.cube0 + 0.3;
    const lock = tl.W('l01', 'ton');
    const txt = hero || (t >= T.home && t < T.tagBack) ? '500 TON' : '? TON';
    ctx.save(); ctx.globalAlpha = vis; ctx.translate(ax, ay); ctx.rotate(sw); ctx.scale(sc, sc);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; ctx.stroke();
    setFont(ctx, F.head(52)); const tw = Math.max(ctx.measureText('500 TON').width, ctx.measureText(txt).width), w = tw + 48, h = 74;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 16, len); ctx.lineTo(w / 2, len); ctx.lineTo(w / 2, len + h); ctx.lineTo(-w / 2, len + h); ctx.lineTo(-w / 2, len + 16); ctx.closePath();
    ctx.fillStyle = red ? C.red : C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(-w / 2 + 16, len + 16, 5, 0, Math.PI * 2); ctx.strokeStyle = red ? C.paper : C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = red ? C.paper : C.ink; ctx.textAlign = 'center';
    if (roll) {
      // "?" yerinde makara: rakamlar arasında "?" ; her hane farklı hızda yavaşlar ve "ton?"da "?" konumunda kilitlenir
      setFont(ctx, F.head(52)); const unit = ' TON', uw = ctx.measureText(unit).width, dw = ctx.measureText('0').width * 1.12, x0 = -(3 * dw + uw) / 2 + 6, base = len + h - 18, step = 56;
      ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 4, len + 6, w - 8, h - 12); ctx.clip();
      const kRoll = 1;   // geçiş tek karede (iki yazı üst üste binmez)   // kilitten sonra "???" etiketle birlikte söner (eski yazı geri gelmez)
      for (let i = 0; i < 3; i++) {
        const tEnd = lock - 0.24 + i * 0.12, N = 22 + i * 6, u = seg(t, 0.3, tEnd - 0.3), v = N * (1 - (1 - u) * (1 - u)), n = Math.floor(v), f = v - n;
        const sym = m => (m % 2 === 0 ? '?' : '–');   // şeritte rakam yok: yalnız "?" ve ayraç çizgisi
        const speed = u < 1 ? (2 * N * (1 - u)) / (tEnd - 0.3) : 0, blur = Math.min(6, speed * 0.25);
        const x = x0 + i * dw;
        for (const [dy, al] of blur > 0.5 ? [[-blur, 0.3], [blur, 0.3], [0, 1]] : [[0, 1]]) {
          ctx.globalAlpha = vis * kRoll * al; ctx.textAlign = 'left';
          ctx.fillText(sym(n), x, base + f * step + dy); ctx.fillText(sym(n + 1), x, base - step + f * step + dy);
        }
      }
      ctx.restore(); ctx.globalAlpha = vis; ctx.textAlign = 'left'; ctx.fillText(unit, x0 + 3 * dw, base);
          } else ctx.fillText(txt, 6, len + h - 18);
    ctx.restore();
  }

  // ——— filler: bulutun içinde 10 sıra × 10, bulut sınırına kırpılı; ikinci "yüz"de sıra sıra iner ———
  const ELE = [];
  { const r = mulberry32(19);
    const hw = y => { let m = 0; for (const p of PUFFS) { const py = p.y * CLOUD.w, R = p.r * CLOUD.w, dy = (y - CLOUD.base) - py; if (Math.abs(dy) < R) m = Math.max(m, Math.abs(p.x * CLOUD.w) + Math.sqrt(R * R - dy * dy)); } return m; };
    for (let j = 0; j < 10; j++) { const v = j / 9, y = lerp(-1470, -690, v), sz = lerp(56, 62, v), w0 = Math.max(160, hw(y - 30) * 0.86);
      for (let i = 0; i < 10; i++) ELE.push({ j, x: lerp(-w0 + sz * 0.3, w0 - sz * 0.9, i / 9) + (j % 2 ? 10 : -10), y, sz, ph: r() }); } }
  function elephants(t, cam) {
    const out = 1 - ease.exit(seg(t, T.eleOut, 0.4));
    ctx.save(); clipToCloud(t, cam);
    for (const e of ELE) {
      const u = ease.enter(seg(t, T.eleIn + e.j * 0.045, 0.45)); if (u <= 0) continue;
      const a = u * out; if (a <= 0) continue;
      const [sx, sy] = toS(cam, [e.x + 8 * Math.sin(cyc(t, 6) * 6.28 + e.ph * 6), e.y]);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(sx, sy - (1 - u) * 40);
      drawElephant(ctx, ELEPHANT_CARD, { walk: (cyc(t, 1.6) + e.ph) % 1, trunk: Math.sin(e.ph * 9) * 0.6, ear: 0.3 }, e.sz * cam.s, { flat: true });
      ctx.restore();
    }
    ctx.restore();
  }
  // l07: bulutun ortasında dört büyük filin silik kontürü yürür
  function parade(t, cam, k) {
    ctx.save(); clipToCloud(t, cam);
    for (let i = 0; i < 3; i++) {
      const [sx, sy] = toS(cam, [lerp(-340, 340, i / 2) + 14 * Math.sin(cyc(t, 7) * 6.28 + i), -800]);
      ctx.save(); ctx.globalAlpha = k * 0.45; ctx.translate(sx, sy); drawElephant(ctx, ELEPHANT_CARD, { walk: (cyc(t, 1.8) + i * 0.23) % 1, trunk: 0.3 * Math.sin(i * 2), ear: 0.3 }, 150 * cam.s, { flat: true, fill: 'rgba(0,0,0,0)' }); ctx.restore();
    }
    ctx.restore();
  }
  // kare 0 ve döngü sonu: bulutun içinde seçilmesi güç tek bir fil izi (cevabı vermeden merak)
  function hint(t, cam) {
    const k = (1 - ease.exit(seg(t, T.cube0 - 0.4, 0.4))) + ease.enter(seg(t, T.loop0 + 0.3, D - T.loop0 - 0.4)); if (k <= 0 || cam.s > 2) return;
    ctx.save(); clipToCloud(t, cam); const [sx, sy] = toS(cam, [-30, -820]);
    ctx.globalAlpha = clamp01(k) * 0.11; ctx.translate(sx, sy); drawElephant(ctx, ELEPHANT_CARD, { walk: 0.12, trunk: 0.2, ear: 0.3 }, 300 * cam.s, { flat: true, fill: 'rgba(0,0,0,0)' }); ctx.restore();
  }

  // ——— büyüteç (l06): yükselen havada damlacıklar; 1 mm = 2000 px (damla ≈ 0,02 mm → 40 px), saç teli 0,07 mm ———
  const LENS = { x: 480, y: 1040, r: 290 };
  const DROPS = []; { const r = mulberry32(83); for (let i = 0; i < 26; i++) DROPS.push({ x: (r() - 0.5) * 540, y: r(), d: 30 + r() * 22, ph: r() * 6.28, sp: 0.6 + r() * 0.5 }); }
  function lens(t, cam) {
    const k = ease.enter(seg(t, T.lens0, 0.6)) * (1 - ease.exit(seg(t, T.lens1, 0.35))); if (k <= 0) return;
    const [ox, oy] = toS(cam, [0, -1100]), cx = lerp(ox, LENS.x, k), cy = lerp(oy, LENS.y, k), r = LENS.r * k;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#F2ECDF'; ctx.fill(); ctx.clip();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.5); ctx.fillStyle = '#E3DACA'; ctx.fillRect(-500, 110, 1000, 140); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(-500, 110, 1000, 140);
    ctx.strokeStyle = 'rgba(28,27,24,0.35)'; ctx.lineWidth = 1.2; for (let x = -500; x < 500; x += 34) { ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x + 22, 250); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; for (const ax of [-200, 0, 200]) { const y0 = cy + 200 - ((t * 60 + ax) % 140); ctx.beginPath(); ctx.moveTo(cx + ax, y0); ctx.lineTo(cx + ax, y0 - 90); ctx.moveTo(cx + ax - 14, y0 - 72); ctx.lineTo(cx + ax, y0 - 92); ctx.lineTo(cx + ax + 14, y0 - 72); ctx.stroke(); }
    for (const p of DROPS) {
      const y = cy + 300 - (((p.y * 600) + (t - T.lens0) * 34 * p.sp) % 600), x = cx + p.x + Math.sin(t * 1.1 + p.ph) * 10;
      ctx.save(); ctx.translate(x, y); drawDroplet(ctx, p.d / 2 * Math.max(0.3, k), { lw: 2 }); ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  function lensLabels(t) {
    const a2 = ease.enter(seg(t, T.minicik + 0.15, 0.4)) * (1 - ease.exit(seg(t, T.lens1, 0.3))); if (a2 <= 0) return;
    const cx = LENS.x, cy = LENS.y, r = LENS.r;
    ctx.save(); ctx.globalAlpha = a2; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(SAFE.x0 + 70, 1350); ctx.lineTo(cx - 190, cy + 150); ctx.moveTo(640, 1350); ctx.lineTo(cx + 120, cy + 200); ctx.stroke(); ctx.restore();
    label('YÜKSELEN HAVA', SAFE.x0, 1398, a2); label('SAÇ TELİ', 560, 1398, a2);
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'bakma_yukari', 'notr'], [T.kac, 'bakma_yukari', 'saskin'], [T.km3, 'sasirma', 'saskin'], [T.km3 + 1.4, 'ayakta', 'notr'], [T.yarim, 'ayakta', 'dusunceli'], [T.milyar, 'sasirma', 'saskin'], [T.milyar + 1.3, 'ayakta', 'dusunceli'],
    [T.hero, 'sasirma', 'saskin'], [T.fil + 2.0, 'ayakta', 'mutlu'], [T.neden, 'ayakta', 'dusunceli'], [T.cunku + 1.2, 'ayakta', 'notr'], [T.back, 'bakma_yukari', 'mutlu'], [T.loop0 + 0.4, 'bakma_yukari', 'notr']];
  const bubbles = [[T.fil + 0.3, T.fil + 1.9, 'Yüz fil mi?!']];
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
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = 790 - w, y = SIFIR.y - 22;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y - 10); ctx.scale(k, k); ctx.translate(-(x + w), -(y - 10));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 4, y - 16); ctx.lineTo(x + w + 34, y - 36); ctx.lineTo(x + w - 4, y + 6);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  // l05a–l05b: tek kart, cümlenin tamamı; sayılar söylendikleri kelimede boşluğa yazılır
  const GAPTXT = `${ep.voice.lines.find(l => l.id === 'l05a').text} ${ep.voice.lines.find(l => l.id === 'l05b').text}`;
  function gapCard(t) {
    const p = ease.enter(seg(t, on('l05a') - 0.04, 0.3));
    const fs0 = 50; setFont(ctx, F.name(fs0)); const ls = wrap(ctx, GAPTXT, SAFE.x1 - SAFE.x0), lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    const fills = { '500': T.hero - 0.02, '100': T.fil - 0.02 };
    ls.slice(0, 3).forEach((line, i) => {
      let x = SAFE.x0; const y = y0 + i * lh;
      for (const tok of line.split(/(500|100)/)) {
        if (!tok) continue; setFont(ctx, F.name(fs0)); const w = ctx.measureText(tok).width;
        if (fills[tok] != null) {
          const q = ease.enter(seg(t, fills[tok], 0.25));
          if (q < 1) { ctx.save(); ctx.globalAlpha = (1 - q) * p; ctx.beginPath(); ctx.moveTo(x + 2, y + 8); ctx.lineTo(x + w - 2, y + 8); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore(); }
          if (q > 0) revealText(ctx, tok, x, y, fs0, q, C.ink);
        } else revealText(ctx, tok, x, y, fs0, p, C.ink);
        x += w;
      }
    });
  }
  function narration(t) {
    if (t < on('l02') - 0.04 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= on(l.id) - 0.04) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const p = ease.enter(seg(t, on(ln.id) - 0.04, 0.3)) * (t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1);
    // l05b: l05a'nın parçası kartta durur, ikinci parça sessizlikten sonra eklenir (tek kart)
    if (ln.id === 'l05a' || ln.id === 'l05b') { gapCard(t); return; }
    const full = ln.text;
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, full, SAFE.x1 - SAFE.x0); if (ls.length <= 2 || (ls.length === 3 && f <= 44)) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    if (ln.id !== 'l05b') { ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink)); return; }
    let used = 0;
    ls.slice(0, 3).forEach((s, i) => {
      const start = used; used += s.length + 1;
      if (start + s.length <= PREFIX.length) { revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, 1, C.ink); return; }
      if (start < PREFIX.length) {
        const a = s.slice(0, PREFIX.length - start), b = s.slice(PREFIX.length - start);
        revealText(ctx, a, SAFE.x0, y0 + i * lh, fs0, 1, C.ink);
        setFont(ctx, F.name(fs0)); revealText(ctx, b.trimStart(), SAFE.x0 + ctx.measureText(a + ' ').width, y0 + i * lh, fs0, p, C.ink); return;
      }
      revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink);
    });
  }
  const TITLE = ['Başının üstündeki', 'o pamuk gibi bulut', 'kaç ton?'];
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, on('l02') - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    let fs0 = 96; for (const f of [96, 90, 84]) { fs0 = f; setFont(ctx, F.head(f)); if (Math.max(...TITLE.map(s => ctx.measureText(s).width)) <= SAFE.x1 - SAFE.x0) break; }
    setFont(ctx, F.head(fs0)); TITLE.forEach((s, i) => revealText(ctx, s, SAFE.x0, 470 + i * fs0 * 1.0, fs0, k, C.ink));
  }
  function row({ label: lb, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, lb, SAFE.x0, 590, 32, p, red ? C.red : C.ink);
    if (num) { setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink); if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); } }
    setFont(ctx, F.mono(40));
    if (right1) revealText(ctx, right1, SAFE.x1, 634, 40, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 682, 40, p, C.ink, 'right');
  }
  const fmtLen = m => { const f = (v, d) => v.toLocaleString('tr-TR', { maximumFractionDigits: d }); return m >= 1000 ? `${f(m / 1000, 1)} km` : m >= 1 ? `${f(m, m < 10 ? 1 : 0)} m` : `${f(m * 100, 0)} cm`; };
  function counters(t, cam) {
    if (t < on('l02') - 0.05 || t >= T.loop0 + 0.3) return;
    const fade = t >= T.loop0 ? 1 - ease.exit(seg(t, T.loop0, 0.25)) : 1;
    const pIn = a => ease.enter(seg(t, a - 0.04, 0.3)) * fade;
    if (t < T.dive0) { if (t < T.km3 - 0.04) return; row({ label: 'SIRADAN BİR KÜMÜLÜS', num: '1', unit: 'km³', right1: '1 km × 1 km', right2: '× 1 km', p: pIn(T.km3) }); return; }
    if (t < T.yarim - 0.04 || (t >= T.pull0 && t < T.milyar - 0.04)) { const [num, unit] = fmtLen(830 / cam.s).split(' '); row({ label: 'LOG ÖLÇEK · GÖRÜŞ ALANI', num, unit, p: fade }); return; }
    if (t < T.pull0) { row({ label: 'HER METREKÜPTE SU', num: '0,5', unit: 'gram', right1: 'HEPSİ TEK DAMLA OLSA', right2: 'ÇAPI: 1 cm', p: pIn(T.yarim) }); return; }
    if (t < T.hero - 0.02) { row({ label: '1 km³ İÇİNDE', num: '1 milyar', unit: 'm³', right1: '1.000 × 1.000', right2: '× 1.000', p: pIn(T.milyar) }); return; }
    if (t < T.neden - 0.06) { row({ label: 'BULUTTAKİ SU', num: '500', unit: 'ton', red: true, right1: t >= T.fil - 0.04 ? '100 FİL KADAR' : '', right2: t >= T.fil - 0.04 ? '1 FİL: YAKLAŞIK 5 TON' : '', p: fade }); return; }
    if (t < on('l07') - 0.06) { if (t < T.minicik - 0.04) return; row({ label: 'BULUT DAMLASI', num: '0,02', unit: 'mm', right1: 'SAÇ TELİ: 0,07 mm', p: pIn(T.minicik) }); return; }
  }
  function follow(t) {
    if (t < T.follow || t >= T.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, T.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 470;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 600, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 600, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 645); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const cam = camera(t);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ground(cam);
    gulls(t, cam, 1 - seg(t, T.eleIn, 0.3) + seg(t, T.lens1, 0.4));
    cloud(t, cam);
    if (t >= T.eleIn && t < T.eleOut + 0.45) elephants(t, cam);
    const gk = ease.enter(seg(t, T.gok - 0.1, 0.6)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.5)));
    if (gk > 0 && cam.s < 2) parade(t, cam, gk);
    hint(t, cam);
    fog(t, cam, seg(t, T.yarim - 0.15, 0.7));
    kmCube(t, cam); lattice(t, cam); meterCube(t, cam); reticle(t, cam);
    tag(t, cam);
    cubeLabels(t, cam);
    lens(t, cam);
    ctx.restore();
    lensLabels(t);
    dropRoundel(t, cam);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t, cam);
    follow(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

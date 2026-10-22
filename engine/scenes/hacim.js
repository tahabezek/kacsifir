// Sahne: Jüpiter'in içine kaç Dünya sığar? Seçenekler 125 (resimdeki diskler) · 318 (kütle) · 1.321 (hacim).
// Sıfır Dünya'ları Jüpiter'e atar, Dünya'lar erir ve Jüpiter'in kesiti dolar (küre kapağının hacmi): 1.321'de dolu.
// Doruk: Jüpiter'in kütlesi yalnızca 318 Dünya; aynı yoğunlukta kaya Jüpiter'in ancak %24'ünü doldurur, gerisi gaz.
import { ease, seg, lerp, spring } from '../core.js';
import { drawActor } from '../actor.js';
import { SAFE, TAU, nf0, nf1, win, loadPlanets, makePlate } from './plate.js';

// küre kapağı: doluluk oranı f (hacim) → seviye h/R (0 dip, 2 tepe)
function capLevel(f) {
  if (f <= 0) return 0; if (f >= 1) return 2;
  let x = 2 * f;                                         // ilk tahmin
  for (let k = 0; k < 30; k++) { const g = x * x * (3 - x) - 4 * f, d = 6 * x - 3 * x * x; x = Math.min(2, Math.max(0, x - g / (d || 1e-6))); }
  return x;
}

export function buildHacimTimeline(ep) {
  const T = ep.timing;
  return { beat: 60 / ep.bpm, ...T, vol: ep.ratio.volume, mass: ep.ratio.mass, duration: T.end, rw0: T.ret[0], rw1: T.end };
}
// atılan Dünya sayısı: ilk üçü tek tek, sonra üstel hızlanan akış; pour[1]'de hacmin tamamı
export function thrownAt(tl, t) {
  const [a, b] = tl.pour, single = tl.singles;
  if (t < a) return 0;
  const s0 = single[single.length - 1] + tl.flight;                    // üçüncü Dünya'nın düştüğü an
  if (t < s0) return single.filter(s => t >= s + tl.flight).length;
  const u = seg(t, s0, b - s0);
  const k = 5.2, g = (Math.exp(k * u) - 1) / (Math.exp(k) - 1);
  return Math.min(tl.vol, single.length + Math.floor(g * (tl.vol - single.length)));
}
export function hacimSummary(ep) {
  const tl = buildHacimTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.hero, cover: 0,
    keys: [0, 1.0, ...tl.singles.map(s => s + tl.flight + 0.3), (tl.pour[0] + tl.pour[1]) / 2 + 2, tl.pour[1] + 0.3, tl.ask + 0.9, tl.hero + 0.3, tl.hero + 1.5, tl.coda + 0.8, tl.rw0 + 0.6],
    fast: tl.pour[1] - 0.5, lastLand: tl.pour[1], firstLand: tl.singles[0] + tl.flight };
}
export function hacimCues(ep) {
  const tl = buildHacimTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence[0], tl: tl.hero },
    grows: [{ t0: tl.singles[tl.singles.length - 1] + tl.flight, t1: tl.pour[1], hero: false }],
    lands: [...tl.singles.map(s => s + tl.flight), tl.pour[1]],
    tallies: [] };
}

export async function makeHacimRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildHacimTimeline(ep), D = tl.duration, Gm = ep.geom;
  const P = makePlate(ctx, ep, await loadPlanets());
  const { C, F, setFont, revealText } = P;
  const J = { x: Gm.jx, y: Gm.jy, r: Gm.jr }, rE = Gm.jr / ep.ratio.radius;
  const E0 = { x: Gm.ex, y: Gm.ey };                                  // Dünya'nın kare 0'daki yeri
  const HAND = { x: Gm.handX, y: Gm.handY };

  // seviye: dolum (hacim) → doruk: kütle kadar kaya (%24) → dönüş: boşalır
  function fillFrac(t) {
    if (t < tl.ret[0]) return thrownAt(tl, t) / tl.vol;
    return 1 - ease.state(seg(t, tl.ret[0], tl.ret[1] - tl.ret[0] - 0.2));
  }
  const surfaceY = t => J.y + J.r - capLevel(fillFrac(t)) * J.r;

  // havadaki Dünya'lar: atış i, fırlatma anı τ_i, uçuş tl.flight; yörünge el → Jüpiter'in tepesine (parabol)
  // i. Dünya'nın düşüş anı thrownAt'ın tersinden (ikili arama): sayaç ile görüntü aynı takvimi okur
  function landTime(i) {                                              // i. Dünya'nın (0'dan) Jüpiter'e düştüğü an
    if (i < tl.singles.length) return tl.singles[i] + tl.flight;
    let lo = tl.pour[0], hi = tl.pour[1];
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (thrownAt(tl, m) > i) hi = m; else lo = m; }
    return hi;
  }
  const LANDS = []; for (let i = 0; i < tl.vol; i++) LANDS.push(landTime(i));
  function flying(t) {
    const list = [];
    if (t < tl.pour[0] - tl.flight || t > tl.pour[1] + 0.05) return list;
    // aynı anda en çok ~36 Dünya çizilir (akış yoğunken her k'ıncı); sayaç hepsini sayar
    let i0 = 0; while (i0 < LANDS.length && LANDS[i0] < t) i0++;
    let i1 = i0; while (i1 < LANDS.length && LANDS[i1] - tl.flight <= t) i1++;
    const step = Math.max(1, Math.ceil((i1 - i0) / 36));
    for (let i = i0; i < i1; i += step) list.push(i);
    return list;
  }
  function earthPos(i, t) {
    const land = LANDS[i], u = 1 - (land - t) / tl.flight;
    const jit = ((i * 7919) % 97) / 97 - 0.5;                         // tohumlu sapma: her atış biraz farklı yere
    const tx = J.x + jit * J.r * 0.9, ty = surfaceY(land) - rE * 0.4;
    const x = lerp(HAND.x, tx, u), y = lerp(HAND.y, ty, u) - Math.sin(Math.PI * u) * Gm.arc;
    return { x, y };
  }

  // Jüpiter kesiti: gravür + içindeki erimiş kaya (yoğun tarama) + yüzey çizgisi
  function vessel(t) {
    P.planet('jupiter', J.x, J.y, J.r);
    const sy = surfaceY(t);
    if (sy >= J.y + J.r - 0.5) return;
    ctx.save(); ctx.beginPath(); ctx.arc(J.x, J.y, J.r * 0.985, 0, TAU); ctx.clip();
    // erimiş kaya: yüzey hafifçe dalgalanır, tarama yavaşça akar (döngüye kilitli; sürekli hareket)
    const ph = (t / D) * Math.round(D / 2.4) * TAU;
    const sp = lerp(14, 14 / tl.densityRatio, ease.state(seg(t, tl.hero, tl.drain))) * (t >= tl.ret[0] ? 1 : 1);
    const surf = x => sy + Math.sin(ph + (x - J.x) * 0.035) * 3.2;
    ctx.beginPath(); ctx.moveTo(J.x - J.r, J.y + J.r + 10);
    for (let x = J.x - J.r; x <= J.x + J.r; x += 6) ctx.lineTo(x, surf(x));
    ctx.lineTo(J.x + J.r, J.y + J.r + 10); ctx.closePath();
    ctx.save(); ctx.clip();                              // kâğıt dolgu yok: gravür taramanın altından görünür
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.beginPath();
    // tarama çok yavaş akar (döngüye kilitli tam sayı aralık): ölü kare yok, hare yok
    const flow = ((t / D) * Math.round(D * 0.8)) % 1 * sp;
    for (let x = J.x - 3 * J.r - 60 + flow; x < J.x + J.r; x += sp) { ctx.moveTo(x, J.y + J.r + 10); ctx.lineTo(x + (J.y + J.r + 10 - sy + 10), sy - 10); } ctx.stroke(); ctx.restore();
    ctx.lineWidth = 3.5; ctx.beginPath(); for (let x = J.x - J.r; x <= J.x + J.r; x += 6) { x === J.x - J.r ? ctx.moveTo(x, surf(x)) : ctx.lineTo(x, surf(x)); } ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.arc(J.x, J.y, J.r * 0.99, 0, TAU); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // seçenekler: kare 0'da hazır, akış başlarken kalkar, döngü dikişinden önce yeniden yazılır
  function choices(t) {
    const back = t >= tl.reasons;
    const a = t < tl.choicesOut ? 1 : back ? ease.enter(seg(t, tl.reasons, 0.4)) : 1 - ease.exit(seg(t, tl.choicesOut, 0.3));
    const why = back ? 1 - ease.exit(seg(t, tl.ret[1] - 0.6, 0.3)) : 0;
    if (a <= 0) return;
    ep.choices.forEach((c, i) => {
      const x = SAFE.x0 + i * 280, y = 822, w = 266, h = 104;
      const u = a;                                                     // kare 0'da tam (küçük resim)
      ctx.save(); ctx.globalAlpha = 1;
      ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
      ctx.beginPath(); ctx.rect(x, y, w * a, h); ctx.stroke();
      setFont(ctx, F.mono(40)); revealText(ctx, c.k, x + 18, y + 66, 40, a, C.graphite);
      setFont(ctx, F.head(56)); revealText(ctx, c.v, x + 64, y + 72, 56, u * a, C.ink);
      const wk = back ? ease.enter(seg(t, tl.reasons + 0.6 * (i + 1), 0.35)) * why : 0;
      if (wk > 0) { setFont(ctx, F.name(34)); revealText(ctx, c.what, x + w / 2, y + h + 44, 34, wk, C.ink, 'center'); }
      ctx.restore();
    });
  }

  function render(t) {
    P.paper();
    P.stage(() => {
      // kamera: kare 0'dan dönüşe dek %6 doğrusal itme (Jüpiter'in merkezine), dönüşte geri
      const zk = (tt, dz) => dz * spring(t - tt, 170, 26);
      const z = 1 + 0.03 * seg(t, 0, tl.pour[1]) + 0.06 * seg(t, tl.pour[1], tl.ret[0] - tl.pour[1]) - 0.06 * ease.state(seg(t, tl.ret[0], tl.ret[1] - tl.ret[0])) + zk(tl.pour[1] + 0.2, 0.06) + zk(tl.ask, 0.06) - zk(tl.hero + tl.drain + 0.4, 0.04) + zk(tl.coda, 0.06) - zk(tl.ret[0], 0.17);
      ctx.save(); ctx.translate(J.x, J.y); ctx.scale(z, z); ctx.translate(-J.x, -J.y);
      vessel(t);
      // çap ölçüsü: kare 0'dan ilk atışa dek diskin üstünde
      // Dünya (kare 0'da Jüpiter'in yanında, gerçek oranda); dolum boyunca yerinde durur
      P.planet('dunya', E0.x, E0.y, rE);
      const tu = Math.max(win(t, 0, tl.pour[0] + 0.4), t >= tl.ret[1] - 0.6 ? ease.state(seg(t, tl.ret[1] - 0.6, 0.6)) : 0);
      P.tag(E0, ep.label.earth, 0, -60, tu);
      for (const i of flying(t)) { const p = earthPos(i, t); P.planet('dunya', p.x, p.y, rE); }
      // doruk: kütle çizgisi (kırmızı) ve üstte gaz
      const hu = win(t, tl.hero + tl.drain - 0.1, tl.ret[0] + 0.3, 0.35);
      if (hu > 0) {
        const plate = (text, x, y, size, font, color, u) => {
          if (u <= 0) return; setFont(ctx, font(size)); const w = ctx.measureText(text).width + 28;
          ctx.save(); ctx.fillStyle = C.paper; ctx.fillRect(x - w / 2, y - size * 0.95, w * Math.min(1, u * 1.4), size * 1.3);
          ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.strokeRect(x - w / 2, y - size * 0.95, w * Math.min(1, u * 1.4), size * 1.3); ctx.restore();
          revealText(ctx, text, x, y, size, ease.enter(seg(u, 0.4, 0.6)), color, 'center');
        };
        plate(ep.label.gas, J.x, J.y - J.r * 0.42, 44, F.name, C.ink, win(t, tl.coda, tl.reasons, 0.5));
      }
      ctx.restore();
      // aynı hacim, iki madde: sık taralı Dünya ve 4 kat seyrek Jüpiter (diskin dışında, sağ üstte)
      const su = win(t, tl.hero + tl.drain, tl.reasons + 0.2, 0.5);
      if (su > 0) {
        const sq = (x, y, gap, name, k) => {
          const w = 110, u = Math.min(1, su * 1.3 - k * 0.25); if (u <= 0) return;
          ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, w * u); ctx.clip();
          ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, w);
          ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.beginPath();
          for (let q = -w; q < w; q += gap) { ctx.moveTo(x + q, y + w); ctx.lineTo(x + q + w, y); } ctx.stroke(); ctx.restore();
          ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x, y, w, w * u);
          setFont(ctx, F.mono(32)); revealText(ctx, name, x + w / 2, y - 14, 32, ease.enter(seg(u, 0.6, 0.4)), C.ink, 'center');
        };
        sq(Gm.sqX, Gm.sqY, 14, ep.label.earth, 0);
        sq(Gm.sqX + 125, Gm.sqY, 14 / tl.densityRatio, ep.label.jupiter, 1);
      }
      P.fadeTop();
    });
    const q2 = t >= tl.ask && t < tl.ret[1] - 0.5;
    P.header(q2 ? ep.question2 : ep.question, q2 ? ease.enter(seg(t, tl.ask, 0.4)) : t >= tl.ret[1] - 0.5 ? ease.enter(seg(t, tl.ret[1] - 0.5, 0.4)) : 1);
    const L = ep.label;
    if (t >= tl.reasons && t < tl.ret[1] - 0.6) P.counter({ label: L.allTrue, num: L.allTrueNum, pin: ease.enter(seg(t, tl.reasons, 0.4)) });
    else if (t < tl.pour[0] || t >= tl.ret[1] - 0.6) P.counter({ label: L.diam, num: L.diamNum, pin: t < tl.pour[0] ? 1 : ease.enter(seg(t, tl.ret[1] - 0.6, 0.4)) });
    else if (t < tl.hero) {
      const n = thrownAt(tl, t);
      P.counter({ label: L.inside, num: nf0.format(n) + ' ' + L.unit, sub: t >= tl.pour[1] ? L.byVolume : null, pin: ease.enter(seg(t, tl.pour[0], 0.4)), subPin: ease.enter(seg(t, tl.pour[1], 0.4)) });
    } else {
      const coda = t >= tl.coda;
      P.counter({ label: L.mass, num: nf0.format(tl.mass) + ' ' + L.unit, sub: coda ? L.density : L.volSub, red: true, pin: ease.enter(seg(t, tl.hero, 0.4)), subPin: ease.enter(seg(t, coda ? tl.coda : tl.hero + 0.3, 0.4)), pop: t - tl.hero });
    }
    choices(t);
    P.says(ep.says, t, tl, null);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }

  // Sıfır: sağda, Dünya'ları atar. İlk üçünü sayar, akış hızlanınca terler, dolunca sevinir, soruda düşünür,
  // sessizlikte donar, doruğa zıplar; döngüde kare 0 duruşuna döner
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.pour[0] + tl.flight, expr: 'notr' },
    { type: 'count', t0: tl.pour[0] + tl.flight, t1: tl.singles[tl.singles.length - 1] + tl.flight + 0.3, valueAt: t => Math.max(1, thrownAt(tl, t)), bubble: 'top' },
    { type: 'sweat', t0: tl.singles[tl.singles.length - 1] + tl.flight + 0.3, t1: tl.pour[1] },
    { type: 'happy', t0: tl.pour[1], t1: tl.ask },
    { type: 'think', t0: tl.ask, t1: tl.silence[0] },
    { type: 'idle', t0: tl.silence[0], t1: tl.hero - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.hero - 0.05, t1: tl.hero + 0.85 },
    { type: 'lookUp', t0: tl.hero + 0.85, t1: tl.ret[0] + 0.4, expr: 'saskin' },
    { type: 'lookUp', t0: tl.ret[0] + 0.4, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: Gm.actorX, y: 1414, facing: -1 };

  return { render, duration: D, timeline: tl };
}

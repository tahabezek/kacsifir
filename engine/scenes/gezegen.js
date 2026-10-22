// Sahne: bütün gezegenler Dünya ile Ay arasına sığar mı? Kare 0 ünlü resim (Ay en uzakta, sığarlar). Ay ortalama
// uzaklığa kayınca Neptün sıkışıp diziden yukarı kalkar. Kamera gezegenlerin üstünden uçar, çaplar toplanır; boşluk
// merkezlerden değil yüzeylerden ölçülür ve taşan 11.657 km yakından gösterilir. Sonra tepe planı: Ay'ın yörüngesi, sığma
// sınırı ve kırmızı yay. Son olarak kamera Neptün ile Ay'ın değdiği yere iner: Ay bir tur boyunca gidip gelir, gün
// sayacı akar, sığdığı 9 günde kırmızı bir boşluk açılır.
// Dünya birimi km; Dünya'nın merkezi (0,0), dizi +x yönünde. Gezegenler üretilmiş gravürlerdir (assets/planets).
import { W, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const A = { x: 540, y: 1140 };                       // kamera çapası: ekranda dizinin ekseni
const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const km = v => nf0.format(Math.round(v)) + ' km';
const TAU = Math.PI * 2;

// ——— Geometri: dizi, Neptün'ün sıkışması, Ay'ın yörüngesi ———
export function geometry(ep) {
  const RE = ep.earthR, RM = ep.moonR;
  let x = RE;
  const row = ep.planets.map(p => { const c = { ...p, r: p.d / 2, x: x + p.d / 2 }; x += p.d; return c; });
  const total = x - RE;
  const a = ep.orbit.a, e = ep.orbit.apogee / a - 1;
  const need = total + RE + RM;                      // sığmaları için gereken merkez uzaklığı
  return { RE, RM, row, total, a, e, need, end: x };
}

// Neptün (son gezegen): yerinde ya da Uranüs ile Ay'ın arasına sıkışmış (ikisine de teğet, yukarıda)
export function lastPos(G, d) {
  const N = G.row[G.row.length - 1], U = G.row[G.row.length - 2];
  if (d - G.RM - N.r >= N.x) return { x: N.x, y: 0 };
  const base = d - U.x, p = U.r + N.r, q = G.RM + N.r;
  const along = (p * p - q * q + base * base) / (2 * base);
  return { x: U.x + along, y: -Math.sqrt(Math.max(0, p * p - along * along)) };
}

// Kepler: ortalama anomali → eksantrik anomali, uzaklık. E perijeden ölçülür; gerçek anomali E ile sürekli açılır.
function kepler(G, M) {
  let E = M;
  for (let k = 0; k < 12; k++) E -= (E - G.e * Math.sin(E) - M) / (1 - G.e * Math.cos(E));
  const b = G.e / (1 + Math.sqrt(1 - G.e * G.e));
  return { E, nu: E + 2 * Math.atan(b * Math.sin(E) / (1 - b * Math.cos(E))), r: G.a * (1 - G.e * Math.cos(E)) };
}
const meanAnom = (G, E) => E - G.e * Math.sin(E);

export function buildGezegenTimeline(ep) {
  const T = ep.timing, G = geometry(ep);
  // yolculuk: Ay ortalama uzaklıktan (içeri doğru, E = 270°) perijeden geçer, sığma penceresine girer, apojeden geçer
  // ve pencerenin öbür ucunda (yeniden sığma sınırında) durur. Pencere: cos E < (1 − need/a)/e
  const ac = Math.acos((1 - G.need / G.a) / G.e);
  const E0 = 1.5 * Math.PI, Ein = TAU + ac, E1 = 2 * TAU - ac;
  const M0 = meanAnom(G, E0), M1 = meanAnom(G, E1), Min = meanAnom(G, Ein);
  const nu0 = kepler(G, M0).nu, lap = ep.orbit.lap, Map = meanAnom(G, 3 * Math.PI);
  const tl = { beat: 60 / ep.bpm, ...T, G, M0, M1, Map, nu0, lap, apogee: ep.orbit.apogee, mean: ep.orbit.a, duration: T.end, rw0: T.ret[0], rw1: T.end };
  tl.fitDay = (Min - M0) / TAU * lap;
  // gün sayacı: ilk sığma günü tam bir gün sınırında başlasın (sayaç ile sığma günü aynı değerden okunur)
  tl.dayOff = Math.ceil(tl.fitDay) - tl.fitDay;
  // apojede bekleme: yolculuk süresi iki parçaya ΔM ile orantılı bölünür
  const hold = T.apHold, run = T.travel[1] - T.travel[0] - hold;
  tl.apAt = T.travel[0] + run * (Map - M0) / (M1 - M0); tl.apEnd = tl.apAt + hold;
  tl.ticks = []; for (let v = 0; v <= ep.orbit.apogee; v += 50000) tl.ticks.push(v);
  tl.keys = ep.planets.map((_, k) => T.firstKey + k * T.hop);
  // Neptün'ün kalkmaya başladığı an (sıkışma) ve yeniden yerine indiği an (yolculuk)
  const dAt = t => moonState(tl, t).d;
  tl.liftAt = findCross(t => dAt(t) - G.need, T.squeeze[0], T.squeeze[1]);
  tl.landAt = findCross(t => dAt(t) - G.need, T.travel[0] + 0.5, T.travel[1] - 0.05);
  return tl;
}
function findCross(f, a, b) {
  let fa = f(a);
  for (let k = 1; k <= 600; k++) { const t = a + (b - a) * k / 600, ft = f(t); if (Math.sign(ft) !== Math.sign(fa)) return t; fa = ft; }
  return b;
}

// Ay'ın Dünya'ya uzaklığı d; yolculukta ortalama anomali M (gün sayacı bundan okunur)
export function moonState(tl, t) {
  const [s0, s1] = tl.squeeze, [v0, v1] = tl.travel;
  if (t < s0) return { d: tl.apogee };
  if (t < v0) return { d: lerp(tl.apogee, tl.mean, ease.state(seg(t, s0, s1 - s0))) };
  if (t < v1) {
    const M = t < tl.apAt ? lerp(tl.M0, tl.Map, ease.state(seg(t, v0, tl.apAt - v0))) : t < tl.apEnd ? tl.Map : lerp(tl.Map, tl.M1, ease.state(seg(t, tl.apEnd, v1 - tl.apEnd)));
    const k = kepler(tl.G, M); return { d: k.r, day: (M - tl.M0) / TAU * tl.lap };
  }
  // dönüş: Ay sığma sınırından en uzak noktaya geri kayar (kare 0)
  return { d: lerp(tl.G.need, tl.apogee, ease.state(seg(t, tl.ret[0], tl.ret[1] - tl.ret[0]))), day: (tl.M1 - tl.M0) / TAU * tl.lap };
}

export function gezegenSummary(ep) {
  const tl = buildGezegenTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.hero, cover: 0,
    keys: [0, 0.4, tl.liftAt + 0.3, tl.squeeze[1] + 0.3, ...tl.keys.map(k => k + 0.3), tl.back + 0.6, tl.shrink + 0.7, tl.over + 0.3,
      tl.push + 1.2, tl.ask + 0.9, tl.top + 1.5, tl.hero + 0.3, tl.hero + 1.5, tl.zoomIn + 1.2, tl.landAt + 0.3, tl.landAt + 2, tl.rw0 + 0.6],
    fast: tl.keys[3] - 0.3, lastLand: tl.landAt, firstLand: tl.keys[0] };
}
export function gezegenCues(ep) {
  const tl = buildGezegenTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence[0], tl: tl.hero },
    grows: [{ t0: tl.squeeze[0], t1: tl.squeeze[1], hero: false }],
    lands: [tl.liftAt, ...tl.keys, tl.shrink + 0.5, tl.over, tl.landAt],
    tallies: tl.ticks.map((_, k) => ({ t: 0.15 + k * 0.12, accent: k % 4 === 0 })) };
}

// ——— Çizim ———
export async function makeGezegenRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildGezegenTimeline(ep), G = tl.G, D = tl.duration, N = G.row[G.row.length - 1];
  const meta = await (await fetch('../assets/planets/planets.json')).json();
  const load = f => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = '../assets/planets/' + f; });
  const IMG = {};
  await Promise.all(Object.entries(meta).flatMap(([k, m]) => [load(m.file).then(i => { IMG[k] = i; }), m.fill ? load(m.fill).then(i => { IMG[k + '_fill'] = i; }) : null]));

  // kamera: ekrandaki ölçek s (px/km) ve çapaya düşen dünya noktası (wx, wy). Her hedef değişimi bir yay, eğri ya da kesme.
  // geniş plan: Dünya x = 50, Ay x = 900 (sağdaki Reels düğme sütununun solunda)
  const sWide = 850 / tl.apogee, wxWide = (A.x - 50) / sWide;
  // tepe planı: Dünya (440, 1240), apoje 210 px (yörüngenin altı güvenli alanda, solda etikete, sağda Sıfır'a yer)
  const sTop = 210 / tl.apogee, wxTop = (A.x - 440) / sTop, wyTop = (A.y - 1240) / sTop;
  // değme noktası yakın planı: Neptün ~260 px; Ay perijede de apojede de kadrajda
  const sNear = ep.flight.near / N.d;
  const K = [{ t: 0, ls: Math.log(sWide), x: wxWide, y: 0 }];
  const key = (t, s, x, y, mode, dur) => K.push({ t, ls: Math.log(s), x, y, mode, dur });
  key(0, sWide * 1.03, wxWide, 0, 'lin', tl.squeeze[1]);                 // kare 0'dan itibaren %3 doğrusal itme
  const nPos = lastPos(G, tl.mean);
  key(tl.flight, ep.flight.earthScale, G.RE + ep.flight.earthLead, 0, 'cut');   // sert kesme: Dünya'nın yüzeyi
  // her gezegene varış, sayaç ve 'tok' sesinden 0,45 sn önce başlar (yay ~0,45 sn'de oturur); baskın yön sağ
  const jup = G.row.reduce((a, q) => (q.d > a.d ? q : a)), jupLeft = jup.x - jup.r, sCap = 2.5 * meta[jup.key].r / jup.r;
  G.row.forEach((p, k) => {
    const last = k === G.row.length - 1, c = last ? nPos : { x: p.x, y: 0 };
    let s = ep.flight.frame / p.d;
    if (p.x < jup.x && (jupLeft - c.x) * s < 600) s = Math.min(s, sCap);
    if (p === jup) key(tl.keys[k] - 0.6, s, c.x, c.y, 'big'); else key(tl.keys[k] - 0.45, s, c.x, c.y, 'cam');
  });
  key(tl.back, sWide, wxWide, 0, 'big');
  key(tl.back + 0.6, sWide * 1.03, wxWide, 0, 'lin', tl.push - tl.back - 0.6);   // çıkarma okunurken yavaş itme
  const pushX = (tl.mean - G.RM + G.end) / 2, pushY = nPos.y * 0.8;
  key(tl.push, sNear, pushX, pushY, 'ease', 0.9);
  key(tl.push + 0.9, sNear * 1.07, pushX, pushY, 'lin', tl.top - tl.push - 0.9);   // beklemede yavaş itme (donmuş kare yok)
  key(tl.top, sTop, wxTop, wyTop, 'ease', tl.silence[0] - tl.top);
  key(tl.hero, sTop * 1.04, wxTop, wyTop, 'lin', tl.zoomIn - tl.hero);
  // değme noktası: taşmadaki yakın plandan 1,35 kat daha yakın (Ay ~25 px, en büyük boşluk ~70 px)
  key(tl.zoomIn, sNear * 1.35, ep.flight.nearX, ep.flight.nearY, 'ease', 0.9);
  key(tl.landAt, sNear * 1.35 * 1.1, ep.flight.nearX, ep.flight.nearY, 'lin', tl.ret[0] - tl.landAt);
  key(tl.ret[0], sWide, wxWide, 0, 'ease', tl.ret[1] - tl.ret[0]);
  const wgt = (k, t) => k.mode === 'cam' ? spring(t - k.t, 170, 26) : k.mode === 'big' ? spring(t - k.t, 120, 24)
    : k.mode === 'cut' ? (t >= k.t ? 1 : 0) : k.mode === 'lin' ? seg(t, k.t, k.dur) : ease.state(seg(t, k.t, k.dur));
  function camera(t) {
    let ls = K[0].ls, x = K[0].x, y = K[0].y;
    for (let i = 1; i < K.length; i++) { const w = wgt(K[i], t); ls += (K[i].ls - K[i - 1].ls) * w; x += (K[i].x - K[i - 1].x) * w; y += (K[i].y - K[i - 1].y) * w; }
    return { s: Math.exp(ls), x, y };
  }
  const P = cam => (x, y) => ({ x: A.x + cam.s * (x - cam.x), y: A.y + cam.s * (y - cam.y) });

  const qSize = (() => { let s = 80; setFont(ctx, F.head(s)); while (s > 60 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const Y = { q: 374 + qSize * 0.86, label: 640, num: 740, sub: 796, says: 878, dim: 990, clip: 936 };

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, Y.q + i * qSize));
  }

  // tek gezegen: kâğıt alt dolgu (arkadakini örter) + mürekkep gravür
  function planet(name, cx, cy, r) {
    const m = meta[name], img = IMG[name], k = r / m.r;
    if (r < 0.6) return;
    ctx.save(); ctx.translate(cx, cy);
    if (m.fill) ctx.drawImage(IMG[name + '_fill'], -m.cx * k, -m.cy * k, m.w * k, m.h * k);
    else { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); }
    if (r < 3) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); }
    else if (m.fill) ctx.drawImage(img, -m.cx * k, -m.cy * k, m.w * k, m.h * k);
    else {
      // yakın planda görsel 8 kata kadar büyür: kendi kalın kenar halkası bulanık bir bant olur, kesilir
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 0.985, 0, TAU); ctx.clip();
      ctx.drawImage(img, -m.cx * k, -m.cy * k, m.w * k, m.h * k); ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.99, 0, TAU); ctx.lineWidth = Math.max(1.2, Math.min(3.5, r * 0.008)); ctx.strokeStyle = C.ink; ctx.stroke();
    }
    ctx.restore();
  }

  function scene(cam, ms) {
    const p = P(cam), s = cam.s, n = lastPos(G, ms.d);
    const e = p(0, 0); planet('dunya', e.x, e.y, G.RE * s);
    G.row.forEach((q, k) => {
      if (q.key === 'saturn') return;
      const c = k === G.row.length - 1 ? p(n.x, n.y) : p(q.x, 0);
      planet(q.key, c.x, c.y, q.r * s);
    });
    const m = p(ms.d, 0); planet('ay', m.x, m.y, G.RM * s);
    const sat = G.row.find(q => q.key === 'saturn'), sc = p(sat.x, 0);
    planet('saturn', sc.x, sc.y, sat.r * s);
    return { e, m, n: p(n.x, n.y) };
  }

  // mimari ölçü çizgisi (yatay): uçlarda 45° çentik; u çizilme ilerlemesi, etiket çizgi bitince maskeyle gelir
  function dimLine(x0, x1, y, color, label, sub, u = 1, lp = 1) {
    if (u <= 0) return;
    const xe = lerp(x0, x1, u);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xe, y); ctx.stroke();
    for (const x of u >= 1 ? [x0, x1] : [x0]) { ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y - 10); ctx.stroke(); }
    if (label && u >= 1 && lp > 0) {
      const cx = Math.min(Math.max((x0 + x1) / 2, SAFE.x0 + 200), SAFE.x1 - 200);
      setFont(ctx, F.mono(40));
      if (sub) {
        const w1 = ctx.measureText(label + ' · ').width, w2 = ctx.measureText(sub).width, x0t = cx - (w1 + w2) / 2;
        revealText(ctx, label + ' · ', x0t, y - 18, 40, lp, color); revealText(ctx, sub, x0t + w1, y - 18, 40, lp, C.graphite);
      } else revealText(ctx, label, cx, y - 18, 40, lp, color, 'center');
    }
    ctx.restore();
  }
  // ad etiketi: kılavuz çizgisi uzar, ad maskeli kayarak gelir (karartma yok)
  function tag(p, text, dx, dy, u) {
    if (u <= 0) return;
    const k = Math.min(1, u * 1.6), x1 = p.x + dx * lerp(0.25, 1, k), y1 = p.y + dy * lerp(0.25, 1, k);
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x + dx * 0.25, p.y + dy * 0.25); ctx.lineTo(x1, y1); ctx.stroke();
    setFont(ctx, F.mono(40));
    const al = dx < 0 ? 'right' : dx > 0 ? 'left' : 'center', tx = p.x + dx + (dx < 0 ? -6 : dx > 0 ? 6 : 0), ty = p.y + dy + (dy < 0 ? -8 : 32);
    revealText(ctx, text, tx, ty, 40, ease.enter(seg(u, 0.5, 0.5)), C.ink, al);
    ctx.restore();
  }
  // pencere: a'da çizilerek gelir (a = 0 ise kare 0'da hazır), b'de geri çekilir
  const win = (t, a, b, din = 0.5, dout = 0.3) => t < a ? 0 : (a === 0 ? 1 : ease.enter(seg(t, a, din))) * (1 - ease.exit(seg(t, b - dout, dout)));

  // ——— tepe planı: yörünge (Dünya odakta; Ay sağda, apoje yukarıda), sığma sınırı, kırmızı yay ———
  const orbitR = nu => G.a * (1 - G.e * G.e) / (1 + G.e * Math.cos(nu));
  const nuLim = Math.acos((G.a * (1 - G.e * G.e) / G.need - 1) / G.e);   // r > need ⇔ |nu| > nuLim
  function orbit(t, cam) {
    const p = P(cam), rot = nu => nu - tl.nu0;
    const off = 1 - ease.exit(seg(t, tl.zoomIn, 0.45));
    const u = Math.min(ease.state(seg(t, tl.orbitDraw[0], tl.orbitDraw[1] - tl.orbitDraw[0])), off);
    if (u <= 0) return;
    const at = nu => { const r = orbitR(nu), a = rot(nu); return p(r * Math.cos(a), r * Math.sin(a)); };
    const path = (from, to, n = 180) => { ctx.beginPath(); for (let k = 0; k <= n; k++) { const q = at(lerp(from, to, k / n)); k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } };
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; path(tl.nu0, tl.nu0 + TAU * u); ctx.stroke();
    const c0 = p(0, 0), R = G.need * cam.s;
    const lu = Math.min(ease.state(seg(t, tl.limitDraw[0], tl.limitDraw[1] - tl.limitDraw[0])), off);
    if (lu > 0) {
      ctx.setLineDash([10, 9]); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(c0.x, c0.y, R, 0, TAU * lu); ctx.stroke(); ctx.setLineDash([]);
      const la = Math.min(ease.enter(seg(t, tl.limitDraw[1], 0.4)), off);
      setFont(ctx, F.name(40));
      ep.label.limit.split(' ').forEach((w, i) => revealText(ctx, w, c0.x - R - 12, c0.y - 8 + i * 46, 40, la, C.graphite, 'right'));
    }
    // kırmızı yay: doruğun kendisi (apoje çevresi: Ay buradayken gezegenler sığar) + "sığar / sığmaz"
    const ru = Math.min(ease.enter(seg(t, tl.hero - 0.04, 0.34)), off);
    if (ru > 0) {
      ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round';
      const half = (Math.PI - nuLim) * ru; path(Math.PI - half, Math.PI + half, 90); ctx.stroke();
      const top = at(Math.PI), bot = at(0), la = Math.min(ease.enter(seg(t, tl.hero + 0.2, 0.4)), off);
      setFont(ctx, F.name(48)); revealText(ctx, ep.label.yes, top.x, top.y - 30, 48, la, C.red, 'center');
      setFont(ctx, F.name(44)); revealText(ctx, ep.label.no, bot.x, bot.y - 34, 44, Math.min(ease.enter(seg(t, tl.hero + 0.5, 0.4)), off), C.graphite, 'center');
    }
    ctx.restore();
  }

  // ——— üst blok: etiket + büyük sayı + alt satır (aşamaya göre); aynı etiket sürerken yeniden kaymaz ———
  function counter(t, ms) {
    let label, num, sub = null, red = false, t0 = 0, subT0 = null, subRed = false;
    const T = tl, n = G.row.length, gap = tl.mean - G.RE - G.RM;
    if (t < T.flight || t >= T.ret[1] - 0.6) {
      label = ep.label.dist; num = km(t >= T.ret[1] - 0.6 || t < T.squeeze[0] ? tl.apogee : ms.d);
      t0 = t >= T.ret[1] - 0.6 ? T.ret[1] - 0.6 : 0;
      if (t > T.squeeze[1] && t < T.flight) { sub = ep.label.mean; subT0 = T.squeeze[1]; }
    } else if (t < T.over) {
      let k = -1; for (let i = 0; i < n; i++) if (t >= T.keys[i] - 0.1) k = i;
      const prev = k > 0 ? G.row.slice(0, k).reduce((a, p) => a + p.d, 0) : 0, cur = k >= 0 ? prev + G.row[k].d : 0;
      label = ep.label.total; num = km(k < 0 ? 0 : lerp(prev, cur, ease.state(seg(t, T.keys[k] - 0.1, 0.4)))); t0 = T.flight;
      // çıkarma açıkça: merkezden merkeze − Dünya'nın yarıçapı − Ay'ın yarıçapı = yüzeyden yüzeye boşluk
      if (t >= T.shrink) { sub = ep.label.gapCalc + ' ' + nf0.format(tl.mean) + ' − ' + nf0.format(G.RE) + ' − ' + nf0.format(G.RM) + ' = ' + km(gap); subT0 = T.shrink + 0.3; }
      else if (k >= 0) { sub = '+ ' + km(G.row[k].d) + ' · ' + G.row[k].name + (G.row[k].note ? ' ' + G.row[k].note : ''); subT0 = T.keys[k] - 0.1; }
    } else if (t < T.hero) {
      label = ep.label.over; num = km(G.total - gap); sub = km(G.total) + ' − ' + km(gap); t0 = T.over;
    } else if (t < T.zoomIn + 0.4) {
      label = ep.label.fits; num = ep.answer; sub = ep.label.lap; red = true; t0 = T.hero;
    } else {
      const day = (ms.day ?? 0) + tl.dayOff, fits = ms.d >= G.need - 1, first = Math.ceil(tl.fitDay + tl.dayOff) + 1;
      const N = Math.min(first + 8, Math.floor(day) + 1);                       // sayaç: 1. gün … ; sığma: first … first + 8
      label = ep.label.dayLabel; num = N + '. gün'; t0 = T.zoomIn + 0.4;
      if (fits) { sub = ep.label.fitsNow + ' · ' + Math.max(1, Math.min(9, N - first + 1)) + '. gün'; subT0 = T.landAt; subRed = true; }
      else { sub = ep.label.noFit; subT0 = T.zoomIn + 0.55; }
    }
    const pin = t0 === 0 ? 1 : ease.enter(seg(t, t0, 0.4));
    setFont(ctx, F.mono(38)); revealText(ctx, label, SAFE.x0, Y.label, 38, pin, red ? C.red : C.graphite);
    const sc = red && t < T.zoomIn ? lerp(0.9, 1, spring(t - T.hero, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, Y.num); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -Y.num);
    setFont(ctx, F.head(104)); revealText(ctx, num, SAFE.x0, Y.num, 104, pin, red ? C.red : C.ink);
    ctx.restore();
    if (sub) { setFont(ctx, F.name(44)); revealText(ctx, sub, SAFE.x0, Y.sub, 44, subT0 == null ? ease.enter(seg(t, t0 + 0.15, 0.4)) : ease.enter(seg(t, subT0, 0.4)), subRed ? C.red : C.graphite); }
  }

  // ekrandaki cümleler: t0/t1 ya da bir zaman çizelgesi olayına göre (at + dt, dur)
  const SAYS = ep.says.map(s => s.at ? { ...s, t0: tl[s.at] + (s.dt || 0), t1: tl[s.at] + (s.dt || 0) + s.dur } : s);
  function says(t) {
    for (const s of SAYS) {
      // kare 0'daki cümle kare 0'da hazırdır ve döngü dikişinden önce yeniden yazılır
      const again = s.t0 === 0 && t >= tl.ret[1] - 0.5;
      if (!again && (t < s.t0 || t >= s.t1 + 0.18)) continue;
      const pin = again ? ease.enter(seg(t, tl.ret[1] - 0.5, 0.4)) : s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = !again && t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(46));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, Y.says + i * 56, 46, pin * pout, C.ink));
    }
  }

  // ——— yan görünüş katmanları ———
  const wideU = t => t < tl.flight ? 1 : t >= tl.ret[1] - 0.6 ? ease.state(seg(t, tl.ret[1] - 0.6, 0.6)) : 0;
  function sideOverlays(t, cam, ms, pos) {
    const p = P(cam);
    // 1) Dünya–Ay merkez ölçüsü + cetvel çentikleri (kare 0'dan sonra kalemle sırayla işlenir, dönüşte yoktur)
    const dimU = wideU(t);
    if (dimU > 0) {
      const far = t < tl.squeeze[0] + 0.2 || t >= tl.ret[0];
      dimLine(pos.e.x, pos.m.x, Y.dim, C.ink, km(far ? tl.apogee : ms.d), far ? ep.label.farShort : t > tl.squeeze[1] ? ep.label.meanShort : null, dimU);
      tl.ticks.forEach((v, k) => {
        const on = t < tl.ret[0] ? seg(t, 0.15 + k * 0.12, 0.08) * (dimU >= 1 ? 1 : 0) : 0;
        if (on <= 0) return;
        const q = p(v, 0); ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(q.x, Y.dim); ctx.lineTo(q.x, Y.dim + (k % 2 ? 9 : 16) * on); ctx.stroke();
      });
    }
    // 2) boşluk: önce merkezden merkeze 384.400 km, sonra uçlar yüzeylere çekilir (− Dünya'nın, − Ay'ın yarıçapı)
    const gapU = win(t, tl.gap, tl.push + 0.1, 0.4);
    if (gapU > 0) {
      const sh = ease.state(seg(t, tl.shrink, 0.5));
      const xa = p(lerp(0, G.RE, sh), 0).x, xb = p(lerp(tl.mean, tl.mean - G.RM, sh), 0).x;
      dimLine(xa, xb, Y.dim, C.ink, sh < 1 ? km(tl.mean) : ep.label.gap.toLocaleUpperCase('tr-TR') + ' ' + km(tl.mean - G.RE - G.RM), null, gapU,
        sh < 1 ? 1 : ease.enter(seg(t, tl.shrink + 0.5, 0.35)));
      // çıkarmanın kendisi sayacın alt satırında yazılı (gezegenlerin üstüne etiket binmesin)
    }
    // 3) taşma: yerindeki hayalet Neptün + eksen boyunca taralı şerit (Ay'ın yüzeyinden Neptün'ün olması gereken ucuna)
    const ov = win(t, tl.over, tl.top + 0.3);
    if (ov > 0) {
      const s1 = p(tl.mean - G.RM, 0), g = p(N.x, 0), end = p(G.end, 0);
      ctx.save(); ctx.setLineDash([7, 7]); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(g.x, g.y, N.r * cam.s, -Math.PI / 2, -Math.PI / 2 + TAU * ov); ctx.stroke(); ctx.setLineDash([]);
      const h = Math.max(14, Math.min(34, 0.22 * N.r * cam.s)), x0 = s1.x, x1 = lerp(s1.x, end.x, ov);
      if (x1 > x0 + 1) {
        ctx.beginPath(); ctx.rect(x0, g.y - h / 2, x1 - x0, h); ctx.save(); ctx.clip();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
        for (let x = x0 - h; x < x1 + h; x += 7) { ctx.moveTo(x, g.y + h / 2); ctx.lineTo(x + h, g.y - h / 2); } ctx.stroke(); ctx.restore();
        ctx.lineWidth = 2.5; ctx.strokeRect(x0, g.y - h / 2, x1 - x0, h);
      }
      // yakında şeridin kendi ölçüsü
      const lu = win(t, tl.push + 0.6, tl.top + 0.3);
      if (lu > 0) dimLine(x0, end.x, g.y + N.r * cam.s + 40, C.ink, km(G.total - (tl.mean - G.RE - G.RM)), null, lu,
        Math.min(ease.enter(seg(t, tl.push + 0.9, 0.4)), 1 - ease.exit(seg(t, tl.top, 0.3))));
      // Ay şeridin içinde kalır: duvarın kendisi, şeridin üstüne yeniden çizilir
      planet('ay', pos.m.x, pos.m.y, G.RM * cam.s);
      if (lu > 0) tag(pos.m, ep.label.moon, 80, -50, lu);
      ctx.restore();
    }
    // 4) değme noktası: Ay sığma sınırının ötesindeyken Neptün ile Ay arasında kırmızı boşluk ölçüsü
    const nearU = win(t, tl.zoomIn + 0.6, tl.ret[0] + 0.3);
    if (nearU > 0) {
      tag(pos.m, ep.label.moon, -40, 44, nearU);            // sola-aşağı: Sıfır'a değmez
      if (ms.d > G.need) {
        // ölçü tam eksende, Neptün ile Ay'ın arasında; sayı Ay'ın sağındaki boş kâğıtta (alt açıklama bloğunun üstünde)
        const x0 = p(G.end, 0).x, x1 = p(ms.d - G.RM, 0).x, y = p(0, 0).y, xt = x1 + 2 * G.RM * cam.s + 26;
        const lp = ease.enter(seg(t, tl.landAt + 0.25, 0.35)) * nearU;
        dimLine(x0, x1, y, C.red, null, null, Math.min(1, (x1 - x0) / 6) * nearU);
        setFont(ctx, F.head(56)); revealText(ctx, '+ ' + km(ms.d - G.need), xt, y - 78, 56, lp, C.red, 'left');
        // apojede bekleme: 'Ay en uzaktayken'
        const ap = win(t, tl.apAt - 0.15, tl.apEnd + 0.35, 0.3, 0.25);
        if (ap > 0) { setFont(ctx, F.name(42)); revealText(ctx, ep.label.farShort, xt, y - 148, 42, ap, C.graphite, 'left'); }
      }
    }
  }

  // Sıfır: sağ altta (Ay'ın altında, Reels düğmelerinin solunda), diziye bakar. Sıkışmada şaşırır, uçuşta gezegenleri
  // sayar, taşınca terler, soruda düşünür, sessizlikte donar, doruğa zıplar, Neptün yerine oturunca sevinir,
  // döngüde kare 0 duruşuna döner. Kırmızı "!" yalnızca doruğda.
  const counted = t => { let k = 1; tl.keys.forEach((kk, i) => { if (t >= kk - 0.1) k = i + 1; }); return k; };
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.liftAt, expr: 'notr' },
    { type: 'idle', t0: tl.liftAt, t1: tl.flight, expr: 'saskin' },
    { type: 'count', t0: tl.flight, t1: tl.back, valueAt: counted, bubble: 'top' },
    { type: 'lookUp', t0: tl.back, t1: tl.over, expr: 'saskin' },
    { type: 'sweat', t0: tl.over, t1: tl.ask },
    { type: 'think', t0: tl.ask, t1: tl.silence[0] },
    { type: 'idle', t0: tl.silence[0], t1: tl.hero - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.hero - 0.05, t1: tl.hero + 0.85 },
    { type: 'lookUp', t0: tl.hero + 0.85, t1: tl.landAt, expr: 'saskin' },
    { type: 'happy', t0: tl.landAt, t1: tl.ret[0] + 0.6 },
    { type: 'lookUp', t0: tl.ret[0] + 0.6, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 760, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    ctx.drawImage(grain(), 0, 0);
    const cam = camera(t), ms = moonState(tl, t);
    // sahne alanı: üst bloğun altından ekranın altına
    ctx.save(); ctx.beginPath(); ctx.rect(0, Y.clip, W, 1920 - Y.clip); ctx.clip();
    const pos = scene(cam, ms);
    // yakın planda büyük diskler üst kenarda düz bir çizgiyle kesilmesin: 110 px'te kâğıda karışır
    const fade = ctx.createLinearGradient(0, Y.clip, 0, Y.clip + 110);
    fade.addColorStop(0, C.paper); fade.addColorStop(1, 'rgba(236,229,213,0)');
    ctx.fillStyle = fade; ctx.fillRect(0, Y.clip, W, 110);
    orbit(t, cam);
    sideOverlays(t, cam, ms, pos);
    // geniş planlarda adlar (Dünya ve Ay çok küçük)
    const tagU = Math.max(wideU(t), win(t, tl.back + 0.3, tl.push + 0.1));
    tag(pos.e, ep.label.earth, 30, 140, tagU);
    tag(pos.m, ep.label.moon, 0, 70, tagU);
    // tepe planında Ay bir nokta: çevresine çizilerek gelen ince halka
    const ringU = win(t, tl.top + 0.6, tl.zoomIn + 0.3);
    if (ringU > 0) {
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(pos.m.x, pos.m.y, 13, -Math.PI / 2, -Math.PI / 2 + TAU * ringU); ctx.stroke(); ctx.restore();
      tag(pos.m, ep.label.moon, -24, 40, ringU);            // Sıfır'ın düşünce balonundan ve yörünge çizgisinden uzakta
      tag(pos.e, ep.label.earth, -30, 0, ringU);
    }
    ctx.restore();
    header();
    counter(t, ms);
    says(t);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

// Gravür levhası ortak araçları: üretilmiş gezegen gravürleri (assets/planets) ile çalışan sahneler için
// yerleşim, gezegen çizimi, mimari ölçü çizgisi, ad etiketi, üst sayaç bloğu ve ekrandaki cümleler.
// Hepsi t'nin saf fonksiyonudur; görseller sahne kurulurken bir kez yüklenir.
import { W, ease, seg, lerp, spring, mulberry32 } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';

export const SAFE = { x0: 90, x1: 920 };
export const TAU = Math.PI * 2;
export const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
export const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const nf2 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const km = v => nf0.format(Math.round(v)) + ' km';

// pencere: a'da çizilerek gelir (a = 0 ise kare 0'da hazır), b'de geri çekilir
export const win = (t, a, b, din = 0.5, dout = 0.3) => t < a ? 0 : (a === 0 ? 1 : ease.enter(seg(t, a, din))) * (1 - ease.exit(seg(t, b - dout, dout)));

export async function loadPlanets(extra = {}) {
  const meta = { ...(await (await fetch('../assets/planets/planets.json')).json()), ...extra };
  const load = f => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = '../assets/planets/' + f; });
  const IMG = {};
  await Promise.all(Object.entries(meta).flatMap(([k, m]) => [load(m.file).then(i => { IMG[k] = i; }), m.fill ? load(m.fill).then(i => { IMG[k + '_fill'] = i; }) : null]));
  return { meta, IMG };
}

export function makePlate(ctx, ep, { meta, IMG }) {
  const qSize = (() => { let s = 80; setFont(ctx, F.head(s)); while (s > 60 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const Y = { q: 374 + qSize * 0.86, label: 640, num: 740, sub: 796, says: 878, clip: 936 };

  function paper() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    ctx.drawImage(grain(), 0, 0);
  }
  // lines: başka bir soru (film ortasında soru değişirse), p: maskeli giriş
  function header(lines = ep.question, p = 1) {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize));
    lines.forEach((q, i) => revealText(ctx, q, SAFE.x0, Y.q + i * qSize, qSize, p, C.ink));
  }
  // sahne alanı: üst bloğun altından ekranın altına; üst kenarda 110 px'te kâğıda karışma
  function stage(draw) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, Y.clip, W, 1920 - Y.clip); ctx.clip();
    draw();
    ctx.restore();
  }
  function fadeTop() {
    const g = ctx.createLinearGradient(0, Y.clip, 0, Y.clip + 110);
    g.addColorStop(0, C.paper); g.addColorStop(1, 'rgba(236,229,213,0)');
    ctx.fillStyle = g; ctx.fillRect(0, Y.clip, W, 110);
  }

  // tek gezegen: kâğıt alt dolgu (arkadakini örter) + mürekkep gravür; rot dönme açısı
  function planet(name, cx, cy, r, rot = 0) {
    const m = meta[name], img = IMG[name], k = r / m.r;
    if (r < 0.6) return;
    ctx.save(); ctx.translate(cx, cy); if (rot) ctx.rotate(rot);
    if (m.fill) ctx.drawImage(IMG[name + '_fill'], -m.cx * k, -m.cy * k, m.w * k, m.h * k);
    else { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); }
    if (r < 3) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); }
    else if (m.fill) ctx.drawImage(img, -m.cx * k, -m.cy * k, m.w * k, m.h * k);
    else {
      // büyütülünce görselin kendi kalın kenar halkası bulanıklaşır: kesilir, yerine keskin vektör çizgi
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * 0.985, 0, TAU); ctx.clip();
      ctx.drawImage(img, -m.cx * k, -m.cy * k, m.w * k, m.h * k); ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.99, 0, TAU); ctx.lineWidth = Math.max(1.2, Math.min(3.5, r * 0.008)); ctx.strokeStyle = C.ink; ctx.stroke();
    }
    ctx.restore();
  }

  // mimari ölçü çizgisi (yatay): uçlarda 45° çentik; u çizilme ilerlemesi, lp etiketin maskeyle gelişi
  function dimLine(x0, x1, y, color, label, sub, u = 1, lp = 1, size = 40) {
    if (u <= 0) return;
    const xe = lerp(x0, x1, u);
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xe, y); ctx.stroke();
    for (const x of u >= 1 ? [x0, x1] : [x0]) { ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y - 10); ctx.stroke(); }
    if (label && u >= 1 && lp > 0) {
      const cx = Math.min(Math.max((x0 + x1) / 2, SAFE.x0 + 160), SAFE.x1 - 160);
      setFont(ctx, F.mono(size));
      if (sub) {
        const w1 = ctx.measureText(label + ' · ').width, w2 = ctx.measureText(sub).width, x0t = cx - (w1 + w2) / 2;
        revealText(ctx, label + ' · ', x0t, y - 18, size, lp, color); revealText(ctx, sub, x0t + w1, y - 18, size, lp, C.graphite);
      } else revealText(ctx, label, cx, y - 18, size, lp, color, 'center');
    }
    ctx.restore();
  }
  // ad etiketi: kılavuz çizgisi uzar, ad maskeli kayarak gelir (karartma yok)
  function tag(p, text, dx, dy, u, color = C.ink) {
    if (u <= 0) return;
    const k = Math.min(1, u * 1.6), x1 = p.x + dx * lerp(0.25, 1, k), y1 = p.y + dy * lerp(0.25, 1, k);
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x + dx * 0.25, p.y + dy * 0.25); ctx.lineTo(x1, y1); ctx.stroke();
    setFont(ctx, F.mono(40));
    const al = dx < 0 ? 'right' : dx > 0 ? 'left' : 'center', tx = p.x + dx + (dx < 0 ? -6 : dx > 0 ? 6 : 0), ty = p.y + dy + (dy < 0 ? -8 : 32);
    revealText(ctx, text, tx, ty, 40, ease.enter(seg(u, 0.5, 0.5)), color, al);
    ctx.restore();
  }

  // üst blok: etiket + büyük sayı + alt satır. pin: giriş ilerlemesi; red: doruk rengi; pop: doruk anı (yay 120/24)
  function counter({ label, num, sub, red = false, pin = 1, subPin = pin, subRed = false, subInk = false, pop = null }) {
    // aşama değişiminde sayı bloğu hiçbir karede boş kalmaz: giriş en az %35'ten başlar
    pin = Math.max(pin, 0.35); subPin = Math.max(subPin, 0.35);
    setFont(ctx, F.mono(38)); revealText(ctx, label, SAFE.x0, Y.label, 38, pin, red ? C.red : C.graphite);
    const sc = pop != null ? lerp(0.9, 1, spring(pop, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, Y.num); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -Y.num);
    setFont(ctx, F.head(104)); revealText(ctx, num, SAFE.x0, Y.num, 104, pin, red ? C.red : C.ink);
    ctx.restore();
    if (sub) { setFont(ctx, F.name(44)); revealText(ctx, sub, SAFE.x0, Y.sub, 44, subPin, subRed ? C.red : subInk ? C.ink : C.graphite); }
  }

  // ekrandaki cümleler: t0/t1 ya da bir zaman çizelgesi olayına göre (at + dt, dur). Kare 0'daki cümle kare 0'da
  // hazırdır ve döngü dikişinden önce (loopAt) yeniden yazılır.
  function says(list, t, tl, loopAt) {
    for (const s0 of list) {
      const s = s0.at ? { ...s0, t0: tl[s0.at] + (s0.dt || 0), t1: tl[s0.at] + (s0.dt || 0) + s0.dur } : s0;
      const again = s.t0 === 0 && loopAt != null && t >= loopAt;
      if (!again && (t < s.t0 || t >= s.t1 + 0.18)) continue;
      const pin = again ? ease.enter(seg(t, loopAt, 0.4)) : s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3));
      const pout = !again && t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(46));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, Y.says + i * 56, 46, pin * pout, s.red ? C.red : C.ink));
    }
  }

  const has = k => !!meta[k];
  // Güneş: gravür (gunes) varsa o; yoksa tohumlu noktalama ile geçici disk (kenar kararması + iki leke)
  const sunCache = {};
  function sun(x, y, r) {
    if (has('gunes')) return planet('gunes', x, y, r);
    const key = Math.round(r);
    if (!sunCache[key]) {
      const c = document.createElement('canvas'); c.width = c.height = 2 * key + 4; const g = c.getContext('2d'), rnd = mulberry32(240), o = key + 2;
      g.fillStyle = C.paper; g.beginPath(); g.arc(o, o, key, 0, TAU); g.fill();
      for (let i = 0; i < 9000; i++) { const a = rnd() * TAU, q = Math.sqrt(rnd()), d = q * key; if (rnd() < 0.18 + 0.75 * q ** 6) { g.fillStyle = C.ink; g.fillRect(o + Math.cos(a) * d, o + Math.sin(a) * d, 1.4, 1.4); } }
      for (const [sx, sy, sr] of [[-0.3, -0.25, 0.08], [0.25, 0.3, 0.06]]) { g.fillStyle = C.ink; g.beginPath(); g.arc(o + sx * key, o + sy * key, sr * key, 0, TAU); g.fill(); }
      g.strokeStyle = C.ink; g.lineWidth = 2.5; g.beginPath(); g.arc(o, o, key * 0.99, 0, TAU); g.stroke();
      sunCache[key] = c;
    }
    ctx.drawImage(sunCache[key], x - key - 2, y - key - 2);
  }
  return { Y, qSize, has, sun, paper, header, stage, fadeTop, planet, dimLine, tag, counter, says, setFont, revealText, F, C };
}

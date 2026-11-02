// "Çizgi" motoru: kodla çizilmiş 2B Hangisi filmleri (3 Kasım; nedenoluyor/Kafa Dairesi'nin çizim dilinden).
// Kalın mürekkep çizgisi, düz renk, gölgesiz ışık; karakterler tek fonksiyonla (cizgi/cast.js) eklem açılarıyla çizilir.
// Ses, zaman çizelgesi ve ses ipuçları 3B hikâye filmleriyle ortaktır (engine/films/f<id>.js → cues, hero).
// Film dosyası (engine/cizgi/f<id>.js) sahneleri, karakter pozlarını ve kamera anahtarlarını tarif eder.
// Her kare t'nin saf fonksiyonu; rastgelelik tohumlu.
import { W, H, ease, seg, lerp, clamp01, mulberry32 } from './core.js';
import { makeOverlay } from './sinema_overlay.js';
import { hikayeTimes, autoChunks } from './hikaye_core.js';
import { drawCharacter, basePose, walkPose, mixExpr, blinkAt, INK } from './cizgi/cast.js';
import { CARDS } from './cizgi/cards.js';

export const PAL = { ink: INK, paper: '#F4EFE3', cream: '#ECE5D5', red: '#C2412F', gold: '#E2B13C', grass: '#5E9A4E', grassDark: '#4C8240', night: '#1E2A3A', sky: '#BFD6DC', wood: '#A87A4E', steel: '#8C9298' };

export async function makeCizgiRenderer(ep, canvas) {
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const { tl, T } = hikayeTimes(ep, voice), D = tl.duration;
  const mod = await import(`./cizgi/f${ep.id}.js`);
  const ctx = canvas.getContext('2d');

  // ——— çizim yardımcıları (mürekkep çizgisi, düz dolgu) ———
  const LW = 6;
  const path = (pts, close = true) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (close) ctx.closePath(); };
  const fs = (fill, lw = LW) => { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); } };
  const poly = (pts, fill, lw = LW) => { path(pts); fs(fill, lw); };
  const rect = (x, y, w, h, fill, lw = LW, r = 0) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); fs(fill, lw); };
  const circ = (x, y, r, fill, lw = LW) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); fs(fill, lw); };
  const ell = (x, y, rx, ry, fill, lw = LW, a = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); fs(fill, lw); };
  const line = (x0, y0, x1, y1, lw = LW, col = INK) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); };
  const text = (s, x, y, size, col = INK, font = 'Archivo', weight = 800, align = 'center') => { ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); ctx.textAlign = 'left'; };
  const bg = c => { ctx.fillStyle = c; ctx.fillRect(-4000, -4000, 9080, 9920); };
  // karakter: kart adı ya da kart; o: { x, y, s, view, facing, lean, head, armL, armR, legL, legR, expr, talk, props, walk }
  const ch = (card, o = {}, t = 0) => {
    const c = typeof card === 'string' ? CARDS[card] : card;
    let p = o.walk != null ? walkPose(c, o.walk, basePose(c, 'side')) : basePose(c, o.view || 'front');
    for (const k of Object.keys(o)) if (k !== 'walk' && o[k] !== undefined) p[k] = typeof o[k] === 'object' && o[k] && !Array.isArray(o[k]) ? { ...p[k], ...o[k] } : o[k];
    if (o.walk != null) p.view = 'side';
    if (p.blink == null) p.blink = blinkAt(c, t);
    return drawCharacter(ctx, c, p, t);
  };
  // kalabalık: tohumlu baş ve gövde sıraları; up: kollar yukarı (0..1)
  const crowd = (x0, y0, w, rows, seed, up = 0, scale = 1, t = 0) => {
    const r = mulberry32(seed), cols = ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E', '#F4EFE3', '#7A4E8A', '#D8722E'], skins = ['#F2C9A5', '#D9A27A', '#B8805A', '#8A5A3A'];
    for (let j = 0; j < rows; j++) for (let i = 0; i * 46 * scale < w; i++) {
      const x = x0 + i * 46 * scale + (j % 2) * 23 * scale + (r() - 0.5) * 8, y = y0 + j * 54 * scale, k = scale * (0.9 + r() * 0.2), c = cols[Math.floor(r() * cols.length)], sk = skins[Math.floor(r() * skins.length)], ph = r() * 6.28;
      const lift = up * (0.7 + 0.3 * Math.sin(t * 9 + ph));
      if (lift > 0.05) { line(x - 14 * k, y + 8 * k, x - 22 * k, y - 30 * k * lift, 7 * k); line(x + 14 * k, y + 8 * k, x + 22 * k, y - 30 * k * lift, 7 * k); }
      rect(x - 19 * k, y + 2 * k, 38 * k, 40 * k, c, 4 * k, 12 * k); circ(x, y - 8 * k - lift * 6 * k, 15 * k, sk, 4 * k);
    }
  };

  // kâğıt uçak: "gönder" simgesi (Senin sayın / Bir insan bir sayı kapanışı); (x, y) burun, k ölçek, rot yön
  const plane = (x, y, k = 1, rot = -0.35, fill = '#FFFFFF') => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    poly([[0, 0], [-120, -46], [-86, 0], [-120, 46]], fill, LW / k * 1.1);
    poly([[0, 0], [-86, 0], [-104, 30]], '#DCD6C8', LW / k * 0.9);
    ctx.restore();
  };

  // ——— kamera: anahtarlar [t, zoom, cx, cy]; (cx, cy) ekranın ortasına gelir; zoom log uzayında, durum eğrisiyle ———
  function camAt(K, t) {
    if (t <= K[0][0]) return K[0].slice(1);
    for (let i = 0; i + 1 < K.length; i++) {
      const a = K[i], b = K[i + 1]; if (t > b[0]) continue;
      const u = ease.state(clamp01((t - a[0]) / Math.max(1e-6, b[0] - a[0])));
      return [Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), u)), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
    }
    return K.at(-1).slice(1);
  }

  const A = { ctx, T, D, W, H, PAL, INK, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, bg, path, fs, ch, crowd, plane, CARDS, mixExpr, LW };
  const film = await mod.film(A);
  const chunks = film.chunks || autoChunks(ep, tl);
  { const H0 = 'Hangisi daha şaşırtıcı?', c0 = chunks.l01?.[0];   // kanca başlıkta duruyor: altyazıda tekrarlanmaz
    if (c0 && c0[0].startsWith(H0)) { const rest = c0[0].slice(H0.length).trim(); if (rest) chunks.l01[0] = [rest, c0[1] + 3]; else chunks.l01.shift(); } }
  const O = makeOverlay(ctx, tl, { chunks, capBase: 1380, paper: true, who: Object.fromEntries(ep.voice.lines.map(l => [l.id, l.who || 'A'])) });

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let [z, cx, cy] = camAt(film.cam, t);
    // yavaş kamera nefesi: hiçbir an tamamen durmaz; D'ye göre periyodik (döngü dikişi korunur)
    const ph = 2 * Math.PI * t / D; z *= 1 + 0.018 * Math.sin(ph * 11); cx += 7 * Math.sin(ph * 7); cy += 6 * Math.cos(ph * 9);
    ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
    film.draw(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    O.title(t, film.title || ['Hangisi daha', 'şaşırtıcı?'], film.titleOut ?? T.l01end + 0.15, 470, D - 0.45, film.kicker || ep.kicker);   // sayı filmleri kendi kanca başlığını verir
    for (const nc of film.names || []) O.nameCard(t, nc[0], nc[1], nc[2], nc[3]);
    for (const bn of film.numbers || []) O.bigNumber(t, bn[0], bn[1], bn[2], bn[3]);
    film.overlay?.(t, ctx, O);
    O.caption(t);
    O.follow(t, T.lastEnd + 0.4, T.loop0 - 0.3, 1300);
  }
  return { duration: D, timeline: { T }, render };
}

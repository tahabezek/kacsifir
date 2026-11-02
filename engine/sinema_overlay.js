// Sinema filmlerinin ortak 2B kaplaması (№ 067'den çıkarıldı; № 041 ve sonraki Hangisi filmleri kullanır).
// Altyazı (kelimeye kilitli parçalar, en az 1,25 sn), kanca başlığı, büyük sayı, isim kartı, TAKİP ET.
// Yazılar karartmayla değil kırpma + kaymayla girer; hepsi güvenli alanın (x 90–920) ortasına hizalanır.
import { W, H, ease, seg, lerp } from './core.js';
import { F, setFont, wrap } from './tower.js';
import { shadowText as shadowTextS } from './sinema.js';

export const SAFE = { x0: 90, x1: 920 };
export const CX = (SAFE.x0 + SAFE.x1) / 2;
export const GOLD = '#FFC845', WHITE = '#FFFFFF';

export function makeOverlay(ctx, tl, opts = {}) {
  const paper = !!opts.paper;   // 2B çizgi filmler: karartma yerine kâğıt kart, beyaz yerine mürekkep yazı
  const INK = '#1F2421', PAPER = '#F4EFE3';
  const accent = opts.accent || (paper ? '#C2412F' : GOLD);
  const shadowText = (c, s, x, y, col, blur) => { if (!paper) return shadowTextS(c, s, x, y, col, blur); c.fillStyle = col === WHITE ? INK : col; c.fillText(s, x, y); };
  function scrim(cx, cy, w, h, a = 0.55) {
    if (paper) { if (a <= 0.01) return; const cw = w * 0.86, ch = h * 0.6; ctx.save(); ctx.globalAlpha = Math.min(1, a / 0.5); ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(cx - cw / 2, cy - ch / 2, cw, ch, 18); ctx.fill(); ctx.stroke(); ctx.restore(); return; }
    ctx.save(); ctx.translate(cx, cy); ctx.scale(w / 2, h / 2);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(8,7,6,${a})`); g.addColorStop(0.6, `rgba(8,7,6,${a * 0.7})`); g.addColorStop(1, 'rgba(8,7,6,0)');
    ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }

  // CH: { lineId: [[metin, ilk kelime sırası], ...] }
  const chunks = [];
  for (const [id, list] of Object.entries(opts.chunks || {})) {
    const ln = tl.L[id], raw = list.map(([s, i, dt = 0]) => ({ s, t0: ln.words[i].t0 - 0.04 + dt }));   // dt: ölçülmüş kelime kayıksa düzeltme
    raw.forEach((c, i) => { c.t1 = i + 1 < raw.length ? raw[i + 1].t0 : ln.end + 0.3; });
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (c.t1 - c.t0 < 1.25 && raw.length > 1) {
        if (i + 1 < raw.length) { raw[i + 1] = { s: c.s + ' ' + raw[i + 1].s, t0: c.t0, t1: raw[i + 1].t1 }; continue; }
        const p = chunks.at(-1); if (p && p.id === id) { p.s += ' ' + c.s; p.t1 = c.t1; continue; }
      }
      chunks.push({ ...c, id });
    }
  }
  for (let i = 0; i + 1 < chunks.length; i++) chunks[i].t1 = Math.min(chunks[i].t1, chunks[i + 1].t0);   // üst üste binmez
  const CAP_SIZE = opts.capSize || 70, CAP_LH = CAP_SIZE * 1.17, CAP_BASE = opts.capBase || 1330;
  function caption(t) {
    const c = chunks.find(c => t >= c.t0 && t < c.t1); if (!c) return;
    setFont(ctx, F.head(CAP_SIZE)); ctx.textAlign = 'center';
    const lines = wrap(ctx, c.s, SAFE.x1 - SAFE.x0), u = ease.enter(seg(t, c.t0, 0.2));
    if (lines.length === 2 && !lines[1].includes(' ')) { const w = lines[0].split(' '); lines[1] = w.pop() + ' ' + lines[1]; lines[0] = w.join(' '); }
    if (lines.length === 2 && /^[%~]?\d[\d.,]*$/.test(lines[0].split(' ').at(-1)) && lines[0].includes(' ')) { const w = lines[0].split(' '); lines[1] = w.pop() + ' ' + lines[1]; lines[0] = w.join(' '); }   // sayı sonraki sözcüğünden ayrılmaz
    scrim(CX, CAP_BASE - (lines.length - 1) * CAP_LH / 2 - CAP_SIZE * 0.35, 1000, 180 + lines.length * CAP_LH, 0.66);
    lines.forEach((ln, i) => {
      const y = CAP_BASE - (lines.length - 1 - i) * CAP_LH + (1 - u) * 26;
      ctx.save(); ctx.beginPath(); ctx.rect(0, y - CAP_SIZE * 1.05, W, CAP_SIZE * 1.4); ctx.clip();
      shadowText(ctx, ln, CX, y, WHITE, 22);
      ctx.restore();
    });
    ctx.textAlign = 'left';
  }

  // kanca başlığı: kare 0'dan tam; t1'de yukarı kayarak kırpılır
  // tin verilirse döngü sonunda yeniden girer (son kare = ilk kare)
  function title(t, lines, t1, y0 = 470, tin = Infinity) {
    const out = t >= tin ? 1 - ease.enter(seg(t, tin, 0.35)) : ease.exit(seg(t, t1, 0.3)); if (out >= 1) return;
    let q = 104; setFont(ctx, F.head(q));
    while (q > 70 && lines.some(l => ctx.measureText(l).width > SAFE.x1 - SAFE.x0)) { q -= 2; setFont(ctx, F.head(q)); }
    ctx.textAlign = 'center';
    scrim(CX, y0 + q * 0.15 - out * q * 1.2, 1060, q * 3.4, 0.55 * (1 - out));
    lines.forEach((s, i) => {
      const y = y0 + i * (q * 1.02);
      ctx.save(); ctx.beginPath(); ctx.rect(0, y - q * 1.0, W, q * 1.3); ctx.clip();
      shadowText(ctx, s, CX, y - out * q * 1.2, i === lines.length - 1 ? accent : WHITE, 26);
      ctx.restore();
    });
    ctx.textAlign = 'left';
  }

  const fmt = n => Math.round(n).toLocaleString('tr-TR');
  // büyük sayı: value sayısı ya da (t → sayı) fonksiyonu
  function bigNumber(t, t0, t1, value, unit, y = 470, size = 170) {
    const inU = ease.enter(seg(t, t0, 0.3)), outU = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || outU >= 1) return;
    const v = typeof value === 'function' ? value(t) : value;
    setFont(ctx, F.head(size)); ctx.textAlign = 'center';
    const dy = (1 - inU) * 60 - outU * 80;
    scrim(CX, y - 10 + dy, 860, size * 2.1, 0.5 * inU * (1 - outU));
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 1.0, W, size * 1.75); ctx.clip();
    shadowText(ctx, typeof v === 'string' ? v : fmt(v), CX, y + dy, WHITE, 34);
    if (unit) { setFont(ctx, F.head(56)); shadowText(ctx, unit, CX, y + 76 + dy, accent, 22); }
    ctx.restore(); ctx.textAlign = 'left';
  }

  // isim kartı: iki satır (ad + alt bilgi), üstte; soldan kırpılarak açılır
  function nameCard(t, t0, t1, name, sub, y = 430) {
    const inU = ease.enter(seg(t, t0, 0.35)), out = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || out >= 1) return;
    setFont(ctx, F.head(92)); ctx.textAlign = 'center';
    const dy = -out * 70;
    scrim(CX, y + 10 + dy, 980, 300, 0.5 * (1 - out));
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - 92 + dy, W, 175); ctx.clip();
    shadowText(ctx, name, CX, y + (1 - inU) * 90 + dy, WHITE, 26);
    setFont(ctx, F.head(52)); shadowText(ctx, sub, CX, y + 66 + (1 - inU) * 120 + dy, accent, 20);
    ctx.restore(); ctx.textAlign = 'left';
  }

  function follow(t, t0, t1, yc = 1110) {
    const inU = ease.enter(seg(t, t0, 0.3)), out = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || out >= 1) return;
    const s = 'TAKİP ET';
    setFont(ctx, F.head(64)); const w = ctx.measureText(s).width + 96, x = CX - w / 2, y = yc + (1 - inU) * 40 + out * 40;
    ctx.save(); ctx.globalAlpha = 1 - out;
    ctx.fillStyle = accent; ctx.beginPath(); ctx.roundRect(x, y - 66, w, 100, 50); ctx.fill();
    ctx.fillStyle = '#16120C'; ctx.textAlign = 'center'; ctx.fillText(s, CX, y + 6);
    setFont(ctx, F.head(56)); shadowText(ctx, 'Her gün yeni bir sayı', CX, y + 112, WHITE, 22);
    ctx.restore(); ctx.textAlign = 'left';
  }

  return { scrim, caption, title, bigNumber, nameCard, follow, chunks, fmt };
}

// kamera anahtarlarından (t, pos, tgt, fov[, focus, aperture]) sürekli kamera
export function cameraTrack(K, track3, monotone, apertureDefault = 0.04) {
  const xs = K.map(k => k[0]);
  const posF = track3(K.map(k => [k[0], k[1]])), tgtF = track3(K.map(k => [k[0], k[2]])), fovF = monotone(xs, K.map(k => k[3]));
  const hasF = K.some(k => k[4] != null), focF = hasF ? monotone(xs, K.map((k, i) => k[4] ?? Math.hypot(...k[1].map((v, j) => v - k[2][j])))) : null;
  const apF = monotone(xs, K.map(k => k[5] ?? apertureDefault));
  return t => {
    const pos = posF(t), tgt = tgtF(t);
    return { pos, tgt, fov: fovF(t), focus: focF ? focF(t) : Math.hypot(pos[0] - tgt[0], pos[1] - tgt[1], pos[2] - tgt[2]), aperture: apF(t) };
  };
}
export { lerp };

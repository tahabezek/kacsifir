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

  // kâğıt kart (2B çizgi filmler): verilen sınırlarla; kutu yazıya göre ölçülür, yazı kutudan taşmaz
  const mt = s => { const m = ctx.measureText(s); return { w: m.width, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent }; };
  function pcard(x0, y0, x1, y1, a = 1) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 18); ctx.fill(); ctx.stroke(); ctx.restore();
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
  // Soran'ın cümlesi: sarı konuşma balonu, sağ altta kuyruk ve küçük yüz (iki sesli anlatım)
  function soranBalon(t, c, lines, u) {
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width)), bw = tw + 90, bh = lines.length * CAP_LH + 50;
    const x = CX - bw / 2 - 40, y = CAP_BASE - lines.length * CAP_LH + 10 + (1 - u) * 30;
    ctx.save(); ctx.globalAlpha = Math.min(1, u * 1.6);
    ctx.fillStyle = '#F6C445'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 28); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + bw - 70, y + bh - 3); ctx.lineTo(x + bw + 10, y + bh + 50); ctx.lineTo(x + bw - 20, y + bh - 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F6C445'; ctx.fillRect(x + bw - 66, y + bh - 9, 42, 10);
    const fx = x + bw + 48, fy = y + bh + 66;   // Soran'ın yüzü: topuzlu kısa saç, iri gözler
    ctx.beginPath(); ctx.arc(fx, fy - 40, 22, 0, 7); ctx.fillStyle = '#3A2A20'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(fx, fy, 46, 0, 7); ctx.fillStyle = '#F2C9A5'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(fx, fy - 10, 46, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = '#3A2A20'; ctx.fill();
    for (const ex of [-16, 16]) { ctx.beginPath(); ctx.arc(fx + ex, fy + 2, 8, 0, 7); ctx.fillStyle = INK; ctx.fill(); }
    const talkO = 4 + 6 * Math.abs(Math.sin(t * 17)); ctx.beginPath(); ctx.ellipse(fx, fy + 24, 9, talkO, 0, 0, 7); ctx.fillStyle = '#7A2E2A'; ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = INK; ctx.textAlign = 'center';
    lines.forEach((ln, i) => ctx.fillText(ln, x + bw / 2, y + 28 + CAP_SIZE * 0.85 + i * CAP_LH));
    ctx.restore(); ctx.textAlign = 'left';
  }
  function caption(t) {
    const c = chunks.find(c => t >= c.t0 && t < c.t1); if (!c) return;
    setFont(ctx, F.head(CAP_SIZE)); ctx.textAlign = 'center';
    const lines = wrap(ctx, c.s, SAFE.x1 - SAFE.x0), u = ease.enter(seg(t, c.t0, 0.2));
    if (lines.length === 2 && !lines[1].includes(' ')) { const w = lines[0].split(' '); lines[1] = w.pop() + ' ' + lines[1]; lines[0] = w.join(' '); }
    if (lines.length === 2 && /^[%~]?\d[\d.,]*$/.test(lines[0].split(' ').at(-1)) && lines[0].includes(' ')) { const w = lines[0].split(' '); lines[1] = w.pop() + ' ' + lines[1]; lines[0] = w.join(' '); }   // sayı sonraki sözcüğünden ayrılmaz
    if (paper && opts.who?.[c.id] === 'S') { soranBalon(t, c, lines, u); return; }
    if (paper) {
      const ms = lines.map(l => mt(l)), w = Math.max(...ms.map(m => m.w)), y0 = CAP_BASE - (lines.length - 1) * CAP_LH;
      pcard(CX - w / 2 - 36, y0 - Math.max(...ms.map(m => m.a)) - 20, CX + w / 2 + 36, CAP_BASE + Math.max(...ms.map(m => m.d)) + 22, 1);
    } else scrim(CX, CAP_BASE - (lines.length - 1) * CAP_LH / 2 - CAP_SIZE * 0.35, 1000, 180 + lines.length * CAP_LH, 0.66);
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
  // kicker: başlığın üstünde küçük seri etiketi ("SENİN SAYIN · ÖMÜR"); her kapakta aynı yerde durur
  function title(t, lines, t1, y0 = 470, tin = Infinity, kicker = null) {
    const out = t >= tin ? 1 - ease.enter(seg(t, tin, 0.35)) : ease.exit(seg(t, t1, 0.3)); if (out >= 1) return;
    let q = 104; setFont(ctx, F.head(q));
    while (q > 70 && lines.some(l => ctx.measureText(l).width > SAFE.x1 - SAFE.x0)) { q -= 2; setFont(ctx, F.head(q)); }
    ctx.textAlign = 'center';
    if (paper) {   // kart yazının ölçülmüş sınırlarından: etiket ve son satırın alt çıkıntıları da içeride kalır
      const ms = lines.map(l => mt(l)), lastY = y0 + (lines.length - 1) * q * 1.02, sh = -out * q * 1.2;
      let top = y0 - ms[0].a, w = Math.max(...ms.map(m => m.w));
      if (kicker) { setFont(ctx, F.mono(40)); const k = mt(kicker); top = y0 - q * 1.02 - k.a; w = Math.max(w, k.w); setFont(ctx, F.head(q)); }
      pcard(CX - w / 2 - 44, top - 26 + sh, CX + w / 2 + 44, lastY + ms.at(-1).d + 26 + sh, 1 - out);
    } else scrim(CX, y0 + q * 0.15 - out * q * 1.2 - (kicker ? 22 : 0), 1060, q * 3.4 + (kicker ? 60 : 0), 0.55 * (1 - out));
    if (kicker) {
      const ky = y0 - q * 1.02 - out * q * 1.2;
      ctx.save(); ctx.beginPath(); ctx.rect(0, ky - 44, W, 60); ctx.clip();
      setFont(ctx, F.mono(40)); shadowText(ctx, kicker, CX, ky, paper ? '#4A453C' : WHITE, 12);
      ctx.restore(); setFont(ctx, F.head(q));
    }
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
    const v = typeof value === 'function' ? value(t) : value, s = typeof v === 'string' ? v : fmt(v);
    const dy = (1 - inU) * 60 - outU * 80;
    let us = 56;
    if (paper) {   // yazı güvenli alana sığana kadar küçülür; kart ölçülmüş yazıyı çevreler
      setFont(ctx, F.head(size)); while (size > 90 && mt(s).w > SAFE.x1 - SAFE.x0 - 60) { size -= 4; setFont(ctx, F.head(size)); }
      const n = mt(s); let u = { w: 0, d: n.d };
      if (unit) { setFont(ctx, F.head(us)); while (us > 34 && mt(unit).w > SAFE.x1 - SAFE.x0 - 60) { us -= 2; setFont(ctx, F.head(us)); } u = mt(unit); }
      const w = Math.max(n.w, u.w), bot = unit ? y + 76 + u.d : y + n.d;
      pcard(CX - w / 2 - 40, y - n.a - 22 + dy, CX + w / 2 + 40, bot + 22 + dy, inU * (1 - outU));
    } else scrim(CX, y - 10 + dy, 860, size * 2.1, 0.5 * inU * (1 - outU));
    setFont(ctx, F.head(size)); ctx.textAlign = 'center';
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 1.0, W, size * 1.75); ctx.clip();
    shadowText(ctx, s, CX, y + dy, WHITE, 34);
    if (unit) { setFont(ctx, F.head(us)); shadowText(ctx, unit, CX, y + 76 + dy, accent, 22); }
    ctx.restore(); ctx.textAlign = 'left';
  }

  // isim kartı: iki satır (ad + alt bilgi), üstte; soldan kırpılarak açılır
  function nameCard(t, t0, t1, name, sub, y = 430) {
    const inU = ease.enter(seg(t, t0, 0.35)), out = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || out >= 1) return;
    let ns = 92, ss = 52;
    setFont(ctx, F.head(ns)); while (ns > 60 && mt(name).w > SAFE.x1 - SAFE.x0 - 60) { ns -= 2; setFont(ctx, F.head(ns)); }
    ctx.textAlign = 'center';
    const dy = -out * 70;
    if (paper) {
      const n = mt(name); setFont(ctx, F.head(ss)); while (ss > 34 && mt(sub).w > SAFE.x1 - SAFE.x0 - 60) { ss -= 2; setFont(ctx, F.head(ss)); }
      const u = mt(sub), w = Math.max(n.w, u.w);
      pcard(CX - w / 2 - 40, y - n.a - 22 + dy, CX + w / 2 + 40, y + 66 + u.d + 22 + dy, inU * (1 - out));
      setFont(ctx, F.head(ns));
    } else scrim(CX, y + 10 + dy, 980, 300, 0.5 * (1 - out));
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - 92 + dy, W, 175); ctx.clip();
    shadowText(ctx, name, CX, y + (1 - inU) * 90 + dy, WHITE, 26);
    setFont(ctx, F.head(ss)); shadowText(ctx, sub, CX, y + 66 + (1 - inU) * 120 + dy, accent, 20);
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

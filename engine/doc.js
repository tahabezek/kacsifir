// "Belgesel" şablonu (kâğıt katlama): sahneler tek zaman çizelgesinde, her kare render(t)'nin saf fonksiyonu.
// Görsel dil: kâğıt zemin, mürekkep, tek kırmızı (yalnızca doruk), teknik çizim ölçü çizgileri.
import { W, H, ease, seg, lerp, spring } from './core.js';
import { C, F, setFont, wrap, revealText, grain } from './tower.js';

const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
const SAFE = { x0: 90, x1: 920 };

// Gallivan (2002), tek yönde katlama için gereken en az uzunluk (mm): L = πt/6 · (2ⁿ + 4)(2ⁿ − 1)
export const gallivanL = (n, t = 0.1) => (Math.PI * t / 6) * (2 ** n + 4) * (2 ** n - 1);

// ——— zaman çizelgesi (vuruş → saniye) ———
export function buildDocTimeline(ep) {
  const beat = 60 / ep.bpm;
  const S = {};
  let cur = 0;
  for (const s of ep.scenes) { S[s.id] = { ...s, t0: cur * beat, t1: (cur + s.beats) * beat }; cur += s.beats; }
  const fold = S.fold;
  const folds = [];
  for (let k = 1; k <= ep.folds; k++) {
    const a = fold.t0 + beat * ((ep.foldStartBeat ?? 0.5) + (k - 1) * ep.foldEvery);
    folds.push({ k, t0: a, t1: a + beat * ep.foldEvery * 0.8 });
  }
  const hero = S.hero;
  const heroLand = hero.t0 + beat * ep.heroLandBeat;
  return { beat, S, folds, duration: cur * beat, heroLand, silence0: heroLand - beat * ep.silenceBeats };
}

// Ses ipuçları (audio.mjs ortak biçimi)
export function docCues(ep) {
  const tl = buildDocTimeline(ep);
  const bars = tl.S.why;
  const barT = k => bars.t0 + tl.beat * (1 + (k - 1) * 0.75);
  return {
    beat: tl.beat, duration: tl.duration, rw0: tl.S.loop.t0, rw1: tl.S.loop.t1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: tl.folds.map(f => ({ t0: f.t0, t1: f.t1, hero: false })),
    lands: [...tl.folds.map(f => f.t1), ...[1, 2, 3, 4, 5, 6, 7, 8].map(k => barT(k) + tl.beat * 0.5), tl.S.gallivan.t0 + 0.05, tl.S.records.t0 + 0.05],
    tallies: [],
  };
}

export function makeDocRenderer(ep, canvas) {
  const tl = buildDocTimeline(ep);
  const ctx = canvas.getContext('2d');
  const D = tl.duration;
  const { S } = tl;

  // ——— yardımcılar ———
  const enterP = (t, a, d = 0.5) => ease.enter(seg(t, a, d));
  const sceneP = (t, sc, exitLead = 0.3) => {
    if (t < sc.t0) return 0;
    const pin = ease.enter(seg(t, sc.t0, 0.5));
    const pout = t > sc.t1 - exitLead ? 1 - ease.exit(seg(t, sc.t1 - exitLead, exitLead)) : 1;
    return pin * pout;
  };
  function lines(text, x, y, size, p, color, font = F.name, maxW = SAFE.x1 - SAFE.x0, lh = 1.18) {
    setFont(ctx, font(size));
    const L = wrap(ctx, text, maxW);
    L.forEach((ln, k) => revealText(ctx, ln, x, y + k * size * lh, size, Math.max(0, Math.min(1, p * 1.0)), color));
    return L.length;
  }
  function dimH(x0, x1, y, label, color = C.ink, below = true) {
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (const x of [x0, x1]) { ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y - 10); ctx.stroke(); }
    setFont(ctx, F.mono(44)); ctx.fillStyle = color; ctx.textAlign = 'center';
    ctx.fillText(label, (x0 + x1) / 2, below ? y + 56 : y - 20); ctx.textAlign = 'left';
  }
  function grid(t) {
    const GX = 48, drift = Math.max(1, Math.round((D * 10) / GX)) * GX;
    const off = ((t / D) * drift) % GX;
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = SAFE.x0 - GX + off; x <= SAFE.x1; x += GX) { if (x < SAFE.x0) continue; ctx.moveTo(Math.round(x) + 0.5, 700); ctx.lineTo(Math.round(x) + 0.5, 1330); }
    for (let y = 700; y <= 1330; y += GX) { ctx.moveTo(SAFE.x0, y + 0.5); ctx.lineTo(SAFE.x1, y + 0.5); }
    ctx.stroke();
  }

  // ——— başlıklar: her sahnenin kendi başlığı (maskeyle girer/çıkar); kare 0'da soru ekranda ———
  function titles(t) {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 318);
    for (const sc of ep.scenes) {
      const s = S[sc.id];
      if (!s.title) continue;
      let p;
      if (sc.id === 'fold') {
        p = t < s.t1 - 0.3 ? 1 : 1 - ease.exit(seg(t, s.t1 - 0.3, 0.3));
        if (t >= S.loop.t0) p = ease.enter(seg(t, S.loop.t1 - 0.6, 0.5));
      } else p = sceneP(t, s);
      if (p <= 0) continue;
      let size = 104; setFont(ctx, F.head(size));
      while (size > 64 && s.title.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { size -= 2; setFont(ctx, F.head(size)); }
      s.title.forEach((q, i) => revealText(ctx, q, SAFE.x0, 356 + size * 0.86 + i * size, size, p, s.id === 'hero' && t >= tl.heroLand ? C.ink : C.ink));
    }
  }

  // ——— S1: A4 yukarıdan, gerçek oranında; her katlamada yarısı üstüne döner (yön sırayla değişir).
  // Sağda gerçek ölçekli kalınlık cetveli (20:1). Kare 0'dan hareket hâlinde.
  function foldScene(t) {
    const s = S.fold;
    const loopIn = t >= S.loop.t0;
    if (!(t < s.t1 || loopIn)) return;
    let k = 0, u = 0;
    for (const f of tl.folds) { if (t >= f.t1) k = f.k; else if (t >= f.t0) { k = f.k - 1; u = ease.state(seg(t, f.t0, f.t1 - f.t0)); break; } }
    if (loopIn) { k = 0; u = 0; }
    const out = loopIn ? ease.enter(seg(t, S.loop.t0 + 0.35, 0.6)) : t > s.t1 - 0.3 ? 1 - ease.exit(seg(t, s.t1 - 0.3, 0.3)) : 1;
    if (out <= 0) return;
    ctx.save(); ctx.globalAlpha = out;
    // kâğıt boyutu k katlamadan sonra (mm): tek katlamalar uzun kenarı, çiftler kısa kenarı yarılar
    const dims = n => { let w = 210, h = 297; for (let i = 1; i <= n; i++) { if (i % 2) h /= 2; else w /= 2; } return [w, h]; };
    const SC = 1.42, cx = 430, cy = 1110;          // px/mm, kâğıt merkezi
    const [w0, h0] = dims(k), [w1, h1] = dims(k + 1);
    const tone = n => `rgba(28,27,24,${Math.min(0.62, 0.05 + n * 0.08)})`;   // katman arttıkça koyulaşır
    const sheet = (x, y, w, h, n, flip = 0) => {
      ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = tone(n); ctx.fillRect(x, y, w, h);
      if (flip) { ctx.fillStyle = 'rgba(28,27,24,0.10)'; ctx.fillRect(x, y, w, h); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    };
    // bitiş merkezine kayma: katlanan paket katlama boyunca yeni merkezine yerleşir
    const odd = (k + 1) % 2 === 1;
    const W0 = w0 * SC, H0 = h0 * SC;
    let ox = cx - W0 / 2, oy = cy - H0 / 2;
    if (u > 0) {
      if (odd) oy += lerp(0, H0 / 4, u); else ox += lerp(0, W0 / 4, u);
      if (odd) {
        // üst yarı alta döner (yatay kıvrım)
        const yc = oy + H0 / 2;
        sheet(ox, yc, W0, H0 / 2, k);
        const c = Math.cos(Math.PI * u), hh = (H0 / 2) * Math.abs(c);
        if (c >= 0) sheet(ox, yc - hh, W0, hh, k); else sheet(ox, yc, W0, hh, k, 1);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox, yc); ctx.lineTo(ox + W0, yc); ctx.stroke();
      } else {
        // sağ yarı sola döner (dikey kıvrım)
        const xc = ox + W0 / 2;
        sheet(ox, oy, W0 / 2, H0, k);
        const c = Math.cos(Math.PI * u), ww = (W0 / 2) * Math.abs(c);
        if (c >= 0) sheet(xc, oy, ww, H0, k); else sheet(xc - ww, oy, ww, H0, k, 1);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xc, oy); ctx.lineTo(xc, oy + H0); ctx.stroke();
      }
    } else {
      sheet(ox, oy, W0, H0, k);
    }
    // ölçüler: genişlik ve yükseklik
    const W = (u > 0 ? (odd ? w0 : lerp(w0, w1, u)) : w0), Hh = (u > 0 ? (odd ? lerp(h0, h1, u) : h0) : h0);
    const fmt = mm => (mm >= 10 ? `${nf1.format(mm / 10)} cm` : `${nf1.format(mm)} mm`);
    dimH(cx - W * SC / 2, cx + W * SC / 2, cy + h0 * SC / 2 + 46, fmt(W));
    // kalınlık cetveli (20:1): sağda, tabandan yukarı
    const kk = u > 0.5 ? k + 1 : k;
    const thick = 2 ** kk * 0.1, R = 20, rx = 800, rb = 1330;
    const th = thick * R;
    ctx.fillStyle = C.ink; ctx.fillRect(rx, rb - th, 34, th);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let mm = 0; mm <= 14; mm += 1) { const yy = rb - mm * R; ctx.moveTo(rx - (mm % 5 ? 10 : 22), yy); ctx.lineTo(rx - 2, yy); }
    ctx.moveTo(rx - 2, rb); ctx.lineTo(rx - 2, rb - 14 * R); ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText(`${nf1.format(thick)} mm`, rx + 17, rb - th - 16);
    setFont(ctx, F.mono(30)); ctx.fillStyle = C.graphite; ctx.fillText('kalınlık', rx + 17, rb + 40); ctx.fillText('20:1', rx + 17, rb + 74);
    ctx.textAlign = 'left';
    // sayaç
    setFont(ctx, F.head(124)); ctx.fillStyle = C.ink;
    const num = String(kk);
    ctx.fillText(num, SAFE.x0, 700);
    const nw = ctx.measureText(num).width;
    setFont(ctx, F.name(56)); ctx.fillText('katlama', SAFE.x0 + nw + 18, 700);
    setFont(ctx, F.mono(44)); ctx.fillStyle = C.ink;
    ctx.fillText(`${nf.format(2 ** kk)} katman`, SAFE.x0, 770);
    if (!loopIn && tl.folds[1]) lines(ep.text.foldSay, SAFE.x0, 850, 48, enterP(t, tl.folds[1].t1), C.ink);
    ctx.restore();
  }

  // ——— S2: neden? gereken uzunluk her katta ~4 kat ———
  function whyScene(t) {
    const s = S.why, p = sceneP(t, s);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    const barT = k => s.t0 + tl.beat * (1 + (k - 1) * 0.75);
    const base = 1270, left = 300, gap = 70, bw = 46;
    // kamera: 29,7 cm alanın %55'i; 7. ve 8. çubuk büyüdükçe log uzayında geri çekilir
    const need = [];
    for (let k = 1; k <= 8; k++) need.push(gallivanL(k));
    const growth = k => ease.state(seg(t, barT(k), tl.beat * 0.7));
    let top = 297;
    for (let k = 1; k <= 8; k++) top = Math.max(top, need[k - 1] * growth(k));
    const areaH = 420, scale = (areaH * 0.92) / Math.max(297 / 0.55, top);
    // A4 çizgisi
    const ya = base - 297 * scale;
    ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 36; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(SAFE.x0, ya); ctx.lineTo(SAFE.x1, ya); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    // tarama: her 2 vuruşta çubuklar boyunca soldan sağa grafit çizgi (sürekli döngü)
    { const per = tl.beat * 2, ph = (((t - s.t0) % per) + per) % per / per; const sx = lerp(left - 20, left + 8 * gap, ease.state(Math.min(1, ph / 0.8)));
      ctx.strokeStyle = 'rgba(139,133,119,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, base - areaH); ctx.lineTo(sx, base + 10); ctx.stroke(); }
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.ink; ctx.fillText('A4 · 29,7 cm', SAFE.x0, ya - 14);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(left - 30, base); ctx.lineTo(SAFE.x1, base); ctx.stroke();
    for (let k = 1; k <= 8; k++) {
      const g = growth(k); if (g <= 0) continue;
      const x = left + (k - 1) * gap, hp = need[k - 1] * g * scale;
      ctx.fillStyle = C.ink; ctx.fillRect(x, base - Math.max(hp, 2), bw, Math.max(hp, 2));
      setFont(ctx, F.mono(36)); ctx.textAlign = 'center';
      ctx.fillText(String(k), x + bw / 2, base + 44);
      if (k >= 6 && g > 0.98) { setFont(ctx, F.mono(34)); const v = need[k - 1]; ctx.fillText(v >= 1000 ? `${nf1.format(v / 1000)} m` : `${nf.format(v / 10)} cm`, x + bw / 2, base - hp - 14); }
      ctx.textAlign = 'left';
    }
    setFont(ctx, F.mono(34)); ctx.fillStyle = C.graphite; ctx.fillText('katlama sayısı', left - 10, base + 92);
    // metin
    lines(ep.text.whyA, SAFE.x0, 640, 50, enterP(t, s.t0 + 0.2), C.ink);
    lines(ep.text.whyB, SAFE.x0, 760, 44, enterP(t, barT(7) + tl.beat * 0.8), C.ink);
    ctx.restore();
  }

  // π ve üst simge gibi fontta olmayan glifleri elle çizen formül
  function formula(x, y, size, p) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 4, y - size, (SAFE.x1 - x) * p, size * 1.6); ctx.clip();
    ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink;
    setFont(ctx, F.mono(size));
    let cx = x;
    const txt = s => { ctx.fillText(s, cx, y); cx += ctx.measureText(s).width; };
    const sup = s => { setFont(ctx, F.mono(size * 0.62)); ctx.fillText(s, cx, y - size * 0.42); cx += ctx.measureText(s).width; setFont(ctx, F.mono(size)); };
    const pi = () => { // π: üst çizgi + iki bacak
      const w = size * 0.55; ctx.lineWidth = size * 0.08; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + w * 0.05, y - size * 0.5); ctx.lineTo(cx + w * 0.95, y - size * 0.55);
      ctx.moveTo(cx + w * 0.32, y - size * 0.52); ctx.lineTo(cx + w * 0.26, y);
      ctx.moveTo(cx + w * 0.7, y - size * 0.53); ctx.quadraticCurveTo(cx + w * 0.66, y - size * 0.1, cx + w * 0.86, y); ctx.stroke();
      cx += w * 1.08;
    };
    txt('L = '); pi(); txt('t/6 · (2'); sup('n'); txt(' + 4)(2'); sup('n'); txt(' − 1)');
    ctx.restore();
  }

  // ——— S3: 2002 · Gallivan ———
  function gallivanScene(t) {
    const s = S.gallivan, p = sceneP(t, s);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    setFont(ctx, F.mono(40)); revealText(ctx, ep.text.gPlace, SAFE.x0, 640, 40, enterP(t, s.t0 + 0.15), C.graphite);
    lines(ep.text.gWho, SAFE.x0, 712, 50, enterP(t, s.t0 + 0.3), C.ink);
    formula(SAFE.x0, 860, 50, ease.state(seg(t, s.t0 + 0.9, 1.4)));
    lines(ep.text.gDid, SAFE.x0, 960, 50, enterP(t, s.t0 + tl.beat * 4.5), C.ink);
    // karşılaştırma: 1.200 m kâğıt ve Boğaziçi Köprüsü ana açıklığı (1.074 m)
    const pc = ease.state(seg(t, s.t0 + tl.beat * 5.5, 1.0));
    if (pc > 0) {
      const sc = 780 / 1200, x0 = SAFE.x0 + 20;
      dimH(x0, x0 + 1200 * sc * pc, 1110, pc > 0.95 ? '1.200 m kâğıt' : '', C.ink, false);
      const bx1 = x0 + 1074 * sc;
      const pb = ease.state(seg(t, s.t0 + tl.beat * 7, 0.9));
      if (pb > 0) {
        ctx.save(); ctx.globalAlpha *= pb;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
        const deck = 1270, tw = 110;
        ctx.beginPath(); ctx.moveTo(x0 - 30, deck); ctx.lineTo(bx1 + 40, deck); ctx.stroke();
        for (const tx of [x0, bx1]) { ctx.beginPath(); ctx.moveTo(tx, deck + 30); ctx.lineTo(tx, deck - tw); ctx.stroke(); }
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, deck - tw); ctx.quadraticCurveTo((x0 + bx1) / 2, deck + tw * 0.75, bx1, deck - tw); ctx.stroke();
        for (let i = 1; i < 14; i++) { const xx = lerp(x0, bx1, i / 14), u = i / 14, yc = (1 - u) * (1 - u) * (deck - tw) + 2 * u * (1 - u) * (deck + tw * 0.75) + u * u * (deck - tw); ctx.beginPath(); ctx.moveTo(xx, yc); ctx.lineTo(xx, deck); ctx.stroke(); }
        dimH(x0, bx1, deck + 70, '1.074 m · Boğaziçi Köprüsü', C.ink, true);
        // köprüde akan araçlar (iki yön, doğrusal sürekli hareket)
        ctx.fillStyle = C.ink;
        for (let i = 0; i < 9; i++) { const span = bx1 - x0 + 70; const xa = x0 - 30 + ((t * 90 + i * span / 9) % span); ctx.fillRect(xa, deck - 9, 16, 7);
          const xb = bx1 + 40 - ((t * 70 + i * span / 9 + 31) % span); ctx.fillRect(xb, deck + 3, 16, 7); }
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ——— S4: rekorlar ———
  function recordsScene(t) {
    const s = S.records, p = sceneP(t, s);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p;
    const y = 1000, xa = SAFE.x0 + 30, xb = SAFE.x1 - 30;
    const pl = ease.state(seg(t, s.t0 + 0.1, 0.8));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(lerp(xa, xb, pl), y); ctx.stroke();
    { const per = tl.beat * 4, ph = (((t - s.t0) % per) + per) % per / per; const mx = lerp(xa, xb, ease.state(ph)) * pl + xa * (1 - pl);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(mx, y - 30); ctx.lineTo(mx - 10, y - 46); ctx.lineTo(mx + 10, y - 46); ctx.closePath(); ctx.fill(); }
    const marks = ep.records;
    const POS = [0.14, 0.52, 0.86];
    const xOf = (n, i) => lerp(xa, xb, POS[i]);
    marks.forEach((m, i) => {
      const pm = enterP(t, s.t0 + 0.4 + i * tl.beat * 1.4);
      if (pm <= 0) return;
      const x = xOf(m.n, i);
      ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x, y + 18); ctx.stroke();
      setFont(ctx, F.head(120)); ctx.textAlign = 'center';
      revealText(ctx, String(m.n), x, y - 50, 120, pm, i === 0 ? C.graphite : C.ink, 'center');
      setFont(ctx, F.name(40));
      m.label.forEach((ln, j) => revealText(ctx, ln, x, y + 76 + j * 48, 40, pm, i === 0 ? C.graphite : C.ink, 'center'));
      ctx.textAlign = 'left';
      if (i === 0 && pm > 0.9) { // efsanenin üstü çizilir
        const px = ease.state(seg(t, s.t0 + 0.4 + tl.beat * 4.2, 0.4));
        ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 50, y - 110); ctx.lineTo(x - 50 + 100 * px, y - 110 + 60 * px); ctx.stroke(); ctx.lineWidth = 3;
      }
    });
    ctx.restore();
  }

  // ——— S5: doruk · 42 katlama ———
  function heroScene(t) {
    const s = S.hero;
    if (t < s.t0 || t >= S.loop.t0 + 0.4) return;
    const out = t > S.loop.t0 ? 1 - ease.exit(seg(t, S.loop.t0, 0.3)) : 1;
    ctx.save(); ctx.globalAlpha = out;
    const p1 = enterP(t, s.t0 + 0.3);
    setFont(ctx, F.mono(44)); revealText(ctx, ep.text.hThickLabel, SAFE.x0, 650, 44, p1, C.graphite);
    setFont(ctx, F.head(110)); revealText(ctx, ep.text.hThick, SAFE.x0, 760, 110, enterP(t, s.t0 + 0.45), C.ink);
    lines(ep.text.hThickSay, SAFE.x0, 840, 48, enterP(t, s.t0 + 0.9), C.ink);
    // kalınlık: Dünya'dan Ay'a uzanan dikey ölçü (Ay 384.400 km çizgisi; kâğıt 439.805 km)
    { const pg = ease.state(seg(t, s.t0 + 0.6, Math.max(0.5, tl.silence0 - s.t0 - 0.7)));
      const yb = 1300, yTop = 930, kpx = (yb - yTop) / 439805, xr = 820;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(SAFE.x0, yb - 384400 * kpx); ctx.lineTo(SAFE.x1, yb - 384400 * kpx); ctx.stroke(); ctx.setLineDash([]);
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.ink; ctx.fillText('Ay · 384.400 km', SAFE.x0, yb - 384400 * kpx - 12);
      ctx.beginPath(); ctx.arc(SAFE.x0 + 40, yb + 4, 22, Math.PI, 0); ctx.stroke(); setFont(ctx, F.mono(30)); ctx.fillText('Dünya', SAFE.x0 + 70, yb);
      ctx.fillStyle = C.ink; ctx.fillRect(xr, yb - 439805 * kpx * pg, 18, 439805 * kpx * pg); }
    // sessizlikten sonra kırmızı vuruş
    if (t >= tl.heroLand) {
      const k = lerp(0.9, 1, spring(t - tl.heroLand, 120, 24));
      setFont(ctx, F.mono(44)); revealText(ctx, ep.text.hLenLabel, SAFE.x0, 990, 44, enterP(t, tl.heroLand - 0.04, 0.3), C.graphite);
      ctx.save(); ctx.translate(SAFE.x0, 1120); ctx.scale(k, k); ctx.translate(-SAFE.x0, -1120);
      setFont(ctx, F.head(132)); revealText(ctx, ep.text.hLen, SAFE.x0, 1120, 132, enterP(t, tl.heroLand - 0.04, 0.3), C.red);
      const lw = ctx.measureText(ep.text.hLen).width;
      setFont(ctx, F.name(60)); revealText(ctx, ep.text.hLenUnit, SAFE.x0 + lw + 20, 1120, 60, enterP(t, tl.heroLand - 0.04, 0.3), C.red);
      ctx.restore();
      lines(ep.text.hLenSay, SAFE.x0, 1200, 48, enterP(t, tl.heroLand + 0.7), C.ink);
      // kırmızı ölçü çizgisi: kadrajdan taşan kâğıt
      const pr = ease.enter(seg(t, tl.heroLand, 0.6));
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(SAFE.x0, 1340); ctx.lineTo(lerp(SAFE.x0, 940, pr), 1340); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(SAFE.x0 - 10, 1350); ctx.lineTo(SAFE.x0 + 10, 1330); ctx.stroke();
      // bitmeyen kâğıt: çentikler sağa akar
      ctx.lineWidth = 2; ctx.beginPath();
      for (let x = SAFE.x0 + ((t * 60) % 40); x < lerp(SAFE.x0, 940, pr); x += 40) { ctx.moveTo(x, 1332); ctx.lineTo(x, 1348); }
      ctx.stroke();
    }
    ctx.restore();
  }

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    grid(t);
    titles(t);
    foldScene(t);
    whyScene(t);
    gallivanScene(t);
    recordsScene(t);
    heroScene(t);
  }

  return { render, duration: D, timeline: tl };
}

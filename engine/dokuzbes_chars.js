// "Dokuz beş" nesneleri (10 Kasım anma filmi): gravür dili, kâğıt dolgu, mürekkep kontur, tarama.
// Dolmabahçe Sarayı'nın deniz cephesi ve saat kulesi (Üsküdar kıyısından bakış), arkadaki tepeler, şehir hatları
// vapuru, araba, yürüyen insan, martı, yarıya inmiş Türk bayrağı (Türk Bayrağı Kanunu oranları), duvar saati kadranı,
// masa saati ve oda levhası. Hiçbir insan figürü tanınabilir bir kişiyi temsil etmez; Atatürk çizilmez.
// Her nesne tek çizim fonksiyonudur; kök noktası yorumda yazılı. Kırmızı yalnız bayrakta.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577', BG = '#ECE5D5', FLAG_RED = '#E30A17';
const TAU = Math.PI * 2;
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function hatchRect(ctx, x, y, w, h, gap, lw, col = INK, ang = 1) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); for (let d = -h; d < w + h; d += gap) { ctx.moveTo(x + d, y + h); ctx.lineTo(x + d + h * ang, y); } ctx.stroke(); ctx.restore();
}
function hatchPath(ctx, path, gap, lw, col = INK, ext = 2000, ang = 1) {
  ctx.save(); path(); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); for (let d = -ext; d < ext; d += gap) { ctx.moveTo(d, ext); ctx.lineTo(d + 2 * ext * ang, -ext); } ctx.stroke(); ctx.restore();
}
export function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ——— arka tepeler (Beşiktaş sırtları): kök (x0, yBase); genişlik w ———
export function drawHills(ctx, x0, yBase, w) {
  const r = mulberry(1938);
  const P = [[x0, yBase]];
  for (let x = x0; x <= x0 + w; x += 20) P.push([x, yBase - 52 - 26 * Math.sin((x - x0) / 210) - 14 * Math.sin((x - x0) / 67 + 1)]);
  P.push([x0 + w, yBase]);
  poly(ctx, P); ctx.fillStyle = '#E4DCCA'; ctx.fill();
  hatchPath(ctx, () => poly(ctx, P), 6, 1, 'rgba(28,27,24,0.22)');
  ctx.beginPath(); P.slice(1, -1).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 1.6; ctx.strokeStyle = GRAPH; ctx.stroke();
  // sırttaki evler ve servi ağaçları (küçük, uzak)
  for (let x = x0 + 10; x < x0 + w - 20; x += 14 + r() * 22) {
    const top = yBase - 52 - 26 * Math.sin((x - x0) / 210) - 14 * Math.sin((x - x0) / 67 + 1);
    if (r() < 0.25) { ctx.beginPath(); ctx.ellipse(x, top + 2 - 9, 3, 11, 0, 0, TAU); ctx.fillStyle = 'rgba(28,27,24,0.55)'; ctx.fill(); continue; }
    const bw = 9 + r() * 12, bh = 8 + r() * 16, by = top + 6 + r() * 14;
    ctx.fillStyle = PAPER; ctx.fillRect(x, by - bh, bw, bh); ctx.lineWidth = 1; ctx.strokeStyle = GRAPH; ctx.strokeRect(x, by - bh, bw, bh);
    ctx.fillStyle = 'rgba(28,27,24,0.45)'; for (let wx = x + 2; wx < x + bw - 2; wx += 4) ctx.fillRect(wx, by - bh + 3, 1.6, 2.2);
  }
}

// ——— Dolmabahçe Sarayı deniz cephesi: kök = rıhtım çizgisinin ortası (y = su), genişlik w ———
// Uzun, alçak cephe; ortada yüksek tören salonu (Muayede Salonu) ve kubbesi, iki yanda kanatlar, sütun çiftleri,
// pencere sıraları; önde korkuluklu rıhtım. Ölçek: w ≈ 640 px (kare 0).
export function drawPalace(ctx, w) {
  const h = w / 640;  // birim
  ctx.save(); ctx.lineJoin = 'round';
  const lw = 1.3;
  // rıhtım duvarı ve korkuluk
  ctx.fillStyle = PAPER; ctx.fillRect(-w / 2 - 20 * h, -10 * h, w + 40 * h, 10 * h);
  hatchRect(ctx, -w / 2 - 20 * h, -10 * h, w + 40 * h, 10 * h, 3 * h, 0.8, 'rgba(28,27,24,0.45)');
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(-w / 2 - 20 * h, -10 * h, w + 40 * h, 10 * h);
  ctx.beginPath(); for (let x = -w / 2 - 18 * h; x < w / 2 + 20 * h; x += 4 * h) { ctx.moveTo(x, -10 * h); ctx.lineTo(x, -15 * h); } ctx.moveTo(-w / 2 - 20 * h, -15 * h); ctx.lineTo(w / 2 + 20 * h, -15 * h); ctx.lineWidth = 0.8; ctx.stroke();
  // blok tanımları: [x merkez, genişlik, yükseklik, kat]
  const blocks = [[-235, 170, 52, 2], [-110, 80, 60, 2], [0, 140, 84, 3], [110, 80, 60, 2], [235, 170, 52, 2]];
  for (const [cx, bw, bh, fl] of blocks) {
    const x = (cx - bw / 2) * h, y = -15 * h - bh * h, W_ = bw * h, H_ = bh * h;
    ctx.fillStyle = PAPER; ctx.fillRect(x, y, W_, H_); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeRect(x, y, W_, H_);
    // saçak ve kat silmeleri
    ctx.beginPath(); ctx.moveTo(x - 2 * h, y); ctx.lineTo(x + W_ + 2 * h, y); ctx.lineWidth = 2.2 * h; ctx.stroke();
    for (let f = 1; f < fl; f++) { const fy = y + (H_ * f) / fl; ctx.beginPath(); ctx.moveTo(x, fy); ctx.lineTo(x + W_, fy); ctx.lineWidth = 0.9; ctx.stroke(); }
    // pencereler (kemerli) ve aralarında sütun çiftleri
    const nWin = Math.round(bw / 13);
    for (let f = 0; f < fl; f++) {
      const fy0 = y + (H_ * f) / fl, fh = H_ / fl;
      for (let i = 0; i < nWin; i++) {
        const wx = x + (W_ * (i + 0.5)) / nWin, ww = (W_ / nWin) * 0.42, wy = fy0 + fh * 0.22, wh = fh * 0.58;
        ctx.beginPath(); ctx.moveTo(wx - ww / 2, wy + wh); ctx.lineTo(wx - ww / 2, wy + ww / 2); ctx.arc(wx, wy + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(wx + ww / 2, wy + wh); ctx.closePath();
        ctx.fillStyle = 'rgba(28,27,24,0.62)'; ctx.fill();
        const px = x + (W_ * i) / nWin; if (i > 0) { ctx.beginPath(); ctx.moveTo(px - 1.2 * h, fy0 + fh * 0.1); ctx.lineTo(px - 1.2 * h, fy0 + fh); ctx.moveTo(px + 1.2 * h, fy0 + fh * 0.1); ctx.lineTo(px + 1.2 * h, fy0 + fh); ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(28,27,24,0.7)'; ctx.stroke(); ctx.strokeStyle = INK; }
      }
    }
    // çatı korkuluğu
    ctx.beginPath(); for (let bx = x; bx <= x + W_; bx += 3 * h) { ctx.moveTo(bx, y); ctx.lineTo(bx, y - 3 * h); } ctx.moveTo(x, y - 3 * h); ctx.lineTo(x + W_, y - 3 * h); ctx.lineWidth = 0.6; ctx.stroke();
  }
  // tören salonu kubbesi (basık) ve fener
  const dy = -15 * h - 84 * h;
  ctx.beginPath(); ctx.moveTo(-52 * h, dy); ctx.bezierCurveTo(-48 * h, dy - 30 * h, 48 * h, dy - 30 * h, 52 * h, dy); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.moveTo(-52 * h, dy); ctx.bezierCurveTo(-48 * h, dy - 30 * h, 48 * h, dy - 30 * h, 52 * h, dy); ctx.closePath(); ctx.clip();
  ctx.beginPath(); for (let k = -6; k <= 6; k++) { ctx.moveTo(k * 8 * h, dy); ctx.quadraticCurveTo(k * 6 * h, dy - 20 * h, 0, dy - 24 * h); } ctx.lineWidth = 0.6; ctx.stroke(); ctx.restore();
  ctx.fillStyle = PAPER; ctx.fillRect(-4 * h, dy - 31 * h, 8 * h, 8 * h); ctx.strokeRect(-4 * h, dy - 31 * h, 8 * h, 8 * h);
  // giriş kapısı vurgusu (orta blokta üçgen alınlık)
  ctx.beginPath(); ctx.moveTo(-26 * h, -15 * h - 84 * h); ctx.lineTo(0, -15 * h - 96 * h); ctx.lineTo(26 * h, -15 * h - 84 * h); ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}

// ——— saat kulesi: kök = taban ortası; yükseklik size ———
export function drawClockTower(ctx, size, hh = 9, mm = 4) {
  const u = size / 100; ctx.save(); ctx.lineWidth = 1.3; ctx.strokeStyle = INK;
  const tiers = [[0, 22, 30], [30, 18, 28], [58, 14, 22]];
  for (const [y0, hw, th] of tiers) { ctx.fillStyle = PAPER; ctx.fillRect(-hw * u, -(y0 + th) * u, 2 * hw * u, th * u); ctx.strokeRect(-hw * u, -(y0 + th) * u, 2 * hw * u, th * u); ctx.beginPath(); ctx.moveTo(-hw * u - 2 * u, -(y0 + th) * u); ctx.lineTo(hw * u + 2 * u, -(y0 + th) * u); ctx.lineWidth = 2 * u; ctx.stroke(); ctx.lineWidth = 1.3; }
  ctx.fillStyle = 'rgba(28,27,24,0.6)'; ctx.fillRect(-5 * u, -20 * u, 10 * u, 14 * u);
  // kadran
  const cy = -45 * u, r = 9 * u; ctx.beginPath(); ctx.arc(0, cy, r, 0, TAU); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  const ah = ((hh % 12) + mm / 60) / 12 * TAU, am = mm / 60 * TAU;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(Math.sin(ah) * r * 0.55, cy - Math.cos(ah) * r * 0.55); ctx.moveTo(0, cy); ctx.lineTo(Math.sin(am) * r * 0.85, cy - Math.cos(am) * r * 0.85); ctx.lineWidth = 1.2; ctx.stroke();
  // tepe
  ctx.beginPath(); ctx.moveTo(-12 * u, -80 * u); ctx.quadraticCurveTo(0, -100 * u, 12 * u, -80 * u); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 1.3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -92 * u); ctx.lineTo(0, -102 * u); ctx.stroke();
  ctx.restore();
}

// ——— şehir hatları vapuru (yandan): kök = su hattı ortası; size = boy (px); dir = +1 sağa ———
export function drawFerry(ctx, size, dir = 1) {
  const u = size / 100; ctx.save(); ctx.scale(dir, 1); ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1, 1.4 * u / 2.4); ctx.strokeStyle = INK;
  // gövde: alt kısım koyu tarama, üst beyaz
  const hull = [[-50 * u, -9 * u], [46 * u, -9 * u], [50 * u, -12 * u], [44 * u, 0], [-45 * u, 0], [-52 * u, -12 * u]];
  poly(ctx, hull); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.save(); poly(ctx, hull); ctx.clip(); ctx.fillStyle = 'rgba(28,27,24,0.78)'; ctx.fillRect(-60 * u, -4.5 * u, 120 * u, 6 * u); ctx.restore();
  // üst yapı: iki güverte, pencere sıraları
  ctx.fillStyle = PAPER; ctx.fillRect(-38 * u, -19 * u, 74 * u, 10 * u); ctx.strokeRect(-38 * u, -19 * u, 74 * u, 10 * u);
  ctx.fillRect(-28 * u, -26 * u, 50 * u, 7 * u); ctx.strokeRect(-28 * u, -26 * u, 50 * u, 7 * u);
  ctx.fillStyle = 'rgba(28,27,24,0.6)';
  for (let x = -35 * u; x < 34 * u; x += 4.2 * u) ctx.fillRect(x, -16.5 * u, 2.4 * u, 3.6 * u);
  for (let x = -25 * u; x < 20 * u; x += 4.2 * u) ctx.fillRect(x, -24 * u, 2.4 * u, 2.6 * u);
  // kaptan köşkü ve baca
  ctx.fillStyle = PAPER; ctx.fillRect(14 * u, -31 * u, 10 * u, 5 * u); ctx.strokeRect(14 * u, -31 * u, 10 * u, 5 * u);
  ctx.beginPath(); ctx.moveTo(-6 * u, -26 * u); ctx.lineTo(-4 * u, -40 * u); ctx.lineTo(4 * u, -40 * u); ctx.lineTo(5 * u, -26 * u); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(28,27,24,0.85)'; ctx.fillRect(-4.2 * u, -40 * u, 8.2 * u, 3.5 * u);
  // direk ve küpeşte
  ctx.beginPath(); ctx.moveTo(-30 * u, -26 * u); ctx.lineTo(-30 * u, -38 * u); ctx.moveTo(-50 * u, -9 * u); ctx.lineTo(-50 * u, -12 * u); ctx.stroke();
  ctx.restore();
}
// baca dumanı: kök baca ağzı; k = 0..1 yoğunluk, ph = faz (sn), wind = sağa sapma
export function drawSmoke(ctx, size, ph, k = 1) {
  if (k <= 0.01) return; const u = size / 100;
  for (let i = 0; i < 6; i++) {
    const a = ((ph * 0.35 + i / 6) % 1), x = -a * 26 * u, y = -a * 22 * u, r = (2 + a * 7) * u;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = `rgba(139,133,119,${(0.42 * (1 - a) * k).toFixed(3)})`; ctx.fill();
  }
}

// ——— araba (yandan): kök = yol, ön-arka ortası; size = boy; wheel = teker dönüş açısı; kind = gövde biçimi ———
export function drawCar(ctx, size, wheel, kind = 0, dir = 1) {
  const u = size / 100; ctx.save(); ctx.scale(dir, 1); ctx.lineJoin = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = INK;
  const body = kind === 1
    ? [[-50, -8], [-49, -26], [-30, -28], [-18, -44], [26, -44], [36, -28], [50, -24], [50, -8]]          // hatchback
    : kind === 2
      ? [[-50, -8], [-50, -40], [-40, -46], [32, -46], [44, -30], [50, -26], [50, -8]]                     // minibüs
      : [[-50, -8], [-48, -24], [-30, -27], [-16, -42], [20, -42], [32, -27], [50, -22], [50, -8]];        // sedan
  poly(ctx, body.map(([x, y]) => [x * u, y * u])); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.save(); poly(ctx, body.map(([x, y]) => [x * u, y * u])); ctx.clip(); hatchRect(ctx, -60 * u, -20 * u, 120 * u, 12 * u, 4, 1, 'rgba(28,27,24,0.35)'); ctx.restore();
  // camlar
  const win = kind === 2 ? [[-44, -40, 72, 12]] : kind === 1 ? [[-15, -40, 18, 11], [6, -40, 19, 11]] : [[-13, -38, 15, 10], [5, -38, 15, 10]];
  ctx.fillStyle = 'rgba(28,27,24,0.55)'; for (const [x, y, w, h] of win) { ctx.fillRect(x * u, y * u, w * u, h * u); }
  ctx.beginPath(); ctx.moveTo(-2 * u, -27 * u); ctx.lineTo(-2 * u, -10 * u); ctx.lineWidth = 1; ctx.stroke();
  // tekerler
  for (const wx of [-30, 30]) {
    ctx.beginPath(); ctx.arc(wx * u, -8 * u, 10 * u, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    ctx.beginPath(); ctx.arc(wx * u, -8 * u, 5 * u, 0, TAU); ctx.fillStyle = PAPER; ctx.fill();
    ctx.beginPath(); for (let k = 0; k < 3; k++) { const a = wheel + (k * TAU) / 3; ctx.moveTo(wx * u, -8 * u); ctx.lineTo(wx * u + Math.cos(a) * 4.6 * u, -8 * u + Math.sin(a) * 4.6 * u); } ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
  }
  ctx.restore();
}

// ——— yürüyen insan (siluet, kimliksiz): kök = ayak hizası; size = boy; ph = adım fazı (rad); walk 0..1; bow 0..1 ———
export function drawWalker(ctx, size, ph, walk = 1, bow = 0, dir = 1, coat = 0) {
  const u = size / 100; ctx.save(); ctx.scale(dir, 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.fillStyle = INK;
  const sw = Math.sin(ph) * 22 * walk, bob = Math.abs(Math.cos(ph)) * 2 * walk;
  const hip = [0, -48 * u + bob * u], sh = [2 * u * bow, -82 * u + bob * u + 3 * u * bow];
  // bacaklar
  ctx.lineWidth = 7 * u;
  for (const s of [1, -1]) { const a = (sw * s * Math.PI) / 180; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(hip[0] + Math.sin(a) * 48 * u, hip[1] + Math.cos(a) * 48 * u); ctx.stroke(); }
  // gövde (palto)
  ctx.beginPath(); ctx.moveTo(sh[0] - 9 * u, sh[1]); ctx.lineTo(sh[0] + 9 * u, sh[1]); ctx.lineTo(hip[0] + 10 * u + coat * 4 * u, hip[1] + coat * 10 * u); ctx.lineTo(hip[0] - 10 * u - coat * 4 * u, hip[1] + coat * 10 * u); ctx.closePath(); ctx.fill();
  // kollar
  ctx.lineWidth = 6 * u;
  for (const s of [1, -1]) { const a = (-sw * s * 0.8 * Math.PI) / 180; ctx.beginPath(); ctx.moveTo(sh[0], sh[1] + 2 * u); ctx.lineTo(sh[0] + Math.sin(a) * 34 * u, sh[1] + 2 * u + Math.cos(a) * 34 * u); ctx.stroke(); }
  // baş: saygı duruşunda hafif öne eğik
  const hx = sh[0] + 5 * u * bow, hy = sh[1] - 11 * u + 3 * u * bow;
  ctx.beginPath(); ctx.ellipse(hx, hy, 8 * u, 9.5 * u, 0.25 * bow, 0, TAU); ctx.fill();
  ctx.restore();
}

// ——— martı: kök = gövde; size = kanat açıklığı; flap = faz (rad) ———
export function drawGull(ctx, size, flap) {
  const u = size / 100, f = Math.sin(flap);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.4, 4 * u);
  ctx.beginPath(); ctx.moveTo(-50 * u, -8 * u - f * 22 * u); ctx.quadraticCurveTo(-24 * u, -18 * u - f * 26 * u, 0, 0); ctx.quadraticCurveTo(24 * u, -18 * u - f * 26 * u, 50 * u, -8 * u - f * 22 * u); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 1 * u, 7 * u, 3.5 * u, 0, 0, TAU); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = Math.max(1, 2 * u); ctx.stroke();
  ctx.restore();
}

// ——— Türk bayrağı (düz görüntü, önbellekte): G = eni (yükseklik). Türk Bayrağı Kanunu Tüzüğü oranları:
// boy M = 1,5 G; uçkurluk L = 1/30 G (beyaz); dış ay merkezi uçkurluktan A = 1/2 G; dış ay çapı B = 1/2 G;
// iç ay merkezi dış ay merkezinden C = 1/16 G ileride; iç ay çapı D = 2/5 G; iç ay ile yıldız çemberi arası E = 1/3 G;
// yıldız çemberi çapı F = 1/4 G; yıldızın bir ucu aya bakar.
export function flagGeometry(G) {
  const L = G / 30, ox = L + G / 2, ix = ox + G / 16, ir = G / 5, sx = ix - ir + G / 3 + G / 8;
  return { M: 1.5 * G, L, outer: [ox, G / 2, G / 4], inner: [ix, G / 2, ir], star: [sx, G / 2, G / 8] };
}
export function drawFlatFlag(ctx, G) {
  const g = flagGeometry(G);
  ctx.save();
  ctx.fillStyle = '#F7F4EE'; ctx.fillRect(0, 0, g.L, G);
  ctx.fillStyle = FLAG_RED; ctx.fillRect(g.L, 0, g.M, G);
  // ay: dış daire beyaz, iç daire kırmızı
  ctx.beginPath(); ctx.arc(g.outer[0], g.outer[1], g.outer[2], 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.beginPath(); ctx.arc(g.inner[0], g.inner[1], g.inner[2], 0, TAU); ctx.fillStyle = FLAG_RED; ctx.fill();
  // yıldız: beş köşe, bir ucu sola (aya) bakar
  const [cx, cy, R] = g.star, r = R * 0.382;
  ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = Math.PI + (k * Math.PI) / 5, rr = k % 2 ? r : R; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.restore();
}
let flagCache = null;
function flagImage(G) {
  if (flagCache && flagCache.G === G) return flagCache.c;
  const c = document.createElement('canvas'); const g = flagGeometry(G); c.width = Math.ceil(g.M + g.L) + 2; c.height = Math.ceil(G) + 2;
  drawFlatFlag(c.getContext('2d'), G); flagCache = { G, c }; return c;
}
// dalgalanan bayrak: kök = gönderdeki üst köşe (uçkurluk); ph = rüzgâr fazı (rad)
export function drawWavingFlag(ctx, G, ph, amp = 1) {
  const img = flagImage(G), w = img.width - 2, strip = 2;
  for (let x = 0; x < w; x += strip) {
    const k = x / w, dy = Math.sin(ph - k * 5.2) * G * 0.07 * k * amp, sh = Math.cos(ph - k * 5.2) * k * amp;
    ctx.drawImage(img, x, 0, strip + 0.6, G, x, dy, strip + 0.6, G);
    if (sh !== 0) { ctx.fillStyle = sh > 0 ? `rgba(255,255,255,${(0.10 * sh).toFixed(3)})` : `rgba(28,27,24,${(-0.16 * sh).toFixed(3)})`; ctx.fillRect(x, dy, strip + 0.6, G); }
  }
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(28,27,24,0.5)';
  ctx.beginPath(); for (let x = 0; x <= w; x += strip) { const k = x / w; ctx.lineTo(x, Math.sin(ph - k * 5.2) * G * 0.07 * k * amp); } ctx.stroke();
  ctx.beginPath(); for (let x = 0; x <= w; x += strip) { const k = x / w; ctx.lineTo(x, G + Math.sin(ph - k * 5.2) * G * 0.07 * k * amp); } ctx.stroke();
}
// gönder: kök = taban; boy h
export function drawPole(ctx, h, k = 1) {
  ctx.save(); ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 1.6 * k; ctx.scale(k, 1);
  ctx.beginPath(); ctx.moveTo(-3.5, 0); ctx.lineTo(-2, -h); ctx.lineTo(2, -h); ctx.lineTo(3.5, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -h - 5, 5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillRect(-14, -8, 28, 8); ctx.strokeRect(-14, -8, 28, 8);
  ctx.restore();
}

// ——— saat kadranı (köşe saati ve odadaki saat aynı kadran): kök = merkez; r; saat/dakika/saniye (ondalık) ———
// secK: saniye ibresinin görünürlüğü (0..1); style: 0 sade duvar saati, 1 süslü masa saati kadranı
export function drawClockFace(ctx, r, hh, mm, ss, secK = 1, style = 0) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = '#F7F2E6'; ctx.fill(); ctx.lineWidth = Math.max(2, r * 0.035); ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, TAU); ctx.lineWidth = Math.max(1, r * 0.01); ctx.stroke();
  // dakika çentikleri ve saat işaretleri (Roma rakamı yerine çubuk: küçük ölçekte okunur)
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU, big = i % 5 === 0, r0 = big ? r * 0.74 : r * 0.84;
    ctx.beginPath(); ctx.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); ctx.lineTo(Math.sin(a) * r * 0.9, -Math.cos(a) * r * 0.9); ctx.lineWidth = big ? Math.max(2, r * 0.045) : Math.max(1, r * 0.012); ctx.stroke();
  }
  if (style === 1 && r > 60) {
    ctx.font = `600 ${Math.round(r * 0.136)}px "IBM Plex Mono"`; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    RN.forEach((s, i) => { const a = (i / 12) * TAU; ctx.fillText(s, Math.sin(a) * r * 0.54, -Math.cos(a) * r * 0.54); });
  }
  const ah = (((hh % 12) + mm / 60) / 12) * TAU, am = (mm / 60) * TAU, as = (ss / 60) * TAU;
  const hand = (a, len, w, back = 0.12) => { ctx.beginPath(); ctx.moveTo(-Math.sin(a) * r * back, Math.cos(a) * r * back); ctx.lineTo(Math.sin(a) * len, -Math.cos(a) * len); ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); };
  // süslü kadranda akrep rakamların iç yarıçapında biter
  hand(ah, r * (style === 1 && r > 60 ? 0.42 : 0.5), Math.max(3, r * 0.07)); hand(am, r * 0.76, Math.max(2.4, r * 0.045));
  if (secK > 0) { ctx.save(); ctx.globalAlpha *= secK; hand(as, r * 0.82, Math.max(1.2, r * 0.016), 0.2); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, Math.max(3, r * 0.05), 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
// masa saati gövdesi (kadranın çevresi): kök = kadran merkezi; r = kadran yarıçapı; k = görünürlük
export function drawMantelCase(ctx, r, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, r * 0.025);
  // gövde: kemerli tepe, geniş kaide, ayaklar
  const P = () => { ctx.beginPath(); ctx.moveTo(-r * 1.35, r * 1.5); ctx.lineTo(-r * 1.35, -r * 0.2); ctx.bezierCurveTo(-r * 1.35, -r * 1.55, r * 1.35, -r * 1.55, r * 1.35, -r * 0.2); ctx.lineTo(r * 1.35, r * 1.5); ctx.closePath(); };
  P(); ctx.fillStyle = '#E2D8C2'; ctx.fill();
  ctx.save(); P(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = -r * 2; x < r * 2; x += 7) { ctx.moveTo(x, r * 1.6); ctx.lineTo(x + r * 0.5, -r * 1.6); } ctx.stroke(); ctx.restore();
  P(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 1.12, 0, TAU); ctx.fillStyle = '#EDE5D2'; ctx.fill(); ctx.stroke();
  // kaide ve ayaklar
  ctx.fillStyle = '#E2D8C2'; ctx.fillRect(-r * 1.55, r * 1.5, r * 3.1, r * 0.22); ctx.strokeRect(-r * 1.55, r * 1.5, r * 3.1, r * 0.22);
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 1.3, r * 1.8, r * 0.16, r * 0.09, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill(); }
  // tepe süsü
  ctx.beginPath(); ctx.arc(0, -r * 1.22, r * 0.12, 0, TAU); ctx.fillStyle = '#E2D8C2'; ctx.fill(); ctx.stroke();
  // ön panel çizgileri
  ctx.beginPath(); ctx.moveTo(-r * 1.15, r * 1.32); ctx.lineTo(r * 1.15, r * 1.32); ctx.stroke();
  ctx.restore();
}
// oda levhası: duvar panelleri, perde, konsol; kök = sahne merkezi (cx, cy), w × h; k = görünürlük; ph = toz fazı
export function drawRoom(ctx, cx, cy, w, h, k, ph) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k;
  const x0 = cx - w / 2, y0 = cy - h / 2;
  ctx.fillStyle = '#E9E1CF'; ctx.fillRect(x0, y0, w, h);
  // duvar panelleri
  ctx.strokeStyle = 'rgba(28,27,24,0.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const px = x0 + 60 + i * (w - 120) / 4; ctx.strokeRect(px + 14, y0 + 70, (w - 120) / 4 - 28, h * 0.5); ctx.strokeRect(px + 26, y0 + 82, (w - 120) / 4 - 52, h * 0.5 - 24); }
  hatchRect(ctx, x0, y0, w, h * 0.62, 9, 1, 'rgba(28,27,24,0.08)');
  // pencere ışığı (sağ üstten eğik huzme) ve içinde yüzen toz
  ctx.save(); ctx.beginPath(); ctx.moveTo(cx + w * 0.22, y0); ctx.lineTo(cx + w * 0.45, y0); ctx.lineTo(cx - w * 0.05, y0 + h); ctx.lineTo(cx - w * 0.3, y0 + h); ctx.closePath(); ctx.fillStyle = 'rgba(255,252,240,0.38)'; ctx.fill(); ctx.clip();
  const r = mulberry(1105); for (let i = 0; i < 70; i++) { const bx = x0 + r() * w, by = y0 + r() * h, s = 1 + r() * 2.2, f = r() * TAU; const x = bx + Math.sin(ph * 0.5 + f) * 14, y = by - ((ph * 9 + r() * h) % h) * 0.25; ctx.fillStyle = 'rgba(28,27,24,0.35)'; ctx.fillRect(x, y, s, s); }
  ctx.restore();
  // ağır perde (solda), kıvrımlar tarama
  const cw = w * 0.17; ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + cw, y0); ctx.quadraticCurveTo(x0 + cw * 0.6 + Math.sin(ph * 0.6) * 6, y0 + h * 0.5, x0 + cw * 0.9, y0 + h); ctx.lineTo(x0, y0 + h); ctx.closePath(); ctx.fillStyle = '#D9CEB6'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); ctx.clip();
  ctx.strokeStyle = 'rgba(28,27,24,0.4)'; ctx.lineWidth = 1.4; for (let i = 1; i < 7; i++) { const fx = x0 + (cw * i) / 7; ctx.beginPath(); ctx.moveTo(fx, y0); ctx.quadraticCurveTo(fx - 10 + Math.sin(ph * 0.6 + i) * 4, y0 + h * 0.5, fx + 6, y0 + h); ctx.stroke(); }
  ctx.restore();
  // konsol masası
  const ty = cy + h * 0.2; ctx.fillStyle = '#DCD1B8'; ctx.fillRect(x0 + w * 0.2, ty, w * 0.6, 26); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(x0 + w * 0.2, ty, w * 0.6, 26);
  ctx.fillRect(x0 + w * 0.24, ty + 26, w * 0.52, 40); ctx.strokeRect(x0 + w * 0.24, ty + 26, w * 0.52, 40);
  for (const lx of [x0 + w * 0.27, x0 + w * 0.73]) { ctx.beginPath(); ctx.moveTo(lx, ty + 66); ctx.quadraticCurveTo(lx + (lx < cx ? -14 : 14), ty + h * 0.2, lx, y0 + h); ctx.lineWidth = 6; ctx.stroke(); }
  ctx.restore();
}

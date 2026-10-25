// "İlan" (052) öğeleri: tek çizim fonksiyonları, dondurulmuş ölçüler. Gravür dili: mürekkep çizgi, kâğıt dolgu, tarama.
// Bina cephesi Ulus'taki Birinci Meclis binasının 1920'ler fotoğraflarına göre (assets/052/SOURCE.md): yontma taş yüksek
// bodrum, tek ana kat, kemerli ikili pencereler, öne çıkan orta bölüm (üçlü kemer, kendi yüksek kırma çatısı), geniş
// saçaklı alçak kiremit çatı, çatı ortasında bayrak direği, önde merdiven.

export const INK = '#1C1B18', PAPER = '#ECE5D5', GRAPHITE = '#8B8577', LIGHT = '#FAF6EC', NIGHT = '#24231F', NIGHT2 = '#33312C';

// ——— bina: kök = zemin ortası; genişlik w; lit 0..1 pencere ışığı; ph: titreme fazı; flagWave ———
// sivri (ogival) kemer: iki yay; tepe yüksekliği ≈ 0,6 × genişlik (LoC 1920 fotoğrafı). p: Path2D ya da ctx
export const ARCH_RISE = 0.6;
export function pointedArch(p, x0, x1, ys) {
  const w = x1 - x0, cx = (x0 + x1) / 2, h = ARCH_RISE * w;
  p.lineTo(x0, ys); p.bezierCurveTo(x0, ys - 0.62 * h, cx - 0.2 * w, ys - 0.9 * h, cx, ys - h); p.bezierCurveTo(cx + 0.2 * w, ys - 0.9 * h, x1, ys - 0.62 * h, x1, ys);
}
export const BUILDING_CARD = Object.freeze({
  base: 0.085, floor: 0.175, cornice: 0.016, roof: 0.075, bayW: 0.3, bayRoof: 0.11, eave: 0.03,
  wingWin: 5, stroke: 0.0026,
});
export function windowRects(w) {
  const K = BUILDING_CARD, H0 = K.base * w, H1 = K.floor * w, out = [];
  const wingW = (w - K.bayW * w) / 2;
  // kanatlar: tek, kemerli, aralıklı pencereler (1920 ve 1930'lar fotoğrafları); sıra: sol kanat, sağ kanat, orta bölüm
  for (const side of [-1, 1]) for (let i = 0; i < K.wingWin; i++) {
    const cx = side * (K.bayW * w / 2 + wingW * (i + 0.5) / K.wingWin);
    out.push({ x: cx, y: -H0 - H1 * 0.8, ww: w * 0.034, hh: H1 * 0.62, bay: false });
  }
  for (const d of [-1, 0, 1]) out.push({ x: d * w * 0.075, y: d ? -H0 - H1 * 0.84 : -H0 - H1 * 0.9, ww: w * (d ? 0.042 : 0.05), hh: d ? H1 * 0.66 : H1 * 0.9, bay: true, door: !d });
  return out;
}
export function drawBuilding(ctx, w, lit = 1, ph = 0) {
  const K = BUILDING_CARD, H0 = K.base * w, H1 = K.floor * w, Hc = K.cornice * w, lw = Math.max(1, K.stroke * w);
  const bay = K.bayW * w, top = -H0 - H1;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = INK;
  // çatı (kanatlar): alçak kırma, geniş saçak
  const ev = K.eave * w;
  ctx.beginPath(); ctx.moveTo(-w / 2 - ev, top - Hc); ctx.lineTo(-w / 2 + w * 0.09, top - Hc - K.roof * w); ctx.lineTo(w / 2 - w * 0.09, top - Hc - K.roof * w); ctx.lineTo(w / 2 + ev, top - Hc); ctx.closePath();
  ctx.fillStyle = '#B9AE98'; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.beginPath(); for (let x = -w / 2 - ev; x < w / 2 + ev; x += w * 0.011) { ctx.moveTo(x, top - Hc); ctx.lineTo(x + w * 0.02, top - Hc - K.roof * w); } ctx.lineWidth = lw * 0.6; ctx.stroke(); ctx.restore();
  // bacalar
  for (const x of [-w * 0.4, -w * 0.24, w * 0.22, w * 0.38]) { ctx.fillStyle = PAPER; ctx.fillRect(x, top - Hc - K.roof * w * 0.95, w * 0.018, K.roof * w * 0.55); ctx.strokeRect(x, top - Hc - K.roof * w * 0.95, w * 0.018, K.roof * w * 0.55); }
  // orta bölümün çatısı (daha yüksek)
  ctx.beginPath(); ctx.moveTo(-bay / 2 - ev, top - Hc - w * 0.004); ctx.lineTo(-bay * 0.18, top - Hc - K.bayRoof * w); ctx.lineTo(bay * 0.18, top - Hc - K.bayRoof * w); ctx.lineTo(bay / 2 + ev, top - Hc - w * 0.004); ctx.closePath();
  ctx.fillStyle = '#A99E88'; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.beginPath(); for (let x = -bay; x < bay; x += w * 0.011) { ctx.moveTo(x, top - Hc); ctx.lineTo(x + w * 0.025, top - Hc - K.bayRoof * w); } ctx.lineWidth = lw * 0.6; ctx.stroke(); ctx.restore();
  // saçak/korniş
  ctx.fillStyle = PAPER; ctx.fillRect(-w / 2 - ev * 0.6, top - Hc, w + ev * 1.2, Hc); ctx.strokeRect(-w / 2 - ev * 0.6, top - Hc, w + ev * 1.2, Hc);
  // ana kat duvarı (düz taş) ve bodrum (kaba yontma taş sıraları)
  ctx.fillStyle = '#E2D9C5'; ctx.fillRect(-w / 2, top, w, H1); ctx.strokeRect(-w / 2, top, w, H1);
  ctx.fillStyle = '#D3C8B1'; ctx.fillRect(-w / 2, -H0, w, H0); ctx.strokeRect(-w / 2, -H0, w, H0);
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -H0, w, H0); ctx.clip(); ctx.beginPath();
  const course = H0 / 4;
  for (let r = 1; r < 4; r++) { ctx.moveTo(-w / 2, -H0 + r * course); ctx.lineTo(w / 2, -H0 + r * course); }
  for (let r = 0; r < 4; r++) for (let x = -w / 2 + (r % 2 ? w * 0.02 : 0); x < w / 2; x += w * 0.04) { ctx.moveTo(x, -H0 + r * course); ctx.lineTo(x, -H0 + (r + 1) * course); }
  ctx.lineWidth = lw * 0.7; ctx.stroke(); ctx.restore();
  // ana kat taş derzleri (ince)
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, top, w, H1); ctx.clip(); ctx.beginPath();
  for (let y = top + H1 / 7; y < -H0; y += H1 / 7) { ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); }
  ctx.strokeStyle = 'rgba(28,27,24,0.22)'; ctx.lineWidth = lw * 0.5; ctx.stroke(); ctx.restore();
  // saçak altı ahşap konsollar (fotoğraflardaki koyu dirsekler)
  for (let x = -w / 2 + w * 0.02; x <= w / 2 - w * 0.02; x += w * 0.055) { ctx.beginPath(); ctx.moveTo(x - w * 0.006, top); ctx.lineTo(x + w * 0.006, top); ctx.lineTo(x, top + w * 0.022); ctx.closePath(); ctx.fillStyle = '#5A4E3E'; ctx.fill(); }
  // orta bölüm (öne çıkan): yan yüzler tarama
  ctx.fillStyle = '#E7DFCC'; ctx.fillRect(-bay / 2, top - w * 0.004, bay, H1 + H0 + w * 0.004); ctx.strokeRect(-bay / 2, top - w * 0.004, bay, H1 + H0 + w * 0.004);
  for (const s of [-1, 1]) { ctx.save(); ctx.beginPath(); ctx.rect(s < 0 ? -bay / 2 - w * 0.012 : bay / 2, top, w * 0.012, H1 + H0); ctx.fillStyle = '#BDB29C'; ctx.fill(); ctx.stroke(); ctx.restore(); }
  // bodrum pencereleri (küçük)
  for (const r of windowRects(w)) { if (r.bay) continue; ctx.fillStyle = NIGHT2; ctx.fillRect(r.x - r.ww * 0.45, -H0 * 0.66, r.ww * 0.9, H0 * 0.34); ctx.strokeRect(r.x - r.ww * 0.45, -H0 * 0.66, r.ww * 0.9, H0 * 0.34); }
  // pencereler: kemerli, taş çerçeveli; ışık (titreşen, kişiye göre sabit faz)
  windowRects(w).forEach((r, i) => {
    const rise = ARCH_RISE * r.ww, x0 = r.x - r.ww / 2, y1 = r.y + r.hh, ys = r.y + rise;
    const path = () => { ctx.beginPath(); ctx.moveTo(x0, y1); pointedArch(ctx, x0, x0 + r.ww, ys); ctx.lineTo(x0 + r.ww, y1); ctx.closePath(); };
    // taş çerçeve
    ctx.save(); ctx.translate(r.x, (r.y + y1) / 2); ctx.scale(1.28, 1.08); ctx.translate(-r.x, -(r.y + y1) / 2); path(); ctx.fillStyle = '#CFC4AC'; ctx.fill(); ctx.lineWidth = lw * 0.8; ctx.stroke(); ctx.restore();
    const li = typeof lit === 'function' ? lit(i) : lit;
    const fl = li * (0.86 + 0.14 * Math.sin(ph * 2 + i * 1.7) * Math.sin(ph + i));   // ph: dikişte tam tur
    path(); ctx.fillStyle = mix(NIGHT2, LIGHT, fl); ctx.fill(); ctx.stroke();
    // kayıt (pencere kolları)
    // kayıt: orta dikme, kemer içinde iki küçük sivri kemer, yatay kayıt
    const m = r.ww * 0.12; ctx.beginPath(); ctx.moveTo(r.x, ys - rise * 0.2); ctx.lineTo(r.x, y1);
    ctx.moveTo(x0 + m, ys + rise * 0.15); pointedArch(ctx, x0 + m, r.x, ys + rise * 0.15); ctx.moveTo(r.x, ys + rise * 0.15); pointedArch(ctx, r.x, x0 + r.ww - m, ys + rise * 0.15);
    ctx.moveTo(x0, ys + (y1 - ys) * 0.42); ctx.lineTo(x0 + r.ww, ys + (y1 - ys) * 0.42); ctx.lineWidth = lw * 0.7; ctx.stroke();
  });
  // giriş merdiveni
  for (let s = 0; s < 4; s++) { const sw = bay * (0.42 + s * 0.06), sy = -H0 + s * H0 / 4; ctx.fillStyle = PAPER; ctx.fillRect(-sw / 2, sy, sw, H0 / 4); ctx.strokeRect(-sw / 2, sy, sw, H0 / 4); }
  ctx.restore();
}
// bayrak direği ve bayrak (çatı ortası): kök = direğin dibi
export function drawRoofFlag(ctx, h, wave) {   // bayrak raptiyesiz
  ctx.save(); ctx.lineWidth = Math.max(1.2, h * 0.02); ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.stroke();
  ctx.translate(0, -h); drawFlagPlain(ctx, h * 0.3, wave, 0.05);
  ctx.restore();
}
// ——— Türk bayrağı (raptiyesiz): kök = sol üst (direk tarafı); G = yükseklik; 3:2; ay ve yıldız tüzük oranlarına yakın ———
export function drawFlagPlain(ctx, G, wave = 0, amp = 0.02) {
  ctx.save();
  const Lx = 1.5 * G, N = 24, dy = x => amp * G * Math.sin(wave + (x / Lx) * 5.2) * (x / Lx);
  ctx.beginPath();
  for (let i = 0; i <= N; i++) { const x = (i / N) * Lx; i ? ctx.lineTo(x, dy(x)) : ctx.moveTo(x, dy(x)); }
  for (let i = N; i >= 0; i--) { const x = (i / N) * Lx; ctx.lineTo(x, G + dy(x)); }
  ctx.closePath(); ctx.fillStyle = '#E30A17'; ctx.fill(); ctx.lineWidth = Math.max(1, G * 0.02); ctx.strokeStyle = INK; ctx.stroke();
  const cx = 0.5 * G; ctx.save(); ctx.translate(0, dy(0.85 * G));
  ctx.beginPath(); ctx.arc(cx, 0.5 * G, 0.25 * G, 0, Math.PI * 2); ctx.arc(cx + 0.0625 * G, 0.5 * G, 0.2 * G, 0, Math.PI * 2, true); ctx.fillStyle = '#FFFFFF'; ctx.fill('evenodd');
  const sx = cx + 0.0625 * G + 0.2 * G + 0.333 * G + 0.125 * G, R = 0.125 * G, r2 = R * 0.382; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = Math.PI + (i * Math.PI) / 5, rr = i % 2 ? r2 : R; const x = sx + Math.cos(a) * rr, y = 0.5 * G + Math.sin(a) * rr; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
}
const mix = (a, b, u) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * u)).join(',')})`; };
export { mix };

// ——— telgraf direği: kök = dip; h yükseklik ———
export function drawPole(ctx, h, n = 4) {   // n = 2: yalnız üst kolda iki izolatör
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.5, h * 0.022);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.stroke();
  for (const [y, w] of (n === 2 ? [[-h * 0.94, h * 0.2]] : [[-h * 0.94, h * 0.2], [-h * 0.82, h * 0.15]])) {
    ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y); ctx.stroke();
    for (const x of (n === 2 ? [-w * 0.85, w * 0.85] : [-w * 0.85, -w * 0.3, w * 0.3, w * 0.85])) { ctx.beginPath(); ctx.arc(x, y - h * 0.018, h * 0.012, 0, Math.PI * 2); ctx.fillStyle = LIGHT; ctx.fill(); ctx.lineWidth = Math.max(1, h * 0.008); ctx.stroke(); ctx.lineWidth = Math.max(1.5, h * 0.022); }
  }
  ctx.restore();
}
export function poleTops(h) { const o = []; for (const [y, w] of [[-h * 0.94, h * 0.2], [-h * 0.82, h * 0.15]]) for (const x of [-w * 0.85, -w * 0.3, w * 0.3, w * 0.85]) o.push([x, y - h * 0.03]); return o; }

// ——— milletvekili (arkadan, yüksekten): kök = sandalye oturağı; u = ölçek; kind 0 kalpak, 1 fes, 2 başı açık; stand 0..1 ———
export const DEPUTY_CARD = Object.freeze({ head: 0.27, shoulder: 0.46, body: 0.4, stroke: 0.035 });
export function drawDeputy(ctx, u, kind, stand = 0, tone = 0) {
  const K = DEPUTY_CARD, lw = Math.max(0.8, K.stroke * u);
  ctx.save(); ctx.translate(0, -stand * u * 0.34); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  // gövde (ceket): yuvarlak omuzlu yamuk
  const sw = K.shoulder * u, bh = K.body * u + stand * u * 0.3;
  ctx.beginPath(); ctx.moveTo(-sw / 2, 0 + stand * u * 0.3); ctx.lineTo(-sw / 2, -bh * 0.55); ctx.quadraticCurveTo(-sw / 2, -bh, -sw * 0.18, -bh); ctx.lineTo(sw * 0.18, -bh); ctx.quadraticCurveTo(sw / 2, -bh, sw / 2, -bh * 0.55); ctx.lineTo(sw / 2, stand * u * 0.3); ctx.closePath();
  ctx.fillStyle = tone ? '#5E5A51' : '#4A4740'; ctx.fill(); ctx.stroke();
  // yaka
  ctx.beginPath(); ctx.moveTo(-sw * 0.12, -bh); ctx.lineTo(0, -bh * 0.82); ctx.lineTo(sw * 0.12, -bh); ctx.strokeStyle = '#6F6A60'; ctx.lineWidth = lw * 0.7; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = lw;
  // baş (ense): ten rengi kâğıt
  const hr = K.head * u * 0.5, hy = -bh - hr * 0.85;
  ctx.beginPath(); ctx.arc(0, hy, hr, 0, Math.PI * 2); ctx.fillStyle = '#D9C9AE'; ctx.fill(); ctx.stroke();
  if (kind === 0) {   // kalpak: koyu, hafif genişleyen silindir, tarama
    ctx.beginPath(); ctx.moveTo(-hr * 1.02, hy - hr * 0.2); ctx.lineTo(-hr * 1.12, hy - hr * 1.9); ctx.quadraticCurveTo(0, hy - hr * 2.15, hr * 1.12, hy - hr * 1.9); ctx.lineTo(hr * 1.02, hy - hr * 0.2); ctx.closePath();
    ctx.fillStyle = '#2A2824'; ctx.fill(); ctx.stroke();
  } else if (kind === 1) {   // fes: kesik koni, püskül
    ctx.beginPath(); ctx.moveTo(-hr * 0.95, hy - hr * 0.3); ctx.lineTo(-hr * 0.72, hy - hr * 1.75); ctx.lineTo(hr * 0.72, hy - hr * 1.75); ctx.lineTo(hr * 0.95, hy - hr * 0.3); ctx.closePath();
    ctx.fillStyle = '#5A3A30'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, hy - hr * 1.75); ctx.quadraticCurveTo(hr * 0.5, hy - hr * 1.6, hr * 0.62, hy - hr * 0.9); ctx.lineWidth = lw * 0.8; ctx.stroke();
  } else {   // başı açık: saç tarama
    ctx.beginPath(); ctx.arc(0, hy, hr, Math.PI * 1.02, Math.PI * 1.98); ctx.fillStyle = '#3A352E'; ctx.fill();
  }
  ctx.restore();
}

// ——— sıra (masa) arkadan: kök = sıranın arka kenarı ortası; w genişlik ———
export function drawBench(ctx, w, h) {
  ctx.save(); ctx.lineWidth = Math.max(1, w * 0.008); ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.rect(-w / 2, -h, w, h); ctx.fillStyle = '#9C8F78'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.55); ctx.lineTo(w / 2, -h * 0.55); ctx.lineWidth = Math.max(0.8, w * 0.004); ctx.stroke();
  ctx.restore();
}

// ——— oy sandığı: kök = taban ortası ———
export function drawUrn(ctx, w) {
  const h = w * 0.7; ctx.save(); ctx.lineWidth = Math.max(1.2, w * 0.02); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.rect(-w / 2, -h, w, h); ctx.fillStyle = '#8E7A5C'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2 - w * 0.05, -h); ctx.lineTo(-w / 2 + w * 0.08, -h - w * 0.14); ctx.lineTo(w / 2 - w * 0.08, -h - w * 0.14); ctx.lineTo(w / 2 + w * 0.05, -h); ctx.closePath(); ctx.fillStyle = '#A28E6E'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(-w * 0.18, -h - w * 0.085, w * 0.36, w * 0.025);
  ctx.beginPath(); for (let y = -h + h * 0.2; y < 0; y += h * 0.2) { ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); } ctx.lineWidth = Math.max(0.6, w * 0.006); ctx.stroke();
  ctx.restore();
}
export function drawBallot(ctx, s, rot) {
  ctx.save(); ctx.rotate(rot); ctx.fillStyle = LIGHT; ctx.fillRect(-s / 2, -s * 0.35, s, s * 0.7); ctx.lineWidth = Math.max(0.8, s * 0.06); ctx.strokeStyle = INK; ctx.strokeRect(-s / 2, -s * 0.35, s, s * 0.7);
  ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.08); ctx.lineTo(s * 0.3, -s * 0.08); ctx.moveTo(-s * 0.3, s * 0.12); ctx.lineTo(s * 0.15, s * 0.12); ctx.lineWidth = Math.max(0.6, s * 0.04); ctx.stroke();
  ctx.restore();
}

// ——— saat (kâğıt madalyon): kök = merkez; minutesOfDay = saat × 60 + dakika ———
export function drawClock(ctx, r, minutesOfDay) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = LIGHT; ctx.fill(); ctx.lineWidth = r * 0.05; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.lineWidth = r * 0.012; ctx.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r0 = i % 5 ? r * 0.82 : r * 0.74; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); ctx.lineTo(Math.sin(a) * r * 0.88, -Math.cos(a) * r * 0.88); ctx.lineWidth = i % 5 ? r * 0.012 : r * 0.035; ctx.stroke(); }
  const m = ((minutesOfDay % 720) + 720) % 720, ha = m / 720 * Math.PI * 2, ma = (m % 60) / 60 * Math.PI * 2;
  ctx.beginPath(); ctx.moveTo(-Math.sin(ha) * r * 0.1, Math.cos(ha) * r * 0.1); ctx.lineTo(Math.sin(ha) * r * 0.5, -Math.cos(ha) * r * 0.5); ctx.lineWidth = r * 0.07; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-Math.sin(ma) * r * 0.12, Math.cos(ma) * r * 0.12); ctx.lineTo(Math.sin(ma) * r * 0.76, -Math.cos(ma) * r * 0.76); ctx.lineWidth = r * 0.04; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.05, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// ——— yorum balonu (boş): kök = sivri ucu ———
export function drawBubble(ctx, s) {
  ctx.save(); ctx.lineWidth = Math.max(1.5, s * 0.07); ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  const w = s * 1.5, h = s, y = -s * 0.28 - h;
  ctx.beginPath(); ctx.moveTo(-w / 2 + h * 0.3, y); ctx.lineTo(w / 2 - h * 0.3, y); ctx.quadraticCurveTo(w / 2, y, w / 2, y + h * 0.3); ctx.lineTo(w / 2, y + h * 0.7); ctx.quadraticCurveTo(w / 2, y + h, w / 2 - h * 0.3, y + h);
  ctx.lineTo(s * 0.12, y + h); ctx.lineTo(0, 0); ctx.lineTo(-s * 0.18, y + h); ctx.lineTo(-w / 2 + h * 0.3, y + h); ctx.quadraticCurveTo(-w / 2, y + h, -w / 2, y + h * 0.7); ctx.lineTo(-w / 2, y + h * 0.3); ctx.quadraticCurveTo(-w / 2, y, -w / 2 + h * 0.3, y); ctx.closePath();
  ctx.fillStyle = LIGHT; ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.arc(d * s * 0.32, y + h / 2, s * 0.07, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

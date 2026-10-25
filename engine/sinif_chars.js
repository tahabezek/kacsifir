// "Sınıf" nesneleri (050): üstten sıra, öğrenci, gaz lambası, kitap/defter, kara tahta, Türk bayrağı, uzaktan sınıf
// simgesi. Her biri tek çizim fonksiyonu; gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yalnız bayrakta
// (bayrak yalnız dorukta görünür).
const INK = '#1C1B18', PAPER = '#F4EEE1', LIGHT = '#FAF6EC', GRAPH = '#8B8577', SLATE = '#2A2A26', CHALK = '#ECE8DC';
export const FLAG_RED = '#E30A17';

function hatch(ctx, clip, gap, ang, lw, col = INK, ext = 2) {
  ctx.save(); clip(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
  for (let d = -ext; d < ext; d += gap) { ctx.moveTo(dy * d - dx * ext, -dx * d - dy * ext); ctx.lineTo(dy * d + dx * ext, -dx * d + dy * ext); }
  ctx.stroke(); ctx.restore();
}

// ——— karakter kartı: üstten öğrenci (birim = sıra aralığı u). Baş = 0,2u ———
export const STUDENT_CARD = Object.freeze({
  name: 'üstten öğrenci: omuz 0,46u, baş 0,2u, burun tahtaya bakar', shoulder: [0.23, 0.11], head: 0.1, stroke: 0.022,
  palette: { ink: INK, paper: PAPER, hair: INK },
});
// pose: { girl: 0..1 (örgüler), read: 0..1 (kitaba eğilme) }
export function drawStudent(ctx, card, pose, u) {
  ctx.save(); ctx.scale(u, u); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.1 / u), [sx, sy] = card.shoulder, lean = (pose.read || 0) * 0.035;
  ctx.translate(0, -lean);
  // örgüler (kızlar): sırtta iki kısa örgü, başın arkasından
  const g = pose.girl || 0;
  if (g > 0.01) {
    ctx.save(); ctx.globalAlpha *= g;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 0.05, 0.03); ctx.quadraticCurveTo(s * 0.12, 0.05, s * (0.1 + 0.07 * g), 0.06 + 0.06 * g); ctx.lineWidth = lw * 3.6; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.restore();
  }
  // omuzlar
  ctx.beginPath(); ctx.ellipse(0, 0.035, sx, sy, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  hatch(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 0.035, sx, sy, 0, 0, Math.PI); }, 0.03, 70, lw * 0.6, INK, 0.4);
  // kollar sıraya uzanır
  ctx.beginPath(); ctx.moveTo(-sx * 0.8, -0.01); ctx.lineTo(-sx * 0.55, -0.1); ctx.moveTo(sx * 0.8, -0.01); ctx.lineTo(sx * 0.55, -0.1); ctx.lineWidth = lw * 1.4; ctx.stroke();
  // baş ve saç (üstten: saç başın arka yarısı)
  ctx.beginPath(); ctx.arc(0, -0.005, card.head, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -0.005, card.head - lw * 0.4, Math.PI * -0.08, Math.PI * 1.08); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// ——— sıra (üstten): genişlik w, derinlik h; kök sıranın ortası ———
export function drawDesk(ctx, w, h) {
  ctx.save(); ctx.lineJoin = 'round';
  const lw = Math.max(1, w * 0.018);
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fillStyle = PAPER; ctx.fill();
  hatch(ctx, () => { ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); }, Math.max(2.2, w * 0.05), 0, lw * 0.5, 'rgba(28,27,24,0.35)', w);
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK; ctx.stroke();
  // ön kenar gölgesi
  ctx.beginPath(); ctx.moveTo(-w / 2, h / 2 + lw * 1.4); ctx.lineTo(w / 2, h / 2 + lw * 1.4); ctx.lineWidth = lw * 1.6; ctx.stroke();
  ctx.restore();
}

// ——— kitap: kapalı (taralı kapak) ya da açık (iki sayfa, satırlar); kök orta. open 0..1 ———
export function drawBook(ctx, w, open) {
  ctx.save(); ctx.lineJoin = 'round';
  const h = w * 0.62, lw = Math.max(0.9, w * 0.035);
  if (open < 0.5) {
    const k = 1 - open * 2, bw = w * 0.5;
    ctx.beginPath(); ctx.rect(-bw / 2, -h / 2, bw, h); ctx.fillStyle = PAPER; ctx.fill();
    hatch(ctx, () => { ctx.beginPath(); ctx.rect(-bw / 2, -h / 2, bw, h); }, Math.max(1.6, w * 0.06), 45, lw * 0.6, INK, w);
    ctx.beginPath(); ctx.rect(-bw / 2, -h / 2, bw, h); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    ctx.globalAlpha *= k;
  } else {
    const o = (open - 0.5) * 2;
    for (const s of [-1, 1]) {
      const pw = w / 2 * (0.4 + 0.6 * o);
      ctx.beginPath(); ctx.rect(s < 0 ? -pw : 0, -h / 2, pw, h); ctx.fillStyle = LIGHT; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); for (let i = 1; i <= 4; i++) { const y = -h / 2 + h * i / 5.2; ctx.moveTo(s < 0 ? -pw * 0.86 : pw * 0.14, y); ctx.lineTo(s < 0 ? -pw * 0.14 : pw * 0.86, y); } ctx.lineWidth = lw * 0.6; ctx.stroke();
    }
  }
  ctx.restore();
}

// ——— gaz lambası (üstten): taban halkası, cam şişe, fitil; lit 0..1, flick: alev titreşimi ———
export function drawLamp(ctx, r, lit, flick = 0) {
  ctx.save();
  const lw = Math.max(0.9, r * 0.12);
  if (lit > 0.01) {
    // ışık halkası: kısa ışın çizgileri (parlama yok; gravür ışını)
    ctx.save(); ctx.globalAlpha *= lit; ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.6; ctx.beginPath();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.13, r0 = r * 1.5, r1 = r * (2.3 + 0.25 * Math.sin(i * 2.3 + flick)); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); }
    ctx.stroke(); ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = lit > 0.5 ? LIGHT : PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.lineWidth = lw * 0.8; ctx.stroke();
  if (lit > 0.01) {
    // alev: ortada mürekkep damla (üstten bakışta küçük, titreşen)
    const fr = r * 0.34 * lit * (1 + 0.12 * Math.sin(flick * 7.3));
    ctx.beginPath(); ctx.arc(0, 0, fr, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); ctx.save(); ctx.clip(); hatch(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2); }, Math.max(1.4, r * 0.22), 45, lw * 0.5, INK, r); ctx.restore();
  }
  ctx.restore();
}

// ——— kara tahta: koyu yüzey, ahşap çerçeve, tebeşir oluğu; kök sol üst ———
export function drawBoard(ctx, w, h) {
  ctx.save();
  const f = 10;
  ctx.beginPath(); ctx.rect(-f, -f, w + 2 * f, h + 2 * f); ctx.fillStyle = PAPER; ctx.fill();
  hatch(ctx, () => { ctx.beginPath(); ctx.rect(-f, -f, w + 2 * f, h + 2 * f); }, 3.2, 90, 1, 'rgba(28,27,24,0.45)', w + 100);
  ctx.beginPath(); ctx.rect(-f, -f, w + 2 * f, h + 2 * f); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.fillStyle = SLATE; ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
  // silinmiş tebeşir izleri (sabit, tohumlu)
  let a = 7; const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  ctx.strokeStyle = 'rgba(236,232,220,0.08)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const x = r() * w, y = 20 + r() * (h - 40); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y + 10 * (r() - 0.5), x + 40 + r() * 140, y + 8 * (r() - 0.5)); ctx.stroke(); }
  // tebeşir oluğu
  ctx.beginPath(); ctx.rect(-f, h + f, w + 2 * f, 7); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = CHALK; ctx.fillRect(w * 0.12, h + f + 1, 18, 4); ctx.fillRect(w * 0.7, h + f + 1, 12, 4);
  ctx.restore();
}
export const CHALK_COLOR = CHALK;

// ——— Türk bayrağı (Türk Bayrağı Kanunu ölçüleri): G = yükseklik, boy 1,5G; ay dış çember merkezi direkten 0,5G,
// çapı 0,5G; iç çember merkezi 0,0625G sağda, çapı 0,4G; yıldız çemberi çapı 0,25G, iç çember kenarından 0,333G;
// yıldızın bir ucu iki merkezi birleştiren eksende, aya bakar. wave: dalga fazı (köşeleri asılı, hafif dalga). ———
export function drawFlag(ctx, G, wave = 0, amp = 0.02) {
  ctx.save();
  const Lx = 1.5 * G, N = 24;
  const dy = x => amp * G * Math.sin(wave + (x / Lx) * 5.2) * (x / Lx);
  ctx.beginPath();
  for (let i = 0; i <= N; i++) { const x = (i / N) * Lx; i ? ctx.lineTo(x, dy(x)) : ctx.moveTo(x, dy(x)); }
  for (let i = N; i >= 0; i--) { const x = (i / N) * Lx; ctx.lineTo(x, G + dy(x)); }
  ctx.closePath(); ctx.fillStyle = FLAG_RED; ctx.fill(); ctx.lineWidth = Math.max(1, G * 0.02); ctx.strokeStyle = INK; ctx.stroke();
  // ay-yıldız: dalga ile birlikte (yerel kayma)
  const cx = 0.5 * G, cy = 0.5 * G + dy(0.5 * G);
  ctx.save(); ctx.translate(0, dy(0.85 * G));
  ctx.beginPath(); ctx.arc(cx, 0.5 * G, 0.25 * G, 0, Math.PI * 2); ctx.arc(cx + 0.0625 * G, 0.5 * G, 0.2 * G, 0, Math.PI * 2, true); ctx.fillStyle = '#FFFFFF'; ctx.fill('evenodd');
  const sx = cx + 0.0625 * G + 0.2 * G + 0.333 * G + 0.125 * G, R = 0.125 * G, r2 = R * 0.382;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = Math.PI + (i * Math.PI) / 5, rr = i % 2 ? r2 : R; const x = sx + Math.cos(a) * rr, y = 0.5 * G + Math.sin(a) * rr; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath(); ctx.fill();
  ctx.restore();
  void cy;
  // asılı köşe raptiyeleri
  for (const x of [G * 0.06, Lx - G * 0.06]) { ctx.beginPath(); ctx.arc(x, G * 0.06 + dy(x), Math.max(1.5, G * 0.035), 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore();
}

// ——— uzaktan sınıf simgesi (harita döşemesi): w × h, kök orta; lit 0..1 yanan sıra oranı; seed ———
export function drawClassTile(ctx, w, h, lit, seed, lw) {
  ctx.save();
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = SLATE; ctx.fillRect(-w * 0.3, -h / 2 + h * 0.08, w * 0.6, h * 0.14);
  let a = seed * 9301 + 49297; const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
    const x = -w * 0.36 + i * w * 0.18, y = -h / 2 + h * 0.38 + j * h * 0.16, on = r() < lit;
    ctx.beginPath(); ctx.arc(x, y, Math.max(lw, w * 0.045), 0, Math.PI * 2); ctx.fillStyle = on ? LIGHT : GRAPH; ctx.fill();
    if (on) { ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke(); }
  }
  ctx.restore();
}

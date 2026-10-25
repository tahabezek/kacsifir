// "Ağaç" karakterleri ve nesneleri: gravür ağaçlar (çam, meşe, servi; tohumlu biçim), kesik kütük, üstten ağaç
// tacı, gözlem uydusu, küçük insan. Her biri tek çizim fonksiyonu; kök tabanın ortası, birim = yükseklik.
// Gravür dili: kâğıt dolgu, mürekkep kontur, tarama (koyuluk = sıklık). Kırmızı yalnız sahnede (doruk).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hatch(ctx, path, gap, ang, lw, ext) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.beginPath();
  for (let d = -ext; d < ext; d += gap) { ctx.moveTo(dy * d - dx * ext, -dx * d - dy * ext); ctx.lineTo(dy * d + dx * ext, -dx * d + dy * ext); }
  ctx.stroke(); ctx.restore();
}

// ——— ağaç kartı: tür başına oranlar (yükseklik = 1) ———
export const TREE_CARD = Object.freeze({
  name: 'gravür ağaçlar: çam (koni katlar), meşe (yuvarlak taç), servi (dar iğ)',
  pine: { trunk: 0.16, tw: 0.055, w: 0.62, tiers: 4 },
  oak: { trunk: 0.34, tw: 0.08, w: 0.82, lobes: 6 },
  cypress: { trunk: 0.1, tw: 0.045, w: 0.3 },
  stroke: 0.035,
});
// kind: 'pine' | 'oak' | 'cypress'; seed: biçim çeşitliliği; detail: 0 (siluet) – 1 (tam tarama)
export function drawTree(ctx, kind, size, seed = 1, detail = 1) {
  const r = mulberry(seed * 7919 + 13), c = TREE_CARD[kind];
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(1.2, Math.min(2.6, size * TREE_CARD.stroke)) / size;   // ekranda 1,2–2,6 px
  // gövde
  ctx.beginPath(); ctx.moveTo(-c.tw / 2, 0); ctx.lineTo(-c.tw * 0.35, -c.trunk - 0.04); ctx.lineTo(c.tw * 0.35, -c.trunk - 0.04); ctx.lineTo(c.tw / 2, 0); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  let crown;
  if (kind === 'pine') {
    // katlar alttan üste ayrı ayrı çizilir: üst kat alttakinin üstüne biner
    const T = c.tiers, wj = 1 + (r() - 0.5) * 0.16;
    for (let i = 0; i < T; i++) {
      const y0 = -c.trunk - i * (0.84 - c.trunk) / T * 1.05, y1 = Math.max(-1, y0 - 0.38), hw = c.w / 2 * wj * (1 - i / (T + 0.6));
      const tier = () => { ctx.beginPath(); ctx.moveTo(-hw, y0); ctx.quadraticCurveTo(-hw * 0.2, y0 - 0.03, 0, y1); ctx.quadraticCurveTo(hw * 0.2, y0 - 0.03, hw, y0); ctx.closePath(); };
      tier(); ctx.fillStyle = PAPER; ctx.fill();
      if (detail > 0.05) { ctx.save(); ctx.globalAlpha *= detail; hatch(ctx, tier, 0.055, 70, lw * 0.55, 1.4); ctx.restore(); }
      tier(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
    }
    ctx.restore(); return;
  } else if (kind === 'oak') {
    const L = c.lobes, cy = -c.trunk - (1 - c.trunk) / 2, R = (1 - c.trunk) / 2, wx = c.w / 2 / R;
    const lob = Array.from({ length: L }, (_, i) => 0.82 + r() * 0.22);
    crown = () => { ctx.beginPath(); for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, k = lob[Math.floor((i / 48) * L) % L], bump = 1 + 0.06 * Math.sin(a * L); const x = Math.cos(a) * R * wx * k * bump, y = cy + Math.sin(a) * R * k * bump; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
  } else {
    const wj = c.w / 2 * (1 + (r() - 0.5) * 0.2);
    crown = () => { ctx.beginPath(); ctx.moveTo(0, -1); ctx.bezierCurveTo(wj * 1.15, -0.72, wj * 1.1, -0.3, 0, -c.trunk + 0.02); ctx.bezierCurveTo(-wj * 1.1, -0.3, -wj * 1.15, -0.72, 0, -1); ctx.closePath(); };
  }
  crown(); ctx.fillStyle = PAPER; ctx.fill();
  if (detail > 0.05) { ctx.save(); ctx.globalAlpha *= detail; hatch(ctx, crown, kind === 'cypress' ? 0.05 : 0.06, 62, lw * 0.55, 1.4); ctx.restore(); }
  crown(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}

// ——— kesik kütük: birim = yükseklik ———
export function drawStump(ctx, size, seed = 1) {
  const r = mulberry(seed * 104729 + 7), w = 0.9 + r() * 0.2;
  ctx.save(); ctx.scale(size, size);
  const lw = Math.max(0.06, 1.2 / size);
  ctx.beginPath(); ctx.moveTo(-0.5 * w, 0); ctx.lineTo(-0.42 * w, -0.78); ctx.lineTo(0.42 * w, -0.86); ctx.lineTo(0.5 * w, 0); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = GRAPH; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -0.82, 0.42 * w, 0.14, -0.08, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -0.82, 0.2 * w, 0.06, -0.08, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ——— üstten ağaç tacı (uydu görünümü): birim = çap ———
export function drawCanopy(ctx, size, seed = 1, counted = 0) {
  const r = mulberry(seed * 31 + 5), L = 7, lob = Array.from({ length: L }, () => 0.86 + r() * 0.18);
  ctx.save(); ctx.scale(size, size);
  const lw = Math.max(0.04, 1.1 / size);
  const path = () => { ctx.beginPath(); for (let i = 0; i <= 36; i++) { const a = (i / 36) * Math.PI * 2, k = lob[Math.floor((i / 36) * L) % L]; const x = Math.cos(a) * 0.5 * k, y = Math.sin(a) * 0.5 * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
  path(); ctx.fillStyle = PAPER; ctx.fill();
  hatch(ctx, path, 0.09, 45 + r() * 20, lw * 0.6, 0.8);
  path(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  if (counted > 0) { ctx.globalAlpha *= counted; ctx.beginPath(); ctx.moveTo(-0.16, 0.0); ctx.lineTo(-0.04, 0.13); ctx.lineTo(0.2, -0.15); ctx.lineWidth = lw * 2.4; ctx.stroke(); }
  ctx.restore();
}

// ——— gözlem uydusu: birim = gövde genişliği; ang: dönüş ———
export function drawSatellite(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = Math.max(0.03, 1.4 / size);
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.fillStyle = PAPER;
  for (const sx of [-1, 1]) {
    ctx.beginPath(); ctx.rect(sx > 0 ? 0.62 : -1.82, -0.2, 1.2, 0.4); ctx.fill(); ctx.stroke();
    ctx.beginPath(); for (let k = 1; k < 4; k++) { const x = (sx > 0 ? 0.62 : -1.82) + k * 0.3; ctx.moveTo(x, -0.2); ctx.lineTo(x, 0.2); } ctx.moveTo(sx > 0 ? 0.62 : -1.82, 0); ctx.lineTo(sx > 0 ? 1.82 : -0.62, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx * 0.5, 0); ctx.lineTo(sx * 0.62, 0); ctx.stroke();
  }
  ctx.beginPath(); ctx.rect(-0.5, -0.42, 1, 0.84); ctx.fill(); ctx.stroke();
  hatch(ctx, () => { ctx.beginPath(); ctx.rect(-0.5, -0.42, 1, 0.84); }, 0.12, 80, lw * 0.6, 1);
  ctx.beginPath(); ctx.arc(0, 0.56, 0.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ——— küçük insan (önden, ayakta): birim = boy ———
export function drawPerson(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = Math.max(0.04, 1.6 / size);
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.fillStyle = PAPER; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -0.88, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.15, -0.74); ctx.lineTo(0.15, -0.74); ctx.lineTo(0.12, -0.38); ctx.lineTo(-0.12, -0.38); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.07, -0.38); ctx.lineTo(-0.08, 0); ctx.moveTo(0.07, -0.38); ctx.lineTo(0.08, 0); ctx.moveTo(-0.15, -0.72); ctx.lineTo(-0.2, -0.42); ctx.moveTo(0.15, -0.72); ctx.lineTo(0.2, -0.42); ctx.lineWidth = lw * 1.6; ctx.stroke();
  ctx.restore();
}

// "Kaplumbağa" karakterleri: eyer kabuklu Galapagos dev kaplumbağası (George ve Diego aynı çizim fonksiyonu, ayrı kart),
// yavru kaplumbağa, keçi, yumurta, ödül ilanı. Gravür dili (kâğıt dolgu, mürekkep kontur, tarama). Kırmızı yok.
// Birim: kaplumbağada kabuk boyu = 1 (size px), kök ayak tabanının ortası, baş sağda. Keçide gövde boyu = 1.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const lerp = (a, b, u) => a + (b - a) * u;

function hatchClip(ctx, path, gap, ang, lw, col = INK) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -1.4; d < 1.4; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * 1.4, -dx * d - dy * 1.4); ctx.lineTo(dy * d + dx * 1.4, -dx * d + dy * 1.4); ctx.stroke(); }
  ctx.restore();
}

// eyer kabuk: önde yukarı kalkık ağız (boyun yükselebilsin), plakalar
export const GEORGE_CARD = Object.freeze({ name: 'Yalnız George (Pinta, eyer kabuk, ince uzun boyun)', saddle: 0.16, dome: 0.5, neck: 0.42, stroke: 0.012 });
export const DIEGO_CARD = Object.freeze({ name: 'Diego (Española, eyer kabuk, iri, 80 kg)', saddle: 0.2, dome: 0.47, neck: 0.46, stroke: 0.012 });
// pose: { walk: faz (sn) | null, head: 0 (kalkık) .. 1 (yere eğik), eyes: 'open' | 'closed', baby: bool, slump: 0..1 (bacaklar katlanır, kabuk yere iner) }
export function drawTortoise(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), baby = !!pose.baby;
  const w = pose.walk != null ? pose.walk * Math.PI * 2 / 1.6 : 0, step = k => (pose.walk != null ? Math.sin(w + k * Math.PI) : 0);
  const sl = pose.slump || 0, H = baby ? 0.42 : card.dome, legH = (baby ? 0.08 : 0.16) * (1 - 0.85 * sl), by = -legH - (baby ? 0.12 : 0.2) * (1 - 0.7 * sl);
  // bacaklar (fil bacağı): arka sıra grafit, ön sıra kâğıt
  const leg = (x, ph, back) => { const s = step(ph), lift = Math.max(0, s) * 0.05; ctx.beginPath(); ctx.roundRect(x - 0.065 + s * 0.04, by + 0.02 - lift, 0.13, -by - 0.02, 0.05); ctx.fillStyle = back ? GRAPH : PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); };
  leg(-0.26, 0.5, true); leg(0.22, 0, true); leg(-0.32, 0, false); leg(0.28, 0.5, false);
  // boyun ve baş: eyer ağzından öne-yukarı; head=1'de yere eğilir
  const hd = pose.head || 0;
  const nx = 0.36 + (baby ? 0.12 : card.neck) * lerp(0.75, 0.95, hd), ny = by - (baby ? 0.12 : card.neck) * lerp(0.55, -0.35, hd) + Math.sin(w * 2) * 0.006;
  ctx.beginPath(); ctx.moveTo(0.3, by + 0.02); ctx.quadraticCurveTo(lerp(0.44, nx - 0.02, 0.5), lerp(by - 0.05, ny, 0.6), nx, ny); ctx.lineWidth = baby ? 0.06 : 0.075; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = (baby ? 0.06 : 0.075) - lw * 1.8; ctx.strokeStyle = PAPER; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(nx + 0.04, ny, baby ? 0.055 : 0.07, baby ? 0.04 : 0.045, hd * 0.6, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  if (pose.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(nx + 0.04, ny - 0.012); ctx.lineTo(nx + 0.07, ny - 0.008); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(nx + 0.055, ny - 0.01, 0.009, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  // kabuk: arkada yuvarlak kubbe, önde yukarı kalkık eyer ağzı
  const sad = baby ? 0.04 : card.saddle;
  const shell = () => { ctx.beginPath(); ctx.moveTo(-0.5, by + 0.04); ctx.bezierCurveTo(-0.52, by - H * 0.8, -0.1, by - H * 1.08, 0.18, by - H * 0.82); ctx.quadraticCurveTo(0.34, by - H * 0.6 + sad * 0.2, 0.42, by - sad * 1.1); ctx.quadraticCurveTo(0.38, by + 0.02, 0.3, by + 0.05); ctx.closePath(); };
  shell(); ctx.fillStyle = PAPER; ctx.fill();
  hatchClip(ctx, shell, baby ? 0.03 : 0.022, 70, lw * 0.55, GRAPH);
  // plakalar (skutlar): iç halkalar
  ctx.save(); shell(); ctx.clip(); ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.8;
  for (const [x, y, r] of baby ? [[-0.1, by - H * 0.55, 0.12], [0.12, by - H * 0.45, 0.1]] : [[-0.28, by - H * 0.5, 0.13], [-0.04, by - H * 0.72, 0.14], [0.17, by - H * 0.52, 0.12], [-0.1, by - H * 0.25, 0.1], [0.12, by - H * 0.2, 0.09]]) {
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.55, r * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  shell(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  // kabuk kenarı (marjinal plakalar)
  ctx.beginPath(); ctx.moveTo(-0.49, by + 0.02); ctx.quadraticCurveTo(-0.1, by + 0.08, 0.3, by + 0.04); ctx.lineWidth = lw; ctx.stroke();
  ctx.restore();
}

// keçi: yan görünüş, sağa bakar; pose.graze 0..1 (baş yerde), pose.walk faz
export function drawGoat(ctx, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = 1.5 / size, w = pose.walk != null ? pose.walk * Math.PI * 2 / 0.8 : 0, g = pose.graze || 0;
  ctx.strokeStyle = INK; ctx.lineWidth = 0.05;
  for (const [x, ph] of [[-0.32, 0], [-0.22, Math.PI], [0.24, Math.PI], [0.34, 0]]) { const s = pose.walk != null ? Math.sin(w + ph) * 0.06 : 0; ctx.beginPath(); ctx.moveTo(x, -0.38); ctx.lineTo(x + s, 0); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -0.48, 0.42, 0.16, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -0.44, 0.42, 0.14, 0, 0, Math.PI); }, 0.04, 90, lw * 0.6, GRAPH);
  // kuyruk
  ctx.beginPath(); ctx.moveTo(-0.4, -0.55); ctx.lineTo(-0.47, -0.66); ctx.lineWidth = 0.04; ctx.stroke();
  // boyun ve baş (otlarken yere iner)
  const hx = lerp(0.56, 0.6, g), hy = lerp(-0.86, -0.3, g);
  ctx.beginPath(); ctx.moveTo(0.32, -0.56); ctx.lineTo(hx, hy + 0.04); ctx.lineWidth = 0.11; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.08; ctx.strokeStyle = PAPER; ctx.stroke();
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(lerp(0.3, 1.3, g));
  ctx.beginPath(); ctx.ellipse(0.06, 0, 0.12, 0.06, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.02, -0.04); ctx.quadraticCurveTo(-0.12, -0.2, -0.2, -0.16); ctx.lineWidth = 0.035; ctx.stroke();   // boynuz
  ctx.beginPath(); ctx.moveTo(0.12, 0.05); ctx.lineTo(0.1, 0.13); ctx.lineWidth = 0.02; ctx.stroke();                                   // sakal
  ctx.beginPath(); ctx.arc(0.05, -0.015, 0.012, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
  ctx.restore();
}

// yumurta: birim = boy; çatlak yok (açılmayan yumurtalar)
export function drawEgg(ctx, size, tilt = 0) {
  ctx.save(); ctx.scale(size, size); ctx.rotate(tilt);
  ctx.beginPath(); ctx.ellipse(0, -0.5, 0.4, 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 2 / size; ctx.strokeStyle = INK; ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.ellipse(0.12, -0.42, 0.3, 0.42, 0, 0, Math.PI * 2); }, 0.08, 60, 1 / size, GRAPH);
  ctx.restore();
}

// ödül ilanı: kâğıt, iğne, iki satır yazı (F: font dizesi); birim = genişlik
export function drawPoster(ctx, size, lines, F1, F2) {
  ctx.save(); ctx.rotate(-0.04);
  const w = size, h = size * 1.15;
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -h / 2 + 12, 6, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.fillStyle = INK; ctx.textAlign = 'center';
  ctx.font = F1; ctx.fillText(lines[0], 0, -h / 2 + 52);
  ctx.beginPath(); ctx.moveTo(-w * 0.36, -h / 2 + 66); ctx.lineTo(w * 0.36, -h / 2 + 66); ctx.lineWidth = 2; ctx.stroke();
  ctx.font = F2; lines.slice(1).forEach((s, i) => ctx.fillText(s, 0, -h / 2 + 108 + i * 42));
  ctx.restore();
}

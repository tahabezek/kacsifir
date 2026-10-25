// "Kayıp" karakterleri ve nesneleri: Michel Siffre (1962, mağaracı: kask, kask lambası, kalın mont), Mauro Prosperi
// (1994, koşucu: şapka, sırt çantası, şort), Tuareg çoban kız (başörtüsü, uzun giysi). Tek figür çizim fonksiyonu
// (iskelet: eklem açıları), kimlik kartla kilitli; yüz ayrıntısı yok (gerçek kişiler: genel gravür figür).
// Nesneler: çadır, sahra telefonu, takvim yaprağı, saat/takvim/güneş simgesi, türbe (marabout), yarasa, ayak izi, keçi.
// Birim: kişide boy = 1 (size px), kök ayak tabanı, sağa bakar. Gravür dili; kırmızı yok (yalnız sahnede dorukta).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';
const rad = d => (d * Math.PI) / 180;
const lerp = (a, b, u) => a + (b - a) * u;

function hatchClip(ctx, path, gap, ang, lw, col = INK, R = 1.4) {
  ctx.save(); path(); ctx.clip();
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -R; d < R; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * R, -dx * d - dy * R); ctx.lineTo(dy * d + dx * R, -dx * d + dy * R); ctx.stroke(); }
  ctx.restore();
}
const poly = (ctx, P) => { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
function limb(ctx, x0, y0, x1, y1, w, lw, fill = PAPER) {
  ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = fill; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}

// Kimlik kartları
export const SIFFRE_CARD = Object.freeze({ name: 'Michel Siffre (1962: mağaracı kaskı ve lambası, kalın kapüşonsuz mont, uzun pantolon, bot)', kind: 'caver', stroke: 0.012 });
export const PROSPERI_CARD = Object.freeze({ name: 'Mauro Prosperi (1994: siperlikli şapka ve ense örtüsü, sırt çantası, şort, koşu ayakkabısı)', kind: 'runner', stroke: 0.012 });
export const GIRL_CARD = Object.freeze({ name: 'Tuareg çoban kız (başörtüsü, uzun giysi; küçük boy)', kind: 'girl', stroke: 0.014 });

// pose: { run: faz (sn) | null, walk: faz | null, sit: bool, arms: 'down'|'phone'|'shade'|'up', lean: rad, weary: 0..1 (öne eğik, yavaş),
//         lamp: 0..1 (kask lambası hüzmesi) }
export function drawFigure(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const weary = pose.weary || 0;
  ctx.rotate((pose.lean || 0) + weary * 0.18);
  const lw = Math.max(card.stroke, 1.4 / size);
  const cyc = pose.run != null ? Math.sin(pose.run * Math.PI * 2 / 0.6) : pose.walk != null ? Math.sin(pose.walk * Math.PI * 2 / 1.1) * 0.55 : 0;
  const girl = card.kind === 'girl', caver = card.kind === 'caver', runner = card.kind === 'runner';
  const hip = [0, pose.sit ? -0.28 : -0.5];
  // bacaklar
  let Lg;
  if (pose.sit) Lg = [[80, 85], [72, 80]];
  else Lg = [[26 * cyc, Math.max(0, -40 * cyc)], [-26 * cyc, Math.max(0, 40 * cyc)]];
  Lg.forEach(([a, k]) => {
    const kx = hip[0] + Math.sin(rad(a)) * 0.25, ky = hip[1] + Math.cos(rad(a)) * 0.25, fx = kx + Math.sin(rad(a - k)) * 0.25, fy = ky + Math.cos(rad(a - k)) * 0.25;
    const thick = caver ? 0.062 : 0.048;
    limb(ctx, hip[0], hip[1], kx, ky, thick, lw, caver ? GRAPH : PAPER); limb(ctx, kx, ky, fx, fy, thick * 0.92, lw, caver ? GRAPH : PAPER);
    if (caver) { ctx.beginPath(); ctx.ellipse(fx + 0.03, fy - 0.012, 0.06, 0.03, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
    else { ctx.beginPath(); ctx.ellipse(fx + 0.035, fy - 0.006, 0.05, 0.018, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  });
  // uzun giysi (kız): bacakların üstüne etek
  if (girl) { poly(ctx, [[-0.09, hip[1] - 0.05], [0.09, hip[1] - 0.05], [0.14, -0.06], [-0.14, -0.06]]); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, () => poly(ctx, [[-0.09, hip[1] - 0.05], [0.09, hip[1] - 0.05], [0.14, -0.06], [-0.14, -0.06]]), 0.02, 80, lw * 0.7, GRAPH); poly(ctx, [[-0.09, hip[1] - 0.05], [0.09, hip[1] - 0.05], [0.14, -0.06], [-0.14, -0.06]]); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
  // şort (koşucu)
  if (runner) { poly(ctx, [[-0.075, hip[1] - 0.06], [0.075, hip[1] - 0.06], [0.085, hip[1] + 0.07], [0.005, hip[1] + 0.06], [-0.085, hip[1] + 0.07]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
  // gövde
  const thin = runner ? 1 - 0.18 * weary : 1;
  const bw = (caver ? 0.1 : girl ? 0.075 : 0.078) * thin, y0 = hip[1] - 0.3;
  const torso = () => poly(ctx, [[-bw, y0], [bw, y0], [bw - 0.004, hip[1]], [-bw + 0.004, hip[1]]]);
  torso(); ctx.fillStyle = PAPER; ctx.fill();
  if (caver) hatchClip(ctx, torso, 0.014, 70, lw * 0.9);              // kalın mont: eğik tarama
  if (girl) hatchClip(ctx, torso, 0.02, 80, lw * 0.7, GRAPH);
  torso(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  if (caver) { ctx.beginPath(); ctx.moveTo(0, y0 + 0.02); ctx.lineTo(0, hip[1] - 0.02); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  // sırt çantası (koşucu): sırtta (sola)
  if (runner) { ctx.beginPath(); ctx.roundRect(-bw - 0.07, y0 + 0.03, 0.075, 0.18, 0.02); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, () => { ctx.beginPath(); ctx.roundRect(-bw - 0.07, y0 + 0.03, 0.075, 0.18, 0.02); }, 0.016, 0, lw * 0.8); ctx.beginPath(); ctx.roundRect(-bw - 0.07, y0 + 0.03, 0.075, 0.18, 0.02); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
  // kollar
  const sh = [0.004, y0 + 0.02], arms = pose.arms || 'down';
  let A;
  if (arms === 'phone') A = [[150, -150], [-12, 8]];
  else if (arms === 'shade') A = [[160, -120], [-15, 10]];
  else if (arms === 'up') A = [[150, -10], [-150, 10]];
  else A = [[12 - 34 * cyc, 10 + weary * 20], [-12 + 34 * cyc, 10 + weary * 20]];
  const hands = [];
  A.forEach(([a, e]) => {
    const ex = sh[0] + Math.sin(rad(a)) * 0.15, ey = sh[1] + Math.cos(rad(a)) * 0.15, hx = ex + Math.sin(rad(a + e)) * 0.14, hy = ey + Math.cos(rad(a + e)) * 0.14;
    limb(ctx, sh[0], sh[1], ex, ey, caver ? 0.045 : 0.034, lw, caver ? GRAPH : PAPER); limb(ctx, ex, ey, hx, hy, caver ? 0.04 : 0.03, lw, PAPER); hands.push([hx, hy]);
  });
  // ahize (sahra telefonu)
  if (arms === 'phone') { const [hx, hy] = hands[0]; ctx.save(); ctx.translate(hx + 0.01, hy - 0.02); ctx.rotate(0.5); ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-0.02, -0.07, 0.04, 0.14, 0.015); ctx.fill(); ctx.restore(); }
  // baş
  const hy = y0 - 0.085;
  ctx.beginPath(); ctx.arc(0.01, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK;
  if (caver) {
    // kask: yarım küre + siperlik; önde lamba
    ctx.beginPath(); ctx.arc(0.008, hy - 0.006, 0.07, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    hatchClip(ctx, () => { ctx.beginPath(); ctx.arc(0.008, hy - 0.006, 0.07, Math.PI, Math.PI * 2); ctx.closePath(); }, 0.014, 0, lw * 0.8);
    ctx.beginPath(); ctx.moveTo(-0.075, hy - 0.004); ctx.lineTo(0.09, hy - 0.004); ctx.stroke();
    ctx.beginPath(); ctx.arc(0.07, hy - 0.035, 0.016, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    const lamp = pose.lamp ?? 0;
    if (lamp > 0) {
      // hüzme: ince mürekkep çizgileri (parlama yok), uzaklaştıkça seyrelir
      ctx.save(); ctx.globalAlpha *= lamp; ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.6; ctx.setLineDash([0.02, 0.02]);
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(0.085, hy - 0.035); ctx.lineTo(0.55, hy - 0.035 + k * 0.07 + 0.06); ctx.stroke(); }
      ctx.setLineDash([]); ctx.restore();
    }
  } else if (runner) {
    // siperlikli şapka + ense örtüsü
    ctx.beginPath(); ctx.arc(0.008, hy - 0.01, 0.064, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.06, hy - 0.018); ctx.lineTo(0.12, hy - 0.006); ctx.lineWidth = lw * 1.6; ctx.stroke(); ctx.lineWidth = lw;
    poly(ctx, [[-0.058, hy - 0.016], [-0.075, hy + 0.06], [-0.035, hy + 0.05], [-0.02, hy - 0.01]]); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  } else if (girl) {
    // başörtüsü: başı ve omuzları saran örtü
    const scarf = () => poly(ctx, [[-0.075, hy + 0.07], [-0.07, hy - 0.04], [-0.02, hy - 0.075], [0.04, hy - 0.07], [0.075, hy - 0.03], [0.07, hy - 0.005], [0.03, hy - 0.04], [-0.02, hy - 0.035], [-0.035, hy + 0.05], [0.0, hy + 0.09]]);
    scarf(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, scarf, 0.014, 30, lw * 0.8); scarf(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  }
  // yüz: yalnız göz noktası (gerçek kişi: portre yok)
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.045, hy + 0.004, 0.0075, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Mağara çadırı (A şeklinde, iki yan); birim = yükseklik; kök tabanın ortası
export function drawTent(ctx, size, flap = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size; ctx.lineJoin = 'round';
  const P = () => poly(ctx, [[-0.9, 0], [0, -1], [0.9, 0]]);
  P(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, P, 0.06, 75, lw * 0.8, GRAPH, 2);
  P(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  poly(ctx, [[0, -1], [0.28 + flap * 0.1, 0], [-0.28, 0]]); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, -1.12); ctx.lineWidth = lw * 1.6; ctx.stroke();
  ctx.restore();
}

// Sahra telefonu (ahizeli kutu); birim = genişlik
export function drawPhone(ctx, size, ring = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  ctx.beginPath(); ctx.roundRect(-0.5, -0.32, 1, 0.64, 0.08); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); ctx.translate(0, -0.36 - ring * 0.06); ctx.rotate(ring * 0.15); ctx.beginPath(); ctx.roundRect(-0.46, -0.08, 0.92, 0.16, 0.08); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0.05, 0.18, 0, Math.PI * 2); ctx.lineWidth = lw; ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.arc(Math.cos(a) * 0.12, 0.05 + Math.sin(a) * 0.12, 0.022, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  if (ring > 0) for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(0.55, -0.35, 0.12 + k * 0.1, -0.9, 0.2); ctx.lineWidth = lw; ctx.stroke(); ctx.beginPath(); ctx.arc(-0.55, -0.35, 0.12 + k * 0.1, Math.PI - 0.2, Math.PI + 0.9); ctx.stroke(); }
  ctx.restore();
}

// Takvim yaprağı: üstte ay, ortada büyük gün; birim = genişlik; kök üst-orta
export function drawCalendar(ctx, size, day, month, opts = {}) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size, h = 1.15;
  ctx.fillStyle = PAPER; ctx.fillRect(-0.5, 0, 1, h); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.strokeRect(-0.5, 0, 1, h);
  ctx.fillStyle = INK; ctx.fillRect(-0.5, 0, 1, 0.26);
  for (const x of [-0.25, 0.25]) { ctx.beginPath(); ctx.arc(x, 0, 0.05, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke(); }
  ctx.fillStyle = PAPER; ctx.font = `500 ${0.15}px "IBM Plex Mono"`; ctx.textAlign = 'center'; ctx.fillText(month, 0, 0.19);
  ctx.fillStyle = opts.color || INK; ctx.font = `800 ${0.6}px Archivo`; ctx.fillText(day, 0, 0.9);
  ctx.restore();
}

// Simge: saat / takvim / güneş; strike 0..1 üstünü çizen çapraz çizgi; birim = çap
export function drawIcon(ctx, size, kind, strike = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2.4 / size; ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.arc(0, 0, 0.5, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  if (kind === 'clock') { ctx.beginPath(); ctx.arc(0, 0, 0.34, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -0.24); ctx.moveTo(0, 0); ctx.lineTo(0.17, 0.06); ctx.stroke(); }
  else if (kind === 'calendar') { ctx.strokeRect(-0.28, -0.24, 0.56, 0.5); ctx.fillStyle = INK; ctx.fillRect(-0.28, -0.24, 0.56, 0.12); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ctx.fillRect(-0.22 + c * 0.12, -0.04 + r * 0.1, 0.06, 0.05); }
  else if (kind === 'sun') { ctx.beginPath(); ctx.arc(0, 0, 0.14, 0, Math.PI * 2); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.22, Math.sin(a) * 0.22); ctx.lineTo(Math.cos(a) * 0.34, Math.sin(a) * 0.34); ctx.stroke(); } }
  if (strike > 0) { ctx.lineWidth = lw * 1.8; ctx.beginPath(); ctx.moveTo(-0.36, -0.36); ctx.lineTo(-0.36 + 0.72 * strike, -0.36 + 0.72 * strike); ctx.stroke(); }
  ctx.restore();
}

// Türbe (marabout): kare gövde, kubbe, kapı; birim = yükseklik; kök tabanın ortası
export function drawShrine(ctx, size) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size;
  const body = () => { ctx.beginPath(); ctx.rect(-0.5, -0.55, 1, 0.55); };
  body(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, body, 0.045, 90, lw * 0.6, GRAPH, 2); body(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  const dome = () => { ctx.beginPath(); ctx.moveTo(-0.38, -0.55); ctx.quadraticCurveTo(-0.38, -1.02, 0, -1.05); ctx.quadraticCurveTo(0.38, -1.02, 0.38, -0.55); ctx.closePath(); };
  dome(); ctx.fillStyle = PAPER; ctx.fill(); hatchClip(ctx, dome, 0.04, 30, lw * 0.6, GRAPH, 2); dome(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.12, 0); ctx.lineTo(-0.12, -0.24); ctx.quadraticCurveTo(0, -0.36, 0.12, -0.24); ctx.lineTo(0.12, 0); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// Yarasa (kanat çırpma fazı 0..1); birim = kanat açıklığı
export function drawBat(ctx, size, phase = 0) {
  ctx.save(); ctx.scale(size, size); const f = Math.sin(phase * Math.PI * 2) * 0.22;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-0.2, -0.12 - f, -0.5, -0.05 - f); ctx.quadraticCurveTo(-0.38, 0.0, -0.36, 0.08 - f * 0.3); ctx.quadraticCurveTo(-0.22, 0.02, -0.12, 0.1); ctx.quadraticCurveTo(-0.05, 0.06, 0, 0.12);
  ctx.quadraticCurveTo(0.05, 0.06, 0.12, 0.1); ctx.quadraticCurveTo(0.22, 0.02, 0.36, 0.08 - f * 0.3); ctx.quadraticCurveTo(0.38, 0.0, 0.5, -0.05 - f); ctx.quadraticCurveTo(0.2, -0.12 - f, 0, 0); ctx.fill();
  ctx.restore();
}

// Kumda ayak izleri: n çift, sağa doğru; fade 0..1 (sonraki izler rüzgârla silinir); birim = adım
export function drawFootprints(ctx, step, n, fade = 0, wobble = 0.15, seed = 0) {
  for (let i = 0; i < n; i++) {
    const k = i / Math.max(1, n - 1), a = Math.max(0, 1 - fade * (k * 1.6));
    if (a <= 0.02) continue;
    const x = i * step, y = Math.sin(i * 0.9 + seed) * step * wobble + (i % 2 ? step * 0.22 : -step * 0.22);
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(0.12 * Math.sin(i + seed)); ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(0, 0, step * 0.2, step * 0.085, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(step * 0.24, 0, step * 0.07, step * 0.065, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// Keçi (yandan, sade); birim = boy; kök ayak tabanı
export function drawGoat(ctx, size, phase = 0) {
  ctx.save(); ctx.scale(size, size); const lw = 2 / size; ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = lw * 1.3;
  const s = Math.sin(phase * Math.PI * 2) * 0.05;
  for (const [x, d] of [[-0.35, s], [-0.22, -s], [0.25, -s], [0.38, s]]) { ctx.beginPath(); ctx.moveTo(x, -0.5); ctx.lineTo(x + d, 0); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -0.62, 0.48, 0.2, 0, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  hatchClip(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -0.62, 0.48, 0.2, 0, 0, Math.PI * 2); }, 0.05, 60, lw * 0.6, GRAPH);
  ctx.beginPath(); ctx.moveTo(0.42, -0.72); ctx.lineTo(0.62, -0.92); ctx.lineTo(0.74, -0.86); ctx.lineTo(0.66, -0.72); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.62, -0.92); ctx.quadraticCurveTo(0.56, -1.08, 0.46, -1.06); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.7, -0.78); ctx.lineTo(0.7, -0.66); ctx.stroke();
  ctx.restore();
}

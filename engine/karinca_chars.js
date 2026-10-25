// "Karınca" karakterleri: yandan karınca (iskelet → hacim → tuhaflık), üstten karınca, ağzında taşıdığı "0",
// ayakta insan, tahterevalli, kuş ve fil simgeleri, araştırma kâğıdı. Gravür dili: kâğıt dolgu, mürekkep kontur,
// koyuluk = tarama sıklığı. Kırmızı yalnız sahnede (doruk).
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577', BG = '#ECE5D5';
const rad = d => (d * Math.PI) / 180;
function hatch(ctx, path, gap, ang, lw, col = INK, ext = 4) {
  ctx.save(); path(); ctx.clip();
  const a = rad(ang), dx = Math.cos(a), dy = Math.sin(a);
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  for (let d = -ext; d < ext; d += gap) { ctx.beginPath(); ctx.moveTo(dy * d - dx * ext, -dx * d - dy * ext); ctx.lineTo(dy * d + dx * ext, -dx * d + dy * ext); ctx.stroke(); }
  ctx.restore();
}

// ——— karakter kartı (dondurulmuş): birim = baş boyu (u) ———
// İskelet: zemin kökte (0,0), yüz sağa. Gövde üç parça + bel düğümü; 6 bacak orta gövdeden (göğüs) çıkar.
export const ANT_CARD = Object.freeze({
  name: 'işçi karınca (Formica tipi), yandan; baş = 1 birim, toplam boy ≈ 4,3 birim',
  palette: { ink: INK, paper: PAPER, shade: GRAPH },
  stroke: 0.07,
  head: { c: [1.18, -1.92], rx: 0.52, ry: 0.42, tilt: -12 },
  meso: { c: [0.08, -1.6], rx: 0.72, ry: 0.3, tilt: -8 },          // göğüs (mezozoma)
  petiole: { c: [-0.78, -1.52], rx: 0.15, ry: 0.22 },               // bel düğümü
  gaster: { c: [-1.62, -1.66], rx: 0.82, ry: 0.6, tilt: 14 },       // karın
  hips: [0.5, 0.08, -0.32], hipY: -1.42,                                           // bacak kökleri (x), y = -1.12
  femur: 1.05, tibia: 1.15, tarsus: 0.42,
  stride: 0.46, lift: 0.3,
  antenna: { root: [1.42, -2.25], scape: 0.95, funi: 1.05 },
  // tuhaflık (son katman): karın parlak, üstte tek ince ışık çizgisi; bel düğümü küçük sivri tepe
  quirk: { gloss: true, nodeSpike: 0.12 },
});

// iki kemikli bacak için ters kinematik: kalça → diz (yukarıda) → ayak
function ik(hx, hy, fx, fy, a, b) {
  const dx = fx - hx, dy = fy - hy, d = Math.min(Math.hypot(dx, dy), a + b - 1e-3);
  const base = Math.atan2(dy, dx), c = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const k1 = [hx + Math.cos(base - c) * a, hy + Math.sin(base - c) * a], k2 = [hx + Math.cos(base + c) * a, hy + Math.sin(base + c) * a];
  return k1[1] < k2[1] ? k1 : k2;
}

// pose: { phase (rad, yürüme), carry (0..1: ağızda "0"), look (baş açısı, derece), antWave }
// yürüme: üçlü yürüyüş (yakın ön, uzak orta, yakın arka birlikte); ayak elips yolda
export function drawAnt(ctx, card, pose, size, opts = {}) {
  const ph = pose.phase || 0, carry = pose.carry || 0;
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.3 / size);
  const bob = Math.abs(Math.sin(ph)) * 0.035;
  ctx.translate(0, -bob);
  const legPhase = [[0, 0], [Math.PI, 1], [0, 2]];   // [faz kayması, kalça] yakın taraf; uzak taraf +π
  function leg(side, i) {
    const [off, hi] = legPhase[i], p = ph + off + (side ? Math.PI : 0);
    const hx = card.hips[hi], hy = card.hipY;
    const reach = [0.95, 0.1, -1.05][i];
    const fx = hx + reach + Math.cos(p) * card.stride * 0.5, fy = -Math.max(0, Math.sin(p)) * card.lift + bob;
    const [kx, ky] = ik(hx, hy, fx, fy, card.femur, card.tibia);
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy);
    ctx.lineTo(fx + (i === 0 ? 0.32 : i === 1 ? 0.12 : -0.32), fy + 0.02);
    ctx.lineWidth = side ? lw * 0.85 : lw * 1.15; ctx.strokeStyle = side ? GRAPH : INK; ctx.stroke();
    if (!side) { ctx.beginPath(); ctx.arc(kx, ky, lw * 0.9, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  }
  // uzak bacaklar gövdenin arkasında
  for (let i = 0; i < 3; i++) leg(1, i);
  // hacimler
  const ell = (e, extra = 0) => { ctx.beginPath(); ctx.ellipse(e.c[0], e.c[1], e.rx + extra, e.ry + extra, rad(e.tilt || 0), 0, Math.PI * 2); };
  const parts = [card.gaster, card.petiole, card.meso];
  for (const e of parts) { ell(e); ctx.fillStyle = PAPER; ctx.fill(); }
  // karın: koyu tarama (parlak tek çizgi bırakılır)
  hatch(ctx, () => ell(card.gaster), 0.075, 64, lw * 0.7, INK);
  hatch(ctx, () => ell(card.meso), 0.11, 64, lw * 0.55, INK);
  if (card.quirk.gloss) { ctx.beginPath(); ctx.ellipse(card.gaster.c[0] + 0.05, card.gaster.c[1] - 0.3, 0.42, 0.12, rad(card.gaster.tilt), Math.PI * 1.08, Math.PI * 1.9); ctx.lineWidth = lw * 2.2; ctx.strokeStyle = PAPER; ctx.stroke(); }
  // karın halkaları
  for (const k of [-0.35, 0.05, 0.42]) { ctx.save(); ctx.translate(card.gaster.c[0], card.gaster.c[1]); ctx.rotate(rad(card.gaster.tilt)); ctx.beginPath(); ctx.ellipse(k * card.gaster.rx, 0, 0.1, card.gaster.ry * Math.sqrt(1 - k * k) * 0.96, 0, -Math.PI / 2, Math.PI / 2); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  for (const e of parts) { ell(e); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = INK; ctx.stroke(); }
  // bel düğümünün sivri tepesi
  const pc = card.petiole.c; ctx.beginPath(); ctx.moveTo(pc[0] - 0.12, pc[1] - 0.12); ctx.lineTo(pc[0], pc[1] - 0.22 - card.quirk.nodeSpike); ctx.lineTo(pc[0] + 0.12, pc[1] - 0.12); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  // yakın bacaklar gövdenin önünde
  for (let i = 0; i < 3; i++) leg(0, i);
  // baş (bakış açısı): taşırken hafif yukarı
  const look = (pose.look ?? 0) - 8 * carry;
  ctx.save(); ctx.translate(card.head.c[0] - 0.4, card.head.c[1] + 0.1); ctx.rotate(rad(look)); ctx.translate(-(card.head.c[0] - 0.4), -(card.head.c[1] + 0.1));
  const hd = card.head;
  ctx.beginPath(); ctx.ellipse(hd.c[0], hd.c[1], hd.rx, hd.ry, rad(hd.tilt), 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  hatch(ctx, () => { ctx.beginPath(); ctx.ellipse(hd.c[0], hd.c[1], hd.rx, hd.ry, rad(hd.tilt), 0, Math.PI * 2); }, 0.085, 64, lw * 0.6, INK);
  ctx.beginPath(); ctx.ellipse(hd.c[0], hd.c[1], hd.rx, hd.ry, rad(hd.tilt), 0, Math.PI * 2); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = INK; ctx.stroke();
  // göz (bileşik): dolu oval + parlak nokta
  ctx.beginPath(); ctx.ellipse(hd.c[0] + 0.12, hd.c[1] - 0.06, 0.13, 0.1, rad(-15), 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(hd.c[0] + 0.16, hd.c[1] - 0.1, 0.03, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
  // çeneler (mandibula)
  const mx = hd.c[0] + hd.rx * 0.92, my = hd.c[1] + 0.16, open = 0.25 + 0.2 * carry;
  ctx.beginPath(); ctx.moveTo(mx - 0.05, my - 0.05); ctx.quadraticCurveTo(mx + 0.3, my - 0.05 - open * 0.4, mx + 0.38, my + 0.08 - open * 0.3);
  ctx.moveTo(mx - 0.05, my + 0.05); ctx.quadraticCurveTo(mx + 0.28, my + 0.12, mx + 0.34, my + 0.2);
  ctx.lineWidth = lw * 1.3; ctx.strokeStyle = INK; ctx.stroke();
  // anten: dirsekli; uç hafif dalgalanır
  const ar = card.antenna, aw = Math.sin((pose.antWave ?? ph) * 0.9) * 0.12;
  for (const [s, col, w] of [[1, GRAPH, 0.8], [0, INK, 1.1]]) {
    const r0 = [ar.root[0] - s * 0.12, ar.root[1] + s * 0.04];
    const e1 = [r0[0] + Math.cos(rad(-62 - s * 10)) * ar.scape, r0[1] + Math.sin(rad(-62 - s * 10)) * ar.scape];
    const dirA = rad(18 + 30 * carry + (aw + s * 0.1) * 60);
    const segs = 6; ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(e1[0], e1[1]);
    let p = [...e1]; for (let k = 1; k <= segs; k++) { const a = dirA + k * 0.06; p = [p[0] + Math.cos(a) * ar.funi / segs, p[1] + Math.sin(a) * ar.funi / segs]; ctx.lineTo(p[0], p[1]); }
    ctx.lineWidth = lw * w; ctx.strokeStyle = col; ctx.stroke();
    ctx.beginPath(); ctx.arc(p[0], p[1], lw * 1.1, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}
// ağızdaki yükün tutma noktası (birim): drawAnt ile aynı baş dönüşümü
export function antMouth(card, pose) {
  const look = rad((pose.look ?? 0) - 8 * (pose.carry || 0)), pivot = [card.head.c[0] - 0.4, card.head.c[1] + 0.1];
  const m = [card.head.c[0] + card.head.rx * 0.92 + 0.36, card.head.c[1] + 0.1];
  const dx = m[0] - pivot[0], dy = m[1] - pivot[1];
  const bob = Math.abs(Math.sin(pose.phase || 0)) * 0.035;
  return [pivot[0] + dx * Math.cos(look) - dy * Math.sin(look), pivot[1] + dx * Math.sin(look) + dy * Math.cos(look) - bob];
}

// ——— taşınan "0": kâğıt dolgulu kalın rakam (Archivo 800), kök = rakamın alt ortası ———
export function drawZeroGlyph(ctx, h, col = INK, fill = PAPER) {
  ctx.save(); ctx.font = `800 ${h * 1.36}px Archivo`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, h * 0.07); ctx.strokeStyle = col; ctx.strokeText('0', 0, 0);
  ctx.fillStyle = fill; ctx.fillText('0', 0, 0);
  ctx.restore();
}

// ——— üstten karınca (kalabalık ve yollar için): kök = gövde ortası, yön +x; size = boy (px) ———
export function drawAntTop(ctx, size, phase = 0, col = INK) {
  ctx.save(); ctx.scale(size, size); ctx.fillStyle = col; ctx.strokeStyle = col;
  if (size < 7) { ctx.beginPath(); ctx.arc(0.32, 0, 0.12, 0, 7); ctx.arc(0, 0, 0.11, 0, 7); ctx.ellipse(-0.3, 0, 0.18, 0.13, 0, 0, 7); ctx.fill(); ctx.restore(); return; }
  ctx.lineWidth = Math.max(0.06, 1 / size); ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
    const sw = Math.sin(phase + (i % 2 ? Math.PI : 0) + (s > 0 ? Math.PI : 0)) * 0.12, x0 = 0.12 - i * 0.12;
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + [0.18, 0, -0.16][i] + sw, s * 0.2); ctx.lineTo(x0 + [0.3, 0.02, -0.32][i] + sw, s * 0.3); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0.42, -0.04); ctx.quadraticCurveTo(0.55, -0.16, 0.62, -0.2); ctx.moveTo(0.42, 0.04); ctx.quadraticCurveTo(0.55, 0.16, 0.62, 0.2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.34, 0, 0.1, 0.09, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0.1, 0, 0.13, 0.065, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-0.24, 0, 0.2, 0.13, 0, 0, 7); ctx.fill();
  ctx.restore();
}

// ——— ayakta insan (yandan, sade gravür): kök = ayak tabanı ortası; size = boy (px) ———
export function drawStandingPerson(ctx, size, col = INK) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round';
  const lw = 2.2 / size;
  const body = () => {
    ctx.beginPath();
    ctx.ellipse(0, -0.93, 0.062, 0.07, 0, 0, Math.PI * 2);
    ctx.moveTo(-0.11, -0.82); ctx.quadraticCurveTo(0, -0.86, 0.11, -0.82); ctx.lineTo(0.13, -0.5); ctx.lineTo(0.09, -0.48);
    ctx.lineTo(0.075, 0); ctx.lineTo(0.015, 0); ctx.lineTo(0.0, -0.44); ctx.lineTo(-0.015, 0); ctx.lineTo(-0.075, 0); ctx.lineTo(-0.09, -0.48); ctx.lineTo(-0.13, -0.5); ctx.closePath();
  };
  body(); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); body(); ctx.clip(); hatch(ctx, () => { ctx.beginPath(); ctx.rect(-0.2, -0.48, 0.4, 0.5); }, 0.022, 70, lw * 0.6, INK, 1.2); ctx.restore();
  body(); ctx.lineWidth = lw * 1.2; ctx.strokeStyle = col; ctx.stroke();
  // kollar
  ctx.beginPath(); ctx.moveTo(-0.11, -0.8); ctx.quadraticCurveTo(-0.16, -0.62, -0.14, -0.46); ctx.moveTo(0.11, -0.8); ctx.quadraticCurveTo(0.16, -0.62, 0.14, -0.46); ctx.lineWidth = lw * 1.1; ctx.stroke();
  ctx.restore();
}

// ——— tahterevalli: kök = dayanak tepesi; tilt (rad, + sol aşağı); kollar ±len ———
export function drawSeesaw(ctx, len, tilt, h) {
  ctx.save(); ctx.lineJoin = 'round';
  // dayanak üçgeni
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-h * 0.55, h); ctx.lineTo(h * 0.55, h); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill();
  hatch(ctx, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-h * 0.55, h); ctx.lineTo(h * 0.55, h); ctx.closePath(); }, 7, 60, 1.2, INK, h * 2);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-h * 0.55, h); ctx.lineTo(h * 0.55, h); ctx.closePath(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  // kalas
  ctx.rotate(-tilt);
  ctx.beginPath(); ctx.rect(-len, -16, 2 * len, 16); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(-len, -16, 2 * len, 16); ctx.clip(); ctx.lineWidth = 1; for (let x = -len; x < len; x += 26) { ctx.beginPath(); ctx.moveTo(x, -16); ctx.quadraticCurveTo(x + 13, -8, x + 4, 0); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// ——— kuş simgesi (uçan martı) ve fil simgesi: kök = merkez; s = genişlik ———
export function drawBirdIcon(ctx, s, ph = 0) {
  ctx.save(); ctx.scale(s, s); const f = Math.sin(ph) * 0.08;
  ctx.beginPath(); ctx.moveTo(-0.5, -0.05 - f); ctx.quadraticCurveTo(-0.25, -0.3 - f, 0, 0.02); ctx.quadraticCurveTo(0.25, -0.3 - f, 0.5, -0.05 - f);
  ctx.lineWidth = 0.07; ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0.03, 0.06, 0.035, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
export function drawElephantIcon(ctx, s) {
  ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round';
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(-0.48, -0.05); ctx.bezierCurveTo(-0.5, -0.42, -0.2, -0.5, 0.05, -0.46); ctx.bezierCurveTo(0.22, -0.52, 0.42, -0.45, 0.44, -0.25);
    ctx.bezierCurveTo(0.5, -0.1, 0.52, 0.12, 0.58, 0.24); ctx.lineTo(0.52, 0.26); ctx.bezierCurveTo(0.44, 0.12, 0.42, 0.0, 0.38, -0.05);
    ctx.lineTo(0.34, 0.3); ctx.lineTo(0.22, 0.3); ctx.lineTo(0.2, 0.06); ctx.lineTo(-0.2, 0.06); ctx.lineTo(-0.22, 0.3); ctx.lineTo(-0.34, 0.3); ctx.lineTo(-0.38, 0.0);
    ctx.quadraticCurveTo(-0.52, 0.02, -0.56, 0.12); ctx.quadraticCurveTo(-0.52, -0.02, -0.48, -0.05); ctx.closePath();
  };
  shape(); ctx.fillStyle = PAPER; ctx.fill();
  hatch(ctx, shape, 0.04, 70, 0.012, INK, 1);
  shape(); ctx.lineWidth = 0.03; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.15, -0.28, 0.1, 0.13, 0.2, 0, Math.PI * 2); ctx.lineWidth = 0.022; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.32, -0.3, 0.018, 0, 7); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

// ——— araştırma kâğıdı (yığın için): kök = merkez; w genişlik ———
export function drawPaperSheet(ctx, w, seed = 0) {
  const h = w * 1.3; ctx.save();
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = Math.max(1, w * 0.02); ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = Math.max(0.8, w * 0.012); ctx.strokeStyle = GRAPH;
  for (let i = 0; i < 9; i++) { const y = -h / 2 + h * (0.14 + i * 0.085), l = i === 0 ? 0.55 : 0.78 - ((seed * 7 + i * 3) % 5) * 0.06; ctx.beginPath(); ctx.moveTo(-w * 0.38, y); ctx.lineTo(-w * 0.38 + w * l * (i === 0 ? 1 : 0.95), y); ctx.stroke(); }
  ctx.restore();
}

// ——— spor ayakkabı (yandan, gravür): kök = taban altı ortası; L = boy (px); burun sağda ———
export function drawShoe(ctx, L) {
  ctx.save(); ctx.scale(L, L); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; const lw = 2.4 / L;
  // üst kısım: topuk sırtı, bilek ağzı, dil, bağcık bölgesi, burun
  const upper = () => {
    ctx.beginPath(); ctx.moveTo(-0.48, -0.1); ctx.bezierCurveTo(-0.52, -0.22, -0.5, -0.36, -0.44, -0.42);
    ctx.lineTo(-0.36, -0.4); ctx.quadraticCurveTo(-0.3, -0.33, -0.22, -0.34); ctx.lineTo(-0.12, -0.46); ctx.quadraticCurveTo(-0.08, -0.5, -0.03, -0.46);
    ctx.lineTo(0.12, -0.3); ctx.quadraticCurveTo(0.32, -0.24, 0.44, -0.18); ctx.quadraticCurveTo(0.53, -0.14, 0.52, -0.1); ctx.closePath();
  };
  upper(); ctx.fillStyle = PAPER; ctx.fill();
  // topuk ve burun parçaları: sık tarama (koyu deri), orta gövde açık
  ctx.save(); upper(); ctx.clip();
  hatch(ctx, () => { ctx.beginPath(); ctx.moveTo(-0.6, 0); ctx.lineTo(-0.6, -0.6); ctx.lineTo(-0.3, -0.6); ctx.quadraticCurveTo(-0.22, -0.2, -0.3, 0); ctx.closePath(); }, 0.012, 60, lw * 0.5, INK, 1);
  hatch(ctx, () => { ctx.beginPath(); ctx.moveTo(0.25, 0); ctx.quadraticCurveTo(0.22, -0.2, 0.32, -0.3); ctx.lineTo(0.6, -0.3); ctx.lineTo(0.6, 0); ctx.closePath(); }, 0.012, 60, lw * 0.5, INK, 1);
  hatch(ctx, () => { ctx.beginPath(); ctx.rect(-0.6, -0.6, 1.2, 0.6); }, 0.03, 60, lw * 0.35, INK, 1);
  ctx.restore();
  upper(); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke();
  // bilek ağzının iç gölgesi
  ctx.beginPath(); ctx.moveTo(-0.44, -0.42); ctx.quadraticCurveTo(-0.36, -0.36, -0.22, -0.34); ctx.lineWidth = lw * 2.4; ctx.stroke();
  // yan şerit
  ctx.beginPath(); ctx.moveTo(-0.3, -0.14); ctx.quadraticCurveTo(-0.05, -0.2, 0.18, -0.28); ctx.moveTo(-0.3, -0.2); ctx.quadraticCurveTo(-0.08, -0.25, 0.12, -0.32); ctx.lineWidth = lw * 1.2; ctx.stroke();
  // delikler ve bağcıklar
  for (let i = 0; i < 5; i++) { const x = -0.08 + i * 0.042, y = -0.4 + i * 0.03; ctx.beginPath(); ctx.arc(x, y, 0.008, 0, 7); ctx.fillStyle = INK; ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 0.03, y - 0.03); ctx.lineTo(x + 0.035, y + 0.02); ctx.lineWidth = lw * 1.1; ctx.stroke(); }
  // kalın beyaz taban ve diş izi
  const sole = () => { ctx.beginPath(); ctx.moveTo(-0.5, -0.1); ctx.lineTo(0.53, -0.1); ctx.quadraticCurveTo(0.58, -0.05, 0.52, 0); ctx.lineTo(-0.48, 0); ctx.quadraticCurveTo(-0.54, -0.04, -0.5, -0.1); ctx.closePath(); };
  sole(); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 1.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.49, -0.035); ctx.lineTo(0.54, -0.035); ctx.lineWidth = lw * 0.8; ctx.stroke();
  for (let x = -0.46; x < 0.5; x += 0.035) { ctx.beginPath(); ctx.moveTo(x, -0.035); ctx.lineTo(x, 0); ctx.lineWidth = lw * 0.7; ctx.stroke(); }
  ctx.restore();
}

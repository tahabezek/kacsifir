// "Ömür" nesneleri: Grönland köpekbalığı (Somniosus microcephalus; tıknaz silindir gövde, küt yuvarlak burun, iki
// küçük ve geride sırt yüzgeci, anal yüzgeç yok, küçük göz, heteroserk kuyruk: alt lob çok küçük), Eyfel Kulesi, ressam paleti ve fırça,
// bisiklet, göz merceği kesiti (eşmerkezli halkalar). Gerçek kişi (Calment) çizilmez; hayatı nesnelerle anlatılır.
// Birim: köpekbalığında boy = 1 (size px), burun solda (sola yüzer), orijin gövdenin ortası. Gravür dili; kırmızı yok.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577', BODY = '#D8D0BD';

// Kimlik kartı (oranlar boy = 1; yan görünüş)
export const SHARK_CARD = Object.freeze({
  name: 'Grönland köpekbalığı (yan, sola yüzer)', stroke: 0.006,
  top: [[0, 0.012], [0.012, -0.035], [0.05, -0.085], [0.14, -0.118], [0.3, -0.13], [0.46, -0.12], [0.6, -0.095], [0.72, -0.06], [0.82, -0.035]],
  bot: [[0, 0.02], [0.018, 0.062], [0.07, 0.1], [0.2, 0.12], [0.38, 0.122], [0.55, 0.1], [0.68, 0.065], [0.77, 0.042], [0.82, 0.034]],
  dorsal1: [[0.53, -0.112], [0.58, -0.163], [0.615, -0.104]], dorsal2: [[0.69, -0.072], [0.73, -0.11], [0.755, -0.063]],
  pect: [[0.17, 0.105], [0.27, 0.2], [0.27, 0.115]], pelvic: [[0.62, 0.09], [0.68, 0.13], [0.7, 0.075]],
  eye: [0.06, -0.03, 0.0055],
});

function smooth(ctx, P) {
  ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length - 1; i++) { const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2; ctx.quadraticCurveTo(P[i][0], P[i][1], mx, my); }
  ctx.lineTo(P.at(-1)[0], P.at(-1)[1]);
}

// phase: kuyruk salınımı (0..1 döngü); amp: salınım genliği (boy biriminde)
export function drawShark(ctx, size, phase = 0, amp = 0.03, card = SHARK_CARD) {
  ctx.save(); ctx.scale(size, size); ctx.translate(-0.5, 0); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.3 / size);
  const wob = u => amp * Math.sin(phase * Math.PI * 2 - u * 5.2) * Math.max(0, u - 0.25) ** 2 / 0.56;
  const bend = P => P.map(([u, y]) => [u, y + wob(u)]);
  const top = bend(card.top), bot = bend(card.bot);
  const tw = wob(0.96);
  // heteroserk kuyruk: uzun, alçak üst lob; çok küçük alt lob (orak biçimli değil)
  const tail = [[0.82, -0.035 + wob(0.82)], [0.92, -0.07 + wob(0.92)], [1.0, -0.105 + tw], [0.97, -0.03 + tw], [0.93, 0.005 + tw], [0.925, 0.042 + tw], [0.865, 0.046 + wob(0.865)], [0.82, 0.034 + wob(0.82)]];
  const fin = (P, k = 1) => { ctx.beginPath(); const Q = bend(P); ctx.moveTo(Q[0][0], Q[0][1]); ctx.quadraticCurveTo(Q[1][0] - 0.02 * k, Q[1][1], Q[1][0], Q[1][1]); ctx.quadraticCurveTo(Q[1][0] + 0.01, (Q[1][1] + Q[2][1]) / 2, Q[2][0], Q[2][1]); ctx.closePath(); };
  // yüzgeçler (gövdenin arkasında kalanlar önce)
  for (const P of [card.dorsal1, card.dorsal2, card.pelvic]) { fin(P); ctx.fillStyle = BODY; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
  // kuyruk
  const tailP = () => { ctx.beginPath(); tail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
  tailP(); ctx.fillStyle = BODY; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.45)'; ctx.lineWidth = lw * 0.6; for (let x = 0.8; x < 1.02; x += 0.012) { ctx.beginPath(); ctx.moveTo(x, -0.2); ctx.lineTo(x + 0.03, 0.12); ctx.stroke(); } ctx.restore();
  tailP(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // gövde
  const body = () => { ctx.beginPath(); smooth(ctx, top); const B = bot.slice().reverse(); ctx.lineTo(B[0][0], B[0][1]); for (let i = 1; i < B.length - 1; i++) { const mx = (B[i][0] + B[i + 1][0]) / 2, my = (B[i][1] + B[i + 1][1]) / 2; ctx.quadraticCurveTo(B[i][0], B[i][1], mx, my); } ctx.bezierCurveTo(-0.012, 0.03, -0.014, 0.0, top[0][0], top[0][1]); ctx.closePath(); };   // küt, yuvarlak burun
  body(); ctx.fillStyle = BODY; ctx.fill();
  // gravür gölge: sırt koyu (yoğun eğik tarama), karın açık (seyrek); kıvrımı izleyen yatay çizgiler
  ctx.save(); body(); ctx.clip();
  ctx.strokeStyle = 'rgba(28,27,24,0.5)'; ctx.lineWidth = lw * 0.55;
  for (let x = -0.05; x < 0.85; x += 0.009) { const y0 = -0.14 + wob(x), y1 = 0.005 + wob(x) + 0.012 * Math.sin(x * 9); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 0.02, y1); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(28,27,24,0.22)';
  for (let k = 0; k < 4; k++) { ctx.beginPath(); for (let x = 0.02; x <= 0.8; x += 0.02) { const y = 0.03 + k * 0.02 + wob(x); x === 0.02 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.restore();
  body(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // göğüs yüzgeci (önde)
  fin(card.pect, -1); ctx.fillStyle = BODY; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // solungaç yarıkları, ağız, göz
  ctx.lineWidth = lw * 0.8;
  for (let i = 0; i < 5; i++) { const x = 0.115 + i * 0.012; ctx.beginPath(); ctx.moveTo(x, -0.045 + wob(x)); ctx.quadraticCurveTo(x + 0.006, 0.0, x, 0.04 + wob(x)); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0.02, 0.055); ctx.quadraticCurveTo(0.05, 0.07, 0.085, 0.06); ctx.stroke();
  const [ex, ey, er] = card.eye;
  ctx.beginPath(); ctx.arc(ex, ey, er * 1.6, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
// gözün gövde içindeki yeri (boy biriminde, orijin gövde ortası): büyüteç bu noktaya iner
export const SHARK_EYE = [SHARK_CARD.eye[0] - 0.5, SHARK_CARD.eye[1]];

// Eyfel Kulesi: taban y=0, boy = size (yukarı)
export function drawEiffel(ctx, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineWidth = 1.6 / size; ctx.strokeStyle = INK;
  const half = y => 0.02 + 0.3 * Math.pow(1 - y, 2.3);   // y: 0 taban, 1 tepe
  const L = [], R = [];
  for (let i = 0; i <= 30; i++) { const y = i / 30; L.push([-half(y), -y]); R.push([half(y), -y]); }
  // kemer
  ctx.beginPath(); ctx.moveTo(-half(0.0), 0); ctx.quadraticCurveTo(0, -0.26, half(0.0), 0); ctx.stroke();
  ctx.beginPath(); smooth(ctx, L); ctx.stroke(); ctx.beginPath(); smooth(ctx, R); ctx.stroke();
  // kafes: çapraz çizgiler
  ctx.lineWidth = 1 / size; ctx.strokeStyle = 'rgba(28,27,24,0.7)';
  for (let i = 0; i < 18; i++) { const a = i / 18 * 0.92, b = (i + 1) / 18 * 0.92; ctx.beginPath(); ctx.moveTo(-half(a), -a); ctx.lineTo(half(b), -b); ctx.moveTo(half(a), -a); ctx.lineTo(-half(b), -b); ctx.stroke(); }
  // katlar
  ctx.lineWidth = 2.2 / size; ctx.strokeStyle = INK;
  for (const y of [0.26, 0.5]) { const h = half(y) + 0.04; ctx.beginPath(); ctx.moveTo(-h, -y); ctx.lineTo(h, -y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-h, -y - 0.03); ctx.lineTo(h, -y - 0.03); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, -1.06); ctx.stroke();
  ctx.restore();
}

// Palet ve fırça (Van Gogh; yüz yok): merkezde
export function drawPalette(ctx, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineWidth = 1.8 / size; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
  const pal = () => { ctx.beginPath(); ctx.ellipse(0, 0, 0.5, 0.36, -0.2, 0, Math.PI * 2); ctx.moveTo(-0.16, 0.12); ctx.ellipse(-0.24, 0.12, 0.08, 0.06, 0, 0, Math.PI * 2, true); };
  pal(); ctx.fillStyle = PAPER; ctx.fill('evenodd');
  ctx.save(); pal(); ctx.clip('evenodd'); ctx.strokeStyle = 'rgba(139,133,119,0.7)'; ctx.lineWidth = 1 / size; for (let d = -0.6; d < 0.6; d += 0.035) { ctx.beginPath(); ctx.moveTo(d, -0.5); ctx.lineTo(d + 0.3, 0.5); ctx.stroke(); } ctx.restore();
  pal(); ctx.stroke();
  for (const [x, y, r, f] of [[0.18, -0.18, 0.07, 1], [0.32, -0.02, 0.06, 0.6], [0.02, -0.22, 0.06, 0.3], [0.24, 0.17, 0.065, 0.85]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = `rgba(28,27,24,${f})`; ctx.fill(); ctx.stroke(); }
  // fırça: palet üstünden çapraz
  ctx.save(); ctx.rotate(-0.75); ctx.beginPath(); ctx.rect(-0.05, -0.62, 0.035, 0.7); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.055, 0.08); ctx.lineTo(-0.01, 0.08); ctx.lineTo(-0.02, 0.24); ctx.lineTo(-0.045, 0.24); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
  ctx.restore();
}

// Bisiklet (1975'te bir yüzyıllık kadının bindiği türden, şehir bisikleti): taban y=0 (teker altı), merkez x=0;
// spin: tekerlek dönüşü (radyan)
export function drawBicycle(ctx, size, spin = 0) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = INK;
  const r = 0.22, A = [-0.34, -r], B = [0.34, -r];
  for (const [x, y] of [A, B]) {
    ctx.lineWidth = 2.6 / size; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1 / size; ctx.beginPath(); for (let k = 0; k < 12; k++) { const a = spin + k * Math.PI / 6; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 0.02, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  }
  const P = [-0.02, -0.2], S = [-0.12, -0.52], H = [0.22, -0.56];   // pedal göbeği, sele borusu üstü, gidon borusu
  ctx.lineWidth = 2.2 / size; ctx.beginPath();
  ctx.moveTo(A[0], A[1]); ctx.lineTo(P[0], P[1]); ctx.lineTo(S[0], S[1]); ctx.lineTo(A[0], A[1]);    // arka üçgen
  ctx.moveTo(P[0], P[1]); ctx.quadraticCurveTo(0.1, -0.34, H[0], H[1] + 0.06); ctx.moveTo(H[0], H[1]); ctx.lineTo(B[0], B[1]);   // alçak kadro (kadın bisikleti)
  ctx.stroke();
  ctx.lineWidth = 3 / size; ctx.beginPath(); ctx.moveTo(S[0] - 0.07, S[1] - 0.02); ctx.lineTo(S[0] + 0.05, S[1] - 0.02); ctx.stroke();   // sele
  ctx.lineWidth = 2.2 / size; ctx.beginPath(); ctx.moveTo(H[0], H[1]); ctx.lineTo(H[0] - 0.08, H[1] - 0.04); ctx.stroke();               // gidon
  // pedal kolu (dönüşle)
  ctx.lineWidth = 1.8 / size; ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(P[0] + Math.cos(spin * 0.6) * 0.08, P[1] + Math.sin(spin * 0.6) * 0.08); ctx.stroke();
  // sepet (önde)
  ctx.beginPath(); ctx.rect(H[0] + 0.01, H[1] + 0.02, 0.12, 0.08); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Göz merceği kesiti: merkez (0,0), yarıçap 1; n halka; rot: dokunun yavaş dönüşü; seed'li düzensizlik
export function lensRings(ctx, R, n, rot = 0, alpha = 1, seed = 1) {
  ctx.save(); ctx.globalAlpha *= alpha;
  for (let i = 1; i <= n; i++) {
    const u = i / n, r = R * u;
    ctx.beginPath();
    for (let k = 0; k <= 72; k++) { const a = k / 72 * Math.PI * 2, w = 1 + 0.012 * Math.sin(a * 3 + i * 1.7 + seed + rot) + 0.008 * Math.sin(a * 7 - i * 0.9 + rot * 1.3); const x = Math.cos(a) * r * w, y = Math.sin(a) * r * w; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.lineWidth = i % 5 === 0 ? 1.6 : 0.9; ctx.strokeStyle = i % 5 === 0 ? 'rgba(28,27,24,0.75)' : 'rgba(139,133,119,0.75)'; ctx.stroke();
  }
  ctx.restore();
}

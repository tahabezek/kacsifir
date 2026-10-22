// Üretilmiş gezegen gravürlerini motor için hazırlar: assets/gen/gezegenler/*.png → assets/planets/*.png + planets.json
// - alfa = mürekkep koyuluğu × kaynak alfa, renk = mürekkep (#1C1B18): içi beyaz dolu görseller de kâğıda oturur
// - küreler: uydurulan dairenin çevresinden kırpılır, 1024 px kare (yarıçap 492 px)
// - Satürn: yatay tuval korunur; halka + küre silüeti ayrıca kâğıt dolgusu olarak yazılır (arkadaki gezegeni örter)
//   node tools/planet_assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'assets', 'gen', 'gezegenler'), OUT = path.join(root, 'assets', 'planets');
const INK = [28, 27, 24], SIDE = 1024, MARGIN = 1.04;
// seçilen varyantlar (assets/gen/gezegenler/PROMPTS.md)
const PICK = { merkur: 'merkur_2', venus: 'venus_1', dunya: 'dunya_3', ay: 'ay_4', mars: 'mars_1', jupiter: 'jupiter_2', saturn: 'saturn_1', uranus: 'uranus_1', neptun: 'neptun_1' };

function read(file) {
  const probe = spawnSync(ffmpegPath, ['-hide_banner', '-i', file], { encoding: 'utf8' }).stderr;
  const [w, h] = probe.match(/, (\d{3,5})x(\d{3,5})/).slice(1).map(Number);
  const px = spawnSync(ffmpegPath, ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 28 }).stdout;
  return { w, h, px };
}
function write(file, { w, h, px }, scaleTo) {
  const vf = scaleTo ? ['-vf', `scale=${scaleTo[0]}:${scaleTo[1]}:flags=lanczos`] : [];
  const r = spawnSync(ffmpegPath, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', '-', ...vf, '-pix_fmt', 'rgba', file], { input: px, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(r.stderr.toString());
}
function toInk(img) {
  const px = Buffer.from(img.px);
  for (let i = 0; i < px.length; i += 4) {
    const L = (px[i] + px[i + 1] + px[i + 2]) / 3, dark = Math.min(1, Math.max(0, (255 - L) / (255 - INK[0])));
    px[i] = INK[0]; px[i + 1] = INK[1]; px[i + 2] = INK[2]; px[i + 3] = Math.round(px[i + 3] * dark);
  }
  return { ...img, px };
}
// kenar noktalarına en küçük kareler dairesi (Kasa)
function fitCircle({ w, h, px }) {
  const pts = [];
  for (let y = 0; y < h; y += 2) {
    let l = -1, r = -1;
    for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 96) { if (l < 0) l = x; r = x; }
    if (l >= 0 && r - l > 40) pts.push([l, y], [r, y]);
  }
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0; const n = pts.length;
  for (const [x, y] of pts) { const z = x * x + y * y; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; sz += z; }
  const M = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]], B = [sxz, syz, sz];
  const det = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(M), s = [0, 1, 2].map(k => det(M.map((row, i) => row.map((v, j) => (j === k ? B[i] : v)))) / D);
  const cx = s[0] / 2, cy = s[1] / 2;
  return { cx, cy, r: Math.sqrt(s[2] + cx * cx + cy * cy) };
}
function crop(img, x0, y0, cw, ch) {
  const px = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const sx = x + x0, sy = y + y0;
    if (sx < 0 || sy < 0 || sx >= img.w || sy >= img.h) continue;
    img.px.copy(px, (y * cw + x) * 4, (sy * img.w + sx) * 4, (sy * img.w + sx) * 4 + 4);
  }
  return { w: cw, h: ch, px };
}
// silüet: kenardan düşük alfalı piksellerle ulaşılamayan her yer (halkanın içi ve küre)
// holes: halka ile küre arasındaki boşluklardan birer tohum (orada arkadaki gezegen görünmeli)
function silhouette(img, holes = [], thr = 40) {
  const { w, h, px } = img, out = new Uint8Array(w * h), q = [];
  for (let x = 0; x < w; x++) q.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) q.push(y * w, y * w + w - 1);
  for (const [x, y] of holes) q.push(y * w + x);
  while (q.length) {
    const i = q.pop();
    if (out[i] || px[i * 4 + 3] > thr) continue;
    out[i] = 1; const x = i % w, y = (i / w) | 0;
    if (x > 0) q.push(i - 1); if (x < w - 1) q.push(i + 1); if (y > 0) q.push(i - w); if (y < h - 1) q.push(i + w);
  }
  const fill = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    // 1 px genişlet: çizginin dış kenarı da dolguya girsin
    const x = i % w, y = (i / w) | 0;
    const inside = !out[i] || (x > 0 && !out[i - 1]) || (x < w - 1 && !out[i + 1]) || (y > 0 && !out[i - w]) || (y < h - 1 && !out[i + w]);
    if (inside) { fill[i * 4] = 0xEC; fill[i * 4 + 1] = 0xE5; fill[i * 4 + 2] = 0xD5; fill[i * 4 + 3] = 255; }
  }
  return { w, h, px: fill };
}

fs.mkdirSync(OUT, { recursive: true });
const meta = {};
for (const [name, file] of Object.entries(PICK)) {
  const img = toInk(read(path.join(SRC, file + '.png')));
  if (name === 'saturn') {
    // küre: halkanın kestiği kenarlar yerine elle ölçülen daire (kaynak 1536×1024'te)
    const globe = { cx: 772, cy: 511, r: 388 };
    write(path.join(OUT, 'saturn.png'), img);
    write(path.join(OUT, 'saturn_fill.png'), silhouette(img, [[330, 384], [1190, 530]]));
    meta.saturn = { file: 'saturn.png', fill: 'saturn_fill.png', w: img.w, h: img.h, ...globe };
    continue;
  }
  const c = fitCircle(img), side = Math.round(2 * c.r * MARGIN);
  const sq = crop(img, Math.round(c.cx - side / 2), Math.round(c.cy - side / 2), side, side);
  write(path.join(OUT, name + '.png'), sq, [SIDE, SIDE]);
  meta[name] = { file: name + '.png', w: SIDE, h: SIDE, cx: SIDE / 2, cy: SIDE / 2, r: SIDE / 2 / MARGIN };
  console.log(name, 'daire', c.cx.toFixed(1), c.cy.toFixed(1), c.r.toFixed(1));
}
fs.writeFileSync(path.join(OUT, 'planets.json'), JSON.stringify(meta, null, 1));
console.log('→', OUT);

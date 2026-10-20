// Kritik paketi: temas kâğıdı, hızlı hareket şeridi, telefon testi ve otomatik kapılar.
//   node tools/critique.mjs episodes/001.json
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { buildTimeline } from '../engine/core.js';
import { openStage } from './render.mjs';
import { measure } from './audio.mjs';

const FPS = 30;
const ep = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dir = path.join('out', ep.id), cdir = path.join(dir, 'critique');
fs.mkdirSync(cdir, { recursive: true });
const video = path.join(dir, 'video.mp4');
const tl = buildTimeline(ep);

const ff = args => {
  const r = spawnSync(ffmpegPath, ['-hide_banner', ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr.slice(-600));
  return r.stderr;
};
const NF = Math.round(tl.duration * FPS);
// Kare numarasıyla birebir yakalama (arama kayması yok)
const grab = (t, file, w = 1080) => {
  const n = Math.max(0, Math.min(NF - 1, Math.round(t * FPS)));
  ff(['-y', '-loglevel', 'error', '-i', video, '-vf', `select=eq(n\\,${n}),scale=${w}:-2:flags=lanczos`, '-frames:v', '1', '-fps_mode', 'passthrough', file]);
};
const sheet = (out, cols, files, w) =>
  spawnSync('node', ['tools/sheet.mjs', out, String(cols), ...files], { stdio: 'inherit', env: { ...process.env, SHEET_W: String(w) } });

// 1) Temas kâğıdı: her vuruş anından 0,3 sn sonra
const keys = [0];
for (const it of tl.items) keys.push(it.t0 + 0.3, it.t1 + 0.3, ...(it.hero ? [it.tl + 0.3, it.tl + 1.2] : []));
keys.push(tl.rw0 + 0.3, tl.duration - 1 / FPS);
const contact = keys.map((t, i) => { const f = path.join(cdir, `k${i}.png`); grab(Math.min(t, tl.duration - 1 / FPS), f, 540); return f; });
sheet(path.join(cdir, 'contact.png'), 5, contact, 300);

// 2) Hızlı hareket şeridi: doruk büyümesinin en hızlı yeri + geri sarma
const strips = [];
const fast = tl.hero ? (tl.hero.t0 + tl.hero.t1) / 2 : tl.items[1].t0 + 0.5;
for (const [name, c] of [['grow', fast], ['rewind', (tl.rw0 + tl.rw1) / 2]]) {
  const fs12 = [];
  for (let k = 0; k < 12; k++) { const f = path.join(cdir, `s_${name}${k}.png`); grab(c + (k - 6) / FPS, f, 360); fs12.push(f); }
  sheet(path.join(cdir, `strip_${name}.png`), 6, fs12, 240);
  strips.push(`strip_${name}.png`);
}

// 3) Telefon testi: 360 px genişlikte kahraman anı + kare 0
const phone = [0, tl.hero ? tl.hero.tl + 1.5 : tl.duration / 2].map((t, i) => { const f = path.join(cdir, `p${i}.png`); grab(t, f, 360); return f; });
sheet(path.join(cdir, 'phone.png'), 2, phone, 360);

// 3b) Reels arayüzü bindirmesi: sağ düğme sütunu, alt açıklama, üst başlık ile çakışma var mı?
const ui = [0, tl.items[0].t1 + 0.3, tl.hero ? tl.hero.tl + 1.5 : tl.duration / 2, tl.items[tl.items.length - 1].t1 + 0.3].map((t, i) => {
  const raw = path.join(cdir, `u${i}raw.png`), f = path.join(cdir, `u${i}.png`);
  grab(t, raw);
  ff(['-y', '-loglevel', 'error', '-i', raw, '-i', 'brand/reels_ui.png', '-filter_complex', '[0][1]overlay=0:0', f]);
  return f;
});
sheet(path.join(cdir, 'reels_ui.png'), 4, ui, 360);

// 4) Otomatik kapılar
const gates = {};
// donmuş bölüm (≥1 sn neredeyse hareketsiz)
const fz = ff(['-i', video, '-vf', 'freezedetect=n=0.0008:d=1', '-map', '0:v', '-f', 'null', '-']);
gates.freeze = [...fz.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])]);
// döngü dikişi: son kare ile ilk kare arasındaki fark (SSIM)
const first = path.join(cdir, 'seam_first.png'), last = path.join(cdir, 'seam_last.png');
grab(0, first); grab(tl.duration - 1 / FPS, last);
const ss = ff(['-i', first, '-i', last, '-lavfi', 'ssim', '-f', 'null', '-']);
gates.seamSSIM = Number(ss.match(/All:([\d.]+)/)[1]);
// ses
gates.loudness = measure(video);
// determinizm: aynı t iki kez çizilince aynı kare mi?
const st = await openStage(process.argv[2]);
const tt = tl.hero ? tl.hero.tl + 0.37 : 3.3;
const h1 = crypto.createHash('sha1').update(await st.shot(tt)).digest('hex');
await st.shot(1.0);
const h2 = crypto.createHash('sha1').update(await st.shot(tt)).digest('hex');
await st.close();
gates.deterministic = h1 === h2;
gates.duration = Number(tl.duration.toFixed(2));

fs.writeFileSync(path.join(cdir, 'gates.json'), JSON.stringify(gates, null, 2));
for (const f of fs.readdirSync(cdir)) if (/^(k|s_|p)\w*\.png$/.test(f)) fs.rmSync(path.join(cdir, f));
console.log(JSON.stringify(gates, null, 2));

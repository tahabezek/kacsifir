// Kare kare render: headless Chrome → PNG akışı → ffmpeg (H.264, yuv420p, BT.709, +faststart)
// Kullanım:
//   node tools/render.mjs episodes/001.json                 → out/001/video.mp4 (+ ses)
//   node tools/render.mjs episodes/001.json --stills 0,3.2   → out/001/still_*.png
//   node tools/render.mjs episodes/001.json --frames 120-135 → out/001/frames/f0120.png ...
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';
import { synth, writeWav, masterAndMux, measure } from './audio.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;

export function findChrome() {
  const c = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const p = c.find(p => p && fs.existsSync(p));
  if (!p) throw new Error('Chrome bulunamadı (CHROME_PATH ayarla)');
  return p;
}

// Proje kökünü sunan geçici statik sunucu (ES modülleri file:// ile yüklenmez)
export function staticServer() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png' };
  const srv = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', types[path.extname(p)] || 'application/octet-stream');
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

export async function openStage(epPath) {
  const srv = await staticServer();
  const port = srv.address().port;
  const browser = await puppeteer.launch({
    executablePath: findChrome(), headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('sayfa hatası:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('konsol:', m.text()); });
  const rel = path.relative(root, path.resolve(epPath)).split(path.sep).join('/');
  await page.goto(`http://127.0.0.1:${port}/engine/stage.html?ep=${encodeURIComponent(rel)}`);
  await page.waitForFunction('window.__ready === true', { timeout: 30000 });
  const duration = await page.evaluate('window.DURATION');
  const shot = async t => {
    await page.evaluate(t => window.renderFrame(t), t);
    return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 }, optimizeForSpeed: true });
  };
  const close = async () => { await browser.close(); srv.close(); };
  return { page, duration, shot, close };
}

// Glif kapısı: ekrana yazılan her karakter yerel fontların unicode aralığında mı?
// (Değilse sistem fontuna düşer ve render makineye göre değişir.)
export function glyphCheck(ep) {
  const css = fs.readFileSync(path.join(root, 'engine', 'fonts', 'fonts.css'), 'utf8');
  const ranges = {};
  for (const m of css.matchAll(/font-family:'([^']+)'[^}]*unicode-range:([^}]+)\}/g)) {
    const list = (ranges[m[1]] ||= []);
    for (const r of m[2].split(',')) {
      const [a, b] = r.trim().replace(/^U\+/i, '').split('-');
      list.push([parseInt(a, 16), parseInt(b || a, 16)]);
    }
  }
  const covered = (fam, ch) => ch === ' ' || (ranges[fam] || []).some(([a, b]) => ch.codePointAt(0) >= a && ch.codePointAt(0) <= b);
  const archivo = [...ep.question, ...ep.items.flatMap(i => [i.name, i.kicker || '']), ...ep.format.units.map(u => u.name), '0123456789.,'];
  const mono = [ep.serial, ...ep.items.map(i => i.tag)];
  const bad = [];
  for (const s of archivo) for (const ch of s) if (!covered('Archivo', ch)) bad.push(`Archivo:${ch}`);
  for (const s of mono) for (const ch of s) if (!covered('IBM Plex Mono', ch)) bad.push(`Plex:${ch}`);
  if (bad.length) throw new Error('Fontta olmayan karakter: ' + [...new Set(bad)].join(' '));
}

export function buildCaption(ep) {
  return [ep.caption, (ep.hashtags || []).join(' ')].filter(Boolean).join('\n\n');
}

async function main() {
  const [epPath, ...rest] = process.argv.slice(2);
  const ep = JSON.parse(fs.readFileSync(epPath, 'utf8'));
  const outDir = path.join(root, 'out', ep.id);
  fs.mkdirSync(outDir, { recursive: true });
  const opt = Object.fromEntries(rest.reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
  glyphCheck(ep);
  const st = await openStage(epPath);
  const N = Math.round(st.duration * FPS);
  try {
    if (opt.stills) {
      for (const s of opt.stills.split(',')) {
        const t = Number(s);
        fs.writeFileSync(path.join(outDir, `still_${t.toFixed(2)}.png`), await st.shot(t));
      }
      console.log('stills →', outDir);
      return;
    }
    if (opt.frames) {
      const [a, b] = opt.frames.split('-').map(Number);
      const fd = path.join(outDir, 'frames'); fs.mkdirSync(fd, { recursive: true });
      for (let f = a; f <= b; f++) fs.writeFileSync(path.join(fd, `f${String(f).padStart(4, '0')}.png`), await st.shot(f / FPS));
      console.log('frames →', fd);
      return;
    }
    // Tam video (sessiz ara dosya; ses ayrıca eklenir)
    const silent = path.join(outDir, 'silent.mp4');
    const ff = spawn(ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709',
      '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < N; f++) {
      const buf = await st.shot(f / FPS);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 60 === 0) process.stdout.write(`\r${f}/${N} kare`);
    }
    ff.stdin.end();
    await new Promise((r, j) => ff.on('close', c => (c ? j(new Error('ffmpeg ' + c)) : r())));
    console.log(`\r${N}/${N} kare · ${((Date.now() - t0) / 1000).toFixed(1)} sn`);
    const wav = path.join(outDir, 'audio.wav');
    writeWav(wav, synth(ep));
    const final = path.join(outDir, 'video.mp4');
    masterAndMux(wav, silent, final);
    if (!opt.keep) { fs.rmSync(silent); fs.rmSync(wav); }
    const loud = measure(final);
    fs.writeFileSync(path.join(outDir, 'caption.txt'), buildCaption(ep));
    console.log(`→ ${final} · ${loud.I} LUFS · TP ${loud.TP} dBTP`);
  } finally {
    await st.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();

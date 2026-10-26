// Pilot sahneyi (engine/pilot.html) kare kare yakalar → out/pilot/video.mp4 (sessiz, H.264).
//   node tools/pilot.mjs            → video
//   node tools/pilot.mjs --stills 0,2.5,5 → out/pilot/still_*.png
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';
import { findChrome, staticServer } from './render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'out', 'pilot');
fs.mkdirSync(out, { recursive: true });
const srv = await staticServer();
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920 });
page.on('pageerror', e => console.error('sayfa hatası:', e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/engine/pilot.html`);
await page.waitForFunction('window.__ready === true', { timeout: 60000 });
const dur = await page.evaluate('window.DURATION');
const shot = async t => { await page.evaluate(t => window.renderFrame(t), t); return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } }); };
const si = process.argv.indexOf('--stills');
if (si > 0) {
  for (const t of process.argv[si + 1].split(',').map(Number)) fs.writeFileSync(path.join(out, `still_${t.toFixed(2)}.png`), await shot(t));
} else {
  const N = Math.round(dur * 30);
  const ff = spawn(ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', path.join(out, 'video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { ff.stdin.write(await shot(i / 30)); if (i % 60 === 0) process.stdout.write(`${i}/${N} `); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`\n→ out/pilot/video.mp4 · ${dur.toFixed(2)} sn · ${N} kare`);
}
await browser.close(); srv.close();

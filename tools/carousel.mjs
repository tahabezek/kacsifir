// Carousel: bir bölümün kilit anlarından 1080×1350 (4:5) kaydırmalı gönderi kareleri.
//   node tools/carousel.mjs episodes/015-satranc-bugday.json   → out/015/carousel/1.jpg … N.jpg
// Kare 1 kapak (kanca + "Kaydır →"), aradakiler basamaklar, son kare doruk + "Tamamı videoda".
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import { openStage } from './render.mjs';
import { summary } from '../engine/summary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CROP = { x: 0, y: 250, width: 1080, height: 1350 };

export async function makeCarousel(epPath, max = 6) {
  const ep = JSON.parse(fs.readFileSync(path.resolve(root, epPath), 'utf8'));
  const sm = summary(ep);
  const dir = path.join(root, 'out', ep.id, 'carousel');
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  // ara anlar: anahtar anlardan, kapak ve geri sarma hariç, eşit aralıkla
  const mids = sm.keys.filter(k => k > 0.8 && k < (sm.heroTl ?? sm.rw0) - 0.2);
  const pick = [];
  const want = max - 2;
  for (let i = 0; i < want && mids.length; i++) pick.push(mids[Math.min(mids.length - 1, Math.round(((i + 1) * mids.length) / (want + 1)) - (want >= mids.length ? 1 : 0))]);
  const times = [0, ...[...new Set(pick)], (sm.heroTl ?? sm.lastLand) + 1.0];
  const st = await openStage(epPath);
  const files = [];
  for (const [i, t] of times.entries()) {
    const last = i === times.length - 1, first = i === 0;
    await st.page.evaluate(({ t, first, last, n, total }) => {
      window.renderFrame(t);
      const c = document.getElementById('c').getContext('2d');
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      // sayfa numarası ve yönlendirme (kırpılan alanın altında, 1080×1350 içinde)
      const y = 250 + 1350 - 64;
      c.font = '500 34px "IBM Plex Mono"'; c.fillStyle = '#8B8577'; c.textAlign = 'left';
      c.fillText(`${n}/${total}`, 90, y);
      c.textAlign = 'right'; c.font = '800 44px Archivo'; c.fillStyle = last ? '#E0391C' : '#1C1B18';
      c.fillText(first ? 'Kaydır →' : last ? 'Videonun tamamı profilde' : '→', 990, y);
      c.restore();
    }, { t, first, last, n: i + 1, total: times.length });
    const png = path.join(dir, `${i + 1}.png`);
    fs.writeFileSync(png, await st.page.screenshot({ type: 'png', clip: CROP }));
    const jpg = path.join(dir, `${i + 1}.jpg`);
    const r = spawnSync(ffmpegPath, ['-y', '-loglevel', 'error', '-i', png, '-q:v', '2', jpg]);
    if (r.status !== 0) throw new Error('jpg dönüşümü: ' + r.stderr);
    fs.rmSync(png); files.push(jpg);
  }
  await st.close();
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = await makeCarousel(process.argv[2]);
  console.log(files.join('\n'));
}

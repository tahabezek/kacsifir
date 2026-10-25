// Sınıf özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { sinifTimes } from './sinif.js';

export function sinifSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = sinifTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.doksan, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.on + 0.3, T.bes + 0.3, T.write1, T.pull1 + 0.2, T.doksan + 0.3, T.follow + 0.4, tl.loop0 + 0.3, D - 0.4],
    fast: (T.pull0 + T.pull1) / 2, firstLand: T.on + 0.3, lastLand: T.doksan + 1.2,
  };
}

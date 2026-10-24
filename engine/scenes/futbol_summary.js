// Futbol özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { futbolTimes } from './futbol.js';

export function futbolSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = futbolTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.off + 0.3, T.ext + 0.3, T.brazil + 0.3, T.oldest + 0.3, T.hero + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: (T.whip0 + T.whip1) / 2, firstLand: T.off + 0.3, lastLand: T.hero + 1.2,
  };
}

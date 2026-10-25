// "Yol" (053) özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { yolTimeline, yolTimes } from './yol.js';

export function yolSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = yolTimeline(ep, voice), T = yolTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.v30 + 0.3, T.ank + 0.3, T.ghost + 0.5, T.v230 + 0.5, T.hero + 0.3, T.tok + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: T.map0 + 0.5, firstLand: T.ank + 0.3, lastLand: T.hero + 1.2,
  };
}

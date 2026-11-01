// Buz ve ateş özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buzatesTimes } from './buzates_core.js';

export function buzatesSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const { tl, T } = buzatesTimes(ep, voice), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.burst, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.kirk + 0.3, T.indi + 0.3, T.getirdi + 0.3, T.cutOut + 0.3, T.yok + 0.3, T.burst + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: T.burst + 0.1, firstLand: T.kirk + 0.3, lastLand: T.burst + 0.3,
  };
}

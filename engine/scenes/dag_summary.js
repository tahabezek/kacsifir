// Dağ özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { dagTimes } from './dag_core.js';

export function dagSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const { tl, T } = dagTimes(ep, voice), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.cut1 + 0.3, T.drill1 + 0.3, T.cap1, T.hero + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: (T.cut0 + T.cut1) / 2, firstLand: T.cube(0) + 0.3, lastLand: T.hero + 0.3,
  };
}

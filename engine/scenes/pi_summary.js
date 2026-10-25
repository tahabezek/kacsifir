// Pi özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { piTimes } from './pi.js';

export function piSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = piTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.uc + 0.3, T.on + 0.3, T.cm + 0.3, T.hyd + 0.5, T.hero + 0.8, T.ring + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: (T.zoom0 + T.zoom1) / 2, firstLand: T.uc + 0.3, lastLand: T.hero + 1.2,
  };
}

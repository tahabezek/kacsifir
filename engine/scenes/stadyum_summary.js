// Stadyum özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { stadyumTimes } from './stadyum_core.js';

export function stadyumSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const { tl, T } = stadyumTimes(ep, voice), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.rain1, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), ...T.jersey.map(t => t + 0.5), T.kirmizi + 0.3, T.rain1 + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: (T.rain0 + T.rain1) / 2, firstLand: T.jersey[0] + 0.5, lastLand: T.rain1 + 0.3,
  };
}

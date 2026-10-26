// Dalga özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { dalgaTimes } from './dalga.js';

export function dalgaSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = dalgaTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.boomK + 0.3, T.elli + 0.3, T.rod + 0.3, T.k4800 + 0.3, T.boomT + 0.3, T.dort + 0.3, T.alaska + 0.3, T.t10000 + 0.3, T.k15 + 0.5, T.hero + 1.0, tl.loop0 + 0.3, D - 0.4],
    fast: (T.whip0 + T.whip1) / 2, firstLand: T.boomK + 0.3, lastLand: T.hero + 1.2,
  };
}

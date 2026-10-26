// Nefes özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { nefesTimes } from './nefes.js';

export function nefesSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = nefesTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.down + 0.3, T.stopA + 0.3, T.balina + 0.3, T.deep + 0.3, T.m42 + 0.3, T.hero + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: T.sweep0, firstLand: T.stopA + 0.3, lastLand: T.hero + 1.2,
  };
}

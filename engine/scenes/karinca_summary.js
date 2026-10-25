// Karınca özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { karincaTimes } from './karinca.js';

export function karincaSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = karincaTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hit, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.yirmi + 0.3, T.z14 + 0.3, T.hit + 0.4, T.milyon + 0.3, T.agir + 0.6, tl.loop0 + 0.3, D - 0.4],
    fast: (T.l04end + T.hit) / 2, firstLand: T.yirmi + 0.3, lastLand: T.hit + 0.6,
  };
}

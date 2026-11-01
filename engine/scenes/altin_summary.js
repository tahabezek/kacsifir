// Altın özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { altinTimes } from './altin_core.js';

export function altinSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const { tl, T } = altinTimes(ep, voice), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.out1, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.metre + 0.3, T.yedi + 0.3, T.out1 + 0.3, T.ev + 0.3, T.elli + 0.3, T.in1 + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: (T.silence[1] + T.l07) / 2, firstLand: T.metre + 0.3, lastLand: T.in1 + 0.3,
  };
}

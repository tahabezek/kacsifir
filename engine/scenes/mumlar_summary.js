// Mumlar özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { mumlarTimes } from './mumlar_core.js';

export function mumlarSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const { tl, T } = mumlarTimes(ep, voice), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.ondort + 0.3, T.yil5 + 0.3, T.goz + 0.3, T.hero + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: (T.omrun + T.hero) / 2, firstLand: T.dogdu + 0.3, lastLand: T.hero + 0.3,
  };
}

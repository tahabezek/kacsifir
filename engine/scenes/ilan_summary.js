// İlan özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { ilanTimes } from './ilan.js';

export function ilanSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = ilanTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.seksen, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.yuz + 0.3, T.yirmi + 0.3, T.yasasin + 0.3, T.ph0 + 0.6, T.zo1 + 0.3, T.on + 0.3, T.seksen + 0.3, T.follow + 0.4, tl.loop0 + 0.3, D - 0.4],
    fast: (T.zo0 + T.zo1) / 2, firstLand: T.yuz + 0.3, lastLand: T.seksen + 1.2,
  };
}

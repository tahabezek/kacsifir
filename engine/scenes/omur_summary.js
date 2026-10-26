// Ömür özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { omurTimes } from './omur.js';

export function omurSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = omurTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: T.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.age14 + 0.3, T.bis + 0.3, T.n28 + 1.5, T.goz + 0.6, T.y1700 + 0.6, T.n392 + 0.8, T.ann3 + 0.4, tl.loop0 + 0.3, D - 0.4],
    fast: (T.morph0 + T.morph1) / 2, firstLand: T.age14 + 0.3, lastLand: T.hero + 1.2,
  };
}

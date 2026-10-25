// Dokuz beş özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { dokuzbesTimes } from './dokuzbes.js';

export function dokuzbesSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = dokuzbesTimes(tl), D = T.D;
  return {
    duration: D, rw0: T.loop0, rw1: D, heroTl: T.sign0, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.bes + 0.3, T.susar + 1.0, T.dolma + 0.3, T.carry0 + 0.6, T.dakika + 0.3, T.seksen + 0.3, T.seksen + 1.5, T.her + 1.2, T.sign0 + 1.0, T.sign1 + 0.3, T.saygi + 0.6, T.loop0 + 0.3, D - 0.4],
    fast: T.carry0 + 0.5, firstLand: T.bes, lastLand: T.saygi,
  };
}

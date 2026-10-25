// Bulut özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { bulutTimeline, bulutTimes } from './bulut.js';

export function bulutSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = bulutTimeline(ep, voice), T = bulutTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.words[0].t0 + 0.3), T.km3 + 0.3, T.yarim + 0.6, T.milyar + 0.3, T.hero + 0.3, T.fil + 0.6, T.minicik + 0.4, tl.loop0 + 0.3, D - 0.4],
    fast: (T.dive0 + T.dive1) / 2, firstLand: T.km3 + 0.3, lastLand: T.fil + 1.2,
  };
}

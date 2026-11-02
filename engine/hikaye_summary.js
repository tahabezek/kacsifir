// Hikâye özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { hikayeTimes } from './hikaye_core.js';
import { filmOf } from '../tools/audio_hikaye.mjs';

export function hikayeSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const { tl, T } = hikayeTimes(ep, voice), D = tl.duration;
  const mod = filmOf(ep);
  const hero = mod?.hero ? mod.hero(T) : T.lastEnd - 3;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: hero, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), hero + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: hero, firstLand: T.l02 + 0.5, lastLand: hero + 0.3,
  };
}

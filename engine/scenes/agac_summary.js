// Ağaç özeti (yalnız node): kalite kapıları ve yayın araçları için anahtar anlar.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline } from './yolculuk_core.js';
import { agacTimes } from './agac.js';

export function agacSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), T = agacTimes(tl), D = tl.duration;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: T.yedi, cover: 0,
    keys: [0, ...Object.values(tl.L).map(l => l.t0 + 0.3), T.yuz + 0.3, T.dort + 0.6, T.yerde + 0.6, T.uc + 0.3, T.yedi + 0.3, T.uc6 + 0.3, T.yarisi + 0.6, tl.loop0 + 0.3, D - 0.4],
    fast: (T.hero + T.yedi) / 2, firstLand: T.yuz + 0.3, lastLand: T.yedi + 1.2,
  };
}

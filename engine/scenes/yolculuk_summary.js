// Yolculuk özeti (yalnız node: kalite kapıları, yayın araçları). Ses zamanları dosyadan okunur.
import fs from 'node:fs';
import path from 'node:path';
import { buildYolTimeline, travelPlan, walkRoute } from './yolculuk_core.js';

export function yolSummary(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), { L } = tl, plan = travelPlan(tl, walkRoute()), D = tl.duration;
  const hero = L.l14.t0 - 0.04;
  return {
    duration: D, rw0: tl.loop0, rw1: D, heroTl: hero, cover: (plan.bird.t0 + plan.bird.t1) / 2,
    keys: [0, ...Object.values(L).map(l => l.t0 + 0.3), plan.bird.t1 + 0.3, plan.waitT[0] + 1, hero + 0.3, tl.loop0 + 0.3, D - 0.4],
    fast: (L.l04.end + 0.55 + L.l05.t0 + 0.25) / 2, firstLand: plan.bird.t1 + 0.3, lastLand: hero + 1.2,
  };
}

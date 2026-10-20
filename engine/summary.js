// Şablondan bağımsız zaman özeti: kritik, önizleme ve planlayıcı bunu okur.
import { buildTimeline } from './core.js';
import { buildSwarmTimeline } from './swarm_core.js';

export function summary(ep) {
  if (ep.template === 'swarm') {
    const tl = buildSwarmTimeline(ep);
    const S = tl.stops;
    return {
      duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
      heroTl: tl.hero ? tl.hero.tl : null,
      cover: tl.hero ? tl.hero.tl + 1.5 : 0,
      keys: [0, ...S.slice(1).flatMap(s => [s.t0 + 0.3, s.t1 + 0.3, ...(s.hero ? [s.tl + 0.3, s.tl + 1.2] : [])]), tl.rw0 + 0.3],
      fast: tl.hero ? (tl.hero.t0 + tl.hero.t1) / 2 : S[1].t0 + 0.4,
      lastLand: S[S.length - 1].t1,
      firstLand: S[1].t1,
    };
  }
  const tl = buildTimeline(ep);
  return {
    duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    heroTl: tl.hero ? tl.hero.tl : null,
    cover: tl.hero ? Math.max(0, tl.hero.tl - 0.4) : 0,
    keys: [0, ...tl.items.flatMap(it => [it.t0 + 0.3, it.t1 + 0.3, ...(it.hero ? [it.tl + 0.3, it.tl + 1.2] : [])]), tl.rw0 + 0.3],
    fast: tl.hero ? (tl.hero.t0 + tl.hero.t1) / 2 : tl.items[1].t0 + 0.5,
    lastLand: tl.items[tl.items.length - 1].t1,
    firstLand: tl.items[0].t1,
  };
}

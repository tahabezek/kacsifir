// Şablondan bağımsız zaman özeti: kritik, önizleme ve planlayıcı bunu okur.
import { buildTimeline } from './core.js';
import { buildSwarmTimeline } from './swarm_core.js';
import { buildDocTimeline } from './doc.js';
import { buildVersusTimeline } from './versus.js';
import { boardSummary } from './scenes/board.js';
import { lightSummary } from './scenes/light.js';
import { tilesSummary } from './scenes/tiles.js';

export function summary(ep) {
  if (ep.template === 'board') return boardSummary(ep);
  if (ep.template === 'light') return lightSummary(ep);
  if (ep.template === 'tiles') return tilesSummary(ep);
  if (ep.template === 'versus') {
    const tl = buildVersusTimeline(ep), S = tl.S;
    return {
      duration: tl.duration, rw0: S.loop.t0, rw1: S.loop.t1, heroTl: tl.heroLand, cover: 0,
      keys: [0, S.a.t0 + 1, (S.a.t0 + S.a.t1) / 2, S.a.t1 - 1, S.b.t0 + 1, (S.b.t0 + S.b.t1) / 2, S.b.t1 - 1, S.compare.t0 + 1.5, tl.heroLand + 0.3, tl.heroLand + 1.5, S.ask.t0 + 1.2, S.loop.t0 + 0.3],
      fast: (S.a.t0 + S.a.t1) / 2, lastLand: S.ask.t0 + 1.2, firstLand: S.a.t0 + 1,
    };
  }
  if (ep.template === 'doc') {
    const tl = buildDocTimeline(ep), S = tl.S;
    return {
      duration: tl.duration, rw0: S.loop.t0, rw1: S.loop.t1, heroTl: tl.heroLand,
      cover: 0,
      keys: [0, ...tl.folds.map(f => f.t1 + 0.3), S.why.t0 + 1.2, S.why.t1 - 0.6, S.gallivan.t0 + 1.0, S.gallivan.t1 - 0.6, S.records.t1 - 0.6, S.hero.t0 + 1.5, tl.heroLand + 0.3, tl.heroLand + 1.5, S.loop.t0 + 0.3],
      fast: tl.folds[3].t0 + (tl.folds[3].t1 - tl.folds[3].t0) / 2,
      lastLand: S.records.t1 - 0.6, firstLand: tl.folds[0].t1,
    };
  }
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

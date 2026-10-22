// Şablondan bağımsız zaman özeti: kritik, önizleme ve planlayıcı bunu okur.
import { buildTimeline } from './core.js';
import { buildSwarmTimeline } from './swarm_core.js';
import { buildDocTimeline } from './doc.js';
import { buildVersusTimeline } from './versus.js';
import { boardSummary } from './scenes/board.js';
import { lightSummary } from './scenes/light.js';
import { tilesSummary } from './scenes/tiles.js';
import { altitudeSummary } from './scenes/altitude.js';
import { pulseSummary } from './scenes/pulse.js';
import { needleSummary } from './scenes/needle.js';
import { spinSummary } from './scenes/spin.js';
import { stormSummary } from './scenes/storm.js';
import { depthSummary } from './scenes/depth.js';
import { sunSummary } from './scenes/sun.js';
import { zerosSummary } from './scenes/zeros.js';
import { ropeSummary } from './scenes/rope.js';
import { proofSummary } from './scenes/proof.js';
import { tunnelSummary } from './scenes/tunnel.js';
import { doorsSummary } from './scenes/doors.js';
import { timelineSummary } from './scenes/timeline.js';
import { dominoSummary } from './scenes/domino_core.js';
import { gezegenSummary } from './scenes/gezegen.js';
import { teraziSummary } from './scenes/terazi.js';
import { hacimSummary } from './scenes/hacim.js';
import { venusSummary } from './scenes/venus.js';
import { uranusSummary } from './scenes/uranus.js';
import { waterSummary } from './scenes/water_core.js';
import { birthdaySummary } from './scenes/birthday_core.js';
import { fallSummary } from './scenes/fall_core.js';

import { yolSummary } from './scenes/yolculuk_summary.js';
import { zamanSummary } from './scenes/zaman_summary.js';
import { okyanusSummary } from './scenes/okyanus_summary.js';
import { kayaSummary } from './scenes/kaya_summary.js';

export function summary(ep) {
  if (ep.template === 'yolculuk') return yolSummary(ep);
  if (ep.template === 'zaman') return zamanSummary(ep);
  if (ep.template === 'okyanus') return okyanusSummary(ep);
  if (ep.template === 'kaya') return kayaSummary(ep);
  if (ep.template === 'domino') return dominoSummary(ep);
  if (ep.template === 'gezegen') return gezegenSummary(ep);
  if (ep.template === 'terazi') return teraziSummary(ep);
  if (ep.template === 'hacim') return hacimSummary(ep);
  if (ep.template === 'venus') return venusSummary(ep);
  if (ep.template === 'uranus') return uranusSummary(ep);
  if (ep.template === 'water') return waterSummary(ep);
  if (ep.template === 'birthday') return birthdaySummary(ep);
  if (ep.template === 'fall') return fallSummary(ep);
  if (ep.template === 'board') return boardSummary(ep);
  if (ep.template === 'light') return lightSummary(ep);
  if (ep.template === 'tiles') return tilesSummary(ep);
  if (ep.template === 'altitude') return altitudeSummary(ep);
  if (ep.template === 'pulse') return pulseSummary(ep);
  if (ep.template === 'needle') return needleSummary(ep);
  if (ep.template === 'spin') return spinSummary(ep);
  if (ep.template === 'storm') return stormSummary(ep);
  if (ep.template === 'depth') return depthSummary(ep);
  if (ep.template === 'sun') return sunSummary(ep);
  if (ep.template === 'zeros') return zerosSummary(ep);
  if (ep.template === 'rope') return ropeSummary(ep);
  if (ep.template === 'proof') return proofSummary(ep);
  if (ep.template === 'tunnel') return tunnelSummary(ep);
  if (ep.template === 'doors') return doorsSummary(ep);
  if (ep.template === 'timeline') return timelineSummary(ep);
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

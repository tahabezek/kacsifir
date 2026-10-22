// "Kaya" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { kayaTimes } from '../engine/scenes/kaya.js';

export function synthKaya(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = kayaTimes(tl), { L } = tl;
  // çekiç: Manjhi vurdukça (0,625 sn'de bir) kısa taş tıkları; yıllar akarken
  const tick = [];
  for (let t = T.start + 0.2; t < T.km15; t += 1 / 1.6) tick.push(t);
  for (let i = 0; i < 33; i++) tick.push(T.rescue + (T.rescued - T.rescue) * Math.pow(i / 33, 0.5));
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.road, T.road + 1.2, 0.05], [T.silent0, T.probe, 0.05], [T.stamp0, T.hero, 0.06]],
    thock: [T.km15, T.note, T.drill],
    whip: [[T.whip0, T.whip1], [T.plateA, T.plateA + 0.75], [T.plateB, T.plateB + 0.75]],
    tick,
    riser: [L.l13.t0 + 1.0, L.l13.end],
    silence: [L.l13.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 35);
}

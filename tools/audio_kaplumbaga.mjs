// "Kaplumbağa" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { kaplumbagaTimes } from '../engine/scenes/kaplumbaga.js';

export function synthKaplumbaga(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = kaplumbagaTimes(tl), { L } = tl;
  // kuluçka: yavru sayacı tırmanırken kısa kabuk tıkları
  const tick = [];
  for (let t = T.prog; t < T.nine + 0.35; t += 0.22) tick.push(t);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.goats, T.gone + 0.6, 0.04], [T.dq, T.hero, 0.05]],
    thock: [T.one, T.name, T.q, T.diego],
    whip: [[T.plateA, T.plateA + 0.75], [T.whip0, T.whip1], [T.usa - 0.4, T.usa + 1.0], [L.l11.t0 - 0.4, L.l11.t0 + 0.9], [T.cmp0, T.cmp0 + 0.6]],
    hush: [[T.death, T.death + 2.2]],
    tick,
    riser: [L.l14.t0 + 0.8, L.l14.end],
    silence: [L.l14.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 39);
}

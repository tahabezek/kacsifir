// "Takvim" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { takvimTimes } from '../engine/scenes/takvim.js';

export function synthTakvim(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = takvimTimes(tl), { L } = tl;
  // ay geçişlerinde kısa tıklar (imleç süpürürken): Ocak→Eylül 8, Eylül→Aralık 3
  const tick = [];
  for (let k = 1; k <= 8; k++) tick.push(L.l02.t0 + 0.6 + (T.sun - L.l02.t0 - 0.6) * k / 8);
  for (let k = 1; k <= 3; k++) tick.push(T.sun + (T.dino0 - T.sun) * k / 3);
  return mixVoiceFilm(ep, tl, {
    rumble: [[T.bang, 0.25]],
    thock: [T.sun, T.dino0, T.dino1, T.humans, T.pyr],
    whip: [[T.dec31, T.zoom1], [T.pyr, T.pyr + 0.5], [T.loop0, T.loop0 + 0.9]],
    tick,
    riser: [L.l07.t0 + 0.2, L.l07.end],
    silence: [L.l07.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 48);
}

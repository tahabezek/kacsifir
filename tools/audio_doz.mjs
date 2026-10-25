// "Doz" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { dozTimes } from '../engine/scenes/doz.js';

export function synthDoz(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = dozTimes(tl), { L } = tl;
  // ipin kopması / ilmiğin kayması (3), kararın mühürlenmesi; pano kurulurken sayaç tıkları
  const thock = [T.e1, T.e2, T.e3, T.life];
  const tick = [T.three - 0.9, T.three - 0.6, T.three - 0.3];
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.phd - 0.1, T.phys + 0.6, 0.035]],
    thock,
    whip: [[T.whip0, T.whip1], [T.cmp0, T.cmp0 + 0.45]],
    rumble: [[T.flash, 0.16]],
    tick,
    riser: [L.l16.t0 + 0.8, L.l16.end],
    silence: [L.l16.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 59);
}

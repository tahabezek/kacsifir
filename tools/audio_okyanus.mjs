// "Okyanus" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { okyanusTimes } from '../engine/scenes/okyanus.js';

export function synthOkyanus(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = okyanusTimes(tl), { L } = tl;
  // takvim dolarken satır başına bir tık (19 satır)
  const tick = Array.from({ length: 19 }, (_, i) => T.fill0 + (T.fill1 - T.fill0) * (i + 1) / 19);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.drift0, T.land, 0.04], [T.sail, T.sail + 0.8, 0.05]],
    thock: [T.land, T.sunk, T.grip],
    whip: [[T.whip0, T.whip1], [T.sect0, T.sect0 + 0.75]],
    tick,
    riser: [L.l14.t0 + 0.8, L.l14.end],
    silence: [L.l14.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 34);
}

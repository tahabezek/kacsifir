// "Pi" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { piTimes } from '../engine/scenes/pi.js';

export function synthPi(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = piTimes(tl), { L } = tl;
  // halkalar hızlanırken sıklaşan tıklar; doruk basamakları yazılırken her iki basamakta bir tık
  const tick = [];
  for (let k = 0; k < 16; k++) tick.push(T.bilg + (T.unroll - T.bilg) * Math.pow(k / 16, 0.7));
  for (let i = 0; i < 39; i += 2) tick.push(T.otuz + 0.015 * i);
  for (let i = 0; i < 28; i++) tick.push(T.hero + 1.0 + i / 4);
  return mixVoiceFilm(ep, tl, {
    whip: [[T.unroll, T.unroll + 0.6], [T.curl, T.curl + 0.6], [T.zoom0, T.zoom0 + 0.9], [T.recurl, T.recurl + 0.7], [T.loop0, T.loop0 + 0.7]],
    thock: [T.uc, T.on, T.cm, T.hyd],
    tick,
    riser: [T.hes, L.l06.end],
    silence: [L.l06.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 57);
}

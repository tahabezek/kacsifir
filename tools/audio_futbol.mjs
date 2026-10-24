// "Futbol" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { futbolTimes } from '../engine/scenes/futbol.js';

export function synthFutbol(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = futbolTimes(tl), { L } = tl;
  // kulüp damgaları (5), Kazu'nun şutları (1,1 sn'de bir)
  const thock = [];
  for (let i = 0; i < 5; i++) thock.push(L.l02.t0 + 0.4 + i * ((T.sign + 0.4 - L.l02.t0) / 5));
  thock.push(T.off, T.ext);
  const tick = [];
  for (let t = T.back1; t < T.cmp0; t += 1.1) tick.push(t + 0.33);
  return mixVoiceFilm(ep, tl, {
    scratch: [[L.l02.t0 + 0.3, T.sign + 0.8, 0.04], [T.patron + 0.4, T.ext, 0.04]],
    thock,
    whip: [[T.whip0, T.whip1], [T.back0, T.back1], [T.cmp0, T.cmp0 + 0.45]],
    rumble: [[T.fight, 0.18]],
    tick,
    riser: [L.l14.t0 + 0.8, L.l14.end],
    silence: [L.l14.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 41);
}

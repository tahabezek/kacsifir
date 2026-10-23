// "Gemi" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { gemiTimes } from '../engine/scenes/gemi.js';

export function synthGemi(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = gemiTimes(tl), { L } = tl;
  // kürek: filika uzaklaşırken (1,2 sn'de bir) kısa su tıkları; 55 dakika sayacı akarken
  const tick = [];
  for (let t = T.boat + 0.2; t < T.aeg0; t += 1.2) tick.push(t);
  for (let t = T.min55; t < T.min55 + 1.2; t += 0.1) tick.push(t);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.sail, T.ram, 0.04], [T.train, T.home + 0.6, 0.05], [T.cmp0 + 0.5, T.span + 0.4, 0.05]],
    thock: [T.ram, T.berg, T.boat, T.both],
    whip: [[T.aeg0, T.aeg1], [T.whip0, T.whip1], [T.plate1, T.plate1 + 0.75], [T.plate2, T.plate2 + 0.75], [T.cmp0, T.cmp0 + 0.6]],
    rumble: [[T.mine, 0.3], [T.bomb1, 0.4], [T.bomb2, 0.4]],
    hush: [[T.bomb1, T.bomb1 + 1.4], [T.bomb2, T.bomb2 + 1.4]],
    tick,
    riser: [L.l16.t0 + 0.8, L.l16.end],
    silence: [L.l16.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 36);
}

// "Saat" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { saatTimes } from '../engine/scenes/saat.js';

export function synthSaat(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = saatTimes(tl), { L } = tl;
  // saat tıkları: Randy'nin her günü bittiğinde bir tık (kadran turu); kronometre başlarken saniye tıkları
  const tick = [L.l03.t0, L.l04.t0];
  for (let d = 3; d <= 10; d++) tick.push(L.l04.t0 + (L.l05.t0 - L.l04.t0) * (d - 2) / 8);
  tick.push(L.l05.t0);
  for (let k = 0; k < 4; k++) tick.push(T.mem30 + k);
  return mixVoiceFilm(ep, tl, {
    scratch: [[L.l03.t0 + 0.3, L.l03.end, 0.035], [L.l11.t0 + 0.3, T.notebookX, 0.05], [T.cmp0 + 0.5, L.l15.t0 + 1.6, 0.04]],
    thock: [T.stop65, T.rec, T.greet],
    whip: [[T.whip0, T.whip1], [T.notebook, T.notebook + 0.75], [T.cmp0, T.cmp0 + 0.6]],
    tick,
    riser: [L.l15.t0 + 0.8, L.l15.end],
    silence: [L.l15.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 38);
}

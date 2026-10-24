// "Voyager" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { voyagerTimes } from '../engine/scenes/voyager.js';

export function synthVoyager(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = voyagerTimes(tl), { L } = tl;
  // yıl tıkları: yolculuk boyunca her yıl bir tık (fırlatmadan bir ışık gününe); sinyal sırasında saat tıkları
  const tick = [];
  for (let k = 1; k <= 49; k++) { const u = k / 49; tick.push(T.launch + (T.reach - T.launch) * Math.pow(u, 0.85)); }
  for (let k = 1; k < 24; k += 2) tick.push(T.sig0 + 0.1 + (L.l05.end - T.sig0 - 0.1) * k / 24);
  return mixVoiceFilm(ep, tl, {
    thock: [T.jup, T.sat, T.out, T.reach, T.lightDone],
    rumble: [[T.launch, 0.3]],
    whip: [[T.mapIn, T.mapIn + 0.8], [T.cmp0, T.cmp0 + 0.6], [T.prox, T.prox + 0.6]],
    tick,
    riser: [L.l06.t0 + 0.5, L.l06.end],
    silence: [L.l06.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 49);
}

// "Kalabalık" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { kalabalikTimes } from '../engine/scenes/kalabalik.js';

export function synthKalabalik(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = kalabalikTimes(tl), { L } = tl;
  // sayaç tıkları (nüfus sayılırken), adım hışırtısı (şehirler yola çıkarken)
  const tick = []; for (let t = L.l02.t0; t < L.l02.end; t += 0.16) tick.push(t);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.flow0 + 0.2, L.l05.end, 0.05]],
    thock: [T.km, T.four, T.free, T.half],
    whip: [[T.dive - 0.25, T.dive + 1.1], [T.outA + 0.1, T.outA + 1.3], [T.hero - 1.45, T.hero - 0.2], [T.outB + 0.1, T.outB + 1.3]],
    tick,
    riser: [L.l05.t0 + 1.2, L.l05.end],
    silence: [L.l05.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 40);
}

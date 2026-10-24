// "Merdiven" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { merdivenTimes } from '../engine/scenes/merdiven.js';

export function synthMerdiven(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = merdivenTimes(tl), { L } = tl;
  // adım tıkları: kural anlatılırken saniyede bir basamak (gerçek tempo), sonra yalnız kilometre taşları
  const tick = [];
  for (let t = L.l02.t0 + 0.2; t < L.l03.t0; t += 1) tick.push(t);
  return mixVoiceFilm(ep, tl, {
    tick,
    thock: [T.everest, T.karman, T.iss, T.gps],
    whip: [[T.loop0, tl.duration - 0.05]],
    rumble: [[T.apollo + 0.1, 0.25]],
    riser: [L.l07.t0 + 0.8, L.l07.end],
    silence: [L.l07.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 42);
}

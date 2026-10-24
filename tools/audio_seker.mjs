// "Şeker" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { sekerTimes } from '../engine/scenes/seker.js';

export function synthSeker(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = sekerTimes(tl), { L } = tl;
  // on'un kuvvetleri: zoom boyunca her katman geçişinde (10 katta bir) kısa tık; çöküşte hızlanan tıklar
  const tick = [];
  for (let k = 1; k <= 10; k++) tick.push(T.zoom0 + (T.zoom1 - T.zoom0) * (0.5 - 0.5 * Math.cos(Math.PI * k / 10)));
  for (let k = 0; k < 14; k++) tick.push(T.remove + (T.hero - 0.1 - T.remove) * Math.pow(k / 14, 0.6));
  return mixVoiceFilm(ep, tl, {
    whip: [[T.zoom0, T.zoom0 + 0.6], [T.plate, T.plate + 0.5], [T.back - 0.4, T.back + 0.2]],
    thock: [T.empty, T.stadium],
    tick,
    rumble: [[T.ton, 0.45]],
    riser: [L.l04.t0 + 0.6, L.l04.end],
    silence: [L.l04.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 47);
}

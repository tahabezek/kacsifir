// "Şeker" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { sekerTimes } from '../engine/scenes/seker.js';

export function synthSeker(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = sekerTimes(tl), { L } = tl;
  // on'un kuvvetleri: zoom boyunca her katman geçişinde (10 katta bir) kısa tık; çöküşte hızlanan tıklar
  const tick = [];
  for (let k = 1; k <= 10; k++) tick.push(T.zoom0 + (T.zoom1 - T.zoom0) * (0.5 - 0.5 * Math.cos(Math.PI * k / 10)));
  for (let k = 0; k < 14; k++) tick.push(T.remove + (T.imp1 - T.remove) * Math.pow(k / 14, 0.6));
  return mixVoiceFilm(ep, tl, {
    whip: [[T.zoom0, T.zoom0 + 0.6], [T.plate, T.plate + 0.5], [T.shrink, T.back], [T.fall0, T.fall0 + 0.8], [T.loop0, T.loop0 + 0.7]],
    thock: [T.empty, T.pea, T.stadium, T.kucuk],
    tick,
    rumble: [[T.ton, 0.6], [T.fall0 + 0.5, 0.25]],
    riser: [L.l04.t0 + 0.6, L.l04.end],
    silence: [L.l04.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 47);
}

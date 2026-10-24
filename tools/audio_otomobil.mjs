// "Otomobil" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { otomobilTimes } from '../engine/scenes/otomobil.js';

export function synthOtomobil(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = otomobilTimes(tl), { L } = tl;
  // sayaç tıkları (otomobiller sayılırken); kuyruk uzarken hışırtı; geçen otomobilde gün tıkları
  const tick = []; for (let t = L.l02.t0; t < L.l02.end; t += 0.16) tick.push(t);
  for (let t = T.pass + 0.2; t < T.three; t += 0.12) tick.push(t);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.grow0, T.eight, 0.035]],
    thock: [T.carLen, T.circ, T.three],
    whip: [[L.l02.t0 - 0.2, L.l02.t0 + 0.9], [T.go - 0.3, T.go + 1.0]],
    tick,
    riser: [L.l05.t0 + 1.0, L.l05.end],
    silence: [L.l05.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 44);
}

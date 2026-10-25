// "Yol" (053) sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { yolTimeline, yolTimes } from '../engine/scenes/yol.js';

export function synthYol(ep) {
  const tl = yolTimeline(ep, readVoice(ep)), T = yolTimes(tl), { L } = tl;
  // sayaç tıkı: Güneş'e göre her 100 km'de bir (kare 0'dan galaksi geçişine kadar); şehir geçişlerinde tok ses
  const tick = [];
  for (let km = 100; km / 29.78 < T.gsw; km += 100) tick.push(km / 29.78);
  return mixVoiceFilm(ep, tl, {
    thock: [T.sit, T.v30, T.ank, T.ghost, T.v230],
    whip: [[T.orbit0, T.orbit0 + 0.9], [T.map0, T.map0 + 1.0], [T.gal0, T.gal0 + 1.1], [T.loop0, T.loop0 + 0.8]],
    tick,
    // tek riser soru satırının (l07) altında; sonra gerçek sessizlik, impact sessizliğin sonunda (l08'in ilk hecesi)
    riser: [L.l07.t0 + 0.6, L.l07.end],
    silence: [L.l07.end, T.imp],
    impact: T.imp,
    loopEnd: T.loop0 + 0.9,
  }, 53);
}

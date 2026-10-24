// "Katman" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { katmanTimes } from '../engine/scenes/katman.js';

export function synthKatman(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = katmanTimes(tl), { L } = tl;
  // katman tıkları: Göbeklitepe'den piramide çıkarken her bin yılda bir (yolculuğun 1,7 sn'sine yayılır)
  const tick = [];
  for (let k = 0; k < 7; k++) tick.push(L.l04.t0 - 0.1 + 1.7 * Math.pow(k / 7, 0.8));
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.gap + 0.2, T.gap + 1.4, 0.04], [T.today + 0.3, T.today + 1.0, 0.04], [T.moon - 0.2, T.moon + 1.1, 0.04]],
    thock: [T.gt, T.pyr, T.today + 0.9, T.mammoth, T.cleo],
    whip: [[T.poster1, T.poster2], [L.l04.t0 - 0.1, L.l04.t0 + 1.6], [T.gap, T.gap + 1.1], [L.l08.t0 - 0.1, L.l08.t0 + 0.9], [L.l09.t0 - 0.1, L.l09.t0 + 0.9], [T.loop0, tl.duration - 0.05]],
    tick,
    riser: [L.l05.t0 + 0.3, L.l05.end],
    silence: [L.l05.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 45);
}

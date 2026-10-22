// "Zaman" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { zamanTimes } from '../engine/scenes/zaman.js';

export function synthZaman(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = zamanTimes(tl), { L } = tl;
  // bekleme yılları: savaşın bitişinden teslime her 5 yılda bir takvim tıkı
  const tick = [];
  for (let k = 1; k <= 5; k++) tick.push(T.warEnd + (T.surrender - T.warEnd) * k / 6);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.launch, T.launch + 1.0, 0.06], [T.split0, T.split1 + 0.3, 0.07], [T.row2, T.hero, 0.05], [T.ratio, T.ratio + 0.95, 0.05]],
    thock: [T.land, T.surrender, T.row1],
    whip: [[T.whip0, T.whip1], [T.island, T.island + 1.3]],
    tick,
    riser: [T.row2 + 0.3, L.l14.end],
    silence: [L.l14.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 33);
}

// "Metal" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { metalTimes } from '../engine/scenes/metal.js';

export function synthMetal(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = metalTimes(tl), { L } = tl;
  // testere (l03), metal blok düşüşleri (l07), plaket ısırığı; hıçkırık şeridinin ilk tepeleri
  const thock = [T.bike + 0.35, T.cart + 0.35, T.tv + 0.35, T.plqEat];
  for (let i = 0; i < 9; i++) thock.push(T.nine + i * 0.07 + 0.3);
  const tick = [];
  for (let t = T.hic0; t < T.run0; t += 0.6) tick.push(t);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.bike + 0.3, T.swallow, 0.035], [T.eat0, T.done, 0.03]],
    thock,
    whip: [[T.whip0, T.whip1], [T.cmp0, T.cmp0 + 0.5]],
    rumble: [[T.fall, 0.16]],
    tick,
    // yükselen ses l15'ten yarım cümlenin (l16) sonuna; sonra gerçek sessizlik; vuruş "on" sesinin başında (40 ms önce)
    riser: [L.l15.t0, L.l16.end],
    silence: [L.l16.end, T.hero - 0.02],
    impact: T.hero - 0.02,
    loopEnd: T.loop0 + 0.9,
  }, 58);
}

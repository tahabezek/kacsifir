// "Uçuş" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { ucusTimes } from '../engine/scenes/ucus.js';

export function synthUcus(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = ucusTimes(tl), { L } = tl;
  // çipler ve sahne olayları: tok vuruş; gün sayacı: her 4 günde bir tık; doruk kopyaları: tık dizisi
  const thock = [T.hortum, T.yemek, T.banyo, T.oto, T.land + 0.35, T.kirk, T.kayit, T.inmiyor, T.n65, T.n300];
  const tick = [];
  for (let d = 4; d <= 64; d += 4) { const t = d <= 36 ? L.l03.t0 + (T.d36 - L.l03.t0) * d / 36 : T.d36 + (T.n64 - T.d36) * (d - 36) / 28; tick.push(t); }
  for (let i = 1; i < 5; i++) tick.push(T.hero + i * 0.11);
  return mixVoiceFilm(ep, tl, {
    // kanat çırpışı: büyük ebabil göründüğü sürece
    flutter: [[T.kus - 0.3, T.gl1]],
    thock,
    tick,
    whip: [[T.whip0, T.whip1], [T.gl0, T.gl1], [T.cmp0, T.cmp1]],
    // doruk: yükselen ses l15–l16 boyunca, "kuş,"tan sonra gerçek sessizlik, vuruş l17'nin başında (kopyalar başlar)
    riser: [L.l15.t0 + 0.4, L.l16.end - 0.15],
    silence: [L.l16.end - 0.35, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 62);
}

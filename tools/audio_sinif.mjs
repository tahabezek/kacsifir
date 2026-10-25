// "Sınıf" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { sinifTimes } from '../engine/scenes/sinif.js';

export function synthSinif(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = sinifTimes(tl), { L } = tl;
  // lamba yanışları: l03'te 11 tık, dorukta sıra başına bir tık (10 sıra)
  const tick = [];
  for (let k = 0; k < 11; k++) tick.push(T.lit0 + (T.on - 0.06 - T.lit0) * k / 10);
  for (let k = 0; k < 6; k++) tick.push(T.relight + k * 0.06);   // l05: sönen 6 lamba yeniden yanar
  for (let k = 0; k < 10; k++) tick.push(T.hero + 0.05 + (T.doksan - 0.1 - T.hero) * k / 9);
  return mixVoiceFilm(ep, tl, {
    scratch: [[L.l02.t0 + 0.15, T.turkiye + 0.3, 0.16], [T.write0, T.write1, 0.2], [T.loop0 + 0.55, T.loop0 + 1.25, 0.14]],
    whip: [[L.l02.t0, L.l02.t0 + 0.6], [L.l03.t0 - 0.35, L.l03.t0 + 0.35], [T.pull0, T.pull1], [T.back0, T.ret1], [T.page0, T.page0 + 0.8], [T.loop0, T.loop0 + 0.8]],
    thock: [T.census, T.on, T.bes, T.yeni],
    tick,
    riser: [T.pull1 - 0.3, T.sil0],
    silence: [T.sil0, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 50);
}

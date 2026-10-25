// "Karınca" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { karincaTimes } from '../engine/scenes/karinca.js';

export function synthKarinca(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = karincaTimes(tl), { L } = tl;
  // her sıfır yerine otururken kısa tık; kâğıtlar yığılırken seyrek hışırtı
  const tick = []; for (let k = 0; k < 15; k++) tick.push(T.z0 + (T.z14 - T.z0) * k / 14 + 0.2);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.yuz, T.hesap + 0.2, 0.05]],
    whip: [ [T.l05 - 0.35, T.l05 + 0.4], [T.l06 - 0.4, T.l06 + 0.4], [T.loop0, T.loop0 + 0.6]],
    thock: [T.yirmi - 0.05, T.milyon, T.kus, T.memeli],
    tick,
    rumble: [[T.agir, 0.4]],
    riser: [T.z11 - 0.4, T.sifir],   // "sıfır"da biter; sessizlikte efekt yok
    silence: [T.l04end, T.hit],
    impact: T.hit,
    loopEnd: T.loop0 + 0.9,
  }, 54);
}

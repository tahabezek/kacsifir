// "Ağaç" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { agacTimes } from '../engine/scenes/agac.js';

export function synthAgac(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = agacTimes(tl), { L } = tl;
  // yıldızlar bloğa uçarken ve ağaç ızgarası dolarken seyrek tıklar; her damgada tok vuruş
  const tick = [];
  for (let k = 0; k < 10; k++) tick.push(T.gather0 + 0.12 + 0.38 * k / 9);
  for (let k = 0; k < 8; k++) tick.push(T.dort - 0.12 + 0.42 * k / 7);
  for (let k = 0; k < 16; k++) tick.push(T.fill0 + 0.15 + (T.fill1 - T.fill0 - 0.15) * Math.pow(k / 16, 0.85));
  const thock = [T.yerde, T.uc];
  for (let k = 1; k < 7; k++) thock.push(T.morph1 + (T.yedi - T.morph1) * k / 6 - 0.05);
  thock.push(T.yedi - 0.02);
  return mixVoiceFilm(ep, tl, {
    whip: [[T.gather0, T.gather0 + 0.7], [T.canopy0, T.canopy0 + 0.6], [T.grove0, T.grove0 + 0.7], [T.back0, T.back0 + 0.7], [T.loop0, T.loop0 + 0.8]],
    thock,
    tick,
    riser: [L.l04.t0 + 0.3, L.l04.end],
    silence: [L.l04.end, T.hero],
    rumble: [[T.yedi - 0.02, 0.4]],   // 7. damga: tok ve belirgin
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 56);
}

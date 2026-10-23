// "Yıldırım" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { yildirimTimes } from '../engine/scenes/yildirim.js';

export function synthYildirim(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = yildirimTimes(tl), { L } = tl;
  // gün tıkları: dere boyunca her yeni gün (2–8) ve kulübe; dorukta ikinci–yedinci yıldırım
  const tick = [];
  for (let d = 2; d <= 8; d++) tick.push(T.creek + (d - 1) / 8 * (T.hut - T.creek));
  for (let i = 1; i < 7; i++) tick.push(T.hero + i * 0.07);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.cmp0 + 0.3, T.cmp0 + 1.9, 0.05]],
    flutter: [[T.breakup + 0.2, T.land]],
    thock: [T.land, T.hut, T.guin, T.mark],
    whip: [[T.plateA, T.plateA + 0.75], [T.plan, T.plan + 0.8], [T.whip0, T.whip1], [T.plateB, T.plateB + 0.75], [T.cmp0, T.cmp0 + 0.6]],
    rumble: [[T.storm, 0.18], [T.bolt, 0.45], ...T.strikes.map((s, i) => [s, i === 0 || i === 6 ? 0.32 : i >= 4 ? 0.16 : 0.24]), [T.tek + 0.4, 0.2]],
    hush: [[T.bolt, T.bolt + 1.2]],
    tick,
    riser: [L.l17.t0 + 0.8, L.l17.end],
    silence: [L.l17.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 37);
}

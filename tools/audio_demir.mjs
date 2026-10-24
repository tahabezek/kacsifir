// "Demir" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { demirTimes } from '../engine/scenes/demir.js';

export function synthDemir(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = demirTimes(tl), { L } = tl;
  // sıkıştırma tıkları (0,8 sn'de bir) ve balinanın ağzındaki saniyeler
  const tick = [];
  for (let t = T.tamp; t < T.blast - 0.2; t += 0.4) tick.push(t);
  for (let s = 1; s <= 30; s++) tick.push(T.gulp + (T.sec30 - T.gulp) * s / 30);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.dive, T.dive + 1.2, 0.03]],
    thock: [T.land, T.spit, T.whaleOn],
    whip: [[T.whip0, T.whip1], [T.skull0, T.skull0 + 0.75], [T.cmp0, T.cmp0 + 0.6]],
    rumble: [[T.blast, 0.45], [T.gulp, 0.25]],
    hush: [[T.blast, T.blast + 1.2], [T.dark, T.gulp + 1.0]],
    tick,
    riser: [L.l14.t0 + 0.8, L.l14.end],
    silence: [L.l14.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 43);
}

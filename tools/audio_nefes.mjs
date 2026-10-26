// "Nefes" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
// Kronometre her geçen dakikada (havuz) ve her 10 dakikada (balina) tıklar; derin denizde müzik susar; doruk öncesi
// gerçek sessizlik, vuruş sessizliğin sonunda, "yedi"nin başında.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { nefesTimes } from '../engine/scenes/nefes.js';

// t → dakika eşlemesinin tersini parça parça doğrusal anahtarlardan bulur
const inv = (K, m) => { for (let i = 1; i < K.length; i++) if (m <= K[i][1]) return K[i - 1][0] + (K[i][0] - K[i - 1][0]) * (m - K[i - 1][1]) / (K[i][1] - K[i - 1][1]); return null; };

export function synthNefes(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = nefesTimes(tl), { L } = tl;
  const whip = [L.l02.t0, T.whip0 + 0.3, T.sea, T.tag, T.cmp0, T.ask].map(b => [b - 0.25, b + 0.25]);
  const KA = [[T.down, 0], [T.m10, 10], [T.m20, 20], [T.rekor + 0.25, 24 + 37 / 60], [T.stopA, 29 + 3 / 60]];
  const KB2 = [[T.tag + 0.2, 0], [T.cikmiyor, 75], [T.h3, 180], [T.m42, 222]];
  const tick = [];
  for (let m = 1; m <= 29; m++) tick.push(inv(KA, m));
  for (let m = 10; m <= 220; m += 10) tick.push(inv(KB2, m));
  return mixVoiceFilm(ep, tl, {
    thock: [T.stopA, T.m42],
    whip,
    tick: tick.filter(x => x != null),
    hush: [[T.dark, T.tag]],
    riser: [L.l16.t0, L.l16.end],
    silence: [L.l16.end, T.hit],
    impact: T.hit,
    loopEnd: T.loop0 + 0.9,
  }, 66);
}

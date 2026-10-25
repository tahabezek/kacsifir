// "Termometre" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
// Felaket bölümünde (Pelée) ve kalbin durduğu aralıkta müzik susar; doruk öncesi gerçek sessizlik, vuruş sessizliğin
// sonunda, sayının ilk kelimesinin ("üç") başında.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { termometreTimes } from '../engine/scenes/termometre.js';

export function synthTermometre(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = termometreTimes(tl), { L } = tl;
  // sahne geçişleri (sola kayma)
  const whip = [L.l02.t0, T.hosp, T.whip0, T.map, T.cell, T.circus, T.cmp0, T.ask].map(b => [b - 0.25, b + 0.25]);
  // EKG: kalp yeniden atınca 75 vuruş/dk tık; takvim sayfası; 13,7'nin oturması
  const tick = [];
  for (let t = T.beat; t < T.whip0 - 0.3; t += 0.8) tick.push(t);
  return mixVoiceFilm(ep, tl, {
    thock: [T.temp, T.d10],
    whip,
    tick,
    rumble: [[T.erupt, 0.3]],
    hush: [[T.stop, T.beat], [L.l10.t0, T.cmp0]],
    // "…bulut ise tahminen" boyunca yükselir; ardından 0,8 sn'lik sessizlik ve vuruş "üç"ün başında
    riser: [L.l16.t0, L.l16.end],
    silence: [L.l16.end, T.hit],
    impact: T.hit,
    loopEnd: T.loop0 + 0.9,
  }, 60);
}

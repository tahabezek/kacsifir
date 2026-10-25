// "Bulut" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { bulutTimeline, bulutTimes } from '../engine/scenes/bulut.js';

export function synthBulut(ep) {
  const tl = bulutTimeline(ep, readVoice(ep)), T = bulutTimes(tl), { L } = tl;
  // geri çekilmede her on kat düzeyinde bir tık; fil sıraları inerken sıra başına tık; "kaç"ta ip gerilmesi
  const tick = [T.kac];
  for (let k = 1; k <= 3; k++) tick.push(T.pull0 + (T.pull1 - T.pull0) * (0.5 - 0.5 * Math.cos(Math.PI * k / 3.4)));
  for (let j = 0; j < 10; j++) tick.push(T.eleIn + j * 0.045 + 0.2);
  return mixVoiceFilm(ep, tl, {
    whip: [[0.5, 1.4], [T.cube0, T.cube0 + 0.9], [T.dive0, T.dive1 - 0.2], [T.pull0, T.pull1], [T.lens0, T.lens0 + 0.5], [T.home, T.home + 0.8]],
    thock: [T.km3, T.yarim, T.milyar, T.minicik],
    tick,
    riser: [L.l04.end - 1.2, L.l05a.end],
    silence: [L.l05a.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 55);
}

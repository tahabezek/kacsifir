// "Dalga" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { dalgaTimes } from '../engine/scenes/dalga.js';

export function synthDalga(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = dalgaTimes(tl), { L } = tl;
  // iki patlama: boğuk uzak gümbürtü (büyük vuruş değil); varılan yerlerde daha uzak ve kısık gümbürtü
  // Tonga'nın her turu ve istasyon/etiket anları: tok vuruş; barograf: tıkırtı
  const lap = k => T.boomT + (T.dort - T.boomT) * k / 4;
  const tick = [];
  for (let k = 0; k < 8; k++) tick.push(T.elli - 0.2 + k * 0.09);
  const m = mixVoiceFilm(ep, tl, {
    rumble: [[T.boomK, 0.4], [T.rod, 0.16], [T.boomT, 0.4], [T.alaska, 0.16]],
    thock: [T.k4800, lap(1), lap(2), lap(3), lap(4), T.t10000, T.k15],
    tick,
    whip: [[T.whip0, T.whip1], [T.cmp0, T.cmp1], [T.loop0, T.loop0 + 0.95]],
    // doruk: yükselen ses l15–l16 boyunca, "bunun"dan sonra ≥ 0,8 sn gerçek sessizlik, vuruş sessizliğin sonunda (l17'den 0,15 sn önce)
    riser: [L.l15.t0 + 0.4, L.l16.end - 0.15],
    silence: [L.l16.end + 0.02, T.hero],
    impact: T.hero,
    hush: [[T.boomK - 0.1, T.boomK + 1.2], [T.boomT - 0.1, T.boomT + 1.2]],
    loopEnd: T.loop0 + 0.9,
  }, 65);
  // ses videodan 0,25 sn uzun: birleştirmedeki -shortest son kareleri kesmesin
  const pad = Math.round(0.25 * m.sr), ext = x => { const y = new Float32Array(x.length + pad); y.set(x); return y; };
  return { ...m, L: ext(m.L), R: ext(m.R) };
}

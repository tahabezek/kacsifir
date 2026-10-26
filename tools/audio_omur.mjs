// "Ömür" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { omurTimes } from '../engine/scenes/omur.js';

export function synthOmur(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = omurTimes(tl), { L } = tl;
  // iliştirilen simgeler, ölüm halkası, yıl etiketleri, kıyas halkaları: tok vuruş; 28 köpekbalığı: tık dizisi;
  // halkalar büyürken kalem hışırtısı; sert kesmeler: tok vuruş; merceğin dönüşümü: savrulma
  const thock = [T.cutA, T.cutB, T.eyfel, T.van, T.bis, T.died, T.y1500 + 0.25, T.n392 + 0.1, T.s122, T.ann2, T.ann3];
  const tick = Array.from({ length: 28 }, (_, i) => T.n28 + i * 0.05);
  const m = mixVoiceFilm(ep, tl, {
    scratch: [[0.1, 1.0, 0.025], [T.born + 0.15, T.age14, 0.03], [L.l04.t0, T.yuz, 0.035], [T.bis + 0.3, T.died, 0.03]],
    thock,
    tick,
    whip: [[T.morph0, T.morph1]],
    // doruk: yükselen ses l15–l16 boyunca, "ömrün"den sonra gerçek sessizlik, vuruş "üç katından"ın başında
    riser: [L.l15.t0 + 0.4, L.l16.end - 0.15],
    silence: [L.l16.end - 0.35, T.hero],
    impact: T.hero,
    loopEnd: tl.duration,
  }, 63);
  // ses videodan 0,25 sn uzun: birleştirmedeki -shortest son kareleri kesmesin
  const pad = Math.round(0.25 * m.sr), ext = x => { const y = new Float32Array(x.length + pad); y.set(x); return y; };
  return { ...m, L: ext(m.L), R: ext(m.R) };
}

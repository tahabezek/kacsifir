// "Kayıp" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { kayipTimes } from '../engine/scenes/kayip.js';

export function synthKayip(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = kayipTimes(tl), { L } = tl;
  // simgeler ve takvim yaprakları: tok vuruş; telefon: üç çalış; kum fırtınası: hışırtı; 25 gün: kâğıt düşüşü
  const thock = [T.saat + 0.25, T.takvim + 0.25, T.gun + 0.25, T.aug, T.sep];
  const tick = [];
  for (const tc of [T.wake, T.eat, T.sleep]) for (let k = 0; k < 6; k++) tick.push(tc + k * 0.075);
  const m = mixVoiceFilm(ep, tl, {
    scratch: [[T.storm - 0.1, T.turbe + 0.6, 0.05], [T.lost25, L.l07.end + 0.4, 0.025]],
    thock,
    tick,
    whip: [[T.whip0, T.whip1], [T.cmp0, T.cmp1], [T.loop0, T.loop0 + 0.95]],
    // doruk: yükselen ses l15–l16 boyunca, "yolundan" sonra gerçek sessizlik, vuruş "iki yüz doksan bir"in başında
    riser: [L.l15.t0 + 0.4, L.l16.end - 0.15],
    silence: [L.l16.end - 0.35, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 61);
  // ses videodan 0,25 sn uzun: birleştirmedeki -shortest son kareleri kesmesin (döngü dikişinin son karesi videoda kalır)
  const pad = Math.round(0.25 * m.sr), ext = x => { const y = new Float32Array(x.length + pad); y.set(x); return y; };
  return { ...m, L: ext(m.L), R: ext(m.R) };
}

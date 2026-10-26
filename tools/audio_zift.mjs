// "Zift" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { ziftTimes, ziftDropTimes } from '../engine/scenes/zift.js';

export function synthZift(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = ziftTimes(tl), { L } = tl, D = tl.duration;
  // damlalar behere değdiği an (düşüş 0,35 sn); çekiç vuruşu
  const thock = ziftDropTimes(T).map(t => t + 0.33);
  // bilye: her yarım saniyede bir çana değer (görüntüdeki döngüyle aynı periyot)
  const per = p => D / Math.max(1, Math.round(D / p)), B = per(0.5), tick = [];
  for (let k = Math.ceil((T.ball - 0.3) / B); k * B < T.cmp0; k++) tick.push(k * B);
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.funnel, T.pour + 0.7, 0.02]],
    thock,
    whip: [[T.whip0, T.whip1], [T.cmp0, T.cmp0 + 0.5]],
    rumble: [[T.hit, 0.14]],
    tick,
    // yükselen ses l15'ten yarım cümlenin (l16) sonuna; sonra gerçek sessizlik; vuruş "yarım"ın başında
    riser: [L.l15.t0, L.l16.end],
    silence: [L.l16.end, T.hero - 0.02],
    impact: T.hero - 0.02,
    loopEnd: T.loop0 + 0.9,
  }, 64);
}

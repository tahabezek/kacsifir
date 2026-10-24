// "Deste" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları.
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { desteTimes, riffleDrops } from '../engine/scenes/deste.js';

export function synthDeste(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = desteTimes(tl), { L } = tl;
  // kart sesleri: riffle'da düşen her kart (çizimle aynı liste), yuvalara dağıtılan 52 kart, doruğun 40 sıfırı
  const tick = riffleDrops(T).map(d => d[0]);
  for (let i = 0; i < 52; i++) tick.push(T.deal + i * 0.04);
  for (let i = 0; i < 40; i++) tick.push(T.zeros0 + (i / 40) * (T.zeros1 - T.zeros0));
  return mixVoiceFilm(ep, tl, {
    scratch: [[T.print0, T.digits, 0.05], [T.bang, L.l05.end, 0.025]],
    thock: [T.c52, T.c51, T.c50, T.digits, T.oran, T.zeros1],
    whip: [[T.grid, T.grid + 0.5], [T.gather, T.gather + 0.4], [T.earth, T.earth + 0.8], [T.never, T.never + 0.6]],
    tick,
    riser: [L.l06.t0 + 0.3, L.l06.end],
    silence: [L.l06.end, T.hero],
    impact: T.hero,
    loopEnd: T.loop0 + 0.9,
  }, 46);
}

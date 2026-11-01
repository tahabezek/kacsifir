// "Stadyum" sesi: ortak anlatımlı film miksi (audio_voicefilm) + stadyum_core'daki ipuçları (tek zaman kaynağı).
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { stadyumTimes, stadyumCues } from '../engine/scenes/stadyum_core.js';

export function synthStadyum(ep) {
  const { tl, T } = stadyumTimes(ep, readVoice(ep));
  return mixVoiceFilm(ep, tl, stadyumCues(T), 41);
}

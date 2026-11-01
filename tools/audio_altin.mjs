// "Altın" sesi: ortak anlatımlı film miksi (audio_voicefilm) + altin_core'daki ipuçları (tek zaman kaynağı).
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { altinTimes, altinCues } from '../engine/scenes/altin_core.js';

export function synthAltin(ep) {
  const { tl, T } = altinTimes(ep, readVoice(ep));
  return mixVoiceFilm(ep, tl, altinCues(T), 67);
}

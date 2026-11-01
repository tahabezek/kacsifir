// "Buz ve ateş" sesi: ortak anlatımlı film miksi (audio_voicefilm) + buzates_core'daki ipuçları (tek zaman kaynağı).
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buzatesTimes, buzatesCues } from '../engine/scenes/buzates_core.js';

export function synthBuzates(ep) {
  const { tl, T } = buzatesTimes(ep, readVoice(ep));
  return mixVoiceFilm(ep, tl, buzatesCues(T), 60);
}

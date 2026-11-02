// "Mumlar" sesi: ortak anlatımlı film miksi (audio_voicefilm) + mumlar_core'daki ipuçları (tek zaman kaynağı).
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { mumlarTimes, mumlarCues } from '../engine/scenes/mumlar_core.js';

export function synthMumlar(ep) {
  const { tl, T } = mumlarTimes(ep, readVoice(ep));
  return mixVoiceFilm(ep, tl, mumlarCues(T), 63);
}

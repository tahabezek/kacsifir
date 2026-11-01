// "Dağ" sesi: ortak anlatımlı film miksi (audio_voicefilm) + dag_core'daki ipuçları (tek zaman kaynağı).
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { dagTimes, dagCues } from '../engine/scenes/dag_core.js';

export function synthDag(ep) {
  const { tl, T } = dagTimes(ep, readVoice(ep));
  return mixVoiceFilm(ep, tl, dagCues(T), 35);
}

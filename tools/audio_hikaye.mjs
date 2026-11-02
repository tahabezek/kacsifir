// "Hikâye" sesi: ortak anlatımlı film miksi + filmin kendi ipuçları (engine/films/f<id>.js → cues(T)).
// Film modülleri açılışta bir kez yüklenir (üst düzey await), böylece synth eşzamanlı kalır.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { hikayeTimes } from '../engine/hikaye_core.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'engine', 'films');
export const FILMS = {};
if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (/^f\d+\.js$/.test(f)) FILMS[f.slice(1, -3)] = await import(pathToFileURL(path.join(dir, f)).href);

export function synthHikaye(ep) {
  const { tl, T } = hikayeTimes(ep, readVoice(ep));
  return mixVoiceFilm(ep, tl, FILMS[ep.id].cues(T), Number(ep.id));
}

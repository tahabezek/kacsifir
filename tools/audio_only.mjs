// Yalnızca sesi yeniden üret ve mevcut sessiz videoya bağla (görüntü değişmediyse hızlı yol)
import fs from 'node:fs';
import path from 'node:path';
import { synth, writeWav, masterAndMux, measure } from './audio.mjs';

const ep = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dir = path.join('out', ep.id), wav = path.join(dir, 'audio.wav');
writeWav(wav, synth(ep));
masterAndMux(wav, path.join(dir, 'silent.mp4'), path.join(dir, 'video.mp4'));
console.log(measure(path.join(dir, 'video.mp4')));

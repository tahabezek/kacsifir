// Temas kâğıdı: verilen PNG'leri küçültüp ızgaraya dizer.  node tools/sheet.mjs out.png 4 a.png b.png ...
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
const [out, colsS, ...files] = process.argv.slice(2);
const cols = Number(colsS), w = Number(process.env.SHEET_W || 360), h = Math.round(w * 16 / 9);
const rows = Math.ceil(files.length / cols);
const inputs = files.flatMap(f => ['-i', f]);
let fc = files.map((_, i) => `[${i}:v]scale=${w}:${h}:flags=lanczos,pad=${w + 8}:${h + 8}:4:4:color=0x333333[s${i}]`).join(';');
const layout = files.map((_, i) => `${(i % cols) * (w + 8)}_${Math.floor(i / cols) * (h + 8)}`).join('|');
fc += ';' + files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${files.length}:layout=${layout}:fill=0x333333[o]`;
const r = spawnSync(ffmpegPath, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '[o]', '-frames:v', '1', out], { stdio: 'inherit' });
process.exit(r.status);

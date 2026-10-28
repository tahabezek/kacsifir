// Uzun video (16:9, YouTube): mevcut Hangisi filmlerini yeni anlatımlı bir çerçeveyle tek filmde toplar.
// Zaman çizelgesi tek kaynaktır: plan.json hem görüntüyü (engine/uzun.html) hem sesi kurar. Ses saattir.
//   node tools/uzun.mjs uzun/u01-hangisi-cilt-1.json plan     → out/U01/plan.json
//   node tools/uzun.mjs uzun/u01-....json audio               → out/U01/audio.wav (−14 LUFS)
//   node tools/uzun.mjs uzun/u01-....json render              → out/U01/video.mp4
//   node tools/uzun.mjs uzun/u01-....json stills 0,5.2,60      → out/U01/still_*.png
//   node tools/uzun.mjs uzun/u01-....json thumb                → out/U01/thumb.png (1280×720)
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';
import { findChrome, staticServer } from './render.mjs';
import { readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { mulberry32 } from '../engine/core.js';

const [specFile, mode = 'plan', arg] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const out = path.join('out', spec.id);
fs.mkdirSync(out, { recursive: true });
const epFile = id => 'episodes/' + fs.readdirSync('episodes').find(f => f.startsWith(id + '-'));
const prebuilt = id => 'prebuilt/' + fs.readdirSync('prebuilt').find(f => f.startsWith(id + '-'));

// ——— Plan ———
const ENTER = 1.0, EXIT = 0.45, GAP = 0.35;
function buildPlan() {
  const V = readVoice(spec), lines = {};
  const say = (id, t) => {
    const v = V[id], dur = v.dur ?? v.words.at(-1).t1, end = v.words?.at(-1)?.t1 ?? dur;
    lines[id] = { id, t0: t, t1: t + dur, end: t + end, words: (v.words || []).map(w => ({ w: w.w, t0: t + w.t0, t1: t + w.t1 })) };
    return t + Math.min(dur, end + 0.12);
  };
  const eps = {};
  for (const d of [...spec.duels.map(d => d.ep), spec.hookFrom.ep]) {
    if (eps[d]) continue;
    const ep = JSON.parse(fs.readFileSync(epFile(d), 'utf8')), tl = buildYolTimeline(ep, readVoice(ep)), ls = ep.voice.lines;
    const b = ls.find(x => /^(Yoksa|Peki|Öbür|Diğer)/.test(x.text));
    // film "Hangisi daha şaşırtıcı?" satırından sonra başlar, doruk satırının ardından, "Sen hangisine şaşırdın?"dan önce biter
    const s0 = tl.L[ls[1].id].t0 - 0.3, cut = Math.min(tl.L[ls.at(-1).id].t0 - 0.6, tl.L[ls.at(-2).id].end + 0.7);
    eps[d] = { file: epFile(d), video: prebuilt(d), s0, cut, b: tl.L[b.id].t0, hook: tl.L[spec.hookFrom.line]?.t0 };
  }
  let t = 0.15;
  const film = [], rows = [], toList = [];
  // kanca: 062'nin "10 ay" satırı ekranda, sunucu kancayı söyler
  const hk = eps[spec.hookFrom.ep];
  t = say('h1', t);
  const hookEnd = t + 0.25;
  film.push({ kind: 'hook', ep: spec.hookFrom.ep, T0: 0, T1: hookEnd, s0: hk.hook + 1.6 });
  toList.push({ t: hookEnd, stagger: true });
  t = hookEnd + EXIT + 0.5;
  t = say('h2', t) + 0.45;
  t = say('h3', t) + GAP;
  t = say('h4', t) + 0.55;
  spec.duels.forEach((d, k) => {
    const e = eps[d.ep];
    if (V['v' + k] && k > 0) t = say('v' + k, t) + GAP;
    const id = 'i' + (k + 1);
    t = say(id, t) + 0.5;
    // B tarafı, sunucu B'yi anlatmaya başladığında mürekkebe döner (virgülden sonraki ilk kelime)
    const ws = lines[id].words, ci = ws.findIndex((w, i) => i > 2 && w.w.endsWith(','));
    rows.push({ k, t: lines[id].t0, bAt: ws[ci + 1]?.t0 ?? lines[id].t0 });
    const enter = t, start = enter + ENTER, dur = e.cut - e.s0;
    film.push({ kind: 'duel', k, ep: d.ep, enter, T0: start, T1: start + dur, s0: e.s0, b: start + (e.b - e.s0) });
    t = start + dur;
    toList.push({ t, stagger: true, done: k });
    t += EXIT + 0.9;
  });
  t = say('o1', t) + GAP;
  const ask = t;
  t = say('o2', t) + 0.6;
  const endscreen = t;
  t = say('o3', t);
  const duration = Math.max(t + 12, endscreen + 18);
  const w = (id, i) => lines[id].words[i].t0;
  const intro = { seven: w('h3', 0) - 0.04, fourteen: w('h3', 2) - 0.04, cols: w('h4', 2) - 0.04 };
  return { intro, id: spec.id, serial: spec.serial, duels: spec.duels, eps, lines, film, rows, toList, ask, endscreen, duration };
}

const plan = mode === 'plan' ? buildPlan() : JSON.parse(fs.readFileSync(path.join(out, 'plan.json'), 'utf8'));
if (mode === 'plan') {
  fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1));
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  console.log(`süre ${mmss(plan.duration)} (${plan.duration.toFixed(1)} sn)`);
  console.log('Bölümler:\n0:00 Giriş\n' + plan.film.filter(f => f.kind === 'duel').map(f => `${mmss(f.enter - 6)} ${f.k + 1}. düello: ${spec.duels[f.k].a} mı, ${spec.duels[f.k].b.toLocaleLowerCase('tr')} mı?`).join('\n') + `\n${mmss(plan.ask - 3)} Sence hangisi?`);
}

// ——— Ses ———
const SR = 48000;
function decode(file, ch = 2) {
  const r = spawnSync(ffmpegPath, ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', String(ch), '-ar', String(SR), '-'], { maxBuffer: 1 << 30 });
  if (r.status) throw new Error('ffmpeg çözme: ' + file);
  return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
}
function writeWav(file, L, R) {
  const n = L.length, b = Buffer.alloc(44 + n * 8);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 8, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 8, 28); b.writeUInt16LE(8, 32); b.writeUInt16LE(32, 34); b.write('data', 36); b.writeUInt32LE(n * 8, 40);
  for (let i = 0; i < n; i++) { b.writeFloatLE(L[i], 44 + i * 8); b.writeFloatLE(R[i], 48 + i * 8); }
  fs.writeFileSync(file, b);
}
function lufs(file) {
  const r = spawnSync(ffmpegPath, ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  return { I: Number(s.match(/I:\s+(-?[\d.]+) LUFS/)[1]), TP: Number((s.match(/Peak:\s+(-?[\d.]+) dBFS/) || [0, 0])[1]) };
}
function buildAudio() {
  const D = plan.duration, N = Math.ceil(D * SR);
  const GL = new Float32Array(N), GR = new Float32Array(N), VO = new Float32Array(N), ML = new Float32Array(N), MR = new Float32Array(N);
  // anlatım
  for (const ln of Object.values(plan.lines)) {
    const x = decode(path.join('assets', 'voice', spec.id, ln.id + '.mp3'), 1);
    let pk = 1e-9; for (const v of x) pk = Math.max(pk, Math.abs(v));
    const g = 0.708 / pk, i0 = Math.round(ln.t0 * SR);
    for (let i = 0; i < x.length && i0 + i < N; i++) VO[i0 + i] += x[i] * g;
  }
  // müzik yatağı yalnızca çerçeve bölümlerinde (filmlerin kendi müziği var): La minör, 100 bpm, yumuşak pad + pluck
  const inFilm = t => plan.film.some(f => f.kind === 'duel' && t >= f.T0 - 0.2 && t < f.T1 + 0.1);
  const bedGain = new Float32Array(Math.ceil(D * 100));
  { let g = 0; for (let i = 0; i < bedGain.length; i++) { const tgt = inFilm(i / 100) ? 0 : 1; g += (tgt - g) * 0.06; bedGain[i] = g; } }
  const beat = 60 / spec.bpm, arp = [220, 261.63, 329.63, 392, 329.63, 261.63, 220, 196];
  const rnd = mulberry32(101), noise = () => rnd() * 2 - 1;
  for (let b = 0; b * beat < D; b++) {
    const t0 = b * beat; if (inFilm(t0) || t0 > plan.endscreen + 14) continue;
    for (let n = 0; n < 0.9 * SR; n++) { const tt = n / SR, i = Math.round((t0 + beat / 2) * SR) + n; if (i >= N) break; const pan = Math.sin(b) * 0.4, v = (Math.sin(2 * Math.PI * arp[b % 8] * tt) + 0.3 * Math.sin(4 * Math.PI * arp[b % 8] * tt)) * Math.exp(-tt * 5) * 0.045; ML[i] += v * (1 - pan); MR[i] += v * (1 + pan); }
    if (b % 4 === 0) { let ph = 0; for (let n = 0; n < 0.35 * SR; n++) { const tt = n / SR, i = Math.round(t0 * SR) + n; if (i >= N) break; ph += 2 * Math.PI * (48 + 80 * Math.exp(-tt * 30)) / SR; const v = Math.sin(ph) * Math.exp(-tt * 10) * 0.22; ML[i] += v; MR[i] += v; } }
  }
  { const notes = [110, 164.81, 220, 261.63], al = 1 - Math.exp(-2 * Math.PI * 900 / SR); let lp = 0;
    for (let n = 0; n < N; n++) { const tt = n / SR; let v = 0; for (const f of notes) for (let h = 1; h <= 3; h++) v += Math.sin(2 * Math.PI * f * h * tt) / Math.pow(h, 1.7); lp += al * (v - lp); const env = Math.min(1, tt / 1.2) * Math.min(1, (D - tt) / 2); ML[n] += lp * 0.02 * env; MR[n] += lp * 0.019 * env; } }
  // efektler: satır vurgusunda tok tık, geçişlerde hafif savrulma (görsel oturmadan 2 kare önce)
  const fx = (i, l, r = l) => { if (i >= 0 && i < N) { GL[i] += l; GR[i] += r; } };
  for (const r of plan.rows) for (let n = 0; n < 0.3 * SR; n++) { const tt = n / SR, v = (Math.sin(2 * Math.PI * 440 * tt) * Math.exp(-tt * 30) + 0.5 * Math.sin(2 * Math.PI * 659.25 * tt) * Math.exp(-tt * 45)) * 0.2; fx(Math.round((r.t - 2 / 30) * SR) + n, v); }
  const whips = [...plan.film.filter(f => f.kind === 'duel').map(f => [f.enter, f.enter + ENTER]), ...plan.toList.map(x => [x.t, x.t + EXIT + 0.3])];
  for (const [a, b] of whips) { const n0 = Math.round(a * SR), n1 = Math.round(b * SR); let lp = 0;
    for (let n = n0; n < n1 && n < N; n++) { const u = (n - n0) / (n1 - n0), fc = 400 + 2600 * Math.sin(Math.PI * u); lp += (1 - Math.exp(-2 * Math.PI * fc / SR)) * (noise() - lp); const e = Math.pow(Math.sin(Math.PI * u), 2) * 0.22; fx(n, lp * e * (0.2 + u), lp * e * (1.2 - u)); } }
  // çerçeve miksi: müzik anlatımın altında kısılır
  let env = 0; const att = 1 - Math.exp(-1 / (0.05 * SR)), rel = 1 - Math.exp(-1 / (0.35 * SR));
  for (let i = 0; i < N; i++) {
    const x = Math.abs(VO[i]); env += (x > env ? att : rel) * (x - env);
    const m = 0.55 * (1 - 0.6 * Math.min(1, env * 6)) * bedGain[Math.min(bedGain.length - 1, Math.floor(i / SR * 100))];
    GL[i] = VO[i] + ML[i] * m + GL[i] * 0.8; GR[i] = VO[i] + MR[i] * m + GR[i] * 0.8;
  }
  // çerçeve sesi filmlerle aynı yüksekliğe getirilir (−14 LUFS; sessiz kısımlar ölçüme girmez)
  writeWav(path.join(out, 'glue.wav'), GL, GR);
  const gl = lufs(path.join(out, 'glue.wav')), gg = Math.pow(10, (-14 - gl.I) / 20);
  for (let i = 0; i < N; i++) { GL[i] *= gg; GR[i] *= gg; }
  // filmler: hazır videonun kendi miksi, kesim noktalarında kısa geçişle
  for (const f of plan.film.filter(f => f.kind === 'duel')) {
    const x = decode(plan.eps[f.ep].video), i0 = Math.round(f.T0 * SR), a = Math.round(f.s0 * SR), len = Math.round((f.T1 - f.T0) * SR);
    for (let n = 0; n < len; n++) {
      const g = Math.min(1, n / (0.08 * SR), (len - n) / (0.35 * SR)), j = (a + n) * 2;
      if (j + 1 >= x.length || i0 + n >= N) break;
      GL[i0 + n] += x[j] * g; GR[i0 + n] += x[j + 1] * g;
    }
  }
  fs.unlinkSync(path.join(out, 'glue.wav'));
  writeWav(path.join(out, 'mix.wav'), GL, GR);
  // son kat: −14 LUFS, gerçek tepe ≤ −1 dBTP
  const m = lufs(path.join(out, 'mix.wav')), g2 = (-14 - m.I).toFixed(2);
  spawnSync(ffmpegPath, ['-y', '-v', 'error', '-i', path.join(out, 'mix.wav'), '-af', `volume=${g2}dB,alimiter=limit=0.84:level=false:attack=2:release=60`, '-ar', String(SR), '-c:a', 'pcm_f32le', path.join(out, 'audio.wav')]);
  fs.unlinkSync(path.join(out, 'mix.wav'));
  const f = lufs(path.join(out, 'audio.wav'));
  console.log(`çerçeve ${gl.I} LUFS → −14; son: ${f.I} LUFS, tepe ${f.TP} dBTP`);
}
if (mode === 'audio') buildAudio();

// ——— Görüntü ———
async function page(w = 1920, h = 1080) {
  const srv = await staticServer();
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none', '--force-color-profile=srgb'] });
  const pg = await browser.newPage();
  await pg.setViewport({ width: w, height: h });
  pg.on('pageerror', e => console.error('sayfa hatası:', e.message));
  pg.on('console', m => { if (m.type() === 'error') console.error('konsol:', m.text()); });
  await pg.goto(`http://127.0.0.1:${srv.address().port}/engine/uzun.html?plan=out/${spec.id}/plan.json${mode === 'thumb' ? '&thumb=1' : ''}`);
  await pg.waitForFunction('window.__ready === true', { timeout: 180000 });
  return { pg, w, h, close: async () => { await browser.close(); srv.close(); } };
}
if (mode === 'stills' || mode === 'thumb') {
  const P = await page(mode === 'thumb' ? 1280 : 1920, mode === 'thumb' ? 720 : 1080);
  const ts = mode === 'thumb' ? [0] : arg.split(',').map(Number);
  for (const t of ts) {
    await P.pg.evaluate(t => window.renderFrame(t), t);
    const name = mode === 'thumb' ? 'thumb.png' : `still_${t.toFixed(2)}.png`;
    fs.writeFileSync(path.join(out, name), await P.pg.screenshot({ type: 'png', clip: { x: 0, y: 0, width: P.w, height: P.h } }));
  }
  await P.close();
}
if (mode === 'render') {
  const P = await page(), N = Math.round(plan.duration * 30);
  const ff = spawn(ffmpegPath, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-i', path.join(out, 'audio.wav'),
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', path.join(out, 'video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await P.pg.evaluate(t => window.renderFrame(t), i / 30);
    const buf = await P.pg.screenshot({ type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`${i}/${N} · ${((Date.now() - t0) / 1000).toFixed(0)} sn`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await P.close();
  console.log(`→ ${out}/video.mp4 · ${plan.duration.toFixed(1)} sn · ${N} kare`);
}

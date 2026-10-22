// Anlatımlı filmler için ortak ses: satırlar ölçülmüş zamanlarına konur (ses saattir), müzik (La minör) anlatımın
// altında kısılır, efektler görüntüyle aynı takvimden gelen ipuçlarıyla yerleşir. Tek riser, tek impact, doruktan
// önce gerçek sessizlik. cues: { scratch: [[a, b, amp]], thock: [t], whip: [[a, b]], tick: [t], flutter: [[a, b]],
//   riser: [a, b], impact: t, silence: [a, b], loopEnd: t }
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { mulberry32 } from '../engine/core.js';

const SR = 48000;
function decode(file) {
  const r = spawnSync(ffmpegPath, ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  if (r.status) throw new Error('ffmpeg çözme: ' + file);
  return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4);
}

export function mixVoiceFilm(ep, tl, cues, seed = 7) {
  const { L } = tl, D = tl.duration, N = Math.ceil(D * SR);
  const VO = new Float32Array(N), Ml = new Float32Array(N), Mr = new Float32Array(N), Fl = new Float32Array(N), Fr = new Float32Array(N);
  const rnd = mulberry32(seed), noise = () => rnd() * 2 - 1;
  const addF = (i, l, r = l) => { if (i >= 0 && i < N) { Fl[i] += l; Fr[i] += r; } };
  const addM = (i, l, r = l) => { if (i >= 0 && i < N) { Ml[i] += l; Mr[i] += r; } };
  for (const ln of ep.voice.lines) {
    const x = decode(path.join('assets', 'voice', ep.id, ln.id + '.mp3'));
    let pk = 1e-9; for (const v of x) pk = Math.max(pk, Math.abs(v));
    const g = 0.708 / pk, i0 = Math.round(L[ln.id].t0 * SR);
    for (let i = 0; i < x.length; i++) if (i0 + i < N) VO[i0 + i] += x[i] * g;
  }
  const [s0, s1] = cues.silence || [-1, -1];
  const silent = t => t >= s0 && t < s1;
  const loopEnd = cues.loopEnd ?? D;

  // müzik
  const beat = 60 / ep.bpm;
  function kick(t0, amp) { let ph = 0; for (let n = 0; n < 0.35 * SR; n++) { const t = n / SR, f = 48 + 80 * Math.exp(-t * 30); ph += (2 * Math.PI * f) / SR; addM(Math.round(t0 * SR) + n, Math.sin(ph) * Math.exp(-t * 10) * amp); } }
  function pluck(t0, f, amp, pan) { for (let n = 0; n < 0.9 * SR; n++) { const t = n / SR, v = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 5) * amp; addM(Math.round(t0 * SR) + n, v * (1 - pan), v * (1 + pan)); } }
  const arp = [220, 261.63, 329.63, 392, 329.63, 261.63, 220, 196];
  for (let b = 0; b * beat < D; b++) {
    const t = b * beat; if (silent(t) || t > loopEnd) continue;
    kick(t, b % 4 === 0 ? 0.32 : 0.2); pluck(t + beat / 2, arp[b % arp.length], 0.05, Math.sin(b) * 0.4);
  }
  function pad(a, b, amp) {
    const notes = [110, 164.81, 220, 261.63], n0 = Math.round(a * SR), n1 = Math.min(N, Math.round(b * SR));
    let lp = 0; const al = 1 - Math.exp((-2 * Math.PI * 900) / SR);
    for (let n = n0; n < n1; n++) {
      const tt = n / SR, env = Math.min(1, (tt - a) / 1.2) * Math.min(1, (b - tt) / 0.8);
      let v = 0; for (const f of notes) for (let h = 1; h <= 4; h++) v += Math.sin(2 * Math.PI * f * h * tt) / Math.pow(h, 1.7);
      lp += al * (v - lp); addM(n, lp * env * amp, lp * env * amp * 0.96);
    }
  }
  if (s0 > 0) { pad(0, s0, 0.018); pad(s1, D, 0.03); } else pad(0, D, 0.02);

  // efektler
  for (const [a, b, amp] of cues.scratch || []) for (let t = a; t < b; t += 0.045 + rnd() * 0.03) {
    let lp = 0; const n0 = Math.round(t * SR), len = Math.round((0.025 + rnd() * 0.03) * SR);
    for (let n = 0; n < len; n++) { const x = noise(); lp += 0.55 * (x - lp); const v = (x - lp) * Math.sin(Math.PI * n / len) * amp; addF(n0 + n, v * 0.9, v); }
  }
  for (const [a, b] of cues.flutter || []) for (let t = a; t < b; t += 1 / 3.2) {
    let lp = 0; const n0 = Math.round(t * SR);
    for (let n = 0; n < 0.12 * SR; n++) { const x = noise(); lp += 0.08 * (x - lp); addF(n0 + n, lp * Math.sin(Math.PI * n / (0.12 * SR)) * 0.09); }
  }
  for (const t0 of cues.thock || []) for (let n = 0; n < 0.3 * SR; n++) { const t = n / SR, v = (Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 30) + 0.5 * Math.sin(2 * Math.PI * 659.25 * t) * Math.exp(-t * 45)) * 0.22; addF(Math.round((t0 - 2 / 30) * SR) + n, v); }
  for (const [a, b] of cues.whip || []) {
    const n0 = Math.round(a * SR), n1 = Math.round(b * SR); let lp = 0;
    for (let n = n0; n < n1; n++) { const u = (n - n0) / (n1 - n0), fc = 400 + 3000 * Math.sin(Math.PI * u); lp += (1 - Math.exp(-2 * Math.PI * fc / SR)) * (noise() - lp); const e = Math.pow(Math.sin(Math.PI * u), 2) * 0.32; addF(n, lp * e * (1.2 - u), lp * e * (0.2 + u)); }
  }
  for (const t0 of cues.tick || []) for (let n = 0; n < 0.06 * SR; n++) { const tt = n / SR, v = (noise() * Math.exp(-tt * 300) + Math.sin(2 * Math.PI * 2100 * tt) * Math.exp(-tt * 90) * 0.5) * 0.12; addF(Math.round(t0 * SR) + n, v); }
  if (cues.riser) {
    const [a, b] = cues.riser; let lp = 0, ph = 0; const n0 = Math.round(a * SR), n1 = Math.round(b * SR);
    for (let n = n0; n < n1; n++) { const u = (n - n0) / (n1 - n0), fc = 300 * Math.pow(18, u); lp += (1 - Math.exp(-2 * Math.PI * fc / SR)) * (noise() - lp); ph += 2 * Math.PI * 220 * Math.pow(3, u) / SR; const e = Math.pow(u, 2.2) * 0.22; addF(n, (lp + Math.sin(ph) * 0.15) * e); }
  }
  if (cues.impact != null) {
    let ph = 0, lp = 0; const n0 = Math.round((cues.impact - 2 / 30) * SR);
    for (let n = 0; n < 1.6 * SR; n++) { const t = n / SR, f = 32 + 50 * Math.exp(-t * 6); ph += 2 * Math.PI * f / SR; lp += 0.08 * (noise() - lp); addF(n0 + n, (Math.sin(ph) * Math.exp(-t * 2.2) + lp * 2 * Math.exp(-t * 12) + (n < 90 ? noise() * 0.5 * (1 - n / 90) : 0)) * 0.6); }
  }

  // miks
  let e = 0; const att = 1 - Math.exp(-1 / (0.05 * SR)), rel = 1 - Math.exp(-1 / (0.35 * SR));
  const Lc = new Float32Array(N), Rc = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = Math.abs(VO[i]); e += (x > e ? att : rel) * (x - e);
    const m = silent(i / SR) ? 0 : 0.55 * (1 - 0.6 * Math.min(1, e * 6));
    Lc[i] = VO[i] + Ml[i] * m + Fl[i] * 0.8; Rc[i] = VO[i] + Mr[i] * m + Fr[i] * 0.8;
  }
  let peak = 1e-9; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(Lc[i]), Math.abs(Rc[i]));
  const g = 0.708 / peak; for (let i = 0; i < N; i++) { Lc[i] *= g; Rc[i] *= g; }
  return { L: Lc, R: Rc, duration: D, sr: SR };
}

export const readVoice = ep => JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));

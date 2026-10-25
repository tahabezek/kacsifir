// "İlan" sesi: ortak anlatımlı film miksi (audio_voicefilm) + bu filmin ipuçları; üstüne alkış katmanı ("Cumhuriyet!"
// kelimesinin bitişinden: düşük geçiren, rastgele aralıklı el çırpma kümeleri, kısa kuyruk) ve l06'da haber
// tıkırtısı (mors benzeri). Tek riser, doruktan önce gerçek sessizlik, impact sessizliğin sonunda (konuşmanın altında değil).
import { mixVoiceFilm, readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { ilanTimes } from '../engine/scenes/ilan.js';
import { mulberry32 } from '../engine/core.js';

export function synthIlan(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = ilanTimes(tl), { L } = tl;
  const tick = [];
  for (let t = 0.5; t < T.in0; t += 1) tick.push(t);   // saat
  tick.push(T.dakika - 0.04);                          // yelkovan 20.29'a tıklar
  const r = mulberry32(529);
  for (let t = T.wire0; t < T.wire1; ) { const g = 2 + Math.floor(r() * 4); for (let k = 0; k < g; k++) { tick.push(t); t += r() < 0.5 ? 0.07 : 0.2; } t += 0.16 + r() * 0.12; }
  const mix = mixVoiceFilm(ep, tl, {
    whip: [[T.in0 + 0.2, T.in1], [T.zo0, T.zo0 + 0.6], [T.zo0 + 0.6, T.zo1], [tl.loop0, tl.loop0 + 1.0]],
    thock: [T.yuz, T.altida - 0.35, T.yirmi, T.yuz2, T.on],
    tick,
    riser: [L.l07.t0 + 1.2, T.sil0],
    silence: [T.sil0, T.impact],
    impact: T.impact,
    loopEnd: tl.loop0 + 0.9,
  }, 52);
  // alkış: ~45 kişi, her biri kendi temposunda 2–3 sn çırpar; her çırpma kısa, düşük geçiren gürültü (≈1,8 kHz),
  // hafif oda yansıması; toplam zarf hızlı yükselir, 2,6 sn'de söner
  const SR = mix.sr, N = mix.L.length, ar = mulberry32(77), a0 = L.l04.end - 0.02;
  const clap = (t, amp, pan) => {
    const n0 = Math.round(t * SR), len = Math.round(0.05 * SR); let lp = 0, lp2 = 0;
    const fc = 1200 + ar() * 1300, al = 1 - Math.exp(-2 * Math.PI * fc / SR);
    for (let n = 0; n < len && n0 + n < N; n++) {
      const x = ar() * 2 - 1; lp += al * (x - lp); lp2 += 0.08 * (lp - lp2);
      const env = n < 0.002 * SR ? n / (0.002 * SR) : Math.exp(-(n - 0.002 * SR) / (0.009 * SR));
      const v = (lp - lp2 * 0.6) * env * amp;
      mix.L[n0 + n] += v * (1 - 0.5 * pan); mix.R[n0 + n] += v * (1 + 0.5 * pan);
      const d = Math.round(0.023 * SR); if (n0 + n + d < N) { mix.L[n0 + n + d] += v * 0.18 * (1 + 0.5 * pan); mix.R[n0 + n + d] += v * 0.18 * (1 - 0.5 * pan); }
    }
  };
  for (let p = 0; p < 45; p++) {
    const pan = ar() * 2 - 1, rate = 3.2 + ar() * 2.2, start = a0 + ar() * 0.35, stop = a0 + 1.9 + ar() * 0.9, base = 6.5 * (0.022 + ar() * 0.02);
    for (let t = start; t < stop; t += (1 / rate) * (0.85 + ar() * 0.3)) {
      const env = Math.min(1, (t - a0) / 0.25) * Math.pow(1 - (t - a0) / (stop - a0 + 0.3), 1.2);
      clap(t, base * env, pan);
    }
  }
  let peak = 1e-9; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(mix.L[i]), Math.abs(mix.R[i]));
  if (peak > 0.708) { const g = 0.708 / peak; for (let i = 0; i < N; i++) { mix.L[i] *= g; mix.R[i] *= g; } }
  return mix;
}

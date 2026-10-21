// № 023 domino zincirinin sesi: görüntüyle aynı çekirdekten (engine/scenes/domino_core.js) sentezlenir.
// Her taşın tıkı bir öncekinden tam bir beşli (×1,5 = frekans oranı 3:2) pestir; oktavla katlanır, böylece
// zincir hiç bitmeyen bir inişe benzer. Büyük taşlara gövde ve gürleme eklenir. Doruktan önce tek riser, gerçek
// sessizlik, tek impact. Döngü: kuyruklar dosyanın başına sarılır (dikiş duyulmaz).
import { buildDominoTimeline, dominoCues, calcTicks, CALC, N } from '../engine/scenes/domino_core.js';
import { mulberry32, seg, clamp01 } from '../engine/core.js';

const SR = 48000;

export function synthDomino(ep) {
  const cues = dominoCues(ep), tl = buildDominoTimeline(ep);
  const D = cues.duration, NS = Math.ceil(D * SR);
  const L = new Float32Array(NS), R = new Float32Array(NS);
  const rnd = mulberry32(2323);
  const noise = () => rnd() * 2 - 1;
  // döngü: dosya sonunu aşan örnek başa eklenir
  const add = (i, l, r = l) => { i = ((i % NS) + NS) % NS; L[i] += l; R[i] += r; };
  const silent = t => t >= cues.silence0 && t < cues.land;
  const smooth = x => x * x * (3 - 2 * x);

  // Lake ahşap tık: kısa uyarım + serbest çubuk modları (1 : 2,76 : 5,40)
  function tok(t0, f0, amp, decay, pan) {
    const n0 = Math.round(t0 * SR);
    let lp = 0;
    const len = Math.round(Math.min(1.2, decay * 7) * SR);
    for (let n = 0; n < len; n++) {
      const t = n / SR;
      const ex = n < 0.002 * SR ? noise() * (1 - n / (0.002 * SR)) : 0;
      lp += 0.45 * (ex - lp);
      const v = (lp * 1.4
        + Math.sin(2 * Math.PI * f0 * t) * Math.exp(-t / decay)
        + 0.5 * Math.sin(2 * Math.PI * f0 * 2.756 * t) * Math.exp(-t / (decay * 0.55))
        + 0.22 * Math.sin(2 * Math.PI * f0 * 5.404 * t) * Math.exp(-t / (decay * 0.3))) * amp;
      add(n0 + n, v * (1 - pan), v * (1 + pan));
    }
  }
  // Gövde: büyük taş yere/taşa çarptığında düşen alçak ton + gürleme
  function body(t0, f, amp, decay, rumble) {
    const n0 = Math.round(t0 * SR);
    let ph = 0, lp = 0, lp2 = 0;
    const len = Math.round(decay * 6 * SR);
    for (let n = 0; n < len; n++) {
      const t = n / SR, ff = f * (1 + 0.8 * Math.exp(-t * 18));
      ph += (2 * Math.PI * ff) / SR;
      lp += 0.02 * (noise() - lp); lp2 += 0.05 * (lp - lp2);
      const v = (Math.sin(ph) * Math.exp(-t / decay) + rumble * lp2 * 9 * Math.exp(-t / (decay * 1.6))) * amp;
      add(n0 + n, v, v * 0.96);
    }
  }
  // Kalem cızırtısı: ölçü çizgisi çizilirken (süresi çizgi kadar)
  function pencil(a, b, amp) {
    let lp = 0, hp = 0;
    for (let n = Math.round(a * SR); n < Math.round(b * SR); n++) {
      const u = (n / SR - a) / (b - a);
      const x = noise(); hp = x - lp; lp += 0.25 * (x - lp);
      const env = Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(n / SR * 2 * Math.PI * 23)) * amp;
      add(n, hp * env * 0.9, hp * env);
    }
  }
  // Kâğıt hışırtısı: maket açılırken
  function paper(a, dur, amp) {
    let lp = 0;
    for (let n = 0; n < dur * SR; n++) {
      const u = n / (dur * SR);
      lp += 0.3 * (noise() - lp);
      const crack = rnd() < 0.0025 ? noise() * 3 : 0;
      const env = Math.pow(Math.sin(Math.PI * u), 1.5) * amp;
      add(Math.round(a * SR) + n, (lp + crack) * env, (lp + crack) * env * 0.85);
    }
  }
  function whoosh(a, b, amp, down) {
    let lp = 0;
    for (let n = Math.round(a * SR); n < Math.round(b * SR); n++) {
      const u = (n / SR - a) / (b - a);
      const fc = down ? 6000 * Math.pow(0.04, u) : 300 * Math.pow(12, u);
      lp += (1 - Math.exp((-2 * Math.PI * fc) / SR)) * (noise() - lp);
      const env = Math.sin(Math.PI * Math.min(1, u * 1.1)) * amp;
      add(n, lp * env, lp * env * 0.92);
    }
  }
  function riser(a, b, amp) {
    let lp = 0, ph = 0;
    for (let n = Math.round(a * SR); n < Math.round(b * SR); n++) {
      const u = (n / SR - a) / (b - a);
      lp += (1 - Math.exp((-2 * Math.PI * 250 * Math.pow(24, u)) / SR)) * (noise() - lp);
      ph += (2 * Math.PI * 110 * Math.pow(4, u)) / SR;
      const env = Math.pow(u, 2.2) * amp;
      add(n, (lp * 0.9 + Math.sin(ph) * 0.2) * env, (lp * 0.9 + Math.sin(ph * 1.004) * 0.2) * env);
    }
  }
  function impact(t0, amp) {
    let ph = 0, lp = 0, lp2 = 0;
    for (let n = 0; n < 3.2 * SR; n++) {
      const t = n / SR, f = 28 + 46 * Math.exp(-t * 5);
      ph += (2 * Math.PI * f) / SR;
      lp += 0.06 * (noise() - lp); lp2 += 0.02 * (noise() - lp2);
      const v = (Math.sin(ph) * Math.exp(-t * 1.5) + lp * 2.4 * Math.exp(-t * 9) + lp2 * 6 * Math.exp(-t * 1.1) + (n < 120 ? noise() * 0.7 * (1 - n / 120) : 0)) * amp;
      add(Math.round(t0 * SR) + n, v, v * 0.97);
    }
  }
  // Pad: La minör, çok alçak; sessizlikte susar, doruktan sonra açılır, dalışta söner
  function pad(a, b, amp, fadeIn, fadeOut) {
    const notes = [55, 110, 164.81, 220, 261.63];
    let l1 = 0, r1 = 0;
    const al = 1 - Math.exp((-2 * Math.PI * 900) / SR);
    for (let n = Math.round(a * SR); n < Math.round(b * SR); n++) {
      const t = n / SR;
      if (silent(t)) continue;
      const env = Math.min(1, (t - a) / fadeIn) * Math.min(1, (b - t) / fadeOut);
      let l = 0, r = 0;
      for (const f of notes) for (let h = 1; h <= 4; h++) { const w = 1 / Math.pow(h, 1.7); l += Math.sin(2 * Math.PI * f * h * 0.998 * t) * w; r += Math.sin(2 * Math.PI * f * h * 1.002 * t) * w; }
      l1 += al * (l - l1); r1 += al * (r - r1);
      add(n, l1 * env * amp, r1 * env * amp);
    }
  }

  // — Yerleşim —
  // oda tonu: kâğıt masa, çok alçak, kesintisiz (döngüde dikiş yok)
  { let lp = 0; for (let n = 0; n < NS; n++) { lp += 0.01 * (noise() - lp); const v = silent(n / SR) ? 0 : lp * 0.05; add(n, v, v * 0.9); } }

  for (const h of cues.hits) {
    const t = h.t + 0.015;                      // ses, görüntünün sonucu gibi okunur
    if (h.push) { tok(t, 2900, 0.11, 0.025, -0.2); continue; }
    const k = h.k;                              // taş k, taş k+1'e çarpar
    let f = 2600 / Math.pow(1.5, k);
    while (f < 360) f *= 2;
    const size = clamp01((k - 1) / 22);
    tok(t, f, 0.11 + 0.11 * smooth(size), 0.03 + 0.05 * size, ((k % 3) - 1) * 0.18);
    if (k >= 9) body(t, Math.max(34, 150 / Math.pow(1.5, (k - 9) / 3.2)), 0.04 + 0.22 * smooth(clamp01((k - 9) / 24)), 0.07 + 0.5 * clamp01((k - 9) / 26), clamp01((k - 20) / 12));
    if (k >= 26 && k < N - 1) whoosh(h.t - 0.5, h.t + 0.05, 0.05 + 0.08 * clamp01((k - 26) / 8), false);
  }
  // ölçü çizgileri ve maketler (görüntüdeki zamanlamayla aynı)
  for (const s of ep.stops) {
    const ck = tl.c[s.k], isE = s.kind === 'everest';
    const s0 = ck - (isE ? 1.0 : 1.5);
    pencil(s0 + 0.18, s0 + 0.66, 0.05);
    pencil(s0 + 0.38, s0 + 0.86, 0.04);
    paper(ck - (isE ? 3.2 : 2.2), 1.0, 0.045);
  }
  // hesap satırı: her adımda bir beşli YUKARI (zincirin inişinin aynası); son adım vurgulu
  for (const { t, n } of calcTicks(tl)) {
    let f = 420 * Math.pow(1.5, n);
    while (f > 1700) f /= 2;
    tok(t, f, n === CALC.n ? 0.12 : 0.05, n === CALC.n ? 0.09 : 0.025, 0.1);
  }
  riser(cues.riser[0], cues.riser[1], 0.36);
  whoosh(tl.c[N] + 0.1, cues.silence0, 0.12, false);          // kırmızı taşın düşüşü, sessizliğe keskin kesilir
  impact(cues.land - 2 / 30, 1.0);                             // efekt, görsel oturmadan 2 kare önce başlar
  pad(tl.c[16] - 0.6, tl.dive[0] + 0.4, 0.028, 2.5, 1.2);
  whoosh(tl.dive[0] - 0.1, tl.dive[1] + 0.2, 0.22, true);      // dalış: ters nefes, döngüye iner

  { const a = Math.round(cues.silence0 * SR), b = Math.round((cues.land - 2 / 30) * SR), e = Math.round(0.01 * SR);
    for (let n = a - e; n < b; n++) { const g = n < a ? (a - n) / e : 0; L[n] *= g; R[n] *= g; } }
  // tepe/RMS 11 dB'i aşarsa yumuşak dizli sıkıştırma (tek vuruş yüzünden loudnorm hedefin altında kalmasın)
  let ss = 0; for (let i = 0; i < NS; i++) ss += L[i] * L[i] + R[i] * R[i];
  const rms = Math.sqrt(ss / (2 * NS)) || 1e-9, T = rms * Math.pow(10, 11 / 20);
  for (const ch of [L, R]) for (let i = 0; i < NS; i++) { const v = Math.abs(ch[i]); if (v > T) ch[i] = Math.sign(ch[i]) * (T + (v - T) * 0.25); }
  let peak = 1e-9;
  for (let i = 0; i < NS; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.708 / peak;
  for (let i = 0; i < NS; i++) { L[i] *= g; R[i] *= g; }
  return { L, R, duration: D, sr: SR };
}

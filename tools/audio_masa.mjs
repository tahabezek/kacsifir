// "Masa" bölümlerinin ortak ses mikseri (№ 024 domino sesinden genelleştirildi). Her bölüm kendi çekirdeğindeki
// ipuçlarıyla bu çalgıları çağırır; görüntü ve ses aynı zaman çizelgesini okur. Kuyruklar dosyanın başına sarılır
// (döngü dikişi duyulmaz). master(): doruk öncesi gerçek sessizlik, yumuşak dizli sıkıştırma, tepe −3 dBFS.
import { mulberry32 } from '../engine/core.js';

export const SR = 48000;

export function makeMixer(D, seed = 2323) {
  const NS = Math.ceil(D * SR);
  const L = new Float32Array(NS), R = new Float32Array(NS);
  const rnd = mulberry32(seed);
  const noise = () => rnd() * 2 - 1;
  const add = (i, l, r = l) => { i = ((i % NS) + NS) % NS; L[i] += l; R[i] += r; };
  const silences = [];                         // [a, b): bu aralıklar master'da tamamen susturulur
  const silent = t => silences.some(([a, b]) => t >= a && t < b);

  // Lake ahşap tık: kısa uyarım + serbest çubuk modları (1 : 2,76 : 5,40)
  function tok(t0, f0, amp, decay, pan = 0) {
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
  // Çan/zil: uyumsuz kısmi tonlar, uzun kuyruk (ör. küçük bir varış anı)
  function bell(t0, f0, amp, tail = 1.5, pan = 0) {
    const n0 = Math.round(t0 * SR), parts = [[1, 1], [2.76, 0.5], [5.4, 0.25], [8.93, 0.12]];
    for (let n = 0; n < tail * 4 * SR; n++) {
      const t = n / SR;
      let v = 0;
      for (const [r, a] of parts) v += a * Math.sin(2 * Math.PI * f0 * r * t) * Math.exp(-t / (tail / r ** 0.5));
      v *= amp * Math.min(1, t / 0.002);
      add(n0 + n, v * (1 - pan), v * (1 + pan));
    }
  }
  // Gövde: ağır bir şeyin oturuşu — düşen alçak ton + gürleme
  function body(t0, f, amp, decay, rumble = 0) {
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
  // Kalem cızırtısı: süresi çizgi kadar
  function pencil(a, b, amp) {
    let lp = 0, hp = 0;
    for (let n = Math.round(a * SR); n < Math.round(b * SR); n++) {
      const u = (n / SR - a) / (b - a);
      const x = noise(); hp = x - lp; lp += 0.25 * (x - lp);
      const env = Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(n / SR * 2 * Math.PI * 23)) * amp;
      add(n, hp * env * 0.9, hp * env);
    }
  }
  // Kâğıt hışırtısı: maket açılırken / kâğıt katlanırken
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
  // İp/tel gerilmesi: kısa tını (iplik çekilirken), perde verilir
  function pluck(t0, f0, amp, decay = 0.35, pan = 0) {
    const n0 = Math.round(t0 * SR);
    for (let n = 0; n < decay * 5 * SR; n++) {
      const t = n / SR;
      let v = 0;
      for (let h = 1; h <= 5; h++) v += Math.sin(2 * Math.PI * f0 * h * t) * Math.exp(-t * h * 1.2 / decay) / h;
      v *= amp * Math.min(1, t / 0.003);
      add(n0 + n, v * (1 - pan), v * (1 + pan));
    }
  }
  function whoosh(a, b, amp, down = false) {
    let lp = 0;
    for (let n = Math.round(a * SR); n < Math.round(b * SR); n++) {
      const u = (n / SR - a) / (b - a);
      const fc = down ? 6000 * Math.pow(0.04, u) : 300 * Math.pow(12, u);
      lp += (1 - Math.exp((-2 * Math.PI * fc) / SR)) * (noise() - lp);
      const env = Math.sin(Math.PI * Math.min(1, u * 1.1)) * amp;
      add(n, lp * env, lp * env * 0.92);
    }
  }
  // Filmde tek riser: sessizliğe keskin kesilir
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
  // Filmde tek impact: efekt, görsel oturmadan 2 kare önce başlar (çağıran t0 = an − 2/30 verir)
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
  // Pad: La minör, çok alçak; sessizlik aralıklarında susar
  function pad(a, b, amp, fadeIn = 2, fadeOut = 1, notes = [55, 110, 164.81, 220, 261.63]) {
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
  // Oda tonu: kâğıt masa, kesintisiz (döngüde dikiş yok)
  function room(amp = 0.08) {
    let lp = 0;
    for (let n = 0; n < NS; n++) { lp += 0.01 * (noise() - lp); const v = silent(n / SR) ? 0 : lp * amp; add(n, v, v * 0.9); }
  }
  // Dikiş yatağı: a → b (b > D olabilir; başa sarılır) alçak, sürekli ton
  function bed(a, b, amp = 0.05) {
    let lp = 0;
    for (let n = Math.round(a * SR); n < Math.round(b * SR); n++) {
      const t = n / SR, u = (t - a) / (b - a), env = Math.sin(Math.PI * u) * amp;
      lp += 0.004 * (noise() - lp);
      const v = (Math.sin(2 * Math.PI * 110 * t) * 0.5 + Math.sin(2 * Math.PI * 164.81 * t) * 0.3 + lp * 6) * env;
      add(n, v, v * 0.95);
    }
  }
  // Bitir: sessizlikler tamamen sessiz (10 ms kenar), tepe/RMS 11 dB üstü yumuşak sıkıştırma, tepe −3 dBFS
  function master() {
    const e = Math.round(0.01 * SR);
    for (const [a0, b0] of silences) {
      const a = Math.round(a0 * SR), b = Math.round(b0 * SR);
      for (let n = a - e; n < b; n++) { if (n < 0) continue; const g = n < a ? (a - n) / e : 0; L[n] *= g; R[n] *= g; }
    }
    let ss = 0; for (let i = 0; i < NS; i++) ss += L[i] * L[i] + R[i] * R[i];
    const rms = Math.sqrt(ss / (2 * NS)) || 1e-9, T = rms * Math.pow(10, 11 / 20);
    for (const ch of [L, R]) for (let i = 0; i < NS; i++) { const v = Math.abs(ch[i]); if (v > T) ch[i] = Math.sign(ch[i]) * (T + (v - T) * 0.25); }
    let peak = 1e-9;
    for (let i = 0; i < NS; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    const g = 0.708 / peak;
    for (let i = 0; i < NS; i++) { L[i] *= g; R[i] *= g; }
    return { L, R, duration: D, sr: SR };
  }

  return { SR, NS, noise, add, silences, silent, tok, bell, body, pencil, paper, pluck, whoosh, riser, impact, pad, room, bed, master };
}

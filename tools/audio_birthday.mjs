// № 026 doğum günü paradoksunun sesi: görüntüyle aynı çekirdekten (engine/scenes/birthday_core.js).
// Her figür kâğıttan kalkarken hışırdar ve takvime oturunca tıklar; her iplik gerildiğinde bir tel tınısı verir:
// kısa iplik tiz, uzun iplik pes (La minör pentatonik); Sıfır'ın ışınları tek bir pes perdede. "Seninle" anında
// ışınlar alçak bir akorla yanar; tek riser, 0,5 sn gerçek sessizlik, eşleşmede tek impact ve çan. Döngü çıkışında
// figürler son gelen ilk çıkar sırasıyla kâğıda yatar. Kuyruklar başa sarılır.
import { makeMixer } from './audio_masa.mjs';
import { buildBirthdayTimeline, birthdays, N_MAIN, N_MAX } from '../engine/scenes/birthday_core.js';

const R_FIG = 0.19;
const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.26, 783.99];

export function synthBirthday(ep) {
  const tl = buildBirthdayTimeline(ep), d = birthdays(), D = tl.duration;
  const xy = k => (k === 1 ? [0, 0] : [R_FIG * Math.cos(-Math.PI / 2 + (2 * Math.PI * d[k]) / 365), R_FIG * Math.sin(-Math.PI / 2 + (2 * Math.PI * d[k]) / 365)]);
  const m = makeMixer(D, 2626);
  m.silences.push([tl.silence0, tl.hero - 2 / 30]);
  m.room(0.07);
  for (let k = 2; k <= N_MAX; k++) {
    const main = k <= N_MAIN, t = tl.tA[k];
    m.paper(t - 0.18, 0.2, main ? 0.035 : 0.01);
    m.tok(t + 0.012, 1760 * Math.pow(2, -(k % 5) / 12), main ? 0.075 : 0.018, 0.018, ((k % 3) - 1) * 0.2);
    m.paper(tl.tE[k], 0.12, main ? 0.02 : 0.008);           // döngü: kâğıda yatış
  }
  tl.threads.forEach((th, q) => {
    const main = th.i <= N_MAIN;
    if (!main && q % 4) return;                              // 70'e tırmanışta tınıların dörtte biri: parıltı
    const [ax, az] = xy(th.i), [bx, bz] = xy(th.j);
    const len = Math.hypot(ax - bx, az - bz) / (2 * R_FIG);
    const f = th.j === 1 ? 196 : SCALE[Math.max(0, Math.min(SCALE.length - 1, Math.round((1 - len) * (SCALE.length - 1))))];
    m.pluck(th.t0 + th.dur, f, main ? 0.032 : 0.012, main ? 0.32 : 0.16, ((th.j % 5) - 2) * 0.12);
  });
  // "seninle": ışınlar yanarken alçak akor (La minör), sessizliğe keskin kesilir
  m.pad(tl.vay[0], tl.silence0, 0.03, 0.4, 0.05, [110, 164.81, 220, 261.63]);
  for (let k = 2; k <= N_MAIN; k += 3) m.pluck(tl.vay[0] + 0.05 * (k - 2), 196 * (1 + (k % 2) * 0.5), 0.02, 0.4, ((k % 5) - 2) * 0.15);
  // aha: 253 iplik sırayla yanarken ince bir tarama
  for (let g = 0; g < 253; g += 11) m.tok(tl.glow[0] + (g / 253) * (tl.glow[1] - tl.glow[0]), 2637, 0.018, 0.02, 0.3);
  m.riser(tl.riser[0], tl.riser[1], 0.34);
  m.impact(tl.hero - 2 / 30, 1.0);
  m.bell(tl.hero + 0.02, 1318.51, 0.09, 1.4);
  m.pad(4.6, tl.vay[0], 0.024, 2.5, 0.3);
  m.pad(tl.hero + 0.3, tl.reset[0] + 0.4, 0.026, 1.5, 1.0);
  m.whoosh(tl.reset[0] - 0.1, tl.reset[1] + 0.2, 0.2, true);
  m.bed(tl.reset[1] - 0.6, D + ep.timing.first + 0.3, 0.05);
  const out = m.master();
  // −14 LUFS'a ulaşabilmek için tepe/RMS ≈ 11 dB: üç geçişli yumuşak dizli sıkıştırma, her geçişte tepe −3 dBFS
  const n = out.L.length;
  for (let pass = 0; pass < 3; pass++) {
    let ss = 0; for (let i = 0; i < n; i++) ss += out.L[i] ** 2 + out.R[i] ** 2;
    const T = Math.sqrt(ss / (2 * n)) * Math.pow(10, 8 / 20);
    for (const ch of [out.L, out.R]) for (let i = 0; i < n; i++) { const v = Math.abs(ch[i]); if (v > T) ch[i] = Math.sign(ch[i]) * (T + (v - T) * 0.25); }
    let pk = 1e-9; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(out.L[i]), Math.abs(out.R[i]));
    for (let i = 0; i < n; i++) { out.L[i] *= 0.708 / pk; out.R[i] *= 0.708 / pk; }
  }
  return out;
}

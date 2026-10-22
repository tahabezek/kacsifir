// № 025 · Bütün su bir top olsa — ses: görüntüyle aynı çekirdekten (engine/scenes/water_core.js) sentezlenir.
// Geri çekilişte on'un her kuvvetinde bir tık (tam tonlarla yükselir); boşalmada akış ve her 100 km'de sayaç tıkı;
// yuvarlanmada hıza bağlı gürleme; tek riser, doruk öncesi gerçek sessizlik, tek impact; küçük toplar için çanlar.
// Oda tonu kesintisiz; dikiş yatağı dosyanın sonundan başına sarılır (döngüde çukur yok).
import { makeMixer, SR } from './audio_masa.mjs';
import { buildWaterTimeline, decadeTicks, ballR, rollAt } from '../engine/scenes/water_core.js';

export function synthWater(ep) {
  const tl = buildWaterTimeline(ep), D = tl.duration;
  const m = makeMixer(D, 2525);
  const sil0 = tl.land - tl.silence;
  m.silences.push([sil0, tl.land - 2 / 30]);
  m.room(0.1);
  m.bed(D - 2.2, D + 1.0, 0.11);                                 // dikiş yatağı: son 2,2 sn → ilk 1 sn

  m.tok(0.06, 2400, 0.09, 0.02, -0.15);                         // Sıfır topu kaldırır
  m.whoosh(tl.pull[0] + 0.1, tl.pull[1], 0.12, false);           // geri çekiliş
  for (const { t, d } of decadeTicks(tl)) m.tok(t + 0.012, 523.25 * Math.pow(2, (d + 1) * 2 / 12), 0.09, 0.03, (d % 2) * 0.2 - 0.1);
  m.bell(tl.pull[1] - 0.05, 220, 0.06, 1.6);                     // Dünya kadraja oturur
  m.pad(tl.pull[1], tl.dive[0] + 0.4, 0.026, 2.2, 1.2);

  m.paper(tl.drain[0], 0.8, 0.05);
  m.whoosh(tl.drain[0], tl.drain[1], 0.1, false);                // boşalma: su topa akar
  { let prev = 0;                                                // sayaç: her 100 km'de bir tık
    for (let t = tl.drain[0]; t < tl.drain[1]; t += 0.002) {
      const k = Math.floor(2 * ballR(tl, t, 'all') / 100e3);
      if (k > prev) { m.tok(t, 500 + 80 * k, 0.04, 0.02, 0.1); prev = k; }
    } }
  // yuvarlanma gürlemesi: seviye hızla orantılı, sessizlikte kesilir
  { let lp = 0, lp2 = 0;
    for (let n = Math.round(tl.roll[0] * SR); n < Math.round(sil0 * SR); n++) {
      const t = n / SR, v = (rollAt(tl, t + 0.01) - rollAt(tl, t - 0.01)) / 0.02;
      lp += 0.015 * (m.noise() - lp); lp2 += 0.04 * (lp - lp2);
      const a = Math.min(1, v * 0.9) * 0.9 * lp2 * 10;
      m.add(n, a, a * 0.95);
    } }
  m.riser(tl.riser[0], tl.riser[1], 0.34);
  m.impact(tl.land - 2 / 30, 1.0);

  // ölçü çizgileri (görüntüdeki zamanlamayla aynı)
  for (const t0 of [tl.land + 0.2, tl.land + 0.9, tl.land + 1.5, tl.fresh[1], tl.lake[1]]) m.pencil(t0 + 0.1, t0 + 0.6, 0.05);
  m.bell(tl.fresh[1] - 0.1, 659.25, 0.09, 1.2, 0.15);
  m.bell(tl.lake[1] - 0.1, 987.77, 0.07, 0.9, -0.15);

  m.whoosh(tl.dive[0] - 0.1, tl.dive[1] + 0.2, 0.2, true);      // dalış: Sıfır'a
  // ikinci yumuşak diz (RMS + 9 dB, 1:4), tepe −1,5 dBFS (true peak ≤ −1): bitmiş dosya −14 LUFS'a yaklaşsın
  const out = m.master(), { L, R } = out;
  let ss = 0; for (let i = 0; i < L.length; i++) ss += L[i] * L[i] + R[i] * R[i];
  const T = Math.sqrt(ss / (2 * L.length)) * Math.pow(10, 9 / 20);
  let peak = 1e-9;
  for (const ch of [L, R]) for (let i = 0; i < ch.length; i++) {
    const v = Math.abs(ch[i]); if (v > T) ch[i] = Math.sign(ch[i]) * (T + (v - T) * 0.25);
    peak = Math.max(peak, Math.abs(ch[i]));
  }
  const g = 0.84 / peak; for (const ch of [L, R]) for (let i = 0; i < ch.length; i++) ch[i] *= g;
  return out;
}

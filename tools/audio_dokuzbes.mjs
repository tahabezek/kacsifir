// "Dokuz beş" sesi (10 Kasım anma): müzik yok. Anlatım + ortam (dalga, uzak şehir uğultusu, martılar) + saat tıkları
// (09.04:57 → 09.05) + siren (yavaş kalkış, düz ton, yavaş iniş; uzaktan, yankılı) + vapur düdüğü + imzada kalem sesi.
// Saygı duruşunda trafik uğultusu söner; yalnız siren, dalga ve martı kalır. Kapanışta çok alçak tek bir drone.
// Zaman çizelgesi sahneyle aynı fonksiyondan (dokuzbesTimes) gelir.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { readVoice } from './audio_voicefilm.mjs';
import { buildYolTimeline } from '../engine/scenes/yolculuk_core.js';
import { dokuzbesTimes } from '../engine/scenes/dokuzbes.js';
import { mulberry32, ease, seg } from '../engine/core.js';

const SR = 48000;
function decode(file) {
  const r = spawnSync(ffmpegPath, ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  if (r.status) throw new Error('ffmpeg çözme: ' + file);
  return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4);
}

export function synthDokuzbes(ep) {
  const tl = buildYolTimeline(ep, readVoice(ep)), T = dokuzbesTimes(tl), { L } = tl, D = T.D, N = Math.ceil(D * SR);
  const VO = new Float32Array(N), Al = new Float32Array(N), Ar = new Float32Array(N), Sl = new Float32Array(N), Sr = new Float32Array(N);
  const rnd = mulberry32(1105), noise = () => rnd() * 2 - 1;
  for (const ln of ep.voice.lines) {
    const x = decode(path.join('assets', 'voice', ep.id, ln.id + '.mp3'));
    let pk = 1e-9; for (const v of x) pk = Math.max(pk, Math.abs(v));
    const g = 0.708 / pk, i0 = Math.round(L[ln.id].t0 * SR);
    for (let i = 0; i < x.length; i++) if (i0 + i < N) VO[i0 + i] += x[i] * g;
  }
  const addA = (i, l, r = l) => { if (i >= 0 && i < N) { Al[i] += l; Ar[i] += r; } };
  const addS = (i, l, r = l) => { if (i >= 0 && i < N) { Sl[i] += l; Sr[i] += r; } };
  // trafik yoğunluğu: sahnedeki araba hızıyla aynı eğri
  const traffic = t => (t < T.durur - 0.15 ? 1 : t < T.resume ? 1 - ease.state(seg(t, T.durur - 0.15, T.carStop - T.durur + 0.6)) : ease.state(seg(t, T.resume, 2.2)));

  // ortam: dalga (yavaş kabaran filtreli gürültü) + uzak şehir uğultusu
  let w1 = 0, w2 = 0, c1 = 0, c2 = 0, c3 = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR, x = noise();
    w1 += 0.02 * (x - w1); w2 += 0.08 * (w1 - w2);
    const swell = 0.55 + 0.45 * Math.sin(2 * Math.PI * t / 5.3) * Math.sin(2 * Math.PI * t / 2.9 + 1);
    c1 += 0.006 * (noise() - c1); c2 += 0.03 * (c1 - c2); c3 += 0.15 * (noise() - c3);
    const city = (c2 * 6 + c3 * 0.05) * 0.11 * traffic(t);
    addA(i, w2 * 2.4 * swell + city, w2 * 2.1 * (1.1 - swell * 0.3) + city * 0.94);
  }
  // martılar (seyrek; saygı duruşu boşluğunda da)
  const gullTimes = [1.6, 7.4, T.susar + 0.9, T.susar + 2.1, L.l04.t0 + 0.5, T.resume + 1.2, T.end + 1.4, T.saygi + 1.2];
  for (const t0 of gullTimes) {
    const n0 = Math.round(t0 * SR), dur = 0.55, pan = rnd() * 1.2 - 0.6;
    for (let k = 0; k < 2; k++) {
      let ph = 0; const off = Math.round(k * 0.24 * SR);
      for (let n = 0; n < dur * SR; n++) {
        const u = n / (dur * SR), f = 1650 - 650 * u + 120 * Math.sin(u * 30);
        ph += 2 * Math.PI * f / SR;
        const env = Math.sin(Math.PI * Math.min(1, u * 1.4)) ** 2 * (u < 0.71 ? 1 : 0);
        const v = (Math.sin(ph) * 0.6 + Math.sin(2 * ph) * 0.25 + Math.sin(3 * ph) * 0.1) * env * 0.022 * (k ? 0.7 : 1);
        addA(n0 + off + n, v * (1 - pan), v * (1 + pan));
      }
    }
  }
  // saat tıkları: 09.04:57 → 09.05:00 (saniye başlarında), kare 0'dan "beş"e kadar
  for (let s = Math.ceil(-T.bes); s <= 0; s++) {
    const t0 = T.bes + s; if (t0 < 0.05) continue;
    let lp = 0; const n0 = Math.round(t0 * SR);
    for (let n = 0; n < 0.05 * SR; n++) { const tt = n / SR, x = noise(); lp += 0.5 * (x - lp); const v = ((x - lp) * Math.exp(-tt * 380) + Math.sin(2 * Math.PI * 1900 * tt) * Math.exp(-tt * 160) * 0.4) * 0.09; addS(n0 + n, v, v * 0.9); }
  }
  // siren: motor kalkışı (2,8 sn), düz ton, iniş (3,5 sn); armonikler alçak geçiren süzgeçle yumuşatılır; uzaklık yankıları
  {
    const a = T.bes, b = T.sirenOff, up = 2.8, down = 3.6, n0 = Math.round(a * SR), n1 = Math.min(N, Math.round((b + down) * SR));
    const dry = new Float32Array(n1 - n0); let ph = 0, lp = 0, lp2 = 0;
    for (let n = n0; n < n1; n++) {
      const t = n / SR, uUp = Math.min(1, (t - a) / up), uDn = t > b ? Math.min(1, (t - b) / down) : 0;
      const spin = (1 - Math.pow(1 - uUp, 2)) * (1 - uDn * uDn * (3 - 2 * uDn));
      const f = 140 + 290 * spin + 3 * Math.sin(2 * Math.PI * 0.21 * t);
      ph += 2 * Math.PI * f / SR;
      let v = Math.sin(ph) + 0.42 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph) + 0.08 * Math.sin(5 * ph);
      const fc = 1300; lp += (1 - Math.exp(-2 * Math.PI * fc / SR)) * (v - lp); lp2 += (1 - Math.exp(-2 * Math.PI * fc / SR)) * (lp - lp2);
      const env = Math.pow(spin, 1.4);
      // saygı duruşu boşluğunda (l02 sonu → l03): boşluğun toplam seviyesi +3 dB olacak kadar (siren ×2,4); 0,4 sn yumuşak geçiş
      const gw = Math.min(seg(t, L.l02.end, 0.4), 1 - seg(t, L.l03.t0 - 0.4, 0.4)), gain = 1 + 1.4 * ease.state(Math.max(0, gw));
      dry[n - n0] = lp2 * env * gain;
    }
    for (const [dl, g, pan] of [[0, 0.06, 0], [0.19, 0.03, -0.4], [0.47, 0.022, 0.45], [0.83, 0.012, -0.2]]) {
      const off = Math.round(dl * SR);
      for (let i = 0; i < dry.length; i++) addS(n0 + i + off, dry[i] * g * (1 - pan), dry[i] * g * (1 + pan));
    }
  }
  // vapur düdüğü: iki ton (büyük üçlü), yavaş giriş, uzaktan
  {
    const a = T.vapurlar + 0.12, dur = 2.4, n0 = Math.round(a * SR); let lp = 0;
    for (let n = 0; n < (dur + 0.9) * SR; n++) {
      const t = n / SR, env = Math.min(1, t / 0.35) * (t < dur ? 1 : Math.exp(-(t - dur) * 5));
      let v = 0; for (const f of [116.5, 146.8]) for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f * h * t) / (h * h * 0.8 + 0.2);
      lp += (1 - Math.exp(-2 * Math.PI * 700 / SR)) * (v - lp);
      const s = lp * env * 0.05; addS(n0 + n, s * 0.85, s); addS(n0 + n + Math.round(0.31 * SR), s * 0.3, s * 0.25);
    }
  }
  // imza: kâğıtta kalem (yumuşak, filtreli sürtünme)
  { let lp = 0, hp = 0; const n0 = Math.round(T.sign0 * SR), n1 = Math.round(T.sign1 * SR);
    for (let n = n0; n < n1; n++) { const u = (n - n0) / (n1 - n0), x = noise(); lp += 0.35 * (x - lp); hp = x - lp; const env = Math.sin(Math.PI * u) ** 0.5 * (0.6 + 0.4 * Math.abs(Math.sin(u * 37))); addS(n, hp * env * 0.012, hp * env * 0.011); } }
  // kapanış drone'u: La1 + Mi2, çok alçak, l06'dan döngüye
  { const a = L.l06.t0, b = T.loop0 + 0.8, n0 = Math.round(a * SR), n1 = Math.min(N, Math.round(b * SR));
    for (let n = n0; n < n1; n++) { const t = n / SR, env = Math.min(1, (t - a) / 2.5) * Math.min(1, (b - t) / 1.2); const v = (Math.sin(2 * Math.PI * 55 * t) + 0.5 * Math.sin(2 * Math.PI * 82.4 * t) + 0.18 * Math.sin(2 * Math.PI * 110 * t)) * env * 0.035; addA(n, v, v * 0.97); } }

  // miks: anlatım altında ortam ve efektler kısılır (yalnız siren ve düdük daha az)
  let e = 0; const att = 1 - Math.exp(-1 / (0.05 * SR)), rel = 1 - Math.exp(-1 / (0.4 * SR));
  const Lc = new Float32Array(N), Rc = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = Math.abs(VO[i]); e += (x > e ? att : rel) * (x - e);
    const duck = 1 - 0.55 * Math.min(1, e * 6), duckS = 1 - 0.35 * Math.min(1, e * 6);
    Lc[i] = VO[i] + Al[i] * duck + Sl[i] * duckS; Rc[i] = VO[i] + Ar[i] * duck + Sr[i] * duckS;
  }
  // döngü dikişi: son 60 ms sıfıra, ilk 30 ms sıfırdan
  for (let i = 0; i < N; i++) { const t = i / SR, g = Math.min(1, t / 0.03, (D - t) / 0.06); Lc[i] *= g; Rc[i] *= g; }
  let peak = 1e-9; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(Lc[i]), Math.abs(Rc[i]));
  const g = 0.708 / peak; for (let i = 0; i < N; i++) { Lc[i] *= g; Rc[i] *= g; }
  return { L: Lc, R: Rc, duration: D, sr: SR };
}

// "Yolculuk" sesi: anlatım saattir. Satırlar ölçülmüş zamanlarına konur; müzik (La minör, 100 bpm) anlatımın
// altında kısılır; efektler görüntüyle aynı takvimden (engine/scenes/yolculuk_core.js) gelir.
// Filmde tek riser (dalıştan önce), tek impact (53 km), doruktan önce gerçek sessizlik.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { mulberry32, seg, ease } from '../engine/core.js';
import { buildYolTimeline, travelPlan, walkRoute, WALK } from '../engine/scenes/yolculuk_core.js';

const SR = 48000;

function decode(file) {
  const r = spawnSync(ffmpegPath, ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  if (r.status) throw new Error('ffmpeg çözme: ' + file);
  return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4);
}

export function synthYolculuk(ep) {
  const voice = JSON.parse(fs.readFileSync(path.join('assets', 'voice', ep.id, 'words.json'), 'utf8'));
  const tl = buildYolTimeline(ep, voice), { L, W } = tl;
  const WR = walkRoute(), plan = travelPlan(tl, WR);
  const D = tl.duration, N = Math.ceil(D * SR);
  const VO = new Float32Array(N), Ml = new Float32Array(N), Mr = new Float32Array(N), Fl = new Float32Array(N), Fr = new Float32Array(N);
  const rnd = mulberry32(2014), noise = () => rnd() * 2 - 1;
  const addF = (i, l, r = l) => { if (i >= 0 && i < N) { Fl[i] += l; Fr[i] += r; } };
  const addM = (i, l, r = l) => { if (i >= 0 && i < N) { Ml[i] += l; Mr[i] += r; } };

  // — anlatım: her satır tepe −3 dBFS'e eşitlenir —
  for (const ln of ep.voice.lines) {
    const x = decode(path.join('assets', 'voice', ep.id, ln.id + '.mp3'));
    let pk = 1e-9; for (const v of x) pk = Math.max(pk, Math.abs(v));
    const g = 0.708 / pk, i0 = Math.round(L[ln.id].t0 * SR);
    for (let i = 0; i < x.length; i++) if (i0 + i < N) VO[i0 + i] += x[i] * g;
  }

  // — zaman noktaları (görüntüyle aynı) —
  const T = {
    ring: L.l03.t0 + 0.15, land: plan.bird.t1, whip0: L.l04.end + 0.55, whip1: L.l05.t0 + 0.25,
    walk0: plan.wk[0].t, wait0: plan.waitT[0], wait1: plan.waitT[1], dover: plan.wk[8].t,
    clock0: L.l13.t0, clock1: W('l13', 'indiğinde', 't1'), dive0: L.l13.end + 0.1, hero: L.l14.t0 - 0.04, loop0: tl.loop0,
  };
  const silent = t => t >= L.l13.end && t < T.hero;   // doruktan önce müzik ve efekt yok

  // — müzik: yumuşak bas vuruş + pad (La minör); doruk öncesi susar —
  const beat = 60 / ep.bpm;
  function kick(t0, amp) { let ph = 0; for (let n = 0; n < 0.35 * SR; n++) { const t = n / SR, f = 48 + 80 * Math.exp(-t * 30); ph += (2 * Math.PI * f) / SR; addM(Math.round(t0 * SR) + n, Math.sin(ph) * Math.exp(-t * 10) * amp); } }
  function pluck(t0, f, amp, pan) { for (let n = 0; n < 0.9 * SR; n++) { const t = n / SR, v = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 5) * amp; addM(Math.round(t0 * SR) + n, v * (1 - pan), v * (1 + pan)); } }
  const arp = [220, 261.63, 329.63, 392, 329.63, 261.63, 220, 196];
  for (let b = 0; b * beat < D; b++) {
    const t = b * beat;
    if (silent(t) || t > T.loop0 + 0.9) continue;
    kick(t, b % 4 === 0 ? 0.32 : 0.2);
    pluck(t + beat / 2, arp[b % arp.length], 0.05, Math.sin(b) * 0.4);
  }
  function pad(a, b, amp) {
    const notes = [110, 164.81, 220, 261.63];
    const n0 = Math.round(a * SR), n1 = Math.min(N, Math.round(b * SR));
    let lp = 0; const al = 1 - Math.exp((-2 * Math.PI * 900) / SR);
    for (let n = n0; n < n1; n++) {
      const tt = n / SR, env = Math.min(1, (tt - a) / 1.2) * Math.min(1, (b - tt) / 0.8);
      let v = 0; for (const f of notes) for (let h = 1; h <= 4; h++) v += Math.sin(2 * Math.PI * f * h * tt) / Math.pow(h, 1.7);
      lp += al * (v - lp); addM(n, lp * env * amp, lp * env * amp * 0.96);
    }
  }
  pad(0, L.l13.end, 0.018); pad(T.hero, D, 0.03);

  // — efektler —
  // kalem: rota çizilirken kısa sürtme taneleri; yoğunluk çizim hızına bağlı
  function scratch(a, b, amp) {
    for (let t = a; t < b; t += 0.045 + rnd() * 0.03) {
      let lp = 0; const n0 = Math.round(t * SR), len = Math.round((0.025 + rnd() * 0.03) * SR);
      for (let n = 0; n < len; n++) { const x = noise(); lp += 0.55 * (x - lp); const v = (x - lp) * Math.sin(Math.PI * n / len) * amp; addF(n0 + n, v * 0.9, v); }
    }
  }
  scratch(plan.bird.t0, plan.bird.t1, 0.05);
  scratch(T.walk0, T.wait0, 0.045); scratch(T.wait1, T.dover, 0.045);
  scratch(T.clock0, T.clock1, 0.06);
  scratch(T.ring, T.ring + 0.6, 0.08);   // hedef halkası
  // kanat sesleri: uçuş boyunca çok hafif, 3,2 Hz
  for (let t = plan.bird.t0; t < plan.bird.t1; t += 1 / 3.2) {
    let lp = 0; const n0 = Math.round(t * SR);
    for (let n = 0; n < 0.12 * SR; n++) { const x = noise(); lp += 0.08 * (x - lp); addF(n0 + n, lp * Math.sin(Math.PI * n / (0.12 * SR)) * 0.09); }
  }
  // tok: konuş ve Dover
  function thock(t0, amp) { for (let n = 0; n < 0.3 * SR; n++) { const t = n / SR, v = (Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 30) + 0.5 * Math.sin(2 * Math.PI * 659.25 * t) * Math.exp(-t * 45)) * amp; addF(Math.round(t0 * SR) + n, v); } }
  thock(T.land - 2 / 30, 0.22); thock(T.dover - 2 / 30, 0.22);
  // kırbaç kaydırma: hızın tepesinde (ortada) en yüksek, sola sağa geçen hava
  { const a = T.whip0, b = T.whip1, n0 = Math.round(a * SR), n1 = Math.round(b * SR); let lp = 0;
    for (let n = n0; n < n1; n++) { const u = (n - n0) / (n1 - n0), fc = 400 + 3000 * Math.sin(Math.PI * u); lp += (1 - Math.exp(-2 * Math.PI * fc / SR)) * (noise() - lp); const e = Math.pow(Math.sin(Math.PI * u), 2) * 0.32; addF(n, lp * e * (1.2 - u), lp * e * (0.2 + u)); } }
  // bekleme: her yıl bir takvim tıkı (2020…2024)
  const y0 = WALK.find(w => w.wait).d, y1 = WALK.find(w => w.wait).wait;
  for (let y = Math.ceil(y0); y <= Math.floor(y1); y++) {
    const t = T.wait0 + (T.wait1 - T.wait0) * (y - y0) / (y1 - y0);
    for (let n = 0; n < 0.06 * SR; n++) { const tt = n / SR, v = (noise() * Math.exp(-tt * 300) + Math.sin(2 * Math.PI * 2100 * tt) * Math.exp(-tt * 90) * 0.5) * 0.12; addF(Math.round(t * SR) + n, v); }
  }
  // tek riser: dalış boyunca, sessizlikte değil — dalıştan hemen önceki saat koşusunun sonunda kesilir
  { const a = T.clock1 - 1.0, b = L.l13.end; let lp = 0, ph = 0; const n0 = Math.round(a * SR), n1 = Math.round(b * SR);
    for (let n = n0; n < n1; n++) { const u = (n - n0) / (n1 - n0), fc = 300 * Math.pow(18, u); lp += (1 - Math.exp(-2 * Math.PI * fc / SR)) * (noise() - lp); ph += 2 * Math.PI * 220 * Math.pow(3, u) / SR; const e = Math.pow(u, 2.2) * 0.22; addF(n, (lp + Math.sin(ph) * 0.15) * e); } }
  // tek impact: 53 km (görsel oturmadan 2 kare önce)
  { let ph = 0, lp = 0; const n0 = Math.round((T.hero - 2 / 30) * SR);
    for (let n = 0; n < 1.6 * SR; n++) { const t = n / SR, f = 32 + 50 * Math.exp(-t * 6); ph += 2 * Math.PI * f / SR; lp += 0.08 * (noise() - lp); addF(n0 + n, (Math.sin(ph) * Math.exp(-t * 2.2) + lp * 2 * Math.exp(-t * 12) + (n < 90 ? noise() * 0.5 * (1 - n / 90) : 0)) * 0.6); } }

  // — miks: müzik anlatımın altında kısılır (0,3 sn yumuşatılmış zarf) —
  const env = new Float32Array(N); let e = 0; const att = 1 - Math.exp(-1 / (0.05 * SR)), rel = 1 - Math.exp(-1 / (0.35 * SR));
  for (let i = 0; i < N; i++) { const x = Math.abs(VO[i]); e += (x > e ? att : rel) * (x - e); env[i] = e; }
  const Lc = new Float32Array(N), Rc = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const duck = 1 - 0.6 * Math.min(1, env[i] * 6);
    const m = silent(i / SR) ? 0 : 0.55 * duck;
    Lc[i] = VO[i] + Ml[i] * m + Fl[i] * 0.8;
    Rc[i] = VO[i] + Mr[i] * m + Fr[i] * 0.8;
  }
  let peak = 1e-9; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(Lc[i]), Math.abs(Rc[i]));
  const g = 0.708 / peak; for (let i = 0; i < N; i++) { Lc[i] *= g; Rc[i] *= g; }
  return { L: Lc, R: Rc, duration: D, sr: SR };
}

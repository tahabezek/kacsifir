// Ses sentezi: görüntüyle aynı zaman çizelgesinden (engine/core.js) üretilir. Ses saattir.
// Tonalite La minör, 96 bpm. Filmde tek riser, tek impact, doruktan önce gerçek sessizlik.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { buildTimeline, mulberry32, ease, seg, tallyPlan } from '../engine/core.js';
import { swarmCues } from '../engine/swarm_core.js';
import { docCues } from '../engine/doc.js';

const SR = 48000;

// Kule şablonunun ses ipuçları (sürü şablonu: engine/swarm_core.js → swarmCues)
function towerCues(ep) {
  const t = buildTimeline(ep);
  const tallies = [];
  for (const it of t.items) {
    const tp = tallyPlan(t, ep, it.i);
    for (let j = 1; j <= tp.n; j++) tallies.push({ t: tp.start + (j / tp.n) * tp.dur, accent: j % 5 === 0 });
  }
  return {
    beat: t.beat, duration: t.duration, rw0: t.rw0, rw1: t.rw1,
    hero: t.hero ? { t1: t.hero.t1, tl: t.hero.tl } : null,
    grows: t.items.map(it => ({ t0: it.t0, t1: it.t1, hero: !!it.hero })),
    lands: t.items.filter(it => !it.hero).map(it => it.t1),
    tallies,
  };
}

export function synth(ep) {
  const tl = ep.template === 'swarm' ? swarmCues(ep) : ep.template === 'doc' ? docCues(ep) : towerCues(ep);
  const D = tl.duration;
  const N = Math.ceil(D * SR);
  const Lc = new Float32Array(N), Rc = new Float32Array(N);
  const rnd = mulberry32(1337);
  const noise = () => rnd() * 2 - 1;
  const add = (i, l, r = l) => { if (i >= 0 && i < N) { Lc[i] += l; Rc[i] += r; } };
  const hero = tl.hero;
  const silent = t => hero && t >= hero.t1 - 0.005 && t < hero.tl;

  // Davul: her vuruşta yumuşak bas darbe, ölçü başında vurgu
  function kick(t0, amp) {
    let ph = 0;
    for (let n = 0; n < 0.42 * SR; n++) {
      const t = n / SR, f = 46 + 95 * Math.exp(-t * 32);
      ph += (2 * Math.PI * f) / SR;
      const v = Math.sin(ph) * Math.exp(-t * 9) * amp;
      add(Math.round(t0 * SR) + n, v);
    }
  }
  function shaker(t0, amp) {
    let lp = 0;
    for (let n = 0; n < 0.08 * SR; n++) {
      const t = n / SR, x = noise();
      lp += 0.35 * (x - lp);
      const v = (x - lp) * Math.exp(-t * 55) * amp;
      add(Math.round(t0 * SR) + n, v * 0.8, v);
    }
  }
  // Sayaç tıkı: kağıt üstünde kalem darbesi gibi kısa tık + tonlu iz
  function tick(t0, amp, pitch, pan) {
    let lp = 0;
    for (let n = 0; n < 0.05 * SR; n++) {
      const t = n / SR, x = noise();
      lp += 0.5 * (x - lp);
      const v = ((x - lp) * Math.exp(-t * 420) + Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 140) * 0.45) * amp;
      add(Math.round(t0 * SR) + n, v * (1 - pan), v * (1 + pan));
    }
  }
  // Ahşap "tok": sıradan öğenin yerine oturması (La5 + Mi6)
  function thock(t0, amp) {
    for (let n = 0; n < 0.3 * SR; n++) {
      const t = n / SR;
      const v = (Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 34) + 0.5 * Math.sin(2 * Math.PI * 1318.5 * t) * Math.exp(-t * 52)) * amp;
      add(Math.round(t0 * SR) + n, v);
    }
  }
  // Tek riser: filtresi açılan gürültü + La2→La4 süpürme, sessizliğe keskin kesilir
  function riser(a, b, amp) {
    let lp = 0, ph = 0;
    const n0 = Math.round(a * SR), n1 = Math.round(b * SR);
    for (let n = n0; n < n1; n++) {
      const u = (n - n0) / (n1 - n0);
      const fc = 300 * Math.pow(20, u);
      lp += (1 - Math.exp((-2 * Math.PI * fc) / SR)) * (noise() - lp);
      const f = 220 * Math.pow(4, u);
      ph += (2 * Math.PI * f) / SR;
      const env = Math.pow(u, 2.2) * amp;
      add(n, (lp * 0.9 + Math.sin(ph) * 0.18) * env, (lp * 0.9 + Math.sin(ph * 1.003) * 0.18) * env);
    }
  }
  // Tek impact: alt frekans düşüşü + gövde + geçici
  function impact(t0, amp) {
    let ph = 0, lp = 0;
    for (let n = 0; n < 1.8 * SR; n++) {
      const t = n / SR, f = 31 + 52 * Math.exp(-t * 6);
      ph += (2 * Math.PI * f) / SR;
      lp += 0.08 * (noise() - lp);
      const v = (Math.sin(ph) * Math.exp(-t * 2.1) + lp * 2.2 * Math.exp(-t * 13) + (n < 90 ? noise() * 0.6 * (1 - n / 90) : 0)) * amp;
      add(Math.round(t0 * SR) + n, v);
    }
  }
  // Pad: La minör (La2 Mi3 La3 Do4 Mi4), vuruştan sonra açılır, geri sarmada söner
  function pad(a, b, rel, amp) {
    const notes = [110, 164.81, 220, 261.63, 329.63];
    const n0 = Math.round(a * SR), n1 = Math.min(N, Math.round((b + rel) * SR));
    let lpL = 0, lpR = 0;
    const al = 1 - Math.exp((-2 * Math.PI * 1500) / SR);
    for (let n = n0; n < n1; n++) {
      const t = (n - n0) / SR, tt = n / SR;
      const env = Math.min(1, t / 0.9) * (tt > b ? Math.max(0, 1 - (tt - b) / rel) : 1);
      let l = 0, r = 0;
      for (const f of notes) for (let h = 1; h <= 5; h++) {
        const w = 1 / Math.pow(h, 1.6);
        l += Math.sin(2 * Math.PI * f * h * 0.9975 * tt) * w;
        r += Math.sin(2 * Math.PI * f * h * 1.0025 * tt) * w;
      }
      lpL += al * (l - lpL); lpR += al * (r - lpR);
      add(n, lpL * env * amp, lpR * env * amp);
    }
  }
  // Geri sarma: tersine nefes, döngü dikişinde kesilir
  function rewind(a, b, amp) {
    let lp = 0;
    const n0 = Math.round(a * SR), n1 = Math.round(b * SR);
    for (let n = n0; n < n1; n++) {
      const u = (n - n0) / (n1 - n0);
      const fc = 5000 * Math.pow(0.08, u);
      lp += (1 - Math.exp((-2 * Math.PI * fc) / SR)) * (noise() - lp);
      const env = Math.sin(Math.PI * Math.min(1, u * 1.15)) * amp;
      add(n, lp * env, lp * env * 0.9);
    }
  }

  // — Yerleşim —
  const beats = Math.floor(D / tl.beat);
  for (let b = 0; b <= beats; b++) {
    const t = b * tl.beat;
    if (t >= tl.rw0 || silent(t)) continue;
    kick(t, b % 4 === 0 ? 0.62 : 0.42);
    const off = t + tl.beat / 2;
    if (off < tl.rw0 && !silent(off)) shaker(off, 0.11);
  }
  for (const g of tl.grows) {
    // büyüme boyunca 16'lıklar; şiddet büyüme hızını izler, perde yükselir
    const step = tl.beat / 4;
    for (let t = g.t0; t < g.t1 - 0.01; t += step) {
      const u = seg(t, g.t0, g.t1 - g.t0);
      const vel = Math.min(1, (ease.state(Math.min(1, u + 0.02)) - ease.state(Math.max(0, u - 0.02))) / 0.04 / 1.6);
      const pitch = g.hero ? 700 * Math.pow(2.2, u) : 900 + 300 * u;
      tick(t, 0.06 + 0.2 * vel, pitch, Math.sin(t * 7) * 0.3);
    }
  }
  for (const t of tl.lands) thock(t, 0.32);
  // ölçü çentikleri: her çentiğe çok sessiz bir kalem tıkı (görüntüyle aynı takvim)
  for (const k of tl.tallies) if (k.t < tl.rw0) tick(k.t, k.accent ? 0.07 : 0.04, k.accent ? 2600 : 3100, 0.15);
  if (hero) {
    riser(hero.t1 - tl.beat * 3, hero.t1, 0.34);
    impact(hero.tl - 2 / 30, 0.95); // efekt, görsel oturmadan 2 kare önce başlar
    pad(hero.tl, tl.rw0, tl.rw1 - tl.rw0, 0.035);
  }
  rewind(tl.rw0, tl.rw1, 0.5);

  // tepe −3 dBFS'e çek (son ses seviyesi ffmpeg loudnorm ile)
  let peak = 1e-9;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(Lc[i]), Math.abs(Rc[i]));
  const g = 0.708 / peak;
  for (let i = 0; i < N; i++) { Lc[i] *= g; Rc[i] *= g; }
  return { L: Lc, R: Rc, duration: D, sr: SR };
}

export function writeWav(file, { L, R, sr }) {
  const n = L.length, data = Buffer.alloc(n * 8);
  for (let i = 0; i < n; i++) { data.writeFloatLE(L[i], i * 8); data.writeFloatLE(R[i], i * 8 + 4); }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

function ff(args) {
  const r = spawnSync(ffmpegPath, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr.slice(-800));
  return r.stderr;
}

// İki geçişli loudnorm (−14 LUFS, TP −2 dBTP; AAC kodlaması tepeyi yükseltir, ≤ −1 hedefi için pay) ve video ile birleştirme
export function masterAndMux(wav, silentMp4, outMp4) {
  const m = ff(['-hide_banner', '-i', wav, '-af', 'loudnorm=I=-14:TP=-2:LRA=11:print_format=json', '-f', 'null', '-']);
  const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  const af = `loudnorm=I=-14:TP=-2:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  // AAC kodlaması tepeyi yükseltebilir: bitmiş dosyada ölç, true peak > −1,1 dBTP ise kazancı düşürüp yeniden kodla
  let gainDb = 0;
  for (let k = 0; k < 3; k++) {
    ff(['-y', '-loglevel', 'error', '-i', silentMp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      '-af', af + `,volume=${gainDb}dB,aresample=48000`, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outMp4]);
    const { TP } = measure(outMp4);
    if (TP == null || TP <= -1.1) break;
    gainDb -= TP + 1.3;
  }
}

// Bitmiş dosyada ölçüm: entegre ses yüksekliği ve true peak
export function measure(mp4) {
  const s = ff(['-hide_banner', '-nostats', '-i', mp4, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const I = Number(s.match(/I:\s+(-?[\d.]+) LUFS/g).pop().match(/-?[\d.]+/)[0]);
  const tp = s.match(/Peak:\s+(-?[\d.]+) dBFS/g);
  const TP = tp ? Number(tp.pop().match(/-?[\d.]+/)[0]) : null;
  return { I, TP };
}

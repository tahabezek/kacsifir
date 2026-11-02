// "Mumlar" çekirdeği (№ 063 Calment ve Grönland köpekbalığı): ölçülmüş anlatımdan zamanlar, iki dünya (A: mum salonu,
// B: Kuzey Atlantik'in karanlık suyu, x = 4000), mumların yanma takvimi, kamera anahtarları, ses ipuçları.
// Her mum bir yıl: Calment'ın sırası 122 altın mum, köpekbalığının sırası 392 soğuk mum (tahmini yaş).
import { buildYolTimeline } from './yolculuk_core.js';
import { ease, seg, lerp, clamp01 } from '../core.js';

export const BX = 4000;
export const NC = 122, NS = 392, SP = 0.12;    // mum sayıları, aralık (m)
export const ROW = { c: 0, s: -0.5 };           // iki sıranın z'si (önde Calment, arkada köpekbalığı)
export const cx = k => k * SP;                  // k'inci mumun x'i (k = 0..)

export function mumlarTimes(ep, voice) {
  const tl = buildYolTimeline(ep, voice), { L, W } = tl;
  const T = {
    l01end: L.l01.end, l02: L.l02.t0, dogdu: W('l02', 'doğdu'), l02end: L.l02.end, l03: L.l03.t0, ondort: W('l03', 'on'), l03end: L.l03.end,
    l04: L.l04.t0, l04end: L.l04.end, l05: L.l05.t0, yuz5: W('l05', 'yüz'), yil5: W('l05', 'yıl'), l05end: L.l05.end,
    l06: L.l06.t0, l06end: L.l06.end, l07: L.l07.t0, yuzelli: W('l07', 'yüz'), l07end: L.l07.end,
    l08: L.l08.t0, goz: W('l08', 'göz'), yaklasik: W('l08', 'yaklaşık'), l08end: L.l08.end, l09: L.l09.t0, l09end: L.l09.end,
    l10: L.l10.t0, l10end: L.l10.end, l11: L.l11.t0, omrun: W('l11', 'ömrün'), olabilir: W('l11', 'olabilir'), l11end: L.l11.end,
    l12: L.l12.t0, l12end: L.l12.end, loop0: tl.loop0, D: tl.duration,
  };
  T.silence = [T.l09end + 0.15, T.l10];
  T.cutA1 = T.l02 - 0.25;                 // B (göz) → A (mum salonu)
  T.cutB2 = T.l06 - 0.3;                  // A → B (köpekbalığı)
  T.cutA3 = T.l09 - 0.3;                  // B → A (iki sıra yan yana)
  T.cutB4 = T.loop0;                      // A → B (döngü: göz)
  T.hero = T.l11end + 0.02;               // köpekbalığının 392. mumu: tek büyük vuruş
  return { tl, T };
}

// Calment'ın k'inci mumunun (0..121) yandığı an: 1875 "doğdu"da, 1889 "on dört"te, 1975 "yüz"de, 1997 "yıl"da
export function calmentLit(T, k) {
  const a = [[0, T.dogdu], [13, T.ondort], [99, T.l04 + 0.05], [121, T.yil5]];
  for (let i = 1; i < a.length; i++) if (k <= a[i][0]) { const u = (k - a[i - 1][0]) / (a[i][0] - a[i - 1][0]); return lerp(a[i - 1][1], a[i][1], i === 3 ? Math.pow(u, 0.8) : u); }
  return a.at(-1)[1];
}
// köpekbalığının k'inci mumu (0..391): "ömrün"de başlar, "olabilir"in sonunda biter; giderek hızlanır
export function sharkLit(T, k) { return T.omrun - 0.1 + (T.hero - T.omrun + 0.1) * Math.pow((k + 1) / NS, 0.75); }
export const litCount = (T, t, fn, n) => { let c = 0; for (let k = 0; k < n; k++) if (t >= fn(T, k)) c = k + 1; else break; return c; };

// Kamera: [t, pos, tgt, fov, focus?, aperture?]; kesmeler 1 ms arayla
export function camKeys(T) {
  const B = (x, y, z) => [BX + x, y, z];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = [B(0.2, 0.16, 1.9), B(0.02, 0, 0), 36];        // kare 0: köpekbalığının başı yandan, göz ve asalak kopepod
  const at = k => cx(k);
  return [
    [0, ...F0, null, 0.004],
    [0.6, B(0.17, 0.14, 1.65), B(0.02, 0, 0), 36, null, 0.004],
    [T.l01end - 0.1, B(2.6, 0.6, 5.6), B(-0.6, 0, -1), 40],                            // geri çekil: köpekbalığı karanlıktan çıkar
    ...cut(T.cutA1, [B(3.0, 0.8, 6.4), B(-0.8, 0, -1), 40], [[at(0) - 0.6, 0.32, 0.9], [at(0) + 0.3, 0.12, 0], 36, null, 0.01]),   // ilk mum
    [T.dogdu + 0.3, [at(2) - 0.4, 0.34, 1.0], [at(4), 0.12, 0], 36, null, 0.01],
    [T.ondort + 0.2, [at(13) - 0.5, 0.4, 1.15], [at(13) + 0.3, 0.12, 0], 38],               // 1889: Eyfel
    [T.l04 + 0.3, [at(99) - 0.6, 0.5, 1.4], [at(99) + 0.4, 0.12, 0], 38],                   // 1975: 100 yaşında bisiklet
    [T.yil5 + 0.1, [at(121) - 0.9, 0.55, 1.6], [at(121) + 0.2, 0.12, 0], 38],               // 1997: son mum
    [T.cutB2 - 0.001, [at(121) + 0.2, 1.5, 3.2], [at(80), 0.1, 0], 42],
    [T.cutB2, B(-3.4, 0.7, 5.4), B(-1.8, 0, 0), 40],                                          // karanlık su: köpekbalığı yavaşça geçer
    [T.l07 + 0.2, B(-1.6, 0.35, 4.0), B(-1.3, 0, 0), 40],
    [T.goz - 0.1, B(0.35, 0.1, 1.3), B(-0.2, 0, 0), 32, null, 0.006],                        // göz merceği
    [T.l08end, B(0.2, 0.06, 0.75), B(0, 0, 0), 30, null, 0.004],
    ...cut(T.cutA3, [B(0.19, 0.06, 0.72), B(0, 0, 0), 30, null, 0.004], [[at(-6), 1.0, 1.9], [at(30), 0, -0.25], 40]),   // iki sıra yan yana
    [T.l10end, [at(-4), 1.3, 2.1], [at(80), 0, -0.25], 40],
    [T.hero, [at(-8), 1.7, 1.7], [at(160), 0, -0.25], 38],                                  // sıralar boyunca: altın sıra 122'de biter, soğuk sıra sürer
    [T.l12end + 0.4, [at(-9), 2.0, 1.8], [at(170), 0, -0.25], 38],
    ...cut(T.cutB4, [[at(-9), 2.05, 1.82], [at(170), 0, -0.25], 38], [B(0.26, 0.2, 2.4), B(0.02, 0, 0), 36, null, 0.004]),
    [T.D - 0.6, B(0.23, 0.18, 2.15), B(0.02, 0, 0), 36, null, 0.004],                          // açılıştaki itmenin aynası
    [T.D, ...F0, null, 0.004],
  ];
}

export function mumlarCues(T) {
  return {
    tick: [T.dogdu, T.ondort, T.l04 + 0.05, T.yil5, T.goz],
    thock: [T.yil5 + 0.02],
    whip: [[T.cutA1 - 0.25, T.cutA1 + 0.1], [T.cutB2 - 0.25, T.cutB2 + 0.1], [T.cutA3 - 0.25, T.cutA3 + 0.1], [T.cutB4 - 0.3, T.cutB4 + 0.1]],
    rumble: [[T.cutB2 + 0.2, 0.2]],
    scratch: [[T.omrun, T.hero, 0.02]],
    riser: [T.l11, T.hero],
    impact: T.hero,
    silence: T.silence,
    loopEnd: T.loop0,
  };
}

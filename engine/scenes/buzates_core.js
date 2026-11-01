// "Buz ve ateş" çekirdeği (№ 060 Anna Bågenholm ve Ludger Sylbaris): ölçülmüş anlatımdan zamanlar, iki dünya
// (A: Norveç'te donmuş nehir; B: 1902 Saint-Pierre, taş hücre ve kent), kamera anahtarları, termometre ve ses ipuçları.
// Tarayıcıdaki çizim, node'daki ses ve özet aynı fonksiyonları okur (tek zaman kaynağı).
import { buildYolTimeline } from './yolculuk_core.js';
import { ease, seg } from '../core.js';

export const BX = 4000;                       // B dünyasının x kayması (A ile aynı karede görünmez)
export const THERMO_A = [2.05, 0, 1.3];       // buzda, deliğin kıyısında karda duran termometre
export const THERMO_B = [BX + 0.72, 1.06, 2.64];   // hücre kapısının dışında, ızgaranın yanında duvarda
export const SCALE = { lo: -10, hi: 110 };    // termometre ölçeği (°C); 400'e çıkamaz: cam patlar

export function buzatesTimes(ep, voice) {
  const tl = buildYolTimeline(ep, voice), { L, W } = tl;
  const T = {
    l01end: L.l01.end, l02: L.l02.t0, nehre: W('l02', 'nehre'), l02end: L.l02.end, l03: L.l03.t0, kirk: W('l03', 'kırk'), l03end: L.l03.end,
    l04: L.l04.t0, durdu: W('l04', 'durdu'), on: W('l04', 'on'), indi: W('l04', 'indi'), l04end: L.l04.end,
    l05: L.l05.t0, atmadi: W('l05', 'atmadı'), getirdi: W('l05', 'getirdi'), l05end: L.l05.end,
    l06: L.l06.t0, l06end: L.l06.end, l07: L.l07.t0, patladi: W('l07', 'patladı'), kizgin: W('l07', 'kızgın'), yok: W('l07', 'yok'), l07end: L.l07.end,
    l08: L.l08.t0, ama: W('l08', 'ama'), l08end: L.l08.end, l09: L.l09.t0, l09end: L.l09.end,
    l10: L.l10.t0, on2: W('l10', 'on'), l10end: L.l10.end, l11: L.l11.t0, tahminen: W('l11', 'tahminen'), dort: W('l11', 'dört'), yuz: W('l11', 'yüz'), l11end: L.l11.end,
    l12: L.l12.t0, l12end: L.l12.end, loop0: tl.loop0, D: tl.duration,
  };
  T.silence = [T.l09end + 0.15, T.l10];
  T.cutB1 = T.l06 - 0.32;                       // A → B (hücre)
  T.cutOut = T.l07 - 0.04;                      // hücre → kent: "Yanardağ" ile yanardağ görünür
  T.cutIn = T.ama - 0.1;                        // kent → hücre: "ama o kurtuldu"
  T.cutA2 = T.l09 - 0.3;                        // B → A: aynı termometre buzda
  T.cutB2 = T.l10end + 0.3;                     // A → B: termometre hücrenin dışında
  T.cutA3 = T.loop0;                            // B → A: döngü başı
  T.burst = T.yuz;                              // cam "yüz"de patlar (filmin tek büyük vuruşu)
  return { tl, T };
}

// hangi dünya: 0 = A (buz), 1 = B (Martinik)
export function world(T, t) {
  if (t < T.cutB1) return 0;
  if (t < T.cutA2) return 1;
  if (t < T.cutB2) return 0;
  if (t < T.cutA3) return 1;
  return 0;
}

// termometredeki sıvının gösterdiği sıcaklık (°C)
export function thermoA(T, t) {                 // buzda: 37 → 13,7 ("on üç virgül yedi" boyunca)
  return 37 - 23.3 * ease.state(seg(t, T.on2 - 0.1, T.l10end - T.on2 - 0.2));
}
export function thermoB(T, t) {                 // dışarıda: 31 °C; "tahminen"de tırmanır, "dört"te 400'e varır (sütun 110'da tavana dayanır)
  return 31 + (400 - 31) * ease.enter(seg(t, T.tahminen - 0.05, T.dort - T.tahminen + 0.05));
}
// vücut sıcaklığı (2B sayaç, l04)
export function bodyTemp(T, t) { return 37 - 23.3 * ease.state(seg(t, T.on - 0.05, T.indi - T.on + 0.3)); }

// Kamera anahtarları: [t, pos, tgt, fov, focus?, aperture?]. Kesmelerde iki anahtar 1 ms arayla (sert kesme).
export function camKeys(T) {
  const B = (x, y, z) => [BX + x, y, z];
  const F0 = [[3.05, 0.78, 2.95], [0.9, 0.22, -0.25], 40];             // kare 0: önde termometre, arkada buzdaki delik
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const A_air = [[-1.6, -1.6, 2.4], [0.2, -0.35, -0.5], 54, null, 0.02];
  return [
    [0, ...F0, null, 0.02],                                                   // kare 0: buzdaki delik, kayaklar
    [0.6, [2.78, 0.71, 2.55], [0.9, 0.22, -0.25], 40, null, 0.02],            // kanca: 600 ms'de 1,15× yaklaşma
    [T.l02 + 0.3, [14, 9, 24], [0, 1, 0], 44],                                // geri ve yukarı: donmuş nehir, dağlar
    [T.nehre - 0.3, [10, 6, 15], [0, 0, 0], 40],
    [T.l03 - 0.15, [1.2, 0.9, 1.6], [0, -1.5, 0], 50],                        // deliğe dalış
    [T.l03 + 0.35, [0.4, -1.1, 2.2], [0.2, -0.3, -0.5], 54],                  // buzun altı: hava cebi
    [T.l03end, ...A_air],
    [T.l04 + 0.2, [-1.9, -2.0, 2.8], [0.2, -0.45, -0.5], 54],
    [T.l04end, [-2.6, -3.4, 4.0], [0.2, -0.6, -0.5], 56],                     // derine çekilir, ışık azalır
    [T.l05 + 0.3, [-1.8, -3.0, 2.2], [0, 0, 0], 52],
    [T.getirdi, [-0.2, -0.7, 0.4], [0, 0.4, -6], 56],                         // delikten çıkış: ufka bakar (gök beyazlığı değil)
    [T.cutB1 - 0.05, [0, 0.55, 0.6], [0, 1.4, -12], 56],
    ...cut(T.cutB1, [[0, 0.6, 0.62], [0, 1.4, -12], 56], [B(-0.9, 1.5, -1.6), B(0.15, 1.45, 2.2), 46]),   // hücrenin içi: ızgaraya doğru
    [T.cutOut - 0.001, B(-0.3, 1.52, -0.1), B(0.15, 1.55, 2.2), 42],
    [T.cutOut, B(40, 70, 1500), B(0, 220, -2600), 34],                        // denizden kent ve yanardağ
    [T.yok + 0.2, B(30, 90, 1250), B(0, 120, -1200), 40],
    [T.cutIn - 0.001, B(10, 120, 900), B(0, 20, -300), 44],
    [T.cutIn, B(0.9, 1.3, 4.6), B(0.15, 1.5, 2.6), 40],                        // dışarıdan kapı: ızgara tütüyor
    [T.l08end, B(0.75, 1.35, 4.1), B(0.2, 1.4, 2.6), 38],
    ...cut(T.cutA2, [B(0.7, 1.35, 4.0), B(0.2, 1.4, 2.6), 38], [[2.75, 0.62, 3.35], [2.05, 0.34, 1.3], 34, null, 0.012]),   // buzda termometre; arkasında delik
    [T.l10, [2.62, 0.56, 2.62], [2.05, 0.34, 1.3], 30, null, 0.012],
    [T.l10end, [2.52, 0.52, 2.3], [2.05, 0.34, 1.3], 28, null, 0.012],
    ...cut(T.cutB2, [[2.5, 0.52, 2.25], [2.05, 0.34, 1.3], 28, null, 0.012], [B(1.35, 1.2, 3.75), B(0.72, 1.1, 2.64), 34, null, 0.012]),   // hücrenin dışında aynı termometre
    [T.burst, B(1.22, 1.16, 3.45), B(0.72, 1.1, 2.64), 32, null, 0.012],
    [T.l12 + 0.4, B(1.6, 1.5, 5.0), B(0.3, 1.3, 2.6), 40],
    [T.l12end + 0.6, B(2.8, 2.2, 8.4), B(0, 1.6, 2.6), 46],
    ...cut(T.cutA3, [B(3, 2.3, 9), B(0, 1.6, 2.6), 46], [[3.6, 0.95, 3.75], [0.9, 0.22, -0.25], 40, null, 0.02]),
    [T.D - 0.6, [3.32, 0.85, 3.35], [0.9, 0.22, -0.25], 40, null, 0.02],   // açılıştaki itmenin aynası
    [T.D, ...F0, null, 0.02],
  ];
}

export function buzatesCues(T) {
  return {
    tick: [T.kirk - 0.02, T.durdu, T.getirdi + 0.05],
    thock: [T.indi, T.on2 + 0.6],
    whip: [[T.nehre - 0.25, T.l03 + 0.1], [T.cutB1 - 0.3, T.cutB1 + 0.1], [T.cutOut - 0.25, T.cutOut + 0.15], [T.cutA2 - 0.25, T.cutA2 + 0.1], [T.cutB2 - 0.25, T.cutB2 + 0.1], [T.cutA3 - 0.3, T.cutA3 + 0.1]],
    rumble: [[T.patladi + 0.05, 0.5], [T.cutOut + 0.3, 0.45], [T.l11 + 0.3, 0.25]],
    scratch: [[T.patladi, T.l07end + 0.3, 0.03], [T.cutB2, T.burst, 0.025]],
    riser: [T.l11, T.burst],
    impact: T.burst,
    silence: T.silence,
    loopEnd: T.loop0,
  };
}

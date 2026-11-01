// "Stadyum" çekirdeği (№ 041 Kaiser ve Kazu): ölçülmüş anlatımdan zamanlar, kamera anahtarları, top yağmuru
// takvimi ve ses ipuçları. Tarayıcıdaki çizim, node'daki ses ve özet aynı fonksiyonları okur (tek zaman kaynağı).
import { buildYolTimeline } from './yolculuk_core.js';
import { ease, seg } from '../core.js';

export const NBALL = 911;                         // Kazu'nun resmî kulüp maçı (Wikipedia, 19 Ağustos 2026)
export const BALL_R = 0.11;                       // 5 numara top, çap 22 cm
export const KB = [-41.5, BALL_R, 0];             // Kaiser'in topu: sol penaltı noktası, hiç vurulmamış
export const HEAP = [8, 0, 0];                    // Kazu'nun yığını: sağ yarı sahada; valiz bunun altında kalır
export const RAIL = { x0: -9.4, x1: -0.2, z: -36.4, y: 2.15 };     // sol yedek kulübesinin yanında forma askısı
export const SB = { x: 0, y: 22.6, z: -44.2, w: 20, h: 9 };         // skor tabelası (karşı tribün çatısının ön kenarında)

export function stadyumTimes(ep, voice) {
  const tl = buildYolTimeline(ep, voice), { L, W } = tl;
  const T = {
    l01end: L.l01.end, l02: L.l02.t0, l02end: L.l02.end, kulup: W('l02', 'kulüplerine'), imza: W('l02', 'imza'),
    l03: L.l03.t0, resmi: W('l03', 'resmî'), l03end: L.l03.end,
    l04: L.l04.t0, sakat: W('l04', 'sakatlık'), kere: W('l04', 'keresinde'), kirmizi: W('l04', 'kırmızı'), l04end: L.l04.end,
    l05: L.l05.t0, kazu: W('l05', 'Kazu'), onbes: W('l05', 'on'), brezilya: W('l05', 'Brezilya'), l05end: L.l05.end,
    l06: L.l06.t0, elli: W('l06', 'elli'), yasinda: W('l06', 'yaşında'), l06end: L.l06.end,
    l07: L.l07.t0, l07end: L.l07.end, l08: L.l08.t0, sifir: W('l08', 'sıfır'), l08end: L.l08.end,
    l09: L.l09.t0, dokuz: W('l09', 'dokuz'), l09end: L.l09.end, l10: L.l10.t0, yoruma: W('l10', 'Yoruma'), l10end: L.l10.end,
    loop0: tl.loop0, D: tl.duration,
  };
  // l02'de beş forma askıya kelime kelime gelir ("on üç yıl" → "attı")
  const ws = L.l02.words, i0 = 2;
  T.jersey = [0, 1, 2, 3, 4].map(k => ws[Math.min(ws.length - 1, i0 + Math.round(k * (ws.length - 1 - i0) / 4))].t0 - 0.05);
  T.silence = [T.l07end + 0.15, T.l08];           // doruktan önce gerçek sessizlik
  T.rain0 = T.dokuz - 0.25;                         // ilk top "dokuz"da yere değer
  T.rain1 = T.l09end + 0.04;                        // son top cümle biterken: büyük vuruş duraklamanın başında
  T.age = t => Math.round(15 + 44 * ease.state(seg(t, T.l05end + 0.1, T.yasinda - T.l05end - 0.1)));
  return { tl, T };
}

// i'nci topun yere/yığına değme zamanı: yağmur gittikçe yoğunlaşır, son toplar yavaşlar (sayaç "bir"de durur)
export function landTime(T, i) {
  const u = (i + 0.5) / NBALL;
  return T.rain0 + (T.rain1 - T.rain0) * Math.pow(u, 0.62);
}
export function landedCount(T, t) {
  if (t < T.rain0) return 0;
  if (t >= T.rain1) return NBALL;
  const u = Math.pow((t - T.rain0) / (T.rain1 - T.rain0), 1 / 0.62);
  return Math.min(NBALL, Math.floor(u * NBALL + 0.5));
}

// Kamera anahtarları: [t, pos, tgt, fov, focus?, aperture?]. Baskın yön: soldan sağa (Kaiser → Kazu).
export function camKeys(T) {
  const F0 = [[-39.9, 0.3, 0.55], [-41.5, 0.2, 0], 40];
  return [
    [0, ...F0, null, 0.012],                                              // kare 0: topun dibinde, arkada kale ve projektörler
    [0.6, [-40.25, 0.29, 0.48], [-41.5, 0.2, 0], 40, null, 0.012],        // kanca: 600 ms'de 1,15× yaklaşma
    [T.l01end - 0.6, [-34, 5.5, 9], [-42, 1.5, -2], 46],                 // geri ve yukarı: stadyum açılır
    [T.l02 + 0.15, [-10.6, 1.5, -32], [-9.2, 1.62, -36.4], 40],
    ...T.jersey.map((tj, k) => [tj + 0.32, [RAIL.x0 + 1.2 + 1.8 * k, 1.5, -32], [RAIL.x0 + 1 + 1.8 * k, 1.62, -36.4], 40]),   // askı boyunca soldan sağa, her forma geldiğinde
    [T.l03 + 0.15, [-3.5, 1.5, -18], [-5, 18.6, -44.2], 60],             // tabelaya kalkış: KAISER 0; altta tribün
    [T.l03end + 0.2, [-3.6, 1.5, -18.6], [-5, 18.9, -44.2], 56],
    [T.l04 + 0.2, [-9.4, 1.3, -34.4], [-11.8, 0.7, -39.6], 44],          // kulübe: koltuk değnekleri, buz torbası
    [T.kere, [-9.6, 1.28, -34.3], [-11.7, 0.72, -39.5], 44],
    [T.kirmizi + 0.6, [-9.8, 1.25, -34.2], [-11.6, 0.75, -39.5], 42, 1.45, 0.02],   // odak düşen karta
    [T.l04end, [-9.8, 1.25, -34.2], [-11.6, 0.75, -39.5], 42, 1.45, 0.02],
    [T.l05 + 0.25, [10.9, 0.55, 2.9], [8, 0.32, 0], 40],                   // sağ yarı: valiz
    [T.l05end, [10.5, 0.62, 2.5], [8, 0.34, 0], 40],
    [T.l06 + 0.3, [3.6, 1.5, -18], [5, 18.6, -44.2], 60],                 // tabelada KAZU: yaş 15 → 59
    [T.l06end, [3.7, 1.5, -18.6], [5, 18.9, -44.2], 56],
    [T.l07 + 0.2, [0, 7, 14], [0, 19.6, -44.2], 38],                       // tabela soruyu sorar: KAISER 0 · KAZU ?
    [T.silence[1] - 0.05, [0, 7.2, 11], [0, 19.8, -44.2], 36],
    [T.l08 + 0.15, [-44.1, 0.22, 0.04], [8, -1.78, 0], 21, 2.6, 0.03],     // topun arkası; arkada boş sağ yarı (bulanık)
    [T.dokuz - 0.2, [-44.1, 0.22, 0.04], [8, -1.78, 0], 21, 2.6, 0.03],
    [T.rain1 + 0.1, [-44.3, 0.24, 0.04], [8, -1.7, 0], 19, 52, 0.008],     // odak yığına kayar
    [T.rain1 + 0.9, [-44.3, 0.55, 0.04], [8, -0.15, 0], 13, 52, 0.008],    // 1,3× yığına: yığın kadrajı doldurur (800 ms)
    [T.l10end - 0.2, [-44.3, 0.56, 0.04], [8, -0.12, 0], 12.5, 52, 0.008],
    [T.l10end + 0.3, [-44.8, 1.3, 0.04], [8, -2.4, 0], 19, 52, 0.008],    // yükselir: top altta, yığın uzakta
    [T.loop0 - 0.45, [-44.6, 1.6, 0.04], [8, -2.4, 0], 19, 52, 0.008],   // hızlı çevirme (whip): döngü başına
    [T.loop0, [-39.0, 0.42, 0.9], [-41.5, 0.2, 0], 40, null, 0.012],
    [T.D - 0.6, [-39.55, 0.31, 0.62], [-41.5, 0.2, 0], 40, null, 0.012],   // açılıştaki itmenin aynası: dikişte hız sürekli
    [T.D, ...F0, null, 0.012],
  ];
}

export function stadyumCues(T) {
  return {
    tick: T.jersey.map(t => t + 0.28),
    thock: [T.l03 + 0.35, T.sifir - 0.02],
    whip: [[T.l03 - 0.1, T.l03 + 0.35], [T.l05 - 0.35, T.l05 + 0.2], [T.l07 - 0.3, T.l07 + 0.25], [T.l08 - 0.25, T.l08 + 0.15], [T.l10end + 0.1, T.loop0]],
    scratch: [[T.rain0 - 0.05, T.rain1 + 0.4, 0.05]],
    rumble: [[T.rain0 + 0.3, 0.3]],
    riser: [T.l07, T.rain1],
    impact: T.rain1,
    silence: T.silence,
    loopEnd: T.loop0,
  };
}

// "Dağ" çekirdeği (№ 035 Manjhi ve 33 madenci): ölçülmüş anlatımdan zamanlar, iki dünya (A: Gehlaur sırtı, Hindistan;
// B: San José madeni, Şili), kamera anahtarları, yarığın ilerleyişi, sondaj ve kapsül, küpler ve ses ipuçları.
// Tarayıcıdaki çizim, node'daki ses ve özet aynı fonksiyonları okur (tek zaman kaynağı).
import { buildYolTimeline } from './yolculuk_core.js';
import { ease, seg, lerp, clamp01 } from '../core.js';

export const BX = 4000;                        // B dünyası (Şili) x kayması
export const CUT = { x0: -55, x1: 55, w: 9.1, floor: 1.2, depth: 7.7 };   // yarık: 110 m, 9,1 m geniş, sırtın 7,7 m altı
export const POT = [-20, 0, 15];               // kırık testi (y araziden)
export const SHAFT = 700, CUBE = 6.3, NCUBE = 15;    // (250 m³)^(1/3) yaklaşık 6,3 m; en az 15 kat



// arazi (sahne ve kamera aynı fonksiyonu okur)
const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return lerp(lerp(hash(xi, zi), hash(xi + 1, zi), u), lerp(hash(xi, zi + 1), hash(xi + 1, zi + 1), u), v); };
export const fbm = (x, z) => vnoise(x, z) * 0.5 + vnoise(x * 2.1, z * 2.1) * 0.25 + vnoise(x * 4.3, z * 4.3) * 0.125 + vnoise(x * 8.7, z * 8.7) * 0.0625;
export const ridgeH = (x, z) => {
  const R = 7.7 + 30 * (1 - Math.exp(-((z / 70) ** 2))), prof = Math.exp(-Math.pow(Math.abs(x) / 32, 2.2));
  return CUT.floor + R * prof + 2.2 * fbm(x * 0.08, z * 0.08) * prof + 0.5 * fbm(x * 0.5, z * 0.5) - 0.3 + 1.5 * fbm(x * 0.01 + 7, z * 0.01);
};
export const hA = (x, z) => {
  let h = ridgeH(x, z);
  const k = clamp01((CUT.w / 2 + 0.35 - Math.abs(z)) / 0.7) * clamp01((CUT.x1 + 1 - Math.abs(x)) / 2);
  return lerp(h, Math.min(h, CUT.floor + 0.12 * fbm(x * 0.6, z * 0.6)), k);
};
export const POT_Y = hA(POT[0], POT[2]);         // testinin durduğu sırt yüksekliği

export function dagTimes(ep, voice) {
  const tl = buildYolTimeline(ep, voice), { L, W } = tl;
  const T = {
    l01end: L.l01.end, l02: L.l02.t0, dusup: W('l02', 'düşüp'), l02end: L.l02.end, l03: L.l03.t0, elli: W('l03', 'elli'), l03end: L.l03.end,
    l04: L.l04.t0, cekic: W('l04', 'çekiç'), yirmi: W('l04', 'yirmi'), yardi: W('l04', 'yardı'), l04end: L.l04.end,
    l05: L.l05.t0, yuz: W('l05', 'yüz'), mesafe: W('l05', 'mesafe'), on: W('l05', 9), l05end: L.l05.end,   // 'on': ikinci on (on beş)
    l06: L.l06.t0, coktu: W('l06', 'çöktü'), yedi: W('l06', 'yedi'), l06end: L.l06.end,
    l07: L.l07.t0, sondaj: W('l07', 'sondaj'), geldi: W('l07', 'geldi'), sig: W('l07', 'Sığınaktayız'), l07end: L.l07.end,
    l08: L.l08.t0, hepsi: W('l08', 'hepsi'), l08end: L.l08.end, l09: L.l09.t0, l09end: L.l09.end,
    l10: L.l10.t0, iki: W('l10', 'iki'), kaya: W('l10', 'kaya'), l10end: L.l10.end,
    l11: L.l11.t0, en: W('l11', 'en'), katini: W('l11', 'katını'), l11end: L.l11.end, l12: L.l12.t0, l12end: L.l12.end,
    loop0: tl.loop0, D: tl.duration,
  };
  T.silence = [T.l09end + 0.15, T.l10];
  T.cut0 = T.yirmi - 0.15; T.cut1 = T.yardi + 0.25;            // 22 yıl: yarık açılır (zaman atlaması)
  T.cutB1 = T.l06 - 0.3;                                         // A → B
  T.drill0 = T.l07 + 0.1; T.drill1 = W('l07', 'ucu') + 0.3;                    // sondaj ucu 700 m iner
  T.note0 = T.geldi - 0.1; T.note1 = T.l07end + 0.2;             // not yukarı çıkar
  T.cap0 = T.hepsi - 0.15; T.cap1 = T.l08end + 0.25;             // kapsül: 33 kişi tek tek
  T.cutA2 = T.l11 - 0.25;                                        // B → A: küpler yarığa
  T.cube = k => T.en - 0.1 + (T.l11end - 0.05 - (T.en - 0.1)) * Math.pow(k / (NCUBE - 1), 0.85);   // k'inci küp yere değer
  T.hero = T.cube(NCUBE - 1);
  return { tl, T };
}

export function world(T, t) { return t < T.cutB1 || t >= T.cutA2 ? 0 : 1; }
export const cutProgress = (T, t) => ease.state(seg(t, T.cut0, T.cut1 - T.cut0));
export const year = (T, t) => Math.round(1960 + 22 * cutProgress(T, t));
export const drillDepth = (T, t) => SHAFT * ease.state(seg(t, T.drill0, T.drill1 - T.drill0));
export const capsuleCount = (T, t) => Math.min(33, Math.floor(1 + 32 * ease.state(seg(t, T.cap0, T.cap1 - T.cap0))));

// Kamera: [t, pos, tgt, fov, focus?, aperture?]; kesmelerde 1 ms arayla iki anahtar
export function camKeys(T) {
  const B = (x, y, z) => [BX + x, y, z];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = [[-18.5, POT_Y + 1.5, 16.9], [-20, POT_Y + 0.15, 15], 40];          // kare 0: sırtta kırık testi
  return [
    [0, ...F0, null, 0.02],
    [0.6, [-18.72, POT_Y + 1.3, 16.62], [-20, POT_Y + 0.15, 15], 40, null, 0.02],
    [T.l02 + 0.3, [-6, 26, 52], [-12, 6, 4], 44],                  // geri ve yukarı: sırt, iki köy
    [T.l03 + 0.2, [40, 260, 380], [0, 0, -60], 46],                // yüksekten: 55 km'lik dolanma
    [T.l03end, [30, 300, 430], [0, 0, -80], 46],
    [T.l04 + 0.3, [-50.4, 1.75, 2.6], [-51.8, 1.22, 1.2], 40, null, 0.015],   // yarığın ağzı: çekiç, keski
    [T.cut0, [-56, 4.5, 8], [-49, 4, 0], 42],
    [T.cut1, [-80, 30, 40], [-10, 4, 0], 44],                      // zaman atlaması: yarık doğuya ilerler
    [T.l05 + 0.2, [-70, 6.5, 0], [0, 4.5, 0], 50],                 // yarığın içinden doğuya uçuş
    [T.mesafe, [10, 6, 0], [80, 3, 0], 50],
    [T.l05end + 0.1, [40, 120, 200], [20, 0, -40], 46],
    ...cut(T.cutB1, [[42, 126, 208], [20, 0, -40], 46], [B(30, 18, 60), B(0, 8, 0), 42]),   // Atacama: maden, kamp
    [T.coktu + 0.3, B(24, 12, 44), B(0, -10, 0), 44],
    [T.l06end, B(5, -360, 26), B(0, -372, 0), 48],                 // kesitte aşağı: 700 m
    [T.l07, B(3, -695, 11), B(0, -700, -3), 46],                   // sığınak: 33 lamba
    [T.sondaj, B(2.6, -696, 9.5), B(0, -699.5, -3), 44],
    [T.geldi + 0.2, B(2.2, -696.5, 8.5), B(0, -698.5, -2), 42],    // matkap ucu tavanı deler
    [T.note1, B(2.4, -420, 6), B(0, -300, 0), 46],                 // not yukarı çıkar
    ...cut(T.cap0 - 0.3, [B(2.3, -400, 6), B(0, -280, 0), 46], [B(7.6, 1.6, 12.2), B(0, 2.2, 0), 36]),   // sert kesme: yüzeyde kapsül (toprağın içinden geçmez)
    [T.cap1, B(8.2, 1.8, 13), B(0, 3.2, 0), 36],
    [T.l09 + 0.2, B(30, 22, 64), B(0, 2, 0), 40],
    [T.silence[1], B(28, 20, 58), B(0, 2, 0), 40],
    [T.kaya, B(18, 9, 30), B(12, 3, 2), 40],                       // kuyudan çıkan kaya: 6,3 m'lik küp
    ...cut(T.cutA2, [B(17, 8.6, 28), B(12, 3, 2), 40], [[-70, 26, 34], [-5, 3, 0], 40]),   // Gehlaur: küpler yarığa
    [T.hero + 0.15, [-60, 34, 40], [5, 3, 0], 42],
    [T.l12end + 0.5, [-40, 46, 62], [0, 6, 0], 46],
    [T.loop0, [-17.2, POT_Y + 2.6, 18.6], [-20, POT_Y + 0.15, 15], 40, null, 0.02],
    [T.D - 0.6, [-18.28, POT_Y + 1.7, 17.18], [-20, POT_Y + 0.15, 15], 40, null, 0.02],   // açılıştaki itmenin aynası
    [T.D, ...F0, null, 0.02],
  ];
}

export function dagCues(T) {
  const strikes = []; for (let t = T.cekic; t < T.cut1; t += 0.42) strikes.push(t);
  return {
    tick: strikes,
    thock: [T.dusup, ...Array.from({ length: NCUBE - 1 }, (_, k) => T.cube(k))],
    whip: [[T.l03 - 0.2, T.l03 + 0.3], [T.cutB1 - 0.3, T.cutB1 + 0.1], [T.cutA2 - 0.3, T.cutA2 + 0.1], [T.l12end + 0.3, T.loop0]],
    rumble: [[T.coktu, 0.45], [T.geldi - 0.1, 0.25]],
    scratch: [[T.drill0, T.drill1, 0.05], [T.cap0, T.cap1, 0.03]],
    riser: [T.l11, T.hero],
    impact: T.hero,
    silence: T.silence,
    loopEnd: T.loop0,
  };
}

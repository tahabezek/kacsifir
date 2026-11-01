// "Altın" çekirdeği (№ 067): ölçülmüş anlatımdan zamanlar, döküm yüksekliği, kamera anahtarları ve küçük küpün hareketi.
// Tarayıcıdaki çizim, node'daki ses ve özet aynı fonksiyonları okur (tek zaman kaynağı).
import { buildYolTimeline } from './yolculuk_core.js';
import { ease, seg } from '../core.js';

export const SIDE = 22.59;          // (222.600 t / 19,32 t/m³)^(1/3)
export const SMALL = 6.02;          // (4.210 t / 19,32 t/m³)^(1/3)
export const FLOOR = 3.1, APT = { x0: 15, x1: 31, z0: -4.7, z1: 11.3, floors: 7 };   // 7 kat + korkuluk ≈ küp boyu
export const SLIDE = 14;            // küçük küp sokağa doğru (+z) bu kadar kayar
export const POOL = 3.15;           // kare 0'da kalıpta bir kat boyu altın blok (yanlarında külçeler, üstü sıvı)

export function altinTimes(ep, voice) {
  const tl = buildYolTimeline(ep, voice), { L, W } = tl;
  const T = {
    l01end: L.l01.end, l02: L.l02.t0, yaklasik: W('l02', 'yaklaşık'), tonW: W('l02', 'ton'), l03: L.l03.t0, l04: L.l04.t0, yirmi: W('l04', 'yirmi'), metre: W('l04', 'metre'),
    l05: L.l05.t0, yedi: W('l05', 'yedi'), apt: W('l05', 'apartman'), l05end: L.l05.end, l06: L.l06.t0, tr: W('l06', 'türkiye'), l06end: L.l06.end,
    l07: L.l07.t0, dort: W('l07', 'dört'), ton2: W('l07', 'ton'), l08: L.l08.t0, alti: W('l08', 'altı'), iki: W('l08', 'iki'), ev: W('l08', 'ev'), l08end: L.l08.end,
    l09: L.l09.t0, elli: W('l09', 'elli'), l10: L.l10.t0, ici: W('l10', 'içinde'), l10end: L.l10.end, loop0: tl.loop0, D: tl.duration,
  };
  T.silence = [L.l05.end + 0.15, L.l06.t0];                       // doruktan önce gerçek sessizlik
  T.full = T.metre;                                                // döküm "metre"de 22,6 m'de durur
  T.sink0 = T.loop0 - 1.0;                                         // döngü: altın kalıba geri iner
  T.out0 = T.l07 + 0.05; T.out1 = T.ton2 + 0.12;                   // küçük küp dışarı kayar; "ton"da oturur (büyük vuruş)
  T.in0 = T.l10 + 0.35; T.in1 = T.ici + 0.18;                      // geri kayar; "içinde"de yerine oturur
  // kat k, döküm k × 3,1 m'yi geçtiği an yanar (yükseklik eğrisinden ikiye bölmeyle)
  const cross = y => { let a = 0, b = T.full; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (goldHeight(T, m) < y) a = m; else b = m; } return b; };
  T.floorAt = [0, 1, 2, 3, 4, 5, 6, 7].map(k => (k ? cross(k * FLOOR) : 0));
  T.floor2 = k => (k === 1 ? T.iki - 0.32 : T.iki - 0.03);
  return { tl, T };
}

// döküm yüksekliği (m): kare 0'da kalıpta 1,4 m erimiş altın; l02 boyunca yavaş, l03'ten "metre"ye hızlanarak 22,6 m;
// film sonunda kalıba geri iner (son kare = ilk kare)
export function goldHeight(T, t) {
  if (t < T.l03) return POOL + (4.2 - POOL) * t / T.l03;
  if (t <= T.full) { const u = seg(t, T.l03, T.full - T.l03); return 4.2 + (SIDE - 4.2) * (0.65 * u + 0.35 * ease.state(u)); }   // sabite yakın hız: katlar tek tek sayılır
  if (t < T.sink0) return SIDE;
  return SIDE + (POOL - SIDE) * ease.state(seg(t, T.sink0, T.D - T.sink0));
}

// küçük küpün kayması (m, +z): dışarı → bekle → içeri
export function smallOffset(T, t) {
  return SLIDE * (ease.state(seg(t, T.out0, T.out1 - T.out0)) - ease.state(seg(t, T.in0, T.in1 - T.in0)));
}

// Kamera anahtarları: [t, pos, tgt, fov]. Baskın yön: şehrin üstünden meydana (−z, aşağı).
export function camKeys(T) {
  return [
    [0, [16, 15, 42], [0, 2.5, 0], 40],                         // kare 0: alçak 3/4 açı, bloğun külçeli yanları görünür
    [0.6, [13.9, 13.4, 36.5], [0, 2.5, 0], 40],                     // kanca: 600 ms'de 1,15× yaklaşma
    [T.l02 + 0.2, [6, 14, 45], [5, 6, 0], 48],
    [T.l03, [7, 11.2, 56], [11.5, 10.5, 0], 58],                  // iki çekim: küp ve apartman aynı derinlikte, iki çatı kadrajda
    [T.full + 0.1, [8.5, 11.4, 46], [12.5, 11.4, 0], 60],
    [T.yedi - 0.2, [8.8, 11.5, 44.5], [12.5, 11.4, 0], 60],
    [T.silence[1] - 0.05, [9, 11.6, 43], [12.5, 11.4, 0], 60],
    [T.l07 + 0.2, [4.5, 1.9, 48], [8, 3.6, 20], 44],
    [T.ton2 + 0.4, [3.0, 1.8, 45], [8.5, 3.4, 24], 44],
    [T.l08 + 0.6, [2.6, 1.95, 41.4], [8.5, 3.4, 24], 44],          // 1,05× yaklaşma
    [T.ev + 0.2, [-0.5, 4, 90], [-0.5, 3.6, 23], 46],             // iki katlı ev ve 6 m'lik küp yan yana
    [T.elli - 0.5, [-1, 15, 80], [7.5, 2.5, 18], 40],             // doruk: küçük küp ortada, altyazının üstünde
    [T.elli - 0.05, [-1, 15, 80], [7.5, 2.5, 18], 40],
    [T.elli + 0.55, [0.1, 13.3, 72.2], [7.5, 2.5, 18], 40],
    [T.ici + 0.4, [-1, 6, 70], [2, 9.5, 2], 41],
    [T.l10end + 0.5, [6, 16, 45], [0, 6, 0], 50],                 // meydanın içinden döngü başına (binalara girmez)
    [T.loop0, [17, 16.2, 45], [0, 2.5, 0], 40],
    [T.D, [16, 15, 42], [0, 2.5, 0], 40],
  ];
}

export function altinCues(T) {
  return {
    tick: T.floorAt.slice(1).concat([1, 2].map(T.floor2)),
    thock: [T.full - 0.02, T.alti - 0.02, T.elli - 0.02],
    scratch: [[T.l03, T.full, 0.04], [T.in0, T.in1, 0.05], [T.sink0, T.D - 0.1, 0.03]],   // döküm hışırtısı
    whip: [[T.yedi - 0.9, T.yedi - 0.1], [T.silence[1] - 0.2, T.l07 + 0.3], [T.l10end + 0.4, T.loop0 + 0.4]],
    riser: [T.l06, T.out1],
    impact: T.out1,
    silence: T.silence,
    loopEnd: T.loop0,
  };
}

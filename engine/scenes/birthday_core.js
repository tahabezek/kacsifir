// Doğum günü paradoksu (№ 026) — saf çekirdek: kişilerin geliş/çıkış takvimi, tohumlu doğum günleri, iplik (çift)
// takvimi, olasılık, özet ve ses ipuçları. Tarayıcı (birthday.js) ve node (ses, kritik) aynı dosyayı okur.
// 1. kişi Sıfır'dır (halkanın ortasında, baştan beri masada); 2–70 kâğıt figürlerdir. Sıfır'ın çiftleri ortadan
// çıkan ışınlar, başkalarının çiftleri halkanın kirişleridir: "seninle aynı gün" ile "herhangi iki kişi" farkı görünür.
// P(n) = 1 − ∏ (365 − i)/365; seninle aynı gün = 1 − (364/365)^(n−1) (29 Şubat yok, doğum günleri eşit dağılmış).
import { mulberry32 } from '../core.js';

export const N_MAIN = 23, N_MAX = 70, MATCH_A = 10, MATCH_B = 23, MATCH_DAY = 72;   // 14 Mart (0 = 1 Ocak)
const PQ = [1];
for (let n = 1; n <= N_MAX; n++) PQ[n] = PQ[n - 1] * (365 - n + 1) / 365;
export const P = n => 1 - PQ[Math.max(0, Math.min(N_MAX, n))];
export const PYOU = n => 1 - Math.pow(364 / 365, Math.max(0, n - 1));
export const pairs = n => (n < 2 ? 0 : (n * (n - 1)) / 2);
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const pct = x => '%' + nf1.format(x * 100);
export const fmtInt = v => new Intl.NumberFormat('tr-TR').format(v);
export const MONTHS = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
export const MONTH_LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export function dayName(d) { let m = 0; while (d >= MONTH_LEN[m]) { d -= MONTH_LEN[m]; m++; } return `${d + 1} ${MONTHS[m][0]}${MONTHS[m].slice(1).toLocaleLowerCase('tr-TR')}`; }

// Tohumlu örnek: 1–23 arasında tek eşleşme (10. ve 23. kişi, 14 Mart); Sıfır onlarla eşleşmez. 24–70 serbest; tohum,
// 70 kişide toplam 7 eşleşen çift (beklenen 2.415 / 365 ≈ 6,6) ve üçlü eşleşme olmayacak biçimde aranır.
function sample(seed2) {
  const r = mulberry32(26026), d = [null];
  const used = new Set([MATCH_DAY]);
  for (let k = 1; k <= N_MAIN; k++) {
    if (k === MATCH_A || k === MATCH_B) { d[k] = MATCH_DAY; continue; }
    let x; do x = Math.floor(r() * 365); while (used.has(x));
    used.add(x); d[k] = x;
  }
  const r2 = mulberry32(seed2);
  for (let k = N_MAIN + 1; k <= N_MAX; k++) d[k] = Math.floor(r2() * 365);
  return d;
}
function matchList(d) {
  const out = [];
  for (let i = 2; i <= N_MAX; i++) for (let j = 1; j < i; j++) if (d[i] === d[j]) out.push([i, j]);
  return out;
}
const SEED2 = (() => {
  for (let s2 = 1; s2 < 5000; s2++) {
    const d = sample(s2), m = matchList(d), cnt = new Map();
    for (let k = 1; k <= N_MAX; k++) cnt.set(d[k], (cnt.get(d[k]) || 0) + 1);
    if (m.length === 7 && Math.max(...cnt.values()) === 2) return s2;
  }
  throw new Error('tohum bulunamadı');
})();
const DAYS = sample(SEED2);
export const birthdays = () => DAYS.slice();
export const MATCHES = matchList(DAYS);                 // [i, j] (i > j), 14 Mart çifti dahil 7 çift

export function buildBirthdayTimeline(ep) {
  const T = ep.timing;
  const tA = [null, -99];                                   // Sıfır baştan beri masada
  tA[2] = T.first;
  for (let k = 3; k <= N_MAIN; k++) tA[k] = T.second + (T.last - T.second) * Math.pow((k - 3) / (N_MAIN - 3), 0.85);
  for (let k = N_MAIN + 1; k <= N_MAX; k++) tA[k] = T.ext[0] + (T.ext[1] - T.ext[0]) * Math.pow((k - N_MAIN - 1) / (N_MAX - N_MAIN - 1), 0.85);
  // çıkış: son gelen ilk çıkar; her figür ipleriyle birlikte, sayaç birer birer iner
  const [r0] = T.reset, tE = [null, 1e9];
  for (let k = 2; k <= N_MAX; k++) tE[k] = r0 + 0.05 + ((N_MAX - k) / (N_MAX - 2)) * 1.0;
  // iplikler: kişi i gelince her j < i için bir iplik (j = 1 ise Sıfır'dan ışın); kısa bir tel taraması gibi
  const threads = [];
  for (let i = 2; i <= N_MAX; i++) {
    const big = i > N_MAIN, s0 = tA[i] + (big ? 0.04 : 0.1), span = big ? 0.12 : Math.min(0.4, 0.05 + 0.017 * (i - 1));
    for (let j = 1; j < i; j++) threads.push({ i, j, t0: s0 + span * ((j - 1) / Math.max(1, i - 2)), dur: big ? 0.14 : 0.2, tOut: tE[i] });
  }
  return {
    beat: 60 / ep.bpm, tA, tE, threads, hero: T.hero, silence0: T.hero - T.silence, riser: T.riser, vay: T.vay,
    glow: T.glow, ext: T.ext, reset: T.reset, duration: T.duration, says: ep.says,
  };
}

// t anında masadaki kişi sayısı (Sıfır dahil): gelişlerle artar, döngü çıkışında birer birer 1'e iner
export function countAt(tl, t) {
  let n = 1;
  for (let k = 2; k <= N_MAX; k++) if (t >= tl.tA[k] && t < tl.tE[k] + 0.22) n++;
  return n;
}

export function birthdaySummary(ep) {
  const tl = buildBirthdayTimeline(ep), D = tl.duration;
  return {
    duration: D, rw0: tl.reset[0], rw1: D, heroTl: tl.hero, cover: 0,
    keys: [0, 0.6, tl.tA[8] + 0.3, tl.tA[16] + 0.3, tl.vay[0] + 1.2, tl.hero + 0.3, tl.hero + 2, tl.glow[0] + 1.5, tl.ext[0] + 1.2, tl.ext[1] + 0.8, tl.reset[0] + 0.4, D - 0.3],
    fast: (tl.ext[0] + tl.ext[1]) / 2, firstLand: tl.tA[5], lastLand: tl.ext[1] + 0.8,
  };
}

export function birthdayCues(ep) {
  const tl = buildBirthdayTimeline(ep);
  return { tl, d: birthdays() };
}

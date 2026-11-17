// № 083 · Hachikō'nun 3.578 günü (pilot, yeni iskelet "olay canlı akıyor"; 075 ile A/B). Senaryo: research/pilot/083.md
// TEK SABİT KADRAJ, kesme yok: Shibuya İstasyonu'nun girişi (cephe kadrajı doldurur), Hachikō hep aynı noktada (kapının
// sağı). Kare 0'da kamera köpeğe yakın başlar ve açılır; sonra yalnızca yavaş yaklaşır, iki anda (Ueno'nun yokluğu, boş yer)
// köpeğe/boşluğa itilir. Sahip: "sahibini" ile Ueno kapıdan çıkar, "karşılıyor" ile köpek ona koşar, birlikte bir an;
// "ölüyor" ile Ueno'nun yeri boşalır, yalnızca şapkası düşer (ölüm çizilmez). Gün sayacı ve tarih tam o kelimede belirir
// ve sona kadar üstte akar: tek takvim fonksiyonu (gerçek tarihten tam gün farkı), monoton kübik (Fritsch–Butland) zaman
// sıkıştırması: önemli tarihlerde yavaşlar, aralarda hızlanır; söylenen yıl ekrandaki yılla aynı anda. Mevsimler tarihten
// hesaplanır; hız yükselince yılın ortalamasına "bulanır". Her tren saatinde (tren pencerelerden görünür) kapıdan kalabalık
// çıkar, köpek başını kaldırır, kimse gelmez. Köpek yaşlanır. Doruk: şemsiyeli kalabalık önden geçer, köpeğin yeri boşalır
// (karda iz), sessizlik, sayaç 3.578'de kilitlenir ve 1,15x büyür (tek vuruş). Döngü: sayaç geri sarar, heykel yere iner,
// köpek kapıdan çıkıp yerine oturur; son kare = kare 0 (figüranlar dahil).
// dog(), station(), seasonFx(), UENO kartı ve hat() f075'ten kopyalandı (kimlik aynı).

const DAY0 = Date.UTC(1925, 4, 21);   // 21 Mayıs 1925: Ueno'nun öldüğü gün = 0. gün
const AY = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
export const dateOf = d => new Date(DAY0 + Math.floor(d + 1e-9) * 864e5);
export const dateStr = d => { const x = dateOf(d); return `${x.getUTCDate()} ${AY[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
const doyOf = d => { const x = dateOf(d); return (x - Date.UTC(x.getUTCFullYear(), 0, 1)) / 864e5; };
export const daysTo = (y, m, dd) => Math.round((Date.UTC(y, m - 1, dd) - DAY0) / 864e5);
export const ASAHI = daysTo(1932, 10, 4), STATUE = daysTo(1934, 4, 21), LAST = daysTo(1935, 3, 8);   // 2693, 3257, 3578
const Y1932 = daysTo(1932, 1, 1), Y1934 = daysTo(1934, 1, 1);

// monoton kübik (Fritsch–Butland): anahtar günlerden geçer, hız sürekli; düz aralıkta hız 0
function monotone(K) {
  const xs = K.map(k => k[0]), ys = K.map(k => k[1]), n = K.length, dx = [], d = [], m = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / dx[i]; }
  m[0] = 0; m[n - 1] = 0;
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / d[i - 1] + (dx[i] + 2 * dx[i - 1]) / d[i]);
  return (x, der = false) => {
    if (x <= xs[0]) return der ? 0 : ys[0];
    if (x >= xs[n - 1]) return der ? 0 : ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = dx[i], s = (x - xs[i]) / h, s2 = s * s, s3 = s2 * s;
    if (der) return ((6 * s2 - 6 * s) * ys[i] + (3 * s2 - 4 * s + 1) * h * m[i] + (-6 * s2 + 6 * s) * ys[i + 1] + (3 * s2 - 2 * s) * h * m[i + 1]) / h;
    return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * h * m[i + 1];
  };
}
const HERO = T => T.l09 - 0.72;   // sayaç 3.578'de kilitlenir; vuruş sessizliğin sonunda, konuşmanın altında değil
const CROSS = T => HERO(T) - 2.2; // şemsiyeli kalabalığın önden geçişi başlar
const DIE = T => T.w('l02', 12);  // "ölüyor"
const REW = 0.55;                 // döngü geri sarma süresi
// tek takvim: film saniyesi → gün (ondalıklı); geri sarma döngüde 0'a döner
function makeCal(T) {
  const w = (id, k) => T.w(id, k), H = HERO(T);
  const K = [
    [0, 0], [T.l03 - 0.2, 0], [w('l04', 0) - 0.05, 1], [w('l04', 4), 2], [T.l05, 6], [w('l05', 4), 25], [T.l05end + 0.3, 70],
    [T.l06 - 0.12, Y1932 + 4], [w('l06', 6), ASAHI], [T.l06end, ASAHI + 50], [T.l07 - 0.12, Y1934 + 3], [w('l07', 5), STATUE], [w('l07', 5) + 0.7, STATUE],
    [T.l07end + 0.1, STATUE + 32], [T.l08 - 0.1, 3530], [CROSS(T) + 0.2, 3572], [H - 1.1, LAST - 2], [H - 0.42, LAST - 1], [H, LAST],
  ];
  const f = monotone(K);
  const day = t => (t < T.loop0 ? f(t) : LAST * (1 - ease0(Math.min(1, (t - T.loop0) / REW))));
  const speed = t => (t < T.loop0 ? f(t, true) : Math.abs(day(t + 0.01) - day(t - 0.01)) / 0.02);
  return { day, speed, K };
}
// durum eğrisi (cubic-bezier 0.65,0,0.35,1) — node tarafında (ses ipuçları) motorun ease'i yok: aynı eğri burada
function ease0(u) { let a = 0, b = 1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2, x = bz(m, 0.65, 0.35); if (x < u) a = m; else b = m; } return bz((a + b) / 2, 0, 1); }
function bz(s, p1, p2) { const k = 1 - s; return 3 * k * k * s * p1 + 3 * k * s * s * p2 + s * s * s; }

export function hero(T) { return HERO(T); }
export function cues(T) {
  const w = (id, k) => T.w(id, k), H = HERO(T), cal = makeCal(T);
  const tick = [];   // sayaç yavaşken her gün değişimine kalem tıkı
  let prev = 0;
  for (let t = 0; t < T.loop0; t += 1 / 240) { const d = Math.floor(cal.day(t) + 1e-9); if (d !== prev && cal.speed(t) < 9) tick.push(t); prev = d; }
  return {
    tick,
    thock: [DIE(T) + 0.45, w('l05', 3) + 0.05, w('l07', 4) - 0.05],     // şapka yere düşer; kâse yere konur; kaide oturur
    flutter: [[w('l06', 6) - 0.1, w('l06', 6) + 0.8]],                  // gazete açılır
    whip: [[T.l05end + 0.1, T.l05end + 0.7], [w('l07', 5) + 0.15, w('l07', 5) + 0.65], [T.loop0 - 0.1, T.loop0 + 0.55]],
    scratch: [[w('l02', 6) - 0.05, w('l02', 6) + 0.45, 0.02], [CROSS(T), H - 0.85, 0.035]],   // köpeğin koşusu; kalabalığın adımları
    riser: [T.l08, H - 0.8],
    silence: [H - 0.8, H],
    impact: H,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
// Profesör Hidesaburō Ueno (f075 kartı): koyu takım, gözlük, fötr şapka (şapka ayrıca çizilir)
const UENO = base({
  key: 'ueno', name: 'Hidesaburō Ueno', seed: 751,
  head: { w: 0.9, h: 1.02, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.88, shoulder: 0.7, hip: 0.6, depth: 0.46, belly: 0.05, color: '#4A4238', shade: '#3A332B' },
  arm: { upper: 0.42, lower: 0.4, w: 0.19, color: '#4A4238', shade: '#3A332B', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#3E372F', shade: '#2E2922' },
  shoe: { color: '#1E1A16', len: 0.3, h: 0.11 },
  skin: '#EAC39C', skinShade: '#D2A87E', hair: '#2A2420',
  features: ['suit', 'tie', 'hairSlick', 'glassesRect'],
});
// istasyon yolcuları (f075 ile aynı kartlar + iki yeni)
const YOLCU = (seed, coat, hair = '#2A2420', extra = []) => base({
  key: 'yolcu' + seed, name: 'Yolcu', seed,
  torso: { len: 0.84, shoulder: 0.66, hip: 0.6, depth: 0.44, belly: 0.02, color: coat, shade: coat },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: coat, shade: coat, hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#34343C', shade: '#26262C' },
  shoe: { color: '#1E1A16', len: 0.28, h: 0.11 },
  skin: '#EAC39C', skinShade: '#D2A87E', hair,
  features: ['hairSlick', ...extra],
});
const Y1 = YOLCU(761, '#6B5A48'), Y2 = YOLCU(762, '#3F4F5E'), Y3 = YOLCU(763, '#7A4A3A', '#2A2420', ['bun', 'skirt']), Y4 = YOLCU(764, '#55603F');
const Y5 = YOLCU(765, '#2E4A6B'), Y6 = YOLCU(766, '#8A5A44', '#2A2420', ['bun', 'skirt']);
const POOL = [Y2, Y4, Y1, Y5, Y6, Y3];
// gazeteci çocuk (1932)
const BOY = base({
  key: 'gazeteci', name: 'Gazeteci çocuk', seed: 771,
  torso: { len: 0.62, shoulder: 0.58, hip: 0.52, depth: 0.4, belly: 0, color: '#5A6E7E', shade: '#48596A' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#5A6E7E', shade: '#48596A', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.18, color: '#3A3530', shade: '#2C2824' },
  shoe: { color: '#1E1A16', len: 0.26, h: 0.1 },
  skin: '#EAC39C', skinShade: '#D2A87E', hair: '#2A2420',
  features: ['hairSpiky'],
});

export async function film(A) {
  const { ctx, T, D, W, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, crowd, LW } = A;
  const w = (id, k) => T.w(id, k);
  const H = HERO(T), XC = CROSS(T), cal = makeCal(T), tDie = DIE(T);
  const GY = 1460;                         // zemin çizgisi (dünya; zoom 1'de ekran)
  const SC = 1.28, SXC = 480;              // istasyon ölçeği (075'in 1,35 katı) ve kapının x'i
  const DOG_X = 650, DOG_K = 1.15;         // Hachikō'nun yeri
  const PS = 1.2, PED_X = 885;             // heykel ölçeği ve kaidenin x'i (köpeğin hemen yanında)
  const HS = 118;                          // yolcu ölçeği (baş boyu, px)
  const DOOR = { x: SXC - 140 * SC, y: GY - 350 * SC, w: 280 * SC, h: 350 * SC };
  const FUR = '#F4EAD6', FUR_S = '#E2D2B2', OLD = '#C8C5BD', OLD_S = '#A6A196', BRONZE = '#8A6A3A', BRONZE_S = '#6E5230', BRONZE_H = '#A8844C';
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(lerp(v, y[i], u)).toString(16).padStart(2, '0')).join(''); };
  const doorShade = u => {   // kapının karanlığından çıkış: kapı rengi üstte, açılarak kalkar
    if (u >= 1) return;
    ctx.save(); ctx.beginPath(); ctx.rect(DOOR.x + 3, DOOR.y + 3, DOOR.w - 6, DOOR.h - 3); ctx.clip();
    ctx.globalAlpha = 1 - ease.enter(Math.max(0, u)); ctx.fillStyle = '#3A2E26'; ctx.fillRect(DOOR.x, DOOR.y, DOOR.w, DOOR.h); ctx.restore();
  };

  // ——— Hachikō: f075'teki tek çizim fonksiyonu; yalnızca yaş (age 0..1) eklendi: tüy grileşir, baş ve kulaklar düşer
  const dog = (x, y, k, dir = 1, o = {}) => {
    const br = !!o.bronze, age = o.age || 0;
    const F = br ? BRONZE : mix(FUR, OLD, age), FS = br ? BRONZE_S : mix(FUR_S, OLD_S, age), lw = LW / k;
    ctx.save(); ctx.translate(x, y); ctx.scale(k * dir, k);
    const wag = (o.wag || 0), tail = (cx, cy) => {   // kıvrık kuyruk: sırtın üstünde halka (yaşla aşağı iner)
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(wag * 0.25 + age * 0.35);
      ctx.beginPath(); ctx.arc(0, -20, 30, Math.PI * 0.95, Math.PI * 2.7); ctx.lineWidth = 34; ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round'; ctx.stroke();
      ctx.lineWidth = 34 - lw * 2; ctx.strokeStyle = F; ctx.stroke(); ctx.restore();
    };
    const head = (hx, hy, a) => {
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
      ctx.save(); ctx.translate(-22, -28); ctx.rotate(-age * 0.25); poly([[0, 0], [-12, -50], [24, -14]], F, lw); ctx.restore();   // sol kulak (dik; yaşla yatar)
      ctx.save(); ctx.translate(18, -36); ctx.rotate(0.35 + (o.ear || 0) + age * 0.3); poly([[0, 0], [8, -46], [28, -4]], F, lw); ctx.restore();   // sağ kulak hafif düşük
      ell(0, 0, 46, 42, F, lw);
      ell(40, 14, 34, 22, FS, lw);                                                              // burun kemeri
      circ(70, 6, 8, PAL.ink, 0);
      if (age > 0.5 && !br) { line(4, -12, 20, -10, lw * 0.7); } else circ(12, -10, 6, PAL.ink, 0);   // yaşlı: göz kapağı yarı kapalı
      line(44, 30, 60, 32, lw * 0.6);
      ctx.restore();
    };
    if (o.pose === 'walk') {
      const ph = (o.ph || 0) * Math.PI * 2, leg = (lx, a) => { ctx.save(); ctx.translate(lx, -96); ctx.rotate(Math.sin(a) * 0.45); rect(-11, 0, 22, 92, FS, lw, 10); ell(4, 94, 16, 9, F, lw); ctx.restore(); };
      leg(-58, ph + Math.PI); leg(48, ph);
      tail(-82, -128);
      ell(-4, -118, 92, 44, F, lw);
      leg(-46, ph); leg(60, ph + Math.PI);
      head(92, -168 + Math.sin(ph * 2) * 3, (o.look || 0) - 0.1);
    } else {
      tail(-70, -100 + age * 10);
      ell(-28, -62, 64, 58, F, lw);                                                             // arka kalça
      ctx.save(); ctx.translate(-4, -110 + age * 8); ctx.rotate(-0.42 + age * 0.14); ell(0, 0, 48, 82, F, lw); ctx.restore();   // gövde, dik (yaşla öne çöker)
      rect(6, -96, 24, 96, FS, lw, 10); ell(26, -2, 20, 10, F, lw);                            // uzak ön bacak
      ell(-44, -6, 34, 12, F, lw);                                                              // arka pati
      head(28 + age * 8, -198 + age * 22, (o.look || 0) + age * 0.16);
      ell(20 + age * 4, -150 + age * 12, 34, 26, F, 0);                                         // boyun (çizgisiz dolgu)
      rect(34, -100, 26, 100, F, lw, 11); ell(54, -2, 22, 11, F, lw);                         // yakın ön bacak
      if (!br) { ctx.beginPath(); ctx.arc(26 + age * 6, -168 + age * 14, 30, 0.35, 1.9); ctx.lineWidth = 9; ctx.strokeStyle = '#B03A2E'; ctx.stroke(); }   // tasma
    }
    if (br) { ctx.globalAlpha = 0.35; line(-30, -170, -50, -110, 8, BRONZE_H); ctx.globalAlpha = 1; }
    ctx.restore();
  };
  // fötr şapka (f075): kafa merkezini karakterin iskeletinden alır
  const hat = (o, sk, side = false) => {
    const s = o.s, hx = o.x + sk.head[0] * s * (side ? (o.facing || 1) : 1), hy = o.y + sk.head[1] * s;
    hatAt(hx, hy - 0.42 * s, s, side);
    return [hx, hy - 0.42 * s];
  };
  const hatAt = (bx, by, s, side = true, rot = 0) => {   // (bx, by) siper merkezi
    ctx.save(); ctx.translate(bx, by); ctx.rotate(rot);
    ell(0, 0, (side ? 0.62 : 0.66) * s, 0.09 * s, '#2E2822', LW);
    poly([[-0.36 * s, -0.02 * s], [-0.32 * s, -0.38 * s], [0, -0.44 * s], [0.32 * s, -0.38 * s], [0.36 * s, -0.02 * s]], '#3A322A', LW);
    rect(-0.36 * s, -0.14 * s, 0.72 * s, 0.1 * s, '#1E1A16', 0);
    ctx.restore();
  };

  // ——— istasyon cephesi (f075: tuğla, saat, ortada giriş); kadrajı doldurur. Tren sağ pencerelerden görünür (içeride peron)
  const trainX = t => {   // pencerelerdeki vagonların kayması (yerel x); tren yoksa null
    for (const P of pulses) { const u = t - P.p; if (u < -1.3 || u > 2.3) continue; return u < 0 ? lerp(1400, 0, ease.enter(seg(u, -1.3, 1.3))) : lerp(0, -1700, ease.exit(seg(u, 1.2, 1.0))); }
    return null;
  };
  const stationFront = (t) => {
    ctx.save(); ctx.translate(SXC, GY); ctx.scale(SC, SC); ctx.translate(-540, -1250);
    rect(40, 720, 1000, 530, '#B5654A', LW, 4);
    for (let r = 0; r < 9; r++) line(40, 760 + r * 54, 1040, 760 + r * 54, 3, '#9A5038');
    poly([[10, 720], [540, 600], [1070, 720]], '#4A4A52', LW);
    rect(400, 900, 280, 350, '#3A2E26', LW, 6);
    rect(330, 800, 420, 70, '#F4EFE3', LW, 6); text('SHIBUYA', 540, 852, 52, PAL.ink, 'IBM Plex Mono', 500);
    circ(540, 690, 46, '#F4EFE3', LW); const a = 2 * Math.PI * t / D; line(540, 690, 540 + 26 * Math.sin(a), 690 - 26 * Math.cos(a), 6); line(540, 690, 540 + 34 * Math.sin(a * 12), 690 - 34 * Math.cos(a * 12), 4);
    const tx = trainX(t);
    for (const x of [100, 220, 780, 900]) {
      rect(x, 940, 90, 140, '#E8C77A', LW, 4);
      if (tx != null) {
        ctx.save(); ctx.beginPath(); ctx.rect(x + 3, 943, 84, 134); ctx.clip();
        for (let i = 0; i < 4; i++) { const cx = 560 + tx + i * 300; rect(cx, 966, 290, 130, '#5E3B2A', 4, 10); for (let j = 0; j < 3; j++) rect(cx + 22 + j * 92, 984, 66, 44, '#F6E2B8', 3, 4); }
        ctx.restore(); rect(x, 940, 90, 140, null, LW, 4);
      }
      line(x + 45, 940, x + 45, 1080, 4);
    }
    ctx.restore();
  };
  const signFront = () => {   // tabela ağacın önünde kalır: "SHIBUYA" her an tam okunur
    ctx.save(); ctx.translate(SXC, GY); ctx.scale(SC, SC); ctx.translate(-540, -1250);
    rect(330, 800, 420, 70, '#F4EFE3', LW, 6); text('SHIBUYA', 540, 852, 52, PAL.ink, 'IBM Plex Mono', 500);
    ctx.restore();
  };
  // mevsim katmanı (f075): 0 kiraz, 2 sonbahar, 3 yağmur, 4 kar; yoğunluk alpha ile (tohumlu, t'nin saf fonksiyonu)
  const seasonFx = (t, s, a) => {
    if (a < 0.02) return;
    ctx.save(); ctx.globalAlpha = Math.min(1, a);
    const r = mulberry32(900 + s), n = 52;
    for (let i = 0; i < n; i++) {
      const x0 = r() * 1300 - 110, sp = 0.6 + r() * 0.8, ph = r();
      const y = -100 + ((ph + t * (s === 3 ? 0.8 : 0.16) * sp) % 1) * 1800, x = x0 + Math.sin(t * 2 + i) * 20;
      if (s === 0) ell(x, y, 12, 8, '#F4B6C2', 3, t + i);
      if (s === 2) ell(x, y, 14, 9, i % 2 ? '#D8722E' : '#C9A23A', 3, t * 2 + i);
      if (s === 3) line(x, y, x - 10, y + 50, 4, '#7FA3B8');
      if (s === 4) circ(x, y, 7, '#FFFFFF', 2);
    }
    ctx.restore();
  };

  // ——— takvimden mevsim: yılın günü → gök rengi, ağaç, parçacık ağırlıkları; hız yükselince yılın ortalamasına bulanır
  const wrapD = (a, b) => { const d = Math.abs(a - b) % 365; return Math.min(d, 365 - d); };
  const bump = (doy, c, wd) => Math.max(0, 1 - Math.pow(wrapD(doy, c) / wd, 2));
  const SKY = [[15, '#D9DCDD'], [98, '#F3D9CF'], [141, '#F0D2AE'], [176, '#CBD0D1'], [215, '#F0CFA6'], [309, '#EDBE8E'], [355, '#D9DCDD']];
  const TREE = [[60, '#8A6A50', 0], [95, '#F4B6C2', 1], [114, '#F4B6C2', 1], [132, '#7FA65A', 1], [285, '#7FA65A', 1], [315, '#D8722E', 1], [340, '#8A6A50', 0.1]];
  const cyc = (P, doy, k) => {
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], b0 = i + 1 < P.length ? b[0] : b[0] + 365, x = doy < P[0][0] ? doy + 365 : doy;
      if (x >= a[0] && x <= b0) { const u = (x - a[0]) / (b0 - a[0]); return k === 1 ? mix(a[1], b[1], u) : lerp(a[2], b[2], u); }
    }
    return k === 1 ? P[0][1] : P[0][2];
  };
  const seasonAt = t => {
    const d = cal.day(t), doy = doyOf(d), q = 1 / (1 + Math.abs(cal.speed(t)) / 110);   // q: canlılık (yavaş = 1)
    return {
      sky: mix('#E6D4BE', cyc(SKY, doy, 1), q), tree: mix('#A8A070', cyc(TREE, doy, 1), q), leaf: lerp(0.6, cyc(TREE, doy, 2), q),
      petal: q * bump(doy, 100, 22), rain: q * bump(doy, 172, 24), leaves: q * bump(doy, 312, 30), snow: q * bump(doy, 32, 62),
    };
  };
  const tree = (S) => {   // sol önde kiraz ağacı (075 ölçeğinde çizilip 1,3x): taç mevsimle büyür/küçülür ve renk değiştirir
    ctx.save(); ctx.translate(20, GY); ctx.scale(1.3, 1.3); ctx.translate(-70, -1250);
    line(70, 1250, 78, 910, 26, '#5E4128'); line(70, 1250, 78, 910, 16, '#7A5638');
    const br = [[78, 980, 0, 810], [78, 950, 190, 840], [78, 1010, -60, 910], [80, 930, 150, 750]];
    for (const [x0, y0, x1, y1] of br) { line(x0, y0, x1, y1, 14, PAL.ink); line(x0, y0, x1, y1, 8, '#7A5638'); }
    if (S.leaf > 0.03) { const k = S.leaf; for (const [x, y, r] of [[10, 820, 110], [150, 790, 100], [90, 730, 95], [-40, 910, 80], [200, 880, 70]]) circ(x, y, r * (0.4 + 0.6 * k), S.tree, LW); }
    if (S.snow > 0.05) { ctx.save(); ctx.globalAlpha = Math.min(1, S.snow * 1.4); for (const [x0, y0, x1, y1] of br) line(x0, y0 - 6, (x0 + x1) / 2, (y0 + y1) / 2 - 8, 8, '#FFFFFF'); ctx.restore(); }
    ctx.restore();
  };

  // ——— tren saatleri: tren durur (p), kapıdan kalabalık çıkar; kimse onun için gelmez
  const pulses = [
    { p: -0.8, n: 4 }, { p: 2.5, n: 2 }, { p: w('l04', 0) - 0.4, n: 3 },
    { p: T.l05end + 0.6, n: 3 }, { p: T.l06 - 0.6, n: 2 }, { p: T.l06end + 0.4, n: 3 }, { p: T.l07end + 0.5, n: 3 }, { p: T.l08 - 0.6, n: 3 },
    { p: T.l09 + 0.25, n: 4 }, { p: T.l10 + 0.4, n: 2 }, { p: D - 0.8, n: 4, twin: 0 },
  ];
  const people = [];
  pulses.forEach((P, j) => { const jj = P.twin ?? j, r = mulberry32(300 + jj * 17); for (let i = 0; i < P.n; i++) people.push({ card: POOL[(jj * 2 + i) % POOL.length], start: P.p + 0.2 + i * 0.38, dir: i % 2 === 0 ? -1 : 1, v: 270 + r() * 60, ph: r() }); });
  // aynı trenin geç inen yolcuları (Ueno ile köpek birlikteyken arkadan geçerler; tren yok)
  for (const [card, st, dir, ph] of [[Y4, w('l02', 7) + 0.1, -1, 0.31], [Y6, w('l02', 9), 1, 0.62], [Y5, w('l02', 11) - 0.1, -1, 0.12]]) people.push({ card, start: st, dir, v: 280, ph });
  // köpeğin başı: her tren saatinde kalkar (umut), kalabalık gidince iner
  const hope = t => { let h = 0; for (const P of pulses) { const u = t - P.p; if (u > -0.2 && u < 3.4) h = Math.max(h, ease.state(seg(u, 0.1, 0.45)) * (1 - ease.state(seg(u, 2.3, 0.7)))); } return h; };

  const drawUmbrella = (x, y, rx, ry, col) => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke();
    for (let i = 1; i < 6; i++) { const a = Math.PI + (i / 6) * Math.PI; line(x, y - ry, x + Math.cos(a) * rx, y + Math.sin(a) * ry * 0.02, 3, 'rgba(31,36,33,0.55)'); }
    circ(x, y - ry - 6, 7, PAL.ink, 0);
  };
  const walker = (pp, t, wet) => {
    const u = t - pp.start; if (u < 0 || u > 5.2) return;
    const x = SXC + pp.dir * pp.v * u; if (x < -250 || x > 1350) return;
    const s = HS, o = { x, y: GY, s, walk: (pp.ph + u * 1.1) % 1, facing: pp.dir };
    if (wet) o.armR = { sh: 125, el: 35 };
    const sk = ch(pp.card, o, t);
    if (wet) { const hx = x + sk.handR[0] * s * pp.dir, hy = GY + sk.handR[1] * s; line(hx, hy, hx, GY - 3.25 * s, 5); drawUmbrella(hx, GY - 3.2 * s, 0.95 * s, 0.5 * s, ['#2E3A4A', '#7A3A2E', '#2A2420'][Math.floor(pp.ph * 3)]); }
    doorShade(u / 0.4);
  };

  // ——— sahip: "sahibini" ile kapıdan çıkar, "karşılıyor" ile köpek koşar, birlikte bir an; "ölüyor" ile yer boşalır
  const tU0 = w('l02', 3) - 0.1, tRun = w('l02', 6), UX = 390, US = 122;
  const tBack = T.l03 + 0.05;              // köpek kendi yerine döner
  const hatFall = t => {                   // düşen şapka: Ueno'nun yerinde kalan tek şey
    const u = seg(t, tDie, 0.45), y0 = GY - 3.05 * US, y1 = GY - 0.12 * US;
    return { x: UX + 12 + 30 * u, y: lerp(y0, y1, u * u), rot: 1.1 * ease.enter(u) };
  };
  const ueno = t => {
    if (t < tU0) return;
    if (t < tDie) {
      const walkU = seg(t, tU0, 0.9), x = lerp(SXC, UX, ease.enter(walkU));
      const pat = ease.state(seg(t, tRun + 0.4, 0.25)) * (1 - ease.state(seg(t, tRun + 1.0, 0.3)));   // birlikte bir an (600 ms)
      const o = { x, y: GY, s: US, view: 'side', facing: walkU < 1 ? -1 : 1, walk: walkU < 1 ? (t * 1.1) % 1 : undefined, expr: 'mutlu', lean: 14 * pat, armR: walkU < 1 ? undefined : { sh: 20 + 55 * pat, el: 20 + 10 * pat }, head: { tilt: 0, look: [0.4, 0.4 * pat] } };
      const sk = ch(UENO, o, t); hat(o, sk, true);
      doorShade((t - tU0) / 0.4);
      return;
    }
    if (t > T.l05end + 0.85) return;
    const hf = hatFall(t); hatAt(hf.x, hf.y, US, true, hf.rot);
  };

  // ——— özel anlar
  const tBowl = w('l05', 3) + 0.05;                  // "veriyor": kâse yere
  const BOWL_X = 545;
  const vendor = t => {   // satıcı kadın soldan gelir, kâseyi köpeğin önüne bırakır, geri gider
    const a = T.l05 - 1.9, arrive = T.l05 - 0.1, back = tBowl + 0.45;
    if (t < a || t > back + 3) return;
    let x, f = 1, walkP = null, lean = 0, arm = null;
    if (t < arrive) { x = lerp(-180, 430, ease.enter(seg(t, a, arrive - a))); walkP = (t * 1.2) % 1; }
    else if (t < back) { x = 430; const b = ease.state(seg(t, tBowl - 0.45, 0.4)) * (1 - ease.state(seg(t, tBowl + 0.1, 0.3))); lean = 24 * b; arm = { sh: 30 + 50 * b, el: 10 }; }
    else { x = lerp(430, -220, ease.exit(seg(t, back, 1.8))); f = -1; walkP = (t * 1.2) % 1; }
    ch(Y3, { x, y: GY, s: HS, view: 'side', facing: f, walk: walkP == null ? undefined : walkP, lean, armR: arm || undefined, expr: 'notr' }, t);
  };
  const bowl = t => { if (t < tBowl || t > T.l05end + 0.85) return; ell(BOWL_X, GY - 10, 44, 16, '#C9A23A', LW); ell(BOWL_X, GY - 18, 34, 7, '#F4EFE3', 3); };
  const tShoo = w('l05', 4);
  const shoo = t => {     // sağdan gelen adam bağırıp el sallar (f075'teki kovma pozu)
    const a = tShoo - 1.0, out = T.l05end + 0.2;
    if (t < a || t > out + 2) return;
    let x = 895, f = -1, walkP = null, arm = { sh: 140, el: 30 + 30 * Math.sin(t * 12) };
    if (t < tShoo) { x = lerp(1300, 895, ease.enter(seg(t, a, 0.95))); walkP = (t * 1.2) % 1; arm = undefined; }
    else if (t > out) { x = lerp(895, 1340, ease.exit(seg(t, out, 1.4))); f = 1; walkP = (t * 1.2) % 1; arm = undefined; }
    ch(Y1, { x, y: GY, s: HS + 2, view: walkP == null ? 'front' : 'side', facing: f, walk: walkP == null ? undefined : walkP, expr: 'kizgin', talk: t > tShoo && t < out ? 0.35 + 0.35 * Math.sin(t * 19) : 0, armR: arm, head: { look: [-0.6, 0.1] } }, t);
  };
  const tPaper = w('l06', 6);                          // "gazete": 4 Ekim 1932
  const paperPage = (cx, cy, k) => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.03);
    rect(-130, -160, 260, 320, '#F2ECDD', LW, 4);
    rect(-110, -140, 220, 52, PAL.ink, 0); text('ASAHI · 1932', 0, -102, 30, '#F2ECDD', 'IBM Plex Mono', 500);
    rect(-110, -76, 130, 130, '#E2D8C2', 4);
    ctx.save(); ctx.beginPath(); ctx.rect(-110, -76, 130, 130); ctx.clip(); dog(-50, 54, 0.45, 1, {}); ctx.restore();
    for (let i = 0; i < 6; i++) line(34, -66 + i * 22, 110, -66 + i * 22, 6, '#8C8678');
    for (let i = 0; i < 4; i++) line(-110, 76 + i * 22, 110, 76 + i * 22, 6, '#8C8678');
    ctx.restore();
  };
  const newsboy = t => {
    const a = tPaper - 1.3, arrive = tPaper - 0.1, leave = T.l07 - 1.2, BX = 230;
    if (t < a || t > leave + 2.2) return;
    let x, f = 1, walkP = null, raise = 0;
    if (t < arrive) { x = lerp(-180, BX, ease.enter(seg(t, a, arrive - a))); walkP = (t * 1.3) % 1; }
    else if (t < leave) { x = BX; raise = ease.enter(seg(t, tPaper, 0.45)); }
    else { x = lerp(BX, -220, ease.exit(seg(t, leave, 1.9))); f = -1; walkP = (t * 1.3) % 1; }
    const s = 122, sk = ch(BOY, { x, y: GY, s, view: 'side', facing: f, walk: walkP == null ? undefined : walkP, armR: { sh: lerp(20, 115, raise), el: lerp(10, 5, raise) }, armL: raise > 0 ? { sh: lerp(10, 110, raise), el: 5 } : undefined, expr: 'mutlu', talk: raise > 0.9 && t < T.l06end ? 0.3 + 0.3 * Math.sin(t * 17) : 0 }, t);
    if (raise > 0) { const hx = x + sk.handR[0] * s * f, hy = GY + sk.handR[1] * s; paperPage(hx + 14, hy - 40 * raise + 100, lerp(0.5, 1.15, raise)); }
  };
  // ünlü olunca: insanlar köpeğin çevresinde durur; kapının önünde izleyen kalabalık (kafalar) belirir
  const tFame = w('l06', 10) - 0.3, fameOut = T.l07end + 0.4;
  const fans = t => {
    if (t < tFame - 1.2 || t > fameOut + 1.8) return;
    const list = [[Y2, -200, 455, 1, 0], [Y6, -220, 150, 1, 0.35], [Y5, 1360, 1040, -1, 0.7]];
    for (const [c, x0, x1, f, dl] of list) {
      const a = tFame - 1.2 + dl, inU = seg(t, a, 1.1), outU = seg(t, fameOut + dl * 0.5, 1.2);
      let x = lerp(x0, x1, ease.enter(inU)), ff = f, walkP = inU > 0 && inU < 1 ? (t * 1.2) % 1 : null;
      if (outU > 0) { x = lerp(x1, x0, ease.exit(outU)); ff = -f; walkP = (t * 1.2) % 1; }
      if (inU <= 0) continue;
      const petting = c === Y2 && walkP == null && t > tFame + 0.4 && t < w('l07', 0);   // biri köpeği okşar
      ch(c, { x, y: GY, s: HS, view: 'side', facing: ff, walk: walkP == null ? undefined : walkP, expr: 'mutlu', lean: petting ? 18 : 0, armR: walkP == null ? { sh: petting ? 70 + 8 * Math.sin(t * 6) : 20, el: 10 } : undefined }, t);
    }
  };
  const fameCrowd = t => {   // kapının önünde izleyen kalabalık (y 1420'nin üstünde): aşağıdan girer; açılışta kollar kalkar
    const u = ease.enter(seg(t, tFame, 0.8)) * (1 - ease.exit(seg(t, fameOut, 0.7)));
    if (u <= 0) return;
    const up = ease.state(seg(t, w('l07', 5) + 0.3, 0.4)) * (1 - ease.state(seg(t, T.l07end, 0.5)));
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 2000, GY + 400); ctx.clip();
    crowd(-40, 1318 + (1 - u) * 260, 520, 2, 4242, up, 1.3, t);
    ctx.restore();
  };
  // heykel: kaide örtülü yükselir; "heykelini" ile örtü sağa çekilir (075 ölçeğinde çizilip PS ile büyütülür)
  const tRise = w('l07', 3) - 0.1, tUnveil = w('l07', 5);
  const statue = (t, S) => {
    let rise = ease.enter(seg(t, tRise, 0.75));
    if (t >= T.loop0) rise = 1 - ease.state(seg(t, T.loop0, 0.5));
    if (rise <= 0) return;
    const P0 = 880, PW = 166, PH = 132, G0 = 1250;
    ctx.save(); ctx.translate(PED_X, GY); ctx.scale(PS, PS); ctx.translate(-P0, -G0);
    ctx.beginPath(); ctx.rect(-400, -400, 2400, G0 + 400 + 3); ctx.clip();
    ctx.translate(0, (1 - rise) * (PH + 230));
    rect(P0 - PW / 2, G0 - PH, PW, PH, '#B9B1A2', LW / PS, 4); rect(P0 - PW / 2 - 14, G0 - PH - 18, PW + 28, 22, '#A49C8C', LW / PS, 4);
    rect(P0 - 40, G0 - PH + 34, 80, 36, '#CFC7B6', 3, 3);
    const top = G0 - PH - 18;
    dog(P0 + 4, top, 0.7, -1, { bronze: true });
    if (S.snow > 0.05) { ctx.save(); ctx.globalAlpha = Math.min(1, S.snow * 1.4); rect(P0 - PW / 2 - 14, top - 8, PW + 28, 12, '#FFFFFF', 3, 6); ctx.restore(); }
    const off = ease.exit(seg(t, tUnveil, 0.55));   // örtü: krem bez, kırmızı ip
    if (off < 1 && t < T.loop0) {
      ctx.save(); ctx.translate(off * 560, -off * 90); ctx.rotate(off * 0.35);
      poly([[P0 - 70, top + 2], [P0 - 62, top - 120], [P0 - 20, top - 160], [P0 + 30, top - 150], [P0 + 62, top - 96], [P0 + 72, top + 2]], '#F4EFE3', LW / PS);
      line(P0 - 64, top - 60, P0 + 66, top - 48, 7, PAL.red);
      ctx.restore();
    }
    ctx.restore();
  };
  // önden geçen şemsiyeli kalabalık (doruk): sayacın çok altında; geçince köpeğin yeri boş
  const CROSSERS = [[Y5, '#2E3A4A'], [Y1, '#7A3A2E'], [Y6, '#2A2420'], [Y4, '#3F4F5E'], [Y2, '#7A3A2E']];
  const CV = 1150, tGone = XC + (1400 + 310 - DOG_X) / CV;
  const crossers = t => {
    if (t < XC || t > XC + 3.2) return;
    CROSSERS.forEach(([c, col], i) => {
      const x = 1400 + i * 310 - CV * (t - XC); if (x < -400 || x > 1500) return;
      const s = 220, sk = ch(c, { x, y: 1910, s, walk: (t * 1.9 + i * 0.3) % 1, facing: -1, armR: { sh: 125, el: 35 } }, t);
      const hx = x - sk.handR[0] * s, hy = 1910 + sk.handR[1] * s;
      line(hx, hy, hx, 1910 - 3.0 * s, 9);
      drawUmbrella(hx, 1910 - 2.95 * s, 290, 250, col);
    });
  };

  // ——— köpek
  const ageAt = t => (t >= T.loop0 ? 0 : Math.max(0, Math.min(1, (cal.day(t) - 2400) / 1100)) ** 1.2 * 0.95);
  const NEAR = 520;   // Ueno'nun yanında oturduğu yer
  const drawDog = (t, S) => {
    if (t >= tGone && t < T.loop0) {   // boş yer: karda oturma izi ve pati izleri
      ctx.save(); ctx.globalAlpha = 0.35; ell(DOG_X + 6, GY - 4, 110, 18, '#4A5058', 0);
      for (const [px, py] of [[DOG_X - 80, GY + 22], [DOG_X - 140, GY + 40], [DOG_X - 210, GY + 26], [DOG_X - 280, GY + 44]]) { ell(px, py, 14, 8, '#4A5058', 0); }
      ctx.restore(); return;
    }
    if (t >= T.loop0) {   // döngü: köpek kapıdan çıkıp yerine yürür ve oturur
      const a = T.loop0 + 0.1, b = T.loop0 + 0.75;
      if (t < a) return;
      if (t < b) { const u = seg(t, a, b - a); dog(lerp(SXC, DOG_X, u), GY, DOG_K, 1, { pose: 'walk', ph: t * 2.6, wag: Math.sin(t * 9) }); doorShade(u / 0.3); return; }
    }
    // sahip sahnesi: koşu, birlikte, yokluk, geri dönüş
    if (t >= tRun && t < tBack + 0.6) {
      if (t < tRun + 0.42) { const u = ease.state(seg(t, tRun, 0.42)); dog(lerp(DOG_X, NEAR, u), GY, DOG_K, -1, { pose: 'walk', ph: t * 3, wag: Math.sin(t * 12) }); return; }
      if (t >= tBack) { const u = seg(t, tBack, 0.6); dog(lerp(NEAR, DOG_X, ease.state(u)), GY, DOG_K, 1, { pose: 'walk', ph: t * 2.2, wag: 0, look: 0.1 }); return; }
      const gone = t >= tDie, sad = ease.state(seg(t, tDie, 0.4));
      dog(NEAR, GY, DOG_K, -1, { look: gone ? lerp(-0.3, 0.2, sad) : -0.3, wag: gone ? 0 : Math.sin(t * 10) * 1.1, ear: 0.45 * sad - 0.15 * (1 - sad) });
      return;
    }
    const age = ageAt(t), h = hope(t) * (1 - 0.45 * age);
    const sh = seg(t, tShoo + 0.05, 0.25) * (1 - seg(t, T.l05end + 0.2, 0.5));
    const eat = ease.state(seg(t, tBowl + 0.35, 0.35)) * (1 - ease.state(seg(t, tShoo - 0.3, 0.3)));
    const fame = ease.state(seg(t, tFame + 0.2, 0.5)) * (1 - ease.state(seg(t, fameOut, 0.5)));
    const look = -0.26 * h + 0.42 * eat + 0.22 * sh - 0.08 * fame;
    const wag = Math.sin(t * 9) * (0.7 * h * (1 - age) + 0.9 * fame);
    dog(DOG_X, GY, DOG_K, -1, { look, wag, ear: 0.5 * sh - 0.15 * h, age });
  };

  // ——— sayaç (ekran uzayı, üst bant): "ölüyor" ile girer; sayı sağa yaslı, tarih ≥44 px ve 20 px aşağıda; kilitte 1,15x
  const CAP = 74, CAPB = 662;
  const outlined = (s, x, y, size, font, fill, align = 'left') => {
    ctx.font = font; ctx.textAlign = align; ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(8, size * 0.2); ctx.strokeStyle = '#FBF7EE'; ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.textAlign = 'left';
  };
  const counter = t => {
    const inU = ease.enter(seg(t, tDie - 0.04, 0.35)), outU = ease.exit(seg(t, T.loop0 + REW, 0.22));
    if (inU <= 0 || outU >= 1) return;
    const dy = (1 - inU) * 40 - outU * 60;
    const d = Math.floor(cal.day(t) + 1e-9), locked = t >= H - 0.02 && t < T.loop0 + 0.1;
    const g = 1 + 0.15 * ease.state(seg(t, H - 0.02, 0.3)) * (1 - ease.state(seg(t, T.loop0, REW)));
    // kâğıt plaka (doruk sayısı kartı): sabit boyut, rakam artınca titremez; arkadaki tabela/saat okumayı bozmaz
    ctx.save(); ctx.beginPath(); ctx.rect(0, 282, W, 208); ctx.clip(); ctx.translate(0, dy);
    ctx.fillStyle = '#F4EFE3'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(160, 288, 690, 194, 18); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(505, 410); ctx.scale(g, g); ctx.translate(-505, -410);
    ctx.font = '800 128px Archivo'; ctx.textAlign = 'right'; ctx.fillStyle = locked ? PAL.red : PAL.ink; ctx.fillText(d.toLocaleString('tr-TR'), 598, 410);
    ctx.font = '800 58px Archivo'; ctx.textAlign = 'left'; ctx.fillStyle = PAL.red; ctx.fillText('GÜN', 616, 410);
    ctx.restore();
    ctx.font = '500 46px "IBM Plex Mono"'; ctx.textAlign = 'center'; ctx.fillStyle = '#3A342C'; ctx.fillText(dateStr(d), 505, 462); ctx.textAlign = 'left';
    ctx.restore();
  };
  // "1934'te heykelini dikiyorlar." elle iki dengeli satır (motorun tek kelime kuralı "1934'te"yi yalnız bırakıyordu)
  const manualCap = (t, t0, t1, lines) => {
    if (t < t0 || t >= t1) return;
    const u = ease.enter(seg(t, t0, 0.2)), LH = CAP * 1.17;
    lines.forEach((ln, i) => {
      const y = CAPB - (lines.length - 1 - i) * LH + (1 - u) * 26;
      ctx.save(); ctx.beginPath(); ctx.rect(0, y - CAP * 1.05, W, CAP * 1.4); ctx.clip();
      outlined(ln, 505, y, CAP, `800 ${CAP}px Archivo`, '#1F2421', 'center');
      ctx.restore();
    });
  };

  // ——— kamera: kare 0 köpeğe yakın (kanca), açılır; "ölüyor"da köpeğe 1,4x (900 ms); yavaş yaklaşma; doruğda boşluğa 1,3x (700 ms)
  const F0 = [1.15, 600, 985];
  const cam = [
    [0, ...F0],
    [1.9, 1.0, 540, 960],
    [tDie, 1.12, 515, 1070],
    [tDie + 0.9, 1.35, 590, 1082],
    [T.l03end + 0.2, 1.37, 592, 1082],
    [T.l04end, 1.04, 556, 970],
    [w('l06', 6), 1.07, 570, 980],
    [w('l07', 7), 1.09, 585, 988],
    [w('l07', 7) + 0.7, 1.3, 620, 1090],
    [T.l07end + 0.4, 1.3, 620, 1088],
    [H - 0.75, 1.1, 610, 1000],
    [H - 0.05, 1.2, 640, 1105],
    [T.lastEnd + 0.3, 1.23, 640, 1100],
    [T.loop0, 1.23, 640, 1100],
    [D, ...F0],
  ];
  // altyazı parçaları: l01 başlıkta duruyor (tekrar edilmez); l07'nin ilk cümlesi elle (manualCap)
  const chunks = {
    l01: [],
    l02: [['Hachikō her akşam sahibini bu kapıda karşılıyor.', 0], ['Bir gün Profesör Ueno üniversitede ölüyor.', 7]],
    l03: [['Köpek ne yapıyor?', 0]],
    l04: [['Ertesi akşam yine trenin saatinde geliyor.', 0]],
    l05: [['Kimi ona yemek veriyor, kimi onu kovuyor.', 0]],
    l06: [['1932\'de bir gazete hikâyesini yazıyor', 0], ['ve bütün Japonya onu tanıyor.', 9]],
    l07: [['Açılışta kendisi de orada.', 7]],
    l08: [['Sonunda ne oluyor?', 0]],
    l09: [['Bir gün o da gelmiyor.', 0]],
    l10: [['Bunu seni hep bekleyen birine gönder.', 0]],
  };

  return {
    cam, chunks,
    title: ['Bu köpek', 'kaç gün bekledi?'],
    titleOut: T.l02 - 0.35,
    open: true, capSize: CAP, capBase: CAPB,
    draw(t) {
      const S = seasonAt(t);
      bg(S.sky);
      circ(900, 250, 60, mix(S.sky, '#FFF4D8', 0.6), 0);   // güneş
      // plaza
      rect(-600, GY - 5, 2400, 1300, mix('#C9BCA4', '#E6E6E2', Math.min(1, S.snow * 1.2)), 0);
      for (let i = 0; i < 5; i++) line(-600, GY + 80 + i * i * 34, 1800, GY + 80 + i * i * 34, 3, 'rgba(31,36,33,0.12)');
      stationFront(t);
      line(-600, GY, 1800, GY, LW);
      if (S.snow > 0.05) { ctx.save(); ctx.globalAlpha = Math.min(1, S.snow * 1.3); rect(-600, GY - 14, 2400, 18, '#FFFFFF', 3); ctx.restore(); }
      tree(S);
      signFront();
      for (const pp of people) { const S0 = seasonAt(pp.start); walker(pp, t, Math.max(S0.rain, S0.snow) > 0.3); }
      ueno(t);
      fans(t); vendor(t); shoo(t); newsboy(t);
      statue(t, S);
      bowl(t);
      drawDog(t, S);
      seasonFx(t, 0, S.petal); seasonFx(t, 2, S.leaves); seasonFx(t, 3, S.rain); seasonFx(t, 4, S.snow);
      fameCrowd(t);
      crossers(t);
    },
    overlay(t) {
      counter(t);
      manualCap(t, w('l07', 0) - 0.04, w('l07', 7) - 0.04, ['1934\'te heykelini', 'dikiyorlar.']);
    },
  };
}

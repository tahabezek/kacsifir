// № 044 · Otomobiller Dünya'yı sarar mı (çizgi motoru, süreç dili; tek anlatıcı + Soran'ın tek tepkisi).
// Senaryo: research/SUREC_SENARYOLARI.md. Kural (4 Kasım): sonuç değil süreç. Kızılay'da tek araba bekler, arkasına
// arabalar eklenir; harita açılır, kırmızı kuyruk Ankara'dan İstanbul'a, Avrupa'ya, okyanusa, Amerika'ya, Pasifik'e
// uzanır ve Dünya'yı dolanıp ilk arabanın tamponuna değer (doruk). Sonra ikinci tur %95'te durur; 33 günlük yolculuk.
// TÜİK Aralık 2025: ≈ 17,4 milyon otomobil × 4,5 m = 78.300 km; ekvator 40.075 km = 8,9 milyon araba; kalan 8,5 milyon
// ≈ 0,95 tur → 1,95 tur. 78.300 km / 100 km/sa = 783 sa ≈ 33 gün.

const SX = 1400;
export function hero(T) { return T.w('l03', 16); }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[w('l02', 12) - 0.35, w('l02', 12) - 0.05], [T.l03 - 0.1, T.l03 + 0.35], [w('l05', 13) - 0.35, w('l05', 13) - 0.05], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l02', 6), w('l02', 9), w('l02', 13) + 0.6, w('l02', 16), w('l03', 1), w('l03', 3), w('l03', 5), w('l03', 7), w('l05', 24)],
    thock: [w('l02', 1)],
    scratch: [[w('l02', 5), w('l02', 12) - 0.1, 0.012]],
    riser: [w('l03', 9), hero(T) - 0.05],
    silence: [w('l03', 12), hero(T)],
    impact: hero(T),
    loopEnd: T.loop0,
  };
}

// kaba dünya haritası (boylam, enlem): telefonda kıta biçimi okunsun yeter
const LAND = [
  [[-165, 66], [-125, 70], [-80, 72], [-62, 58], [-55, 48], [-70, 42], [-77, 35], [-81, 25], [-90, 29], [-97, 26], [-105, 20], [-92, 15], [-80, 8], [-108, 22], [-118, 33], [-124, 40], [-125, 50], [-140, 60], [-165, 60]],
  [[-80, 10], [-62, 10], [-50, 0], [-35, -6], [-40, -22], [-53, -34], [-65, -42], [-68, -55], [-75, -50], [-72, -30], [-70, -18], [-80, -5]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [5, 52], [9, 57], [5, 62], [15, 69], [30, 71], [60, 70], [80, 73], [105, 77], [140, 72], [180, 68], [180, 62], [160, 60], [142, 50], [135, 43], [122, 40], [121, 30], [110, 20], [105, 10], [100, 13], [98, 8], [92, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 26], [50, 30], [48, 29], [55, 24], [58, 22], [52, 16], [43, 13], [35, 28], [36, 36], [30, 36], [26, 40], [23, 37], [20, 40], [14, 45], [12, 38], [8, 44], [3, 42], [-5, 36]],
  [[-17, 21], [-6, 36], [10, 37], [32, 31], [35, 28], [43, 12], [51, 12], [40, -10], [35, -25], [20, -35], [17, -28], [12, -15], [9, 0], [-8, 4], [-17, 14]],
  [[114, -22], [130, -12], [142, -11], [153, -27], [146, -39], [135, -35], [115, -34]],
  [[-5, 50], [1, 51], [-3, 56], [-6, 54]],
  [[130, 31], [140, 35], [142, 41], [136, 37]],
  [[-180, 68], [-165, 66], [-165, 60], [-180, 62]],
];
const TURKIYE = [[26.0, 40.8], [26.4, 41.7], [28.0, 42.0], [29.1, 41.2], [31.2, 41.1], [33.3, 42.0], [35.1, 42.0], [36.6, 41.3], [38.3, 40.95], [40.0, 41.0], [41.5, 41.5], [42.8, 41.6], [43.6, 41.1], [43.4, 40.4], [44.8, 39.7], [44.4, 38.4], [44.2, 37.2], [42.3, 37.1], [40.8, 37.1], [38.8, 36.7], [36.6, 36.7], [36.2, 36.0], [35.6, 36.6], [34.1, 36.2], [32.6, 36.1], [31.2, 36.8], [30.4, 36.2], [29.2, 36.4], [28.0, 36.8], [27.4, 37.4], [26.8, 38.3], [26.4, 39.1], [26.1, 39.8]];
// iç denizler (kara poligonlarının üstüne deniz rengiyle)
const SEAS = [
  [[28, 41.3], [28, 43], [30, 45.5], [33, 45.8], [36, 45.3], [39, 47], [41.5, 42], [38, 41], [35, 42], [31, 41.2]],
  [[47, 45], [52, 46.5], [54, 41], [53, 37], [49, 38], [48, 41]],
  [[27, 40.6], [29, 40.95], [29.9, 40.72], [28.5, 40.35], [27, 40.4]],
];
const ANK = [32.85, 39.93], ESK = [30.52, 39.78], IST = [28.98, 41.01];
// kuyruğun ilk turu: [boylam (açılmış), enlem, zaman anahtarı (kelime)]; -180'de harita sarar
const ROUTE = [
  [...ANK, ['l02', 12]], [...ESK, ['l02', 14]], [...IST, ['l02', 16]], [...IST, ['l03', 0]], [20, 43, ['l03', 1]], [8, 46, ['l03', 2]], [-8, 43, ['l03', 3]],
  [-40, 25, ['l03', 4]], [-80, 9, ['l03', 5]], [-110, 4, ['l03', 7]], [-160, 0, ['l03', 8]], [-180, 0, ['l03', 9]], [-230, -4, ['l03', 10]],
  [-258, 12, ['l03', 11]], [-285, 20, ['l03', 12]], [-305, 30, ['l03', 13]], [-318, 37, ['l03', 14]], [ANK[0] - 360, ANK[1], ['l03', 16]],
];

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, line, text, bg, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const RED = PAL.red, YEL = '#E2B13C', INK = PAL.ink;
  const HERO = hero(T);

  const car = (x, y, s = 1, col = RED, glow = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rect(-60, -40, 120, 30, col, LW, 10); poly([[-34, -40], [-20, -66], [24, -66], [40, -40]], col, LW);
    rect(-14, -60, 30, 18, '#BFD6DC', 4, 4); circ(-34, -8, 14, '#2A2A2E', LW); circ(34, -8, 14, '#2A2A2E', LW);
    circ(56, -30, 5, glow ? '#FFE9A0' : '#F4EFE3', 0);
    ctx.restore();
  };
  const carCol = k => ['#C2412F', '#2E4A6B', '#5E9A4E', '#E2B13C', '#7A4E8A', '#D8722E', '#8C9298', '#F4EFE3'][Math.floor(mulberry32(4400 + k)() * 8)];

  // ——— 0 · Kızılay: tek araba bekler; arkasına arabalar eklenir, gittikçe hızlanarak ———
  const GY0 = 1170, X0 = 680, GAP = 200;
  const snapT = k => (k === 1 ? w('l02', 6) : k === 2 ? w('l02', 9) : w('l02', 10) + 1.05 * (1 - Math.pow(0.86, k - 3)));
  const NCAR = 70;
  const snapped = t => { let n = 0; for (let k = 1; k <= NCAR; k++) if (t >= snapT(k)) n = k; return n; };
  const street = t => {
    bg('#CFE0E4');
    for (let i = -40; i < 3; i++) {   // sola uzayan cadde: sade cepheler
      const x = 120 + i * 360, h = 380 + (mulberry32(900 + i)() * 260 | 0);
      rect(x, GY0 - 60 - h, 300, h, i % 2 ? '#E2D6C0' : '#D6C8AE', LW);
      for (let r = 0; r < Math.floor(h / 90); r++) for (let c = 0; c < 3; c++) rect(x + 30 + c * 90, GY0 - 60 - h + 30 + r * 90, 56, 50, '#9FBFCF', 4);
    }
    rect(700, GY0 - 410, 420, 350, '#E9DDC6', LW);   // Kızılay köşesi: tabelalı blok (başlık kartının altında)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) rect(730 + c * 96, GY0 - 340 + r * 92, 64, 56, '#9FBFCF', 4);
    rect(760, GY0 - 470, 300, 62, RED, LW, 8); text('KIZILAY', 910, GY0 - 424, 46, '#FFFFFF');
    for (let i = 0; i < 4; i++) { const tx = 140 + i * 120; line(tx, GY0 - 60, tx, GY0 - 150, 10, '#6B4A2B'); circ(tx, GY0 - 190, 58, i % 2 ? '#5E9A4E' : '#4C8240', LW); }
    rect(-15000, GY0 - 60, 16400, 800, '#9A9282', 0); line(-15000, GY0 - 60, 1400, GY0 - 60, LW);
    rect(-15000, GY0, 16400, 700, '#B8B0A0', 0);
    for (let i = -80; i < 8; i++) rect(i * 180, GY0 + 90, 100, 14, '#F4EFE3', 0);
    line(X0 + 110, GY0 - 4, X0 + 110, GY0 + 70, 10, '#F4EFE3');   // dur çizgisi
    line(1060, GY0 - 60, 1060, GY0 - 330, 9, INK); rect(1030, GY0 - 450, 60, 130, '#2A2A2E', LW, 10);   // trafik ışığı
    circ(1060, GY0 - 420, 18, RED, 3); circ(1060, GY0 - 382, 18, '#4A4A4A', 3); circ(1060, GY0 - 344, 18, '#4A4A4A', 3);
  };
  const scene0 = t => {
    t = loopT(t);
    street(t);
    const n = snapped(t);
    // boş park yerleri: kesik çizgili hayalet arabalar (kuyruk daha gelmedi)
    ctx.save(); ctx.setLineDash([14, 12]); ctx.globalAlpha = 0.45;
    for (let k = n + 1; k <= n + 4; k++) { const x = X0 - k * GAP; ctx.beginPath(); ctx.roundRect(x - 111, GY0 - 74, 222, 56, 14); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.restore();
    for (let k = n; k >= 1; k--) {
      const u = ease.enter(seg(t, snapT(k), 0.22));
      car(X0 - k * GAP - (1 - u) * 160, GY0, 1.85, carCol(k));
    }
    car(X0, GY0 + Math.sin(t * 30) * 1.2, 1.85, RED, 1);   // ilk araba: rölantide titrer
    // egzoz: ilk arabanın arkasından küçük duman halkaları
    for (let i = 0; i < 3; i++) { const p = (((t * 0.8 + i / 3) % 1) + 1) % 1; ctx.save(); ctx.globalAlpha = 0.5 * (1 - p); circ(X0 - 104 - p * 70, GY0 - 18 - p * 40, 8 + p * 16, '#E8E4DA', 0); ctx.restore(); }
  };

  // ——— 1 · harita: kuyruk büyür; Türkiye yakın planı → bütün Dünya ———
  const K = 6, MX = 540, MY = 1020;
  const X = lon => MX + lon * K, Y = lat => MY - lat * K;
  const tk = r => w(r[2][0], r[2][1]);
  const seglen = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const cum = [0]; for (let i = 1; i < ROUTE.length; i++) cum.push(cum[i - 1] + seglen(ROUTE[i - 1], ROUTE[i]));
  const LEN = cum.at(-1), I_IST = 2, L_TR = cum[I_IST], L_WORLD = LEN - L_TR;
  // ilk turun başı t anında: rota boyunca uzunluk (zaman anahtarları arasında doğrusal; son parça yavaşlar)
  const headLen = t => {
    if (t <= tk(ROUTE[0])) return 0;
    if (t >= T.l03) { const u = seg(t, T.l03 + 0.1, HERO - T.l03 - 0.1), a = 0.8, c = 1 / (a + (1 - a) / 2); const g = u <= a ? c * u : c * a + c * (u - a) - c * (u - a) * (u - a) / (2 * (1 - a)); return L_TR + L_WORLD * Math.min(1, g); }
    for (let i = 1; i <= I_IST; i++) {
      const a = tk(ROUTE[i - 1]), b = tk(ROUTE[i]);
      if (t < b) { let u = clamp01((t - a) / Math.max(1e-6, b - a)); if (i === ROUTE.length - 1) u = 1 - (1 - u) * (1 - u); return lerp(cum[i - 1], cum[i], u); }
    }
    return LEN;
  };
  const pointAt = L => {
    for (let i = 1; i < ROUTE.length; i++) if (L <= cum[i] || i === ROUTE.length - 1) { const u = clamp01((L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1])); return [lerp(ROUTE[i - 1][0], ROUTE[i][0], u), lerp(ROUTE[i - 1][1], ROUTE[i][1], u)]; }
  };
  const wrapLon = lon => (lon < -180 ? lon + 360 : lon);
  // rotayı L uzunluğuna kadar çiz; -180'i geçince haritanın sağından devam eder
  const drawRoute = (L, col, lw, dy = 0) => {
    if (L <= 0) return;
    const pts = []; for (let i = 0; i < ROUTE.length && cum[i] < L; i++) pts.push(ROUTE[i]); pts.push(pointAt(L));
    ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const off of [-360, 0, 360]) {
      ctx.beginPath(); let prev = null;
      for (const p of pts) {
        const wl = wrapLon(p[0]) + off, x = X(wl), y = Y(p[1]) + dy;
        if (prev && prev[0] >= -180 && p[0] < -180) { ctx.lineTo(X(-180 + off), Y(prev[1]) + dy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(180 + off), Y(prev[1]) + dy); }
        if (!prev) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        prev = p;
      }
      ctx.stroke();
    }
  };
  const mapCar = (lon, lat, s, col, glow) => { for (const off of [-360, 0, 360]) car(X(wrapLon(lon) + off), Y(lat) + 30 * s, s, col, glow); };

  // kameranın zoom'u (çizgi kalınlığı ve yazı boyu ekranda sabit kalsın diye): cizgi.js'teki camAt ile aynı formül
  let cam = [];
  const zAt = t => {
    if (t <= cam[0][0]) return cam[0][1];
    for (let i = 0; i + 1 < cam.length; i++) { const a = cam[i], b = cam[i + 1]; if (t > b[0]) continue; const u = ease.state(clamp01((t - a[0]) / Math.max(1e-6, b[0] - a[0]))); return Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), u)); }
    return cam.at(-1)[1];
  };
  // lap 2: aynı rota, sarı, %95'te durur (ANK'tan başlar)
  const lap2 = t => 0.95 * ease.state(seg(t, w('l05', 1), w('l05', 12) - w('l05', 1) + 0.3));
  const LABELS = [['AVRUPA', 12, 54, 10], ['ATLANTİK', -38, 38, -20], ['AMERİKA', -100, 48, -78], ['PASİFİK', -150, 18, -125], ['ASYA', -265, 52, -240]];   // [ad, boylam (açılmış), enlem, baş bu boylamı geçince]
  // dünya turu: kamera yakın (zoom 1) durur, harita kuyruğun başı ekranın ortasında kalacak şekilde kayar;
  // varışta (HERO) kayma söner ve kamera bütün Dünya'ya açılır
  const followK = t => ease.state(seg(t, T.l03 + 0.1, 0.8)) * (1 - ease.state(seg(t, HERO + 0.15, 0.7)));
  const scene1 = t => {
    const z = zAt(t), px = s => s / z;
    bg('#BFD6DC');
    const fk = followK(t);
    if (fk > 0) { const p = pointAt(headLen(t)); ctx.translate(fk * (540 - X(p[0])), fk * (930 - Y(p[1]))); }
    ctx.save(); ctx.setLineDash([px(10), px(10)]); line(X(-200), Y(0), X(200), Y(0), px(2), 'rgba(31,36,33,0.25)'); ctx.restore();
    for (const off of [-360, 0, 360]) for (const L of LAND) poly(L.map(([lo, la]) => [X(lo + off), Y(la)]), '#E6D8B4', px(3));
    for (const Sx of SEAS) poly(Sx.map(([lo, la]) => [X(lo), Y(la)]), '#BFD6DC', px(3));
    poly(TURKIYE.map(([lo, la]) => [X(lo), Y(la)]), '#F2E3B8', px(4));
    // şehirler (yakın planda)
    if (z > 1.5) for (const [nm, c, dx, dy] of [['ANKARA', ANK, 30, -70], ['ESKİŞEHİR', ESK, 0, 62], ['İSTANBUL', IST, -60, -34]]) {
      circ(X(c[0]), Y(c[1]), px(9), INK, 0); text(nm, X(c[0]) + px(dx), Y(c[1]) + px(dy), px(38), INK);
    }
    // ilk tur (kırmızı) ve ikinci tur (sarı, biraz güneyde)
    const L1 = headLen(t);
    drawRoute(L1, RED, px(10));
    const f2 = t >= w('l05', 1) ? lap2(t) : 0;
    if (f2 > 0) drawRoute(f2 * LEN, YEL, px(10), px(14));
    // kıta adları: kuyruk geçerken belirir
    const headLon = L1 > 0 ? pointAt(L1)[0] : 99;
    for (const [nm, lo, la, at] of LABELS) { if (headLon > at) continue; ctx.save(); ctx.globalAlpha = 0.85; for (const xl of new Set([lo, wrapLon(lo)])) text(nm, X(xl), Y(la), px(34), '#4A453C'); ctx.restore(); }
    // ilk araba (Ankara) ve kuyruğun başı
    mapCar(ANK[0], ANK[1], px(0.55), RED, 1);
    if (L1 > 0 && t < HERO) { const p = pointAt(L1); mapCar(p[0], p[1], px(0.45), '#2E4A6B', 0); }
    if (f2 > 0 && f2 < 0.95) { const p = pointAt(f2 * LEN); mapCar(p[0], p[1] - px(14) / K, px(0.45), YEL, 0); }
    // doruk: tampona değdiği an halka
    const hu = seg(t, HERO, 0.8);
    if (hu > 0 && hu < 1) { ctx.save(); ctx.globalAlpha = 1 - hu; ctx.lineWidth = px(8); ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(X(ANK[0]), Y(ANK[1]), px(30 + 160 * ease.enter(hu)), 0, 7); ctx.stroke(); ctx.restore(); }
    // %95'te duran ikinci turun ucu: işaret
    if (f2 >= 0.949) { const p = pointAt(0.95 * LEN); text('%95', X(wrapLon(p[0])), Y(p[1]) + px(60), px(38), '#8A6A10'); }
  };

  // ——— 2 · yolculuk: 100 km/sa ile kuyruğun yanından; günler geçer ———
  const GY2 = 1180, V = 900, T2 = w('l05', 13) - 0.1, TSTOP = w('l05', 24) - 0.1, DS = 0.9;
  const scroll = t => { const a = Math.min(t, TSTOP) - T2; if (t <= TSTOP) return V * a; const u = Math.min(1, (t - TSTOP) / DS); return V * a + V * DS * (u - u * u / 2); };
  const dayU = t => seg(t, w('l05', 14), w('l05', 23) - w('l05', 14));
  const S_END = scroll(TSTOP + DS), PIN = Math.round((S_END - 600) / GAP);   // durunca ekranın ortasına gelen park hâlindeki araba
  const scene2 = t => {
    const du = dayU(t), night = du > 0 && du < 1 ? 0.5 - 0.5 * Math.cos(du * Math.PI * 2 * 4) : 0;
    const sky = [lerp(207, 30, night), lerp(224, 42, night), lerp(228, 58, night)].map(Math.round);
    bg(`rgb(${sky})`);
    if (night > 0.5) for (let i = 0; i < 30; i++) { const r = mulberry32(70 + i); circ(r() * 1080, 300 + r() * 500, 3, '#F4EFE3', 0); }
    const s = scroll(t);
    for (let i = -2; i < 8; i++) { const x = ((i * 300 - s * 0.3) % 2400 + 2400) % 2400 - 600; rect(x, 560, 220, 420, night > 0.5 ? '#3A4250' : '#D6C8AE', LW); }   // uzak binalar (yavaş)
    rect(-600, 980, 2300, 900, '#9A9282', 0); line(-600, 980, 1700, 980, LW);
    rect(-600, GY2 + 20, 2300, 700, '#8A8478', 0);
    for (let i = -2; i < 14; i++) rect(((i * 180 - s) % 2520 + 2520) % 2520 - 600, GY2 + 60, 100, 14, '#F4EFE3', 0);
    // park hâlindeki kuyruk (uzak şerit)
    const k0 = Math.floor((s - 1300) / GAP);
    for (let k = k0; k < k0 + 14; k++) { const x = 540 + k * GAP - s + 600; car(x, 1060, 1.25, carCol(k + 9)); if (k === PIN && t > TSTOP) { const u = ease.enter(seg(t, TSTOP + 0.2, 0.4)); circ(x, 860 - (1 - u) * 40, 40 * u, YEL, LW); text('?', x, 880 - (1 - u) * 40, 60 * u, INK); line(x, 900, x, 960, 5); } }
    // bizim araba (yakın şerit), içinde sen
    const cx = 540;
    car(cx, GY2 + 40 + Math.sin(t * 24) * 1.5, 1.9, '#2E6BB0', night > 0.5 ? 1 : 0);
    circ(cx + 6, GY2 + 40 - 98, 15, '#EEC6A0', 4); circ(cx + 6, GY2 + 40 - 108, 13, '#2E221B', 0);
    if (t < TSTOP) for (let i = 0; i < 5; i++) line(cx - 220 - i * 40, GY2 - 40 + i * 14, cx - 300 - i * 40, GY2 - 40 + i * 14, 5, 'rgba(31,36,33,0.35)');   // hız çizgileri
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 560, 960, 0);
  const C1 = w('l02', 12) - 0.1;
  const ank = [X(ANK[0]), Y(ANK[1])], mid = [X(31.2), Y(40.3)];
  cam = [
    [0, ...F0],
    [T.l01end, ...P(1.06, 600, 960, 0)],
    [w('l02', 4) + 0.3, ...P(1.3, 640, 1010, 0)],
    [w('l02', 5), ...P(1.25, 600, 1010, 0)],
    [w('l02', 10), ...P(0.85, 300, 990, 0)],
    [C1 - 0.02, ...P(0.38, -900, 900, 0)],
    ...cut(C1, P(0.38, -900, 900, 0), P(11, ank[0] - 10, ank[1] + 4, 1)),
    [w('l02', 16), ...P(10, mid[0], mid[1] + 4, 1)],
    [T.l02end + 0.2, ...P(9.2, mid[0], mid[1] + 6, 1)],
    [T.l03 + 0.9, ...P(1.0, 540, 930, 1)],
    [HERO, ...P(1.05, 540, 930, 1)],
    [HERO + 0.85, ...P(0.52, 540, 930, 1)],
    [T.l04end, ...P(0.5, 540, 930, 1)],
    ...cut(w('l05', 13) - 0.1, P(0.5, 540, 930, 1), P(1.0, 540, 1000, 2)),
    [w('l05', 24) - 0.1, ...P(1.04, 540, 1000, 2)],
    [w('l05', 24) + 1.2, ...P(1.35, 540, 980, 2)],
    [T.loop0 - 0.001, ...P(1.35, 540, 980, 2)],
    [T.loop0, ...P(1.06, 600, 960, 0)],
    [T.D, ...F0],
  ];
  const sceneAt = t => (t < C1 || t >= T.loop0 ? 0 : t < w('l05', 13) - 0.1 ? 1 : 2);

  // sayılar
  const fmt = n => Math.round(n).toLocaleString('tr-TR');
  const countAt = t => {
    if (t < C1) return 1 + snapped(t);
    const L = headLen(t), trU = Math.min(1, L / L_TR);
    return Math.max(1 + NCAR, Math.round(100000 * trU));
  };
  const kmAt = t => { const L = headLen(t); return 450 + (40075 - 450) * clamp01((L - L_TR) / L_WORLD); };
  const lapStr = t => (1 + lap2(t)).toFixed(2).replace('.', ',');
  const dayStr = t => Math.round(33 * dayU(t)) + ' gün';

  return {
    cam,
    title: ['Bütün otomobiller', 'arka arkaya dizilse?'],
    kicker: 'KAÇ SIFIR? · YOL',
    draw(t) {
      const i = sceneAt(t);
      ctx.save(); ctx.translate(i * SX, 0); [scene0, scene1, scene2][i](t); ctx.restore();
    },
    // "yüzde biri bile bitmedi": 17,4 milyonluk çubuk, yalnızca %0,6'sı dolu
    overlay(t) {
      const u = ease.enter(seg(t, w('l02', 17) - 0.1, 0.35)), out = ease.exit(seg(t, T.l03 - 0.1, 0.25));
      if (u <= 0 || out >= 1) return;
      // kutu 1068–1192: üstte ESKİŞEHİR etiketi (≤1040), altta iki satırlık altyazı (≥1215) ile çakışmaz
      const y = 1150 + (1 - u) * 40, x0 = 150, wd = 780;
      ctx.save(); ctx.globalAlpha = 1 - out;
      ctx.fillStyle = '#F4EFE3'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x0 - 30, y - 82, wd + 60, 124, 18); ctx.fill(); ctx.stroke();
      ctx.font = '800 34px Archivo'; ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.fillText('17,4 milyon otomobil', x0, y - 38);
      ctx.beginPath(); ctx.roundRect(x0, y - 16, wd, 34, 10); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = RED; ctx.fillRect(x0 + 3, y - 13, Math.max(5, wd * 0.006 * ease.enter(seg(t, w('l02', 22), 0.5))), 28);
      ctx.textAlign = 'right'; ctx.fillStyle = RED; ctx.fillText('%0,6', x0 + wd, y - 38);
      ctx.restore(); ctx.textAlign = 'left';
    },
    names: [],
    numbers: [
      [w('l02', 1) - 0.1, w('l02', 25) + 0.35, t => fmt(countAt(t)), 'OTOMOBİL KUYRUKTA'],
      [T.l03 + 0.15, HERO - 0.3, t => fmt(kmAt(t)), 'KM · KUYRUĞUN BOYU'],
      [HERO - 0.05, T.l04 - 0.35, '40.075', 'KM · DÜNYA\'NIN ÇEVRESİ'],
      [T.l04 - 0.05, w('l05', 8) - 0.4, '8,5', 'MİLYON ARABA SIRADA'],
      [w('l05', 8) - 0.1, w('l05', 13) - 0.32, lapStr, 'TUR · DÜNYA\'NIN ÇEVRESİ'],
      [w('l05', 13) - 0.05, T.l05end + 0.3, dayStr, '100 KM/SA HIZLA'],
    ],
  };
}

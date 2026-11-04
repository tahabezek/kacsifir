// № 040 · Bütün Türkiye nereye sığar? (çizgi motoru, süreç dili). Senaryo: research/SUREC_SENARYOLARI.md.
// Kural (4 Kasım): sonuç değil süreç. Kuşbakışı harita parçası, adı yazılmamış kesik çizgili bir ilçe sınırı;
// il il otobüsler gelir, insanlar durağın çevresinde birikir, kalabalık mahalleyi, semti geçer ve "tam sığıyor"da
// sınıra oturur: sınır kırmızıya döner, KADIKÖY adı ancak o anda belirir; uç bölge boş kalır.
// Son satır: İstanbul ili; 8 milyar insan ilin %38'ini doldurur. Kalabalık, durağa uzaklığa göre sıralı noktalardır:
// görünen nokta sayısı = oran × toplam; böylece boş kalan pay (≈ %15) tam hesapla tutar.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
const N_TR = 85664944, KADIKOY = 25.2, NEED = 21.4;   // km²: ilçe alanı, 4 kişi/m² ile gereken alan
const IL = 5461, WORLD = 2100;                         // km²: İstanbul ili, dünya nüfusunun aynı sıklıkta kapladığı alan
export function hero(T) { return T.w('l04', 7); }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l02', 1), w('l02', 6), w('l02', 7), w('l02', 8), w('l02', 9), w('l03', 15), w('l03', 18)],
    thock: [w('l04', 13)],
    scratch: [[w('l02', 2), w('l02', 17), 0.02], [w('l03', 0), w('l04', 5), 0.03]],
    riser: [w('l04', 0), hero(T) - 0.05],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, bg, path, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const RED = PAL.red, LAND = '#E8E0CC', LAND2 = '#DDD3BC', SEA = '#A9C9D6', ROAD = '#B7AE9C';

  // ——— harita: ilçe sınırı (Kadıköy'e benzer, batısı deniz, güneybatıda Moda burnu) ———
  const DIST = [[300, 560], [520, 520], [760, 540], [860, 640], [880, 820], [840, 1000], [720, 1120], [560, 1160], [470, 1240], [380, 1270], [300, 1230], [320, 1140], [260, 1060], [230, 920], [260, 740]];
  const STOP = [600, 820];
  const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  // kalabalık noktaları: ızgara + tohumlu sapma; durağa uzaklığa (biraz gürültülü) göre sıralı
  const r1 = mulberry32(4041), SP = 9, COLS = ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E', '#7A4E8A', '#D8722E', '#3B3F45', '#F4EFE3'];
  const PTS = [];
  for (let y = 500; y < 1290; y += SP) for (let x = 220; x < 900; x += SP) {
    const px = x + (r1() - 0.5) * 3, py = y + (r1() - 0.5) * 3;
    if (!inPoly(DIST, px, py)) continue;
    const d = Math.hypot(px - STOP[0], py - STOP[1]) + (r1() - 0.5) * 26;
    PTS.push({ x: px, y: py, d, c: COLS[Math.floor(r1() * COLS.length)], sk: ['#F2C9A5', '#D9A27A', '#B8805A', '#8A5A3A'][Math.floor(r1() * 4)] });
  }
  PTS.sort((a, b) => a.d - b.d);
  const FULL = Math.round(PTS.length * NEED / KADIKOY);   // %85: 21,4 / 25,2

  // birikme: ilk otobüsten "tam"a kadar; erken yavaş, sonra hızlanır (kalabalık büyüdükçe büyüyor)
  const G0 = w('l02', 2);
  const growU = t => (t <= G0 ? 0 : t >= hero(T) ? 1 : Math.pow((t - G0) / (hero(T) - G0), 1.5));
  const shown = t => Math.round(FULL * growU(t));
  const radAt = t => { const n = shown(t); return n ? PTS[Math.min(n, PTS.length) - 1].d : 0; };

  // mahalle ve semt sınırları: o kelimede kalabalığın vardığı yarıçapta, düzensiz kesik çizgi
  const blob = (r, seed) => { const rr = mulberry32(seed); return Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2, k = r * (0.92 + rr() * 0.16); return [STOP[0] + Math.cos(a) * k, STOP[1] + Math.sin(a) * k]; }); };
  const MAH = blob(radAt(w('l03', 15) + 0.15), 11), SEMT = blob(radAt(w('l03', 18) + 0.15), 12);
  const dashed = (P, col, lw, dash = [16, 12], close = true) => { ctx.save(); ctx.setLineDash(dash); path(P, close); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); };

  // otobüs (kuşbakışı): yol boyunca u ∈ [0,1]; 0,5'te durak
  const ROUTE = [[980, 1420], [900, 1180], [STOP[0], STOP[1] + 30], [880, 470], [1250, 330]];
  const along = u => { const n = ROUTE.length - 1, f = clamp01(u) * n, i = Math.min(n - 1, Math.floor(f)), v = f - i; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], v), lerp(ROUTE[i][1], ROUTE[i + 1][1], v), Math.atan2(ROUTE[i + 1][1] - ROUTE[i][1], ROUTE[i + 1][0] - ROUTE[i][0])]; };
  const bus = (x, y, a, col, k = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(k, k);
    rect(-60, -24, 120, 48, col, 5, 10); rect(40, -18, 16, 36, '#BFD6DC', 3, 4);
    for (let i = 0; i < 4; i++) rect(-48 + i * 22, -18, 16, 36, '#F4EFE3', 2, 3);
    ctx.restore();
  };
  // adlı otobüsler: kelimesinde durağa varır (Edirne yavaş gelir: kare 0'da yolda görünür)
  const NAMED = [['EDİRNE', w('l02', 1) + 0.25, 7.0, '#C2412F'], ['İZMİR', w('l02', 6) + 0.2, 1.3, '#2E4A6B'], ['ANKARA', w('l02', 7) + 0.2, 1.3, '#5E9A4E'], ['TRABZON', w('l02', 8) + 0.2, 1.3, '#7A4E8A'], ['VAN', w('l02', 9) + 0.2, 1.3, '#D8722E']];
  const BUSES = NAMED.map(([name, ta, dur, col]) => ({ name, ta, dur, col }));
  for (let t = w('l02', 9) + 0.8; t < hero(T) - 0.6; t += 0.55) BUSES.push({ ta: t, dur: 1.0, col: COLS[Math.floor(t * 7) % 6] });
  const busU = (b, t) => { if (t < b.ta) return 0.5 * ease.state(seg(t, b.ta - b.dur, b.dur)); if (t < b.ta + 0.5) return 0.5; return 0.5 + 0.5 * ease.enter(seg(t, b.ta + 0.5, 1.2)); };

  const people = (t, n, zoom) => {
    const big = zoom > 2.2;
    for (let i = 0; i < n; i++) {
      const p = PTS[i];
      if (big) { ell(p.x, p.y + 1.5, 3.9, 2.6, p.c, 0); circ(p.x, p.y - 0.5, 2.2, p.sk, 0); }
      else { ctx.fillStyle = p.c; ctx.fillRect(p.x - 3.4, p.y - 3.4, 6.8, 6.8); }
    }
  };
  // çevre: deniz (batı ve güney), komşu ilçe sınırları (adsız), sokaklar
  const r2 = mulberry32(4042), STREETS = Array.from({ length: 16 }, () => { const x = 240 + r2() * 640, y = 520 + r2() * 720, a = r2() * Math.PI, l = 80 + r2() * 160; return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l]; });
  const mapBase = () => {
    bg(LAND);
    poly([[-900, 300], [240, 470], [300, 560], [260, 740], [230, 920], [260, 1060], [320, 1140], [300, 1230], [380, 1270], [470, 1240], [560, 1160], [700, 1300], [600, 1700], [-900, 1900]], SEA, 0);
    ctx.save(); ctx.globalAlpha = 0.5;
    for (const [a, b, c, d] of [[300, 560, 120, 300], [760, 540, 820, 250], [880, 820, 1180, 760], [840, 1000, 1150, 1180], [720, 1120, 860, 1500]]) line(a, b, c, d, 4, '#B9AE94');
    ctx.restore();
    ctx.save(); ctx.beginPath(); path(DIST); ctx.clip(); ctx.fillStyle = LAND2; ctx.fillRect(200, 480, 720, 820); for (const s of STREETS) line(s[0], s[1], s[2], s[3], 5, '#CFC4AA'); ctx.restore();
    // yol (durağa gelen) ve durak
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; path(ROUTE, false); ctx.lineWidth = 46; ctx.strokeStyle = ROAD; ctx.stroke(); ctx.lineWidth = 4; ctx.setLineDash([22, 18]); ctx.strokeStyle = '#F4EFE3'; ctx.stroke(); ctx.restore();
  };

  const scenes = [];
  // 0 · kuşbakışı harita: otobüsler gelir, kalabalık birikir, sınıra oturur
  scenes[0] = (t, zoom) => {
    t = loopT(t);
    mapBase();
    const H = hero(T), done = t >= H;
    // adsız ilçe sınırı: varışa kadar soluk kesik çizgi; varışta kırmızı ve kalın
    if (!done) dashed(DIST, 'rgba(31,36,33,0.55)', 5);
    // mahalle / semt sınırları: kelimesinde kırmızı yanar, sonra soluk kalır
    for (const [P, k] of [[MAH, w('l03', 15)], [SEMT, w('l03', 18)]]) {
      if (t < k - 0.1 || done) continue;
      const f = 1 - seg(t, k + 0.5, 0.8);
      dashed(P, f > 0.05 ? RED : 'rgba(31,36,33,0.35)', f > 0.05 ? 6 : 3, [12, 10]);
    }
    // boş kalan uç: varıştan sonra açık yeşil, "biraz boş yer"de parlar
    if (done) {
      ctx.save(); ctx.beginPath(); path(DIST); ctx.clip();
      const glow = 0.35 + 0.35 * ease.enter(seg(t, w('l04', 13), 0.4)) * (0.8 + 0.2 * Math.sin(t * 6));
      for (let i = FULL; i < PTS.length; i++) { const p = PTS[i]; ctx.fillStyle = `rgba(94,154,78,${glow})`; ctx.fillRect(p.x - 4.5, p.y - 4.5, 9, 9); }
      ctx.restore();
    }
    people(t, shown(t), zoom);
    if (done) {
      const k = ease.enter(seg(t, H, 0.25));
      path(DIST); ctx.lineWidth = 7 + 5 * (1 - k); ctx.strokeStyle = RED; ctx.lineJoin = 'round'; ctx.stroke();
      if (t > H + 0.05) { // ad: kâğıt etiket
        const u = ease.enter(seg(t, H + 0.05, 0.3));
        ctx.save(); ctx.translate(560, 820); ctx.scale(0.6 + 0.4 * u, 0.6 + 0.4 * u); ctx.globalAlpha = u;
        rect(-230, -70, 460, 110, '#F4EFE3', 6, 16); text('KADIKÖY', 0, 16, 84, RED); ctx.restore();
      }
      if (t > w('l04', 13) - 0.1) { const u = ease.enter(seg(t, w('l04', 13) - 0.1, 0.3)); ctx.save(); ctx.globalAlpha = u; rect(250, 1160, 200, 56, '#F4EFE3', 4, 12); text('BOŞ', 350, 1202, 40, '#3E7A32'); ctx.restore(); }
    }
    // otobüsler ve adları
    for (const b of BUSES) {
      const u = busU(b, t); if (u <= 0.001 || u >= 0.999) continue;
      const [x, y, a] = along(u); bus(x, y, a, b.col, b.name ? 1 : 0.8);
      if (b.name && t > b.ta - 0.9 && t < b.ta + 1.4) {
        const v = ease.enter(seg(t, b.ta - 0.9, 0.25)) * (1 - seg(t, b.ta + 1.0, 0.4));
        ctx.save(); ctx.globalAlpha = v; ctx.font = '800 40px Archivo'; const tw = ctx.measureText(b.name).width + 36;
        rect(x - tw / 2, y - 112, tw, 56, '#F4EFE3', 4, 12); text(b.name, x, y - 70, 40, b.col); ctx.restore();
      }
      // inen insanlar: durakta yolcular kalabalığa yürür
      if (t > b.ta && t < b.ta + 0.5) { const v = (t - b.ta) / 0.5; for (let i = 0; i < 6; i++) { ctx.fillStyle = COLS[i]; ctx.fillRect(STOP[0] - 20 + i * 8 - v * (i - 3) * 14, STOP[1] + 20 - v * 30, 6, 6); } }
    }
    // 1 m² kare: "her metrekarede dört kişi" (yakın planda okunur)
    if (t > w('l02', 14) - 0.1 && t < T.l03 + 0.3) {
      const u = ease.enter(seg(t, w('l02', 14) - 0.1, 0.3)), x0 = STOP[0] - 70, y0 = STOP[1] - 40;
      ctx.save(); ctx.globalAlpha = u; ctx.lineWidth = 2.5; ctx.strokeStyle = RED; ctx.strokeRect(x0 - SP * 0.5 - 2, y0 - SP * 0.5 - 2, SP * 2 + 4, SP * 2 + 4);
      ctx.font = '800 9px Archivo'; ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.fillText('1 m²', x0 + SP * 0.5, y0 - SP * 0.5 - 6); ctx.textAlign = 'left'; ctx.restore();
    }
  };

  // ——— 1 · İstanbul ili: Kadıköy kırmızı leke; dünya kalabalığı ilin %38'ini doldurur ———
  const ILP = [[60, 560], [300, 470], [470, 520], [500, 600], [520, 700], [560, 640], [640, 560], [900, 520], [1040, 600], [1040, 760], [900, 860], [720, 880], [600, 900], [560, 980], [520, 900], [430, 900], [240, 940], [80, 860], [40, 720]];
  const BOS = [[500, 600], [520, 700], [540, 760], [560, 640]];   // boğaz
  const KAD = [540, 905];
  const r3 = mulberry32(4043), WP = [];
  for (let y = 460; y < 990; y += 8) for (let x = 30; x < 1060; x += 8) {
    const px = x + (r3() - 0.5) * 3, py = y + (r3() - 0.5) * 3;
    if (!inPoly(ILP, px, py)) continue;
    WP.push({ x: px, y: py, d: Math.hypot(px - 330, py - 720) + (r3() - 0.5) * 40, c: COLS[Math.floor(r3() * 6)] });
  }
  WP.sort((a, b) => a.d - b.d);
  const WFULL = Math.round(WP.length * WORLD / IL);
  scenes[1] = t => {
    bg(SEA);
    poly(ILP, LAND, LW);
    poly([[490, 560], [520, 600], [530, 700], [545, 780], [560, 900], [548, 905], [528, 780], [512, 700], [500, 610], [478, 565]], SEA, 0);
    // dünya kalabalığı: Avrupa yakasında birikir (il sınırı içinde, uzaklığa göre sıralı)
    const n = Math.round(WFULL * ease.state(seg(t, w('l06', 0), w('l06', 9) - w('l06', 0) + 0.2)));
    for (let i = 0; i < n; i++) { const p = WP[i]; ctx.fillStyle = p.c; ctx.fillRect(p.x - 3, p.y - 3, 6, 6); }
    text('İSTANBUL', 760, 700, 56, '#7A6E58');
    // Kadıköy: kırmızı küçük leke (ilçe alanı il alanının %0,46'sı)
    const kr = Math.sqrt((540 * 420 * 0.62) * KADIKOY / IL / Math.PI);
    circ(KAD[0] + 18, KAD[1] - 14, kr, RED, 3);
    if (t < w('l06', 3) + 0.4) { const u = 1 - seg(t, w('l06', 3), 0.4); ctx.save(); ctx.globalAlpha = u; text('KADIKÖY', KAD[0] + 120, KAD[1] - 30, 30, RED); ctx.restore(); }
    // 'sen' kalabalığın içinde (son soru): küçük kırmızı halka
    if (t > w('l06', 10) - 0.1) { const p = WP[Math.floor(WFULL * 0.45)], u = ease.enter(seg(t, w('l06', 10) - 0.1, 0.3)); ctx.save(); ctx.globalAlpha = u; ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(p.x, p.y, 22 + 5 * Math.sin(t * 5), 0, 7); ctx.lineWidth = 7; ctx.stroke(); ctx.restore(); rect(p.x - 70, p.y - 100, 140, 60, '#F4EFE3', 4, 14); text('SEN?', p.x, p.y - 56, 42, RED); }
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 560, 900, 0);
  const H = hero(T);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.06, 590, 880, 0)],
    [w('l02', 2), ...P(1.3, 620, 860, 0)],
    [w('l02', 9) + 0.6, ...P(1.2, 620, 860, 0)],
    [w('l02', 12), ...P(4.2, STOP[0] - 50, STOP[1] - 30, 0)],     // omuz omuza: yakın plan
    [w('l02', 17) + 0.4, ...P(4.6, STOP[0] - 60, STOP[1] - 30, 0)],
    [w('l03', 3), ...P(1.5, 600, 850, 0)],
    [w('l03', 13), ...P(1.25, 590, 870, 0)],
    [w('l04', 4), ...P(1.0, 560, 880, 0)],
    [H, ...P(0.94, 560, 870, 0)],
    [w('l04', 12), ...P(0.94, 560, 870, 0)],                      // durgunluk: varış
    [T.l05 - 0.1, ...P(1.0, 520, 940, 0)],
    [T.l05end + 0.1, ...P(1.08, 540, 900, 0)],
    ...cut(T.l06 - 0.1, P(1.08, 540, 900, 0), P(4.0, SX * 0 + KAD[0] + 18, KAD[1] - 14, 1)),
    [w('l06', 3), ...P(1.5, 560, 760, 1)],
    [w('l06', 9) + 0.3, ...P(1.0, 540, 740, 1)],
    [T.loop0 - 0.001, ...P(1.04, 540, 730, 1)],
    [T.loop0, ...P(1.03, 565, 895, 0)],
    [T.D, ...F0],
  ];
  const zoomAt = t => { let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i; const a = cam[k], b = cam[Math.min(k + 1, cam.length - 1)]; return b[0] > a[0] ? Math.max(a[1], b[1]) : a[1]; };

  return {
    cam,
    title: ['Bütün Türkiye', 'nereye sığar?'],
    kicker: 'KAÇ SIFIR? · NÜFUS',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); (i === 1 ? scenes[1] : scenes[0])(t, zoomAt(t)); ctx.restore();
    },
    names: [],
    overlay(t, c, O) {
      O.bigNumber(t, Math.max(T.l01end + 0.3, G0), H - 0.05, tt => Math.round(N_TR * growU(tt)), 'KİŞİ · TÜRKİYE', 470, 118);
      O.bigNumber(t, H, w('l04', 13) - 0.4, '85.664.944', 'KİŞİ · 21,4 km²', 470, 118);
    },
    numbers: [
      [w('l04', 13) - 0.05, T.l05end + 0.1, '3,8 km²', 'BOŞ KALDI'],
      [w('l06', 3) - 0.1, w('l06', 10) - 0.2, '8 milyar', 'İSTANBUL İLİNİN %38\'İ'],
    ],
  };
}

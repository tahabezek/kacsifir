// № 040 · Türkiye Kadıköy'e sığar mı (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: kalabalıkla dolmuş Kadıköy haritası ve köşede boş kalan parça. TÜİK 2024: 85,66 milyon; Kadıköy 25,2 km²;
// metrekareye 4 kişi → 21,4 km², 3,8 km² boş. Dünya 8,3 milyar → yaklaşık 2.100 km²; İstanbul ili 5.461 km².

const SX = 1400;
export function hero(T) { return T.w('l03', 34) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 4) - 0.3, w('l03', 4)], [w('l03', 11) - 0.3, w('l03', 11)], [w('l03', 19) - 0.3, w('l03', 19)], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 8), w('l03', 12)],
    rumble: [[w('l03', 11), 0.25]],
    scratch: [[w('l03', 19), hero(T), 0.02]],
    riser: [w('l03', 19) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk40', name: 'Çocuk', seed: 401,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#5E9A4E', shade: '#4C8240' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#5E9A4E', shade: '#4C8240', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#B07A3A',
  features: ['hoodie', 'hairMessy'],
});
const AMCA = base({
  key: 'amca40', name: 'Amca', seed: 402,
  head: { w: 0.9, h: 1.04, ear: 0.12 }, neck: 0.08,
  torso: { len: 0.92, shoulder: 0.74, hip: 0.64, depth: 0.5, belly: 0.12, color: '#6A4C38', shade: '#523A2B' },
  arm: { upper: 0.44, lower: 0.42, w: 0.19, color: '#6A4C38', shade: '#523A2B', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#4A4A50', shade: '#38383E' },
  shoe: { color: '#1A1A1A', len: 0.32, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#9A9590',
  features: ['jacket', 'baldSides', 'mustacheThick'],
});
const TEYZE = base({
  key: 'teyze40', name: 'Teyze', seed: 403,
  torso: { len: 0.82, shoulder: 0.66, hip: 0.78, depth: 0.5, belly: 0.08, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.38, lower: 0.36, w: 0.19, color: '#2E4A6B', shade: '#233A55', hand: 0.13 },
  leg: { upper: 0.34, lower: 0.32, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#3A2420', len: 0.27, h: 0.11 },
  skin: '#EBC29E', skinShade: '#D2A580', hair: '#5A3A2A',
  features: ['cardigan', 'skirt', 'bun'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const SEA = '#7FB4CC', LAND = '#E9DFC9';

  // Kadıköy (şematik): merkez (cx, cy), ölçek k
  const KAD = [[-260, -300], [-60, -340], [120, -300], [250, -200], [300, -40], [260, 140], [170, 300], [0, 330], [-140, 260], [-230, 120], [-300, -60]];
  const kadPath = (cx, cy, k) => { ctx.beginPath(); KAD.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * k, cy + y * k) : ctx.moveTo(cx + x * k, cy + y * k))); ctx.closePath(); };
  // fill: 0..1 doluluk (soldan sağa süpürülür, en çok 21,4/25,2)
  const kadikoy = (cx, cy, k, fill, t, showEmpty = false) => {
    kadPath(cx, cy, k); ctx.fillStyle = '#CFE3B8'; ctx.fill();
    if (fill > 0) {
      ctx.save(); kadPath(cx, cy, k); ctx.clip();
      const x0 = cx - 300 * k, x1 = cx + 300 * k, xf = lerp(x0, x1, fill * 0.85), r = mulberry32(40), cols = ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E', '#7A4E8A', '#D8722E'];
      for (let y = cy - 340 * k; y < cy + 340 * k; y += 16 * k) for (let x = x0; x < xf; x += 16 * k) { const c = cols[Math.floor(r() * cols.length)]; circ(x + (r() - 0.5) * 4 * k, y + (r() - 0.5) * 4 * k + Math.sin(t * 6 + x * 0.05) * k, 6.5 * k, c, 0); }
      ctx.restore();
      if (showEmpty) { ctx.save(); kadPath(cx, cy, k); ctx.clip(); ctx.strokeStyle = 'rgba(31,36,33,0.45)'; ctx.lineWidth = 4; for (let x = xf - 400; x < x1 + 400; x += 26) { ctx.beginPath(); ctx.moveTo(Math.max(xf, x), cy - 400 * k); ctx.lineTo(Math.max(xf, x) + 200 * k, cy + 400 * k); ctx.stroke(); } ctx.restore(); }
    }
    kadPath(cx, cy, k); ctx.lineWidth = LW; ctx.strokeStyle = A.INK; ctx.stroke();
  };
  // Türkiye (şematik dış hat, boylam/enlem → px)
  const TR = [[26.0, 40.6], [26.6, 41.7], [28.0, 42.0], [29.0, 41.25], [31.3, 41.1], [33.5, 42.0], [35.2, 42.0], [36.6, 41.3], [38.4, 40.9], [41.5, 41.5], [42.8, 41.5], [43.5, 41.1], [44.8, 39.7], [44.4, 38.4], [44.3, 37.1], [42.4, 37.1], [40.5, 37.0], [38.3, 36.8], [36.6, 36.8], [36.2, 36.0], [35.8, 36.6], [34.6, 36.8], [33.0, 36.1], [31.0, 36.8], [30.4, 36.2], [28.5, 36.6], [27.3, 37.2], [26.3, 38.3], [26.7, 39.4], [26.1, 40.1]];
  const pj = ([lon, lat]) => [40 + (lon - 25.8) * 52.1, 1180 - (lat - 35.8) * 67];
  const turkey = () => { poly(TR.map(pj), '#EAD9B2', LW); };
  const CITIES = [[26.56, 41.68], [43.74, 37.58], [32.85, 39.93], [27.14, 38.42], [39.72, 40.99], [30.7, 36.9], [37.38, 37.07], [41.27, 39.9], [35.48, 38.73], [40.23, 37.91], [33.0, 41.4], [28.0, 39.6], [36.33, 41.29], [38.3, 38.35]];
  const IST = pj([29.03, 40.98]);

  const scenes = [];
  // 0 · kanca: dolu Kadıköy, boş köşe; kenarda çocuk
  scenes[0] = t => {
    t = loopT(t);
    bg(SEA); rect(-900, GY, 2900, 1600, '#C9C2B4', 0); line(-900, GY, 2000, GY, LW);
    kadikoy(470, 1010, 0.98, 1, t, true);
    ch(COCUK, { x: 900, y: GY, s: 115, expr: 'saskin', armL: { sh: 150, el: 10 }, head: { look: [-0.6, -0.4] }, talk: talk(t, T.l02, T.l02end) }, t);
  };
  // 1 · Kadıköy 25 km²; 1 m²'de 4 kişi (yukarıdan)
  scenes[1] = t => {
    bg(SEA);
    const sq = t > w('l03', 4) - 0.2;
    if (!sq) { kadikoy(540, 960, 1.15, 0, t); rect(330, 900, 420, 110, PAL.paper, LW, 14); text('25 km²', 540, 978, 72, A.INK); }
    else {
      rect(-900, -900, 2900, 3600, LAND, 0);
      const k = ease.enter(seg(t, w('l03', 4) - 0.2, 0.5));
      rect(290, 700, 500, 500, '#F4EFE3', LW); text('1 m', 540, 1260, 56, A.INK);
      [[415, 825], [665, 825], [415, 1075], [665, 1075]].forEach(([x, y], i) => { if (k * 4 > i) { circ(x, y, 90, ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E'][i], LW); circ(x, y - 8, 52, ['#3A2A20', '#1E1814', '#6A4A2A', '#141210'][i], LW); } });
      if (t > w('l03', 8) - 0.1) text('4 kişi', 540, 650, 64, PAL.red);
    }
  };
  // 2 · Türkiye haritası: şehirlerden Kadıköy'e akan kalabalık
  scenes[2] = t => {
    bg(SEA); turkey();
    const u = seg(t, w('l03', 11) - 0.2, w('l03', 18) + 0.6 - w('l03', 11));
    CITIES.forEach((c, i) => { const [x, y] = pj(c); circ(x, y, 10, A.INK, 0); for (let j = 0; j < 5; j++) { const v = Math.min(1, Math.max(0, u * 1.4 - j * 0.08)); if (v <= 0 || v >= 1) continue; const px = lerp(x, IST[0], ease.state(v)), py = lerp(y, IST[1], ease.state(v)) - Math.sin(v * Math.PI) * 30; circ(px, py, 7, ['#C2412F', '#2E4A6B', '#E2B13C'][(i + j) % 3], 2); } });
    circ(IST[0], IST[1], 16 + 6 * Math.sin(t * 5), PAL.red, LW);
    const ed = pj(CITIES[0]), hk = pj(CITIES[1]);
    if (t > w('l03', 11) - 0.1) { rect(ed[0] - 20, ed[1] - 120, 200, 64, PAL.paper, 4, 10); text('Edirne', ed[0] + 80, ed[1] - 74, 40, A.INK); }
    if (t > w('l03', 12) - 0.1) { rect(hk[0] - 230, hk[1] + 50, 220, 64, PAL.paper, 4, 10); text('Hakkari', hk[0] - 120, hk[1] + 96, 40, A.INK); }
  };
  // 3 · Kadıköy dolar: 21 km², 4 km² boş
  scenes[3] = t => {
    bg(SEA);
    const f = ease.state(seg(t, w('l03', 19) - 0.2, w('l03', 27) - w('l03', 19) + 0.4));
    kadikoy(540, 960, 1.15, f, t, t > w('l03', 28) - 0.2);
  };
  // 4 · İstanbul ili: dünyanın tamamı yarısına bile sığar
  scenes[4] = t => {
    bg(SEA);
    const IL = [[-470, -120], [-300, -260], [-60, -250], [160, -300], [430, -240], [480, -40], [380, 120], [140, 170], [-120, 140], [-360, 160], [-480, 40]];
    const cx = 540, cy = 1000;
    ctx.beginPath(); IL.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x, cy + y) : ctx.moveTo(cx + x, cy + y))); ctx.closePath(); ctx.fillStyle = '#CFE3B8'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = A.INK; ctx.stroke();
    line(cx - 20, cy - 290, cx + 40, cy + 170, 10, SEA);
    const u = ease.enter(seg(t, w('l05', 0) - 0.1, 1.6));
    ctx.save(); ctx.beginPath(); IL.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x, cy + y) : ctx.moveTo(cx + x, cy + y))); ctx.closePath(); ctx.clip();
    const r = mulberry32(44); for (let y = cy - 320; y < cy + 200; y += 15) for (let x = cx - 500; x < lerp(cx - 500, cx - 500 + 0.385 * 980, u); x += 15) circ(x, y, 6, ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E'][Math.floor(r() * 4)], 0);
    ctx.restore();
    if (u > 0.9) { rect(600, 950, 360, 90, PAL.paper, LW, 12); text('yarısı boş!', 780, 1012, 52, A.INK); }
  };
  // 5 · metrobüs: sıkış tıkış; çocuk araya sıkışmış
  scenes[5] = t => {
    bg('#E9DFC9'); rect(-900, GY, 2900, 1600, '#9A9282', 0); line(-900, GY, 2000, GY, LW);
    rect(-60, 520, 1200, 860, '#C9CED2', LW, 30); rect(-40, 560, 1160, 240, '#BFD6DC', LW, 12); for (let i = 1; i < 4; i++) line(-40 + i * 290, 560, -40 + i * 290, 800, LW);
    const sway = 6 * Math.sin(t * 2.4);
    ch(AMCA, { x: 160 + sway, y: GY - 20, s: 135, expr: 'yorgun', armR: { sh: 170, el: 0 } }, t);
    ch(TEYZE, { x: 850 + sway, y: GY - 20, s: 130, expr: 'yorgun', armL: { sh: 170, el: 0 } }, t);
    ch(COCUK, { x: 510 + sway, y: GY - 20, s: 130, expr: t > T.l07 ? 'mutlu' : 'yorgun', talk: talk(t, T.l06, T.l06end), head: { tilt: 10, look: [0, -0.2] } }, t);
    line(-40, 540, 1120, 540, 8, '#6A6E74');
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 560, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l02end, ...P(1.05, 560, 960, 0)],
    ...cut(T.l03 - 0.15, P(1.05, 560, 960, 0), P(1.0, 540, 960, 1)),
    [w('l03', 10) + 0.2, ...P(1.05, 540, 960, 1)],
    ...cut(w('l03', 11) - 0.15, P(1.05, 540, 960, 1), P(1.0, 540, 1000, 2)),
    [w('l03', 18) + 0.3, ...P(1.05, 540, 1000, 2)],
    ...cut(w('l03', 19) - 0.15, P(1.05, 540, 1000, 2), P(1.0, 540, 960, 3)),
    [hero(T), ...P(1.05, 540, 960, 3)],
    [T.l04end + 0.1, ...P(1.07, 540, 960, 3)],
    ...cut(T.l05 - 0.15, P(1.07, 540, 960, 3), P(1.0, 540, 1000, 4)),
    ...cut(T.l06 - 0.15, P(1.02, 540, 1000, 4), P(1.0, 540, 960, 5)),
    [T.l07end + 0.2, ...P(1.08, 540, 980, 5)],
    [T.loop0 - 0.001, ...P(1.08, 540, 980, 5)],
    [T.loop0, ...P(1.01, 560, 960, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Türkiye\'nin hepsi', 'Kadıköy\'e sığar mı?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 19) - 0.1, w('l03', 28) - 0.3, '21,4 km²', '85,7 MİLYON KİŞİ'], [w('l03', 28) - 0.1, T.l04 - 0.2, '3,8 km²', 'KADIKÖY\'DE BOŞ KALAN'], [w('l05', 0) - 0.1, T.l06 - 0.2, '~2.100 km²', 'BÜTÜN İNSANLIK']],
  };
}

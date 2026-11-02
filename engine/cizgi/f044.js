// № 044 · Otomobiller Dünya'yı sarar mı (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: Dünya'yı neredeyse iki kez saran araba kuyruğu. TÜİK Aralık 2025: 33.612.650 taşıtın %51,7'si otomobil ≈ 17,4 milyon;
// 4,5 m → 78.300 km; ekvator 40.075 km → 1,95 tur; 100 km/sa → 783 saat ≈ 33 gün.

const SX = 1400;
export function hero(T) { return T.w('l03', 31) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 9) - 0.3, w('l03', 9)], [w('l03', 15) - 0.3, w('l03', 15)], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 11), w('l05', 12)],
    thock: [w('l03', 25)],
    scratch: [[w('l03', 15), hero(T), 0.02]],
    riser: [w('l03', 15) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk44', name: 'Çocuk', seed: 441,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#7A4E8A', shade: '#5E3A6C' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#7A4E8A', shade: '#5E3A6C', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#2A1E16',
  features: ['hoodie', 'hairMessy'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const COLS = ['#C2412F', '#2E4A6B', '#5E9A4E', '#E2B13C', '#F4F1EA', '#7A4E8A', '#D8722E'];
  const space = () => { bg('#141B2C'); const r = mulberry32(44); for (let i = 0; i < 140; i++) circ(-300 + r() * 1700, r() * 2000, 2 + r() * 3, '#F4F1EA', 0); };
  const car = (x, y, s = 1, col = '#C2412F', rot = 0, heads = null) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    rect(-60, -40, 120, 30, col, LW, 10); poly([[-34, -40], [-20, -66], [24, -66], [40, -40]], col, LW); rect(-14, -60, 30, 18, '#BFD6DC', 4, 4);
    if (heads) heads.forEach((c, i) => circ(-6 + i * 18, -50, 8, c, 3));
    circ(-34, -8, 14, '#2A2A2E', LW); circ(34, -8, 14, '#2A2A2E', LW); ctx.restore();
  };
  // Dünya + çevresinde kuyruk: laps tur (ilk tur r1, ikinci tur r2)
  const globe = (cx, cy, R, laps, t, spin = 0) => {
    circ(cx, cy, R, '#3F7FC0', LW);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 3, 0, 7); ctx.clip();
    for (const [dx, dy, rx, ry] of [[-0.35, -0.2, 0.35, 0.28], [0.3, 0.25, 0.3, 0.22], [0.1, -0.5, 0.25, 0.14], [-0.2, 0.55, 0.2, 0.12]]) ell(cx + (dx + spin) * R, cy + dy * R, rx * R, ry * R, '#5E9A4E', 3);
    ctx.restore(); circ(cx, cy, R, null, LW);
    const PER = 46, n = Math.floor(laps * PER);
    for (let i = 0; i < n; i++) { const lap = Math.floor(i / PER), a = -Math.PI / 2 + (i % PER) / PER * 2 * Math.PI + t * 0.05, rr = R + 34 + lap * 58; car(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.3, COLS[i % COLS.length], a + Math.PI / 2); }
  };

  const scenes = [];
  // 0 · kanca: Dünya'yı neredeyse iki kez saran kuyruk; çocuk bakıyor
  scenes[0] = t => {
    t = loopT(t);
    space();
    globe(520, 1010, 250, 1.95, t, 0.05 * Math.sin(t * 0.5));
    ch(COCUK, { x: 930, y: 1250, s: 100, expr: 'saskin', armL: { sh: 150, el: 10 }, head: { look: [-0.6, -0.5] }, talk: talk(t, T.l02, T.l02end) }, t);
  };
  // 1 · otopark: arabalar dolar, sayaç 17,4 milyon
  scenes[1] = t => {
    bg('#C9C2B4'); for (let r = 0; r < 9; r++) line(-200, 640 + r * 90, 1300, 640 + r * 90, 3, '#F4F1EA');
    const u = seg(t, T.l03 - 0.2, w('l03', 8) - T.l03 + 0.4), rnd = mulberry32(11);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) { const k = r * 9 + c; if (k / 72 > u) continue; car(60 + c * 120 + (r % 2) * 40, 720 + r * 90, 0.62, COLS[Math.floor(rnd() * COLS.length)]); }
  };
  // 2 · tek otomobil: 4,5 metre; yanında çocuk
  scenes[2] = t => {
    bg('#E9DFC9'); rect(-900, GY, 2900, 1600, '#B8B0A0', 0); line(-900, GY, 2000, GY, LW);
    car(560, GY - 4, 3.0, '#C2412F');
    const k = ease.enter(seg(t, w('l03', 11) - 0.2, 0.5));
    if (k > 0) { line(380, 1060, lerp(380, 740, k), 1060, 6, PAL.red); line(380, 1040, 380, 1080, 6, PAL.red); if (k > 0.95) { line(740, 1040, 740, 1080, 6, PAL.red); rect(440, 930, 240, 90, PAL.paper, LW, 12); text('4,5 m', 560, 993, 60, A.INK); } }
    ch(COCUK, { x: 900, y: GY, s: 120, expr: 'mutlu', armL: { sh: 110, el: 20 }, head: { look: [-0.5, 0] } }, t);
  };
  // 3 · kuyruk Dünya'yı sarar: 0 → 1,95 tur; çevre etiketleri
  const lapsAt = t => 1.95 * ease.state(seg(t, w('l03', 15) - 0.1, w('l03', 25) - w('l03', 15) + 0.4));
  scenes[3] = t => {
    space();
    const L = lapsAt(t);
    globe(540, 1000, 300, L, t * 0.3);
    const ist = [540, 1000 - 300]; circ(ist[0], ist[1], 12, PAL.gold, 3);
    if (t > w('l03', 26) - 0.2) { const k = ease.enter(seg(t, w('l03', 26) - 0.2, 0.4)); ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 8; ctx.setLineDash([20, 14]); ctx.beginPath(); ctx.arc(540, 1000, 300, 0, 7); ctx.stroke(); ctx.restore(); }
    rect(380, 960, 320, 90, PAL.paper, LW, 12); text(`${(L).toFixed(2).replace('.', ',')} tur`, 540, 1022, 56, A.INK);
  };
  // 4 · kuyruğun yanında yolculuk: gün sayacı 1 → 33
  scenes[4] = t => {
    const RY = 900; bg('#BFD6DC'); rect(-900, RY, 2900, 1800, '#8A8478', 0); line(-900, RY, 2000, RY, LW);
    for (let i = 0; i < 12; i++) { const x = ((i * 180 - t * 500) % 2160 + 2160) % 2160 - 540; line(x, RY + 140, x + 90, RY + 140, 8, '#F4F1EA'); }
    const off = (t * 260) % 140; for (let i = -1; i < 10; i++) car(-60 + i * 140 - off, RY + 90, 0.95, COLS[(i + 20 + Math.floor(t * 260 / 140)) % COLS.length]);
    car(540, RY + 250, 1.3, '#F6C445', 0, ['#F2C9A5']);
    const day = Math.max(1, Math.round(33 * ease.state(seg(t, T.l05, T.l05end - T.l05 + 0.2))));
    rect(380, 580, 320, 240, PAL.paper, LW, 14); rect(380, 580, 320, 70, PAL.red, LW, 14); text('GÜN', 540, 630, 44, '#F4F1EA'); text(String(day), 540, 780, 120, A.INK);
  };
  // 5 · bayram trafiği: kilitlenmiş yol, camlarda yüzler
  scenes[5] = t => {
    bg('#BFD6DC'); rect(-900, 900, 2900, 1800, '#8A8478', 0); line(-900, 900, 2000, 900, LW);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) car(-40 + c * 190 + (r % 2) * 90, 1020 + r * 120 + 3 * Math.sin(t * 2 + c), 1.0, COLS[(r * 7 + c) % COLS.length], 0, [['#F2C9A5', '#D9A27A'][c % 2]]);
    ch(COCUK, { x: 860, y: 1500, s: 100, expr: t > T.l07 ? 'mutlu' : 'yorgun', talk: talk(t, T.l06, T.l06end), head: { tilt: 8 * Math.sin(t * 2), look: [-0.4, 0] } }, t);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 560, 1030, 0);
  const cam = [
    [0, ...F0],
    [T.l02end, ...P(1.05, 560, 1030, 0)],
    ...cut(T.l03 - 0.15, P(1.05, 560, 1030, 0), P(1.15, 560, 960, 1)),
    ...cut(w('l03', 9) - 0.15, P(1.15, 560, 960, 1), P(1.3, 640, 1130, 2)),
    ...cut(w('l03', 15) - 0.15, P(1.3, 640, 1130, 2), P(1.0, 540, 1000, 3)),
    [hero(T), ...P(1.0, 540, 1000, 3)],
    [T.l04end + 0.1, ...P(1.05, 540, 1000, 3)],
    ...cut(T.l05 - 0.15, P(1.05, 540, 1000, 3), P(1.0, 540, 1000, 4)),
    ...cut(T.l06 - 0.15, P(1.02, 540, 1000, 4), P(1.0, 540, 1080, 5)),
    [T.l07end + 0.2, ...P(1.06, 560, 1100, 5)],
    [T.loop0 - 0.001, ...P(1.06, 560, 1100, 5)],
    [T.loop0, ...P(1.01, 560, 1030, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Bütün otomobiller', 'Dünya\'yı sarar mı?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 3) - 0.1, w('l03', 9) - 0.2, '17,4 milyon', 'OTOMOBİL · TÜİK 2025'], [w('l03', 22) - 0.1, w('l03', 26) - 0.2, '78.300', 'KM · KUYRUĞUN BOYU'], [w('l03', 26) - 0.05, T.l04 - 0.2, '40.075', 'KM · DÜNYA\'NIN ÇEVRESİ'], [w('l05', 10) - 0.1, T.l06 - 0.2, '33 gün', 'SAATTE 100 KM İLE']],
  };
}

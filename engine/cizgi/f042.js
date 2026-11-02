// № 042 · Ay'a merdivenle (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: Dünya'dan Ay'a uzanan merdiven ve en altta tırmanan çocuk. Ara durak işaretleri: Everest, uzayın sınırı, İSS, Ay.
// Doruk: 72 yıllık tırmanışın yanından 3 günde geçen Apollo roketi. Sahneler 1400 px arayla yan yana.

const SX = 1400;
export function hero(T) { return T.w('l05', 9) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 8) - 0.3, w('l03', 8)], [T.l04 - 0.3, T.l04], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 5), w('l03', 7), w('l03', 'everest'), w('l03', 19), w('l03', 22)],
    thock: [w('l03', 'gerekiyor')],
    scratch: [[w('l05', 'oysa'), hero(T), 0.02]],
    riser: [w('l05', 'oysa') - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'tirmanan', name: 'Tırmanan', seed: 421,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#E8A33D', shade: '#C8852A' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#E8A33D', shade: '#C8852A', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#3B2A20',
  features: ['hoodie', 'hairMessy'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const NIGHT = '#1B2436', SPACE = '#0E1220';

  const stars = (seed, n, x0, y0, wd, ht) => { const r = mulberry32(seed); ctx.fillStyle = '#F4F1EA'; for (let i = 0; i < n; i++) { const s = 2 + r() * 4; ctx.fillRect(x0 + r() * wd, y0 + r() * ht, s, s); } };
  const moon = (x, y, r) => { circ(x, y, r, '#E9E4D6', LW); for (const [dx, dy, k] of [[-0.35, -0.2, 0.18], [0.3, 0.25, 0.14], [0.05, -0.45, 0.1], [-0.2, 0.4, 0.12]]) circ(x + dx * r, y + dy * r, k * r, '#CFC8B6', 4); };
  // eğik merdiven (a → b), basamak aralığı gap
  const ladder = (ax, ay, bx, by, wd = 70, gap = 46, col = '#B9874E') => {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), nx = -dy / L * wd / 2, ny = dx / L * wd / 2;
    for (let s = 0; s < L; s += gap) { const u = s / L; line(ax + dx * u - nx, ay + dy * u - ny, ax + dx * u + nx, ay + dy * u + ny, 6, col); }
    line(ax - nx, ay - ny, bx - nx, by - ny, 9, col); line(ax + nx, ay + ny, bx + nx, by + ny, 9, col);
  };
  // dikey merdiven (x merkez), kaydırma off (px)
  const vLadder = (x, off, wd = 300, gap = 110, y0 = -400, y1 = 2400) => {
    line(x - wd / 2, y0, x - wd / 2, y1, 18, '#7A5634'); line(x + wd / 2, y0, x + wd / 2, y1, 18, '#7A5634');
    line(x - wd / 2, y0, x - wd / 2, y1, 10, '#B9874E'); line(x + wd / 2, y0, x + wd / 2, y1, 10, '#B9874E');
    const st = ((off % gap) + gap) % gap;
    for (let y = y0 + st; y < y1; y += gap) { line(x - wd / 2, y, x + wd / 2, y, 18, '#7A5634'); line(x - wd / 2, y, x + wd / 2, y, 10, '#D9A75A'); }
  };
  const climb = (x, y, s, t, expr = 'notr', rate = 1) => { const p = Math.sin(t * Math.PI * 2 * rate); ch(COCUK, { x, y, s, armL: { sh: 165 + 15 * p, el: 15 }, armR: { sh: 165 - 15 * p, el: 15 }, legL: { hip: 8, knee: 30 + 30 * Math.max(0, p) }, legR: { hip: 8, knee: 30 + 30 * Math.max(0, -p) }, expr }, t); };
  const rocket = (x, y, s = 1, rot = 0) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); poly([[-30, 60], [-30, -60], [0, -120], [30, -60], [30, 60]], '#F4F1EA', LW); poly([[-30, 20], [-60, 70], [-30, 60]], PAL.red, LW); poly([[30, 20], [60, 70], [30, 60]], PAL.red, LW); circ(0, -40, 14, '#8FB4C8', LW); poly([[-18, 60], [0, 120], [18, 60]], '#F2A23A', LW); ctx.restore(); };

  const scenes = [];
  // 0 · kanca: Dünya'dan Ay'a uzanan merdiven; en altta tırmanan çocuk
  scenes[0] = t => {
    t = loopT(t);
    bg(NIGHT); stars(7, 90, -300, -200, 1700, 1500);
    moon(800, 720, 150);
    ell(540, GY + 420, 1200, 520, '#4C8A5A', LW); ell(300, GY + 190, 220, 60, '#5E9A4E', 0);
    ladder(250, GY + 20, 730, 820);
    const u = 0.1 + 0.04 * (0.5 + 0.5 * Math.sin(2 * Math.PI * t / D));
    const cx = lerp(250, 730, u), cy = lerp(GY + 20, 820, u);
    climb(cx, cy + 30, 62, t, 'saskin', 1.2);
  };
  // 1 · yakın: dikey merdiven, basamaklar kayar; 17 cm ve saniyede bir basamak
  scenes[1] = t => {
    bg('#BFD6DC');
    for (let i = 0; i < 5; i++) { circ(-100 + i * 300, 340 + (i % 2) * 70, 50, '#F4F1EA', 0); circ(-40 + i * 300, 330 + (i % 2) * 70, 62, '#F4F1EA', 0); }
    vLadder(540, t * 110);
    climb(540, 1260, 150, t, t > w('l03', 'everest') ? 'mutlu' : 'notr', 1);
    if (t > w('l03', 2) - 0.2) { const y0 = 1500, y1 = y0 + 110; line(780, y0, 780, y1, 6, PAL.red); line(760, y0, 800, y0, 6, PAL.red); line(760, y1, 800, y1, 6, PAL.red); rect(810, y0 - 10, 230, 110, PAL.paper, LW, 14); text('17 cm', 925, y0 + 66, 64, PAL.red); }
    if (t > w('l03', 5) - 0.2) { rect(60, 780, 320, 190, PAL.paper, LW, 16); circ(150, 875, 62, '#F4F1EA', LW); const a = (t % 1) * Math.PI * 2 - Math.PI / 2; line(150, 875, 150 + Math.cos(a) * 46, 875 + Math.sin(a) * 46, 8, PAL.red); text('1/sn', 290, 895, 56, A.INK); }
  };
  // 2 · yükseliş: gökyüzü kararır, işaretler aşağı kayar (Everest, uzayın sınırı, İSS)
  const mark = (t, t0) => lerp(-400, 2300, seg(t, t0 - 1.0, 3.2));
  scenes[2] = t => {
    const k = seg(t, w('l03', 'everest'), w('l03', 21) - w('l03', 'everest'));
    const sky = k < 0.33 ? '#8FB4D0' : k < 0.66 ? '#3A5276' : SPACE;
    bg(sky); if (k > 0.33) stars(11, 120, -300, -200, 1700, 2400);
    const ey = mark(t, w('l03', 'everest'));
    poly([[-300, ey + 700], [140, ey], [300, ey + 160], [520, ey - 80], [900, ey + 700]], '#7A8A9A', LW); poly([[140, ey], [210, ey + 80], [300, ey + 160], [330, ey + 110], [520, ey - 80], [470, ey + 30], [420, ey + 20]], '#F4F1EA', 0);
    line(520, ey - 80, 520, ey - 200, 6); poly([[520, ey - 200], [600, ey - 180], [520, ey - 160]], PAL.red, 4);
    const ky = mark(t, w('l03', 19));
    ctx.save(); ctx.setLineDash([30, 22]); line(-300, ky, 1400, ky, 8, '#8FB4D0'); ctx.restore(); rect(110, ky - 120, 440, 96, PAL.paper, LW, 14); text('UZAYIN SINIRI', 330, ky - 54, 50, A.INK);
    const iy = mark(t, w('l03', 21));
    ctx.save(); ctx.translate(820, iy); ctx.scale(1.6, 1.6); rect(-80, -20, 160, 40, '#C9CED2', LW, 6); for (const sx of [-1, 1]) { rect(sx * 150 - 60, -50, 120, 100, '#2E4A6B', LW, 4); line(sx * 30, 0, sx * 90, 0, 6); } ctx.restore(); text('İSS', 820, iy + 150, 60, '#F4F1EA');
    vLadder(540, t * 160);
    climb(540, 1300, 120, t, k > 0.66 ? 'saskin' : 'mutlu', 1.3);
  };
  // 3 · Ay: 2 milyar basamak; yorgun tırmanıcı; Apollo yanından geçer
  scenes[3] = t => {
    bg(SPACE); stars(13, 140, -300, -200, 1700, 2400);
    moon(540, -40, 420);
    vLadder(380, t * 40, 240, 90, 300, 2400);
    const tired = t > T.l04 - 0.2;
    ch(COCUK, { x: 380, y: 1310, s: 130, armL: { sh: 170, el: 10 }, armR: tired ? { sh: 60, el: 80 } : { sh: 160, el: 20 }, legL: { hip: 6, knee: 40 }, legR: { hip: 6, knee: 10 }, expr: tired ? 'yorgun' : 'saskin', head: { tilt: tired ? 10 : 0, look: [0.5, -0.6] } }, t);
    const ap = seg(t, w('l05', 'apollo') - 0.4, 3.4);
    if (ap > 0 && ap < 1) { const x = lerp(780, 820, ap), y = lerp(1900, -300, ap); ctx.save(); ctx.globalAlpha = 0.6; for (let i = 1; i < 6; i++) line(x, y + 120 + i * 60, x, y + 160 + i * 60, 10, '#F2A23A'); ctx.restore(); rocket(x, y, 1.4); }
  };
  // 4 · asansör şakası ve kapanış: merdivenin yanında asansör kapısı
  scenes[4] = t => {
    bg('#E9DFC9'); rect(-500, GY, 2080, 900, '#CDBFA8', 0); line(-500, GY, 1580, GY, LW);
    rect(560, 620, 360, 740, '#9AA3AA', LW, 6); rect(580, 700, 150, 660, '#C9CED2', LW, 0); rect(750, 700, 150, 660, '#C9CED2', LW, 0); rect(680, 640, 120, 46, '#1F2421', 4, 6); text('AY', 740, 678, 34, '#F6C445');
    circ(950, 1000, 18, '#F6C445', LW);
    vLadder(250, 0, 200, 90, -800, GY);
    const go = seg(t, T.l06, 0.8);
    ch(COCUK, { x: lerp(250, 470, ease.state(go)), y: GY, s: 150, view: go > 0 && go < 1 ? 'side' : 'front', facing: 1, armR: go >= 1 ? { sh: 100, el: 10 } : undefined, expr: go >= 1 ? 'mutlu' : 'yorgun', head: { look: [0.6, 0] } }, t);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 560, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.06, 560, 960, 0)],
    [T.l02end + 0.1, ...P(1.9, 310, 1330, 0)],
    ...cut(T.l03 - 0.15, P(1.9, 310, 1330, 0), P(1.0, 540, 1000, 1)),
    [w('l03', 'everest') - 0.6, ...P(1.05, 540, 1040, 1)],
    ...cut(w('l03', 'everest') - 0.5, P(1.05, 540, 1040, 1), P(1.0, 540, 960, 2)),
    [w('l03', 27) - 0.3, ...P(0.95, 540, 940, 2)],
    ...cut(w('l03', 27) - 0.15, P(0.95, 540, 940, 2), P(0.9, 540, 980, 3)),
    [T.l04end + 0.2, ...P(1.0, 500, 1040, 3)],
    [hero(T), ...P(0.85, 560, 960, 3)],
    ...cut(T.l06 - 0.15, P(0.85, 560, 960, 3), P(1.0, 540, 1000, 4)),
    [T.loop0 - 0.001, ...P(1.06, 560, 1000, 4)],
    [T.loop0, ...P(1.03, 560, 960, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ["Ay'a merdivenle", 'kaç yılda çıkılır?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 8) - 0.1, w('l03', 16) - 0.2, '14,5 saat', 'EVEREST · 8.849 m'], [w('l03', 16) - 0.05, w('l03', 21) - 0.2, '~7 gün', 'UZAYIN SINIRI · 100 km'], [w('l03', 21) - 0.05, w('l03', 27) - 0.2, '~28 gün', 'İSS · 408 km'], [w('l03', 28) - 0.1, T.l04 - 0.2, '2 milyar+', 'BASAMAK · TAM 2,26 MİLYAR'], [w('l05', 'apollo') - 0.1, T.l06 - 0.2, '72 yıl', 'APOLLO 11 İSE 3 GÜN']],
  };
}

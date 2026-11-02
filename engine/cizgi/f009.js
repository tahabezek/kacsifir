// № 009 · Güneş'e kaç Dünya sığar (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: dev Güneş ve yanında nokta kadar Dünya. Doruk: terazide Güneş ↔ bütün gezegenler; %99,86.
// Görseller ekranın y 280–1240 aralığında; zemin 1240 (altyazının üstünde).

const SX = 1400;
export function hero(T) { return T.w('l05', 13) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'ama') - 0.3, w('l03', 'ama')], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'katı'), w('l03', 'uzanıyor'), w('l03', 'geçiyor')],
    thock: [w('l05', 'şey')],
    scratch: [[w('l03', 'ama'), w('l03', 'geçiyor'), 0.02]],
    riser: [w('l05', 'güneş') - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk', name: 'Çocuk', seed: 91,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#7A4E8A', shade: '#5E3A6C' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#7A4E8A', shade: '#5E3A6C', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#1E1814',
  features: ['hoodie', 'hairMessy'],
});
const DEDE = base({
  key: 'dede', name: 'Dede', seed: 92,
  head: { w: 0.9, h: 1.04, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.86, shoulder: 0.7, hip: 0.6, depth: 0.46, belly: 0.1, color: '#7A6A4A', shade: '#5E5038' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#7A6A4A', shade: '#5E5038', hand: 0.12 },
  leg: { upper: 0.4, lower: 0.38, w: 0.19, color: '#4A4A50', shade: '#36363C' },
  shoe: { color: '#3A2A20', len: 0.3, h: 0.11 },
  skin: '#E2B48E', skinShade: '#C9986F', hair: '#C9C4BC',
  eyes: { gap: 0.32, w: 0.17, h: 0.2, y: 0.04, lid: 0.25 },
  features: ['cardigan', 'baldSides', 'mustacheThick', 'glassesRect'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1240;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const SPACE = '#1E2A3A';
  const stars = seed => { const r = mulberry32(seed); for (let i = 0; i < 70; i++) circ(-300 + r() * 1700, 150 + r() * 1150, 2 + r() * 3, '#F4EFE3', 0); };
  const sun = (x, y, r, t) => {
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + t * 0.15; line(x + Math.cos(a) * r * 1.04, y + Math.sin(a) * r * 1.04, x + Math.cos(a) * r * (1.12 + 0.03 * Math.sin(t * 3 + i)), y + Math.sin(a) * r * (1.12 + 0.03 * Math.sin(t * 3 + i)), Math.max(4, r * 0.03), '#F2A23A'); }
    circ(x, y, r, '#F6C445', LW + 2);
    const r2 = mulberry32(9); ctx.save(); ctx.globalAlpha = 0.35; for (let i = 0; i < 9; i++) { const a = r2() * 6.28, d = r2() * r * 0.75; circ(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.05 + r2() * 0.06), '#E8862A', 0); } ctx.restore();
  };
  const earth = (x, y, r) => { circ(x, y, r, '#3F7FB5', Math.max(1.5, r * 0.1)); if (r > 6) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ell(x - r * 0.3, y - r * 0.2, r * 0.4, r * 0.3, '#5E9A4E', 0); ell(x + r * 0.35, y + r * 0.3, r * 0.3, r * 0.35, '#5E9A4E', 0); ctx.restore(); circ(x, y, r, null, Math.max(1.5, r * 0.1)); } };
  const ground = () => { rect(-900, GY, 2900, 900, '#3A4458', 0); line(-900, GY, 2000, GY, LW); };

  const scenes = [];
  // 0 · kanca: dev Güneş, yanında nokta kadar Dünya; çocuk ve dede
  scenes[0] = t => {
    t = loopT(t);
    bg(SPACE); stars(5); ground();
    sun(470, 900, 300, (2 * Math.PI * t) / D * 3);
    earth(890, 900, 9 + 1.5 * Math.sin((2 * Math.PI * t) / D * 4));
    line(890, 880, 920, 760, 4, '#F4EFE3'); rect(860, 700, 160, 56, '#F4EFE3', 4, 10); text('DÜNYA', 940, 740, 32, '#1F2421');
    ch(COCUK, { x: 160, y: GY, s: 86, expr: 'saskin', head: { look: [0.6, -0.5] } }, t);
    ch(DEDE, { x: 940, y: GY, s: 92, expr: 'mutlu', armL: { sh: 150, el: 20 }, head: { look: [-0.6, -0.4] } }, t);
  };
  // 1 · çap boyunca 109 Dünya
  scenes[1] = t => {
    bg(SPACE); stars(7);
    sun(540, 820, 440, t);
    const n = Math.min(109, Math.floor(109 * ease.state(seg(t, T.l03 + 0.2, w('l03', 'uzanıyor') - T.l03))));
    for (let i = 0; i < n; i++) earth(540 - 440 + 4 + i * (880 / 109), 820, 3.9);
    if (n >= 109) { line(100, 1300, 980, 1300, 6, '#F4EFE3'); line(100, 1280, 100, 1320, 6, '#F4EFE3'); line(980, 1280, 980, 1320, 6, '#F4EFE3'); }
  };
  // 2 · hacimde bir milyonu aşar: Güneş Dünyalarla dolar
  const pts = []; { const r = mulberry32(13); while (pts.length < 2600) { const x = (r() - 0.5) * 2, y = (r() - 0.5) * 2; if (x * x + y * y < 0.97) pts.push([x, y]); } }
  scenes[2] = t => {
    bg(SPACE); stars(11);
    circ(540, 820, 440, '#3A3020', LW + 2);
    const k = ease.state(seg(t, w('l03', 'ama'), w('l03', 'geçiyor') + 0.3 - w('l03', 'ama')));
    const n = Math.floor(pts.length * k);
    for (let i = 0; i < n; i++) { const [x, y] = pts[i]; circ(540 + x * 440, 820 + y * 440, 5, '#3F7FB5', 0); }
    circ(540, 820, 440, null, LW + 2);
  };
  // 3 · terazi: Güneş ↔ bütün gezegenler; Güneş tarafı yere iner (doruk)
  scenes[3] = t => {
    bg(SPACE); stars(17); ground();
    const k = ease.enter(seg(t, w('l05', 'güneş') - 0.3, 1.0)), a = -0.32 * k + 0.01 * Math.sin(t * 3);
    const cx = 540, top = 700, L = 300;
    rect(cx - 20, top, 40, GY - top, '#6A5A48', LW); poly([[cx - 90, GY], [cx + 90, GY], [cx + 50, GY - 50], [cx - 50, GY - 50]], '#6A5A48', LW);
    ctx.save(); ctx.translate(cx, top); ctx.rotate(a); rect(-L, -12, 2 * L, 24, '#8A7A5A', LW, 8); ctx.restore();
    const lx = cx - L * Math.cos(a), ly = top - L * Math.sin(a), rx = cx + L * Math.cos(a), ry = top + L * Math.sin(a);
    line(lx, ly, lx, ly + 200, 5); line(rx, ry, rx, ry + 200, 5);
    rect(lx - 130, ly + 200, 260, 22, '#8A7A5A', LW, 6); rect(rx - 130, ry + 200, 260, 22, '#8A7A5A', LW, 6);
    sun(lx, ly + 200 - 110, 105, t);
    const pl = [['#D9A06A', 22], ['#E8C9A0', 18], ['#8FC8E8', 12], ['#3F7FB5', 12], ['#3F7FB5', 6], ['#E8D9B8', 5], ['#C2412F', 4], ['#9A9590', 3]];
    let x = rx - 100; for (const [c, r] of pl) { circ(x + r, ry + 200 - r - 2, r, c, 3); x += r * 2 + 6; }
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.08, 560, 940, 0)],
    [T.l02end, ...P(2.2, 860, 880, 0)],
    ...cut(T.l03 - 0.15, P(2.2, 860, 880, 0), P(1.0, 540, 900, 1)),
    [w('l03', 'yan') - 0.1, ...P(1.0, 540, 900, 1)],
    [w('l03', 'dizsen'), ...P(5.0, 140, 820, 1)],
    [w('l03', 'uzanıyor') + 0.2, ...P(1.04, 540, 900, 1)],
    ...cut(w('l03', 'ama') - 0.15, P(1.04, 540, 900, 1), P(1.0, 540, 900, 2)),
    [w('l03', 'geçiyor') + 0.3, ...P(1.05, 540, 900, 2)],
    ...cut(T.l05 - 0.15, P(1.05, 540, 900, 2), P(1.0, 540, 940, 3)),
    [hero(T), ...P(1.06, 540, 940, 3)],
    ...cut(T.l06 - 0.15, P(1.06, 540, 940, 3), P(1.04, 540, 960, 0)),
    [T.loop0, ...P(1.02, 540, 960, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ["Güneş'e kaç", 'Dünya sığar?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 'çapı') - 0.1, w('l03', 'ama') - 0.3, '109 ×', 'ÇAP'], [w('l03', 'ama') + 0.2, T.l04 + 0.2, '1,3 mn', 'DÜNYA · HACİMCE'], [w('l05', 'yüzde') - 0.1, T.l06 + 0.4, '%99,86', "KÜTLENİN GÜNEŞ'TEKİ PAYI"]],
  };
}

// № 029 · Jüpiter mi ağır, geri kalanlar mı (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: terazinin bir kefesinde Jüpiter, öbüründe yedi gezegen; terazi Jüpiter'den yana ezilmiş. Doruk: %71 pastası.
// Kütleler (NASA): Jüpiter 318 Dünya, diğer yedisi 129 Dünya, oran 2,47; Satürn 95 Dünya.

const SX = 1400;
export function hero(T) { return T.w('l05', 18) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 17) - 0.3, w('l03', 17)], [T.l05 - 0.3, T.l05], [w('l05', 9) - 0.3, w('l05', 9)], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [0, 1, 2, 3, 4, 5, 6].map(i => w('l03', i)),
    thock: [w('l03', 17) + 0.5],
    scratch: [[w('l05', 9), hero(T), 0.02]],
    riser: [w('l05', 9) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk29', name: 'Çocuk', seed: 291,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#C2412F', shade: '#9E3324' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#C2412F', shade: '#9E3324', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#2E4A6B', shade: '#233A55' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#6A4A2A',
  features: ['hoodie', 'hairMessy'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const space = () => { bg('#141B2C'); const r = mulberry32(29); for (let i = 0; i < 140; i++) circ(-300 + r() * 1700, r() * 2000, 2 + r() * 3, '#F4F1EA', 0); rect(-900, GY, 2900, 1600, '#2A2F44', 0); line(-900, GY, 2000, GY, LW); };

  // gezegenler: tür, merkez, yarıçap
  const PL = { merkur: ['#A8A49C', 0.38], venus: ['#E8D39A', 0.95], dunya: ['#3F7FC0', 1], mars: ['#C2552F', 0.53], saturn: ['#E3C77A', 3.2], uranus: ['#9ED6DE', 2.0], neptun: ['#3F6FD0', 1.95] };
  const planet = (kind, x, y, r) => {
    if (kind === 'jupiter') {
      circ(x, y, r, '#D9A066', LW);
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, 7); ctx.clip();
      for (const [dy, h, c] of [[-0.55, 0.14, '#B8743A'], [-0.2, 0.16, '#E8C08A'], [0.12, 0.13, '#B8743A'], [0.45, 0.12, '#C88A4E']]) { ctx.fillStyle = c; ctx.fillRect(x - r, y + dy * r, 2 * r, h * r); }
      ell(x + r * 0.35, y + r * 0.3, r * 0.2, r * 0.11, '#C2412F', 3);
      ctx.restore(); circ(x, y, r, null, LW); return;
    }
    const [c] = PL[kind];
    if (kind === 'saturn') { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.25); ell(0, 0, r * 2, r * 0.5, null, LW * 1.6); ctx.strokeStyle = '#C8A85A'; ctx.lineWidth = LW * 0.8; ctx.beginPath(); ctx.ellipse(0, 0, r * 2, r * 0.5, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    circ(x, y, r, c, LW);
    if (kind === 'dunya') { ell(x - r * 0.3, y - r * 0.2, r * 0.35, r * 0.25, '#5E9A4E', 0); ell(x + r * 0.35, y + r * 0.3, r * 0.25, r * 0.2, '#5E9A4E', 0); }
  };
  // terazi: pivot (cx, py); eğim a (radyan, + sol aşağı); kefeler; içerik çizim fonksiyonları
  const balance = (cx, py, a, drawL, drawR, L = 330) => {
    rect(cx - 22, py, 44, GY - py, '#6A5A48', LW); poly([[cx - 90, GY], [cx + 90, GY], [cx + 50, GY - 50], [cx - 50, GY - 50]], '#6A5A48', LW);
    const lx = cx - L * Math.cos(a), ly = py + L * Math.sin(a), rx = cx + L * Math.cos(a), ry = py - L * Math.sin(a);
    line(lx, ly, rx, ry, 26, '#1F2421'); line(lx, ly, rx, ry, 16, '#8A7A5A'); circ(cx, py, 20, PAL.gold, LW);
    for (const [x, y, fn] of [[lx, ly, drawL], [rx, ry, drawR]]) { line(x, y, x - 110, y + 230, 4); line(x, y, x + 110, y + 230, 4); ell(x, y + 236, 150, 22, '#A89A7A', LW); fn && fn(x, y + 220); }
  };
  const seven = (x, y, n = 7) => { const order = ['merkur', 'venus', 'dunya', 'mars', 'saturn', 'uranus', 'neptun']; const pos = [[-120, -16], [-80, -30], [-36, -32], [4, -20], [70, -84], [-60, -100], [118, -66]]; const sc = 24; order.slice(0, n).forEach((k, i) => planet(k, x + pos[i][0], y + pos[i][1], PL[k][1] * sc)); };

  const scenes = [];
  // 0 · kanca: terazi Jüpiter'den yana ezilmiş; çocuk şaşkın
  scenes[0] = t => {
    t = loopT(t);
    space();
    const a = 0.32 + 0.015 * Math.sin(t * 2.2);
    balance(540, 820, a, (x, y) => planet('jupiter', x, y - 150, 150), (x, y) => seven(x, y));
    ch(COCUK, { x: 930, y: GY, s: 120, expr: 'saskin', armR: { sh: 150, el: 10 }, head: { look: [-0.6, -0.4] }, talk: talk(t, T.l02, T.l02end) }, t);
  };
  // 1 · gezegenler kefeye tek tek iner; sonra Jüpiter iner ve terazi ezilir
  scenes[1] = t => {
    space();
    const n = [0, 1, 2, 3, 4, 5, 6].filter(i => t > w('l03', i) - 0.1).length;
    const jIn = seg(t, w('l03', 17) - 0.3, 0.6), a = lerp(-0.06, 0.32, ease.enter(seg(t, w('l03', 17) + 0.2, 0.8)));
    balance(540, 820, a, (x, y) => jIn > 0 && planet('jupiter', x, lerp(y - 900, y - 150, ease.enter(jIn)), 150), (x, y) => seven(x, y, n));
    const names = ['Merkür', 'Venüs', 'Dünya', 'Mars', 'Satürn', 'Uranüs', 'Neptün'];
    if (n > 0 && t < w('l03', 8)) { rect(560, 560, 420, 90, PAL.paper, LW, 14); text(names[n - 1], 770, 625, 56, A.INK); }
  };
  // 2 · Satürn ile Jüpiter yan yana (318'e 95); sonra %71 pastası
  scenes[2] = t => {
    space();
    const pie = seg(t, w('l05', 9) - 0.2, 1.2);
    if (pie <= 0) {
      planet('jupiter', 360, 1000, 260); planet('saturn', 860, 1100, 120);
      text('318', 360, 1330, 64, '#F4F1EA'); text('95', 860, 1330, 64, '#F4F1EA');
    } else {
      const k = ease.enter(pie), cx = 540, cy = 1000, R = 300;
      circ(cx, cy, R, '#5E7F68', LW);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * 0.712 * k); ctx.closePath(); ctx.fillStyle = '#D9A066'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = A.INK; ctx.stroke();
      if (k > 0.95) { text('JÜPİTER', cx - 40, cy + 40, 56, A.INK); text('diğer 7', cx + 160, cy - 150, 40, '#F4F1EA'); }
    }
  };
  // 3 · çocuk avucunda toz tanesi kadar Dünya; arkada dev Jüpiter
  scenes[3] = t => {
    space();
    planet('jupiter', 760, 700, 420);
    ch(COCUK, { x: 360, y: GY, s: 150, expr: t > T.l07 ? 'mutlu' : 'saskin', armR: { sh: 70, el: 60 }, head: { look: [0.3, -0.2] } }, t);
    const sk = { x: 470, y: 1010 }, ey = sk.y - 14 - 4 * Math.sin(t * 3); planet('dunya', sk.x, ey, 13); line(sk.x + 20, ey - 20, sk.x + 90, ey - 90, 4, '#F4F1EA'); text('Dünya', sk.x + 150, ey - 100, 40, '#F4F1EA');
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.1, 520, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.12, 540, 960, 0)],
    [T.l02end + 0.1, ...P(1.35, 800, 1080, 0)],
    ...cut(T.l03 - 0.15, P(1.35, 800, 1080, 0), P(1.25, 760, 1000, 1)),
    [w('l03', 16), ...P(1.25, 760, 1000, 1)],
    [w('l03', 17) + 1.0, ...P(1.1, 540, 960, 1)],
    [T.l03end + 0.2, ...P(1.12, 540, 960, 1)],
    ...cut(T.l05 - 0.15, P(1.12, 540, 960, 1), P(1.0, 560, 1000, 2)),
    [hero(T), ...P(1.0, 540, 1000, 2)],
    ...cut(T.l06 - 0.15, P(1.0, 540, 1000, 2), P(1.0, 540, 960, 3)),
    [w('l06', 4), ...P(1.6, 440, 1010, 3)],
    [T.l07end + 0.2, ...P(1.05, 560, 960, 3)],
    [T.loop0 - 0.001, ...P(1.05, 560, 960, 3)],
    [T.loop0, ...P(1.11, 525, 960, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Jüpiter mi ağır,', 'geri kalanlar mı?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 12) - 0.1, w('l03', 17) - 0.2, '129 Dünya', 'DİĞER 7 GEZEGEN'], [w('l03', 20) - 0.1, w('l03', 32) - 0.2, '318 Dünya', 'JÜPİTER TEK BAŞINA'], [w('l03', 32) - 0.1, T.l04 - 0.2, '2,47 kat', 'JÜPİTER / DİĞERLERİ'], [w('l05', 14) - 0.1, T.l06 - 0.2, '%71', 'GEZEGEN KÜTLESİ JÜPİTER\'DE']],
  };
}

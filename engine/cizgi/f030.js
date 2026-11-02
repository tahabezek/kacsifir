// № 030 · Jüpiter'e kaç Dünya sığar (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: terazide koca Jüpiter ile 318 Dünya dengede. Doruk: aynı hacimde Jüpiter küpü, Dünya küpünün dörtte biri ağırlıkta.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
export function hero(T) { return T.w('l05', 'dörtte') + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'dünyaları') - 0.3, w('l03', 'dünyaları')], [w('l03', 'ama') - 0.3, w('l03', 'ama')], [T.l04 - 0.3, T.l04], [w('l05', 'aynı') - 0.3, w('l05', 'aynı')], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'katı'), w('l03', 'gerekirdi'), w('l03', 'metal')],
    thock: [w('l05', 'ağır')],
    scratch: [[w('l03', 'dünyaları'), w('l03', 'gerekirdi'), 0.02]],
    riser: [w('l05', 'aynı') - 0.6, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk', name: 'Çocuk', seed: 301,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#3F7FB5', shade: '#2F6390' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#3F7FB5', shade: '#2F6390', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#3B2A20',
  features: ['hoodie', 'hairMessy'],
});
const DEDE = base({
  key: 'dede', name: 'Dede', seed: 302,
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
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);

  const SPACE = '#1E2A3A';
  const stars = (seed, n = 60) => { const r = mulberry32(seed); for (let i = 0; i < n; i++) circ(-300 + r() * 1700, r() * 1500, 2 + r() * 3, '#F4EFE3', 0); };
  // Jüpiter: bantlı disk + büyük kırmızı leke; rot: bant kayması (periyodik)
  const jupiter = (x, y, r, rot = 0) => {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    ctx.fillStyle = '#E8C9A0'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    const bands = [[-0.62, 0.12, '#C88A5A'], [-0.32, 0.1, '#D9A06A'], [-0.05, 0.14, '#B8744A'], [0.25, 0.1, '#D9A06A'], [0.52, 0.12, '#C88A5A']];
    for (const [dy, h, c] of bands) { ctx.fillStyle = c; ctx.beginPath(); for (let k = 0; k <= 40; k++) { const xx = x - r + (2 * r * k) / 40; const yy = y + dy * r + Math.sin(k * 0.5 + rot) * r * 0.015; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } for (let k = 40; k >= 0; k--) { const xx = x - r + (2 * r * k) / 40; ctx.lineTo(xx, y + (dy + h) * r + Math.sin(k * 0.5 + rot + 1) * r * 0.015); } ctx.fill(); }
    ell(x + r * 0.32 + Math.sin(rot) * r * 0.05, y + r * 0.34, r * 0.17, r * 0.09, '#C2412F', Math.max(3, r * 0.02));
    ctx.restore();
    circ(x, y, r, null, Math.max(4, r * 0.025));
  };
  const earth = (x, y, r) => {
    circ(x, y, r, '#3F7FB5', 0);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    ell(x - r * 0.3, y - r * 0.25, r * 0.38, r * 0.3, '#5E9A4E', 0, 0.4); ell(x + r * 0.35, y + r * 0.25, r * 0.3, r * 0.42, '#5E9A4E', 0, -0.3); ell(x, y - r * 0.85, r * 0.6, r * 0.2, '#F4F1EA', 0);
    ctx.restore();
    circ(x, y, r, null, Math.max(2.5, r * 0.08));
  };
  // terazi: dayanak (cx, ground), kol uzunluğu L, eğim a (rad, + sağ aşağı); döner: [solKefe, sağKefe] üst noktaları
  const balance = (cx, top, L, a) => {
    rect(cx - 20, top, 40, GY - top, '#6A5A48', LW); poly([[cx - 90, GY], [cx + 90, GY], [cx + 50, GY - 50], [cx - 50, GY - 50]], '#6A5A48', LW);
    ctx.save(); ctx.translate(cx, top); ctx.rotate(a); rect(-L, -12, 2 * L, 24, '#8A7A5A', LW, 8); ctx.restore();
    const lx = cx - L * Math.cos(a), ly = top - L * Math.sin(a), rx = cx + L * Math.cos(a), ry = top + L * Math.sin(a);
    line(lx, ly, lx, ly + 200, 5); line(rx, ry, rx, ry + 200, 5);
    rect(lx - 130, ly + 200, 260, 22, '#8A7A5A', LW, 6); rect(rx - 130, ry + 200, 260, 22, '#8A7A5A', LW, 6);
    return [[lx, ly + 200], [rx, ry + 200]];
  };
  const ground = (c = '#3A4458') => { rect(-900, GY, 2900, 1600, c, 0); line(-900, GY, 2000, GY, LW); };

  const scenes = [];
  // 0 · kanca: terazide Jüpiter ↔ 318 Dünya; çocuk ve dede izliyor
  const earthPile = []; { const r = mulberry32(318); for (let i = 0; i < 60; i++) { const row = Math.floor(Math.sqrt(i * 2.2)); earthPile.push([(r() - 0.5) * (230 - row * 18), -18 - row * 26 - r() * 6]); } }
  scenes[0] = t => {
    t = loopT(t);
    bg(SPACE); stars(7); ground();
    const a = 0.03 * Math.sin((2 * Math.PI * t) / D * 3);
    const [[lx, ly], [rx, ry]] = balance(540, 730, 280, a);
    jupiter(lx, ly - 132, 130, (2 * Math.PI * t) / D * 4);
    earthPile.forEach(([dx, dy]) => earth(rx + dx, ry + dy, 15));
    ch(COCUK, { x: 230, y: GY, s: 92, expr: 'saskin', armR: { sh: 140, el: 10 }, head: { look: [0.6, -0.5] } }, t);
    ch(DEDE, { x: 850, y: GY, s: 94, expr: 'mutlu', head: { look: [-0.6, -0.4] } }, t);
  };
  // 1 · çap: Jüpiter'in çapı boyunca 11 Dünya
  scenes[1] = t => {
    bg(SPACE); stars(11);
    jupiter(540, 900, 420, t * 0.4);
    const n = Math.min(11, Math.floor(seg(t, T.l03 + 0.2, w('l03', 'katı') - T.l03 + 0.2) * 11.99));
    for (let i = 0; i < n; i++) earth(540 - 420 + 38 + i * 76.4, 900, 37);
    if (n >= 11) { line(120, 1360, 960, 1360, 6, '#F4EFE3'); line(120, 1340, 120, 1380, 6, '#F4EFE3'); line(960, 1340, 960, 1380, 6, '#F4EFE3'); }
  };
  // 2 · hacim: Dünyalar eritilip Jüpiter'e dolar (sayaç 1.321)
  const fillK = t => ease.state(seg(t, w('l03', 'dünyaları'), w('l03', 'gerekirdi') + 0.2 - w('l03', 'dünyaları')));
  scenes[2] = t => {
    bg(SPACE); stars(13);
    const cx = 540, cy = 860, R = 400, k = fillK(t);
    circ(cx, cy, R, '#2A3446', 0);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    const lvl = cy + R - 2 * R * k;
    ctx.fillStyle = '#3F7FB5'; ctx.beginPath(); ctx.moveTo(cx - R, cy + R); for (let i = 0; i <= 30; i++) ctx.lineTo(cx - R + (2 * R * i) / 30, lvl + Math.sin(i * 0.8 + t * 4) * 8); ctx.lineTo(cx + R, cy + R); ctx.fill();
    ctx.restore();
    circ(cx, cy, R, null, 10);
    for (let i = 0; i < 4; i++) { const u = ((t * 0.9 + i * 0.25) % 1); if (k > 0 && k < 1) earth(cx - 120 + i * 80, lerp(240, lvl - 30, u), 30); }
  };
  // 3 · içerik: Jüpiter gaz (H, He kabarcıkları), Dünya kaya ve metal (kesit)
  scenes[3] = t => {
    bg(SPACE); stars(17);
    jupiter(330, 820, 250, t * 0.6);
    const hb = mulberry32(5); for (let i = 0; i < 9; i++) { const ph = hb() * 6.28, x = 200 + hb() * 260, y = 820 + 120 - ((t * 60 + i * 50) % 260); circ(x, y, 26, '#F4EFE3', 4); text(i % 3 ? 'H' : 'He', x, y + 11, i % 3 ? 30 : 24, '#7A5A3A'); }
    const showE = seg(t, w('l03', 24) - 0.3, 0.4);
    if (showE > 0) {
      const ex = 820, ey = 900, r = 150 * ease.enter(showE);
      circ(ex, ey, r, '#8A6A4A', LW); circ(ex, ey, r * 0.62, '#B8744A', LW); circ(ex, ey, r * 0.34, '#E2B13C', LW);
      ctx.save(); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.arc(ex, ey, r + 4, -0.6, 0.9, true); ctx.closePath(); ctx.clip(); earth(ex, ey, r); ctx.restore();
      text('KAYA', ex, ey + r + 60, 40, '#F4EFE3'); text('METAL', ex, ey + 14, 30, '#1F2421');
    }
  };
  // 4 · balon: çocuk Jüpiter balonu tutuyor, dede küçük Dünya taşını
  scenes[4] = t => {
    bg('#BFD6DC'); rect(-900, GY, 2900, 1600, '#7FA36A', 0); line(-900, GY, 2000, GY, LW);
    const bob = Math.sin(t * 2.2) * 14, bx = 330, by = 640 + bob;
    line(bx, by + 170, 300, GY - 240, 4);
    jupiter(bx, by, 170, t * 0.5);
    ch(COCUK, { x: 290, y: GY, s: 130, expr: 'mutlu', armL: { sh: 160, el: 10 }, head: { look: [0, -0.6] } }, t);
    ch(DEDE, { x: 800, y: GY, s: 140, expr: 'mutlu', armL: { sh: 70, el: 60 }, head: { look: [-0.6, 0] } }, t);
    earth(700, 1030, 34);
  };
  // 5 · aynı hacim: Jüpiter küpü ↔ Dünya küpü terazide; Dünya ağır basar (doruk)
  const tip = t => ease.enter(seg(t, w('l05', 'aynı') - 0.2, w('l05', 'dörtte') + 0.2 - w('l05', 'aynı')));
  scenes[5] = t => {
    bg(SPACE); stars(19); ground();
    const k = tip(t), a = 0.22 * k + 0.012 * Math.sin(t * 3);   // Dünya küpü ağır basar: sağ kefe aşağı
    const [[lx, ly], [rx, ry]] = balance(540, 730, 280, a);
    const cubeB = (x, y, s, f, edge) => { rect(x - s / 2, y - s, s, s, f, LW, 10); for (let i = 1; i < 4; i++) line(x - s / 2 + 8, y - s + (i * s) / 4, x + s / 2 - 8, y - s + (i * s) / 4, 5, edge); };
    cubeB(lx, ly, 170, '#D9A06A', '#B8744A');
    cubeB(rx, ry, 170, '#3F7FB5', '#5E9A4E');
    text('JÜPİTER', lx, ly + 70, 38, '#F4EFE3'); text('DÜNYA', rx, ry + 70, 38, '#F4EFE3');

    ch(COCUK, { x: 230, y: GY, s: 92, expr: k > 0.8 ? 'saskin' : 'notr', head: { look: [0.6, -0.4] } }, t);
    ch(DEDE, { x: 850, y: GY, s: 94, expr: t > T.l06 ? 'mutlu' : 'notr', armR: t > T.l06 ? { sh: 120, el: 30 } : undefined, head: { look: [-0.6, -0.3] } }, t);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.1, 540, 1000, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.16, 540, 1000, 0)],
    [T.l02end, ...P(1.5, 560, 960, 0)],
    ...cut(T.l03 - 0.15, P(1.5, 560, 960, 0), P(0.95, 540, 900, 1)),
    [w('l03', 'katı') + 0.3, ...P(1.0, 540, 920, 1)],
    ...cut(w('l03', 'dünyaları') - 0.15, P(1.0, 540, 920, 1), P(0.95, 540, 880, 2)),
    [w('l03', 'gerekirdi') + 0.2, ...P(1.02, 540, 880, 2)],
    ...cut(w('l03', 'ama') - 0.15, P(1.02, 540, 880, 2), P(1.1, 560, 900, 3)),
    [T.l03end + 0.2, ...P(1.16, 580, 900, 3)],
    ...cut(T.l04 - 0.15, P(1.16, 580, 900, 3), P(1.15, 540, 1000, 4)),
    [T.l04end + 0.1, ...P(1.22, 520, 980, 4)],
    ...cut(w('l05', 'aynı') - 0.15, P(1.22, 520, 980, 4), P(1.18, 540, 1000, 5)),
    [hero(T), ...P(1.24, 540, 1000, 5)],
    [T.loop0 - 0.001, ...P(1.28, 540, 1000, 5)],
    [T.loop0, ...P(1.12, 540, 1000, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ["Jüpiter'e kaç", 'Dünya sığar?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[T.l02 - 0.1, T.l03 - 0.3, '318', 'DÜNYA AĞIRLIĞINDA'], [w('l03', 'çapı') - 0.1, w('l03', 'dünyaları') - 0.3, '11,2 ×', 'ÇAP'], [w('l03', 10) - 0.1, w('l03', 'ama') - 0.3, '1.321', 'DÜNYA SIĞAR (HACİMCE)'], [w('l05', 'aynı') - 0.05, T.l06 + 0.4, '1/4', 'AYNI HACİMDE AĞIRLIK']],
  };
}

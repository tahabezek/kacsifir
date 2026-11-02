// № 057 · Pi'nin kaç basamağı yeter (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: kara tahtada pi'nin ilk 37 basamağı ve evreni saran çember; tahtanın önünde çocuk.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
const PI37 = '3,1415926535897932384626433832795028841';   // 3 + 37 ondalık
export function hero(T) { return T.w('l05', 13) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[w('l01', 11) - 0.3, w('l01', 11)], [T.l03 - 0.3, T.l03], [w('l03', 'ama') - 0.3, w('l03', 'ama')], [w('l03', 15) - 0.3, w('l03', 15)], [T.l04 - 0.3, T.l04], [w('l05', 14) - 0.3, w('l05', 14)], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l01', 7), w('l03', 10), w('l03', 26), w('l05', 10)],
    thock: [w('l03', 'hatayla')],
    scratch: [[w('l05', 0), hero(T), 0.02]],
    riser: [w('l05', 0) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk57', name: 'Çocuk', seed: 571,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#2E7A8A', shade: '#22606C' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#2E7A8A', shade: '#22606C', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#E6B88E', skinShade: '#CC9C72', hair: '#2A1E16',
  features: ['hoodie', 'hairMessy'],
});
const OGRETMEN = base({
  key: 'ogretmen57', name: 'Öğretmen', seed: 572,
  torso: { len: 0.84, shoulder: 0.66, hip: 0.72, depth: 0.48, belly: 0.04, color: '#5E7F68', shade: '#4A6654' },
  arm: { upper: 0.38, lower: 0.36, w: 0.18, color: '#5E7F68', shade: '#4A6654', hand: 0.13 },
  leg: { upper: 0.38, lower: 0.36, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#3A2420', len: 0.27, h: 0.11 },
  skin: '#F0C8A4', skinShade: '#D8AC86', hair: '#6A4A2E',
  features: ['cardigan', 'skirt', 'bun', 'glassesCat'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, MONO = '"IBM Plex Mono"';
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const CHALK = '#EEF2E6', BOARD = '#2F4A3A';
  const stars = (seed, n, x0, y0, wd, ht) => { const r = mulberry32(seed); for (let i = 0; i < n; i++) circ(x0 + r() * wd, y0 + r() * ht, 2 + r() * 3, '#F4F1EA', 0); };

  // kara tahta: pi basamakları satır satır, n basamak görünür (tebeşir)
  const board = (x, y, wd, ht, n, hi = 0) => {
    rect(x - 16, y - 16, wd + 32, ht + 32, '#7A5634', LW, 10); rect(x, y, wd, ht, BOARD, LW, 4);
    text('π =', x + 40, y + 90, 64, CHALK, 'Archivo', 800, 'left');
    const per = 10, chars = PI37.slice(0, Math.min(PI37.length, 2 + n));
    const rows = [chars.slice(0, 2 + per), chars.slice(2 + per, 2 + 2 * per), chars.slice(2 + 2 * per, 2 + 3 * per), chars.slice(2 + 3 * per)];
    rows.forEach((s, i) => { if (s) text(s, x + 150, y + 90 + i * 74, 58, CHALK, MONO, 600, 'left'); });
    if (hi > 0) { ctx.save(); ctx.globalAlpha = hi; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 6; ctx.strokeRect(x + 140, y + 30, wd - 160, ht - 60); ctx.restore(); }
  };

  const scenes = [];
  // 0 · kanca: kara tahtada 37 basamak, üstte evreni saran tebeşir çemberi; çocuk tahtanın önünde
  scenes[0] = t => {
    t = loopT(t);
    bg('#E9DFC9'); rect(-900, GY, 2900, 1600, '#B8A88A', 0); line(-900, GY, 2000, GY, LW);
    board(80, 640, 920, 380, 37);
    // tebeşir ışıltısı: basamakların üstünde gezinen parlak nokta (sürekli hareket)
    { const k = (t * 0.5) % 1; circ(240 + 700 * k, 690 + 74 * Math.floor((t * 0.5) % 4), 8, PAL.gold, 0); }
    const point = t < T.l02 ? 1 : 0;
    ch(COCUK, { x: 860, y: GY, s: 140, expr: t > T.l02 - 0.2 && t < T.l03 ? 'saskin' : 'mutlu', armL: point ? { sh: 150, el: 20 } : { sh: 15, el: 5 }, talk: talk(t, T.l02, T.l02end), head: { look: [-0.5, -0.3] } }, t);
  };
  // 1 · bilgisayar odası: basamak şeridi akar, sayaç 314 trilyon; sonra rekor kupası
  const tapeOn = t => seg(t, w('l01', 11) - 0.2, 2.6);
  scenes[1] = t => {
    bg('#1E2430'); rect(-900, GY, 2900, 1600, '#2A303C', 0); line(-900, GY, 2000, GY, LW);
    for (let i = 0; i < 4; i++) { const x = 60 + i * 250; rect(x, 560, 200, 800, '#3A4252', LW, 10); for (let j = 0; j < 9; j++) { rect(x + 20, 600 + j * 80, 160, 50, '#2A303C', 4, 6); circ(x + 160, 625 + j * 80, 8, (Math.floor(t * 6 + i * 3 + j) % 3) ? '#5E9A4E' : '#F6C445', 0); } }
    // akan basamak şeridi
    const r = mulberry32(57);
    rect(-100, 1440, 1280, 110, PAL.paper, LW, 8);
    ctx.save(); ctx.beginPath(); ctx.rect(-100, 1440, 1280, 110); ctx.clip();
    const off = (t * 420) % 46; for (let k = 0; k < 32; k++) text(String(Math.floor(r() * 10)), 1160 - k * 46 + off, 1518, 60, '#1F2421', MONO, 600);
    ctx.restore();
    const rec = t > w('l05', 18) - 0.2;
    if (rec) { const k = ease.enter(seg(t, w('l05', 18) - 0.2, 0.5)); ctx.save(); ctx.translate(540, 900); ctx.scale(k, k); poly([[-90, -150], [90, -150], [70, -40], [-70, -40]], PAL.gold, LW); ell(-110, -110, 40, 50, null, 10); ell(110, -110, 40, 50, null, 10); rect(-20, -40, 40, 70, PAL.gold, LW); rect(-80, 30, 160, 40, '#6A4A2E', LW, 6); text('REKOR', 0, 62, 30, PAL.paper); ctx.restore(); }
  };
  // 2 · uzay: Güneş, Voyager 1 ve yarıçapı Voyager'a uzanan dev çember; 15 basamak; 1 cm büyüteç
  scenes[2] = t => {
    bg('#121A2A'); stars(21, 120, -300, 0, 1700, 2000);
    const R = 520, cx = 540, cy = 1000;
    ctx.save(); ctx.strokeStyle = '#F6C445'; ctx.lineWidth = 6; ctx.setLineDash([22, 16]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7 * Math.min(1, seg(t, w('l03', 15), 1.6) * 1.12)); ctx.stroke(); ctx.restore();
    circ(cx, cy, 46, '#F6C445', LW);
    const vx = cx + R * Math.cos(-0.5), vy = cy + R * Math.sin(-0.5);
    line(cx, cy, vx, vy, 4, '#F4F1EA');
    ctx.save(); ctx.translate(vx, vy); ctx.rotate(0.4); rect(-22, -16, 44, 32, '#C9CED2', LW, 4); line(-22, 0, -70, -30, 5, '#C9CED2'); ell(-80, -36, 46, 18, '#F4F1EA', LW, -0.5); line(22, 0, 60, 10, 4, '#C9CED2'); ctx.restore();
    if (t > w('l03', 10) - 0.2) { rect(80, 560, 920, 120, PAL.paper, LW, 12); text('3,141592653589793', 540, 645, 72, '#1F2421', MONO, 600); }
    const mag = seg(t, w('l03', 25) - 0.2, 0.5);
    if (mag > 0) { const k = ease.enter(mag), mx = 330, my = 900; ctx.save(); ctx.translate(mx, my); ctx.scale(1.6 * k, 1.6 * k); circ(0, 0, 130, '#1A2438', 10); ctx.strokeStyle = '#F6C445'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(30, -200, 230, 1.75, 2.15); ctx.stroke(); ctx.strokeStyle = '#7FD0E6'; ctx.beginPath(); ctx.arc(30, -170, 230, 1.75, 2.15); ctx.stroke(); line(-40, -10, -40, 30, 5, '#F4F1EA'); line(-50, -10, -30, -10, 5, '#F4F1EA'); line(-50, 30, -30, 30, 5, '#F4F1EA'); text('1 cm', 40, 20, 40, '#F4F1EA'); line(100, 100, 190, 190, 22); ctx.restore(); }
  };
  // 3 · gözlemlenebilir evren: galaksilerle dolu çember; hidrojen atomu büyüteci; 37 basamak
  scenes[3] = t => {
    bg('#0E1220'); stars(33, 220, -300, 0, 1700, 2000);
    const cx = 540, cy = 1000, R = 470;
    ctx.save(); ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
    const r = mulberry32(37); for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * (R - 60); const gx = cx + Math.cos(a) * d, gy = cy + Math.sin(a) * d; ctx.save(); ctx.translate(gx, gy); ctx.rotate(r() * 3 + t * 0.2); ell(0, 0, 26 + r() * 20, 9, ['#C9A8E6', '#F6D77A', '#9ACBE6'][i % 3], 3); ctx.restore(); }
    circ(cx, cy, 10, PAL.gold, 3);
    const atom = seg(t, w('l05', 4) - 0.2, 0.5);
    if (atom > 0) { const k = ease.enter(atom); ctx.save(); ctx.translate(cx + R * 0.7, cy - R * 0.7); ctx.scale(k, k); circ(0, 0, 120, '#1F2840', 8); circ(0, 0, 16, PAL.red, 4); ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 80, 34, t * 1.5, 0, 7); ctx.stroke(); circ(80 * Math.cos(t * 4), 34 * Math.sin(t * 4), 9, '#7FD0E6', 3); text('H', 0, 112, 36, '#F4F1EA'); ctx.restore(); }
    if (t > w('l05', 10) - 0.2) { const n = Math.min(37, Math.round(37 * ease.enter(seg(t, w('l05', 10) - 0.2, 1.0)))); rect(40, 650, 1000, 180, PAL.paper, LW, 12); const s = PI37.slice(0, 2 + n); text(s.slice(0, 21), 540, 725, 50, '#1F2421', MONO, 600); text(s.slice(21), 540, 795, 50, '#1F2421', MONO, 600); }
  };
  // 4 · sınıf: tahtada "π ≈ 3,14"; öğretmen ve çocuk; çocuk parmaklarıyla sayar
  scenes[4] = t => {
    bg('#E9DFC9'); rect(-900, GY, 2900, 1600, '#B8A88A', 0); line(-900, GY, 2000, GY, LW);
    rect(70, 560, 600, 330, '#7A5634', LW, 10); rect(86, 576, 568, 298, BOARD, LW, 4);
    text('π ≈ 3,14', 370, 760, 110, CHALK);
    const ok = seg(t, w('l06', 2) - 0.1, 0.4); if (ok > 0) { ctx.save(); ctx.globalAlpha = ok; ctx.strokeStyle = PAL.gold; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(500, 820); ctx.lineTo(540, 860); ctx.lineTo(620, 760); ctx.stroke(); ctx.restore(); }
    ch(OGRETMEN, { x: 800, y: GY, s: 140, expr: 'mutlu', armL: { sh: 110 + 8 * Math.sin(t * 2), el: 20 }, head: { look: [-0.4, 0] } }, t);
    const count = t > T.l07 - 0.1;
    ch(COCUK, { x: 330, y: GY, s: 130, expr: count ? 'notr' : 'mutlu', talk: talk(t, T.l06, T.l06end), armR: count ? { sh: 70 + 12 * Math.sin(t * 6), el: 70 } : { sh: 20, el: 10 }, armL: count ? { sh: 70 - 12 * Math.sin(t * 6), el: 70 } : { sh: 20, el: 10 }, head: { tilt: count ? 8 * Math.sin(t * 2) : 0, look: [0.3, -0.2] } }, t);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.12, 540, 930, 0);
  const cam = [
    [0, ...F0],
    [w('l01', 11) - 0.16, ...P(1.18, 580, 930, 0)],
    ...cut(w('l01', 11) - 0.15, P(1.18, 580, 930, 0), P(1.0, 540, 960, 1)),
    ...cut(T.l02 - 0.15, P(1.0, 540, 960, 1), P(1.25, 760, 1000, 0)),
    [T.l02end + 0.1, ...P(1.3, 780, 1000, 0)],
    ...cut(T.l03 - 0.15, P(1.3, 780, 1000, 0), P(0.95, 540, 960, 1)),
    ...cut(w('l03', 'ama') - 0.15, P(0.95, 540, 960, 1), P(0.95, 540, 880, 2)),
    [w('l03', 25) - 0.2, ...P(0.9, 540, 900, 2)],
    [T.l03end + 0.2, ...P(1.05, 420, 1100, 2)],
    ...cut(T.l04 - 0.15, P(1.05, 420, 1100, 2), P(0.9, 540, 860, 3)),
    [hero(T), ...P(0.95, 540, 860, 3)],
    ...cut(w('l05', 18) - 0.15, P(0.98, 540, 880, 3), P(1.0, 540, 960, 1)),
    ...cut(T.l06 - 0.15, P(1.0, 540, 960, 1), P(1.0, 560, 940, 4)),
    [T.l07end + 0.2, ...P(1.1, 520, 980, 4)],
    [T.loop0 - 0.001, ...P(1.1, 520, 980, 4)],
    [T.loop0, ...P(1.1, 540, 930, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Evren için pi\'nin', 'kaç basamağı yeter?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[T.l01end + 0.5, T.l02 - 0.2, '314 trilyon', 'HESAPLANAN BASAMAK'], [w('l03', 25) - 0.1, T.l04 - 0.2, '~1 cm', 'VOYAGER ÇEMBERİNDE HATA'], [hero(T) - 0.6, w('l05', 18) - 0.3, '37', 'EVREN İÇİN YETEN BASAMAK']],
  };
}

// № 003 · Dünya'nın merkezine ne kadar indik (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: sınıf panosunda Dünya kesiti; yüzeyde kıl kadar kırmızı çizgi = en derin kuyu. Doruk: aynı çizgi merkeze
// giden 6.371 km'lik okun yanında. Görseller ekranın y 280–1240 aralığında; zemin 1240 (altyazının üstünde).

const SX = 1400;
export function hero(T) { return T.w('l03', 'aşağıda') + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'ama') - 0.3, w('l03', 'ama')], [w('l03', 25) - 0.3, w('l03', 25)], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'kilometre.'), w('l03', 'sürdü'), w('l03', 'delemedik')],
    thock: [w('l05', 'ilerleyemedi')],
    scratch: [[w('l03', 25), hero(T), 0.02]],
    riser: [w('l03', 25) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk', name: 'Çocuk', seed: 31,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#E8A33D', shade: '#C8852A' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#E8A33D', shade: '#C8852A', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#3B2A20',
  features: ['hoodie', 'hairMessy'],
});
const DEDE = base({
  key: 'dede', name: 'Dede', seed: 32,
  head: { w: 0.9, h: 1.04, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.86, shoulder: 0.7, hip: 0.6, depth: 0.46, belly: 0.1, color: '#6A4C38', shade: '#523A2B' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#6A4C38', shade: '#523A2B', hand: 0.12 },
  leg: { upper: 0.4, lower: 0.38, w: 0.19, color: '#4A4A50', shade: '#36363C' },
  shoe: { color: '#3A2A20', len: 0.3, h: 0.11 },
  skin: '#E2B48E', skinShade: '#C9986F', hair: '#C9C4BC',
  eyes: { gap: 0.32, w: 0.17, h: 0.2, y: 0.04, lid: 0.25 },
  features: ['suit', 'tie', 'baldSides', 'mustacheThick', 'glassesRect'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1240;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const LAYERS = [[1, '#8A6A4A', 'KABUK'], [0.995, '#D8722E', 'MANTO'], [0.546, '#E2B13C', 'DIŞ ÇEKİRDEK'], [0.192, '#F6D77A', 'İÇ ÇEKİRDEK']];

  // Dünya kesiti: çeyrek dilim açık, katmanlar görünür
  const earthCut = (x, y, r, labels = false) => {
    circ(x, y, r, '#3F7FB5', LW);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ell(x - r * 0.35, y - r * 0.2, r * 0.35, r * 0.25, '#5E9A4E', 0, 0.4); ell(x + r * 0.3, y + r * 0.35, r * 0.28, r * 0.35, '#5E9A4E', 0, -0.3); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r + 2, -Math.PI / 2, 0); ctx.closePath(); ctx.clip();
    for (const [k, c] of LAYERS) circ(x, y, r * k, c, 0);
    circ(x, y, r * 0.546, null, 3); circ(x, y, r * 0.192, null, 3);
    ctx.restore();
    line(x, y, x, y - r, LW); line(x, y, x + r, y, LW); circ(x, y, r, null, LW);
    if (labels) { text('MANTO', x + r * 0.62, y - r * 0.72, Math.max(18, r * 0.07), '#1F2421'); text('ÇEKİRDEK', x + r * 0.3, y - r * 0.16, Math.max(16, r * 0.06), '#1F2421'); }
  };
  const room = () => { bg('#EFE6D8'); rect(-900, GY, 2900, 900, '#D8CBB6', 0); line(-900, GY, 2000, GY, LW); };
  const rig = (x, y, k) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); poly([[-60, 0], [-12, -260], [12, -260], [60, 0]], null, LW); for (let i = 1; i < 6; i++) line(-60 + i * 9, -i * 43, 60 - i * 9, -i * 43, 5); rect(-90, -20, 180, 24, '#6A5A48', LW, 4); rect(-18, -290, 36, 34, PAL.red, LW, 4); ctx.restore(); };

  const scenes = [];
  // 0 · kanca: pano, Dünya kesiti ve kıl kadar kuyu; çocuk ve dede
  scenes[0] = t => {
    t = loopT(t);
    room();
    rect(170, 640, 740, 590, '#F4EFE3', LW, 14);
    earthCut(540, 975, 240, true);
    const p = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / D * 6);
    line(540, 735, 540, 741, 6, PAL.red);
    circ(540, 737, 26 + 6 * p, null, 5); line(520, 720, 400, 690, 5, PAL.red); rect(176, 660, 262, 62, '#FFFFFF', 4, 10); text('EN DERİN KUYU', 307, 702, 28, PAL.red);
    ch(COCUK, { x: 120, y: GY, s: 92, expr: 'saskin', head: { look: [0.6, -0.5] } }, t);
    ch(DEDE, { x: 960, y: GY, s: 98, expr: 'mutlu', armR: { sh: 140, el: 20 }, head: { look: [-0.6, -0.4] } }, t);
  };
  // 1 · Kola Kuyusu: karlı arazi, sondaj kulesi, derinlik ve yıl sayacı
  const depthK = t => ease.state(seg(t, w('l03', 'kola') - 0.3, w('l03', 'sürdü') + 0.4 - w('l03', 'kola')));
  scenes[1] = t => {
    bg('#C9D8E2'); rect(-900, 560, 2900, 60, '#F4F4F0', LW); rect(-900, 620, 2900, 640, '#8A6A4A', 0);
    for (let i = 0; i < 5; i++) rect(-900, 700 + i * 110, 2900, 40, '#7A5A3E', 0);
    poly([[-200, 560], [60, 380], [260, 560]], '#E9EEF2', LW); poly([[700, 560], [980, 420], [1300, 560]], '#E9EEF2', LW);
    rig(540, 566, 1.0);
    const k = depthK(t), dy = 620 + 600 * k;
    line(540, 620, 540, dy, 8, '#1F2421'); poly([[528, dy], [552, dy], [540, dy + 26]], '#8C9298', 3);
    for (let km = 0; km <= 12; km += 3) { const y = 620 + 600 * (km / 12); line(820, y, 850, y, 4, '#F4EFE3'); text(km + ' km', 920, y + 10, 30, '#F4EFE3'); }
    rect(140, 660, 220, 90, '#1F2421', LW, 10); text(String(Math.round(lerp(1970, 1989, k))), 250, 725, 56, '#F6D77A');
  };
  // 2 · kabuk 35 km: kuyu kabuğun üçte biri bile değil
  scenes[2] = t => {
    bg('#C9D8E2'); rect(-900, 560, 2900, 30, '#F4F4F0', LW);
    const crustY0 = 590, crustY1 = 1190;
    rect(-900, crustY0, 2900, crustY1 - crustY0, '#8A6A4A', 0); rect(-900, crustY1, 2900, 400, '#D8722E', 0); line(-900, crustY1, 2000, crustY1, LW);
    text('KABUK', 200, 660, 46, '#F4EFE3'); text('MANTO', 200, 1235, 40, '#1F2421');
    rig(540, 566, 0.5);
    const yWell = crustY0 + (crustY1 - crustY0) * (12 / 35);
    line(540, crustY0, 540, yWell, 8, PAL.red);
    const lbl = seg(t, w('l03', 'delemedik') - 0.4, 0.4);
    if (lbl > 0) { line(560, yWell, 700, yWell, 4, '#F4EFE3'); text('12 km', 790, yWell + 12, 40, '#F6D77A'); line(980, crustY0, 980, crustY1, 5, '#F4EFE3'); text('35 km', 900, (crustY0 + crustY1) / 2, 40, '#F4EFE3'); }
  };
  // 3 · merkez 6.371 km: bütün Dünya, ok merkeze; kuyu kıl kadar (doruk)
  scenes[3] = t => {
    bg('#1E2A3A'); const r = mulberry32(3); for (let i = 0; i < 60; i++) circ(-300 + r() * 1700, 200 + r() * 1100, 2 + r() * 3, '#F4EFE3', 0);
    const k = ease.enter(seg(t, w('l03', 25) - 0.2, 0.8));
    earthCut(540, 900, 360, true);
    const ay = lerp(540, 900, ease.state(seg(t, w('l03', 'merkezi') - 0.2, 1.4)));
    line(560, 540, 560, ay, 8, '#F4EFE3'); if (ay > 560) poly([[546, ay - 20], [574, ay - 20], [560, ay]], '#F4EFE3', 3);
    ctx.save(); ctx.globalAlpha = k; line(540, 540, 540, 543, 6, PAL.red); ctx.restore();
  };
  // 4 · 180 °C: kızaran matkap ucu, termometre
  scenes[4] = t => {
    bg('#3A2A20');
    const heat = ease.enter(seg(t, w('l05', 4) - 0.3, 0.8));
    rect(-900, 300, 2900, 1000, '#5A3E2A', 0); for (let i = 0; i < 8; i++) { const y = 360 + i * 110; line(-900, y, 2000, y + 30, 6, '#6A4A32'); }
    rect(470, 280, 140, 600, '#8C9298', LW, 8);
    const glow = `rgb(${Math.round(lerp(140, 230, heat))},${Math.round(lerp(146, 90, heat))},${Math.round(lerp(152, 40, heat))})`;
    poly([[470, 880], [610, 880], [580, 980 + 6 * Math.sin(t * 20) * heat], [540, 1040], [500, 980]], glow, LW);
    const stop = seg(t, w('l05', 'ilerleyemedi') - 0.2, 0.4);
    if (stop > 0) for (let i = 0; i < 6; i++) { const u = (t * 0.8 + i * 0.17) % 1; ctx.save(); ctx.globalAlpha = 0.5 * (1 - u); circ(520 + i * 12, 860 - u * 300, 20 + u * 30, '#C9C4BC', 0); ctx.restore(); }
    rect(820, 420, 70, 560, '#F4EFE3', LW, 35); const h = 480 * heat; rect(834, 960 - h, 42, h, PAL.red, 0, 20); circ(855, 990, 56, PAL.red, LW);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 940, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.4, 520, 880, 0)],
    [T.l02end, ...P(2.4, 520, 760, 0)],
    ...cut(T.l03 - 0.15, P(2.4, 520, 760, 0), P(1.0, 540, 900, 1)),
    [w('l03', 'sürdü') + 0.3, ...P(1.04, 540, 920, 1)],
    ...cut(w('l03', 'ama') - 0.15, P(1.04, 540, 920, 1), P(1.0, 540, 900, 2)),
    [w('l03', 'delemedik') + 0.3, ...P(1.03, 560, 900, 2)],
    ...cut(w('l03', 25) - 0.15, P(1.03, 560, 900, 2), P(1.0, 540, 900, 3)),
    [hero(T), ...P(1.0, 540, 900, 3)],
    ...cut(T.l05 - 0.15, P(1.0, 540, 900, 3), P(1.0, 600, 860, 4)),
    [T.l05end + 0.2, ...P(1.06, 600, 860, 4)],
    ...cut(T.l06 - 0.15, P(1.06, 600, 860, 4), P(1.04, 540, 940, 0)),
    [T.loop0, ...P(1.02, 540, 940, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ["Dünya'nın merkezine", 'ne kadar indik?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[T.l02 - 0.1, T.l03 - 0.3, '%0,19', 'MERKEZE GİDEN YOLUN'], [w('l03', 'kola') - 0.1, w('l03', 'ama') - 0.3, '12.262 m', 'KOLA KUYUSU · 1989'], [w('l03', 'otuz') - 0.1, w('l03', 25) - 0.3, '35 km', 'KITA KABUĞU'], [w('l03', 28) - 0.1, T.l05 - 0.3, '6.371 km', 'MERKEZ'], [w('l05', 4) - 0.1, T.l06 - 0.3, '180 °C', 'KUYUNUN DİBİ']],
  };
}

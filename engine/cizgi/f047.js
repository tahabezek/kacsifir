// № 047 · İnsanlık bir şeker küpü (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: çay masasında, tabağın üstünde "8 MİLYAR" yazan küçük şeker küpü. Doruk: o küp yaklaşık 500 milyon ton;
// vinç kaldıramaz, çaya düşünce bardağın dibini deler. Sahneler 1400 px arayla; kamera [t, zoom, x, y].

const SX = 1400;
export function hero(T) { return T.w('l05', 'ton') + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'çekirdek') - 0.3, w('l03', 'çekirdek')], [w('l03', 19) - 0.3, w('l03', 19)], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'bezelye'), w('l03', 'stadyumdan'), w('l03', 'küçük')],
    thock: [w('l06', 'delinir')],
    scratch: [[w('l03', 19), w('l03', 'kalan'), 0.02]],
    riser: [T.l05 - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk', name: 'Çocuk', seed: 471,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#C2412F', shade: '#9E3324' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#C2412F', shade: '#9E3324', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#2A1E16',
  features: ['hoodie', 'hairMessy'],
});
const DEDE = base({
  key: 'dede', name: 'Dede', seed: 472,
  head: { w: 0.9, h: 1.04, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.86, shoulder: 0.7, hip: 0.6, depth: 0.46, belly: 0.1, color: '#5A6A4A', shade: '#45523A' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#5A6A4A', shade: '#45523A', hand: 0.12 },
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

  // ince belli çay bardağı (tabaklı); k ölçek; broken: dibi delik
  const teaGlass = (x, y, k, broken = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ell(0, 0, 120, 24, '#E8E2D4', LW);
    const body = [[-62, -250], [-58, -170], [-34, -110], [-56, -40], [-48, -6], [48, -6], [56, -40], [34, -110], [58, -170], [62, -250]];
    poly(body, '#B4521E', LW);
    poly([[-62, -250], [62, -250], [58, -222], [-58, -222]], '#F2EBDD', 4);
    ctx.save(); ctx.globalAlpha = 0.35; line(-40, -200, -30, -120, 8, '#FFF3E0'); ctx.restore();
    if (broken > 0) { poly([[-30, -6], [-12, -30], [4, -8], [18, -32], [30, -6]], '#1F2421', 0); for (let i = 0; i < 4; i++) { const u = broken; poly([[-20 + i * 12, 10 + u * 120 + i * 14], [-8 + i * 12, 4 + u * 120 + i * 14], [-12 + i * 12, 22 + u * 120 + i * 14]], '#B4521E', 3); } }
    ctx.restore();
  };
  const sugar = (x, y, s, label = '') => {
    poly([[x, y - s], [x + s * 0.28, y - s * 1.18], [x + s * 1.28, y - s * 1.18], [x + s, y - s]], '#FFFFFF', LW);
    poly([[x + s, y], [x + s, y - s], [x + s * 1.28, y - s * 1.18], [x + s * 1.28, y - s * 0.18]], '#E2DDD2', LW);
    rect(x, y - s, s, s, '#F7F4EC', LW);
    const r = mulberry32(Math.round(s)); ctx.fillStyle = 'rgba(31,36,33,0.25)'; for (let i = 0; i < 14; i++) ctx.fillRect(x + r() * s * 0.9, y - s + r() * s * 0.9, 4, 4);
    if (label) text(label, x + s / 2, y - s / 2 + s * 0.08, Math.max(14, s * 0.2), PAL.red);
  };
  const TY = 1250;   // masa üstü
  const table = () => { rect(-900, TY, 2900, 40, '#8A5A3A', LW, 6); rect(-900, TY + 40, 2900, 900, '#6A4A2E', 0); };
  const room = () => { bg('#EFE6D8'); rect(-900, 300, 2900, 20, '#D8CBB6', 0); rect(700, 380, 260, 300, '#BFD6DC', LW, 8); line(830, 380, 830, 680, LW); line(700, 530, 960, 530, LW); };
  // atom: çekirdek (bezelye) + elektron yörüngeleri; r yörünge yarıçapı
  const atom = (x, y, r, t, nucleus = 10) => {
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate(i * 1.05 + 0.3); ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.38, 0, 0, 7); ctx.lineWidth = Math.max(2, r * 0.025); ctx.strokeStyle = '#2E4A6B'; ctx.stroke(); const a = t * (2 + i) + i * 2; circ(Math.cos(a) * r, Math.sin(a) * r * 0.38, Math.max(4, r * 0.05), '#3F7FB5', 2); ctx.restore(); }
    circ(x, y, nucleus, '#6AAE4E', Math.max(2, nucleus * 0.25));
  };
  const person = (x, y, s, c, sk) => { rect(x - 0.5 * s, y - 1.2 * s, s, 1.2 * s, c, Math.max(2, s * 0.12), s * 0.3); circ(x, y - 1.55 * s, 0.4 * s, sk, Math.max(2, s * 0.12)); };

  const scenes = [];
  // 0 · kanca: çay masası, tabakta "8 MİLYAR" şeker küpü; çocuk ve dede bakıyor
  scenes[0] = t => {
    t = loopT(t);
    room();
    ch(COCUK, { x: 200, y: GY + 40, s: 150, expr: 'saskin', head: { look: [0.6, 0.4] } }, t);
    ch(DEDE, { x: 890, y: GY + 40, s: 152, expr: 'mutlu', head: { look: [-0.6, 0.4] } }, t);
    table();
    teaGlass(370, TY, 0.8);
    ell(640, TY - 10, 150, 24, '#E8E2D4', LW);
    const bob = 4 * Math.sin((2 * Math.PI * t) / D * 5);
    sugar(560, TY - 20 + bob, 150, '8 MİLYAR');
  };
  // 1 · vücut atomlardan; atomun neredeyse tamamı boşluk
  scenes[1] = t => {
    bg('#F4EFE3');
    ch(COCUK, { x: 260, y: GY, s: 150, expr: 'saskin', armR: { sh: 70, el: 60 }, head: { look: [0.6, -0.2] } }, t);
    const u = ease.enter(seg(t, T.l03 + 0.3, 1.0));
    circ(430, 900, 30 + 4 * Math.sin(t * 4), null, 5);
    line(455, 880, 620, 760, 4);
    circ(780, 760, 220 * u + 1, '#FFFFFF', LW);
    if (u > 0.5) atom(780, 760, 180, t, 8);
    if (t > w('l03', 'boşluk') - 0.2) { rect(640, 1020, 280, 90, PAL.paper, LW, 14); text('%99,9…', 780, 1085, 52, PAL.red); }
  };
  // 2 · bezelye çekirdek, stadyum büyüklüğünde atom
  scenes[2] = t => {
    bg('#BFD6DC'); rect(-900, 1100, 2900, 1200, '#5E9A4E', 0);
    const st = ease.enter(seg(t, w('l03', 'stadyumdan') - 0.3, 0.8));
    ell(540, 1100, 520, 220, '#7FA36A', LW); ell(540, 1100, 470, 180, '#5E9A4E', LW);
    for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; rect(540 + Math.cos(a) * 505 - 6, 1100 + Math.sin(a) * 210 - 30, 12, 30, '#D8CBB6', 2); }
    ctx.save(); ctx.globalAlpha = st; for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(540, 1100); ctx.rotate(i * 1.05); ctx.beginPath(); ctx.ellipse(0, 0, 560, 210, 0, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = '#2E4A6B'; ctx.stroke(); ctx.restore(); } ctx.restore();
    const pea = seg(t, w('l03', 'bezelye') - 0.2, 0.4);
    circ(540, 1100, 22 * ease.enter(pea) + 0.5, '#6AAE4E', 5);
    if (pea > 0) { line(560, 1080, 700, 900, 4); rect(640, 820, 240, 80, PAL.paper, LW, 12); text('BEZELYE', 760, 875, 40, '#3A6A2A'); }
    ch(DEDE, { x: 120, y: 1300, s: 70, expr: 'saskin', head: { look: [0.6, 0] } }, t);
  };
  // 3 · 8 milyar insan sıkışıp küçük bir küpe dönüşür
  const squeeze = t => ease.state(seg(t, w('l03', 'boşluğu') - 0.2, w('l03', 'küçük') + 0.2 - w('l03', 'boşluğu')));
  scenes[3] = t => {
    bg('#E9DFC9'); rect(-900, GY, 2900, 900, '#CDBFA8', 0); line(-900, GY, 2000, GY, LW);
    const k = squeeze(t), r = mulberry32(8);
    const cols = ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E', '#7A4E8A', '#D8722E'], skins = ['#F2C9A5', '#D9A27A', '#B8805A', '#8A5A3A'];
    for (let i = 0; i < 180; i++) { const x0 = 40 + r() * 1000, y0 = 520 + r() * 820, c = cols[Math.floor(r() * 6)], sk = skins[Math.floor(r() * 4)]; const x = lerp(x0, 540, k), y = lerp(y0, 1220, k), s = lerp(22, 2, k); if (k < 0.97) person(x, y, s, c, sk); }
    if (k > 0.85) sugar(540 - 40, GY - 40, 80 * ease.enter((k - 0.85) / 0.15));
  };
  // 4 · iki küp yan yana: insanlık (2,2 cm³) < şeker (4 cm³)
  scenes[4] = t => {
    bg('#F4EFE3'); rect(-900, GY, 2900, 900, '#D8CBB6', 0); line(-900, GY, 2000, GY, LW);
    sugar(170, GY, 320, ''); text('ŞEKER', 330, GY - 400, 54, A.INK);
    const k = ease.enter(seg(t, w('l03', 'kalan') - 0.2, 0.6));
    sugar(640, GY, 260 * k + 1, ''); if (k > 0.8) { text('İNSANLIK', 770, GY - 340, 54, PAL.red); }
  };
  // 5 · 500 milyon ton: vinç küpü kaldıramaz, halat kopar, zemin çöker
  scenes[5] = t => {
    bg('#BFD6DC'); rect(-900, GY, 2900, 900, '#B8B0A0', 0); line(-900, GY, 2000, GY, LW);
    rect(140, 360, 40, 1000, '#E2B13C', LW); rect(140, 360, 700, 40, '#E2B13C', LW); for (let i = 0; i < 9; i++) line(160 + i * 75, 360, 200 + i * 75, 400, 4);
    rect(90, 1250, 140, 110, '#6A5A48', LW, 8);
    const snap = seg(t, w('l05', 'ton') - 0.4, 0.3), sink = ease.enter(seg(t, w('l05', 'ton') - 0.2, 0.8));
    const cy = GY - 6 + sink * 40;
    if (snap < 1) line(760, 400, 760, cy - 100 - 20 * Math.sin(t * 30) * (1 - snap), 6);
    else { line(760, 400, 760, 640 - 40 * Math.sin(t * 6), 6); }
    if (sink > 0) { poly([[600, GY], [660, GY + 50 * sink], [860, GY + 50 * sink], [920, GY]], '#7A6A58', LW); for (let i = 0; i < 6; i++) line(620 + i * 50, GY + 10, 600 + i * 60 - 30, GY - 40 * sink, 4); }
    sugar(710, cy, 100, '');
    ch(COCUK, { x: 400, y: GY, s: 100, expr: sink > 0 ? 'saskin' : 'notr', head: { look: [0.6, 0] } }, t);
  };
  // 6 · çaya düşen küp bardağın dibini deler (aynı masa)
  scenes[6] = t => {
    room();
    ch(COCUK, { x: 200, y: GY + 40, s: 150, expr: t > w('l06', 'delinir') ? 'saskin' : 'mutlu', head: { look: [0.6, 0.4] } }, t);
    ch(DEDE, { x: 890, y: GY + 40, s: 152, expr: 'mutlu', armR: { sh: 60, el: 70 }, head: { look: [-0.6, 0.4] } }, t);
    table();
    const drop = seg(t, w('l06', 'çaya') - 0.1, w('l06', 'delinir') - w('l06', 'çaya') + 0.2), brk = seg(t, w('l06', 'delinir') - 0.05, 0.6);
    teaGlass(540, TY, 1.0, brk);
    if (brk <= 0) sugar(510, lerp(640, TY - 30, drop * drop), 50, '');
    else sugar(510, TY + 60 + brk * 260, 50, '');
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.22, 560, 1090, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.25, 600, 1100, 0)],
    [T.l02end, ...P(1.5, 640, 1130, 0)],
    ...cut(T.l03 - 0.15, P(1.5, 640, 1130, 0), P(1.0, 540, 940, 1)),
    [w('l03', 'boşluk') + 0.3, ...P(1.1, 620, 900, 1)],
    ...cut(w('l03', 'çekirdek') - 0.15, P(1.1, 620, 900, 1), P(2.4, 540, 1080, 2)),
    [w('l03', 'stadyumdan') - 0.3, ...P(2.0, 560, 1060, 2)],
    [w('l03', 'olurdu') + 0.2, ...P(0.92, 540, 1050, 2)],
    ...cut(w('l03', 19) - 0.15, P(0.92, 540, 1050, 2), P(0.95, 540, 960, 3)),
    [w('l03', 'kalan') - 0.16, ...P(1.05, 540, 1060, 3)],
    ...cut(w('l03', 'kalan') - 0.15, P(1.05, 540, 1060, 3), P(1.0, 540, 1200, 4)),
    [T.l04end + 0.1, ...P(1.06, 540, 1200, 4)],
    ...cut(T.l05 - 0.15, P(1.06, 540, 1200, 4), P(0.95, 520, 1150, 5)),
    [hero(T), ...P(1.05, 560, 1200, 5)],
    ...cut(T.l06 - 0.15, P(1.05, 560, 1200, 5), P(1.15, 540, 1080, 6)),
    [T.l07end + 0.2, ...P(1.2, 540, 1090, 6)],
    [T.loop0 - 0.001, ...P(1.2, 540, 1090, 6)],
    [T.loop0, ...P(1.15, 545, 1080, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Bütün insanlık', 'bir şekere sığar mı?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 'kalan') - 0.1, T.l04end + 0.1, '2,2 cm³', 'İNSANLIK · ŞEKER 4 cm³'], [w('l05', 'yaklaşık') - 0.1, T.l06 - 0.3, '515 mn', 'TON · BÜTÜN İNSANLIK']],
  };
}

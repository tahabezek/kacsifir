// № 043 · Demir çubuk ve balina (çizgi motoru, iki sesli Hangisi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: demir çubuğunu tutan Phineas Gage (1848 dagerreyotipinin çizgi karşılığı). A: patlama, çubuk 25 m öteye uçar
// (kafadan geçiş kansız ve soyut: yalnızca uçan çubuk ve yıldız), Gage oturup konuşur. B: balinanın ağzında Packard.
// Doruk: balina yüzeye çıkar ve Packard'ı tükürür.

const SX = 1400;
export function hero(T) { return T.w('l07', 'tükürüyor') + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 32) - 0.3, w('l03', 32)], [T.l05 - 0.3, T.l05], [T.l07 - 0.3, T.l07], [w('l07', 37) - 0.3, w('l07', 37)], [T.l08 - 0.3, T.l08], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'sıkıştırıyor'), w('l03', 41)],
    rumble: [[w('l03', 15), 0.6], [w('l07', 17), 0.4]],
    thock: [w('l03', 31)],
    scratch: [[w('l07', 37), hero(T), 0.02]],
    riser: [w('l07', 37) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const GAGE = base({
  key: 'gage', name: 'Phineas Gage', seed: 431,
  torso: { len: 0.82, shoulder: 0.68, hip: 0.54, depth: 0.42, belly: 0, color: '#5A4A3A', shade: '#463A2D' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#E9E2D2', shade: '#CFC6B2', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#3A3A44', shade: '#2A2A34' },
  shoe: { color: '#2A1E17', len: 0.3, h: 0.11 },
  skin: '#EBC4A0', skinShade: '#D2A782', hair: '#4A3426',
  features: ['vest', 'hairSlick'],
});
const PACKARD = base({
  key: 'packard', name: 'Michael Packard', seed: 432,
  head: { w: 0.96, h: 1, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.84, shoulder: 0.72, hip: 0.6, depth: 0.46, belly: 0.08, color: '#1F2421', shade: '#141816' },
  arm: { upper: 0.4, lower: 0.38, w: 0.2, color: '#1F2421', shade: '#141816', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.21, color: '#1F2421', shade: '#141816' },
  shoe: { color: '#2E6A8A', len: 0.42, h: 0.1 },
  skin: '#E2B08A', skinShade: '#C9966F', hair: '#9A9590',
  features: ['baldSides'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const ROD = '#5A5E66';

  const rod = (x0, y0, x1, y1) => { line(x0, y0, x1, y1, 22, '#1F2421'); line(x0, y0, x1, y1, 12, ROD); };
  const rails = () => { rect(-500, GY, 2080, 900, '#A8946E', 0); line(-500, GY, 1580, GY, LW); for (let i = -6; i < 20; i++) rect(i * 110, GY + 40, 70, 26, '#6A4A2E', 4, 4); line(-500, GY + 46, 1580, GY + 46, 10, '#7A7E86'); line(-500, GY + 64, 1580, GY + 64, 10, '#7A7E86'); };
  const star = (x, y, r, k = 1) => { ctx.save(); ctx.translate(x, y); ctx.globalAlpha = k; const pts = []; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r * 0.45 : r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } poly(pts, '#F6C445', 6); ctx.restore(); };
  const whaleHead = (x, y, s, open, t) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const o = open * 0.5;
    ctx.save(); ctx.rotate(-o); poly([[-40, 0], [520, -60], [560, -10], [500, 30], [-40, 30]], '#3A4A5A', LW); for (let i = 0; i < 6; i++) line(40 + i * 70, -20 - i * 6, 80 + i * 70, -26 - i * 6, 5, '#5A6A7A'); circ(420, -40, 12, '#1F2421', 0); ctx.restore();
    ctx.save(); ctx.rotate(o * 0.6); poly([[-40, 30], [480, 30], [520, 70], [440, 140], [-40, 120]], '#4A5A6A', LW); for (let i = 0; i < 7; i++) line(20 + i * 64, 90, 40 + i * 64, 130, 6, '#E9E2D2'); ctx.restore();
    ctx.restore();
  };

  const scenes = [];
  // 0 · kanca: demir çubuğunu tutan Gage, arkada ray
  scenes[0] = t => {
    t = loopT(t);
    bg('#D9C9A8'); rails();
    rect(140, 660, 200, 260, '#8A7A5A', LW, 8); rect(160, 680, 160, 220, '#E9DFC9', 4, 4); text('1848', 240, 820, 44, '#5A4A3A');
    ch(GAGE, { x: 600, y: GY, s: 150, expr: 'notr', armR: { sh: 40, el: -30 }, head: { tilt: 4 * Math.sin(2 * Math.PI * t / D * 2), look: [-0.2, 0] } }, t);
    rod(760, 860, 800, 1340);
    rect(830, 1120, 200, 100, PAL.paper, LW, 14); text('6 kg', 930, 1190, 56, PAL.red);
  };
  // 1 · patlama: barutu sıkıştırır, çubuk uçar (kansız), Gage oturur, sonra yürür
  scenes[1] = t => {
    bg('#D9C9A8'); rails();
    poly([[-300, GY], [-120, GY - 320], [180, GY - 360], [330, GY]], '#9A8668', LW);
    const boom = w('l03', 15), fly = seg(t, boom, 1.2), afterB = t > boom;
    const tamp = afterB ? 0 : Math.max(0, Math.sin(t * 6)) * 20;
    if (!afterB) { ch(GAGE, { x: 600, y: GY, s: 140, view: 'side', facing: -1, lean: 18, armL: { sh: 120, el: 30 }, armR: { sh: 110, el: 40 }, expr: 'notr' }, t); rod(390, 1000 + tamp, 410, 1330 + tamp); }
    else if (t < w('l03', 32) - 0.2) { ch(GAGE, { x: 640, y: GY, s: 140, legL: { hip: 85, knee: 90 }, legR: { hip: 80, knee: 85 }, armL: { sh: 40, el: 20 }, armR: { sh: 140, el: 100 }, expr: 'saskin' }, t); }
    else { const walk = seg(t, w('l03', 37), 2.0); ch(GAGE, { x: lerp(640, 820, walk), y: GY, s: 140, walk: walk > 0 && walk < 1 ? (t * 1.2) % 1 : undefined, view: walk > 0 && walk < 1 ? 'side' : 'front', facing: 1, talk: talk(t, w('l03', 33), w('l03', 36) + 0.4), expr: 'mutlu' }, t); }
    if (afterB && fly < 1) { const x = lerp(420, 1300, fly), y = lerp(1000, 1200, fly) - Math.sin(fly * Math.PI) * 700; ctx.save(); ctx.translate(x, y); ctx.rotate(fly * 9); rod(-150, 0, 150, 0); ctx.restore(); }
    if (afterB && fly >= 1) { rod(1180, GY - 8, 1420, GY - 30); }
    const fl = seg(t, boom - 0.05, 0.15) * (1 - seg(t, boom + 0.25, 0.5)); if (fl > 0) { star(420, 1080, 220, fl); }
    if (t > w('l03', 27) - 0.1) { line(420, GY + 130, 1300, GY + 130, 8, PAL.red); line(420, GY + 110, 420, GY + 150, 8, PAL.red); line(1300, GY + 110, 1300, GY + 150, 8, PAL.red); rect(760, GY + 150, 200, 80, PAL.paper, LW, 12); text('25 m', 860, GY + 210, 48, PAL.red); }
  };
  // 2 · deniz altı: dalgıç, karanlık, balinanın ağzı, yüzey ve tükürme
  scenes[2] = t => {
    const dark = seg(t, w('l07', 17) - 0.3, 0.4), spit = seg(t, w('l07', 37) - 0.1, w('l07', 'tükürüyor') - w('l07', 37) + 1.0);
    bg(spit > 0.4 ? '#BFD6DC' : '#2E6A8A');
    if (spit <= 0.4) { ctx.save(); ctx.globalAlpha = 0.25; for (let i = 0; i < 6; i++) poly([[i * 220 - 100, -300], [i * 220 + 20, -300], [i * 220 + 160, 1600], [i * 220 + 40, 1600]], '#8FD3D8', 0); ctx.restore(); }
    if (spit > 0.4) { rect(-500, 1100, 2080, 1200, '#2E6A8A', 0); line(-500, 1100, 1580, 1100, LW); }
    const inMouth = dark > 0 && spit < 0.55;
    if (!inMouth && spit <= 0) { const sw = Math.sin(t * 3); rect(760, 1130, 220, 110, PAL.paper, LW, 14); text('14 m', 870, 1210, 64, PAL.red); ctx.save(); ctx.translate(560, 960); ctx.rotate(-1.35); ch(PACKARD, { x: 0, y: 0, s: 150, armL: { sh: 150 + 15 * sw, el: 20 }, armR: { sh: 150 - 15 * sw, el: 20 }, legL: { hip: 10 * sw, knee: 20 }, legR: { hip: -10 * sw, knee: 20 }, expr: 'notr' }, t); ctx.restore(); }
    if (dark > 0 && spit <= 0) {
      ctx.save(); ctx.globalAlpha = dark; ctx.fillStyle = '#0B1118'; ctx.fillRect(-500, -500, 2080, 2900); ctx.restore();
      if (dark >= 1) { const br = 0.5 + 0.5 * Math.sin(t * 1.6); ell(540, 380 + 20 * br, 900, 360, '#3A4A5A', LW); for (let i = 0; i < 22; i++) { const x = 90 + i * 42; line(x, 300 + 20 * br, x + 6, 560 + 20 * br - Math.abs(i - 11) * 6, 8, '#C9BFA8'); } ell(540, 1520, 820, 300, '#B85A6A', LW); }
      if (dark >= 1) { ch(PACKARD, { x: 540, y: 1300, s: 150, armL: { sh: 120, el: 120 }, armR: { sh: 120, el: 120 }, legL: { hip: 60, knee: 80 }, legR: { hip: 55, knee: 80 }, expr: 'korku' }, t); for (let i = 0; i < 3; i++) { const yy = 860 - ((t * 120 + i * 60) % 220); circ(590 + i * 12, yy, 16 - i * 4, '#C9E6EA', 4); } }
      if (t > w('l07', 27) - 0.1) { rect(690, 620, 320, 130, PAL.paper, LW, 14); text('30–40 sn', 850, 705, 60, PAL.red); }
    }
    if (spit > 0) {
      whaleHead(-260, 1120, 2.2, ease.enter(Math.min(1, spit * 1.8)), t);
      const u = seg(spit, 0.45, 0.5); const x = lerp(700, 960, u), y = lerp(1060, 820, u) - Math.sin(u * Math.PI) * 260;
      if (spit > 0.45) { ctx.save(); ctx.translate(x, y); ctx.rotate(u * 3); ch(PACKARD, { x: 0, y: 0, s: 90, armL: { sh: 160, el: 10 }, armR: { sh: 160, el: 10 }, expr: 'saskin' }, t); ctx.restore(); for (let i = 0; i < 8; i++) circ(820 + i * 30, 1100 - (i % 3) * 30 * u, 14, '#F4F1EA', 4); }
    }
  };
  // 3 · seçim: Gage ve Packard yan yana
  scenes[3] = t => {
    bg('#ECE5D5'); rect(-500, GY, 2080, 900, '#D8CBB6', 0); line(-500, GY, 1580, GY, LW);
    ch(GAGE, { x: 300, y: GY, s: 140, expr: 'mutlu', armR: { sh: 40, el: -30 } }, t); rod(450, 900, 480, 1340);
    ch(PACKARD, { x: 790, y: GY, s: 140, expr: 'mutlu', armL: { sh: 120, el: 20 } }, t);
    const pick = t > w('l08', 1) - 0.1; if (pick) { const k = ease.enter(seg(t, w('l08', 1) - 0.1, 0.3)); ctx.save(); ctx.translate(300, 720 - 30 * k); ctx.rotate(-0.06); rect(-120, -50, 240, 100, PAL.paper, LW, 12); text('GAGE', 0, 25, 64, PAL.red); ctx.restore(); }
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.4, 640, 1020, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.45, 640, 1020, 0)],
    [T.l02end + 0.1, ...P(1.7, 640, 960, 0)],
    ...cut(T.l03 - 0.15, P(1.7, 640, 960, 0), P(1.25, 520, 1040, 1)),
    [w('l03', 15), ...P(1.25, 540, 1000, 1)],
    [w('l03', 31), ...P(0.85, 760, 960, 1)],
    [w('l03', 33), ...P(1.3, 720, 1040, 1)],
    [T.l04end + 0.2, ...P(1.35, 780, 1060, 1)],
    ...cut(T.l05 - 0.15, P(1.35, 780, 1060, 1), P(1.0, 560, 1040, 2)),
    [w('l07', 17) - 0.3, ...P(1.05, 560, 1000, 2)],
    [w('l07', 37), ...P(1.0, 560, 1000, 2)],
    [hero(T), ...P(0.95, 600, 980, 2)],
    ...cut(T.l08 - 0.15, P(0.95, 600, 980, 2), P(1.2, 540, 1060, 3)),
    [T.loop0 - 0.001, ...P(1.26, 540, 1060, 3)],
    [T.loop0, ...P(1.42, 640, 1020, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 8) - 0.1, w('l03', 15) - 0.3, 'PHINEAS GAGE', 'ABD · 1848 · demiryolu ustabaşı'], [w('l07', 7) - 0.1, w('l07', 17) - 0.3, 'MICHAEL PACKARD', 'ABD · 2021 · ıstakoz dalgıcı']],
    numbers: [[w('l03', 41) - 0.1, T.l04 + 0.4, '12 yıl', 'KAZADAN SONRA']],
  };
}

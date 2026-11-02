// № 064 · Damlayı hiç göremeyen adam ve 1840'tan beri çalan zil (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: cam fanus altındaki huni ve yanında bekleyen John Mainstone. A'nın ters köşesi: o öldükten birkaç ay sonra damla düşer.
// Doruk: tek bir zift damlası düşene kadar zil 560 milyon kez çalar (sayaç).

const SX = 1400;
const base = (o) => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const MAINSTONE = base({
  key: 'mainstone', name: 'John Mainstone', seed: 641,
  head: { w: 0.9, h: 1.04, ear: 0.12 }, neck: 0.08,
  torso: { len: 0.9, shoulder: 0.72, hip: 0.62, depth: 0.46, belly: 0.08, color: '#8A6A48', shade: '#6E5236' },
  arm: { upper: 0.42, lower: 0.4, w: 0.18, color: '#8A6A48', shade: '#6E5236', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#4A4A50', shade: '#38383D' },
  shoe: { color: '#2A221C', len: 0.3, h: 0.11 },
  skin: '#ECC6A2', skinShade: '#D4AA84', hair: '#C9C4BC',
  eyes: { gap: 0.32, w: 0.17, h: 0.21, y: 0.04, lid: 0.22 },
  features: ['cardigan', 'baldSides', 'glassesRect'],
});

export function hero(T) { return T.l08end + 0.1; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'con') - 0.3, w('l03', 'con')], [w('l03', 27) - 0.3, w('l03', 27)], [w('l03', 38) - 0.3, w('l03', 38)], [w('l03', 49) - 0.3, w('l03', 49)], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [w('l08', 'pillerin') - 0.3, w('l08', 'pillerin')], [w('l08', 34) - 0.3, w('l08', 34)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'kırılıyor'), w('l03', 'düşüyor'), w('l03', 'düşmüş'), w('l05', 'düşüyor')],
    thock: [w('l03', 'çekiçle') + 0.3],
    rumble: [[w('l03', 'elektrik'), 0.3]],
    scratch: [[w('l08', 34), hero(T), 0.02]],
    riser: [w('l08', 34) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const sitSide = (f = 1) => ({ view: 'side', facing: f, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 28, el: 50 }, armR: { sh: 34, el: 56 } });
  const lab = () => { bg('#D8D2C4'); rect(-400, 1300, 1880, 900, '#B9AE98', 0); line(-400, 1300, 1480, 1300, LW); for (let i = 0; i < 4; i++) rect(-300 + i * 520, 560, 220, 160, '#C9C2B2', 5, 8); };
  // fanuslu huni: (x, y) huninin ağzı; drop: 0..1 damlanın uzaması, fall: 0..1 düşüş
  const funnel = (x, y, drop = 0.3, fall = 0) => {
    rect(x - 150, y + 470, 300, 30, '#6A4A2E', LW, 6); rect(x - 20, y + 500, 40, 160, '#6A4A2E', LW);
    ctx.save(); ctx.globalAlpha = 0.25; rect(x - 130, y - 140, 260, 610, '#E8F2F4', 0, 60); ctx.restore(); rect(x - 130, y - 140, 260, 610, null, 5, 60);
    poly([[x - 90, y], [x + 90, y], [x + 14, y + 130], [x - 14, y + 130]], '#1F2421', LW); rect(x - 14, y + 130, 28, 110, '#1F2421', LW, 4);
    const dl = 30 + 70 * drop;
    if (fall <= 0) { ell(x, y + 240 + dl / 2, 16, dl / 2, '#1F2421', 4); }
    else { const fy = y + 260 + fall * 130; ell(x, Math.min(fy, y + 400), 14, 22, '#1F2421', 4); }
    rect(x - 60, y + 400, 120, 70, null, 5, 8); ctx.save(); ctx.globalAlpha = 0.25; rect(x - 60, y + 400, 120, 70, '#E8F2F4', 0, 8); ctx.restore();
    ell(x, y + 462, 40, 8, '#1F2421', 0);
  };
  const tea = (x, y) => { poly([[x - 16, y], [x + 16, y], [x + 10, y + 46], [x - 10, y + 46]], '#B4521E', 4); ell(x, y + 48, 24, 6, '#E8E2D4', 4); };
  // zil düzeneği: iki pil sütunu, iki zil, aralarında top
  const bells = (x, y, t, run = true) => {
    rect(x - 210, y + 300, 420, 40, '#6A4A2E', LW, 8);
    ctx.save(); ctx.globalAlpha = 0.25; rect(x - 190, y - 140, 380, 440, '#E8F2F4', 0, 90); ctx.restore(); rect(x - 190, y - 140, 380, 440, null, 5, 90);
    for (const s of [-1, 1]) { rect(x + s * 95 - 22, y - 40, 44, 340, '#D9C7A0', LW, 8); for (let k = 0; k < 6; k++) line(x + s * 95 - 20, y + k * 50, x + s * 95 + 20, y + k * 50, 3, '#9C8A64'); poly([[x + s * 95 - 40, y + 60], [x + s * 95 + 40, y + 60], [x + s * 95 + 26, y + 10], [x + s * 95 - 26, y + 10]], PAL.gold, LW); }
    const bx = x + (run ? Math.sin(t * Math.PI * 4) : 0) * 48; line(x, y - 60, bx, y + 50, 3); circ(bx, y + 50, 16, '#8C9298', 4);
  };

  const scenes = [];
  // 0 · laboratuvar: fanuslu huni, sandalyede bekleyen Mainstone (kanca)
  scenes[0] = t => {
    t = loopT(t);
    lab();
    funnel(700, 640, 0.3 + 0.08 * Math.sin(t * 0.8));
    rect(250, 1160, 200, 26, '#7A5634', LW, 6); line(270, 1186, 270, 1360, 8); line(430, 1186, 430, 1360, 8); rect(250, 980, 26, 190, '#7A5634', LW, 4);
    ch(MAINSTONE, { x: 350, y: 1170, s: S, ...sitSide(1), expr: 'yorgun', head: { tilt: -4, look: [0.7, -0.2] }, armR: { sh: 40, el: 70 } }, t);
  };
  // 1 · zift kırılır ama akar
  scenes[1] = t => {
    lab(); rect(180, 1150, 720, 40, '#7A5634', LW, 6); rect(220, 1190, 640, 170, '#6A4A2E', LW, 6);
    const hit = seg(t, w('l03', 'çekiçle') - 0.1, 0.25), flow = t > w('l03', 'ama') - 0.2;
    if (!flow) {
      if (hit < 1) poly([[420, 1150], [640, 1150], [610, 1060], [450, 1070]], '#1F2421', LW);
      else { const r = mulberry32(7); for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = 60 + r() * 120; poly([[530 + Math.cos(a) * d, 1140 - Math.abs(Math.sin(a)) * d * 0.6], [560 + Math.cos(a) * d, 1150 - Math.abs(Math.sin(a)) * d * 0.6], [540 + Math.cos(a) * d, 1120 - Math.abs(Math.sin(a)) * d * 0.6]], '#1F2421', 3); } }
      const ang = lerp(-1.4, 0.2, ease.enter(hit)); ctx.save(); ctx.translate(760, 980); ctx.rotate(ang); rect(-14, -10, 28, 240, '#8A5A3A', LW, 6); rect(-70, -60, 140, 60, '#5A6068', LW, 8); ctx.restore();
    } else {
      funnel(540, 640, 0.25 + 0.75 * seg(t, w('l03', 'ama'), w('l03', 'düşüyor') - w('l03', 'ama')), seg(t, w('l03', 'düşüyor'), 0.5));
      if (t > w('l03', 'dokuz') - 0.2) { rect(180, 700, 220, 140, PAL.paper, LW, 12); text('9 YIL', 290, 795, 64, PAL.red); }
    }
  };
  // 2 · Mainstone'un elli iki yılı: 1979 hafta sonu, 1988 çay, 2000 elektrik
  scenes[2] = t => {
    lab();
    const y79 = w('l03', 27), y88 = w('l03', 38), y00 = w('l03', 49), dark = seg(t, w('l03', 'elektrik') - 0.1, 0.25);
    const phase = t < y79 - 0.2 ? 0 : t < y88 - 0.2 ? 1 : t < y00 - 0.2 ? 2 : 3;
    const dropFall = phase === 1 ? seg(t, w('l03', 'kaçırıyor') - 0.8, 0.6) : phase === 2 ? seg(t, w('l03', 'döndüğünde') - 1.0, 0.6) : phase === 3 ? seg(t, w('l03', 'elektrik') - 0.3, 0.6) : 0;
    funnel(720, 640, phase === 0 ? 0.6 : 0.9, dropFall);
    const yr = phase === 0 ? Math.round(lerp(1961, 2013, seg(t, w('l03', 'elli'), 1.4))) : [0, 1979, 1988, 2000][phase];
    const py = phase === 0 ? 760 : 560; rect(240, py, 260, 140, PAL.paper, LW, 12); text(String(yr), 370, py + 100, 72, A.INK);
    if (phase === 1) { rect(240, 715, 260, 76, PAL.red, LW, 10); text('CUMARTESİ', 370, 768, 38, PAL.paper); }
    if (phase === 0) ch(MAINSTONE, { x: 380, y: GY, s: S, expr: 'notr', head: { look: [0.8, -0.2] }, armL: { sh: 20, el: 40 } }, t);
    if (phase === 2) { const out = seg(t, w('l03', 'çıkıyor') - 0.4, 0.8), back = seg(t, w('l03', 'döndüğünde') - 0.2, 0.6); const x = lerp(lerp(380, -80, out), 380, back); ch(MAINSTONE, { x, y: GY, s: S, walk: (out > 0 && out < 1) || (back > 0 && back < 1) ? (t * 1.4) % 1 : undefined, facing: back > 0 ? 1 : -1, view: back > 0 || out > 0 ? 'side' : 'front', expr: back >= 1 ? 'saskin' : 'mutlu', armR: { sh: 60, el: 70 } }, t); if (back > 0 || out < 1) tea(x + (back > 0 ? 70 : -70), GY - 260); }
    if (phase === 3) { rect(200, 980, 120, 90, '#2B2F33', LW, 10); line(230, 1070, 190, 1360, 8); line(290, 1070, 330, 1360, 8); circ(300, 1000, 10, dark > 0 ? '#5A2A2A' : '#E0392B', 3); text(dark > 0 ? '' : 'KAYIT', 260, 950, 36, PAL.red); }
    if (dark > 0) { ctx.save(); ctx.globalAlpha = 0.82 * dark; ctx.fillStyle = '#0E1012'; ctx.fillRect(-400, -400, 1880, 2800); ctx.restore(); if (t > w('l03', 'elektrik') + 0.4) ch(MAINSTONE, { x: 420, y: GY, s: S, expr: 'saskin', armL: { sh: 150, el: 30 }, armR: { sh: 150, el: 30 } }, t); }
  };
  // 3 · boş sandalye ve gözlük; birkaç ay sonra damla düşer
  scenes[3] = t => {
    lab();
    funnel(720, 640, 0.95, seg(t, w('l05', 'düşüyor') - 0.4, 0.6));
    rect(250, 1160, 200, 26, '#7A5634', LW, 6); line(270, 1186, 270, 1360, 8); line(430, 1186, 430, 1360, 8); rect(250, 980, 26, 190, '#7A5634', LW, 4);
    rect(300, 1130, 60, 26, null, 4, 8); rect(370, 1130, 60, 26, null, 4, 8); line(360, 1142, 370, 1142, 4);
    if (t > w('l05', 'bir') - 0.2) { rect(300, 560, 260, 140, PAL.paper, LW, 12); text('2014', 430, 660, 72, A.INK); }
  };
  // 4 · Oxford: cam fanusun altında zil
  scenes[4] = t => {
    bg('#E2D6C2'); rect(-400, 1300, 1880, 900, '#B39B78', 0); line(-400, 1300, 1480, 1300, LW);
    rect(170, 1100, 740, 40, '#6A4A2E', LW, 6); rect(210, 1140, 660, 220, '#7A5634', LW, 6);
    bells(540, 640, t, true);
    const q = t > w('l08', 'pillerin') - 0.2 && t < w('l08', 34) - 0.2;
    if (q) for (const s of [-1, 1]) { rect(540 + s * 95 - 50, 520, 100, 100, PAL.paper, LW, 50); text('?', 540 + s * 95, 598, 72, PAL.red); }
    if (t > w('l08', 'çünkü') - 0.2 && t < w('l08', 34) - 0.2) { ctx.save(); ctx.translate(800, 760); ctx.rotate(-0.5); rect(-12, -10, 24, 160, '#8C9298', LW, 4); rect(-22, 140, 44, 90, PAL.red, LW, 8); ctx.restore(); line(700, 640, 900, 860, 14, PAL.red); line(900, 640, 700, 860, 14, PAL.red); }
    const y = t < w('l08', 'top') ? 1840 : Math.round(lerp(1840, 2026, seg(t, w('l08', 'top'), w('l08', 'geliyor') - w('l08', 'top') + 0.4)));
    if (t > T.l06 - 0.2 && t < w('l08', 'pillerin')) { rect(230, 560, 260, 120, PAL.paper, LW, 12); text(String(y), 360, 645, 68, A.INK); }
  };
  // 5 · kıyas: bir damla ve 560 milyon çalış
  const ringN = t => 560e6 * ease.enter(seg(t, w('l08', 34) - 0.1, hero(T) - w('l08', 34)));
  scenes[5] = t => {
    bg('#E2D6C2'); rect(-400, 1300, 1880, 900, '#B39B78', 0); line(-400, 1300, 1480, 1300, LW);
    const u = seg(t, w('l08', 34) - 0.1, hero(T) - w('l08', 34));
    ctx.save(); ctx.translate(250, 700); ctx.scale(0.62, 0.62); funnel(0, 0, 0.3 + 0.7 * u, u >= 1 ? seg(t, hero(T) - 0.2, 0.5) : 0); ctx.restore();
    ctx.save(); ctx.translate(800, 760); ctx.scale(0.62, 0.62); bells(0, 0, t * (1 + 6 * u), true); ctx.restore();
    line(540, 620, 540, 1300, 6, 'rgba(31,36,33,0.35)');
    rect(120, 1060, 260, 90, PAL.paper, LW, 12); text('1 DAMLA', 250, 1122, 44, A.INK);
  };

  // ——— kamera ———
  const ZK = 1.5, YO = 60;   // huni ve zil düzenekleri büyük: karakter ve düzenek birlikte görünsün
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 520, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.08, 560, 940, 0)],
    [T.l02end + 0.2, ...P(1.3, 560, 920, 0)],
    ...cut(T.l03 - 0.15, P(1.3, 560, 920, 0), P(1.0, 540, 960, 1)),
    [w('l03', 'ama') - 0.3, ...P(1.05, 560, 980, 1)],
    [w('l03', 'düşüyor') + 0.3, ...P(1.1, 500, 960, 1)],
    ...cut(w('l03', 'con') - 0.15, P(1.1, 500, 960, 1), P(1.0, 540, 960, 2)),
    [w('l03', 'kesiliyor') + 0.2, ...P(1.08, 540, 960, 2)],
    [T.l04end + 0.2, ...P(1.15, 480, 960, 2)],
    ...cut(T.l05 - 0.15, P(1.15, 480, 960, 2), P(1.0, 520, 960, 3)),
    [T.l05end + 0.2, ...P(1.2, 640, 940, 3)],
    ...cut(T.l06 - 0.15, P(1.2, 640, 940, 3), P(1.0, 540, 960, 4)),
    [T.l07end + 0.2, ...P(1.2, 540, 900, 4)],
    [w('l08', 'pillerin') - 0.2, ...P(1.05, 540, 920, 4)],
    ...cut(w('l08', 34) - 0.15, P(1.05, 540, 920, 4), P(0.72, 540, 900, 5)),
    [hero(T), ...P(0.7, 540, 890, 5)],
    [T.loop0 - 0.001, ...P(0.76, 540, 880, 5)],
    [T.loop0, ...P(1.03, 525, 965, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'con') - 0.1, w('l03', 27) - 0.3, 'JOHN MAINSTONE', 'Queensland Üniversitesi · 52 yıl'], [T.l06 + 0.3, T.l07 - 0.2, 'OXFORD ZİLİ', 'Clarendon Laboratuvarı · 1840']],
    numbers: [[w('l08', 34) - 0.05, T.l10 + 0.3, t => Math.round(ringN(t)).toLocaleString('tr-TR'), 'ZİLİN ÇALIŞI · 1 DAMLADA']],
  };
}

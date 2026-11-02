// № 063 · Avukatı yenen kadın ve 400 yıllık köpekbalığı (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: masada Jeanne ve avukat, aradaki zarf; takvim 1965. A'nın ters köşesi: avukatın sandalyesi boşalır, ödemeyi ailesi sürdürür.
// Doruk: 1600–2020 zaman çizgisinde köpekbalığının çubuğu IV. Murat'ın tahtından başlar; Jeanne'nin 122 yılı yanında kısa kalır.

const SX = 1400;
const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const JEANNE = base({ key: 'jeanne', seed: 401, torso: { len: 0.76, shoulder: 0.6, hip: 0.66, depth: 0.44, belly: 0.06, color: '#2A2A3A', shade: '#1E1E2C' }, arm: { upper: 0.36, lower: 0.34, w: 0.16, color: '#2A2A3A', shade: '#1E1E2C', hand: 0.11 }, leg: { upper: 0.34, lower: 0.32, w: 0.18, color: '#2A2A3A', shade: '#1E1E2C' }, shoe: { color: '#1A1A1A', len: 0.26, h: 0.1 }, skin: '#EBCDB3', skinShade: '#D2B096', hair: '#DCD8D0', features: ['cardigan', 'skirt', 'bun', 'glassesCat'] });
const JEANNE122 = { ...JEANNE, key: 'jeanne122', hair: '#F2F0EA', torso: { ...JEANNE.torso, color: '#7A5A8A', shade: '#62466E' }, arm: { ...JEANNE.arm, color: '#7A5A8A', shade: '#62466E' } };
const AVUKAT = base({ key: 'avukat', seed: 411, torso: { len: 0.92, shoulder: 0.74, hip: 0.6, depth: 0.46, belly: 0.08, color: '#2E3A4E', shade: '#232D3E' }, arm: { upper: 0.44, lower: 0.42, w: 0.18, color: '#2E3A4E', shade: '#232D3E', hand: 0.12 }, leg: { upper: 0.44, lower: 0.42, w: 0.2, color: '#2E3A4E', shade: '#232D3E' }, shoe: { color: '#1A1A1A', len: 0.32, h: 0.11 }, skin: '#E9B98F', skinShade: '#D29E74', hair: '#3A2A20', features: ['suit', 'tie', 'hairSlick', 'glassesRect'] });
const AVUKAT_YASLI = { ...AVUKAT, key: 'avukatY', hair: '#B9B4AE', features: ['suit', 'tie', 'baldSides', 'glassesRect'] };
const OGUL = base({ key: 'ogul', seed: 421, torso: { len: 0.9, shoulder: 0.72, hip: 0.58, depth: 0.44, belly: 0, color: '#5A4A3A', shade: '#463A2C' }, arm: { upper: 0.44, lower: 0.42, w: 0.18, color: '#5A4A3A', shade: '#463A2C', hand: 0.12 }, leg: { upper: 0.44, lower: 0.42, w: 0.2, color: '#3A3A3A', shade: '#2A2A2A' }, shoe: { color: '#1A1A1A', len: 0.32, h: 0.11 }, skin: '#E9B98F', skinShade: '#D29E74', hair: '#5A3A2A', features: ['jacket', 'hairMessy'] });
const BILIM = base({ key: 'bilim', seed: 431, torso: { len: 0.86, shoulder: 0.66, hip: 0.56, depth: 0.42, belly: 0, color: '#F4F1EA', shade: '#D9D4C8' }, arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#F4F1EA', shade: '#D9D4C8', hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#3A4A5A', shade: '#2B3744' }, shoe: { color: '#2A2A2A', len: 0.3, h: 0.11 }, skin: '#F0D4BE', skinShade: '#D8B8A0', hair: '#B08A5A', features: ['jacket', 'hairMessy', 'glassesRect'] });

export function hero(T) { return T.w('l07', 'oturuyordu') + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 30) - 0.3, w('l03', 30)], [w('l03', 46) - 0.3, w('l03', 46)], [T.l05 - 0.3, T.l05], [w('l07', 12) - 0.3, w('l07', 12)], [w('l07', 37) - 0.3, w('l07', 37)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'ödüyor'), w('l03', 'kendisi'), w('l07', 'ölçüyor')],
    thock: [w('l03', 'ölüyor')],
    scratch: [[w('l07', 37), hero(T), 0.02]],
    riser: [w('l07', 37) - 0.2, hero(T)],
    impact: hero(T),
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const sit = (f = 1) => ({ view: 'side', facing: f, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 50, el: 60 }, armR: { sh: 55, el: 60 } });
  const chair = (x, f) => { rect(x - 60, 1160, 120, 26, '#7A4A2E', LW, 6); line(x - 50, 1186, x - 50, 1360, 10); line(x + 50, 1186, x + 50, 1360, 10); line(x - f * 55, 1160, x - f * 55, 900, 12); rect(x - f * 55 - 12, 900, 24, 160, '#7A4A2E', LW, 6); };
  const envelope = (x, y, r = 0) => { ctx.save(); ctx.translate(x, y); ctx.rotate(r); rect(-60, -38, 120, 76, '#F4EFE3', 5, 4); poly([[-60, -38], [0, 6], [60, -38]], null, 5); ctx.restore(); };
  // köpekbalığı: tıknaz, kısa yuvarlak burun, küçük yüzgeçler, beyaz benekler; baş +x, kuyruk sallanır
  const shark = (x, y, k, t) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    const sw = Math.sin(t * 1.4) * 0.12;
    ctx.save(); ctx.translate(-330, 0); ctx.rotate(sw); poly([[0, 0], [-150, -120], [-110, 0], [-150, 110]], '#4E4A45', LW); ctx.restore();
    ell(0, 0, 340, 110, '#5E5852', LW); ell(30, 40, 290, 50, '#7A7268', 0);
    poly([[-40, -100], [-110, -180], [-150, -96]], '#4E4A45', LW); poly([[120, 70], [60, 160], [20, 80]], '#4E4A45', LW);
    const r = mulberry32(63); ctx.fillStyle = '#C9C2B4'; for (let i = 0; i < 24; i++) { ctx.beginPath(); ctx.arc(-260 + r() * 520, -70 + r() * 110, 4 + r() * 6, 0, 7); ctx.fill(); }
    circ(250, -20, 13, '#1A1A1A', 4); line(250, -8, 262, 50, 5, '#D9D2B8'); line(170, 50, 300, 40, 5);
    ctx.restore();
  };

  const scenes = [];
  // 0 · masa: Jeanne ve avukat; takvim 1965 → 1995; avukat yaşlanır, sandalye boşalır, oğlu öder
  scenes[0] = t => {
    t = loopT(t);
    bg('#E9DFC9'); rect(-400, 1360, 1880, 900, '#B9A486', 0); line(-400, 1360, 1480, 1360, LW);
    for (let i = 0; i < 6; i++) line(-400 + i * 300, 300, -400 + i * 300, 1360, 4, '#DDD2BA');
    const yr = Math.round(lerp(1965, 1995, seg(t, w('l03', 30) - 0.2, w('l03', 'ölüyor') - w('l03', 30) + 0.2)));
    rect(430, 760, 220, 190, PAL.paper, LW, 10); rect(430, 760, 220, 56, PAL.red, LW, 10); text(String(yr), 540, 920, 76, A.INK);
    chair(300, 1); chair(780, -1);
    rect(300, 1120, 480, 30, '#8A5A3A', LW, 6); line(330, 1150, 330, 1360, 10); line(750, 1150, 750, 1360, 10);
    const dead = t > w('l03', 'ölüyor') - 0.1 && t < T.l05, son = t > w('l03', 'ödemelere') - 0.3 && t < T.l05;
    const aging = seg(t, w('l03', 30), w('l03', 'ölüyor') - w('l03', 30));
    if (!dead) ch(aging > 0.5 ? AVUKAT_YASLI : AVUKAT, { x: 770, y: 1168, s: S, ...sit(-1), armL: { sh: 70, el: 40 }, expr: aging > 0.6 ? 'yorgun' : 'notr', head: { tilt: aging * 10 } }, t);
    if (son) ch(OGUL, { x: 900, y: GY, s: S, view: 'side', facing: -1, armR: { sh: 70, el: 20 }, expr: 'yorgun' }, t);
    ch(JEANNE, { x: 310, y: 1168, s: S * 0.95, ...sit(1), expr: dead ? 'mutlu' : 'notr', head: { tilt: dead ? -6 : 0 } }, t);
    const pay = aging > 0 && aging < 1 ? ((t * 1.6) % 1) : -1;
    if (pay >= 0) envelope(lerp(720, 380, ease.state(pay)), 1095 - Math.sin(pay * Math.PI) * 60, -0.1);
    else envelope(560, 1095, -0.1);
  };
  // 1 · 1965 teklif: avukat sözleşmeyi uzatır
  scenes[1] = t => {
    bg('#E9DFC9'); rect(-400, 1360, 1880, 900, '#B9A486', 0); line(-400, 1360, 1480, 1360, LW);
    rect(120, 520, 300, 360, '#C9DCE2', LW, 8); line(270, 520, 270, 880, LW); line(120, 700, 420, 700, LW);
    const offer = seg(t, w('l03', 'teklif') - 0.3, 0.5);
    ch(JEANNE, { x: 320, y: GY, s: S, expr: t > w('l03', 'ama') - 0.2 ? 'mutlu' : 'notr', head: { tilt: t > w('l03', 'ama') ? -8 : 0 } }, t);
    ch(AVUKAT, { x: 760, y: GY, s: S, view: 'side', facing: -1, armR: { sh: lerp(10, 80, offer), el: 10 }, expr: 'mutlu', talk: talk(t, w('l03', 'ölene') - 0.1, w('l03', 'olsun') + 0.4) }, t);
    if (offer > 0) { ctx.save(); ctx.translate(560, 1000); ctx.rotate(-0.08); rect(-110, -70, 220, 150, PAL.paper, 5, 6); text('SÖZLEŞME', 0, -26, 34, A.INK); for (let i = 0; i < 3; i++) line(-80, 4 + i * 22, 80, 4 + i * 22, 4, '#B9AE98'); ctx.restore(); }
  };
  // 2 · 122 yaş: pasta ve mumlar
  scenes[2] = t => {
    bg('#2A2030'); rect(-400, 1360, 1880, 900, '#4A3A44', 0); line(-400, 1360, 1480, 1360, LW);
    rect(420, 1080, 420, 130, '#F4EFE3', LW, 16); rect(420, 1140, 420, 30, '#D2412F', 0);
    const lit = Math.round(lerp(0, 122, seg(t, w('l03', 46) - 0.2, 1.6)));
    for (let i = 0; i < lit; i++) { const x = 440 + (i % 31) * 12.8, y = 1076 - Math.floor(i / 31) * 22; line(x, y, x, y - 30, 4, '#E2B13C'); circ(x, y - 38, 5 + Math.sin(t * 9 + i) * 1.5, '#FFC845', 0); }
    ch(JEANNE122, { x: 270, y: GY, s: S * 0.9, ...sit(1), expr: 'mutlu' }, t);
    rect(470, 760, 260, 140, PAL.paper, LW, 12); text('122', 600, 865, 104, PAL.red);
  };
  // 3 · derin su: köpekbalığı yavaşça yüzer
  scenes[3] = t => {
    bg('#0E2A33'); for (let i = 0; i < 6; i++) poly([[i * 220 - 300, 0], [i * 220 - 240, 0], [i * 220 + 40, 2000], [i * 220 - 40, 2000]], 'rgba(120,180,190,0.07)', 0);
    for (let i = 0; i < 40; i++) { const r = mulberry32(i + 3); const x = r() * 1300 - 100, y = ((r() * 1400 + t * 20) % 1400) + 300; circ(x, y, 3 + r() * 4, 'rgba(200,230,235,0.5)', 0); }
    shark(lerp(320, 700, seg(t, T.l05, T.l07 + 6 - T.l05)), 960, 0.95, t);
    if (t > w('l07', 'yılda') - 0.2) { rect(140, 1180, 440, 120, PAL.paper, LW, 12); line(180, 1240, 280, 1240, 10, PAL.red); text('1 cm / yıl', 420, 1260, 52, A.INK); }
  };
  // 4 · laboratuvar: göz merceği, karbon; 272–512 yıl cetveli
  scenes[4] = t => {
    bg('#DDE6E2'); rect(-400, 1360, 1880, 900, '#B9C4C0', 0); line(-400, 1360, 1480, 1360, LW);
    rect(380, 1120, 600, 30, '#9AA3AA', LW, 6); rect(400, 1150, 30, 210, '#9AA3AA', LW); rect(930, 1150, 30, 210, '#9AA3AA', LW);
    ch(BILIM, { x: 260, y: GY, s: S, view: 'side', facing: 1, armR: { sh: 80, el: 30 }, expr: 'saskin' }, t);
    circ(640, 1060, 46, '#E8EEF0', LW); circ(640, 1060, 22, '#C9D6DA', 4);
    const r = seg(t, w('l07', 22) - 0.2, 1.2);
    if (r > 0) { rect(160, 560, 760, 170, PAL.paper, LW, 12); line(220, 680, 860, 680, 8); const a = 220 + 640 * (272 / 600), b = 220 + 640 * (512 / 600) * ease.enter(r); rect(a, 640, Math.max(4, b - a), 30, PAL.red, 4, 6); text('272', a, 625, 44, A.INK); if (r > 0.9) text('512', 220 + 640 * 512 / 600, 625, 44, A.INK); text('YIL', 860, 625, 40, A.INK); }
  };
  // 5 · doruk: 1600–2020 zaman çizgisi; IV. Murat tahtı; köpekbalığı çubuğu; Jeanne'nin 122 yılı
  const X0 = 140, X1 = 940, Y0 = 1600, Y1 = 2020, yx = y => X0 + (X1 - X0) * (y - Y0) / (Y1 - Y0);
  scenes[5] = t => {
    bg('#F2E6CC'); rect(-400, 1360, 1880, 900, '#D9C49A', 0); line(-400, 1360, 1480, 1360, LW);
    line(X0, 1080, X1, 1080, 8); for (let y = 1600; y <= 2000; y += 100) { line(yx(y), 1055, yx(y), 1105, 6); text(String(y), yx(y), 1160, 46, A.INK); }
    const g = ease.enter(seg(t, w('l07', 37) - 0.1, hero(T) - w('l07', 37) + 0.1));
    rect(yx(1624), 790, Math.max(4, (yx(2016) - yx(1624)) * g), 110, '#5E5852', LW, 12);
    if (g > 0) shark(yx(1624) + (yx(2016) - yx(1624)) * g - 60, 740, 0.3, t);
    if (g > 0.95) text('~392 yıl', yx(1820), 870, 54, PAL.paper);
    const jb = seg(t, w('l07', 37) - 0.4, 0.5); rect(yx(1875), 940, (yx(1997) - yx(1875)) * jb, 80, '#7A5A8A', LW, 12);
    if (jb > 0.5) text('122', yx(1936), 998, 46, PAL.paper);
    const crown = seg(t, w('l07', 'osmanlı') - 0.2, 0.4);
    if (crown > 0) { const k = ease.enter(crown); ctx.save(); ctx.translate(yx(1624) + 70, 560 - 30 * k); poly([[-70, 40], [-70, -14], [-35, 16], [0, -36], [35, 16], [70, -14], [70, 40]], PAL.gold, LW); rect(-150, 60, 300, 90, PAL.paper, LW, 10); text('IV. MURAT', 0, 122, 50, PAL.red); ctx.restore(); line(yx(1624), 790, yx(1624), 720, 6); }
  };

  // ——— kamera ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(0.82, 540, 860, 0);
  const cam = [
    [0, ...F0],
    [T.l02end, ...P(0.9, 520, 880, 0)],
    ...cut(T.l03 - 0.15, P(0.9, 520, 880, 0), P(0.85, 540, 900, 1)),
    [w('l03', 'ama') - 0.2, ...P(0.95, 520, 900, 1)],
    ...cut(w('l03', 30) - 0.15, P(0.95, 520, 900, 1), P(0.8, 540, 860, 0)),
    [w('l03', 'ölüyor') + 0.3, ...P(0.78, 560, 900, 0)],
    ...cut(w('l03', 46) - 0.15, P(0.78, 560, 900, 0), P(0.8, 540, 940, 2)),
    [T.l04end + 0.2, ...P(0.88, 520, 960, 2)],
    ...cut(T.l05 - 0.15, P(0.88, 520, 960, 2), P(0.6, 540, 960, 3)),
    [w('l07', 12) - 0.16, ...P(0.65, 600, 980, 3)],
    ...cut(w('l07', 12) - 0.15, P(0.65, 600, 980, 3), P(0.72, 560, 900, 4)),
    [w('l07', 37) - 0.16, ...P(0.76, 540, 860, 4)],
    ...cut(w('l07', 37) - 0.15, P(0.76, 540, 860, 4), P(0.6, 540, 840, 5)),
    [hero(T), ...P(0.58, 540, 830, 5)],
    [T.loop0 - 0.001, ...P(0.63, 540, 840, 5)],
    [T.loop0, ...P(0.84, 540, 860, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 6) - 0.1, w('l03', 'teklif') - 0.2, 'JEANNE CALMENT', 'Arles, Fransa · 90 yaşında'], [w('l07', 'grönland') - 0.1, w('l07', 'yılda') - 0.2, 'GRÖNLAND', 'köpekbalığı · Kuzey Atlantik']],
    numbers: [[w('l03', 'ödüyor') - 0.1, w('l03', 'ölüyor') - 0.2, '30 yıl', 'HER AY ÖDEME']],
  };
}

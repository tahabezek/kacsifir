// № 036 · Batmayan hostes ve iki bombadan kurtulan mühendis (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: gece, eğilen Titanik'in önünde filikadaki Violet. A'nın ters köşesi: üçüncü batışta da "yine kurtuluyor".
// Doruk: Nagazaki'de ofisi dolduran ikinci beyaz ışık; ardından Ağustos 1945 takviminde 6 ve 9.

const SX = 1400;
const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const VIOLET = base({ key: 'violet', seed: 501, torso: { len: 0.8, shoulder: 0.6, hip: 0.62, depth: 0.42, belly: 0, color: '#2A2E3A', shade: '#1E2230' }, arm: { upper: 0.38, lower: 0.36, w: 0.15, color: '#2A2E3A', shade: '#1E2230', hand: 0.11 }, leg: { upper: 0.4, lower: 0.38, w: 0.17, color: '#2A2E3A', shade: '#1E2230' }, shoe: { color: '#1A1A1A', len: 0.26, h: 0.1 }, skin: '#F0D4BE', skinShade: '#D8B8A0', hair: '#5A3A2A', features: ['cardigan', 'skirt', 'bun'] });
const SUBAY = base({ key: 'subay', seed: 511, torso: { len: 0.9, shoulder: 0.74, hip: 0.58, depth: 0.44, belly: 0, color: '#1E2A44', shade: '#151E33' }, arm: { upper: 0.44, lower: 0.42, w: 0.18, color: '#1E2A44', shade: '#151E33', hand: 0.12 }, leg: { upper: 0.44, lower: 0.42, w: 0.2, color: '#1E2A44', shade: '#151E33' }, shoe: { color: '#1A1A1A', len: 0.32, h: 0.11 }, skin: '#E9B98F', skinShade: '#D29E74', hair: '#3A2A20', features: ['suit', 'mustacheThick', 'hairSlick'] });
const YAMA = base({ key: 'yamaguchi', seed: 521, torso: { len: 0.86, shoulder: 0.66, hip: 0.54, depth: 0.42, belly: 0, color: '#6A6E76', shade: '#55595F' }, arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#6A6E76', shade: '#55595F', hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#4A4E56', shade: '#3A3D44' }, shoe: { color: '#1A1A1A', len: 0.3, h: 0.11 }, skin: '#F0CFA8', skinShade: '#D8B48C', hair: '#16130F', features: ['suit', 'tie', 'hairSlick', 'glassesRect'] });
const PATRON = base({ key: 'mitsuPatron', seed: 531, torso: { len: 0.9, shoulder: 0.74, hip: 0.64, depth: 0.48, belly: 0.1, color: '#2E3440', shade: '#232831' }, arm: { upper: 0.42, lower: 0.4, w: 0.19, color: '#2E3440', shade: '#232831', hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#2A2F38', shade: '#1F232A' }, shoe: { color: '#1A1A1A', len: 0.32, h: 0.11 }, skin: '#E9C49A', skinShade: '#D2A87E', hair: '#3A332C', features: ['suit', 'tie', 'baldSides', 'mustacheThin'] });

export function hero(T) { return T.w('l07', 'beyaz') - 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 20) - 0.3, w('l03', 20)], [w('l03', 35) - 0.3, w('l03', 35)], [T.l05 - 0.3, T.l05], [w('l07', 'trenle') - 0.3, w('l07', 'trenle')], [w('l07', 'üç') - 0.3, w('l07', 'üç')], [w('l07', 41) - 0.3, w('l07', 41)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'bebek'), w('l03', 'kurtuluyor')],
    thock: [w('l03', 'çarpışıyor')],
    rumble: [[w('l03', 'mayına'), 0.6], [w('l07', 'parlıyor'), 0.7]],
    scratch: [[w('l07', 'üç'), hero(T), 0.02]],
    riser: [w('l07', 'üç') - 0.1, hero(T)],
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
  const sea = (y, c1, c2, t) => { rect(-400, y, 1880, 1600, c1, 0); for (let i = 0; i < 6; i++) { const yy = y + 40 + i * 70; ctx.beginPath(); for (let x = -400; x <= 1480; x += 40) { const v = yy + 8 * Math.sin(x * 0.02 + t * 1.5 + i); x === -400 ? ctx.moveTo(x, v) : ctx.lineTo(x, v); } ctx.lineWidth = 4; ctx.strokeStyle = c2; ctx.stroke(); } };
  // gemi: gövde, güverte, bacalar; ang: eğim; red: hastane gemisi (yeşil şerit, kırmızı haç)
  const ship = (x, y, k, ang, hull, stacks, red = false) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k); poly([[-420, 0], [420, 0], [360, 120], [-380, 120]], hull, LW); rect(-360, -60, 680, 60, '#F4F1EA', LW, 4); if (red) { rect(-400, 30, 780, 26, '#2E7A3A', 0); circ(0, 70, 30, '#F4F1EA', 4); rect(-6, 50, 12, 40, PAL.red, 0); rect(-20, 64, 40, 12, PAL.red, 0); } for (let i = 0; i < stacks; i++) { rect(-240 + i * 150, -170, 70, 110, '#D9A75A', LW, 4); rect(-240 + i * 150, -170, 70, 26, '#1A1A1A', 0); } for (let i = 0; i < 14; i++) circ(-320 + i * 48, -30, 8, '#FFE6A8', 3); ctx.restore(); };
  const lifeboat = (x, y, t) => { const b = Math.sin(t * 1.6) * 6; ctx.save(); ctx.translate(x, y + b); poly([[-260, 0], [260, 0], [210, 90], [-210, 90]], '#E8E0D0', LW); ctx.restore(); return b; };
  const baby = (x, y) => { ell(x, y, 46, 30, '#F4F1EA', 5); circ(x - 26, y - 8, 18, '#F0D4BE', 4); };
  const bandage = (sk, o) => { const hx = o.x + sk.head[0] * o.s, hy = o.y + sk.head[1] * o.s; ctx.save(); ctx.globalAlpha = 0.95; rect(hx - o.s * 0.5, hy - o.s * 0.42, o.s, o.s * 0.2, '#F4F1EA', 4, 6); ctx.restore(); };

  const scenes = [];
  // 0 · Titanik, gece: eğilen gemi, filikada Violet; subay kucağına bebek verir
  scenes[0] = t => {
    t = loopT(t);
    bg('#14203A'); for (let i = 0; i < 40; i++) { const r = mulberry32(i + 7); circ(r() * 1300 - 100, 200 + r() * 500, 2 + r() * 3, '#F4F1EA', 0); }
    ship(560, 980, 1.0, -0.22, '#1A1A1A', 4);
    sea(1000, '#1E3050', '#2E4A6E', t);
    const b = lifeboat(520, 1240, t);
    const give = t > w('l03', 'bebek') - 0.4 && t < T.l05;
    ch(SUBAY, { x: 780, y: 1250 + b, s: S * 0.95, view: 'side', facing: -1, armR: { sh: give ? 80 : 20, el: 20 }, expr: 'korku' }, t);
    const o = { x: 420, y: 1250 + b, s: S * 0.95 };
    const sk = ch(VIOLET, { ...o, armL: give ? { sh: 60, el: 80 } : { sh: 15, el: 10 }, armR: give ? { sh: 60, el: 80 } : { sh: 15, el: 10 }, expr: t > w('l03', 'gemi') - 0.2 && t < T.l05 ? 'korku' : 'notr', head: { look: [0.5, -0.3] } }, t);
    if (give) baby(o.x + sk.handR[0] * o.s - 10, o.y + sk.handR[1] * o.s - 20);
  };
  // 1 · 1911: Olympic ve savaş gemisi çarpışır
  scenes[1] = t => {
    bg('#C9DCE2'); sea(1100, '#3A6A8A', '#5A8AAA', t);
    const hit = ease.enter(seg(t, w('l03', 'çarpışıyor') - 0.8, 0.8));
    ship(lerp(140, 300, hit), 1060, 0.7, 0, '#1A1A1A', 4);
    ctx.save(); ctx.translate(lerp(1000, 800, hit), 1080); ctx.scale(0.55, 0.55); poly([[-420, 0], [420, 0], [380, 110], [-380, 110]], '#6E777E', LW); rect(-200, -90, 300, 90, '#8C9298', LW, 4); line(-40, -90, -40, -220, 10); ctx.restore();
    if (hit >= 1 && t < w('l03', 'yedi')) for (let i = 0; i < 8; i++) { ctx.save(); ctx.translate(560, 1050); ctx.rotate(i * Math.PI / 4); line(0, 30, 0, 90, 8, PAL.gold); ctx.restore(); }
    if (t > w('l03', 'yedi') - 0.2) { ship(540, 760, 0.42, 0, '#1A1A1A', 4); rect(300, 520, 480, 110, PAL.paper, LW, 12); text('OLYMPIC = TİTANİK', 540, 595, 46, A.INK); }
  };
  // 2 · 1916 Ege: Britannic mayına çarpar; Violet suya atlar
  scenes[2] = t => {
    bg('#BFD6E2'); circ(860, 360, 70, '#F6C445', LW); sea(1080, '#2A6A8A', '#4A8AAA', t);
    const boom = seg(t, w('l03', 'mayına') - 0.1, 0.6), tilt = 0.12 * seg(t, w('l03', 'mayına'), 3);
    ship(560, 1040, 0.75, tilt, '#F4F1EA', 4, true);
    if (boom > 0 && boom < 1) { const k = ease.enter(boom); for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; ell(620 + Math.cos(a) * 120 * k, 1100 + Math.sin(a) * 160 * k, 50, 40, ['#F4F1EA', '#D9D2C2'][i % 2], LW); } }
    const jump = seg(t, w('l03', 'suya') - 0.2, 0.6);
    if (jump > 0 && t < w('l03', 'yine') - 0.2) { const x = lerp(760, 900, jump), y = lerp(960, 1170, jump) - Math.sin(jump * Math.PI) * 120; ctx.save(); ctx.translate(x, y); ctx.rotate(jump * 2.6); ch(VIOLET, { x: 0, y: 0, s: S * 0.75, armL: { sh: 160, el: 10 }, armR: { sh: 160, el: 10 }, expr: 'korku' }, t); ctx.restore(); }
    if (t > w('l03', 'yine') - 0.2) { const b = lifeboat(820, 1200, t); ch(VIOLET, { x: 820, y: 1210 + b, s: S * 0.8, expr: 'mutlu', armR: { sh: 150, el: 20 } }, t); }
  };
  // 3 · Hiroşima: sokakta Yamaguchi; gökyüzünde dev ışık
  scenes[3] = t => {
    const f = seg(t, w('l07', 'ışık') - 0.2, 0.15) * (1 - seg(t, w('l07', 'ışık') + 0.3, 0.9));
    bg('#C9DCE2'); for (let i = 0; i < 7; i++) { const x = -80 + i * 170; rect(x, 900 - (i % 3) * 60, 150, 460 + (i % 3) * 60, ['#D9C9A8', '#C9B898', '#E2D2B2'][i % 3], LW, 4); poly([[x - 20, 900 - (i % 3) * 60], [x + 75, 840 - (i % 3) * 60], [x + 170, 900 - (i % 3) * 60]], '#5A4A3A', LW); }
    rect(-400, 1360, 1880, 900, '#B9AE98', 0); line(-400, 1360, 1480, 1360, LW);
    const hurt = t > w('l07', 'kulak') - 0.2;
    const o = { x: 540, y: GY, s: S };
    const sk = ch(YAMA, { ...o, view: hurt ? 'front' : 'side', facing: 1, walk: hurt ? undefined : (t * 0.7) % 1, armL: hurt ? { sh: 150, el: 140 } : undefined, armR: hurt ? { sh: 150, el: 140 } : undefined, expr: hurt ? 'korku' : 'notr' }, t);
    if (f > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, f * 1.2); ctx.fillStyle = '#FFFDF2'; ctx.fillRect(-400, -400, 1880, 2800); ctx.restore(); }
    if (t > w('l07', 'yüzü') - 0.2) for (let i = 0; i < 3; i++) line(520 + i * 20, 900, 530 + i * 20, 860, 6, '#C2412F');
  };
  // 4 · tren: Nagazaki'ye dönüş
  scenes[4] = t => {
    bg('#E9DFC9'); rect(-400, 1200, 1880, 900, '#8A9A6A', 0); line(-400, 1240, 1480, 1240, 10); for (let i = 0; i < 30; i++) line(-400 + i * 70, 1230, -380 + i * 70, 1252, 6);
    const x = lerp(60, 320, seg(t, w('l07', 'trenle') - 0.3, 2.4));
    rect(x, 940, 520, 260, '#3A4A3A', LW, 20); rect(x - 520, 960, 500, 240, '#4A5A4A', LW, 16); for (let i = 0; i < 4; i++) rect(x + 40 + i * 115, 990, 90, 80, '#C9DCE2', 5, 6); circ(x + 100, 1210, 40, '#2A2A2A', LW); circ(x + 420, 1210, 40, '#2A2A2A', LW);
    const o = { x: x + 300, y: 1130, s: S * 0.45 }; const sk = ch(YAMA, { ...o, view: 'side', facing: 1, expr: 'yorgun' }, t); bandage(sk, o);
    rect(580, 620, 380, 120, PAL.paper, LW, 12); text('→ NAGAZAKİ', 770, 700, 52, A.INK);
  };
  // 5 · Nagazaki ofisi: sargılı Yamaguchi anlatır; ikinci beyaz ışık (doruk)
  scenes[5] = t => {
    const f = seg(t, hero(T) - 0.1, 0.12) * (1 - seg(t, hero(T) + 0.6, 1.6));
    bg('#E2D6BE'); rect(560, 520, 360, 380, f > 0 ? '#FFFDF2' : '#C9DCE2', LW, 8); line(740, 520, 740, 900, LW); line(560, 710, 920, 710, LW);
    rect(-400, 1360, 1880, 900, '#A8865E', 0); line(-400, 1360, 1480, 1360, LW); rect(140, 1120, 700, 36, '#6A4A2E', LW, 6); rect(180, 1156, 620, 204, '#7A5634', LW, 6);
    ch(PATRON, { x: 760, y: GY, s: S, view: 'side', facing: -1, expr: f > 0 ? 'korku' : 'saskin', armR: f > 0 ? { sh: 150, el: 140 } : undefined }, t);
    const o = { x: 300, y: GY, s: S };
    const sk = ch(YAMA, { ...o, view: 'side', facing: 1, armR: f > 0 ? { sh: 150, el: 140 } : { sh: 80 + 20 * Math.sin(t * 4), el: 30 }, talk: f > 0 ? 0 : talk(t, w('l07', 'üç'), hero(T) - 0.2), expr: f > 0 ? 'korku' : 'notr' }, t);
    bandage(sk, o);
    if (f > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, f * 1.2); ctx.fillStyle = '#FFFDF2'; ctx.fillRect(-400, -400, 1880, 2800); ctx.restore(); }
  };
  // 6 · Ağustos 1945 takvimi: 6 ve 9 daire içinde, "3 gün"; yaşlı Yamaguchi ve Violet
  scenes[6] = t => {
    bg('#F2E6CC'); rect(-400, 1360, 1880, 900, '#D9C49A', 0); line(-400, 1360, 1480, 1360, LW);
    rect(200, 480, 680, 560, PAL.paper, LW, 14); rect(200, 480, 680, 100, '#2E4A6B', LW, 14); text('AĞUSTOS 1945', 540, 552, 56, PAL.paper);
    for (let d = 1; d <= 31; d++) { const c = (d + 2) % 7, r = Math.floor((d + 2) / 7), x = 260 + c * 94, y = 650 + r * 82; text(String(d), x, y, 40, A.INK); if (d === 6 || d === 9) { const k = ease.enter(seg(t, T.l07end - 0.6 + (d === 9 ? 0.4 : 0), 0.4)); if (k > 0) { ctx.beginPath(); ctx.arc(x, y - 14, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.lineWidth = 7; ctx.strokeStyle = PAL.red; ctx.stroke(); } } }
    if (t > T.l07end + 0.2) { ctx.save(); ctx.translate(540, 1110); ctx.rotate(-0.05); rect(-160, -60, 320, 110, PAL.paper, LW, 12); text('3 gün', 0, 28, 72, PAL.red); ctx.restore(); }
    ch(VIOLET, { x: 190, y: GY, s: S * 0.75, expr: 'mutlu' }, t); ch(YAMA, { x: 890, y: GY, s: S * 0.75, view: 'front', expr: 'mutlu', armR: { sh: 20 + 20 * Math.sin(t * 2), el: 30 } }, t);
  };

  // ——— kamera ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(0.82, 540, 880, 0);
  const cam = [
    [0, ...F0],
    [T.l02end, ...P(0.9, 520, 930, 0)],
    ...cut(T.l03 - 0.15, P(0.9, 520, 930, 0), P(0.7, 540, 900, 1)),
    [w('l03', 'çarpışıyor'), ...P(0.78, 540, 960, 1)],
    [w('l03', 20) - 0.16, ...P(0.72, 540, 900, 1)],
    ...cut(w('l03', 20) - 0.15, P(0.72, 540, 900, 1), P(0.72, 560, 860, 0)),
    [w('l03', 'bebek'), ...P(0.95, 560, 960, 0)],
    ...cut(w('l03', 35) - 0.15, P(0.95, 560, 960, 0), P(0.7, 600, 900, 2)),
    [w('l03', 'suya') - 0.31, ...P(0.72, 620, 920, 2)],
    ...cut(w('l03', 'suya') - 0.3, P(0.72, 620, 920, 2), P(0.8, 820, 1000, 2)),
    [T.l04end + 0.2, ...P(0.85, 780, 1000, 2)],
    ...cut(T.l05 - 0.15, P(0.85, 780, 1000, 2), P(0.82, 540, 920, 3)),
    [w('l07', 'ışık') - 0.3, ...P(0.85, 540, 930, 3)],
    [w('l07', 'kolları'), ...P(1.0, 540, 820, 3)],
    ...cut(w('l07', 'trenle') - 0.15, P(1.0, 540, 820, 3), P(0.72, 540, 900, 4)),
    ...cut(w('l07', 'üç') - 0.15, P(0.72, 540, 900, 4), P(0.8, 520, 920, 5)),
    [hero(T), ...P(0.86, 480, 900, 5)],
    ...cut(w('l07', 41) - 0.15, P(0.86, 480, 900, 5), P(0.74, 540, 860, 6)),
    [T.loop0 - 0.001, ...P(0.77, 540, 860, 6)],
    [T.loop0, ...P(0.84, 540, 885, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'violet') - 0.1, w('l03', 'çarpışıyor') - 0.2, 'VIOLET JESSOP', 'hostes · 1911–1916'], [w('l07', 'tsutomu') - 0.1, w('l07', 'gökyüzünde') - 0.2, 'TSUTOMU YAMAGUCHI', 'gemi mühendisi · 1945']],
    numbers: [],
  };
}

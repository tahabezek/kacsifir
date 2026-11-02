// № 035 · Dağı yaran adam ve yerin altındaki 33 kişi (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: kayalık sırtta çekiç sallayan Manjhi, yanında yılları sayan taş. A'nın ters köşesi: 55 km'lik yol 15 km'ye iner.
// Doruk: tavandan çıkan matkap ucuna bağlanan not: "Sığınakta iyiyiz, 33 kişiyiz."

const SX = 1400;
const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const MANJHI = base({ key: 'manjhi', seed: 301, torso: { len: 0.84, shoulder: 0.64, hip: 0.52, depth: 0.4, belly: 0, color: '#E9E2D2', shade: '#CFC6B2' }, arm: { upper: 0.4, lower: 0.38, w: 0.16, color: '#6A452E', shade: '#55361F', hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.18, color: '#E9E2D2', shade: '#CFC6B2' }, shoe: { color: '#6A452E', len: 0.28, h: 0.08 }, skin: '#6A452E', skinShade: '#55361F', hair: '#1A1410', features: ['hairSlick', 'mustacheThin'] });
const MANJHI_OLD = { ...MANJHI, key: 'manjhiOld', hair: '#B9B4AE' };
const FALGUNI = base({ key: 'falguni', seed: 311, torso: { len: 0.8, shoulder: 0.6, hip: 0.66, depth: 0.42, belly: 0, color: '#D9792B', shade: '#B8611E' }, arm: { upper: 0.38, lower: 0.36, w: 0.15, color: '#D9792B', shade: '#B8611E', hand: 0.11 }, leg: { upper: 0.38, lower: 0.36, w: 0.18, color: '#D9792B', shade: '#B8611E' }, shoe: { color: '#7A5034', len: 0.26, h: 0.08 }, skin: '#7A5034', skinShade: '#5E3C28', hair: '#1A1410', features: ['skirt', 'bun'] });
const KOYLU = (c, s, f) => base({ key: 'koylu' + s, seed: 320 + s, torso: { len: 0.82, shoulder: 0.64, hip: 0.54, depth: 0.4, belly: 0.05, color: c, shade: c }, arm: { upper: 0.4, lower: 0.38, w: 0.16, color: c, shade: c, hand: 0.12 }, leg: { upper: 0.4, lower: 0.38, w: 0.18, color: '#E9E2D2', shade: '#CFC6B2' }, shoe: { color: '#4A3020', len: 0.28, h: 0.08 }, skin: '#7A5038', skinShade: '#5E3C28', hair: '#1A1410', features: f });
const KOY = [KOYLU('#5A7A9A', 0, ['hairSlick', 'mustacheThick']), KOYLU('#9A5A4A', 1, ['hairMessy']), KOYLU('#7A8A4A', 2, ['baldSides', 'mustacheThin'])];
const MINER = (s) => base({ key: 'maden' + s, seed: 340 + s, torso: { len: 0.84, shoulder: 0.7, hip: 0.56, depth: 0.42, belly: 0, color: '#3C4A3A', shade: '#2E3A2C' }, arm: { upper: 0.42, lower: 0.4, w: 0.18, color: '#3C4A3A', shade: '#2E3A2C', hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#3C4A3A', shade: '#2E3A2C' }, shoe: { color: '#2A2420', len: 0.3, h: 0.12 }, skin: ['#C48A5E', '#D9A27A', '#A8784E', '#E2B896'][s % 4], skinShade: '#8A5A3A', hair: s % 3 ? '#2A211C' : '#9A9590', features: s % 2 ? ['mustacheThick'] : ['hairSlick'] });
const MINERS = [0, 1, 2, 3, 4, 5].map(MINER);

export function hero(T) { return T.l07end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 19) - 0.3, w('l03', 19)], [w('l03', 'köylüler') - 0.3, w('l03', 'köylüler')], [w('l03', 'yirmi') - 0.3, w('l03', 'yirmi')], [T.l05 - 0.3, T.l05], [w('l07', 'kırk') - 0.3, w('l07', 'kırk')], [w('l07', 'sonra') - 0.3, w('l07', 'sonra')], [T.l08 - 0.3, T.l08], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'düşüyor'), w('l07', 'kaşık'), w('l07', 'yudum')],
    thock: [w('l03', 'açılıyor')],
    rumble: [[w('l07', 'çöküyor'), 0.7], [w('l05', 'yerin'), 0.3]],
    scratch: [[w('l07', 'sonra'), hero(T), 0.02]],
    riser: [w('l07', 'sonra') - 0.1, hero(T)],
    impact: hero(T),
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const bubble = (x, y, s, wd = 260) => { rect(x - wd / 2, y - 70, wd, 100, PAL.paper, LW, 24); poly([[x - 30, y + 28], [x - 4, y + 28], [x - 40, y + 70]], PAL.paper, LW); ctx.fillStyle = PAL.paper; ctx.fillRect(x - 28, y + 22, 22, 9); text(s, x, y + 6, 52, A.INK); };
  // karakter + el aleti: çekiç (R) ve keski (L); sk birim koordinatında, s ölçeğinde
  const at = (o, sk, k) => [o.x + sk[k][0] * o.s, o.y + sk[k][1] * o.s];
  const hammer = (p, ang) => { ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang); line(0, 0, 0, -110, 14, '#8A5A3A'); rect(-36, -140, 72, 40, '#5A6068', LW, 6); ctx.restore(); };
  const chisel = p => { line(p[0], p[1], p[0] + 50, p[1] - 30, 12, '#9AA3AA'); };
  const helmet = (o, sk) => { const [hx, hy] = at(o, sk, 'head'); ctx.beginPath(); ctx.arc(hx, hy - o.s * 0.18, o.s * 0.52, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#F28C1E'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = A.INK; ctx.stroke(); circ(hx, hy - o.s * 0.5, o.s * 0.12, '#FFF2B0', 5); };
  const ridge = (gap) => { poly([[-400, 1360], [-400, 760], [120, 560], [360, 640], [520, 600], [520, 1360]], '#9A7A5A', LW); poly([[520 + gap, 1360], [520 + gap, 600], [720, 560], [1000, 700], [1480, 820], [1480, 1360]], '#8A6A4A', LW); if (gap > 4) rect(520, 600, gap, 760, '#C9B590', 0); for (let i = 0; i < 9; i++) line(-200 + i * 110, 820 + (i % 3) * 120, -150 + i * 110, 860 + (i % 3) * 120, 5, '#6A5038'); };
  const village = () => { bg('#F2D9A8'); for (let i = 0; i < 4; i++) { const x = -100 + i * 330; rect(x, 1040, 220, 200, '#C99A6A', LW, 6); poly([[x - 20, 1040], [x + 110, 940], [x + 240, 1040]], '#8A6A3A', LW); } rect(-400, 1240, 1880, 900, '#D9B88A', 0); line(-400, 1240, 1480, 1240, LW); };

  const scenes = [];
  // 0 · sırtta tek başına: çekiç ve keski, yarık yıllar içinde açılır; taşa kazınmış yıl sayacı
  scenes[0] = t => {
    t = loopT(t);
    bg('#F2D9A8'); circ(900, 360, 70, '#F6C445', LW);
    const yrs = Math.min(22, Math.max(0, seg(t, w('l01', 'yirmi') - 0.2, w('l01', 'dağı') - w('l01', 'yirmi') + 0.2) * 22));
    ridge(lerp(10, 170, yrs / 22));
    rect(640, 760, 190, 110, '#C9B590', LW, 10); text(Math.round(1960 + yrs) + '', 735, 838, 62, A.INK);
    const old = yrs > 14, sw = Math.sin(t * 7.5);
    const o = { x: 380, y: 1200, s: S };
    const sk = ch(old ? MANJHI_OLD : MANJHI, { ...o, view: 'side', facing: 1, lean: 10, armR: { sh: 120 + 50 * sw, el: 20 }, armL: { sh: 70, el: 30 }, legL: { hip: 20, knee: 20 }, legR: { hip: -10, knee: 10 }, expr: 'kizgin' }, t);
    hammer(at(o, sk, 'handR'), -0.4 - 0.9 * sw); chisel(at(o, sk, 'handL'));
    if (sw < -0.85) for (let i = 0; i < 5; i++) { const a = -1.2 + i * 0.5; line(560 + Math.cos(a) * 30, 820 + Math.sin(a) * 30, 560 + Math.cos(a) * 70, 820 + Math.sin(a) * 70, 6, '#E2B13C'); }
  };
  // 1 · köy ve sırt: Falguni başında testiyle yürür, düşer; doktor 70 km
  scenes[1] = t => {
    bg('#F2D9A8'); ridge(10);
    const walk = seg(t, T.l03, w('l03', 'düşüyor') - T.l03), fall = ease.enter(seg(t, w('l03', 'düşüyor') - 0.1, 0.5));
    const x = lerp(-120, 300, walk), y = lerp(1360, 650, walk) + fall * 60;
    ctx.save(); ctx.translate(x, y); ctx.rotate(fall * 1.35); ctx.translate(-x, -y);
    const o = { x, y, s: S };
    const sk = ch(FALGUNI, { ...o, walk: walk < 1 ? (t * 0.9) % 1 : 0.2, facing: 1, armR: { sh: 160, el: 20 }, expr: fall > 0 ? 'korku' : 'notr' }, t);
    const hd = at(o, sk, 'head'); if (fall < 0.3) ell(hd[0] + 4, hd[1] - o.s * 0.75, 40, 34, '#B5652F', LW);
    ctx.restore();
    if (fall >= 0.3) for (let i = 0; i < 4; i++) poly([[150 + i * 40, 700 + (i % 2) * 20], [180 + i * 40, 690], [190 + i * 40, 720]], '#B5652F', 4);
    if (t > w('l03', 'doktor') - 0.3) { rect(150, 830, 270, 150, PAL.paper, LW, 12); text('DOKTOR', 285, 890, 44, A.INK); text('← 70 km', 285, 955, 56, PAL.red); }
  };
  // 2 · köy: Manjhi çekici alır, köylüler gülüyor ("DELİ!")
  scenes[2] = t => {
    village();
    const laugh = t > w('l03', 'köylüler') - 0.2;
    KOY.forEach((c, i) => ch(c, { x: 620 + i * 150, y: GY - 120, s: S * 0.9, view: 'side', facing: -1, expr: laugh ? 'mutlu' : 'notr', armR: laugh ? { sh: 100, el: 60 } : undefined, head: { tilt: laugh ? -10 + 6 * Math.sin(t * 10 + i) : 0 } }, t));
    const o = { x: 260, y: GY - 100, s: S };
    const sk = ch(MANJHI, { ...o, view: 'side', facing: 1, armR: { sh: 70, el: 30 }, armL: { sh: 40, el: 50 }, expr: 'kizgin' }, t);
    hammer(at(o, sk, 'handR'), 0.2); chisel(at(o, sk, 'handL'));
    if (laugh) bubble(760, 760, 'DELİ!', 230);
  };
  // 3 · açılan yol: 110 m'lik yarıktan geçen insanlar; harita 55 → 15 km
  scenes[3] = t => {
    bg('#F2D9A8'); ridge(220);
    const k = ease.state(seg(t, w('l03', 'elli') - 0.2, w('l03', 'iniyor') - w('l03', 'elli') + 0.4));
    for (let i = 0; i < 3; i++) { const u = ((t * 0.18 + i / 3) % 1); ch(KOY[i], { x: lerp(-100, 1100, u), y: 1360, s: S * 0.75, walk: (t + i * 0.3) % 1, facing: 1, expr: 'mutlu' }, t); }
    ch(MANJHI_OLD, { x: 620, y: 1360, s: S, armL: { sh: 20, el: 10 }, armR: { sh: 20, el: 10 }, expr: 'mutlu' }, t);
    rect(140, 360, 800, 300, PAL.paper, LW, 14);
    ctx.save(); ctx.setLineDash([20, 14]); ctx.beginPath(); ctx.moveTo(220, 600); ctx.quadraticCurveTo(540, 300 - 0 * k, 860, 600); ctx.lineWidth = 10; ctx.strokeStyle = '#9A7A5A'; ctx.stroke(); ctx.restore();
    line(220, 600, lerp(220, 860, k), 600, 12, PAL.red); circ(220, 600, 16, A.INK, 0); circ(860, 600, 16, A.INK, 0);
    text('55 km', 540, 430, 54, '#9A7A5A'); if (k > 0.5) text('15 km', 540, 650, 54, PAL.red);
  };
  // 4 · maden kesiti: yüzey, 700 m, çöküş
  scenes[4] = t => {
    bg('#C9DCE2'); rect(-400, 620, 1880, 1800, '#7A5E44', 0); line(-400, 620, 1480, 620, LW);
    for (let i = 0; i < 8; i++) rect(-400, 700 + i * 160, 1880, 70, ['#6E543C', '#836648'][i % 2], 0);
    line(300, 620, 300, 1420, 14, '#4A3828');
    for (let y = 700; y < 1420; y += 140) { line(240, y, 360, y, 6, '#F4EFE3'); }
    text('700 m', 420, 1060, 64, PAL.paper, 'Archivo', 800, 'left');
    const col = seg(t, w('l07', 'çöküyor') - 0.3, 0.8);
    if (col > 0) for (let i = 0; i < 9; i++) { const r = mulberry32(i * 5 + 1); const x = 220 + r() * 180, y = lerp(700, 1150 + r() * 120, ease.enter(col)); poly([[x, y], [x + 40, y - 20], [x + 70, y + 20], [x + 30, y + 40]], '#5A4632', LW); }
    rect(560, 1300, 360, 140, '#3A2E22', LW, 20);
    for (let i = 0; i < 3; i++) { const o = { x: 640 + i * 110, y: 1430, s: S * 0.55 }; const sk = ch(MINERS[i], { ...o, expr: col > 0 ? 'korku' : 'notr' }, t); helmet(o, sk); }
  };
  // 5 · sığınak: 33 kişi, tayın (iki kaşık ton balığı, bir yudum süt); duvarda 17 çentik
  scenes[5] = t => {
    bg('#3A2E22'); rect(-400, 1300, 1880, 900, '#2A2018', 0); line(-400, 1300, 1480, 1300, LW);
    const marks = Math.round(lerp(1, 17, seg(t, w('l07', 26) - 0.2, w('l07', 'bilmiyor') - w('l07', 26) + 0.2)));
    rect(620, 520, 340, 200, '#5A4632', LW, 10); for (let i = 0; i < marks; i++) line(650 + (i % 9) * 34, 560 + Math.floor(i / 9) * 80, 650 + (i % 9) * 34, 620 + Math.floor(i / 9) * 80, 6, '#F4EFE3');
    MINERS.forEach((c, i) => { const o = { x: 130 + i * 160, y: 1300, s: S * 0.75 }; const sk = ch(c, { ...o, view: 'side', facing: i < 3 ? 1 : -1, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 40, el: 70 }, armR: { sh: 40, el: 70 }, expr: 'yorgun', head: { tilt: 10 } }, t); helmet(o, sk); });
    const spoon = seg(t, w('l07', 'kaşık') - 0.3, 0.4), milk = seg(t, w('l07', 'yudum') - 0.3, 0.4);
    if (spoon > 0) { ellOn(540, 1000, spoon); }
    function ellOn(x, y, a) { ctx.save(); ctx.globalAlpha = a; rect(x - 120, y - 70, 240, 140, PAL.paper, LW, 16); line(x - 70, y + 20, x - 10, y - 30, 10, '#9AA3AA'); ell(x - 6, y - 34, 18, 12, '#D9A27A', 5); line(x + 10, y + 20, x + 70, y - 30, 10, '#9AA3AA'); ell(x + 74, y - 34, 18, 12, '#D9A27A', 5); ctx.restore(); }
    if (milk > 0) { ctx.save(); ctx.globalAlpha = milk; rect(780, 900, 90, 120, '#F4F1EA', LW, 10); rect(780, 960, 90, 60, '#E8E4DA', 0); ctx.restore(); }
  };
  // 6 · matkap tavandan çıkar; ucuna not bağlanır; yüzeyde not açılır (doruk)
  scenes[6] = t => {
    const drill = ease.enter(seg(t, w('l07', 'tavandan') - 0.3, 0.8)), note = seg(t, w('l07', 'ucuna') - 0.2, 0.5), up = seg(t, w('l07', 'sığınakta') - 0.4, 0.6);
    bg('#3A2E22'); rect(-400, 300, 1880, 220, '#5A4632', LW); rect(-400, 1300, 1880, 900, '#2A2018', 0); line(-400, 1300, 1480, 1300, LW);
    const tipY = lerp(440, 760, drill) - up * 400;
    rect(510, 200, 60, tipY - 200, '#9AA3AA', LW, 8); poly([[510, tipY], [570, tipY], [540, tipY + 70]], '#6E777E', LW);
    if (drill > 0.5 && up < 0.5) for (let i = 0; i < 6; i++) { const r = mulberry32(i + 11); const yy = 560 + ((t * 300 + i * 70) % 300); poly([[480 + r() * 120, yy], [500 + r() * 120, yy - 14], [520 + r() * 120, yy + 6]], '#7A5E44', 4); }
    if (note > 0 && up < 1) { ctx.save(); ctx.translate(560, tipY + 20); ctx.rotate(0.1); rect(0, 0, 120, 90, PAL.paper, 4, 4); for (let i = 0; i < 3; i++) line(14, 22 + i * 22, 100, 22 + i * 22, 4, '#C2412F'); ctx.restore(); }
    MINERS.forEach((c, i) => { const o = { x: 150 + i * 160, y: 1300, s: S * 0.75 }; const cheer = drill > 0.6; const sk = ch(c, { ...o, armL: cheer ? { sh: 160, el: 10 } : { sh: 20, el: 10 }, armR: cheer ? { sh: 160, el: 10 } : { sh: 20, el: 10 }, expr: cheer ? 'mutlu' : 'saskin', head: { look: [0, -0.6] } }, t); helmet(o, sk); });
    if (up > 0) { const k = ease.enter(up); ctx.save(); ctx.translate(540, 760 - 120 * k); ctx.rotate(-0.04); rect(-360, -150, 720, 300, PAL.paper, LW, 12); text('"Sığınakta iyiyiz,', 0, -40, 66, PAL.red); text('33 kişiyiz."', 0, 50, 66, PAL.red); ctx.restore(); }
  };
  // 7 · seçim: solda yarık ve 22 yıl, sağda 69 gün
  scenes[7] = t => {
    bg('#F2D9A8'); rect(540, 0, 940, 2400, '#3A2E22', 0); line(540, 0, 540, 2400, LW); rect(-400, 1300, 1880, 900, '#D9B88A', 0); line(-400, 1300, 1480, 1300, LW);
    text('22 yıl', 300, 640, 84, PAL.red); text('69 gün', 780, 640, 84, '#F6C445');
    const o = { x: 280, y: 1300, s: S }; const sk = ch(MANJHI_OLD, { ...o, armR: { sh: 140 + 20 * Math.sin(t * 2), el: 20 }, expr: 'mutlu' }, t); hammer(at(o, sk, 'handR'), -0.3);
    const m = { x: 800, y: 1300, s: S }; const msk = ch(MINERS[1], { ...m, armL: { sh: 160, el: 10 }, armR: { sh: 160 - 15 * Math.sin(t * 3), el: 10 }, expr: 'mutlu' }, t); helmet(m, msk);
  };

  // ——— kamera ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(0.8, 600, 765, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(0.75, 620, 780, 0)],
    [T.l02end, ...P(0.8, 600, 770, 0)],
    ...cut(T.l03 - 0.15, P(0.8, 600, 770, 0), P(0.8, 260, 860, 1)),
    [w('l03', 'düşüyor'), ...P(0.9, 440, 560, 1)],
    [w('l03', 'kurtarılamıyor'), ...P(0.85, 480, 800, 1)],
    ...cut(w('l03', 19) - 0.15, P(0.85, 480, 800, 1), P(0.85, 520, 960, 2)),
    ...cut(w('l03', 'yirmi') - 0.15, P(0.85, 520, 960, 2), P(0.8, 600, 765, 0)),
    ...cut(w('l03', 'elli') - 0.15, P(0.8, 600, 765, 0), P(0.75, 540, 860, 3)),
    [T.l04end + 0.2, ...P(0.8, 560, 880, 3)],
    ...cut(T.l05 - 0.15, P(0.8, 560, 880, 3), P(0.6, 540, 960, 4)),
    [T.l06end, ...P(0.75, 600, 1080, 4)],
    [w('l07', 'kırk') - 0.16, ...P(0.75, 640, 1180, 4)],
    ...cut(w('l07', 'kırk') - 0.15, P(0.75, 640, 1180, 4), P(0.72, 560, 940, 5)),
    [w('l07', 'bilmiyor') + 0.4, ...P(0.8, 580, 920, 5)],
    ...cut(w('l07', 'sonra') - 0.15, P(0.8, 580, 920, 5), P(0.72, 540, 900, 6)),
    [hero(T), ...P(0.68, 540, 880, 6)],
    ...cut(T.l08 - 0.15, P(0.68, 540, 880, 6), P(0.72, 540, 960, 7)),
    [T.loop0 - 0.001, ...P(0.78, 540, 960, 7)],
    [T.loop0, ...P(0.78, 600, 765, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'dashrath') - 0.1, w('l03', 'düşüyor') - 0.3, 'DASHRATH MANJHI', 'Hindistan · Gehlaur köyü']],
    numbers: [[w('l05', 'yerin') - 0.1, w('l05', 'altmış') - 0.2, '700 m', 'YERİN ALTINDA'], [w('l07', 'kırk') - 0.1, w('l07', 26) - 0.2, '48 saatte bir', '2 KAŞIK TON BALIĞI'], [w('l07', 26) - 0.1, w('l07', 'sonra') - 0.3, '17 gün', 'HABER YOK']],
  };
}

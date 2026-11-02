// № 045 · Göbeklitepe ve piramitler (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: önde Göbeklitepe'nin T dikilitaşları, arkada küçük Keops Piramidi; yılları taşıyan levhalar.
// Doruk: zaman çizgisi (Göbeklitepe → 7.000 yıl → piramit → 4.600 yıl → bugün). Ters köşe: piramidin yanında mamut.

const SX = 1400;
export function hero(T) { return T.w('l03', 43) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 21) - 0.3, w('l03', 21)], [w('l03', 32) - 0.3, w('l03', 32)], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 13), w('l03', 15), w('l03', 'dikildi'), w('l03', 'yapıldı')],
    thock: [w('l05', 'mamutlar')],
    scratch: [[w('l03', 32), hero(T), 0.02]],
    riser: [w('l03', 32) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const GEZGIN = base({
  key: 'gezgin', name: 'Gezgin', seed: 451,
  torso: { len: 0.72, shoulder: 0.6, hip: 0.56, depth: 0.42, belly: 0, color: '#2E7A6A', shade: '#225C50' },
  arm: { upper: 0.34, lower: 0.32, w: 0.17, color: '#2E7A6A', shade: '#225C50', hand: 0.12 },
  leg: { upper: 0.36, lower: 0.34, w: 0.19, color: '#5A4A3A', shade: '#463A2D' },
  shoe: { color: '#3A2A20', len: 0.27, h: 0.11 },
  skin: '#E9BC94', skinShade: '#D19F78', hair: '#2A1E16',
  features: ['jacket', 'bun'],
});
const AVCI = (seed, skin, hair) => base({
  key: 'avci' + seed, name: 'Avcı', seed,
  torso: { len: 0.8, shoulder: 0.68, hip: 0.56, depth: 0.44, belly: 0, color: '#8A6A44', shade: '#6E5234' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: skin, shade: skin, hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#6E5234', shade: '#57402A' },
  shoe: { color: '#5A4030', len: 0.28, h: 0.1 },
  skin, skinShade: skin, hair,
  features: ['hairMessy', 'mustacheThick'],
});
const AVCI1 = AVCI(452, '#C99A70', '#2A1E16'), AVCI2 = AVCI(453, '#B88A60', '#3A2A1E');

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const STONE = '#D8C8A6', STONE_S = '#BFAE8A';

  // T biçimli dikilitaş: alt orta (x, y), yükseklik h; hayvan kabartması (tilki)
  const pillar = (x, y, h, k = 1) => {
    const wd = h * 0.22;
    rect(x - wd / 2, y - h, wd, h, STONE, LW);
    rect(x - wd * 1.25, y - h - h * 0.2, wd * 2.5, h * 0.22, STONE_S, LW, 6);
    ctx.save(); ctx.translate(x, y - h * 0.55); ctx.scale(h / 600, h / 600); ctx.lineWidth = 7; ctx.strokeStyle = '#8A7A5A';
    ctx.beginPath(); ctx.moveTo(-40, 30); ctx.lineTo(40, 30); ctx.lineTo(55, -10); ctx.lineTo(70, -30); ctx.lineTo(48, -18); ctx.lineTo(-30, -14); ctx.lineTo(-60, -40); ctx.lineTo(-48, 10); ctx.closePath(); ctx.stroke();
    ctx.restore();
  };
  const pyramid = (x, y, wd) => { const h = wd * 0.64; poly([[x - wd / 2, y], [x, y - h], [x + wd / 2, y]], '#E2C27A', LW); for (let i = 1; i < 6; i++) { const yy = y - h * i / 6, hw = wd / 2 * (1 - i / 6); line(x - hw, yy, x + hw, yy, 4, '#C8A45E'); } poly([[x, y - h], [x + wd / 2, y], [x + wd * 0.12, y]], '#C8A45E', LW); };
  const mammoth = (x, y, s = 1, t = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sw = Math.sin(t * 2.2) * 6;
    for (const lx of [-90, -40, 40, 90]) rect(lx - 22, -120, 44, 120, '#6A4A30', LW, 10);
    ell(0, -190, 160, 110, '#7A5638', LW);
    ell(130, -250, 80, 70, '#7A5638', LW);
    ctx.lineWidth = 34; ctx.strokeStyle = '#1F2421'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(190, -240); ctx.quadraticCurveTo(240 + sw, -120, 200, -40); ctx.stroke();
    ctx.lineWidth = 24; ctx.strokeStyle = '#7A5638'; ctx.stroke();
    ctx.lineWidth = 16; ctx.strokeStyle = '#1F2421'; ctx.beginPath(); ctx.moveTo(170, -210); ctx.quadraticCurveTo(260, -170, 250, -260); ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#F4EFE3'; ctx.stroke();
    circ(150, -270, 8, '#1F2421', 0);
    ctx.restore();
  };
  const tag = (x, y, s, col = PAL.red, size = 54) => { ctx.font = `800 ${size}px Archivo`; const wd = ctx.measureText(s).width + 50; rect(x - wd / 2, y - size, wd, size * 1.5, PAL.paper, LW, 14); text(s, x, y + size * 0.15, size, col); };
  const hills = (col = '#C9A86A') => { bg('#E9D6A8'); poly([[-500, GY], [-200, GY - 200], [200, GY - 120], [600, GY - 240], [1000, GY - 110], [1580, GY - 200], [1580, GY + 900], [-500, GY + 900]], col, LW); rect(-500, GY, 2080, 900, '#B89A62', 0); line(-500, GY, 1580, GY, LW); };

  const scenes = [];
  // 0 · kanca: önde dikilitaşlar, arkada küçük piramit; yıl levhaları
  scenes[0] = t => {
    t = loopT(t);
    hills();
    pyramid(820, GY - 40, 260);
    tag(820, GY - 260, '4.600 yıl', '#7A5A12', 44);
    pillar(240, GY + 30, 500); pillar(480, GY + 40, 430);
    tag(300, 800, '11.500 yıl', PAL.red, 56);
    ch(GEZGIN, { x: 700, y: GY + 10, s: 110, expr: 'saskin', head: { look: [-0.7, -0.4], tilt: 6 * Math.sin(2 * Math.PI * t / D * 3) }, armR: { sh: 130, el: 20 } }, t);
  };
  // 1 · Göbeklitepe dikiliyor: avcı toplayıcılar; yazı ve tekerlek yok
  scenes[1] = t => {
    hills('#B8985A');
    const up = ease.state(seg(t, T.l03 + 0.3, 2.0));
    ctx.save(); ctx.translate(540, GY + 20); ctx.rotate(-(1 - up) * 1.2); ctx.translate(-540, -(GY + 20)); pillar(540, GY + 20, 560); ctx.restore();
    const pull = Math.sin(t * 4) * 6;
    ch(AVCI1, { x: 230, y: GY + 10, s: 120, view: 'side', facing: 1, lean: 14, armL: { sh: 70 + pull, el: 20 }, armR: { sh: 80 + pull, el: 20 }, expr: 'kizgin' }, t);
    ch(AVCI2, { x: 860, y: GY + 10, s: 116, view: 'side', facing: -1, lean: 14, armL: { sh: 70 - pull, el: 20 }, armR: { sh: 80 - pull, el: 20 }, expr: 'kizgin' }, t);
    const nw = seg(t, w('l03', 13) - 0.1, 0.3), nt = seg(t, w('l03', 15) - 0.1, 0.3);
    if (nw > 0) { ctx.save(); ctx.globalAlpha = nw; rect(140, 560, 200, 150, '#E9DFC9', LW, 8); for (let i = 0; i < 3; i++) line(170, 600 + i * 34, 310, 600 + i * 34, 6, '#8A7A5A'); line(130, 550, 350, 720, 14, PAL.red); line(350, 550, 130, 720, 14, PAL.red); ctx.restore(); }
    if (nt > 0) { ctx.save(); ctx.globalAlpha = nt; circ(860, 635, 80, '#B9874E', LW); circ(860, 635, 20, '#7A5634', LW); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; line(860 + Math.cos(a) * 20, 635 + Math.sin(a) * 20, 860 + Math.cos(a) * 76, 635 + Math.sin(a) * 76, 6, '#7A5634'); } line(760, 540, 960, 730, 14, PAL.red); line(960, 540, 760, 730, 14, PAL.red); ctx.restore(); }
  };
  // 2 · Keops Piramidi
  scenes[2] = t => {
    bg('#F2D9A0'); circ(860, 520, 90, '#F6C445', LW);
    rect(-500, GY, 2080, 900, '#D9B878', 0); line(-500, GY, 1580, GY, LW);
    const grow = ease.enter(seg(t, w('l03', 21) - 0.2, 1.2));
    ctx.save(); ctx.translate(540, GY); ctx.scale(1, Math.max(0.02, grow)); ctx.translate(-540, -GY); pyramid(540, GY, 900); ctx.restore();
    ch(GEZGIN, { x: 920, y: GY + 10, s: 100, expr: 'saskin', head: { look: [-0.6, -0.5] } }, t);
  };
  // 3 · zaman çizgisi: Göbeklitepe —7.000 yıl— piramit —4.600 yıl— bugün
  scenes[3] = t => {
    bg('#ECE5D5');
    const x0 = 80, xp = 80 + 920 * (6900 / 11500), x1 = 1000, y = 980;
    const g = ease.state(seg(t, w('l03', 32) - 0.1, w('l03', 'uzun') - w('l03', 32) + 0.3));
    line(x0, y, lerp(x0, x1, g), y, 16, '#1F2421');
    const seg1 = Math.min(1, g / (xp - x0) * (x1 - x0));
    rect(x0, y - 60, (xp - x0) * seg1, 40, PAL.red, 4, 6);
    if (g > (xp - x0) / (x1 - x0)) rect(xp, y - 60, (x1 - xp) * Math.min(1, (g - (xp - x0) / (x1 - x0)) / ((x1 - xp) / (x1 - x0))), 40, '#C8A45E', 4, 6);
    ctx.save(); ctx.translate(x0 + 30, y + 330); ctx.scale(0.5, 0.5); pillar(0, 0, 520); ctx.restore();
    if (g > 0.55) { ctx.save(); ctx.translate(xp, y + 300); pyramid(0, 0, 260); ctx.restore(); }
    if (g > 0.95) { circ(x1 - 20, y, 30, PAL.red, LW); text('BUGÜN', x1 - 70, y + 120, 48, A.INK); }
    if (g > 0.4) text('7.000 yıl', (x0 + xp) / 2, y - 100, 76, PAL.red);
    if (g > 0.9) text('4.600', (xp + x1) / 2, y - 100, 64, '#7A5A12');
    const scratch = t > T.l04 - 0.2;
    ch(GEZGIN, { x: 760, y: 1560, s: 110, expr: scratch ? 'saskin' : 'notr', armR: scratch ? { sh: 150, el: 120 } : { sh: 10, el: 0 }, head: { tilt: scratch ? 10 : 0, look: [0, -0.6] } }, t);
  };
  // 4 · ters köşe: piramit yapılırken mamut hâlâ yaşıyor
  scenes[4] = t => {
    bg('#F2D9A0'); rect(-500, GY, 2080, 900, '#D9B878', 0); line(-500, GY, 1580, GY, LW);
    pyramid(760, GY, 560);
    const walk = seg(t, T.l05 + 0.4, 2.4);
    mammoth(lerp(-200, 240, ease.state(walk)), GY + 20, 1.05, t);
    ch(GEZGIN, { x: 900, y: GY + 10, s: 100, expr: walk > 0.6 ? 'saskin' : 'notr', head: { look: [-0.7, -0.3] } }, t);
  };
  // 5 · yerinde görmek: Şanlıurfa tabelası ve dikilitaşların önünde gezgin
  scenes[5] = t => {
    hills();
    pillar(230, GY + 40, 500); pillar(840, GY + 40, 460);
    rect(360, 700, 400, 160, '#2E4A6B', LW, 10); text('GÖBEKLİTEPE', 560, 772, 52, '#F4F1EA'); text('Şanlıurfa', 560, 830, 42, '#F6C445');
    ch(GEZGIN, { x: 520, y: GY + 10, s: 150, expr: 'mutlu', armR: { sh: 110 + 10 * Math.sin(t * 3), el: 10 }, head: { look: [0.2, 0] } }, t);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 1060, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.04, 540, 1060, 0)],
    [T.l02end + 0.1, ...P(1.3, 640, 1160, 0)],
    ...cut(T.l03 - 0.15, P(1.3, 640, 1160, 0), P(1.0, 540, 1080, 1)),
    [w('l03', 20), ...P(1.06, 540, 1080, 1)],
    ...cut(w('l03', 21) - 0.15, P(1.06, 540, 1080, 1), P(0.95, 540, 1060, 2)),
    ...cut(w('l03', 32) - 0.15, P(0.95, 540, 1060, 2), P(1.0, 540, 1080, 3)),
    [T.l04end + 0.2, ...P(1.04, 540, 1160, 3)],
    ...cut(T.l05 - 0.15, P(1.04, 540, 1160, 3), P(1.0, 540, 1080, 4)),
    [T.l05end + 0.2, ...P(1.06, 480, 1100, 4)],
    ...cut(T.l06 - 0.15, P(1.06, 480, 1100, 4), P(1.0, 540, 1080, 5)),
    [T.loop0 - 0.001, ...P(1.05, 540, 1080, 5)],
    [T.loop0, ...P(1.02, 540, 1060, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Piramitler mi eski,', 'Göbeklitepe mi?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 2) - 0.1, w('l03', 11) - 0.2, '11.500 yıl', 'GÖBEKLİTEPE · ŞANLIURFA'], [w('l03', 25) - 0.1, w('l03', 32) - 0.2, '4.600 yıl', 'KEOPS PİRAMİDİ'], [T.l05 + 0.2, T.l06 - 0.2, '~4.000 yıl', 'SON YÜNLÜ MAMUTLAR']],
  };
}

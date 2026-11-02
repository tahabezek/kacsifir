// № 032 · Uranüs'ün kutbunda gece (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: yan yatmış Uranüs'ün karanlık kutbunda fenerli bir kâşif; uzakta Güneş. Yörünge şeması: eksen sabit, kutup
// 42 yıl Güneş'e, 42 yıl karanlığa bakar. Doruk: bir ömür çubuğu, yarısı gece yarısı gündüz.

const SX = 1400;
export function hero(T) { return T.w('l05', 18) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 13) - 0.3, w('l03', 13)], [T.l04 - 0.3, T.l04], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 3), w('l03', 'bakıyor'), w('l03', 'görmüyor')],
    thock: [w('l04', 'görürdüm')],
    scratch: [[w('l05', 8), hero(T), 0.02]],
    riser: [w('l05', 8) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const KASIF = base({
  key: 'kasif', name: 'Kâşif', seed: 321,
  torso: { len: 0.74, shoulder: 0.66, hip: 0.56, depth: 0.44, belly: 0, color: '#D8572A', shade: '#B4431D' },
  arm: { upper: 0.36, lower: 0.34, w: 0.19, color: '#D8572A', shade: '#B4431D', hand: 0.13 },
  leg: { upper: 0.36, lower: 0.34, w: 0.2, color: '#3A3F48', shade: '#2B2F36' },
  shoe: { color: '#1E1E1E', len: 0.28, h: 0.12 },
  skin: '#E7B48A', skinShade: '#CF9A70', hair: '#2A211C',
  features: ['hoodie', 'hairMessy'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const SPACE = '#0E1220', URA = '#8FD3D8', URA_D = '#3A6A78';

  const stars = (seed, n) => { const r = mulberry32(seed); ctx.fillStyle = '#F4F1EA'; for (let i = 0; i < n; i++) { const s = 2 + r() * 4; ctx.fillRect(-300 + r() * 1700, -300 + r() * 2500, s, s); } };
  const sun = (x, y, r) => { circ(x, y, r, '#F6C445', LW); ctx.save(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 18), x + Math.cos(a) * (r + 46), y + Math.sin(a) * (r + 46), 8, '#F6C445'); } ctx.restore(); };
  // Uranüs: merkez, yarıçap, eksen açısı (rad, dikeyden), ışık yönü (rad)
  const uranus = (x, y, r, axis, light) => {
    circ(x, y, r, URA_D, LW);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    ctx.translate(x, y); ctx.rotate(light); ctx.fillStyle = URA; ctx.fillRect(-r * 0.05, -r - 4, r * 2, r * 2 + 8);
    ctx.restore();
    circ(x, y, r, null, LW);
    ctx.save(); ctx.translate(x, y); ctx.rotate(axis);
    ctx.lineWidth = 6; ctx.strokeStyle = '#C9E6EA'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.28, r * 1.55, 0, 0, 7); ctx.stroke();
    line(0, -r * 1.35, 0, r * 1.35, 6, '#F4F1EA');
    ctx.restore();
  };
  const lantern = (x, y, t) => { circ(x, y, 22, '#F6C445', 5); ctx.save(); ctx.globalAlpha = 0.18 + 0.05 * Math.sin(t * 5); circ(x, y, 110, '#F6E7B0', 0); ctx.restore(); };

  const scenes = [];
  // 0 · kanca: karanlık kutupta fenerli kâşif; arkada yan yatmış Uranüs, uzakta küçük Güneş
  scenes[0] = t => {
    t = loopT(t);
    bg(SPACE); stars(5, 120);
    sun(130, 760, 46);
    uranus(700, 900, 210, Math.PI / 2 - 0.15, Math.PI);
    ell(540, GY + 380, 980, 480, '#2A4652', LW);
    ch(KASIF, { x: 620, y: GY, s: 140, expr: 'yorgun', armR: { sh: 60, el: 40 }, head: { look: [-0.6, -0.4], tilt: 4 * Math.sin(2 * Math.PI * t / D * 2) } }, t);
    lantern(740, 1040, t);
    rect(140, 1180, 280, 130, PAL.paper, LW, 14); text('GECE', 280, 1232, 40, A.INK); text('42 YIL', 280, 1288, 54, PAL.red);
  };
  // 1 · yörünge şeması: eksen hep aynı yöne bakar; kutup önce Güneş'e, sonra karanlığa
  scenes[1] = t => {
    bg(SPACE); stars(7, 80);
    const cx = 540, cy = 980, a = 380, b = 210;
    ell(cx, cy, a, b, null, 4); ctx.save(); ctx.setLineDash([16, 14]); ell(cx, cy, a, b, null, 4); ctx.restore();
    sun(cx, cy, 70);
    const u = seg(t, T.l03, T.l03end - T.l03 + 0.6), ang = Math.PI + u * Math.PI * 2;
    const ux = cx + Math.cos(ang) * a, uy = cy + Math.sin(ang) * b, toSun = Math.atan2(cy - uy, cx - ux);
    uranus(ux, uy, 70, Math.PI / 2 - 0.15, toSun);
    const yr = Math.round(84 * u);
    rect(720, 1200, 280, 100, PAL.paper, LW, 14); text(yr + ' yıl', 860, 1270, 58, A.INK);
  };
  // 2 · orada doğmak: karanlıkta kâşif büyür, ufukta ilk gün doğumu
  scenes[2] = t => {
    const dawn = seg(t, w('l04', 'görürdüm') - 0.6, 1.2);
    bg(dawn > 0 ? '#3A2E4A' : SPACE); stars(9, dawn > 0 ? 40 : 120);
    if (dawn > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 1900, GY + 400); ctx.clip(); sun(860, lerp(GY + 80, GY - 120, ease.enter(dawn)), 80); ctx.restore(); }
    ell(540, GY + 380, 980, 480, '#2A4652', LW);
    const age = Math.round(lerp(1, 42, seg(t, T.l04, w('l04', 'görürdüm') - T.l04)));
    const grow = lerp(0.6, 1, seg(t, T.l04, w('l04', 'görürdüm') - T.l04));
    ch(KASIF, { x: 360, y: GY, s: 150 * grow, expr: dawn > 0 ? 'mutlu' : 'yorgun', head: { look: [0.7, -0.2] } }, t);
    rect(120, 560, 280, 140, PAL.paper, LW, 14); text(age + ' yaş', 260, 655, 66, PAL.red);
  };
  // 3 · bir ömür: yarısı gece, yarısı gündüz
  scenes[3] = t => {
    bg('#ECE5D5');
    const g = ease.state(seg(t, T.l05, w('l05', 18) - T.l05 + 0.4));
    const x0 = 90, x1 = 990, xm = (x0 + x1) / 2, y = 900;
    rect(x0, y - 70, (xm - x0) * Math.min(1, g * 2), 140, '#1E2A3A', LW, 12);
    if (g > 0.5) rect(xm, y - 70, (x1 - xm) * Math.min(1, (g - 0.5) * 2), 140, '#F6C445', LW, 12);
    text('GECE · 42 YIL', (x0 + xm) / 2, y - 110, 44, '#1E2A3A');
    if (g > 0.5) text('GÜNDÜZ · 42 YIL', (xm + x1) / 2, y - 110, 44, '#9E6A12');
    const sunUp = t < w('l05', 8);
    if (sunUp) { sun(760, 640, 70); text('Güneş hiç batmıyor', 540, 1120, 46, A.INK); }
    ch(KASIF, { x: 880, y: 1240, s: 90, expr: 'saskin', armL: { sh: 130, el: 20 }, armR: { sh: 130, el: 20 } }, t);
  };
  // 4 · uyku düzeni: karanlık odada yatakta kâşif, saat 42 yıl ileri
  scenes[4] = t => {
    bg('#1E2A3A'); rect(-500, GY, 2080, 900, '#2A3A4C', 0); line(-500, GY, 1580, GY, LW);
    rect(140, 520, 260, 260, '#0E1220', LW, 10); line(270, 520, 270, 780, LW); stars(13, 0);
    rect(180, 1180, 720, 120, '#E9DFC9', LW, 14); rect(180, 1100, 160, 90, '#F4F1EA', LW, 30); rect(160, 1300, 40, 60, '#6A4A2E', LW); rect(880, 1300, 40, 60, '#6A4A2E', LW);
    ctx.save(); ctx.translate(520, 1180); ctx.rotate(-Math.PI / 2); ch(KASIF, { x: 0, y: 0, s: 110, expr: 'yorgun', armL: { sh: 20, el: 30 }, armR: { sh: 20, el: 30 } }, t); ctx.restore();
    circ(820, 700, 90, '#F4F1EA', LW); const a = t * 3; line(820, 700, 820 + Math.cos(a) * 60, 700 + Math.sin(a) * 60, 8, PAL.red); line(820, 700, 820 + Math.cos(a / 12) * 40, 700 + Math.sin(a / 12) * 40, 10);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 560, 1000, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.04, 560, 1000, 0)],
    [T.l02end + 0.1, ...P(1.3, 560, 1100, 0)],
    ...cut(T.l03 - 0.15, P(1.3, 560, 1100, 0), P(1.0, 540, 1000, 1)),
    [T.l03end + 0.2, ...P(1.05, 540, 1000, 1)],
    ...cut(T.l04 - 0.15, P(1.05, 540, 1000, 1), P(1.0, 540, 1040, 2)),
    ...cut(T.l05 - 0.15, P(1.0, 540, 1040, 2), P(1.0, 540, 1000, 3)),
    [hero(T), ...P(1.04, 540, 1000, 3)],
    ...cut(T.l06 - 0.15, P(1.04, 540, 1000, 3), P(1.0, 540, 1000, 4)),
    [T.loop0 - 0.001, ...P(1.05, 540, 1000, 4)],
    [T.loop0, ...P(1.02, 560, 1000, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ["Uranüs'ün kutbunda", 'gece kaç yıl sürer?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 3) - 0.1, w('l03', 13) - 0.2, '84 yıl', 'URANÜS · BİR YIL'], [w('l03', 13) - 0.05, T.l04 - 0.2, '98°', 'EKSEN EĞİKLİĞİ'], [w('l05', 8) - 0.05, T.l06 - 0.2, '42 + 42', 'GECE + GÜNDÜZ (YIL)']],
  };
}

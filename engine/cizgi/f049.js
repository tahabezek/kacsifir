// № 049 · Voyager bir ışık günü (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: tepede teleskopla bakan çocuk ve dede; gökte Dünya'dan Voyager'a uzanan yol: "49 YIL" ↔ ışık "1 GÜN".
// Doruk: en yakın yıldıza 75.000 yıl. Görseller ekranın y 280–1240 aralığında; zemin 1240.

const SX = 1400;
export function hero(T) { return T.w('l05', 'sürerdi') + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'jüpiter') - 0.3, w('l03', 'jüpiter')], [w('l03', 'bugün') - 0.3, w('l03', 'bugün')], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'fırlatıldı'), w('l03', 'jüpiter'), w('l03', 'satürn'), w('l03', 'çıktı')],
    rumble: [[w('l03', 'fırlatıldı') - 0.4, 0.4]],
    scratch: [[w('l05', 'bu'), hero(T), 0.02]],
    riser: [w('l05', 'bu') - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk', name: 'Çocuk', seed: 491,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#E8A33D', shade: '#C8852A' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#E8A33D', shade: '#C8852A', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#3B2A20',
  features: ['hoodie', 'hairMessy'],
});
const DEDE = base({
  key: 'dede', name: 'Dede', seed: 492,
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
  const GY = 1240;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const SPACE = '#1E2A3A';
  const stars = seed => { const r = mulberry32(seed); for (let i = 0; i < 80; i++) circ(-300 + r() * 1700, 120 + r() * 1200, 2 + r() * 3, '#F4EFE3', 0); };
  const earth = (x, y, r) => { circ(x, y, r, '#3F7FB5', Math.max(2, r * 0.08)); ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip(); ell(x - r * 0.3, y - r * 0.2, r * 0.4, r * 0.3, '#5E9A4E', 0); ell(x + r * 0.35, y + r * 0.3, r * 0.3, r * 0.35, '#5E9A4E', 0); ctx.restore(); circ(x, y, r, null, Math.max(2, r * 0.08)); };
  // Voyager: çanak anten + gövde + iki kol; k ölçek
  const voyager = (x, y, k, rot = 0) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); line(-10, 0, -120, 30, 5); line(10, 0, 110, -40, 5); circ(-120, 30, 10, '#C9C4BC', 4); rect(-26, -14, 52, 30, '#C9C4BC', 5, 4); ell(0, -50, 64, 20, '#F4F1EA', 5); line(0, -50, 0, -14, 5); circ(0, -76, 6, '#F6C445', 3); ctx.restore(); };
  const planet = (x, y, r, c, ring = false) => { if (ring) ell(x, y, r * 2, r * 0.5, null, 6); circ(x, y, r, c, LW); if (ring) { ctx.save(); ctx.beginPath(); ctx.rect(x - r * 2.2, y, r * 4.4, r); ctx.clip(); ell(x, y, r * 2, r * 0.5, null, 6); ctx.restore(); } };
  const hill = () => { poly([[-900, GY], [-200, 1120], [400, 1160], [900, 1100], [2000, GY], [2000, 2400], [-900, 2400]], '#2F3B2E', LW); rect(-900, GY, 2900, 1200, '#2F3B2E', 0); };
  const telescope = (x, y) => { line(x - 40, y, x, y - 90, 6); line(x + 40, y, x, y - 90, 6); ctx.save(); ctx.translate(x, y - 100); ctx.rotate(-0.6); rect(-80, -18, 160, 36, '#C9C4BC', LW, 8); ctx.restore(); };

  const scenes = [];
  // 0 · kanca: tepede çocuk ve dede; gökte Dünya → Voyager yolu, ışık atımı periyodik gidip gelir
  scenes[0] = t => {
    t = loopT(t);
    bg(SPACE); stars(4);
    earth(170, 720, 54);
    voyager(900, 690, 0.8, -0.2);
    for (let i = 0; i < 22; i++) circ(240 + i * 30, 715 - i * 1.2, 3, '#8FA9C2', 0);
    const u = ((t / D) * 6) % 1, lx = lerp(230, 880, u);
    line(lx - 60, 712, lx, 702, 8, '#F6E7B0'); circ(lx, 702, 8, '#FFF3C4', 0);
    rect(780, 790, 220, 62, '#F4EFE3', 4, 10); text('49 YIL', 890, 834, 38, PAL.red);
    rect(380, 760, 220, 62, '#F4EFE3', 4, 10); text('IŞIK: 1 GÜN', 490, 803, 32, '#2E4A6B');
    hill();
    telescope(560, 1150);
    ch(COCUK, { x: 420, y: 1170, s: 92, expr: 'saskin', armR: { sh: 120, el: 40 }, head: { look: [0.6, -0.6] } }, t);
    ch(DEDE, { x: 780, y: 1150, s: 98, expr: 'mutlu', armL: { sh: 150, el: 10 }, head: { look: [0.4, -0.6] } }, t);
  };
  // 1 · 1977: fırlatma
  scenes[1] = t => {
    bg('#2A3A52'); stars(6);
    const up = ease.enter(seg(t, w('l03', 'fırlatıldı') - 0.6, 1.6)), ry = lerp(1100, 360, up);
    rect(-900, GY, 2900, 900, '#4A4A50', 0); line(-900, GY, 2000, GY, LW);
    rect(380, 700, 40, 540, '#8C9298', LW);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.28 + t * 6; ctx.save(); ctx.globalAlpha = 0.8; circ(540 + Math.cos(a) * 30, ry + 300 + Math.abs(Math.sin(a)) * 60 + up * 40, 30 + 10 * Math.sin(t * 9 + i), i % 2 ? '#F2A23A' : '#F6D77A', 0); ctx.restore(); }
    rect(500, ry - 120, 80, 380, '#F4F1EA', LW, 10); poly([[500, ry - 120], [540, ry - 210], [580, ry - 120]], PAL.red, LW); poly([[500, ry + 260], [460, ry + 300], [500, ry + 200]], PAL.red, LW); poly([[580, ry + 260], [620, ry + 300], [580, ry + 200]], PAL.red, LW);
    rect(700, 420, 240, 110, '#1F2421', LW, 12); text('1977', 820, 500, 72, '#F6D77A');
  };
  // 2 · Jüpiter, Satürn, sonra Güneş'in etki alanının (balon) dışı
  scenes[2] = t => {
    bg(SPACE); stars(8);
    ctx.save(); ctx.setLineDash([22, 18]); ell(-200, 820, 960, 600, null, 6); ctx.restore();
    circ(-200, 820, 60, '#F6C445', LW);
    planet(300, 600, 70, '#D9A06A'); planet(620, 960, 50, '#E8D9B8', true);
    const k = ease.state(seg(t, w('l03', 'jüpiter') - 0.4, w('l03', 'çıktı') + 0.4 - w('l03', 'jüpiter'))), vx = lerp(200, 980, k), vy = lerp(500, 1060, k) - Math.sin(k * Math.PI) * 120;
    for (let i = 0; i < 30; i++) { const kk = (i / 30) * k; circ(lerp(200, 980, kk), lerp(500, 1060, kk) - Math.sin(kk * Math.PI) * 120, 3, '#8FA9C2', 0); }
    voyager(vx, vy, 0.6, 0.5);
    if (t > w('l03', 'çıktı') - 0.2) { rect(620, 1120, 360, 70, '#F4EFE3', 4, 10); text('YILDIZLARARASI', 800, 1168, 34, '#2E4A6B'); }
  };
  // 3 · bir ışık günü: Dünya ↔ Voyager, sinyal tam bir günde
  scenes[3] = t => {
    bg(SPACE); stars(10);
    earth(150, 860, 70); voyager(930, 820, 0.9, -0.3);
    const sig = seg(t, w('l03', 'oradan') - 0.2, w('l03', 'geliyor') + 0.3 - w('l03', 'oradan'));
    for (let i = 0; i < 4; i++) { const x = lerp(900, 230, (sig + i * 0.06) % 1.0001); ctx.save(); ctx.globalAlpha = sig > 0 && sig < 1 ? 1 - i * 0.2 : 0; ctx.beginPath(); ctx.arc(x, 860, 30 + i * 10, Math.PI * 0.7, Math.PI * 1.3); ctx.lineWidth = 6; ctx.strokeStyle = '#F6E7B0'; ctx.stroke(); ctx.restore(); }
    const hrs = Math.round(24 * ease.state(sig));
    rect(420, 620, 240, 96, '#1F2421', LW, 12); text(`${String(hrs).padStart(2, '0')} sa`, 540, 688, 62, '#F6D77A');
  };
  // 4 · 17 km/sn; en yakın yıldıza 75.000 yıl (doruk)
  scenes[4] = t => {
    bg(SPACE); stars(12);
    voyager(160, 860, 0.5, 0.3);
    const rr = 26 + 4 * Math.sin(t * 5); circ(950, 860, rr, '#FFB0A0', LW); for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; line(950 + Math.cos(a) * (rr + 8), 860 + Math.sin(a) * (rr + 8), 950 + Math.cos(a) * (rr + 26), 860 + Math.sin(a) * (rr + 26), 5, '#FFB0A0'); }
    text('EN YAKIN YILDIZ', 900, 950, 30, '#F4EFE3');
    ctx.save(); ctx.setLineDash([14, 14]); line(220, 860, 900, 860, 5, '#8FA9C2'); ctx.restore();
    const k = ease.state(seg(t, w('l05', 'bu') - 0.2, hero(T) - w('l05', 'bu')));
    circ(lerp(220, 900, k), 860, 7, '#F6D77A', 0);
    rect(360, 620, 360, 96, '#1F2421', LW, 12); text(Math.round(75000 * k).toLocaleString('tr-TR') + ' yıl', 540, 688, 58, '#F6D77A');
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.12, 540, 930, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.16, 545, 930, 0)],
    [T.l02end, ...P(1.7, 620, 1000, 0)],
    ...cut(T.l03 - 0.15, P(1.7, 620, 1000, 0), P(1.0, 540, 900, 1)),
    ...cut(w('l03', 'jüpiter') - 0.15, P(1.0, 540, 900, 1), P(1.25, 560, 800, 2)),
    [w('l03', 'çıktı') + 0.3, ...P(1.3, 600, 840, 2)],
    ...cut(w('l03', 'bugün') - 0.15, P(1.3, 600, 840, 2), P(1.12, 540, 860, 3)),
    [T.l04end, ...P(1.16, 540, 860, 3)],
    ...cut(T.l05 - 0.15, P(1.16, 540, 860, 3), P(1.12, 560, 860, 4)),
    [hero(T), ...P(1.16, 560, 860, 4)],
    ...cut(T.l06 - 0.15, P(1.16, 560, 860, 4), P(1.18, 545, 930, 0)),
    [T.loop0, ...P(1.14, 540, 930, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ["Voyager 49 yılda", 'nereye vardı?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 'bugün') - 0.1, w('l03', 'oradan') - 0.2, '25,9 mr', 'KM · BİR IŞIK GÜNÜ'], [w('l05', 'saniyede') - 0.1, w('l05', 'bu') - 0.2, '17 km/sn', 'VOYAGER 1'], [hero(T) - 0.2, T.l06 + 0.4, '75.000', 'YIL · EN YAKIN YILDIZA']],
  };
}

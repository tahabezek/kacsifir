// № 048 · Evrenin takvimi (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: duvarda koca yıl takvimi; 31 Aralık'ın son saniyesi parlıyor. Doruk: dijital saat 23.59.50'de piramitler,
// ardından yılın son anı 23.59.59,8: bir insan ömrü. Sahneler 1400 px arayla; kamera [t, zoom, x, y].

const SX = 1400;
export function hero(T) { return T.w('l05', 'yapılıyor') + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'güneş') - 0.3, w('l03', 'güneş')], [w('l03', 'dinozorlar') - 0.3, w('l03', 'dinozorlar')], [w('l03', 'insan') - 0.3, w('l03', 'insan')], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'ocak'), w('l03', 'eylül'), w('l03', 14), w('l03', 20), w('l03', 'kala')],
    thock: [w('l03', 'yok')],
    scratch: [[T.l05, hero(T), 0.02]],
    riser: [T.l05 - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk', name: 'Çocuk', seed: 481,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#5E9A4E', shade: '#4C8240' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#5E9A4E', shade: '#4C8240', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#5A3A22',
  features: ['hoodie', 'hairMessy'],
});
const DEDE = base({
  key: 'dede', name: 'Dede', seed: 482,
  head: { w: 0.9, h: 1.04, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.86, shoulder: 0.7, hip: 0.6, depth: 0.46, belly: 0.1, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#2E4A6B', shade: '#233A55', hand: 0.12 },
  leg: { upper: 0.4, lower: 0.38, w: 0.19, color: '#4A4A50', shade: '#36363C' },
  shoe: { color: '#3A2A20', len: 0.3, h: 0.11 },
  skin: '#E2B48E', skinShade: '#C9986F', hair: '#C9C4BC',
  eyes: { gap: 0.32, w: 0.17, h: 0.2, y: 0.04, lid: 0.25 },
  features: ['cardigan', 'baldSides', 'mustacheThick', 'glassesRect'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1240;   // zemin altyazı bandının (1260–1420) üstünde: görseller altyazının altında kalmaz
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const MONTHS = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];

  const room = () => { bg('#EFE6D8'); rect(-900, GY, 2900, 900, '#D8CBB6', 0); line(-900, GY, 2000, GY, LW); };
  // 12 aylık takvim ızgarası (3×4); hl: vurgulanan ay sırası; glow: son günün parlaması (0..1)
  const yearWall = (x, y, cw, chh, hl = -1, glow = 0) => {
    rect(x - 14, y - 70, cw * 3 + 28, chh * 4 + 84, '#F4EFE3', LW, 12);
    rect(x - 14, y - 70, cw * 3 + 28, 56, '#2E4A6B', LW, 12); text('EVRENİN TAKVİMİ', x + cw * 1.5, y - 28, 34, '#F4EFE3');
    for (let m = 0; m < 12; m++) {
      const cx = x + (m % 3) * cw, cy = y + Math.floor(m / 3) * chh;
      rect(cx + 6, cy + 6, cw - 12, chh - 12, m === hl ? '#F6D77A' : '#FFFFFF', 4, 6);
      text(MONTHS[m], cx + cw / 2, cy + 40, 26, m === hl ? PAL.red : '#1F2421');
      for (let d = 0; d < 28; d += 1) { const dx = cx + 18 + (d % 7) * ((cw - 36) / 7), dy = cy + 56 + Math.floor(d / 7) * 18; ctx.fillStyle = 'rgba(31,36,33,0.25)'; ctx.fillRect(dx, dy, 8, 8); }
    }
    if (glow > 0) { const cx = x + 2 * cw + cw - 26, cy = y + 3 * chh + chh - 26; ctx.save(); ctx.globalAlpha = glow; circ(cx, cy, 14, PAL.red, 3); ctx.restore(); }
  };
  // aralık sayfası: 31 gün; dinozor şeridi (from..to), insan işareti
  const decPage = (x, y, s, dinoFrom, dinoTo, human) => {
    rect(x, y, s * 7 + 20, s * 5 + 90, '#FFFFFF', LW, 10); rect(x, y, s * 7 + 20, 70, PAL.red, LW, 10); text('ARALIK', x + (s * 7 + 20) / 2, y + 50, 44, '#F4EFE3');
    for (let d = 1; d <= 31; d++) { const i = d - 1 + 0, cx = x + 10 + (i % 7) * s, cy = y + 80 + Math.floor(i / 7) * s; const dino = d >= dinoFrom && d <= dinoTo; rect(cx + 3, cy + 3, s - 6, s - 6, dino ? '#B9D7A0' : d === 31 && human ? '#F6D77A' : '#F4EFE3', 3, 4); text(String(d), cx + s / 2, cy + s * 0.62, s * 0.36, '#1F2421'); }
  };
  const dino = (x, y, k, t) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const st = Math.sin(t * 8) * 6; poly([[-120, 0], [-60, -70], [40, -80], [90, -150], [130, -150], [140, -120], [100, -110], [80, -40], [60, 0]], '#6AAE4E', LW); poly([[-120, 0], [-220, 20], [-110, -30]], '#6AAE4E', LW); rect(-40, -10, 26, 60 + st, '#5A9A40', LW, 6); rect(30, -10, 26, 60 - st, '#5A9A40', LW, 6); circ(118, -132, 7, '#1F2421', 0); ctx.restore(); };
  const clockFace = (x, y, r, hh, mm, ss = 0) => {
    circ(x, y, r, '#FFFFFF', LW + 2); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82, x + Math.sin(a) * r * 0.94, y - Math.cos(a) * r * 0.94, 6); }
    const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2, ma = (mm + ss / 60) / 60 * Math.PI * 2;
    line(x, y, x + Math.sin(ha) * r * 0.5, y - Math.cos(ha) * r * 0.5, 14); line(x, y, x + Math.sin(ma) * r * 0.78, y - Math.cos(ma) * r * 0.78, 9);
    circ(x, y, 12, '#1F2421', 0);
  };
  const digital = (x, y, s, col = PAL.red) => { rect(x - 330, y - 90, 660, 160, '#1F2421', LW, 18); text(s, x, y + 32, 96, col, 'Archivo', 800); };
  const pyramid = (x, y, k) => { poly([[x - 180 * k, y], [x, y - 170 * k], [x + 180 * k, y]], '#E2B13C', LW); poly([[x, y - 170 * k], [x + 180 * k, y], [x + 60 * k, y]], '#C08A22', LW); };

  const scenes = [];
  // 0 · kanca: duvardaki yıl takvimi, 31 Aralık'ın son anı parlıyor; çocuk ve dede
  scenes[0] = t => {
    t = loopT(t);
    room();
    yearWall(190, 650, 234, 130, -1, 0.6 + 0.4 * Math.sin((2 * Math.PI * t) / D * 6));
    ch(COCUK, { x: 230, y: GY, s: 92, expr: 'saskin', armR: { sh: 150, el: 10 }, head: { look: [0.6, -0.6] } }, t);
    ch(DEDE, { x: 880, y: GY, s: 96, expr: 'mutlu', head: { look: [-0.6, -0.4] } }, t);
  };
  // 1 · Büyük Patlama: 1 Ocak gece yarısı
  scenes[1] = t => {
    bg('#1E2A3A');
    const u = ease.enter(seg(t, T.l03 + 0.2, 1.0));
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2 + t * 0.2; line(540 + Math.cos(a) * 60, 760 + Math.sin(a) * 60, 540 + Math.cos(a) * (80 + 380 * u), 760 + Math.sin(a) * (80 + 380 * u), 8, i % 2 ? '#F6D77A' : '#E8662A'); }
    circ(540, 760, 50 + 30 * u, '#FFF3C4', LW);
    rect(330, 1000, 420, 200, '#FFFFFF', LW, 12); rect(330, 1000, 420, 56, PAL.red, LW, 12); text('OCAK', 540, 1042, 36, '#F4EFE3'); text('1', 540, 1170, 100, '#1F2421');
  };
  // 2 · Eylül başı: Güneş ve Dünya
  scenes[2] = t => {
    room();
    yearWall(150, 560, 234, 130, 8, 0);
    const u = ease.enter(seg(t, w('l03', 'güneş') - 0.1, 0.6));
    circ(960, 720, 80 * u + 1, '#F6C445', LW); circ(985, 900, 34 * u + 1, '#3F7FB5', LW);
  };
  // 3 · Aralık sayfası: dinozorlar 25'te gelir, 30'da gider
  scenes[3] = t => {
    room();
    const from = t > w('l03', 14) - 0.1 ? 25 : 99, to = t > w('l03', 20) - 0.1 ? 30 : from === 25 ? 31 : 0;
    decPage(150, 420, 108, from, Math.min(to, 30), false);
    const walk = seg(t, w('l03', 'dinozorlar'), 2.2), gone = seg(t, w('l03', 'yok') - 0.1, 0.5);
    if (gone < 1) { ctx.save(); ctx.globalAlpha = 1 - gone; dino(lerp(200, 800, walk), 414, 0.7, t); ctx.restore(); }
    if (gone > 0) { ctx.save(); ctx.globalAlpha = gone; circ(900, 260, 40, '#E8662A', LW); line(900, 260, 700, 1100, 10, '#E8662A'); ctx.restore(); }
  };
  // 4 · 31 Aralık, gece yarısına 11 dakika kala: insan türü
  scenes[4] = t => {
    room();
    rect(250, 400, 580, 110, PAL.red, LW, 14); text('31 ARALIK', 540, 480, 64, '#F4EFE3');
    const mm = lerp(30, 49, ease.state(seg(t, w('l03', 'insan') - 0.2, 2.2)));
    clockFace(540, 860, 300, 23, mm);
    const k = seg(t, w('l03', 'kala') - 0.2, 0.5);
    if (k > 0) ch(COCUK, { x: 900, y: GY, s: 92 * ease.enter(k), expr: 'mutlu', armR: { sh: 150, el: 10 } }, t);
  };
  // 5 · dijital saat: piramitler 23.59.50, sonra yılın son anı 23.59.59,8
  scenes[5] = t => {
    room();
    const late = t > T.l06 - 0.2;
    if (!late) {
      const sec = Math.min(50, Math.floor(lerp(30, 50, ease.state(seg(t, T.l05, w('l05', 'yapılıyor') - T.l05)))));
      digital(540, 640, `23.59.${String(sec).padStart(2, '0')}`);
      pyramid(540, 1190, 1.5 * ease.enter(seg(t, T.l05 + 0.1, 0.6)) + 0.01);
    } else {
      digital(540, 640, '23.59.59,8', '#F6C445');
      ch(COCUK, { x: 330, y: GY, s: 110, expr: 'mutlu', armL: { sh: 160, el: 10 }, armR: { sh: 160, el: 10 } }, t);
      ch(DEDE, { x: 760, y: GY, s: 116, expr: 'mutlu', armR: { sh: 120, el: 30 }, head: { look: [-0.5, -0.3] } }, t);
    }
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 940, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.05, 560, 940, 0)],
    [T.l02end, ...P(1.7, 820, 1000, 0)],
    ...cut(T.l03 - 0.15, P(1.7, 820, 1000, 0), P(1.0, 540, 980, 1)),
    ...cut(w('l03', 'güneş') - 0.15, P(1.0, 540, 980, 1), P(1.0, 540, 940, 2)),
    ...cut(w('l03', 'dinozorlar') - 0.15, P(1.0, 540, 940, 2), P(1.0, 560, 900, 3)),
    [w('l03', 'yok') + 0.4, ...P(1.04, 560, 920, 3)],
    ...cut(w('l03', 'insan') - 0.15, P(1.04, 560, 920, 3), P(1.0, 560, 920, 4)),
    [T.l04end + 0.1, ...P(1.06, 560, 900, 4)],
    ...cut(T.l05 - 0.15, P(1.06, 560, 900, 4), P(1.0, 540, 960, 5)),
    [hero(T), ...P(1.06, 540, 940, 5)],
    [T.loop0 - 0.001, ...P(1.1, 540, 960, 5)],
    [T.loop0, ...P(1.03, 550, 940, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Evren bir yıl', 'olsaydı?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 'kala') - 0.2, T.l04 + 0.4, '23.49', '31 ARALIK · İNSAN TÜRÜ'], [T.l06 - 0.1, T.l07 + 0.3, '0,2 sn', 'BİR İNSAN ÖMRÜ']],
  };
}

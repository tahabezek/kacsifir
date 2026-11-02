// № 067 · Bütün altın bir küp (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: yedi katlı apartmanın yanında aynı boyda altın küp. Doruk: Türkiye'nin 6 m'lik küpü ve annenin bilezikleri.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir). Ölçek sahnesinde 1 m = 38 px.

const SX = 1400;
export function hero(T) { return T.w('l05', 26) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 14) - 0.3, w('l03', 14)], [w('l03', 'ama') - 0.3, w('l03', 'ama')], [w('l03', 35) - 0.3, w('l03', 35)], [T.l05 - 0.3, T.l05], [T.l07 - 0.3, T.l07], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'firavunların'), w('l03', 'bankaların'), w('l03', 'kuyumcular'), w('l03', 'telefonların'), w('l07', 'bilezikleri')],
    thock: [w('l03', 'sığıyor')],
    scratch: [[w('l05', 'dünyadaki'), hero(T), 0.02]],
    riser: [w('l05', 'dünyadaki') - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const ANNE = base({
  key: 'anne', name: 'Anne', seed: 671,
  torso: { len: 0.82, shoulder: 0.66, hip: 0.74, depth: 0.5, belly: 0.06, color: '#7A3A4A', shade: '#5E2C39' },
  arm: { upper: 0.38, lower: 0.36, w: 0.19, color: '#7A3A4A', shade: '#5E2C39', hand: 0.13 },
  leg: { upper: 0.36, lower: 0.34, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#3A2420', len: 0.27, h: 0.11 },
  skin: '#EBC29E', skinShade: '#D2A580', hair: '#4A2E22',
  features: ['cardigan', 'skirt', 'bun'],
});
const COCUK = base({
  key: 'cocuk', name: 'Çocuk', seed: 672,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#E8A33D', shade: '#C8852A' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#E8A33D', shade: '#C8852A', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#F2C9A5', skinShade: '#DDAA85', hair: '#3B2A20',
  features: ['hoodie', 'hairMessy'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, M = 38;   // zemin, 1 metre = 38 px (ölçek sahneleri)
  const GOLD = '#E2B13C', GOLD_S = '#C08A22', GOLD_H = '#F6D77A';
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);

  // altın küp: sol alt köşe (x, y=zemin), kenar s (px); ön yüz + üst + yan, parıltı çizgileri
  const cube = (x, y, s, k = 1) => {
    if (s <= 1) return;
    const d = s * 0.2;
    poly([[x, y - s], [x + d, y - s - d * 0.6], [x + s + d, y - s - d * 0.6], [x + s, y - s]], GOLD_H, LW);
    poly([[x + s, y], [x + s, y - s], [x + s + d, y - s - d * 0.6], [x + s + d, y - d * 0.6]], GOLD_S, LW);
    rect(x, y - s, s, s, GOLD, LW);
    ctx.save(); ctx.globalAlpha = 0.55 * k; line(x + s * 0.15, y - s * 0.2, x + s * 0.45, y - s * 0.8, Math.max(3, s * 0.03), '#FFF3C4'); ctx.restore();
  };
  // apartman: x (sol), kat sayısı, kat yüksekliği px
  const apartment = (x, floors, fh, wd = 300) => {
    const h = floors * fh;
    rect(x, GY - h, wd, h, '#D9C8A8', LW);
    rect(x - 10, GY - h - 18, wd + 20, 18, '#9A8668', LW);
    for (let f = 0; f < floors; f++) for (let i = 0; i < 3; i++) rect(x + 30 + i * (wd - 60) / 3 + 8, GY - h + f * fh + fh * 0.25, (wd - 60) / 3 - 16, fh * 0.5, '#8FB4C8', 4);
    rect(x + wd / 2 - 26, GY - fh * 0.75, 52, fh * 0.75, '#6A4A2E', LW);
  };
  const house = (x, fh, wd = 220) => {
    rect(x, GY - 2 * fh, wd, 2 * fh, '#E9D9BC', LW);
    poly([[x - 16, GY - 2 * fh], [x + wd / 2, GY - 2 * fh - fh * 0.9], [x + wd + 16, GY - 2 * fh]], '#B4563A', LW);
    for (let f = 0; f < 2; f++) { rect(x + 28, GY - 2 * fh + f * fh + fh * 0.25, 50, fh * 0.45, '#8FB4C8', 4); rect(x + wd - 78, GY - 2 * fh + f * fh + fh * 0.25, 50, fh * 0.45, '#8FB4C8', 4); }
  };
  const street = () => { bg('#BFD6DC'); rect(-900, GY, 2900, 1600, '#B8B0A0', 0); line(-500, GY, 1580, GY, LW); rect(-500, GY + 60, 2080, 26, '#9A9282', 0); for (let i = 0; i < 6; i++) { circ(-200 + i * 330, 260 + (i % 2) * 60, 46, '#F4F1EA', 0); circ(-150 + i * 330, 250 + (i % 2) * 60, 56, '#F4F1EA', 0); } };
  const coin = (x, y, r) => { circ(x, y, r, GOLD, r * 0.18); circ(x, y, r * 0.62, null, r * 0.1); };
  const car = (x, y, s = 1, col = '#C2412F') => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rect(-60, -40, 120, 30, col, LW, 10); poly([[-34, -40], [-20, -66], [24, -66], [40, -40]], col, LW); rect(-14, -60, 30, 18, '#BFD6DC', 4, 4); circ(-34, -8, 14, '#2A2A2E', LW); circ(34, -8, 14, '#2A2A2E', LW); ctx.restore(); };
  const bangle = (x, y, r, rot = 0) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ell(0, 0, r, r * 0.42, null, Math.max(7, r * 0.3)); ctx.strokeStyle = GOLD; ctx.lineWidth = Math.max(4, r * 0.2); ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.42, 0, 0, 7); ctx.stroke(); ctx.restore(); };

  const scenes = [];
  // 0 · kanca: yedi katlı apartmanın yanında aynı boyda altın küp, kaldırımda anne ve çocuk
  const growK = t => 1;   // kare 0 afiş: küp tam boyda
  scenes[0] = t => {
    t = loopT(t);
    street();
    apartment(110, 7, 3.1 * M * 0.7, 250);
    const s = 22.6 * M * 0.7 * growK(t);
    cube(400, GY, s, 0.6 + 0.4 * Math.sin(t * 2.4));
    ch(ANNE, { x: 40, y: GY, s: 30, expr: 'saskin', head: { look: [0.6, -0.5] } }, t);
    ch(COCUK, { x: 80, y: GY, s: 24, expr: 'saskin', armR: { sh: 150, el: 10 }, head: { look: [0.6, -0.6] } }, t);
  };
  // 1 · erime kazanı: maske, kasa, kuyumcu, telefon kazana düşer
  scenes[1] = t => {
    bg('#2A2A34'); rect(-500, GY, 2080, 700, '#3A3640', 0); line(-500, GY, 1580, GY, LW);
    rect(330, 980, 420, 380, '#4A4A54', LW, 20); ell(540, 980, 230, 60, '#F2A23A', LW); ctx.save(); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 7); ell(540, 980, 190, 44, '#FFE08A', 0); ctx.restore();
    for (let i = 0; i < 3; i++) { const fx = 410 + i * 130; poly([[fx - 30, GY], [fx, GY - 60 - 20 * Math.sin(t * 9 + i)], [fx + 30, GY]], '#E8662A', 4); }
    const items = [['firavunların', 'mask'], ['bankaların', 'bar'], ['kuyumcular', 'ring'], ['telefonların', 'phone']];
    items.forEach(([k, kind], i) => {
      const t0 = w('l03', k) - 0.1, u = seg(t, t0, 0.9); if (u <= 0 || u >= 1) return;
      const x = lerp(i % 2 ? 860 : 220, 540, ease.state(u)), y = lerp(620, 960, u * u);
      ctx.save(); ctx.translate(x, y); ctx.scale(1.9, 1.9); ctx.rotate(u * 2 * (i % 2 ? -1 : 1));
      if (kind === 'mask') { poly([[-60, -80], [60, -80], [70, 20], [0, 90], [-70, 20]], GOLD, LW); for (let j = 0; j < 4; j++) line(-60, -60 + j * 26, 60, -60 + j * 26, 5, '#2E4A6B'); circ(-24, -10, 10, '#1F2421', 0); circ(24, -10, 10, '#1F2421', 0); }
      if (kind === 'bar') { poly([[-70, 30], [70, 30], [50, -30], [-50, -30]], GOLD, LW); }
      if (kind === 'ring') { ctx.lineWidth = 16; ctx.strokeStyle = '#1F2421'; ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.stroke(); ctx.lineWidth = 10; ctx.strokeStyle = GOLD; ctx.stroke(); circ(0, -46, 16, '#BFE6F2', LW); }
      if (kind === 'phone') { rect(-36, -66, 72, 132, '#2B2F33', LW, 12); rect(-26, -54, 52, 100, '#E9EEE6', 0, 6); circ(0, 30, 8, GOLD, 3); }
      ctx.restore();
    });
  };
  // 2 · terazi: 1 m³ altın küp ↔ 14 otomobil
  scenes[2] = t => {
    bg('#E9DFC9'); rect(-500, GY, 2080, 700, '#CDBFA8', 0); line(-500, GY, 1580, GY, LW);
    rect(510, 760, 60, 600, '#6A5A48', LW); poly([[470, GY], [610, GY], [580, GY - 60], [500, GY - 60]], '#6A5A48', LW);
    const tilt = 0.06 * Math.sin(t * 1.3);
    ctx.save(); ctx.translate(540, 760); ctx.rotate(tilt); rect(-430, -14, 860, 28, '#8A7A5A', LW, 8); ctx.restore();
    const ly = 760 - Math.sin(tilt) * 400, ry = 760 + Math.sin(tilt) * 400;
    line(130, ly, 130, ly + 220, 5); line(950, ry, 950, ry + 220, 5);
    rect(30, ly + 220, 200, 22, '#8A7A5A', LW, 6); rect(850, ry + 220, 200, 22, '#8A7A5A', LW, 6);
    cube(80, ly + 220, 90);
    const n = Math.min(14, Math.floor(seg(t, w('l03', 'yani') - 0.2, 1.4) * 14.99));
    for (let i = 0; i < n; i++) car(950 + ((i % 3) - 1) * 66, ry + 212 - Math.floor(i / 3) * 46, 0.52, ['#C2412F', '#2E4A6B', '#5E9A4E', '#E2B13C'][i % 4]);
  };
  // 3 · ölçek: 23 m'lik küp, yedi katlı apartman, 1,6 m'lik insan
  scenes[3] = t => {
    street();
    apartment(80, 7, 3.1 * M, 330);
    const grow = ease.enter(seg(t, w('l03', 35) - 0.2, 1.6));
    cube(470, GY, 22.6 * M * Math.max(0.02, grow));
    ch(COCUK, { x: 1180, y: GY, s: 22, expr: 'saskin', head: { look: [-0.6, -0.6] } }, t);
    if (grow > 0.9) { line(470, GY + 40, 470 + 22.6 * M, GY + 40, 6, PAL.red); line(470, GY + 26, 470, GY + 54, 6, PAL.red); line(470 + 22.6 * M, GY + 26, 470 + 22.6 * M, GY + 54, 6, PAL.red); }
  };
  // 4 · Türkiye: 6 m'lik küp, iki katlı ev; 1/53 oranı
  scenes[4] = t => {
    street();
    const ratio = seg(t, w('l05', 'dünyadaki') - 0.2, 0.8);
    if (ratio <= 0) {
      house(130, 3.1 * M * 1.6, 360);
      const grow = ease.enter(seg(t, T.l05 + 0.2, 1.4));
      cube(600, GY, 6.0 * M * 1.6 * Math.max(0.02, grow));
      ch(ANNE, { x: 1040, y: GY, s: 60, expr: 'saskin', head: { look: [-0.6, -0.4] } }, t);
    } else {
      const k = ease.enter(ratio);
      cube(120, GY, lerp(0, 22.6 * M * 0.5, k) + 1);
      cube(760, GY, 6.0 * M * 0.5);
      if (k > 0.6) { text('53', 330, GY - 22.6 * M * 0.25 + 30, 120, '#7A5A12'); text('1', 820, GY - 50, 70, '#7A5A12'); }
    }
  };
  // 5 · anne ve bilezikler: bilezikler küçük küpün içine uçar
  scenes[5] = t => {
    bg('#EFE6D8'); rect(-500, GY, 2080, 700, '#D8CBB6', 0); line(-500, GY, 1580, GY, LW);
    rect(120, 520, 300, 220, '#BFD6DC', LW, 8); line(270, 520, 270, 740, LW);
    cube(700, GY, 230);
    const fly = seg(t, w('l07', 'bilezikleri') - 0.1, 1.3);
    ch(ANNE, { x: 380, y: GY, s: 150, expr: fly > 0 ? 'mutlu' : 'notr', armR: { sh: lerp(20, 110, ease.enter(Math.min(1, fly * 2))), el: 20 }, head: { look: [0.6, 0] } }, t);
    ch(COCUK, { x: 180, y: GY, s: 120, expr: t > T.l07 + 0.3 ? 'mutlu' : 'saskin', talk: talk(t, T.l06, T.l06end), head: { look: [0.6, -0.2] } }, t);
    for (let i = 0; i < 4; i++) { const u = seg(t, w('l07', 'bilezikleri') + i * 0.18, 1.0); const x = lerp(560, 810, ease.state(u)), y = lerp(980, GY - 140, u) - Math.sin(u * Math.PI) * 200; if (u < 1) bangle(x, y, 34, u * 6 + i); }
    if (t < w('l07', 'bilezikleri')) for (let i = 0; i < 4; i++) bangle(560, 990 + i * 18, 30, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(0.9, 600, 920, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(0.95, 600, 920, 0)],
    [T.l02end + 0.1, ...P(1.15, 560, 860, 0)],
    ...cut(w('l03', 'firavunların') - 0.15, P(1.15, 560, 860, 0), P(1.0, 540, 880, 1)),
    [w('l03', 14), ...P(1.12, 540, 920, 1)],
    ...cut(w('l03', 'ama') - 0.15, P(1.12, 540, 920, 1), P(1.0, 540, 980, 2)),
    [w('l03', 'kadar.') + 0.2, ...P(1.05, 560, 980, 2)],
    ...cut(w('l03', 35) - 0.15, P(1.05, 560, 980, 2), P(0.7, 760, 900, 3)),
    [T.l04end + 0.2, ...P(0.72, 760, 890, 3)],
    ...cut(T.l05 - 0.15, P(0.72, 760, 890, 3), P(1.0, 600, 1000, 4)),
    [w('l05', 'dünyadaki') - 0.25, ...P(1.05, 620, 1010, 4)],
    ...cut(w('l05', 'dünyadaki') - 0.2, P(1.05, 620, 1010, 4), P(0.9, 560, 1000, 4)),
    [hero(T), ...P(0.94, 560, 1000, 4)],
    ...cut(T.l06 - 0.15, P(0.94, 560, 1000, 4), P(1.0, 560, 1000, 5)),
    [T.l07end + 0.2, ...P(1.12, 600, 1020, 5)],
    [T.loop0 - 0.001, ...P(1.12, 600, 1020, 5)],
    [T.loop0, ...P(0.92, 600, 920, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Bütün altın', 'tek küp olsa?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 13) - 0.1, w('l03', 'ama') - 0.3, '223.000 ton', 'BUGÜNE KADAR ÇIKARILAN ALTIN'], [w('l03', 35) + 0.6, T.l05 - 0.3, '22,6 m', 'KÜPÜN KENARI · 7 KAT'], [w('l05', 4) - 0.1, w('l05', 'dünyadaki') - 0.3, '4.210 ton', 'TÜRKİYE · KENAR 6 m'], [w('l05', 'dünyadaki') - 0.05, T.l06 - 0.25, '1 / 53', 'TÜRKİYE / DÜNYA']],
  };
}

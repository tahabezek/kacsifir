// № 046 · Deste evrende ilk kez (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: masada desteyi karıştıran çocuk, havada uçuşan kartlar. 52 × 51 × 50 … çarpımı 68 basamaklı sayıya büyür;
// Dünya'daki herkes Büyük Patlama'dan beri karıştırır; yine de olası sıraların yanında "0,000…(40 sıfır)" kalır.

const SX = 1400;
export function hero(T) { return T.w('l05', 'kalıyor') + 0.5; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 13) - 0.3, w('l03', 13)], [w('l03', 21) - 0.3, w('l03', 21)], [T.l05 - 0.3, T.l05], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 3), w('l03', 9), w('l03', 12)],
    flutter: [[0.2, 2.2], [T.l07, T.l07 + 1.5]],
    scratch: [[w('l05', 8), hero(T), 0.02]],
    riser: [w('l05', 3) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const OYUNCU = base({
  key: 'oyuncu', name: 'Oyuncu', seed: 461,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.7, shoulder: 0.6, hip: 0.52, depth: 0.4, belly: 0, color: '#2E7A6A', shade: '#225C50' },
  arm: { upper: 0.34, lower: 0.32, w: 0.17, color: '#2E7A6A', shade: '#225C50', hand: 0.12 },
  leg: { upper: 0.34, lower: 0.32, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#E9BC94', skinShade: '#D19F78', hair: '#1E1A17',
  features: ['hoodie', 'hairSpiky'],
});
const FACT52 = '80658175170943878571660636856403766975289505440883277824000000000000';

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  // kart simgeleri çizilir (font dışı karakter yok): 0 kupa, 1 maça, 2 karo, 3 sinek
  const suit = (k, x, y, r) => {
    const col = k % 2 ? '#1F2421' : PAL.red; ctx.fillStyle = col;
    if (k === 2) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.75, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.75, y); ctx.closePath(); ctx.fill(); return col; }
    if (k === 3) { for (const [dx, dy] of [[0, -0.45], [-0.45, 0.1], [0.45, 0.1]]) { ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, r * 0.42, 0, 7); ctx.fill(); } ctx.fillRect(x - r * 0.1, y, r * 0.2, r * 0.9); return col; }
    const flip = k === 1 ? -1 : 1;
    ctx.beginPath(); ctx.arc(x - r * 0.42, y - r * 0.2 * flip, r * 0.48, 0, 7); ctx.arc(x + r * 0.42, y - r * 0.2 * flip, r * 0.48, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - r * 0.9, y - r * 0.05 * flip); ctx.lineTo(x + r * 0.9, y - r * 0.05 * flip); ctx.lineTo(x, y + r * 0.95 * flip); ctx.closePath(); ctx.fill();
    if (k === 1) ctx.fillRect(x - r * 0.1, y, r * 0.2, r * 0.95);
    return col;
  };

  const card = (x, y, s, rot, i, back = false) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    rect(-50, -70, 100, 140, back ? '#2E4A6B' : '#F4F1EA', 5, 10);
    if (back) { ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = 3; ctx.strokeRect(-38, -58, 76, 116); }
    else { const col = suit(i % 4, 0, 6, 26); text(String((i % 13) + 1).replace('11', 'J').replace('12', 'Q').replace('13', 'K').replace(/^1$/, 'A'), -26, -36, 28, col, 'Archivo', 800); }
    ctx.restore();
  };
  const table = () => { bg('#2E5A46'); rect(-500, 1180, 2080, 1000, '#7A5634', 0); line(-500, 1180, 1580, 1180, LW); ell(540, 1260, 640, 110, '#3A7A5A', LW); };

  const scenes = [];
  // 0 · kanca: karıştıran çocuk, havada kartlar
  scenes[0] = t => {
    t = loopT(t);
    table();
    const r = mulberry32(46);
    for (let i = 0; i < 14; i++) { const ph = (t * 0.6 + r()) % 1, side = i % 2 ? 1 : -1, x = 540 + side * (170 + r() * 230) + Math.sin(ph * Math.PI * 2 + i) * 40, y = 1000 - Math.sin(ph * Math.PI) * (260 + r() * 300); card(x, y, 0.9, ph * 6 + i, i * 5, i % 3 === 0); }
    ch(OYUNCU, { x: 540, y: 1210, s: 150, armL: { sh: 70, el: 60 + 10 * Math.sin(t * 9) }, armR: { sh: 70, el: 60 - 10 * Math.sin(t * 9) }, expr: 'mutlu', head: { look: [0, 0.4] } }, t);
    rect(380, 1140, 140, 50, '#2E4A6B', LW, 6); rect(560, 1140, 140, 50, '#2E4A6B', LW, 6);
  };
  // 1 · çarpım: 52 × 51 × 50 …, sonra 68 basamaklı sayı
  scenes[1] = t => {
    bg('#ECE5D5');
    const n = [0, 9, 12].filter(k => t > w('l03', k) - 0.1).length;
    ['52', '× 51', '× 50'].forEach((s, i) => { if (i < n) { const x = 220 + i * 300; card(x, 640, 1.9, -0.08 + i * 0.08, i * 7); text(s, x, 450, 96, A.INK); } });
    const big = seg(t, w('l03', 13) - 0.1, 1.6);
    if (big > 0) {
      const shown = Math.round(68 * ease.enter(big)), str = FACT52.slice(0, shown);
      rect(70, 820, 940, 330, PAL.paper, LW, 16);
      for (let row = 0; row < 4; row++) text(str.slice(row * 17, row * 17 + 17), 540, 900 + row * 72, 60, A.INK, 'IBM Plex Mono', 500);
      if (big >= 1) { rect(680, 1110, 320, 84, PAL.red, LW, 12); text('68 BASAMAK', 840, 1168, 42, '#F4F1EA'); }
    }
  };
  // 2 · herkes karıştırıyor: Dünya ve üstünde kartlar, sayaç: 13,8 milyar yıl
  scenes[2] = t => {
    bg('#0E1220'); const r = mulberry32(3); ctx.fillStyle = '#F4F1EA'; for (let i = 0; i < 90; i++) ctx.fillRect(-300 + r() * 1700, -300 + r() * 2400, 3, 3);
    const spin = t * 0.3;
    circ(540, 1000, 360, '#2E6A8A', LW);
    ctx.save(); ctx.beginPath(); ctx.arc(540, 1000, 356, 0, 7); ctx.clip(); for (const [dx, dy, rx, ry] of [[-150, -120, 140, 90], [120, 40, 160, 120], [-60, 200, 110, 70]]) ell(540 + ((dx + spin * 120) % 900 + 900) % 900 - 450, 1000 + dy, rx, ry, '#5E9A4E', 5); ctx.restore();
    for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2 + spin, x = 540 + Math.cos(a) * 400, y = 1000 + Math.sin(a) * 400; card(x, y, 0.42, a + Math.PI / 2 + Math.sin(t * 8 + i) * 0.3, i, i % 2 === 0); }
    const yrs = (13.8 * ease.enter(seg(t, w('l03', 24) - 0.1, 1.6))).toFixed(1).replace('.', ',');
    rect(260, 470, 560, 130, PAL.paper, LW, 14); text(yrs + ' milyar yıl', 540, 556, 58, A.INK);
  };
  // 3 · olmaz: bütün karıştırmalar, olası sıraların yanında bir toz tanesi
  scenes[3] = t => {
    bg('#ECE5D5');
    const zoomOut = ease.enter(seg(t, T.l05, w('l05', 8) - T.l05));
    const cell = lerp(80, 6, zoomOut);
    ctx.save(); ctx.beginPath(); ctx.rect(60, 640, 960, 340); ctx.clip();
    for (let x = 60; x < 1020; x += cell) for (let y = 640; y < 980; y += cell) rect(x + 1, y + 1, cell - 2, cell - 2, '#2E4A6B', Math.min(3, cell * 0.05), 2);
    ctx.restore();
    rect(60, 640, 960, 340, null, LW, 8);
    circ(540, 810, lerp(30, 3, zoomOut), PAL.red, 3);
    const z = seg(t, w('l05', 8) - 0.1, 1.0);
    if (z > 0) { rect(70, 1000, 940, 110, PAL.paper, LW, 14); const zeros = '0,' + '0'.repeat(Math.round(lerp(1, 40, ease.enter(z)))); ctx.font = '500 34px "IBM Plex Mono"'; text(zeros.length > 34 ? zeros.slice(0, 31) + '…' : zeros, 540, 1070, 44, A.INK, 'IBM Plex Mono', 500); }
    ch(OYUNCU, { x: 940, y: 1560, s: 90, expr: t > T.l05 ? 'saskin' : 'notr', talk: talk(t, T.l04, T.l04end), head: { look: [-0.6, -0.5] } }, t);
  };
  // 4 · tarihte bir ilk: elinde deste, "İLK" damgası
  scenes[4] = t => {
    table();
    const stamp = seg(t, w('l06', 'ilk') - 0.15, 0.25);
    ch(OYUNCU, { x: 540, y: 1210, s: 160, armR: { sh: 150, el: 10 }, armL: { sh: 20, el: 30 }, expr: 'mutlu' }, t);
    card(740, 640, 1.2, 0.15, 0, true); card(760, 630, 1.2, 0.2, 7, false);
    if (stamp > 0) { const k = stamp < 1 ? lerp(1.4, 1, ease.enter(stamp)) : 1; ctx.save(); ctx.translate(320, 760); ctx.rotate(-0.18); ctx.scale(k, k); rect(-150, -70, 300, 140, null, 10, 16); ctx.strokeStyle = PAL.red; ctx.lineWidth = 10; ctx.strokeRect(-150, -70, 300, 140); text('İLK', 0, 36, 100, PAL.red); ctx.restore(); }
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.15, 540, 980, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.2, 540, 980, 0)],
    [T.l02end + 0.1, ...P(1.4, 540, 960, 0)],
    ...cut(T.l03 - 0.15, P(1.4, 540, 960, 0), P(1.0, 540, 960, 1)),
    [w('l03', 20), ...P(1.05, 540, 1000, 1)],
    ...cut(w('l03', 21) - 0.15, P(1.05, 540, 1000, 1), P(0.95, 540, 980, 2)),
    [T.l03end + 0.3, ...P(1.0, 540, 980, 2)],
    ...cut(T.l04 - 0.15, P(1.0, 540, 980, 2), P(1.0, 540, 980, 3)),
    [hero(T), ...P(1.02, 540, 980, 3)],
    ...cut(T.l06 - 0.15, P(1.02, 540, 980, 3), P(1.15, 540, 960, 4)),
    [T.loop0 - 0.001, ...P(1.2, 540, 960, 4)],
    [T.loop0, ...P(1.17, 540, 980, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Bu sıra evrende', 'hiç görüldü mü?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[T.l04 - 0.1, w('l05', 3) - 0.25, '28', 'BASAMAK · KARIŞTIRMA'], [w('l05', 3) - 0.1, w('l05', 8) - 0.2, '68', 'BASAMAK · OLASI SIRA']],
  };
}

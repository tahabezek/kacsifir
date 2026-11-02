// № 031 · Venüs'te gün mü uzun, yıl mı (çizgi motoru, iki sesli sayı filmi). Senaryo: research/SENARYOLAR.md §4.
// Kanca: Güneş'in çevresinde Venüs; iki takvim kartı: 1 GÜN = 243, 1 YIL = 225 (Dünya günü).
// Doruk: yörünge bitiyor, bayrak turunu bitiremiyor. NASA: dolanım 224,7 gün, yıldızlara göre dönüş 243 gün (ters yönde).

const SX = 1400;
export function hero(T) { return T.w('l03', 37) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [T.l05 - 0.3, T.l05], [w('l05', 7) - 0.3, w('l05', 7)], [T.l06 - 0.3, T.l06], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 7), w('l03', 24)],
    thock: [w('l03', 37) + 0.2],
    scratch: [[w('l03', 26), hero(T), 0.02]],
    riser: [w('l03', 26) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const COCUK = base({
  key: 'cocuk31', name: 'Çocuk', seed: 311,
  head: { w: 0.94, h: 1, ear: 0.13 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.58, hip: 0.5, depth: 0.4, belly: 0, color: '#E8A33D', shade: '#C8852A' },
  arm: { upper: 0.32, lower: 0.3, w: 0.17, color: '#E8A33D', shade: '#C8852A', hand: 0.12 },
  leg: { upper: 0.32, lower: 0.3, w: 0.19, color: '#3F4A57', shade: '#2E3740' },
  shoe: { color: '#262626', len: 0.26, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#1E1814',
  features: ['hoodie', 'hairSpiky'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const space = (seed = 31) => { bg('#141B2C'); const r = mulberry32(seed); for (let i = 0; i < 140; i++) circ(-300 + r() * 1700, r() * 2000, 2 + r() * 3, '#F4F1EA', 0); };
  const sun = (x, y, r, t) => { for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + t * 0.2; line(x + Math.cos(a) * (r + 14), y + Math.sin(a) * (r + 14), x + Math.cos(a) * (r + 44), y + Math.sin(a) * (r + 44), 8, '#F6C445'); } circ(x, y, r, '#F6C445', LW); };
  // Venüs + bayrak: bayrak açısı ang (radyan; yüzeyden dışarı)
  const venus = (x, y, r, ang) => {
    circ(x, y, r, '#E8D39A', LW);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, 7); ctx.clip(); for (const [dy, c] of [[-0.4, '#D9BE7A'], [0.1, '#F2E2B4'], [0.5, '#D9BE7A']]) ell(x, y + dy * r, r * 1.1, r * 0.14, c, 0); ctx.restore(); circ(x, y, r, null, LW);
    const fx = x + Math.cos(ang) * r, fy = y + Math.sin(ang) * r, ex = x + Math.cos(ang) * (r + 70), ey = y + Math.sin(ang) * (r + 70);
    line(fx, fy, ex, ey, 6); const px = -Math.sin(ang), py = Math.cos(ang); poly([[ex, ey], [ex + px * 40 - Math.cos(ang) * 14, ey + py * 40 - Math.sin(ang) * 14], [ex - Math.cos(ang) * 28, ey - Math.sin(ang) * 28]], PAL.red, 4);
  };
  const card = (x, y, head, val, col) => { rect(x - 150, y - 110, 300, 220, PAL.paper, LW, 14); rect(x - 150, y - 110, 300, 64, col, LW, 14); text(head, x, y - 62, 40, '#F4F1EA'); text(val, x, y + 70, 100, A.INK); };

  // yörünge: u = dolanım oranı (0..1); bayrak açısı ters yönde, 225/243 oranında döner
  const orbit = (t, u, cx = 540, cy = 1000, R = 330) => {
    ctx.save(); ctx.strokeStyle = '#7A86A8'; ctx.lineWidth = 5; ctx.setLineDash([16, 14]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
    sun(cx, cy, 90, t);
    const a = -Math.PI / 2 + u * 2 * Math.PI, vx = cx + R * Math.cos(a), vy = cy + R * Math.sin(a);
    if (u > 0.01) { ctx.save(); ctx.strokeStyle = '#F6C445'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, a); ctx.stroke(); ctx.restore(); }
    venus(vx, vy, 64, -Math.PI / 2 - u * 2 * Math.PI * (224.7 / 243));
  };

  const scenes = [];
  // 0 · kanca: yörüngede Venüs, iki takvim kartı
  scenes[0] = t => {
    t = loopT(t);
    space();
    orbit(t, 0.08 + 0.02 * Math.sin(t * 0.8), 540, 1230, 190);
    card(310, 880, '1 GÜN', '243', PAL.red); card(770, 880, '1 YIL', '225', '#2E4A6B');
  };
  // 1 · yörünge animasyonu: gün sayacı 0→225; bayrak turunu bitiremez
  const uAt = t => ease.state(seg(t, w('l03', 0), w('l03', 37) + 0.2 - w('l03', 0)));
  scenes[1] = t => {
    space(13);
    const u = uAt(t);
    orbit(t, u);
    const day = Math.round(224.7 * u);
    if (u < 0.999) { rect(390, 780, 300, 100, PAL.paper, LW, 14); text(`${day}. gün`, 540, 852, 60, A.INK); }
    else { const k = ease.enter(seg(t, hero(T) - 0.3, 0.4)); ctx.save(); ctx.translate(540, 820); ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k); rect(-250, -60, 500, 120, PAL.paper, LW, 14); text('Gün bitmedi!', 0, 22, 62, PAL.red); ctx.restore(); }
  };
  // 2 · Venüs yüzeyi: Güneş batıdan doğar; çocuk şaşkın
  scenes[2] = t => {
    bg('#E9B872'); rect(-900, GY, 2900, 1600, '#B8763A', 0); line(-900, GY, 2000, GY, LW);
    for (let i = 0; i < 5; i++) poly([[-200 + i * 330, GY], [-60 + i * 330, GY - 160 - (i % 2) * 70], [80 + i * 330, GY]], '#C98A4A', LW);
    const rise = seg(t, w('l05', 9) - 0.6, 2.4);
    sun(200, lerp(GY + 80, GY - 360, ease.enter(rise)), 80, t);
    rect(90, 640, 260, 90, PAL.paper, LW, 12); text('← BATI', 220, 705, 52, A.INK);
    rect(730, 640, 260, 90, PAL.paper, LW, 12); text('DOĞU →', 860, 705, 52, A.INK);
    const turn = t > w('l05', 9);
    ch(COCUK, { x: 640, y: GY, s: 140, expr: turn ? 'saskin' : 'notr', armL: turn ? { sh: 120, el: 10 } : { sh: 15, el: 5 }, head: { look: [turn ? -0.7 : 0.5, -0.3] } }, t);
  };
  // 3 · çocuk ve karışık takvim
  scenes[3] = t => {
    bg('#E9DFC9'); rect(-900, GY, 2900, 1600, '#CDBFA8', 0); line(-900, GY, 2000, GY, LW);
    const flip = Math.floor(t * 3) % 2;
    rect(560, 560, 400, 460, PAL.paper, LW, 16); rect(560, 560, 400, 110, PAL.red, LW, 16); text(flip ? 'GÜN' : 'YIL', 760, 640, 70, '#F4F1EA'); text(flip ? '243' : '225', 760, 900, 170, A.INK);
    ch(COCUK, { x: 330, y: GY, s: 150, expr: t > T.l07 ? 'mutlu' : 'saskin', talk: talk(t, T.l06, T.l06end), armR: { sh: 100 + 20 * Math.sin(t * 3), el: 30 }, head: { tilt: 8 * Math.sin(t * 2), look: [0.5, -0.2] } }, t);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.2, 540, 1060, 0);
  const cam = [
    [0, ...F0],
    [T.l02end, ...P(1.25, 540, 1070, 0)],
    ...cut(T.l03 - 0.15, P(1.25, 540, 1070, 0), P(1.22, 540, 1010, 1)),
    [hero(T), ...P(1.25, 540, 1010, 1)],
    [T.l04end + 0.2, ...P(1.28, 540, 1010, 1)],
    ...cut(T.l05 - 0.15, P(1.28, 540, 1010, 1), P(1.0, 540, 1040, 2)),
    [T.l05end + 0.2, ...P(1.1, 500, 1060, 2)],
    ...cut(T.l06 - 0.15, P(1.1, 500, 1060, 2), P(1.0, 560, 980, 3)),
    [T.l07end + 0.2, ...P(1.1, 560, 980, 3)],
    [T.loop0 - 0.001, ...P(1.1, 560, 980, 3)],
    [T.loop0, ...P(1.19, 540, 1062, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Venüs\'te gün mü', 'uzun, yıl mı?'],
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l03', 3) - 0.1, w('l03', 13) - 0.2, '225 gün', 'VENÜS\'TE 1 YIL'], [w('l03', 20) - 0.1, w('l03', 26) - 0.2, '243 gün', 'VENÜS\'TE 1 DÖNÜŞ']],
  };
}

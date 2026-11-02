// № 066 · Nefesini tutan adam ve yüzeye çıkmayan balina (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y].
// Kanca: havuzda yüzüstü yatan Maričić ve 29 dakikaya yaklaşan duvar saati. A'nın ters köşesi: saat 29:03'te durur.
// Doruk: iki şerit; insanın 29 dakikası ile balinanın 222 dakikası yan yana.

const SX = 1400;
export function hero(T) { return T.w('l07', 44) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[w('l03', 'dalgıç') - 0.3, w('l03', 'dalgıç')], [w('l03', 17) - 0.3, w('l03', 17)], [w('l03', 'diyaframı') - 0.3, w('l03', 'diyaframı')], [w('l03', 'kronometre') - 0.3, w('l03', 'kronometre')], [T.l05 - 0.3, T.l05], [w('l07', 'bilim') - 0.3, w('l07', 'bilim')], [w('l07', 30) - 0.3, w('l07', 30)], [w('l07', 40) - 0.3, w('l07', 40)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'başlatıyor'), w('l03', 'duruyor'), w('l07', 24), w('l07', 27), w('l07', 29)],
    thock: [w('l03', 'gömüyor')],
    rumble: [[w('l05', 'balina'), 0.3], [w('l07', 'çıkıyor'), 0.35]],
    scratch: [[w('l07', 40) - 0.2, hero(T), 0.02]],
    riser: [w('l07', 40) - 0.3, hero(T) - 0.2],
    impact: hero(T) - 0.2,
    loopEnd: T.loop0,
  };
}

const base = (o) => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const MARICIC = base({ key: 'maricic2d', name: 'Vitomir Maričić', seed: 201,
  torso: { len: 0.88, shoulder: 0.72, hip: 0.56, depth: 0.42, belly: 0, color: '#1F2421', shade: '#141816' },
  arm: { upper: 0.44, lower: 0.42, w: 0.18, color: '#1F2421', shade: '#141816', hand: 0.13 },
  leg: { upper: 0.44, lower: 0.42, w: 0.2, color: '#1F2421', shade: '#141816' },
  shoe: { color: '#E8C9A8', len: 0.28, h: 0.08 },
  skin: '#E8C9A8', skinShade: '#CFAE8C', hair: '#2A1E16', features: ['hairSlick'] });
const HAKEM = base({ key: 'hakem066', name: 'Hakem', seed: 211,
  torso: { len: 0.86, shoulder: 0.68, hip: 0.56, depth: 0.42, belly: 0.06, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#2E4A6B', shade: '#233A55', hand: 0.12 },
  leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#2A2F38', shade: '#1F232A' },
  shoe: { color: '#1A1A1A', len: 0.3, h: 0.11 }, skin: '#E9B98F', skinShade: '#D29E74', hair: '#3A332C', features: ['jacket', 'hairSlick'] });
const BILIM = base({ key: 'bilim066', name: 'Bilim insanı', seed: 223,
  torso: { len: 0.84, shoulder: 0.64, hip: 0.6, depth: 0.42, belly: 0.04, color: '#F4F1EA', shade: '#D9D4C8' },
  arm: { upper: 0.4, lower: 0.38, w: 0.17, color: '#F4F1EA', shade: '#D9D4C8', hand: 0.12 },
  leg: { upper: 0.4, lower: 0.38, w: 0.19, color: '#3A4A5A', shade: '#2B3744' },
  shoe: { color: '#262626', len: 0.28, h: 0.11 }, skin: '#C89A78', skinShade: '#A8805E', hair: '#5A3A2A', features: ['jacket', 'bun', 'glassesRect'] });

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, bg, ch, crowd, LW, path, fs } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const fmt = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const startT = w('l03', 'başlatıyor'), twentyT = w('l03', 'yirminci'), stopT = w('l03', 'duruyor');
  // duvar saati: kancada 28:40'tan gerçek zamanlı; l03'te 00:00 → 20:00 → 29:03
  const clk = t => { t = loopT(t); if (t < T.l03) return 1720 + t; if (t < startT) return 0; if (t < twentyT) return 1200 * ease.state(seg(t, startT, twentyT - startT)); if (t < stopT) return lerp(1200, 1743, seg(t, twentyT, stopT - twentyT)); return 1743; };
  const clock = (x, y, wd, t, big = 1) => { rect(x, y, wd, wd * 0.42, '#1F2421', LW, 14); const done = loopT(t) >= stopT && loopT(t) < T.l05; text(fmt(clk(t)), x + wd / 2, y + wd * 0.31, wd * 0.25 * big, done ? '#F6C445' : '#FF5A3A'); };
  const bubble = (x, y, s, wd = 300, size = 46) => { rect(x - wd / 2, y - 70, wd, 100, PAL.paper, LW, 24); poly([[x - 30, y + 28], [x - 4, y + 28], [x - 40, y + 70]], PAL.paper, LW); ctx.fillStyle = PAL.paper; ctx.fillRect(x - 28, y + 22, 22, 9); text(s, x, y + 2, size, A.INK); };
  const think = (x, y, lines, wd) => { const h = 70 + lines.length * 50; ell(x, y, wd / 2, h / 2, PAL.paper, LW); circ(x - wd * 0.3, y + h / 2 + 20, 18, PAL.paper, LW); circ(x - wd * 0.38, y + h / 2 + 52, 10, PAL.paper, LW); lines.forEach((s, i) => text(s, x, y - (lines.length - 1) * 25 + i * 50 + 16, 44, A.INK)); };
  // yüzüstü yatan dalgıç: ayak (x, y) noktasından sağa uzanır; yüz suya dönük
  const lying = (x, y, s, o = {}, t) => { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2 + (o.lift || 0)); ctx.translate(-x, -y); ch(MARICIC, { x, y, s, view: 'side', facing: 1, armL: { sh: 165, el: 5 }, armR: { sh: 172, el: 5 }, legL: { hip: 0, knee: 4 }, legR: { hip: 0, knee: 4 }, lean: o.lean || 0, expr: o.expr || 'yorgun', head: { tilt: o.tilt || 0 } }, t); ctx.restore(); };
  // balina (yan görünüş): baş +x, gagalı kısa burun, sırtta beyaz yara izleri, kuyruk yukarı-aşağı vurur
  const whale = (x, y, k, rot, t) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    const fl = 26 * Math.sin(t * 3.2);
    path([[150, 0], [120, -38], [40, -62], [-120, -56], [-230, -26], [-290, -6 + fl * 0.3], [-290, 8 + fl * 0.3], [-230, 26], [-120, 50], [40, 56], [120, 34], [168, 10]]); fs('#5E6468');
    poly([[150, 0], [196, -4], [198, 10], [166, 12]], '#8A8E90', LW * 0.8);
    poly([[-286, fl * 0.3], [-340, -60 + fl], [-318, fl * 0.5], [-340, 60 + fl], [-286, fl * 0.3 + 6]], '#4E5458', LW);
    poly([[-40, -58], [-70, -96], [-90, -60]], '#4E5458', LW);
    ctx.strokeStyle = '#EDE8DC'; ctx.lineWidth = 3.5; const r = mulberry32(66); for (let i = 0; i < 16; i++) { const sx = -220 + r() * 340, sy = -40 + r() * 70; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 24 + r() * 50, sy + (r() - 0.5) * 18); ctx.stroke(); }
    circ(118, -6, 7, A.INK, 0);
    ctx.restore();
  };
  const sea = (top, bot) => { const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(-1400, -1400, 3880, 4720); };

  const scenes = [];
  // 0 · havuz: yüzüstü dalgıç, duvar saati, şerit ipleri
  scenes[0] = t => {
    const lt = loopT(t);
    bg('#E9E2D2'); for (let i = -6; i < 20; i++) for (let j = 0; j < 9; j++) rect(i * 90, 380 + j * 90, 90, 90, null, 2);
    clock(360, 600, 400, t);
    rect(-400, 1150, 1880, 1000, '#D9CDB8', 0); rect(40, 1190, 1000, 700, '#7CC4D6', LW, 6); line(40, 1200, 1040, 1200, 4, '#EAF6FA');
    for (const yy of [1250, 1330]) { for (let x = 60; x < 1030; x += 34) circ(x, yy, 9, '#E2B13C', 3); }
    const under = lt >= w('l03', 'gömüyor') - 0.3 || lt < T.l03 || t >= T.loop0;
    const up = seg(lt, stopT, 0.6) * (lt < T.l05 ? 1 : 0);
    const twitch = lt > w('l03', 'diyaframı') - 0.2 && lt < w('l03', 'sonradan') ? Math.max(0, Math.sin(lt * 13)) : 0;
    if (under || up > 0) lying(240, 1218 - twitch * 10, S, { lean: twitch * 14, lift: -0.55 * ease.enter(up), expr: up > 0 ? 'mutlu' : 'yorgun', tilt: up > 0 ? -20 : 0 }, t);
    if (twitch > 0) for (const dx of [0, 30]) line(470 + dx, 1110, 490 + dx, 1070, 6, PAL.red);
    if (lt > w('l03', 'sadece') - 0.2 && lt < w('l03', 'yirminci') - 0.1) think(700, 960, ['Sadece on', 'saniye daha.'], 360);
    for (let i = 0; i < 5; i++) { const bx = 700 + i * 22, by = 1180 - ((lt * 60 + i * 37) % 120); circ(bx, by, 6, '#EAF6FA', 3); }
  };
  // 1 · havuz başı: oksijen maskesiyle oturan dalgıç
  scenes[1] = t => {
    bg('#E9E2D2'); for (let i = -6; i < 20; i++) for (let j = 0; j < 9; j++) rect(i * 90, 380 + j * 90, 90, 90, null, 2);
    rect(-400, 1270, 1880, 900, '#D9CDB8', 0); rect(580, 1290, 700, 600, '#7CC4D6', LW, 6);
    rect(150, 1050, 70, 220, '#4E7FA8', LW, 30); line(220, 1080, 330, 1020, 6, '#8A9AA8');
    ch(MARICIC, { x: 430, y: 1278, s: S, view: 'side', facing: 1, legL: { hip: 70, knee: 70 }, legR: { hip: 64, knee: 64 }, armL: { sh: 20, el: 40 }, armR: { sh: 120, el: 140 }, expr: 'yorgun', head: { tilt: 6 } }, t);
    ell(470, 1020, 40, 30, '#DDE8EE', LW);
    const br = 0.5 + 0.5 * Math.sin(t * 2.4); ell(470, 1020, 22 + 6 * br, 14 + 4 * br, 'rgba(255,255,255,0.6)', 0);
  };
  // 2 · hakemler: beş hakem kronometreyle; büyük saat
  scenes[2] = t => {
    bg('#DCD3C0'); clock(300, 520, 480, t, 1.1);
    const stopped = t >= stopT;
    for (let i = 0; i < 5; i++) { const x = 140 + i * 200; ch(HAKEM, { x, y: GY, s: S * 0.85, armR: { sh: 60, el: 80 }, expr: stopped ? 'saskin' : 'notr', head: { look: [0, -0.4] } }, t); circ(x + 70, GY - 230, 20, '#F4F1EA', 4); }
    rect(40, 1150, 1000, 50, '#7A5634', LW, 6); rect(70, 1200, 940, 300, '#8A6640', LW, 6);
  };
  // 3 · okyanus yüzeyi: dalış (l05) ve üç saat sonra nefes (l07)
  scenes[3] = t => {
    const surfacing = t > w('l07', 30) - 0.3;
    bg('#BFD6DC'); rect(-1400, 1150, 3880, 1200, '#3E7A9A', 0); line(-1400, 1150, 2480, 1150, LW);
    if (!surfacing) { const u = ease.enter(seg(t, T.l05 + 0.2, 2.6)); whale(lerp(380, 640, u), lerp(1140, 1500, u), 1.0, lerp(0.15, 1.1, u), t); rect(-1400, 1160, 3880, 1200, 'rgba(62,122,154,0.55)', 0); }
    else { const u = ease.enter(seg(t, w('l07', 30) - 0.2, 1.4)); rect(-1400, 1160, 3880, 1200, 'rgba(62,122,154,0.4)', 0); whale(540, lerp(1360, 1170, u), 1.0, lerp(-0.5, 0, u), t); const b = seg(t, w('l07', 'çıkıyor') - 0.4, 1.4); if (b > 0 && b < 1) for (let i = 0; i < 6; i++) circ(590 + (i - 2.5) * 22 * b, 1080 - 220 * b + Math.sin(i) * 20, 20 + 30 * b, 'rgba(244,239,227,' + (0.9 * (1 - b)) + ')', 0); }
  };
  // 4 · derinlik: karanlığa dalan balina, oksijen göstergesi
  scenes[4] = t => {
    const u = seg(t, T.l07, w('l07', 'bilim') - T.l07);
    sea(lerp(0, 0, u) ? '#2E6A8A' : '#2E6A8A', '#05090E'); ctx.fillStyle = 'rgba(5,9,14,' + (0.5 * u) + ')'; ctx.fillRect(-1400, -1400, 3880, 4720);
    whale(540, lerp(700, 1160, u), 1.1, 1.25, t);
    rect(860, 420, 120, 980, '#1F2421', LW, 10); for (let i = 0; i <= 6; i++) { line(860, 420 + i * 160, 900, 420 + i * 160, 4, '#F4F1EA'); }
    circ(920, lerp(440, 1380, u), 18, PAL.red, 4);
    const o2 = seg(t, w('l07', 'hesaplara') - 0.2, 0.4);
    if (o2 > 0) { const left = 1 - seg(t, w('l07', 'oksijeni'), w('l07', 'yetmeli') + 0.6 - w('l07', 'oksijeni')); rect(120, 560, 300, 90, PAL.paper, LW, 12); rect(140, 580, 260 * left, 50, left < 0.3 ? PAL.red : '#5E9A4E', 0, 6); text('O₂ ~30 dk', 270, 700, 40, '#F4F1EA'); }
  };
  // 5 · gemi: bilim insanları, derinlik ekranı, duvar saati 1–2–3 saat
  scenes[5] = t => {
    bg('#3A4652'); rect(-400, 1300, 1880, 900, '#2A323A', 0); line(-400, 1300, 1480, 1300, LW);
    rect(140, 560, 800, 460, '#0E1A22', LW, 16);
    const h = t < w('l07', 24) ? 0.6 * seg(t, w('l07', 'bilim'), w('l07', 24) - w('l07', 'bilim')) : t < w('l07', 27) ? lerp(1, 2, seg(t, w('l07', 24), w('l07', 27) - w('l07', 24))) : lerp(2, 3, seg(t, w('l07', 27), w('l07', 29) - w('l07', 27)));
    const xs = hh => 190 + 700 * hh / 4; ctx.strokeStyle = '#4AE0D0'; ctx.lineWidth = 8; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const hh = h * i / 80, d = hh < 0.12 ? hh / 0.12 : 1 - 0.04 * Math.sin(hh * 9); const X = xs(hh), Y = 600 + 360 * d; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); circ(xs(h), 600 + 360 * (h < 0.12 ? h / 0.12 : 1), 12, '#4AE0D0', 0);
    for (let i = 0; i <= 4; i++) text(i + ' sa', xs(i), 1000, 30, '#9FD8E0');
    rect(380, 380, 320, 140, PAL.paper, LW, 12); text(Math.max(1, Math.floor(h + 0.001)) + ' saat', 540, 475, 70, h >= 2.9 ? PAL.red : A.INK);
    const worry = h > 1.5;
    ch(BILIM, { x: 300, y: GY, s: S * 0.95, view: 'side', facing: 1, armR: { sh: 70, el: 60 }, expr: worry ? 'saskin' : 'notr', head: { look: [0.3, -0.5] } }, t);
    ch(HAKEM, { x: 800, y: GY, s: S * 0.95, view: 'side', facing: -1, armL: { sh: worry ? 150 : 20, el: worry ? 120 : 10 }, expr: worry ? 'korku' : 'notr', head: { look: [-0.3, -0.5] } }, t);
  };
  // 6 · iki şerit: 29 dk ve 222 dk
  const M = 0.0; const W1 = 820 / 222;
  const humLen = t => 29 * ease.state(seg(t, w('l07', 40) - 0.3, 0.8));
  const whLen = t => 29 + 193 * ease.enter(seg(t, w('l07', 'yedi') - 0.3, hero(T) - w('l07', 'yedi') + 0.3));
  scenes[6] = t => {
    bg('#E8E0CC'); rect(-400, 1300, 1880, 900, '#CDBFA8', 0); line(-400, 1300, 1480, 1300, LW);
    const hl = humLen(t), wl = Math.max(hl, whLen(t) * (t > w('l07', 'yedi') - 0.3 ? 1 : 0));
    text('BALİNA', 130, 780, 52, A.INK, 'Archivo', 800, 'left'); rect(130, 800, Math.max(6, wl * W1), 90, '#4AA8C8', LW, 12);
    text('İNSAN', 130, 1010, 52, A.INK, 'Archivo', 800, 'left'); rect(130, 1030, Math.max(6, hl * W1), 90, '#F6C445', LW, 12);
    if (hl > 1) text('29 dk', 150 + hl * W1, 1095, 44, A.INK, 'Archivo', 800, 'left');
    for (let m = 0; m <= 222; m += 30) line(130 + m * W1, 1140, 130 + m * W1, 1165, 4);
    whale(130 + wl * W1 - 40, 700, 0.42, 0, t);
    const done = whLen(t) >= 221.5;
    ch(MARICIC, { x: 860, y: 1330, s: S * 0.75, expr: done ? 'saskin' : 'notr', armL: { sh: done ? 150 + 15 * Math.sin(t * 4) : 15, el: 10 }, armR: { sh: done ? 150 - 15 * Math.sin(t * 4) : 15, el: 10 }, head: { look: [-0.6, -0.5] } }, t);
  };

  // ——— kamera ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(0.72, 560, 1121, 0);
  const cam = [
    [0, ...F0],
    [T.l02 + 0.4, ...P(0.8, 580, 1125, 0)],
    ...cut(w('l03', 'dalgıç') - 0.15, P(0.8, 580, 1125, 0), P(1.0, 440, 940, 1)),
    [w('l03', 'soluyor'), ...P(1.12, 440, 900, 1)],
    ...cut(w('l03', 'sonra') - 0.15, P(1.12, 440, 900, 1), P(0.8, 600, 1133, 0)),
    ...cut(w('l03', 17) - 0.15, P(0.8, 600, 1133, 0), P(0.75, 540, 1000, 2)),
    ...cut(w('l03', 'diyaframı') - 0.15, P(0.75, 540, 1000, 2), P(0.95, 640, 1133, 0)),
    [w('l03', 'yirminci'), ...P(0.78, 560, 1121, 0)],
    ...cut(w('l03', 'kronometre') - 0.15, P(0.78, 560, 1121, 0), P(0.8, 540, 900, 2)),
    [stopT + 0.3, ...P(0.95, 540, 780, 2)],
    ...cut(T.l04 - 0.15, P(0.95, 540, 780, 2), P(0.85, 620, 1133, 0)),
    ...cut(T.l05 - 0.15, P(0.85, 620, 1133, 0), P(0.9, 520, 1080, 3)),
    [T.l06end, ...P(0.85, 600, 1180, 3)],
    ...cut(T.l07 - 0.15, P(0.85, 600, 1180, 3), P(0.62, 560, 960, 4)),
    [w('l07', 'bilim') - 0.2, ...P(0.66, 520, 1000, 4)],
    ...cut(w('l07', 'bilim') - 0.15, P(0.66, 520, 1000, 4), P(0.62, 540, 960, 5)),
    [w('l07', 29) + 0.4, ...P(0.7, 540, 900, 5)],
    ...cut(w('l07', 30) - 0.15, P(0.7, 540, 900, 5), P(0.9, 540, 1080, 3)),
    ...cut(w('l07', 40) - 0.3, P(0.9, 540, 1080, 3), P(0.7, 540, 894, 6)),
    [hero(T), ...P(0.68, 540, 885, 6)],
    [T.loop0 - 0.001, ...P(0.72, 545, 900, 6)],
    [T.loop0, ...P(0.74, 560, 1123, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'vitomir') - 0.1, w('l03', 'sonra') - 0.2, 'VITOMIR MARIČIĆ', 'serbest dalgıç · Hırvatistan, 2025']],
    numbers: [[w('l07', 'yedi') - 0.2, T.l09 + 0.3, t => Math.round(whLen(t)) + ' dk', 'BALİNANIN TEK NEFESİ']],
  };
}

// № 037 · Gökten düşen kız ve yedi kez yıldırım çarpan adam (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: bulutların arasında dönerek düşen koltuk sırası ve ona bağlı Juliane. A'nın ters köşesi: 92 kişiden yalnızca o.
// Doruk: 15.300 kişilik kalabalıkta ortalama bir kişiye bir yıldırım düşer; Roy'un üstüne yedi tane.

const SX = 1400;
const base = (o) => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const JULIANE = base({
  key: 'juliane', name: 'Juliane Koepcke', seed: 371,
  head: { w: 0.94, h: 1, ear: 0.11 }, neck: 0.05,
  torso: { len: 0.74, shoulder: 0.58, hip: 0.6, depth: 0.38, belly: 0, color: '#E9D9B0', shade: '#CDBB8E' },
  arm: { upper: 0.38, lower: 0.36, w: 0.15, color: '#F0D4BE', shade: '#D8B89E', hand: 0.11 },
  leg: { upper: 0.38, lower: 0.36, w: 0.16, color: '#F0D4BE', shade: '#D8B89E' },
  shoe: { color: '#F2F2EE', len: 0.26, h: 0.1 },
  skin: '#F0D4BE', skinShade: '#D8B89E', hair: '#B08A5A',
  features: ['skirt', 'hairMessy'],
});
const MOM = base({
  key: 'anne', name: 'Anne', seed: 373,
  head: { w: 0.94, h: 1, ear: 0.11 }, neck: 0.05,
  torso: { len: 0.78, shoulder: 0.62, hip: 0.66, depth: 0.42, belly: 0, color: '#5A6A7A', shade: '#46545F' },
  arm: { upper: 0.38, lower: 0.36, w: 0.17, color: '#5A6A7A', shade: '#46545F', hand: 0.12 },
  leg: { upper: 0.38, lower: 0.36, w: 0.18, color: '#5A6A7A', shade: '#46545F' },
  shoe: { color: '#2A2420', len: 0.27, h: 0.1 },
  skin: '#EED0B8', skinShade: '#D6B49A', hair: '#6A5A44',
  features: ['cardigan', 'skirt', 'bun'],
});
const ROY = base({
  key: 'roy', name: 'Roy Sullivan', seed: 377,
  head: { w: 0.96, h: 1.02, ear: 0.13 }, neck: 0.07,
  torso: { len: 0.92, shoulder: 0.8, hip: 0.66, depth: 0.5, belly: 0.1, color: '#5A6A44', shade: '#46553A' },
  arm: { upper: 0.44, lower: 0.42, w: 0.2, color: '#5A6A44', shade: '#46553A', hand: 0.14 },
  leg: { upper: 0.44, lower: 0.42, w: 0.22, color: '#4A5A3A', shade: '#3A472E' },
  shoe: { color: '#2A2420', len: 0.33, h: 0.12 },
  skin: '#E2B896', skinShade: '#C99E7C', hair: '#4A3A2A',
  features: ['jacket', 'hairSlick'],
});
const WORKER = base({
  key: 'ormanci', name: 'Ormancı', seed: 379,
  torso: { len: 0.84, shoulder: 0.7, hip: 0.56, depth: 0.42, belly: 0, color: '#6A6A4A', shade: '#55553A' },
  arm: { upper: 0.42, lower: 0.4, w: 0.18, color: '#6A6A4A', shade: '#55553A', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#3A3A30', shade: '#2B2B24' },
  shoe: { color: '#2A2420', len: 0.3, h: 0.11 },
  skin: '#A8784E', skinShade: '#8E6440', hair: '#141210',
  features: ['hairSlick', 'mustacheThin'],
});

export function hero(T) { return T.w('l07', 39) + 0.4; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 17) - 0.3, w('l03', 17)], [w('l03', 'babasının') - 0.3, w('l03', 'babasının')], [w('l03', 'ormancılar') - 0.3, w('l03', 'ormancılar')], [T.l05 - 0.3, T.l05], [w('l07', 'sonra') - 0.3, w('l07', 'sonra')], [w('l07', 'yedincisi') - 0.3, w('l07', 'yedincisi')], [w('l07', 'oysa') - 0.3, w('l07', 'oysa')], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'on'), w('l07', 'kaşları'), w('l07', 'omzu'), w('l07', 'saçı')],
    thock: [w('l03', 'arasında')],
    rumble: [[0.4, 0.3], [w('l03', 'yıldırım'), 0.7], [w('l05', 'yıldırım'), 0.4], [w('l07', 'ilk') + 0.3, 0.6], [w('l07', 'çarpıyor'), 0.6]],
    scratch: [[w('l07', 'oysa'), hero(T), 0.02]],
    riser: [w('l07', 'oysa') - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, crowd, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const wrap1 = x => ((x % 1) + 1) % 1;
  const sit = { legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 28, el: 50 }, armR: { sh: 34, el: 56 } };
  // yıldırım: kırık çizgi, sarı dolgu ve mürekkep kontur; f: 0..1 görünürlük
  const bolt = (x0, y0, x1, y1, seed, f = 1, wd = 26) => { if (f <= 0) return; const r = mulberry32(seed), n = 7, pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u) + (i && i < n ? (r() - 0.5) * 120 : 0), lerp(y0, y1, u)]); } ctx.save(); ctx.globalAlpha = f; ctx.lineJoin = 'miter'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineWidth = wd + 12; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.lineWidth = wd; ctx.strokeStyle = '#FFE15A'; ctx.stroke(); ctx.restore(); };
  const flash = (t, t0) => { const d = t - t0; return d < 0 || d > 0.5 ? 0 : d < 0.08 ? 1 : d < 0.15 ? 0.3 : d < 0.25 ? 0.9 : 1 - (d - 0.25) / 0.25; };
  const seats = (x, y, k = 1) => { for (let i = 0; i < 3; i++) { rect(x + (i - 1) * 110 * k - 50 * k, y - 160 * k, 100 * k, 150 * k, '#3A4A6A', LW, 14); rect(x + (i - 1) * 110 * k - 50 * k, y - 20 * k, 100 * k, 40 * k, '#3A4A6A', LW, 10); } };
  const cloud = (x, y, s) => { for (const [dx, dy, r] of [[0, 0, 1], [0.8, 0.15, 0.75], [-0.8, 0.15, 0.75], [0.4, -0.45, 0.7], [-0.4, -0.4, 0.65]]) circ(x + dx * 90 * s, y + dy * 90 * s, r * 90 * s, '#F4F1EA', 5); };
  const tree = (x, y, h, s = 1) => { rect(x - 16 * s, y - h, 32 * s, h, '#6A4A2E', LW, 6); for (const [dx, dy, r] of [[0, 0, 1], [0.7, 0.3, 0.7], [-0.7, 0.3, 0.7]]) circ(x + dx * 110 * s, y - h + dy * 110 * s, r * 110 * s, '#3E7A3A', LW); };

  const scenes = [];
  // 0 · gökyüzü: koltuk sırasıyla dönerek düşen Juliane (kanca)
  // kanca sahnesi: faz döngü dikişinde yavaşlar (kapak karesi net, dikiş tutar); devir sayıları tam sayı → D'ye göre periyodik
  scenes[0] = t => {
    const q = (t - 0.8 * Math.sin(2 * Math.PI * t / D) * D / (2 * Math.PI)) / D;
    t = loopT(t);
    bg('#BFD6DC');
    for (let k = 0; k < 7; k++) { const y = 1900 - wrap1(5 * q + k / 7) * 2400; cloud(-60 + ((k * 397) % 1200), y, 0.8 + (k % 3) * 0.3); }
    ctx.save(); ctx.translate(540, 1000); ctx.rotate(0.25 * Math.sin(2 * Math.PI * 6 * q)); ctx.translate(-540, -1000);
    seats(540, 1150, 1.1);
    ch(JULIANE, { x: 540, y: 1150, s: S, ...sit, view: 'front', legL: { hip: 30, knee: 70 }, legR: { hip: 24, knee: 60 }, armL: { sh: 120 + 20 * Math.sin(2 * Math.PI * 14 * q), el: 30 }, armR: { sh: 120 - 20 * Math.sin(2 * Math.PI * 14 * q), el: 30 }, expr: 'korku', head: { tilt: 8 * Math.sin(2 * Math.PI * 9 * q) } }, t);
    ctx.restore();
    for (let k = 0; k < 8; k++) { const x = 160 + k * 110, y = wrap1(10 * q + k * 0.37) * 1900; line(x, y, x, y + 140, 5, 'rgba(31,36,33,0.35)'); }
  };
  // 1 · kabin: anne ve kız, penceredeki yıldırım
  scenes[1] = t => {
    bg('#C8C4BA'); rect(-400, 1300, 1880, 900, '#6A6A74', 0); line(-400, 1300, 1480, 1300, LW);
    const f = flash(t, w('l03', 'yıldırım') - 0.05), shake = t > w('l03', 'uçak') - 0.2 ? Math.sin(t * 37) * 8 : 0;
    ctx.save(); ctx.translate(shake, 0);
    rect(160, 520, 200, 280, f > 0 ? '#FFF6C8' : '#5A6A7A', LW, 90); rect(680, 520, 200, 280, f > 0 ? '#FFF6C8' : '#5A6A7A', LW, 90);
    if (f > 0) bolt(780, 520, 740, 800, 5, f, 16);
    seats(380, 1300, 1); seats(720, 1300, 1);
    ch(JULIANE, { x: 380, y: 1300, s: S, ...sit, view: 'front', legL: { hip: 30, knee: 70 }, legR: { hip: 24, knee: 60 }, expr: t > w('l03', 'yıldırım') ? 'korku' : 'mutlu', head: { look: [0.6, -0.3] } }, t);
    ch(MOM, { x: 720, y: 1300, s: S, ...sit, view: 'front', legL: { hip: 30, knee: 70 }, legR: { hip: 24, knee: 60 }, expr: t > w('l03', 'yıldırım') ? 'korku' : 'mutlu', head: { look: [-0.6, 0] } }, t);
    ctx.restore();
    if (f > 0) { ctx.save(); ctx.globalAlpha = 0.5 * f; ctx.fillStyle = '#FFFBE8'; ctx.fillRect(-400, -400, 1880, 2800); ctx.restore(); }
    const brk = seg(t, w('l03', 'parçalanıyor') - 0.2, 0.4); if (brk > 0) { line(-400, 400 + 600 * brk, 1480, 500, 16, PAL.ink); }
    rect(390, 580, 300, 110, PAL.paper, LW, 12); text('PERU · 1971', 540, 652, 42, A.INK);
  };
  // 2 · orman: ağaçların arasında koltuk; uyanır, kemik kırık, annesi yok
  scenes[2] = t => {
    bg('#2E4A2E'); for (let i = 0; i < 7; i++) tree(-100 + i * 200, 1300, 600 + (i % 3) * 120, 1.1); rect(-400, 1300, 1880, 900, '#3E5A2E', 0); line(-400, 1300, 1480, 1300, LW);
    const land = seg(t, w('l03', 17) - 0.3, 0.6), alone = t > w('l03', 'annesi') - 0.2;
    seats(520, lerp(700, 1300, ease.enter(land)), 1);
    ch(JULIANE, { x: alone ? 540 : 520, y: alone ? GY : lerp(700, 1300, ease.enter(land)), s: S, ...(alone ? {} : { ...sit, view: 'front', legL: { hip: 30, knee: 70 }, legR: { hip: 24, knee: 60 } }), expr: alone ? 'korku' : land >= 1 ? 'saskin' : 'yorgun', armR: t > w('l03', 'köprücük') - 0.2 ? { sh: 120, el: 120 } : undefined, head: alone ? { look: [Math.sin(t * 2) * 0.8, 0] } : { look: [0, 0] } }, t);
    if (t > w('l03', 'köprücük') - 0.2 && !alone) { ctx.save(); ctx.translate(470, 900); for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); line(0, 20, 0, 50, 6, PAL.red); } ctx.restore(); }
    if (alone) { rect(720, 560, 220, 120, PAL.paper, LW, 20); text('?', 830, 650, 84, PAL.red); }
  };
  // 3 · dere: babasının öğüdü, günlerce yürür; 11. gün
  scenes[3] = t => {
    bg('#2E4A2E'); for (let i = 0; i < 6; i++) tree(-60 + i * 230, 1260, 520 + (i % 2) * 140, 1.0); rect(-400, 1300, 1880, 900, '#3E5A2E', 0);
    poly([[-400, 1360], [1480, 1300], [1480, 1500], [-400, 1560]], '#4A8AAA', LW); for (let k = 0; k < 6; k++) { const x = wrap1(t * 0.3 + k / 6) * 1600 - 300; line(x, 1440, x + 80, 1436, 5, '#BFE0EA'); }
    const advice = t > w('l03', 'suyu') - 0.2 && t < w('l03', 'günlerce') - 0.2;
    const walk = t > w('l03', 'günlerce') - 0.3;
    ch(JULIANE, { x: walk ? 460 + 30 * Math.sin(t * 0.7) : 460, y: 1420, s: S, walk: walk ? (t * 0.8) % 1 : undefined, view: walk ? 'side' : 'front', facing: 1, expr: walk ? 'yorgun' : 'saskin', head: advice ? { look: [0, -0.8] } : undefined }, t);
    if (advice) { ctx.save(); ctx.translate(560, 640); rect(-250, -100, 500, 200, PAL.paper, LW, 26); text('"Suyu bul,', 0, -16, 56, '#2E4A6B'); text('akıntıyı izle."', 0, 54, 56, '#2E4A6B'); ctx.restore(); }
    const day = t < w('l03', 'günlerce') - 0.2 ? 0 : Math.min(11, 1 + Math.floor(seg(t, w('l03', 'günlerce'), w('l03', 42) - w('l03', 'günlerce')) * 10.99));
    if (day) { rect(330, 560, 420, 140, PAL.paper, LW, 12); text(day + '. GÜN', 540, 660, 84, day === 11 ? PAL.red : A.INK); }
    if (walk) for (let k = 0; k < 8; k++) { const y = wrap1(t * 1.2 + k * 0.29) * 1400 + 200; line(100 + k * 120, y, 90 + k * 120, y + 60, 4, 'rgba(191,214,220,0.7)'); }
  };
  // 4 · kulübe: ormancılar onu bulur; 92 → 1
  scenes[4] = t => {
    bg('#3E6A3A'); for (let i = 0; i < 5; i++) tree(-200 + i * 380, 1240, 560, 1.0); rect(-400, 1300, 1880, 900, '#6A5A3A', 0); line(-400, 1300, 1480, 1300, LW);
    poly([[540, 820], [900, 1010], [900, 1300], [180, 1300], [180, 1010]], '#8A6A48', LW); rect(470, 1100, 140, 200, '#4A3A2A', LW, 6);
    const arrive = seg(t, w('l03', 'ormancılar') - 0.6, 1.0);
    ch(JULIANE, { x: 330, y: GY, s: S, expr: 'yorgun', legL: { hip: 4, knee: 16 }, legR: { hip: 4, knee: 16 }, head: { tilt: 8 } }, t);
    ch(WORKER, { x: lerp(1000, 700, ease.state(arrive)), y: GY, s: S, walk: arrive > 0 && arrive < 1 ? (t * 1.4) % 1 : undefined, view: arrive > 0 && arrive < 1 ? 'side' : 'front', facing: -1, expr: 'saskin', armL: arrive >= 1 ? { sh: 70, el: 20 } : undefined }, t);
    if (t > w('l03', 'uçaktaki') - 0.2) { const n = t < w('l03', 'hayatta') - 0.1 ? 92 : 1; rect(350, 560, 380, 150, PAL.paper, LW, 12); text(n === 92 ? '92 KİŞİ' : '1 KİŞİ', 540, 670, 84, n === 1 ? PAL.red : A.INK); }
  };
  // 5 · milli park: korucu Roy, ilk yıldırım ayakkabısını deler
  scenes[5] = t => {
    const hit = Math.max(flash(t, w('l07', 'ilk') + 0.3), flash(t, w('l07', 'ayakkabısını')));
    bg(hit > 0 ? '#5A6478' : '#3A4458'); for (let i = 0; i < 4; i++) poly([[-300 + i * 400, 1300], [-100 + i * 400, 860 - (i % 2) * 120], [100 + i * 400, 1300]], '#2E3A2E', LW);
    rect(-400, 1300, 1880, 900, '#4A5A3A', 0); line(-400, 1300, 1480, 1300, LW);
    line(840, 1300, 840, 700, 10); line(960, 1300, 960, 700, 10); rect(800, 600, 200, 110, '#6A4A2E', LW, 6);
    bolt(560, -200, 600, 1340, 41, hit > 0.4 ? 1 : 0);
    const k = t > w('l07', 'ilk') + 0.3;
    ch(ROY, { x: 520, y: GY, s: S, expr: k ? 'korku' : 'notr', armL: k ? { sh: 120, el: 40 } : { sh: 10, el: 10 }, armR: k ? { sh: 120, el: 40 } : { sh: 10, el: 10 }, legL: { hip: 4, knee: k ? 30 : 4 }, legR: { hip: 4, knee: 4 } }, t);
    ctx.beginPath(); ctx.ellipse(400, GY - 60, 58, 40, 0, Math.PI, 0); ctx.fillStyle = '#7A6A4A'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke(); line(320, GY - 60, 480, GY - 60, 8);
    if (k) { circ(470, GY - 20, 16, '#1F2421', 0); for (let i = 0; i < 3; i++) { const p = wrap1(t * 0.8 + i / 3); ctx.save(); ctx.globalAlpha = 0.6 * (1 - p); circ(470 + i * 10, GY - 40 - p * 160, 12 + p * 18, '#8A8A8A', 0); ctx.restore(); } }
  };
  // 6 · yakın çekim: kaşlar, omuz, saç; her biri bir yıldırım (sayaç)
  scenes[6] = t => {
    const marks = [w('l07', 'kaşları'), w('l07', 'omzu'), w('l07', 'saçı')], idx = marks.filter(m => t > m - 0.1).length;
    const f = Math.max(...marks.map(m => flash(t, m - 0.1)));
    bg(['#4A5468', '#5A4A5A', '#4A5A5A'][Math.max(0, idx - 1)]); rect(-400, 1300, 1880, 900, '#3A3A3A', 0);
    bolt(420 + idx * 60, -200, 520, 760 + idx * 80, 50 + idx, f > 0.4 ? 1 : 0);
    ch(ROY, { x: 540, y: GY, s: S * 1.1, expr: idx === 3 ? 'kizgin' : 'korku', armR: idx >= 2 ? { sh: 140, el: 110 } : { sh: 20, el: 20 }, armL: idx === 3 ? { sh: 160, el: 120 } : { sh: 20, el: 20 } }, t);
    if (idx >= 3) for (let i = 0; i < 4; i++) { const p = wrap1(t * 1.2 + i / 4); ctx.save(); ctx.globalAlpha = 0.6 * (1 - p); circ(500 + i * 26, 560 - p * 140, 12 + p * 16, '#8A8A8A', 0); ctx.restore(); }
    rect(170, 560, 220, 130, PAL.paper, LW, 12); text(String(1 + idx), 280, 660, 96, PAL.red);
  };
  // 7 · göl: yedinci yıldırım, yine sağ çıkar
  scenes[7] = t => {
    const hit = flash(t, w('l07', 'çarpıyor') - 0.1), saved = t > w('l07', 'yedisinden') - 0.2;
    bg(hit > 0 ? '#9A8AA0' : '#7A6A88'); rect(-400, 1180, 1880, 1000, '#3A5A7A', 0); line(-400, 1180, 1480, 1180, LW); rect(-400, 1300, 760, 900, '#5A6A3A', LW, 0);
    bolt(460, -200, 380, 1100, 70, hit > 0.4 ? 1 : 0);
    ch(ROY, { x: 260, y: GY, s: S, view: saved ? 'front' : 'side', facing: 1, expr: saved ? 'mutlu' : hit > 0 ? 'korku' : 'notr', armR: saved ? { sh: 160, el: 20 } : { sh: 70, el: 40 }, armL: saved ? { sh: 160, el: 20 } : { sh: 40, el: 60 } }, t);
    if (!saved) { line(330, GY - 330, 780, GY - 700, 6, '#6A4A2E'); line(780, GY - 700, 820, 1200, 2, PAL.ink); }
    rect(600, 560, 300, 130, PAL.paper, LW, 12); text('7', 750, 660, 100, PAL.red);
  };
  // 8 · kalabalık: 15.300 kişiden yalnızca biri; Roy'a yedi yıldırım
  const strikes = Array.from({ length: 7 }, (_, i) => w('l07', 34) + 0.1 + i * ((hero(T) - w('l07', 34) - 0.3) / 7));
  scenes[8] = t => {
    bg('#2A2E3A');
    const r = mulberry32(153), cols = ['#8A867C', '#6A6E7A', '#9A8A78', '#5A5E58', '#A89A8A'];
    for (let j = 0; j < 26; j++) for (let i = 0; i < 22; i++) { const x = -60 + i * 56 + (j % 2) * 28, y = 300 + j * 60; if (Math.abs(x - 540) < 50 && Math.abs(y - 1040) < 60) continue; circ(x, y, 18, cols[Math.floor(r() * 5)], 4); }
    const lit = seg(t, w('l07', 'oysa') - 0.1, 0.5);
    if (lit > 0) { ctx.save(); ctx.globalAlpha = 0.85 * lit; circ(540, 1040, 90, '#FFE15A', 0); ctx.restore(); }
    circ(540, 1040, 26, lit > 0 ? '#FFE15A' : cols[0], 5);
    strikes.forEach((s, i) => { const f = flash(t, s); bolt(540 + (i - 3) * 90, -200, 540, 1010, 90 + i, f > 0.4 ? 1 : 0, 20); });
    const nStrikes = strikes.filter(s => t > s).length;
    if (nStrikes) { rect(370, 1110, 340, 110, PAL.paper, LW, 12); text(nStrikes + ' YILDIRIM', 540, 1186, 54, PAL.red); }
  };

  // ——— kamera ———
  const ZK = 1.5, YO = 60;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 900, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.06, 540, 900, 0)],
    [T.l02end + 0.1, ...P(1.12, 540, 920, 0)],
    ...cut(T.l03 - 0.15, P(1.12, 540, 920, 0), P(0.95, 540, 940, 1)),
    [w('l03', 'parçalanıyor') + 0.4, ...P(1.0, 540, 980, 1)],
    ...cut(w('l03', 17) - 0.15, P(1.0, 540, 980, 1), P(0.95, 540, 940, 2)),
    [w('l03', 'annesi'), ...P(1.0, 540, 980, 2)],
    ...cut(w('l03', 'babasının') - 0.15, P(1.0, 540, 980, 2), P(0.95, 520, 980, 3)),
    [w('l03', 42) + 0.2, ...P(1.0, 540, 1000, 3)],
    ...cut(w('l03', 'ormancılar') - 0.15, P(1.0, 540, 1000, 3), P(0.95, 560, 960, 4)),
    [T.l04end + 0.2, ...P(1.05, 520, 960, 4)],
    ...cut(T.l05 - 0.15, P(1.05, 520, 960, 4), P(0.95, 560, 960, 5)),
    [w('l07', 'ilk') + 0.8, ...P(1.05, 520, 1000, 5)],
    ...cut(w('l07', 'sonra') - 0.15, P(1.05, 520, 1000, 5), P(1.0, 520, 960, 6)),
    [w('l07', 'saçı') + 0.6, ...P(1.08, 540, 940, 6)],
    ...cut(w('l07', 'yedincisi') - 0.15, P(1.08, 540, 940, 6), P(0.95, 460, 960, 7)),
    [w('l07', 'yedisinden') + 0.6, ...P(1.0, 440, 980, 7)],
    ...cut(w('l07', 'oysa') - 0.15, P(1.0, 440, 980, 7), P(0.72, 540, 980, 8)),
    [hero(T), ...P(0.78, 540, 1000, 8)],
    [T.loop0 - 0.001, ...P(0.84, 540, 1000, 8)],
    [T.loop0, ...P(1.03, 540, 900, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'yuliane') - 0.1, w('l03', 'uçak') - 0.2, 'JULIANE KOEPCKE', '17 yaşında · Peru, 1971'], [w('l07', 'roy') - 0.1, w('l07', 'ilk') + 0.2, 'ROY SULLIVAN', 'park korucusu · Virginia']],
    numbers: [[w('l07', 34) - 0.05, T.l09 + 0.3, '1 / 15.300', 'ÖMÜR BOYU İHTİMAL']],
  };
}

// № 061 · Zamanı kaybeden adam ve yolunu kaybeden adam (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: mağarada çadırın önünde, elinde takvimle oturan Siffre; takvimde "20 AĞUSTOS". A'nın ters köşesi: gerçek tarih 14 Eylül.
// Doruk: harita üzerinde rotadan 291 km sapan kırmızı çizgi (Fas → Cezayir).

const SX = 1400;
const base = (o) => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const SIFFRE = base({
  key: 'siffre', name: 'Michel Siffre', seed: 611,
  torso: { len: 0.82, shoulder: 0.66, hip: 0.54, depth: 0.42, belly: 0, color: '#C8642A', shade: '#A44E1E' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#C8642A', shade: '#A44E1E', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#3A3E44', shade: '#2B2E33' },
  shoe: { color: '#2A2420', len: 0.3, h: 0.12 },
  skin: '#E6C4A6', skinShade: '#CFA888', hair: '#2A1E16',
  features: ['hoodie', 'hairMessy'],
});
const PROSPERI = base({
  key: 'prosperi', name: 'Mauro Prosperi', seed: 617,
  torso: { len: 0.84, shoulder: 0.68, hip: 0.54, depth: 0.4, belly: 0, color: '#F2EEE4', shade: '#D6D0C2' },
  arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#C49064', shade: '#A87650', hand: 0.12 },
  leg: { upper: 0.42, lower: 0.4, w: 0.18, color: '#2E4A6B', shade: '#233A55' },
  shoe: { color: '#D9722E', len: 0.3, h: 0.12 },
  skin: '#C49064', skinShade: '#A87650', hair: '#1E1814',
  features: ['hairSlick', 'mustacheThin'],
});
const GIRL = base({
  key: 'kiz', name: 'Çoban kız', seed: 619,
  head: { w: 0.94, h: 1, ear: 0.11 }, neck: 0.05,
  torso: { len: 0.66, shoulder: 0.56, hip: 0.6, depth: 0.38, belly: 0, color: '#2E5A8A', shade: '#234670' },
  arm: { upper: 0.32, lower: 0.3, w: 0.15, color: '#2E5A8A', shade: '#234670', hand: 0.11 },
  leg: { upper: 0.3, lower: 0.28, w: 0.16, color: '#2E5A8A', shade: '#234670' },
  shoe: { color: '#6A4A2E', len: 0.26, h: 0.1 },
  skin: '#B8805A', skinShade: '#9C6844', hair: '#141210',
  features: ['skirt', 'bun'],
});

export function hero(T) { return T.w('l07', 'sapmış') + 0.5; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'saati') - 0.3, w('l03', 'saati')], [w('l03', 36) - 0.3, w('l03', 36)], [w('l03', 'gerçek') - 0.3, w('l03', 'gerçek')], [T.l05 - 0.3, T.l05], [T.l07 - 0.3, T.l07], [w('l07', 'kendi') - 0.3, w('l07', 'kendi')], [w('l07', 'dokuzuncu') - 0.3, w('l07', 'dokuzuncu')], [w('l07', 42) - 0.3, w('l07', 42)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'arıyor'), w('l03', 'ağustos'), w('l03', 'eylül')],
    thock: [w('l03', 'eylül') + 0.1],
    rumble: [[w('l07', 'kum'), 0.5]],
    scratch: [[w('l07', 42), hero(T), 0.02]],
    riser: [w('l07', 42) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const sitSide = (f = 1) => ({ view: 'side', facing: f, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 28, el: 50 }, armR: { sh: 34, el: 56 } });
  const cave = () => { bg('#1B2230'); poly([[-400, 400], [200, 260], [700, 330], [1480, 240], [1480, -400], [-400, -400]], '#2C3648', LW); for (let i = 0; i < 9; i++) poly([[-200 + i * 190, 330 - (i % 3) * 40], [-170 + i * 190, 470 + (i % 2) * 60], [-140 + i * 190, 330 - (i % 3) * 40]], '#B9D2DC', 4); rect(-400, 1300, 1880, 900, '#3A4656', 0); poly([[-400, 1300], [300, 1260], [800, 1290], [1480, 1250], [1480, 1320], [-400, 1330]], '#8FB3C2', LW); };
  const tent = (x, y) => { poly([[x - 170, y], [x, y - 260], [x + 170, y]], PAL.gold, LW); poly([[x - 40, y], [x, y - 140], [x + 40, y]], '#8A6A2E', LW); };
  const lamp = (x, y) => { line(x, y - 120, x, y, 5); rect(x - 22, y, 44, 56, '#E8D08A', LW, 10); circ(x, y + 28, 12, '#FFF2B8', 3); };
  const calendar = (x, y, s, day, month, red = false) => { rect(x - 110 * s, y, 220 * s, 250 * s, PAL.paper, LW, 12); rect(x - 110 * s, y, 220 * s, 64 * s, red ? PAL.red : '#2E4A6B', LW, 12); text(month, x, y + 46 * s, 34 * s, PAL.paper); text(String(day), x, y + 196 * s, 118 * s, A.INK); };
  const phone = (x, y) => { rect(x - 30, y - 10, 60, 40, '#2B2F33', 4, 8); line(x - 30, y + 10, x - 40, y + 60, 4); };
  const desert = (sky = '#F2D9A8') => { bg(sky); for (let i = 0; i < 4; i++) ell(-200 + i * 420, 1240 - (i % 2) * 60, 360, 120, ['#E3B877', '#D8A863'][i % 2], LW); rect(-400, 1260, 1880, 1000, '#E3B877', 0); line(-400, 1260, 1480, 1260, LW); };

  const scenes = [];
  // 0 · mağara: çadır, telefon, takvim (kanca ve l03)
  scenes[0] = t => {
    t = loopT(t);
    cave(); tent(780, 1300); lamp(560, 1050); phone(330, 1200);
    const call = t > w('l03', 'uyanınca') - 0.2 && t < w('l03', 'vücut');
    const cold = t > w('l03', 'vücut') - 0.2 && t < w('l03', 36) - 0.2;
    ch(SIFFRE, { x: 440, y: 1258, s: S, ...sitSide(1), expr: cold ? 'yorgun' : call ? 'notr' : 'saskin', armR: call ? { sh: 150, el: 130 } : { sh: 40, el: 80 }, armL: { sh: 40, el: 90 }, talk: call ? 0.3 + 0.3 * Math.sin(t * 17) : 0, head: { look: [0.5, -0.2] } }, t);
    if (cold) for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 0.6 * (1 - p); circ(520 + 20 * i, 980 - p * 120, 12 + p * 20, '#DCE8EE', 0); ctx.restore(); }
    const real = t > w('l03', 'gerçek') - 0.15;
    if (t < w('l03', 'saati') - 0.3 || t > w('l03', 36) - 0.2) calendar(250, 830, 0.95, real ? 14 : 20, real ? 'EYLÜL' : 'AĞUSTOS', real);
    if (real) { line(160, 850, 340, 1050, 12, PAL.red); line(340, 850, 160, 1050, 12, PAL.red); }
    if (t > w('l03', 'saati') - 0.3 && t < w('l03', 'uyanınca') - 0.3) { circ(250, 930, 90, PAL.paper, LW); line(250, 930, 250, 870, 8); line(250, 930, 290, 950, 8); line(160, 840, 340, 1020, 12, PAL.red); }
  };
  // 1 · iniş: halatla 130 metre aşağı
  scenes[1] = t => {
    bg('#1B2230'); rect(-400, -400, 860, 2800, '#2C3648', 0); rect(860, -400, 720, 2800, '#2C3648', 0); line(460, -400, 460, 2400, LW); line(860, -400, 860, 2400, LW);
    const u = seg(t, T.l03, w('l03', 'iniyor') - T.l03 + 0.4);
    line(640, -400, 640, 2400, 6, '#C9B898');
    ch(SIFFRE, { x: 640, y: lerp(1120, 1500, ease.state(u)), s: S, armL: { sh: 165, el: 10 }, armR: { sh: 160, el: 20 }, legL: { hip: 10, knee: 20 }, legR: { hip: -6, knee: 10 }, expr: 'notr', head: { look: [0, 0.8] } }, t);
    const m = Math.round(130 * ease.state(u)); rect(195, 640, 250, 110, PAL.paper, LW, 12); text('−' + m + ' m', 320, 718, 64, A.INK);
  };
  // 2 · çöl yarışı ve kum fırtınası
  scenes[2] = t => {
    desert();
    const storm = seg(t, w('l07', 'kum') - 0.4, 1.0), clear = seg(t, w('l07', 'dindiğinde') - 0.2, 0.8);
    const runners = [[220, '#2E5A8A'], [380, '#8A2E2E'], [700, '#3A6A3A']];
    if (clear < 1) runners.forEach(([x, c], i) => { const r = { ...PROSPERI, torso: { ...PROSPERI.torso, color: c, shade: c }, features: ['hairSlick'] }; ch(r, { x: x + ((t * 60 + i * 80) % 120), y: GY, s: S * 0.75, walk: (t * 1.8 + i * 0.3) % 1, facing: 1 }, t); });
    for (let i = 0; i < 6; i++) { rect(120 + i * 160, 1230, 12, 60, '#C2412F', 3, 2); poly([[126 + i * 160, 1230], [176 + i * 160, 1244], [126 + i * 160, 1258]], PAL.red, 3); }
    ch(PROSPERI, { x: 540, y: GY, s: S, walk: clear >= 1 ? undefined : (t * 1.8) % 1, facing: 1, view: clear >= 1 ? 'front' : 'side', expr: clear >= 1 ? 'korku' : storm > 0.5 ? 'kizgin' : 'mutlu', armL: clear >= 1 ? { sh: 40, el: 20 } : undefined, armR: clear >= 1 ? { sh: 40, el: 20 } : undefined, head: clear >= 1 ? { look: [Math.sin(t * 2) * 0.8, 0] } : undefined }, t);
    const st = storm * (1 - clear);
    if (st > 0) { ctx.save(); ctx.globalAlpha = 0.85 * st; ctx.fillStyle = '#D8A863'; ctx.fillRect(-400, -400, 1880, 2800); ctx.globalAlpha = 0.9 * st; for (let i = 0; i < 40; i++) { const y = (i * 97) % 1800, x = ((t * 900 + i * 211) % 1900) - 400; line(x, y, x + 160, y + 20, 6, '#B98848'); } ctx.restore(); }
    if (clear > 0) { ctx.save(); ctx.globalAlpha = clear; rect(330, 640, 420, 120, PAL.paper, LW, 16); text('İŞARET YOK', 540, 720, 56, PAL.red); ctx.restore(); }
  };
  // 3 · türbe: yarasalar, kendi anlatımına göre
  scenes[3] = t => {
    desert('#E9C890');
    poly([[200, 1270], [200, 860], [880, 860], [880, 1270]], '#E9DFC9', LW); ctx.beginPath(); ctx.arc(540, 860, 260, Math.PI, 0); ctx.fillStyle = '#E9DFC9'; ctx.fill(); ctx.lineWidth = LW; ctx.stroke();
    rect(440, 1000, 200, 270, '#4A3A2A', LW, 100);
    const bats = t > w('l07', 'yarasa') - 0.4;
    if (bats) for (let i = 0; i < 6; i++) { const x = 380 + i * 70 + 20 * Math.sin(t * 5 + i), y = 640 + 30 * Math.sin(t * 7 + i * 2); poly([[x - 30, y], [x - 10, y - 14], [x, y], [x + 10, y - 14], [x + 30, y], [x, y + 10]], '#2A2420', 3); }
    ch(PROSPERI, { x: 540, y: GY - 20, s: S, ...sitSide(1), expr: bats ? 'kizgin' : 'yorgun', head: { tilt: 10, look: [0.2, -0.6] }, armR: bats ? { sh: 150, el: 40 } : { sh: 40, el: 80 } }, t);
  };
  // 4 · çoban kız görür ve kaçar
  scenes[4] = t => {
    desert('#F2D9A8');
    const run = seg(t, w('l07', 'kaçıyor') - 0.3, 1.4);
    for (let i = 0; i < 4; i++) { const x = lerp(780 + i * 50, 1300 + i * 60, run), y = GY - 20 - (i % 2) * 20; ell(x, y - 50, 50, 34, '#F2EEE4', 4); circ(x + 46, y - 70, 18, '#2A2420', 3); line(x - 30, y - 20, x - 30, y + 10, 5); line(x + 30, y - 20, x + 30, y + 10, 5); }
    ch(GIRL, { x: lerp(700, 1300, ease.enter(run)), y: GY, s: S * 0.85, walk: run > 0 ? (t * 2) % 1 : undefined, view: run > 0 ? 'side' : 'front', facing: 1, expr: run > 0 ? 'korku' : 'saskin', head: { look: [-0.7, 0] } }, t);
    ch(PROSPERI, { x: 390, y: GY, s: S, expr: 'yorgun', armR: { sh: 120, el: 10 }, armL: { sh: 15, el: 10 }, legL: { hip: 4, knee: 14 }, legR: { hip: 4, knee: 14 } }, t);
  };
  // 5 · harita: rota ve 291 km sapma
  scenes[5] = t => {
    bg('#D9C9A8'); rect(140, 520, 800, 980, '#EFE3C4', LW, 16);
    ctx.save(); ctx.setLineDash([18, 14]); line(560, 520, 600, 1500, 6, '#8A6A48'); ctx.restore();
    text('FAS', 330, 960, 56, '#8A6A48'); text('CEZAYİR', 760, 1150, 56, '#8A6A48');
    poly([[200, 1350], [260, 1320], [320, 1340]], '#6A9A5A', 4);
    line(220, 1260, 480, 1200, 12, '#2E7A3A'); text('ROTA', 300, 1180, 40, '#2E7A3A');
    const u = ease.enter(seg(t, w('l07', 42) - 0.1, hero(T) - w('l07', 42)));
    const pts = [[480, 1200], [560, 1080], [680, 960], [800, 820]]; ctx.beginPath(); ctx.moveTo(...pts[0]); const n = Math.max(1, u * 3); for (let i = 1; i <= Math.floor(n); i++) ctx.lineTo(...pts[i]); if (n % 1 && Math.floor(n) < 3) { const a = pts[Math.floor(n)], b = pts[Math.floor(n) + 1], f = n % 1; ctx.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); } ctx.lineWidth = 14; ctx.strokeStyle = PAL.red; ctx.lineCap = 'round'; ctx.stroke();
    if (u >= 1) circ(800, 820, 22, PAL.red, LW);
    ch(PROSPERI, { x: 820, y: GY + 120, s: S * 0.8, expr: u >= 1 ? 'saskin' : 'notr', armR: { sh: 110, el: 20 } }, t);
  };

  // ——— kamera ———
  const ZK = 1.5, YO = 60;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 400, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.05, 420, 950, 0)],
    [T.l02end + 0.2, ...P(1.15, 420, 940, 0)],
    ...cut(T.l03 - 0.15, P(1.15, 420, 940, 0), P(1.0, 540, 960, 1)),
    ...cut(w('l03', 'saati') - 0.15, P(1.0, 540, 960, 1), P(1.0, 440, 960, 0)),
    [w('l03', 36) - 0.2, ...P(1.05, 420, 950, 0)],
    [w('l03', 'gerçek') + 0.2, ...P(1.2, 330, 930, 0)],
    [T.l04end + 0.2, ...P(1.2, 330, 930, 0)],
    ...cut(T.l05 - 0.15, P(1.2, 330, 930, 0), P(1.0, 540, 960, 2)),
    [T.l06end + 0.2, ...P(1.1, 520, 960, 2)],
    [w('l07', 'kum') - 0.3, ...P(1.0, 520, 960, 2)],
    [w('l07', 'kendi') - 0.16, ...P(1.15, 540, 940, 2)],
    ...cut(w('l07', 'kendi') - 0.15, P(1.15, 540, 940, 2), P(1.0, 540, 960, 3)),
    ...cut(w('l07', 'dokuzuncu') - 0.15, P(1.0, 540, 960, 3), P(1.0, 560, 960, 4)),
    [w('l07', 'kaçıyor') + 0.8, ...P(1.0, 600, 960, 4)],
    ...cut(w('l07', 42) - 0.15, P(1.0, 600, 960, 4), P(0.95, 540, 960, 5)),
    [hero(T), ...P(0.92, 540, 980, 5)],
    [T.loop0 - 0.001, ...P(0.98, 560, 960, 5)],
    [T.loop0, ...P(1.03, 405, 965, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'mişel') - 0.1, w('l03', 'iniyor') + 0.3, 'MICHEL SIFFRE', 'Scarasson mağarası · 1962'], [w('l07', 'mauro') - 0.1, w('l07', 'kum') - 0.2, 'MAURO PROSPERI', 'Sahra · 1994']],
    numbers: [[w('l07', 42) - 0.05, T.l09 + 0.3, t => Math.round(291 * ease.enter(seg(t, w('l07', 42) - 0.1, hero(T) - w('l07', 42)))) + ' km', 'ROTADAN SAPMA']],
  };
}

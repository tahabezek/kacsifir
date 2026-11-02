// № 038 · Uyumayan çocuk ve hatırlayamayan adam (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y].
// Kanca: masada gözleri kıpkırmızı Randy ve saatin yanında gün sayacı. A'nın ters köşesi: 65'te durup ne yaptığını unutur.
// Doruk: piyano başında Clive; elleri hâlâ hatırlıyor.

const SX = 1400;
export function hero(T) { return T.w('l07', 48) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[w('l03', 6) - 0.3, w('l03', 6)], [w('l03', 'dördüncü') - 0.3, w('l03', 'dördüncü')], [w('l03', 31) - 0.3, w('l03', 31)], [T.l05 - 0.3, T.l05], [w('l07', 'klayv') - 0.3, w('l07', 'klayv')], [w('l07', 'günlüğüne') - 0.3, w('l07', 'günlüğüne')], [w('l07', 'karısı') - 0.3, w('l07', 'karısı')], [w('l07', 'ama') - 0.3, w('l07', 'ama')], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'yüzden'), w('l03', 40), w('l07', 'yazıyor'), w('l07', 'çiziyor')],
    thock: [w('l03', 'duruyor'), w('l07', 'virüs')],
    scratch: [[w('l07', 'günlüğüne'), w('l07', 'çiziyor') + 0.4, 0.03]],
    riser: [w('l07', 'ama') - 0.2, hero(T) - 0.2],
    impact: hero(T) - 0.2,
    loopEnd: T.loop0,
  };
}

const base = (o) => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const RANDY = base({ key: 'randy2d', name: 'Randy Gardner', seed: 301,
  torso: { len: 0.82, shoulder: 0.62, hip: 0.5, depth: 0.38, belly: 0, color: '#F4F1EA', shade: '#D9D4C8' },
  arm: { upper: 0.42, lower: 0.4, w: 0.16, color: '#2E4A6B', shade: '#233A55', hand: 0.12 },
  leg: { upper: 0.44, lower: 0.42, w: 0.18, color: '#3A4A6A', shade: '#2B3750' },
  shoe: { color: '#F4F1EA', len: 0.3, h: 0.11 },
  skin: '#F0D4BE', skinShade: '#D8B49A', hair: '#5A4028', eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03, lid: 0.3 }, features: ['jacket', 'hairMessy'] });
const ARK1 = base({ key: 'ark1', name: 'Arkadaş', seed: 311,
  torso: { len: 0.82, shoulder: 0.64, hip: 0.52, depth: 0.4, belly: 0, color: '#C2412F', shade: '#9E3324' },
  arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#C2412F', shade: '#9E3324', hand: 0.12 },
  leg: { upper: 0.44, lower: 0.42, w: 0.19, color: '#2A2F38', shade: '#1F232A' },
  shoe: { color: '#262626', len: 0.3, h: 0.11 }, skin: '#E2B896', skinShade: '#C89E7C', hair: '#2A1E16', features: ['hoodie', 'hairSlick'] });
const ARK2 = base({ key: 'ark2', name: 'Arkadaş', seed: 313,
  torso: { len: 0.82, shoulder: 0.64, hip: 0.52, depth: 0.4, belly: 0.04, color: '#5E9A4E', shade: '#4C8240' },
  arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#5E9A4E', shade: '#4C8240', hand: 0.12 },
  leg: { upper: 0.44, lower: 0.42, w: 0.19, color: '#3A3A30', shade: '#2A2A22' },
  shoe: { color: '#262626', len: 0.3, h: 0.11 }, skin: '#C89A78', skinShade: '#A8805E', hair: '#6A4A2A', features: ['hairSpiky', 'glassesRect'] });
const CLIVE = base({ key: 'clive2d', name: 'Clive Wearing', seed: 321,
  torso: { len: 0.9, shoulder: 0.7, hip: 0.56, depth: 0.42, belly: 0.04, color: '#2A2E3A', shade: '#1E222C' },
  arm: { upper: 0.44, lower: 0.42, w: 0.17, color: '#2A2E3A', shade: '#1E222C', hand: 0.12 },
  leg: { upper: 0.46, lower: 0.44, w: 0.19, color: '#2A2E3A', shade: '#1E222C' },
  shoe: { color: '#1A1A1A', len: 0.32, h: 0.11 }, skin: '#ECCCB2', skinShade: '#D4B094', hair: '#8A7A6A', features: ['suit', 'tie', 'hairSlick'] });
const DEBORAH = base({ key: 'deborah2d', name: 'Deborah Wearing', seed: 331,
  torso: { len: 0.82, shoulder: 0.62, hip: 0.66, depth: 0.42, belly: 0, color: '#7A2E3A', shade: '#5E222C' },
  arm: { upper: 0.4, lower: 0.38, w: 0.16, color: '#7A2E3A', shade: '#5E222C', hand: 0.12 },
  leg: { upper: 0.36, lower: 0.36, w: 0.17, color: '#4A3A40', shade: '#38292E' },
  shoe: { color: '#2A2420', len: 0.27, h: 0.11 }, skin: '#F0D4BE', skinShade: '#D8B49A', hair: '#7A4A2A', features: ['cardigan', 'skirt', 'bun'] });

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const bubble = (x, y, s, wd = 300, size = 46) => { rect(x - wd / 2, y - 70, wd, 100, PAL.paper, LW, 24); poly([[x - 30, y + 28], [x - 4, y + 28], [x - 40, y + 70]], PAL.paper, LW); ctx.fillStyle = PAL.paper; ctx.fillRect(x - 28, y + 22, 22, 9); text(s, x, y + 2, size, A.INK); };
  const sitSide = (f = 1) => ({ view: 'side', facing: f, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 28, el: 50 }, armR: { sh: 34, el: 56 } });
  const room = (wall = '#D9CFBC', floor = '#B8A888') => { bg(wall); rect(-400, 1300, 1880, 900, floor, 0); line(-400, 1300, 1480, 1300, LW); };
  // gün sayacı: kancada 1 → 11 gün; uykusuzluk ilerledikçe göz kapakları düşer
  const dayAt = t => { t = loopT(t); return t < T.l03 ? Math.round(lerp(1, 11, seg(t, 1.0, w('l01', 'uyumayan') - 1.0))) : t < w('l03', 'dördüncü') ? 1 : t < w('l03', 31) ? 4 : 11; };
  const lids = t => 0.15 + 0.06 * (dayAt(t) - 1);
  const redEyes = (x, y, k = 1) => { for (const dx of [-22, 22]) { line(x + dx - 10 * k, y + 4, x + dx + 10 * k, y + 10, 3, '#D24A3A'); } };

  const scenes = [];
  // 0 · gece odası: masada uyumamaya direnen Randy, duvarda gün sayacı ve saat
  scenes[0] = t => {
    const lt = loopT(t);
    room('#2E3A4C', '#4A4038');
    rect(620, 560, 300, 360, '#1F2A3A', LW, 12); for (let i = 0; i < 20; i++) circ(650 + ((i * 53) % 250), 590 + ((i * 97) % 300), 3, '#F6E7B0', 0);
    rect(170, 770, 230, 190, PAL.paper, LW, 12); rect(170, 770, 230, 56, PAL.red, LW, 12); text('GÜN', 285, 812, 38, PAL.paper); text(String(dayAt(t)), 285, 932, 96, A.INK);
    rect(140, 1120, 800, 40, '#7A5634', LW, 6); rect(180, 1160, 30, 200, '#7A5634', LW); rect(870, 1160, 30, 200, '#7A5634', LW);
    const lamp = 0.5 + 0.5 * Math.sin(lt * 1.3);
    poly([[760, 930], [860, 930], [830, 1000], [790, 1000]], '#E2B13C', LW); line(810, 1000, 810, 1120, 8);
    ctx.fillStyle = 'rgba(246,231,176,' + (0.18 + 0.06 * lamp) + ')'; ctx.beginPath(); ctx.moveTo(770, 1000); ctx.lineTo(850, 1000); ctx.lineTo(980, 1300); ctx.lineTo(640, 1300); ctx.closePath(); ctx.fill();
    const nod = Math.max(0, Math.sin(lt * 0.9)) * 18;
    ch(RANDY, { x: 470, y: 1258, s: S, ...sitSide(1), lean: 8 + nod * 0.4, armL: { sh: 70, el: 90 }, armR: { sh: 140, el: 150 }, expr: 'yorgun', head: { tilt: nod } }, t);
  };
  // 1 · gece sokağı: iki arkadaş Randy'yi uyanık tutar; sonra tabela insana döner
  scenes[1] = t => {
    bg('#1E2A3A'); rect(-400, 1300, 1880, 900, '#3A3A40', 0); line(-400, 1300, 1480, 1300, LW);
    for (let i = 0; i < 4; i++) rect(-100 + i * 320, 620, 260, 680, ['#2A3446', '#3A3030'][i % 2], LW, 6);
    line(900, 1300, 900, 760, 10); circ(900, 740, 34, '#F6E7B0', LW);
    const signT = w('l03', 'tabelasını') - 0.2, man = seg(t, signT, 0.6) * (1 - seg(t, w('l03', 'sonra') - 0.2, 0.3));
    line(220, 1300, 220, 950, 8);
    ctx.save(); ctx.globalAlpha = 1 - man; rect(130, 880, 180, 90, '#2E6A3A', LW, 8); text('DUR', 220, 945, 52, PAL.paper); ctx.restore();
    if (man > 0) { ctx.save(); ctx.globalAlpha = man; ch(ARK1, { x: 220, y: 1300, s: S * 1.05, expr: 'notr', armR: { sh: 90, el: 0 } }, t); ctx.restore(); }
    const nudge = Math.max(0, Math.sin(t * 2.4));
    const sees = t > signT;
    ch(ARK1, { x: 760, y: GY, s: S, view: 'side', facing: -1, armL: { sh: 40 + 50 * nudge, el: 10 }, expr: 'notr' }, t);
    ch(ARK2, { x: 380, y: GY, s: S, view: 'side', facing: 1, armR: { sh: 20, el: 20 }, expr: 'notr' }, t);
    ch(RANDY, { x: 560, y: GY, s: S, expr: sees ? 'saskin' : 'yorgun', head: { tilt: sees ? 0 : 10 * Math.sin(t * 1.4), look: [sees ? -0.8 : 0, 0] }, armL: { sh: sees ? 60 : 10, el: sees ? 20 : 0 } }, t);
    redEyes(560, GY - 3.0 * S + 30);
  };
  // 2 · futbolcu sandığı an: Randy kask ve topla
  scenes[2] = t => {
    bg('#BFD6DC'); poly([[-400, 1150], [1480, 1150], [1480, 2400], [-400, 2400]], PAL.grass, 0); for (let i = 0; i < 5; i++) rect(-400, 1150 + i * 220, 1880, 110, PAL.grassDark, 0); line(-400, 1150, 1480, 1150, LW);
    const run = (t * 1.3) % 1;
    ch(RANDY, { x: 540, y: GY, s: S, walk: run, facing: 1, expr: 'mutlu' }, t);
    ell(640, GY - 270, 46, 28, '#8A5A3A', LW, -0.4); line(615, GY - 278, 665, GY - 262, 4, '#F4F1EA');
    bubble(650, 800, 'Ben bir yıldızım!', 400, 42);
  };
  // 3 · sayılar: 100'den geriye yedişer; 65'te durur
  const nums = [100, 93, 86, 79, 72, 65];
  scenes[3] = t => {
    room('#2E3A4C', '#4A4038');
    rect(160, 1120, 760, 40, '#7A5634', LW, 6);
    const t0 = w('l03', 'yüzden'), t1 = w('l03', 40), u = seg(t, t0, t1 - t0), forgot = t > w('l03', 'unutuyor') - 0.2;
    const shown = Math.min(6, 1 + Math.floor(u * 5.99));
    for (let i = 0; i < shown; i++) { const last = i === shown - 1; const x = 240 + i * 115, y = 660 + (i % 2) * 40; rect(x - 60, y - 70, 120, 100, last ? PAL.paper : '#C9C0AC', LW, 12); text(String(nums[i]), x, y + 6, 54, last && nums[i] === 65 ? PAL.red : A.INK); }
    if (forgot) { rect(700, 820, 200, 110, PAL.paper, LW, 20); text('?', 800, 905, 90, PAL.red); }
    ch(RANDY, { x: 520, y: 1258, s: S, ...sitSide(1), lean: forgot ? 24 : 6, armR: { sh: forgot ? 140 : 70, el: forgot ? 150 : 90 }, expr: forgot ? 'saskin' : 'yorgun', head: { tilt: forgot ? 16 : 0, look: [0.4, -0.5] } }, t);
    redEyes(520 + 20, 1258 - 2.3 * S + 30);
  };
  // 4 · orkestra: şef Clive, sonra virüs (ışıklar söner)
  scenes[4] = t => {
    const vir = seg(t, w('l07', 'virüs') - 0.2, 1.2);
    room('#4A3A2E', '#6A4A30');
    for (let i = 0; i < 7; i++) { const x = 120 + i * 140, y = 1160 + (i % 2) * 40; rect(x - 40, y - 140, 80, 140, '#1F2421', LW, 30); circ(x, y - 170, 32, ['#F0D4BE', '#C89A78', '#ECCCB2'][i % 3], LW); line(x + 30, y - 80, x + 70, y - 150, 5, '#8A5A3A'); }
    const beat = Math.sin(t * 6);
    ch(CLIVE, { x: 540, y: GY + 60, s: S * 1.1, view: 'side', facing: -1, armR: { sh: vir > 0 ? 20 : 140 + 25 * beat, el: vir > 0 ? 10 : 30 }, armL: { sh: vir > 0 ? 10 : 110 - 20 * beat, el: 20 }, expr: vir > 0.3 ? 'korku' : 'mutlu', head: { tilt: vir > 0 ? 14 : -4 } }, t);
    if (vir > 0) { ctx.fillStyle = 'rgba(10,12,18,' + 0.75 * vir + ')'; ctx.fillRect(-1400, -1400, 3880, 4720); }
    if (vir > 0.3) { ctx.save(); ctx.globalAlpha = Math.min(1, (vir - 0.3) * 2); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + t * 0.6, r = 70 + 18 * Math.sin(t * 3 + i); circ(560 + Math.cos(a) * r, 700 + Math.sin(a) * r, 16, '#C2412F', 4); } circ(560, 700, 54, '#E06A4A', LW); ctx.restore(); }
  };
  // 5 · günlük: "Şimdi gerçekten uyandım." satırları ve üstü çizilen öncekiler
  const entries = ['08:31 Şimdi gerçekten uyandım.', '08:34 Şimdi tamamen uyandım.', '08:38 İlk kez uyandım.', '08:42 Şimdi gerçekten uyandım.', '08:47 Şimdi uyandım. İlk kez.'];
  const diaryN = t => { t = loopT(t); return 1 + Math.floor(seg(t, w('l07', 'günlüğüne') - 0.2, w('l07', 'çiziyor') + 0.5 - w('l07', 'günlüğüne')) * 4.99); };
  scenes[5] = t => {
    room('#D9CFBC', '#B8A888');
    ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.04);
    rect(-360, -260, 720, 520, '#EFE6D0', LW, 12); line(-260, -260, -260, 260, 4, 'rgba(194,65,47,0.6)');
    const n = diaryN(t);
    for (let i = 0; i < n; i++) { const y = -190 + i * 92; text(entries[i], -240, y, 36, '#1E2440', 'Archivo', 700, 'left'); if (i < n - 1) { ctx.font = '700 36px Archivo'; const ww = ctx.measureText(entries[i]).width; line(-246, y - 12, -234 + ww, y - 14, 7, '#1E2440'); } }
    ctx.restore();
    const wr = Math.sin(t * 12) * 6;
    ch(CLIVE, { x: 760, y: GY, s: S, view: 'side', facing: -1, armR: { sh: 110 + wr, el: 50 }, expr: 'notr', head: { tilt: 18, look: [-0.5, 0.6] } }, t);
  };
  // 6 · kapı: Deborah girer, Clive kollarını açıp sarılır
  scenes[6] = t => {
    room('#E2D6BC', '#A8865E');
    rect(780, 640, 220, 660, '#7A5634', LW, 6); circ(810, 980, 10, '#E2B13C', 4);
    const enter = seg(t, w('l07', 'döndüğünde') - 0.6, 0.9), hug = t > w('l07', 'sarılıyor') - 0.4;
    const dx = lerp(880, 610, ease.state(enter));
    ch(DEBORAH, { x: dx, y: GY, s: S, view: 'side', facing: -1, expr: 'mutlu', armL: { sh: hug ? 110 : 10, el: hug ? 40 : 0 }, armR: { sh: hug ? 110 : 10, el: hug ? 40 : 0 } }, t);
    const joy = t > w('l07', 'yıllardır') - 0.3;
    ch(CLIVE, { x: hug ? 470 : 330, y: GY, s: S, view: hug ? 'side' : 'front', facing: 1, expr: joy ? 'mutlu' : 'notr', armL: { sh: joy ? (hug ? 110 : 150) : 10, el: hug ? 40 : 10 }, armR: { sh: joy ? (hug ? 110 : 150) : 10, el: hug ? 40 : 10 } }, t);
    if (joy && !hug) { rect(200, 820, 260, 100, PAL.paper, LW, 20); text('Sen geldin!', 330, 885, 40, PAL.red); }
    if (hug) for (let i = 0; i < 3; i++) { const y = 860 - ((t * 120 + i * 60) % 180); ctx.save(); ctx.translate(540 + (i - 1) * 50, y); ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-24, -10, -12, -28, 0, -14); ctx.bezierCurveTo(12, -28, 24, -10, 0, 10); ctx.fill(); ctx.restore(); }
  };
  // 7 · piyano: hafıza yok, eller hatırlıyor (doruk)
  scenes[7] = t => {
    room('#3A2E26', '#5A4430');
    const play = seg(t, w('l07', 'oturunca') - 0.2, 0.4);
    rect(560, 860, 420, 300, '#1F2421', LW, 10); rect(540, 1100, 460, 60, '#F4F1EA', LW, 6); for (let i = 0; i < 12; i++) if (i % 7 !== 2 && i % 7 !== 6) rect(560 + i * 36, 1100, 20, 34, '#1F2421', 0);
    line(600, 1160, 600, 1300, 12); line(940, 1160, 940, 1300, 12);
    const p = Math.sin(t * 14), q = Math.sin(t * 17 + 1);
    ch(CLIVE, { x: 420, y: 1258, s: S, ...sitSide(1), armL: { sh: 70 + 6 * p * play, el: 40 }, armR: { sh: 76 + 6 * q * play, el: 34 }, expr: play > 0 ? 'mutlu' : 'notr', head: { tilt: play > 0 ? -10 : 0 } }, t);
    if (play > 0) for (let i = 0; i < 4; i++) { const u = ((t * 0.7 + i * 0.25) % 1); ctx.save(); ctx.globalAlpha = play * (1 - u); ctx.translate(760 + i * 40 - 80 + 60 * u, 820 - 260 * u); circ(0, 0, 12, A.INK, 0); line(10, 0, 10, -44, 5); ctx.restore(); }
  };

  // ——— kamera ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(0.78, 500, 860, 0);
  const cam = [
    [0, ...F0],
    [T.l02end + 0.2, ...P(0.92, 470, 860, 0)],
    ...cut(w('l03', 6) - 0.15, P(0.92, 470, 860, 0), P(0.78, 560, 980, 1)),
    [w('l03', 'tabelasını') - 0.2, ...P(0.85, 460, 980, 1)],
    ...cut(w('l03', 'sonra') - 0.15, P(0.85, 460, 980, 1), P(0.85, 600, 920, 2)),
    ...cut(w('l03', 31) - 0.15, P(0.85, 600, 920, 2), P(0.72, 540, 900, 3)),
    [w('l03', 'unutuyor'), ...P(0.85, 540, 940, 3)],
    ...cut(T.l04 - 0.15, P(0.85, 540, 940, 3), P(0.95, 470, 870, 0)),
    ...cut(T.l05 - 0.15, P(0.95, 470, 870, 0), P(0.8, 600, 900, 6)),
    ...cut(T.l06 - 0.15, P(0.8, 600, 900, 6), P(0.72, 540, 820, 5)),
    ...cut(w('l07', 'klayv') - 0.15, P(0.72, 540, 820, 5), P(0.72, 540, 960, 4)),
    [w('l07', 'virüs'), ...P(0.85, 560, 900, 4)],
    ...cut(w('l07', 'günlüğüne') - 0.15, P(0.85, 560, 900, 4), P(0.72, 560, 820, 5)),
    [w('l07', 'çiziyor') + 0.3, ...P(0.78, 520, 800, 5)],
    ...cut(w('l07', 'karısı') - 0.15, P(0.78, 520, 800, 5), P(0.78, 600, 920, 6)),
    [w('l07', 'sarılıyor'), ...P(0.9, 520, 920, 6)],
    ...cut(w('l07', 'ama') - 0.15, P(0.9, 520, 920, 6), P(0.75, 640, 900, 7)),
    [hero(T), ...P(0.95, 600, 900, 7)],
    [T.l09end + 0.5, ...P(0.85, 620, 900, 7)],
    [T.loop0 - 0.001, ...P(0.85, 620, 900, 7)],
    [T.loop0, ...P(0.8, 495, 862, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 6) - 0.1, w('l03', 'dördüncü') - 0.3, 'RANDY GARDNER', '17 yaşında · 1963'], [w('l07', 'klayv') - 0.1, w('l07', 6) - 0.2, 'CLIVE WEARING', 'orkestra şefi · İngiltere']],
    numbers: [[w('l03', 31) - 0.2, w('l03', 'yüzden') - 0.2, '11. gün', 'HİÇ UYUMADAN']],
  };
}

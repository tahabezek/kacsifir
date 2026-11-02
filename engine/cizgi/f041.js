// № 041 · Hiç oynamayan futbolcu ve hiç bırakmayan futbolcu (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: yılları sayan skor tabelası ve bankta oturan Kaiser. A'nın ters köşesi: patron maaşa zam yapar.
// Doruk: Kaiser'in boş zemini (0) ve Kazu'nun yanında yükselen 911 topluk yığın.

const SX = 1400;
export function hero(T) { return T.w('l09', 32) + 0.4; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[w('l03', 'imzayı') - 0.3, w('l03', 'imzayı')], [w('l03', 'bacağını') - 0.3, w('l03', 'bacağını')], [w('l03', 'soyunma') - 0.3, w('l03', 'soyunma')], [T.l05 - 0.3, T.l05], [w('l05', 'tel') - 0.3, w('l05', 'tel')], [w('l05', 'kendi') - 0.3, w('l05', 'kendi')], [T.l07 - 0.3, T.l07], [w('l09', 'yıllarca') - 0.3, w('l09', 'yıllarca')], [w('l09', 15) - 0.3, w('l09', 15)], [w('l09', 'bugün') - 0.3, w('l09', 'bugün')], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'imzayı'), w('l03', 'uzatıyor'), w('l05', 'kırmızı'), w('l05', 'zam')],
    thock: [w('l03', 'yığılıyor')],
    rumble: [[w('l09', 'kazu!'), 0.45]],
    scratch: [[w('l09', 'bugün'), hero(T), 0.02]],
    riser: [w('l09', 'bugün') - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, crowd, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const loopT = t => (t >= T.loop0 ? t - D : t);

  const ball = (x, y, r, rot = 0) => { circ(x, y, r, '#F4F1EA', r * 0.16); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = A.INK; for (const [dx, dy, k] of [[0, 0, 0.32], [0.6, -0.45, 0.2], [-0.62, -0.4, 0.2], [0.05, 0.72, 0.2]]) { ctx.beginPath(); ctx.arc(dx * r, dy * r, k * r, 0, 7); ctx.fill(); } ctx.restore(); };
  const sitSide = (f = 1) => ({ view: 'side', facing: f, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 28, el: 50 }, armR: { sh: 34, el: 56 } });
  const night = () => { bg('#22303F'); for (const x of [120, 960]) { line(x, 260, x, 760, 12, '#3A4656'); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) circ(x - 60 + i * 60, 230 + j * 44, 18, '#F6E7B0', 4); } rect(-400, 860, 1880, 300, '#2B3A4C', 0); crowd(-60, 900, 1200, 4, 7, 0, 0.9); rect(-400, 1120, 1880, 40, '#C9BFA8', LW); poly([[-400, 1160], [1480, 1160], [1480, 2400], [-400, 2400]], PAL.grass, 0); for (let i = 0; i < 9; i++) line(-400 + i * 240, 1160, -200 + i * 300, 2400, 4, '#6EAA5C'); };
  const pitch = (sky = PAL.sky) => { bg(sky); poly([[-400, 1100], [1480, 1100], [1480, 2400], [-400, 2400]], PAL.grass, 0); for (let i = 0; i < 6; i++) rect(-400, 1100 + i * 200, 1880, 100, PAL.grassDark, 0); line(-400, 1100, 1480, 1100, LW); };
  const bubble = (x, y, s, wd = 260) => { rect(x - wd / 2, y - 70, wd, 100, PAL.paper, LW, 24); poly([[x - 30, y + 28], [x - 4, y + 28], [x - 40, y + 70]], PAL.paper, LW); ctx.fillStyle = PAL.paper; ctx.fillRect(x - 28, y + 22, 22, 9); text(s, x, y + 6, 52, A.INK); };
  const flash = (t, t0, pts) => { const f = seg(t, t0 - 0.1, 0.25) * (1 - seg(t, t0 + 0.3, 0.3)); if (f > 0) for (const [x, y] of pts) { ctx.save(); ctx.translate(x, y); ctx.globalAlpha = f; for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); line(0, 30, 0, 80, 8, PAL.gold); } ctx.restore(); } };
  const kitShape = (x, y) => [[x - 70, y], [x - 100, y + 40], [x - 80, y + 70], [x - 60, y + 55], [x - 60, y + 200], [x + 60, y + 200], [x + 60, y + 55], [x + 80, y + 70], [x + 100, y + 40], [x + 70, y]];

  const scenes = [];
  // 0 · kulübe: kancada yılları sayan tabela ("MAÇ 0"), l05'te 0–2; telsizli patron; bankta Kaiser
  scenes[0] = t => {
    t = loopT(t);
    night();
    if (t < T.l05 - 0.2) { rect(540, 830, 230, 170, '#1F2421', LW, 16); const yr = Math.round(lerp(1979, 1992, seg(t, w('l01', 'on') - 0.2, w('l01', 'çıkmadan') - w('l01', 'on') + 0.2))); text(String(yr), 655, 900, 56, '#F6C445'); text('MAÇ: 0', 655, 970, 50, '#F4F1EA'); }
    else { rect(600, 620, 400, 190, '#1F2421', LW, 16); text('0 – 2', 800, 750, 104, '#F6C445'); }
    rect(80, 1000, 920, 40, '#5A6068', LW, 8); line(130, 1040, 130, 1360, 10); line(950, 1040, 950, 1360, 10);
    rect(90, 1250, 900, 34, PAL.wood, LW, 8);
    const shout = talk(t, w('l05', 'patron'), w('l05', 'bağırıyor') + 0.4);
    if (t > T.l05 - 0.2) ch('patron', { x: 790, y: GY, s: S, expr: shout ? 'kizgin' : 'notr', talk: shout, armR: { sh: 150, el: 40 }, armL: { sh: 20, el: 10 }, props: { R: 'phone' }, head: { tilt: -6, look: [-0.3, 0] } }, t);
    const wink = t > T.l02 - 0.3 && t < T.l03 + 0.6;
    const scared = t > w('l05', 'sokun') - 0.2;
    ch('kaiser', { x: 400, y: 1258, s: S, ...sitSide(1), expr: scared ? 'korku' : wink ? 'mutlu' : 'notr', armR: wink ? { sh: 120, el: 120 } : undefined, head: { tilt: scared ? 8 : wink ? -8 : 0, look: [scared ? 0.6 : 0.2, 0] } }, t);
  };
  // 1 · imza: formalar duvarda, sözleşme (iki kez: ilk imza ve uzatma)
  scenes[1] = t => {
    bg('#E9DFC9'); rect(-400, 1300, 1880, 900, '#CDBFA8', 0); line(-400, 1300, 1480, 1300, LW);
    const kits = [['#C8102E', '#1F2421', 'h'], ['#1F2421', '#F4F1EA', 'v'], ['#7A1F35', '#0B6B3A', 'v'], ['#F4F1EA', '#1F2421', 's']];
    kits.forEach(([a, b, k], i) => { const x = 150 + i * 220, y = 620; ctx.save(); poly(kitShape(x, y), a, LW); ctx.clip(); ctx.fillStyle = b; if (k === 'h') for (let yy = y + 20; yy < y + 200; yy += 44) ctx.fillRect(x - 100, yy, 200, 20); if (k === 'v') for (let xx = x - 90; xx < x + 100; xx += 40) ctx.fillRect(xx, y, 18, 200); if (k === 's') { ctx.save(); ctx.translate(x, y + 100); ctx.rotate(-0.6); ctx.fillRect(-150, -14, 300, 28); ctx.restore(); } ctx.restore(); poly(kitShape(x, y), null, LW); line(x, y - 40, x, y, 4); });
    rect(220, 1150, 640, 30, PAL.wood, LW, 6); rect(260, 1180, 30, 180, PAL.wood, LW); rect(790, 1180, 30, 180, PAL.wood, LW);
    rect(470, 1118, 150, 34, PAL.paper, 4, 4);
    const second = t > w('l03', 'kulüp') - 0.2;
    if (second) ch('patron', { x: 820, y: GY + 20, s: S, view: 'side', facing: -1, armR: { sh: 70, el: 20 }, expr: 'mutlu' }, t);
    const shrug = t > T.l04 - 0.2;
    ch('kaiser', { x: second ? 420 : 540, y: GY + 20, s: S, expr: 'mutlu', armR: shrug ? { sh: 60, el: 100 } : { sh: 40, el: -50 }, armL: shrug ? { sh: 60, el: 100 } : { sh: 10, el: 0 }, head: { tilt: shrug ? 10 : 0, look: [shrug ? 0.6 : 0, 0.2] } }, t);
    flash(t, w('l03', 'imzayı'), [[180, 980], [900, 900]]); flash(t, w('l03', 'uzatıyor'), [[160, 940], [940, 980]]);
  };
  // 2 · saha: yere yığılır, yerde göz kırpar ("sakatlık sahte")
  scenes[2] = t => {
    pitch();
    const fall = ease.enter(seg(t, w('l03', 'bacağını') - 0.1, 0.45)), wink = t > w('l03', 'sakatlık') - 0.1;
    ctx.save(); ctx.translate(560, GY); ctx.rotate(-1.45 * fall); ctx.translate(-560, -GY);
    ch('kaiser', { x: 560, y: GY, s: S, view: 'side', facing: -1, expr: wink ? 'mutlu' : fall > 0.3 ? 'korku' : 'notr', armL: fall > 0.3 ? { sh: 60, el: 90 } : { sh: -10, el: 10 }, armR: fall > 0.3 ? { sh: 50, el: 100 } : { sh: 10, el: 10 }, legL: { hip: fall * 20, knee: fall * 60 }, legR: { hip: -fall * 10, knee: fall * 20 } }, t);
    ctx.restore();
    ball(lerp(820, 900, fall), GY - 34, 34, 0.4 + fall * 3);
    if (fall > 0.6 && !wink) bubble(560, 1060, 'AAH!', 220);
    if (wink) { rect(300, 960, 260, 100, PAL.paper, LW, 20); text('SAHTE', 430, 1035, 66, PAL.red); }
  };
  // 3 · soyunma odası: oyuncak telefon
  scenes[3] = t => {
    bg('#B9C7C2'); for (let i = 0; i < 6; i++) { rect(-20 + i * 190, 560, 180, 700, '#8FA3A0', LW, 6); for (let j = 0; j < 4; j++) line(30 + i * 190, 620 + j * 18, 120 + i * 190, 620 + j * 18, 4); } rect(-400, 1300, 1880, 900, '#CDBFA8', 0); line(-400, 1300, 1480, 1300, LW);
    rect(150, 1250, 780, 34, PAL.wood, LW, 8);
    const on = talk(t, w('l03', 'soyunma'), w('l03', 'konuşuyor') + 0.3);
    ch('kaiser', { x: 520, y: 1258, s: S, ...sitSide(1), armR: { sh: 150, el: 140 }, props: { R: 'phone' }, expr: 'mutlu', talk: on, head: { tilt: -6, look: [0.4, -0.2] } }, t);
    if (t > w('l03', 'avrupa') - 0.2) bubble(820, 860, 'AVRUPA!', 300);
  };
  // 4 · tel örgü: tribüne döner, örgüyü aşar, kavga, kırmızı kart
  scenes[4] = t => {
    bg('#22303F'); rect(-400, 500, 1880, 600, '#2B3A4C', 0);
    const fight = seg(t, w('l05', 'kavgaya') - 0.3, 0.5), cardT = w('l05', 'kırmızı') - 0.2;
    crowd(-60, 560, 1200, 6, 13, fight * (1 - seg(t, cardT, 0.5)), 1.05, t);
    poly([[-400, 1100], [1480, 1100], [1480, 2400], [-400, 2400]], PAL.grass, 0);
    for (let x = -400; x < 1500; x += 40) { line(x, 820, x + 280, 1100, 4, '#9AA3AA'); line(x + 280, 820, x, 1100, 4, '#9AA3AA'); } line(-400, 820, 1480, 820, 10, '#6E777E'); line(-400, 1100, 1480, 1100, 10, '#6E777E');
    const climb = seg(t, w('l05', 'tel') - 0.2, w('l05', 'aşıp') + 0.5 - w('l05', 'tel'));
    if (t < cardT) {
      const ky = lerp(GY, 860, ease.state(climb)), mid = climb > 0 && climb < 1;
      ch('kaiser', { x: 640, y: ky, s: S, armL: mid ? { sh: 160 + 20 * Math.sin(t * 8), el: 10 } : { sh: 10, el: 0 }, armR: mid ? { sh: 160 - 20 * Math.sin(t * 8), el: 10 } : fight > 0 ? { sh: 100, el: 30 } : { sh: 10, el: 0 }, expr: fight > 0 ? 'kizgin' : 'korku' }, t);
    } else {
      const card = ease.enter(seg(t, cardT, 0.4));
      ch('kaiser', { x: 760, y: 860, s: S * 0.8, expr: 'saskin', armL: { sh: 30, el: 20 }, armR: { sh: 30, el: 20 } }, t);
      ch('hakem', { x: 360, y: GY, s: S * 1.15, armR: { sh: lerp(10, 170, card), el: 0 }, expr: 'kizgin' }, t);
      if (card > 0.2) { ctx.save(); ctx.translate(440, GY - 3.0 * S * 1.15 - 120 * card); ctx.rotate(0.12); rect(-40, -60, 80, 120, PAL.red, LW, 8); ctx.restore(); }
    }
  };
  // 5 · patron odası: "Size laf ettiler" ve zam
  scenes[5] = t => {
    bg('#D9C9A8'); rect(-400, 1300, 1880, 900, '#A8865E', 0); line(-400, 1300, 1480, 1300, LW);
    rect(380, 520, 320, 230, '#F4EFE3', LW, 8); for (let i = 0; i < 4; i++) line(420, 600 + i * 36, 660, 600 + i * 36, 4, '#B9AE98');
    rect(180, 1120, 720, 40, '#6A4A2E', LW, 6); rect(220, 1160, 640, 200, '#7A5634', LW, 6);
    const raise = seg(t, w('l05', 'zam') - 0.3, 0.4);
    ch('patron', { x: 300, y: GY, s: S, view: 'side', facing: 1, expr: raise > 0 ? 'mutlu' : 'saskin', armR: raise > 0 ? { sh: 80, el: 20 } : { sh: 10, el: 10 } }, t);
    ch('kaiser', { x: 760, y: GY, s: S, view: 'side', facing: -1, expr: raise > 0 ? 'mutlu' : 'yorgun', talk: talk(t, w('l05', 'size') - 0.2, w('l05', 'dayanamadım') + 0.8), armR: raise > 0 ? { sh: 160, el: 20 } : { sh: 40, el: 110 }, head: { tilt: raise > 0 ? -6 : 10 } }, t);
    if (raise > 0) { const k = ease.enter(raise); ctx.save(); ctx.translate(540, 1000 - 40 * k); ctx.rotate(-0.08); rect(-150, -60, 300, 120, PAL.paper, LW, 10); text('ZAM!', 0, 28, 84, PAL.red); ctx.restore(); }
  };
  // 6 · havalimanı: 15 yaşında Kazu, 700 dolar, kalkan uçak
  scenes[6] = t => {
    bg('#DCE7EA'); rect(60, 520, 960, 560, '#BFD6DC', LW, 20); line(540, 520, 540, 1080, LW); rect(-400, 1300, 1880, 900, '#C9C2B4', 0); line(-400, 1300, 1480, 1300, LW);
    const fly = seg(t, w('l09', 'uçuyor') - 0.6, 1.6), px = lerp(-200, 1300, fly), py = lerp(980, 640, fly);
    ctx.save(); ctx.beginPath(); ctx.rect(66, 526, 948, 548); ctx.clip(); ctx.translate(px, py); ctx.rotate(-0.25 * fly); ell(0, 0, 150, 34, '#F4F1EA', LW); poly([[-20, 0], [40, -10], [-40, -110], [-80, -110]], '#C2412F', LW); poly([[-130, -6], [-110, -6], [-150, -70], [-170, -70]], '#C2412F', LW); ctx.restore();
    rect(660, 1180, 120, 160, '#8A5A3A', LW, 10); line(690, 1180, 690, 1140, 6); line(750, 1180, 750, 1140, 6); line(690, 1140, 750, 1140, 6);
    const cash = seg(t, w('l09', 'cebinde') - 0.2, 0.4);
    ch('kazu15', { x: 520, y: GY, s: S * 0.95, armR: { sh: lerp(10, 70, cash), el: lerp(0, 60, cash) }, expr: fly > 0 ? 'saskin' : 'notr', head: { look: [0.3, -0.3] } }, t);
    if (cash > 0) { ctx.save(); ctx.translate(640, 1060); ctx.globalAlpha = cash; for (let i = 0; i < 7; i++) { ctx.save(); ctx.rotate(-0.5 + i * 0.16); rect(-8, -70, 52, 90, '#8FBF7A', 4, 4); ctx.restore(); } ctx.restore(); }
  };
  // 7 · sessiz tribün: adını bilmiyorlar
  scenes[7] = t => {
    bg('#22303F'); rect(-400, 400, 1880, 760, '#2B3A4C', 0); crowd(-60, 460, 1200, 9, 29, 0, 1.0); poly([[-400, 1160], [1480, 1160], [1480, 2400], [-400, 2400]], PAL.grass, 0);
    ch('kazu15', { x: 540, y: GY + 80, s: S * 0.85, view: 'side', facing: 1, expr: 'yorgun', head: { look: [0.4, -0.5] } }, t);
    rect(640, 860, 200, 100, PAL.paper, LW, 20); text('?', 740, 935, 80, A.INK);
  };
  // 8 · penaltı: gol, tribün ilk kez haykırır
  scenes[8] = t => {
    const kick = w('l09', 16) + 0.2, goal = seg(t, kick, 0.7), roar = seg(t, w('l09', 'kazu!') - 0.3, 0.4);
    bg('#22303F'); rect(-400, 360, 1880, 760, '#2B3A4C', 0); crowd(-60, 420, 1200, 8, 31, roar, 1.0, t);
    if (roar > 0) { const k = ease.enter(roar); rect(300, 700 - 40 * k, 480, 110, PAL.paper, LW, 10); text('KAZU!', 540, 785 - 40 * k, 92, PAL.red); }
    poly([[-400, 1120], [1480, 1120], [1480, 2400], [-400, 2400]], PAL.grass, 0);
    rect(620, 900, 420, 230, null, 10); for (let i = 0; i < 10; i++) line(630 + i * 42, 905, 630 + i * 42, 1125, 3, '#C9CED2'); for (let j = 0; j < 5; j++) line(625, 920 + j * 42, 1035, 920 + j * 42, 3, '#C9CED2'); rect(620, 900, 420, 230, null, 10);
    const run = seg(t, w('l09', 15) - 0.2, kick - w('l09', 15) + 0.2);
    ch('kazu15', { x: lerp(160, 330, run), y: GY, s: S * 0.95, walk: run < 1 ? (t * 1.6) % 1 : 0.25, facing: 1, expr: roar > 0 ? 'mutlu' : 'notr', armL: roar > 0 ? { sh: 170, el: 10 } : undefined, armR: roar > 0 ? { sh: 170, el: 10 } : undefined }, t);
    const bx = lerp(420, 900, ease.exit(goal)), by = lerp(GY - 34, 1000, ease.exit(goal)) - Math.sin(goal * Math.PI) * 120;
    ball(goal >= 1 ? 900 : bx, goal >= 1 ? 1090 : by, 34, t * 6);
  };
  // 9 · korner: 59 yaşında Kazu, hâlâ sahada (Kazu dansı)
  scenes[9] = t => {
    pitch('#C9DCE2'); line(860, 1240, 860, 900, 8); poly([[860, 900], [960, 930], [860, 960]], PAL.gold, LW);
    const d = Math.sin(t * 7);
    ch('kazu59', { x: 520, y: GY, s: S, armL: { sh: 100 + 20 * d, el: -20 }, armR: { sh: 100 - 20 * d, el: -20 }, legL: { hip: 8 + 10 * d, knee: 10 + 10 * Math.max(0, d) }, legR: { hip: 8 - 10 * d, knee: 10 + 10 * Math.max(0, -d) }, expr: 'mutlu' }, t);
    rect(160, 620, 300, 150, PAL.paper, LW, 12); text('59', 310, 735, 110, PAL.red);
  };
  // 10 · karşılaştırma: Kaiser'in boş zemini, Kazu'nun 911 topu
  const pile = []; { const r = mulberry32(911); for (let i = 0; i < 911; i++) { const row = Math.floor(Math.sqrt(i * 1.6)); pile.push([660 + (r() - 0.5) * (560 - row * 9), 0, r() * 6.28]); } pile.forEach((p, i) => { p[1] = GY - 20 - Math.pow(i / 911, 0.62) * 520 + (r() - 0.5) * 18; }); }
  const ballN = t => Math.round(911 * ease.enter(seg(t, w('l09', 'bugün') - 0.1, hero(T) - w('l09', 'bugün'))));
  scenes[10] = t => {
    pitch('#C9DCE2'); line(540, 700, 540, 1500, 6, 'rgba(31,36,33,0.35)');
    const n = ballN(t), done = n >= 911;
    ch('kaiser', { x: 250, y: GY, s: S * 0.9, expr: 'yorgun', armL: { sh: 20, el: 30 }, armR: { sh: 20 + (done ? 25 + 15 * Math.sin(t * 2.2) : 0), el: 30 }, head: { tilt: done ? 6 * Math.sin(t * 1.7) : 0, look: [n > 300 ? 0.8 : 0, 0] } }, t);
    ell(250, GY + 6, 150, 26, null, 5);
    for (let i = 0; i < n; i++) { const [x, y, a] = pile[i]; ball(x, y, 19, a); }
    ch('kazu59', { x: 800, y: GY - 10 - Math.pow(n / 911, 0.62) * 520 * 0.55, s: S * 0.9, expr: n > 800 ? 'mutlu' : 'saskin', armL: n > 800 ? { sh: 150 + 20 * Math.sin(t * 6), el: 10 } : { sh: 15, el: 0 }, armR: n > 800 ? { sh: 150 - 20 * Math.sin(t * 6), el: 10 } : { sh: 15, el: 0 } }, t);
    if (!done && n > 0) for (let k = 0; k < 6; k++) { const yy = ((t * 1400 + k * 260) % 900) + 200; ball(560 + ((k * 137) % 360), yy, 19, t * 5 + k); }
  };

  // ——— kamera: [t, zoom, x, y] sahne yerel koordinatında; ZK genel yakınlık, YO dikey kayma ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 530, 935, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.12, 500, 940, 0)],
    [T.l02 + 0.3, ...P(1.45, 430, 920, 0)],
    ...cut(w('l03', 'imzayı') - 0.15, P(1.45, 430, 920, 0), P(1.0, 540, 960, 1)),
    ...cut(w('l03', 'bacağını') - 0.15, P(1.0, 540, 960, 1), P(1.0, 470, 1000, 2)),
    [w('l03', 'sakatlık') + 0.2, ...P(1.15, 400, 1120, 2)],
    ...cut(w('l03', 'soyunma') - 0.15, P(1.15, 400, 1120, 2), P(1.0, 540, 960, 3)),
    [w('l03', 'kulüp') - 0.3, ...P(1.25, 560, 960, 3)],
    ...cut(w('l03', 'kulüp') - 0.15, P(1.25, 560, 960, 3), P(1.0, 600, 960, 1)),
    [T.l04end + 0.2, ...P(1.15, 520, 960, 1)],
    ...cut(T.l05 - 0.15, P(1.15, 520, 960, 1), P(1.0, 600, 935, 0)),
    [w('l05', 'bağırıyor'), ...P(1.05, 650, 950, 0)],
    ...cut(w('l05', 'tel') - 0.15, P(1.05, 650, 950, 0), P(1.0, 560, 980, 4)),
    [w('l05', 'kavgaya'), ...P(1.0, 640, 700, 4)],
    [w('l05', 'kırmızı') - 0.36, ...P(1.0, 640, 700, 4)],
    ...cut(w('l05', 'kırmızı') - 0.35, P(1.0, 640, 700, 4), P(1.0, 520, 900, 4)),
    ...cut(w('l05', 'kendi') - 0.15, P(1.0, 520, 900, 4), P(1.0, 540, 960, 5)),
    [w('l05', 'zam') - 0.3, ...P(1.1, 600, 960, 5)],
    [T.l06end + 0.2, ...P(1.2, 560, 920, 5)],
    ...cut(T.l07 - 0.15, P(1.2, 560, 920, 5), P(1.0, 540, 960, 6)),
    ...cut(w('l07', 'elli') - 0.15, P(1.0, 540, 960, 6), P(1.2, 540, 1000, 9)),
    [T.l08end + 0.2, ...P(1.05, 560, 960, 9)],
    ...cut(T.l09 - 0.15, P(1.05, 560, 960, 9), P(1.0, 540, 960, 6)),
    [w('l09', 'uçuyor') + 0.4, ...P(1.1, 560, 900, 6)],
    ...cut(w('l09', 'yıllarca') - 0.15, P(1.1, 560, 900, 6), P(1.0, 540, 960, 7)),
    ...cut(w('l09', 15) - 0.15, P(1.0, 540, 960, 7), P(1.0, 540, 960, 8)),
    [w('l09', 'kazu!') + 0.6, ...P(0.98, 540, 900, 8)],
    ...cut(w('l09', 'bugün') - 0.15, P(0.98, 540, 900, 8), P(0.58, 540, 1080, 10)),
    [hero(T), ...P(0.54, 560, 1040, 10)],
    [T.loop0 - 0.001, ...P(0.64, 600, 1000, 10)],
    [T.loop0, ...P(1.04, 525, 945, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'carlos') - 0.1, w('l03', 'sakatlık') - 0.3, 'CARLOS KAISER', 'Brezilya · 1979–1992'], [w('l09', 'kazu') - 0.1, w('l09', 'uçuyor') + 0.3, 'KAZU MIURA', 'Japonya · 1982 · 15 yaşında']],
    numbers: [[w('l09', 'bugün') - 0.05, T.l11 + 0.3, t => (ballN(t) >= 911 ? '0 – 911' : '0 – ' + ballN(t)), 'RESMÎ MAÇ · KAISER – KAZU']],
  };
}

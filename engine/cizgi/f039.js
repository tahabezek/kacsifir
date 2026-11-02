// № 039 · Türünün son üyesi ve yavrularıyla dolan ada (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y].
// Kanca: kayalıkta tek başına bekleyen Yalnız George ve yanında yılları sayan tabela. A'nın ters köşesi: boş ağıl.
// Doruk: Española kumsalı; Diego'nun yanında 800'ü aşkın yavru adaya yayılır.

const SX = 1400;
export function hero(T) { return T.w('l07', 32) + 0.4; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 16) - 0.3, w('l03', 16)], [w('l03', 'ona') - 0.3, w('l03', 'ona')], [w('l03', 44) - 0.3, w('l03', 44)], [T.l05 - 0.3, T.l05], [T.l07 - 0.3, T.l07], [w('l07', 'sonra') - 0.3, w('l07', 'sonra')], [w('l07', 'galapagos') - 0.3, w('l07', 'galapagos')], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'keçi'), w('l03', 'açılmıyor'), w('l07', 'diego')],
    thock: [w('l03', 'buluyor')],
    scratch: [[w('l07', 27) - 0.1, hero(T), 0.02]],
    riser: [w('l07', 27) - 0.3, hero(T) - 0.2],
    impact: hero(T) - 0.2,
    loopEnd: T.loop0,
  };
}

const base = (o) => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const FAUSTO = base({ key: 'fausto2d', name: 'Fausto Llerena', seed: 401,
  torso: { len: 0.86, shoulder: 0.68, hip: 0.56, depth: 0.42, belly: 0.06, color: '#B8A878', shade: '#9A8C60' },
  arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#B8A878', shade: '#9A8C60', hand: 0.12 },
  leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#5A5240', shade: '#463F30' },
  shoe: { color: '#4A3A2A', len: 0.3, h: 0.11 }, skin: '#B88A66', skinShade: '#9A704E', hair: '#BEB8AE', features: ['jacket', 'baldSides', 'mustacheThick'] });
const BALIKCI = base({ key: 'balikci', name: 'Balıkçı', seed: 411,
  torso: { len: 0.84, shoulder: 0.66, hip: 0.54, depth: 0.4, belly: 0, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#2E4A6B', shade: '#233A55', hand: 0.12 },
  leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#5A5240', shade: '#463F30' },
  shoe: { color: '#3A2A1E', len: 0.3, h: 0.11 }, skin: '#C48A5E', skinShade: '#A8724A', hair: '#1E1814', features: ['hairMessy', 'mustacheThin'] });
const BILIM = base({ key: 'bilim039', name: 'Bilim insanı', seed: 421,
  torso: { len: 0.84, shoulder: 0.64, hip: 0.56, depth: 0.4, belly: 0, color: '#D9C9A0', shade: '#BCAD84' },
  arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#D9C9A0', shade: '#BCAD84', hand: 0.12 },
  leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#6A5A44', shade: '#544634' },
  shoe: { color: '#3A2A1E', len: 0.3, h: 0.11 }, skin: '#ECCCB2', skinShade: '#D4B094', hair: '#7A5A3A', features: ['vest', 'hairSlick', 'glassesRect'] });

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW, path, fs } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const bubble = (x, y, s, wd = 300, size = 46) => { rect(x - wd / 2, y - 70, wd, 100, PAL.paper, LW, 24); poly([[x - 30, y + 28], [x - 4, y + 28], [x - 40, y + 70]], PAL.paper, LW); ctx.fillStyle = PAL.paper; ctx.fillRect(x - 28, y + 22, 22, 9); text(s, x, y + 2, size, A.INK); };
  // eyer kabuklu kaplumbağa (yan görünüş): baş +x yönünde; k ölçek, neck 0..1 boyun uzatma, walk faz, shell rengi
  const tortoise = (x, y, k, o = {}, t = 0) => {
    const f = o.face ?? 1, neck = o.neck ?? 0.3, ph = o.walk ?? 0, sh = o.shell || '#4E4436', sk = o.skin || '#7A6E5E';
    ctx.save(); ctx.translate(x, y); ctx.scale(k * f, k);
    const lg = (lx, a) => { ctx.save(); ctx.translate(lx, -30); ctx.rotate(a); rect(-16, 0, 32, 46, sk, LW, 10); ctx.restore(); };
    const sw = o.walk != null ? 0.35 * Math.sin(ph * 6.28) : 0;
    lg(-70, sw); lg(60, -sw);
    const nx = 80 + 70 * neck, ny = -70 - 50 * neck - (o.lift || 0) * 40;
    ctx.lineCap = 'round'; ctx.strokeStyle = A.INK; ctx.lineWidth = 34 + LW * 2; ctx.beginPath(); ctx.moveTo(70, -60); ctx.quadraticCurveTo(nx - 10, -70, nx, ny); ctx.stroke(); ctx.strokeStyle = sk; ctx.lineWidth = 34; ctx.stroke();
    ell(nx + 18, ny - 4, 34, 24, sk, LW, -0.2); circ(nx + 28, ny - 12, 5, A.INK, 0);
    if (o.sad) line(nx + 18, ny - 24, nx + 38, ny - 18, 4);
    path([[-110, -30], [-104, -90], [-60, -130], [10, -138], [70, -118], [104, -96], [96, -30]]); fs(sh);
    ctx.strokeStyle = 'rgba(31,36,33,0.5)'; ctx.lineWidth = 4; for (const [a, b] of [[-60, -125], [0, -132], [56, -116]]) { ctx.beginPath(); ctx.moveTo(a, b + 20); ctx.lineTo(a - 18, -40); ctx.stroke(); }
    line(-110, -30, 96, -30, LW);
    lg(-40, -sw); lg(80, sw);
    ctx.restore();
  };
  const goat = (x, y, k, t) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ell(0, -40, 40, 22, '#F4F1EA', LW); for (const lx of [-24, 22]) line(lx, -22, lx, 0, 6); ell(42, -60, 16, 12, '#F4F1EA', LW); line(48, -70, 58, -86, 4); ctx.restore(); };
  const egg = (x, y, cracked, dull) => { ell(x, y, 22, 28, dull ? '#B8B0A0' : '#F4F1EA', LW); if (cracked) { ctx.strokeStyle = A.INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 14, y - 4); ctx.lineTo(x - 4, y + 4); ctx.lineTo(x + 4, y - 6); ctx.lineTo(x + 14, y + 2); ctx.stroke(); } };
  const isle = (green) => { bg('#BFD6DC'); rect(-1400, 1180, 3880, 1200, '#3E7A9A', 0); path([[-200, 1190], [100, 1000], [340, 880], [620, 840], [880, 900], [1180, 1040], [1400, 1190]]); fs(green ? '#6EA85A' : '#B89A66'); line(-1400, 1190, 2480, 1190, LW); };

  const scenes = [];
  // 0 · kayalık: tek başına George, yanında "1971 → 2012" yıl tabelası (kanca); l03'te ölü bulunduğu sabahın ağılı
  scenes[0] = t => {
    const lt = loopT(t);
    bg('#E9D9B8'); rect(-400, 1240, 1880, 900, '#B89A66', 0); line(-400, 1240, 1480, 1240, LW);
    for (const [x, y, r] of [[120, 1240, 90], [880, 1240, 120], [980, 1240, 70]]) { path([[x - r, y], [x - r * 0.6, y - r * 0.8], [x + r * 0.3, y - r], [x + r, y]]); fs('#8C7A5E'); }
    const yr = Math.round(lerp(1971, 2012, seg(lt, 1.6, w('l01', 'bekleyen') - 1.6)));
    rect(520, 900, 240, 160, PAL.paper, LW, 12); text(String(yr), 640, 978, 72, A.INK); text('EŞ: YOK', 640, 1036, 38, PAL.red);
    line(640, 1060, 640, 1240, 10, '#7A5634');
    const look = 0.2 + 0.15 * Math.sin(lt * 1.1);
    tortoise(330, 1250, 1.25, { neck: 0.55, lift: look, sad: true }, t);
  };
  // 1 · Pinta: balıkçı teknesi ve üç keçi; keçiler çoğalır, ada sararır
  scenes[1] = t => {
    const many = seg(t, w('l03', 'keçiler') - 0.2, w('l03', 'yiyor') + 0.4 - w('l03', 'keçiler'));
    isle(many < 0.5);
    if (many > 0) { ctx.fillStyle = 'rgba(184,154,102,' + ease.state(many) + ')'; path([[-200, 1190], [100, 1000], [340, 880], [620, 840], [880, 900], [1180, 1040], [1400, 1190]]); ctx.fill(); }
    const r = mulberry32(39), n = Math.round(lerp(3, 60, ease.enter(many)));
    for (let i = 0; i < n; i++) { const u = r(), x = 140 + u * 820, top = 1190 - Math.max(0, 350 * Math.sin(Math.PI * clamp01((x + 200) / 1600))) * 0.95; goat(x, lerp(1180, top + 30, r()), 0.8, t); }
    const bx = lerp(-120, 160, ease.state(seg(t, T.l03, 1.6)));
    path([[bx - 120, 1170], [bx + 140, 1170], [bx + 100, 1230], [bx - 90, 1230]]); fs('#8A5A3A');
    ch(BALIKCI, { x: bx + 20, y: 1172, s: S * 0.7, view: 'side', facing: 1, armR: { sh: 80, el: 20 }, expr: 'notr' }, t);
  };
  // 2 · ödül tabelası ve açılmayan yumurtalar; bilim insanı George'u bulur
  scenes[2] = t => {
    bg('#E9D9B8'); rect(-400, 1240, 1880, 900, '#B89A66', 0); line(-400, 1240, 1480, 1240, LW);
    const found = t < w('l03', 'ona') - 0.2;
    if (found) {
      ch(BILIM, { x: 260, y: GY - 100, s: S, view: 'side', facing: 1, armR: { sh: 120, el: 10 }, expr: 'saskin' }, t);
      tortoise(680, 1250, 1.05, { neck: 0.4, face: -1 }, t);
    } else {
      rect(140, 560, 420, 300, PAL.paper, LW, 12); text('ÖDÜL', 350, 650, 64, PAL.red); text('10.000 $', 350, 750, 76, A.INK); text('eşi bulana', 350, 815, 38, A.INK); line(350, 860, 350, 1240, 10, '#7A5634');
      tortoise(700, 1250, 1.0, { neck: 0.3, face: -1, sad: true }, t);
      const dull = t > w('l03', 'açılmıyor') - 0.3;
      if (t > w('l03', 'yanına') - 0.3) for (let i = 0; i < 5; i++) egg(500 + i * 60, 1215 - (i % 2) * 12, dull && i % 2 === 0, dull);
      if (dull) { rect(560, 980, 260, 90, PAL.paper, LW, 16); text('AÇILMADI', 690, 1042, 44, PAL.red); }
    }
  };
  // 3 · ağıl, 2012 sabahı: Fausto ve boynu uzanmış George (A'nın sonu ve Soran'ın "Çok üzücü")
  scenes[3] = t => {
    bg('#F2D9B0'); rect(-400, 1240, 1880, 900, '#A8946A', 0); line(-400, 1240, 1480, 1240, LW);
    for (let i = 0; i < 9; i++) { line(60 + i * 120, 1240, 60 + i * 120, 1010, 8, '#7A5634'); } line(0, 1060, 1080, 1060, 8, '#7A5634'); line(0, 1140, 1080, 1140, 8, '#7A5634');
    ell(780, 1250, 110, 22, '#7AA8B8', LW);
    const sun = seg(t, w('l03', 44) - 0.4, 2.2); circ(900, lerp(780, 600, sun), 70, '#F6C445', LW);
    tortoise(560, 1250, 1.05, { neck: 1.0, lift: -1.2 }, t);
    const kneel = seg(t, w('l03', 'bakıcısı') - 0.4, 0.8);
    ch(FAUSTO, { x: lerp(120, 270, ease.state(kneel)), y: GY, s: S, view: 'side', facing: 1, legL: { hip: 60 * kneel, knee: 100 * kneel }, legR: { hip: -10 * kneel, knee: 90 * kneel }, lean: 18 * kneel, armR: { sh: 60 * kneel, el: 30 }, expr: kneel > 0.5 ? 'yorgun' : 'notr', head: { tilt: 14 * kneel } }, t);
  };
  // 4 · Española: kumsalda dağınık 14 kaplumbağa (12 dişi, 2 erkek); sonra hayvanat bahçesinde Diego
  scenes[4] = t => {
    const zoo = t > w('l07', 'sonra') - 0.15;
    if (!zoo) {
      bg('#BFD6DC'); rect(-400, 1060, 1880, 200, '#3E7A9A', 0); rect(-400, 1240, 1880, 900, '#E2CFA0', 0); line(-400, 1240, 1480, 1240, LW);
      const r = mulberry32(14); for (let i = 0; i < 14; i++) { const x = 110 + r() * 860, y = 1260 + r() * 260; tortoise(x, y, 0.42, { neck: 0.2 + 0.2 * r(), face: r() > 0.5 ? 1 : -1, shell: i < 2 ? '#2A2622' : '#4E4436' }, t); }
      rect(330, 760, 420, 150, PAL.paper, LW, 14); text('12 dişi', 540, 830, 54, A.INK); text('2 erkek', 540, 890, 54, PAL.red);
    } else {
      bg('#DCE7D8'); rect(-400, 1240, 1880, 900, '#A8B888', 0); line(-400, 1240, 1480, 1240, LW);
      for (let i = 0; i < 14; i++) line(-60 + i * 90, 1240, -60 + i * 90, 980, 6, '#5A5E66'); line(-100, 1000, 1180, 1000, 6, '#5A5E66'); line(-100, 1120, 1180, 1120, 6, '#5A5E66');
      const rise = seg(t, w('l07', 'diego') - 0.6, 0.8);
      tortoise(520, 1300, 1.25, { neck: 0.4 + 0.6 * ease.enter(rise), lift: 0.8 * rise, shell: '#2A2622', skin: '#6A6256' }, t);
      if (rise > 0.3) { rect(620, 700, 300, 110, PAL.paper, LW, 14); text('DIEGO', 770, 778, 64, PAL.red); }
    }
  };
  // 5 · doruk: Española kumsalı; Diego ve 800'ü aşkın yavru, sonra adada 2.000'den fazla kaplumbağa
  const babyN = t => Math.round(800 * ease.enter(seg(t, w('l07', 27) - 0.2, hero(T) - w('l07', 27))));
  const babies = []; { const r = mulberry32(800); for (let i = 0; i < 2000; i++) babies.push([60 + r() * 960, 1250 + Math.pow(r(), 0.8) * 560, r() > 0.5 ? 1 : -1, 0.12 + r() * 0.06]); }
  scenes[5] = t => {
    bg('#BFD6DC'); rect(-400, 1020, 1880, 240, '#3E7A9A', 0); for (let i = 0; i < 6; i++) line(-400, 1060 + i * 34 + 6 * Math.sin(t * 1.4 + i), 1480, 1060 + i * 34 + 6 * Math.sin(t * 1.4 + i), 3, '#7AB0C8');
    rect(-400, 1240, 1880, 1600, '#E2CFA0', 0); line(-400, 1240, 1480, 1240, LW);
    const n = Math.max(babyN(t), t > w('l07', 'bugün') - 0.2 ? Math.round(lerp(800, 2000, ease.enter(seg(t, w('l07', 'bugün') - 0.2, 1.4)))) : 0);
    for (let i = 0; i < Math.min(n, 2000); i++) { const [x, y, f, k] = babies[i]; tortoise(x, y, k * (y / 1500), { neck: 0.3, face: f, walk: (t * 0.7 + i * 0.13) % 1, shell: i < 800 ? '#3A342C' : '#5A4E3E' }, t); }
    tortoise(540, 1420, 1.3, { neck: 0.9 + 0.1 * Math.sin(t * 1.2), lift: 0.9, shell: '#2A2622', skin: '#6A6256' }, t);
  };

  // ——— kamera ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(0.78, 500, 980, 0);
  const cam = [
    [0, ...F0],
    [T.l02end + 0.2, ...P(0.9, 470, 1000, 0)],
    ...cut(T.l03 - 0.15, P(0.9, 470, 1000, 0), P(0.6, 540, 940, 1)),
    [w('l03', 'yiyor') + 0.3, ...P(0.62, 560, 940, 1)],
    ...cut(w('l03', 16) - 0.15, P(0.62, 560, 940, 1), P(0.78, 480, 960, 2)),
    ...cut(w('l03', 'ona') - 0.15, P(0.78, 480, 960, 2), P(0.72, 540, 900, 2)),
    [w('l03', 'açılmıyor') + 0.3, ...P(0.8, 560, 930, 2)],
    ...cut(w('l03', 44) - 0.15, P(0.8, 560, 930, 2), P(0.74, 520, 960, 3)),
    [T.l04end + 0.2, ...P(0.86, 470, 1000, 3)],
    ...cut(T.l05 - 0.15, P(0.86, 470, 1000, 3), P(0.6, 540, 1040, 5)),
    [T.l06end, ...P(0.66, 540, 1080, 5)],
    ...cut(T.l07 - 0.15, P(0.66, 540, 1080, 5), P(0.68, 540, 1000, 4)),
    ...cut(w('l07', 'sonra') - 0.15, P(0.68, 540, 1000, 4), P(0.74, 560, 1060, 4)),
    ...cut(w('l07', 'galapagos') - 0.15, P(0.74, 560, 1060, 4), P(0.72, 540, 1150, 5)),
    [hero(T), ...P(0.58, 540, 1130, 5)],
    [w('l07', 'yaşıyor') + 0.4, ...P(0.54, 540, 1120, 5)],
    [T.loop0 - 0.001, ...P(0.6, 540, 1140, 5)],
    [T.loop0, ...P(0.8, 495, 985, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 26) - 0.1, w('l03', 'ona') - 0.3, 'YALNIZ GEORGE', 'Pinta kaplumbağası · bilinen son üye'], [w('l03', 'bakıcısı') - 0.1, T.l04end + 0.2, 'FAUSTO LLERENA', '40 yıl boyunca bakıcısı']],
    numbers: [[w('l07', 27) - 0.1, w('l07', 'bugün') - 0.25, t => (babyN(t) >= 800 ? '800+' : String(babyN(t))), 'DIEGO\'NUN YAVRUSU'], [w('l07', 'bugün') - 0.1, T.l09 + 0.3, '2.000+', 'BUGÜN ADADA']],
  };
}

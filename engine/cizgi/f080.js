// № 080 · Titanik'in son 160 dakikası (çizgi motoru, yeni iskelet "olay canlı akıyor", iki sesli). Senaryo: research/pilot/080.md.
// TEK PLAN: gece, yandan görünen gemi; sağ üstte gerçek gemi saati 23.40'tan akar. Her şey saatin (m: 23.40'tan beri dakika)
// fonksiyonudur: gövdenin eğimi, ışıklar, filikalar (British Inquiry tablosundaki saatlerde), fişekler, Carpathia'nın mesafesi.
// Saat hızı önemli anlarda yavaşlar, aralarda hızlanır (monoton eğri). Döngü: son 1,2 sn'de göstergeler çekilir, saat 23.40'a
// geri sarar; sahne geri sarma bitince tek kesmeyle ilk kareye (aynı gece, aynı kadraj) döner. Trajedi kuralı: kimse gülümsemez.
// Katmanlar: uzak katman ekran uzayında (gök, yıldızlar, ufuk, Californian, Carpathia); yakın katman dünya uzayında
// (gemi, buzdağı, filikalar, fişekler, su); üst katman ekran uzayında (saat, göstergeler, kesit pencereleri, telsiz halkaları).

export function hero(T) { return T.l08end + 3.0; }   // 02.20: kıç suya girer
const T_HIT = 0.4;   // görüntüde çarpma anı (sn)
export function cues(T) {
  const E = T.l08end, w = (id, k) => T.w(id, k);
  const tc = T_HIT;
  const ti = w('l04', 4);                         // "imdat"
  const morse = (t0) => { const out = []; let t = t0; for (const ch of ['-.-.', '--.-', '-..']) { for (const s of ch) { out.push(t); t += s === '-' ? 0.2 : 0.09; } t += 0.16; } return out; };
  const clk = makeClock(T);
  const rockets = ROCKETS.map(r => clk.tOf(r)).filter(t => t < T.loop0);
  return {
    rumble: [[tc, 0.3], [E + 0.6, 0.45]],
    scratch: [[tc, tc + 1.2, 0.03], [clk.tOf(65), clk.tOf(65) + 0.9, 0.018]],
    tick: [...morse(ti), ...morse(ti + 2.4)],
    whip: [...rockets.map(t => [t, t + 0.4]), [T.loop0 - 0.05, T.loop0 + 0.6]],
    riser: [T.l08, E + 2.05],
    silence: [E + 2.1, E + 3.0],
    impact: E + 3.0,
    loopEnd: T.loop0,
  };
}

// British Inquiry tablosu: filika → indirilme dakikası (23.40'tan beri). Sancak (görünen taraf) ve iskele (arka taraf).
const STAR = [['7', 65, 27, 180], ['5', 75, 41, 215], ['3', 80, 50, 250], ['1', 90, 12, 285], ['9', 100, 56, -200], ['11', 105, 70, -235], ['13', 115, 64, -270], ['15', 115, 70, -305], ['C', 120, 71, 312]];
const PORT = [['6', 75, 28, 200], ['8', 90, 39, 235], ['10', 100, 55, -215], ['12', 105, 26, -250], ['14', 110, 42, -285], ['16', 115, 63, -320], ['2', 125, 26, 300], ['4', 135, 40, 265], ['D', 145, 44, 330]];
const ROCKETS = [65, 73, 81, 89, 97, 105, 113, 121];
const CAP = id => (id === '1' || id === '2' ? 40 : id === 'C' || id === 'D' ? 47 : 65);   // British Inquiry: 65 / 40 / 47 kişilik   // yaklaşık sekiz fişek, 00.45–01.45

// monoton kübik ara değer (Fritsch–Carlson): saat hiçbir anda geri gitmez ve anahtarlarda durmaz
function mono(P) {
  const n = P.length, xs = P.map(p => p[0]), ys = P.map(p => p[1]), d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return x => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], u = (x - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}
// gemi saati: film zamanı → 23.40'tan beri dakika. Ses saattir: anahtarlar ölçülmüş kelimelere bağlı.
function makeClock(T) {
  const w = (id, k) => T.w(id, k), E = T.l08end;
  const K = [
    [0, 0], [T_HIT, 0.3], [T.l01end, 3],
    [T.l04, 25], [w('l04', 4), 35], [w('l04', 12), 45], [T.l04end, 52],
    [T.l05, 65], [T.l05end, 72], [T.l07, 82], [w('l07', 5), 100], [T.l07end, 124],
    [w('l08', 1), 145], [E, 150], [E + 0.3, 157.4], [E + 0.45, 158], [E + 0.6, 158.5], [E + 1.2, 159.4], [E + 1.8, 159.5], [E + 3.0, 160],
    [T.l09end, 176], [T.l10 + 0.1, 182], [T.l10 + 2.1, 259], [T.loop0, 266],
  ];
  const f = mono(K);
  const fwd = t => f(Math.min(t, T.loop0));
  // döngü: saat T.loop0 → CUT arasında 23.40'a geri sarar; sahne CUT'a kadar son hâlinde durur, sonra ilk kareye kesilir
  const CUT = T.D - 0.45;
  const m = t => (t < T.loop0 ? fwd(t) : 266 * (1 - ease0(Math.min(1, (t - T.loop0) / (CUT - T.loop0)))));
  const mS = t => (t < T.loop0 ? fwd(t) : t < CUT ? 266 : -0.3 * (T.D - t) / (T.D - CUT));
  // ters: dakika → film zamanı (yalnız ileri bölümde; ikili arama)
  const tOf = mm => { let a = 0, b = T.loop0; for (let i = 0; i < 40; i++) { const c = (a + b) / 2; if (fwd(c) < mm) a = c; else b = c; } return (a + b) / 2; };
  return { m, mS, tOf, CUT };
}
const ease0 = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);   // durum değişimine yakın, kapalı formül

const base = o => ({ head: { w: 0.9, h: 1, ear: 0.12 }, neck: 0.07, eyes: { gap: 0.33, w: 0.18, h: 0.21, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
// Jack Phillips: 25 yaşında baş telsizci; koyu lacivert ceket, beyaz yaka, kulaklık (sahnede çizilir)
const PHILLIPS = base({
  key: 'phillips', name: 'Jack Phillips', seed: 801,
  torso: { len: 0.84, shoulder: 0.68, hip: 0.58, depth: 0.44, belly: 0, color: '#2C3A52', shade: '#223047' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#2C3A52', shade: '#223047', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#23262C', shade: '#1A1C21' },
  shoe: { color: '#151515', len: 0.28, h: 0.11 },
  skin: '#EBC4A0', skinShade: '#D3A880', hair: '#3A2A1E',
  features: ['jacket', 'hairSlick'],
});
// Cyril Evans: Californian'ın tek telsizcisi; ranzada uyur
const EVANS = base({
  key: 'evans', name: 'Cyril Evans', seed: 802,
  torso: { len: 0.82, shoulder: 0.64, hip: 0.56, depth: 0.42, belly: 0, color: '#D9D2C2', shade: '#C2BAA8' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#D9D2C2', shade: '#C2BAA8', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#D9D2C2', shade: '#C2BAA8' },
  shoe: { color: '#151515', len: 0.28, h: 0.11 },
  skin: '#EBC4A0', skinShade: '#D3A880', hair: '#6A4A30',
  features: ['hairMessy'],
});
// ciddi yüzler: ağız eğrisi ≤ 0 (gülümseme yok)
const WORRY = { brow: 0.05, browTilt: -0.4, eye: 1.05, pupil: 0.85, curve: -0.22, open: 0, w: 0.85 };
const SLEEP = { brow: 0, browTilt: 0, eye: 1, pupil: 1, curve: -0.02, open: 0, w: 0.8 };

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, ch, LW, INK } = A;
  const w = (id, k) => T.w(id, k), E = T.l08end;
  const clk = makeClock(T), Mof = clk.m;
  const WL = 1150, SHX = 540, PIV = -120;   // su hattı (dünya), gemi ortası, eğilme ekseni, ufuk (ekran)
  const SKY = '#1B2638', SEA = '#132030', SEA2 = '#22344A', HULL = '#23272C', WHITE = '#E9E4D6', FUN = '#D99A3A';
  const LIT = '#F6D98A', DARK = '#3A4250', PAPER = '#F4EFE3', RED = '#E0533F';
  const cyOf = (z, ws = 1235) => WL - (ws - 960) / z;   // ws: su hattının ekrandaki yüksekliği
  const calX = z => 540 - 400 * z;   // Californian ufukta, solda (kamera geri çekildikçe kadraja yerleşir)

  // ——— geminin hâli (dakikanın saf fonksiyonu) ———
  const angF = mono([[0, 0], [30, 0.8], [65, 2.2], [110, 4.2], [130, 5.6], [145, 8.5], [152, 11], [157, 15], [158.5, 17]]);
  const sinkF = mono([[0, 0], [65, 8], [125, 22], [145, 38], [157, 58], [158.5, 64]]);
  const RAD = Math.PI / 180, BREAK = 158.5, BX = -110;
  const pre = m => { const mm = Math.min(m, BREAK); return { a: angF(mm) * RAD, s: sinkF(mm) }; };
  const shipPt = (m, lx, ly) => { const { a, s } = pre(m), x = lx - PIV, c = Math.cos(a), sn = Math.sin(a); return [SHX + PIV + x * c - ly * sn, WL + s + x * sn + ly * c]; };
  const ANCH = shipPt(BREAK, BX, 0);
  const sternA = mono([[BREAK, 17], [159.4, 80], [159.5, 81], [160, 84]]), sternS = mono([[BREAK, 0], [159.4, 0], [159.5, 0], [160, 620]]);
  const bowA = mono([[BREAK, 17], [159.2, 42]]), bowS = mono([[BREAK, 0], [159.2, 420]]);
  const lightsOn = (m, t) => (m < 157.3 ? true : m < 158 ? Math.sin(t * 47) > 0.1 : false);

  // gemi, yerel koordinatlarda (x sağa = baş; y 0 = su hattı); [xa, xb] kırılma parçası
  const shipLocal = (lit, xa, xb) => {
    ctx.save(); ctx.beginPath(); ctx.rect(xa, -700, xb - xa, 900); ctx.clip();
    const L = lit ? LIT : DARK;
    line(392, -400, -318, -385, 2.5, '#9AA4AE');                     // telsiz anteni (direkler arası)
    line(380, -100, 392, -405, 6); line(-330, -92, -318, -390, 6);   // direkler
    for (const fx of [230, 95, -40, -175]) {
      poly([[fx - 24, -150], [fx - 40, -305], [fx + 8, -305], [fx + 24, -150]], FUN);
      poly([[fx - 37, -278], [fx - 40, -305], [fx + 8, -305], [fx + 11, -278]], INK, 0);
    }
    rect(-345, -152, 655, 58, WHITE); rect(282, -176, 46, 26, WHITE);   // üst yapı, köprü
    rect(150, -186, 46, 34, WHITE, 5);                                  // telsiz odası (Marconi)
    poly([[-452, -96], [-468, -82], [-454, -30], [-432, 28], [-384, 62], [402, 62], [446, 12], [470, -110], [330, -106], [330, -96]], HULL);
    circ(-424, 38, 13, '#B07A3A', 4); line(-446, 20, -452, 58, 7);      // pervane, dümen
    for (let x = -418; x < 432; x += 17) circ(x, -46, 3.6, L, 0);
    for (let x = -400; x < 330; x += 17) circ(x, -70, 3.6, L, 0);
    for (let x = -330; x < 300; x += 22) rect(x, -134, 10, 13, L, 0);
    rect(156, -178, 16, 14, L, 0); rect(174, -178, 16, 14, L, 0);
    ctx.restore();
  };
  // filika: (x, y) su hattında orta nokta, k ölçek, n kişi (baş), a açı, row: kürek fazı
  const boat = (x, y, k, n, a = 0, row = null, seed = 1, cap = 0, ghost = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(k, k);
    const r = mulberry32(seed), lw = 3.2;
    if (ghost > 0) { ctx.globalAlpha = ghost; for (let i = n; i < cap; i++) { const hx = -15 + (i % 8) * 4.3, hy = -8 - Math.floor(i / 8) * 3.6; ctx.beginPath(); ctx.arc(hx, hy, 1.9, 0, 6.283); ctx.lineWidth = 1.1; ctx.strokeStyle = '#B9CADB'; ctx.stroke(); } ctx.globalAlpha = 1; }
    if (row != null) { const s = Math.sin(row) * 7; line(-12, -4, -26 + s, 9, 2.4, '#C9B48A'); line(10, -4, 24 + s, 9, 2.4, '#C9B48A'); }
    for (let i = 0; i < n; i++) { const hx = -15 + (i % 8) * 4.3 + (r() - 0.5), hy = -8 - Math.floor(i / 8) * 3.6; circ(hx, hy, 2.3, i % 3 ? '#3A3F4A' : '#6B5040', 0); }
    poly([[-22, -6], [22, -6], [16, 5], [-16, 5]], PAPER, lw);
    ctx.restore();
  };
  const berg = (x, y, k) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    poly([[-110, 30], [-92, -40], [-58, -96], [-30, -120], [-6, -150], [22, -118], [56, -88], [80, -40], [104, 30]], '#DCE7EC');
    poly([[-6, -150], [22, -118], [56, -88], [80, -40], [104, 30], [30, 30], [12, -40]], '#B9CCD6', 0);
    line(-6, -150, 12, -40, 4); line(12, -40, 30, 30, 4);
    ctx.restore();
  };
  // uzak gemiler (ekran uzayı): Californian (tek baca, sarı-siyah) ve Carpathia (Cunard kırmızı baca)
  const farShip = (x, y, k, funnel, lit, dir = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k * dir, k);
    line(-60, -30, -56, -110, 5); line(54, -30, 58, -104, 5);
    poly([[-14, -40], [-18, -96], [10, -96], [14, -40]], funnel); rect(-18, -96, 28, 14, INK, 0);
    rect(-50, -48, 90, 18, WHITE, 4);
    poly([[-96, -30], [-100, -14], [-86, 10], [86, 10], [104, -34], [40, -32], [40, -30]], HULL, 4);
    for (let i = -80; i < 80; i += 14) circ(i, -12, 3, lit, 0);
    circ(57, -108, 5, '#FFF4C8', 0);
    ctx.restore();
  };

  // tohumlu yıldızlar ve deniz çizgileri (D'ye göre periyodik: döngü dikişi tutar)
  const STARS = (() => { const r = mulberry32(8080); return Array.from({ length: 150 }, () => [r() * 1080, 260 + r() * 760, 1 + r() * 2.2, r() * 6.28, 1 + Math.floor(r() * 3)]); })();
  const WAVES = (() => { const r = mulberry32(8081); return Array.from({ length: 46 }, () => [r() * 1600 - 260, r(), 30 + r() * 70]); })();
  let M = null;   // bu karenin dünya → ekran dönüşümü (üst katman için)
  const toS = ([x, y]) => [M.a * x + M.e, M.d * y + M.f];

  function draw(t) {
    const m = clk.mS(t), fwd = t < T.loop0;
    M0 = ctx.getTransform();
    const z = M0.a, wlS = M0.d * WL + M0.f, HS = wlS - 143;   // P öncesi ekran değerleri
    P = extraP(t, m, M0, wlS, HS);
    ctx.setTransform(P.k * M0.a, 0, 0, P.k * M0.d, P.k * M0.e + P.ox, P.k * M0.f + P.oy); M = ctx.getTransform();
    // ——— uzak katman (ekran uzayı) ———
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = SKY; ctx.fillRect(0, 0, 1080, 1920);
    ctx.setTransform(P.k, 0, 0, P.k, P.ox, P.oy);
    for (const [x, y, r, ph, k] of STARS) { const tw = 0.55 + 0.45 * Math.sin(2 * Math.PI * k * t / D * 6 + ph); ctx.globalAlpha = tw; circ(x, y, r, '#F3EED8', 0); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = SEA; ctx.fillRect(-3000, HS, 7000, 4000); line(-3000, HS, 4000, HS, 3, '#33465E');
    // Californian: ufukta, solda; kamera geri çekildikçe kadraja yerleşir (ışığı kare 0'dan sol kenarda görünür)
    farShip(calX(z), HS + 2, 0.5, '#C9A23A', '#E9D49A');
    // Carpathia: sağda, mesafeye göre yaklaşır (107 km → 0)
    ctx.restore();

    // ——— yakın katman (dünya uzayı) ———
    // iskele filikaları: geminin arkasından uzaklaşır (ufka doğru, küçülür)
    for (const [id, L0, n, bx] of PORT) {
      const dm = m - L0 - 5; if (dm <= 0) continue;
      const [x0, y0] = shipPt(L0 + 5, bx, -4), r = mulberry32(id.charCodeAt(0) * 7 + bx);
      const dy = Math.min(70, 2.2 * dm), sx = (r() - 0.5) * Math.min(260, 3 * dm);
      boat(x0 + sx, Math.min(y0, WL) - dy, 1.05 - dy / 180, Math.round(n / 4), 0, t * 2.2 + bx, bx, Math.round(CAP(id) / 4), ghostAt(t, 9 + PORT.findIndex(b => b[0] === id)));
    }
    // gemi
    const lit = lightsOn(m, t);
    if (m < BREAK) {
      const { a, s } = pre(m), shake = fwd && t > T_HIT ? Math.exp(-(t - T_HIT) * 5) : 0;
      ctx.save(); ctx.translate(SHX + PIV, WL + s + shake * 4 * Math.sin(t * 60)); ctx.rotate(a); ctx.translate(-PIV, 0);
      shipLocal(lit, -500, 500);
      for (const [id, L0, , bx] of STAR) { if (m < L0) boat(bx, -160, 1.1, 0, 0, null, bx); }   // güvertedeki filikalar
      ctx.restore();
    } else if (m < 160.2) {
      ctx.save(); ctx.translate(ANCH[0], ANCH[1] + bowS(m)); ctx.rotate(bowA(m) * RAD); ctx.translate(-BX, 0); shipLocal(false, BX, 500); ctx.restore();
      ctx.save(); ctx.translate(ANCH[0], lerp(ANCH[1], WL + 18, clamp01((m - BREAK) / 0.5)) + sternS(m)); ctx.rotate(sternA(m) * RAD); ctx.translate(-BX, 0); shipLocal(false, -500, BX); ctx.restore();
    }
    // sancak filikaları: güverteden iner (6 dk), sonra izleyiciye doğru açılır
    for (const [id, L0, n, bx] of STAR) {
      if (m < L0) continue;
      const p = clamp01((m - L0) / 6), nn = Math.round(n / 4);
      if (p < 1 && m < BREAK) { const [x, y] = shipPt(m, bx, lerp(-160, -4, p)); boat(x, y, 1.1, nn, pre(m).a, null, bx); }
    }
    // buzdağı: kare 0'da sağdan gelir, 23.40'ta baş tarafa sürtünür, geride kalıp uzaklaşır
    {
      const bxF = mono([[-0.3, 1300], [0, 1208], [0.3, 1118], [1.2, 760], [3, 420], [30, 170]]), byF = mono([[-0.3, 0], [3, 0], [30, -110]]);
      const bk = mono([[-0.3, 1.35], [3, 1.35], [30, 0.5]])(Math.min(m, 30));
      if (m < 40) berg(bxF(Math.min(m, 30)), WL + 26 + byF(Math.min(m, 30)), bk);
    }
    // fişekler: köprüden yükselir, beyaz yıldızlara açılır (ileri bölümde, gerçek saatlerinde)
    if (fwd) for (const r0 of ROCKETS) {
      const tr = clk.tOf(r0), u1 = (t - tr) / 0.45; if (u1 < 0 || t - tr > 1.6) continue;
      const [x0, y0] = shipPt(r0, 300, -180), top = y0 - 430;
      if (u1 < 1) { const y = lerp(y0, top, ease.enter(u1)); line(x0, y + 30, x0, y, 4, '#F6EFD8'); }
      else { const v = (t - tr - 0.45) / 1.15; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + r0, rr = 70 * ease.enter(Math.min(1, v * 1.6)); ctx.globalAlpha = 1 - v; circ(x0 + Math.cos(a) * rr, top + Math.sin(a) * rr + v * v * 60, 5, '#FFFFFF', 0); } ctx.globalAlpha = 1; }
    }
    // su (önde): batan kısımları örter; yavaş deniz çizgileri; gemi yürürken baş dalgası
    rect(-2000, WL, 6000, 2400, SEA, 0);
    const travel = Math.min(m, 1) * 900;
    for (const [x0, ph, len] of WAVES) {
      const y = WL + 30 + ph * 900, x = ((x0 - travel + 40 * Math.sin(2 * Math.PI * (t / D) * 2 + ph * 6)) % 1700 + 1700) % 1700 - 300;
      line(x, y, x + len * (1 + ph), y, 4, SEA2);
    }
    line(-2000, WL, 4000, WL, 3, '#2C4058');
    ctx.wordSpacing = '22px';
    if (m < 0.4) { const [bx0, by0] = shipPt(m, 462, 0); poly([[bx0 - 40, by0 - 4], [bx0 + 10, by0 - 22], [bx0 + 34, by0 - 2]], PAPER, 3); }
    if (m >= 159.6 && m < 262) { const k = clamp01((m - 159.6) / 3); ctx.globalAlpha = 1 - clamp01((m - 200) / 40); ell(ANCH[0] - 60, WL + 6, 160 * k + 10, 14 * k + 2, null, 3); ctx.strokeStyle = '#8FA6BC'; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1; }
    // Carpathia (ekran uzayı, suyun önünde): ufuktan filikaların yanına gelir
    { const d = carpKm(m), u = 1 - d / 107;
      if ((fwd && t >= w('l04', 11) - 0.3) || u > 0.12) { const [cx2, cy2, ck] = carpPos(m, wlS, HS); const dir = lerp(1, -1, ease.state(seg(t, w('l04', 15), 0.6))); ctx.save(); ctx.setTransform(P.k, 0, 0, P.k, P.ox, P.oy); farShip(cx2, cy2, ck, '#C2412F', LIT, fwd ? dir : -1); ctx.restore(); } }
    // sudan sonra (önde): sancak filikaları yeniden çizilmez; onlar suyun üstünde değil, su çizildikten sonra çizilmeli
    for (const [id, L0, n, bx] of STAR) {
      if (m < L0 + 6) continue;
      const [x0, y0] = shipPt(L0 + 6, bx, -4), dm = m - L0 - 6, r = mulberry32(id.charCodeAt(0) * 13 + bx);
      const dy = Math.min(130, 2.6 * dm), sx = (r() - 0.5) * Math.min(480, 5 * dm) - 0.3 * dy;
      const pull = clamp01((m - 256) / 12) * 140;
      const kb = 1.1 + dy / 130 * 0.9, yMax = (1225 - M.f) / M.d - 8 * kb;   // altyazı bandına girmez
      boat(x0 + sx + pull, Math.min(yMax, Math.max(WL, y0) + dy - pull * 0.15), kb, Math.round(n / 4), 0, t * 2.4 + bx, bx, Math.round(CAP(id) / 4), ghostAt(t, STAR.findIndex(b => b[0] === id)));
    }
  }
  const carpKm = m => (m < 50 ? 107 : Math.max(0, 107 * (1 - (m - 50) / 205)));
  const carpPos = (m, wlS, HS, pin = true) => { const u = 1 - carpKm(m) / 107, q = Math.pow(u, 3), xf = pin ? (960 - P.ox) / P.k : 1010; return [lerp(xf, 820, Math.pow(u, 0.8)), lerp(HS + 2, wlS + 60, q), lerp(0.45, 1.4, q)]; };
  // kritik sönümlü yay (sertlik 170, sönüm 26 → ω = √170): basamak tepkisi; 0,6–0,7 sn'de oturur
  const W0 = Math.sqrt(170), step = u => (u <= 0 ? 0 : 1 - (1 + W0 * u) * Math.exp(-W0 * u));
  const tA = T.w('l04', 7) - 0.05, tB = T.l04end + 0.15;              // "107 kilometre": kamera 0,75x açılır, Carpathia ve mesafe çizgisi
  const tF = T.l10 + 1.4, tG = T.w('l10', 15) - 0.35;                 // varış: kamera Carpathia'ya 1,1x
  const tC = T.w('l10', 15) - 0.04;                                    // "ölüyor": ~470 kartı, boş oturaklar soluklaşır
  const ghostAt = (t, j) => (t < T.loop0 || t < clk.CUT ? clamp01((t - tC - j * 0.045) / 0.25) : 0);
  let M0 = null, P = { k: 1, ox: 0, oy: 0 };
  const Pt = (x, y) => [P.k * x + P.ox, P.k * y + P.oy];
  function extraP(t, m, M0, wlS, HS) {
    let k = 1, ox = 0, oy = 0;
    const S = (sc, ax, ay) => { k *= sc; ox = sc * ox + ax * (1 - sc); oy = sc * oy + ay * (1 - sc); };
    if (t < T.loop0) {
      if (t > T_HIT && t < T_HIT + 0.8) { const u = t - T_HIT; S(1 + 0.15 * W0 * Math.E * u * Math.exp(-W0 * u), M0.a * 1010 + M0.e, M0.d * 1100 + M0.f); }   // çarpma 1,15x
      const ph = step(t - (T.l04 - 0.05)) - step(t - (tA - 0.6)); if (ph > 1e-4) { const [rx, ry] = shipPt(m, 173, -186); S(1 + 0.15 * ph, M0.a * rx + M0.e, M0.d * ry + M0.f); }
      const r = step(t - tA) - step(t - tB); if (r > 1e-4) { S(1 - 0.25 * r, 540, 1000); ox -= 260 * r; }
      const fo = step(t - tF) - step(t - tG); if (fo > 1e-4) { const [cx2, cy2] = carpPos(m, wlS, HS, false); S(1 + 0.1 * fo, cx2, cy2 - 40); }
    }
    return { k, ox, oy };
  }

  // ——— üst katman (ekran uzayı): telsiz halkaları, kesit pencereleri, saat, göstergeler ———
  const tR0 = w('l04', 4), tR1 = clk.tOf(157.6);
  const MORSE = (() => { const on = []; let u = 0; for (const ch of ['-.-.', '--.-', '-..']) { for (const e of ch) { const d = e === '-' ? 3 : 1; on.push([u, u + d]); u += d + 1; } u += 2; } return { on, len: u + 4 }; })();
  const morseOn = dt => { const x = (dt / 0.075) % MORSE.len; return MORSE.on.some(([a, b]) => x >= a && x < b) ? 1 : 0; };
  const font = (s, wgt = 600, f = 'IBM Plex Mono') => { ctx.font = `${wgt} ${s}px ${f}`; };
  const HUD_OUT = T.w('l10', 13);   // göstergeler, ölüm cümlesinin sayısı gelmeden çekilir (sayı onların yerine oturur)
  const pop = (t, a, b) => ease.enter(seg(t, a, 0.35)) * (1 - ease.exit(seg(t, b, 0.25)));
  function overlay(t, c, O) {
    const m = clk.mS(t), mc = Mof(t), fwd = t < T.loop0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // telsiz halkaları: telsiz odasından (CQD/SOS), ışıklar sönene kadar
    if (fwd && t > tR0 && t < tR1 + 1.4) {
      const [rx, ry] = toS(shipPt(m, 173, -186));
      for (let i = 0; ; i++) {
        const tb = tR0 + i * 0.85; if (tb > t || tb > tR1) break;
        const r = (t - tb) * 650; if (r > 1250) continue;
        ctx.globalAlpha = 0.6 * (1 - r / 1250); ctx.beginPath(); ctx.arc(rx, ry, r, 0, 6.283); ctx.lineWidth = 5; ctx.strokeStyle = '#BFE0F2'; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // 107 km çizgisi: ufukta Titanik'ten Carpathia'ya, açılış süresince
    { const g = fwd ? ease.enter(seg(t, tA + 0.15, 0.5)) * (1 - ease.exit(seg(t, tB - 0.1, 0.25))) : 0;
      if (g > 0.01) {
        const wl0 = M0.d * WL + M0.f, hs0 = wl0 - 143, [cx2] = carpPos(m, wl0, hs0);
        const [x0, y0] = Pt(M0.a * 990 + M0.e, hs0 + 24), [x1] = Pt(cx2, 0), xe = lerp(x0, x1, g);
        line(x0, y0, xe, y0, 5, PAPER); line(x0, y0 - 14, x0, y0 + 14, 5, PAPER); if (g > 0.98) line(x1, y0 - 14, x1, y0 + 14, 5, PAPER);
        ctx.globalAlpha = clamp01((g - 0.6) / 0.4); font(48, 700); ctx.textAlign = 'center'; ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
        const lx = (x0 + x1) / 2; ctx.wordSpacing = '0px'; ctx.strokeText('107 km', lx, y0 + 62); ctx.fillStyle = PAPER; ctx.fillText('107 km', lx, y0 + 62); ctx.wordSpacing = '22px'; ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      } }
    // Phillips kesiti: telsiz odasından açılan yuvarlak pencere
    { const k = fwd ? pop(t, T.l04 - 0.05, T.l05 - 0.25) : 0;
      if (k > 0.01) {
        const [rx, ry] = toS(shipPt(m, 173, -186)), cx = 360, cy = 640, R = 125 * k;
        line(rx, ry, cx + (rx - cx) * R / Math.hypot(rx - cx, ry - cy), cy + (ry - cy) * R / Math.hypot(rx - cx, ry - cy), 5, PAPER);
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fillStyle = '#D8CCB0'; ctx.fill(); ctx.clip();
        ctx.translate(cx, cy); ctx.scale(k, k);
        rect(-150, -150, 300, 70, '#B9AC8E', 0); rect(30, -110, 70, 46, '#5A4A38', 4);            // duvar rafı, telsiz cihazı
        const tap = t > tR0 ? morseOn(t - tR0) : 0;
        const sk = ch(PHILLIPS, { x: -20, y: 150, s: 92, expr: WORRY, head: { look: [0.35, 0.25], tilt: 4 }, armR: { sh: 12, el: 40 + 10 * tap }, armL: { sh: 10, el: 34 } }, t);
        const hx = -20 + sk.head[0] * 92, hy = 150 + sk.head[1] * 92;                              // kulaklık
        ctx.beginPath(); ctx.arc(hx, hy - 6, 50, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
        rect(hx - 56, hy - 14, 16, 30, '#3A3F4A', 4, 5); rect(hx + 40, hy - 14, 16, 30, '#3A3F4A', 4, 5);
        rect(-150, 40, 300, 120, '#7A5638', 5); rect(20, 20, 50, 20, '#2E2A26', 4); rect(32, 12 - 6 * tap, 22, 10, '#9A9AA0', 3);   // masa, telgraf anahtarı
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      } }
    // Evans kesiti: Californian'ın telsiz odası, ranzada uyuyan telsizci
    { const k = fwd ? pop(t, w('l09', 6) - 0.12, T.l09end + 0.3) : 0;
      if (k > 0.01) {
        const [px, py] = Pt(calX(M0.a) + 20, M0.d * WL + M0.f - 143 - 50), cx = 340, cy = 760, R = 120 * k;
        const dl = Math.hypot(px - cx, py - cy);
        line(px, py, cx + (px - cx) * R / dl, cy + (py - cy) * R / dl, 5, PAPER);
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fillStyle = '#2E3646'; ctx.fill(); ctx.clip();
        ctx.translate(cx, cy); ctx.scale(k, k);
        rect(40, -100, 70, 50, '#4A4038', 4); circ(60, -75, 6, '#55606E', 0);                  // kapalı telsiz (ışığı yok)
        rect(-130, 20, 260, 40, '#6A5040', 5);                                                  // ranza
        ell(-82, 6, 34, 16, PAPER, 4);                                                          // yastık
        ctx.save(); ctx.translate(72, 4); ctx.rotate(-Math.PI / 2);
        ch(EVANS, { x: 0, y: 0, s: 58, expr: SLEEP, blink: 1, head: { look: [0, 0], tilt: 0 } }, t);
        ctx.restore();
        const br = 1 + 0.03 * Math.sin(2 * Math.PI * t / 2.2);                                  // nefes: battaniye inip kalkar
        poly([[-50, 20], [-44, -18 * br], [120, -16 * br], [126, 20]], '#7A8FA6', 5);
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      } }
    ctx.wordSpacing = '34px'; O.title(t, ['Yakındaki gemi', 'neden gelmedi?'], T.l02end + 0.15, 560, clk.CUT, null); ctx.wordSpacing = '22px';
    const cap = (s1, a, b, col) => {
      if (!(fwd && t >= a && t < b)) return;
      const u = ease.enter(seg(t, a, 0.2)); ctx.save(); ctx.fontStretch = 'semi-condensed'; ctx.textAlign = 'center'; ctx.globalAlpha = Math.min(1, u * 1.6);
      let size = 76, lines = [s1]; const setF = () => { ctx.font = '800 ' + size + 'px Archivo'; }; setF();
      const wide = () => Math.max(...lines.map(l => ctx.measureText(l).width + size * 0.2)) > 830;   // kontür payı dâhil
      while (wide() && size > 64) { size -= 2; setF(); }
      if (wide()) { const ws = s1.split(' '), h = Math.ceil(ws.length / 2); lines = [ws.slice(0, h).join(' '), ws.slice(h).join(' ')]; size = 76; setF(); while (wide() && size > 56) { size -= 2; setF(); } }
      ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.lineWidth = Math.max(8, size * 0.2); ctx.strokeStyle = '#FBF7EE'; ctx.fillStyle = col;
      lines.forEach((ln, i) => { const y = 1400 - (lines.length - 1 - i) * size * 1.17 + (1 - u) * 26; ctx.strokeText(ln, 505, y); ctx.fillText(ln, 505, y); });
      ctx.restore();
    };
    cap('Titanik batarken', w('l01', 0) - 0.04, w('l01', 2) - 0.04, INK);
    cap('yakınında bir gemi vardı.', w('l01', 2) - 0.04, T.l02 - 0.04, INK);
    cap('Gelmedi.', T.l02 - 0.04, T.l03 - 0.04, '#C2412F');
    // ilk filika: kişi / yer
    O.bigNumber(t, w('l05', 0) + 0.3, T.l05end + 0.35, '27 / 65', 'İLK FİLİKA · KİŞİ / YER', 640, 150);
    O.bigNumber(t, w('l10', 15) - 0.04, T.l11 + 1.9, '~470', 'FİLİKALARDA BOŞ KALAN YER', 560, 150);   // 1.178 yer − 706/712 kurtulan

    // saat (sağ üst, güvenli alan içinde): gemi saati
    const tot = 23 * 60 + 40 + Math.floor(Math.max(0, mc) + 1e-6), hh = Math.floor(tot / 60) % 24, mi = tot % 60;
    const s = String(hh).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
    font(104, 600); ctx.textAlign = 'right';
    ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.strokeText(s, 910, 372); ctx.fillStyle = PAPER; ctx.fillText(s, 910, 372);
    const dA = clamp01(seg(t, T.l02end + 0.35, 0.3)) * (1 - clamp01(seg(t, D - 0.6, 0.2)));
    if (dA > 0) { ctx.globalAlpha = dA; font(32, 600); ctx.fillStyle = '#B9C4D2'; ctx.fillText((tot >= 24 * 60 ? '15' : '14') + ' NİSAN 1912', 910, 420); ctx.globalAlpha = 1; }
    ctx.textAlign = 'left';
    // Carpathia göstergesi (sol üst): adı geçince açılır; "rotasını çeviriyor"da simge döner
    { const k = fwd ? pop(t, w('l04', 11) - 0.05, HUD_OUT) : 0;
      if (k > 0.01) {
        ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * -40, 0);
        font(44, 600); ctx.fillStyle = '#C9D2DE'; ctx.fillText('CARPATHIA', 100, 340);
        const dk = carpKm(m); font(70, 800, 'Archivo'); ctx.lineWidth = 10; ctx.strokeStyle = INK; const ds = Math.round(dk) + ' km';
        ctx.strokeText(ds, 100, 414); ctx.fillStyle = PAPER; ctx.fillText(ds, 100, 414);
        const turn = ease.state(seg(t, w('l04', 15), 0.7)), ax = 100 + ctx.measureText(ds).width + 56, ay = 390;
        if (dk < 0.5) ctx.restore(); else {   // rota oku: önce doğuya (gemiden uzağa), sonra Titanik'e
        ctx.translate(ax, ay); ctx.rotate(Math.PI * turn); poly([[-26, -10], [10, -10], [10, -20], [30, 0], [10, 20], [10, 10], [-26, 10]], '#C2412F', 4);
        ctx.restore(); }
      } }
    // Californian göstergesi: "Var." ile açılır; "kapalı"da telsiz kapalı yazar
    { const k = fwd ? pop(t, T.l07, HUD_OUT) : 0;
      if (k > 0.01) {
        ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * -40, 0);
        font(44, 600); ctx.fillStyle = '#C9D2DE'; ctx.fillText('CALIFORNIAN', 100, 492);
        const dist = t >= w('l09', 1) - 0.04 ? '< 40 km' : '? km';   // cevap batıştan sonra gelir
        font(70, 800, 'Archivo'); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.strokeText(dist, 100, 566); ctx.fillStyle = PAPER; ctx.fillText(dist, 100, 566);
        const off = ease.enter(seg(t, w('l09', 6) - 0.05, 0.3));
        if (off > 0) { ctx.globalAlpha = k * off; font(48, 700); ctx.fillStyle = RED; ctx.fillText('TELSİZ KAPALI', 100, 628); }
        ctx.restore();
      } }
    // Californian'ın üstünde kapalı telsiz işareti (halkalar ulaşır ama karşılık yok)
    { const off = fwd ? ease.enter(seg(t, w('l09', 6) - 0.05, 0.3)) * (1 - ease.exit(seg(t, T.loop0 - 0.4, 0.25))) : 0;
      if (off > 0) { const [xc, y] = Pt(calX(M0.a) + 20, M0.d * WL + M0.f - 143 - 95); ctx.globalAlpha = off; circ(xc, y, 22, '#2E3646', 4); line(xc - 12, y - 12, xc + 12, y + 12, 6, RED); line(xc + 12, y - 12, xc - 12, y + 12, 6, RED); ctx.globalAlpha = 1; } }
  }

  // altyazı parçaları: [ekrandaki metin, okunan metindeki ilk kelime sırası]
  const CH = {
    l01: [[' ', 0]],
    l02: [[' ', 0]],
    l03: [['Yardım çağıramıyorlar mı?', 0]],
    l04: [['Telsizci Jack Phillips durmadan', 0], ['imdat çağrısı yolluyor.', 4], ['107 kilometre ötedeki Carpathia', 7], ['çağrıyı duyuyor ve rotasını çeviriyor.', 12]],
    l05: [['İlk filika 65 kişilik ama', 0], ['içinde 30 kişi bile yok.', 6]],
    l06: [['Peki yakındaki o gemi?', 0]],
    l07: [['Californian ufukta duruyor', 0], ['ve sekiz fişek görüyor.', 3], ['Ama yerinden kıpırdamıyor.', 7]],
    l08: [['Son filika saat ikiyi beş geçe iniyor.', 0]],
    l09: [['Californian kırk kilometre', 0], ['bile uzakta değildi.', 3], ['Telsizcisi uyuyordu.', 6]],
    l10: [['Carpathia ancak sabah dörtte geliyor.', 0], ['Yedi yüzden fazla kişi kurtuluyor,', 5], ['yaklaşık 1.500 kişi ölüyor.', 10]],
    l11: [['Bunu Titanik’i yalnızca filmden', 0], ['bilen birine gönder.', 4]],
  };
  // ——— kamera: [t, zoom, x, y]; tek sürekli geri çekiliş, döngüde başa döner ———
  const K = (t, z, x, ws) => [t, z, x, cyOf(z, ws)];
  const C0 = K(0, 1.2, 840, 1120), CE = K(T.loop0, 1.1, 600, 970);
  const cam = [C0, K(T.l01end, 1.14, 760, 1115), K(T.l04, 1.08, 660, 1110), K(T.l05, 1.04, 600, 1105), K(T.l07, 0.98, 520, 1100), K(T.l08, 0.98, 500, 1100), K(E + 0.3, 1.0, 470, 1090), K(E + 3.0, 1.2, 420, 1100), K(T.l09 + 1, 1.04, 520, 1020), K(T.l10, 1.08, 560, 980), CE, [clk.CUT - 0.001, ...CE.slice(1)], [clk.CUT, ...C0.slice(1)], [D, ...C0.slice(1)]];

  return {
    cam,
    title: [' '], titleOut: 0, kicker: ' ',
    chunks: CH,
    open: true, capSize: 76, capBase: 1400,
    draw,
    overlay,
  };
}

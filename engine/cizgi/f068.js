// № 068 · Bir ömür kaç hafta (çizgi motoru, "Senin sayın" serisi, sakin iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Görsel fikir: bütün ömür tek sayfa; 64 × 64 = 4.096 kutu, her kutu bir hafta. Kahraman "sen" kartı (her filmde aynı).
// Doruk: boş sayfanın 1.565 kutusu (30 yıl) satır satır dolar. Kapanış: kâğıt uçak "bunu ona gönder".
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
const N = 64, FILLED = 1565;
export function hero(T) { return T.w('l05', 7) + 0.2; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [T.l04 - 0.25, T.l04], [T.l05 - 0.25, T.l05], [T.l07 - 0.25, T.l07], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 9), w('l03', 12), w('l03', 15), w('l07', 6)],
    thock: [w('l03', 11)],
    scratch: [[w('l05', 0), hero(T), 0.03], [T.l06, T.l06end, 0.02]],
    riser: [T.l04, w('l05', 0) - 0.05],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const ARKADAS = {
  key: 'arkadas', name: 'Arkadaş', seed: 681,
  head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.4, 5.0] },
  torso: { len: 0.78, shoulder: 0.62, hip: 0.6, depth: 0.42, belly: 0, color: '#5E9A4E', shade: '#4C8240' },
  arm: { upper: 0.38, lower: 0.36, w: 0.18, color: '#5E9A4E', shade: '#4C8240', hand: 0.13 },
  leg: { upper: 0.39, lower: 0.37, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#8A3A2A', len: 0.27, h: 0.11 },
  skin: '#C9946A', skinShade: '#AD7C55', hair: '#1E1814',
  features: ['jacket', 'bun'],
};

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, poly, rect, circ, line, text, bg, ch, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, INKF = '#2B2F33', EMPTY = '#FBF8F1';

  // ömür sayfası: sol üst (x, y), kutu b px; dolu kutu sayısı n (kesirli: son kutu yarı dolar); cur: bu haftanın kutusu
  const page = (x, y, b, n, cur = -1, curFill = 0, labels = 0) => {
    const S = N * b;
    rect(x - b * 1.6, y - b * 1.6, S + b * 3.2, S + b * 3.2, '#FFFFFF', LW, 6);
    ctx.fillStyle = EMPTY; ctx.fillRect(x, y, S, S);
    ctx.fillStyle = INKF;
    const full = Math.floor(n), rows = Math.floor(full / N);
    if (rows) ctx.fillRect(x, y, S, rows * b);
    if (full % N) ctx.fillRect(x, y + rows * b, (full % N) * b, b);
    if (n > full && full < N * N) { ctx.fillStyle = '#6B6E70'; ctx.fillRect(x + (full % N) * b, y + Math.floor(full / N) * b, b * (n - full), b); }
    // ızgara: ince çizgiler (dolu bölgede açık renk)
    ctx.lineWidth = Math.max(0.6, b * 0.09);
    ctx.strokeStyle = 'rgba(31,36,33,0.28)'; ctx.beginPath();
    for (let i = 0; i <= N; i++) { ctx.moveTo(x + i * b, y); ctx.lineTo(x + i * b, y + S); ctx.moveTo(x, y + i * b); ctx.lineTo(x + S, y + i * b); }
    ctx.stroke();
    if (cur >= 0) {
      const cx = x + (cur % N) * b, cy = y + Math.floor(cur / N) * b;
      ctx.fillStyle = RED; ctx.fillRect(cx, cy, b, b * Math.max(0.12, curFill));
      ctx.lineWidth = Math.max(1.2, b * 0.16); ctx.strokeStyle = RED; ctx.strokeRect(cx, cy, b, b);
    }
    if (labels > 0) {   // kenarlarda 64'er sayım: üstte sütun, solda satır
      const k = Math.floor(labels * N);
      ctx.fillStyle = RED;
      for (let i = 0; i < k; i++) { ctx.fillRect(x + i * b + b * 0.3, y - b * 1.25, b * 0.4, b * 0.7); ctx.fillRect(x - b * 1.25, y + i * b + b * 0.3, b * 0.7, b * 0.4); }
      if (labels >= 1) { text('64', x + S / 2, y - b * 2.6, b * 3.2, RED); ctx.save(); ctx.translate(x - b * 3.2, y + S / 2); ctx.rotate(-Math.PI / 2); text('64', 0, b * 1.1, b * 3.2, RED); ctx.restore(); }
    }
  };
  const room = (wall = '#EFE6D6', floor = '#D8C9AE', GY = 1250) => { bg(wall); rect(-600, GY, 2300, 1400, floor, 0); line(-600, GY, 1700, GY, LW); };
  const cake = (x, y, k = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    rect(-150, -110, 300, 110, '#F3D9C4', LW, 14); rect(-150, -110, 300, 32, '#F6F1E7', LW, 14);
    for (let i = 0; i < 5; i++) circ(-120 + i * 60, -78, 9, RED, 0);
    text('3', -40, -128, 92, RED); text('0', 40, -128, 92, RED);
    for (const fx of [-40, 40]) { line(fx, -212, fx, -232, 5); poly([[fx, -262], [fx - 10, -238], [fx, -228], [fx + 10, -238]], '#F2A23A', 3); }
    ctx.restore();
  };

  const PX = 110, PY = 700, PB = 8.6;   // kapak sayfası: 550 px; başlık kartının altında başlar
  const scenes = [];
  // 0 · kapak ve kanca: duvarda "senin" sayfan (30 yıl dolu), yanında sen; kutu bu hafta kırmızı
  scenes[0] = t => {
    t = loopT(t);
    room();
    page(PX, PY, PB, FILLED, FILLED, 0.5 + 0.5 * Math.sin(t * 3));
    const sas = t > T.l02 - 0.1 && t < T.l02end + 0.3;
    ch('sen', { x: 870, y: 1250, s: 118, facing: -1, expr: sas ? 'saskin' : 'notr', talk: talk(t, T.l02, T.l02end), armL: { sh: sas ? 40 : 95, el: sas ? 60 : 8 }, armR: { sh: sas ? 40 : 10, el: sas ? 60 : -4 }, head: { look: [-0.7, -0.3], tilt: sas ? -6 : 0 } }, t);
  };
  // 1 · ızgara sahnesi: tek kutu = bir hafta → 64 × 64 sayım; sonra 1.565 kutu satır satır dolar; bu haftanın kutusu
  const GX = 172, GY0 = 600, GB = 11.5;   // 736 px
  scenes[1] = t => {
    room('#F2ECDF', '#E2D6C0', 1500);
    const lab = seg(t, w('l03', 12) - 0.1, w('l03', 17) - w('l03', 12) + 0.4);
    const fillU = ease.state(seg(t, w('l05', 0) - 0.05, hero(T) - w('l05', 0) - 0.15));
    const n = t < w('l05', 0) ? 0 : FILLED * fillU;
    const curFill = t > T.l06 ? seg(t, T.l06 + 0.2, Math.max(0.5, T.l06end - T.l06)) : 0;
    // "her hafta bir kutu": önce tek büyük kutu, içinde yedi gün; "altmış dört"te bütün sayfaya kesilir
    if (t < w('l03', 8) - 0.12) {   // "yetmiş sekiz buçuk yıl": ömür çizgisi, sen 0'dan 78,5'e yürür
      const x0 = 110, x1 = 970, yl = 1120, u = seg(t, T.l03, w('l03', 8) - T.l03);
      line(x0, yl, x1, yl, LW * 1.3);
      for (let a = 0; a <= 70; a += 10) { const x = lerp(x0, x1, a / 78.5); line(x, yl - 18, x, yl + 18, 5); text(String(a), x, yl + 70, 40); }
      line(x1, yl - 30, x1, yl + 30, 8, RED); text('78,5', x1 - 10, yl + 70, 44, RED);
      ch('sen', { x: lerp(x0 + 20, x1 - 60, ease.state(u)), y: yl, s: 70, walk: (t * 1.6) % 1, facing: 1 }, t);
      return;
    }
    if (t < w('l03', 12) - 0.12) {
      const b = 420, x = 540 - b / 2, y = 980 - b / 2, d = Math.floor(7 * seg(t, w('l03', 8), 1.0) + 0.001);
      rect(x, y, b, b, '#FBF8F1', LW * 1.4, 4);
      for (let i = 0; i < 7; i++) { const dx = x + 26 + i * (b - 52) / 7; rect(dx + 6, y + b * 0.3, (b - 52) / 7 - 12, b * 0.4, i < d ? RED : '#EDE6D8', 4, 6); }
      if (t > w('l03', 8)) text('1 HAFTA', 540, y - 50, 72, RED);
      return;
    }
    page(GX, GY0, GB, n, n >= FILLED - 0.5 ? FILLED : -1, curFill, lab);
    // bu haftayı dolduran kalem: bu haftanın kutusunda tarar
    if (t > T.l06 - 0.3 && t < T.l07) {
      const cx = GX + (FILLED % N) * GB + GB / 2, cy = GY0 + Math.floor(FILLED / N) * GB + GB / 2, o = Math.sin(t * 22) * GB * 0.3;
      ctx.save(); ctx.translate(cx + o, cy - GB * 0.1); ctx.rotate(-0.6);
      rect(-GB * 0.18, -GB * 3.2, GB * 0.36, GB * 3, '#E2B13C', 2.5); poly([[-GB * 0.18, -GB * 0.2], [GB * 0.18, -GB * 0.2], [0, GB * 0.25]], '#F3D9C4', 2); ctx.restore();
    }
  };
  // 2 · otuz yaş pastası: sen pastanın arkasında, "kaçı gitti?"
  scenes[2] = t => {
    room('#EFE3D3', '#C9B08E', 1300);
    ch('sen', { x: 720, y: 1300, s: 175, expr: t < T.l04 + 0.9 ? 'mutlu' : 'saskin', talk: talk(t, T.l04, T.l04end), armL: { sh: 30, el: 70 }, armR: { sh: 30, el: 70 }, head: { look: [-0.5, 0.3] } }, t);
    rect(120, 1080, 820, 40, '#A87A4E', LW, 8); rect(160, 1120, 30, 180, '#8A6440', LW); rect(870, 1120, 30, 180, '#8A6440', LW);
    cake(370, 1080, 1.15);
  };
  // 3 · gönder: sen telefonundan kâğıt uçak yollar, arkadaş yakalar; aralarında içi kalpli bir kutu
  scenes[3] = t => {
    room('#F1E7D8', '#D9C7A9', 1230);
    const go = seg(t, w('l07', 6) - 0.1, 1.1), got = go >= 1;
    ch('sen', { x: 250, y: 1230, s: 150, facing: 1, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    ch(ARKADAS, { x: 840, y: 1230, s: 150, facing: -1, expr: got ? 'mutlu' : 'notr', armL: { sh: got ? 120 : 10, el: got ? 40 : -4 }, head: { look: [-0.6, 0] } }, t);
    // havada süzülen kutu: bu haftanın kutusu, içinde kalp
    const bx = 540, by = 640 + 10 * Math.sin(t * 2.2), bs = 150;
    rect(bx - bs / 2, by - bs / 2, bs, bs, '#FBF8F1', LW, 6);
    const hk = ease.enter(seg(t, w('l07', 3), 0.5));
    if (hk > 0) { ctx.save(); ctx.translate(bx, by + 6); ctx.scale(hk, hk); ctx.beginPath(); ctx.moveTo(0, 34); ctx.bezierCurveTo(-60, -6, -30, -48, 0, -20); ctx.bezierCurveTo(30, -48, 60, -6, 0, 34); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore(); }
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(330, 760, u), lerp(1000, 980, u) - Math.sin(u * Math.PI) * 260, 0.9, lerp(-0.6, 0.5, u)); }
    if (got) plane(780, 1010, 0.7, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const box0 = [GX + GB / 2, GY0 + GB / 2], cur = [GX + (FILLED % N) * GB + GB / 2, GY0 + Math.floor(FILLED / N) * GB + GB / 2];
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.12, 430, 930, 0)],
    ...cut(T.l02 - 0.1, P(1.12, 430, 930, 0), P(2.3, 880, 1040, 0)),
    [T.l02end + 0.1, ...P(2.45, 880, 1030, 0)],
    ...cut(T.l03 - 0.1, P(2.45, 880, 1030, 0), P(0.95, 540, 1000, 1)),
    [w('l03', 8) - 0.13, ...P(1.0, 560, 1000, 1)],
    ...cut(w('l03', 8) - 0.12, P(1.0, 560, 1000, 1), P(0.95, 540, 990, 1)),
    [w('l03', 12) - 0.13, ...P(1.08, 540, 1000, 1)],
    ...cut(w('l03', 12) - 0.12, P(1.08, 540, 1000, 1), P(0.95, 540, 980, 1)),
    [w('l03', 17) + 0.3, ...P(1.0, 540, 1000, 1)],
    ...cut(T.l04 - 0.1, P(1.0, 540, 1000, 1), P(1.05, 540, 1060, 2)),
    [T.l04end + 0.15, ...P(1.25, 540, 1040, 2)],
    ...cut(T.l05 - 0.1, P(1.25, 540, 1040, 2), P(1.15, 540, 860, 1)),
    [hero(T), ...P(1.05, 540, 920, 1)],
    [w('l05', 9), ...P(1.05, 540, 920, 1)],
    [T.l05end + 0.1, ...P(1.0, 540, 1060, 1)],
    ...cut(T.l06 - 0.1, P(1.0, 540, 1060, 1), P(7, cur[0], cur[1] + 6, 1)),
    [T.l06end + 0.15, ...P(9, cur[0], cur[1], 1)],
    ...cut(T.l07 - 0.1, P(9, cur[0], cur[1], 1), P(1.0, 540, 930, 3)),
    [T.l07end + 0.2, ...P(1.06, 540, 910, 3)],
    [T.loop0 - 0.001, ...P(1.06, 540, 910, 3)],
    [T.loop0, ...P(1.05, 520, 950, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Bir ömür', 'kaç hafta?'],
    kicker: 'SENİN SAYIN · ÖMÜR',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(3, i))](t); ctx.restore();
    },
    names: [],
    numbers: [
      [w('l03', 4) - 0.1, w('l03', 8) - 0.2, '78,5 yıl', 'TÜİK · ORTALAMA ÖMÜR'],
      [w('l05', 0) - 0.05, T.l05end + 0.2, t => Math.round(FILLED * ease.state(seg(t, w('l05', 0) - 0.05, hero(T) - w('l05', 0) - 0.15))), 'HAFTA · 30 YAŞ'],
    ],
  };
}

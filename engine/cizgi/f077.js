// № 077 · Tek bacakla yüz kırk üç gün (çizgi motoru, "Bir hikâye" serisi, iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Kahraman Terry Fox: kıvırcık saç, beyaz tişört, gri şort, sağ bacakta metal protez (seke seke adım).
// Doruk: Kanada haritasında kırmızı çizgi St. John's'tan Thunder Bay'e uzanır, sayaç 5.373 km. Ölüm gösterilmez: şafakta boş yol.
// Kapanış: kâğıt uçak "bunu pes etmek üzere olan birine gönder". Sahneler 1400 px arayla; kamera [t, zoom, x, y].

const SX = 1400;
export function hero(T) { return T.w('l05', 28) + 0.1; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.3, T.l03], [w('l03', 20) - 0.3, w('l03', 20)], [T.l04 - 0.25, T.l04], [w('l05', 12) - 0.3, w('l05', 12)], [w('l07', 1) - 0.3, w('l07', 1)], [w('l07', 14) - 0.3, w('l07', 14)], [w('l07', 22) - 0.3, w('l07', 22)], [w('l07', 31) - 0.3, w('l07', 31)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 11), w('l03', 19), w('l03', 29), w('l07', 17), w('l07', 31)],
    thock: [w('l05', 7)],
    scratch: [[w('l03', 24), w('l03', 28), 0.02], [w('l05', 17) - 0.05, hero(T), 0.03]],
    riser: [w('l05', 12), w('l05', 17) - 0.05],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const TERRY = base({
  key: 'terry', name: 'Terry Fox', seed: 771,
  torso: { len: 0.84, shoulder: 0.66, hip: 0.54, depth: 0.42, belly: 0, color: '#F4F1EA', shade: '#D9D4C8' },
  arm: { upper: 0.4, lower: 0.38, w: 0.17, color: '#E9B98F', shade: '#D29E74', hand: 0.12 },
  leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#E9B98F', shade: '#D29E74' },
  shoe: { color: '#2E4A6B', len: 0.3, h: 0.11 },
  skin: '#E9B98F', skinShade: '#D29E74', hair: '#5A3A22',
  features: ['hairMessy'],
});
const ARKADAS = base({
  key: 'arkadas77', name: 'Arkadaş', seed: 772,
  torso: { len: 0.78, shoulder: 0.62, hip: 0.6, depth: 0.42, belly: 0, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.38, lower: 0.36, w: 0.18, color: '#2E4A6B', shade: '#233A55', hand: 0.13 },
  leg: { upper: 0.39, lower: 0.37, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#8A3A2A', len: 0.27, h: 0.11 },
  skin: '#C9946A', skinShade: '#AD7C55', hair: '#1E1814',
  features: ['jacket', 'hairSlick'],
});

// Kanada'nın sade silueti (boylam, enlem) ve koşu rotası
const CANADA = [[-141, 69.6], [-141, 60.3], [-135, 59.5], [-130, 55.5], [-130, 54.5], [-127, 50.5], [-123.2, 48.9], [-110, 49], [-95, 49], [-95, 49.3], [-89.2, 48.4], [-84.5, 46.5], [-82.4, 42.9], [-79, 42.9], [-76.5, 44.2], [-74.7, 45], [-71.5, 45], [-70, 46.7], [-67.8, 47.1], [-66.9, 45], [-64, 45.8], [-61, 45.2], [-65.7, 43.5], [-63.5, 44.6], [-60, 46], [-64.5, 48.9], [-66, 50.2], [-60, 50.2], [-57.1, 51.4], [-55.7, 52.5], [-60, 55.5], [-62, 57.5], [-64.5, 60.3], [-70, 61], [-78, 62.3], [-77, 60], [-78.5, 58.5], [-76.6, 56], [-79, 54.5], [-79.5, 51.5], [-82, 52.9], [-85, 55.3], [-88.5, 56.8], [-93, 58.8], [-94.5, 60.5], [-90.5, 64], [-88, 66.5], [-95, 68], [-100, 67.8], [-108, 67.8], [-115, 67.8], [-123, 69.4], [-130, 69.6]];
const NEWF = [[-59.4, 47.6], [-55.5, 49.6], [-52.8, 47.6], [-53.6, 46.7], [-55.7, 47], [-57.6, 50.9], [-55.5, 51.6]];
const ROUTE = [[-52.7, 47.56], [-55.5, 47.9], [-59.1, 47.6], [-60.2, 46.1], [-63.6, 44.8], [-64.8, 46.1], [-71.2, 46.8], [-73.6, 45.5], [-75.7, 45.4], [-79.4, 43.7], [-81, 45.5], [-84.3, 46.5], [-84.8, 48], [-87.1, 48.8], [-89.2, 48.4]];
const REST = [[-89.2, 48.4], [-97.1, 49.9], [-106.6, 52.1], [-114, 51], [-119.5, 50.5], [-123.1, 49.3]];

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, crowd, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, GOLD = '#E2B13C';

  // Terry: karakter + şort + sağ bacakta protez (soket, metal boru, diz mafsalı)
  const terry = (o, t, proth = true) => {
    const sk = ch(TERRY, o, t), side = (o.view === 'side') || o.walk != null;
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s * (side ? (o.facing ?? 1) : 1), o.s);
    const lim = (pts, wd, col) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.strokeStyle = PAL.ink; ctx.lineWidth = wd + 0.1; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.stroke(); };
    const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    if (proth && !o.blanket) {
      lim([sk.kneeR, sk.ankleR], 0.17, '#B8BEC4');
      lim([sk.kneeR, sk.ankleR], 0.05, '#7C848C');
      lim([mix(sk.hipR, sk.kneeR, 0.45), sk.kneeR], 0.25, '#8A6A50');
      circ(sk.kneeR[0], sk.kneeR[1], 0.075, '#7C848C', 0.04);
    }
    lim([sk.hipL, mix(sk.hipL, sk.kneeL, 0.38)], 0.27, '#8C9298');
    lim([sk.hipR, mix(sk.hipR, sk.kneeR, 0.38)], 0.27, '#8C9298');
    ctx.restore();
    return sk;
  };
  // koşu: seke seke adım — sol bacakta iki sekme, protezle bir adım; protez dizi bükülmez
  const run = (x, y, s, ph, facing = 1, extra = {}) => {
    const hop = Math.abs(Math.sin(ph * Math.PI * 3)) * 0.07;
    return terry({ x, y, s, walk: ph % 1, facing, lean: 9 + 3 * Math.sin(ph * Math.PI * 2), bob: hop, legR: { knee: 3 }, armL: { el: 75 }, armR: { el: 75 }, expr: 'notr', ...extra }, extra.t ?? 0);
  };
  const pine = (x, y, h, col = '#4C8240') => { poly([[x, y - h], [x - h * 0.28, y - h * 0.35], [x - h * 0.16, y - h * 0.35], [x - h * 0.34, y], [x + h * 0.34, y], [x + h * 0.16, y - h * 0.35], [x + h * 0.28, y - h * 0.35]], col, 5); rect(x - 7, y, 14, 18, '#6A4A2E', 4); };
  const van = (x, y, k = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    rect(-170, -150, 300, 120, '#E9DFC9', LW, 18); poly([[130, -150], [175, -95], [175, -30], [130, -30]], '#E9DFC9', LW);
    rect(-150, -130, 90, 44, '#9FC0CF', 4, 6); rect(-40, -130, 90, 44, '#9FC0CF', 4, 6); poly([[136, -138], [166, -98], [136, -98]], '#9FC0CF', 4);
    rect(-170, -78, 345, 16, RED, 0); circ(-100, -26, 26, '#2A2A2E', LW); circ(100, -26, 26, '#2A2A2E', LW); circ(-100, -26, 9, '#B8BEC4', 3); circ(100, -26, 9, '#B8BEC4', 3);
    ctx.restore();
  };
  // harita: sol üst (x0, y0), genişlik W (900 px = 89° boylam)
  const proj = (x0, y0, Wd) => ([lo, la]) => [x0 + (lo + 141) / 89 * Wd, y0 + (70 - la) / 28 * Wd * 0.5];
  const mapDraw = (x0, y0, Wd, prog = 0, rest = 0, planned = 0) => {
    const p = proj(x0, y0, Wd);
    poly(CANADA.map(p), '#E9DFC9', LW); poly(NEWF.map(p), '#E9DFC9', LW);
    ctx.save(); ctx.globalAlpha = 0.35; poly([[-95, 49], [-89.2, 48.4], [-84.5, 46.5], [-82.4, 44], [-87, 45.5], [-92, 47]].map(p), '#9FC0CF', 0); ctx.restore();
    const pts = ROUTE.map(p), rp = REST.map(p);
    const len = a => { let L = 0; for (let i = 1; i < a.length; i++) L += Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]); return L; };
    const partial = (a, u) => { const L = len(a) * u, out = [a[0]]; let acc = 0; for (let i = 1; i < a.length; i++) { const d = Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]); if (acc + d >= L) { const k = (L - acc) / d; out.push([lerp(a[i - 1][0], a[i][0], k), lerp(a[i - 1][1], a[i][1], k)]); return out; } acc += d; out.push(a[i]); } return out; };
    const stroke = (a, col, wd, dash = []) => { ctx.beginPath(); a.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.setLineDash([]); };
    if (planned > 0) stroke(partial(pts.concat(rp.slice(1)), planned), RED, Wd / 160, [Wd / 70, Wd / 90]);
    if (rest > 0) stroke(partial(rp, rest), 'rgba(194,65,47,0.55)', Wd / 180, [Wd / 70, Wd / 90]);
    if (prog > 0) { const pp = partial(pts, prog); stroke(pp, RED, Wd / 90); const e = pp.at(-1); circ(e[0], e[1], Wd / 70, RED, 4); }
    circ(pts[0][0], pts[0][1], Wd / 110, PAL.ink, 0);
    return { p, pts, rp };
  };

  const GY = 1240;
  const roadBg = (lt, speed = 1) => {
    bg('#BFD6DC');
    for (let i = 0; i < 5; i++) { const x = ((i * 380 - lt * 40 * speed) % 1900 + 1900) % 1900 - 400; ell(x, 1060, 300, 120, '#A9C7B0', 0); }
    for (let i = 0; i < 9; i++) { const x = ((i * 230 - lt * 140 * speed) % 2070 + 2070) % 2070 - 500; pine(x, 1150, 190 + (i % 3) * 45, i % 2 ? '#4C8240' : '#5E9A4E'); }
    rect(-600, 1150, 2400, 900, '#8FAE6A', 0); rect(-600, GY - 70, 2400, 140, '#8C8A86', 0); line(-600, GY - 70, 1800, GY - 70, 5); line(-600, GY + 70, 1800, GY + 70, 5);
    for (let i = 0; i < 12; i++) { const x = ((i * 200 - lt * 420 * speed) % 2400 + 2400) % 2400 - 600; rect(x, GY - 6, 110, 12, '#F4F1EA', 0); }
  };

  const scenes = [];
  // 0 · kapak ve kanca: Terry otoyolda koşuyor, arkasında minibüs
  scenes[0] = t => {
    const lt = loopT(t);
    roadBg(lt);
    van(140, GY + 40, 1.05);
    run(610, GY + 30, 165, lt * 1.3, 1, { t, expr: t > T.l02 && t < T.l02end ? 'notr' : 'notr', head: { look: [0.5, 0] } });
  };
  // 1 · hastane 1977: yatakta Terry, duvarda röntgen; kemikte kırmızı leke, dizin üstünde kesik çizgi
  scenes[1] = t => {
    bg('#DCE6E2'); rect(-600, 1180, 2400, 900, '#BFC9C4', 0); line(-600, 1180, 1800, 1180, LW);
    rect(600, 600, 330, 450, '#1E2A3A', LW, 10);
    const bx = 765; ctx.save(); ctx.globalAlpha = 0.9;
    rect(bx - 22, 650, 44, 170, '#E9EEF0', 4, 18); ell(bx, 830, 48, 26, '#E9EEF0', 4); ell(bx, 868, 44, 22, '#E9EEF0', 4); rect(bx - 18, 880, 36, 150, '#E9EEF0', 4, 14); ctx.restore();
    const spot = ease.enter(seg(t, w('l03', 11) - 0.1, 0.5)); if (spot > 0) { ctx.save(); ctx.globalAlpha = 0.85; circ(bx + 2, 900, 26 * spot, RED, 0); ctx.restore(); }
    if (t > w('l03', 19) - 0.2) { const u = seg(t, w('l03', 19) - 0.2, 0.5); ctx.setLineDash([16, 12]); line(bx - 70, 790, bx - 70 + 140 * u, 790, 7, RED); ctx.setLineDash([]); }
    rect(80, 1000, 470, 70, '#F4F1EA', LW, 10); rect(80, 1070, 470, 30, '#8C9298', LW); rect(90, 1100, 22, 80, '#6E757C', 4); rect(518, 1100, 22, 80, '#6E757C', 4);
    rect(60, 900, 40, 200, '#8C9298', LW, 8);
    terry({ x: 330, y: 1135, s: 150, expr: t < w('l03', 20) ? 'yorgun' : 'notr', head: { look: [0.7, -0.1], tilt: -5 }, blanket: true, legL: { hip: 3, knee: 0 }, legR: { hip: 3, knee: 0 } }, t, false);
    rect(150, 990, 360, 150, '#9FC0CF', LW, 16);
  };
  // 2 · karar: duvardaki Kanada haritası, baştan sona kesik kırmızı rota; havada bir dolar
  scenes[2] = t => {
    bg('#EFE6D6'); rect(-600, 1250, 2400, 900, '#D8C9AE', 0); line(-600, 1250, 1800, 1250, LW);
    rect(70, 660, 620, 360, '#FBF8F1', LW, 8);
    mapDraw(90, 700, 580, 0, 0, ease.state(seg(t, w('l03', 24) - 0.1, 1.4)));
    terry({ x: 850, y: 1250, s: 140, expr: t > w('l03', 22) ? 'mutlu' : 'notr', armL: { sh: t > w('l03', 24) ? 100 : 10, el: 5 }, head: { look: [-0.7, -0.2] } }, t);
    const c = ease.enter(seg(t, w('l03', 29) - 0.1, 0.5));
    if (c > 0) { const y = 640 - 10 * Math.sin(t * 3); ctx.save(); ctx.translate(850, y); ctx.scale(c, c); circ(0, 0, 62, GOLD, LW); circ(0, 0, 44, null, 4); text('1 $', 0, 18, 46, '#6A4A12'); ctx.restore(); }
  };
  // 3 · St. John's: protezi Atlantik'e batırır, sonra yola koyulur
  scenes[3] = t => {
    bg('#C9DCE2'); rect(-600, 1060, 2400, 300, '#9DB9C4', 0);
    poly([[-600, GY], [450, GY], [470, GY + 900], [-600, GY + 900]], '#E3D2A8', 0); line(-600, GY, 452, GY, LW);
    poly([[-600, GY], [-100, 980], [120, 1010], [260, GY]], '#9A8F84', LW);
    const dip = seg(t, w('l05', 7) - 0.15, 0.6), up = seg(t, w('l05', 10), 0.5);
    const hip = 32 * ease.enter(dip) * (1 - ease.enter(up));
    const go = seg(t, w('l05', 10), 1.2);
    if (go <= 0) terry({ x: 400, y: GY, s: 150, view: 'side', facing: 1, legR: { hip, knee: 0 }, legL: { hip: -4, knee: 4 }, armL: { sh: 20, el: 20 }, armR: { sh: -20, el: 15 }, expr: dip > 0 ? 'mutlu' : 'notr', head: { look: [0.6, 0.4] } }, t);
    else run(lerp(400, -80, ease.enter(go)), GY, 150, t * 1.3, -1, { t });
    const sea = y0 => { ctx.beginPath(); ctx.moveTo(450, 2000); ctx.lineTo(450, y0); for (let x = 450; x <= 1800; x += 30) ctx.lineTo(x, y0 + 6 * Math.sin(x * 0.03 + t * 3)); ctx.lineTo(1800, 2000); ctx.closePath(); };
    ctx.save(); ctx.globalAlpha = 0.9; sea(GY - 14); ctx.fillStyle = '#5E8FA6'; ctx.fill(); ctx.restore();
    sea(GY - 14); ctx.lineWidth = 5; ctx.strokeStyle = PAL.ink; ctx.stroke();
    if (dip > 0.4 && dip < 1) for (let i = 0; i < 6; i++) { const u = seg(t, w('l05', 7) + 0.1, 0.6); circ(500 + i * 14 - 40, GY - 20 - Math.sin(u * Math.PI) * (40 + i * 9), 6, '#E9EEF0', 2); }
  };
  // 4 · büyük harita: günde 42 km, 143 günde 5.373 km; Thunder Bay'de durur, kalan yol kesik
  const MX = 90, MY = 720, MW = 900;
  scenes[4] = t => {
    bg('#DCE8EC');
    const prog = ease.state(seg(t, w('l05', 17) - 0.05, hero(T) - w('l05', 17) - 0.1));
    const rest = ease.state(seg(t, T.l06 - 0.1, 1.0));
    const m = mapDraw(MX, MY, MW, t < w('l05', 17) ? 0.012 : prog, rest);
    const s0 = m.pts[0]; text("St. John's", s0[0] - 40, s0[1] + 56, 30, PAL.ink, 'Archivo', 800);
    if (prog >= 0.999) { const e = m.pts.at(-1); text('Thunder Bay', e[0], e[1] + 62, 30, RED); }
    const day = Math.round(143 * prog);
    if (t > w('l05', 17) - 0.1) { rect(720, 690, 230, 74, '#FBF8F1', 5, 12); text(`GÜN ${day}`, 835, 742, 44, RED); }
    // günde 42 km: kısa bir şerit ölçeği
    if (t > w('l05', 12) - 0.1 && t < w('l05', 17)) { const u = ease.enter(seg(t, w('l05', 12), 0.6)); line(m.pts[0][0] - 42 * MW / 900 * 0.02 * u * 40, m.pts[0][1] + 18, m.pts[0][0], m.pts[0][1] + 18, 8, RED); }
  };
  // 5 · duruş: yol kenarında eğilmiş Terry, minibüs durmuş
  scenes[5] = t => {
    roadBg(31, 0);
    van(330, GY + 40, 1.0);
    const k = ease.enter(seg(t, w('l07', 5) - 0.1, 0.6));
    terry({ x: 680, y: GY + 30, s: 150, view: 'side', facing: -1, lean: lerp(8, 34, k), armL: { sh: lerp(20, 30, k), el: lerp(30, 10, k) }, armR: { sh: lerp(-10, 28, k), el: lerp(30, 10, k) }, legL: { hip: 6, knee: 10 * k }, legR: { hip: -4, knee: 3 }, expr: 'yorgun', head: { look: [0, 0.4] } }, t);
  };
  // 6 · şafakta boş yol: ufka giden yol, yükselen güneş
  scenes[6] = t => {
    bg('#F3D2B3'); circ(540, 980, 120 + 6 * seg(t, w('l07', 8), 2.2), '#F6B26B', 0); rect(-600, 990, 2400, 1000, '#7E8F5E', 0);
    poly([[500, 990], [580, 990], [900, 1900], [180, 1900]], '#8C8A86', 0); line(500, 990, 180, 1900, 5); line(580, 990, 900, 1900, 5);
    for (let i = 0; i < 6; i++) { const y = 1010 + i * i * 22, wd = 3 + i * 3; rect(540 - wd / 2, y, wd, 10 + i * 6, '#F4F1EA', 0); }
    for (let i = 0; i < 6; i++) { pine(80 + i * 40, 990, 70 + (i % 3) * 18, '#3E5F35'); pine(1000 - i * 40, 990, 70 + (i % 2) * 22, '#3E5F35'); }
  };
  // 7 · hedef: her Kanadalıdan bir dolar; madeni para sütunları yükselir
  scenes[7] = t => {
    bg('#EFE6D6'); rect(-600, 1180, 2400, 900, '#C9B08E', 0); line(-600, 1180, 1800, 1180, LW);
    const u = ease.state(seg(t, w('l07', 15) - 0.2, w('l07', 22) - w('l07', 15)));
    for (let i = 0; i < 9; i++) {
      const x = 140 + i * 100, n = Math.floor(u * (12 + ((i * 7) % 5) * 4));
      for (let j = 0; j < n; j++) { ell(x, 1170 - j * 26, 46, 15, GOLD, 4); }
    }
    for (let i = 0; i < 5; i++) { const c = seg(t, w('l07', 15) + i * 0.45, 0.6); if (c > 0 && c < 1) { const y = lerp(600, 1000, c * c); ell(220 + i * 160, y, 42, 13, GOLD, 4); } }
  };
  // 8 · bugün: Terry Fox koşuları; afiş, kalabalık, önde koşanlar
  scenes[8] = t => {
    bg('#CFE0E6'); rect(-600, 1180, 2400, 900, '#8FAE6A', 0); rect(-600, 1180, 2400, 120, '#8C8A86', 0); line(-600, 1180, 1800, 1180, 5);
    rect(110, 640, 18, 560, '#6E757C', 4); rect(950, 640, 18, 560, '#6E757C', 4); rect(110, 650, 858, 110, RED, LW, 6); text('TERRY FOX', 540, 732, 76, '#FFFFFF');
    crowd(140, 900, 800, 3, 773, 0.5, 1.2, t);
    run(320, 1260, 96, t * 1.2 + 0.3, 1, { t });
    ch('sen', { x: 560, y: 1265, s: 96, walk: (t * 1.4) % 1, facing: 1, lean: 8 }, t);
    ch(ARKADAS, { x: 790, y: 1260, s: 96, walk: (t * 1.4 + 0.5) % 1, facing: 1, lean: 8 }, t);
  };
  // 9 · gönder: bankta yorgun arkadaş, sen kâğıt uçak yollar, arkadaş ayağa kalkar
  scenes[9] = t => {
    bg('#F1E7D8'); rect(-600, 1230, 2400, 900, '#D9C7A9', 0); line(-600, 1230, 1800, 1230, LW);
    const go = seg(t, w('l07', 31) - 0.1, 1.1), got = go >= 1, up = ease.enter(seg(t, w('l07', 31) + 1.2, 0.6));
    rect(600, 1050, 360, 30, '#A87A4E', LW, 6); rect(620, 1080, 20, 150, '#8A6440', 4); rect(920, 1080, 20, 150, '#8A6440', 4);
    ch('sen', { x: 230, y: 1230, s: 150, facing: 1, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    if (up < 0.5) ch(ARKADAS, { x: 790, y: 1230, s: 150, view: 'side', facing: -1, lean: 22, legL: { hip: 85, knee: 88 }, legR: { hip: 80, knee: 84 }, armL: { sh: 40, el: 30 }, armR: { sh: 40, el: 30 }, expr: 'yorgun', head: { look: [0, 0.5] } }, t);
    else ch(ARKADAS, { x: 790, y: 1230, s: 150, facing: -1, expr: 'mutlu', armR: { sh: 150, el: 10 }, head: { look: [-0.5, -0.1] } }, t);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(310, 760, u), lerp(980, 900, u) - Math.sin(u * Math.PI) * 260, 0.9, lerp(-0.6, 0.5, u)); }
    if (got && up < 0.5) plane(760, 930, 0.7, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const tb = proj(MX, MY, MW)(ROUTE.at(-1));
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.1, 560, 980, 0)],
    ...cut(T.l02 - 0.1, P(1.1, 560, 980, 0), P(1.9, 630, 1150, 0)),
    [T.l02end + 0.1, ...P(2.05, 640, 1160, 0)],
    ...cut(T.l03 - 0.1, P(2.05, 640, 1160, 0), P(1.0, 540, 960, 1)),
    [w('l03', 11), ...P(1.08, 600, 940, 1)],
    [w('l03', 20) - 0.11, ...P(1.12, 560, 950, 1)],
    ...cut(w('l03', 20) - 0.1, P(1.12, 560, 950, 1), P(1.0, 540, 980, 2)),
    [T.l03end + 0.1, ...P(1.06, 520, 960, 2)],
    ...cut(T.l04 - 0.1, P(1.06, 520, 960, 2), P(1.35, 420, 1060, 3)),
    [w('l05', 7), ...P(1.5, 450, 1120, 3)],
    [w('l05', 11), ...P(1.3, 400, 1060, 3)],
    ...cut(w('l05', 12) - 0.1, P(1.3, 400, 1060, 3), P(1.0, 540, 980, 4)),
    [hero(T), ...P(1.05, 520, 980, 4)],
    [T.l06 - 0.05, ...P(1.05, 520, 980, 4)],
    [T.l06end + 0.3, ...P(1.9, tb[0] - 40, tb[1] - 20, 4)],
    ...cut(w('l07', 1) - 0.1, P(1.9, tb[0] - 40, tb[1] - 20, 4), P(1.05, 520, 1000, 5)),
    [w('l07', 8) - 0.11, ...P(1.2, 600, 1040, 5)],
    ...cut(w('l07', 8) - 0.1, P(1.2, 600, 1040, 5), P(1.0, 540, 960, 6)),
    [w('l07', 14) - 0.11, ...P(1.08, 540, 980, 6)],
    ...cut(w('l07', 14) - 0.1, P(1.08, 540, 980, 6), P(1.0, 540, 980, 7)),
    [w('l07', 22) - 0.11, ...P(1.05, 540, 980, 7)],
    ...cut(w('l07', 22) - 0.1, P(1.05, 540, 980, 7), P(1.0, 540, 980, 8)),
    [w('l07', 31) - 0.11, ...P(1.06, 540, 990, 8)],
    ...cut(w('l07', 31) - 0.1, P(1.06, 540, 990, 8), P(1.0, 540, 930, 9)),
    [T.l07end + 0.3, ...P(1.06, 540, 910, 9)],
    [T.loop0 - 0.001, ...P(1.06, 540, 910, 9)],
    [T.loop0, ...P(1.05, 560, 970, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Tek bacakla', '5.373 km'],
    kicker: 'BİR HİKÂYE · 143 GÜN',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(9, i))](t); ctx.restore();
    },
    names: [
      [w('l03', 0) - 0.1, w('l03', 11) - 0.3, 'Terry Fox', 'KANADA · 1977 · 18 YAŞINDA'],
      [w('l05', 1) - 0.1, w('l05', 12) - 0.3, "St. John's", '12 NİSAN 1980 · KİLOMETRE 0'],
    ],
    numbers: [
      [w('l05', 12) - 0.1, w('l05', 17) - 0.25, '42 km', 'HER GÜN'],
      [w('l05', 17) - 0.05, T.l06 - 0.2, t => Math.round(5373 * ease.state(seg(t, w('l05', 17) - 0.05, hero(T) - w('l05', 17) - 0.1))), 'KİLOMETRE · 143 GÜN'],
      [w('l07', 17) - 0.1, w('l07', 22) - 0.3, '24 milyon', 'DOLAR · ŞUBAT 1981'],
      [w('l07', 27) - 0.1, w('l07', 31) - 0.3, '1 milyar', 'DOLAR · BUGÜNE KADAR'],
    ],
  };
}

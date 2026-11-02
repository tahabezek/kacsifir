// № 069 · Kalbin kaç kez attı (çizgi motoru, "Senin sayın" serisi, sakin iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Görsel fikir: kocaman çizilmiş bir kalp ve EKG şeridi; bütün film tek bir nabız saatiyle (70 vuruş/dk) atar.
// Bölümün müzik temposu da 70 (ep.bpm): müziğin her vuruşu kalbin bir atışıdır. l01'de kalp üç kez atar ve sayılır.
// Uyurken, yemek yerken, video izlerken aynı saat sürer ("hiç durmadan"); sayaç 1 milyara döner; üç kalp = üç milyar.
// "Bazı insanları görünce" kalp iki kat hızlanır. Kapanış: kâğıt uçak bir kalp taşıyarak "ona" gider.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
const BP = 60 / 70;   // nabız periyodu (sn); ep.bpm = 70 ile aynı
export function hero(T) { return T.w('l05', 10) + 0.15; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [T.l04 - 0.25, T.l04], [w('l05', 5) - 0.25, w('l05', 5)], [T.l06 - 0.25, T.l06], [T.l07 - 0.25, T.l07], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 11), w('l03', 12), w('l03', 14), w('l07', 6)],
    scratch: [[T.l04, w('l05', 2), 0.025]],
    riser: [w('l05', 5), hero(T) - 0.05],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const KISI = {
  key: 'kisi', name: 'O kişi', seed: 691,
  head: { w: 0.9, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.2, 4.8] },
  torso: { len: 0.78, shoulder: 0.6, hip: 0.6, depth: 0.42, belly: 0, color: '#2E6E8E', shade: '#245A74' },
  arm: { upper: 0.38, lower: 0.36, w: 0.17, color: '#2E6E8E', shade: '#245A74', hand: 0.13 },
  leg: { upper: 0.39, lower: 0.37, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#C2412F', len: 0.27, h: 0.11 },
  skin: '#E7B98F', skinShade: '#CFA074', hair: '#5A3420',
  features: ['jacket', 'hairSlick'],
};

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, RED_S = '#A33424', NIGHT = '#24324A';
  const FAST = w('l06', 2);   // "görünce": kalp hızlanır

  // nabız: son atıştan bu yana geçen süre (sn); 70/dk sabit saat, "görünce"den sonra iki kat hızlı
  const since = t => {
    if (t >= FAST && t < T.loop0) { const p = BP / 2; return (((t - FAST) % p) + p) % p; }
    return ((t % BP) + BP) % BP;
  };
  const pulse = d => (d < 0.06 ? Math.sin((d / 0.06) * Math.PI / 2) : Math.exp(-(d - 0.06) * 9));
  // atış: kısa ön sıkışma, hızlı büyüme, yavaş sönme
  const beatK = t => 1 + 0.13 * pulse(since(t));

  // kalp: merkez (x, y), genişlik k px
  const heart = (x, y, k, sc = 1, fill = RED, lw = LW) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k * sc, k * sc);
    ctx.beginPath();
    ctx.moveTo(0, 0.38);
    ctx.bezierCurveTo(-0.52, 0.02, -0.56, -0.44, -0.26, -0.44);
    ctx.bezierCurveTo(-0.1, -0.44, 0, -0.34, 0, -0.24);
    ctx.bezierCurveTo(0, -0.34, 0.1, -0.44, 0.26, -0.44);
    ctx.bezierCurveTo(0.56, -0.44, 0.52, 0.02, 0, 0.38);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw / (k * sc); ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke();
    if (fill === RED) { ctx.beginPath(); ctx.ellipse(-0.27, -0.25, 0.1, 0.05, -0.7, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill(); }
    ctx.restore();
  };
  // EKG şeridi: (x0..x1, y) ekranda kayar; dalga t'nin saf fonksiyonu
  const ecg = (x0, x1, y, t, amp = 70, speed = 420, col = RED) => {
    rect(x0 - 20, y - amp - 30, x1 - x0 + 40, amp * 2 + 50, '#FBF3EE', LW * 0.7, 14);
    ctx.save(); ctx.strokeStyle = 'rgba(194,65,47,0.16)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let gx = x0; gx <= x1; gx += 30) { ctx.moveTo(gx, y - amp - 20); ctx.lineTo(gx, y + amp + 10); }
    ctx.stroke(); ctx.restore();
    const shape = d => (d < 0.02 ? -d / 0.02 * 0.15 : d < 0.05 ? -0.15 - (d - 0.02) / 0.03 * 0.85 : d < 0.08 ? -1 + (d - 0.05) / 0.03 * 1.35 : d < 0.11 ? 0.35 - (d - 0.08) / 0.03 * 0.35 : d > 0.2 && d < 0.36 ? -0.2 * Math.sin(((d - 0.2) / 0.16) * Math.PI) : 0);
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 3) { const tt = t - (x1 - x) / speed; const v = shape(since(tt)); x === x0 ? ctx.moveTo(x, y + v * amp) : ctx.lineTo(x, y + v * amp); }
    ctx.lineWidth = 7; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    circ(x1, y + shape(since(t)) * amp, 11, col, 0);
  };
  const room = (wall, floor, GY) => { bg(wall); rect(-600, GY, 2300, 1400, floor, 0); line(-600, GY, 1700, GY, LW); };
  // göğüsteki kalp (önden duran "sen" için): ayak (x, y), ölçek s
  const chestHeart = (x, y, s, t, k = 0.42) => heart(x + 0.14 * s, y - 1.42 * s, s * k, beatK(t));

  const scenes = [];
  // 0 · kapak ve kanca: kocaman kalp üç kez atar (sayılır); yanında sen, eli göğsünde
  const B3 = [BP, 2 * BP, 3 * BP];
  scenes[0] = t => {
    t = loopT(t);
    room('#F3E6DC', '#DCC6B4', 1250);
    heart(390, 880, 470, beatK(t));
    // sayım: l01'deki üç atış, kalbin altında üç çentik
    for (let i = 0; i < 3; i++) { const u = ease.enter(seg(t, B3[i], 0.18)); if (u > 0 && t < T.l02end + 0.3) { circ(250 + i * 140, 1165, 30 * u, RED, LW * 0.8); text(String(i + 1), 250 + i * 140, 1181, 40 * u, '#FFFFFF'); } }
    const sas = t > T.l02 - 0.1 && t < T.l02end + 0.3;
    ch('sen', { x: 860, y: 1250, s: 122, facing: -1, expr: sas ? 'saskin' : 'notr', talk: talk(t, T.l02, T.l02end), armR: { sh: 25, el: 128 }, armL: { sh: sas ? 40 : 10, el: sas ? 60 : -4 }, head: { look: [-0.6, -0.2], tilt: sas ? -6 : 0 } }, t);
  };
  // 1 · dinlenirken: koltukta sen, göğsünde kalp
  scenes[1] = t => {
    room('#EFE6D6', '#D8C9AE', 1300);
    // koltuk arkalığı
    rect(220, 830, 640, 300, '#7A5A9A', LW, 40); rect(170, 960, 90, 260, '#6A4C88', LW, 30); rect(820, 960, 90, 260, '#6A4C88', LW, 30);
    ch('sen', { x: 540, y: 1300, s: 185, expr: 'mutlu', blink: 0.75, head: { tilt: 6 }, armL: { sh: 20, el: 40 }, armR: { sh: 20, el: 40 } }, t);
    rect(200, 1110, 680, 190, '#8A68AA', LW, 26);   // oturak ve ön yüz sen'in bacaklarını örter
    chestHeart(540, 1300, 185, t);
    if (t > w('l03', 5) - 0.1) {   // "bir günde": güneş ve ay penceresi döner
      const u = seg(t, w('l03', 5) - 0.1, 1.6);
      rect(780, 640, 200, 160, '#BFD6DC', LW, 6);
      ctx.save(); ctx.beginPath(); ctx.rect(780, 640, 200, 160); ctx.clip();
      const a = u * Math.PI * 2; circ(880 + Math.sin(a) * 70, 740 - Math.cos(a) * 70 + 20, 22, u < 0.5 ? '#F2C14E' : '#F4F1EA', 4);
      ctx.restore();
    }
  };
  // 2 · uyurken: yatakta yatan sen (döndürülmüş çizim), göğsünde kalp atmaya devam
  scenes[2] = t => {
    bg(NIGHT); rect(-600, 1250, 2300, 1400, '#1A2436', 0);
    rect(700, 600, 220, 200, '#3A5070', LW, 6); circ(840, 670, 34, '#F4F1EA', 4); circ(826, 660, 30, '#3A5070', 0);
    rect(110, 1000, 860, 140, '#C9B08E', LW, 12); rect(110, 1140, 40, 110, '#8A6440', LW); rect(930, 1140, 40, 110, '#8A6440', LW); rect(90, 860, 60, 390, '#8A6440', LW, 10);
    rect(470, 905, 190, 95, '#F4F1EA', LW, 30);   // yastık
    const s = 140, px = 880, py = 955;
    // baş solda: yürüyen ayak (px) sağda; -π/2 döndürme baş yönünü sola çevirir
    ctx.save(); ctx.translate(px, py); ctx.rotate(-Math.PI / 2);
    ch('sen', { x: 0, y: 0, s, expr: 'notr', blink: 1, head: { tilt: 0 } }, t);
    ctx.restore();
    rect(600, 895, 330, 125, '#5E7FA8', LW, 26);   // yorgan
    heart(px - 1.42 * s, py - 0.14 * s - 30, s * 0.42, beatK(t));
    for (let i = 0; i < 3; i++) { const u = ((t * 0.6 + i / 3) % 1); text('z', 420 + u * 60 + i * 10, 800 - u * 140, 40 + i * 12, '#F4F1EA'); }
  };
  // 3 · yemek yerken: masada çorba, elinde kaşık yok; çay bardağı
  scenes[3] = t => {
    room('#F1E3CF', '#C9AE8A', 1300);
    rect(860, 620, 160, 200, '#BFD6DC', LW, 6);
    ch('sen', { x: 540, y: 1292, s: 160, expr: 'mutlu', props: { R: 'tea' }, armR: { sh: 35, el: 125 }, armL: { sh: 20, el: 60 }, head: { look: [0, 0.2] } }, t);
    chestHeart(540, 1292, 160, t);
    rect(120, 1150, 840, 40, '#A87A4E', LW, 8); rect(160, 1190, 30, 110, '#8A6440', LW); rect(890, 1190, 30, 110, '#8A6440', LW);
    ell(300, 1140, 110, 26, '#F4F1EA', LW); ell(300, 1130, 84, 16, '#E2A23A', 4);
    for (let i = 0; i < 3; i++) { const ph = t * 2 + i; line(270 + i * 30, 1100 - 10 * Math.sin(ph), 270 + i * 30 + 8 * Math.sin(ph * 1.3), 1040, 4, '#B8B0A0'); }
  };
  // 4 · bu videoyu izlerken: telefonda bu video (küçük bir kalp atıyor)
  scenes[4] = t => {
    room('#EDE4D6', '#D2C2A8', 1250);
    ch('sen', { x: 520, y: 1250, s: 160, expr: 'notr', props: { R: 'phone' }, armR: { sh: 55, el: 115 }, armL: { sh: 10, el: -4 }, head: { look: [0.4, 0.4] } }, t);
    chestHeart(520, 1250, 160, t);
    // büyütülmüş telefon ekranı: içinde aynı kalp
    rect(720, 820, 240, 380, '#2B2F33', LW, 30); rect(740, 846, 200, 328, '#F3E6DC', 0, 14);
    heart(840, 1010, 140, beatK(t));
  };
  // 5 · sayaç: mekanik sayaç dönüp 1.104.000.000'a oturur; son hane her atışta ilerler
  const C0 = w('l05', 2) - 0.6, C1 = w('l05', 4);
  const counterVal = t => {
    if (t < C0) return null;
    if (t < C1) return Math.round(1104000000 * ease.state(seg(t, C0, C1 - C0)));
    return 1104000000 + Math.floor((t - C1) / BP);
  };
  scenes[5] = t => {
    room('#EFE6D6', '#D8C9AE', 1250);
    const X0 = 110, Y0 = 880, cw = 60, gap = 10;
    rect(X0 - 30, Y0 - 36, 802, 212, '#3A3F48', LW, 24);
    // dönmeden önce sıfırlar: rastgele hane yanlış bir sayı gibi okunmasın
    const v = counterVal(t);
    const digits = v == null ? '0000000000' : String(v).padStart(10, '0');
    let x = X0;
    for (let i = 0; i < 10; i++) {
      rect(x, Y0, cw, 140, '#F7F2E8', LW * 0.8, 8);
      text(digits[i], x + cw / 2, Y0 + 104, 86, i === 0 && v != null ? RED : PAL.ink);
      x += cw + gap;
      if (i === 0 || i === 3 || i === 6) { circ(x - gap / 2 + 2, Y0 + 128, 7, '#F7F2E8', 0); x += 14; }
    }
    text('ATIŞ', 480, Y0 - 58, 56, '#6B6458');
    heart(300, 1170, 110, beatK(t));
    ch('sen', { x: 960, y: 1250, s: 112, facing: -1, expr: v != null && v > 1e9 ? 'saskin' : 'notr', talk: talk(t, T.l04, T.l04end), armL: { sh: 70, el: 40 }, head: { look: [-0.6, -0.4] } }, t);
  };
  // 6 · üç kalp: bir ömür ≈ üç milyar; ilki dolu (30 yaş), diğerleri "üç"te belirir
  scenes[6] = t => {
    room('#F3E6DC', '#DCC6B4', 1250);
    const xs = [220, 540, 860];
    for (let i = 0; i < 3; i++) {
      const u = i === 0 ? 1 : ease.enter(seg(t, w('l05', 9) - 0.15 + (i - 1) * 0.12, 0.35));
      if (u <= 0) continue;
      heart(xs[i], 800, 290, u * (t > w('l05', 13) ? beatK(t) : 1), i === 0 ? RED : '#E9A79C');
      if (u > 0.6) { text('1', xs[i], 810, 64, '#FFFFFF'); text('milyar', xs[i], 858, 38, '#FFFFFF'); }
    }
    ch('sen', { x: 540, y: 1250, s: 110, expr: 'saskin', head: { look: [0, -0.6] } }, t);
  };
  // 7 · "bazı insanları görünce": o kişi gelir, kalp iki kat hızlanır ve büyür
  scenes[7] = t => {
    room('#F4E4E0', '#DDC3BC', 1250);
    const arr = seg(t, T.l06 - 0.3, FAST - T.l06 + 0.3), seen = t >= FAST;
    ch('sen', { x: 300, y: 1250, s: 150, facing: 1, expr: seen ? 'mutlu' : 'notr', talk: 0, armL: { sh: seen ? 25 : 8, el: seen ? 128 : -4 }, head: { look: [0.6, 0], tilt: seen ? 5 : 0 } }, t);
    heart(300 + 0.14 * 150, 1250 - 1.42 * 150, 150 * (seen ? 0.62 : 0.42), beatK(t));
    if (arr < 1) ch(KISI, { x: lerp(1180, 800, ease.state(arr)), y: 1250, s: 150, facing: -1, walk: (t * 1.7) % 1 }, t);
    else ch(KISI, { x: 800, y: 1250, s: 150, facing: -1, expr: 'mutlu', armR: { sh: 120, el: 30 }, head: { look: [-0.6, 0] } }, t);
  };
  // 8 · gönder: sen telefonundan kalp taşıyan kâğıt uçak yollar; o kişi yakalar
  scenes[8] = t => {
    room('#F1E7D8', '#D9C7A9', 1230);
    const go = seg(t, w('l07', 6) - 0.1, 1.1), got = go >= 1;
    ch('sen', { x: 250, y: 1230, s: 150, facing: 1, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    ch(KISI, { x: 840, y: 1230, s: 150, facing: -1, expr: got ? 'mutlu' : 'notr', armL: { sh: got ? 120 : 10, el: got ? 40 : -4 }, head: { look: [-0.6, 0] } }, t);
    heart(250 + 0.14 * 150, 1230 - 1.42 * 150, 150 * 0.5, beatK(t));
    if (go > 0 && go < 1) {
      const u = ease.state(go), x = lerp(330, 760, u), y = lerp(1000, 980, u) - Math.sin(u * Math.PI) * 300;
      plane(x, y, 0.9, lerp(-0.6, 0.5, u)); heart(x - 50, y - 46, 60, 1);
    }
    if (got) { plane(780, 1010, 0.7, 0.2); heart(780 - 40, 1010 - 40, 56, beatK(t)); }
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.08, 470, 950, 0)],
    ...cut(T.l02 - 0.1, P(1.08, 470, 950, 0), P(2.2, 820, 980, 0)),
    [T.l02end + 0.1, ...P(2.35, 820, 975, 0)],
    ...cut(T.l03 - 0.1, P(2.35, 820, 975, 0), P(1.0, 540, 1000, 1)),
    [w('l03', 11) - 0.11, ...P(1.1, 540, 1020, 1)],
    ...cut(w('l03', 11) - 0.1, P(1.1, 540, 1020, 1), P(1.0, 540, 980, 2)),
    [w('l03', 12) - 0.11, ...P(1.06, 520, 980, 2)],
    ...cut(w('l03', 12) - 0.1, P(1.06, 520, 980, 2), P(1.0, 540, 1000, 3)),
    [w('l03', 14) - 0.11, ...P(1.06, 540, 1000, 3)],
    ...cut(w('l03', 14) - 0.1, P(1.06, 540, 1000, 3), P(1.0, 600, 990, 4)),
    [T.l03end + 0.2, ...P(1.12, 620, 990, 4)],
    ...cut(T.l04 - 0.1, P(1.12, 620, 990, 4), P(1.0, 540, 1000, 5)),
    [w('l05', 4) + 0.3, ...P(1.05, 520, 960, 5)],
    ...cut(w('l05', 5) - 0.1, P(1.05, 520, 960, 5), P(1.0, 540, 980, 6)),
    [hero(T), ...P(1.02, 540, 960, 6)],
    [T.l05end + 0.2, ...P(1.1, 540, 920, 6)],
    ...cut(T.l06 - 0.1, P(1.1, 540, 920, 6), P(1.0, 560, 1000, 7)),
    [FAST, ...P(1.0, 560, 1000, 7)],
    [T.l06end + 0.2, ...P(1.25, 470, 960, 7)],
    ...cut(T.l07 - 0.1, P(1.25, 470, 960, 7), P(1.0, 540, 930, 8)),
    [T.l07end + 0.2, ...P(1.06, 540, 910, 8)],
    [T.loop0 - 0.001, ...P(1.06, 540, 910, 8)],
    [T.loop0, ...P(1.05, 520, 950, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Kalbin bugüne kadar', 'kaç kez attı?'],
    kicker: 'SENİN SAYIN · KALP',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.max(0, Math.min(8, Math.round((cam[k][2] - 540) / SX)));
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    // EKG şeridi ekranda sabit: dinlenme montajı boyunca kesmelerin üstünden akar ("hiç durmadan")
    overlay(t) {
      if (t > T.l03 - 0.1 && t < T.l04 - 0.1) ecg(110, 970, 700, t, 60);
      if (t > T.l06 - 0.1 && t < T.l07 - 0.1) ecg(110, 970, 700, t, 60);
    },
    names: [],
    numbers: [
      [w('l03', 1) - 0.1, w('l03', 5) - 0.2, '70', 'ATIŞ · DAKİKADA'],
      [w('l03', 5) - 0.05, w('l03', 11) - 0.15, '100.000', 'ATIŞ · BİR GÜNDE'],
      [w('l05', 9) - 0.1, T.l05end + 0.2, '3 milyar', 'ATIŞ · BİR ÖMÜR BOYUNCA'],
    ],
  };
}

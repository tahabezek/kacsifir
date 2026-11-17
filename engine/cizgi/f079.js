// № 079 · Hangisi ağır basar? (pilot, yeni iskelet: "tahmin et", tek plan, kutusuz altyazı). Senaryo: research/pilot/079.md
// Tek sabit sahne: dev bir terazi. Sağ kefeye bütün vahşi memeliler dökülür (filler, balinalar, geyikler kelimelerine
// kilitli), terazi sağa yatar; sol kefeye bütün insanlar yağar, terazi dengeye gelir, sessizlik, son dalga ve TAK.
// Sonra sağ kefeye 60'ar milyon tonluk çuvallar iner: sayaç 60 → 390, terazi her çuvalda biraz kalkar ve 6,5 çuvalda
// dengeye gelir (oran gözün önünde oluşur). Kütleler: Greenspoon ve ark. 2023 (PNAS): insan ≈ 390 Mt, vahşi memeli ≈ 60 Mt.
// Terazinin açısı her iniş için kapalı formüllü (kritik sönümlü) bir adımın toplamıdır: önceki kareler simüle edilmez.
// Döngü: kapanışta kefeler öne devrilip boşalır, terazi dengeye döner, ilk balina yeniden düşmeye başlar.

const PIV = [540, 700], ARM = 280, STR = 220, STOP = 0.45, GY = 1130;
const HUMAN_ROWS = [10, 9, 9, 8, 8, 7, 6, 5, 4, 3, 2, 1];
const step = (tau, w) => (tau <= 0 ? 0 : 1 - (1 + w * tau) * Math.exp(-w * tau));   // kritik sönümlü adım yanıtı

// hayvan yığını: tür, ölçek, yerel yuva (kefe ağzına göre), iniş anı; ilk balina kare 0'da havada
function animalPlan(T) {
  const w = (id, k) => T.w(id, k);
  return [
    { kind: 'balina', k: 1.55, slot: [72, 30], land: 0.18, fall: 1.0, from: -100, flip: -1 },
    { kind: 'ayi', k: 0.9, slot: [72, -34], land: 1.05 },
    { kind: 'aslan', k: 0.85, slot: [-74, -36], land: 1.6 },
    { kind: 'geyik', k: 0.85, slot: [8, -52], land: 2.2 },
    { kind: 'fil', k: 1.2, slot: [-52, -96], land: w('l01', 7) + 0.02 },
    { kind: 'balina', k: 1.2, slot: [40, -140], land: w('l01', 8) + 0.02 },
    { kind: 'geyik', k: 0.9, slot: [-40, -168], land: w('l01', 9) + 0.02 },
    { kind: 'ayi', k: 0.8, slot: [60, -196], land: T.l02 + 0.25 },
    { kind: 'aslan', k: 0.75, slot: [-10, -232], land: T.l02 + 0.75 },
  ];
}
function humanPlan(T, mulberry32) {
  const r = mulberry32(79), out = [];
  const n1 = 60, a = T.l03 + 0.05, b = T.l04 - 0.62;
  for (let i = 0; i < n1; i++) out.push({ land: a + (b - a) * Math.pow((i + 0.5) / n1, 0.85) + (r() - 0.5) * 0.04, wave: 0, seed: r() });
  const c0 = T.l04 - 0.45, c1 = T.l04 - 0.2;
  for (let i = 0; i < 12; i++) out.push({ land: c0 + (c1 - c0) * (i / 11), wave: 1, seed: r() });
  out.sort((p, q) => p.land - q.land);
  const slots = [];
  HUMAN_ROWS.forEach((n, ri) => { const order = [...Array(n).keys()].sort((p, q) => Math.abs(p - (n - 1) / 2) - Math.abs(q - (n - 1) / 2)); for (const j of order) slots.push([(j - (n - 1) / 2) * 24, 30 - ri * 30]); });
  out.forEach((h, i) => { h.slot = [slots[i][0] + (h.seed - 0.5) * 6, slots[i][1]]; });
  return out;
}
// çuvallar: her biri 60 Mt (sonuncusu yarım, 30 Mt); l04'ün kelimelerine kilitli
function sackPlan(T) {
  const w = (id, k) => T.w(id, k);
  const t = [T.l04 + 0.15, w('l04', 1) + 0.05, w('l04', 2) + 0.05, w('l04', 3) + 0.05, w('l04', 4) + 0.05, w('l04', 6) + 0.02];
  const pos = [[-52, -262], [52, -262], [-52, -334], [52, -334], [0, -406], [0, -468]];
  return t.map((land, i) => ({ land, half: i === 5, slot: pos[i] }));
}

export function hero(T) { return T.l04 - 0.17; }

export function cues(T) {
  const A = animalPlan(T), S = sackPlan(T);
  return {
    tick: A.filter((_, i) => ![4, 5, 6].includes(i)).map(a => a.land),
    thock: [...A.filter((_, i) => [4, 5, 6].includes(i)).map(a => a.land), ...S.map(s => s.land)],
    scratch: [[T.l03 + 0.05, T.l04 - 0.62, 0.022], [T.l04 - 0.47, T.l04 - 0.2, 0.04]],
    riser: [T.l03 + 0.6, T.l04 - 0.2],
    silence: [T.l03end + 0.08, T.l04 - 0.17],
    impact: T.l04 - 0.17,
    whip: [[T.loop0 - 1.0, T.loop0 - 0.55]],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const AN = animalPlan(T), HU = humanPlan(T, mulberry32), SA = sackPlan(T);
  const dump0 = T.loop0 - 1.0, dump1 = T.loop0 - 0.2;
  const loopT = t => (t >= T.loop0 ? t - D : t);

  // terazi açısı (rad, + sol kefe aşağı)
  const dA = -0.22 / AN.length, dH = 0.25 / 60, dW = (STOP + 0.08 - 0.03) / 12;
  const rawAngle = t => {
    let a = 0;
    for (const h of AN) a += dA * step(t - h.land, 7);
    for (const h of HU) a += (h.wave ? dW : dH) * step(t - h.land, h.wave ? 11 : 6);
    return a;
  };
  let hit = T.l04;
  for (let t = T.l04 - 0.6; t < T.l04 + 0.8; t += 1 / 600) if (rawAngle(t) >= STOP) { hit = t; break; }
  const angle = t => {
    let a = Math.min(STOP, rawAngle(t));
    if (t > T.l03end && t < hit) a += 0.006 * Math.sin((t - T.l03end) * 23) * seg(t, T.l03end, 0.4);   // gerilim: kol gıcırdar
    for (const s of SA) a -= (STOP / 5.5) * (s.half ? 0.5 : 1) * step(t - s.land, 8);   // her çuval 60 Mt geri getirir
    return a * (1 - ease.state(seg(t, dump0, dump1 - dump0)));
  };
  const panAt = (side, a) => { const s = side === 'L' ? -1 : 1; return [PIV[0] + s * ARM * Math.cos(a), PIV[1] - s * ARM * Math.sin(a) + STR]; };
  const tip = t => Math.sin(Math.PI * seg(t, dump0 + 0.08, dump1 - dump0 - 0.08)) * 1.05;
  const rightMass = t => 60 + SA.reduce((m, s) => m + (t >= s.land ? (s.half ? 30 : 60) : 0), 0);

  // ——— figürler ———
  const SK = ['#F2C9A5', '#D9A27A', '#B8805A', '#8A5A3A'], CL = ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E', '#7A4E8A', '#D8722E', '#3F7F86', '#F4EFE3'];
  const person = (x, y, seed) => {
    const r = mulberry32(Math.floor(seed * 1e6)), c = CL[Math.floor(r() * CL.length)], s = SK[Math.floor(r() * SK.length)];
    rect(x - 10, y - 28, 20, 26, c, 3.5, 8); circ(x, y - 36, 9, s, 3.5);
  };
  const GREY = '#9AA0A6';
  const animal = (kind, x, y, k = 0.8, flip = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k * flip, k); const lw = LW / k * 0.8;
    if (kind === 'fil') {
      for (const lx of [-36, -14, 16, 36]) rect(lx - 9, -40, 18, 40, '#868C92', lw, 6);
      ell(0, -54, 56, 36, GREY, lw);
      ctx.beginPath(); ctx.moveTo(62, -54); ctx.quadraticCurveTo(84, -20, 70, 2); ctx.lineWidth = 16; ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 16 - lw * 2; ctx.strokeStyle = GREY; ctx.stroke();
      circ(52, -66, 26, GREY, lw); ell(34, -62, 18, 26, '#868C92', lw); circ(60, -72, 3.5, PAL.ink, 0);
    } else if (kind === 'balina') {
      poly([[-62, -30], [-96, -60], [-88, -30], [-98, -2]], '#4E6E88', lw);
      ell(0, -32, 72, 30, '#5E7C96', lw); ell(8, -20, 54, 12, '#C9D6DE', 0); circ(44, -38, 3.5, PAL.ink, 0);
      line(30, -16, 58, -18, lw * 0.6);
    } else if (kind === 'geyik') {
      for (const lx of [-26, -12, 14, 28]) rect(lx - 4, -44, 8, 44, '#8E5E36', lw * 0.7, 3);
      ell(0, -56, 40, 20, '#B07A48', lw); rect(26, -96, 14, 40, '#B07A48', lw * 0.8, 6);
      ell(42, -100, 18, 12, '#B07A48', lw); circ(46, -104, 3, PAL.ink, 0);
      line(34, -110, 22, -140, lw * 0.7); line(26, -128, 14, -132, lw * 0.6); line(44, -110, 54, -140, lw * 0.7); line(50, -128, 62, -130, lw * 0.6);
    } else if (kind === 'ayi') {
      for (const lx of [-30, 26]) rect(lx - 12, -34, 24, 34, '#55392A', lw, 9);
      ell(0, -46, 50, 32, '#6A4A32', lw); circ(46, -60, 22, '#6A4A32', lw); circ(38, -80, 8, '#6A4A32', lw); circ(54, -80, 8, '#6A4A32', lw);
      ell(60, -54, 10, 8, '#C9A27A', 0); circ(64, -56, 3, PAL.ink, 0); circ(46, -66, 3, PAL.ink, 0);
    } else {
      for (const lx of [-30, -12, 16, 30]) rect(lx - 6, -38, 12, 38, '#C08A33', lw * 0.7, 5);
      ell(-50, -54, 6, 18, '#C08A33', lw * 0.6, 0.6);
      ell(-2, -48, 46, 24, '#D9A441', lw); circ(44, -64, 30, '#A8662E', lw); circ(46, -62, 19, '#D9A441', lw); circ(52, -66, 3, PAL.ink, 0);
    }
    ctx.restore();
  };
  // çuval: bütün vahşi memelilerin bir kopyası (60 Mt); ağzından balina kuyruğu ve geyik boynuzu görünür
  const sack = (x, y, half) => {
    const k = half ? 0.62 : 1; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const lw = LW / k * 0.85;
    poly([[-28, -86], [-40, -112], [-14, -100]], '#4E6E88', lw);
    line(20, -92, 30, -122, lw * 0.8); line(26, -108, 38, -112, lw * 0.6);
    ell(0, -42, 52, 44, '#D9C7A0', lw);
    poly([[-20, -82], [20, -82], [12, -94], [-12, -94]], '#C7B285', lw * 0.8);
    for (const dx of [-30, 0, 30]) line(dx, -78, dx * 0.6, -6, 2.5, '#A99467');
    ctx.restore();
    text(half ? '30' : '60', x, y - 30 * k, half ? 26 : 34, PAL.ink, 'Archivo', 800);
  };

  // ——— terazi ———
  const BRASS = '#C9A23A', BRASS_D = '#A9842A';
  const bowl = (cx, cy, part, label, tilt = 0) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    if (part === 'back') ell(0, 0, 130, 20, BRASS_D, LW);
    else {
      poly([[-130, 0], [-102, 74], [102, 74], [130, 0]], BRASS, LW);
      ell(0, 0, 130, 20, null, LW);
      if (label.length > 1) label.forEach((s, i) => text(s, 0, 42 + i * 29, 30, PAL.ink, 'Archivo', 800));
      else text(label[0], 0, 58, 38, PAL.ink, 'Archivo', 800);
    }
    ctx.restore();
  };
  const scale = a => {
    poly([[450, GY], [478, GY - 46], [602, GY - 46], [630, GY]], '#8C6A42', LW);
    rect(522, PIV[1] + 10, 36, GY - 56 - PIV[1], '#A87A4E', LW, 6);
    ctx.save(); ctx.translate(PIV[0], PIV[1]); ctx.rotate(-a);
    rect(-ARM - 14, -13, 2 * ARM + 28, 26, '#B08A54', LW, 13);
    circ(-ARM, 0, 12, BRASS, LW); circ(ARM, 0, 12, BRASS, LW);
    ctx.restore();
    poly([[PIV[0], PIV[1] - 70], [PIV[0] - 14, PIV[1] - 10], [PIV[0] + 14, PIV[1] - 10]], PAL.red, LW * 0.8);
    circ(PIV[0], PIV[1], 20, BRASS, LW);
  };
  const strings = (side, a, pc, tilt) => {
    const s = side === 'L' ? -1 : 1, ex = PIV[0] + s * ARM * Math.cos(a), ey = PIV[1] - s * ARM * Math.sin(a), lean = Math.sin(tilt) * 22;
    line(ex, ey, pc[0] - 122, pc[1] - lean, 4); line(ex, ey, pc[0] + 122, pc[1] - lean, 4);
  };
  // düşen ya da yerleşmiş öğe (kefeyle birlikte); boşaltmada yerçekimiyle kadrajdan düşer
  const place = (t, it, pc, side, fall = 0.55, from = -260) => {
    const ts = it.land - fall; if (t < ts) return null;
    const tx = pc[0] + it.slot[0], ty = pc[1] + it.slot[1];
    if (t < it.land) { const u = (t - ts) / fall; return [tx, lerp(from, ty, u * u)]; }
    if (t > dump0 + 0.22) { const d = t - dump0 - 0.22; return [tx + (side === 'L' ? -1 : 1) * d * 70, ty + 6400 * d * d + d * 160]; }
    return [tx, ty];
  };

  // çuval: sağ kenarın dışından yay çizerek atılır (etiketlerin altından geçer)
  const throwIn = (t, it, pc) => {
    const d = 0.5, ts = it.land - d; if (t < ts) return null;
    const tx = pc[0] + it.slot[0], ty = pc[1] + it.slot[1];
    if (t < it.land) { const u = (t - ts) / d; return [lerp(1260, tx, u), lerp(600, ty, u) - 260 * u * (1 - u)]; }
    if (t > dump0 + 0.22) { const q = t - dump0 - 0.22; return [tx + q * 70, ty + 6400 * q * q + q * 160]; }
    return [tx, ty];
  };
  // insanlar: sol kenarın dışından yay çizerek akar (sayaç yazısının altından geçer)
  const pourIn = (t, it, pc) => {
    const d = 0.6, ts = it.land - d; if (t < ts) return null;
    const tx = pc[0] + it.slot[0], ty = pc[1] + it.slot[1];
    if (t < it.land) { const u = (t - ts) / d; return [lerp(-180 - it.seed * 80, tx, u), lerp(640 + it.seed * 60, ty, u) - 300 * u * (1 - u)]; }
    if (t > dump0 + 0.22) { const q = t - dump0 - 0.22; return [tx - q * 70, ty + 6400 * q * q + q * 160]; }
    return [tx, ty];
  };
  // sol sayaç: insanlar yağarken 0 → 60 (terazi dengeye gelir), son dalgada 60 → 390
  let tLevel = T.l04 - 0.6;
  for (let t = T.l03; t < T.l04; t += 1 / 300) if (rawAngle(t) >= 0) { tLevel = t; break; }
  const landed = t => HU.reduce((n, h) => n + (t >= h.land ? 1 : 0), 0);
  const nLevel = Math.max(1, landed(tLevel));
  const leftMass = t => { const n = landed(t); if (t >= hit) return 390; if (n <= nLevel) return Math.round(60 * n / nLevel); return Math.min(390, Math.round(60 + 330 * (n - nLevel) / (HU.length - nLevel))); };

  const draw = t0 => {
    const t = loopT(t0);
    bg('#EFE6D2');
    rect(-600, GY, 2280, 1200, '#DCCFB2', 0); line(-600, GY, 1680, GY, LW);
    const a = angle(t), pl = panAt('L', a), pr = panAt('R', a), tp = tip(t);
    scale(a);
    strings('L', a, pl, tp); strings('R', a, pr, tp);
    bowl(pl[0], pl[1], 'back', null, tp); bowl(pr[0], pr[1], 'back', null, -tp);
    for (const h of AN) { const p = place(t, h, pr, 'R', h.fall || 0.6, h.from ?? -260); if (p) animal(h.kind, p[0], p[1], h.k, h.flip ?? (h.kind === 'balina' ? 1 : (h.slot[0] > 0 ? -1 : 1))); }
    for (const s of SA) { const p = throwIn(t, s, pr); if (p) sack(p[0], p[1], s.half); }
    for (const h of HU) { const p = pourIn(t, h, pl); if (p) person(p[0], p[1], h.seed); }
    bowl(pl[0], pl[1], 'front', ['İNSANLAR'], tp); bowl(pr[0], pr[1], 'front', ['VAHŞİ', 'MEMELİLER'], -tp);
    const f = seg(t, w('l05', 4) - 0.25, 1.3);
    if (f > 0 && f < 1) { const u = ease.state(f); plane(lerp(40, 1200, u), lerp(1120, 460, u) - Math.sin(u * Math.PI) * 90, 1.25, -0.5 + 0.2 * u); }
  };

  // ekran sabiti kütle etiketleri: sol 390 (TAK'ta), sağ 60 → 390 (çuvallarla); okunurken yerinde durur
  const overlay = (t0, c) => {
    const t = loopT(t0);
    const out = ease.exit(seg(t, T.l05 + 0.2, 0.3));
    const tag = (x, y, big, k, col) => {
      if (k <= 0 || out >= 1) return;
      c.save(); c.globalAlpha = 1 - out; c.beginPath(); c.rect(x - 230, y - 95, 460, 160); c.clip();
      const dy = (1 - k) * 30; c.lineJoin = 'round'; c.textAlign = 'center';
      c.font = '800 80px Archivo'; c.lineWidth = 16; c.strokeStyle = '#FBF7EE'; c.strokeText(big, x, y + dy); c.fillStyle = col; c.fillText(big, x, y + dy);
      c.font = '700 40px Archivo'; c.lineWidth = 10; c.strokeText('milyon ton', x, y + 50 + dy); c.fillStyle = PAL.ink; c.fillText('milyon ton', x, y + 50 + dy);
      c.restore(); c.textAlign = 'left';
    };
    tag(785, 345, String(rightMass(t)), ease.enter(seg(t, Math.max(AN[6].land + 0.15, T.l01end + 0.5), 0.35)), PAL.ink);
    tag(300, 345, String(leftMass(t)), ease.enter(seg(t, T.l03 + 0.15, 0.35)), t >= hit ? PAL.red : PAL.ink);
    const k = ease.enter(seg(t, w('l04', 5) - 0.05, 0.35));
    if (k > 0 && out < 1) {
      c.save(); c.globalAlpha = 1 - out; c.textAlign = 'center'; c.lineJoin = 'round';
      c.font = '800 112px Archivo'; c.lineWidth = 18; c.strokeStyle = '#FBF7EE'; const y = 525 + (1 - k) * 30;
      c.strokeText('6,5 kat', 495, y); c.fillStyle = PAL.red; c.fillText('6,5 kat', 495, y);
      c.restore(); c.textAlign = 'left';
    }
  };

  return {
    open: true, capSize: 76, capBase: 1420,
    title: ['Hangisi', 'ağır basar?'], kicker: 'TAHMİN ET',
    cam: [[0, 1.12, 580, 860], [AN[3].land, 1.12, 580, 860], [T.l02end, 1.1, 540, 880], [T.l04 - 0.25, 1.16, 500, 900], [hit + 0.5, 1.1, 540, 880], [T.l05 - 0.05, 1.1, 560, 860], [T.l05 + 0.6, 1.14, 540, 870], [T.loop0 - 1.05, 1.14, 540, 870], [D, 1.12, 580, 860]],
    chunks: { l01: [['Bir kefede dünyadaki bütün vahşi memeliler var:', 0], ['filler, balinalar, geyikler.', 7]], l02: [['Bunlar kesin ağır basar.', 0]], l03: [['Öbür kefeye bütün insanları koyuyoruz.', 0]], l04: [['Teraziyi dengelemek için', 0], ['vahşi memelilerin altı buçuk katı gerekiyor.', 3]], l05: [['Bunu hayvanları seven birine gönder.', 0]] },
    overlay,
    draw,
  };
}

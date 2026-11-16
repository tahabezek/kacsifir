// № 079 · Hangisi ağır basar? (pilot, yeni iskelet: "tahmin et", tek plan, kutusuz altyazı). Senaryo: research/pilot/079.md
// Tek sabit sahne: dev bir terazi. Sağ kefeye bütün vahşi memeliler dökülür (filler, balinalar, geyikler kelimelerine
// kilitli), terazi sağa yatar; sol kefeye bütün insanlar yağar, terazi yavaşça dengeye gelir, sessizlik, son dalga
// ve TAK: sol kefe dayanağa çarpar. Kütleler Greenspoon ve ark. 2023 (PNAS): insan ≈ 390 Mt, vahşi memeli ≈ 60 Mt.
// Terazinin açısı her iniş için kapalı formüllü (kritik sönümlü) bir adımın toplamıdır: önceki kareler simüle edilmez.
// Döngü: kapanışta kefeler öne devrilip boşalır, terazi dengeye döner; son kare = ilk kare.

const PIV = [540, 790], ARM = 300, STR = 230, STOP = 0.3;
const HUMAN_ROWS = [10, 10, 9, 9, 8, 8, 7, 6, 5, 4, 3, 2];
const ANIMAL_ROWS = [3, 3, 3, 2, 2, 1];
const FALL = 0.55;
const step = (tau, w) => (tau <= 0 ? 0 : 1 - (1 + w * tau) * Math.exp(-w * tau));   // kritik sönümlü adım yanıtı

// iniş planı: hayvanlar (sağ) ve insanlar (sol); hepsi T'den, ses ve görüntü aynı takvimden
function plan(T, mulberry32) {
  const w = (id, k) => T.w(id, k);
  const r = mulberry32(79);
  // hayvanlar: ilk ikisi kare 0'da havada; filler / balinalar / geyikler kendi kelimelerine iner
  const kinds = ['fil', 'balina', 'geyik', 'ayi', 'aslan'];
  const aT = [0.18, 0.95, 1.5, 2.0, 2.45, w('l01', 7) + 0.02, w('l01', 8) + 0.02, w('l01', 9) + 0.02, 4.75, 5.2, 5.6, 6.0, 6.35, 6.65];
  const aKind = ['balina', 'ayi', 'aslan', 'geyik', 'ayi', 'fil', 'balina', 'geyik', 'aslan', 'fil', 'geyik', 'ayi', 'balina', 'aslan'];
  const animals = aT.map((land, i) => ({ land, kind: aKind[i] || kinds[i % 5], seed: r() }));
  // insanlar: l03 boyunca yağmur (69 kişi), sessizlikte seyrek, l04 hemen önce son dalga (12 kişi)
  const humans = [];
  const n1 = 69, a = T.l03 + 0.05, b = T.l04 - 0.62;
  for (let i = 0; i < n1; i++) humans.push({ land: a + (b - a) * Math.pow((i + 0.5) / n1, 0.85) + (r() - 0.5) * 0.04, wave: 0, seed: r() });
  const c0 = T.l04 - 0.42, c1 = T.l04 - 0.2;
  for (let i = 0; i < 12; i++) humans.push({ land: c0 + (c1 - c0) * (i / 11), wave: 1, seed: r() });
  humans.sort((p, q) => p.land - q.land);
  animals.sort((p, q) => p.land - q.land);
  // yuvalar: alttan üste, ortadan dışa (yığın)
  const slots = (rows, dx, dy, y0) => {
    const out = [];
    rows.forEach((n, ri) => { const order = [...Array(n).keys()].sort((p, q) => Math.abs(p - (n - 1) / 2) - Math.abs(q - (n - 1) / 2)); for (const j of order) out.push([(j - (n - 1) / 2) * dx, y0 - ri * dy]); });
    return out;
  };
  const hs = slots(HUMAN_ROWS, 26, 30, 26), as = slots(ANIMAL_ROWS, 86, 50, 26);
  humans.forEach((h, i) => { h.slot = hs[i]; h.slot[0] += (h.seed - 0.5) * 6; });
  animals.forEach((h, i) => { h.slot = as[i]; });
  return { animals, humans };
}

export function hero(T) { return T.l04 - 0.15; }

export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    tick: [0.18, 0.95, 1.5, 2.0, 2.45, 4.75, 5.2, 5.6, 6.0, 6.35, 6.65],
    thock: [w('l01', 7) + 0.02, w('l01', 8) + 0.02, w('l01', 9) + 0.02],
    scratch: [[T.l03 + 0.05, T.l04 - 0.62, 0.022], [T.l04 - 0.44, T.l04 - 0.2, 0.04]],
    riser: [T.l03 + 0.6, T.l04 - 0.2],
    silence: [T.l03end + 0.08, T.l04 - 0.17],
    impact: T.l04 - 0.17,
    whip: [[T.loop0 - 1.05, T.loop0 - 0.6]],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const P = plan(T, mulberry32);
  const GY = 1270;
  const dump0 = T.loop0 - 1.05, dump1 = T.loop0 - 0.15;
  const loopT = t => (t >= T.loop0 ? t - D : t);

  // terazi açısı (rad, + sol kefe aşağı): her iniş bir adım; son dalga dayanağa (STOP) çarpar
  const dA = -0.2 / P.animals.length, dH = 0.24 / 69, dW = (0.4 - 0.04) / 12;
  const rawAngle = t => {
    let a = 0;
    for (const h of P.animals) a += dA * step(t - h.land, 7);
    for (const h of P.humans) a += (h.wave ? dW : dH) * step(t - h.land, h.wave ? 14 : 6);
    return a;
  };
  // çarpma anı (yükleme sırasında bir kez, sabit adımla): ses ve görüntü aynı anı kullanır
  let hit = T.l04;
  for (let t = T.l04 - 0.5; t < T.l04 + 0.6; t += 1 / 600) if (rawAngle(t) >= STOP) { hit = t; break; }
  const angle = t => {
    let a = Math.min(STOP, rawAngle(t));
    if (t > T.l03end && t < hit) a += 0.006 * Math.sin((t - T.l03end) * 23) * seg(t, T.l03end, 0.4);   // gerilim: kol gıcırdar
    return a * (1 - ease.state(seg(t, dump0, dump1 - dump0)));
  };
  // kefe merkezi (ağız çizgisi); kol uçlarından sarkar, hep yatay
  const panAt = (side, a) => { const s = side === 'L' ? -1 : 1; return [PIV[0] + s * ARM * Math.cos(a), PIV[1] - s * ARM * Math.sin(a) + STR]; };
  const tip = t => Math.sin(Math.PI * seg(t, dump0 + 0.1, dump1 - dump0 - 0.1)) * 1.05;   // boşaltma: kefe öne devrilir

  // ——— figürler ———
  const SK = ['#F2C9A5', '#D9A27A', '#B8805A', '#8A5A3A'], CL = ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E', '#7A4E8A', '#D8722E', '#3F7F86', '#F4EFE3'];
  const person = (x, y, seed) => {
    const r = mulberry32(Math.floor(seed * 1e6)), c = CL[Math.floor(r() * CL.length)], s = SK[Math.floor(r() * SK.length)];
    rect(x - 10, y - 28, 20, 26, c, 3.5, 8); circ(x, y - 36, 9, s, 3.5);
  };
  const GREY = '#9AA0A6';
  const animal = (kind, x, y, k = 0.78, flip = 1) => {
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
    } else {   // aslan
      for (const lx of [-30, -12, 16, 30]) rect(lx - 6, -38, 12, 38, '#C08A33', lw * 0.7, 5);
      ell(-50, -54, 6, 18, '#C08A33', lw * 0.6, 0.6);
      ell(-2, -48, 46, 24, '#D9A441', lw); circ(44, -64, 30, '#A8662E', lw); circ(46, -62, 19, '#D9A441', lw); circ(52, -66, 3, PAL.ink, 0);
    }
    ctx.restore();
  };

  // ——— terazi parçaları ———
  const PLATE = '#F6F1E4', BRASS = '#C9A23A', BRASS_D = '#A9842A';
  const bowl = (cx, cy, part, label, tilt = 0) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    if (part === 'back') ell(0, 0, 150, 22, BRASS_D, LW);
    else {
      poly([[-150, 0], [-118, 78], [118, 78], [150, 0]], BRASS, LW);
      ell(0, 0, 150, 22, null, LW);
      if (label.length > 1) label.forEach((s, i) => text(s, 0, 47 + i * 25, 26, PAL.ink, 'IBM Plex Mono', 700));
      else text(label[0], 0, 60, 32, PAL.ink, 'IBM Plex Mono', 700);
    }
    ctx.restore();
  };
  const scale = (t, a) => {
    // gövde ve taban
    poly([[440, GY], [470, GY - 50], [610, GY - 50], [640, GY]], '#8C6A42', LW);
    rect(522, PIV[1] + 10, 36, GY - 60 - PIV[1], '#A87A4E', LW, 6);
    // kol
    ctx.save(); ctx.translate(PIV[0], PIV[1]); ctx.rotate(-a);
    rect(-ARM - 14, -13, 2 * ARM + 28, 26, '#B08A54', LW, 13);
    circ(-ARM, 0, 12, BRASS, LW); circ(ARM, 0, 12, BRASS, LW);
    ctx.restore();
    poly([[PIV[0], PIV[1] - 70], [PIV[0] - 14, PIV[1] - 10], [PIV[0] + 14, PIV[1] - 10]], '#C2412F', LW * 0.8);   // ibre
    circ(PIV[0], PIV[1], 20, BRASS, LW);
  };
  const strings = (side, a, pc, tilt) => {
    const s = side === 'L' ? -1 : 1, ex = PIV[0] + s * ARM * Math.cos(a), ey = PIV[1] - s * ARM * Math.sin(a);
    const lean = Math.sin(tilt) * 22;
    line(ex, ey, pc[0] - 140, pc[1] - lean, 4); line(ex, ey, pc[0] + 140, pc[1] - lean, 4);
  };

  // tek düşen ya da yerleşmiş öğe: kefeyle birlikte hareket eder; boşaltmada yerçekimiyle kadrajdan düşer
  const place = (t, it, pc, side) => {
    const ts = it.land - FALL; if (t < ts) return null;
    const tx = pc[0] + it.slot[0], ty = pc[1] + it.slot[1];
    if (t < it.land) { const u = (t - ts) / FALL, x0 = tx + (it.seed - 0.5) * 60; return [lerp(x0, tx, u), lerp(-160, ty, u * u)]; }
    if (t > dump0 + 0.25) { const d = t - dump0 - 0.25; return [tx + (side === 'L' ? -1 : 1) * d * 60 * (0.5 + it.seed), ty + 6400 * d * d + d * 160]; }
    return [tx, ty];
  };

  const SPEC = {};
  const draw = t0 => {
    const t = loopT(t0);
    bg('#EFE6D2');
    rect(-600, GY, 2280, 900, '#DCCFB2', 0); line(-600, GY, 1680, GY, LW);
    const a = angle(t), pl = panAt('L', a), pr = panAt('R', a), tp = tip(t);
    scale(t, a);
    strings('L', a, pl, tp); strings('R', a, pr, tp);
    bowl(pl[0], pl[1], 'back', null, tp); bowl(pr[0], pr[1], 'back', null, -tp);
    for (const h of P.animals) { const p = place(t, h, pr, 'R'); if (p) animal(h.kind, p[0], p[1], 0.74, h.seed > 0.5 ? 1 : -1); }
    for (const h of P.humans) { const p = place(t, h, pl, 'L'); if (p) person(p[0], p[1], h.seed); }
    bowl(pl[0], pl[1], 'front', ['İNSANLAR'], tp); bowl(pr[0] - 10, pr[1], 'front', ['VAHŞİ', 'MEMELİLER'], -tp);
    // l05: kütleler, yığınların üstünde (okunurken hareket etmez: terazi o sırada durgun)
    const kL = ease.enter(seg(t, w('l05', 7) - 0.06, 0.35)), kR = ease.enter(seg(t, w('l05', 3) - 0.06, 0.35)), out = ease.exit(seg(t, T.l06 + 0.6, 0.3));
    const tag = (x, y, big, k) => { if (k <= 0 || out >= 1) return; ctx.save(); ctx.globalAlpha = 1 - out; const dy = (1 - k) * 24; ctx.beginPath(); ctx.rect(x - 200, y - 90 + dy * 0, 400, 150); ctx.clip();
      ctx.lineJoin = 'round'; ctx.font = '800 76px Archivo'; ctx.textAlign = 'center'; ctx.lineWidth = 15; ctx.strokeStyle = '#FBF7EE'; ctx.strokeText(big, x, y + dy); ctx.fillStyle = PAL.red; ctx.fillText(big, x, y + dy);
      ctx.font = '700 40px Archivo'; ctx.lineWidth = 10; ctx.strokeText('milyon ton', x, y + 48 + dy); ctx.fillStyle = PAL.ink; ctx.fillText('milyon ton', x, y + 48 + dy); ctx.restore(); ctx.textAlign = 'left'; };
    tag(pl[0], pl[1] - 480, '390', kL); tag(pr[0] - 50, pr[1] - 400, '60', kR);
    // l06: gönder (kâğıt uçak sol alttan sağ üste)
    const f = seg(t, w('l06', 4) - 0.2, 1.3);
    if (f > 0 && f < 1) { const u = ease.state(f); plane(lerp(40, 1200, u), lerp(1180, 520, u) - Math.sin(u * Math.PI) * 90, 1.25, -0.5 + 0.2 * u); }
  };

  return {
    open: true, capSize: 76, capBase: 1410,
    title: ['Hangisi', 'ağır basar?'], kicker: 'TAHMİN ET',
    cam: [[0, 1.12, 540, 990], [T.l03, 1.14, 540, 985], [T.l04 - 0.2, 1.2, 532, 1000], [T.l05, 1.13, 540, 990], [T.l06 - 0.3, 1.2, 540, 960], [T.l06 + 1.6, 1.12, 540, 990], [D, 1.12, 540, 990]],
    numbers: [[w('l04', 1) - 0.04, T.l05 - 0.15, '6,5 kat', 'insanlar daha ağır', 470, 170]],
    draw,
  };
}

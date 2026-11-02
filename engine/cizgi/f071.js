// № 071 · Annenle kaç gün kaldı (çizgi motoru, "Senin sayın" serisi, sakin iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Görsel fikir: günler nokta. Çocuklukta 6.500 sıcak nokta; şimdi yılda 10 nokta; 20 yılda 200 nokta.
// Doruk: 6.500 noktalık tarla ile 200 noktalık küçük küme yan yana (öncesinde 0,5 sn sessizlik). Ton sıcak, korkutmaz.
// Kapanış: sen kardeşine kâğıt uçak yollar; ikisi annelerini arar. Sahneler 1400 px arayla; kamera [t, zoom, x, y].

const SX = 1400;
const CHILD_DAYS = 6500, LEFT = 200;
export function hero(T) { return T.w('l05', 16) + 0.1; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[w('l03', 5) - 0.25, w('l03', 5)], [w('l03', 15) - 0.25, w('l03', 15)], [w('l03', 22) - 0.25, w('l03', 22)], [T.l05 - 0.25, T.l05], [T.l06 - 0.25, T.l06], [w('l07', 12) - 0.25, w('l07', 12)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 26), w('l03', 27), w('l04', 0), w('l05', 8), w('l07', 6), w('l07', 17)],
    thock: [w('l03', 14), w('l03', 21)],
    scratch: [[w('l03', 9), w('l03', 14), 0.025], [w('l05', 11), hero(T) - 0.1, 0.02]],
    riser: [w('l05', 11), hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
// çocukluktaki sen: aynı hardal kapüşon, çocuk oranları
const KUCUK = base({
  key: 'kucuk', name: 'Küçük sen', seed: 711,
  head: { w: 0.96, h: 1, ear: 0.13 }, neck: 0.04,
  torso: { len: 0.6, shoulder: 0.56, hip: 0.48, depth: 0.38, belly: 0, color: '#E2A23A', shade: '#C4852A' },
  arm: { upper: 0.3, lower: 0.28, w: 0.17, color: '#E2A23A', shade: '#C4852A', hand: 0.12 },
  leg: { upper: 0.3, lower: 0.28, w: 0.19, color: '#34404E', shade: '#27303B' },
  shoe: { color: '#C2412F', len: 0.26, h: 0.11 },
  skin: '#EEC6A0', skinShade: '#D6A882', hair: '#2E221B',
  features: ['hoodie', 'hairMessy'],
});
// genç anne: aynı bordo hırka, koyu topuz (yıllar sonra kırlaşan saç: cards.js "anne")
const ANNE_GENC = base({
  key: 'anneGenc', name: 'Anne (genç)', seed: 712,
  torso: { len: 0.8, shoulder: 0.64, hip: 0.72, depth: 0.48, belly: 0.03, color: '#7A3A4A', shade: '#5E2C39' },
  arm: { upper: 0.37, lower: 0.35, w: 0.19, color: '#7A3A4A', shade: '#5E2C39', hand: 0.13 },
  leg: { upper: 0.37, lower: 0.35, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#3A2420', len: 0.27, h: 0.11 },
  skin: '#EBC29E', skinShade: '#D2A580', hair: '#3A261C',
  features: ['cardigan', 'skirt', 'bun'],
});
// kardeş: yeşil kazak, kısa saç
const KARDES = base({
  key: 'kardes', name: 'Kardeş', seed: 713,
  torso: { len: 0.78, shoulder: 0.62, hip: 0.56, depth: 0.42, belly: 0, color: '#2E6B6B', shade: '#235454' },
  arm: { upper: 0.38, lower: 0.36, w: 0.18, color: '#2E6B6B', shade: '#235454', hand: 0.13 },
  leg: { upper: 0.39, lower: 0.37, w: 0.2, color: '#3F3A48', shade: '#2E2A36' },
  shoe: { color: '#F4F1EA', len: 0.28, h: 0.11 },
  skin: '#EEC6A0', skinShade: '#D6A882', hair: '#2E221B',
  features: ['jacket', 'hairSpiky'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, AMBER = '#E2A23A', DOT_OFF = '#E6DCCB';

  // nokta tarlası: (x, y) sol üst, cols sütun, p aralık; n dolu nokta (kesirli olabilir), toplam tot; renk col
  const dots = (x, y, cols, p, n, tot, col = AMBER, off = DOT_OFF) => {
    const r = p * 0.34, full = Math.floor(n);
    for (let i = 0; i < tot; i++) {
      ctx.fillStyle = i < full ? col : off;
      ctx.fillRect(x + (i % cols) * p + (p / 2 - r), y + Math.floor(i / cols) * p + (p / 2 - r), r * 2, r * 2);
    }
  };
  const room = (wall = '#F1E4D2', floor = '#D9C5A6', GY = 1250) => { bg(wall); rect(-600, GY, 2300, 1400, floor, 0); line(-600, GY, 1700, GY, LW); };
  const tea = (x, y, k = 1) => {   // ince belli çay bardağı (masada)
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ell(0, 0, 34, 8, '#E8E2D4', 4);
    poly([[-20, -78], [-12, -40], [-17, -6], [17, -6], [12, -40], [20, -78]], '#B4521E', 4);
    rect(-20, -82, 40, 8, '#F2EBDD', 0);
    ctx.restore();
  };
  const heart = (x, y, k, col = RED) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(0, 34); ctx.bezierCurveTo(-60, -6, -30, -48, 0, -20); ctx.bezierCurveTo(30, -48, 60, -6, 0, 34); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = LW / k; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore(); };

  const scenes = [];
  // 0 · kapak ve kanca: mutfak masasında çay; duvarda günler panosu (6.500 sıcak nokta, sonunda küçük kırmızı küme)
  scenes[0] = t => {
    t = loopT(t);
    room('#F1E4D2', '#D9C5A6', 1300);
    // pano
    rect(170, 640, 740, 200, '#FFFFFF', LW, 6);
    dots(185, 650, 160, 4.4, CHILD_DAYS, CHILD_DAYS, AMBER);
    { const k0 = CHILD_DAYS, x0 = 185, y0 = 650; for (let i = 0; i < LEFT; i++) { const j = k0 + i; ctx.fillStyle = RED; ctx.fillRect(x0 + (j % 160) * 4.4 + 0.5, y0 + Math.floor(j / 160) * 4.4 + 0.5, 3.4, 3.4); } }
    // pencere
    rect(-200, 640, 260, 300, '#BFD6DC', LW, 6);
    const sas = t > T.l02 - 0.1 && t < T.l02end + 0.3;
    ch('sen', { x: 320, y: 1300, s: 168, expr: sas ? 'saskin' : 'mutlu', talk: talk(t, T.l02, T.l02end), armR: { sh: 20, el: 40 }, armL: { sh: 20, el: 40 }, head: { look: [0.5, 0], tilt: 3 } }, t);
    ch('anne', { x: 770, y: 1300, s: 168, expr: 'mutlu', props: { L: 'tea' }, armL: { sh: 30, el: 70 }, armR: { sh: 15, el: 30 }, head: { look: [-0.5, 0], tilt: -3 } }, t);
    // masa önde: bacakları saklar
    rect(60, 1150, 960, 36, '#A87A4E', LW, 8); rect(90, 1186, 900, 160, '#8A6440', LW, 4);
    tea(450, 1150, 1.25); tea(630, 1150, 1.25);
    ell(540, 1138, 74, 15, '#F4EFE3', 4); for (let i = 0; i < 3; i++) circ(510 + i * 30, 1123, 13, '#D9A27A', 4);   // simit tabağı
  };
  // 1 · çocukluk: küçük sen annesinin elini tutup yürür; ağaçlar geçer
  scenes[1] = t => {
    const GY = 1240;
    bg('#CFE3E3'); rect(-600, GY, 2300, 1400, '#9DBF7E', 0); line(-600, GY, 1700, GY, LW);
    const sc = (t * 120) % 360;
    for (let i = -1; i < 5; i++) { const x = 1100 - ((i * 360 + sc) % 1800) + 200; rect(x - 16, GY - 200, 32, 200, '#8A6440', LW); circ(x, GY - 250, 90, '#5E9A4E', LW); }
    const ph = (t * 1.7) % 1, sw = Math.sin(ph * Math.PI * 2);
    ch(ANNE_GENC, { x: 470, y: GY, s: 150, expr: 'mutlu', bob: Math.abs(sw) * 0.02, legL: { hip: 6 * sw, knee: 4 }, legR: { hip: -6 * sw, knee: 4 }, armR: { sh: 28, el: 8 }, armL: { sh: 8 + 6 * sw, el: -4 }, head: { look: [0.5, 0.3] } }, t);
    ch(KUCUK, { x: 690, y: GY, s: 110, expr: 'mutlu', bob: Math.abs(sw) * 0.03, legL: { hip: -8 * sw, knee: 6 }, legR: { hip: 8 * sw, knee: 6 }, armL: { sh: 62, el: -10 }, armR: { sh: 10 - 8 * sw, el: -4 }, head: { look: [-0.4, -0.5] } }, t);
  };
  // 2 · on sekiz yıl: 6.500 sıcak nokta satır satır dolar
  const FX = 180, FY = 560, FC = 120, FP = 6;   // 720 × 330
  scenes[2] = t => {
    room('#F4EADB', '#E1D3BB', 1250);
    rect(FX - 18, FY - 18, FC * FP + 36, Math.ceil(CHILD_DAYS / FC) * FP + 36, '#FFFFFF', LW, 6);
    const n = CHILD_DAYS * ease.state(seg(t, w('l03', 9) - 0.1, w('l03', 14) - w('l03', 9) + 0.3));
    dots(FX, FY, FC, FP, n, CHILD_DAYS, AMBER);
    // altta küçük ve büyüyen sen: noktalar doldukça boyu uzar
    const g = n / CHILD_DAYS;
    ch(g < 0.6 ? KUCUK : 'sen', { x: 300 + g * 480, y: 1250, s: lerp(80, 115, g), walk: (t * 1.4) % 1, facing: 1 }, t);
    ch(ANNE_GENC, { x: 170 + g * 480, y: 1250, s: 118, walk: (t * 1.4 + 0.5) % 1, facing: 1 }, t);
  };
  // 3 · ayrılış: otobüs durağı; sen bavulla gider, anne el sallar; "başka bir şehir"de otobüs kalkar
  scenes[3] = t => {
    const GY = 1260;
    bg('#DCE6E8'); rect(-600, GY, 2300, 1400, '#B8B0A0', 0); line(-600, GY, 1700, GY, LW);
    rect(-600, GY + 50, 2300, 20, '#9A9282', 0);
    const go = ease.enter(seg(t, w('l03', 20), 1.4));
    const bx = 560 + go * 900;
    ctx.save(); ctx.translate(bx, GY);
    rect(0, -300, 520, 260, '#C2412F', LW, 24); for (let i = 0; i < 4; i++) rect(30 + i * 120, -270, 96, 90, '#BFD6DC', 5, 8);
    rect(30, -150, 80, 110, '#9E3324', 5, 6); circ(110, -30, 38, '#2A2A2E', LW); circ(410, -30, 38, '#2A2A2E', LW);
    text('ŞEHİR', 260, -158, 46, '#F4EFE3');
    ctx.restore();
    const wave = Math.sin(t * 9) * 25;
    ch('anne', { x: 170, y: GY, s: 132, expr: go > 0.3 ? 'yorgun' : 'mutlu', armR: { sh: 150 + wave, el: 20 }, head: { look: [0.6, 0], tilt: 5 } }, t);
    if (go < 0.05) {
      ch('sen', { x: 470, y: GY, s: 132, expr: 'notr', armR: { sh: 12, el: 0 }, armL: { sh: 150 + wave * 0.6, el: 20 }, head: { look: [-0.6, 0] } }, t);
      rect(540, GY - 120, 90, 120, '#5E7FA0', LW, 10); rect(570, GY - 140, 30, 22, null, 5, 6);   // bavul
    } else {
      ctx.save(); ctx.translate(bx, GY); circ(150, -230, 34, '#EEC6A0', 4); ctx.restore();   // camda sen
    }
  };
  // 4 · takvim: 365 gri gün, yalnız 10'u (bayramlar, tatil) yanar
  const LIT = [[3, 20], [3, 21], [3, 22], [5, 26], [5, 27], [5, 28], [5, 29], [7, 12], [7, 13], [11, 30]];
  scenes[4] = t => {
    room('#F2ECDF', '#E2D6C0', 1330);
    const x0 = 122, y0 = 660, cp = 27;
    rect(x0 - 30, y0 - 30, 31 * cp + 60, 12 * cp + 60, '#FFFFFF', LW, 8);
    const md = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let m = 0; m < 12; m++) for (let d = 0; d < md[m]; d++) { ctx.fillStyle = '#DDD5C6'; ctx.fillRect(x0 + d * cp + 3, y0 + m * cp + 3, cp - 6, cp - 6); }
    const k = Math.floor(10 * seg(t, w('l03', 26) - 0.1, 0.6) + 0.001);
    LIT.slice(0, k).forEach(([m, d]) => { ctx.fillStyle = AMBER; ctx.fillRect(x0 + d * cp + 1, y0 + m * cp + 1, cp - 2, cp - 2); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.strokeRect(x0 + d * cp + 1, y0 + m * cp + 1, cp - 2, cp - 2); });
    if (k >= 10) { const u = ease.enter(seg(t, w('l03', 27), 0.4)); ctx.save(); ctx.globalAlpha = u; text('10 GÜN', 540, y0 - 56, 76, RED); ctx.restore(); }
    // bayram sofrası: sen elini öper (l04)
    if (t > T.l04 - 0.2) {
      const u = ease.enter(seg(t, T.l04 - 0.2, 0.5));
      ch('anne', { x: 640, y: 1330 + (1 - u) * 300, s: 112, expr: 'mutlu', armL: { sh: 40, el: 30 }, head: { look: [-0.5, 0] } }, t);
      ch('sen', { x: 440, y: 1330 + (1 - u) * 300, s: 112, expr: 'mutlu', lean: 10, armR: { sh: 55, el: 40 }, head: { look: [0.5, 0.2] } }, t);
    }
  };
  // 5 · annen 65: yanında 20 yıllık çubuk; her yıl 10 nokta düşer ve 200 nokta
  scenes[5] = t => {
    room('#F3E8DA', '#DCCBB0', 1290);
    ch('anne', { x: 220, y: 1290, s: 172, expr: 'mutlu', armR: { sh: 10, el: 30 }, head: { look: [0.6, 0] } }, t);
    const bx = 420, by = 720, bw = 580, seg20 = bw / 20;
    const bar = ease.enter(seg(t, w('l05', 8) - 0.1, 0.8));
    for (let i = 0; i < 20; i++) if (i < bar * 20) rect(bx + i * seg20 + 2, by, seg20 - 4, 80, i % 5 === 4 ? '#C9B08E' : '#E9DCC4', 4, 4);
    // her yıl için 10 nokta aşağı süzülür, 20 × 10 küme olur
    const drop = seg(t, w('l05', 13) - 0.1, hero(T) - w('l05', 13));
    if (drop > 0) for (let i = 0; i < 20; i++) for (let j = 0; j < 10; j++) {
      const u = ease.state(Math.min(1, Math.max(0, drop * 1.6 - i * 0.03)));
      const x = lerp(bx + i * seg20 + seg20 / 2, 560 + i * 18, u), y = lerp(by + 30, 960 + j * 18, u);
      ctx.fillStyle = t > hero(T) ? RED : AMBER; ctx.fillRect(x - 6, y - 6, 12, 12);
    }
    if (t > hero(T)) { const g = ease.enter(seg(t, hero(T), 0.4)); ctx.save(); ctx.globalAlpha = 0.25 * g; ctx.fillStyle = RED; ctx.beginPath(); ctx.roundRect(540, 940, 380, 200, 20); ctx.fill(); ctx.restore(); }
  };
  // 6 · karşılaştırma: 6.500 noktalık tarla ve 200 noktalık küme; l07'de küme büyür (o günler artırılabilir)
  scenes[6] = t => {
    room('#F4EADB', '#E1D3BB', 1330);
    const FX = 120, FY = 610, FP = 7;   // karşılaştırma tarlası: 840 × 385 (çocukluk sahnesinden büyük)
    rect(FX - 18, FY - 18, FC * FP + 36, Math.ceil(CHILD_DAYS / FC) * FP + 36, '#FFFFFF', LW, 6);
    dots(FX, FY, FC, FP, CHILD_DAYS, CHILD_DAYS, AMBER);
    text('6.500', FX + FC * FP / 2, FY + 230, 120, '#7A4E12');
    const more = Math.floor(200 * ease.state(seg(t, w('l07', 9) - 0.1, 1.4)));
    const cx = 700, cy = 1080, cp = 9;
    rect(cx - 14, cy - 14, 20 * cp + 28, 20 * cp + 28, '#FFFFFF', LW, 6);
    dots(cx, cy, 20, cp, LEFT + more, LEFT + more, RED);
    text(String(LEFT + more), cx - 130, cy + 110, 88, RED);
  };
  // 7 · gönder: sen telefonundan kardeşine kâğıt uçak; sonra ikisinin arasında anne arıyor balonu
  scenes[7] = t => {
    room('#F1E7D8', '#D9C7A9', 1240);
    const go = seg(t, w('l07', 12) - 0.1, 1.1), got = go >= 1;
    ch('sen', { x: 250, y: 1240, s: 150, facing: 1, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    ch(KARDES, { x: 840, y: 1240, s: 150, facing: -1, expr: got ? 'mutlu' : 'notr', props: got ? { L: 'phone' } : {}, armL: { sh: got ? 120 : 10, el: got ? 50 : -4 }, head: { look: [-0.6, 0] } }, t);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(330, 760, u), lerp(990, 980, u) - Math.sin(u * Math.PI) * 240, 0.9, lerp(-0.6, 0.5, u)); }
    // anne arama balonu: yuvarlak çerçevede anne yüzü, çalan telefon halkaları
    const ring = ease.enter(seg(t, w('l07', 17) - 0.1, 0.5));
    if (ring > 0) {
      const bx = 545, by = 690 + 8 * Math.sin(t * 2.4);
      ctx.save(); ctx.translate(bx, by); ctx.scale(ring, ring);
      circ(0, 0, 120, '#FBF3E6', LW);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 116, 0, 7); ctx.clip(); ch('anne', { x: 0, y: 250, s: 110, expr: 'mutlu', head: { look: [0, 0] } }, t); ctx.restore();
      for (let i = 0; i < 2; i++) { const a = (t * 1.4 + i * 0.5) % 1; ctx.globalAlpha = 1 - a; ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(0, 0, 130 + a * 50, -0.6, 0.6); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 130 + a * 50, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke(); }
      ctx.restore();
    } else if (got) plane(780, 1000, 0.7, 0.2);
    if (t > w('l07', 0) && t < w('l07', 12)) heart(545, 700 + 10 * Math.sin(t * 2), 1.5 + 0.08 * Math.sin(t * 5));
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.1, 540, 980, 0)],
    ...cut(T.l02 - 0.1, P(1.1, 540, 980, 0), P(2.0, 380, 980, 0)),
    [T.l02end + 0.1, ...P(2.1, 400, 975, 0)],
    ...cut(T.l03 - 0.1, P(2.1, 400, 975, 0), P(1.0, 560, 1000, 1)),
    [w('l03', 5) - 0.13, ...P(1.12, 580, 1000, 1)],
    ...cut(w('l03', 5) - 0.12, P(1.12, 580, 1000, 1), P(0.95, 540, 980, 2)),
    [w('l03', 14) + 0.2, ...P(1.0, 540, 960, 2)],
    ...cut(w('l03', 15) - 0.1, P(1.0, 540, 960, 2), P(1.0, 560, 1000, 3)),
    [w('l03', 22) - 0.13, ...P(0.95, 620, 1000, 3)],
    ...cut(w('l03', 22) - 0.12, P(0.95, 620, 1000, 3), P(1.0, 540, 960, 4)),
    [T.l03end + 0.1, ...P(1.05, 540, 950, 4)],
    [T.l04end + 0.2, ...P(1.12, 560, 1000, 4)],
    ...cut(T.l05 - 0.1, P(1.12, 560, 1000, 4), P(1.0, 560, 980, 5)),
    [w('l05', 13), ...P(1.02, 580, 970, 5)],
    [hero(T) + 0.2, ...P(1.25, 700, 980, 5)],
    [T.l06 - 0.13, ...P(1.3, 710, 985, 5)],
    ...cut(T.l06 - 0.12, P(1.3, 710, 985, 5), P(0.92, 540, 960, 6)),
    [T.l06end + 0.2, ...P(0.95, 540, 960, 6)],
    [w('l07', 12) - 0.13, ...P(1.0, 560, 980, 6)],
    ...cut(w('l07', 12) - 0.12, P(1.0, 560, 980, 6), P(1.0, 540, 930, 7)),
    [T.l07end + 0.2, ...P(1.06, 540, 910, 7)],
    [T.loop0 - 0.001, ...P(1.06, 540, 910, 7)],
    [T.loop0, ...P(1.05, 540, 975, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Annenle', 'kaç gün kaldı?'],
    kicker: 'SENİN SAYIN · AİLE',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(7, i))](t); ctx.restore();
    },
    names: [],
    numbers: [
      [w('l03', 9) - 0.1, w('l03', 15) - 0.2, t => Math.round(CHILD_DAYS * ease.state(seg(t, w('l03', 9) - 0.1, w('l03', 14) - w('l03', 9) + 0.3))), 'GÜN · 18 YAŞINA KADAR'],
      [w('l05', 4) - 0.1, w('l05', 11) - 0.15, '20 yıl', 'TÜİK · 65 YAŞINDAKİ KADIN'],
      [hero(T) - 0.05, T.l06 - 0.2, '200 gün', '20 YIL × 10 GÜN'],
    ],
  };
}

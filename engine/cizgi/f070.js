// № 070 · Ömrünün kaç yılı ekranda (çizgi motoru, "Senin sayın" serisi, sakin iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Görsel fikir: gecenin 02.47'sinde yatakta telefon ışığına gömülmüş sen. Bir haftanın 7 × 24 saatlik çizelgesinde
// ekran saatleri maviye boyanır; Türkiye ile dünya ortalaması karşılaştırılır. Doruk: 15–78,5 yaş ömür şeridindeki
// mavi çizgiler (her günün altı saati) toplanıp 16 yıllık tek bir bloğa döner, içinde 9 yıllık sosyal medya.
// Kapanış: sen telefonu masaya ters çevirir; telefon kendiliğinden bir kâğıt uçak yollar, ekrana gömülü arkadaş başını kaldırır.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
const WEEK_H = 41 + 37 / 60, WORLD_H = 33 + 27 / 60, DAY_H = WEEK_H / 7, SOC_H = (25 + 4 / 60) / 7;
const LIFE0 = 15, LIFE1 = 78.5, SCREEN_Y = (LIFE1 - LIFE0) * DAY_H / 24, SOC_Y = (LIFE1 - LIFE0) * SOC_H / 24;   // 15,7 ve 9,5 yıl
export function hero(T) { return T.w('l05', 13) + 0.15; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [w('l03', 14) - 0.25, w('l03', 14)], [T.l04 - 0.25, T.l04], [T.l05 - 0.25, T.l05], [w('l05', 4) - 0.25, w('l05', 4)], [T.l06 - 0.25, T.l06], [T.l07 - 0.25, T.l07], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 9), w('l03', 14), w('l03', 17), w('l05', 15), w('l07', 6), w('l07', 7)],
    thock: [w('l07', 6) + 0.25],
    scratch: [[w('l03', 2), w('l03', 7) + 0.3, 0.02]],
    riser: [w('l05', 9) - 0.6, hero(T) - 0.05],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const ARKADAS = {
  key: 'arkadas2', name: 'Arkadaş', seed: 701,
  head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.4, 5.0] },
  torso: { len: 0.8, shoulder: 0.64, hip: 0.56, depth: 0.42, belly: 0.04, color: '#5E9A4E', shade: '#4C8240' },
  arm: { upper: 0.39, lower: 0.37, w: 0.18, color: '#5E9A4E', shade: '#4C8240', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#1E1E1E', len: 0.28, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#2A211C',
  features: ['vest', 'hairSpiky'],
};

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, poly, rect, circ, ell, line, text, bg, ch, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, BLUE = '#4A86C8', BLUE_L = '#9CC3EA', PINK = '#E06A8C', NIGHT = '#1F2A3C';

  const room = (wall, floor, GY) => { bg(wall); rect(-600, GY, 2300, 1400, floor, 0); line(-600, GY, 1700, GY, LW); };
  const glow = (x, y, r, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(196,226,255,${a})`); g.addColorStop(1, 'rgba(196,226,255,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  // telefon (büyük, elde değil): merkez (x, y), boy h; ekran içeriği cb(x0, y0, w, h)
  const bigPhone = (x, y, h, cb) => {
    const wd = h * 0.52;
    rect(x - wd / 2, y - h / 2, wd, h, '#2B2F33', LW, h * 0.08);
    const sx = x - wd / 2 + wd * 0.07, sy = y - h / 2 + h * 0.06, sw = wd * 0.86, sh = h * 0.88;
    ctx.save(); ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, h * 0.04); ctx.clip(); cb(sx, sy, sw, sh); ctx.restore();
  };
  // gece yatağı: sen yatakta oturur, telefon elinde; yorgan bacakları örter
  const bedScene = (t, sas) => {
    bg(NIGHT);
    rect(-600, 1250, 2300, 1400, '#18212F', 0);
    rect(80, 610, 250, 120, '#2B3648', LW, 12); text('02:47', 205, 695, 74, '#E06A5C');   // dijital saat
    rect(700, 560, 260, 240, '#2E4060', LW, 6); circ(880, 640, 38, '#F4F1EA', 4); circ(864, 628, 34, '#2E4060', 0);   // pencere, hilal
    rect(120, 900, 840, 260, '#5A4636', LW, 30);   // başlık tahtası
    const x = 540, s = 200;
    ch('sen', { x, y: 1250, s, expr: sas ? 'saskin' : 'yorgun', talk: talk(t, T.l02, T.l02end), props: { R: 'phone' }, armR: { sh: 55, el: 118 }, armL: { sh: 25, el: 90 }, head: { look: [0.35, 0.35], tilt: sas ? 0 : 4 } }, t);
    glow(x + 50, 880, 360, 0.5 + 0.06 * Math.sin(t * 6.3));
    rect(90, 1130, 900, 200, '#3E5C8C', LW, 40);   // yorgan
    for (let i = 0; i < 4; i++) line(160 + i * 220, 1160, 210 + i * 220, 1250, 4, '#34507C');
  };

  const scenes = [];
  // 0 · kapak ve kanca: 02.47, yatakta telefona gömülü sen; l02'de yüzüne yakın çekim
  scenes[0] = t => {
    t = loopT(t);
    bedScene(t, t > T.l02 - 0.1 && t < T.l02end + 0.3);
  };
  // 1 · bir hafta = 7 × 24 saat; ekran saatleri günden güne maviye boyanır; sonra bir gün (altı saat)
  const GX0 = 190, GY0 = 660, CW = 100, CH = 23;
  const HOURS = [8, 12, 13, 19, 20, 21, 22, 23];   // gün içindeki ekran saatleri (ilk altısı dolar; altıncısı ~0,95)
  scenes[1] = t => {
    room('#EFE6D6', '#D8C9AE', 1300);
    rect(GX0 - 30, GY0 - 70, 7 * CW + 60, 24 * CH + 100, '#FFFFFF', LW, 12);
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const fillU = seg(t, w('l03', 2) - 0.1, w('l03', 7) + 0.4 - w('l03', 2));
    for (let d = 0; d < 7; d++) {
      text(days[d], GX0 + d * CW + CW / 2, GY0 - 20, 34, '#6B6458');
      const dayU = Math.max(0, Math.min(1, fillU * 7 - d));
      for (let h = 0; h < 24; h++) {
        const k = HOURS.indexOf(h), on = k >= 0 && k < 6 ? Math.max(0, Math.min(1, dayU * 6 - k)) * (k === 5 ? DAY_H - 5 : 1) : 0;
        ctx.fillStyle = '#F7F2E8'; ctx.fillRect(GX0 + d * CW + 3, GY0 + h * CH + 2, CW - 6, CH - 4);
        if (on > 0) { ctx.fillStyle = BLUE; ctx.fillRect(GX0 + d * CW + 3, GY0 + h * CH + 2, (CW - 6) * on, CH - 4); }
      }
    }
    for (const h of [0, 6, 12, 18]) text(String(h).padStart(2, '0'), GX0 - 52, GY0 + h * CH + 18, 26, '#9A9282');
    // "günde altı saat": pazartesi sütunu kırmızı çerçeve
    if (t > w('l03', 9) - 0.1) { const u = ease.enter(seg(t, w('l03', 9) - 0.1, 0.3)); ctx.save(); ctx.globalAlpha = u; ctx.lineWidth = 8; ctx.strokeStyle = RED; ctx.strokeRect(GX0 - 4, GY0 - 4, CW + 8, 24 * CH + 8); ctx.restore(); }
  };
  // 2 · Türkiye ile dünya ortalaması: haftalık saat çubukları (saat blokları), aradaki fark kırmızı
  scenes[2] = t => {
    room('#EFE6D6', '#D8C9AE', 1250);
    const x0 = 120, sc = 780 / 45, y1 = 720, y2 = 1010, hgt = 130;
    const u1 = ease.enter(seg(t, w('l03', 14) - 0.1, 0.6)), u2 = ease.enter(seg(t, w('l03', 14) + 0.25, 0.6));
    text('TÜRKİYE', x0, y1 - 26, 44, PAL.ink, 'Archivo', 800, 'left');
    text('DÜNYA ORTALAMASI', x0, y2 - 26, 44, '#6B6458', 'Archivo', 800, 'left');
    rect(x0, y1, WEEK_H * sc * u1 + 1, hgt, BLUE, LW, 10);
    rect(x0, y2, WORLD_H * sc * u2 + 1, hgt, BLUE_L, LW, 10);
    if (u1 > 0.9) text('41 sa 37 dk', x0 + 30, y1 + 82, 50, '#FFFFFF', 'Archivo', 800, 'left');
    if (u2 > 0.9) text('33 sa 27 dk', x0 + 30, y2 + 82, 50, PAL.ink, 'Archivo', 800, 'left');
    const d = ease.enter(seg(t, w('l03', 17) - 0.1, 0.4));
    if (d > 0) {
      const xa = x0 + WORLD_H * sc, xb = x0 + WEEK_H * sc;
      ctx.save(); ctx.globalAlpha = d;
      line(xa, y2 - 10, xa, y1 + hgt + 10, 5, RED);
      rect(xa, y1 + hgt + 14, xb - xa, 14, RED, 0);
      text('+8 sa', (xa + xb) / 2 + 10, y1 + hgt + 76, 58, RED);
      ctx.restore();
    }
    ch('sen', { x: 930, y: 1250, s: 110, facing: -1, expr: d > 0 ? 'saskin' : 'notr', armL: { sh: 80, el: 20 }, head: { look: [-0.6, -0.3] } }, t);
  };
  // 3 · sosyal medya: sen kaydırır, telefondan kalp ve yorum baloncukları yükselir
  scenes[3] = t => {
    room('#F2E4E6', '#DCC6C8', 1250);
    ch('sen', { x: 420, y: 1250, s: 170, expr: 'yorgun', talk: talk(t, T.l04, T.l04end), props: { R: 'phone' }, armR: { sh: 55, el: 118 }, armL: { sh: 12, el: -4 }, head: { look: [0.4, 0.4] } }, t);
    bigPhone(800, 930, 460, (x, y, wd, h) => {
      ctx.fillStyle = '#FBF8F1'; ctx.fillRect(x, y, wd, h);
      const off = (t * 160) % 150;
      for (let i = -1; i < 4; i++) { const yy = y + 20 + i * 150 - off + 150; rect(x + 14, yy, wd - 28, 120, i % 2 ? '#E9D9BC' : '#BFD6DC', 4, 10); }
    });
    for (let i = 0; i < 5; i++) {
      const u = ((t - T.l04 + i * 0.37) % 1.85) / 1.85; if (u < 0) continue;
      const x = 800 + Math.sin(i * 2.1 + u * 3) * 120, y = 700 - u * 260;
      ctx.save(); ctx.globalAlpha = Math.min(1, (1 - u) * 2.5);
      if (i % 2 === 0) { rect(x - 34, y - 26, 68, 52, PINK, 4, 14); ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.bezierCurveTo(x - 26, y - 2, x - 18, y - 20, x, y - 8); ctx.bezierCurveTo(x + 18, y - 20, x + 26, y - 2, x, y + 14); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }
      else { rect(x - 38, y - 26, 76, 52, '#FFFFFF', 4, 14); for (let k = 0; k < 3; k++) circ(x - 18 + k * 18, y, 6, PAL.ink, 0); }
      ctx.restore();
    }
  };
  // 4 · bir gün (24 saat dairesi) → ömür şeridi: 15–78,5 yaş; günlük mavi çizgiler toplanıp 16 yıllık bloğa döner
  const RX0 = 110, RX1 = 970, RY = 1010, yr = a => lerp(RX0, RX1, a / LIFE1);
  scenes[4] = t => {
    room('#EFE6D6', '#D8C9AE', 1260);
    if (t < w('l05', 4) - 0.12) {   // "günde üç buçuk saati": 24 saatlik daire
      const cx = 540, cy = 900, r = 250;
      circ(cx, cy, r, '#F7F2E8', LW);
      const a0 = -Math.PI / 2, u = ease.state(seg(t, T.l05 - 0.1, 0.8));
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a0 + Math.PI * 2 * DAY_H / 24); ctx.closePath(); ctx.fillStyle = BLUE_L; ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a0 + Math.PI * 2 * SOC_H / 24 * u); ctx.closePath(); ctx.fillStyle = PINK; ctx.fill();
      circ(cx, cy, r, null, LW);
      for (let h = 0; h < 24; h++) { const a = a0 + h / 24 * Math.PI * 2; line(cx + Math.cos(a) * (r - 22), cy + Math.sin(a) * (r - 22), cx + Math.cos(a) * r, cy + Math.sin(a) * r, h % 6 ? 3 : 6); }
      text('24 saat', cx, cy + r + 80, 48, '#6B6458');
      return;
    }
    // ruler
    line(RX0, RY, RX1, RY, LW * 1.2);
    for (let a = 0; a <= 70; a += 10) { line(yr(a), RY - 16, yr(a), RY + 16, 5); text(String(a), yr(a), RY + 62, 38, '#6B6458'); }
    line(yr(LIFE1), RY - 26, yr(LIFE1), RY + 26, 8, RED); text('78,5', yr(LIFE1) - 6, RY + 62, 40, RED);
    const s15 = ease.enter(seg(t, w('l05', 4) - 0.1, 0.4));
    if (s15 > 0) { line(yr(LIFE0), RY - 40, yr(LIFE0), RY + 26, 8, RED); text('15', yr(LIFE0), RY - 56, 44 * s15, RED); }
    // ömür bandı: 15'ten 78,5'e; içinde her günün ekran payı (çizgiler) → tek blok
    const by = 800, bh = 150, bx0 = yr(LIFE0), bx1 = yr(LIFE1);
    const band = ease.enter(seg(t, w('l05', 6) - 0.1, 0.5));
    if (band > 0) {
      rect(bx0, by, (bx1 - bx0) * band + 1, bh, '#F7F2E8', LW, 6);
      const g = ease.state(seg(t, w('l05', 12) - 0.2, 0.9));   // "yılı ekranda": çizgiler sola toplanır
      const n = 42, frac = DAY_H / 24, blockW = (bx1 - bx0) * frac;
      for (let i = 0; i < n; i++) {
        const sx = bx0 + (i + 0.5) * (bx1 - bx0) / n - (bx1 - bx0) / n * frac / 2, tx = bx0 + i * blockW / n;
        const x = lerp(sx, tx, g), wd = (bx1 - bx0) / n * frac;
        if (x < bx0 + (bx1 - bx0) * band) { ctx.fillStyle = BLUE; ctx.fillRect(x, by + 4, wd + (g > 0.98 ? 1 : 0), bh - 8); }
      }
      const pk = ease.enter(seg(t, w('l05', 15) - 0.1, 0.5));
      if (pk > 0) { ctx.fillStyle = PINK; ctx.fillRect(bx0, by + 4 + (bh - 8) * 0.5, (bx1 - bx0) * SOC_H / 24 * pk, (bh - 8) * 0.5); }
      if (g > 0.98) { line(bx0 + blockW, by - 14, bx0 + blockW, by + bh + 14, 6, RED); text('16 yıl', bx0 + blockW / 2, by - 30, 54, BLUE); }
      if (pk > 0.9) text('9+ yıl sosyal medya', bx0, RY + 130, 46, PINK, 'Archivo', 800, 'left');
    }
    if (band > 0.95) ch('sen', { x: yr(LIFE0) + 34, y: 800, s: 64, expr: t > hero(T) ? 'saskin' : 'notr', head: { look: [0.6, 0.2] } }, t);   // ömür bandının üstünde, 15 yaşında
  };
  // 5 · "şu an da ekrandayım": telefonun içinde bu video (küçük sen küçük telefonuna bakıyor)
  scenes[5] = t => {
    bg('#EDE4D6');
    bigPhone(540, 930, 720, (x, y, wd, h) => {
      ctx.fillStyle = '#EFE6D6'; ctx.fillRect(x, y, wd, h);
      ctx.fillStyle = '#D8C9AE'; ctx.fillRect(x, y + h * 0.72, wd, h * 0.28);
      ch('sen', { x: x + wd * 0.42, y: y + h * 0.72, s: 120, expr: 'saskin', props: { R: 'phone' }, armR: { sh: 55, el: 118 }, head: { look: [0.35, 0.35] } }, t);
      rect(x + wd * 0.62, y + h * 0.36, wd * 0.24, h * 0.24, '#2B2F33', 4, 10);
      rect(x + wd * 0.645, y + h * 0.38, wd * 0.19, h * 0.2, '#EFE6D6', 0, 6);
    });
    // tutan el: ekranın altında başparmak
    ell(740, 1270, 70, 40, '#EEC6A0', LW, -0.4);
  };
  // 6 · bırak ve gönder: telefon masaya ters kapanır; telefondan çıkan uçak ekrana gömülü arkadaşa gider
  scenes[6] = t => {
    room('#F4EEDC', '#D9C7A9', 1240);
    rect(80, 560, 280, 220, '#BFD6DC', LW, 6); circ(300, 620, 34, '#F2C14E', 4);
    const flip = ease.state(seg(t, w('l07', 6) - 0.15, 0.5)), free = flip >= 1;
    ch('sen', { x: 270, y: 1240, s: 150, facing: 1, expr: free ? 'mutlu' : 'notr', armL: { sh: free ? 160 : 20, el: free ? 20 : 60 }, armR: { sh: free ? 160 : lerp(60, 40, flip), el: free ? 20 : 90 }, head: { look: [0.5, free ? -0.3 : 0.4] } }, t);
    rect(160, 1060, 460, 34, '#A87A4E', LW, 8); rect(190, 1094, 26, 146, '#8A6440', LW); rect(570, 1094, 26, 146, '#8A6440', LW);
    // telefon: elden masaya, ters döner (y ölçeği -1'e)
    ctx.save(); ctx.translate(lerp(390, 470, flip), lerp(930, 1048, flip)); ctx.rotate(lerp(-0.3, Math.PI / 2, flip)); ctx.scale(1, lerp(1, -1, flip));
    rect(-34, -60, 68, 120, flip > 0.5 ? '#2B2F33' : '#2B2F33', LW * 0.8, 10); if (flip < 0.5) rect(-26, -50, 52, 100, '#BFE0F4', 0, 6);
    ctx.restore();
    const go = seg(t, w('l07', 7) - 0.05, 1.2), got = go >= 1;
    ch(ARKADAS, { x: 860, y: 1240, s: 150, facing: -1, expr: got ? 'saskin' : 'yorgun', props: { L: 'phone' }, armL: { sh: 55, el: 118 }, head: { look: got ? [-0.6, -0.2] : [-0.3, 0.45] } }, t);
    if (!got) glow(820, 980, 160, 0.35);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(470, 800, u), lerp(1030, 950, u) - Math.sin(u * Math.PI) * 330, 0.85, lerp(-0.7, 0.6, u)); }
    if (got) plane(800, 960, 0.6, 0.3);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.1, 560, 960, 0)],
    ...cut(T.l02 - 0.1, P(1.1, 560, 960, 0), P(2.3, 560, 870, 0)),
    [T.l02end + 0.1, ...P(2.45, 560, 865, 0)],
    ...cut(T.l03 - 0.1, P(2.45, 560, 865, 0), P(0.95, 540, 980, 1)),
    [w('l03', 9) - 0.15, ...P(1.0, 540, 980, 1)],
    [w('l03', 13) + 0.2, ...P(1.65, GX0 + CW / 2 + 120, GY0 + 12 * CH, 1)],
    ...cut(w('l03', 14) - 0.1, P(1.65, GX0 + CW / 2 + 120, GY0 + 12 * CH, 1), P(1.0, 540, 980, 2)),
    [T.l03end + 0.2, ...P(1.05, 540, 960, 2)],
    ...cut(T.l04 - 0.1, P(1.05, 540, 960, 2), P(1.0, 580, 960, 3)),
    [T.l04end + 0.15, ...P(1.1, 600, 940, 3)],
    ...cut(T.l05 - 0.1, P(1.1, 600, 940, 3), P(1.0, 540, 960, 4)),
    [w('l05', 4) - 0.13, ...P(1.06, 540, 940, 4)],
    ...cut(w('l05', 4) - 0.12, P(1.06, 540, 940, 4), P(1.12, 540, 980, 4)),
    [hero(T), ...P(1.16, 540, 970, 4)],
    [T.l05end + 0.2, ...P(1.2, 520, 970, 4)],
    ...cut(T.l06 - 0.1, P(1.2, 520, 970, 4), P(1.0, 540, 960, 5)),
    [T.l06end + 0.15, ...P(1.12, 540, 930, 5)],
    ...cut(T.l07 - 0.1, P(1.12, 540, 930, 5), P(1.0, 540, 920, 6)),
    [T.l07end + 0.2, ...P(1.05, 560, 910, 6)],
    [T.loop0 - 0.001, ...P(1.05, 560, 910, 6)],
    [T.loop0, ...P(1.05, 550, 950, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Ömrünün kaç yılı', 'ekranda geçiyor?'],
    kicker: 'SENİN SAYIN · EKRAN',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.max(0, Math.min(6, Math.round((cam[k][2] - 540) / SX)));
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [],
    numbers: [
      [w('l03', 3) - 0.1, w('l03', 9) - 0.2, '41,6 saat', 'HAFTADA İNTERNETTE'],
      [w('l03', 9) - 0.05, w('l03', 14) - 0.2, '6 saat', 'GÜNDE · YAKLAŞIK'],
      [T.l05 - 0.05, w('l05', 4) - 0.2, '3,5 saat', 'GÜNDE SOSYAL MEDYA'],
      [hero(T) - 0.1, T.l05end + 0.2, '16 yıl', 'EKRANDA GEÇİYOR'],
    ],
  };
}

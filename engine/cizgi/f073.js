// № 073 · Bir ömürde kaç dolunay (çizgi motoru, "Senin sayın" serisi, sakin iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Görsel fikir: İstanbul silüetinin üstünde doğan dolunay; bir ömür = 970 küçük ay ızgarası.
// 30 yaşında 350'si sönük, 620 kalır; bulutlar ve bakılmayan geceler daha çoğunu kapatır.
// Doruk (sessizlikten sonra): gerçek büyük ay yeniden doğar, süper ay. Kapanış: çatıda sen ve arkadaşı, kâğıt uçak ayın önünden geçer.
// Sahneler 1400 px arayla; kamera [t, zoom, x, y].

const SX = 1400;
const TOTAL = 970, GONE30 = 350, LEFT30 = 620;
export function hero(T) { return T.l06 - 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [w('l03', 22) - 0.25, w('l03', 22)], [T.l07 - 0.25, T.l07], [w('l07', 15) - 0.25, w('l07', 15)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 9), w('l03', 10), w('l03', 12), w('l03', 13), w('l05', 3), w('l07', 9)],
    thock: [w('l03', 27), w('l04', 1)],
    scratch: [[w('l03', 22), w('l03', 27), 0.02], [w('l05', 8), w('l05', 16), 0.02]],
    riser: [w('l05', 12), hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const ARKADAS = {
  key: 'arkadas', name: 'Arkadaş', seed: 731,
  head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.4, 5.0] },
  torso: { len: 0.78, shoulder: 0.62, hip: 0.6, depth: 0.42, belly: 0, color: '#5E9A4E', shade: '#4C8240' },
  arm: { upper: 0.38, lower: 0.36, w: 0.18, color: '#5E9A4E', shade: '#4C8240', hand: 0.13 },
  leg: { upper: 0.39, lower: 0.37, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#8A3A2A', len: 0.27, h: 0.11 },
  skin: '#C9946A', skinShade: '#AD7C55', hair: '#1E1814',
  features: ['jacket', 'bun'],
};

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const NIGHT = '#1E2A3A', NIGHT2 = '#26354A', MOON = '#F4EBC8', MOON_S = '#E2D6A6', SIL = '#141C27';
  const ph = t => 2 * Math.PI * t / D;   // döngüye uygun periyodik faz

  // yıldızlar: tohumlu, sabit
  const STARS = (() => { const r = mulberry32(7303); return Array.from({ length: 70 }, () => [r() * 1300 - 110, r() * 1000 + 120, 1.5 + r() * 2.5, r() * 6.28]); })();
  const sky = t => { bg(NIGHT); for (const [x, y, s, p] of STARS) { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(ph(t) * 5 + p); ctx.fillStyle = '#F4EFE3'; ctx.fillRect(x, y, s, s); } ctx.globalAlpha = 1; };
  // dolunay: kraterli, ışık halkası
  const moon = (x, y, r, glow = 1) => {
    ctx.save(); ctx.globalAlpha = 0.18 * glow; circ(x, y, r * 1.45, '#F4EBC8', 0); ctx.globalAlpha = 0.12 * glow; circ(x, y, r * 1.9, '#F4EBC8', 0); ctx.restore();
    circ(x, y, r, MOON, LW);
    circ(x - r * 0.3, y - r * 0.2, r * 0.18, MOON_S, 0); circ(x + r * 0.28, y + r * 0.25, r * 0.13, MOON_S, 0); circ(x + r * 0.1, y - r * 0.45, r * 0.09, MOON_S, 0); circ(x - r * 0.42, y + r * 0.38, r * 0.08, MOON_S, 0);
  };
  // İstanbul silüeti: su, Galata Kulesi, kubbeler ve minareler (basit şekiller); zemin çizgisi yb
  const skyline = (yb = 1240) => {
    ctx.fillStyle = SIL;
    // tepe ve evler
    ctx.beginPath(); ctx.moveTo(-200, yb); ctx.lineTo(-200, yb - 120); ctx.quadraticCurveTo(200, yb - 210, 520, yb - 150); ctx.lineTo(520, yb); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 7; i++) ctx.fillRect(-120 + i * 80, yb - 190 + (i % 3) * 18, 60, 190);
    // Galata Kulesi
    ctx.fillRect(250, yb - 420, 76, 300); ctx.beginPath(); ctx.moveTo(236, yb - 420); ctx.lineTo(288, yb - 520); ctx.lineTo(340, yb - 420); ctx.closePath(); ctx.fill(); ctx.fillRect(240, yb - 430, 96, 16);
    ctx.fillStyle = '#E8C46A'; for (let i = 0; i < 3; i++) ctx.fillRect(262 + i * 20, yb - 380, 10, 18);
    ctx.fillStyle = SIL;
    // cami: büyük kubbe, yarım kubbeler, dört minare
    const cx = 820;
    ctx.fillRect(cx - 190, yb - 170, 380, 170);
    ctx.beginPath(); ctx.arc(cx, yb - 170, 130, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(cx - 150, yb - 170, 60, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 150, yb - 170, 60, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - 4, yb - 330, 8, 40);
    for (const mx of [cx - 250, cx - 210, cx + 210, cx + 250]) { ctx.fillRect(mx - 9, yb - 470, 18, 470); ctx.beginPath(); ctx.moveTo(mx - 11, yb - 470); ctx.lineTo(mx, yb - 530); ctx.lineTo(mx + 11, yb - 470); ctx.closePath(); ctx.fill(); ctx.fillRect(mx - 15, yb - 380, 30, 10); }
    // su ve yansıma
    ctx.fillStyle = '#18222F'; ctx.fillRect(-300, yb, 1700, 900);
  };
  const reflect = (x, yb, t) => { ctx.save(); ctx.globalAlpha = 0.55; for (let i = 0; i < 6; i++) { const wv = 40 + i * 10 + 14 * Math.sin(ph(t) * 6 + i); ctx.fillStyle = MOON; ctx.fillRect(x - wv / 2, yb + 30 + i * 34, wv, 8); } ctx.restore(); };
  const cloud = (x, y, k) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = '#3A4A60'; ctx.strokeStyle = '#0F151D'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-60, 10, 50, 0, 7); ctx.arc(0, -20, 70, 0, 7); ctx.arc(70, 6, 55, 0, 7); ctx.fill(); ctx.restore(); };

  // ay ızgarası: 40 sütun; dolu, sönük (geçmiş), bulutlu
  const GC = 40, GP = 21, GX = 120, GY0 = 640;
  const grid = (lit, gone, t, covered = 0) => {
    rect(GX - 20, GY0 - 20, GC * GP + 40, Math.ceil(TOTAL / GC) * GP + 40, NIGHT2, LW, 10);
    const r = mulberry32(9731);
    for (let i = 0; i < TOTAL; i++) {
      const x = GX + (i % GC) * GP + GP / 2, y = GY0 + Math.floor(i / GC) * GP + GP / 2;
      const hid = r() < covered;
      if (i >= lit) { ctx.fillStyle = '#2C3B50'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); continue; }
      ctx.fillStyle = i < gone ? '#4E5A6A' : hid ? '#56647A' : MOON; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill();
    }
  };

  const scenes = [];
  // 0 · kapak: İstanbul silüetinin üstünde dolunay
  scenes[0] = t => {
    t = loopT(t);
    sky(t);
    moon(690, 830, 150, 0.85 + 0.15 * Math.sin(ph(t) * 3));
    skyline(1240);
    reflect(690, 1240, t);
  };
  // 1 · çatıda sen: "her ay yok mu zaten?"
  const roof = (GY) => { poly([[-300, GY], [1400, GY], [1400, GY + 900], [-300, GY + 900]], '#7A3A2E', LW); for (let i = 0; i < 18; i++) line(-300 + i * 100, GY + 10, -260 + i * 100, GY + 900, 4, '#5E2C22'); rect(820, GY - 150, 70, 150, '#6B4A3A', LW); };
  scenes[1] = t => {
    sky(t);
    moon(820, 660, 110);
    roof(1250);
    ch('sen', { x: 420, y: 1250, s: 170, expr: 'saskin', talk: talk(t, T.l02, T.l02end), armL: { sh: 40, el: 60 }, armR: { sh: 40, el: 60 }, head: { look: [0.6, -0.6], tilt: -4 } }, t);
  };
  // 2 · ayın evreleri: 29,5 gün döngüsü; sonra yılın 12 (bazen 13) dolunayı
  scenes[2] = t => {
    sky(t);
    const cyc = seg(t, w('l03', 1) - 0.1, w('l03', 7) - w('l03', 1) + 0.6);
    if (t < w('l03', 8) - 0.12) {
      // büyük ay: evre karanlıktan dolunaya ve geri
      const x = 540, y = 900, r = 220, f = Math.cos(cyc * Math.PI * 2);   // f: 1 yeni ay ... -1 dolunay
      circ(x, y, r, '#2C3B50', LW);
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 3, 0, 7); ctx.clip();
      ctx.fillStyle = MOON; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2); ctx.ellipse(x, y, Math.abs(f) * r, r, 0, Math.PI / 2, -Math.PI / 2, f > 0); ctx.fill();
      ctx.restore(); circ(x, y, r, null, LW);
      text(Math.round(cyc * 29.5) + '. gün', 540, 610, 64, '#F4EFE3');
      return;
    }
    const k = Math.min(13, Math.floor(seg(t, w('l03', 8), w('l03', 14) - w('l03', 8)) * 13.99));
    for (let i = 0; i < k; i++) {
      const x = 170 + (i % 4) * 245, y = 720 + Math.floor(i / 4) * 170;
      if (i === 12) { ctx.save(); ctx.setLineDash([12, 10]); circ(x, y, 62, null, 5); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.5; moon(x, y, 58, 0); ctx.restore(); }
      else moon(x, y, 62, 0.4);
    }
  };
  // 3 · ömür ızgarası: 970 ay dolar; 30 yaşında 350'si söner; bulutlar ve bakılmayan geceler
  scenes[3] = t => {
    sky(t);
    const lit = t < w('l03', 22) ? 0 : TOTAL * ease.state(seg(t, w('l03', 22), w('l03', 27) - w('l03', 22) + 0.3));
    const gone = t < w('l04', 1) ? 0 : GONE30 * ease.state(seg(t, w('l04', 1), 0.9));
    const cov = t < w('l05', 8) ? 0 : 0.55 * ease.state(seg(t, w('l05', 8), w('l05', 14) - w('l05', 8)));
    grid(lit, gone, t, cov);
    if (cov > 0) { const u = seg(t, w('l05', 8), 3.5); for (let i = 0; i < 4; i++) cloud(lerp(-260, 1300, (u * 0.55 + i * 0.27) % 1.1), 720 + i * 120, 0.9 + 0.2 * (i % 2)); }
    // 30 yaş sınırı: kırmızı çizgi
    if (gone > 10) { const g = Math.min(GONE30, Math.floor(gone)), gx = GX + (g % GC) * GP, gy = GY0 + Math.floor(g / GC) * GP; line(gx, gy - 2, gx, gy + GP + 2, 6, PAL.red); line(GX - 10, gy + GP + 2, gx, gy + GP + 2, 4, PAL.red); }
  };
  // 4 · süper ay yeniden doğar: normal ay kesik çizgiyle, bu akşamki %6,5 büyük ve parlak
  scenes[4] = t => {
    sky(t);
    const rise = ease.enter(seg(t, T.l06 - 0.1, 1.6));
    const y = lerp(1100, 820, rise), big = t > w('l07', 4) - 0.1 ? lerp(150, 160, ease.enter(seg(t, w('l07', 4) - 0.1, 0.5))) : 150;
    const glow = t > w('l07', 6) - 0.1 ? 1 + 0.6 * ease.enter(seg(t, w('l07', 6) - 0.1, 0.5)) : 0.8;
    moon(560, y, big, glow);
    if (t > w('l07', 4) - 0.1) { ctx.save(); ctx.setLineDash([14, 12]); circ(560, y, 150, null, 5); ctx.restore(); }
    skyline(1240);
    reflect(560, 1240, t);
    ch('sen', { x: 210, y: 1240, s: 120, expr: 'mutlu', head: { look: [0.6, -0.6] }, talk: talk(t, T.l06, T.l06end) }, t);
  };
  // 5 · çatıda iki kişi, ayın önünden kâğıt uçak geçer
  scenes[5] = t => {
    sky(t);
    moon(560, 700, 170, 1.4);
    roof(1250);
    const go = seg(t, w('l07', 18) - 0.1, 1.2), got = go >= 1;
    ch('sen', { x: 300, y: 1250, s: 150, facing: 1, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 125, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.5, -0.4] } }, t);
    ch(ARKADAS, { x: 820, y: 1250, s: 150, facing: -1, expr: got ? 'mutlu' : 'notr', armL: { sh: got ? 120 : 10, el: got ? 40 : -4 }, head: { look: [-0.5, -0.4] } }, t);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(380, 760, u), lerp(980, 990, u) - Math.sin(u * Math.PI) * 360, 0.9, lerp(-0.7, 0.5, u)); }
    if (got) plane(770, 1000, 0.7, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.12, 620, 900, 0)],
    ...cut(T.l02 - 0.1, P(1.12, 620, 900, 0), P(1.0, 540, 960, 1)),
    [T.l02end + 0.1, ...P(1.2, 500, 960, 1)],
    ...cut(T.l03 - 0.1, P(1.2, 500, 960, 1), P(1.0, 540, 960, 2)),
    [w('l03', 8) - 0.13, ...P(1.08, 540, 940, 2)],
    ...cut(w('l03', 8) - 0.12, P(1.08, 540, 940, 2), P(0.98, 540, 960, 2)),
    [w('l03', 22) - 0.13, ...P(1.02, 540, 950, 2)],
    ...cut(w('l03', 22) - 0.12, P(1.02, 540, 950, 2), P(0.95, 540, 920, 3)),
    [T.l04end + 0.2, ...P(1.0, 540, 920, 3)],
    [w('l05', 8), ...P(1.0, 540, 920, 3)],
    [T.l05end + 0.2, ...P(1.06, 540, 900, 3)],
    ...cut(hero(T), P(1.06, 540, 900, 3), P(1.0, 540, 960, 4)),
    [T.l07 + 1.0, ...P(1.12, 560, 900, 4)],
    [w('l07', 15) - 0.13, ...P(1.1, 520, 940, 4)],
    ...cut(w('l07', 15) - 0.12, P(1.1, 520, 940, 4), P(1.0, 540, 940, 5)),
    [T.l07end + 0.2, ...P(1.05, 540, 920, 5)],
    [T.loop0 - 0.001, ...P(1.05, 540, 920, 5)],
    [T.loop0, ...P(1.06, 600, 920, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Bir ömürde', 'kaç dolunay?'],
    kicker: 'SENİN SAYIN · BU AKŞAM',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(5, i))](t); ctx.restore();
    },
    names: [],
    numbers: [
      [w('l03', 15) - 0.1, w('l03', 22) - 0.2, '78,5 yıl', 'TÜİK · ORTALAMA ÖMÜR'],
      [w('l03', 22) - 0.05, T.l04 - 0.1, t => Math.round(TOTAL * ease.state(seg(t, w('l03', 22), w('l03', 27) - w('l03', 22) + 0.3))), 'DOLUNAY · BİR ÖMÜR'],
      [w('l05', 3) - 0.1, w('l05', 8) - 0.2, '620', 'DOLUNAY KALDI · 30 YAŞ'],
      [w('l07', 9) - 0.1, w('l07', 15) - 0.2, '17.08', 'İSTANBUL · AY DOĞUŞU'],
    ],
  };
}

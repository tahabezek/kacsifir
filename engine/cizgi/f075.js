// № 075 · On yıl bekleyen köpek (çizgi motoru, "Bir hikâye" serisi, iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Kahraman: Hachikō, tek bir çizim fonksiyonuyla (dog) her sahnede aynı Akita: krem tüy, kıvrık kuyruk, sağ kulağı hafif düşük.
// Görsel yay: istasyonun önündeki aynı nokta → peron (Ueno iner) → birlikte 16 ay → boş masa → mevsimler geçer, gün sayacı
// → gazete → heykel ve yanında köpek → boş nokta → kâğıt uçak. Ölüm çizilmez; yalnızca boş yer.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
export function hero(T) { return T.w('l07', 17) + 0.1; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [w('l03', 19) - 0.3, w('l03', 19)], [w('l03', 25) - 0.3, w('l03', 25)], [T.l05 - 0.3, T.l05], [w('l05', 19) - 0.3, w('l05', 19)], [w('l07', 0) - 0.3, w('l07', 0)], [w('l07', 22) - 0.3, w('l07', 22)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 6), w('l03', 9), w('l03', 21), w('l05', 3), w('l07', 6)],
    thock: [w('l05', 25)],
    scratch: [[T.l05, w('l05', 18), 0.02]],
    riser: [w('l07', 13), hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
// Profesör Hidesaburō Ueno: koyu takım, gözlük, fötr şapka (şapka sahnede ayrıca çizilir)
const UENO = base({
  key: 'ueno', name: 'Hidesaburō Ueno', seed: 751,
  head: { w: 0.9, h: 1.02, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.88, shoulder: 0.7, hip: 0.6, depth: 0.46, belly: 0.05, color: '#4A4238', shade: '#3A332B' },
  arm: { upper: 0.42, lower: 0.4, w: 0.19, color: '#4A4238', shade: '#3A332B', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#3E372F', shade: '#2E2922' },
  shoe: { color: '#1E1A16', len: 0.3, h: 0.11 },
  skin: '#EAC39C', skinShade: '#D2A87E', hair: '#2A2420',
  features: ['suit', 'tie', 'hairSlick', 'glassesRect'],
});
// istasyon yolcuları (kalabalık sahneleri): sade paltolar
const YOLCU = (seed, coat, hair = '#2A2420', extra = []) => base({
  key: 'yolcu' + seed, name: 'Yolcu', seed,
  torso: { len: 0.84, shoulder: 0.66, hip: 0.6, depth: 0.44, belly: 0.02, color: coat, shade: coat },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: coat, shade: coat, hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#34343C', shade: '#26262C' },
  shoe: { color: '#1E1A16', len: 0.28, h: 0.11 },
  skin: '#EAC39C', skinShade: '#D2A87E', hair,
  features: ['hairSlick', ...extra],
});
const Y1 = YOLCU(761, '#6B5A48'), Y2 = YOLCU(762, '#3F4F5E'), Y3 = YOLCU(763, '#7A4A3A', '#2A2420', ['bun', 'skirt']), Y4 = YOLCU(764, '#55603F');

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, plane, CARDS, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const GY = 1250;
  const FUR = '#F4EAD6', FUR_S = '#E2D2B2', BRONZE = '#8A6A3A', BRONZE_S = '#6E5230', BRONZE_H = '#A8844C';

  // ——— Hachikō: tek çizim fonksiyonu. (x, y) zemin, k ölçek (k = 1 → oturunca ~230 px), dir 1 sağa bakar.
  // o: { pose: 'sit' | 'walk', ph: yürüme fazı, wag: kuyruk, look: baş eğimi (rad), ear: kulak düşüklüğü, bronze }
  const dog = (x, y, k, dir = 1, o = {}) => {
    const br = !!o.bronze, F = br ? BRONZE : FUR, FS = br ? BRONZE_S : FUR_S, lw = LW / k;
    ctx.save(); ctx.translate(x, y); ctx.scale(k * dir, k);
    const wag = (o.wag || 0), tail = (cx, cy) => {   // kıvrık kuyruk: sırtın üstünde halka
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(wag * 0.25);
      ctx.beginPath(); ctx.arc(0, -20, 30, Math.PI * 0.95, Math.PI * 2.7); ctx.lineWidth = 34; ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round'; ctx.stroke();
      ctx.lineWidth = 34 - lw * 2; ctx.strokeStyle = F; ctx.stroke(); ctx.restore();
    };
    const head = (hx, hy, a) => {
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
      poly([[-22, -28], [-34, -78], [2, -42]], F, lw);                                         // sol kulak (dik)
      ctx.save(); ctx.translate(18, -36); ctx.rotate(0.35 + (o.ear || 0)); poly([[0, 0], [8, -46], [28, -4]], F, lw); ctx.restore();   // sağ kulak hafif düşük
      ell(0, 0, 46, 42, F, lw);
      ell(40, 14, 34, 22, FS, lw);                                                              // burun kemeri
      circ(70, 6, 8, PAL.ink, 0);
      circ(12, -10, 6, PAL.ink, 0);
      line(44, 30, 60, 32, lw * 0.6);
      ctx.restore();
    };
    if (o.pose === 'walk') {
      const ph = (o.ph || 0) * Math.PI * 2, leg = (lx, a) => { ctx.save(); ctx.translate(lx, -96); ctx.rotate(Math.sin(a) * 0.45); rect(-11, 0, 22, 92, FS, lw, 10); ell(4, 94, 16, 9, F, lw); ctx.restore(); };
      leg(-58, ph + Math.PI); leg(48, ph);
      tail(-82, -128);
      ell(-4, -118, 92, 44, F, lw);
      leg(-46, ph); leg(60, ph + Math.PI);
      head(92, -168 + Math.sin(ph * 2) * 3, (o.look || 0) - 0.1);
    } else {
      tail(-70, -100);
      ell(-28, -62, 64, 58, F, lw);                                                             // arka kalça
      ctx.save(); ctx.translate(-4, -110); ctx.rotate(-0.42); ell(0, 0, 48, 82, F, lw); ctx.restore();   // gövde, dik
      rect(6, -96, 24, 96, FS, lw, 10); ell(26, -2, 20, 10, F, lw);                            // uzak ön bacak
      ell(-44, -6, 34, 12, F, lw);                                                              // arka pati
      head(28, -198, (o.look || 0));
      ell(20, -150, 34, 26, F, 0);                                                              // boyun (çizgisiz dolgu)
      rect(34, -100, 26, 100, F, lw, 11); ell(54, -2, 22, 11, F, lw);                         // yakın ön bacak
      if (!br) { ctx.beginPath(); ctx.arc(26, -168, 30, 0.35, 1.9); ctx.lineWidth = 9; ctx.strokeStyle = '#B03A2E'; ctx.stroke(); }   // tasma
    }
    if (br) { ctx.globalAlpha = 0.35; line(-30, -170, -50, -110, 8, BRONZE_H); ctx.globalAlpha = 1; }
    ctx.restore();
  };
  // fötr şapka (önden ya da yandan); kafa merkezini karakterin iskeletinden alır
  const hat = (o, sk, side = false) => {
    const s = o.s, hx = o.x + sk.head[0] * s * (side ? (o.facing || 1) : 1), hy = o.y + sk.head[1] * s;
    ell(hx, hy - 0.42 * s, (side ? 0.62 : 0.66) * s, 0.09 * s, '#2E2822', LW);
    poly([[hx - 0.36 * s, hy - 0.44 * s], [hx - 0.32 * s, hy - 0.8 * s], [hx, hy - 0.86 * s], [hx + 0.32 * s, hy - 0.8 * s], [hx + 0.36 * s, hy - 0.44 * s]], '#3A322A', LW);
    rect(hx - 0.36 * s, hy - 0.56 * s, 0.72 * s, 0.1 * s, '#1E1A16', 0);
  };
  const ueno = (t, o) => { const sk = ch(UENO, o, t); hat(o, sk, o.view === 'side' || o.walk != null); };
  // istasyon cephesi (1920'ler Shibuya): tuğla, saat, ortada giriş; köpeğin yeri girişin sağı (x 790)
  const station = (t, season = -1) => {
    bg('#F0CFA6'); circ(180, 520, 70, '#F6E2B8', 0);
    rect(40, 720, 1000, 530, '#B5654A', LW, 4);
    for (let r = 0; r < 9; r++) line(40, 760 + r * 54, 1040, 760 + r * 54, 3, '#9A5038');
    poly([[10, 720], [540, 600], [1070, 720]], '#4A4A52', LW);
    rect(400, 900, 280, 350, '#3A2E26', LW, 6);
    rect(330, 800, 420, 70, '#F4EFE3', LW, 6); text('SHIBUYA', 540, 852, 52, PAL.ink, 'IBM Plex Mono', 600);
    circ(540, 690, 46, '#F4EFE3', LW); const a = t * 0.05; line(540, 690, 540 + 26 * Math.sin(a), 690 - 26 * Math.cos(a), 6); line(540, 690, 540 + 34 * Math.sin(a * 12), 690 - 34 * Math.cos(a * 12), 4);
    for (const x of [100, 220, 780, 900]) { rect(x, 940, 90, 140, '#E8C77A', LW, 4); line(x + 45, 940, x + 45, 1080, 4); }
    rect(-400, GY, 1880, 700, '#C9BCA4', 0); line(-400, GY, 1480, GY, LW);
    if (season >= 0) seasonFx(t, season);
  };
  // mevsim katmanı: 0 kiraz, 1 yaz, 2 sonbahar, 3 yağmur, 4 kar (tohumlu, t'nin saf fonksiyonu)
  const seasonFx = (t, s) => {
    const r = mulberry32(900 + s), n = s === 1 ? 0 : 46;
    for (let i = 0; i < n; i++) {
      const x0 = r() * 1300 - 110, sp = 0.6 + r() * 0.8, ph = r();
      const y = -100 + ((ph + t * 0.18 * sp) % 1) * 1500, x = x0 + Math.sin(t * 2 + i) * 20;
      if (s === 0) ell(x, y, 12, 8, '#F4B6C2', 3, t + i);
      if (s === 2) ell(x, y, 14, 9, i % 2 ? '#D8722E' : '#C9A23A', 3, t * 2 + i);
      if (s === 3) line(x, y, x - 10, y + 50, 4, '#7FA3B8');
      if (s === 4) circ(x, y, 7, '#FFFFFF', 2);
    }
    if (s === 4) rect(-400, GY - 14, 1880, 18, '#FFFFFF', 3);
  };

  const scenes = [];
  // 0 · kapak: istasyonun önü, girişin sağında oturan Hachikō; l05 sonunda etrafında kalabalık (onu tanıyan Japonya)
  scenes[0] = t => {
    t = loopT(t);
    station(t);
    const fame = t > w('l05', 28) - 0.2 && t < T.l07;
    if (fame) {
      const pp = [[Y1, 230, 1, 'mutlu'], [Y2, 380, 1, 'mutlu'], [Y3, 980, -1, 'mutlu'], [Y4, 640, 1, 'mutlu']];
      for (const [c, x, f, e] of pp) ch(c, { x, y: GY, s: 92, expr: e, head: { look: [f * 0.6, 0.3] }, armR: { sh: 60, el: 40 } }, t);
    }
    // l01 "her gün": yolcular girişten çıkıp geçer
    const u = seg(t, w('l01', 9) - 0.3, 3.2);
    if (u > 0 && u < 1 && !fame) { ch(Y2, { x: lerp(520, -120, u), y: GY, s: 86, walk: (t * 1.3) % 1, facing: -1 }, t); ch(Y1, { x: lerp(560, 1240, u * 0.95), y: GY, s: 88, walk: (t * 1.2 + 0.3) % 1, facing: 1 }, t); }
    dog(790, GY, 0.92, -1, { look: Math.sin(t * 0.9) * 0.05, wag: Math.sin(t * 5) * (fame ? 1 : 0.2) });
  };
  // 1 · peron: tren gelir, Ueno iner, köpek koşar (l03); l03 sonu ve l04: tren gider, peron boş, köpek bakar
  const TRAIN = (x, y) => {
    for (let i = 0; i < 3; i++) { const cx = x + i * 560; rect(cx, y - 300, 540, 260, '#5E3B2A', LW, 18); for (let j = 0; j < 4; j++) rect(cx + 30 + j * 128, y - 260, 100, 90, '#F6E2B8', 5, 6); rect(cx + 20, y - 150, 500, 18, '#C9A23A', 0); circ(cx + 90, y - 30, 30, '#2A2420', LW); circ(cx + 450, y - 30, 30, '#2A2420', LW); }
  };
  scenes[1] = t => {
    bg('#E7C59B'); rect(-400, 400, 1880, 120, '#8A6A50', LW);
    for (let i = 0; i < 6; i++) line(-200 + i * 300, 520, -200 + i * 300, 1000, 14, '#6B5040');
    const empty = t > w('l03', 34) - 0.15;
    const tx = empty ? lerp(0, -2200, ease.exit(seg(t, w('l03', 34), 3.5))) : lerp(1300, 0, ease.enter(seg(t, T.l03 + 0.2, 2.6)));
    rect(-400, 1000, 1880, 40, '#3A3A40', 0);
    TRAIN(tx - 300, 1010);
    rect(-400, 1010, 1880, 700, '#B8AC96', 0); line(-400, 1010, 1480, 1010, LW); rect(-400, 1030, 1880, 16, '#E2B13C', 0);
    if (!empty) {
      const off = seg(t, w('l03', 15) - 0.2, 0.9);
      if (off > 0) ueno(t, { x: lerp(470, 560, ease.enter(off)), y: GY, s: 140, expr: 'mutlu', armR: { sh: off >= 1 ? 50 : 10, el: 60 }, head: { look: [0.5, 0.3] } });
      const run = ease.state(seg(t, w('l03', 16), 1.0));
      dog(lerp(1000, 760, run), GY, 0.9, -1, { pose: run > 0 && run < 1 ? 'walk' : 'sit', ph: t * 2.2, wag: Math.sin(t * 9), look: -0.1 });
    } else {
      const tilt = t > T.l04 - 0.2 ? 0.16 * Math.sin(Math.min(1, seg(t, T.l04, 0.6)) * Math.PI / 2) : 0;
      dog(760, GY, 0.95, -1, { look: tilt, ear: 0.25 });
    }
  };
  // 2 · birlikte 16 ay: yan yana yürürler; üstte 16 takvim yaprağı dolar
  scenes[2] = t => {
    bg('#DCE6E0');
    const sc = (t * 70) % 560;
    for (let i = -1; i < 4; i++) { const hx = i * 560 - sc; rect(hx + 40, 860, 360, 240, '#E9DFC9', LW, 4); poly([[hx + 20, 860], [hx + 220, 760], [hx + 420, 860]], '#5A5C66', LW); rect(hx + 90, 920, 90, 90, '#BFD6DC', 5); rect(hx + 260, 980, 80, 120, '#6A4A2E', 5); }
    rect(-400, 1100, 1880, 900, '#C9BCA4', 0); line(-400, 1100, 1480, 1100, LW);
    ueno(t, { x: 430, y: 1190, s: 150, walk: (t * 0.9) % 1, facing: 1 });
    dog(720, 1190, 1.05, 1, { pose: 'walk', ph: t * 1.8, wag: Math.sin(t * 7), look: -0.15 });
    const n = Math.floor(16 * seg(t, w('l03', 21) - 0.1, w('l03', 24) + 0.6 - w('l03', 21)) + 0.0001);
    for (let i = 0; i < 16; i++) { const x = 52 + i * 62, y = 610; if (i < n) { rect(x, y, 54, 64, '#FBF8F1', 4, 5); rect(x, y, 54, 16, PAL.red, 0, 5); text(String(i + 1), x + 27, y + 56, 30, PAL.ink); } }
  };
  // 3 · Mayıs 1925: üniversitede boş sandalye, masada şapka ve gözlük; pencerede yağmur
  scenes[3] = t => {
    bg('#D8D2C4'); rect(620, 560, 340, 420, '#AFC6CF', LW, 4); line(790, 560, 790, 980, LW); line(620, 770, 960, 770, LW);
    for (let i = 0; i < 14; i++) { const r = mulberry32(330 + i), x = 640 + r() * 300, y = 560 + ((r() + t * 0.5) % 1) * 410; line(x, y, x - 6, y + 34, 3, '#6E8C9A'); }
    rect(-400, GY, 1880, 700, '#9C8466', 0); line(-400, GY, 1480, GY, LW);
    rect(120, 1000, 700, 34, '#7A5638', LW, 6); rect(150, 1034, 30, 216, '#5E4128', LW); rect(760, 1034, 30, 216, '#5E4128', LW);
    rect(250, 960, 220, 40, '#F4EFE3', 4, 4); for (let i = 0; i < 3; i++) line(270, 972 + i * 9, 440, 972 + i * 9, 3);
    ell(620, 990, 90, 14, '#2E2822', LW); poly([[570, 988], [575, 930], [620, 922], [665, 930], [670, 988]], '#3A322A', LW);
    rect(860, 900, 160, 26, '#7A5638', LW, 6); rect(870, 926, 24, 324, '#5E4128', LW); rect(990, 926, 24, 324, '#5E4128', LW); rect(870, 1060, 150, 26, '#7A5638', LW, 6);
  };
  // 4 · mevsimler: istasyonun girişinde aynı yerde oturan köpek; yolcular geçer; biri onu kovalar
  scenes[4] = t => {
    const u = seg(t, T.l05 + 0.1, w('l05', 18) - T.l05), season = Math.min(4, Math.floor(u * 5) % 5);
    station(t, season);
    const passA = seg(t, w('l05', 10) - 0.4, 2.6), passB = seg(t, w('l05', 12) - 0.2, 2.6);
    if (passA > 0 && passA < 1) ch(Y4, { x: lerp(1200, -150, passA), y: GY, s: 100, walk: (t * 1.4) % 1, facing: -1 }, t);
    if (passB > 0 && passB < 1) ch(Y3, { x: lerp(-150, 1200, passB), y: GY, s: 96, walk: (t * 1.3) % 1, facing: 1 }, t);
    const shoo = seg(t, w('l05', 15) - 0.2, 0.3) * (1 - seg(t, w('l05', 19) - 0.3, 0.3));
    if (shoo > 0) ch(Y1, { x: 600, y: GY, s: 104, expr: 'kizgin', talk: talk(t, w('l05', 15), w('l05', 18) + 0.3), armR: { sh: 140, el: 30 + 30 * Math.sin(t * 12) }, head: { look: [0.6, 0.2] } }, t);
    dog(790, GY, 0.95, -1, { look: shoo > 0.5 ? 0.25 : 0.03 * Math.sin(t), ear: shoo > 0.5 ? 0.5 : 0.1 });
    rect(150, 1100, 200, 90, '#FBF8F1', LW, 8); rect(150, 1100, 200, 24, PAL.red, 0, 8); text(String(1925 + Math.min(7, Math.floor(u * 7.6))), 250, 1172, 54, PAL.ink, 'IBM Plex Mono', 600);
  };
  // 5 · 1932 gazetesi: masaya düşen sayfa, sütunlar ve köpeğin fotoğrafı
  scenes[5] = t => {
    bg('#B89A78'); for (let i = 0; i < 6; i++) line(-400, 640 + i * 140, 1480, 640 + i * 140, 4, '#A5875F');
    const k = ease.enter(seg(t, w('l05', 19) - 0.1, 0.55));
    ctx.save(); ctx.translate(540, 960 + (1 - k) * 700); ctx.rotate((1 - k) * 0.5 - 0.04);
    rect(-360, -330, 720, 640, '#F2ECDD', LW, 4);
    rect(-320, -300, 640, 70, PAL.ink, 0); text('ASAHI · 1932', 0, -248, 48, '#F2ECDD', 'IBM Plex Mono', 600);
    rect(-320, -200, 330, 280, '#E2D8C2', 5);
    ctx.save(); ctx.beginPath(); ctx.rect(-320, -200, 330, 280); ctx.clip(); dog(-150, 60, 0.95, 1, { look: 0 }); ctx.restore();
    for (let i = 0; i < 12; i++) line(40, -190 + i * 24, 320, -190 + i * 24, 7, '#8C8678');
    for (let i = 0; i < 6; i++) line(-320, 120 + i * 26, 320, 120 + i * 26, 7, '#8C8678');
    ctx.restore();
  };
  // 6 · 1934 heykel: kaide üstünde bronz köpek, yanında gerçek Hachikō; "bir yıl sonra" yanındaki yer boş, kar yağar
  scenes[6] = t => {
    const gone = t > w('l07', 13) - 0.1;
    bg(gone ? '#D9DCDD' : '#F0D6B0');
    rect(-400, GY, 1880, 700, gone ? '#E6E6E2' : '#C9BCA4', 0); line(-400, GY, 1480, GY, LW);
    rect(260, 1010, 380, 240, '#B9B1A2', LW, 4); rect(240, 980, 420, 40, '#A49C8C', LW, 4);
    dog(450, 980, 0.95, -1, { bronze: true });
    if (!gone) {
      const pp = [[Y2, 110, 'mutlu'], [Y3, 980, 'mutlu']];
      for (const [c, x, e] of pp) ch(c, { x, y: GY, s: 96, expr: e, head: { look: [x < 500 ? 0.6 : -0.6, 0.2] } }, t);
      line(150, 1120, 960, 1120, 6, PAL.red);
      dog(800, GY, 0.9, -1, { look: -0.12, wag: Math.sin(t * 4) * 0.5 });
    } else {
      seasonFx(t, 4);
      ell(800, GY - 6, 70, 12, 'rgba(0,0,0,0.08)', 0);
    }
  };
  // 7 · gönder: kapıda bekleyen biri (anne), sen telefondan kâğıt uçak yollar
  scenes[7] = t => {
    bg('#2E3646'); for (let i = 0; i < 20; i++) { const r = mulberry32(70 + i); circ(r() * 1080, 300 + r() * 500, 3, '#F6E7B0', 0); }
    rect(560, 760, 460, 490, '#D9C8A8', LW, 4); poly([[530, 760], [790, 600], [1050, 760]], '#7A3A2E', LW);
    rect(700, 900, 170, 350, '#F6D98A', LW, 4);
    rect(-400, GY, 1880, 700, '#5A5E50', 0); line(-400, GY, 1480, GY, LW);
    const go = seg(t, w('l07', 22) - 0.1, 1.1), got = go >= 1;
    ch(CARDS.anne, { x: 785, y: GY, s: 120, expr: got ? 'mutlu' : 'notr', armL: { sh: got ? 110 : 10, el: got ? 40 : -4 }, head: { look: [-0.5, 0] } }, t);
    ch(CARDS.sen, { x: 230, y: GY, s: 140, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(300, 720, u), lerp(960, 1000, u) - Math.sin(u * Math.PI) * 240, 0.9, lerp(-0.6, 0.5, u)); }
    if (got) plane(740, 1030, 0.7, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.1, 620, 990, 0)],
    ...cut(T.l02 - 0.1, P(1.1, 620, 990, 0), P(2.3, 770, 1080, 0)),
    [T.l02end + 0.1, ...P(2.45, 770, 1075, 0)],
    ...cut(T.l03 - 0.1, P(2.45, 770, 1075, 0), P(1.12, 620, 1040, 1)),
    [w('l03', 18) + 0.3, ...P(1.25, 680, 1060, 1)],
    ...cut(w('l03', 19) - 0.1, P(1.25, 680, 1060, 1), P(1.0, 540, 960, 2)),
    [w('l03', 25) - 0.12, ...P(1.06, 560, 960, 2)],
    ...cut(w('l03', 25) - 0.1, P(1.06, 560, 960, 2), P(1.0, 540, 980, 3)),
    [w('l03', 34) - 0.12, ...P(1.12, 540, 990, 3)],
    ...cut(w('l03', 34) - 0.1, P(1.12, 540, 990, 3), P(1.12, 620, 1040, 1)),
    [T.l03end + 0.1, ...P(1.22, 680, 1050, 1)],
    ...cut(T.l04 - 0.1, P(1.22, 680, 1050, 1), P(2.2, 760, 1080, 1)),
    [T.l04end + 0.1, ...P(2.35, 760, 1075, 1)],
    ...cut(T.l05 - 0.1, P(2.35, 760, 1075, 1), P(1.0, 560, 980, 4)),
    [w('l05', 18), ...P(1.12, 640, 1010, 4)],
    ...cut(w('l05', 19) - 0.1, P(1.12, 640, 1010, 4), P(1.0, 540, 960, 5)),
    [w('l05', 28) - 0.25, ...P(1.08, 540, 960, 5)],
    ...cut(w('l05', 28) - 0.2, P(1.08, 540, 960, 5), P(1.0, 560, 1000, 0)),
    [T.l05end + 0.1, ...P(1.06, 600, 1000, 0)],
    [T.l06end + 0.1, ...P(1.5, 760, 1060, 0)],
    ...cut(w('l07', 0) - 0.1, P(1.5, 760, 1060, 0), P(1.0, 540, 980, 6)),
    [w('l07', 13) - 0.12, ...P(1.05, 560, 990, 6)],
    ...cut(w('l07', 13) - 0.1, P(1.05, 560, 990, 6), P(1.0, 620, 1000, 6)),
    [w('l07', 22) - 0.12, ...P(1.22, 680, 1040, 6)],
    ...cut(w('l07', 22) - 0.1, P(1.22, 680, 1040, 6), P(1.0, 540, 940, 7)),
    [T.l07end + 0.2, ...P(1.06, 540, 930, 7)],
    [T.loop0 - 0.001, ...P(1.06, 540, 930, 7)],
    [T.loop0, ...P(1.05, 600, 980, 0)],
    [T.D, ...F0],
  ];
  const DAYS = 2693;   // 21 Mayıs 1925 → 4 Ekim 1932 (Asahi haberi)
  return {
    cam,
    title: ['On yıl', 'bekleyen köpek'],
    kicker: 'BİR HİKÂYE · 9 YIL 9 AY',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(7, i))](t); ctx.restore();
    },
    names: [
      [w('l03', 6) - 0.1, w('l03', 9) - 0.15, 'HIDESABURŌ UENO', 'Tarım profesörü · Tokyo'],
      [w('l03', 9) - 0.1, w('l03', 15), 'HACHIKŌ', 'Akita cinsi köpek'],
      [w('l03', 25) - 0.1, w('l03', 34) - 0.2, '21 Mayıs 1925', 'Ueno üniversitede ölüyor'],
      [w('l07', 0) - 0.1, w('l07', 13) - 0.2, '21 Nisan 1934', 'Heykelin açılışı · Shibuya'],
    ],
    numbers: [
      [w('l03', 21) - 0.1, w('l03', 25) - 0.25, '16 ay', 'BİRLİKTE GEÇEN ZAMAN'],
      [T.l05 + 0.1, w('l05', 19) - 0.25, t => Math.round(DAYS * ease.state(seg(t, T.l05 + 0.1, w('l05', 18) - T.l05))), 'GÜN · 1925’TEN BERİ'],
      [w('l07', 17) - 0.05, w('l07', 22) - 0.2, '3.578', 'GÜN · 9 YIL 9,5 AY'],   // 21.5.1925 → 8.3.1935
    ],
  };
}

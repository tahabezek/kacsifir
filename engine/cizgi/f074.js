// № 074 · Doksan beş yıl sonra ödenen iyilik (çizgi motoru, "Bir hikâye" serisi, iki sesli). Senaryo: research/SENARYOLAR.md §5.
// 1890: Ertuğrul Fırkateyni Kuşimoto açıklarında kayalara çarpar; 69 denizci fenerin ışığına tırmanır, köylüler yiyecek ve
// giysi verir. 1985: Tahran, 48 saatlik süre; iki Türk uçağı 215 Japonu çıkarır; ~500 Türk karayoluyla ayrılır.
// Kaçınılanlar: bedenle ısıtma sahnesi yok, pilot adı yok, THY logosu yok (yalnız düz kırmızı kuyruk).
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
export function hero(T) { return T.w('l05', 32) + 0.3; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[w('l01', 13) - 0.3, w('l01', 13)], [T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [w('l03', 20) - 0.25, w('l03', 20)], [w('l03', 30) - 0.25, w('l03', 30)], [T.l04 - 0.25, T.l04], [w('l05', 7) - 0.25, w('l05', 7)], [T.l06 - 0.25, T.l06], [w('l07', 7) - 0.25, w('l07', 7)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l05', 8), w('l05', 9), w('l05', 10), w('l07', 13)],
    thock: [w('l03', 12), w('l05', 18)],
    rumble: [[w('l03', 6), 0.5], [w('l03', 12), 0.7], [w('l05', 25), 0.4]],
    scratch: [[w('l03', 20), w('l03', 29), 0.02]],
    riser: [w('l05', 25) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.5, 5.2] }, ...o });
const DENIZCI = base({
  key: 'denizci', name: 'Osmanlı denizcisi', seed: 741,
  torso: { len: 0.82, shoulder: 0.64, hip: 0.54, depth: 0.4, belly: 0, color: '#22324A', shade: '#18263A' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#22324A', shade: '#18263A', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#22324A', shade: '#18263A' },
  shoe: { color: '#1A1A1A', len: 0.28, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#1E1814',
  features: ['jacket', 'mustacheThick'],
});
const KOYLU = base({
  key: 'koylu', name: 'Köylü kadın', seed: 742,
  torso: { len: 0.8, shoulder: 0.6, hip: 0.7, depth: 0.42, belly: 0, color: '#3B4A7A', shade: '#2E3A62' },
  arm: { upper: 0.37, lower: 0.35, w: 0.22, color: '#3B4A7A', shade: '#2E3A62', hand: 0.12 },
  leg: { upper: 0.36, lower: 0.34, w: 0.2, color: '#3B4A7A', shade: '#2E3A62' },
  shoe: { color: '#8A6440', len: 0.24, h: 0.08 },
  skin: '#F0CFA8', skinShade: '#D8B48C', hair: '#16130F',
  features: ['cardigan', 'skirt', 'bun'],
});
const KOYLU2 = base({
  key: 'koylu2', name: 'Köylü', seed: 743,
  torso: { len: 0.82, shoulder: 0.64, hip: 0.6, depth: 0.42, belly: 0, color: '#8A6A48', shade: '#6E5438' },
  arm: { upper: 0.4, lower: 0.38, w: 0.2, color: '#8A6A48', shade: '#6E5438', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#4A4038', shade: '#3A322C' },
  shoe: { color: '#8A6440', len: 0.26, h: 0.08 },
  skin: '#E9B98F', skinShade: '#D29E74', hair: '#16130F',
  features: ['vest', 'hairSlick'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, crowd, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, NIGHT = '#1B2636', SEA = '#2B4A62', SEA_D = '#203A50';

  // ——— nesneler ———
  // Ertuğrul: üç direkli ahşap fırkateyn; (x, y) su hattı ortası, k ölçek, rot yalpa (radyan), sağa bakar
  const ship = (x, y, k = 1, rot = 0, flagT = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    const lw = LW / k;
    line(270, -86, 400, -150, lw * 1.2);   // cıvadra
    for (const [mx, h] of [[-150, 320], [20, 370], [170, 330]]) {
      line(mx, -80, mx, -80 - h, lw * 1.6, '#4A3220');
      for (let j = 0; j < 3; j++) { const yy = -80 - h * (0.42 + j * 0.2), hw = 110 - j * 26; line(mx - hw, yy, mx + hw, yy, lw, '#4A3220'); rect(mx - hw * 0.9, yy - 7, hw * 1.8, 14, '#E9DFC9', lw * 0.7, 7); }
      line(mx, -80 - h, mx + (mx < 0 ? -230 : 120), -84, lw * 0.5);
    }
    // sancak: kırmızı zemin, beyaz ay-yıldız (direk tepesi, dalgalanır)
    ctx.save(); ctx.translate(-150, -400); const fw = Math.sin(flagT * 7) * 6;
    poly([[0, 0], [-90, fw], [-90, 56 + fw], [0, 56]], RED, lw * 0.7);
    ctx.beginPath(); ctx.arc(-50, 28 + fw / 2, 15, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.beginPath(); ctx.arc(-45, 28 + fw / 2, 12, 0, 7); ctx.fillStyle = RED; ctx.fill();
    circ(-30, 28 + fw / 2, 5, '#FFFFFF', 0);
    ctx.restore();
    poly([[-275, -82], [292, -92], [244, 26], [-238, 26]], '#6A4428', lw);
    poly([[-275, -82], [292, -92], [284, -64], [-265, -56]], '#1F2421', 0);
    rect(-240, -50, 470, 14, '#F1E9D8', 0);
    for (let i = 0; i < 11; i++) rect(-226 + i * 43, -48, 14, 10, '#1F2421', 0);
    ctx.restore();
  };
  // yolcu uçağı: beyaz gövde, düz kırmızı kuyruk (logo yok); (x, y) merkez, sağa uçar
  const jet = (x, y, k = 1, rot = 0, gear = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    const lw = LW / k;
    poly([[-200, -24], [-250, -110], [-205, -110], [-150, -24]], RED, lw);
    poly([[-30, 10], [-110, 90], [-70, 92], [40, 14]], '#9AA0A6', lw);
    ctx.beginPath(); ctx.moveTo(-230, -26); ctx.lineTo(160, -26); ctx.quadraticCurveTo(230, -22, 238, 4); ctx.quadraticCurveTo(230, 26, 160, 28); ctx.lineTo(-210, 28); ctx.quadraticCurveTo(-250, 10, -230, -26); ctx.closePath();
    ctx.fillStyle = '#F7F5F0'; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke();
    rect(-190, 6, 380, 8, RED, 0);
    for (let i = 0; i < 12; i++) circ(-150 + i * 26, -8, 5, '#2E4A6B', 0);
    poly([[175, -18], [214, -14], [222, -2], [180, -4]], '#2E4A6B', lw * 0.6);
    ell(-20, 44, 34, 15, '#C9CCD0', lw);
    if (gear > 0) { line(-40, 28, -40, 28 + 34 * gear, lw); line(150, 28, 150, 28 + 30 * gear, lw); circ(-40, 30 + 38 * gear, 10, '#2A2A2E', lw * 0.7); circ(150, 30 + 34 * gear, 9, '#2A2A2E', lw * 0.7); }
    ctx.restore();
  };
  // deniz feneri: (x, y) taban; ışık hüzmesi açısı a (sola süpürür)
  const lighthouse = (x, y, k = 1, a = 0, beam = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    const lw = LW / k;
    if (beam > 0) { ctx.save(); ctx.translate(0, -190); ctx.rotate(a); ctx.globalAlpha = 0.32 * beam; ctx.fillStyle = '#FFE9A0'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-1100, -170); ctx.lineTo(-1100, 170); ctx.lineTo(0, 10); ctx.fill(); ctx.restore(); }
    poly([[-46, 0], [46, 0], [32, -160], [-32, -160]], '#F4F1EA', lw);
    rect(-34, -110, 68, 22, RED, 0); rect(-38, -56, 76, 22, RED, 0);
    rect(-30, -205, 60, 45, '#FFE08A', lw, 4); poly([[-38, -205], [38, -205], [0, -240]], RED, lw);
    rect(-44, -165, 88, 12, '#2B2F33', lw);
    ctx.restore();
  };
  const sea = (y0, amp, t, col = SEA, ph = 0) => {
    ctx.beginPath(); ctx.moveTo(-700, 2400);
    for (let x = -700; x <= 1800; x += 30) ctx.lineTo(x, y0 + Math.sin(x * 0.012 + t * 2.4 + ph) * amp + Math.sin(x * 0.031 - t * 3.1) * amp * 0.4);
    ctx.lineTo(1800, 2400); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke();
  };
  const cliff = (x0, top) => { poly([[x0, top + 40], [x0 + 70, top], [1400, top - 20], [1400, 1500], [x0 - 80, 1500], [x0 - 40, 1150], [x0 - 20, 900]], '#3E4A3C', LW); };
  const rocks = (t) => { for (const [rx, ry, rs] of [[680, 1080, 70], [760, 1070, 90], [850, 1090, 60]]) poly([[rx - rs, ry + 30], [rx - rs * 0.5, ry - rs * 0.6], [rx + rs * 0.3, ry - rs * 0.7], [rx + rs, ry + 30]], '#3A3A3E', LW); };
  const rain = (t, n = 60, col = 'rgba(220,230,240,0.55)') => { const r = mulberry32(7401); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.beginPath(); for (let i = 0; i < n; i++) { const x = -200 + r() * 1500, s = 900 + r() * 400, y = ((r() * 2000 + t * s) % 2000) - 100; ctx.moveTo(x, y); ctx.lineTo(x - 40, y + 90); } ctx.stroke(); };
  const fez = (x, y, s, sk) => { const hx = x + sk.head[0] * s, hy = y + sk.head[1] * s; poly([[hx - 0.3 * s, hy - 0.38 * s], [hx + 0.3 * s, hy - 0.38 * s], [hx + 0.24 * s, hy - 0.72 * s], [hx - 0.24 * s, hy - 0.72 * s]], '#B3262A', LW); line(hx, hy - 0.72 * s, hx + 0.32 * s, hy - 0.5 * s, 5, PAL.ink); };
  const stars = (n = 40) => { const r = mulberry32(7402); for (let i = 0; i < n; i++) circ(-100 + r() * 1300, 200 + r() * 700, 2 + r() * 3, '#F4EFE3', 0); };

  const scenes = [];
  // 0 · kapak + fırtına: gece, Kaşinozaki uçurumu ve feneri; fırkateyn dalgalarda; "kayalara çarpıyor"da çarpar, batar
  scenes[0] = t => {
    t = loopT(t);
    const storm = t > w('l03', 6) - 0.1 && t < T.l04 ? 1 : 0.35;
    bg(NIGHT);
    if (storm > 0.5) { const fl = Math.max(0, Math.sin((t - w('l03', 6)) * 2.1) ** 40); if (fl > 0.02) { ctx.save(); ctx.globalAlpha = fl * 0.6; bg('#E8EEF5'); ctx.restore(); } }
    cliff(780, 850);
    lighthouse(930, 850, 0.95, -0.15 + 0.22 * Math.sin(t * 0.9), 1);
    const crash = seg(t, w('l03', 12) - 0.2, 0.6), sink = ease.state(seg(t, w('l03', 14), 3.5));
    const sx = t > w('l03', 6) - 0.1 && t < T.l04 ? lerp(330, 560, ease.state(seg(t, w('l03', 6), w('l03', 12) - w('l03', 6)))) : 330;
    const roll = Math.sin(t * (storm > 0.5 ? 2.6 : 1.3)) * (storm > 0.5 ? 0.09 : 0.03) + crash * 0.22 + sink * 0.18;
    sea(1060, 14 + 26 * storm, t, SEA_D, 1.3);
    ship(sx, 1085 + sink * 230, 0.95, roll, t);
    rocks(t);
    sea(1100, 12 + 30 * storm, t, SEA);
    if (crash > 0 && crash < 1) for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.15 + i * 0.09), r = 40 + crash * 160; circ(640 + Math.cos(a) * r, 1050 + Math.sin(a) * r, 10 * (1 - crash) + 3, '#E8EEF5', 0); }
    if (storm > 0.5) rain(t, 70); else rain(t, 25, 'rgba(220,230,240,0.3)');
  };
  // 1 · rota: İstanbul'dan Japonya'ya kesik çizgi; gemi simgesi yol alır
  scenes[1] = t => {
    bg('#BFD6DC');
    // sade Asya haritası: üstte kara kuşağı, Arabistan ve Hindistan yarımadaları, sağda Japon adaları
    poly([[-200, 640], [1300, 640], [1300, 760], [980, 760], [900, 860], [820, 800], [760, 900], [700, 980], [640, 900], [560, 820], [500, 980], [450, 1000], [420, 860], [340, 820], [300, 960], [250, 1000], [200, 880], [160, 800], [-200, 800]], '#E3D3AE', 5);
    poly([[940, 820], [990, 760], [1030, 790], [1000, 880], [960, 940], [930, 900]], '#E3D3AE', 5);
    const pts = [[120, 790], [230, 960], [380, 1070], [560, 1090], [720, 1040], [860, 960], [945, 900]];
    ctx.save(); ctx.setLineDash([18, 16]); ctx.lineWidth = 7; ctx.strokeStyle = RED; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    circ(120, 790, 16, PAL.ink, 0); circ(945, 900, 16, PAL.ink, 0);
    text('İSTANBUL', 170, 730, 44, PAL.ink); text('1889', 170, 680, 36, '#6B5A3A');
    text('JAPONYA', 900, 730, 44, PAL.ink); text('1890', 900, 680, 36, '#6B5A3A');
    const u = ease.state(seg(t, T.l02, T.l02end - T.l02 + 0.2)), seglen = pts.length - 1, f = u * seglen, i0 = Math.min(seglen - 1, Math.floor(f)), uu = f - i0;
    const px = lerp(pts[i0][0], pts[i0 + 1][0], uu), py = lerp(pts[i0][1], pts[i0 + 1][1], uu);
    ship(px, py + 6, 0.26, 0, t);
  };
  // 2 · dönüş yolu: gün batımında sakin deniz, fırkateyn sağa yol alır
  scenes[2] = t => {
    bg('#F2B880'); circ(300, 820, 120, '#F6D77A', 0);
    sea(1040, 8, t, '#3C6A82');
    ship(lerp(420, 640, seg(t, T.l03, 3.5)), 1062, 1.0, Math.sin(t * 1.4) * 0.025, t);
    sea(1090, 6, t, '#2E5A72', 2);
  };
  // 3 · uçurum: 69 denizci zikzak patikadan fenerin ışığına tırmanır
  scenes[3] = t => {
    bg(NIGHT); stars(30);
    poly([[0, 1500], [0, 700], [300, 640], [700, 560], [1080, 520], [1080, 1500]], '#46523F', LW);
    lighthouse(820, 600, 0.9, -0.4 + 0.25 * Math.sin(t * 0.8), 1);
    const path = [[80, 1320], [600, 1180], [220, 1020], [760, 880], [420, 740], [760, 600]];
    ctx.save(); ctx.lineWidth = 26; ctx.strokeStyle = '#6A7558'; ctx.lineJoin = 'round'; ctx.beginPath(); path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    const prog = seg(t, w('l03', 20) - 0.1, w('l03', 30) - w('l03', 20) + 0.8);
    const at = s => { const n = path.length - 1, f = Math.max(0, Math.min(0.999, s)) * n, i = Math.floor(f), u = f - i; return [lerp(path[i][0], path[i + 1][0], u), lerp(path[i][1], path[i + 1][1], u), path[i + 1][0] > path[i][0] ? 1 : -1]; };
    for (let j = 0; j < 9; j++) {
      const s = prog * 0.75 - j * 0.045 + 0.05; if (s < 0) continue;
      const [x, y, dir] = at(s);
      const sk = ch(DENIZCI, { x, y, s: 46, walk: (t * 1.4 + j * 0.37) % 1, facing: dir, expr: 'yorgun' }, t);
      fez(x, y, 46, sk);
    }
  };
  // 4 · köy: köylü kadın pirinç kâsesi, köylü giysi uzatır; denizci alır
  scenes[4] = t => {
    bg('#E7D8BC'); rect(-600, 1250, 2300, 1400, '#C9B48E', 0); line(-600, 1250, 1700, 1250, LW);
    rect(60, 760, 360, 300, '#B08A5E', LW); poly([[20, 770], [240, 620], [460, 770]], '#6A5A48', LW); rect(200, 900, 80, 160, '#4A3828', LW);
    const give = ease.enter(seg(t, w('l03', 31), 0.6)), give2 = ease.enter(seg(t, w('l03', 34), 0.6));
    ch(KOYLU, { x: 250, y: 1250, s: 118, facing: 1, expr: 'mutlu', armR: { sh: lerp(10, 75, give), el: lerp(-4, 20, give) }, head: { look: [0.5, 0] } }, t);
    const sk = ch(DENIZCI, { x: 760, y: 1250, s: 124, expr: give > 0.5 ? 'mutlu' : 'yorgun', armL: { sh: lerp(10, 60, give), el: 30 }, head: { look: [-0.5, 0.1] } }, t);
    fez(760, 1250, 124, sk);
    if (t > w('l03', 33)) ch(KOYLU2, { x: 520, y: 1260, s: 112, facing: 1, expr: 'notr', armR: { sh: lerp(10, 70, give2), el: 20 }, head: { look: [0.6, 0] } }, t);
    // kâse: elden ele
    const bx = lerp(330, 640, give), by = 1000 - Math.sin(give * Math.PI) * 60;
    ell(bx, by, 46, 16, '#F4F1EA', LW); poly([[bx - 46, by], [bx + 46, by], [bx + 30, by + 34], [bx - 30, by + 34]], '#2E4A6B', LW);
    for (let i = 0; i < 3; i++) { const u = ((t * 0.7 + i / 3) % 1); ctx.save(); ctx.globalAlpha = 1 - u; line(bx - 14 + i * 14, by - 20 - u * 60, bx - 10 + i * 14, by - 40 - u * 60, 5, '#FFFFFF'); ctx.restore(); }
    if (give2 > 0) { const cx = lerp(600, 690, give2); rect(cx - 40, 960, 80, 60, '#E9DFC9', LW, 6); line(cx - 30, 980, cx + 30, 980, 4); }
  };
  // 5 · yıl değişir: 1890 → 1985; arada 95 yıl
  scenes[5] = t => {
    bg('#F2ECDF');
    const u = ease.state(seg(t, T.l04 + 0.2, 1.4)), yr = Math.round(lerp(1890, 1985, u));
    rect(250, 760, 580, 300, '#FFFFFF', LW, 18);
    line(250, 910, 830, 910, 5, 'rgba(31,36,33,0.35)');
    text(String(yr), 540, 975, 190, u >= 1 ? RED : PAL.ink);
    if (u >= 1) text('95 YIL SONRA', 540, 1150, 64, PAL.ink);
    ship(300, 1300, 0.25, 0, t); jet(800, 1290, 0.45, -0.05);
  };
  // 6 · Tahran havalimanı: dağlar, terminal, kule; geri sayım panosu; mahsur yolcular; iki Türk uçağı iner ve kalkar
  scenes[6] = t => {
    const pre = t < T.l02;   // kancadaki ileri atlama: iki uçak gökte, Japonya'ya değil Tahran'dan uçuyor
    bg(pre ? '#E8B48A' : '#E7C9A8');
    poly([[-200, 900], [100, 640], [330, 820], [560, 600], [820, 800], [1100, 640], [1300, 900]], '#B9A48E', LW);
    poly([[480, 650], [560, 600], [640, 650], [600, 660], [560, 640], [520, 660]], '#F4F1EA', 0);
    rect(-300, 1060, 1700, 600, '#8E8678', 0); line(-300, 1060, 1400, 1060, LW);
    rect(-300, 1150, 1700, 60, '#5E5A54', 0);
    for (let i = 0; i < 12; i++) rect(-260 + i * 140, 1175, 70, 10, '#F4F1EA', 0);
    rect(40, 860, 520, 200, '#D8CCB6', LW, 6); for (let i = 0; i < 6; i++) rect(64 + i * 82, 900, 64, 90, '#8FB4C8', 4);
    rect(640, 700, 70, 360, '#CFC4AE', LW); rect(610, 650, 130, 70, '#8FB4C8', LW, 8);
    if (pre) {
      jet(lerp(-100, 700, seg(t, w('l01', 13) - 0.1, 3.4)), 800, 0.85, -0.12);
      jet(lerp(-400, 420, seg(t, w('l01', 13) + 0.2, 3.4)), 700, 0.6, -0.12);
      return;
    }
    // geri sayım panosu: 48 saatten aşağı
    const cd = seg(t, w('l05', 8), w('l05', 25) - w('l05', 8)), hrs = lerp(48, 3.5, ease.state(cd)), H = Math.floor(hrs), M = Math.floor((hrs - H) * 60);
    rect(150, 600, 420, 150, '#1F2421', LW, 12);
    text(String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0'), 360, 715, 104, t > w('l05', 25) ? RED : '#F6C445', '"IBM Plex Mono"', 600);
    // mahsur yolcular
    if (t > w('l05', 18) - 0.1) {
      crowd(40, 980, 500, 2, 7404, 0, 1.0, t);
      if (t < w('l05', 32)) for (let i = 0; i < 4; i++) rect(70 + i * 130, 1030, 46, 34, ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E'][i], 4, 6);
    }
    // iki Türk uçağı: iner, sonra kalkar
    const land = ease.state(seg(t, w('l05', 25), 2.2)), off = ease.enter(seg(t, w('l05', 32) - 0.1, 2.4));
    if (t > w('l05', 25) - 0.1) {
      for (const [j, dx] of [[0, 0], [1, -330]]) {
        const lx = lerp(-600 + dx, 820 + dx * 0.6, land), ly = lerp(700, 1110, land);
        const x = off > 0 ? lerp(820 + dx * 0.6, 1700 + dx, off) : lx, y = off > 0 ? 1110 - off * off * 700 : ly;
        jet(x, y, j ? 0.7 : 0.8, off > 0 ? -0.22 * Math.min(1, off * 3) : 0.04 * (1 - land), off > 0 ? Math.max(0, 1 - off * 4) : land);
      }
    }
  };
  // 7 · karayolu: dağ yolunda arabalar batıya, Türkiye'ye doğru
  scenes[7] = t => {
    bg('#F0C79A');
    poly([[-300, 980], [0, 760], [250, 900], [520, 700], [800, 880], [1100, 720], [1400, 980]], '#C4A07A', LW);
    rect(-300, 980, 1700, 700, '#B79A72', 0); line(-300, 980, 1400, 980, LW);
    poly([[-300, 1250], [1400, 1110], [1400, 1170], [-300, 1330]], '#6A645C', LW);
    rect(900, 980, 16, 160, '#6A5A48', LW); rect(790, 940, 240, 70, '#2E6A4A', LW, 8); text('TÜRKİYE', 910, 990, 40, '#FFFFFF');
    const car = (x, y, col, s = 1) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rect(-60, -40, 120, 30, col, LW, 10); poly([[-34, -40], [-20, -64], [24, -64], [40, -40]], col, LW); rect(-14, -60, 30, 18, '#BFD6DC', 4, 4); circ(-34, -8, 13, '#2A2A2E', LW); circ(34, -8, 13, '#2A2A2E', LW); ctx.restore(); };
    const cols = ['#C2412F', '#E2B13C', '#2E4A6B', '#F4F1EA', '#5E9A4E', '#8A5A3A'];
    for (let i = 0; i < 14; i++) {
      const p = ((t * 0.12 + i / 14) % 1), x = lerp(-280, 1380, p), y = lerp(1290, 1140, p);
      car(x, y, cols[i % cols.length], 0.8);
    }
  };
  // 8 · kapanış: aynı fener bu kez sakin gecede; üstünden bir yolcu uçağı geçer; kâğıt uçak gönderilir
  scenes[8] = t => {
    bg('#22324A'); stars(50);
    circ(260, 520, 54, '#F4EFE3', 0);
    cliff(780, 850);
    lighthouse(930, 850, 0.95, -0.2 + 0.2 * Math.sin(t * 0.7), 0.8);
    sea(1080, 8, t, SEA_D); sea(1110, 6, t, SEA, 2);
    jet(lerp(-300, 1300, seg(t, w('l07', 7) - 0.2, 6)), 640, 0.55, -0.06);
    const go = seg(t, w('l07', 13) - 0.1, 1.4);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(120, 900, u), lerp(1200, 800, u) - Math.sin(u * Math.PI) * 120, 0.9, lerp(-0.5, -0.2, u)); }
    if (go >= 1) plane(900 + (t - w('l07', 13) - 1.3) * 60, 800 - (t - w('l07', 13) - 1.3) * 40, 0.7, -0.25);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [w('l01', 13) - 0.1, ...P(1.06, 560, 950, 0)],
    ...cut(w('l01', 13) - 0.1, P(1.06, 560, 950, 0), P(1.0, 540, 940, 6)),
    [T.l01end + 0.2, ...P(1.06, 540, 920, 6)],
    ...cut(T.l02 - 0.1, P(1.06, 540, 920, 6), P(1.0, 540, 960, 1)),
    [T.l02end + 0.1, ...P(1.1, 560, 950, 1)],
    ...cut(T.l03 - 0.1, P(1.1, 560, 950, 1), P(1.0, 540, 960, 2)),
    [w('l03', 6) - 0.1, ...P(1.1, 560, 950, 2)],
    ...cut(w('l03', 6) - 0.1, P(1.1, 560, 950, 2), P(1.0, 520, 960, 0)),
    [w('l03', 12), ...P(1.3, 640, 980, 0)],
    [w('l03', 14), ...P(1.25, 640, 990, 0)],
    [w('l03', 20) - 0.1, ...P(1.05, 600, 980, 0)],
    ...cut(w('l03', 20) - 0.1, P(1.05, 600, 980, 0), P(1.25, 360, 1180, 3)),
    [w('l03', 29), ...P(1.05, 560, 860, 3)],
    ...cut(w('l03', 30) - 0.1, P(1.05, 560, 860, 3), P(1.0, 520, 1010, 4)),
    [T.l03end + 0.1, ...P(1.12, 520, 1000, 4)],
    ...cut(T.l04 - 0.1, P(1.12, 520, 1000, 4), P(1.0, 540, 960, 5)),
    [w('l05', 7) - 0.1, ...P(1.1, 540, 950, 5)],
    ...cut(w('l05', 7) - 0.1, P(1.1, 540, 950, 5), P(1.15, 400, 760, 6)),
    [w('l05', 18) - 0.2, ...P(1.2, 380, 760, 6)],
    [w('l05', 25) - 0.2, ...P(1.15, 330, 980, 6)],
    [w('l05', 32), ...P(0.9, 540, 900, 6)],
    [T.l05end + 0.2, ...P(0.85, 620, 860, 6)],
    ...cut(T.l06 - 0.1, P(0.85, 620, 860, 6), P(1.0, 540, 1040, 7)),
    [w('l07', 7) - 0.1, ...P(1.1, 600, 1040, 7)],
    ...cut(w('l07', 7) - 0.1, P(1.1, 600, 1040, 7), P(1.0, 540, 960, 8)),
    [T.l07end + 0.3, ...P(1.06, 560, 940, 8)],
    [T.loop0 - 0.001, ...P(1.06, 560, 940, 8)],
    [T.loop0, ...P(1.05, 560, 950, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['95 yıl sonra', 'ödenen iyilik'],
    kicker: 'BİR HİKÂYE · 95 YIL',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(8, i))](t); ctx.restore();
    },
    names: [],
    numbers: [
      [w('l03', 14) - 0.1, w('l03', 20) - 0.2, '587', 'DENİZCİ HAYATINI KAYBETTİ'],
      [w('l03', 20) - 0.05, w('l03', 29), '69', 'KURTULAN DENİZCİ'],
      [w('l05', 8) - 0.1, w('l05', 18) - 0.25, '48 saat', 'SONRA HER UÇAK HEDEF'],
      [w('l05', 32) - 0.05, T.l06 - 0.2, '215', 'JAPON YOLCU'],
      [w('l07', 0) - 0.05, w('l07', 7) - 0.2, '500', 'TÜRK KARAYOLUYLA ÇIKTI'],
    ],
  };
}

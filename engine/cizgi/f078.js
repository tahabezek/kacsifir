// № 078 · Seksen üç yaşında en büyük eser (çizgi motoru, "Bir hikâye" serisi, iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Kahraman Mimar Sinan üç yaşta: genç yeniçeri (börk, bıyık), baş mimar (kır sakal, kavuk), seksenlik usta (ak sakal, büyük kavuk).
// Doruk: Selimiye çizilir, kubbe ölçüsü 31,30 m; Ayasofya karşılaştırması dürüst (çaplar neredeyse aynı; "kendi anlatımına göre").
// Kapanış: kâğıt uçak "bunu yaşının çok geç olduğunu düşünen birine gönder". Sahneler 1400 px arayla; kamera [t, zoom, x, y].

const SX = 1400;
export function hero(T) { return T.w('l05', 15) + 0.1; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.3, T.l03], [w('l03', 10) - 0.3, w('l03', 10)], [w('l03', 16) - 0.3, w('l03', 16)], [T.l04 - 0.25, T.l04], [w('l05', 5) - 0.3, w('l05', 5)], [w('l05', 16) - 0.3, w('l05', 16)], [w('l05', 22) - 0.3, w('l05', 22)], [T.l06 - 0.25, T.l06], [w('l07', 16) - 0.3, w('l07', 16)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 8), w('l03', 25), w('l03', 26), w('l03', 27), w('l03', 28), w('l05', 12), w('l07', 16)],
    thock: [w('l05', 7)],
    scratch: [[w('l03', 16), w('l03', 24), 0.02], [w('l05', 5), hero(T), 0.03], [T.l06, w('l07', 15), 0.02]],
    riser: [w('l05', 16), w('l05', 22) - 0.05],
    impact: w('l05', 22) - 0.1,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const robe = (col, sh) => ({ torso: { len: 0.84, shoulder: 0.68, hip: 0.72, depth: 0.5, belly: 0.06, color: col, shade: sh }, arm: { upper: 0.4, lower: 0.38, w: 0.2, color: col, shade: sh, hand: 0.13 }, leg: { upper: 0.4, lower: 0.38, w: 0.22, color: col, shade: sh } });
const SINAN = base({ key: 'sinan', name: 'Mimar Sinan', seed: 781, ...robe('#4E6E5A', '#3C5646'), shoe: { color: '#8A3A2A', len: 0.28, h: 0.11 }, skin: '#E3B48C', skinShade: '#C89A72', hair: '#E9E6DF', eyes: { gap: 0.34, w: 0.18, h: 0.21, y: 0.03, lid: 0.22 }, features: ['skirt'] });
const SINAN_MID = base({ key: 'sinanMid', name: 'Mimar Sinan', seed: 782, ...robe('#2E4A6B', '#233A55'), shoe: { color: '#8A3A2A', len: 0.28, h: 0.11 }, skin: '#E3B48C', skinShade: '#C89A72', hair: '#8A8580', features: ['skirt'] });
const YENICERI = base({ key: 'yeniceri', name: 'Sinan (genç)', seed: 783,
  torso: { len: 0.84, shoulder: 0.68, hip: 0.6, depth: 0.44, belly: 0, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.41, lower: 0.39, w: 0.18, color: '#2E4A6B', shade: '#233A55', hand: 0.13 },
  leg: { upper: 0.41, lower: 0.39, w: 0.2, color: '#C2412F', shade: '#9E3324' },
  shoe: { color: '#E2B13C', len: 0.3, h: 0.11 }, skin: '#E3B48C', skinShade: '#C89A72', hair: '#2A1E16', features: ['mustacheThick'] });

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, plane, CARDS, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, STONE = '#E9D9BC', STONE_S = '#D2BE98', LEAD = '#8C9AA6', LEAD_S = '#73818D';

  // Sinan: karakter + sakal + kavuk (ya da yeniçeri börkü); birim koordinatta, baş merkezi sk.head
  const sinan = (card, o, t, kind = 'old') => {
    const sk = ch(card, o, t), side = o.view === 'side';
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s * (side ? (o.facing ?? 1) : 1), o.s);
    const [hx, hy] = sk.head, fx = side ? 0.14 : 0;
    const fsk = (fill, lw = 0.05) => { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke(); };
    if (kind !== 'young') {
      const bl = kind === 'old' ? 0.95 : 0.72;
      ctx.beginPath(); ctx.moveTo(hx + fx - 0.42, hy + 0.0); ctx.quadraticCurveTo(hx + fx - 0.36, hy + bl * 0.9, hx + fx, hy + bl);
      ctx.quadraticCurveTo(hx + fx + 0.36, hy + bl * 0.9, hx + fx + 0.42, hy); ctx.lineTo(hx + fx + 0.24, hy + 0.36); ctx.lineTo(hx + fx - 0.24, hy + 0.36); ctx.closePath();
      fsk(kind === 'old' ? '#F2EFE8' : '#9A948C');
      const kk = kind === 'old' ? 1 : 0.85;
      ctx.beginPath(); ctx.ellipse(hx, hy - 0.5 * kk - 0.05, 0.66 * kk, 0.44 * kk, 0, 0, Math.PI * 2); fsk('#FBF8F1');
      ctx.beginPath(); ctx.ellipse(hx, hy - 0.5 * kk - 0.05, 0.42 * kk, 0.3 * kk, 0.5, Math.PI * 1.05, Math.PI * 1.9); ctx.lineWidth = 0.035; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(hx, hy - 0.86 * kk, 0.18 * kk, 0.14 * kk, 0, 0, Math.PI * 2); fsk(kind === 'old' ? '#4E6E5A' : '#2E4A6B');
    } else {
      ctx.beginPath(); ctx.moveTo(hx - 0.42, hy - 0.36); ctx.lineTo(hx - 0.3, hy - 1.3); ctx.quadraticCurveTo(hx + 0.02, hy - 1.42, hx + 0.1, hy - 1.3); ctx.lineTo(hx + 0.42, hy - 0.36); ctx.closePath(); fsk('#F4F1EA');
      ctx.beginPath(); ctx.moveTo(hx - 0.3, hy - 1.28); ctx.quadraticCurveTo(hx - 0.86, hy - 1.0, hx - 0.74, hy - 0.42); ctx.lineTo(hx - 0.52, hy - 0.5); ctx.quadraticCurveTo(hx - 0.6, hy - 0.95, hx - 0.24, hy - 1.05); ctx.closePath(); fsk('#E9E3D6');
      ctx.beginPath(); ctx.rect(hx - 0.44, hy - 0.5, 0.88, 0.16); fsk('#E2B13C');
    }
    ctx.restore();
    return sk;
  };

  // Selimiye: merkez cx, zemin gy, ölçek k (1 m ≈ 9,5k px); kubbe sekizgen kasnakta, dört ince minare
  const selimiye = (cx, gy, k = 1, build = 1) => {
    const m = 9.5 * k;
    const mn = x => { const h = 70.9 * m, wd = 2.4 * m; rect(x - wd / 2, gy - h * 0.86, wd, h * 0.86, STONE, LW * 0.8); for (const f of [0.45, 0.62, 0.78]) rect(x - wd * 0.95, gy - h * f, wd * 1.9, 0.9 * m, STONE_S, LW * 0.6, 3); poly([[x - wd * 0.62, gy - h * 0.86], [x, gy - h], [x + wd * 0.62, gy - h * 0.86]], LEAD, LW * 0.8); };
    if (build > 0.85) { mn(cx - 33 * m); mn(cx + 33 * m); }
    rect(cx - 28 * m, gy - 16 * m, 56 * m, 16 * m, STONE, LW);
    for (let i = 0; i < 7; i++) { const x = cx - 24 * m + i * 8 * m; rect(x - 1.4 * m, gy - 12 * m, 2.8 * m, 6 * m, '#6E5A48', 3, 1.4 * m); }
    for (const sx of [-1, 1]) { const x = cx + sx * 24 * m; rect(x - 3 * m, gy - 24 * m, 6 * m, 8 * m, STONE_S, LW * 0.8); ctx.beginPath(); ctx.arc(x, gy - 24 * m, 3 * m, Math.PI, 0); ctx.closePath(); ctx.fillStyle = LEAD; ctx.fill(); ctx.lineWidth = LW * 0.8; ctx.strokeStyle = PAL.ink; ctx.stroke(); }
    rect(cx - 20 * m, gy - 26 * m, 40 * m, 10 * m, STONE, LW);
    for (let i = 0; i < 8; i++) { const x = cx - 17 * m + i * 4.85 * m; rect(x - 0.9 * m, gy - 24 * m, 1.8 * m, 4.5 * m, '#9FC0CF', 2.5, 0.9 * m); }
    const r = 15.65 * m, dy = gy - 26 * m, b = Math.max(0, Math.min(1, build));
    ctx.beginPath(); ctx.moveTo(cx - r, dy); ctx.arc(cx, dy, r, Math.PI, Math.PI + Math.PI * b, false); if (b < 1) ctx.lineTo(cx, dy); ctx.closePath();
    ctx.fillStyle = LEAD; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke();
    if (b >= 1) { for (let i = 1; i < 6; i++) { const a = Math.PI + i * Math.PI / 6; line(cx + Math.cos(a) * r * 0.25, dy + Math.sin(a) * r * 0.25, cx + Math.cos(a) * r, dy + Math.sin(a) * r, 3, LEAD_S); } line(cx, dy - r, cx, dy - r - 3 * m, 5); }
    if (build > 0.85) { mn(cx - 33 * m); }
  };
  // Ayasofya (sade): kare gövde, yanlarda payandalar, yayvan kubbe, dört kalın minare
  const ayasofya = (cx, gy, k = 1) => {
    const m = 9.5 * k;
    for (const x of [cx - 36 * m, cx + 36 * m]) { rect(x - 1.8 * m, gy - 60 * m, 3.6 * m, 60 * m, '#E3B6A0', LW * 0.8); rect(x - 2.6 * m, gy - 40 * m, 5.2 * m, 1 * m, '#C99580', 3); poly([[x - 2.2 * m, gy - 60 * m], [x, gy - 68 * m], [x + 2.2 * m, gy - 60 * m]], LEAD, LW * 0.8); }
    rect(cx - 32 * m, gy - 22 * m, 64 * m, 22 * m, '#D99A86', LW);
    for (const sx of [-1, 1]) poly([[cx + sx * 32 * m, gy], [cx + sx * 32 * m, gy - 22 * m], [cx + sx * 26 * m, gy - 34 * m], [cx + sx * 20 * m, gy - 34 * m]], '#C98C78', LW);
    rect(cx - 19 * m, gy - 40 * m, 38 * m, 18 * m, '#D99A86', LW);
    ctx.beginPath(); ctx.ellipse(cx, gy - 40 * m, 15.5 * m, 10.5 * m, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = LEAD; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke();
    for (let i = 0; i < 9; i++) rect(cx - 13 * m + i * 3.2 * m, gy - 39.5 * m, 1.4 * m, 2.6 * m, '#9FC0CF', 2);
  };
  const houses = (gy, seed, col = '#D9C2A3') => { const r = mulberry32(seed); for (let i = 0; i < 9; i++) { const x = -260 + i * 180 + r() * 40, h = 60 + r() * 70, wd = 120 + r() * 40; rect(x, gy - h, wd, h, col, 4); poly([[x - 10, gy - h], [x + wd / 2, gy - h - 40], [x + wd + 10, gy - h]], '#B4563A', 4); } };

  const GY = 1250;
  const scenes = [];
  // 0 · kapak ve kanca: Edirne, Selimiye; önde seksenlik Sinan, elinde plan
  scenes[0] = t => {
    t = loopT(t);
    bg('#CFE0E6'); houses(GY - 40, 784, '#E3D3B8'); rect(-600, GY - 40, 2400, 1000, '#B9A98C', 0); line(-600, GY - 40, 1800, GY - 40, 5);
    selimiye(630, GY - 40, 1.1);
    rect(-600, GY, 2400, 900, '#D8C9AE', 0); line(-600, GY, 1800, GY, LW);
    const ta = talk(t, -1, -1);
    sinan(SINAN, { x: 210, y: GY + 20, s: 132, expr: t > T.l02end ? 'mutlu' : 'notr', talk: ta, armR: { sh: 70, el: 40 }, armL: { sh: 20, el: 60 }, head: { look: [0.6, -0.4] } }, t);
  };
  // 1 · genç yeniçeri: nehir üstünde ahşap köprü, sonra bir kadırga
  scenes[1] = t => {
    bg('#D6E4E0'); rect(-600, 1130, 2400, 200, '#6E9AB0', 0); line(-600, 1130, 1800, 1130, 5); rect(-600, 1330, 2400, 600, '#9DB07A', 0); line(-600, 1330, 1800, 1330, 5);
    poly([[-600, 1130], [180, 1130], [120, 1330], [-600, 1330]], '#9DB07A', 0);
    const bu = ease.enter(seg(t, w('l03', 6) - 0.2, 0.9));
    if (bu > 0) { ctx.save(); ctx.beginPath(); ctx.rect(150, 0, 900 * bu, 2000); ctx.clip();
      ctx.beginPath(); ctx.moveTo(160, 1110); ctx.quadraticCurveTo(560, 860, 980, 1110); ctx.lineWidth = 34; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.lineWidth = 24; ctx.strokeStyle = '#A87A4E'; ctx.stroke();
      for (let i = 1; i < 8; i++) { const x = 160 + i * 103, y = 1110 - Math.sin(i / 8 * Math.PI) * 125; line(x, y, x, 1180, 9, '#6A4A2E'); }
      ctx.restore(); }
    const sh = seg(t, w('l03', 8) - 0.2, 1.6);
    if (sh > 0) { const x = lerp(1250, 700, ease.enter(sh)); ctx.save(); ctx.translate(x, 1200); poly([[-170, -30], [170, -30], [120, 30], [-130, 30]], '#8A5A34', LW); line(0, -30, 0, -220, 7); poly([[4, -210], [110, -120], [4, -60]], '#F4F1EA', LW); for (let i = 0; i < 6; i++) line(-110 + i * 40, 20, -130 + i * 40, 70, 5); ctx.restore(); }
    sinan(YENICERI, { x: 140, y: 1330, s: 130, expr: 'notr', armR: { sh: 95, el: 10 }, head: { look: [0.7, -0.2] } }, t, 'young');
  };
  // 2 · baş mimar: kır sakallı Sinan çizim masasında
  const desk = (night = false) => {
    rect(440, 980, 560, 30, '#A87A4E', LW, 6); rect(470, 1010, 26, 240, '#8A6440', LW); rect(944, 1010, 26, 240, '#8A6440', LW);
    rect(500, 950, 440, 34, '#F4ECD8', 4, 4); for (let i = 0; i < 4; i++) line(530 + i * 100, 966, 590 + i * 100, 966, 4, '#6B6458');
  };
  scenes[2] = t => {
    bg('#EFE6D6'); rect(-600, GY, 2400, 900, '#C9B08E', 0); line(-600, GY, 1800, GY, LW);
    rect(560, 560, 340, 300, '#F4ECD8', LW, 6); selimiye(730, 830, 0.42, seg(t, w('l03', 10), 3.5));
    desk();
    sinan(SINAN_MID, { x: 300, y: GY + 10, s: 140, expr: 'notr', armR: { sh: 80, el: 30 }, head: { look: [0.6, 0.2] } }, t, 'mid');
  };
  // 3 · elli yılda üç yüzü aşkın yapı: ikon ızgarası; söylenen tür kırmızı yanar
  const icon = (x, y, s, kind, col) => {
    if (kind === 0) { rect(x - s * 0.4, y - s * 0.2, s * 0.8, s * 0.45, col, 3); ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.3, Math.PI, 0); ctx.closePath(); ctx.fillStyle = LEAD; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.stroke(); line(x + s * 0.42, y + s * 0.25, x + s * 0.42, y - s * 0.55, 4); }
    else if (kind === 1) { ctx.beginPath(); ctx.moveTo(x - s * 0.48, y + s * 0.2); ctx.quadraticCurveTo(x, y - s * 0.45, x + s * 0.48, y + s * 0.2); ctx.lineWidth = 7; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); }
    else if (kind === 2) { for (const dx of [-0.22, 0.22]) { ctx.beginPath(); ctx.arc(x + dx * s, y, s * 0.2, Math.PI, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.stroke(); } rect(x - s * 0.45, y, s * 0.9, s * 0.22, col, 3); }
    else { rect(x - s * 0.3, y - s * 0.35, s * 0.6, s * 0.6, col, 3); line(x, y - s * 0.05, x + s * 0.12, y + s * 0.08, 3); circ(x, y + s * 0.38, s * 0.06, '#5E8FA6', 0); }
  };
  scenes[3] = t => {
    bg('#F2ECDF');
    const n = Math.floor(300 * ease.state(seg(t, w('l03', 16), w('l03', 24) - w('l03', 16) + 0.4)));
    const r = mulberry32(785), kinds = []; for (let i = 0; i < 300; i++) kinds.push(Math.floor(r() * 4));
    const hot = [25, 26, 27, 28].reduce((a, k, i) => (t >= w('l03', k) - 0.05 ? i : a), -1);
    for (let i = 0; i < n; i++) { const c = i % 20, rr = Math.floor(i / 20), x = 140 + c * 42, y = 690 + rr * 40; icon(x, y, 34, kinds[i], hot === kinds[i] ? RED : STONE); }
  };
  // 4 · Ayasofya: hedef kubbe, çap ölçüsü
  scenes[4] = t => {
    bg('#E3DCEA'); houses(GY - 10, 786, '#D9CBB8'); rect(-600, GY - 10, 2400, 900, '#B9A98C', 0); line(-600, GY - 10, 1800, GY - 10, 5);
    ayasofya(540, GY - 10, 0.95);
    const u = ease.enter(seg(t, w('l05', 2) - 0.1, 0.6)), m = 9.5 * 0.95, y = GY - 10 - 40 * m - 12;
    if (u > 0) { line(540 - 15.5 * m * u, y, 540 + 15.5 * m * u, y, 7, RED); text('≈ 31 m', 540, y - 10.5 * m - 30, 52, RED); }
    sinan(SINAN_MID, { x: 140, y: GY + 60, s: 118, view: 'side', facing: 1, expr: 'notr', head: { look: [0.5, -0.5] } }, t, 'mid');
  };
  // 5 · Selimiye planı: daire kubbe, sekiz ayak, 31,30 m
  scenes[5] = t => {
    bg('#F4ECD8');
    for (let i = 0; i < 24; i++) line(-200 + i * 70, 400, -200 + i * 70, 1500, 1.5, '#D8CDB6');
    for (let i = 0; i < 18; i++) line(-200, 400 + i * 70, 1400, 400 + i * 70, 1.5, '#D8CDB6');
    const cx = 540, cy = 960, R = 300, dr = ease.state(seg(t, w('l05', 5) - 0.1, 1.2));
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * dr); ctx.lineWidth = 9; ctx.strokeStyle = PAL.ink; ctx.stroke();
    const oct = Array.from({ length: 8 }, (_, i) => [cx + Math.cos(i * Math.PI / 4 + Math.PI / 8) * R * 1.08, cy + Math.sin(i * Math.PI / 4 + Math.PI / 8) * R * 1.08]);
    const pc = Math.floor(8 * seg(t, w('l05', 12) - 0.1, 0.8) + 0.001);
    if (pc >= 8) poly(oct, null, 4);
    for (let i = 0; i < pc; i++) rect(oct[i][0] - 26, oct[i][1] - 26, 52, 52, RED, LW, 6);
    const mu = ease.enter(seg(t, w('l05', 7) - 0.1, 0.6));
    if (mu > 0) { line(cx - R * mu, cy, cx + R * mu, cy, 7, RED); text('31,30 m', cx, cy - 26, 64, RED); }
  };
  // 6 · dürüst karşılaştırma: iki kubbe çapı neredeyse aynı
  scenes[6] = t => {
    bg('#EFE6D6');
    const u = ease.enter(seg(t, w('l05', 16), 0.8)), m = 15.5;
    const dome = (cx, y, d, col, lab, val) => { ctx.beginPath(); ctx.arc(cx, y, d / 2 * m * u + 1, Math.PI, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke(); line(cx - d / 2 * m * u, y + 30, cx + d / 2 * m * u, y + 30, 7, RED); text(lab, cx, y + 100, 44); text(val, cx, y + 160, 54, RED); };
    dome(290, 1010, 31.0, '#D99A86', 'AYASOFYA', '≈ 31 m');
    dome(790, 1010, 31.3, LEAD, 'SELİMİYE', '31,30 m');
  };
  // 7 · gece, seksenlik Sinan hâlâ çiziyor; mum
  scenes[7] = t => {
    bg('#2E3446'); rect(-600, GY, 2400, 900, '#4A4038', 0); line(-600, GY, 1800, GY, LW);
    ctx.save(); ctx.globalAlpha = 0.35 + 0.05 * Math.sin(t * 9); circ(860, 900, 260, '#F6C26B', 0); ctx.restore();
    rect(140, 600, 260, 340, '#3E465C', LW, 120); line(270, 600, 270, 940, 5);
    desk();
    for (let i = 0; i < 4; i++) rect(520, 930 - i * 12, 160, 10, '#F4ECD8', 3);
    rect(850, 890, 24, 60, '#F4F1EA', 4); poly([[862, 850 + 3 * Math.sin(t * 11)], [852, 880], [872, 880]], '#F6B26B', 3);
    sinan(SINAN, { x: 330, y: GY + 10, s: 140, expr: 'notr', talk: 0, armR: { sh: 75 + 6 * Math.sin(t * 5), el: 35 }, head: { look: [0.6, 0.3] } }, t);
  };
  // 8 · gönder: sen, yaşını bahane eden birine (anne) kâğıt uçak yollar
  scenes[8] = t => {
    bg('#F1E7D8'); rect(-600, 1230, 2400, 900, '#D9C7A9', 0); line(-600, 1230, 1800, 1230, LW);
    const go = seg(t, w('l07', 16) - 0.1, 1.1), got = go >= 1;
    ch('sen', { x: 240, y: 1230, s: 150, facing: 1, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    ch('anne', { x: 830, y: 1230, s: 150, facing: -1, expr: got ? 'mutlu' : 'notr', armL: { sh: got ? 140 : 10, el: got ? 20 : -4 }, head: { look: [-0.6, 0] } }, t);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(320, 760, u), lerp(980, 920, u) - Math.sin(u * Math.PI) * 260, 0.9, lerp(-0.6, 0.5, u)); }
    if (got) plane(760, 940, 0.7, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.08, 520, 960, 0)],
    ...cut(T.l02 - 0.1, P(1.08, 520, 960, 0), P(2.2, 260, 950, 0)),
    [T.l02end + 0.1, ...P(2.35, 260, 950, 0)],
    ...cut(T.l03 - 0.1, P(2.35, 260, 950, 0), P(1.0, 540, 1000, 1)),
    [w('l03', 10) - 0.11, ...P(1.06, 560, 1010, 1)],
    ...cut(w('l03', 10) - 0.1, P(1.06, 560, 1010, 1), P(1.0, 540, 960, 2)),
    [w('l03', 16) - 0.11, ...P(1.08, 520, 950, 2)],
    ...cut(w('l03', 16) - 0.1, P(1.08, 520, 950, 2), P(1.0, 540, 980, 3)),
    [T.l03end + 0.1, ...P(1.04, 540, 980, 3)],
    ...cut(T.l04 - 0.1, P(1.04, 540, 980, 3), P(1.0, 540, 960, 4)),
    [w('l05', 5) - 0.11, ...P(1.1, 540, 930, 4)],
    ...cut(w('l05', 5) - 0.1, P(1.1, 540, 930, 4), P(0.95, 540, 980, 5)),
    [w('l05', 16) - 0.11, ...P(1.02, 540, 970, 5)],
    ...cut(w('l05', 16) - 0.1, P(1.02, 540, 970, 5), P(1.0, 540, 1000, 6)),
    [w('l05', 22) - 0.11, ...P(1.05, 540, 1000, 6)],
    ...cut(w('l05', 22) - 0.1, P(1.05, 540, 1000, 6), P(0.95, 540, 960, 0)),
    [T.l05end + 0.1, ...P(1.0, 520, 960, 0)],
    ...cut(T.l06 - 0.1, P(1.0, 520, 960, 0), P(1.0, 540, 960, 7)),
    [w('l07', 16) - 0.11, ...P(1.12, 480, 980, 7)],
    ...cut(w('l07', 16) - 0.1, P(1.12, 480, 980, 7), P(1.0, 540, 930, 8)),
    [T.l07end + 0.3, ...P(1.06, 540, 910, 8)],
    [T.loop0 - 0.001, ...P(1.06, 540, 910, 8)],
    [T.loop0, ...P(1.04, 530, 960, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['83 yaşında', 'en büyük eseri'],
    kicker: 'BİR HİKÂYE · SELİMİYE',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(8, i))](t); ctx.restore();
    },
    names: [
      [w('l03', 0) - 0.1, w('l03', 10) - 0.3, 'Sinan', 'ÖNCE BİR YENİÇERİ'],
      [w('l03', 10) - 0.05, w('l03', 16) - 0.3, 'Baş mimar', 'YAKLAŞIK 48 YAŞINDA'],
    ],
    numbers: [
      [w('l03', 16) - 0.05, T.l03end + 0.1, t => { const v = Math.round(300 * ease.state(seg(t, w('l03', 16), w('l03', 24) - w('l03', 16) + 0.4))); return v >= 300 ? '300+' : String(v); }, 'YAPI · 50 YILDA'],
      [w('l05', 22) - 0.05, T.l06 - 0.2, '83 yaş', 'SELİMİYE · 1574'],
      [w('l07', 7) - 0.1, w('l07', 16) - 0.3, '1588', 'ÖLENE KADAR BAŞ MİMAR'],
    ],
  };
}

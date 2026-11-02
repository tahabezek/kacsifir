// № 065 · Duyulan en uzak ses: Krakatoa ve Tonga (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: Rodrigues kıyısında, elinde defter, doğuya kulak veren polis şefi Wallis; ufuktan gelen ses halkaları.
// Doruk: haritada iki halka; Krakatoa'nın 4.800 km'lik halkası ve Tonga gümbürtülerinin yaklaşık iki kat büyük halkası.

const SX = 1400;
const base = (o) => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const WALLIS = base({
  key: 'wallis', name: 'James Wallis', seed: 651,
  torso: { len: 0.88, shoulder: 0.72, hip: 0.58, depth: 0.44, belly: 0.06, color: '#F2EEE4', shade: '#D6D0C2' },
  arm: { upper: 0.42, lower: 0.4, w: 0.18, color: '#F2EEE4', shade: '#D6D0C2', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#F2EEE4', shade: '#D6D0C2' },
  shoe: { color: '#2A221C', len: 0.31, h: 0.12 },
  skin: '#E9B98F', skinShade: '#D29E74', hair: '#7A4A2A',
  features: ['jacket', 'hairSlick', 'mustacheThick'],
});
const SAILOR = base({
  key: 'tayfa', name: 'Tayfa', seed: 653,
  torso: { len: 0.84, shoulder: 0.7, hip: 0.56, depth: 0.42, belly: 0, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.42, lower: 0.4, w: 0.18, color: '#2E4A6B', shade: '#233A55', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#3A3F48', shade: '#2B2F36' },
  shoe: { color: '#1E1E1E', len: 0.3, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#2A211C',
  features: ['hairMessy'],
});
const DAD = base({
  key: 'alaskali', name: 'Alaskalı baba', seed: 657,
  torso: { len: 0.86, shoulder: 0.72, hip: 0.6, depth: 0.46, belly: 0.1, color: '#8A3A3A', shade: '#6E2C2C' },
  arm: { upper: 0.42, lower: 0.4, w: 0.19, color: '#8A3A3A', shade: '#6E2C2C', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.21, color: '#3A4A6A', shade: '#2B3850' },
  shoe: { color: '#5A3A2A', len: 0.3, h: 0.11 },
  skin: '#ECC6A2', skinShade: '#D4AA84', hair: '#B08A5A',
  features: ['hoodie', 'hairMessy', 'mustacheThin'],
});
const MOM = base({
  key: 'alaskali2', name: 'Alaskalı anne', seed: 659,
  head: { w: 0.94, h: 1, ear: 0.11 }, neck: 0.05,
  torso: { len: 0.78, shoulder: 0.62, hip: 0.66, depth: 0.42, belly: 0, color: '#4A6A8A', shade: '#3A5470' },
  arm: { upper: 0.38, lower: 0.36, w: 0.17, color: '#4A6A8A', shade: '#3A5470', hand: 0.12 },
  leg: { upper: 0.38, lower: 0.36, w: 0.18, color: '#4A6A8A', shade: '#3A5470' },
  shoe: { color: '#5A3A2A', len: 0.27, h: 0.1 },
  skin: '#F0D4BE', skinShade: '#D8B89E', hair: '#5A3A22',
  features: ['cardigan', 'skirt', 'bun'],
});

export function hero(T) { return T.w('l07', 'ulaşıyor') + 0.4; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'gemide') - 0.3, w('l03', 'gemide')], [w('l03', 23) - 0.3, w('l03', 23)], [w('l03', 'basınç') - 0.3, w('l03', 'basınç')], [T.l05 - 0.3, T.l05], [w('l07', 'gece') - 0.3, w('l07', 'gece')], [w('l07', 32) - 0.3, w('l07', 32)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 'yazıyor')],
    thock: [w('l03', 22) - 0.05],
    rumble: [[0.5, 0.25], [w('l03', 'patlıyor'), 0.7], [w('l03', 'doğudan'), 0.3], [w('l05', 'patlayıp'), 0.4], [w('l07', 'tonga'), 0.6], [w('l07', 'gümbürtülerle'), 0.35]],
    scratch: [[w('l07', 32), hero(T), 0.02]],
    riser: [w('l07', 32) - 0.2, hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const ring = (x, y, r, a, col = PAL.ink, lw = 8) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); };
  const sea = (y0, sky, water) => { bg(sky); rect(-400, y0, 1880, 2400, water, 0); line(-400, y0, 1480, y0, LW); for (let i = 0; i < 10; i++) line(-300 + i * 190, y0 + 60 + (i % 3) * 40, -220 + i * 190, y0 + 60 + (i % 3) * 40, 5, 'rgba(244,239,227,0.5)'); };
  const helmet = (x, y) => { ctx.beginPath(); ctx.ellipse(x, y, 66, 46, 0, Math.PI, 0); ctx.fillStyle = '#F4F1EA'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke(); line(x - 86, y, x + 86, y, 8); };
  const notebook = (x, y, lines, k = 1) => { rect(x - 110, y - 70, 220, 150, '#F4EFE3', LW, 8); for (let i = 0; i < lines; i++) line(x - 80, y - 36 + i * 30, x - 80 + 160 * (i + 1 < lines ? 1 : k), y - 36 + i * 30, 5, '#2E4A6B'); };
  const wallisAt = (t, x, write) => {
    ch(WALLIS, { x, y: GY, s: S, view: 'side', facing: 1, expr: write ? 'notr' : 'saskin', armR: { sh: 70, el: 60 }, armL: { sh: 50, el: 80 }, head: { look: [write ? 0 : 0.8, write ? 0.6 : 0] } }, t);
    helmet(x + 8, GY - 3.12 * S);
  };

  const scenes = [];
  // 0 · Rodrigues kıyısı: polis şefi doğuya kulak verir; ufuktan ses halkaları (kanca)
  scenes[0] = t => {
    t = loopT(t);
    sea(1120, '#F2D9A8', '#3A7A9A');
    rect(-400, 1300, 1880, 900, '#E3C894', 0); poly([[-400, 1300], [1480, 1250], [1480, 1320], [-400, 1340]], '#E3C894', LW);
    for (const [x, h] of [[90, 380], [180, 300]]) { line(x, 1300, x + 30, 1300 - h, 14, '#7A5634'); for (let k = 0; k < 5; k++) { const a = -2.4 + k * 0.4; line(x + 30, 1300 - h, x + 30 + Math.cos(a) * 110, 1300 - h + Math.sin(a) * -60 + 30, 12, '#4C8240'); } }
    for (let k = 0; k < 4; k++) { const p = (((t * 0.5 + k / 4) % 1) + 1) % 1; ring(1060, 1100, 60 + p * 420, 0.6 * (1 - p), PAL.ink, 6); }
    wallisAt(t, 480, false);
    notebook(720, 1170, 2, 0.5);
  };
  // 1 · Krakatoa patlıyor: koni, duman sütunu, şok halkası
  scenes[1] = t => {
    const ex = seg(t, w('l03', 'krakatoa') - 0.1, 0.7);
    sea(1180, ex > 0 ? '#D8A07A' : '#BFD6DC', '#2E5A7A');
    poly([[180, 1190], [460, 760], [620, 760], [900, 1190]], '#5A5048', LW); poly([[420, 820], [460, 760], [620, 760], [660, 820], [540, 850]], '#3A332C', 4);
    if (ex > 0) {
      const r = mulberry32(3);
      for (let i = 0; i < 26; i++) { const u = r(), x = 540 + (r() - 0.5) * (60 + u * 520) * ease.enter(ex), y = 760 - u * 760 * ease.enter(ex); circ(x, y, (30 + u * 70) * ease.enter(ex), ['#6A625A', '#8A8078', '#4A443E'][i % 3], 4); }
      for (let k = 0; k < 2; k++) { const p = seg(t, w('l03', 'krakatoa') + k * 0.9, 1.6); ring(540, 900, 80 + p * 700, 0.9 * (1 - p), '#F4EFE3', 14); }
      ctx.save(); ctx.globalAlpha = 0.5 * (1 - ex); ctx.fillStyle = '#FFF6D8'; ctx.fillRect(-400, -400, 1880, 2800); ctx.restore();
    }
    rect(160, 600, 280, 120, PAL.paper, LW, 12); text('1883', 300, 690, 76, A.INK);
  };
  // 2 · gemi güvertesi: tayfa kulaklarını tutuyor
  scenes[2] = t => {
    sea(1000, '#9AA6B2', '#2E5A7A');
    rect(-400, 1140, 1880, 260, '#8A6A48', LW, 0); for (let i = 0; i < 10; i++) line(-300 + i * 200, 1140, -300 + i * 200, 1400, 4, '#6E5236'); rect(-400, 1300, 1880, 900, '#7A5A3C', 0);
    line(780, 1140, 780, 300, 14, '#5A4030'); poly([[790, 360], [1000, 480], [790, 640]], '#F2EEE4', LW);
    const hit = seg(t, w('l03', 'kulak') - 0.6, 0.4);
    const ears = { armL: { sh: lerp(10, 150, hit), el: lerp(0, 125, hit) }, armR: { sh: lerp(10, 150, hit), el: lerp(0, 125, hit) } };
    [[300, -1], [560, 1]].forEach(([x, f], i) => ch(SAILOR, { x, y: GY, s: S, ...ears, expr: hit > 0 ? 'korku' : 'saskin', head: { tilt: hit > 0 ? (i ? 10 : -10) : 0 }, legL: { hip: 6, knee: hit * 20 }, legR: { hip: 6, knee: hit * 20 } }, t));
    rect(160, 560, 300, 130, PAL.paper, LW, 12); text('64 km', 310, 650, 70, A.INK);
  };
  // 3 · Rodrigues: deftere yazar, Türkçe alıntı kâğıtta
  scenes[3] = t => {
    sea(1120, '#F2D9A8', '#3A7A9A');
    rect(-400, 1300, 1880, 900, '#E3C894', 0); poly([[-400, 1300], [1480, 1250], [1480, 1320], [-400, 1340]], '#E3C894', LW);
    const write = t > w('l03', 'deftere') - 0.2;
    wallisAt(t, 300, write);
    const q = seg(t, w('l03', 'doğudan') - 0.2, 0.35);
    if (q > 0) { ctx.save(); ctx.translate(640, 820 + (1 - ease.enter(q)) * 60); ctx.rotate(-0.04); rect(-230, -170, 460, 340, '#F4EFE3', LW, 10); for (let i = 0; i < 5; i++) line(-200, -110 + i * 62, 200, -110 + i * 62, 3, 'rgba(46,74,107,0.3)'); ['"Doğudan,', 'uzaktan gelen', 'ağır top', 'sesleri."'].forEach((s, i) => text(s, 0, -96 + i * 62, 46, '#2E4A6B', 'Archivo', 700)); text('— J. Wallis, 1883', 40, 150, 30, '#8A6A48', 'Archivo', 600); ctx.restore(); }
    else notebook(520, 1170, 3, seg(t, w('l03', 'deftere'), 1.0));
  };
  // 4 · dünya: basınç dalgası gezegeni dolaşıyor
  scenes[4] = t => {
    bg('#1E2A3A'); const r = mulberry32(9); for (let i = 0; i < 40; i++) circ(r() * 1080, r() * 1920, 3 + r() * 3, '#F6E7B0', 0);
    circ(540, 960, 330, '#3A7A9A', LW); for (const [x, y, rx, ry] of [[440, 860, 120, 80], [640, 1040, 90, 120], [520, 1160, 70, 40], [380, 1040, 60, 50]]) ell(x, y, rx, ry, '#6E9A5A', 5);
    const u = seg(t, w('l03', 'basınç') - 0.2, T.l04end + 0.4 - w('l03', 'basınç'));
    ctx.save(); ctx.beginPath(); ctx.arc(540, 960, 330, 0, Math.PI * 2); ctx.clip();
    for (let k = 0; k < 3; k++) { const p = (u * 2 + k / 3) % 1; ctx.beginPath(); ctx.ellipse(540, 960, 330 * Math.sin(p * Math.PI), 330, 0, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = '#F4EFE3'; ctx.globalAlpha = 0.85; ctx.stroke(); }
    ctx.restore();
    circ(700, 1060, 14, PAL.red, 4);
  };
  // 5 · Tonga: denizden yükselen bulut, 57 km cetveli
  scenes[5] = t => {
    const ex = seg(t, w('l05', 'patlayıp') - 0.2, 1.2), cl = seg(t, w('l07', 'bulutu') - 0.3, w('l07', 'çıkıyor') - w('l07', 'bulutu') + 0.6);
    sea(1180, '#9AA6B2', '#2E5A7A');
    const H = lerp(140, 900, ease.enter(Math.max(ex * 0.35, cl)));
    if (ex > 0) { poly([[500, 1180], [580, 1180], [620, 1180 - H * 0.6], [460, 1180 - H * 0.6]], '#8A8078', LW); const r = mulberry32(5); for (let i = 0; i < 16; i++) circ(540 + (r() - 0.5) * 420 * ease.enter(cl), 1180 - H + (r() - 0.5) * 120, 60 + r() * 50, ['#A8A098', '#8A8078'][i % 2], 4); for (let k = 0; k < 2; k++) { const p = (t * 0.6 + k / 2) % 1; ring(540, 1180, 100 + p * 600, 0.5 * (1 - p), '#F4EFE3', 8); } }
    if (cl > 0) { line(860, 1180, 860, 1180 - H, 8); for (let k = 0; k <= 5; k++) line(840, 1180 - H * k / 5, 880, 1180 - H * k / 5, 6); rect(700, 1180 - H - 130, 300, 110, PAL.paper, LW, 12); text(Math.round(57 * ease.enter(cl)) + ' km', 850, 1180 - H - 52, 62, A.INK); }
    rect(150, 600, 280, 120, PAL.paper, LW, 12); text('2022', 290, 690, 76, A.INK);
  };
  // 6 · Alaska, gece: ev, uyanan aile, havai fişek ve "bodrumdaki geyik"
  scenes[6] = t => {
    bg('#14202E'); const r = mulberry32(13); for (let i = 0; i < 30; i++) circ(r() * 1080, r() * 900, 3 + r() * 3, '#F6E7B0', 0);
    rect(-400, 1300, 1880, 900, '#E8EEF2', 0); line(-400, 1300, 1480, 1300, LW);
    poly([[160, 760], [540, 500], [920, 760]], '#5A3A2A', LW); rect(200, 760, 680, 540, '#8A5A3A', LW, 0);
    const shake = seg(t, w('l07', 'gümbürtülerle') - 0.2, 0.3) * (1 - seg(t, w('l07', 'uyanıyor') + 0.4, 0.6));
    const wake = t > w('l07', 'uyanıyor') - 0.3;
    rect(260 + 6 * Math.sin(t * 40) * shake, 820, 200, 160, wake ? '#F6D77A' : '#2A3446', LW, 6); rect(620 + 6 * Math.sin(t * 43) * shake, 820, 200, 160, wake ? '#F6D77A' : '#2A3446', LW, 6);
    rect(470, 1080, 140, 220, '#5A3A22', LW, 6);
    if (shake > 0) for (const x of [140, 940]) { line(x, 900, x + 30, 940, 6); line(x, 960, x + 30, 1000, 6); }
    const fw = t > w('l07', 'kimi') - 0.2 && t < w('l07', 26) - 0.2, moose = t > w('l07', 26) - 0.2;
    ch(DAD, { x: 360, y: GY, s: S, expr: moose ? 'saskin' : fw ? 'mutlu' : wake ? 'korku' : 'yorgun', armR: fw ? { sh: 150, el: 20 } : moose ? { sh: 60, el: 80 } : { sh: 10, el: 10 }, head: { look: fw ? [0.3, -0.8] : [0, 0] } }, t);
    ch(MOM, { x: 720, y: GY, s: S, expr: moose ? 'mutlu' : wake ? 'saskin' : 'yorgun', armL: { sh: 20, el: 40 } }, t);
    if (fw) for (let k = 0; k < 2; k++) { const x = 300 + k * 420, y = 420 + k * 60, p = (t * 1.2 + k * 0.5) % 1; ctx.save(); ctx.translate(x, y); for (let i = 0; i < 10; i++) { ctx.rotate(Math.PI / 5); line(0, 20 * p, 0, 90 * p + 20, 7, [PAL.gold, PAL.red][k]); } ctx.restore(); }
    if (moose) { ctx.save(); ctx.translate(540, 650); rect(-170, -110, 340, 220, PAL.paper, LW, 20); ell(0, 30, 80, 46, '#7A5634', 5); circ(-70, -10, 34, '#7A5634', 5); for (const s of [-1, 1]) { line(-70 + s * 20, -40, -70 + s * 60, -90, 7); line(-70 + s * 50, -75, -70 + s * 80, -70, 7); } line(40, 60, 90, 100, 8); rect(70, 90, 60, 20, '#8C9298', 4, 4); text('?', 130, -40, 60, PAL.red); ctx.restore(); }
  };
  // 7 · harita: iki halka (Krakatoa 4.800 km, Tonga gümbürtüleri ~iki katı)
  const K = [330, 1000], TG = [700, 1260], AK = [600, 830];
  scenes[7] = t => {
    bg('#D9C9A8'); rect(120, 380, 840, 1180, '#3A7A9A', LW, 16);
    for (const [x, y, rx, ry] of [[320, 900, 120, 60], [560, 700, 180, 90], [760, 480, 160, 70], [260, 600, 100, 150], [850, 1000, 80, 160]]) ell(x, y, rx, ry, '#C9B48A', 5);
    ctx.save(); ctx.beginPath(); ctx.rect(126, 386, 828, 1168); ctx.clip();
    const a = ease.enter(seg(t, T.l07 - 0.2, 1.2)), b = ease.enter(seg(t, w('l07', 32) - 0.1, hero(T) - w('l07', 32) + 0.1));
    ring(K[0], K[1], 230 * a, a > 0 ? 1 : 0, '#F2B24A', 12);
    ring(TG[0], TG[1], 450 * b, b > 0 ? 1 : 0, '#F4EFE3', 12);
    ctx.restore();
    const pin = ([x, y], s, c, right) => { circ(x, y, 16, c, 5); const bw = s.length * 24 + 24; rect(right ? x + 24 : x - 24 - bw, y - 30, bw, 54, PAL.paper, 4, 8); text(s, right ? x + 24 + bw / 2 : x - 24 - bw / 2, y + 12, 34, A.INK); };
    pin(K, 'KRAKATOA', PAL.red, true); pin(TG, 'TONGA', PAL.red, false); pin(AK, 'ALASKA', '#F4EFE3', false);
  };

  // ——— kamera ———
  const ZK = 1.5, YO = 60;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.05, 560, 950, 0)],
    [T.l02end + 0.1, ...P(1.12, 600, 940, 0)],
    ...cut(T.l03 - 0.15, P(1.12, 600, 940, 0), P(0.9, 540, 900, 1)),
    [w('l03', 'gemide') - 0.2, ...P(0.78, 540, 820, 1)],
    ...cut(w('l03', 'gemide') - 0.15, P(0.78, 540, 820, 1), P(1.0, 460, 940, 2)),
    [w('l03', 22) + 0.3, ...P(1.12, 440, 960, 2)],
    ...cut(w('l03', 23) - 0.15, P(1.12, 440, 960, 2), P(1.0, 480, 960, 3)),
    [w('l03', 'doğudan') - 0.2, ...P(1.0, 520, 960, 3)],
    [w('l03', 'sesleri') + 0.5, ...P(1.08, 560, 920, 3)],
    ...cut(w('l03', 'basınç') - 0.15, P(1.08, 560, 920, 3), P(0.9, 540, 960, 4)),
    [T.l04end + 0.3, ...P(0.95, 540, 960, 4)],
    ...cut(T.l05 - 0.15, P(0.95, 540, 960, 4), P(0.9, 540, 900, 5)),
    [T.l06end + 0.3, ...P(0.85, 540, 860, 5)],
    [w('l07', 'bulutu') - 0.2, ...P(0.85, 560, 760, 5)],
    [w('l07', 'çıkıyor') + 0.6, ...P(0.78, 600, 700, 5)],
    ...cut(w('l07', 'gece') - 0.15, P(0.78, 600, 700, 5), P(0.95, 540, 900, 6)),
    [w('l07', 'kimi') - 0.2, ...P(1.0, 540, 940, 6)],
    [w('l07', 26) + 0.4, ...P(1.0, 540, 900, 6)],
    ...cut(w('l07', 32) - 0.15, P(1.0, 540, 900, 6), P(0.82, 540, 960, 7)),
    [hero(T), ...P(0.8, 540, 960, 7)],
    [T.loop0 - 0.001, ...P(0.86, 540, 940, 7)],
    [T.loop0, ...P(1.03, 545, 958, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'polis') - 0.1, w('l03', 'doğudan') - 0.3, 'JAMES WALLIS', 'Rodrigues polis şefi · 1883'], [w('l07', 'tonga') - 0.1, w('l07', 'bulutu') - 0.3, 'HUNGA TONGA', 'denizin altındaki yanardağ · 2022']],
    numbers: [[w('l07', 32) - 0.05, hero(T) - 0.8, '4.800 km', 'KRAKATOA → RODRIGUES'], [hero(T) - 0.4, T.l09 + 0.3, '~9.400 km', 'TONGA → ALASKA']],
  };
}

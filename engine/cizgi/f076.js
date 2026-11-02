// № 076 · Savaşı yirmi dokuz yıl bitmeyen asker (çizgi motoru, "Bir hikâye" serisi, iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Ton: tuhaf ve hüzünlü; kahramanlık pozu yok, şiddet çizilmez. Onoda tek bir kartla (1944) ve aynı oranlarda yaşlı hâliyle (1974).
// Görsel yay: ağaçtaki takvim (1944 → Ağustos 1945) → emir → not, bildiriler, aile fotoğrafı reddedilir → ateş başında 4 → 1
// → takvim yaprakları 1974'e uçar → genç gezgin → kitapçıdaki eski komutan → emir okunur, tüfek yere bırakılır → kâğıt uçak.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
export function hero(T) { return T.w('l07', 40) + 0.1; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [w('l03', 8) - 0.3, w('l03', 8)], [w('l03', 17) - 0.3, w('l03', 17)], [w('l03', 22) - 0.3, w('l03', 22)], [T.l04 - 0.25, T.l04], [T.l06 - 0.25, T.l06], [w('l07', 0) - 0.3, w('l07', 0)], [w('l07', 25) - 0.3, w('l07', 25)], [w('l07', 30) - 0.3, w('l07', 30)], [w('l07', 41) - 0.3, w('l07', 41)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l01', 15), w('l03', 0), w('l05', 3), w('l05', 6), w('l07', 0)],
    thock: [w('l03', 15), w('l03', 29)],
    rumble: [[w('l03', 17), 0.5]],
    scratch: [[T.l06, T.l06end, 0.02]],
    riser: [w('l07', 33), hero(T) - 0.3],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
// Teğmen Hiroo Onoda (1944): ince, haki üniforma; kasket sahnede çizilir. 1974 hâli aynı oranlar, solmuş ve yamalı üniforma, kır saç
const onodaCard = (old) => base({
  key: old ? 'onoda74' : 'onoda44', name: 'Hiroo Onoda', seed: old ? 772 : 771,
  head: { w: 0.88, h: 1.02, ear: 0.12 }, neck: 0.07,
  torso: { len: 0.84, shoulder: 0.64, hip: 0.5, depth: 0.4, belly: 0, color: old ? '#9C9470' : '#7E7A4C', shade: old ? '#827A58' : '#66623C' },
  arm: { upper: 0.41, lower: 0.39, w: 0.17, color: old ? '#9C9470' : '#7E7A4C', shade: old ? '#827A58' : '#66623C', hand: 0.12 },
  leg: { upper: 0.42, lower: 0.4, w: 0.19, color: old ? '#8C8462' : '#6E6A42', shade: '#56522F' },
  shoe: { color: '#3A2A1E', len: 0.29, h: 0.11 },
  skin: old ? '#C99A70' : '#E0B48A', skinShade: old ? '#AE825A' : '#C79A70', hair: old ? '#6E6A64' : '#1E1814',
  eyes: { gap: 0.33, w: 0.17, h: 0.21, y: 0.03, lid: old ? 0.22 : 0.1 },
  features: ['hairSlick'],
});
const ONODA = onodaCard(false), ONODA74 = onodaCard(true);
const KOMUTAN = base({
  key: 'komutan', name: 'Komutan', seed: 781,
  torso: { len: 0.88, shoulder: 0.7, hip: 0.6, depth: 0.46, belly: 0.06, color: '#5E6640', shade: '#4A5232' },
  arm: { upper: 0.42, lower: 0.4, w: 0.19, color: '#5E6640', shade: '#4A5232', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#4E5636', shade: '#3C4228' },
  shoe: { color: '#2A1E16', len: 0.3, h: 0.11 },
  skin: '#E2B48A', skinShade: '#C79A70', hair: '#1E1814',
  features: ['hairSlick', 'mustacheThin'],
});
const KITAPCI = base({
  key: 'kitapci', name: 'Taniguchi (1974)', seed: 782,
  torso: { len: 0.86, shoulder: 0.68, hip: 0.66, depth: 0.48, belly: 0.1, color: '#8C887C', shade: '#726E64' },
  arm: { upper: 0.41, lower: 0.39, w: 0.19, color: '#8C887C', shade: '#726E64', hand: 0.13 },
  leg: { upper: 0.41, lower: 0.39, w: 0.2, color: '#4A4640', shade: '#38342F' },
  shoe: { color: '#2A1E16', len: 0.3, h: 0.11 },
  skin: '#E0B48A', skinShade: '#C79A70', hair: '#C2BDB6',
  features: ['cardigan', 'baldSides', 'glassesRect', 'mustacheThin'],
});
const GEZGIN = base({
  key: 'gezgin', name: 'Gezgin', seed: 791,
  torso: { len: 0.8, shoulder: 0.64, hip: 0.52, depth: 0.4, belly: 0, color: '#3F6E8C', shade: '#325A74' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#3F6E8C', shade: '#325A74', hand: 0.13 },
  leg: { upper: 0.41, lower: 0.39, w: 0.2, color: '#3A4A66', shade: '#2C3A52' },
  shoe: { color: '#6A4A2E', len: 0.3, h: 0.12 },
  skin: '#EBC29E', skinShade: '#D2A580', hair: '#1E1814',
  features: ['jacket', 'hairMessy'],
});
const INATCI = base({
  key: 'inatci', name: 'İnatçı arkadaş', seed: 795,
  torso: { len: 0.8, shoulder: 0.66, hip: 0.56, depth: 0.42, belly: 0.03, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#2E4A6B', shade: '#233A55', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#F4F1EA', len: 0.29, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#2A211C',
  features: ['hoodie', 'hairSpiky'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, plane, CARDS, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const GY = 1250;
  const G1 = '#3E6B3A', G2 = '#2F5A30', G3 = '#5E8A48', G4 = '#7FA65A';

  // dünya koordinatında el ve baş (önden çizilen karakterler için)
  const at = (o, sk, key) => [o.x + sk[key][0] * o.s, o.y + sk[key][1] * o.s];
  // tüfek: (x, y) tutulan nokta, a açı (0 = yukarı), boy px
  const rifle = (x, y, a, L = 300) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    rect(-9, -L * 0.62, 18, L * 0.62, '#2B2F33', LW * 0.8, 4);
    poly([[-12, -L * 0.05], [12, -L * 0.05], [16, L * 0.36], [-18, L * 0.38]], '#7A5638', LW * 0.8);
    ctx.restore();
  };
  // asker kasketi (önden): baş merkezinden
  const cap = (o, sk, col = '#6E6A42') => {
    const [hx, hy] = at(o, sk, 'head'), s = o.s;
    poly([[hx - 0.44 * s, hy - 0.3 * s], [hx - 0.4 * s, hy - 0.66 * s], [hx + 0.4 * s, hy - 0.66 * s], [hx + 0.44 * s, hy - 0.3 * s]], col, LW);
    ell(hx, hy - 0.3 * s, 0.34 * s, 0.07 * s, '#3A3424', LW);
    circ(hx, hy - 0.5 * s, 0.06 * s, '#E2B13C', LW * 0.6);
  };
  // yaprak: (x, y) sap, uzunluk L, açı a
  const leaf = (x, y, L, a, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.28, -L * 0.42, 0, -L); ctx.quadraticCurveTo(-L * 0.28, -L * 0.42, 0, 0);
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke();
    line(0, -L * 0.05, 0, -L * 0.85, LW * 0.5); ctx.restore();
  };
  const jungle = (t, sky = '#CFE0C8', seed = 7) => {
    bg(sky);
    const r = mulberry32(seed);
    for (let i = 0; i < 7; i++) { const x = -200 + i * 230 + r() * 60; rect(x, 520, 46, 760, '#5A4632', LW, 10); }
    for (let i = 0; i < 26; i++) { const x = -250 + r() * 1580, y = 560 + r() * 500; leaf(x, y, 140 + r() * 120, (r() - 0.5) * 2.2 + 0.05 * Math.sin(t * 1.3 + i), [G1, G2, G3][i % 3]); }
    rect(-400, GY, 1880, 700, '#5E5236', 0); line(-400, GY, 1480, GY, LW);
  };
  const front = (t, seed = 11) => {   // ön plan yaprakları (kenarlar)
    const r = mulberry32(seed);
    for (let i = 0; i < 9; i++) { const left = i % 2 === 0, x = left ? -60 + r() * 120 : 1000 + r() * 140; leaf(x, 1380 + r() * 120, 300 + r() * 140, (left ? 0.5 : -0.5) + (r() - 0.5) * 0.7 + 0.04 * Math.sin(t * 1.1 + i), [G2, G1, G4][i % 3]); }
  };
  // ağaca çivili takvim yaprağı
  const calendar = (x, y, mon, yr, k = 1, mark = false) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    rect(-110, -80, 220, 200, '#FBF8F1', LW, 6); rect(-110, -80, 220, 50, PAL.red, LW, 6);
    text(mon, 0, -42, 34, '#FBF8F1', 'IBM Plex Mono', 600); text(yr, 0, 70, 76, PAL.ink);
    circ(0, -92, 9, '#8C9298', 3);
    if (mark) { rect(-120, 132, 240, 56, PAL.red, LW, 8); text('SAVAŞ BİTTİ', 0, 172, 34, '#FBF8F1'); }
    ctx.restore();
  };
  const fire = (x, y, t, k = 1) => {
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(x - 50 + i * 34, y); ctx.rotate(i % 2 ? 0.5 : -0.5); rect(-12, -50, 24, 100, '#6A4A2E', LW * 0.8, 6); ctx.restore(); }
    for (let i = 0; i < 3; i++) { const h = (90 + 30 * Math.sin(t * 9 + i * 2)) * k, fx = x - 34 + i * 34; poly([[fx - 30 * k, y], [fx, y - h], [fx + 30 * k, y]], ['#E8662A', '#F2A23A', '#F6D77A'][i], 4); }
  };
  const glow = (x, y, r, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(246,190,90,${a})`); g.addColorStop(1, 'rgba(246,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const photo = (x, y, k = 1, a = 0) => {   // aile fotoğrafı: iki küçük figür
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(k, k);
    rect(-70, -56, 140, 112, '#FBF8F1', LW, 4); rect(-56, -44, 112, 80, '#C9B79A', 3);
    for (const [px, c] of [[-24, '#5E4A3A'], [24, '#7A3A4A']]) { circ(px, -14, 14, '#EBC29E', 3); rect(px - 16, 2, 32, 34, c, 3, 6); }
    ctx.restore();
  };

  const scenes = [];
  // 0 · kapak: ormanda yarı saklı Onoda; ağaçtaki takvim Aralık 1944 → "sekiz ay sonra" Ağustos 1945
  scenes[0] = t => {
    t = loopT(t);
    jungle(t);
    const flip = ease.enter(seg(t, w('l01', 15) - 0.1, 0.35));
    if (flip < 1) calendar(200, 900, 'ARALIK', '1944', 1);
    if (flip > 0) { ctx.save(); ctx.translate(200, 820); ctx.scale(1, flip); ctx.translate(-200, -820); calendar(200, 900, 'AĞUSTOS', '1945', 1, t > w('l01', 17)); ctx.restore(); }
    const o = { x: 640, y: GY, s: 150, expr: t > T.l02 - 0.1 && t < T.l02end + 0.3 ? 'korku' : 'yorgun', armR: { sh: 34, el: 64 }, armL: { sh: 38, el: 74 }, head: { look: [Math.sin(t * (t > T.l02 - 0.1 ? 3 : 0.8)) * 0.7, 0], tilt: 0 } };
    const sk = ch(ONODA, o, t); cap(o, sk);
    const [hx, hy] = at(o, sk, 'handR'); rifle(hx, hy, 0.38, 330);
    front(t);
  };
  // 1 · emir (Aralık 1944): komutan kâğıdı uzatır; "asla teslim olma"
  scenes[1] = t => {
    bg('#E9DFC9'); rect(-400, 560, 1880, 60, '#7E7A4C', LW); poly([[-400, 620], [540, 520], [1480, 620]], '#8E8A5A', LW);
    rect(-400, GY, 1880, 700, '#9C8466', 0); line(-400, GY, 1480, GY, LW);
    rect(380, 1020, 320, 30, '#7A5638', LW, 6); rect(400, 1050, 24, 200, '#5E4128', LW); rect(656, 1050, 24, 200, '#5E4128', LW);
    const ko = { x: 270, y: GY, s: 150, expr: 'kizgin', talk: talk(t, w('l03', 5), w('l03', 8)), armR: { sh: 80, el: 10 }, head: { look: [0.5, 0] } };
    const ks = ch(KOMUTAN, ko, t); cap(ko, ks, '#4E5636');
    const oo = { x: 820, y: GY, s: 150, expr: 'notr', armL: { sh: 10, el: -4 }, armR: { sh: 150, el: 40 }, head: { look: [-0.5, 0] } };
    const os = ch(ONODA, oo, t); cap(oo, os);
    const [px, py] = at(ko, ks, 'handR'), u = ease.enter(seg(t, w('l03', 5) - 0.2, 0.5));
    rect(px - 10, py - 70, 150, 110, '#FBF8F1', LW, 4); for (let i = 0; i < 3; i++) line(px + 10, py - 46 + i * 22, px + 120, py - 46 + i * 22, 4);
    if (u > 0) { ctx.save(); ctx.translate(px + 100, py + 14); ctx.scale(u, u); circ(0, 0, 20, PAL.red, 3); ctx.restore(); }
  };
  // 2 · köylülerin notu (1945): sopaya iliştirilmiş kâğıt; "propaganda" → buruşturur
  scenes[2] = t => {
    jungle(t, '#D6E3C6', 21);
    const crush = ease.enter(seg(t, w('l03', 15) - 0.1, 0.5));
    line(330, GY, 330, 900, 12, '#7A5638');
    const nk = 1 - 0.75 * crush;
    ctx.save(); ctx.translate(330, 880); ctx.rotate(crush * 1.4); ctx.scale(nk, nk);
    if (crush < 0.6) { rect(-100, -90, 200, 150, '#FBF8F1', LW, 4); for (let i = 0; i < 4; i++) line(-76, -60 + i * 28, 76, -60 + i * 28, 5, '#8C8678'); }
    else poly([[-60, -10], [-30, -60], [20, -50], [60, -10], [40, 40], [-20, 50]], '#FBF8F1', LW);
    ctx.restore();
    const o = { x: 640, y: GY, s: 150, expr: crush > 0 ? 'kizgin' : 'notr', armR: { sh: crush > 0 ? 20 : 30, el: 60 }, armL: { sh: lerp(80, 20, crush), el: lerp(20, 40, crush) }, head: { look: [crush > 0.3 ? 0.4 : -0.6, crush > 0.3 ? 0 : -0.1], tilt: crush > 0.3 ? 8 : 0 } };
    const sk = ch(ONODA, o, t); cap(o, sk);
    const [hx, hy] = at(o, sk, 'handR'); rifle(hx, hy, 0.3, 330);
    calendar(900, 760, 'EKİM', '1945', 0.7);
    front(t, 12);
  };
  // 3 · uçaktan bildiriler: küçük uçak geçer, kâğıtlar süzülür; Onoda bakar, "sahte" der ve döner
  scenes[3] = t => {
    bg('#BFD6DC'); for (let i = 0; i < 4; i++) { circ(120 + i * 300, 560 + (i % 2) * 50, 50, '#F4F1EA', 0); circ(170 + i * 300, 550 + (i % 2) * 50, 64, '#F4F1EA', 0); }
    const u = seg(t, w('l03', 17) - 0.3, 3.0), px = lerp(-200, 1300, u);
    if (u > 0 && u < 1) { ctx.save(); ctx.translate(px, 700); rect(-90, -16, 180, 32, '#8C9298', LW, 14); poly([[-20, -10], [10, -10], [30, -70], [10, -70]], '#8C9298', LW); poly([[-80, -10], [-60, -10], [-70, -50], [-90, -50]], '#8C9298', LW); circ(96, 0, 10, '#2B2F33', 3); ctx.restore(); }
    const r = mulberry32(31);
    for (let i = 0; i < 26; i++) { const t0 = w('l03', 17) + r() * 1.6 - 0.2, x0 = -100 + r() * 1300, f = seg(t, t0, 4.5); if (f <= 0) continue; const y = 720 + f * 700, x = x0 + Math.sin(t * 3 + i) * 40; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 4 + i) * 0.8); rect(-26, -18, 52, 36, '#FBF8F1', 4, 2); ctx.restore(); }
    for (let i = 0; i < 12; i++) leaf(-150 + i * 120, 1260, 260 + (i % 3) * 60, (i % 2 ? 0.3 : -0.3) + 0.04 * Math.sin(t + i), [G1, G2, G3][i % 3]);
    rect(-400, 1240, 1880, 700, G2, 0);
    const away = t > w('l03', 20) - 0.1;
    const o = { x: 780, y: 1330, s: 150, expr: away ? 'kizgin' : 'saskin', armR: { sh: 30, el: 60 }, head: { look: away ? [-0.7, 0.2] : [-0.3, -0.7], tilt: away ? -6 : 0 } };
    const sk = ch(ONODA, o, t); cap(o, sk);
    const [hx, hy] = at(o, sk, 'handR'); rifle(hx, hy, 0.35, 330);
    for (let i = 0; i < 6; i++) leaf(640 + i * 90, 1420, 280, -0.4 + i * 0.16, [G2, G1, G4][i % 3]);
    calendar(170, 900, 'KASIM', '1945', 0.7);
  };
  // 4 · aile mektupları ve fotoğrafları (1952): fotoğrafa bakar, "tuzak" deyip yere bırakır
  scenes[4] = t => {
    jungle(t, '#D2DEC0', 41);
    const drop = ease.state(seg(t, w('l03', 29) - 0.05, 0.6));
    const o = { x: 560, y: GY, s: 160, expr: drop > 0 ? 'yorgun' : 'notr', armR: { sh: lerp(70, 15, drop), el: lerp(60, 10, drop) }, armL: { sh: 10, el: -4 }, head: { look: [0.2, drop > 0 ? 0.4 : 0.5], tilt: drop > 0 ? 10 : 4 } };
    const sk = ch(ONODA, o, t); cap(o, sk);
    rifle(at(o, sk, 'handL')[0], at(o, sk, 'handL')[1], 0.15, 330);
    const [hx, hy] = at(o, sk, 'handR');
    if (drop < 0.5) photo(hx + 30, hy - 40, 1.25, -0.1);
    else photo(lerp(hx + 30, 820, drop), lerp(hy - 40, GY - 20, drop), 1.1, lerp(-0.1, 1.4, drop));
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(820 + i * 46, GY - 20 - i * 6); ctx.rotate(-0.2 + i * 0.25); rect(-60, -36, 120, 72, '#F2E8D2', LW, 3); line(-60, -36, 0, 4, 4); line(60, -36, 0, 4, 4); ctx.restore(); }
    calendar(160, 860, 'ŞUBAT', '1952', 0.75);
    front(t, 44);
  };
  // 5 · ateş başında dört kişi; biri gider, ikisi kaybolur (kasketleri kalır); 1972'den sonra tek başına
  const sitS = f => ({ view: 'side', facing: f, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 28, el: 50 }, armR: { sh: 34, el: 56 } });
  scenes[5] = t => {
    bg('#1E2A33'); for (let i = 0; i < 30; i++) { const r = mulberry32(500 + i); circ(r() * 1100, 380 + r() * 380, 3, '#F6E7B0', 0); }
    for (let i = 0; i < 9; i++) leaf(-150 + i * 150, 1050, 380, (i % 2 ? 0.25 : -0.25), ['#1F3A26', '#24442C'][i % 2]);
    rect(-400, GY, 1880, 700, '#2A2620', 0); line(-400, GY, 1480, GY, LW);
    glow(540, GY - 60, 520, 0.35);
    rect(120, GY - 70, 320, 40, '#6A4A2E', LW, 10); rect(640, GY - 70, 320, 40, '#6A4A2E', LW, 10);
    const leave = seg(t, w('l05', 3) - 0.1, 2.0), gone = seg(t, w('l05', 6), 0.8);
    const cap2 = (x, y) => { poly([[x - 40, y], [x - 36, y - 34], [x + 36, y - 34], [x + 40, y]], '#6E6A42', LW); ell(x, y, 34, 7, '#3A3424', LW); };
    // sağdaki biri ayağa kalkıp gider
    if (leave < 1) {
      if (leave <= 0) { const o = { x: 860, y: GY - 40, s: 110, ...sitS(-1), expr: 'yorgun' }; const sk = ch(ONODA, o, t); }
      else ch(ONODA, { x: lerp(860, 1300, leave), y: GY, s: 110, walk: (t * 1.4) % 1, facing: 1, expr: 'yorgun' }, t);
    }
    // ikisi kaybolur: kasketleri kütükte kalır
    for (const [x, f] of [[240, 1], [720, -1]]) {
      if (gone < 1) { ctx.save(); ctx.globalAlpha = 1 - gone; ch(ONODA, { x, y: GY - 40, s: 110, ...sitS(f), expr: 'notr' }, t); ctx.restore(); }
      if (gone > 0) { ctx.save(); ctx.globalAlpha = gone; cap2(x, GY - 72); ctx.restore(); }
    }
    ch(ONODA, { x: 380, y: GY - 40, s: 120, ...sitS(1), expr: t > w('l05', 9) ? 'yorgun' : 'notr', head: { look: [0.4, 0.3] } }, t);
    fire(540, GY - 20, t);
  };
  // 6 · takvim yaprakları uçar 1952 → 1974; ormanda yaşlanan Onoda
  scenes[6] = t => {
    jungle(t, '#C9D6BE', 61);
    const u = seg(t, T.l06 - 0.1, T.l06end - T.l06 + 0.2), yr = Math.round(lerp(1952, 1974, ease.state(u)));
    const o = { x: 760, y: GY, s: 150, expr: 'yorgun', armR: { sh: 20, el: 30 }, head: { look: [-0.4, 0.2] } };
    const sk = ch(u > 0.6 ? ONODA74 : ONODA, o, t); cap(o, sk, u > 0.6 ? '#8C8462' : '#6E6A42');
    const [hx, hy] = at(o, sk, 'handR'); rifle(hx, hy, 0.12, 330);
    for (let i = 0; i < 8; i++) { const f = seg(t, T.l06 + i * 0.18, 0.9); if (f <= 0 || f >= 1) continue; ctx.save(); ctx.translate(lerp(300, -200 + i * 40, f), lerp(860, 300, f)); ctx.rotate(f * 3 * (i % 2 ? 1 : -1)); calendar(0, 0, '', String(1952 + i * 3), 0.6); ctx.restore(); }
    calendar(300, 860, 'MART', String(yr), 1);
    front(t, 66);
  };
  // 7 · Şubat 1974: gece, ateş; sırt çantalı genç gezgin ve yaşlı Onoda; düşünce balonunda komutan
  scenes[7] = t => {
    bg('#1C2630'); for (let i = 0; i < 26; i++) { const r = mulberry32(700 + i); circ(r() * 1100, 380 + r() * 360, 3, '#F6E7B0', 0); }
    for (let i = 0; i < 8; i++) leaf(-120 + i * 170, 1040, 360, (i % 2 ? 0.3 : -0.3), ['#1F3A26', '#24442C'][i % 2]);
    rect(-400, GY, 1880, 700, '#2A2620', 0); line(-400, GY, 1480, GY, LW);
    glow(540, GY - 60, 560, 0.4);
    const go = { x: 230, y: GY, s: 140, expr: 'saskin', armR: { sh: 40, el: 30 }, head: { look: [0.6, 0] } };
    rect(go.x - 70, GY - 360, 140, 190, '#C2412F', LW, 18);   // sırt çantası (omuzların arkasında)
    ch(GEZGIN, go, t);
    const ot = talk(t, w('l07', 11), w('l07', 24) + 0.3);
    const oo = { x: 860, y: GY, s: 150, expr: ot ? 'notr' : 'yorgun', talk: ot, armR: { sh: 25, el: 50 }, head: { look: [-0.6, 0] } };
    const os = ch(ONODA74, oo, t); cap(oo, os, '#8C8462');
    const [hx, hy] = at(oo, os, 'handR'); rifle(hx, hy, 0.15, 330);
    fire(540, GY - 20, t);
    const b = ease.enter(seg(t, w('l07', 18) - 0.1, 0.4));
    if (b > 0) {
      ctx.save(); ctx.translate(800, 650); ctx.scale(b, b);
      circ(-120, 150, 16, '#FBF8F1', 4); circ(-90, 110, 24, '#FBF8F1', 4);
      ell(0, 0, 170, 120, '#FBF8F1', LW);
      const ko = { x: 0, y: 95, s: 70, expr: 'kizgin' }; const ks = ch(KOMUTAN, ko, t); cap(ko, ks, '#4E5636');
      ctx.restore();
    }
  };
  // 8 · kitapçı: eski komutan tezgâhın arkasında kitap okuyor
  scenes[8] = t => {
    bg('#E9DFC9');
    const r = mulberry32(81), cols = ['#C2412F', '#2E4A6B', '#E2B13C', '#5E9A4E', '#7A4E8A', '#D8722E', '#8C9298'];
    for (let s = 0; s < 4; s++) { const y = 640 + s * 150; rect(40, y + 120, 1000, 18, '#7A5638', LW, 4); for (let x = 60; x < 1020;) { const bw = 26 + r() * 22, bh = 80 + r() * 36; rect(x, y + 120 - bh, bw, bh, cols[Math.floor(r() * cols.length)], 4, 3); x += bw + 2; } }
    rect(-400, GY, 1880, 700, '#9C8466', 0); line(-400, GY, 1480, GY, LW);
    const o = { x: 540, y: GY - 40, s: 160, expr: 'notr', armR: { sh: 60, el: 70 }, armL: { sh: 60, el: 70 }, head: { look: [0, 0.5], tilt: 4 } };
    ch(KITAPCI, o, t);
    rect(380, 1060, 320, 30, '#FBF8F1', LW, 4); line(540, 1060, 540, 1090, 4);
    rect(120, 1090, 840, 200, '#7A5638', LW, 6);
  };
  // 9 · emir okunur (Mart 1974): eski komutan kâğıdı okur; Onoda tüfeği yere bırakır
  scenes[9] = t => {
    jungle(t, '#DCE6CC', 91);
    const ko = { x: 270, y: GY, s: 150, expr: 'notr', talk: talk(t, w('l07', 33), w('l07', 35)), armR: { sh: 70, el: 60 }, armL: { sh: 60, el: 70 }, head: { look: [0.2, 0.4] } };
    const ks = ch(KITAPCI, ko, t);
    const [px, py] = at(ko, ks, 'handR'); rect(px - 80, py - 110, 150, 120, '#FBF8F1', LW, 4); for (let i = 0; i < 3; i++) line(px - 60, py - 84 + i * 24, px + 50, py - 84 + i * 24, 4);
    const lay = ease.state(seg(t, w('l07', 39) - 0.1, 1.1));
    const oo = { x: 800, y: GY, s: 155, expr: lay > 0 ? 'yorgun' : 'notr', armR: { sh: lerp(10, 40, Math.sin(lay * Math.PI)), el: 10 }, armL: { sh: 6, el: -4 }, head: { look: [-0.4, lay > 0 ? 0.6 : 0.1], tilt: lay > 0.5 ? 8 : 0 } };
    const os = ch(ONODA74, oo, t); cap(oo, os, '#8C8462');
    const [hx, hy] = at(oo, os, 'handR');
    if (lay < 0.98) rifle(lerp(hx, 980, lay), lerp(hy, GY - 14, lay), lerp(0.15, Math.PI / 2, lay), 330);
    else rifle(980, GY - 14, Math.PI / 2, 330);
    front(t, 99);
  };
  // 10 · gönder: inatçı arkadaş kollarını kavuşturmuş; kâğıt uçağı yakalayınca güler
  scenes[10] = t => {
    bg('#F1E7D8'); rect(-400, 1230, 1880, 700, '#D9C7A9', 0); line(-400, 1230, 1480, 1230, LW);
    const go = seg(t, w('l07', 41) - 0.1, 1.1), got = go >= 1;
    ch(CARDS.sen, { x: 250, y: 1230, s: 150, expr: 'mutlu', props: { R: 'phone' }, armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    ch(INATCI, { x: 840, y: 1230, s: 150, expr: got ? 'mutlu' : 'kizgin', armL: got ? { sh: 120, el: 40 } : { sh: 70, el: 120 }, armR: got ? { sh: 20, el: 10 } : { sh: 70, el: 120 }, head: { look: [-0.6, 0], tilt: got ? 0 : -8 } }, t);
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(330, 760, u), lerp(980, 960, u) - Math.sin(u * Math.PI) * 260, 0.9, lerp(-0.6, 0.5, u)); }
    if (got) plane(790, 990, 0.7, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [w('l01', 10) - 0.1, ...P(1.06, 560, 970, 0)],
    [w('l01', 15) + 0.1, ...P(1.35, 330, 980, 0)],
    [T.l01end, ...P(1.4, 330, 980, 0)],
    ...cut(T.l02 - 0.1, P(1.4, 330, 980, 0), P(2.4, 640, 900, 0)),
    [T.l02end + 0.1, ...P(2.55, 640, 900, 0)],
    ...cut(T.l03 - 0.1, P(2.55, 640, 900, 0), P(1.0, 540, 980, 1)),
    [w('l03', 8) - 0.12, ...P(1.1, 560, 990, 1)],
    ...cut(w('l03', 8) - 0.1, P(1.1, 560, 990, 1), P(1.0, 520, 980, 2)),
    [w('l03', 17) - 0.12, ...P(1.12, 480, 990, 2)],
    ...cut(w('l03', 17) - 0.1, P(1.12, 480, 990, 2), P(1.0, 540, 940, 3)),
    [w('l03', 22) - 0.12, ...P(1.06, 600, 980, 3)],
    ...cut(w('l03', 22) - 0.1, P(1.06, 600, 980, 3), P(1.0, 560, 960, 4)),
    [T.l03end + 0.1, ...P(1.15, 640, 980, 4)],
    ...cut(T.l04 - 0.1, P(1.15, 640, 980, 4), P(1.2, 540, 1110, 5)),
    [w('l05', 9) - 0.1, ...P(1.26, 540, 1110, 5)],
    [T.l05end + 0.1, ...P(1.6, 430, 1120, 5)],
    ...cut(T.l06 - 0.1, P(1.6, 430, 1120, 5), P(1.0, 540, 960, 6)),
    [T.l06end + 0.1, ...P(1.08, 560, 980, 6)],
    ...cut(w('l07', 0) - 0.1, P(1.08, 560, 980, 6), P(1.1, 540, 1040, 7)),
    [w('l07', 25) - 0.12, ...P(1.18, 600, 1020, 7)],
    ...cut(w('l07', 25) - 0.1, P(1.18, 600, 1020, 7), P(1.0, 540, 980, 8)),
    [w('l07', 30) - 0.12, ...P(1.12, 540, 960, 8)],
    ...cut(w('l07', 30) - 0.1, P(1.12, 540, 960, 8), P(1.0, 540, 980, 9)),
    [w('l07', 38), ...P(1.04, 600, 990, 9)],
    [hero(T) + 0.6, ...P(1.2, 760, 1040, 9)],
    ...cut(w('l07', 41) - 0.1, P(1.2, 760, 1040, 9), P(1.0, 540, 930, 10)),
    [T.l07end + 0.2, ...P(1.06, 540, 910, 10)],
    [T.loop0 - 0.001, ...P(1.06, 540, 910, 10)],
    [T.loop0, ...P(1.05, 560, 970, 0)],
    [T.D, ...F0],
  ];
  return {
    cam,
    title: ['Savaşı 29 yıl', 'bitmeyen asker'],
    kicker: 'BİR HİKÂYE · 29 YIL',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(10, i))](t); ctx.restore();
    },
    names: [
      [w('l03', 0) - 0.1, w('l03', 8) - 0.2, 'HIROO ONODA', 'Teğmen · Aralık 1944'],
      [w('l07', 0) - 0.1, w('l07', 11) - 0.1, '20 Şubat 1974', 'Lubang Adası · Filipinler'],
      [w('l07', 25) - 0.1, w('l07', 30) - 0.2, 'TANIGUCHI', 'Eski komutanı · artık kitapçı'],
    ],
    numbers: [
      [w('l05', 9) - 0.05, T.l05end + 0.2, '1972', 'TEK BAŞINA'],
      [w('l07', 39) - 0.05, w('l07', 41) + 0.9, '29 yıl', 'ARALIK 1944 – MART 1974'],
    ],
  };
}

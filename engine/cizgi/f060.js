// № 060 · Buzun altındaki doktor ve hücredeki mahkûm (çizgi motoru, iki sesli anlatım v2).
// Senaryo: research/SENARYOLAR.md. Sahneler 1400 px arayla yan yana; kamera anahtarı [t, zoom, x, y] (P ile sahne seçilir).
// Kanca: buzun altında yatay kayan Anna, kayakları delikten dışarıda. A'nın ters köşesi: kendisini kurtaran hastanede doktor.
// Doruk: aynı termometre önce 13,7 °C'yi, sonra hücrenin dışındaki bulut için tahmini ~400 °C'yi gösterir.

const SX = 1400;
const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] }, ...o });
const ANNA = base({ key: 'anna', seed: 211, torso: { len: 0.84, shoulder: 0.66, hip: 0.6, depth: 0.42, belly: 0, color: '#C8323A', shade: '#A4262D' }, arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#C8323A', shade: '#A4262D', hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#2E3440', shade: '#232831' }, shoe: { color: '#3A4250', len: 0.32, h: 0.13 }, skin: '#F2D2BA', skinShade: '#DDB49A', hair: '#E2C27A', features: ['jacket', 'hairMessy'] });
const ANNA_DR = { ...ANNA, key: 'annaDr', torso: { ...ANNA.torso, color: '#F4F1EA', shade: '#D9D4C8' }, arm: { ...ANNA.arm, color: '#F4F1EA', shade: '#D9D4C8' }, leg: { ...ANNA.leg, color: '#3A4A5A', shade: '#2B3744' }, shoe: { color: '#2A2A2A', len: 0.3, h: 0.11 } };
const FRIEND = (c, s) => base({ key: 'ark' + s, seed: 220 + s, torso: { len: 0.86, shoulder: 0.7, hip: 0.56, depth: 0.42, belly: 0, color: c, shade: c }, arm: { upper: 0.42, lower: 0.4, w: 0.18, color: c, shade: c, hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#2E3440', shade: '#232831' }, shoe: { color: '#2A2A2A', len: 0.3, h: 0.12 }, skin: '#ECCCB2', skinShade: '#D6B296', hair: s ? '#6A4A2A' : '#2A1E16', features: ['jacket', s ? 'hairMessy' : 'hairSlick'] });
const AR1 = FRIEND('#2A5A8A', 0), AR2 = FRIEND('#3A6A3A', 1);
const DOKTOR = base({ key: 'doktor', seed: 231, torso: { len: 0.86, shoulder: 0.68, hip: 0.56, depth: 0.42, belly: 0, color: '#4E9A7E', shade: '#3C7E64' }, arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#4E9A7E', shade: '#3C7E64', hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#4E9A7E', shade: '#3C7E64' }, shoe: { color: '#E8E4DA', len: 0.3, h: 0.11 }, skin: '#E9B98F', skinShade: '#D29E74', hair: '#3A332C', features: ['hairSlick', 'glassesRect'] });
const LUDGER = base({ key: 'ludger', seed: 241, head: { w: 0.94, h: 1, ear: 0.12 }, torso: { len: 0.92, shoulder: 0.82, hip: 0.62, depth: 0.46, belly: 0, color: '#E8E0CF', shade: '#CFC6B2' }, arm: { upper: 0.44, lower: 0.42, w: 0.21, color: '#E8E0CF', shade: '#CFC6B2', hand: 0.13 }, leg: { upper: 0.44, lower: 0.42, w: 0.22, color: '#5A4A3A', shade: '#463A2C' }, shoe: { color: '#4A3020', len: 0.3, h: 0.1 }, skin: '#7A5038', skinShade: '#5E3C28', hair: '#1A1210', features: ['hairMessy'] });
const KURT = (c, s) => base({ key: 'kurt' + s, seed: 250 + s, torso: { len: 0.86, shoulder: 0.68, hip: 0.56, depth: 0.42, belly: 0, color: c, shade: c }, arm: { upper: 0.42, lower: 0.4, w: 0.17, color: c, shade: c, hand: 0.12 }, leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#3A3A30', shade: '#2A2A22' }, shoe: { color: '#2A1E17', len: 0.3, h: 0.11 }, skin: s ? '#C48A5E' : '#E9B98F', skinShade: s ? '#A8724A' : '#D29E74', hair: '#2A211C', features: ['vest', s ? 'mustacheThick' : 'hairSlick'] });
const K1 = KURT('#8A6A44', 0), K2 = KURT('#5A6A7A', 1);

export function hero(T) { return T.l10 + 1.6; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l03 - 0.3, T.l03], [w('l03', 'derenin') - 0.3, w('l03', 'derenin')], [T.l04 - 0.3, T.l04], [w('l05', 'anna') - 0.3, w('l05', 'anna')], [T.l07 - 0.3, T.l07], [w('l09', 'pelée') - 0.3, w('l09', 'pelée')], [w('l09', 'kapıdaki') - 0.3, w('l09', 'kapıdaki')], [w('l09', 41) - 0.3, w('l09', 41)], [w('l09', 46) - 0.3, w('l09', 46)], [T.l10 - 0.3, T.l10], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l05', 'atıyor'), w('l03', 'duruyor')],
    thock: [w('l03', 'düşüp')],
    rumble: [[w('l09', 'patlıyor'), 0.6], [w('l09', 'kızgın'), 0.4]],
    scratch: [[T.l10, hero(T), 0.02]],
    riser: [T.l10 - 0.2, hero(T)],
    impact: hero(T),
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, bg, ch, crowd, LW } = A;
  const w = (id, k) => T.w(id, k);
  const GY = 1360, S = 150;
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const bubble = (x, y, s, wd = 260) => { rect(x - wd / 2, y - 70, wd, 100, PAL.paper, LW, 24); poly([[x - 30, y + 28], [x - 4, y + 28], [x - 40, y + 70]], PAL.paper, LW); ctx.fillStyle = PAL.paper; ctx.fillRect(x - 28, y + 22, 22, 9); text(s, x, y + 6, 52, A.INK); };
  // EKG: atan (k=1) ya da düz (k=0) çizgi; t ile kayar
  const ecg = (x, y, wd, h, t, k) => { rect(x, y, wd, h, '#14201C', LW, 12); ctx.save(); ctx.beginPath(); ctx.rect(x + 8, y + 8, wd - 16, h - 16); ctx.clip(); ctx.beginPath(); for (let i = 0; i <= 120; i++) { const u = i / 120, xx = x + 8 + u * (wd - 16), ph = ((u * 3 - t * 1.2) % 1 + 1) % 1, beat = ph < 0.08 ? Math.sin(ph / 0.08 * Math.PI) * (ph < 0.04 ? -1 : 1.8) : 0; const yy = y + h / 2 - beat * h * 0.3 * k; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.lineWidth = 6; ctx.strokeStyle = k > 0.5 ? '#5FE08A' : '#E0675F'; ctx.stroke(); ctx.restore(); };
  const therm = (x, y, h, v, max) => { rect(x - 34, y, 68, h, PAL.paper, LW, 34); const f = Math.min(1, v / max), col = v < 30 ? '#4A8FD0' : '#D2412F'; rect(x - 16, y + h - 30 - (h - 60) * f, 32, (h - 60) * f + 20, col, 0, 16); circ(x, y + h, 52, col, LW); for (let i = 1; i < 10; i++) line(x + 34, y + h - 30 - (h - 60) * i / 10, x + 54, y + h - 30 - (h - 60) * i / 10, 4); };
  const snowField = () => { bg('#C9DCE2'); for (let i = 0; i < 5; i++) poly([[-400 + i * 420, 860], [-180 + i * 420, 520 - (i % 2) * 90], [40 + i * 420, 860]], ['#E8EEF0', '#DDE6EA'][i % 2], LW); };
  const houses = (burn) => { for (let i = 0; i < 9; i++) { const x = -60 + i * 140, h = 180 + (i * 53) % 90; rect(x, 1120 - h, 120, h, burn > 0 ? `rgb(${120 + 60 * (1 - burn)},${90 * (1 - burn) + 40},${60 * (1 - burn) + 30})` : ['#E9D9B8', '#D9B88A', '#F0E2C4'][i % 3], LW, 4); poly([[x - 10, 1120 - h], [x + 60, 1060 - h], [x + 130, 1120 - h]], burn > 0 ? '#4A3A30' : '#B5452B', LW); } };

  const scenes = [];
  // 0 · buzun altı (kesit): kayaklar delikten dışarıda, Anna buzun altında yatay; arkadaşlar ayakları tutuyor
  scenes[0] = t => {
    t = loopT(t);
    snowField(); rect(-400, 820, 1880, 40, '#F4F6F2', 0);
    rect(-400, 900, 1880, 1600, '#2E5A72', 0); for (let i = 0; i < 4; i++) rect(-400, 1000 + i * 160, 1880, 80, 'rgba(20,50,70,0.35)', 0);
    rect(-400, 860, 1880, 40, '#CFE6EE', LW); rect(330, 856, 100, 48, '#2E5A72', 0); line(330, 860, 330, 900, LW); line(430, 860, 430, 900, LW);
    const pocket = seg(t, w('l03', 'hava') - 0.3, 0.6);
    ell(830, 912, 150, 28 + 14 * pocket, '#DDEFF4', 5);
    for (let i = 0; i < 7; i++) { const u = ((t * 0.35 + i / 7) % 1), bx = 700 + (i * 53) % 220, by = 1250 - u * 330; circ(bx, by, 6 + (i % 3) * 3, 'rgba(230,245,250,0.7)', 3); }
    const stop = t > w('l03', 'duruyor') - 0.1 && t < T.loop0 - D + 5;
    ctx.save(); ctx.translate(380, 945); ctx.rotate(Math.PI / 2 + 0.06);
    ch(ANNA, { x: 0, y: 0, s: S, armL: { sh: 165 + 6 * Math.sin(t * 2), el: 10 }, armR: { sh: 150 - 6 * Math.sin(t * 2.3), el: 25 }, expr: stop ? 'yorgun' : 'korku', head: { tilt: -10, look: [0, -0.6] } }, t);
    ctx.restore();
    line(360, 900, 330, 640, 14, '#3A4250'); line(395, 900, 425, 640, 14, '#3A4250');
    const fr = t > w('l03', 'arkadaşları') - 0.3 && t < T.l04;
    if (fr) { const pull = Math.sin(t * 5) * 6; ch(AR1, { x: 200 + pull, y: 830, s: S * 0.9, view: 'side', facing: 1, legL: { hip: 70, knee: 110 }, legR: { hip: 10, knee: 100 }, armL: { sh: 80, el: 10 }, armR: { sh: 90, el: 10 }, expr: 'korku' }, t); ch(AR2, { x: 560 - pull, y: 830, s: S * 0.9, view: 'side', facing: -1, legL: { hip: 70, knee: 110 }, legR: { hip: 10, knee: 100 }, armL: { sh: 80, el: 10 }, armR: { sh: 90, el: 10 }, expr: 'korku' }, t); }
  };
  // 1 · Norveç yamacı: kayak, düşüş
  scenes[1] = t => {
    snowField(); poly([[-400, 1500], [-400, 1000], [1480, 1400], [1480, 2400], [-400, 2400]], '#F4F6F2', LW);
    for (let i = 0; i < 6; i++) { const x = -100 + i * 230; poly([[x, 1060 + i * 75], [x + 60, 860 + i * 75], [x + 120, 1060 + i * 75]], '#3E6A4E', LW); }
    const u = seg(t, T.l03 + 0.2, w('l03', 'düşüp') - T.l03), fall = ease.enter(seg(t, w('l03', 'düşüp') - 0.1, 0.5));
    const x = lerp(120, 560, u) + fall * 60, y = 1000 + (x + 400) * (400 / 1880) + 30;
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.2 + fall * 1.3); ctx.translate(-x, -y);
    ch(ANNA, { x, y, s: S, view: 'side', facing: 1, lean: 14, legL: { hip: 20, knee: 40 }, legR: { hip: 10, knee: 30 }, armL: { sh: 40, el: 20 }, armR: { sh: 30, el: 20 }, expr: fall > 0 ? 'korku' : 'mutlu' }, t);
    line(x - 80, y + 8, x + 110, y + 8, 12, '#3A4250');
    ctx.restore();
  };
  // 2 · hastane: termometre 13,7; makine; EKG düz → atan; yıllar sonra doktor Anna
  scenes[2] = t => {
    bg('#DDE6E2'); rect(-400, 1300, 1880, 900, '#B9C4C0', 0); line(-400, 1300, 1480, 1300, LW);
    const later = t > w('l05', 'anna') - 0.15, beat = t > w('l05', 'yeniden') - 0.2;
    ecg(560, 560, 360, 190, t, later || beat ? 1 : 0);
    if (!later) {
      rect(120, 1160, 620, 60, '#F4F1EA', LW, 12); rect(140, 1220, 30, 140, '#9AA3AA', LW); rect(690, 1220, 30, 140, '#9AA3AA', LW);
      ctx.save(); ctx.translate(700, 1150); ctx.rotate(-Math.PI / 2); ch(ANNA, { x: 0, y: 0, s: S * 0.95, armL: { sh: 10, el: 0 }, armR: { sh: 10, el: 0 }, expr: beat ? 'notr' : 'yorgun', head: { tilt: 0 } }, t); ctx.restore();
      const mach = t > w('l05', 'doktorlar') - 0.2;
      if (mach) { rect(760, 980, 150, 260, '#C9CED2', LW, 10); circ(835, 1060, 40, '#3A4250', 5); const fl = (t * 2) % 1; line(760, 1120, 600, 1170, 12, '#C2412F'); circ(lerp(760, 600, fl), lerp(1120, 1170, fl), 9, '#F4F1EA', 3); ch(DOKTOR, { x: 860, y: GY, s: S, view: 'side', facing: -1, armR: { sh: 70, el: 40 }, expr: beat ? 'mutlu' : 'notr' }, t); }
      therm(300, 600, 330, 13.7, 40); text('13,7°', 300, 570, 52, '#2E5A9A');
    } else {
      ch(ANNA_DR, { x: 420, y: GY, s: S, expr: 'mutlu', armR: { sh: 30, el: 40 }, head: { tilt: -4 } }, t);
      ctx.save(); ctx.lineWidth = 7; ctx.strokeStyle = A.INK; ctx.beginPath(); ctx.arc(420, 1010, 40, 0.2, Math.PI - 0.2); ctx.stroke(); ctx.restore();
      ch(DOKTOR, { x: 760, y: GY, s: S, view: 'side', facing: -1, expr: 'mutlu', armR: { sh: 90, el: 30 } }, t);
    }
  };
  // 3 · taş hücre: Ludger, kapıda küçük ızgara; dışarıdan sıcak hava dolar
  scenes[3] = t => {
    bg('#4A4038'); for (let j = 0; j < 14; j++) for (let i = 0; i < 9; i++) rect(-60 + i * 140 + (j % 2) * 70, 300 + j * 80, 130, 72, ['#6A5E52', '#5E544A', '#73665A'][(i + j) % 3], 4, 6);
    rect(-400, 1300, 1880, 900, '#3A332C', 0); line(-400, 1300, 1480, 1300, LW);
    const heat = seg(t, w('l09', 'kapıdaki') - 0.3, 0.8) * (1 - seg(t, w('l09', 41) - 0.4, 0.5));
    rect(640, 620, 330, 680, '#5A4636', LW, 10); rect(740, 720, 130, 110, heat > 0 ? '#F08A3A' : '#1A1612', LW, 6); for (let i = 1; i < 4; i++) line(740 + i * 32, 720, 740 + i * 32, 830, 8);
    if (heat > 0) { ctx.save(); ctx.globalAlpha = 0.55 * heat; for (let i = 0; i < 6; i++) { const u = ((t * 0.8 + i / 6) % 1); ell(700 - u * 420, 780 + Math.sin(t * 3 + i) * 40, 80 + u * 120, 40 + u * 50, '#F08A3A', 0); } ctx.restore(); }
    const hook = t < T.l09;
    ch(LUDGER, { x: 330, y: hook ? GY : 1310, s: S, ...(heat > 0 ? { view: 'side', facing: 1, legL: { hip: 100, knee: 140 }, legR: { hip: 90, knee: 130 }, armL: { sh: 150, el: 80 }, armR: { sh: 160, el: 70 }, lean: 30 } : { view: 'side', facing: 1, legL: { hip: 88, knee: 92 }, legR: { hip: 82, knee: 86 }, armL: { sh: 28, el: 50 }, armR: { sh: 34, el: 56 } }), expr: heat > 0 ? 'korku' : t > w('l09', 'ölmüyor') - 0.3 ? 'saskin' : 'yorgun', head: { look: [0.6, -0.2] } }, t);
    if (heat > 0 || t > w('l09', 'ölmüyor')) for (let i = 0; i < 4; i++) { const yy = 980 - ((t * 120 + i * 60) % 200); line(300 + i * 30, yy, 310 + i * 30, yy - 40, 5, 'rgba(200,190,180,0.8)'); }
  };
  // 4 · kent: Pelée patlar, kızgın bulut evleri yutar
  scenes[4] = t => {
    const er = seg(t, w('l09', 'pelée') - 0.2, 0.5), cl = ease.state(seg(t, w('l09', 'kızgın') - 0.3, w('l09', 'ölüyor') - w('l09', 'kızgın') + 0.3));
    bg(er > 0 ? '#C9B9A8' : '#C9DCE2'); poly([[100, 1120], [520, 560], [600, 560], [1020, 1120]], '#6A5E52', LW);
    if (er > 0) { ctx.save(); for (let i = 0; i < 14; i++) { const r = mulberry32(i * 7 + 3); const a = r(), u = er; ell(560 + (a - 0.5) * 300 * u, 520 - r() * 380 * u, 60 + 50 * u, 50 + 40 * u, ['#5A524C', '#6E625A', '#7A6A5E'][i % 3], LW); } ctx.restore(); }
    rect(-400, 1120, 1880, 900, '#8FA0A8', 0); houses(cl);
    if (cl > 0) { ctx.save(); for (let i = 0; i < 18; i++) { const r = mulberry32(i * 13 + 5); const x = lerp(-300, 1300, cl) - r() * 700, y = 820 + r() * 320; ell(x, y, 110 + r() * 60, 80 + r() * 40, ['#7A5A4A', '#9A6A4A', '#B5652F'][i % 3], LW); } ctx.restore(); }
  };
  // 5 · enkaz: çığlıklar duyulur
  scenes[5] = t => {
    bg('#B9ADA0'); rect(-400, 1200, 1880, 900, '#7A6E62', 0);
    for (let i = 0; i < 8; i++) poly([[-40 + i * 150, 1200], [20 + i * 150, 1030 - (i % 3) * 40], [90 + i * 150, 1080], [130 + i * 150, 1200]], '#5E544A', LW);
    rect(600, 900, 300, 300, '#6A5E52', LW, 6); rect(690, 980, 110, 90, '#1A1612', LW, 4); for (let i = 1; i < 4; i++) line(690 + i * 27, 980, 690 + i * 27, 1070, 7);
    ch(K1, { x: 260, y: GY, s: S, view: 'side', facing: 1, armR: { sh: 120, el: 60 }, expr: 'saskin', head: { look: [0.8, 0] } }, t);
    ch(K2, { x: 440, y: GY, s: S, view: 'side', facing: 1, armL: { sh: 40, el: 20 }, expr: 'saskin' }, t);
    if (t > w('l09', 'çığlıkları') - 0.2) bubble(660, 820, 'İMDAT!', 300);
  };
  // 6 · sirk: yanık kollarını gösteren Ludger
  scenes[6] = t => {
    bg('#2A2030'); for (let i = 0; i < 9; i++) poly([[540, 260], [-200 + i * 190, 1000], [-105 + i * 190, 1000]], i % 2 ? '#C2412F' : '#F4EFE3', LW);
    rect(-400, 1000, 1880, 300, '#3A2A3A', 0); ell(540, 1300, 520, 90, '#D9B88A', LW);
    crowd(-60, 1420, 1200, 2, 61, 0.3 + 0.3 * Math.sin(t * 2), 1.0, t);
    ch(LUDGER, { x: 540, y: 1290, s: S, armL: { sh: 120, el: -10 }, armR: { sh: 120, el: -10 }, expr: 'mutlu' }, t);
    for (let i = 0; i < 4; i++) { line(380 + i * 22, 980 + i * 8, 400 + i * 22, 1000 + i * 8, 6, '#5E3C28'); line(660 + i * 22, 980 + i * 8, 680 + i * 22, 1000 + i * 8, 6, '#5E3C28'); }
  };
  // 7 · doruk: aynı termometre 13,7 °C ve ~400 °C
  const tv = t => { const a = seg(t, T.l10 - 0.1, hero(T) - T.l10 + 0.1); return a <= 0 ? 13.7 : lerp(13.7, 400, ease.enter(a)); };
  scenes[7] = t => {
    bg('#E9DFC9'); rect(-400, 1300, 1880, 900, '#CDBFA8', 0); line(-400, 1300, 1480, 1300, LW);
    rect(-400, 0, 940, 1300, '#CFE2EA', 0); rect(540, 0, 940, 1300, '#F2C9A5', 0); line(540, 0, 540, 1300, LW);
    therm(330, 560, 520, 13.7, 450); therm(750, 560, 520, tv(t), 450);
    text('13,7 °C', 330, 480, 64, '#2E5A9A'); text('~' + Math.round(tv(t)) + ' °C', 750, 480, 64, PAL.red);
    ch(ANNA, { x: 150, y: 1300, s: S * 0.9, expr: 'notr', head: { look: [0.5, -0.3] } }, t); ch(LUDGER, { x: 930, y: 1300, s: S * 0.9, expr: tv(t) > 300 ? 'saskin' : 'notr', head: { look: [-0.5, -0.3] } }, t);
  };

  // ——— kamera ———
  const ZK = 1.8, YO = 120;
  const P = (z, x, y, i) => [z * ZK, i * SX + x, y + YO];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 610, 930, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.1, 640, 930, 0)],
    ...cut(T.l03 - 0.15, P(1.1, 640, 930, 0), P(0.95, 400, 960, 1)),
    [w('l03', 'düşüp'), ...P(1.0, 600, 1050, 1)],
    ...cut(w('l03', 'derenin') - 0.15, P(1.0, 600, 1050, 1), P(0.85, 430, 900, 0)),
    [w('l03', 'arkadaşları') + 0.5, ...P(0.85, 400, 880, 0)],
    [w('l03', 'hava') - 0.2, ...P(1.2, 740, 900, 0)],
    [T.l03end + 0.1, ...P(1.35, 760, 930, 0)],
    ...cut(T.l04 - 0.15, P(1.35, 760, 930, 0), P(0.8, 560, 930, 2)),
    [w('l05', 'yeniden'), ...P(0.85, 580, 920, 2)],
    ...cut(w('l05', 'anna') - 0.15, P(0.85, 580, 920, 2), P(1.0, 560, 930, 2)),
    [T.l06end + 0.2, ...P(1.12, 520, 930, 2)],
    ...cut(T.l07 - 0.15, P(1.12, 520, 930, 2), P(1.0, 520, 930, 3)),
    [T.l08end, ...P(1.1, 460, 960, 3)],
    ...cut(w('l09', 'pelée') - 0.15, P(1.1, 460, 960, 3), P(0.7, 560, 900, 4)),
    [w('l09', 'ölüyor'), ...P(0.75, 600, 960, 4)],
    ...cut(w('l09', 'kapıdaki') - 0.15, P(0.75, 600, 960, 4), P(1.0, 560, 930, 3)),
    [w('l09', 'ölmüyor'), ...P(1.15, 400, 960, 3)],
    ...cut(w('l09', 41) - 0.15, P(1.15, 420, 960, 3), P(1.0, 560, 960, 5)),
    ...cut(w('l09', 46) - 0.15, P(1.0, 560, 960, 5), P(0.95, 540, 1000, 6)),
    [T.l09end + 0.2, ...P(1.05, 540, 980, 6)],
    ...cut(T.l10 - 0.15, P(1.05, 540, 980, 6), P(0.62, 540, 980, 7)),
    [hero(T), ...P(0.6, 540, 960, 7)],
    [T.loop0 - 0.001, ...P(0.66, 540, 980, 7)],
    [T.loop0, ...P(1.04, 600, 935, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[i](t); ctx.restore();
    },
    names: [[w('l03', 'anna') - 0.1, w('l03', 'derenin') - 0.3, 'ANNA BÅGENHOLM', 'Norveç · 1999 · 29 yaşında'], [w('l09', 5) - 0.1, w('l09', 'pelée') - 0.3, 'LUDGER SYLBARIS', 'Martinik · 1902']],
    numbers: [[w('l05', 'vücudu') - 0.1, w('l05', 'doktorlar') - 0.2, '13,7 °C', 'VÜCUT SICAKLIĞI'], [w('l05', 15) - 0.1, w('l05', 'anna') - 0.3, '2 sa 35 dk', 'KALP DURDU'], [w('l09', 24) - 0.1, w('l09', 'kapıdaki') - 0.3, '~30.000', 'HAYATINI KAYBEDEN']],
  };
}

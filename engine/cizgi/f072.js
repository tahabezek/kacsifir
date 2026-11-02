// № 072 · Bir ömürde kaç kelime (çizgi motoru, "Senin sayın" serisi, sakin iki sesli). Senaryo: research/SENARYOLAR.md §5.
// Görsel fikir: sen konuştukça ağzından kelime balonları yükselir; 2007 deneyi (yakadaki ses kaydedici, gün boyu kısa kayıtlar);
// kadın / erkek eşit sütunlar (efsane çürür); balon dağı (450 milyon); kapanış: "seni seviyorum" balonu kâğıt uçağa dönüşür.
// Sahneler 1400 px arayla yan yana; kamera [t, zoom, x, y] (P ile sahne seçilir).

const SX = 1400;
export function hero(T) { return T.w('l05', 12) + 0.1; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.25, T.l02], [T.l03 - 0.25, T.l03], [w('l03', 14) - 0.25, w('l03', 14)], [T.l04 - 0.25, T.l04], [T.l06 - 0.25, T.l06], [T.l07 - 0.25, T.l07], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l03', 10), w('l03', 17), w('l03', 19), w('l03', 21), w('l07', 9)],
    thock: [w('l03', 23), w('l05', 0)],
    scratch: [[w('l05', 1), w('l05', 11), 0.02]],
    riser: [T.l04, w('l05', 12) - 0.25],
    impact: hero(T) - 0.3,
    loopEnd: T.loop0,
  };
}

const base = o => ({ head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06, eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.5, 5.2] }, ...o });
const OGRENCI = base({
  key: 'ogrenci', name: 'Öğrenci', seed: 721,
  torso: { len: 0.8, shoulder: 0.64, hip: 0.54, depth: 0.4, belly: 0, color: '#4F7CA8', shade: '#3E6589' },
  arm: { upper: 0.4, lower: 0.38, w: 0.18, color: '#4F7CA8', shade: '#3E6589', hand: 0.13 },
  leg: { upper: 0.4, lower: 0.38, w: 0.2, color: '#3A3F48', shade: '#2B2F36' },
  shoe: { color: '#D9D4C8', len: 0.28, h: 0.11 },
  skin: '#E9B98F', skinShade: '#D29E74', hair: '#6A4426',
  features: ['jacket', 'hairSpiky', 'glassesRect'],
});
const KADIN = base({
  key: 'kadin', name: 'Kadın', seed: 722,
  torso: { len: 0.78, shoulder: 0.6, hip: 0.66, depth: 0.42, belly: 0, color: '#C2412F', shade: '#9E3324' },
  arm: { upper: 0.38, lower: 0.36, w: 0.17, color: '#C2412F', shade: '#9E3324', hand: 0.12 },
  leg: { upper: 0.38, lower: 0.36, w: 0.19, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#2A2420', len: 0.26, h: 0.11 },
  skin: '#EEC6A0', skinShade: '#D6A882', hair: '#2E1E16',
  features: ['cardigan', 'skirt', 'bun'],
});
const ERKEK = base({
  key: 'erkek', name: 'Erkek', seed: 723,
  torso: { len: 0.84, shoulder: 0.7, hip: 0.56, depth: 0.42, belly: 0, color: '#2E4A6B', shade: '#233A55' },
  arm: { upper: 0.42, lower: 0.4, w: 0.18, color: '#2E4A6B', shade: '#233A55', hand: 0.13 },
  leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#3A3F48', shade: '#2B2F36' },
  shoe: { color: '#1E1E1E', len: 0.3, h: 0.11 },
  skin: '#D9A27A', skinShade: '#C08760', hair: '#1E1814',
  features: ['hoodie', 'hairSlick', 'mustacheThin'],
});
const SEVGILI = base({
  key: 'sevgili', name: 'O kişi', seed: 724,
  torso: { len: 0.78, shoulder: 0.62, hip: 0.6, depth: 0.42, belly: 0, color: '#5E9A4E', shade: '#4C8240' },
  arm: { upper: 0.38, lower: 0.36, w: 0.18, color: '#5E9A4E', shade: '#4C8240', hand: 0.13 },
  leg: { upper: 0.39, lower: 0.37, w: 0.2, color: '#3A3A48', shade: '#2A2A36' },
  shoe: { color: '#8A3A2A', len: 0.27, h: 0.11 },
  skin: '#C9946A', skinShade: '#AD7C55', hair: '#1E1814',
  features: ['jacket', 'bun'],
});

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, mulberry32, poly, rect, circ, ell, line, text, bg, ch, plane, LW } = A;
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, COLS = ['#F6C445', '#FBF8F1', '#BFD6DC', '#F3C9B8', '#CFE3C2', '#E8D9F0'];

  // konuşma balonu: (x, y) merkez, k ölçek, kuyruk yönü dir (-1 sol, 1 sağ), içerik: üç çizgi ya da metin
  const bubble = (x, y, k, col, dir = 1, label = null) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath(); ctx.roundRect(-60, -38, 120, 76, 26); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.moveTo(dir * 14, 34); ctx.lineTo(dir * 34, 64); ctx.lineTo(dir * 38, 30); ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = LW / k; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.roundRect(-60, -38, 120, 76, 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dir * 14, 37); ctx.lineTo(dir * 34, 64); ctx.lineTo(dir * 38, 33); ctx.stroke();
    ctx.fillStyle = col; ctx.fillRect(dir > 0 ? 12 : -40, 30, 28, 8);
    if (label) { ctx.font = '800 26px Archivo'; ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.fillText(label, 0, 10); ctx.textAlign = 'left'; }
    else { ctx.lineWidth = 5 / k; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-34, -14 + i * 14); ctx.lineTo(i === 2 ? 10 : 34, -14 + i * 14); ctx.stroke(); } }
    ctx.restore();
  };
  // ağızdan yükselen balon akışı: kaynak (mx, my), periyot per sn; D'ye göre periyodik (dikiş korunur)
  const stream = (t, mx, my, n, life, spread, k0, seed, rise = 560) => {
    for (let i = 0; i < n; i++) {
      const r = mulberry32(seed + i * 31), ph = r() * life, sx = (r() - 0.5) * spread, col = COLS[Math.floor(r() * COLS.length)];
      const u = (((t + ph) % life) + life) % life / life;
      const x = mx + sx * u + Math.sin(u * 6 + i) * 30, y = my - u * rise, k = k0 * (0.55 + 0.5 * Math.min(1, u * 4)) * (1 - u * 0.25);
      if (u > 0.02) { ctx.save(); ctx.globalAlpha = Math.min(1, (1 - u) * 4); bubble(x, y, k, col, sx > 0 ? -1 : 1); ctx.restore(); }
    }
  };
  const room = (wall = '#EFE6D6', floor = '#D8C9AE', GY = 1250) => { bg(wall); rect(-600, GY, 2300, 1400, floor, 0); line(-600, GY, 1700, GY, LW); };
  const recorder = (x, y, k = 1, on = true, t = 0) => {   // yakaya takılı küçük ses kaydedici
    rect(x - 22 * k, y - 30 * k, 44 * k, 60 * k, '#2B2F33', LW * 0.8 * k, 8 * k);
    rect(x - 14 * k, y - 20 * k, 28 * k, 16 * k, '#9FB7A0', 0, 3 * k);
    circ(x, y + 14 * k, 6 * k, on && Math.sin(t * 6) > -0.2 ? RED : '#6A2A22', 0);
  };

  const scenes = [];
  // 0 · kapak ve kanca: sen konuşur, ağzından renkli balonlar yükselir
  scenes[0] = t => {
    t = loopT(t);
    room();
    const sas = t > T.l02 - 0.1 && t < T.l02end + 0.3;
    stream(t, 540, 850, 14, 3.2, 900, 0.9, 7201, 210);
    ch('sen', { x: 540, y: 1250, s: 140, expr: sas ? 'saskin' : 'mutlu', talk: sas ? talk(t, T.l02, T.l02end) : 0.3 + 0.3 * Math.sin(t * 13), armL: { sh: sas ? 40 : 30, el: sas ? 60 : 50 }, armR: { sh: sas ? 40 : 55, el: sas ? 60 : 40 }, head: { look: [0, -0.2], tilt: sas ? -6 : 0 } }, t);
  };
  // 1 · 2007: üniversite önünde öğrenci; yakasında küçük ses kaydedici
  scenes[1] = t => {
    bg('#DCE6E2'); rect(-600, 1250, 2300, 1400, '#C9C1AE', 0); line(-600, 1250, 1700, 1250, LW);
    // fakülte binası: alınlık, sütunlar
    poly([[70, 560], [540, 400], [1010, 560]], '#E9DFC9', LW); rect(90, 560, 900, 40, '#E2D6BE', LW);
    for (let i = 0; i < 6; i++) rect(130 + i * 152, 600, 60, 520, '#F1E9D8', LW);
    rect(70, 1120, 940, 50, '#D8CCB2', LW); rect(40, 1170, 1000, 80, '#CFC2A6', LW);
    text('2007', 540, 520, 56, '#7A6A4E');
    const st = ch(OGRENCI, { x: 540, y: 1250, s: 150, expr: t > w('l03', 10) ? 'mutlu' : 'notr', head: { look: [0.2, 0.3] }, armR: { sh: 20, el: 90 } }, t);
    const nx = 540 + st.neck[0] * 150, ny = 1250 + st.neck[1] * 150;
    const on = t > w('l03', 12) - 0.1;
    recorder(nx + 34, ny + 64, 0.9, on, t);
    if (on) for (let i = 0; i < 3; i++) { const u = ((t * 0.9 + i / 3) % 1); ctx.save(); ctx.globalAlpha = 1 - u; ctx.lineWidth = 5; ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(nx + 34, ny + 64, 30 + u * 70, -0.9, 0.9); ctx.stroke(); ctx.restore(); }
  };
  // 2 · gün boyu kayıt: 07.00–23.00 şeridi, gezen imleç; birkaç dakikada bir kısa kayıt (kırmızı çentik + dalga)
  scenes[2] = t => {
    bg('#F2ECDF');
    const x0 = 110, x1 = 970, y = 1000, u = seg(t, w('l03', 14), Math.max(1, w('l03', 23) - w('l03', 14) - 0.1));
    // güneş yayı
    const sa = lerp(Math.PI * 0.95, Math.PI * 0.05, u), sx = 540 + Math.cos(sa) * 380, sy = 860 - Math.sin(sa) * 220;
    circ(sx, sy, 48, '#F6C445', LW); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t; line(sx + Math.cos(a) * 66, sy + Math.sin(a) * 66, sx + Math.cos(a) * 86, sy + Math.sin(a) * 86, 6); }
    rect(x0, y - 50, x1 - x0, 100, '#FBF8F1', LW, 14);
    for (let h = 0; h <= 16; h += 4) { const x = lerp(x0, x1, h / 16); line(x, y + 50, x, y + 70, 5); text(String(7 + h).padStart(2, '0') + '.00', x, y + 120, 34); }
    const cx = lerp(x0, x1, u);
    const r = mulberry32(7202);
    for (let i = 0; i < 40; i++) {
      const p = (i + 0.2 + r() * 0.6) / 40; if (p > u) break;
      const x = lerp(x0, x1, p); rect(x - 4, y - 36, 8, 72, RED, 0);
    }
    line(cx, y - 80, cx, y + 80, 6, PAL.ink); circ(cx, y - 86, 12, PAL.ink, 0);
    // imleçteki kayıt: küçük dalga
    ctx.save(); ctx.translate(cx, y - 170); rect(-110, -50, 220, 100, '#FFFFFF', LW, 16);
    ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const xx = -90 + i * 4.5, a = Math.sin(i * 1.3 + t * 18) * (14 + 14 * Math.sin(i * 0.4 + t * 3)); i ? ctx.lineTo(xx, a) : ctx.moveTo(xx, a); } ctx.stroke(); ctx.restore();
  };
  // 3 · kadın ve erkek: önce kadın çok konuşur sanılır; sonra iki eşit sütun
  scenes[3] = t => {
    room('#F1E7D8', '#D9C7A9', 1250);
    const bars = ease.enter(seg(t, w('l05', 1) - 0.1, 1.6));
    const eq = t > w('l05', 12) - 0.1;
    ch(KADIN, { x: 290, y: 1250, s: 120, expr: t < T.l05 ? 'mutlu' : (eq ? 'mutlu' : 'notr'), talk: t < T.l05 ? 0.3 + 0.3 * Math.sin(t * 15) : 0, head: { look: [0.3, -0.2] } }, t);
    ch(ERKEK, { x: 790, y: 1250, s: 124, expr: eq ? 'mutlu' : 'notr', head: { look: [-0.3, -0.2] } }, t);
    if (t < T.l05) { const k = ease.enter(seg(t, T.l04, 0.4)); stream(t, 300, 860, 8, 2.2, 260, 0.75 * k, 7203); bubble(780, 880, 0.6 * k, '#BFD6DC', -1); }
    if (bars > 0) {
      const hK = 16215 / 16215 * 330 * bars, hE = 15669 / 16215 * 330 * bars;
      rect(220, 760 - hK, 140, hK, '#C2412F', LW, 8); rect(720, 760 - hE, 140, hE, '#2E4A6B', LW, 8);
      line(160, 760, 920, 760, LW);
      if (bars > 0.6) { text(Math.round(16215 * bars).toLocaleString('tr-TR'), 290, 760 - hK - 24, 56); text(Math.round(15669 * bars).toLocaleString('tr-TR'), 790, 760 - hE - 24, 56); }
      if (eq) { const k = ease.enter(seg(t, w('l05', 12) - 0.1, 0.4)); ctx.save(); ctx.translate(540, 600); ctx.scale(k, k); rect(-50, -34, 100, 22, RED, 0, 6); rect(-50, 12, 100, 22, RED, 0, 6); ctx.restore(); }
    }
  };
  // 4 · balon dağı: bir ömrün 450 milyon kelimesi; dibinde küçücük sen
  scenes[4] = t => {
    bg('#E9EEF0'); rect(-600, 1250, 2300, 1400, '#D3D9D6', 0); line(-600, 1250, 1700, 1250, LW);
    const r = mulberry32(7204), grow = ease.enter(seg(t, T.l06 - 0.05, 1.2));
    for (let i = 0; i < 150; i++) {
      const a = r(), hgt = r(), x = 540 + (a - 0.5) * 1000 * (1 - hgt * 0.9), y = 1230 - hgt * 560 * grow, col = COLS[Math.floor(r() * COLS.length)];
      if (y > 1240) continue;
      bubble(x, y, 0.42 + r() * 0.2, col, r() > 0.5 ? 1 : -1);
    }
    ch('sen', { x: 540, y: 1250, s: 70, expr: 'saskin', head: { look: [0, -0.8] } }, t);
  };
  // 5 · gönder: sen "seni seviyorum" balonunu yazar; balon kâğıt uçağa döner, o kişiye uçar
  scenes[5] = t => {
    room('#F6E8E0', '#DCC3B4', 1230);
    const go = seg(t, w('l07', 11) - 0.1, 1.2), got = go >= 1;
    ch('sen', { x: 250, y: 1230, s: 150, facing: 1, expr: 'mutlu', props: { R: 'phone' }, talk: talk(t, w('l07', 9), w('l07', 10) + 0.5), armR: { sh: lerp(60, 120, ease.enter(Math.min(1, go * 3))), el: 50 }, head: { look: [0.6, 0] } }, t);
    ch(SEVGILI, { x: 840, y: 1230, s: 150, facing: -1, expr: got ? 'mutlu' : 'notr', armL: { sh: got ? 120 : 10, el: got ? 40 : -4 }, head: { look: [-0.6, 0] } }, t);
    const bk = ease.enter(seg(t, w('l07', 9) - 0.1, 0.4));
    if (bk > 0 && go <= 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(1.6 * bk, 1.6 * bk); bubble(0, 0, 1, '#FFFFFF', -1); ctx.restore();
      ctx.save(); ctx.translate(540, 700); ctx.scale(bk, bk); ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-56, -6, -28, -44, 0, -18); ctx.bezierCurveTo(28, -44, 56, -6, 0, 30); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore();
      if (bk > 0.8) text('seni seviyorum', 540, 860, 52, RED); }
    if (go > 0 && go < 1) { const u = ease.state(go); plane(lerp(540, 770, u), lerp(700, 960, u) - Math.sin(u * Math.PI) * 160, 1.1 - 0.3 * u, lerp(-0.2, 0.6, u)); }
    if (got) plane(790, 1000, 0.7, 0.2);
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.1, 540, 920, 0)],
    ...cut(T.l02 - 0.1, P(1.1, 540, 920, 0), P(2.1, 540, 930, 0)),
    [T.l02end + 0.1, ...P(2.3, 540, 920, 0)],
    ...cut(T.l03 - 0.1, P(2.3, 540, 920, 0), P(0.95, 540, 1100, 1)),
    [w('l03', 10) - 0.15, ...P(1.05, 540, 1120, 1)],
    [w('l03', 13), ...P(2.0, 575, 1060, 1)],
    ...cut(w('l03', 14) - 0.1, P(2.0, 575, 1060, 1), P(1.0, 540, 960, 2)),
    [w('l03', 23) - 0.1, ...P(1.08, 540, 960, 2)],
    [T.l03end + 0.1, ...P(1.12, 540, 980, 2)],
    ...cut(T.l04 - 0.1, P(1.12, 540, 980, 2), P(1.1, 540, 1080, 3)),
    [T.l04end, ...P(1.15, 540, 1070, 3)],
    [w('l05', 1) - 0.1, ...P(1.0, 540, 1000, 3)],
    [T.l05end + 0.15, ...P(1.04, 540, 990, 3)],
    ...cut(T.l06 - 0.1, P(1.04, 540, 990, 3), P(1.6, 540, 1150, 4)),
    [T.l06end + 0.1, ...P(0.95, 540, 960, 4)],
    ...cut(T.l07 - 0.1, P(0.95, 540, 960, 4), P(1.0, 540, 990, 5)),
    [T.l07end + 0.2, ...P(1.06, 540, 980, 5)],
    [T.loop0 - 0.001, ...P(1.06, 540, 980, 5)],
    [T.loop0, ...P(1.05, 540, 930, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ['Bir ömürde', 'kaç kelime konuşursun?'],
    kicker: 'SENİN SAYIN · SÖZ',
    draw(t) {
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(5, i))](t); ctx.restore();
    },
    names: [],
    numbers: [
      [w('l03', 23) - 0.1, T.l04 - 0.2, '16.000', 'KELİME · GÜNDE'],
      [T.l06 + 0.1, T.l07 - 0.15, '450 milyon', 'KELİME · BİR ÖMÜR'],
    ],
  };
}

// № 042 · Ay'a merdivenle (çizgi motoru, süreç dili, tek sesli + Soran tepkisi). Senaryo: research/SUREC_SENARYOLARI.md.
// Kural (4 Kasım): sonucu değil süreci göster. Kapak: Ay'a uzanan merdivenin dibinde "sen". Tırmanış: kamera senle yükselir,
// basamaklar akar; Everest, uzayın sınırı, İSS ve GPS sözcüklerinde yanından geçer; geçen süre sayacı saatten yıla döner,
// saç kırlaşıp ağarır, Ay büyür. Doruk: "ayak basıyorsun"da Ay'a adım, vuruş ve kısa durgunluk (71 yıl 8 ay).
// Son satır: Apollo 11 aynı yolu 3 günde geçer. Sahne 0 tırmanış (dünya kaydırılır), sahne 1 Ay yüzeyi.

const SX = 1400;
export function hero(T) { return T.w('l04', 8); }
export function cues(T) {
  const w = (id, k) => T.w(id, k), h = hero(T);
  return {
    whip: [[w('l02', 5) - 0.25, w('l02', 5)], [w('l02', 11) - 0.25, w('l02', 11)], [w('l02', 17) - 0.25, w('l02', 17)], [w('l03', 5) - 0.25, w('l03', 5)], [w('l06', 0) - 0.1, w('l06', 6)], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l01', 5), w('l01', 10), w('l01', 12), w('l02', 3), w('l02', 16), w('l03', 3)],
    thock: [h + 0.05],
    riser: [w('l03', 9), h - 0.45],
    silence: [h - 0.45, h],
    impact: h - 0.3,
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, bg, ch, CARDS, LW } = A;
  // yazı: font ve genişlik her çağrıda birlikte kurulur (fontStretch kareden kareye taşınmasın: determinizm)
  const tx = (str, x, y, size, col = PAL.ink) => { ctx.font = `800 ${size}px Archivo`; ctx.fontStretch = 'semi-condensed'; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(str, x, y); ctx.textAlign = 'left'; };
  const w = (id, k) => T.w(id, k);
  const loopT = t => (t >= T.loop0 ? t - D : t);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);
  const RED = PAL.red, H = hero(T);
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A0 = hex(a), B0 = hex(b); return '#' + A0.map((v, i) => Math.round(lerp(v, B0[i], clamp01(u))).toString(16).padStart(2, '0')).join(''); };

  // ——— tırmanış: dünya kaydırması s(t) (px, merdiven yönünde); önce saniyede bir basamak, l02'de hızlanan zaman atlaması ———
  const RUN = 40, RISE = 34, L = Math.hypot(RUN, RISE), DX = RUN / L, DY = RISE / L;   // Ay'a doğru yükselen merdiven
  const SA = [430, 1180];                                                          // sen'in ayak noktası (ekran)
  const t0 = w('l01', 5), tA = T.l02 - 0.2, V0 = L, ACC = 220, VMAX = 380;
  const tM = tA + (VMAX - V0) / ACC;
  const s = t => {
    if (t <= t0) return 0;
    if (t >= H) t = H;
    if (t < tA) return V0 * (t - t0);
    const sA = V0 * (tA - t0);
    if (t < tM) { const u = t - tA; return sA + V0 * u + 0.5 * ACC * u * u; }
    const u = tM - tA; return sA + V0 * u + 0.5 * ACC * u * u + VMAX * (t - tM);
  };
  const vel = t => (t <= t0 || t >= H ? 0 : t < tA ? V0 : Math.min(VMAX, V0 + ACC * (t - tA)));
  // duraklar kendi sabit hızlarıyla dikey akar: tk anında (sx, sy) noktasında, sen'in hizasında
  const LV = 480, near = (t, tk) => Math.abs(t - tk) < 2.6;
  const at = (t, tk, sx, sy) => [sx, sy + LV * (t - tk)];

  // ——— geçen süre (sn): durak sözcüklerine kilitli çapalar, log uzayında doğrusal (hızlanan zaman) ———
  const YR = 31557600;
  // sayaç, anlatıcının söylediği değere sayının ilk sözcüğünde oturur ve cümle boyunca bekler (ekran = ses);
  // cümleler arasında 0,5 sn'de bir sonrakine akar, son durak sonrası Ay'a kadar hızlanır
  const HOLD = [[w('l02', 0), 14.5 * 3600], [w('l02', 8), 7 * 86400], [w('l02', 14), 28 * 86400], [w('l03', 0), (3 + 10 / 12) * YR]];
  const AN = [[t0, 0]];
  HOLD.forEach(([s, v], i) => { if (i) AN.push([s - 0.5, HOLD[i - 1][1]]); AN.push([s, v]); });
  AN.push([w('l03', 9), HOLD.at(-1)[1]], [w('l04', 1), (71 + 8 / 12) * YR]);   // "yetmiş bir yıl sekiz ay" sözünde tam değer
  const elapsed = t => {
    if (t <= AN[0][0]) return 0;
    if (t >= H) return AN.at(-1)[1];
    for (let i = 0; i + 1 < AN.length; i++) {
      const [a, ea] = AN[i], [b, eb] = AN[i + 1];
      if (t <= b) return Math.pow(10, lerp(Math.log10(ea + 1), Math.log10(eb + 1), ease.state(clamp01((t - a) / Math.max(1e-6, b - a))))) - 1;
    }
    return AN.at(-1)[1];
  };
  const fmt = e => {
    if (e < 60) return `${Math.floor(e)} saniye`;
    if (e < 3600) return `${Math.floor(e / 60)} dakika`;
    if (e < 2 * 86400) return `${(Math.floor(e / 360) / 10).toLocaleString('tr-TR')} saat`;
    if (e < 60 * 86400) return `${Math.round(e / 86400)} gün`;
    const y = e / YR, yy = Math.floor(y + 1e-6), mm = Math.floor((y - yy) * 12 + 1e-4);
    return yy ? `${yy} yıl ${mm} ay` : `${Math.floor(y * 12 + 1e-4)} ay`;
  };
  // yaşlanma: saç koyu → kır → ak; hafif kambur
  const years = t => elapsed(t) / YR;
  const hairOf = y => (y < 12 ? CARDS.sen.hair : y < 38 ? mix(CARDS.sen.hair, '#8C8780', (y - 12) / 26) : mix('#8C8780', '#EEECE6', (y - 38) / 26));
  const SEN = t => ({ ...CARDS.sen, hair: hairOf(years(t)) });

  // ——— çizim parçaları ———
  const R = mulberry32(4207);
  const CLOUDS = Array.from({ length: 16 }, () => ({ sj: 200 + R() * 2600, x: 40 + R() * 1000, y: 300 + R() * 1100, k: 0.6 + R() * 0.7 }));
  const STARS = Array.from({ length: 120 }, () => ({ x: R() * 1180 - 50, y: R() * 2300, r: 1.5 + R() * 3, ph: R() * 6 }));
  const cloud = (x, y, k) => { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); for (const [cx, cy, r] of [[-60, 10, 44], [0, -10, 60], [64, 8, 46], [20, 24, 46]]) circ(cx, cy, r, '#FBFAF6', 0); ctx.restore(); };
  const stairs = (t, wear = 0) => {
    const off = s(t), c0 = Math.floor(off / L);
    // basamak i'nin sahanlık başı: SA + i·(RUN, −RISE) − off·(DX, −DY); zemin (i < 0) altında basamak yok
    const P = i => [SA[0] - 18 + i * RUN - off * DX, SA[1] - i * RISE + off * DY];
    const iMin = Math.max(0, c0 - 16), iMax = c0 + 24;
    const pts = [];
    for (let i = iMin; i <= iMax; i++) { const [x, y] = P(i); pts.push([x, y], [x + RUN, y], [x + RUN, y - RISE]); }
    const [xa, ya] = P(iMin), [xb, yb] = P(iMax);
    poly([...pts, [xb + RUN + 60, yb + 40], [xa + 70, ya + 70], [xa, ya + 40]], mix('#C9B48E', '#8E8A84', wear), LW);
    // yan kiriş: merdivenin tutunma çubuğu
    line(xa + 10, ya - 120, xb + 10, yb - 120, 7, '#6A5A48');
  };
  const mountain = (sx, sy) => {
    poly([[sx, sy], [sx - 320, sy + 900], [sx + 360, sy + 900]], '#8C8F96', LW);
    poly([[sx, sy], [sx - 70, sy + 190], [sx - 20, sy + 160], [sx + 20, sy + 200], [sx + 78, sy + 180]], '#FBFAF6', LW * 0.8);
    line(sx, sy, sx, sy - 70, 5); poly([[sx, sy - 70], [sx + 46, sy - 58], [sx, sy - 46]], RED, 4);
    tx('EVEREST', sx - 10, sy - 110, 46, PAL.ink); tx('8.849 m', sx - 10, sy - 66, 36, RED);
  };
  const karman = (sy, dark) => {
    ctx.save(); ctx.setLineDash([26, 18]); line(-40, sy, 1120, sy, 7, RED); ctx.restore();
    tx('UZAYIN SINIRI · 100 km', 300, sy - 26, 40, dark > 0.5 ? '#F4EFE3' : PAL.ink);
  };
  const astronaut = (x, y, t, k = 1, wave = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    const a = -1.9 + 0.6 * Math.sin(t * 7 + wave);
    line(16, -6, 16 + Math.cos(a) * 34, -6 + Math.sin(a) * 34, 12, '#EDEDE8');
    rect(-20, -20, 40, 52, '#EDEDE8', 4, 10); circ(0, -38, 22, '#EDEDE8', 4); ell(4, -38, 13, 10, '#2E4A6B', 3);
    line(-10, 32, -14, 56, 12, '#EDEDE8'); line(10, 32, 14, 56, 12, '#EDEDE8');
    ctx.restore();
  };
  const iss = (sx, sy, t) => {
    line(sx - 210, sy, sx + 210, sy, 10, '#9AA0A8');
    for (const px of [-190, -120, 120, 190]) { rect(sx + px - 26, sy - 92, 52, 76, '#2E5A8A', 4, 2); rect(sx + px - 26, sy + 16, 52, 76, '#2E5A8A', 4, 2); line(sx + px, sy - 16, sx + px, sy + 16, 5); }
    rect(sx - 70, sy - 22, 140, 44, '#E9E6DE', LW, 16); rect(sx - 22, sy - 60, 44, 120, '#E9E6DE', LW, 14);
    astronaut(sx + 30, sy - 120, t, 0.9, 0); astronaut(sx + 110, sy - 106, t, 0.9, 1.4);
    tx('UZAY İSTASYONU · 408 km', sx, sy + 150, 38, '#F4EFE3');
  };
  const gps = (sx, sy) => {
    rect(sx - 40, sy - 40, 80, 80, '#E2B13C', LW, 6); line(sx - 40, sy, sx - 70, sy, 6); line(sx + 40, sy, sx + 70, sy, 6);
    rect(sx - 230, sy - 34, 160, 68, '#2E5A8A', 4, 3); rect(sx + 70, sy - 34, 160, 68, '#2E5A8A', 4, 3);
    for (const px of [-190, -150, -110, 110, 150, 190]) line(sx + px, sy - 34, sx + px, sy + 34, 3, '#7FA6CF');
    line(sx, sy + 40, sx, sy + 76, 5); circ(sx, sy + 84, 10, '#BFC4CA', 4);
    tx('GPS · 20.200 km', sx, sy + 140, 38, '#F4EFE3');
  };
  const moonDisc = (x, y, r) => {
    circ(x, y, r, '#EDE7D2', Math.min(LW, r * 0.12));
    for (const [cx, cy, cr] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.12], [-0.05, 0.35, 0.1], [0.32, -0.32, 0.08]]) circ(x + cx * r, y + cy * r, cr * r, '#D6CDB2', 0);
  };

  const scenes = [];
  // 0 · tırmanış: kapakta merdivenin dibi; dünya merdiven yönünde kayar, duraklar sözcüklerinde sen'in hizasından geçer
  scenes[0] = t => {
    t = loopT(t);
    const off = s(t), sE = s(w('l02', 5)), sK = s(w('l02', 11));
    const q = clamp01((off - sE * 0.6) / (sK - sE * 0.6));   // gökyüzü kararması
    bg(mix('#BFD6DC', '#141B2A', q));
    if (q > 0.05) for (const st of STARS) { const y = ((st.y + off * DY * 0.35) % 2300) - 160; circ(st.x - (off * DX * 0.35) % 1, y, st.r, `rgba(255,250,235,${q * (0.6 + 0.4 * Math.sin(t * 2 + st.ph))})`, 0); }
    // Ay: yaklaştıkça büyür (geçen sürenin log'u ile)
    const P = Math.log10(elapsed(t) + 1) / Math.log10(AN.at(-1)[1] + 1);
    const mr = 46 * Math.exp(2.9 * Math.pow(P, 2.6));
    moonDisc(lerp(860, 760, P), lerp(700, 520, P), mr);
    // bulutlar (uzay sınırının altında)
    for (const c of CLOUDS) { if (c.sj > sK) continue; const [x, y] = [c.x - DX * (off - c.sj), c.y + DY * (off - c.sj)]; if (y > -120 && y < 2100) cloud(x, y, c.k); }
    // zemin, ev ve ağaçlar: yalnız başta görünür, aşağı kayar
    const gy = SA[1] + 6 + DY * off;
    if (gy < 2100) {
      rect(-300, gy, 1700, 1400, '#7DAE5E', 0); line(-300, gy, 1400, gy, LW);
      for (const [x, k] of [[120, 1], [230, 0.8], [960, 0.9]]) { rect(x - 10, gy - 70 * k, 20, 70 * k, '#7A5A3A', 4); circ(x, gy - 110 * k, 56 * k, '#5E9A4E', LW); }
      rect(290, gy - 120, 150, 120, '#E9D9BC', LW); poly([[278, gy - 120], [365, gy - 190], [452, gy - 120]], '#B4563A', LW); rect(345, gy - 64, 36, 64, '#6A4A2E', 4);
    }
    // duraklar
    const tE = w('l02', 5), tK = w('l02', 11), tI = w('l02', 17), tG = w('l03', 5);
    if (near(t, tE)) { const [x, y] = at(t, tE, 220, SA[1] - 300); mountain(x, y); }
    if (near(t, tK)) { const [, y] = at(t, tK, 0, SA[1] - 330); karman(y, q); }
    if (near(t, tI)) { const [x, y] = at(t, tI, 250, SA[1] - 380); iss(x, y, t); }
    if (near(t, tG)) { const [x, y] = at(t, tG, 250, SA[1] - 360); gps(x, y); }
    // hız çizgileri
    const v = vel(t);
    if (v > 150) { const r = mulberry32(Math.floor(t * 6)); ctx.save(); ctx.globalAlpha = 0.35 * (v - 150) / 230; for (let i = 0; i < 9; i++) { const x = r() * 1080, y = r() * 1900; line(x, y, x - DX * 140, y + DY * 140, 4, q > 0.5 ? '#C9D2E0' : '#FFFFFF'); } ctx.restore(); }
    stairs(t, q * 0.6);
    // "17 santim": sen'in önündeki basamakta ölçü
    const m = seg(t, w('l01', 7) - 0.1, 0.3) * (1 - seg(t, T.l01end + 0.3, 0.3));
    if (m > 0) { ctx.save(); ctx.globalAlpha = m; line(SA[0] + 60, SA[1] - 50, SA[0] + 60, SA[1] - 50 - RISE, 6, RED); tx('17 cm', SA[0] + 140, SA[1] - 60, 40, RED); ctx.restore(); }
    // sen: başta merdivenin dibinde Ay'a bakar; sonra sabit tempoda adım atar, yaşlandıkça hafif kamburlaşır
    const y = years(t), climbing = t > t0, ph = climbing ? ((t - t0) * 0.8) % 1 : null;
    const sas = t > T.l02 - 0.3 && t < T.l02 + 0.6;
    ch(SEN(t), { x: SA[0], y: SA[1], s: 110, facing: 1, walk: ph ?? undefined, view: climbing ? 'side' : 'front', lean: 4 + 12 * clamp01(y / 70),
      expr: y > 40 ? 'yorgun' : sas ? 'saskin' : 'notr', head: { look: climbing ? [0.4, -0.5] : [0.6, -0.7], tilt: climbing ? -4 : 0 },
      ...(climbing ? {} : { armR: { sh: 70, el: 30 } }) }, t);
  };
  // 1 · Ay yüzeyi: merdivenin son basamağından Ay'a adım; Apollo 11 aynı yolu üç günde geçer
  scenes[1] = t => {
    bg('#141B2A');
    for (const st of STARS) circ(st.x, st.y * 0.55, st.r, `rgba(255,250,235,${0.55 + 0.4 * Math.sin(t * 2 + st.ph)})`, 0);
    circ(250, 560, 70, '#3E78B8', LW); poly([[214, 520], [250, 506], [270, 540], [236, 566]], '#5E9A4E', 0); poly([[260, 586], [296, 572], [300, 600], [270, 612]], '#5E9A4E', 0);
    // yüzey
    ctx.beginPath(); ctx.moveTo(-200, 1060); ctx.quadraticCurveTo(540, 990, 1300, 1060); ctx.lineTo(1300, 2400); ctx.lineTo(-200, 2400); ctx.closePath(); ctx.fillStyle = '#CFC8B4'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = PAL.ink; ctx.stroke();
    for (const [x, y, r] of [[780, 1180, 70], [960, 1120, 40], [180, 1240, 50], [640, 1320, 34]]) ell(x, y, r, r * 0.32, '#B9B19B', 4);
    // merdivenin üst ucu: soldan aşağıdan yüzeye çıkar
    const steps = [];
    for (let i = 0; i < 10; i++) { const x = 300 - (9 - i) * RUN * 1.2, y = 1062 + (9 - i) * RISE; steps.push([x, y], [x + RUN * 1.2, y], [x + RUN * 1.2, y - RISE]); }
    poly([...steps.slice(0, -1), [330, 1100], [200, 1600], [120, 1600]], '#8E8A84', LW);
    // sen: H'de son basamaktan Ay'a "hop"
    const u = ease.state(seg(t, H - 0.1, 0.55));
    const x = lerp(300, 470, u), y = lerp(1062, 1050, u) - Math.sin(u * Math.PI) * 46;
    const land = seg(t, H + 0.42, 0.7);
    if (land > 0 && land < 1) for (let k = 0; k < 6; k++) { const a = Math.PI + k * Math.PI / 5; circ(470 + Math.cos(a) * 60 * land, 1052 + Math.sin(a) * 18 * land, 16 * (1 - land), '#DCD6C4', 0); }
    if (t > H + 0.45) ell(500, 1062, 22, 7, '#A39B86', 0);
    const appU = seg(t, w('l06', 0) - 0.1, w('l06', 6) - w('l06', 0) + 0.2);
    const sas = appU > 0 && t < w('l06', 8);
    ch(SEN(H), { x, y, s: 118, facing: 1, view: u < 1 ? 'side' : 'front', walk: u > 0 && u < 1 ? u * 0.5 : undefined, lean: 16 - 6 * seg(t, H + 0.6, 0.6),
      expr: sas ? 'saskin' : t > T.l05 && t < T.l05end + 0.3 ? 'yorgun' : t > H + 0.5 ? 'mutlu' : 'notr',
      head: { look: sas ? [0.8, -0.6] : t > w('l06', 8) ? [0, 0] : [0.4, -0.3] }, armR: { sh: t > H + 0.6 && t < T.l05 ? 150 : 20, el: 20 } }, t);
    // Apollo 11: Dünya'dan Ay'a, kesik izle
    if (appU > 0) {
      const p = ease.state(appU), rx = lerp(310, 760, p), ry = lerp(560, 1030, p) - Math.sin(p * Math.PI) * 160;
      ctx.save(); ctx.setLineDash([10, 12]); ctx.beginPath(); ctx.moveTo(310, 560);
      for (let k = 1; k <= 20; k++) { const pk = p * k / 20; ctx.lineTo(lerp(310, 760, pk), lerp(560, 1030, pk) - Math.sin(pk * Math.PI) * 160); }
      ctx.lineWidth = 5; ctx.strokeStyle = '#F4EFE3'; ctx.stroke(); ctx.restore();
      const ang = p < 1 ? Math.atan2(lerp(560, 1030, Math.min(1, p + 0.02)) - Math.sin(Math.min(1, p + 0.02) * Math.PI) * 160 - ry, lerp(310, 760, Math.min(1, p + 0.02)) - rx) : Math.PI / 2;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(ang + Math.PI / 2);
      if (p < 1) poly([[-10, 30], [0, 62 + 10 * Math.sin(t * 40)], [10, 30]], '#F2A23A', 3);
      rect(-14, -30, 28, 60, '#F4F1EA', 4, 4); poly([[-14, -30], [0, -56], [14, -30]], '#F4F1EA', 4); poly([[-14, 18], [-26, 32], [-14, 30]], RED, 3); poly([[14, 18], [26, 32], [14, 30]], RED, 3);
      ctx.restore();
    }
  };

  // ——— kamera ———
  const P = (z, x, y, i) => [z, i * SX + x, y];
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const F0 = P(1.0, 540, 960, 0);
  const cam = [
    [0, ...F0],
    [T.l01end, ...P(1.06, 540, 960, 0)],
    [w('l02', 5), ...P(1.0, 520, 960, 0)],
    [w('l03', 8), ...P(1.0, 520, 960, 0)],
    [T.l03end - 0.2, ...P(1.55, 520, 1010, 0)],           // "saçların ağarıyor": yüzüne yaklaş
    [w('l04', 6), ...P(1.0, 560, 900, 0)],                // Ay belirir
    ...cut(H - 0.12, P(1.0, 560, 900, 0), P(1.05, 520, 960, 1)),
    [H + 1.1, ...P(1.12, 480, 980, 1)],                   // varış: durgunluk
    [T.l06, ...P(1.12, 480, 980, 1)],
    [w('l06', 7), ...P(0.98, 540, 900, 1)],
    [T.l06end + 0.2, ...P(1.05, 520, 940, 1)],
    [T.loop0 - 0.001, ...P(1.05, 520, 940, 1)],
    [T.loop0, ...P(1.03, 540, 960, 0)],
    [T.D, ...F0],
  ];

  return {
    cam,
    title: ["Ay'a merdivenle", 'kaç yıl?'],
    kicker: 'KAÇ SIFIR? · UZAY',
    draw(t) {
      ctx.fontStretch = 'semi-condensed';   // kaplamanın setFont'u bunu kareden kareye taşıyor: ilk karede de aynı olsun (determinizm)
      let k = 0; for (let i = 0; i < cam.length; i++) if (cam[i][0] <= t) k = i;
      const i = Math.round((cam[k][2] - 540) / SX);
      ctx.save(); ctx.translate(i * SX, 0); scenes[Math.max(0, Math.min(1, i))](t); ctx.restore();
    },
    names: [],
    numbers: [[w('l06', 5) - 0.1, w('l06', 8) + 0.6, '3 gün', 'APOLLO 11 · 1969']],
    // geçen süre sayacı: başlık çıkınca belirir, varışta "71 yıl 8 ay"da donar ve kızarır
    overlay(t, c, O) {
      const t1 = T.l01end + 0.5, t2 = w('l06', 5) - 0.2;
      const inU = ease.enter(seg(t, t1, 0.3)), out = ease.exit(seg(t, t2, 0.25));
      if (inU <= 0 || out >= 1 || t >= T.loop0) return;
      const e = elapsed(t), done = t >= H, y = 470 + (1 - inU) * 50 - out * 60;
      c.save(); c.globalAlpha = 1 - out; c.fontStretch = 'semi-condensed';
      O.scrim(540, y, 900, 300, 0.5);
      tx(fmt(e), 540, y + 6, done ? 104 : 92, done ? RED : PAL.ink);
      tx(done ? "AY'A VARIŞ" : 'MERDİVENDE GEÇEN SÜRE', 540, y + 58, 36, done ? PAL.ink : RED);
      c.restore();
    },
  };
}

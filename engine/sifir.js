// "Sıfır": Kaç Sıfır?'ın maskotu. Tatlı ve şapşik; başı kusursuz bir 0 (kanalın adı).
// Bebek şeması (Kindchenschema): büyük yuvarlak baş, alçak yerleşimli iri gözler, küçük ağız,
// kısa ve tombul uzuvlar, yumuşak kalın kontur. TEK çizim fonksiyonu + dondurulmuş karakter kartı.
// Önce iskelet (eklem açıları) → hacimler (baş, fasulye gövde, uzuvlar) → ayrıntı (yüz, saç kıvrımı, yanak).
//
// Birim: baş çapı = 1 (H). Kök (0,0) = ayak tabanının ortası (yer). Toplam boy ≈ 2,0 H (baş:boy = 1:2;
// maskot çalışmasında en yüksek puanı alan oran). Ölçüler research/maskot.md'deki B yönünden ("Fasulye gövde").
// Yasaklar: beyaz göz akı yok, halka içinde halka göz yok (nazar/hedef), parmak yok (OK/sıfır işareti asla).

export const SIFIR_CARD = Object.freeze({
  name: 'Sıfır',
  head: 1.0,                 // baş çapı
  ring: { rx: 0.435, ry: 0.45 }, // iç elips: matbaa 0'ı gibi yanlarda kalın halka
  body: { w: 0.66, h: 0.62, tuck: 0.1 }, // fasulye gövde, başın altına 0,10 sokulu (boyun yok)
  arm: 0.38, leg: 0.32, limbW: 0.12, hand: 0.13, foot: { w: 0.2, h: 0.11 },
  outline: 0.055,            // kontur kalınlığı (H)
  eye: { w: 0.15, h: 0.19, y: 0.08, gap: 0.19, hl: 0.03, hl2: 0.0125 }, // y: baş merkezinin altında (alçak yerleşim)
  blush: { w: 0.085, h: 0.045, y: 0.22, x: 0.31, alpha: 0.25 },
  curl: true,                // başın üstünde kalem kıvrımı (şapşik ayrıntı)
  palette: { ink: '#1C1B18', paper: '#ECE5D5', fill: '#F7F2E7', red: '#E0391C', graphite: '#8B8577' },
  expressions: {
    notr: { eye: 1, mouth: 'smile', m: 0.35 },
    sayiyor: { eye: 1, mouth: 'o', m: 0.6, look: [0.6, -0.7] },
    mutlu: { eye: 'happy', mouth: 'open', m: 1 },
    saskin: { eye: 1.25, mouth: 'o', m: 1, brows: 1 },
    dusunceli: { eye: 0.9, mouth: 'flat', m: 0, look: [0.5, -0.6], brows: 0.4 },
    uykulu: { eye: 'closed', mouth: 'smile', m: 0.15 },
    yorgun: { eye: 0.55, mouth: 'wavy', m: 0.5, sweat: true },
  },
});

const rad = d => (d * Math.PI) / 180;

// Pozlar: açılar derece (0 = aşağı, + = ileri). sq: ezilme/esneme (0 = yok, + yayvan, − uzun)
export const POSES = {
  ayakta: { lean: 0, tilt: 0, la: -20, ra: 20, ll: -6, rl: 6, sq: 0 },
  isaret: { lean: -4, tilt: -8, la: -20, ra: 130, ll: -6, rl: 6, sq: 0 },
  sayma: { lean: 3, tilt: 10, la: 60, ra: 95, ll: -6, rl: 6, sq: 0 },
  katlama: { lean: 6, tilt: 14, la: 80, ra: 75, ll: -4, rl: 8, sq: 0.02 },
  sasirma: { lean: -6, tilt: -10, la: -150, ra: 150, ll: -18, rl: 18, sq: -0.12 },
  oturma: { lean: -4, tilt: 6, la: 35, ra: 40, ll: 80, rl: 85, sq: 0.06, sit: true },
  bakma_yukari: { lean: -6, tilt: -26, la: -25, ra: 25, ll: -6, rl: 6, sq: 0 },
  kosma: { lean: 14, tilt: 6, la: -60, ra: 70, ll: 40, rl: -40, sq: 0 },
};

// Paytak yürüyüş (8 kare): kısa adım, gövde sağa sola yatar, her adımda küçük sekme
export function walkPose(phase) {
  const a = Math.sin(phase * Math.PI * 2);
  return { lean: 4, tilt: a * 4, roll: a * 5, bob: Math.abs(Math.sin(phase * Math.PI * 2)) * 0.05,
    la: -25 * a, ra: 25 * a, ll: 26 * a, rl: -26 * a, sq: Math.abs(a) * 0.03 };
}

export function mixPose(a, b, u) {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (typeof (a[k] ?? b[k]) === 'boolean') { o[k] = u < 0.5 ? a[k] : b[k]; continue; }
    o[k] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * u;
  }
  return o;
}

// drawSifir(ctx, card, pose, expr, H, opts) — kök: ayakların ortası (yer). opts: { facing, blink, color }
export function drawSifir(ctx, card, pose, expr, H, opts = {}) {
  const c = card, P = c.palette;
  const e = typeof expr === 'string' ? c.expressions[expr] : expr;
  const f = opts.facing ?? 1;
  const sq = pose.sq || 0;
  ctx.save();
  ctx.scale(H * f, H);
  ctx.translate(0, -(pose.bob || 0));
  // ezilme/esneme yerden: hacim korunur
  ctx.scale(1 + sq, 1 / (1 + sq));
  ctx.rotate(rad(pose.roll || 0));
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const lw = Math.max(c.outline, 2.2 / H);

  // 1) İSKELET: kalça, omuz, boyun noktaları
  const legL = pose.sit ? c.leg * 0.9 : c.leg;
  const hip = [0, -legL - c.foot.h * 0.4];
  const lean = rad(pose.lean || 0);
  const bodyTop = [hip[0] + Math.sin(lean) * c.body.h, hip[1] - Math.cos(lean) * c.body.h];
  const shoulder = [hip[0] + Math.sin(lean) * c.body.h * 0.62, hip[1] - Math.cos(lean) * c.body.h * 0.62];
  const tilt = rad((pose.tilt || 0) + (pose.lean || 0));
  const hr = c.head / 2 - (c.body.tuck ?? 0.08);
  const hc = [bodyTop[0] + Math.sin(tilt) * hr, bodyTop[1] - Math.cos(tilt) * hr];

  const limb = (o, ang, len) => [o[0] + Math.sin(rad(ang)) * len, o[1] + Math.cos(rad(ang)) * len];
  const stroke = (a, b, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
  // tombul uzuv: kontur + iç dolgu (iki katman çizgi)
  const fatLimb = (a, b) => { stroke(a, b, c.limbW + lw * 1.6, P.ink); stroke(a, b, c.limbW - lw * 0.2, P.fill); };

  // 2) HACİMLER (arkadan öne): arka kol, bacaklar, gövde, ön kol, baş
  const hipL = [hip[0] - 0.13, hip[1]], hipR = [hip[0] + 0.13, hip[1]];
  const kneeL = limb(hipL, pose.ll || 0, legL), kneeR = limb(hipR, pose.rl || 0, legL);
  const shL = [shoulder[0] - c.body.w * 0.42, shoulder[1]], shR = [shoulder[0] + c.body.w * 0.42, shoulder[1]];
  const handL = limb(shL, pose.la || 0, c.arm), handR = limb(shR, pose.ra || 0, c.arm);
  const dot = (p, r, fill) => { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = P.ink; ctx.stroke(); };

  if (!opts.noShadow) { ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = P.graphite; ctx.beginPath();
    ctx.ellipse(0, (pose.bob || 0) - 0.005, 0.3 / (1 + sq), 0.035, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  fatLimb(shL, handL); dot(handL, c.hand / 2, P.fill);
  if (!opts.noLegs) for (const [h, k] of [[hipL, kneeL], [hipR, kneeR]]) {
    fatLimb(h, k);
    ctx.beginPath(); ctx.ellipse(k[0] + 0.04, k[1] + 0.02, c.foot.w / 2, c.foot.h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.ink; ctx.fill();
  }
  // fasulye gövde
  ctx.save(); ctx.translate((hip[0] + bodyTop[0]) / 2, (hip[1] + bodyTop[1]) / 2); ctx.rotate(lean);
  ctx.beginPath(); ctx.roundRect(-c.body.w / 2, -c.body.h / 2 - 0.04, c.body.w, c.body.h + 0.08, c.body.w * 0.48);
  ctx.fillStyle = P.fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = P.ink; ctx.stroke();
  ctx.restore();
  fatLimb(shR, handR); dot(handR, c.hand / 2, P.fill);

  // baş: kusursuz 0 — dolgu + kalın yumuşak kontur
  ctx.save(); ctx.translate(hc[0], hc[1]); ctx.rotate(tilt);
  ctx.beginPath(); ctx.arc(0, 0, c.head / 2, 0, Math.PI * 2); ctx.fillStyle = P.ink; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, c.ring.rx, c.ring.ry, 0, 0, Math.PI * 2); ctx.fillStyle = P.fill; ctx.fill();
  ctx.restore();

  // 3) AYRINTI: saç kıvrımı, yüz
  ctx.save(); ctx.translate(hc[0], hc[1]); ctx.rotate(tilt);
  if (c.curl) {
    ctx.lineWidth = lw; ctx.strokeStyle = P.ink; ctx.beginPath();
    ctx.moveTo(0.02, -0.49); ctx.bezierCurveTo(0.02, -0.66, 0.2, -0.66, 0.16, -0.56); ctx.bezierCurveTo(0.13, -0.5, 0.06, -0.55, 0.1, -0.6); ctx.stroke();
  }
  if (H > 14 && e) {
    const look = e.look || [0.15, 0];
    const lx = look[0] * 0.05, ly = look[1] * 0.04;
    // yanaklar (tek kırmızı istisna: maskotun kimliği, düşük opaklık)
    ctx.fillStyle = `rgba(224,57,28,${c.blush.alpha})`;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * c.blush.x, c.blush.y, c.blush.w, c.blush.h, 0, 0, Math.PI * 2); ctx.fill(); }
    // gözler
    ctx.fillStyle = P.ink; ctx.strokeStyle = P.ink; ctx.lineWidth = lw * 0.9;
    for (const s of [-1, 1]) {
      const ex = s * c.eye.gap + lx, ey = c.eye.y + ly;
      if (e.eye === 'closed') { ctx.beginPath(); ctx.arc(ex, ey - 0.01, c.eye.w * 0.7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); continue; }
      if (e.eye === 'happy') { ctx.beginPath(); ctx.arc(ex, ey + 0.03, c.eye.w * 0.75, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); continue; }
      const open = Math.max(0.08, (typeof e.eye === 'number' ? e.eye : 1) * (1 - (opts.blink || 0)));
      ctx.beginPath(); ctx.ellipse(ex, ey, c.eye.w / 2 * (e.eye > 1 ? 1.1 : 1), (c.eye.h / 2) * open, 0, 0, Math.PI * 2); ctx.fill();
      if (open > 0.5) { ctx.fillStyle = P.fill; ctx.beginPath(); ctx.arc(ex + c.eye.w * 0.12, ey - c.eye.h * 0.17 * open, c.eye.hl, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex - c.eye.w * 0.14, ey + c.eye.h * 0.2 * open, c.eye.hl2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = P.ink; }
    }
    if (e.brows) { ctx.lineWidth = lw * 0.8; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * c.eye.gap - 0.06, -0.1 - e.brows * 0.05); ctx.lineTo(s * c.eye.gap + 0.06, -0.12 - e.brows * 0.05); ctx.stroke(); } }
    // ağız: küçük, gözlerin arasında ve biraz altında
    const my = 0.25; ctx.lineWidth = lw * 0.9;
    if (e.mouth === 'o') { ctx.beginPath(); ctx.ellipse(0, my, 0.045, 0.06, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (e.mouth === 'open') { ctx.beginPath(); ctx.moveTo(-0.07, my - 0.015); ctx.quadraticCurveTo(0, my + 0.12, 0.07, my - 0.015); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(224,57,28,0.55)`; ctx.beginPath(); ctx.ellipse(0, my + 0.045, 0.03, 0.018, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = P.ink; }
    else if (e.mouth === 'wavy') { ctx.beginPath(); ctx.moveTo(-0.06, my); ctx.quadraticCurveTo(-0.03, my - 0.03, 0, my); ctx.quadraticCurveTo(0.03, my + 0.03, 0.06, my); ctx.stroke(); }
    else if (e.mouth === 'flat') { ctx.beginPath(); ctx.moveTo(-0.04, my); ctx.lineTo(0.04, my); ctx.stroke(); }
    else { const m = e.m ?? 0.35; ctx.beginPath(); ctx.moveTo(-0.055, my - 0.01); ctx.quadraticCurveTo(0, my + 0.07 * m, 0.055, my - 0.01); ctx.stroke(); }
    if (e.sweat) { ctx.fillStyle = '#8BB4D9'; ctx.beginPath(); ctx.moveTo(0.36, -0.2); ctx.quadraticCurveTo(0.43, -0.08, 0.36, -0.05); ctx.quadraticCurveTo(0.29, -0.08, 0.36, -0.2); ctx.fill(); }
  }
  ctx.restore();
  ctx.restore();
  const T = p => [p[0] * H * f, p[1] * H];
  return { head: T(hc), handL: T(handL), handR: T(handR) };
}

// "Nefes" karakterleri ve nesneleri: Vitomir Maričić (2025, koyu dalış giysisi; yüz ayrıntısı yok) ve Cuvier gagalı
// balinası (Ziphius cavirostris). İnsan, termometre_chars'ın tek iskelet fonksiyonuyla çizilir (kimlik kartla kilitli);
// balina tek fonksiyon: iğ biçimli gövde, kısa gaga, yukarı kıvrık ağız çizgisi, geride küçük sırt yüzgeci, açık renkli
// baş ve gövdede ince açık çizik izleri (türün belirgin özelliği). Gravür dili; kırmızı yok.
// Balina birimi: boy = 1 (L px), kök gövde ortası, sağa bakar.
const INK = '#1C1B18', PAPER = '#F4EEE1', GRAPH = '#8B8577';

export const DIVER_CARD = Object.freeze({ name: 'Vitomir Maričić (2025: kısa saç, koyu dalış giysisi; yüz ayrıntısı yok)', hat: 'short', top: 'parka', legs: 'dark', stroke: 0.012 });
// İnsan figürü (termometre_chars.drawPerson ile aynı iskelet ve oranlar) ama YÜZSÜZ: gerçek kişiler (dalgıç, hakemler)
// için göz işareti çizilmez. Birim: boy = 1, kök ayak tabanı, sağa bakar.
const rad = d => (d * Math.PI) / 180;
function limb(ctx, x0, y0, x1, y1, w, lw, fill = PAPER) {
  ctx.strokeStyle = INK; ctx.lineWidth = w + lw * 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = fill; ctx.lineWidth = Math.max(0.001, w - lw * 0.2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}
export function drawFigure(ctx, card, pose, size) {
  ctx.save(); ctx.scale(size, size); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(card.stroke, 1.4 / size), dark = card.top === 'parka';
  ctx.translate(0, -(0.5 - (pose.sit || 0))); ctx.rotate(rad(pose.body || 0));
  for (let i = 0; i < 2; i++) {
    const a = rad(pose.hip[i]), k = rad(pose.knee[i]);
    const kx = Math.sin(a) * 0.25, ky = Math.cos(a) * 0.25, fx = kx + Math.sin(a + k) * 0.25, fy = ky + Math.cos(a + k) * 0.25;
    const fill = card.legs === 'dark' ? GRAPH : PAPER;
    limb(ctx, 0, 0, kx, ky, 0.05, lw, fill); limb(ctx, kx, ky, fx, fy, 0.045, lw, fill);
    ctx.beginPath(); ctx.ellipse(fx + Math.cos(a + k) * 0.035, fy - Math.sin(a + k) * 0.006, 0.05, 0.02, -(a + k), 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  }
  const T = 0.3, w0 = 0.085;
  ctx.beginPath(); ctx.moveTo(-w0, -T); ctx.lineTo(w0, -T); ctx.lineTo(w0 * 0.95, 0.02); ctx.lineTo(-w0 * 0.95, 0.02); ctx.closePath();
  ctx.fillStyle = dark ? GRAPH : PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  if (card.top === 'coat') { ctx.beginPath(); ctx.moveTo(0, -T); ctx.lineTo(0.005, 0.02); ctx.lineWidth = lw * 0.8; ctx.stroke(); }
  for (let i = 0; i < 2; i++) {
    const a = rad(pose.sh[i]), e = rad(pose.el[i]);
    const sx = 0.004, sy = -T + 0.025, ex = sx + Math.sin(a) * 0.15, ey = sy + Math.cos(a) * 0.15, hx = ex + Math.sin(a + e) * 0.14, hy = ey + Math.cos(a + e) * 0.14;
    limb(ctx, sx, sy, ex, ey, 0.036, lw, dark ? GRAPH : PAPER); limb(ctx, ex, ey, hx, hy, 0.032, lw, dark ? GRAPH : PAPER);
    ctx.beginPath(); ctx.arc(hx, hy, 0.022, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke();
  }
  // baş: yalnız saç kütlesi, yüz yok
  const hy = -T - 0.085;
  ctx.beginPath(); ctx.arc(0.008, hy, 0.062, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.004, hy - 0.012, 0.062, Math.PI * 1.04, Math.PI * 1.96); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
export const JUDGE_CARD = Object.freeze({ name: 'hakem (önlük; kimliksiz, yüzsüz)', top: 'coat', legs: 'plain', stroke: 0.012 });

export const DIVER_POSES = {
  // havuzun dibinde sırtüstü, eller başın arkasında (Divernet); baş solda
  supine: { body: -90, hip: [2, -4], knee: [0, 6], sh: [168, 160], el: [-150, -146], eyes: 'closed' },
  sitMask: { body: 6, hip: [-6, 6], knee: [0, 0], sh: [-10, 150], el: [8, 60] },
};

// gövde ana hattı (üst ve alt; burundan kuyruğa); tail: kuyruk sapının dikey sapması (yüzgeç vuruşu)
const TOP = [[0.5, 0.014], [0.485, -0.006], [0.465, -0.04], [0.43, -0.075], [0.36, -0.098], [0.22, -0.11], [0.05, -0.112], [-0.1, -0.104], [-0.22, -0.082], [-0.32, -0.052], [-0.4, -0.03], [-0.45, -0.02]];
const BOT = [[-0.45, 0.016], [-0.4, 0.026], [-0.3, 0.054], [-0.15, 0.092], [0.0, 0.106], [0.15, 0.102], [0.28, 0.084], [0.38, 0.06], [0.45, 0.036], [0.49, 0.022]];
const bend = (x, tail) => { const u = Math.max(0, (-x - 0.18) / 0.32); return tail * u * u; };

export function drawBeakedWhale(ctx, L, ph = 0, { tag = false, tail = null } = {}) {
  const tb = tail ?? 0.05 * Math.sin(ph);
  const P = ([x, y]) => [x * L, (y + bend(x, tb)) * L];
  const body = () => { ctx.beginPath(); TOP.map(P).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); BOT.map(P).forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); };
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = Math.max(1.6, L * 0.0045);
  // kuyruk yüzgeci (yandan ince kama), gövdenin arkasında
  { const t0 = P([-0.45, 0]), dy = bend(-0.5, tb) * L; ctx.beginPath(); ctx.moveTo(t0[0], t0[1] - 0.02 * L); ctx.quadraticCurveTo(-0.5 * L, dy - 0.01 * L, -0.56 * L, dy - 0.045 * L); ctx.lineTo(-0.535 * L, dy + 0.004 * L); ctx.quadraticCurveTo(-0.5 * L, dy + 0.02 * L, t0[0], t0[1] + 0.018 * L); ctx.closePath(); ctx.fillStyle = GRAPH; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
  // gövde: kâğıt zemin + sıkı tarama (koyu gövde), baş açık kalır
  body(); ctx.fillStyle = PAPER; ctx.fill();
  ctx.save(); body(); ctx.clip();
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, L * 0.0022);
  const gap = Math.max(4, L * 0.011);
  for (let x = -0.62 * L; x < 0.25 * L; x += gap) { const fade = x > 0.16 * L ? 1 - (x - 0.16 * L) / (0.09 * L) : 1; if (fade <= 0) continue; ctx.globalAlpha = fade; ctx.beginPath(); ctx.moveTo(x, -0.12 * L); ctx.lineTo(x + 0.16 * L, 0.12 * L); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // karın biraz daha açık: ince ters tarama yok, kâğıt bant
  ctx.fillStyle = 'rgba(244,238,225,0.55)'; ctx.beginPath(); ctx.ellipse(0.02 * L, 0.07 * L, 0.3 * L, 0.03 * L, 0, 0, Math.PI * 2); ctx.fill();
  // açık çizik izleri (ince, uzun, hafif eğik)
  ctx.strokeStyle = PAPER; ctx.lineWidth = Math.max(1.2, L * 0.003);
  for (const [x0, y0, len, a] of [[-0.2, -0.04, 0.16, 0.05], [-0.05, -0.02, 0.2, -0.04], [0.02, 0.03, 0.14, 0.06], [-0.28, 0.0, 0.12, -0.06], [0.08, -0.06, 0.12, 0.03], [-0.12, 0.05, 0.1, 0.02]]) {
    const a0 = P([x0, y0]); ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a0[0] + len * L, a0[1] + a * len * L); ctx.stroke();
  }
  ctx.restore();
  body(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  // sırt yüzgeci (küçük, geride)
  { const a = P([-0.16, -0.094]), b = P([-0.25, -0.072]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(-0.215 * L, a[1] - 0.06 * L, -0.25 * L, a[1] - 0.055 * L); ctx.lineTo(b[0], b[1]); ctx.closePath(); ctx.fillStyle = GRAPH; ctx.fill(); ctx.stroke(); }
  // yüzgeç (küçük, aşağı geriye)
  ctx.beginPath(); ctx.moveTo(0.27 * L, 0.055 * L); ctx.quadraticCurveTo(0.22 * L, 0.1 * L, 0.18 * L, 0.115 * L); ctx.quadraticCurveTo(0.22 * L, 0.085 * L, 0.24 * L, 0.06 * L); ctx.closePath(); ctx.fillStyle = GRAPH; ctx.fill(); ctx.stroke();
  // ağız çizgisi (yukarı kıvrık) ve göz
  ctx.beginPath(); ctx.moveTo(0.5 * L, 0.016 * L); ctx.quadraticCurveTo(0.47 * L, 0.034 * L, 0.44 * L, 0.02 * L); ctx.lineWidth = lw * 0.9; ctx.stroke();
  ctx.beginPath(); ctx.arc(0.39 * L, -0.02 * L, Math.max(2, L * 0.006), 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  // uydu etiketi: sırt yüzgecinin önünde küçük kutu ve anten
  if (tag) { const p = P([-0.1, -0.103]); ctx.fillStyle = PAPER; ctx.fillRect(p[0] - 0.02 * L, p[1] - 0.022 * L, 0.04 * L, 0.022 * L); ctx.lineWidth = lw * 0.9; ctx.strokeRect(p[0] - 0.02 * L, p[1] - 0.022 * L, 0.04 * L, 0.022 * L); ctx.beginPath(); ctx.moveTo(p[0] + 0.01 * L, p[1] - 0.022 * L); ctx.lineTo(p[0] - 0.02 * L, p[1] - 0.07 * L); ctx.stroke(); }
  ctx.restore();
}

// oksijen tüpü (birim: yükseklik); "O2" etiketi alt simgeyle
export function drawTank(ctx, H) {
  ctx.save(); const w = H * 0.3;
  ctx.beginPath(); ctx.roundRect(-w / 2, -H, w, H, w / 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = Math.max(2, H * 0.02); ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(-w * 0.18, -H - H * 0.08, w * 0.36, H * 0.09);
  ctx.beginPath(); ctx.moveTo(-w / 2, -H * 0.62); ctx.lineTo(w / 2, -H * 0.62); ctx.moveTo(-w / 2, -H * 0.38); ctx.lineTo(w / 2, -H * 0.38); ctx.stroke();
  ctx.font = `800 ${Math.round(H * 0.17)}px Archivo`; ctx.textAlign = 'center'; ctx.fillText('O', -w * 0.08, -H * 0.45);
  ctx.font = `800 ${Math.round(H * 0.1)}px Archivo`; ctx.fillText('2', w * 0.16, -H * 0.42);
  ctx.restore();
}

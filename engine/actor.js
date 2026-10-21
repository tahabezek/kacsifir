// Sıfır'ın sahne aktörlüğü: senaryo (zamanlı eylemler) → her t için konum, poz, ifade ve efektler.
// Saf fonksiyon: aynı t → aynı kare. Efektler tohumlu (mulberry32), boşta sallanma yok; nefes ve göz kırpma var.
//
// Eylemler (senaryo öğeleri): { type, t0, t1, ... }
//   idle       — durur, nefes alır, göz kırpar (varsayılan)
//   count      — sayar: sayma pozu, baloncukta 1, 2, 3… (opts.to)
//   lookUp     — yukarı bakar (sütun/harita büyürken)
//   think      — düşünür (el çenede, "?" baloncuğu)
//   sweat      — terler, gözler yorgun
//   surprise   — doruk vuruşunda zıplar, ağız "o", "!" işareti
//   happy      — gülümser
//   sleep      — uyuklar, "z" baloncukları
//   flee       — patinajlı kaçış: çömel → tekerlek bacak + toz → fırla (dir)
//   enterSkid  — hız çizgileriyle koşarak gelir, frenle patinaj yapar, toz
//   fold       — elindeki kâğıdı katlamaya çalışır (opts.k: katlama sayısı)
import { ease, seg, lerp, spring, mulberry32 } from './core.js';
import { SIFIR_CARD, drawSifir, POSES, walkPose, mixPose } from './sifir.js';

const INK = '#1C1B18', PAPER = '#ECE5D5', GRAPH = '#8B8577';
const nf = new Intl.NumberFormat('tr-TR');

// tohumlu toz parçacıkları (bir kez üretilir)
const RD = mulberry32(4242);
const DUST = Array.from({ length: 14 }, () => ({ dt: RD() * 0.12, life: 0.35 + RD() * 0.2, ang: Math.PI * (0.55 + RD() * 0.4), dist: 50 + RD() * 90, r0: 8 + RD() * 6, r1: 22 + RD() * 18 }));
const STREAK = Array.from({ length: 7 }, (_, i) => ({ dy: -0.15 - i * 0.22 + RD() * 0.08, len: 0.6 + RD() * 0.7 }));

function dust(ctx, x, y, t, t0, dir, H) {
  ctx.save();
  for (const p of DUST) {
    const a = (t - t0 - p.dt) / p.life;
    if (a <= 0 || a >= 1) continue;
    const e = 1 - Math.pow(1 - a, 2.4);
    const ang = dir > 0 ? Math.PI - p.ang : p.ang;
    const px = x + Math.cos(ang) * p.dist * e * (H / 110), py = y - Math.abs(Math.sin(ang)) * p.dist * e * 0.45 * (H / 110);
    ctx.globalAlpha = (1 - a) * 0.55;
    ctx.fillStyle = PAPER; ctx.strokeStyle = GRAPH; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, lerp(p.r0, p.r1, e) * (H / 110), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function streaks(ctx, x, y, H, dir, a) {
  if (a <= 0) return;
  ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, H * 0.03);
  ctx.globalAlpha = a;
  for (const s of STREAK) { const yy = y + s.dy * H, x0 = x - dir * H * 0.55; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 - dir * s.len * H, yy); ctx.stroke(); }
  ctx.restore();
}

// tekerlek bacaklar: yerinde dönen bulanık halka + birkaç bacak izi (patinaj)
function wheelLegs(ctx, x, y, H, t, dir) {
  const r = H * 0.3, cx = x + dir * H * 0.02, cy = y - r * 0.9;
  ctx.save();
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, H * 0.05);
  ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.15, r, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.ellipse(cx - dir * r * 0.15, cy, r * 0.8, r * 0.65, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(1.5, H * 0.035); ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = t * 38 * dir + (i / 6) * Math.PI * 2;
    ctx.globalAlpha = 0.25 + 0.12 * (i % 3);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r * 1.1, cy + Math.sin(a) * r); ctx.stroke();
  }
  ctx.restore();
}

function bubble(ctx, x, y, H, text, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = `800 ${Math.round(H * 0.42)}px Archivo`; ctx.fontStretch = 'semi-condensed';
  const w = ctx.measureText(text).width + H * 0.5, h = H * 0.62;
  const bx = Math.max(90, Math.min(x - w / 2, 952 - w)), by = y - h; // Reels düğmelerine (x ≥ 960) taşmaz
  ctx.fillStyle = '#F7F2E7'; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, H * 0.04);
  ctx.beginPath(); ctx.roundRect(bx, by, w, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - H * 0.08, by + h - 1); ctx.lineTo(x - H * 0.18, by + h + H * 0.18); ctx.lineTo(x + H * 0.06, by + h - 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - H * 0.08, by + h); ctx.lineTo(x - H * 0.18, by + h + H * 0.18); ctx.lineTo(x + H * 0.06, by + h); ctx.stroke();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(text, x, by + h * 0.72); ctx.textAlign = 'left';
  ctx.restore();
}

// Göz kırpma: her ~3,4 sn'de 140 ms (tohumlu kayma)
// Göz kırpma: tohumlu 2,5–5,5 sn aralık, 150 ms; %20'si çift kırpma. Döngü dikişinden 0,4 sn uzak.
const BLINKS = new Map();
function blinkTimes(D) {
  const key = Math.round((D || 20) * 100); if (BLINKS.has(key)) return BLINKS.get(key);
  let a = 0x51F1A ^ key; const rnd = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = []; let t = 1.1;
  while (t < (D || 20) - 0.4) { out.push(t); if (rnd() < 0.2) out.push(t + 0.24); t += 2.5 + rnd() * 3; }
  BLINKS.set(key, out); return out;
}
function blinkAt(t, D) { for (const b of blinkTimes(D)) { const ph = t - b; if (ph >= 0 && ph < 0.15) return Math.sin((ph / 0.15) * Math.PI); } return 0; }

// Senaryodaki etkin eylem
function active(script, t) { let a = { type: 'idle', t0: 0, t1: Infinity }; for (const s of script) if (t >= s.t0 && t < (s.t1 ?? Infinity)) a = s; return a; }

// Ana çizim: home = {x, y} yer noktası, H = baş çapı (px)
let CUR_D = 20;
// Sağdaki Reels düğmeleri (x ≥ 960) üstüne hiçbir şey çizilmez: aktör o çizginin arkasından girip çıkar
export function drawActor(ctx, script, t, home, H, D) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 960, 1920); ctx.clip();
  drawActorInner(ctx, script, t, home, H, D);
  ctx.restore();
}
function drawActorInner(ctx, script, t, home, H, D) {
  CUR_D = D || 20;
  const s = active(script, t);
  const u = s.t1 && isFinite(s.t1) ? seg(t, s.t0, s.t1 - s.t0) : 0;
  let x = home.x, y = home.y, pose = POSES.ayakta, expr = 'notr', facing = home.facing ?? 1;
  let fx = null;
  // nefes: ~3,6 sn periyot (döngüye kilitli tam sayı tur), %2 ezilme — yerinde nefes, sallanma değil
  const breathe = Math.sin(((t / (D || 1)) * Math.max(1, Math.round((D || 3.6) / 3.6))) * Math.PI * 2) * 0.02;

  switch (s.type) {
    case 'count': {
      pose = mixPose(POSES.sayma, POSES.ayakta, 0.5 + 0.5 * Math.sin(t * 9));
      expr = s.expr || 'sayiyor';
      // valueAt: ekrandaki sayaçla aynı değeri söyler (balon sayaçla çelişmez)
      const n = Math.max(s.from ?? 1, Math.floor(s.valueAt ? s.valueAt(t) : lerp(s.from ?? 1, s.to ?? 3, Math.min(1, u * 1.05))));
      // balon yeri: 'side' (yanda, alçak), 'top' (başın üstünde, ortada), varsayılan (önde, yüksek)
      const bx = s.bubble === 'side' ? 1.15 : s.bubble === 'top' ? 0 : 0.95, by = s.bubble === 'side' ? 1.5 : s.bubble === 'top' ? 2.62 : 2.05;
      fx = () => bubble(ctx, x + H * bx * facing, y - H * by, H, s.label ? s.label(n) : nf.format(n), ease.enter(seg(t, s.t0, 0.3)));
      break;
    }
    case 'lookUp': pose = POSES.bakma_yukari; expr = s.expr || 'saskin'; break;
    case 'think': pose = POSES.sayma; expr = 'dusunceli';
      fx = () => bubble(ctx, x + H * 0.9 * facing, y - H * 2.05, H, '?', ease.enter(seg(t, s.t0, 0.3))); break;
    case 'sweat': pose = mixPose(POSES.ayakta, POSES.sayma, 0.3); expr = 'yorgun'; break;
    case 'happy': pose = POSES.isaret; expr = 'mutlu'; break;
    case 'sleep': pose = POSES.oturma; expr = 'uykulu';
      fx = () => { ctx.save(); ctx.fillStyle = GRAPH; ctx.font = `800 ${Math.round(H * 0.35)}px Archivo`;
        for (let i = 0; i < 3; i++) { const k = ((t * 0.6 + i / 3) % 1); ctx.globalAlpha = Math.sin(k * Math.PI); ctx.fillText('z', x + H * (0.45 + k * 0.35), y - H * (2.25 + k * 0.7)); }
        ctx.restore(); }; break;
    case 'surprise': {
      // zıpla: yay (120/24) ile tepe ~0,35 H, iniş ezilmesi
      const tt = t - s.t0, jump = Math.max(0, Math.sin(Math.min(1, tt / 0.42) * Math.PI)) * 0.38 * H;
      y -= jump;
      pose = { ...POSES.sasirma, sq: tt < 0.06 ? 0.14 : tt > 0.42 && tt < 0.52 ? 0.12 : -0.08 };
      expr = 'saskin';
      fx = () => { ctx.save(); ctx.fillStyle = '#E0391C'; ctx.font = `800 ${Math.round(H * 0.7)}px Archivo`; ctx.globalAlpha = ease.enter(seg(t, s.t0, 0.15)); ctx.fillText('!', x - H * 0.78 * facing, y - H * 1.75); ctx.restore(); };
      break;
    }
    case 'flee': {
      // 0–0,18: çömel (hazırlık) · 0,18–0,62: patinaj (tekerlek bacak, toz) · 0,62–1: fırla (uzama, hız çizgisi)
      const dir = s.dir ?? -1; facing = dir;
      const dur = s.t1 - s.t0, tt = t - s.t0;
      const aCrouch = 0.18 * dur, aSpin = 0.62 * dur;
      if (tt < aCrouch) { pose = { ...POSES.kosma, sq: 0.16 * ease.state(tt / aCrouch), lean: 20 }; expr = 'saskin'; }
      else if (tt < aSpin) {
        pose = { ...POSES.kosma, lean: 24, sq: 0.04, la: -80, ra: 80 }; expr = 'yorgun';
        fx = () => { dust(ctx, x - dir * H * 0.1, y, t, s.t0 + aCrouch, dir, H); };
        const legs = () => wheelLegs(ctx, x, y, H, t, dir);
        return drawWith(ctx, x, y, H, pose, expr, facing, t, fx, legs);
      } else {
        const k = ease.enter(seg(t, s.t0 + aSpin, dur - aSpin));
        x += dir * k * (s.dist ?? 1100);
        pose = { ...walkPose((t * 3) % 1), lean: 28, sq: -0.14 };
        expr = 'yorgun';
        fx = () => streaks(ctx, x, y - H * 0.6, H, dir, 1 - k * 0.6);
      }
      break;
    }
    case 'enterSkid': {
      // 0–0,55: koşarak gelir (hız çizgisi) · 0,55–0,8: fren, geriye yaslan, toz · 0,8–1: hafif kayma ve oturma
      const dir = s.dir ?? 1; facing = dir;
      const k = ease.enter(seg(u, 0, 0.62));
      x = lerp(home.x - dir * (s.dist ?? 900), home.x + dir * H * 0.25, k);
      if (u > 0.62) x = lerp(home.x + dir * H * 0.25, home.x, ease.state(seg(u, 0.62, 0.38)));
      if (u < 0.55) { pose = { ...walkPose((t * 3) % 1), lean: 22 }; expr = 'mutlu'; fx = () => streaks(ctx, x, y - H * 0.6, H, dir, 1 - u); }
      else { pose = { ...POSES.ayakta, lean: -18 * (1 - ease.state(seg(u, 0.55, 0.45))), sq: 0.06 * (1 - u) }; expr = 'mutlu';
        fx = () => dust(ctx, x + dir * H * 0.2, y, t, s.t0 + 0.55 * (s.t1 - s.t0), -dir, H); }
      break;
    }
    case 'fold': pose = POSES.katlama; expr = s.expr || 'dusunceli'; break;
    case 'gone': return; // kadraj dışında
    default: pose = POSES.ayakta; expr = s.expr || 'notr';
  }
  drawWith(ctx, x, y, H, { ...pose, sq: (pose.sq || 0) + breathe }, expr, facing, t, fx, null);
}

function drawWith(ctx, x, y, H, pose, expr, facing, t, fx, legsFx) {
  ctx.save(); ctx.translate(x, y);
  if (legsFx) { ctx.restore(); legsFx(); ctx.save(); ctx.translate(x, y); }
  drawSifir(ctx, SIFIR_CARD, pose, expr, H, { facing, blink: blinkAt(t, CUR_D), noLegs: !!legsFx });
  ctx.restore();
  if (fx) fx();
}

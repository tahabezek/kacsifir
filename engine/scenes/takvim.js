// "Takvim" şablonu (Kaç Sıfır?): evrenin 13,8 milyar yıllık tarihi tek bir yıl olsaydı.
// A: 12 aylık gravür duvar takvimi; imleç günleri süpürür, olaylar gerçek tarihlerinde işaretlenir (Büyük Patlama 1 Ocak,
//    Güneş ve Dünya eylül başı, dinozorlar 25–30 Aralık). B: 31 Aralık kutusu büyüyüp günün cetveline dönüşür; cetvel
//    gece yarısına sabitlenmiş penceresini log uzayında daraltır (gün → saat → dakika → saniye): insan türü 23.48.34,
//    piramitler son 10,5 sn; doruk: 80 yıllık ömrün 0,18 sn'lik kırmızı dilimi. Bütün tarihler tek fonksiyondan:
//    dayOf(yearsAgo) = 365 × (1 − yearsAgo / 13,8e9). Anlatım saattir. Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { drawBang, drawSunEarth, drawDino, drawAsteroid, drawHuman, drawPyramid, drawYou } from '../takvim_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1300, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const AGE = 13.8e9, DAY = 86400, YEAR_S = 365 * DAY;
// tek kaynak: kaç yıl önce → takvim günü (0 = 1 Ocak 00.00, 365 = gece yarısı) ve gece yarısına kalan takvim saniyesi
export const dayOf = yearsAgo => 365 * (1 - yearsAgo / AGE);
export const secBefore = yearsAgo => (yearsAgo / AGE) * YEAR_S;
const EV = { sun: dayOf(4.6e9), dino0: dayOf(230e6), dino1: dayOf(66e6), humans: secBefore(3e5), pyr: secBefore(4600), life: secBefore(80) };
const MONTHS = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MSTART = MDAYS.reduce((a, d, i) => (a.push(i ? a[i - 1] + MDAYS[i - 1] : 0), a), []);
// takvim yerleşimi: 4 sütun × 3 satır ay kutusu; gün hücresi 26 × 17 (7 sütun)
const CAL = { x0: 92, y0: 752, mw: 202, mh: 136, gx: 208, gy: 142, cw: 26, ch: 15, top: 40 };
// gün paneli (31 Aralık kutusunun büyümüş hâli) ve içindeki cetvel
const PANEL = { x0: 120, x1: 880, y0: 742, y1: 1182 }, RUL = { x0: 140, x1: 860, y: 990, h: 50 };

export function takvimTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    bang: L.l02.t0, sun: Wd('l03', 'eylül'), dino0: Wd('l04', 'yirmi'), dino1: Wd('l04', 'otuz'), dec31: Wd('l05', 'otuz'),
    humans: Wd('l05', 'on'), pyr: Wd('l06', 'on'), you: L.l07.t0, hero: L.l08.t0 - 0.04, end: L.l08.end, loop0: tl.loop0,
  };
  T.zoom1 = T.dec31 + 0.9;
  return T;
}

export async function makeTakvimRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = takvimTimes(tl);

  // ——— yıl imleci (takvim günü, sürekli) ———
  const piece = (t, keys) => { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; if (t >= a) v = t < b ? lerp(va, vb, ease.state(seg(t, a, b - a))) : vb; } return v; };
  const cursorKeys = [[0, 0], [L.l02.t0 + 0.6, 0], [T.sun, EV.sun], [T.sun + 1.0, EV.sun], [T.dino0, EV.dino0], [T.dino0 + 0.6, EV.dino0], [T.dino1, EV.dino1], [T.dino1 + 1.0, EV.dino1], [T.dec31, 364.02]];
  // döngü: doruk sonrası imleç başa sarılır (takvim yeniden görününce 1 Ocak)
  const cursorAt = t => t >= T.loop0 ? lerp(364.02, 0, ease.state(seg(t, T.loop0 + 0.2, D - 0.15 - T.loop0 - 0.2))) : piece(t, cursorKeys);
  // ——— 31 Aralık'a dalış (Z: 0 takvim, 1 gün paneli) ———
  const Zat = t => t < T.loop0 ? ease.state(seg(t, T.dec31, T.zoom1 - T.dec31)) : 1 - ease.state(seg(t, T.loop0, 0.9));
  // ——— cetvel penceresi (gece yarısına sabit, saniye; log uzayında) ———
  const wKeys = [[T.zoom1, DAY], [T.humans + 1.4, 2400], [L.l06.t0, 1500], [T.pyr + 0.5, 40], [L.l07.t0 + 0.2, 24], [T.hero - 0.05, 1.0], [T.hero + 1.2, 0.96], [T.hero + 3.4, 0.8 * DAY], [T.loop0, DAY]];
  const Wat = t => { let v = Math.log(wKeys[0][1]); for (let i = 1; i < wKeys.length; i++) { const [a, va] = wKeys[i - 1], [b, vb] = wKeys[i]; if (t >= a) v = t < b ? lerp(Math.log(va), Math.log(vb), ease.state(seg(t, a, b - a))) : Math.log(vb); } return Math.exp(v); };
  const xOf = (sb, Wn) => RUL.x1 - (sb / Wn) * (RUL.x1 - RUL.x0);   // gece yarısına sb saniye kala

  // ——— takvim ———
  const cellRect = (m, d) => { const col = m % 4, row = Math.floor(m / 4), off = (3 + MSTART[m]) % 7, k = off + d; return [CAL.x0 + col * CAL.gx + 6 + (k % 7) * (CAL.cw + 1), CAL.y0 + row * CAL.gy + CAL.top + Math.floor(k / 7) * (CAL.ch + 1), CAL.cw, CAL.ch]; };
  const dayRect = day => { const di = Math.min(364, Math.floor(day)); let m = 0; while (m < 11 && di >= MSTART[m + 1]) m++; return cellRect(m, di - MSTART[m]); };
  const DEC31 = cellRect(11, 30), DEC31C = [DEC31[0] + DEC31[2] / 2, DEC31[1] + DEC31[3] / 2];
  const MARKS = [[0, 'bang'], [EV.sun, 'sun'], [EV.dino0, 'dino0'], [EV.dino1, 'dino1']];
  const markT = { bang: T.bang, sun: T.sun, dino0: T.dino0, dino1: T.dino1 };
  function calendar(t, Z) {
    ctx.save(); ctx.globalAlpha = 1 - clamp01((Z - 0.3) / 0.45);
    const cur = cursorAt(t), scanD = 365 * ease.state(seg(t, 0.15, L.l01.end - 0.15)), scanK = t < L.l02.t0 ? 1 : 1 - seg(t, L.l02.t0, 0.4);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // takvim boyunca yavaş yaklaşma (%6, 31 Aralık'a doğru) + dalış: 31 Aralık kutusu panelin merkezine taşınır
    const creep = t < T.loop0 ? 1 + 0.06 * seg(t, 0, T.dec31) : 1 + 0.06 * (1 - ease.state(seg(t, T.loop0, D - 0.1 - T.loop0)));
    const S = Math.exp(lerp(Math.log(creep), Math.log((PANEL.x1 - PANEL.x0) / DEC31[2]), Z));
    const pc = [(PANEL.x0 + PANEL.x1) / 2, (PANEL.y0 + PANEL.y1) / 2];
    const cx = lerp(DEC31C[0], pc[0], Z), cy = lerp(DEC31C[1], pc[1], Z);
    ctx.translate(Z > 0 ? cx : DEC31C[0], Z > 0 ? cy : DEC31C[1]); ctx.scale(S, S); ctx.translate(-DEC31C[0], -DEC31C[1]);
    const lw = 1 / S;
    for (let m = 0; m < 12; m++) {
      const col = m % 4, row = Math.floor(m / 4), x = CAL.x0 + col * CAL.gx, y = CAL.y0 + row * CAL.gy;
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(x, y, CAL.mw, CAL.mh); ctx.lineWidth = 2 * lw; ctx.strokeStyle = C.ink; ctx.strokeRect(x, y, CAL.mw, CAL.mh);
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(MONTHS[m], x + 8, y + 30);
      for (let d = 0; d < MDAYS[m]; d++) {
        const [rx, ry, rw, rh] = cellRect(m, d), di = MSTART[m] + d;
        ctx.lineWidth = 0.8 * lw; ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.strokeRect(rx, ry, rw, rh);
        // açılış taraması: soru sorulurken bir yıl baştan sona dolar (kare 0'da boş; Büyük Patlama'da söner)
        if (scanK > 0 && di < scanD) { ctx.fillStyle = 'rgba(139,133,119,' + (0.35 * scanK) + ')'; ctx.fillRect(rx + 2, ry + 2, rw - 4, rh - 4); }
        if (di + 1 <= cur) { ctx.fillStyle = 'rgba(28,27,24,0.22)'; ctx.fillRect(rx + 2, ry + 2, rw - 4, rh - 4); }
        else if (di <= cur) { ctx.fillStyle = 'rgba(28,27,24,0.22)'; ctx.fillRect(rx + 2, ry + 2, (rw - 4) * (cur - di), rh - 4); }
      }
    }
    // olay işaretleri: söylendiği kelimede halka ve dolgu
    for (const [day, key] of MARKS) {
      const u = ease.enter(seg(t, markT[key] - 0.05, 0.4)) * (1 - clamp01(Z * 5)); if (u <= 0 || t >= T.loop0) continue;
      const [rx, ry, rw, rh] = dayRect(day);
      ctx.fillStyle = C.ink; ctx.fillRect(rx + 1, ry + 1, rw - 2, rh - 2);
      ctx.beginPath(); ctx.arc(rx + rw / 2, ry + rh / 2, (18 + 10 * (1 - u)), 0, Math.PI * 2 * u); ctx.lineWidth = 2.5 * lw; ctx.strokeStyle = C.ink; ctx.stroke();
    }
    // imleç: o anki gün (mürekkep çerçeve), takvim gece yarısına vardıkça 31 Aralık'a yerleşir
    if (Z < 0.5) { const [rx, ry, rw, rh] = dayRect(cur); ctx.lineWidth = 3.5 * lw; ctx.strokeStyle = C.ink; ctx.strokeRect(rx - 2, ry - 2, rw + 4, rh + 4); }
    // kare 0 ve döngü: 31 Aralık'ta "sen" çizgisi (gerçekte hücrenin 1/470.000'i; görünsün diye 2,5 px)
    ctx.fillStyle = C.ink; ctx.fillRect(DEC31[0] + DEC31[2] - 3, DEC31[1] + 1, 2.5, DEC31[3] - 2);
    ctx.restore(); ctx.restore();
  }

  // ——— gün paneli ve cetvel ———
  const STEPS = [6 * 3600, 3600, 1800, 600, 300, 120, 60, 30, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05];
  const clock = sb => { const s = DAY - sb, hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return `${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')}` + (sb < 3600 ? '.' + (ss % 1 > 0.001 && sb < 5 ? nf1.format(ss).padStart(4, '0') : String(Math.floor(ss + 1e-6)).padStart(2, '0')) : ''); };
  const winLabel = Wn => Wn > 4000 ? 'SON ' + Math.round(Wn / 3600) + ' SAAT' : Wn > 90 ? 'SON ' + Math.round(Wn / 60) + ' DAKİKA' : Wn > 1.5 ? 'SON ' + Math.round(Wn) + ' SANİYE' : 'SON 1 SANİYE';
  function marker(sb, Wn, title, sub, k, above = true, color = C.ink, pin = '', pinRow = 0, labelOn = true) {
    if (k <= 0) return;
    const x = xOf(sb, Wn); ctx.save(); ctx.globalAlpha = k;
    setFont(ctx, F.mono(32));
    if (x >= RUL.x0 && !labelOn) { ctx.beginPath(); ctx.moveTo(x, RUL.y - 6); ctx.lineTo(x, RUL.y + RUL.h + 6); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); }
    else if (!labelOn) { /* doruk sonrası: pencere dışındaki işaretin yazısı yok */ }
    else if (x >= RUL.x0 && !above) {
      ctx.beginPath(); ctx.moveTo(x, RUL.y - 6); ctx.lineTo(x, RUL.y + RUL.h + 6); ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.stroke();
      const ly = RUL.y + RUL.h + 78, lb = title + ' · ' + sub, tw = ctx.measureText(lb).width, al = x > 640 ? 'right' : x < 320 ? 'left' : 'center', bx = al === 'right' ? x - tw : al === 'center' ? x - tw / 2 : x;
      ctx.beginPath(); ctx.moveTo(x, RUL.y + RUL.h + 8); ctx.lineTo(x, ly - 30); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
      ctx.fillStyle = C.paper; ctx.fillRect(bx - 8, ly - 30, tw + 16, 42); ctx.textAlign = al; ctx.fillStyle = color; ctx.fillText(lb, x, ly);
    } else if (x >= RUL.x0) {
      ctx.beginPath(); ctx.moveTo(x, RUL.y - 6); ctx.lineTo(x, RUL.y + RUL.h + 6); ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.stroke();
      const ly = RUL.y - 100, al = x > 640 ? 'right' : x < 320 ? 'left' : 'center';
      ctx.beginPath(); ctx.moveTo(x, RUL.y - 8); ctx.lineTo(x, ly + 16); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
      const tw = Math.max(ctx.measureText(title).width, ctx.measureText(sub).width), bx = al === 'right' ? x - tw : al === 'center' ? x - tw / 2 : x;
      ctx.fillStyle = C.paper; ctx.fillRect(bx - 8, ly - 32, tw + 16, 82);
      ctx.textAlign = al; ctx.fillStyle = color; ctx.fillText(title, x, ly); ctx.fillStyle = color === C.ink ? C.graphite : color; ctx.fillText(sub, x, ly + 40);
    } else {
      // pencerenin solunda kaldıysa: sol kenarda okla
      const lb = '← ' + title + ' ' + pin, yb = RUL.y - 18 - pinRow * 48; ctx.textAlign = 'left'; const tw = ctx.measureText(lb).width;
      ctx.fillStyle = C.paper; ctx.fillRect(RUL.x0 - 6, yb - 34, tw + 12, 44); ctx.fillStyle = C.graphite; ctx.fillText(lb, RUL.x0, yb);
    }
    ctx.restore();
  }
  function dayPanel(t, Z) {
    if (Z <= 0.02) return;
    // kutu: 31 Aralık hücresinden panele (takvimle aynı dönüşüm, uçlar panele oturur)
    const r = [lerp(DEC31[0], PANEL.x0, Z), lerp(DEC31[1], PANEL.y0, Z), lerp(DEC31[0] + DEC31[2], PANEL.x1, Z), lerp(DEC31[1] + DEC31[3], PANEL.y1, Z)];
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    { const zp = 1 + 0.1 * (t < T.loop0 ? seg(t, T.zoom1, T.loop0 - T.zoom1) : 1 - ease.state(seg(t, T.loop0, 0.9))), pc = [(PANEL.x0 + PANEL.x1) / 2, (PANEL.y0 + PANEL.y1) / 2]; ctx.translate(pc[0], pc[1]); ctx.scale(zp, zp); ctx.translate(-pc[0], -pc[1]); }
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(r[0], r[1], r[2] - r[0], r[3] - r[1]); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(r[0], r[1], r[2] - r[0], r[3] - r[1]);
    const k = clamp01((Z - 0.9) / 0.1); if (k <= 0) { ctx.restore(); return; }
    const Wn = Wat(t);
    RUL.h = t < T.loop0 ? lerp(50, 140, ease.state(seg(t, T.hero - 0.35, 0.45))) : lerp(140, 50, ease.state(seg(t, T.loop0, 0.5))); RUL.y = 1015 - RUL.h / 2;
    ctx.globalAlpha = k;
    // başlık şeridi: zoom zinciri ve pencere
    setFont(ctx, F.mono(32)); ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.fillText(winLabel(Wn), PANEL.x0 + 22, PANEL.y0 + 48);
    const chain = ['YIL', 'GÜN', 'SAAT', 'DAKİKA', 'SANİYE'], lev = Wn > 6 * 3600 ? 1 : Wn > 4000 ? 2 : Wn > 90 ? 3 : 4;
    setFont(ctx, F.mono(30)); let cx = PANEL.x0 + 22; const cy = PANEL.y0 + 94;
    chain.forEach((s, i) => { ctx.fillStyle = i === lev ? C.ink : C.graphite; ctx.fillText(s, cx, cy); cx += ctx.measureText(s).width + 12; if (i < 4) { ctx.fillStyle = C.graphite; ctx.fillText('›', cx, cy); cx += ctx.measureText('›').width + 12; } });
    // cetvel: kâğıt şerit, gece yarısı sağda
    ctx.fillStyle = C.paper; ctx.fillRect(RUL.x0, RUL.y, RUL.x1 - RUL.x0, RUL.h); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(RUL.x0, RUL.y, RUL.x1 - RUL.x0, RUL.h);
    // çentikler: etiketli adım ≥ 190 px, ara çentik ≥ 14 px
    const px = (RUL.x1 - RUL.x0) / Wn;
    const major = STEPS.find(s => s * px >= 190 && s * px < 600) || STEPS.find(s => s * px >= 190) || STEPS[0];
    const minor = [...STEPS].reverse().find(s => s * px >= 14 && major / s >= 2 && Math.abs(major / s - Math.round(major / s)) < 1e-6) || major;
    ctx.strokeStyle = C.ink;
    for (let n = 0; n * minor <= Wn + 1e-9; n++) { const sb = n * minor, x = xOf(sb, Wn); if (x < RUL.x0 - 0.5) break; const isMaj = Math.abs(sb / major - Math.round(sb / major)) < 1e-6; ctx.beginPath(); ctx.moveTo(x, RUL.y + RUL.h); ctx.lineTo(x, RUL.y + RUL.h - (isMaj ? 26 : 12)); ctx.lineWidth = isMaj ? 2.5 : 1.2; ctx.stroke(); if (isMaj && x > RUL.x0 + 60) { setFont(ctx, F.mono(30)); const lbl = clock(sb), lw2 = ctx.measureText(lbl).width / 2; if (x + lw2 < RUL.x1 - 6 && !(t >= T.pyr && t < T.hero && Math.abs(x - xOf(EV.pyr, Wn)) < lw2 + 14)) { ctx.textAlign = 'center'; ctx.fillStyle = C.graphite; ctx.fillText(lbl, x, RUL.y + RUL.h + 40); } } }
    setFont(ctx, F.mono(30)); ctx.textAlign = 'right'; ctx.fillStyle = C.ink; ctx.fillText('GECE YARISI ↓', RUL.x1, RUL.y - 14);
    // olaylar: insan türü, piramitler, sen (dorukta kırmızı)
    marker(EV.humans, Wn, 'İNSAN TÜRÜ', '23.48.34', ease.enter(seg(t, T.humans - 0.05, 0.4)) * (t < T.loop0 ? 1 : 0), true, C.ink, '11 dk', 1, t < T.hero);
    marker(EV.pyr, Wn, 'PİRAMİTLER', '23.59.49,5', ease.enter(seg(t, T.pyr - 0.05, 0.4)) * (t < T.loop0 ? 1 : 0), false, C.ink, '10,5 sn', 0, t < T.hero);
    if (t >= T.hero - 0.02 && t < T.loop0 + 0.4) {
      const red = t < T.loop0, pop = spring(t - T.hero, 120, 24), x0 = xOf(EV.life, Wn);
      ctx.fillStyle = red ? C.red : C.ink; const hh = RUL.h * (0.7 + 0.3 * Math.min(1, pop)), sw = Math.max(2.5, RUL.x1 - x0); ctx.fillRect(RUL.x1 - sw, RUL.y + (RUL.h - hh) / 2, sw, hh);
      setFont(ctx, F.head(40)); ctx.textAlign = 'right'; const lb = 'SEN · 0,18 sn', tw = ctx.measureText(lb).width;
      ctx.fillStyle = C.paper; ctx.fillRect(RUL.x1 - tw - 10, RUL.y - 92, tw + 20, 54); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(lb, RUL.x1, RUL.y - 50);
    }
    // ölçek notu: bir takvim günü, bir takvim saniyesi
    setFont(ctx, F.mono(30)); ctx.textAlign = 'left'; ctx.fillStyle = C.graphite;
    ctx.textAlign = 'right'; ctx.fillText(Wn > 6 * 3600 ? '1 GÜN ≈ 37,8 MİLYON YIL' : '1 SN ≈ 438 YIL', PANEL.x1 - 22, PANEL.y0 + 48);
    ctx.restore();
  }

  // ——— büyüteç ———
  function roundel(t, kind, k = 1, at = null) {
    if (k <= 0) return;
    const R = ROUND, r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 10, at[1] - Math.sin(ang) * 10); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    const ground = () => { ctx.beginPath(); ctx.moveTo(-120, 62); ctx.lineTo(120, 62); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.save(); ctx.beginPath(); ctx.rect(-120, 62, 240, 60); ctx.clip(); ctx.lineWidth = 1; ctx.strokeStyle = C.graphite; for (let d = -200; d < 200; d += 8) { ctx.beginPath(); ctx.moveTo(d, 62); ctx.lineTo(d + 40, 122); ctx.stroke(); } ctx.restore(); };
    if (kind === 'dec31') {
      // 31 Aralık kutusu yakın plan: hücrenin sağ kenarında saç teli inceliğinde çizgi
      ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-100, -66, 170, 132); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(-100, -66, 170, 132);
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('31 ARA', -88, -30);
      ctx.fillStyle = C.ink; ctx.fillRect(64, -62, 3.5, 124);
      const ax = 44 + 6 * Math.sin(t * 4); ctx.beginPath(); ctx.moveTo(-40, 30); ctx.lineTo(ax, 30); ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax + 14, 30); ctx.lineTo(ax - 2, 20); ctx.lineTo(ax - 2, 40); ctx.closePath(); ctx.fill();
      setFont(ctx, F.head(34)); ctx.textAlign = 'left'; ctx.fillText('SEN', -88, 42);
    } else if (kind === 'bang') drawBang(ctx, ease.enter(seg(t, T.bang, 1.2)), t, 230);
    else if (kind === 'sun') drawSunEarth(ctx, t, 230);
    else if (kind === 'dino') {
      ground(); const f = ease.state(seg(t, T.dino1 + 0.3, 1.2));
      if (t >= T.dino1 - 0.8) { ctx.save(); ctx.translate(30, 30); drawAsteroid(ctx, clamp01(seg(t, T.dino1 - 0.8, 1.1)), 160); ctx.restore(); }
      ctx.save(); ctx.translate(-18 + 10 * Math.sin(t * 0.6), 62); drawDino(ctx, { walk: t, fall: f }, 190); ctx.restore();
    } else if (kind === 'human') { ground(); ctx.save(); ctx.translate(-50 + ((t * 18) % 100), 62); drawHuman(ctx, { walk: t }, 150); ctx.restore(); }
    else if (kind === 'pyramid') { ground(); ctx.save(); ctx.translate(0, 62); drawPyramid(ctx, 110 + 4 * Math.sin(t)); ctx.restore(); ctx.beginPath(); ctx.arc(70, -66, 14, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.stroke(); }
    else if (kind === 'you') { ground(); ctx.save(); ctx.translate(0, 62); drawYou(ctx, { wave: t >= T.hero, phase: t }, 150); ctx.restore(); }
    ctx.restore();
    const red = kind === 'you' && t >= T.hero - 0.02 && t < T.loop0;
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke();
  }
  const S1 = [[0, 'dec31'], [T.bang, 'bang'], [T.sun - 0.2, 'sun'], [T.dino0 - 0.2, 'dino'], [L.l05.t0, 'human'], [T.pyr - 0.2, 'pyramid'], [T.you, 'you'], [T.loop0 + 0.3, 'dec31']];
  function sched(t, S) {
    let i = -1; for (let k = 0; k < S.length; k++) if (t >= S[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S[i], prev = i > 0 ? S[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) { const u = seg(t, a, 0.3); return u < 0.5 ? { kind: prev, k: 1 - ease.exit(u * 2) } : { kind, k: ease.enter((u - 0.5) * 2) }; }
    return { kind, k: 1 };
  }

  // ——— olay listesi (takvim evresi) ———
  const LIST = [['1 OCA', 'BÜYÜK PATLAMA', 'bang'], ['1 EYL', 'GÜNEŞ VE DÜNYA', 'sun'], ['25 ARA', 'İLK DİNOZORLAR', 'dino0'], ['30 ARA', 'SON DİNOZORLAR', 'dino1']];
  function eventList(t, Z) {
    const kz = 1 - clamp01(Z * 3); if (kz <= 0 || t >= T.loop0) return;
    LIST.forEach(([d, ev, key], i) => {
      const u = ease.enter(seg(t, markT[key] - 0.05, 0.35)) * kz; if (u <= 0) return;
      const y = 1222 + i * 44;
      ctx.save(); ctx.globalAlpha = u; ctx.fillStyle = C.ink; ctx.fillRect(352, y - 22, 16, 16);
      setFont(ctx, F.mono(32)); ctx.textAlign = 'left'; ctx.fillStyle = C.graphite; ctx.fillText(d, 380, y);
      const dx = 380 + ctx.measureText('30 ARA').width + 24; ctx.fillStyle = C.ink; ctx.fillText(ev, dx, y); ctx.restore();
    });
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.bang + 0.3, 'sasirma', 'saskin'], [T.bang + 1.8, 'ayakta', 'notr'], [T.sun, 'ayakta', 'dusunceli'], [T.dino1, 'sasirma', 'saskin'], [T.dino1 + 1.5, 'ayakta', 'dusunceli'],
    [T.humans, 'sasirma', 'saskin'], [T.humans + 1.6, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.end + 0.6, 'isaret', 'dusunceli'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.hero + 0.15, T.hero + 1.9, 'Bu kadar mı?!', 150]];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text, dy] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - dy;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    // bölünmüş cümle (l07 + l08): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l08' ? L.l07.text + ' ' + ln.text : ln.id === 'l07' ? 'Peki senin bütün hayatın?' : ln.text;
    const p = ln.id === 'l08' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  const TITLE = ep.voice.lines[0].text;
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    let fs = 84; setFont(ctx, F.head(fs)); let ls = wrap(ctx, TITLE, SAFE.x1 - SAFE.x0); while (ls.length > 3 && fs > 64) { fs -= 4; setFont(ctx, F.head(fs)); ls = wrap(ctx, TITLE, SAFE.x1 - SAFE.x0); }
    const lh = fs * 1.08, y0 = 690 - 34 - (ls.length - 1) * lh - 18;
    ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs, k, C.ink));
    setFont(ctx, F.mono(30)); revealText(ctx, '13,8 MİLYAR YIL = 1 TAKVİM YILI', SAFE.x0, 690, 30, k, C.graphite);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1, ns = 88 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(ns)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, ns, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, red ? C.red : C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  const agoLabel = ya => ya >= 1e9 ? nf1.format(ya / 1e9) + ' MİLYAR YIL ÖNCE' : ya >= 1e6 ? nf0.format(ya / 1e6) + ' MİLYON YIL ÖNCE' : nf0.format(ya) + ' YIL ÖNCE';
  function dateLabel(day) { const di = Math.min(364, Math.floor(day)); let m = 0; while (m < 11 && di >= MSTART[m + 1]) m++; return (di - MSTART[m] + 1) + ' ' + MONTHS[m][0] + MONTHS[m].slice(1).toLocaleLowerCase('tr'); }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pA = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < T.dec31) {
      const cur = cursorAt(t), at = [[T.dino1, EV.dino1, 'SON DİNOZORLAR', '66 MİLYON YIL ÖNCE'], [T.dino0, EV.dino0, 'İLK DİNOZORLAR', '230 MİLYON YIL ÖNCE'], [T.sun, EV.sun, 'GÜNEŞ VE DÜNYA', '4,6 MİLYAR YIL ÖNCE'], [T.bang, 0, 'BÜYÜK PATLAMA', '13,8 MİLYAR YIL ÖNCE']].find(([a, d]) => t >= a - 0.05 && Math.abs(cur - d) < 0.03);
      row({ label: 'EVRENİN TAKVİMİ · 1 GÜN ≈ 37,8 MİLYON YIL', num: dateLabel(at ? at[1] : cur), unit: '', right1: at ? at[2] : '', right2: at ? at[3] : agoLabel(AGE * (1 - cur / 365)), p: pA, ns: 68 });
      return;
    }
    if (t < T.hero) {
      const ev = t >= T.pyr ? ['23.59.49', 'PİRAMİTLER', '4.600 YIL ÖNCE'] : t >= T.humans ? ['23.48.34', 'İNSAN TÜRÜ', '300.000 YIL ÖNCE'] : ['31 Aralık', 'SON GÜN', '37,8 MİLYON YIL'];
      row({ label: '31 ARALIK · 1 SANİYE ≈ 438 YIL', num: ev[0], unit: '', right1: ev[1], right2: ev[2] });
      return;
    }
    row({ label: 'SENİN HAYATIN · 80 YIL', num: '0,18', unit: 'saniye', red: t < T.loop0, right1: 'BEŞTE BİRİNDEN AZ', right2: 'GECE YARISINDAN ÖNCE' });
  }
  // takip çağrısı: son satırdan sonra, döngüden önce söner
  function follow(t) {
    const k = ease.enter(seg(t, T.end + 0.5, 0.4)) * (1 - ease.exit(seg(t, T.loop0 - 0.05, 0.25))); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; setFont(ctx, F.head(40)); ctx.textAlign = 'left';
    const a = 'TAKİP ET', b = 'HER GÜN YENİ BİR SAYI', w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
    ctx.fillStyle = C.paper; ctx.fillRect(338, 1210, w + 28, 108);
    ctx.fillStyle = C.ink; ctx.fillText(a, 352, 1254); ctx.fillText(b, 352, 1302); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const Z = Zat(t);
    if (Z < 0.999) calendar(t, Z);
    dayPanel(t, Z);
    eventList(t, Z);
    // büyüteç: takvim evresinde imlecin olduğu güne, cetvel evresinde olayın çizgisine bağ
    const r1 = sched(t, S1);
    let at = null;
    // bağ çizgisi yalnız kare 0 / döngüdeki 31 Aralık balonunda (yıl evresinde olay listesinin üstünden geçerdi)
    if (r1.kind === 'dec31') at = [DEC31C[0], DEC31C[1] + 10];
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, r1.k, Z > 0.6 ? null : at);
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    follow(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

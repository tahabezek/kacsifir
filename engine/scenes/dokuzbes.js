// "Dokuz beş" şablonu: 10 Kasım anma filmi (051). Ton ağır ve sade: maskot yok, takip çağrısı yok, kırmızı yalnız
// bayrakta. Anlatım saattir; her kare t'nin saf fonksiyonu.
// Kare 0: l01 cümlesi başlık; Üsküdar kıyısından Boğaz ve karşıda Dolmabahçe Sarayı, köşede saat 09.04:5x.
// l01 "beş"te saat 09.05:00, siren yavaşça yükselir; "durur"dan itibaren arabalar, l02'de vapurlar ve insanlar durur
// (insanlar başını hafifçe eğer). l02 sonrası 2,6 sn saygı duruşu: yalnız martı, dalga ve yarıya inmiş bayrak hareketli.
// l03: kamera log uzayında saraya yaklaşır, "DOLMABAHÇE SARAYI" etiketi. l04: "57". l05: köşe saati merkeze taşınır ve
// bir masa saatine ("o dakika" simgesi) dönüşür; saniye ibresi kaybolur, ibreler 09.05'te. l06: geri çekilme, hayat yeniden akar,
// yıl sayacı 1938 → 2026, "88 yıl". l07: 88 çizgi (her biri bir 10 Kasım). Sonra imza (Commons SVG'si) gerçek
// çizgisini izleyerek yazılır, "SAYGI VE ÖZLEMLE". Döngü: imza ve yazı çıkış eğrisiyle kapanır, saat 09.04:5x'e geri
// döner, başlık geri gelir. Kapanışta (l06'dan) üstte 1923 kalpaklı portre, değiştirilmeden (yalnız kırpma ve ölçek),
// ince kâğıt kenarlı bir baskı olarak durur; altında anlatım, imza ve "SAYGI VE ÖZLEMLE", sağında 88 yıl sütunu.
// Kapanışta kamera yukarı eğilir (Boğaz 2,2 sn'de aşağı iner, uzak rıhtım y≈1340): üst bölge temiz kâğıt kalır;
// döngüde aynı eksende ters yönde kare 0 çerçevesine döner.
// Fotoğraf hareketsizdir: tek sakin giriş (0,9 sn, opaklık + 12 px) ve döngüden önce imzayla birlikte çıkış.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawHills, drawPalace, drawClockTower, drawFerry, drawSmoke, drawCar, drawWalker, drawGull, drawWavingFlag, drawPole, drawClockFace, drawMantelCase, drawRoom } from '../dokuzbes_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
// dünya (kare 0 ekranı = dünya koordinatı)
const HZ = 948, PALACE = { x: 520, w: 520 }, TOWER = { x: 214, s: 112 };
const QUAY = 1100, PROM = 1116, ROAD = 1205, ROADB = 1300;
const FERRY_FAR = { y: 984, size: 110 }, FERRY_NEAR = { y: 1060, size: 200 };
// gönder sağ önde: yaklaşmada bayrak kadrajda bütün kalır, kapanışta fotoğraf ve panelin sağında görünür
const POLE = { x: 680, base: 1150, h: 380, G: 46 };   // uzun gönder: eğilmede yarıya inmiş bayrak y ≤ 1420'de bütün
const CLOCK = { x: 840, y: 790, r: 78 }, ROOMCLOCK = { x: 540, y: 1010, r: 150 };
// kamera: dünya noktası f ekranda A'ya oturur; temel ölçek Z0 (kare 0), sarayda Z0 × 2,3
const A = { x: 540, y: 990 }, F0 = { x: 540, y: 948 }, PF = { x: 600, y: 860 }, Z0 = 1.4;
const BASE_SEC = 9 * 3600 + 5 * 60;
// kapanış yerleşimi: baskı (dış kenar 548 px, kâğıt kenar 14 px), altında panel, sağında sütun
const CARD = { x: 90, y: 360, w: 508, b: 14 }, COL = { x: 628 }, TILT = 350;   // eğilme: uzak rıhtım 990 → 1340

export function dokuzbesTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    bes: Wd('l01', 'beş'), durur: Wd('l01', 'durur'), arabalar: Wd('l02', 'arabalar'), vapurlar: Wd('l02', 'vapurlar'),
    insanlar: Wd('l02', 'insanlar'), susar: Wd('l02', 'susar'), dolma: Wd('l03', 'dolmabahçe'), elli: Wd('l04', 'elli'),
    dakika: Wd('l05', 'dakika'), seksen: Wd('l06', 'seksen'), her: Wd('l07', 'her'), end: L.l07.end,
  };
  T.carStop = T.arabalar + 0.5; T.ferryStop = T.vapurlar + 1.7; T.peopleStop = T.insanlar + 0.45;
  T.sirenOff = L.l03.t0 + 0.3;
  T.push0 = L.l03.t0 + 0.2; T.push1 = L.l04.end + 0.4;
  T.carry0 = L.l05.t0 - 0.55; T.back0 = L.l05.end + 0.15; T.resume = T.back0 + 0.9;
  // eğilme geri çekilmeyle başlar (l05 sonrası); fotoğraf, eğilme oturduktan, oda irisi, sahne çizgisi ve saat çipi
  // kalktıktan sonra girer: kartın arkasında yalnız düz kâğıt kalır
  T.tilt0 = T.back0; T.ph0 = T.tilt0 + 1.3;
  T.sign0 = T.end + 0.45; T.sign1 = T.sign0 + 2.0; T.saygi = T.sign1 + 0.25;
  T.loop0 = T.saygi + 2.2; T.D = T.loop0 + 2.3;
  return T;
}

// hız çarpanı s(t) ve yol τ(t) = ∫s: tablo bir kez hesaplanır (kareler arası durum değil, t'nin fonksiyonu)
function makeTravel(D, stopA, stopB, goA, goB) {
  const dt = 1 / 600, n = Math.ceil(D / dt) + 2, tau = new Float64Array(n);
  const s = t => (t < stopA ? 1 : t < stopB ? 1 - ease.state(seg(t, stopA, stopB - stopA)) : t < goA ? 0 : t < goB ? ease.state(seg(t, goA, goB - goA)) : 1);
  for (let i = 1; i < n; i++) tau[i] = tau[i - 1] + s((i - 0.5) * dt) * dt;
  const at = t => { const x = clamp01(t / (n * dt)) * (n - 1), i = Math.floor(x), f = x - i; return i >= n - 1 ? tau[n - 1] : tau[i] * (1 - f) + tau[i + 1] * f; };
  return { at, total: at(D), s };
}

// imza: dolu konturdan iskelet (Zhang–Suen inceltme) → yazım sırası (soldan sağa bileşenler, DFS) → her nokta için kalınlık
function signaturePath(d, w, h, k) {
  const c = document.createElement('canvas'); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
  const g = c.getContext('2d'); g.scale(k, k); g.fillStyle = '#000'; g.fill(new Path2D(d));
  const { width: Wc, height: Hc } = c, px = g.getImageData(0, 0, Wc, Hc).data;
  const B = new Uint8Array(Wc * Hc); for (let i = 0; i < B.length; i++) B[i] = px[i * 4 + 3] > 110 ? 1 : 0;
  // uzaklık dönüşümü (3-4 chamfer) → yerel yarı kalınlık
  const Dt = new Float32Array(Wc * Hc); for (let i = 0; i < B.length; i++) Dt[i] = B[i] ? 1e9 : 0;
  for (let y = 0; y < Hc; y++) for (let x = 0; x < Wc; x++) { const i = y * Wc + x; if (!Dt[i]) continue; let v = Dt[i]; if (x > 0) v = Math.min(v, Dt[i - 1] + 3); if (y > 0) { v = Math.min(v, Dt[i - Wc] + 3); if (x > 0) v = Math.min(v, Dt[i - Wc - 1] + 4); if (x < Wc - 1) v = Math.min(v, Dt[i - Wc + 1] + 4); } Dt[i] = v; }
  for (let y = Hc - 1; y >= 0; y--) for (let x = Wc - 1; x >= 0; x--) { const i = y * Wc + x; if (!Dt[i]) continue; let v = Dt[i]; if (x < Wc - 1) v = Math.min(v, Dt[i + 1] + 3); if (y < Hc - 1) { v = Math.min(v, Dt[i + Wc] + 3); if (x < Wc - 1) v = Math.min(v, Dt[i + Wc + 1] + 4); if (x > 0) v = Math.min(v, Dt[i + Wc - 1] + 4); } Dt[i] = v; }
  // Zhang–Suen
  const S = B.slice(); const nb = (i) => [S[i - Wc], S[i - Wc + 1], S[i + 1], S[i + Wc + 1], S[i + Wc], S[i + Wc - 1], S[i - 1], S[i - Wc - 1]];
  for (let changed = true; changed;) {
    changed = false;
    for (const step of [0, 1]) {
      const del = [];
      for (let y = 1; y < Hc - 1; y++) for (let x = 1; x < Wc - 1; x++) {
        const i = y * Wc + x; if (!S[i]) continue;
        const p = nb(i), b = p.reduce((a, v) => a + v, 0); if (b < 2 || b > 6) continue;
        let a = 0; for (let j = 0; j < 8; j++) if (!p[j] && p[(j + 1) % 8]) a++; if (a !== 1) continue;
        if (step === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
        del.push(i);
      }
      if (del.length) { changed = true; for (const i of del) S[i] = 0; }
    }
  }
  // yazım sırası elle sabit (Commons SVG'si tek dolu yol, 12 alt yol: 0 = K, 1–2 K'nin boşlukları, 11 = nokta,
  // 3 = "A" ilmeği + "tatürk" + alt kuyruk tek kontur, 4–7 ve 10 onun boşlukları, 8–9 ü noktaları). 3 numaralı kontur tek
  // iskelet bileşeni olduğundan sıra piksel düzeyinde verilir (SVG birimi, 572 × 205):
  //   K (x < 175, eğik süpürme) → nokta (x 158–170, y 140–155) → kelime: A ilmeği (x 181–275) ve "tatürk", eğimi hesaba
  //   katan soldan sağa süpürme → alt kuyruk: önce k'nin sağındaki kavis yukarıdan aşağı (x > 505), sonra alttaki çizgi
  //   sağdan sola (x > 285, y > 128).
  const keyOf = (x, y) => {
    if (x >= 158 && x <= 170 && y >= 140 && y <= 155) return 1000;
    const slant = x - (y - 100) * 0.35;
    if (x < 175) return slant;
    if (x > 505) return 4000 + y;
    if (x > 285 && y > 128) return 4200 + (505 - x);
    return 2000 + slant;
  };
  const out = [];
  for (let i = 0; i < S.length; i++) if (S[i]) { const x = (i % Wc) / k, y = Math.floor(i / Wc) / k; out.push([x, y, Math.max(1, Dt[i] / 3) / k, keyOf(x, y)]); }
  out.sort((p, q) => p[3] - q[3] || p[1] - q[1]);
  return out;
}

export async function makeDokuzbesRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, T = dokuzbesTimes(tl), D = T.D;
  const cyc = (t, per) => { const n = Math.max(1, Math.round(D / per)); return ((t / D) * n) % 1; };
  // portre ve imza (kaynaklar assets/051/SOURCE.md)
  const photo = new Image(); photo.src = `../assets/${ep.id}/ataturk_1923.png`; await photo.decode();
  const svg = await (await fetch(`../assets/${ep.id}/imza.svg`)).text();
  const sigD = svg.match(/\sd="([^"]+)"/)[1], SIG = { w: 572, h: 205, x: 96, y: 896, k: 0.84 };
  const sigPts = signaturePath(sigD, SIG.w, SIG.h, 2), sigPath = new Path2D(sigD);
  const sigMask = document.createElement('canvas'); sigMask.width = Math.ceil(SIG.w * SIG.k) + 8; sigMask.height = Math.ceil(SIG.h * SIG.k) + 8;

  // yol: arabalar "durur"dan itibaren yavaşlar; vapurlar süzülerek durur; insanlar "insanlar"da durur. Hepsi geri çekilmede yeniden akar.
  const carT = makeTravel(D, T.durur - 0.15, T.carStop, T.resume, T.resume + 1.8);
  const ferryT = makeTravel(D, T.vapurlar - 0.1, T.ferryStop, T.resume + 0.2, T.resume + 2.6);
  const pepT = makeTravel(D, T.insanlar - 0.05, T.peopleStop, T.resume, T.resume + 1.2);
  const rnd = mulberry32(1938);
  const WRAP = 1500;
  const loopV = (tr, vTarget) => Math.max(1, Math.round((vTarget * tr.total) / WRAP)) * WRAP / tr.total;
  const CARS = [];
  for (let lane = 0; lane < 2; lane++) for (let i = 0; i < 5; i++) CARS.push({ lane, off: (i / 5) * WRAP + rnd() * 90, kind: Math.floor(rnd() * 3), v: loopV(carT, lane ? 112 : 98) });
  // tekerlek: döngüde tam sayıda üçte bir tur (üç kollu jant)
  for (const c of CARS) { const size = c.lane ? 92 : 86; c.wturn = Math.max(1, Math.round((c.v * carT.total) / (size * 0.1) / (2 * Math.PI / 3))) * (2 * Math.PI / 3); }
  const PEOPLE = [];
  for (let i = 0; i < 11; i++) { const far = i % 3 === 0; PEOPLE.push({ far, off: rnd() * WRAP, dir: rnd() < 0.5 ? 1 : -1, v: loopV(pepT, far ? 22 : 28), size: far ? 40 : 50, coat: rnd(), step: 0 }); }
  for (const p of PEOPLE) { const turns = Math.max(1, Math.round((p.v * pepT.total) / (p.size * 0.62 * 2 * Math.PI))); p.step = (turns * 2 * Math.PI) / pepT.total; }
  const ferryV = [loopV(ferryT, 34), loopV(ferryT, 22)];
  const GULLS = Array.from({ length: 4 }, (_, i) => ({ cx: 180 + i * 220, cy: 760 + (i % 2) * 70, rx: 120 + 40 * i, ry: 26 + 8 * (i % 3), per: [7.5, 9.5, 6.5, 11][i], ph: rnd(), fl: [0.42, 0.36, 0.48, 0.4][i], size: [46, 38, 54, 34][i] }));

  // ——— saat ———
  // kuvars tıkı: ibre her tam saniyede (ses tıkı T.bes + k) yerine oturur; 0,14 sn önce kalkar
  const tickSec = t => { const q = BASE_SEC + (t - T.bes) + 0.14, fl = Math.floor(q); return fl - 1 + ease.enter(clamp01((q - fl) / 0.14)); };
  function clockSec(t) {
    // döngü: saat kare 0'daki okumaya geri sarılır
    if (t >= T.loop0) { const u = ease.state(seg(t, T.loop0 + 0.1, D - T.loop0 - 0.3)); return lerp(tickSec(T.loop0), tickSec(0), u); }
    return tickSec(t);
  }
  const roomK = t => ease.state(seg(t, T.carry0 + 0.35, 0.6)) * (1 - ease.state(seg(t, T.back0, 1.1)));
  // kamera eğilmesi: yay 170/26, 2,2 sn'ye yayılmış; döngüde ters yönde (aynı eksen) kare 0'a döner
  const tiltU = t => (t < T.tilt0 ? 0 : clamp01(spring((t - T.tilt0) * 0.232, 170, 26)) * (1 - ease.state(seg(t, T.loop0 + 0.05, 1.5))));
  // sahne çizgisi ve saat çipi: eğilme başında 0,5 sn'de kalkar, döngüde kart çıktıktan sonra geri gelir
  const chromeK = t => (1 - ease.state(seg(t, T.tilt0, 0.5))) + ease.state(seg(t, T.loop0 + 0.4, 0.5));
  const carryU = t => ease.state(seg(t, T.carry0, 1.0)) * (1 - ease.state(seg(t, T.back0 + 0.15, 1.6)));

  // ——— kamera ———
  function cam(t) {
    const creepEnd = 1.03;
    if (t < T.push0) return { z: Z0 * (1 + 0.03 * ease.state(seg(t, 0, T.push0))), f: F0 };
    if (t < T.back0) {
      const u = ease.state(seg(t, T.push0, T.push1 - T.push0)), z = Math.exp(lerp(Math.log(creepEnd), Math.log(1.8), u)) * (1 + 0.05 * seg(t, T.push1, T.back0 - T.push1));
      return { z: z * Z0, f: { x: lerp(F0.x, PF.x, u), y: lerp(F0.y, PF.y, u) } };
    }
    const zb = 1.8 * (1 + 0.05 * seg(T.back0, T.push1, T.back0 - T.push1));
    // kamera yayı 170/26 (kritik sönümlü), 2,0 sn'ye yayılmış zamanla; kesme yok (kapalı formülün kendi değeri)
    const u = clamp01(spring((t - T.back0) * 0.255, 170, 26));
    const creep = 1 + 0.025 * ease.state(seg(t, T.back0 + 2.0, T.loop0 - T.back0 - 2.0)) * (1 - ease.state(seg(t, T.loop0, D - T.loop0 - 0.1)));
    let z = Math.exp(lerp(Math.log(zb), 0, u)) * creep, f = { x: lerp(PF.x, F0.x, u), y: lerp(PF.y, F0.y, u) };
    return { z: z * Z0, f };
  }

  // ——— dünya katmanları ———
  function sky(t) {
    // yatay ince bulut taramaları (çok yavaş kayar)
    ctx.save(); ctx.strokeStyle = 'rgba(28,27,24,0.10)'; ctx.lineWidth = 1.2;
    const r = mulberry32(7);
    for (let i = 0; i < 14; i++) { const y = 730 + r() * 120, x = r() * 1400 - 200, w = 80 + r() * 160; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); }
    ctx.restore();
  }
  function water(t) {
    ctx.fillStyle = '#E7DFCD'; ctx.fillRect(-1200, HZ, 3500, QUAY - HZ);
    ctx.save(); ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 1.3;
    const r = mulberry32(11);
    for (let row = 0; row < 26; row++) {
      const f = row / 25, y = HZ + 6 + Math.pow(f, 1.4) * (QUAY - HZ - 12), len = lerp(10, 46, f), gap = lerp(26, 90, f), sh = (cyc(t, row % 2 ? 9 : 12) * gap * (row % 2 ? 1 : -1));
      for (let x = -400 + (r() * gap) + sh; x < 1500; x += gap) { const yy = y + Math.sin(x * 0.03 + cyc(t, 3.4) * 2 * Math.PI + row) * 1.6; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + len, yy); ctx.stroke(); }
    }
    ctx.restore();
  }
  function ferries(t) {
    const tau = ferryT.at(t), mv = ferryT.s(t);
    // uzak vapur sola, yakın vapur sağa
    const xf = 1250 - ((ferryV[1] * tau + 300) % WRAP), xn = -250 + ((ferryV[0] * tau + 520) % WRAP);
    for (const [x, P, dir] of [[xf, FERRY_FAR, -1], [xn, FERRY_NEAR, 1]]) {
      const bob = Math.sin(cyc(t, 4.2) * 2 * Math.PI + P.y) * 1.5;
      ctx.save(); ctx.translate(x, P.y + bob);
      // pruva dalgası yalnız hareket ederken
      if (mv > 0.05) { ctx.beginPath(); ctx.moveTo(dir * P.size * 0.5, 0); ctx.lineTo(dir * P.size * 0.5 + dir * 20 * mv, 3); ctx.moveTo(-dir * P.size * 0.45, 1); ctx.lineTo(-dir * P.size * 0.45 - dir * 40 * mv, 2); ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
      drawFerry(ctx, P.size, dir);
      ctx.save(); ctx.translate(dir * -0.2 * P.size * 0.01 * 100 * 0, -P.size * 0.4); ctx.scale(dir, 1); drawSmoke(ctx, P.size, cyc(t, 3) * 3, 0.5 + 0.5 * mv); ctx.restore();
      ctx.restore();
    }
  }
  function quayAndPromenade() {
    ctx.fillStyle = '#E2D9C4'; ctx.fillRect(-1200, QUAY, 3500, PROM - QUAY);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1200, QUAY); ctx.lineTo(2300, QUAY); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(28,27,24,0.5)'; ctx.beginPath(); for (let x = -1200; x < 2300; x += 46) { ctx.moveTo(x, QUAY); ctx.lineTo(x, PROM); } ctx.stroke();
    ctx.fillStyle = C.paper; ctx.fillRect(-1200, PROM, 3500, ROAD - PROM);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1200, PROM); ctx.lineTo(2300, PROM); ctx.stroke();
    // yol
    ctx.fillStyle = '#DCD3BF'; ctx.fillRect(-1200, ROAD, 3500, ROADB - ROAD);
    ctx.save(); ctx.beginPath(); ctx.rect(-1200, ROAD, 3500, ROADB - ROAD); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.13)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = -1400; x < 2300; x += 8) { ctx.moveTo(x, ROADB); ctx.lineTo(x + 95, ROAD); } ctx.stroke(); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1200, ROAD); ctx.lineTo(2300, ROAD); ctx.moveTo(-1200, ROADB); ctx.lineTo(2300, ROADB); ctx.stroke();
    ctx.setLineDash([26, 22]); ctx.lineWidth = 2.5; ctx.strokeStyle = C.paper; ctx.beginPath(); ctx.moveTo(-1200, 1258); ctx.lineTo(2300, 1258); ctx.stroke(); ctx.setLineDash([]);
    // kaldırım ve alt zemin
    ctx.fillStyle = '#E4DCC9'; ctx.fillRect(-1200, ROADB, 3500, 900);
    ctx.save(); ctx.beginPath(); ctx.rect(-1200, ROADB, 3500, 900); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.16)'; ctx.lineWidth = 1; ctx.beginPath(); for (let y = ROADB + 30; y < 2200; y += 34) { ctx.moveTo(-1200, y); ctx.lineTo(2300, y); } for (let y = ROADB, k = 0; y < 2200; y += 34, k++) for (let x = -1200 + (k % 2) * 40; x < 2300; x += 80) { ctx.moveTo(x, y); ctx.lineTo(x, y + 34); } ctx.stroke(); ctx.restore();
  }
  function people(t, front) {
    const tau = pepT.at(t), bow = ease.state(seg(t, T.peopleStop - 0.1, 0.8)) * (1 - ease.state(seg(t, T.resume - 0.3, 0.6)));
    const walk = pepT.s(t);
    for (const p of PEOPLE) {
      if (p.far === front) continue;
      const x = -200 + (((p.off + p.dir * p.v * tau) % WRAP) + WRAP) % WRAP, y = p.far ? 1150 : 1194;
      ctx.save(); ctx.translate(x, y); drawWalker(ctx, p.size, p.step * tau + p.off, walk, bow, p.dir, p.coat); ctx.restore();
    }
  }
  function cars(t) {
    const tau = carT.at(t);
    for (const c of CARS) {
      const dir = c.lane ? -1 : 1, y = c.lane ? 1296 : 1248, size = c.lane ? 92 : 86;
      const x = -200 + (((c.off + dir * c.v * tau) % WRAP) + WRAP) % WRAP;
      ctx.save(); ctx.translate(x, y); drawCar(ctx, size, (tau / carT.total) * c.wturn, c.kind, dir); ctx.restore();
    }
  }
  function gulls(t) {
    for (const g of GULLS) {
      const a = (cyc(t, g.per) + g.ph) * 2 * Math.PI, x = g.cx + Math.cos(a) * g.rx, y = g.cy + Math.sin(a) * g.ry;
      const flap = cyc(t, g.fl) * 2 * Math.PI;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.cos(a) * 0.12); drawGull(ctx, g.size, flap); ctx.restore();
    }
  }
  function flag(t) {
    ctx.save(); ctx.translate(POLE.x, POLE.base); drawPole(ctx, POLE.h, 0.8); ctx.restore();
    const top = POLE.base - POLE.h * 0.55;   // yarıya indirilmiş
    ctx.save(); ctx.translate(POLE.x + 2, top); drawWavingFlag(ctx, POLE.G, cyc(t, 1.25) * 2 * Math.PI, 1); ctx.restore();
    // gönder ipi
    ctx.beginPath(); ctx.moveTo(POLE.x + 3, POLE.base - POLE.h); ctx.lineTo(POLE.x + 3, top); ctx.moveTo(POLE.x + 3, top + POLE.G); ctx.lineTo(POLE.x + 3, POLE.base - 30); ctx.lineWidth = 0.8; ctx.strokeStyle = C.graphite; ctx.stroke();
  }
  function world(t) {
    const c = cam(t);
    const tu = tiltU(t);
    ctx.save(); ctx.translate(A.x, A.y + TILT * tu); ctx.scale(c.z, c.z); ctx.translate(-c.f.x, -c.f.y);
    ctx.fillStyle = C.paper; ctx.fillRect(-1200, 0, 3500, HZ);
    if (tu < 1) { ctx.save(); ctx.globalAlpha = 1 - tu; sky(t); ctx.restore(); }
    drawHills(ctx, -400, HZ + 2, 1900);
    ctx.save(); ctx.translate(TOWER.x, HZ - 8); drawClockTower(ctx, TOWER.s, 9, Math.floor(clockSec(t) / 60) % 60); ctx.restore();
    ctx.save(); ctx.translate(PALACE.x, HZ); drawPalace(ctx, PALACE.w); ctx.restore();
    water(t);
    ferries(t);
    quayAndPromenade();
    people(t, false);
    people(t, true);
    cars(t);
    flag(t);
    // martılar eğilmede ufka iner (yazının arkasında kalmaz)
    ctx.save(); ctx.translate(0, 200 * tu); gulls(t); ctx.restore();
    ctx.restore();
    return c;
  }

  // ——— saray etiketi (l03) ———
  function palaceLabel(t, c) {
    const k = ease.enter(seg(t, T.dolma - 0.04, 0.35)) * (1 - ease.exit(seg(t, T.carry0 - 0.1, 0.3)));
    if (k <= 0) return;
    // etiket sarayın altında, suyun üstünde (köşe saatiyle çakışmaz); çizgi rıhtımdan yukarı
    const wx = PALACE.x - 40, wy = HZ - 4, sx = A.x + (wx - c.f.x) * c.z, sy = A.y + (wy - c.f.y) * c.z;
    setFont(ctx, F.mono(34)); const lb = 'DOLMABAHÇE SARAYI', tw = ctx.measureText(lb).width, bx = Math.max(SAFE.x0, Math.min(SAFE.x1 - tw - 12, sx - tw / 2)), by = Math.min(1400, sy + 92);
    ctx.save(); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.moveTo(sx, sy + 4); ctx.lineTo(sx, by - 32); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.fillStyle = C.paper; ctx.fillRect(bx - 8, by - 32, tw + 16, 46); ctx.lineWidth = 2; ctx.strokeRect(bx - 8, by - 32, tw + 16, 46);
    ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(lb, bx, by + 2); ctx.restore();
  }

  // ——— saat (köşe → odadaki masa saati) ———
  function clock(t) {
    const u = carryU(t), rk = roomK(t), x = lerp(CLOCK.x, ROOMCLOCK.x, u), y = lerp(CLOCK.y, ROOMCLOCK.y, u), r = lerp(CLOCK.r, ROOMCLOCK.r, u);
    const sec = clockSec(t), held = BASE_SEC;   // odadaki saat 09.05'te
    const s = lerp(sec, held, u), hh = Math.floor(s / 3600), mm = (s % 3600) / 60, ss = s % 60;
    ctx.save(); ctx.translate(x, y);
    if (rk > 0) drawMantelCase(ctx, r, rk);
    else { ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); }
    drawClockFace(ctx, r, hh, mm, ss, 1 - u, u > 0.5 ? 1 : 0);
    ctx.restore();
    // saat yazısı (kâğıt çip), köşedeyken
    const ck = (1 - ease.state(seg(u, 0, 0.3))) * clamp01(chromeK(t));
    if (ck > 0) {
      const m = Math.floor(sec / 60), txt = `${String(Math.floor(m / 60)).padStart(2, '0')}.${String(m % 60).padStart(2, '0')}`;
      setFont(ctx, F.mono(36)); const tw = ctx.measureText(txt).width, bx = CLOCK.x - CLOCK.r - 72 - tw;   // gönderin tepesinden (x≈736) uzak
      ctx.save(); ctx.globalAlpha = ck; ctx.fillStyle = C.paper; ctx.fillRect(bx - 10, CLOCK.y - 30, tw + 20, 48); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(bx - 10, CLOCK.y - 30, tw + 20, 48);
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(txt, bx, CLOCK.y + 6); ctx.restore();
    }
  }
  // oda, taşınan saatin kadranından açılır (çapraz geçiş yok): kadran merkezli büyüyen daire
  function room(t) {
    const k = roomK(t); if (k <= 0) return;
    const u = carryU(t), cx = lerp(CLOCK.x, ROOMCLOCK.x, u), cy = lerp(CLOCK.y, ROOMCLOCK.y, u), r0 = lerp(CLOCK.r, ROOMCLOCK.r, u) + 6;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, lerp(r0, 1450, k), 0, Math.PI * 2); ctx.clip();
    const z = 1 + 0.06 * seg(t, T.carry0, T.back0 + 0.6 - T.carry0);
    ctx.save(); ctx.translate(ROOMCLOCK.x, ROOMCLOCK.y); ctx.scale(z, z); ctx.translate(-ROOMCLOCK.x, -ROOMCLOCK.y);
    drawRoom(ctx, 540, 1110, 1200, 810, 1, t);
    ctx.save(); ctx.fillStyle = '#E0D6C0'; ctx.fillRect(-100, 1515, 1300, 500); ctx.strokeStyle = 'rgba(28,27,24,0.25)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = -100; x < 1300; x += 60) { ctx.moveTo(x, 1515); ctx.lineTo(540 + (x - 540) * 1.8, 2015); } ctx.stroke(); ctx.beginPath(); ctx.moveTo(-100, 1515); ctx.lineTo(1300, 1515); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
    ctx.restore();
    ctx.restore();
    if (k < 1) { ctx.beginPath(); ctx.arc(cx, cy, lerp(r0, 1450, k), 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
  }

  // ——— üst blok ———
  function titleLines() {
    const txt = ep.voice.lines[0].text;
    for (const f of [84, 78, 72, 66]) { setFont(ctx, F.head(f)); const ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 4 && ls.length * f * 1.06 <= 300) return { f, ls }; }
    setFont(ctx, F.head(60)); return { f: 60, ls: wrap(ctx, txt, SAFE.x1 - SAFE.x0) };
  }
  const TITLE = titleLines();
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 1.6, 0.5));   // eğilme oturunca
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(TITLE.f)); const lh = TITLE.f * 1.06, y0 = 674 - (TITLE.ls.length - 1) * lh;
    TITLE.ls.forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, TITLE.f, k, C.ink));
  }
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.end + 0.45) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const p = ease.enter(seg(t, ln.t0 - 0.06, 0.3)) * (1 - ease.exit(seg(t, T.end + 0.15, 0.28)));
    if (ln.id === 'l06' || ln.id === 'l07') {
      // kapanış: fotoğrafın altındaki panelde
      const k = { a: 1, dy: 0 }, pc = ln.id === 'l06' ? Math.min(p, ease.enter(seg(t, T.back0 + 1.1, 0.3))) : p; let f2 = 44, l2; for (const f of [44, 40]) { f2 = f; setFont(ctx, F.name(f)); l2 = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (l2.length <= 2) break; }
      ctx.save(); ctx.globalAlpha = k.a; l2.slice(0, 2).forEach((s, i) => revealText(ctx, s, SAFE.x0, 932 + k.dy + i * f2 * 1.2, f2, pc, C.ink)); ctx.restore();
      return;
    }
    let fs0 = 50, ls; for (const f of [50, 46, 42]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, ln.text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 410 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function row({ label, num, unit, p = 1 }) {
    if (label) { setFont(ctx, F.mono(44)); revealText(ctx, label, SAFE.x0, 606, 44, p, C.ink); }
    if (num) { setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 686, 88, p, C.ink); if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 686, 44, p, C.ink); } }
  }
  function counters(t) {
    const pin = a => ease.enter(seg(t, a, 0.3));
    if (t >= T.susar - 0.04 && t < L.l03.t0 - 0.06) { row({ label: '09.05 · SAYGI DURUŞU', p: pin(T.susar - 0.04) * (1 - ease.exit(seg(t, L.l03.t0 - 0.36, 0.3))) }); return; }
    if (t >= T.elli - 0.04 && t < L.l05.t0 - 0.06) { row({ num: '1881 – 1938', p: pin(T.elli - 0.04) }); return; }
    if (t >= T.dakika - 0.04 && t < L.l06.t0 - 0.06) { row({ label: 'O DAKİKA · 09.05', p: pin(T.dakika - 0.04) }); return; }
    if (t >= L.l06.t0 - 0.04 && t < T.end + 0.45) colCounters(t);
  }
  // kapanış sütunu (fotoğrafın sağı, x 668–920, y ≤ 700): yıl sayacı → "88 yıl" → 88 çizgi
  function colCounters(t) {
    const k = { a: 1, dy: 0 }, out = 1 - ease.exit(seg(t, T.end + 0.15, 0.28)), p = ease.enter(seg(t, L.l06.t0 - 0.04, 0.3)) * out;
    ctx.save();
    const her = t >= T.her - 0.04, lab = her ? ['HER ÇİZGİ', 'BİR 10 KASIM'] : ['1938 → 2026'];
    // etiket: tek satırsa 44 px (sütuna sığmazsa küçülür), iki satırlı çizgi açıklaması 32 px mono
    let fsz = her ? 32 : 44; if (her) setFont(ctx, F.mono(fsz)); else { setFont(ctx, F.name(fsz)); while (ctx.measureText(lab[0]).width > 920 - COL.x && fsz > 36) setFont(ctx, F.name(--fsz)); }
    lab.forEach((s, i) => revealText(ctx, s, COL.x, 440 + i * 38 + k.dy, fsz, her ? ease.enter(seg(t, T.her - 0.04, 0.3)) * out : p, C.ink));
    let num = '88', unit = 'yıl';
    const land = T.seksen - 0.22;   // eleştiride ölçülen 0,18 sn gecikme + 0,04 sn öncelik
    if (t < land) { num = String(Math.round(lerp(1938, 2026, ease.state(seg(t, L.l06.t0 - 0.04, land - L.l06.t0 + 0.04))))); unit = ''; }
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, COL.x, 556 + k.dy, 88, p, C.ink);
    if (unit) { setFont(ctx, F.name(40)); revealText(ctx, unit, COL.x + nw + 12, 556 + k.dy, 40, p, C.ink); }
    if (her) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 88; i++) {
        const g = ease.enter(seg(t, T.her - 0.04 + i * 0.012, 0.18)) * out; if (g <= 0) break;
        const x = COL.x + 5 + (i % 22) * 11, y = 586 + Math.floor(i / 22) * 30 + k.dy;
        ctx.beginPath(); ctx.moveTo(x, y + 22); ctx.lineTo(x, y + 22 - 22 * g); ctx.stroke();
      }
    }
    ctx.restore();
  }
  // baskı görünürlüğü: yalnız opaklık (kayma yok); giriş 0,5 sn durum değişimi eğrisi, çıkış döngüden önce 0,35 sn
  function cardK(t) {
    const kin = ease.state(seg(t, T.ph0, 0.5)), kout = t >= T.loop0 ? ease.exit(seg(t, T.loop0, 0.35)) : 0;
    return { a: kin * (1 - kout), dy: 0 };
  }
  // fotoğraf baskısı: kâğıt kenar ve 1 px mürekkep çizgi; fotoğraf olduğu gibi (filtre, ton, aynalama yok)
  function photoCard(t) {
    const k = cardK(t); if (k.a <= 0) return;
    ctx.save(); ctx.globalAlpha = k.a;
    const x = CARD.x, y = CARD.y + k.dy, w = CARD.w, b = CARD.b, iw = w - 2 * b;
    ctx.fillStyle = '#F7F3EA'; ctx.fillRect(x, y, w, w);
    ctx.lineWidth = 1; ctx.strokeStyle = C.ink; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, w - 1);
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(photo, x + b, y + b, iw, iw);
    ctx.restore();
  }
  // imza: iskelet sırasıyla açılan maske (gerçek çizgiyi izler); döngüde aşağı kayarak kapanır
  function signature(t) {
    if (t < T.sign0) return;
    const w = ease.state(seg(t, T.sign0, T.sign1 - T.sign0)), ck = cardK(t);
    if (ck.a <= 0) return;
    const n = Math.floor(w * sigPts.length), m = sigMask.getContext('2d'), k = SIG.k;
    m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, sigMask.width, sigMask.height);
    m.setTransform(k, 0, 0, k, 4, 4); m.fillStyle = '#000';
    for (let i = 0; i < n; i++) { const [x, y, r] = sigPts[i]; m.beginPath(); m.arc(x, y, r * 1.6 + 1.4, 0, Math.PI * 2); m.fill(); }
    m.globalCompositeOperation = 'source-in'; m.fillStyle = C.ink; m.fill(sigPath);
    ctx.save(); ctx.globalAlpha = ck.a; ctx.drawImage(sigMask, SIG.x - 4, SIG.y - 4 + ck.dy); ctx.restore();
  }
  function saygi(t) {
    if (t < T.saygi) return;
    const p = ease.enter(seg(t, T.saygi, 0.5)), k = cardK(t);
    ctx.save(); ctx.globalAlpha = k.a; setFont(ctx, F.head(56)); revealText(ctx, 'SAYGI VE ÖZLEMLE', SAFE.x0, 1150 + k.dy, 56, p, C.ink); ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    let c = cam(t);
    if (roomK(t) < 1) c = world(t);
    room(t);
    clock(t);
    ctx.restore();
    palaceLabel(t, c);
    ctx.save(); ctx.globalAlpha = clamp01(chromeK(t)); ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.restore();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t);
    ctx.drawImage(grain(), 0, 0);
    // kâğıt dokusu fotoğrafın üstüne binmez: baskı ve kapanış yazıları dokudan sonra
    photoCard(t); narration(t); counters(t); signature(t); saygi(t);
  }
  return { duration: D, timeline: { T }, render };
}

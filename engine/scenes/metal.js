// "Metal" şablonu (Hangisi daha şaşırtıcı?): bir uçağı iki yılda yiyen Michel Lotito ve 68 yıl hıçkıran Charles Osborne.
// A: atölye; bisiklet, alışveriş arabası, televizyon kesilip yutulur; Cessna 150 parça parça eksilir (1978 → 1980 şeridi),
// rekor plaketi ısırılır, 9 ton metal blok. B: 1922 çiftliği; domuz ve kantar, düşüş, ilk hıçkırık; 1922 → 1990 hıçkırık
// şeridi (kalem yazar), Osborne yaşlanır; 2 alyans, 8 çocuk; Şubat 1990'da düz çizgi.
// Kıyas: aynı saat ekseni; Lotito'nun 2 yıllık çubuğu, Osborne'un 68 yıllık şeridi; o 2 yıla yaklaşma, "13 milyon" kırmızı.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { LOTITO_CARD, OSBORNE_CARD, drawMan, drawCessna, drawBike, drawCart, drawTV, drawPlaque, drawHog, drawScale, drawBlock, drawRing, drawChild, drawBarn } from '../metal_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705, FLOOR = 1392;
const SIFIR = { x: 872, y: 1412, H: 92 };
// hıçkırık şeridi (B) ve kıyas ekseni
const STRIP = { x0: 340, x1: 800, y: 880, h: 60 };
const AX = { x0: 110, x1: 750, yL: 900, yO: 1090 };
const Y0 = 1922, Y1 = 1990;
const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

// kelime eşleme: ekran metnindeki her kelime, seslendirme metnindeki hangi kelimede açılır (sayılar söylendiği kelimede)
const norm = w => w.toLocaleLowerCase('tr').replace(/[^a-zçğıöşüâî0-9]/g, '');
function mapWords(text, ttsWords) {
  const tx = text.split(/\s+/).filter(Boolean), tw = ttsWords.map(w => norm(w.w)), out = [];
  let j = 0;
  for (let i = 0; i < tx.length; i++) {
    out.push(Math.min(j, tw.length - 1));
    if (/\d/.test(tx[i]) && i + 1 < tx.length) {
      // sayı birden çok kelimeyle okunur: bir sonraki ekran kelimesine denk gelene kadar ilerle
      const nx = norm(tx[i + 1]).slice(0, 4); j++;
      while (j < tw.length && !(nx && tw[j].startsWith(nx))) j++;
      if (j >= tw.length) j = out.at(-1) + 1;
    } else j++;
  }
  return { words: tx, at: out };
}

export function metalTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    age16: Wd('l02', 'on'), metal: Wd('l02', 'metal'), glass: Wd('l02', 'cam'),
    bike: Wd('l03', 'bisiklet'), cart: Wd('l03', 'alışveriş'), tv: Wd('l03', 'televizyon'), swallow: Wd('l03', 'yutuyor'),
    y1978: Wd('l04', 'bin'), plane: Wd('l04', 'uçağı'), eat0: Wd('l04', 'yemeye'),
    two: Wd('l05', 'iki'), all: Wd('l05', 'tamamını'), done: Wd('l05', 'bitiriyor', 't1'),
    gw: L.l06.t0, plq: Wd('l06', 'plaket'), plqEat: Wd('l06', 'yiyor'),
    approx: Wd('l07', 'yaklaşık'), nine: Wd('l07', 'dokuz'), tons: Wd('l07', 'metal'),
    // kaydırma "bu" kelimesinde oturur; "adam"da Osborne bir kez hıçkırır
    whip1: Wd('l08', 'bu'), adam: Wd('l08', 'adam'),
    osb: L.l09.t0, y1922: Wd('l09', 'bin'), hog: Wd('l09', 'domuzu'), fall: Wd('l09', 'düşüyor'),
    hic0: Wd('l10', 'hıçkırmaya'), y68: Wd('l11', 'altmış'), r20: Wd('l11', 'yirmi'), r40: Wd('l11', 'kırk'),
    marry: Wd('l12', 'iki'), kids: Wd('l12', 'sekiz'), death: Wd('l13', 'ölümünden'), stop: Wd('l13', 'duruyor'),
    cmp0: L.l14.t0 - 0.1, two2: Wd('l15', 'iki'), after: L.l15.end, half: L.l16.end,
    hero: L.l17.words[L.l17.words.findIndex(w => norm(w.w) === 'on')].t0 - 0.02, mil: Wd('l17', 'milyon'),
    ask: L.l18.t0, loop0: tl.loop0,
  };
  T.whip0 = T.whip1 - 0.65;
  // Cessna: "yemeye" ile "bitiriyor" arası yenir; şerit 1922 → 1990: "altmış" ile l11 sonu arasında akar
  T.eatEnd = T.done; T.run0 = T.y68 - 0.15; T.run1 = Math.max(T.run0 + 2.2, L.l11.end + 0.2);
  T.zoom0 = T.hero - 0.75; // sessizlik bitmeden yakınlaşma hazır
  return T;
}

export async function makeMetalRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = metalTimes(tl);
  const maps = Object.fromEntries(ep.voice.lines.map(l => [l.id, mapWords(l.text, L[l.id].words)]));
  // döngü dikişi: sürekli döngülerin periyodu film süresine tam bölünür (son kare = kare 0)
  const per = p => D / Math.max(1, Math.round(D / p));
  const HIC = per(1.7), CHEW = per(0.42);
  const rnd = mulberry32(58);
  const spikes = Array.from({ length: 900 }, () => 0.45 + rnd() * 0.55);
  const eaten = t => t < T.eat0 ? 0 : ease.state(seg(t, T.eat0, T.eatEnd - T.eat0));
  const hicAt = t => { const u = ((t + 0.3) % HIC) / HIC; return u < 0.12 ? Math.sin(u / 0.12 * Math.PI) : 0; };
  const yearAt = t => t < T.run0 ? Y0 : lerp(Y0, Y1, ease.state(seg(t, T.run0, T.run1 - T.run0)));
  // A ↔ B kaydırma: A sola gider, B sağdan gelir (filmin baskın yönü: sağdan sola)
  const toB = t => t < T.whip0 ? 0 : ease.state(seg(t, T.whip0, T.whip1 - T.whip0));

  // ——— zemin ———
  function floor(dx, tone) {
    ctx.save(); ctx.translate(dx, 0);
    ctx.strokeStyle = 'rgba(139,133,119,0.45)'; ctx.lineWidth = 1.1;
    for (let y = FLOOR + 10, g = 6; y < 1920; y += g, g = Math.min(14, g + 0.6)) { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-200, FLOOR); ctx.lineTo(W + 200, FLOOR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    if (tone === 'farm') { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; const r = mulberry32(5); for (let i = 0; i < 40; i++) { const x = r() * (W + 200) - 100, h = 6 + r() * 10; ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x - 3, FLOOR - h); ctx.moveTo(x + 2, FLOOR); ctx.lineTo(x + 5, FLOOR - h * 0.8); ctx.stroke(); } }
    ctx.restore();
  }

  // ——— A: atölye ———
  function workshop(t, dx, frame0 = false) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    // atölye boyunca yavaş yaklaşma: kare 0'ın kamerasından (1,06) devam eder, hiçbir karede donmaz
    const z = frame0 ? 1 : 1.06 + 0.07 * seg(t, L.l02.t0, T.whip0 - L.l02.t0);
    ctx.translate(420, FLOOR); ctx.scale(z, z); ctx.translate(-420, -FLOOR);
    floor(0, 'shop');
    // arka plan: alet panosu (gravür, soluk)
    ctx.save(); ctx.globalAlpha = 0.35 * clamp01((t - L.l02.t0 + 0.3) / 0.4); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(80, 780, 300, 190);
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(110 + i * 45, 800); ctx.lineTo(110 + i * 45, 860 + (i % 3) * 30); ctx.stroke(); ctx.beginPath(); ctx.arc(110 + i * 45, 870 + (i % 3) * 30, 9, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    const tA = frame0 ? 0 : t;
    // l02: masada cıvatalar ve bir cam bardak; "metal"de bir cıvata ağza uçar, "cam"da bardak ısırılır
    if (!frame0 && tA < T.bike) {
      const ka = clamp01((tA - L.l02.t0 + 0.2) / 0.4) * (1 - seg(tA, T.bike - 0.5, 0.35));
      ctx.save(); ctx.globalAlpha = ka; ctx.strokeStyle = C.ink; ctx.fillStyle = '#F4EEE1'; ctx.lineWidth = 3;
      ctx.fillRect(330, FLOOR - 150, 220, 16); ctx.strokeRect(330, FLOOR - 150, 220, 16); ctx.beginPath(); ctx.moveTo(350, FLOOR - 134); ctx.lineTo(350, FLOOR); ctx.moveTo(530, FLOOR - 134); ctx.lineTo(530, FLOOR); ctx.stroke();
      for (let i = 0; i < 4; i++) { if (i === 0 && tA >= T.metal - 0.1) continue; const bx = 360 + i * 26; ctx.save(); ctx.translate(bx, FLOOR - 152); ctx.rotate(1.3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.stroke(); ctx.strokeRect(-6, -6, 12, 7); ctx.restore(); }
      if (tA < T.glass - 0.3) { ctx.beginPath(); ctx.moveTo(480, FLOOR - 150); ctx.lineTo(474, FLOOR - 220); ctx.lineTo(522, FLOOR - 220); ctx.lineTo(516, FLOOR - 150); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.restore();
      // uçan cıvata (masadan ağza) ve elde ısırılan bardak
      if (tA >= T.metal - 0.1 && tA < T.metal + 0.5) { const u = ease.state(seg(tA, T.metal - 0.1, 0.5)); ctx.save(); ctx.translate(lerp(360, 205, u), lerp(FLOOR - 152, 1030, u) - Math.sin(u * Math.PI) * 80); ctx.rotate(u * 6); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 18); ctx.stroke(); ctx.restore(); }
      if (tA >= T.glass - 0.3) {
        const u = ease.state(seg(tA, T.glass - 0.3, 0.4)), bite = seg(tA, T.glass + 0.15, 0.6);
        ctx.save(); ctx.globalAlpha = ka; ctx.translate(lerp(498, 236, u), lerp(FLOOR - 186, 1010, u)); ctx.rotate(-0.25 * u);
        ctx.beginPath(); ctx.moveTo(-18, 34); ctx.lineTo(-24, -34); ctx.lineTo(24, -34); ctx.lineTo(18, 34); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
        for (let i = 0; i < 2; i++) { const r = 11 * clamp01(bite * 2 - i); if (r <= 0) continue; ctx.beginPath(); ctx.arc(-8 + i * 16, -34, r, 0, Math.PI); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
    }
    // l03: nesneler sırayla gelir, testereyle kesilir, parçalar ağza gider
    // nesneler yukarıdan masaya iner (Sıfır'ın önünden geçmez), sola çıkar; eski etiket yenisinden 120 ms önce tamamen gider
    const items = [[T.bike, drawBike, 'BİSİKLET', 190], [T.cart, drawCart, 'ALIŞVERİŞ ARABASI', 200], [T.tv, drawTV, 'TELEVİZYON', 180]];
    if (!frame0 && tA >= T.bike - 0.3 && tA < T.plane) {
      items.forEach(([a, fn, name, s], i) => {
        const nxt = i < 2 ? items[i + 1][0] : T.swallow + 0.6;
        if (tA < a - 0.15 || tA >= nxt - 0.05) return;
        const kin = ease.enter(seg(tA, a - 0.15, 0.35)), kout = seg(tA, nxt - 0.35, 0.3), cout = seg(tA, nxt - 0.45, 0.18);
        const x = 560 - 260 * ease.exit(kout), y = FLOOR - 420 * (1 - kin);
        ctx.save(); ctx.globalAlpha = (1 - kout) * clamp01(kin * 3);
        // kesik: ortadan dikey testere çizgisi ve iki yarım
        const cut = ease.state(seg(tA, a + 0.35, 0.5));
        ctx.save(); ctx.beginPath(); ctx.rect(x - 200, y - 260, 200, 270); ctx.clip(); ctx.translate(x - 10 * cut, y); ctx.rotate(-0.08 * cut); fn(ctx, s); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(x, y - 260, 200, 270); ctx.clip(); ctx.translate(x + 10 * cut, y); ctx.rotate(0.08 * cut); fn(ctx, s); ctx.restore();
        if (cut > 0 && cut < 1) { ctx.beginPath(); ctx.moveTo(x, y - 230); ctx.lineTo(x, y + 4); ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]); }
        ctx.restore();
        chip(name, x, y - s - 40, kin * (1 - cout), 'center');
      });
    }
    // Cessna 150 (l04–l05): sağdan gelir, parça parça eksilir; altta 1978 → 1980 şeridi
    // uçak yıl kelimesinde ("bin dokuz yüz…") sağ üstten çapraz iner (Sıfır'ın başının üstünden); "uçağı"na kadar yavaşça oturur
    const pIn = frame0 ? 1 : ease.enter(seg(tA, T.y1978 - 0.2, T.plane - T.y1978 + 0.5)), pOut = frame0 ? 0 : seg(tA, T.gw - 0.1, 0.35);
    if (frame0 || (tA >= T.y1978 - 0.2 && tA < T.gw + 0.3)) {
      const e = frame0 ? 0.5 : eaten(tA);
      ctx.save(); ctx.globalAlpha = 1 - pOut; ctx.translate(lerp(800, 470, pIn) - 60 * ease.exit(pOut), lerp(560, FLOOR - 124, pIn)); drawCessna(ctx, 480, e); ctx.restore();
      // yenen parçadan ağza giden kırıntılar
      if (!frame0 && e > 0 && e < 1) for (let k = 0; k < 5; k++) { const u = ((tA * 1.6 + k / 5) % 1), bx = lerp(470, 240, u), by = lerp(1250, 1000, u) - Math.sin(u * Math.PI) * 60; ctx.fillStyle = C.ink; ctx.fillRect(bx - 4, by - 4, 8, 8); }
      if (!frame0) {
        const bar = { x0: 330, x1: 760, y: 1450 }, ba = (1 - pOut) * ease.enter(seg(tA, T.eat0 - 0.2, 0.4));
        if (ba > 0) {
          ctx.save(); ctx.globalAlpha = ba; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(bar.x0, bar.y - 14, bar.x1 - bar.x0, 28);
          ctx.fillStyle = C.ink; ctx.fillRect(bar.x0, bar.y - 14, (bar.x1 - bar.x0) * eaten(tA), 28);
          setFont(ctx, F.mono(40)); ctx.textAlign = 'left'; ctx.fillText('1978', bar.x0, bar.y + 60); ctx.textAlign = 'right'; if (tA >= T.two) ctx.fillText('1980', bar.x1, bar.y + 60); ctx.restore();
        }
      }
    }
    // l06: rekor plaketi
    if (!frame0 && tA >= T.gw - 0.1 && tA < L.l07.t0 + 0.3) {
      const k = ease.enter(seg(tA, T.plq - 0.25, 0.4)), out = seg(tA, L.l07.t0, 0.3), bite = seg(tA, T.plqEat, 0.6);
      ctx.save(); ctx.globalAlpha = k * (1 - out); ctx.translate(lerp(600, 480, k), 1090); ctx.rotate(-0.06); drawPlaque(ctx, 340, bite, C.paper); ctx.restore();
    }
    // l07: 9 ton (metal bloklar, 3 × 3), "9 TONDAN FAZLA"
    if (!frame0 && tA >= T.nine - 0.1) {
      for (let i = 0; i < 9; i++) {
        const a = T.nine + i * 0.07, k = ease.enter(seg(tA, a, 0.35)); if (k <= 0) continue;
        const col = i % 3, row = Math.floor(i / 3), x = 370 + col * 142 + row * 24, y = FLOOR - row * 118;
        ctx.save(); ctx.globalAlpha = k; ctx.translate(x, lerp(y - 120, y, k)); drawBlock(ctx, 134, '1 TON'); ctx.restore();
      }
    }
    // Lotito
    let pose = { arms: 'down', mouth: 'flat' };
    if (tA < L.l02.t0) pose = { arms: 'eat', phase: t, mouth: Math.floor(t / CHEW) % 2 ? 'open' : 'flat' }; // kare 0'daki hâliyle devam
    else if (frame0 || (tA >= T.eat0 && tA < T.done + 0.2)) pose = { arms: 'eat', phase: t, mouth: Math.floor(t / CHEW) % 2 ? 'open' : 'flat' };
    else if (tA >= L.l02.t0 && tA < T.bike - 0.2) pose = { arms: 'eat', phase: t, mouth: 'open' };
    else if (tA >= T.bike - 0.2 && tA < T.swallow) pose = { arms: 'saw', phase: t, mouth: 'flat' };
    else if (tA >= T.swallow && tA < T.plane) pose = { arms: 'eat', phase: t, mouth: 'open' };
    else if (tA >= T.plqEat && tA < L.l07.t0) pose = { arms: 'hold', mouth: 'open' };
    else if (tA >= T.done + 0.2 && tA < T.gw) pose = { arms: 'up', mouth: 'smile' };
    ctx.save(); ctx.translate(170, FLOOR); drawMan(ctx, LOTITO_CARD, pose, 390); ctx.restore();
    ctx.restore();
  }

  // ——— B: çiftlik ve hıçkırık şeridi ———
  function farm(t, dx, frame0 = false) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    const tB = frame0 ? T.r40 : t;
    const z = frame0 ? 1 : 1 + 0.06 * seg(t, T.whip1, T.cmp0 - T.whip1);
    ctx.translate(540, FLOOR); ctx.scale(z, z); ctx.translate(-540, -FLOOR);
    floor(0, 'farm');
    { const ba = 0.4 * (1 - 0.6 * seg(tB, T.marry - 0.3, 0.4)); ctx.save(); ctx.translate(660, FLOOR); ctx.globalAlpha = ba; drawBarn(ctx, 300); ctx.restore(); }
    // l09: kantar ve domuz (kirişten asılı, ipli); düşüşte domuz yere iner; şerit gelince kantar söner
    const fallU = frame0 ? 0 : ease.state(seg(tB, T.fall - 0.05, 0.45)), upU = frame0 ? 1 : ease.state(seg(tB, L.l10.t0, 0.6));
    if (!frame0 && tB < T.hic0 + 0.4) {
      const lift = ease.state(seg(tB, T.hog - 0.3, 0.6)) * (1 - fallU), gone = seg(tB, T.hic0 - 0.2, 0.5);
      ctx.save(); ctx.globalAlpha = 1 - gone;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(320, 760); ctx.lineTo(660, 760); ctx.stroke();
      ctx.save(); ctx.translate(500, 960); drawScale(ctx, 200, 0.15 + 0.6 * lift); ctx.restore();
      const hx = lerp(520, 580, fallU), hy = lerp(FLOOR, 1130, lift);
      if (fallU < 0.5) { ctx.beginPath(); ctx.moveTo(490, 900); ctx.lineTo(hx + 10, hy - 125); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
      ctx.save(); ctx.translate(hx, hy); drawHog(ctx, 230, lift); ctx.restore();
      ctx.restore();
    }
    if (!frame0 && tB >= T.y1922 - 0.1 && tB < T.hic0) chip('1922 · NEBRASKA', 720, 860, ease.enter(seg(tB, T.y1922 - 0.1, 0.3)) * (1 - seg(tB, T.hic0 - 0.4, 0.3)), 'center');
    // hıçkırık şeridi: 1922 → 1990, kalem sağa yazar; dorukta 2 yıllık pencere seçilir
    const sa = frame0 ? 1 : ease.enter(seg(tB, T.hic0 - 0.1, 0.4));
    if (sa > 0 && t < T.cmp0) strip(t, tB, sa, frame0); // kıyasta şerit compare() içinde taşınır
    // Osborne: kaldırır, düşer, kalkar, hıçkırır (sürekli), yaşlanır
    const age = frame0 ? 0.5 : clamp01((yearAt(tB) - Y0) / (Y1 - Y0));
    // "adam" kelimesinde tek bir hıçkırık (omuz sıçraması); l10'dan sonra sürekli
    const pulse = t >= T.adam && t < T.adam + 0.3 ? Math.sin((t - T.adam) / 0.3 * Math.PI) : 0;
    const hic = Math.max(pulse, frame0 || (tB >= T.hic0 && tB < T.stop) ? hicAt(t) : 0);
    let pose = { arms: 'down', mouth: 'flat', age, hic };
    if (!frame0 && tB >= T.hog - 0.3 && tB < L.l10.t0 + 0.6) pose = { arms: 'lift', fall: fallU * (1 - upU), mouth: fallU > 0.3 ? 'o' : 'flat', age: 0 };
    if (!frame0 && tB >= T.stop + 0.1) pose = { arms: 'down', mouth: 'smile', age: 1 };
    ctx.save(); ctx.translate(230, FLOOR); drawMan(ctx, OSBORNE_CARD, pose, 390); ctx.restore();
    // hıçkırık işareti: ağız önünde üç kısa çizgi
    if (hic > 0.3) { const hx = 272, hy = FLOOR - 330; ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5, d = 1; ctx.beginPath(); ctx.moveTo(hx + d * Math.cos(a) * 18, hy + Math.sin(a) * 18); ctx.lineTo(hx + d * Math.cos(a) * 34, hy + Math.sin(a) * 34); ctx.stroke(); } ctx.restore(); }
    // l12: 2 alyans ve 8 çocuk (tarihsiz; şeridin üstünde bir sıra)
    if (!frame0 && tB >= T.marry - 0.1 && tB < T.cmp0) {
      const kr = ease.enter(seg(tB, T.marry - 0.05, 0.35));
      for (let i = 0; i < 2; i++) { ctx.save(); ctx.globalAlpha = kr; ctx.translate(400 + i * 66, 1150); drawRing(ctx, 66); ctx.restore(); }
      for (let i = 0; i < 8; i++) { const kc = ease.enter(seg(tB, T.kids + i * 0.06, 0.3)); if (kc <= 0) continue; ctx.save(); ctx.globalAlpha = kc; ctx.translate(400 + i * 48, 1330); drawChild(ctx, 92); ctx.restore(); }
      chip('2 EVLİLİK', 380, 1050, kr, 'left'); chip('8 ÇOCUK', 380, 1210, ease.enter(seg(tB, T.kids, 0.35)), 'left');
    }
    ctx.restore();
  }
  function strip(t, tB, a, frame0) {
    const S = STRIP, yr = frame0 ? 1990 : yearAt(tB), stopped = !frame0 && tB >= T.stop;
    const xAt = y => lerp(S.x0, S.x1, (y - Y0) / (Y1 - Y0));
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(S.x0 - 20, S.y - S.h - 30, S.x1 - S.x0 + 40, S.h * 2 + 60);
    ctx.strokeStyle = 'rgba(139,133,119,0.5)'; ctx.lineWidth = 1; for (let y = Y0; y <= Y1; y += 2) { const x = xAt(y); ctx.beginPath(); ctx.moveTo(x, S.y - S.h - 20); ctx.lineTo(x, S.y + S.h + 20); ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(S.x0 - 20, S.y - S.h - 30, S.x1 - S.x0 + 40, S.h * 2 + 60);
    // dalga: 1922'den kalemin olduğu yıla kadar sık tepeler; ilk saniyelerde tek tek görünür
    const xe = xAt(yr), n = 900;
    ctx.beginPath(); ctx.moveTo(S.x0, S.y);
    if (tB < T.run0 && !frame0) {
      // ilk hıçkırıklar: kalem 1922'de, tepeler zamanla birikir (her 0,6 sn bir)
      const k = Math.floor(Math.max(0, tB - T.hic0) / 0.6) + 1;
      for (let i = 0; i < k; i++) { const x = S.x0 + 6 + i * 7; ctx.lineTo(x, S.y); ctx.lineTo(x + 2, S.y - S.h * spikes[i]); ctx.lineTo(x + 4, S.y + S.h * 0.35 * spikes[i]); ctx.lineTo(x + 6, S.y); }
    } else {
      for (let i = 0; i < n; i++) { const x = S.x0 + (S.x1 - S.x0) * i / n; if (x > xe) break; ctx.lineTo(x, S.y - S.h * spikes[i] * (i % 2 ? 1 : -0.4)); }
      if (stopped) ctx.lineTo(S.x1 + 10, S.y);
    }
    ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink; ctx.stroke();
    // kalem
    if (!stopped) { const px = tB < T.run0 && !frame0 ? S.x0 + 12 + (Math.floor(Math.max(0, tB - T.hic0) / 0.6)) * 7 : xe; ctx.beginPath(); ctx.moveTo(px, S.y); ctx.lineTo(px + 18, S.y - S.h - 26); ctx.lineWidth = 5; ctx.stroke(); }
    // yıl etiketleri
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText('1922', S.x0 - 20, S.y - S.h - 44);
    if ((frame0 || tB >= T.run0) && !stopped) { ctx.textAlign = 'right'; ctx.fillText(frame0 ? '1990' : String(Math.floor(yr)), S.x1 + 20, S.y - S.h - 44); }
    ctx.restore();
    if (stopped) chip('1990 · DURDU', S.x1 + 20, S.y - S.h - 44, ease.enter(seg(tB, T.stop, 0.35)), 'right');
  }

  // ——— kıyas: aynı saat ———
  function compare(t) {
    if (t < T.cmp0 || t >= T.ask) return;
    const kin = ease.state(seg(t, T.cmp0, 0.6)), kout = 0;
    // çiftlik solar; hıçkırık şeridi (1922–1990) yerinden büyüyüp kıyas dalgasına dönüşür (nesne kesmenin öbür tarafına taşınır)
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.save(); ctx.globalAlpha = kin * (1 - kout); ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.restore();
    ctx.globalAlpha = 1 - kout;
    // yakınlaşma: o 2 yıllık pencere tüm genişliğe açılır (sessizlik bitmeden hazır, doruk kelimesinde oturur)
    // yakınlaşmadan önce sürekli hafif daralma (eksen hiçbir karede durmaz), sonra 2 yıllık pencereye yakınlaşma
    const drift = 0.12 * seg(t, T.cmp0 + 0.9, T.zoom0 - T.cmp0 - 0.9);
    const zu = drift + (1 - drift) * ease.state(seg(t, T.zoom0, T.hero - T.zoom0)), win0 = 1978, win1 = 1980;
    const span0 = Y1 - Y0, span = lerp(span0, win1 - win0, zu), c0 = lerp(Y0, win0, zu);
    const xAt = y => lerp(AX.x0, AX.x1, (y - c0) / span);
    // eksen ve etiketler şerit yerine oturduktan sonra belirir
    const ka = ease.enter(seg(t, T.cmp0 + 0.35, 0.4));
    ctx.save(); ctx.globalAlpha *= ka;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(AX.x0, 1280); ctx.lineTo(AX.x1, 1280); ctx.stroke();
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink;
    // çentik adımı: etiketler arası en az 110 px
    const step = [1, 2, 5, 10, 20].find(s => s / span * (AX.x1 - AX.x0) >= 110) || 20;
    for (let y = Math.ceil(c0 / step) * step; y <= c0 + span + 0.001; y += step) { const x = xAt(y); if (x < AX.x0 - 1 || x > AX.x1 + 1) continue; ctx.beginPath(); ctx.moveTo(x, 1280); ctx.lineTo(x, 1296); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(String(y), x, 1340); }
    chip('OSBORNE · HIÇKIRIK', AX.x0, AX.yO - 110, 1, 'left');
    ctx.restore();
    // Osborne şeridi: 1922 → 1990 boyunca hıçkırık tepeleri; girişte çiftlikteki şeridin kutusundan kıyas yerine taşınır
    ctx.save();
    if (kin < 1) {
      const sx = lerp((STRIP.x1 - STRIP.x0) / (AX.x1 - AX.x0), 1, kin), sy = lerp(STRIP.h / 70, 1, kin);
      const ox = lerp(STRIP.x0, AX.x0, kin), oy = lerp(STRIP.y, AX.yO, kin);
      ctx.translate(ox, oy); ctx.scale(sx, sy); ctx.translate(-AX.x0, -AX.yO);
      // çiftlikteki kutunun çerçevesi şeritle birlikte taşınır ve söner
      ctx.save(); ctx.globalAlpha *= 1 - kin; ctx.fillStyle = '#F4EEE1'; ctx.fillRect(AX.x0 - 20 / sx, AX.yO - 100, AX.x1 - AX.x0 + 40 / sx, 200); ctx.lineWidth = 2 / Math.min(sx, sy); ctx.strokeStyle = C.ink; ctx.strokeRect(AX.x0 - 20 / sx, AX.yO - 100, AX.x1 - AX.x0 + 40 / sx, 200); ctx.restore();
    }
    ctx.beginPath(); ctx.rect(AX.x0, AX.yO - 90, AX.x1 - AX.x0, 180); ctx.clip();
    const xEnd = xAt(Y1);
    // tepeler yıla bağlı sabit ızgarada (8192 örnek / 68 yıl): eksen daraldıkça tepeler de açılır; adım ~3 px
    const NG = 8192, vis = span / (Y1 - Y0) * NG, m = Math.max(1, 2 ** Math.round(Math.log2(vis * 3 / (AX.x1 - AX.x0))));
    const g0 = Math.max(0, Math.floor((c0 - Y0) / (Y1 - Y0) * NG / m) * m);
    ctx.beginPath(); ctx.moveTo(Math.max(AX.x0, xAt(Y0)), AX.yO);
    for (let g = g0; g <= NG; g += m) { const x = xAt(Y0 + (Y1 - Y0) * g / NG); if (x > xEnd || x > AX.x1 + 4) break; const k = g / m; ctx.lineTo(x, AX.yO - 70 * spikes[(g * 7 + 3) % spikes.length] * (k % 2 ? 1 : -0.45)); }
    ctx.lineWidth = zu > 0.5 ? 1 : 1.2; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
    // Lotito çubuğu: 1978 → 1980 (2 yıl)
    const la = ease.enter(seg(t, T.two2 - 0.05, 0.35));
    if (la > 0) {
      ctx.save(); ctx.globalAlpha *= la;
      const x0 = xAt(win0), x1 = xAt(win1);
      ctx.fillStyle = C.ink; ctx.fillRect(x0, AX.yL - 18, Math.max(3, x1 - x0), 36);
      chip('LOTITO · UÇAK · 2 YIL', zu > 0.5 ? AX.x0 : Math.min(AX.x1 - 380, x0), AX.yL - 50, 1, 'left');
      // seçili pencere: Osborne şeridinde aynı 2 yıl
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 36; ctx.strokeRect(x0, AX.yO - 96, Math.max(4, x1 - x0), 192); ctx.setLineDash([]);
      ctx.restore();
    }
    ctx.restore();
  }

  function chip(s, x, y, a = 1, al = 'left', col = C.ink, size = 40) {
    if (a <= 0) return; setFont(ctx, F.mono(size)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - size * 0.86, tw + 20, size * 1.3); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.bike, 'sayma', 'sayiyor'], [T.plane, 'ayakta', 'notr'], [T.all, 'sasirma', 'saskin'], [T.all + 1.5, 'ayakta', 'notr'], [T.plqEat, 'ayakta', 'mutlu'], [T.nine, 'sasirma', 'saskin'],
    [T.adam, 'ayakta', 'notr'], [T.fall, 'sasirma', 'saskin'], [T.fall + 1.2, 'ayakta', 'notr'], [T.y68, 'sasirma', 'saskin'], [T.y68 + 1.6, 'ayakta', 'notr'], [T.kids, 'ayakta', 'mutlu'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.plqEat + 0.25, T.plqEat + 1.6, 'Plaketi de mi yedi?!']];
  function sifir(t, dx = 0) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.save(); ctx.translate(SIFIR.x + dx, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(40)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - 150;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  // anlatım: her kelime söylendiği anda açılır (sayılar kendi kelimesinde); düzen tüm satırdan kurulur (kayma yok)
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let id = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) id = l.id;
    if (!id || id === 'l01') return;
    // bölünmüş doruk cümlesi (l16 + l17) tek kartta birikir: söylenmemiş kısım soluk, sayısı "___"
    const ids = id === 'l16' || id === 'l17' ? ['l16', 'l17'] : [id];
    const words = []; // { w, ta, ghost }
    for (const k of ids) { const mp = maps[k]; mp.words.forEach((w, i) => words.push({ w, ta: L[k].words[mp.at[i]]?.t0 ?? L[k].t0, ghost: ids.length > 1 })); }
    const text = words.map(o => o.w).join(' ');
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    let wi = 0; const sp = ctx.measureText(' ').width;
    ls.slice(0, 4).forEach((s, li) => {
      let x = SAFE.x0;
      for (const w of s.split(' ')) {
        const o = words[wi], k = ease.enter(seg(t, o.ta - 0.05, 0.18)), y = y0 + li * lh;
        if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(w, x, y + 8 * (1 - k)); ctx.restore(); }
        else if (o.ghost) {
          // söylenmemiş sayı: kelimenin kendi genişliğinde bir çizgi (arkasındaki boşluk korunur)
          ctx.save(); ctx.globalAlpha = ease.enter(seg(t, L.l16.t0 - 0.05, 0.3)); ctx.fillStyle = C.graphite; ctx.strokeStyle = C.graphite; ctx.textAlign = 'left';
          if (/\d/.test(w)) { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 2, y + 6); ctx.lineTo(x + ctx.measureText(w).width - 2, y + 6); ctx.stroke(); } else ctx.fillText(w, x, y);
          ctx.restore();
        }
        x += ctx.measureText(w).width + sp; wi++;
      }
    });
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    // kanca: iddia büyük başlık, seri sorusu küçük üst satır; giriş ve çıkış opaklık + 12 px kayma (harf kesilmez)
    ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'left'; const dy = 12 * (1 - k);
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText('HANGİSİ DAHA ŞAŞIRTICI?', SAFE.x0, 418 - dy);
    setFont(ctx, F.head(84)); ctx.fillStyle = C.ink; ctx.fillText('Uçağı yiyen adam mı,', SAFE.x0, 512 - dy); ctx.fillText('68 yıl hıçkıran', SAFE.x0, 600 - dy); ctx.fillText('adam mı?', SAFE.x0, 688 - dy);
    ctx.restore();
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(40)); revealText(ctx, label, SAFE.x0, 590, 40, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(40));
    if (right1) revealText(ctx, right1, SAFE.x1, 632, 40, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 40, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    const pA = Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)));
    if (t < L.l08.t0 - 0.06) {
      const lab = 'MICHEL LOTITO · FRANSA';
      if (t < T.age16) return row({ label: lab, num: '', p: pA });
      if (t < T.bike) return row({ label: lab, num: '16', unit: 'yaşında', right2: t >= T.metal ? 'METAL VE CAM' : '', p: pA });
      if (t < T.y1978) return row({ label: lab, num: '16', unit: 'yaşında', right1: t >= T.tv ? 'TELEVİZYON' : t >= T.cart ? 'ALIŞVERİŞ ARABASI' : 'BİSİKLET', right2: 'KESİP YUTUYOR', p: pA });
      if (t < T.two) return row({ label: lab, num: '1978', unit: '', right1: t >= T.plane ? 'CESSNA 150' : '', right2: t >= T.plane ? 'GUINNESS KAYDI' : '', p: pA });
      if (t < T.gw) return row({ label: lab, num: '2', unit: 'yılda', right1: 'CESSNA 150', right2: t >= T.all ? 'TAMAMI YENDİ' : 'GUINNESS KAYDI', p: pA });
      // plaket etiketi plaketle birlikte l07 başında gider
      if (t < L.l07.t0) return row({ label: lab, num: '', unit: '', right1: 'REKOR PLAKETİ', right2: t >= T.plqEat ? 'O DA YENDİ' : '', p: pA });
      return row({ label: lab, num: t >= T.nine ? '9' : '', unit: t >= T.nine ? 'ton' : '', right1: t >= T.approx ? 'YAKLAŞIK' : '', right2: 'BÜTÜN HAYATI', p: pA });
    }
    if (t < L.l09.t0 - 0.06) return;
    const pB = Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35))), labB = 'CHARLES OSBORNE · ABD';
    if (t < T.cmp0) {
      if (t < T.y1922) return row({ label: labB, num: '', p: pB });
      if (t < T.y68) return row({ label: labB, num: '1922', unit: '', right1: t >= T.hog ? 'DOMUZU TARTARKEN' : '', right2: t >= T.fall ? 'DÜŞÜYOR' : '', p: pB });
      if (t < T.stop) return row({ label: labB, num: '68', unit: 'yıl', right1: t >= T.r20 ? `DAKİKADA 20${t >= T.r40 ? '–40' : ''}` : '', right2: 'HIÇKIRIK', p: pB });
      return row({ label: labB, num: '68', unit: 'yıl', right1: 'ŞUBAT 1990', right2: 'KENDİLİĞİNDEN DURDU', p: pB });
    }
    if (t < T.hero) {
      const p = ease.enter(seg(t, T.cmp0, 0.35));
      return row({ label: 'AYNI TAKVİM', num: t >= T.two2 ? '2' : '68', unit: 'yıl', right1: 'OSBORNE: 68 YIL', right2: t >= T.two2 ? 'LOTITO: 2 YIL' : '', p });
    }
    if (t < T.ask) return row({ label: 'O 2 YILDA · OSBORNE', num: '13 milyon', unit: t >= T.mil ? 'hıçkırık' : '', red: true, right1: '', right2: '' });
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(64)); revealText(ctx, 'Lotito mu, Osborne mu?', SAFE.x0, 668, 64, p, C.ink);
  }

  // ——— kare 0 / soru: iki tarafın birlikte görüldüğü bölünmüş sahne ———
  // kare 0 (küçük resim): üstte yarısı yenmiş dev Cessna, altta iki adam yan yana; Osborne'un başının üstünde hıçkırık şeridi
  // o: { alpha, dx (Lotito dışındaki öğelerin kayması), bg (kâğıt zemin), lotito }
  // uçak Osborne'un şapkasının üstünde kalır (gövde altı ~1010, şapka ~1040)
  const PLANE0 = { x: 560, y: 970, s: 560 };
  function split(t, o = {}) {
    const { alpha = 1, dx = 0, bg = true, lotito = true } = o;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    if (bg) { ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); }
    // kamera: açılışta yavaş yaklaşma (1 → 1,06; atölye bu değerden devam eder), soruda geri çekilme; kare 0 = son kare
    const z = t < T.ask ? 1 + 0.06 * ease.state(seg(t, 0, L.l02.t0)) : 1 + 0.06 * (1 - ease.state(seg(t, T.ask, D - T.ask)));
    ctx.translate(420, FLOOR); ctx.scale(z, z); ctx.translate(-420, -FLOOR);
    if (bg) floor(0, 'shop');
    ctx.save(); ctx.translate(dx, 0);
    // uçak: büyük, yenen parçalar kesik kontur; kanadın ucunda ısırık izleri; kırıntılar Lotito'ya akar
    ctx.save(); ctx.translate(PLANE0.x, PLANE0.y); drawCessna(ctx, PLANE0.s, 0.55);
    ctx.scale(PLANE0.s, PLANE0.s); ctx.lineWidth = 2.2 / PLANE0.s; ctx.strokeStyle = C.ink;
    // ısırık izleri telefonda seçilecek boyda (yarıçap 20–25 px)
    ctx.lineWidth = 3 / PLANE0.s;
    for (const [bx, r] of [[0.3, 0.045], [0.22, 0.04], [0.15, 0.036]]) { ctx.beginPath(); ctx.arc(bx, -0.2, r, 0, Math.PI); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke(); }
    ctx.restore();
    for (let k = 0; k < 6; k++) { const u = (t / per(1.2) + k / 6) % 1, bx = lerp(500, 220, u), by = lerp(985, 1040, u) - Math.sin(u * Math.PI) * 60; ctx.fillStyle = C.ink; ctx.fillRect(bx - 5, by - 5, 10, 10); }
    // Osborne (sola bakar) ve aradaki hıçkırık şeridi
    const S = { x0: 345, x1: 610, y: 1260, h: 40 };
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(S.x0 - 14, S.y - S.h - 18, S.x1 - S.x0 + 28, S.h * 2 + 36); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(S.x0 - 14, S.y - S.h - 18, S.x1 - S.x0 + 28, S.h * 2 + 36);
    const sh = (t / HIC) % 1;
    ctx.beginPath(); ctx.moveTo(S.x0, S.y); for (let i = 0; i < 90; i++) { const x = S.x0 + (S.x1 - S.x0) * i / 90, ph = (i / 90 - sh + 1) % 1; ctx.lineTo(x, S.y - S.h * spikes[i] * (ph < 0.1 ? 1 : 0.18) * (i % 2 ? 1 : -0.5)); } ctx.lineWidth = 1.8; ctx.stroke();
    const h = hicAt(t);
    ctx.save(); ctx.translate(735, FLOOR); ctx.scale(-1, 1); drawMan(ctx, OSBORNE_CARD, { age: 0.4, hic: h }, 340); ctx.restore();
    if (h > 0.3) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5; ctx.beginPath(); ctx.moveTo(698 - Math.cos(a) * 16, FLOOR - 296 + Math.sin(a) * 16); ctx.lineTo(698 - Math.cos(a) * 30, FLOOR - 296 + Math.sin(a) * 30); ctx.stroke(); } ctx.restore(); }
    ctx.restore();
    if (lotito) { ctx.save(); ctx.translate(170, FLOOR); drawMan(ctx, LOTITO_CARD, { arms: 'eat', phase: t, mouth: Math.floor(t / CHEW) % 2 ? 'open' : 'flat' }, 390); ctx.restore(); }
    ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const s = toB(t), op0 = L.l02.t0 - 0.5;
    // kare 0: bölünmüş sahne. Açılışta Lotito yerinde kalır (atölyede aynı yer, aynı boy); uçak ve Osborne onun arkasından
    // sola çekilir (filmin baskın yönü: sağdan sola)
    if (t >= op0 && t < L.l02.t0) split(t, { bg: false, lotito: false, dx: -W * ease.exit(seg(t, op0, 0.5)) });
    if (t >= op0 && t < T.cmp0 + 0.6) {
      if (s < 1) workshop(t, -W * s);
      if (s > 0) farm(t, W * (1 - s));
    }
    compare(t);
    if (t < op0) split(t);
    // soru: sert kesme, "Sen" kelimesinde kare 0'ın sahnesine dönülür (döngü)
    if (t >= T.ask) split(t);
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET', SAFE.x0, 530, kf, 'left'); chip('HER HAFTA YENİ BİR HANGİSİ?', SAFE.x0, 584, kf, 'left'); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    // kaydırmada Sıfır sahnesiyle birlikte taşınır (atölyedeki sola çıkar, çiftlikteki sağdan gelir): hiçbir nesnenin üstüne binmez
    if (s > 0 && s < 1) { sifir(t, -W * s); sifir(t, W * (1 - s)); } else sifir(t, 0);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

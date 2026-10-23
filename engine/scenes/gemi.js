// "Gemi" şablonu (Hangisi daha şaşırtıcı?): üç gemi kazasından sağ çıkan hostes ve iki atom bombasından sağ çıkan
// gemi tasarımcısı. A: gravür kürede Olympic Solent'te Hawke ile çarpışır; ikizi Titanik Kuzey Atlantik'te batar;
//    hastane gemisi Britannic Ege'de mayına çarpar. B: Japonya; kâğıt levhada şehir halkaları (1–3 km), şok dalgası
//    3 km'deki adama ulaşır; tren Hiroşima'dan Nagazaki'ye; aynı halkalar ikinci kez. Sonda ortak takvim: Violet'in
//    üç kazası 1.889 güne yayılır, Yamaguchi'nin 3 günü aynı ölçekte kırmızı bir çizgi.
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { geoInterpolate } from 'd3-geo';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { LINER_CARD, drawLiner, CRUISER_CARD, drawCruiser, drawIceberg, drawLifeboat, drawMine, drawPropeller, drawTrain, VIOLET_CARD, drawViolet, YAMA_CARD, drawYamaguchi } from '../gemi_chars.js';
import { buildYolTimeline, densify, pointAt, slice } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
// yerler (boylam, enlem)
const SOUTHAMPTON = [-1.40, 50.90], COWES = [-1.27, 50.70], CHERBOURG = [-1.62, 49.70], COBH = [-8.30, 51.75], WRECK = [-49.95, 41.73];
const NAPLES = [14.25, 40.80], MESSINA = [15.62, 38.15], KEA = [24.28, 37.70];
const HIROSHIMA = [132.455, 34.385], NAGASAKI = [129.87, 32.75];
const RAIL = [HIROSHIMA, [131.6, 34.05], [130.94, 33.95], [130.88, 33.86], [130.51, 33.38], [130.30, 33.25], [130.05, 32.84], NAGASAKI];
// şehir levhası: halkaların merkezi (patlama noktası) ve ölçek (1 km = 90 px)
const CITY = { x: 600, y: 1090, km: 86 };
// takvim levhası: 20 Eylül 1911 → 21 Kasım 1916 = 1.889 gün
const TL = { x0: 120, x1: 880, yA: 960, yB: 1240 };
const MAG = { x: 300, y: 1334, r: 84 };

export function gemiTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    sail: L.l02.t0 + 0.2, ram: Wd('l02', 'çarpışıyor'), twin: L.l03.t0, name: Wd('l04', 'titanik'), berg: Wd('l05', 'buzdağına'), sink: Wd('l05', 'batıyor'),
    dead: Wd('l05', 'fazla'), boat: Wd('l06', 'filikayla'), aeg0: L.l06.end + 0.15, aeg1: L.l07.t0 + 0.55, mine: Wd('l07', 'mayına'), min55: Wd('l07', 'dakikada'),
    prop: Wd('l08', 'pervanelere'), jump: Wd('l08', 'atlayıp'), saved: Wd('l08', 'kurtuluyor'), whip0: L.l08.end + 0.25, whip1: L.l09.t0 + 0.6,
    hiro: Wd('l10', 'hiroşima'), km1: Wd('l11', 'üç'), bomb1: Wd('l11', 'patlıyor'), train: Wd('l12', 'trene'), home: Wd('l12', 'nagazaki'), boss: Wd('l13', 'patronuna'),
    km2: Wd('l13', 'üç'), bomb2: Wd('l13', 'patlıyor'), both: L.l14.t0, cmp0: L.l15.t0 - 0.1, span: Wd('l16', 'yayıldı'), yama: Wd('l16', 'yamaguchi'),
    hero: L.l17.t0 - 0.04, after: L.l18.t0, ask: L.l19.t0, loop0: tl.loop0,
  };
  T.plate1 = L.l11.t0 - 0.3; T.plate1x = T.train - 0.35; T.plate2 = L.l13.t0 - 0.3;
  return T;
}

export async function makeGemiRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = gemiTimes(tl), Fx = ep.facts;
  const R_OLY = densify([SOUTHAMPTON, COWES], 2), R_TIT = densify([SOUTHAMPTON, CHERBOURG, COBH, WRECK], 40), R_BRI = densify([NAPLES, MESSINA, KEA], 20), R_RAIL = densify(RAIL, 10);

  // ——— gemilerin konumu (rota üzerinde), batış ———
  const olyS = t => R_OLY.at(-1).km * ease.state(seg(t, T.sail, T.ram - T.sail));
  const titS = t => R_TIT.at(-1).km * (0.12 + 0.88 * ease.state(seg(t, T.twin + 0.4, T.berg - T.twin - 0.4)));
  const briS = t => R_BRI.at(-1).km * ease.state(seg(t, T.aeg1 - 0.2, T.mine - T.aeg1 + 0.2));
  const railS = t => R_RAIL.at(-1).km * ease.state(seg(t, T.train, T.home + 0.7 - T.train));
  const sinkT = t => ({ tilt: 0.28 * ease.state(seg(t, T.sink, 1.0)), sink: ease.state(seg(t, T.sink + 0.6, 1.8)) });
  const sinkB = t => ({ tilt: 0.22 * ease.state(seg(t, T.mine + 0.3, 1.2)), sink: ease.state(seg(t, T.mine + 0.6, T.min55 + 0.6 - T.mine)) });
  const minutes = t => Math.floor(Fx.jessop.britannicMin * seg(t, T.mine, T.min55 + 0.3 - T.mine));

  // ——— kamera ———
  const S0 = { c: [-12, 46], r: 420, cy: 1160 }, S0b = { c: [-32, 43], r: 420, cy: 1160 };
  const segs = [
    { t0: 0, t1: 0.001, to: t => ({ ...S0, c: [-12 + 4 * seg(t, 0, T.sail), 46 + 2 * seg(t, 0, T.sail)], r: S0.r * (1 + 0.03 * ease.enter(seg(t, 0, 0.6)) + 0.02 * seg(t, 0.6, T.sail)) }) },
    { t0: T.sail - 0.5, t1: T.sail + 0.9, to: t => ({ c: [-1.5, 50.55], r: 3600 * (1 + 0.1 * seg(t, T.sail + 0.9, T.twin - T.sail)), cy: 1060 }) },
    { t0: T.twin - 0.2, t1: T.twin + 1.2, to: t => ({ c: geoInterpolate([-22, 47.5], pointAt(R_TIT, titS(t)))(0.3), r: 1150, cy: 1080 }) },
    { t0: T.berg - 0.7, t1: T.berg + 0.5, to: t => ({ c: [-49.3, 42.6], r: 2600 * (1 + 0.12 * seg(t, T.berg + 0.5, T.aeg0 - T.berg)), cy: 1060 }) },
    { t0: T.aeg0, t1: T.aeg1, to: t => ({ c: [19.8 + 1.5 * seg(t, T.aeg1, T.whip0 - T.aeg1), 39.0], r: 2300 * (1 + 0.1 * seg(t, T.aeg1, T.whip0 - T.aeg1)), cy: 1080 }) },
    { t0: T.whip0, t1: T.whip1, to: t => ({ c: [131.25 - 0.3 * seg(t, T.whip1, T.cmp0 - T.whip1), 33.55], r: 5200 * (1 + 0.1 * seg(t, T.whip1, T.plate1 - T.whip1) + 0.08 * seg(t, T.plate1x, T.plate2 - T.plate1x)), cy: 1080 }) },
    // takvim levhasının arkasında başa dönülür; döngüde küre kare 0'daki gibidir
    { t0: T.cmp0 + 0.8, t1: T.cmp0 + 2.0, to: () => S0b },
    // soruda takvim çekilir; küre yavaşça kare 0'daki konumuna döner (döngü dikişinde aynı yön)
    { t0: T.ask, t1: D - 0.04, to: () => S0 },
  ];
  const cam = t => camAt(t, S0, segs);

  // haritada gemi simgesi: kâğıt hale + yan görünüş (yönü rotaya göre)
  function shipOnMap(p, t, opt) {
    if (!G.visible(p)) return null;
    const q = G.proj(p);
    ctx.save(); ctx.translate(q[0], q[1] + Math.sin(t * 2.2) * 2);
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -14, opt.size * 0.56, opt.size * 0.17, 0, 0, Math.PI * 2); ctx.fill();
    if (opt.flip) ctx.scale(-1, 1);
    // dalga çizgisi: geminin altında
    ctx.beginPath(); for (let x = -opt.size * 0.55; x <= opt.size * 0.55; x += 4) { const y = 1 + Math.sin(x * 0.18 + t * 3) * 1.5; x === -opt.size * 0.55 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink; ctx.stroke();
    if (opt.cruiser) drawCruiser(ctx, CRUISER_CARD, {}, opt.size);
    else drawLiner(ctx, LINER_CARD, { livery: opt.livery || 'star', smoke: opt.smoke === false ? null : t, tilt: opt.tilt || 0, sink: opt.sink || 0, dent: opt.dent || 0 }, opt.size);
    ctx.restore();
    return q;
  }

  // ——— kâğıt levhalar: alttan kayarak gelir, çıkışta aşağı iner ———
  const plate = (t, a, b) => t < a ? 0 : t < b ? ease.state(seg(t, a, 0.75)) : 1 - ease.state(seg(t, b, 0.6));
  const rnd = mulberry32(36);
  // Hiroşima: deltayı oluşturan nehir kolları; Nagazaki: kuzeyden güneye uzanan liman ve vadi
  const rivers = Array.from({ length: 6 }, (_, i) => { const x0 = 300 + i * 95 + rnd() * 30, ph = rnd() * 6; return Array.from({ length: 30 }, (_, k) => [x0 + Math.sin(k * 0.35 + ph) * 22 + k * (i - 2.5) * 1.6, 760 + k * 22]); });
  const harbor = [[470, 1420], [500, 1300], [520, 1210], [548, 1140], [560, 1080], [585, 1010], [600, 940], [610, 860], [640, 760], [700, 760], [690, 860], [670, 950], [650, 1030], [628, 1100], [610, 1180], [600, 1260], [598, 1420]];
  const blocks = Array.from({ length: 140 }, () => [140 + rnd() * 800, 770 + rnd() * 630, 10 + rnd() * 16, 8 + rnd() * 12]);
  function plateCity(t, k, which) {
    if (k <= 0) return null;
    const top = lerp(1920, STAGE_TOP, k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, 1920 - top); ctx.clip(); ctx.translate(0, top - STAGE_TOP);
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    const a = which === 1 ? T.plate1 : T.plate2, b = which === 1 ? T.plate1x : T.cmp0, km = which === 1 ? T.km1 : T.km2, bomb = which === 1 ? T.bomb1 : T.bomb2;
    // levha boyunca patlama noktasına doğru yavaş yaklaşma (%12): hiçbir karede donmaz
    ctx.save(); { const z = 1 + 0.12 * seg(t, a + 0.75, b - a - 0.75); ctx.translate(CITY.x, CITY.y); ctx.scale(z, z); ctx.translate(-CITY.x, -CITY.y); }
    // şehir dokusu: sokak blokları (seyrek), su yolları
    ctx.fillStyle = 'rgba(28,27,24,0.13)'; for (const [x, y, w, h] of blocks) { if (which === 2 && x > 455 && x < 715) continue; ctx.fillRect(x, y, w, h); }
    ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (which === 1) for (const P of rivers) { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 9; ctx.strokeStyle = C.paper; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
    else { ctx.beginPath(); harbor.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill(); ctx.save(); ctx.clip(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.1; for (let y = 760; y < 1430; y += 7) { ctx.beginPath(); ctx.moveTo(440, y); ctx.lineTo(720, y); ctx.stroke(); } ctx.restore(); ctx.beginPath(); harbor.forEach((p, i) => (i && i !== 9 ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 2.2; ctx.strokeStyle = C.ink; ctx.stroke(); }
    // halkalar: 1, 2, 3 km (3 km 'üç' kelimesinde koyulaşır)
    const hk = ease.enter(seg(t, km - 0.1, 0.4));
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath(); ctx.arc(CITY.x, CITY.y, r * CITY.km, 0, Math.PI * 2);
      ctx.setLineDash(r === 3 && hk > 0 ? [] : [8, 7]); ctx.lineWidth = r === 3 ? 2 + 2.5 * hk : 2; ctx.strokeStyle = r === 3 && hk > 0.5 ? C.ink : C.graphite; ctx.stroke(); ctx.setLineDash([]);
      setFont(ctx, F.mono(30)); const lb = r + ' km', tw = ctx.measureText(lb).width, lx = CITY.x + r * CITY.km * 0.707, ly = CITY.y - r * CITY.km * 0.707;
      ctx.fillStyle = C.paper; ctx.fillRect(lx - tw / 2 - 8, ly - 22, tw + 16, 40); ctx.fillStyle = r === 3 && hk > 0.5 ? C.ink : C.graphite; ctx.textAlign = 'center'; ctx.fillText(lb, lx, ly + 10);
    }
    // patlama noktası
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(CITY.x - 12, CITY.y - 12); ctx.lineTo(CITY.x + 12, CITY.y + 12); ctx.moveTo(CITY.x + 12, CITY.y - 12); ctx.lineTo(CITY.x - 12, CITY.y + 12); ctx.stroke();
    // şok dalgası: patlama kelimesinde merkezden çıkar, 0,7 sn'de 3 km'ye ulaşır
    if (t >= bomb) {
      const u = (t - bomb) / 0.7;
      for (let j = 0; j < 3; j++) { const rr = (u - j * 0.12) * 3 * CITY.km; if (rr <= 0 || rr > 4.6 * CITY.km) continue; ctx.beginPath(); ctx.arc(CITY.x, CITY.y, rr, 0, Math.PI * 2); ctx.lineWidth = 5 - j * 1.4; ctx.globalAlpha = clamp01(1.4 - rr / (4.6 * CITY.km)); ctx.strokeStyle = C.ink; ctx.stroke(); ctx.globalAlpha = 1; }
      // patlama anında kâğıt beyazlaması (0,35 sn): her şey ışıkta kaybolur
      const fl = 1 - seg(t, bomb, 0.35); if (fl > 0) { ctx.fillStyle = `rgba(244,238,225,${0.85 * fl})`; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); }
    }
    // Yamaguchi: 3 km halkasında (Hiroşima'da güneybatı, Nagazaki'de güneyde Mitsubishi bürosu)
    const ang = which === 1 ? Math.PI * 0.75 : Math.PI * 0.42;
    const fx = CITY.x + Math.cos(ang) * 3 * CITY.km, fy = CITY.y + Math.sin(ang) * 3 * CITY.km;
    const hit = t >= bomb + 0.7, walking = which === 1 && t < bomb + 0.7;
    const wx = walking ? fx - 26 * (1 - seg(t, a + 0.75, bomb + 0.7 - a - 0.75)) : fx;
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(wx, fy - 40, 30, 52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(wx, fy + 8); drawYamaguchi(ctx, YAMA_CARD, { walk: walking ? t : null, arms: hit && t < bomb + 2.2 ? 'shield' : which === 2 && t < bomb ? 'gesture' : 'case', bandage: which === 2 ? 1 : ease.state(seg(t, bomb + 1.4, 0.6)) }, 96); ctx.restore();
    if (which === 2) { ctx.save(); ctx.translate(wx + 52, fy + 8); ctx.scale(-1, 1); drawYamaguchi(ctx, YAMA_CARD, { arms: 'down' }, 92); ctx.restore(); }
    ctx.restore();
    // şehir adı (yakınlaşmanın dışında: üst banda kaymaz)
    setFont(ctx, F.mono(32)); ctx.textAlign = 'left'; const nm = which === 1 ? 'HİROŞİMA · 6 AĞUSTOS, 08.15' : 'NAGAZAKİ · 9 AĞUSTOS, 11.02';
    ctx.fillStyle = C.paper; ctx.fillRect(SAFE.x0 - 6, 742, ctx.measureText(nm).width + 12, 42); ctx.fillStyle = C.ink; ctx.fillText(nm, SAFE.x0, 774);
    ctx.restore();
    return [wx, fy - 40];
  }

  // ——— ortak takvim levhası (doruk) ———
  const days = d => TL.x0 + (TL.x1 - TL.x0) * d / Fx.jessop.spanDays;
  const SHIPS = [[0, 'OLYMPIC', 'EYL 1911', 'star', 0], [208, 'TİTANİK', 'NİS 1912', 'star', 1], [Fx.jessop.spanDays, 'BRITANNIC', 'KAS 1916', 'hospital', 0]];
  function calendar(t) {
    if (t < T.cmp0 || t >= T.ask) return;
    const out = t >= T.ask - 0.45, k = out ? 1 - ease.exit(seg(t, T.ask - 0.45, 0.45)) : ease.state(seg(t, T.cmp0, 0.6));
    if (out) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.restore(); } else { ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k); }
    if (k < 0.9 && !out) return;
    // soruya geçişte içerik levhayla birlikte söner (tek karede kaybolmaz)
    ctx.save(); ctx.globalAlpha = out ? k : 1; ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // kıyas boyunca Yamaguchi'nin çizgisine doğru yavaş yaklaşma (%12)
    const z = 1 + 0.16 * seg(t, T.cmp0 + 0.6, T.ask - T.cmp0 - 0.6), zx = TL.x0 + 40, zy = TL.yB - 60;
    ctx.translate(zx, zy); ctx.scale(z, z); ctx.translate(-zx, -zy);
    const red = t >= T.hero - 0.02 && t < T.ask;
    // A: Violet — eksen çizilir, gemiler sırayla iner
    setFont(ctx, F.mono(32)); ctx.textAlign = 'left'; revealText(ctx, 'VIOLET · 3 KAZA', SAFE.x0, 846, 32, ease.enter(seg(t, T.cmp0 + 0.4, 0.4)), C.graphite);
    const ua = ease.state(seg(t, T.cmp0 + 0.5, 0.9));
    ctx.beginPath(); ctx.moveTo(TL.x0, TL.yA); ctx.lineTo(lerp(TL.x0, TL.x1, ua), TL.yA); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let y = 1912; y <= 1916; y++) { const x = days((Date.UTC(y, 0, 1) - Date.UTC(1911, 8, 20)) / 864e5); if (x > lerp(TL.x0, TL.x1, ua)) continue; ctx.beginPath(); ctx.moveTo(x, TL.yA - 10); ctx.lineTo(x, TL.yA + 10); ctx.lineWidth = 2; ctx.stroke(); setFont(ctx, F.mono(26)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center'; ctx.fillText(String(y), x, TL.yA + 104); }
    SHIPS.forEach(([d, nm, dt, liv, tier], i) => {
      const s0 = T.cmp0 + 0.9 + i * 0.45, u = ease.enter(seg(t, s0, 0.5)); if (u <= 0) return;
      const x = days(d);
      ctx.beginPath(); ctx.arc(x, TL.yA, 8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      ctx.save(); ctx.translate(x, TL.yA - 18 - 30 * (1 - u)); ctx.globalAlpha = u; drawLiner(ctx, LINER_CARD, { livery: liv, smoke: t }, 80); ctx.restore();
      setFont(ctx, F.mono(28)); ctx.textAlign = i === 0 ? 'left' : i === 2 ? 'right' : 'left'; ctx.fillStyle = C.ink;
      const lx = i === 0 ? x - 8 : i === 2 ? x + 8 : x - 8, ly = TL.yA + 38 + tier * 34;
      revealText(ctx, nm + ' · ' + dt, lx, ly, 28, u, C.ink, ctx.textAlign);
    });
    // aralık: 1.889 gün
    const us = ease.enter(seg(t, T.span - 0.2, 0.5));
    if (us > 0) { const yb = TL.yA + 128; ctx.beginPath(); ctx.moveTo(TL.x0, yb - 12); ctx.lineTo(TL.x0, yb); ctx.lineTo(lerp(TL.x0, TL.x1, us), yb); if (us > 0.98) ctx.lineTo(TL.x1, yb - 12); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke();
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.paper; const lb = '1.889 gün · 5 yıl', tw = ctx.measureText(lb).width; ctx.fillRect(500 - tw / 2 - 10, yb - 20, tw + 20, 40); revealText(ctx, lb, 500, yb + 12, 32, us, C.ink, 'center'); }
    // B: Yamaguchi — aynı ölçekte boş eksen; 3 gün = 1,2 px
    const ub = ease.enter(seg(t, T.yama - 0.1, 0.5));
    if (ub > 0) {
      revealText(ctx, 'YAMAGUCHI · 2 BOMBA', SAFE.x0, TL.yB - 100, 32, ub, red ? C.red : C.graphite);
      ctx.beginPath(); ctx.moveTo(TL.x0 + 30, TL.yB); ctx.lineTo(lerp(TL.x0 + 30, TL.x1, ub), TL.yB); ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); ctx.setLineDash([]);
      const w3 = Math.max(1.6, days(3) - TL.x0);
      ctx.fillStyle = red ? C.red : C.ink; ctx.fillRect(TL.x0, TL.yB - 34, w3, 68);
      ctx.beginPath(); ctx.arc(TL.x0 + w3 / 2, TL.yB, 26, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke();
      if (t >= T.hero - 0.02) { const pop = spring(t - T.hero, 120, 24); setFont(ctx, F.mono(36)); ctx.textAlign = 'left'; ctx.globalAlpha = Math.min(1, pop * 1.2); const lb = '← 3 gün', tw = ctx.measureText(lb).width; ctx.fillStyle = C.paper; ctx.fillRect(TL.x0 + 34, TL.yB - 70, tw + 16, 44); ctx.fillStyle = red ? C.red : C.ink; ctx.fillText(lb, TL.x0 + 42, TL.yB - 38); ctx.globalAlpha = 1; }
    }
    ctx.restore();
    return [TL.x0 + 1, TL.yB];
  }

  // ——— büyüteç ———
  const stars = Array.from({ length: 18 }, () => [rnd(), rnd()]);
  function sea(t, y0, amp = 4, rows = 4) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    for (let row = 0; row < rows; row++) { const y = y0 + row * 18, sp = 40, off = (t * 40 * (1 + row * 0.3)) % sp; ctx.beginPath(); for (let x = -124 - sp + off; x < 124 + sp; x += 4) { const yy = y + Math.sin((x - off) * 0.16 + t * 3 + row) * amp * 0.4; x === -124 - sp + off ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
  }
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    const night = kind === 'berg' || kind === 'sinking' || kind === 'boat16';
    if (night) { ctx.fillStyle = C.ink; for (const [a, b] of stars) ctx.fillRect(-120 + a * 240, -120 + b * 120, 3, 3); }
    if (kind === 'liner' || kind === 'hospital') {
      sea(t, 48);
      ctx.save(); ctx.translate(-10 + Math.sin(t * 0.8) * 6, 52 + Math.sin(t * 1.6) * 2); drawLiner(ctx, LINER_CARD, { livery: kind === 'hospital' ? 'hospital' : 'star', smoke: t }, 250); ctx.restore();
    } else if (kind === 'ram') {
      // Olympic'in kıçı (sol, büyük) ve sağdan bindiren Hawke; çarpmada yarık açılır, iki gemi sarsılır
      sea(t, 60);
      const u = ease.state(seg(t, T.ram - 1.2, 1.2)), hitk = t >= T.ram ? Math.exp(-(t - T.ram) * 5) * Math.sin((t - T.ram) * 40) : 0;
      ctx.save(); ctx.translate(-40 + hitk * 3, 62); drawLiner(ctx, LINER_CARD, { livery: 'star', smoke: t, dent: ease.enter(seg(t, T.ram, 0.3)) }, 520); ctx.restore();
      ctx.save(); ctx.translate(lerp(230, 118, u) + hitk * -4, 70); ctx.scale(-1, 1); drawCruiser(ctx, CRUISER_CARD, {}, 200); ctx.restore();
    } else if (kind === 'berg' || kind === 'sinking') {
      sea(t, 56);
      if (kind === 'berg') {
        const u = seg(t, L.l05.t0 - 0.2, T.sink - L.l05.t0 + 0.2);
        ctx.save(); ctx.translate(lerp(-150, 70, u), 58); drawIceberg(ctx, 120); ctx.restore();
        ctx.save(); ctx.translate(lerp(40, -40, u), 56); ctx.scale(-1, 1); drawLiner(ctx, LINER_CARD, { livery: 'star', smoke: t }, 250); ctx.restore();
      } else {
        const s = sinkT(t); ctx.save(); ctx.translate(-10, 56); ctx.scale(-1, 1); drawLiner(ctx, LINER_CARD, { livery: 'star', tilt: s.tilt * 1.4, sink: s.sink * 0.9 }, 270); ctx.restore();
      }
    } else if (kind === 'boat16') {
      sea(t, 60);
      // arka planda batan geminin kıçı; önde 16 numaralı filika uzaklaşır
      ctx.save(); ctx.translate(70, 60); ctx.scale(-1, 1); drawLiner(ctx, LINER_CARD, { livery: 'star', tilt: 0.55, sink: 0.5 + 0.35 * seg(t, T.dead, T.aeg0 - T.dead) }, 300); ctx.restore();
      ctx.save(); ctx.translate(-20 - 40 * seg(t, T.dead, T.aeg0 - T.dead), 62 + Math.sin(t * 1.8) * 2); drawLifeboat(ctx, { oar: t, n: Fx.jessop.lifeboat }, 150); ctx.restore();
    } else if (kind === 'mine') {
      sea(t, 50);
      const s = sinkB(t), u = seg(t, T.mine, 0.9);
      ctx.save(); ctx.translate(-10, 52); drawLiner(ctx, LINER_CARD, { livery: 'hospital', tilt: s.tilt * 1.2, sink: s.sink * 0.8, smoke: s.sink < 0.3 ? t : null }, 270); ctx.restore();
      if (t < T.mine) { ctx.save(); ctx.translate(lerp(60, 30, seg(t, L.l07.t0, T.mine - L.l07.t0)), 96); drawMine(ctx, 34); ctx.restore(); }
      // su sütunu: patlama anında yükselir, dağılır
      if (u > 0 && u < 1) { ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.16, d = 120 * ease.enter(u), x = 40 + Math.cos(a) * d * 0.6, y = 48 + Math.sin(a) * d; ctx.beginPath(); ctx.arc(x, y, 10 * (1 - u) + 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
    } else if (kind === 'prop') {
      // su altı: dönen pervane, filika yaklaşır; atlama kelimesinde Violet sudan uzağa sıçrar
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; for (let y = -124; y < 124; y += 7) { ctx.beginPath(); ctx.moveTo(-124, y); ctx.lineTo(124, y); ctx.stroke(); }
      ctx.save(); ctx.translate(60, 30); drawPropeller(ctx, t * 5, 170); ctx.restore();
      const u = ease.state(seg(t, L.l08.t0, T.jump - L.l08.t0 + 0.4));
      ctx.save(); ctx.translate(lerp(-90, 10, u), -60); ctx.rotate(0.15 * u); drawLifeboat(ctx, { oar: t * 1.5, n: 0, seated: 3 }, 150); ctx.restore();
      if (t >= T.jump) { const j = ease.enter(seg(t, T.jump, 0.9)); ctx.save(); ctx.translate(lerp(-20, -50, j), lerp(-40, 70, j) - Math.sin(j * Math.PI) * 30); ctx.rotate(-0.5 * (1 - j) - 0.15); drawViolet(ctx, VIOLET_CARD, { arms: 'up', bandage: t >= T.saved ? 1 : 0 }, 110); ctx.restore(); }
    } else if (kind === 'walk' || kind === 'flash' || kind === 'alive' || kind === 'office' || kind === 'flash2') {
      // sokak: alçak çatılar; Yamaguchi yürür; patlamada ışıktan korunur
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-124, 92); ctx.lineTo(124, 92); ctx.stroke();
      if (kind === 'office' || kind === 'flash2') { ctx.fillStyle = C.paper; ctx.fillRect(-112, -96, 92, 110); ctx.beginPath(); ctx.rect(-112, -96, 92, 110); ctx.moveTo(-66, -96); ctx.lineTo(-66, 14); ctx.moveTo(-112, -41); ctx.lineTo(-20, -41); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-100, 40); ctx.lineTo(-10, 40); ctx.moveTo(-90, 40); ctx.lineTo(-90, 92); ctx.moveTo(-20, 40); ctx.lineTo(-20, 92); ctx.lineWidth = 4; ctx.stroke(); }
      else for (let i = 0; i < 4; i++) { const x = -124 + i * 70 - ((t * 10) % 70); ctx.beginPath(); ctx.moveTo(x, 92); ctx.lineTo(x, 20); ctx.lineTo(x + 30, -5); ctx.lineTo(x + 60, 20); ctx.lineTo(x + 60, 92); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); }
      const bomb = kind === 'flash2' ? T.bomb2 : T.bomb1, flash = (kind === 'flash' || kind === 'flash2') && t >= bomb;
      if (flash) { const u = seg(t, bomb, 1.2); ctx.save(); ctx.globalAlpha = 1 - u * 0.7; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(-150 + Math.cos(a) * 20, -110 + Math.sin(a) * 20); ctx.lineTo(-150 + Math.cos(a) * (120 + 200 * u), -110 + Math.sin(a) * (120 + 200 * u)); ctx.stroke(); } ctx.restore(); const fl = 1 - seg(t, bomb, 0.35); if (fl > 0) { ctx.fillStyle = `rgba(244,238,225,${0.9 * fl})`; ctx.fillRect(-130, -130, 260, 260); } }
      const pose = kind === 'walk' ? { walk: t, arms: 'case' } : flash ? { arms: 'shield', bandage: kind === 'flash2' ? 1 : ease.state(seg(t, bomb + 1.4, 0.6)) } : kind === 'office' ? { arms: 'gesture', bandage: 1 } : { bandage: 1 };
      ctx.save(); ctx.translate(kind === 'office' || kind === 'flash2' ? 0 : 0, 92); drawYamaguchi(ctx, YAMA_CARD, pose, 190); ctx.restore();
      if (kind === 'office' || kind === 'flash2') { ctx.save(); ctx.translate(78, 92); ctx.scale(-1, 1); drawYamaguchi(ctx, YAMA_CARD, { arms: 'down' }, 172); ctx.restore(); }
    } else if (kind === 'train') {
      // tren penceresi: dışarıda akan tarlalar ve direkler; sargılı Yamaguchi
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const x = 140 - ((t * 160 + i * 60) % 360); ctx.beginPath(); ctx.moveTo(x, -60); ctx.lineTo(x, 30); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-124, 30); ctx.lineTo(124, 30); ctx.stroke();
      ctx.fillStyle = C.paper; ctx.fillRect(-124, 50, 248, 80); ctx.beginPath(); ctx.rect(-110, -100, 220, 140); ctx.lineWidth = 6; ctx.stroke();
      ctx.save(); ctx.translate(-30, 130); drawYamaguchi(ctx, YAMA_CARD, { sit: true, bandage: 1 }, 170); ctx.restore();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(58); const blinks = []; for (let b = 1.4; b < D; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.ram, 'sasirma', 'saskin'], [T.ram + 1.4, 'ayakta', 'notr'], [T.name, 'ayakta', 'dusunceli'], [T.sink, 'sasirma', 'saskin'], [T.sink + 1.6, 'ayakta', 'dusunceli'],
    [T.boat, 'ayakta', 'mutlu'], [T.mine, 'sasirma', 'saskin'], [T.saved, 'ayakta', 'mutlu'], [L.l09.t0, 'ayakta', 'notr'], [L.l11.t0, 'ayakta', 'dusunceli'], [T.bomb1, 'sasirma', 'saskin'], [T.bomb1 + 1.6, 'ayakta', 'dusunceli'], [T.bomb2, 'sasirma', 'saskin'], [T.bomb2 + 1.6, 'ayakta', 'dusunceli'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'dusunceli'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.name + 0.2, T.name + 1.6, 'Titanik mi?!'], [T.hero + 0.1, T.hero + 1.8, '3 gün mü?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      // doruk balonu takvimin altında, rayın üstünde kalır (aralık yazısına binmez)
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, hb = text === '3 gün mü?!', x = hb ? 860 - w : SIFIR.x - 20 - w, y = hb ? SIFIR.y - 236 : SIFIR.y - 310;
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
    // bölünmüş cümle (l16 + l17): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l17' ? L.l16.text + ' ' + ln.text : ln.id === 'l16' ? "Violet'in 3 kazası 5 yıla yayıldı. Ya Yamaguchi?" : ln.text;
    const p = ln.id === 'l17' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42)); revealText(ctx, 'Üç gemi kazasından sağ çıkan kadın mı,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, 'iki atom bombasından sağ çıkan adam mı?', SAFE.x0, 690, 42, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    if (t < L.l09.t0 - 0.06) {
      const n = t >= T.mine ? 3 : t >= T.berg ? 2 : t >= T.ram ? 1 : 0;
      const ship = t < T.twin ? 'OLYMPIC' : t < T.name ? 'İKİZ GEMİ' : t < L.l07.t0 ? 'TİTANİK' : t >= T.mine && t < T.prop ? 'BATIYOR: ' + minutes(t) + ' dk' : 'BRITANNIC';
      row({ label: t < L.l07.t0 ? 'VIOLET JESSOP · HOSTES' : 'VIOLET JESSOP · HEMŞİRE', num: t < T.twin ? '1911' : t < L.l07.t0 ? '1912' : '1916', unit: '', right1: 'KAZA: ' + n, right2: ship, p: Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) });
      return;
    }
    if (t < T.cmp0) {
      const day = t < L.l11.t0 - 0.06 ? null : t < T.train ? 6 : t < L.l13.t0 - 0.06 ? 8 : 9;
      const n = t >= T.bomb2 ? 2 : t >= T.bomb1 ? 1 : 0;
      const place = t >= T.both ? 'HAYATTA' : t < T.train ? 'HİROŞİMA' : t < L.l13.t0 - 0.06 ? 'TRENDE' : 'NAGAZAKİ';
      row({ label: 'TSUTOMU YAMAGUCHI · GEMİ TASARIMCISI', num: day ? String(day) : '1945', unit: day ? 'Ağustos 1945' : '', right1: 'BOMBA: ' + n, right2: place, p: Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) { row({ label: 'AYNI TAKVİMDE · VIOLET', num: nf0.format(Math.round(Fx.jessop.spanDays * ease.state(seg(t, T.cmp0 + 0.5, 0.9)))), unit: 'gün', right1: t >= T.yama - 0.1 ? 'YAMAGUCHI: ?' : '', right2: '3 KAZA', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.ask) { row({ label: 'YAMAGUCHI · 2 BOMBA', num: '3', unit: 'gün', red: true, right1: 'VIOLET: 1.889 gün', right2: '3 KAZA · 5 YIL' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    let fs = 80; const q = 'Violet mi, Yamaguchi mi?'; setFont(ctx, F.head(fs)); while (ctx.measureText(q).width > SAFE.x1 - SAFE.x0 && fs > 50) { fs -= 2; setFont(ctx, F.head(fs)); }
    revealText(ctx, q, SAFE.x0, 672, fs, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); G.setCam(k);
    G.draw();
    let at = null;
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // A1: Olympic (Southampton → Solent), Hawke bindirir
    if (t >= T.sail && t < T.twin) {
      const s = olyS(t); G.line(slice(R_OLY, 0, Math.max(0.01, s)), { w: 3, dash: [8, 6] });
      G.placeLabel(SOUTHAMPTON, 'SOUTHAMPTON', seg(t, T.sail, 0.4), 18, -40, C.ink, 'right');
      const q = shipOnMap(pointAt(R_OLY, s), t, { size: 120, dent: ease.enter(seg(t, T.ram, 0.3)) }); if (q) at = q;
      if (t >= T.ram - 1.0) { const hq = G.proj(COWES), u = ease.state(seg(t, T.ram - 1.0, 1.0)); if (G.visible(COWES)) { ctx.save(); ctx.translate(hq[0] + lerp(140, 70, u), hq[1] + 30); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -10, 50, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.scale(-1, 1); drawCruiser(ctx, CRUISER_CARD, {}, 80); ctx.restore(); } }
      if (t >= T.ram) G.ringAt(COWES, seg(t, T.ram, 0.6), 70);
    }
    // A2: Titanik (Southampton → Cherbourg → Cobh → Kuzey Atlantik), buzdağı, batış, filika
    if (t >= T.twin - 0.2 && t < T.aeg0 + 0.4) {
      const s = titS(t); G.line(slice(R_TIT, 0, s), { w: 3, dash: [8, 6] });
      const sk = sinkT(t);
      const q = shipOnMap(pointAt(R_TIT, s), t, { size: 130, flip: true, tilt: sk.tilt, sink: sk.sink, smoke: sk.sink < 0.2 }); if (q) at = q;
      if (t >= T.name - 0.1) { const qq = G.visible(pointAt(R_TIT, s)) ? G.proj(pointAt(R_TIT, s)) : null; if (qq && sk.sink < 0.95) { setFont(ctx, F.mono(32)); ctx.textAlign = 'center'; const lb = 'TİTANİK', tw = ctx.measureText(lb).width, u = ease.enter(seg(t, T.name - 0.1, 0.35)); ctx.globalAlpha = u * (1 - sk.sink); ctx.fillStyle = C.paper; ctx.fillRect(qq[0] - tw / 2 - 8, qq[1] - 96, tw + 16, 40); ctx.fillStyle = C.ink; ctx.fillText(lb, qq[0], qq[1] - 66); ctx.globalAlpha = 1; } }
      if (t >= T.berg - 0.8 && G.visible(WRECK)) { const bq = G.proj(WRECK); ctx.save(); ctx.translate(bq[0] - 78, bq[1] + 4); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -14, 34, 22, 0, 0, Math.PI * 2); ctx.fill(); drawIceberg(ctx, 52 * ease.enter(seg(t, T.berg - 0.8, 0.5))); ctx.restore(); }
      if (t >= T.sink) G.ringAt(WRECK, seg(t, T.sink, 0.6), 80);
      if (t >= T.boat - 0.2 && G.visible(WRECK)) { const bq = G.proj(WRECK), u = seg(t, T.boat - 0.2, T.aeg0 - T.boat + 0.2); ctx.save(); ctx.translate(bq[0] + 40 + 40 * u, bq[1] + 70 + Math.sin(t * 1.8) * 2); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -8, 36, 16, 0, 0, Math.PI * 2); ctx.fill(); drawLifeboat(ctx, { oar: t, seated: 3 }, 60); ctx.restore(); }
      if (t < T.berg - 0.8) G.placeLabel([-42, 55], 'KUZEY ATLANTİK', seg(t, T.twin + 0.6, 0.4), 0, 0, C.ink, 'center', false);
    }
    // A3: Britannic (Napoli → Messina → Kea), mayın
    if (t >= T.aeg0 && t < T.whip0 + 0.3) {
      const s = briS(t); G.line(slice(R_BRI, 0, Math.max(0.5, s)), { w: 3, dash: [8, 6] });
      const sk = sinkB(t);
      const q = shipOnMap(pointAt(R_BRI, s), t, { size: 130, livery: 'hospital', tilt: sk.tilt, sink: sk.sink, smoke: sk.sink < 0.2 }); if (q) at = q;
      if (t >= T.mine) G.ringAt(KEA, seg(t, T.mine, 0.6), 80);
      G.placeLabel([26.6, 40.4], 'EGE DENİZİ', seg(t, T.aeg1, 0.4), 0, 0, C.ink, 'center', false);
      G.placeLabel(NAPLES, 'NAPOLİ', seg(t, T.aeg1, 0.4), 20, -70);
    }
    // B: Japonya — Hiroşima'ya varış, sonra tren Nagazaki'ye
    if (t >= T.whip1 - 0.3 && t < T.cmp0 + 0.6) {
      G.placeLabel(HIROSHIMA, 'HİROŞİMA', seg(t, T.whip1, 0.4), 34, -84);
      G.placeLabel(NAGASAKI, 'NAGAZAKİ', seg(t, T.whip1 + 0.2, 0.4), 22, 54);
      const s = t < T.train ? 0 : railS(t);
      if (s > 0.5) G.line(slice(R_RAIL, 0, s), { w: 4, dash: [10, 7] });
      // Yamaguchi: Hiroşima'da yürür; trende Nagazaki'ye gider
      const p = t < T.train ? HIROSHIMA : pointAt(R_RAIL, s);
      if (G.visible(p)) {
        const qq = G.proj(p); ctx.save(); ctx.translate(qq[0], qq[1] - 10); ctx.fillStyle = C.paper;
        if (t < T.train) { ctx.beginPath(); ctx.ellipse(0, -30, 24, 40, 0, 0, Math.PI * 2); ctx.fill(); drawYamaguchi(ctx, YAMA_CARD, { walk: t, arms: 'case' }, 70); }
        else { ctx.beginPath(); ctx.ellipse(0, -10, 70, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.scale(-1, 1); drawTrain(ctx, t, 140); }
        ctx.restore(); at = qq;
      }
    }
    ctx.restore();
    // levhalar
    const c1 = plateCity(t, plate(t, T.plate1, T.plate1x), 1);
    const c2 = plateCity(t, t >= T.cmp0 + 0.6 ? 0 : plate(t, T.plate2, 1e9), 2);
    if (c1 && t >= T.plate1 + 0.6 && t < T.plate1x) at = c1;
    if (c2 && t >= T.plate2 + 0.6) at = c2;
    calendar(t);
    // büyüteç: satırlara göre
    let kind = null, rk = 1;
    const cutT = L.l09.t0 - 0.06;
    if (t >= L.l02.t0 && t < T.twin) kind = 'ram'; else if (t >= T.twin && t < L.l05.t0) kind = 'liner'; else if (t >= L.l05.t0 && t < T.sink) kind = 'berg'; else if (t >= T.sink && t < T.dead) kind = 'sinking';
    else if (t >= T.dead && t < T.aeg0 + 0.3) kind = 'boat16'; else if (t >= T.aeg0 + 0.3 && t < T.mine - 0.4) kind = 'hospital'; else if (t >= T.mine - 0.4 && t < L.l08.t0) kind = 'mine'; else if (t >= L.l08.t0 && t < cutT) kind = 'prop';
    else if (t >= L.l10.t0 && t < T.bomb1) kind = 'walk'; else if (t >= T.bomb1 && t < T.train) kind = 'flash'; else if (t >= T.train && t < L.l13.t0) kind = 'train'; else if (t >= L.l13.t0 && t < T.bomb2) kind = 'office'; else if (t >= T.bomb2 && t < T.both) kind = 'flash2'; else if (t >= T.both && t < T.cmp0) kind = 'alive';
    // kesmede büyüteç tam kapanır, sonra açılır
    if (t >= cutT - 0.3 && t < L.l10.t0 + 0.3) { const u = seg(t, cutT - 0.3, L.l10.t0 + 0.6 - cutT); rk = u < 0.3 ? 1 - ease.exit(u / 0.3) : u < 0.55 ? 0 : ease.enter((u - 0.55) / 0.45); if (u < 0.3) kind = 'prop'; }
    if (t >= T.cmp0 && t < T.cmp0 + 0.3) { kind = 'alive'; rk = 1 - ease.exit(seg(t, T.cmp0, 0.3)); }
    if (kind && rk > 0.02) roundel(t, kind, ROUND, rk, at);
    // doruk: Yamaguchi'nin 3 günü büyüteçte
    if (t >= T.yama && t < T.ask) magnifier(t, ease.enter(seg(t, T.yama + 0.2, 0.45)) * (1 - ease.exit(seg(t, T.ask - 0.45, 0.4))));
    // kare 0 ve soru: iki balon
    if (t < L.l02.t0) roundel(t, 'alive', ROUND2, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)));
    if (t < L.l02.t0 || t >= T.ask) roundel(t, 'liner', ROUND, t < L.l02.t0 ? 1 : ease.enter(seg(t, T.ask, 0.45)));
    if (t < L.l02.t0 || t >= T.loop0 + 0.3) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.loop0 + 0.3, 0.4));
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kk; ctx.fillRect(ROUND.x - 82, 1084, 164, 42); ctx.fillRect(482 - 82, 1096, 164, 42); ctx.globalAlpha = 1;
      revealText(ctx, '3 GEMİ', ROUND.x, 1116, 34, kk, C.ink, 'center'); revealText(ctx, '2 BOMBA', 482, 1128, 34, kk, C.ink, 'center');
    }
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.6)) : 1;
      roundel(t, 'alive', ROUND2, kin);
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(482 - 100, 1096, 200, 42); ctx.fillRect(ROUND.x - 82, 1084, 164, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'YAMAGUCHI', 482, 1128, 34, kin * kout, C.ink, 'center'); revealText(ctx, 'VIOLET', ROUND.x, 1116, 34, kin * kout, C.ink, 'center');
    }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  // takvim büyüteci: 6–9 Ağustos, dört gün hücresi; iki bomba işareti (dorukta kırmızı)
  function magnifier(t, k) {
    if (k <= 0) return;
    const r = MAG.r * ease.enter(k), red = t >= T.hero - 0.02;
    // ince çizgiden büyütece bağ
    if (k > 0.6) { ctx.beginPath(); ctx.moveTo(TL.x0 + 1, TL.yB + 30); ctx.lineTo(MAG.x - r * 0.55, MAG.y - r * 0.84); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
    ctx.save(); ctx.beginPath(); ctx.arc(MAG.x, MAG.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(MAG.x, MAG.y); ctx.scale(r / MAG.r, r / MAG.r);
    const cw = 34, x0 = -2 * cw;
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * cw; ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(x, -26, cw, 52);
      setFont(ctx, F.mono(24)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(String(6 + i), x + cw / 2, 54);
      if (i === 0 || i === 3) { const s = i === 0 ? 1 : ease.enter(seg(t, T.hero - 0.02, 0.3)); const pop = i === 3 && red ? 1 + 0.15 * Math.sin(Math.min(1, (t - T.hero) * 3) * Math.PI) : 1; ctx.beginPath(); ctx.arc(x + cw / 2, 0, 15 * s * pop, 0, Math.PI * 2); ctx.fillStyle = red ? C.red : C.ink; ctx.fill(); }
    }
    ctx.restore();
    setFont(ctx, F.mono(30)); ctx.globalAlpha = clamp01(k); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText('6–9 AĞUSTOS 1945', MAG.x + r + 20, MAG.y + 10); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(MAG.x, MAG.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = red ? C.red : C.ink; ctx.stroke();
  }
  return { duration: D, timeline: { T }, render };
}

// "Yolculuk" şablonu (Hangisi daha şaşırtıcı?): iki gerçek yolculuk aynı gravür kürede, anlatımla birlikte.
// Kuş Pasifik'i hiç inmeden geçer; adam Şili'den İngiltere'ye yürür. Rota ölçülü çizilir, kamera yolcuyu izler,
// hikâye büyüteci (sol altta yuvarlak detay balonu) yolcunun o anki hâlini gösterir. Sonda aynı saatle kıyas.
// Her şey t'nin saf fonksiyonudur; veri ve ses zamanları sahne kurulurken bir kez yüklenir.
import { geoOrthographic, geoPath, geoGraticule, geoInterpolate, geoDistance } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { GODWIT_CARD, drawGodwit, drawGodwitGlyph, WALKER_CARD, drawWalker } from '../yol_chars.js';
import { buildYolTimeline, birdRoute, walkRoute, travelPlan, pointAt, slice, realKm, WALK, HULL } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const SAFE = { x0: 90, x1: 920 };
const LAND_PAPER = '#F4EEE1';
const STAGE_TOP = 705;
const GLOBE = { cx: 540, cy: 1100 };
const ROUND = { x: 215, y: 1268, r: 124 };
const SIFIR = { x: 872, y: 1412, H: 92 };

export async function makeYolculukRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const get = async u => (await fetch(u)).json();
  const [voice, land50, land10, countries] = await Promise.all([
    get(`../assets/voice/${ep.id}/words.json`),
    get('../node_modules/world-atlas/land-50m.json'),
    get('../node_modules/world-atlas/land-10m.json'),
    get('../node_modules/world-atlas/countries-50m.json'),
  ]);
  const LAND = feature(land50, land50.objects.land), LAND10 = feature(land10, land10.objects.land);
  const BORDERS = mesh(countries, countries.objects.countries, (a, b) => a !== b);
  const GRAT = geoGraticule().step([30, 30])();
  const EQUATOR = { type: 'LineString', coordinates: Array.from({ length: 73 }, (_, i) => [-180 + i * 5, 0]) };

  const tl = buildYolTimeline(ep, voice);
  const { L, W: Wd } = tl;
  const D = tl.duration;
  const BR = birdRoute(), WR = walkRoute();
  const plan = travelPlan(tl, WR);
  const F_ = ep.facts;

  // ——— anlar ———
  const T = {
    pull: L.l03.t0 - 0.05, ring: L.l03.t0 + 0.15,
    land: plan.bird.t1, whip0: L.l04.end + 0.55, whip1: L.l05.t0 + 0.25,
    walk0: plan.wk[0].t, bering0: plan.wk[1].t, bering1: plan.wk[2].t, wait0: plan.waitT[0], wait1: plan.waitT[1],
    caspian: plan.wk[5].t, ist: plan.wk[6].t, manş: plan.wk[7].t, dover: plan.wk[8].t, hull: Wd('l11', 'evine'),
    cmp0: L.l12.t0 - 0.1, clock0: L.l13.t0, clock1: Wd('l13', 'indiğinde', 't1'),
    dive0: L.l13.end + 0.1, morph0: 0, zoom0: 0, hero: L.l14.t0 - 0.04, back0: L.l15.t0 - 0.35, earth: Wd('l15', 'dünya'),
    ask: L.l16.t0, loop0: tl.loop0,
  };

  T.morph0 = T.clock1 + 0.15; T.zoom0 = T.hero + 0.45;

  // ——— kamera: tek dönüşüm {merkez [boylam, enlem], yarıçap r (px), ekran merkezi} ———
  const S0 = { c: [-157, 57], r: 1250, cy: GLOBE.cy };
  const PAC = { c: [160, 8], r: 392, cy: GLOBE.cy };
  const mix = (a, b, u) => ({ c: geoInterpolate(a.c, b.c)(u), r: Math.exp(lerp(Math.log(a.r), Math.log(b.r), u)), cy: lerp(a.cy, b.cy, u), cx: lerp(a.cx ?? GLOBE.cx, b.cx ?? GLOBE.cx, u) });
  const modeAt = t => (t >= T.dover ? 'walk' : plan.walkMode(t));
  const birdS = t => BR.total * seg(t, plan.bird.t0, plan.bird.t1 - plan.bird.t0);
  const birdP = t => pointAt(BR.D, birdS(t));
  // yürüyüşte yakınlık: anlatıma bağlı anahtarlar, aralarında 0,9 sn yumuşak geçiş (log uzayda)
  // [zaman, yarıçap, geçiş süresi]; bekleme ve Dover sonrasında uzun, yavaş yaklaşma (donmuş kare olmaz)
  const rKeys = [[0, 920 / 1.07], [L.l08.t0, 470], [T.bering0 - 0.5, 1150], [T.bering1 + 0.2, 520], [T.wait0 - 0.4, 1050], [T.wait0 + 0.5, 1320, T.wait1 - T.wait0 - 0.5], [T.wait1, 1500], [T.ist + 0.6, 1050], [T.manş - 0.5, 1700], [T.dover + 0.3, 2100, T.cmp0 - T.dover - 0.3]];
  const rWalk = t => { let r = rKeys[0][1]; for (let i = 1; i < rKeys.length; i++) if (t > rKeys[i][0]) r = Math.exp(lerp(Math.log(r), Math.log(rKeys[i][1]), ease.state(seg(t, rKeys[i][0], rKeys[i][2] ?? 0.9)))); return r; };
  const walkP = t => pointAt(WR.D, plan.walkS(t));
  const follow = t => ({ c: walkP(t - 0.3), r: rWalk(t), cy: 1060 });
  const st = s => () => s;
  const PA = WALK[0].p, P53 = pointAt(WR.D, F_.sameClockKm);
  const DIVE = { c: geoInterpolate(PA, P53)(0.5), r: 300 / (F_.sameClockKm / 6371), cy: 1080 };
  const CMP = { c: [-150, -20], r: 392, cy: 1110, cx: 470 };
  // Dünya'nın çevresi: küre bir tam tur döner, adamın yolu ekvatorda bir tur sarılıp devam eder
  const LAP = [T.earth - 0.3, T.ask + 1.6];
  const lapU = t => ease.state(seg(t, LAP[0], LAP[1] - LAP[0]));
  const ROT = t => ({ c: [55 - 220 * lapU(t) - 4 * Math.max(0, t - LAP[1]), 12], r: 392, cy: GLOBE.cy });
  const segs = [
    { t0: 0, t1: T.pull, to: t => ({ ...S0, r: S0.r * (1 + 0.1 * ease.enter(seg(t, 0, T.pull))) }) },  // kanca: kare 0'dan itibaren 1,08x yaklaşma
    { t0: T.pull, t1: T.pull + 1.7, to: t => ({ ...PAC, c: geoInterpolate(PAC.c, birdP(t))(0.18) }) },
    { t0: T.land - 0.2, t1: T.land + 0.9, to: st({ c: [158, -33], r: 400, cy: 1130 }) },
    { t0: T.whip0, t1: T.whip1, to: t => ({ c: [-72, -46], r: 920 * (1 + 0.07 * seg(t, T.whip1, T.walk0 - T.whip1)), cy: 1060 }) },
    { t0: T.walk0 - 0.3, t1: T.walk0 + 0.6, to: t => { const f = follow(t); return { ...f, r: f.r * 1.07 }; } },
    { t0: T.cmp0 - 0.3, t1: T.cmp0 + 1.9, to: t => ({ ...CMP, r: CMP.r * (1 + 0.07 * seg(t, T.cmp0 + 1.9, T.morph0 - T.cmp0 - 1.9)) }) },
    { t0: T.morph0, t1: T.morph0 + 0.9, to: t => ({ ...CMP, r: 300 * (1 + 0.1 * seg(t, T.morph0 + 0.9, T.back0 - T.morph0 - 0.9)), c: [-150 + 14 * seg(t, T.morph0 + 0.9, T.back0 - T.morph0 - 0.9), -20], cy: 1250 }) },
    { t0: T.back0, t1: T.back0 + 1.2, to: ROT },
    { t0: T.loop0, t1: D - 0.08, to: st(S0) },
  ];
  function cam(t) {
    let prev = st(S0);
    for (const s of segs) {
      if (t < s.t0) return prev(t);
      if (t < s.t1) { const a = prev(t), b = s.to(t), u = ease.state(seg(t, s.t0, s.t1 - s.t0)); return mix(a, b, u); }
      prev = s.to;
    }
    return prev(t);
  }

  const proj = geoOrthographic().clipAngle(90).precision(0.4);
  const path = geoPath(proj, ctx);
  const setCam = k => proj.rotate([-k.c[0], -k.c[1]]).scale(k.r).translate([k.cx ?? GLOBE.cx, k.cy]);
  const visible = (k, p) => geoDistance(k.c, p) < Math.PI / 2 - 0.02;

  // ——— gravür küre ———
  function globe(k, t) {
    const r = k.r, cx = k.cx ?? GLOBE.cx, cy = k.cy;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // deniz: yatay ince çizgiler (bakır gravür okyanusu)
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineWidth = 1.1;
    const y0 = Math.max(STAGE_TOP, cy - r), y1 = Math.min(1920, cy + r);
    for (let y = Math.ceil(y0 / 7) * 7; y < y1; y += 7) { ctx.beginPath(); ctx.moveTo(Math.max(0, cx - r), y + 0.5); ctx.lineTo(Math.min(W, cx + r), y + 0.5); ctx.stroke(); }
    // enlem-boylam ağı
    ctx.beginPath(); path(GRAT); ctx.strokeStyle = 'rgba(139,133,119,0.7)'; ctx.lineWidth = 1; ctx.stroke();
    // kıyı payı: karanın çevresinde deniz çizgileri açılır (eski atlas kıyı halesi)
    const LD = r > 9000 ? LAND10 : LAND;
    ctx.beginPath(); path(LD); ctx.lineWidth = 16; ctx.strokeStyle = C.paper; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = LAND_PAPER; ctx.fill();
    ctx.beginPath(); path(BORDERS); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(139,133,119,0.85)'; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); path(LD); ctx.lineWidth = 1.7; ctx.strokeStyle = C.ink; ctx.stroke();
    // gölge hilali: sağ altta yoğun çapraz tarama (ışık sol üstten); gradyan yok
    if (r < 2600) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 1.04, 0, Math.PI * 2); ctx.clip('evenodd');
      ctx.strokeStyle = 'rgba(28,27,24,0.28)'; ctx.lineWidth = 1;
      for (let d = -2 * r; d < 2 * r; d += 6) { ctx.beginPath(); ctx.moveTo(cx + d - r, cy - r); ctx.lineTo(cx + d + r, cy + r); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    // küre konturu
    if (r < 2600) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.restore();
  }

  // ——— rota çizimi ———
  function line(coords, { color = C.ink, w = 4, dash = null } = {}) {
    if (coords.length < 2) return;
    ctx.beginPath(); path({ type: 'LineString', coordinates: coords });
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  const STYLE = { walk: {}, ice: { dash: [12, 7] }, swim: { dash: [3, 8], w: 4.5 }, link: { color: C.graphite, dash: [2, 7], w: 3 } };
  function walkLine(s1, s0 = 0, override) {
    for (const p of WR.parts) {
      const a = Math.max(p.s0, s0), b = Math.min(p.s1, s1);
      if (b > a) line(slice(WR.D, a, b), { ...STYLE[p.kind], ...override });
    }
  }
  // hedef halkası: elle çizilmiş gibi açılan daire (uçları hafif binişik)
  let CAM = S0;
  function ringAt(p, u, rad = 26, color = C.ink) {
    if (u <= 0 || !visible(CAM, p)) return; const q = proj(p); if (!q) return;
    ctx.beginPath(); ctx.arc(q[0], q[1], rad, -2.2, -2.2 + Math.PI * 2.15 * ease.enter(u)); ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke();
  }
  function placeLabel(p, text, u, dx = 18, dy = -14, color = C.ink, align = 'left') {
    if (u <= 0 || !visible(CAM, p)) return; const q = proj(p); if (!q || q[1] + dy < STAGE_TOP + 44 || q[0] < 20 || q[0] > W - 20) return;
    ctx.save(); ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    setFont(ctx, F.mono(34));
    { const tw0 = ctx.measureText(text).width; if (align === 'right' && q[0] - dx - tw0 < 40) align = 'left'; else if (align === 'left' && q[0] + dx + tw0 > W - 40) align = 'right'; }
    ctx.textAlign = align;
    // iki yana da sığmazsa ekranın içine kaydırılır (40 px pay)
    let x = align === 'right' ? q[0] - dx : q[0] + dx;
    { const tw1 = ctx.measureText(text).width; x = align === 'left' ? Math.max(40, Math.min(x, W - 40 - tw1)) : Math.min(W - 40, Math.max(x, 40 + tw1)); }
    // kâğıt hale: yazı haritanın üstünde okunur (kutu yok)
    ctx.lineWidth = 11; ctx.strokeStyle = C.paper; ctx.lineJoin = 'round'; ctx.textAlign = align;
    const k = ease.enter(u);
    ctx.globalAlpha = 1; ctx.save(); ctx.beginPath(); ctx.rect(align === 'right' ? x - 700 * k : x - 4, q[1] + dy - 34, 700 * k + 8, 46); ctx.clip();
    { const tw = ctx.measureText(text).width, bx = align === 'right' ? x - tw : align === 'center' ? x - tw / 2 : x; ctx.fillStyle = C.paper; ctx.fillRect(bx - 6, q[1] + dy - 30, tw + 12, 40); }
    ctx.fillStyle = color; ctx.fillText(text, x, q[1] + dy);
    ctx.restore(); ctx.restore();
  }

  // ——— hikâye büyüteci (detay balonu) ———
  const rnd = mulberry32(14);
  const stones = Array.from({ length: 14 }, () => [rnd(), rnd(), rnd()]);
  function roundel(t, kind, at, R = ROUND, k = 1) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    // kılavuz çizgisi: balondan yolcunun küredeki yerine
    if (at && k > 0.6) {
      const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y);
      if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); }
    }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r);
    const rr = R.r;
    ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    if (kind === 'mag53') {
      // yakın plan: deniz çizgileri, kıyı, kırmızı 53 km ölçü çizgisi, başında küçük yürüyen adam
      ctx.lineWidth = 1.2; ctx.strokeStyle = C.graphite;
      for (let y = -120; y < 130; y += 7) { ctx.beginPath(); ctx.moveTo(-rr, y); ctx.lineTo(rr, y); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-rr, -20); ctx.quadraticCurveTo(-20, 10, 40, -10); ctx.quadraticCurveTo(90, -30, rr, 10); ctx.lineTo(rr, rr); ctx.lineTo(-rr, rr); ctx.closePath();
      ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-70, 52); ctx.lineTo(80, 52); ctx.stroke();
      ctx.lineWidth = 3; for (const x of [-70, 80]) { ctx.beginPath(); ctx.moveTo(x - 9, 61); ctx.lineTo(x + 9, 43); ctx.stroke(); }
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.fillText('53 km', 5, 34);
      ctx.save(); ctx.translate(-70, 46); drawWalker(ctx, WALKER_CARD, { mode: 'walk', phase: (t * 1.55) % 1, cart: false }, 56); ctx.restore();
      setFont(ctx, F.mono(20)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText('PUNTA ARENAS', -86, 92);
    } else if (kind === 'bird' || kind === 'birdland') {
      // okyanus: sola kayan dalga çentikleri (kuş sağa uçar); konunca durur
      const v = kind === 'bird' ? t * 260 : 0;
      ctx.lineWidth = 2;
      for (let row = 0; row < 4; row++) {
        const y = 38 + row * 20, sp = 46 + row * 8, off = (v * (0.6 + row * 0.25)) % sp;
        for (let x = -rr - sp + ((-off) % sp + sp) % sp; x < rr + sp; x += sp) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 9, y - 6, x + 18, y); ctx.stroke(); }
      }
      if (kind === 'bird') {
        // kanat çırpma ~3,2 Hz; uçuş yüksekliği hafifçe kanat vuruşuyla oynar (kaldırma)
        const fl = Math.sin(t * Math.PI * 2 * 3.2);
        ctx.save(); ctx.translate(-8, -18 + fl * 3); drawGodwit(ctx, GODWIT_CARD, { flap: fl }, 205); ctx.restore();
      } else {
        // Tazmanya kıyısı: kumda duran kuş (kanatlar kapalı)
        ctx.beginPath(); ctx.moveTo(-rr, 30); ctx.lineTo(rr, 30); ctx.lineWidth = 2.5; ctx.stroke();
        ctx.save(); ctx.translate(-4, -6); drawGodwit(ctx, GODWIT_CARD, { flap: -0.15 }, 190); ctx.restore();
      }
    } else {
      const mode = kind; // walk | ice | swim | wait | link
      const ph = t * 1.55;                          // adım döngüsü (sn başına 1,55 döngü)
      const strideV = WALKER_CARD.stride * 170 * 1.55; // zemin hızı = adım boyu × kadans (ayak kaymaz)
      const moving = mode === 'walk' || mode === 'ice' || mode === 'link';
      const gx = moving ? -(t * strideV) : 0;
      const groundY = 74;
      if (mode === 'swim') {
        ctx.lineWidth = 2;
        for (let row = 0; row < 4; row++) {
          const y = 18 + row * 22, sp = 44, off = (t * 90 * (0.7 + row * 0.3)) % sp;
          for (let x = -rr - sp - off; x < rr + sp; x += sp) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 7, x + 20, y); ctx.stroke(); }
        }
        ctx.save(); ctx.translate(6, 14); drawWalker(ctx, WALKER_CARD, { mode: 'swim', phase: t * 0.9 }, 170); ctx.restore();
      } else {
        ctx.beginPath(); ctx.moveTo(-rr, groundY); ctx.lineTo(rr, groundY); ctx.lineWidth = 2.5; ctx.stroke();
        ctx.lineWidth = 1.6;
        for (const [a, b, c] of stones) {
          const x = (((a * 400 + gx) % 400) + 400) % 400 - 200, y = groundY + 8 + b * 30;
          if (mode === 'ice') { ctx.beginPath(); ctx.moveTo(x, groundY + 2); ctx.lineTo(x + 14, y); ctx.lineTo(x + 30, y - 4); ctx.stroke(); }
          else { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 + c * 14, y); ctx.stroke(); }
        }
        if (mode === 'wait' || mode === 'walkstand') {
          if (mode === 'wait') {
          // sınır: kapalı bariyer (çizgili kol) ve direk
          ctx.save(); ctx.translate(62, groundY);
          ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -92); ctx.stroke();
          ctx.beginPath(); ctx.rect(-74, -86, 74, 12); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
          for (let x = -70; x < 0; x += 18) { ctx.fillStyle = C.ink; ctx.fillRect(x, -86, 9, 12); }
          ctx.restore();
          }
          ctx.save(); ctx.translate(-30, groundY); drawWalker(ctx, WALKER_CARD, { mode: 'stand', phase: 0, cart: true }, 150); ctx.restore();
        } else {
          ctx.save(); ctx.translate(18, groundY); drawWalker(ctx, WALKER_CARD, { mode: 'walk', phase: ph % 1, cart: true }, 150); ctx.restore();
        }
      }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  // ——— Sıfır: tepki takvimi ———
  const blinkR = mulberry32(77); const blinks = []; for (let b = 1.2; b < D; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [
    [0, 'ayakta', 'notr'], [L.l02.t0 + 0.6, 'bakma_yukari', 'sayiyor'], [T.land, 'sasirma', 'saskin'], [T.land + 1.6, 'ayakta', 'notr'],
    [T.walk0, 'ayakta', 'sayiyor'], [T.wait0 + 0.6, 'oturma', 'uykulu'], [T.wait1, 'ayakta', 'saskin'], [T.wait1 + 1.4, 'ayakta', 'notr'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.6, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr'],
  ];
  const bubbles = [[T.land + 0.15, Math.min(T.land + 1.7, T.whip0 + 0.45), '11 gün mü?!'], [T.wait0 + 0.6, T.wait1 - 0.1, 'Zzz'], [T.hero + 0.1, T.hero + 1.9, 'Bu kadar mı?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)];
    const u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const pose = mixPose(POSES[prev[1]], POSES[cur[1]], u);
    const blink = blinks.some(b => t >= b && t < b + 0.12);
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blink && expr.eye !== 'closed') expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, pose, expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)) * (1 - ease.exit(seg(t, b - 0.2, 0.2)));
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - 310;
      ctx.save(); ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok: seri, anlatım cümlesi, sayaç satırı ———
  function lineAt(t) {
    let cur = null;
    for (const ln of ep.voice.lines) if (t >= L[ln.id].t0 - 0.06) cur = L[ln.id];
    return cur;
  }
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    const ln = lineAt(t); if (!ln || ln.id === 'l01') return;
    // l13 + l14 tek cümledir: önce ekranda soru, doruğun karesinde cevap (yarım cümle gösterilmez)
    const joined = ln.id === 'l14', asked = ln.id === 'l13';
    const p = joined ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    // uzun cümle iki satıra sığmazsa yazı küçülür (en çok üç satır); kelime kesilmez
    const txt = joined ? L.l13.text + ' ' + ln.text : asked ? "Kuş Tazmanya'ya indiğinde adam nerede olurdu?" : ln.text;
    let fs0 = 50; setFont(ctx, F.name(fs0)); let ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0);
    if (ls.length > 2) { fs0 = 44; setFont(ctx, F.name(fs0)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); }
    const lh = fs0 * 1.22, y0 = ls.length > 2 ? 420 : 432;
    ls.slice(0, 3).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    // kare 0'da hazır; döngü sonunda yeniden yazılır
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104));
    revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(42));
    revealText(ctx, '11 gün hiç inmeyen kuş mu,', SAFE.x0, 640, 42, k, C.ink); revealText(ctx, '28 yıldır yürüyen adam mı?', SAFE.x0, 690, 42, k, C.ink);
  }
  function counterRow(t, { label, num, unit, right1, right2, red = false, p = 1 }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width;
    revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    if (t < L.l05.t0 - 0.06) {
      const s = birdS(t), day = F_.bird.days * s / BR.total;
      counterRow(t, { label: 'KIYI ÇAMURÇULLUĞU · 5 AYLIK', num: nf0.format(Math.round(F_.bird.km * s / BR.total)), unit: 'km',
        right1: t >= T.land ? '11 GÜN 1 SAAT' : `${Math.floor(day) + 1}. GÜN`, right2: 'İNİŞ: 0', p: ease.enter(seg(t, L.l02.t0 - 0.05, 0.35)) });
      return;
    }
    if (t < T.cmp0) {
      const s = plan.walkS(t), date = plan.walkDate(t), mode = modeAt(t);
      const km = t >= T.dover ? F_.walk.kmDover : realKm(WR, s, F_);
      counterRow(t, { label: 'KARL BUSHBY · ESKİ ASKER', num: nf0.format(Math.round(km / 10) * 10), unit: 'km',
        right1: String(Math.floor(date)), right2: mode === 'wait' ? 'BEKLİYOR' : mode === 'swim' ? 'YÜZÜYOR' : t < T.walk0 ? 'ŞİLİ' : t >= T.dover ? 'İNGİLTERE' : 'YÜRÜYOR',
        p: Math.max(0.35, ease.enter(seg(t, L.l05.t0 - 0.06, 0.35))) });
      return;
    }
    if (t < T.hero) {
      const day = F_.bird.days * ease.state(seg(t, T.clock0, T.clock1 - T.clock0));
      counterRow(t, { label: 'AYNI SAATLE ÖLÇÜLÜRSE', num: t < T.clock0 ? '0' : t >= T.clock1 ? '11' : nf1.format(Math.floor(day * 10) / 10), unit: 'gün',
        right1: 'KUŞ: ' + nf0.format(Math.round(F_.bird.km * day / F_.bird.days)) + ' km', right2: 'ADAM: ?', p: ease.enter(seg(t, T.cmp0, 0.35)) });
      return;
    }
    if (t < T.back0 + 0.3) {
      counterRow(t, { label: 'ADAM, AYNI 11 GÜNDE', num: nf0.format(F_.sameClockKm), unit: 'km', red: true, right1: 'KUŞ: 13.560 km', right2: '256 KAT FARK' });
      return;
    }
    if (t < T.ask) {
      counterRow(t, { label: 'ADAMIN BUGÜNE KADARKİ YOLU', num: nf0.format(F_.walk.kmDover), unit: 'km', right1: 'DÜNYA ÇEVRESİ', right2: nf0.format(F_.earthKm) + ' km' });
      return;
    }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(96)); revealText(ctx, 'Kuş mu, adam mı?', SAFE.x0, 676, 96, p, C.ink);
  }

  // ——— doruk cetveli: kuşun yayı düz çizgiye dönüşür (13.560 km = 830 px); adamın 53 km'si sol uçta 3 px'lik kırmızı
  // çentik; sonra çentiğe 250 kat yaklaşılır ve içinde yürüyen adam görünür ———
  const RX0 = SAFE.x0, RX1 = SAFE.x1, RY = 860;
  function heroRuler(t, k) {
    if (t < T.morph0 || t >= T.back0 + 0.6) return;
    const mu = ease.state(seg(t, T.morph0, 0.9)), out = 1 - ease.exit(seg(t, T.back0, 0.5));
    // kâğıt bant: küreyi örtmeden üst kısımda
    const bh = 250 * mu * out;
    ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, bh);
    // yaklaşma: sol uç sabit, yatay ölçek 1 → 250 (log)
    // doruk: sol uca 1,15x yaklaşma (yay 170/26) ve geri çekilmeye kadar sürekli %5 (donmuş kare olmaz)
    const zf = 1;   // ölçek sabit: 13.560 km her karede aynı noktada (yakınlaşma olguyu bozar)
    const X = km => RX0 + (km / F_.bird.km) * (RX1 - RX0) * zf;
    const N = 120, pts = [];
    for (let i = 0; i <= N; i++) {
      const s0 = BR.total * i / N, p = pointAt(BR.D, s0), q = visible(k, p) ? proj(p) : null;
      const tx = X(F_.bird.km * i / N), ty = RY;
      pts.push(q && mu < 1 ? [lerp(q[0], tx, mu), lerp(q[1], ty, mu)] : [tx, ty]);
    }
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    ctx.globalAlpha = out; // çıkışta cetvel bantla birlikte söner (küre üstünde asılı kalmaz)
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.stroke();
    if (mu >= 1 && out > 0) {
      ctx.globalAlpha = out;
      // çentikler: ekranda en az 24 px aralık veren en küçük adım (10 / 100 / 1000 km)
      const step = [10, 100, 1000].find(st => (st / F_.bird.km) * (RX1 - RX0) * zf >= 24) || 1000;
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; setFont(ctx, F.mono(28)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center';
      for (let km = step; km < F_.bird.km; km += step) { const x = X(km); if (x > W + 10) break; ctx.beginPath(); ctx.moveTo(x, RY + 10); ctx.lineTo(x, RY + 22); ctx.stroke(); if ((km / step) % 5 === 0) { const lx = Math.min(x, RX1 - 60); ctx.fillText(nf0.format(km) + ' km', lx, RY + 50); } }
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.ink; ctx.textAlign = 'right';
      ctx.fillText('KUŞ · 11 GÜNDE 13.560 km', RX1, RY - 26);
      ctx.save(); ctx.translate(RX1 - 4, RY - 4); drawGodwitGlyph(ctx, 40, Math.sin(t * Math.PI * 2 * 3.2)); ctx.restore();
      if (t >= T.hero - 0.02) {
        const x1 = X(F_.sameClockKm), pop = spring(t - T.hero, 120, 24);
        ctx.fillStyle = C.red; ctx.fillRect(RX0, RY - 9 - 6 * pop, Math.max(3.5, x1 - RX0), 18 + 12 * pop);
        setFont(ctx, F.mono(32)); ctx.fillStyle = C.red; ctx.textAlign = 'left'; ctx.fillText('ADAM · 53 km', RX0, RY - 26);
        // çentik ekranı doldurunca içinde yürüyen adam (53 km'nin ucunda)
        ctx.save(); ctx.translate(RX0 + 36, RY + 92); ctx.globalAlpha = out; drawWalker(ctx, WALKER_CARD, { mode: 'walk', phase: (t * 1.25) % 1, cart: true }, 92); ctx.restore();
      }
    }
    ctx.restore();
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const k = cam(t); setCam(k); CAM = k;
    globe(k, t);

    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    // döngü sonunda rotalar geri sarılır (kare 0'da rota yok)
    const wipe = 1 - ease.state(seg(t, T.loop0 + 0.1, 0.8));
    const cmp = t >= T.cmp0;
    let heroAt = null;
    // kuş: önce hedef ve planlanan yol (soluk noktalı), sonra uçulan yol
    const ghost = t < T.loop0 ? ease.state(seg(t, 0.2, 1.6)) : 0;   // kanca: planlanan yol 6. kareden itibaren çizilir
    if (ghost > 0 && t < T.walk0 + 1) line(slice(BR.D, 0, BR.total * ghost), { color: C.graphite, w: 2.5, dash: [2, 8] });
    const bs = birdS(t) * wipe;
    if (bs > 0 && (t < T.whip1 || cmp)) line(slice(BR.D, 0, bs), { color: cmp ? C.graphite : C.ink, w: cmp ? 3 : 4.5 });
    ringAt(BIRD_END, seg(t, T.ring, 0.6) * (t < T.whip0 + 0.3 ? 1 : 0));
    // adam
    const ws = plan.walkS(t) * wipe;
    if (ws > 0) walkLine(ws, 0, cmp && t < T.back0 + 0.6 ? { color: C.graphite, w: 3 } : {});
    if (t >= T.hull && t < T.cmp0) { line([WALK.at(-1).p, HULL.p], { color: C.graphite, w: 3, dash: [6, 7] }); }
    // aynı saat: iki yolcu birlikte başlar
    if (cmp && t < T.back0 + 0.6) {
      const u = ease.state(seg(t, T.clock0, T.clock1 - T.clock0));
      if (u > 0 && t < T.morph0) line(slice(BR.D, 0, BR.total * u), { w: 5 });
      if (t >= T.clock0) {
        const q = proj(PA); if (q && k.r < 3000 && visible(k, PA)) { ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke(); }
        if (k.r < 3000) { if (t < T.morph0) { placeLabel(PA, 'ADAM', seg(t, T.clock0, 0.4), 18, -18, C.ink, 'right'); const bp = pointAt(BR.D, BR.total * u); placeLabel(bp, 'KUŞ', seg(t, T.clock0, 0.4), 22, -12); } }
      }

    }
    // Dünya'nın çevresi: ekvator kesik çizgi
    if (t >= T.earth - 0.2 && t < T.loop0 + 0.4) {
      line(EQUATOR.coordinates, { color: C.graphite, w: 2.5, dash: [10, 8] });
      // adamın yolu: 49.500 / 40.075 = 1,235 tur; ilk tur ekvatorda, fazlası hemen kuzeyinde ikinci iz
      const f = (F_.walk.kmDover / F_.earthKm) * lapU(t) * (t < T.loop0 ? 1 : 1 - ease.state(seg(t, T.loop0, 0.6)));
      const lap1 = [], lap2 = [];
      for (let d = 0; d <= 360 * Math.min(1, f); d += 3) lap1.push([55 - d, 0]);
      for (let d = 0; d <= 360 * Math.max(0, f - 1); d += 3) lap2.push([55 - d, 3.2]);
      line(lap1, { w: 5 }); line(lap2, { w: 5 });
      if (f > 1.2 && lap2.length) placeLabel(lap2.at(-1), '+9.425 km', seg(t, LAP[1] - 0.6, 0.4), 16, -14);
    }
    // yolcu işaretleri
    let at = heroAt;
    // kuş: kare 0'da Alaska'da hazır, Tazmanya'ya konunca kırbaç kaydırmaya kadar orada; döngü sonunda yine Alaska'da
    const bsNow = t < T.whip0 ? birdS(t) : t >= T.loop0 + 0.5 ? 0 : -1;
    if (bsNow >= 0) {
      const p = pointAt(BR.D, bsNow), q = proj(p);
      if (q && visible(k, p)) {
        const ah = proj(pointAt(BR.D, Math.min(BR.total, bsNow + 200)));
        const ang = ah ? Math.atan2(ah[1] - q[1], ah[0] - q[0]) : 0;
        ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(ang); drawGodwitGlyph(ctx, 46, Math.sin(t * Math.PI * 2 * 3.2)); ctx.restore();
        at = q;
      }
    }
    if (t >= T.whip1 - 0.15 && t < T.cmp0) {
      const p = walkP(t), q = proj(p);
      if (q && visible(k, p)) {
        // haritadaki yolcu: yürür, buzda yürür, yüzer, sınırda bekler; gittiği yöne bakar
        const mode = t < T.walk0 ? 'wait' : modeAt(t), q2 = proj(walkP(t + 0.25)) || q, dir = q2[0] < q[0] - 0.5 ? -1 : 1;
        ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
        ctx.save(); ctx.translate(q[0], q[1] - 6);
        if (mode === 'swim') {
          // dalga halkaları: yüzücünün çevresinde genişleyip kaybolan iki elips (sürekli, döngüsel)
          for (let i = 0; i < 2; i++) { const u = ((t * 1.3 + i * 0.5) % 1); ctx.beginPath(); ctx.ellipse(0, 6, 30 + 46 * u, 9 + 12 * u, 0, 0, Math.PI * 2); ctx.lineWidth = 2.5 * (1 - u) + 0.6; ctx.strokeStyle = C.ink; ctx.stroke(); }
          ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, 0, 62, 20, 0, 0, Math.PI * 2); ctx.fill();
          ctx.scale(dir, 1); drawWalker(ctx, WALKER_CARD, { mode: 'swim', phase: t * 0.9 }, 118);
        } else {
          ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, -50, 32, 60, 0, 0, Math.PI * 2); ctx.fill();
          ctx.scale(dir, 1); drawWalker(ctx, WALKER_CARD, { mode: mode === 'wait' ? 'stand' : 'walk', phase: (t * 1.8) % 1, cart: false }, 110);
        }
        ctx.restore();
        at = q;
      }
    }
    // yer adları: yolcu geçerken (en son geçilen ad 3 sn kalır)
    if (t < T.pull + 1.0) placeLabel(BR.D[0].p, 'ALASKA', 1 - seg(t, T.pull + 0.6, 0.3), 18, -16);
    if (t >= T.loop0 + 0.5) placeLabel(BR.D[0].p, 'ALASKA', seg(t, T.loop0 + 0.5, 0.35), 18, -16);
    if (t >= T.ring && t < T.whip0 + 0.3) placeLabel(BIRD_END, 'TAZMANYA', seg(t, T.ring + 0.3, 0.5), 34, 10, C.ink, 'left');
    const names = WALK.map((w, i) => ({ ...w, i })).filter(w => w.name);
    for (const n of names) {
      const tp = n.i === 0 ? T.whip1 - 0.1 : passTime(n.i);
      if (t >= tp && t < Math.min(n.i === 0 ? T.walk0 + 1.8 : tp + 3.2, T.cmp0)) placeLabel(n.p, n.name, seg(t, tp, 0.4), 18, n.name === 'HAZAR DENİZİ' ? -46 : -16, C.ink, n.p[0] > 20 && n.p[0] < 60 ? 'right' : 'left');
    }
    if (t >= T.hull && t < T.cmp0) placeLabel(HULL.p, 'HULL · 400 km', seg(t, T.hull, 0.4), 16, -16, C.ink);
    ctx.restore();

    heroRuler(t, k);
    // hikâye büyüteci
    let kind = null, rk = 1;
    if (t < T.land) kind = 'bird';
    else if (t < T.whip0 + 0.25) kind = 'birdland';
    else if (t < T.cmp0) kind = t < T.walk0 ? 'walkstand' : modeAt(t);
    // geçiş: kuş balonu kırbaç kaydırmada küçülür, adam balonu açılır (graphic match: aynı daire)
    const cutT = L.l05.t0 - 0.06;
    if (t >= cutT - 0.3 && t < cutT + 0.3) { const u = seg(t, cutT - 0.3, 0.6); rk = u < 0.5 ? 1 - ease.exit(u * 2) : ease.enter(u * 2 - 1); if (rk < 0.03) kind = null; }
    if (t < cutT && t >= T.land) kind = 'birdland';
    if (kind) roundel(t, kind, at, ROUND, rk);
    // kapanış: iki balon yan yana (soru)
    if (t >= T.cmp0 && t < T.ask) {
      const kk = 1 - ease.exit(seg(t, T.cmp0, 0.3));
      if (kk > 0) roundel(t, modeAt(T.cmp0 - 0.01), null, ROUND, kk);
    }
    if (t >= T.ask) {
      const kin = ease.enter(seg(t, T.ask, 0.45)), kout = t >= T.loop0 ? 1 - ease.state(seg(t, T.loop0, 0.6)) : 1;
      roundel(t, 'walk', null, { x: 482, y: 1268, r: 112 }, kin);
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kin * kout; ctx.fillRect(482 - 52, 1096, 104, 42); ctx.fillRect(ROUND.x - 40, 1084, 80, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'ADAM', 482, 1128, 34, kin * kout, C.ink, 'center');
      revealText(ctx, 'KUŞ', ROUND.x, 1116, 34, kin * kout, C.ink, 'center');
    }
    // kare 0 ve döngü: iki balon (kuş ve adam) birlikte; adam balonu ilk cümlede kapanır
    if (t < L.l02.t0) roundel(t, 'walk', null, { x: 482, y: 1268, r: 112 }, 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)));
    if (t >= T.ask) roundel(t, 'bird', t >= T.loop0 + 0.5 ? at : null, ROUND, 1);

    // üst blok
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }

  const BIRD_END = BR.D.at(-1).p;
  // durak noktasından geçiş anı (film zamanı): walkS(t) ≥ durağın km'si
  const passCache = {};
  function passTime(i) {
    if (passCache[i] != null) return passCache[i];
    const s = WR.nodeKm[i];
    let lo = T.walk0, hi = T.cmp0;
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (plan.walkS(m) >= s - 1) hi = m; else lo = m; }
    return (passCache[i] = hi);
  }


  return { duration: D, timeline: { L: Object.fromEntries(Object.entries(L).map(([k, v]) => [k, [v.t0, v.t1]])), T }, render };
}

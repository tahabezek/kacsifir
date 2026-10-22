// Sahne: Jüpiter mi ağır, geri kalan bütün gezegenler mi? Sol kefede Jüpiter; diğer yedi gezegen gerçek
// boyutlarıyla, hafiften ağıra sağ kefeye düşer. Terazi kıpırdamaz. Doruk: destek Jüpiter'e doğru kayar, kollar
// 1 : 2,47 olunca terazi dengelenir (moment: m₁·a = m₂·b). Kütleler Dünya kütlesi biriminde (NASA NSSDC).
import { ease, seg, lerp, spring } from '../core.js';
import { drawActor } from '../actor.js';
import { SAFE, TAU, nf1, nf2, win, loadPlanets, makePlate } from './plate.js';

// ekranda tek ondalık: artışlar ve toplam aynı yuvarlamadan (0,1 + 0,1 = 0,2 …) okunur
const fmt = v => nf1.format(Math.round(v * 10) / 10);

const D2R = Math.PI / 180;

export function buildTeraziTimeline(ep) {
  const T = ep.timing, earth = ep.planets.find(p => p.key === 'dunya')?.m ?? 5.97;
  const others = ep.planets.filter(p => p.key !== 'jupiter' && p.key !== 'dunya').concat([{ key: 'dunya', name: 'Dünya', m: earth, d: 12756 }]);
  const jup = ep.planets.find(p => p.key === 'jupiter');
  const drops = others.map(p => ({ ...p, me: p.m / earth })).sort((a, b) => b.me - a.me)
    .map((p, k) => ({ ...p, t: T.firstDrop + k * T.hop }));
  const mJ = jup.m / earth, mR = drops.reduce((a, p) => a + p.me, 0);
  return { beat: 60 / ep.bpm, ...T, jup: { ...jup, me: mJ }, drops, mJ, mR, ratio: mJ / mR, duration: T.end, rw0: T.ret[0], rw1: T.end };
}
export function teraziSummary(ep) {
  const tl = buildTeraziTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.hero, cover: 0,
    keys: [0, 1.2, ...tl.drops.map(d => d.t + 0.3), tl.after + 0.6, tl.ask + 0.9, tl.hero + 0.3, tl.hero + 1.5, tl.coda + 0.6, tl.rw0 + 0.6],
    fast: tl.hero + 0.45, lastLand: tl.drops[tl.drops.length - 1].t, firstLand: tl.drops[0].t };
}
export function teraziCues(ep) {
  const tl = buildTeraziTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence[0], tl: tl.hero },
    grows: [{ t0: tl.hero, t1: tl.hero + tl.slide, hero: false }],
    lands: [...tl.drops.map(d => d.t), tl.strain + 0.5, tl.hero + tl.slide],
    tallies: [] };
}

export async function makeTeraziRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildTeraziTimeline(ep), D = tl.duration;
  const P = makePlate(ctx, ep, await loadPlanets());
  const { C, F, setFont, revealText } = P;
  const G = ep.geom;                                      // terazi ölçüleri (px)
  const s = G.jupR / (tl.jup.d / 2);                      // px/km: Jüpiter'in yarıçapı jupR
  const rOf = p => p.d / 2 * s;
  const PIV = { x: G.pivotX, y: G.pivotY }, L = G.beam;
  // destek, kirişin ortasından Jüpiter'e doğru kayar; kiriş ve kefeler yerinde kalır
  const pivotAt = t => G.pivotX - (L / 2 - arms(t).a);

  // sağ kefedeki yerleşim (kefe tabanına göre): küçük dört gezegen tabanda, Uranüs ve Neptün iki yanda, Satürn
  // ikisinin üstünde (iki küreye teğet). Hepsi gerçek boyut oranında.
  const place = {};
  {
    const U = tl.drops.find(d => d.key === 'uranus'), N = tl.drops.find(d => d.key === 'neptun'), S = tl.drops.find(d => d.key === 'saturn');
    const rs = rOf(S), gx = G.panW * 0.33;
    place.saturn = { x: 0, y: -rs - 2 };
    place.uranus = { x: -gx, y: -rOf(U) - 2 }; place.neptun = { x: gx, y: -rOf(N) - 2 };
    const small = tl.drops.filter(d => !['uranus', 'neptun', 'saturn'].includes(d.key)).reverse();
    let x = -G.panW * 0.1;
    small.forEach(d => { const r = rOf(d); place[d.key] = { x: x + r, y: -r - 1 }; x += 2 * r + 5; });
  }

  // sağ kefedeki kütle (Dünya kütlesi); düşüş: üstten serbest düşüş (t²), varışta kefeye oturur
  const FALL = 0.42;
  const mRight = t => tl.drops.reduce((a, d) => a + (t >= d.t && !(t >= retOut(d)) ? d.me : 0), 0);
  // dönüşte gezegenler ters sırayla yukarı kalkar
  const retOut = d => tl.ret[0] + 0.08 * (tl.drops.length - 1 - tl.drops.indexOf(d));

  // kollar: sol a, sağ b (a + b = L). Doruğda destek Jüpiter'e kayar: a/b = mR/mJ
  const aBal = L * tl.mR / (tl.mR + tl.mJ);
  function arms(t) {
    const u = ease.state(seg(t, tl.hero, tl.slide)) * (1 - ease.state(seg(t, tl.ret[0], tl.ret[1] - tl.ret[0] - 0.2)));
    const a = lerp(L / 2, aBal, u);
    return { a, b: L - a };
  }
  // eğim: moment oranından (dayanağa çarpınca durur) + her düşüşte sönümlü sarsıntı
  const onPan = () => true;
  function tilt(t) {
    const { a, b } = arms(t), mL = onPan(t) ? tl.mJ : 0, mR = mRight(t);
    const r = mL + mR > 0 ? (mL * a - mR * b) / (mL * a + mR * b) : 0;
    let phi = G.maxTilt * D2R * Math.max(-1, Math.min(1, G.gain * r));
    for (const d of tl.drops) {
      const tt = t - d.t;
      if (tt <= 0 || t >= tl.ret[0]) continue;
      const amp = G.jolt * D2R * Math.sqrt(Math.min(1, d.me / 40)), w = 13, z = 0.45;
      phi -= amp * Math.exp(-z * w * tt) * Math.sin(w * Math.sqrt(1 - z * z) * tt);
    }
    // denge: destek oturunca kiriş sönümlü salınımla durulur
    const ts = t - (tl.hero + tl.slide);
    if (ts > 0 && t < tl.ret[0]) phi += G.settle * D2R * Math.exp(-ts / 0.8) * Math.sin(TAU * ts / 0.9);
    // zorlanma: sağ kefe bir an kalkmaya çalışır, geri düşer
    phi -= G.strain * D2R * Math.sin(Math.PI * seg(t, tl.strain, 0.5));
    return Math.min(G.maxTilt * D2R, phi);              // dayanak: daha fazla eğilemez
  }
  // asılı kefelerin hafif salınımı: döngüye kilitli tam sayı tur, kare 0'dan itibaren sürekli hareket
  const sway = t => Math.sin((t / D) * Math.round(D / 3.2) * TAU) * 1.1 * D2R;

  function beamGeom(t) {
    const { a, b } = arms(t), phi = tilt(t), c = Math.cos(phi), sn = Math.sin(phi);
    const L0 = { x: PIV.x - a * c, y: PIV.y + a * sn }, R0 = { x: PIV.x + b * c, y: PIV.y - b * sn };
    return { a, b, phi, L0, R0 };
  }
  // kefe: asılma noktasından üç ip, sığ çanak (taralı)
  function pan(hang, contents, swayA) {
    ctx.save(); ctx.translate(hang.x, hang.y); ctx.rotate(swayA);
    const hw = G.panW / 2, y = G.hang;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    for (const x of [-hw, 0, hw]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x * (x ? 1 : 0), y); ctx.stroke(); }
    ctx.translate(0, y);
    contents();                                          // kefedeki gezegenler (kefe çizgisinin arkasında kalmaz)
    ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.quadraticCurveTo(0, G.panDepth * 2, hw, 0); ctx.closePath();
    ctx.fillStyle = C.paper; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = -hw - 40; x < hw + 40; x += 9) { ctx.moveTo(x, 0); ctx.lineTo(x + 30, G.panDepth * 2); } ctx.stroke(); ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.quadraticCurveTo(0, G.panDepth * 2, hw, 0); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }
  function column() {
    const x = PIV.x, top = PIV.y, base = G.baseY;
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.fillStyle = C.paper;
    // ayak: taralı yamuk
    ctx.beginPath(); ctx.moveTo(x - 90, base); ctx.lineTo(x + 90, base); ctx.lineTo(x + 40, base - 26); ctx.lineTo(x - 40, base - 26); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = -120; k < 120; k += 10) { ctx.moveTo(x + k, base); ctx.lineTo(x + k + 26, base - 26); } ctx.stroke(); ctx.restore();
    // gövde
    ctx.beginPath(); ctx.rect(x - 9, top + 14, 18, base - 26 - top - 14); ctx.fill(); ctx.stroke();
    // bıçak ağzı (üçgen dayanak)
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - 16, top + 22); ctx.lineTo(x + 16, top + 22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function beam(bg, t) {
    ctx.save(); ctx.translate(PIV.x, PIV.y); ctx.rotate(-bg.phi);
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.rect(-bg.a, -8, L, 16); ctx.fill(); ctx.stroke();
    // cetvel çentikleri (kol boyunca her L/20)
    ctx.lineWidth = 1.5; ctx.beginPath();
    for (let k = 1; k < 20; k++) { const x = -bg.a + (k * L) / 20; ctx.moveTo(x, -8); ctx.lineTo(x, k % 5 ? -2 : 4); } ctx.stroke();
    // uçlarda asma halkaları
    for (const x of [-bg.a, bg.b]) { ctx.beginPath(); ctx.arc(x, 0, 7, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    // gösterge ibresi: destekten yukarı, eğimi büyütür
    ctx.save(); ctx.translate(PIV.x, PIV.y); ctx.rotate(-bg.phi);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -64); ctx.stroke();
    ctx.restore();
    // ibre kadranı (sabit): orta çizgi
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(PIV.x, PIV.y, 70, -Math.PI / 2 - 0.3, -Math.PI / 2 + 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PIV.x, PIV.y - 64); ctx.lineTo(PIV.x, PIV.y - 80); ctx.stroke();
    ctx.restore();
  }

  function render(t) {
    P.paper();
    PIV.x = pivotAt(t);
    const bg = beamGeom(t), sw = sway(t);
    P.stage(() => {
            // kamera: olaylarda yay (170/26) ile yaklaşma ve geri çekilme; en çok %7
      const zk = (tt, dz) => dz * spring(t - tt, 170, 26);
      // doruk: destek kayarken terazi katmanına 1,12x yaklaşma, 'kollar' cümlesinde geri
      const z = 1 + zk(tl.push1, 0.06) - zk(tl.hero, 0.06) + zk(tl.hero, 0.06) - zk(tl.moment, 0.06) + zk(tl.moment, 0.05) - zk(tl.coda, 0.05);
      const zc = { x: G.pivotX + 80, y: PIV.y + 160 };
      ctx.save(); ctx.translate(zc.x, zc.y); ctx.scale(z, z); ctx.translate(-zc.x, -zc.y);
      column();
      // sol kefe: Jüpiter
      pan(bg.L0, () => P.planet('jupiter', 0, -G.jupR - 2, G.jupR), sw);
      // sağ kefe: düşen gezegenler
      pan(bg.R0, () => {
        for (const d of tl.drops) {
          if (t < d.t - FALL) continue;
          const pl = place[d.key], r = rOf(d);
          let y = pl.y;
          if (t < d.t) { const u = (t - (d.t - FALL)) / FALL; y = lerp(pl.y - G.fall, pl.y, u * u); }
          const out = retOut(d);
          if (t >= out) { const u = seg(t, out, 0.45); y = lerp(pl.y, pl.y - 900, ease.exit(u)); if (u >= 1) continue; }
          P.planet(d.key, pl.x, y, r);
        }
      }, -sw * 0.8);
      beam(bg, t);
      // kefe etiketleri: kütle (Dünya kütlesi)
      const lab = (hang, text, u, red) => { setFont(ctx, F.mono(44)); revealText(ctx, text, hang.x, hang.y + G.hang + G.panDepth + 40, 40, u, red ? C.red : C.ink, 'center'); };
      const share = false;
      const pc = t >= tl.coda && t < tl.ret[0], pu = ease.state(seg(t, tl.coda + 0.2, 1.2));
      const pJ = Math.round(100 * tl.mJ / (tl.mJ + tl.mR) * pu), pR = Math.round(100 * tl.mR / (tl.mJ + tl.mR) * pu);
      if (pc) { lab(bg.L0, '%' + pJ, 1, true); lab(bg.R0, '%' + pR, 1); }
      else if (onPan(t)) lab(bg.L0, share ? '%' + Math.round(100 * tl.mJ / (tl.mJ + tl.mR)) : fmt(tl.mJ), 1);
      const mr = mRight(t);
      if (!pc && mr > 0 && t < tl.ret[0]) lab(bg.R0, share ? '%' + (100 - Math.round(100 * tl.mJ / (tl.mJ + tl.mR))) : fmt(mr), 1);
      // kayma oku: doruk boyunca destek Jüpiter'e doğru kayar (kirişin altında)
      const au = win(t, tl.hero, tl.hero + tl.slide + 0.5, 0.25, 0.3);
      if (au > 0) { const y = PIV.y + 44, x0 = PIV.x + 70, x1 = PIV.x - 70 * au; ctx.save(); ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + 16, y - 9); ctx.lineTo(x1 + 16, y + 9); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.restore();
      P.fadeTop();
      ctx.save(); ctx.translate(zc.x, zc.y); ctx.scale(z, z); ctx.translate(-zc.x, -zc.y);
      // doruk: kol ölçüleri 1 : 2,47 (terazi dengede), kirişin hemen üstünde
      const du = win(t, tl.hero + tl.slide + 0.15, tl.ret[0] + 0.2, 0.45);
      if (du > 0) {
        const y = PIV.y - 26;
        const pc = t >= tl.coda, lp0 = pc ? ease.enter(seg(t, tl.coda + 0.2, 0.35)) : ease.enter(seg(t, tl.hero + tl.slide + 0.5, 0.35));
        P.dimLine(bg.L0.x, PIV.x, y, C.ink, '1', null, du, ease.enter(seg(t, tl.hero + tl.slide + 0.5, 0.35)));
        // 2,47 kalemle sayarak yazılır (0,6 sn)
        const cu = ease.state(seg(t, tl.hero + tl.slide + 0.65, 0.6));
        P.dimLine(PIV.x, bg.R0.x, y, C.red, nf2.format(1 + (tl.ratio - 1) * cu), null, du, ease.enter(seg(t, tl.hero + tl.slide + 0.65, 0.3)));
      }
      ctx.restore();
    });
    P.header();
    // üst blok
    const L_ = ep.label, n = tl.drops.filter(d => t >= d.t).length, last = tl.drops[n - 1];
    if (t < tl.countAt || t >= tl.ret[1] - 0.6) {
      const p = t < tl.countAt ? 1 : ease.enter(seg(t, tl.ret[1] - 0.6, 0.4));
      P.counter({ label: L_.left, num: nf1.format(tl.mJ) + ' ' + L_.unit, sub: L_.unitNote, pin: p });
    } else if (t < tl.hero) {
      const mr = mRight(t), p = ease.enter(seg(t, tl.countAt, 0.4));
      const sub = t >= tl.after ? L_.vs + ' ' + nf1.format(tl.mJ) + ' ' + L_.unit : last ? '+ ' + fmt(last.me) + ' · ' + last.name : null;
      P.counter({ label: L_.right, num: fmt(mr) + ' ' + L_.unit, sub, pin: p, subPin: ease.enter(seg(t, t >= tl.after ? tl.after : last ? last.t - 0.1 : 0, 0.35)) });
    } else if (t < tl.coda) {
      P.counter({ label: L_.hero, num: ep.answer, sub: t >= tl.moment ? nf1.format(tl.mJ) + ' × 1 ≈ ' + nf1.format(tl.mR) + ' × ' + nf2.format(tl.ratio) : nf1.format(tl.mJ) + ' ÷ ' + nf1.format(tl.mR) + ' = ' + nf2.format(tl.ratio), red: true, pin: ease.enter(seg(t, tl.hero, 0.4)), subPin: ease.enter(seg(t, t >= tl.moment ? tl.moment : tl.hero + 0.3, 0.4)), pop: t - tl.hero });
    } else {
      P.counter({ label: L_.coda, num: ep.coda, sub: L_.codaSub, pin: ease.enter(seg(t, tl.coda, 0.4)) });
    }
    P.says(ep.says, t, tl, tl.ret[1] - 0.5);
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }

  // Sıfır: destek ayağının yanında. Düşüşleri sayar, terazi kıpırdamayınca terler, soruda düşünür, sessizlikte donar,
  // denge anında zıplar, sonra sevinir; döngüde kare 0 duruşuna döner
  const counted = t => Math.max(1, tl.drops.filter(d => t >= d.t).length);
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: tl.firstDrop - 0.3, expr: 'notr' },
    { type: 'count', t0: tl.firstDrop - 0.3, t1: tl.after, valueAt: counted, bubble: 'top' },
    { type: 'sweat', t0: tl.after, t1: tl.ask },
    { type: 'think', t0: tl.ask, t1: tl.silence[0] },
    { type: 'idle', t0: tl.silence[0], t1: tl.hero - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.hero - 0.05, t1: tl.hero + 0.85 },
    { type: 'happy', t0: tl.hero + 0.85, t1: tl.ret[0] + 0.4 },
    { type: 'lookUp', t0: tl.ret[0] + 0.4, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: G.actorX, y: 1414, facing: -1 };

  return { render, duration: D, timeline: tl };
}

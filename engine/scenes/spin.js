// Sahne: dönüş hızı. Altta dönen dünya kubbesi (ortografik izdüşüm, enlem-boylam ağı), şehrin noktası kendi
// paralelinde döner. Üstte analog hız göstergesi: ibre basamak basamak yükselir (yürüyüş → uçak → ses → şehir).
import { W, H, ease, seg, lerp, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawActor } from '../actor.js';

const SAFE = { x0: 90, x1: 920 };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const rad = d => (d * Math.PI) / 180;

export function buildSpinTimeline(ep) {
  const T = ep.timing;
  const stops = ep.stops.map((s, i) => ({ ...s, t0: T.stops[i][0], t1: T.stops[i][1] }));
  const hero = stops.find(s => s.hero);
  return { beat: 60 / ep.bpm, stops, heroLand: hero.t1, silence0: hero.t0, kickAt: hero.t1 + (T.kickDelay ?? 2.6), rw0: T.rewind[0], rw1: T.rewind[1], duration: T.rewind[1] };
}
export function spinSummary(ep) {
  const tl = buildSpinTimeline(ep);
  return { duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1, heroTl: tl.heroLand, cover: 0,
    keys: [0, ...tl.stops.flatMap(s => [(s.t0 + s.t1) / 2, s.t1 + 0.4]), tl.kickAt + 0.5, tl.rw0 + 0.3],
    fast: (tl.stops[1].t0 + tl.stops[1].t1) / 2, lastLand: tl.kickAt, firstLand: tl.stops[0].t1 };
}
export function spinCues(ep) {
  const tl = buildSpinTimeline(ep);
  return { beat: tl.beat, duration: tl.duration, rw0: tl.rw0, rw1: tl.rw1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: tl.stops.filter(s => !s.hero).map(s => ({ t0: s.t0, t1: s.t1, hero: false })),
    lands: [...tl.stops.filter(s => !s.hero).map(s => s.t1), tl.kickAt], tallies: [] };
}

export function makeSpinRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const tl = buildSpinTimeline(ep);
  const D = tl.duration;
  const G = { x: 255, y: 1170, r: 200, tilt: rad(18) };    // dünya (solda)
  const GA = { x: 672, y: 1180, r: 215, max: ep.gaugeMax }; // gösterge (sağda; tabanı Sıfır'ın üstünde kalır)
  const turns = Math.max(1, Math.round(D / ep.turnSec));
  // döngüye kilitli dönüş (hızlandırılmış); doruk anında şehir tam önde
  const phase = ep.city.lon + (tl.heroLand / D) * turns * 360;
  const lon0 = t => phase - (t / D) * turns * 360; // Dünya doğuya döner: yüzey soldan sağa akar

  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const counterY = 374 + qSize * ep.question.length + 190;

  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + qSize * 0.86 + i * qSize));
  }
  // ortografik izdüşüm: bakış enlemi = tilt
  function proj(lat, lon, l0) {
    const la = rad(lat), lo = rad(lon - l0);
    const x = Math.cos(la) * Math.sin(lo);
    const y = Math.cos(G.tilt) * Math.sin(la) - Math.sin(G.tilt) * Math.cos(la) * Math.cos(lo);
    const z = Math.sin(G.tilt) * Math.sin(la) + Math.cos(G.tilt) * Math.cos(la) * Math.cos(lo);
    return [G.x + x * G.r, G.y - y * G.r, z];
  }
  function line(pts, style, w, dash) {
    ctx.strokeStyle = style; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    ctx.beginPath(); let pen = false;
    for (const [x, y, z] of pts) { if (z > 0) { if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; } } else pen = false; }
    ctx.stroke(); ctx.setLineDash([]);
  }
  function globe(t, red) {
    const l0 = lon0(t);
    ctx.save();
    ctx.beginPath(); ctx.arc(G.x, G.y, G.r, 0, Math.PI * 2); ctx.fillStyle = '#F4EEDF'; ctx.fill(); ctx.clip();
    // boylamlar (dönüşü gösterir) ve enlemler
    for (let lon = 0; lon < 360; lon += 15) { const pts = []; for (let lat = -90; lat <= 90; lat += 3) pts.push(proj(lat, lon, l0)); line(pts, 'rgba(28,27,24,0.22)', 2); }
    for (const lat of [-60, -30, 30, 60]) { const pts = []; for (let lon = 0; lon <= 360; lon += 3) pts.push(proj(lat, lon, l0)); line(pts, 'rgba(28,27,24,0.22)', 2); }
    const eq = []; for (let lon = 0; lon <= 360; lon += 2) eq.push(proj(0, lon, l0)); line(eq, C.ink, 3, [12, 9]);
    const par = []; for (let lon = 0; lon <= 360; lon += 2) par.push(proj(ep.city.lat, lon, l0)); line(par, red ? C.red : C.ink, 5);
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(G.x, G.y, G.r, 0, Math.PI * 2); ctx.stroke();
    // şehir noktası: önde iken görünür
    const [x, y, z] = proj(ep.city.lat, ep.city.lon, l0);
    if (z > 0.05) {
      ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fillStyle = red ? C.red : C.ink; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
      setFont(ctx, F.mono(32)); ctx.fillStyle = red ? C.red : C.ink; ctx.textAlign = 'right'; ctx.fillText(ep.city.label, x - 20, y - 16); ctx.textAlign = 'left';
    }

  }
  // gösterge: yarım daire, 0 solda, max sağda
  const ang = v => Math.PI + (Math.min(v, GA.max) / GA.max) * Math.PI;
  function value(t) {
    let v = 0;
    for (const s of tl.stops) { if (t < s.t0) break; v = lerp(v, s.v, ease.state(seg(t, s.t0, s.t1 - s.t0))); }
    return v;
  }
  function gauge(t, v, red) {
    ctx.save();
    ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(GA.x, GA.y, GA.r, Math.PI, 0); ctx.stroke();
    setFont(ctx, F.mono(28)); ctx.fillStyle = C.graphite; ctx.textAlign = 'center';
    for (let k = 0; k <= GA.max; k += 100) {
      const a = ang(k), major = k % 500 === 0, r0 = GA.r - (major ? 30 : 16);
      ctx.lineWidth = major ? 4 : 2; ctx.beginPath(); ctx.moveTo(GA.x + Math.cos(a) * r0, GA.y + Math.sin(a) * r0); ctx.lineTo(GA.x + Math.cos(a) * GA.r, GA.y + Math.sin(a) * GA.r); ctx.stroke();
      if (major) ctx.fillText(nf.format(k), GA.x + Math.cos(a) * (GA.r - 56), GA.y + Math.sin(a) * (GA.r - 56) + 8);
    }
    // referans işaretleri: dışarıda üçgen + ad (ulaşıldığında koyulaşır)
    for (const m of ep.marks) {
      const a = ang(m.v), on = v >= m.v - 0.5;
      const px = GA.x + Math.cos(a) * (GA.r + 14), py = GA.y + Math.sin(a) * (GA.r + 14);
      ctx.save(); ctx.translate(px, py); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = on ? C.ink : C.graphite;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-9, -16); ctx.lineTo(9, -16); ctx.closePath(); ctx.fill(); ctx.restore();
      setFont(ctx, F.mono(30)); ctx.fillStyle = on ? C.ink : C.graphite;
      // sağ yandaki işaretlerin adı kadranın içine (kadraj dışına taşmaz)
      const inside = Math.cos(a) > 0.45, rr = inside ? GA.r - 74 : GA.r + 36;
      ctx.textAlign = inside ? 'right' : Math.cos(a) < -0.2 ? 'right' : Math.cos(a) > 0.2 ? 'left' : 'center';
      ctx.fillText(m.label, GA.x + Math.cos(a) * rr, GA.y + Math.sin(a) * rr + (inside ? 8 : -2));
    }
    ctx.textAlign = 'left';
    // ibre: küçük titreşim yok; sürekli hafif salınım yerine yaya bağlı oturma
    const a = ang(v);
    ctx.strokeStyle = red ? C.red : C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(GA.x - Math.cos(a) * 26, GA.y - Math.sin(a) * 26); ctx.lineTo(GA.x + Math.cos(a) * (GA.r - 24), GA.y + Math.sin(a) * (GA.r - 24)); ctx.stroke();
    ctx.beginPath(); ctx.arc(GA.x, GA.y, 16, 0, Math.PI * 2); ctx.fillStyle = red ? C.red : C.ink; ctx.fill();
    ctx.restore();
  }

  const S = tl.stops;
  const SAYS = [...S.map((s, i) => ({ t0: i ? s.t1 - 0.04 : 0, t1: S[i + 1] ? S[i + 1].t0 + 0.15 : tl.kickAt - 0.22, text: s.say, red: !!s.hero })),
    { t0: tl.kickAt - 0.04, t1: tl.rw0, text: ep.say.kicker }];
  function says(t) {
    for (const s of SAYS) {
      if (t < s.t0 || t >= s.t1 + 0.18) continue;
      const pin = s.t0 === 0 ? 1 : ease.enter(seg(t, s.t0, 0.3)), pout = t > s.t1 ? 1 - ease.exit(seg(t, s.t1, 0.18)) : 1;
      setFont(ctx, F.name(50));
      wrap(ctx, s.text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, pin * pout, s.red ? C.red : C.ink));
    }
  }
  function counter(t, v, red) {
    let cur = S[0]; for (const s of S) if (t >= s.t0 - 0.05) cur = s;
    setFont(ctx, F.mono(36)); ctx.fillStyle = red ? C.red : C.graphite; ctx.fillText(cur.label, SAFE.x0, counterY - 118);
    const sc = red ? lerp(0.9, 1, spring(t - tl.heroLand, 120, 24)) : 1;
    ctx.save(); ctx.translate(SAFE.x0, counterY); ctx.scale(sc, sc); ctx.translate(-SAFE.x0, -counterY);
    setFont(ctx, F.head(124)); ctx.fillStyle = red ? C.red : C.ink; const num = nf.format(Math.round(v)); ctx.fillText(num, SAFE.x0, counterY);
    const w = ctx.measureText(num).width; setFont(ctx, F.name(56)); ctx.fillText('km/sa', SAFE.x0 + w + 18, counterY);
    ctx.restore();
  }

  // Sıfır: yürür gibi bakar, uçağa sevinir, seste şaşırır, şehirde zıplar, sonunda dönerken mışıl mışıl uyur
  const actorScript = [
    { type: 'lookUp', t0: 0, t1: S[1].t0, expr: 'notr' },
    { type: 'happy', t0: S[1].t1 - 0.05, t1: S[2].t0 },
    { type: 'lookUp', t0: S[2].t0, t1: tl.silence0, expr: 'saskin' },
    { type: 'idle', t0: tl.silence0, t1: tl.heroLand - 0.05, expr: 'saskin' },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'lookUp', t0: tl.heroLand + 0.85, t1: tl.kickAt, expr: 'saskin' },
    { type: 'sleep', t0: tl.kickAt, t1: tl.rw0 },
    { type: 'lookUp', t0: tl.rw0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    header();
    const red = t >= tl.heroLand && t < tl.rw0;
    const vt = t >= tl.rw0 ? lerp(tl.rw0, 0, ease.state(seg(t, tl.rw0, (tl.rw1 - tl.rw0) - 0.4))) : t;
    const v = value(vt);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1440); ctx.clip();
    globe(t, red);
    ctx.restore();
    gauge(t, v, red);
    counter(t >= tl.rw0 ? vt : t, v, red);
    if (t < tl.rw0) says(t);
    else if (t > tl.rw1 - 0.5) { // döngü: kanca yazısı son yarım saniyede geri gelir (dikişte birden belirmez)
      setFont(ctx, F.name(50)); wrap(ctx, SAYS[0].text, SAFE.x1 - SAFE.x0).forEach((ln, i) => revealText(ctx, ln, SAFE.x0, counterY + 76 + i * 59, 50, ease.enter(seg(t, tl.rw1 - 0.5, 0.42)), C.ink));
    }
    drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

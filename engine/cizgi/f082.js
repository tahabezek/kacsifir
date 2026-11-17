// № 082 · Ses mi önce varır, uçak mı? (pilot, yapı B "tahmin et" yarışı; çizgi motoru, iki ses). Senaryo: research/pilot/082.md.
// Tek plan: gerçek Türkiye haritası (world-atlas countries-50m, Mercator). Kare 0 Ankara'da yakın plan top; "patlıyor"da
// ateşlenir, ses halka halka yayılır ve aynı anda Esenboğa'dan uçak havalanır. Yarış saati (C, dakika) sıkıştırılmış gerçek
// zamandır; yarışmacıların yeri C'nin saf fonksiyonudur: ses 343 m/sn (350 km → 17 dk), uçak havada ~45 dk (380 km,
// ortalama hızla; 17. dakikada rotanın %38'i). Doruk: ses İstanbul'a çarparken kamera geri çekilir, uçak aynı karede.
// Kritik turu 1 (5/6/5/5/6/6/7/7) sonrası yeniden kuruldu: YHT çıkarıldı, soru öne alındı, kanca yakın plan.
import { geoMercator, geoPath, geoInterpolate } from 'd3-geo';
import { feature } from 'topojson-client';
import { autoChunks } from '../hikaye_core.js';

const KIZILAY = [32.8541, 39.9208], TAKSIM = [28.9850, 41.0369], ESB = [32.9951, 40.1281], IST = [28.7519, 41.2753];
const C_SES = 17.0, C_UCAK = 45;

function times(T) {
  const w = (id, k) => T.w(id, k);
  const tB = w('l01', 'patlıyor');              // top ateşlenir, saat ve uçak başlar
  const tS = T.l03end;                          // son kilometreler sessizlikte, yavaş
  const tI = T.l04 - 0.3;                       // ses İstanbul'a çarpar (duraklamada)
  const tR = w('l04', 'Uçak') - 0.1;            // saat yeniden, yavaş akar
  const tL = w('l05', 'kırk');                  // uçak iner (45 dk): "kırk beşinci dakikada"
  const tG = w('l05', 'sesten') - 0.05;         // "+28 dk" farkı büyür (600 ms)
  const tC = w('l05', 'Bunu') - 0.1;            // gönder: fark çıkar, hızlar görünür
  const tF = w('l01', 'uçak');                  // dipnot: havalanma anında
  const tO = T.l01end + 0.05;                   // başlık çıkışı başlar (0,3 sn)
  const tU = tO + 0.6;                          // tabela yukarı (başlık bittikten 300 ms sonra)
  return { tB, tS, tI, tR, tL, tO, tU, tG, tC, tF };
}

export function hero(T) { return times(T).tI; }
export function cues(T) {
  const k = times(T), w = (id, n) => T.w(id, n);
  return {
    rumble: [[k.tB, 0.55]],
    whip: [[2.0, 2.4], [k.tU - 0.1, k.tU + 0.3], [T.loop0 - 0.1, T.loop0 + 0.45]],
    tick: [k.tG + 0.05, k.tC + 0.1],
    thock: [k.tL],
    riser: [T.l03, k.tS + 0.05],
    silence: [k.tS + 0.1, k.tI - 0.03],
    impact: k.tI,
    loopEnd: T.loop0,
  };
}

// tower.js wrap ile aynı kural (altyazı kutusunun ölçüsü için; yalnızca kırpma alanı)
function wrapW(ctx, text, maxW) {
  const raw = text.split(' '), words = [];
  for (let i = 0; i < raw.length; i++) { if (/^[%~]?\d[\d.,]*$/.test(raw[i]) && i + 1 < raw.length) { words.push(raw[i] + ' ' + raw[i + 1]); i++; } else words.push(raw[i]); }
  const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, poly, rect, circ, line, ch, CARDS, LW, fs } = A;
  const w = (id, k) => T.w(id, k);
  const K = times(T);
  const talk = (t, a, b) => (t > a && t < b ? 0.35 + 0.35 * Math.sin(t * 19) : 0);

  // ——— harita: Türkiye 960 px genişliğe oturur, merkezi (540, 1220) ———
  const topo = await (await fetch('../node_modules/world-atlas/countries-50m.json')).json();
  const all = feature(topo, topo.objects.countries).features;
  const TR = all.find(f => +f.id === 792);
  const proj = geoMercator().fitWidth(960, TR);
  { const b = geoPath(proj).bounds(TR), [tx, ty] = proj.translate(); proj.translate([tx + 540 - (b[0][0] + b[1][0]) / 2, ty + 1220 - (b[0][1] + b[1][1]) / 2]); }
  const P = p => proj(p);
  const toPath = geo => { const p = new Path2D(); geoPath(proj, p)(geo); return p; };
  const near = all.filter(f => +f.id !== 792 && f.geometry && (() => { const b = geoPath(proj).bounds(f); return b[1][0] > -2400 && b[0][0] < 3500 && b[1][1] > -2000 && b[0][1] < 4000; })());
  const NEAR = toPath({ type: 'FeatureCollection', features: near }), TRP = toPath(TR);
  const pK = P(KIZILAY), pT = P(TAKSIM), pE = P(ESB), pI = P(IST);
  const DPX = Math.hypot(pT[0] - pK[0], pT[1] - pK[1]);   // ses cephesi tam C_SES'te Taksim'e değer
  const gc = geoInterpolate(ESB, IST);
  const ELEV = 0.576;  // namlu 33° gökyüzüne (doğu-yukarı); uçağa nişan almaz

  // ——— altyazı alanları (motorun parça kuralıyla): harita çizgileri altyazının arkasından geçmez ———
  const ep = await (await fetch('../episodes/082-ses-mi-ucak-mi.json')).json();
  const capBoxes = [];
  { const ac = autoChunks(ep), list = [];
    for (const [id, arr] of Object.entries(ac)) {
      const raw = arr.map(([s, i]) => ({ s, t0: T.w(id, i) - 0.04 }));
      raw.forEach((c, i) => { c.t1 = i + 1 < raw.length ? raw[i + 1].t0 : T[id + 'end'] + 0.3; });
      for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (c.t1 - c.t0 < 1.25 && raw.length > 1) {
          if (i + 1 < raw.length) { raw[i + 1] = { s: c.s + ' ' + raw[i + 1].s, t0: c.t0, t1: raw[i + 1].t1 }; continue; }
          const p = list.at(-1); if (p && p.id === id) { p.s += ' ' + c.s; p.t1 = c.t1; continue; }
        }
        list.push({ ...c, id });
      }
    }
    for (let i = 0; i + 1 < list.length; i++) list[i].t1 = Math.min(list[i].t1, list[i + 1].t0);
    ctx.save(); ctx.font = '800 76px Archivo';
    for (const c of list) { const ls = wrapW(ctx, c.s, 830), mw = Math.max(...ls.map(l => ctx.measureText(l).width)); capBoxes.push({ t0: c.t0, t1: c.t1, x0: 540 - mw / 2 - 26, x1: 540 + mw / 2 + 26, y0: 1380 - (ls.length - 1) * 76 * 1.17 - 76 * 0.82 - 14, y1: 1380 + 50 }); }
    ctx.restore();
  }
  const capClip = t => {   // ekran koordinatında: altyazı kutusu dışı
    const b = capBoxes.find(c => t >= c.t0 && t < c.t1);
    ctx.save(); const m = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath(); ctx.rect(-100, -100, 1280, 2120); if (b) ctx.rect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    ctx.clip('evenodd'); ctx.setTransform(m);
  };

  // ——— yarış saati C(t), dakika ———
  const C = t => {
    if (t >= T.loop0) return lerp(C_UCAK, 0, ease.state(seg(t, T.loop0, D - T.loop0 - 0.15)));   // geri sarma
    if (t < K.tB) return 0;
    const cS = 16.2;
    if (t < K.tS) return cS * (t - K.tB) / (K.tS - K.tB);
    if (t < K.tI) { const u = (t - K.tS) / (K.tI - K.tS); return cS + (C_SES - cS) * (1 - (1 - u) * (1 - u)); }
    if (t < K.tR) return C_SES;
    if (t < T.l04end) return lerp(C_SES, 19.5, (t - K.tR) / (T.l04end - K.tR));
    if (t < K.tL) return lerp(19.5, C_UCAK, ease.state(seg(t, T.l04end - 0.1, K.tL - T.l04end + 0.1)));
    return C_UCAK;
  };
  const planeF = c => clamp01(c / C_UCAK);   // havada, ortalama hızla (380 km / 45 dk)
  const P17 = P(gc(C_SES / C_UCAK));

  // ——— ekran ölçeğinde çizim ———
  const zNow = () => ctx.getTransform().a;
  const at = (x, y, fn) => { const z = zNow(); ctx.save(); ctx.translate(x, y); ctx.scale(1 / z, 1 / z); fn(z); ctx.restore(); };
  // harita adı: ekran koordinatında, kutusu x 90–990 içinde kalır, kesilmez
  let tNow = 0;
  const label = (s, p, dx, dy, size = 42, side = null) => {
    const m = ctx.getTransform(), sx = m.a * p[0] + m.e, sy = m.d * p[1] + m.f;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = `800 ${size}px Archivo`; const tw = ctx.measureText(s).width;
    const bx = capBoxes.find(c => tNow >= c.t0 && tNow < c.t1), lim = Math.min(1215, bx ? bx.y0 - 16 : 1215);
    if (side && sy + dy > lim) { dx = side[0] + tw / 2; dy = side[1]; }
    let x = sx + dx; x = Math.max(90 + tw / 2, Math.min(920 - tw / 2, x));
    let y = Math.min(lim, sy + dy); y = Math.max(y, boardY(tNow) + 400);
    ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.24; ctx.strokeStyle = '#FBF7EE'; ctx.strokeText(s, x, y); ctx.fillStyle = PAL.ink; ctx.fillText(s, x, y);
    ctx.restore();
  };
  const NAVY = '#2E4A6B', SEA = '#BFD6DC', LANDO = '#E3DACA', LANDT = '#F6F0E2';

  // uçak (üstten): burun +x yönünde, 86 birim uzun
  const planeIcon = (ang, k = 1) => {
    ctx.save(); ctx.rotate(ang); ctx.scale(k, k); const lw = 4 / k * 1.1;
    poly([[6, 0], [-14, -40], [-24, -40], [-12, 0], [-24, 40], [-14, 40]], '#FFFFFF', lw);
    poly([[-30, 0], [-40, -15], [-46, -15], [-42, 0], [-46, 15], [-40, 15]], '#FFFFFF', lw);
    ctx.beginPath(); ctx.roundRect(-44, -7, 86, 14, 7); fs('#FFFFFF', lw);
    rect(-34, -3, 20, 6, NAVY, 0, 3);
    ctx.restore();
  };
  // top: kızak ve tekerlek Kızılay'da (0, 0), namlu 33° gökyüzüne (doğu-yukarı) kalkık; k ölçek (k = 1 → ~80 px)
  // fitil kare 0'dan yanar; ateşlemeden önce 0,3 sn küçük sarsıntı (≤ 4 px); tB'de 6 kare alev, 40 px geri tepme
  const BA = -ELEV, BL = 58;   // namlu doğu-yukarı: uçağın batıya giden rotasının tersine   // namlu açısı (ekran), namlu ağzı uzaklığı (birim)
  const muzzle = k => [Math.cos(BA) * BL * k, (Math.sin(BA) * BL - 4) * k];
  const cannon = (t, k) => {
    const sinceB = t - K.tB;
    const rec = sinceB > 0 && sinceB < 0.6 ? 40 * Math.exp(-sinceB * 9) * Math.min(1, sinceB * 30) : 0;   // ekran px, namlunun tersine
    const pre = sinceB > -0.3 && sinceB < 0 ? 1 : 0, shx = pre * 3.5 * Math.sin(t * 95), shy = pre * 2.5 * Math.sin(t * 71 + 1);
    ctx.save(); ctx.translate(-Math.cos(BA) * rec + shx, -Math.sin(BA) * rec * 0.3 + shy); ctx.scale(k, k); const lw = 4.5 / k * 1.2;
    poly([[16, 6], [-34, 6], [-46, 24], [8, 24]], '#7A5638', lw);                       // kızak
    ctx.save(); ctx.translate(0, -4); ctx.rotate(BA);
    ctx.beginPath(); ctx.roundRect(-22, -10, 76, 20, [10, 4, 4, 10]); fs('#3A3A40', lw);   // namlu
    rect(48, -12, 8, 24, '#2A2A30', lw, 3);
    // fitil ve kıvılcım (namlunun arkasında; yalnız ateşlemeden önce)
    if (t < K.tB) { line(-22, -4, -34, -20, lw * 0.9); const u = clamp01(t / K.tB), fx = lerp(-34, -22, u), fy = lerp(-20, -4, u), r = 6 + 2.5 * Math.sin(t * 40);
      for (let i = 0; i < 6; i++) { const a = i * 1.047 + t * 9, l = 9 + 4 * Math.sin(t * 31 + i * 2); line(fx + Math.cos(a) * r, fy + Math.sin(a) * r, fx + Math.cos(a) * (r + l), fy + Math.sin(a) * (r + l), lw * 0.5, i % 2 ? PAL.red : PAL.gold); }
      circ(fx, fy, r, PAL.gold, lw * 0.6); }
    // alev: 6 kare (0,2 sn), namlu doğrultusunda gökyüzüne
    if (sinceB >= 0 && sinceB < 0.2) { const s2 = 1 - sinceB / 0.2, pts = []; for (let i = 0; i < 14; i++) { const r = (i % 2 ? 9 : 26) * (0.7 + 0.5 * s2), a = (i / 14 - 0.5) * 2.0; pts.push([62 + Math.cos(a) * r, Math.sin(a) * r]); } poly(pts, PAL.gold, lw); }
    ctx.restore();
    circ(-12, 16, 15, '#A87A4E', lw); circ(-12, 16, 4, PAL.ink, 0);                      // tekerlek (önde)
    ctx.restore();
  };
  const cannonK = t => t >= T.loop0 ? lerp(1.9, 3.2, ease.state(seg(t, T.loop0, D - T.loop0 - 0.15))) : lerp(3.2, 1.9, ease.state(seg(t, 2.0, 0.9)));

  // ——— kamera: tek plan ———
  const camAtPt = (z, p, sy = 1000) => [z, p[0], p[1] - (sy - 960) / z];
  const mid = (a, b, u = 0.5) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const F0 = camAtPt(1.6, pK, 1115);
  const cam = [
    [0, ...F0],
    [1.4, ...camAtPt(1.696, pK, 1115)],
    [2.0, ...camAtPt(1.7, pK, 1115)],
    [2.9, 1.0, 540, 1000],
    [K.tU - 0.05, 1.04, ...mid([540, 1000], pK, 0.15)],
    [K.tU + 0.65, ...camAtPt(2.2, mid(pK, pT, 0.35), 1000)],
    [T.l03, ...camAtPt(2.35, mid(pK, pT, 0.55), 990)],
    [K.tS, ...camAtPt(2.3, mid(pK, pT, 0.5), 980)],
    [K.tI - 0.03, ...camAtPt(2.4, mid(pK, pT, 0.55), 980)],
    [K.tI + 0.6, ...camAtPt(2.05, mid(pK, pT, 0.5), 930)],
    [w('l04', 'Uçak') + 0.4, ...camAtPt(2.4, mid(pT, P17, 0.62), 900)],
    [T.l04end, ...camAtPt(2.25, mid(pT, pK, 0.42), 930)],
    [K.tL + 0.4, ...camAtPt(2.4, mid(pT, pK, 0.3), 930)],
    [T.loop0, ...camAtPt(2.1, mid(pT, pK, 0.45), 950)],
    [D - 0.12, ...F0],
    [D, ...F0],
  ];

  // ——— harita (dünya koordinatı) ———
  function drawMap(t) {
    tNow = t; const c = C(t), z = zNow();
    A.bg(SEA);
    ctx.fillStyle = LANDO; ctx.fill(NEAR); ctx.fillStyle = LANDT; ctx.fill(TRP);
    capClip(t);
    ctx.lineJoin = 'round'; ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.2 / z; ctx.stroke(NEAR);
    ctx.lineWidth = LW / z; ctx.strokeStyle = PAL.ink; ctx.stroke(TRP);
    ctx.save(); ctx.setLineDash([10 / z, 10 / z]); line(pK[0], pK[1], pT[0], pT[1], 2.5 / z, 'rgba(31,36,33,0.5)'); ctx.restore();
    // ses halkaları: cephe kırmızı ve kalın, arkasında üç kesik halka; C 21 sonrası söner
    const fade = 1 - clamp01((c - 21) / 8);
    if (c > 0 && fade > 0) {
      const rF = Math.max(DPX * c / C_SES, 90 / z), gap = 30 / z;
      ctx.save(); ctx.globalAlpha = fade;
      for (let k = 3; k >= 1; k--) { const r = rF - k * gap; if (r <= 0) continue; ctx.beginPath(); ctx.arc(pK[0], pK[1], r, 0, Math.PI * 2); ctx.lineWidth = 3 / z; ctx.strokeStyle = `rgba(194,65,47,${0.6 - k * 0.14})`; ctx.setLineDash([14 / z, 9 / z]); ctx.lineDashOffset = -t * 40 / z; ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(pK[0], pK[1], rF, 0, Math.PI * 2); ctx.lineWidth = 10 / z; ctx.strokeStyle = PAL.red; ctx.stroke();
      ctx.restore();
    }
    // uçağın izi
    const pf = planeF(c);
    if (pf > 0) { const tr = []; for (let i = 0; i <= 24; i++) tr.push(P(gc(pf * i / 24))); ctx.save(); ctx.setLineDash([12 / z, 8 / z]); ctx.beginPath(); tr.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineWidth = 4.5 / z; ctx.strokeStyle = NAVY; ctx.stroke(); ctx.restore(); }
    // patlama halkası (ateşlemede, ekran ölçeğinde; kalın)
    { const u = seg(t, K.tB, 0.7); if (u > 0 && u < 1 && t < T.loop0) at(pK[0], pK[1], () => { ctx.translate(...muzzle(cannonK(t))); for (const d of [0, 0.22]) { const v = clamp01((u - d) / (1 - d)); if (v <= 0 || v >= 1) continue; ctx.beginPath(); ctx.arc(0, 0, 30 + 200 * ease.enter(v), 0, Math.PI * 2); ctx.lineWidth = 14 * (1 - v) + 2; ctx.strokeStyle = PAL.red; ctx.stroke(); } }); }
    // çarpma: İstanbul'da 3 halkalık nabız, 600 ms, giriş eğrisi
    { const u = seg(t, K.tI - 2 / 30, 0.6 + 0.2); if (u > 0 && u < 1 && t < T.loop0) at(pT[0], pT[1], () => { for (let i = 0; i < 3; i++) { const v = seg(t, K.tI - 2 / 30 + i * 0.1, 0.6); if (v <= 0 || v >= 1) continue; const e = ease.enter(v); ctx.save(); ctx.globalAlpha = 1 - v * v; ctx.beginPath(); ctx.arc(0, 0, 18 + 190 * e, 0, Math.PI * 2); ctx.lineWidth = 8 + 8 * (1 - v); ctx.strokeStyle = PAL.red; ctx.stroke(); ctx.restore(); } }); }
    ctx.restore();   // capClip
    // şehir noktaları
    at(pK[0], pK[1], () => circ(0, 0, 10, PAL.ink, 0));
    at(pT[0], pT[1], () => circ(0, 0, 10, PAL.ink, 0));
    // top (namlu ağzı Kızılay'da)
    at(pK[0], pK[1], () => cannon(t, cannonK(t)));
    // uçak: havalanmadan önce Esenboğa'da; 1,45× (≥120 px)
    { const f = pf, q = P(gc(Math.min(0.999, f))), q2 = P(gc(Math.min(1, f + 0.002)));
      const [x, y] = f >= 1 ? pI : q, a = Math.atan2(q2[1] - q[1], q2[0] - q[0]);
      const off = 1 - ease.state(clamp01(f / 0.5));   // kalkışta namlunun solunda durur, ilk %30'da gerçek yerine kayar
      const zz = zNow(), rel = [(x - pK[0]) * zz, (y - pK[1]) * zz];
      at(pK[0], pK[1], () => { ctx.translate(lerp(rel[0], -235, off), lerp(rel[1], 40, off)); planeIcon(a, 1.45); });
    }
    { const k = cannonK(t), m = ctx.getTransform(), sx = m.a * pK[0] + m.e;
      ctx.save(); ctx.font = '800 42px Archivo'; const tw = ctx.measureText('ANKARA').width; ctx.restore();
      const v = ease.state(clamp01((sx + 24 * k + 8 + tw - 920) / 70));   // sağda yer yoksa noktanın sol altına kayar (sürekli)
      label('ANKARA', pK, lerp(24 * k + 8 + tw / 2, -(tw / 2 + 22), v), lerp(30 * k + 14, 30 * k + 30, v)); }
    label('İSTANBUL', pT, -60, 62);
  }

  // ——— yarış tabelası (ekran) ———
  const fmt2 = n => String(Math.floor(n)).padStart(2, '0');
  const clockStr = c => { const s = Math.round(c * 60); return `${fmt2(s / 3600)}:${fmt2((s % 3600) / 60)}:${fmt2(s % 60)}`; };
  const boardY = t => {
    if (t >= T.loop0) return lerp(290, 620, ease.state(seg(t, T.loop0, D - 0.5 - T.loop0)));
    return lerp(620, 290, ease.state(seg(t, K.tU, 0.6)));
  };
  const arrT = { [C_SES]: K.tI, [C_UCAK]: K.tL };
  function board(t) {
    const c = C(t), y = boardY(t), x0 = 90, x1 = 920;
    ctx.save();
    ctx.fillStyle = '#FBF7EE'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x0, y, 640, 160, 22); ctx.fill(); ctx.stroke();
    ctx.font = '800 118px Archivo'; ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.fillText(clockStr(c), x0 + 320, y + 124);
    ctx.restore();
    const rows = [['SES', PAL.red, C_SES, ''], ['UÇAK*', NAVY, C_UCAK, '']];
    rows.forEach(([name, col, arr, spd], i) => {
      const ry = y + 236 + i * 72;
      ctx.save();
      ctx.fillStyle = '#FBF7EE'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x0, ry - 52, x1 - x0, 66, 14); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x0 + 34, ry - 19, 15, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      ctx.font = '800 46px Archivo'; ctx.fillStyle = PAL.ink; ctx.textAlign = 'left'; ctx.fillText(name, x0 + 60, ry);
      const done = c >= arr - 1e-6, pop = done ? ease.enter(seg(t, arrT[arr], 0.3)) : 0;
      ctx.font = `800 ${Math.round(50 + 10 * (1 - pop) * (done ? 1 : 0))}px Archivo`;
      ctx.fillStyle = done ? col : 'rgba(31,36,33,0.35)';
      ctx.fillText(done ? clockStr(arr).slice(0, 5) : '··:··', x0 + 236, ry + 1);
      if (spd) { const u = ease.enter(seg(t, K.tC + 0.25, 0.35)); ctx.globalAlpha = u; ctx.font = '500 44px "IBM Plex Mono"'; ctx.fillStyle = PAL.ink; ctx.textAlign = 'right'; ctx.fillText(spd, x1 - 18, ry - 2 + (1 - u) * 14); ctx.globalAlpha = 1; }
      ctx.restore();
    });
    // dipnot: uçağın süresi havada geçen süre (kalkış ile iniş arası)
    if (t >= K.tF && t < T.loop0 + 0.2) {
      const u = ease.enter(seg(t, K.tF, 0.35)) * (1 - ease.exit(seg(t, T.loop0, 0.2))), fy = y + 236 + 2 * 72 + 12, s = '* havada geçen süre (~45–50 dk)';
      ctx.save(); ctx.globalAlpha = u; ctx.font = '500 44px "IBM Plex Mono"'; ctx.textAlign = 'left';
      ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#FBF7EE'; ctx.strokeText(s, x0 + 4, fy); ctx.fillStyle = PAL.ink; ctx.fillText(s, x0 + 4, fy);
      ctx.restore();
    }
    if (t >= K.tC + 0.25 && t < T.loop0 + 0.2) {   // hızlar: ses > uçak
      const u = ease.enter(seg(t, K.tC + 0.25, 0.35)) * (1 - ease.exit(seg(t, T.loop0, 0.2))), fy = y + 236 + 2 * 72 + 12 + 58;
      const a = '1.235 km/sa', b = ' > ', c2 = 'seyir ~850 km/sa';
      ctx.save(); ctx.globalAlpha = u; ctx.font = '500 44px "IBM Plex Mono"'; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#FBF7EE';
      let x = x0 + 4; for (const [str, col] of [[a, PAL.red], [b, PAL.ink], [c2, NAVY]]) { ctx.strokeText(str, x, fy + (1 - u) * 14); ctx.fillStyle = col; ctx.fillText(str, x, fy + (1 - u) * 14); x += ctx.measureText(str).width; }
      ctx.restore();
    }
    { const g = ease.enter(seg(t, K.tG, 0.6)), out = ease.exit(seg(t, T.loop0, 0.25));
      if (g > 0 && out < 1 && t < T.loop0) {
        const cx = 640, cy = y + 236 + 36 - 19, s = '+28 dk';
        const pc = t - K.tC, ph = pc > 0 ? pc % 2 : 9, pulse = ph < 0.6 ? 1 + 0.12 * Math.sin(Math.PI * ease.enter(ph / 0.6)) : 1;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(g * (1 - out) * pulse, g * (1 - out) * pulse);
        ctx.font = '800 54px Archivo'; const tw = ctx.measureText(s).width;
        ctx.fillStyle = PAL.red; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(-tw / 2 - 26, -42, tw + 52, 84, 42); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FBF7EE'; ctx.textAlign = 'center'; ctx.fillText(s, 0, 19);
        ctx.restore();
        // köşeli ayraç: SES saatinden UÇAK saatine
        ctx.save(); ctx.globalAlpha = g * (1 - out); ctx.strokeStyle = PAL.red; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(486, y + 236 - 19); ctx.lineTo(506, y + 236 - 19); ctx.lineTo(506, y + 308 - 19); ctx.lineTo(486, y + 308 - 19); ctx.stroke(); ctx.moveTo(506, cy); ctx.lineTo(540, cy); ctx.stroke();
        ctx.restore();
      } }
    // raf ve karakter
    ctx.save(); ctx.fillStyle = '#A87A4E'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(744, y + 148, 176, 16, 6); ctx.fill(); ctx.stroke(); ctx.restore();
    guy(t, 832, y + 148);
  }

  // "her şeyi bilen": tahminini söyler (Soran'ın sesi), sesi duyunca kulaklarını kapatır
  function guy(t, x, y) {
    let o = { x, y, s: 50, expr: 'notr', head: { look: [-0.45, 0.35] }, armL: { sh: 8, el: -4 }, armR: { sh: 8, el: -4 } };
    if (t >= T.l02 - 0.1 && t < T.l02end + 0.3) o = { ...o, expr: 'mutlu', talk: talk(t, T.l02, T.l02end), armL: { sh: 95, el: 8 }, head: { look: [-0.5, 0.1], tilt: -6 } };
    else if (t >= T.l03 && t < K.tI - 0.05) o = { ...o, armR: { sh: 140, el: 40 }, head: { look: [-0.5, 0.35], tilt: 6 } };
    else if (t >= K.tI - 0.05 && t < K.tI + 2.0) { const sh = Math.exp(-(t - K.tI) * 7) * 6 * Math.sin((t - K.tI) * 60); o = { ...o, x: x + sh, expr: 'saskin', armL: { sh: 140, el: 40 }, armR: { sh: 140, el: 40 }, head: { look: [0, 0] } }; }
    else if (t >= K.tI && t < T.loop0) { const late = t > w('l05', 'Bunu'); o = { ...o, expr: late ? 'yorgun' : 'saskin', head: { look: [-0.45, 0.4], tilt: late ? -8 : 0 } }; }
    ch(CARDS.sen, o, t);
  }

  return {
    cam,
    open: true, capSize: 76,
    title: ['Hangisi önce', "İstanbul'a varır?"],
    titleOut: K.tO,
    kicker: 'ANKARA – İSTANBUL · 350 KM',
    draw(t) { drawMap(t); },
    overlay(t) { board(t); },
  };
}

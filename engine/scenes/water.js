// Sahne: № 025 · Bütün su bir top olsa ("Masa" formatı, engine/masa.js). Sıfır masada, elinde küçük bir top tutar;
// kamera on'un kuvvetleriyle geri çekilir ve masa Dünya'nın yüzeyi olur (Kars). Okyanus taraması uzak denizlerden
// Trakya'ya doğru boşalır; su Trakya'da grafit bir topa dolar. Top Türkiye boyunca doğuya yuvarlanır (kaymadan:
// dönme = merkezin yolu / yarıçap), doğu ucundan 215 km önce durur ve kırmızıya döner (doruk).
// Dünya kökeni: masanın teğet olduğu nokta (40,5°K, 43°D; Kars). Küre bu noktada bir köşeye sahiptir (720×360 dilim):
// masa ölçeğinde bile yüzey kesin. Doğu = +x, yukarı = +y, kuzey = −z.
import { W, H, ease, seg, lerp, clamp01 } from '../core.js';
import { C, F, setFont } from '../tower.js';
import { SIFIR_CARD, mixPose, drawSifir } from '../sifir.js';
import { makeMasa, hex, col, track, SAFE } from '../masa.js';
import { feature } from '../../node_modules/topojson-client/src/index.js';
import { LineSegments2 } from '../../node_modules/three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from '../../node_modules/three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from '../../node_modules/three/examples/jsm/lines/LineMaterial.js';
import {
  R_E, DIAM, ORIGIN, TR_LINE, ROLL, BALLS, GAP_KM, buildWaterTimeline, ballR, drainAt, drainCap, rollAt, pullCam, kadraj,
} from './water_core.js';

const rad = d => (d * Math.PI) / 180;
const loadJSON = url => { const x = new XMLHttpRequest(); x.open('GET', url, false); x.send(); return JSON.parse(x.responseText); };

export function makeWaterRenderer(ep, overlay) {
  const tl = buildWaterTimeline(ep), D = tl.duration;
  const M = makeMasa(ep, overlay, { focusY: 1270 });
  const { THREE, scene, ctx } = M;

  // ——— Coğrafi çerçeve: küre geometrisi (SphereGeometry + eşdikdörtgen doku) → dünya ———
  const geoDir = (lat, lon) => new THREE.Vector3(Math.cos(rad(lat)) * Math.cos(rad(lon)), Math.sin(rad(lat)), -Math.cos(rad(lat)) * Math.sin(rad(lon)));
  const q1 = new THREE.Quaternion().setFromUnitVectors(geoDir(ORIGIN.lat, ORIGIN.lon), new THREE.Vector3(0, 1, 0));
  const east = new THREE.Vector3(-Math.sin(rad(ORIGIN.lon)), 0, -Math.cos(rad(ORIGIN.lon))).applyQuaternion(q1);
  const Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(east.z, east.x)).multiply(q1);
  const dirW = (lat, lon) => geoDir(lat, lon).applyQuaternion(Q);
  const GC = new THREE.Vector3(0, -R_E, 0);                       // küre merkezi (dünya, m)
  const surf = (lat, lon, h = 0) => GC.clone().addScaledVector(dirW(lat, lon), R_E + h);

  // ——— Doku: kâğıt okyanus, kraft kara, Türkiye bir ton koyu (çizgiler dokuda değil: ekranda sabit kalınlıklı 3B çizgi) ———
  const land = feature(loadJSON('../node_modules/world-atlas/land-110m.json'), 'land');
  const cw = loadJSON('../node_modules/world-atlas/countries-110m.json');
  const turkey = feature(cw, cw.objects.countries).features.find(f => f.id === '792');
  const TW = 8192, TH = 4096;
  const tex = document.createElement('canvas'); tex.width = TW; tex.height = TH;
  const mask = document.createElement('canvas'); mask.width = 2048; mask.height = 1024;
  const g = tex.getContext('2d'), gm = mask.getContext('2d');
  const polys = geom => (geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates);
  const geoms = f => (f.type === 'FeatureCollection' ? f.features.map(x => x.geometry) : [f.geometry]);
  function trace(c2, f, w, h) {
    c2.beginPath();
    for (const geom of geoms(f)) for (const poly of polys(geom)) for (const ring of poly) ring.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * w, y = (90 - la) / 180 * h; i ? c2.lineTo(x, y) : c2.moveTo(x, y); });
  }
  g.fillStyle = '#EEE7D7'; g.fillRect(0, 0, TW, TH);
  trace(g, land, TW, TH); g.fillStyle = '#D3BF98'; g.fill('evenodd');
  trace(g, turkey, TW, TH); g.fillStyle = '#C3AA7B'; g.fill('evenodd');
  gm.fillStyle = '#fff'; gm.fillRect(0, 0, 2048, 1024);
  trace(gm, land, 2048, 1024); gm.fillStyle = '#000'; gm.fill('evenodd');
  const map = new THREE.CanvasTexture(tex); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 16;
  const maskTex = new THREE.CanvasTexture(mask);

  // ——— Küre: okyanus taraması (ölçeğe uyan aralık) uzak denizlerden Trakya'ya doğru boşalır; çok seviyeli ızgara ———
  const globeU = { uMask: { value: maskTex }, uTh: { value: Math.PI }, uTD: { value: geoDir(ROLL.from.lat, ROLL.from.lon) },
    uInk: { value: col(hex(C.ink)) }, uDry: { value: col(hex('#DCD1BC')) } };
  const globeMat = new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0, fog: false });
  globeMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, globeU);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      uniform sampler2D uMask; uniform float uTh; uniform vec3 uTD; uniform vec3 uInk; uniform vec3 uDry;`)
      .replace('#include <map_fragment>', `#include <map_fragment>
      {
        float lon = radians(vMapUv.x * 360.0 - 180.0), lat = radians(vMapUv.y * 180.0 - 90.0);
        vec3 gd = vec3(cos(lat) * cos(lon), sin(lat), -cos(lat) * sin(lon));
        float ocean = texture2D(uMask, vMapUv).r;
        float ang = acos(clamp(dot(gd, uTD), -1.0, 1.0));
        float dr = smoothstep(uTh - 0.015, uTh + 0.015, ang);
        // tarama aralığı ölçeğe uyar: çizgiler ekranda en az ~7 px aralıklı
        float sp = 1.2 * exp2(max(0.0, ceil(log2(fwidth(degrees(lat)) * 7.0 / 1.2))));
        float lp = degrees(lat) / sp;
        float hl = abs(fract(lp) - 0.5) / max(fwidth(lp), 1e-5);
        float hatch = 1.0 - min(hl, 1.0);
        // çok seviyeli ızgara (0,01° · 0,1° · 1° · 10°): çizgi aralığı ekranda 5–16 px olduğunda belirir
        float la = degrees(lat), lo = degrees(lon), grat = 0.0, fw = max(fwidth(la), 1e-7);
        for (int i = 0; i < 4; i++) {
          float Lg = 0.01 * pow(10.0, float(i));
          vec2 q = vec2(la, lo) / Lg;
          vec2 gq = abs(fract(q - 0.5) - 0.5) / max(fwidth(q), vec2(1e-6));
          float vis = smoothstep(5.0, 16.0, Lg / fw);
          grat = max(grat, (1.0 - min(min(gq.x, gq.y) / 1.6, 1.0)) * vis * (i == 3 ? 0.4 : 0.3));
        }
        diffuseColor.rgb = mix(diffuseColor.rgb, uInk, grat);
        diffuseColor.rgb = mix(diffuseColor.rgb, uDry, ocean * dr * 0.7);
        diffuseColor.rgb = mix(diffuseColor.rgb, uInk, hatch * ocean * (1.0 - dr) * 0.6);
      }`);
  };
  const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 720, 360), globeMat);
  globe.quaternion.copy(Q);
  scene.add(globe);

  // ——— Kıyı ve Türkiye sınırı: ekranda sabit kalınlıkta mürekkep çizgi (yüzeyin 2 km üstünde) ———
  function lineObj(f, px) {
    const pos = [];
    for (const geom of geoms(f)) for (const poly of polys(geom)) for (const ring of poly) for (let i = 0; i < ring.length - 1; i++) {
      const a = geoDir(ring[i][1], ring[i][0]).multiplyScalar(1.0003), b = geoDir(ring[i + 1][1], ring[i + 1][0]).multiplyScalar(1.0003);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const lg2 = new LineSegmentsGeometry(); lg2.setPositions(pos);
    const mat = new LineMaterial({ color: new THREE.Color(C.ink), linewidth: px, worldUnits: false, fog: false });
    mat.resolution.set(W, H);
    const o = new LineSegments2(lg2, mat); o.quaternion.copy(Q); o.frustumCulled = false;
    scene.add(o);
    return o;
  }
  const coast = lineObj(land, 2.2), border = lineObj(turkey, 3.4);

  // ——— Toplar: bütün su (grafit → dorukta kırmızı; yuvarlandığı görünsün diye mürekkep çizgili), tatlı su, göl ———
  const stripe = document.createElement('canvas'); stripe.width = 1024; stripe.height = 512;
  { const s = stripe.getContext('2d'); s.fillStyle = '#fff'; s.fillRect(0, 0, 1024, 512); s.strokeStyle = '#3a3530'; s.lineWidth = 7;
    for (let i = 0; i < 6; i++) { const x = i * 1024 / 6; s.beginPath(); s.moveTo(x, 0); s.lineTo(x, 512); s.stroke(); }
    for (const y of [128, 256, 384]) { s.beginPath(); s.moveTo(0, y); s.lineTo(1024, y); s.stroke(); } }
  const stripeTex = new THREE.CanvasTexture(stripe); stripeTex.colorSpace = THREE.SRGBColorSpace; stripeTex.anisotropy = 8;
  const ballGeo = new THREE.SphereGeometry(1, 96, 64);
  const mkBall = (hexc, map) => { const m = new THREE.Mesh(ballGeo, M.lacquer(new THREE.Color(hexc), map)); m.material.color = new THREE.Color(hexc); m.material.fog = false; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
  const balls = { all: mkBall('#6E695F', stripeTex), fresh: mkBall(C.ink), lake: mkBall('#6E695F') };
  const GRAPH = new THREE.Color('#6E695F'), RED = new THREE.Color(C.red);

  // ——— Sıfır: kökende, masada; elinde küçük bir top (kancanın imgesi) ———
  const HS = 0.0055, SPX = 380;
  const sifA = M.makeStandee(), sifB = M.makeStandee();
  const mini = [mkBall('#6E695F'), mkBall('#6E695F')];
  const POSE_0 = { lean: -4, tilt: -10, la: -24, ra: 60, ll: -6, rl: 6, sq: 0 };
  const POSE_UP = { lean: -8, tilt: -20, la: -30, ra: 168, ll: -8, rl: 8, sq: -0.04 };
  const LOOK_UP = { eye: 1.1, mouth: 'o', m: 0.6, look: [0.25, -0.95] };
  const sifirPose = tau => mixPose(POSE_0, POSE_UP, ease.state(seg(tau, 0, 0.35)));
  const probe = document.createElement('canvas').getContext('2d');
  function handTop(pose) {                       // elin üstü (dünya, m): kök (0,0) → el; top elin üstüne oturur
    const h = drawSifir(probe, SIFIR_CARD, pose, LOOK_UP, SPX, { facing: 1, noShadow: true }).handR;
    return [h[0] / SPX * HS, -h[1] / SPX * HS + SIFIR_CARD.hand / 2 * HS];
  }
  const MINI_R = 0.0013;

  // ——— Yuvarlanma: Trakya → doğu (büyük çember üstünde), kaymadan ———
  const A = dirW(ROLL.from.lat, ROLL.from.lon), B = dirW(ROLL.to.lat, ROLL.to.lon), ANG = A.angleTo(B);
  const AX = new THREE.Vector3().crossVectors(A, B).normalize();
  function ballState(t) {
    const r = ballR(tl, t, 'all'), s = rollAt(tl, t), th = s * ANG;
    const P = A.clone().applyAxisAngle(AX, th);
    const lift = 1 - sstep(tl.roll[0] - 0.4, tl.roll[0] + 0.6, t);
    const c = GC.clone().addScaledVector(P, R_E + r * lift);
    const q = new THREE.Quaternion().setFromAxisAngle(AX, th * (R_E + r) / Math.max(r, 1));
    return { r, c, q };
  }
  const ballC = (which, t) => (which === 'all' ? ballState(t).c : surf(BALLS[which].lat, BALLS[which].lon, ballR(tl, t, which)));

  // ——— Kamera ———
  const sstep = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  function pullState(t) {
    const p = pullCam(tl, t), lg = Math.log10(p.S);
    const w1 = sstep(-2.2, 0, lg), w2 = sstep(5.8, 6.7, lg);
    return {
      F: [0, -R_E * 0.6 * w2, 0], S: p.S, M: p.M,
      az: lerp(0.52, 0.3, w2), el: lerp(lerp(0.24, 1.05, sstep(-1.6, 0.6, lg)), 0.78, w2), ly: lerp(lerp(1.12, 0, w1), 0, w2),
      focusY: lerp(1270, 1340, w2), fogNear: lerp(1.02, 1.8, w2), fogFar: lerp(1.55, 4, w2), grid: lerp(0.16, 0.75, sstep(-1.4, -0.3, lg)),
      aperture: 0.011 * (1 - sstep(-1.0, 1.0, lg)),
    };
  }
  const PLAN_F = surf(TR_LINE.lat, 35.4), FRESH_F = PLAN_F.clone().lerp(surf(BALLS.fresh.lat, BALLS.fresh.lon), 0.3);
  const LAKE_F = surf(BALLS.lake.lat, BALLS.lake.lon, DIAM.lake / 2);
  const K = [
    // plan görünüşü (tam tepeden, kuzey yukarıda). Göl çekimi kırmızı topun tepesinden yüksekte; harita 90° döner
    // (batı aşağıda): kırmızı top hep kadrajın altında kalır
    { t: tl.roll[0], F: PLAN_F, S: 1.46e6, M: 9.0, az: 0.0, el: 1.5, fy: 1120 },
    { t: tl.land, F: PLAN_F, S: 1.44e6, M: 9.0, az: 0.0, el: 1.5, fy: 1120 },
    { t: tl.fresh[0] - 0.3, F: PLAN_F, S: 1.41e6, M: 9.0, az: 0.0, el: 1.5, fy: 1120 },
    { t: tl.fresh[1] + 0.5, F: FRESH_F, S: 1.35e6, M: 9.0, az: 0.02, el: 1.5, fy: 1120 },
    { t: tl.lake[0] - 0.3, F: FRESH_F, S: 1.3e6, M: 9.0, az: 0.04, el: 1.5, fy: 1120 },
    { t: tl.lake[1] + 0.6, F: LAKE_F, S: 0.2e6, M: 9.0, az: Math.PI / 2, el: 1.48, fy: 1180 },
    { t: tl.dive[0], F: LAKE_F, S: 0.16e6, M: 9.0, az: Math.PI / 2 + 0.14, el: 1.47, fy: 1180 },
  ];
  const kf = f => track(K.map(k => [k.t, f(k)]));
  const kS = kf(k => Math.log(k.S)), kM = kf(k => k.M), kAz = kf(k => k.az), kEl = kf(k => k.el), kFy2 = kf(k => k.fy);
  const kFx = kf(k => k.F.x), kFy = kf(k => k.F.y), kFz = kf(k => k.F.z);
  const blend = (a, b, w, wf) => ({
    F: [lerp(a.F[0], b.F[0], wf), lerp(a.F[1], b.F[1], wf), lerp(a.F[2], b.F[2], wf)],
    S: Math.exp(lerp(Math.log(a.S), Math.log(b.S), w)), M: lerp(a.M, b.M, w), az: lerp(a.az, b.az, w), el: lerp(a.el, b.el, w),
    ly: lerp(a.ly, b.ly, w), focusY: lerp(a.focusY, b.focusY, w), fogNear: lerp(a.fogNear, b.fogNear, w), fogFar: lerp(a.fogFar, b.fogFar, w), grid: lerp(a.grid, b.grid, w),
    aperture: lerp(a.aperture ?? 0, b.aperture ?? 0, w),
  });
  const trackState = t => ({ F: [kFx(t), kFy(t), kFz(t)], S: Math.exp(kS(t)), M: kM(t), az: kAz(t), el: kEl(t), ly: 0, focusY: kFy2(t), fogNear: 1.3, fogFar: 3.5, grid: 0, aperture: 0 });
  const LA = tl.lake[0] - 0.3, LB = tl.lake[1] + 0.6;
  function lateState(t) {
    if (t <= LA || t >= LB) return trackState(t);
    const a = trackState(LA), b = trackState(LB), w = ease.state((t - LA) / (LB - LA));
    const S = Math.exp(lerp(Math.log(a.S), Math.log(b.S), w));
    return blend(a, b, w, clamp01((a.S - S) / (a.S - b.S)));
  }
  const Z0 = tl.drain[1] - 1.0;                  // küre görünüşünden plan görünüşüne
  const globeState = t => { const u = clamp01((t - tl.pull[1]) / (Z0 - tl.pull[1])); return { ...pullState(tl.pull[1]), S: lerp(0.85, 0.78, u) * R_E, M: lerp(9.5, 9.3, u), az: lerp(0.3, 0.42, ease.state(u)) }; };
  function camAt(t) {
    let s;
    if (t <= tl.pull[1]) s = pullState(t);
    else if (t < Z0) s = globeState(t);
    else if (t < tl.roll[0]) {                   // odak, ölçekle orantılı yaklaşır
      const a = globeState(Z0), b = lateState(tl.roll[0]);
      const w = ease.state((t - Z0) / (tl.roll[0] - Z0)), S = Math.exp(lerp(Math.log(a.S), Math.log(b.S), w));
      s = blend(a, b, w, clamp01((a.S - S) / (a.S - b.S)));
    } else if (t <= tl.dive[0]) s = lateState(t);
    else {                                       // dalış: Sıfır'a; son kare = ilk kare
      const mac = pullState(t - D);
      if (t >= tl.dive[1]) s = mac;
      else {
        const wide = lateState(t), w = ease.state((t - tl.dive[0]) / (tl.dive[1] - tl.dive[0]));
        const S = Math.exp(lerp(Math.log(wide.S), Math.log(mac.S), w));
        s = blend(wide, mac, w, clamp01((wide.S - S) / (wide.S - mac.S)));
      }
    }
    if (t > tl.land && t < tl.land + 1) s.M *= 1 - 0.05 * Math.exp(-(t - tl.land) * 6);   // doruk darbesi
    return s;
  }

  // ——— t anında dünyayı kur ———
  const groundMat = M.ground.material;
  groundMat.transparent = true;
  function pose(t, lens, jit) {
    const s = camAt(t);
    M.setCam(s, lens, jit);
    const S = s.S, lg = Math.log10(S);
    groundMat.opacity = 1 - sstep(0.6, 2.6, lg);             // kâğıt masa 4 m – 400 m arasında kaybolur
    M.ground.visible = groundMat.opacity > 0.002;
    globe.visible = lg > 1.3;
    if (globe.visible) { globe.position.copy(M.rel(GC.x, GC.y - 0.003 * S, GC.z)); globe.scale.setScalar(R_E / S); }
    for (const o of [coast, border]) {
      o.visible = lg > 2.6;
      if (o.visible) { o.position.copy(M.rel(GC.x, GC.y, GC.z)); o.scale.setScalar(R_E / S); }
    }
    globeU.uTh.value = drainCap(drainAt(tl, t)).th;
    const bs = ballState(t);
    if (bs.r < 1) balls.all.visible = false;
    else { M.place(balls.all, bs.c.x, bs.c.y, bs.c.z, bs.r); balls.all.quaternion.copy(bs.q); }
    balls.all.material.color.copy(GRAPH).lerp(RED, ease.state(seg(t, tl.land - 0.05, 0.3)) * (1 - ease.state(seg(t, tl.land + 3.0, 0.5))));
    for (const k of ['fresh', 'lake']) {
      const r = ballR(tl, t, k), c = ballC(k, t);
      if (r < 1) { balls[k].visible = false; continue; }
      M.place(balls[k], c.x, c.y, c.z, r);
    }
    [[sifA, mini[0], t], [sifB, mini[1], t - D]].forEach(([sd, mb, tau], i) => {
      const p = sifirPose(tau);
      M.paintStandee(sd, p, tau > 1.4 ? 'saskin' : LOOK_UP, 1);
      M.place(sd.g, 0, 0, 0.0016, HS);
      const on = i === 0 ? t < 6 : t > 28;
      sd.g.visible = sd.g.visible && on;
      const [hx, hy] = handTop(p);
      M.place(mb, hx, hy + MINI_R, 0.0016, MINI_R);
      mb.visible = mb.visible && on;
    });
  }
  const shutter = t => (t > tl.pull[0] && t < tl.pull[1] ? 0.15 : (t > tl.roll[0] && t < tl.land) || t > tl.dive[0] ? 0.4 : 0.12);

  // ——— 2B kaplama ———
  const L = M.layout;
  const nf = d => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const projV = v => M.project(v.x, v.y, v.z);
  const tick = (x, y) => { ctx.beginPath(); ctx.moveTo(x - 5, y + 5); ctx.lineTo(x + 5, y - 5); ctx.stroke(); };
  function label(text, x, y, color, u, align = 'center', bg = false) {
    if (u <= 0) return;
    setFont(ctx, F.mono(48)); ctx.fillStyle = color;
    const w = ctx.measureText(text).width;
    let lx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    lx = Math.max(SAFE.x0, Math.min(SAFE.x1 - w, lx));
    if (bg) {                                       // kâğıt zemin: harita çizgileri etiketin altından geçmesin
      ctx.save(); ctx.globalAlpha = 0.92 * ease.state(clamp01(u)); ctx.fillStyle = C.paper;
      ctx.beginPath(); ctx.roundRect(lx - 14, y - 48, w + 28, 62, 6); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.beginPath(); ctx.rect(lx - 8, y - 40, w + 16, 52); ctx.clip();
    M.halo(text, lx, y + (1 - ease.enter(u)) * 44, 10); ctx.restore();
  }
  // yatay ölçü: a → b, uçlarda dikey uzatma ve 45° çentik; çizgi ortadan büyür
  function hline(a, b, u, color, w = 3) {
    if (u <= 0) return;
    const g = ease.state(clamp01(u)), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(lerp(mx, a[0], g), lerp(my, a[1], g)); ctx.lineTo(lerp(mx, b[0], g), lerp(my, b[1], g)); ctx.stroke();
    if (g > 0.98) { tick(a[0], a[1]); tick(b[0], b[1]); }
    ctx.restore();
  }

  function drawOverlay(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    M.header();
    // ölçek çubuğu: geri çekilişte ve dalışta kadrajın gerçek genişliği (boş zemin anlarında da ölçü akar)
    {
      const u = seg(t, tl.pull[0] + 0.3, 0.15) * (1 - seg(t, tl.pull[1] + 0.2, 0.3)) + seg(t, tl.dive[0] + 0.35, 0.2) * (1 - seg(t, tl.dive[1] - 0.55, 0.25));
      if (u > 0.01) {
        const mpp = kadraj(camAt(t)) / W, e = Math.floor(Math.log10(mpp * 240));
        const len = [1, 2, 5, 10].map(k => k * 10 ** e).find(v => v / mpp >= 240), px = len / mpp;
        const txt = len >= 1000 ? `${nf(0).format(len / 1000)} km` : len >= 1 ? `${nf(0).format(len)} m` : `${nf(0).format(len * 100)} cm`;
        const y = 1400;
        ctx.save(); ctx.globalAlpha = clamp01(u); ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(SAFE.x0, y - 12); ctx.lineTo(SAFE.x0, y); ctx.lineTo(SAFE.x0 + px, y); ctx.lineTo(SAFE.x0 + px, y - 12); ctx.stroke();
        ctx.restore();
        label(txt, SAFE.x0 + px + 16, y + 4, C.ink, clamp01(u), 'left');
      }
    }
    // sayaç (anlamlı: yüzeydeki su oranı → topun çapı → tatlı su → göl ve nehir)
    const mid = (tl.dive[0] + tl.dive[1]) / 2;
    if (t < tl.drain[0] || t >= mid) M.counter('TOPUN ÇAPI', '?', 'km');
    else if (t < tl.fresh[0]) {
      const hero = t >= tl.land && t < tl.land + 3.0;
      M.counter('TOPUN ÇAPI', nf(0).format(2 * ballR(tl, t, 'all') / 1000), 'km', hero ? C.red : C.ink, hero ? C.red : C.graphite);
    } else if (t < tl.lake[0]) M.counter('TATLI SU', nf(0).format(2 * ballR(tl, t, 'fresh') / 1000), 'km');
    else M.counter('GÖL VE NEHİR', nf(0).format(lerp(273, 56, ease.state(seg(t, tl.lake[0], tl.lake[1] - tl.lake[0])))), 'km');

    for (const s of ep.says) M.clipReveal(s.text, SAFE.x0, L.saysY, 44, s.red ? C.red : C.ink, s.t0, s.t1, t, 56);

    // Sıfır'ın durduğu nokta: Kars (Sıfır küçülüp kaybolurken onun yerinde belirir; 600 km'de çekilir)
    if (t < tl.pull[1] + 0.5 || t > tl.dive[0]) {
      const lg = Math.log10(camAt(t).S), u = sstep(-0.85, -0.45, lg) * (1 - sstep(5.3, 5.8, lg));
      if (u > 0.01) {
        const [x, y] = M.project(0, 0, 0);
        ctx.save(); ctx.fillStyle = C.ink; ctx.strokeStyle = C.paper; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(x, y, 9 * ease.enter(u), 0, Math.PI * 2); ctx.stroke(); ctx.fill(); ctx.restore();
        label('Kars', x + 22, y + 14, C.ink, u, 'left');
      }
    }

    // doruk: top çapı (yatay, uçları topun siluetinde) · altında Türkiye'nin doğu-batı boyu, kalan 215 km kırmızı ·
    // topun üstünde Türkiye sınırı (mürekkep, opak): topun kesiti Türkiye'den büyük, çapı Türkiye'nin boyundan kısa
    const h0 = tl.land + 0.2, h1 = tl.fresh[0] - 0.25;
    if (t > h0 && t < h1 + 0.3) {
      const out = 1 - ease.exit(seg(t, h1, 0.3));
      const bs = ballState(t), cP = projV(bs.c);
      const rgt = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0).multiplyScalar(bs.r);
      const eP = projV(bs.c.clone().add(rgt)), rp = Math.hypot(eP[0] - cP[0], eP[1] - cP[1]);
      // Türkiye çubuğu topun ölçeğinden: toplam = top çapı × 1600/1385, kırmızı = toplam × 215/1600
      const bW = cP[0] - rp, bE = cP[0] + rp, Wx = bW, Ex = bW + 2 * rp * 1600 / 1385, yT = cP[1] + rp + 40;
      const u1 = seg(t, h0, 0.6) * out, u0 = seg(t, h0 + 0.4, 0.9) * out, u2 = seg(t, h0 + 0.9, 0.6) * out, u3 = seg(t, h0 + 1.5, 0.5) * out;
      // Türkiye sınırı topun üstünde: kalem gibi çizilir
      if (u0 > 0) {
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
        let len = 0; const paths = [];
        for (const geom of geoms(turkey)) for (const poly of polys(geom)) for (const ring of poly) {
          const pts = ring.map(([lo, la]) => projV(surf(la, lo)));
          for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          paths.push(pts);
        }
        ctx.setLineDash([len * ease.state(u0), len]);
        ctx.beginPath(); for (const pts of paths) pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke(); ctx.restore();
      }
      hline([bW, cP[1]], [bE, cP[1]], u1, C.ink);
      const uL = clamp01((u1 - 0.5) / 0.5);
      if (uL > 0) {
        setFont(ctx, F.mono(48)); const lw = ctx.measureText('1.385 km').width + 28;
        ctx.save(); ctx.globalAlpha = 0.92 * ease.state(uL); ctx.fillStyle = C.paper;
        ctx.beginPath(); ctx.roundRect(cP[0] - lw / 2, cP[1] - 78, lw, 62, 6); ctx.fill(); ctx.restore();
      }
      label('1.385 km', cP[0], cP[1] - 30, C.ink, uL);
      if (u2 > 0) {                                // topun kenarlarından Türkiye çizgisine ince uzatma çizgileri
        ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
        for (const x of [bW, bE]) { ctx.beginPath(); ctx.moveTo(x, cP[1] + 8); ctx.lineTo(x, lerp(cP[1] + 8, yT, ease.state(u2))); ctx.stroke(); }
        ctx.restore();
      }
      hline([Wx, yT], [Ex, yT], u2, C.ink);
      hline([bE, yT], [Ex, yT], u3, C.red, 6);
      label('Türkiye · 1.600 km', Wx, yT + 46, C.ink, u3, 'left');
      label(`${GAP_KM} km kaldı`, SAFE.x1, yT - 14, C.red, clamp01((u3 - 0.4) / 0.6), 'right');
    }
    // küçük toplar: ölçü topun kuzeyinde (ekranda üstünde), etiket çizginin üstünde
    for (const [k, t0, t1, txt, t2, sub] of [['fresh', tl.fresh[1], tl.lake[0] - 0.3, '273 km', tl.fresh[1] + 2.5, "bütün suyun %0,77'si"], ['lake', tl.lake[1], tl.dive[0], '56 km', tl.lake[1] + 3.0, "bütün suyun %0,007'si"]]) {
      if (t < t0 || t > t1 + 0.3) continue;
      const u = seg(t, t0, 0.6) * (1 - ease.exit(seg(t, t1, 0.3)));
      const c = ballC(k, t), r = ballR(tl, t, k), cP = projV(c);
      const rgt = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0).multiplyScalar(r);
      const rp = Math.hypot(projV(c.clone().add(rgt))[0] - cP[0], projV(c.clone().add(rgt))[1] - cP[1]);
      const y = cP[1] - rp - 18;
      hline([cP[0] - rp, y], [cP[0] + rp, y], u, C.ink);
      label(txt, cP[0], y - 22, C.ink, clamp01((u - 0.5) / 0.5), 'center', true);
      // yeni vuruş: bütün suya oranı, topun altında
      label(sub, cP[0], Math.max(cP[1] + rp + 62, k === 'fresh' ? 1385 : 0), C.ink, seg(t, t2, 0.5) * (1 - ease.exit(seg(t, t1, 0.3))));
    }
  }

  window.__water = { camAt, tl };
  return { duration: D, timeline: tl, render(t) { M.render(t, pose, shutter); drawOverlay(t); } };
}

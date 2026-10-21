// "Masa" formatının ortak 3B tabanı (№ 024 domino ile kuruldu; 025+ bölümler bunu kullanır).
// Dünya metre cinsinden tanımlanır; her örnekte kamera odağına (F) göre ve o anki ölçeğe (S) bölünerek çizilir:
// milimetreden yüz binlerce kilometreye kadar her ölçek float32'de hassas kalır. Her kare, kare içindeki zaman,
// mercek diski ve alt piksel örneklerinin ortalamasıdır (hareket bulanıklığı + alan derinliği + kenar yumuşatma);
// çıkış Khronos PBR Neutral ton eşlemesi, gren ve titreşimle. Kare t'nin saf fonksiyonudur; rastgelelik tohumlu.
//
// Kullanım (sahne modülü):
//   const M = makeMasa(ep, overlay, { focusY });
//   ... M.scene'e nesneler ekle ...
//   function pose(t, lens, jit) { M.setCam(camState(t), lens, jit); /* nesneleri M.rel / M.S ile yerleştir */ }
//   return { duration, timeline, render(t) { M.render(t, pose, shutter); drawOverlay(t); } };
import * as THREE from 'three';
import { RoomEnvironment } from '../node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { W, H, ease, seg, lerp, clamp01, mulberry32, FPS } from './core.js';
import { C, F, setFont, wrap } from './tower.js';
import { SIFIR_CARD, drawSifir } from './sifir.js';

export const SAFE = { x0: 90, x1: 920 };

// ——— Renk: hedef sRGB → doğrusal; zemin rengi ton eşlemesinin tersiyle birebir #ECE5D5 okunur ———
const s2l = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export const hex = h => [1, 3, 5].map(i => s2l(parseInt(h.slice(i, i + 2), 16) / 255));
function neutral([r, g, b]) {
  const x = Math.min(r, g, b), off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  r -= off; g -= off; b -= off;
  const peak = Math.max(r, g, b), sc = 0.76;
  if (peak < sc) return [r, g, b];
  const d = 1 - sc, np = 1 - (d * d) / (peak + d - sc);
  r *= np / peak; g *= np / peak; b *= np / peak;
  const gg = 1 - 1 / (0.15 * (peak - np) + 1);
  return [lerp(r, np, gg), lerp(g, np, gg), lerp(b, np, gg)];
}
function preTone(target) {
  let L = target.slice();
  for (let i = 0; i < 60; i++) { const o = neutral(L); L = L.map((v, j) => v + (target[j] - o[j])); }
  return L;
}
export const col = arr => new THREE.Color().setRGB(arr[0], arr[1], arr[2], THREE.LinearSRGBColorSpace);
export const PAPER_L = preTone(hex(C.paper));

// Fritsch–Carlson monoton kübik: kamera izi düğümleri arasında kırılmasız, aşmasız
export function monotone(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (xs[i + 1] - xs[i - 1])) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]);
  return x => {
    if (x <= xs[0]) return ys[0] + m[0] * (x - xs[0]);
    if (x >= xs[n - 1]) return ys[n - 1] + m[n - 1] * (x - xs[n - 1]);
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], s = (x - xs[i]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}
export const track = kn => monotone(kn.map(a => a[0]), kn.map(a => a[1]));

export function makeMasa(ep, overlay, opts = {}) {
  const FOCUS_Y = opts.focusY ?? 1270;

  // ——— Tuvaller: altta WebGL, üstte 2B kaplama ———
  const glc = document.createElement('canvas');
  glc.width = W; glc.height = H;
  for (const el of [glc, overlay]) Object.assign(el.style, { position: 'absolute', left: '0', top: '0', width: W + 'px', height: H + 'px' });
  overlay.parentNode.insertBefore(glc, overlay);
  const ctx = overlay.getContext('2d');

  const gl = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
  gl.setPixelRatio(1);
  gl.setSize(W, H, false);
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  gl.toneMapping = THREE.NoToneMapping;
  gl.autoClear = false;                       // birikim hedefi elle temizlenir (yoksa zemin rengi her geçişte eklenir)

  const scene = new THREE.Scene();
  scene.background = col(PAPER_L);
  scene.fog = new THREE.Fog(col(PAPER_L), 1, 3);
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(opts.fov ?? 30, W / H, 0.01, 6000);

  const key = new THREE.DirectionalLight(new THREE.Color('#FFF4E4'), 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(new THREE.Color('#FFFFFF'), 1.1);
  scene.add(rim, rim.target);
  scene.add(new THREE.HemisphereLight(col(PAPER_L), new THREE.Color('#8B8577'), 0.55));

  // ——— Zemin: kâğıt + ölçeğe göre geçişli ızgara ———
  const gridU = { uL: { value: [1, 1, 1, 1] }, uA: { value: [0, 0, 0, 0] }, uOffX: { value: [0, 0, 0, 0] }, uOffZ: { value: [0, 0, 0, 0] }, uS: { value: 1 }, uInk: { value: col(hex(C.ink)) } };
  const groundMat = new THREE.MeshStandardMaterial({ color: col(hex('#E9E2D1')), roughness: 0.96, metalness: 0 });
  groundMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, gridU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vGp;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vGp; uniform float uL[4]; uniform float uA[4]; uniform float uOffX[4]; uniform float uOffZ[4]; uniform float uS; uniform vec3 uInk;
      float gline(vec2 p) { vec2 w = fwidth(p); vec2 g = abs(fract(p - 0.5) - 0.5) / max(w, 1e-6); return 1.0 - min(min(g.x, g.y), 1.0); }`)
      .replace('#include <map_fragment>', `#include <map_fragment>
      float gridSum = 0.0;
      for (int i = 0; i < 4; i++) {
        vec2 p = vec2(vGp.x * uS + uOffX[i], vGp.z * uS + uOffZ[i]) / uL[i];
        gridSum = max(gridSum, gline(p) * uA[i]);
      }
      diffuseColor.rgb = mix(diffuseColor.rgb, uInk, gridSum);`);
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ——— Malzemeler ———
  const lacquer = (color, map) => new THREE.MeshPhysicalMaterial({ color: map ? 0xffffff : color, map: map || null, roughness: 0.38, clearcoat: 0.85, clearcoatRoughness: 0.16, metalness: 0 });
  const paper = (h = '#DED3BC', o = {}) => new THREE.MeshStandardMaterial({ color: col(hex(h)), roughness: 0.93, metalness: 0, fog: false, ...o });
  const edgeMat = new THREE.LineBasicMaterial({ color: col(hex(C.ink)), fog: false });
  const withEdges = (geom, mat, thr = 28) => {
    const m = new THREE.Mesh(geom, mat); m.castShadow = true; m.receiveShadow = true;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom, thr), edgeMat));
    return m;
  };

  // ——— Sıfır: kâğıttan kesilmiş ayaklı figür (tek çizim fonksiyonu drawSifir; kimlik kilitli) ———
  const SPX = 380, SCW = 768, SCH = 1024, ROOT = [384, 940];
  function makeStandee() {
    const cv = document.createElement('canvas'); cv.width = SCW; cv.height = SCH;
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const mat = new THREE.MeshStandardMaterial({ map: tx, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 });
    const pg = new THREE.PlaneGeometry(SCW / SPX, SCH / SPX);
    pg.translate((SCW / 2 - ROOT[0]) / SPX, (ROOT[1] - SCH / 2) / SPX, 0);   // kök: ayakların ortası, birim = baş çapı
    const m = new THREE.Mesh(pg, mat);
    m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tx, alphaTest: 0.5 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: col(hex('#F4EFE3')), roughness: 0.9 }));
    base.position.y = 0.025; base.castShadow = true; base.receiveShadow = true;
    const g = new THREE.Group(); g.add(m, base);
    scene.add(g);
    return { g, cv, tx, key: '' };
  }
  function paintStandee(sd, pose, expr, facing = 1) {
    const k = JSON.stringify([pose, expr, facing]);
    if (k === sd.key) return;
    sd.key = k;
    const g = sd.cv.getContext('2d');
    g.clearRect(0, 0, SCW, SCH);
    g.save(); g.translate(ROOT[0], ROOT[1]);
    drawSifir(g, SIFIR_CARD, pose, expr, SPX, { facing, noShadow: true });
    g.restore();
    sd.tx.needsUpdate = true;
  }

  // ——— Kamera: durum = { F: [x,y,z] m, S: ölçek (m/birim), M: uzaklık (birim), az, el (rad), ly: bakış yüksekliği (birim) } ———
  let CAM = null, DD = 1;
  const v3 = new THREE.Vector3();
  const rel = (x, y, z) => v3.set((x - CAM.F[0]) / CAM.S, (y - CAM.F[1]) / CAM.S, (z - CAM.F[2]) / CAM.S);
  function setCam(state, lens, jit) {
    CAM = state;
    const Dd = DD = state.M;
    const look = new THREE.Vector3(0, state.ly ?? 0.45, 0);
    const dir = new THREE.Vector3(-Math.sin(state.az) * Math.cos(state.el), Math.sin(state.el), Math.cos(state.az) * Math.cos(state.el));
    camera.position.copy(look).addScaledVector(dir, Dd);
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    if (lens) {                                // mercek diski üstünde bir nokta: odak düzlemi keskin kalır
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      const ap = state.aperture ?? 0.011;
      camera.position.addScaledVector(right, lens[0] * Dd * ap).addScaledVector(up, lens[1] * Dd * ap);
      camera.lookAt(look);
    }
    camera.near = Dd * 0.01; camera.far = Dd * 1500;
    camera.setViewOffset(W, H, (jit ? jit[0] : 0), H / 2 - (state.focusY ?? FOCUS_Y) + (jit ? jit[1] : 0), W, H);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    scene.fog.near = Dd * (state.fogNear ?? 1.02); scene.fog.far = Dd * (state.fogFar ?? 1.55);
    // ızgara seviyeleri: çizgi aralığı ölçekle birlikte geçişli (mm → cm → m → km)
    const lv = Math.log10(state.S) - 0.15, n = Math.floor(lv);
    for (let i = 0; i < 4; i++) {
      const L = Math.pow(10, n - 1 + i), x = Math.log10(L) - lv;
      gridU.uL.value[i] = L;
      gridU.uA.value[i] = (state.grid ?? 0.16) * clamp01(x + 1) * clamp01(2 - x);
      gridU.uOffX.value[i] = ((state.F[0] % L) + L) % L;
      gridU.uOffZ.value[i] = ((state.F[2] % L) + L) % L;
    }
    gridU.uS.value = state.S;
    ground.position.set(0, -state.F[1] / state.S, 0);
    // ışıklar odak çevresinde
    const E = Dd * 1.6;
    key.position.set(-0.5 * 30, 1.0 * 30, 0.62 * 30);
    key.target.position.set(0, 0, 0);
    Object.assign(key.shadow.camera, { left: -E, right: E, top: E, bottom: -E, near: 0.1, far: 80 });
    key.shadow.camera.updateProjectionMatrix();
    rim.position.set(0.7 * 30, 0.55 * 30, -0.9 * 30);
  }
  // nesneyi dünya konumuna (m) ve dünya ölçeğine (m) yerleştir; çok küçükse gizle
  function place(obj, x, y, z, size = 1, sy = size, sz = size) {
    const tiny = CAM.S * DD * 2e-4;
    obj.visible = Math.max(size, sy, sz) > tiny;
    if (!obj.visible) return false;
    obj.position.copy(rel(x, y, z));
    obj.scale.set(size / CAM.S, sy / CAM.S, sz / CAM.S);
    return true;
  }

  // ——— Örnek birikimi ve çıkış ———
  const rtS = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType });
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const accMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, w: { value: 1 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb * w, 1.0); }',
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation, depthTest: false, depthWrite: false,
  });
  const outMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rtA.texture }, seed: { value: 0 }, expo: { value: 1 } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform float seed; uniform float expo; varying vec2 vUv;
      vec3 neutral(vec3 c){ float x = min(c.r, min(c.g, c.b)); float off = x < 0.08 ? x - 6.25 * x * x : 0.04; c -= off;
        float peak = max(c.r, max(c.g, c.b)); if (peak < 0.76) return c; float d = 0.24; float np = 1.0 - d * d / (peak + d - 0.76);
        c *= np / peak; float g = 1.0 - 1.0 / (0.15 * (peak - np) + 1.0); return mix(c, vec3(np), g); }
      float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423) + seed); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
      vec3 enc(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      void main(){ vec3 c = neutral(max(texture2D(tex, vUv).rgb * expo, 0.0)); c = enc(clamp(c, 0.0, 1.0));
        float l = dot(c, vec3(0.299, 0.587, 0.114)); float n = hash(gl_FragCoord.xy) - 0.5;
        c += n * 0.026 * (1.0 - abs(l - 0.5) * 1.4) + (hash(gl_FragCoord.yx + 7.0) - 0.5) / 255.0;
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), accMat); quad.frustumCulled = false; quadScene.add(quad);

  // pose(t, lens, jit): sahne modülü kamerayı (setCam) ve nesneleri kurar. shutter(t): deklanşör (kare cinsinden)
  function render(t, pose, shutter = () => 0.5) {
    const NS = window.__samples || ep.samples || 16;
    const r = mulberry32(Math.round(t * FPS) * 7919 + 13);
    gl.setRenderTarget(rtA); gl.setClearColor(0x000000, 0); gl.clear();
    for (let i = 0; i < NS; i++) {
      const ts = t + ((i + r()) / NS - 0.5) * (shutter(t) / FPS);
      const a = 2 * Math.PI * ((i * 0.618034 + r()) % 1), rr = Math.sqrt((i + 0.5) / NS);
      pose(ts, NS > 1 ? [Math.cos(a) * rr, Math.sin(a) * rr] : null, NS > 1 ? [r() - 0.5, r() - 0.5] : null);
      const j = 0.035;                         // ana ışığın titreşimi: yumuşak gölge
      key.position.x += (r() - 0.5) * 30 * j; key.position.z += (r() - 0.5) * 30 * j;
      gl.setRenderTarget(rtS); gl.setClearColor(scene.background, 1); gl.clear();
      gl.render(scene, camera);
      quad.material = accMat; accMat.uniforms.tex.value = rtS.texture; accMat.uniforms.w.value = 1 / NS;
      gl.setRenderTarget(rtA); gl.render(quadScene, quadCam);
    }
    quad.material = outMat; outMat.uniforms.seed.value = (Math.round(t * FPS) % 97) * 0.731;
    gl.setRenderTarget(null); gl.render(quadScene, quadCam);
    pose(t, null, null);                        // kaplama için merkez kamera
  }

  // ——— 2B kaplama yardımcıları ———
  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const qY = 374 + qSize * 0.86;
  const counterY = qY + qSize * (ep.question.length - 1) + 150;
  const saysY = counterY + 92;
  // kâğıt hale: metin, arkasından geçen 3B nesnenin üstünde de okunur (gölge ya da kutu değil)
  function halo(s, x, y, w) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.lineWidth = w;
    ctx.strokeStyle = 'rgba(236,229,213,0.9)'; ctx.strokeText(s, x, y); ctx.restore();
    ctx.fillText(s, x, y);
  }
  function project(x, y, z) {
    const p = rel(x, y, z).clone().project(camera);
    return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z];
  }
  // satır satır kırpma açılışı (fade değil): giriş 0,35 sn, çıkış 0,25 sn
  function clipReveal(text, x, y, size, color, t0, t1, t, lh, font = F.name) {
    const inU = ease.enter(seg(t, t0, 0.35)), outU = ease.exit(seg(t, t1 - 0.25, 0.25));
    if (inU <= 0 || outU >= 1) return;
    setFont(ctx, font(size));
    const lines = wrap(ctx, text, SAFE.x1 - SAFE.x0);
    lines.forEach((ln, i) => {
      ctx.save();
      ctx.beginPath(); ctx.rect(x - 4, y + i * lh - size * 1.02, SAFE.x1 - x + 8, size * 1.32); ctx.clip();
      const dy = (1 - inU) * size * 1.1 - outU * size * 1.2;
      ctx.fillStyle = color; halo(ln, x, y + i * lh + dy, 12);
      ctx.restore();
    });
  }
  // mimari ölçü çizgisi: uzatma çizgileri → çizgi ortadan büyür → çentikler → etiket. Çizgi geometriyi izler;
  // etiket belirdiği andaki çapaya (pin = [x, yTop, yMid], ekran px) sabitlenir: okunurken kıpırdamaz.
  function dimV(a, b, u, color, label, side, pin, mode) {
    if (u <= 0) return;
    const [ax, ay] = a, [bx, by] = b;
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'butt';
    const ext = clamp01(u / 0.3), grow = ease.state(clamp01((u - 0.2) / 0.5)), lab = ease.enter(clamp01((u - 0.6) / 0.4));
    const ox = side * 26;
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + ox * ext, ay); ctx.moveTo(bx, by); ctx.lineTo(bx + ox * ext, by); ctx.stroke();
    const mx = (ax + bx) / 2 + ox * 0.8, my = (ay + by) / 2;
    const y0 = lerp(my, ay, grow), y1 = lerp(my, by, grow);
    ctx.beginPath(); ctx.moveTo(mx, y0); ctx.lineTo(mx, y1); ctx.stroke();
    if (grow > 0.98) for (const y of [ay, by]) { ctx.beginPath(); ctx.moveTo(mx - 9, y + 9); ctx.lineTo(mx + 9, y - 9); ctx.stroke(); }
    ctx.globalAlpha = 1;
    if (lab > 0 && label) {
      setFont(ctx, F.mono(44)); ctx.fillStyle = C.ink;
      const lines = label.split('\n'), lh = 50;
      const wMax = Math.max(...lines.map(l => ctx.measureText(l).width));
      const [px, pTop, pMid] = pin || [mx, Math.min(ay, by), my];
      let lx, ly;
      if (mode === 'top') { lx = px + ox * 0.8 - wMax / 2; ly = pTop - 26; }
      else { lx = side < 0 ? px + ox * 0.8 - 18 - wMax : px + ox * 0.8 + 18; ly = pMid; }
      lx = Math.max(SAFE.x0, Math.min(SAFE.x1 - wMax, lx));
      const top = ly - (lines.length - 1) * lh;
      const tx = mx, ty = mode === 'top' ? Math.min(ay, by) : my;
      const nx = Math.max(lx, Math.min(lx + wMax, tx)), ny = mode === 'top' ? ly + 10 : Math.max(top - 34, Math.min(ly + 8, ty));
      if (Math.hypot(nx - tx, ny - ty) > 14) {
        ctx.save(); ctx.globalAlpha = 0.7 * lab; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(tx, ty); ctx.stroke(); ctx.restore();
      }
      lines.forEach((ln, i) => {
        const y = top + i * lh;
        ctx.save(); ctx.beginPath(); ctx.rect(lx - 8, y - 40, wMax + 16, 52); ctx.clip();
        halo(ln, lx, y + (1 - lab) * 44, 10); ctx.restore();
      });
    }
    ctx.restore();
  }
  // başlık: seri etiketi + soru (kare 0'dan sona sabit; okunurken kıpırdamaz)
  function header() {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; halo(ep.serial, SAFE.x0, 336, 10);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => halo(q, SAFE.x0, qY + i * qSize, 16));
  }
  // büyük sayaç: etiket (mono) + sayı (Archivo 800) + birim; etiket en son çizilir (Ş çengeli halenin altında kalmasın)
  function counter(label, num, unit, color = C.ink, labelColor = C.graphite) {
    setFont(ctx, F.head(112)); ctx.fillStyle = color;
    halo(num, SAFE.x0, counterY, 18);
    const kw = ctx.measureText(num).width;
    if (unit) { setFont(ctx, F.name(56)); ctx.fillStyle = color; halo(unit, SAFE.x0 + kw + 26, counterY, 12); }
    setFont(ctx, F.mono(34)); ctx.fillStyle = labelColor;
    halo(label, SAFE.x0, counterY - 100, 9);
  }

  window.__masa = { scene, camera, gl, THREE, get cam() { return CAM; } };

  return {
    THREE, scene, camera, gl, ctx, key, rim, ground,
    lacquer, paper, edgeMat, withEdges, makeStandee, paintStandee,
    setCam, place, rel, get cam() { return CAM; }, get dist() { return DD; },
    render, project, halo, clipReveal, dimV, header, counter,
    layout: { qSize, qY, counterY, saysY, SAFE },
  };
}

// "Sinema" 3B tabanı (№ 067 altın küp ile kuruldu): kâğıt estetiği yerine gece, ışık ve gerçek malzeme.
// Dünya metre cinsinden; kamera { pos, tgt, fov, focus, aperture } ile kurulur. Her kare, kare içindeki zaman,
// mercek diski ve alt piksel örneklerinin ortalamasıdır (hareket bulanıklığı + alan derinliği + kenar yumuşatma).
// Çıkış: HDR birikim → iki kademeli parlama (yalnız parlak noktalar) → pozlama → ACES film eğrisi → vinyet → gren.
// Kare t'nin saf fonksiyonudur; rastgelelik tohumlu.
//
// Kullanım (sahne modülü):
//   const S = makeSinema(ep, overlay, { fog, sky });
//   ... S.scene'e nesneler ekle ...
//   function pose(t, lens, jit) { S.setCam(cam(t), lens, jit); /* hareketli nesneleri t'ye göre yerleştir */ }
//   render(t) { S.render(t, pose); /* 2B kaplama: S.ctx, S.project */ }
import * as THREE from 'three';
import { W, H, lerp, mulberry32, FPS } from './core.js';

const s2l = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export const lin = h => new THREE.Color().setRGB(...[1, 3, 5].map(i => s2l(parseInt(h.slice(i, i + 2), 16) / 255)), THREE.LinearSRGBColorSpace);

// Fritsch–Carlson monoton kübik: anahtarlar arasında kırılmasız, aşmasız
export function monotone(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (xs[i + 1] - xs[i - 1])) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]);
  return x => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], s = (x - xs[i]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}
// vektör anahtarları: [[t, [x,y,z]], ...] → t → [x,y,z]
export function track3(keys) {
  const xs = keys.map(k => k[0]), f = [0, 1, 2].map(j => monotone(xs, keys.map(k => k[1][j])));
  return t => f.map(g => g(t));
}

export function makeSinema(ep, overlay, opts = {}) {
  const glc = document.createElement('canvas');
  glc.width = W; glc.height = H;
  for (const el of [glc, overlay]) Object.assign(el.style, { position: 'absolute', left: '0', top: '0', width: W + 'px', height: H + 'px' });
  overlay.parentNode.insertBefore(glc, overlay);
  const ctx = overlay.getContext('2d');

  const gl = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  gl.setPixelRatio(1);
  gl.setSize(W, H, false);
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  gl.toneMapping = THREE.NoToneMapping;
  gl.outputColorSpace = THREE.LinearSRGBColorSpace;   // ton eşleme ve sRGB kodlama çıkış geçişinde
  gl.autoClear = false;

  const scene = new THREE.Scene();
  const fogCol = lin(opts.fog ?? '#0E0C0D');
  scene.background = fogCol;
  scene.fog = new THREE.FogExp2(fogCol, opts.fogDensity ?? 0.006);
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);

  // ——— Kamera: pos/tgt (m), fov (derece), focus (m, varsayılan hedef uzaklığı), aperture (m, mercek yarıçapı) ———
  let CAM = null;
  const vPos = new THREE.Vector3(), vTgt = new THREE.Vector3(), vDir = new THREE.Vector3(), vR = new THREE.Vector3(), vU = new THREE.Vector3();
  function setCam(c, lens, jit) {
    CAM = c;
    vPos.set(...c.pos); vTgt.set(...c.tgt);
    camera.fov = c.fov ?? 40;
    camera.up.set(0, 1, 0);
    camera.position.copy(vPos); camera.lookAt(vTgt); camera.updateMatrixWorld();
    if (lens) {                                 // odak düzlemi keskin: kamera mercek diskinde kayar, odak noktasına bakar
      const dist = vPos.distanceTo(vTgt), focus = c.focus ?? dist;
      vDir.subVectors(vTgt, vPos).normalize();
      const fp = vPos.clone().addScaledVector(vDir, focus);
      vR.setFromMatrixColumn(camera.matrixWorld, 0); vU.setFromMatrixColumn(camera.matrixWorld, 1);
      const ap = c.aperture ?? 0.02;
      camera.position.addScaledVector(vR, lens[0] * ap).addScaledVector(vU, lens[1] * ap);
      camera.lookAt(fp);
    }
    camera.setViewOffset(W, H, jit ? jit[0] : 0, jit ? jit[1] : 0, W, H);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  // ——— Hedefler ve geçişler ———
  const half = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  const rtS = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType });
  const b1 = [new THREE.WebGLRenderTarget(W / 2, H / 2, half), new THREE.WebGLRenderTarget(W / 2, H / 2, half)];
  const b2 = [new THREE.WebGLRenderTarget(W / 8, H / 8, half), new THREE.WebGLRenderTarget(W / 8, H / 8, half)];
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const accMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, w: { value: 1 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb * w, 1.0); }',
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation, depthTest: false, depthWrite: false,
  });
  const brightMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rtA.texture }, thr: { value: opts.bloomThreshold ?? 1.1 }, px: { value: new THREE.Vector2(1 / W, 1 / H) } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform float thr; uniform vec2 px; varying vec2 vUv;
      void main(){ vec3 c = vec3(0.0);
        for (int i = 0; i < 4; i++) { vec2 o = vec2(i == 1 || i == 3 ? 1.0 : -1.0, i >= 2 ? 1.0 : -1.0) * px; c += texture2D(tex, vUv + o).rgb; }
        c *= 0.25; float l = max(c.r, max(c.g, c.b)); float k = max(l - thr, 0.0); k = k * k / (k + 0.5);
        gl_FragColor = vec4(c * (k / max(l, 1e-4)), 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const blurMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv;
      void main(){ float wt[5]; wt[0]=0.2270270; wt[1]=0.1945946; wt[2]=0.1216216; wt[3]=0.0540540; wt[4]=0.0162162;
        vec3 c = texture2D(tex, vUv).rgb * wt[0];
        for (int i = 1; i < 5; i++) { c += texture2D(tex, vUv + dir * float(i) * 1.6).rgb * wt[i]; c += texture2D(tex, vUv - dir * float(i) * 1.6).rgb * wt[i]; }
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const copyMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb, 1.0); }',
    depthTest: false, depthWrite: false,
  });
  const outMat = new THREE.ShaderMaterial({
    uniforms: {
      tex: { value: rtA.texture }, bl1: { value: b1[0].texture }, bl2: { value: b2[0].texture }, seed: { value: 0 },
      expo: { value: opts.exposure ?? 1 }, bloom: { value: opts.bloom ?? 0.5 }, vig: { value: opts.vignette ?? 0.32 },
    }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform sampler2D bl1; uniform sampler2D bl2; uniform float seed; uniform float expo; uniform float bloom; uniform float vig; varying vec2 vUv;
      vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423) + seed); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
      vec3 enc(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      void main(){
        vec3 c = texture2D(tex, vUv).rgb + bloom * (0.65 * texture2D(bl1, vUv).rgb + 0.45 * texture2D(bl2, vUv).rgb);
        vec2 q = (vUv - 0.5) * vec2(1.0, 1.35); c *= 1.0 - vig * smoothstep(0.25, 0.95, dot(q, q) * 1.6);
        c = enc(aces(max(c * expo, 0.0)));
        float l = dot(c, vec3(0.299, 0.587, 0.114)); float n = hash(gl_FragCoord.xy) - 0.5;
        c += n * 0.03 * (1.0 - abs(l - 0.45) * 1.3) + (hash(gl_FragCoord.yx + 7.0) - 0.5) / 255.0;
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), accMat); quad.frustumCulled = false; quadScene.add(quad);
  const pass = (mat, target) => { quad.material = mat; gl.setRenderTarget(target); gl.render(quadScene, quadCam); };
  function blur(pair, w, h, src) {
    blurMat.uniforms.tex.value = src; blurMat.uniforms.dir.value.set(1 / w, 0); pass(blurMat, pair[1]);
    blurMat.uniforms.tex.value = pair[1].texture; blurMat.uniforms.dir.value.set(0, 1 / h); pass(blurMat, pair[0]);
  }

  // pose(t, lens, jit): kamera ve hareketli nesneler. shutter(t): deklanşör (kare cinsinden)
  function render(t, pose, shutter = () => 0.5) {
    const NS = window.__samples || ep.samples || 16;
    const r = mulberry32(Math.round(t * FPS) * 7919 + 13);
    gl.setRenderTarget(rtA); gl.setClearColor(0x000000, 0); gl.clear();
    gl.shadowMap.autoUpdate = false;                // gölge haritası karede bir kez (örnek başına değil): hız
    for (let i = 0; i < NS; i++) {
      gl.shadowMap.needsUpdate = i === 0;
      const ts = t + ((i + r()) / NS - 0.5) * (shutter(t) / FPS);
      const a = 2 * Math.PI * ((i * 0.618034 + r()) % 1), rr = Math.sqrt((i + 0.5) / NS);
      pose(ts, NS > 1 ? [Math.cos(a) * rr, Math.sin(a) * rr] : null, NS > 1 ? [r() - 0.5, r() - 0.5] : null);
      gl.setRenderTarget(rtS); gl.setClearColor(scene.background, 1); gl.clear();
      gl.render(scene, camera);
      accMat.uniforms.tex.value = rtS.texture; accMat.uniforms.w.value = 1 / NS;
      pass(accMat, rtA);
    }
    pass(brightMat, b1[0]);
    blur(b1, W / 2, H / 2, b1[0].texture);
    copyMat.uniforms.tex.value = b1[0].texture; pass(copyMat, b2[0]);
    blur(b2, W / 8, H / 8, b2[0].texture);
    blur(b2, W / 8, H / 8, b2[0].texture);
    outMat.uniforms.seed.value = (Math.round(t * FPS) % 97) * 0.731;
    pass(outMat, null);
    pose(t, null, null);                         // kaplama için merkez kamera
  }

  const pv = new THREE.Vector3();
  function project(x, y, z) {
    pv.set(x, y, z).project(camera);
    return [(pv.x + 1) / 2 * W, (1 - pv.y) / 2 * H, pv.z];
  }

  window.__sinema = { scene, camera, gl, THREE, get cam() { return CAM; } };
  return { THREE, scene, camera, gl, ctx, setCam, render, project, get cam() { return CAM; } };
}

// ——— Kaplama yazısı: koyu, yumuşak gölgeli beyaz; karartma değil kırpma/kayma ile girer ———
export function shadowText(ctx, s, x, y, fill, blur = 18) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = blur; ctx.shadowOffsetY = 3;
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
  ctx.restore();
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
}
export { lerp };

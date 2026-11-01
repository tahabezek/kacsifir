// "Buz ve ateş" şablonu (№ 060): Hangisi daha şaşırtıcı? Buzun altında donan doktor mu, yanan kentten kurtulan mahkûm mu?
// A dünyası: Norveç'te donmuş bir nehir; buzda kırık bir delik, yanında kayaklar. Kamera deliğe dalar; buzun altında
// gümüş bir hava cebi, yükselen kabarcıklar. Kalp durur (EKG düzleşir, ekranı kırağı sarar), sonra ışığa çıkış.
// B dünyası: 1902 Saint-Pierre. Taş hücre, kapıdaki dar ızgaradan sabah ışığı; yanardağ patlar, ışık turuncuya döner,
// içeri kor dolar. Denizden: kızgın bulut yanardağdan kente iner. Doruk: AYNI termometre; buzda 13,7'ye iner,
// hücrenin dışında yükselir ve "dört yüz"de camı patlar (filmin tek büyük vuruşu).
// Sürekli döngüler: A'da kar ve kabarcıklar; B'de ışıkta toz, sonra kor ve kül. Her kare t'nin saf fonksiyonu.
import { W, H, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { F, setFont } from '../tower.js';
import { makeSinema, lin, track3, monotone, shadowText } from '../sinema.js';
import { makeOverlay, cameraTrack, CX, SAFE } from '../sinema_overlay.js';
import { buzatesTimes, camKeys, world, thermoA, thermoB, bodyTemp, BX, THERMO_A, THERMO_B, SCALE } from './buzates_core.js';

const ICE_BLUE = '#8FD3FF', HEAT = '#FF8A2A';

export async function makeBuzatesRenderer(ep, canvas) {
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const { tl, T } = buzatesTimes(ep, voice), D = tl.duration;
  const S = makeSinema(ep, canvas, { fog: '#AEBBC8', fogDensity: 0.006, exposure: 1.0, bloom: 0.5, bloomThreshold: 1.0, vignette: 0.34 });
  const { THREE, scene, ctx } = S;
  const std = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.8, metalness: 0, ...o });
  const gA = new THREE.Group(), gB = new THREE.Group(), gT = new THREE.Group(), gC = new THREE.Group();   // gT: kent, gC: hücre
  scene.add(gA, gB); gB.add(gT, gC);
  const box = (w, h, d, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const canvasTex = (w, h, draw, srgb = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const skyMat = (top, hor) => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: lin(top) }, hor: { value: lin(hor) }, k: { value: 1 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform float k; varying vec3 vP; void main(){ float h = clamp(vP.y * 2.4, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h, 0.6)) * k, 1.0); }',
  });
  // ortam haritası: gri-mavi gök, açık zemin (cam ve buz yansımaları)
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), skyMat('#7F93A8', '#D9E2EA')));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshBasicMaterial({ color: lin('#C9D3DC') })); fl.rotation.x = -Math.PI / 2; fl.position.y = -4; env.add(fl);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 4), side: THREE.DoubleSide })); p.position.set(10, 25, -30); p.lookAt(0, 0, 0); env.add(p);
    scene.environment = new THREE.PMREMGenerator(S.gl).fromScene(env, 0.02).texture;
    scene.environmentIntensity = 0.8;
  }

  // ═══════════════ A: Norveç, donmuş nehir ═══════════════
  const skyA = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), skyMat('#33445A', '#93A4B6')); gA.add(skyA);
  const hemiA = new THREE.HemisphereLight(lin('#B4C6DA'), lin('#6E7E90'), 0.75); gA.add(hemiA);
  const sunA = new THREE.DirectionalLight(lin('#FFD2A6'), 0.9); sunA.position.set(-40, 12, -30); gA.add(sunA);
  // buz/kar dokusu
  const snowTex = canvasTex(1024, 1024, (g, w, h) => {
    const r = mulberry32(3); g.fillStyle = '#E9F0F6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '150,175,200' : '255,255,255'},${0.05 + r() * 0.12})`; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 80, 3 + r() * 10, 0.3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(120,150,180,0.25)'; g.lineWidth = 1.5;
    for (let i = 0; i < 60; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 90; y += (r() - 0.5) * 90; g.lineTo(x, y); } g.stroke(); }
  });
  snowTex.wrapS = snowTex.wrapT = THREE.RepeatWrapping; snowTex.repeat.set(8, 8);
  // deliği olan buz tabakası (kalınlık 0,25 m); delik düzensiz
  const HOLE = []; { const r = mulberry32(8); for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, rr = 1.15 + 0.35 * r() + 0.15 * Math.sin(a * 3); HOLE.push([Math.cos(a) * rr * 1.15, Math.sin(a) * rr * 0.9]); } }
  {
    const s = new THREE.Shape(); s.moveTo(-40, -40); s.lineTo(40, -40); s.lineTo(40, 40); s.lineTo(-40, 40); s.closePath();
    const hp = new THREE.Path(); HOLE.forEach(([x, y], i) => (i ? hp.lineTo(x, y) : hp.moveTo(x, y))); hp.closePath(); s.holes.push(hp);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false, curveSegments: 4 });
    geo.rotateX(Math.PI / 2);                                   // üst yüz y=0, alt yüz y=−0,25
    const top = new THREE.MeshStandardMaterial({ map: snowTex, roughness: 0.75, color: lin('#D3DDE7') });
    const side = new THREE.MeshPhysicalMaterial({ color: lin('#9CC4DC'), roughness: 0.15, clearcoat: 1, emissive: lin('#14303E') });
    const ice = new THREE.Mesh(geo, [top, side]); gA.add(ice);
    // alttan buz: mavi, kabarcıklı
    const under = canvasTex(512, 512, (g, w, h) => { const r = mulberry32(4); g.fillStyle = '#4F7F98'; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(220,240,255,${0.05 + r() * 0.2})`; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 5, 0, 7); g.fill(); } });
    under.wrapS = under.wrapT = THREE.RepeatWrapping; under.repeat.set(10, 10);
    const ug = new THREE.ShapeGeometry(s, 4); ug.rotateX(Math.PI / 2); ug.translate(0, -0.252, 0);
    gA.add(new THREE.Mesh(ug, new THREE.MeshStandardMaterial({ map: under, roughness: 0.3, side: THREE.DoubleSide, emissive: lin('#0E2632') })));
    // kırık buz parçaları
    const r = mulberry32(12);
    for (let i = 0; i < 3; i++) { const a = 1 + i * 2.1 + r(), rr = 0.75 + r() * 0.35; const p = box(0.25 + r() * 0.3, 0.12, 0.2 + r() * 0.25, side, Math.cos(a) * rr, -0.1, Math.sin(a) * rr * 0.8, gA); p.rotation.set((r() - 0.5) * 0.4, r() * 6, (r() - 0.5) * 0.4); }
    // kayak izi: iki paralel oluk deliğe gider (kanca imgesi)
    const trackM = new THREE.MeshStandardMaterial({ color: lin('#7E93A8'), roughness: 0.9 });
    for (const off of [-0.13, 0.13]) { const tr = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 9), trackM); tr.rotation.set(-Math.PI / 2, 0, Math.atan2(5, 6)); tr.position.set(3.1 + off * Math.cos(0.69), 0.003, -3.7 + off * Math.sin(0.69)); gA.add(tr); }
    // dış kar alanı ve nehir kıyıları
    const snow = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ map: snowTex.clone(), roughness: 0.85, color: lin('#C9D4DF') }));
    snow.material.map.repeat.set(120, 120); snow.rotation.x = -Math.PI / 2; snow.position.y = -0.3; gA.add(snow);   // buz tabakasının altında: delikte görünmez
  }
  // delikteki su yüzeyi: üstten koyu, alttan (buzun altından) parlak gök
  const waterMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, fog: false, uniforms: { k: { value: 1 } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform float k; varying vec3 vW; void main(){ float r = length(vW.xz); if (gl_FrontFacing) gl_FragColor = vec4(vec3(0.012, 0.03, 0.04) + 0.03 * smoothstep(1.4, 0.2, r), 1.0); else gl_FragColor = vec4(vec3(1.6, 2.1, 2.4) * k * (0.75 + 0.25 * smoothstep(1.5, 0.0, r)), 1.0); }',
  });
  { const w = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), waterMat); w.rotation.x = -Math.PI / 2; w.position.y = -0.11; gA.add(w); }
  // kayaklar ve batonlar
  {
    const ski = std('#3A4250', { roughness: 0.35 }), pole = std('#2B2F35', { metalness: 0.6, roughness: 0.3 });
    const s1 = box(1.9, 0.025, 0.075, ski, 1.6, 0.012, -1.4, gA); s1.rotation.y = 0.55;
    const s2 = box(1.9, 0.025, 0.075, ski, 1.9, 0.03, -1.0, gA); s2.rotation.set(0, 0.35, 0.03);
  }
  // kıyılar, ağaçlar, dağlar
  {
    const r = mulberry32(21);
    const trunk = std('#2C231E'), crown = std('#22352A', { roughness: 0.9 }), snowC = std('#E6EDF3');
    const cone = new THREE.ConeGeometry(1, 1, 7);
    const n = 700, im = new THREE.InstancedMesh(cone, crown, n), ims = new THREE.InstancedMesh(cone, snowC, n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const side = r() < 0.5 ? -1 : 1, x = side * (16 + Math.pow(r(), 1.5) * 140), z = -300 + r() * 520, h = 7 + r() * 8;
      m.makeScale(h * 0.26, h, h * 0.26); m.setPosition(x, h * 0.5, z); im.setMatrixAt(i, m);
      m.makeScale(h * 0.17, h * 0.4, h * 0.17); m.setPosition(x, h * 0.82, z); ims.setMatrixAt(i, m);
    }
    gA.add(im, ims);
    const mtn = new THREE.ConeGeometry(1, 1, 9, 6); const pos = mtn.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setXYZ(i, pos.getX(i) * (1 + 0.18 * Math.sin(i * 1.7)), y, pos.getZ(i) * (1 + 0.18 * Math.cos(i * 2.3))); }
    mtn.computeVertexNormals();
    const rock = std('#6F7A88', { roughness: 0.9, flatShading: true }), cap = std('#E8EEF4', { roughness: 0.8, flatShading: true });
    for (let i = 0; i < 16; i++) { const a = r() * 6.28, h = 300 + r() * 450, d = h * 1.2 + 350 + r() * 600; const mm = new THREE.Mesh(mtn, rock); mm.scale.set(h * 1.1, h, h * 1.0); mm.position.set(Math.cos(a) * d, h / 2 - 20, Math.sin(a) * d - 200); gA.add(mm);
      const cc = new THREE.Mesh(mtn, cap); cc.scale.set(h * 0.5, h * 0.45, h * 0.46); cc.position.set(mm.position.x, h - 20 - h * 0.22 + 1, mm.position.z); gA.add(cc); }
  }
  // buzun altındaki hava cebi (gümüş, yassı kubbe) ve ışık hüzmesi
  const pocket = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: lin('#FFFFFF'), metalness: 1, roughness: 0.03, envMapIntensity: 3, emissive: lin('#5C8496') }));
  pocket.scale.set(1.3, 0.32, 1); pocket.position.set(0.25, -0.252, -0.6); gA.add(pocket);
  const shaftMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { col: { value: lin('#BFE6F2') }, k: { value: 0.06 } },
    vertexShader: 'varying float vA; varying vec3 vN; varying vec3 vV; void main(){ vA = uv.y; vec4 w = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-w.xyz); gl_Position = projectionMatrix * w; }',
    fragmentShader: 'uniform vec3 col; uniform float k; varying float vA; varying vec3 vN; varying vec3 vV; void main(){ float a = clamp(vA, 0.0, 1.0); float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0); vec3 c = col * k * a * a * f; gl_FragColor = vec4(c == c ? c : vec3(0.0), 1.0); }',
  });
  { const g = new THREE.CylinderGeometry(1.3, 2.6, 7, 32, 1, true).translate(0, -3.5, 0); const m = new THREE.Mesh(g, shaftMat); m.position.set(0, -0.12, 0); gA.add(m); }
  const lightUnder = new THREE.SpotLight(lin('#CDEBF5'), 60, 0, 0.7, 0.8, 2); lightUnder.position.set(0, 1, 0); lightUnder.target.position.set(0, -5, 0); gA.add(lightUnder, lightUnder.target);
  // kar (sürekli döngü) ve kabarcıklar
  const snowP = (() => { const n = 1600, r = mulberry32(31), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 30, r() * 14, (r() - 0.5) * 30, 0.6 + r() * 0.5, r() * 6.28, 0.008 + r() * 0.012]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.7, 1.8) }), n); im.frustumCulled = false; gA.add(im); return { im, d }; })();
  const bubbles = (() => { const n = 160, r = mulberry32(33), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 3, r() * 6, (r() - 0.5) * 3, 0.25 + r() * 0.35, r() * 6.28, 0.006 + r() * 0.014]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshPhysicalMaterial({ color: lin('#DDF2FF'), metalness: 0.9, roughness: 0.05, emissive: lin('#3A6E80') }), n); im.frustumCulled = false; gA.add(im); return { im, d }; })();
  const _m = new THREE.Matrix4();
  function placeParticles(t) {
    snowP.d.forEach((p, i) => { const y = ((p[1] - p[3] * t) % 14 + 14) % 14; _m.makeScale(p[5], p[5], p[5]); _m.setPosition(p[0] + 0.3 * Math.sin(t * 0.8 + p[4]), y, p[2] + 0.25 * t * 0.3); snowP.im.setMatrixAt(i, _m); });
    snowP.im.instanceMatrix.needsUpdate = true;
    bubbles.d.forEach((p, i) => { const y = -6.2 + ((p[1] + p[3] * t) % 6); const x = p[0] * (1 - (y + 6) / 6 * 0.7) + 0.25, z = p[2] * (1 - (y + 6) / 6 * 0.7) - 0.6; _m.makeScale(p[5], p[5], p[5]); _m.setPosition(x + 0.04 * Math.sin(t * 3 + p[4]), Math.min(y, -0.32), z); bubbles.im.setMatrixAt(i, _m); });
    bubbles.im.instanceMatrix.needsUpdate = true;
  }

  // ═══════════════ Termometre (iki dünyada aynı nesne) ═══════════════
  const TH = { L: 0.27, y0: -0.12 };              // ölçek boyu ve alt ucu (grup içinde)
  const scaleTex = canvasTex(256, 1024, (g, w, h) => {
    g.fillStyle = '#F4F1EA'; g.fillRect(0, 0, w, h);
    const yOf = c => h * 0.86 - (c - SCALE.lo) / (SCALE.hi - SCALE.lo) * h * 0.74;
    g.fillStyle = '#1C1C1E'; g.textAlign = 'right'; g.font = '700 30px Archivo';
    for (let c = SCALE.lo; c <= SCALE.hi; c += 2) { const y = yOf(c), big = c % 10 === 0; g.fillRect(w * 0.6, y - 1.2, big ? 56 : 30, 2.4); if (big) g.fillText(String(c), w * 0.56, y + 10); }
    g.fillStyle = '#B42318'; g.fillRect(w * 0.6, yOf(37) - 2, 70, 4); g.font = '800 28px Archivo'; g.textAlign = 'center'; g.fillText('°C', w * 0.5, h * 0.08);
  });
  const glass = new THREE.MeshPhysicalMaterial({ color: lin('#FFFFFF'), roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, envMapIntensity: 2 });
  const liquidMat = new THREE.MeshStandardMaterial({ color: lin('#C8141C'), roughness: 0.25, emissive: lin('#3A0408') });
  function thermometer(parent) {
    const g = new THREE.Group();
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.36, 0.006), [std('#E8E4DC'), std('#E8E4DC'), std('#E8E4DC'), std('#E8E4DC'), new THREE.MeshStandardMaterial({ map: scaleTex, roughness: 0.45 }), std('#E8E4DC')]);
    plate.position.set(0, 0.02, -0.006); g.add(plate);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.3, 20), glass); tube.position.set(0.012, 0.035, 0.006); g.add(tube);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.011, 20, 14), liquidMat); bulb.position.set(0.012, -0.123, 0.006); g.add(bulb);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 1, 10).translate(0, 0.5, 0), liquidMat); col.position.set(0.012, -0.115, 0.006); g.add(col);
    const frost = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.38), new THREE.MeshBasicMaterial({ map: frostTex, transparent: true, opacity: 0, depthWrite: false, color: new THREE.Color(1.3, 1.4, 1.5) }));
    frost.position.set(0, 0.02, 0.016); g.add(frost);
    parent.add(g); return { g, tube, col, frost };
  }
  // sıvı sütununun boyu: ölçekteki c çizgisi y = 0,20 − (0,86 − 0,74u)·0,36; sütunun dibi −0,115
  const yOfC = c => Math.max(0.003, -0.1096 + 0.2664 * clamp01((c - SCALE.lo) / (SCALE.hi - SCALE.lo)) + 0.115);
  const frostTex = canvasTex(512, 1024, (g, w, h) => {
    const r = mulberry32(55); g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(235,245,255,0.85)'; g.lineCap = 'round';
    const branch = (x, y, a, len, d) => { if (d > 5 || len < 4) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = Math.max(0.6, 3 - d * 0.5); g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); for (let k = 0; k < 3; k++) branch(x + (x2 - x) * (0.3 + k * 0.25), y + (y2 - y) * (0.3 + k * 0.25), a + (k % 2 ? 1 : -1) * (0.9 + r() * 0.3), len * (0.42 + r() * 0.15), d + 1); };
    for (let i = 0; i < 70; i++) { const edge = r(); const x = edge < 0.5 ? (r() < 0.5 ? 0 : w) : r() * w, y = edge < 0.5 ? r() * h : (r() < 0.5 ? 0 : h); branch(x, y, Math.atan2(h / 2 - y, w / 2 - x) + (r() - 0.5) * 1.2, 40 + r() * 120, 0); }
  });
  const thA = thermometer(gA); thA.g.position.set(...THERMO_A); thA.g.rotation.set(-0.08, 0.5, 0.05);
  { const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.25, 8), std('#6B4A2E')); stake.position.set(THERMO_A[0], 0.05, THERMO_A[2] - 0.012); gA.add(stake); thA.g.position.y = 0.32; }

  // ═══════════════ B: Saint-Pierre, 1902 ═══════════════
  gB.position.x = BX;
  const skyB = new THREE.Mesh(new THREE.SphereGeometry(9000, 32, 16), skyMat('#5E86B0', '#E9D9C2')); gB.add(skyB);
  const hemiB = new THREE.HemisphereLight(lin('#DCE8F5'), lin('#6B5A48'), 1.1); gB.add(hemiB);
  const sunB = new THREE.DirectionalLight(lin('#FFE8C8'), 2.2); sunB.position.set(600, 400, 300); gB.add(sunB);
  const glowB = new THREE.HemisphereLight(lin('#FF8A3A'), lin('#4A1A08'), 0); gB.add(glowB);
  // — Kent: kıyı boyunca evler, katedral kuleleri, limanda gemiler, arkada yanardağ —
  {
    const r = mulberry32(1902);
    const wallG = new THREE.BoxGeometry(1, 1, 1), roofG = new THREE.ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4);
    const n = 900, walls = new THREE.InstancedMesh(wallG, std('#FFFFFF', { roughness: 0.85 }), n), roofs = new THREE.InstancedMesh(roofG, std('#FFFFFF', { roughness: 0.8 }), n);
    const pal = ['#E8D9BF', '#D9B48A', '#F0E6D2', '#C9A27A', '#E3C9A6', '#B9A08A'].map(lin), rp = ['#8E3B22', '#A0472A', '#6E3220'].map(lin);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const x = -1100 + r() * 2200, z = -260 + r() * 640 - Math.abs(x) * 0.12, w = 10 + r() * 14, d = 9 + r() * 10, h = 7 + r() * 10, y = Math.max(0, -z * 0.05) + Math.abs(x) * 0.02;
      m.makeScale(w, h, d); m.setPosition(x, y + h / 2, z); walls.setMatrixAt(i, m); walls.setColorAt(i, c.copy(pal[i % pal.length]).multiplyScalar(0.85 + r() * 0.3));
      m.makeScale(w * 1.05, 4 + r() * 3, d * 1.05); m.setPosition(x, y + h + 2.5, z); roofs.setMatrixAt(i, m); roofs.setColorAt(i, rp[i % 3]);
    }
    gT.add(walls, roofs); gT.userData.walls = walls;
    const stone = std('#C9BBA5');
    for (const x of [-14, 14]) box(10, 46, 10, stone, x + 60, 23, 60, gT);
    box(38, 26, 50, stone, 60, 13, 85, gT);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(20000, 12000), new THREE.MeshStandardMaterial({ color: lin('#1D4A63'), roughness: 0.12, metalness: 0.2 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.5, 6400); gT.add(sea);
    const land = new THREE.Mesh(new THREE.PlaneGeometry(20000, 6000), std('#3F5A2C', { roughness: 0.95 })); land.rotation.x = -Math.PI / 2; land.position.set(0, -0.3, -2400); gT.add(land);
    const vg = new THREE.ConeGeometry(4200, 1400, 64, 16), vp = vg.attributes.position;
    for (let i = 0; i < vp.count; i++) { const x = vp.getX(i), z = vp.getZ(i), y = vp.getY(i); const k = 1 + 0.08 * Math.sin(x * 0.004) * Math.cos(z * 0.003); vp.setXYZ(i, x * k, y, z * k); }
    vg.computeVertexNormals();
    const volc = new THREE.Mesh(vg, std('#3E4A33', { roughness: 0.95, flatShading: true })); volc.position.set(-300, 700, -5200); gT.add(volc);
    for (let i = 0; i < 7; i++) { const s = new THREE.Group(); box(30, 7, 8, std('#2C2622'), 0, 2, 0, s); for (const dx of [-8, 6]) box(0.8, 34, 0.8, std('#4A3B2E'), dx, 20, 0, s); s.position.set(-700 + i * 230 + r() * 80, 0, 520 + r() * 500); s.rotation.y = r() * 0.6; gT.add(s); }
  }
  // — Kızgın bulut: yanardağdan denize yuvarlanan kabarcıklar (alt yüzleri korla parlar) —
  const cloudMat = new THREE.ShaderMaterial({
    fog: false, uniforms: { glow: { value: lin('#FF7A2A') }, dark: { value: lin('#3B3430') }, top: { value: lin('#8C8278') }, k: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal); vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 glow; uniform vec3 dark; uniform vec3 top; uniform float k; varying vec3 vN; varying vec3 vW;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y), mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z); }
      void main(){ vec3 n = normalize(vN); float nz = n3(vW * 0.02) * 0.6 + n3(vW * 0.07) * 0.4;
        vec3 c = mix(dark, top, clamp(n.y * 0.6 + 0.4, 0.0, 1.0) * (0.6 + 0.6 * nz));
        float under = clamp(-n.y * 0.8 + 0.2, 0.0, 1.0); c += glow * k * under * under * (1.2 + 2.5 * nz);
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const NP = 700, puffs = [];
  { const r = mulberry32(77); for (let i = 0; i < NP; i++) { const u = r(), z = lerp(-4600, 520, Math.pow(u, 0.8)), x = (r() - 0.5) * (500 + (z + 4600) * 0.45), R = 60 + r() * 170 + u * 80; puffs.push([x - 300 * (1 - u), z, R, r()]); } }
  const cloud = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 3), cloudMat, NP); cloud.frustumCulled = false; gT.add(cloud);
  const groundY = z => (z < -600 ? Math.min(1300, (-600 - z) * 0.32) : 0);
  function placeCloud(t) {
    const zf = lerp(-4800, 560, ease.state(seg(t, T.patladi + 0.3, T.yok + 0.25 - T.patladi - 0.3)));    // bulutun önü
    puffs.forEach(([x, z, R, s], i) => {
      const age = (zf - z) / 900;                                        // önden geçeli ne kadar oldu
      const k = clamp01(age * 2.2), rr = R * (0.15 + 0.85 * ease.enter(k)) * (1 + 0.25 * clamp01(age - 0.5));
      if (k <= 0) { _m.makeScale(0, 0, 0); cloud.setMatrixAt(i, _m); return; }
      _m.makeScale(rr, rr * 0.8, rr); _m.setPosition(x + Math.sin(t * 0.6 + s * 9) * 8, groundY(z) + rr * 0.45 + age * 40, z + age * 60); cloud.setMatrixAt(i, _m);
    });
    cloud.instanceMatrix.needsUpdate = true;
  }
  // — Hücre: taş duvarlar, ahşap kapı, dar ızgara —
  const stoneTex = canvasTex(1024, 1024, (g, w, h) => {
    const r = mulberry32(6); g.fillStyle = '#3A342E'; g.fillRect(0, 0, w, h);
    for (let row = 0, y = 0; y < h; row++) { const bh = 70 + r() * 40; for (let x = -(row % 2) * 60; x < w; ) { const bw = 110 + r() * 90; const v = 120 + r() * 50; g.fillStyle = `rgb(${v},${v * 0.92},${v * 0.8})`; g.fillRect(x + 4, y + 4, bw - 8, bh - 8); for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(0,0,0,${r() * 0.12})`; g.fillRect(x + r() * bw, y + r() * bh, 4 + r() * 20, 2 + r() * 8); } x += bw; } y += bh; }
    const gr = g.createLinearGradient(0, h * 0.75, 0, h); gr.addColorStop(0, 'rgba(30,40,20,0)'); gr.addColorStop(1, 'rgba(30,40,20,0.45)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);   // nem
  });
  stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping; stoneTex.repeat.set(2, 2);
  const stoneM = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.92 });
  const woodTex = canvasTex(256, 512, (g, w, h) => { const r = mulberry32(7); for (let i = 0; i < 4; i++) { const v = 70 + r() * 30; g.fillStyle = `rgb(${v},${v * 0.7},${v * 0.45})`; g.fillRect(i * 64, 0, 62, h); for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.2})`; g.fillRect(i * 64 + r() * 60, 0, 1 + r() * 2, h); } } g.fillStyle = '#1E1612'; g.fillRect(0, 60, w, 14); g.fillRect(0, h - 74, w, 14); });
  const woodM = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
  const GR = { x0: 0.0, x1: 0.3, y0: 1.42, y1: 1.62 };          // ızgara açıklığı
  {
    const c = gC, Wd = 3, Dd = 4.2, Hh = 2.6, z1 = 2.2, th = 0.4;
    box(Wd + 2 * th, 0.2, Dd + th, stoneM, 0, -0.1, 0.1, c);                    // zemin
    box(Wd + 2 * th, th, Dd + 2 * th, stoneM, 0, Hh + th / 2, 0.2, c);          // tavan
    box(th, Hh, Dd + 2 * th, stoneM, -Wd / 2 - th / 2, Hh / 2, 0.2, c); box(th, Hh, Dd + 2 * th, stoneM, Wd / 2 + th / 2, Hh / 2, 0.2, c);
    box(Wd, Hh, th, stoneM, 0, Hh / 2, -2 - th / 2, c);
    // kapı duvarı: kapı açıklığı (x −0,45..0,45, y 0..2) çevresinde
    box(Wd / 2 - 0.45, Hh, th, stoneM, -(0.45 + (Wd / 2 - 0.45) / 2), Hh / 2, z1 + th / 2, c);
    box(Wd / 2 - 0.45 + 1.4, Hh, th, stoneM, 0.45 + (Wd / 2 - 0.45 + 1.4) / 2, Hh / 2, z1 + th / 2, c);
    box(0.9, Hh - 2, th, stoneM, 0, 2 + (Hh - 2) / 2, z1 + th / 2, c);
    // dış cephe: kapının iki yanında taş duvar devam eder, önünde dar avlu
    box(8, 4, 0.3, stoneM, -4.45 - 0.45 + 0.4, 2, z1 + th - 0.15, c);
    box(14, 0.2, 10, stoneM, 0, -0.1, z1 + th + 5, c);
    // kapı: ızgara deliğinin çevresinde dört parça + demir çubuklar
    const dz = z1 + 0.12, dt = 0.07;
    box(0.45 + GR.x0, 2, dt, woodM, -0.45 + (0.45 + GR.x0) / 2, 1, dz, c);
    box(0.45 - GR.x1, 2, dt, woodM, GR.x1 + (0.45 - GR.x1) / 2, 1, dz, c);
    box(GR.x1 - GR.x0, GR.y0, dt, woodM, (GR.x0 + GR.x1) / 2, GR.y0 / 2, dz, c);
    box(GR.x1 - GR.x0, 2 - GR.y1, dt, woodM, (GR.x0 + GR.x1) / 2, GR.y1 + (2 - GR.y1) / 2, dz, c);
    const iron = std('#1E1C1B', { metalness: 0.7, roughness: 0.5 });
    for (let i = 1; i < 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, GR.y1 - GR.y0, 8), iron); b.position.set(GR.x0 + i * (GR.x1 - GR.x0) / 4, (GR.y0 + GR.y1) / 2, dz); c.add(b); }
    // tahta sedir
    box(0.5, 0.06, 1.8, woodM, -1.2, 0.48, -0.9, c); box(0.06, 0.48, 0.06, woodM, -1.2, 0.24, -1.7, c); box(0.06, 0.48, 0.06, woodM, -1.2, 0.24, -0.1, c);
  }
  const grilleLight = new THREE.SpotLight(lin('#FFF2DC'), 30, 0, 0.16, 0.6, 2); grilleLight.position.set(0.3, 2.4, 4.6); grilleLight.target.position.set(-0.2, 0.2, -1.6); gC.add(grilleLight, grilleLight.target);
  const cellAmb = new THREE.PointLight(lin('#8A9AAE'), 0.6, 8, 2); cellAmb.position.set(0, 2.2, 0); gC.add(cellAmb);
  const outGlow = new THREE.PointLight(lin('#FF7A2A'), 0, 14, 2); outGlow.position.set(0.8, 1.8, 4.4); gC.add(outGlow);
  const beam = (() => { const g = new THREE.CylinderGeometry(0.12, 0.7, 4.6, 24, 1, true).translate(0, -2.3, 0); const m = new THREE.Mesh(g, shaftMat.clone()); m.material.uniforms.col.value = lin('#FFE9C8'); m.position.set(0.15, 1.52, 2.25);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-0.35, -1.3, -3.8).normalize()); gC.add(m); return m; })();
  const thB = thermometer(gC); thB.g.position.set(THERMO_B[0] - BX, THERMO_B[1], THERMO_B[2]);
  // — Toz, kor ve kül: ızgaradan içeri akan korlar (patlamadan sonra), dışarıda uçuşan kül —
  const embers = (() => { const n = 420, r = mulberry32(41), d = []; for (let i = 0; i < n; i++) d.push([r(), r(), r(), r(), 0.004 + r() * 0.008]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 3.2, 0.8) }), n); im.frustumCulled = false; gC.add(im); return { im, d }; })();
  function placeEmbers(t) {
    const on = seg(t, T.patladi + 0.1, 0.6);
    embers.d.forEach((p, i) => {
      const per = 1.6 + p[3], ph = ((t - T.patladi + p[0] * per) % per + per) % per;
      let x, y, z;
      if (i % 2) { x = lerp(GR.x0, GR.x1, p[1]) - 0.3 * ph; y = lerp(GR.y0, GR.y1, p[2]) + 0.4 * ph - 1.2 * ph * ph; z = 2.2 - 1.7 * ph; }   // içeri
      else { x = (p[1] - 0.5) * 4 + 0.6 * Math.sin(t + p[0] * 9); y = 0.2 + p[2] * 3.2 + 0.3 * Math.sin(t * 1.3 + p[3] * 7); z = 2.7 + p[3] * 3 - 0.5 * ph; }        // dışarıda
      const s = on > 0 && t >= T.patladi ? p[4] * on : 0;
      _m.makeScale(s, s, s); _m.setPosition(x, Math.max(0.01, y), z); embers.im.setMatrixAt(i, _m);
    });
    embers.im.instanceMatrix.needsUpdate = true;
  }
  // — Cam parçaları ve sıvı damlaları (patlama) —
  const shards = (() => { const n = 46, r = mulberry32(400), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 0.004, (r() - 0.2) * 0.3, (r() - 0.5) * 1.8, 0.4 + r() * 1.6, 0.6 + r() * 1.4, r() * 6.28, r() * 20, 0.004 + r() * 0.01]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 1, 0, -0.6, -0.8, 0, 0.7, -0.5, 0], 3)); g.computeVertexNormals();
    const im = new THREE.InstancedMesh(g, new THREE.MeshPhysicalMaterial({ color: lin('#FFFFFF'), roughness: 0.03, metalness: 0.2, transparent: true, opacity: 0.6, side: THREE.DoubleSide, clearcoat: 1, envMapIntensity: 2.5 }), n); im.frustumCulled = false; gC.add(im); return { im, d }; })();
  const drops = (() => { const n = 60, r = mulberry32(401), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 1.4, 0.3 + r() * 1.2, 0.2 + r() * 1.6, 0.003 + r() * 0.005]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), liquidMat, n); im.frustumCulled = false; gC.add(im); return { im, d }; })();
  const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  function placeBurst(t) {
    const u = t - T.burst, o = [THERMO_B[0] - BX + 0.012, THERMO_B[1] + 0.08, THERMO_B[2] + 0.01];
    shards.d.forEach((p, i) => {
      if (u < 0) { _m.makeScale(0, 0, 0); shards.im.setMatrixAt(i, _m); return; }
      const y = Math.max(0.005, o[1] + p[1] * 0.3 + p[4] * u - 4.9 * u * u);
      _e.set(p[5] + p[6] * u, p[6] * 0.7 * u, p[5] * 2); _q.setFromEuler(_e);
      _m.compose(_v.set(o[0] + p[2] * u * 0.6, y, o[2] + p[3] * u * 0.8), _q, _s.set(p[7], p[7], p[7])); shards.im.setMatrixAt(i, _m);
    });
    shards.im.instanceMatrix.needsUpdate = true;
    drops.d.forEach((p, i) => {
      if (u < 0) { _m.makeScale(0, 0, 0); drops.im.setMatrixAt(i, _m); return; }
      const y = Math.max(0.003, o[1] + p[1] * u - 4.9 * u * u);
      _m.makeScale(p[3], p[3], p[3]); _m.setPosition(o[0] + p[0] * u, y, o[2] + p[2] * u); drops.im.setMatrixAt(i, _m);
    });
    drops.im.instanceMatrix.needsUpdate = true;
  }

  // ═══════════════ Poz ═══════════════
  const K = camKeys(T);
  const camAt = cameraTrack(K, track3, monotone, 0.03);
  const fogA = lin('#7C8DA1'), fogU = lin('#0A2630'), fogC = lin('#1A1612'), fogF = lin('#3A2214'), fogT = lin('#B8A898'), fogTA = lin('#5C4636');
  function pose(t, lens, jit) {
    const c = camAt(t), w = world(T, t), farShot = w === 1 && c.pos[2] > 200;
    S.camera.near = farShot ? 2 : 0.02; S.camera.far = farShot ? 20000 : 3000;
    S.setCam(c, lens, jit);
    gA.visible = w === 0; gB.visible = w === 1;
    if (w === 0) {
      const under = c.pos[1] < -0.12;
      scene.fog.color.copy(under ? fogU : fogA); scene.fog.density = under ? 0.32 : 0.0014;
      scene.environmentIntensity = under ? 0.8 : 0.45;
      scene.background = scene.fog.color;
      const dark = seg(t, T.l04, 2.5) * (1 - seg(t, T.l05 + 0.4, 1.6));
      waterMat.uniforms.k.value = 1 - 0.65 * dark; shaftMat.uniforms.k.value = 0.06 * (1 - 0.7 * dark);
      lightUnder.intensity = under ? 60 * (1 - 0.7 * dark) : 0;
      // termometre (buz): 37'den 13,7'ye; kırağı tutar
      thA.col.scale.y = yOfC(thermoA(T, t));
      thA.frost.material.opacity = 0.5 * seg(t, T.on2 - 0.2, 1.6);
      placeParticles(t);
    } else {
      const town = c.pos[2] > 200;
      gT.visible = town; gC.visible = !town;
      const erupt = seg(t, T.patladi, 0.25), after = seg(t, T.patladi, 2);
      if (town) {
        scene.fog.color.copy(fogT).lerp(fogTA, after); scene.fog.density = 0.00006 + 0.00012 * after;
        skyB.material.uniforms.k.value = 1 - 0.55 * after;
        sunB.intensity = 2.2 * (1 - 0.7 * after); glowB.intensity = 1.6 * after;
        placeCloud(t);
      } else {
        const out = c.pos[2] > 2.6;
        scene.fog.color.copy(out ? fogF : fogC); scene.fog.density = out ? 0.05 * erupt + 0.01 : 0.03 + 0.04 * erupt;
        const flick = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.3 + 1);
        grilleLight.color.copy(lin('#FFF2DC')).lerp(lin('#FF6A1A'), erupt);
        grilleLight.intensity = 30 + 520 * erupt * flick * (1 - 0.6 * seg(t, T.l08 + 0.5, 2));
        beam.material.uniforms.col.value.copy(lin('#FFE9C8')).lerp(lin('#FF8A3A'), erupt);
        beam.material.uniforms.k.value = 0.05 + 0.1 * erupt;
        outGlow.intensity = 40 * erupt * flick + 50 * seg(t, T.burst - 0.05, 0.05) * (1 - seg(t, T.burst, 0.5));
        cellAmb.intensity = 0.6 * (1 - erupt) + 2.5 * erupt * flick;
        thB.col.scale.y = yOfC(thermoB(T, t));
        thB.tube.visible = thB.col.visible = t < T.burst;
        placeEmbers(t); placeBurst(t);
      }
      scene.background = scene.fog.color;
      scene.environmentIntensity = 0.8;
    }
  }

  // ═══════════════ 2B kaplama ═══════════════
  const O = makeOverlay(ctx, tl, {
    chunks: {
      l01: [['Donan doktor mu,', 0], ['yanan kentten kurtulan mahkûm mu?', 3]],
      l02: [["Anna Bågenholm, Norveç'te", 0], ['buzu kırıp donmuş bir nehre düştü.', 3]],
      l03: [['Buzun altındaki bir hava cebinde', 0], ['yaklaşık 40 dakika dayandı.', 5]],
      l04: [['Sonra kalbi durdu', 0], ['ve vücudu 13,7 dereceye indi.', 3]],
      l05: [['Kalbi iki buçuk saatten uzun süre atmadı', 0], ['ama doktorlar onu geri getirdi.', 7]],
      l06: [["Ludger Sylbaris ise Martinik'te", 0], ['taş bir hücrede tutuluyordu.', 4]],
      l07: [['Yanardağ patladı ve kızgın bir bulut', 0], ['bütün kenti dakikalar içinde yok etti.', 6]],
      l08: [['Yaklaşık 28 bin kişi öldü', 0], ['ama o kurtuldu.', 6]],
      l09: [['Peki ikisini aynı termometreye koyarsak?', 0]],
      l10: [["Anna'nın vücudu 13,7 dereceye indi.", 0]],
      l11: [['Hücrenin dışındaki bulut ise', 0], ['tahminen 400 dereceye yakındı.', 4]],
      l12: [['Sen hangisine şaşırdın?', 0], ['Yoruma yaz.', 3]],
    },
  });
  const c1 = n => n.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  // EKG: kalp durana kadar atar, düz çizgi, "getirdi"de yeniden
  function ecg(t) {
    const t0 = T.l04 - 0.2, t1 = T.l05end + 0.2;
    const inU = ease.enter(seg(t, t0, 0.3)), out = ease.exit(seg(t, t1, 0.3)); if (inU <= 0 || out >= 1) return;
    const y0 = 760, x0 = SAFE.x0 + 10, x1 = SAFE.x1 - 10, span = 2.4;
    const beat = tt => { if (tt > T.durdu && tt < T.getirdi) return 0; const p = ((tt % 0.9) + 0.9) % 0.9; return p < 0.04 ? -p / 0.04 * 0.3 : p < 0.08 ? -0.3 + (p - 0.04) / 0.04 * 1.6 : p < 0.12 ? 1.3 - (p - 0.08) / 0.04 * 1.8 : p < 0.16 ? -0.5 + (p - 0.12) / 0.04 * 0.5 : 0; };
    const flat = t > T.durdu && t < T.getirdi;
    ctx.save(); ctx.globalAlpha = (1 - out) * inU;
    O.scrim(CX, y0, 1000, 260, 0.45);
    ctx.strokeStyle = flat ? '#FF5A4A' : '#7CFFB2'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const x = lerp(x0, x1, i / 200), tt = t - span + span * i / 200; const y = y0 - 70 * beat(tt); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
  // kırağı: ekran kenarlarından içeri (vücut soğudukça), "getirdi"de çözülür
  const frostImg = frostTex.image, fc = document.createElement('canvas'); fc.width = W; fc.height = H; const fg = fc.getContext('2d');
  function screenFrost(t) {
    const k = Math.min(1, clamp01((37 - bodyTemp(T, t)) / 23.3) * (1 - seg(t, T.getirdi, 1.0)) + 0.9 * seg(t, T.on2 - 0.2, 1.6) * (t < T.cutB2 ? 1 : 0));
    if (k <= 0.01 || world(T, t) !== 0) return;
    fg.globalCompositeOperation = 'source-over'; fg.clearRect(0, 0, W, H); fg.drawImage(frostImg, 0, 0, W, H);
    fg.globalCompositeOperation = 'destination-in';                // kenardan içeri büyür
    const r0 = lerp(1100, 380, k), gr = fg.createRadialGradient(W / 2, H / 2, r0, W / 2, H / 2, r0 + 420); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    fg.fillStyle = gr; fg.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.7; ctx.drawImage(fc, 0, 0); ctx.restore();
  }
  function render(t) {
    const nearCut = [T.cutB1, T.cutOut, T.cutIn, T.cutA2, T.cutB2, T.cutA3].some(c => Math.abs(t - c) < 1.2 / 30);
    S.render(t, pose, tt => (nearCut ? 0 : (tt > T.burst - 0.1 && tt < T.burst + 0.4) ? 0.3 : 0.5));
    ctx.clearRect(0, 0, W, H);
    screenFrost(t);
    O.title(t, ['Hangisi daha', 'şaşırtıcı?'], T.l01end + 0.15, 470, D - 0.45);
    O.nameCard(t, T.l02 - 0.05, T.l03 - 0.15, 'ANNA BÅGENHOLM', 'Norveç · 1999 · 29 yaşında doktor');
    O.bigNumber(t, T.kirk - 0.15, T.l04 - 0.1, tt => Math.round(40 * ease.state(seg(tt, T.kirk - 0.1, 0.45))) + ' dk', 'BUZUN ALTINDA');
    ecg(t);
    O.bigNumber(t, T.on - 0.25, T.l05 - 0.1, tt => c1(bodyTemp(T, tt)) + ' °C', 'VÜCUT SICAKLIĞI');
    O.nameCard(t, T.cutB1 + 0.05, T.l07 - 0.1, 'LUDGER SYLBARIS', 'Martinik · 1902 · hücrede bir mahkûm');
    O.bigNumber(t, T.l08 - 0.05, T.cutIn - 0.05, '28.000', 'YAKLAŞIK ÖLÜ');
    O.bigNumber(t, T.l10 - 0.05, T.l10end + 0.25, tt => c1(thermoA(T, tt)) + ' °C', "ANNA'NIN VÜCUDU");
    O.bigNumber(t, T.tahminen - 0.1, T.l12 - 0.2, tt => (tt < T.dort ? Math.round(thermoB(T, tt)) + ' °C' : '~400 °C'), 'TAHMİNİ · HÜCRENİN DIŞI');   // sayaç sesle: "tahminen" → "dört"
    O.caption(t);
    O.follow(t, T.l12end + 0.4, D - 0.45, 1300);
  }

  // ısınma: her kamera pozu bir kez (1 örnek)
  { const keep = window.__samples; window.__samples = 1; for (const k of K) S.render(k[0], pose); for (let t = 0; t < D; t += 1.0) S.render(t, pose); window.__samples = keep; }
  return { duration: D, timeline: { T }, render };
}

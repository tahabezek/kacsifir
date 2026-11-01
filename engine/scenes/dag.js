// "Dağ" şablonu (№ 035): Hangisi daha şaşırtıcı? Dağı tek başına yaran adam mı, yerin altında mahsur kalan 33 madenci mi?
// A dünyası: Hindistan, Gehlaur sırtı. Kare 0'da sırttaki patikada kırık bir su testisi. 55 km'lik dolanma yolu turuncu
// bir çizgiyle çizilir; çekiç ve keski; 22 yıl gece-gündüz hızla akarken sırtta 110 m'lik yarık doğuya doğru açılır;
// kamera yarığın içinden geçer, yol 15 km'ye iner. B dünyası: Şili, Atacama. 33 bayraklı kamp, sondaj kulesi; kesitte
// 700 m aşağı; karanlıkta 33 kask lambası; matkap ucu tavanı deler, not yukarı gider; Fénix kapsülü çıkar. Doruk:
// kuyunun kayası 6,3 m'lik bir küp olur; Gehlaur'da bu küplerden 15'i Manjhi'nin yarığına tek tek düşer.
// Sürekli döngüler: A'da sıcak hava pusu ve uçuşan toz, B'de rüzgârda bayraklar ve lambaların titremesi.
import { W, H, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { F, setFont } from '../tower.js';
import { makeSinema, lin, track3, monotone, shadowText } from '../sinema.js';
import { makeOverlay, cameraTrack, CX, SAFE } from '../sinema_overlay.js';
import { dagTimes, camKeys, world, cutProgress, year, drillDepth, capsuleCount, fbm, ridgeH, hA, BX, CUT, POT, SHAFT, CUBE, NCUBE } from './dag_core.js';

export async function makeDagRenderer(ep, canvas) {
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const { tl, T } = dagTimes(ep, voice), D = tl.duration;
  const S = makeSinema(ep, canvas, { fog: '#D9C7A8', fogDensity: 0.0009, exposure: 1.0, bloom: 0.45, bloomThreshold: 1.0, vignette: 0.34 });
  const { THREE, scene, ctx } = S;
  const std = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.85, metalness: 0, ...o });
  const box = (w, h, d, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const gA = new THREE.Group(), gB = new THREE.Group(); scene.add(gA, gB); gB.position.x = BX;
  const skyMat = (top, hor) => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: lin(top) }, hor: { value: lin(hor) }, k: { value: 1 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform float k; varying vec3 vP; void main(){ float h = clamp(vP.y * 2.4, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h, 0.6)) * k, 1.0); }',
  });
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), skyMat('#6E8FB5', '#E8D6B8')));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshBasicMaterial({ color: lin('#8C7658') })); fl.rotation.x = -Math.PI / 2; fl.position.y = -3; env.add(fl);
    scene.environment = new THREE.PMREMGenerator(S.gl).fromScene(env, 0.02).texture; scene.environmentIntensity = 0.5;
  }
  const _m0 = new THREE.Matrix4(), _q0 = new THREE.Quaternion(), _e0 = new THREE.Euler();

  // ═══════════════ A: Gehlaur sırtı ═══════════════
  const skyA = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), skyMat('#5F8EC0', '#EBD8B6')); gA.add(skyA);
  const hemiA = new THREE.HemisphereLight(lin('#CFE0F2'), lin('#8A7458'), 1.0); gA.add(hemiA);
  const sunA = new THREE.DirectionalLight(lin('#FFE6C2'), 2.6); sunA.position.set(120, 140, 80); sunA.castShadow = true;
  Object.assign(sunA.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 500 }); sunA.shadow.mapSize.set(2048, 2048); sunA.shadow.bias = -0.0005; sunA.shadow.normalBias = 0.05;
  gA.add(sunA, sunA.target);
  // sırt: z = 0'da eyer (tepesi yarık tabanının 7,7 m üstü), kuzeyde ve güneyde yükselir; yarık kalıcı olarak oyulmuş
  {
    const N = 480, geo = new THREE.PlaneGeometry(480, 480, N, N); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    const rockA = lin('#7D7468'), rockB = lin('#4B443E'), dirt = lin('#9C8058'), grass = lin('#6B7234');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = hA(x, z); p.setY(i, y);
      const n = fbm(x * 0.3, z * 0.3), rock = clamp01((y - CUT.floor - 1.5) / 3);
      c.copy(grass).lerp(dirt, clamp01(n * 1.4)).lerp(rockA, rock).lerp(rockB, rock * clamp01(fbm(x * 0.9 + 3, z * 0.9) * 1.6 - 0.4));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const terr = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); terr.receiveShadow = terr.castShadow = true; gA.add(terr);
    const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), std('#9C8660', { roughness: 1 })); far.rotation.x = -Math.PI / 2; far.position.y = 0.4; gA.add(far);
  }
  // yarığın henüz kırılmamış kayası: sırt yüzeyi şeridi; x < kesik çizgisi atılır + kırılma yüzü
  const clipX = { value: -1e9 };
  const fillMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  fillMat.onBeforeCompile = sh => {
    sh.uniforms.uClipX = clipX;
    sh.vertexShader = 'varying float vWx;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWx = (modelMatrix * vec4(transformed, 1.0)).x;');
    sh.fragmentShader = 'uniform float uClipX; varying float vWx;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\nif (vWx < uClipX) discard;');
  };
  {
    const geo = new THREE.PlaneGeometry(CUT.x1 - CUT.x0, CUT.w + 0.6, 440, 40); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), rockA = lin('#7D7468'), rockB = lin('#4B443E');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, ridgeH(x, z) + 0.02); c.copy(rockA).lerp(rockB, fbm(x * 0.9 + 3, z * 0.9)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const fill = new THREE.Mesh(geo, fillMat); fill.castShadow = fill.receiveShadow = true; gA.add(fill);
  }
  const faceTex = canvasTex(256, 256, (g, w, h) => { const r = mulberry32(5); g.fillStyle = '#7A6B5C'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '40,30,25' : '200,185,165'},${0.1 + r() * 0.25})`; g.beginPath(); g.moveTo(r() * w, r() * h); for (let k = 0; k < 4; k++) g.lineTo(r() * w, r() * h); g.fill(); } });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(CUT.w + 0.6, 1), new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.9 }));
  face.rotation.y = -Math.PI / 2; gA.add(face);
  // sırttaki iri kayalar
  {
    const r = mulberry32(44), g = new THREE.IcosahedronGeometry(1, 1), n = 520, im = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: lin('#6E665D'), roughness: 0.9, flatShading: true }), n), c = new THREE.Color();
    for (let i = 0; i < n; i++) { let x, z, tries = 0; do { x = (r() - 0.5) * 120; z = (r() - 0.5) * 260; tries++; } while (((Math.abs(z) < 7 && Math.abs(x) < 58) || Math.hypot(x - POT[0], z - POT[2]) < 4.5 || Math.abs(z - 15 - 6 * Math.sin(x * 0.05)) < 1.4) && tries < 30);   // yarık, testi ve patika boş kalır
      const y = hA(x, z), s = 0.4 + Math.pow(r(), 3) * 3.5; _e0.set(r() * 3, r() * 3, r() * 3); _q0.setFromEuler(_e0);
      _m0.compose(new THREE.Vector3(x, y + s * 0.3, z), _q0, new THREE.Vector3(s * (0.8 + r() * 0.6), s * (0.5 + r() * 0.4), s * (0.8 + r() * 0.6))); im.setMatrixAt(i, _m0); im.setColorAt(i, c.setRGB(1, 1, 1).multiplyScalar(0.7 + r() * 0.5)); }
    im.castShadow = im.receiveShadow = true; gA.add(im);
  }
  // kırık testi, dökülen su, patika
  {
    const prof = [[0, 0], [0.1, 0.005], [0.17, 0.05], [0.2, 0.14], [0.18, 0.24], [0.12, 0.3], [0.085, 0.33], [0.08, 0.36], [0.1, 0.38], [0.105, 0.395]].map(([x, y]) => new THREE.Vector2(x, y));
    // yarım testi: kırık yüzü yukarı bakar
    const pot = new THREE.Mesh(new THREE.LatheGeometry(prof, 40, 0, Math.PI), new THREE.MeshStandardMaterial({ color: lin('#8A4527'), roughness: 0.9, side: THREE.DoubleSide }));
    pot.scale.setScalar(1.25);
    const py = hA(POT[0], POT[2]);
    pot.position.set(POT[0], py + 0.2, POT[2]); pot.rotation.set(0, 0.5, -Math.PI / 2); pot.castShadow = true; gA.add(pot);
    const r = mulberry32(14);
    for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(1, 5), 6, r() * 6, 0.5 + r() * 0.4), new THREE.MeshStandardMaterial({ color: lin('#A9583A'), roughness: 0.7, side: THREE.DoubleSide })); const a = r() * 6.28, d = 0.4 + r() * 0.9; s.position.set(POT[0] + Math.cos(a) * d, hA(POT[0] + Math.cos(a) * d, POT[2] + Math.sin(a) * d) + 0.04, POT[2] + Math.sin(a) * d); s.rotation.set(r() * 3, r() * 3, r() * 3); s.castShadow = true; gA.add(s); }
    const stain = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ color: lin('#3E352C'), roughness: 0.25, transparent: true, opacity: 0.75, depthWrite: false }));
    stain.rotation.x = -Math.PI / 2; stain.scale.set(1.3, 0.8, 1); stain.position.set(POT[0] + 0.5, py + 0.05, POT[2] - 0.3); gA.add(stain);
    // patika: sırtın üstünden geçen açık renkli şerit
    const pts = []; for (let x = -60; x <= 60; x += 1.5) { const z = 15 + 6 * Math.sin(x * 0.05); pts.push([x, z]); }
    const pg = new THREE.BufferGeometry(), pv = [];
    for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1]; const w = 0.7; for (const [x, z, s] of [[x0, z0, -1], [x1, z1, -1], [x1, z1, 1], [x0, z0, -1], [x1, z1, 1], [x0, z0, 1]]) pv.push(x, hA(x, z + s * w) + 0.05, z + s * w); }
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3)); pg.computeVertexNormals();
    gA.add(new THREE.Mesh(pg, std('#C6AC84', { roughness: 1 })));
  }
  // köyler: kerpiç evler, saz çatılar; birkaç ağaç
  {
    const r = mulberry32(31), mud = std('#B08A62', { roughness: 1 }), thatch = std('#7A6440', { roughness: 1 });
    for (const vx of [-120, 125]) for (let i = 0; i < 26; i++) {
      const x = vx + (r() - 0.5) * 60, z = (r() - 0.5) * 80, w = 4 + r() * 3, d = 4 + r() * 3, y = hA(x, z);
      box(w, 2.6, d, mud, x, y + 1.3, z, gA).castShadow = true;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 2, 4), thatch); roof.position.set(x, y + 3.6, z); roof.rotation.y = Math.PI / 4; roof.castShadow = true; gA.add(roof);
    }
    const leaf = std('#4F5E2C', { roughness: 0.9 }), bark = std('#4A3A2A');
    for (let i = 0; i < 60; i++) { const x = (r() < 0.5 ? -1 : 1) * (60 + r() * 140), z = (r() - 0.5) * 300, y = hA(x, z), h = 4 + r() * 4;
      box(0.35, h, 0.35, bark, x, y + h / 2, z, gA); const c = new THREE.Mesh(new THREE.SphereGeometry(2 + r() * 1.5, 10, 8), leaf); c.scale.y = 0.55; c.position.set(x, y + h, z); c.castShadow = true; gA.add(c); }
  }
  // yollar: 55 km'lik dolanma (turuncu) ve 15 km'lik yeni yol (camgöbeği) — şematik
  const routeLong = (() => {
    const pts = [[-120, 0], [-150, -90], [-120, -190], [-30, -230], [60, -220], [140, -150], [150, -60], [125, 0]].map(([x, z]) => new THREE.Vector3(x, hA(x, z) + 1.5, z));
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 3.2, 8);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(6, 2.2, 0.5), fog: false })); gA.add(m); return m;
  })();
  const routeShort = (() => {
    const pts = [[-120, 0], [-60, 0], [0, 0], [60, 0], [125, 0]].map(([x, z]) => new THREE.Vector3(x, Math.max(hA(x, z), CUT.floor) + 1.5, z));
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 2.4, 8);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.6, 4.5, 5), fog: false })); gA.add(m); return m;
  })();
  // çekiç ve keski: yarığın batı ağzında taşın üstünde
  const tools = new THREE.Group();
  {
    const wood = std('#6B4A2E', { roughness: 0.7 }), iron = std('#3B3B3E', { metalness: 0.8, roughness: 0.4 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.55, 10), wood); handle.rotation.z = Math.PI / 2; tools.add(handle);
    box(0.09, 0.09, 0.2, iron, 0.3, 0, 0, tools);
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.3, 8), iron); ch.position.set(0, 0.02, 0.22); ch.rotation.set(0, 0, Math.PI / 2 - 0.2); tools.add(ch);
    tools.position.set(CUT.x0 + 3.2, hA(CUT.x0 + 3.2, 1.2) + 0.05, 1.2); tools.rotation.y = 0.5; tools.traverse(o => { o.castShadow = true; }); gA.add(tools);
  }
  // kırılan taş parçaları (her vuruşta yüzden fırlar) ve sıcak hava pusundaki toz
  const chips = (() => { const n = 260, r = mulberry32(61), d = []; for (let i = 0; i < n; i++) d.push([r(), (r() - 0.5) * 2, r(), r() * 2.5, 0.03 + r() * 0.06]);
    const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), std('#9A8A78'), n); im.frustumCulled = false; im.castShadow = true; gA.add(im); return { im, d }; })();
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  function placeChips(t) {
    const p = cutProgress(T, t), fx = CUT.x0 + p * (CUT.x1 - CUT.x0), live = t > T.cekic && t < T.cut1 + 0.6;
    chips.d.forEach((c, i) => {
      const per = 0.42, k = Math.floor((t - T.cekic) / per - c[0] * 0.999), t0 = T.cekic + (k + c[0]) * per, u = t - t0;
      if (!live || u < 0 || u > 1.2) { _m.makeScale(0, 0, 0); chips.im.setMatrixAt(i, _m); return; }
      const y0 = CUT.floor + 0.6 + c[2] * 5, x = fx - 0.3 - (1 + c[3]) * u, z = c[1] * 3 + c[1] * 2 * u, y = Math.max(CUT.floor + 0.05, y0 + 3 * u - 4.9 * u * u);
      _e.set(u * 9 + i, u * 7, 0); _q.setFromEuler(_e); _m.compose(_v.set(x, y, z), _q, _s.set(c[4], c[4], c[4])); chips.im.setMatrixAt(i, _m);
    });
    chips.im.instanceMatrix.needsUpdate = true;
  }
  // 15 küp: kurtarma kuyusundan çıkan kaya hacmi kadar, yarığa tek tek düşer
  const rockCubeTex = canvasTex(512, 512, (g, w, h) => { const r = mulberry32(9); g.fillStyle = '#7E7870'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const v = r() < 0.5 ? '30,26,22' : '205,198,186'; g.fillStyle = `rgba(${v},${r() * 0.22})`; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 4; k++) g.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 40); g.fill(); } g.strokeStyle = 'rgba(255,230,190,0.9)'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); });
  const cubeMat = new THREE.MeshStandardMaterial({ map: rockCubeTex, roughness: 0.85, emissive: lin('#2A1E12') });
  const cubes = Array.from({ length: NCUBE }, (_, k) => { const m = new THREE.Mesh(new THREE.BoxGeometry(CUBE, CUBE, CUBE), cubeMat); m.castShadow = m.receiveShadow = true; m.userData.x = CUT.x0 + 4.2 + CUBE / 2 + k * ((CUT.x1 - CUT.x0 - 8.4 - CUBE) / (NCUBE - 1)); gA.add(m); return m; });
  const dust = (() => { const n = 500, r = mulberry32(71), d = []; for (let i = 0; i < n; i++) d.push([r(), r(), r(), r(), 0.04 + r() * 0.08]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: lin('#D8C3A0'), transparent: true, opacity: 0.35, depthWrite: false }), n); im.frustumCulled = false; gA.add(im); return { im, d }; })();
  function placeCubes(t) {
    cubes.forEach((m, k) => {
      const tl0 = T.cube(k), fall = 0.55, u = clamp01((t - (tl0 - fall)) / fall);
      m.visible = t >= tl0 - fall && t >= T.cutA2 && t < T.loop0;   // döngü başında yok (kare 0 ile aynı)
      const y = CUT.floor + CUBE / 2 + 40 * (1 - u) * (1 - u);       // serbest düşmeye benzer: sona doğru hızlanır
      m.position.set(m.userData.x, y, 0); m.rotation.set(0, (1 - u) * 0.4, 0);
    });
    dust.d.forEach((p, i) => {
      const k = i % NCUBE, u = t - T.cube(k);
      if (u < 0 || u > 2.2 || t < T.cutA2 || t >= T.loop0) { _m.makeScale(0, 0, 0); dust.im.setMatrixAt(i, _m); return; }
      const a = p[0] * 6.28, sp = 3 + p[1] * 6, x = cubes[k].userData.x + Math.cos(a) * (CUBE * 0.5 + sp * (1 - Math.exp(-2 * u))), z = Math.sin(a) * (CUBE * 0.5 + sp * (1 - Math.exp(-2 * u))) * 0.6;
      const s = (0.4 + p[4] * 8) * (1 + u) * (1 - u / 2.2);
      _m.makeScale(s, s * 0.6, s); _m.setPosition(x, CUT.floor + 0.4 + p[2] * 2 * u, z); dust.im.setMatrixAt(i, _m);
    });
    dust.im.instanceMatrix.needsUpdate = true;
  }

  // ═══════════════ B: Atacama, San José madeni ═══════════════
  const skyB = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), skyMat('#4C78B0', '#E3CDAA')); gB.add(skyB);
  const hemiB = new THREE.HemisphereLight(lin('#D7E4F2'), lin('#9C7A52'), 1.0); gB.add(hemiB);
  const sunB = new THREE.DirectionalLight(lin('#FFE9CC'), 2.8); sunB.position.set(-90, 120, 60); sunB.castShadow = true;
  Object.assign(sunB.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 10, far: 400 }); sunB.shadow.mapSize.set(2048, 2048); sunB.shadow.bias = -0.0005; sunB.shadow.normalBias = 0.05;
  gB.add(sunB, sunB.target);
  const hB = (x, z) => 10 * fbm(x * 0.012 + 3, z * 0.012) + 22 * Math.max(0, fbm(x * 0.004, z * 0.004 + 9) - 0.35) * (1 - Math.exp(-((x * x + z * z) / 9000))) - 6 * Math.exp(-((x * x + z * z) / 1200));
  {
    const N = 300, geo = new THREE.PlaneGeometry(600, 600, N, N); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), a = lin('#B98F5E'), b = lin('#8E6A45');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, hB(x, z)); c.copy(a).lerp(b, fbm(x * 0.05, z * 0.05)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const terr = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); terr.receiveShadow = true; gB.add(terr);
  }
  // sondaj/vinç kulesi, kuyu ağzı, kapsül
  const steel = std('#C9C2B4', { metalness: 0.6, roughness: 0.4 }), redS = std('#B8322A', { metalness: 0.4, roughness: 0.5 });
  const y0B = hB(0, 0);
  {
    for (const [x, z] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) { const l = box(0.25, 14, 0.25, redS, x * 0.75, y0B + 7, z * 0.75, gB); l.rotation.set(z * 0.035, 0, -x * 0.035); l.castShadow = true; }
    for (let y = 2; y < 14; y += 3) for (const s of [-1, 1]) { box(3.4, 0.12, 0.12, redS, 0, y0B + y, s * 1.6, gB); box(0.12, 0.12, 3.4, redS, s * 1.6, y0B + y, 0, gB); }
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.12, 8, 32), steel); wheel.position.set(0, y0B + 14.6, 0); gB.add(wheel);
    box(2.6, 0.5, 2.6, std('#6E6A64'), 0, y0B + 0.25, 0, gB);
  }
  const capTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#F2F2EE'; g.fillRect(0, 0, w, h); g.fillStyle = '#C8102E'; g.fillRect(0, h * 0.55, w, h * 0.12); g.fillStyle = '#0033A0'; g.fillRect(0, h * 0.67, w, h * 0.12); g.fillStyle = '#1A1A1A'; g.font = '800 48px Archivo'; g.textAlign = 'center'; g.fillText('FÉNIX 2', w * 0.25, h * 0.42); g.fillText('FÉNIX 2', w * 0.75, h * 0.42); });
  const capsule = new THREE.Group();
  { const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 3.6, 24), new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.45, metalness: 0.3 })); body.position.y = 1.8; capsule.add(body);
    for (const y of [0, 3.6]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.35, 24), steel); c.position.y = y + (y ? 0.17 : -0.17); c.rotation.x = y ? 0 : Math.PI; capsule.add(c); }
    capsule.traverse(o => { o.castShadow = true; }); gB.add(capsule); }
  // kamp: çadırlar ve 33 Şili bayrağı (rüzgârda dalgalanır: sürekli döngü)
  const flagTex = canvasTex(192, 128, (g, w, h) => { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h / 2); g.fillStyle = '#D52B1E'; g.fillRect(0, h / 2, w, h / 2); g.fillStyle = '#0039A6'; g.fillRect(0, 0, h / 2, h / 2); g.fillStyle = '#FFFFFF'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 7 : 17; g.lineTo(h / 4 + Math.cos(a) * rr, h / 4 + Math.sin(a) * rr); } g.fill(); });
  const flagGeo = new THREE.PlaneGeometry(1.5, 1.0, 12, 4).translate(0.75, 0, 0), flagMat = new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.8 });
  const flags = [];
  {
    const r = mulberry32(33), pole = std('#D9D9D4', { metalness: 0.6, roughness: 0.4 });
    for (let i = 0; i < 33; i++) {
      const a = -0.6 + i / 32 * 1.6, d = 26 + (i % 3) * 3.2, x = Math.cos(a) * d - 6, z = Math.sin(a) * d - 8, y = hB(x, z);
      box(0.06, 3.2, 0.06, pole, x, y + 1.6, z, gB);
      const f = new THREE.Mesh(flagGeo.clone(), flagMat); f.position.set(x, y + 2.7, z); f.rotation.y = -0.4 + r() * 0.2; f.castShadow = true; gB.add(f); flags.push([f, r() * 6]);
    }
    const tc = ['#2F5D8C', '#C9A24A', '#8B2E2A', '#3F6B47', '#D9D2C2'].map(c => std(c, { roughness: 0.9 }));
    for (let i = 0; i < 30; i++) { const x = -40 + r() * 34, z = 6 + r() * 30, y = hB(x, z); const tnt = new THREE.Mesh(new THREE.ConeGeometry(1.6 + r(), 1.6, 4), tc[i % 5]); tnt.position.set(x, y + 0.8, z); tnt.rotation.y = r() * 3; tnt.castShadow = true; gB.add(tnt); }
  }
  function waveFlags(t) {
    for (const [f, ph] of flags) { const p = f.geometry.attributes.position, b = flagGeo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = b.getX(i); p.setZ(i, 0.12 * x * Math.sin(x * 4 - t * 6 + ph)); } p.needsUpdate = true; f.geometry.computeVertexNormals(); }
  }
  // kesit: 700 m kaya katmanları (kuyunun düzlemi z = 0), sığınak odası, 33 lamba
  const strataTex = canvasTex(256, 4096, (g, w, h) => { const r = mulberry32(17); for (let y = 0; y < h; ) { const th = 20 + r() * 120, v = 60 + r() * 45; g.fillStyle = `rgb(${v * 1.0},${v * 0.95},${v * 0.88})`; g.fillRect(0, y, w, th + 1); y += th; }
    for (let i = 0; i < 9000; i++) { const v = r() < 0.5 ? '0,0,0' : '210,195,170'; g.fillStyle = `rgba(${v},${r() * 0.18})`; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) g.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 14); g.fill(); } });
  const ROOM = { x0: -7, x1: 7, y0: -704, y1: -697, z0: -7 };
  const under = new THREE.Group(); gB.add(under);
  {
    const sm = (w, h, x, y) => { const t = strataTex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 60, h / 720); t.offset.y = (y - h / 2 + 720) / 720; t.needsUpdate = true; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 })); m.position.set(x, y, 0); under.add(m); };
    sm(120, -ROOM.y1 - 0.5, 0, (ROOM.y1 - 0.5) / 2 - 0.25);            // odanın üstü (yüzeye kadar)
    sm(120, 40, 0, ROOM.y0 - 20);                                          // odanın altı
    sm(60 - 7, ROOM.y1 - ROOM.y0, -(7 + 53 / 2), (ROOM.y0 + ROOM.y1) / 2); sm(53, ROOM.y1 - ROOM.y0, 7 + 53 / 2, (ROOM.y0 + ROOM.y1) / 2);
    const groove = new THREE.Mesh(new THREE.PlaneGeometry(0.9, -ROOM.y1), new THREE.MeshBasicMaterial({ color: lin('#120D0A') })); groove.position.set(0, ROOM.y1 / 2, 0.02); under.add(groove);
    const room = new THREE.Mesh(new THREE.BoxGeometry(ROOM.x1 - ROOM.x0, ROOM.y1 - ROOM.y0, -ROOM.z0), new THREE.MeshStandardMaterial({ map: strataTex, roughness: 0.95, side: THREE.BackSide, color: lin('#77716A') }));
    room.position.set(0, (ROOM.y0 + ROOM.y1) / 2, ROOM.z0 / 2 - 0.01); under.add(room);
  }
  const lamps = [], lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(14, 12, 8) });
  {
    const r = mulberry32(330);
    for (let i = 0; i < 33; i++) { const x = ROOM.x0 + 0.8 + r() * 12.4, y = ROOM.y0 + 1.1 + r() * 0.8, z = -0.8 - r() * 5.6; const l = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), lampMat); l.position.set(x, y, z); under.add(l); lamps.push([l, r() * 6]); }
    const pl = new THREE.PointLight(lin('#FFE2B0'), 0, 20, 2); pl.position.set(0, ROOM.y0 + 2.5, -3); under.add(pl); under.userData.pl = pl;
  }
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1, 10).translate(0, -0.5, 0), steel); rod.position.set(0, 0, 0.25); under.add(rod);
  const bit = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 12).rotateX(Math.PI), std('#6B6058', { metalness: 0.8, roughness: 0.4 })); under.add(bit);
  const shaftRock = new THREE.Mesh(new THREE.BoxGeometry(CUBE, CUBE, CUBE), cubeMat); shaftRock.castShadow = true; gB.add(shaftRock);

  // ═══════════════ Poz ═══════════════
  const K = camKeys(T);
  const camAt = cameraTrack(K, track3, monotone, 0.03);
  const fogA = lin('#D9C7A8'), fogN = lin('#141A26'), fogB = lin('#D8C3A2'), fogU = lin('#1B140F');
  function pose(t, lens, jit) {
    const c = camAt(t), w = world(T, t);
    S.camera.near = 0.05; S.camera.far = 3000;
    S.setCam(c, lens, jit);
    gA.visible = w === 0; gB.visible = w === 1;
    if (w === 0) {
      // 22 yıl: güneş hızla döner (5 gün-gece), sonra öğleden sonraya oturur
      const u = cutProgress(T, t), th = Math.PI * 0.32 + u * Math.PI * 2 * 5, day = Math.max(0, Math.sin(th));
      sunA.position.set(Math.cos(th) * 150, Math.sin(th) * 140 + 10, 80);
      const k = u > 0 && u < 1 ? 0.12 + 0.88 * Math.pow(day, 0.6) : 1;
      sunA.intensity = 2.6 * (u > 0 && u < 1 ? day : 1); hemiA.intensity = 1.0 * k; skyA.material.uniforms.k.value = k;
      scene.fog.color.copy(fogN).lerp(fogA, k); scene.fog.density = c.pos[1] > 100 ? 0.0006 : 0.0009; scene.background = scene.fog.color;
      const p = cutProgress(T, t), fx = CUT.x0 + p * (CUT.x1 - CUT.x0);
      clipX.value = p > 0 ? fx : -1e9;
      const top = ridgeH(fx, 0), fh = Math.max(0.01, top - CUT.floor);
      face.visible = p > 0.001 && p < 0.999; face.scale.y = fh; face.position.set(fx, CUT.floor + fh / 2, 0);
      tools.position.x = Math.max(CUT.x0 + 3.2, fx - 2.2); tools.position.y = Math.max(hA(tools.position.x, 1.2), CUT.floor) + 0.05;
      // rotalar: uzun yol "elli"de çizilir; kısa yol "on beş"te
      routeLong.geometry.setDrawRange(0, Math.floor(routeLong.geometry.index.count * ease.state(seg(t, T.elli - 0.4, 1.3)) / 3) * 3);
      routeLong.visible = t < T.l05end + 0.5 && t > T.l03 - 0.1;
      routeLong.material.color.setRGB(6, 2.2, 0.5).multiplyScalar(1 - 0.75 * seg(t, T.on - 0.1, 0.5));
      routeShort.geometry.setDrawRange(0, Math.floor(routeShort.geometry.index.count * ease.state(seg(t, T.on - 0.2, 0.8)) / 3) * 3);
      routeShort.visible = t > T.on - 0.2 && t < T.cutB1 && c.pos[1] > 25;    // yarığın içinden geçerken görünmez
      placeChips(t); placeCubes(t);
    } else {
      const ug = c.pos[1] < -3;
      scene.fog.color.copy(ug ? fogU : fogB); scene.fog.density = ug ? 0.004 : 0.0018; scene.background = scene.fog.color;
      under.visible = ug || c.pos[1] < 2;
      const dd = drillDepth(T, t), up = t > T.note0 ? ease.state(seg(t, T.note0, T.note1 + 1.5 - T.note0)) : 0;
      const tip = -dd * (1 - up) - 0.5;
      rod.visible = bit.visible = t > T.drill0 && t < T.note1 + 1.6; rod.scale.y = Math.max(0.01, -tip); bit.position.set(0, tip - 0.25, 0.25);
      const lit = t > T.l06end - 0.4 ? 1 : 0, flick = t2 => 0.85 + 0.15 * Math.sin(t2 * 11);
      lamps.forEach(([l, ph]) => { l.scale.setScalar(lit * flick(t + ph)); });
      under.userData.pl.intensity = 40 * lit;
      capsule.visible = t > T.cap0 - 0.5 && t < T.l10;
      capsule.position.set(0, y0B - 4 + 7 * ease.state(seg(t, T.cap0, 1.6)) + 0.04 * Math.sin(t * 3), 0);
      const ru = ease.enter(seg(t, T.iki - 0.2, 0.7));
      shaftRock.visible = ru > 0; shaftRock.position.set(12, hB(12, 2) + CUBE / 2 - (1 - ru) * CUBE, 2);
      waveFlags(t);
    }
  }

  // ═══════════════ 2B kaplama ═══════════════
  const O = makeOverlay(ctx, tl, {
    chunks: {
      l01: [['Dağı tek başına yaran adam mı,', 0], ['yerin altında mahsur kalan 33 madenci mi?', 6]],
      l02: [["Dashrath Manjhi'nin karısı,", 0], ["Hindistan'da dağı aşarken düşüp yaralandı.", 3]],
      l03: [['Kasabaya gitmek için dağı dolanıp', 0], ['55 kilometre yürümek gerekiyordu.', 5]],
      l04: [['Manjhi bir çekiç ve bir keski aldı', 0], ['ve 22 yıl boyunca dağı tek başına yardı.', 7]],
      l05: [['Sonunda 110 metrelik bir yol açtı', 0], ['ve mesafe 15 kilometreye indi.', 7]],
      l06: [["Şili'de ise bir maden çöktü", 0], ['ve 33 işçi 700 metre derinde kaldı.', 5]],
      l07: [['17 gün sonra sondaj ucu', 0], ['bir notla geri geldi:', 6], ['"Sığınaktayız, 33 kişi iyiyiz."', 10]],
      l08: [['69. günde hepsi tek tek yukarı çekildi.', 0]],
      l09: [['Peki ikisini aynı kayayla ölçersek?', 0]],
      l10: [['Kurtarma kuyusu yaklaşık', 0], ['250 metreküp kaya deldi.', 3]],
      l11: [['Manjhi ise bunun en az 15 katını', 0], ['tek başına kırdı.', 8]],
      l12: [['Sen hangisine şaşırdın?', 0], ['Yoruma yaz.', 3]],
    },
  });
  // madencilerin notu: kâğıt, kırmızı keçeli kalem (gerçek nottaki İspanyolca söz)
  function note(t) {
    const t0 = T.sig - 0.2, t1 = T.l08 - 0.1, inU = ease.enter(seg(t, t0, 0.35)), out = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || out >= 1) return;
    ctx.save(); ctx.translate(CX, 560 + (1 - inU) * 120 - out * 140); ctx.rotate(-0.06);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#F4EFE2'; ctx.fillRect(-330, -150, 660, 300); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(120,110,90,0.25)'; ctx.lineWidth = 2; for (let y = -110; y < 140; y += 44) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(300, y); ctx.stroke(); }
    ctx.fillStyle = '#C8141C'; ctx.textAlign = 'center'; setFont(ctx, F.head(52));
    ['ESTAMOS BIEN', 'EN EL REFUGIO', 'LOS 33'].forEach((s, i) => ctx.fillText(s, 0, -58 + i * 70));
    ctx.restore(); ctx.textAlign = 'left';
  }
  function render(t) {
    const nearCut = [T.cutB1, T.cutA2, T.cap0 - 0.3].some(c => Math.abs(t - c) < 1.2 / 30);
    S.render(t, pose, tt => (nearCut ? 0 : tt > T.cut0 && tt < T.cut1 ? 0.25 : 0.5));
    ctx.clearRect(0, 0, W, H);
    O.title(t, ['Hangisi daha', 'şaşırtıcı?'], T.l01end + 0.15, 470, D - 0.45);
    O.nameCard(t, T.l02 - 0.05, T.l03 - 0.15, 'DASHRATH MANJHI', 'Gehlaur, Hindistan · 1960');
    O.bigNumber(t, T.elli - 0.1, T.l04 - 0.1, '55 km', 'DOLANMA YOLU');
    O.bigNumber(t, T.yirmi - 0.25, T.l05 - 0.1, tt => String(year(T, tt)), '22 YIL · ÇEKİÇ VE KESKİ');
    O.bigNumber(t, T.yuz - 0.1, T.on - 0.15, '110 m', 'YENİ YOL');
    O.bigNumber(t, T.on - 0.1, T.cutB1 - 0.05, '15 km', 'ESKİDEN 55 KM');
    O.nameCard(t, T.cutB1 + 0.05, T.yedi - 0.2, '33 MADENCİ', 'San José madeni, Şili · 2010');
    O.bigNumber(t, T.yedi - 0.15, T.l07 - 0.05, tt => Math.round(Math.min(700, Math.max(0, -camAt(tt).pos[1] / 660 * 700))) + ' m', 'DERİNLİK');   // kamera iner, sayaç onu izler
    O.bigNumber(t, T.l07 - 0.05, T.sig - 0.25, '17 gün', 'SES YOK');
    note(t);
    O.bigNumber(t, T.cap0 - 0.05, T.l09 - 0.1, tt => capsuleCount(T, tt) + '/33', 'YUKARI ÇEKİLDİ');
    O.bigNumber(t, T.iki - 0.1, T.cutA2 - 0.05, '250 m³', 'KUYUNUN KAYASI');
    O.bigNumber(t, T.en - 0.15, T.l12 - 0.1, tt => { let k = 0; for (let i = 0; i < NCUBE; i++) if (tt >= T.cube(i)) k = i + 1; return k + '×'; }, 'EN AZ · MANJHI\'NİN YARIĞI');
    O.caption(t);
    O.follow(t, T.l12end + 0.4, D - 0.45, 1300);
  }
  { const keep = window.__samples; window.__samples = 1; for (const k of K) S.render(k[0], pose); for (let t = 0; t < D; t += 1.0) S.render(t, pose); window.__samples = keep; }
  return { duration: D, timeline: { T }, render };
}

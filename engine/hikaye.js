// "Hikâye" motoru: karakterli, yavaş, sinematik Hangisi filmleri için ortak çerçeve (2 Kasım gecesi).
// Görsel dil: karanlık bir boşlukta ışık havuzları ("tablolar"); her tabloda karakterler, birkaç güçlü nesne ve
// atmosfer. Film dosyası (engine/films/f<id>.js) yalnızca tabloları, karakter hareketlerini, kamera anahtarlarını
// ve doruğu tarif eder; altyazı, başlık, isim kartı, kamera, sinema geçişleri ve ses ipuçları burada.
// Her kare t'nin saf fonksiyonu; rastgelelik tohumlu.
import { W, H, ease, seg, lerp, clamp01, mulberry32 } from './core.js';
import { F, setFont } from './tower.js';
import { makeSinema, lin, track3, monotone, shadowText } from './sinema.js';
import { makeOverlay, cameraTrack, CX, SAFE, GOLD, WHITE } from './sinema_overlay.js';
import { makeFigure, POSE, FACE, mixPose, mixFace } from './figure.js';
import { CARDS } from './cards/people.js';
import { hikayeTimes, autoChunks } from './hikaye_core.js';

export async function makeHikayeRenderer(ep, canvas) {
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const { tl, T } = hikayeTimes(ep, voice), D = tl.duration;
  const mod = await import(`./films/f${ep.id}.js`);
  const S = makeSinema(ep, canvas, { fog: '#08080A', fogDensity: 0.02, exposure: 1.0, bloom: 0.55, bloomThreshold: 0.95, vignette: 0.38, ...(mod.opts || {}) });
  const { THREE, scene, ctx } = S;
  const std = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.8, metalness: 0, ...o });
  const box = (w, h, d, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof mat === 'string' ? std(mat) : mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const cyl = (rt, rb, h, mat, x, y, z, parent = scene, seg = 20) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof mat === 'string' ? std(mat) : mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(40, 16, 8), new THREE.MeshBasicMaterial({ color: lin('#15161A'), side: THREE.BackSide })));
    for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.9, 2.7), side: THREE.DoubleSide })); p.position.set(Math.cos(i) * 20, 10, Math.sin(i) * 20); p.lookAt(0, 0, 0); env.add(p); }
    scene.environment = new THREE.PMREMGenerator(S.gl).fromScene(env, 0.02).texture; scene.environmentIntensity = 0.5;
  }

  // ——— tablolar: her biri kendi grubu, zemini, ışığı ve atmosferi olan bir sahne parçası ———
  const shaftMat = c => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { col: { value: lin(c) }, k: { value: 0.045 } },
    vertexShader: 'varying float vA; varying vec3 vN; varying vec3 vV; void main(){ vA = uv.y; vec4 w = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-w.xyz); gl_Position = projectionMatrix * w; }',
    fragmentShader: 'uniform vec3 col; uniform float k; varying float vA; varying vec3 vN; varying vec3 vV; void main(){ float a = clamp(vA, 0.0, 1.0); float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0); vec3 c = col * k * a * a * f; gl_FragColor = vec4(c == c ? c : vec3(0.0), 1.0); }',
  });
  const tableaux = [];
  // spot: { x, z, h, r, color, I }; floor: hex | null; fog: [hex, density]; bg: hex; hemi: [sky, ground, I]
  function tableau(name, o = {}) {
    const g = new THREE.Group(); g.position.set(o.x ?? tableaux.length * 120, 0, o.z ?? 0); scene.add(g);
    if (o.floor !== null) { const fl = new THREE.Mesh(new THREE.CircleGeometry(o.floorR ?? 14, 64), o.floorMat || std(o.floor ?? '#2A2622', { roughness: o.floorRough ?? 0.85 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl); }
    const lights = [];
    for (const sp of o.spots || [{}]) {
      const L = new THREE.SpotLight(lin(sp.color ?? '#FFF1DC'), 2.5 * (sp.I ?? 80), 0, sp.angle ?? 0.42, sp.pen ?? 0.75, 2);
      L.position.set(sp.x ?? 0, sp.h ?? 7, sp.z ?? 1.5); L.target.position.set(sp.tx ?? sp.x ?? 0, 0, sp.tz ?? 0); L.castShadow = sp.shadow ?? true;
      L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.0005; L.shadow.normalBias = 0.02;
      g.add(L, L.target); lights.push(L);
      if (sp.shaft === true) {   // hüzme yalnız istenirse (kamera içine girince beyaz leke olur)
 const len = sp.h ?? 7, rr = Math.tan(sp.angle ?? 0.42) * len; const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, rr, len, 32, 1, true).translate(0, -len / 2, 0), shaftMat(sp.color ?? '#FFF1DC')); m.position.copy(L.position); m.lookAt(L.target.position.clone().add(new THREE.Vector3(0, -1e-3, 0))); m.rotateX(-Math.PI / 2); g.add(m); L.userData.shaft = m; }
    }
    const hemi = new THREE.HemisphereLight(lin(o.hemi?.[0] ?? '#3A4250'), lin(o.hemi?.[1] ?? '#141210'), (o.hemi?.[2] ?? 0.35) * 1.5); g.add(hemi);
    const tb = { name, g, lights, hemi, fog: o.fog ?? ['#08080A', 0.02], bg: o.bg, x: g.position.x, z: g.position.z, env: o.env ?? 0.5 };
    tableaux.push(tb); return tb;
  }
  // toz: ışık havuzunda süzülen zerreler (sürekli döngü; süre boyunca kapanır)
  const moteFns = [];
  function motes(tb, n = 120, color = [2.4, 2.2, 1.9], R = 3, Hh = 3) {
    const r = mulberry32(n * 7 + tableaux.indexOf(tb)), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 2 * R, 0.2 + r() * Hh, -R + r() * (R + 0.6), r() * 6.28, 0.003 + r() * 0.004]);   // kameraya yaklaşmaz (z < 0,6)
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(...color), transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }), n); im.frustumCulled = false; tb.g.add(im);
    const m = new THREE.Matrix4();
    const fn = t => { const w = 2 * Math.PI * t / D; d.forEach((p, i) => { m.makeScale(p[4], p[4], p[4]); m.setPosition(p[0] + 0.3 * Math.sin(w + p[3]), p[1] + 0.25 * Math.sin(2 * w + p[3] * 2), p[2] + 0.3 * Math.cos(w + p[3])); im.setMatrixAt(i, m); }); im.instanceMatrix.needsUpdate = true; };
    moteFns.push(fn); return fn;   // her pozda kendiliğinden güncellenir
  }
  // karakter: kart adı ya da kart nesnesi; act(t) → { pos, rot, pose, face, visible }
  const chars = [];
  function character(card, tb, act) { const f = makeFigure(THREE, typeof card === 'string' ? CARDS[card] : card); (tb ? tb.g : scene).add(f.root); chars.push({ f, act }); return f; }
  // poz anahtarları: [[t, poseFn|obj, faceObj, phaseSpeed]] → yumuşak geçiş (0,35 sn)
  function poseTrack(keys) {
    return t => {
      let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
      const k = keys[i], prev = keys[Math.max(0, i - 1)];
      const ev = (p, tt, sp) => (typeof p === 'function' ? p((tt * (sp ?? 1)) % 1) : p);
      const u = i > 0 ? ease.state(seg(t, k[0], 0.35)) : 1;
      return { pose: mixPose(ev(prev[1], t, prev[3]), ev(k[1], t, k[3]), u), face: mixFace(prev[2] || FACE.neutral, k[2] || FACE.neutral, u) };
    };
  }
  const path = keys => track3(keys);                       // [[t, [x,y,z]], ...]

  const api = { THREE, S, scene, T, tl, D, lin, std, box, cyl, canvasTex, tableau, motes, character, poseTrack, path, POSE, FACE, mixPose, mixFace, ease, seg, lerp, clamp01, mulberry32, track3, monotone, makeFigure, CARDS, W, H };
  const film = await mod.film(api);

  // ——— kamera ve sahne seçimi ———
  const K = film.cam;
  const camAt = cameraTrack(K, track3, monotone, film.aperture ?? 0.03);
  const cuts = film.cuts || [];
  const fogC = new THREE.Color();
  function pose(t, lens, jit) {
    const c = camAt(t);
    S.camera.near = film.near ?? 0.03; S.camera.far = film.far ?? 3000;
    S.setCam(c, lens, jit);
    // en yakın tablo görünür (kameranın x'ine göre), diğerleri gizlenir; sis ve arka plan o tablonun
    let best = tableaux[0], bd = 1e9; for (const tb of tableaux) { const d = Math.abs(c.pos[0] - tb.x) + 0.2 * Math.abs(c.pos[2] - tb.z); if (d < bd) { bd = d; best = tb; } }
    for (const tb of tableaux) tb.g.visible = tb === best || (film.alwaysVisible || []).includes(tb.name);
    fogC.copy(lin(best.fog[0])); scene.fog.color.copy(fogC); scene.fog.density = best.fog[1]; scene.background = best.bg ? lin(best.bg) : scene.fog.color;
    scene.environmentIntensity = best.env;
    for (const ch of chars) { const fn = ch.f.act || ch.act; if (!fn) { ch.f.root.visible = false; continue; } const a = fn(t); if (!a) { ch.f.root.visible = false; continue; } ch.f.root.visible = a.visible ?? true; if (a.pos) ch.f.root.position.set(...a.pos); if (a.rot != null) ch.f.root.rotation.set(a.rotX ?? 0, a.rot, a.rotZ ?? 0); if (a.pose) ch.f.pose(a.pose); if (a.face) ch.f.face(a.face); if (a.scale) ch.f.root.scale.setScalar(a.scale); }
    for (const fn of moteFns) fn(t);
    film.update?.(t, best.name);
  }

  // ——— kaplama ———
  const O = makeOverlay(ctx, tl, { chunks: film.chunks || autoChunks(ep, tl), capBase: 1380 });
  function render(t) {
    const nearCut = cuts.some(c => Math.abs(t - c) < 1.2 / 30);
    S.render(t, pose, tt => (nearCut ? 0 : film.shutter ? film.shutter(tt) : 0.5));
    ctx.clearRect(0, 0, W, H);
    O.title(t, ['Hangisi daha', 'şaşırtıcı?'], T.l01end + 0.15, 470, D - 0.45);
    for (const nc of film.names || []) O.nameCard(t, nc[0], nc[1], nc[2], nc[3]);
    for (const bn of film.numbers || []) O.bigNumber(t, bn[0], bn[1], bn[2], bn[3]);
    film.overlay?.(t, ctx, O);
    O.caption(t);
    O.follow(t, T.lastEnd + 0.4, T.loop0 - 0.3, 1300);   // döngü dönüşünden önce çıkar: ilk karenin yüzüyle çakışmaz
  }
  { const keep = window.__samples; window.__samples = 1; for (const k of K) S.render(k[0], pose); for (let t = 0; t < D; t += 1.0) S.render(t, pose); window.__samples = keep; }
  return { duration: D, timeline: { T }, render };
}

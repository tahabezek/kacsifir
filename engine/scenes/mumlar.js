// "Mumlar" şablonu (№ 063): Hangisi daha şaşırtıcı? 122 yaşına giren kadın mı, yüzyıllardır yüzen köpekbalığı mı?
// Kare 0: Grönland köpekbalığının gözü (gözüne tutunmuş soluk kopepod), karanlık sudan. A dünyası: karanlık bir salonda
// uzun bir masa; Calment'ın her yılı bir mum. 1875'te ilk mum yanar; 1889'da (14) Eyfel, 1975'te (100) bisiklet,
// 1997'de 122. mum. B: köpekbalığı ağır ağır yüzer, kamera gözüne iner (yaş göz merceğinden ölçüldü). Doruk: aynı
// masada ikinci sıra; köpekbalığının 392 soğuk mumu yanar, Calment'ın sırasının üç katını geçer (tek büyük vuruş).
// Sürekli döngüler: alevlerin titremesi, deniz karı ve köpekbalığının kuyruk dalgası. Her kare t'nin saf fonksiyonu.
import { W, H, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { F, setFont } from '../tower.js';
import { makeSinema, lin, track3, monotone, shadowText } from '../sinema.js';
import { makeOverlay, cameraTrack, CX, SAFE, GOLD, WHITE } from '../sinema_overlay.js';
import { mumlarTimes, camKeys, calmentLit, sharkLit, litCount, BX, NC, NS, SP, ROW, cx } from './mumlar_core.js';

export async function makeMumlarRenderer(ep, canvas) {
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const { tl, T } = mumlarTimes(ep, voice), D = tl.duration;
  const S = makeSinema(ep, canvas, { fog: '#07060A', fogDensity: 0.03, exposure: 1.0, bloom: 0.7, bloomThreshold: 0.9, vignette: 0.4 });
  const { THREE, scene, ctx } = S;
  const std = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.8, metalness: 0, ...o });
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const gA = new THREE.Group(), gB = new THREE.Group(); scene.add(gA, gB); gB.position.x = BX;
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(40, 16, 8), new THREE.MeshBasicMaterial({ color: lin('#0C0B10'), side: THREE.BackSide })));
    for (let i = 0; i < 12; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.2, 1.2) })); p.position.set(Math.cos(i) * 20, 2 + (i % 3), Math.sin(i) * 20); env.add(p); }
    scene.environment = new THREE.PMREMGenerator(S.gl).fromScene(env, 0.02).texture; scene.environmentIntensity = 0.6;
  }
  const _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();

  // ═══════════════ A: mum salonu ═══════════════
  const woodTex = canvasTex(1024, 256, (g, w, h) => { const r = mulberry32(3); g.fillStyle = '#2A1A10'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? '10,5,2' : '90,55,30'},${0.15 + r() * 0.25})`; g.lineWidth = 1 + r() * 3; g.beginPath(); const y = r() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 6); g.stroke(); } });
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(12, 1);
  const L0 = -2, L1 = cx(NS) + 3;
  { const top = new THREE.Mesh(new THREE.BoxGeometry(L1 - L0, 0.06, 1.5), new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.35, metalness: 0.05 })); top.position.set((L0 + L1) / 2, -0.03, -0.25); gA.add(top);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), std('#0E0B0A', { roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.position.set(L1 / 2, -0.78, 0); gA.add(fl); }
  const hemiA = new THREE.HemisphereLight(lin('#3A3040'), lin('#120C08'), 0.25); gA.add(hemiA);
  // mumlar: gövde (instanced), alev (instanced, HDR), masaya düşen ışık lekesi (instanced, eklemeli)
  const NALL = NC + NS;
  const cand = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.014, 0.015, 1, 14).translate(0, 0.5, 0), std('#F1E8D6', { roughness: 0.55 }), NALL);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const flame = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8).translate(0, 0.6, 0), flameMat, NALL);
  const poolTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const pool = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), NALL);
  for (const im of [cand, flame, pool]) { im.frustumCulled = false; gA.add(im); }
  const hgt = [], r0 = mulberry32(122);
  for (let i = 0; i < NALL; i++) hgt.push(0.09 + r0() * 0.04);
  const GOLDC = new THREE.Color(9, 5.2, 1.6), COLDC = new THREE.Color(2.2, 4.4, 9), GOLDP = new THREE.Color(0.55, 0.32, 0.1), COLDP = new THREE.Color(0.12, 0.25, 0.55);
  for (let i = 0; i < NALL; i++) {
    const s = i < NC, k = s ? i : i - NC, x = cx(k), z = s ? ROW.c : ROW.s;
    _m.makeScale(1, hgt[i], 1); _m.setPosition(x, 0, z); cand.setMatrixAt(i, _m);
    flame.setColorAt(i, s ? GOLDC : COLDC); pool.setColorAt(i, s ? GOLDP : COLDP);
  }
  // ilerleyen ışık: yanan ön ucu izleyen iki nokta ışığı (masaya ve mumlara gerçek ışık)
  const frontC = new THREE.PointLight(lin('#FFB45A'), 0, 6, 2), frontS = new THREE.PointLight(lin('#7FB2FF'), 0, 6, 2), restC = new THREE.PointLight(lin('#FFB45A'), 0, 30, 1.5);
  gA.add(frontC, frontS, restC);
  function placeCandles(t) {
    const nc = litCount(T, t, calmentLit, NC), ns = t >= T.cutA3 ? litCount(T, t, sharkLit, NS) : 0;
    for (let i = 0; i < NALL; i++) {
      const s = i < NC, k = s ? i : i - NC, tl0 = s ? calmentLit(T, k) : sharkLit(T, k);
      const on = s ? (k < nc ? 1 : 0) : (k < ns ? 1 : 0);
      const u = on ? ease.enter(clamp01((t - tl0) / 0.18)) : 0, x = cx(k), z = s ? ROW.c : ROW.s, y = hgt[i];
      const fl = 0.85 + 0.15 * Math.sin(t * 13 + i * 1.7) * Math.sin(t * 7.1 + i * 0.6);
      _m.makeScale(0.007 * u, 0.02 * u * fl, 0.007 * u); _m.setPosition(x + 0.002 * Math.sin(t * 9 + i), y + 0.004, z); flame.setMatrixAt(i, _m);
      const ps = 0.42 * u * (0.92 + 0.08 * fl); _m.makeScale(ps, 1, ps); _m.setPosition(x, 0.002, z); pool.setMatrixAt(i, _m);
    }
    flame.instanceMatrix.needsUpdate = pool.instanceMatrix.needsUpdate = true;
    frontC.position.set(cx(Math.max(0, nc - 1)), 0.25, ROW.c + 0.15); frontC.intensity = nc ? 1.6 : 0;
    frontS.position.set(cx(Math.max(0, ns - 1)), 0.25, ROW.s - 0.1); frontS.intensity = ns ? 1.6 : 0;
    restC.position.set(cx(nc / 2), 0.6, 0.4); restC.intensity = 0.08 * nc;
  }

  // ═══════════════ B: Kuzey Atlantik, karanlık su ═══════════════
  const hemiB = new THREE.HemisphereLight(lin('#5C97A6'), lin('#06100F'), 1.4); gB.add(hemiB);
  const topB = new THREE.DirectionalLight(lin('#BFE3EA'), 3.2); topB.position.set(-1, 10, 4); gB.add(topB, topB.target);
  const rimB = new THREE.PointLight(lin('#7FB5C2'), 14, 14, 2); rimB.position.set(1.5, 1.2, 2.5); gB.add(rimB);
  // su: yukarısı aydınlık camgöbeği, aşağısı koyu; yüzeyden inen ışık hüzmeleri
  { const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: lin('#2C6E7C') }, bot: { value: lin('#020709') } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 vP; void main(){ gl_FragColor = vec4(mix(bot, top, smoothstep(-0.4, 0.9, vP.y)), 1.0); }' });
    gB.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), m));
    const rayTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
    const rm = new THREE.MeshBasicMaterial({ map: rayTex, color: new THREE.Color(0.35, 0.6, 0.65), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    const r = mulberry32(19); for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8 + r() * 1.6, 14), rm); p.position.set(-6 + r() * 9, 3, -3 + r() * 4); p.rotation.set(0, r() * 3, 0.15); gB.add(p); } }
  // köpekbalığı: tornalanmış gövde (baş +x), yüzgeçler, göz ve gözdeki kopepod
  const SL = 4.6, SR = 0.46;
  const skin = canvasTex(1024, 512, (g, w, h) => { const r = mulberry32(8); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3A3836'); gr.addColorStop(0.55, '#4E4A45'); gr.addColorStop(1, '#6E665C'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${r() < 0.6 ? '20,18,16' : '120,112,100'},${0.1 + r() * 0.25})`; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 5, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(170,160,145,0.35)'; for (let i = 0; i < 40; i++) { g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 120, y + (r() - 0.5) * 30); g.stroke(); } });
  const skinM = new THREE.MeshStandardMaterial({ map: skin, roughness: 0.7 });
  const rad = u => SR * (u < 0.14 ? Math.pow(u / 0.14, 0.5) * 0.8 : u < 0.45 ? 0.8 + 0.2 * Math.sin((u - 0.14) / 0.31 * Math.PI / 2) : Math.max(0.06, 1 - Math.pow((u - 0.45) / 0.55, 0.9) * 0.9));
  const prof = []; for (let i = 0; i <= 48; i++) { const u = i / 48; prof.push(new THREE.Vector2(Math.max(0.001, rad(u)), -u * SL)); }
  const bodyGeo = new THREE.LatheGeometry(prof, 48); bodyGeo.rotateZ(-Math.PI / 2);   // y → +x: baş +x tarafında (u = 0 → x = 0)
  { const p = bodyGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setY(i, y < 0 ? y * 0.82 : y * 0.95); } bodyGeo.computeVertexNormals(); }
  // gövde başı x = 0'da: kuyruğa doğru −x; baş biraz geriye alınır
  bodyGeo.translate(0, 0, 0);
  const shark = new THREE.Group(), body = new THREE.Mesh(bodyGeo, skinM); shark.add(body);
  const base = bodyGeo.attributes.position.array.slice();
  const finM = new THREE.MeshStandardMaterial({ color: lin('#3C3936'), roughness: 0.75, side: THREE.DoubleSide });
  const fin = (pts, depth = 0.02) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2); };
  const fins = [];
  const addFin = (geo, u, y, z, rot) => { const m = new THREE.Mesh(geo, finM); const g = new THREE.Group(); m.rotation.set(...rot); g.add(m); g.userData = { u, y, z }; shark.add(g); fins.push(g); return g; };
  addFin(fin([[0, 0], [-0.32, 0], [-0.22, 0.2]]), 0.5, SR * 0.92, 0, [0, 0, 0]);             // 1. sırt yüzgeci (küçük)
  addFin(fin([[0, 0], [-0.26, 0], [-0.2, 0.15]]), 0.68, SR * 0.6, 0, [0, 0, 0]);             // 2. sırt yüzgeci
  for (const sz of [-1, 1]) addFin(fin([[0, 0], [-0.3, 0], [-0.42, -0.08]]), 0.24, -SR * 0.45, sz * SR * 0.62, [sz * 0.6, 0, 0]);   // göğüs yüzgeçleri
  addFin(fin([[0, 0], [-0.55, 0.5], [-0.5, 0.42], [-0.12, 0.02], [-0.42, -0.25], [-0.08, -0.06]]), 0.97, 0, 0, [0, 0, 0]);   // kuyruk
  const eyeLocal = new THREE.Vector3(-0.42, 0.12, SR * 0.62);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 14), new THREE.MeshPhysicalMaterial({ color: lin('#0D1A1C'), roughness: 0.05, clearcoat: 1, emissive: lin('#0E2B2A') }));
  eye.position.copy(eyeLocal); eye.scale.set(1, 0.8, 0.5); shark.add(eye);
  const pod = new THREE.Group(); { const m = std('#D9D2B8', { roughness: 0.6, emissive: lin('#2A2620') }); for (const [a, l] of [[0.3, 0.07], [-0.2, 0.06]]) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, l, 4, 8).translate(0, -l / 2, 0), m); c.rotation.z = a; pod.add(c); } pod.position.copy(eyeLocal).add(new THREE.Vector3(0.006, -0.012, 0.012)); shark.add(pod); }
  for (let i = 0; i < 5; i++) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.07, 0.006), std('#2E2B28')); g.position.set(-0.72 - i * 0.06, -0.02, SR * 0.78); g.rotation.z = 0.15; shark.add(g); }
  shark.position.copy(eyeLocal).multiplyScalar(-1);                        // göz dünya başlangıcında (kare 0)
  gB.add(shark);
  const wave = (u, t) => 0.11 * Math.pow(u, 1.6) * Math.sin(t * 1.5 - u * 5);          // yavaş kuyruk dalgası
  function swim(t) {
    const p = bodyGeo.attributes.position, a = p.array;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], u = clamp01(-x / SL); a[i * 3 + 2] = base[i * 3 + 2] + wave(u, t) - wave(0.1, t); }
    p.needsUpdate = true; bodyGeo.computeVertexNormals();
    for (const g of fins) { const { u, y, z } = g.userData; g.position.set(-u * SL, y, z + wave(u, t) - wave(0.1, t)); g.rotation.y = -Math.atan(0.11 * 5 * Math.pow(u, 1.6) * Math.cos(t * 1.5 - u * 5)) * 0.6; }
    shark.rotation.y = 0.04 * Math.sin(2 * Math.PI * t / D); shark.position.y = -eyeLocal.y + 0.03 * Math.sin(4 * Math.PI * t / D);
  }
  // deniz karı (sürekli döngü; süre boyunca kapanır)
  const snow = (() => { const n = 900, r = mulberry32(5), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 16, r(), (r() - 0.5) * 16, 0.004 + r() * 0.012, r()]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.7, 0.72) }), n); im.frustumCulled = false; gB.add(im); return { im, d }; })();
  function placeSnow(t) {
    snow.d.forEach((p, i) => { const y = 4 - ((p[1] + 2 * t / D) % 1) * 8; _m.makeScale(p[3], p[3], p[3]); _m.setPosition(p[0] + 0.2 * Math.sin(2 * Math.PI * t / D + p[4] * 6), y, p[2]); snow.im.setMatrixAt(i, _m); });
    snow.im.instanceMatrix.needsUpdate = true;
  }

  // ═══════════════ Poz ═══════════════
  const K = camKeys(T);
  const camAt = cameraTrack(K, track3, monotone, 0.02);
  const inB = t => t < T.cutA1 || (t >= T.cutB2 && t < T.cutA3) || t >= T.cutB4;
  const fogA = lin('#07060A'), fogB = lin('#0B2A33');
  function pose(t, lens, jit) {
    const c = camAt(t), b = inB(t);
    S.camera.near = b ? 0.01 : 0.02;
    S.setCam(c, lens, jit);
    gA.visible = !b; gB.visible = b;
    scene.fog.color.copy(b ? fogB : fogA); scene.fog.density = b ? 0.11 : 0.03; scene.background = scene.fog.color;
    if (b) { swim(t); placeSnow(t); } else placeCandles(t);
  }

  // ═══════════════ 2B kaplama ═══════════════
  const O = makeOverlay(ctx, tl, {
    chunks: {
      l01: [['122 yaşına giren kadın mı,', 0], ['yüzyıllardır yüzen köpekbalığı mı?', 7]],
      l02: [['Jeanne Calment, 1875\'te', 0], ["Fransa'nın Arles kentinde doğdu.", 7]],
      l03: [['Eyfel Kulesi açıldığında 14 yaşındaydı.', 0]],
      l04: [['100 yaşında hâlâ bisiklete biniyordu.', 0]],
      l05: [['Belgelenmiş en uzun insan ömrünü yaşadı:', 0], ['122 yıl.', 6]],
      l06: [['Grönland köpekbalığı ise Kuzey Atlantik\'in', 0], ['karanlık ve buz gibi sularında yaşar.', 5]],
      l07: [['Bu tür ancak 150 yaşına yaklaşınca', 0], ['yetişkin olur.', 7]],
      l08: [['Bilim insanları en büyüğünün yaşını', 0], ['göz merceğinden ölçtü:', 5], ['yaklaşık 392 yıl.', 8]],
      l09: [['Peki ikisini yan yana koyarsak?', 0]],
      l10: [["Calment'ın bütün ömrü 122 yıl sürdü.", 0]],
      l11: [['Bu köpekbalığı ise', 0], ['o ömrün 3 katından fazlasını yaşamış olabilir.', 3]],
      l12: [['Sen hangisine şaşırdın?', 0], ['Yoruma yaz.', 3]],
    },
  });
  // mum etiketleri: 3B mumun üstünde, kırpma ile girer
  function tag(t, t0, t1, k, row, a, b, col = GOLD) {
    const inU = ease.enter(seg(t, t0, 0.3)), out = ease.exit(seg(t, t1, 0.25)); if (inU <= 0 || out >= 1 || inB(t)) return;
    const P = S.project(cx(k), 0.24, row); if (P[2] > 1) return;
    setFont(ctx, F.head(48)); const hw = Math.max(ctx.measureText(b).width, 120) / 2 + 10;   // etiket güvenli alanda kalır
    const x = Math.max(SAFE.x0 + hw, Math.min(SAFE.x1 - hw, P[0])), y = Math.max(420, Math.min(1120, P[1] - 30));
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.textAlign = 'center';
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P[0], P[1] - 4); ctx.lineTo(x, y + 16); ctx.stroke();
    ctx.beginPath(); ctx.rect(0, y - 130, W, 160); ctx.clip();
    setFont(ctx, F.head(72)); shadowText(ctx, a, x, y - 50 + (1 - inU) * 60, WHITE, 20);
    setFont(ctx, F.head(48)); shadowText(ctx, b, x, y + 4 + (1 - inU) * 80, col, 18);
    ctx.restore(); ctx.textAlign = 'left';
  }
  const COLD = '#8FC8FF';
  function render(t) {
    const nearCut = [T.cutA1, T.cutB2, T.cutA3, T.cutB4].some(c => Math.abs(t - c) < 1.2 / 30);
    S.render(t, pose, () => (nearCut ? 0 : 0.5));
    ctx.clearRect(0, 0, W, H);
    O.title(t, ['Hangisi daha', 'şaşırtıcı?'], T.l01end + 0.15, 470, D - 0.45);
    O.nameCard(t, T.cutA1 + 0.05, T.ondort - 0.3, 'JEANNE CALMENT', 'Arles, Fransa · 1875–1997');
    tag(t, T.ondort - 0.05, T.l04 - 0.1, 13, ROW.c, '1889', '14 YAŞINDA · EYFEL AÇILDI');
    tag(t, T.l04 - 0.05, T.l05 - 0.1, 99, ROW.c, '1975', '100 YAŞINDA BİSİKLETTE');
    tag(t, T.yil5 - 0.05, T.cutB2 - 0.05, 121, ROW.c, '1997', 'BELGELENMİŞ EN UZUN ÖMÜR');
    O.bigNumber(t, T.yuz5 - 0.1, T.cutB2 - 0.05, '122 yıl', 'JEANNE CALMENT');
    O.nameCard(t, T.cutB2 + 0.05, T.l07 - 0.15, 'GRÖNLAND KÖPEKBALIĞI', 'Kuzey Atlantik ve Arktik');
    O.bigNumber(t, T.yuzelli - 0.1, T.l08 - 0.1, '150', 'YAŞINDA YETİŞKİN OLUR');
    O.bigNumber(t, T.yaklasik - 0.1, T.cutA3 - 0.05, '392', 'TAHMİNİ YAŞ · ARALIK 272–512');
    O.bigNumber(t, T.l10 - 0.05, T.l11 - 0.2, tt => litCount(T, tt, calmentLit, NC) + ' yıl', 'CALMENT');
    O.bigNumber(t, T.l11 - 0.02, T.l12 + 0.2, tt => litCount(T, tt, sharkLit, NS) + ' yıl', 'KÖPEKBALIĞI · TAHMİNİ');
    tag(t, T.l10, T.l12 + 0.2, 121, ROW.c, '122', 'CALMENT');
    tag(t, T.hero - 0.05, T.l12end + 0.3, NS - 1, ROW.s, '392', 'KÖPEKBALIĞI', COLD);
    O.caption(t);
    O.follow(t, T.l12end + 0.4, D - 0.45, 1300);
  }
  { const keep = window.__samples; window.__samples = 1; for (const k of K) S.render(k[0], pose); for (let t = 0; t < D; t += 1.0) S.render(t, pose); window.__samples = keep; }
  return { duration: D, timeline: { T }, render };
}

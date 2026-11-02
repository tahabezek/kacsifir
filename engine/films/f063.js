// № 063 · Avukatı yenen kadın ve 400 yıllık köpekbalığı (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: derin su (köpekbalığı) · Arles'ta dükkân (13 yaş, Van Gogh) · 1965 salon (avukat, zarflar) · 122 mum ·
// derin su (göz merceği) · iki sıra mum. Merkez an: avukatın sandalyesi boşalır, Calment gülümser (l05).
// Doruk: 122 altın mumun yanında 392 soğuk mum yanar; köpekbalığının sırası üç kat uzar.

export const opts = { bloom: 0.7, bloomThreshold: 0.9 };
export function hero(T) { return T.l10end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l02', 'girdi'), w('l05', 'öldü')],
    thock: [w('l06', 'yaşamıştı')],
    scratch: [[w('l10', 'Bu'), hero(T), 0.02]],
    riser: [w('l10', 'Bu'), hero(T)],
    impact: hero(T),
    silence: [T.l09end + 0.1, T.l10],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, D, lin, std, box, cyl, canvasTex, tableau, motes, character, poseTrack, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const updates = [];
  const _m = new THREE.Matrix4();
  const vanGogh = { height: 1.72, heads: 7.3, build: 0.95, skin: '#E2B48E', hair: '#C2541E', hairStyle: 'short', beard: '#C2541E', top: '#3A5A8A', bottom: '#4A3E30', hat: 'straw', hatColor: '#D9B84A', eyes: '#3A6A5A', shoes: '#2A2420' };
  const jeanne120 = { height: 1.38, heads: 6.8, build: 0.8, skin: '#E6C7AE', hair: '#F2F0EA', hairStyle: 'bun', top: '#5A4A6A', dress: 'long', glasses: '#1A1A1A', shoes: '#1A1A1A' };

  // ——— köpekbalığı (tek model; baş +x) ———
  function shark(parent) {
    const SL = 4.6, SR = 0.46, g = new THREE.Group();
    const skin = canvasTex(1024, 512, (c, W, H) => { const r = mulberry32(8); const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3A3836'); gr.addColorStop(0.55, '#4E4A45'); gr.addColorStop(1, '#6E665C'); c.fillStyle = gr; c.fillRect(0, 0, W, H); for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(${r() < 0.6 ? '20,18,16' : '140,132,120'},${0.1 + r() * 0.25})`; c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 5, 0, 7); c.fill(); } });
    const rad = u => SR * (u < 0.14 ? Math.pow(u / 0.14, 0.5) * 0.8 : u < 0.45 ? 0.8 + 0.2 * Math.sin((u - 0.14) / 0.31 * Math.PI / 2) : Math.max(0.06, 1 - Math.pow((u - 0.45) / 0.55, 0.9) * 0.9));
    const prof = []; for (let i = 0; i <= 48; i++) { const u = i / 48; prof.push(new THREE.Vector2(Math.max(0.001, rad(u)), -u * SL)); }
    const geo = new THREE.LatheGeometry(prof, 40); geo.rotateZ(-Math.PI / 2);
    { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setY(i, y < 0 ? y * 0.82 : y * 0.95); } geo.computeVertexNormals(); }
    const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: skin, roughness: 0.7 })); g.add(body);
    const base = geo.attributes.position.array.slice();
    const finM = new THREE.MeshStandardMaterial({ color: lin('#3C3936'), roughness: 0.75, side: THREE.DoubleSide });
    const fin = pts => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return new THREE.ShapeGeometry(s); };
    const fins = [];
    const add = (gg, u, y, z, rx) => { const m = new THREE.Mesh(gg, finM); m.rotation.x = rx; const h = new THREE.Group(); h.add(m); h.userData = { u, y, z }; g.add(h); fins.push(h); };
    add(fin([[0, 0], [-0.32, 0], [-0.22, 0.2]]), 0.5, SR * 0.9, 0, 0); add(fin([[0, 0], [-0.26, 0], [-0.2, 0.15]]), 0.68, SR * 0.6, 0, 0);
    for (const s of [-1, 1]) add(fin([[0, 0], [-0.3, 0], [-0.42, -0.08]]), 0.24, -SR * 0.45, s * SR * 0.62, s * 0.6);
    add(fin([[0, 0], [-0.55, 0.5], [-0.5, 0.42], [-0.12, 0.02], [-0.42, -0.25], [-0.08, -0.06]]), 0.97, 0, 0, 0);
    const eyeP = new THREE.Vector3(-0.42, 0.12, SR * 0.62);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 14), new THREE.MeshPhysicalMaterial({ color: lin('#0D1A1C'), roughness: 0.05, clearcoat: 1, emissive: lin('#1E5A58') })); eye.position.copy(eyeP); eye.scale.set(1, 0.8, 0.5); g.add(eye);
    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.08, 4, 8).translate(0, -0.04, 0), std('#D9D2B8', { emissive: lin('#2A2620') })); pod.position.copy(eyeP).add(new THREE.Vector3(0.006, -0.015, 0.012)); pod.rotation.z = 0.2; g.add(pod);
    parent.add(g);
    const wave = (u, t) => 0.11 * Math.pow(u, 1.6) * Math.sin(t * 1.5 - u * 5);
    return { g, eyeP, swim(t) { const p = geo.attributes.position, a = p.array; for (let i = 0; i < p.count; i++) { const u = clamp01(-base[i * 3] / SL); a[i * 3 + 2] = base[i * 3 + 2] + wave(u, t) - wave(0.1, t); } p.needsUpdate = true; geo.computeVertexNormals(); for (const f of fins) { const { u, y, z } = f.userData; f.position.set(-u * SL, y, z + wave(u, t) - wave(0.1, t)); } } };
  }
  function sea(tb) {
    const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: lin('#2C6E7C') }, bot: { value: lin('#020709') } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 vP; void main(){ gl_FragColor = vec4(mix(bot, top, smoothstep(-0.4, 0.9, vP.y)), 1.0); }' });
    tb.g.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), m));
    const rayTex = canvasTex(64, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
    const rm = new THREE.MeshBasicMaterial({ map: rayTex, color: new THREE.Color(0.3, 0.5, 0.55), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    const r = mulberry32(19); for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8 + r() * 1.4, 14), rm); p.position.set(-6 + r() * 9, 3, -4 + r() * 3); p.rotation.set(0, r() * 3, 0.15); tb.g.add(p); }
    const n = 500, d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 14, r(), (r() - 0.5) * 10, 0.005 + r() * 0.01, r()]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.7, 0.72) }), n); im.frustumCulled = false; tb.g.add(im);
    updates.push(t => { d.forEach((p, i) => { const y = 4 - ((p[1] + 2 * t / D) % 1) * 8; _m.makeScale(p[3], p[3], p[3]); _m.setPosition(p[0] + 0.2 * Math.sin(2 * Math.PI * t / D + p[4] * 6), y, p[2]); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; });
  }

  // ═══ 0 · derin su ═══
  const t0 = tableau('derin', { x: X(0), floor: null, spots: [{ x: 1, h: 6, z: 3, tx: 0, I: 60, angle: 0.6, color: '#BFE3EA', shadow: false }], fog: ['#0B2A33', 0.1], hemi: ['#5C97A6', '#06100F', 1.0] });
  sea(t0);
  const sk = shark(t0.g); sk.g.position.copy(sk.eyeP).multiplyScalar(-1);
  updates.push(t => { sk.swim(t); sk.g.rotation.y = 0.05 * Math.sin(2 * Math.PI * t / D); });

  // ═══ 1 · Arles, dükkân (1888) ═══
  const t1 = tableau('dukkan', { x: X(1), floor: '#5A4430', spots: [{ x: 1, h: 4, z: 2.5, tx: 0, I: 50, angle: 0.7, color: '#FFE2B8' }], fog: ['#120C08', 0.05], hemi: ['#6A5A48', '#1A120C', 0.6] });
  box(2.6, 0.95, 0.6, '#6A4A2E', -0.3, 0.47, -0.4, t1.g); box(4, 3, 0.2, '#4A3626', 0, 1.5, -1.4, t1.g);
  { const r = mulberry32(5), cols = ['#8A2A2A', '#2A4A7A', '#D9B84A', '#3A6A4A', '#E8E2D6', '#7A4A8A']; for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const c = cyl(0.07, 0.07, 0.36, cols[Math.floor(r() * cols.length)], -1.6 + i * 0.4, 1.0 + row * 0.4, -1.2, t1.g); c.rotation.z = Math.PI / 2; } }
  const j13 = character('jeanne13', t1, t => ({ pos: [-0.6, 0, -0.85], rot: 0.35, pose: POSE.stand(), face: t > w('l03', 'Çok') ? { ...FACE.sad, smile: -0.5, browTilt: -0.4 } : FACE.surprise }));
  const vg = character(vanGogh, t1, t => { const u = seg(t, w('l02', 'Van') - 1.2, 1.4); return { pos: [lerp(2.6, 0.7, ease.state(u)), 0, lerp(1.4, 0.2, ease.state(u))], rot: -2.4, pose: u < 1 ? POSE.walk((t * 0.8) % 1, 0.6) : POSE.stand(), face: { ...FACE.neutral, browTilt: -0.4, smile: -0.2 } }; });

  // ═══ 2 · 1965 salon: avukat ve zarflar ═══
  const t2 = tableau('salon', { x: X(2), floor: '#4A3A2E', spots: [{ x: 0.4, h: 3.5, z: 1.8, tx: 0, I: 45, angle: 0.75, color: '#FFE6C4' }], fog: ['#0E0A08', 0.05], hemi: ['#6A5A48', '#1A120C', 0.6] });
  box(1.4, 0.06, 0.9, '#6A4A2E', 0, 0.74, 0, t2.g); for (const [x, z] of [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]]) box(0.05, 0.74, 0.05, '#5A3E26', x, 0.37, z, t2.g);
  const chairM = std('#3A2A20'); box(0.45, 0.06, 0.45, chairM, -1.05, 0.45, 0, t2.g); box(0.45, 0.06, 0.45, chairM, 1.05, 0.45, 0, t2.g);
  const j90 = character('jeanne90', t2, t => ({ pos: [-1.05, 0.02, 0], rot: Math.PI / 2, pose: POSE.sit(), face: t > w('l05', 'öldü') ? FACE.smile : { ...FACE.neutral, smile: 0.35 } }));
  const lawyer = character('lawyer', t2, t => { const gone = seg(t, w('l05', 'öldü') - 0.3, 0.6); return { visible: gone < 1, pos: [1.05, 0.02, 0], rot: -Math.PI / 2, scale: 1 - 0.0 * gone, pose: t < w('l04', 'satın') ? POSE.sit() : mixPose(POSE.sit(), { ...POSE.sit(), rShoulder: [-1.2, 0, 0.1], rElbow: [-0.4, 0, 0] }, 0.6 + 0.4 * Math.sin(t * 3)), face: t > T.l05 ? { ...FACE.sad, smile: -0.3 } : FACE.smile }; });
  const env = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.005, 0.12), std('#E8DCC0', { roughness: 0.9 }), 60); env.frustumCulled = false; t2.g.add(env);
  const calCanvas = document.createElement('canvas'); calCanvas.width = 256; calCanvas.height = 320; const calG = calCanvas.getContext('2d'), calTex = new THREE.CanvasTexture(calCanvas); calTex.colorSpace = THREE.SRGBColorSpace;
  { const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.62), new THREE.MeshStandardMaterial({ map: calTex, roughness: 0.8 })); cal.position.set(0, 1.9, -1.3); t2.g.add(cal); box(3, 2.8, 0.1, '#3A2E26', 0, 1.4, -1.4, t2.g); }
  let calKey = -1;
  const yearAt = t => Math.round(1965 + 30 * ease.state(seg(t, T.l05, w('l05', 'öldü') - T.l05)));

  // ═══ 3 · 122 mum (ve 120 yaşında Calment) ═══
  const candles = (tb, n, row, color, poolC) => {
    const cand = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.014, 0.015, 1, 12).translate(0, 0.5, 0), std('#F1E8D6', { roughness: 0.55 }), n);
    const flame = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8).translate(0, 0.6, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(...color), fog: false }), n);
    const r = mulberry32(n + row * 7), hg = []; for (let i = 0; i < n; i++) { hg.push(0.09 + r() * 0.04); _m.makeScale(1, hg[i], 1); _m.setPosition(i * 0.12, 0.76, row); cand.setMatrixAt(i, _m); }
    tb.g.add(cand, flame); cand.frustumCulled = flame.frustumCulled = false;
    const light = new THREE.PointLight(lin(poolC), 0, 8, 1.5); tb.g.add(light);
    return (t, litTime) => { let lit = 0; for (let i = 0; i < n; i++) { const t0 = litTime(i), u = t >= t0 ? ease.enter(clamp01((t - t0) / 0.18)) : 0; if (u > 0) lit = i + 1; const fl = 0.85 + 0.15 * Math.sin(t * 13 + i * 1.7); _m.makeScale(0.007 * u, 0.02 * u * fl, 0.007 * u); _m.setPosition(i * 0.12, 0.76 + hg[i] + 0.004, row); flame.setMatrixAt(i, _m); } flame.instanceMatrix.needsUpdate = true; light.position.set(lit * 0.06, 1.1, row + 0.3); light.intensity = 0.05 * lit; };
  };
  const t3 = tableau('mum122', { x: X(3), floor: '#1A1410', spots: [{ x: 7, h: 4, z: 2, tx: 7, I: 6, angle: 0.9, color: '#FFD9A0', shadow: false }], fog: ['#07060A', 0.04], hemi: ['#3A3040', '#120C08', 0.3] });
  box(16, 0.06, 1.2, '#2A1A10', 7.3, 0.73, -0.2, t3.g);
  const row122 = candles(t3, 122, 0, [9, 5.2, 1.6], '#FFB45A');
  const j120 = character(jeanne120, t3, () => ({ pos: [15.4, 0.02, 0.6], rot: -0.9, pose: POSE.sit(), face: FACE.smile }));
  box(0.55, 0.05, 0.5, '#3A3A3E', 15.4, 0.46, 0.6, t3.g);
  const litC = i => w('l06', 'Yüz') - 0.2 + (w('l06', 'yaşamıştı') + 0.3 - w('l06', 'Yüz') + 0.2) * Math.pow(i / 121, 0.8);

  // ═══ 4 · derin su: göz merceği ═══
  const t4 = tableau('derin2', { x: X(4), floor: null, spots: [{ x: 1, h: 6, z: 3, tx: 0, I: 60, angle: 0.6, color: '#BFE3EA', shadow: false }], fog: ['#0B2A33', 0.1], hemi: ['#5C97A6', '#06100F', 1.0] });
  sea(t4);
  const sk2 = shark(t4.g); updates.push(t => { sk2.swim(t); const gz = w('l08', 'göz') - 0.2; sk2.g.position.set(t < gz ? lerp(0.6, 1.9, seg(t, T.l07, gz - T.l07)) : lerp(1.9, 4, seg(t, gz, T.l08end - gz)), -0.12, 0); });

  // ═══ 5 · iki sıra ═══
  const t5 = tableau('ikisira', { x: X(5), floor: '#1A1410', floorR: 40, spots: [{ x: 20, h: 6, z: 4, tx: 20, I: 4, angle: 1.2, color: '#B0C8FF', shadow: false }], fog: ['#07060A', 0.03], hemi: ['#3A3040', '#120C08', 0.3] });
  box(52, 0.06, 1.6, '#2A1A10', 23, 0.73, -0.25, t5.g);
  const rowC = candles(t5, 122, 0, [9, 5.2, 1.6], '#FFB45A'), rowS = candles(t5, 392, -0.5, [2.2, 4.4, 9], '#7FB2FF');
  const litS = i => w('l10', 'o') - 0.1 + (hero(T) - w('l10', 'o') + 0.1) * Math.pow((i + 1) / 392, 0.75);
  const countS = t => { let c = 0; for (let i = 0; i < 392; i++) if (t >= litS(i)) c = i + 1; else break; return c; };

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.6, 0.25, 2.4), P(0, -0.3, 0, 0), 40];
  const cam = [
    [0, ...F0, null, 0.004],
    [0.6, P(0, 0.52, 0.22, 2.1), P(0, -0.3, 0, 0), 40, null, 0.004],
    [T.l01end, P(0, -1.0, 0.6, 4.6), P(0, -1.3, 0, 0), 42],
    ...cut(T.l02 - 0.15, [P(0, -1.0, 0.6, 4.58), P(0, -1.3, 0, 0), 42], [P(1, 0.6, 1.5, 4.2), P(1, 0.2, 1.2, -0.4), 44]),
    [w('l02', 'Van') + 0.3, P(1, 0.4, 1.5, 4.0), P(1, 0.0, 1.3, -0.3), 44],
    [T.l03end + 0.3, P(1, 0.2, 1.5, 1.4), P(1, -0.55, 1.45, -0.8), 36, null, 0.02],
    ...cut(T.l04 - 0.15, [P(1, 0.2, 1.5, 1.38), P(1, -0.55, 1.45, -0.8), 36], [P(2, 0, 1.7, 5.4), P(2, 0, 0.95, 0), 44]),
    [T.l04end, P(2, 0.2, 1.6, 4.8), P(2, 0, 0.95, 0), 44],
    [w('l05', 'öldü') + 0.2, P(2, -0.2, 1.5, 4.4), P(2, -0.3, 0.95, 0), 44],
    [T.l05end + 0.5, P(2, -0.15, 1.2, 0.95), P(2, -1.0, 1.05, 0), 38, null, 0.02],
    ...cut(T.l06 - 0.15, [P(2, -0.15, 1.2, 0.94), P(2, -1.0, 1.05, 0), 38], [P(3, -1.2, 1.1, 2.2), P(3, 2, 0.8, -0.2), 40]),
    [T.l06end + 0.3, P(3, 13.6, 1.3, 2.6), P(3, 15.2, 0.9, 0.3), 40],
    ...cut(T.l07 - 0.15, [P(3, 13.6, 1.3, 2.58), P(3, 15.2, 0.9, 0.3), 40], [P(4, -0.4, 0.7, 7.0), P(4, -1.2, 0, 0), 46]),
    [w('l08', 'göz') - 0.2, P(4, 2.2, 0.2, 1.6), P(4, 1.5, 0, 0.28), 36, null, 0.006],
    [T.l08end, P(4, 3.9, 0.12, 0.95), P(4, 3.58, 0, 0.29), 32, null, 0.004],
    ...cut(T.l09 - 0.15, [P(4, 3.9, 0.12, 0.94), P(4, 3.58, 0, 0.29), 32], [P(5, -1.4, 1.5, 2.2), P(5, 4, 0.75, -0.25), 40]),
    [T.l10, P(5, -1.2, 1.5, 2.1), P(5, 5, 0.75, -0.25), 40],
    [hero(T), P(5, -1.6, 2.2, 2.4), P(5, 18, 0.75, -0.25), 38],
    [T.l11end + 0.6, P(5, -1.8, 2.5, 2.6), P(5, 20, 0.75, -0.25), 38],
    ...cut(T.loop0, [P(5, -1.8, 2.52, 2.62), P(5, 20, 0.75, -0.25), 38], [P(0, 0.75, 0.3, 3.0), P(0, -0.3, 0, 0), 40, null, 0.004]),
    [T.D - 0.6, P(0, 0.68, 0.28, 2.7), P(0, -0.3, 0, 0), 40, null, 0.004],
    [T.D, ...F0, null, 0.004],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l02', 'Jan') - 0.1, T.l03 - 0.2, 'JEANNE CALMENT', 'Arles, Fransa · 1875–1997'], [w('l07', 'Grönland') - 0.1, w('l07', 'Ancak') - 0.2, 'GRÖNLAND', 'köpekbalığı · Kuzey Atlantik ve Arktik']],
    numbers: [[w('l06', 'Yüz') - 0.15, T.l07 - 0.3, '122 yıl', 'BELGELENMİŞ EN UZUN ÖMÜR'], [w('l08', 'yaklaşık') - 0.1, T.l09 - 0.3, '~400', 'TAHMİNİ YAŞ · ARALIK 272–512'],
      [T.l10 - 0.05, w('l10', 'Bu') - 0.3, '122 yıl', 'CALMENT'], [w('l10', 'o') - 0.15, T.l11 + 0.3, t => countS(t) + ' yıl', 'KÖPEKBALIĞI · TAHMİNİ']],
    update(t) {
      for (const u of updates) u(t);
      // zarflar: her ay bir zarf; masada birikir
      const ne = Math.floor(60 * seg(t, w('l04', 'para') - 0.3, w('l05', 'öldü') - w('l04', 'para') + 0.3));
      for (let i = 0; i < 60; i++) { const s = i < ne ? 1 : 0; _m.makeScale(s, s, s); _m.setPosition(0.15 + (i % 3) * 0.03, 0.78 + i * 0.006, -0.05 + (i % 2) * 0.03); env.setMatrixAt(i, _m); } env.instanceMatrix.needsUpdate = true;
      const y = yearAt(t); if (y !== calKey) { calKey = y; calG.fillStyle = '#F2EEE4'; calG.fillRect(0, 0, 256, 320); calG.fillStyle = '#B42318'; calG.fillRect(0, 0, 256, 70); calG.fillStyle = '#FFF'; calG.font = '800 44px Archivo'; calG.textAlign = 'center'; calG.fillText('ARLES', 128, 50); calG.fillStyle = '#1A1A1A'; calG.font = '800 96px Archivo'; calG.fillText(String(y), 128, 210); calTex.needsUpdate = true; }
      row122(t, litC);
      rowC(t, () => -1); rowS(t, litS);
    },
  };
}

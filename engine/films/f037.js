// № 037 · Gökten düşen kız ve yedi kez yıldırım çarpan adam (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: gökyüzü (koltuk sırasıyla düşüş) · kabin (anne ve kız, penceredeki şimşek) · orman (iniş, boş koltuk) ·
// dere (11 gün) · kulübe (ormancılar) · Virginia kulesi (ilk yıldırım) · Roy yakın çekim · göl (yedinci) · kalabalık.
// Doruk: 15.300 kişilik kalabalıkta tek bir ışık; aynı adama yedi yıldırım.

export const opts = { bloom: 0.7, bloomThreshold: 0.9 };
export function hero(T) { return T.l10end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l03 - 0.3, T.l03 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l05 - 0.3, T.l05 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l08 - 0.3, T.l08 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    rumble: [[0.5, 0.3], [w('l02', 'yıldırım'), 0.7], [w('l06', 'tek'), 0.5], [w('l06', 'yedi'), 0.5], [w('l07', 'ilk') + 0.3, 0.6], [w('l07', 'kaşları'), 0.35], [w('l07', 'omzu'), 0.35], [w('l07', 'saçı'), 0.35], [w('l08', 'çarptı'), 0.6]],
    thock: [w('l03', 'düştü')],
    scratch: [[w('l10', "roy'a") - 0.4, hero(T), 0.02]],
    riser: [w('l10', "roy'a") - 0.4, hero(T)],
    impact: hero(T),
    silence: [T.l09end + 0.1, T.l10],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, D, lin, std, box, cyl, canvasTex, tableau, motes, character, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const updates = [];
  const _m = new THREE.Matrix4();
  const TAU = Math.PI * 2;
  const worker = { height: 1.68, heads: 7.2, build: 1.0, skin: '#A8784E', hair: '#141210', hairStyle: 'short', top: '#6A6A4A', bottom: '#3A3A30', hat: 'cap', hatColor: '#4A4A3A', shoes: '#2A2420' };
  const royBurnt = { ...CARDS.roy, hatColor: '#4A3E2E' };

  // şimşek: kırık çizgi, HDR beyaz; flash(t, times) titreşimli parlaklık
  const boltM = new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 7, 10), fog: false });
  function bolt(parent, a, b, seed, th = 0.08) {
    const g = new THREE.Group(), r = mulberry32(seed), n = 9, P = [];
    for (let i = 0; i <= n; i++) { const u = i / n, j = i && i < n ? 1 : 0; P.push(new THREE.Vector3(lerp(a[0], b[0], u) + j * (r() - 0.5) * Math.abs(a[1] - b[1]) * 0.12, lerp(a[1], b[1], u), lerp(a[2], b[2], u) + j * (r() - 0.5) * 0.4)); }
    for (let i = 0; i < n; i++) { const d = P[i + 1].clone().sub(P[i]), m = new THREE.Mesh(new THREE.BoxGeometry(th, d.length(), th), boltM); m.position.copy(P[i]).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); }
    g.visible = false; parent.add(g); return g;
  }
  const flash = (t, times) => { let v = 0; for (const s of times) { const d = t - s; if (d >= 0 && d < 0.4) v = Math.max(v, d < 0.06 ? 1 : d < 0.12 ? 0.25 : d < 0.18 ? 0.85 : 0.3 * (1 - (d - 0.18) / 0.22)); } return v; };
  function seatRow(parent, n, color = '#3A4A6A') {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.56; box(0.5, 0.12, 0.5, color, x, 0.42, 0, g); box(0.5, 0.75, 0.1, color, x, 0.82, -0.24, g); box(0.06, 0.3, 0.45, '#2A2A30', x + 0.27, 0.55, 0, g); }
    box(1.7 * n / 3, 0.06, 0.4, '#2A2A30', 0, 0.3, -0.05, g); parent.add(g); return g;
  }
  function tree(g, x, z, h, r, seed) { cyl(r * 0.6, r, h, '#3A3024', x, h / 2, z, g); const rr = mulberry32(seed); for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + rr() * 1.2, 1), std(['#24401E', '#2E4A22', '#1E3618'][i % 3], { flatShading: true })); s.position.set(x + (rr() - 0.5) * 2, h + (rr() - 0.3) * 1.5, z + (rr() - 0.5) * 2); g.add(s); } }

  // ═══ 0 · gökyüzü: koltuk sırasıyla düşüş ═══
  const t0 = tableau('gok', { x: X(0), floor: null, spots: [{ x: 3, h: 6, z: 4, tx: 0, I: 120, angle: 0.7, color: '#F2F4F8' }], fog: ['#9AA6B2', 0.025], bg: '#9AA6B2', hemi: ['#E6ECF2', '#4A5A44', 1.2], env: 0.8 });
  const row0 = seatRow(t0.g, 3);
  const jul0 = character('juliane', t0, t => ({ pos: [0, 0, 0.02], rot: 0, pose: { ...POSE.sit(), lShoulder: [-0.5, 0, -0.5], rShoulder: [-0.5, 0, 0.5], lElbow: [-0.4, 0, 0], rElbow: [-0.4, 0, 0], head: [-0.15, 0, 0.1] }, face: t < 2 ? FACE.closed : FACE.fear }));
  row0.add(jul0.root);
  { const n = 70, r = mulberry32(4), C = []; for (let i = 0; i < n; i++) { const a = r() * TAU, rad = 9 + r() * 20; C.push([Math.cos(a) * rad, r(), Math.sin(a) * rad, 2 + r() * 5]); }
    const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({ color: lin('#F2F2F4'), roughness: 1, transparent: true, opacity: 0.9 }), n); im.frustumCulled = false; t0.g.add(im);
    const k = Math.max(1, Math.round(D * 16 / 90));
    updates.push(t => { C.forEach(([x, u, z, s], i) => { const y = ((u + k * t / D) % 1) * 90 - 50; _m.makeScale(s, s * 0.6, s); _m.setPosition(x, y, z); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 48), std('#1E3A1A')); ground.rotation.x = -Math.PI / 2; ground.position.y = -70; t0.g.add(ground); }
  updates.push(t => { const a = TAU * t / D; row0.rotation.set(0.35 * Math.sin(a * 3), 0.5 * Math.sin(a * 2), 0.25 * Math.cos(a * 3)); });

  // ═══ 1 · kabin ═══
  const t1 = tableau('kabin', { x: X(1), floor: '#3A3A40', floorR: 4, spots: [{ x: 0.3, h: 2.4, z: 1.2, tx: -0.6, I: 14, angle: 0.8, color: '#FFE6C8' }], fog: ['#141418', 0.08], hemi: ['#6A6A74', '#1A1A1E', 0.6] });
  { const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 9, 32, 1, true), std('#C8C4BA', { side: THREE.BackSide, roughness: 0.8 })); tube.rotation.x = Math.PI / 2; tube.position.set(0, 1.1, 0); t1.g.add(tube); }
  seatRow(t1.g, 3, '#4A5A7A').position.set(-0.7, 0, 0); seatRow(t1.g, 3, '#4A5A7A').position.set(-0.7, 0, -1.0);
  const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.27, 0.3), fog: false });
  for (const z of [-0.6, 0.35]) { const wm = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.4), winM); wm.position.set(-1.58, 1.2, z); wm.rotation.y = Math.PI / 2; t1.g.add(wm); }
  const winL = new THREE.PointLight(lin('#DDE6FF'), 0, 4, 2); winL.position.set(-1.45, 1.2, 0.3); t1.g.add(winL);
  const shake = t => (t > w('l02', 'uçak') ? 0.012 * Math.sin(t * 37) * (1 + flash(t, [w('l02', 'yıldırım')]) * 3) : 0);
  const jul1 = character('juliane', t1, t => ({ pos: [-1.26, shake(t), 0.02], rot: 0, pose: { ...POSE.sit(), head: [0, t > w('l02', 'uçak') ? 0.7 : 0.15, 0] }, face: t > w('l02', 'yıldırım') ? FACE.fear : t > w('l02', 'uçak') ? { ...FACE.surprise, look: -0.8 } : { ...FACE.smile, look: 0.4 } }));
  const mom1 = character('julianeMom', t1, t => ({ pos: [-0.7, shake(t + 0.3), 0.02], rot: 0, pose: { ...POSE.sit(), head: [0.05, -0.3, 0] }, face: t > w('l02', 'yıldırım') ? { ...FACE.closed, browTilt: 0.3 } : { ...FACE.smile, look: -0.5 } }));

  // ═══ 2 · orman: iniş ═══
  const t2 = tableau('orman', { x: X(2), floor: '#2A3420', floorR: 14, spots: [{ x: 1, h: 9, z: 2, tx: 0, I: 90, angle: 0.5, color: '#E8F0D0', shaft: true }], fog: ['#1A2616', 0.09], hemi: ['#6A8A5A', '#0E140C', 0.7] });
  { const r = mulberry32(12); for (let i = 0; i < 16; i++) { const a = r() * TAU, d = 3 + r() * 7; tree(t2.g, Math.cos(a) * d, Math.sin(a) * d - 1, 7 + r() * 5, 0.2 + r() * 0.25, i + 30); } for (let i = 0; i < 30; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 5), std('#2E4A22', { flatShading: true })); c.position.set((r() - 0.5) * 8, 0.3, (r() - 0.5) * 6); t2.g.add(c); } }
  const row2 = seatRow(t2.g, 3);
  const land = w('l03', 'düştü');
  updates.push(t => { const u = seg(t, land - 0.9, 0.9); row2.position.set(0, lerp(9, 0, u), 0); row2.rotation.set(0, 0.5, u < 1 ? 0.4 * (1 - u) : 0.12); });
  motes(t2, 80, [0.8, 1.0, 0.7], 5, 6);
  const jul2 = character('juliane', t2, t => { const afterHit = t > w('l03', 'köprücük') - 0.2; return afterHit ? { pos: [0.75, 0, 0.55], rot: -0.3, pose: { ...POSE.sitHunched(), liftK: -0.78, rShoulder: [-1.2, 0.9, 0.3], rElbow: [-1.6, 0, 0], head: [0.1, t > w('l03', 'annesi') ? 0.9 : 0, 0] }, face: t > w('l03', 'annesi') ? { ...FACE.fear, look: 1 } : FACE.pain } : { pos: [0, 0, 0.02], rot: 0, pose: POSE.sit(), face: FACE.closed }; });
  updates.push(t => { if (t > w('l03', 'köprücük') - 0.2) { if (jul2.root.parent !== t2.g) t2.g.add(jul2.root); } else if (jul2.root.parent !== row2) row2.add(jul2.root); });

  // ═══ 3 · dere ═══
  const t3 = tableau('dere', { x: X(3), floor: '#24301E', floorR: 14, spots: [{ x: -1, h: 7, z: 0, tx: 0, I: 130, angle: 0.7, color: '#C8D8E0' }], fog: ['#141E1A', 0.07], hemi: ['#7A9A90', '#0A100C', 1.1] });
  { const water = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 30), new THREE.MeshStandardMaterial({ color: lin('#3A4A42'), roughness: 0.08, metalness: 0.4 })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.12, -8); t3.g.add(water); const r = mulberry32(31); for (let i = 0; i < 18; i++) { const s = i % 2 ? 1 : -1; tree(t3.g, s * (2 + r() * 4), -14 + i * 1.3, 6 + r() * 4, 0.2 + r() * 0.2, i + 60); } }
  motes(t3, 160, [0.6, 0.7, 0.8], 4, 5);
  const sandal = box(0.09, 0.03, 0.24, '#F2F2EE', 0, 0, 0, t3.g);
  const throwT = w('l04', 'akıntıyı');
  const julZ = t => lerp(-5.5, -0.9, seg(t, T.l04 - 0.3, T.l04end + 0.6 - T.l04));
  const jul3 = character('juliane', t3, t => { const th = seg(t, throwT - 0.5, 0.5); return { pos: [0.1 * Math.sin(t * 1.3), -0.12, julZ(t)], rot: 0, pose: th > 0 && th < 1 ? { ...POSE.walk((t * 0.5) % 1, 0.4), rShoulder: [lerp(0.6, -1.6, ease.enter(th)), 0, 0.2] } : { ...POSE.walk((t * 0.5) % 1, 0.4), lShoulder: [-0.3, 0, -0.6], lElbow: [-1.3, 0, 0] }, face: { ...FACE.determined, browTilt: 0.4 } }; });
  updates.push(t => { const u = seg(t, throwT, 0.6), z0 = julZ(throwT); sandal.position.set(0.3, u <= 0 ? -5 : 0.14 + 0.9 * Math.sin(Math.PI * u) * (1 - u * 0.3), z0 + 1.6 * u); sandal.rotation.x = 6 * u; });

  // ═══ 4 · kulübe ═══
  const t4 = tableau('kulube', { x: X(4), floor: '#3A3424', floorR: 14, spots: [{ x: 2, h: 8, z: 4, tx: 0, I: 110, angle: 0.55, color: '#FFE8C0' }], fog: ['#1C2418', 0.06], hemi: ['#8A9A70', '#141410', 0.8] });
  { box(3, 2.2, 0.12, '#6A5034', 0, 1.1, -1.6, t4.g); box(0.12, 2.2, 2.4, '#5E4630', -1.5, 1.1, -0.4, t4.g); box(0.12, 2.2, 2.4, '#5E4630', 1.5, 1.1, -0.4, t4.g); const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 4), std('#8A7A4A', { flatShading: true })); roof.rotation.y = Math.PI / 4; roof.position.set(0, 2.8, -0.4); t4.g.add(roof); const r = mulberry32(44); for (let i = 0; i < 10; i++) tree(t4.g, (i % 2 ? 1 : -1) * (4 + r() * 5), -6 + r() * 8, 6 + r() * 4, 0.25, i + 80); }
  const jul4 = character('juliane', t4, () => ({ pos: [-0.2, 0, 0.2], rot: 0.4, pose: { ...POSE.sitHunched(), liftK: -0.78 }, face: { ...FACE.sad, look: 0.6 } }));
  const wk = [0, 1].map(i => character({ ...worker, skin: i ? '#8A5A3A' : '#A8784E', top: i ? '#4A5A6A' : '#6A6A4A', hat: i ? null : 'cap' }, t4, t => { const u = seg(t, w('l05', 'ormancılar') - 1.0 + i * 0.3, 1.6); const kneel = i === 0 && t > w('l05', 'buldu') + 0.2; return { pos: [lerp(3.2 + i, 0.5 + i * 0.7, ease.state(u)), 0, lerp(1.4, 0.6 - i * 0.6, ease.state(u))], rot: -1.9, pose: kneel ? { ...POSE.kneel(), rShoulder: [-1.0, 0, 0.2] } : u > 0 && u < 1 ? POSE.walk((t * 0.8 + i * 0.3) % 1, 0.6) : POSE.stand(), face: FACE.surprise }; }));

  // ═══ 5 · Virginia: kule ve dağlar ═══
  const t5 = tableau('kule', { x: X(5), floor: '#3A4430', floorR: 30, spots: [{ x: 3, h: 10, z: 6, tx: 0, I: 70, angle: 0.6, color: '#C8D0E0' }], fog: ['#3A4048', 0.025], bg: '#4A505A', hemi: ['#7A8494', '#1A1E18', 0.7], env: 0.5 });
  { const r = mulberry32(55); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(14 + r() * 10, 9 + r() * 7, 6), std(['#2A3A30', '#344238', '#26322A'][i % 3], { flatShading: true })); m.position.set(-50 + i * 13, 4, -45 - r() * 20); t5.g.add(m); }
    for (const [x, z] of [[-0.8, -4.8], [0.8, -4.8], [-0.8, -3.2], [0.8, -3.2]]) { const l = cyl(0.06, 0.08, 6.5, '#4A3A2A', x, 3.2, z, t5.g); l.rotation.z = x * 0.05; }
    box(2.2, 1.4, 2.2, '#5A4A36', 0, 7.0, -4, t5.g); const rf = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.8, 4), std('#3A2E22')); rf.rotation.y = Math.PI / 4; rf.position.set(0, 8.1, -4); t5.g.add(rf); }
  const bolts5 = [bolt(t5.g, [-6, 40, -40], [-4, 0, -40], 1, 0.5), ...[0, 1, 2, 3, 4, 5, 6].map(i => bolt(t5.g, [-30 + i * 10, 40, -50], [-28 + i * 10, 2, -50], 10 + i, 0.5))];
  const hitR = bolt(t5.g, [0.5, 14, -1.4], [0.15, 0, 1.3], 21, 0.07);
  const sun5 = new THREE.DirectionalLight(lin('#DDE6FF'), 0); sun5.position.set(0, 30, 10); t5.g.add(sun5);
  const runT0 = w('l07', 'bin') - 0.2, hitT = w('l07', 'ilk') + 0.3;
  const roy5 = character('roy', t5, t => { const u = seg(t, runT0, hitT - runT0), down = t > hitT; return { pos: [lerp(0, 0.15, u), 0, lerp(-3.2, 1.3, u)], rot: 0, pose: down ? { ...POSE.kneel(), spine: [0.35, 0, 0], lShoulder: [-0.5, 0, -0.4] } : u > 0 && u < 1 ? POSE.run((t * 1.4) % 1) : { ...POSE.stand(), head: [-0.3, 0, 0] }, face: down ? FACE.pain : u > 0 ? FACE.fear : { ...FACE.surprise, lookY: 1 } }; });
  const burn = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.02, 0.02, 0.02) })); burn.rotation.x = -Math.PI / 2; t5.g.add(burn);
  const ember = new THREE.PointLight(lin('#FF7A2A'), 0, 1.5, 2); t5.g.add(ember);

  // ═══ 6 · Roy yakın çekim (kamyon, bahçe, kulübe) ═══
  const t6 = tableau('roy3', { x: X(6), floor: '#2A2A26', floorR: 6, spots: [{ x: 1, h: 4, z: 2, tx: 0, I: 25, angle: 0.6, color: '#C8D0E0' }], fog: ['#0E1014', 0.08], hemi: ['#4A505A', '#0A0A0A', 0.4] });
  const fl6 = new THREE.PointLight(lin('#E6EEFF'), 0, 8, 1.5); fl6.position.set(0.6, 3, 1); t6.g.add(fl6);
  const roy6 = character(royBurnt, t6, t => { const k = t > w('l07', 'saçı') ? 2 : t > w('l07', 'omzu') ? 1 : 0; return { pos: [0, 0, 0], rot: [0, 0.6, -0.3][k], pose: [{ ...POSE.stand(), lShoulder: [-2.5, 0.2, -0.2], lElbow: [-1.6, 0, 0] }, { ...POSE.stand(), spine: [0.2, 0, -0.2], rShoulder: [-1.4, -0.5, 0.2], rElbow: [-1.8, 0, 0] }, { ...POSE.armsUp(), head: [0.3, 0, 0] }][k], face: [FACE.pain, FACE.shout, { ...FACE.sad, browTilt: 0.6 }][k] }; });
  const smoke6 = motes(t6, 40, [0.5, 0.45, 0.4], 0.5, 2.6);

  // ═══ 7 · göl: yedinci yıldırım ═══
  const t7 = tableau('gol', { x: X(7), floor: '#3A3A2C', floorR: 6, spots: [{ x: -2, h: 6, z: 3, tx: 0, I: 60, angle: 0.6, color: '#E8C8A8' }], fog: ['#3A3640', 0.04], bg: '#5A5260', hemi: ['#9A8A9A', '#1A1814', 0.8], env: 0.6 });
  { const lake = new THREE.Mesh(new THREE.PlaneGeometry(200, 100), new THREE.MeshStandardMaterial({ color: lin('#3A4A5A'), roughness: 0.1, metalness: 0.4 })); lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.03, -52); t7.g.add(lake); }
  const roy7 = character(royBurnt, t7, t => { const hit = t > w('l08', 'çarptı') - 0.05, after = t > w('l08', 'yedisinden') - 0.3; return { pos: [0.4, 0, 0], rot: after ? 0.2 : Math.PI - 0.3, pose: after ? POSE.stand() : hit ? { ...POSE.fallBack(), spine: [-0.2, 0, 0] } : { ...POSE.stand(), rShoulder: [-1.2, 0, 0.2], rElbow: [-0.4, 0, 0] }, face: after ? { ...FACE.smile, browTilt: 0.5 } : hit ? FACE.pain : FACE.neutral }; });
  const rod = cyl(0.008, 0.012, 2.4, '#6A5A3A', 0, 0, 0, roy7.hand('r')); rod.position.set(0, -0.2, 1.0); rod.rotation.x = 1.2;
  const bolt7 = bolt(t7.g, [-1, 30, -10], [0.4, 1.8, 0], 70, 0.12);
  const sun7 = new THREE.DirectionalLight(lin('#DDE6FF'), 0); sun7.position.set(0, 20, 5); t7.g.add(sun7);

  // ═══ 8 · kalabalık: 15.300 kişi ═══
  const t8 = tableau('kalabalik', { x: X(8), floor: '#5A574E', floorR: 140, floorMat: std('#5A574E', { roughness: 0.9, emissive: lin('#1E1C18') }), spots: [{ x: 0, h: 60, z: 20, tx: 0, I: 900, angle: 0.9, color: '#E8E6F0', shadow: false }], fog: ['#22242A', 0.004], bg: '#22242A', hemi: ['#8A8C9A', '#1A1A1A', 1.0] });
  const N8 = 124; { const sun = new THREE.DirectionalLight(lin('#E8E6F0'), 2.2); sun.position.set(30, 80, 40); sun.target.position.set(0, 0, 0); t8.g.add(sun, sun.target); }
  { const geo = new THREE.CapsuleGeometry(0.2, 1.2, 2, 6).translate(0, 0.8, 0); const im = new THREE.InstancedMesh(geo, std('#B8B4AA', { roughness: 0.9 }), N8 * N8); const r = mulberry32(88), c = new THREE.Color(); let k = 0;
    for (let i = 0; i < N8; i++) for (let j = 0; j < N8; j++) { const x = (i - N8 / 2 + 0.5) * 1.1, z = (j - N8 / 2 + 0.5) * 1.1; if (Math.abs(x) < 0.7 && Math.abs(z) < 0.7) { _m.makeScale(0, 0, 0); } else { const s = 0.85 + r() * 0.3; _m.makeScale(s, s, s); _m.setPosition(x + (r() - 0.5) * 0.3, 0, z + (r() - 0.5) * 0.3); } im.setMatrixAt(k, _m); c.set(['#8A867C', '#6A6E7A', '#9A8A78', '#5A5E58', '#A89A8A'][Math.floor(r() * 5)]); im.setColorAt(k, c); k++; }
    im.frustumCulled = false; t8.g.add(im); }
  const roy8 = character(royBurnt, t8, t => ({ pos: [0, 0, 0], rot: 0, pose: t > w('l10', "roy'a") + 0.5 ? { ...POSE.armsUp(), spine: [-0.1, 0, 0] } : { ...POSE.stand(), head: [-0.6, 0, 0] }, face: t > w('l10', "roy'a") + 0.5 ? FACE.shout : { ...FACE.neutral, lookY: 1 } }));
  const glow8 = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 0.6), transparent: true, opacity: 0, depthWrite: false, fog: false })); glow8.rotation.x = -Math.PI / 2; glow8.position.y = 0.03; t8.g.add(glow8);
  const lamp8 = new THREE.PointLight(lin('#FFD27A'), 0, 6, 1.5); lamp8.position.set(0, 3, 0.5); t8.g.add(lamp8);
  const strikes8 = [0, 1, 2, 3, 4, 5, 6].map(i => w('l10', "roy'a") + 0.5 + i * (hero(T) - w('l10', "roy'a") - 0.5) / 6.5);
  const bolts8 = strikes8.map((_, i) => bolt(t8.g, [(i - 3) * 2.5, 40, -8 + (i % 3) * 3], [0, 1.9, 0], 90 + i, 0.14));
  const oneT = w('l10', 'on') - 0.1;

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.25, 1.25, 1.35), P(0, 0, 1.05, 0), 40];
  const kA = w('l03', 'ağaçların'), kK = w('l03', 'köprücük');
  const cam = [
    [0, ...F0, null, 0.03],
    [T.l01end, P(0, 0.6, 2.2, 3.4), P(0, 0, 0.8, 0), 50],
    ...cut(T.l02 - 0.15, [P(0, 0.6, 2.2, 3.38), P(0, 0, 0.8, 0), 50], [P(1, -0.3, 1.25, 1.9), P(1, -1.0, 1.0, 0), 44]),
    [w('l02', 'uçak'), P(1, -0.55, 1.2, 1.45), P(1, -1.1, 1.05, 0), 40],
    [T.l02end + 0.2, P(1, -0.75, 1.15, 1.2), P(1, -1.15, 1.05, 0), 36, null, 0.03],
    ...cut(T.l03 - 0.15, [P(1, -0.75, 1.15, 1.19), P(1, -1.15, 1.05, 0), 36], [P(0, 3.0, 4.0, 5.5), P(0, 0, 0.6, 0), 50]),
    [kA - 0.16, P(0, 2.4, 3.2, 4.4), P(0, 0, 0.6, 0), 50],
    ...cut(kA - 0.15, [P(0, 2.4, 3.2, 4.38), P(0, 0, 0.6, 0), 50], [P(2, 2.8, 1.2, 5.2), P(2, 0, 3.2, 0), 52]),
    [land + 0.3, P(2, 2.6, 1.1, 4.6), P(2, 0, 0.8, 0), 48],
    ...cut(kK - 0.15, [P(2, 2.6, 1.1, 4.58), P(2, 0, 0.8, 0), 48], [P(2, 1.1, 0.95, 2.1), P(2, 0.7, 0.65, 0.4), 40]),
    [w('l03', 'annesi'), P(2, 1.0, 1.0, 2.2), P(2, 0.5, 0.65, 0.3), 42],
    [T.l03end + 0.3, P(2, 1.4, 1.2, 2.8), P(2, -0.3, 0.6, 0), 44],
    ...cut(T.l04 - 0.15, [P(2, 1.4, 1.2, 2.78), P(2, -0.3, 0.6, 0), 44], [P(3, 0.5, 1.5, -2.2), P(3, 0, 1.15, -6), 44]),
    [T.l04end + 0.5, P(3, 0.6, 1.4, 1.6), P(3, 0, 1.1, -1.5), 42],
    ...cut(T.l05 - 0.15, [P(3, 0.6, 1.4, 1.58), P(3, 0, 1.1, -1.5), 42], [P(4, 1.4, 1.4, 4.2), P(4, 0.3, 0.8, 0), 44]),
    [w('l05', 'uçaktaki'), P(4, 1.0, 1.6, 3.4), P(4, 0.1, 0.7, 0.2), 42],
    [T.l05end + 0.4, P(4, 0.4, 8, 6.5), P(4, -0.2, 0, 0.2), 50],
    ...cut(T.l06 - 0.15, [P(4, 0.4, 8, 6.48), P(4, -0.2, 0, 0.2), 50], [P(5, 0, 3, 16), P(5, -4, 9, -40), 50]),
    [T.l06end + 0.3, P(5, 0, 2.6, 13), P(5, -2, 7, -40), 54],
    ...cut(T.l07 - 0.15, [P(5, 0, 2.6, 12.98), P(5, -2, 7, -40), 54], [P(5, 2.6, 1.7, 6.5), P(5, 0, 2.6, -3), 46]),
    [hitT, P(5, 1.6, 1.4, 5.0), P(5, 0.1, 1.2, 0.5), 44],
    [w('l07', 'kaşları') - 0.11, P(5, 1.3, 1.0, 4.0), P(5, 0.2, 0.5, 1.2), 42],
    ...cut(w('l07', 'kaşları') - 0.1, [P(5, 1.3, 1.0, 3.98), P(5, 0.2, 0.5, 1.2), 42], [P(6, 0.25, 1.78, 1.1), P(6, 0, 1.68, 0), 36]),
    ...cut(w('l07', 'omzu') - 0.1, [P(6, 0.25, 1.78, 1.08), P(6, 0, 1.68, 0), 36], [P(6, -1.2, 1.6, 2.0), P(6, 0, 1.35, 0), 40]),
    ...cut(w('l07', 'saçı') - 0.1, [P(6, -1.2, 1.6, 1.98), P(6, 0, 1.35, 0), 40], [P(6, 0.4, 1.7, 2.4), P(6, 0, 1.45, 0), 42]),
    [T.l07end + 0.3, P(6, 0.3, 1.7, 2.7), P(6, 0, 1.45, 0), 42],
    ...cut(T.l08 - 0.15, [P(6, 0.3, 1.7, 2.68), P(6, 0, 1.45, 0), 42], [P(7, -2.2, 1.5, 4.6), P(7, 0.4, 1.3, -1), 46]),
    [w('l08', 'yedisinden') - 0.4, P(7, -1.6, 1.5, 3.8), P(7, 0.4, 1.3, -0.5), 44],
    ...cut(w('l08', 'yedisinden') - 0.3, [P(7, -1.6, 1.5, 3.78), P(7, 0.4, 1.3, -0.5), 44], [P(7, 0.6, 1.72, 1.5), P(7, 0.4, 1.66, 0), 36]),
    [T.l08end + 0.3, P(7, 0.6, 1.7, 1.3), P(7, 0.4, 1.66, 0), 34],
    ...cut(T.l09 - 0.15, [P(7, 0.6, 1.7, 1.28), P(7, 0.4, 1.66, 0), 34], [P(8, 0, 40, 14), P(8, 0, 0, 0), 46]),
    [T.l10, P(8, 0, 110, 30), P(8, 0, 0, 0), 46],
    [w('l10', "roy'a") - 0.1, P(8, 0, 120, 32), P(8, 0, 0, 0), 46],
    [hero(T), P(8, 1.2, 3.4, 6.5), P(8, 0, 1.6, 0), 46],
    [T.l11end + 0.6, P(8, 1.0, 3.0, 5.5), P(8, 0, 1.6, 0), 44],
    ...cut(T.loop0, [P(8, 1.0, 3.0, 5.48), P(8, 0, 1.6, 0), 44], [P(0, 0.5, 1.6, 2.3), P(0, 0, 1.0, 0), 44, null, 0.03]),
    [T.D, ...F0, null, 0.03],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l02', 'yuliane') - 0.1, w('l02', 'uçak') - 0.3, 'JULIANE KOEPCKE', '17 yaşında · Peru, 1971'], [w('l07', 'roy') - 0.1, w('l07', 'ilk') - 0.2, 'ROY SULLIVAN', 'park korucusu · Virginia']],
    numbers: [[w('l04', 'on') - 0.1, T.l05 - 0.3, '11 gün', 'DERENİN İÇİNDE'], [w('l05', 'uçaktaki') - 0.1, T.l06 - 0.3, '92 → 1', 'UÇAKTAKİLER → HAYATTA KALAN'], [w('l08', 'yedisinden') - 0.1, T.l09 - 0.3, '7', 'YILDIRIM, HEPSİNDEN SAĞ ÇIKTI'], [oneT, w('l10', "roy'a") - 0.2, '1 / 15.300', 'ÖMÜR BOYU İHTİMAL'], [w('l10', "roy'a") - 0.05, T.l11 + 0.3, '7 kez', 'ROY SULLIVAN']],
    update(t) {
      for (const u of updates) u(t);
      const f1 = flash(t, [w('l02', 'yıldırım')]); winL.intensity = 40 * f1; winM.color.setScalar(0.27 + 6 * f1);
      const big = [w('l06', 'tek')], seven = [0, 1, 2, 3, 4, 5, 6].map(i => w('l06', 'yedi') - 0.3 + i * 0.12), hit = [hitT];
      bolts5[0].visible = flash(t, big) > 0.5; bolts5.slice(1).forEach((b, i) => { b.visible = flash(t, [seven[i]]) > 0.5; }); hitR.visible = flash(t, hit) > 0.5;
      sun5.intensity = 6 * Math.max(flash(t, big), flash(t, seven), flash(t, hit));
      const burnOn = t > hitT; burn.visible = burnOn; burn.position.set(0.25, 0.012, 1.5); ember.position.set(0.25, 0.1, 1.5); ember.intensity = burnOn ? 0.35 * (1 - seg(t, hitT, 3)) : 0;
      fl6.intensity = 60 * flash(t, [w('l07', 'kaşları') - 0.05, w('l07', 'omzu') - 0.05, w('l07', 'saçı') - 0.05]);
      const f7 = flash(t, [w('l08', 'çarptı') - 0.05]); bolt7.visible = f7 > 0.5; sun7.intensity = 8 * f7;
      const g8 = seg(t, oneT, 0.5); glow8.material.opacity = 0.85 * g8; glow8.scale.setScalar(1.2 + 0.2 * Math.sin(t * 3)); lamp8.intensity = 6 * g8 + 40 * flash(t, strikes8);
      bolts8.forEach((b, i) => { b.visible = flash(t, [strikes8[i]]) > 0.5; });
    },
  };
}

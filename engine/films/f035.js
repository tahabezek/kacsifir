// № 035 · Dağı yaran adam ve yerin altındaki 33 kişi (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: keski (soğuk açılış) · patika · eşik · sırt · zaman (22 yıl) · sığınak · not · kapsül · küpler.
// Merkez anlar: kırılan testi ve eşikteki Manjhi (l02–l03); karanlıkta tayın bölen madenciler (l07).
// Doruk: kurtarma kuyusunun kayası 6,3 m'lik küp; Manjhi'nin yarığına bu küplerden 15'i dizilir.

export const opts = { bloom: 0.6 };
export function hero(T) { return T.l11end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  const strikes = []; for (let t = T.l05; t < T.l05end - 1; t += 0.45) strikes.push(t);
  return {
    tick: [0.4, 1.2, 2.0, 2.8, ...strikes],
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.l10 - 0.3, T.l10 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    thock: [w('l02', 'düştü') + 0.1, w('l07', 'çöktü'), w('l08', 'çıktı')],
    rumble: [[w('l07', 'çöktü') - 0.1, 0.5]],
    scratch: [[w('l08', 'tavandan') - 0.3, w('l08', 'çıktı'), 0.05], [T.l09, T.l09end, 0.03]],
    riser: [w('l11', 'Mancı'), hero(T)],
    impact: hero(T),
    silence: [T.l10end + 0.1, T.l11],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, lin, std, box, cyl, canvasTex, tableau, motes, character, poseTrack, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const updates = [];
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const rockTex = canvasTex(512, 512, (g, W, H) => { const r = mulberry32(9); g.fillStyle = '#7A6E62'; g.fillRect(0, 0, W, H); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '30,26,22' : '205,198,186'},${r() * 0.22})`; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) g.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 40); g.fill(); } });
  rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
  const rockM = new THREE.MeshStandardMaterial({ map: rockTex, roughness: 0.92 });
  const rockBlob = (g, x, y, z, s, seed) => { const geo = new THREE.IcosahedronGeometry(1, 2), p = geo.attributes.position, r = mulberry32(seed); for (let i = 0; i < p.count; i++) { const k = 0.8 + r() * 0.35; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.8, p.getZ(i) * k); } geo.computeVertexNormals(); const m = new THREE.Mesh(geo, rockM); m.scale.setScalar(s); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  const tools = f => { const wood = std('#6B4A2E'), iron = std('#3B3B3E', { metalness: 0.8, roughness: 0.4 }); const h = new THREE.Group(); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.4, 8), wood); hd.position.y = -0.2; h.add(hd); const hh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.07), iron); hh.position.y = -0.4; h.add(hh); h.position.set(0, -0.28 * f.u * 0 - 0.08, 0.04); f.hand('r').add(h);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.26, 8), iron); c.rotation.x = Math.PI / 2; c.position.set(0, -0.12, 0.12); f.hand('l').add(c); };
  const sparks = (g, x, y, z, t0s) => { const n = 80, r = mulberry32(5), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 2, r() * 1.5, (r() - 0.5) * 2, r()]); const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 5, 1.6) }), n); im.frustumCulled = false; g.add(im);
    updates.push(t => { let last = -9; for (const s of t0s(t)) if (s <= t) last = s; const u = t - last; d.forEach((p, i) => { const s = u < 0.35 ? 0.006 * (1 - u / 0.35) : 0; _m.makeScale(s, s, s); _m.setPosition(x + p[0] * u * 1.2, y + p[1] * u - 4 * u * u, z + p[2] * u * 1.2); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; }); };
  const hits = (t0, t1, per) => t => { const o = []; for (let s = t0; s <= Math.min(t, t1); s += per) o.push(s); return o; };

  // ═══ 0 · keski (gece) ═══
  const t0 = tableau('keski', { x: X(0), floorMat: rockM, spots: [{ x: 0.5, h: 3, z: 1.5, tx: 0, I: 25, angle: 0.6, color: '#FFD9A0' }], fog: ['#0A0806', 0.05], hemi: ['#3A3430', '#100C0A', 0.4] });
  box(4, 3, 1, rockM, 0, 1.5, -0.9, t0.g);
  const m0 = character('manjhi', t0, t => ({ pos: [0, 0, 0.15], rot: Math.PI, pose: POSE.hammer((t * 1.25) % 1), face: FACE.determined })); tools(m0);
  sparks(t0.g, 0, 0.7, -0.38, hits(0.4, 3.6, 0.8));

  // ═══ 1 · patika (alacakaranlık) ═══
  const t1 = tableau('patika', { x: X(1), floorMat: rockM, floorR: 20, spots: [{ x: -3, h: 6, z: 3, tx: 0, I: 120, angle: 0.7, color: '#FFC890' }], fog: ['#6A4A3A', 0.03], bg: '#8A6A54', hemi: ['#E8B890', '#4A3428', 0.9], env: 0.6 });
  for (let i = 0; i < 18; i++) { const r = mulberry32(i + 3); rockBlob(t1.g, (r() - 0.5) * 16, 0.2, -2 - r() * 8, 0.6 + r() * 2.5, i); }
  const falguni = character('falguni', t1, null);
  const pot = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.12, 0.01], [0.17, 0.08], [0.18, 0.16], [0.13, 0.25], [0.08, 0.28], [0.1, 0.31]].map(([x, y]) => new THREE.Vector2(x, y)), 20), std('#9C4F2C', { roughness: 0.85 }));
  pot.castShadow = true; t1.g.add(pot);
  const shards = []; for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.TetrahedronGeometry(0.06), std('#9C4F2C')); s.castShadow = true; t1.g.add(s); shards.push(s); }

  // ═══ 2 · eşik (gece, kandil) ═══
  const t2 = tableau('esik', { x: X(2), floor: '#3A2A1E', spots: [{ x: 0.6, h: 1.6, z: 0.6, tx: 0, I: 10, angle: 1.0, color: '#FFB060' }], fog: ['#0A0604', 0.06], hemi: ['#3A2A20', '#0A0604', 0.3] });
  box(3, 2.4, 0.2, '#8A6A4A', 0, 1.2, -0.7, t2.g); box(0.9, 1.8, 0.22, '#1A120C', 0, 0.9, -0.62, t2.g); box(1.1, 0.12, 0.5, '#6A4A30', 0, 0.06, -0.4, t2.g);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(12, 6, 1.5) })); lamp.position.set(0.55, 0.16, -0.2); t2.g.add(lamp);
  const m2 = character('manjhi', t2, () => ({ pos: [-0.05, 0.12, -0.35], rot: 0.15, pose: { ...POSE.sitHunched(), lElbow: [-1.6, 0, 0], rElbow: [-1.6, 0, 0] }, face: FACE.sad }));
  { const sh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.05), std('#9C4F2C')); m2.hand('r').add(sh); sh.position.set(0.02, -0.12, 0.05); }

  // ═══ 3 · sırt ve köylüler ═══
  const t3 = tableau('sirt', { x: X(3), floorMat: rockM, floorR: 20, spots: [{ x: 2, h: 8, z: 4, tx: 0, I: 140, angle: 0.6, color: '#FFF0D8' }], fog: ['#B8A890', 0.025], bg: '#C8B8A0', hemi: ['#E8E2D8', '#6A5A48', 1.0], env: 0.7 });
  box(10, 6, 3, rockM, 0, 3, -3.2, t3.g); for (let i = 0; i < 8; i++) rockBlob(t3.g, -5 + i * 1.4, 0.3, -1.6, 0.6 + (i % 3) * 0.3, i + 30);
  const m3 = character('manjhi', t3, () => ({ pos: [0, 0, -0.6], rot: Math.PI - 0.2, pose: { ...POSE.stand(), rShoulder: [-0.4, 0, 0.2], rElbow: [-1.2, 0, 0] }, face: FACE.determined })); tools(m3);
  const vil = (x, seed, top) => character({ ...CARDS.manjhi, mustache: seed % 2 ? '#151515' : null, top, skin: ['#6A452E', '#7A5034', '#5A3A26'][seed % 3] }, t3, t => ({ pos: [x, 0, 2.4], rot: x > 0 ? -2.6 : 2.6, pose: { ...POSE.stand(), rShoulder: [-1.4 + 0.2 * Math.sin(t * 8 + seed), 0, 0.3], rElbow: [-0.8, 0, 0], spine: [-0.1, 0.1 * Math.sin(t * 6 + seed), 0] }, face: FACE.grin }));
  vil(-1.6, 1, '#C9B88A'); vil(1.8, 2, '#8AA0B8'); vil(2.8, 3, '#B86A4A');

  // ═══ 4 · zaman (22 yıl): yarık açılır, saç ağarır ═══
  const t4 = tableau('zaman', { x: X(4), floorMat: rockM, floorR: 24, spots: [{ x: 3, h: 9, z: 5, tx: 0, I: 150, angle: 0.6, color: '#FFE8C8' }], fog: ['#6A5A4A', 0.025], bg: '#8A7A64', hemi: ['#E8E2D8', '#5A4A38', 0.9], env: 0.6 });
  box(3, 6.5, 15, rockM, -3.6, 3.25, -7.5, t4.g); box(3, 6.5, 15, rockM, 3.6, 3.25, -7.5, t4.g);    // yarığın iki duvarı
  const fill = box(4.2, 6.5, 14, rockM, 0, 3.25, -7.2, t4.g);                                   // henüz kırılmamış kaya: ön yüzü geriye çekilir
  const front = p => -0.2 - 12.5 * p;
  const prog = t => ease.state(seg(t, T.l05, w('l05', 'Sonunda') - T.l05));
  const mY = character('manjhi', t4, null), mO = character('manjhiOld', t4, null); tools(mY); tools(mO);
  const sun = t4.lights[0];
  sparks(t4.g, 0, 0.7, 0, t => { const o = []; for (let s = T.l05; s <= Math.min(t, w('l05', 'Sonunda')); s += 0.45) o.push(s); return o; });

  // ═══ 5 · sığınak (700 m altı) ═══
  const t5 = tableau('siginak', { x: X(5), floorMat: rockM, spots: [{ x: 0, h: 3.2, z: 0, tx: 0, I: 6, angle: 1.1, color: '#FFE9B0', shadow: false }], fog: ['#0A0806', 0.08], hemi: ['#2A2420', '#0A0806', 0.25] });
  box(8, 3.5, 0.5, rockM, 0, 1.75, -2.5, t5.g); box(8, 0.5, 6, rockM, 0, 3.4, 0, t5.g);
  const minerCards = ['#3C4A3A', '#4A4A3C', '#3A3E48', '#4A3E36', '#3C4A3A', '#46483E', '#3A4038', '#44403A'].map((c, i) => ({ ...CARDS.miner, top: c, bottom: c, skin: ['#B88A66', '#A8785A', '#C99A72', '#8A5A3A'][i % 4], hatColor: i % 3 ? '#F28C1E' : '#E8E2D2', mustache: i % 2 ? '#1A1612' : null }));
  const seat = [[-2.4, -1.6], [-1.5, -1.9], [-0.6, -1.7], [1.2, -1.8], [2.1, -1.6], [2.9, -1.2], [-3.1, -1.0], [1.6, -0.8]];
  seat.forEach(([x, z], i) => character(minerCards[i], t5, t => ({ pos: [x, 0, z], rot: Math.atan2(-x, 1.5 - z) * 0.6, pose: POSE.sitHunched(), face: { ...FACE.sad, look: (i % 3 - 1) * 0.5 } })));
  const urzua = character('urzua', t5, t => ({ pos: [0.4, 0, -0.4], rot: 0, pose: POSE.holdOut(), face: FACE.determined }));
  { const can = cyl(0.05, 0.05, 0.05, std('#C9C2B4', { metalness: 0.8, roughness: 0.3 }), 0, 0, 0, urzua.hand('r')); can.position.set(0.05, -0.15, 0.08); }
  const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(12, 10, 6) }), lamps = [];
  { const r = mulberry32(33); for (let i = 0; i < 25; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), lampM); l.position.set(-3.6 + r() * 7.2, 0.9 + r() * 0.5, -2.0 - r() * 0.3); t5.g.add(l); lamps.push(l); } }
  motes(t5, 140, [2.2, 2.0, 1.6], 3, 3);

  // ═══ 6 · not (matkap tavanı deler) ═══
  const t6 = tableau('not', { x: X(6), floorMat: rockM, spots: [{ x: 0, h: 3.0, z: 1.2, tx: 0, I: 12, angle: 0.8, color: '#FFE9B0' }], fog: ['#0A0806', 0.06], hemi: ['#2A2420', '#0A0806', 0.3] });
  box(8, 0.5, 6, rockM, 0, 3.4, 0, t6.g); box(8, 3.5, 0.5, rockM, 0, 1.75, -2.5, t6.g);
  const rod = cyl(0.06, 0.06, 1, std('#9AA0A8', { metalness: 0.8, roughness: 0.3 }), 0, 0, 0, t6.g); rod.geometry.translate(0, 0.5, 0);
  const bit = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 12).rotateX(Math.PI), std('#6B6058', { metalness: 0.8 })); t6.g.add(bit);
  const noteTex = canvasTex(512, 320, (g, W, H) => { g.fillStyle = '#F4EFE2'; g.fillRect(0, 0, W, H); g.fillStyle = '#C8141C'; g.font = '800 54px Archivo'; g.textAlign = 'center'; ['ESTAMOS BIEN', 'EN EL REFUGIO', 'LOS 33'].forEach((s, i) => g.fillText(s, W / 2, 90 + i * 80)); });
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.2), new THREE.MeshStandardMaterial({ map: noteTex, side: THREE.DoubleSide, roughness: 0.8 })); t6.g.add(note);
  const reach = [[-0.6, 0.6, 0], [0.7, 0.5, 1], [0.1, 1.1, 2]].map(([x, z, i]) => character(minerCards[i + 2], t6, t => ({ pos: [x, 0, z], rot: Math.PI - x * 0.4, pose: mixPose(POSE.stand(), POSE.armsUp(), seg(t, w('l08', 'çıktı') - 0.2, 0.6)), face: t > w('l08', 'çıktı') ? FACE.grin : FACE.surprise })));

  // ═══ 7 · kapsül (yüzey, gece) ═══
  const t7 = tableau('kapsul', { x: X(7), floor: '#8A6A48', floorR: 20, spots: [{ x: 3, h: 9, z: 5, tx: 0, I: 150, angle: 0.5, color: '#F2F4FF' }], fog: ['#0A0C12', 0.03], hemi: ['#3A4458', '#2A2018', 0.5] });
  { const red = std('#B8322A', { metalness: 0.4 }); for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) box(0.15, 7, 0.15, red, x, 3.5, z, t7.g); const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 32), std('#C9C2B4', { metalness: 0.6 })); wheel.position.set(0, 7.3, 0); t7.g.add(wheel); }
  const capTex = canvasTex(512, 256, (g, W, H) => { g.fillStyle = '#F2F2EE'; g.fillRect(0, 0, W, H); g.fillStyle = '#C8102E'; g.fillRect(0, H * 0.55, W, H * 0.12); g.fillStyle = '#0033A0'; g.fillRect(0, H * 0.67, W, H * 0.12); g.fillStyle = '#1A1A1A'; g.font = '800 46px Archivo'; g.textAlign = 'center'; g.fillText('FÉNIX 2', W * 0.25, H * 0.4); g.fillText('FÉNIX 2', W * 0.75, H * 0.4); });
  const capsule = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 2.6, 24), new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.4, metalness: 0.3 })); capsule.castShadow = true; t7.g.add(capsule);
  const avalos = character({ ...CARDS.miner, top: '#3C6A3A', bottom: '#3C6A3A', hat: 'helmet', hatColor: '#F2F2EE', goggles: '#141414' }, t7, null);
  const son = character({ height: 1.15, headScale: 1.55, skin: '#B88A66', hair: '#1A1612', hairStyle: 'short', top: '#2A5A8A', bottom: '#2A2E36', shoes: '#1A1A1A' }, t7, null);

  // ═══ 8 · küpler (yarık) ═══
  const t8 = tableau('kupler', { x: X(8), floorMat: rockM, floorR: 40, spots: [{ x: 6, h: 30, z: 20, tx: 0, tz: -15, I: 900, angle: 0.5, color: '#FFE8C8' }], fog: ['#8A7A64', 0.012], bg: '#A89880', hemi: ['#E8E2D8', '#5A4A38', 1.0], env: 0.6 });
  box(4, 9, 70, rockM, -6.6, 4.5, -30, t8.g); box(4, 9, 70, rockM, 6.6, 4.5, -30, t8.g);
  const cubeTex = canvasTex(256, 256, (g, W, H) => { g.drawImage(rockTex.image, 0, 0, W, H); g.strokeStyle = 'rgba(255,230,190,0.9)'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); });
  const cubeM = new THREE.MeshStandardMaterial({ map: cubeTex, roughness: 0.85, emissive: lin('#2A1E12') });
  const cubes = Array.from({ length: 15 }, (_, k) => { const m = new THREE.Mesh(new THREE.BoxGeometry(6.3, 6.3, 6.3), cubeM); m.castShadow = m.receiveShadow = true; t8.g.add(m); return m; });
  const cubeT = k => w('l11', 'en') - 0.2 + (hero(T) - w('l11', 'en') + 0.2) * Math.pow(k / 14, 0.85);
  const mOld8 = character('manjhiOld', t8, () => ({ pos: [0, 0, 4.5], rot: Math.PI, pose: POSE.stand(), face: FACE.neutral, scale: 1 }));

  // ——— hareketler ———
  const set = (f, fn) => { f.act = fn; };
  set(falguni, t => { const walk = seg(t, T.l02, w('l02', 'düştü') - T.l02), fall = seg(t, w('l02', 'düştü') - 0.1, 0.5); return { pos: [lerp(-3, 0.2, walk), 0, 0.3], rot: Math.PI / 2, rotX: -1.3 * ease.enter(fall), pose: fall > 0 ? POSE.fallBack() : POSE.walk((t * 0.7) % 1, 0.6), face: fall > 0 ? FACE.fear : FACE.neutral, scale: 1 }; });
  set(mY, t => { const p = prog(t); return { visible: p < 0.5, pos: [0, 0, front(p) + 0.55], rot: Math.PI, pose: POSE.hammer((t * 2.2) % 1), face: FACE.determined }; });
  set(mO, t => { const p = prog(t), done = t > w('l05', 'Sonunda'); return { visible: p >= 0.5, pos: [0, 0, done ? -2 : front(p) + 0.55], rot: done ? 0 : Math.PI, pose: done ? POSE.stand() : POSE.hammer((t * 2.2) % 1), face: done ? FACE.neutral : FACE.determined }; });
  set(avalos, t => { const out = seg(t, w('l09', 'kapsül') + 0.4, 0.8); return { visible: out > 0, pos: [lerp(0, 0.7, out), 0, lerp(0, 0.6, out)], rot: 0.3, pose: out >= 1 ? POSE.hug() : POSE.walk((t * 0.8) % 1, 0.5), face: FACE.grin }; });
  set(son, t => ({ pos: [1.3, 0, 1.2], rot: -2.2, pose: t > w('l09', 'yukarı') ? POSE.hug() : POSE.stand(), face: FACE.grin }));

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 1.35, 1.15, 0.35), P(0, 0, 0.85, -0.25), 40];          // yandan: yüz, keski ve kaya
  const cam = [
    [0, ...F0, null, 0.02],
    [0.6, P(0, 1.18, 1.13, 0.32), P(0, 0, 0.85, -0.25), 40, null, 0.02],
    [T.l01end, P(0, 1.0, 1.1, 0.5), P(0, 0, 0.85, -0.3), 38, null, 0.02],
    ...cut(T.l02 - 0.15, [P(0, 1.0, 1.1, 0.49), P(0, 0, 0.85, -0.3), 38], [P(1, -1.6, 1.6, 5.6), P(1, -2.6, 1.2, 0.3), 42]),
    [w('l02', 'Dashrath'), P(1, 0.0, 1.6, 5.0), P(1, -0.8, 1.1, 0.3), 42],
    [w('l02', 'düştü') + 0.6, P(1, 1.4, 1.3, 3.6), P(1, 0.5, 0.4, 0.3), 42],
    ...cut(T.l03 - 0.15, [P(1, 1.4, 1.3, 3.58), P(1, 0.5, 0.4, 0.3), 42], [P(2, 0.9, 1.2, 2.6), P(2, -0.05, 0.85, -0.35), 40]),
    [T.l03end + 0.4, P(2, 0.45, 1.05, 1.5), P(2, -0.05, 0.9, -0.35), 36, null, 0.02],
    ...cut(T.l04 - 0.15, [P(2, 0.44, 1.05, 1.48), P(2, -0.05, 0.9, -0.35), 36], [P(3, 1.5, 1.6, 5.4), P(3, 0, 1.4, -0.6), 42]),
    [w('l04', 'Köylüler'), P(3, 0.6, 1.5, 6.4), P(3, 1.2, 1.2, 1.5), 44],
    ...cut(T.l05 - 0.15, [P(3, 0.6, 1.5, 6.38), P(3, 1.2, 1.2, 1.5), 44], [P(4, 2.2, 1.8, 4.2), P(4, 0, 1.1, 0), 42]),
    [w('l05', 'Saçları'), P(4, 2.0, 2.2, 1.0), P(4, 0, 1.2, -3), 44],
    [w('l05', 'Sonunda'), P(4, 1.2, 2.6, 6.0), P(4, 0, 1.6, -8), 46],
    [T.l05end + 0.4, P(4, 0.8, 2.0, 2.4), P(4, 0, 1.4, -6), 46],
    ...cut(T.l07 - 0.15, [P(4, 0.8, 2.0, 2.38), P(4, 0, 1.4, -6), 46], [P(5, 0, 1.5, 4.2), P(5, 0, 1.0, -1), 44]),
    [w('l07', 16) - 0.1, P(5, 0.6, 1.3, 2.4), P(5, 0.3, 1.2, -0.6), 40],
    [T.l07end + 0.3, P(5, 0.5, 1.4, 1.8), P(5, 0.35, 1.45, -0.4), 36, null, 0.02],
    ...cut(T.l08 - 0.15, [P(5, 0.5, 1.4, 1.78), P(5, 0.35, 1.45, -0.4), 36], [P(6, 0, 1.2, 3.2), P(6, 0, 2.2, 0), 44]),
    [w('l08', 'Ucuna'), P(6, 0.1, 1.6, 1.4), P(6, 0, 1.75, 0), 38],
    [T.l08end + 0.3, P(6, 0.05, 1.75, 0.9), P(6, 0, 1.75, 0), 34, null, 0.01],
    ...cut(T.l09 - 0.15, [P(6, 0.05, 1.75, 0.88), P(6, 0, 1.75, 0), 34], [P(7, 2.4, 1.8, 6.0), P(7, 0, 1.6, 0), 42]),
    [T.l09end + 0.3, P(7, 1.8, 1.6, 4.4), P(7, 0.6, 1.2, 0.6), 40],
    ...cut(T.l10 - 0.15, [P(7, 1.8, 1.6, 4.38), P(7, 0.6, 1.2, 0.6), 40], [P(8, 0, 6, 26), P(8, 0, 3, -12), 46]),
    [T.l11, P(8, 0, 6.5, 24), P(8, 0, 3, -14), 46],
    [hero(T) + 0.3, P(8, 0, 14, 20), P(8, 0, 2, -22), 50],
    [T.l12end + 0.6, P(8, 0, 16, 22), P(8, 0, 2, -24), 50],
    ...cut(T.loop0, [P(8, 0, 16.1, 22.1), P(8, 0, 2, -24), 50], [P(0, 1.1, 1.18, 1.95), P(0, 0, 0.75, -0.2), 38, null, 0.02]),
    [T.D - 0.6, P(0, 1.0, 1.14, 1.78), P(0, 0, 0.75, -0.2), 38, null, 0.02],
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);
  const cubesLanded = t => { let c = 0; for (let k = 0; k < 15; k++) if (t >= cubeT(k)) c = k + 1; return c; };

  return {
    cam, cuts,
    names: [[w('l02', 'Dashrath') - 0.1, T.l03 - 0.2, 'DASHRATH MANJHI', 'Gehlaur, Hindistan · 1960'], [T.l07 + 0.5, w('l07', 16) - 0.2, '33 MADENCİ', 'San José madeni, Şili · 2010']],
    numbers: [[w('l05', 'yüz') - 0.1, T.l07 - 0.3, '110 m', '22 YIL · ÇEKİÇ VE KESKİ'], [w('l11', 'iki') - 0.1, w('l11', 'Mancı') - 0.3, '250 m³', 'KUYUNUN KAYASI'], [w('l11', 'en') - 0.15, T.l12 + 0.3, t => cubesLanded(t) + '×', 'EN AZ · MANJHI\'NİN YARIĞI']],
    overlay(t, ctx) {
      // madencilerin notu: kâğıt, kırmızı kalem (gerçek nottaki İspanyolca söz)
      const t0 = w('l08', 'Sığınaktayız') - 0.2, t1 = T.l09 - 0.2, inU = ease.enter(seg(t, t0, 0.35)), out = ease.exit(seg(t, t1, 0.25)); if (inU <= 0 || out >= 1) return;
      ctx.save(); ctx.translate(505, 600 + (1 - inU) * 100 - out * 120); ctx.rotate(-0.05); ctx.globalAlpha = 1 - out;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-310, -130, 640, 280); ctx.fillStyle = '#F4EFE2'; ctx.fillRect(-320, -140, 640, 280);
      ctx.fillStyle = '#C8141C'; ctx.textAlign = 'center'; ctx.font = '800 50px Archivo'; ['ESTAMOS BIEN', 'EN EL REFUGIO', 'LOS 33'].forEach((s, i) => ctx.fillText(s, 0, -50 + i * 66)); ctx.restore();
    },
    update(t) {
      for (const u of updates) u(t);
      // testi: başta, düşüşte uçar ve kırılır
      const fT = w('l02', 'düştü') - 0.1, u = t - fT;
      if (u < 0) { pot.visible = true; const f = falguni.root.position; pot.position.set(f.x, 1.62, f.z); pot.rotation.set(0, 0, 0); shards.forEach(s => (s.visible = false)); }
      else if (u < 0.45) { pot.visible = true; const f = falguni.root.position; pot.position.set(f.x + 0.6 * u, 1.62 + 1.2 * u - 9 * u * u, f.z + 0.3 * u); pot.rotation.set(u * 6, 0, u * 4); shards.forEach(s => (s.visible = false)); }
      else { pot.visible = false; const p0 = falguni.root.position; shards.forEach((s, i) => { const r = mulberry32(i + 1), a = r() * 6.28, d = 0.2 + r() * 0.5 * Math.min(1, (u - 0.45) * 4); s.visible = true; s.position.set(p0.x + 0.27 + Math.cos(a) * d, 0.04, p0.z + 0.135 + Math.sin(a) * d); s.rotation.set(r() * 3, r() * 3, r() * 3); }); }
      // yarık: dolu kaya geri çekilir; güneş gün-gece döner
      const p = prog(t), zf = front(p), len = Math.max(0.05, 14 - 12.5 * p); fill.scale.z = len / 14; fill.position.z = zf - len / 2;
      const th = 0.6 + p * Math.PI * 2 * 4, day = Math.max(0.08, Math.sin(th)); sun.intensity = 2.5 * 150 * (p > 0 && p < 1 ? day : 1); sun.position.set(6 * Math.cos(th), 9, 5);
      // matkap ve not
      const dr = ease.state(seg(t, w('l08', 'tavandan') - 0.4, w('l08', 'çıktı') - w('l08', 'tavandan') + 0.4)), up = ease.state(seg(t, w('l08', 'Sığınaktayız') + 0.5, 1.5));
      const tip = 3.15 - 1.1 * dr + 1.6 * up; rod.position.set(0, tip, 0); rod.scale.y = Math.max(0.01, 4 - tip); bit.position.set(0, tip - 0.12, 0); note.position.set(0.18, tip + 0.1, 0.02); note.visible = t > w('l08', 'Ucuna'); note.rotation.y = 0.3 * Math.sin(t * 2);
      // kapsül yükselir
      capsule.position.set(0, -2 + 3.3 * ease.state(seg(t, T.l09, w('l09', 'kapsül') + 0.3 - T.l09)), 0);
      // küpler: yarığa tek tek düşer
      cubes.forEach((m, k) => { const tl0 = cubeT(k), uu = clamp01((t - (tl0 - 0.6)) / 0.6); m.visible = t >= tl0 - 0.6 && t < T.loop0; m.position.set(0, 3.15 + 30 * (1 - uu) * (1 - uu), -4 - k * 6.8); });
      lamps.forEach((l, i) => l.scale.setScalar(0.85 + 0.15 * Math.sin(t * 9 + i)));
    },
  };
}

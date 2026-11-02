// № 060 · Buzun altındaki doktor ve hücredeki mahkûm (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: buzun altı · vadi · dere · hastane · hücre · kent (minyatür) · kurtarma · termometre.
// Merkez anlar: arkadaşları kayakları tutarken Anna'nın buz altındaki 40 dakikası (l04) ve hücreye dolan yakıcı hava (l08).
// Doruk: iki kahramanın arasındaki dev termometre önce 13,7'ye iner (kırağı), sonra 400'e tırmanıp "yüz"de patlar.

export const opts = { bloom: 0.6 };
export function hero(T) { return T.w('l10', 'yüz') + 0.02; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l05 - 0.3, T.l05 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    thock: [w('l03', 'kırıldı') - 0.05, w('l05', 'attı')],
    rumble: [[w('l07', 'patladı'), 0.5], [w('l07', 'bulut'), 0.35]],
    scratch: [[w('l10', 'Hücrenin'), hero(T), 0.03]],
    tick: [w('l05', 'durmuştu')],
    riser: [w('l10', 'Hücrenin'), hero(T)],
    impact: hero(T),
    silence: [T.l09end + 0.1, T.l10],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, lin, std, box, cyl, canvasTex, tableau, motes, character, poseTrack, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const updates = [];
  const _m = new THREE.Matrix4();
  const snowM = std('#E6ECF2', { roughness: 0.85 }), iceM = new THREE.MeshPhysicalMaterial({ color: lin('#9CC4DC'), roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.85 });
  const pines = (g, n, R0, R1, seed) => { const r = mulberry32(seed), cone = new THREE.ConeGeometry(1, 1, 7), m = std('#1E3226', { roughness: 0.9 }), im = new THREE.InstancedMesh(cone, m, n); for (let i = 0; i < n; i++) { const a = r() * 6.28, d = R0 + r() * (R1 - R0), h = 4 + r() * 5; _m.makeScale(h * 0.28, h, h * 0.28); _m.setPosition(Math.cos(a) * d, h / 2, Math.sin(a) * d - 4); im.setMatrixAt(i, _m); } g.add(im); };
  const skis = f => { const sm = std('#3A4250', { roughness: 0.35 }); for (const s of ['l', 'r']) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 1.7), sm); k.position.set(0, -0.2 * f.u, 0.25); f.J[s + 'Ankle'].add(k); } };

  // ═══ 0 · buzun altı ═══
  const t0 = tableau('buzalti', { x: X(0), floor: '#0A1A1E', spots: [{ x: 0, h: 9, z: 0, tx: 0.3, tz: 0, I: 50, angle: 0.25, color: '#CDEBF5' }], fog: ['#0A2630', 0.16], hemi: ['#3E7F90', '#05090C', 0.8] });
  box(14, 0.5, 6, iceM, -7.6, 3.25, 0, t0.g); box(14, 0.5, 6, iceM, 7.6, 3.25, 0, t0.g); box(1.2, 0.5, 2.4, iceM, 0, 3.25, -1.8, t0.g); box(1.2, 0.5, 2.4, iceM, 0, 3.25, 1.8, t0.g);   // ortası delik
  const pocket = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: lin('#FFFFFF'), metalness: 1, roughness: 0.04, envMapIntensity: 3, emissive: lin('#4A7686') }));
  pocket.scale.set(1.4, 0.35, 1.1); pocket.position.set(0.7, 3.0, 0.1); t0.g.add(pocket);
  const anna0 = character('anna', t0, null);
  const bub = (() => { const n = 90, r = mulberry32(3), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 2, r() * 3, (r() - 0.5) * 2, 0.3 + r() * 0.4, 0.008 + r() * 0.016]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshPhysicalMaterial({ color: lin('#DDF2FF'), metalness: 0.9, roughness: 0.05 }), n); im.frustumCulled = false; t0.g.add(im);
    updates.push(t => { d.forEach((p, i) => { const y = ((p[1] + p[3] * t) % 3); _m.makeScale(p[4], p[4], p[4]); _m.setPosition(p[0] + 0.5, y, p[2]); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; }); })();

  // ═══ 1 · vadi ═══
  const t1 = tableau('vadi', { x: X(1), floorMat: snowM, floorR: 40, spots: [{ x: -6, h: 6, z: 4, tx: 0, I: 120, angle: 0.8, color: '#FFD9B0' }], fog: ['#6E7E92', 0.03], bg: '#5E7088', hemi: ['#B4C6DA', '#6E7E90', 0.9], env: 0.7 });
  pines(t1.g, 120, 9, 30, 11);
  const anna1 = character('anna', t1, null); skis(anna1);
  const fr1 = character({ ...CARDS.anna, top: '#2A5A8A', hair: '#6A4A2A', hatColor: '#E8B41A', hairStyle: 'short' }, t1, null); skis(fr1);
  const fr2 = character({ ...CARDS.lawyer, top: '#3A6A3A', glasses: null, hat: 'beanie', hatColor: '#C8323A' }, t1, null); skis(fr2);
  motes(t1, 120, [2.2, 2.3, 2.5], 4, 4);

  // ═══ 2 · dere (düşüş ve kayaklar) ═══
  const t2 = tableau('dere', { x: X(2), floorMat: snowM, floorR: 30, spots: [{ x: -3, h: 7, z: 4, tx: 0, I: 110, angle: 0.7, color: '#FFE2C4' }], fog: ['#6E7E92', 0.035], bg: '#5E7088', hemi: ['#B4C6DA', '#6E7E90', 0.9], env: 0.7 });
  pines(t2.g, 80, 8, 25, 12);
  { const ice = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), iceM); ice.rotation.x = -Math.PI / 2; ice.position.set(0, 0.01, 0); t2.g.add(ice); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), std('#06121A', { roughness: 0.2 })); hole.rotation.x = -Math.PI / 2; hole.position.set(0, 0.02, 0); t2.g.add(hole); }
  const skiL = box(0.08, 0.02, 1.7, '#3A4250', 0, 0, 0, t2.g), skiR = box(0.08, 0.02, 1.7, '#3A4250', 0, 0, 0, t2.g);
  const anna2 = character('anna', t2, null); skis(anna2);
  const fr1b = character({ ...CARDS.anna, top: '#2A5A8A', hair: '#6A4A2A', hatColor: '#E8B41A', hairStyle: 'short' }, t2, null);
  const fr2b = character({ ...CARDS.lawyer, top: '#3A6A3A', glasses: null, hat: 'beanie', hatColor: '#C8323A' }, t2, null);

  // ═══ 3 · hastane ═══
  const t3 = tableau('hastane', { x: X(3), floor: '#5A6066', floorRough: 0.3, spots: [{ h: 4, z: 1.5, I: 22, angle: 0.7, color: '#E8F4FF' }], fog: ['#0C1014', 0.04], hemi: ['#8AA0B0', '#2A2E32', 0.6] });
  box(2.1, 0.7, 0.95, '#C9CCCF', 0, 0.35, 0, t3.g); box(2.0, 0.12, 0.9, '#F2F2EE', 0, 0.76, 0, t3.g);
  const ecgC = document.createElement('canvas'); ecgC.width = 512; ecgC.height = 256; const ecgG = ecgC.getContext('2d'), ecgTex = new THREE.CanvasTexture(ecgC); ecgTex.colorSpace = THREE.SRGBColorSpace;
  { const mon = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: ecgTex, color: new THREE.Color(2, 2, 2) })); mon.position.set(1.3, 1.6, -0.6); mon.rotation.y = -0.5; t3.g.add(mon); box(0.86, 0.46, 0.06, '#1A1C20', 1.3, 1.6, -0.64, t3.g).rotation.y = -0.5; }
  box(0.6, 1.1, 0.5, '#B8BEC6', -1.5, 0.55, -0.5, t3.g); cyl(0.02, 0.02, 1.6, '#C8141C', -0.8, 0.9, -0.3, t3.g).rotation.z = 1.2;
  const anna3 = character('anna', t3, () => ({ pos: [-0.9, 0.82, 0.05], rot: 0, rotZ: -Math.PI / 2, pose: POSE.stand(), face: T && FACE.closed }));
  const doc1 = character({ ...CARDS.lawyer, top: '#4A8A6A', bottom: '#4A8A6A', glasses: null, hat: 'cap', hatColor: '#4A8A6A' }, t3, () => ({ pos: [0.3, 0, -0.85], rot: 0, pose: POSE.holdOut(), face: FACE.determined }));
  const doc2 = character({ ...CARDS.deborah, top: '#4A8A6A', dress: null, bottom: '#4A8A6A', hairStyle: 'bun' }, t3, () => ({ pos: [-0.4, 0, 0.9], rot: Math.PI, pose: POSE.holdOut(), face: FACE.determined }));
  function drawECG(t) {
    const g = ecgG; g.fillStyle = '#05080A'; g.fillRect(0, 0, 512, 256);
    const live = t >= w('l05', 'yeniden') + 0.2, col = live ? '#7CFFB2' : '#FF5A4A'; g.strokeStyle = col; g.lineWidth = 6; g.beginPath();
    for (let x = 0; x <= 512; x += 4) { const tt = t - 2 + x / 256; let y = 128; if (live && tt > w('l05', 'yeniden')) { const p = ((tt % 0.9) + 0.9) % 0.9; y -= p < 0.05 ? 90 * p / 0.05 : p < 0.1 ? 90 - 150 * (p - 0.05) / 0.05 : 0; } x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); g.fillStyle = col; g.font = '700 40px Archivo'; g.fillText(live ? '72' : '0', 430, 50); ecgTex.needsUpdate = true;
  }

  // ═══ 4 · hücre ═══
  const stoneTex = canvasTex(512, 512, (g, W, H) => { const r = mulberry32(6); g.fillStyle = '#3A342E'; g.fillRect(0, 0, W, H); for (let y = 0, row = 0; y < H; row++) { const bh = 40 + r() * 20; for (let x = -(row % 2) * 30; x < W;) { const bw = 60 + r() * 50, v = 110 + r() * 50; g.fillStyle = `rgb(${v},${v * 0.92},${v * 0.8})`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6); x += bw; } y += bh; } });
  stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping; stoneTex.repeat.set(2, 1);
  const stoneM = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.92 });
  const t4 = tableau('hucre', { x: X(4), floorMat: stoneM, floorR: 6, spots: [{ x: 0.6, h: 2.2, z: 2.8, tx: -0.4, tz: -0.4, I: 18, angle: 0.25, color: '#FFF2DC' }], fog: ['#120E0C', 0.08], hemi: ['#3A3430', '#100C0A', 0.4] });
  box(4, 3, 0.4, stoneM, 0, 1.5, -1.2, t4.g); box(0.4, 3, 4, stoneM, -2, 1.5, 0.6, t4.g); box(0.4, 3, 4, stoneM, 2, 1.5, 0.6, t4.g);
  const cellSpot = t4.lights[0];
  const ludger4 = character('ludger', t4, () => ({ pos: [-0.6, 0.02, -0.75], rot: 0.3, pose: POSE.sitHunched(), face: FACE.sad }));
  const embers = (() => { const n = 200, r = mulberry32(41), d = []; for (let i = 0; i < n; i++) d.push([r(), r(), r(), r(), 0.006 + r() * 0.01]); const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 3.2, 0.8) }), n); im.frustumCulled = false; t4.g.add(im);
    updates.push(t => { const on = seg(t, w('l07', 'patladı'), 0.5); d.forEach((p, i) => { const per = 1.6 + p[3], ph = ((t + p[0] * per) % per) / per; const s = on * p[4]; _m.makeScale(s, s, s); _m.setPosition(0.6 - 1.6 * ph + (p[1] - 0.5) * 0.3, 1.8 + 0.5 * ph - 1.6 * ph * ph + (p[2] - 0.5) * 0.3, 1.8 - 2.6 * ph); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; }); })();

  // ═══ 5 · kent (minyatür) ═══
  const t5 = tableau('kent', { x: X(5), floor: '#2C4A5A', floorR: 30, spots: [{ x: 6, h: 14, z: 10, tx: 0, I: 200, angle: 0.7, color: '#FFE9CC' }], fog: ['#3A3A40', 0.012], bg: '#6A7A8A', hemi: ['#C8D8E8', '#3A3020', 0.9], env: 0.7 });
  { const r = mulberry32(19); const vg = new THREE.ConeGeometry(6, 5, 48, 6); const vol = new THREE.Mesh(vg, std('#3E4A33', { roughness: 0.95, flatShading: true })); vol.position.set(0, 2.5, -9); t5.g.add(vol);
    const hm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std('#E3C9A6'), 140), rm = new THREE.InstancedMesh(new THREE.ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4), std('#8E3B22'), 140);
    for (let i = 0; i < 140; i++) { const x = -7 + r() * 14, z = -2 + r() * 4, s = 0.25 + r() * 0.2; _m.makeScale(s, s * 0.9, s); _m.setPosition(x, s * 0.45, z); hm.setMatrixAt(i, _m); _m.makeScale(s * 1.05, s * 0.5, s * 1.05); _m.setPosition(x, s * 1.15, z); rm.setMatrixAt(i, _m); } t5.g.add(hm, rm);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), std('#1D4A63', { roughness: 0.15, metalness: 0.2 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.01, 12); t5.g.add(sea); }
  const cloudM = new THREE.MeshStandardMaterial({ color: lin('#4A403A'), emissive: lin('#FF6A1A'), emissiveIntensity: 1.2, roughness: 1 });
  const NP = 160, puffs = []; { const r = mulberry32(77); for (let i = 0; i < NP; i++) { const u = r(); puffs.push([(r() - 0.5) * (2 + u * 12), lerp(-8, 3, u), 0.4 + r() * 0.9 + u * 0.5, u]); } }
  const cloud = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), cloudM, NP); cloud.frustumCulled = false; t5.g.add(cloud);
  updates.push(t => { const front = ease.state(seg(t, w('l07', 'patladı'), w('l07', 'yuttu') - w('l07', 'patladı'))); puffs.forEach(([x, z, R, u], i) => { const k = clamp01((front - u) * 4 + 0.2) * (front > 0 ? 1 : 0); const rr = R * ease.enter(k); _m.makeScale(rr, rr * 0.75, rr); _m.setPosition(x, lerp(4.5, 0.4, u) + rr * 0.4, z); cloud.setMatrixAt(i, _m); }); cloud.instanceMatrix.needsUpdate = true; });

  // ═══ 6 · kurtarma ═══
  const t6 = tableau('kurtarma', { x: X(6), floorMat: stoneM, floorR: 8, spots: [{ x: 1, h: 6, z: 4, tx: 0, I: 90, angle: 0.5, color: '#F2E6D2' }], fog: ['#3A3430', 0.04], bg: '#5A5048', hemi: ['#B8A898', '#3A3028', 0.7] });
  box(5, 3, 0.5, stoneM, 0, 1.5, -0.8, t6.g); box(1.0, 2.0, 0.1, '#5A3E2A', 0, 1.0, -0.5, t6.g);
  const door = box(1.0, 2.0, 0.08, '#4A3222', 0, 1.0, -0.42, t6.g);
  const ludger6 = character('ludger', t6, null);
  const res1 = character({ ...CARDS.lawyer, top: '#E8E0CF', bottom: '#5A4A3A', glasses: null, hat: 'straw', hatColor: '#C9B98A' }, t6, () => ({ pos: [0.9, 0, 0.5], rot: -0.9, pose: POSE.holdOut(), face: FACE.surprise }));
  const res2 = character({ ...CARDS.ludger, top: '#C9B98A', skin: '#7A5034', hat: 'straw', hatColor: '#C9B98A' }, t6, () => ({ pos: [-1.0, 0, 0.6], rot: 0.9, pose: POSE.stand(), face: FACE.surprise }));

  // ═══ 7 · termometre ═══
  const t7 = tableau('termometre', { x: X(7), floor: null, spots: [{ x: -2, h: 7, z: 3, tx: -1.4, I: 90, angle: 0.45, color: '#DDEEFF' }, { x: 2, h: 7, z: 3, tx: 1.4, I: 90, angle: 0.45, color: '#FFB070' }], fog: ['#0A0A0C', 0.03], hemi: ['#5A6070', '#201410', 0.6] });
  { const l = new THREE.Mesh(new THREE.CircleGeometry(8, 64, Math.PI / 2, Math.PI), snowM); l.rotation.x = -Math.PI / 2; t7.g.add(l); const r = new THREE.Mesh(new THREE.CircleGeometry(8, 64, -Math.PI / 2, Math.PI), std('#3A1E14', { roughness: 0.9, emissive: lin('#2A0A04') })); r.rotation.x = -Math.PI / 2; t7.g.add(r); }
  const LO = -10, HI = 110, TH = { y0: 0.25, L: 2.3 };
  const scaleTex = canvasTex(256, 1024, (g, W, H) => { g.fillStyle = '#F4F1EA'; g.fillRect(0, 0, W, H); g.fillStyle = '#1C1C1E'; g.textAlign = 'right'; g.font = '700 30px Archivo'; for (let c = LO; c <= HI; c += 2) { const y = H * 0.9 - (c - LO) / (HI - LO) * H * 0.82, big = c % 10 === 0; g.fillRect(W * 0.6, y - 1.5, big ? 60 : 30, 3); if (big) g.fillText(String(c), W * 0.55, y + 10); } g.font = '800 34px Archivo'; g.textAlign = 'center'; g.fillText('°C', W * 0.5, H * 0.05); });
  const thermo = new THREE.Group(); t7.g.add(thermo); thermo.position.set(0, 0, -0.4);
  box(0.55, 2.8, 0.06, new THREE.MeshStandardMaterial({ map: scaleTex, roughness: 0.5 }), 0, 1.6, 0, thermo);
  const glass = new THREE.MeshPhysicalMaterial({ color: lin('#FFFFFF'), roughness: 0.04, transparent: true, opacity: 0.25, clearcoat: 1 });
  const tube = cyl(0.06, 0.06, 2.55, glass, 0.12, 1.55, 0.08, thermo); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), std('#C8141C', { emissive: lin('#3A0408') })); bulb.position.set(0.12, 0.28, 0.08); thermo.add(bulb);
  const col = cyl(0.03, 0.03, 1, std('#C8141C', { emissive: lin('#3A0408') }), 0.12, 0, 0.08, thermo); col.geometry.translate(0, 0.5, 0);
  const tempAt = t => (t < w('l10', 'Hücrenin') - 0.2 ? 37 - 23.3 * ease.state(seg(t, w('l10', 'on') - 0.1, w('l10', 'indi') - w('l10', 'on') + 0.3)) : 13.7 + (400 - 13.7) * ease.enter(seg(t, w('l10', 'tahminen') - 0.1, w('l10', 'dört') - w('l10', 'tahminen') + 0.1)));
  const yOf = c => 0.36 + clamp01((c - LO) / (HI - LO)) * 2.3;
  const shards = (() => { const n = 60, r = mulberry32(400), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 2, 0.5 + r() * 2, 0.4 + r() * 2, r() * 6, 0.02 + r() * 0.04]); const g = new THREE.TetrahedronGeometry(1); const im = new THREE.InstancedMesh(g, glass, n); im.frustumCulled = false; t7.g.add(im);
    const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
    updates.push(t => { const u = t - hero(T); d.forEach((p, i) => { if (u < 0 || t >= T.loop0) { _m.makeScale(0, 0, 0); im.setMatrixAt(i, _m); return; } _e.set(p[3] + u * 9, u * 7, 0); _q.setFromEuler(_e); _m.compose(_v.set(0.12 + p[0] * u, Math.max(0.02, 2.4 + p[1] * u - 4.9 * u * u), -0.32 + p[2] * u), _q, _s.set(p[4], p[4], p[4])); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; }); })();
  const frostTex = canvasTex(256, 512, (g, W, H) => { const r = mulberry32(55); g.strokeStyle = 'rgba(235,245,255,0.9)'; const br = (x, y, a, l, d) => { if (d > 4 || l < 4) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.lineWidth = 3 - d * 0.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); for (let k = 0; k < 3; k++) br(x + (x2 - x) * (0.3 + k * 0.25), y + (y2 - y) * (0.3 + k * 0.25), a + (k % 2 ? 1 : -1) * 0.9, l * 0.45, d + 1); }; for (let i = 0; i < 40; i++) { const x = r() < 0.5 ? 0 : W, y = r() * H; br(x, y, Math.atan2(H / 2 - y, W / 2 - x), 30 + r() * 60, 0); } });
  const frost = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 2.9), new THREE.MeshBasicMaterial({ map: frostTex, transparent: true, opacity: 0, depthWrite: false, color: new THREE.Color(1.4, 1.5, 1.6) })); frost.position.set(0, 1.6, 0.14); thermo.add(frost);
  const anna7 = character('anna', t7, () => ({ pos: [-1.5, 0, 0.2], rot: 0.4, pose: { ...POSE.stand(), lShoulder: [-0.2, 0.5, -0.5], rShoulder: [-0.2, -0.5, 0.5], lElbow: [-1.5, 0, 0], rElbow: [-1.5, 0, 0] }, face: FACE.neutral }));
  const ludger7 = character('ludger', t7, t => ({ pos: [1.5, 0, 0.2], rot: -0.4, pose: POSE.stand(), face: t > hero(T) ? FACE.surprise : FACE.neutral }));

  // ——— hareketler ———
  const set = (f, fn) => { f.act = fn; };
  set(anna0, t => ({ pos: [0.35, 4.3, 0], rot: 0.4, rotX: Math.PI, pose: { ...POSE.stand(), lShoulder: [-2.7, 0, -0.4], rShoulder: [-2.7, 0, 0.4], lElbow: [-0.3, 0, 0], rElbow: [-0.3, 0, 0], neck: [-0.3, 0, 0], head: [-0.4, 0.3, 0] }, face: { ...FACE.fear, eyes: 0.6 + 0.4 * Math.sin(t * 1.7) ** 2 } }));
  const glide = (x0, z, ph) => t => { const u = seg(t, T.l02 - 0.3, T.l02end - T.l02 + 0.4); const p = POSE.walk(((t * 0.8 + ph) % 1), 0.5); return { pos: [lerp(x0 - 4, x0 + 3, u), 0, z], rot: Math.PI / 2, pose: p, face: FACE.smile }; };
  set(anna1, glide(0, 0.5, 0)); set(fr1, glide(-1.6, -0.6, 0.3)); set(fr2, glide(-3.0, 0.3, 0.6));
  set(anna2, t => { const fall = seg(t, w('l03', 'kaybetti'), w('l03', 'düştü') - w('l03', 'kaybetti') + 0.2); const run = seg(t, T.l03 - 0.3, 1.6); if (fall >= 1) return { visible: false }; return { pos: [lerp(-4, -0.2, ease.state(run)) + 0.2 * fall, 0.4 * Math.sin(fall * Math.PI) - 1.6 * fall * fall, 0], rot: Math.PI / 2, rotX: -fall * 2.6, pose: mixPose(POSE.walk((t * 0.8) % 1, 0.5), POSE.fallBack(), fall), face: fall > 0 ? FACE.fear : FACE.smile }; });
  const holder = (x, z, r0) => t => { const u = seg(t, w('l03', 'kırıldı'), 1.2); return { pos: [lerp(x - 3, x, ease.state(u)), 0, z], rot: r0, pose: u < 1 ? POSE.run((t * 1.4) % 1) : POSE.kneel(), face: FACE.fear }; };
  set(fr1b, holder(-0.9, 0.5, 1.2)); set(fr2b, holder(0.95, -0.5, -1.9));
  set(ludger6, t => { const u = ease.enter(seg(t, w('l08', 'duydu') - 0.4, 0.8)); return { pos: [0, 0, lerp(-1.2, -0.25, u)], rot: 0, pose: mixPose(POSE.crouch(), POSE.stand(), u * 0.6), face: FACE.surprise }; });

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 1.6, 1.9, 2.0), P(0, 0.45, 2.6, 0), 40];
  const cam = [
    [0, ...F0, null, 0.02],
    [0.6, P(0, 1.42, 1.98, 1.76), P(0, 0.45, 2.6, 0), 40, null, 0.02],
    [T.l01end, P(0, 1.1, 2.2, 1.3), P(0, 0.5, 2.7, 0), 40, null, 0.02],
    ...cut(T.l02 - 0.15, [P(0, 1.08, 2.2, 1.28), P(0, 0.5, 2.7, 0), 40], [P(1, -3.8, 1.8, 7.2), P(1, -3.0, 1.0, 0), 42]),
    [T.l02end, P(1, 2.6, 1.8, 7.2), P(1, 2.4, 1.0, 0), 42],
    ...cut(T.l03 - 0.15, [P(1, 2.62, 1.8, 7.2), P(1, 2.4, 1.0, 0), 42], [P(2, -2.6, 1.8, 6.5), P(2, -2.6, 1.0, 0), 42]),
    [w('l03', 'düştü'), P(2, 0.3, 2.2, 5.5), P(2, 0, 0.3, 0), 44],
    [T.l03end + 0.3, P(2, 0.2, 2.4, 5.2), P(2, 0, 0.5, 0), 44],
    [w('l04', 'Anna') - 0.4, P(2, 0.1, 2.0, 4.4), P(2, 0, 0.5, 0), 44],
    ...cut(w('l04', 'Anna') - 0.15, [P(2, 0.1, 2.0, 4.38), P(2, 0, 0.5, 0), 44], [P(0, 1.8, 1.6, 2.4), P(0, 0.5, 2.6, 0), 42]),
    [T.l04end + 0.4, P(0, 1.1, 2.2, 1.4), P(0, 0.55, 2.75, 0), 38, null, 0.02],
    ...cut(T.l05 - 0.15, [P(0, 1.08, 2.2, 1.38), P(0, 0.55, 2.75, 0), 38], [P(3, 0.5, 2.4, 3.4), P(3, -0.2, 0.9, 0), 42]),
    [w('l05', 'Ama'), P(3, 1.6, 1.7, 2.2), P(3, 1.0, 1.4, -0.5), 40],
    [T.l05end + 0.3, P(3, 1.2, 1.6, 1.6), P(3, 1.3, 1.6, -0.6), 36],
    ...cut(T.l06 - 0.15, [P(3, 1.2, 1.6, 1.58), P(3, 1.3, 1.6, -0.6), 36], [P(4, 1.0, 1.3, 2.4), P(4, -0.5, 1.0, -0.6), 42]),
    [T.l06end, P(4, 0.6, 1.2, 1.6), P(4, -0.5, 1.0, -0.7), 38, null, 0.02],
    ...cut(w('l07', 'yanardağ') - 0.1, [P(4, 0.6, 1.2, 1.58), P(4, -0.5, 1.0, -0.7), 38], [P(5, 0, 4, 18), P(5, 0, 2.2, -4), 40]),
    [T.l07end, P(5, 0, 3, 13), P(5, 0, 1.5, -2), 44],
    ...cut(T.l08 - 0.15, [P(5, 0, 3, 12.9), P(5, 0, 1.5, -2), 44], [P(4, 0.9, 1.0, 1.9), P(4, -0.4, 1.0, -0.6), 40]),
    [w('l08', 'üç'), P(4, 0.55, 1.0, 1.3), P(4, -0.5, 1.0, -0.7), 36, null, 0.02],
    ...cut(w('l08', 'sonunda') - 0.15, [P(4, 0.55, 1.0, 1.28), P(4, -0.5, 1.0, -0.7), 36], [P(6, 0.4, 1.5, 3.6), P(6, 0, 1.2, -0.4), 42]),
    [T.l08end + 0.4, P(6, 0.2, 1.6, 2.6), P(6, 0, 1.5, -0.4), 38],
    ...cut(T.l09 - 0.15, [P(6, 0.2, 1.6, 2.58), P(6, 0, 1.5, -0.4), 38], [P(7, 0, 1.7, 6.4), P(7, 0, 1.3, 0), 42]),
    [T.l10, P(7, 0, 1.7, 5.8), P(7, 0, 1.3, 0), 42],
    [w('l10', 'indi'), P(7, -0.9, 1.5, 4.4), P(7, -0.7, 1.3, -0.2), 44],
    [w('l10', 'tahminen'), P(7, 0.9, 1.6, 4.4), P(7, 0.7, 1.5, -0.2), 44],
    [hero(T) + 0.4, P(7, 0, 1.8, 5.4), P(7, 0, 1.4, -0.2), 46],
    [T.l11end + 0.6, P(7, 0, 1.8, 6.6), P(7, 0, 1.3, 0), 42],
    ...cut(T.loop0, [P(7, 0, 1.8, 6.65), P(7, 0, 1.3, 0), 42], [P(0, 1.95, 1.75, 2.45), P(0, 0.45, 2.6, 0), 40, null, 0.02]),
    [T.D - 0.6, P(0, 1.78, 1.82, 2.24), P(0, 0.45, 2.6, 0), 40, null, 0.02],
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);
  const c1 = n => n.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return {
    cam, cuts,
    names: [[T.l02 + 1.0, T.l03 - 0.15, 'ANNA BÅGENHOLM', 'Norveç · 1999 · 29 yaşında doktor'], [T.l06 + 0.6, T.l07 - 0.15, 'LUDGER SYLBARIS', 'Martinik · 1902 · hücrede bir mahkûm']],
    numbers: [[w('l04', 'kırk') - 0.1, T.l05 - 0.2, '40 dk', 'BUZUN ALTINDA'], [w('l05', 'on') - 0.1, w('l05', 'Ama') - 0.1, '13,7 °C', 'VÜCUT SICAKLIĞI'],
      [w('l10', 'on') - 0.2, w('l10', 'Hücrenin') - 0.3, t => c1(tempAt(t)) + ' °C', "ANNA'NIN VÜCUDU"], [w('l10', 'tahminen') - 0.15, T.l11 + 0.2, t => (t < w('l10', 'dört') ? Math.round(tempAt(t)) + ' °C' : '~400 °C'), 'TAHMİNİ · HÜCRENİN DIŞI']],
    update(t) {
      for (const u of updates) u(t);
      drawECG(t);
      // kayaklar: Anna düştükten sonra buzdan dışarı dikilir
      const sk = seg(t, w('l03', 'düştü'), 0.4); for (const [k, s] of [[skiL, -1], [skiR, 1]]) { k.visible = sk > 0; k.position.set(s * 0.12, 0.6, 0); k.rotation.set(1.25, s * 0.08, 0); }
      // hücre ışığı: patlamadan sonra turuncu ve titrek
      const er = seg(t, w('l07', 'patladı'), 0.4), fl = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.3 + 1);
      cellSpot.color.copy(lin('#FFF2DC')).lerp(lin('#FF6A1A'), er); cellSpot.intensity = 2.5 * (18 + 260 * er * fl);
      // kapı: kurtarıcılar açar
      door.rotation.y = -1.4 * ease.state(seg(t, w('l08', 'sesini') - 0.2, 0.8)); door.position.x = -0.5 * ease.state(seg(t, w('l08', 'sesini') - 0.2, 0.8));
      // termometre
      const c = tempAt(t); col.scale.y = Math.max(0.01, yOf(c) - 0.3); col.position.y = 0.3; col.visible = tube.visible = t < hero(T) || t >= T.loop0;
      frost.material.opacity = 0.75 * seg(t, w('l10', 'on'), 1.2) * (1 - seg(t, w('l10', 'Hücrenin'), 0.6));
    },
  };
}

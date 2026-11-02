// № 041 · Hiç oynamayan futbolcu ve hiç bırakmayan futbolcu (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar (x = 120 m aralıkla): kulübe · askı · antrenman · soyunma · tel örgü · yalnız top · terminal · yurt ·
// penaltı · köşe bayrağı · son saha. Merkez anlar: Kaiser'in tel örgüyü aşıp oyuna girmeden atılması (l04) ve
// stadyumun Kazu'nun adını ilk kez haykırması (l08). Doruk: aynı sahada, Kaiser'in tek topu ve Kazu'nun 911 topu.

export const opts = { bloom: 0.6 };

export function hero(T) { return T.w('l11', 'bir') + 0.25; }

export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l03 - 0.3, T.l03 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l08 - 0.3, T.l08 + 0.1], [T.l10 - 0.3, T.l10 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    thock: [w('l03', 'yığıldı') - 0.05, w('l04', 'attı') - 0.05, w('l08', 'penaltıdan') + 0.3, w('l11', 'sıfır') - 0.02],
    rumble: [[w('l08', 'haykırdı'), 0.5], [w('l04', 'kavgaya'), 0.3]],
    scratch: [[w('l11', 'dokuz') - 0.2, hero(T) + 0.3, 0.05]],
    riser: [T.l10, hero(T)],
    impact: hero(T),
    silence: [T.l10end + 0.1, T.l11],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, D, lin, std, box, cyl, canvasTex, tableau, motes, character, poseTrack, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32 } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const grass = std('#1E4A22', { roughness: 0.95 });
  const updates = [];

  // ——— ortak nesneler ———
  const ballTex = canvasTex(512, 256, (g, W, H) => { g.fillStyle = '#F4F2EC'; g.fillRect(0, 0, W, H); g.fillStyle = '#16161A'; const r = mulberry32(4); for (let i = 0; i < 14; i++) { const x = (i % 7) * W / 7 + (i > 6 ? W / 14 : 0), y = i > 6 ? H * 0.7 : H * 0.3; g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); } g.fill(); } });
  const ballMat = new THREE.MeshPhysicalMaterial({ map: ballTex, roughness: 0.45, clearcoat: 0.6 });
  const ball = (parent, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 20), ballMat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  const floodBokeh = (g, n = 8) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(14, 13, 11), fog: false }); for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), m); s.position.set(-30 + i * 9, 18 + (i % 2) * 3, -45); g.add(s); } };
  // tribün kalabalığı: instanced gövde + baş; renk tohumlu; hareket (ayağa kalkma, kol sallama) t'ye bağlı
  function crowd(g, n, x0, x1, z0, rows, seed, lift) {
    const r = mulberry32(seed), body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.2, 0.45, 4, 8), std('#FFFFFF', { roughness: 0.8 }), n), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 10, 8), std('#C99A72'), n);
    const P = [], c = new THREE.Color(), pal = ['#C8102E', '#F2F2EE', '#1E2A44', '#2A6A3A', '#E8B41A', '#3A3E48'].map(lin);
    for (let i = 0; i < n; i++) { const row = i % rows, x = lerp(x0, x1, r()), y = 1 + row * 0.55, z = z0 - row * 0.8; P.push([x, y, z, r() * 6.28, r()]); body.setColorAt(i, c.copy(pal[Math.floor(r() * pal.length)]).multiplyScalar(0.6 + r() * 0.4)); head.setColorAt(i, c.copy(lin(['#C99A72', '#8A5A3A', '#E6C4A6', '#5A3A26'][i % 4]))); }
    g.add(body, head); body.frustumCulled = head.frustumCulled = false;
    const m = new THREE.Matrix4();
    updates.push(t => { const L = lift(t); P.forEach(([x, y, z, ph, k], i) => { const up = L * (0.25 + 0.2 * Math.sin(t * 9 + ph)); m.makeTranslation(x, y + 0.3 + up, z); body.setMatrixAt(i, m); m.makeTranslation(x, y + 0.82 + up, z); head.setMatrixAt(i, m); }); body.instanceMatrix.needsUpdate = head.instanceMatrix.needsUpdate = true; });
  }
  const stands = (g, z0, x0 = -12, x1 = 12) => { for (let r = 0; r < 8; r++) box(x1 - x0, 0.55, 0.8, '#26282E', (x0 + x1) / 2, 0.5 + r * 0.55, z0 - r * 0.8, g); };

  // ═══ 0 · kulübe (Bangu, gece) ═══
  const t0 = tableau('kulube', { x: X(0), floorMat: grass, spots: [{ x: 1.5, h: 6, z: 3, tx: 0, tz: 0, I: 70, angle: 0.4 }, { x: 2.6, h: 5, z: 0, tx: 2.6, tz: -2.2, I: 40, angle: 0.35, shadow: false }], fog: ['#07090C', 0.03], hemi: ['#3A4A60', '#101410', 0.4] });
  floodBokeh(t0.g); box(4.2, 0.08, 0.5, '#5A6068', 0, 0.48, 0, t0.g); box(4.4, 1.2, 0.08, '#20242A', 0, 0.9, -0.45, t0.g); box(4.4, 0.08, 1.4, '#20242A', 0, 2.1, 0.1, t0.g);
  const mot0 = motes(t0, 80);
  const kaiser0 = character('kaiser', t0, poseTrack([[0, POSE.sitHunched(), FACE.neutral], [w('l01', 'Kaiser') - 0.2, POSE.sit(), FACE.surprise]]));
  const patron = character({ height: 1.72, heads: 7.2, build: 1.25, skin: '#B88A66', hair: '#2A2420', hairStyle: 'short', mustache: '#2A2420', top: '#2A2420', bottom: '#2A2420', glasses: '#1A1A1A', shoes: '#1A1A1A' }, t0, null);
  const patTrack = poseTrack([[0, POSE.phone(), FACE.shout]]);

  // ═══ 1 · forma askısı ═══
  const t1 = tableau('aski', { x: X(1), floor: '#2A2624', spots: [{ h: 6, z: 2.5, I: 60, angle: 0.55 }], fog: ['#0A0908', 0.03] });
  { const cols = [['#C8102E', '#111111', 'h'], ['#111111', '#F5F5F2', 'v'], ['#7A1F35', '#0B6B3A', 'v'], ['#F5F5F2', '#111111', 's'], ['#D3122B', '#F5F5F2', 'v']];
    box(5.6, 0.04, 0.04, '#B9BEC6', 0, 2.1, -0.6, t1.g);
    cols.forEach(([a, b, k], i) => { const tx = canvasTex(256, 256, (g, W, H) => { g.fillStyle = a; g.fillRect(0, 0, W, H); g.fillStyle = b; if (k === 'h') for (let y = 0; y < H; y += 40) g.fillRect(0, y, W, 20); if (k === 'v') for (let x = 0; x < W; x += 36) g.fillRect(x, 0, 18, H); if (k === 's') { g.save(); g.translate(128, 128); g.rotate(-0.75); g.fillRect(-200, -20, 400, 40); g.restore(); } g.fillStyle = k === 's' ? '#111' : '#FFF'; g.font = '800 34px Archivo'; g.textAlign = 'center'; g.fillText('KAISER', 128, 70); });
      const s = new THREE.Shape(); s.moveTo(-0.32, 0.3); s.lineTo(-0.5, 0.15); s.lineTo(-0.42, 0.02); s.lineTo(-0.3, 0.1); s.lineTo(-0.3, -0.42); s.lineTo(0.3, -0.42); s.lineTo(0.3, 0.1); s.lineTo(0.42, 0.02); s.lineTo(0.5, 0.15); s.lineTo(0.32, 0.3); s.lineTo(0.1, 0.34); s.quadraticCurveTo(0, 0.26, -0.1, 0.34); s.closePath();
      const geo = new THREE.ShapeGeometry(s); const uv = geo.attributes.uv, p = geo.attributes.position; for (let j = 0; j < p.count; j++) uv.setXY(j, p.getX(j) + 0.5, p.getY(j) + 0.5);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.8 })); m.position.set(-2.2 + i * 1.1, 1.66, -0.6); m.castShadow = true; t1.g.add(m); });
  }
  const kaiser1 = character('kaiser', t1, null);
  const k1pose = poseTrack([[T.l02 - 0.3, POSE.walk, FACE.smile, 0.9], [w('l02', 'Ama'), POSE.stand(), FACE.grin]]);
  motes(t1, 60);

  // ═══ 2 · antrenman (gün ışığı) ═══
  const t2 = tableau('antrenman', { x: X(2), floorMat: std('#3C7A34', { roughness: 0.95 }), spots: [{ h: 9, z: 4, I: 160, angle: 0.6, color: '#FFF6E6' }], fog: ['#9FB6C8', 0.02], bg: '#9FB6C8', hemi: ['#CFE2F2', '#3A5A2A', 1.1], env: 0.8 });
  const ball2 = ball(t2.g, 0, 0.11, 0);
  const kaiser2 = character('kaiser', t2, null);
  const k2pose = poseTrack([[T.l03 - 0.3, POSE.run, FACE.determined, 1.2], [w('l03', 'sakatlanmış'), POSE.fallBack(), FACE.pain], [w('l03', 'yığıldı'), { ...POSE.fallBack(), lift: -0.9 }, FACE.pain]]);

  // ═══ 3 · soyunma odası ═══
  const t3 = tableau('soyunma', { x: X(3), floor: '#3A3A3E', spots: [{ h: 3.2, z: 0.5, I: 30, angle: 0.8, color: '#FFE9C8' }], fog: ['#0B0A0A', 0.04] });
  for (let i = 0; i < 7; i++) box(0.6, 2.0, 0.5, '#5A6A7A', -1.8 + i * 0.62, 1.0, -1.3, t3.g);
  box(3.6, 0.08, 0.45, '#8A6A4A', 0, 0.48, -0.5, t3.g);
  const kaiser3 = character('kaiser', t3, null);
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.04), std('#1A1A1A', { roughness: 0.3 })); kaiser3.hand('r').add(phone); phone.position.set(0, -0.25, 0.04);
  const mate1 = character({ height: 1.78, heads: 7.4, skin: '#8A5A3A', hair: '#141210', hairStyle: 'short', top: '#F2F2EE', bottom: '#1E2A44', legs: 'shorts', sleeve: 'short', shoes: '#F2F2EE' }, t3, () => ({ pos: [1.3, 0, -0.5], rot: -0.5, pose: POSE.sit(), face: FACE.surprise }));
  const mate2 = character({ height: 1.75, heads: 7.4, skin: '#E6C4A6', hair: '#6A4A2A', hairStyle: 'curly', top: '#F2F2EE', bottom: '#1E2A44', legs: 'shorts', sleeve: 'short', shoes: '#F2F2EE' }, t3, () => ({ pos: [-1.4, 0, -0.5], rot: 0.6, pose: POSE.sit(), face: FACE.smile }));

  // ═══ 4 · tel örgü (merkez an) ═══
  const t4 = tableau('telorgu', { x: X(4), floorMat: grass, spots: [{ h: 9, z: 4, I: 120, angle: 0.5 }, { x: -1.2, h: 4, z: 4.5, tx: -1.2, tz: 1.2, I: 35, angle: 0.4, shadow: false }, { x: -3, h: 10, z: -4, tx: 0, tz: -3, I: 60, angle: 0.6, color: '#CFE0FF', shaft: false }], fog: ['#06080B', 0.025], hemi: ['#3A4A60', '#101410', 0.5] });
  floodBokeh(t4.g, 6); stands(t4.g, -3.6); crowd(t4.g, 180, -11, 11, -3.4, 8, 41, t => seg(t, w('l04', 'kavgaya'), 0.6));
  { const fenceTex = canvasTex(128, 128, (g) => { g.strokeStyle = '#FFF'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 128); g.moveTo(128, 0); g.lineTo(0, 128); g.stroke(); }); fenceTex.wrapS = fenceTex.wrapT = THREE.RepeatWrapping; fenceTex.repeat.set(60, 8);
    const fm = new THREE.MeshStandardMaterial({ color: lin('#9AA0A8'), alphaMap: fenceTex, transparent: true, side: THREE.DoubleSide, metalness: 0.6, roughness: 0.4, depthWrite: false });
    const fence = new THREE.Mesh(new THREE.PlaneGeometry(24, 2.6), fm); fence.position.set(0, 1.3, -2.4); t4.g.add(fence); box(24, 0.06, 0.06, '#9AA0A8', 0, 2.6, -2.4, t4.g); }
  const kaiser4 = character('kaiser', t4, null);
  const k4pose = poseTrack([[T.l04 - 0.3, POSE.walk, FACE.neutral, 0.6], [w('l04', 'tribüne'), POSE.stand(), FACE.determined], [w('l04', 'Tel'), POSE.climb, FACE.shout, 1.2], [w('l04', 'kavgaya'), POSE.armsUp(), FACE.shout], [w('l04', 'Hakem'), POSE.armsUp(), FACE.surprise]]);
  const ref = character({ height: 1.78, heads: 7.4, build: 1.05, skin: '#E2BFA0', hair: '#2A2420', hairStyle: 'short', top: '#151515', bottom: '#151515', legs: 'shorts', sleeve: 'short', shoes: '#151515' }, t4, null);
  const card = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.11, 0.004), new THREE.MeshStandardMaterial({ color: lin('#D3141C'), emissive: lin('#4A0406'), roughness: 0.35 })); ref.hand('r').add(card); card.position.set(0, -0.36, 0.02);

  // ═══ 5 · yalnız top ═══
  const t5 = tableau('yalniztop', { x: X(5), floorMat: grass, spots: [{ h: 7, z: 1, I: 90, angle: 0.3, color: '#E6EEFF' }], fog: ['#05070A', 0.04] });
  box(2.2, 0.08, 0.45, '#5A6068', -1.2, 0.48, -0.6, t5.g); const ball5 = ball(t5.g, 0.9, 0.11, 0.6);
  const kaiser5 = character('kaiser', t5, () => ({ pos: [-1.2, 0, -0.55], rot: 0.5, pose: POSE.sitHunched(), face: { ...FACE.sad, look: 0.8 } }));
  motes(t5, 90, [2.2, 2.4, 2.8]);

  // ═══ 6 · terminal (Kazu, 15) ═══
  const t6 = tableau('terminal', { x: X(6), floor: '#4A4C50', floorRough: 0.3, spots: [{ h: 7, z: 3, I: 110, angle: 0.75, color: '#F2F4FF' }], fog: ['#101216', 0.03], hemi: ['#6A7080', '#202020', 0.6] });
  { const board = canvasTex(1024, 384, (g, W, H) => { g.fillStyle = '#0A0B0E'; g.fillRect(0, 0, W, H); g.font = '800 64px Archivo'; g.fillStyle = '#FFC845'; g.fillText('PARTIDAS · DEPARTURES', 40, 90); g.fillStyle = '#F2F2EE'; g.font = '700 70px Archivo'; g.fillText('SÃO PAULO', 40, 210); g.fillStyle = '#7CFFB2'; g.fillText('1982', 700, 210); g.fillStyle = '#9AA0A8'; g.font = '600 50px Archivo'; g.fillText('TOKYO → RIO → SÃO PAULO', 40, 310); });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.27), new THREE.MeshBasicMaterial({ map: board, color: new THREE.Color(1.5, 1.5, 1.5) })); b.position.set(-1.6, 1.9, -3); t6.g.add(b); }
  const kazu15 = character('kazu15', t6, null);
  const suitcase = box(0.5, 0.36, 0.2, '#6B4329', 0, 0, 0, kazu15.hand('l')); suitcase.position.set(0, -0.48, 0);
  motes(t6, 60, [2.0, 2.1, 2.4]);

  // ═══ 7 · yurt odası, yağmur ═══
  const t7 = tableau('yurt', { x: X(7), floor: '#3A2E26', spots: [{ x: 1.2, h: 2.6, z: 0.6, tx: 0, I: 14, angle: 0.9, color: '#FFD9A0' }], fog: ['#0A0B0E', 0.05] });
  box(1.9, 0.45, 0.9, '#5A5A6A', 0, 0.22, -0.4, t7.g); box(1.9, 0.12, 0.9, '#D9D4C8', 0, 0.5, -0.4, t7.g);
  const rainTex = canvasTex(256, 512, (g, W, H) => { g.fillStyle = '#1A2A3A'; g.fillRect(0, 0, W, H); const r = mulberry32(9); g.strokeStyle = 'rgba(200,220,255,0.55)'; for (let i = 0; i < 160; i++) { g.lineWidth = 1 + r() * 2; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 20 + r() * 40); g.stroke(); } });
  rainTex.wrapT = THREE.RepeatWrapping;
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5), new THREE.MeshBasicMaterial({ map: rainTex, color: new THREE.Color(0.9, 1.0, 1.2) })); win.position.set(0.2, 1.6, -0.95); t7.g.add(win);
  box(1.42, 0.06, 0.08, '#E8E2D6', 0.2, 2.36, -0.92, t7.g); box(1.42, 0.06, 0.08, '#E8E2D6', 0.2, 0.84, -0.92, t7.g); box(0.06, 1.5, 0.08, '#E8E2D6', 0.2, 1.6, -0.92, t7.g); box(4, 3, 0.1, '#2E2A2A', 0, 1.5, -1.0, t7.g);
  const kazu7 = character('kazu15', t7, () => ({ pos: [-0.3, 0.12, -0.3], rot: 0.25, pose: POSE.sitHunched(), face: FACE.sad }));
  updates.push(t => { rainTex.offset.y = -(t * 0.6) % 1; });

  // ═══ 8 · penaltı ve tribün (merkez an) ═══
  const t8 = tableau('penalti', { x: X(8), floorMat: grass, spots: [{ h: 10, z: 4, I: 150, angle: 0.55 }, { x: 0, h: 12, z: -6, tz: -6, I: 90, angle: 0.7, shaft: false }], fog: ['#06080B', 0.02], hemi: ['#3A4A60', '#101410', 0.5] });
  floodBokeh(t8.g, 8); stands(t8.g, -9, -14, 14); crowd(t8.g, 320, -13, 13, -8.8, 8, 88, t => 0.15 + 0.85 * seg(t, w('l08', 'haykırdı') - 0.1, 0.4));
  { const post = std('#F2F2EE', { roughness: 0.35 }); for (const x of [-3.66, 3.66]) box(0.12, 2.44, 0.12, post, x, 1.22, -6, t8.g); box(7.44, 0.12, 0.12, post, 0, 2.44, -6, t8.g); }
  const ball8 = ball(t8.g, 0, 0.11, 2);
  const kazu20 = character({ ...A.CARDS.kazu59, hair: '#141414', hairStyle: 'crew', top: '#F2F2EE', bottom: '#1E2A44' }, t8, null);
  const k8pose = poseTrack([[T.l08 - 0.3, POSE.stand(), FACE.determined], [w('l08', 'attığı') - 0.4, POSE.run, FACE.determined, 1.3], [w('l08', 'penaltıdan') + 0.3, POSE.stand(), FACE.surprise], [w('l08', 'haykırdı') - 0.1, POSE.armsUp(), FACE.grin]]);

  // ═══ 9 · köşe bayrağı (59 yaşında) ═══
  const t9 = tableau('kose', { x: X(9), floorMat: grass, spots: [{ h: 8, z: 3, I: 110, angle: 0.45 }], fog: ['#06080B', 0.03] });
  floodBokeh(t9.g, 6); cyl(0.02, 0.02, 1.5, '#F2F2EE', -0.8, 0.75, -0.6, t9.g); { const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshStandardMaterial({ color: lin('#E8B41A'), side: THREE.DoubleSide })); fl.position.set(-0.6, 1.35, -0.6); t9.g.add(fl); updates.push(t => { fl.rotation.y = 0.3 * Math.sin(t * 5); }); }
  const kazu59 = character('kazu59', t9, null);

  // ═══ 10 · son saha: 0 ve 911 ═══
  const t10 = tableau('son', { x: X(10), floorMat: grass, floorR: 30, spots: [{ x: -2.5, h: 9, z: 3, tx: -2.5, I: 90, angle: 0.3, color: '#E6EEFF' }, { x: 3, h: 11, z: 3, tx: 3.5, tz: -1, I: 140, angle: 0.4 }], fog: ['#05070A', 0.025], hemi: ['#3A4A60', '#101410', 0.45] });
  floodBokeh(t10.g, 8);
  const ballK = ball(t10.g, -0.7, 0.11, 0.7);
  const kaiserF = character('kaiser', t10, () => ({ pos: [-1.15, 0, 0], rot: 0.35, pose: { ...POSE.stand(), lShoulder: [-0.3, 0.6, -0.4], rShoulder: [-0.3, -0.6, 0.4], lElbow: [-1.6, 0, 0], rElbow: [-1.6, 0, 0] }, face: FACE.smile }));
  const kazuF = character('kazu59', t10, () => ({ pos: [1.0, 0, 0.3], rot: -0.35, pose: POSE.stand(), face: FACE.smile }));
  // 911 top: dinlenme yerleri tohumlu birikimle; "dokuz"dan "bir"e kadar yağar
  const NB = 911, R2 = 0.22 * 0.22, rest = [], rr = mulberry32(911), gauss = () => Math.sqrt(-2 * Math.log(1 - rr())) * Math.cos(2 * Math.PI * rr());
  for (let i = 0; i < NB; i++) { let best = null; for (let k = 0; k < 10; k++) { const x = 1.9 + gauss() * 0.75, z = -1.5 + gauss() * 0.55; let y = 0.11; for (const p of rest) { const dx = p[0] - x, dz = p[2] - z, d2 = dx * dx + dz * dz; if (d2 < R2) y = Math.max(y, p[1] + Math.sqrt(R2 - d2)); } if (!best || y < best[1]) best = [x, y, z]; } rest.push(best); }
  const heap = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 16, 12), ballMat, NB); heap.castShadow = true; heap.frustumCulled = false; t10.g.add(heap);
  const r0 = w('l11', 'dokuz') - 0.15, r1 = hero(T), landT = i => r0 + (r1 - r0) * Math.pow((i + 0.5) / NB, 0.6);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), zero = new THREE.Vector3(0, 0, 0);
  updates.push(t => { for (let i = 0; i < NB; i++) { const L = landT(i), fall = 1.6, p = rest[i]; if (t < L - fall || t >= T.loop0) { _m.compose(_v.set(0, -20, 0), _q.identity(), zero); heap.setMatrixAt(i, _m); continue; } const u = Math.min(0, t - L), y = p[1] + 4.9 * u * u; _e.set(i, i * 2, t < L ? t * 6 : 0); _q.setFromEuler(_e); _m.compose(_v.set(p[0], y, p[2]), _q, one); heap.setMatrixAt(i, _m); } heap.instanceMatrix.needsUpdate = true; });
  const count = t => { let c = 0; if (t >= r1) return NB; while (c < NB && t >= landT(c)) c++; return c; };

  // ——— karakter hareketleri (dünya içi konumlar tablonun yerelinde) ———
  kaiser0.root.position.set(0, 0.06, 0); kaiser0.root.rotation.y = 0.2;
  // hareketli karakterler: act(t) → { pos, rot, pose, face } (tablonun yerel koordinatında)
  const setAct = (f, fn) => { f.act = fn; };
  setAct(kaiser0, t => { const p = poseTrack([[0, POSE.sit(), { ...FACE.neutral, look: -0.4 }], [w('l01', 'Kaiser') - 0.2, POSE.sit(), FACE.surprise]])(t); return { pos: [0, 0.06, 0], rot: 0.2, ...p }; });
  setAct(patron, t => ({ pos: [2.6, 0, -2.2], rot: -0.5, ...patTrack(t) }));
  setAct(kaiser1, t => { const u = ease.state(seg(t, T.l02, w('l02', 'Ama') - T.l02)); const p = k1pose(t); return { pos: [lerp(-2.6, 0.4, u), 0, 0.3], rot: u < 1 && t < w('l02', 'Ama') ? Math.PI / 2 : 0.2, ...p }; });
  setAct(kaiser2, t => { const u = seg(t, T.l03 - 0.3, w('l03', 'sakatlanmış') - T.l03 + 0.3); const p = k2pose(t); const down = seg(t, w('l03', 'sakatlanmış'), 0.5); return { pos: [lerp(-1.6, -0.4, ease.state(u)), 0, 0.2], rot: Math.PI / 2, rotZ: 0, rotX: -1.4 * ease.exit(down), ...p }; });
  setAct(kaiser3, t => { const talk = 0.5 + 0.5 * Math.sin(t * 13); return { pos: [0, 0.06, -0.5], rot: 0, pose: POSE.phone(), face: { ...FACE.grin, open: 0.25 + 0.6 * talk * talk } }; });
  setAct(kaiser4, t => { const climb = seg(t, w('l04', 'Tel'), w('l04', 'kavgaya') - w('l04', 'Tel')); const p = k4pose(t); return { pos: [0.4, 2.0 * ease.state(climb), lerp(-1.4, -2.6, ease.state(climb))], rot: t < w('l04', 'tribüne') ? 0.3 : Math.PI, ...p }; });
  setAct(ref, t => { const up = seg(t, w('l04', 'attı') - 0.5, 0.35); return { visible: t > w('l04', 'Hakem') - 0.6, pos: [-1.2, 0, 1.2], rot: 0.35, pose: mixPose(POSE.stand(), { rShoulder: [-3.0, 0, 0.2], rElbow: [-0.1, 0, 0] }, ease.enter(up)), face: FACE.determined }; });
  setAct(kazu15, t => { const u = seg(t, T.l06 - 0.3, T.l06end - T.l06 + 0.6); const p = POSE.walk((t * 0.9) % 1, 0.8); p.lShoulder = [0.1, 0, -0.15]; p.lElbow = [0, 0, 0]; return { pos: [lerp(-1.3, 1.3, u), 0, 0.4], rot: Math.PI / 2 - 0.2, pose: p, face: { ...FACE.determined, look: 0.6 } }; });
  setAct(kazu20, t => { const run = seg(t, w('l08', 'attığı') - 0.4, 0.9); const p = k8pose(t); return { pos: [0, 0, lerp(4.2, 2.3, ease.state(run))], rot: Math.PI, ...p }; });
  setAct(kazu59, t => { const ph = (t * 1.1) % 1, a = Math.sin(ph * Math.PI * 2); return { pos: [0.3 + 0.25 * a, 0, 0.2], rot: 0.3, pose: { ...POSE.walk(ph, 0.7), lShoulder: [-1.2, 0, -0.6 + 0.3 * a], rShoulder: [-1.2, 0, 0.6 + 0.3 * a], lElbow: [-0.6, 0, 0], rElbow: [-0.6, 0, 0], spine: [0, 0.2 * a, 0] }, face: FACE.grin }; });

  // ——— kamera: tablo başına anahtarlar; kesmeler 1 ms ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.5, 1.45, 1.6), P(0, 0.05, 1.18, 0), 36];   // yüz üst yarıda: alttaki TAKİP ET ile çakışmaz
  const cam = [
    [0, ...F0, null, 0.02],
    [0.6, P(0, 0.44, 1.44, 1.42), P(0, 0.05, 1.18, 0), 36, null, 0.02],
    [w('l01', 'Patron') - 0.2, P(0, 0.6, 1.6, 2.8), P(0, 1.6, 1.4, -1.4), 42],          // arkada telsizli patron
    [T.l01end, P(0, 0.45, 1.45, 1.35), P(0, 0.05, 1.4, 0), 34, null, 0.02],
    ...cut(T.l02 - 0.15, [P(0, 0.44, 1.45, 1.32), P(0, 0.05, 1.4, 0), 34], [P(1, -1.8, 1.5, 3.4), P(1, -1.2, 1.35, -0.2), 42]),
    [w('l02', 'Ama') - 0.3, P(1, 0.6, 1.5, 3.0), P(1, 0.3, 1.35, -0.2), 42],
    [T.l02end + 0.3, P(1, 0.45, 1.65, 1.5), P(1, 0.4, 1.6, 0.3), 34, null, 0.02],
    ...cut(T.l03 - 0.15, [P(1, 0.45, 1.65, 1.48), P(1, 0.4, 1.6, 0.3), 34], [P(2, 1.2, 1.2, 4.4), P(2, -1.2, 0.9, 0), 42]),
    [w('l03', 'yığıldı') + 0.3, P(2, 0.4, 0.9, 3.2), P(2, -0.6, 0.4, 0.2), 40],
    ...cut(w('l03', 'Soyunma') - 0.15, [P(2, 0.38, 0.9, 3.15), P(2, -0.6, 0.4, 0.2), 40], [P(3, 0, 1.45, 2.4), P(3, 0, 1.25, -0.5), 42]),
    [T.l03end + 0.3, P(3, 0.1, 1.45, 1.4), P(3, 0.05, 1.4, -0.5), 36, null, 0.02],
    ...cut(T.l04 - 0.15, [P(3, 0.1, 1.45, 1.38), P(3, 0.05, 1.4, -0.5), 36], [P(4, 1.8, 1.5, 3.6), P(4, 0.4, 1.3, -1.4), 42]),
    [w('l04', 'Tel'), P(4, 1.6, 1.6, 2.6), P(4, 0.4, 2.2, -2.2), 46],
    [w('l04', 'kavgaya') + 0.4, P(4, 0.9, 2.2, 3.4), P(4, 0.4, 2.8, -2.8), 48],
    [w('l04', 'Hakem') - 0.1, P(4, -0.7, 0.9, 3.4), P(4, -1.2, 1.7, 1.2), 40],          // alttan hakem ve kart
    [w('l04', 'attı') + 0.4, P(4, -0.8, 0.85, 2.8), P(4, -1.15, 2.0, 1.2), 36, null, 0.02],
    ...cut(T.l05 - 0.2, [P(4, -0.8, 0.85, 2.75), P(4, -1.15, 2.0, 1.2), 36], [P(5, 2.4, 0.9, 3.0), P(5, -0.2, 0.6, 0), 42]),
    [T.l05end + 0.4, P(5, 1.8, 0.75, 2.2), P(5, 0.2, 0.45, 0.2), 38, null, 0.02],
    ...cut(T.l06 - 0.15, [P(5, 1.78, 0.75, 2.18), P(5, 0.2, 0.45, 0.2), 38], [P(6, -1.0, 1.3, 4.4), P(6, -1.1, 1.0, 0.2), 42]),
    [T.l06end, P(6, 1.2, 1.25, 4.0), P(6, 1.1, 1.0, 0.2), 42],
    ...cut(T.l07 - 0.15, [P(6, 1.22, 1.25, 3.98), P(6, 1.1, 1.0, 0.2), 42], [P(7, 1.3, 1.35, 2.3), P(7, -0.1, 1.1, -0.4), 40]),
    [T.l07end + 0.3, P(7, 0.9, 1.3, 1.6), P(7, -0.25, 1.2, -0.35), 36, null, 0.02],
    ...cut(T.l08 - 0.15, [P(7, 0.88, 1.3, 1.58), P(7, -0.25, 1.2, -0.35), 36], [P(8, 0.8, 1.5, 6.6), P(8, 0, 1.2, 0), 42]),
    [w('l08', 'penaltıdan') + 0.6, P(8, 0.5, 1.6, 5.4), P(8, 0, 1.5, -5), 46],
    [w('l08', 'haykırdı'), P(8, 0.6, 1.4, 5.6), P(8, 0, 2.2, -6), 50],                // sırtından: kollar havada, tribün ayakta
    [T.l08end + 0.3, P(8, 0.2, 1.75, 0.9), P(8, 0, 1.7, 2.3), 36, null, 0.02],          // önden: yüzündeki sevinç
    ...cut(T.l09 - 0.15, [P(8, 0.2, 1.75, 0.92), P(8, 0, 1.7, 2.3), 36], [P(9, 1.4, 1.3, 4.2), P(9, 0.2, 1.05, 0), 42]),
    [T.l09end + 0.3, P(9, 1.0, 1.4, 3.4), P(9, 0.2, 1.2, 0), 40],
    ...cut(T.l10 - 0.15, [P(9, 1.0, 1.4, 3.38), P(9, 0.2, 1.2, 0), 40], [P(10, -0.1, 1.6, 6.4), P(10, -0.1, 0.9, -0.3), 48]),
    [T.l11 - 0.1, P(10, -0.1, 1.6, 6.0), P(10, -0.1, 0.9, -0.3), 48],
    [w('l11', 'sıfır'), P(10, -0.7, 1.3, 2.8), P(10, -1.0, 0.95, 0.2), 40],
    [w('l11', 'Kazu') - 0.1, P(10, -0.7, 1.3, 2.7), P(10, -1.0, 0.95, 0.2), 40],
    [w('l11', 'dokuz'), P(10, 1.0, 1.5, 4.6), P(10, 1.6, 0.8, -0.8), 42],
    [T.l12, P(10, 0, 1.8, 6.6), P(10, 0.3, 0.9, -0.6), 42],
    [T.l12end + 0.6, P(10, 0, 2.0, 7.2), P(10, 0.3, 0.9, -0.6), 42],
    ...cut(T.loop0, [P(10, 0, 2.02, 7.25), P(10, 0.3, 0.9, -0.6), 42], [P(0, 0.62, 1.47, 1.95), P(0, 0.05, 1.18, 0), 36, null, 0.02]),
    [T.D - 0.6, P(0, 0.56, 1.46, 1.78), P(0, 0.05, 1.18, 0), 36, null, 0.02],
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[T.l02 - 0.05, w('l02', 'Ama') - 0.3, 'CARLOS KAISER', 'Brezilya · 1979–1992'], [T.l06 - 0.05, T.l07 - 0.2, 'KAZU MIURA', 'Japonya · 1982 · 15 yaşında']],
    numbers: [[w('l11', 'sıfır') - 0.1, w('l11', 'Kazu') - 0.3, '0', 'KAISER · RESMÎ MAÇ'], [w('l11', 'Kazu') - 0.05, T.l12 + 0.3, t => count(t), 'KAZU · RESMÎ MAÇ']],
    update(t) {
      mot0(t);
      for (const u of updates) u(t);
      // antrenman topu: Kaiser'e doğru yuvarlanır
      const rb = seg(t, T.l03, w('l03', 'sakatlanmış') - T.l03); ball2.position.set(lerp(2.5, -0.1, ease.state(rb)), 0.11, 0.6); ball2.rotation.z = rb * 12;
      // penaltı topu: "penaltıdan"da ağlara
      const kb = seg(t, w('l08', 'penaltıdan') - 0.05, 0.35); ball8.position.set(lerp(0, 1.8, kb), 0.11 + 1.3 * Math.sin(kb * Math.PI) * 0.7 + kb * 0.6, lerp(2, -5.8, kb));
    },
  };
}

// № 036 · Batmayan hostes ve iki bombadan kurtulan mühendis (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: koridor (diş fırçası) · kamara · filika (bebek) · Ege (pervane, atlayış) · Hiroşima sokağı · parlama ·
// Nagazaki ofisi (ikinci ışık) · takvim. Merkez anlar: kucağa verilen bebek (l03), ofisi dolduran ikinci ışık (l08).

export const opts = { bloom: 0.7 };
export function hero(T) { return T.w('l10', 'yaşadı') + 0.4; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l03 - 0.3, T.l03 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    thock: [w('l02', 'gıcırtı'), w('l04', 'mayına'), w('l07', 'parladı'), w('l08', 'beyaz')],
    rumble: [[w('l07', 'parladı'), 0.6], [w('l08', 'beyaz'), 0.6], [w('l02', 'gıcırtı'), 0.25]],
    scratch: [[w('l04', 'suya'), w('l04', 'kurtuldu'), 0.03]],
    riser: [w('l10', 'Yamaguçi'), hero(T)],
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
  const officer = { height: 1.82, heads: 7.5, build: 1.05, skin: '#E8C9AE', hair: '#3A2E26', hairStyle: 'short', mustache: '#3A2E26', top: '#1A2238', bottom: '#1A2238', hat: 'cap', hatColor: '#F2F2EE', shoes: '#141414' };
  const boss = { height: 1.7, heads: 7.2, build: 1.1, skin: '#E0BC94', hair: '#3A3A3A', hairStyle: 'short', top: '#3A3E48', bottom: '#3A3E48', glasses: '#2A2A2A', shoes: '#1A1A1A' };
  const toothbrush = f => { const tb = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 8), std('#E8E0C8', { roughness: 0.4 })); tb.add(h); const b = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.03, 0.012), std('#F4F1EA')); b.position.y = 0.09; tb.add(b); tb.position.set(0, -0.3 * f.u, 0.05); f.hand('r').add(tb); return tb; };
  const baby = f => { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 6, 12), std('#F2EEE4', { roughness: 0.95 })); body.rotation.z = Math.PI / 2; g.add(body); const head = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), std('#F0D4BE')); head.position.set(0.18, 0.03, 0); g.add(head); g.position.set(0.15, -0.35, 0.18); f.hand('r').add(g); return g; };

  // ═══ 0 · koridor (Britannic, yan yatmış) ═══
  const t0 = tableau('koridor', { x: X(0), floor: '#5A4A3A', spots: [{ x: 0.5, h: 2.6, z: 1, tx: 0, I: 25, angle: 0.9, color: '#FFE6C0' }], fog: ['#0A0C10', 0.06], hemi: ['#4A5060', '#141210', 0.4] });
  const corr = new THREE.Group(); corr.rotation.z = 0.18; t0.g.add(corr);
  box(0.12, 2.5, 8, '#C9B89A', -1.1, 1.25, -2, corr); box(0.12, 2.5, 8, '#C9B89A', 1.1, 1.25, -2, corr); box(2.3, 0.12, 8, '#E8E0D0', 0, 2.5, -2, corr);
  for (let i = 0; i < 4; i++) { const d = box(0.05, 2.0, 0.8, '#6A4A2E', -1.05, 1.0, -0.5 - i * 1.8, corr); }
  const lampC = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 6.5, 4) })); lampC.position.set(0, 2.4, -1); corr.add(lampC);
  const water0 = new THREE.Mesh(new THREE.PlaneGeometry(6, 10), new THREE.MeshPhysicalMaterial({ color: lin('#1A3A4A'), roughness: 0.05, transparent: true, opacity: 0.85 })); water0.rotation.x = -Math.PI / 2; water0.position.set(0, 0.1, -2); t0.g.add(water0);
  const v0 = character('violet', t0, null); const tb0 = toothbrush(v0);

  // ═══ 1 · kamara (Titanik, gece) ═══
  const t1 = tableau('kamara', { x: X(1), floor: '#4A3A2E', spots: [{ x: 0.3, h: 2.2, z: 0.4, tx: 0, I: 10, angle: 1.0, color: '#FFD9A0' }], fog: ['#0A0806', 0.06], hemi: ['#3A3440', '#100C0A', 0.3] });
  box(2.0, 0.45, 0.9, '#6A4A2E', 0, 0.22, -0.3, t1.g); box(2.0, 0.12, 0.85, '#F2EEE4', 0, 0.5, -0.3, t1.g); box(3, 2.4, 0.12, '#C9B89A', 0, 1.2, -0.8, t1.g);
  const lamp1 = new THREE.Group(); lamp1.position.set(0.5, 2.3, 0.2); t1.g.add(lamp1); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.4, 6), std('#2A2A2A')); c.position.y = -0.2; lamp1.add(c); const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 7, 4) })); b.position.y = -0.42; lamp1.add(b); }
  const v1 = character('violet', t1, t => { const up = seg(t, w('l02', 'gıcırtı') - 0.2, 0.8); return { pos: [-0.2, 0.55, -0.2], rot: 0.4, pose: mixPose({ ...POSE.sit(), spine: [-0.9, 0, 0], liftK: -0.85 }, POSE.sit(), ease.state(up)), face: up > 0 ? FACE.fear : FACE.closed }; });

  // ═══ 2 · filika (gece, gemi gövdesi) ═══
  const t2 = tableau('filika', { x: X(2), floor: null, spots: [{ x: 1.5, h: 4, z: 2.5, tx: 0, I: 25, angle: 0.6, color: '#FFE8C8' }], fog: ['#04060A', 0.035], hemi: ['#2A3448', '#05070A', 0.4] });
  { const hull = box(2, 14, 30, '#141418', -2.6, 1, -6, t2.g); const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 4, 2.5) }); for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), pm); p.rotation.y = Math.PI / 2; p.position.set(-1.58, 1.5 + r * 1.6, 6 - i * 1.6); t2.g.add(p); }
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: lin('#06101A'), roughness: 0.15, metalness: 0.3 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -3; t2.g.add(sea);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 16, 8), new THREE.MeshBasicMaterial({ color: lin('#05070C'), side: THREE.BackSide, fog: false })); t2.g.add(sky);
    const st = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3.2), fog: false }), r = mulberry32(8); for (let i = 0; i < 150; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.06 + r() * 0.06, 6, 4), st); const a = r() * 6.28, e = 0.15 + r() * 1.2; s.position.set(Math.cos(a) * 50 * Math.cos(e), 50 * Math.sin(e), Math.sin(a) * 50 * Math.cos(e)); t2.g.add(s); } }
  const boat = new THREE.Group(); t2.g.add(boat); box(1.4, 0.4, 3.4, '#E8E0D0', 0, 0, 0, boat); box(1.2, 0.08, 3.2, '#6A4A2E', 0, 0.18, 0, boat);
  for (const z of [-1.7, 1.7]) { const rope = cyl(0.01, 0.01, 8, '#B8A888', 0, 4, z, boat); }
  const v2 = character('violet', t2, null); boat.add(v2.root); const bb = baby(v2);
  const off2 = character(officer, t2, t => ({ pos: [-1.3, 1.8, 0.4], rot: Math.PI / 2, pose: mixPose(POSE.stand(), POSE.holdOut(), seg(t, w('l03', 'bebek') - 0.5, 0.5) * (1 - seg(t, w('l03', 'uzattı') + 0.3, 0.4))), face: FACE.determined }));
  const passengers = [[0.3, -0.9, '#5A3A4A'], [-0.3, 1.0, '#3A4A5A'], [0.35, 0.9, '#6A5A3A']].map(([x, z, c], i) => { const f = character({ ...CARDS.julianeMom, top: c, hat: i === 1 ? 'beret' : null, hatColor: '#3A2A2A' }, t2, () => ({ pos: [x, 0.2, z], rot: Math.PI / 2 + (i - 1) * 0.4, pose: POSE.sit(), face: FACE.fear })); boat.add(f.root); return f; });

  // ═══ 3 · Ege (gündüz): pervaneler ve atlayış ═══
  const t3 = tableau('ege', { x: X(3), floor: null, spots: [{ x: 4, h: 12, z: 6, tx: 0, I: 200, angle: 0.6, color: '#FFF4E0' }], fog: ['#8AA8C0', 0.02], bg: '#8AB0CC', hemi: ['#CFE6F2', '#2A4A5A', 1.0], env: 0.8 });
  const sea3 = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: lin('#0E3050'), roughness: 0.08, metalness: 0.35 })); sea3.rotation.x = -Math.PI / 2; t3.g.add(sea3);
  { const hull = new THREE.Group(); hull.position.set(-6, -1, -10); hull.rotation.set(0.1, 0.4, -0.25); t3.g.add(hull); box(6, 6, 40, '#E8E8E4', 0, 2, 0, hull); box(6.1, 1.2, 40.1, '#2E7A3A', 0, 3.2, 0, hull); const cross = canvasTex(256, 256, (g) => { g.fillStyle = '#E8E8E4'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#C8141C'; g.fillRect(100, 30, 56, 196); g.fillRect(30, 100, 196, 56); }); }
  const prop = new THREE.Group(); prop.position.set(-1.6, 0.4, 2.0); t3.g.add(prop); for (let i = 0; i < 3; i++) { const b = box(0.2, 1.4, 0.06, std('#8A6A3A', { metalness: 0.8, roughness: 0.3 }), 0, 0.6, 0, prop); b.geometry.translate(0, 0.0, 0); const p = new THREE.Group(); p.rotation.x = i * 2.09; p.add(b); prop.add(p); }
  const boat3 = new THREE.Group(); t3.g.add(boat3); box(1.4, 0.4, 3.0, '#E8E0D0', 0, 0.1, 0, boat3);
  const v3 = character('violet', t3, null);
  const foam = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.5, 1.5), transparent: true, opacity: 0 })); foam.rotation.x = -Math.PI / 2; foam.position.set(0.9, 0.02, 0.6); t3.g.add(foam);

  // ═══ 4 · Hiroşima sokağı (sabah) ═══
  const t4 = tableau('hirosima', { x: X(4), floor: '#8A8070', floorR: 30, spots: [{ x: 3, h: 10, z: 5, tx: 0, I: 180, angle: 0.6, color: '#FFF0D8' }], fog: ['#B8C8D8', 0.02], bg: '#B8D0E6', hemi: ['#DDEBF5', '#6A6050', 1.0], env: 0.8 });
  { const r = mulberry32(45); for (let i = 0; i < 16; i++) { const s = i % 2 ? 1 : -1, z = -10 + Math.floor(i / 2) * 3; const h = 2.5 + r() * 2.5; box(3, h, 2.6, ['#C8B8A0', '#A89880', '#D8C8B0'][i % 3], s * 4, h / 2, z, t4.g); box(3.4, 0.3, 3.0, '#5A4A3A', s * 4, h + 0.15, z, t4.g); } }
  for (const x of [-0.8, 0.8]) box(0.08, 0.02, 30, '#4A4A4E', x, 0.01, -5, t4.g);
  const y4 = character('yamaguchi', t4, null);
  { const bag = box(0.4, 0.3, 0.1, '#4A3626', 0, 0, 0, y4.hand('l')); bag.position.set(0, -0.35, 0); }

  // ═══ 5 · parlama (tarla) ═══
  const t5 = tableau('parlama', { x: X(5), floor: '#5A6A3A', floorR: 30, spots: [{ x: 2, h: 10, z: 4, tx: 0, I: 160, angle: 0.6, color: '#FFF0D8' }], fog: ['#B8C8D8', 0.02], bg: '#B8D0E6', hemi: ['#DDEBF5', '#5A6040', 1.0], env: 0.8 });
  const flashL = new THREE.PointLight(lin('#FFFFFF'), 0, 0, 0); flashL.position.set(-10, 30, -40); t5.g.add(flashL);
  const flashS = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(40, 38, 34), fog: false })); flashS.position.set(-12, 26, -60); t5.g.add(flashS);
  const y5 = character('yamaguchi', t5, null);

  // ═══ 6 · Nagazaki ofisi ═══
  const t6 = tableau('ofis', { x: X(6), floor: '#6A5A48', spots: [{ x: 0.5, h: 3.2, z: 1.5, tx: 0, I: 40, angle: 0.8, color: '#FFF0DC' }], fog: ['#141210', 0.04], hemi: ['#8A8070', '#2A2420', 0.6] });
  box(1.6, 0.06, 0.8, '#5A3E26', 0.6, 0.76, -0.6, t6.g); box(4, 2.8, 0.12, '#C8BCA8', 0, 1.4, -1.4, t6.g);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.6, 1.9) })); win.position.set(-0.9, 1.6, -1.33); t6.g.add(win);
  const flash6 = new THREE.PointLight(lin('#FFFFFF'), 0, 0, 0); flash6.position.set(-0.9, 1.6, -1.0); t6.g.add(flash6);
  const bossF = character(boss, t6, t => ({ pos: [0.8, 0.02, -1.05], rot: 0.2, pose: POSE.sit(), face: t > w('l08', 'beyaz') ? FACE.fear : { ...FACE.neutral, browTilt: -0.3 } }));
  const y6 = character('yamaguchiB', t6, null);

  // ═══ 7 · takvim ═══
  const t7 = tableau('takvim', { x: X(7), floor: '#2A2622', spots: [{ x: 0, h: 5, z: 3, tx: 0, I: 60, angle: 0.6, color: '#FFF0DC' }], fog: ['#0A0A0C', 0.04], hemi: ['#5A5A60', '#1A1612', 0.5] });
  const calC = document.createElement('canvas'); calC.width = 1024; calC.height = 768; const calG = calC.getContext('2d'), calTex = new THREE.CanvasTexture(calC); calTex.colorSpace = THREE.SRGBColorSpace;
  { const cal = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.65), new THREE.MeshStandardMaterial({ map: calTex, roughness: 0.7 })); cal.position.set(0, 1.45, -1.2); t7.g.add(cal); box(3, 3, 0.1, '#3A2E26', 0, 1.6, -1.3, t7.g); }
  let calK = -1;
  function drawCal(t) {
    const k = (t > w('l10', 'atom') ? 2 : 0) + (t > w('l10', 'üç') ? 1 : 0); if (k === calK) return; calK = k;
    const g = calG; g.fillStyle = '#F2EEE4'; g.fillRect(0, 0, 1024, 768); g.fillStyle = '#1A2A44'; g.fillRect(0, 0, 1024, 110); g.fillStyle = '#FFF'; g.font = '800 72px Archivo'; g.textAlign = 'center'; g.fillText('AĞUSTOS 1945', 512, 82);
    g.font = '700 56px Archivo';
    for (let d = 1; d <= 31; d++) { const c = (d + 1) % 7, r = Math.floor((d + 1) / 7); const x = 80 + c * 140, y = 200 + r * 120; g.fillStyle = '#2A2A2E'; g.fillText(String(d), x, y);
      if ((d === 6 && k >= 2) || (d === 9 && k >= 3)) { g.strokeStyle = '#C8141C'; g.lineWidth = 10; g.beginPath(); g.arc(x, y - 18, 52, 0, 7); g.stroke(); } }
    calTex.needsUpdate = true;
  }
  const v7 = character('violet', t7, () => ({ pos: [-1.3, 0, 0.3], rot: 0.5, pose: POSE.stand(), face: FACE.neutral }));
  const y7 = character('yamaguchiB', t7, t => ({ pos: [1.3, 0, 0.3], rot: -0.5, pose: POSE.stand(), face: t > hero(T) ? FACE.sad : FACE.neutral }));

  // ——— hareketler ———
  const set = (f, fn) => { f.act = fn; };
  set(v0, t => { const grab = seg(t, 1.4, 0.8); return { pos: [0.2, 0.05, -0.8], rot: 0.3 + 2.6 * ease.state(seg(t, 2.6, 0.7)) * (t < 5 ? 1 : 0), pose: t < 1.4 ? POSE.run((t * 1.2) % 1) : mixPose(POSE.crouch(), { ...POSE.stand(), rShoulder: [-1.2, 0, 0.3], rElbow: [-1.4, 0, 0] }, ease.state(grab)), face: FACE.determined }; });
  set(v2, t => ({ pos: [0, 0.2, 0.1], rot: -Math.PI / 2, pose: t > w('l03', 'uzattı') ? POSE.holdOut() : POSE.sit(), face: t > w('l03', 'uzattı') ? FACE.fear : FACE.sad }));
  set(v3, t => { const j = seg(t, w('l04', 'suya'), 0.7); return { pos: [lerp(0.3, 0.9, j), 0.3 + 1.0 * Math.sin(j * Math.PI) - 0.9 * j * j, lerp(0, 0.6, j)], rot: 0.6, pose: j > 0 ? POSE.armsUp() : POSE.stand(), face: FACE.fear }; });
  set(y4, t => { const back = seg(t, w('l06', 18) - 0.6, 0.6); return { pos: [0, 0, lerp(-1, 2.5, seg(t, T.l06, T.l06end - T.l06 + 0.5))], rot: lerp(Math.PI, 0, ease.state(back)), pose: POSE.walk((t * 0.9) % 1, 0.7), face: FACE.neutral }; });
  set(y5, t => { const blow = seg(t, w('l07', 'Yamaguçi'), 0.6); return { pos: [lerp(0, -1.2, ease.enter(blow)), 0.8 * Math.sin(blow * Math.PI), lerp(0, 0.8, blow)], rot: 0.4, rotX: -1.4 * ease.enter(blow), pose: blow > 0 ? POSE.fallBack() : { ...POSE.stand(), head: [-0.5, 0, 0] }, face: blow > 0 ? FACE.pain : { ...FACE.surprise, lookY: 1 } }; });
  set(y6, t => { const talk = 0.5 + 0.5 * Math.sin(t * 11); return { pos: [-0.5, 0, 0.1], rot: 0.6, pose: t > w('l08', 'beyaz') ? POSE.crouch() : { ...POSE.stand(), rShoulder: [-1.0, 0, 0.4 + 0.2 * Math.sin(t * 3)], rElbow: [-0.9, 0, 0] }, face: t > w('l08', 'beyaz') ? FACE.fear : { ...FACE.determined, open: 0.4 * talk } }; });

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.9, 1.4, 1.4), P(0, 0.1, 1.2, -0.8), 40];
  const cam = [
    [0, ...F0, null, 0.02],
    [0.6, P(0, 0.8, 1.38, 1.25), P(0, 0.1, 1.2, -0.8), 40, null, 0.02],
    [T.l01end, P(0, 0.6, 1.4, 0.9), P(0, 0.1, 1.3, -0.8), 36, null, 0.02],
    ...cut(T.l02 - 0.15, [P(0, 0.6, 1.4, 0.88), P(0, 0.1, 1.3, -0.8), 36], [P(1, 1.4, 1.6, 2.6), P(1, 0, 0.9, -0.3), 42]),
    [w('l02', 'gıcırtı'), P(1, 0.9, 1.3, 1.8), P(1, -0.1, 1.1, -0.2), 40],
    [T.l02end + 0.3, P(1, 0.6, 1.25, 1.3), P(1, -0.1, 1.15, -0.2), 36, null, 0.02],
    ...cut(T.l03 - 0.15, [P(1, 0.6, 1.25, 1.28), P(1, -0.1, 1.15, -0.2), 36], [P(2, 3.0, 4.6, 5.0), P(2, 0, 4.4, 0), 44]),
    [w('l03', 'bebek'), P(2, 1.8, 2.4, 3.0), P(2, -0.2, 1.4, 0.1), 42],
    [T.l03end + 0.4, P(2, 1.2, 1.6, 1.4), P(2, 0.0, 1.3, 0.1), 38, null, 0.02],
    ...cut(T.l04 - 0.15, [P(2, 1.2, 1.6, 1.38), P(2, 0.0, 1.3, 0.1), 38], [P(3, 4.5, 3.0, 9), P(3, -1.5, 1.6, -3), 46]),
    ...cut(w('l04', 'Bu') - 0.1, [P(3, 4.2, 2.8, 8.4), P(3, -1.5, 1.6, -3), 46], [P(0, 0.8, 1.5, 1.4), P(0, 0.1, 1.2, -0.8), 40]),
    ...cut(w('l04', 15) - 0.1, [P(0, 0.7, 1.5, 1.2), P(0, 0.1, 1.2, -0.8), 40], [P(3, 3.2, 2.0, 5.5), P(3, 0.3, 0.6, 0.8), 44]),
    [T.l04end + 0.3, P(3, 2.6, 1.6, 4.4), P(3, 0.6, 0.5, 0.8), 42],
    ...cut(T.l06 - 0.15, [P(3, 2.6, 1.6, 4.38), P(3, 0.6, 0.5, 0.8), 42], [P(4, 0.6, 1.6, 6.5), P(4, 0, 1.3, 0), 42]),
    [T.l06end + 0.3, P(4, 0.5, 1.6, 5.0), P(4, 0, 1.4, 2.0), 40],
    ...cut(T.l07 - 0.15, [P(4, 0.5, 1.6, 4.98), P(4, 0, 1.4, 2.0), 40], [P(5, 1.0, 1.4, 2.8), P(5, 0, 1.5, 0), 40]),
    [w('l07', 'parladı') + 0.6, P(5, 1.2, 1.6, 3.6), P(5, -0.5, 1.2, 0), 42],
    [T.l07end + 0.3, P(5, 0.3, 1.0, 2.4), P(5, -1.2, 0.3, 0.8), 40],
    ...cut(T.l08 - 0.15, [P(5, 0.3, 1.0, 2.38), P(5, -1.2, 0.3, 0.8), 40], [P(6, 1.2, 1.6, 3.2), P(6, 0, 1.2, -0.4), 42]),
    [w('l08', 'patronuna'), P(6, 0.8, 1.5, 2.4), P(6, 0.1, 1.2, -0.6), 40],
    [T.l08end + 0.4, P(6, 0.6, 1.4, 2.0), P(6, -0.3, 1.1, -0.3), 40],
    ...cut(T.l09 - 0.15, [P(6, 0.6, 1.4, 1.98), P(6, -0.3, 1.1, -0.3), 40], [P(7, 0, 1.7, 5.0), P(7, 0, 1.5, -0.4), 44]),
    [T.l10, P(7, 0, 1.6, 5.4), P(7, 0, 1.3, -0.6), 44],
    [hero(T), P(7, 0, 1.6, 4.6), P(7, 0, 1.35, -0.8), 44],
    [T.l11end + 0.6, P(7, 0, 1.8, 4.8), P(7, 0, 1.6, -0.6), 44],
    ...cut(T.loop0, [P(7, 0, 1.8, 4.82), P(7, 0, 1.6, -0.6), 44], [P(0, 1.1, 1.45, 1.75), P(0, 0.1, 1.2, -0.8), 40, null, 0.02]),
    [T.D - 0.6, P(0, 1.0, 1.42, 1.58), P(0, 0.1, 1.2, -0.8), 40, null, 0.02],
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l02', 'Hostes') - 0.1, T.l03 - 0.2, 'VIOLET JESSOP', 'Titanik · 1912 · 24 yaşında hostes'], [w('l06', 'Gemi') - 0.1, T.l07 - 0.2, 'TSUTOMU YAMAGUCHI', 'Gemi mühendisi · 29 yaşında']],
    numbers: [[w('l10', 'dört') - 0.1, w('l10', 'Yamaguçi') - 0.2, '4+ yıl', 'VIOLET · İKİ BATIŞ ARASI'], [w('l10', 'üç') - 0.1, T.l11 + 0.3, '3 gün', 'YAMAGUCHI · İKİ ATOM BOMBASI']],
    update(t) {
      for (const u of updates) u(t);
      lamp1.rotation.z = 0.35 * Math.sin(t * 2.2) * seg(t, w('l02', 'gıcırtı'), 0.3);
      lampC.material.color.setScalar(t > 1 ? 8 * (0.6 + 0.4 * Math.abs(Math.sin(t * 17))) : 8);
      water0.position.y = 0.1 + 0.5 * seg(t, 0, 4) + (t > T.l04 ? 0.6 : 0);
      tb0.visible = t > 2.2 || (t > T.l04 && t < T.l06);
      bb.visible = t > w('l03', 'uzattı');
      boat.position.set(0, lerp(4.2, 0.2, ease.state(seg(t, T.l03, T.l03end - T.l03))), 0);
      prop.rotation.x = t * 6;
      boat3.position.set(lerp(1.2, -0.6, seg(t, T.l04, T.l04end - T.l04)), 0, lerp(1.2, 1.6, seg(t, T.l04, T.l04end - T.l04)));
      foam.material.opacity = 0.8 * seg(t, w('l04', 'suya') + 0.5, 0.2) * (1 - seg(t, w('l04', 'suya') + 1.0, 1.0));
      const f1 = seg(t, w('l07', 'parladı') - 0.1, 0.12) * (1 - seg(t, w('l07', 'parladı') + 0.3, 1.5));
      flashL.intensity = 2e5 * f1; flashS.material.color.setScalar(40 * (0.2 + f1));
      const f2 = seg(t, w('l08', 'beyaz') - 0.1, 0.12) * (1 - seg(t, w('l08', 'beyaz') + 0.4, 1.4));
      flash6.intensity = 4000 * f2; win.material.color.setRGB(1.4 + 30 * f2, 1.6 + 30 * f2, 1.9 + 28 * f2);
      drawCal(t);
    },
  };
}

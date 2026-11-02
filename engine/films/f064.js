// № 064 · Damlayı hiç göremeyen adam ve 185 yıldır çalan çan (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: vitrin (huni, damla, Mainstone) · 1927 laboratuvar (Parnell, döküm, çekiç) · kamera (2000, karartma) ·
// boş sandalye · Oxford koridoru (çan) · saat (damla ve çan sayacı). Merkez an: kaçırılan damlalar ve karartma (l04–l06).

export const opts = { bloom: 0.6 };
export function hero(T) { return T.l10end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  const bell = []; for (let t = T.l07 + 0.5; t < T.l08end; t += 0.5) bell.push(t);
  return {
    tick: bell,
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    thock: [w('l02', 'paramparça'), w('l03', 'düştü'), w('l05', 'kesildi')],
    scratch: [[w('l10', 6), hero(T), 0.02]],
    riser: [w('l10', 6), hero(T)],
    impact: hero(T),
    silence: [T.l09end + 0.1, T.l10],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, lin, std, box, cyl, canvasTex, tableau, motes, character, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const _m = new THREE.Matrix4();
  const glass = new THREE.MeshPhysicalMaterial({ color: lin('#FFFFFF'), roughness: 0.05, transparent: true, opacity: 0.035, clearcoat: 0.2, envMapIntensity: 0.08, depthWrite: false });
  const pitchM = new THREE.MeshPhysicalMaterial({ color: lin('#0A0806'), roughness: 0.08, clearcoat: 1 });
  // huni + damla (dünyada yeniden kullanılan düzenek)
  function funnelRig(g, x, z) {
    const r = new THREE.Group(); r.position.set(x, 0, z); g.add(r);
    box(0.5, 0.9, 0.5, '#4A3A2E', 0, 0.45, 0, r); cyl(0.02, 0.02, 0.5, '#8A8A8E', 0, 1.15, 0, r);
    const fun = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.015, 0.22, 24, 1, true), glass); fun.position.y = 1.32; r.add(fun);
    const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.014, 0.2, 24), pitchM); fill.position.y = 1.32; r.add(fill);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.02, 20, 14), pitchM); r.add(drop);
    const beaker = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 20, 1, true), glass); beaker.position.y = 0.98; r.add(beaker);
    const pile = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), pitchM); pile.scale.y = 0.4; pile.position.y = 0.92; r.add(pile);
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.75, 24, 1, true), glass); dome.position.y = 1.27; r.add(dome);
    return { r, drop, setDrop(k, falling = 0) { const L = 0.02 + 0.09 * k; drop.scale.set(1, 1 + 4 * k, 1); drop.position.y = 1.2 - L - falling * 0.18; } };
  }

  // ═══ 0 · vitrin ve bekleyen adam ═══
  const t0 = tableau('vitrin', { x: X(0), floor: '#3A322A', spots: [{ x: 0.3, h: 2.8, z: 1.2, tx: 0.2, I: 22, angle: 0.7, color: '#FFE6C4' }], fog: ['#0C0A08', 0.05], hemi: ['#5A5040', '#1A1410', 0.5] });
  box(4, 2.8, 0.12, '#5A4A3A', 0, 1.4, -0.8, t0.g);
  const rig0 = funnelRig(t0.g, 0.5, -0.3);
  const chair = new THREE.Group(); chair.position.set(-0.55, 0, 0.2); chair.rotation.y = 0.9; t0.g.add(chair); box(0.45, 0.06, 0.45, '#6A4A2E', 0, 0.45, 0, chair); box(0.45, 0.5, 0.05, '#6A4A2E', 0, 0.72, -0.2, chair); for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(0.04, 0.45, 0.04, '#5A3E26', a, 0.22, b, chair);
  const mug = cyl(0.04, 0.035, 0.09, '#E8E2D6', 0.35, 0.95, -0.2, t0.g);
  const mstone = character('mainstone', t0, null);
  // 2000: kamera ve kayıt ışığı
  const camRig = new THREE.Group(); camRig.position.set(1.2, 0, 0.4); camRig.rotation.y = -0.8; t0.g.add(camRig);
  for (const a of [0, 2.1, 4.2]) { const l = cyl(0.01, 0.01, 1.2, '#2A2A2A', Math.cos(a) * 0.15, 0.6, Math.sin(a) * 0.15, camRig); l.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2); }
  box(0.14, 0.1, 0.2, '#1A1A1C', 0, 1.25, 0, camRig); const rec = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 0.4, 0.3) })); rec.position.set(0.05, 1.3, 0.1); camRig.add(rec);
  const room = t0.lights[0];

  // ═══ 1 · 1927 laboratuvarı ═══
  const t1 = tableau('lab', { x: X(1), floor: '#4A3E32', spots: [{ x: 0.5, h: 3.2, z: 1.5, tx: 0, I: 30, angle: 0.8, color: '#FFE2B8' }], fog: ['#100C08', 0.05], hemi: ['#6A5A48', '#1A120C', 0.6] });
  box(2.4, 0.9, 0.8, '#5A3E26', 0, 0.45, -0.4, t1.g); box(4, 2.8, 0.12, '#4A3E32', 0, 1.4, -1.2, t1.g);
  const rig1 = funnelRig(t1.g, 0.55, -0.4); rig1.r.children[0].visible = false; rig1.r.position.y = 0.0;
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.14, 16), std('#5A5A5E', { metalness: 0.7, roughness: 0.4 })); t1.g.add(pot);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 0.1, emissive: lin('#2A0A00') })); t1.g.add(stream);
  const block = box(0.25, 0.12, 0.2, pitchM, -0.5, 0.96, -0.3, t1.g);
  const bits = []; for (let i = 0; i < 10; i++) { const b = new THREE.Mesh(new THREE.TetrahedronGeometry(0.04), pitchM); t1.g.add(b); bits.push(b); }
  const parnell = character('parnell', t1, null);
  const hammer = new THREE.Group(); { const h = cyl(0.015, 0.018, 0.3, '#6B4A2E', 0, -0.15, 0, hammer); const hd = box(0.12, 0.05, 0.05, std('#3B3B3E', { metalness: 0.8 }), 0, -0.3, 0, hammer); } parnell.hand('r').add(hammer); hammer.position.set(0, -0.1, 0.03);

  // ═══ 2 · Oxford koridoru: çan ═══
  const t2 = tableau('oxford', { x: X(2), floor: '#5A5048', floorRough: 0.35, spots: [{ x: 0.4, h: 3, z: 1.5, tx: 0, I: 30, angle: 0.7, color: '#F2F0E8' }], fog: ['#0E0E10', 0.05], hemi: ['#7A7A80', '#2A2420', 0.6] });
  box(1.2, 1.0, 0.7, '#4A3626', 0, 0.5, -0.3, t2.g); box(4, 2.8, 0.12, '#8A7A68', 0, 1.4, -1.0, t2.g);
  const brass = std('#C9A24A', { metalness: 0.9, roughness: 0.25 });
  for (const s of [-1, 1]) { cyl(0.05, 0.05, 0.42, std('#5A5048', { roughness: 0.6 }), s * 0.12, 1.25, -0.3, t2.g); const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), brass); b.rotation.x = Math.PI; b.position.set(s * 0.12, 1.02, -0.3); t2.g.add(b); }
  const bilye = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 8), brass); t2.g.add(bilye);
  { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.65, 24, 1, true), glass); d.position.set(0, 1.33, -0.3); t2.g.add(d); const d2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.72, 24, 1, true), glass); d2.position.set(0, 1.36, -0.3); t2.g.add(d2); }
  const student = character({ ...CARDS.randy, top: '#3A4A6A', hairStyle: 'short', glasses: '#2A2A2A' }, t2, t => ({ pos: [0.7, 0, 0.6], rot: -2.2, pose: { ...POSE.stand(), spine: [0.35, 0, 0], neck: [0.2, 0, 0] }, face: { ...FACE.surprise, look: -0.4 } }));

  // ═══ 3 · saat: damla ve çan ═══
  const t3 = tableau('saat', { x: X(3), floor: '#2A2622', spots: [{ x: -0.6, h: 3, z: 1.5, tx: -0.6, I: 25, angle: 0.5 }, { x: 0.6, h: 3, z: 1.5, tx: 0.6, I: 25, angle: 0.5, color: '#FFE8C0' }], fog: ['#0A0A0C', 0.05], hemi: ['#4A4A50', '#141210', 0.5] });
  const rig3 = funnelRig(t3.g, -0.55, -0.2);
  const bilye3 = new THREE.Mesh(new THREE.SphereGeometry(0.01, 12, 8), brass); t3.g.add(bilye3);
  box(0.8, 0.9, 0.5, '#4A3626', 0.6, 0.45, -0.2, t3.g); for (const s of [-1, 1]) { cyl(0.05, 0.05, 0.42, std('#5A5048'), 0.6 + s * 0.12, 1.15, -0.2, t3.g); const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), brass); b.rotation.x = Math.PI; b.position.set(0.6 + s * 0.12, 0.92, -0.2); t3.g.add(b); }

  // ——— hareketler ———
  const set = (f, fn) => { f.act = fn; };
  const dead = w('l06', 'öldü');
  set(mstone, t => { const gone = t > dead - 0.2 && t < T.loop0; const miss = (t > w('l04', 'kaçırdı') - 1.0 && t < w('l04', 'kaçırdı') + 0.4) || (t > w('l04', 15) && t < T.l04end + 0.4); return { visible: !gone, pos: miss ? [-1.6, 0, 0.9] : [-0.55, 0.02, 0.2], rot: miss ? 2.6 : 0.9, pose: miss ? POSE.walk((t * 0.8) % 1, 0.6) : POSE.sit(), face: t > w('l05', 'Tam') && t < dead ? FACE.sad : { ...FACE.neutral, look: 0.5 } }; });
  set(parnell, t => { const pour = t < w('l02', 14); const sw = seg(t, w('l02', 'çekiçle') - 0.3, 0.4); return { pos: pour ? [0.2, 0, 0.1] : [-0.6, 0, 0.3], rot: pour ? -0.4 : 0.2, pose: pour ? { ...POSE.stand(), rShoulder: [-1.3, 0, 0.2], rElbow: [-0.6, 0, 0], lShoulder: [-0.9, 0, -0.1], lElbow: [-0.8, 0, 0] } : mixPose({ ...POSE.stand(), rShoulder: [-2.6, 0, 0.2], rElbow: [-0.4, 0, 0] }, { ...POSE.stand(), rShoulder: [-1.0, 0, 0.2], rElbow: [-0.2, 0, 0], spine: [0.3, 0, 0] }, ease.enter(sw)), face: FACE.determined }; });

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.25, 1.25, 2.5), P(0, -0.05, 1.0, -0.1), 42];
  const cam = [
    [0, ...F0, null, 0.02],
    [0.6, P(0, 0.22, 1.24, 2.2), P(0, -0.05, 1.0, -0.1), 42, null, 0.02],
    [T.l01end, P(0, 0.7, 1.2, 0.6), P(0, 0.5, 1.15, -0.3), 34, null, 0.006],      // huniye yakın: asılı damla
    ...cut(T.l02 - 0.15, [P(0, 0.7, 1.2, 0.58), P(0, 0.5, 1.15, -0.3), 34], [P(1, 0.9, 1.6, 2.6), P(1, 0.2, 1.2, -0.4), 42]),
    [w('l02', 14) - 0.1, P(1, 0.6, 1.6, 3.4), P(1, -0.4, 1.1, -0.1), 42],
    [T.l02end + 0.3, P(1, 0.4, 1.4, 2.6), P(1, -0.4, 1.0, -0.1), 40],
    [w('l03', 'İlk') - 0.2, P(1, 0.9, 1.3, 0.9), P(1, 0.55, 1.2, -0.4), 34, null, 0.006],
    ...cut(T.l04 - 0.15, [P(1, 0.9, 1.3, 0.88), P(1, 0.55, 1.2, -0.4), 34], [P(0, 0.4, 1.5, 2.8), P(0, 0, 1.1, -0.2), 42]),
    [w('l04', 'kaçırdı'), P(0, 0.2, 1.6, 3.2), P(0, -0.3, 1.0, 0), 44],
    [T.l04end + 0.3, P(0, 0.6, 1.3, 1.4), P(0, 0.5, 1.1, -0.3), 36],
    ...cut(T.l05 - 0.15, [P(0, 0.6, 1.3, 1.38), P(0, 0.5, 1.1, -0.3), 36], [P(0, 2.0, 1.4, 1.2), P(0, 0.6, 1.15, -0.2), 40]),
    [T.l05end + 0.6, P(0, 1.8, 1.4, 1.1), P(0, 0.6, 1.15, -0.2), 40],
    [T.l06 + 0.2, P(0, 0.2, 1.3, 2.4), P(0, -0.55, 0.7, 0.2), 40],
    [T.l06end + 0.6, P(0, 0.0, 1.2, 1.8), P(0, -0.55, 0.65, 0.2), 38, null, 0.02],
    ...cut(T.l07 - 0.15, [P(0, 0.0, 1.2, 1.78), P(0, -0.55, 0.65, 0.2), 38], [P(2, 0.9, 1.5, 2.6), P(2, 0.1, 1.2, -0.3), 42]),
    [w('l07', 'bilye') + 0.2, P(2, 0.12, 1.06, 0.5), P(2, 0, 1.02, -0.3), 30, null, 0.004],
    [T.l08end + 0.3, P(2, 0.6, 1.4, 1.8), P(2, 0.2, 1.2, -0.2), 40],
    ...cut(T.l09 - 0.15, [P(2, 0.6, 1.4, 1.78), P(2, 0.2, 1.2, -0.2), 40], [P(3, 0, 1.5, 2.6), P(3, 0, 1.1, -0.2), 42]),
    [T.l10, P(3, 0, 1.4, 2.3), P(3, 0, 1.1, -0.2), 42],
    [hero(T) + 0.3, P(3, 0, 1.3, 1.9), P(3, 0, 1.05, -0.2), 40],
    [T.l11end + 0.6, P(3, 0, 1.5, 2.6), P(3, 0, 1.1, -0.2), 42],
    ...cut(T.loop0, [P(3, 0, 1.5, 2.62), P(3, 0, 1.1, -0.2), 42], [P(0, 0.31, 1.27, 3.05), P(0, -0.05, 1.0, -0.1), 42, null, 0.02]),
    [T.D - 0.6, P(0, 0.28, 1.26, 2.8), P(0, -0.05, 1.0, -0.1), 42, null, 0.02],
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);
  const ringsAt = t => Math.round(Math.max(0, (t - w('l10', 6) + 0.1)) / (hero(T) - w('l10', 6) + 0.1) * 568e6);
  const fmt = n => Math.min(n, 568e6).toLocaleString('tr-TR');

  return {
    cam, cuts,
    names: [[w('l02', 'Profesör') - 0.1, T.l03 - 0.2, 'THOMAS PARNELL', 'Queensland Üniversitesi · 1927'], [w('l04', 'Con') - 0.1, w('l04', 'Bir') - 0.2, 'JOHN MAINSTONE', 'Deneyin bekçisi · 1961–2013'], [w('l07', 'cam') - 0.2, w('l07', 'iki') - 0.2, 'OXFORD ÇANI', '1840\'tan beri çalıyor']],
    numbers: [[w('l10', 'dokuz') - 0.1, w('l10', 6) - 0.25, '9 yıl', 'BİR ZİFT DAMLASI'], [w('l10', 6) - 0.1, T.l11 + 0.3, t => fmt(ringsAt(t)), 'ÇANIN VURUŞU']],
    update(t) {
      // vitrin: damla uzar; kaçırılan anlarda düşer; 2000'de karartma
      const miss1 = w('l04', 'kaçırdı') - 0.3, miss2 = w('l04', 15) + 0.2;
      const k = (t % 6) / 6 * 0.6 + 0.3;
      const f1 = clamp01((t - miss1) / 0.25), f2 = clamp01((t - miss2) / 0.25);
      rig0.setDrop(t > T.l04 && t < T.l05 ? Math.max(0.2, 0.8 - 0.6 * ((t > miss1) + (t > miss2)) * 0) : k, (t > miss1 && t < miss1 + 0.3 ? f1 : 0) + (t > miss2 && t < miss2 + 0.3 ? f2 : 0));
      const black = t > w('l05', 'Tam') && t < T.l06 ? 1 : 0;
      room.intensity = 2.5 * 22 * (1 - black); rec.visible = t > T.l05 - 0.5 && t < T.l06 && !black;
      camRig.visible = t > T.l05 - 0.5 && t < T.l06 + 0.2;
      // 1927: döküm, çekiç
      const pr = seg(t, w('l02', 'Profesör'), w('l02', 14) - w('l02', 'Profesör'));
      pot.position.set(0.42, 1.65, -0.3); pot.rotation.z = 1.2 * Math.min(1, pr * 3); pot.visible = t < w('l02', 14) + 0.3;
      stream.visible = pr > 0.15 && pr < 0.95; stream.scale.y = 0.35; stream.position.set(0.53, 1.45, -0.4);
      const hit = seg(t, w('l02', 'paramparça') - 0.1, 0.6); block.visible = hit <= 0;
      bits.forEach((b, i) => { const r = mulberry32(i + 2); b.visible = hit > 0; b.position.set(-0.5 + (r() - 0.5) * 0.6 * hit, 0.97 + 0.15 * Math.sin(hit * Math.PI) * r(), -0.3 + (r() - 0.5) * 0.4 * hit); b.rotation.set(hit * 6 * r(), hit * 4, 0); });
      rig1.setDrop(seg(t, T.l03, w('l03', 'düştü') - T.l03), t > w('l03', 'düştü') ? clamp01((t - w('l03', 'düştü')) / 0.3) : 0);
      // çan: bilye iki çan arasında 2 Hz gider gelir
      const ph = Math.sin(t * Math.PI * 2 * 2); bilye.position.set(0.1 * ph, 1.03, -0.3); bilye3.position.set(0.6 + 0.1 * ph, 0.93, -0.2);
      rig3.setDrop(0.3 + 0.6 * seg(t, T.l10, hero(T) - T.l10), t > hero(T) && t < T.loop0 ? clamp01((t - hero(T)) / 0.3) : 0);
    },
  };
}

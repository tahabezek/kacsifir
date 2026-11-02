// № 061 · Zamanı kaybeden adam ve yolunu kaybeden adam (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: merdiven (saat çıkar) · buzul mağarası (çadır, telefon, takvim) · çıkış (kayak gözlüğü) · Sahra (fırtına) ·
// türbe (yarasalar) · göçebe kız · harita. Merkez anlar: "daha 20 Ağustos" (l04), fırtına dinince bomboş ufuk (l06).

export const opts = { bloom: 0.55 };
export function hero(T) { return T.l09end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l05 - 0.3, T.l05 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.l08 - 0.3, T.l08 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l04', 'Oysa')],
    rumble: [[w('l05', 'kum') - 0.3, 0.5]],
    scratch: [[w('l05', 'kum'), T.l06 + 1.5, 0.06], [w('l09', 'Prosperi'), hero(T), 0.03]],
    riser: [w('l09', 'Prosperi'), hero(T)],
    impact: hero(T),
    silence: [T.l08end + 0.1, T.l09],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, D, lin, std, box, cyl, canvasTex, tableau, motes, character, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const updates = [];
  const _m = new THREE.Matrix4();
  const girl = { height: 1.25, headScale: 1.45, build: 0.8, skin: '#8A5A3A', hair: '#141210', hairStyle: 'bun', top: '#2A3A7A', dress: 'long', shoes: 'barefoot', sleeve: 'long' };
  const prosperiThin = { ...CARDS.prosperi, build: 0.82, beard: '#2A2018', hat: null };
  const iceM = new THREE.MeshPhysicalMaterial({ color: lin('#9CC4DC'), roughness: 0.15, clearcoat: 1, emissive: lin('#0E2632') });
  const sandM = std('#D9B07A', { roughness: 0.95 });

  // ═══ 0 · merdiven (karanlığa iniş) ═══
  const t0 = tableau('merdiven', { x: X(0), floor: '#1A1A1E', spots: [{ x: 0, h: 6, z: 0.5, tx: 0, I: 30, angle: 0.3, color: '#E8EEF6' }], fog: ['#05060A', 0.08], hemi: ['#3A4050', '#05060A', 0.3] });
  for (const x of [-0.25, 0.25]) cyl(0.012, 0.012, 8, '#B8A888', x, 4, -0.2, t0.g); for (let i = 0; i < 20; i++) box(0.5, 0.025, 0.04, '#6B4A2E', 0, i * 0.4 + 0.2, -0.2, t0.g);
  const s0 = character('siffre', t0, null);
  const watch = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 16), std('#C9C2B4', { metalness: 0.8 })); s0.hand('r').add(watch); watch.position.set(0, -0.12, 0.03);

  // ═══ 1 · buzul mağarası ═══
  const t1 = tableau('magara', { x: X(1), floor: '#3A4048', spots: [{ x: 0.4, h: 2.2, z: 0.8, tx: 0, I: 10, angle: 0.9, color: '#FFD9A0' }], fog: ['#06080C', 0.07], hemi: ['#2A3A4A', '#05070A', 0.35] });
  { const r = mulberry32(4); for (let i = 0; i < 9; i++) { const b = box(1.2 + r(), 3 + r() * 2, 0.8, iceM, -3 + i * 0.8, 1.5, -2.2 - r() * 0.5, t1.g); b.rotation.y = (r() - 0.5) * 0.4; } }
  { const tent = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 4, 1, true), std('#C8642A', { side: THREE.DoubleSide, roughness: 0.9 })); tent.position.set(-1.0, 0.7, -0.8); tent.rotation.y = Math.PI / 4; t1.g.add(tent); }
  box(0.25, 0.15, 0.18, '#2A2A2E', 0.7, 0.08, -0.3, t1.g);    // sahra telefonu
  const calC = document.createElement('canvas'); calC.width = 256; calC.height = 320; const calG = calC.getContext('2d'), calTex = new THREE.CanvasTexture(calC); calTex.colorSpace = THREE.SRGBColorSpace;
  { const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.52), new THREE.MeshStandardMaterial({ map: calTex, roughness: 0.8 })); cal.position.set(0.8, 1.5, -1.75); t1.g.add(cal); }
  let calKey = -1;
  const s1 = character('siffre', t1, null);
  motes(t1, 90, [1.8, 2.0, 2.3], 3, 3);

  // ═══ 2 · çıkış: gün ışığı, kayak gözlüğü ═══
  const t2 = tableau('cikis', { x: X(2), floor: '#8A8A80', spots: [{ x: 0, h: 8, z: 3, tx: 0, I: 260, angle: 0.5, color: '#FFFFFF' }], fog: ['#DDE6EE', 0.04], bg: '#DDE6EE', hemi: ['#FFFFFF', '#8A8A80', 1.4], env: 1.0 });
  const s2 = character({ ...CARDS.siffre, goggles: '#141414', hat: null, beard: '#2A1E16' }, t2, t => ({ pos: [0, 0, lerp(-1.5, 0.3, seg(t, T.l04 - 0.2, 2.5))], rot: 0, pose: POSE.walk((t * 0.6) % 1, 0.5), face: FACE.surprise }));

  // ═══ 3 · Sahra: koşu ve kum fırtınası ═══
  const t3 = tableau('sahra', { x: X(3), floorMat: sandM, floorR: 60, spots: [{ x: 6, h: 14, z: 6, tx: 0, I: 260, angle: 0.6, color: '#FFE8C0' }], fog: ['#E8C898', 0.02], bg: '#E8C898', hemi: ['#FFF0D8', '#B08A5A', 1.1], env: 0.8 });
  { const r = mulberry32(7); for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), sandM); d.scale.set(6 + r() * 8, 1.5 + r() * 2.5, 4 + r() * 6); d.position.set(-40 + r() * 80, 0, -12 - r() * 40); t3.g.add(d); } }
  const pro3 = character('prosperi', t3, null);
  const others = [[-2.5, -1.5], [-4, 0.8], [-6, -0.6]].map(([x, z], i) => character({ ...CARDS.prosperi, top: ['#C8642A', '#2A5A8A', '#3A6A3A'][i], hat: 'cap', hatColor: '#F2F2EE' }, t3, t => { const lost = seg(t, w('l05', 'kum'), 1.0); return { visible: t < w('l05', 'kum') + 0.8, pos: [x + 2 + 6 * seg(t, T.l05, T.l06 - T.l05) + (t - T.l05) * 0.2, 0, z], rot: Math.PI / 2, pose: POSE.run((t * 1.2 + i * 0.3) % 1), face: FACE.determined, scale: 1 - 0.0 * lost }; }));
  // kum duvarı: büyük, yarı saydam toz bulutları
  const dustM = new THREE.MeshStandardMaterial({ color: lin('#C89A62'), transparent: true, opacity: 0, depthWrite: false, roughness: 1 });
  const dust = []; { const r = mulberry32(9); for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), dustM); m.scale.setScalar(3 + r() * 6); m.userData = [(r() - 0.5) * 50, 1 + r() * 6, -10 - r() * 20]; t3.g.add(m); dust.push(m); } }

  // ═══ 4 · türbe ═══
  const t4 = tableau('turbe', { x: X(4), floorMat: sandM, floorR: 30, spots: [{ x: 3, h: 9, z: 4, tx: 0, I: 140, angle: 0.6, color: '#FFC890' }], fog: ['#B08A60', 0.025], bg: '#C8A070', hemi: ['#FFE0B8', '#8A6A4A', 0.9], env: 0.7 });
  { box(3, 2.4, 3, std('#E8E0D0', { roughness: 0.95 }), 0, 1.2, -2.2, t4.g); const dome = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#E8E0D0', { roughness: 0.95 })); dome.position.set(0, 2.4, -2.2); t4.g.add(dome);
    box(0.9, 1.6, 0.1, '#2A1E16', 0, 0.8, -0.69, t4.g); cyl(0.015, 0.015, 1.0, '#6B4A2E', 0.6, 4.3, -2.2, t4.g);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.33), new THREE.MeshStandardMaterial({ map: canvasTex(96, 64, (g) => { g.fillStyle = '#009246'; g.fillRect(0, 0, 32, 64); g.fillStyle = '#F1F2F1'; g.fillRect(32, 0, 32, 64); g.fillStyle = '#CE2B37'; g.fillRect(64, 0, 32, 64); }), side: THREE.DoubleSide })); fl.position.set(0.86, 4.6, -2.2); t4.g.add(fl); updates.push(t => { fl.rotation.y = 0.3 * Math.sin(t * 4); }); }
  const bats = new THREE.InstancedMesh(new THREE.ConeGeometry(0.05, 0.14, 6), std('#1A1412'), 12); bats.frustumCulled = false; t4.g.add(bats); for (let i = 0; i < 12; i++) { _m.makeRotationX(Math.PI); _m.setPosition(-0.9 + (i % 6) * 0.35, 2.15, -1.2 - Math.floor(i / 6) * 0.4); bats.setMatrixAt(i, _m); }
  const pro4 = character(prosperiThin, t4, t => ({ pos: [0.3, 0, -0.2], rot: 0.3, pose: POSE.sitHunched(), face: { ...FACE.sad, eyes: 0.5 } }));

  // ═══ 5 · göçebe kız ═══
  const t5 = tableau('kiz', { x: X(5), floorMat: sandM, floorR: 40, spots: [{ x: 4, h: 12, z: 5, tx: 0, I: 220, angle: 0.6, color: '#FFE8C0' }], fog: ['#E8C898', 0.02], bg: '#E8C898', hemi: ['#FFF0D8', '#B08A5A', 1.1], env: 0.8 });
  const kiz = character(girl, t5, null);
  const pro5 = character(prosperiThin, t5, t => ({ pos: [-1.6, 0, -0.4], rot: 1.0, pose: t > w('l07', 'kaçtı') ? POSE.kneel() : POSE.walk((t * 0.4) % 1, 0.5), face: FACE.sad }));
  const goats = (() => { const g = new THREE.Group(), m = std('#E8E0D0'), r = mulberry32(3); for (let i = 0; i < 5; i++) { const goat = new THREE.Group(); box(0.5, 0.25, 0.22, m, 0, 0.45, 0, goat); box(0.16, 0.16, 0.14, m, 0.3, 0.6, 0, goat); for (const [x, z] of [[-0.18, -0.08], [0.18, -0.08], [-0.18, 0.08], [0.18, 0.08]]) box(0.05, 0.35, 0.05, m, x, 0.17, z, goat); goat.position.set(1.4 + r() * 2, 0, -1 + r() * 2); goat.rotation.y = r() * 6; g.add(goat); } t5.g.add(g); return g; })();

  // ═══ 6 · harita ═══
  const t6 = tableau('harita', { x: X(6), floor: '#2A2622', spots: [{ x: 0, h: 4, z: 1.5, tx: 0, I: 40, angle: 0.6, color: '#FFF0DC' }], fog: ['#0A0A0C', 0.05], hemi: ['#4A4A50', '#141210', 0.5] });
  const mapC = document.createElement('canvas'); mapC.width = 1024; mapC.height = 768; const mapG = mapC.getContext('2d'), mapTex = new THREE.CanvasTexture(mapC); mapTex.colorSpace = THREE.SRGBColorSpace;
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.5), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.7 })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.78, 0); t6.g.add(m); box(2.2, 0.06, 1.7, '#5A3E26', 0, 0.74, 0, t6.g); for (const [x, z] of [[-1, -0.75], [1, -0.75], [-1, 0.75], [1, 0.75]]) box(0.06, 0.72, 0.06, '#4A3220', x, 0.36, z, t6.g); }
  let mapKey = -1;
  function drawMap(t) {
    const u = ease.state(seg(t, w('l09', 'Prosperi'), hero(T) - w('l09', 'Prosperi'))), k = Math.round(u * 60) + (t > w('l09', 'yirmi') ? 100 : 0); if (k === mapKey) return; mapKey = k;
    const g = mapG; g.fillStyle = '#E8D8B8'; g.fillRect(0, 0, 1024, 768); g.fillStyle = '#D9B07A'; g.fillRect(0, 0, 1024, 768); g.globalAlpha = 0.3; g.fillStyle = '#B88A5A'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse((i * 137) % 1024, (i * 251) % 768, 60, 20, 0.3, 0, 7); g.fill(); } g.globalAlpha = 1;
    g.strokeStyle = '#5A3A2A'; g.setLineDash([18, 12]); g.lineWidth = 6; g.beginPath(); g.moveTo(620, 0); g.lineTo(560, 300); g.lineTo(640, 768); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#5A3A2A'; g.font = '700 46px Archivo'; g.fillText('FAS', 200, 120); g.fillText('CEZAYİR', 720, 120);
    g.strokeStyle = '#2A6A3A'; g.lineWidth = 8; g.beginPath(); g.moveTo(180, 560); g.lineTo(420, 520); g.stroke();
    g.strokeStyle = '#C8141C'; g.lineWidth = 10; g.beginPath(); const x0 = 420, y0 = 520, x1 = 860, y1 = 330; g.moveTo(x0, y0); g.lineTo(lerp(x0, x1, u), lerp(y0, y1, u)); g.stroke();
    if (u > 0.99) { g.fillStyle = '#C8141C'; g.beginPath(); g.arc(x1, y1, 16, 0, 7); g.fill(); g.font = '800 54px Archivo'; g.fillText('291 km', 700, 280); }
    if (k >= 100) { g.fillStyle = '#F4F1EA'; g.fillRect(40, 40, 300, 200); g.fillStyle = '#1A1A1A'; g.font = '800 40px Archivo'; g.fillText('20 AĞU', 70, 110); g.fillStyle = '#C8141C'; g.fillText('14 EYL', 70, 180); g.strokeStyle = '#C8141C'; g.lineWidth = 5; g.beginPath(); g.moveTo(70, 100); g.lineTo(240, 100); g.stroke(); }
    mapTex.needsUpdate = true;
  }
  const s6 = character('siffre', t6, () => ({ pos: [-1.5, 0, -0.6], rot: 0.7, pose: POSE.stand(), face: FACE.neutral }));
  const p6 = character(prosperiThin, t6, () => ({ pos: [1.5, 0, -0.6], rot: -0.7, pose: POSE.stand(), face: FACE.neutral }));

  // ——— hareketler ———
  const set = (f, fn) => { f.act = fn; };
  set(s0, tq => { const t = tq >= T.loop0 ? tq - D : tq; const down = seg(t, 1.3, 2.2); return { pos: [0, 2.6 - 2.2 * ease.state(down), 0], rot: Math.PI, pose: t < 1.3 ? { ...POSE.stand(), rShoulder: [-1.2, 0, 0.2], rElbow: [-1.3, 0, 0], lShoulder: [-1.0, 0.3, -0.1], lElbow: [-1.2, 0, 0] } : POSE.climb((t * 0.8) % 1), face: FACE.determined }; });
  set(s1, t => { const phone = t > w('l03', 'Yukarıdaki') - 0.2; const shiver = 0.04 * Math.sin(t * 40); return { pos: [phone ? 0.55 : -0.4, 0.02, phone ? -0.05 : -0.2], rot: phone ? 0.4 : 0.2, pose: phone ? { ...POSE.phone(), spine: [0.1, 0, shiver] } : { ...POSE.sitHunched(), spine: [0.45, 0, shiver] }, face: t > w('l04', 'Oysa') ? FACE.surprise : FACE.sad }; });
  set(pro3, t => { const storm = seg(t, w('l05', 'kum'), 1.2); return { visible: true, pos: [lerp(2, 8, seg(t, T.l05, T.l06 - T.l05)), 0, 0.3], rot: Math.PI / 2 - storm * 0.6, pose: t > T.l06 ? POSE.stand() : POSE.run((t * 1.2) % 1), face: t > T.l06 ? { ...FACE.fear, look: 0.8 } : FACE.determined }; });
  set(kiz, t => { const run = seg(t, w('l07', 'korkuyla') - 0.1, 1.2); return { pos: [lerp(0.8, 3.6, run), 0, lerp(0.2, -1.4, run)], rot: run > 0 ? -2.2 : -1.6, pose: run > 0 ? POSE.run((t * 1.6) % 1) : POSE.stand(), face: run > 0 ? FACE.fear : FACE.surprise }; });

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.75, 4.15, 1.3), P(0, 0, 3.95, -0.1), 40];
  const cam = [
    [0, ...F0, null, 0.02],
    [0.6, P(0, 0.66, 4.12, 1.14), P(0, 0, 3.95, -0.1), 40, null, 0.02],
    [T.l01end, P(0, 0.4, 2.6, 2.6), P(0, 0, 1.6, 0), 44],
    ...cut(T.l02 - 0.15, [P(0, 0.3, 1.2, 2.58), P(0, 0, 1.0, 0), 44], [P(1, 0.8, 1.4, 2.8), P(1, -0.3, 0.9, -0.6), 42]),
    [T.l02end, P(1, 0.5, 1.2, 2.0), P(1, -0.3, 0.9, -0.4), 40],
    [w('l03', 'Yukarıdaki') - 0.2, P(1, 1.4, 1.3, 1.4), P(1, 0.6, 1.2, -0.2), 40],
    [w('l04', 'Oysa') - 0.3, P(1, 1.1, 1.45, 0.5), P(1, 0.8, 1.45, -1.75), 38, null, 0.01],        // takvim: 20 Ağustos
    ...cut(w('l04', 'Oysa') - 0.1, [P(1, 1.1, 1.45, 0.49), P(1, 0.8, 1.45, -1.75), 38], [P(2, 0, 1.6, 4.0), P(2, 0, 1.4, 0), 42]),
    [T.l04end + 0.5, P(2, 0, 1.7, 2.4), P(2, 0, 1.65, 0), 38, null, 0.02],
    ...cut(T.l05 - 0.15, [P(2, 0, 1.7, 2.38), P(2, 0, 1.65, 0), 38], [P(3, 0.5, 1.6, 6.0), P(3, 0.5, 1.2, 0), 44]),
    [w('l05', 'kum'), P(3, 10, 2.0, 6.0), P(3, 6, 1.6, -4), 46],
    [T.l05end + 0.3, P(3, 8, 1.6, 4.0), P(3, 7, 1.4, 0), 42],
    [w('l06', 'Kendi') - 0.3, P(3, 9, 2.6, 6.5), P(3, 6, 1.0, -4), 46],
    ...cut(w('l06', 'Kendi') - 0.1, [P(3, 9, 2.6, 6.48), P(3, 6, 1.0, -4), 46], [P(4, 2.4, 2.4, 6.0), P(4, 0, 2.2, -2), 44]),
    [w('l06', 'yarasaları') - 0.2, P(4, 1.0, 0.75, 1.4), P(4, 0.3, 0.75, -0.2), 40],
    ...cut(T.l07 - 0.15, [P(4, 1.0, 0.75, 1.38), P(4, 0.3, 0.75, -0.2), 40], [P(5, -0.3, 1.6, 6.5), P(5, -0.2, 0.9, -0.2), 46]),
    [T.l07end + 0.3, P(5, -1.0, 1.4, 2.6), P(5, -1.6, 0.8, -0.4), 40],
    ...cut(T.l08 - 0.15, [P(5, -1.0, 1.4, 2.58), P(5, -1.6, 0.8, -0.4), 40], [P(6, 0, 2.6, 3.4), P(6, 0, 0.9, -0.2), 44]),
    [T.l09, P(6, 0, 2.6, 2.6), P(6, 0, 0.85, 0), 44],
    [hero(T) + 0.2, P(6, 0, 2.3, 1.4), P(6, 0, 0.8, 0), 44],
    [T.l10end + 0.6, P(6, 0, 2.6, 3.0), P(6, 0, 0.9, -0.2), 44],
    ...cut(T.loop0, [P(6, 0, 2.6, 3.02), P(6, 0, 0.9, -0.2), 44], [P(0, 0.9, 4.2, 1.65), P(0, 0, 3.95, -0.1), 40, null, 0.02]),
    [T.D - 0.6, P(0, 0.84, 4.18, 1.48), P(0, 0, 3.95, -0.1), 40, null, 0.02],
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l02', 'Fransız') - 0.1, T.l03 - 0.2, 'MICHEL SIFFRE', 'Scarasson mağarası · 1962 · 23 yaşında'], [w('l05', 'İtalyan') - 0.1, w('l05', 'Kırk') - 0.2, 'MAURO PROSPERI', 'Marathon des Sables · 1994']],
    numbers: [[w('l03', 'otuz') - 0.1, w('l03', 'Yukarıdaki') - 0.2, '34 °C', 'VÜCUT SICAKLIĞI'], [w('l09', 'yirmi') - 0.1, w('l09', 'Prosperi') - 0.25, '25 gün', 'SIFFRE · KAYBOLAN ZAMAN'], [w('l09', 'iki') - 0.1, T.l10 + 0.3, '291 km', 'PROSPERI · ROTADAN SAPMA']],
    update(t) {
      for (const u of updates) u(t);
      const day = t > w('l04', 'Oysa') ? 1 : 0; if (day !== calKey) { calKey = day; calG.fillStyle = '#F2EEE4'; calG.fillRect(0, 0, 256, 320); calG.fillStyle = '#2A4A6A'; calG.fillRect(0, 0, 256, 70); calG.fillStyle = '#FFF'; calG.font = '800 40px Archivo'; calG.textAlign = 'center'; calG.fillText('AĞUSTOS', 128, 50); calG.fillStyle = '#1A1A1A'; calG.font = '800 130px Archivo'; calG.fillText('20', 128, 230); if (day) { calG.strokeStyle = '#C8141C'; calG.lineWidth = 12; calG.beginPath(); calG.moveTo(40, 110); calG.lineTo(216, 270); calG.stroke(); } calTex.needsUpdate = true; }
      const st = seg(t, w('l05', 'kum') - 0.6, 1.4) * (1 - seg(t, w('l06', 'dindiğinde') + 0.2, 1.5)); dustM.opacity = 0.75 * st;
      dust.forEach((m, i) => { const [x, y, z] = m.userData; m.position.set(x + 20 - 25 * st, y, z + 12 * st); });
      drawMap(t);
    },
  };
}

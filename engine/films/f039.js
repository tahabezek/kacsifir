// № 039 · Türünün son üyesi ve türünü kurtaran baba (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: ağıl (sabah; Fausto ve George) · Pinta (yeşilden kahverengiye, keçiler) · çıplak kayalık (tek kaplumbağa) ·
// bekleme (ödül tabelası, açılmayan yumurtalar) · Española (14 kaplumbağa) · hayvanat bahçesi (Diego, yavrular) ·
// dönüş (kumsal, kalabalık ada) · soy ağacı (George'un dalı boş, Diego'nunki 800'ü aşkın yaprakla dolar).

export const opts = { bloom: 0.55, bloomThreshold: 0.9 };
export function hero(T) { return T.l10end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l03 - 0.3, T.l03 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l05 - 0.3, T.l05 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.l08 - 0.3, T.l08 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l02', 'keçi'), w('l04', 'açılmadı')],
    rumble: [[0.5, 0.2]],
    thock: [w('l05', 'gitmişti')],
    scratch: [[w('l10', 6) - 0.2, hero(T), 0.02]],
    riser: [w('l10', 6) - 0.2, hero(T)],
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
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
  const fisher = { height: 1.7, heads: 7.2, build: 1.0, skin: '#B88A66', hair: '#2A1E16', hairStyle: 'short', beard: '#2A1E16', top: '#C8B898', bottom: '#4A4A3A', hat: 'straw', hatColor: '#C8B080', shoes: 'barefoot', legs: 'pants' };

  // ——— kaplumbağa (tek model; baş +z; eyer kabuk önden kalkık) ———
  const shellTex = (base, line) => canvasTex(512, 256, (g, W, H) => { g.fillStyle = base; g.fillRect(0, 0, W, H); g.strokeStyle = line; g.lineWidth = 7; const r = mulberry32(base.length * 7); for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const cx = (i + 0.5 + (row % 2) * 0.5) * W / 6, cy = (row + 0.5) * H / 3, R = 38 + r() * 6; g.beginPath(); for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI * 2; g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.8); } g.stroke(); g.lineWidth = 2; for (let k = 1; k < 4; k++) { g.beginPath(); for (let j = 0; j <= 6; j++) { const a = j / 6 * Math.PI * 2; g.lineTo(cx + Math.cos(a) * R * k / 4, cy + Math.sin(a) * R * 0.8 * k / 4); } g.stroke(); } g.lineWidth = 7; } });
  function tortoise(parent, o = {}) {
    const L = o.len ?? 1.0, g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const skin = std(o.skin ?? '#5A5248', { roughness: 0.9 });
    const geo = new THREE.SphereGeometry(0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const front = clamp01((z - 0.1) / 0.4); y = y * (1 - 0.35 * front) + front * front * 0.16 * (y > 0.02 ? 1 : 0.3); p.setXYZ(i, x * 0.88, y * 1.05, z * 1.15); }
    geo.computeVertexNormals();
    const shell = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: shellTex(o.shell ?? '#4A4034', o.line ?? '#2A241C'), roughness: 0.75 })); shell.scale.setScalar(L); shell.position.y = 0.22 * L; shell.castShadow = true; body.add(shell);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.44 * L, 0.46 * L, 0.05 * L, 32), std(o.shell ?? '#4A4034')); rim.scale.z = 1.3; rim.position.y = 0.22 * L; body.add(rim);
    const legs = []; for (const [x, z] of [[-0.3, 0.38], [0.3, 0.38], [-0.32, -0.38], [0.32, -0.38]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * L, 0.09 * L, 0.26 * L, 12).translate(0, -0.13 * L, 0), skin); const h = new THREE.Group(); h.position.set(x * L, 0.26 * L, z * L); h.add(l); body.add(h); legs.push(h); }
    const nl = o.neck ?? 0.55, segs = [], neckRoot = new THREE.Group(); neckRoot.position.set(0, 0.3 * L, 0.52 * L); body.add(neckRoot);
    let par = neckRoot; for (let i = 0; i < 3; i++) { const s = new THREE.Group(); s.position.z = i ? nl * L / 3 : 0; const m = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * L, 0.07 * L, nl * L / 3, 12).rotateX(Math.PI / 2).translate(0, 0, nl * L / 6), skin); s.add(m); par.add(s); segs.push(s); par = s; }
    const head = new THREE.Group(); head.position.z = nl * L / 3; par.add(head);
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.085 * L, 16, 12), skin); hm.scale.set(0.9, 0.85, 1.35); hm.position.z = 0.07 * L; head.add(hm);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.016 * L, 10, 8), std('#0A0A08', { roughness: 0.15 })); e.position.set(s * 0.06 * L, 0.025 * L, 0.1 * L); head.add(e); }
    parent.add(g);
    return { g, head, segs, legs,
      set({ walk = 0, ph = 0, reach = 0, droop = 0, lift = 0 } = {}) {
        legs.forEach((l, i) => { l.rotation.x = walk * 0.4 * Math.sin(ph * Math.PI * 2 + (i === 0 || i === 3 ? 0 : Math.PI)); });
        segs[0].rotation.x = -0.5 * lift + 0.55 * droop - 0.15 * reach; segs[1].rotation.x = -0.3 * lift + 0.35 * droop; segs[2].rotation.x = 0.2 * lift + 0.25 * droop; head.rotation.x = 0.4 * lift - 0.2 * droop;
        const s = 1 + 0.35 * reach; segs.forEach(sg => { sg.scale.z = s; }); body.position.y = 0.012 * walk * Math.abs(Math.sin(ph * Math.PI * 2)) - 0.08 * L * droop;
      } };
  }
  // sürü: yarım küre + baş (instanced); n tane, görünür sayısı zamanla
  function herd(parent, n, pts, color, size) {
    const shell = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(color, { roughness: 0.8 }), n), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), std('#5A5248'), n);
    shell.frustumCulled = head.frustumCulled = false; parent.add(shell, head);
    return k => { for (let i = 0; i < n; i++) { const [x, z, a, s0] = pts[i], s = i < k ? s0 * size : 0; _q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a); _s.set(s * 0.9, s * 0.6, s * 1.15); _p.set(x, 0, z); _m.compose(_p, _q, _s); shell.setMatrixAt(i, _m); _s.setScalar(s); _p.set(x + Math.sin(a) * 0.62 * s, 0.18 * s, z + Math.cos(a) * 0.62 * s); _m.compose(_p, _q, _s); head.setMatrixAt(i, _m); } shell.instanceMatrix.needsUpdate = head.instanceMatrix.needsUpdate = true; };
  }

  // ═══ 0 · ağıl: sabah ═══
  const t0 = tableau('agil', { x: X(0), floor: '#8A7A5A', floorR: 12, spots: [{ x: -4, h: 5, z: 3, tx: 0, I: 120, angle: 0.6, color: '#FFD8A0' }], fog: ['#C8B494', 0.06], bg: '#D8C4A0', hemi: ['#F2DCB8', '#4A3E2E', 0.9], env: 0.6 });
  { for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.3; cyl(0.05, 0.05, 1.0, '#6A5038', Math.sin(a) * 3.2, 0.5, -Math.cos(a) * 3.2 + 0.8, t0.g); } for (let i = 0; i < 8; i++) { const a = -1.05 + i * 0.3; const r = box(0.95, 0.06, 0.04, '#7A5E40', Math.sin(a) * 3.2, 0.7, -Math.cos(a) * 3.2 + 0.8, t0.g); r.rotation.y = -a; } const pud = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshStandardMaterial({ color: lin('#6A7A80'), roughness: 0.05, metalness: 0.4 })); pud.rotation.x = -Math.PI / 2; pud.position.set(0.95, 0.012, 0.55); pud.scale.y = 0.7; t0.g.add(pud); }
  const geo0 = tortoise(t0.g, { shell: '#5A4E3E' }); geo0.g.position.set(0, 0, 0); geo0.g.rotation.y = 1.0; geo0.set({ reach: 1, droop: 1.2 });
  const faus0 = character('fausto', t0, t => { const u = seg(t, T.l05 + 0.2, w('l05', 'fausto') - T.l05 - 0.2); const late = t > T.l05 - 0.2 && t < T.l06; return late ? { pos: [lerp(-1.9, -0.75, ease.state(u)), 0, lerp(-0.3, 0.6, ease.state(u))], rot: lerp(0.8, 1.2, u), pose: u < 1 ? POSE.walk((t * 0.6) % 1, 0.5) : { ...POSE.kneel(), rShoulder: [-0.9, 0, 0.2], rElbow: [-0.4, 0, 0], head: [0.4, 0, 0] }, face: u < 1 ? FACE.neutral : FACE.sad } : t < T.l02 ? { pos: [-0.8, 0, 0.7], rot: 1.2, pose: { ...POSE.kneel(), rShoulder: [-0.9, 0, 0.2], head: [0.4, 0, 0] }, face: FACE.sad } : t >= T.loop0 ? { pos: [-0.8, 0, 0.7], rot: 1.2, pose: { ...POSE.kneel(), rShoulder: [-0.9, 0, 0.2], head: [0.4, 0, 0] }, face: FACE.sad } : null; });
  motes(t0, 70, [1.0, 0.9, 0.7], 3, 2.5);

  // ═══ 1 · Pinta: keçiler ═══
  const t1 = tableau('pinta', { x: X(1), floor: null, spots: [{ x: 20, h: 40, z: 30, tx: 0, I: 700, angle: 0.6, color: '#FFF0D8' }], fog: ['#B8D0DC', 0.008], bg: '#B8D0DC', hemi: ['#E8F2F8', '#4A5A3A', 1.1], env: 0.8 });
  { const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: lin('#2A6A8A'), roughness: 0.15, metalness: 0.3 })); sea.rotation.x = -Math.PI / 2; t1.g.add(sea); }
  const islM = new THREE.MeshStandardMaterial({ color: lin('#4A7A3A'), roughness: 0.95, flatShading: true });
  { const isl = new THREE.Mesh(new THREE.SphereGeometry(30, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), islM); isl.scale.y = 0.32; isl.position.set(0, -0.5, -40); t1.g.add(isl); const p = isl.geometry.attributes.position, r = mulberry32(9); for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * (0.85 + r() * 0.3)); isl.geometry.computeVertexNormals(); }
  const green = new THREE.Color(lin('#4A7A3A')), brown = new THREE.Color(lin('#8A6A44'));
  const NG = 500, gPts = []; { const r = mulberry32(13); for (let i = 0; i < NG; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 24; const x = Math.cos(a) * d, z = -40 + Math.sin(a) * d * 0.8; const h = -0.5 + 9.6 * Math.max(0, 1 - (d / 30) ** 2) ** 0.5 * 1.0; gPts.push([x, h, z, r() * 6.28]); } }
  const goatIM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.35, 0.25), std('#F2EEE6'), NG); goatIM.frustumCulled = false; t1.g.add(goatIM);
  const goatN = t => t < w('l02', 'keçi') ? 0 : t < w('l02', 'keçiler') ? 3 : Math.round(3 + (NG - 3) * ease.enter(seg(t, w('l02', 'keçiler'), T.l02end - w('l02', 'keçiler'))));
  updates.push(t => { const k = goatN(t); gPts.forEach(([x, h, z, a], i) => { const s = i < k ? 1 : 0; _q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a + t * 0.1); _s.setScalar(s * 1.6); _p.set(x, h + 0.3, z); _m.compose(_p, _q, _s); goatIM.setMatrixAt(i, _m); }); goatIM.instanceMatrix.needsUpdate = true; islM.color.copy(green).lerp(brown, ease.state(seg(t, w('l02', 'keçiler'), T.l02end + 0.5 - w('l02', 'keçiler')))); });
  { const boat = new THREE.Group(); box(1.2, 0.35, 3.2, '#8A5A3A', 0, 0.2, 0, boat); boat.position.set(-3, 0, -12); boat.rotation.y = 0.4; t1.g.add(boat); }
  const fish1 = character(fisher, t1, () => ({ pos: [-3.2, 0.37, -11.6], rot: 0.4, pose: { ...POSE.stand(), rShoulder: [-1.2, 0, 0.3] }, face: FACE.neutral }));

  // ═══ 2 · çıplak kayalık ═══
  const t2 = tableau('kayalik', { x: X(2), floor: '#7A6A54', floorR: 30, spots: [{ x: 6, h: 14, z: 8, tx: 0, I: 300, angle: 0.6, color: '#FFE8C8' }], fog: ['#C8B8A0', 0.03], bg: '#C8B8A0', hemi: ['#F2E6D0', '#4A3E30', 1.0], env: 0.6 });
  { const r = mulberry32(22); for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + r() * 1.2, 0), std(['#6A5A48', '#5A4A3A', '#7A6A58'][i % 3], { flatShading: true })); s.position.set((r() - 0.5) * 30, 0, -4 - r() * 20); s.scale.y = 0.6; t2.g.add(s); } for (let i = 0; i < 20; i++) { const b = cyl(0.01, 0.02, 0.5, '#5A4A3A', (r() - 0.5) * 8, 0.25, (r() - 0.5) * 6, t2.g); b.rotation.z = (r() - 0.5) * 0.8; } }
  const geo2 = tortoise(t2.g, { shell: '#5A4E3E' });
  updates.push(t => { const u = seg(t, T.l03 - 0.3, T.l03end - T.l03 + 0.6); geo2.g.position.set(lerp(-1.2, 1.0, u), 0, lerp(0.6, -0.4, u)); geo2.g.rotation.y = 1.8; geo2.set({ walk: 1, ph: t * 0.45, lift: t > w('l03', 'türünün') ? 0.6 : 0.2 }); });

  // ═══ 3 · bekleme: ödül, yumurtalar ═══
  const t3 = tableau('bekleme', { x: X(3), floor: '#9A8A68', floorR: 10, spots: [{ x: 2, h: 6, z: 4, tx: 0, I: 120, angle: 0.6, color: '#FFE8C8' }], fog: ['#3A3428', 0.05], hemi: ['#C8B894', '#2A241A', 0.8] });
  { const c = canvasTex(512, 320, (g, W, H) => { g.fillStyle = '#F2EAD2'; g.fillRect(0, 0, W, H); g.strokeStyle = '#3A2A1A'; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, H - 20); g.fillStyle = '#8A2A1E'; g.textAlign = 'center'; g.font = '800 60px Archivo'; g.fillText('ÖDÜL', W / 2, 100); g.fillStyle = '#2A1E14'; g.font = '800 76px Archivo'; g.fillText('10.000 $', W / 2, 190); g.font = '600 34px Archivo'; g.fillText('Pinta dişisi aranıyor', W / 2, 260); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.75), new THREE.MeshStandardMaterial({ map: c, roughness: 0.8 })); m.position.set(-0.9, 1.55, -1.6); t3.g.add(m); cyl(0.04, 0.04, 1.6, '#5A4030', -0.9, 0.8, -1.65, t3.g); box(6, 1.0, 0.1, '#7A5E40', 0, 0.5, -1.9, t3.g); }
  const geo3 = tortoise(t3.g, { shell: '#5A4E3E' }); geo3.g.position.set(0.2, 0, 0.1); geo3.g.rotation.y = -0.5; geo3.set({ lift: 0.4 });
  const fem = [[-1.4, -0.6, 0.6, '#6A5A44'], [1.6, -0.9, -0.9, '#4E4A42']].map(([x, z, r, c]) => { const f = tortoise(t3.g, { shell: c, len: 0.85, neck: 0.4 }); f.g.position.set(x, 0, z); f.g.rotation.y = r; f.set({}); return f; });
  const eggs = []; { const r = mulberry32(33); for (let i = 0; i < 9; i++) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), new THREE.MeshStandardMaterial({ color: lin('#D8D0BC'), roughness: 0.7 })); e.scale.y = 1.25; e.position.set(1.1 + (r() - 0.5) * 0.5, 0.05, 0.9 + (r() - 0.5) * 0.4); t3.g.add(e); eggs.push(e); } }
  updates.push(t => { const d = seg(t, w('l04', 'açılmadı') - 0.2, 1.2); eggs.forEach(e => e.material.color.setRGB(lerp(0.68, 0.3, d), lerp(0.63, 0.28, d), lerp(0.5, 0.24, d))); });

  // ═══ 4 · Española ═══
  const t4 = tableau('espanola', { x: X(4), floor: '#B8A47A', floorR: 40, spots: [{ x: 8, h: 18, z: 10, tx: 0, I: 400, angle: 0.7, color: '#FFF0D8' }], fog: ['#C8D8E0', 0.025], bg: '#C8D8E0', hemi: ['#F2F2EE', '#5A4A34', 1.1], env: 0.7 });
  { const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: lin('#2A7A9A'), roughness: 0.12, metalness: 0.3 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.03, -110); t4.g.add(sea); }
  const pts14 = []; { const r = mulberry32(44); for (let i = 0; i < 14; i++) pts14.push([(r() - 0.5) * 22, -2 - r() * 14, r() * 6.28, 0.9 + r() * 0.2]); }
  const herd4 = herd(t4.g, 14, pts14, '#2A2622', 1.0);
  updates.push(t => herd4(t > T.l06 - 0.2 ? 14 : 0));

  // ═══ 5 · hayvanat bahçesi: Diego ve yavrular ═══
  const t5 = tableau('zoo', { x: X(5), floor: '#7A6A4A', floorR: 14, spots: [{ x: 2, h: 8, z: 5, tx: 0, I: 160, angle: 0.6, color: '#FFF0D8' }], fog: ['#2A2A22', 0.04], bg: '#8AA0A8', hemi: ['#D8E2E6', '#3A3424', 1.0], env: 0.6 });
  { for (let i = 0; i < 14; i++) cyl(0.03, 0.03, 1.1, '#3A3A3E', -3.5 + i * 0.55, 0.55, -2.2, t5.g); box(7.5, 0.04, 0.04, '#3A3A3E', 0.1, 1.05, -2.2, t5.g); box(7.5, 0.04, 0.04, '#3A3A3E', 0.1, 0.5, -2.2, t5.g); const pal = new THREE.Group(); cyl(0.14, 0.2, 5, '#7A6A4A', 0, 2.5, 0, pal); for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.25, 2.2, 4), std('#3A6A2E', { flatShading: true })); l.position.y = 5; l.rotation.set(1.1, i * 0.9, 0); pal.add(l); } pal.position.set(-2.6, 0, -3.2); t5.g.add(pal); }
  const diego5 = tortoise(t5.g, { shell: '#1E1C1A', line: '#0A0A0A', neck: 0.9, skin: '#4A4640' }); diego5.g.position.set(0, 0, -0.4); diego5.g.rotation.y = -0.5;
  updates.push(t => diego5.set({ reach: seg(t, w('l07', 'diego') - 0.6, 0.8), lift: 1.0 * seg(t, w('l07', 'diego') - 0.6, 0.8) }));
  const NB = 260, babyPts = []; { const r = mulberry32(55); for (let i = 0; i < NB; i++) { const a = r() * 6.28, d = 0.8 + Math.sqrt(r()) * 4.2; babyPts.push([Math.cos(a) * d, Math.sin(a) * d * 0.6 + 0.6, r() * 6.28, 0.7 + r() * 0.5]); } }
  const herd5 = herd(t5.g, NB, babyPts, '#3A3430', 0.22);
  updates.push(t => herd5(Math.round(NB * ease.enter(seg(t, w('l07', 13) - 0.2, T.l07end + 0.5 - w('l07', 13))))));

  // ═══ 6 · dönüş: kumsal ═══
  const t6 = tableau('donus', { x: X(6), floor: '#D8C8A0', floorR: 40, spots: [{ x: -6, h: 14, z: 8, tx: 0, I: 360, angle: 0.7, color: '#FFE2B8' }], fog: ['#D8E2E6', 0.02], bg: '#D8E2E6', hemi: ['#F8F2E6', '#6A5A40', 1.1], env: 0.7 });
  { const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: lin('#2A8AA8'), roughness: 0.1, metalness: 0.3 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.03, 104); t6.g.add(sea); const r = mulberry32(66); for (let i = 0; i < 30; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + r() * 0.8, 0), std(['#3A6A2E', '#4A7A34'][i % 2], { flatShading: true })); b.position.set((r() - 0.5) * 40, 0.2, -8 - r() * 16); t6.g.add(b); } }
  const diego6 = tortoise(t6.g, { shell: '#1E1C1A', line: '#0A0A0A', neck: 0.9, skin: '#4A4640' });
  updates.push(t => { const u = seg(t, T.l08 - 0.3, T.l08end + 0.8 - T.l08); diego6.g.position.set(0, 0, lerp(3.0, -1.2, u)); diego6.g.rotation.y = Math.PI; diego6.set({ walk: 1, ph: t * 0.5, lift: 0.5 }); });
  const pts2k = []; { const r = mulberry32(77); for (let i = 0; i < 600; i++) pts2k.push([(r() - 0.5) * 50, -3 - r() * 30, r() * 6.28, 0.6 + r() * 0.6]); }
  const herd6 = herd(t6.g, 600, pts2k, '#2A2622', 0.7);
  updates.push(t => herd6(Math.round(600 * ease.enter(seg(t, w('l08', 'bugün') - 0.2, 1.6)))));

  // ═══ 7 · soy ağacı ═══
  const t7 = tableau('soyagaci', { x: X(7), floor: '#2A2620', floorR: 14, spots: [{ x: 0, h: 9, z: 6, tx: 0, tz: -1, I: 220, angle: 0.7, color: '#FFF0DC' }], fog: ['#0C0A08', 0.035], hemi: ['#5A5448', '#0A0806', 0.7] });
  const barkM = std('#4A3A2A', { roughness: 0.9 });
  function branch(g, a, b, r0, r1) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, d.length(), 10), barkM); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; g.add(m); }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // George: kuru tek dal
  branch(t7.g, V(-2.0, 0, -1.5), V(-2.0, 2.2, -1.5), 0.16, 0.1); branch(t7.g, V(-2.0, 2.2, -1.5), V(-2.5, 3.2, -1.5), 0.1, 0.03); branch(t7.g, V(-2.0, 1.8, -1.5), V(-1.5, 2.6, -1.5), 0.08, 0.02);
  // Diego: dallar ve 800 yaprak (her biri bir yavru)
  const tips = [], r7 = mulberry32(88); { const base = V(2.0, 0, -1.5), top = V(2.0, 2.0, -1.5); branch(t7.g, base, top, 0.18, 0.12); for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4, e = top.clone().add(V(Math.sin(a) * 1.4, 0.6 + Math.cos(a) * 1.2, (r7() - 0.5) * 0.6)); branch(t7.g, top, e, 0.09, 0.04); for (let j = 0; j < 3; j++) { const f = e.clone().add(V((r7() - 0.5) * 1.0, 0.3 + r7() * 0.6, (r7() - 0.5) * 0.6)); branch(t7.g, e, f, 0.04, 0.015); tips.push(f); } } }
  const NL = 800, leafIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshStandardMaterial({ color: lin('#6AB04A'), emissive: lin('#2A5A1A'), roughness: 0.6 }), NL); leafIM.frustumCulled = false; t7.g.add(leafIM);
  const leafP = []; for (let i = 0; i < NL; i++) { const tp = tips[i % tips.length]; leafP.push(tp.clone().add(V((r7() - 0.5) * 0.9, (r7() - 0.5) * 0.7, (r7() - 0.5) * 0.7))); }
  const leafT = [w('l10', 6) - 0.1, hero(T)];
  const leafN = t => Math.round(NL * ease.enter(seg(t, leafT[0], leafT[1] - leafT[0])));
  let leafKey = -1;
  updates.push(t => { const n = leafN(t); if (n === leafKey) return; leafKey = n; leafP.forEach((p, i) => { _m.makeScale(i < n ? 1 : 0, i < n ? 1 : 0, i < n ? 1 : 0); _m.setPosition(p.x, p.y, p.z); leafIM.setMatrixAt(i, _m); }); leafIM.instanceMatrix.needsUpdate = true; });
  const geo7 = tortoise(t7.g, { shell: '#5A4E3E' }); geo7.g.position.set(-2.0, 0, -0.3); geo7.g.rotation.y = 0.3; geo7.set({ lift: 0.3 });
  const diego7 = tortoise(t7.g, { shell: '#1E1C1A', line: '#0A0A0A', neck: 0.9, skin: '#4A4640' }); diego7.g.position.set(2.0, 0, -0.3); diego7.g.rotation.y = -0.3; diego7.set({ lift: 0.8, reach: 0.6 });

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 1.6, 0.6, 1.9), P(0, 0.6, 0.25, 0.4), 40];
  const cam = [
    [0, ...F0, null, 0.03],
    [T.l01end + 0.2, P(0, 1.2, 1.2, 3.0), P(0, 0.1, 0.4, 0.4), 44],
    ...cut(T.l02 - 0.15, [P(0, 1.2, 1.2, 2.98), P(0, 0.1, 0.4, 0.4), 44], [P(1, -6, 3, 10), P(1, -3, 1, -12), 44]),
    [w('l02', 'keçiler') - 0.2, P(1, -4, 6, 14), P(1, 0, 3, -36), 46],
    [T.l02end + 0.3, P(1, 0, 14, 24), P(1, 0, 3, -40), 50],
    ...cut(T.l03 - 0.15, [P(1, 0, 14, 23.9), P(1, 0, 3, -40), 50], [P(2, 0, 6, 14), P(2, 0, 0.4, 0), 40]),
    [w('l03', 'türünün'), P(2, 0.4, 2.4, 6), P(2, 0, 0.4, 0), 40],
    [T.l03end + 0.3, P(2, 1.4, 0.7, 2.6), P(2, 0.6, 0.45, -0.2), 38],
    ...cut(T.l04 - 0.15, [P(2, 1.4, 0.7, 2.58), P(2, 0.6, 0.45, -0.2), 38], [P(3, 0.4, 1.4, 3.6), P(3, -0.5, 1.1, -1.2), 44]),
    [w('l04', 'kimse'), P(3, 0.6, 0.9, 2.6), P(3, 0.2, 0.4, 0), 42],
    [w('l04', 'yanına'), P(3, 1.9, 0.9, 2.8), P(3, 1.1, 0.15, 0.8), 40],
    [T.l04end + 0.3, P(3, 1.7, 0.75, 2.2), P(3, 1.1, 0.1, 0.85), 38, null, 0.02],
    ...cut(T.l05 - 0.15, [P(3, 1.7, 0.75, 2.18), P(3, 1.1, 0.1, 0.85), 38], [P(0, 0.8, 1.5, 4.6), P(0, -1.2, 0.9, 1.0), 46]),
    [w('l05', 'fausto'), P(0, -0.2, 1.3, 2.6), P(0, -0.6, 0.9, 0.5), 42],
    [T.l05end + 0.4, P(0, 1.6, 0.7, 2.0), P(0, 0.6, 0.3, 0.4), 40, null, 0.03],
    ...cut(T.l06 - 0.15, [P(0, 1.6, 0.7, 1.98), P(0, 0.6, 0.3, 0.4), 40], [P(4, 0, 4.5, 7), P(4, 0, 0, -7), 46]),
    [T.l06end + 0.4, P(4, 0, 3.2, 4.5), P(4, 0, 0, -7), 46],
    ...cut(T.l07 - 0.15, [P(4, 0, 3.2, 4.48), P(4, 0, 0, -7), 46], [P(5, 1.6, 1.1, 3.2), P(5, 0, 0.6, -0.4), 42]),
    [w('l07', 'diego') + 0.2, P(5, 0.9, 1.0, 2.4), P(5, 0, 0.9, -0.2), 40],
    [T.l07end + 0.4, P(5, 0.6, 4.5, 5.5), P(5, 0, 0, 0), 50],
    ...cut(T.l08 - 0.15, [P(5, 0.6, 4.5, 5.48), P(5, 0, 0, 0), 50], [P(6, 1.6, 1.0, 5.6), P(6, 0, 0.6, 2.0), 42]),
    [w('l08', 'bugün') - 0.2, P(6, 1.2, 1.2, 3.6), P(6, 0, 0.6, -0.4), 44],
    [T.l08end + 0.4, P(6, 0, 7, 7), P(6, 0, 0, -10), 50],
    ...cut(T.l09 - 0.15, [P(6, 0, 7, 6.98), P(6, 0, 0, -10), 50], [P(7, 0, 1.6, 6.5), P(7, 0, 1.4, -1.2), 46]),
    [T.l10, P(7, -1.4, 1.4, 3.4), P(7, -2.0, 1.2, -1.2), 40],
    [w('l10', 6) - 0.2, P(7, -0.8, 1.6, 4.0), P(7, -1.0, 1.4, -1.2), 42],
    [hero(T), P(7, 1.2, 2.2, 4.4), P(7, 1.6, 2.3, -1.4), 44],
    [T.l11end + 0.6, P(7, 0, 2.0, 7.0), P(7, 0, 1.6, -1.2), 46],
    ...cut(T.loop0, [P(7, 0, 2.0, 6.98), P(7, 0, 1.6, -1.2), 46], [P(0, 1.8, 0.75, 2.2), P(0, 0.6, 0.25, 0.4), 42, null, 0.03]),
    [T.D, ...F0, null, 0.03],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l03', 'yalnız') - 0.1, T.l04 - 0.3, 'YALNIZ GEORGE', 'Pinta kaplumbağası · bilinen son üye'], [w('l05', 'fausto') - 0.1, T.l06 - 0.3, 'FAUSTO LLERENA', '40 yıl boyunca bakıcısı'], [w('l07', 'diego') - 0.1, w('l07', 13) + 0.6, 'DIEGO', 'Española kaplumbağası']],
    numbers: [[w('l06', 'yalnızca') - 0.1, T.l07 - 0.3, '12 + 2', 'ESPAÑOLA\'DA KALAN'], [w('l08', 11) - 0.1, T.l09 - 0.3, '2.000+', 'BUGÜN ADADA'], [w('l10', 5) - 0.3, w('l10', 6) - 0.2, '0', 'GEORGE\'UN YAVRUSU'], [w('l10', 6) - 0.05, T.l11 + 0.3, t => (leafN(t) >= NL ? '800+' : String(leafN(t))), 'DIEGO\'NUN YAVRUSU']],
    update(t) { for (const u of updates) u(t); },
  };
}

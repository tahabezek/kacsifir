// № 065 · Duyulan en uzak ses: Krakatoa ve Tonga (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: Rodrigues kıyısı (polis şefi Wallis) · Krakatoa (patlama, şok halkası) · gemi güvertesi (kulaklar) ·
// Tonga (denizden yükselen bulut, şimşek) · Alaska (gece, bodrum, el feneri) · harita (iki halka).
// Merkez anlar: ufku dinleyen Wallis (l04), bodruma inen baba (l06). Doruk: 4.800 km ve yaklaşık 9.400 km halkaları.

export const opts = { bloom: 0.65 };
export function hero(T) { return T.l08end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l03 - 0.3, T.l03 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l05 - 0.3, T.l05 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    rumble: [[0.6, 0.35], [w('l02', 'infilak') - 0.2, 0.7], [w('l04', 'Doğudan'), 0.3], [w('l05', 'patladı'), 0.6], [w('l06', 'gümbürtülerle'), 0.4]],
    thock: [w('l03', 'patladığını')],
    scratch: [[w('l08', 'tonga') - 0.1, hero(T), 0.02]],
    riser: [w('l08', 'tonga') - 0.1, hero(T)],
    impact: hero(T),
    silence: [T.l07end + 0.1, T.l08],
    loopEnd: T.loop0,
  };
}

export async function film(A) {
  const { THREE, T, D, lin, std, box, cyl, canvasTex, tableau, motes, character, POSE, FACE, mixPose, ease, seg, lerp, clamp01, mulberry32, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const X = i => i * 120;
  const updates = [];
  const _m = new THREE.Matrix4();
  const seaM = c => new THREE.MeshStandardMaterial({ color: lin(c), roughness: 0.1, metalness: 0.3 });
  const sailor = { height: 1.76, heads: 7.3, build: 1.05, skin: '#D9A982', hair: '#3A2A1E', hairStyle: 'short', beard: '#3A2A1E', top: '#1E2A44', bottom: '#2A2A2E', hat: 'cap', hatColor: '#1E2A44', shoes: '#1A1A1A' };
  // bulut kabarcıkları: (merkez, yükseklik, zaman aralığı) → büyüyen sütun
  // umb > 0: tepede yayılan şemsiye bulut (Tonga)
  function plume(g, x, z, H, seed, t0, t1, glow = '#FF6A1A', umb = 0, body = '#5A524C') {
    const n = 160, r = mulberry32(seed), P = []; for (let i = 0; i < n; i++) { const u = r(), sp = (1 + u * 6) * (umb && u > 0.75 ? 1 + umb * (u - 0.75) * 4 : 1); P.push([(r() - 0.5) * sp * H / 60, u * H, (r() - 0.5) * sp * H / 60, (1 + r() * 2.5 + u * 3) * H / 60, u]); }
    const m = new THREE.MeshStandardMaterial({ color: lin(body), emissive: lin(glow), emissiveIntensity: 0.12, roughness: 1 });
    const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), m, n); im.frustumCulled = false; g.add(im);
    updates.push(t => { const k = ease.enter(seg(t, t0, t1 - t0)); P.forEach(([px, py, pz, R, u], i) => { const on = clamp01((k - u) * 3); const rr = R * ease.enter(on); _m.makeScale(rr, rr * 0.8, rr); _m.setPosition(x + px * k, py * k, z + pz * k); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; });
  }
  function ring(g, x, z, t0, dur, maxR, color) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(...color), transparent: true, opacity: 0, side: THREE.DoubleSide, fog: false, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); g.add(m);
    updates.push(t => { const u = seg(t, t0, dur); m.scale.setScalar(0.01 + maxR * ease.enter(u)); m.material.opacity = u > 0 && u < 1 ? 0.9 * (1 - u) + 0.1 : 0; });
  }

  // ═══ 0 · Rodrigues kıyısı ═══
  const t0 = tableau('rodrigues', { x: X(0), floor: '#D8C8A8', floorR: 30, spots: [{ x: 4, h: 12, z: 6, tx: 0, I: 220, angle: 0.6, color: '#FFF4E0' }], fog: ['#B8D0E0', 0.02], bg: '#A8C8E0', hemi: ['#E6F2FF', '#8A7A60', 1.1], env: 0.8 });
  { const sea = new THREE.Mesh(new THREE.PlaneGeometry(200, 120), seaM('#2A6A8A')); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.02, -64); t0.g.add(sea); const r = mulberry32(3); for (let i = 0; i < 6; i++) { const p = new THREE.Group(); cyl(0.12, 0.18, 5, '#6A5A3A', 0, 2.5, 0, p); const lf = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 6), std('#2E5A2A')); lf.scale.y = 0.35; lf.position.y = 5; p.add(lf); p.position.set((i % 2 ? 1 : -1) * (5 + r() * 5), 0, -1 + r() * 3); p.rotation.z = (r() - 0.5) * 0.3; t0.g.add(p); } }
  const wallis = character('wallis', t0, null);
  const book = box(0.25, 0.03, 0.18, '#6A2E2A', 0, 0, 0, wallis.hand('l')); book.position.set(0, -0.3, 0.1);

  // ═══ 1 · Krakatoa ═══
  const t1 = tableau('krakatoa', { x: X(1), floor: null, spots: [{ x: 20, h: 40, z: 30, tx: 0, I: 900, angle: 0.6, color: '#FFE8C8' }], fog: ['#8A9AA8', 0.006], bg: '#9AB0C4', hemi: ['#D8E6F2', '#3A4A5A', 1.0], env: 0.8 });
  { const sea = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), seaM('#1E4A62')); sea.material.roughness = 0.45; sea.rotation.x = -Math.PI / 2; t1.g.add(sea); const isl = new THREE.Mesh(new THREE.ConeGeometry(18, 14, 32, 4), std('#3E4A33', { flatShading: true, roughness: 0.95 })); isl.position.set(0, 7, -40); t1.g.add(isl); }
  plume(t1.g, 0, -40, 60, 11, w('l02', 'infilak') - 0.3, w('l02', 'infilak') + 3.5);
  ring(t1.g, 0, -40, w('l02', 'infilak') - 0.1, 2.2, 70, [1.4, 1.2, 1.0]);
  const flash1 = new THREE.PointLight(lin('#FFFFFF'), 0, 0, 0); flash1.position.set(0, 20, -40); t1.g.add(flash1);

  // ═══ 2 · gemi güvertesi ═══
  const t2 = tableau('guverte', { x: X(2), floor: '#6A5A44', floorR: 6, spots: [{ x: 2, h: 8, z: 4, tx: 0, I: 120, angle: 0.6, color: '#FFE8C8' }], fog: ['#8A9AA8', 0.03], bg: '#8A9AA8', hemi: ['#D8E6F2', '#3A3A3A', 0.9], env: 0.8 });
  { box(10, 1, 0.2, '#5A4A36', 0, 0.5, -1.6, t2.g); cyl(0.12, 0.15, 9, '#4A3A2A', -1.8, 4.5, -1.0, t2.g); }
  const sailors = [[-0.7, 0.2, 0.4], [0.6, -0.3, -0.5], [1.4, 0.6, 0.6]].map(([x, z, r], i) => character({ ...sailor, skin: ['#D9A982', '#B88A66', '#E6C4A6'][i], beard: i === 1 ? null : '#3A2A1E' }, t2, t => { const hit = seg(t, w('l03', 'kulak') - 0.6, 0.4); return { pos: [x, 0, z], rot: r, pose: mixPose(POSE.stand(), { ...POSE.crouch(), lShoulder: [-2.2, 0.4, -0.9], rShoulder: [-2.2, -0.4, 0.9], lElbow: [-2.0, 0, 0], rElbow: [-2.0, 0, 0] }, ease.enter(hit)), face: hit > 0 ? FACE.pain : FACE.surprise }; }));

  // ═══ 3 · Tonga ═══
  const t3 = tableau('tonga', { x: X(3), floor: null, spots: [{ x: 20, h: 40, z: 30, tx: 0, I: 600, angle: 0.6, color: '#FFD8B0' }], fog: ['#4A4A50', 0.005], bg: '#5A5E68', hemi: ['#A8B4C4', '#2A2A30', 0.8], env: 0.6 });
  { const sea = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), seaM('#14304A')); sea.rotation.x = -Math.PI / 2; t3.g.add(sea); }
  plume(t3.g, 0, -30, 70, 21, w('l05', 'patladı') - 0.2, T.l05end + 0.5, '#FFB060', 2.2, '#8A8680');
  ring(t3.g, 0, -30, w('l05', 'patladı'), 2.5, 60, [1.3, 1.3, 1.4]);
  const bolts = []; { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 10, 14), fog: false }); for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 18, 0.4), m); b.position.set(-10 + i * 4, 18 + (i % 3) * 8, -26); b.rotation.z = (i % 2 ? 0.3 : -0.25); t3.g.add(b); bolts.push(b); } }

  // ═══ 4 · Alaska, gece ═══
  const t4 = tableau('alaska', { x: X(4), floor: '#3A3530', spots: [{ x: -1.5, h: 2.4, z: 1.2, tx: 1, I: 40, angle: 0.9, color: '#8AA0D0', shadow: false }], fog: ['#06080C', 0.04], hemi: ['#3A4870', '#0A0C14', 0.7] });
  { box(5, 2.6, 0.15, '#4A3E34', 0, 1.3, -1.4, t4.g); for (let i = 0; i < 6; i++) box(0.9, 0.18, 0.3, '#5A4A3A', 1.4, 0.15 + i * 0.36, 0.6 - i * 0.25, t4.g); box(0.6, 0.6, 0.6, '#6A5A48', -1.4, 0.3, -0.9, t4.g); box(0.5, 0.9, 0.5, '#5A4A3A', -0.6, 0.45, -1.0, t4.g); }
  const dad = character('alaskan', t4, null);
  const torch = new THREE.SpotLight(lin('#FFF0D0'), 0, 0, 0.32, 0.5, 2); torch.castShadow = true; t4.g.add(torch, torch.target);
  const torchM = cyl(0.025, 0.03, 0.18, '#2A2A2E', 0, 0, 0, dad.hand('r')); torchM.position.set(0, -0.3, 0.06); torchM.rotation.x = Math.PI / 2;

  // ═══ 5 · harita ═══
  const t5 = tableau('harita', { x: X(5), floor: '#2A2622', spots: [{ x: 0, h: 4.5, z: 1.5, tx: 0, I: 45, angle: 0.65, color: '#FFF0DC' }], fog: ['#0A0A0C', 0.05], hemi: ['#4A4A50', '#141210', 0.5] });
  const mapC = document.createElement('canvas'); mapC.width = 768; mapC.height = 1024; const mapG = mapC.getContext('2d'), mapTex = new THREE.CanvasTexture(mapC); mapTex.colorSpace = THREE.SRGBColorSpace;
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.8), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.7 })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.78, 0); t5.g.add(m); box(1.55, 0.06, 2.0, '#5A3E26', 0, 0.74, 0, t5.g); for (const [x, z] of [[-0.7, -0.9], [0.7, -0.9], [-0.7, 0.9], [0.7, 0.9]]) box(0.06, 0.72, 0.06, '#4A3220', x, 0.36, z, t5.g); }
  let mapKey = -1;
  const K = [330, 430], R = [100, 490], TG = [610, 580], AK = [520, 140];   // şematik konumlar (ölçek: 4.800 km ≈ 230 px)
  function drawMap(t) {
    const a = ease.enter(seg(t, T.l08, w('l08', 'duyuldu') + 0.3 - T.l08)), b = ease.enter(seg(t, w('l08', 'tonga') - 0.1, hero(T) - w('l08', 'tonga') + 0.1)), k = Math.round(a * 40) + Math.round(b * 40) * 100; if (k === mapKey) return; mapKey = k;
    const g = mapG; g.fillStyle = '#1E3A52'; g.fillRect(0, 0, 768, 1024); g.strokeStyle = 'rgba(244,241,234,0.14)'; g.lineWidth = 2; for (let i = 64; i < 1024; i += 96) { g.beginPath(); g.moveTo(0, i); g.lineTo(768, i); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke(); }
    g.strokeStyle = 'rgba(244,241,234,0.5)'; g.lineWidth = 6; g.strokeRect(10, 10, 748, 1004);
    const pin = ([x, y], s, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); g.fillStyle = '#F4F1EA'; g.font = '700 38px Archivo'; g.textAlign = x > 500 ? 'right' : 'left'; g.fillText(s, x + (x > 500 ? -20 : 20), y + 12); };
    g.lineWidth = 8; g.strokeStyle = '#FFB060'; g.beginPath(); g.arc(K[0], K[1], 236 * a, 0, 7); g.stroke();
    g.strokeStyle = '#8FC8FF'; g.beginPath(); g.arc(TG[0], TG[1], 447 * b, 0, 7); g.stroke();
    pin(K, 'KRAKATOA', '#FF6A1A'); pin(R, 'RODRIGUES', '#F4F1EA'); pin(TG, 'TONGA', '#FF6A1A'); pin(AK, 'ALASKA', '#F4F1EA');
    mapTex.needsUpdate = true;
  }
  const w5 = character('wallis', t5, () => ({ pos: [-0.45, 0, -1.35], rot: 0, pose: POSE.stand(), face: FACE.neutral }));
  const d5 = character('alaskan', t5, () => ({ pos: [0.45, 0, -1.35], rot: 0, pose: POSE.stand(), face: FACE.neutral }));

  // ——— hareketler ———
  const set = (f, fn) => { f.act = fn; };
  set(wallis, t => { const turn = t < T.l02 ? ease.state(seg(t, 1.2, 1.0)) : ease.state(seg(t, w('l04', 'Doğudan') - 0.4, 0.8)) * (1 - ease.state(seg(t, T.loop0 + 0.1, T.D - T.loop0 - 0.5))); return { pos: [0, 0, 0.5], rot: lerp(0.3, Math.PI - 0.3, turn), pose: t > w('l04', 'deftere') && t < w('l04', 'Doğudan') ? { ...POSE.stand(), lShoulder: [-1.1, 0.2, -0.1], lElbow: [-1.2, 0, 0], rShoulder: [-0.9, 0, 0.2], rElbow: [-1.4, 0, 0] } : POSE.stand(), face: { ...FACE.surprise, look: 0.6 } }; });
  set(dad, t => { const down = seg(t, w('l06', 'uyandı') - 0.2, 2.6); return { pos: [lerp(1.4, 1.2, down), lerp(1.33, 0, ease.state(down)), lerp(-0.15, 1.1, down)], rot: lerp(-0.2, -0.7, down), pose: down > 0 && down < 1 ? POSE.walk((t * 0.6) % 1, 0.5) : { ...POSE.stand(), rShoulder: [-1.3, 0, 0.2], rElbow: [-0.3, 0, 0] }, face: t > w('l06', 'geyik') - 0.4 ? FACE.surprise : FACE.fear }; });

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.9, 1.75, 2.4), P(0, 0, 1.6, 0.4), 40];
  const cam = [
    [0, ...F0, null, 0.02],
    [0.6, P(0, 0.8, 1.74, 2.15), P(0, 0, 1.6, 0.4), 40, null, 0.02],
    [T.l01end, P(0, 0.1, 1.9, 3.8), P(0, 0.0, 1.5, -6), 42],
    ...cut(T.l02 - 0.15, [P(0, 0.1, 1.9, 3.78), P(0, 0.0, 1.5, -6), 42], [P(1, 0, 6, 60), P(1, 0, 10, -40), 40]),
    [w('l02', 'infilak'), P(1, 0, 6, 55), P(1, 0, 18, -40), 44],
    [T.l02end + 0.3, P(1, 0, 8, 70), P(1, 0, 25, -40), 50],
    ...cut(T.l03 - 0.15, [P(1, 0, 8, 69.9), P(1, 0, 25, -40), 50], [P(2, 0.6, 1.6, 4.6), P(2, 0.2, 1.2, 0), 44]),
    [T.l03end + 0.3, P(2, 0.3, 1.2, 3.2), P(2, 0.3, 0.9, 0), 42],
    ...cut(T.l04 - 0.15, [P(2, 0.3, 1.2, 3.18), P(2, 0.3, 0.9, 0), 42], [P(0, -1.6, 1.6, 3.6), P(0, 0, 1.5, 0.4), 42]),
    [w('l04', 'Doğudan') - 0.2, P(0, 0.5, 1.7, 3.0), P(0, 0, 1.55, 0.4), 40],
    [T.l04end + 0.4, P(0, 0.7, 1.9, 4.2), P(0, -0.3, 1.4, -6), 40, null, 0.02],
    ...cut(T.l05 - 0.15, [P(0, 0.7, 1.9, 4.22), P(0, -0.3, 1.4, -6), 40], [P(3, 0, 4, 22), P(3, 0, 12, -30), 44]),
    [T.l05end + 0.4, P(3, 0, 5, 42), P(3, 0, 34, -30), 56],
    ...cut(T.l06 - 0.15, [P(3, 0, 5, 41.9), P(3, 0, 34, -30), 56], [P(4, -2.3, 2.4, 3.0), P(4, 1.2, 2.3, -0.2), 54]),
    [w('l06', 'Kimi'), P(4, -1.8, 1.6, 3.0), P(4, 1.2, 1.2, 0.6), 44],
    [T.l06end + 0.3, P(4, -1.0, 1.4, 2.8), P(4, 1.2, 1.25, 1.0), 40],
    ...cut(T.l07 - 0.15, [P(4, -1.0, 1.4, 2.78), P(4, 1.2, 1.25, 1.0), 40], [P(5, 0, 2.9, 2.8), P(5, 0, 1.0, -0.5), 46]),
    [T.l08, P(5, 0, 3.1, 2.3), P(5, 0, 0.95, -0.4), 46],
    [hero(T) + 0.3, P(5, 0, 3.2, 2.0), P(5, 0, 0.9, -0.35), 48],
    [T.l09end + 0.6, P(5, 0, 3.2, 2.2), P(5, 0, 0.9, -0.35), 47],
    ...cut(T.loop0, [P(5, 0, 3.2, 2.22), P(5, 0, 0.9, -0.35), 47], [P(0, 1.05, 1.76, 2.8), P(0, 0, 1.6, 0.4), 40, null, 0.02]),
    [T.D - 0.6, P(0, 0.98, 1.76, 2.6), P(0, 0, 1.6, 0.4), 40, null, 0.02],
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l04', 'Rodrigues') - 0.1, w('l04', 'Doğudan') - 0.3, 'JAMES WALLIS', 'Rodrigues polis şefi · 1883']],
    numbers: [[w('l03', 'Altmış') - 0.1, w('l03', 'yazdı') - 0.1, '64 km', 'KRAKATOA\'YA UZAKLIK'], [w('l05', 'Bulutu') - 0.1, T.l06 - 0.3, '57 km', 'BULUTUN YÜKSEKLİĞİ'], [w('l08', 'dört') - 0.1, w('l08', 'tonga') - 0.3, '4.800 km', 'KRAKATOA → RODRIGUES'], [w('l08', 'tonga') - 0.05, T.l09 + 0.3, '~9.400 km', 'TONGA → ALASKA']],
    overlay(t, ctx) {
      // polis şefinin defteri (l04 alıntı): kâğıt, mürekkep
      const t0 = w('l04', 'Doğudan') - 0.25, t1 = T.l05 - 0.3, inU = ease.enter(seg(t, t0, 0.35)), out = ease.exit(seg(t, t1, 0.25)); if (inU <= 0 || out >= 1) return;
      ctx.save(); ctx.translate(505, 600 + (1 - inU) * 100 - out * 120); ctx.rotate(-0.04); ctx.globalAlpha = 1 - out;
      ctx.fillStyle = '#EDE4CC'; ctx.fillRect(-330, -110, 660, 220); ctx.fillStyle = '#2A2A3A'; ctx.textAlign = 'center'; ctx.font = 'italic 600 40px Archivo';
      ['"...reports coming from the eastward,', 'like the distant roar of heavy guns."'].forEach((s, i) => ctx.fillText(s, 0, -20 + i * 56)); ctx.font = '600 28px Archivo'; ctx.fillStyle = '#6A5A44'; ctx.fillText('James Wallis, Rodrigues, 27 Ağustos 1883', 0, 88); ctx.restore();
    },
    update(t, best) {
      for (const u of updates) u(t);
      const f1 = seg(t, w('l02', 'infilak') - 0.2, 0.1) * (1 - seg(t, w('l02', 'infilak') + 0.2, 1.5)); flash1.intensity = 3 * f1;
      bolts.forEach((b, i) => { b.visible = t > w('l05', 'patladı') && Math.sin(t * (9 + i) + i * 3) > 0.92; });
      const lit = seg(t, w('l06', 'uyandı') - 0.2, 0.3); torch.intensity = 60 * lit; const hp = dad.hand('r').getWorldPosition(new THREE.Vector3()); torch.position.copy(hp).sub(t4.g.position); torch.target.position.set(-0.6, 0, 0.6);
      drawMap(t);
    },
  };
}

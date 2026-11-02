// № 038 · Uyumayan çocuk ve hatırlayamayan adam (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: günlük (üstü çizili satırlar) · lise (bilim fuarı) · gece sokağı (tabela insana döner) · sayılar (65'te durur) ·
// orkestra (ışıklar söner) · kapı (Deborah girer, sarılma) · piyano · duvar (Randy'nin 11 günü, Clive'ın 30 binden fazla satırı).
// Doruk: duvar, Randy'nin uyanık geçen 264 saati boyunca Clive'ın yeniden başlayan satırlarıyla dolar.

export const opts = { bloom: 0.6, bloomThreshold: 0.9 };
export function hero(T) { return T.l10end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l04 - 0.3, T.l04 + 0.1], [T.l05 - 0.3, T.l05 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.l08 - 0.3, T.l08 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l04', 'yüzden'), w('l04', 'altmış'), w('l06', 'günlüğüne'), w('l06', 'çiziyor')],
    rumble: [[0.5, 0.25], [w('l05', 'virüs'), 0.4]],
    thock: [w('l04', 'durdu')],
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
  const _m = new THREE.Matrix4();
  const friendA = { height: 1.76, heads: 7.4, build: 0.95, skin: '#ECCCB2', hair: '#2A1E16', hairStyle: 'short', top: '#3A5A8A', bottom: '#2A2A30', shoes: '#2A2420' };
  const friendB = { height: 1.72, heads: 7.4, build: 1.0, skin: '#E2B896', hair: '#6A4A2A', hairStyle: 'curly', top: '#8A3A2A', bottom: '#3A3A30', glasses: '#1A1A1A', shoes: '#2A2420' };
  const randyTired = { ...CARDS.randy, eyes: '#5A2A2A' };
  const randyBall = { ...CARDS.randy, top: '#1E3A6A' };
  const player = i => ({ height: 1.7, heads: 7.3, build: 0.95, skin: ['#ECCCB2', '#D9A982', '#F0D4BE', '#B88A66'][i % 4], hair: ['#2A1E16', '#8A7A6A', '#5A3A2A', '#141210'][i % 4], hairStyle: ['short', 'bun', 'short', 'long'][i % 4], top: '#141416', bottom: '#141416', dress: i % 4 === 1 || i % 4 === 3 ? 'long' : undefined, shoes: '#1A1A1A' });

  // ——— günlük sayfası (tuval) ———
  const diaC = document.createElement('canvas'); diaC.width = 768; diaC.height = 1024; const diaG = diaC.getContext('2d'), diaTex = new THREE.CanvasTexture(diaC); diaTex.colorSpace = THREE.SRGBColorSpace;
  const entries = ['8.31  Şimdi gerçekten uyandım.', '8.34  Şimdi tamamen uyandım.', '8.38  İlk kez uyandım.', '8.42  Şimdi gerçekten, tamamen uyandım.', '8.47  Şimdi uyandım. İlk kez.', '8.51  Şimdi gerçekten uyandım.', '8.55  Tamamen uyandım.', '9.02  Şimdi gerçekten uyandım.', '9.06  Şimdi uyandım.', '9.10  İlk kez, gerçekten uyandım.'];
  const nLines = t => { const a = t < T.l02 ? 3 + Math.floor(seg(t, 0.2, 4.4) * 3.99) : 0; const b = t > T.l06 - 0.2 && t < T.l07 ? 5 + Math.floor(seg(t, w('l06', 'günlüğüne') - 0.3, T.l06end - w('l06', 'günlüğüne') + 0.3) * 4.99) : 0; return t >= T.loop0 ? 3 : Math.max(a, b); };
  let diaKey = -1;
  function drawDiary(t) {
    const n = nLines(t), k = n * 100 + Math.round(clamp01((t * 4) % 1) * 4); if (k === diaKey) return; diaKey = k; const g = diaG;
    g.fillStyle = '#EFE6D0'; g.fillRect(0, 0, 768, 1024); g.strokeStyle = 'rgba(90,110,150,0.35)'; g.lineWidth = 2; for (let y = 110; y < 1024; y += 86) { g.beginPath(); g.moveTo(40, y); g.lineTo(728, y); g.stroke(); }
    g.strokeStyle = 'rgba(190,60,60,0.5)'; g.beginPath(); g.moveTo(120, 0); g.lineTo(120, 1024); g.stroke();
    g.fillStyle = '#1E2440'; g.font = 'italic 600 36px Archivo'; g.textAlign = 'left';
    for (let i = 0; i < n; i++) { const y = 100 + i * 86, s = entries[i % entries.length]; g.fillText(s, 70, y); if (i < n - 1) { const wd = g.measureText(s).width; g.strokeStyle = '#1E2440'; g.lineWidth = 5; g.beginPath(); g.moveTo(66, y - 12); g.lineTo(74 + wd, y - 14); g.stroke(); } }
    diaTex.needsUpdate = true;
  }

  // ═══ 0 · günlük ═══
  const t0 = tableau('gunluk', { x: X(0), floor: '#3A2A1E', floorR: 5, spots: [{ x: -0.4, h: 2.2, z: 0.6, tx: 0.1, tz: -0.2, I: 9, angle: 0.6, color: '#FFE2B0' }], fog: ['#0E0A08', 0.08], hemi: ['#5A4A3A', '#100C08', 0.5] });
  box(1.6, 0.06, 0.9, '#5A3A22', 0, 0.74, -0.25, t0.g); box(1.5, 0.7, 0.8, '#4A3020', 0, 0.36, -0.25, t0.g);
  { const page = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.48), new THREE.MeshStandardMaterial({ map: diaTex, roughness: 0.8 })); page.rotation.x = -Math.PI / 2; page.rotation.z = Math.PI + 0.1; page.position.set(0.1, 0.785, -0.15); t0.g.add(page); box(0.39, 0.02, 0.51, '#2A3A5A', 0.1, 0.772, -0.15, t0.g).rotation.y = 0.1; }
  const clive0 = character('clive', t0, t => ({ pos: [0.05, 0, 0.42], rot: Math.PI, pose: { ...POSE.write(), rElbow: [-1.4 + 0.06 * Math.sin(t * 13), 0, 0] }, face: { ...FACE.neutral, lookY: -1 } }));
  const pen = cyl(0.005, 0.005, 0.13, '#1A1A1A', 0, 0, 0, clive0.hand('r')); pen.position.set(0, -0.08, 0.03); pen.rotation.x = 1.2;

  // ═══ 1 · lise: bilim fuarı ═══
  const t1 = tableau('lise', { x: X(1), floor: '#7A6A58', floorR: 8, spots: [{ x: 1, h: 5, z: 3, tx: 0, I: 80, angle: 0.6, color: '#FFF0DC' }], fog: ['#1A1814', 0.05], hemi: ['#A89A88', '#2A241E', 0.9] });
  box(6, 3, 0.15, '#8A9A8A', 0, 1.5, -1.8, t1.g); box(1.8, 0.06, 0.7, '#6A4A2E', 0, 0.76, -0.9, t1.g); box(1.7, 0.72, 0.6, '#5A3E26', 0, 0.37, -0.9, t1.g);
  { const c = canvasTex(512, 384, (g, W, H) => { g.fillStyle = '#F2EEE2'; g.fillRect(0, 0, W, H); g.fillStyle = '#1E2A44'; g.font = '800 54px Archivo'; g.textAlign = 'center'; g.fillText('UYKUSUZLUK', W / 2, 110); g.fillText('DENEYİ', W / 2, 175); g.font = '600 34px Archivo'; g.fillStyle = '#8A2A2A'; g.fillText('Bilim fuarı · 1963', W / 2, 260); g.strokeStyle = '#1E2A44'; g.lineWidth = 8; g.strokeRect(12, 12, W - 24, H - 24); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshStandardMaterial({ map: c, roughness: 0.8 })); m.position.set(0, 1.85, -1.15); t1.g.add(m); }
  const randy1 = character('randy', t1, () => ({ pos: [0.1, 0, -0.2], rot: 0, pose: { ...POSE.stand(), rShoulder: [-0.3, 0, 0.6], rElbow: [-1.6, 0, 0] }, face: FACE.grin }));
  const fa1 = character(friendA, t1, () => ({ pos: [-0.75, 0, -0.35], rot: 0.4, pose: POSE.stand(), face: FACE.smile }));
  const fb1 = character(friendB, t1, () => ({ pos: [0.95, 0, -0.3], rot: -0.4, pose: { ...POSE.stand(), lShoulder: [-1.0, 0, -0.3], lElbow: [-0.8, 0, 0] }, face: FACE.smile }));

  // ═══ 2 · gece sokağı ═══
  const t2 = tableau('sokak', { x: X(2), floor: '#2A2A2E', floorR: 14, spots: [{ x: 1.4, h: 4.2, z: -0.4, tx: 0.6, tz: 0.4, I: 60, angle: 0.75, color: '#FFD88A' }], fog: ['#06080E', 0.07], hemi: ['#1E2A44', '#06060A', 0.5] });
  { cyl(0.05, 0.07, 4.2, '#2A2A2E', 1.4, 2.1, -0.4, t2.g); const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.2, 1.6) })); lamp.position.set(1.4, 4.25, -0.4); t2.g.add(lamp); box(14, 0.12, 2.2, '#4A4A4E', 0, 0.06, -2.4, t2.g); for (let i = 0; i < 4; i++) box(2.8, 3 + i % 2, 2, ['#2A2E3A', '#3A3030'][i % 2], -6 + i * 3.6, 1.6, -4.6, t2.g); }
  const sign = new THREE.Group(); { cyl(0.03, 0.03, 2.3, '#8A8A8E', 0, 1.15, 0, sign); const c = canvasTex(256, 128, (g, W, H) => { g.fillStyle = '#2A6A3A'; g.fillRect(0, 0, W, H); g.fillStyle = '#F2F2EE'; g.font = '800 46px Archivo'; g.textAlign = 'center'; g.fillText('DUR', W / 2, 82); }); const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.03), [std('#2A6A3A'), std('#2A6A3A'), std('#2A6A3A'), std('#2A6A3A'), new THREE.MeshStandardMaterial({ map: c }), std('#2A6A3A')]); p.position.y = 2.15; sign.add(p); } sign.position.set(-1.1, 0, -0.9); t2.g.add(sign);
  const signMan = character({ height: 2.3, heads: 7.6, build: 0.7, skin: '#4A5A4A', hair: '#2A6A3A', hairStyle: 'bald', top: '#2A4A32', bottom: '#2A3A2A', hat: 'beret', hatColor: '#2A6A3A', shoes: '#1A1A1A' }, t2, t => { const m = seg(t, w('l03', 'insan') - 0.4, 0.8); return m <= 0 || t > w('l03', 'süre') - 0.1 ? null : { pos: [-1.1, 0, -0.9], rot: 0.5, pose: { ...POSE.stand(), lShoulder: [-0.4, 0, -0.5] }, face: { ...FACE.neutral, browTilt: 0.5 }, scale: 0.3 + 0.7 * ease.enter(m) }; });
  updates.push(t => { const m = seg(t, w('l03', 'insan') - 0.4, 0.8); sign.visible = !(m > 0.5 && t < w('l03', 'süre') - 0.1); });
  const walkU = t => seg(t, w('l02', 'iki') - 0.3, T.l03 + 1 - w('l02', 'iki'));
  const randy2 = character(randyTired, t2, t => { if (t > w('l03', 'ünlü') - 0.2) return null; const u = walkU(t); return { pos: [lerp(2.2, 0.2, u), 0, lerp(0.4, 0.3, u)], rot: u < 1 ? -1.4 : -0.8 + (t > w('l03', 'insan') ? 0.0 : 0), pose: u < 1 ? POSE.walk((t * 0.55) % 1, 0.5) : { ...POSE.limp(), head: [0.1, 0.4, 0] }, face: t > w('l03', 'insan') - 0.3 ? { ...FACE.surprise, browTilt: 0.3, look: -1 } : { ...FACE.sad, eyes: 0.5 } }; });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 10), std('#7A4A26')); ball.scale.set(1, 0.62, 0.62);
  const randyB = character(randyBall, t2, t => t > w('l03', 'ünlü') - 0.2 ? { pos: [0.2, 0, 0.3], rot: -0.3, pose: { ...POSE.run(0.25), spine: [0.2, 0, 0], lShoulder: [-1.2, 0.3, -0.3], lElbow: [-1.8, 0, 0] }, face: FACE.grin } : null);
  randyB.hand('l').add(ball); ball.position.set(0, -0.08, 0.08);
  const fa2 = character(friendA, t2, t => { const u = walkU(t); const nudge = Math.max(0, Math.sin(t * 2.2)) * (t > w('l02', 'gece') ? 1 : 0); return { pos: [lerp(2.9, 0.9, u), 0, lerp(0.9, 0.85, u)], rot: u < 1 ? -1.4 : -1.9, pose: u < 1 ? POSE.walk((t * 0.55 + 0.3) % 1, 0.5) : { ...POSE.stand(), rShoulder: [-1.1 * nudge, 0, 0.3], rElbow: [-0.3, 0, 0] }, face: FACE.determined }; });
  const fb2 = character(friendB, t2, t => { const u = walkU(t); return { pos: [lerp(1.8, -0.3, u), 0, lerp(-0.3, -0.25, u)], rot: u < 1 ? -1.4 : 0.6, pose: u < 1 ? POSE.walk((t * 0.55 + 0.6) % 1, 0.5) : POSE.stand(), face: FACE.neutral }; });

  // ═══ 3 · sayılar ═══
  const t3 = tableau('sayilar', { x: X(3), floor: '#2A2622', floorR: 6, spots: [{ x: 0.3, h: 3, z: 1.4, tx: 0, I: 26, angle: 0.55, color: '#E8ECF2' }], fog: ['#0A0A0C', 0.06], hemi: ['#3A3E48', '#0A0A0C', 0.5] });
  box(1.2, 0.06, 0.7, '#4A3A2A', 0, 0.74, 0.2, t3.g); box(1.1, 0.72, 0.6, '#3A2E22', 0, 0.37, 0.2, t3.g);
  const randy3 = character(randyTired, t3, t => ({ pos: [0, 0, -0.45], rot: 0, pose: t > w('l04', 'unutmuştu') - 0.2 ? { ...POSE.sitHunched(), head: [0.5, 0.2, 0] } : { ...POSE.sit(), spine: [0.15, 0, 0], lShoulder: [-0.7, 0.2, -0.2], lElbow: [-1.2, 0, 0] }, face: t > w('l04', 'durdu') ? { ...FACE.sad, eyes: 0.6, look: 0.6, lookY: 0.4 } : { ...FACE.determined, eyes: 0.45, lookY: 0.7 } }));
  const nums = [100, 93, 86, 79, 72, 65].map((n, i) => { const c = canvasTex(256, 160, (g, W, H) => { g.fillStyle = i === 5 ? '#FFB020' : '#F4F1EA'; g.font = '800 120px Archivo'; g.textAlign = 'center'; g.fillText(String(n), W / 2, 125); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.31), new THREE.MeshBasicMaterial({ map: c, transparent: true, depthWrite: false, color: new THREE.Color(1.3, 1.3, 1.3), fog: false })); t3.g.add(m); return m; });
  const numT = i => lerp(w('l04', 'yüzden'), w('l04', 'altmış'), i / 5);
  updates.push(t => { nums.forEach((m, i) => { const a = ease.enter(seg(t, numT(i) - 0.1, 0.35)), out = i < 5 ? seg(t, numT(i + 1), 0.6) : seg(t, w('l04', 'unutmuştu') - 0.2, 0.8); m.material.opacity = a * (1 - out); m.visible = m.material.opacity > 0.01; const ang = -0.9 + i * 0.36; m.position.set((i - 2.5) * 0.075, 1.48 + 0.1 * out, -0.4); m.scale.setScalar(i === 5 ? 0.62 : 0.42); }); });

  // ═══ 4 · orkestra ═══
  const t4 = tableau('orkestra', { x: X(4), floor: '#4A3626', floorR: 10, spots: [{ x: 0, h: 6, z: 3, tx: 0, tz: -1, I: 120, angle: 0.75, color: '#FFE8C8' }], fog: ['#0A0806', 0.05], hemi: ['#6A5A48', '#0A0806', 0.6] });
  box(0.9, 0.2, 0.9, '#2A1E16', 0, 0.1, 0.8, t4.g);
  const players = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const a = -0.9 + i * 0.36, rad = 2.0 + r * 1.1; const x = Math.sin(a) * rad, z = 0.8 - Math.cos(a) * rad; players.push(character(player(i + r * 3), t4, t => ({ pos: [x, 0, z], rot: a + Math.PI * 0 + (x > 0 ? 0 : 0), pose: { ...POSE.sit(), lShoulder: [-1.0, 0.3, -0.4], rShoulder: [-1.0, -0.3, 0.4], lElbow: [-1.1, 0, 0], rElbow: [-1.1 + 0.15 * Math.sin(t * 6 + i), 0, 0] }, face: FACE.neutral }))); const st = box(0.4, 0.02, 0.3, '#1A1A1A', x * 0.86, 1.05, z + (0.8 - z) * 0.14, t4.g); st.rotation.y = a; }
  const clive4 = character('clive', t4, t => { const stop = t > w('l05', 'virüs'); return { pos: [0, 0.2, 0.8], rot: Math.PI, pose: stop ? { ...POSE.stand(), head: [0.3, 0, 0] } : POSE.conduct((t * 0.8) % 1), face: stop ? { ...FACE.sad, look: 0 } : FACE.determined }; });
  const dark4 = t => 1 - 0.92 * ease.exit(seg(t, w('l05', 'virüs') - 0.1, 1.6));

  // ═══ 5 · kapı ═══
  const t5 = tableau('kapi', { x: X(5), floor: '#6A5A48', floorR: 8, spots: [{ x: 0.5, h: 3.5, z: 2.2, tx: 0, I: 50, angle: 0.65, color: '#FFE8CC' }], fog: ['#14100C', 0.06], hemi: ['#8A7A68', '#1A140E', 0.8] });
  { box(5, 2.8, 0.12, '#B8AC96', 0, 1.4, -1.5, t5.g); box(1.0, 2.1, 0.06, '#5A3E26', 1.4, 1.05, -1.42, t5.g); box(0.9, 0.45, 0.6, '#7A3A2A', -1.2, 0.22, -0.7, t5.g); box(0.9, 0.5, 0.15, '#7A3A2A', -1.2, 0.7, -0.98, t5.g); const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.0), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.4, 1.3) })); win.position.set(-1.0, 1.6, -1.43); t5.g.add(win); }
  const doorT = w('l07', 'döndüğünde') - 0.6, hugT = w('l07', 'kollarını');
  const deb5 = character('deborah', t5, t => { const u = seg(t, doorT, hugT - doorT); return { pos: [lerp(1.4, 0.15, ease.state(u)), 0, lerp(-1.3, -0.15, ease.state(u))], rot: lerp(0.3, -1.3, u), pose: u < 1 ? POSE.walk((t * 0.7) % 1, 0.5) : POSE.hug(), face: FACE.smile }; });
  const clive5 = character('clive', t5, t => { const rise = seg(t, doorT + 0.2, 0.8), hug = t > hugT; return { pos: [lerp(-1.2, -0.45, ease.state(rise)), lerp(0, 0, rise), lerp(-0.62, -0.1, ease.state(rise))], rot: lerp(0, 1.6, ease.state(rise)), pose: hug ? POSE.hug() : rise > 0 ? mixPose(POSE.sit(), { ...POSE.stand(), lShoulder: [-1.4, 1.0, -0.4], rShoulder: [-1.4, -1.0, 0.4] }, ease.state(rise)) : { ...POSE.sit(), head: [0.1, 0.4, 0] }, face: rise > 0.3 ? FACE.grin : FACE.neutral }; });

  // ═══ 6 · piyano ═══
  const t6 = tableau('piyano', { x: X(6), floor: '#3A2A1E', floorR: 6, spots: [{ x: -0.8, h: 3, z: 1.6, tx: 0, tz: 0.3, I: 70, angle: 0.6, color: '#FFE2B8' }], fog: ['#0C0A08', 0.06], hemi: ['#7A6A5A', '#0C0A08', 0.8] });
  { box(1.6, 1.2, 0.6, '#141214', 0, 0.6, -0.55, t6.g); box(1.5, 0.04, 0.2, '#F2F0EA', 0, 0.76, -0.15, t6.g); for (let i = 0; i < 14; i++) if (i % 7 !== 2 && i % 7 !== 6) box(0.06, 0.03, 0.11, '#141214', -0.7 + i * 0.105 + 0.05, 0.79, -0.2, t6.g); box(0.7, 0.45, 0.35, '#2A1E16', 0, 0.22, 0.45, t6.g); }
  const clive6 = character('clive', t6, t => ({ pos: [0, 0.05, 0.42], rot: Math.PI, pose: POSE.piano((t * 0.3) % 1), face: { ...FACE.closed, smile: 0.4 } }));

  // ═══ 7 · duvar: 264 saat ve 30 binden fazla satır ═══
  const t7 = tableau('duvar', { x: X(7), floor: '#1E1C1A', floorR: 20, spots: [{ x: 0, h: 8, z: 7, tx: 0, tz: -2, I: 200, angle: 0.8, color: '#F2EEE6' }], fog: ['#08080A', 0.03], hemi: ['#4A4A50', '#0A0A0A', 0.7] });
  const NC = 200, NR = 160, WW = 9, WH = 6.4;   // 32.000 satır; her biri bir günlük satırı
  box(WW + 0.4, WH + 0.4, 0.1, '#2A2622', 0, WH / 2 + 0.6, -2.6, t7.g);
  const lineIM = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.25, 1.1), fog: false }), NC * NR); lineIM.frustumCulled = false; t7.g.add(lineIM);
  const fillT = [w('l10', 6) - 0.1, hero(T)];
  let lineKey = -1;
  updates.push(t => { const n = Math.round(31728 * ease.enter(seg(t, fillT[0], fillT[1] - fillT[0]))); if (n === lineKey) return; lineKey = n; for (let k = 0; k < NC * NR; k++) { const r = Math.floor(k / NC), c = k % NC; if (k < n) { _m.makeScale(WW / NC * 0.8, WH / NR * 0.28, 1); _m.setPosition(-WW / 2 + (c + 0.5) * WW / NC, 0.6 + WH - (r + 0.5) * WH / NR, -2.54); } else _m.makeScale(0, 0, 0); lineIM.setMatrixAt(k, _m); } lineIM.instanceMatrix.needsUpdate = true; });
  const days = []; for (let i = 0; i < 11; i++) { const b = box(WW / 11 - 0.05, 0.22, 0.1, '#FF8A2A', -WW / 2 + (i + 0.5) * WW / 11, 0.35, -2.45, t7.g); b.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.0, 0.3) }); days.push(b); }
  updates.push(t => { const u = seg(t, w('l10', 'randy') - 0.1, w('l10', 'uyumadı') + 0.3 - w('l10', 'randy')); days.forEach((b, i) => { b.visible = u * 11 > i; }); });
  const randy7 = character(randyTired, t7, () => ({ pos: [-1.3, 0, 0.3], rot: 0.35, pose: { ...POSE.limp(), head: [-0.3, 0.2, 0] }, face: { ...FACE.surprise, eyes: 0.5, lookY: 1 } }));
  const clive7 = character('clive', t7, t => ({ pos: [1.3, 0, 0.3], rot: -0.35, pose: { ...POSE.stand(), head: [-0.35, -0.2, 0] }, face: { ...FACE.surprise, lookY: 1 } }));

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.05, 1.42, -0.78), P(0, 0.1, 0.86, -0.05), 40];
  const cam = [
    [0, ...F0, null, 0.02],
    [T.l01end + 0.3, P(0, 0.08, 1.3, -0.62), P(0, 0.1, 0.8, -0.12), 36, null, 0.02],
    ...cut(T.l02 - 0.15, [P(0, 0.08, 1.3, -0.6), P(0, 0.1, 0.8, -0.12), 36], [P(1, 1.0, 1.6, 3.6), P(1, 0, 1.2, -0.6), 44]),
    [w('l02', 'iki') - 0.2, P(1, 0.3, 1.6, 2.6), P(1, 0.1, 1.45, -0.4), 40],
    ...cut(w('l02', 'iki') - 0.15, [P(1, 0.3, 1.6, 2.58), P(1, 0.1, 1.45, -0.4), 40], [P(2, 0.4, 1.6, 4.4), P(2, 1.2, 1.2, 0), 44]),
    [T.l03, P(2, 0.2, 1.6, 4.0), P(2, 0.3, 1.3, 0), 44],
    [w('l03', 'insan') - 0.3, P(2, 1.4, 1.65, 1.9), P(2, -0.9, 1.6, -0.6), 40],
    [w('l03', 'süre'), P(2, 1.2, 1.7, 2.4), P(2, -0.9, 1.8, -0.8), 42],
    ...cut(w('l03', 'ünlü') - 0.15, [P(2, 1.2, 1.7, 2.38), P(2, -0.9, 1.8, -0.8), 42], [P(2, 0.8, 1.5, 2.6), P(2, 0.2, 1.3, 0.3), 42]),
    [T.l03end + 0.3, P(2, 0.7, 1.4, 2.2), P(2, 0.2, 1.4, 0.3), 40],
    ...cut(T.l04 - 0.15, [P(2, 0.7, 1.4, 2.18), P(2, 0.2, 1.4, 0.3), 40], [P(3, 0, 1.15, 1.75), P(3, 0, 0.95, -0.4), 44]),
    [w('l04', 'altmış'), P(3, 0, 1.12, 1.5), P(3, 0, 0.97, -0.4), 42],
    [T.l04end + 0.4, P(3, 0.45, 0.95, 1.0), P(3, 0, 0.95, -0.4), 38, null, 0.02],
    ...cut(T.l05 - 0.15, [P(3, 0.45, 0.95, 0.98), P(3, 0, 0.95, -0.4), 38], [P(4, 0.8, 2.6, -3.2), P(4, 0, 1.2, 0.6), 46]),
    [w('l05', 'klayv') - 0.2, P(4, 0.4, 2.0, -1.4), P(4, 0, 1.6, 0.8), 42],
    [w('l05', 'virüs'), P(4, 0.2, 1.85, -0.9), P(4, 0, 1.75, 0.8), 38],
    [T.l05end + 0.4, P(4, 0.1, 1.8, -0.5), P(4, 0, 1.75, 0.8), 34, null, 0.02],
    ...cut(T.l06 - 0.15, [P(4, 0.1, 1.8, -0.52), P(4, 0, 1.75, 0.8), 34], [P(0, -0.7, 1.5, -1.4), P(0, 0.05, 1.0, 0.1), 42]),
    [w('l06', 'günlüğüne') - 0.2, P(0, -0.1, 1.4, -0.85), P(0, 0.1, 0.84, -0.08), 38],
    [T.l06end + 0.3, P(0, 0.08, 1.28, -0.6), P(0, 0.1, 0.8, -0.12), 34, null, 0.02],
    ...cut(T.l07 - 0.15, [P(0, 0.08, 1.28, -0.58), P(0, 0.1, 0.8, -0.12), 34], [P(5, 0.6, 1.6, 3.4), P(5, 0.2, 1.1, -0.6), 44]),
    [hugT, P(5, 0.2, 1.6, 2.4), P(5, -0.15, 1.35, -0.1), 40],
    [T.l07end + 0.4, P(5, -0.6, 1.65, 1.6), P(5, -0.2, 1.5, -0.1), 36, null, 0.02],
    ...cut(T.l08 - 0.15, [P(5, -0.6, 1.65, 1.58), P(5, -0.2, 1.5, -0.1), 36], [P(6, -1.6, 1.3, 0.35), P(6, 0, 1.0, 0.15), 42]),
    [T.l08end + 0.4, P(6, -1.0, 1.0, 0.2), P(6, 0, 0.85, 0.0), 38, null, 0.02],
    ...cut(T.l09 - 0.15, [P(6, -1.0, 1.0, 0.18), P(6, 0, 0.85, 0.0), 38], [P(7, 0, 1.8, 5.0), P(7, 0, 1.5, 0), 46]),
    [T.l10, P(7, 0, 1.9, 5.4), P(7, 0, 1.7, -1), 46],
    [hero(T), P(7, 0, 3.9, 10.5), P(7, 0, 3.4, -2.6), 50],
    [T.l11end + 0.6, P(7, 0, 4.0, 11.0), P(7, 0, 3.4, -2.6), 50],
    ...cut(T.loop0, [P(7, 0, 4.0, 10.98), P(7, 0, 3.4, -2.6), 50], [P(0, 0.05, 1.5, -0.95), P(0, 0.1, 0.88, -0.05), 42, null, 0.02]),
    [T.D, ...F0, null, 0.02],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l02', 'rendi') - 0.1, w('l02', 'iki') - 0.3, 'RANDY GARDNER', '17 yaşında · San Diego, 1963'], [w('l05', 'klayv') - 0.1, w('l05', 'bin') - 0.1, 'CLIVE WEARING', 'orkestra şefi · İngiltere'], [w('l07', 'debora') - 0.1, hugT - 0.2, 'DEBORAH WEARING', 'Clive\'ın eşi']],
    numbers: [[w('l10', 'randy') - 0.1, w('l10', 6) - 0.2, '264 saat', 'RANDY · 11 GÜN UYANIK'], [w('l10', 'otuz') - 0.2, T.l11 + 0.3, t => Math.round(31728 * ease.enter(seg(t, fillT[0], fillT[1] - fillT[0]))).toLocaleString('tr-TR'), 'CLIVE · YENİDEN BAŞLAYAN SATIR']],
    update(t) {
      for (const u of updates) u(t);
      drawDiary(t);
      const d4 = dark4(t); t4.lights.forEach(L => { L.intensity = 2.5 * 120 * d4; }); t4.hemi.intensity = 0.9 * d4 + 0.05;
    },
  };
}

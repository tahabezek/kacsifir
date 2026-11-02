// № 066 · Nefesini tutan adam ve yüzeye çıkmayan balina (hikâye motoru). Hikâye: research/HIKAYELER.md.
// Tablolar: otel havuzu (Maričić, hakemler, seyirci, kronometre) · okyanus yüzeyi (sırt, dalış) · derin karanlık (yara izli
// balina) · araştırma gemisi (dipte düz kalan derinlik çizgisi) · yüzey (nefes bulutu) · iki şerit (29 dk ve 222 dk).
// Doruk: insanın şeridi 29 dakikada durur; balina kendi şeridinde 222 dakikaya kadar yüzer.

export const opts = { bloom: 0.65, bloomThreshold: 0.9 };
export function hero(T) { return T.l10end + 0.05; }
export function cues(T) {
  const w = (id, k) => T.w(id, k);
  return {
    whip: [[T.l02 - 0.3, T.l02 + 0.1], [T.l05 - 0.3, T.l05 + 0.1], [T.l06 - 0.3, T.l06 + 0.1], [T.l07 - 0.3, T.l07 + 0.1], [T.l08 - 0.3, T.l08 + 0.1], [T.l09 - 0.3, T.l09 + 0.1], [T.loop0 - 0.3, T.loop0 + 0.1]],
    tick: [w('l04', 'durdu'), w('l07', 'saat'), w('l07', 'iki'), w('l07', 'üç')],
    rumble: [[0.5, 0.25], [w('l05', 'küvye'), 0.35]],
    thock: [w('l04', 'durdu')],
    scratch: [[w('l10', 'bu') - 0.2, hero(T), 0.02]],
    riser: [w('l10', 'bu') - 0.2, hero(T)],
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
  const people = [['#E6C4A6', '#5A3A2A', '#3A4A6A', 'short'], ['#D9A982', '#2A1E16', '#7A2E3A', 'long'], ['#F0D4BE', '#B08A5A', '#2A5A4A', 'bun'], ['#B88A66', '#141210', '#5A5A5A', 'curly'], ['#ECCCB2', '#8A7A6A', '#6A4A2A', 'short'], ['#C89A78', '#3A2A1E', '#2A3A5A', 'ponytail']]
    .map(([skin, hair, top, hairStyle], i) => ({ height: 1.65 + (i % 3) * 0.08, heads: 7.3, build: 0.9 + (i % 2) * 0.15, skin, hair, hairStyle, top, bottom: '#2A2A30', dress: hairStyle === 'long' || hairStyle === 'bun' ? 'long' : undefined, shoes: '#2A2420' }));

  // ——— Cuvier gagalı balinası (tek model; baş +x, kuyruk yukarı-aşağı vurur) ———
  function whale(parent) {
    const SL = 6, SR = 0.55, g = new THREE.Group();
    const skin = canvasTex(1024, 512, (c, W, H) => { const r = mulberry32(17); const gr = c.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#C8C2B4'); gr.addColorStop(0.16, '#8A8478'); gr.addColorStop(0.3, '#4A4A4C'); gr.addColorStop(1, '#3A3A3E'); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(236,232,222,0.75)'; for (let i = 0; i < 90; i++) { c.lineWidth = 1 + r() * 2.5; const x = 120 + r() * (W - 180), y = r() * H, l = 30 + r() * 140, a = (r() - 0.5) * 0.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); if (r() < 0.5) { c.beginPath(); c.moveTo(x + 4, y + 5); c.lineTo(x + 4 + Math.cos(a) * l, y + 5 + Math.sin(a) * l); c.stroke(); } } });
    const rad = u => SR * (u < 0.05 ? 0.25 + u / 0.05 * 0.25 : u < 0.2 ? 0.5 + 0.5 * Math.sin((u - 0.05) / 0.15 * Math.PI / 2) : u < 0.6 ? 1 : Math.max(0.08, 1 - Math.pow((u - 0.6) / 0.4, 1.1) * 0.92));
    const prof = []; for (let i = 0; i <= 56; i++) { const u = i / 56; prof.push(new THREE.Vector2(Math.max(0.001, rad(u)), -u * SL)); }
    const geo = new THREE.LatheGeometry(prof, 40); geo.rotateZ(-Math.PI / 2);
    const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: skin, roughness: 0.55 })); g.add(body);
    const base = geo.attributes.position.array.slice();
    const finM = new THREE.MeshStandardMaterial({ color: lin('#3A3A3E'), roughness: 0.6, side: THREE.DoubleSide });
    const fin = pts => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return new THREE.ShapeGeometry(s); };
    const fins = [];
    const add = (gg, u, y, z, rx) => { const m = new THREE.Mesh(gg, finM); m.rotation.x = rx; const h = new THREE.Group(); h.add(m); h.userData = { u, y, z }; g.add(h); fins.push(h); };
    add(fin([[0, 0], [-0.4, 0], [-0.32, 0.22]]), 0.68, SR * 0.6, 0, 0);
    for (const s of [-1, 1]) add(fin([[0, 0], [-0.4, 0], [-0.5, -0.1]]), 0.22, -SR * 0.4, s * SR * 0.75, s * 0.5);
    { const fl = fin([[0, 0], [-0.5, 0.9], [-0.35, 0.95], [-0.05, 0.08], [-0.05, -0.08], [-0.35, -0.95], [-0.5, -0.9]]); add(fl, 0.99, 0, 0, Math.PI / 2); }
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), std('#0A0A0C', { roughness: 0.1 })); eye.position.set(-0.55, 0.08, SR * 0.55); g.add(eye);
    parent.add(g);
    const wave = (u, t) => 0.16 * Math.pow(u, 1.8) * Math.sin(t * 1.6 - u * 4);
    return { g, swim(t) { const p = geo.attributes.position, a = p.array; for (let i = 0; i < p.count; i++) { const u = clamp01(-base[i * 3] / SL); a[i * 3 + 1] = base[i * 3 + 1] + wave(u, t) - wave(0.1, t); } p.needsUpdate = true; geo.computeVertexNormals(); for (const f of fins) { const { u, y, z } = f.userData; f.position.set(-u * SL, y + wave(u, t) - wave(0.1, t), z); } } };
  }
  const seaTop = (tb, color = '#2A5A72') => { const s = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: lin(color), roughness: 0.15, metalness: 0.3 })); s.rotation.x = -Math.PI / 2; tb.g.add(s); return s; };

  // ═══ 0 · otel havuzu ═══
  const t0 = tableau('havuz', { x: X(0), floor: null, spots: [{ x: 0, h: 6, z: 2, tx: 0, tz: 0, I: 90, angle: 0.8, color: '#FFF0DC' }], fog: ['#141418', 0.05], hemi: ['#A8A49A', '#2A2620', 0.9] });
  { const deck = '#C8BEAA'; box(12, 0.3, 4, deck, 0, -0.15, -4.5, t0.g); box(12, 0.3, 6, deck, 0, -0.15, 6, t0.g); box(4, 0.3, 5, deck, -4.5, -0.15, 0.5, t0.g); box(4, 0.3, 5, deck, 4.5, -0.15, 0.5, t0.g);
    box(5, 1.4, 5, '#7AB8C8', 0, -1.0, 0.5, t0.g); const water = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshPhysicalMaterial({ color: lin('#5AB0C8'), roughness: 0.05, transmission: 0.0, transparent: true, opacity: 0.42, metalness: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.set(0, -0.12, 0.5); t0.g.add(water);
    box(12, 4, 0.2, '#5A4E40', 0, 2, -6.4, t0.g);
    const lane = new THREE.MeshStandardMaterial({ color: lin('#E8C21A'), roughness: 0.6 }); for (const x of [-0.45, 0.45]) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.6, 12), lane); n.rotation.x = Math.PI / 2; n.position.set(x, -0.1, 0.5); t0.g.add(n); } }
  const clockC = document.createElement('canvas'); clockC.width = 512; clockC.height = 192; const clockG = clockC.getContext('2d'), clockTex = new THREE.CanvasTexture(clockC); clockTex.colorSpace = THREE.SRGBColorSpace;
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), new THREE.MeshBasicMaterial({ map: clockTex, color: new THREE.Color(1.6, 1.6, 1.6), fog: false })); m.position.set(1.6, 2.2, -6.25); t0.g.add(m); box(1.75, 0.72, 0.08, '#141416', 1.6, 2.2, -6.32, t0.g); }
  const startT = w('l02', 'suya'), stopT = w('l04', 'durdu');
  const clockSec = t => { if (t < T.l02 - 0.15) return 1200 + t; if (t < startT) return 0; if (t < w('l04', 'kronometre')) return 1199 * ease.state(seg(t, startT, w('l04', 'kronometre') - startT)); if (t < stopT) return lerp(1199, 1743, seg(t, w('l04', 'kronometre'), stopT - w('l04', 'kronometre'))); return t < T.l05 ? 1743 : t >= T.loop0 ? 1200 + t - D : 1200 + t; };
  let clockKey = -1;
  const drawClock = t => { const s = Math.floor(clockSec(t)); if (s === clockKey) return; clockKey = s; const g = clockG; g.fillStyle = '#0C0C0E'; g.fillRect(0, 0, 512, 192); g.fillStyle = t >= stopT && t < T.l05 ? '#FFB020' : '#FF4A2A'; g.font = '700 150px Archivo'; g.textAlign = 'center'; g.fillText(`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`, 256, 150); clockTex.needsUpdate = true; };
  const holding = t => t >= startT - 0.3 && t < stopT + 0.2 || t < T.l02 - 0.15 || t >= T.loop0;
  const vit0 = character('maricic', t0, t => {
    if (holding(t)) { const con = t > w('l03', 'diyaframı') - 0.2 && t < w('l03', 'sonradan') ? Math.max(0, Math.sin(t * 9)) : t < T.l02 ? Math.max(0, Math.sin(t * 7)) * 0.4 : 0; return { pos: [0, -0.05, -1.4], rot: 0, rotX: Math.PI / 2, pose: { ...POSE.swimFloat(0), lShoulder: [-2.6, 0.3, -0.5], rShoulder: [-2.6, -0.3, 0.5], lElbow: [-0.4, 0, 0], rElbow: [-0.4, 0, 0], spine: [0.25 * con, 0, 0], neck: [-0.2, 0, 0] }, face: FACE.closed }; }
    if (t < startT) return { pos: [0.2, 0, -2.7], rot: 0.3, pose: { ...POSE.sit(), lShoulder: [-1.2, 0.2, -0.2], lElbow: [-1.9, 0, 0] }, face: FACE.closed };
    const up = seg(t, stopT, 0.6); return { pos: [0, -0.05, -1.4], rot: 0, rotX: lerp(Math.PI / 2, 0.9, ease.enter(up)), pose: { ...POSE.swimFloat(0), lShoulder: [-1.4, 0.3, -0.5], rShoulder: [-2.6, -0.3, 0.5], lElbow: [-1.6, 0, 0], neck: [-0.6 * up, 0, 0], head: [-0.5 * up, 0, 0] }, face: t > stopT + 0.5 ? FACE.grin : FACE.closed };
  });
  const mask = cyl(0.06, 0.08, 0.12, '#E8EEF2', 0, 0, 0, vit0.J.head); mask.position.set(0, 0.05, 0.12); mask.rotation.x = Math.PI / 2;
  updates.push(t => { mask.visible = t >= T.l02 - 0.15 && t < startT - 0.2; });
  const crowd = [[-2.4, 3.6], [-1.6, 3.9], [-0.7, 3.7], [0.4, 3.9], [1.3, 3.6], [2.2, 3.9], [-3.0, -2.7], [-2.2, -2.8]].map(([x, z], i) => character(people[i % 6], t0, t => { const cheer = t > stopT + 0.3 && t < T.l05; const lean = t > w('l03', 'diyaframı') && t < stopT; return { pos: [x, 0, z], rot: Math.atan2(-x, -1.4 - z) + 0.0, pose: cheer ? { ...POSE.armsUp(), lElbow: [-0.6 - 0.4 * Math.sin(t * 9 + i), 0, 0] } : lean ? { ...POSE.stand(), spine: [0.25, 0, 0], lShoulder: [-0.8, 0.5, -0.2], lElbow: [-2.2, 0, 0] } : POSE.stand(), face: cheer ? FACE.grin : lean ? FACE.fear : FACE.neutral }; }));
  const judges = [-1.6, 1.6].map((x, i) => character({ ...people[4 - i], top: '#1A1A1E', bottom: '#1A1A1E' }, t0, () => ({ pos: [x * 1.6, 0, -0.6], rot: x > 0 ? -1.3 : 1.3, pose: { ...POSE.sit(), rShoulder: [-1.2, 0, 0.2], rElbow: [-1.0, 0, 0] }, face: FACE.neutral })));
  judges.forEach(j => { box(0.4, 0.42, 0.4, '#3A3A40', 0, 0.21, 0, j.root).position.set(0, 0.21, -0.05); });

  // ═══ 1 · okyanus yüzeyi: dalış ═══
  const t1 = tableau('yuzey', { x: X(1), floor: null, spots: [{ x: 10, h: 30, z: 20, tx: 0, I: 500, angle: 0.6, color: '#FFE8D0' }], fog: ['#9AB4C4', 0.012], bg: '#A8C0D0', hemi: ['#D8E8F2', '#2A4A5A', 1.1], env: 0.8 });
  seaTop(t1);
  const wh1 = whale(t1.g);
  const dive = t => seg(t, T.l05 + 0.4, w('l05', 'küvye') - 0.3 - T.l05);
  updates.push(t => { const u = dive(t); wh1.swim(t); const a = lerp(0.05, 1.3, ease.enter(u)); wh1.g.position.set(lerp(1.8, 3.2, u), lerp(0.25, -4.5, ease.enter(u)), -2); wh1.g.rotation.set(0, 0, -a); });
  // su altı kısmı: aynı tablonun altı; balina dikine iner (l05 ikinci yarısı)
  const t1b = tableau('dalis', { x: X(2), floor: null, spots: [{ x: 0, h: 20, z: 6, tx: 0, I: 140, angle: 0.5, color: '#9ACAE0', shadow: false }], fog: ['#0A2A3A', 0.05], bg: '#0A2A3A', hemi: ['#3A7A9A', '#020608', 0.8] });
  const wh2 = whale(t1b.g);
  updates.push(t => { wh2.swim(t); const u = seg(t, w('l05', 'küvye') - 0.15, T.l06 - w('l05', 'küvye')); wh2.g.position.set(0.6, lerp(3, -9, u), -1); wh2.g.rotation.set(0, 0.2, -1.35); });
  const deepFog = new THREE.Color();
  motes(t1b, 140, [0.4, 0.6, 0.7], 4, 6);

  // ═══ 2 · derin karanlık ═══
  const t2 = tableau('karanlik', { x: X(3), floor: null, spots: [{ x: 1.5, h: 3, z: 3, tx: 0, I: 45, angle: 0.6, color: '#6A9AB0', shadow: false }], fog: ['#010306', 0.12], bg: '#010306', hemi: ['#0A1A24', '#000000', 0.25] });
  const wh3 = whale(t2.g);
  updates.push(t => { wh3.swim(t * 0.7); wh3.g.position.set(lerp(1.5, -1.5, seg(t, T.l06, T.l06end - T.l06 + 1)), 0, -0.5); wh3.g.rotation.set(0, -0.15, -0.08); });
  { const n = 160, r = mulberry32(61), d = []; for (let i = 0; i < n; i++) d.push([(r() - 0.5) * 10, (r() - 0.5) * 6, -4 + r() * 4, r() * 6.28]); const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.6, 1.8), fog: false }), n); im.frustumCulled = false; t2.g.add(im); updates.push(t => { d.forEach(([x, y, z, p], i) => { const s = 0.5 + 0.5 * Math.sin(t * 2 + p * 3); _m.makeScale(s, s, s); _m.setPosition(x + 0.2 * Math.sin(t * 0.3 + p), y, z); im.setMatrixAt(i, _m); }); im.instanceMatrix.needsUpdate = true; }); }

  // ═══ 3 · araştırma gemisi: derinlik ekranı ═══
  const t3 = tableau('gemi', { x: X(4), floor: '#4A4E54', floorR: 5, spots: [{ x: 0.5, h: 3, z: 1.5, tx: 0, I: 14, angle: 0.7, color: '#E8F0FF' }], fog: ['#0C1014', 0.08], hemi: ['#5A6A7A', '#141618', 0.6] });
  const scrC = document.createElement('canvas'); scrC.width = 768; scrC.height = 432; const scrG = scrC.getContext('2d'), scrTex = new THREE.CanvasTexture(scrC); scrTex.colorSpace = THREE.SRGBColorSpace;
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.79), new THREE.MeshBasicMaterial({ map: scrTex, color: new THREE.Color(1.5, 1.5, 1.5), fog: false })); m.position.set(0, 1.45, -0.9); t3.g.add(m); box(1.5, 0.88, 0.06, '#1A1C20', 0, 1.45, -0.95, t3.g); box(2.4, 0.08, 0.8, '#5A5E66', 0, 0.78, -0.5, t3.g); box(2.3, 0.74, 0.7, '#3A3E46', 0, 0.37, -0.55, t3.g); box(4, 2.6, 0.1, '#2E3238', 0, 1.3, -1.2, t3.g); const port = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.75, 0.9) })); port.position.set(-1.4, 1.6, -1.14); t3.g.add(port); }
  const sci = [character({ ...people[2], top: '#E8E4DA', bottom: '#3A4A5A' }, t3, t => ({ pos: [-0.8, 0, 0.35], rot: Math.PI, pose: { ...POSE.sit(), spine: [0.2, 0, 0] }, face: FACE.neutral })), character({ ...people[3], top: '#3A5A7A', bottom: '#2A2A30', glasses: '#1A1A1A' }, t3, t => ({ pos: [0.9, 0, 0.3], rot: Math.PI - 0.2, pose: { ...POSE.stand(), spine: [0.15, 0, 0], lShoulder: [-0.5, 0, -0.2], lElbow: [-1.8, 0, 0] }, face: t > w('l07', 'üç') ? FACE.surprise : FACE.neutral }))];
  const hrs = t => t < w('l07', 'saat') ? 0.6 * seg(t, T.l07, w('l07', 'saat') - T.l07) : t < w('l07', 'iki') ? lerp(1, 2, seg(t, w('l07', 'saat'), w('l07', 'iki') - w('l07', 'saat'))) : t < w('l07', 'üç') ? lerp(2, 3, seg(t, w('l07', 'iki'), w('l07', 'üç') - w('l07', 'iki'))) : t < w('l08', 'üç') ? lerp(3, 3.6, seg(t, w('l07', 'üç'), w('l08', 'üç') - w('l07', 'üç'))) : 3.7;
  let scrKey = -1;
  function drawScreen(t) {
    const h = hrs(t), k = Math.round(h * 60); if (k === scrKey) return; scrKey = k; const g = scrG, W = 768, H = 432, x0 = 60, x1 = 740, y0 = 60, y1 = 380, xs = hh => x0 + (x1 - x0) * hh / 4;
    g.fillStyle = '#06141C'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,200,220,0.18)'; g.lineWidth = 1; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(xs(i), y0); g.lineTo(xs(i), y1); g.stroke(); }
    g.fillStyle = 'rgba(160,220,235,0.7)'; g.font = '600 22px Archivo'; g.textAlign = 'center'; for (let i = 0; i <= 4; i++) g.fillText(`${i} sa`, xs(i), 412); g.textAlign = 'left'; g.fillText('DERİNLİK', 8, 34);
    g.strokeStyle = '#4AE0D0'; g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= 200; i++) { const hh = h * i / 200; const d = hh < 0.12 ? hh / 0.12 : hh > 3.55 ? Math.max(0, 1 - (hh - 3.55) / 0.15) : 1 - 0.04 * Math.sin(hh * 9); const x = xs(hh), y = y0 + (y1 - y0 - 30) * d; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.fillStyle = '#4AE0D0'; g.beginPath(); g.arc(xs(h), y0 + (y1 - y0 - 30) * (h > 3.55 ? Math.max(0, 1 - (h - 3.55) / 0.15) : h < 0.12 ? h / 0.12 : 1), 9, 0, 7); g.fill();
    scrTex.needsUpdate = true;
  }

  // ═══ 4 · yüzey: nefes ═══
  const t4 = tableau('nefes', { x: X(5), floor: null, spots: [{ x: -10, h: 12, z: 10, tx: 0, I: 300, angle: 0.6, color: '#FFB878' }], fog: ['#C8A090', 0.02], bg: '#D8A88A', hemi: ['#F2C8A8', '#2A3A4A', 1.0], env: 0.7 });
  seaTop(t4, '#3A5A6A');
  const wh4 = whale(t4.g);
  const surf = w('l08', 'yüzeye');
  updates.push(t => { wh4.swim(t); const u = seg(t, T.l08 - 0.2, surf - T.l08 + 0.2); wh4.g.position.set(-0.5, lerp(-2, 0.22, ease.enter(u)), 0); wh4.g.rotation.set(0, 0.5, lerp(-0.4, 0.04, ease.enter(u))); });
  const blow = []; { const r = mulberry32(71), m = new THREE.MeshStandardMaterial({ color: lin('#F2F0EA'), roughness: 1, transparent: true, opacity: 0.85 }); for (let i = 0; i < 26; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), m); s.userData = [(r() - 0.5) * 0.5, r(), (r() - 0.5) * 0.5, 0.12 + r() * 0.14]; t4.g.add(s); blow.push(s); } }

  // ═══ 5 · iki şerit ═══
  const t5 = tableau('serit', { x: X(6), floor: '#2A2E36', floorR: 40, spots: [{ x: 8, h: 16, z: 8, tx: 9, I: 600, angle: 1.0, color: '#E8EEF8' }], fog: ['#0A0C10', 0.012], hemi: ['#6A7280', '#0A0A0C', 1.0] });
  const S5 = 0.1;   // 1 dk = 0,1 m
  const barM = c => new THREE.MeshBasicMaterial({ color: new THREE.Color(...c), fog: false });
  const humanBar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 0.6).translate(0.5, 0, 0), barM([2.4, 1.6, 0.4])); humanBar.position.set(0, 0.15, 0.6); t5.g.add(humanBar);
  const whaleBar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 0.6).translate(0.5, 0, 0), barM([0.5, 1.9, 2.1])); whaleBar.position.set(0, 0.15, -1.4); t5.g.add(whaleBar);
  for (let m = 0; m <= 240; m += 30) { box(0.02, 0.01, 3.4, '#5A5E66', m * S5, 0.005, -0.4, t5.g); }
  const vit5 = character('maricic', t5, t => ({ pos: [-0.5, 0, 1.3], rot: 0.5, pose: POSE.stand(), face: t > hero(T) - 0.3 ? FACE.surprise : FACE.neutral }));
  const wh5 = whale(t5.g); wh5.g.scale.setScalar(0.6);
  const humT = [w('l10', 'yirmi') - 0.2, w('l10', 'dakika') + 0.2], whT = [w('l10', 'balinanın') - 0.2, hero(T)];
  const humLen = t => 29 * ease.state(seg(t, humT[0], humT[1] - humT[0])), whLen = t => 29 + 193 * ease.enter(seg(t, whT[0], whT[1] - whT[0]));
  updates.push(t => { const hl = Math.max(0.01, humLen(t)), wl = t < whT[0] ? Math.max(0.01, humLen(t)) : whLen(t); humanBar.scale.x = hl * S5; whaleBar.scale.x = wl * S5; wh5.swim(t); wh5.g.position.set(wl * S5 + 0.15, 1.1, -1.4); wh5.g.rotation.set(0, 0, 0); });

  // ——— kamera ———
  const cut = (t, a, b) => [[t - 0.001, ...a], [t, ...b]];
  const P = (i, x, y, z) => [X(i) + x, y, z];
  const F0 = [P(0, 0.9, 1.4, 1.4), P(0, 0, -0.1, -0.3), 42];
  const cam = [
    [0, ...F0, null, 0.03],
    [T.l01end, P(0, 1.6, 2.3, 3.4), P(0, 0.8, 0.9, -3), 48],
    ...cut(T.l02 - 0.15, [P(0, 1.6, 2.3, 3.38), P(0, 0.8, 0.9, -3), 48], [P(0, -1.8, 1.5, 3.2), P(0, 0.3, 1.0, -2.0), 44]),
    [w('l02', 'dalgıç'), P(0, -0.8, 1.2, 0.4), P(0, 0.25, 1.0, -2.6), 38],
    [w('l02', 'sonra'), P(0, 0.6, 1.1, -0.6), P(0, 0.2, 0.9, -2.6), 36],
    ...cut(startT - 0.1, [P(0, 0.6, 1.1, -0.62), P(0, 0.2, 0.9, -2.6), 36], [P(0, 0.4, 2.2, 1.6), P(0, 0, -0.1, -0.6), 44]),
    [w('l03', 'sonradan'), P(0, 0.8, 1.6, 1.2), P(0, 0, 0, -0.5), 40],
    [w('l03', 'sadece'), P(0, -0.9, 1.3, 1.6), P(0, -1.4, 1.5, 3.8), 40],
    ...cut(T.l04 - 0.15, [P(0, -0.9, 1.3, 1.58), P(0, -1.4, 1.5, 3.8), 40], [P(0, 2.4, 1.8, 1.8), P(0, 1.4, 1.8, -6), 44]),
    [stopT - 0.01, P(0, 1.8, 1.5, 1.0), P(0, 1.2, 1.8, -6), 42],
    [stopT, P(0, 1.3, 1.1, 1.4), P(0, 0, 0.3, -0.2), 40],
    [T.l04end + 0.5, P(0, 1.0, 1.0, 1.1), P(0, 0, 0.4, -0.2), 38],
    ...cut(T.l05 - 0.15, [P(0, 1.0, 1.0, 1.08), P(0, 0, 0.4, -0.2), 38], [P(1, 0.6, 1.2, 6.5), P(1, 0, 0.1, -2), 42]),
    [w('l05', 'küvye') - 0.3, P(1, 1.2, 1.3, 6.5), P(1, 0.6, -0.3, -2), 42],
    ...cut(w('l05', 'küvye') - 0.15, [P(1, 1.2, 1.3, 6.48), P(1, 0.6, -0.3, -2), 42], [P(2, 0.4, 2.0, 14), P(2, 0.4, 0.5, -1), 46]),
    [T.l05end + 0.4, P(2, 0.4, -3, 14.5), P(2, 0.4, -6, -1), 46],
    ...cut(T.l06 - 0.15, [P(2, 0.4, -3, 14.48), P(2, 0.4, -6, -1), 46], [P(3, 0.6, 0.6, 7.5), P(3, -0.5, 0, -0.5), 44]),
    [w('l06', 'oysa'), P(3, -0.4, 0.5, 6.2), P(3, -1.0, 0.05, -0.5), 42],
    [T.l06end + 0.4, P(3, -1.0, 0.4, 4.6), P(3, -1.6, 0.1, -0.5), 38, null, 0.03],
    ...cut(T.l07 - 0.15, [P(3, -1.0, 0.4, 4.58), P(3, -1.6, 0.1, -0.5), 38], [P(4, 0.3, 1.75, 3.8), P(4, 0, 1.25, -0.9), 46]),
    [w('l07', 'saat'), P(4, 0.1, 1.6, 2.6), P(4, 0, 1.35, -0.9), 44],
    [T.l07end + 0.3, P(4, 0.2, 1.45, 0.9), P(4, 0, 1.45, -0.9), 40],
    ...cut(T.l08 - 0.15, [P(4, 0.2, 1.45, 0.88), P(4, 0, 1.45, -0.9), 40], [P(5, 2.5, 0.7, 6.5), P(5, -0.8, 0.4, 0), 40]),
    [T.l08end + 0.4, P(5, 2.2, 0.9, 5.8), P(5, -0.6, 1.0, 0), 42],
    ...cut(T.l09 - 0.15, [P(5, 2.2, 0.9, 5.78), P(5, -0.6, 1.0, 0), 42], [P(6, 0.9, 1.7, 5.0), P(6, 0.8, 0.8, 0), 46]),
    [humT[1] + 0.3, P(6, 1.8, 2.0, 6.0), P(6, 1.6, 0.7, -0.4), 46],
    [hero(T), P(6, 11, 14, 34), P(6, 11, 0.4, -0.4), 60],
    [T.l11end + 0.6, P(6, 11, 14.5, 35), P(6, 11, 0.4, -0.4), 60],
    ...cut(T.loop0, [P(6, 11, 14.5, 34.98), P(6, 11, 0.4, -0.4), 60], [P(0, 1.1, 1.7, 1.9), P(0, 0, -0.1, -0.4), 44, null, 0.03]),
    [T.D, ...F0, null, 0.03],
  ];
  const cuts = cam.filter((k, i) => i > 0 && k[0] - cam[i - 1][0] < 0.01).map(k => k[0]);

  return {
    cam, cuts,
    names: [[w('l02', 'vitomir') - 0.1, w('l02', 'sonra') - 0.2, 'VITOMIR MARIČIĆ', 'serbest dalgıç · Hırvatistan, 2025']],
    numbers: [[stopT - 0.05, T.l05 - 0.3, '29:03', 'OKSİJEN DESTEKLİ REKOR'], [w('l06', 'tipik') - 0.1, w('l06', 'oysa') - 0.2, '~1 saat', 'TİPİK DALIŞ'], [w('l06', 'oysa') - 0.05, T.l07 - 0.3, '~30 dk', 'HESAPLANAN OKSİJEN SÜRESİ'], [w('l08', 'üç') - 0.1, T.l09 - 0.3, '3 sa 42 dk', 'TEK DALIŞ'],
      [humT[0], w('l10', 'balinanın') - 0.4, t => Math.round(humLen(t)) + ' dk', 'İNSAN'], [w('l10', 'balinanın') + 0.1, T.l11 + 0.3, t => Math.round(whLen(t)) + ' dk', 'CUVIER GAGALI BALİNASI']],
    update(t) {
      for (const u of updates) u(t);
      drawClock(t); drawScreen(t);
      const b = seg(t, surf - 0.1, 2.2); blow.forEach(s => { const [x, u, z, r] = s.userData; const k = clamp01((b - u * 0.3) * 1.6); s.visible = b > 0 && b < 1; s.position.set(-0.9 + x * k * 2, 0.6 + (0.4 + u * 1.8) * k, 0.25 + z * k * 2); s.scale.setScalar(r * (0.4 + k)); s.material.opacity = 0.7 * (1 - b); });
    },
  };
}

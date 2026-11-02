// Karakter sistemi (Sinema filmleri): tek bir rig ile bütün insan karakterleri.
// CLAUDE.md §6: karakter elle yeniden çizilmez; dondurulmuş bir KART (oranlar, palet, giysi, imza ayrıntısı) ve
// eklem açılarıyla verilen POZ ile bu işlev çizer. Fotoğraf benzerliği aranmaz; kimliği yaş, giysi ve ayrıntı taşır.
//
//   const f = makeFigure(THREE, card);  scene.add(f.root);
//   f.pose(POSE.walk(phase), t);  f.face(FACE.fear);  f.root.position.set(...)
//
// Oranlar baş birimiyle (card.heads, varsayılan 7,4). Eklemler: kalça → bel → göğüs → boyun → baş; göğüs → omuz →
// dirsek → bilek; kalça → uyluk → diz → ayak bileği. Poz: { joint: [x, y, z] } radyan (yalnız verilenler değişir).
import { lerp } from './core.js';

const s2l = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linC = (THREE, h) => new THREE.Color().setRGB(...[1, 3, 5].map(i => s2l(parseInt(h.slice(i, i + 2), 16) / 255)), THREE.LinearSRGBColorSpace);

export function makeFigure(THREE, card) {
  const H = card.height ?? 1.75;
  const headS = card.headScale ?? 1.2 * (7.4 / (card.heads ?? 7.4));   // stilize: baş büyük, yüz telefonda okunur; çocukta daha büyük
  const u = H / (6.62 + 1.15 * headS);                                // bacak + gövde + boyun = 6,62 birim; baş ≈ 1,15 birim × headS
  const bw = card.build ?? 1;                                          // genişlik çarpanı (1 = orta)
  const mat = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: linC(THREE, hex), roughness: 0.72, ...o });
  const skin = mat(card.skin ?? '#D9A982', { roughness: 0.6 });
  const topM = mat(card.top ?? '#E8E4DA'), botM = mat(card.bottom ?? '#2E3440'), shoeM = mat(card.shoes ?? '#2A2420', { roughness: 0.5 });
  const hairM = mat(card.hair ?? '#2A1C14', { roughness: 0.85 });
  const caps = (r, len, m) => { const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 6, 14).translate(0, -len / 2, 0); const me = new THREE.Mesh(g, m); me.castShadow = me.receiveShadow = true; return me; };
  const ell = (rx, ry, rz, m) => { const me = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), m); me.scale.set(rx, ry, rz); me.castShadow = me.receiveShadow = true; return me; };
  const G = () => new THREE.Group();
  const put = (m, x, y, z) => { m.position.set(x, y, z); return m; };

  // ——— uzunluklar (m) ———
  const L = {
    pelvis: 0.55 * u, spine: 1.0 * u, chest: 1.25 * u, neck: 0.35 * u, head: u,
    thigh: 1.92 * u, shin: 1.85 * u, foot: 0.25 * u,
    upper: 1.42 * u, fore: 1.22 * u, hand: 0.62 * u,
    shoulder: 0.95 * u * bw, hip: 0.42 * u * bw,
  };
  const legLen = L.thigh + L.shin + L.foot;
  const root = G(), hips = G(); root.add(hips); hips.position.y = legLen;   // root yerde, kalça bacak boyunda
  const J = { hips };
  // gövde
  const spine = G(); hips.add(spine); J.spine = spine;
  const chest = G(); spine.add(chest); chest.position.y = L.spine; J.chest = chest;
  const neck = G(); chest.add(neck); neck.position.y = L.chest; J.neck = neck;
  const head = G(); neck.add(head); head.position.y = L.neck; head.scale.setScalar(headS); J.head = head;
  const dress = card.dress;                                       // elbise: göğüsten dize koni etek
  hips.add(put(ell(L.hip * 1.5, L.pelvis * 1.05, 0.55 * u * bw, dress ? topM : botM), 0, 0.1 * u, 0));
  spine.add(put(ell(0.66 * u * bw, L.spine * 0.9, 0.48 * u * bw, topM), 0, L.spine * 0.5, 0));
  chest.add(put(ell(L.shoulder * 0.86, L.chest * 0.66, 0.5 * u * bw * (card.chestDepth ?? 1), topM), 0, L.chest * 0.48, 0));
  neck.add(put(caps(0.25 * u, L.neck + 0.3 * u, skin), 0, L.neck + 0.15 * u, 0));
  if (dress) {
    const len = dress === 'long' ? L.thigh + L.shin * 0.9 : L.thigh * 1.05;
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.6 * u * bw, 1.15 * u * bw, len, 24, 1, true).translate(0, -len / 2, 0), new THREE.MeshStandardMaterial({ color: topM.color, roughness: 0.8, side: THREE.DoubleSide }));
    sk.castShadow = true; sk.position.y = 0.25 * u; hips.add(sk);
  }
  if (card.apron) { const ap = new THREE.Mesh(new THREE.PlaneGeometry(0.75 * u, L.thigh * 0.9), new THREE.MeshStandardMaterial({ color: linC(THREE, card.apron), side: THREE.DoubleSide, roughness: 0.8 })); ap.position.set(0, -L.thigh * 0.3, 0.66 * u * bw); hips.add(ap); }
  // baş ve yüz
  const skull = ell(0.5 * u, 0.58 * u, 0.55 * u, skin); skull.position.y = 0.5 * u; head.add(skull);
  const jaw = ell(0.4 * u, 0.3 * u, 0.42 * u, skin); jaw.position.set(0, 0.22 * u, 0.06 * u); head.add(jaw);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.075 * u, 0.2 * u, 10), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.44 * u, 0.56 * u); head.add(nose);
  for (const s of [-1, 1]) { const ear = ell(0.07 * u, 0.13 * u, 0.05 * u, skin); ear.position.set(s * 0.5 * u, 0.48 * u, 0); head.add(ear); }
  const white = new THREE.MeshStandardMaterial({ color: linC(THREE, '#F4F1EA'), roughness: 0.3 }), pupilM = new THREE.MeshStandardMaterial({ color: linC(THREE, card.eyes ?? '#2A1E16'), roughness: 0.15 });
  const browM = mat(card.brows ?? card.hair ?? '#2A1C14'), mouthM = new THREE.MeshStandardMaterial({ color: linC(THREE, '#5A2A24'), roughness: 0.6 });
  const eyes = [], brows = [];
  for (const s of [-1, 1]) {
    const e = G(); e.position.set(s * 0.19 * u, 0.56 * u, 0.47 * u); head.add(e);
    const w = ell(0.11 * u, 0.1 * u, 0.06 * u, white); e.add(w);
    const p = ell(0.055 * u, 0.06 * u, 0.03 * u, pupilM); p.position.z = 0.045 * u; e.add(p);
    eyes.push({ e, p });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2 * u, 0.04 * u, 0.04 * u), browM); b.position.set(s * 0.19 * u, 0.72 * u, 0.5 * u); head.add(b); brows.push(b);
  }
  const mouth = G(); mouth.position.set(0, 0.26 * u, 0.5 * u); head.add(mouth);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.13 * u, 0.018 * u, 6, 16, Math.PI), mouthM); lip.rotation.z = Math.PI; mouth.add(lip);
  const mouthHole = ell(0.11 * u, 0.06 * u, 0.02 * u, new THREE.MeshStandardMaterial({ color: linC(THREE, '#2A0E0C'), roughness: 0.9 })); mouthHole.position.z = -0.005 * u; mouth.add(mouthHole);
  // saç
  const hs = card.hairStyle ?? 'short';
  const addHair = (m, x, y, z) => { m.position.set(x, y, z); head.add(m); return m; };
  if (hs !== 'bald') {
    const cap = ell(0.56 * u, 0.5 * u, 0.6 * u, hairM); cap.rotation.x = -0.45; addHair(cap, 0, 0.7 * u, -0.09 * u);   // alından geriye: yüz açık kalır
    if (hs === 'curly' || hs === 'mullet') for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = 0.5 * u; const c = ell(0.12 * u, 0.12 * u, 0.12 * u, hairM); addHair(c, Math.cos(a) * r * 0.95, 0.78 * u + Math.sin(i * 1.7) * 0.06 * u, Math.sin(a) * r * 0.95 - 0.05 * u); }
    if (hs === 'mullet' || hs === 'long') { const back = ell(0.46 * u, 0.55 * u, 0.22 * u, hairM); addHair(back, 0, hs === 'long' ? 0.1 * u : 0.3 * u, -0.42 * u); }
    if (hs === 'ponytail') { const tail = caps(0.12 * u, 0.9 * u, hairM); tail.rotation.x = -0.5; addHair(tail, 0, 0.75 * u, -0.5 * u); }
    if (hs === 'bun') { const b = ell(0.2 * u, 0.2 * u, 0.2 * u, hairM); addHair(b, 0, 0.95 * u, -0.38 * u); }
    if (hs === 'crew') cap.scale.set(0.54 * u, 0.42 * u, 0.58 * u);
  }
  if (card.beard) { const bd = ell(0.42 * u, 0.28 * u, 0.4 * u, mat(card.beard)); bd.position.set(0, 0.16 * u, 0.12 * u); head.add(bd); }
  if (card.mustache) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3 * u, 0.06 * u, 0.06 * u), mat(card.mustache)); m.position.set(0, 0.33 * u, 0.55 * u); head.add(m); }
  if (card.glasses) { const gm = new THREE.MeshStandardMaterial({ color: linC(THREE, card.glasses), roughness: 0.3, metalness: 0.5 }); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.12 * u, 0.015 * u, 6, 20), gm); r.position.set(s * 0.19 * u, 0.56 * u, 0.56 * u); head.add(r); } }
  if (card.bandage) { const bm = mat('#EDE9E0', { roughness: 0.95 }); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.56 * u, 0.56 * u, 0.42 * u, 20, 1, true), bm); b.position.y = 0.7 * u; head.add(b); }
  const hatM = card.hatColor ? mat(card.hatColor) : null;
  if (card.hat === 'beret') { const h = ell(0.6 * u, 0.18 * u, 0.6 * u, hatM); h.position.set(0.05 * u, 1.02 * u, -0.02 * u); h.rotation.z = -0.15; head.add(h); }
  if (card.hat === 'helmet') { const h = new THREE.Mesh(new THREE.SphereGeometry(0.62 * u, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hatM); h.position.y = 0.72 * u; head.add(h); const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * u, 0.1 * u, 0.1 * u, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5.5, 4) })); lamp.rotation.x = Math.PI / 2; lamp.position.set(0, 0.95 * u, 0.6 * u); head.add(lamp); }
  if (card.hat === 'ranger') { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.95 * u, 0.95 * u, 0.04 * u, 24), hatM); br.position.y = 0.95 * u; head.add(br); const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.42 * u, 0.5 * u, 0.42 * u, 16), hatM); cr.position.y = 1.15 * u; head.add(cr); }
  if (card.hat === 'cap') { const h = new THREE.Mesh(new THREE.SphereGeometry(0.56 * u, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hatM); h.position.y = 0.76 * u; head.add(h); const v = new THREE.Mesh(new THREE.BoxGeometry(0.6 * u, 0.04 * u, 0.4 * u), hatM); v.position.set(0, 0.78 * u, 0.6 * u); head.add(v); }
  if (card.hat === 'beanie') { const h = new THREE.Mesh(new THREE.SphereGeometry(0.57 * u, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hatM); h.scale.y = 1.25; h.position.y = 0.66 * u; head.add(h); }
  if (card.hat === 'stewardess') { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * u, 0.5 * u, 0.22 * u, 20), hatM); h.position.set(0, 1.02 * u, 0); head.add(h); }
  if (card.hat === 'straw') { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.85 * u, 0.85 * u, 0.04 * u, 24), hatM); br.position.y = 0.92 * u; head.add(br); const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.42 * u, 0.48 * u, 0.36 * u, 16), hatM); cr.position.y = 1.1 * u; head.add(cr); }
  if (card.goggles) { const gm = new THREE.MeshStandardMaterial({ color: linC(THREE, card.goggles), roughness: 0.1, metalness: 0.3 }); const g = new THREE.Mesh(new THREE.BoxGeometry(0.62 * u, 0.2 * u, 0.12 * u), gm); g.position.set(0, 0.56 * u, 0.5 * u); head.add(g); }

  // ——— kollar ve bacaklar ———
  const sleeve = card.sleeve ?? 'long';           // long | short | none
  const legWear = card.legs ?? 'pants';           // pants | shorts | bare | dhoti
  for (const s of [-1, 1]) {
    const k = s < 0 ? 'l' : 'r';
    const sh = G(); sh.position.set(s * L.shoulder * 0.8, L.chest * 0.86, 0); chest.add(sh); J[k + 'Shoulder'] = sh;
    sh.add(caps(0.25 * u * bw, L.upper, sleeve === 'none' ? skin : topM));
    const el = G(); el.position.y = -L.upper; sh.add(el); J[k + 'Elbow'] = el;
    el.add(caps(0.21 * u * bw, L.fore, sleeve === 'long' ? topM : skin));
    const wr = G(); wr.position.y = -L.fore; el.add(wr); J[k + 'Wrist'] = wr;
    const hand = ell(0.13 * u, 0.3 * u, 0.08 * u, skin); hand.position.y = -0.28 * u; wr.add(hand);
    const thumb = caps(0.045 * u, 0.22 * u, skin); thumb.position.set(-s * 0.1 * u, -0.1 * u, 0.06 * u); thumb.rotation.z = s * 0.6; wr.add(thumb);
    const hip = G(); hip.position.set(s * L.hip, 0, 0); hips.add(hip); J[k + 'Hip'] = hip;
    const thighM = legWear === 'bare' ? skin : (dress && dress !== 'long') ? skin : botM;
    hip.add(caps(0.34 * u * bw, L.thigh, dress ? skin : thighM));
    const kn = G(); kn.position.y = -L.thigh; hip.add(kn); J[k + 'Knee'] = kn;
    kn.add(caps(0.26 * u * bw, L.shin, legWear === 'pants' && !dress ? botM : skin));
    if (legWear === 'dhoti') { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * u, 0.42 * u, L.thigh * 1.05, 14, 1, true).translate(0, -L.thigh / 2, 0), new THREE.MeshStandardMaterial({ color: botM.color, roughness: 0.85, side: THREE.DoubleSide })); hip.add(d); }
    const an = G(); an.position.y = -L.shin; kn.add(an); J[k + 'Ankle'] = an;
    const foot = ell(0.14 * u, 0.12 * u, 0.36 * u, card.shoes === 'barefoot' ? skin : shoeM); foot.position.set(0, -0.12 * u, 0.15 * u); an.add(foot);
  }
  // el nesnesi takmak için: f.hand('r').add(mesh)
  const hand = side => J[side + 'Wrist'];

  // ——— poz ve ifade ———
  const REST = {};
  for (const k of Object.keys(J)) REST[k] = J[k].rotation.clone();
  function pose(p) {
    for (const k of Object.keys(J)) { const r = p[k]; const o = REST[k]; J[k].rotation.set(o.x + (r ? r[0] : 0), o.y + (r ? r[1] : 0), o.z + (r ? r[2] : 0)); }
    hips.position.y = legLen * (1 + (p.liftK ?? 0)) + (p.lift ?? 0);   // liftK: bacak boyuna göre (oturma, diz çökme)
  }
  function face(f) {
    const open = f.eyes ?? 1;
    for (const { e, p } of eyes) { e.scale.y = Math.max(0.08, open); p.position.x = (f.look ?? 0) * 0.03 * u; p.position.y = (f.lookY ?? 0) * 0.03 * u; }   // göz kısılır/kapanır
    brows.forEach((b, i) => { const s = i ? 1 : -1; b.position.y = (0.72 + (f.browUp ?? 0) * 0.08) * u; b.rotation.z = s * (f.browTilt ?? 0) * 0.5; });
    const sm = f.smile ?? 0.15; lip.scale.set(1, Math.abs(sm) < 0.06 ? 0.06 : sm * 1.3, 1);   // + gülümseme, − somurtma
    mouthHole.scale.set(0.11 * u * (1 - 0.2 * (f.open ?? 0)), 0.06 * u * (f.open ?? 0) + 0.002 * u, 0.02 * u);
  }
  pose({}); face(FACE.neutral);
  root.traverse(o => { if (o.isMesh) o.frustumCulled = true; });
  return { root, J, pose, face, hand, u, H, legLen };
}

// ——— ifadeler ———
export const FACE = {
  neutral: { eyes: 1, browUp: 0, browTilt: 0, smile: 0.15, open: 0 },
  smile: { eyes: 0.85, browUp: 0.2, browTilt: 0, smile: 0.9, open: 0.15 },
  grin: { eyes: 0.7, browUp: 0.3, browTilt: -0.2, smile: 1, open: 0.5 },
  fear: { eyes: 1, browUp: 0.9, browTilt: 0.6, smile: -0.4, open: 0.6 },
  sad: { eyes: 0.6, browUp: 0.3, browTilt: 0.7, smile: -0.6, open: 0 },
  pain: { eyes: 0.15, browUp: -0.2, browTilt: 0.8, smile: -0.7, open: 0.4 },
  surprise: { eyes: 1, browUp: 1, browTilt: 0, smile: 0, open: 0.9 },
  determined: { eyes: 0.75, browUp: -0.4, browTilt: -0.5, smile: -0.1, open: 0 },
  closed: { eyes: 0, browUp: 0, browTilt: 0, smile: 0, open: 0 },
  shout: { eyes: 0.9, browUp: 0.2, browTilt: -0.4, smile: -0.2, open: 1 },
};

// ——— pozlar (eklem açıları) ———
const Z = [0, 0, 0];
export const POSE = {
  stand: () => ({ lShoulder: [0, 0, -0.08], rShoulder: [0, 0, 0.08], lElbow: [-0.1, 0, 0], rElbow: [-0.1, 0, 0] }),
  // yürüme/koşu: ph 0..1 döngü
  walk: (ph, k = 1) => { const a = Math.sin(ph * Math.PI * 2), b = Math.cos(ph * Math.PI * 2);
    return { lHip: [-0.45 * a * k, 0, 0], rHip: [0.45 * a * k, 0, 0], lKnee: [Math.max(0, 0.7 * b) * k, 0, 0], rKnee: [Math.max(0, -0.7 * b) * k, 0, 0],
      lShoulder: [0.4 * a * k, 0, -0.08], rShoulder: [-0.4 * a * k, 0, 0.08], lElbow: [-0.3 * k, 0, 0], rElbow: [-0.3 * k, 0, 0], spine: [0.04 * k, 0.06 * a * k, 0], lift: -0.02 * Math.abs(b) * k }; },
  run: ph => { const p = POSE.walk(ph, 1.6); p.spine = [0.25, 0.1 * Math.sin(ph * Math.PI * 2), 0]; p.lElbow = [-1.3, 0, 0]; p.rElbow = [-1.3, 0, 0]; return p; },
  sit: () => ({ lHip: [-1.5, 0, 0.05], rHip: [-1.5, 0, -0.05], lKnee: [1.5, 0, 0], rKnee: [1.5, 0, 0], lShoulder: [-0.3, 0, -0.1], rShoulder: [-0.3, 0, 0.1], lElbow: [-0.8, 0, 0], rElbow: [-0.8, 0, 0], liftK: -0.57 }),
  sitHunched: () => ({ ...POSE.sit(), spine: [0.45, 0, 0], neck: [0.3, 0, 0], head: [0.2, 0, 0], lShoulder: [-0.6, 0, -0.2], rShoulder: [-0.6, 0, 0.2], lElbow: [-1.4, 0, 0], rElbow: [-1.4, 0, 0] }),
  kneel: () => ({ lHip: [-1.4, 0, 0], rHip: [0.1, 0, 0], lKnee: [1.5, 0, 0], rKnee: [1.6, 0, 0], spine: [0.15, 0, 0], liftK: -0.38 }),
  crouch: () => ({ lHip: [-1.9, 0, 0.15], rHip: [-1.9, 0, -0.15], lKnee: [2.2, 0, 0], rKnee: [2.2, 0, 0], lAnkle: [-0.3, 0, 0], rAnkle: [-0.3, 0, 0], spine: [0.5, 0, 0], lShoulder: [-0.6, 0, -0.3], rShoulder: [-0.6, 0, 0.3], lElbow: [-1.2, 0, 0], rElbow: [-1.2, 0, 0], liftK: -0.55 }),
  armsUp: () => ({ lShoulder: [-2.9, 0, -0.3], rShoulder: [-2.9, 0, 0.3], lElbow: [-0.2, 0, 0], rElbow: [-0.2, 0, 0], head: [-0.2, 0, 0] }),
  hug: () => ({ lShoulder: [-1.4, 0.6, -0.2], rShoulder: [-1.4, -0.6, 0.2], lElbow: [-1.2, 0, 0.3], rElbow: [-1.2, 0, -0.3], spine: [0.05, 0, 0] }),
  holdOut: () => ({ lShoulder: [-1.2, 0.2, -0.1], rShoulder: [-1.2, -0.2, 0.1], lElbow: [-0.5, 0, 0], rElbow: [-0.5, 0, 0] }),     // iki elle önde tutar (bebek, kâğıt)
  phone: () => ({ rShoulder: [-0.25, 0, 0.3], rElbow: [-2.45, 0, 0], head: [0, -0.15, 0.1], lShoulder: [0.2, 0, -0.3], lElbow: [-0.6, 0, 0] }),
  hammer: ph => { const a = Math.max(0, Math.sin(ph * Math.PI * 2)); return { ...POSE.kneel(), rShoulder: [-1.3 - 1.2 * a, 0, 0.1], rElbow: [-0.4 - 0.6 * a, 0, 0], lShoulder: [-1.0, 0.3, -0.1], lElbow: [-0.6, 0, 0], spine: [0.35, 0, 0], head: [0.2, 0, 0] }; },
  fallBack: () => ({ spine: [-0.5, 0, 0], lShoulder: [-2.2, 0, -0.8], rShoulder: [-2.0, 0, 0.9], lHip: [-0.6, 0, 0], rHip: [0.2, 0, 0], lKnee: [0.6, 0, 0], head: [-0.4, 0, 0] }),
  limp: () => ({ spine: [0.2, 0, 0.1], neck: [0.3, 0, 0.2], head: [0.3, 0, 0], lShoulder: [0, 0, -0.2], rShoulder: [0, 0, 0.2], lHip: [-0.1, 0, 0.05], rHip: [-0.2, 0, -0.05], lKnee: [0.2, 0, 0], rKnee: [0.3, 0, 0] }),
  swimFloat: ph => ({ spine: [-0.1, 0, 0], lShoulder: [-1.6 + 0.2 * Math.sin(ph * 6.28), 0, -0.4], rShoulder: [-1.6 - 0.2 * Math.sin(ph * 6.28), 0, 0.4], lHip: [0.1 * Math.sin(ph * 6.28), 0, 0], rHip: [-0.1 * Math.sin(ph * 6.28), 0, 0] }),
  climb: ph => { const a = Math.sin(ph * Math.PI * 2); return { lShoulder: [-2.6 + 0.4 * a, 0, -0.2], rShoulder: [-2.6 - 0.4 * a, 0, 0.2], lElbow: [-0.6, 0, 0], rElbow: [-0.6, 0, 0], lHip: [-0.9 - 0.4 * a, 0, 0], rHip: [-0.9 + 0.4 * a, 0, 0], lKnee: [1.2, 0, 0], rKnee: [1.2, 0, 0] }; },
  conduct: ph => { const a = Math.sin(ph * Math.PI * 2); return { rShoulder: [-1.6 + 0.5 * a, 0, 0.5], rElbow: [-0.7 + 0.3 * a, 0, 0], lShoulder: [-1.3 - 0.3 * a, 0, -0.5], lElbow: [-0.9, 0, 0], head: [-0.1, 0, 0] }; },
  piano: ph => ({ ...POSE.sit(), spine: [0.15, 0, 0], lShoulder: [-0.9, 0.1, -0.15], rShoulder: [-0.9, -0.1, 0.15], lElbow: [-0.9 + 0.1 * Math.sin(ph * 25), 0, 0], rElbow: [-0.9 + 0.1 * Math.sin(ph * 31 + 1), 0, 0], head: [0.25, 0, 0] }),
  write: () => ({ ...POSE.sit(), spine: [0.3, 0, 0], head: [0.4, 0, 0], rShoulder: [-0.9, 0, 0.2], rElbow: [-1.4, 0, 0], lShoulder: [-0.7, 0, -0.2], lElbow: [-1.3, 0, 0] }),
};
// iki poz arasında karışım (u 0..1)
export function mixPose(a, b, u) {
  const out = {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (k === 'lift' || k === 'liftK') { out[k] = lerp(a[k] ?? 0, b[k] ?? 0, u); continue; }
    const x = a[k] ?? Z, y = b[k] ?? Z; out[k] = [lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)];
  }
  return out;
}
export function mixFace(a, b, u) { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = lerp(a[k] ?? 0, b[k] ?? 0, u); return o; }

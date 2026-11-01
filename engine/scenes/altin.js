// "Altın" şablonu (№ 067): Dünyadaki bütün altın tek bir küp olsa?
// Gece, bir Türk apartman sokağı. Sokağın sonundaki meydanda külçelerden örülmüş 22,6 m'lik altın küp; yanında
// 7 katlı bir apartman. Kamera sokaktan meydana iner (−z), sonra sola açılan bir yayla küpü apartmanla yan yana
// gösterir. Sessizlikten sonra küpün sağ ön alt köşesinden 6 m'lik bir parça (Türkiye) sokağa kayar ("ton"da
// oturur: filmin tek büyük vuruşu); "içinde"de geri yerine oturur; kamera sokağın başına döner (döngü).
// Sürekli döngüler: sokak lambaları ve pencereler, karşıdan gelen sarı taksi, küpün yüzeyinde gezen yansımalar.
// Her kare t'nin saf fonksiyonu; rastgelelik tohumlu.
import { W, H, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { F, setFont, wrap } from '../tower.js';
import { makeSinema, lin, track3, monotone, shadowText } from '../sinema.js';
import { RectAreaLightUniformsLib } from '../../node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { altinTimes, camKeys, smallOffset, goldHeight, SIDE, SMALL, FLOOR, APT } from './altin_core.js';

const GOLD = '#FFC845', WHITE = '#FFFFFF';
const SAFE = { x0: 90, x1: 920 };
const CX = (SAFE.x0 + SAFE.x1) / 2;          // yazılar güvenli alanın ortasına: sağdaki düğme sütunu boş kalır

export async function makeAltinRenderer(ep, canvas) {
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const { tl, T } = altinTimes(ep, voice), D = tl.duration;
  const S = makeSinema(ep, canvas, { fog: '#120F10', fogDensity: 0.0052, exposure: 1.05, bloom: 0.55, bloomThreshold: 1.0 });
  const { THREE, scene, ctx } = S;
  const rnd = mulberry32(67);

  // ——— Gökyüzü: tepe koyu, ufukta şehrin sıcak ışığı ———
  {
    const g = new THREE.SphereGeometry(1400, 32, 16);
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: lin('#07080B') }, hor: { value: lin('#3B2620') } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(vP.y * 3.2, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h, 0.55)), 1.0); }',
    });
    scene.add(new THREE.Mesh(g, m));
  }

  // ——— Ortam haritası (metal yansımaları): koyu kubbe + sıcak pencere ve lamba panelleri ———
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: lin('#120D0B'), side: THREE.BackSide })));
    const r = mulberry32(5);
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, y = -2 + r() * 9, w = 0.8 + r() * 2.2;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.5 + r() * 1.2), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(3.2 + r() * 2, 1.9 + r(), 0.8 + r() * 0.4), side: THREE.DoubleSide }));
      p.position.set(Math.cos(a) * 40, y, Math.sin(a) * 40); p.lookAt(0, y, 0); env.add(p);
    }
    for (let i = 0; i < 4; i++) {                // tepeden vuran projektörler: üst yüzde parlak lekeler
      const s = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(14, 11, 7.5) }));
      s.position.set(Math.cos(i * 1.7) * 22, 26, Math.sin(i * 1.7) * 22); env.add(s);
    }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: lin('#2A1D15') }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -10; env.add(floor);
    const pm = new THREE.PMREMGenerator(S.gl);
    scene.environment = pm.fromScene(env, 0.02).texture;
    scene.environmentIntensity = 1.0;
  }
  scene.add(new THREE.HemisphereLight(lin('#2B3140'), lin('#2A1A12'), 0.35));

  // ——— Zemin: ıslak asfalt, kaldırımlar, meydan taşları ———
  const std = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.8, metalness: 0, ...o });
  const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); scene.add(m); return m; };
  {
    const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(400, 600), std('#151416', { roughness: 0.32 }));
    asphalt.rotation.x = -Math.PI / 2; asphalt.position.z = 100; scene.add(asphalt);
    const pave = std('#2E2A27', { roughness: 0.55 });
    box(78, 0.12, 82, pave, 0, 0.06, 6);                           // meydan (z −35..47)
    const curb = std('#4A4541', { roughness: 0.7 });
    for (const s of [-1, 1]) box(3.4, 0.16, 121, curb, s * 8.7, 0.08, 106.5);   // kaldırımlar (z 46..167)
    const mark = std('#B9B2A6', { roughness: 0.6, emissive: lin('#2A2722') });
    for (let z = 30; z < 166; z += 6) box(0.16, 0.02, 3, mark, 0, 0.011, z);  // orta şerit
  }

  // ——— Cephe dokusu: pencere ızgarası, perde ve ışık (tohumlu); emissive haritası yanan pencereler ———
  const PXM = 22;
  function facade(wm, floors, base, shop, seed) {
    const r = mulberry32(seed), cw = Math.round(wm * PXM), ch = Math.round(floors * FLOOR * PXM);
    const a = document.createElement('canvas'), e = document.createElement('canvas');
    a.width = e.width = cw; a.height = e.height = ch;
    const ga = a.getContext('2d'), ge = e.getContext('2d');
    ga.fillStyle = base; ga.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 260; i++) { ga.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.05})`; ga.fillRect(r() * cw, r() * ch, 2 + r() * 30, 2 + r() * 60); }   // leke
    ge.fillStyle = '#000'; ge.fillRect(0, 0, cw, ch);
    const cols = Math.max(2, Math.floor(wm / 3.0)), sp = wm / cols;
    for (let f = 0; f < floors; f++) {
      const yTop = ch - (f + 1) * FLOOR * PXM;
      ga.fillStyle = 'rgba(0,0,0,0.18)'; ga.fillRect(0, yTop + FLOOR * PXM - 4, cw, 4);   // döşeme çizgisi
      if (f === 0 && shop) {                                         // zemin kat dükkân
        ga.fillStyle = '#1A1C20'; ga.fillRect(4, yTop + 10, cw - 8, FLOOR * PXM - 14);
        const sc = ['#FFE2B0', '#FFF1D6', '#FFD08A'][Math.floor(r() * 3)];
        ge.fillStyle = sc; ge.globalAlpha = 0.55 + r() * 0.35; ge.fillRect(6, yTop + 16, cw - 12, FLOOR * PXM - 22); ge.globalAlpha = 1;
        ga.fillStyle = ['#8E2A22', '#245A4A', '#7A5A22', '#2C3E66'][Math.floor(r() * 4)]; ga.fillRect(0, yTop + 4, cw, 10);  // tente
        continue;
      }
      for (let c = 0; c < cols; c++) {
        const x = (c + 0.5) * sp * PXM - 0.65 * PXM, y = yTop + 0.85 * PXM, w = 1.3 * PXM, h = 1.5 * PXM;
        ga.fillStyle = '#ECE7DD'; ga.fillRect(x - 3, y - 3, w + 6, h + 6);   // doğrama
        ga.fillStyle = '#1B1E24'; ga.fillRect(x, y, w, h);
        const on = r() < 0.5;
        if (on) {
          const tone = r(), col = tone < 0.08 ? '#9DBBE8' : tone < 0.5 ? '#FFC98A' : tone < 0.85 ? '#FFDDAE' : '#FFB067';
          const k = 0.45 + r() * 0.55;
          const gr = ge.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, col); gr.addColorStop(1, '#000');
          ge.globalAlpha = k; ge.fillStyle = gr; ge.fillRect(x, y, w, h); ge.globalAlpha = 1;
          if (r() < 0.6) { ge.fillStyle = 'rgba(0,0,0,0.55)'; ge.fillRect(x + (r() < 0.5 ? 0 : w * 0.55), y, w * 0.45, h); }   // perde
        }
        ga.fillStyle = '#ECE7DD'; ga.fillRect(x + w / 2 - 1.5, y, 3, h);
      }
    }
    const ta = new THREE.CanvasTexture(a), te = new THREE.CanvasTexture(e);
    ta.colorSpace = te.colorSpace = THREE.SRGBColorSpace; ta.anisotropy = te.anisotropy = 8;
    return { ta, te };
  }
  // Bina: cephe dokusu dört yüze; balkonlar (döşeme + korkuluk) ve çatıda su deposu, çanak anten
  const slabs = [], rails = [], tanks = [], dishes = [];
  const PAL = ['#D9C9AE', '#E3D2B8', '#CDB79A', '#E8DCC6', '#C7B49E', '#D6BFA3', '#BFB3A3', '#E2C8A8'];
  function building(x0, x1, z0, z1, floors, opt = {}) {
    const w = x1 - x0, d = z1 - z0, h = floors * FLOOR;
    const base = opt.base || PAL[Math.floor(rnd() * PAL.length)];
    const fx = facade(Math.max(w, d), floors, base, opt.shop ?? true, Math.floor(rnd() * 1e6));
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.58, 0.58, 0.58), map: fx.ta, emissiveMap: fx.te, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: opt.glow ?? 2.2, roughness: 0.85 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); scene.add(m);
    box(w + 0.3, 0.9, d + 0.3, std(base, { roughness: 0.9 }), (x0 + x1) / 2, h + 0.45, (z0 + z1) / 2);   // korkuluk
    // balkonlar: sokağa bakan yüzde, her iki pencereden birinde
    if (opt.face) {
      const [ax, sgn] = opt.face, len = ax === 'x' ? d : w, cols = Math.max(2, Math.floor(len / 3.0)), sp = len / cols;
      for (let f = 1; f < floors; f++) for (let c = (f % 2); c < cols; c += 2) {
        const u = (ax === 'x' ? z0 : x0) + (c + 0.5) * sp, y = f * FLOOR;
        const fx0 = ax === 'x' ? (sgn > 0 ? x1 : x0) : u, fz0 = ax === 'x' ? u : (sgn > 0 ? z1 : z0);
        slabs.push([fx0 + (ax === 'x' ? sgn * 0.55 : 0), y + 0.07, fz0 + (ax === 'z' ? sgn * 0.55 : 0), ax]);
        rails.push([fx0 + (ax === 'x' ? sgn * 1.08 : 0), y + 0.6, fz0 + (ax === 'z' ? sgn * 1.08 : 0), ax]);
      }
    }
    const nT = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < nT; i++) tanks.push([lerp(x0 + 1.5, x1 - 1.5, rnd()), h, lerp(z0 + 1.5, z1 - 1.5, rnd())]);
    if (rnd() < 0.8) dishes.push([lerp(x0 + 1, x1 - 1, rnd()), h + 0.9, lerp(z0 + 1, z1 - 1, rnd()), rnd() * 6.28]);
    return m;
  }
  // sokak iki yanı (z 26..170): cepheler x = ±10,5
  for (const s of [-1, 1]) {
    let z = 46;
    while (z < 172) {
      const len = 12 + Math.floor(rnd() * 7), floors = 4 + Math.floor(rnd() * 5);
      const xin = s * 10.5, xout = s * (10.5 + 13);
      building(Math.min(xin, xout), Math.max(xin, xout), z, z + len, floors, { face: ['x', -s] });
      z += len + 0.4;
    }
  }
  // meydan çevresi: arka sıra ve sol taraf
  for (let x = -38; x < 40; x += 15.5) building(x, x + 15, -48, -34, 5 + Math.floor(rnd() * 5), { face: ['z', 1] });
  building(-40, -26, -30, -14, 6, { face: ['x', 1] });
  building(-40, -26, -12, 4, 8, { face: ['x', 1] });
  building(-40, -26, 6, 22, 5, { face: ['x', 1] });
  building(-40, -26, 24, 45, 6, { face: ['x', 1] });
  building(20, 34, 17, 30, 5, { face: ['x', -1] });
  building(20, 34, 31.5, 45.5, 6, { face: ['x', -1] });
  // küçük küpün yanındaki iki katlı ev (2 × 3,1 m + korkuluk ≈ 6,2 m)
  building(-11.5, -5, 19.5, 26, 2, { face: ['z', 1], shop: false, base: '#D9C2A0' });
  building(36, 50, -30, -12, 6, { face: ['x', -1] });
  // küpün yanındaki 7 katlı apartman (kat çizgileri ayrı: sayılırken yanar)
  const aptMesh = building(APT.x0, APT.x1, APT.z0, APT.z1, APT.floors, { face: ['x', -1], base: '#E6D6BC' });

  {
    const sm = std('#CFC6B8', { roughness: 0.8 }), rm = std('#2A2B2E', { roughness: 0.4, metalness: 0.6 });
    const mk = (geom, mat, list, fn) => { const im = new THREE.InstancedMesh(geom, mat, list.length); const o = new THREE.Object3D(); list.forEach((p, i) => { fn(o, p); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); scene.add(im); };
    mk(new THREE.BoxGeometry(1.1, 0.14, 2.6), sm, slabs, (o, p) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[3] === 'x' ? 0 : Math.PI / 2, 0); });
    mk(new THREE.BoxGeometry(0.06, 1.0, 2.6), rm, rails, (o, p) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[3] === 'x' ? 0 : Math.PI / 2, 0); });
    mk(new THREE.CylinderGeometry(0.55, 0.55, 1.5, 12).rotateZ(Math.PI / 2).translate(0, 1.4, 0), std('#D8D8D6', { roughness: 0.5, metalness: 0.3 }), tanks, (o, p) => o.position.set(p[0], p[1], p[2]));
    mk(new THREE.SphereGeometry(0.45, 12, 6, 0, Math.PI * 2, 0, 1.1).rotateX(-1.2), std('#E9E7E2', { roughness: 0.5 }), dishes, (o, p) => { o.position.set(p[0], p[1], p[2]); o.rotation.y = p[3]; });
  }

  // ——— Sokak lambaları: direk + sıcak baş; yerde ışık havuzu; meydana yakın olanlar gerçek ışık ———
  {
    const pole = std('#2B2A2A', { roughness: 0.5, metalness: 0.5 });
    const head = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: lin('#FFB45E'), emissiveIntensity: 9 });
    const pool = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,170,90,1)'); gr.addColorStop(0.5, 'rgba(255,150,70,0.35)'); gr.addColorStop(1, 'rgba(255,140,60,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
    })();
    const poolMat = new THREE.MeshBasicMaterial({ map: pool, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 });
    let i = 0;
    for (let z = 30; z < 170; z += 21, i++) {
      const s = i % 2 ? 1 : -1, x = s * 7.6;
      box(0.16, 7.2, 0.16, pole, x, 3.6, z);
      box(1.6, 0.1, 0.12, pole, x - s * 0.8, 7.15, z);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), head); hd.position.set(x - s * 1.5, 7.0, z); scene.add(hd);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), poolMat); p.rotation.x = -Math.PI / 2; p.position.set(x - s * 1.5, 0.02, z); scene.add(p);
      if (z < 80) { const L = new THREE.PointLight(lin('#FFB060'), 60, 26, 2); L.position.set(x - s * 1.5, 6.6, z); scene.add(L); }
    }
  }

  // ——— Altın: gerçek 3B külçelerden örülmüş küp. Her külçenin eğimli yanları ışığı ayrı yakalar (yığın okunur). ———
  // Döküm: uClip (m) üstündeki her parça çizilmez; kesik yerini erimiş, kızgın bir üst yüz kapatır.
  const clipU = { value: 100 };
  const withClip = mat => {
    mat.onBeforeCompile = sh => {
      sh.uniforms.uClip = clipU;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWy;')
        .replace('#include <project_vertex>', '#include <project_vertex>\n  vec4 wq = vec4(transformed, 1.0);\n  #ifdef USE_INSTANCING\n  wq = instanceMatrix * wq;\n  #endif\n  vWy = (modelMatrix * wq).y;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWy; uniform float uClip;')
        .replace('void main() {', 'void main() {\n  if (vWy > uClip) discard;');
    };
    return mat;
  };
  const GOLD_L = new THREE.Color().setRGB(0.98, 0.70, 0.27, THREE.LinearSRGBColorSpace);
  const barMat = withClip(new THREE.MeshPhysicalMaterial({ color: GOLD_L, metalness: 1, roughness: 0.24, clearcoat: 0.35, clearcoatRoughness: 0.12, envMapIntensity: 1.8 }));
  const coreMat = withClip(new THREE.MeshPhysicalMaterial({ color: new THREE.Color().setRGB(0.55, 0.37, 0.12, THREE.LinearSRGBColorSpace), metalness: 1, roughness: 0.45, envMapIntensity: 0.8 }));
  // külçe: boy BL, en BW, yükseklik BH (yaklaşık 2,4 kat gerçek boy); üst yüz her yandan CHM içeride (eğimli yanlar)
  const BL = 1.2, BW = 0.4, BH = 0.2, CHM = 0.07;
  const ingot = (() => {
    const L = BL / 2, Wd = BW / 2, a = CHM;
    const v = [[-L, 0, -Wd], [L, 0, -Wd], [L, 0, Wd], [-L, 0, Wd], [-L + a, BH, -Wd + a], [L - a, BH, -Wd + a], [L - a, BH, Wd - a], [-L + a, BH, Wd - a]];
    const quads = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
    const pos = [];
    for (const [p, q, r, s] of quads) for (const tri of [[p, q, r], [p, r, s]]) {
      const [A, B, Cc] = tri.map(i => new THREE.Vector3(...v[i]));
      const n = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(Cc, A));
      const c = new THREE.Vector3().add(A).add(B).add(Cc).multiplyScalar(1 / 3).sub(new THREE.Vector3(0, BH / 2, 0));
      for (const P of n.dot(c) >= 0 ? [A, B, Cc] : [A, Cc, B]) pos.push(P.x, P.y, P.z);   // dışa bakan sarım
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return g;
  })();
  const H2 = SIDE / 2, sx0 = H2 - SMALL, sz0 = H2 - SMALL;
  const UP = new THREE.Vector3(0, 1, 0), M4 = new THREE.Matrix4();
  // dikey yüz: düzlem noktası o, dışa normal n, yatay yön u; yatay aralık [0, len] (u boyunca), satırlar y0..y1.
  // span(y) satırın kapsadığı [a, b] (u boyunca, o'dan) aralığını verir (oyuk için); çift satırlar yarım külçe kaydırılır.
  function wall(list, o, n, u, len, y1, span = () => [0, len]) {
    for (let j = 0; (j + 1) * BH <= y1 + 1e-6; j++) {
      const y = j * BH, [a, b] = span(y + BH / 2);
      if (b - a < BL * 0.4) continue;
      const k = Math.max(1, Math.round((b - a) / BL)), Lf = (b - a) / k;
      const cells = [];
      if (j % 2) { cells.push([a + Lf / 4, 0.5]); for (let i = 0; i < k - 1; i++) cells.push([a + Lf * (i + 1), 1]); cells.push([b - Lf / 4, 0.5]); }
      else for (let i = 0; i < k; i++) cells.push([a + Lf * (i + 0.5), 1]);
      for (const [s, f] of cells) {
        M4.makeBasis(u, UP, n).scale(new THREE.Vector3(Lf * f / BL, 1, 1));
        M4.setPosition(o.x + u.x * s + n.x * BW / 2, y, o.z + u.z * s + n.z * BW / 2);
        list.push(M4.clone());
      }
    }
  }
  function roof(list, x0, x1, z0, z1, y) {               // üst yüz: külçeler yatay, damgalı yüzleri yukarı
    const rows = Math.round((z1 - z0) / BW), wz = (z1 - z0) / rows, k = Math.max(1, Math.round((x1 - x0) / BL)), Lf = (x1 - x0) / k;
    for (let j = 0; j < rows; j++) for (let i = 0; i < k + (j % 2); i++) {
      const half = j % 2 && (i === 0 || i === k), cx = j % 2 ? (i === 0 ? x0 + Lf / 4 : i === k ? x1 - Lf / 4 : x0 + Lf * i) : x0 + Lf * (i + 0.5);
      M4.makeBasis(new THREE.Vector3(1, 0, 0), UP, new THREE.Vector3(0, 0, 1)).scale(new THREE.Vector3(Lf * (half ? 0.5 : 1) / BL, 1, wz / BW));
      M4.setPosition(cx, y, z0 + wz * (j + 0.5));
      list.push(M4.clone());
    }
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const bigBars = [], smallBars = [];
  const low = y => y < SMALL;                                 // oyuk satırları (küçük küpün yüksekliği)
  wall(bigBars, V(-H2, 0, H2), V(0, 0, 1), V(1, 0, 0), SIDE, SIDE, y => (low(y) ? [0, sx0 + H2] : [0, SIDE]));      // ön
  wall(bigBars, V(H2, 0, H2), V(1, 0, 0), V(0, 0, -1), SIDE, SIDE, y => (low(y) ? [H2 - sz0, SIDE] : [0, SIDE]));   // sağ
  wall(bigBars, V(-H2, 0, -H2), V(-1, 0, 0), V(0, 0, 1), SIDE, SIDE);                                               // sol
  wall(bigBars, V(H2, 0, -H2), V(0, 0, -1), V(-1, 0, 0), SIDE, SIDE);                                               // arka
  roof(bigBars, -H2, H2, -H2, H2, SIDE);
  wall(bigBars, V(sx0, 0, H2), V(1, 0, 0), V(0, 0, -1), SMALL, SMALL - 0.02);                                     // oyuğun iç yüzleri
  wall(bigBars, V(sx0, 0, sz0), V(0, 0, 1), V(1, 0, 0), SMALL, SMALL - 0.02);
  wall(smallBars, V(sx0, 0, H2), V(0, 0, 1), V(1, 0, 0), SMALL, SMALL - 0.02);                                    // küçük küp: ön, sağ, sol, üst
  wall(smallBars, V(H2, 0, H2), V(1, 0, 0), V(0, 0, -1), SMALL, SMALL - 0.02);
  wall(smallBars, V(sx0, 0, sz0), V(-1, 0, 0), V(0, 0, 1), SMALL, SMALL - 0.02);
  roof(smallBars, sx0, H2, sz0, H2, SMALL - 0.02);
  const instanced = list => { const im = new THREE.InstancedMesh(ingot, barMat, list.length); list.forEach((m, i) => im.setMatrixAt(i, m)); im.frustumCulled = false; return im; };
  const bigIM = instanced(bigBars); scene.add(bigIM);
  const barMatS = withClip(barMat.clone());
  const small = new THREE.Group(); { const im = instanced(smallBars); im.material = barMatS; small.add(im); } scene.add(small);
  // çekirdek: külçelerin arkasındaki koyu altın gövde (oyuk açılınca da dolu metal görünür)
  for (const [a0, a1, b0, b1, c0, c1] of [[-H2, sx0, 0, SIDE, -H2, H2], [sx0, H2, SMALL, SIDE, -H2, H2], [sx0, H2, 0, SMALL, -H2, sz0]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(a1 - a0, b1 - b0, c1 - c0), coreMat); m.position.set((a0 + a1) / 2, (b0 + b1) / 2, (c0 + c1) / 2); scene.add(m);
  }
  { const m = new THREE.Mesh(new THREE.BoxGeometry(SMALL, SMALL - 0.02, SMALL), coreMat); m.position.set(sx0 + SMALL / 2, (SMALL - 0.02) / 2, sz0 + SMALL / 2); small.add(m); }
  const smallC = [sx0 + SMALL / 2, SMALL / 2, sz0 + SMALL / 2];
  // erimiş üst yüz (döküm sürerken) ve zeminde parlayan kalıp
  const capTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = mulberry32(31);
    g.fillStyle = '#F2A531'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 120; i++) { const x = r() * 512, y = r() * 512, rad = 30 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const hot = r() < 0.7; gr.addColorStop(0, hot ? 'rgba(255,226,140,0.45)' : 'rgba(190,110,20,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
  })();
  const capMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(1, 1, 1), emissiveMap: capTex, emissiveIntensity: 3.2, roughness: 0.5 });
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(SIDE + 2 * BW + 0.1, SIDE + 2 * BW + 0.1), capMat); cap.rotation.x = -Math.PI / 2; scene.add(cap);
  {
    var moldMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: lin('#FFC845'), emissiveIntensity: 4 }); const mm = moldMat, e = H2 + 0.9;
    for (const [w, d, x, z] of [[2 * e + 0.2, 0.2, 0, e], [2 * e + 0.2, 0.2, 0, -e], [0.2, 2 * e, e, 0], [0.2, 2 * e, -e, 0]]) box(w, 0.06, d, mm, x, 0.15, z);
  }
  // küp altındaki temas gölgesi ve projektörler (yerden yukarı)
  const blob = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  const blobMat = new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false });
  const smallBlob = new THREE.Mesh(new THREE.PlaneGeometry(SMALL * 1.6, SMALL * 1.6), blobMat); smallBlob.rotation.x = -Math.PI / 2; scene.add(smallBlob);
  for (const [x, z, tx, tz] of [[-H2 - 6, H2 + 6, -H2 * 0.4, H2], [H2 + 2, H2 + 7, H2 * 0.5, H2], [-H2 - 7, -H2 * 0.2, -H2, 0], [-H2 - 6, -H2 - 6, -H2, -H2 * 0.4]]) {
    const L = new THREE.SpotLight(lin('#FFE3B8'), 900, 70, 0.62, 0.55, 2);
    L.position.set(x, 0.6, z); L.target.position.set(tx, SIDE * 0.75, tz); scene.add(L, L.target);
  }
  // yumuşak projektör panelleri: külçelerin eğimli yüzlerinde sıra sıra parlama
  RectAreaLightUniformsLib.init();
  for (const [x, y, z, w, h, I] of [[-30, 34, 70, 46, 22, 1.4], [34, 8, 60, 36, 14, 1.0], [-34, 6, -14, 30, 16, 0.7], [2, 5, 58, 34, 10, 2.2]]) {
    const R = new THREE.RectAreaLight(lin('#FFE6C4'), I, w, h); R.position.set(x, y, z); R.lookAt(0, SIDE * 0.5, 0); scene.add(R);
  }
  const smallSpot = new THREE.SpotLight(lin('#FFE9C8'), 1400, 70, 0.42, 0.6, 2); smallSpot.position.set(-2, 14, 48); scene.add(smallSpot, smallSpot.target);
  // yansıma: şehrin kendisi (altın gizliyken küplerin önünden bir kez çekilir)
  {
    const hide = [bigIM, small, cap]; hide.forEach(o => { o.visible = false; });
    const crt = new THREE.WebGLCubeRenderTarget(512, { type: THREE.HalfFloatType });
    const cc = new THREE.CubeCamera(0.5, 1500, crt); cc.position.set(0, 11, 30); scene.add(cc);
    cc.update(S.gl, scene);
    const env = new THREE.PMREMGenerator(S.gl).fromCubemap(crt.texture).texture;
    barMat.envMap = barMatS.envMap = coreMat.envMap = env;
    hide.forEach(o => { o.visible = true; });
  }

  const houseLines = [1, 2].map(k => { const m = new THREE.MeshBasicMaterial({ color: 0, fog: false }); const b = new THREE.Mesh(new THREE.BoxGeometry(6.74, 0.12, 0.12), m); b.position.set(-8.25, k * FLOOR, 26.08); scene.add(b); return m; });

  // ——— Apartmanın kat çizgileri (sayılırken altın rengi yanar) ———
  const floorLines = [];
  for (let k = 1; k <= APT.floors; k++) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 0), fog: false });
    const y = k * FLOOR;
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, APT.z1 - APT.z0 + 0.24), mat); a.position.set(APT.x0 - 0.08, y, 0); scene.add(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(APT.x1 - APT.x0 + 0.24, 0.12, 0.12), mat); b.position.set((APT.x0 + APT.x1) / 2, y, APT.z1 + 0.08); scene.add(b);
    floorLines.push(mat);
  }

  // ——— Sarı taksi (karşıdan gelir), park etmiş arabalar, insanlar ———
  function car(color, taxi) {
    const g = new THREE.Group(), body = std(color, { roughness: 0.3, metalness: 0.4 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 4.4), body); b.position.y = 0.6; g.add(b);
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), std('#15171B', { roughness: 0.15, metalness: 0.5 })); c.position.set(0, 1.2, -0.2); g.add(c);
    const wh = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 14).rotateZ(Math.PI / 2), wm = std('#0B0B0C', { roughness: 0.7 });
    for (const [x, z] of [[-0.9, 1.4], [0.9, 1.4], [-0.9, -1.4], [0.9, -1.4]]) { const w = new THREE.Mesh(wh, wm); w.position.set(x, 0.34, z); g.add(w); }
    const hl = new THREE.MeshStandardMaterial({ color: 0, emissive: lin('#FFF1D2'), emissiveIntensity: 6 }), tlm = new THREE.MeshStandardMaterial({ color: 0, emissive: lin('#FF2A1A'), emissiveIntensity: 6 });
    for (const x of [-0.62, 0.62]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.05), hl); h.position.set(x, 0.72, 2.21); g.add(h); const r = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.05), tlm); r.position.set(x, 0.75, -2.21); g.add(r); }
    if (taxi) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: 0, emissive: lin('#FFE7A0'), emissiveIntensity: 5 })); s.position.set(0, 1.6, -0.2); g.add(s); }
    scene.add(g); return g;
  }
  const taxi = car('#E9B415', true);
  const taxiLight = new THREE.SpotLight(lin('#FFF0D0'), 500, 45, 0.5, 0.6, 2); scene.add(taxiLight, taxiLight.target);
  const parkCols = ['#5C6670', '#2C3440', '#8A8F94', '#6E2A26', '#D9D7D2', '#1E2A26'];
  for (let z = 50, i = 0; z < 165; z += 7 + rnd() * 9, i++) { const c = car(parkCols[i % parkCols.length], false); const s = i % 2 ? 1 : -1; c.position.set(s * 5.9, 0, z); c.rotation.y = s > 0 ? 0 : Math.PI; }
  const person = (x, z, ry, h = 1.75, col = '#1A1A1D') => {
    const g = new THREE.Group(), m = std(col, { roughness: 0.9 });
    const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, h * 0.42, 4, 8), m); legs.position.set(0, h * 0.27, 0); legs.scale.x = 1.6; g.add(legs);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, h * 0.24, 4, 8), m); torso.position.y = h * 0.62; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 8), m); head.position.y = h * 0.93; g.add(head);
    g.position.set(x, 0.12, z); g.rotation.y = ry; scene.add(g); return g;
  };
  person(1.6, 25.5, Math.PI + 0.2);
  person(-8, 14, Math.PI - 0.5, 1.68, '#2A2324');
  person(-9.2, 52, 0.4, 1.7); person(9.0, 61, -2.5, 1.62, '#2B2626'); person(-9.4, 88, 1.2); person(-4, 18, Math.PI, 1.2, '#2A2324');

  // ——— Kamera ———
  const K = camKeys(T), posF = track3(K.map(k => [k[0], k[1]])), tgtF = track3(K.map(k => [k[0], k[2]])), fovF = monotone(K.map(k => k[0]), K.map(k => k[3]));
  const camAt = t => {
    const pos = posF(t), tgt = tgtF(t);
    const dist = Math.hypot(pos[0] - tgt[0], pos[1] - tgt[1], pos[2] - tgt[2]);
    return { pos, tgt, fov: fovF(t), focus: dist, aperture: 0.045 };
  };
  const TAXI_V = 9.0, TAXI_Z0 = 22;
  function pose(t, lens, jit) {
    S.setCam(camAt(t), lens, jit);
    const off = smallOffset(T, t), h = goldHeight(T, t), done = h >= SIDE - 1e-3;
    small.position.set(0, 0, off);
    smallSpot.target.position.set(sx0 + SMALL / 2, 3, sz0 + SMALL / 2 + off);
    const dim = 1 - 0.62 * seg(t, T.l08 - 0.3, 0.5) * (1 - seg(t, T.l09 + 0.4, 0.6));   // Türkiye anı: dev küp kararır
    barMat.color.copy(GOLD_L).multiplyScalar(dim); barMat.envMapIntensity = 1.8 * dim; coreMat.envMapIntensity = 0.8 * dim;
    smallSpot.intensity = 1400 * (0.4 + 0.6 * seg(t, T.l07, 0.6));
    moldMat.emissiveIntensity = 4 * (1 - seg(t, T.l03, 1.2) + seg(t, T.sink0, 1.2));
    clipU.value = done ? 100 : h;                                  // döküm: kesik üstü çizilmez
    cap.visible = !done; cap.position.set(0, h, 0);
    capMat.emissiveIntensity = 3.2 * (t > T.sink0 ? 0.6 : 1);
    smallBlob.position.set(smallC[0], 0.14, smallC[2] + off); smallBlob.visible = off > 0.5;
    const tz = TAXI_Z0 + TAXI_V * t;                              // sokağın sonundan kameraya doğru
    taxi.position.set(-3.4, 0, tz); taxi.visible = tz < 200;
    taxiLight.position.set(-3.4, 0.8, tz + 2.3); taxiLight.target.position.set(-3.4, 0, tz + 20);
    for (let k = 1; k <= APT.floors; k++) {
      const on7 = seg(t, T.floorAt[k], 0.12) * (1 - seg(t, T.silence[1], 0.4));
      const v = on7 * 3;
      if (k <= 2) { const w = seg(t, T.floor2(k), 0.12) * (1 - seg(t, T.l09 + 0.3, 0.4)) * 3; houseLines[k - 1].color.setRGB(w, w * 0.72, w * 0.3); }
      floorLines[k - 1].color.setRGB(v * 1.0, v * 0.72, v * 0.3);
    }
  }

  // ——— 2B kaplama ———
  const CH = {                                                       // altyazı parçaları: [metin, ilk kelime sırası]
    l02: [['İnsanlık bugüne kadar', 0], ['yaklaşık 223 bin ton', 3], ['altın çıkardı.', 10]],
    l03: [['Hepsini eritip', 0], ['tek bir küpe döksek,', 2]],
    l04: [['küpün kenarı sadece', 0], ['23 metre kadar olurdu.', 3]],
    l05: [['Aşağı yukarı', 0], ['7 katlı bir apartman boyu.', 2]],
    l06: [['Peki bunun ne kadarı', 0], ["Türkiye'de?", 4]],
    l07: [['Tahminlere göre 4.210 ton.', 2]],
    l08: [['Kenarı 6 metre', 0], ['olan bir küp.', 3], ['İki katlı bir ev kadar.', 6]],
    l09: [['Dünyadaki bütün altının', 0], ["53'te biri.", 3]],
    l10: [['Annenin bilezikleri de bu küpün içinde.', 0]],
  };
  const chunks = [];
  for (const [id, list] of Object.entries(CH)) {
    const ln = tl.L[id], raw = list.map(([s, i]) => ({ s, t0: ln.words[i].t0 - 0.04 }));
    raw.forEach((c, i) => { c.t1 = i + 1 < raw.length ? raw[i + 1].t0 : ln.end + 0.3; });
    for (let i = 0; i < raw.length; i++) {                         // en az 1,25 sn: kısa parça komşusuyla birleşir
      const c = raw[i];
      if (c.t1 - c.t0 < 1.25 && raw.length > 1) {
        if (i + 1 < raw.length) { raw[i + 1] = { s: c.s + ' ' + raw[i + 1].s, t0: c.t0, t1: raw[i + 1].t1 }; continue; }
        const p = chunks.at(-1); if (p && p.id === id) { p.s += ' ' + c.s; p.t1 = c.t1; continue; }
      }
      chunks.push({ ...c, id });
    }
  }
  function scrim(cx, cy, w, h, a = 0.55) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(w / 2, h / 2);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(10,7,4,${a})`); g.addColorStop(0.6, `rgba(10,7,4,${a * 0.7})`); g.addColorStop(1, 'rgba(10,7,4,0)');
    ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }
  const CAP_SIZE = 70, CAP_LH = 82, CAP_BASE = 1330;
  function caption(t) {
    const c = chunks.find(c => t >= c.t0 && t < c.t1); if (!c) return;
    setFont(ctx, F.head(CAP_SIZE)); ctx.textAlign = 'center';
    const lines = wrap(ctx, c.s, SAFE.x1 - SAFE.x0), u = ease.enter(seg(t, c.t0, 0.2));
    if (lines.length === 2 && !lines[1].includes(' ')) { const w = lines[0].split(' '); lines[1] = w.pop() + ' ' + lines[1]; lines[0] = w.join(' '); }
    scrim(CX, CAP_BASE - (lines.length - 1) * CAP_LH / 2 - CAP_SIZE * 0.35, 1000, 180 + lines.length * CAP_LH, 0.66);
    lines.forEach((ln, i) => {
      const y = CAP_BASE - (lines.length - 1 - i) * CAP_LH + (1 - u) * 26;
      ctx.save(); ctx.beginPath(); ctx.rect(0, y - CAP_SIZE * 1.05, W, CAP_SIZE * 1.4); ctx.clip();
      // rakam içeren sözcükler altın rengi
      const words = ln.split(' '), widths = words.map(w => ctx.measureText(w + ' ').width), total = widths.reduce((a, b) => a + b, 0) - ctx.measureText(' ').width;
      let x = CX - total / 2; ctx.textAlign = 'left';
      words.forEach((w, j) => { shadowText(ctx, w, x, y, WHITE, 22); x += widths[j]; });
      ctx.restore(); ctx.textAlign = 'center';
    });
    ctx.textAlign = 'left';
  }
  // kanca başlığı: kare 0'dan itibaren tam; l01 bitince yukarı kayarak kırpılır
  const Q = ep.question, QY = 470;
  const QS = (() => { let q = 100; setFont(ctx, F.head(q)); while (q > 70 && Q.some(l => ctx.measureText(l).width > SAFE.x1 - SAFE.x0)) { q -= 2; setFont(ctx, F.head(q)); } return q; })();
  function title(t) {
    const out = ease.exit(seg(t, T.l01end + 0.15, 0.3)); if (out >= 1) return;
    setFont(ctx, F.head(QS)); ctx.textAlign = 'center';
    scrim(CX, QY + QS * 0.15 - out * QS * 1.2, 1060, QS * 3.4, 0.55 * (1 - out));
    Q.forEach((q, i) => {
      const y = QY + i * (QS * 1.02);
      ctx.save(); ctx.beginPath(); ctx.rect(0, y - QS * 1.0, W, QS * 1.3); ctx.clip();
      shadowText(ctx, q, (SAFE.x0 + SAFE.x1) / 2, y - out * QS * 1.2, i === 1 ? '#FFD66B' : WHITE, 26);
      ctx.restore();
    });
    ctx.textAlign = 'left';
  }
  const fmt = n => Math.round(n).toLocaleString('tr-TR');
  function bigNumber(t, t0, tCount, t1, value, unit, y = 470) {
    const inU = ease.enter(seg(t, t0, 0.3)), outU = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || outU >= 1) return;
    const v = value * ease.state(seg(t, t0 + 0.05, tCount - t0 - 0.05));
    setFont(ctx, F.head(150)); ctx.textAlign = 'center';
    const s = fmt(v);
    scrim(CX, y - 10 + (1 - inU) * 60 - outU * 80, 860, 330, 0.5 * inU * (1 - outU));
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - 150, W, 260); ctx.clip();
    const dy = (1 - inU) * 60 - outU * 80;
    shadowText(ctx, s, CX, y + dy, WHITE, 34);
    setFont(ctx, F.head(54)); shadowText(ctx, unit, CX, y + 72 + dy, GOLD, 22);
    ctx.restore(); ctx.textAlign = 'left';
  }
  // 3B ölçü çizgisi: uç noktalar dünyadan izdüşer; çizgi alttan yukarı büyür, etiket yanında
  function dimension(t, t0, t1, a, b, label, side = -1) {
    const u = ease.state(seg(t, t0, 0.5)), lab = ease.enter(seg(t, t0 + 0.25, 0.35)), out = ease.exit(seg(t, t1, 0.25));
    if (u <= 0 || out >= 1) return;
    const A = S.project(...a), B = S.project(...b);
    if (A[2] > 1 || B[2] > 1) return;
    const ox = side * 34, x0 = A[0] + ox, x1 = B[0] + ox, yb = A[1], yt = lerp(A[1], B[1], u), xt = lerp(x0, x1, u);
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1150); ctx.rect(0, 1370, W, H - 1370); ctx.clip();
    ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(xt, yt); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(x0 - 18, yb); ctx.lineTo(x0 + 18, yb); ctx.stroke();
    if (u > 0.98) { ctx.beginPath(); ctx.moveTo(x1 - 18, B[1]); ctx.lineTo(x1 + 18, B[1]); ctx.stroke(); }
    if (lab > 0) {
      setFont(ctx, F.head(104)); ctx.textAlign = side < 0 ? 'right' : 'left';
      const lx = Math.max(SAFE.x0 + ctx.measureText(label).width * (side < 0 ? 1 : 0), Math.min(SAFE.x1, x0 + side * 26));
      const ly = Math.max(420, Math.min(1080, (yb + B[1]) / 2 + 36));
      ctx.save(); ctx.beginPath(); ctx.rect(0, ly - 136, W, 140); ctx.clip();
      shadowText(ctx, label, lx, ly + (1 - lab) * 60, WHITE, 24);
      ctx.restore();
    }
    ctx.restore(); ctx.textAlign = 'left';
  }
  // kat sayacı: apartmanın üstünde "7 KAT" / ön yüzünde "2 KAT"
  function floorTag(t, t0, t1, n, anchor) {
    const inU = ease.enter(seg(t, t0, 0.25)), out = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || out >= 1) return;
    const P = S.project(...anchor); if (P[2] > 1) return;
    P[1] = Math.max(P[1], 400);
    setFont(ctx, F.head(84)); ctx.textAlign = 'center';
    const x = Math.max(SAFE.x0 + 130, Math.min(SAFE.x1 - 130, P[0]));
    ctx.save(); ctx.beginPath(); ctx.rect(0, P[1] - 110, W, 140); ctx.clip();
    shadowText(ctx, `${n} KAT`, x, P[1] - 18 + (1 - inU) * 50 - out * 60, GOLD, 22);
    ctx.restore(); ctx.textAlign = 'left';
  }
  function heightMeter(t) {
    const inU = ease.enter(seg(t, T.l03 - 0.1, 0.3)), out = ease.exit(seg(t, T.silence[1] - 0.1, 0.25));
    if (inU <= 0 || out >= 1) return;
    const h = goldHeight(T, t), e = H2 + 0.45;
    const A = S.project(e, 0.1, e), B = S.project(e, h, e);
    if (A[2] > 1 || B[2] > 1) return;
    ctx.save(); ctx.globalAlpha = (1 - out) * inU; ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1150); ctx.rect(0, 1370, W, H - 1370); ctx.clip();
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    ctx.restore();
    for (const P of [A, B]) { ctx.beginPath(); ctx.moveTo(P[0] - 18, P[1]); ctx.lineTo(P[0] + 18, P[1]); ctx.stroke(); }
    const label = (Math.round(h * 10) / 10).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' m';
    setFont(ctx, F.head(96)); ctx.textAlign = 'right';
    const ly = Math.max(420, Math.min(1080, B[1] + 34)), lx = Math.max(SAFE.x0 + ctx.measureText(label).width, Math.min(SAFE.x1, B[0] - 28));
    shadowText(ctx, label, lx, ly, WHITE, 24);
    ctx.restore(); ctx.textAlign = 'left';
  }
  function topLine(t) {
    const u = ease.state(seg(t, T.yedi + 0.05, 0.45)), out = ease.exit(seg(t, T.silence[1] - 0.1, 0.25));
    if (u <= 0 || out >= 1) return;
    const A = S.project(H2, SIDE, H2), B = S.project(APT.x1, APT.floors * FLOOR + 0.9, APT.z1);
    if (A[2] > 1 || B[2] > 1) return;
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.setLineDash([22, 14]);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8;
    const xa = Math.min(A[0], B[0]) - 120, xb = lerp(xa, Math.max(A[0], B[0]) + 60, u);
    ctx.beginPath(); ctx.moveTo(xa, lerp(A[1], B[1], 0)); ctx.lineTo(xb, lerp(A[1], B[1], (xb - xa) / Math.max(1, Math.max(A[0], B[0]) + 60 - xa))); ctx.stroke();
    ctx.restore();
  }
  function ratio(t) {
    const inU = ease.enter(seg(t, T.elli - 0.05, 0.3)), out = ease.exit(seg(t, T.l10 + 0.1, 0.25));
    if (inU <= 0 || out >= 1) return;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 300, W, 260); ctx.clip();
    const dy = (1 - inU) * 60 - out * 80;
    scrim(CX, 430 + dy, 900, 300, 0.5 * inU * (1 - out));
    setFont(ctx, F.head(170)); ctx.textAlign = 'center'; shadowText(ctx, "53'te 1", CX, 480 + dy, WHITE, 34);
    ctx.restore(); ctx.textAlign = 'left';
  }
  function follow(t) {
    const t0 = T.l10end + 0.4, t1 = T.D - 0.45;
    const inU = ease.enter(seg(t, t0, 0.3)), out = ease.exit(seg(t, t1, 0.25));
    if (inU <= 0 || out >= 1) return;
    const s = 'TAKİP ET';
    setFont(ctx, F.head(64)); const w = ctx.measureText(s).width + 96, x = CX - w / 2, y = 1110 + (1 - inU) * 40 + out * 40;
    ctx.save(); ctx.globalAlpha = 1 - out;
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.roundRect(x, y - 66, w, 100, 50); ctx.fill();
    ctx.fillStyle = '#16120C'; ctx.textAlign = 'center'; ctx.fillText(s, CX, y + 6);
    setFont(ctx, F.head(56)); shadowText(ctx, 'Her gün yeni bir sayı', CX, y + 112, WHITE, 22);
    ctx.restore(); ctx.textAlign = 'left';
  }

  function render(t) {
    S.render(t, pose, tt => (tt > T.out0 - 0.1 && tt < T.out1 + 0.1) || (tt > T.in0 - 0.1 && tt < T.in1 + 0.1) ? 0.2 : (tt > T.silence[1] - 0.2 && tt < T.l07 + 0.4) || (tt > T.l03 && tt < T.l03 + 1.1) ? 0.35 : 0.5);
    ctx.clearRect(0, 0, W, H);
    title(t);
    bigNumber(t, T.l02 + 0.05, T.yaklasik - 0.04, T.l03 - 0.15, 222600, 'TON');
    heightMeter(t);
    topLine(t);
    floorTag(t, T.yedi - 0.05, T.silence[1] - 0.1, 7, [(APT.x0 + APT.x1) / 2, APT.floors * FLOOR + 3.2, APT.z1]);
    bigNumber(t, T.l07 - 0.1, T.dort - 0.04, T.l08 + 0.25, 4210, 'TON · TÜRKİYE');
    const off = smallOffset(T, t);
    dimension(t, T.alti - 0.05, T.l09 - 0.3, [sx0, 0.1, H2 + off], [sx0, SMALL, H2 + off], '6 m');
    floorTag(t, T.iki - 0.05, T.l09 - 0.3, 2, [-8.25, 2 * FLOOR + 1.6, 26]);
    ratio(t);
    caption(t);
    follow(t);
  }

  // ısınma: her kamera pozu bir kez (1 örnek) çizilir; doku yükleme ve gölgelendirici derleme ilk kareyi değiştirmez (determinizm)
  { const keep = window.__samples; window.__samples = 1; for (const k of K) S.render(k[0], pose); for (let t = 0; t < D; t += 1.5) S.render(t, pose); window.__samples = keep; }

  return { duration: D, timeline: { T }, render };
}

// Sahne: domino zinciri (№ 023, "Masa" formatı). Gerçek 3B (three.js), stüdyo ışığı, fizikle devrilen taşlar.
// Bütün dünya metre cinsinden; her karede kamera odağına göre (F) ve o anki ölçeğe (S) bölünerek çizilir:
// 5 mm'den 30 km'ye kadar her ölçek float32'de hassas kalır. Her kare, kare içindeki zaman, mercek ve alt piksel
// örneklerinin ortalamasıdır (hareket bulanıklığı + alan derinliği + kenar yumuşatma tek geçişte). Kare, t'nin
// saf fonksiyonudur; rastgelelik tohumlu.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from '../../node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { W, H, ease, seg, lerp, clamp01, mulberry32 } from '../core.js';
import { C, F, setFont, wrap } from '../tower.js';
import { SIFIR_CARD, POSES, mixPose, drawSifir } from '../sifir.js';
import {
  H1, RATIO, THICK, WIDE, GAP, N, N_NEXT, FPS, hOf, xOf, buildDominoTimeline, anglesAt, frontK, monotone, fmtLen, CALC, calcN, GHOST_N, ghostT,
} from './domino_core.js';

const SAFE = { x0: 90, x1: 920 };
const FOCUS_Y = 1270;                    // odak noktasının ekrandaki yüksekliği (3B eylem metnin altında)

// ——— Renk: hedef sRGB → doğrusal; çıkış ton eşlemesinin (Khronos PBR Neutral) tersi ile zemin rengi birebir ———
const s2l = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const hex = h => [1, 3, 5].map(i => s2l(parseInt(h.slice(i, i + 2), 16) / 255));
function neutral([r, g, b]) {
  const x = Math.min(r, g, b), off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  r -= off; g -= off; b -= off;
  const peak = Math.max(r, g, b), sc = 0.76;
  if (peak < sc) return [r, g, b];
  const d = 1 - sc, np = 1 - (d * d) / (peak + d - sc);
  r *= np / peak; g *= np / peak; b *= np / peak;
  const gg = 1 - 1 / (0.15 * (peak - np) + 1);
  return [lerp(r, np, gg), lerp(g, np, gg), lerp(b, np, gg)];
}
function preTone(target) {          // neutral(L) = target çözümü
  let L = target.slice();
  for (let i = 0; i < 60; i++) { const o = neutral(L); L = L.map((v, j) => v + (target[j] - o[j])); }
  return L;
}
const col = arr => new THREE.Color().setRGB(arr[0], arr[1], arr[2], THREE.LinearSRGBColorSpace);
const PAPER_L = preTone(hex(C.paper));

export function makeDominoRenderer(ep, overlay) {
  const tl = buildDominoTimeline(ep);
  const D = tl.duration, c = tl.c;

  // ——— Tuvaller: altta WebGL, üstte 2B kaplama (metin, ölçü çizgileri) ———
  const glc = document.createElement('canvas');
  glc.width = W; glc.height = H;
  for (const el of [glc, overlay]) Object.assign(el.style, { position: 'absolute', left: '0', top: '0', width: W + 'px', height: H + 'px' });
  overlay.parentNode.insertBefore(glc, overlay);
  const ctx = overlay.getContext('2d');

  const gl = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
  gl.setPixelRatio(1);
  gl.setSize(W, H, false);
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  gl.toneMapping = THREE.NoToneMapping;
  gl.autoClear = false;                     // birikim hedefi elle temizlenir

  const scene = new THREE.Scene();
  scene.background = col(PAPER_L);
  scene.fog = new THREE.Fog(col(PAPER_L), 1, 3);
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, W / H, 0.01, 6000);
  window.__dom = { scene, camera, gl, THREE };
  window.__grid = null;

  // Işık: sıcak ana ışık (gölgeli), arkadan kontur, yarımküre dolgu
  const key = new THREE.DirectionalLight(new THREE.Color('#FFF4E4'), 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(new THREE.Color('#FFFFFF'), 1.1);
  scene.add(rim, rim.target);
  scene.add(new THREE.HemisphereLight(col(PAPER_L), new THREE.Color('#8B8577'), 0.55));

  // ——— Zemin: kâğıt + ölçeğe göre geçişli ızgara (mm → cm → m → km) ———
  const gridU = { uL: { value: [1, 1, 1, 1] }, uA: { value: [0, 0, 0, 0] }, uOffX: { value: [0, 0, 0, 0] }, uOffZ: { value: [0, 0, 0, 0] }, uS: { value: 1 }, uInk: { value: col(hex(C.ink)) } };
  window.__grid = gridU;
  const groundMat = new THREE.MeshStandardMaterial({ color: col(hex('#E9E2D1')), roughness: 0.96, metalness: 0 });
  groundMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, gridU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vGp;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vGp; uniform float uL[4]; uniform float uA[4]; uniform float uOffX[4]; uniform float uOffZ[4]; uniform float uS; uniform vec3 uInk;
      float gline(vec2 p) { vec2 w = fwidth(p); vec2 g = abs(fract(p - 0.5) - 0.5) / max(w, 1e-6); return 1.0 - min(min(g.x, g.y), 1.0); }`)
      .replace('#include <map_fragment>', `#include <map_fragment>
      float gridSum = 0.0;
      for (int i = 0; i < 4; i++) {
        vec2 p = vec2(vGp.x * uS + uOffX[i], vGp.z * uS + uOffZ[i]) / uL[i];
        gridSum = max(gridSum, gline(p) * uA[i]);
      }
      diffuseColor.rgb = mix(diffuseColor.rgb, uInk, gridSum);`);
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ——— Taşlar: lake kaplı mürekkep siyahı, krem benekler; 37. taş kırmızı ———
  const pipTex = new Map();
  function pips(a, b, base) {
    const k = base + a + '_' + b;
    if (pipTex.has(k)) return pipTex.get(k);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 512;
    const g = cv.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, 256, 512);
    g.fillStyle = '#F2EBDB';
    g.fillRect(40, 253, 176, 6);
    const spots = { 0: [], 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
    [[a, 0], [b, 256]].forEach(([n, y0]) => { for (const [i, j] of spots[n]) { g.beginPath(); g.arc(64 + i * 64, y0 + 64 + j * 64, 19, 0, Math.PI * 2); g.fill(); } });
    const tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    pipTex.set(k, tx);
    return tx;
  }
  const lacquer = (color, map) => new THREE.MeshPhysicalMaterial({ color: map ? 0xffffff : color, map: map || null, roughness: 0.38, clearcoat: 0.85, clearcoatRoughness: 0.16, metalness: 0 });
  const geo = new RoundedBoxGeometry(THICK, 1, WIDE, 3, 0.022);
  geo.translate(-THICK / 2, 0.5, 0);          // pivot: ön alt kenar (x = 0, y = 0)
  function makeStone(k, red) {
    const base = red ? C.red : C.ink;
    const pr = mulberry32(2304 + k * 97), a = Math.floor(pr() * 7), b = Math.floor(pr() * 7);
    const side = lacquer(new THREE.Color(base));
    const face = lacquer(null, pips(a, b, base));
    const m = new THREE.Mesh(geo, [face, face, side, side, side, side]);
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
    return m;
  }
  const stones = [];
  for (let k = 1; k <= N; k++) stones[k] = makeStone(k, k === N);
  // döngünün sonraki zinciri (P1'de, dik): son kare, ilk karenin bir basamak aşağısıdır
  const EV_R = 6500, EV_D = 7800;              // Everest maketi: taban yarıçapı, kırmızı taşın pivotundan uzaklığı (m)
  const P1x = xOf(N) + THICK * hOf(N) + EV_D + EV_R * 1.07 + 900;   // Everest'in eteğinin ötesi
  const next = [];
  for (let k = 1; k <= N_NEXT; k++) next[k] = makeStone(k, false);
  // hayalet zincir (38 → 63): düşünce deneyinin devamı, yalnızca kurşun kalem çizgisi
  const ghostGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(THICK, 1, WIDE).translate(-THICK / 2, 0.5, 0));
  const ghostMat = new THREE.LineBasicMaterial({ color: col(hex(C.ink)), fog: false });
  const ghostFill = new THREE.MeshBasicMaterial({ color: col(hex('#E4DAC4')), transparent: true, opacity: 0.6, depthWrite: false, fog: false });
  const ghostBox = new THREE.BoxGeometry(THICK, 1, WIDE).translate(-THICK / 2, 0.5, 0);
  const GX = [];
  GX[N + 1] = xOf(N) + THICK * hOf(N) + EV_D + EV_R * 1.3 + 2500;
  for (let k = N + 1; k < GHOST_N; k++) GX[k + 1] = GX[k] + (THICK + GAP) * hOf(k);
  const ghosts = [];
  for (let k = N + 1; k <= GHOST_N; k++) { const g = new THREE.Group(); g.add(new THREE.Mesh(ghostBox, ghostFill), new THREE.LineSegments(ghostGeo, ghostMat)); ghosts[k] = g; scene.add(g); }

  // ——— Sıfır: kâğıttan kesilmiş ayaklı figür (tek çizim fonksiyonu: drawSifir) ———
  const HS = 0.0055;                          // baş çapı: 5,5 mm (toplam boy ~11 mm)
  const SPX = 380, SCW = 768, SCH = 1024, ROOT = [384, 940];
  function makeStandee() {
    const cv = document.createElement('canvas'); cv.width = SCW; cv.height = SCH;
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const mat = new THREE.MeshStandardMaterial({ map: tx, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.95 });
    const pg = new THREE.PlaneGeometry(SCW / SPX, SCH / SPX);
    pg.translate((SCW / 2 - ROOT[0]) / SPX, (ROOT[1] - SCH / 2) / SPX, 0);   // kök: ayakların ortası
    const m = new THREE.Mesh(pg, mat);
    m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tx, alphaTest: 0.5 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: col(hex('#F4EFE3')), roughness: 0.9 }));
    base.position.y = 0.025; base.castShadow = true; base.receiveShadow = true;
    const g = new THREE.Group(); g.add(m, base);
    scene.add(g);
    return { g, cv, tx, key: '' };
  }
  const sifirA = makeStandee(), sifirB = makeStandee();
  const POSE_A = { lean: -6, tilt: -4, la: -24, ra: -38, ll: -6, rl: 6, sq: 0 };
  const POSE_W = { lean: -12, tilt: -8, la: -30, ra: -62, ll: -10, rl: 8, sq: 0.03 };
  const POSE_P = { lean: 14, tilt: 6, la: -10, ra: 92, ll: -2, rl: 14, sq: -0.02 };
  const EXPR_LOOK = { eye: 1, mouth: 'o', m: 0.6, look: [0.9, 0.5] };
  function sifirState(tau) {
    if (tau <= 0) return { pose: POSE_A, expr: EXPR_LOOK };
    if (tau < 0.24) return { pose: mixPose(POSE_A, POSE_W, ease.state(tau / 0.24)), expr: EXPR_LOOK };
    if (tau < 0.42) return { pose: mixPose(POSE_W, POSE_P, ease.state((tau - 0.24) / 0.18)), expr: EXPR_LOOK };
    if (tau < 1.0) return { pose: POSE_P, expr: 'sayiyor' };
    const u = ease.state(seg(tau, 1.0, 0.35));
    return { pose: mixPose(POSE_P, POSES.sasirma, u), expr: u > 0.3 ? 'saskin' : 'sayiyor' };
  }
  // elin itiş pozundaki konumu: kök x'i, el 1. taşın arka yüzüne değecek biçimde
  const probe = document.createElement('canvas').getContext('2d');
  const handPx = drawSifir(probe, SIFIR_CARD, POSE_P, 'notr', SPX, { facing: 1, noShadow: true }).handR;
  const HAND = (handPx[0] + SIFIR_CARD.hand / 2 * SPX) / SPX * HS;
  const sifirX0 = xOf(1) - HAND;
  function paintStandee(sd, tau) {
    const st = sifirState(tau);
    const k = JSON.stringify(st);
    if (k === sd.key) return;
    sd.key = k;
    const g = sd.cv.getContext('2d');
    g.clearRect(0, 0, SCW, SCH);
    g.save(); g.translate(ROOT[0], ROOT[1]);
    drawSifir(g, SIFIR_CARD, st.pose, st.expr, SPX, { facing: 1, noShadow: true });
    g.restore();
    sd.tx.needsUpdate = true;
  }

  // ——— Kâğıt maketler (pop-up): sen, Galata Kulesi, Burj Halife, Everest ———
  const paperMat = new THREE.MeshStandardMaterial({ color: col(hex('#DED3BC')), roughness: 0.93, metalness: 0, fog: false });
  const paperFlat = new THREE.MeshStandardMaterial({ color: col(hex('#D6C8AC')), roughness: 0.93, metalness: 0, flatShading: true, fog: false });
  const edgeMat = new THREE.LineBasicMaterial({ color: col(hex(C.ink)), fog: false });
  const withEdges = (geom, mat, thr = 28) => {
    const m = new THREE.Mesh(geom, mat); m.castShadow = true; m.receiveShadow = true;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom, thr), edgeMat));
    return m;
  };
  function person() {
    const body = new THREE.Shape([[-0.16, 0], [-0.05, 0], [0, 0.74], [0.05, 0], [0.16, 0], [0.18, 0.86], [0.26, 0.88], [0.25, 1.36], [0.1, 1.46], [-0.1, 1.46], [-0.25, 1.36], [-0.26, 0.88], [-0.18, 0.86]].map(([x, y]) => new THREE.Vector2(x, y)));
    const head = new THREE.Shape(); head.absarc(0, 1.61, 0.14, 0, Math.PI * 2, false);
    const g = new THREE.ExtrudeGeometry([body, head], { depth: 0.04, bevelEnabled: false });
    g.translate(0, 0, -0.02);
    return { obj: withEdges(g, paperMat), r: 0.3, h: 1.75 };
  }
  function galata() {
    const pts = [[0, 0], [8.2, 0], [8.2, 47.5], [9.2, 48], [9.2, 49.2], [8.0, 49.6], [8.0, 51.6], [8.8, 51.8], [8.8, 52.4], [7.4, 52.6], [0.6, 62.6], [0.25, 62.6], [0.25, 66.9], [0, 66.9]];
    return { obj: withEdges(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 36), paperMat, 20), r: 9.2, h: 66.9 };
  }
  function burj() {
    const g = new THREE.Group();
    const tiers = [[0, 155, 46], [155, 300, 40], [300, 420, 33], [420, 520, 26], [520, 600, 19], [600, 640, 12], [640, 700, 7]];
    for (const [y0, y1, r] of tiers) { const cg = new THREE.CylinderGeometry(r, r, y1 - y0, 6); cg.translate(0, (y0 + y1) / 2, 0); g.add(withEdges(cg, paperFlat)); }
    const sp = new THREE.ConeGeometry(3.5, 128, 6); sp.translate(0, 700 + 64, 0); g.add(withEdges(sp, paperFlat));
    return { obj: g, r: 46, h: 828 };
  }
  // Everest: mimari arazi maketi gibi üst üste kesilmiş kontur katmanları. Üç yüzlü piramit (kuzey, güneybatı,
  // Kangşung yüzleri) ve sırtlar; altta kraft, üst üçte birde beyaz "kar" kâğıdı. Kesik kenarlar mürekkep çizgisi.
  function everest() {
    const Hm = 8848.86, R0 = EV_R, NL = 22, th = Hm / NL;
    const g = new THREE.Group();
    const pr = mulberry32(8848), ph = [pr() * 6.283, pr() * 6.283, pr() * 6.283];
    const mats = [
      new THREE.MeshStandardMaterial({ color: col(hex('#D3C09B')), roughness: 0.95, fog: false }),
      new THREE.MeshStandardMaterial({ color: col(hex('#CBB690')), roughness: 0.95, fog: false }),
      new THREE.MeshStandardMaterial({ color: col(hex('#F4F0E7')), roughness: 0.9, fog: false }),
      new THREE.MeshStandardMaterial({ color: col(hex('#EAE5DA')), roughness: 0.9, fog: false }),
    ];
    for (let i = 0; i < NL; i++) {
      const f = i / NL, pts = [];
      for (let j = 0; j < 96; j++) {
        const a = (j / 96) * Math.PI * 2;
        // yüz −x'e (taşa) bakar: sırtlar 60°, 180°, 300°'de değil; yüz ortası 180°'de
        let r = R0 * Math.pow(1 - f, 0.82) * (1 + 0.2 * Math.cos(3 * (a - 2 * Math.PI / 3)));
        r *= 1 + 0.045 * Math.sin(5 * a + ph[0] + f * 4) + 0.03 * Math.sin(9 * a + ph[1] - f * 7) + 0.02 * Math.sin(17 * a + ph[2] + f * 11);
        pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
      }
      const eg = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: th * 1.001, bevelEnabled: false, curveSegments: 1 });
      eg.rotateX(-Math.PI / 2);
      eg.translate(0, i * th, 0);
      const snow = f >= 0.62;
      g.add(withEdges(eg, mats[(snow ? 2 : 0) + (i % 2)], 40));
    }
    return { obj: g, r: R0 * 1.2, h: Hm, geo: g };
  }
  const builders = { person, galata, burj, everest };
  const PIV = xOf(N) + THICK * hOf(N);           // kırmızı taşın pivotu (ön alt kenar)
  const marks = ep.stops.map(s => {
    const b = builders[s.kind]();
    const hinge = new THREE.Group(); hinge.add(b.obj);
    b.obj.position.z = -b.r;                // menteşe modelin ön (zincire bakan) kenarında
    scene.add(hinge);
    const k = s.k, hk = hOf(k);
    if (s.kind === 'everest') return { ...s, hinge, r: b.r, mh: b.h, x: PIV + EV_D, z: b.r, geo: b.geo, side: 1 };
    const off = { person: [-0.75, 0.35], galata: [-26, 6], burj: [-150, 40] }[s.kind];
    return { ...s, hinge, r: b.r, mh: b.h, x: xOf(k) + off[0], z: -(WIDE * hk / 2 + off[1]), side: -1 };
  });

  // Kırmızı taşın üst köşesinin Everest'in yamacına değdiği açı: gerçek maket geometrisine ışın atılarak bulunur
  const THETA_HIT = (() => {
    const ev = marks.find(m => m.kind === 'everest');
    const mesh = ev.geo.clone(true); mesh.position.set(ev.x, 0, 0); mesh.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(), h = hOf(N);
    for (let th = 0.3; th < 1.2; th += 0.0004) {
      const cx = PIV + h * Math.sin(th), cy = h * Math.cos(th);
      ray.set(new THREE.Vector3(cx, 3e4, 0), new THREE.Vector3(0, -1, 0));
      const hit = ray.intersectObject(mesh, true)[0];
      if (hit && cy <= hit.point.y) {
        // denetim: yaslanmış taşın ön yüzü boyunca hiçbir nokta dağın içinde değil
        let pen = 0;
        for (let q = 0.05; q < 1; q += 0.05) for (const z of [-WIDE * h / 2, 0, WIDE * h / 2]) {
          const px = PIV + q * h * Math.sin(th), py = q * h * Math.cos(th);
          ray.set(new THREE.Vector3(px, 3e4, z), new THREE.Vector3(0, -1, 0));
          const hh = ray.intersectObject(mesh, true)[0];
          if (hh && hh.point.y > py + 5) pen = Math.max(pen, hh.point.y - py);
        }
        window.__dom.evPen = pen;
        return th;
      }
    }
    return Math.PI / 2;
  })();
  window.__dom.thetaHit = THETA_HIT;

  // ——— Kamera izi ———
  // Düğümler: ölçek (taş indeksi cinsinden), uzaklık çarpanı, azimut, yükseklik açısı, odağın önde gidişi.
  // Hepsi monoton kübik: kırılmasız, aşmasız. Kamera dalgayı biraz geriden izler.
  const track = kn => monotone(kn.map(a => a[0]), kn.map(a => a[1]));
  const kKn = [[-1.0, 0.86], [0.4, 0.9]];
  for (let k = 2; k <= N; k++) kKn.push([c[k], k - 0.4]);
  const [d0, d1] = tl.dive, A1 = ep.says.find(x => x.t0 >= tl.land).t1;   // aha cümlesinin sonu: plan görünüşü başlar
  const G0 = ghostT(tl, N + 1), G1 = ghostT(tl, GHOST_N);
  kKn.push([tl.land, N + 0.55], [tl.land + 3.5, N + 0.75], [A1, N + 1.0]);
  // hayalet bölümünde kamera ölçeği her hayalet taşın belirişine bağlı: S eğrisi yüzünden öne kaçmasın
  for (let k = N + 1; k <= GHOST_N; k++) kKn.push([ghostT(tl, k) + 0.15, k + 0.1]);
  kKn.push([d0, GHOST_N + 0.75]);
  const kCamF = track(kKn);
  const leadF = track([[-1, -0.42], [0.4, -0.38], [1.4, 0.35], [c[N], 0.4]]);
  const mF = track([[-1, 11.8], [0.4, 11.5], [1.8, 11.2], [c[16], 11.0], [c[25], 10.8], [c[31], 11.0], [c[34], 14.5], [c[36], 13.5], [c[N], 8.0], [tl.land, 6.8], [tl.land + 3, 6.0], [A1, 5.4], [G0 + 0.6, 7.2], [d0, 7.6]]);
  const lookYF = track([[-1, 1.12], [0.4, 1.08], [1.8, 0.5], [c[N], 0.42], [tl.land, 0.22], [A1, 0.2], [G0 + 0.6, 0.48], [d0, 0.5]]);
  const azF = track([[-1, 0.52], [0.4, 0.52], [3, 0.5], [c[16], 0.58], [c[25], 0.66], [c[34], 0.56], [c[N], 0.34], [tl.land, 0.33], [A1, 1.05], [G0 + 1.2, 0.72], [d0, 0.64]]);
  const elF = track([[-1, 0.24], [0.4, 0.24], [3, 0.29], [c[N] - 1.2, 0.27], [c[N], 0.2], [tl.land, 0.18], [A1, 0.3], [G0 + 1.2, 0.33], [d0, 0.36]]);
  const standF = [PIV + EV_D * 0.42, 0, 0];   // ayaktaki kırmızı taş ile Everest yan yana
  const endF = [PIV + EV_D * 0.5, 0, 0];      // Everest'in zirvesine yaslanan dev
  const xAtK = k => {
    if (k <= 1) return xOf(1) - (1 - k) * 0.0045;
    if (k >= N + 1) { const i = Math.min(GHOST_N - 1, Math.floor(k)); return lerp(GX[i], GX[i + 1], k - i); }
    if (k >= N) return lerp(xOf(N), GX[N + 1], k - N);
    const i = Math.floor(k); return lerp(xOf(i), xOf(i + 1), k - i);
  };
  function chainCam(t) {
    const kc = kCamF(t);
    const S = hOf(kc);
    // kırmızı taş ile Everest yan yana (ayakta) → devrilen devin boyu → yukarıdan bütün zincir
    const ws = ease.state(seg(t, c[N] - 1.8, 1.9)), we = ease.state(seg(t, c[N] + 0.4, 2.8)), wg = ease.state(seg(t, A1 - 0.1, 1.2));
    const gF = [xAtK(kc + 0.25), 0, 0];           // hayalet zincirin cephesi
    const f = i => lerp(lerp(lerp(i === 0 ? xAtK(kc + leadF(t)) : 0, standF[i], ws), endF[i], we), gF[i], wg);
    return { F: [f(0), 0, f(2)], S, M: mF(t), az: azF(t), el: elF(t), ly: lookYF(t) };
  }
  function camAt(t) {
    if (t <= d0) return chainCam(t);
    const mac = chainCam(t - D); mac.F = [mac.F[0] + P1x, 0, mac.F[2]];
    if (t >= d1) return mac;
    const w = ease.state(seg(t, d0, d1 - d0));
    const wide = chainCam(t);
    const S = Math.exp(lerp(Math.log(wide.S), Math.log(mac.S), w));
    // odak, ölçekle orantılı yaklaşır: hedef nokta ekranda neredeyse sabit kalır
    const wf = clamp01((wide.S - S) / (wide.S - mac.S));
    const L = k => lerp(wide[k], mac[k], w);
    return { F: [lerp(wide.F[0], mac.F[0], wf), 0, lerp(wide.F[2], mac.F[2], wf)], S, M: L('M'), az: L('az'), el: L('el'), ly: L('ly') };
  }
  window.__dom.camAt = t => camAt(t); window.__dom.chainCam = t => chainCam(t);
  const kick = t => (t > tl.land ? 1 - 0.05 * Math.exp(-(t - tl.land) * 6) : 1);

  // ——— Dünyayı t anına göre kur (kamera-göreli birimler) ———
  let CAM = null;
  const v3 = new THREE.Vector3();
  function rel(x, y, z) { return v3.set((x - CAM.F[0]) / CAM.S, (y - CAM.F[1]) / CAM.S, (z - CAM.F[2]) / CAM.S); }
  function pose(t, lens, jit) {
    CAM = camAt(t);
    const Dd = CAM.M * kick(t);
    const look = new THREE.Vector3(0, CAM.ly, 0);
    const dir = new THREE.Vector3(-Math.sin(CAM.az) * Math.cos(CAM.el), Math.sin(CAM.el), Math.cos(CAM.az) * Math.cos(CAM.el));
    camera.position.copy(look).addScaledVector(dir, Dd);
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    if (lens) {                              // mercek diski üstünde bir nokta: odak düzlemi keskin kalır
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      camera.position.addScaledVector(right, lens[0] * Dd * 0.011).addScaledVector(up, lens[1] * Dd * 0.011);
      camera.lookAt(look);
    }
    camera.near = Dd * 0.01; camera.far = Dd * 1500;
    camera.setViewOffset(W, H, (jit ? jit[0] : 0), H / 2 - FOCUS_Y + (jit ? jit[1] : 0), W, H);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    scene.fog.near = Dd * 1.02; scene.fog.far = Dd * (window.__fogK || 1.55);   // ilerideki dev taşlar kâğıda karışır

    // ızgara seviyeleri
    const lv = Math.log10(CAM.S) - 0.15, n = Math.floor(lv);
    for (let i = 0; i < 4; i++) {
      const L = Math.pow(10, n - 1 + i), x = Math.log10(L) - lv;
      gridU.uL.value[i] = L;
      gridU.uA.value[i] = 0.16 * clamp01(x + 1) * clamp01(2 - x);
      gridU.uOffX.value[i] = ((CAM.F[0] % L) + L) % L;
      gridU.uOffZ.value[i] = ((CAM.F[2] % L) + L) % L;
    }
    gridU.uS.value = CAM.S;
    ground.position.set(0, -CAM.F[1] / CAM.S, 0);

    // taşlar
    const ang = anglesAt(tl, t, THETA_HIT);
    const tiny = CAM.S * Dd * 2e-4;
    for (let k = 1; k <= N; k++) {
      const h = hOf(k), m = stones[k];
      m.visible = h > tiny;
      if (!m.visible) continue;
      m.position.copy(rel(xOf(k) + THICK * h, 0, 0));
      m.scale.setScalar(h / CAM.S);
      m.rotation.set(0, 0, -ang[k]);
    }
    for (let k = 1; k <= N_NEXT; k++) {
      const h = hOf(k), m = next[k];
      m.visible = h > tiny;
      if (!m.visible) continue;
      m.position.copy(rel(P1x + xOf(k) + THICK * h, 0, 0));
      m.scale.setScalar(h / CAM.S);
      m.rotation.set(0, 0, 0);
    }
    for (let k = N + 1; k <= GHOST_N; k++) {
      const h = hOf(k), g = ghosts[k];
      const u = ease.enter(seg(t, ghostT(tl, k), 0.3)) * (1 - ease.exit(seg(t, tl.dive[0] + 1.55, 0.35)));
      g.visible = u > 0.001 && h > tiny;
      if (!g.visible) continue;
      g.position.copy(rel(GX[k] + THICK * h, 0, 0));
      g.scale.set(h / CAM.S, (h / CAM.S) * u, h / CAM.S);
    }
    // Sıfır (iki figür: başlangıç ve döngünün sonraki basamağı)
    const zS = (WIDE * H1) / 2 + 0.0009;
    for (const [sd, x0, tau] of [[sifirA, sifirX0, t], [sifirB, P1x + sifirX0, t - D]]) {
      sd.g.visible = HS > tiny * 0.5;
      if (!sd.g.visible) continue;
      paintStandee(sd, tau);
      sd.g.position.copy(rel(x0, 0, zS));
      sd.g.scale.setScalar(HS / CAM.S);
    }
    // maketler: duraktan önce açılır, dalıştan önce kapanır
    for (const mk of marks) {
      const open = ease.state(seg(t, c[mk.k] - (mk.kind === 'everest' ? 3.2 : 2.2), 1.0));
      const close = ease.state(seg(t, tl.dive[0] - 1.6, 1.0));
      const u = open * (1 - close);
      mk.hinge.visible = u > 0.001 && mk.mh > tiny;
      if (!mk.hinge.visible) continue;
      mk.hinge.position.copy(rel(mk.x, 0, mk.z));
      mk.hinge.scale.setScalar(1 / CAM.S);
      mk.hinge.rotation.set(-(1 - u) * Math.PI / 2, 0, 0);
    }
    // ışıklar odak çevresinde
    const E = Dd * 1.6;
    key.position.set(-0.5 * 30, 1.0 * 30, 0.62 * 30);
    key.target.position.set(0, 0, 0);
    Object.assign(key.shadow.camera, { left: -E, right: E, top: E, bottom: -E, near: 0.1, far: 80 });
    key.shadow.camera.updateProjectionMatrix();
    rim.position.set(0.7 * 30, 0.55 * 30, -0.9 * 30);
  }

  // ——— Örnek birikimi (doğrusal ışık, float) ve çıkış geçişi ———
  const rtS = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType });
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const accMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, w: { value: 1 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb * w, 1.0); }',
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation, depthTest: false, depthWrite: false,
  });
  const outMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rtA.texture }, seed: { value: 0 }, expo: { value: 1 } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform float seed; uniform float expo; varying vec2 vUv;
      vec3 neutral(vec3 c){ float x = min(c.r, min(c.g, c.b)); float off = x < 0.08 ? x - 6.25 * x * x : 0.04; c -= off;
        float peak = max(c.r, max(c.g, c.b)); if (peak < 0.76) return c; float d = 0.24; float np = 1.0 - d * d / (peak + d - 0.76);
        c *= np / peak; float g = 1.0 - 1.0 / (0.15 * (peak - np) + 1.0); return mix(c, vec3(np), g); }
      float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423) + seed); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
      vec3 enc(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      void main(){ vec3 c = neutral(max(texture2D(tex, vUv).rgb * expo, 0.0)); c = enc(clamp(c, 0.0, 1.0));
        float l = dot(c, vec3(0.299, 0.587, 0.114)); float n = hash(gl_FragCoord.xy) - 0.5;
        c += n * 0.026 * (1.0 - abs(l - 0.5) * 1.4) + (hash(gl_FragCoord.yx + 7.0) - 0.5) / 255.0;
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  window.__dom.rtA = rtA; window.__dom.rtS = rtS;
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(quadGeo, accMat); quad.frustumCulled = false; quadScene.add(quad);

  function render3D(t) {
    const NS = window.__samples || ep.samples || 16;
    const r = mulberry32(Math.round(t * FPS) * 7919 + 13);
    gl.setRenderTarget(rtA); gl.setClearColor(0x000000, 0); gl.clear();
    for (let i = 0; i < NS; i++) {
      // kare içi zaman (0,5 kare deklanşör), mercek diski, alt piksel kayması — tabakalı örnek
      const shut = t > ghostT(tl, N + 1) - 0.3 && t < tl.dive[0] ? 0.12 : 0.5;
      const ts = t + ((i + r()) / NS - 0.5) * (shut / FPS);
      const a = 2 * Math.PI * ((i * 0.618034 + r()) % 1), rr = Math.sqrt((i + 0.5) / NS);
      pose(ts, NS > 1 ? [Math.cos(a) * rr, Math.sin(a) * rr] : null, NS > 1 ? [r() - 0.5, r() - 0.5] : null);
      const j = 0.035;
      key.position.x += (r() - 0.5) * 30 * j; key.position.z += (r() - 0.5) * 30 * j;
      gl.setRenderTarget(rtS); gl.setClearColor(scene.background, 1); gl.clear();
      gl.render(scene, camera);
      quad.material = accMat; accMat.uniforms.tex.value = rtS.texture; accMat.uniforms.w.value = 1 / NS;
      gl.setRenderTarget(rtA); gl.render(quadScene, quadCam);
    }
    quad.material = outMat; outMat.uniforms.seed.value = (Math.round(t * FPS) % 97) * 0.731;
    gl.setRenderTarget(null); gl.render(quadScene, quadCam);
    pose(t, null, null);                      // kaplama için merkez kamera
  }

  // ——— 2B kaplama: başlık, sayaç, cümleler, ölçü çizgileri ———
  const qSize = (() => { let s = 84; setFont(ctx, F.head(s)); while (s > 62 && ep.question.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { s -= 2; setFont(ctx, F.head(s)); } return s; })();
  const qY = 374 + qSize * 0.86;
  const counterY = qY + qSize * (ep.question.length - 1) + 150;
  const saysY = counterY + 92;
  // kâğıt hale: metin, arkasından geçen 3B nesnenin üstünde de okunur (gölge ya da kutu değil)
  function halo(s, x, y, w) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.lineWidth = w;
    ctx.strokeStyle = 'rgba(236,229,213,0.9)'; ctx.strokeText(s, x, y); ctx.restore();
    ctx.fillText(s, x, y);
  }
  function project(x, y, z) {
    const p = rel(x, y, z).clone().project(camera);
    return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z];
  }
  function clipReveal(text, x, y, size, color, t0, t1, t, lh) {
    const inU = ease.enter(seg(t, t0, 0.35)), outU = ease.exit(seg(t, t1 - 0.25, 0.25));
    if (inU <= 0 || outU >= 1) return;
    setFont(ctx, F.name(size));
    const lines = wrap(ctx, text, SAFE.x1 - SAFE.x0);
    lines.forEach((ln, i) => {
      ctx.save();
      ctx.beginPath(); ctx.rect(x - 4, y + i * lh - size * 1.02, SAFE.x1 - x + 8, size * 1.32); ctx.clip();
      const dy = (1 - inU) * size * 1.1 - outU * size * 1.2;
      ctx.fillStyle = color; halo(ln, x, y + i * lh + dy, 12);
      ctx.restore();
    });
  }
  // mimari ölçü çizgisi: önce uzatma çizgileri, sonra çizgi ortadan büyür, sonra etiket.
  // Çizgi 3B geometriyi izler; etiket, belirdiği andaki yerinde ekrana sabitlenir (okunurken kıpırdamaz).
  function dimV(a, b, u, color, label, side, pin, mode) {
    if (u <= 0) return;
    const [ax, ay] = a, [bx, by] = b;
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'butt';
    const ext = clamp01(u / 0.3), grow = ease.state(clamp01((u - 0.2) / 0.5)), lab = ease.enter(clamp01((u - 0.6) / 0.4));
    const ox = side * 26;
    ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + ox * ext, ay); ctx.moveTo(bx, by); ctx.lineTo(bx + ox * ext, by); ctx.stroke();
    const mx = (ax + bx) / 2 + ox * 0.8, my = (ay + by) / 2;
    const y0 = lerp(my, ay, grow), y1 = lerp(my, by, grow);
    ctx.beginPath(); ctx.moveTo(mx, y0); ctx.lineTo(mx, y1); ctx.stroke();
    if (grow > 0.98) for (const y of [ay, by]) { ctx.beginPath(); ctx.moveTo(mx - 9, y + 9); ctx.lineTo(mx + 9, y - 9); ctx.stroke(); }
    ctx.globalAlpha = 1;
    if (lab > 0) {
      setFont(ctx, F.mono(44)); ctx.fillStyle = C.ink;
      const lines = label.split('\n'), lh = 50;
      const wMax = Math.max(...lines.map(l => ctx.measureText(l).width));
      // sabit çapa: belirdiği andaki çizginin tepesi ('top') ya da ortası ('side')
      const [px, pTop, pMid] = pin;
      let lx, ly;
      if (mode === 'top') { lx = px + ox * 0.8 - wMax / 2; ly = pTop - 26; }
      else { lx = side < 0 ? px + ox * 0.8 - 18 - wMax : px + ox * 0.8 + 18; ly = pMid; }
      lx = Math.max(SAFE.x0, Math.min(SAFE.x1 - wMax, lx));
      const top = ly - (lines.length - 1) * lh;
      // kılavuz: etiket çizgiden uzaklaştıysa ince grafit çizgi
      const tx = mx, ty = mode === 'top' ? Math.min(ay, by) : my;
      const nx = Math.max(lx, Math.min(lx + wMax, tx)), ny = mode === 'top' ? ly + 10 : Math.max(top - 34, Math.min(ly + 8, ty));
      if (Math.hypot(nx - tx, ny - ty) > 14) {
        ctx.save(); ctx.globalAlpha = 0.7 * lab; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(tx, ty); ctx.stroke(); ctx.restore();
      }
      lines.forEach((ln, i) => {
        const y = top + i * lh;
        ctx.save(); ctx.beginPath(); ctx.rect(lx - 8, y - 40, wMax + 16, 52); ctx.clip();
        halo(ln, lx, y + (1 - lab) * 44, 10); ctx.restore();
      });
    }
    ctx.restore();
  }
  const fmt = m => { const f = fmtLen(m); return `${f.num} ${f.unit}`; };
  function drawOverlay(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; halo(ep.serial, SAFE.x0, 336, 10);
    setFont(ctx, F.head(qSize)); ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => halo(q, SAFE.x0, qY + i * qSize, 16));

    // sayaç: o an itilen taş
    const mid = (tl.dive[0] + tl.dive[1]) / 2;
    let k = 1;
    if (t < mid) for (let j = 1; j <= N; j++) if (t >= c[j]) k = j;
    if (t < mid) for (let j = N + 1; j <= GHOST_N; j++) if (t >= ghostT(tl, j)) k = j;
    const hero = t >= tl.land && t < ghostT(tl, N + 1);
    setFont(ctx, F.head(112)); ctx.fillStyle = hero ? C.red : C.ink;
    const ks = String(k);
    halo(ks, SAFE.x0, counterY, 18);
    const kw = ctx.measureText(ks).width;
    setFont(ctx, F.name(56)); ctx.fillStyle = hero ? C.red : C.ink;
    halo(fmt(hOf(k)), SAFE.x0 + kw + 26, counterY, 12);
    // etiket rakamdan sonra ve yukarıda: Ş'nin çengeli rakamın halesinin altında kalmasın
    setFont(ctx, F.mono(34)); ctx.fillStyle = hero ? C.red : C.graphite;
    halo('TAŞ', SAFE.x0, counterY - 100, 9);

    for (const s of ep.says) clipReveal(s.text, SAFE.x0, saysY, 44, s.red ? C.red : C.ink, s.t0, s.t1, t, 56);
    // hesap satırı: 1,5'in kuvvetleri gözün önünde patlar
    const a0 = tl.land + CALC.delay - 0.15, aEnd = ep.says.find(x => x.t0 >= tl.land).t1;
    if (t > a0 && t < aEnd) {
      const n = calcN(tl, t), v = Math.pow(1.5, n);
      const num = v < 10 ? new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(v) : new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(v);
      clipReveal(`${n} adım · ${num} kat`, SAFE.x0, saysY + 56 + 86, 56, n === CALC.n ? C.red : C.ink, a0, aEnd, t, 70);
    }

    // ölçü çizgileri: taş (mürekkep) ve maket (grafit)
    // etiket çapaları: etiketin belirdiği an için kamera kurulur, projeksiyon alınır, sonra t'ye dönülür
    const active = [];
    for (const mk of marks) {
      const ck = c[mk.k], hk = hOf(mk.k), isE = mk.kind === 'everest';
      const s0 = ck - 0.05, sEnd = ck + 0.9, mEnd = isE ? tl.land + 3.5 : ck + 2.6;
      const us = seg(t, s0, 0.9) * (1 - ease.exit(seg(t, sEnd, 0.3)));
      const um = seg(t, s0 + 0.2, 0.9) * (1 - ease.exit(seg(t, mEnd, 0.3)));
      if (us <= 0 && um <= 0) continue;
      const sP = [xOf(mk.k), WIDE * hk / 2], mP = [mk.x + mk.side * mk.r * (isE ? 0.92 : 1.05), isE ? 0 : mk.z];
      const at = ta => {
        pose(ta, null, null);
        const st = project(sP[0], hk, sP[1]), mt = project(mP[0], mk.mh, mP[1]), mb = project(mP[0], 0, mP[1]);
        return { s: [st[0], st[1], st[1]], m: [mt[0], mt[1], (mt[1] + mb[1]) / 2] };
      };
      active.push({ mk, hk, us, um, sP, mP, pinS: at(s0 + 0.75).s, pinM: at(s0 + 0.95).m });
    }
    // Ay: 63. taşın yanında yerden 384.400 km'ye ölçü çizgisi; tepesinde mürekkep daire
    const gm = ghostT(tl, GHOST_N), um = seg(t, gm - 0.15, 0.9) * (1 - ease.exit(seg(t, tl.dive[0], 0.3)));
    let moon = null;
    if (um > 0) {
      const hm = hOf(GHOST_N), xm = GX[GHOST_N] + THICK * hm + 0.32 * hm, MOON = 384400e3;
      pose(gm + 0.6, null, null);
      const pt = project(xm, MOON, 0);
      moon = { xm, MOON, u: um, pin: [pt[0], pt[1], pt[1]] };
    }
    if (active.length || moon) pose(t, null, null);
    if (moon) {
      const a = project(moon.xm, 0, 0), b = project(moon.xm, moon.MOON, 0);
      dimV(a, b, moon.u, C.graphite, 'Ay · 384.400 km', 1, moon.pin, 'top');
      const r = 22 * ease.enter(clamp01((moon.u - 0.5) / 0.5));
      if (r > 0.5) {
        ctx.save(); ctx.beginPath(); ctx.arc(b[0] + 26 * 0.8, b[1], r, 0, Math.PI * 2);
        ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      }
    }
    for (const { mk, hk, us, um, sP, mP, pinS, pinM } of active) {
      if (us > 0) dimV(project(sP[0], 0, sP[1]), project(sP[0], hk, sP[1]), us, C.ink, fmt(hk), -1, pinS, 'top');
      if (um > 0) dimV(project(mP[0], 0, mP[1]), project(mP[0], mk.mh, mP[1]), um, C.graphite,
        mk.kind === 'everest' ? `${mk.name} · ${mk.label}` : `${mk.name}\n${mk.label}`, mk.side, pinM, mk.kind === 'everest' ? 'top' : 'side');
    }
  }

  return {
    duration: D, timeline: tl,
    render(t) { render3D(t); drawOverlay(t); },
  };
}

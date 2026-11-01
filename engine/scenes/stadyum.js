// "Stadyum" şablonu (№ 041): Hangisi daha şaşırtıcı? Hiç maça çıkmayan Kaiser mi, 59 yaşında hâlâ oynayan Kazu mu?
// Gece, projektörlerle aydınlanmış boş bir stadyum. Sol penaltı noktasında hiç vurulmamış tek bir top (Kaiser);
// karşı tribünün önündeki askıya beş kulübün forması gelir, tabelada "0 MAÇ" yanar; kulübede koltuk değnekleri,
// havada dönerek düşen kırmızı kart. Sağ yarıda 15 yaşındaki Kazu'nun valizi; tabelada yaş 15 → 59.
// Doruk: Kaiser'in topunun arkasından bakılır; "Kazu'nunki 911" ile sahaya 911 top yağar, valiz gömülür.
// Sürekli döngüler: kayan LED reklam panoları, ışıkta süzülen toz; Her kare t'nin saf fonksiyonu, rastgelelik tohumlu.
import { W, H, ease, seg, lerp, mulberry32 } from '../core.js';
import { F, setFont } from '../tower.js';
import { makeSinema, lin, track3, monotone } from '../sinema.js';
import { makeOverlay, cameraTrack } from '../sinema_overlay.js';
import { stadyumTimes, camKeys, landTime, landedCount, NBALL, BALL_R, KB, HEAP, RAIL, SB } from './stadyum_core.js';

const PL = 105, PW = 68;                       // saha (m)
const G = 9.81;

export async function makeStadyumRenderer(ep, canvas) {
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const { tl, T } = stadyumTimes(ep, voice), D = tl.duration;
  const S = makeSinema(ep, canvas, { fog: '#0A0D12', fogDensity: 0.0042, exposure: 1.0, bloom: 0.6, bloomThreshold: 1.0, vignette: 0.36 });
  const { THREE, scene, ctx } = S;
  const rnd = mulberry32(41);
  const std = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.8, metalness: 0, ...o });
  const box = (w, h, d, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };

  // ——— Gökyüzü: koyu, projektörlerin ışığı ufukta pus ———
  {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: lin('#04060A') }, hor: { value: lin('#1A2230') } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(vP.y * 2.6, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h, 0.5)), 1.0); }',
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), m));
  }
  // ——— Ortam haritası: koyu tribün halkası, tepede dört projektör ———
  {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ color: lin('#0D1016'), side: THREE.BackSide })));
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(30, 29, 27), side: THREE.DoubleSide }));
      s.position.set(sx * 45, 40, sz * 36); s.lookAt(0, 0, 0); env.add(s);
    }
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 14, 48, 1, true), new THREE.MeshBasicMaterial({ color: lin('#2A1A1A'), side: THREE.BackSide }));
    ring.position.y = 7; env.add(ring);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshBasicMaterial({ color: lin('#1E4A1E') }));
    floor.rotation.x = -Math.PI / 2; env.add(floor);
    const pm = new THREE.PMREMGenerator(S.gl);
    scene.environment = pm.fromScene(env, 0.02).texture;
    scene.environmentIntensity = 0.6;
  }
  scene.add(new THREE.HemisphereLight(lin('#33405A'), lin('#14301A'), 0.25));

  // ——— Çim: biçme şeritleri ve beyaz çizgiler (dokuda), yakın planlarda gerçek çim yaprakları ———
  const GA = '#2A5A25', GB = '#33682C';
  {
    const s = 39, cw = Math.round(PL * s), ch = Math.round(PW * s);
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const g = c.getContext('2d'), r = mulberry32(7);
    for (let b = 0; b < 20; b++) { g.fillStyle = b % 2 ? GA : GB; g.fillRect(b * cw / 20, 0, cw / 20 + 1, ch); }
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,200'},${0.02 + r() * 0.04})`; const rr = 3 + r() * 26; g.beginPath(); g.arc(r() * cw, r() * ch, rr, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(245,245,238,0.92)'; g.lineWidth = 0.12 * s; g.fillStyle = 'rgba(245,245,238,0.92)';
    const X = x => (x + PL / 2) * s, Z = z => (z + PW / 2) * s;
    const rect = (x0, z0, x1, z1) => g.strokeRect(X(x0), Z(z0), X(x1) - X(x0), Z(z1) - Z(z0));
    rect(-PL / 2 + 0.06, -PW / 2 + 0.06, PL / 2 - 0.06, PW / 2 - 0.06);
    g.beginPath(); g.moveTo(X(0), Z(-PW / 2)); g.lineTo(X(0), Z(PW / 2)); g.stroke();
    g.beginPath(); g.arc(X(0), Z(0), 9.15 * s, 0, 7); g.stroke();
    for (const sx of [-1, 1]) {
      const gx = sx * PL / 2;
      rect(Math.min(gx, gx - sx * 16.5), -20.16, Math.max(gx, gx - sx * 16.5), 20.16);
      rect(Math.min(gx, gx - sx * 5.5), -9.16, Math.max(gx, gx - sx * 5.5), 9.16);
      g.beginPath(); g.arc(X(gx - sx * 11), Z(0), 0.15 * s, 0, 7); g.fill();
      const a0 = Math.acos(5.5 / 9.15);
      g.beginPath(); g.arc(X(gx - sx * 11), Z(0), 9.15 * s, sx > 0 ? Math.PI - a0 : -a0, sx > 0 ? Math.PI + a0 : a0); g.stroke();
      for (const sz of [-1, 1]) { g.beginPath(); g.arc(X(gx), Z(sz * PW / 2), 1 * s, 0, 7); g.stroke(); }
    }
    g.beginPath(); g.arc(X(0), Z(0), 0.15 * s, 0, 7); g.fill();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
    const bump = (() => { const b = document.createElement('canvas'); b.width = b.height = 512; const gb = b.getContext('2d'), rb = mulberry32(9);
      gb.fillStyle = '#808080'; gb.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 26000; i++) { const v = Math.floor(rb() * 255); gb.fillStyle = `rgb(${v},${v},${v})`; gb.fillRect(rb() * 512, rb() * 512, 1, 2 + rb() * 4); }
      const t = new THREE.CanvasTexture(b); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(PL / 1.2, PW / 1.2); return t; })();
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(PL, PW), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 }));
    pitch.rotation.x = -Math.PI / 2; pitch.receiveShadow = true; scene.add(pitch);
    const out = new THREE.Mesh(new THREE.PlaneGeometry(200, 160), std('#24581F', { roughness: 0.95 }));
    out.rotation.x = -Math.PI / 2; out.position.y = -0.01; out.receiveShadow = true; scene.add(out);
  }
  // çim yaprakları: Kaiser'in topunun ve Kazu'nun valizinin çevresinde (yakın planlar)
  {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.08, 1, 0], 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0.15, 0, 1, 0.15, 0, 1, 0.15], 3));   // zemin gibi gölgelenir
    const patches = [[KB[0], KB[2], 3.2, 70000], [HEAP[0], HEAP[2], 3.0, 40000]];
    const n = patches.reduce((a, p) => a + p[3], 0);
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, side: THREE.DoubleSide }), n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color(), r = mulberry32(11);
    let i = 0;
    const gA = lin(GA), gB = lin(GB);
    for (const [cx, cz, R, cnt] of patches) for (let k = 0; k < cnt; k++, i++) {
      const a = r() * Math.PI * 2, rr = R * Math.sqrt(r()), x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
      e.set((r() - 0.5) * 0.7, r() * Math.PI * 2, (r() - 0.5) * 0.7); q.setFromEuler(e);
      const h = 0.022 + r() * 0.03;
      m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(0.004 + r() * 0.003, h, 1)); im.setMatrixAt(i, m);
      const band = Math.floor((x + PL / 2) / (PL / 20)) % 2;
      col.copy(band ? gA : gB).multiplyScalar(0.9 + r() * 0.45); im.setColorAt(i, col);
    }
    im.receiveShadow = true; scene.add(im);
  }

  // ——— Top dokusu: kesik ikosahedron (12 siyah beşgen, 20 beyaz altıgen), dikiş çizgileri ———
  const PHI = (1 + Math.sqrt(5)) / 2;
  const centers = [];
  for (const [a, b] of [[1, PHI]]) for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) { centers.push([0, s1 * a, s2 * b, 1], [s1 * a, s2 * b, 0, 1], [s2 * b, 0, s1 * a, 1]); }
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) for (const s3 of [-1, 1]) centers.push([s1, s2, s3, 0]);
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) centers.push([0, s1 / PHI, s2 * PHI, 0], [s1 / PHI, s2 * PHI, 0, 0], [s2 * PHI, 0, s1 / PHI, 0]);
  for (const c of centers) { const l = Math.hypot(c[0], c[1], c[2]); c[0] /= l; c[1] /= l; c[2] /= l; }
  function ballTexture(seed, worn) {
    const w = 1024, h = 512, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), img = g.createImageData(w, h), r = mulberry32(seed);
    const grime = []; for (let i = 0; i < (worn ? 40 : 0); i++) grime.push([r() * w, r() * h, 6 + r() * 40, 0.05 + r() * 0.12]);
    for (let py = 0; py < h; py++) {
      const th = (py + 0.5) / h * Math.PI, st = Math.sin(th), ct = Math.cos(th);
      for (let px = 0; px < w; px++) {
        const ph = (px + 0.5) / w * Math.PI * 2, d0 = -Math.cos(ph) * st, d2 = Math.sin(ph) * st;
        let b1 = -2, b2 = -2, bi = 0;
        for (let k = 0; k < 32; k++) { const c = centers[k], v = c[0] * d0 + c[1] * ct + c[2] * d2; if (v > b1) { b2 = b1; b1 = v; bi = k; } else if (v > b2) b2 = v; }
        const gap = Math.acos(Math.min(1, b2)) - Math.acos(Math.min(1, b1));
        let v = centers[bi][3] ? 26 : 244;
        if (gap < 0.014) v = centers[bi][3] ? 40 : 150 + gap / 0.014 * 60;
        const o = (py * w + px) * 4;
        img.data[o] = v; img.data[o + 1] = v; img.data[o + 2] = v * 0.985; img.data[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    for (const [x, y, rr, a] of grime) { const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(70,62,40,${a})`); gr.addColorStop(1, 'rgba(70,62,40,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const ballNew = new THREE.MeshPhysicalMaterial({ map: ballTexture(1, false), roughness: 0.42, clearcoat: 0.8, clearcoatRoughness: 0.25 });
  const kBall = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 64, 40), ballNew);
  kBall.position.set(KB[0], BALL_R - 0.006, KB[2]); kBall.rotation.set(0.4, 0.9, 0.1); kBall.castShadow = true; scene.add(kBall);

  // ——— Kazu'nun yığını: 911 top; dinlenme yerleri tohumlu birikimle (her top en alçak adaya yerleşir) ———
  const SUIT = { w: 0.72, h: 0.5, d: 0.24 };
  const rest = [];
  {
    const r = mulberry32(911), R2 = (2 * BALL_R) ** 2;
    const gauss = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
    for (let i = 0; i < NBALL; i++) {
      let best = null;
      for (let k = 0; k < 12; k++) {
        const x = HEAP[0] + gauss() * 0.95, z = HEAP[2] + gauss() * 0.95;
        let y = BALL_R;
        if (Math.abs(x - HEAP[0]) < SUIT.w / 2 + 0.05 && Math.abs(z - HEAP[2]) < SUIT.d / 2 + 0.05) y = SUIT.h + BALL_R;
        for (const p of rest) { const dx = p[0] - x, dz = p[2] - z, d2 = dx * dx + dz * dz; if (d2 < R2) y = Math.max(y, p[1] + Math.sqrt(R2 - d2)); }
        if (!best || y < best[1]) best = [x, y, z];
      }
      rest.push(best);
    }
  }
  const heapMat = new THREE.MeshPhysicalMaterial({ map: ballTexture(2, true), roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const heap = new THREE.InstancedMesh(new THREE.SphereGeometry(BALL_R, 28, 18), heapMat, NBALL);
  heap.castShadow = heap.receiveShadow = true; heap.frustumCulled = false; scene.add(heap);
  const BP = rest.map((p, i) => {                     // her top: düşme yüksekliği, yatay sapma, dönüş
    const r = mulberry32(5000 + i), hgt = 16 + r() * 10;
    return { p, hgt, fall: Math.sqrt(2 * hgt / G), land: landTime(T, i), ox: (r() - 0.5) * 1.2, oz: (r() - 0.5) * 1.2,
      rot: [r() * 6.28, r() * 6.28, r() * 6.28], spin: [(r() - 0.5) * 14, (r() - 0.5) * 14] };
  });
  {
    const col = new THREE.Color();
    const tints = ['#FFFFFF', '#F4F0E4', '#ECE6D4', '#FFFFFF', '#E9EEF2', '#F7E9B8'];
    BP.forEach((b, i) => { col.copy(lin(tints[i % tints.length])); heap.setColorAt(i, col); });
  }
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s1 = new THREE.Vector3(1, 1, 1), _s0 = new THREE.Vector3(0, 0, 0);
  function placeBalls(t) {
    for (let i = 0; i < NBALL; i++) {
      const b = BP[i], t0 = b.land - b.fall;
      if (t < t0) { _m.compose(_v.set(0, -50, 0), _q.identity(), _s0); heap.setMatrixAt(i, _m); continue; }
      let x = b.p[0], y = b.p[1], z = b.p[2], k = 1;
      const bounceV = 0.18 * G * b.fall, bounceT = 2 * bounceV / G;
      if (t < b.land) {                             // serbest düşme (yukarıdan, hafif sapmayla)
        const u = t - t0; y = b.p[1] + b.hgt - 0.5 * G * u * u; x += b.ox; z += b.oz; k = 1 + (b.land - t) * 0.5;
      } else if (t < b.land + bounceT) {            // tek sekme: sapmadan dinlenme yerine
        const u = t - b.land, w = u / bounceT; y = b.p[1] + bounceV * u - 0.5 * G * u * u; x += b.ox * (1 - w); z += b.oz * (1 - w); k = 1 - w;
      } else k = 0;
      const sp = Math.min(t - t0, b.fall + bounceT) * k;
      _e.set(b.rot[0] + b.spin[0] * sp, b.rot[1], b.rot[2] + b.spin[1] * sp); _q.setFromEuler(_e);
      _m.compose(_v.set(x, y, z), _q, _s1); heap.setMatrixAt(i, _m);
    }
    heap.instanceMatrix.needsUpdate = true;
  }

  // ——— Valiz (15 yaşında tek başına Brezilya'ya): eski deri, metal köşeler, etiket ———
  {
    const g = new THREE.Group();
    const lab = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 360; const x = c.getContext('2d'), r = mulberry32(3);
      x.fillStyle = '#6B4329'; x.fillRect(0, 0, 512, 360);
      for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,220,170'},${0.03 + r() * 0.06})`; x.fillRect(r() * 512, r() * 360, 1 + r() * 8, 1 + r() * 3); }
      x.fillStyle = '#3E2516'; x.fillRect(0, 168, 512, 22);
      x.save(); x.translate(330, 96); x.rotate(-0.12); x.fillStyle = '#E9DEC4'; x.fillRect(-92, -46, 184, 92); x.fillStyle = '#2D6B3A'; x.fillRect(-92, -46, 184, 22);
      x.fillStyle = '#20180F'; x.font = '800 30px Archivo'; x.textAlign = 'center'; x.fillText('SÃO PAULO', 0, 18); x.font = '600 24px Archivo'; x.fillText('1982', 0, 40); x.restore();
      x.save(); x.translate(120, 250); x.rotate(0.08); x.fillStyle = '#F0C93A'; x.beginPath(); x.ellipse(0, 0, 70, 46, 0, 0, 7); x.fill(); x.fillStyle = '#1F5C2E'; x.font = '800 28px Archivo'; x.textAlign = 'center'; x.fillText('BRASIL', 0, 10); x.restore();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
    const leather = std('#6B4329', { roughness: 0.62 });
    const front = new THREE.MeshStandardMaterial({ map: lab, roughness: 0.6 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(SUIT.w, SUIT.h, SUIT.d), [leather, leather, leather, leather, front, leather]);
    b.position.y = SUIT.h / 2; b.castShadow = b.receiveShadow = true; g.add(b);
    const metal = std('#B8A27A', { metalness: 0.9, roughness: 0.35 });
    for (const sx of [-1, 1]) for (const sy of [0, 1]) for (const sz of [-1, 1]) box(0.05, 0.05, 0.05, metal, sx * SUIT.w / 2, sy * SUIT.h, sz * SUIT.d / 2, g);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 8, 16, Math.PI), std('#2C1A10', { roughness: 0.5 }));
    handle.position.set(0, SUIT.h, 0); g.add(handle);
    g.position.set(HEAP[0], 0, HEAP[2]); g.rotation.y = 0.35; scene.add(g);
  }

  // ——— Tribünler: basamaklar + koltuklar (tohumlu renk), uzun kenarlarda çatı ———
  {
    const conc = std('#2E3137', { roughness: 0.9 });
    const seatGeo = new THREE.BoxGeometry(0.46, 0.42, 0.4);
    const seats = [];
    const TIERS = 24, DEP = 0.8, RISE = 0.45, Y0 = 1.0;
    function stand(axis, sign, inner, len) {
      for (let k = 0; k < TIERS; k++) {
        const yk = Y0 + RISE * k, off = sign * (inner + DEP * k + DEP / 2);
        const m = axis === 'z' ? box(len, yk, DEP, conc, 0, yk / 2, off) : box(DEP, yk, len, conc, off, yk / 2, 0);
        m.receiveShadow = true;
        for (let u = -len / 2 + 0.4; u < len / 2 - 0.3; u += 0.56) seats.push(axis === 'z' ? [u, yk + 0.21, off + sign * 0.12, 0] : [off + sign * 0.12, yk + 0.21, u, 1]);
      }
      if (axis === 'z') {
        const roofZ = sign * (inner + 11);
        box(len + 4, 0.5, 23, std('#1B1D22', { roughness: 0.7 }), 0, 16.5, roofZ);
        const strip = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.6, 1.55, 1.45) });
        for (let u = -len / 2 + 4; u < len / 2; u += 8) box(2.4, 0.08, 0.3, strip, u, 16.2, sign * (inner + 2));
      }
    }
    stand('z', -1, 42, 116); stand('z', 1, 42, 116); stand('x', -1, 60, 80); stand('x', 1, 60, 80);
    const im = new THREE.InstancedMesh(seatGeo, std('#FFFFFF', { roughness: 0.6 }), seats.length);
    const m = new THREE.Matrix4(), r = mulberry32(17), col = new THREE.Color();
    const red = lin('#8E1C1F'), grey = lin('#45474D'), white = lin('#C9C6C0');
    seats.forEach((s, i) => {
      m.makeRotationY(s[3] ? Math.PI / 2 : 0); m.setPosition(s[0], s[1], s[2]); im.setMatrixAt(i, m);
      const v = r(); col.copy(v < 0.82 ? red : v < 0.95 ? grey : white).multiplyScalar(0.8 + r() * 0.3); im.setColorAt(i, col);
    });
    scene.add(im);
  }

  // ——— LED reklam panoları: saha çevresinde, kayan yazı (sürekli döngü 1) ———
  const boardTex = (() => {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#05070B'; g.fillRect(0, 0, 2048, 64);
    const items = ['KAÇ SIFIR?', 'HANGİSİ DAHA ŞAŞIRTICI?', 'KAÇ SIFIR?', 'HER GÜN YENİ BİR SAYI'];
    let x = 20; g.font = '800 40px Archivo'; g.textBaseline = 'middle';
    items.forEach((s, i) => { g.fillStyle = i % 2 ? '#FFC845' : '#FFFFFF'; g.fillText(s, x, 34); x += g.measureText(s).width + 120; g.fillStyle = '#FFC845'; g.fillRect(x - 70, 26, 16, 16); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t;
  })();
  const boardMats = [];
  {
    const mk = (len, x, z, ry) => {
      const t = boardTex.clone(); t.repeat.set(len / 24, 1); t.needsUpdate = true;
      const mat = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.0, 1.0, 1.0) });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.9), mat); m.position.set(x, 0.55, z); m.rotation.y = ry; scene.add(m);
      box(len, 0.95, 0.15, std('#111318'), x - Math.sin(ry) * 0.09, 0.5, z - Math.cos(ry) * 0.09).rotation.y = ry;
      boardMats.push(t);
    };
    mk(100, 0, 38.5, Math.PI);                    // yakın kenar (kameraya sırtı dönük olanlar görünmez)
    mk(72, -57, 0, Math.PI / 2); mk(72, 57, 0, -Math.PI / 2);
    mk(36, -36, -38.6, 0); mk(36, 36, -38.6, 0);
  }

  // ——— Kaleler: direkler ve file ———
  {
    const post = std('#F2F2EE', { roughness: 0.35 });
    const netTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.strokeStyle = 'rgba(240,240,235,0.85)'; g.lineWidth = 3;
      for (let i = 0; i <= 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
    for (const sx of [-1, 1]) {
      const x = sx * PL / 2, g = new THREE.Group();
      for (const z of [-3.66, 3.66]) box(0.12, 2.44, 0.12, post, x, 1.22, z, g);
      box(0.12, 0.12, 7.44, post, x, 2.44, 0, g);
      const nm = (w, h) => { const t = netTex.clone(); t.repeat.set(w / 0.12, h / 0.12); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ alphaMap: t, color: lin('#EDEDEA'), transparent: true, side: THREE.DoubleSide, roughness: 0.8, depthWrite: false }); };
      const back = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 2.44), nm(7.32, 2.44)); back.position.set(x + sx * 2, 1.22, 0); back.rotation.y = Math.PI / 2; g.add(back);
      const top = new THREE.Mesh(new THREE.PlaneGeometry(2, 7.32), nm(2, 7.32)); top.position.set(x + sx * 1, 2.44, 0); top.rotation.x = Math.PI / 2; g.add(top);
      for (const z of [-3.66, 3.66]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.44), nm(2, 2.44)); sd.position.set(x + sx * 1, 1.22, z); g.add(sd); }
      scene.add(g);
    }
  }

  // ——— Projektör kuleleri: lamba ızgarası (parlama) + sahaya vuran ışık + hafif ışık hüzmesi ———
  const lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(40, 38, 34) });
  const shaftMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { col: { value: lin('#FFF4E2') }, k: { value: 0.02 } },
    vertexShader: 'varying float vA; varying vec3 vN; varying vec3 vV; void main(){ vA = uv.y; vec4 w = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-w.xyz); gl_Position = projectionMatrix * w; }',
    fragmentShader: 'uniform vec3 col; uniform float k; varying float vA; varying vec3 vN; varying vec3 vV; void main(){ float a = clamp(vA, 0.0, 1.0); float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0); vec3 c = col * k * a * a * f * f; gl_FragColor = vec4(c == c ? c : vec3(0.0), 1.0); }',
  });
  function shaft(from, to, radius) {
    const len = new THREE.Vector3(...to).distanceTo(new THREE.Vector3(...from));
    const geo = new THREE.CylinderGeometry(0.3, radius, len, 32, 1, true).translate(0, -len / 2, 0);
    const m = new THREE.Mesh(geo, shaftMat); m.position.set(...from);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize());
    scene.add(m); return m;
  }
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const px = sx * 70, pz = sz * 56, top = 48;
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.6, top, 8), std('#3A3E46', { roughness: 0.6, metalness: 0.5 }));
    tw.position.set(px, top / 2, pz); scene.add(tw);
    const head = new THREE.Group(); head.position.set(px, top + 2, pz);
    box(11, 6.5, 0.5, std('#1C1F25', { metalness: 0.6, roughness: 0.5 }), 0, 0, -0.3, head);
    const disc = new THREE.CircleGeometry(0.62, 20);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const l = new THREE.Mesh(disc, lampMat); l.position.set(-4.5 + c * 1.8, -2.3 + r * 1.55, 0.01); head.add(l); }
    head.lookAt(sx * 10, 0, sz * 8); scene.add(head);
    const L = new THREE.SpotLight(lin('#FFF3E3'), 20000, 0, 0.62, 0.75, 2);
    L.position.set(px, top + 2, pz); L.target.position.set(-sx * 18, 0, -sz * 6); scene.add(L, L.target);
  }
  // takip ışıkları: Kaiser'in topu ve Kazu'nun valizi (gölgeli, dar)
  function follow(target, from, angle, I) {
    const L = new THREE.SpotLight(lin('#F2F6FF'), I, 0, angle, 0.55, 2);
    L.position.set(...from); L.target.position.set(...target);
    L.castShadow = true; L.shadow.mapSize.set(2048, 2048); L.shadow.bias = -0.0004; L.shadow.normalBias = 0.01; L.shadow.camera.near = 20; L.shadow.camera.far = 120;
    scene.add(L, L.target); return L;
  }
  const spotK = follow([KB[0], 0, KB[2]], [-26, 46, 30], 0.07, 18000);
  const spotH = follow([HEAP[0], 0.4, HEAP[2]], [24, 46, 30], 0.085, 15000);
  const shK = shaft([-26, 46, 30], [KB[0], 0, KB[2]], 3.6), shH = shaft([24, 46, 30], [HEAP[0], 0, HEAP[2]], 4.6);

  // ——— Skor tabelası (karşı tribünün üstü): LED nokta dokulu tuval, her kare t'den yeniden çizilir ———
  const sbC = document.createElement('canvas'); sbC.width = 1100; sbC.height = 495;
  const sbG = sbC.getContext('2d'), sbTex = new THREE.CanvasTexture(sbC); sbTex.colorSpace = THREE.SRGBColorSpace; sbTex.anisotropy = 8;
  const dots = (() => { const c = document.createElement('canvas'); c.width = 1100; c.height = 495; const g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0.55)';
    for (let y = 0; y < 495; y += 5) g.fillRect(0, y, 1100, 1.6); for (let x = 0; x < 1100; x += 5) g.fillRect(x, 0, 1.6, 495); return c; })();
  {
    box(SB.w + 1.2, SB.h + 1.2, 0.8, std('#14161B', { metalness: 0.4, roughness: 0.5 }), SB.x, SB.y, SB.z - 0.45);
    for (const sx of [-1, 1]) box(0.6, SB.y - SB.h / 2 - 16, 0.6, std('#2A2D33'), SB.x + sx * 6, (SB.y - SB.h / 2 + 16) / 2, SB.z - 0.6);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(SB.w, SB.h), new THREE.MeshBasicMaterial({ map: sbTex, color: new THREE.Color(2.4, 2.4, 2.4), fog: false }));
    face.position.set(SB.x, SB.y, SB.z); scene.add(face);
  }
  const AMB = '#FFB23A';
  let sbKey = '';
  function drawBoard(t) {
    const kVal = t >= T.l03 + 0.35 ? '0' : '';
    let rLab = '', rVal = '';
    if (t >= T.onbes - 0.05 && t < T.l07) { rLab = 'YAŞ'; rVal = String(T.age(t)); }
    else if (t >= T.l07) { rLab = 'MAÇ'; rVal = t < T.rain0 ? '?' : String(landedCount(T, t)); }
    const kLab = kVal ? 'MAÇ' : '';
    const key = [kVal, rLab, rVal].join('|'); if (key === sbKey) return; sbKey = key;
    const g = sbG; g.fillStyle = '#06070A'; g.fillRect(0, 0, 1100, 495);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#F4F1EA'; g.font = '800 92px Archivo'; g.fillText('KAISER', 275, 120); g.fillText('KAZU', 825, 120);
    g.fillStyle = '#3A3D44'; g.fillRect(548, 40, 4, 410);
    g.fillStyle = AMB; g.font = '800 230px Archivo';
    if (kVal) g.fillText(kVal, 275, 370); if (rVal) g.fillText(rVal, 825, 370);
    g.font = '700 54px Archivo'; g.fillStyle = '#F4F1EA';
    if (kLab) g.fillText(kLab, 275, 445); if (rLab) g.fillText(rLab, 825, 445);
    g.drawImage(dots, 0, 0);
    sbTex.needsUpdate = true;
  }

  // ——— Sol yedek kulübesi: kabuk, oturaklar, iç ışık (sakatlık anında yanar), koltuk değnekleri, buz torbası ———
  const dug = { x: -15, z0: -40.6, z1: -38.2, w: 9 };
  const dugLight = new THREE.PointLight(lin('#FFE2B8'), 0, 9, 2);
  {
    const shell = std('#20242B', { roughness: 0.5, metalness: 0.3 });
    box(dug.w, 2.4, 0.12, shell, dug.x, 1.2, dug.z0);
    box(dug.w, 0.12, dug.z1 - dug.z0 + 0.4, shell, dug.x, 2.4, (dug.z0 + dug.z1) / 2 + 0.2);
    const seat = std('#4E565F', { roughness: 0.4 });
    for (let i = 0; i < 9; i++) { const sx = dug.x - dug.w / 2 + 0.6 + i * 0.97; box(0.5, 0.06, 0.45, seat, sx, 0.48, dug.z0 + 0.45); box(0.5, 0.55, 0.06, seat, sx, 0.78, dug.z0 + 0.18); }
    dugLight.position.set(dug.x + 2, 2.1, dug.z0 + 1.1); scene.add(dugLight);
    // koltuk değnekleri: kulübenin sağ duvarına yaslı
    const al = std('#B9BEC6', { metalness: 0.9, roughness: 0.3 }), rub = std('#1A1A1C', { roughness: 0.8 });
    for (const dz of [-0.12, 0.12]) {
      const g = new THREE.Group();
      for (const dx of [-0.05, 0.05]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 8), al); c.position.set(dx, 0.55, 0); g.add(c); }
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.45, 8), al); leg.position.set(0, -0.12, 0); g.add(leg);
      box(0.13, 0.04, 0.06, rub, 0, 1.1, 0, g); box(0.11, 0.03, 0.04, rub, 0, 0.62, 0, g);
      g.position.set(dug.x + dug.w / 2 - 0.35, 0.33, dug.z0 + 0.75 + dz); g.rotation.z = -0.22; scene.add(g);
    }
    const ice = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.14, 6, 12).rotateZ(Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: lin('#8FC8F0'), roughness: 0.15, transmission: 0, clearcoat: 1 }));
    ice.position.set(dug.x + 2.6, 0.55, dug.z0 + 0.45); ice.scale.y = 0.55; scene.add(ice);
    const towel = box(0.45, 0.04, 0.32, std('#E9E4DA', { roughness: 0.95 }), dug.x + 2.0, 0.53, dug.z0 + 0.45);
  }
  // sağ yedek kulübesi (boş)
  {
    const shell = std('#20242B', { roughness: 0.5, metalness: 0.3 });
    box(dug.w, 2.4, 0.12, shell, -dug.x, 1.2, dug.z0); box(dug.w, 0.12, dug.z1 - dug.z0 + 0.4, shell, -dug.x, 2.4, (dug.z0 + dug.z1) / 2 + 0.2);
  }

  // ——— Forma askısı ve beş forma (logo yok; yalnız kulüp renkleri, sırtta KAISER) ———
  const CLUBS = [
    { k: 'hoops', a: '#C8102E', b: '#111111', name: '#FFFFFF' },             // Flamengo: kırmızı-siyah yatay
    { k: 'vstripe', a: '#111111', b: '#F5F5F2', n: 9, name: '#F5F5F2', box: '#111111' },   // Botafogo: siyah-beyaz dikey
    { k: 'tri', a: '#7A1F35', b: '#0B6B3A', c: '#F5F5F2', name: '#F5F5F2', box: '#7A1F35' }, // Fluminense: bordo-yeşil-beyaz
    { k: 'sash', a: '#F5F5F2', b: '#111111', name: '#111111', box: '#F5F5F2' },              // Vasco: beyaz, siyah çapraz şerit
    { k: 'vstripe', a: '#D3122B', b: '#F5F5F2', n: 9, name: '#F5F5F2', box: '#D3122B' },   // Bangu: kırmızı-beyaz dikey
  ];
  const JW = 0.74, JH = 0.78;
  const jShape = (() => {
    const s = new THREE.Shape(), w = JW / 2, sl = 0.2;
    s.moveTo(-0.08, JH / 2 + 0.02); s.quadraticCurveTo(0, JH / 2 - 0.05, 0.08, JH / 2 + 0.02);
    s.lineTo(w * 0.62, JH / 2); s.lineTo(w + sl * 0.55, JH / 2 - 0.2); s.lineTo(w + sl * 0.2, JH / 2 - 0.3); s.lineTo(w * 0.86, JH / 2 - 0.22);
    s.lineTo(w * 0.88, -JH / 2); s.lineTo(-w * 0.88, -JH / 2); s.lineTo(-w * 0.86, JH / 2 - 0.22);
    s.lineTo(-w - sl * 0.2, JH / 2 - 0.3); s.lineTo(-w - sl * 0.55, JH / 2 - 0.2); s.lineTo(-w * 0.62, JH / 2); s.closePath();
    const g = new THREE.ShapeGeometry(s, 24), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      uv.setXY(i, (x + 0.5) / 1.0, (y + JH / 2 + 0.1) / 1.0);
      p.setZ(i, -0.06 * (x / 0.45) ** 2 + 0.015 * Math.sin(y * 9 + x * 3));   // gövdenin yuvarlaklığı, kumaş kırışığı
    }
    g.computeVertexNormals(); return g;
  })();
  function jerseyTex(cl) {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.fillStyle = cl.a; g.fillRect(0, 0, 512, 512);
    if (cl.k === 'hoops') for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? cl.b : cl.a; g.fillRect(0, i * 52, 512, 52); }
    if (cl.k === 'vstripe') for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? cl.b : cl.a; g.fillRect(i * 32, 0, 32, 512); }
    if (cl.k === 'tri') for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? cl.b : cl.a; g.fillRect(i * 44, 0, 38, 512); g.fillStyle = cl.c; g.fillRect(i * 44 + 38, 0, 6, 512); }
    if (cl.k === 'sash') { g.save(); g.translate(256, 256); g.rotate(-0.75); g.fillStyle = cl.b; g.fillRect(-400, -36, 800, 72); g.restore(); }
    // yaka ve kol ağzı, yıkanmış kumaşın lekeleri
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, 512, 10);
    const r = mulberry32(cl.a.length * 31 + cl.k.length); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.04})`; g.fillRect(r() * 512, r() * 512, 1 + r() * 30, 1 + r() * 2); }
    // sırt yazısı
    g.textAlign = 'center'; g.font = '800 70px Archivo';
    g.font = '800 60px Archivo';
    if (cl.box) { g.fillStyle = cl.box; g.fillRect(140, 132, 232, 72); }
    g.fillStyle = cl.name; g.fillText('KAISER', 256, 190);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const JX = [0, 1, 2, 3, 4].map(k => RAIL.x0 + 1.0 + k * 1.8);
  const jerseys = [];
  {
    const metal = std('#C9CDD3', { metalness: 0.9, roughness: 0.25 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, RAIL.x1 - RAIL.x0, 10).rotateZ(Math.PI / 2), metal);
    pole.position.set((RAIL.x0 + RAIL.x1) / 2, RAIL.y, RAIL.z); scene.add(pole);
    for (const x of [RAIL.x0, RAIL.x1]) { const u = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, RAIL.y, 10), metal); u.position.set(x, RAIL.y / 2, RAIL.z); scene.add(u); box(0.6, 0.03, 0.4, metal, x, 0.015, RAIL.z); }
    CLUBS.forEach((cl, k) => {
      const g = new THREE.Group();                                   // dönme noktası askının üstünde
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.005, 6, 16, Math.PI * 1.4), metal); hook.position.set(0, -0.005, 0); hook.rotation.z = -0.2; g.add(hook);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8).rotateZ(Math.PI / 2), std('#5A3B22', { roughness: 0.6 })); bar.position.y = -0.1; g.add(bar);
      const j = new THREE.Mesh(jShape, new THREE.MeshStandardMaterial({ map: jerseyTex(cl), roughness: 0.78, side: THREE.DoubleSide }));
      j.position.set(0, -0.1 - JH / 2, 0.01); j.castShadow = true; g.add(j);
      g.position.set(JX[k], RAIL.y, RAIL.z); scene.add(g); jerseys.push(g);
    });
  }
  const jerseyLights = JX.map(x => { const L = new THREE.SpotLight(lin('#FFF1DC'), 0, 0, 0.32, 0.7, 2); L.position.set(x, 4.6, RAIL.z + 3.2); L.target.position.set(x, 1.6, RAIL.z); scene.add(L, L.target); return L; });

  // ——— Kırmızı kart: kulübenin önünde dönerek düşer ———
  const card = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.11, 0.0015), new THREE.MeshStandardMaterial({ color: lin('#D3141C'), roughness: 0.35, emissive: lin('#3A0204') }));
  card.castShadow = true; scene.add(card);
  const CARD = { x: -10.25, z: -35.5, y0: 2.0, v: 0.9 };

  // ——— Işıkta süzülen toz (sürekli döngü 2) ———
  const motes = (() => {
    const zones = [[KB[0], 0.9, KB[2], 2.4, 0.7, 2.4, 70], [HEAP[0], 1.2, HEAP[2], 3.5, 1.5, 3.5, 160], [-5, 1.6, -35.5, 6, 1.2, 2.5, 140]];
    const n = zones.reduce((a, z) => a + z[6], 0), r = mulberry32(23), d = [];
    for (const [x, y, z, sx, sy, sz, cnt] of zones) for (let i = 0; i < cnt; i++) d.push([x + (r() - 0.5) * 2 * sx, y + (r() - 0.5) * 2 * sy, z + (r() - 0.5) * 2 * sz, (r() - 0.5) * 0.08, 0.01 + r() * 0.03, (r() - 0.5) * 0.08, r() * 6.28, 0.002 + r() * 0.003]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(3.2, 3.0, 2.6), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }), n);
    im.frustumCulled = false; scene.add(im);
    return { im, d };
  })();
  function placeMotes(t) {
    const m = new THREE.Matrix4();
    motes.d.forEach((p, i) => {
      const w = 2 * Math.PI * t / D;                                // süre boyunca kapanan yörünge (döngü dikişi)
      const x = p[0] + p[3] * 6 * Math.sin(w + p[6]), y = p[1] + p[4] * 8 * Math.sin(2 * w + p[6] * 2), z = p[2] + p[5] * 6 * Math.cos(w + p[6]);
      m.makeScale(p[7], p[7], p[7]); m.setPosition(x, y, z); motes.im.setMatrixAt(i, m);
    });
    motes.im.instanceMatrix.needsUpdate = true;
  }

  // ——— Poz ———
  const K = camKeys(T);
  const camAt = cameraTrack(K, track3, monotone, 0.04);
  function pose(t, lens, jit) {
    S.setCam(camAt(t), lens, jit);
    // formalar: soldan kayarak askıdaki yerine gelir, küçük sönümlü salınım
    jerseys.forEach((g, k) => {
      const ta = T.jersey[k], u = ease.enter(seg(t, ta, 0.42));
      g.visible = t > ta - 0.01;
      g.position.x = JX[k] - 1.6 * (1 - u);
      const s = t - ta - 0.42;
      g.rotation.z = s > 0 ? 0.1 * Math.exp(-4.2 * s) * Math.sin(8 * s) : 0.06 * (1 - u);
      g.rotation.x = s > 0 ? 0.05 * Math.exp(-3.5 * s) * Math.sin(6.5 * s + 1) : 0;
      jerseyLights[k].intensity = 40 * ease.enter(seg(t, ta + 0.05, 0.3));
    });
    dugLight.intensity = 14 * seg(t, T.sakat - 0.05, 0.12) * (t < T.sakat + 0.25 ? (0.6 + 0.4 * Math.sin((t - T.sakat) * 90)) : 1);
    // kart: kırmızı kelimesinde düşmeye başlar; savrularak döner
    const cu = t - (T.kirmizi - 0.55);
    if (cu > 0 && cu < 4) {
      const y = Math.max(0.01, CARD.y0 - CARD.v * cu);
      card.visible = true;
      card.position.set(CARD.x + 0.12 * Math.sin(cu * 3.1), y, CARD.z + 0.08 * Math.cos(cu * 2.3));
      card.rotation.set(y > 0.02 ? 0.9 * Math.sin(cu * 4.2) : -Math.PI / 2, cu * 2.4, y > 0.02 ? 0.5 * Math.sin(cu * 3.3) : 0);
    } else card.visible = false;
    spotH.intensity = 15000 * (0.25 + 0.75 * seg(t, T.l05 - 0.2, 0.4));
    // hüzmeler yalnız kamera dışarıdayken (içinden bakınca gri duvar olur)
    const cp = S.cam.pos;
    shK.visible = Math.hypot(cp[0] - KB[0], cp[2] - KB[2]) > 6 && cp[1] > 3;
    shH.visible = Math.hypot(cp[0] - HEAP[0], cp[2] - HEAP[2]) > 7 && cp[1] > 3;
    for (const tx of boardMats) tx.offset.x = (2 * t / D) % 1;      // LED panolar kayar: film boyunca tam 2 tur (döngü dikişi)
    placeBalls(t);
    placeMotes(t);
  }

  // ——— 2B kaplama ———
  const O = makeOverlay(ctx, tl, {
    capBase: 1380,
    chunks: {
      l01: [['Hiç maça çıkmayan futbolcu mu,', 0], ['59 yaşında hâlâ oynayan mı?', 5]],
      l02: [['Carlos Kaiser, 13 yıl boyunca', 0], ["Brezilya'nın dev kulüplerine imza attı.", 6]],
      l03: [['Ama tek bir resmî maça bile çıkmadı.', 0]],
      l04: [['Her seferinde sakatlık numarası yaptı.', 0], ['Bir keresinde de oyuna girmeden', 6, -0.35], ['kırmızı kart gördü.', 10]],   // whisper 'Bir'i erken duyuyor
      l05: [['Japon Kazu Miura ise', 0], ["15 yaşında tek başına Brezilya'ya gitti.", 4]],
      l06: [['Bugün 59 yaşında ve hâlâ profesyonel futbolcu.', 0]],
      l07: [['Peki ikisinin resmî maç sayısı ne?', 0]],
      l08: [["Kaiser'inki sıfır.", 0]],
      l09: [["Kazu'nunki 911.", 0]],
      l10: [['Sen hangisine şaşırdın?', 0], ['Yoruma yaz.', 3]],
    },
  });
  function render(t) {
    drawBoard(t);
    S.render(t, pose, tt => (tt > T.l03 - 0.15 && tt < T.l03 + 0.4) || (tt > T.l05 - 0.4 && tt < T.l05 + 0.25) || (tt > T.l07 - 0.3 && tt < T.l07 + 0.3) || (tt > T.l08 - 0.3 && tt < T.l08 + 0.2) ? 0.35 : tt > T.loop0 - 0.5 && tt < T.loop0 + 0.05 ? 1.0 : 0.5);
    ctx.clearRect(0, 0, W, H);
    O.title(t, ['Hangisi daha', 'şaşırtıcı?'], T.l01end + 0.15, 470, D - 0.45);   // döngü: son 0,45 sn'de geri gelir
    O.nameCard(t, T.l02 - 0.05, T.l03 - 0.15, 'CARLOS KAISER', 'Brezilya · 1979–1992');
    O.nameCard(t, T.l05 - 0.05, T.l06 - 0.15, 'KAZU MIURA', 'Japonya · 1967 doğumlu');
    O.bigNumber(t, T.sifir - 0.05, T.l09 - 0.3, '0', 'KAISER · RESMÎ MAÇ');      // çıkış 0,25 sn: KAZU girmeden biter
    O.bigNumber(t, T.l09 - 0.02, T.l10end + 0.1, tt => landedCount(T, tt), 'KAZU · RESMÎ MAÇ');   // "Kazu'nunki" ile birlikte
    O.caption(t);
    O.follow(t, T.l10end + 0.4, D - 0.45, 1300);
  }

  // ısınma: her kamera pozu bir kez (1 örnek); doku yükleme ve gölgelendirici derleme ilk kareyi değiştirmez
  { const keep = window.__samples; window.__samples = 1; for (const k of K) { drawBoard(k[0]); S.render(k[0], pose); } for (let t = 0; t < D; t += 1.5) { drawBoard(t); S.render(t, pose); } window.__samples = keep; sbKey = ''; }

  return { duration: D, timeline: { T }, render };
}

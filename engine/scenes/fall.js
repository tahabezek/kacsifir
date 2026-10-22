// Sahne: "Hangisi önce yere düşer?" (№ 027, "Masa" formatı). Kâğıt blok, iki lake top, Sıfır mandalı tetikler.
// Üç tur: saniyede 2, 30, 900 metre. Stroboskop hayaletleri ve eşit yükseklik çizgileri ispatı taşır.
// Üçüncü turda ana kamera B'yi izler; soldaki detay balonu A'yı aynı ölçek ve aynı yükseklikte gösterir: iki top
// 498 m arayla bile ekranda her an aynı yüksekliktedir. Balon için örnek döngüsü burada (iki görünüm) yazılmıştır.
import { W, H, ease, seg, lerp, clamp01, mulberry32, FPS } from '../core.js';
import { C, F, setFont } from '../tower.js';
import { POSES, mixPose } from '../sifir.js';
import { makeMasa, col, hex, track } from '../masa.js';
import { G, H0, R, T, X0, XB, ZA, ZB, Y0, GHOST_DT, GHOSTS, buildFallTimeline, roundBalls, loopBalls, clockAt, ballAt, tauOf, mergeU } from './fall_core.js';

const UNITS = 8;                                   // kamera uzaklığı her zaman 8 birim; ölçek S = uzaklık / 8 (ızgara uyumlu)
const LOUPE = { x0: 96, x1: 396, y0: 860, y1: 1430 };   // detay balonu (dikey kapsül, ekran px)

export function makeFallRenderer(ep, overlay) {
  const tl = buildFallTimeline(ep);
  const D = tl.duration, [r1, r2, r3] = tl.rounds;
  const M = makeMasa(ep, overlay, { focusY: 1240 });
  const { THREE, scene, camera, gl, ctx } = M;

  // ——— Kâğıt blok (1,5 m), raflar, hazneler, mandal ———
  const BLOCK = { x0: -0.75, x1: 0.05, z0: -0.4, z1: 0.4 };
  const paperW = M.paper('#E6DCC6'), paperD = M.paper('#D6C8AC');
  // Deney düzeneği: masanın (blok) üstünde yatan 3 cm'lik raf, kıskaçla tutturulmuş. Rafın üstü = top altı = 1,5 m.
  // B'nin rayı rafın masa kenarından taşan devamıdır (sabit); A, rafın ucundaki menteşeli kapağın üstündedir ve
  // kapak tetikte aşağı açılır. Böylece iki top da aynı yükseklikten, aynı anda serbest kalır.
  const BT = 0.03, LANE = 0.18, RAIL0 = -0.30;
  const blockGeo = new THREE.BoxGeometry(BLOCK.x1 - BLOCK.x0, H0 - BT, BLOCK.z1 - BLOCK.z0).translate((BLOCK.x0 + BLOCK.x1) / 2, (H0 - BT) / 2, 0);
  const block = M.withEdges(blockGeo, paperW, 20); scene.add(block);
  const boardGeo = (x0, x1) => new THREE.BoxGeometry(x1 - x0, BT, LANE).translate((x0 + x1) / 2, -BT / 2, 0);
  const boardA = M.withEdges(boardGeo(RAIL0, BLOCK.x1), paperD, 20); scene.add(boardA);   // A şeridi: masa üstünde
  const boardB = M.withEdges(boardGeo(RAIL0, XB + 0.02), paperD, 20); scene.add(boardB);  // B şeridi: kenardan taşan ray
  const clampGeo = new THREE.BoxGeometry(0.07, 0.05, ZB - ZA + LANE + 0.04).translate(0, 0.025, 0);
  const clamp = M.withEdges(clampGeo, M.paper('#8B8577'), 20); scene.add(clamp);            // kıskaç: rafı masaya bastırır
  const tabGeo = new THREE.BoxGeometry(0.2, BT, LANE).translate(0.1, -BT / 2, 0);          // A'nın menteşeli kapağı
  const tabs = [ZA].map(z => { const g = new THREE.Group(); g.add(M.withEdges(tabGeo, paperD, 20)); g.userData.z = z; scene.add(g); return g; });
  // menzil cetveli: yerde 520 m'lik kâğıt şerit (her 0,1 / 1 / 5 m'de çentik) — 3. turda hızı gösterir
  const rulerTex = (() => {
    const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 64;
    const g = cv.getContext('2d'); g.fillStyle = '#E4DAC4'; g.fillRect(0, 0, 2048, 64); g.fillStyle = C.ink;
    for (let i = 0; i < 100; i++) { const x = (i / 100) * 2048, big = i % 50 === 0, mid = i % 10 === 0; g.fillRect(x, 0, big ? 9 : mid ? 6 : 3, big ? 60 : mid ? 42 : 20); }
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 16; tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(52, 1);
    return tx;
  })();
  const RULER = { x0: X0 + 0.25, len: 520, z: ZB - 0.7, w: 0.5 };
  const ruler = new THREE.Mesh(new THREE.PlaneGeometry(RULER.len, RULER.w).translate(RULER.len / 2, RULER.w / 2, 0), new THREE.MeshStandardMaterial({ map: rulerTex, roughness: 0.95, side: THREE.DoubleSide, fog: false }));
  ruler.receiveShadow = true; scene.add(ruler);
  // 50 m'de bir numaralı kart (kâğıt, dik)
  const cardGeo = new THREE.PlaneGeometry(0.9, 0.46).translate(0, 1.45, 0);
  const cards = [];
  for (let d = 50; d <= 500; d += 50) {
    const cv = document.createElement('canvas'); cv.width = 310; cv.height = 160;
    const g = cv.getContext('2d'); g.fillStyle = '#F4EFE3'; g.fillRect(0, 0, 310, 160); g.strokeStyle = C.ink; g.lineWidth = 6; g.strokeRect(3, 3, 304, 154);
    g.fillStyle = C.ink; setFont(g, F.mono(84)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d + ' m', 155, 84);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const m = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9, side: THREE.DoubleSide, fog: false }));
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.25, 0.05).translate(0, 0.62, 0), M.paper('#8B8577'));
    const g2 = new THREE.Group(); g2.add(m, pole); g2.userData.d = d; scene.add(g2); cards.push(g2);
  }
  // jalon (ölçme direği): A'nın düştüğü yerde ve B'nin indiği yerde; mürekkep/kâğıt bantlı, B'ninki kırmızı bantlı
  const poleTex = c2 => { const cv = document.createElement('canvas'); cv.width = 16; cv.height = 256; const g = cv.getContext('2d');
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#F2EBDB' : c2; g.fillRect(0, i * 32, 16, 32); }
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx; };
  const poleGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.8, 16).translate(0, 0.9, 0);
  const poleA = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ map: poleTex(C.ink), roughness: 0.6, fog: false }));
  const poleB = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ map: poleTex(C.red), roughness: 0.6, fog: false }));
  for (const pm of [poleA, poleB]) { pm.castShadow = true; scene.add(pm); }
  // mandal: B'nin arkasında, blok üstünde menteşeli kâğıt kol; tetikte ileri savrulur
  const kickGeo = new THREE.BoxGeometry(0.03, 0.2, 0.12).translate(0, 0.1, 0);
  const kicker = new THREE.Group(); kicker.add(M.withEdges(kickGeo, paperD, 20)); scene.add(kicker);

  // ——— Toplar: lake, üzerinde harf (A / B); 3. turda B kırmızı ———
  function letterTex(letter, base) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
    const g = cv.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#F2EBDB'; setFont(g, F.head(110)); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const x of [128, 384]) g.fillText(letter, x, 132);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    return tx;
  }
  const ballGeo = new THREE.SphereGeometry(1, 48, 32);
  const matA = M.lacquer(new THREE.Color(C.ink)), matB = M.lacquer(new THREE.Color(C.ink)), matBR = M.lacquer(new THREE.Color(C.red));
  const mkBall = mat => { const m = new THREE.Mesh(ballGeo, mat); m.castShadow = true; m.receiveShadow = true; m.rotation.y = -Math.PI / 2; scene.add(m); return m; };
  const balls = tl.rounds.map(r => ({ A: mkBall(matA), B: mkBall(matB) }));
  const loopB = { A: mkBall(matA), B: mkBall(matB) };
  // stroboskop hayaletleri: yarı saydam kâğıt dolgu + mürekkep kontur (ters kabuk)
  const gFill = new THREE.MeshBasicMaterial({ color: col(hex('#EEE7D8')), fog: false });
  const gLine = new THREE.MeshBasicMaterial({ color: col(hex(C.ink)), side: THREE.BackSide, fog: false });
  const mkGhost = () => { const g = new THREE.Group(); const o = new THREE.Mesh(ballGeo, gLine); o.scale.setScalar(1.07); g.add(new THREE.Mesh(ballGeo, gFill), o); scene.add(g); return g; };
  const ghosts = tl.rounds.map(() => Array.from({ length: GHOSTS }, () => ({ A: mkGhost(), B: mkGhost() })));

  // ——— Sıfır: blok üstünde, mandalın yanında ———
  const HS = 0.13, SIF = { x: -0.12, z: 0.32 };   // masanın üstünde, rafın önünde, mandalın yanında
  const sif = M.makeStandee();
  const POSE_W = { lean: -6, tilt: -4, la: -24, ra: 40, ll: -6, rl: 6, sq: 0 };
  const POSE_P = { lean: 12, tilt: 6, la: -10, ra: 95, ll: -2, rl: 12, sq: -0.02 };
  const LOOK = { eye: 1, mouth: 'o', m: 0.6, look: [0.9, 0.3] };
  function sifirState(t) {
    // tetik: her turun fırlatılışından 0,3 sn önce kol kalkar, fırlatışta iner
    const tt = t < 0 ? t + D : t;
    const near = tl.rounds.find(r => tt >= r.launch - 0.6 && tt < r.launch + 0.5);
    if (near) {
      const a = ease.enter(seg(tt, near.launch - 0.35, 0.3)), b = ease.state(seg(tt, near.launch - 0.06, 0.12));
      return { pose: mixPose(mixPose(POSE_W, POSES.isaret, a), POSE_P, b), expr: LOOK };
    }
    if (tt >= r3.land + 0.1 && tt < tl.dive[0]) return { pose: mixPose(POSE_W, POSES.sasirma, ease.state(seg(tt, r3.land + 0.1, 0.35))), expr: tt > r3.land + 2.5 ? 'mutlu' : 'saskin' };
    if (tt >= r1.land + 0.1 && tt < r2.launch - 0.6) return { pose: POSE_W, expr: 'dusunceli' };
    if (tt >= r2.land + 0.1 && tt < r3.launch - 0.6) return { pose: mixPose(POSE_W, POSES.sasirma, ease.state(seg(tt, r2.land + 0.1, 0.35)) * (1 - ease.state(seg(tt, r2.land + 2.2, 0.4)))), expr: 'saskin' };
    return { pose: POSE_W, expr: LOOK };
  }

  // ——— Kamera: dist (m) ve hedef F; S = dist / 8 ———
  const K0 = { F: [-0.02, 1.5, 0], dist: 7.5, az: 0.0, el: 0.17, ly: 0, fy: 1230, fov: 16 };   // biraz yukarıdan: masa yüzeyi ve rafın masadan çıkışı görünür
  const K1 = { F: [0.78, 0.78, 0], dist: 13.4, az: 0.0, el: 0.02, ly: 0, fy: 1345, fov: 16 };   // tam yandan, dar açı
  const K2a = { F: [3.2, 0.95, 0], dist: 7.5, az: -1.34, el: 0.06, ly: 0, fy: 1180, fov: 30 };   // 2. tur kalkışı: blok yakın
  const K2 = { F: [12.1, 0.6, 0], dist: 16, az: -1.34, el: 0.06, ly: 0, fy: 1180, fov: 30 };   // sayısal çözüm: blok x≈150, iniş x≈890, top ≥48 px   // inişin ötesinden: B kameraya doğru gelir
  const R3D = 10.8;                                 // 3. tur: yan görünüş, ana ve balon aynı ölçekte
  const K3 = { F: [X0 - 0.4, 0.8, ZB], dist: R3D, az: 0.0, el: 0.06, ly: 0, fy: 1150, fov: 30 };
  const KW = { F: [XB + 499.5, 0.6, -0.5], dist: 13, az: -1.38, el: 0.06, ly: 0, fy: 1270, fov: 30 };
  const KTOP = { F: [X0 + 249, 0.5, 0], dist: 2300, az: -0.12, el: 0.5, ly: 0, fy: 1230, fov: 30 };   // dalışın tepesi: harita görünümü
  const mixK = (a, b, u, wf) => ({
    F: [0, 1, 2].map(i => lerp(a.F[i], b.F[i], wf ?? u)), dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), u)),
    az: lerp(a.az, b.az, u), el: lerp(a.el, b.el, u), ly: lerp(a.ly, b.ly, u), fy: lerp(a.fy, b.fy, u), fov: lerp(a.fov ?? 30, b.fov ?? 30, u),
  });
  // log uzaklıkta yaklaşma: hedef nokta ekranda neredeyse sabit kalsın diye odak, ölçek oranında kayar
  const zoomMix = (a, b, u) => { const m = mixK(a, b, u); const wf = clamp01((a.dist - m.dist) / (a.dist - b.dist)); return mixK(a, b, u, Math.abs(a.dist - b.dist) < 1e-6 ? u : wf); };
  const push = (k, f) => ({ ...k, dist: k.dist * f });
  const bx3 = t => ballAt(tauOf(r3, t), r3.v, ZB).x;
  function track3(t) { return { ...K3, F: [Math.max(K3.F[0], bx3(t) - 0.54), K3.F[1], ZB] }; }
  function camK(t) {
    if (t < 0.4) return push(K0, 1 + 0.08 * (0.4 - t) / 1.4);   // kare 0: görünür itme (döngü sonuyla aynı hız)
    if (t < 2.4) return zoomMix(push(K0, 1), K1, ease.state(seg(t, 0.4, 2.0)));
    if (t < 7.4) { const u = seg(t, 2.4, 5.0); return { ...push(K1, lerp(1, 0.9, u)), F: [lerp(K1.F[0], K1.F[0] + 0.1, u), K1.F[1], 0] }; }   // yan görünüş korunur: yalnız itme + kayma
    if (t < 9.6) {                                 // dönüş: blok kadrajda kalsın diye hedef ancak dönüşün sonunda kayar
      const u = seg(t, 7.4, 2.2), a = { ...push(K1, 0.9), F: [K1.F[0] + 0.1, K1.F[1], 0] }, m = mixK(a, K2a, ease.state(u));
      return { ...m, F: [0, 1, 2].map(i => lerp(a.F[i], K2a.F[i], ease.state(clamp01((u - 0.45) / 0.55)))) };
    }
    // 2. tur: kalkışta blok yakın; B kameraya doğru gelirken kamera iniş çerçevesine geri çekilir
    if (t < r2.launch + 2.6) return zoomMix(K2a, K2, ease.state(seg(t, r2.launch, 2.6)));
    const H2 = r3.launch - 1.6;
    const hold2 = t => { const u = seg(t, r2.launch + 2.6, H2 - r2.launch - 2.6); return { ...push(K2, lerp(1, 1 / 1.1, u)), F: [lerp(K2.F[0], K2.F[0] + 1.0, u), K2.F[1], K2.F[2]], az: lerp(K2.az, -1.37, u) }; };
    if (t < H2) return hold2(t);
    if (t < r3.launch - 0.1) {                     // geçiş: hedef önce bloğa kayar, dönüş sonra (kadraj boş kalmaz)
      const u = seg(t, H2, 1.5), a = hold2(H2), m = mixK(a, K3, ease.state(clamp01((u - 0.3) / 0.7)));
      return { ...m, F: [0, 1, 2].map(i => lerp(a.F[i], K3.F[i], ease.state(clamp01(u / 0.6)))) };
    }
    if (t < r3.land + 0.5) return track3(t);
    const T0 = r3.land + 0.5, T1 = T0 + 3.0;
    if (t < T1) return zoomMix(track3(T0), KW, ease.state(seg(t, T0, T1 - T0)));
    const [d0, d1] = tl.dive;
    const wide = t => ({ ...KW, az: lerp(KW.az, -1.05, seg(t, T1, d0 - T1)), dist: KW.dist * lerp(1, 0.72, seg(t, T1, d0 - T1)) });
    if (t < d0) return wide(t);
    const end = push(K0, 1 + 0.08 * (0.4 - (t - D)) / 1.4);
    const dA = d0 + 1.0, dB = dA + 0.9;
    const top = t => push(KTOP, lerp(1, 0.88, seg(t, dA, dB - dA)));
    if (t < dA) return zoomMix(wide(d0), KTOP, seg(t, d0, dA - d0));
    if (t < dB) return top(t);
    if (t < d1) { const v = seg(t, dB, d1 - dB); return zoomMix(top(dB), end, 1 - (1 - v) * (1 - v) * (1 - v)); }
    return end;
  }
  const toState = k => ({ F: k.F, S: k.dist / UNITS, M: UNITS, az: k.az, el: k.el, ly: k.ly / (k.dist / UNITS), focusY: k.fy, aperture: k.dist > 50 ? 0.002 : 0.009, fogNear: 2.5, fogFar: 6 });
  const loupeOn = t => t > r3.launch + 0.25 && t < r3.land + 0.95;
  const loupeK = t => ({ ...K3, F: [X0 + (540 - (LOUPE.x0 + LOUPE.x1) / 2) / pxPerM(), K3.F[1], ZA] });
  const pxPerM = () => (H / 2) / Math.tan((15 * Math.PI) / 180) / R3D;

  // hayalet konumu: 1. turda B'nin izi bekleyişte A'nın sütununa kayar (her hayalet eşinin tam üstüne oturur)
  function ghostPos(r, tg, key, t) {
    const a = ballAt(tg, 0, ZA);
    if (key === 'A') return a;
    const b = ballAt(tg, r.v, ZB);
    if (r.i !== 0) return b;
    const u = mergeU(tl, t);
    return { x: lerp(b.x, a.x, u), y: b.y, z: lerp(b.z, a.z, u) };
  }

  // ——— Sahneyi t anına göre kur ———
  function pose(t, lens, jit, view = 'main') {
    const k = view === 'loupe' ? loupeK(t) : camK(t);
    camera.fov = k.fov ?? 30;
    M.setCam(toState(k), lens, jit);
    // blok, raflar, haznelar, mandal
    M.place(block, 0, 0, 0, 1);
    M.place(boardA, 0, H0, ZA, 1); M.place(boardB, 0, H0, ZB, 1); M.place(clamp, -0.2, H0, (ZA + ZB) / 2, 1);
    const curR = tl.rounds.reduce((a, r) => (t >= r.launch - 1.1 ? r : a), r1);
    const tauR = tauOf(curR, t) ?? -1;
    const tabDrop = tauR < 0 ? 0 : ease.enter(clamp01(tauR / 0.04));          // raf toptan hızlı katlanır
    const refill = tl.reload.some(a => t >= a && t < a + 0.6) || t >= tl.dive[0] + 0.3;   // dalıştan sonra döngüye hazır
    for (const g of tabs) { M.place(g, BLOCK.x1, H0, g.userData.z, 1); g.rotation.set(0, 0, refill ? 0 : -tabDrop * 1.45); }
    M.place(ruler, RULER.x0, 0, RULER.z, 1);
    const flying = t >= r3.launch && t < r3.land + 0.6;
    for (const g2 of cards) { const late = g2.userData.d === 500 ? ease.enter(seg(t, r3.land + 1.0, 0.6)) : flying ? 0 : 1; if (late < 0.001) { g2.visible = false; continue; } M.place(g2, X0 + g2.userData.d, 0, RULER.z - 0.12, 1, late, 1); }
    const pu = ease.enter(seg(t, r3.land + 1.0, 0.6)) * (1 - ease.exit(seg(t, tl.dive[0] + 0.5, 0.4)));
    if (pu > 0.001) { M.place(poleA, BLOCK.x0 - 0.3, 0, ZB - 0.7, 1, 1 * pu, 1); M.place(poleB, XB + r3.v * T, 0, ZB - 0.45, 1, 1 * pu, 1); } else { poleA.visible = poleB.visible = false; }
    const kick = tauR < 0 ? ease.enter(seg(t, curR.launch - 0.35, 0.3)) * 0.6 : 0.6 - 1.5 * ease.enter(clamp01(tauR / 0.03));
    M.place(kicker, XB - 0.2, H0, ZB, 1); kicker.rotation.set(0, 0, refill ? 0 : kick);
    // toplar ve hayaletler
    for (const r of tl.rounds) {
      const b = roundBalls(tl, r.i, t), m = balls[r.i];
      for (const key of ['A', 'B']) {
        const p = b[key];
        if (!b.alive || b.scale < 0.001) { m[key].visible = false; continue; }
        M.place(m[key], p.x, p.y, p.z, R * b.scale);
        if (r.i === 2 && key === 'B') m.B.material = t >= r3.land ? matBR : matB;
        m[key].rotation.z = key === 'B' && b.tau !== null ? -(p.x - X0) / R : 0;   // B yuvarlanır gibi döner
      }
      ghosts[r.i].forEach((gp, gi) => {
        const tg = (gi + 1) * GHOST_DT, on = b.tau !== null && b.tau >= tg + 0.06 && b.alive;
        for (const key of ['A', 'B']) {
          if (!on || r.i >= 1) { gp[key].visible = false; continue; }
          const p = ghostPos(r, tg, key, t);
          M.place(gp[key], p.x, p.y, p.z, R * b.scale * ease.enter(clamp01((b.tau - tg - 0.06) / 0.02)));
        }
      });
    }
    const lb = loopBalls(tl, t);
    for (const key of ['A', 'B']) { if (!lb.alive) { loopB[key].visible = false; continue; } M.place(loopB[key], lb[key].x, lb[key].y, lb[key].z, R * lb.scale); loopB[key].rotation.z = 0; }
    // Sıfır
    const st = sifirState(t);
    M.paintStandee(sif, st.pose, st.expr, 1);
    M.place(sif.g, SIF.x, H0 - BT, SIF.z, HS);
  }

  // ——— Örnek döngüsü: ana görünüm + (3. turda) detay balonu ———
  const rtS = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType });
  const rtB = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType });
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const accMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: null }, w: { value: 1 } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb * w, 1.0); }',
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation, depthTest: false, depthWrite: false,
  });
  const outMat = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rtA.texture }, texB: { value: rtB.texture }, seed: { value: 0 }, lp: { value: new THREE.Vector4() }, lr: { value: 0 } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D tex; uniform sampler2D texB; uniform float seed; uniform vec4 lp; uniform float lr; varying vec2 vUv;
      vec3 neutral(vec3 c){ float x = min(c.r, min(c.g, c.b)); float off = x < 0.08 ? x - 6.25 * x * x : 0.04; c -= off;
        float peak = max(c.r, max(c.g, c.b)); if (peak < 0.76) return c; float d = 0.24; float np = 1.0 - d * d / (peak + d - 0.76);
        c *= np / peak; float g = 1.0 - 1.0 / (0.15 * (peak - np) + 1.0); return mix(c, vec3(np), g); }
      float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423) + seed); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
      vec3 enc(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      float capsule(vec2 p, vec4 r, float rad){ vec2 c = vec2((r.x + r.z) * 0.5, clamp(p.y, r.y + rad, r.w - rad)); return length(p - c) - rad; }
      void main(){
        vec3 lin = texture2D(tex, vUv).rgb;
        if (lr > 0.5) { vec2 px = vec2(gl_FragCoord.x, ${H}.0 - gl_FragCoord.y);
          float rad = (lp.z - lp.x) * 0.5; float d = capsule(px, lp, rad) + (1.0 - lr / 1000.0) * 0.0;
          float m = clamp(0.5 - d, 0.0, 1.0); lin = mix(lin, texture2D(texB, vUv).rgb, m); }
        vec3 c = neutral(max(lin, 0.0)); c = enc(clamp(c, 0.0, 1.0));
        float l = dot(c, vec3(0.299, 0.587, 0.114)); float n = hash(gl_FragCoord.xy) - 0.5;
        c += n * 0.026 * (1.0 - abs(l - 0.5) * 1.4) + (hash(gl_FragCoord.yx + 7.0) - 0.5) / 255.0;
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), accMat); quad.frustumCulled = false; quadScene.add(quad);
  // balonun açılıp kapanması: kapsülün yüksekliği (kırpma açılışı)
  const loupeU = t => ease.enter(seg(t, r3.launch + 0.25, 0.45)) * (1 - ease.exit(seg(t, r3.land + 0.55, 0.4)));
  const loupeRect = t => { const u = loupeU(t), cy = (LOUPE.y0 + LOUPE.y1) / 2, hh = Math.max((LOUPE.x1 - LOUPE.x0) / 2 + 1, (LOUPE.y1 - LOUPE.y0) / 2 * u); return [LOUPE.x0, cy - hh, LOUPE.x1, cy + hh]; };

  function render3D(t) {
    const NS = window.__samples || ep.samples || 16;
    const r = mulberry32(Math.round(t * FPS) * 7919 + 13);
    const shut = (t > r3.land + 0.5 && t < r3.land + 3.6) || (t > tl.dive[0] && t < tl.dive[1]) ? 0.2 : 0.5;
    const L = loupeOn(t) && loupeU(t) > 0.001;
    for (const rt of L ? [rtA, rtB] : [rtA]) { gl.setRenderTarget(rt); gl.setClearColor(0x000000, 0); gl.clear(); }
    for (let i = 0; i < NS; i++) {
      const ts = t + ((i + r()) / NS - 0.5) * (shut / FPS);
      const a = 2 * Math.PI * ((i * 0.618034 + r()) % 1), rr = Math.sqrt((i + 0.5) / NS);
      const lens = NS > 1 ? [Math.cos(a) * rr, Math.sin(a) * rr] : null, jit = NS > 1 ? [r() - 0.5, r() - 0.5] : null;
      const jx = (r() - 0.5) * 30 * 0.035, jz = (r() - 0.5) * 30 * 0.035;
      for (const [view, rt] of L ? [['main', rtA], ['loupe', rtB]] : [['main', rtA]]) {
        pose(ts, lens, jit, view);
        M.key.position.x += jx; M.key.position.z += jz;
        gl.setRenderTarget(rtS); gl.setClearColor(scene.background, 1); gl.clear();
        gl.render(scene, camera);
        quad.material = accMat; accMat.uniforms.tex.value = rtS.texture; accMat.uniforms.w.value = 1 / NS;
        gl.setRenderTarget(rt); gl.render(quadScene, quadCam);
      }
    }
    quad.material = outMat; outMat.uniforms.seed.value = (Math.round(t * FPS) % 97) * 0.731;
    outMat.uniforms.lr.value = L ? 1 : 0;
    const lrc = loupeRect(t); outMat.uniforms.lp.value.set(lrc[0], lrc[1], lrc[2], lrc[3]);
    gl.setRenderTarget(null); gl.render(quadScene, quadCam);
    pose(t, null, null);
  }

  // ——— 2B kaplama ———
  const { saysY, SAFE } = M.layout;
  const nf3 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const projAt = (ta, view, x, y, z) => { pose(ta, null, null, view); return M.project(x, y, z); };
  // yatay ölçü çizgisi (yerde): uzatma çizgileri → çizgi ortadan büyür → çentikler → etiket (çapa sabit)
  function dimH(a, b, u, color, label, pin, size = 60) {
    if (u <= 0) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3;
    const ext = clamp01(u / 0.3), grow = ease.state(clamp01((u - 0.2) / 0.5)), lab = ease.enter(clamp01((u - 0.6) / 0.4));
    const off = 34;
    for (const p of [a, b]) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] + off * ext); ctx.stroke(); }
    const ya = a[1] + off * 0.8, yb = b[1] + off * 0.8, mx = (a[0] + b[0]) / 2, my = (ya + yb) / 2;
    ctx.beginPath(); ctx.moveTo(lerp(mx, a[0], grow), lerp(my, ya, grow)); ctx.lineTo(lerp(mx, b[0], grow), lerp(my, yb, grow)); ctx.stroke();
    if (grow > 0.98) for (const [x, y] of [[a[0], ya], [b[0], yb]]) { ctx.beginPath(); ctx.moveTo(x - 9, y + 9); ctx.lineTo(x + 9, y - 9); ctx.stroke(); }
    if (lab > 0 && label) {
      setFont(ctx, F.mono(size)); ctx.fillStyle = C.ink;
      const w = ctx.measureText(label).width;
      const [lx, ly] = pin;                    // sol alt köşe (taban çizgisi), placeLabel ile bir kez seçildi
      ctx.save(); ctx.beginPath(); ctx.rect(lx - 10, ly - size * 0.95, w + 20, size * 1.25); ctx.clip();
      M.halo(label, lx, ly + (1 - lab) * size, 11); ctx.restore();
    }
    ctx.restore();
  }
  // etiket yeri: çizgiye dik yönde, kutunun çizgiye en yakın köşesi 30 px uzakta; çizgiye, toplara ve top etiketlerine
  // (yasak daireler) değmeyen taraf seçilir. Çapa zamanında bir kez hesaplanır: okunurken zıplamaz.
  function placeLabel(a, b, label, size, avoid = []) {
    setFont(ctx, F.mono(size));
    const w = ctx.measureText(label).width, h = size * 0.8;
    const off = 34 * 0.8, pa = [a[0], a[1] + off], pb = [b[0], b[1] + off];
    const len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1, d = [(pb[0] - pa[0]) / len, (pb[1] - pa[1]) / len];
    let n = [-d[1], d[0]]; if (n[1] < 0) n = [-n[0], -n[1]];
    const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
    const ext = Math.abs(n[0]) * w / 2 + Math.abs(n[1]) * h / 2 + 30;
    const score = s => {
      const cx = Math.max(SAFE.x0 + w / 2, Math.min(SAFE.x1 - w / 2, mid[0] + n[0] * ext * s)), cy = mid[1] + n[1] * ext * s;
      let bad = cy - h / 2 < 300 || cy + h / 2 > 1410 ? 1000 : 0;
      for (const [x, y, r] of avoid) { const dx = Math.max(Math.abs(x - cx) - w / 2, 0), dy = Math.max(Math.abs(y - cy) - h / 2, 0); if (Math.hypot(dx, dy) < r + 24) bad += 100; }
      return { bad, x: cx - w / 2, y: cy + h / 2 };
    };
    const above = score(-1), below = score(1);
    const s = above.bad <= below.bad ? above : below;
    return [s.x, s.y];
  }
  // topun ekrandaki yasak dairesi: yarıçap + üstündeki A/B etiketi
  const ballZone = q => { const c = M.project(q.x, q.y, q.z), top = M.project(q.x, q.y + R, q.z), r = Math.abs(c[1] - top[1]); return [[c[0], c[1], r], [c[0], top[1] - 70, 46]]; };
  // iniş halkası: yerde genişleyen mürekkep çember, sonra yay olarak silinir
  function ring(view, t, tLand, x, z, color) {
    const u = seg(t, tLand, 0.7);
    if (u <= 0 || u >= 1) return;
    const rad = lerp(0.12, 0.55, ease.enter(u)), sweep = 1 - ease.exit(clamp01((u - 0.55) / 0.45));
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2 * sweep; const p = M.project(x + Math.cos(a) * rad, 0.003, z + Math.sin(a) * rad); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke(); ctx.restore();
  }

  function drawOverlay(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    M.header();
    // sayaç: turun gerçek süresi; doruk turunda inişten sonra kırmızı
    const ck = clockAt(tl, t), hero = t >= r3.land && t < tl.dive[0];
    {
      const col1 = hero ? C.red : C.ink, num = nf3.format(ck.v), { counterY } = M.layout;
      const cy = counterY + 16;
      setFont(ctx, F.head(112)); ctx.fillStyle = col1; M.halo(num, SAFE.x0, cy, 18);
      const kw = ctx.measureText(num).width;
      setFont(ctx, F.name(56)); ctx.fillStyle = col1; M.halo('saniye', SAFE.x0 + kw + 26, cy, 12);
      setFont(ctx, F.mono(44)); ctx.fillStyle = hero ? C.red : C.graphite; M.halo('SÜRE', SAFE.x0, cy - 92, 10);
    }
    for (const s of ep.says) M.clipReveal(s.text, SAFE.x0, saysY, 44, s.red ? C.red : C.ink, s.t0, s.t1, t, 56);

    // 1. ve 2. tur: eşit yükseklik çizgileri (her hayalet çifti)
    pose(t, null, null);
    for (const r of [r1, r2]) {
      const b = roundBalls(tl, r.i, t);
      if (!b.alive || b.tau === null || b.scale < 0.5 || (r.i === 1 && t >= tl.reload[1])) continue;
      ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      for (let g = 1; g <= GHOSTS; g++) {
        const tg = g * GHOST_DT; if (b.tau < tg) break;
        const pa = ghostPos(r, tg, 'A', t), pb = ghostPos(r, tg, 'B', t);
        const u = clamp01((b.tau - tg) / 0.025);
        const A = M.project(pa.x, pa.y, pa.z), B = M.project(pb.x, pb.y, pb.z);
        ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(lerp(A[0], B[0], u), lerp(A[1], B[1], u)); ctx.stroke();
      }
      ctx.restore();
      if (r.i === 1) {
        ctx.save(); ctx.setLineDash([]); ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
        const dot = (q, fill, rad) => { const P = M.project(q.x, q.y, q.z); ctx.beginPath(); ctx.arc(P[0], P[1], rad * b.scale, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
        for (let g = 1; g <= GHOSTS; g++) { const tg = g * GHOST_DT; if (b.tau < tg) break; dot(ballAt(tg, 0, ZA), '#E4DAC4', 13); dot(ballAt(tg, r.v, ZB), '#E4DAC4', 13); }
        dot(b.A, C.ink, 15); dot(b.B, C.ink, 15);
        ctx.restore();
      }
    }
    // mesafe ölçüleri: her inişten sonra blok kenarından B'nin indiği yere
    for (const r of [r1, r2]) {
      const u = seg(t, r.land + 0.15, 0.9) * (1 - ease.exit(seg(t, (r.i === 0 ? r2 : r3).launch - 1.3, 0.3)));
      if (u <= 0) continue;
      const xb = XB + r.v * T, pinT = r.land + 0.9, lab = r.i === 0 ? '1,11 m' : '16,6 m';
      pose(pinT, null, null);
      const pin = placeLabel(M.project(XB, 0, ZB + 0.25), M.project(xb, 0, ZB + 0.25), lab, 60, [...ballZone(ballAt(tauOf(r, pinT), r.v, ZB)), ...ballZone(ballAt(tauOf(r, pinT), 0, ZA))]);
      pose(t, null, null);
      dimH(M.project(XB, 0, ZB + 0.25), M.project(xb, 0, ZB + 0.25), u, C.ink, lab, pin);
    }
    // 498 m: geniş planda
    {
      const T0 = r3.land + 0.5, d0 = tl.dive[0], dA = d0 + 1.0, dB = dA + 0.9;
      const xb = ballAt(T + 1, r3.v, ZB).x, Bq = ballAt(T + 1, r3.v, ZB);
      // (a) yakın plan: B'nin yanında, dalış başlayınca kalkar
      const u = seg(t, T0 + 2.2, 0.9) * (1 - ease.exit(seg(t, dA - 0.35, 0.3)));   // çizgi uzaklaşma boyunca kalır
      if (u > 0) {
        pose(T0 + 3.1, null, null);
        const pin = placeLabel(M.project(XB, 0, 0), M.project(xb, 0, 0), '498 m', 60, ballZone(Bq));
        pose(t, null, null);
        dimH(M.project(XB, 0, 0), M.project(xb, 0, 0), u, C.ink, t < d0 + 0.1 ? '498 m' : '', pin);
      }
      // (b) harita tutuşu: A ile B aynı karede; "498 m" 72 px çizginin üstünde, toplar halkayla işaretli
      const um = seg(t, dA - 0.6, 0.5) * (1 - ease.exit(seg(t, tl.dive[1] - 0.95, 0.3)));
      if (um > 0) {
        const Aq = { x: X0, y: R, z: ZA };
        pose(dA + 0.05, null, null);
        const a0 = M.project(XB, 0, 0), b0 = M.project(xb, 0, 0);
        const pinM = placeLabel(a0, b0, '498 m', 72, [[a0[0], a0[1], 60], [b0[0], b0[1], 60]]);
        pose(t, null, null);
        dimH(M.project(XB, 0, 0), M.project(xb, 0, 0), um, C.ink, t < dB + 0.15 ? '498 m' : '', pinM, 72);   // kamera kalkınca etiket kalkar, çizgi ve işaretler kalır
        const mu = ease.enter(clamp01((um - 0.3) / 0.7));
        // tutuşta B'nin yolu yeniden oynar: kırmızı nokta A'dan B'ye koşar, arkasında kesikli iz (metin sabit kalır)
        const ru = clamp01((t - dA) / (dB - dA - 0.1));
        if (ru > 0 && um > 0.5) {
          const pA = M.project(XB, R, ZB), pB = M.project(xb, R, ZB), q = [lerp(pA[0], pB[0], ru), lerp(pA[1], pB[1], ru)];
          ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(pA[0], pA[1] + 46); ctx.lineTo(q[0], q[1] + 46); ctx.stroke();
          ctx.setLineDash([]); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(q[0], q[1] + 46, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        for (const [q, lab, c] of [[Aq, 'A', C.ink], [Bq, 'B', C.red]]) {
          if (mu <= 0) continue;
          const P = M.project(q.x, q.y, q.z);
          ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = c; ctx.fillStyle = C.paper;
          ctx.beginPath(); ctx.arc(P[0], P[1], 16 * mu, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = c; ctx.beginPath(); ctx.arc(P[0], P[1], 7 * mu, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          setFont(ctx, F.mono(60)); ctx.fillStyle = c; const w = ctx.measureText(lab).width;
          ctx.save(); ctx.beginPath(); ctx.rect(P[0] - w / 2 - 10, P[1] - 110, w + 20, 76); ctx.clip();
          M.halo(lab, P[0] - w / 2, P[1] - 44 + (1 - mu) * 60, 11); ctx.restore();
        }
      }
    }
    // A / B etiketleri: kanca A/B seçimine dayanır; her topun ~40 px üstünde
    {
      const tags = [];
      for (const r of tl.rounds) {
        const b = roundBalls(tl, r.i, t);
        // etiket yalnızca top yerine oturduktan sonra ve yeni tur dolarken değil
        const settled = r.i === 0 || t >= tl.reload[r.i - 1] + 0.45, leaving = r.i + 1 < tl.rounds.length && t >= tl.reload[r.i];
        if (!b.alive || b.scale < 0.95 || !settled || leaving) continue;
        if (r.i < 2 || t < r.launch) tags.push(['A', b.A], ['B', b.B, false]);
        else if (t < r.land + 0.95) tags.push(['B', b.B, t >= r.land]);
      }
      const lb = loopBalls(tl, t);
      if (lb.alive && lb.scale > 0.5 && t > tl.dive[1] - 0.35) tags.push(['A', lb.A], ['B', lb.B]);
      setFont(ctx, F.mono(66));
      const pos = tags.map(([lab, q]) => { const top = M.project(q.x, q.y + R, q.z), c = M.project(q.x, q.y, q.z); return [c[0], top[1] - 40]; });
      // çakışan etiketleri yana ayır (yan görünüşte A ve B aynı x'te)
      for (let i = 0; i + 1 < pos.length; i += 2) if (Math.abs(pos[i][0] - pos[i + 1][0]) < 70 && Math.abs(pos[i][1] - pos[i + 1][1]) < 60) {
        const m = (pos[i][0] + pos[i + 1][0]) / 2; pos[i][0] = m - 38; pos[i + 1][0] = m + 38;
      }
      tags.forEach(([lab, q, red], i) => {
        if (pos[i][0] < 40 || pos[i][0] > W - 40 || pos[i][1] < 300 || pos[i][1] > H) return;   // kadraj dışındaki topun etiketi yok
        ctx.fillStyle = red ? C.red : C.ink;
        const w = ctx.measureText(lab).width;
        M.halo(lab, Math.max(SAFE.x0, Math.min(SAFE.x1 - w, pos[i][0] - w / 2)), pos[i][1], 12);
      });
    }
    // iniş halkaları
    for (const r of tl.rounds) {
      const xa = X0, xb = XB + r.v * T;
      const bxNow = ballAt(tauOf(r, t), r.v, ZB).x;
      if (r.i < 2) { ring('main', t, r.land, xa, ZA, C.ink); ring('main', t, r.land, bxNow, ZB, C.ink); }
      else ring('main', t, r.land, bxNow, ZB, C.red);
    }
    // 3. tur: detay balonu (kapsül kontur), A'nın balondaki halkası ve A–B eşit yükseklik çizgisi
    if (loupeOn(t) && loupeU(t) > 0.001) {
      const [x0, y0, x1, y1] = loupeRect(t), rad = (x1 - x0) / 2;
      const tau = tauOf(r3, t);
      if (tau !== null) {
        const pa = ballAt(Math.min(tau, T + 1), 0, ZA), pb = ballAt(Math.min(tau, T + 1), r3.v, ZB);
        const A = projAt(t, 'loupe', pa.x, pa.y, pa.z);
        if (t >= r3.land) ring('loupe', t, r3.land, X0, ZA, C.ink);
        pose(t, null, null);
        const B = M.project(pb.x, pb.y, pb.z);
        const lu = ease.enter(seg(t, r3.launch + 0.5, 0.3)) * (1 - ease.exit(seg(t, r3.land + 0.5, 0.3)));
        if (lu > 0 && A[1] > y0 + 10 && A[1] < y1 - 10) {
          ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5; ctx.setLineDash([12, 9]); ctx.globalAlpha = 0.9;
          const xs = x1 + 6, xe = lerp(xs, B[0] - 70, lu);
          ctx.beginPath(); ctx.moveTo(xs, A[1]); ctx.lineTo(xe, A[1]); ctx.stroke(); ctx.restore();
        }
      }
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, rad); ctx.stroke(); ctx.restore();
      // balon etiketi: A, 498 m geride (mono, kapsülün üstünde sabit)
      const lab = ease.enter(seg(t, r3.launch + 0.6, 0.35)) * (1 - ease.exit(seg(t, r3.land + 0.55, 0.3)));
      if (lab > 0) { setFont(ctx, F.mono(56)); ctx.fillStyle = C.ink; ctx.save(); ctx.beginPath(); ctx.rect(x0 - 8, LOUPE.y0 - 84, 460, 72); ctx.clip(); M.halo('A topu', x0, LOUPE.y0 - 26 + (1 - lab) * 56, 10); ctx.restore(); }
    }
    pose(t, null, null);
  }

  window.__fall = { camK, pose };
  return { duration: D, timeline: tl, render(t) { render3D(t); drawOverlay(t); } };
}

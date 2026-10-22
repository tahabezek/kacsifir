// Sahne: doğum günü paradoksu (№ 026, "Masa" formatı). Masada 365 çentikli kâğıt takvim halkası; ortada Sıfır (1. kişi),
// kâğıt figürler doğum günlerinin çentiğine dikilir, her yeni kişi önceki herkese bir iplik gerer (ip sanatı). Sıfır'ın
// çiftleri ortadan ışınlar ("seninle aynı gün": %5,9), herkesin çiftleri kirişler ("herhangi iki kişi": %50,7). Doruk:
// 10. ve 23. kişi aynı gün (14 Mart) — kalın kırmızı iplik (filmde tek kırmızı). Sonra 70 kişi ve döngü.
// Belirlenirlik: iplikler opak çizilir (saydamlık renkle taklit edilir), 2B dokular yazılım rasteriyle.
import { W, H, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont } from '../tower.js';
import { POSES, mixPose, drawSifir, SIFIR_CARD } from '../sifir.js';
import { makeMasa, track, col, hex, SAFE } from '../masa.js';
import {
  N_MAIN, N_MAX, MATCH_A, MATCH_B, MATCH_DAY, MATCHES, P, PYOU, pairs, pct, fmtInt, MONTHS, MONTH_LEN, dayName, birthdays, buildBirthdayTimeline, countAt,
} from './birthday_core.js';

const R_FIG = 0.19, R_TICK0 = 0.214, R_TICK1 = 0.244, R_DISC = 0.276;   // m (dikey kadraja sığan halka)
const FIG_H = 0.055, HEAD_Y = 0.052, SIF_HEAD = 0.041;                 // Sıfır'ın iplik noktası: başının ortası
const HS = 0.026;                                                        // Sıfır'ın baş çapı (m)

export function makeBirthdayRenderer(ep, overlay) {
  const tl = buildBirthdayTimeline(ep);
  const D = tl.duration, tA = tl.tA, tE = tl.tE;
  const days = birthdays();
  const M = makeMasa(ep, overlay, { focusY: 1240 });
  const { THREE, scene } = M;
  const ang = d => -Math.PI / 2 + (2 * Math.PI * d) / 365;
  // figür konumu [x, z]; eşleşen iki figür aynı çentiğin iki yanında, aralarında boşlukla (ikisi de okunsun)
  const pos = [null, [0, 0]];
  for (let k = 2; k <= N_MAX; k++) {
    let a = ang(days[k]), r = R_FIG;
    if (k === MATCH_A) a -= 0.11; else if (k === MATCH_B) a += 0.11;
    else if (k > N_MAIN && days.slice(2, k).includes(days[k])) r += 0.02;   // sonraki eşleşmeler biraz dışarıda
    pos[k] = [r * Math.cos(a), r * Math.sin(a)];
  }
  const headY = k => (k === 1 ? SIF_HEAD : HEAD_Y * figs[k].s / FIG_H);

  // ——— Takvim halkası: kâğıt disk, 365 çentik, ay adları (yazılım rasteriyle bir kez çizilir) ———
  const TS = 2048, cv = document.createElement('canvas'); cv.width = cv.height = TS;
  { const g = cv.getContext('2d', { willReadFrequently: true }), c = TS / 2, k = TS / (2 * R_DISC);
    g.fillStyle = '#EFE8D8'; g.fillRect(0, 0, TS, TS);
    g.strokeStyle = C.ink; g.fillStyle = C.ink; g.lineCap = 'butt';
    g.lineWidth = 3; g.beginPath(); g.arc(c, c, R_TICK1 * k, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.arc(c, c, R_TICK0 * k, 0, Math.PI * 2); g.stroke();
    let d0 = 0;
    for (let m = 0; m < 12; m++) {
      for (let d = 0; d < MONTH_LEN[m]; d++) {
        const a = ang(d0 + d), first = d === 0, ten = (d + 1) % 10 === 0;
        const r0 = first ? R_TICK0 - 0.012 : ten ? R_TICK0 + 0.012 : R_TICK0 + 0.024;
        g.lineWidth = first ? 4 : ten ? 2.4 : 1.4;
        g.beginPath(); g.moveTo(c + Math.cos(a) * r0 * k, c + Math.sin(a) * r0 * k); g.lineTo(c + Math.cos(a) * R_TICK1 * k, c + Math.sin(a) * R_TICK1 * k); g.stroke();
      }
      const am = ang(d0 + MONTH_LEN[m] / 2);
      g.save(); g.translate(c + Math.cos(am) * (R_TICK1 + 0.016) * k, c + Math.sin(am) * (R_TICK1 + 0.016) * k);
      g.rotate(am + Math.PI / 2 + (Math.sin(am) > 0 ? Math.PI : 0));   // kameraya yakın yarıda harfler okunur yönde
      g.font = '600 64px "IBM Plex Mono"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(MONTHS[m], 0, 0); g.restore();
      d0 += MONTH_LEN[m];
    }
    // eşleşme çentiği: 14 Mart biraz daha kalın (kırmızı değil; kırmızı yalnızca doruk ipliği)
    const a = ang(MATCH_DAY); g.lineWidth = 5; g.beginPath(); g.moveTo(c + Math.cos(a) * (R_TICK0 - 0.006) * k, c + Math.sin(a) * (R_TICK0 - 0.006) * k); g.lineTo(c + Math.cos(a) * R_TICK1 * k, c + Math.sin(a) * R_TICK1 * k); g.stroke();
  }
  const discTex = new THREE.CanvasTexture(cv); discTex.colorSpace = THREE.SRGBColorSpace; discTex.anisotropy = 16;
  const disc = new THREE.Group();
  { const top = new THREE.Mesh(new THREE.CircleGeometry(R_DISC, 160), new THREE.MeshStandardMaterial({ map: discTex, roughness: 0.92 }));
    top.rotation.x = -Math.PI / 2; top.position.y = 0.0035; top.receiveShadow = true;
    const side = new THREE.Mesh(new THREE.CylinderGeometry(R_DISC, R_DISC, 0.0035, 160, 1, true), new THREE.MeshStandardMaterial({ color: col(hex('#D9CDB4')), roughness: 0.9 }));
    side.position.y = 0.00175; side.castShadow = true;
    disc.add(top, side); scene.add(disc); }

  // ——— Kâğıt figürler ———
  const body = new THREE.Shape([[-0.16, 0], [-0.05, 0], [0, 0.74], [0.05, 0], [0.16, 0], [0.18, 0.86], [0.26, 0.88], [0.25, 1.36], [0.1, 1.46], [-0.1, 1.46], [-0.25, 1.36], [-0.26, 0.88], [-0.18, 0.86]].map(([x, y]) => new THREE.Vector2(x, y)));
  const head = new THREE.Shape(); head.absarc(0, 1.61, 0.14, 0, Math.PI * 2, false);
  const figGeo = new THREE.ExtrudeGeometry([body, head], { depth: 0.035, bevelEnabled: false, curveSegments: 10 });
  figGeo.translate(0, 0, -0.0175); figGeo.scale(1 / 1.75, 1 / 1.75, 1 / 1.75);   // boy = 1
  const tones = ['#DDCFB2', '#CDB892', '#E6DCC6'].map(h => M.paper(h));
  const figs = [];
  const fr = mulberry32(2601);
  for (let k = 2; k <= N_MAX; k++) {
    const m = M.withEdges(figGeo, tones[k % 3], 30);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.22), tones[(k + 1) % 3]); base.position.y = 0.01; base.castShadow = true;
    const g = new THREE.Group(); g.add(m, base); g.rotation.order = 'YXZ';
    scene.add(g);
    figs[k] = { g, s: FIG_H * (0.88 + fr() * 0.24) };
  }

  // ——— İplikler: bütün çiftler tek opak LineSegments; renk köşe başına ———
  const NT = tl.threads.length;
  const tPos = new Float32Array(NT * 6), tCol = new Float32Array(NT * 6);
  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3).setUsage(THREE.DynamicDrawUsage));
  tGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3).setUsage(THREE.DynamicDrawUsage));
  // opak: saydam karıştırma three.js'te kareler arası iz bırakıyordu (belirlenirlik); saydamlık renkle taklit edilir
  const lines = new THREE.LineSegments(tGeo, new THREE.LineBasicMaterial({ vertexColors: true, fog: false })); lines.frustumCulled = false;
  const web = new THREE.Group(); web.add(lines); scene.add(web);
  const cGraph = col(hex('#6E695F')), cInk = col(hex('#1C1B18')), cLight = col(hex('#B9B2A5')), cPale = col(hex('#E7DFCE'));
  // doruk: eşleşen çiftin arasında kalın kırmızı iplik (silindir) ve iki figürü çevreleyen kırmızı halka
  const redMat = new THREE.MeshBasicMaterial({ color: col(hex(C.red)), fog: false });
  const redCord = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12).translate(0, 0.5, 0), redMat);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 72), redMat); ring.rotation.x = -Math.PI / 2;
  const ringG = new THREE.Group(); ringG.add(ring);
  scene.add(redCord, ringG);
  const others = MATCHES.filter(([i, j]) => !(i === MATCH_B && j === MATCH_A));
  const cords = others.map(() => { const m = new THREE.Mesh(redCord.geometry, new THREE.MeshBasicMaterial({ color: col(hex(C.red)), fog: false, depthTest: false })); m.renderOrder = 9; scene.add(m); return m; });

  // ——— Sıfır: halkanın ortasında; dokuya drawSifir + kâğıt doğum günü külahı (yazılım rasteri) ———
  const sd = M.makeStandee();
  sd.g.children[1].visible = false;
  sd.g.children[0].material.depthTest = false; sd.g.children[0].renderOrder = 10;   // iplikler yüzünün üstünden geçmesin
  const tmp = document.createElement('canvas'); tmp.width = sd.cv.width; tmp.height = sd.cv.height;
  const tmpP = document.createElement('canvas'); tmpP.width = sd.cv.width; tmpP.height = sd.cv.height;                       // kâğıt taban yok: ayaklar diskin üstünde, gölgesiyle
  const SPX = 380, ROOT = [384, 940];
  function paintSifir(pose, expr) {
    const key = JSON.stringify([pose, expr]);
    if (key === sd.key) return;
    sd.key = key;
    const g = tmp.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, tmp.width, tmp.height);
    g.save(); g.translate(ROOT[0], ROOT[1]);
    const r = drawSifir(g, SIFIR_CARD, pose, expr, SPX, { facing: 1, noShadow: true });
    const a = (((pose.tilt || 0) + (pose.lean || 0)) * Math.PI) / 180;
    g.translate(r.head[0], r.head[1]); g.rotate(a); g.translate(0.07 * SPX, -0.47 * SPX); g.rotate(0.18);
    const hw = 0.23 * SPX, hh = 0.42 * SPX;
    const tri = () => { g.beginPath(); g.moveTo(-hw, 0); g.lineTo(0, -hh); g.lineTo(hw, 0); g.closePath(); };
    tri(); g.fillStyle = '#CDB892'; g.fill();
    g.save(); g.clip(); g.strokeStyle = '#8B8577'; g.lineWidth = 0.035 * SPX;
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(-hw + i * 0.12 * SPX, 0); g.lineTo(-hw + i * 0.12 * SPX + hh * 0.7, -hh); g.stroke(); }
    g.restore();
    tri(); g.lineJoin = 'round'; g.lineWidth = 0.055 * SPX; g.strokeStyle = C.ink; g.stroke();
    g.beginPath(); g.arc(0, -hh, 0.055 * SPX, 0, Math.PI * 2); g.fillStyle = '#F2EBDB'; g.fill(); g.lineWidth = 0.04 * SPX; g.stroke();
    g.restore();
    // kâğıt hale: silüetin kâğıt renkli, 10 px genişletilmiş kopyası arkaya basılır
    const gp = tmpP.getContext('2d', { willReadFrequently: true });
    gp.globalCompositeOperation = 'source-over'; gp.clearRect(0, 0, tmpP.width, tmpP.height); gp.drawImage(tmp, 0, 0);
    gp.globalCompositeOperation = 'source-in'; gp.fillStyle = '#ECE5D5'; gp.fillRect(0, 0, tmpP.width, tmpP.height);
    const o = sd.cv.getContext('2d', { willReadFrequently: true });
    o.clearRect(0, 0, sd.cv.width, sd.cv.height);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; o.drawImage(tmpP, Math.cos(a) * 10, Math.sin(a) * 10); }
    o.drawImage(tmp, 0, 0);
    sd.tx.needsUpdate = true;
  }
  const EXPR_LOOK = { eye: 1, mouth: 'o', m: 0.5, look: [0.7, -0.2] };
  function sifirState(t) {
    const tau = t >= tl.reset[0] + 0.9 ? t - D : t;      // döngüde kare 0'ın duruşuna döner
    if (tau < 0.15) return { pose: POSES.ayakta, expr: EXPR_LOOK };
    if (tau < tl.vay[0]) { const u = ease.state(seg(tau, 0.15, 0.4)); return { pose: mixPose(POSES.ayakta, POSES.sayma, u), expr: 'sayiyor' }; }
    if (tau < tl.silence0) return { pose: mixPose(POSES.sayma, POSES.isaret, ease.state(seg(tau, tl.vay[0], 0.4))), expr: 'dusunceli' };
    if (tau < tl.hero) return { pose: POSES.isaret, expr: 'dusunceli' };
    if (tau < tl.hero + 2.4) return { pose: mixPose(POSES.isaret, POSES.sasirma, ease.enter(seg(tau, tl.hero, 0.25))), expr: 'saskin' };
    if (tau < tl.ext[0]) return { pose: mixPose(POSES.sasirma, POSES.ayakta, ease.state(seg(tau, tl.hero + 2.4, 0.5))), expr: 'mutlu' };
    if (tau < tl.reset[0]) return { pose: mixPose(POSES.ayakta, POSES.bakma_yukari, ease.state(seg(tau, tl.ext[0], 0.5))), expr: 'saskin' };
    return { pose: mixPose(POSES.bakma_yukari, POSES.ayakta, ease.state(seg(tau, tl.reset[0], 0.8))), expr: EXPR_LOOK };
  }

  // ——— Kamera izi ———
  const [r0, r1] = tl.reset, gl0 = tl.glow[0];
  const mp = [(pos[MATCH_A][0] + pos[MATCH_B][0]) / 2, (pos[MATCH_A][1] + pos[MATCH_B][1]) / 2];   // eşleşme noktası
  const fx = track([[-1, 0], [0.6, 0], [tl.silence0, 0.08 * mp[0]], [tl.hero + 0.6, 0.45 * mp[0]], [gl0, 0.3 * mp[0]], [tl.ext[0], 0], [r0, 0]]);
  const fz = track([[-1, 0], [0.6, 0], [tl.silence0, 0.08 * mp[1]], [tl.hero + 0.6, 0.45 * mp[1]], [gl0, 0.3 * mp[1]], [tl.ext[0], 0], [r0, 0]]);
  const mF = track([[-1, 9.2], [0.6, 9.0], [3.5, 17.5], [9, 19.5], [tl.silence0, 18.5], [tl.hero + 0.6, 12.5], [gl0, 15], [tl.ext[0], 19], [tl.ext[1], 25], [tl.ext[1] + 2.2, 22.7], [r0, 22.5]]);
  const azF = track([[-1, 0.32], [0.6, 0.32], [6, 0.5], [tl.silence0, 0.62], [tl.hero + 0.6, 0.7], [gl0, 0.82], [tl.glow[1], 1.15], [tl.ext[0], 1.35], [r0, 1.7]]);
  const elF = track([[-1, 0.3], [0.6, 0.3], [4, 0.5], [tl.silence0, 0.56], [tl.hero + 0.6, 0.48], [gl0, 0.52], [tl.ext[0], 0.7], [tl.ext[1], 1.2], [r0, 1.32]]);
  const lyF = track([[-1, 0.42], [0.6, 0.4], [4, 0.3], [tl.hero + 0.6, 0.35], [tl.ext[0], 0.2], [r0, 0.05]]);
  const S = 0.1;
  // doruk: 600 ms'de ≈1,15× yaklaşma (yay 170/26), aha başında bırakılır
  const push = t => 1 + 0.15 * spring(Math.max(0, t - tl.hero), 170, 26) * (1 - ease.state(seg(t, gl0 - 0.4, 1.2)));
  function cam0(t) { return { F: [fx(t), 0, fz(t)], S, M: mF(t) / push(t), az: azF(t), el: elF(t), ly: lyF(t), fogNear: 1.25, fogFar: 3.2, grid: 0.1, aperture: 0.0035 }; }
  function camAt(t) {
    if (t <= r0) return cam0(t);
    const a = cam0(t), b = cam0(t - D);                   // döngü: kare 0'ın kamerasına iner
    const w = ease.state(seg(t, r0, r1 - r0));
    const L = k => lerp(a[k], b[k], w);
    return { ...b, F: [lerp(a.F[0], b.F[0], w), 0, lerp(a.F[2], b.F[2], w)], M: L('M'), az: L('az'), el: L('el'), ly: L('ly') };
  }

  // iplik rengi: normal / soluk (%15 görünür) / mürekkep; durumlar t'nin saf fonksiyonu
  const matchIdx = new Map(MATCHES.filter(([i, j]) => !(i === MATCH_B && j === MATCH_A)).map(([i, j], n) => [i * 100 + j, n]));
  const cRed = col(hex(C.red));
  function threadColor(th, q, t) {
    let base = th.i > N_MAIN ? cLight : cGraph;
    // 70'e tırmanış: görünürlük ≈ 0,35·√(253/çift) (opak; renk kâğıda doğru soluklaşır)
    if (t >= tl.ext[0]) {
      const v = Math.min(1, 0.35 * Math.sqrt(253 / Math.max(253, pairs(countAt(tl, t)))));
      base = cPale.clone().lerp(cGraph, lerp(1, v, ease.state(seg(t, tl.ext[0], 0.6))));
      // örnekteki öteki eşleşmeler: tırmanış bitince sırayla kırmızı
      const mi = matchIdx.get(th.i * 100 + th.j);
      if (mi !== undefined) { const u = ease.enter(seg(t, tl.ext[1] + 0.1 + mi * 0.28, 0.25)); if (u > 0) return base.clone().lerp(cRed, u); }
    }
    const isYou = th.j === 1, isMatch = th.i === MATCH_B && th.j === MATCH_A;
    if (isMatch && t >= tl.hero && t < r0) return null;                 // kırmızı silindir çizer
    // VAY: yalnızca Sıfır'ın ışınları mürekkep, ötekiler soluk
    const vay = ease.state(seg(t, tl.vay[0], 0.5)) * (1 - ease.state(seg(t, tl.silence0, 0.2)));
    // doruk: bütün ağ bir an mürekkep, sonra diğer 252 iplik soluk (aha taramasına kadar)
    const flash = t >= tl.hero ? Math.exp(-(t - tl.hero) * 5) : 0;
    const dimHero = t >= tl.hero ? ease.state(seg(t, tl.hero + 0.25, 0.4)) * (1 - ease.state(seg(t, gl0 + 0.2, 0.5))) : 0;
    // aha: 253 iplik sırayla mürekkep; tarama sırasında ötekiler soluk
    const gu = seg(t, gl0, tl.glow[1] - gl0), gIdx = gu * pairs(N_MAIN);
    const sweepOn = gu > 0 && gu < 1 && th.i <= N_MAIN;
    const lit = sweepOn && q <= gIdx ? clamp01(1 - (gIdx - q) / 40) : 0;
    const dimSweep = sweepOn ? 0.8 : 0;
    let c = base.clone();
    const dim = Math.max(isYou ? 0 : vay, dimHero, dimSweep);
    c.lerp(cPale, (vay > 0 && !isYou ? 0.9 : 0.85) * dim);
    if (isYou) c.lerp(cInk, vay);
    c.lerp(cInk, Math.max(flash, lit));
    return c;
  }

  // ——— Dünyayı t anına göre kur ———
  const v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  function pose(t, lens, jit) {
    const cs = camAt(t);
    M.setCam(cs, lens, jit);
    M.place(disc, 0, 0, 0, 1);
    for (let k = 2; k <= N_MAX; k++) {
      const f = figs[k], [x, z] = pos[k];
      const upU = ease.enter(seg(t, tA[k] - 0.18, 0.18)) * (1 - ease.exit(seg(t, tE[k], 0.22)));
      f.g.visible = upU > 0.001;
      if (!f.g.visible) continue;
      M.place(f.g, x, 0.0035, z, f.s);
      f.g.rotation.set(-(1 - upU) * Math.PI / 2, -cs.az, 0);
    }
    M.place(web, 0, 0.0035, 0, 1);
    for (let q = 0; q < NT; q++) {
      const th = tl.threads[q];
      const u = ease.state(seg(t, th.t0, th.dur)) * (1 - ease.exit(seg(t, th.tOut, 0.18)));
      const c = u > 0 ? threadColor(th, q, t) : null;
      if (!c) { tPos.fill(0, q * 6, q * 6 + 6); tPos[q * 6 + 1] = tPos[q * 6 + 4] = -0.5; tCol.fill(0, q * 6, q * 6 + 6); continue; }
      const [xi, zi] = pos[th.i], [xj, zj] = pos[th.j], hi = headY(th.i), hj = headY(th.j);
      tPos.set([xi, hi, zi, lerp(xi, xj, u), lerp(hi, hj, u), lerp(zi, zj, u)], q * 6);
      tCol.set([c.r, c.g, c.b, c.r, c.g, c.b], q * 6);
    }
    tGeo.setDrawRange(0, NT * 2);
    tGeo.attributes.position.needsUpdate = true; tGeo.attributes.color.needsUpdate = true;
    // doruk ipliği ve halka
    const ru = ease.enter(seg(t, tl.hero, 0.35)) * (1 - ease.exit(seg(t, tE[MATCH_B], 0.12)));
    redCord.visible = ringG.visible = ru > 0.001;
    if (ru > 0.001) {
      const [ax, az] = pos[MATCH_A], [bx, bz] = pos[MATCH_B], ha = headY(MATCH_A) + 0.0035, hb = headY(MATCH_B) + 0.0035;
      const ex = lerp(ax, bx, ru), ey = lerp(ha, hb, ru), ez = lerp(az, bz, ru);
      const len = Math.hypot(ex - ax, ey - ha, ez - az);
      M.place(redCord, ax, ha, az, 0.0016, len, 0.0016);
      v.set(ex - ax, ey - ha, ez - az).normalize();
      redCord.quaternion.setFromUnitVectors(up, v);
      M.place(ringG, mp[0], 0.0042, mp[1], 0.034 * (0.7 + 0.3 * ru));
    }
    // 70'teki öteki eşleşmeler: tırmanış bitince sırayla kırmızı iplik (ağın üstünde)
    others.forEach(([i, j], n) => {
      const u = ease.enter(seg(t, tl.ext[1] + 0.1 + n * 0.28, 0.25)) * (1 - ease.exit(seg(t, tE[i], 0.18)));
      const m = cords[n]; m.visible = u > 0.001;
      if (!m.visible) return;
      const [ax, az] = pos[j], [bx, bz] = pos[i], ha = headY(j) + 0.0035, hb = headY(i) + 0.0035;
      const ex = lerp(ax, bx, u), ey = lerp(ha, hb, u), ez = lerp(az, bz, u);
      M.place(m, ax, ha, az, 0.0022, Math.max(1e-5, Math.hypot(ex - ax, ey - ha, ez - az)), 0.0022);
      v.set(ex - ax, ey - ha, ez - az).normalize(); m.quaternion.setFromUnitVectors(up, v);
    });
    // Sıfır ortada (ayakları diskin üstünde)
    const st = sifirState(t);
    paintSifir(st.pose, st.expr);
    M.place(sd.g, 0, 0.0035 + 0.05 * HS, 0, HS);
    sd.g.rotation.set(0, -cs.az, 0);
  }

  // ——— 2B kaplama ———
  const { saysY, counterY } = M.layout;
  function counter(t) {
    const ctx = M.ctx, n = countAt(tl, t);
    const showP = t >= tl.hero && t < r0 + 0.9;
    const hero = t >= tl.hero && t < tl.ext[0];
    const colr = hero ? C.red : C.ink;
    setFont(ctx, F.head(112)); ctx.fillStyle = colr; M.halo(String(n), SAFE.x0, counterY, 18);
    const kw = ctx.measureText(String(n)).width;
    const unit = showP ? `kişi · ${pct(P(n))} · ${fmtInt(pairs(n))} çift` : `kişi · ${fmtInt(pairs(n))} çift`;
    let fs = 56; setFont(ctx, F.name(fs));
    while (fs > 40 && ctx.measureText(unit).width > SAFE.x1 - SAFE.x0 - kw - 26) { fs -= 2; setFont(ctx, F.name(fs)); }
    ctx.fillStyle = colr; M.halo(unit, SAFE.x0 + kw + 22, counterY, 12);
  }
  // ekranda sabit etiket + kılavuz çizgi (okunurken kıpırdamaz)
  function label(lines, x, y, u, tx, ty) {
    if (u <= 0) return;
    const ctx = M.ctx, lab = ease.enter(clamp01(u));
    setFont(ctx, F.mono(44));
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)), lx = Math.max(SAFE.x0, Math.min(SAFE.x1 - w, x));
    const nx = Math.max(lx, Math.min(lx + w, tx)), ny = y + 14;
    ctx.save(); ctx.globalAlpha = 0.75 * lab; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(tx, ty); ctx.stroke(); ctx.restore();
    lines.forEach((ln, i) => {
      const yy = y - (lines.length - 1 - i) * 50;
      ctx.save(); ctx.beginPath(); ctx.rect(lx - 8, yy - 40, w + 16, 52); ctx.clip();
      ctx.fillStyle = C.ink; M.halo(ln, lx, yy + (1 - lab) * 44, 10); ctx.restore();
    });
  }
  function drawOverlay(t) {
    const ctx = M.ctx;
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    M.header();
    counter(t);
    for (const s of ep.says) M.clipReveal(s.text, SAFE.x0, saysY, 44, s.red ? C.red : C.ink, s.t0, s.t1, t, 56);
    // etiket çapaları: belirdikleri an için kamera kurulur, sonra t'ye dönülür
    const uY = seg(t, tl.vay[0] + 0.3, 0.6) * (1 - ease.exit(seg(t, tl.silence0, 0.25)));
    const uM = seg(t, tl.hero + 0.3, 0.6) * (1 - ease.exit(seg(t, gl0 - 0.3, 0.3)));
    if (uY > 0 || uM > 0) {
      let aY, aM;
      if (uY > 0) { pose(tl.vay[0] + 0.9, null, null); aY = M.project(0, SIF_HEAD + 0.04, 0); }
      if (uM > 0) { pose(tl.hero + 0.9, null, null); aM = { p: M.project(mp[0], HEAD_Y * 1.2, mp[1]), top: M.project(0, 0, -R_DISC)[1] }; }
      pose(t, null, null);
      if (uY > 0) { const h = M.project(0, SIF_HEAD + 0.012, 0); setFont(M.ctx, F.mono(44)); const wY = Math.max(...['Seninle aynı gün', `doğan biri: ${pct(PYOU(N_MAIN))}`].map(l => M.ctx.measureText(l).width));
        label(['Seninle aynı gün', `doğan biri: ${pct(PYOU(N_MAIN))}`], 880 - wY, 975, uY, h[0], h[1]); }
      if (uM > 0) { const h = M.project(mp[0], HEAD_Y * 1.15, mp[1]); label(['Örnek eşleşme', dayName(MATCH_DAY)], aM.p[0] + 50, Math.max(saysY + 150, aM.p[1] - 70), uM, h[0], h[1]); }
    }
  }

  window.__bday = { camAt, tl };
  return {
    duration: D, timeline: tl,
    render(t) { M.render(t, pose, tt => (tt > tl.ext[0] - 0.2 && tt < tl.ext[1] + 0.2 ? 0.25 : 0.5)); drawOverlay(t); },
  };
}

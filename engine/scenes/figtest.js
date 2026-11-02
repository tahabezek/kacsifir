// Poz kâğıdı (yalnız test): kartlardaki karakterler yan yana; t'ye göre poz ve ifade değişir.
import { makeSinema, lin } from '../sinema.js';
import { makeFigure, POSE, FACE } from '../figure.js';
import { CARDS } from '../cards/people.js';

export async function makeFigtestRenderer(ep, canvas) {
  const S = makeSinema(ep, canvas, { fog: '#2A2D33', fogDensity: 0.002, exposure: 1.0, bloom: 0.3, vignette: 0.2 });
  const { THREE, scene } = S;
  scene.add(new THREE.HemisphereLight(lin('#DDE6F2'), lin('#3A3430'), 1.2));
  const key = new THREE.DirectionalLight(lin('#FFF1E0'), 2.6); key.position.set(3, 6, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(key);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: lin('#5A5650'), roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const names = ep.cards || ['kaiser', 'kazu15', 'anna', 'ludger', 'manjhi', 'violet'];
  const figs = names.map((n, i) => { const f = makeFigure(THREE, CARDS[n]); f.root.position.set((i % 3 - 1) * 1.15, 0, Math.floor(i / 3) * -2.2); scene.add(f.root); return f; });
  const poses = [['stand', 'neutral'], ['walk', 'smile'], ['run', 'determined'], ['sit', 'sad'], ['armsUp', 'surprise'], ['crouch', 'fear'], ['hug', 'grin'], ['hammer', 'determined'], ['phone', 'smile'], ['limp', 'closed']];
  const cam = { pos: ep.camPos || [0, 2.0, 5.6], tgt: ep.camTgt || [0, 0.8, -1.1], fov: ep.fov || 48 };
  function render(t) {
    const [p, fa] = poses[Math.floor(t) % poses.length];
    figs.forEach((f, i) => { f.pose(POSE[p](0.2 + i * 0.1)); f.face(FACE[fa]); f.root.rotation.y = ep.side ? 1.3 : 0.25; });
    S.render(t, (tt, lens, jit) => S.setCam(cam, lens, jit), () => 0);
  }
  return { duration: 10, timeline: {}, render };
}

// Hızlı stil karesi kontrolü: her bölümden kilit anlar (kare 0, büyüme ortası, doruk, son öğe).
//   node tools/preview.mjs [episodes/004*.json ...]   → out/preview.png
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { openStage, glyphCheck } from './render.mjs';
import { buildTimeline } from '../engine/core.js';
import { buildSwarmTimeline } from '../engine/swarm_core.js';

const files = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync('episodes').filter(f => f.endsWith('.json')).sort().map(f => path.join('episodes', f));
const dir = path.join('out', 'preview'); fs.mkdirSync(dir, { recursive: true });
const shots = [];
for (const f of files) {
  const ep = JSON.parse(fs.readFileSync(f, 'utf8'));
  glyphCheck(ep);
  let times;
  if (['doc', 'versus', 'board', 'light', 'tiles', 'altitude', 'pulse', 'needle', 'spin'].includes(ep.template)) {
    const sm = (await import('../engine/summary.js')).summary(ep);
    times = process.env.ALL ? sm.keys : [0, sm.keys[4], sm.keys[9], sm.keys[13]];
  } else if (ep.template === 'swarm') {
    const tl = buildSwarmTimeline(ep);
    const S = tl.stops;
    times = (process.env.ALL ? S.map(s => s.t1 + 0.7) : [0, S[2].t1 + 0.7, S[4].t1 + 0.7, tl.hero.tl + 1.8]);
  } else {
    const tl = buildTimeline(ep);
    const last = tl.items[tl.items.length - 1];
    times = [0, tl.hero ? (tl.hero.t0 + tl.hero.t1) / 2 : tl.items[1].t0 + 1, tl.hero ? tl.hero.tl + 1.8 : tl.duration / 2, last.t1 + 0.4];
  }
  const st = await openStage(f);
  for (const [k, t] of times.entries()) {
    const p = path.join(dir, `${ep.id}_${k}.png`);
    fs.writeFileSync(p, await st.shot(t));
    shots.push(p);
  }
  await st.close();
  console.log('önizleme', ep.id);
}
spawnSync('node', ['tools/sheet.mjs', path.join('out', 'preview.png'), '4', ...shots], { stdio: 'inherit', env: { ...process.env, SHEET_W: '270' } });
for (const s of shots) fs.rmSync(s);
console.log('→ out/preview.png');

// Belirli anlardan kare kâğıdı: node tools/shots.mjs <bölüm.json> <out.png> t1 t2 ...
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { openStage } from './render.mjs';
const [f, out, ...ts] = process.argv.slice(2);
const dir = path.join('out', 'shots'); fs.mkdirSync(dir, { recursive: true });
const st = await openStage(f);
const shots = [];
for (const [k, t] of ts.entries()) { const p = path.join(dir, `s${k}.png`); fs.writeFileSync(p, await st.shot(Number(t))); shots.push(p); }
await st.close();
spawnSync('node', ['tools/sheet.mjs', out, String(Math.min(5, shots.length)), ...shots], { stdio: 'inherit', env: { ...process.env, SHEET_W: process.env.SHEET_W || '270' } });
for (const s of shots) fs.rmSync(s);
console.log('→', out);

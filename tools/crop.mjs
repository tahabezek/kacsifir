// Tek anın bölgesel büyütmesi: node tools/crop.mjs <bölüm.json> <out.png> x y w h t1 [t2 ...]
import fs from 'node:fs';
import { openStage } from './render.mjs';
const [f, out, x, y, w, h, ...ts] = process.argv.slice(2);
const st = await openStage(f);
const clips = [];
for (const t of ts) {
  await st.page.evaluate(t => window.renderFrame(t), Number(t));
  clips.push(await st.page.screenshot({ type: 'png', clip: { x: +x, y: +y, width: +w, height: +h }, encoding: 'base64' }));
}
await st.page.setViewport({ width: +w * clips.length, height: +h, deviceScaleFactor: 1 });
await st.page.setContent(`<body style="margin:0;display:flex">${clips.map(c => `<img src="data:image/png;base64,${c}">`).join('')}</body>`);
fs.writeFileSync(out, await st.page.screenshot({ type: 'png' }));
await st.close();
console.log('→', out);

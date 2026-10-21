// Planlanmış bir gönderinin videosunu yenisiyle değiştirir (yeni URL; Buffer önbelleğine takılmaz).
//   node tools/remedia.mjs 011 013    → out/<id>/video.mp4 medya dalına, gönderi editPost ile yeni URL'ye
// Sıra: medya dalına it (eski dosyalar da korunur) → Pages'te canlı mı (200, video/mp4, boyut) → editPost → defter.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gql } from './buffer.mjs';
import { summary } from '../engine/summary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const ledgerPath = path.join(root, 'state', 'ledger.json');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const git = (args, o = {}) => { const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30, ...o }); if (r.status) throw new Error(`git ${args[0]}: ${r.stderr}`); return r.stdout.trim(); };
const ids = process.argv.slice(2);
const eps = Object.fromEntries(fs.readdirSync(path.join(root, 'episodes')).filter(f => f.endsWith('.json'))
  .map(f => [f.slice(0, 3), { file: f, ep: JSON.parse(fs.readFileSync(path.join(root, 'episodes', f), 'utf8')) }]));

const jobs = [];
for (const id of ids) {
  const [key, slot] = Object.entries(ledger.slots).find(([, s]) => s.episode === id && s.status === 'scheduled' && new Date(s.dueAt) > Date.now() + 8 * 60e3) || [];
  if (!slot) { console.log(id, ': yayın bekleyen planlı gönderi yok, atlandı'); continue; }
  const mp4 = path.join(root, 'out', id, 'video.mp4');
  const buf = fs.readFileSync(mp4);
  const h = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const rel = `v/${eps[id].file.replace('.json', '')}-${h}.mp4`;
  jobs.push({ id, key, slot, mp4, rel, size: buf.length, ep: eps[id].ep });
}
if (!jobs.length) process.exit(0);

// medya dalı: mevcut her dosya korunur + yeniler
const dir = path.join(root, '.media');
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(path.join(dir, 'v'), { recursive: true });
git(['fetch', '--depth=1', 'origin', cfg.mediaBranch]);
for (const f of git(['ls-tree', '-r', '--name-only', 'FETCH_HEAD']).split('\n').filter(Boolean)) {
  fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
  fs.writeFileSync(path.join(dir, f), spawnSync('git', ['show', `FETCH_HEAD:${f}`], { cwd: root, maxBuffer: 1 << 30 }).stdout);
}
for (const j of jobs) fs.copyFileSync(j.mp4, path.join(dir, j.rel));
const env = { ...process.env, GIT_INDEX_FILE: path.join(root, '.git', 'media-index') };
fs.rmSync(env.GIT_INDEX_FILE, { force: true });
git(['--work-tree', dir, 'add', '-A', '.'], { env });
const tree = git(['write-tree'], { env });
const commit = git(['commit-tree', tree, '-m', `medya yenileme ${ids.join(',')} ${new Date().toISOString()}`], { env });
git(['push', '--force', 'origin', `${commit}:refs/heads/${cfg.mediaBranch}`]);
console.log('medya dalı itildi:', jobs.map(j => j.rel).join(', '));

async function live(url, size) {
  for (let k = 0; k < 48; k++) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
      if (r.status === 200 && Number(r.headers.get('content-length')) === size && /video\/mp4/.test(r.headers.get('content-type') || '')) return true;
    } catch { /* yeniden dene */ }
    await new Promise(r => setTimeout(r, 15000));
  }
  return false;
}
for (const j of jobs) {
  const url = cfg.mediaBaseUrl + j.rel;
  if (!(await live(url, j.size))) { console.log(j.id, ': Pages canlı değil, gönderi değiştirilmedi'); continue; }
  const text = [j.ep.caption, (j.ep.hashtags || []).join(' ')].filter(Boolean).join('\n\n');
  const d = await gql(`mutation($in: EditPostInput!) { editPost(input: $in) {
      ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`, { in: {
      id: j.slot.postId, text,
      assets: [{ video: { url, metadata: { thumbnailOffset: Math.round((j.ep.coverAt ?? summary(j.ep).cover) * 1000) } } }],
      metadata: { instagram: { type: 'reel', shouldShareToFeed: cfg.shareToFeed } },
    } });
  if (d.editPost.message) { console.log(j.id, ': editPost hatası:', d.editPost.message); continue; }
  ledger.slots[j.key] = { ...j.slot, media: j.rel, prevMedia: j.slot.media, remediaAt: new Date().toISOString() };
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
  console.log(j.id, ': gönderi yeni videoya bağlandı →', url);
}

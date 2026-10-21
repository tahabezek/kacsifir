// Planlanmış bir carousel gönderisini başka bir bölümün kareleriyle değiştirir (silmeden, editPost ile).
//   node tools/recarousel.mjs 2026-10-23T14:00Z 011
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gql } from './buffer.mjs';
import { makeCarousel } from './carousel.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const ledgerPath = path.join(root, 'state', 'ledger.json');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const [key, id] = process.argv.slice(2);
const slot = ledger.slots[key];
if (!slot || slot.kind !== 'carousel' || slot.status !== 'scheduled') throw new Error('planlı carousel yok: ' + key);
const file = fs.readdirSync(path.join(root, 'episodes')).find(f => f.startsWith(id + '-'));
const ep = JSON.parse(fs.readFileSync(path.join(root, 'episodes', file), 'utf8'));
const files = await makeCarousel(path.join('episodes', file));
const rels = files.map((f, i) => `c/${ep.id}-${ep.slug}/${i + 1}.jpg`);
// medya dalı: mevcut her şey korunur + yeni kareler
const git = (a, o = {}) => { const r = spawnSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30, ...o }); if (r.status) throw new Error(r.stderr); return r.stdout.trim(); };
const dir = path.join(root, '.media'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
git(['fetch', '--depth=1', 'origin', cfg.mediaBranch]);
for (const f of git(['ls-tree', '-r', '--name-only', 'FETCH_HEAD']).split('\n').filter(Boolean)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), spawnSync('git', ['show', `FETCH_HEAD:${f}`], { cwd: root, maxBuffer: 1 << 30 }).stdout); }
for (const [i, r] of rels.entries()) { fs.mkdirSync(path.dirname(path.join(dir, r)), { recursive: true }); fs.copyFileSync(files[i], path.join(dir, r)); }
const env = { ...process.env, GIT_INDEX_FILE: path.join(root, '.git', 'media-index') }; fs.rmSync(env.GIT_INDEX_FILE, { force: true });
git(['--work-tree', dir, 'add', '-A', '.'], { env });
const commit = git(['commit-tree', git(['write-tree'], { env }), '-m', `carousel ${id}`], { env });
git(['push', '--force', 'origin', `${commit}:refs/heads/${cfg.mediaBranch}`]);
for (const [i, r] of rels.entries()) {
  for (let k = 0; k < 48; k++) { const h = await fetch(cfg.mediaBaseUrl + r, { method: 'HEAD' }).catch(() => null); if (h && h.status === 200 && Number(h.headers.get('content-length')) === fs.statSync(files[i]).size) break; await new Promise(z => setTimeout(z, 15000)); }
}
const q = (ep.question || ep.title || [ep.slug]).join(' ');
const text = [`${q}\n\nKaydır, adım adım gör. Videonun tamamı profilde.\n\n${ep.caption}`, (ep.hashtags || []).join(' ')].join('\n\n');
const d = await gql(`mutation($in: EditPostInput!) { editPost(input: $in) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`, { in: {
  id: slot.postId, text,
  assets: rels.map((r, i) => ({ image: { url: cfg.mediaBaseUrl + r, metadata: { altText: `${q} · ${i + 1}/${rels.length}` } } })),
  metadata: { instagram: { type: 'post', shouldShareToFeed: true } },
} });
if (d.editPost.message) throw new Error(d.editPost.message);
ledger.slots[key] = { ...slot, episode: ep.id, media: rels, prevEpisode: slot.episode };
fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
console.log('carousel değişti:', key, '→', ep.id);

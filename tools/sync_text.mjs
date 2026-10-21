// Planlanmış (henüz yayınlanmamış) gönderilerin metnini bölümün güncel açıklama + hashtag'iyle eşitler.
//   node tools/sync_text.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gql, postsBetween } from './buffer.mjs';
import { summary } from '../engine/summary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'state', 'ledger.json'), 'utf8'));
const DRY = process.argv.includes('--dry');
const byPost = Object.fromEntries(Object.values(ledger.slots).filter(s => s.postId).map(s => [s.postId, s]));
const eps = Object.fromEntries(fs.readdirSync(path.join(root, 'episodes')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(root, 'episodes', f), 'utf8'))).map(e => [e.id, e]));

const now = new Date();
const posts = await postsBetween(cfg.organizationId, cfg.channelId, now.toISOString(), new Date(now.getTime() + 7 * 86400e3).toISOString());
for (const p of posts.filter(p => p.status === 'scheduled')) {
  const slot = byPost[p.id];
  if (!slot) { console.log('defterde yok, atlandı:', p.id); continue; }
  const ep = eps[slot.episode];
  const text = [ep.caption, (ep.hashtags || []).join(' ')].filter(Boolean).join('\n\n');
  if (text === p.text) { console.log('aynı  ', p.dueAt, ep.id); continue; }
  if (DRY) { console.log('farklı', p.dueAt, ep.id); continue; }
  const d = await gql(`mutation($in: EditPostInput!) { editPost(input: $in) {
      ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`, { in: {
      id: p.id, text,
      // Buffer düzenlemede medya ve Reels türünü de ister
      assets: [{ video: { url: cfg.mediaBaseUrl + slot.media, metadata: { thumbnailOffset: Math.round((ep.coverAt ?? summary(ep).cover) * 1000) } } }],
      metadata: { instagram: { type: 'reel', shouldShareToFeed: cfg.shareToFeed } },
    } });
  if (d.editPost.message) throw new Error(d.editPost.message);
  console.log('güncellendi', p.dueAt, ep.id);
}

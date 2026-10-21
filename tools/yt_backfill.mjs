// Instagram'da yayınlanmış bir bölümü YouTube'a ayrı bir saate planlar (yalnız YouTube kaydı).
//   node tools/yt_backfill.mjs 012 2026-10-22T08:00Z
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createShort } from './buffer.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const ledgerPath = path.join(root, 'state', 'ledger.json');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const [id, key] = process.argv.slice(2);
if (ledger.slots[key]) throw new Error('yuva dolu: ' + key);
const src = Object.values(ledger.slots).find(s => s.episode === id && !s.kind && s.media);
const file = fs.readdirSync(path.join(root, 'episodes')).find(f => f.startsWith(id + '-'));
const ep = JSON.parse(fs.readFileSync(path.join(root, 'episodes', file), 'utf8'));
const title = ep.ytTitle || (ep.question || ep.title || [ep.slug]).join(' ');
const text = [ep.caption, 'Her gün yeni bir sayı videosu: Kaç Sıfır? kanalına abone ol.', (ep.hashtags || []).join(' ')].join('\n\n');
const post = await createShort({ cfgYt: cfg.youtube, title, text, videoUrl: cfg.mediaBaseUrl + src.media, dueAtISO: new Date(key).toISOString() });
ledger.slots[key] = { kind: 'yt', episode: id, media: src.media, status: 'scheduled', postId: post.id, dueAt: post.dueAt, at: new Date().toISOString() };
fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
console.log('youtube planlandı', key, id, '·', title);

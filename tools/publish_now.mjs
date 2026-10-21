// Elle hemen yayın: medya zaten Pages'te olmalı. Gönderi deftere işlenir (planlayıcı bölümü tekrar seçmez).
//   node tools/publish_now.mjs episodes/012-kagit-efsanesi.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gql } from './buffer.mjs';
import { summary } from '../engine/summary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const epFile = process.argv[2];
const ep = JSON.parse(fs.readFileSync(epFile, 'utf8'));
const rel = `v/${ep.id}-${ep.slug}.mp4`;
const url = cfg.mediaBaseUrl + rel;
const text = [ep.caption, (ep.hashtags || []).join(' ')].filter(Boolean).join('\n\n');
const thumb = Math.round((ep.coverAt ?? summary(ep).cover) * 1000);

const head = await fetch(url, { method: 'HEAD' });
if (head.status !== 200 || !/video\/mp4/.test(head.headers.get('content-type') || '')) throw new Error(`medya canlı değil: ${head.status}`);

const d = await gql(`mutation($in: CreatePostInput!) { createPost(input: $in) {
    ... on PostActionSuccess { post { id status dueAt } }
    ... on MutationError { message } } }`,
  { in: {
    channelId: cfg.channelId, text, schedulingType: 'automatic', mode: 'shareNow', needsApproval: false, source: 'kacsifir-manual',
    assets: [{ video: { url, metadata: thumb > 0 ? { thumbnailOffset: thumb } : undefined } }],
    metadata: { instagram: { type: 'reel', shouldShareToFeed: true } },
  } }, { timeoutMs: 120000 });
if (d.createPost.message) throw new Error('createPost: ' + d.createPost.message);
const post = d.createPost.post;

const ledgerFile = path.join(root, 'state', 'ledger.json');
const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : { slots: {} };
const key = new Date().toISOString().slice(0, 16) + 'Z';
ledger.slots[key] = { episode: ep.id, media: rel, status: 'scheduled', postId: post.id, dueAt: post.dueAt, manual: true, at: new Date().toISOString() };
fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
console.log(JSON.stringify({ post, url, key }, null, 2));

// Buffer GraphQL istemcisi. Anahtar ortam değişkeninden (Actions secret) ya da yerel .env'den okunur;
// hiçbir yere yazdırılmaz.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readEnv() {
  const f = path.join(root, '.env');
  if (!fs.existsSync(f)) return {};
  return Object.fromEntries(
    fs.readFileSync(f, 'utf8').split(/\r?\n/)
      .filter(l => l.includes('=') && !l.trim().startsWith('#'))
      .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')])
  );
}

const KEY = (process.env.BUFFER_API_KEY || readEnv().BUFFER_API_KEY || '').trim();

export function hasKey() { return KEY.length > 0; }

export async function gql(query, variables = {}, { timeoutMs = 45000 } = {}) {
  if (!KEY) throw new Error('BUFFER_API_KEY yok (.env ya da ortam değişkeni)');
  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`Buffer HTTP ${res.status}: ${text.slice(0, 200)}`); }
  if (json.errors) throw new Error('Buffer: ' + json.errors.map(e => e.message).join(' | '));
  return json.data;
}

export async function channelHealth(channelId) {
  const d = await gql(`query($id: ChannelId!) { channel(input: { id: $id }) {
    id name service isDisconnected isLocked isQueuePaused timezone } }`, { id: channelId });
  return d.channel;
}

// Kanalın belirli zaman aralığındaki gönderileri (zamanlanmış, gönderiliyor, gönderildi, hata)
export async function postsBetween(organizationId, channelId, startISO, endISO) {
  const d = await gql(`query($in: PostsInput!) { posts(input: $in) { edges { node {
      id status dueAt sentAt text error { message } } } } }`,
    { in: { organizationId, filter: { channelIds: [channelId], dueAt: { start: startISO, end: endISO },
      status: ['scheduled', 'sending', 'sent', 'error', 'needs_approval', 'draft'] } } });
  return (d.posts.edges || []).map(e => e.node);
}

export async function createReel({ channelId, text, videoUrl, dueAtISO, thumbnailOffsetMs, shareToFeed = true }) {
  const d = await gql(`mutation($in: CreatePostInput!) { createPost(input: $in) {
      ... on PostActionSuccess { post { id status dueAt } }
      ... on MutationError { message } } }`,
    { in: {
      channelId, text, schedulingType: 'automatic', mode: 'customScheduled', dueAt: dueAtISO,
      needsApproval: false, source: 'kacsifir-pipeline',
      assets: [{ video: { url: videoUrl, metadata: thumbnailOffsetMs != null ? { thumbnailOffset: thumbnailOffsetMs } : undefined } }],
      metadata: { instagram: { type: 'reel', shouldShareToFeed: shareToFeed } },
    } }, { timeoutMs: 120000 });
  if (d.createPost.message) throw new Error('createPost: ' + d.createPost.message);
  return d.createPost.post;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await gql(process.argv[2]), null, 2));
}

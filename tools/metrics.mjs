// Analiz: gönderilen her Reels'in Buffer metriklerini toplar, bölümle eşleştirir, puanlar ve rapor üretir.
//   node tools/metrics.mjs   → state/metrics.json (günlük anlık görüntüler) + state/report.md
// Puan: izlenme oranı ve erişim başına gönderme/kaydetme/takip (Instagram'ın açıkladığı sinyaller).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gql } from './buffer.mjs';
import { summary } from '../engine/summary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'state', 'ledger.json'), 'utf8'));
const byPost = Object.fromEntries(Object.values(ledger.slots).filter(s => s.postId).map(s => [s.postId, s]));
const episodes = Object.fromEntries(fs.readdirSync(path.join(root, 'episodes')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(root, 'episodes', f), 'utf8'))).map(e => [e.id, e]));

const now = new Date();
const d = await gql(`query($in: PostsInput!) { posts(input: $in) { edges { node {
    id status sentAt dueAt externalLink text metricsUpdatedAt metrics { type value } } } } }`,
  { in: { organizationId: cfg.organizationId, filter: { channelIds: [cfg.channelId], status: ['sent'],
    dueAt: { start: new Date(now - 30 * 86400e3).toISOString(), end: now.toISOString() } } } });
const posts = (d.posts.edges || []).map(e => e.node);

const rows = posts.map(p => {
  const m = Object.fromEntries((p.metrics || []).map(x => [x.type, x.value]));
  const slot = byPost[p.id];
  const ep = slot ? episodes[slot.episode] : null;
  const isCar = slot?.kind === 'carousel';
  const dur = ep && !isCar ? summary(ep).duration : null;
  const reach = m.reach || m.viewers || 0;
  const per = k => (reach ? (m[k] || 0) / reach : 0);
  const watch = dur && m.averageTimeWatched ? m.averageTimeWatched / dur : null; // >1 = tekrar izleme
  // Puan: izlenme oranı ağırlıklı + paylaşım (en güçlü sinyal) + kaydetme + takip
  const score = (watch ?? 0) * 40 + per('shares') * 4000 + per('saves') * 2000 + per('follows') * 6000 + per('likes') * 300;
  return {
    postId: p.id, episode: slot?.episode ?? '?', slug: ep?.slug ?? '', template: isCar ? 'carousel' : ep?.template ?? 'tower',
    sentAt: p.sentAt, link: p.externalLink, views: m.views || 0, reach, likes: m.likes || 0, comments: m.comments || 0,
    shares: m.shares || 0, saves: m.saves || 0, follows: m.follows || 0, avgWatchS: m.averageTimeWatched ?? null,
    durationS: dur ? +dur.toFixed(1) : null, watchRatio: watch != null ? +watch.toFixed(2) : null,
    sharesPer1k: +(per('shares') * 1000).toFixed(1), savesPer1k: +(per('saves') * 1000).toFixed(1), followsPer1k: +(per('follows') * 1000).toFixed(1),
    score: +score.toFixed(1), metricsUpdatedAt: p.metricsUpdatedAt,
  };
}).sort((a, b) => b.score - a.score);

// günlük anlık görüntü
const mf = path.join(root, 'state', 'metrics.json');
const hist = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : { snapshots: {} };
hist.snapshots[now.toISOString().slice(0, 10)] = rows;
fs.writeFileSync(mf, JSON.stringify(hist, null, 2) + '\n');

// rapor
const tot = rows.reduce((a, r) => ({ views: a.views + r.views, follows: a.follows + r.follows, shares: a.shares + r.shares }), { views: 0, follows: 0, shares: 0 });
const byTpl = {};
for (const r of rows) (byTpl[r.template] ||= []).push(r.score);
const md = [
  `# Performans raporu · ${now.toISOString().slice(0, 16).replace('T', ' ')} UTC`, '',
  `Gönderi: ${rows.length} · izlenme: ${tot.views} · paylaşım: ${tot.shares} · takip: ${tot.follows}`, '',
  '| # | bölüm | şablon | izlenme | erişim | izlenme oranı | paylaşım/1k | kaydetme/1k | takip/1k | puan |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r, i) => `| ${i + 1} | [${r.episode} ${r.slug}](${r.link}) | ${r.template} | ${r.views} | ${r.reach} | ${r.watchRatio ?? '–'} | ${r.sharesPer1k} | ${r.savesPer1k} | ${r.followsPer1k} | ${r.score} |`),
  '', '## Şablona göre ortalama puan',
  ...Object.entries(byTpl).map(([k, v]) => `- ${k}: ${(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)} (${v.length} gönderi)`),
  '', '## Okuma kuralları (PLAYBOOK §8)',
  '- İzlenme oranı < 0,5: kanca/ilk 3 sn sorunu → başlığı ve kare 0\'ı yeniden yaz.',
  '- Paylaşım/1k yüksek ama takip düşük: profil vaadi/seri kimliği zayıf → bio ve sabit gönderiler.',
  '- En iyi 2 bölüm: yeni kanca + yeni kapakla yeniden yapılır (yeniden yükleme değil).',
].join('\n');
fs.writeFileSync(path.join(root, 'state', 'report.md'), md + '\n');
console.log(md);

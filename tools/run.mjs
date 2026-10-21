// Orkestratör: önümüzdeki N saatin boş yuvalarını bulur, bölümü render eder, medyayı Pages'e koyar,
// Buffer'a customScheduled + dueAt ile tek denemede planlar.
//
//   node tools/run.mjs                 → normal çalışma (Actions)
//   node tools/run.mjs --dry           → yalnızca plan + render, medya/Buffer yok
//   node tools/run.mjs --status        → kanal sağlığı, kuyruk, son hatalar, kalan bölüm stoğu
//
// cinefia dersleri: gerçeğin kaynağı Buffer kuyruğu (yuva doluysa atla), yayın çağrısı tek deneme,
// geçmiş/yakın zamana asla planlama yok (shareNow kullanılmaz), firstComment yok, medya yönlendirmesiz statik URL.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { channelHealth, postsBetween, createReel, createCarousel } from './buffer.mjs';
import { makeCarousel } from './carousel.mjs';
import { summary as tlSummary } from '../engine/summary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry');
const LEDGER = path.join(root, 'state', 'ledger.json');
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const summary = [];

// ——— durum defteri ———
// Bu durumlardaki bölümler yayınlanmamış sayılır ve stoğa geri döner
const NOT_USED = new Set(['failed', 'skipped']);
function loadLedger() {
  if (!fs.existsSync(LEDGER)) return { slots: {} };
  return JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
}
function saveLedger(l) {
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  fs.writeFileSync(LEDGER, JSON.stringify(l, null, 2) + '\n');
}

// ——— yuvalar (TR saati sabit UTC+3) ———
function upcomingSlots(now, list = cfg.slotsTR) {
  const out = [];
  const trNow = new Date(now.getTime() + cfg.trUtcOffsetHours * 3600e3);
  for (let d = -1; d <= Math.ceil(cfg.horizonHours / 24) + 1; d++) {
    const y = trNow.getUTCFullYear(), m = trNow.getUTCMonth(), day = trNow.getUTCDate() + d;
    for (const s of list) {
      const [hh, mm] = s.split(':').map(Number);
      const t = new Date(Date.UTC(y, m, day, hh - cfg.trUtcOffsetHours, mm));
      const lead = (t - now) / 60e3;
      if (lead >= cfg.minLeadMinutes && lead <= cfg.horizonHours * 60) out.push(t);
    }
  }
  return out.sort((a, b) => a - b);
}
const slotKey = t => t.toISOString().slice(0, 16) + 'Z';

// ——— bölüm stoğu ———
function episodes() {
  const qf = path.join(root, 'state', 'queue.json');
  const order = fs.existsSync(qf) ? JSON.parse(fs.readFileSync(qf, 'utf8')).order : [];
  const rank = id => (order.includes(id) ? order.indexOf(id) : order.length);
  return fs.readdirSync(path.join(root, 'episodes')).filter(f => f.endsWith('.json')).sort()
    .map(f => ({ file: path.join('episodes', f), ...JSON.parse(fs.readFileSync(path.join(root, 'episodes', f), 'utf8')) }))
    .filter(e => !e.disabled)
    .sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
}
const reelSlots = ledger => Object.values(ledger.slots).filter(s => s.kind !== 'carousel');
function usedReels(ledger) { return new Set(reelSlots(ledger).filter(s => !NOT_USED.has(s.status)).map(s => s.episode)); }
// publishAt: "2026-11-18T17:30Z" gibi; bölüm yalnızca o yuvada yayınlanır
function nextEpisode(ledger, taken, t) {
  const used = usedReels(ledger);
  const pinned = episodes().find(e => e.publishAt && e.publishAt === slotKey(t) && !used.has(e.id) && !taken.has(e.id));
  if (pinned) return pinned;
  return episodes().find(e => !e.publishAt && !used.has(e.id) && !taken.has(e.id));
}

// ——— render ———
function render(ep) {
  const mp4 = path.join(root, 'out', ep.id, 'video.mp4');
  if (fs.existsSync(mp4)) return mp4;
  log(`render ${ep.id} (${ep.slug})`);
  const r = spawnSync(process.execPath, [path.join(root, 'tools', 'render.mjs'), ep.file], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0 || !fs.existsSync(mp4)) throw new Error(`render başarısız: ${ep.id}`);
  return mp4;
}
const mediaName = ep => `v/${ep.id}-${ep.slug}.mp4`;

// ——— medya: 'media' dalına yetim commit, eski dosyalar budanır (git plumbing; çalışma ağacına dokunmaz) ———
function git(a, opts = {}) {
  const r = spawnSync('git', a, { cwd: root, encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
function publishMedia(ledger, newFiles) {
  const dir = path.join(root, '.media');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'v'), { recursive: true });
  // önceki medya dalından, hâlâ yayın bekleyen ya da yakın tarihli dosyaları koru
  let hasBranch = true;
  try { git(['fetch', '--depth=1', 'origin', cfg.mediaBranch]); } catch { hasBranch = false; }
  const keepAfter = Date.now() - cfg.mediaKeepDays * 86400e3;
  const keep = new Set(Object.entries(ledger.slots).filter(([k]) => new Date(k).getTime() > keepAfter).flatMap(([, s]) => [].concat(s.media || [])));
  if (hasBranch) {
    for (const f of git(['ls-tree', '-r', '--name-only', 'FETCH_HEAD']).split('\n')) {
      if (keep.has(f)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), spawnSync('git', ['show', `FETCH_HEAD:${f}`], { cwd: root, maxBuffer: 1 << 30 }).stdout); }
    }
  }
  for (const [rel, src] of newFiles) { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.copyFileSync(src, path.join(dir, rel)); }
  fs.writeFileSync(path.join(dir, '.nojekyll'), '');
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><meta charset="utf-8"><title>kacsifir medya</title>');
  const env = { ...process.env, GIT_INDEX_FILE: path.join(root, '.git', 'media-index') };
  fs.rmSync(env.GIT_INDEX_FILE, { force: true });
  git(['--work-tree', dir, 'add', '-A', '.'], { env });
  const tree = git(['write-tree'], { env });
  const commit = git(['commit-tree', tree, '-m', `medya ${new Date().toISOString()}`], { env });
  git(['push', '--force', 'origin', `${commit}:refs/heads/${cfg.mediaBranch}`]);
  log(`medya dalı güncellendi (${newFiles.length} yeni dosya)`);
}

// Pages yayına alınana kadar bekle: 200, video/mp4, boyut birebir aynı
async function waitLive(url, size, timeoutMs = 12 * 60e3) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
      const len = Number(r.headers.get('content-length'));
      if (r.status === 200 && len === size && /video\/mp4|image\/jpeg/.test(r.headers.get('content-type') || '')) return true;
    } catch { /* yeniden dene */ }
    await new Promise(r => setTimeout(r, 15000));
  }
  return false;
}

async function status() {
  const ch = await channelHealth(cfg.channelId);
  const now = new Date();
  const posts = await postsBetween(cfg.organizationId, cfg.channelId,
    new Date(now - 5 * 86400e3).toISOString(), new Date(now.getTime() + 7 * 86400e3).toISOString());
  const ledger = loadLedger();
  const used = usedReels(ledger);
  const left = episodes().filter(e => !used.has(e.id)).length;
  console.log(JSON.stringify({
    channel: ch,
    stock: { remainingEpisodes: left, days: +(left / cfg.slotsTR.length).toFixed(1) },
    posts: posts.sort((a, b) => (a.dueAt < b.dueAt ? -1 : 1)).map(p => ({ dueAt: p.dueAt, status: p.status, error: p.error?.message, text: p.text.slice(0, 40) })),
  }, null, 2));
}

async function main() {
  if (args.has('--status')) return status();
  if (process.env.KACSIFIR_PAUSED === 'true') { log('KACSIFIR_PAUSED=true → hiçbir şey yapılmadı'); return; }

  const now = new Date();
  const ledger = loadLedger();
  if (!DRY) {
    const ch = await channelHealth(cfg.channelId);
    if (ch.isDisconnected || ch.isLocked) throw new Error(`Buffer kanalı kullanılamıyor: ${JSON.stringify(ch)}`);
    if (ch.isQueuePaused) summary.push('⚠️ Buffer kuyruğu duraklatılmış; planlanan gönderiler çıkmaz.');
  }
  const slots = upcomingSlots(now);
  const tol = cfg.slotToleranceMinutes * 60e3;
  const existing = DRY ? [] : await postsBetween(cfg.organizationId, cfg.channelId,
    new Date(now.getTime() - 3600e3).toISOString(), new Date(now.getTime() + (cfg.horizonHours + 2) * 3600e3).toISOString());
  const filled = t => existing.some(p => p.dueAt && Math.abs(new Date(p.dueAt) - t) <= tol);

  const plan = [];
  const taken = new Set();
  for (const t of slots) {
    if (filled(t)) { log(`dolu  ${slotKey(t)}`); continue; }
    const prev = ledger.slots[slotKey(t)];
    const ep = prev && prev.status === 'failed' && prev.kind !== 'carousel' ? episodes().find(e => e.id === prev.episode) : nextEpisode(ledger, taken, t);
    if (!ep) { summary.push(`❌ Bölüm stoğu bitti: ${slotKey(t)} boş kalacak.`); break; }
    taken.add(ep.id);
    plan.push({ t, ep });
    log(`boş   ${slotKey(t)} → ${ep.id} ${ep.slug}`);
  }
  if (!plan.length) { log('tüm reels yuvaları dolu'); await carousels(ledger, now, existing, tol); return finish(ledger); }

  // render
  for (const p of plan) { p.mp4 = render(p.ep); p.rel = mediaName(p.ep); p.url = cfg.mediaBaseUrl + p.rel; }
  if (DRY) { log('dry: medya ve Buffer adımları atlandı'); return; }

  // medya
  for (const p of plan) ledger.slots[slotKey(p.t)] = { episode: p.ep.id, media: p.rel, status: 'media', at: now.toISOString() };
  saveLedger(ledger);
  publishMedia(ledger, plan.map(p => [p.rel, p.mp4]));

  // planlama: her yuva için tek deneme
  for (const p of plan) {
    const k = slotKey(p.t);
    const size = fs.statSync(p.mp4).size;
    if (!(await waitLive(p.url, size))) { ledger.slots[k].status = 'failed'; ledger.slots[k].error = 'medya yayına çıkmadı'; summary.push(`❌ ${k}: medya URL'si canlı değil`); continue; }
    if ((p.t - Date.now()) / 60e3 < cfg.minLeadMinutes) { ledger.slots[k].status = 'failed'; ledger.slots[k].error = 'süre geçti'; summary.push(`⚠️ ${k}: süre geçti, atlandı`); continue; }
    // yarış koruması: Buffer'a son bir kez bak
    const again = await postsBetween(cfg.organizationId, cfg.channelId, new Date(p.t - tol).toISOString(), new Date(p.t.getTime() + tol).toISOString());
    if (again.length) { ledger.slots[k].status = 'skipped'; ledger.slots[k].note = 'yuvada başka gönderi vardı; bölüm stoğa döndü'; log(`dolu (yarış) ${k}`); continue; }
    const sm = tlSummary(p.ep);
    const thumb = Math.round((p.ep.coverAt ?? sm.cover) * 1000);
    const text = [p.ep.caption, (p.ep.hashtags || []).join(' ')].filter(Boolean).join('\n\n');
    ledger.slots[k].status = 'sending'; saveLedger(ledger);
    try {
      const post = await createReel({ channelId: cfg.channelId, text, videoUrl: p.url, dueAtISO: p.t.toISOString(), thumbnailOffsetMs: thumb, shareToFeed: cfg.shareToFeed });
      Object.assign(ledger.slots[k], { status: 'scheduled', postId: post.id, dueAt: post.dueAt });
      summary.push(`✅ ${k} → ${p.ep.id} ${p.ep.slug}`);
      log(`planlandı ${k} → ${post.id}`);
    } catch (e) {
      // tek deneme: tekrar yok. Sonraki çalıştırma Buffer'a bakıp boşsa yeniden dener.
      Object.assign(ledger.slots[k], { status: 'failed', error: String(e.message).slice(0, 300) });
      summary.push(`❌ ${k}: ${e.message}`);
    }
    saveLedger(ledger);
  }
  await carousels(ledger, now, existing, tol);
  return finish(ledger);
}

// ——— carousel: yayınlanmış bir Reels'in kilit anları, günde bir kez ———
// kaynak: en az carouselMinAgeHours önce yayınlanmış, henüz carousel'i çıkmamış bölüm; metrik puanı yüksek olan önce
async function carousels(ledger, now, existing, tol) {
  if (!cfg.carouselSlotsTR?.length || DRY) return;
  const done = new Set(Object.values(ledger.slots).filter(s => s.kind === 'carousel' && !NOT_USED.has(s.status)).map(s => s.episode));
  let scores = {};
  try { const m = JSON.parse(fs.readFileSync(path.join(root, 'state', 'metrics.json'), 'utf8')); for (const day of Object.values(m.snapshots || {})) for (const r of day) if (r.template !== 'carousel') scores[r.episode] = Math.max(scores[r.episode] ?? 0, r.score ?? 0); } catch { /* metrik yok */ }
  for (const t of upcomingSlots(now, cfg.carouselSlotsTR)) {
    if (existing.some(p => p.dueAt && Math.abs(new Date(p.dueAt) - t) <= tol)) { log(`dolu  ${slotKey(t)} (carousel)`); continue; }
    const cands = Object.values(ledger.slots).filter(s => s.kind !== 'carousel' && s.status === 'scheduled' && s.dueAt && (t - new Date(s.dueAt)) / 3600e3 >= cfg.carouselMinAgeHours && !done.has(s.episode));
    if (!cands.length) { log(`carousel kaynağı yok: ${slotKey(t)}`); continue; }
    // eski kule kalıbı carousel'e taşınmaz (görsel çeşitlilik kuralı)
    const tpl = id => (allEpisodes().find(e => e.id === id) || {}).template || 'tower'; // şablon alanı yoksa kuledir
    for (let i = cands.length - 1; i >= 0; i--) if (tpl(cands[i].episode) === 'tower') cands.splice(i, 1);
    if (!cands.length) { log(`carousel kaynağı yok: ${slotKey(t)}`); continue; }
    cands.sort((a, b) => (scores[b.episode] ?? 0) - (scores[a.episode] ?? 0) || new Date(a.dueAt) - new Date(b.dueAt));
    const ep = episodes().concat(allEpisodes()).find(e => e.id === cands[0].episode);
    if (!ep) continue;
    const k = slotKey(t);
    const q = (ep.question || ep.title || [ep.slug]).join(' '); // şablona göre soru alanı farklı
    try {
      const files = await makeCarousel(ep.file);
      const rels = files.map((f, i) => `c/${ep.id}-${ep.slug}/${i + 1}.jpg`);
      ledger.slots[k] = { kind: 'carousel', episode: ep.id, media: rels, status: 'media', at: now.toISOString() };
      saveLedger(ledger);
      publishMedia(ledger, rels.map((r, i) => [r, files[i]]));
      for (const [i, r] of rels.entries()) if (!(await waitLive(cfg.mediaBaseUrl + r, fs.statSync(files[i]).size))) throw new Error('carousel görseli yayına çıkmadı: ' + r);
      if ((t - Date.now()) / 60e3 < cfg.minLeadMinutes) throw new Error('süre geçti');
      const text = [ep.carouselCaption || `${q}\n\nKaydır, adım adım gör. Videonun tamamı profilde.\n\n${ep.caption}`, (ep.hashtags || []).join(' ')].filter(Boolean).join('\n\n');
      const post = await createCarousel({ channelId: cfg.channelId, text, imageUrls: rels.map(r => cfg.mediaBaseUrl + r), altTexts: rels.map((_, i) => `${q} · ${i + 1}/${rels.length}`), dueAtISO: t.toISOString() });
      Object.assign(ledger.slots[k], { status: 'scheduled', postId: post.id, dueAt: post.dueAt });
      summary.push(`✅ ${k} carousel → ${ep.id}`);
      done.add(ep.id);
    } catch (e) {
      ledger.slots[k] = { ...(ledger.slots[k] || { kind: 'carousel', episode: ep.id }), status: 'failed', error: String(e.message).slice(0, 300) };
      summary.push(`⚠️ ${k} carousel: ${e.message}`); // carousel hatası reels akışını kırmaz
    }
    saveLedger(ledger);
  }
}
// devre dışı bırakılmış bölümler de carousel kaynağı olabilir (yayınlanmış olanlar)
function allEpisodes() {
  return fs.readdirSync(path.join(root, 'episodes')).filter(f => f.endsWith('.json')).sort()
    .map(f => ({ file: path.join('episodes', f), ...JSON.parse(fs.readFileSync(path.join(root, 'episodes', f), 'utf8')) }));
}

function finish(ledger) {
  saveLedger(ledger);
  const used = usedReels(ledger);
  const left = episodes().filter(e => !used.has(e.id)).length;
  const days = left / cfg.slotsTR.length;
  if (days < cfg.lowBacklogWarnDays) summary.push(`⚠️ Bölüm stoğu azaldı: ${left} bölüm (${days.toFixed(1)} gün).`);
  const text = summary.join('\n') || 'değişiklik yok';
  log(text);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### kacsifir\n${text}\n`);
  if (summary.some(s => s.startsWith('❌'))) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exitCode = 1; });

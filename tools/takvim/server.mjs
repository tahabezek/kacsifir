// Takvim paneli: yayın planını gösterir; henüz Buffer'a gitmemiş bölümler taşınabilir, yer değiştirebilir,
// takvimden kaldırılabilir ve not alabilir. Yalnız bu makineden erişilir (127.0.0.1).
//
//   node tools/takvim/server.mjs      → http://127.0.0.1:4173
//
// Yazdığı yerler: episodes/*.json (publishAt, disabled) ve state/notes.json. Değişiklikler "Gönder" ile
// commit + push edilir; zamanlayıcı (Actions) yalnızca depodaki hâli görür.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = Number(process.env.TAKVIM_PORT || 4173);
const EP_DIR = path.join(root, 'episodes');
const NOTES = path.join(root, 'state', 'notes.json');
const THUMBS = path.join(root, 'out', 'takvim-thumbs');
const NOT_USED = new Set(['failed', 'skipped']); // run.mjs ile aynı
const cfg = () => JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf8'));
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);

// ——— bölümler ———
function loadEpisodes() {
  const order = readJson(path.join(root, 'state', 'queue.json'), { order: [] }).order;
  const rank = id => (order.includes(id) ? order.indexOf(id) : order.length);
  return fs.readdirSync(EP_DIR).filter(f => f.endsWith('.json')).sort()
    .map(f => ({ file: path.join(EP_DIR, f), ...JSON.parse(fs.readFileSync(path.join(EP_DIR, f), 'utf8')) }))
    .sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
}
function saveEpisode(ep, patch) {
  const raw = JSON.parse(fs.readFileSync(ep.file, 'utf8'));
  for (const [k, v] of Object.entries(patch)) { if (v === undefined) delete raw[k]; else raw[k] = v; }
  fs.writeFileSync(ep.file, JSON.stringify(raw, null, 2) + '\n');
}
const titleOf = e => (e.question || e.title || []).join?.(' ') || e.ytTitle || e.voice?.lines?.[0]?.text || e.slug;
function categoryOf(e) {
  const s = e.serial || '';
  if (e.commemoration || /1923|DEVRİMİ|1938/.test(s)) return 'ozel';
  if (/HANGİSİ\?/.test(s) && e.voice) return 'hangisi';
  if (e.voice) return 'anlatimli';
  return 'klasik';
}
function videoOf(e) {
  const pre = path.join(root, 'prebuilt', `${e.id}-${e.slug}.mp4`);
  if (fs.existsSync(pre)) return pre;
  const out = path.join(root, 'out', e.id, 'video.mp4');
  return fs.existsSync(out) ? out : null;
}

// ——— yuvalar (TR saati sabit UTC+3) ———
const key = t => t.toISOString().slice(0, 16) + 'Z';
function trDayStart(now, off, c) {
  const tr = new Date(now.getTime() + c.trUtcOffsetHours * 3600e3);
  return Date.UTC(tr.getUTCFullYear(), tr.getUTCMonth(), tr.getUTCDate() + off) - c.trUtcOffsetHours * 3600e3;
}
const trDay = (t, c) => new Date(t.getTime() + c.trUtcOffsetHours * 3600e3).toISOString().slice(0, 10);
const atTR = (dayStartUtc, hhmm) => { const [h, m] = hhmm.split(':').map(Number); return new Date(dayStartUtc + (h * 60 + m) * 60e3); };

// run.mjs'in seçme kuralı: önce o yuvaya sabitlenmiş bölüm, yoksa (anma günü değilse) kuyruktaki ilk sabitsiz bölüm
function buildPlan({ back = 3, days = 35 } = {}) {
  const c = cfg();
  const now = new Date();
  const ledger = readJson(path.join(root, 'state', 'ledger.json'), { slots: {} });
  const eps = loadEpisodes();
  const live = eps.filter(e => !e.disabled);
  const used = new Set(Object.values(ledger.slots).filter(s => !s.kind && !NOT_USED.has(s.status)).map(s => s.episode));
  const taken = new Set();
  const quietDays = new Set(c.quietDaysTR || []);
  const leadMs = c.minLeadMinutes * 60e3;
  const reels = [], carousels = [];

  // geçmiş günler yalnız defterden okunur; geleceğe atama bugünden başlar
  for (let d = -back; d < days; d++) {
    const ds = trDayStart(now, d, c);
    const day = trDay(new Date(ds + 12 * 3600e3), c);
    const quiet = quietDays.has(day);
    const extra = live.filter(e => e.publishAt && trDay(new Date(e.publishAt), c) === day)
      .map(e => new Date(new Date(e.publishAt).getTime() + c.trUtcOffsetHours * 3600e3).toISOString().slice(11, 16));
    // saat düzeni değişse de defterde (Buffer'da) duran eski yuvalar görünür kalır
    const booked = Object.entries(ledger.slots).filter(([k, s]) => !s.kind && !NOT_USED.has(s.status) && trDay(new Date(k), c) === day)
      .map(([k]) => new Date(new Date(k).getTime() + c.trUtcOffsetHours * 3600e3).toISOString().slice(11, 16));
    const times = [...new Set([...c.slotsTR, ...extra, ...booked])].sort();
    for (const hhmm of times) {
      const t = atTR(ds, hhmm), k = key(t);
      const led = ledger.slots[k];
      const base = { key: k, day, time: hhmm, quiet, offGrid: !c.slotsTR.includes(hhmm) };
      if (led && !led.kind && !NOT_USED.has(led.status)) {
        const ep = eps.find(e => e.id === led.episode);
        const published = new Date(led.dueAt || k) <= now;
        reels.push({ ...base, episode: led.episode, state: published ? 'yayinlandi' : 'planlandi', locked: true,
          yt: led.yt?.status || null, error: led.error || null, ep: ep ? epInfo(ep) : null });
        continue;
      }
      if (t - now < leadMs) { if (d >= 0 || led) reels.push({ ...base, state: led ? 'basarisiz' : 'gecti', episode: led?.episode || null, error: led?.error || null, ep: null }); continue; }
      let ep = live.find(e => e.publishAt === k && !used.has(e.id) && !taken.has(e.id));
      let how = 'sabit';
      if (!ep && !quiet) { ep = live.find(e => !e.publishAt && !used.has(e.id) && !taken.has(e.id)); how = 'kuyruk'; }
      if (!ep) { reels.push({ ...base, state: quiet ? 'anma' : 'bos', episode: null, ep: null }); continue; }
      taken.add(ep.id);
      reels.push({ ...base, episode: ep.id, state: videoOf(ep) ? 'hazir' : 'render', how, locked: false, ep: epInfo(ep) });
    }
    for (const hhmm of c.carouselSlotsTR || []) {
      const t = atTR(ds, hhmm), k = key(t);
      const led = ledger.slots[k];
      if (led && led.kind === 'carousel' && !NOT_USED.has(led.status)) {
        const ep = eps.find(e => e.id === led.episode);
        carousels.push({ key: k, day, time: hhmm, episode: led.episode, state: new Date(led.dueAt || k) <= now ? 'yayinlandi' : 'planlandi', ep: ep ? epInfo(ep) : null });
      } else if (t - now >= leadMs) carousels.push({ key: k, day, time: hhmm, episode: null, state: quiet ? 'anma' : 'otomatik', ep: null });
    }
  }
  // takvimde yeri olmayan bölümler: aralığın ötesinde, kaldırılmış ya da sabit tarihi geçmiş
  const placed = new Set(reels.map(r => r.episode).filter(Boolean));
  const stock = eps.filter(e => !used.has(e.id) && !placed.has(e.id)).map(e => ({
    ...epInfo(e), reason: e.disabled ? 'kaldirildi' : e.publishAt ? (new Date(e.publishAt) < now ? 'gecmis' : 'ileride') : 'kuyruk',
  }));
  return { now: now.toISOString(), slotsTR: c.slotsTR, reels, carousels, stock, notes: readJson(NOTES, {}), git: gitState() };
}
function epInfo(e) {
  return { id: e.id, slug: e.slug, title: titleOf(e), serial: e.serial || '', category: categoryOf(e), publishAt: e.publishAt || null,
    disabled: !!e.disabled, video: !!videoOf(e), template: e.template || 'tower' };
}

// ——— işlemler ———
function editable(id) {
  const ledger = readJson(path.join(root, 'state', 'ledger.json'), { slots: {} });
  const inLedger = Object.values(ledger.slots).some(s => !s.kind && s.episode === id && !NOT_USED.has(s.status));
  const ep = loadEpisodes().find(e => e.id === id);
  if (!ep) throw new Error(`bölüm yok: ${id}`);
  if (inLedger) throw new Error(`${id} Buffer'a gönderilmiş; değiştirmek için önce Buffer'daki gönderi silinmeli`);
  return ep;
}
function slotFree(k) {
  const led = readJson(path.join(root, 'state', 'ledger.json'), { slots: {} }).slots[k];
  if (led && !led.kind && !NOT_USED.has(led.status)) throw new Error('bu yuva Buffer\'da dolu');
  if (new Date(k) - Date.now() < cfg().minLeadMinutes * 60e3) throw new Error('bu yuvanın zamanı geçti');
}
// a'yı k yuvasına taşır; yuvada başka bir bölüm varsa yer değiştirir (b, a'nın eski yuvasına geçer)
function move(id, k, fromKey) {
  const a = editable(id);
  slotFree(k);
  const plan = buildPlan();
  const occupant = plan.reels.find(r => r.key === k && r.episode && r.episode !== id);
  if (occupant) {
    const b = editable(occupant.episode);
    if (!fromKey) throw new Error('yer değiştirmek için iki bölümün de takvimde yeri olmalı');
    saveEpisode(b, { publishAt: fromKey });
  }
  saveEpisode(a, { publishAt: k, disabled: undefined, disabledNote: undefined });
  return occupant ? `${id} ↔ ${occupant.episode}` : `${id} → ${k}`;
}
function remove(id) { const a = editable(id); saveEpisode(a, { disabled: true, disabledNote: `takvimden kaldırıldı ${new Date().toISOString().slice(0, 10)}` }); return `${id} kaldırıldı`; }
function restore(id) { const a = editable(id); saveEpisode(a, { disabled: undefined, disabledNote: undefined }); return `${id} geri alındı`; }
function unpin(id) { const a = editable(id); saveEpisode(a, { publishAt: undefined }); return `${id} kuyruğa döndü`; }
function addNote(id, text) {
  text = String(text || '').trim().slice(0, 2000);
  if (!text) throw new Error('not boş');
  const notes = readJson(NOTES, {});
  (notes[id] ||= []).push({ at: new Date().toISOString(), text, done: false });
  fs.mkdirSync(path.dirname(NOTES), { recursive: true });
  fs.writeFileSync(NOTES, JSON.stringify(notes, null, 2) + '\n');
  return 'not eklendi';
}
function toggleNote(id, i) {
  const notes = readJson(NOTES, {});
  const n = notes[id]?.[i];
  if (!n) throw new Error('not yok');
  n.done = !n.done;
  fs.writeFileSync(NOTES, JSON.stringify(notes, null, 2) + '\n');
  return n.done ? 'not tamamlandı' : 'not yeniden açıldı';
}

// ——— git ———
const git = a => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
const TRACKED = ['episodes', 'state/notes.json'];
function gitState() {
  const r = git(['status', '--porcelain', '--', ...TRACKED]);
  const files = r.stdout.split('\n').filter(Boolean).map(l => l.slice(3));
  return { pending: files.length, files };
}
function publish(message) {
  const st = gitState();
  if (!st.pending) return 'gönderilecek değişiklik yok';
  const add = git(['add', '--', ...TRACKED.filter(p => fs.existsSync(path.join(root, p)))]);
  if (add.status) throw new Error(add.stderr);
  const msg = `Takvim: ${message || st.files.map(f => path.basename(f, '.json')).join(', ')}`;
  const c = git(['commit', '-m', msg, '--', ...TRACKED.filter(p => fs.existsSync(path.join(root, p)))]);
  if (c.status) throw new Error(c.stderr || c.stdout);
  const pull = git(['pull', '--rebase', '--autostash']);
  if (pull.status) throw new Error('git pull: ' + pull.stderr);
  const push = git(['push']);
  if (push.status) throw new Error('git push: ' + push.stderr);
  return `gönderildi: ${msg}`;
}

// ——— küçük resim ve video ———
function thumb(id) {
  const ep = loadEpisodes().find(e => e.id === id);
  const v = ep && videoOf(ep);
  if (!v) return null;
  fs.mkdirSync(THUMBS, { recursive: true });
  const out = path.join(THUMBS, `${id}.jpg`);
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(v).mtimeMs) return out;
  const r = spawnSync(ffmpegPath, ['-y', '-loglevel', 'error', '-ss', String(ep.coverAt || 0), '-i', v, '-frames:v', '1', '-vf', 'scale=360:-2', '-q:v', '4', out]);
  return r.status === 0 && fs.existsSync(out) ? out : null;
}
function sendFile(req, res, file, type) {
  const size = fs.statSync(file).size;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (m) {
    const start = m[1] ? Number(m[1]) : 0, end = m[2] ? Number(m[2]) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    fs.createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  }
}

// ——— sunucu ———
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(ok => { let s = ''; req.on('data', d => (s += d)); req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch { ok({}); } }); });
const ACTIONS = {
  move: b => move(b.id, b.key, b.fromKey),
  remove: b => remove(b.id),
  restore: b => restore(b.id),
  unpin: b => unpin(b.id),
  note: b => addNote(b.id, b.text),
  toggleNote: b => toggleNote(b.id, b.index),
  publish: b => publish(b.message),
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.html')));
    }
    if (req.method === 'GET' && url.pathname === '/api/plan') return json(res, 200, buildPlan({ days: Number(url.searchParams.get('days') || 35) }));
    let m;
    if (req.method === 'GET' && (m = /^\/thumb\/(\w+)\.jpg$/.exec(url.pathname))) {
      const f = thumb(m[1]);
      if (!f) { res.writeHead(404); return res.end(); }
      return sendFile(req, res, f, 'image/jpeg');
    }
    if (req.method === 'GET' && (m = /^\/video\/(\w+)\.mp4$/.exec(url.pathname))) {
      const ep = loadEpisodes().find(e => e.id === m[1]);
      const v = ep && videoOf(ep);
      if (!v) { res.writeHead(404); return res.end(); }
      return sendFile(req, res, v, 'video/mp4');
    }
    if (req.method === 'POST' && (m = /^\/api\/(\w+)$/.exec(url.pathname)) && ACTIONS[m[1]]) {
      const msg = ACTIONS[m[1]](await body(req));
      return json(res, 200, { ok: true, message: msg });
    }
    res.writeHead(404); res.end();
  } catch (e) {
    json(res, 400, { ok: false, error: String(e.message || e) });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Takvim: http://127.0.0.1:${PORT}`));

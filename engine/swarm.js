// "Bir arada olsa" (sürü) şablonu: tek bir canlıdan milyarlarcasına, kamera logaritmik geri çekilir.
// Halı; kare, saha, il sınırı ya da batıdan doğuya taranan ülke şeklini alır. Referanslar gerçek ölçekli,
// teknik çizim çizgisiyle çizilir. Haritalar: Natural Earth + OSM, resmî alanlara normalize (engine/geo).
import { W, H, ease, seg, lerp, spring, mulberry32 } from './core.js';
import { C, F, setFont, wrap, revealText, inOut, grain } from './tower.js';
import { ANT_CARD, drawAnt } from './creatures.js';
import { buildSwarmTimeline, countAt, stopAt, cameraScale, carpetGeom, refBox, floodCamera, shapeStop, shapeProgress } from './swarm_core.js';
import { GEO } from './geo/shapes.js';

const CREATURES = { ant: { card: ANT_CARD, draw: drawAnt } };
const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

// Hücre (i,j) için tohumlu karma: yön, kayma, yürüme fazı. Döşeme dönemi 256 hücre.
const PERIOD = 256;
function cellHash(i, j) {
  const a = ((i % PERIOD) + PERIOD) % PERIOD, b = ((j % PERIOD) + PERIOD) % PERIOD;
  const r = mulberry32((a * 73856093) ^ (b * 19349663) ^ 0x5bd1e995);
  return { dir: Math.floor(r() * 16), jx: (r() - 0.5) * 0.22, jy: (r() - 0.5) * 0.22, ph: r() };
}

// Ölçü etiketleri
function fmtLen(mm) {
  if (mm < 10) return `${nf1.format(mm)} mm`;
  if (mm < 1000) return `${mm < 100 ? nf1.format(mm / 10) : nf.format(mm / 10)} cm`;
  if (mm < 1e6) return `${mm < 1e4 ? nf1.format(mm / 1000) : nf.format(mm / 1000)} m`;
  return `${mm < 1e7 ? nf1.format(mm / 1e6) : nf.format(mm / 1e6)} km`;
}
function fmtArea(mm2) {
  const m2 = mm2 / 1e6;
  if (m2 < 1e5) return `${nf.format(m2)} m²`;
  const km2 = m2 / 1e6;
  const nf2 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
  return `${km2 < 1 ? nf2.format(km2) : km2 < 10 ? nf1.format(km2) : nf.format(km2)} km²`;
}
// Sayaç: milyondan sonrası kelimeyle (tr-TR): 285,6 milyon · 19,6 milyar · 218 trilyon · 20 katrilyon
// 10 milyona kadar rakamla (1.000.000), sonrası kelimeyle
const WORDS = [[1e15, 'katrilyon'], [1e12, 'trilyon'], [1e9, 'milyar'], [1e7, 'milyon', 1e6]];
function fmtCount(n) {
  const v = Math.max(1, n);
  for (const [lim, w, div] of WORDS) if (v >= lim) {
    const x = v / (div || lim);
    const s = x < 100 ? nf1.format(Math.round(x * 10) / 10) : nf.format(x);
    return { num: s, word: w };
  }
  return { num: nf.format(Math.round(v)), word: '' };
}

// ——— Referans çizimleri (teknik çizim) ———
function drawRef(ctx, ref, cx, cy, s, p, color) {
  const R = refBox(ref);
  const w = R.w * s, h = R.h * s;
  const x = cx - w / 2, y = cy - h / 2 + (ref.dy || 0) * s;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const per = 2 * (w + h);
  ctx.setLineDash([per * p, per * 2]);
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke(); };
  const circ = (r) => { ctx.setLineDash([Math.PI * 2 * r * p, Math.PI * 4 * r]); ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 1.5); ctx.stroke(); };
  switch (ref.kind) {
    case 'coin': circ(w / 2); ctx.lineWidth = 2; circ(w * 0.41); break;
    case 'card':
      rr(x, y, w, h, 3.18 * s);
      ctx.lineWidth = 2; rr(x + 0.1 * w, y + 0.32 * h, 0.14 * w, 0.2 * h, 1.2 * s);
      break;
    case 'plate': circ(w / 2); ctx.lineWidth = 2; circ(w * 0.36); break;
    case 'tile': rr(x, y, w, h, 0); ctx.lineWidth = 2; rr(x + 6 * s, y + 6 * s, w - 12 * s, h - 12 * s, 0); break;
    case 'bed':
      rr(x, y, w, h, 40 * s); ctx.lineWidth = 2;
      rr(x + 0.07 * w, y + 0.04 * h, 0.4 * w, 0.14 * h, 60 * s);
      rr(x + 0.53 * w, y + 0.04 * h, 0.4 * w, 0.14 * h, 60 * s);
      ctx.beginPath(); ctx.moveTo(x, y + 0.24 * h); ctx.lineTo(x + w, y + 0.24 * h); ctx.stroke();
      break;
    case 'room': {
      // duvarlar 150 mm, alt duvarda 900 mm kapı ve açılma yayı, üst duvarda pencere
      ctx.setLineDash([]);
      const t = 150 * s, iw = w - 2 * t, d = 900 * s, ix = x + t;
      const k = ease.enter(p);
      ctx.save(); ctx.beginPath(); ctx.rect(x - 2, y - 2, w + 4, (h + 4) * k); ctx.clip();
      ctx.fillRect(x, y, w, t); ctx.fillRect(x, y, t, h); ctx.fillRect(x + w - t, y, t, h);
      ctx.fillRect(x, y + h - t, t + iw * 0.62, t);
      ctx.fillRect(x + t + iw * 0.62 + d, y + h - t, w - (t + iw * 0.62 + d), t);
      ctx.restore();
      ctx.globalAlpha = k;
      ctx.fillStyle = C.paper; ctx.fillRect(ix + iw * 0.3, y + t * 0.3, iw * 0.4, t * 0.4);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ix + iw * 0.62 + d, y + h - t); ctx.lineTo(ix + iw * 0.62 + d, y + h - t - d); ctx.stroke();
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(ix + iw * 0.62 + d, y + h - t, d, Math.PI, Math.PI * 1.5); ctx.stroke();
      ctx.setLineDash([]);
      if (ref.person !== false) {
        // ölçek insanı (yukarıdan): omuz 450 mm, baş 200 mm — kapının hemen içinde
        const px = ix + iw * 0.62 + d / 2, py = y + h - t - 520 * s;
        ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
        ctx.beginPath(); ctx.ellipse(px, py + 30 * s, 225 * s, 125 * s, 0, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 100 * s, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
      }
      break;
    }
    case 'pitch': {
      // FIFA önerisi 105 × 68 m: orta çizgi, orta yuvarlak (9,15 m), ceza sahaları (16,5 × 40,32), kale alanları (5,5 × 18,32)
      ctx.lineWidth = 2.5;
      rr(x, y, w, h, 0);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y + h); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 9150 * s, 0, Math.PI * 2); ctx.stroke();
      for (const side of [0, 1]) {
        const bx = side ? x + w - 16500 * s : x, gx = side ? x + w - 5500 * s : x;
        rr(bx, cy - 20160 * s, 16500 * s, 40320 * s, 0);
        rr(gx, cy - 9160 * s, 5500 * s, 18320 * s, 0);
      }
      break;
    }
    case 'geo': {
      // harita sınırı: km → mm × ölçek
      const g = GEO[ref.key], k = 1e6 * s;
      const len = g.rings.reduce((a, r) => a + r.length, 0);
      ctx.setLineDash([]);
      ctx.lineWidth = ref.stroke || 2.5;
      ctx.beginPath();
      let drawn = 0;
      const lim = Math.floor(len * Math.min(1, p));
      for (const r of g.rings) {
        r.forEach(([px, py], i) => { if (drawn++ > lim) return; i ? ctx.lineTo(cx + px * k, cy + py * k) : ctx.moveTo(cx + px * k, cy + py * k); });
        if (p >= 1) ctx.closePath();
      }
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function makeSwarmRenderer(ep, canvas) {
  const tl = buildSwarmTimeline(ep);
  const ctx = canvas.getContext('2d');
  const cr = CREATURES[ep.creature];
  const D = tl.duration;
  const safe = { x0: 90, x1: 920, y0: 280, y1: 1420 };

  // ——— sprite atlası: 16 yön × 4 faz, 96 px ———
  const SP = 96, BOX = 1.35;
  const atlas = document.createElement('canvas');
  atlas.width = SP * 16; atlas.height = SP * 4;
  {
    const a = atlas.getContext('2d');
    for (let d = 0; d < 16; d++) for (let f = 0; f < 4; f++) {
      a.save(); a.translate(d * SP + SP / 2, f * SP + SP / 2); a.rotate((d / 16) * Math.PI * 2);
      cr.draw(a, cr.card, { phase: f / 4 }, SP / BOX); a.restore();
    }
  }
  // ——— doku karosu (bireysel yerleşimle birebir aynı) + mipmap zinciri ———
  const TC = 4;
  const tile = document.createElement('canvas');
  tile.width = tile.height = PERIOD * TC;
  {
    const a = tile.getContext('2d');
    for (let i = 0; i < PERIOD; i++) for (let j = 0; j < PERIOD; j++) {
      const h = cellHash(i, j), sz = TC * BOX;
      const x = (i + 0.5 + h.jx) * TC, y = (j + 0.5 + h.jy) * TC;
      a.drawImage(atlas, h.dir * SP, 0, SP, SP, x - sz / 2, y - sz / 2, sz, sz);
      a.fillStyle = cr.card.palette.body;
      a.beginPath(); a.ellipse(x, y, TC * 0.47, TC * 0.24, (h.dir / 16) * Math.PI * 2, 0, Math.PI * 2); a.fill();
    }
  }
  const mips = [tile];
  while (mips[mips.length - 1].width > 32) {
    const src = mips[mips.length - 1], m = document.createElement('canvas');
    m.width = m.height = src.width / 2;
    const mc = m.getContext('2d');
    mc.imageSmoothingEnabled = true; mc.imageSmoothingQuality = 'high';
    mc.drawImage(src, 0, 0, m.width, m.height);
    mips.push(m);
  }
  const mipFor = px => { let m = mips[0]; for (const c of mips) if (c.width >= px) m = c; return m; };

  // ——— yerleşim ———
  let qSize = 112;
  setFont(ctx, F.head(qSize));
  while (qSize > 64 && ep.question.some(q => ctx.measureText(q).width > safe.x1 - safe.x0)) { qSize -= 2; setFont(ctx, F.head(qSize)); }
  const qTop = 356, qBottom = qTop + qSize * 0.86 + (ep.question.length - 1) * qSize;
  const counterY = qBottom + 150, sayY = counterY + 76, SAY = 50;
  setFont(ctx, F.name(SAY));
  const sayLines = tl.stops.map(s => (s.say ? wrap(ctx, s.say, safe.x1 - safe.x0) : []));
  const maxLines = Math.max(1, ...sayLines.map(l => l.length));
  const zone = { cx: 505, top: sayY + (maxLines - 1) * SAY * 1.18 + 56, bottom: 1300 };
  zone.cy = (zone.top + zone.bottom) / 2;
  zone.w = 790; zone.h = (zone.bottom - zone.top) * 0.94;

  function drawText(t, n, landed) {
    setFont(ctx, F.mono(40));
    ctx.fillStyle = C.graphite; ctx.textAlign = 'left';
    ctx.fillText(ep.serial, safe.x0, 318);
    setFont(ctx, F.head(qSize));
    ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, safe.x0, qTop + qSize * 0.86 + i * qSize));
    const col = landed ? C.red : C.ink;
    ctx.save();
    if (landed) {
      const s = lerp(0.9, 1, spring(t - tl.hero.tl, 120, 24));
      ctx.translate(safe.x0, counterY); ctx.scale(s, s); ctx.translate(-safe.x0, -counterY);
    }
    const c = fmtCount(n);
    setFont(ctx, F.head(124));
    ctx.fillStyle = col; ctx.fillText(c.num, safe.x0, counterY);
    let x = safe.x0 + ctx.measureText(c.num).width + 18;
    setFont(ctx, F.name(56));
    const unit = c.word ? `${c.word} ${ep.unit}` : ep.unit;
    ctx.fillText(unit, x, counterY);
    ctx.restore();
    tl.stops.forEach((s, i) => {
      if (!sayLines[i].length) return;
      const next = tl.stops[i + 1];
      let p;
      if (i === 0) {
        p = t < (next ? next.t0 + 0.2 : tl.rw0) ? 1 - ease.exit(seg(t, next ? next.t0 : tl.rw0, 0.18)) : 0;
        if (t >= tl.rw1 - 0.55) p = ease.enter(seg(t, tl.rw1 - 0.55, 0.5));
      } else {
        // sayaç durağa varmadan 0,04 sn önce girer; sayım yeniden başlayınca 180 ms'de çıkar
        const tin = (s.hero ? s.tl : s.t1) - 0.04, tout = next ? next.t0 : tl.rw0;
        p = t < tin ? 0 : ease.enter(seg(t, tin, 0.45)) * (t > tout ? 1 - ease.exit(seg(t, tout, 0.18)) : 1);
      }
      setFont(ctx, F.name(SAY));
      sayLines[i].forEach((ln, k) => revealText(ctx, ln, safe.x0, sayY + k * SAY * 1.18, SAY, Math.max(0, Math.min(1, p * 1.0 - k * 0.0)), s.hero && t >= s.tl ? C.red : C.ink));
    });
  }

  // halı yolu (px): şekle göre
  function carpetPath(g, scale, cam) {
    const cx = zone.cx - (cam ? cam.cx * scale : 0), cy = zone.cy - (cam ? cam.cy * scale : 0);
    ctx.beginPath();
    if (g.kind === 'flood') {
      const k = 1e6 * scale, G = GEO[g.key];
      for (const r of G.rings) r.forEach(([px, py], i) => (i ? ctx.lineTo(cx + px * k, cy + py * k) : ctx.moveTo(cx + px * k, cy + py * k)));
      const ox = cx + g.origin[0] * k, oy = cy + g.origin[1] * k, rr = g.rKm * k;
      const tl0 = cx - G.bboxKm[0] * k / 2, tr0 = cx + G.bboxKm[0] * k / 2;
      return { x0: Math.max(ox - rr, tl0), x1: Math.min(ox + rr, tr0), y1: Math.min(oy + rr, cy + G.bboxKm[1] * k / 2), disk: [ox, oy, rr], top: oy - rr };
    }
    if (g.kind === 'geo') {
      const k = 1e6 * scale * g.f;
      for (const r of GEO[g.key].rings) r.forEach(([px, py], i) => (i ? ctx.lineTo(cx + px * k, cy + py * k) : ctx.moveTo(cx + px * k, cy + py * k)));
      return { x0: cx - g.w * scale / 2, x1: cx + g.w * scale / 2, y1: cy + g.h * scale / 2 };
    }
    if (g.kind === 'sweep') {
      const k = 1e6 * scale, G = GEO[g.key];
      for (const r of G.rings) r.forEach(([px, py], i) => (i ? ctx.lineTo(cx + px * k, cy + py * k) : ctx.moveTo(cx + px * k, cy + py * k)));
      const xmin = cx + G.sweep[0][0] * k, xcut = cx + g.xcutKm * k;
      return { x0: xmin, x1: xcut, y1: cy + G.bboxKm[1] * k / 2, clipX: xcut };
    }
    const w = g.w * scale, h = g.h * scale;
    ctx.rect(cx - w / 2, cy - h / 2, w, h);
    return { x0: cx - w / 2, x1: cx + w / 2, y1: cy + h / 2 };
  }

  function drawCarpet(t, n, scale, landedHero, cam) {
    const g = carpetGeom(tl, ep, n);
    const cell = ep.cellMM * scale;
    const cx = zone.cx, cy = zone.cy;
    const phaseT = (t / D) * Math.max(1, Math.round(D * 1.7));
    if (g.kind === 'square' && cell >= TC) {
      const side = g.w * scale;
      if (side > 6 && cell < 30) { ctx.fillStyle = 'rgba(28,27,24,0.10)'; ctx.fillRect(cx - side / 2, cy - side / 2, side, side); }
      const total = Math.max(1, Math.round(n));
      const R = Math.floor((Math.sqrt(total) - 1) / 2);
      const full = (2 * R + 1) ** 2;
      const drawOne = (i, j) => {
        const h = i === 0 && j === 0 ? { dir: 12, jx: 0, jy: 0, ph: 0 } : cellHash(i, j);
        const x = cx + (i + h.jx) * cell, y = cy + (j + h.jy) * cell;
        if (x < -cell || x > W + cell || y < -cell || y > H + cell) return;
        const ph = (phaseT + h.ph) % 1;
        if (cell >= 44) {
          ctx.save(); ctx.translate(x, y); ctx.rotate((h.dir / 16) * Math.PI * 2);
          cr.draw(ctx, cr.card, { phase: ph }, cell); ctx.restore();
        } else {
          const sz = cell * BOX;
          ctx.drawImage(atlas, h.dir * SP, Math.floor(ph * 4) * SP, SP, SP, x - sz / 2, y - sz / 2, sz, sz);
          if (cell < 10) {
            ctx.globalAlpha = Math.min(1, (10 - cell) / 6);
            ctx.fillStyle = cr.card.palette.body;
            ctx.beginPath(); ctx.ellipse(x, y, cell * 0.47, cell * 0.24, (h.dir / 16) * Math.PI * 2, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      };
      for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) drawOne(i, j);
      const rest = total - full;
      if (rest > 0) {
        const r = R + 1, ring = [];
        for (let k = -r; k < r; k++) ring.push([k, -r], [r, k], [-k, r], [-r, -k]);
        ring.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
        for (let k = 0; k < Math.min(rest, ring.length); k++) drawOne(ring[k][0], ring[k][1]);
      }
      return { x0: cx - side / 2, x1: cx + side / 2, y1: cy + side / 2, w: side, top: cy - side / 2, g };
    }
    // doku: şekle kırpılmış karo. Şekil türü değişirken eski şekil (aynı alanda) ilk %30'luk ilerlemede erir.
    const st = shapeStop(tl, n), prevSt = tl.stops[st.i - 1];
    const changing = prevSt && (prevSt.shape || 'square') !== (st.shape || 'square') && st.shape !== 'rect';
    const xu = changing ? Math.min(1, shapeProgress(tl, st, n) / 0.3) : 1;
    if (xu < 1) {
      const g0 = carpetGeom(tl, ep, n, prevSt);
      ctx.save(); ctx.globalAlpha = 1 - xu;
      carpetPath(g0, scale, null); ctx.clip();
      ctx.fillStyle = 'rgba(28,27,24,0.42)'; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    ctx.save();
    ctx.beginPath(); ctx.rect(safe.x0, zone.top - 30, safe.x1 - safe.x0, zone.bottom - zone.top + 40); ctx.clip();
    const b = carpetPath(g, scale, cam);
    ctx.clip();
    if (b.clipX != null) { ctx.beginPath(); ctx.rect(0, 0, b.clipX, H); ctx.clip(); }
    if (b.disk) { ctx.beginPath(); ctx.arc(b.disk[0], b.disk[1], b.disk[2], 0, Math.PI * 2); ctx.clip(); }
    const red = (g.kind === 'sweep' || g.kind === 'flood') && landedHero > 0;
    ctx.fillStyle = red ? C.red : 'rgba(28,27,24,0.10)';
    ctx.globalAlpha = (red ? landedHero : 1) * xu;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = (red ? 0.32 + 0.68 * (1 - landedHero) : 1) * xu;
    const tpx = Math.max(PERIOD * cell, 2);
    const src = mipFor(tpx);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (tpx >= 8) {
      const ox = cx - (cam ? cam.cx * scale : 0) - 0.5 * cell, oy = cy - (cam ? cam.cy * scale : 0) - 0.5 * cell;
      const i0 = Math.floor((b.x0 - ox) / tpx) - 1, i1 = Math.ceil((b.x1 - ox) / tpx) + 1;
      const j0 = Math.floor((zone.top - 200 - oy) / tpx) - 1, j1 = Math.ceil((zone.bottom + 200 - oy) / tpx) + 1;
      for (let a = i0; a <= i1; a++) for (let bb = j0; bb <= j1; bb++) ctx.drawImage(src, ox + a * tpx, oy + bb * tpx, tpx, tpx);
    } else {
      // karo birkaç pikselden küçükse: ortalama yoğunluk
      ctx.fillStyle = 'rgba(28,27,24,0.42)'; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    return { x0: b.x0, x1: b.x1, y1: b.y1, w: b.x1 - b.x0, top: b.top ?? cy - g.h * scale / 2, g };
  }

  // harita aşamalarında detay balonu kaybolur (haritanın doğusu/kenarları mesajın parçası)
  const firstGeo = tl.stops.find(s => s.shape === 'geo' || s.shape === 'sweep');
  function drawLoupe(t, scale, box) {
    const cell = ep.cellMM * scale;
    let a = Math.min(1, Math.max(0, (6 - cell) / 3));
    const mapKind = box.g.kind === 'geo' || box.g.kind === 'sweep';
    if (firstGeo) a *= t < tl.rw0 ? 1 - ease.exit(seg(t, firstGeo.t0, 0.4)) : (mapKind ? 0 : 1);
    if (a <= 0 || box.w < 60) return;
    const R = 132, inner = 34;
    const sx = Math.min(box.x1 - 24, zone.cx + 200), sy = Math.max(box.top + 24, zone.top + 30);
    const lx = Math.min(Math.max(box.x1 + 40, zone.cx + 160), 920 - R - 6), ly = zone.top + R + 4;
    const k = ease.enter(a);
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx + 10, sy - 10); ctx.lineTo(lx - R * 0.7 * k, ly + R * 0.7 * k); ctx.stroke();
    ctx.beginPath(); ctx.arc(lx, ly, R * k, 0, Math.PI * 2);
    ctx.fillStyle = C.paper; ctx.fill();
    ctx.save(); ctx.clip();
    const ph = (t / D) * Math.max(1, Math.round(D * 1.7));
    const cnt = Math.ceil((R * 2) / inner) + 2;
    for (let j = -cnt / 2; j <= cnt / 2; j++) for (let i = -cnt / 2; i <= cnt / 2; i++) {
      const h = cellHash(i + 7, j + 11);
      const x = lx + (i + h.jx) * inner, y = ly + (j + h.jy) * inner, sz = inner * BOX;
      ctx.drawImage(atlas, h.dir * SP, Math.floor(((ph + h.ph) % 1) * 4) * SP, SP, SP, x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.restore();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lx, ly, R * k, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawDimension(box) {
    const g = box.g;
    if (g.kind === 'geo' || g.kind === 'flood' || g.kind === 'sweep') {
      // alan: çerçeveli not (teknik çizimde alan, doğrusal ölçü çizgisine yazılmaz)
      const label = fmtArea(g.A);
      setFont(ctx, F.mono(44));
      const w = ctx.measureText(label).width + 40, x = zone.cx - w / 2, y = zone.bottom + 22;
      ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, 64);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x + 0.5, y + 0.5, w, 64);
      ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(label, zone.cx, y + 47); ctx.textAlign = 'left';
      return;
    }
    const y = zone.bottom + 26, x0 = Math.max(safe.x0, box.x0), x1 = Math.min(safe.x1, box.x1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    ctx.beginPath(); ctx.moveTo(x0, Math.min(box.y1 + 8, y)); ctx.lineTo(x0, y + 12);
    ctx.moveTo(x1, Math.min(box.y1 + 8, y)); ctx.lineTo(x1, y + 12); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (const x of [x0, x1]) { ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y - 10); ctx.stroke(); }
    let label;
    if (g.kind === 'square') label = fmtLen(g.w);
    else if (g.kind === 'rect') label = `${fmtLen(g.w)} × ${fmtLen(g.h)}`;
    else label = fmtArea(g.A);
    setFont(ctx, F.mono(44));
    ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText(label, (x0 + x1) / 2, y + 58);
    ctx.textAlign = 'left';
  }

  function drawGrid(t) {
    const GX = 48, drift = Math.max(1, Math.round((D * 10) / GX)) * GX;
    const off = ((t / D) * drift) % GX;
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = safe.x0 - GX + off; x <= safe.x1; x += GX) {
      if (x < safe.x0) continue;
      ctx.moveTo(Math.round(x) + 0.5, zone.top - 20); ctx.lineTo(Math.round(x) + 0.5, zone.bottom);
    }
    for (let y = zone.top - 20; y <= zone.bottom; y += GX) { ctx.moveTo(safe.x0, y + 0.5); ctx.lineTo(safe.x1, y + 0.5); }
    ctx.stroke();
  }

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    drawGrid(t);
    const n = countAt(tl, t);
    const cam = floodCamera(tl, ep, t, zone);
    const scale = cam ? cam.scale : cameraScale(tl, ep, t, zone);
    const landed = tl.hero && t >= tl.hero.tl && t < tl.rw0 + 0.3;
    const heroP = tl.hero ? ease.enter(seg(t, tl.hero.tl, 0.3)) * (t < tl.rw0 ? 1 : 1 - ease.exit(seg(t, tl.rw0, 0.35))) : 0;
    // referanslar: önce halının altındakiler, sonra (oda/harita) üstte
    const over = [];
    for (const s of tl.stops) {
      if (!s.ref) continue;
      const next = tl.stops[s.i + 1];
      const early = s.shape === 'flood';
      const vis = t >= (early ? s.t0 : s.t1) && t < (next ? next.t1 : tl.rw0 + 0.35);
      if (!vis) continue;
      const out = t > (next ? next.t0 : tl.rw0) ? 1 - ease.exit(seg(t, next ? next.t0 : tl.rw0, 0.35)) : 1;
      const p = ease.enter(seg(t, early ? s.t0 : s.hero ? s.tl : s.t1, early ? 1.2 : s.hero ? 0.45 : 0.55)) * out;
      if (['room', 'geo'].includes(s.ref.kind)) over.push({ s, p });
      else drawRef(ctx, s.ref, zone.cx, zone.cy, scale, p, C.ink);
    }
    const box = drawCarpet(t, n, scale, heroP, cam);
    ctx.save(); ctx.beginPath(); ctx.rect(safe.x0, zone.top - 30, safe.x1 - safe.x0, zone.bottom - zone.top + 40); ctx.clip();
    for (const { s, p } of over) if (p > 0) {
      const useCam = cam && s.shape === 'flood';
      drawRef(ctx, s.ref, zone.cx - (useCam ? cam.cx * scale : 0), zone.cy - (useCam ? cam.cy * scale : 0), scale, p, s.hero && s.ref.kind === 'room' ? C.red : C.ink);
    }
    ctx.restore();
    drawLoupe(t, scale, box);
    // ölçü: geri sarmada gizli, döngü dikişinden önce geri gelir
    const dimP = t < tl.rw0 ? 1 - ease.exit(seg(t, tl.rw0, 0.2)) : ease.enter(seg(t, tl.rw1 - 0.45, 0.4));
    if (dimP > 0.01) { ctx.save(); ctx.globalAlpha = dimP; drawDimension(box); ctx.restore(); }
    drawText(t, n, landed);
  }

  return { render, duration: D, timeline: tl };
}

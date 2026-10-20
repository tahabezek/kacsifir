// "Kule" şablonu: sayılar sütun olur, kamera logaritmik uzayda geri çekilir.
// Teknik çizim dili: kâğıt zemin, mürekkep, tek kırmızı kalem, mimari ölçü çizgileri.
import {
  W, H, ease, seg, lerp, spring, mulberry32, formatValue,
  buildTimeline, barHeight, cameraHeight, activeIndex, tallyPlan,
} from './core.js';

export const C = {
  paper: '#ECE5D5', ink: '#1C1B18', red: '#E0391C', graphite: '#8B8577',
  grid: 'rgba(28,27,24,0.07)', gridMajor: 'rgba(28,27,24,0.13)',
};
export const F = {
  head: s => `800 ${s}px Archivo`,
  name: s => `600 ${s}px Archivo`,
  mono: s => `500 ${s}px "IBM Plex Mono"`,
};

// ——— Yerleşim: sabit piksel değil, ölçüden türetilir ———
export function layout(ep, w = W, h = H) {
  const safe = { x0: 90, x1: 920, y0: 280, y1: 1420 };
  const n = ep.items.length;
  const colW = 84, gap = 36;
  const colsRight = safe.x1 - 40;
  const cols = ep.items.map((_, i) => colsRight - (n - i) * colW - (n - 1 - i) * gap);
  const down = ep.direction === 'down';
  const area = down ? { top: 660, bottom: 1330 } : { top: 640, bottom: 1330 };
  const ground = down ? area.top : area.bottom;
  const fill = 0.78 * (area.bottom - area.top);
  return {
    safe, cols, colW, down, area, ground, fill,
    ledger: { x: safe.x0, w: cols[0] - 44 - safe.x0 },
    chartX0: cols[0] - 64,
    serial: { x: safe.x0, y: 318 },
    question: { x: safe.x0, y: 356, w: safe.x1 - safe.x0 },
    tagY: down ? ground - 22 : ground + 56,
  };
}

// ——— Yardımcılar ———
export function setFont(ctx, f) { ctx.font = f; ctx.fontStretch = 'semi-condensed'; }

export function wrap(ctx, text, maxW) {
  // sayı ile ardından gelen kelime ayrılmaz ("31 yaşını", "8 dakika", "%0,19'u")
  const raw = text.split(' ');
  const words = [];
  for (let i = 0; i < raw.length; i++) {
    if (/^[%~]?\d[\d.,]*$/.test(raw[i]) && i + 1 < raw.length) { words.push(raw[i] + ' ' + raw[i + 1]); i++; }
    else words.push(raw[i]);
  }
  const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Maskeli yazı açılışı: satır, kendi kutusunun içinde aşağıdan kayarak gelir (karartma yok).
export function revealText(ctx, text, x, y, size, p, color, align = 'left') {
  if (p <= 0) return;
  const lh = size * 1.12;
  ctx.save();
  ctx.beginPath();
  const left = align === 'right' ? x - 2000 : align === 'center' ? x - 1000 : x - 4;
  ctx.rect(left, y - size * 0.98, 2004, lh + 2);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y + (1 - p) * lh);
  ctx.restore();
}

// Giriş/çıkış ilerlemesi: giriş 0,5 sn, çıkış 0,3 sn (girişin %60'ı)
export function inOut(t, tin, tout) {
  if (t < tin) return 0;
  let p = ease.enter(seg(t, tin, 0.5));
  if (tout != null && t > tout) p *= 1 - ease.exit(seg(t, tout, 0.3));
  return p;
}

// ——— Kâğıt dokusu: tohumlu, bir kez üretilir ———
let grainCanvas = null;
export function grain() {
  if (grainCanvas) return grainCanvas;
  const g = document.createElement('canvas');
  g.width = W; g.height = H;
  const c = g.getContext('2d');
  const r = mulberry32(20261020);
  for (let i = 0; i < 26000; i++) {
    const x = r() * W, y = r() * H, a = 0.025 + r() * 0.05, s = 0.8 + r() * 1.6;
    c.fillStyle = r() < 0.5 ? `rgba(28,27,24,${a})` : `rgba(255,252,240,${a * 1.4})`;
    c.fillRect(x, y, s, s);
  }
  grainCanvas = g;
  return g;
}

function hatch(ctx, x, y, w, h, color) {
  if (h < 1) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let k = -h; k < w + h; k += 11) { ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); }
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, Math.max(0, h - 2));
}

// Mimari ölçü çizgisi: dikey çizgi, uçlarda 45° çentik, üstte uzatma çizgisi.
function dimension(ctx, x, yA, yB, color, extTo) {
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(x, yA); ctx.lineTo(x, yB); ctx.stroke();
  for (const y of [yA, yB]) {
    ctx.beginPath(); ctx.moveTo(x - 11, y + 11); ctx.lineTo(x + 11, y - 11); ctx.stroke();
  }
  if (extTo != null) {
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 14, yB); ctx.lineTo(extTo, yB); ctx.stroke();
  }
}

// ——— Ana çizim ———
export function makeRenderer(ep, canvas) {
  const tl = buildTimeline(ep);
  const L = layout(ep);
  const ctx = canvas.getContext('2d');
  const D = tl.duration;
  // Dikey ızgara kayması: döngü dikişinde tam bir aralık katı olacak şekilde
  const GX = 48, driftPx = Math.max(1, Math.round((D * 10) / GX)) * GX;

  function worldToY(v, scale) { return L.down ? L.ground + v * scale : L.ground - v * scale; }

  function drawGrid(t, scale) {
    // Dikey çizgiler: sürekli sağa akan çizim kâğıdı (doğrusal, sürekli döngü)
    const off = ((t / D) * driftPx) % GX;
    const top = L.down ? L.ground : L.area.top - 40, bot = L.down ? L.area.bottom + 40 : L.ground;
    ctx.lineWidth = 1;
    ctx.strokeStyle = C.grid;
    ctx.beginPath();
    for (let x = L.safe.x0 - GX + off; x <= L.safe.x1; x += GX) {
      if (x < L.safe.x0) continue;
      ctx.moveTo(Math.round(x) + 0.5, top); ctx.lineTo(Math.round(x) + 0.5, bot);
    }
    ctx.stroke();
    // Yatay çizgiler: dünyaya bağlı, ondalık katmanlar ölçeğe göre belirip kaybolur
    const pxPerUnit = scale;
    const target = 70; // hedef aralık px
    const d = Math.pow(10, Math.floor(Math.log10(target / pxPerUnit)));
    for (const [step, base] of [[d, 0.0], [d * 10, 1]]) {
      const spacing = step * pxPerUnit;
      const a = Math.min(1, Math.max(0, (spacing - 14) / 90)) * (base ? 1 : 0.8);
      if (a <= 0.01) continue;
      ctx.strokeStyle = base ? `rgba(28,27,24,${0.13 * a})` : `rgba(28,27,24,${0.07 * a})`;
      ctx.beginPath();
      const span = L.area.bottom - L.area.top + 40;
      for (let k = 1; k * spacing < span; k++) {
        const y = Math.round(L.down ? L.ground + k * spacing : L.ground - k * spacing) + 0.5;
        ctx.moveTo(L.safe.x0, y); ctx.lineTo(L.safe.x1, y);
      }
      ctx.stroke();
    }
  }

  // Zemin cetveli yalnızca grafik bölgesinin altında: sol taraftaki defter güvenli alanın sonuna kadar iner.
  function drawGround() {
    const x0 = L.chartX0;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, L.ground); ctx.lineTo(L.safe.x1, L.ground); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0, x = x0; x <= L.safe.x1; i++, x += 24) {
      const len = i % 5 === 0 ? 18 : 9;
      const y0 = L.ground, y1 = L.down ? L.ground - len : L.ground + len;
      ctx.moveTo(x + 0.5, y0); ctx.lineTo(x + 0.5, y1);
    }
    ctx.stroke();
  }

  function questionSize() {
    let size = 112;
    setFont(ctx, F.head(size));
    while (size > 76 && ep.question.some(q => ctx.measureText(q).width > L.question.w)) {
      size -= 2; setFont(ctx, F.head(size));
    }
    return size;
  }

  function drawQuestion() {
    setFont(ctx, F.mono(40));
    ctx.fillStyle = C.graphite; ctx.textAlign = 'left';
    ctx.fillText(ep.serial, L.serial.x, L.serial.y);
    // Soru: kare 0'dan itibaren ekranda, hiç kıpırdamaz
    const size = questionSize();
    setFont(ctx, F.head(size));
    ctx.fillStyle = C.ink;
    ep.question.forEach((q, i) => ctx.fillText(q, L.question.x, L.question.y + size * 0.86 + i * size * 1.0));
  }

  // Defter satırlarının yerleşimi: bir kez hesaplanır, satırlar sonradan yeniden dizilmez.
  // Alana sığmazsa bütün ölçüler birlikte küçülür (k).
  let rows = null;
  function ledgerRows() {
    if (rows) return rows;
    const limit = L.safe.y1 - 10;
    const qs = questionSize();
    const top = Math.max(L.question.y + qs * 0.86 + (ep.question.length - 1) * qs + 64, L.down ? L.ground + 40 : 0);
    // Kahramanın açıklaması (kicker) bir sonraki satırla aynı yuvayı paylaşır:
    // açıklama, sonraki öğe girmeden 0,35 sn önce çıkar.
    for (let k = 1; k >= 0.7; k -= 0.02) {
      rows = []; let y = top;
      const nameS = Math.max(44, Math.round(44 * k)), kickS = 46;
      let slotEnd = 0;
      tl.items.forEach((it, i) => {
        const big = !!it.hero;
        let numSize = Math.round((big ? 132 : 88) * k);
        // sayaç büyürken alabileceği en geniş metin bile defter genişliğine sığmalı
        const from = i === 0 ? it.value * tl.startFrac : tl.items[i - 1].value;
        // Önce birim sayının yanına sığar mı? Sığmazsa sayı küçülmez, birim alt satıra iner;
        // sayının kendisi de sığmıyorsa ancak o zaman küçülür.
        let widest = 0, widestNum = 0;
        for (let s = 0; s <= 48; s++) {
          const v = Math.exp(lerp(Math.log(from), Math.log(it.value), s / 48));
          const f = formatValue(v, ep.format);
          setFont(ctx, F.head(numSize));
          const w1 = ctx.measureText(f.num).width;
          const uS = Math.max(44, Math.round(numSize * 0.42));
          setFont(ctx, F.name(uS));
          widestNum = Math.max(widestNum, w1);
          widest = Math.max(widest, w1 + uS * 0.3 + ctx.measureText(f.unit).width);
        }
        let unitBelow = false;
        if (widest > L.ledger.w) {
          unitBelow = true;
          if (widestNum > L.ledger.w) numSize = Math.max(56, Math.floor(numSize * L.ledger.w / widestNum));
        }
        setFont(ctx, F.name(nameS));
        const nameLines = wrap(ctx, `${it.tag} · ${it.name}`, L.ledger.w);
        setFont(ctx, F.name(kickS));
        const kick = big && it.kicker ? wrap(ctx, it.kicker, L.ledger.w) : [];
        const next = tl.items[i + 1];
        const r = { y, nameLines, numSize, nameS, kickS, kick, unitBelow, kickOut: next ? next.t0 - 0.35 : tl.rw0 };
        y += nameLines.length * nameS * 1.12 + 6;
        r.numY = y + numSize * 0.8;
        y += numSize * 0.86 + 22;
        if (unitBelow) { const uS = Math.max(44, Math.round(numSize * 0.42)); r.unitY = y + uS * 0.62; y += uS * 1.05; }
        r.kickY = y;
        const own = y + 8;
        slotEnd = kick.length ? y + kick.length * kickS * 1.2 + 26 : 0;
        y = own;
        rows.push(r);
        if (slotEnd) r.slotEnd = slotEnd;
      });
      y = Math.max(y, slotEnd);
      if (y <= limit) break;
    }
    return rows;
  }

  function drawLedger(t) {
    const R = ledgerRows();
    tl.items.forEach((it, i) => {
      const r = R[i];
      // A satırı döngü boyunca ekranda kalır; diğerleri geri sarmada çıkar
      const first = i === 0;
      const tout = first ? null : tl.rw0;
      r.nameLines.forEach((ln, k) => {
        const p = first ? 1 : inOut(t, it.t0 + 0.07 * k, tout);
        setFont(ctx, F.name(r.nameS));
        revealText(ctx, ln, L.ledger.x, r.y + r.nameS + k * r.nameS * 1.14, r.nameS, p, C.graphite);
      });
      // sayaç: sütunun o anki yüksekliğini okur (A satırı geri sarmada da sayar)
      let shown;
      if (first) shown = barHeight(tl, 0, t);
      else shown = t >= it.t1 ? it.value : barHeight(tl, i, Math.min(t, it.t1));
      if (!(shown > 0)) shown = it.value;
      const { num, unit } = formatValue(shown, ep.format);
      const pNum = first ? 1 : inOut(t, it.t0 + 0.08, tout);
      const landed = it.hero && t >= it.tl;
      const col = landed ? C.red : C.ink;
      ctx.save();
      if (landed) {
        // vuruş anında sayı büyük yazı yayıyla (120/24) yerine oturur
        const s = lerp(0.9, 1, spring(t - it.tl, 120, 24));
        ctx.translate(L.ledger.x, r.numY);
        ctx.scale(s, s);
        ctx.translate(-L.ledger.x, -r.numY);
      }
      setFont(ctx, F.head(r.numSize));
      const nw = ctx.measureText(num).width;
      revealText(ctx, num, L.ledger.x, r.numY, r.numSize, pNum, col);
      const uS = Math.max(44, Math.round(r.numSize * 0.42));
      setFont(ctx, F.name(uS));
      if (r.unitBelow) revealText(ctx, unit, L.ledger.x, r.unitY, uS, pNum, col);
      else revealText(ctx, unit, L.ledger.x + nw + uS * 0.3, r.numY, uS, pNum, col);
      ctx.restore();
      // kicker: vuruştan 0,6 sn sonra, satır satır
      r.kick.forEach((ln, k) => {
        const p = inOut(t, it.tl + 0.6 + 0.08 * k, r.kickOut);
        setFont(ctx, F.name(r.kickS));
        revealText(ctx, ln, L.ledger.x, r.kickY + r.kickS + k * r.kickS * 1.2, r.kickS, p, C.ink);
      });
    });
  }

  function drawColumns(t, scale) {
    const a = activeIndex(tl, t);
    tl.items.forEach((it, i) => {
      const hw = barHeight(tl, i, t);
      if (hw <= 0) return;
      const x = L.cols[i];
      let hp = hw * scale;
      if (hp < 2) hp = 2; // görünmez kadar küçük: kıl payı çizgi
      const y = L.down ? L.ground : L.ground - hp;
      const isRed = it.hero && t >= it.tl;
      if (i === a || isRed) {
        ctx.fillStyle = C.ink;
        ctx.fillRect(x, y, L.colW, hp);
        if (isRed) {
          // kırmızı mürekkep tabandan yukarı dolar (250 ms)
          const f = ease.enter(seg(t, it.tl, 0.25));
          const fh = hp * f;
          ctx.fillStyle = C.red;
          if (L.down) ctx.fillRect(x, L.ground, L.colW, fh);
          else ctx.fillRect(x, L.ground - fh, L.colW, fh);
        }
      } else {
        hatch(ctx, x, y, L.colW, hp, C.ink);
      }
      if ((i === a || isRed) && hp > 30 && t < tl.rw0) {
        // ölçü çentikleri (kâğıt rengi), her 5'te bir tam genişlik
        const tp = tallyPlan(tl, ep, i);
        const k = Math.floor(tp.n * seg(t, tp.start, tp.dur) + 1e-6);
        const gap = tp.stepBase * scale;
        if (k > 0 && gap >= 4) {
          ctx.strokeStyle = C.paper; ctx.lineWidth = 3;
          ctx.beginPath();
          for (let j = 1; j <= k; j++) {
            if (j * tp.stepBase > hw) break; // geri sarmada sütunun dışına taşmasın
            const yy = Math.round(worldToY(j * tp.stepBase, scale)) + 0.5;
            const inset = j % 5 === 0 ? 0 : 22;
            ctx.moveTo(x + inset, yy); ctx.lineTo(x + L.colW - inset, yy);
          }
          ctx.stroke();
        }
      }
      if (i === a) {
        const top = L.down ? L.ground + hp : L.ground - hp;
        const dimCol = isRed ? C.red : C.ink;
        dimension(ctx, x - 24, L.ground, top, dimCol, x + L.colW);
        // ölçüm taraması: her 2 vuruşta tabandan tepeye bir grafit çizgi (vuruşa kilitli döngü)
        const per = tl.beat * 2;
        const ph = ((t % per) + per) % per / per;
        const sy = lerp(L.ground, top, ease.state(Math.min(1, ph / 0.75)));
        ctx.strokeStyle = 'rgba(139,133,119,0.55)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 36, sy); ctx.lineTo(x + L.colW + 14, sy); ctx.stroke();
      }
    });
    // etiketler (A, B, C)
    setFont(ctx, F.mono(44));
    tl.items.forEach((it, i) => {
      const vis = barHeight(tl, i, t) > 0;
      if (!vis) return;
      const p = i === 0 ? 1 : inOut(t, it.t0, null);
      const isRed = it.hero && t >= it.tl;
      revealText(ctx, it.tag, L.cols[i] + L.colW / 2, L.tagY, 44, p,
        isRed ? C.red : i === activeIndex(tl, t) ? C.ink : C.graphite, 'center');
    });
  }

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    const camH = cameraHeight(tl, t);
    const scale = L.fill / camH;
    drawGrid(t, scale);
    drawColumns(t, scale);
    drawGround();
    drawQuestion();
    drawLedger(t);
  }

  return { render, duration: D, timeline: tl, layout: L };
}

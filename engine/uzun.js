// Uzun video (16:9) çizimi. Kipler: kanca (film + iki büyük sayı), liste ("düello defteri"), düello (ortada dikey film,
// solda A, sağda B). Baskın yön sola: çıkan her şey sola gider, gelen sağdan girer. Geçişte satırın A/B yazıları
// kesmenin öbür tarafına taşınır ve yan etiketler olur.
import { ease, seg, lerp, clamp01, mulberry32 } from './core.js';
import { C, F, setFont } from './tower.js';

const W = 1920, H = 1080;
// dikey film: alttaki boş Instagram güvenli alanı (y > 1560) kırpılır, kalan tam yüksekliğe büyür (yazılar 1,25 kat)
const SY = 30, SH = 1530, FW = 1080 * (H / SH), FX = (W - FW) / 2;
const ENTER = 1.0, EXIT = 0.45;
const PL = { x: 110, w: 410 }, PR = { x: W - 110 - 410, w: 410 };
const ROW0 = 330, ROWH = 92, NUMX = 120, AX = 210, BX = 1010, ROWW = 760;

function wrapLines(ctx, text, maxW) {
  const out = []; let cur = '';
  for (const w of text.split(' ')) { const s = cur ? cur + ' ' + w : w; if (ctx.measureText(s).width > maxW && cur) { out.push(cur); cur = w; } else cur = s; }
  if (cur) out.push(cur);
  return out;
}

export async function makeUzunRenderer(plan, canvas, opt = {}) {
  const ctx = canvas.getContext('2d');
  // filmler: her bölüm kendi 1080×1920 tuvalinde, kendi çizicisiyle (aynı t → aynı kare)
  const scenes = {};
  for (const [id, e] of Object.entries(plan.eps)) {
    const ep = await (await fetch('../' + e.file)).json();
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
    const name = 'make' + ep.template[0].toUpperCase() + ep.template.slice(1) + 'Renderer';
    const mod = await import(`./scenes/${ep.template}.js`);
    scenes[id] = { canvas: c, r: await mod[name](ep, c), dur: null };
    scenes[id].dur = scenes[id].r.duration;
  }
  const grain = (() => {
    const g = document.createElement('canvas'); g.width = W; g.height = H;
    const c = g.getContext('2d'), r = mulberry32(20261027);
    for (let i = 0; i < 36000; i++) { const x = r() * W, y = r() * H, a = 0.025 + r() * 0.05, s = 0.8 + r() * 1.6; c.fillStyle = r() < 0.5 ? `rgba(28,27,24,${a})` : `rgba(255,252,240,${a * 1.4})`; c.fillRect(x, y, s, s); }
    return g;
  })();
  const L = plan.lines, duels = plan.film.filter(f => f.kind === 'duel'), hook = plan.film.find(f => f.kind === 'hook');
  const word = (id, i) => L[id].words[Math.min(i, L[id].words.length - 1)]?.t0 ?? L[id].t0;
  // satırın ekrandaki hâli: k satırı şu an vurgulu mu, bitti mi
  const rowAt = t => { let k = -1; for (const r of plan.rows) if (t >= r.t) k = r.k; return k; };

  function scene(id, st) {
    const s = scenes[id];
    s.r.render(Math.max(0, Math.min(s.dur - 1 / 30, st)));
    return s.canvas;
  }
  function drawFilm(id, st, dx, alpha, z = 1) {
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.drawImage(scene(id, st), 0, SY, 1080, SH, FX + dx - FW * (z - 1) / 2, -H * (z - 1) / 2, FW * z, H * z);
    ctx.restore();
  }
  // mimari ölçü çizgisi (yatay): uçlarda 45° çentik
  function dim(x0, x1, y, color, lw = 3) {
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (const x of [x0, x1]) { ctx.beginPath(); ctx.moveTo(x - 9, y + 9); ctx.lineTo(x + 9, y - 9); ctx.stroke(); }
  }
  // sürekli döngü: altta sola akan cetvel (doğrusal, sürekli hareket)
  function ruler(t, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    const y = 1012, off = (t * 36) % 120;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y);
    for (let x = -off; x < W + 120; x += 24) { const big = Math.round((x + off) / 24) % 5 === 0; ctx.moveTo(x, y); ctx.lineTo(x, y + (big ? 22 : 11)); }
    ctx.stroke(); ctx.restore();
  }
  function fitFont(text, maxW, size, weight = F.name) {
    let s = size; setFont(ctx, weight(s));
    while (ctx.measureText(text).width > maxW && s > 24) { s -= 1; setFont(ctx, weight(s)); }
    return s;
  }

  // ——— Liste ("düello defteri") ———
  function drawList(t, phase) {
    // phase: { dx (tüm satırlar), alpha, stagger0 (giriş başlangıcı, satır başına 70 ms), carry: k (taşınan satır gizlenir) }
    const cur = rowAt(t), doneUpTo = (() => { let d = -1; for (const x of plan.toList) if (x.done != null && t >= x.t) d = x.done; return d; })();
    ctx.textBaseline = 'alphabetic';
    const head = (dx, a) => {
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left';
      setFont(ctx, F.mono(28)); ctx.fillStyle = C.graphite; ctx.fillText(plan.serial, NUMX + dx, 112);
      setFont(ctx, F.head(76)); ctx.fillStyle = C.ink; ctx.fillText('Hangisi daha şaşırtıcı?', NUMX + dx, 198);
      ctx.restore();
    };
    head(phase.dx(0), phase.alpha(0) * (1 - (phase.noHead || 0)));
    // sütun başlıkları A / B: "hangisinin" sözcüğünde gelir, sonra kalır
    { const u = ease.enter(seg(t, plan.intro.cols, 0.6)), a = phase.alpha(0) * u;
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left'; setFont(ctx, F.head(34)); ctx.fillStyle = C.ink;
        ctx.fillText('A', AX + phase.dx(0) + 30 * (1 - u), ROW0 - 62); ctx.fillText('B', (phase.bx ?? BX) + phase.dx(0) + 30 * (1 - u), ROW0 - 62); ctx.restore(); } }
    plan.duels.forEach((d, k) => {
      if (phase.carry === k) return;
      const a = phase.alpha(k + 1), dx = phase.dx(k + 1);
      if (a <= 0.001) return;
      const y = ROW0 + k * ROWH;
      const state = k <= doneUpTo ? 'done' : k === cur ? 'cur' : 'next';
      // girişte sözcüğe kilitli vurgu: "7 düello" → numaralar, "14 hikâye" → A sonra B sütunu
      const I = plan.intro, pre = t < plan.rows[0].t;
      const r = plan.rows.find(r => r.k === k);
      const cNum = state === 'cur' || (pre && t >= I.seven) ? C.ink : C.graphite;
      const cA = state === 'next' ? (pre && t >= I.fourteen ? C.ink : C.graphite) : C.ink;
      const cB = state === 'next' ? (pre && t >= I.fourteen + 0.45 ? C.ink : C.graphite) : state === 'cur' && t < r.bAt ? C.graphite : C.ink;
      ctx.save(); ctx.globalAlpha = a * (state === 'done' ? 0.8 : 1);
      // biten düello: numaranın solunda mürekkep tik
      if (state === 'done') { ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(NUMX - 50 + dx, y - 12); ctx.lineTo(NUMX - 40 + dx, y - 2); ctx.lineTo(NUMX - 22 + dx, y - 26); ctx.stroke(); }
      setFont(ctx, F.mono(30)); ctx.fillStyle = cNum; ctx.textAlign = 'left';
      ctx.fillText(String(k + 1).padStart(2, '0'), NUMX + dx, y);
      ctx.fillStyle = cA;
      const bx = phase.bx ?? BX;
      // bitiş ekranında sütunlar daralır: bütün satırlar aynı boyda kalsın diye en dar satırın boyu kullanılır
      const sz = (txt, w) => { if (bx === BX) return fitFont(txt, w, 38); const m = Math.min(...plan.duels.map(x => fitFont(txt === d.a ? x.a : x.b, w, 38))); setFont(ctx, F.name(m)); return m; };
      sz(d.a, bx - AX - 70); ctx.fillText(d.a, AX + dx, y);
      setFont(ctx, F.mono(30)); ctx.fillStyle = C.graphite; ctx.fillText('/', bx - 52 + dx, y);
      ctx.fillStyle = cB; sz(d.b, bx === BX ? ROWW : 400); ctx.fillText(d.b, bx + dx, y);
      ctx.restore();
      if (state === 'cur') {
        const r = plan.rows.find(r => r.k === k), u = ease.state(seg(t, r.t, 0.8));
        if (u > 0) { ctx.save(); ctx.globalAlpha = a; dim(NUMX + dx, lerp(NUMX, 1800, u) + dx, y + 26, C.ink); ctx.restore(); }
      }
    });
  }
  // satırın A/B yazılarının konumu (liste) ve yan etiket konumu (düello) arasında taşıma
  function carry(k, u, t) {
    const d = plan.duels[k], y = ROW0 + k * ROWH;
    ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.ink;
    for (const [txt, x0, side] of [[d.a, AX, PL], [d.b, BX, PR]]) {
      const s0 = (() => { const s = fitFont(txt, ROWW - 40, 38); return s; })();
      setFont(ctx, F.head(50)); const lines = wrapLines(ctx, txt, side.w);
      const s = lerp(s0, 50, u);
      setFont(ctx, (u < 0.5 ? F.name : F.head)(s));
      const x = lerp(x0, side.x, u), yy = lerp(y, 470, u);
      if (u < 1) ctx.fillText(txt, x, yy);
      else lines.forEach((ln, i) => ctx.fillText(ln, x, yy + i * 62));
    }
    ctx.restore();
  }

  // ——— Düello yan panelleri ———
  function panels(f, t, dx, alpha, labelsToo = true) {
    const d = plan.duels[f.k], bOn = ease.state(seg(t, f.b - 0.2, 0.5));
    ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    for (const [side, letter, txt, on] of [[PL, 'A', d.a, 1 - bOn], [PR, 'B', d.b, bOn]]) {
      const a = lerp(0.42, 1, on);
      ctx.globalAlpha = alpha;
      setFont(ctx, F.mono(28)); ctx.fillStyle = C.graphite;
      ctx.fillText(`DÜELLO ${f.k + 1} / ${plan.duels.length}`, side.x + dx, 200);
      ctx.globalAlpha = alpha * a; ctx.fillStyle = C.ink;
      setFont(ctx, F.head(150)); ctx.fillText(letter, side.x + dx, 440);
      if (labelsToo) { setFont(ctx, F.head(58)); wrapLines(ctx, txt, side.w).forEach((ln, i) => ctx.fillText(ln, side.x + dx, 540 + i * 70)); }
    }
    // ilerleme: 7 parça; geçerli parça film boyunca doğrusal dolar
    ctx.globalAlpha = alpha;
    const n = plan.duels.length, sw = (PL.w - (n - 1) * 10) / n;
    for (let i = 0; i < n; i++) {
      const x = PL.x + dx + i * (sw + 10), y = 960;
      ctx.fillStyle = C.graphite; ctx.globalAlpha = alpha * 0.3; ctx.fillRect(x, y, sw, 8);
      const p = i < f.k ? 1 : i > f.k ? 0 : clamp01((t - f.T0) / (f.T1 - f.T0));
      ctx.globalAlpha = alpha; ctx.fillStyle = C.ink; ctx.fillRect(x, y, sw * p, 8);
    }
    ctx.restore();
  }

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (opt.thumb) { ctx.scale(canvas.width / W, canvas.height / H); return thumb(); }
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);

    const f = plan.film.find(f => t >= (f.enter ?? f.T0) && t < f.T1 + EXIT + 0.01);
    if (f && f.kind === 'hook') {
      const out = ease.exit(seg(t, f.T1, EXIT)), dx = -320 * out, a = 1 - out;
      // ilk 1,2 sn: panel 1,15x'ten 1,0x'e yaklaşır (kare 0'dan hareket)
      drawFilm(f.ep, f.s0 + Math.min(t, f.T1) - f.T0, dx, a, lerp(1.15, 1, ease.enter(seg(t, 0, 1.2))));
      // kancanın iki sayısı, ilgili kelimeye kilitli (okunacak öğe 0,04 sn önce)
      const n1 = 1, n2 = ease.enter(seg(t, 0.3, 0.6));
      ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      for (const [side, big, small, u] of [[PL, '40 g', 'bir ebabilin ağırlığı', n1], [PR, '10 ay', 'yere inmeden havada', n2]]) {
        ctx.globalAlpha = a * u; ctx.fillStyle = C.ink;
        setFont(ctx, F.head(140)); ctx.fillText(big, side.x + dx + 60 * (1 - u), 520);
        setFont(ctx, F.name(40)); ctx.fillStyle = C.graphite; ctx.fillText(small, side.x + dx + 60 * (1 - u), 590);
      }
      ctx.restore();
      // liste sağdan girer (toList[0])
      if (out > 0) listEntering(t, plan.toList[0]);
    } else if (f && f.kind === 'duel') {
      if (t < f.T0) {
        // giriş: satırlar sola çıkar, film sağdan gelir, satırın yazıları yan etiketlere taşınır
        const u = seg(t, f.enter, ENTER), ue = ease.enter(clamp01((u - 0.3) / 0.7)), ux = ease.exit(clamp01(u / 0.4));
        drawList(t, { dx: () => -260 * ux, alpha: () => 1 - ux });
        drawFilm(f.ep, f.s0 + t - f.T0, 420 * (1 - ue), ue);
        panels(f, t, 120 * (1 - ue), ue);
        ruler(t, 1 - ux);
      } else {
        const out = ease.exit(seg(t, f.T1, EXIT)), dx = -320 * out, a = 1 - out;
        drawFilm(f.ep, f.s0 + Math.min(t, f.T1) - f.T0, dx, a);
        panels(f, Math.min(t, f.T1), dx, a);
        if (out > 0) listEntering(t, plan.toList.find(x => x.done === f.k));
      }
    } else {
      // liste kipi (araya giren satırlar ve kapanış)
      const back = [...plan.toList].reverse().find(x => t >= x.t);
      listEntering(t, back);
      ruler(t, back ? ease.enter(seg(t, back.t + EXIT, ENTER)) : 1);
      if (t >= plan.endscreen) endscreen(t);
    }
    ctx.globalAlpha = 0.5; ctx.drawImage(grain, 0, 0); ctx.globalAlpha = 1;
  }
  // liste sağdan girer; satır başına 70 ms gecikme (toplam ≤ 500 ms)
  function listEntering(t, ev) {
    const t0 = ev ? ev.t + EXIT : 0;
    const u = i => ease.enter(seg(t, t0 + i * 0.07, ENTER));
    const endA = t >= plan.endscreen ? 1 - ease.state(seg(t, plan.endscreen, 0.8)) * 0.0 : 1;
    if (t >= plan.endscreen) { endscreenList(t); return; }
    drawList(t, { dx: i => 300 * (1 - u(i)), alpha: i => u(i) * endA });
  }
  // kapanış: liste sola küçülür, sağ yarı YouTube bitiş ekranı öğelerine kalır
  function endscreenList(t) {
    const u = ease.state(seg(t, plan.endscreen, 0.9));
    ctx.save();
    // sağ kenar ≤ 900 px: sağ yarı YouTube bitiş ekranı öğelerine kalır; ikinci başlık gizlenir
    const s = lerp(1, 0.85, u);
    ctx.translate(lerp(0, 60, u), lerp(0, 130, u)); ctx.scale(s, s);
    drawList(t, { dx: () => 0, alpha: () => 1, noHead: u, bx: lerp(BX, 650, u) });
    ctx.restore();
  }
  function endscreen(t) {
    const u = ease.enter(seg(t, plan.endscreen + 0.5, 0.8));
    ctx.save(); ctx.globalAlpha = u; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    setFont(ctx, F.head(64)); ctx.fillStyle = C.ink; ctx.fillText('Sence hangisi?', 120, 150);
    setFont(ctx, F.name(40)); ctx.fillStyle = C.graphite; ctx.fillText('Yorumlara düellonun numarasını', 120, 212); ctx.fillText('ve tarafını yaz: 7B gibi.', 120, 262);
    ctx.restore();
  }

  // ——— Kapak (1280×720, 1920×1080 düzleminde çizilir) ———
  function thumb() {
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    // tek güçlü imge: ebabil, 3 kat büyütülmüş (sahne düzleminde kuşun çevresi)
    const [id, st] = ['062', plan.eps['062'].hook + 1.6];
    ctx.drawImage(scene(id, st), 60, 700, 720, 630, 900, 60, 1000, 875);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.ink;
    setFont(ctx, F.head(170));
    ['10 ay', 'yere', 'inmiyor'].forEach((s, i) => ctx.fillText(s, 80, 260 + i * 190));
    setFont(ctx, F.head(70)); ctx.fillStyle = C.red; ctx.fillText('+ 13 gerçek hikâye', 84, 900);
    ctx.globalAlpha = 0.5; ctx.drawImage(grain, 0, 0); ctx.globalAlpha = 1;
  }
  return { render };
}

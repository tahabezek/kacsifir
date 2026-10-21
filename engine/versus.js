// "Hangisi daha şaşırtıcı?" şablonu: iki gerçek vaka, aynı ölçekte, sonunda yan yana kıyas ve oy sorusu.
// Sahneler: hook → A → B → kıyas → soru → döngü. Görsel dil: kâğıt, mürekkep, tek kırmızı (oran).
import { W, H, ease, seg, lerp, spring } from './core.js';
import { C, F, setFont, wrap, revealText, grain } from './tower.js';
import { drawActor } from './actor.js';

const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
const SAFE = { x0: 90, x1: 920 };

export function buildVersusTimeline(ep) {
  const beat = 60 / ep.bpm;
  const S = {};
  let cur = 0;
  for (const s of ep.scenes) { S[s.id] = { ...s, t0: cur * beat, t1: (cur + s.beats) * beat }; cur += s.beats; }
  const heroLand = S.compare.t0 + beat * (ep.compareLandBeat ?? 3);
  return { beat, S, duration: cur * beat, heroLand, silence0: heroLand - beat * (ep.silenceBeats ?? 0.8) };
}

export function versusCues(ep) {
  const tl = buildVersusTimeline(ep), S = tl.S;
  return {
    beat: tl.beat, duration: tl.duration, rw0: S.loop.t0, rw1: S.loop.t1,
    hero: { t1: tl.silence0, tl: tl.heroLand },
    grows: [{ t0: S.a.t0 + 0.6, t1: S.a.t1 - tl.beat * 2.5, hero: false }, { t0: S.b.t0 + 0.6, t1: S.b.t1 - tl.beat * 2.5, hero: false }],
    lands: [S.a.t0 + 0.05, S.b.t0 + 0.05, S.a.t1 - tl.beat * 2.5, S.b.t1 - tl.beat * 2.5, S.ask.t0 + 0.05],
    tallies: [],
  };
}

export function makeVersusRenderer(ep, canvas, actor) {
  const tl = buildVersusTimeline(ep);
  const ctx = canvas.getContext('2d');
  const D = tl.duration, S = tl.S;

  const enterP = (t, a, d = 0.5) => ease.enter(seg(t, a, d));
  const sceneP = (t, sc, lead = 0.3) => (t < sc.t0 ? 0 : ease.enter(seg(t, sc.t0, 0.5)) * (t > sc.t1 - lead ? 1 - ease.exit(seg(t, sc.t1 - lead, lead)) : 1));
  function lines(text, x, y, size, p, color, font = F.name, maxW = SAFE.x1 - SAFE.x0, lh = 1.18) {
    setFont(ctx, font(size));
    const L = wrap(ctx, text, maxW);
    L.forEach((ln, k) => revealText(ctx, ln, x, y + k * size * lh, size, Math.max(0, Math.min(1, p)), color));
    return L.length;
  }
  function grid(t) {
    const GX = 48, drift = Math.max(1, Math.round((D * 10) / GX)) * GX, off = ((t / D) * drift) % GX;
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = SAFE.x0 - GX + off; x <= SAFE.x1; x += GX) { if (x < SAFE.x0) continue; ctx.moveTo(Math.round(x) + 0.5, 700); ctx.lineTo(Math.round(x) + 0.5, 1330); }
    for (let y = 700; y <= 1330; y += GX) { ctx.moveTo(SAFE.x0, y + 0.5); ctx.lineTo(SAFE.x1, y + 0.5); }
    ctx.stroke();
  }
  function header(t) {
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite; ctx.fillText(ep.serial, SAFE.x0, 336);
    let size = 104; setFont(ctx, F.head(size));
    while (size > 64 && ep.title.some(q => ctx.measureText(q).width > SAFE.x1 - SAFE.x0)) { size -= 2; setFont(ctx, F.head(size)); }
    ctx.fillStyle = C.ink;
    ep.title.forEach((q, i) => ctx.fillText(q, SAFE.x0, 374 + size * 0.86 + i * size));
  }
  // A/B etiketi: kare içinde harf
  function badge(x, y, letter, p, color = C.ink) {
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p;
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(x, y - 62, 76, 76);
    setFont(ctx, F.head(64)); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(letter, x + 38, y); ctx.textAlign = 'left';
    ctx.restore();
  }
  // rota: soldan sağa ölçü çizgisi, üzerinde ilerleyen işaret, altında sayaçlar
  function route(t, sc, cfg, side) {
    const p = sceneP(t, sc);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p;
    badge(SAFE.x0, 740, side, enterP(t, sc.t0 + 0.05));
    lines(cfg.who, SAFE.x0 + 100, 726, 38, enterP(t, sc.t0 + 0.15), C.graphite, F.mono, SAFE.x1 - SAFE.x0 - 100);
    lines(cfg.say, SAFE.x0, 840, 52, enterP(t, sc.t0 + 0.3), C.ink);
    // ilerleme: sahnenin sonuna doğru tamamlanır (doğrusal = sürekli yol)
    const u = ease.state(seg(t, sc.t0 + 0.6, (sc.t1 - sc.t0) - 0.6 - tl.beat * 2.5));
    const y = 1120, x0 = SAFE.x0 + 10, x1 = SAFE.x1 - 10;
    // yol: kesik çizgi (gidilecek) + dolu çizgi (gidilen)
    ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = C.graphite; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    const xp = lerp(x0, x1, u);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xp, y); ctx.stroke();
    for (const [xx, lab] of [[x0, cfg.from], [x1, cfg.to]]) {
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xx, y - 18); ctx.lineTo(xx, y + 18); ctx.stroke();
      setFont(ctx, F.mono(36)); ctx.fillStyle = C.ink; ctx.textAlign = xx === x0 ? 'left' : 'right'; ctx.fillText(lab, xx, y + 64); ctx.textAlign = 'left';
    }
    // gezgin işareti (kuş ya da yürüyen insan; maskot katmanı varsa onun yerine aktör çizer)
    if (cfg.marker === 'bird') bird(xp, y - 46, t); else walker(xp, y - 8, t);
    // sayaçlar
    const big = cfg.total * u;
    setFont(ctx, F.head(120)); ctx.fillStyle = C.ink;
    const num = nf.format(big);
    ctx.fillText(num, SAFE.x0, 1310);
    const nw = ctx.measureText(num).width;
    setFont(ctx, F.name(52)); ctx.fillText(cfg.unit, SAFE.x0 + nw + 16, 1310);
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.graphite;
    const tv = cfg.timeTotal * u;
    ctx.fillText(`${tv < 20 ? nf1.format(tv) : nf.format(tv)} ${cfg.timeUnit}`, SAFE.x0, 1380);
    ctx.restore();
  }

  function bird(x, y, t, sc = 1) {
    const flap = Math.sin(t * Math.round((18 * D) / (2 * Math.PI)) * 2 * Math.PI / D) * 0.5; // kanat çırpma da döngüye kilitli
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-34, -12 * flap - 6); ctx.quadraticCurveTo(-14, -18, 0, 0); ctx.quadraticCurveTo(14, -18, 34, -12 * flap - 6); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(0, 2, 10, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function walker(x, y, t, sc = 1) {
    const st = Math.sin(t * 9);
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -78, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(0, -30); ctx.moveTo(0, -30); ctx.lineTo(10 * st, 0); ctx.moveTo(0, -30); ctx.lineTo(-10 * st, 0);
    ctx.moveTo(0, -58); ctx.lineTo(12 * -st, -38); ctx.moveTo(0, -58); ctx.lineTo(12 * st, -38); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.fillRect(-16, -62, 12, 20); ctx.restore(); // sırt çantası
  }

  function compare(t) {
    const s = S.compare, p = sceneP(t, s);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p;
    lines(ep.compare.say, SAFE.x0, 640, 50, enterP(t, s.t0 + 0.2), C.ink);
    // aynı cetvel: km/gün çubukları
    const a = ep.compare.a, b = ep.compare.b, mx = Math.max(a.value, b.value);
    const ga = ease.state(seg(t, s.t0 + 0.5, 0.9)), gb = ease.state(seg(t, s.t0 + 0.9, 0.9));
    const x0 = SAFE.x0 + 110, wmax = SAFE.x1 - x0 - 10;
    const bar = (y, letter, v, g, label) => {
      badge(SAFE.x0, y + 20, letter, 1);
      const w = Math.max(3, (v / mx) * wmax * g);
      ctx.fillStyle = C.ink; ctx.fillRect(x0, y - 40, w, 56);
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y - 40, w, 56); ctx.clip();
      const off = (t * 220 * (v / mx)) % 36; ctx.strokeStyle = 'rgba(236,229,213,0.32)'; ctx.lineWidth = 8;
      for (let sx = x0 - 72 + off; sx < x0 + w + 36; sx += 36) { ctx.beginPath(); ctx.moveTo(sx, y + 16); ctx.lineTo(sx + 28, y - 40); ctx.stroke(); }
      ctx.restore();
      setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink; ctx.fillText(label, x0 + (w > 360 ? 0 : w + 16), y + (w > 360 ? 70 : 2));
    };
    bar(880, 'A', a.value, ga, a.label);
    bar(1060, 'B', b.value, gb, b.label);
    // doruk: oran (kırmızı, sessizlikten sonra)
    if (t >= tl.heroLand) {
      const k = lerp(0.9, 1, spring(t - tl.heroLand, 120, 24));
      ctx.save(); ctx.translate(SAFE.x0, 1290); ctx.scale(k, k); ctx.translate(-SAFE.x0, -1290);
      setFont(ctx, F.head(140)); revealText(ctx, ep.compare.ratio, SAFE.x0, 1290, 140, enterP(t, tl.heroLand - 0.04, 0.3), C.red);
      const rw = ctx.measureText(ep.compare.ratio).width;
      setFont(ctx, F.name(60)); revealText(ctx, ep.compare.ratioUnit, SAFE.x0 + rw + 18, 1290, 60, enterP(t, tl.heroLand - 0.04, 0.3), C.red);
      ctx.restore();
    }
    ctx.restore();
  }

  function ask(t) {
    const s = S.ask, p = sceneP(t, s, 0.35);
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p;
    lines(ep.ask.say, SAFE.x0, 700, 60, enterP(t, s.t0 + 0.1), C.ink, F.head);
    badge(SAFE.x0, 1000, 'A', enterP(t, s.t0 + 0.4)); lines(ep.ask.a, SAFE.x0 + 110, 980, 44, enterP(t, s.t0 + 0.45), C.ink);
    badge(SAFE.x0, 1160, 'B', enterP(t, s.t0 + 0.55)); lines(ep.ask.b, SAFE.x0 + 110, 1140, 44, enterP(t, s.t0 + 0.6), C.ink);
    const ua = ((t - s.t0) / 2.2) % 1;
    ctx.save(); ctx.globalAlpha *= enterP(t, s.t0 + 0.5); bird(lerp(SAFE.x0 + 130, 700, ua), 1060 - Math.sin(ua * Math.PI) * 16, t, 0.8);
    walker(SAFE.x0 + 130 + ((t - s.t0) * 14) % 300, 1238, t, 0.62); ctx.restore();
    // yorum işareti: yanıp sönmeyen, sürekli dönen kalem ucu (sürekli hareket)
    ctx.restore();
  }

  // kanca: kare 0'da başlık + A'nın uç sayısı (hazır), döngüde geri gelir
  function hook(t) {
    const s = S.hook;
    let p = t < s.t1 - 0.3 ? 1 : 1 - ease.exit(seg(t, s.t1 - 0.3, 0.3));
    if (t >= S.loop.t0) p = ease.enter(seg(t, S.loop.t0 + 0.12, 0.6));
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p;
    badge(SAFE.x0, 760, 'A', 1);
    setFont(ctx, F.head(150)); ctx.fillStyle = C.ink; ctx.fillText(ep.hook.big, SAFE.x0, 960);
    lines(ep.hook.say, SAFE.x0, 1050, 52, 1, C.ink);
    const per = D / Math.round(D / 2.4); // döngüye kilitli: son kare = kare 0
    bird(lerp(SAFE.x0 + 40, 840, ((t / per) + 0.12) % 1), 1150 - Math.sin((t / per) * Math.PI * 2) * 14, t, 0.9);
    badge(SAFE.x0, 1290, 'B', 1, C.graphite);
    lines(ep.hook.b, SAFE.x0 + 100, 1270, 48, 1, C.graphite);
    ctx.restore();
  }

  // Sıfır: kuşu izler, yürüyüşün yıllarını sayar, kıyasta düşünür, doruğa zıplar, soruda gösterir
  const actorScript = ep.actor === false ? [] : [
    { type: 'idle', t0: 0, t1: S.a.t0 + 0.6, expr: 'notr' },
    { type: 'lookUp', t0: S.a.t0 + 0.6, t1: S.a.t1 - tl.beat * 2.5, expr: 'saskin' },
    { type: 'happy', t0: S.a.t1 - tl.beat * 2.5, t1: S.b.t0 + 0.6 },
    { type: 'count', t0: S.b.t0 + 0.6, t1: S.b.t1 - tl.beat * 2.5, from: 1, to: ep.actorCountTo ?? 28, label: n => `${n}. yıl`, bubble: 'side',
      valueAt: t => Math.ceil(ep.b.timeTotal * ease.state(seg(t, S.b.t0 + 0.6, (S.b.t1 - S.b.t0) - 0.6 - tl.beat * 2.5)) - 1e-9) }, // sıra sayısı: 5,6 yıl geçtiyse 6. yıl
    { type: 'sweat', t0: S.b.t1 - tl.beat * 2.5, t1: S.compare.t0 + 0.4 },
    { type: 'think', t0: S.compare.t0 + 0.4, t1: tl.heroLand - 0.05 },
    { type: 'surprise', t0: tl.heroLand - 0.05, t1: tl.heroLand + 0.85 },
    { type: 'happy', t0: tl.heroLand + 0.85, t1: S.loop.t0 },
    { type: 'idle', t0: S.loop.t0, t1: Infinity, expr: 'notr' },
  ];
  const actorHome = { x: 868, y: 1414, facing: -1 };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(grain(), 0, 0);
    grid(t);
    header(t);
    hook(t);
    route(t, S.a, ep.a, 'A');
    route(t, S.b, ep.b, 'B');
    compare(t);
    ask(t);
    if (actor) actor(ctx, t, tl);
    else if (actorScript.length) drawActor(ctx, actorScript, t, actorHome, 100, D);
  }
  return { render, duration: D, timeline: tl };
}

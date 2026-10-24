// "Futbol" şablonu (Hangisi daha şaşırtıcı?): 13 yıl resmî maça çıkmadan futbolcu kalan Carlos Kaiser ve 59 yaşında hâlâ
// oynayan Kazuyoshi Miura. A: yandan gravür stadyum; kulüp damgaları, yedek kulübesi, sakatlık numarası, oyuncak telefon,
// Bangu'da tribünle kavga ve kart, "+6 AY". B: kürede Shizuoka'dan Brezilya'ya yolculuk, sonra stadyumda goller ve yaş.
// Doruk: üstten saha; Kaiser'in yarısında büyük "0", Kazu'nun yarısında 911 maç noktası (dorukta kırmızı).
// Anlatım saattir (yolculuk_core.buildYolTimeline). Her şey t'nin saf fonksiyonudur.
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { drawSifir, SIFIR_CARD, POSES, mixPose } from '../sifir.js';
import { loadWorld, makeGlobe, camAt } from '../globe.js';
import { KAISER_CARD, KAZU_CARD, REF_CARD, PATRON_CARD, drawPlayer, drawBall, drawGoal, drawCard, drawPaper } from '../futbol_chars.js';
import { buildYolTimeline, densify, pointAt, slice } from './yolculuk_core.js';

const nf0 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ROUND = { x: 215, y: 1268, r: 124 }, ROUND2 = { x: 482, y: 1268, r: 112 };
const SIFIR = { x: 872, y: 1412, H: 92 };
const FLOOR = 1392, STANDS = { y0: 760, y1: 990 }, GOAL = { x: 600, y: 1235, h: 150 };
const SHIZ = [138.38, 34.98], SANTOS = [-46.33, -23.96];
const CLUBS = ['FLAMENGO', 'BOTAFOGO', 'FLUMINENSE', 'VASCO DA GAMA', 'BANGU'];
// doruk sahası (üstten)
const PITCH = { x0: 100, x1: 810, y0: 790, y1: 1290 };
const DOTS = { cols: 26, rows: 35, n: 911 };

export function futbolTimes(tl) {
  const { L, W: Wd } = tl;
  const T = {
    sign: Wd('l02', 'imza'), zero: Wd('l03', 'oynamıyor'), injury: Wd('l04', 'sakatlık'), phone: Wd('l05', 'telefonla'), bangu: L.l06.t0, fight: Wd('l06', 'kavga'),
    off: Wd('l06', 'atılıyor'), patron: L.l07.t0, ext: Wd('l07', 'uzatılıyor'), whip0: L.l07.end + 0.25, whip1: L.l08.t0 + 0.6, adam: Wd('l08', 'adam'),
    fly0: L.l09.t0 + 0.9, brazil: Wd('l09', 'brezilya'), pro: Wd('l09', 'profesyonel'), japan: L.l10.t0, goals: Wd('l10', 'gol'), age50: L.l11.t0, oldest: Wd('l11', 'yaşlı'),
    today: L.l12.t0, cmp0: L.l13.t0 - 0.1, zeroW: Wd('l14', 'sıfır'), kazuW: Wd('l14', 'kazu'), hero: L.l15.t0 - 0.04, after: L.l16.t0, br80: Wd('l16', 'brezilya'), ask: L.l17.t0, loop0: tl.loop0,
  };
  T.back0 = T.japan - 0.5; T.back1 = T.japan + 0.5;
  return T;
}

export async function makeFutbolRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const [voice, world] = await Promise.all([(await fetch(`../assets/voice/${ep.id}/words.json`)).json(), loadWorld()]);
  const G = makeGlobe(ctx, world, STAGE_TOP);
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = futbolTimes(tl), Fx = ep.facts;
  const ARC = densify([SHIZ, SANTOS], 200);
  // döngü dikişi: sürekli döngülerin hızı film süresine tam bölünecek biçimde yuvarlanır (son kare = kare 0)
  const wq = w => Math.round(w * D / (2 * Math.PI)) * 2 * Math.PI / D, rq = r => Math.round(r * D) / D, runT = t => t * (Math.round(D / 0.55) * 0.55 / D);
  const flyS = t => ARC.at(-1).km * ease.state(seg(t, T.fly0, T.brazil + 0.5 - T.fly0));
  const rnd = mulberry32(41);
  const fans = Array.from({ length: 3 }, (_, row) => Array.from({ length: 30 }, (_, i) => [i * 33 + (row % 2) * 16 + rnd() * 6, rnd() * 6.28]));
  const dots = Array.from({ length: DOTS.n }, (_, i) => [i % DOTS.cols, Math.floor(i / DOTS.cols)]);

  // A ↔ küre ↔ B: stadyum sola kayar, küre sağdan gelir (ve geri)
  // doruk levhasının arkasında sahne Kaiser'in stadyumuna (kare 0 hâli) döner
  const toGlobe = t => t >= T.cmp0 + 0.5 ? 0 : t < T.whip0 ? 0 : t < T.whip1 ? ease.state(seg(t, T.whip0, T.whip1 - T.whip0)) : t < T.back0 ? 1 : t < T.back1 ? 1 + ease.state(seg(t, T.back0, T.back1 - T.back0)) : 2;
  const S0 = { c: SHIZ, r: 420, cy: 1160 };
  const globeCam = t => {
    const s = toGlobe(t), cx = s <= 1 ? 540 + W * (1 - s) : 540 - W * (s - 1);
    const p = t < T.fly0 ? SHIZ : pointAt(ARC, flyS(t));
    return { c: p, r: 420 * (1 + 0.03 * seg(t, T.whip1, T.back0 - T.whip1)), cy: 1160, cx };
  };

  // ——— stadyum (yandan) ———
  function stadium(t, dx, kazu) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); ctx.translate(dx, 0);
    // sahne boyunca yavaş yaklaşma (%8): stadyum hiçbir karede donmaz
    // soruda %94'ten kare 0'daki %100'e (aynı yön: yaklaşma)
    const z = kazu ? 1 + 0.08 * seg(t, T.back1, T.cmp0 - T.back1) : t >= T.cmp0 ? 1 - 0.06 * (1 - seg(t, T.ask, D - T.ask)) : 1 + 0.08 * seg(t, 0, T.whip0);
    ctx.translate(540, 1200); ctx.scale(z, z); ctx.translate(-540, -1200);
    // tribün: üç sıra baş, sıralar hafifçe kıpırdar; Bangu'da öndeki sıra bağırır (kollar havada)
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-100, STANDS.y0, W + 200, STANDS.y1 - STANDS.y0);
    ctx.save(); ctx.beginPath(); ctx.rect(-100, STANDS.y0, W + 200, STANDS.y1 - STANDS.y0); ctx.clip(); ctx.strokeStyle = 'rgba(28,27,24,0.25)'; ctx.lineWidth = 1; for (let y = STANDS.y0; y < STANDS.y1; y += 7) { ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(W + 100, y); ctx.stroke(); } ctx.restore();
    const angry = !kazu && t >= T.bangu && t < T.patron;
    fans.forEach((row, ri) => row.forEach(([x, ph]) => {
      const y = STANDS.y0 + 50 + ri * 62 + Math.sin(t * (angry ? 7 : wq(2)) + ph) * (angry ? 4 : 1.5);
      ctx.beginPath(); ctx.arc(x - 40, y, 12, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 54, y + 30); ctx.quadraticCurveTo(x - 40, y + 12, x - 26, y + 30); ctx.stroke();
      if (angry && ri === 2 && Math.sin(ph * 3) > 0) { ctx.beginPath(); ctx.moveTo(x - 50, y + 16); ctx.lineTo(x - 56, y - 14 + Math.sin(t * 9 + ph) * 5); ctx.moveTo(x - 30, y + 16); ctx.lineTo(x - 24, y - 14 + Math.cos(t * 9 + ph) * 5); ctx.stroke(); }
    }));
    ctx.beginPath(); ctx.moveTo(-100, STANDS.y1); ctx.lineTo(W + 100, STANDS.y1); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    for (let x = -80; x < W + 100; x += 46) { ctx.beginPath(); ctx.moveTo(x, STANDS.y1); ctx.lineTo(x, STANDS.y1 + 34); ctx.lineWidth = 2; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-100, STANDS.y1 + 34); ctx.lineTo(W + 100, STANDS.y1 + 34); ctx.stroke();
    // çim: yatay tarama, derinliğe doğru sıklaşır; saha çizgisi
    ctx.strokeStyle = 'rgba(139,133,119,0.5)'; ctx.lineWidth = 1.1;
    for (let y = STANDS.y1 + 40, g = 5; y < FLOOR; y += g, g = Math.min(12, g + 0.12)) { ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(W + 100, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-100, 1180); ctx.lineTo(W + 100, 1180); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-100, FLOOR); ctx.lineTo(W + 100, FLOOR); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    // kale ve uzakta koşan iki oyuncu (sürekli döngü)
    ctx.save(); ctx.translate(GOAL.x, GOAL.y); drawGoal(ctx, GOAL.h); ctx.restore();
    for (let k = 0; k < 2; k++) { const u = ((t * rq(0.09) + k * 0.5) % 1), x = lerp(-60, W + 60, k ? 1 - u : u); ctx.save(); ctx.globalAlpha = 0.55; ctx.translate(x, 1170); if (k) ctx.scale(-1, 1); drawPlayer(ctx, k ? KAZU_CARD : REF_CARD, { run: runT(t) + k * 0.55 }, 120); ctx.restore(); }
    if (!kazu) kaiserAct(t); else kazuAct(t);
    ctx.restore();
  }
  // Kaiser'in sahneleri
  function kaiserAct(t) {
    const back = t >= T.cmp0, tA = back ? 0 : t;
    // kulüp damgaları (l02): üstte iki sıra, sırayla basılır; l03'te çekilir
    if (!back && t >= L.l02.t0 && t < T.zero + 0.4) {
      CLUBS.forEach((c, i) => {
        const a = L.l02.t0 + 0.4 + i * ((T.sign + 0.4 - L.l02.t0) / CLUBS.length), u = ease.enter(seg(t, a, 0.3)), out = 1 - seg(t, T.zero, 0.4); if (u <= 0) return;
        const x = 110 + (i % 3) * 270, y = 800 + Math.floor(i / 3) * 70, s = 1 + 0.25 * (1 - u);
        setFont(ctx, F.mono(32)); const tw = ctx.measureText(c).width;
        ctx.save(); ctx.globalAlpha = out; ctx.translate(x + tw / 2 + 12, y); ctx.scale(s, s); ctx.rotate(-0.05 + i * 0.02);
        ctx.fillStyle = C.paper; ctx.fillRect(-tw / 2 - 12, -26, tw + 24, 48); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(-tw / 2 - 12, -26, tw + 24, 48);
        ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(c, 0, 10); ctx.restore();
      });
    }
    // yedek kulübesi
    ctx.fillStyle = C.paper; ctx.fillRect(330, FLOOR - 120, 250, 14); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.strokeRect(330, FLOOR - 120, 250, 14);
    ctx.beginPath(); ctx.moveTo(350, FLOOR - 106); ctx.lineTo(350, FLOOR); ctx.moveTo(560, FLOOR - 106); ctx.lineTo(560, FLOOR); ctx.stroke();
    // Kaiser: kare 0'da ve döngüde kulübede telefonla; l02 imza; l03 kulübede; l04 antrenmanda sakatlık; l05 telefon; l06 ısınma ve kavga; l07 sözleşme
    let x = 470, pose = { sit: true, arms: 'phone', mouth: 'open' };
    if (tA >= L.l02.t0 && tA < T.zero) pose = { arms: 'pen', phase: t, mouth: 'smile' };
    else if (tA >= T.zero && tA < L.l04.t0) pose = { sit: true, arms: 'down' };
    else if (tA >= L.l04.t0 && tA < L.l05.t0) { const run = tA < T.injury; x = run ? lerp(250, 560, seg(tA, L.l04.t0, T.injury - L.l04.t0)) : 560; pose = run ? { run: t } : { thigh: true, arms: 'thigh', mouth: 'open', lean: 0.12 }; }
    else if (tA >= L.l05.t0 && tA < T.bangu) pose = { sit: true, arms: 'phone', mouth: 'open' };
    else if (tA >= T.bangu && tA < T.patron) { const warm = tA < T.fight; x = warm ? 420 + Math.sin((tA - T.bangu) * 2.2) * 90 : 440; pose = warm ? { run: t } : { arms: 'fists', phase: t, mouth: 'open', lean: -0.06 }; }
    else if (tA >= T.patron && tA < T.cmp0) pose = { arms: 'down', mouth: 'smile' };
    ctx.save(); ctx.translate(x, FLOOR); if (pose.arms === 'fists') ctx.scale(-1, 1); drawPlayer(ctx, KAISER_CARD, pose, 330); ctx.restore();
    // hakem ve kart (l06): kırmızı DEĞİL — mürekkep tarama; etiket "KIRMIZI KART"
    if (!back && t >= T.fight && t < T.patron) {
      const u = ease.enter(seg(t, T.fight, 0.4));
      ctx.save(); ctx.translate(lerp(820, 650, u), FLOOR); ctx.scale(-1, 1); drawPlayer(ctx, REF_CARD, t >= T.off ? { arms: 'point', phase: 0 } : { run: t }, 320); ctx.restore();
      if (t >= T.off) { const k = ease.enter(seg(t, T.off, 0.3)); ctx.save(); ctx.translate(560, FLOOR - 330); ctx.rotate(-0.15); drawCard(ctx, 70 * k); ctx.restore(); if (k > 0.8) chip('KIRMIZI KART', 560, FLOOR - 410, 1, 'center'); }
    }
    // sözleşme (l07): kâğıt ve "+6 AY" damgası
    if (!back && t >= T.patron && t < T.whip1) {
      const u = ease.enter(seg(t, T.patron + 0.2, 0.5));
      ctx.save(); ctx.translate(680, lerp(1340, 1180, u)); ctx.rotate(0.06); ctx.fillStyle = C.paper; ctx.fillRect(-110, -140, 220, 280); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(-110, -140, 220, 280);
      setFont(ctx, F.mono(32)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('SÖZLEŞME', 0, -98);
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-80, -60 + i * 26); ctx.lineTo(i % 2 ? 40 : 80, -60 + i * 26); ctx.lineWidth = 1.6; ctx.stroke(); }
      if (t >= T.ext) { const k = ease.enter(seg(t, T.ext, 0.25)), s = 1 + 0.5 * (1 - k); ctx.save(); ctx.translate(10, 90); ctx.rotate(-0.2); ctx.scale(s, s); ctx.globalAlpha = k; ctx.lineWidth = 4; ctx.strokeRect(-80, -30, 160, 60); setFont(ctx, F.head(44)); ctx.fillText('+6 AY', 0, 16); ctx.restore(); }
      ctx.restore();
    }
  }
  // Kazu'nun sahneleri (Japonya): şut döngüsü, top ağlara; yaşla kırlaşır
  function kazuAct(t) {
    const age = t < T.age50 ? 0 : t < T.today ? 0.5 : 0.9;
    const cyc = 1.1, ph = ((t - T.back1) / cyc) % 1, kick = ph < 0.35 ? ph / 0.35 : 0;
    const x = 450;
    ctx.save(); ctx.translate(x, FLOOR); drawPlayer(ctx, KAZU_CARD, kick > 0 ? { kick, age } : { run: t, age }, 330); ctx.restore();
    // top: ayaktan kaleye yay
    const bu = ph < 0.3 ? 0 : clamp01((ph - 0.3) / 0.45), bx = lerp(x + 70, GOAL.x + 110, bu), by = lerp(FLOOR - 20, GOAL.y - 70, bu) - Math.sin(bu * Math.PI) * 90;
    ctx.save(); ctx.translate(bx, by); drawBall(ctx, 38, t * 8); ctx.restore();
    if (t >= T.oldest && t < T.today) chip('LİGİN EN YAŞLI GOLCÜSÜ', 540, 1050, ease.enter(seg(t, T.oldest, 0.3)), 'center');
    if (t >= T.today && t < T.cmp0) chip('2026 · 59 YAŞINDA', 540, 1050, ease.enter(seg(t, T.today, 0.3)), 'center');
  }
  function chip(s, x, y, a = 1, al = 'left', col = C.ink) {
    if (a <= 0) return; setFont(ctx, F.mono(32)); const tw = ctx.measureText(s).width, x0 = al === 'center' ? x - tw / 2 : al === 'right' ? x - tw : x;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - 32, tw + 20, 46); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }

  // ——— küre: Shizuoka'dan Brezilya'ya ———
  function globe(t) {
    const s = toGlobe(t); if (s <= 0 || s >= 2) return null;
    G.setCam(globeCam(t)); G.draw();
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    let at = null;
    const fs = t < T.fly0 ? 0 : flyS(t);
    if (fs > 1) G.line(slice(ARC, 0, fs), { w: 4, dash: [10, 7] });
    G.placeLabel(SHIZ, 'JAPONYA', 1, 20, -24);
    if (t >= T.brazil - 0.3) G.placeLabel(SANTOS, t >= T.pro ? 'SANTOS · 1986' : 'BREZİLYA', seg(t, T.brazil - 0.3, 0.4), 20, -30);
    const p = t < T.fly0 ? SHIZ : pointAt(ARC, fs), p2 = pointAt(ARC, Math.min(ARC.at(-1).km, fs + 300));
    if (G.visible(p)) {
      const q = G.proj(p), q2 = G.visible(p2) ? G.proj(p2) : [q[0] + 1, q[1]], ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]);
      ctx.save(); ctx.translate(q[0], q[1]); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill(); ctx.rotate(ang);
      // uçak silueti
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-20, -5); ctx.lineTo(-20, 5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-8, -22); ctx.lineTo(-14, -22); ctx.lineTo(-6, 0); ctx.lineTo(-14, 22); ctx.lineTo(-8, 22); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-22, -10); ctx.lineTo(-25, -10); ctx.lineTo(-22, 0); ctx.lineTo(-25, 10); ctx.lineTo(-22, 10); ctx.closePath(); ctx.fill();
      ctx.restore(); at = q;
    }
    ctx.restore();
    return at;
  }

  // ——— doruk: üstten saha ———
  function pitch(t) {
    if (t < T.cmp0 || t >= T.ask) return null;
    const out = t >= T.ask - 0.25, k = out ? 1 - ease.exit(seg(t, T.ask - 0.25, 0.25)) : ease.state(seg(t, T.cmp0, 0.45));
    if (out) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.restore(); } else { ctx.fillStyle = C.paper; ctx.fillRect(0, STAGE_TOP, W, (1920 - STAGE_TOP) * k); }
    ctx.save(); ctx.globalAlpha = out ? k : 1; ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, out ? 1920 - STAGE_TOP : (1920 - STAGE_TOP) * k); ctx.clip();
    { const sh = ease.state(seg(t, T.after, 0.6)), sc = 1 - 0.15 * sh; ctx.translate(0, -55 * sh); ctx.translate(455, 790); ctx.scale(sc, sc); ctx.translate(-455, -790); }
    // kıyas boyunca Kazu'nun yarısına doğru yavaş yaklaşma (%10)
    const z = 1 + 0.1 * seg(t, T.cmp0 + 0.45, T.ask - T.cmp0 - 0.45); ctx.translate(700, 1070); ctx.scale(z, z); ctx.translate(-700, -1070);
    const lineA = 0.25 + 0.75 * ease.enter(seg(t, T.cmp0 + 0.1, 0.4));
    const P = PITCH, mx = (P.x0 + P.x1) / 2, my = (P.y0 + P.y1) / 2;
    ctx.fillStyle = '#F4EEE1'; ctx.fillRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
    ctx.save(); ctx.beginPath(); ctx.rect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0); ctx.clip(); ctx.strokeStyle = 'rgba(139,133,119,0.35)'; ctx.lineWidth = 1; for (let x = P.x0; x < P.x1; x += 40) { ctx.fillStyle = (Math.floor((x - P.x0) / 40) % 2) ? 'rgba(139,133,119,0.10)' : 'rgba(0,0,0,0)'; ctx.fillRect(x, P.y0, 40, P.y1 - P.y0); } ctx.restore();
    ctx.save(); ctx.globalAlpha *= lineA; ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.strokeRect(P.x0, P.y0, P.x1 - P.x0, P.y1 - P.y0);
    ctx.beginPath(); ctx.moveTo(mx, P.y0); ctx.lineTo(mx, P.y1); ctx.stroke(); ctx.beginPath(); ctx.arc(mx, my, 70, 0, Math.PI * 2); ctx.stroke();
    for (const [x0, dir] of [[P.x0, 1], [P.x1, -1]]) { ctx.strokeRect(Math.min(x0, x0 + dir * 110), my - 150, 110, 300); ctx.strokeRect(Math.min(x0, x0 + dir * 40), my - 70, 40, 140); }
    ctx.restore();
    // kurulumda orta yuvarlaktan iki yarıya gidip gelen top (saha hiçbir karede donmaz)
    if (t < T.zeroW - 0.1) { const r0 = ease.enter(seg(t, T.cmp0, 0.8)), u = Math.max(0, t - T.cmp0 - 0.8) * 0.35, bx = lerp(P.x0 + 30, mx, r0) + Math.sin(u * Math.PI * 2) * 200, by = my + Math.sin(u * Math.PI * 4) * 50; ctx.save(); ctx.translate(bx, by); drawBall(ctx, 36, t * 6); ctx.restore(); }
    // Kaiser'in yarısı: büyük sıfır
    const u0 = ease.enter(seg(t, T.zeroW - 0.1, 0.4));
    if (u0 > 0) { ctx.save(); ctx.globalAlpha *= u0; setFont(ctx, F.head(300)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('0', (P.x0 + mx) / 2, my + 100); ctx.restore(); }
    setFont(ctx, F.mono(32)); ctx.textAlign = 'center';
    ctx.fillStyle = C.paper; ctx.fillRect((P.x0 + mx) / 2 - 80, P.y0 + 20, 160, 44); ctx.fillStyle = C.ink; ctx.fillText('KAISER', (P.x0 + mx) / 2, P.y0 + 54);
    ctx.fillStyle = C.paper; ctx.fillRect((mx + P.x1) / 2 - 60, P.y0 + 20, 120, 44); ctx.fillStyle = C.ink; ctx.fillText('KAZU', (mx + P.x1) / 2, P.y0 + 54);
    // Kazu'nun yarısı: 911 maç noktası, hızlanarak basılır; dorukta kırmızı
    const red = t >= T.hero - 0.02;
    const uk = clamp01((t - T.kazuW) / Math.max(0.6, T.hero - T.kazuW)), n = red ? DOTS.n : Math.floor(DOTS.n * uk * (0.3 + 0.7 * uk));
    const gx0 = mx + 30, gy0 = P.y0 + 84, cw = (P.x1 - 30 - gx0) / DOTS.cols, ch = (P.y1 - 20 - gy0) / DOTS.rows;
    const pop = red ? spring(t - T.hero, 120, 24) : 1, s = red ? 6 + 2 * Math.max(0, 1 - pop) : 6;
    ctx.fillStyle = red ? C.red : C.ink;
    for (let i = 0; i < n; i++) { const [c, r] = dots[i]; ctx.fillRect(gx0 + c * cw + cw / 2 - s / 2, gy0 + r * ch + ch / 2 - s / 2, s, s); }
    ctx.restore();
    return [gx0, gy0];
  }

  // ——— büyüteç ———
  function roundel(t, kind, R = ROUND, k = 1, at = null) {
    if (k <= 0) return;
    const r = R.r * ease.enter(k);
    if (at && k > 0.6) { const ang = Math.atan2(at[1] - R.y, at[0] - R.x), d = Math.hypot(at[0] - R.x, at[1] - R.y); if (d > r + 30) { ctx.beginPath(); ctx.moveTo(R.x + Math.cos(ang) * (r + 4), R.y + Math.sin(ang) * (r + 4)); ctx.lineTo(at[0] - Math.cos(ang) * 14, at[1] - Math.sin(ang) * 14); ctx.lineWidth = 2; ctx.strokeStyle = C.graphite; ctx.stroke(); } }
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.clip();
    ctx.translate(R.x, R.y); ctx.scale(r / R.r, r / R.r); ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    const face = (card, pose) => { ctx.save(); ctx.translate(-8, 726); drawPlayer(ctx, card, pose, 820); ctx.restore(); };
    if (kind === 'kaiserPhone') { face(KAISER_CARD, { arms: 'phone', mouth: Math.floor(t * 3) % 2 ? 'open' : 'flat' }); }
    else if (kind === 'kaiserSign') { ctx.fillStyle = '#F4EEE1'; ctx.fillRect(-100, -80, 200, 200); ctx.lineWidth = 3; ctx.strokeRect(-100, -80, 200, 200); for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-80, -50 + i * 26); ctx.lineTo(70, -50 + i * 26); ctx.lineWidth = 1.5; ctx.stroke(); } const u = ((t - L.l02.t0) * 0.6) % 1; ctx.beginPath(); for (let x = 0; x <= 150 * u; x += 4) { const y = 90 + Math.sin(x * 0.3) * 8; x ? ctx.lineTo(-80 + x, y) : ctx.moveTo(-80, y); } ctx.lineWidth = 3; ctx.stroke(); }
    else if (kind === 'bench') { ctx.save(); ctx.translate(-10, 120); drawPlayer(ctx, KAISER_CARD, { sit: true, arms: 'down', eyes: Math.floor(t * 0.8) % 3 ? 'open' : 'closed' }, 300); ctx.restore(); setFont(ctx, F.head(60)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('0', 70, -50); }
    else if (kind === 'injury') { ctx.save(); ctx.translate(0, 160); drawPlayer(ctx, KAISER_CARD, { thigh: true, arms: 'thigh', mouth: 'open', lean: 0.12 }, 320); ctx.restore(); }
    else if (kind === 'paper') { ctx.save(); ctx.translate(0, 0); drawPaper(ctx, 250, "KAISER'E\nTEKLİF!", 0.14); ctx.restore(); ctx.save(); ctx.translate(40, 70); ctx.rotate(-0.3); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.strokeRect(-72, -24, 144, 48); setFont(ctx, F.mono(28)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('UYDURMA', 0, 10); ctx.restore(); }
    else if (kind === 'fight') { ctx.save(); ctx.translate(-30, 150); ctx.scale(-1, 1); drawPlayer(ctx, KAISER_CARD, { arms: 'fists', phase: t, mouth: 'open' }, 300); ctx.restore(); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-100 + i * 50, -90 + Math.sin(t * 8 + i) * 5, 16, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); } }
    else if (kind === 'patron') { ctx.save(); ctx.translate(-50, 170); drawPlayer(ctx, PATRON_CARD, { arms: 'down' }, 300); ctx.restore(); ctx.save(); ctx.translate(60, 170); ctx.scale(-1, 1); drawPlayer(ctx, KAISER_CARD, { arms: 'point', phase: t, mouth: 'open' }, 280); ctx.restore(); }
    else if (kind === 'kazu' || kind === 'kazuOld') { face(KAZU_CARD, { age: kind === 'kazuOld' ? 0.9 : 0, mouth: 'smile' }); }
    else if (kind === 'kazuKick') { const kp = (t * rq(0.9)) % 1; ctx.save(); ctx.translate(-30, 170); drawPlayer(ctx, KAZU_CARD, { kick: kp < 0.4 ? kp / 0.4 : 0, run: runT(t) }, 270); ctx.restore(); ctx.save(); ctx.translate(60 + kp * 40, 130 - Math.sin(kp * Math.PI) * 60); drawBall(ctx, 32, kp * 6.283); ctx.restore(); }
    else if (kind === 'brazil') {
      // Brezilya kıyısı (eskiz) ve iki iğne: Rio (Kaiser'in kulüpleri), Santos (Kazu)
      ctx.beginPath(); ctx.moveTo(-130, -110); ctx.quadraticCurveTo(10, -120, 60, -60); ctx.quadraticCurveTo(100, -20, 90, 20); ctx.quadraticCurveTo(40, 60, -20, 90); ctx.quadraticCurveTo(-60, 120, -90, 140); ctx.lineTo(-130, 140); ctx.closePath(); ctx.fillStyle = '#F4EEE1'; ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
      for (const [x, y, a, b] of [[-30, -46, 'RIO', 'KAISER'], [-80, 34, 'SANTOS', 'KAZU']]) { ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); setFont(ctx, F.mono(30)); ctx.textAlign = 'left'; const tw = Math.max(ctx.measureText(a).width, ctx.measureText(b).width); ctx.fillStyle = C.paper; ctx.fillRect(x + 12, y - 26, tw + 10, 70); ctx.fillStyle = C.ink; ctx.fillText(a, x + 16, y + 4); ctx.fillStyle = C.graphite; ctx.fillText(b, x + 16, y + 36); }
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(R.x, R.y, r, 0, Math.PI * 2); ctx.lineWidth = 3.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }
  const S1 = [[0, 'kazuKick'], [L.l02.t0, 'kaiserSign'], [T.zero, 'bench'], [T.injury, 'injury'], [T.phone - 0.2, 'kaiserPhone'], [L.l05.t0 + 2.0, 'paper'], [T.bangu, null], [T.fight - 0.1, 'fight'], [T.patron + 0.2, 'patron'], [T.whip0, null],
    [T.adam - 0.1, 'kazu'], [T.japan, 'kazuKick'], [T.today, 'kazuOld'], [T.cmp0, null], [T.after, 'brazil'], [T.ask, 'kazuKick']];
  function sched(t, S) {
    let i = -1; for (let k = 0; k < S.length; k++) if (t >= S[k][0]) i = k;
    if (i < 0) return { kind: null, k: 0 };
    const [a, kind] = S[i], prev = i > 0 ? S[i - 1][1] : null;
    if (i > 0 && t < a + 0.3 && prev) return { kind: prev, k: 1 - ease.exit(seg(t, a, 0.15)) };
    if (!kind) return { kind: null, k: 0 };
    return { kind, k: i === 0 ? 1 : ease.enter(seg(t, a + (prev ? 0.15 : 0), 0.35)) };
  }

  // ——— Sıfır ———
  const blinkR = mulberry32(61); const blinks = []; for (let b = 1.4; b < D - 1; b += 2.5 + blinkR() * 3) blinks.push(b);
  const reacts = [[0, 'ayakta', 'notr'], [T.zero, 'sasirma', 'saskin'], [T.zero + 1.4, 'ayakta', 'notr'], [T.injury, 'ayakta', 'mutlu'], [T.off, 'sasirma', 'saskin'], [T.ext, 'ayakta', 'mutlu'],
    [T.adam, 'ayakta', 'notr'], [T.pro, 'ayakta', 'mutlu'], [T.oldest, 'sasirma', 'saskin'], [T.today, 'ayakta', 'mutlu'],
    [T.cmp0, 'ayakta', 'dusunceli'], [T.hero, 'sasirma', 'saskin'], [T.hero + 1.8, 'ayakta', 'mutlu'], [T.ask, 'isaret', 'notr'], [T.loop0 + 0.5, 'ayakta', 'notr']];
  const bubbles = [[T.ext + 0.2, T.ext + 1.7, 'Uzattılar mı?!']];
  function sifir(t) {
    let i = 0; for (let k = 0; k < reacts.length; k++) if (t >= reacts[k][0]) i = k;
    const cur = reacts[i], prev = reacts[Math.max(0, i - 1)], u = i === 0 ? 1 : ease.state(seg(t, cur[0], 0.28));
    const expr = { ...SIFIR_CARD.expressions[u < 0.5 ? prev[2] : cur[2]] };
    if (blinks.some(b => t >= b && t < b + 0.12)) expr.eye = 'closed';
    ctx.beginPath(); ctx.rect(SIFIR.x - 80, SIFIR.y, 160, 30); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.lineWidth = 1; for (let x = SIFIR.x - 90; x < SIFIR.x + 90; x += 6) { ctx.beginPath(); ctx.moveTo(x, SIFIR.y + 30); ctx.lineTo(x + 14, SIFIR.y); ctx.stroke(); } ctx.restore();
    ctx.save(); ctx.translate(SIFIR.x, SIFIR.y); drawSifir(ctx, SIFIR_CARD, mixPose(POSES[prev[1]], POSES[cur[1]], u), expr, SIFIR.H, { facing: -1 }); ctx.restore();
    for (const [a, b, text] of bubbles) {
      if (t < a || t > b) continue;
      const k = ease.enter(seg(t, a, 0.25)), fade = 1 - seg(t, b - 0.2, 0.2);
      setFont(ctx, F.name(34)); const w = ctx.measureText(text).width + 36, x = SIFIR.x - 20 - w, y = SIFIR.y - 460;
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x + w, y + 30); ctx.scale(k, k); ctx.translate(-(x + w), -(y + 30));
      ctx.beginPath(); ctx.roundRect(x, y - 34, w, 58, 29); ctx.moveTo(x + w - 30, y + 24); ctx.lineTo(x + w + 6, y + 50); ctx.lineTo(x + w - 54, y + 24);
      ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(text, x + 18, y + 6); ctx.restore();
    }
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < L.l02.t0 - 0.06 || t >= T.loop0 + 0.3) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= L[l.id].t0 - 0.06) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    // bölünmüş cümle (l14 + l15): önce soru, doruğun karesinde tam cümle
    const txt = ln.id === 'l15' ? L.l14.text + ' ' + ln.text : ln.id === 'l14' ? "Kaiser'in resmî maç sayısı sıfır. Ya Kazu?" : ln.text;
    const p = ln.id === 'l15' ? 1 : ease.enter(seg(t, ln.t0 - 0.06, 0.3));
    let fs0 = 50, ls; for (const f of [50, 44, 40]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, txt, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 3 ? 398 : ls.length > 2 ? 410 : 432;
    ls.slice(0, 4).forEach((s, i) => revealText(ctx, s, SAFE.x0, y0 + i * lh, fs0, p, C.ink));
  }
  function title(t) {
    const pin = t < T.loop0 ? 1 : ease.enter(seg(t, T.loop0 + 0.3, 0.45));
    const pout = t < T.loop0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    setFont(ctx, F.head(104)); revealText(ctx, 'Hangisi daha', SAFE.x0, 470, 104, k, C.ink); revealText(ctx, 'şaşırtıcı?', SAFE.x0, 574, 104, k, C.ink);
    setFont(ctx, F.name(40)); revealText(ctx, '13 yıl tek maç oynamadan futbolcu kalan mı,', SAFE.x0, 640, 40, k, C.ink); revealText(ctx, '59 yaşında hâlâ oynayan mı?', SAFE.x0, 690, 40, k, C.ink);
  }
  function row({ label, num, unit, right1, right2, red = false, p = 1, labelInk = false }) {
    setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : labelInk ? C.ink : C.graphite);
    setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink);
    if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); }
    setFont(ctx, F.mono(36));
    if (right1) revealText(ctx, right1, SAFE.x1, 636, 36, p, C.ink, 'right');
    if (right2) revealText(ctx, right2, SAFE.x1, 680, 36, p, C.graphite, 'right');
  }
  function counters(t) {
    if (t < L.l02.t0 - 0.05 || t >= T.loop0 + 0.3) return;
    if (t < L.l08.t0 - 0.06) {
      const clubI = Math.min(CLUBS.length - 1, Math.floor(seg(t, L.l02.t0 + 0.4, T.sign + 0.4 - L.l02.t0) * CLUBS.length));
      const st = t >= T.ext ? '+6 AY SÖZLEŞME' : t >= T.off ? 'OYUNA GİRMEDEN ATILDI' : t >= T.bangu ? 'BANGU · ISINIYOR' : t >= T.phone ? 'OYUNCAK TELEFON' : t >= T.injury ? 'SAKATLIK NUMARASI' : t >= T.zero ? 'RESMÎ MAÇ YOK' : CLUBS[clubI];
      row({ label: 'CARLOS KAISER · BREZİLYA', num: t >= T.zero ? '0' : '13', unit: t >= T.zero ? 'maç' : 'yıl', right1: t >= T.zero ? '13 YIL · 1979–1992' : 'İMZA', right2: st, p: Math.max(0.35, ease.enter(seg(t, L.l02.t0 - 0.05, 0.35))) });
      return;
    }
    if (t < L.l09.t0 - 0.06) return;
    if (t < T.cmp0) {
      const p = Math.max(0.35, ease.enter(seg(t, L.l09.t0 - 0.06, 0.35)));
      if (t < T.pro) row({ label: 'KAZUYOSHI MIURA · JAPONYA', num: '15', unit: 'yaşında', right1: t >= T.fly0 ? 'TEK BAŞINA' : 'SHIZUOKA', right2: t >= T.brazil ? 'BREZİLYA' : t >= T.fly0 ? '1982' : '', p });
      else if (t < T.japan) row({ label: 'KAZUYOSHI MIURA · JAPONYA', num: '1986', unit: '', right1: 'SANTOS', right2: 'PROFESYONEL', p });
      else if (t < T.age50) row({ label: 'KAZUYOSHI MIURA · JAPONYA', num: String(t < T.goals - 0.3 ? 0 : Math.round(Fx.kazu.natGoals * ease.state(seg(t, T.goals - 0.3, L.l10.end - T.goals + 0.3)))), unit: 'gol', right1: 'MİLLİ TAKIM', right2: '89 MAÇ', p });
      else if (t < T.today) row({ label: 'KAZUYOSHI MIURA · JAPONYA', num: '50', unit: 'yaşında', right1: 'GOL', right2: t >= T.oldest ? 'EN YAŞLI GOLCÜ' : '', p });
      else row({ label: 'KAZUYOSHI MIURA · JAPONYA', num: '59', unit: 'yaşında', right1: '2026', right2: 'HÂLÂ PROFESYONEL', p });
      return;
    }
    if (t < T.hero) { const uk = clamp01((t - T.kazuW) / Math.max(0.6, T.hero - T.kazuW)); row({ label: t >= T.kazuW ? 'KAZU · RESMÎ MAÇ' : 'AYNI SAHADA · RESMÎ MAÇ', labelInk: t >= T.kazuW, num: t >= T.kazuW ? nf0.format(Math.floor(Fx.kazu.clubMatches * uk * (0.3 + 0.7 * uk))) : '0', unit: 'maç', right1: t >= T.zeroW ? 'KAISER: 0' : '', right2: '', p: ease.enter(seg(t, T.cmp0, 0.35)) }); return; }
    if (t < T.ask) { row({ label: 'KAZU · 40 YILDA', num: '911', unit: 'maç', red: true, right1: 'KAISER: 0', right2: '13 YILDA' }); return; }
    const p = ease.enter(seg(t, T.ask, 0.35)) * (1 - ease.exit(seg(t, T.loop0 + 0.1, 0.2)));
    setFont(ctx, F.head(80)); revealText(ctx, 'Kaiser mi, Kazu mu?', SAFE.x0, 672, 80, p, C.ink);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const s = toGlobe(t);
    let at = null;
    if (s < 1) stadium(t, -W * s, false);
    if (s > 1) stadium(t, W * (2 - s), true);
    const ga = globe(t); if (ga) at = ga;
    const pa = pitch(t); if (pa) at = pa;
    if (t >= T.bangu && t < T.patron && t >= T.off) at = [560, FLOOR - 330];
    // büyüteç
    const r1 = sched(t, S1);
    if (r1.kind && r1.k > 0.02) roundel(t, r1.kind, ROUND, r1.k, t >= L.l02.t0 && t < T.ask && (r1.kind === 'brazil' ? false : true) ? at : null);
    // kare 0 ve soru: iki balon
    if (t < L.l02.t0 || t >= T.ask) {
      const kk = t < L.l02.t0 ? 1 - ease.exit(seg(t, L.l02.t0 - 0.35, 0.35)) : ease.enter(seg(t, T.ask, 0.4));
      setFont(ctx, F.mono(34)); ctx.fillStyle = C.paper; ctx.globalAlpha = kk; ctx.fillRect(ROUND.x - 60, 1084, 120, 42); ctx.fillRect(470 - 80, 1066, 160, 42); ctx.globalAlpha = 1;
      revealText(ctx, 'KAZU', ROUND.x, 1116, 34, kk, C.ink, 'center'); revealText(ctx, 'KAISER', 470, 1098, 34, kk, C.ink, 'center');
    }
    // takip çağrısı: soru boyunca, döngüden önce söner
    if (t >= T.ask + 0.6 && t < T.loop0 + 0.3) { const kf = ease.enter(seg(t, T.ask + 0.6, 0.4)) * (1 - seg(t, T.loop0, 0.3)); chip('TAKİP ET · HER HAFTA YENİ BİR HANGİSİ?', 540, 760, kf, 'center'); }
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t);
    sifir(t);
    ctx.drawImage(grain(), 0, 0);
  }
  return { duration: D, timeline: { T }, render };
}

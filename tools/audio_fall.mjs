// № 027 "Hangisi önce yere düşer?" sesi: görüntüyle aynı çekirdekten (engine/scenes/fall_core.js).
// İki top aynı anda yere değdiği için her inişte TEK ses duyulur (ispatın kulaktaki karşılığı). Stroboskobun her
// hayaleti hafif bir kalem tıkı. Doruk turunda tek riser, inişten önce gerçek sessizlik, tek impact.
import { fallCues, T, MERGE } from '../engine/scenes/fall_core.js';
import { makeMixer } from './audio_masa.mjs';

export function synthFall(ep) {
  const { tl, ghosts, bounces } = fallCues(ep);
  const D = tl.duration, [r1, r2, r3] = tl.rounds;
  const m = makeMixer(D, 2727);
  m.silences.push([tl.silence0, r3.land - 2 / 30]);
  m.room(0.08);

  for (const r of tl.rounds) {
    m.tok(r.launch - 0.32, 1800, 0.07, 0.02, -0.2);              // mandal kalkar
    m.tok(r.launch + 0.01, 2600, 0.13, 0.025, -0.1);             // tetik: raf düşer, mandal vurur
    if (r.i < 2) m.whoosh(r.launch, r.launch + Math.min(1.2, 0.25 + r.v / 40), 0.03 + 0.05 * Math.min(1, r.v / 30), false);
    if (r.i < 2) {
      // iki top aynı anda: tek gövde + tık (ses, görüntünün sonucu gibi 15 ms sonra)
      m.body(r.land + 0.015, 140, 0.24, 0.12, 0.2);
      m.tok(r.land + 0.015, 980, 0.18, 0.04, 0);
    }
  }
  for (const g of ghosts) if (g.round < 2) m.tok(g.t + 0.07 * (g.round === 0 ? 6 : 6) / 6, 2600 + 160 * (ghosts.indexOf(g) % 11), 0.06, 0.016, 0.15);
  // kanca: iki topun düşüşü boyunca hafif hava sesi (1. tur sessiz kalmasın)
  m.whoosh(r1.launch, r1.land, 0.07, true);
  for (const b of bounces) if (b.round < 2) m.tok(b.t + 0.015, 1150, 0.06, 0.03, 0);
  // yeniden dolum: yeni toplar hazneden düşer (kâğıt boruda yuvarlanma + oturma tıkı)
  for (const a of [...tl.reload, tl.dive[0] + 0.3]) { m.paper(a, 0.45, 0.04); m.tok(a + 0.42, 1500, 0.08, 0.03, 0.1); }
  // vay anı: B'nin izi A'nın sütununa oturur — tek tık
  m.whoosh(r1.land + MERGE.delay, r1.land + MERGE.delay + MERGE.dur, 0.025, false);
  m.tok(r1.land + MERGE.delay + MERGE.dur, 1760, 0.14, 0.06, 0);
  // pencil: ölçü çizgileri
  for (const r of [r1, r2]) m.pencil(r.land + 0.33, r.land + 0.8, 0.05);
  m.pencil(r3.land + 2.9, r3.land + 3.4, 0.05);
  // doruk: B'nin uçuşu boyunca tek riser, inişten önce sessizlik, tek impact
  m.riser(tl.riser[0], tl.riser[1], 0.34);
  m.whoosh(r3.launch, r3.launch + 0.9, 0.12, false);
  m.impact(r3.land - 2 / 30, 1.0);
  m.pad(0.3, tl.dive[0] + 0.4, 0.03, 1.2, 1.2);
  m.whoosh(tl.dive[0] - 0.1, tl.dive[1] + 0.2, 0.2, true);       // dalış: döngüye iner
  m.bed(tl.dive[1] - 0.6, D + r1.launch + 0.3, 0.05);             // dikiş yatağı (başa sarılır)
  return m.master();
}

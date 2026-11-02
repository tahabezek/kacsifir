// "Hikâye" çekirdeği (tarayıcı + node): ölçülmüş anlatımdan zaman çizelgesi ve otomatik altyazı parçaları.
// Film dosyaları (engine/films/f<id>.js) zamanları T üzerinden okur: T.l03 (satır başı), T.l03end, T.w('l03', 'kelime').
import { buildYolTimeline } from './scenes/yolculuk_core.js';

export function hikayeTimes(ep, voice) {
  const tl = buildYolTimeline(ep, voice), { L, W } = tl;
  const T = { loop0: tl.loop0, D: tl.duration };
  for (const id of Object.keys(L)) { T[id] = L[id].t0; T[id + 'end'] = L[id].end; }
  T.w = (id, key, edge) => W(id, key, edge);
  T.l01end = L.l01.end;
  T.lastEnd = L[ep.voice.lines.at(-1).id].end;
  return { tl, T };
}

// Altyazı parçaları: ekrandaki metin (text) ile okunan metin (tts) cümle/virgül sınırlarından hizalanır; her parçanın
// başlangıcı, okunan metindeki ilk kelimesinin ölçülmüş zamanıdır. Uzun parçalar 44 karakteri aşmayacak biçimde bölünür.
export function autoChunks(ep) {
  const out = {};
  const split = s => s.split(/(?<=[.?!:;,]["”“]?)\s+/).filter(Boolean);   // tırnakla biten cümle de bölünür
  for (const ln of ep.voice.lines) {
    let a = split(ln.text), b = split(ln.tts);
    if (a.length !== b.length) { a = ln.text.split(/(?<=[.?!:])\s+/); b = ln.tts.split(/(?<=[.?!:])\s+/); }
    if (a.length !== b.length) { out[ln.id] = [[ln.text, 0]]; continue; }
    const res = []; let wi = 0, cur = null;
    a.forEach((s, i) => {
      const n = b[i].trim().split(/\s+/).length, tw = s.trim().split(/\s+/);
      // uzun cümle: ekrandaki ve okunan kelime sayısı eşitse (rakam yoksa) kelime sınırından ~42 karakterlik parçalara bölünür
      if (s.length > 48 && tw.length === n) {
        if (cur) { res.push(cur); cur = null; }
        const k = Math.ceil(s.length / 42), per = Math.ceil(tw.length / k);
        for (let j = 0; j < tw.length; j += per) res.push([tw.slice(j, j + per).join(' '), wi + j]);
        wi += n; return;
      }
      if (cur && (cur[0] + ' ' + s).length <= 44 && !/[.?!]$/.test(cur[0])) cur[0] += ' ' + s;
      else { if (cur) res.push(cur); cur = [s, wi]; }
      wi += n;
    });
    if (cur) res.push(cur);
    out[ln.id] = res;
  }
  return out;
}

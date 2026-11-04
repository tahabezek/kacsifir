// Senaryo → bölüm dosyası: research/SENARYOLAR.md içindeki "### № <id>" bölümlerini okur, her "- **A:**" / "- **S:**"
// satırını bir anlatım satırına çevirir (A: Anlatıcı, S: Soran), seslendirme metninde rakamları Türkçe yazıya döker
// ve episodes/<id>-*.json dosyasının voice alanını yeniler.
//   node tools/senaryo_json.mjs 041 060 ...   (id verilmezse hepsi)
import fs from 'node:fs';
import path from 'node:path';

const VOICE_A = { name: 'tr-TR-AhmetNeural', rate: '+25%' };
const VOICE_S = { voice: 'tr-TR-EmelNeural', rate: '+15%', pitch: '+2Hz' };

const ONES = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
export function sayi(n) {
  if (n === 0) return 'sıfır';
  const parts = [];
  const th = Math.floor(n / 1000), h = Math.floor((n % 1000) / 100), t = Math.floor((n % 100) / 10), o = n % 10;
  if (th) parts.push(th === 1 ? 'bin' : sayi(th) + ' bin');
  if (h) parts.push(h === 1 ? 'yüz' : ONES[h] + ' yüz');
  if (t) parts.push(TENS[t]);
  if (o) parts.push(ONES[o]);
  return parts.join(' ');
}
// "1960'ta" → "bin dokuz yüz altmışta"; ek, senaryoda okunuşa uygun yazılmıştır
// Yabancı adların okunuşu (Türkçe sesin doğru okuması için; ekler okunuşa göre yazılır)
const OKUNUS = [[/Ludger'ın/g, "Lüdjer'in"], [/Ludger Sylbaris/g, 'Lüdjer Silbaris'], [/Bågenholm/g, 'Bogenholm'], [/Manjhi'yi/g, "Mancı'yı"], [/Manjhi'nin/g, "Mancı'nın"], [/Manjhi/g, 'Mancı'],
  [/Jeanne Calment/g, 'Jan Kalman'], [/Jeanne/g, 'Jan'], [/Jessop'un/g, "Cesup'un"], [/Jessop/g, 'Cesup'], [/Yamaguchi'yi/g, "Yamaguçi'yi"], [/Yamaguchi/g, 'Yamaguçi'],
  [/John Mainstone/g, 'Con Meynstoun'], [/Mainstone'u/g, "Meynstoun'u"], [/Mainstone/g, 'Meynstoun'], [/Michel Siffre/g, 'Mişel Sifr'], [/Siffre'nin/g, "Sifr'in"], [/Siffre/g, 'Sifr'],
  [/Juliane Koepcke'nin/g, "Yuliane Köpke'nin"], [/Juliane'yi/g, "Yuliane'yi"], [/Juliane/g, 'Yuliane'], [/Roy Sullivan/g, 'Roy Salivın'], [/Maričić/g, 'Mariçiç'], [/Cuvier/g, 'Küvye'],
  [/Randy Gardner/g, 'Rendi Gardnır'], [/Clive Wearing/g, 'Klayv Viring'], [/Clive'ı/g, "Klayv'ı"], [/Clive/g, 'Klayv'], [/George/g, 'Corc'], [/Mauro Prosperi/g, 'Mauro Prosperi'],
  [/Hachikō/g, 'Haçiko'], [/Shibuya/g, 'Şibuya'], [/Terry Fox/g, 'Teri Foks'], [/Hiroo Onoda/g, 'Hiro Onoda']];
const okunus = s => OKUNUS.reduce((a, [r, b]) => a.replace(r, b), s);
export const seslendir = s => okunus(s).replace(/(\d{1,3}(?:\.\d{3})+|\d+)(?:'(\p{L}+))?/gu, (_, num, ek) => sayi(Number(num.replace(/\./g, ''))) + (ek || ''));

// SUREC_SENARYOLARI.md (4 Kasım, süreç dili) sonra okunur: aynı id iki dosyada varsa onun senaryosu geçerlidir
const md = ['research/SENARYOLAR.md', 'research/SUREC_SENARYOLARI.md'].filter(f => fs.existsSync(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const want = process.argv.slice(2);
for (const block of md.split(/^### № /m).slice(1)) {
  const id = block.slice(0, 3);
  if (want.length && !want.includes(id)) continue;
  // başlıkta "· sakin" varsa (Senin sayın serisi) iki ses de daha yavaş okur
  const calm = /· sakin\s*$/.test(block.split('\n')[0]);
  const VA = calm ? { ...VOICE_A, rate: '+14%' } : VOICE_A, VS = calm ? { ...VOICE_S, rate: '+8%' } : VOICE_S;
  const rows = [...block.matchAll(/^- \*\*([AS]):\*\* (.+)$/gm)].map(m => ({ who: m[1], text: m[2].trim() }));
  const lines = rows.map((r, i) => ({ id: 'l' + String(i + 1).padStart(2, '0'), who: r.who, text: r.text, tts: seslendir(r.text.replace(/[“”"]/g, '')), ...(r.who === 'S' ? VS : {}) }));
  const gaps = {};
  lines.forEach((l, i) => { const nx = lines[i + 1]; gaps[l.id] = !nx ? 0.3 : l.who === 'S' ? 0.15 : nx.who === 'S' ? 0.2 : /^Yoksa/.test(nx.text) ? 0.45 : 0.3; });
  const file = fs.readdirSync('episodes').find(f => f.startsWith(id + '-') && f.endsWith('.json'));
  const f = path.join('episodes', file), ep = JSON.parse(fs.readFileSync(f, 'utf8'));
  ep.template = 'cizgi'; ep.gl = false; delete ep.samples;
  ep.voice = { ...VA, tight: 0.28, gaps, lines };
  fs.writeFileSync(f, JSON.stringify(ep, null, 2) + '\n');
  console.log(id, lines.length, 'satır', lines.map(l => l.who).join(''));
}

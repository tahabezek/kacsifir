// "İlan" şablonu (052, 29 Ekim 20.30): 103 yıl önce tam bu dakikada Cumhuriyet ilan edildi.
// Kare 0: gece, Ulus'taki Birinci Meclis binası (cephe 1920'ler fotoğraflarına göre), köşede saat 20.28; başlık l01.
// Kanca: kamera yayla içeri (1 → 1,12), "dakikada" yelkovan 20.29'a tıklar, "Ankara'da" pencereler üç grupta yanar.
// l02: kamera orta kapıdan geçer; salon kapı açıklığından görünür (açıklık kadrajı doldurunca dış sahne bırakılır);
// 158 milletvekili, sayaç "yüz"de. l03: saat 18.00'a geri döner, "yirmi otuzda" 20.30'a süpürür. l04: "Yaşasın"da
// herkes ayağa kalkar, salonun ışığı bir kademe artar. l05: pusulalar sandığa; ikinci "yüz"de 158 / 158; "Mustafa"da
// opak bir kart olarak gerçek fotoğraf (3 Kasım 1923 Resimli Gazete kapağından; yalnız dikdörtgen kırpma).
// l06: kart kalkar (sert kesme), kamera kapıdan dışarı, bina tek başına Ankara noktasına küçülür; gece haritası,
// Ankara'dan 1927 vilayetlerine haber atımları. l07: 1927 sayımı il nüfuslarına göre ışık noktaları (1 nokta ≈ 28.700
// kişi, il alanına göre yayılım). Sessizlik. l08 (doruk): noktalar 2025 il nüfuslarına çoğalır, "86 milyon" kırmızı.
// l09: şehirlerin üstünde boş yorum balonları; bayram satırı ve bayrak, 1 sn sonra takip çağrısı.
// Döngü: harita söner, bina Ankara'dan büyüyerek geri gelir, saat 20.28, pencereler söner (kare 0).
// Her şey t'nin saf fonksiyonudur; sürekli döngüler film süresine tam tur sayar (dikiş).
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { W, ease, seg, lerp, clamp01, mulberry32, spring } from '../core.js';
import { C, F, setFont, wrap, revealText, grain } from '../tower.js';
import { BUILDING_CARD, ARCH_RISE, pointedArch, drawBuilding, drawRoofFlag, drawPole, drawDeputy, drawBench, drawUrn, drawBallot, drawClock, drawBubble, drawFlagPlain, windowRects, NIGHT, NIGHT2, LIGHT, mix } from '../ilan_chars.js';
import { buildYolTimeline } from './yolculuk_core.js';

const SAFE = { x0: 90, x1: 920 };
const STAGE_TOP = 705;
const ANCHOR = { x: 540, y: 1130 };
const HOME = { x: 540, y: 1130 };                  // Ankara = dış sahnenin merkezi (dünya koordinatı)
const BW = 940, GROUND = HOME.y + 190;             // bina genişliği ve zemin
const EXT = { x0: HOME.x - 600, x1: HOME.x + 600, y1: HOME.y + 820 };
const CLOCK = { x: 838, y: 838, r: 86 };
const ZMAP = 0.0266, ZWIN = 26;
const SEA = NIGHT, LAND = '#3D3B35', NEIGHBOR = '#2E2D29';
const PROV = [["İstanbul",28.96,41.01,794444,15754053],["Ankara",32.839,39.936,404720,5910320],["İzmir",27.138,38.413,526005,4504185],["Bursa",29.081,40.191,401595,3263011],["Antalya",30.696,36.908,204372,2777677],["Konya",32.516,37.847,504384,2343409],["Adana",35.325,36.986,227718,2283609],["Şanlıurfa",38.792,37.158,203595,2265800],["Gaziantep",37.379,37.063,215762,2222415],["Kocaeli",29.95,40.772,286600,2161171],["Mersin",34.617,36.8,210047,1956428],["Diyarbakır",40.219,37.916,194316,1852356],["Hatay",36.161,36.203,0,1577531],["Manisa",27.426,38.612,374013,1477756],["Kayseri",35.487,38.722,251370,1458991],["Samsun",36.33,41.287,274065,1392403],["Balıkesir",27.884,39.651,421066,1284517],["Tekirdağ",27.517,40.983,131446,1208441],["Aydın",27.845,37.848,212541,1172107],["Kahramanmaraş",36.945,37.587,186855,1146278],["Sakarya",30.403,40.776,0,1123693],["Van",43.417,38.502,75329,1112013],["Muğla",28.367,37.217,175390,1099547],["Denizli",29.096,37.783,245048,1060975],["Eskişehir",30.521,39.777,154332,927956],["Mardin",40.735,37.313,183471,903576],["Trabzon",39.722,41.005,290303,823323],["Ordu",37.883,40.983,202354,768087],["Malatya",38.309,38.351,306882,755854],["Afyonkarahisar",30.539,38.758,259377,751808],["Erzurum",41.276,39.91,270426,736877],["Batman",41.133,37.883,0,662626],["Sivas",37.017,39.75,329551,631401],["Adıyaman",38.277,37.763,0,617821],["Tokat",36.554,40.31,263063,614141],["Elazığ",39.217,38.667,213777,605678],["Zonguldak",31.783,41.45,268909,585203],["Çanakkale",26.4,40.15,181735,573976],["Şırnak",42.461,37.516,0,573666],["Kütahya",29.983,39.424,302426,570478],["Osmaniye",36.25,37.075,107694,564123],["Çorum",34.953,40.549,247926,519590],["Ağrı",43.054,39.722,0,491489],["Giresun",38.417,40.9,165033,455074],["Isparta",30.55,37.767,144437,445303],["Aksaray",34.03,38.369,127031,441136],["Edirne",26.574,41.673,150840,422438],["Düzce",31.158,40.842,0,415622],["Yozgat",34.808,39.821,209497,413208],["Muş",41.491,38.733,0,389127],["Kastamonu",33.783,41.383,336501,379934],["Kırklareli",27.225,41.735,108989,379595],["Niğde",34.679,37.967,166056,374492],["Uşak",29.4,38.683,0,374405],["Bitlis",42.117,38.4,90631,360423],["Rize",40.52,41.025,171657,346947],["Amasya",35.833,40.65,114884,342242],["Siirt",41.946,37.842,102433,332369],["Bolu",31.6,40.733,218246,327173],["Nevşehir",34.712,38.625,0,320150],["Yalova",29.275,40.656,0,311635],["Kırıkkale",33.514,39.842,0,282830],["Bingöl",40.498,38.885,0,282299],["Hakkâri",43.74,37.577,24980,279681],["Burdur",30.283,37.717,83614,277226],["Kars",43.096,40.608,204846,268991],["Karaman",33.217,37.183,0,262355],["Karabük",32.633,41.2,0,249614],["Kırşehir",34.161,39.145,126901,242777],["Erzincan",39.491,39.746,132325,239625],["Bilecik",29.979,40.143,113660,228995],["Sinop",35.151,42.027,169965,225848],["Bartın",32.337,41.634,0,206663],["Iğdır",44.045,39.924,0,205071],["Çankırı",33.514,40.647,157219,200549],["Artvin",41.829,41.183,0,167531],["Kilis",37.117,36.717,0,157363],["Gümüşhane",39.478,40.46,122231,138807],["Ardahan",42.7,41.117,90066,90392],["Tunceli",39.548,39.106,0,85083],["Bayburt",40.226,40.255,0,82836],["Doğubayazıt",44.083,39.547,104586,0],["Şebinkarahisar",38.423,40.288,108735,0]];
const MERGED = { 'Doğubayazıt': 'Ağrı', 'Şebinkarahisar': 'Giresun' };   // 1927 vilayetleri bugünkü illerde
// il alanları km² (Wikidata P2046; Hakkâri 7.095; tarihî iki vilayet için yaklaşık) — il içi yayılım için
const AREA = {"İstanbul":5343,"Ankara":25615,"İzmir":11891,"Bursa":10813,"Antalya":20177,"Konya":40838,"Adana":13844,"Şanlıurfa":19091,"Gaziantep":6000,"Kocaeli":3397,"Mersin":15737,"Diyarbakır":15101,"Hatay":5403,"Manisa":13339,"Kayseri":16917,"Samsun":9579,"Balıkesir":14442,"Tekirdağ":6190,"Aydın":8007,"Kahramanmaraş":14327,"Sakarya":4824,"Van":20921,"Muğla":12654,"Denizli":11868,"Eskişehir":13652,"Mardin":8780,"Trabzon":4495,"Ordu":5914,"Malatya":12146,"Afyonkarahisar":14016,"Erzurum":25006,"Batman":4477,"Sivas":28164,"Adıyaman":7332,"Tokat":9998,"Elazığ":9383,"Zonguldak":3342,"Çanakkale":9737,"Şırnak":7078,"Kütahya":11634,"Osmaniye":3320,"Çorum":12428,"Ağrı":11099,"Giresun":6934,"Isparta":8946,"Aksaray":7626,"Edirne":6145,"Düzce":2492,"Yozgat":13690,"Muş":8196,"Kastamonu":13064,"Kırklareli":6459,"Niğde":7234,"Uşak":5341,"Bitlis":8294,"Rize":3835,"Amasya":5520,"Siirt":5717,"Bolu":7410,"Nevşehir":5485,"Yalova":798,"Kırıkkale":4365,"Bingöl":8003,"Hakkâri":7095,"Burdur":6887,"Kars":9442,"Karaman":8678,"Karabük":2420,"Kırşehir":6584,"Erzincan":11815,"Bilecik":4179,"Sinop":5717,"Bartın":2120,"Iğdır":3588,"Çankırı":7388,"Artvin":7393,"Kilis":1412,"Gümüşhane":6575,"Ardahan":4934,"Tunceli":7582,"Bayburt":3652,"Doğubayazıt":4000,"Şebinkarahisar":3000};
const POP27 = 13648270, POP25 = 86092168, NDOT = 3000;   // 1 nokta ≈ 28.700 kişi
const KM = 1832 / 111;                                    // 1 km ≈ 16,5 dünya px (1° boylam = 1832 px)
const BUBBLES = ['İstanbul', 'İzmir', 'Trabzon', 'Diyarbakır', 'Antalya', 'Erzurum', 'Van', 'Edirne', 'Samsun', 'Konya', 'Gaziantep'];
// salon: 9 sıra, toplam 158 sandalye (öndeki sıra kısa ve küçük, arkadaki uzun ve büyük)
const ROWN = [12, 14, 16, 17, 18, 19, 20, 21, 21];
// anlatım öbekleri: [metindeki başlangıç, öbeğin ilk anlatım kelimesi (önek)]; öbek kendi kelimesinden 0,05 sn önce açılır
const CHUNKS = { l02: [['158', 'yüz']], l03: [['saat', 'saat']], l04: [['Yaşasın', 'yaşasın']], l05: [['ve 158', 've']], l07: [['bu topraklarda', 'bu']], l08: [['86', 'seksen']], l09: [['Yorumlara', 'yorumlara']] };

export function ilanTimes(tl) {
  const { L, W: Wd } = tl;
  const nth = (id, key, n) => { const ws = L[id].words.filter(w => w.w.toLocaleLowerCase('tr').startsWith(key)); return ws[Math.min(n, ws.length - 1)].t0; };
  const T = {
    l02: L.l02.t0, l03: L.l03.t0, l04: L.l04.t0, l05: L.l05.t0, l06: L.l06.t0, l07: L.l07.t0, l08: L.l08.t0, l09: L.l09.t0,
    dakika: Wd('l01', 'dakikada'), ankara: Wd('l01', 'ankara'),
    yuz: Wd('l02', 'yüz'), aksam: Wd('l03', 'akşam'), altida: Wd('l03', 'altıda'), yirmi: Wd('l03', 'yirmi'), otuz: Wd('l03', 'otuzda'), kabul: Wd('l03', 'kabul'),
    yasasin: Wd('l04', 'yaşasın'), secildi: Wd('l05', 'seçildi'), yuz2: nth('l05', 'yüz', 1), mustafa: Wd('l05', 'mustafa'),
    haber: Wd('l06', 'bütün'), memleket: Wd('l06', 'memlekete'), sayim: Wd('l07', 'sayım'), on: Wd('l07', 'on'), bugun: Wd('l08', 'bugün'), seksen: Wd('l08', 'seksen'), milyon: Wd('l08', 'milyon'),
    sehir: Wd('l09', 'şehirden'), yorum: Wd('l09', 'yorumlara'), loop0: tl.loop0,
  };
  T.s = id => L[id].words[0].t0;
  T.in0 = T.l02 - 0.35; T.in1 = T.in0 + 1.0;            // dış → salon (kapıdan)
  T.dim0 = T.mustafa - 0.4; T.ph0 = T.mustafa - 0.05; T.phOut = T.l06 - 0.25;   // kart: salon önce %35'e iner
  T.zo0 = T.phOut + 0.32; T.zo1 = T.zo0 + 1.9;            // salon → dış → harita
  T.wire0 = T.zo0 + 1.0; T.wire1 = L.l06.end + 0.45;
  T.hero = T.seksen; T.sil0 = L.l07.end + 0.12; T.impact = T.s('l08') - 0.03; T.inkHero = T.seksen + 2.2;
  T.bayram = L.l09.end + 0.15; T.follow = T.bayram + 1.0;
  T.ring = id => L[id].end;
  return T;
}

export async function makeIlanRenderer(ep, canvas) {
  const ctx = canvas.getContext('2d');
  const voice = await (await fetch(`../assets/voice/${ep.id}/words.json`)).json();
  const tl = buildYolTimeline(ep, voice), { L } = tl, D = tl.duration, T = ilanTimes(tl);
  const cyc = (t, per) => { const n = Math.max(1, Math.round(D / per)); return ((t / D) * n) % 1; };
  const PH = (t, per) => 2 * Math.PI * cyc(t, per);   // dikişte aynı fazda biten açı

  // ——— harita: Merkator, Ankara = HOME ———
  const countries = await (await fetch('../node_modules/world-atlas/countries-50m.json')).json();
  const geoms = countries.objects.countries.geometries, ctry = id => feature(countries, geoms.find(g => g.id === id));
  const TR = ctry('792'), NEIGH = ['300', '100', '268', '051', '031', '364', '368', '760', '196', '422', '804', '642', '643'].map(id => geoms.find(g => g.id === id) && ctry(id)).filter(Boolean);
  const S = 104960, proj0 = geoMercator().scale(S).translate([0, 0]), ank = proj0([32.854, 39.92]);
  const proj = geoMercator().scale(S).translate([HOME.x - ank[0], HOME.y - ank[1]]);
  const trPath = new Path2D(geoPath(proj)(TR)), neighPaths = NEIGH.map(f => new Path2D(geoPath(proj)(f)));
  // Türkiye'nin sınır kutusu ortası ekranda y ≈ 1100'e gelir
  const bb = geoPath(proj).bounds(TR), MAPC = [(bb[0][0] + bb[1][0]) / 2, (bb[0][1] + bb[1][1]) / 2 + (ANCHOR.y - 1100) / ZMAP];
  const probe = new OffscreenCanvas(4, 4).getContext('2d');
  const inTR = p => probe.isPointInPath(trPath, p[0], p[1]);

  // ——— nüfus noktaları: il başına dürüst sayı, il merkezi çevresine il alanına göre yayılım ———
  const rnd = mulberry32(52);
  const prov = PROV.map(([name, lon, lat, p27, p25]) => ({ name, lon, lat, p27, p25, xy: proj([lon, lat]) }));
  const byName = Object.fromEntries(prov.map(p => [p.name, p]));
  const alloc = (key, total) => { const raw = prov.map(p => p[key] / POP25 * NDOT); const base = raw.map(Math.floor); const left = total - base.reduce((a, b) => a + b, 0); raw.map((v, i) => [v - base[i], i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, i]) => base[i]++); return base; };
  const n25 = alloc('p25', NDOT), n27 = alloc('p27', Math.round(NDOT * POP27 / POP25));
  const DOTS = [];
  const scatter = p => {   // σ ≈ 0,35·√alan (km); sınır dışına düşen yeniden çekilir
    const sp = 0.35 * Math.sqrt(AREA[p.name] || 5000) * KM;
    for (let tries = 0; tries < 40; tries++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(-2 * Math.log(1 - rnd() * 0.995)) * sp; const q = [p.xy[0] + Math.cos(a) * d, p.xy[1] + Math.sin(a) * d]; if (inTR(q)) return q; }
    return p.xy;
  };
  prov.forEach((p, i) => { for (let k = 0; k < n27[i]; k++) DOTS.push({ q: scatter(p), era: 27, home: MERGED[p.name] || p.name }); });
  const have = {}; for (const d of DOTS) have[d.home] = (have[d.home] || 0) + 1;
  prov.forEach((p, i) => { const add = n25[i] - (have[p.name] || 0); for (let k = 0; k < add; k++) DOTS.push({ q: scatter(p), era: 25, home: p.name }); });
  DOTS.forEach(d => { d.r = rnd(); d.tw = rnd() * 40; d.a = d.era === 27 ? lerp(T.sayim - 0.1, T.on + 0.35, d.r) : lerp(T.bugun - 0.05, T.milyon + 0.3, d.r); });

  // ——— haber atımları: Ankara'dan 1927 vilayet merkezlerine; sabit hız, yakından uzağa ———
  const ANK = proj([32.854, 39.92]);
  const WIRES = prov.filter(p => p.p27 > 0 && p.name !== 'Ankara').map(p => ({ p, len: Math.hypot(p.xy[0] - ANK[0], p.xy[1] - ANK[1]) })).sort((a, b) => a.len - b.len);
  const maxLen = Math.max(...WIRES.map(w => w.len));
  WIRES.forEach((w, i) => { w.a = lerp(T.wire0, T.wire1 - 0.75, (i / (WIRES.length - 1)) * 0.6 + 0.4 * w.len / maxLen) - 0.1 * (w.len / maxLen); w.dur = 0.25 + 0.5 * w.len / maxLen; w.ph = (i * 0.618) % 1; });

  // ——— portre (olduğu gibi; kaynaklar assets/052/SOURCE.md) ———
  const photo = new Image(); photo.src = `../assets/${ep.id}/gazete_1923_portre.png`; await photo.decode();
  const CARD = { w: 480, b: 14 }; CARD.ih = (CARD.w - 2 * CARD.b) * photo.naturalHeight / photo.naturalWidth; CARD.h = CARD.ih + 2 * CARD.b; CARD.x = 540 - CARD.w / 2; CARD.y = 724;

  // ——— dış kamera: [t, z, fx, fy, eğri]; zoom log uzayında; 'pin': Ankara'nın ekrandaki yeri doğrusal kayar ———
  const DOORR = windowRects(BW).find(r => r.door);
  const DOOR = { x: HOME.x + DOORR.x, y: GROUND + DOORR.y + DOORR.hh * 0.55 };
  const hookZ = t => 1 + 0.12 * spring(t * 0.75 / T.in0, 170, 26);
  const KEYS = [
    [T.in0, hookZ(T.in0), HOME.x, HOME.y],
    [T.in1, ZWIN, DOOR.x, DOOR.y, 'state'],
    [T.zo0, ZWIN, DOOR.x, DOOR.y, 'lin'],
    [T.zo0 + 0.6, 1.1, HOME.x, HOME.y, 'state'],
    [T.zo1, ZMAP, MAPC[0], MAPC[1], 'pin'],
    [T.seksen + 0.6, ZMAP * 1.03, MAPC[0], MAPC[1], 'state'],
    [tl.loop0, ZMAP * 1.05, MAPC[0], MAPC[1], 'lin'],
    [D - 0.04, 1, HOME.x, HOME.y, 'pin'],
    [D + 1, 1, HOME.x, HOME.y, 'lin'],
  ];
  function camAt(t) {
    if (t < T.in0) return { z: hookZ(t), x: HOME.x, y: HOME.y };
    let k = 0; while (k < KEYS.length - 2 && t >= KEYS[k + 1][0]) k++;
    const a = KEYS[k], b = KEYS[k + 1], u0 = clamp01((t - a[0]) / Math.max(1e-6, b[0] - a[0])), u = b[4] === 'lin' ? u0 : ease.state(u0);
    const za = Math.log(a[1]), zb = Math.log(b[1]), z = Math.exp(lerp(za, zb, u));
    if (b[4] === 'pin') { const sa = [ANCHOR.x + (HOME.x - a[2]) * a[1], ANCHOR.y + (HOME.y - a[3]) * a[1]], sb = [ANCHOR.x + (HOME.x - b[2]) * b[1], ANCHOR.y + (HOME.y - b[3]) * b[1]]; return { z, x: HOME.x - (lerp(sa[0], sb[0], u) - ANCHOR.x) / z, y: HOME.y - (lerp(sa[1], sb[1], u) - ANCHOR.y) / z }; }
    const w = Math.abs(zb - za) > 0.5 ? (z - b[1]) / (a[1] - b[1]) : 1 - u;
    return { z, x: b[2] + (a[2] - b[2]) * w, y: b[3] + (a[3] - b[3]) * w };
  }
  const inHall = t => t >= T.in0 && t < T.zo0 + 0.6;
  let tCover = T.in1, tUncover = T.zo0;   // açıklığın kadrajı ilk kapladığı ve bıraktığı an
  const crowdK = t => t < T.zo0 ? ease.state(seg(t, tCover, 0.2)) : 1 - ease.state(seg(t, tUncover - 0.2, 0.2));
  const hallZ = t => t < T.zo0 ? lerp(0.9, 1, ease.state(seg(t, T.in0 + 0.3, T.in1 - T.in0 - 0.3))) * (1 + 0.09 * seg(t, T.in1, T.zo0 - T.in1)) : lerp(1.09, 0.9, ease.state(seg(t, T.zo0, 0.6)));
  // kapı açıklığı (ekran uzayında): kemerli dikdörtgen
  function doorPath(cam) {
    const sx = x => ANCHOR.x + (x - cam.x) * cam.z, sy = y => ANCHOR.y + (y - cam.y) * cam.z;
    const x0 = sx(HOME.x + DOORR.x - DOORR.ww / 2), x1 = sx(HOME.x + DOORR.x + DOORR.ww / 2), y1 = sy(GROUND + DOORR.y + DOORR.hh), ys = sy(GROUND + DOORR.y) + ARCH_RISE * (x1 - x0);
    const p = new Path2D(); p.moveTo(x0, y1); pointedArch(p, x0, x1, ys); p.lineTo(x1, y1); p.closePath();
    // açıklık sahneyi tamamen kaplıyor mu (kemer köşeleri dahil)
    const covers = x0 <= 0 && x1 >= W && y1 >= 1920 && ys <= STAGE_TOP;   // dikdörtgen kısım sahneyi kaplıyor
    return { p, covers };
  }

  for (let x = T.in0; x <= T.in1; x += 1 / 120) if (doorPath(camAt(x)).covers) { tCover = x; break; }
  for (let x = T.zo0; x <= T.zo0 + 0.6; x += 1 / 120) if (!doorPath(camAt(x)).covers) { tUncover = x; break; }

  // ——— saat: dakika (günün) ———
  function clockMin(t) {
    const base = 20 * 60 + 28;
    if (t >= tl.loop0 || t < T.dakika - 0.04) return base;
    if (t < T.aksam - 0.15) return base + ease.state(seg(t, T.dakika - 0.04, 0.12));
    if (t < T.altida + 0.25) return lerp(base + 1, 18 * 60, ease.state(seg(t, T.aksam - 0.15, 0.55)));
    return lerp(18 * 60, 20 * 60 + 30, ease.state(seg(t, T.altida + 0.25, T.otuz - T.altida - 0.25)));
  }
  const clockK = t => t >= tl.loop0 ? (t >= D - 0.5 ? 1 : 0) : 1 - ease.exit(seg(t, T.dim0, 0.3));   // döngüde opak, kesmeyle
  function clock(t) {
    const k = clockK(t); if (k <= 0) return;
    const m = clockMin(t), hh = Math.floor(m / 60), mm = Math.floor(m % 60);
    ctx.save(); ctx.globalAlpha = k; ctx.translate(CLOCK.x, CLOCK.y); drawClock(ctx, CLOCK.r, m); ctx.restore();
    tag(`${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')}`, CLOCK.x, CLOCK.y + CLOCK.r + 58, k, 'center', 40);
  }

  // ——— dış sahne (gece Ankara) ———
  const starR = mulberry32(11), STARS = Array.from({ length: 70 }, () => ({ x: EXT.x0 + starR() * (EXT.x1 - EXT.x0), y: HOME.y - 440 + starR() * 340, s: 1.2 + starR() * 2.2, ph: starR() * 40, per: 6.28 / (2.2 + starR() * 2.2) }));
  const crowdR = mulberry32(12), CROWD = Array.from({ length: 11 }, (_, i) => ({ x: HOME.x - 420 + i * 78 + crowdR() * 30, s: 0.85 + crowdR() * 0.3, k: Math.floor(crowdR() * 3) })).filter(c => Math.abs(c.x - HOME.x) > 110);
  const POLE = { x: HOME.x + 525, y: GROUND + 46, h: 400 };
  const K = BUILDING_CARD;
  const EAVE = { x: HOME.x + BW / 2 + K.eave * BW * 0.4, y: GROUND - (K.base + K.floor) * BW - K.cornice * BW * 0.5 };
  // pencere ışığı: kanca öncesi loş; "Ankara'da" üç grup 70 ms arayla yanar; döngüde söner
  const winLit = t => i => {
    const g = i < 5 ? 0 : i >= 10 ? 1 : 2, on = ease.state(seg(t, T.ankara + g * 0.07, 0.15)), off = t >= tl.loop0 ? ease.state(seg(t, D - 0.7, 0.45)) : 0;
    return 0.22 + 0.78 * on * (1 - off);
  };
  function exterior(t, z) {
    // çevre (bina dışında her şey) uzaklaştıkça söner: bina tek başına Ankara noktasına küçülür
    const env = clamp01((z - 0.45) / 0.45);
    if (env > 0) {
      ctx.save(); ctx.globalAlpha = env;
      for (const s of STARS) { const a = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(s.ph + PH(t, s.per)), 2); ctx.globalAlpha = a * env; ctx.fillStyle = LIGHT; ctx.fillRect(s.x, s.y, s.s, s.s); }
      ctx.globalAlpha = env;
      // uzak Ankara silueti: kale tepesi (sol arka), alçak evler
      ctx.fillStyle = NIGHT2; ctx.beginPath(); ctx.moveTo(EXT.x0, GROUND - 150); ctx.lineTo(EXT.x0 + 120, GROUND - 230); ctx.lineTo(EXT.x0 + 230, GROUND - 250); ctx.lineTo(EXT.x0 + 330, GROUND - 200); ctx.lineTo(EXT.x0 + 420, GROUND - 160); ctx.lineTo(EXT.x1, GROUND - 150); ctx.lineTo(EXT.x1, GROUND); ctx.lineTo(EXT.x0, GROUND); ctx.closePath(); ctx.fill();
      const hr = mulberry32(14); for (let i = 0; i < 28; i++) { const x = EXT.x0 + 20 + i * 42 + hr() * 10, h = 30 + hr() * 50, y = GROUND - 150 - h * 0.2 - (i < 8 ? 60 - i * 6 : 0); ctx.fillStyle = '#2C2A26'; ctx.fillRect(x, y, 34, h); if (hr() < 0.45) { ctx.fillStyle = mix(NIGHT2, LIGHT, 0.55 + 0.25 * Math.sin(PH(t, 3.7) + i)); ctx.fillRect(x + 12, y + 10, 8, 10); } }
      ctx.fillStyle = '#2F2D29'; ctx.fillRect(EXT.x0, GROUND, EXT.x1 - EXT.x0, EXT.y1 - GROUND);
      ctx.strokeStyle = 'rgba(236,229,213,0.07)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = EXT.x0 - 600; x < EXT.x1; x += 12) { ctx.moveTo(x, GROUND); ctx.lineTo(x + 500, EXT.y1); } ctx.stroke();
      // kapıdan sokağa düşen ışık
      ctx.globalAlpha = 0.5 * env * winLit(t)(11); ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.moveTo(HOME.x - 60, GROUND); ctx.lineTo(HOME.x + 60, GROUND); ctx.lineTo(HOME.x + 150, GROUND + 230); ctx.lineTo(HOME.x - 150, GROUND + 230); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = env;
      // telgraf direği ve iki tel: binanın ARKASINDA; teller saçak köşesindeki izolatörde biter, sağa kadraj dışına gider
      ctx.save(); ctx.translate(POLE.x, POLE.y); drawPole(ctx, POLE.h, 2); ctx.restore();
      ctx.strokeStyle = 'rgba(236,229,213,0.55)'; ctx.lineWidth = 1.6;
      const tops = [[POLE.x - POLE.h * 0.17, POLE.y - POLE.h * 0.97], [POLE.x + POLE.h * 0.17, POLE.y - POLE.h * 0.97]];
      for (const [x, y] of tops) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + EAVE.x) / 2, Math.max(y, EAVE.y) + 22, EAVE.x, EAVE.y - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 90, y + 18, EXT.x1 + 40, y + 4); ctx.stroke(); }
      ctx.restore();
    }
    // bina + çatı bayrağı (bayrak dalgası tam tur)
    ctx.save(); ctx.translate(HOME.x, GROUND); drawBuilding(ctx, BW, winLit(t), PH(t, 4.8));
    ctx.translate(0, -(K.base + K.floor + K.cornice + K.bayRoof) * BW + 4); drawRoofFlag(ctx, 96, PH(t, 2.0));
    ctx.restore();
    // saçak köşesinde izolatör
    ctx.save(); ctx.globalAlpha = env; ctx.fillStyle = LIGHT; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(EAVE.x, EAVE.y - 6, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    if (env > 0) {
      ctx.save(); ctx.globalAlpha = env;
      // bacadan duman (sürekli döngü)
      for (const [bx, i0] of [[HOME.x - 0.4 * BW + 8, 0], [HOME.x + 0.22 * BW + 8, 5]]) {
        const by = GROUND - (K.base + K.floor + K.cornice + K.roof * 0.95) * BW;
        for (let i = 0; i < 5; i++) { const u = (cyc(t, 4.2) + i / 5 + i0 * 0.03) % 1; ctx.globalAlpha = env * 0.35 * Math.sin(u * Math.PI); ctx.fillStyle = '#8B8577'; ctx.beginPath(); ctx.arc(bx + 18 * u + 6 * Math.sin(u * 9 + i), by - 10 - u * 120, 8 + u * 16, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = env;
      for (const c of CROWD) { ctx.save(); ctx.translate(c.x, GROUND + 70); ctx.scale(c.s, c.s); drawDeputy(ctx, 54, c.k, 1, 1); ctx.restore(); }
      ctx.restore();
    }
  }

  // ——— salon (ekran uzayında, kendi yakınlaşmasıyla) ———
  const SEATS = (() => {
    const out = []; let y = 965;
    ROWN.forEach((n, r) => {
      const u = 40 + r * 4.2, pitch = u * 0.92, w = n * pitch;
      for (let c = 0; c < n; c++) out.push({ r, c, x: 540 - w / 2 + (c + 0.5) * pitch, y, u, k: (r * 7 + c * 3) % 5 === 0 ? 2 : (r + c) % 3 === 0 ? 1 : 0, tone: (r + c) % 2 });
      y += u * 0.74;
    });
    return out;
  })();
  const dR = mulberry32(21); SEATS.forEach(s => { s.d = dR() * 0.35; s.b = dR(); });
  const URN = { x: 540, y: 935 };
  function standAt(s, t) {
    const up = ease.enter(seg(t, T.yasasin - 0.05 + s.d, 0.35)), down = ease.state(seg(t, T.l05 - 0.1 + s.d * 0.5, 0.4));
    return up * (1 - down);
  }
  function hall(t) {
    ctx.fillStyle = '#CFC4AC'; ctx.fillRect(-200, STAGE_TOP - 200, W + 400, 1920);
    ctx.fillStyle = '#D9CFBA'; ctx.fillRect(-200, STAGE_TOP - 200, W + 400, 400);
    ctx.strokeStyle = 'rgba(28,27,24,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = -194; x < W + 200; x += 24) { ctx.moveTo(x, STAGE_TOP - 200); ctx.lineTo(x, STAGE_TOP + 200); } ctx.stroke();
    for (const x of [70, 190, 890, 1010]) { ctx.fillStyle = NIGHT2; ctx.beginPath(); ctx.moveTo(x - 32, STAGE_TOP + 180); ctx.lineTo(x - 32, STAGE_TOP + 60); ctx.arc(x, STAGE_TOP + 60, 32, Math.PI, 0); ctx.lineTo(x + 32, STAGE_TOP + 180); ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.fillStyle = '#B8A88A'; ctx.fillRect(330, STAGE_TOP + 60, 420, 120); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(330, STAGE_TOP + 60, 420, 120);
    ctx.fillStyle = '#A08F70'; ctx.fillRect(400, STAGE_TOP + 110, 280, 90); ctx.strokeRect(400, STAGE_TOP + 110, 280, 90);
    ctx.beginPath(); ctx.moveTo(400, STAGE_TOP + 140); ctx.lineTo(680, STAGE_TOP + 140); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#C2B59A'; ctx.fillRect(-200, STAGE_TOP + 200, W + 400, 1920);
    ctx.strokeStyle = 'rgba(28,27,24,0.16)'; ctx.beginPath(); for (let x = -1100; x < 1900; x += 14) { ctx.moveTo(x, STAGE_TOP + 200); ctx.lineTo(x + 700, 2100); } ctx.stroke();
    for (const [x, y] of [[270, 770], [540, 760], [810, 770]]) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, STAGE_TOP - 200); ctx.lineTo(x, y - 14); ctx.stroke(); for (const d of [-26, 0, 26]) { const f = 0.8 + 0.2 * Math.sin(PH(t, 0.7) + x + d); ctx.fillStyle = mix('#CFC4AC', LIGHT, f); ctx.beginPath(); ctx.arc(x + d, y + (d ? 6 : 0), 9, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.stroke(); } }
    // kapı aralığından yalnız sıcak ışık ve kürsü; sıralar ve milletvekilleri açıklık kadrajı kaplayınca
    const ck = crowdK(t);
    if (ck > 0) {
    ctx.save(); ctx.globalAlpha = ck;
    ctx.save(); ctx.translate(URN.x, URN.y); drawUrn(ctx, 70); ctx.restore();
    let r0 = -1;
    for (const s of SEATS) {
      if (s.r !== r0) { r0 = s.r; const n = SEATS.filter(q => q.r === s.r).length, w = n * s.u * 0.92; ctx.save(); ctx.translate(540, s.y - s.u * 0.42); drawBench(ctx, w + s.u * 0.4, s.u * 0.2); ctx.restore(); }
      ctx.save(); ctx.translate(s.x, s.y); drawDeputy(ctx, s.u, s.k, standAt(s, t), s.tone); ctx.restore();
    }
    for (const s of SEATS) { const a = T.yuz - 0.05 + s.r * 0.05 + s.c * 0.004; const k = seg(t, a, 0.12) * (1 - seg(t, a + 0.5, 0.3)) * ck; if (k <= 0) continue; ctx.globalAlpha = k; ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.arc(s.x, s.y - s.u * 1.0, s.u * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
    ctx.globalAlpha = ck;
    for (const s of SEATS) {
      const a = lerp(T.l05 + 0.1, T.yuz2 - 0.55, (s.b * 0.7 + (1 - s.r / 8) * 0.3)), u = seg(t, a, 0.5); if (u <= 0 || u >= 1) continue;
      const e = ease.state(u), x = lerp(s.x, URN.x, e), y = lerp(s.y - s.u * 0.6, URN.y - 60, e) - Math.sin(e * Math.PI) * 120;
      ctx.save(); ctx.translate(x, y); drawBallot(ctx, 16 + s.u * 0.12, s.b * 6 + e * 4); ctx.restore();
    }
    ctx.restore();
    }
    const dark = lerp(0.24, 0.1, ease.state(seg(t, T.yasasin, 0.6)));
    ctx.fillStyle = `rgba(28,27,24,${dark.toFixed(3)})`; ctx.fillRect(-200, STAGE_TOP - 200, W + 400, 2000);
  }

  // ——— harita (gece) ———
  function mapLayer(t, z) {
    const k = clamp01((0.5 - z) / 0.3); if (k <= 0) return 0;
    const inv = 1 / z;
    ctx.save(); ctx.globalAlpha = k;
    for (const p of neighPaths) { ctx.fillStyle = NEIGHBOR; ctx.fill(p); ctx.lineWidth = 1.2 * inv; ctx.strokeStyle = '#4E4A42'; ctx.stroke(p); }
    ctx.fillStyle = LAND; ctx.fill(trPath); ctx.lineWidth = 2.4 * inv; ctx.strokeStyle = '#8B8577'; ctx.stroke(trPath);
    // haber atımları (Ankara'dan); "bugün"de 0,4 sn'de söner
    const fadeW = (1 - ease.exit(seg(t, T.l07 + 0.2, 0.8)) * 0.65) * (1 - ease.exit(seg(t, T.bugun, 0.4)));
    if (fadeW > 0) for (const w of WIRES) {
      const u = seg(t, w.a, w.dur); if (u <= 0) continue;
      const x = lerp(ANK[0], w.p.xy[0], ease.state(u)), y = lerp(ANK[1], w.p.xy[1], ease.state(u));
      ctx.globalAlpha = k * 0.55 * fadeW; ctx.strokeStyle = LIGHT; ctx.lineWidth = 1.6 * inv; ctx.beginPath(); ctx.moveTo(ANK[0], ANK[1]); ctx.lineTo(x, y); ctx.stroke();
      if (u < 1) { ctx.globalAlpha = k * fadeW; ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.arc(x, y, 5.5 * inv, 0, Math.PI * 2); ctx.fill(); }
      // hat kurulduktan sonra: Ankara'dan dışarı akan küçük atımlar (sürekli döngü, 'bugün'e kadar)
      else { const v = (cyc(t, 2.4) + w.ph) % 1, e = seg(t, w.a + w.dur, 0.4); ctx.globalAlpha = k * fadeW * 0.85 * e * Math.sin(v * Math.PI); ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.arc(lerp(ANK[0], w.p.xy[0], v), lerp(ANK[1], w.p.xy[1], v), 5.5 * inv, 0, Math.PI * 2); ctx.fill(); }
      const ring = seg(t, w.a + w.dur, 0.35); if (ring > 0) { ctx.globalAlpha = k * fadeW; ctx.lineWidth = 2 * inv; ctx.strokeStyle = LIGHT; ctx.beginPath(); ctx.arc(w.p.xy[0], w.p.xy[1], (4 + 7 * (1 - ease.enter(ring))) * inv, 0, Math.PI * 2); ctx.stroke(); }
    }
    const out = t >= tl.loop0 ? 1 - ease.state(seg(t, tl.loop0, 0.55)) : 1;
    for (const d of DOTS) {
      const u = ease.enter(seg(t, d.a, 0.3)); if (u <= 0) continue;
      const tw = 0.7 + 0.3 * Math.sin(d.tw + PH(t, 1.6));
      ctx.globalAlpha = k * u * out * tw; ctx.fillStyle = LIGHT; ctx.fillRect(d.q[0] - 2.1 * inv, d.q[1] - 2.1 * inv, 4.2 * inv, 4.2 * inv);
    }
    // Ankara'dan yayılan halkalar (sürekli döngü; sayım ve doruk öncesi sessizlikte de sahne durmaz)
    { const on = seg(t, T.sayim, 0.4) * (1 - seg(t, T.loop0, 0.4)); if (on > 0) for (let q = 0; q < 2; q++) { const v = (cyc(t, 1.6) + q / 2) % 1; ctx.globalAlpha = k * on * 0.6 * (1 - v); ctx.lineWidth = 2 * inv; ctx.strokeStyle = LIGHT; ctx.beginPath(); ctx.arc(ANK[0], ANK[1], (10 + 60 * v) * inv, 0, Math.PI * 2); ctx.stroke(); } }
    ctx.globalAlpha = k * out; ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.arc(ANK[0], ANK[1], 7 * inv, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.5 * inv; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.restore();
    return k;
  }

  // ——— üst blok ———
  function narration(t) {
    if (t < T.s('l02') - 0.05 || t >= T.bayram) return;
    let ln = null; for (const l of ep.voice.lines) if (t >= T.s(l.id) - 0.05) ln = L[l.id];
    if (!ln || ln.id === 'l01') return;
    const out = ln.id === 'l09' ? 1 - ease.exit(seg(t, T.bayram - 0.3, 0.3)) : 1;
    const text = ln.text;
    const words = ln.words, wt = key => (words.find(w => w.w.toLocaleLowerCase('tr').startsWith(key)) || words[0]).t0;
    const parts = [[0, T.s(ln.id) - 0.05], ...(CHUNKS[ln.id] || []).map(([s, key]) => [text.indexOf(s), wt(key) - 0.05])];
    let fs0 = 50, ls; for (const f of [50, 46, 42]) { fs0 = f; setFont(ctx, F.name(f)); ls = wrap(ctx, text, SAFE.x1 - SAFE.x0); if (ls.length <= 3) break; }
    const lh = fs0 * 1.2, y0 = ls.length > 2 ? 400 : 430;
    let off = 0;
    ls.slice(0, 3).forEach((s, i) => {
      const at = text.indexOf(s, off); off = at + s.length; const y = y0 + i * lh;
      const cuts = [0, ...parts.map(q => q[0] - at).filter(c => c > 0 && c < s.length), s.length];
      let x = SAFE.x0;
      for (let c = 0; c < cuts.length - 1; c++) {
        const piece = s.slice(cuts[c], cuts[c + 1]), gi = at + cuts[c];
        let when = parts[0][1]; for (const [idx, tt] of parts) if (gi >= idx) when = Math.max(when, tt);
        revealText(ctx, piece, x, y, fs0, ease.enter(seg(t, when, 0.3)) * out, C.ink); setFont(ctx, F.name(fs0)); x += ctx.measureText(piece).width;
      }
    });
  }
  const TITLE = ['Tam 103 yıl önce,', "şu dakikada Ankara'da", 'bir oylama bitiyordu.'];
  function title(t) {
    const pin = t < tl.loop0 ? 1 : ease.enter(seg(t, D - 0.75, 0.6));
    const pout = t < tl.loop0 ? 1 - ease.exit(seg(t, T.s('l02') - 0.3, 0.25)) : 1;
    const k = Math.min(pin, pout); if (k <= 0) return;
    let fs = 88; setFont(ctx, F.head(fs)); while (Math.max(...TITLE.map(s => ctx.measureText(s).width)) > SAFE.x1 - SAFE.x0 && fs > 60) { fs -= 2; setFont(ctx, F.head(fs)); }
    TITLE.forEach((s, i) => revealText(ctx, s, SAFE.x0, 468 + i * fs * 1.02, fs, k, C.ink));
  }
  function row({ label, num, unit, red = false, p = 1 }) {
    if (label) { setFont(ctx, F.mono(32)); revealText(ctx, label, SAFE.x0, 590, 32, p, red ? C.red : C.ink); }
    if (num) { setFont(ctx, F.head(88)); const nw = ctx.measureText(num).width; revealText(ctx, num, SAFE.x0, 680, 88, p, red ? C.red : C.ink); if (unit) { setFont(ctx, F.name(44)); revealText(ctx, unit, SAFE.x0 + nw + 14, 680, 44, p, red ? C.red : C.ink); } }
  }
  const fmt1 = v => v.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  function counters(t) {
    if (t < T.yuz - 0.04 || t >= tl.loop0 + 0.3) return;
    const fade = t >= tl.loop0 ? 1 - ease.exit(seg(t, tl.loop0, 0.25)) : 1;
    const inn = a => ease.enter(seg(t, a, 0.3)) * fade;
    if (t < T.l03 - 0.06) return row({ label: 'BİRİNCİ MECLİS · ANKARA', num: '158', unit: 'milletvekili', p: inn(T.yuz - 0.04) });
    if (t < T.l05 - 0.06) {
      if (t < T.altida - 0.35) return row({ label: '29 EKİM 1923 · OTURUM', p: inn(T.s('l03') - 0.04) });
      const n = t < T.yirmi - 0.04 ? '18.00' : '20.30';
      return row({ label: '29 EKİM 1923 · OTURUM', num: n, unit: n === '20.30' ? 'Cumhuriyet ilan edildi' : 'oturum başladı', p: n === '20.30' ? inn(T.yirmi - 0.04) : inn(T.altida - 0.35) });
    }
    if (t < T.l06 - 0.06) { row({ label: 'İLK CUMHURBAŞKANI SEÇİMİ', p: inn(T.s('l05') - 0.04) }); if (t >= T.yuz2 - 0.04) row({ num: '158 / 158', unit: 'oy', p: inn(T.yuz2 - 0.04) }); return; }
    if (t < T.l07 - 0.06) return row({ label: 'AYNI GECE · BÜTÜN MEMLEKETE', p: inn(T.haber - 0.04) });
    // l07–l08: etiket ve sayı aynı karede değişir ("seksen")
    if (t < T.seksen - 0.04) { row({ label: '1927 · İLK NÜFUS SAYIMI', p: inn(T.s('l07') - 0.04) }); if (t >= T.on - 0.04) row({ num: '13,6 milyon', unit: 'kişi', p: inn(T.on - 0.04) }); return; }
    const red = t < T.inkHero;
    const v = lerp(13.6, 86, ease.enter(seg(t, T.seksen - 0.04, 0.42)));
    row({ label: 'BUGÜN · TÜİK 2025', num: v >= 85.95 ? '86 milyon' : `${fmt1(v)} milyon`, unit: 'kişi', red, p: fade });
  }
  function tag(s, x, y, k, align = 'left', size = 40) {
    if (k <= 0) return; setFont(ctx, F.mono(size)); const tw = ctx.measureText(s).width, x0 = align === 'center' ? x - tw / 2 : x;
    ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = C.paper; ctx.fillRect(x0 - 10, y - size, tw + 20, size * 1.38); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(x0 - 10, y - size, tw + 20, size * 1.38);
    ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(s, x0, y); ctx.restore();
  }
  function mapTags(t, cam, mk) {
    if (mk <= 0) return;
    const sx = p => ANCHOR.x + (p[0] - cam.x) * cam.z, sy = p => ANCHOR.y + (p[1] - cam.y) * cam.z;
    const out = t >= tl.loop0 ? 1 - ease.exit(seg(t, tl.loop0, 0.3)) : 1;
    tag('ANKARA', sx(ANK) + 22, sy(ANK) - 20, mk * out * ease.enter(seg(t, T.zo1 - 0.5, 0.3)));
    tag('1 NOKTA ≈ 28.700 KİŞİ', SAFE.x0 + 10, 1400, mk * out * ease.enter(seg(t, T.sayim, 0.3)) * (1 - ease.exit(seg(t, T.follow - 0.3, 0.3))));
    BUBBLES.forEach((n, i) => {
      const p = byName[n]; const a = T.sehir + i * 0.16, k = ease.enter(seg(t, a, 0.3)) * out; if (k <= 0) return;
      ctx.save(); ctx.globalAlpha = k; ctx.translate(Math.min(sx(p.xy), 940 - 26), sy(p.xy) - 8 - 10 * (1 - k)); drawBubble(ctx, 34); ctx.restore();
    });
  }
  // fotoğraf kartı: her karede tam opak; giriş ölçek 0,94→1 ve y +24→0 (0,45 sn, giriş eğrisi); çıkış ölçek 1→0,92,
  // y 0→−40 (0,28 sn, çıkış eğrisi) ve sert kesme. Salon önceden %35'e iner. Fotoğraf piksellerine efekt yok.
  function photoCard(t) {
    if (t < T.dim0 || t >= T.phOut + 0.28) return;
    const dim = ease.state(seg(t, T.dim0, 0.35));
    const hold = seg(t, T.ph0 + 0.45, T.phOut - T.ph0 - 0.45);   // kart oturduktan çıkışa: salon %35 → %45, kart 1 → 1,035
    ctx.fillStyle = `rgba(236,229,213,${(lerp(0.65, 0.55, hold) * dim).toFixed(3)})`; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);
    if (t < T.ph0) return;
    const ki = ease.enter(seg(t, T.ph0, 0.45)), ko = ease.exit(seg(t, T.phOut, 0.28));
    const s = lerp(0.94, 1, ki) * lerp(1, 1.035, hold) * lerp(1, 0.92, ko), dy = 24 * (1 - ki) - 40 * ko;
    ctx.save(); ctx.translate(540, CARD.y + CARD.h / 2 + dy); ctx.scale(s, s); ctx.translate(-540, -(CARD.y + CARD.h / 2));
    const x = CARD.x, y = CARD.y, b = CARD.b;
    ctx.fillStyle = '#F7F3EA'; ctx.fillRect(x, y, CARD.w, CARD.h); ctx.lineWidth = 1; ctx.strokeStyle = C.ink; ctx.strokeRect(x + 0.5, y + 0.5, CARD.w - 1, CARD.h - 1);
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(photo, x + b, y + b, CARD.w - 2 * b, CARD.ih);
    setFont(ctx, F.mono(40)); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('RESİMLİ GAZETE · 3 KASIM 1923', 540, y + CARD.h + 50);
    ctx.restore();
  }
  function bayram(t) {
    if (t < T.bayram || t >= tl.loop0 + 0.3) return;
    const k = ease.enter(seg(t, T.bayram, 0.4)) * (t >= tl.loop0 ? 1 - ease.exit(seg(t, tl.loop0, 0.25)) : 1);
    setFont(ctx, F.head(64)); revealText(ctx, 'Cumhuriyet Bayramımız', SAFE.x0, 432, 64, k, C.ink); revealText(ctx, 'kutlu olsun.', SAFE.x0, 504, 64, k, C.ink);
    ctx.save(); ctx.globalAlpha = k; ctx.translate(800, 404 + 8 * (1 - k)); drawFlagPlain(ctx, 72, PH(t, 2.2), 0.03); ctx.restore();
  }
  function follow(t) {
    if (t < T.follow || t >= tl.loop0 + 0.1) return;
    const k = ease.enter(seg(t, T.follow, 0.35)) * (1 - seg(t, tl.loop0 - 0.1, 0.2));
    setFont(ctx, F.name(40)); const lb = 'TAKİP ET · HER GÜN YENİ BİR SAYI', tw = ctx.measureText(lb).width, x = 505;
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x - tw / 2 - 16, 1318, tw + 32, 62); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.strokeRect(x - tw / 2 - 16, 1318, tw + 32, 62);
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(lb, x, 1363); ctx.restore();
  }
  function paperFoot() {
    for (let i = 0; i < 12; i++) { ctx.fillStyle = `rgba(236,229,213,${(0.08 + i * 0.075).toFixed(3)})`; ctx.fillRect(0, 1440 + i * 14, W, 14); }
    ctx.fillStyle = C.paper; ctx.fillRect(0, 1608, W, 312);
  }

  // ——— kare ———
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, 1920);
    const cam = camAt(t);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip();
    const door = inHall(t) ? doorPath(cam) : { covers: false };
    let mk = 0;
    if (!door.covers) {
      ctx.fillStyle = SEA; ctx.fillRect(0, STAGE_TOP, W, 1920 - STAGE_TOP);   // gece göğü = harita denizi (tek renk)
      ctx.save(); ctx.translate(ANCHOR.x, ANCHOR.y); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
      mk = mapLayer(t, cam.z);
      const detail = clamp01((cam.z - 0.035) / 0.06);
      if (detail > 0) { ctx.save(); ctx.globalAlpha = detail; exterior(t, cam.z); ctx.restore(); }
      ctx.restore();
    }
    if (inHall(t)) {
      ctx.save(); if (!door.covers) ctx.clip(door.p);
      const z = hallZ(t); ctx.translate(540, 1100); ctx.scale(z, z); ctx.translate(-540, -1100); hall(t); ctx.restore();
    }
    paperFoot();
    clock(t);
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(0, STAGE_TOP + 0.5); ctx.lineTo(W, STAGE_TOP + 0.5); ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.stroke();
    setFont(ctx, F.mono(36)); ctx.fillStyle = C.graphite; ctx.textAlign = 'left'; ctx.fillText(ep.serial, SAFE.x0, 336);
    title(t); narration(t); counters(t); bayram(t);
    ctx.drawImage(grain(), 0, 0);
    // kâğıt dokusu fotoğrafın üstüne binmez: kart ve harita etiketleri dokudan sonra
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, 1920 - STAGE_TOP); ctx.clip(); photoCard(t); mapTags(t, cam, mk); follow(t); ctx.restore();
  }
  return { duration: D, timeline: { T }, render };
}

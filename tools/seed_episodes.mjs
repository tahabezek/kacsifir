// Bölüm stoğu (004–009). Her sayı aşağıdaki hesaplardan gelir; açıklamada kaynak yazılır.
import fs from 'node:fs';

const base = { bpm: 96, silenceBeats: 0.8, rewindBeats: 2, startFrac: 0.3 };
const sec = { dec: 100, units: [
  { upTo: 60, div: 1, name: 'saniye' }, { upTo: 3600, div: 60, name: 'dakika' },
  { upTo: 86400, div: 3600, name: 'saat' }, { upTo: 31557600, div: 86400, name: 'gün' },
  { upTo: 1e30, div: 31557600, name: 'yıl' }] };

// hesaplar
const C = 299792.458;                       // km/s
const moonS = 384400 / C;                   // 1,28 sn
const sunS = 149597870.7 / C;               // 499,0 sn = 8 dk 19 sn
const proximaS = 4.2465 * 31557600;         // 4,25 ışık yılı
const fold = n => 0.0001 * 2 ** n;          // 0,1 mm kâğıt
const beatsPerMin = 70, lifeYears = 73;
const perDay = beatsPerMin * 1440, perYear = beatsPerMin * 525960, perLife = perYear * lifeYears;

const eps = [
  {
    id: '004', slug: 'gunes-isigi', serial: '№ 004 · IŞIK', direction: 'up',
    question: ["Güneş'in ışığı", 'kaç dakikada gelir?'], format: sec,
    items: [
      { tag: 'A', name: "Ay'dan", value: moonS, grow: 3, hold: 2.5 },
      { tag: 'B', name: "Güneş'ten", value: sunS, grow: 6, hold: 9.5, hero: true,
        kicker: 'Güneş şu an sönse, 8 dakika boyunca fark etmezdik.' },
      { tag: 'C', name: 'En yakın yıldızdan', value: proximaS, grow: 3, hold: 3.5 },
    ],
    caption: "Güneş'e baktığında 8 dakika 19 saniye önceki Güneş'i görürsün. Ay'ın ışığı 1,3 saniyede, en yakın yıldız Proxima Centauri'nin ışığı 4,2 yılda gelir.\n\nBunu biliyor muydun? Yorumlara yaz.\n\nKaynak: ışık hızı 299.792,458 km/s · Dünya-Güneş ortalama uzaklığı 149,6 milyon km (IAU) · Dünya-Ay 384.400 km (NASA) · Proxima Centauri 4,25 ışık yılı.",
    hashtags: ['#uzay', '#güneş', '#ışık', '#bilim', '#sayılar'],
  },
  {
    id: '005', slug: 'kagit-katlama', serial: '№ 005 · KATLAMA', direction: 'up',
    question: ['Bir kâğıdı 42 kez', 'katlasan?'],
    format: { dec: 100, units: [{ upTo: 1, div: 0.01, name: 'cm' }, { upTo: 1000, div: 1, name: 'm' }, { upTo: 1e30, div: 1000, name: 'km' }] },
    items: [
      { tag: 'A', name: '10 kat', value: fold(10), grow: 3, hold: 2.5 },
      { tag: 'B', name: '23 kat (Burj Halife kadar)', value: fold(23), grow: 4, hold: 3 },
      { tag: 'C', name: '42 kat', value: fold(42), grow: 6, hold: 8.5, hero: true,
        kicker: "Ay'a kadar uzanır ve 55.000 km daha geçer." },
    ],
    caption: "0,1 mm'lik bir kâğıdı her katladığında kalınlığı iki katına çıkar. 10 katta 10 cm, 23 katta Burj Halife boyu, 42 katta 439.805 km: Ay'ı geçer.\n\nGerçekte bunu yapamazsın: rekor 12 kat (Britney Gallivan, 2002).\n\nKaç kata kadar denedin? Yorumlara yaz.\n\nHesap: 0,1 mm × 2⁴² · Dünya-Ay ortalama uzaklığı 384.400 km (NASA).",
    hashtags: ['#matematik', '#kağıt', '#üstelbüyüme', '#sayılar', '#bilgi'],
  },
  {
    id: '006', slug: 'kac-turkiye', serial: '№ 006 · NÜFUS', direction: 'up',
    question: ['Dünyaya kaç', 'Türkiye sığar?'],
    format: { dec: 100, units: [{ upTo: 1e9, div: 1e6, name: 'milyon kişi' }, { upTo: 1e30, div: 1e9, name: 'milyar kişi' }] },
    items: [
      { tag: 'A', name: 'İstanbul', value: 15.70e6, grow: 3, hold: 2.5 },
      { tag: 'B', name: 'Türkiye', value: 85.66e6, grow: 3, hold: 3 },
      { tag: 'C', name: 'Dünya', value: 8.2e9, grow: 6, hold: 7.5, hero: true,
        kicker: 'Yani yaklaşık 96 Türkiye eder.' },
    ],
    caption: "Dünya nüfusu 8,2 milyar. Türkiye 85,7 milyon. Yani dünyada yaklaşık 96 Türkiye var; her 100 kişiden 1'i Türkiye'de yaşıyor.\n\nTahminin kaçtı? Yorumlara yaz.\n\nKaynak: TÜİK ADNKS 2024 (Türkiye 85.664.944, İstanbul 15.701.602) · BM Dünya Nüfus Beklentileri (2025: 8,2 milyar).",
    hashtags: ['#nüfus', '#türkiye', '#istanbul', '#sayılar', '#bilgi'],
  },
  {
    id: '007', slug: 'isik-ses', serial: '№ 007 · HIZ', direction: 'up',
    question: ['Işık, sesten', 'kaç kat hızlı?'],
    format: { dec: 100, units: [{ upTo: 1e6 / 3.6, div: 1 / 3.6, name: 'km/sa' }, { upTo: 1e9 / 3.6, div: 1e6 / 3.6, name: 'milyon km/sa' }, { upTo: 1e30, div: 1e9 / 3.6, name: 'milyar km/sa' }] },
    items: [
      { tag: 'A', name: 'Ses', value: 343, grow: 3, hold: 2.5 },
      { tag: 'B', name: 'Uzay İstasyonu', value: 7660, grow: 3.5, hold: 3 },
      { tag: 'C', name: 'Işık', value: C * 1000, grow: 6, hold: 10.5, hero: true,
        kicker: "Sesten 874.000 kat hızlı: 1 saniyede Dünya'yı 7,5 kez dolaşır." },
    ],
    caption: "Ses saatte 1.235 km gider. Uzay İstasyonu 27.600 km. Işık ise saatte 1,08 milyar km: sesten 874.030 kat hızlı, 1 saniyede Dünya'nın çevresini 7,5 kez dolaşır.\n\nŞimşeği görüp gök gürültüsünü neden geç duyduğumuz bu.\n\nKaynak: ses hızı 343 m/s (20 °C hava) · ISS ≈7,66 km/s (NASA) · ışık hızı 299.792.458 m/s · Ekvator çevresi 40.075 km.",
    hashtags: ['#fizik', '#ışık', '#ses', '#bilim', '#sayılar'],
  },
  {
    id: '008', slug: 'kalp-atisi', serial: '№ 008 · KALP', direction: 'up',
    question: ['Kalbin bir ömürde', 'kaç kez atar?'],
    format: { dec: 100, units: [{ upTo: 1e6, div: 1, name: 'kez' }, { upTo: 1e9, div: 1e6, name: 'milyon kez' }, { upTo: 1e30, div: 1e9, name: 'milyar kez' }] },
    items: [
      { tag: 'A', name: 'Bir günde', value: perDay, grow: 3, hold: 2.5 },
      { tag: 'B', name: 'Bir yılda', value: perYear, grow: 3.5, hold: 3 },
      { tag: 'C', name: `${lifeYears} yıllık ömürde`, value: perLife, grow: 6, hold: 8, hero: true,
        kicker: '28 yaşındaysan 1 milyarı geçtin bile.' },
    ],
    caption: "Dakikada 70 atışla kalbin günde 100.800, yılda 36,8 milyon, 73 yıllık bir ömürde yaklaşık 2,7 milyar kez atar. Durmadan, tatil yapmadan.\n\nSen kaç yaşındasın? Kendi sayını hesapla: yaş × 36,8 milyon.\n\nVarsayım: dinlenme nabzı 70/dk · ömür 73 yıl (BM dünya ortalaması).",
    hashtags: ['#kalp', '#sağlık', '#vücut', '#sayılar', '#bilgi'],
  },
  {
    id: '009', slug: 'gunes-dunya', serial: '№ 009 · HACİM', direction: 'up',
    question: ["Güneş'e kaç", 'Dünya sığar?'],
    format: { dec: 10, units: [{ upTo: 1e6, div: 1, name: 'Dünya' }, { upTo: 1e30, div: 1e6, name: 'milyon Dünya' }] },
    items: [
      { tag: 'A', name: 'Dünya', value: 1, grow: 3, hold: 2.5 },
      { tag: 'B', name: 'Jüpiter', value: 1321, grow: 4, hold: 3 },
      { tag: 'C', name: 'Güneş', value: 1.301e6, grow: 6, hold: 9, hero: true,
        kicker: "Güneş Sistemi'nin kütlesinin %99,86'sı Güneş'te." },
    ],
    caption: "Jüpiter'in içine 1.321 Dünya sığar. Güneş'in içine ise yaklaşık 1,3 milyon.\n\nGüneş, Güneş Sistemi'ndeki toplam kütlenin %99,86'sını tek başına taşıyor.\n\nKaynak: NASA gezegen bilgi sayfaları (hacim oranları: Jüpiter 1.321 Dünya, Güneş 1.301.000 Dünya).",
    hashtags: ['#uzay', '#güneş', '#jüpiter', '#bilim', '#sayılar'],
  },
];

for (const e of eps) {
  const ep = { id: e.id, slug: e.slug, serial: e.serial, direction: e.direction, ...base, ...e };
  fs.writeFileSync(`episodes/${e.id}-${e.slug}.json`, JSON.stringify(ep, null, 2) + '\n');
  console.log(e.id, e.slug, e.items.map(i => i.value.toPrecision(5)).join(' / '));
}
console.log('kontrol:', { sunS: sunS.toFixed(1), moonS: moonS.toFixed(3), fold42km: (fold(42) / 1000).toFixed(0), ratioLightSound: (C * 1000 / 343).toFixed(0), perLife, earthLaps: (C / 40075).toFixed(2), turkiye: (8.2e9 / 85.66e6).toFixed(1) });

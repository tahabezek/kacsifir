# Video skill depoları, 2. tur: yolculuk, harita ve hikâye anlatımı

Hazırlanma: 22 Ekim 2026. İncelenenler, global CLAUDE.md'deki skill depoları (howseen-ai/claude-motion-design,
whaleyxbt/claude-motion, cth9191/animate, AbubakrChan/product-launch-motion, charlie947/motion-graphics-skills,
heygen-com/hyperframes, lemomo-ai/lemo-opuscar), CLAUDE.md'deki 5 X rehberi ve rehberlerden birinin işaret
ettiği WinterArc21/Battle-of-Austerlitz-Film. Depolar salt okunur incelendi; hiçbir betikleri çalıştırılmadı.
1. tur (genel stiller, maskot oyunculuğu, boru hattı): `research/opus_video_repolari.md`.

Çıkış noktası: 014 "Kuş ve yürüyen adam" bölümü düz bir cetvel ve sayaçtan ibaret. Kullanıcıya göre ne kuşun
uçuşunun ne de Bushby'nin yürüyüşünün büyüklüğü hissediliyor. Hedef, hikâyeyi gerçek harita üzerinde anlatırken
canlandırmak.

---

## 1. Kısa sonuç

- Hiçbir depoda hazır bir **kuş uçuş döngüsü** ya da **insan yürüyüş döngüsü** yok. Bunları kendi karakter
  kartımızla yazacağız (CLAUDE.md §6).
- Gerçek harita ve rota için en iyi kaynaklar: **Austerlitz** (Natural Earth verisi, mürekkep rota, log zoom),
  **lemo Satellite Briefing** (küre kamerası, ölçü çizgisinin ucunu kovalayan kamera) ve **hyperframes**
  (haritayı bir kez pişirip rotayı canlı çizme, 180. meridyen düzeltmesi).
- Seslendirme ve senkron için en iyi kaynaklar: **cth9191/animate** (`voice.mjs`, `voice_words.py`) ve
  **product-launch-motion** `legacy/references/03-word-locked-sync.md`.
- Hikâye grameri için en iyi kaynak: **cth9191/animate** `grammar/STORY.md` (vuruş türleri tablosu,
  scale-in/scale-out bağlantısı, sonda uzaklaşarak bütünü gösterme).

## 2. Harita ve rota

| Teknik | Kaynak | Bize uyarlama |
|---|---|---|
| Natural Earth GeoJSON'u bir kutuya kırpıp düz `[lon,lat,…]` dizileri olarak pişirmek | Austerlitz `tools/build_europe.py` | Dünya 110m/50m; Douglas-Peucker ile sadeleştirme (onlarınki kaba) |
| Görünüm `{lon, lat, scale}`, rota listesi ve `prog` | Austerlitz `web/engine/europe.js` `drawEurope()` | Kâğıt zeminde gravür harita, deniz için tarama çizgisi; karanlık deniz yok |
| Rotayı mürekkeple, sivrilen kalem ucuyla çizmek | Austerlitz `inkPath()`, `overlay.js` `brushArrow()` | Onlar indeksle kesiyor; biz **yay uzunluğu tablosuyla** keseceğiz |
| `resample`, `pathLen`, `subPath(P, frac)`, `pointAt(P, frac)` | animate `kit/core.js` L114–134 | Rota çizimi ve "kahraman şu an nerede" bilgisi yaklaşık 20 satırda |
| Eğri üzerinde sabit aralıklı noktalar | claude-motion `sims/engine/main.js:178` | km sayacı ile kalem ucu her karede birbirini tutar |
| Küre kamerası; tek `project()` ve ondan türeyen `kmPerPx()` ölçek çubuğu | lemo `styles/satellite-briefing/demo/engine.js` L32–70 | Kuş için Pasifik merkezli ortografik küre; boş okyanus hikâyenin kendisi |
| Log zoom, büyük zoom'da zemini kaydırmayan "zoomFollow", lens kaydırma `sx/sy` | lemo `satellite-briefing/demo/film.js` L45, L59–74 | Kamera yay ön ayarı 170/26, zoom log uzayında |
| **Ölçü çizgisi grameri:** hedef çizgiden 2 vuruş önce işaretlenir, çizgi kertiklerle uzar, kamera ucu kovalar, sayaç söylenen sayıya oturur, sonra kamera geri çekilip bütünü gösterir | lemo `satellite-briefing/demo/film.js` L427–466, STYLE.md §8 | 014'teki cetvelin doğrudan çaresi. Kertik 1.000 km'de bir, kuş için gün kertikleri |
| 180. meridyen düzeltmesi: boylamlar kamera merkezine göre açılır | hyperframes `scripts/bake-basemap.mjs` L202 | Kuşun rotası (−165° → 147°) da Bushby'nin Bering geçişi de 180°'yi kesiyor |
| Haritayı bir kez pişir, rotayı canlı çiz; iğneler yalnızca kamera dururken gelir | hyperframes `skills/hyperframes/references/film.md` "Maps" | Gravür levha bir kez çizilir, kaplamalar her karede |
| Harita gezginin hemen önünde kendini çizer | lemo `styles/crayon-book/STYLE.md` §8 | Bushby'nin yürüyüşü için |
| Hedefin etrafına, gezgin oraya varmadan önce elle çizilmiş bir halka | hyperframes `registry/blocks/nyc-paris-flight` | Yalnızca gramer alınır; parlak mavi rota, elastic easing ve flaş alınmaz |
| Kahramanı ekranda sabit bir noktada tutan takip kamerası, `camOf({z, p, to})` | animate `kit/morph.js` L25–32, `springTrack` core.js L503+ | `cam.p = pointAt(route, frac)`, `to` güvenli alanda sabit |
| Uzaklaşırken çizgi kalınlığını korumak, `max(w, w*0.45/cam.z)` | claude-motion `sims/crawlers/main.js:459` | Küreye çekilince rota kıl gibi incelmez |
| Rotaya iğnelenen ölçü etiketleri; aynı taraftaki etiketler 70 px aralıkla itilir | claude-motion `sims/engine/main.js:690-712` | Mimari ölçü çizgisi diliyle "3. gün · 4.100 km" etiketleri |

Lisans: Esri uydu görüntüsü temiz değil (lemo §9). **Yalnızca Natural Earth** (kamu malı) kullanılır.
Elle çizilen rota parçalarına "şematik" notu düşülür.

## 3. Büyüklüğü hissettirmek

- **Zaman esnetme:** film zamanından olay zamanına parçalı doğrusal bir eşleme (claude-motion
  `sims/kit/director.js:75-81`). Önemli anlara (iniş yok, Darién, Bering, vize yasağı) daha çok saniye ayrılır,
  geri kalan hızla geçilir.
- **Sonda uzaklaşarak bütünü göstermek** (animate `FORMATS.md` F1, hyperframes pull-back-reveal): yakın bir
  ayrıntı tutulur, sonra tek ve yavaşlayan bir geri çekilmeyle bağlamı değişir. Tek bir ayak izi bütün Amerika
  kıtasına dönüşür.
- **İstasyonlar arası kaydırma** (hyperframes pan-stations): 3–6 durak, her biri 0,2–2 sn tutulur.
- **Yığılan ölçek** (hyperframes `caption-camera-follow`): her yeni öğe ekrandakilerin 0,72 katı boyda gelir,
  kamera sabit log hızıyla geri çekilir. Bushby'nin yılları ya da ülkeleri görünür bir geometri olur.
- **Önce bilinenle başla** (hyperframes `references/types/explainer.md`). "Çizgi, kameranın izlediği yola
  dönüşür" (`references/types/data.md`): 014'ün cetveli **rotanın kendisine dönüşmeli**.
- **Uzun sayımlar doğrusal akar** (product-launch `legacy/references/04-motion-grammar.md` §8): yumuşatılmış
  sayaç erken çözülüp sonra sürünür. Sayım etiket kelimesiyle başlar, sonraki cümleden önce biter.
  Kilometre sayacında her hane yalnızca alttaki hane devrettiğinde döner (`technique.md` "Odometer").
- "Ekranı geçen tek bir çubuk ya da çizgi durağan okunur" (charlie947 `skills/vox-explainer/SKILL.md`). Bu,
  kullanıcının şikâyetinin kural hâline getirilmiş biçimi.

## 4. Hikâye ve seslendirme senkronu

- **Ses saattir:** önce ses kaydedilir, her sahne kendi satırının süresi + 0,2–0,5 sn kuyruk kadar sürer.
  Her sahnenin başında kelime etiketli bir ipucu tablosu bulunur. İpucu ismin değil, fiilin ya da vurgulu
  kelimenin üstüne konur; okunacak öğe 0,02–0,06 sn önce gelir. Bir kelimeye en fazla iki ipucu bağlanır;
  açılışlar sahnenin ikinci yarısına yığılır (product-launch `legacy/references/03-word-locked-sync.md`).
- **Boru hattı** (animate `tools/voice.mjs`, `tools/voice_words.py`): satır başına bir kayıt, aralara ölçülü
  sessizlik, tek `voice.wav`, satır ve kelime zamanlarını taşıyan bir `voice.json`. `VL(id)` ve `VW(id, word, n)`
  ile bir satırın ya da kelimenin zamanı okunur. Her vuruş önceki satırın bitişinden 0,3 sn sonra başlar.
  Doruk, onu adlandıran satırdan önceki duraklamaya konur.
- **Austerlitz:** zaman çizelgesi ölçülmüş TTS sürelerinden kuruluyor (`web/film.js` `buildTimeline`). Fakat
  senkron yalnızca satır düzeyinde ve altyazı süreleri harf sayısıyla dağıtılıyor. Bu bizim kuralımıza aykırı,
  kelime zamanı ölçülmeli.
- **Whisper tuzakları** (hyperframes `skills/media-use/audio/references/tts.md`, `captions.md`):
  - `small.en` İngilizce dışı konuşmayı sessizce çeviriyor; `--model small --language tr` kullanılmalı.
    animate `voice_words.py` L19'da dil `en` olarak sabit, `tr` yapılmalı.
  - Whisper son sessizliğin üstüne "Thank you" uyduruyor; son sessizlikte başlayan kelimeler atılır.
  - Altyazı kelimeleri metne göre değil konuma göre eşlenir; 2–3 kelimelik gruplar ≥ 150 ms duraklarda kırılır.
- **TTS seçenekleri:** Kokoro'da Türkçe yok. Seçenekler: edge-tts `tr-TR` sesi (ücretsiz, taslak için),
  ElevenLabs (kelime zaman damgası verir) ya da insan sesi. Sayılar TTS metninde yazıyla, altyazıda rakamla
  yazılır. Her satır, transkript metinle eşleşene kadar yeniden üretilir (lemo `asr_check.py`). TTS modeli
  güncellenince süreler değişeceği için model sürümü sabitlenir (product-launch tuzak #22).
- **Kulak için yazmak** (product-launch `legacy/references/02-story-and-truth.md` §3): vuruş başına tek yan
  cümle, noktalar kesme noktasıdır, sayılar söylendiği gibi yazılır, yuvarlama hep aşağı doğru yapılır.
- **Tempo** (hyperframes `references/film.md`): yaklaşık 2,2 kelime/sn, sahne başına ≤ 19 kelime.
- **Vuruş türleri tablosu** (animate `grammar/STORY.md`): başlangıç, birikim, yolculuk, dönüm, sessizlik ve
  bağlantı türlerinin her birinin kesme hızı, ses yüksekliği ve uzunluğu var. Vuruş tablomuza sütun olarak
  eklenir. Yolculuk kesmelerle değil, tek ve sürekli bir kamera hareketiyle anlatılır.

## 5. Figürler

- **Mesafeden türeyen yürüyüş** (lemo `styles/backrooms/demo/main.js` L46–51, L167):
  `phase = dist / STRIDE`. Ayak kayması olmaz; ayak sesleri aynı yürüyüşten çıkar.
- **Ayaklar yere basar** (claude-motion `sims/crawlers/main.js:184-270, 515-545`): ayak, dinlenme
  noktasından belli bir eşiği aşınca adım atar. Adım uzunluğu hızla ölçeklenir, kaldırma `sin(π·q)` biçimindedir,
  bacaklar 2 kemikli IK ile çizilir.
- **Poz düzeneği** (lemo `styles/art-deco/demo/chars.js`): FK düzeneği, adlı pozlar, `lerpPose`.
- **Adımlı figür, akıcı kamera** (hyperframes `components/stop-motion-cadence`): figürün zamanı 8–12 fps'e
  nicelenir, geri kalan her şey akıcı kalır. Gravür bir yürüyüşçü "basılmış" hissi verir.
- **Kuş:** kodu yok. `drawGodwit(ctx, card, pose, t)` yazılacak: kanat çırpma açısı bir parametre, karakter
  kartı ve poz kâğıdı kullanmadan önce render edilip bakılır. Gerekirse hareket gerçek bir uçuş videosundan
  izlenerek alınır ("üret, sonra kopyala", 0xMovez).

## 6. Kamera ve geçişler

- Arka arkaya önce yaklaşıp sonra uzaklaşılmaz. Kesme, hareketin en hızlı karesinde yapılır; iki tarafta yön
  ve hız aynı olur (howseen `SKILL.md` §2, §9c; hyperframes `references/motion.md`).
- Geçiş, sahnedeki bir nesneden doğar (claude-motion motion-design §8; animate `kit/morph.js` ve
  `examples/history-of-ai/src/bridges.js`): eski dünya bir nesne biçimindeki pencereye küçülür, yeni dünya
  ondan açılır (1,2 sn). Bizde kuşun Tazmanya'daki son noktası Bushby'nin ilk ayak izine dönüşebilir.
- Ard arda iki çekimde aynı kamera hareketi olmaz (product-launch `05-camera-3d-cursor.md`). Sabit nokta
  hilesi: hedefin tam merkezi etrafında ölçeklenir.
- "Çok hızlı" notu her zoom'u 0,7x yavaşlatmak demektir.

## 7. Kalite kapıları ve çalışma yöntemi

- **Ölçülebilir hareket kapıları** (hyperframes `references/motion.md`): `.motion.json` içinde `appearsBy`,
  `before`, `staysInFrame`, `keepsMoving` iddiaları. Vuruş karesi vuruş indeksinden hesaplanır, yuvarlanmış
  vuruşlar toplanarak bulunmaz.
- **Sayısal brief** (hyperframes `SPEC.md`; Ovrento): her sıfat bir sayıya çevrilir; her vuruşta başlangıç,
  özellik, nereden→nereye, süre, eğri ve "ne zaman bitmiş sayılır" koşulu yazılır.
- **Üç stil önerisi**, her biri bir sabit kareyle (huashu, Voxyz_ai rehberi). **Vuruş karesi taslağı:** tam
  render'dan önce vuruş başına tek kare (twoclipping).
- **Hareket bulanıklığı:** kare başına 4 alt kare, ffmpeg `tmix` (twoclipping). İsteğe bağlı; okunacak metin
  keskin kalır.
- **Uyarı:** hyperframes'in varsayılan yasak listesinde "krem kâğıt zemin + serif başlık + mono büyük harf
  etiket" de var. Kendi gazete/gravür görünümümüzü şablon gibi değil, **kuralları olan bir malzeme** gibi
  yazmalıyız.

## 8. Alınmayacaklar

- Gradyan metin, gökyüzü/mor palet, `outBack` ve elastik yaylar, kelimelerin bulanıklaşarak gelmesi, daktilo
  efekti (howseen `core.js`).
- Karanlık temalar, bloom, sarsıntı, flaş, glitch, vinyet, `WobbleFilter` çizgi titremesi (claude-motion).
- Lacivert "karanlık dünya", `sparkBurst`, `RAINBOW` konturları, kahramanlarda boşta sallanma, `monoText`
  daktilo (animate).
- Mum ışığı titremesi, kamera sarsıntısı, karanlık deniz, 4,5 sn sessiz açılış, her yerde çapraz karartma,
  sol alt köşe başlığı (Austerlitz).
- Range line üstünde gezen radyal "parıltı", köşe enstrümanları (lemo satellite-briefing).
- lemo'nun "kamera hiç durmaz" kuralı ile bizim "okunacak metin okunurken kıpırdamaz" kuralı çatışıyor.
  Bizim kuralımız geçerli.

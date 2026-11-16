# Gece planı (16 → 17 Kasım 2026): beş pilot film, yeni iskelet

Kullanıcı: "animasyonlarımız çok tek düze ve kötü… video kendini izlettirmiyor." Sonra: "bunu planla, gece yapacaksın." Ardından: "iki tane değil 5 tane yap."

| № | Yapı | Konu | Süre | Öncelik |
|---|---|---|---|---|
| 079 | B · tahmin et, fizik | Terazi: bütün insanlar mı, bütün inekler mi? | 22–32 sn | 1 (fizik altyapısını kurar) |
| 083 | C · olay canlı akıyor | Hachikō'nun 3.578 günü, tek takvim, tek istasyon | 35–45 sn | 2 (075 ile birebir A/B testi) |
| 080 | C · olay canlı akıyor | Titanik'in son 160 dakikası | 40–55 sn | 3 |
| 082 | B · tahmin et, yarış | Ankara'da bir top patlasa: ses mi önce İstanbul'a varır, uçak mı? | 22–32 sn | 4 |
| 081 | A · tek plan ölçek | Bir çay bardağından Türkiye'nin bir günde içtiği çaya | 22–32 sn | 5 |

## Teşhis (16 Kasım, veriyle)

**Rakamlar:**
- Çizgi filmlerin izlenme oranı 0,23–0,37. Bu, kullandığımız şablonların en düşüğü.
- En iyi iki film 047 şeker küpü (0,46) ve 046 deste. 046 en çok paylaşılan film oldu (binde 13,9).
- Her film 1,5–2,4K izlenmede tavana vuruyor.

**Kare analizi (065, 075):**
- Her 3 saniyede bir aynı kalıp geliyor: hareketsiz sahne, ortada duran karakter, altta kutulu altyazı.
- Anlatıcı olayı anlatıyor, resim yalnızca cümleyi süslüyor. Yani bu bir slayt gösterisi.
- Ekranda izleyicinin bitmesini beklediği bir şey yok.

**Asıl sorun iskelet:**
- Kaplamayı üç kez değiştirdik: editoryal çizim, 3B, çizgi.
- İzlenme oranı her seferinde 0,3 civarında kaldı, çünkü iskelet hep aynıydı: "her cümleye bir resim".

**"Claude ile yapılan" viral videolar:**
- X'te en çok izlenenler müzik klipleri (3,3M) ve 15 sn'lik tasarım gösterileri (1,7M). İzleyici kitlesi teknoloji meraklıları, bunları kopyalamak bize yaramaz.
- Alınacak şey dilbilgileri:
  - tek bir sürekli dönüşüm;
  - vuruşa kilitli tempo;
  - kesmesiz kamera;
  - göz önünde ilerleyen bir süreç ("icatlar bir günlük saatte", 266K).

## Yeni iskeletin kuralları (iki pilotta da zorunlu)

**1. Açık döngü kare 0'da kurulur.**
- Ekranda ilk kareden itibaren izleyicinin sonucunu beklediği bir şey var: dolan bir terazi, akan bir saat, batan bir gemi.
- Bu gösterge filmin sonuna kadar ekranda kalır.

**2. Resim olayın kendisidir.**
- Her cümlede ekranda bir şey fiilen değişir: dolar, düşer, ilerler, eğilir.
- "Karakter durur, altta kutu belirir" sahnesi yasak.

**3. Tek plan.**
- Kamera kesmesiz tek bir yolculuk yapar. En fazla 2 kesme olur ve ikisi de nesne taşıyarak yapılır.
- Kare kare slayt geçişi yok.

**4. Az kelime, yüksek ses tasarımı.**
- Anlatım ≤ 2,3 kelime/sn. Görselin gösterdiğini anlatıcı tekrar etmez.
- Vuruşlar, düşme ve oturma sesleri olaya kilitlenir.

**5. Çizim dili aynı kalır.**
- Çizgi motorunun kalın mürekkep çizgisi ve düz renkleri korunur (kullanıcı: "çizim ve şema iyi").
- Değişen şey yapı, kaplama değil.

**6. Altyazı kutusuz olur.**
- Kelimeye kilitli, büyük (≥ 64 px), beyaz ya da mürekkep renginde ve okunma süresince sabit.
- Kâğıt kutu yalnızca tek bir isim kartı ve doruktaki sayı için kullanılır.

**7. Süre:**
- Pilot B: 22–32 sn.
- Pilot C: 40–55 sn.

**8. Kapanış:**
- Son kare ilk kareyi kurar (döngü).
- Kapanışta "Bunu … gönder" isteği gelir: [[lesson-icimdekikasvet]].
- Takip çipi kalır.

## Pilot B: № 079 "Tahmin et" terazi (fizik simülasyonu)

**Logline:** Dünyadaki bütün insanlar dev bir terazinin bir kefesine, bütün inekler öbür kefesine dökülüyor. Hangisi ağır basar?

**Akılda kalacak tek şey:** 8 milyar insan, 1,5 milyar ineğe yeniliyor.

**Kare 0:**
- Boş, dengede bir terazi görünür; iki kefenin üstünde "İNSANLAR" ve "İNEKLER" etiketleri durur.
- Büyük başlık: "Hangisi ağır basar?"
- Soran 0,3 sn'de sorar. Dökülme 0,5 sn'de başlar.

**Akış:**
1. İnsan figürleri yağmur gibi sol kefeye dökülür (her figür N milyon kişi).
2. Terazi sola yatar. İzleyici "tabii ki insanlar" der.
3. İnekler dökülmeye başlar. Sayıları daha az, ama her biri iri.
4. Terazi yavaş yavaş döner.
5. Doruktan önce 0,5 sn sessizlik gelir, ardından **TAK**: sağ kefe yere oturur.
6. Tek sayı gösterilir: insanlar ≈ X Mt, inekler ≈ Y Mt (yaklaşık 2 kat).
7. Kapanış sorusu ve "Bunu tahminini sorduğun birine gönder."

**Fizik:**
- Rapier2D (`@dimforge/rapier2d-compat`, deterministik) kullanılır.
- Simülasyon yüklemede sabit adımla bir kez önceden koşturulur, kare başına pozisyonlar diziye yazılır.
- `render(t)` yalnızca bu diziyi okur. Saf fonksiyon kuralı korunur.
- Rapier kurulamazsa elle yazılmış kapalı formüllü düşme ve yığılma kullanılır.

**Doğrulanacak gerçekler (kaynaklı, `facts` alanına):**
- Dünya nüfusu 2026: BM WPP ≈ 8,2–8,3 milyar.
- Sığır sayısı: FAO ≈ 1,5–1,6 milyar baş.
- Ortalama ağırlıklar:
  - insan, çocuklar dâhil: Walpole 2012 ≈ 62 kg yetişkin, nüfus ortalaması daha düşük;
  - sığır ≈ 400–600 kg.
- Bar-On ve ark. 2018 PNAS biyokütle karşılaştırması: hayvancılık ve insan, karbon tonu.
- **Kural:** Oran kaynaklarla en az ~1,5 kat tutmuyorsa film iddiayı yumuşatmaz, konu değişir.

**Yedek konu:** Sezgiye ters düşen başka bir ağırlık çifti. Oran ≥ 1,5 kat olmalı ve kaynakla doğrulanmalı.

## Pilot C: № 080 "Olay canlı akıyor": Titanik'in son 160 dakikası

**Logline:** Titanik'in buzdağına çarpmasından batmasına kadar geçen 2 saat 40 dakika, gerçek saate göre sıkıştırılmış tek bir planda akıyor.

**Akılda kalacak tek şey:** En yakın gemi yaklaşık 19 km ötedeydi ve telsizcisi uyuyordu.

**Kare 0:**
- Gece, yandan görünen gemi.
- Sağ üstte büyük bir saat: 23:40.
- Gövdeye doğru gelen buzdağı.
- Hareket kare 0'da başlar.

**Akış (tek plan; kamera geminin yanında yavaşça geri çekilir, deniz yükselir):**
- 23:40: Çarpma. Sessiz bir sarsıntı olur, 1 sn tutulur.
- Saat akar. Baş su alır, gövde eğim açısı gerçek tanık anlatılarıyla uyumlu ilerler.
- Telsiz odası: Jack Phillips (isim kartı) CQD/SOS yollar. Telsiz dalgaları dışarı yayılır.
- Kadrajın kenarında ufukta Californian'ın ışığı görünür. Telsizi 23:30 civarında kapalıdır.
- Uzakta Carpathia rotasını çevirir. Mesafe göstergesi 58 deniz mili ≈ 107 km'dir.
- 00:45: İlk filika (7 numara) yarı boş iner. Koltuk ve kişi sayısı bir kez gösterilir.
- 02:05: Son filika iner.
- 02:20: Gemi kırılıp batar. Doruktan önce sessizlik, ardından tek vuruş.
- **Kapanış:** "En yakın gemi … km ötedeydi. Telsizcisi uyuyordu."
- Carpathia 04:00 civarında gelir. Saat son bir kez döner.

**Karakterler:**
- En az iki kişi ekranda olur: Phillips ve kaptan Smith ya da filikadaki bir yolcu.
- Trajedi kuralı geçerli: kimse gülümsemez, şaka yok ([[feedback-first-render-checklist]]).

**Doğrulanacak gerçekler:**
- Kaynaklar: British/US Inquiry, Encyclopedia Titanica.
- Bütün saatler.
- Filika 7'nin kişi sayısı.
- Californian'ın mesafesi. Tartışmalıdır; kaynaklarda verilen aralık kullanılır ve "yaklaşık" denir.
- Carpathia'nın mesafesi ve varış saati.
- Kurtulan ve ölen sayıları. Kaynaklar farklıysa resmî soruşturma rakamı kullanılır.

## Pilot 081: "Tek plan ölçek": Türkiye'nin bir günlük çayı (yapı A)

**Logline:** Tek bir ince belli çay bardağından başlayan kamera, kesmeden geri çekiliyor. Türkiye'nin bir günde içtiği bütün çay göz önünde birikiyor.

**Akılda kalacak tek şey:** Türkiye bir günde [kaynaklı karşılaştırma nesnesi] dolusu çay içiyor.

**Kare 0:**
- Buharı tüten tek bir bardak, yakın plan.
- Başlık: "Türkiye bir günde ne kadar çay içer?"
- Kamera kare 0'da geri çekilmeye başlar.

**Akış:**
- Bardaklar çoğalır: bir masa, bir apartman, bir mahalle, bir şehir.
- Çay tek bir hacimde birleşir. Tanıdık karşılaştırma nesnesi, yığın ona ulaşana kadar gösterilmez ([[feedback-surec-anlat]]).
- Doruktan önce sessizlik, ardından varış. Karşılaştırma nesnesi örnek olarak bir olimpik havuz, Galata Kulesi ya da bir stadyum olabilir; seçim hesaba göre yapılır.
- Kamera zoom'u logaritmik uzayda ilerler. Kesme yoktur.

**Doğrulanacak gerçekler:**
- Kişi başı yıllık çay tüketimi (Türkiye kg/kişi, dünyada birinci; kaynak gösterilir).
- Kuru çaydan bardak sayısına dönüşüm.
- Bardak hacmi.
- Hesap `facts` alanına adım adım yazılır.
- Sayılar tutarsızsa gösterilen sayı "yaklaşık" diye verilir ve kaynakların alt sınırı kullanılır.

**Kapanış:** "Bunu çay demleyen birine gönder."

## Pilot 082: "Tahmin et" yarışı: Ankara'dan İstanbul'a ses mi, uçak mı? (yapı B)

**Logline:** Ankara'da dev bir top patlıyor; sesi ile Ankara'dan aynı anda kalkan bir uçak İstanbul'a yarışıyor. Hangisi önce varır?

**Akılda kalacak tek şey:** Ses, yolcu uçağından daha hızlıdır.

**Kare 0:**
- Türkiye haritası; Ankara ve İstanbul işaretli.
- Başlık: "Hangisi önce varır?"
- İki şerit, iki çizgi ve büyük bir yarış saati.

**Akış:**
- Ses dalgası halka halka yayılır. Uçak kalkar.
- Saat sıkıştırılmış gerçek zamanla akar.
- Ses yaklaşık 17 dakikada varır. Uçak hâlâ havadadır.
- İsteğe bağlı üçüncü yarışmacı: YHT geride kalır.
- Doruktan önce 0,5 sn sessizlik, ardından ses İstanbul'a çarpar.

**Doğrulanacak gerçekler:**
- Ankara–İstanbul kuş uçuşu mesafesi.
- Sesin hızı: 343 m/sn, 20 °C.
- Esenboğa–İstanbul gerçek uçuş süresi.
- YHT süresi.
- **Dürüstlük notu:** Gerçekte ses bu mesafede duyulmaz. Metin bunu "Sesi oraya kadar ulaşsaydı…" diye kurar.

**Kapanış:** "Bunu her şeyi bildiğini sanan birine gönder."

## Pilot 083: "Olay canlı akıyor": Hachikō'nun 3.578 günü (yapı C, 075 ile A/B)

**Neden:** 075 aynı hikâyeyi slayt iskeletiyle anlatıyor ve stokta duruyor. Aynı hikâye yeni iskeletle yapılırsa yalnızca iskeletin etkisi ölçülür. Hangisinin yayımlanacağına sabah kullanıcı karar verir.

**Logline:** Shibuya İstasyonu tek bir sabit kadrajda. Kapıda bekleyen köpeğin önünde gerçek takvim 1925'ten 1935'e akıyor.

**Kare 0:**
- İstasyon kapısı, Hachikō ve sayaç: "0 GÜN".
- Tren gelir, kapıdan insanlar çıkar.

**Akış:**
- Mevsimler kadrajda değişir: kar, kiraz çiçeği, yağmur.
- Gün sayacı ve tarih durmadan akar.
- Kalabalık her "tren saatinde" çıkar, köpek her seferinde başını kaldırır.
- Gerçek olaylar zamanında kadraja girer:
  - 1932 gazete haberi;
  - 1934 heykeli kadraja girer;
  - köpek yaşlanır.
- Son kış kadrajda yalnızca heykel kalır. Sayaç 3.578'de durur.

**Gerçekler:** `episodes/075-on-yil-bekleyen-kopek.json` dosyasındaki `facts` ve kaynaklar aynen kullanılır.

**Kapanış:** "Bunu seni hep bekleyen birine gönder."

## Çalışma sırası ve kapılar (gece oturumu)

**Paralel üretim:**
- 079'da ortak altyapı ana oturumda kurulur. Bunlar: fizik önhesabı, kutusuz altyazı katmanı ve tek plan kamerası.
- 079 stil kareleri geçince kalan dört film, her biri ayrı bir alt ajanda paralel üretilir. Her alt ajan bu dosyayı ve kendi bölümünü okur.
- Render ve CPU çakışmasın diye tam render'lar sırayla kuyruğa girer.
- Her filmin kritiğini yapıma katılmamış ayrı bir salt-okur alt ajan yapar.

1. **Okuma:**
   - Bu dosya.
   - CLAUDE.md'ler.
   - Hafıza dosyaları: feedback-first-render-checklist, feedback-gri-anlatim, feedback-surec-anlat, feedback-story-pacing-characters, lesson-icimdekikasvet, feedback-turkish-copy.
   - `engine/cizgi.js`, `engine/cizgi/f075.js` (son çizgi filmi örnek), `tools/senaryo_json.mjs` ve ses boru hattı.
2. **Gerçekler:** Her pilotun gerçekleri kaynakla doğrulanır ve episode JSON'unun `facts.sources` alanına yazılır.
3. **Metin:**
   - Senaryo `research/SENARYOLAR.md`'ye eklenir: Pilot B ≤ 70 kelime, Pilot C ≤ 120 kelime.
   - Türkçe metin denetiminden geçer: devrik ya da eksiltili cümle yok.
4. **Ses:** edge-tts ile seslendirilir, whisper ile kelime zamanları ölçülür. Zaman çizelgesi gerçek sürelerden kurulur.
5. **Stil kareleri:**
   - Her vuruşun başında bir kare alınır ve temas kâğıdına bakılır.
   - Kontrol listesi: kare 0 kancası, kutusuz altyazı, güvenli alan, sayılar ve donma.
   - Kesin kontrol: "slayt gibi mi duruyor?" Her karede bir öncekinden farklı bir şey hareket ediyor olmalı.
6. **Taslak ve tam render:** Kapılar: donma yok, dikiş ≥ 0,9, −14 LUFS, determinizm.
7. **Kritik döngüsü:**
   - Yapıma katılmamış salt-okur bir alt ajan bitmiş videoya bakar ve 8 başlıkta puan verir.
   - "Kendini izlettiriyor mu? Hangi saniyede kaydırırdın?" sorusu ayrıca yanıtlanır.
   - Her başlık 8+ olana kadar en fazla 3 tur yapılır.
8. **Teslim:**
   - Her film için `out/<id>/video.mp4` (079–083) üretilir ve `prebuilt/` klasörüne kopyalanır.
   - Temas kâğıtları `out/<id>/contact.png` olarak kaydedilir.
   - **Yayına alınır.** Ayrıntılar aşağıdaki "Yayına alma" bölümünde.
9. **Sabah raporu:** `research/PILOT_RAPORU.md` yazılır. İçeriği:
   - ne yapıldı;
   - puanlar;
   - bilinen kusurlar;
   - kulakla kontrol edilecek adlar;
   - yayın önerisi (hangi gün ve saat, hangi stok filmin yerine).
10. **Kapanış:** Commit ve push yapılır. Deneme çıktıları, ara kareler ve kullanılmayan sesler silinir (disk dolu).

## Yayına alma (kullanıcı, 16 Kasım 23.30)

Kullanıcının sözü: "bunlar render olunca en kısa zamandaki videolarla değiştir ki etkiye bakalım". Kullanıcının sabah onayı beklenmez.

**Hangi filmler alınır:** Yalnızca bütün kapıları ve 8+ kritiği geçen pilotlar. Geçemeyen pilot yayına girmez.

**Yerleşim kuralı:**
- Sabah yuvalarına (08.30 TSİ = 05:30Z) sayı filmleri gider: 079, 082, 081.
- Akşam yuvalarına (20.30 TSİ = 17:30Z) hikâye filmleri gider: 080, 083.
- Her pilot, kendi türündeki en yakın uygun yuvayı alır.
- **083, 075'in yuvasını alır** (20 Kasım 20.30, aynı hikâye). 075 yayından çekilir: `disabled: true` olur ve `disabledNote` alanına "083 aynı hikâyenin yeni iskeletli sürümü; A/B sonrası karar" yazılır. 075 silinmez.
- **049'a (Voyager, 18 Kasım 20.30) dokunulmaz.** Tarihe bağlı bir film.

**Beklenen yerleşim (her şey zamanında biterse):**

| Yuva (TSİ) | Şu an | Yeni |
|---|---|---|
| 17 Kas 08.30 | 003 | 079 |
| 17 Kas 20.30 | 039 | 080 |
| 18 Kas 08.30 | 009 | 082 |
| 19 Kas 08.30 | 068 | 081 |
| 20 Kas 20.30 | 075 | 083 |

Bir film yuvasına yetişmezse aynı türdeki bir sonraki yuvaya kayar.

**Yerinden çıkan stok filmler (003, 039, 009, 068):**
- Silinmez, 24 Kasım 20.30'dan sonraki ilk boş yuvalara aynı türle yerleşir (`publishAt`).
- 069–073'ün tarihleri **kaydırılmaz**: 071 "annen" Pazar gününe, 073 "dolunay" 24 Kasım süper ayına bağlı. 068 tek başına 25 Kasım 08.30'a taşınır.

**Teknik:**
- **Buffer'da zaten planlı yuva** (dueAt − şimdi < 48 sa; 17 Kas'taki iki yuva ve 18 Kas sabahı):
  - `state/ledger.json` içinde o yuvanın `episode` alanı pilot no'suyla değiştirilir.
  - Ardından `node tools/remedia.mjs <pilot>` çalıştırılır. Bu araç videoyu medya dalına iter, Pages'te 200 döndüğünü bekler, `editPost` ile video ve metni yeniler.
  - Eski `media` değeri `prevMedia` olarak kalır.
- **Henüz planlanmamış yuva:**
  - Pilotun `publishAt` alanı yuvaya yazılır.
  - Yerinden çıkan filmin `publishAt` alanı yeni tarihine taşınır.
  - Buffer'a CI, yayından yaklaşık 48 saat önce yükler.
- **Zaman sınırı:** Yuvaya 60 dakikadan az kalmışsa o yuvaya dokunulmaz, sıradaki yuvaya geçilir. Örneğin 079, 07.30 TSİ'ye kadar canlı değilse 17 Kas sabahı 003'te kalır.
- **Doğrulama:**
  - Her değişiklikten sonra Buffer durumu sorgulanır: `postsBetween` ile metin, video URL'si ve dueAt bakılır.
  - Medya URL'si `curl -I` ile 200 ve `video/mp4` döndürmeli.
- Defter (ledger) ve episode JSON'ları commit edilip push edilir. Bu adım atlanırsa CI medyayı budar.

**Ölçüm notu:** Raporda her pilot için karşılaştırma tabanı yazılır:
- çizgi ortalaması: izlenme oranı ≈ 0,30, 1–1,7K izlenme;
- 083 için ayrıca 075 tahmini.

Pilotlar yayımlandıktan 48 saat sonra IG Pro Pano'dan izlenme oranı, paylaşım ve takip bakılır.

## Zaman ve öncelik

- Öncelik sırası tablodaki gibidir: 079, 083, 080, 082, 081.
- Saat 07:00'de (TSİ) bitmemiş film yarım render olarak teslim edilmez. O filmden yalnızca senaryo ve stil kareleri bırakılır, raporda nerede kalındığı yazılır.
- Beş vasat film yerine üç iyi film teslim edilir. 8+ kapısı hiçbir film için gevşetilmez.
- Takvim yalnızca "Yayına alma" bölümündeki kurala göre değişir. Başka hiçbir stok filme dokunulmaz.
- Yayına alma işi 079 biter bitmez başlar. Sabah yuvası 08.30'da olduğu için her film bitince hemen yerleştirilir; bütün filmlerin bitmesi beklenmez.

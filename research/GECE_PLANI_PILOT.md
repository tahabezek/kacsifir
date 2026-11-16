# Gece planı (16 → 17 Kasım 2026): iki pilot film, yeni iskelet

Kullanıcı: "animasyonlarımız çok tek düze ve kötü… video kendini izlettirmiyor." Sonra: "bunu planla, gece yapacaksın."

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
- **Kural:** Oran kaynaklarla en az ~1,5 kat tutmuyorsa film iddiayı yumuşatmaz, konu değişir. Bu durumda yedek konuya geç.

**Yedek konu:** "Ankara'da bir top patlasa sesi İstanbul'a uçaktan önce mi varır?"
- Türkiye haritasında yarış: ses ≈ 17 dk, uçak ≈ 55 dk havada, YHT ≈ 4 sa.
- Bütün süreler kaynaklı olmalı.

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

## Çalışma sırası ve kapılar (gece oturumu)

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
   - `out/079/video.mp4` ve `out/080/video.mp4` üretilir, `prebuilt/` klasörüne kopyalanır.
   - Temas kâğıtları `out/<id>/contact.png` olarak kaydedilir.
   - **Buffer'a planlanmaz, `publishAt` boş bırakılır.** Kullanıcı sabah izleyip onaylarsa yayına konur.
9. **Sabah raporu:** `research/PILOT_RAPORU.md` yazılır. İçeriği:
   - ne yapıldı;
   - puanlar;
   - bilinen kusurlar;
   - kulakla kontrol edilecek adlar;
   - yayın önerisi (hangi gün ve saat, hangi stok filmin yerine).
10. **Kapanış:** Commit ve push yapılır. Deneme çıktıları, ara kareler ve kullanılmayan sesler silinir (disk dolu).

## Zaman ve öncelik

- Sıra B, sonra C. B daha kısa; fizik altyapısı da burada kurulur.
- Saat 06:30'da (TSİ) C bitmemişse yarım render teslim edilmez. B tam teslim edilir. C'den yalnızca stil kareleri ve senaryo bırakılır, raporda nerede kalındığı yazılır.
- Stoktaki 16 film ve Buffer takvimine dokunulmaz.

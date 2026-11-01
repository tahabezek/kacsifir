# Kaç Sıfır? · Yol haritası (Kasım 2026)

Analiz tarihi: 1 Kasım 2026. Kaynaklar: Instagram Profesyonel Pano (son 30 gün), `state/metrics.json` (Buffer), `prebuilt/` süreleri.

## 1. Bugünkü tablo (21 Ekim – 1 Kasım, 12 gün)

| Ölçü | Değer |
|---|---|
| Gönderi | 40 (29 reel, 11 karusel) |
| Görüntülenme | 43.733 (33.461 farklı kişi) |
| Takipçi olmayanlardan gelen görüntülenme | %99,1 |
| Etkileşim | 475 (374 hesap) |
| Profil ziyareti | 354 |
| Takipçi | **59** |
| Ortalama izlenme oranı (reel) | 0,39 |
| Paylaşım / 1.000 görüntülenme | 1,1 |
| Takipçi / 1.000 görüntülenme | 1,35 |

Buffer'ın raporu beğeni ve takip sayısını hep 0 gösteriyor. Bu veriler Buffer'a gelmiyor; `state/report.md` puanları bu yüzden eksik.

## 2. Veri ne söylüyor

**a) İki kapılı bir dağıtım var ve ikinci kapıyı hiçbir video geçemedi.**
- Instagram her reeli önce yaklaşık 200 kişiye gösteriyor. 10 reel burada kaldı (162–384 görüntülenme).
- İlk kapıyı geçen 19 reelin hepsi 1.480–2.375 arasında durdu. **2.400'ü aşan tek bir video yok.**
- İkinci kapıyı geçmek için izlenme oranı ve paylaşım gerekiyor. İkisi de düşük: izlenme oranı 0,40, paylaşım binde 1.

**b) Uzun filmler izlenme oranını düşürüyor.**
- 30 saniye ve altı: ortalama izlenme oranı 0,41.
- 45 saniyeden uzun: 0,29.
- 70 saniyelik 033 (Kozmonot ve asker) 223 görüntülenmede kaldı, izlenme oranı 0,18.
- Takvimde 1–17 Kasım arası 20:30 kuşağındaki 16 "Hangisi" filminin hepsi 63–85 saniye. **En büyük risk bu.**

**c) Hikâye ve Türkiye konuları 2–3 kat daha fazla etkileşim alıyor.**

| Bölüm | Etkileşim | 1.000 görüntülenme başına |
|---|---|---|
| 023 Cumhuriyet'in saniyeleri | 41 | 19 |
| 052 Tam bu dakikada | 33 | 22 |
| 014 Hangisi: kuş ve yürüyen adam | 32 | 20 |
| 058 Hangisi: uçak yiyen adam | 35 | 15 |
| 050 Harf Devrimi (ilk gününde) | 30 | ~14 |
| 021, 013, 054, 027, 024 (saf ölçek) | 17–21 | 7–10 |

Saf ölçek videoları (karınca, domino, su) izleniyor ama kimse yorum yapmıyor, paylaşmıyor.

**d) Karuseller işe yaramıyor.** 11 karusel toplam yaklaşık 150 görüntülenme aldı (ortalama 13). Bunlar eski reellerin tekrarı olduğu için profil ızgarasını da kalabalıklaştırıyor.

**e) Saat fark yaratmıyor.** 08:30, 13:00 ve 20:30 reelleri aynı aralıkta. Sonucu konu ve ilk 3 saniye belirliyor.

**f) Profil dönüşümü fena değil, trafik az.** 354 ziyaretçiden 59'u takip etti (%17). Bio hâlâ "Her gün 3 ölçek" diyor, oysa günde 2 gönderi var. (1 Kasım'da düzeltildi.)

**g) Asıl sorun görsel dil (kare denetimi, 1 Kasım).** 058, 054, 033, 050, 052 ve 023'ün 0., 0,5., 1,5., 3., 6. ve 12. saniye kareleri yan yana kondu:
- İlk 3 saniyede ekranda neredeyse hiçbir şey değişmiyor. Kaydırma kararı bu sürede veriliyor.
- Karakterler ve nesneler kadrajın altıda biri kadar; telefonda küçük çizgi figür olarak kalıyor. Alt üçte bir boş.
- Bej kâğıt, siyah çizgi, tek bir küçük kırmızı. Akışta ders kitabı sayfası gibi duruyor.
- Üstte yazı bloğu ve sol üstte "№ 058 · HANGİSİ?" köşe etiketi var (kendi yasak listemizde).
- Rakip tarafta Türkiye'de patlayan işler (ör. "Diyarbakır 2026, zamanı geri sarıyoruz": 11,7 bin beğeni, 270 paylaşım) sinematik: derinlik, ışık, renk, tek güçlü imge ve ilk kareden hareket eden kamera.

## 2b. Yeni görsel dil: "Sinema" (№ 067'den itibaren)

Motor: `engine/sinema.js` (three.js). Kare başına 16 örnek; hareket bulanıklığı, alan derinliği, parlama, ACES film eğrisi, vinyet ve gren.

| Kural | Değer |
|---|---|
| Sahne | gerçek 3D mekân (gece sokağı, meydan, şehir); ışıklı, malzemeli |
| Kahraman nesne | kadrajın en az %40'ı; gerçek malzeme (metal, cam, su) |
| Kamera | hiç durmaz; kare 0'da hareket hâlinde; sokaktan meydana tek baskın yön |
| Kare 0 | soru büyük başlık (100 px), arkada kahraman nesne zaten görünür |
| Altyazı | kelimeye kilitli parçalar, 70 px, beyaz, yumuşak gölge, en az 1,25 sn |
| Büyük sayı | 150 px beyaz, birimi altın rengi; sayarak gelir |
| Ölçü | 3D'den izdüşen altın çizgi ve 104 px etiket |
| Renk | koyu sıcak gece, altın (#FFC845) vurgu, sıcak lamba ışığı; mor-mavi yok |
| Köşe etiketi, üst yazı bloğu | yok |
| Süre | 30–37 sn |

## 3. Hedefler

5.000 takipçi hakkında dürüst hesap: bugünkü dönüşümle (binde 1,35) 3,7 milyon görüntülenme gerekir. Bu ancak bir videonun patlamasıyla olur. Bu yüzden hedef, ikinci kapıyı geçen video üretmek.

| Ölçü | Bugün | 15 Kasım | 30 Kasım |
|---|---|---|---|
| Takipçi | 59 | 150 | 400 |
| Ortalama izlenme oranı | 0,39 | 0,50 | 0,55 |
| Paylaşım / 1.000 | 1,1 | 3 | 5 |
| Takipçi / 1.000 görüntülenme | 1,35 | 2,5 | 3 |
| 2.400'ü aşan reel | 0 | 1 | 3 |

## 4. Yol haritası

### Faz 1 · Hızlı düzeltmeler ve pilot (1–4 Kasım)
1. ✅ **Karuseller durduruldu:** `carouselSlotsTR` boş; 1 ve 2 Kasım karuselleri Buffer'dan kaldırıldı.
2. ✅ **Bio güncellendi:** "Türkiye'nin ve evrenin akıl almaz sayıları, gözünün önünde. Her gün 08:30 ve 20:30'da yeni bir sayı. Kaynaklar açıklamada ↓"
3. ⏳ **Profile 3 reel sabitle:** 023 Cumhuriyet, 058 Uçak yiyen adam, 050 Harf Devrimi. Web sürümünde sabitleme yok; telefondan yapılacak.
4. ✅ **Pilot № 067 "Dünyadaki bütün altın tek bir küp olsa?":** yeni Sinema dilinde ilk film. 3 Kasım 20:30.
5. **Hangisi filmleri:** sıradaki 16 film 63–85 saniye ve eski dilde. Her yeni Sinema filmi bir akşam yuvasını alır; yerinden çıkan Hangisi takvim sonuna kayar. Pilot tutarsa Hangisi formatı da Sinema diline taşınır.
6. **Ölçüm körlüğünü kapat:** her pazartesi Profesyonel Pano'dan reel başına görüntülenme, etkileşim ve takip okunacak ve `state/ig-insights.json` dosyasına yazılacak.

### Faz 2 · Kanca deneyi ve 10 Kasım (5–14 Kasım)
1. **051 Atatürk anma filmi:** açık notun gereği yapılacak; film daha duygu yüklü hâle getirilecek. Gerçek kamu malı fotoğraflar ve kaynaklı bilgiler kullanılacak. Sesi önce sen dinleyeceksin.
2. **Kanca kuralları:**
   - kare 0'da izleyiciye bir tahmin yaptıran soru olacak;
   - ilk 1 saniyede bir sayı ya da nesne hareket edecek;
   - cevap 3. saniyeden önce verilmeyecek;
   - sayı filmleri 20–30 saniye, Hangisi filmleri 35–45 saniye olacak.
3. **Deneme Reels:** Instagram'ın "deneme" özelliğiyle aynı videonun iki farklı kancası yalnızca takipçi olmayanlara gösterilecek. Kazanan kanca asıl yayına çıkacak. Buffer bunu desteklemediği için bu adım elle yapılır; haftada 2 deneme yeterli.
4. **Yorum tetikleyici:** her açıklama bir soruyla bitecek, örneğin "Sence hangisi? Yoruma yaz." Bugüne kadar toplam 8 yorum var.

### Faz 3 · Kazananı çoğalt (15–30 Kasım)
Takvim 19 Kasım'dan sonra boş. Yeni parti günde 2 gönderi olacak ve şöyle karışacak:
- **%50 Türkiye konusu:** tarih, şehirler, yerel sayılar (023/050/052 çizgisi);
- **%30 kısa Hangisi:** en fazla 45 saniye;
- **%20 uzay ve ölçek:** yalnızca güçlü bir "aha!" anı olanlar.

Bütün yeni filmler Sinema dilinde yapılır. Pilot 067'nin ilk 48 saatteki görüntülenme, izlenme oranı ve paylaşım sayısı eski filmlerin ortalamasıyla (1.327 görüntülenme, 0,39, binde 1,1) karşılaştırılır. Bir film 2.400'ü geçerse aynı kalıptan hemen 2 film daha üretilir.

Sinema dili için sıradaki aday konular (Türkiye + tek güçlü imge):
- İstanbul'un bir günde ürettiği çöp tek bir yığın olsa (meydanda dağ)
- Türkiye'de bir yılda içilen çay tek bir bardakta (Boğaz'da dev bardak)
- Türkiye'nin bütün nüfusu omuz omuza dursa ne kadar yer kaplar (şehir üstünden uçuş)
- Bir yılda yenen simit üst üste dizilse (Ay'a mı ulaşır?)

## 5. Karar kuralları (her pazartesi)
- İzlenme oranı 0,30'un altında kalan şablon bir daha kullanılmaz.
- Etkileşimi binde 15'in üstünde olan konu türü bir sonraki partide iki katına çıkar.
- 2 hafta boyunca 2.400'ü aşan video çıkmazsa format değişir: süre, kanca ya da maskotun yeri yeniden düşünülür.
- 12 Kasım'daki planlı analiz (`kacsifir-analiz-12-kasim`) bu tabloya göre yapılır.

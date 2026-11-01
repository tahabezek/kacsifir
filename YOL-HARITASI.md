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

**f) Profil dönüşümü fena değil, trafik az.** 354 ziyaretçiden 59'u takip etti (%17). Bio hâlâ "Her gün 3 ölçek" diyor, oysa günde 2 gönderi var.

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

### Faz 1 · Hızlı düzeltmeler (1–4 Kasım)
1. **Karuselleri durdur:** `config.json` içindeki `carouselSlotsTR` boşaltılacak.
2. **Hangisi filmlerini kısalt:** sıradaki 16 film 45 saniyenin altına indirilecek. İlk olarak 059 (2 Kasım), 062 (3 Kasım) ve 041 (4 Kasım) yeniden kurgulanacak. Buffer'daki gönderinin videosu `tools/remedia.mjs` ile değiştirilecek; gönderi silinip yeniden yüklenmeyecek. Kesilecek kısımlar: uzun kurulum, ikinci karakterin girişi öncesindeki bekleme, sondaki tekrar.
3. **Bio (senin onayınla):** "Türkiye'nin ve evrenin akıl almaz sayıları, gözünün önünde. Her gün 08:30 ve 20:30'da yeni bir sayı. Kaynaklar açıklamada ↓"
4. **Profile 3 reel sabitle (senin onayınla):** 023 Cumhuriyet, 058 Uçak yiyen adam, 050 Harf Devrimi.
5. **Ölçüm körlüğünü kapat:** her pazartesi Profesyonel Pano'dan reel başına görüntülenme, etkileşim ve takip okunacak ve `state/ig-insights.json` dosyasına yazılacak. Puanlama bu veriyle yapılacak.

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

Bunlara ek olarak her hafta bir **amiral gemisi film** yapılacak. Bu filmin tek amacı ikinci kapıyı geçmek; adayı backlog'daki "Masa" fikri. Bir film 2.400'ü geçerse aynı kalıptan hemen 2 film daha üretilecek.

## 5. Karar kuralları (her pazartesi)
- İzlenme oranı 0,30'un altında kalan şablon bir daha kullanılmaz.
- Etkileşimi binde 15'in üstünde olan konu türü bir sonraki partide iki katına çıkar.
- 2 hafta boyunca 2.400'ü aşan video çıkmazsa format değişir: süre, kanca ya da maskotun yeri yeniden düşünülür.
- 12 Kasım'daki planlı analiz (`kacsifir-analiz-12-kasim`) bu tabloya göre yapılır.

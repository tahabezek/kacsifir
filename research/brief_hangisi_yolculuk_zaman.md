# "Hangisi daha şaşırtıcı?" — anlatımlı gravür küre bölümleri (014 yeniden, 033)

Hazırlanma: 22 Ekim 2026. Kullanıcı notu: 014'ün cetvel + sayaç sürümü "basic"ti; olayların büyüklüğü
hissedilmiyordu. Yeni dil, olayı gerçek dünya haritasında anlatırken canlandırmak. Teknik kaynaklar:
`research/video_skill_repolari_2.md`.

## Ortak düzenek

- **Ses saattir.** Satırlar edge-tts (tr-TR-AhmetNeural, +16 %) ile üretilir (`tools/voice_tts.py`), kelime
  zamanları faster-whisper ile ölçülür ve metne sabit noktalı hizalanır (`tools/voice_words.py`). Zaman
  çizelgesi ölçülmüş konuşma bitişlerinden kurulur (`yolculuk_core.buildYolTimeline`; satır arası boşluklar
  bölüm dosyasında `voice.gaps`). Görsel ipuçları kelimelere bağlıdır (`W(satır, kelime)`).
- **Gravür küre** (`engine/globe.js`): Natural Earth (world-atlas) ortografik; deniz yatay ince çizgi, kara
  açık kâğıt + mürekkep kıyı, kıyı halesi, sınırlar kesik grafit, gölge hilali çapraz tarama. Yakın planda
  10m veri. Kamera tek dönüşüm, yarıçap log uzayda; bekleme anlarında %5–10 yavaş yaklaşma (donma yok).
- **Hikâye büyüteci:** sol altta yuvarlak detay balonu; yolcunun o anki hâli (uçuş, yürüyüş, buz, yüzme,
  bekleme, uzay, orman). Kılavuz çizgisi yolcunun küredeki yerine bağlanır.
- **Sıfır** sağ altta; tepkiler olay takviminden, balonlar kısa ("11 gün mü?!").
- **Tek kırmızı:** doruktaki sayı (014: 53 km; 033: 28,5 yıl çubuğu).
- **Ses:** anlatım, altında kısılan La minör yatak (100 bpm), kalem sürtmesi, kırbaç kaydırma, takvim tıkı,
  tek riser, doruktan önce gerçek sessizlik, tek impact (`tools/audio_voicefilm.mjs`).
- Kare 0 = başlık + küre + büyüteç; döngü sonunda aynı kareye döner.

## 014 — Kuş mu, adam mı?

- **Logline:** 5 aylık bir kuş Pasifik'i 11 günde hiç inmeden geçer; bir adam 28 yıldır evine yürür.
- **Akılda kalacak tek şey:** aynı 11 günde adam ortalama hızıyla yalnızca 53 km yol alırdı; ama toplam yolu
  Dünya'nın çevresinden uzun.
- Akış: Alaska yakın plan → Pasifik (hedef halkası, planlanan yol noktalı) → Tazmanya'ya iniş → kırbaç
  kaydırma → Punta Arenas → Amerika → donmuş Bering → Sibirya/Çin → Türkmenistan–İran sınırında 5 yıl
  (takvim akar, yol durur) → Hazar'ı yüzerek → Türkiye ve İstanbul → Manş'ı yüzerek Dover, Hull'a 400 km →
  aynı saat (kuş yeniden uçar, adam noktası) → Punta Arenas'a dalış: kırmızı 53 km → geri çekilme, ekvator
  (40.075 km) ve 49.500 km → soru.

## 033 — Kozmonot mu, asker mi?

- **Logline:** bir kozmonot yörüngedeyken ülkesi haritadan silinir; bir asker savaşın bittiğine 28,5 yıl
  inanmaz.
- **Akılda kalacak tek şey:** askerin "geç kalmış" süresi kozmonotunkinden yaklaşık 116 kat uzun.
- Akış: SSCB taralı küre + yörünge → Baykonur'dan kalkış → "dağılıyor" kelimesinde iç sınırlar çizilir
  (15 ülke) → 311 gün → Kazakistan'a iniş (artık bağımsız) → kırbaç kaydırma → Filipinler → Lubang adasına
  dalış → orman büyüteci (bildiriler düşer, asker saklanır) → Ay gravürü (20 Temmuz 1969) → teslim (kılıç)
  → aynı cetvel: 90 gün çubuğu (3 px) ve 28,5 yıl kırmızı çubuk, üstünde 116 çentik → soru.
- Kaynaklar: Wikipedia (Sergei Krikalev; Soyuz TM-12/13; Hiroo Onoda), History Hit. Tarihler:
  18.05.1991 → 25.03.1992 (311 gün); SSCB 26.12.1991 (ülkesiz 90 gün); savaş 15.08.1945 → teslim 9.03.1974
  (10.433 gün, 28,56 yıl; oran 115,9).

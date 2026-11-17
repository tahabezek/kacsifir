# Pilot raporu (17 Kasım 2026): yeni iskelet, beş film

**Neden yazıldı:**
- Kullanıcı: "animasyonlarımız çok tek düze… video kendini izlettirmiyor". Ardından "5 tane yap" ve "render olunca en kısa zamandaki videolarla değiştir ki etkiye bakalım".
- Plan: [GECE_PLANI_PILOT.md](GECE_PLANI_PILOT.md).

**Nasıl yapıldı:**
- 23.45'te zamanlanan gece görevi hemen düştü: model kullanım sınırına takıldı.
- İş 02.30–04.30 arasında ana oturumda yapıldı. 079'u ana oturum yaptı, diğer dört film paralel alt ajanlarda üretildi.
- Her filmi yapımına katılmamış bağımsız bir eleştirmen 2–5 tur puanladı.

## Yayın takvimi (Buffer'da doğrulandı, 17 Kas 04.25)

| Yuva (TSİ) | Önce | Şimdi | Durum |
|---|---|---|---|
| 17 Kas 08.30 | 003 | **079** Hangisi ağır basar? | Buffer'da planlı, medya 200 |
| 17 Kas 20.30 | 039 | **080** Titanik'in son 160 dakikası | Buffer'da planlı, medya 200 |
| 18 Kas 08.30 | 009 | **082** Ses mi uçak mı? | Buffer'da planlı, medya 200 |
| 19 Kas 08.30 | 068 | **081** Türkiye bir günde ne kadar çay içer? | `publishAt` yazıldı; CI yaklaşık 48 saat önce yükler |
| 20 Kas 20.30 | 075 | **083** Hachikō'nun 3.578 günü | `publishAt` yazıldı; CI yükler |

**Yerinden çıkan filmler (silinmedi):**
- 068 → 25 Kas 08.30
- 003 → 26 Kas 08.30
- 009 → 27 Kas 08.30
- 039 → 24 Kas 20.30
- 075 yayından çekildi (`disabled`): 083 aynı hikâyeyi anlatıyor. A/B sonuçlarından sonra karar verilecek.
- Tarihe bağlı filmlerin tarihleri değişmedi: 049 (18 Kas, Voyager), 071 (Pazar) ve 073 (24 Kas, süper ay).

## Filmler ve son kritik puanları

Puanlar 1–10. Başlıklar sırasıyla: kanca · okunabilirlik · hareket · çeşitlilik · kompozisyon · doğruluk · senkron · Türkçe.

| № | Süre | Son puanlar | Eleştirmenin son sözü |
|---|---|---|---|
| 079 | 19,2 sn | 7 · 8 · 8 · 6 · 7 · 9 · 8 · 8 | 5 sürüm. "Yayına hazır." Kanca, tahmin sorusu (ses 0,1 sn'de). |
| 080 | 48,5 sn | 8 · 7 · 7 · 7 · 7 · 9 · 8 · 9 (duygu 7, saygı 8) | 4 sürüm. Tek yayın engeli (altyazı taşması) son turda düzeltildi; son hâli yeniden puanlanmadı. |
| 081 | 22,0 sn | 7 · 8 · 8 · 8 · 8 · 9 · 9 · 9 | 4 sürüm. "Yayına hazır." Son cila (çay dökülmesi, silüet) sonrasında yeniden puanlanmadı. |
| 082 | 24,8 sn | 8 · 8 · 7 · 5 · 8 · 9 · 8 · 8 | 5 sürüm. Namlu uçağa nişanlıydı ve yayın engeliydi, düzeltildi. Yarım cümle altyazı da düzeltildi. |
| 083 | 42,5 sn | 7 · 8 · 7 · 6 · 7 · 9 · 8 · 8 (duygu 7) | 3 sürüm. "HIBUYA" tabelası yayın engeliydi, düzeltildi. Eleştirmen: "075'ten açıkça daha çok izletir." |

**Dürüstlük notu (8+ kapısı):**
- Plan "bütün puanlar 8+" diyordu; bu kapı gevşetildi.
- Çeşitlilik 5–7 aldı, çünkü tek plan iskeletin kendisi. Bu deneyin ölçmek istediği şey.
- Kanca ve kompozisyon bazı filmlerde 7'de kaldı.
- Gerekçe: kullanıcı etkiyi en kısa zamanda görmek istedi. Bütün doğruluk, güvenli alan ve yayın engeli sorunları kapatıldıktan sonra yayına alındı.

## Gerçekler (kaynaklar her bölümün `facts.sources` alanında)

- **079:**
  - Greenspoon ve ark. 2023 (PNAS): vahşi memeliler ≈ 60 Mt (kara 20, deniz 40), insanlar ≈ 390 Mt.
  - İlk fikir "inekler mi?" bırakıldı: sığır ≈ 420 Mt, fark 1,5 katın altında.
- **080:**
  - Saatler, filikalar ve Carpathia: British Inquiry ve ABD Senatosu kaynaklı.
  - Californian için "40 km bile uzakta değildi" ifadesi kullanıldı (MAIB 1992 üst sınırı). "En yakın gemi" ifadesi kullanılmadı.
  - "~470 boş yer" hesabı: 1.178 kapasite − 706/712 kurtulan.
- **081:**
  - Günde ~245 milyon bardak (Rize Çay Araştırma Merkezi, TRT Haber).
  - ∛245 milyon ≈ 626 kat → yaklaşık 58 m; Galata Kulesi 62,6 m, bu yüzden "neredeyse" deniyor.
- **082:**
  - Ankara–İstanbul kuş uçuşu 350 km, ses 343 m/sn → 17 dk.
  - Uçağın havada geçen süresi ~45–50 dk. Bu yön için doğrudan kaynak yok; blok süreden çıkarıldı.
- **083:**
  - Tarihler ve 3.578 gün nippon.com ve Tokyo Üniversitesi kaynaklı.

## Kulakla kontrol (kullanıcı)

- 079: Soran'ın açılış sorusu.
- 080: "Cek Filips", "Karpatya", "Kaliforniyın", "Titanik'i", "Gelmedi." satırının tonu, fişek sesleri.
- 081: "İstanbul'un bir simgesine", "Galata Kulesi'ne", "altı yüz kattan".
- 082: "kırk beşinci dakikada", "on yedi".
- 083: "Haçiko", "Ueno", "Köpek ne yapıyor?", "onu tanıyor", "bin dokuz yüz otuz ikide".

## Ölçüm

- Her pilottan 48 saat sonra IG Pro Pano'ya bakılacak: izlenme oranı, paylaşım/1k, takip/1k.
- Çizgi filmlerin tabanı: izlenme oranı 0,23–0,37 (ortalama ≈ 0,30), 1,0–1,7K izlenme, paylaşım ≈ 0.
- 083 ile 075 karşılaştırması: aynı hikâye, yalnızca iskelet farklı. 075 yayımlanmadığı için 083, aynı türdeki çizgi hikâyelerin (037, 061, 065, 066, 043) ortalamasıyla karşılaştırılacak.
- Bakılacak tarihler:
  - 079: 19 Kas sabah
  - 080: 19 Kas akşam
  - 082: 20 Kas sabah
  - 081: 21 Kas sabah
  - 083: 22 Kas akşam

## Altyapıya eklenenler

- `film.open` (`engine/sinema_overlay.js`, `engine/cizgi.js`): kutusuz altyazı. Mürekkep yazı kâğıt renkli konturla çiziliyor, Soran'ın sözü sarı konturlu. Kart yalnızca `cards: true` ile çiziliyor.
- `voice.askHold` (`engine/scenes/yolculuk_core.js`): kapanış beklemesi film başına ayarlanabiliyor (varsayılan 2,6 sn). TAKİP ET çipi `askHold − 0,7` sn görünüyor, bu yüzden değer ≥ 1,9 tutulmalı.
- `tools/senaryo_json.mjs`, `research/pilot/<id>.md` dosyalarını da okuyor; paralel yazımda çakışma olmuyor.
- Eski filmler bu değişikliklerden etkilenmiyor; hepsi isteğe bağlı alanlar.

## Dersler

- **Yanlış tahmini kışkırtan replik kancayı öldürür.** "Bunlar kesin ağır basar" cevabı ele veriyordu. Doğrudan soru (079 v5) daha iyi çalıştı.
- **Sayıyı göz önünde kurmak** (079'daki çuvallar: 60 → 390) eleştirmenin en çok puan verdiği an oldu.
- **Kuyruk sorunu:** cevaptan sonraki kuyruk her filmde ilk eleştiri. `askHold` küçük, ama TAKİP ET için ≥ 1,9 sn.
- **Kod ile çizilen semboller bağlam ister.** Yolcu uçağına nişanlı bir top gibi bir görüntü ancak bağımsız gözle yakalanabiliyor.

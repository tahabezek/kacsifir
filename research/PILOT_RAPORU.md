# Pilot raporu (17 Kasım 2026): yeni iskelet, beş film

**Neden yazıldı:**
- Kullanıcı: "animasyonlarımız çok tek düze… video kendini izlettirmiyor".
- Plan: [GECE_PLANI_PILOT.md](GECE_PLANI_PILOT.md).
- Zamanlanmış gece görevi 23.45'te başladı ama hemen düştü: model kullanım sınırına takıldı. İş 17 Kasım 02.30'dan itibaren ana oturumda yapıldı.

**Ortak altyapı:**
- Çizgi motoruna isteğe bağlı kutusuz altyazı eklendi (`film.open`, `engine/sinema_overlay.js`). Yazı mürekkep renginde ve kâğıt renkli konturlu. Soran'ın sözü sarı konturlu. Kart yalnızca istenirse çizilir.
- `tools/senaryo_json.mjs` artık `research/pilot/<id>.md` dosyalarını da okuyor. Böylece her film kendi senaryo dosyasında duruyor.
- Eski filmler bundan etkilenmiyor; kutusuz altyazı yalnızca isteyen filmde açılıyor.

## 079 · Hangisi ağır basar? (yapı B: tahmin et)

**Konu değişikliği:**
- İlk fikir "bütün inekler mi, bütün insanlar mı?" idi. Kaynakta sığırlar yaklaşık 420 Mt, insanlar yaklaşık 390 Mt. Fark 1,5 katın altında kaldığı için bu karşılaştırma bırakıldı.
- Aynı kaynaktan yeni karşılaştırma: bütün vahşi memeliler yaklaşık 60 Mt (karada yaklaşık 20, denizde yaklaşık 40), insanlar yaklaşık 390 Mt. Oran 6,5 kat.
- Kaynak: Greenspoon ve ark. 2023, PNAS.

**Film:**
- Tek sabit sahnede dev bir terazi var.
- Hayvanlar "filler, balinalar, geyikler" kelimelerine kilitli olarak sağ kefeye düşer, terazi sağa yatar.
- "Bunlar kesin ağır basar." cümlesi gelir.
- İnsanlar sol kefeye yağar ve terazi dengeye gelir. 1,1 sn sessizlik olur, son dalga iner ve TAK.
- Ekranda "6,5 kat" yazar, ardından 60 ve 390 milyon ton gösterilir.
- Kapanış: "Bunu hayvanları seven birine gönder." Kefeler devrilip boşalır ve döngü başa döner.

**Ölçüler:**
- Süre 24,2 sn, 44 kelime (1,8 kelime/sn).
- Kapılar: donma yok, döngü dikişi SSIM 0,97, ses −14 LUFS / TP −3,2 dBTP, render deterministik.

**Dosyalar:**
- `out/079/video.mp4`
- `prebuilt/079-hangisi-agir-basar.mp4`
- `out/079/critique/`

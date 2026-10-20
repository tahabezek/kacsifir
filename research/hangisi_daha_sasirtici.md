# "Hangisi daha şaşırtıcı?" serisi: format ve vaka araştırması

Hazırlanma: 21 Ekim 2026. Amaç, formatı anlamak ve serinin değindiği **gerçek olayları** bağımsız
kaynaklardan araştırmak. Kanalın görüntüsü, metni, markası ve kurgusu kullanılmayacak. Bu dosyada
videolardan alıntı yok; vakalar kendi cümlelerimle özetlendi.

---

## 0. Kısa özet

- **Kanal:** Gri Meseleler (`@GriMeseleler`, kanal kimliği `UCK9vY8RzL6owvqgmVE35zTA`). Yaklaşık
  191 bin abone ve 788 video var. İki sunucu: Burak Bilaş (anlatan / soran) ve Burak Zengin
  (kurgu ve içerik). Kanal açıklaması "Gri, bir yorum rengidir" diye başlıyor.
- **Oynatma listesi:** "Şaşırtıcı Bilgiler Serisi" (`PLgTnY4mrpLSU3zYY-9-VNgCuruMvAe0PO`).
  **98 Shorts** var; hepsi alındı. İlk yükleme 21.03.2024, son yükleme 05.07.2026.
- **Süre:** 21–75 sn, ortalama 42,9 sn. 2024–2025 bölümleri 25–40 sn, 2026 bölümleri 45–70 sn.
- **İzlenme:** 98 videonun toplamı ≈ **295 milyon**, ortanca ≈ 2,5 milyon. En yüksek: #1 Karl
  Bushby / Sylbaris, 10,7 Mn. Ardından #18 Carlos Kaiser, 10,2 Mn ve #8 David Reimer / Bermuda
  kardeşleri, 9,9 Mn.
- **Erişim:** Oynatma listesine erişildi. WebFetch sayfayı kesik getirdi. Bu yüzden listenin
  HTML'i ve YouTube'un herkese açık oynatıcı uç noktası kullanıldı. Her videonun tarihi, süresi,
  kesin izlenme sayısı ve otomatik Türkçe altyazısı çekildi. 95 videonun konusu altyazıdan
  çıkarıldı. Üç videonun altyazısı yok: #26, #34 ve #78. Bunların konusu bilinmiyor; yalnızca
  hashtag'leri var.
- **Doğruluk:** Seri, olayların önemli bir kısmında sayıları, tarihleri ya da milliyetleri yanlış
  veriyor. Bazı vakalar bilinen efsane ya da uydurma. Bizim için fırsat şu: **kaynaklı ve sayısal**
  bir versiyon.

---

## 1. Yöntem ve sınırlar

1. `youtube.com/playlist?list=…` sayfasının HTML'i indirildi. `ytInitialData` içinden 98
   `shortsLockupViewModel` kaydı ayrıştırıldı: video kimliği, başlık ve yuvarlanmış izlenme.
2. Her video için izleme sayfasından `publishDate`, `lengthSeconds` ve `viewCount` alındı.
   Konular, oynatıcı uç noktası üzerinden çekilen otomatik altyazılardan (ASR) okundu.
3. ASR metinleri gürültülü; özel adlar sık sık bozuk yazılmış. Adlar ve sayılar ayrıca web
   aramasıyla kontrol edildi.
4. Bazı videoların altyazısı İngilizce geldi (#43, #54, #56, #65–67). Büyük olasılıkla YouTube'un
   otomatik dublaj ya da çeviri izi. Konular aynı şekilde okundu.
5. Kaynak denetimi: bu oturumda web aramasıyla doğrulananlar **[web✓]** ile işaretli. Kalanlar
   yerleşik bilgiyle eşleştirildi; Wikipedia ya da haber kaynağı önerildi. **Yayından önce her
   sayı birincil kaynaktan yeniden kontrol edilmeli.** Kaç Sıfır? kuralı: her sayının
   açıklamada kaynağı olur.

---

## 2. Format analizi (kendi gözlemim)

**Yapı (ikili soru kalıbı):**

1. **0. saniye, sözlü kanca:** Her video aynı kalıpla açılır: "Hangisi daha şaşırtıcı?" Hemen
   ardından ilk vaka, uç bir sayı ya da paradoksla evet/hayır sorusu olarak gelir. Örnek
   kalıplar: "X yıl boyunca…", "N tane … ile aynı odada…". Bekleme yok, logo yok, giriş yok.
2. **Tepki köprüsü:** İkinci kişi kısa bir şaşkınlık ya da şüpheyle araya girer ("Nasıl yani?",
   "Niye?"). İzleyicinin sorusunu yüksek sesle sorar ve anlatıma geçişi sağlar.
3. **A anlatımı (10–25 sn):** Kronolojik, şimdiki zamanda ve "…-iyor" kipinde, kısa
   cümlelerle anlatılır. En çarpıcı sayı sona saklanır.
4. **"Yoksa…" pivotu:** İkinci vaka da aynı soru kalıbıyla gelir. B çoğu zaman A'dan farklı bir
   türdendir; örneğin tıp ile spor ya da trajedi ile magazin. Bu tür zıtlığı tartışmayı besler.
5. **Seçim ve kapanış:** Konuk birini seçer. Seçim çoğu zaman espri ya da kışkırtıcı bir yorum
   içerir. Video çıkış sahnesi olmadan, ani biter. Bu da yeniden oynatmaya ve döngüye yarar.
6. **Yorum çağrısı:** Başlık sabittir: "Hangisine daha çok şaşırdın?" (2024'te "Sizce hangisi
   daha şaşırtıcı? Cevaplarınızı yorumlara bekliyoruz"). Konuğun seçimi izleyiciyi itiraz
   etmeye çağırır.

**Evrim:**

- 2024: "Hangisi doğru?" (biri doğru, biri doğru sanılan yanlış) ve çok maddeli bilgi
  yarışması denendi. İzlenme düşük kaldı; #59–63 bu dönemden.
- 2025: 25–37 sn, kısa ve tek cümlelik B vakaları.
- 2026: 45–75 sn. Her iki vaka da tam anlatılıyor; izlenmeler belirgin biçimde arttı.

**Görsel dil:** Podcast stüdyosu ya da yürüyüş çekimi; iki kişi kamerada. Konu görselleri
sınırlı. Yani format tamamen **söze** dayanıyor.

**Konu seçimi:** Hayatta kalma, tıbbi tuhaflık, tesadüf, rekor, futbol sahtekârlığı ve
magazin. En çok izlenenlerde ortak nokta, **tek bir uç sayı** taşıyan hikâyeler: 28 yıl, 13 yıl,
42 yıl, 3 gün su altında.

**Bizim için çıkarımlar:**

- Kalıbın gücü, ikili seçim ile yorum çağrısının birleşmesinden geliyor. Konuşan kafa ise şart
  değil. Kaç Sıfır? bunu **ölçek çizimiyle** taşıyabilir: harita, kesit, sayaç, zaman çizelgesi.
- Onların zayıf noktası doğruluk. Bizim ayırt edici noktamız: her sayının yanında kaynak satırı
  ve "biz kontrol ettik" duruşu.
- Karşılaştırma onlarda duygusal, sayısal değil. Biz **ortak bir eksende** kıyas yapabiliriz:
  km/gün, saat, metre, kat. İki vaka aynı cetvele konur; soru yine izleyiciye bırakılır.

---

## 3. Oynatma listesinin tamamı (98 video)

Başlıkların hepsi neredeyse aynı: "Hangisine daha çok şaşırdın? #podcast #bilgi … #keşfet".
Bu yüzden başlık yerine **konu** yazıldı. Kimlikler `youtube.com/shorts/<id>` biçimindedir.
İzlenme sayıları 21.10.2026 tarihlidir. Durum kodları:
**D** doğrulanmış · **K** kısmen doğru ya da sayıları çarpıtılmış · **?** doğrulanamadı ya da
magazin · **E** efsane ya da uydurma · **G** görüş ya da trivia.

| # | Kimlik | Tarih | Sn | İzl. (Mn) | Vaka A | Vaka B |
|---|---|---|---|---|---|---|
| 1 | BXo-Ywm1-Fw | 2026-03-02 | 56 | 10.66 | Karl Bushby'nin dünya yürüyüşü (K) | Ludger Sylbaris, Pelée 1902 (K) |
| 2 | OGhc5qwUhfk | 2026-03-01 | 49 | 4.02 | Hedviga Golik, 42 yıl bulunmayan ceset (D) | Kafasında 94 yıl kurşunla yaşayan adam (?) |
| 3 | zd75WbbDVIA | 2026-02-28 | 55 | 1.48 | Inés Ramírez, kendine sezaryen (D) | Kaliforniya dağında 3 hafta (?) |
| 4 | fS_PCVD4_Bo | 2026-02-22 | 47 | 5.51 | Violet Jessop: Olympic / Titanic / Britannic (K) | Ali Khan Samsudin, 400 kobra (D) |
| 5 | V1TyYX0kO-c | 2026-02-13 | 52 | 1.64 | Brezilya: kocası kardeşi çıkan kadın (?) | Jeff Bush, Seffner obruğu 2013 (D) |
| 6 | UPP8tMcl4Kw | 2026-02-06 | 59 | 4.87 | Marie Wilcox, Wukchumni sözlüğü (D) | Fransa: 2 yıl yalnız yaşayan çocuk (K) |
| 7 | 8atu2EK_Q-g | 2026-02-02 | 43 | 5.82 | Jason Padgett, edinilmiş savant (D) | "İki kez doğan bebek" (K) |
| 8 | neoyb453QAc | 2026-01-31 | 75 | 9.93 | David Reimer (K) | Bermuda'da aynı taksiyle ölen iki kardeş (?) |
| 9 | NewshW-Y1h8 | 2026-01-25 | 66 | 1.46 | Adelir de Carli, balonlu rahip (K) | Bernio Verhagen, sahte futbolcu (D) |
| 10 | 6OaPqaIiPf0 | 2026-01-21 | 49 | 4.14 | Sahte hamilelik ("Bonnie Lake") (?) | Michael Packard ve kambur balina (D) |
| 11 | 3j3ZiWfU1Tk | 2026-01-15 | 38 | 5.54 | Tsimihety halkı ve saç (K) | Kazuyoshi Miura (D) |
| 12 | NrRdKChn_eY | 2026-01-12 | 49 | 4.70 | Mauro Prosperi, Sahra (D) | Timsahın burnuna parmak sokan kız (?) |
| 13 | ggVuvKBnBjk | 2026-01-07 | 41 | 7.82 | Harrison Okene, batık römorkör (D) | Hiroo Onoda (K: "I. Dünya Savaşı" ve "27 yıl" yanlış) |
| 14 | Y_KjXij1tx8 | 2026-01-03 | 43 | 3.74 | Cotard sendromlu eski asker (?) | Marcos Rodríguez Pantoja (K) |
| 15 | JCUAjUu9BcM | 2026-01-01 | 34 | 0.87 | Brandenn Bremmer (D) | Shridhar Chillal'in tırnakları (K) |
| 16 | mDpTmybFtiQ | 2025-12-25 | 37 | 2.20 | Bez bebekle "evlenen" kadın (?) | Kadınlardan kaçan adam (?, Ruanda) |
| 17 | ZguG1J1TSrs | 2025-12-23 | 48 | 5.66 | Randy Gardner, 11 gün uykusuz (D) | Robert Liston, "%300 ölüm" (E) |
| 18 | ZhWl8CDB5vc | 2025-12-20 | 51 | 10.17 | Carlos Kaiser (D) | 24 saat koşu, 11 Mn $ ödül (?) |
| 19 | tGt5gl9yXZ4 | 2025-12-17 | 36 | 0.48 | Jean Hilliard, donmuş kadın (K) | 12 sayısına takıntılı adam (?) |
| 20 | 0SvpoQE27sU | 2025-12-16 | 32 | 4.09 | Jaxon Buell (D) | Roy Sullivan, 7 yıldırım (D) |
| 21 | hkcyy9kwSWk | 2025-12-14 | 36 | 2.38 | Vesna Vulović (K: Sırp, Çek değil; irtifa tartışmalı) | Hemingway'in 1954'teki iki uçak kazası (K) |
| 22 | 5Rk_X9A4cC4 | 2025-12-13 | 37 | 7.11 | José Salvador Alvarenga, 438 gün (D) | Paraşüt kazasından Everest'e (?) |
| 23 | zXDy9cvpkQw | 2025-12-11 | 34 | 1.12 | Vassilyev ailesi, 69 çocuk (?) | Aishwarya Rai ağaç evliliği söylentisi (?) |
| 24 | tT6LmW9ALlw | 2025-12-07 | 30 | 6.95 | Farklı babalı ikizler, Brezilya 2022 (D) | Henry Ziegland, mermi ve ağaç (E) |
| 25 | PEQRx4OSNhs | 2025-12-04 | 36 | 1.13 | Clive Wearing (D) | Germanwings 9525 (D) |
| 26 | CP7CfDSgrOg | 2025-12-02 | 22 | 0.79 | altyazı yok (#hayvanlar #kedi) | |
| 27 | ArSQMOxxano | 2025-11-28 | 36 | 0.85 | Phineas Gage (K) | Frane Selak (?) |
| 28 | Si3Om6Hzcvk | 2025-11-15 | 33 | 1.43 | Kanzi bonobo ve Minecraft (K) | 36 kırmızı kart, Arjantin 2011 (D) |
| 29 | ih9ZNGkOW40 | 2025-11-08 | 35 | 6.32 | 33 Şilili madenci, 69 gün (D) | Alan Ruschel / Chapecoense (K: sayılar yanlış) |
| 30 | sogKNnxnBM8 | 2025-11-03 | 36 | 8.63 | Kafası delik yaşayan ABD askeri (K) | Çin'de alt yükleniciye verilen tetikçilik (D) |
| 31 | 7SzKh9MNAKg | 2025-10-22 | 30 | 0.08 | Akciğerde köknar filizi (Rusya 2009) (?) | Çift rahimli kadın (magazin) (?) |
| 32 | KqRKeMtNrnc | 2025-10-14 | 31 | 0.08 | Victor Noir mezarı geleneği (D) | Hakemi yumruklayıp kaçan futbolcu (?) |
| 33 | xlIhV8glF_A | 2025-10-11 | 27 | 0.95 | Ölümcül ailesel uykusuzluk ailesi (D) | Michael Rockefeller (K: yamyamlık kanıtlanmadı) |
| 34 | Qm0dh8OXjSc | 2025-10-08 | 27 | 3.03 | altyazı yok (#uyku) | |
| 35 | -fMpqh70q9Q | 2025-10-04 | 31 | 6.14 | Riley Horner, 2 saatlik hafıza (D) | Brezilya 2013, hakem ve linç (D, ağır) |
| 36 | gt_-C9bXsWY | 2025-10-02 | 25 | 0.87 | Kan terleyen İtalyan kadın (D) | Tanganika kahkaha salgını (K: "100 bin" yanlış) |
| 37 | 93ETkHjd-BM | 2025-09-27 | 39 | 2.39 | Carl Tanzler (K) | Moğolistan'da adres sorunu (K) |
| 38 | dlUg_fs1fhc | 2025-09-22 | 27 | 1.79 | Paul Karason, argiri (D) | İranlı kadın, 11 koca (D, haber) |
| 39 | 41oJ-x-ncwE | 2025-09-17 | 27 | 0.50 | Tsutomu Yamaguchi (K: "tek kişi" yanlış) | Fenerbahçe ŞL (G) |
| 40 | wZir_hTBb8M | 2025-09-06 | 28 | 1.24 | Fetus in fetu, Sanju Bhagat (D) | Çikolatalı süt ve toparlanma (G) |
| 41 | VKBbqYD-u4Q | 2025-08-30 | 28 | 7.26 | Şirali Müslümov, "168 yaş" (?) | Salvatore Garau'nun görünmez heykeli (D) |
| 42 | -9F4Ke5DcBE | 2025-08-25 | 30 | 0.20 | Özbekistan'da zorla kısırlaştırma iddiaları (D) | Bekaret satışı (magazin) (?) |
| 43 | pCHw1yUfOzk | 2025-08-18 | 34 | 7.28 | Henrietta Lacks / HeLa (D) | İlk petrol kuyusu Azerbaycan'da (K) |
| 44 | 3AN4IaXr6xg | 2025-08-09 | 25 | 0.24 | 30 yıl dondurulmuş embriyodan doğum (D) | Amou Haji (D) |
| 45 | PfAwcZMQ-KE | 2025-08-03 | 29 | 0.74 | Diego kaplumbağa (D) | Ben-Gurion İstanbul'da (K: mezun olmadı) |
| 46 | QeLwLGaCtFg | 2025-07-26 | 25 | 1.43 | Nöroşirürjen → OnlyFans (?) | Türkmenistan'da at kurumu (K) |
| 47 | iD6jZtAjBq4 | 2025-07-21 | 38 | 0.38 | Dede Koswara, "ağaç adam" (D) | 115 kg Türk kalkışı rekoru (?) |
| 48 | VuFQ3fA852c | 2025-07-15 | 21 | 0.57 | Zhang Ruifang'ın boynuzu (D) | "188 yaşında mağara adamı" (E, viral) |
| 49 | rPZUX3FQEjo | 2025-06-25 | 24 | 2.89 | Bhopal'de kurbağa düğünü ve boşanması (D) | İngiliz teknik direktör PL'yi kazanamadı (G) |
| 50 | LwKPeepz-KE | 2025-06-21 | 28 | 3.64 | Wattana Panich çorbası (D, iddia) | Llullaillaco kızı (D) |
| 51 | zEilQ-uTAhs | 2025-06-01 | 31 | 1.89 | Tayland köyünün kaybolması, 1970 (?) | Clauvino da Silva'nın kaçış denemesi (D) |
| 52 | rwxfdgMa1MM | 2025-05-24 | 36 | 0.05 | Wojtek ayı (K: II. Dünya Savaşı, I. değil) | İsviçre'de %0 enflasyon (G) |
| 53 | 5XjbOhvMtog | 2025-05-03 | 29 | 0.09 | Beyninin çoğu sıvı olan Fransız (D) | 20 sn'de 100 takla (?) |
| 54 | akFna0fUe3I | 2025-04-24 | 33 | 0.04 | Yeni Zelanda: kendi aracının ezdiği adam (?) | Moğolistan'da at sayısı ≈ nüfus (K) |
| 55 | rhIkmcEuRkQ | 2025-04-01 | 32 | 0.25 | Gustave timsahı (K) | "İdam edilen ilk fil" (K/E karışım) |
| 56 | BFU9DIFSLjU | 2025-03-31 | 37 | 0.08 | "Lanetli tablo" (E) | Exorcist set yangını (K) |
| 57 | upPmtMxYbns | 2025-03-22 | 37 | 0.38 | Đorđe Martinović olayı, 1985 (K: "Yugoslavya yıkıldı" abartı) | VW'nin sucuk satışı (K) |
| 58 | 8fNOZ7N_jdQ | 2025-03-15 | 30 | 2.07 | Scarface aslanı (K) | Timsah Henry (?) |
| 59 | lH1eJV6eQPg | 2024-07-02 | 32 | 0.68 | "Hangisi doğru": en güçlü kas dil mi? (mit) | Elmas gezegen 55 Cancri e (hipotez) |
| 60 | zZQkSe_WTcs | 2024-06-24 | 30 | 1.31 | "Hangisi doğru": kola aslında yeşil mi? (mit) | 453 saatlik konser (?) |
| 61 | d88Ov4oU5To | 2024-06-06 | 34 | 0.10 | Fredric Baur ve Pringles kutusu (D) | LEGO tuğlasının dayanımı (D) |
| 62 | PFCR1nVJM04 | 2024-05-13 | 28 | 0.08 | J.Lo'nun yeşil elbisesi ve Google Görseller (D) | Burun tıkalıyken mırıldanma (D) |
| 63 | QXqfIMLVtxE | 2024-04-19 | 41 | 0.07 | Beatrice Straight'in Oscar'ı / Winnie the Pooh ve Çin (D) | Kuzey Kore askerliği / tembel hayvanın nefesi (K) |
| 64 | G-a3sfF5ohg | 2024-03-21 | 59 | 1.14 | Jim Caviezel'in Tutku çekimleri (K) | Her gün McDonald's yiyen 100 yaşındaki gazi (?) |
| 65 | wrh7GmiYJlw | 2026-07-05 | 59 | 0.81 | Trenin altında kalıp yaşayan işçi (?) | Paul Templer ve su aygırı, 1996 (D) |
| 66 | cp1asv--W2E | 2026-06-30 | 54 | 0.33 | Joseph Figlock, düşen bebek, 1937–38 (K) | Dale Decker, PGAD (magazin) (?) |
| 67 | tjDA9R3Z4m8 | 2026-06-27 | 46 | 0.44 | Mariam Nabatanzi, 44 çocuk (D) | Charles Osborne, 68 yıl hıçkırık (D) |
| 68 | cP9ZDCKEmt8 | 2026-06-24 | 65 | 0.84 | Kendi cenazesinde uyanan kadın (?) | BA 5390, camdan çıkan pilot (D) |
| 69 | rzH4w-sP23k | 2026-06-20 | 58 | 1.26 | Pemfigoid gestasyonis (D, durum) | FOP, Harry Eastlack (K) |
| 70 | 2YVI1-KhLwg | 2026-06-17 | 57 | 3.12 | Anatoli Bugorski (D) | Bryan Johnson (D) |
| 71 | dJ0d-aFlY0k | 2026-06-14 | 58 | 3.18 | Anna Bågenholm, 13,7 °C (D) | Oxana Malaya (D) |
| 72 | oDBSRlyHNXo | 2026-06-10 | 69 | 3.43 | Bill Morgan'ın iki ikramiyesi (D) | İki Brady Feigl (D) |
| 73 | vUDuAPzdYq0 | 2026-06-06 | 60 | 1.63 | Karaciğer gebeliği, Peru (?) | Finlandiya: ikizler 2 saat arayla (K) |
| 74 | 2Xyjn9bHpFo | 2026-06-08 | 62 | 2.50 | Günde 12 bin hapşıran kız (?) | Benjaman Kyle / William Powell (D) |
| 75 | ZvLm7Kwjttg | 2026-05-30 | 59 | 3.91 | Uyuyamayan adam, FFI (K) | Peter Skyllberg, 2 ay karda (D) |
| 76 | CPopvFoW5ZU | 2026-05-26 | 62 | 3.47 | Roberto Rojas'ın jileti (D, tarih 1989) | Monica Seles'in bıçaklanması (K: yara ölçüsü yanlış) |
| 77 | 4fKb48mqScQ | 2026-05-24 | 66 | 3.03 | Alında büyütülen burun, Çin 2013 (D) | James Dean'in "lanetli" Porsche'u (E) |
| 78 | H1bdTEG4KM0 | 2026-05-19 | 55 | 0.10 | altyazı yok (#orman #hayat) | |
| 79 | _RdN76V4VuY | 2026-05-17 | 56 | 3.34 | Sergei Krikalev (D) | 50 yıldır yalnız kola içen adam (?) |
| 80 | 1RQUO6jXZO0 | 2026-05-13 | 44 | 1.80 | Ölen oğlunun spermiyle anne olan kadın (?) | Rom Houben (K: tartışmalı) |
| 81 | 0MfWBmFIkzw | 2026-05-08 | 54 | 4.33 | Joseph Samuel, asılamayan adam (D) | Michel Siffre'nin mağara deneyi (K) |
| 82 | sUNaryEnK04 | 2026-05-06 | 53 | 5.09 | Anahtar deliğinden çıkan kurşun (?) | Örümcek ısırığıyla yürüyen felçli (?) |
| 83 | HmfmqjYCBpw | 2026-04-30 | 55 | 2.89 | Brooke Greenberg (D) | Vücudunun %90'ı yanan çocuk (?) |
| 84 | _3pfYcNrVgU | 2026-04-28 | 55 | 0.57 | Michael Boatwright, "İsveççe uyanan adam" (D) | Mikropenis (magazin) (?) |
| 85 | QRvK23lT6pk | 2026-04-24 | 55 | 4.17 | Lydia Fairchild, kimera (D) | Adolphe Sax'ın kazaları (K) |
| 86 | aWlGbTDc_Qk | 2026-04-21 | 52 | 2.75 | Peggy Jones: şahin ve yılan, 2022 (D) | Oto-bira sendromu (D) |
| 87 | nE11qDo3pmA | 2026-03-29 | 50 | 7.26 | Michel Lotito, uçak yiyen adam (D) | Jill Price, hipertimezi (D) |
| 88 | GafS6tMmY78 | 2026-04-10 | 49 | 2.81 | Taş bebek (litopedion), Kolombiya (K) | Catt Gallinger'ın mor gözyaşı (D) |
| 89 | b-c9ikY-r_8 | 2026-04-12 | 57 | 4.11 | Myrtle Corbin (K: çocuk sayısı) | Adam Rainer (D) |
| 90 | bjON40LObJw | 2026-04-18 | 48 | 4.75 | Dashrath Manjhi (D) | Ajan Orange'ın sonuçları (D, hassas) |
| 91 | 1RrdQCkoOHY | 2026-04-19 | 53 | 7.93 | Edward Mordrake (E, 1895 kurgusu) | I. Umberto'nun "ikizi" (E) |
| 92 | YdYc-1tsVdw | 2026-03-24 | 48 | 4.27 | Kenneth Parks, uyurgezer cinayet (D, ağır) | En erken doğan bebek (K) |
| 93 | HkbHWgHTXCU | 2026-03-22 | 41 | 4.96 | Angelo Hays (?) | Paul Geidel (K: "unutulmadı", şartlı tahliyeyi reddetti) |
| 94 | f_p4wB6yBZU | 2026-03-21 | 53 | 6.97 | Nicole Delien, KLS (K) | Çamurçulluğu, 13.560 km kesintisiz uçuş (D) |
| 95 | 9uKjpOpWHgU | 2026-03-14 | 54 | 3.77 | Joan Murray ve ateş karıncaları (D) | Beck Weathers, Everest 1996 (D) |
| 96 | QREDDsSBfeE | 2026-03-12 | 46 | 3.11 | James Scott'ın set davası (K: sayılar tüm sele ait) | 08.08.08 / 09.09.09 / 10.10.10 doğumları (?) |
| 97 | rvuZj9fto9c | 2026-03-08 | 45 | 3.31 | Ann Hodges'a çarpan göktaşı (D) | Anna Haining Bates'in bebeği (K: 11 gün değil, ~11 saat) |
| 98 | dj2svz5QTqw | 2026-03-07 | 49 | 7.68 | Jewel Shuping (?) | "George": kurşunla geçen OKB, 1988 (K) |

---

## 4. Vaka kataloğu (gerçek olaylar, kaynaklarla)

Her vaka için sırasıyla: kısa nötr özet, doğrulanabilir sayılar, kaynaklar ve
"⚠ Videodaki hata" notu (yalnızca bizim doğru anlatmamız için).

### 4A. Güçlü, belgelenmiş vakalar (animasyon için ilk havuz)

**1. Karl Bushby: Goliath Expedition** (#1) [web✓]
- Eski İngiliz paraşütçü. 1 Kasım 1998'de Şili'nin Punta Arenas kentinden yürüyerek
  memleketi Hull'a doğru yola çıktı. Hiçbir motorlu taşıta binmeme kuralı var.
- Sayılar: ≈ 28 yıl, ≈ 48.000 km (30.000 mil), 29 ülke. Darién Boşluğu'nu yürüyerek geçti.
  2006'da Bering Boğazı'nı Dimitri Kieffer ile donmuş deniz üstünden geçti; Rusya'da
  gözaltına alındı. 2024'te Hazar Denizi'ni yüzerek geçti. 5 Ekim 2026'da Manş'ı yüzerek
  Dover'a çıktı. Hull'a kalan yaklaşık 400 km'lik son etap 21 Ekim 2026 itibarıyla sürüyor;
  varış henüz doğrulanmadı.
- Kaynaklar: https://en.wikipedia.org/wiki/Karl_Bushby ·
  https://thenationaldesk.com/news/americas-news-now/former-british-paratrooper-nears-end-of-28-year-31000-mile-trek-home-on-foot ·
  https://www.yorkshirepost.co.uk/news/karl-bushby-round-the-world-walker-to-swim-channel-on-way-home-to-hull-8962198
- ⚠ "İddia karşılığı ev" anlatısı doğrulanmadı. "57 gün hapis" de kaynakta bulunamadı.
  Yayından önce Hull'a varış durumu kontrol edilmeli; bu güncel bir haber.

**2. Ludger Sylbaris ve Mont Pelée, 8 Mayıs 1902** (#1) [web✓]
- Martinik'teki Saint-Pierre kentini piroklastik akıntı yok etti. Taş hücrede tutulan
  Sylbaris ağır yanıklarla kurtuldu; 4 gün sonra bulundu.
- Sayılar: ≈ 28.000 ölü (kent), geniş tahminlerde ≈ 30.000. Hücrede yalnızca kapıda dar bir
  havalandırma aralığı vardı.
- Kaynaklar: https://en.wikipedia.org/wiki/Ludger_Sylbaris ·
  https://en.wikipedia.org/wiki/1902_eruption_of_Mount_Pel%C3%A9e
- ⚠ "Tek sağ kalan" doğru değil; kent kenarında Léon Compère-Léandre de kurtuldu. Sızan şey lav
  değil, sıcak kül ve gazdı.

**3. Hedviga Golik** (#2)
- Zagrep'te yaşayan bir hemşire 1966'da evinde öldü; cesedi 2008'de, ~42 yıl sonra bulundu.
- Kaynak: https://en.wikipedia.org/wiki/Hedviga_Golik

**4. Inés Ramírez Pérez: kendine sezaryen, 5 Mart 2000, Oaxaca** (#3) [web✓]
- Tıbbi eğitimi yoktu. 12 saatlik sancıdan sonra mutfak bıçağıyla kendi sezaryenini yaptı;
  anne de bebek de yaşadı.
- Vaka bir makaleyle bildirildi (International Journal of Gynecology & Obstetrics, 2003/2004).
- Kaynaklar: https://en.wikipedia.org/wiki/Self-inflicted_caesarean_section ·
  https://www.deseret.com/2004/6/1/19832077/mom-survives-self-caesarean
- Not: Çizime uygun değil, hassas.

**5. Violet Jessop** (#4)
- Olympic'in HMS Hawke ile çarpışmasından (1911), Titanic'ten (1912) ve Britannic'ten (1916)
  sağ çıktı.
- Kaynak: https://en.wikipedia.org/wiki/Violet_Jessop
- ⚠ Britannic Alman denizaltısının (U-73) döşediği bir mayına çarptı; torpido yok.

**6. Ali Khan Samsudin, "Yılan Kral"** (#4) [web✓]
- 400 kobrayla 40 gün kaldı (Malezya rekoru). 6.000 akreple 21 gün kaldı (Guinness).
  Aralık 2006'da kral kobra ısırığından, 48 yaşında öldü.
- Kaynaklar: https://en.wikipedia.org/wiki/Ali_Khan_Samsudin ·
  https://www.nbcnews.com/id/wbna15996648

**7. Jeff Bush, Seffner (Florida), 28 Şubat 2013** (#5)
- Yatak odasının altında açılan obruk onu yuttu; cesedi hiç çıkarılamadı.
- Kaynak: Tampa Bay Times ve AP haberleri (Mart 2013). Wikipedia'da "Seffner, Florida"
  maddesinde de geçiyor; URL yayından önce kontrol edilmeli.

**8. Marie Wilcox** (#6)
- Wukchumni dilinin son akıcı konuşurlarındandı. Yaşlılığında bilgisayar öğrenip bir sözlük
  hazırladı. 1933'te doğdu, 2021'de öldü.
- Kaynak: https://en.wikipedia.org/wiki/Marie_Wilcox · The New York Times'ın 2021 vefat haberi

**9. Jason Padgett** (#7)
- 2002'de bir bar çıkışında kafasına darbe aldı. Ardından fraktal geometri görmeye başladı;
  edinilmiş savant sendromu.
- Kaynak: https://en.wikipedia.org/wiki/Jason_Padgett

**10. David Reimer** (#8)
- 1966'da başarısız bir sünnetten sonra psikolog John Money'nin önerisiyle kız olarak
  büyütüldü. Daha sonra erkek kimliğine döndü. İkizi Brian 2002'de, David 2004'te öldü.
- Kaynak: https://en.wikipedia.org/wiki/David_Reimer
- ⚠ Money cerrah değil, psikologdu. Hassas konu; uygun değil.

**11. Adelir Antônio de Carli** (#9)
- Brezilyalı rahip. 20 Nisan 2008'de, ≈ 1.000 helyum balonuna bağlı olarak Paranaguá'dan
  havalandı ve kayboldu. Cesedi Temmuz 2008'de bulundu. Amacı kamyon şoförleri için bir
  dinlenme yeri adına bağış toplamaktı.
- Kaynak: https://en.wikipedia.org/wiki/Adelir_Ant%C3%B4nio_de_Carli
- ⚠ Videoda balon sayısı "100".

**12. Bernio Verhagen** (#9) [web✓]
- Hollandalı amatör futbolcu. 2019'da sahte belge ve videolarla Moldova (Dinamo-Auto),
  Güney Afrika, Şili ve Danimarka (Viborg) kulüplerine imza attı ya da yaklaştı. Viborg
  dönemindeki gözaltı başka suçlamalarla ilgiliydi. 2021'de Kolombiya'da tutuklandı.
- Kaynak: https://en.wikipedia.org/wiki/Bernio_Verhagen

**13. Michael Packard** (#10)
- 11 Haziran 2021'de Provincetown açığında bir kambur balina onu ağzına aldı ve ~30–40 sn
  sonra geri çıkardı.
- Kaynak: Cape Cod Times ve AP haberleri (Haziran 2021).

**14. Kazuyoshi Miura** (#11)
- 1986'da Santos'ta profesyonel oldu. Japonya milli takımında 89 maçta 55 gol attı. 2026'da hâlâ
  lisanslı; en yaşlı profesyonel futbolcu rekorları onda.
- Kaynak: https://en.wikipedia.org/wiki/Kazuyoshi_Miura

**15. Mauro Prosperi, Marathon des Sables 1994** (#12) [web✓]
- Kum fırtınasında yolunu kaybetti; ~9–10 gün sonra Cezayir'de bulundu.
- Sayılar: rotadan ≈ 291 km (181 mil) uzakta bulundu. Kilo kaybı 15–18 kg; kaynaklar
  farklı veriyor.
- Kaynaklar: https://explorersweb.com/2020/05/06/more-great-survival-stories ·
  l'Unità arşivi, 26.04.1994: https://archivio.unita.news/assets/main/1994/04/26/page_009.pdf

**16. Harrison Okene, Jascon-4, 26 Mayıs 2013** (#13) [web✓]
- Nijerya açığında devrilen römorkörde ~30 m derinlikte, ~1,2 m yüksekliğindeki bir hava
  cebinde ~60 saat yaşadı. 12 kişilik mürettebattan 11'i öldü.
- Kaynaklar: https://maritime-executive.com/article/Nigerian-Cook-Survives-2-Days-Under-Sea-in-Shipwreck-Air-Bubble-2013-06-12 ·
  https://abcnews.com/blogs/headlines/2013/12/cook-survives-3-days-in-air-pocket-of-sunken-ship-off-nigerian-coast

**17. Hiroo Onoda** (#13)
- Japon istihbarat subayı. Aralık 1944'ten 9 Mart 1974'e kadar Filipinler'in Lubang adasında
  savaşın bittiğine inanmadan direndi. Yaklaşık 29 yıl, savaşın bitişinden itibaren ~28,5 yıl.
- Kaynak: https://en.wikipedia.org/wiki/Hiroo_Onoda
- ⚠ Videoda "I. Dünya Savaşı" ve "27 yıl" geçiyor; ikisi de yanlış.

**18. Marcos Rodríguez Pantoja** (#14)
- İspanya'da çocukken dağa bırakıldı. ~1954–1965 arasında, yaklaşık 7 ile 19 yaşları arasında
  kurtlarla yaşadı.
- Kaynak: https://en.wikipedia.org/wiki/Marcos_Rodr%C3%ADguez_Pantoja
- ⚠ "Doğumda ormana bırakıldı" ve "31 yıl" yanlış.

**19. Brandenn Bremmer** (#15)
- Liseyi 10 yaşında bitirdi; ölçülen IQ'su 178. 2005'te 14 yaşında öldü.
- Kaynak: https://en.wikipedia.org/wiki/Brandenn_Bremmer

**20. Shridhar Chillal** (#15)
- Sol elinin tırnaklarını 1952'den itibaren 66 yıl kesmedi. Toplam uzunluk 909,6 cm, başparmak
  197,8 cm (Guinness 2016).
- Kaynak: https://en.wikipedia.org/wiki/Shridhar_Chillal
- ⚠ "Kesmekten korkuyordu" yanlış; amacı rekordu.

**21. Randy Gardner, 1963–64** (#17)
- 264,4 saat, yani ~11 gün uyumadı. Bir okul bilim fuarı deneyiydi; yazı turada kaybetti.
- Kaynak: https://en.wikipedia.org/wiki/Randy_Gardner_(record_holder)

**22. Carlos Kaiser** (#18)
- Brezilyalı "futbolcu". 1980'lerden 90'lara kadar neredeyse hiç maça çıkmadan kulüp kulüp
  dolaştı; sahte sakatlıklar ve sahte teklifler kullandı. 2018'de "Kaiser!" belgeseli yapıldı.
- Kaynak: https://en.wikipedia.org/wiki/Carlos_Kaiser_(footballer)

**23. Jaxon Buell** (#20)
- Mikrohidranensefali ile doğdu; ~5 yaşına kadar yaşadı (2014–2019).
- Kaynak: CNN ve People haberleri (2015, 2019).

**24. Roy Sullivan** (#20)
- ABD park korucusu. 1942–1977 arasında 7 kez yıldırım çarptı (Guinness).
- Kaynak: https://en.wikipedia.org/wiki/Roy_Sullivan
- Not: NOAA/NWS bir ABD vatandaşının ömür boyu yıldırım çarpılma olasılığını yaklaşık 1/15.300
  verir; yayından önce doğrulanmalı.

**25. Vesna Vulović, JAT 367, 26 Ocak 1972** (#21) [web✓]
- Guinness'e göre 10.160 m'den paraşütsüz düşüp yaşadı; uçak Çekoslovakya üzerinde parçalandı.
- 2009'da bazı gazeteciler uçağın çok daha alçakta vurulduğunu iddia etti. Kanıtlar dolaylı;
  rekor geri çekilmedi.
- Kaynaklar: https://en.wikipedia.org/wiki/Vesna_Vulovi%C4%87 ·
  https://www.guinnessworldrecords.jp/world-records/highest-fall-survived-without-parachute
- ⚠ Videoda "Çekyalı"; doğrusu Yugoslav / Sırp.

**26. Ernest Hemingway, Ocak 1954** (#21)
- Uganda'da art arda iki gün iki uçak kazası geçirdi; ikisinden de yaralı kurtuldu.
- Kaynak: https://en.wikipedia.org/wiki/Ernest_Hemingway (1954 bölümü)
- ⚠ Kazalar aynı gün değil, art arda iki günde oldu.

**27. José Salvador Alvarenga** (#22) [web✓]
- 17 Kasım 2012'de Meksika kıyısından açıldı. 30 Ocak 2014'te Marshall Adaları'ndaki Ebon
  Atolü'ne ulaştı: 438 gün ve ≈ 10.800 km (6.700 mil). Arkadaşı Ezequiel Córdoba yolda öldü.
- Kaynak: https://en.wikipedia.org/wiki/Jos%C3%A9_Salvador_Alvarenga
- Not: Córdoba ailesinin açtığı dava tartışmalı. Bu iddiaya hiç girilmemeli.

**28. Farklı babalı ikizler (heteropaternal süperfekundasyon)** (#24)
- Brezilya'nın Goiás eyaletindeki Mineiros'ta 19 yaşında bir anne; 2022'de haber oldu.
- Kaynaklar: https://en.wikipedia.org/wiki/Heteropaternal_superfecundation · Eylül 2022 haberleri

**29. Clive Wearing** (#25)
- 1985'teki herpes ensefalitinden sonra ~7–30 saniyelik bellekle yaşıyor. Müzik becerisi
  korundu.
- Kaynak: https://en.wikipedia.org/wiki/Clive_Wearing

**30. Germanwings 9525, 24 Mart 2015** (#25)
- Yardımcı pilot uçağı kasıtlı olarak Alpler'e düşürdü; 150 kişi öldü.
- Kaynak: https://en.wikipedia.org/wiki/Germanwings_Flight_9525
- Not: Hassas, uygun değil.

**31. Phineas Gage, 13 Eylül 1848** (#27)
- Demir çubuk kafatasını deldi; kişilik değişikliği bildirildi.
- Kaynak: https://en.wikipedia.org/wiki/Phineas_Gage
- ⚠ "Sürekli küfür" anlatısı sonradan abartıldı.

**32. 36 kırmızı kart, 2011** (#28)
- Arjantin'in alt liginde Claypole ile Victoriano Arenas maçında hakem Damián Rubino 36 kırmızı
  kart gösterdi (Guinness).
- Kaynak: Guinness World Records, "most red cards in a football match".

**33. Şili'de 33 madenci, San José madeni, Copiapó, 2010** (#29)
- 5 Ağustos'ta göçük oldu. ~700 m derinlikte mahsur kaldılar. İlk temas 22 Ağustos'ta,
  17. günde kuruldu. 13 Ekim'de 69. günde Fénix kapsülüyle hepsi çıkarıldı.
- Kaynak: https://en.wikipedia.org/wiki/2010_Copiap%C3%B3_mining_accident

**34. LaMia 2933 / Chapecoense, 28 Kasım 2016** (#29)
- Uçakta 77 kişi vardı; 71'i öldü, 6'sı kurtuldu. Kurtulan Alan Ruschel futbola döndü.
- Kaynaklar: https://en.wikipedia.org/wiki/LaMia_Flight_2933 ·
  https://en.wikipedia.org/wiki/Alan_Ruschel
- ⚠ Videoda "81'den 76'sı".

**35. Çin'de beş katlı tetikçi zinciri** (#30)
- 2013'te Guangxi'de iş insanı Tan Youhui bir tetikçi tuttu. İş dört kez alt yükleniciye
  devredildi; son kişi hedefle anlaşıp sahte ölüm fotoğrafı çekti. Dava 2017'de sonuçlandı.
- Kaynak: BBC News, Mayıs 2017: "Chinese hitmen subcontracted murder job".

**36. Victor Noir'ın mezar heykeli** (#32)
- Paris'teki Père-Lachaise mezarlığında bir doğurganlık batıl inancı.
- Kaynak: https://en.wikipedia.org/wiki/Victor_Noir

**37. Ölümcül ailesel uykusuzluk (FFI)** (#33, ayrıca #75)
- Venedikli bir ailede kuşaklar boyu görüldü. Prion kaynaklı bir hastalık.
- Kaynaklar: https://en.wikipedia.org/wiki/Fatal_familial_insomnia · D.T. Max, *The Family That
  Couldn't Sleep* (2006)

**38. Riley Horner, Illinois, 2019** (#35)
- Bir dans etkinliğinde kafasına tekme aldı. Belleği yaklaşık 2 saatte bir sıfırlanıyor ve her
  seferinde günü 11 Haziran sanıyor.
- Kaynak: NBC ve WLS haberleri (Kasım 2019).

**39. Hematidroz** (#36)
- 21 yaşında İtalyan bir kadın kan terliyor. Vaka CMAJ dergisinde, Ekim 2015'te yayımlandı.
- Kaynak: https://en.wikipedia.org/wiki/Hematidrosis

**40. Tanganika kahkaha salgını, 1962** (#36)
- Kashasha'daki bir kız okulunda başladı. ~1.000 kişiyi etkiledi; 14 okul kapandı.
- Kaynak: https://en.wikipedia.org/wiki/1962_Tanganyika_laughter_epidemic
- ⚠ "100.000 kişi" yanlış.

**41. Carl Tanzler** (#37)
- Alman doğumlu radyoloji teknisyeni, Key West'te çalışıyordu. 1931'de ölen Elena Milagro de
  Hoyos'un cesedini 1933'te mezardan çıkardı ve 1940'a kadar, ~7 yıl yanında tuttu.
- Kaynak: https://en.wikipedia.org/wiki/Carl_Tanzler
- Not: Uygun değil.

**42. Paul Karason** (#38)
- Gümüş takviyesi kullanımı nedeniyle argiri gelişti; teni mavi-griye döndü. 2013'te öldü.
- Kaynak: https://en.wikipedia.org/wiki/Paul_Karason

**43. Tsutomu Yamaguchi** (#39)
- 6 Ağustos 1945'te Hiroşima'da, sıfır noktasına ~3 km uzaklıktaydı. 9 Ağustos'ta
  Nagazaki'deydi, yine ~3 km uzakta. İki patlamadan kurtuldu. Japonya onu 2009'da çift
  hibakuşa olarak resmen tanıdı; 2010'da 93 yaşında öldü.
- Kaynak: https://en.wikipedia.org/wiki/Tsutomu_Yamaguchi
- ⚠ "Tek kişi" yanlış. Yaklaşık 165 çift maruz kalan olduğu biliniyor; resmen tanınan tek kişi o.

**44. Fetus in fetu, Sanju Bhagat** (#40)
- Nagpur, 1999. 36 yaşında karnından ikizinin kalıntısı çıkarıldı.
- Kaynak: https://en.wikipedia.org/wiki/Fetus_in_fetu

**45. Salvatore Garau, "Io Sono"** (#41)
- 2021'de "görünmez heykel" ~15.000 €'ya, yani ~18.300 $'a satıldı.
- Kaynak: Mayıs–Haziran 2021 haberleri (Euronews, The Guardian).

**46. Özbekistan'da zorla kısırlaştırma iddiaları** (#42)
- 2000'lerde ve 2012'de BBC araştırmaları kadınların rızası olmadan kısırlaştırıldığını ortaya
  koydu.
- Kaynak: BBC, "Uzbekistan's policy of secretly sterilising women" (2012).
- Not: Hassas.

**47. Henrietta Lacks / HeLa** (#43)
- 1951'de öldü. Rızası alınmadan alınan tümör hücreleri ilk "ölümsüz" insan hücre hattı oldu.
- Kaynak: https://en.wikipedia.org/wiki/Henrietta_Lacks

**48. Thaddeus Daniel Pierce** (#44)
- Temmuz 2025'te, 1994'te dondurulmuş bir embriyodan doğdu: 30 yıl ve kayıt rekoru.
- Kaynak: MIT Technology Review, Temmuz 2025.

**49. Amou Haji** (#44)
- "Dünyanın en kirli adamı" olarak anılan İranlı. Onlarca yıl yıkanmadı; köylülerin
  yıkamasından birkaç ay sonra, Ekim 2022'de ~94 yaşında öldü.
- Kaynak: https://en.wikipedia.org/wiki/Amou_Haji
- ⚠ "İlk banyodan sonra öldü" diye bir nedensellik kanıtlanmadı.

**50. Diego kaplumbağa** (#45)
- Española kaplumbağası. Türün kurtarılmasında rol oynadı; 2020'de adasına döndü. Bugünkü ~2.000
  bireylik nüfusun ~%40'ı onun soyundan.
- Kaynak: https://en.wikipedia.org/wiki/Diego_(tortoise)

**51. Dede Koswara** (#47)
- Endonezya'da HPV ile ilişkili epidermodisplazi verrusiformis nedeniyle "ağaç adam" diye
  anıldı. 2016'da öldü.
- Kaynak: https://en.wikipedia.org/wiki/Dede_Koswara

**52. Zhang Ruifang** (#48)
- 101 yaşında, 2010'da Çin'de alnında ~6 cm'lik keratin "boynuz" çıktı.
- Kaynak: BBC / Telegraph, 2010.
- ⚠ Oyuncu değil, köylüydü.

**53. Bhopal'de kurbağa düğünü** (#49)
- Yağmur için kurbağalar evlendirildi; Eylül 2019'daki sel sonrası "boşandırıldı".
- Kaynak: BBC / NDTV, Eylül 2019.

**54. Wattana Panich, Bangkok** (#50) [web✓]
- Sığır çorbası tenceresi ~1974'ten beri boşaltılmadan besleniyor ("perpetual stew"). Süreklilik
  sahibinin beyanına dayanıyor.
- Kaynaklar: https://npr.org/sections/thesalt/2019/11/03/772030934/soups-on-and-on-thai-beef-noodle-brew-has-been-simmering-for-45-years ·
  https://www.openculture.com/2026/07/the-thai-beef-noodle-soup-that-has-been-continuously-simmering-for-52-years.html

**55. Llullaillaco mumyaları** (#50)
- ~500 yıllık İnka kurbanları, aralarında ~13–15 yaşında bir kız. 1999'da 6.739 m'de bulundular.
- Kaynak: https://en.wikipedia.org/wiki/Mummies_of_Llullaillaco

**56. Clauvino da Silva** (#51)
- Rio, Ağustos 2019. 73 yıl hüküm giymişti. Kızı kılığında kaçmaya çalıştı, yakalandı; günler
  sonra hücresinde ölü bulundu.
- Kaynak: BBC News, Ağustos 2019.

**57. Wojtek ayı** (#52)
- Polonya 2. Kolordusu'nun "onbaşısı". 1944'te Monte Cassino'da mühimmat taşıdı. 1963'te
  Edinburgh Hayvanat Bahçesi'nde öldü.
- Kaynak: https://en.wikipedia.org/wiki/Wojtek_(bear)
- ⚠ Olay II. Dünya Savaşı'nda geçti, I. değil.

**58. Beyninin çoğu sıvı olan Fransız memur** (#53)
- 44 yaşında, IQ'su ~75. Hidrosefali nedeniyle beyin dokusu ince bir tabakaya inmişti. Vaka
  The Lancet'te, Temmuz 2007'de (Feuillet ve ark.) yayımlandı.
- Kaynak: The Lancet 370:262 (2007).

**59. Đorđe Martinović olayı, 1 Mayıs 1985** (#57)
- Kosova'da gerçek bir olay; Sırp–Arnavut gerginliğinde propaganda malzemesi oldu.
- Kaynak: https://en.wikipedia.org/wiki/%C4%90or%C4%91e_Martinovi%C4%87_incident
- ⚠ "Yugoslavya bu yüzden yıkıldı" diye anlatılamaz. Hassas, uygun değil.

**60. Fredric Baur** (#61)
- Pringles kutusunun tasarımcısı. 2008'deki ölümünden sonra küllerinin bir kısmı bir Pringles
  kutusuna kondu.
- Kaynak: https://en.wikipedia.org/wiki/Fredric_J._Baur

**61. LEGO'nun basınç dayanımı** (#61)
- 2×2'lik bir tuğla ~4.240 N'ye dayanıyor. Hesaba göre ~375.000 tuğlalık bir kule mümkün.
- Kaynak: BBC News, 2012 (Open University ölçümü).

**62. J.Lo'nun yeşil Versace elbisesi** (#62)
- Elbise 2000 Grammy töreninde giyildi. Eric Schmidt'e göre Google Görseller'in
  geliştirilmesinin tetikleyicilerinden biri.
- Kaynak: https://en.wikipedia.org/wiki/Green_Versace_dress_of_Jennifer_Lopez

**63. Beatrice Straight, *Network* (1976)** (#63)
- Yaklaşık 5 dakikalık ekran süresiyle En İyi Yardımcı Kadın Oyuncu Oscar'ını kazandı.
- Kaynak: https://en.wikipedia.org/wiki/Beatrice_Straight

**64. Paul Templer, Zambezi, 1996** (#65)
- Bir su aygırı onu defalarca ağzına aldı. Kolunu kaybetti ama yaşadı.
- Kaynak: BBC ve The Guardian söyleşileri.

**65. Mariam Nabatanzi, Uganda** (#67)
- 12 yaşında evlendirildi. 15 doğumda 44 çocuk dünyaya getirdi; yumurtalıkları alışılmadık
  derecede büyüktü.
- Kaynak: https://en.wikipedia.org/wiki/Mariam_Nabatanzi

**66. Charles Osborne** (#67) [web✓]
- 1922'den 1990'a kadar, 68 yıl boyunca hıçkırdı. Dakikada 20–40 kez, toplamda ≈ 430 milyon
  hıçkırık. 1991'de öldü (Guinness).
- Kaynaklar: https://www.smithsonianmag.com/history/the-curious-case-of-charles-osborne-who-hiccuped-for-68-years-straight-180980232/ ·
  https://www.guinnessworldrecords.com/news/2023/7/extreme-measures-person-with-68-year-attack-of-hiccups-took-to-try-and-stop-them-754877
- ⚠ Videoda "500 milyon".

**67. British Airways 5390, 10 Haziran 1990** (#68)
- Yanlış vidalarla takılmış ön cam ~5.300 m'de koptu. Kaptan Tim Lancaster ~20 dakika
  boyunca yarı beline kadar dışarıda kaldı; mürettebat onu tuttu. Uçak Southampton'a indi.
- Kaynak: https://en.wikipedia.org/wiki/British_Airways_Flight_5390

**68. FOP ve Harry Eastlack** (#69)
- Bağ dokusu kemiğe dönüşüyor. 1973'te 39 yaşında öldü; iskeleti Philadelphia'daki Mütter
  Müzesi'nde.
- Kaynak: https://en.wikipedia.org/wiki/Harry_Eastlack

**69. Anatoli Bugorski, 13 Temmuz 1978** (#70)
- U-70 sinkrotronunda proton ışını başından geçti; tahmini doz 200.000–300.000 rad. Yüzünün sol
  tarafı felç oldu; yaşamaya devam etti.
- Kaynak: https://en.wikipedia.org/wiki/Anatoli_Bugorski

**70. Bryan Johnson** (#70)
- "Blueprint" programı için yılda ~2 milyon $ harcıyor. 2023'te oğlundan plazma aldı, sonra
  bıraktı.
- Kaynak: https://en.wikipedia.org/wiki/Bryan_Johnson

**71. Anna Bågenholm, 20 Mayıs 1999, Narvik** (#71)
- Buz altında ~80 dakika kaldı. Vücut ısısı 13,7 °C'ye düştü; kaza sonucu hipotermiden
  kurtulma rekoru.
- Kaynak: https://en.wikipedia.org/wiki/Anna_B%C3%A5genholm

**72. Oxana Malaya** (#71)
- Ukrayna'da 1991'de, 8 yaşında köpeklerle yaşarken bulundu.
- Kaynak: https://en.wikipedia.org/wiki/Oxana_Malaya

**73. Bill Morgan, Avustralya, 1999** (#72)
- Kalbi ~14 dakika durdu ve günlerce komada kaldı. İyileştikten sonra çekilişte ödül kazandı.
  Canlı yayında olayı canlandırırken kazı-kazandan da büyük ödül çıktı.
- Kaynak: Herald Sun / ABC haberleri, 1999.

**74. Benjaman Kyle** (#74)
- 31 Ağustos 2004'te Georgia'da bir Burger King'in arkasında hafızasız bulundu. 2015'te kimliği
  William Burgess Powell olarak belirlendi.
- Kaynak: https://en.wikipedia.org/wiki/Benjaman_Kyle

**75. Peter Skyllberg** (#75)
- Şubat 2012'de Umeå yakınında, karda kalan arabasında ~2 ay sonra canlı bulundu.
- Kaynak: BBC News, Şubat 2012.

**76. Roberto Rojas, 3 Eylül 1989, Maracanã** (#76)
- Şili kalecisi, işaret fişeği atıldığında yaralanmış gibi yapıp kendini jiletle kesti. Ömür
  boyu men cezası aldı; ceza 2001'de kaldırıldı.
- Kaynak: https://en.wikipedia.org/wiki/Roberto_Rojas
- ⚠ Videoda "1990".

**77. Monica Seles, 30 Nisan 1993, Hamburg** (#76)
- Steffi Graf hayranı Günter Parche sırtından bıçakladı.
- Kaynak: https://en.wikipedia.org/wiki/Monica_Seles
- ⚠ Yara ~1,5 cm derinliğindeydi; "23 cm kesik" yanlış.

**78. Alında büyütülen burun, Fuzhou, 2013** (#77)
- Kaynak: BBC / The Guardian, Eylül 2013.

**79. Sergei Krikalev** (#79) [web✓]
- 18 Mayıs 1991'de SSCB adına uçtu ve 25 Mart 1992'de Rusya'ya döndü: 311 gün, planlanan
  sürenin yaklaşık iki katı. SSCB 26 Aralık 1991'de, o yörüngedeyken dağıldı.
- Kaynak: https://en.wikipedia.org/wiki/Sergei_Krikalev
- Not: Videodaki "5 ay planlanmıştı" ve "Almanya 24 Mn $ ödedi" ayrıntıları yayından önce
  kontrol edilmeli.

**80. Joseph Samuel, 26 Eylül 1803, Sidney** (#81) [web✓]
- Üç idam denemesi de başarısız oldu: ip iki kez koptu, bir kez çözüldü. Vali cezasını affetti.
  Sonradan bir tekneyle kaçtı ve kayboldu.
- Kaynak: https://en.wikipedia.org/wiki/Joseph_Samuel

**81. Michel Siffre** (#81) [web✓]
- 1962'de bir Alp mağarasında ~2 ay kaldı. 1972'de Teksas'taki Midnight Cave'de 205 gün kaldı.
  Zaman ipucu olmayınca uyku-uyanıklık döngüsünün ~48 saate kayabildiği gözlemlendi.
- Kaynak: https://en.wikipedia.org/wiki/Michel_Siffre
- ⚠ Videoda "180 gün, 440 m".

**82. Brooke Greenberg** (#83)
- 1993–2013. Fiziksel gelişimi bebeklikte kaldı.
- Kaynak: https://en.wikipedia.org/wiki/Brooke_Greenberg

**83. Michael Boatwright** (#84)
- 2013'te Palm Springs'te uyandığında kendini İsveççe konuşan "Johan Ek" sanıyordu.
- Kaynak: The Desert Sun / CNN, 2013.

**84. Lydia Fairchild** (#85)
- 2002'de anneliği DNA testiyle reddedildi. Kimera olduğu, yani ikizinin hücrelerini taşıdığı
  anlaşıldı.
- Kaynak: https://en.wikipedia.org/wiki/Chimera_(genetics)

**85. Peggy Jones, Silsbee (Teksas), Temmuz 2022** (#86)
- Bir şahin, pençesinden düşürdüğü yılanı onun üzerine bıraktı, sonra da saldırdı.
- Kaynak: KFDM / The Washington Post, Ağustos 2022.

**86. Oto-bira sendromu** (#86)
- Bağırsak mayası vücut içinde alkol üretiyor. Durum belgelenmiş; videodaki kişinin adı ASR'de
  bozuk.
- Kaynak: https://en.wikipedia.org/wiki/Auto-brewery_syndrome

**87. Michel Lotito, "Monsieur Mangetout"** (#87)
- 1978–1980 arasında bir Cessna 150'yi parça parça yedi. Hayatı boyunca ~9 ton metal yuttu.
- Kaynak: https://en.wikipedia.org/wiki/Michel_Lotito

**88. Jill Price** (#87)
- Hipertimezi; 2006'da bilimsel literatüre "AJ" olarak girdi.
- Kaynak: https://en.wikipedia.org/wiki/Hyperthymesia

**89. Catt Gallinger, Ottawa, 2017** (#88)
- Sklera dövmesi komplikasyonu nedeniyle mor gözyaşı döktü.
- Kaynak: CBC News, Eylül 2017.

**90. Adam Rainer** (#89)
- 1899–1950. 21 yaşında ~1,18 m iken hipofiz tümörü nedeniyle büyümeye devam etti; ölümünde
  boyu ~2,18 m'ydi. Hem cüce hem dev olarak sınıflanan tek kişi.
- Kaynak: https://en.wikipedia.org/wiki/Adam_Rainer

**91. Dashrath Manjhi** (#90) [web✓]
- 1960'tan 1982'ye, 22 yıl boyunca çekiç ve keskiyle Gehlaur tepesinden yol açtı.
- Yolun ölçüleri ~110 m uzunluk, ~9,1 m genişlik, ~7,7 m derinlik. Atri ile Wazirganj arası
  ~55 km'den ~15 km'ye indi.
- Kaynak: https://en.wikipedia.org/wiki/Dashrath_Manjhi
- Not: Eşinin ölüm nedeni kaynaklarda tartışmalı.

**92. Ajan Orange** (#90)
- ABD 1961–1971 arasında Vietnam'da bu herbisiti kullandı; ağır doğumsal etkiler bildirildi.
- Kaynak: https://en.wikipedia.org/wiki/Agent_Orange
- Not: Hassas, uygun değil.

**93. Kenneth Parks, 24 Mayıs 1987** (#92)
- Uyurgezer hâlde ~23 km araç kullanıp kayınvalidesini öldürdü; beraat etti (R. v. Parks,
  1992).
- Kaynak: https://en.wikipedia.org/wiki/R_v_Parks
- Not: Ağır, uygun değil.

**94. Paul Geidel** (#93) [web✓]
- 1911'de 17 yaşında girdi, 7 Mayıs 1980'de 86 yaşında çıktı: 68 yıl 245 gün.
- Kaynak: https://en.wikipedia.org/wiki/Paul_Geidel
- ⚠ "Çıkarmayı unuttular" yanlış. Cezasının bir kısmını akıl hastanesinde geçirdi ve 1974'teki
  şartlı tahliyeyi kendisi reddetti.

**95. Kıvrık gagalı çamurçulluğu (bar-tailed godwit), Ekim 2022** (#94) [web✓]
- 5 aylık genç bir kuş Alaska'dan Tazmanya'ya kesintisiz uçtu: en az 13.560 km, ~11 gün
  (13 → 24/25 Ekim). Guinness'teki önceki kayıt 12.200 km.
- Kaynaklar: https://www.npr.org/2022/10/28/1132171095/a-non-stop-flight-from-alaska-to-tasmania-may-be-for-the-birds-and-a-possible-re ·
  https://www.cbc.ca/news/science/godwit-migration-alaska-tasmania-record-1.6632658

**96. Joan Murray, 25 Eylül 1999** (#95)
- Paraşütleri açılmadı ve ~4.400 m'den bir ateş karıncası yuvasına düştü; yaşadı.
- Kaynak: Haberler ve Discovery belgeseli; URL yayından önce kontrol edilmeli.

**97. Beck Weathers, 1996 Everest felaketi** (#95)
- Ölü sanılıp bırakıldı, kendi başına kampa döndü.
- Kaynak: https://en.wikipedia.org/wiki/1996_Mount_Everest_disaster
- ⚠ "Dokuz dağcı öldü" o fırtınanın toplamıyla karıştırılmış; yalnızca 10–11 Mayıs'ta 8 kişi öldü.

**98. James Scott, West Quincy seti, 16 Temmuz 1993** (#96) [web✓]
- Seti bilerek bozmaktan ömür boyu hapis aldı; kendisi suçsuz olduğunu söylüyor.
- Taşkın 14.000 akre alanı kapladı. Savcılığın iddiasına göre karısını nehrin karşı yakasında
  bırakmak istiyordu.
- Kaynak: https://en.wikipedia.org/wiki/James_Scott_(criminal)
- ⚠ "57 ölü, 54 bin tahliye, 15–20 milyar $" rakamları bu set yıkımına değil, 1993 Büyük Seli'nin
  tamamına ait. Dava hâlâ tartışmalı.

**99. Ann Hodges, 30 Kasım 1954, Sylacauga** (#97)
- Uyurken tavanı delen ~3,9 kg'lık bir göktaşı kalçasına çarptı; belgelenmiş ilk vaka.
- Kaynak: https://en.wikipedia.org/wiki/Sylacauga_(meteorite)

**100. Anna Haining Bates** (#97)
- 1879'da doğan bebeği ~10 kg ve ~71 cm'ydi; ~11 saat yaşadı.
- Kaynak: https://en.wikipedia.org/wiki/Anna_Haining_Bates

Tek satırla teyitli diğerleri:
- Kanzi bonobo: 1980–2025.
- Jean Hilliard: Minnesota, 1980.
- Henrietta Lacks (#43): yukarıda.
- Tsimihety adı, "saçını kesmeyenler" anlamına gelir (Wikipedia: Tsimihety people).
- Gustave timsahı: Burundi; ~6 m.
- Scarface aslanı: Masai Mara, 2021'de öldü.
- Michael Rockefeller: 1961'de Asmat bölgesinde kayboldu. Yamyamlık hipotezi tartışmalı
  (Carl Hoffman, *Savage Harvest*, 2014).
- Brady Feigl'ler: akraba olmayan iki beyzbolcu.
- Joseph Figlock: Detroit, 1937–38; TIME'da haberi çıktı.
- Myrtle Corbin: 1868–1928. Çocuk sayısını kaynaklar 4–5 veriyor; videoda 8.

### 4B. Doğrulanamayan / magazin kaynaklı (kullanmayın ya da birincil kaynak bulmadan kullanmayın)

- **Brezilya'da kocasının kardeşi olduğunu öğrenen kadın (#5):** Yalnızca tabloid haberler var.
- **Kafasında 94 yıl kurşunla yaşayan adam (#2):** Guinness'te William Pace (Teksas) adıyla bir
  kayıt olabilir. Doğrulanmalı.
- **Kaliforniya dağında 3 hafta (#3):** Kimlik bulunamadı.
- **"Sahte hamilelik, Bonnie Lake" (#10):** Bulunamadı.
- **Timsahın burnu, 10 yaşında kız (#12):** Bulunamadı. Benzer vakalar: Rebecca Munkombwe,
  Zimbabve 2019, ama o 11 yaşındaydı ve timsahın gözlerini oydu.
- **Bermuda'da Ebbin kardeşler (#8):** 1974–75'te aynı taksi şoförü ve aynı yolcu ile ölen iki
  kardeş anlatısı çok yaygın, ama birincil kaynak bulunamadı. Royal Gazette arşivinde
  aranmalı.
- **Finlandiya'daki ikizler (#73):** Raahe yakınlarında, 70 yaşındaki ikizler aynı yolda 2 saat
  arayla öldü. Haber alıntıları var, ama orijinal haber ve yıl doğrulanmadı. "Aynı kamyon"
  ayrıntısı yanlış: ikinci kazada da bir kamyon vardı ama farklı bir kamyondu.
- **Diğerleri:** Cotard sendromlu asker (#14); bez bebek evliliği ve Ruanda'da kadınlardan kaçan
  adam (#16); 24 saat koşu ödülü (#18); 12 sayısı takıntısı (#19); paraşüt kazasından Everest'e
  (#22); Vassilyev ailesinin 69 çocuğu (#23, 18. yüzyıl kaydı, şüpheli); akciğerde köknar (#31);
  Frane Selak (#27); Şirali Müslümov (#41, doğum belgesi yok); Tayland köyünün kaybolması (#51);
  20 sn'de 100 takla (#53); Yeni Zelanda'da kendi aracının ezdiği adam (#54); karaciğer gebeliği
  (#73); 12.000 hapşırık (#74); yalnız kola içen adam (#79); İspanya'da "torununun annesi" (#80);
  anahtar deliğinden kurşun ve örümcek ısırığıyla yürüme (#82); %90 yanık çocuk (#83); Jewel
  Shuping (#98); kendi cenazesinde uyanan kadın (#68); Angelo Hays (#93, 1937, zayıf kaynak).
- **Cinsel ya da kişisel magazin vakaları:** #31, #42, #46, #66, #84. Bunlar kanalımıza uygun
  değil.

### 4C. Efsane ya da uydurma (kesinlikle "gerçek" diye sunulmamalı)

- **Edward Mordrake (#91):** Charles Lotin Hildreth'in 1895'te Boston Post'ta yayımladığı
  kurgu bir yazı. https://en.wikipedia.org/wiki/Edward_Mordrake
- **Kral I. Umberto ve ikizi lokantacı (#91):** 1900'de basında çıktı, belgesi yok; folklor.
- **Henry Ziegland ve ağaçtaki mermi (#24):** Ripley's tipi bir efsane (Snopes).
- **Robert Liston'ın "%300 ölüm oranlı ameliyatı" (#17):** Kaynağı Richard Gordon'un
  anekdot kitabı. Tarihçiler büyük olasılıkla uydurma olduğunu düşünüyor.
- **James Dean'in "lanetli" Porsche'u (#77):** George Barris'in yaydığı hikâyeler. Kaza
  (30 Eylül 1955) gerçek, "lanet" uydurma.
- **"Lanetli tablo" (#56):** "The Hands Resist Him" türü internet efsanesi.
- **"188 yaşında mağara adamı" (#48):** 2024 viral videosu; çürütüldü.
- **"Old Joe" (#55):** "İdam edilen fil" anlatısı Mary (Tennessee, 1916) ile Topsy (Coney
  Island, 1903) karışımı. "70 sirk çalışanını öldürdü" uydurma.
- **"Hangisi doğru" mitleri (#59, #60):** "En güçlü kas dil" ve "kola aslında yeşil" ikisi de
  mit. Elmas gezegen 55 Cancri e yalnızca bir hipotez.

---

## 5. Minimalist teknik çizim için en uygun 10 vaka

Kriterler: (a) birincil kaynakla doğrulanabilir, (b) hikâyeyi **tek bir ölçü** taşıyor (mesafe,
derinlik, süre ya da sayım), (c) harita, kesit, cetvel ya da zaman çizelgesiyle anlatılabilir,
(d) kan, cinsellik ya da istismar içermiyor.

| # | Vaka | Taşıyan ölçü | Çizim fikri |
|---|---|---|---|
| 1 | **Karl Bushby** | ≈ 48.000 km, ≈ 28 yıl, 29 ülke | Dünya haritasında kırmızı tek çizgi. Darién, Bering ve Manş noktalarında ölçü etiketi. Yıl sayacı. Hull'a varış doğrulanınca güncellenir. |
| 2 | **Çamurçulluğu 2022** | 13.560 km, ~11 gün, 0 iniş | Pasifik haritasında kesintisiz yay. Altta saat sayacı. Durak işaretinin "0" kalması. |
| 3 | **Alvarenga** | 438 gün, ≈ 10.800 km | Meksika'dan Ebon Atolü'ne sürüklenme çizgisi. Gün sayacı. Ölçek çubuğu. |
| 4 | **Dashrath Manjhi** | 110 m × 9,1 m × 7,7 m; 22 yıl; 55 → 15 km | Kayanın kesit çizimi, yıllara göre ilerleyen keski izi. Alttaki haritada iki rota karşılaştırması. |
| 5 | **Sergei Krikalev** | 311 gün; kalkışta SSCB, inişte Rusya | Yörünge çemberi ve gün sayacı. 26.12.1991'de bayrak / ülke etiketinin yer değiştirmesi. |
| 6 | **Hiroo Onoda** | ≈ 29 yıl (1944 → 1974) | Yatay zaman çizelgesi. 15.08.1945'te "savaş bitti" çizgisi; Onoda çizgisi 1974'e kadar sürer. |
| 7 | **Tsutomu Yamaguchi** | 3 gün arayla 2 şehir, ~3 km mesafeler | Japonya haritası, iki daire ve yarıçap ölçüleri, iki şehir arasındaki yolculuk çizgisi. Sade ve saygılı ton. |
| 8 | **Copiapó'daki 33 madenci** | ~700 m derinlik, 17 gün sessizlik, 69 gün | Dikey kesit, ölçek için bina silüetleri. 33 nokta. Temas günü vurgusu. |
| 9 | **Harrison Okene** | ~30 m derinlik, ~1,2 m hava cebi, ~60 saat | Ters dönmüş gövdenin kesiti, hava cebinin ölçüsü, saat sayacı. |
| 10 | **Roy Sullivan** | 7 yıldırım, 35 yıl (1942–77) | Zaman çizelgesinde 7 çentik. Ömür boyu olasılık oranı (NOAA, doğrulanmalı). |

Yedekler: Charles Osborne (430 milyon hıçkırık sayacı), Vesna Vulović (10.160 m ile Everest'in
8.849 m'sini yan yana koyan ölçek, tartışmayı belirterek), Ludger Sylbaris (Saint-Pierre
haritası), Ann Hodges (3,9 kg'lık taşın yörüngesi), Diego (soy ağacı sayımı), Paul Geidel
(68 yıl çizelgesi, doğru bağlamla), Mauro Prosperi (≈ 291 km sapma haritası), Wattana Panich
(52 yıllık tencere çizelgesi).

---

## 6. Beş özgün eşleştirme önerisi

Kalıp: **A (~12 sn) → B (~12 sn) → ortak cetvelde kıyas (~4–6 sn) → yorum sorusu.** Her
eşleştirmede iki vaka **aynı birimle** ölçülür; kıyas karesi aynı eksenle kurulur. Sayıların
tamamı yayından önce birincil kaynakla yeniden doğrulanmalı.

**1. "Durmadan" (mesafe/gün)**
- A, çamurçulluğu: 13.560 km, 11 gün → ≈ 1.230 km/gün.
- B, Karl Bushby: ≈ 48.000 km, ≈ 28 yıl (≈ 10.200 gün) → ortalama ≈ 4,7 km/gün; vize ve
  bekleme süreleri dahil.
- Kıyas: aynı km/gün cetveli. Kuşun çizgisi ekranı geçer, insanın çizgisi bir piksel. Ama
  toplam mesafede insan ~3,5 kat önde.
- Soru: "Hız mı, sabır mı? Hangisi daha şaşırtıcı?"

**2. "Zaman onlarsız akarken" (zaman çizelgesi)**
- A, Krikalev: 311 gün yörüngede; kalktığı ülke o yukarıdayken haritadan silindi.
- B, Onoda: savaş bittikten sonra ≈ 28,5 yıl ormanda savaştı.
- Kıyas: tek zaman ekseninde iki çubuk. Onoda'nınki ≈ 33 kat uzun.
- Soru: "Dünyanın değiştiğini bilmemek mi, bildiği hâlde dönememek mi?"

**3. "Okyanus: yatay ve dikey" (ölçek)**
- A, Alvarenga: 438 gün boyunca ≈ 10.800 km yatayda sürüklendi.
- B, Okene: ~60 saat boyunca ~30 m aşağıda, ~1,2 m'lik bir hava cebinde kaldı.
- Kıyas: süre oranı ≈ 175 kat (10.512 saat / 60 saat). Mesafe oranında ise biri bir okyanus,
  öbürü bir binanın 10 katı.
- Soru: "Hangisi daha zor: 438 gün mü, 60 saat mi?"

**4. "Kaya ile insan" (kesit)**
- A, Manjhi: 22 yılda elle ~110 m'lik yol; yılda ortalama ≈ 5 m.
- B, Copiapó: ~700 m kayanın altında 69 gün; ilk 17 günü dünyadan haber almadan.
- Kıyas: ikisi aynı kesit cetvelinde. Manjhi'nin yolu yatay, madenciler dikey. Ölçek için
  ~700 m bir gökdelen yüksekliğiyle gösterilebilir.
- Soru: "Dağı delen tek adam mı, dağın altında bekleyen 33 kişi mi?"

**5. "İki kez mi, yedi kez mi?" (sayım ve olasılık)**
- A, Yamaguchi: 3 gün içinde 2 atom bombası, ikisinde de ~3 km uzaklıkta.
- B, Roy Sullivan: 35 yılda 7 yıldırım.
- Kıyas: çentikli iki zaman çizelgesi; biri 3 güne, öbürü 35 yıla sıkışmış. Ton sade ve
  saygılı olmalı; Yamaguchi bölümünde yıkım görüntüsü yok, yalnızca harita ve tarih.
- Soru: "Hangisi daha olasılık dışı?"
- Not: Hassas bir eşleştirme. İstenirse B yerine Charles Osborne (68 yıl hıçkırık) konabilir.

**Uygulama notları (Kaç Sıfır? kurallarıyla uyum):**
- Kare 0 boş olmaz: ilk sayı ve çizgi zaten ekranda. "Hangisi daha şaşırtıcı?" metni ilk 0,5
  sn'de gelir.
- Okunacak sayı, okunurken hareket etmez. Her vaka tek fikir ve az kelimeyle anlatılır.
- Açıklamada her sayı için bir kaynak satırı olur. Videonun içinde sade bir "Kaynak:" künyesi
  yeterli.
- Gri Meseleler'in sözlü kalıbı, başlıkları ya da sunum dili kopyalanmaz. "Hangisi daha
  şaşırtıcı?" genel bir soru kalıbı; yine de kanalımız için kendi kapanış cümlemizi
  kullanmak daha güvenli olur. Örnek: "Sen hangisinin yanında dururdun?"

---

## 7. Açık noktalar

- Altyazısı olmayan 3 videonun konusu bilinmiyor: #26 (kedi), #34 (uyku) ve #78 (orman/hayat).
  İstenirse görüntüden bakılabilir.
- Bushby'nin Hull'a varışı güncel haber; yayın günü yeniden kontrol edilmeli.
- [web✓] işaretli olmayan sayılar yerleşik bilgiye dayanıyor. Bir vaka bölüm adayı olduğunda
  önce birincil kaynak (resmî rapor, Guinness kaydı, hakemli makale ya da büyük haber ajansı)
  açılıp sayılar oradan alınmalı.

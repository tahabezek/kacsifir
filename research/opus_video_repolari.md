# Opus 5.5 video repoları: Kaç Sıfır? için analiz (21 Ekim 2026)

Kaynak: @KinGao476942'nin X gönderisi (x.com/KinGao476942/status/2112729924943634602), "Opus 5.5 ile video
için 8 GitHub deposu". Sekiz depo da okundu (salt-okur; hiçbir betikleri çalıştırılmadı). Yıldız sayıları
gönderiden alındı, doğrulanmadı.

## 1. Depolar: ne işe yarar?

| Depo | Ne | Bize değeri |
|---|---|---|
| yihui-dev/awesome-opus5-5-videos | 703 viral video + prompt (`data/videos.json`, `prompts/*.md`). 207'si yalnızca paylaşım metni, bazıları yarıda kesik. | Orta. 20–30 uzun prompt çok iyi (twoclipping, flxrnc, heyiamnick, everestchris6, notdwd, gdgtify, daniel-haida). |
| athemeroy/awesome-claude-5-5-videos | 424 gönderinin araştırması: etkileşim verisi, renk çalışması, üretim brief'i, kabul disiplini. | Yüksek (yöntem). Kopyalanacak prompt yok; "işlenmiş matematik iddiayı kanıtlamaz" disiplini var. |
| joeseesun/opus-video-prompts | 18 Çince prompt, 54 vaka, "yazım dersleri" ve "maliyet" notları. | Düşük–orta. #15 (UI morf döngüsü), #16 (ürün filmi), #17 (piksel büyücü) iyi. |
| lemomo-ai/lemo-opuscar | 51 stil; her biri 11 bölümlük `STYLE.md` + demo kaynak kodu. `DIRECTOR.md`, `TECHNIQUE.md`. | **Çok yüksek.** Swiss, Dataviz, Blueprint stilleri bizim dilimizin kardeşi. |
| Vincentwei1021/mg-styles-15 | 15 adet 10 sn'lik film + prompt + kaynak; `rubric.md` jüri; ~7.000 satır Python ses kütüphanesi (`mgaudio`). | Yüksek (kamera, geçiş, ses, jüri ölçeği). Kod tek dosya ve yamalı, fikir alınır. |
| mexicat/pdoom-video | three.js MV, ölçülmüş kelime hizalama, ölçülmüş vuruş ızgarası, paralel render, 4K60. | Yüksek (boru hattı ve senkron). Mac'e bağlı, ağır. |
| JohnHeibel/PDoomVideo | Aynı şarkının p5 MV'si; karakter oyunculuğu güçlü, zamanlama tahmini (88 bpm; gerçek 132). | Düşük. Ne yapılmayacağının örneği. |
| JohnHeibel/ClaudeAnimationBase | Karakter kiti: 31 ifade, 18 emote, 5 görünüş, oyunculuk yardımcıları, `ANIMATION_GUIDE.md`. | **Çok yüksek** (Sıfır için). |

Zaten yaptığımız ve depoların yalnızca doğruladığı şeyler: saf `render(t)`, tohumlu rastgelelik, tek zaman
çizelgesi, sıfatsız sayısal hareket tarifi, yasak listesi, temas kâğıdı, −14 LUFS, doruk öncesi sessizlik,
bağımsız eleştirmen. BT.709 etiketlerimiz ffprobe ile doğrulandı (out/020: bt709/tv); mexicat'ın
"bayraklar akışa ulaşmaz" uyarısı bizde geçerli değil.

## 2. Bize ne eklenir? (öncelik sırasıyla)

### Paket A: çizim dili (imzamızı güçlendirir) — en yüksek etki
1. **Aşamalı ölçü çizgisi `dim(u)`**: önce uzatma çizgileri, sonra ölçü çizgisi ortadan iki yana büyür,
   oklar bitişte oturur, etiket u > 0,6'da yazılır. (lemo `styles/blueprint/demo/draw.js`)
2. **Yay uzunluğuna göre çizim (`trunc(p,u)`)**: kısmi çoklu çizgi + kalem ucu noktası. Uç parıltısız,
   küçük grafit nokta. Çizim hızı köşelerde yavaşlar: nokta başına süre × (1 + K·dönüş açısı). (lemo one-line)
3. **Çizim sırası vuruşa bağlı**: eksen çizgileri → dış hatlar → ayrıntı → tarama (45°) → ölçüler → etiketler;
   her katman bir vuruşta. Kesikli çizgi standartları: eksen `[34,7,6,7]`, gizli `[11,7]`.
4. **Zum'a göre çizgi kalınlığı**: `lw × zoom^0.65`. Yakın planda sosis, uzak planda kaybolan çizgi olmaz.
5. **Kalemle yazılan sayı**: tek çizgili (Hershey) fontla, kalem sırasıyla çizilen rakam/etiket. Okunurken
   hareket etmez; yalnızca yazılma anında hareket vardır. (mexicat `stroke.ts`)
6. **Grafit halka (`ringPath`)**: bir sayıyı çevreleyen, 1,12 tur dönen, kapanmayan elle çizilmiş halka.
   Kırmızı yalnızca dorukta kalır; halka grafittir.
7. **Bıçak kesişi**: 2 px çizgi bir on altılıkta öğeyi keser, öğe orta çizgisine çöker (scaleY → 0).
   "Sıfırları sil" anları için ideal. (lemo swiss `film.js`)
8. **Basamaklı sayma `steps(t,a,b,n)` ve eşapman**: sayaç n yumuşak basamakla tırmanır; her dişte hareket
   dişin son %65'inde olur ve ses tıkırtısına oturur. Kilometre sayacı, kadran, "kaç sıfır" sayımları için.
   (lemo swiss `ease.js`, mg15 bauhaus `groupAngle`)

### Paket B: kamera ve geçiş
9. **En iyi pan-zoom uçuşu (van Wijk–Nuij)**: `d3.interpolateZoom` mantığı (rho 0,85–1,25), zoom log uzayda.
   On'un kuvvetleri uçuşları ve ölçek açılışları için. (mg15 `19-paperclip`)
10. **Çizimi izleyen kapalı formüllü kamera**: kalem ucu konumlarının ±0,8 sn ileriye bakan Gauss ağırlıklı
    ortalaması + öncü pay; çarpmada ×1,03 zum vuruşu (~0,1 sn sönüm); son beklemede ~%3 itme. Simülasyon yok.
    (mg15 `02-line-art`)
11. **Grafik eşleme geçişi**: bir sahnenin öğesi kopup bir yay çizer ve sonraki sahnenin öğesi olur. Kural
    zaten var ("kesmenin öbür tarafına nesne taşı"); bunlar hazır örnek.
12. **Canlı ölçek cetveli**: on'un kuvvetleri zum'u boyunca sağda sabit "×10ⁿ" ölçü çizgisi. Kanalın adının
    ekrandaki karşılığıdır. (yihui: acoramaa)
13. **Hareketli öğeyi hedefin olacağı yere nişanla ve hızını px/kare ile sınırla**: Sıfır'ın işaret etmesi ve
    yürümesi için. (yihui: flxrnc)

### Paket C: Sıfır'ın oyunculuğu (ClaudeAnimationBase)
14. **Oynanmış ifade değişimi**: anahtardan 0,10 sn önce gözler kısılır, yüz kısıklığın altında değişir,
    0,14 sn'de açılır; poz 0,4 sn'de harmanlanır (bizde 320/30 yay), yeni duygunun boyutunda bir "take".
    Şu an actor.js ifadeyi anında değiştiriyor.
15. **İfade = paket**: göz + ağız + renk + kızarma + emote + `take` boyu + vuruşa kilitli nefes. 31 ifade
    listesinden bize uyanlar: şaşkın, düşünceli, fikir (ampul), şüpheli, gururlu, rahatlamış, sersem.
16. **Tek göz kapama parametresi `squint`**: göz kırpma, ifade değişimi ve gülme aynı mekanizmayla çalışır.
17. **Uyumsuz göz çifti** (biri dar, biri geniş): "bu doğru mu?" şüphesi; matematik paradoksları için birebir.
18. **Kol ucu ve gövde kancaları**: Sıfır cetvel, sayı kartı ve işaretçi tutar; nesne ezilme, dönme ve
    eğilmeyle birlikte gider. Parmak yok kuralı korunur.
19. **Çömelmeli zıplama + leke kareleri (smear)**: `jump` 0,12 sn çömelme, kalkışta uzama, parabol, inişte
    sönümlü ezilme (zıplayan easing değil; sönüm yüksek tutulur). Hızlı kaçışta gözler çizgiye döner ve
    hız izleri çizilir. Bu, kaçış sahnesi için çok ucuz bir hareket bulanıklığıdır.
20. **Çizilmiş 3/4 görünüş**: yüz kaydırılıp yan hilal eklenerek ucuz bir dönüş; şu an yalnızca `facing` çevirme var.

### Paket D: metin, okuma ve hikâye disiplini
21. **"Okumalar" sütunu**: vuruş tablosunda her okumanın başı ve sonu yazılır; iki okuma çakışmaz.
    (CAB `ANIMATION_GUIDE.md`: ilk sürümde final 1,3 sn'ye sıkışmış, düzeltmede 4 sn'ye yayılmış.)
22. **İspat bloğu** (10 saniyede ispat ve paradoks bölümleri): KİLİTLİ METİN listesi + tam işlenmiş sayısal
    örnek + "ÖNEMLİ MANTIK" (yasak yanlış iddialar, ör. "p#+1 her zaman asaldır") + her hareketin ispatın bir
    adımına karşılık gelmesi. (yihui: gdgtify "THERE IS NO LAST PRIME")
23. **Sessiz izlemede anlaşılırlık** bir kabul ölçütü olarak yazılır (zaten seslendirme yok; açıkça ölçülür).
24. **Gerçek şeyi simüle et, resmini değil**: Fermi bölümlerinde belirsizlik bandı / büyüklük mertebesi
    aralığı ekranda gösterilir. Dürüst ve markaya uygun.

### Paket E: ses
25. **Ses olay listesi `hit(kind,t,halfLife)`**: sentezlediğimiz olaylar (riser, impact, tik) bir kez liste
    olarak dışa verilir; görüntü bunları okur (Sıfır'ın göz kırpması, cetvel tıkırtısı). Tek zaman kaynağı
    korunur. (mexicat `audio.ts`)
26. **Her sesin bir senkron noktası vardır**: riser bitişinde, whoosh geçiş tepesinde, impact tepe noktasında.
27. **Kalem sesi**: süresi çizgi uzunluğuna eşit, 2,5–10 kHz kâğıt sürtünmesi. Çizim dilimizin sesi budur.
28. **Sayıların sesi**: değer → perde (pentatonik nicemli "plonk"). Sayım artarken ses de tırmanır.
29. **Mastering**: 120 Hz altı mono, efekt çevresinde müzik −3 dB, true-peak limiter öncesi 20 kHz alçak geçiren.
30. **Tempo/kare uyumu (önemli bulgu):** 96 bpm'de bir vuruş 30 fps'de 18,75 karedir; vuruşlar tam kareye
    düşmez. Ya görsel başlangıçlar kareye yuvarlanır ya da 90 (20 kare), 100 (18 kare) veya 120 bpm
    (15 kare) seçilir.

### Paket F: boru hattı ve kalite kapıları
31. **Paralel render**: N Chrome sayfası 8 karelik parçaları ortak imleçten alır; kareler sıraya dizilip tek
    ffmpeg'e verilir. Çıktı tek işçiyle birebir aynıdır. (mexicat `render.ts`) Günde 3 video için büyük kazanç.
32. **PNG yerine ham kare**: `getImageData` → `-f rawvideo -pix_fmt rgba`; PNG kodlama/çözme ve base64 kalkar.
33. **Kaldığı yerden devam eden render**: `.tmp` yaz → yeniden adlandır, bitmiş kareyi atla. "Yalnızca ilgili
    saniyeleri yeniden render et" kuralı için.
34. **Hareket bulanıklığı yalnızca hızlı anlarda**: alt kare örnekleri (4–8) ffmpeg `tmix` ile birleşir; duran
    metin keskin kalır; örnekler kesmeyi aşmaz. Canvas2D'de N kat maliyet olduğu için yalnızca hızlı hareket
    pencerelerinde kullanılır.
35. **Okuma kapısı**: sayfa `window.TEXTS(t)` → `{id, text, box}` verir; kontrolcü "harf ÷ 15 + 1,5 sn tamamen
    kadrajda" ve "en az 8 temiz kare" kuralını otomatik ölçer. (lemo `readcheck.mjs`)
36. **İpucu kapısı**: ses anahtarları ile görüntü olayları arasındaki farkı ms cinsinden raporlar. (lemo `cuecheck.py`)
37. **Sayaç donma kapısı**: görünen sayaç değişmeyi bırakırsa render bozuk sayılır. (notdwd)
38. **Daha sert determinizm testi**: aynı t'yi farklı arama sırasıyla çiz (ileri, geri, atlayarak).
39. **Kesmelerde temas kâğıdı**: her sahne sınırında ±0,1 sn ve ±1 kare. **Takip eden kırpma**: hareket eden
    Sıfır'ın yüzünü kare kare kırparak ifadeyi denetle. (mexicat `sheet --cuts`, CAB `--crop-at`)
40. **Hareket ölçüsünü referansla karşılaştır**: saniyedeki sert sıçrama sayısı ve durgun kare oranı;
    en iyi performans gösteren Reels'imizle kıyaslanır.
41. **Banding'e karşı 1/255 titreşim (dither)**: kâğıt degradeleri Instagram'ın yeniden sıkıştırmasında
    bantlanmasın. Doku sayfada değil ffmpeg'de eklenebilir (`noise=c0s=N:allf=t`); bu daha hızlı yakalar.

### Paket G: eleştirmen (jüri) ayarı
42. **Kalibre puan çapaları**: 5 öğrenci · 6 şablon · 7 profesyonel · 8 ajans · 9 ödül kısa listesi. İlk
    render'ın 5–7 alması beklenir. (mg15 `rubric.md`)
43. **Her turda en az bir "vay" düzeltmesi**: yalnızca hata ayıklama değil. "Hatasız video iyi video değildir."
44. **Eleştirmene neyin düzeltildiği söylenmez**; kendi karelerini çıkarır; tur defterine önce/sonra sayıları
    yazılır; sonuç "yayınla" ya da "bir tur daha" olur. (everestchris6)
45. **Maliyet kontrolü**: bir kez yargıla, yalnızca kötüleri düzelt; körlemesine tekrar döngüsü yok
    (günde 3 video temposunda önemli).
46. **"Yine demo değil" testi**: yeni bölüm, önceki bölümle yapı, açılış, imza çekim, kamera yolu, müzik
    biçimi ve son açısından karşılaştırılır; en az 4/6 farklı olmalı. (lemo `DIRECTOR.md`) Görsel
    çeşitlilik kuralımızın ölçülebilir hâli.

## 3. Ara sıra kullanılabilecek alternatif görünüşler

Kimlik "ölçü defteri" olarak kalır; aşağıdakiler belirli seriler için alt varyanttır, palet kâğıt + mürekkep
+ tek kırmızı çizgisinde tutulur.

| Stil | Nerede | Anahtar parametre |
|---|---|---|
| Swiss Motion (lemo) | kanca ve büyük sayı vuruşları | 12 sütun ızgara, 96 px kenar; yalnızca `cubic-bezier(.7,0,.2,1)` + doğrusal; giriş = kırpma açılışı, fade yok |
| Data Storytelling (lemo) | olasılık / istatistik | nokta ızgarası `#E4DDCF`, kalem tek oyuncu, her işaret bir perde |
| One-line Drawing (lemo) | geometri ispatları | kalem 300–700 birim/sn, tek vurgu tek kez |
| Copperplate Engraving (lemo) | tarihî matematikçiler (Gauss, Euler) | kesim sırası = animasyon: dış hat → tarama → çapraz tarama |
| Isometric Infographic (lemo) | Fermi tahminleri | 30° eksen, yüz başına 3 ton, Isotype ikon dolumu, zum log uzayda |
| Briefing Board (lemo) | "sığar mı?" kıyasları | grafit = olgu, kırmızı = yalnızca hüküm; hüküm karesi ≥ 2,5 sn |
| Blueprint (lemo) | özel bölüm ("gece planı") | ters palet; tek kırmızı damga bir kez. Marka riskli, nadiren. |

## 4. Kaçınılacaklar

- Zıplayan/elastik easing (`backOut`, `elasticOut`, 1,15 pop): depolarda varsayılan, bizde yasak. Mantık alınır, eğri alınmaz.
- Uç parıltısı, HUD köşe etiketleri ("FIG. 07", "BEAT 27/60"), sahte HUD sayıları, baskı kayması/RGB ayrışması.
- Boşta titreme (22 Hz korku titremesi, dans döngüleri). Periyodik göz kırpma (bizdeki tohumlu aralık daha iyi).
- Fade/kâğıttan açılış, genel silme geçişleri. Kare 0 kancası bozulur.
- Harici video/görsel modelleri ve lisansı belirsiz efekt sesleri. Kod-yalnız kimliğimiz korunur.
- Her karede yeni film greni ve halation: teknik çizim diline aykırı, bit hızını yer.
- Tahmini zamanlama (karakter sayısıyla kelime vurgusu, ezbere bpm). Her zaman ölçülür.
- `sin(i*127.1)*43758` hash'i: float hassasiyetine bağlı; mulberry32 kalır.
- "Tek prompt / %100 kod" iddiası: açıklamalarımız yaptığımızdan fazlasını iddia etmez.
- Kodu toptan kopyalamak: mg15 dosyaları tek parça ve yamalı; lemo demo filmleri CC BY 4.0 (atıf ister),
  kod MIT. Fikir alınır, motorumuzun modül düzeninde yeniden yazılır.

## 5. Ek: "Chain Reaction" (renproton) ve "Motion Engineering" makalesi (beamnxw)

Kaynak: x.com/renproton/status/2112937140644720681 (15 sn, 16:9, 60 fps, three.js; Drive'da 5 sayfalık
"Chain Reaction Prompt.pdf") ve alıntıladığı makale x.com/beamnxw/status/2108616740846420354 (Remotion ile
ürün lansman klibi). Video: voksel maskot bir bilyeyi fiskeler → spiral ray → sarkaç → 70 domino → tahterevalli
→ huni → zil → büyük domino logoyu yuvasına çakar → yeni bilye bir alt basamağa yuvarlanır (kusursuz döngü).

**Neden bizimkinden "zengin" görünüyor? (dürüst teşhis)** Fikir değil, üretim katmanı:
1. **Gerçek 3B + stüdyo ışığı:** yumuşak ana ışık + kontur ışığı, temas gölgeleri, tilt-shift alan derinliği,
   yalnızca parlak noktalarda bloom, %1,5 gren, vinyet. Malzemeler (meşe, pirinç, cam) ışığı gerçek gibi yansıtır.
2. **Fizik her şeyi sürer:** simülasyon açılışta sabit adımla (1 kHz) bir kez pişirilir, `renderAt(t)` yalnızca
   tablodan okur. g = 981 cm/s², kaymadan yuvarlanma, gerçek sarkaç periyodu, domino yalnızca temasla devrilir.
   "Canlandırılmış" ile "inanılır" arasındaki fark budur. Kamera anahtarları simülasyonun olaylarına oturur.
3. **Döngü bir merdivendir:** son kare, ilk karenin bir basamak aşağısıdır; geri sarma yoktur. (Bizim bölümler
   sonda geri sarıyor; bu, onların yaklaşımından zayıf.)
4. **Render:** 2× çözünürlük (3840×2160); her karede float doğrusal ışıkta 20 örnek (0,45 kare deklanşör, mercek
   üstünde bir nokta, alt piksel kayması) → hareket bulanıklığı, alan derinliği ve kenar yumuşatma tek geçişte;
   ton eşleme, Lanczos ile küçültme, gren + dither, ham kareler ffmpeg'e, H.264 CRF 14.
5. **Ses simülasyondan sentezlenir** (OfflineAudioContext, örnek dosya yok): seviye çarpma hızından, perde
   boyuttan, pan konumdan gelir; her vuruş görüntüden **1 kare (17 ms) sonra** tepe yapar, böylece ses
   görüntünün sonucu gibi okunur. Gerçek tepe örneği ölçülür (zil 34 ms gecikiyordu, düzeltildi). İki döngü
   render edilip ikincisi alınır, kuyruklar dikişten taşar. Müzik foley'nin 12 dB altında seyrek kalimba.
   Limiter en fazla 3 dB; −14,1 LUFS, TP −2,3 dBTP.
6. **7 tur ölçülü düzeltme:** "pozlama ~%40 fazla", "logo plakanın %82'si", "47 px bulanıklık", "marka rengi 2×
   karede ölçülür, hex'e 10 birimden yakın olana kadar ışık ayarlanır", "her çarpmanın çevresinde 5 kare; hiçbir
   şey iç içe geçmez". "Tek prompt" iddiası abartı: 270 kelimelik prompt + 7 görüntü + 3 ses turu.

**Makaleden (beamnxw) alınacaklar:**
- Referans videoyu ölçerek analiz et: giriş/iniş/bekleme/kesme kare numaraları, nesne kutuları, yön, süre,
  ölçek/opaklık değişimi, aşma; ölçülen, tahmin edilen ve yaratıcı öneri ayrı etiketlenir → REFERENCE.md.
- Düzeltme notu dört alanlıdır: **konum (global kare) · gözlenen sorun · değişiklik · sabit kalacaklar.**
- Düzeltme sırası: eksik bilgi → okunmayan metin → zamanlama → görsel ayrıntı.
- Önce üç kare (açılış, sonuç, kapanış), sonra hareket. Sahne sınırlarının giriş/çıkış durumları yazılır.
- En uzun metin varyantıyla yerleşim test edilir; 3 satıra taşarsa hareket işi durur.

**Bize uyarlama (öneri):** "Kaç Sıfır? Masası" adında ayda birkaç kez yapılan bir **amiral gemisi formatı**.
Çizim masası 3B olur: kâğıt, cetvel, pirinç pergel, ahşap bloklar; Sıfır 3B bir karakterdir. Fizik gerçek bir
sayı gerçeğini taşır. Örnekler:
- **Domino büyütmesi** (Whitehead 1983, *Am. J. Phys.*): her taş bir öncekinin yaklaşık 1,5 katıdır; kaçıncı
  taşın Galata Kulesi'ni, sonra Everest'i devireceği sorulur. Sayılar yayından önce kaynaktan doğrulanır.
- **Satranç tahtasında buğday:** gerçek tanelerin fizikle yığılması.
- **Gauss'un toplamı:** ahşap bloklardan merdiven; kopyası ters döner ve oturur.

Palet kâğıt/mürekkep/tek kırmızı olarak kalır; 3B stüdyo ışığı "ölçü defteri"ni nesneye dönüştürür.

Teknik engel: render GitHub Actions'ta (ubuntu, GPU yok) çalışıyor. 3B + 20 örnek orada SwiftShader ile çok
yavaş olur. Seçenek: amiral gemisi bölümleri yerelde RTX 3050 Ti ile (`--use-angle=d3d11`) render edip hazır
mp4 olarak kuyruğa koymak (`run.mjs` hazır mp4 kabul edecek şekilde genişletilir).

## 6. Kaynak dosyalar

Klonlar geçici scratchpad'deydi; gerekirse yeniden `git clone --depth 1` yapılır. En değerli dosyalar:
lemo `DIRECTOR.md`, `TECHNIQUE.md`, `styles/{blueprint,swiss-motion,dataviz,one-line}/STYLE.md` ve `demo/`,
`core/render/readcheck.mjs`; mg15 `rubric.md`, `template.md`, `demos/02-line-art/film.js`,
`demos/19-paperclip/index.html`, `lib/audio/mgaudio/`; mexicat `docs/ENGINE.md`, `docs/TREATMENT.md`,
`app/scripts/render.ts`, `app/src/engine/audio.ts`; CAB `src/clawd.js`, `src/core.js`, `ANIMATION_GUIDE.md`.

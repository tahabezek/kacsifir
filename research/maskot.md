# Maskot araştırması: "Sıfır"

Tarih: 2026-10-21. Kapsam: yalnızca web araştırması. Amaç, @kacsifir için kodla çizilen "Sıfır"
maskotunun ölçülü ve uygulanabilir bir tasarım şartnamesini çıkarmaktır.

Kısaltmalar: **D** = kafa çapı (1,0 birim). Bütün ölçüler D cinsindendir. Kafa merkezi (0, 0)'dır;
y aşağı doğru artar (canvas düzeni).

Etiketler:
- **[kanıt]**: hakemli çalışma ya da birincil kaynak.
- **[uygulama]**: stüdyo kılavuzu, animasyon eğitimi ya da tasarımcı beyanı.
- **[gözlem]**: resmî görsellerden göz kararı ölçüm; kesin değildir.
- **[öneri]**: bu rapordaki sentez; doğrudan bir kaynağı yoktur ve önce poz kâğıdında denenmelidir.

Kaynak numaraları `[n]` biçimindedir ve listesi en sonda verilmiştir.

---

## 0. Özet: önerilen şartname

| Parametre | Değer |
|---|---|
| Yön | **B: "Fasulye gövde"**. Kafa tipografik bir 0 halkası, gövde fasulye biçiminde, uzuvlar kısa ve kalın. |
| Toplam boy | **2,0 D** (kafa:boy = 1:2). Bu oran maskot çalışmasında en çok beğenilen orandır (6,49/7) [5]. |
| Kafa | Daire, en/boy 1,00. Dış çember r = 0,50; iç elips rx = 0,435, ry = 0,45. Halka yanlarda 0,065 D, üstte ve altta 0,05 D kalınlıktadır. |
| Gövde | Fasulye: en 0,66 D, boy 0,62 D. Üst kenarı kafanın 0,10 D altına girer; boyun yoktur. |
| Bacak | Uzunluk 0,32 D, kalınlık 0,13 D, kalçalar arası 0,22 D. Ayak 0,20 × 0,11 D elips. |
| Kol | 2 segment (0,20 + 0,18 D), kalınlık 0,11 D. El 0,13 D çaplı yumru; **parmak yoktur**. |
| Göz | Dikey elips, 0,15 × 0,19 D, ink dolgu, **beyaz sklera yoktur**. Merkezler x = ±0,19, y = +0,08 (yukarıdan %58). |
| Parlama | Ana nokta 0,06 D, göz merkezine göre (+0,03, −0,045). İkinci nokta 0,025 D, (−0,03, +0,05). İki gözde aynı tarafta durur. |
| Ağız | Merkez (0, +0,25). Nötr gülüş 0,10 D eninde, 0,025 D derinliğindedir. Çizgi 0,03 D, uçları yuvarlak. |
| Allık | 0,15 × 0,08 D elips, merkez (±0,31, +0,22). #E0391C, opaklık %25 (kâğıt üstünde ≈ #E9BAA7). Kenarı yumuşak, çizgisi yoktur. |
| Çizgi kalınlıkları | Dış hat 0,055 D · uzuv 0,12 D · ağız 0,03 D · kaş 0,025 D. Bütün uçlar ve köşeler yuvarlaktır. |
| Nefes | 3,6 sn periyot. Gövde scaleY +%2, scaleX −%1. Kafa 0,012 D yükselir ve 150 ms geriden gelir. |
| Göz kırpma | Aralık 2,5–5,5 sn (tohumlu). Süre 150 ms (kapanış 50 ms + kapalı 33 ms + açılış 70 ms). Kırpmaların %20'si çifttir. |
| Yavaş kırpma | 400 ms kapanış, 250 ms bekleme, 500 ms açılış. Gözler %15'e kadar kısılır. Sıcak anlarda kullanılır; en fazla 20 sn'de bir. |
| Kafa eğme | 10–14°, 500–800 ms içinde, karakterin sağına doğru. |
| Zıplama | Hazırlık 167 ms, squash %12. Havada 300 ms, yükseklik 0,30 D. İniş squash'ı %15, ardından 290 ms oturma. |
| Yürüyüş | Adım 333 ms (24 fps'de 8 kare). Bob 0,035 D, döngüde iki kez. Paytak salınım ±5°. |
| Squash/stretch | Gövdede en fazla ±%15, kafada en fazla ±%6. Alan korunur: sx = 1/sy. |

Gerekçeler ve kaynaklar aşağıdaki bölümlerdedir.

---

## 1. Bebek şeması (Kindchenschema): sayılarla kanıt

### 1.1 Lorenz'in listesi
Lorenz'in bebek şemasında şu özellikler sayılır: büyük kafa, yüksek ve öne çıkık alın, büyük gözler,
tombul yanaklar, küçük burun ve ağız, kısa ve kalın uzuvlar, tombul gövde [1]. Uzuvların kısa ve
kalın olması, Sıfır'ın çubuk adam görünümünden kurtarılması için temel dayanaktır (bkz. §5).

### 1.2 Glocker ve ark. 2009 (Ethology): parametrik yüz manipülasyonu [kanıt]
Bu çalışmada altı ölçü değiştirilmiştir. Bebek şeması "yüksek" yüzlerde yüz genişliği, alın oranı ve
göz oranı artırılmıştır. Burun uzunluğu, burun genişliği ve ağız genişliği ise azaltılmıştır. Bütün
değişiklikler ±2 SD içinde tutulmuştur [1].
- Manipüle edilmemiş bebek ortalamaları şöyledir: göz genişliği / yüz genişliği = **%18,5**;
  ağız genişliği / yüz genişliği = **%28,4**; burun uzunluğu / kafa uzunluğu = **%14,8** [1].
- Sevimlilik farkı çok güçlüdür: F(2,59) = 137,3, p < 0,001. Bütün ikili karşılaştırmalar
  anlamlıdır [1].
- Aynı grubun PNAS 2009 çalışmasına göre yüksek bebek şeması ödül sistemini (nucleus accumbens)
  daha fazla etkinleştirir [2].

### 1.3 Borgi ve ark. 2014: insan, köpek ve kedi yüzleri, 3–6 yaş çocuklar [kanıt]
Ölçüler 600 px kafa uzunluğuna normalize edilmiştir. Ortalamalar [3]:

| Ölçü | Yetişkin insan | Bebek | Kedi | Yavru kedi |
|---|---|---|---|---|
| Alın yüksekliği oranı (AO/AB) | 0,48 | **0,61** | 0,56 | 0,59 |
| Göz genişliği / yüz genişliği | 0,17 | **0,19** | 0,16 | 0,15 |
| Burun uzunluğu oranı | 0,21 | **0,14** | 0,29 | 0,23 |
| Ağız genişliği / yüz genişliği | 0,35 | **0,29** | 0,41 | 0,35 |

- Yüksek şema yüzleri daha sevimli bulunmuştur: F(1,86) = 12,4, p = 0,001. Etki türden
  bağımsızdır ve çocuklarda da görülür [3].
- Bakışların %46–47'si gözlere, %13'ü buruna ve yalnızca %6–7'si ağza gider. Yüksek şemalı
  yüzlerde göz bölgesine bakma süresi daha uzundur [3].
- **Tasarım sonucu:** Sevimliliği en çok gözler taşır. Ağız küçük kalabilir. Burun tamamen
  atlanabilir; çünkü bebek şemasında burun "küçük" olandır.

### 1.4 Göz büyüklüğü tek başına etkilidir (Yao ve ark. 2022) [kanıt]
- Göz/yüz oranı ±%15 değiştirilmiştir. Büyük gözler bütün ifadelerde (pozitif, nötr, negatif) ve
  her yaşta daha sevimli bulunmuştur. Etki büyüklüğü η² = 0,43–0,48'dir [4].
- %15 sınırının gerekçesi şudur: daha fazla büyütüldüğünde göz köşesi yüz kenarını aşıyor ve
  kaşları örtüyordu [4]. **Tasarım sonucu:** Göz büyük olmalıdır, ancak yüzün çevresine ya da
  diğer öğelere taşmamalıdır.

### 1.5 Maskot çalışması (Chen & Lin 2026, Frontiers): doğrudan maskot verisi [kanıt]
290 genç yetişkinle yapılmıştır. Kafa:toplam boy oranları 1:1,5 / 1:2 / 1:2,5 / 1:3 olarak
denenmiştir. Beğeni 7'li ölçekle ölçülmüştür [5]:

| Değişken | Ortalama beğeni |
|---|---|
| 1:1,5 | 5,51 |
| **1:2** | **6,49** |
| 1:2,5 | 4,00 |
| 1:3 | 2,49 |
| Büyük göz | **6,00** |
| Orta göz | 3,98 |
| Küçük göz | 2,01 |
| Hayvan / robot / insan maskot | 6,02 / 5,01 / 4,03 |

- Kompakt oranlar (1:1,5 ve 1:2) uzun bakma süresiyle birlikte görülen bütün konfigürasyonlarda
  yer alır [5].
- **Tasarım sonucu:** Toplam boy 2 kafa olmalıdır. 1,5 kafa da kabul edilebilir, ancak 2,5
  kafanın üstüne çıkılmamalıdır. İnsan gibi görünen bir maskot en az sevilen türdür. Sıfır bu
  yüzden insan değil, "nesne-yaratık" olmalıdır.

### 1.6 Kafa:gövde oranının ters U eğrisi (PMC10813407) [kanıt]
Gerçekçi bedenlerde kafa çok büyütüldüğünde sevimlilik düşmüştür (2,78 < 2,93; ters U eğrisi).
Silüetlerde ise kafa büyüdükçe sevimlilik artmıştır (2,72 → 3,31 → 3,60). Silüette bedenin etkisi
yüzün etkisinden büyüktür (çocuk bedeni 4,30, yetişkin bedeni 2,11) [6].
**Tasarım sonucu:** Sıfır bir silüet karakteridir. Bu yüzden büyük kafa ve kısa, tombul gövde
güvenle kullanılabilir. Gerçekçi gövde detayları ise kaçınılması gereken şeydir.

### 1.7 Yuvarlak çene ve yuvarlak hatlar [kanıt]
- Nesnelerde görülen yüzlerde (pareidolia) yuvarlak çene sivri çeneden daha sevimli (F = 17,8),
  daha güvenilir ve daha çekici bulunmuştur [7]. Sıfır'ın kafası da bir nesne yüzüdür.
- İnsanlar kavisli nesneleri tercih eder. Sivri dönüşler tehdit izlenimi verir ve amigdalayı daha
  çok etkinleştirir [11]. **Sonuç:** Kafa, gövde, uç ve birleşimlerin hepsi yuvarlak olmalıdır.
  `lineCap = lineJoin = "round"` kullanılır.

### 1.8 Robot ve avatar çalışmaları [kanıt]
- Sosyal robot yüzlerinde yüksek bebek şeması sevimliliği ve güveni artırmıştır. Ancak etki
  küçüktür (4,77'ye karşı 4,67); robot türünün etkisi daha büyüktür [9].
- Kültürler arası avatar çalışmasında (İsrail ve Japonya, n = 485) bebek şemalı avatarlar
  sevimlilik, sevilebilirlik ve yaklaşılabilirlikte nötr avatarları geçmiştir. Ancak hangi
  avatarın en sevimli bulunduğu kültüre göre değişmiştir [10]. **Sonuç:** Türk izleyiciyle küçük
  bir A/B testi yapmaya değer (bkz. §4).
- Kawaii literatür taramasına göre en sık görülen iki etken yuvarlaklık ve küçük boyuttur [17].
  **Sonuç:** Sıfır'ı yanındaki dev sayılara ve nesnelere göre küçük göstermek ("büyük prop")
  sevimliliği artırır.

---

## 2. Sevilen minimal karakterler: ölçüler ve hileler

Not: Ölçüler **[gözlem]** etiketlidir, yani resmî görsellerden göz kararı alınmıştır. Tasarımcı
beyanları ve kılavuzlar ise kaynaklıdır.

| Karakter | Boy (kafa) | Göz | Allık | Ağız | Çizgi | Uzuv | Renk sayısı |
|---|---|---|---|---|---|---|---|
| Kirby | ≈1 (kafa = gövde) | Dikey oval, üstte beyaz parlama | Pembe elips | Küçük, ifadeye göre açılır | Modern sürümde yok | Yumru kol, oval ayak | 3 |
| Pusheen | ≈1,3 (yatay basık) | Küçük siyah nokta, geniş aralık, aşağıda | Bazen | ":3" | Kalın, koyu gri, eşit kalınlıkta | Çok kısa yumrular | 2–3 |
| Molang | ≈1,3–1,5 (yumurta) | Minik nokta, geniş aralık | Pembe | Minik | İnce | Kısa yumru | 2–3 |
| Sumikko Gurashi | ≈1–1,2 | Minik nokta | Var | Minik | İnce kahverengi | Neredeyse yok | Pastel, 3–4 |
| Rilakkuma | ≈1,7 | Minik nokta, parlama yok | Yok | Ağızlık (muzzle) içinde | Orta | Kısa, kalın | 3 |
| Duo (Duolingo) | ≈1,2 (kafa-gövde birleşik) | Çok büyük, iri göz bebeği, parlama var | Yok | Gaga | Hat yok | Kanat, kısa ayak | 3–4 |
| Headspace | Değişken "blob" | Nokta ya da kapalı | Yok | Kavis | Hat yok | Az | Sıcak, 3–4 |
| Kurzgesagt kuşları | ≈1 (yuvarlak) | Tek nokta | Yok | Gaga | Hat yok | Minik ayak | 2–3 |
| Bluey | ≈2,5 | Nokta, küçük parlama | Yok | Basit | Hat yok | Normal | 4–5 |
| Pikachu (1996) → (sonra) | ≈1,5 → ≈2 | Siyah, beyaz parlama | **Kırmızı daire** | Küçük "ω" | İnce | Kısa | 4 |
| Mr. Men | ≈1 (tek şekil) | Minik | Yok | Geniş kavis | Kalın | **İnce siyah çubuk** | 2 |
| Line Friends Brown | ≈1,8 | Minik nokta, ifadesiz | Yok | Ağızlık | Yok | Kısa | 2 |

Kaynaklı notlar:
- **Kirby:** Başta yer tutucu (placeholder) olarak tasarlanmış basit bir topken korunmuştur.
  Sakurai "herkesin seveceği sevimli bir kahraman" istemiştir. Iwata'ya göre yuvarlak tasarım,
  herkesin onu çizebilmesi için seçilmiştir [21].
- **Pikachu:** İlk taslak bir daifuku (pirinç tatlısı) gibiydi. Daha sonra animede "oynatabilmek"
  için gövde inceltilmiş, boyun belirginleştirilmiş ve omurga uzatılmıştır [22]. **Ders:** Tam bir
  blob en sevimli olandır, ama oyunculuk (poz, işaret etme) için biraz gövde ve boyun ayrımı
  gerekir. Bu, B yönünü destekler.
- **Duolingo kılavuzu:** Bütün çizimler üç temel şekilden kurulur: yuvarlatılmış dikdörtgen, daire
  ve yuvarlatılmış üçgen. Sivri şekil markaya aykırıdır. Mümkün olan en az şekil kullanılır.
  Karakterlerde kafa ve gövde 1–2 şekilden oluşur. Gölge, karakterin altında oval değil hap
  (pill) biçimindedir [23]. 2019 yeniden çiziminde önce silüet ele alınmıştır: "Genel şekil
  çekici değilse içindeki detaylar onu kurtaramaz" [24]. Yeni stil daha geometrik ve düz
  perspektiflidir, böylece animasyon kolaylaşır [25]. Detay en aza indirilir; anahtar detaylar
  karikatüre varacak kadar abartılır [26].
- **Headspace:** Yuvarlak karakterler, kapalı gözler, sıcak renkler ve minimum detay kullanılır.
  Bu özet resmî değildir, bir analizden alınmıştır [27].
- **Hello Kitty:** Ağzı yoktur. Sanrio bunu "insanlar kendi duygularını yansıtabilsin" diye
  açıklar [28]. McCloud'un "maske etkisi" de aynı şeyi söyler: yüz ne kadar sadeyse izleyici o
  kadar kolay özdeşleşir [29]. **Ders:** Sıfır'ın nötr ağzı çok küçük olmalı, hatta neredeyse
  hiç olmamalıdır. Duygu göz ve bedenle verilir.
- **Rilakkuma:** Kondo'ya göre ayıya bilerek biraz "salaş" bir duruş verilmiştir; çünkü bu onu
  güldürmüştür. Karakter sevimli olmalı ama "biraz yersiz" de durmalıdır [30]. Bu, "şapşik"
  tanımının ta kendisidir.
- **Sumikko Gurashi:** Karakterler kusurlu, kaygılı ve köşede durmayı seven yaratıklardır. Bu
  duygusal gerçekçilik markanın en büyük gücüdür [31].
- **Mr. Men:** Daire, dikdörtgen ve çizgilerden kurulur. İnce siyah çubuk uzuvlar bile işe yarar,
  çünkü gövde **tek, büyük, dolgun ve renkli bir şekildir** [32]. Çubuk uzuv ancak gövde kütle
  taşıyorsa sıcak durur.

Ortak hileler [öneri, yukarıdaki kaynaklardan sentez]:
1. Göz ya çok büyük ve parlamalı (Kirby, Duo, Pikachu) ya da çok küçük nokta ve geniş aralıklıdır
   (Pusheen, Molang, Brown). **Orta boy, sklerası görünen insan gözü hiçbirinde yoktur.**
2. Burun ya yoktur ya da ağızlığın içinde kaybolur.
3. Ağız küçüktür ve gözlerin hemen altındadır.
4. Renk sayısı 2–4'tür. Allık çoğu zaman tek "sıcak" vurgudur.
5. Uzuvlar kısa yumrudur. Parmak yoktur.
6. Silüet tek bakışta tanınır.

---

## 3. Hareket: "şapşik" ve sevimli olmanın zamanlaması

### 3.1 Proje kısıtı
Kullanıcının genel kuralları (CLAUDE.md) bazı varsayılanları yasaklar: **zıplayan ve elastik
easing**, **boşta sallanma (idle wobble)** ve karartmadan beliren her şey. Bu yüzden
"şapşiklik" sürekli bir lastik hareketten gelmez. Fiziksel olaylara bağlı tek bir aşırı gidiş,
iniş ve çarpmalarda squash, beceriksiz tepkiler ve zamanlama komiğinden gelir [öneri].

- Giriş eğrisi `cubic-bezier(0.16,1,0.3,1)`, durum değişimi `cubic-bezier(0.65,0,0.35,1)` olarak
  kalır (CLAUDE.md).
- Karakter yayı için önerilen değer **sertlik 200 / sönüm 18**'dir (kütle 1). Bu, ζ ≈ 0,64 ve
  **tek görünür aşma ≈ %7** verir: exp(−ζπ/√(1−ζ²)) ≈ 0,073 [öneri, hesap]. Elastik easing
  birden çok salınım demektir; tek ve küçük bir aşma bu kurala aykırı değildir. Mevcut ön
  ayarların ζ değerleri şöyledir: arayüz 320/30 ≈ 0,84, kamera 170/26 ≈ 1,0, logo 120/24 ≈ 1,1.
  Logo ön ayarı hiç aşma yapmaz. Bu yüzden Sıfır'ın gövdesinde kullanılırsa "ölü" görünür.

### 3.2 Nefes (boşta) [kanıt + öneri]
- Dinlenen bir yetişkin dakikada 12–20 kez nefes alır [33]. **3,6 sn periyot** dakikada ≈ 16,7
  nefes eder.
- İyi bir boşta animasyonu "neredeyse görünmez" olmalıdır. Döngüsel nefes temeldir; göz kırpma
  gibi küçük ekler bu temelin üstüne katmanlanır [34]. Gövde, göğüs, omuz ve kafa birbirinden
  zaman kaydırılır [35].
- Değerler [öneri]: Gövde ayak tabanına sabitlenir; scaleY 1 + 0,02·s(t), scaleX 1 − 0,01·s(t).
  Kafa 0,012 D yükselir ve 150 ms geriden gelir. Kafada deformasyon yoktur. s(t) yumuşak bir
  sinüstür (sürekli hareket olduğu için kurala uyar).

### 3.3 Göz kırpma [kanıt + uygulama]
- İnsan bir kırpmayı 100–400 ms içinde yapar; UCL'ye göre ortalama 100–150 ms'dir [19].
- İnsan dakikada ortalama ≈14 kez kırpar; bireyler arası fark büyüktür [20]. Bu, ≈4,3 sn'de bir
  kırpma demektir.
- Animasyonda 24 fps'de bir kırpma 2–6 kare sürer; kapalı göz için 4 kare, yarı açık ara kare
  için 2 kare örneği vardır [36].
- Duolingo tarzı bir Rive kurulumunda kırpma ya da göz kaydırma 2–5 sn'de bir rastgele tetiklenir.
  Bu bir üçüncü taraf geliştirici önerisidir, Duolingo'nun resmî değeri değildir [37].
- **Şartname:** Aralık tohumlu rastgele 2,5–5,5 sn'dir. Kırpma 150 ms sürer: kapanış 50 ms (göz
  scaleY 1 → 0,1), kapalı bekleme 33 ms, açılış 70 ms. Kırpmaların %20'si çifttir (aradaki boşluk
  120 ms). Okunan bir metin geldiğinde kırpma yapılmaz; dikkati dağıtmaz.

### 3.4 Yavaş kırpma: sıcaklık sinyali [kanıt]
Kedilerde yavaş kırpma birkaç yarım kırpma ve ardından uzun bir göz kısma ya da kapama dizisidir.
Sahibi kediye yavaşça kırptığında kedi de kırpar. Deneycinin yavaş kırpmasından sonra kediler ona
daha çok yaklaşır. Yazarlar bunu "olumlu duygusal iletişim" olarak yorumlar [18].
**Şartname [öneri]:** Kapanış 400 ms, %15 açıklıkta 250 ms bekleme, açılış 500 ms. Hafif bir
gülümseme ve allık %25 → %35 ile birlikte kullanılır. Videonun sıcak ya da kapanış anında, en
fazla 20 sn'de bir oynatılır.

### 3.5 Kafa eğme [kanıt]
- Robotlarda kafa eğildiğinde sevimlilik ve insansılık puanı artar (n = 402 ve 253). Ancak tüyler
  ürpertici bulunma puanı da biraz artar [15]. **Sonuç:** Eğme kısa ve anlamlı bir an olmalıdır;
  karakter sürekli eğik durmamalıdır.
- Kawaii robot çalışmasında karakterin kendi sağına doğru **0,5–1 sn içinde** yapılan eğme daha
  kawaii bulunmuştur. El hareketi eşlik ettiğinde etki değişir [16].
- **Şartname [öneri]:** 10–14°, 500–800 ms, durum değişimi eğrisi. Pivot boyun noktasıdır (kafanın
  alt kenarı, y = +0,45). Merak ya da düşünme anında kullanılır; ardından en az 1 sn tutulur.

### 3.6 Squash & stretch [uygulama]
- Disney'in ilkesi, Thomas & Johnston'ın *Illusion of Life* kitabında formüle edilmiştir. Şekil
  değişirken hacim korunur: bir yönde ezilen nesne öbür yönde genişler. Sert nesneler daha az
  deforme olur [38][39].
- **Şartname:** Alan korunur: sx = 1/sy. Gövdede en fazla %15, kafada en fazla %6 deformasyon
  olur. Kafa bir "0" glifidir; çok ezilirse okunmaz. Kafa gövdeden 2 kare geriden gelir (üst üste
  binen hareket, overlapping action).

### 3.7 Zıplama ve "take" (şaşırma tepkisi) [uygulama]
School of Motion'ın take zamanlamaları (24 fps) [40]:
- Temel: hazırlık 4 kare (167 ms), vurgu 7 kare (292 ms), oturma 7 kare (292 ms).
- Warner tarzı: hazırlık 6 kare (250 ms), ardından **1 karelik "pop"** (42 ms), oturma 7 kare.
- Çift take: hazırlık 4 kare, kafa dönüşleri 3 kare arayla, vurgu 9 kare.

**Sıfır'ın zıplama şartnamesi [öneri, yukarıdakilerden]:**
1. Hazırlık çömelmesi 167 ms; sy 0,88, sx 1,136.
2. Kalkış stretch'i 2 kare; sy 1,10, sx 0,91.
3. Havada 300 ms parabol, yükseklik 0,30 D.
4. İniş squash'ı %15, 2 kare.
5. 200/18 yayıyla oturma, ≈290 ms.

**Şaşırma:** Warner tarzı kullanılır. Pop sırasında gözler 1,15× büyür, ağız "o" olur, gövde %12
uzar. 300–500 ms hareketli tutuş (±%1) yapılır, ardından oturulur.

### 3.8 Yürüyüş: paytak (waddle) [uygulama + öneri]
- İnsanlar genelde "12'lerde" yürür: 24 fps'de her 12 karede bir adım, yani saniyede ≈2 adım [41].
  Eski 2D animasyonda 8'lik ve 16'lık döngüler de yaygındır [41]. 16 karelik döngü yavaş koşu ya
  da "çizgi film yürüyüşü" olarak geçer [42].
- **Şartname:** Kısa bacaklı küçük bir karakter için adım **8 karedir (333 ms)**; döngü 667 ms
  sürer. Dikey bob 0,035 D'dir ve döngüde iki kez olur; en alçak nokta temas anıdır ve %4 squash
  içerir. Gövde ve kafa basan bacak yönüne ±5° yuvarlanır (paytaklık). Kafa 80 ms gecikmeli olarak
  ters yöne düzeltir. Kollar bacakların tersine ±18° sallanır. Ayak 0,06 D kalkar. Her adımda
  ≈0,45 D yol alınır.

### 3.9 Beceriksizlik dozu: pratfall etkisi [kanıt]
Aronson (1966) deneyinde son derece yetkin biri (≈%92 doğru cevap) üstüne kahve döktüğünde en
sevilen aday olmuştur. Vasat biri aynı hatayı yaptığında ise en az sevilen aday olmuştur [43].
**Sonuç [öneri]:** Sıfır önce sayıyı doğru ve net anlatır, yani yetkinlik kurulur. Ardından
videoda **en fazla bir kez** küçük bir sakarlık yapar: dev rakam devrilir, Sıfır onu 300 ms
geç yakalar. Bilgide asla hata yapmaz; sakarlık yalnızca fizikseldir.

### 3.10 Hareket ve tekinsizlik [kanıt]
Mori'ye göre hareket, tekinsiz vadinin tepelerini ve çukurlarını derinleştirir. Mori tasarımcılara
açıkça "ilk tepeyi hedeflemelerini" önerir, yani insana çok benzeyen tasarımdan uzak durmalarını
[14]. **Sonuç:** Hareket çizgi film fiziğiyle yapılır. Mocap benzeri insan mikro hareketleri,
gerçekçi ağırlık kaydırması ve parmak oynatma kullanılmaz.

Kawaii hareket literatürüne göre yavaş ve dönen hareketler ile çarpmalardaki ani ivme
değişimleri kawaii bulunmuştur. Bu bulgu ikincil bir alıntıdan gelir ve doğrulanmamıştır [17].

---

## 4. Türk izleyici için sıcaklık işaretleri ve tuzaklar

### 4.1 Sıcaklığı ne kuruyor?
- **"Bizden biri":** Kral Şakir'in yaratıcısı Varol Yaşaroğlu'na göre başarının alameti farikası,
  karakterlerin çok "bizden" olmasıdır. Hayvanlardan oluşan bir dünyada bile "tipik bir Türk
  ailesi" vardır. Fil Necati'nin fil olması bilinçlidir, çünkü karakter **"tonton"** bir yapıda
  olmalıdır [44]. Mizah, dersleri sıkıcı olmaktan kurtaran taşıyıcıdır. Dizi ebeveyn ve çocuğun
  birlikte izlemesi için tasarlanmıştır [44].
  **Sonuç:** Tombul ve tonton bir beden Türkçede doğrudan "sıcak" kodudur. Sıfır'ın gövdesi bu
  yüzden yuvarlak olmalıdır.
- **Keloğlan arketipi:** Saçsız, yuvarlak kafalı halk kahramanıdır. Başta tembel, beceriksiz ya da
  saf görünür; sonra zekâsıyla devleri yener. Saflığın, sevecenliğin ve doğruluğun simgesi
  sayılır [45]. **Sonuç:** "Kel ve yuvarlak kafalı, şapşik görünümlü ama aslında çok bilen" figür,
  Türk kültüründe hazır ve sevilen bir kalıptır. Sıfır bu kalıba oturur: dev sayıları bilen saf
  görünümlü bir 0. Görsel olarak Keloğlan'a gönderme yapmak gerekmez; karakterin tavrı yeterlidir.
- **Yerli animasyonun gücü:** Rafadan Tayfa 282 ilkokul öğrencisinin en sevdiği yerli çizgi film
  olarak çıkmıştır [46]. Yönetmen İsmail Fidan'a göre yurt dışı başarısının nedeni yerelde güçlü
  karşılık bulmasıdır [47].

### 4.2 Tuzaklar
1. **"OK / sıfır" el işareti yasaktır.** Başparmak ile işaret parmağıyla yapılan halka Türkiye'de
   kaba ve aşağılayıcı kabul edilir, eşcinsellere yönelik bir hakaret olarak da kullanılır [48].
   Adı "Sıfır" olan bir karakterin elleriyle "0" yapması en doğal şakadır ve tam olarak bu yüzden
   **kesinlikle yapılmamalıdır**. Çözüm: parmaksız yumru eller kullanılır ve el, kol ya da
   kuyrukla halka oluşturan hiçbir poz kurulmaz.
2. **Nah (fig) işareti:** Yumruk içinde başparmak gösteren işaret Türkiye'de kabadır [48][49].
   Parmaksız el bu sorunu da ortadan kaldırır.
3. **Nazar boncuğu çağrışımı:** Nazar boncuğu iç içe halkalardan oluşan bir göz motifidir; kem
   gözle ilişkilidir [50]. Sıfır'ın kafası zaten bir halkadır. Gözler de iç içe halka (beyaz +
   renkli iris + göz bebeği) olarak çizilirse yüz nazar boncuğu ya da hedef tahtası gibi okunur.
   Gözler **dolu ink elips** olmalıdır.
4. **Bayrak çağrışımı [öneri]:** Kırmızı zemin üstünde beyaz halka ve hilal gibi bir ağız, bayrak
   ya da siyasi bir kod gibi okunabilir. Kırmızı yalnızca allık, dil ya da küçük bir aksesuar
   olarak kullanılır. Gövdenin tamamı kırmızıyla doldurulmaz.
5. **Benzerlik ve intihal riski:** Pepee'nin Pocoyo'dan esinlenip esinlenmediği yargıya
   taşınmıştır [51]. Rafadan Tayfa hakkında da karakter benzerliği iddiasıyla suç duyurusunda
   bulunulmuştur [52]. **Sonuç:** Sıfır'ın silüeti Pocoyo, Mr. Men, Kirby ya da Molang'a
   benzetilmemelidir. Halka kafa ve fasulye gövde birleşimi ayırt edicidir. İlk poz kâğıdı bu
   karakterlerle yan yana konup kontrol edilmelidir.
6. **İsim çağrışımı:** "Pepe" Anadolu'da konuşma güçlüğü çekenler için kullanılır [53]. Benzer
   şekilde "Sıfır" kelimesi "sıfır çekmek" ya da "işe yaramaz" anlamına da gelir [öneri]. Bu
   yüzden karakter **asla aşağılanmaz** ve kimse ona "sıfırsın" demez. Şaka her zaman sayının
   büyüklüğü üzerinden kurulur ("bir sıfır ekleyince dünya değişiyor").
7. **Alay ve bölgesel aksan [öneri]:** Mizah karakterin kendi sakarlığı üzerine kurulur. İzleyiciyle,
   bir bölgeyle ya da bir aksanla dalga geçilmez.
8. **Büyük harf:** "SIFIR" yazılır (noktasız I). "SİFİR" ve "Sifir" yanlıştır (CLAUDE.md §8).

---

## 5. Tuzaklar: tekinsiz ve soğuk özellikler, düzeltmeleri

### 5.1 Tekinsizlik kaynakları [kanıt]
| Sorun | Neden | Kural |
|---|---|---|
| Geniş beyaz sklera | Korku ifadesindeki geniş göz akı, bilinçdışında bile amigdalayı daha çok etkinleştirir [12]. | Sklera yoktur. Göz dolu ink, parlama küçük ve beyazdır (kâğıt rengi #ECE5D5 değil, #FFFFFF ya da ona yakın). |
| Gerçekçilik uyumsuzluğu | Göz ve yüz arasında boyut ya da doku uyumsuzluğu karakteri özellikle tekinsiz yapar [13]. | Her öğe düz vektördür. Gölge ve doku yoktur; tek ton dolgu kullanılır. |
| Göz yüzü taşıyor | %15'ten fazla büyütmede göz yüz kenarını aşar [4]. | Göz ile kafa kenarı arasında en az 0,08 D boşluk kalır. |
| Yüksek göz | Bebek şemasında alın yüksektir (alın oranı 0,61, yetişkinde 0,48) [3]. | Göz merkezi kafa merkezinin altındadır (y = +0,08). |
| Büyük ağız | Yetişkin yüzünde ağız/yüz oranı 0,35, bebekte 0,28–0,29'dur [1][3]. | Ağız ≤ 0,16 D'dir. Diş çizilmez. |
| Kalıcı asimetri | Yüzdeki anormallikler sevimliliği düşürür; üst ve sol bölgedekiler daha çok düşürür [8]. | "Şaşı" ya da asimetrik göz yalnızca 1 sn'lik şaka olarak kullanılır, kalıcı olmaz. |
| Sivri uçlar | Sivri hatlar tehdit izlenimi verir [11]. | Bütün uçlar yuvarlaktır. |
| İnce ve uzun uzuvlar | Lorenz'e göre uzuvlar kısa ve kalın olmalıdır [1]. | Uzuv kalınlığı 0,11–0,13 D, uzunluğu ≤ 0,38 D. |
| İnsana yakınlık | Mori'ye göre ilk tepe hedeflenmelidir [14]. İnsan maskot en az sevilen türdür [5]. | Burun, kulak, saç, parmak yoktur. |

### 5.2 Daire kafalı çubuk adam neden soğuk görünür? [öneri, kaynaklardan sentez]
1. **Kütle yoktur.** Lorenz'in "tombul gövde, kısa ve kalın uzuv" koşulları sağlanmaz [1]. Silüet
   deneyinde sevimliliği büyük ölçüde beden biçimi belirler [6].
2. **İnce ve eşit kalınlıktaki çizgi diyagram gibi okunur.** McCloud'un ölçeğinde bu tür bir çizim
   "ikonik yüz" köşesinden "soyut" köşeye kayar. Özdeşleşme ise ikonik yüzde en güçlüdür [29].
3. **Ağırlık ve temas yoktur.** Çubuk ayak zemine bir noktada değer; karakter havada asılı gibi
   durur.
4. **Boş daire içinde küçük yüz:** Yüz kafanın küçük bir bölümünü kaplarsa göz/yüz oranı düşer ve
   bebek şeması zayıflar [1][5].

**Düzeltmeler (minimal vektörden ayrılmadan):**
- Gövde dolu bir fasulye şekli olur, çubuk olmaz. Mr. Men dersi şudur: çubuk uzuv ancak dolgun bir
  gövdeye takılınca sıcak durur [32].
- Uzuvlar kalın ve yuvarlak uçlu stroke'lardır (0,11–0,13 D). Bu, dış hattın iki katıdır.
- Ayaklar elips biçimindedir ve zemine yüzeyle basar. Altına hap biçiminde bir temas gölgesi konur
  (graphite, %25) [23].
- Gözler büyüktür (0,15 × 0,19 D) ve parlama noktalıdır. Allık eklenir.
- Kafa halkası tipografik bir 0 gibi kalınlık kontrastlı çizilir. Böylece "teknik çizim" estetiği
  korunur, ama karakter diyagram gibi değil glif gibi okunur.
- Nefes ve göz kırpma sürekli çalışır. Karakter hiçbir zaman tamamen donmaz.

---

## 6. Allık ve palet kararı

- Bebek şemasında "tombul yanak" vardır [1]. Yanaklardaki kızarıklık ise yetişkin yüzlerinde
  çekicilik ve sağlıklı görünüm algısını artırmıştır (bebek yüzlerinde doğrudan test edilmemiştir)
  [54]. Pikachu, Kirby ve Molang'ın allığı da bu işlevi görür [gözlem].
- **Karar [öneri]: Allık kabul edilebilir ve önerilir.** Yeni bir renk eklenmez; vurgu kırmızısı
  #E0391C düşük opaklıkla kullanılır. Böylece "tek vurgu rengi" kuralı bozulmaz.
  - %25 opaklıkta kâğıt üstündeki karışım ≈ **#E9BAA7** olur. Hesap: 0,25·(224,57,28) +
    0,75·(236,229,213) = (233, 186, 167).
  - %35 (mutlu ya da utangaç anlar) ≈ #E6A894.
  - Yumuşak kenar için radyal gradyan kullanılır: merkezde opaklık %100, kenarda %0; ya da
    0,02 D'lik bulanıklık. Allığın çizgisi yoktur.
  - **Çakışma kuralı:** Kırmızı, videoda "önemli sayı" vurgusudur. Allık soluk olduğu için onunla
    yarışmaz. Ancak Sıfır kırmızı bir rakamın hemen yanındaysa allık %15'e indirilir.
- Dil (gülme anında): #E0391C %60 opaklıkta, küçük bir yarım elips.
- Gövde dolgusu: kâğıdın %4 koyusu, ≈ #E2DACA. Bu da yeni bir renk değil, kâğıdın tonudur. Kafa
  içi kâğıt rengidir (#ECE5D5). Böylece kafa "0" glifi olarak öne çıkar.
- Toplam: ink, kâğıt (+ ton), graphite (gölge, "z" harfleri) ve kırmızı (allık, dil). Bu 4 renk,
  sevilen minimal karakterlerin 2–4 renk aralığındadır [gözlem, §2].

---

## 7. Üç tasarım yönü

### A. "Büyük 0, minik uzuvlar" (Mr. Men tarzı)
Kafa = gövde: tek bir 0 halkası, D = 1. Altında iki kısa bacak (0,30 D), halkanın yanlarından çıkan
iki kol vardır. Toplam boy ≈ 1,4 D.
- **Artı:** "0" kimliği en güçlü bu yöndedir. Rig en basit olanıdır. Halkanın içi sahnede sayı ya
  da grafik taşıyabilir.
- **Eksi:** Gövde kütlesi yoktur, bu yüzden çubuk adam soğukluğu riski en yüksektir (§5.2). Mr. Men
  ve Pocoyo'ya benzeme riski vardır [32][51]. Kafadan çıkan kollar poz verirken tuhaf durur.
  Nefes ve squash yalnızca kafada yapılabilir, bu da glifi bozar.

### B. "Fasulye gövde" — ÖNERİLEN
Kafa bir 0 halkasıdır (D = 1). Altında fasulye gövde (0,66 × 0,62 D) ve kısa, kalın bacaklar
vardır. Toplam boy 2,0 D.
- **Artı:** En çok beğenilen 1:2 oranını yakalar (6,49/7) [5]. Gövde nefes ve squash taşır; kafa
  ise okunur kalır. Pikachu dersine uyar: oyunculuk için gövde ile kafa ayrılmalıdır [22]. Sıfır'ın
  işi sayı göstermek, işaret etmek ve dev prop'ları taşımaktır; bunlar için kol ve omuz gerekir.
  Tonton gövde Türkçede doğrudan sıcaklık kodudur [44].
- **Eksi:** Parça sayısı artar (kafa, gövde, 2 kol, 2 bacak). Gövde kafayla yarışmamalıdır; bu
  yüzden gövde boyu ≤ 0,65 D tutulur ve dolgusu kâğıttan biraz koyu yapılır. Dikkat edilmezse
  kardan adam gibi görünebilir. Bunu önlemek için gövde fasulye biçiminde (altı geniş) ve hafif
  asimetrik çizilir; kafa da gövdeye 0,10 D gömülür.

### C. "Yuvarlak damla" (Kirby / Molang tarzı)
Kafa ve gövde tek bir yumurtadır (1,0 × 1,15 D). Yüz üst yarıdadır. Yumru kollar ve oval ayaklar
vardır. Toplam boy ≈ 1,2 D.
- **Artı:** En "peluş" ve sevimli seçenektir. Squash ve stretch en iyi bu yönde çalışır. Sevilen
  blob karakterlerin (Kirby, Sumikko, Headspace) dilini kullanır [21][27][31].
- **Eksi:** "0" glifi kaybolur; yumurta sıfır gibi değil, yumurta gibi okunur. İşaret etme ve
  gösterme zorlaşır. Molang ve Sumikko'ya benzeme riski vardır. "Teknik çizim" estetiğinden en
  uzak seçenektir.

**Öneri: B.** A'nın kalınlık kontrastlı halka kafasıyla birlikte kullanılır. A, gerektiğinde
"sadece kafa" varyantı olarak (profil fotoğrafı, avatar, küçük ikon) aynı fonksiyondan
`pose.body = false` ile üretilir.

---

## 8. Uygulanabilir şartname (B yönü)

### 8.1 Karakter kartı (dondurulmuş)
```js
const SIFIR_CARD = {
  unit: 'D',                       // kafa çapı = 1
  totalHeight: 2.0,
  head: { r: 0.50, innerRx: 0.435, innerRy: 0.45, fill: '#ECE5D5', ink: '#1C1B18' },
  body: { w: 0.66, h: 0.62, topY: 0.40, fill: '#E2DACA', stroke: 0.055,
          shape: 'bean' /* üst genişlik %86, alt %100, yan kenarlar dışa kavisli */ },
  arm:  { shoulderX: 0.30, shoulderY: 0.55, upper: 0.20, fore: 0.18, thick: 0.11, hand: 0.13 },
  leg:  { hipX: 0.11, hipY: 0.95, len: 0.32, thick: 0.13, foot: { w: 0.20, h: 0.11 } },
  eye:  { w: 0.15, h: 0.19, x: 0.19, y: 0.08,
          hl1: { d: 0.06, dx: 0.03, dy: -0.045 }, hl2: { d: 0.025, dx: -0.03, dy: 0.05 },
          hlColor: '#FFFFFF' },
  mouth:{ x: 0, y: 0.25, stroke: 0.03 },
  blush:{ w: 0.15, h: 0.08, x: 0.31, y: 0.22, color: '#E0391C', alpha: 0.25 },
  brow: { w: 0.10, y: -0.10, stroke: 0.025 },   // yalnızca bazı ifadelerde
  shadow:{ w: 0.70, h: 0.07, color: '#8B8577', alpha: 0.25 },  // hap biçimi
  stroke: { outline: 0.055, limb: 0.12, mouth: 0.03, cap: 'round', join: 'round' },
};
// drawSifir(ctx, card, pose, t). Poz alanları: headTilt, bodyLean, armL[2], armR[2], legL, legR,
// squash, eyeOpen, gaze{x,y}, expression, blushAlpha.
```

Yerleşim notu [öneri]: 1080×1920 karede D = 240–300 px olur. Böylece Sıfır 480–600 px boyunda
olur ve güvenli alanın (x 90–920) yaklaşık yarısını kaplar. Telefon testinde (360 px genişlik)
D = 80–100 px olur. Bu durumda ağız çizgisi 2,4–3 px kalır, yani sınırdadır. Bu yüzden D < 240 px
olduğunda ağız ve kaş kalınlığının alt sınırı 7 px'tir.

### 8.2 Altı ifade
Koordinatlar D cinsindendir ve kafa merkezine göredir.

| İfade | Gözler | Ağız | Ek |
|---|---|---|---|
| **Nötr** | Normal elips, parlama 2 nokta | Küçük gülüş yayı: en 0,10, derinlik 0,025 | Allık %25 |
| **Mutlu** | "^ ^" kapalı kavisler: en 0,16, yükseklik 0,07, stroke 0,045 | Açık "D": yarım elips, en 0,16, derinlik 0,09, ink dolgu. Dil: 0,07 × 0,035, kırmızı %60 | Allık %35, gövde +%4 stretch, kafa 6° eğik |
| **Şaşkın** | 1,12× büyür, 0,02 yukarı kayar | **Küçük "o"**: elips 0,07 × 0,09, ink dolgu (kafadaki 0'ın yankısı) | Kaşlar 0,04 yukarı kalkar; gövde %6–12 stretch (take) |
| **Düşünceli** | Bakış sağ üste: göz 0,02 kayar, parlama yerinde kalır | Düz çizgi, en 0,08, x = +0,04'e kayık, 8° eğik | Tek kaş kalkık; kafa 12° eğik; el yumrusu çene altında |
| **Uykulu** | Göz kapağı %50: elipsin üst yarısı yatay bir çizgiyle kesilir | Minik "o" (0,04) ya da gevşek kısa çizgi | Kafa 6° düşük; 1,2 sn'lik yavaş kırpma döngüsü; graphite "z" |
| **Yorgun** | Göz kapağı %60, kapak çizgisi dışa doğru 10° aşağı eğik | Dalgalı çizgi: en 0,12, 2 tepe, genlik 0,012 | Omuzlar düşük (kollar içe 8°); gövde %4 squash; nefes periyodu 4,5 sn ve genliği 1,5× |

İfade geçişleri durum değişimi eğrisiyle yapılır. Göz ve ağız şekilleri arasında 120–180 ms'lik
ara değerleme (morph) yapılır. Sert kesme yalnızca "take" pop'unda kullanılır.

### 8.3 Hareket kuralları (özet)
- **Boşta:** Nefes (3,6 sn; +%2 / −%1), göz kırpma (2,5–5,5 sn) ve 6–10 sn'de bir bakış kayması
  (0,025 D, 120 ms, en az 600 ms tutulur). Sallanma ve salınım yoktur.
- **Okunacak metin ekrandayken:** Yalnızca nefes ve göz kırpma devam eder. Sıfır metne bakar
  (göz metne doğru kayar); bu bir yönlendirme işlevi görür.
- **Kafa eğme:** 10–14°, 500–800 ms, karakterin sağına doğru [16]. Ardından en az 1 sn tutulur.
- **Zıplama, şaşırma, yürüyüş:** §3.7 ve §3.8'deki değerler kullanılır.
- **Yay:** Karakter gövdesi için 200/18 (≈%7 aşma) kullanılır. Kafa gövdeyi 2 kare geriden izler.
  Kamera ve yazı CLAUDE.md'deki ön ayarlarla kalır.
- **Sakarlık:** Videoda en fazla 1 kez ve yetkinlik kurulduktan sonra yapılır [43].
- **Determinizm:** Göz kırpma ve bakış zamanları mulberry32 ile tohumlanır. Tohum her video için
  sabittir ve olaylar `render(t)` içinde t'nin saf fonksiyonu olarak çıkarılır (CLAUDE.md §1).

### 8.4 Poz kâğıdı kontrol listesi (kullanmadan önce)
- Önden ve 3/4 görünüş; 6 ifade; yürüyüşün 8 karesi; zıplamanın 5 anahtar karesi.
- 360 px telefon testi: ifadeler hâlâ ayırt edilebiliyor mu?
- Pocoyo, Mr. Men, Kirby ve Molang ile yan yana silüet kontrolü (§4.2-5).
- Hiçbir pozda el, kol ya da bacakla halka oluşmadığı kontrol edilir (§4.2-1).
- Siyah dolu silüet testi: Sıfır yalnızca silüetinden tanınıyor mu? [24]

---

## Kaynaklar

1. Glocker ve ark. (2009), Ethology 115(3): "Baby Schema in Infant Faces Induces Cuteness Perception and Motivation for Caretaking in Adults". https://pmc.ncbi.nlm.nih.gov/articles/PMC3260535/
2. Glocker ve ark. (2009), PNAS: "Baby schema modulates the brain reward system in nulliparous women". https://www.cceb.upenn.edu/csa/assets/user-content/documents/PNAS-2009-Glocker.pdf
3. Borgi ve ark. (2014), Frontiers in Psychology 5:411. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00411/full
4. Yao ve ark. (2022), "Eye Size Affects Cuteness in Different Facial Expressions and Ages", Frontiers in Psychology. https://www.frontiersin.org/articles/10.3389/fpsyg.2021.674456/full
5. Chen & Lin (2026), "Visual attention and subjective preference in mascot design", Frontiers in Psychology 17:1748647. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1748647/full
6. "The Relative Contribution of Facial and Body Information to the Perception of Cuteness". https://pmc.ncbi.nlm.nih.gov/articles/PMC10813407/
7. He ve ark. (2025), "Social Perception of Illusory Faces", Behavioral Sciences. https://pmc.ncbi.nlm.nih.gov/articles/PMC12292536/
8. Lewis ve ark. (2017), "The impact of facial abnormalities and their spatial position on perception of cuteness and attractiveness of infant faces", PLoS ONE. https://pmc.ncbi.nlm.nih.gov/articles/PMC5531456/
9. Chen & Jia (2023), "Research on the influence of the baby schema effect on the cuteness and trustworthiness of social robot faces". https://journals.sagepub.com/doi/full/10.1177/17298806231168486
10. Lieber-Milo ve ark. (2024), "Cuteness in avatar design: a cross-cultural study", AI & Society. https://link.springer.com/article/10.1007/s00146-024-01878-3 ve https://keio.elsevierpure.com/ja/publications/cuteness-in-avatar-design-a-cross-cultural-study-on-the-influence-2/
11. Bar & Neta (2006/2007): kavisli nesne tercihi ve sivri nesnelere amigdala yanıtı. https://canlab.unl.edu/sites/unl.edu.cas.psychology.cognitive-and-affective-neuroscience/files/media/file/BarNetaNeuropsych2007.pdf ve https://www.nmr.mgh.harvard.edu/node/882
12. Whalen ve ark. (2004), Science 306:2061: korkulu göz akına amigdala yanıtı. https://mindhacks.com/2005/01/07/eyes-wide-with-fear/ ve https://www.nbcnews.com/id/wbna6719954
13. MacDorman ve ark. (2009), "Too real for comfort?", Computers in Human Behavior. https://scholarworks.indianapolis.iu.edu/items/e8fb6458-ddad-4067-b877-1207d720ba0c ve https://newsinfo.iu.edu/news/email/normal/11945.html
14. Mori, "The Uncanny Valley" (1970; IEEE Spectrum çevirisi, 2012). https://spectrum.ieee.org/the-uncanny-valley
15. Mara & Appel, "Effects of lateral head tilt on user perceptions of humanoid and android robots". https://www.rlp-forschung.de/public/facilities/333/publications/79948 ve https://www.nextgov.com/artificial-intelligence/2015/01/scientists-now-know-how-make-robots-less-creepy-looking/103620/
16. "The Feeling of Kawaii toward a Robot's Head-Tilting Motion: Effects of Speed, Direction, and Accompanying Hand Gestures", IEEE. https://ieeexplore.ieee.org/document/10731446/ (bulgu, arama özetindeki özetten alınmıştır; tam metin okunamadı)
17. Seaborn ve ark., "Kawaii Computing" (literatür taraması, 2024). https://arxiv.org/html/2405.08244v1 ve Sugano & Tomiyama, "Kawaii-ness in Motion". https://link.springer.com/chapter/10.1007/978-981-13-7964-2_4
18. Humphrey ve ark. (2020), Scientific Reports 10:16503: kedi yavaş kırpması. https://www.sciencedaily.com/releases/2020/10/201007123031.htm ve https://researchportal.port.ac.uk/en/publications/the-role-of-cat-eye-narrowing-movements-in-cat-human-communicatio/
19. Göz kırpma süresi (100–400 ms; UCL 100–150 ms). https://en.wikipedia.org/wiki/Blinking
20. Wascher ve ark., "Eye-blinks in choice response tasks uncover hidden aspects of information processing" (≈14 kırpma/dk). https://pmc.ncbi.nlm.nih.gov/articles/PMC4849103
21. Kirby (karakter). https://en.wikipedia.org/wiki/Kirby_(character)
22. Pikachu'nun daifuku kökeni ve anime için inceltilmesi. https://en.wikipedia.org/wiki/Pikachu ve https://nintendowire.com/news/2020/01/08/according-to-original-pokemon-artist-fat-pikachu-originally-based-on-japanese-sweet/
23. Duolingo tasarım kılavuzu, illüstrasyon ve karakterler (arama özetlerinden; sayfa artık blog'a yönleniyor). https://design.duolingo.com/illustration ve https://design.duolingo.com/illustration/characters
24. Duolingo, "Reshaping Duo". https://blog.duolingo.com/reshaping-duo/
25. Design Week, "Duolingo owl receives makeover" (2019). https://www.designweek.co.uk/issues/2-6-january-2019/duolingo-owl-receives-makeover-as-app-becomes-more-gamified
26. Duolingo, "Shape language: Duolingo's art style". https://blog.duolingo.com/shape-language-duolingos-art-style/
27. Headspace tasarım analizi (resmî değil). https://blakecrosley.com/fr/guides/design/headspace ve Fast Company röportajı: https://www.fastcompany.com/90238586/how-headspace-rebranded-meditation
28. Hello Kitty (Sanrio'nun ağızsızlık açıklaması). https://en.wikipedia.org/wiki/Hello_Kitty ve https://www.looper.com/288638/the-untold-truth-of-hello-kitty/
29. McCloud, *Understanding Comics*: maske etkisi, sadeleştirerek güçlendirme. https://en.wikipedia.org/wiki/Masking_(comics) ve https://en.wikipedia.org/wiki/Understanding_Comics
30. Rilakkuma, Aki Kondo'nun "biraz yersiz" duruş açıklaması. https://features.japantimes.co.jp/rilakkuma/ ve https://yumetwins.com/blog/rilakkuma-too-cute-to-bear
31. Sumikko Gurashi. https://en.wikipedia.org/wiki/Sumikko_Gurashi ve https://yumetwins.com/blog/summikkogurashi-cute-relatable-san-x-japanese-characters
32. Roger Hargreaves / Mr. Men. https://en.wikipedia.org/wiki/Roger_Hargreaves ve https://upgrade.lambiek.net/artists/h/hargreaves_roger.htm
33. Normal solunum hızı (yetişkin 12–20/dk). https://www.healthline.com/health/normal-respiratory-rate ve https://acibademinternational.com/blog/normal-respiratory-rate-by-age-adults-children-and-when-breathing-speed-is-a-warning-sign/
34. Boşta animasyon: nefes temeli, "neredeyse görünmez". https://blog.animschool.edu/2024/06/14/breathing-life-into-idle-animations ve https://mocaponline.com/blogs/mocap-news/idle-animation-design-guide ve https://itch.io/t/2489389/pixel-tutorial-hero-idle-animation
35. Animation Mentor: nefeste parçalar arası zaman kaydırma. https://www.animationmentor.com/?p=87282
36. Kırpma kare sayıları: https://tips.clip-studio.com/en-us/articles/2643 ve https://community.adobe.com/questions-571/faster-cycling-for-blinks-251525
37. Duolingo tarzı Rive kurulumu (üçüncü taraf). https://dev.to/uianimation/bringing-characters-to-life-with-rive-duolingo-style-animation-for-apps-16j7 ve Duolingo viseme yazısı: https://blog.duolingo.com/world-character-visemes
38. Squash & stretch (SIGGRAPH Education). https://education.siggraph.hosting.acm.org/static/HyperGraph/animation/character_animation/principles/squash_and_stretch.htm
39. Squash & stretch, hacim koruma. https://blog.cg-wire.com/squash-stretch-principle ve https://learn.toonboom.com/modules/animation-principles/topic/squash-and-stretch-principle?c=20
40. School of Motion, "How to animate character takes". https://www.schoolofmotion.com/blog/how-to-animate-character-takes
41. Yürüyüş temposu "12'lerde", 8'lik ve 16'lık döngüler. https://blog.animschool.edu/?p=588 ve https://brianlemay.com/Pages/animationschool/animation/1stsemesteranimation/walks/walkcycle1a.html
42. Monmouth, "Movement: Walk Cycle" (Williams'tan uyarlanmıştır). https://animation.monmouth.edu/instruct/?p=351
43. Pratfall etkisi (Aronson ve ark. 1966). https://en.wikipedia.org/wiki/Pratfall_effect ve https://www.simplypsychology.com/articles/pratfall-effect-psychology
44. Habertürk, Varol Yaşaroğlu röportajı, "Bizden biri ama evrensel oldu". https://www.haberturk.com/bizden-biri-ama-evrensel-oldu-2526929
45. Keloğlan'ın özellikleri. https://www.egitimsistem.com/turk-masal-kahramanlari-kimlerdir-ve-ozellikleri-nelerdir-45557h.htm ve https://dergipark.org.tr/tr/download/article-file/5778069
46. İnönü Üniversitesi, "Değerlerin öğretiminde çizgi filmler: Rafadan Tayfa örneği". https://abakus.inonu.edu.tr/items/e2e49032-3357-4d10-af58-2109bbf3a4b3/full
47. İsmail Fidan söyleşisi (DPÜ GSF). https://birimler.dpu.edu.tr/app/views/panel/ckfinder/userfiles/7/files/GSF-soylesi-acilis-dersi-2024(1).pdf ve https://en.wikipedia.org/wiki/Rafadan_Tayfa
48. Wikivoyage, "Gestures" (OK işareti ve fig Türkiye'de saldırgan). https://en.wikivoyage.org/wiki/Gestures ve https://trykaiwa.com/blog/turkish-cultural-gestures-body-language-realistic
49. Matador Network, fig işareti. https://matadornetwork.com/abroad/5-common-american-gestures-that-might-insult-the-locals/
50. Nazar ve nazarlık. https://turkoloji.cu.edu.tr/HALKBILIM/nilgun_ciblak_nazarlik.pdf ve https://crees.ku.edu/nazar
51. Pepee ve Pocoyo davası (Sözcü köşe yazısı). https://www.sozcu.com.tr/pepee-issiz-kaldi-wp390133
52. Rafadan Tayfa benzerlik iddiası. https://cnnturk.com/turkiye/pepeden-sonra-rafadan-tayfaya-mahkeme-yolu-gorundu-672155
53. "Pepe" adının anlamı (Ayşe Şule Bilgiç). https://www.kariyer.net/kariyer-rehberi/?p=936
54. Yüz kızarıklığı ve çekicilik. https://pubmed.ncbi.nlm.nih.gov/33855931/ ve https://research-repository.st-andrews.ac.uk/bitstream/handle/10023/9349/PerceptionMS_fnal_accepted.pdf?sequence=1

### Doğrulanamayanlar ve sınırlar
- Sternglanz ve ark. (1977) göz konumu deneyinin tam metnine ulaşılamadı. "Göz yüzün ortasında ya
  da altında" kuralı bebek şeması literatürüne ve uygulamaya dayanır; göz yüksekliğini tek başına
  değiştiren kontrollü bir çizgi film çalışması bulunamadı.
- Duolingo'nun resmî göz kırpma ve ifade süreleri yayımlanmamıştır. §3.3'teki 2–5 sn değeri
  üçüncü taraf bir öneridir.
- §2'deki karakter ölçüleri göz kararıdır.
- Kafa eğme hızı çalışması [16] yalnızca özetten okunmuştur.
- Türk izleyicinin sevimlilik algısını ölçen bir çalışma bulunamadı. §4 kültürel kaynaklara ve
  yaratıcı beyanlarına dayanır. İlk yayınlardan sonra Instagram'da iki varyantla (allık %25'e
  karşı %0, göz 0,19'a karşı 0,15 D) küçük bir A/B testi yapılması önerilir.

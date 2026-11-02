# Hangisi daha şaşırtıcı? · Hikâye kitabı (2 Kasım 2026)

Kullanıcının notu: "Çok hızlı geçiyorsun, olayın etkisine giremiyorum. Hep bir adam, bir kadın deniyor ama hiç karakter çizilmiyor. Olayları basite indirgeme, etkileyici bir hikâye olarak sun."

Bu belge her filmin hikâyesini, karakterlerini ve anlatımını videoya geçmeden önce oturtur. Render ve video işi, kullanıcı "yap" deyince başlar. Her ayrıntının kaynağı dört ayrı araştırma notunda (2 Kasım) duruyor; tartışmalı olanlar her filmin sonunda "kaçınılanlar" altında yazılı.

## Ortak kurallar

### 1. Tempo
- Film 64–72 sn sürer (eskiden 40–50 sn). Ek süre yeni bilgiye değil, olayların içinde kalmaya gider.
- Anlatım hızı +0–4 % olur (eskiden +12 %). En dramatik cümleler −4 % ile okunur.
- Her vuruş ekranda en az 3,5 sn kalır. Önemli bir cümleden sonra 0,6–1,2 sn yalnızca görüntü ve ses kalır.
- Her hikâyenin en zor anında (buzun altında, düşerken, karanlıkta) anlatım 1–2 sn susar.

### 2. Yapı
| Bölüm | Süre | Ne olur |
|---|---|---|
| Soğuk açılış | 0–4 sn | A hikâyesinin en sarsıcı anının ortasından başlar. "Hangisi daha şaşırtıcı?" yalnızca ekranda başlık olarak durur. |
| A hikâyesi | 4–30 sn | 5 vuruş: kim, ne istiyordu, ne oldu, en kötü an, dönüm. |
| Köprü | 30–33 sn | Tek cümle, B'ye bağlar. |
| B hikâyesi | 33–56 sn | 5 vuruş, aynı yapı. |
| Yüzleştirme | 56–66 sn | Soru, 1 sn gerçek sessizlik, iki sayı ya da iki imge yan yana; filmin tek büyük vuruşu. |
| Soru | 66–70 sn | "Sen hangisine şaşırdın? Yoruma yaz." ve TAKİP ET. |

### 3. Karakterler
- Her kahramanın donmuş bir karakter kartı olur (CLAUDE.md §6): baş = 1 birim oranlar, hex palet, giysi, imza ayrıntısı.
- Tek bir `drawCharacter(card, pose, t)` işlevi bütün karakterleri 3B stilize figür olarak çizer: eklem açılarıyla poz, basit hacimler, göz, kaş ve ağızla ifade. Fotoğraf benzerliği aranmaz; kimliği yaş, giysi ve imza ayrıntısı taşır.
- Hayvan kahramanlar da (köpekbalığı, balina, kaplumbağa) kartla tanımlanır ve tek bir modelle çizilir.
- Videodan önce her karakterin poz kâğıdı hazırlanır: önden ve yandan görünüş, 6 ifade, yürüme döngüsü.

### 4. Dil
- "Düştü, yaralandı" gibi özet yok. Duyusal ayrıntı (ses, soğuk, saat, ne gördü, ne dedi) ve kişinin ne yaptığı anlatılır.
- Cümleler tam ve devriksiz Türkçedir; zaman kipi film boyunca tutarlıdır (di'li geçmiş).
- Kişinin kendi anlatımına dayanan ayrıntılar "kendi anlattığına göre" diye işaretlenir.

---

## № 041 · Hiç oynamayan futbolcu ve hiç bırakmayan futbolcu · 4 Kasım

**Logline:** Biri 13 yıl futbolcu gibi yaşadı ama hiç maça çıkmadı; öbürü 15 yaşında tek başına okyanusu aştı ve 59 yaşında hâlâ oynuyor.
**Akılda kalacak tek şey:** sıfır maç ile 911 maç aynı sahada.

**Karakterler**
- **Carlos Kaiser (1980'ler):**
  - Yapı: 7,6 baş, geniş göğüs.
  - Saç ve yüz: kıvırcık, ensesi uzun saç (Renato Gaúcho tarzı); yan yan gülen bir yüz.
  - Giysi ve eşya: antrenman şortu, açık ceket; elinde iri bir "cep telefonu".
  - Palet: ten `#B9825A`, saç `#2A1C14`.
- **Kazu Miura, 15 yaşında (1982):**
  - Yapı: 6,6 baş, ince ve küçük.
  - Saç: kısa siyah okul tıraşı.
  - Giysi ve eşya: lacivert okul ceketi `#1F2A44`, kahverengi deri bavul `#6B4329`.
  - Palet: ten `#E3BE96`.
- **Kazu Miura, 59 yaşında (2026):**
  - Yapı: 7,2 baş, zayıf ve dik.
  - Saç: kısa gri `#B9B9B6`.
  - Giysi: 11 numaralı forma.
  - İmza: köşe bayrağında samba adımı (Kazu dansı).

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Takım iki sıfır geride. Patron telsize bağırıyor: "Kaiser'i oyuna sokun!" | Gece, Bangu tribünü; yedek kulübesinde Kaiser yavaşça başını kaldırır. Başlık. |
| 1 | 4–11 | Carlos Kaiser, Brezilya'nın en büyük kulüplerine imza atmış bir golcüydü. Tek bir sorunu vardı: futbol oynamak istemiyordu. | Beş formalık askı; Kaiser her birinin önünden geçerken göz kırpar. |
| 2 | 11–18 | Her kulüpte önce haftalarca kondisyon çalıştı. Top ayağına gelince arka adalesini tutup yere yığıldı. O yıllarda kimse bunun numara olduğunu kanıtlayamazdı. | Antrenman: top gelir, yavaş çekimde düşüş, doktor koşar. |
| 3 | 18–24 | Soyunma odasında elinde bir telefonla, yabancı kulüplerle pazarlık ediyormuş gibi bağırırdı. Bir gün telefonun oyuncak olduğu ortaya çıktı. | Telefon yere düşer, plastik kapak açılır, içi boştur. |
| 4 | 24–33 | Sonunda patron onu oyuna soktu. Kaiser ısınırken tribüne döndü, tel örgüyü aştı ve taraftarlarla kavgaya girdi. Hakem onu sahaya bile girmeden oyundan attı. | Kaiser tel örgüye tırmanır; kırmızı kart havada döner. *1 sn durak.* |
| 5 | 33–37 | Patrona şunu söyledi: "Size hırsız diyorlardı, ben de sizi savundum." Sözleşmesi altı ay uzatıldı. | Masum bir yüz; kalem imzaya iner. |
| köprü | 37–40 | Aynı yıllarda Japonya'da on beş yaşında bir çocuk tam tersini yapıyordu. | Shizuoka, sabah; bir kapı açılır. |
| 6 | 40–46 | Kazu Miura okulu bıraktı. Cebinde yedi yüz dolarla, tek başına, dilini bilmediği Brezilya'ya uçtu. | Küçük Kazu dev bavuluyla havaalanında; uçağın camından okyanus. |
| 7 | 46–53 | İlk üç yıl çok zordu. Evini özledi; tribünler ona adıyla değil, nereli olduğuyla seslendi. Bir penaltıdan sonra kalabalık ilk kez adını haykırdı: "Kazu!" | Yurtta yağmurlu bir cam; sonra gol ve tribünün ayağa kalkışı. |
| 8 | 53–57 | Bugün elli dokuz yaşında ve hâlâ sahada. Bu yıl gol bile attı. | Gri saçlı Kazu köşe bayrağında dans eder. |
| yüz | 57–65 | Peki ikisinin resmî maç sayısı ne? *(1 sn sessizlik)* Kaiser'inki sıfır. Kazu'nunki dokuz yüz on bir. | İki karakter aynı sahada sırt sırta durur. Kaiser'in önünde hiç vurulmamış tek top var; Kazu'nun arkasına 911 top yağar. |
| soru | 65–69 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Kaçınılanlar:**
- Arjantin ve Korsika transferleri; "26 yıllık kariyer"; "Kaiser" adının kökeni.
- Telefonun hangi kulüpte ortaya çıktığı tartışmalı, bu yüzden kulüp adı verilmez.
- Kaiser'in hikâyesinin çoğu kendi anlatımıdır; açıklamada bu belirtilir.

**Kaynaklar:** Wikipedia (Carlos Kaiser; Kazuyoshi Miura; ja), WSC, FIFA, Kuwait Times (25.07.2026), Khaleej Times (19.08.2026), Reuters (25.06.2026).

---

## № 060 · Buzun altındaki doktor ve hücredeki mahkûm · 5 Kasım

**Logline:** Biri buzun altında donarken kalbi iki buçuk saatten fazla durdu ve yeniden attı; öbürü bütün bir kenti yakan bulutu taş bir hücrede atlattı.
**Akılda kalacak tek şey:** aynı termometre önce 13,7 °C'ye iniyor, sonra yaklaşık 400 °C'de patlıyor.

**Karakterler**
- **Anna Bågenholm (29, Mayıs 1999):**
  - Yapı: 7,4 baş, atletik bir kayakçı.
  - Saç: açık sarı `#E2C27A`, at kuyruğu.
  - Giysi: kırmızı kayak montu `#C8323A`, beyaz bere, kayaklar.
  - İmza: buzun üstünde kalan iki kayak ucu.
- **Ludger Sylbaris (27, Mayıs 1902):**
  - Yapı: 7,8 baş, iri ve geniş omuzlu ("Samson" lakabı buradan geliyor).
  - Saç: kısa kıvırcık.
  - Giysi: beyaz keten gömlek `#E8E0CF`, yalınayak.
  - Palet: ten `#5A3A26`.
  - İmza: kapının ızgarasından bakan gözler; sonra kollarında yanık izleri.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Buzun altında, başı aşağıda, nefes alacak bir boşluk arıyor. | Buzun altından bakış: Anna'nın elleri buza dayalı, yukarıda iki kayak ucu. Başlık. |
| 1 | 4–11 | Mayıs 1999, Norveç. Genç doktor Anna Bågenholm, işten sonra iki arkadaşıyla kayağa çıktı. | Akşam ışığında karlı vadi; üç kayakçı, en önde gülen Anna. |
| 2 | 11–18 | Dik bir yamaçta dengesini kaybetti ve baş aşağı, donmuş bir derenin buzuna çarptı. Buz kırıldı. | Yavaş çekim: buz çatlar, Anna kaybolur, dışarıda yalnız kayakları kalır. *0,8 sn durak.* |
| 3 | 18–27 | Arkadaşları kayaklarından tuttu ama onu çıkaramadı. Anna buzun altında küçük bir hava cebi buldu ve kırk dakika orada nefes aldı. | Üstte iki arkadaş kayakları tutar; altta hava cebindeki yüz ve kabarcıklar. *1 sn durak.* |
| 4 | 27–33 | Sonra kıpırdamaz oldu. Sudan çıkarıldığında nabzı yoktu. Vücudu on üç virgül yedi dereceye inmişti. | Helikopter ışığı; EKG düz çizgi; sayaç 37'den 13,7'ye iner. |
| 5 | 33–39 | Doktorlar pes etmedi: "Isınmadan ölü sayılmaz." Kalbi iki buçuk saatten uzun süre durduktan sonra yeniden attı. | Makine kanı ısıtır; EKG'de ilk vuruş. |
| köprü | 39–42 | Ondan doksan yedi yıl önce, okyanusun öbür yakasında başka biri de imkânsızı yaşadı. | Tropik bir sabah, Saint-Pierre. |
| 6 | 42–48 | Mayıs 1902, Martinik. Ludger Sylbaris, bir kavga yüzünden penceresiz, taş bir hücreye kapatılmıştı. | Kapıdaki dar ızgaradan sabah ışığı; Ludger duvara yaslanmış. |
| 7 | 48–54 | Sabah sekize doğru yanardağ patladı. Kızgın bir kül bulutu bir dakikadan kısa sürede bütün kenti yuttu. | Denizden kent; dağdan inen turuncu bulut; ışık birden söner. *1 sn durak.* |
| 8 | 54–60 | Izgaradan içeri yakıcı hava doldu. Ludger yanıklar içinde, üç gün boyunca yıkıntının altında bağırdı. Sonunda biri onu duydu. | Karanlık hücre ve korlar; dışarıda kurtarıcılar ızgarayı açar, ışık girer. |
| yüz | 60–68 | Peki ikisini aynı termometreye koyarsak? *(1 sn sessizlik)* Anna'nın vücudu on üç virgül yedi dereceye indi. Hücrenin dışındaki bulut ise tahminen dört yüz dereceye yakındı. | Aynı termometre önce karda kırağılanır, sonra hücre duvarında tırmanıp patlar. |
| soru | 68–72 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Eski filme göre düzeltmeler:**
- Ölü sayısı yaklaşık 28–30 bindir ve "tek kurtulan" denmez.
- Ludger 3 gün sonra, 11 Mayıs'ta bulundu.
- Anna için "dünyadaki en düşük sıcaklık" denmez; 2020'de 11,8 °C'den kurtulan bir çocuk var.

**Kaynaklar:** Wikipedia (Anna Bågenholm; Ludger Sylbaris), Gilbert ve ark. (The Lancet, 2000), ScienceAlert, EARTH Magazine.

---

## № 035 · Dağı yaran adam ve yerin altındaki 33 kişi · 6 Kasım

**Logline:** Biri karısını kaybettiği sırtı 22 yıl boyunca çekiç ve keskiyle yardı; öbürleri 700 metre aşağıda 69 gün boyunca kurtarılmayı bekledi.
**Akılda kalacak tek şey:** bir adamın elleriyle kırdığı kaya, dev bir matkabın deldiğinin en az 15 katı.

**Karakterler**
- **Dashrath Manjhi:**
  - Yapı: 7,2 baş, sırım gibi ince.
  - Saç: kısa siyah, yıllar içinde ağarır (26, 37 ve 48 yaş için üç evre); ince bıyık.
  - Giysi: beyaz dhoti `#E9E2D2`, omzunda kırmızı bez `#B23A2A`, yalınayak.
  - Palet: ten `#6A452E`.
  - İmza: çekiç ve keski.
- **Falguni Devi:**
  - Giysi: turuncu sari `#D9792B`.
  - İmza: başında kil testi.
- **Madenciler:**
  - Giysi: turuncu baret `#F28C1E`, kirli tulum `#3C4A3A`, kafa lambası.
  - Florencio Ávalos (31): ilk çıkan; geniş bir gülümseme.
  - Luis Urzúa (54): vardiya şefi, kır saçlı; elinde tayın defteri.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Bir adam, karısını kaybettiği dağa çekiçle vuruyor. | Kayaya inen keski, kıvılcım. Başlık. |
| 1 | 4–12 | Hindistan, Gehlaur köyü. Köyle kasaba arasında dik, kayalık bir sırt vardı. Dashrath Manjhi'nin karısı Falguni o patikadan geçerken düştü. | Falguni başında testiyle sırtı tırmanır; ayağı kayar, testi kırılır. *1 sn durak.* |
| 2 | 12–19 | En yakın doktor yetmiş kilometre ötedeydi. Falguni kurtarılamadı. | Gece; Manjhi kapı eşiğinde, elinde kırık testinin parçası. *1,2 sn durak.* |
| 3 | 19–27 | Bir gün Manjhi bir çekiç ve bir keski alıp sırta çıktı. Köylüler ona deli dedi. | Sırtın başında tek başına; köylüler uzaktan güler. |
| 4 | 27–35 | Yirmi iki yıl boyunca her gün vurdu. Saçları ağardı, sırt yavaş yavaş açıldı. | Gün ve gece hızla akar; yarık ilerler, Manjhi'nin saçı ağarır. |
| 5 | 35–41 | Sonunda yüz on metrelik bir yol açtı. Elli beş kilometrelik yol on beş kilometreye indi. | Yarığın içinden okula koşan çocuklar; yol çizgisi 55'ten 15'e kısalır. |
| köprü | 41–43 | Yerin yedi yüz metre altında ise otuz üç kişi başka bir kayayla savaşıyordu. | Atacama çölü, maden ağzı. |
| 6 | 43–50 | Ağustos 2010, Şili. Maden çöktü ve otuz üç işçi karanlıkta kaldı. Yiyecekleri iki gün yetecek kadardı. İki günde bir iki kaşık ton balığıyla on yedi gün dayandılar. | Sığınakta 33 kafa lambası; Urzúa tayını bölüştürür. *0,8 sn durak.* |
| 7 | 50–56 | On yedinci gün tavandan bir matkap ucu çıktı. Ucuna kırmızı harflerle bir not bağladılar: "Sığınaktayız, otuz üç kişi iyiyiz." | Tavanı delen matkap; elle yazılmış not (asıl metin: ESTAMOS BIEN EN EL REFUGIO LOS 33). |
| 8 | 56–60 | Altmış dokuzuncu gün dar bir kapsül onları tek tek yukarı çekti. En son vardiya şefi çıktı. | Fénix kapsülü yüzeye çıkar; güneş gözlüklü Ávalos oğluna sarılır; en son Urzúa. |
| yüz | 60–67 | Peki ikisini aynı kayayla ölçersek? *(1 sn sessizlik)* Kurtarma kuyusu yaklaşık iki yüz elli metreküp kaya deldi. Manjhi ise elleriyle bunun en az on beş katını kırdı. | Kuyunun kayası 6,3 m'lik bir küp olur; yarığa 15 küp düşer; yarığın ucunda yaşlı Manjhi'nin silueti. |
| soru | 67–71 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Kaçınılanlar:**
- Falguni'nin su mu yemek mi taşıdığı tartışmalı; testi yalnız görüntüde kalır.
- "Dağı yerinden oynattı" denmez. Keçilerini sattığı, hamilelik ve "bir milyar izleyici" iddiaları kullanılmaz.

**Kaynaklar:** Wikipedia (Dashrath Manjhi; 2010 Copiapó kazası), NBC News, Fox News, The Clinic, SURDOC, Al Jazeera.

---

## № 063 · Avukatı yenen kadın ve 400 yıllık köpekbalığı · 7 Kasım

**Logline:** Biri Van Gogh'u görmüş ve kendi ölümüne bahse giren avukatı bile geride bırakmıştı; öbürü yaklaşık dört yüz yıldır yüzüyor olabilir.
**Akılda kalacak tek şey:** 122 mumun yanında 392 mum.

**Karakterler**
- **Jeanne Calment:**
  - Üç yaş evresi:
    - 13 yaşında (1888): kestane saç, açık gri gözler, uzun etek ve önlük.
    - 90 yaşında (1965): kır saç, siyah elbise.
    - 120 yaşında: bembeyaz saç, çok küçük ve ince (yaklaşık 137 cm), tekerlekli sandalye, koyu gözlük.
  - Palet: saç `#7A4A2A`, sonra `#F2F0EA`; ten `#EBCDB3`.
  - İmza: yaramaz bir gülümseme.
- **Avukat André-François Raffray (47 yaşında):**
  - Takım elbise, evrak çantası.
  - Her ay masaya bir zarf koyar.
- **Grönland köpekbalığı:**
  - 5 m, tıknaz gövde, kısa yuvarlak burun, küçük gözler, küçük yüzgeçler.
  - Krem-gri ile kahverengimsi siyah arası renk, yer yer beyaz benekler.
  - Gözünde asılı, soluk bir kopepod şeridi.
  - Hareket: çok yavaş, saatte yaklaşık 1,2 km.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Bu köpekbalığı, yaklaşık dört yüz yıldır aynı karanlık suda yüzüyor olabilir. | Karanlık suda yavaşça beliren dev bir göz. Başlık. |
| 1 | 4–11 | Ama önce bir kadın. Jeanne Calment, 1875'te Fransa'nın Arles kentinde doğdu. On üç yaşındayken babasının dükkânına Van Gogh girdi. | Arles'ta bir kumaş dükkânı; tezgâhın arkasında küçük Jeanne; kapıdan şapkalı bir ressam girer. |
| 2 | 11–17 | Yıllar sonra onu şöyle anlattı: "Çok çirkindi, kabaydı, biraz da deliydi." | Jeanne'in burnunu kırıştıran yüzü; ressam omzunu silkip çıkar. |
| 3 | 17–26 | Doksan yaşındayken bir avukat evini satın aldı. Anlaşmaya göre o ölene kadar her ay para ödeyecek, sonra ev onun olacaktı. Avukat kısa sürede kazanacağını düşünüyordu. | Avukat masaya ilk zarfı koyar; Jeanne gülümser; takvim yaprakları akar. |
| 4 | 26–34 | Otuz yıl ödedi. Sonunda avukat öldü, Jeanne yaşamaya devam etti. Yüz yaşında hâlâ bisiklete biniyordu. | Zarflar masada birikir; avukatın sandalyesi boşalır; Jeanne bisikletle geçer. *0,8 sn durak.* |
| 5 | 34–38 | Yüz yirmi iki yaşında öldüğünde belgelenmiş en uzun insan ömrünü yaşamıştı. | 122 mumlu masada son mum yanar. |
| köprü | 38–41 | Kuzey Atlantik'in buz gibi karanlığında ise başka bir canlı çok daha yavaş yaşıyor. | Kesme: koyu su, aşağı süzülen deniz karı. |
| 6 | 41–48 | Grönland köpekbalığı yılda bir santimetre kadar büyür. Ancak yüz elli yaşına yaklaşınca yetişkin olur. | Köpekbalığı kameranın önünden ağır ağır geçer; geçişi 4 sn sürer. |
| 7 | 48–56 | 2016'da bilim insanları yaşlarını göz merceğinden ölçtü. Mercek anne karnında oluşur ve hiç yenilenmez. | Göze yakın plan; merceğin içinde halka halka katmanlar ışıldar. |
| 8 | 56–60 | En büyüğünün yaşı yaklaşık dört yüz çıktı. | Sayaç 392'de durur; "aralık 272–512" notu. |
| yüz | 60–67 | Peki ikisini yan yana koyarsak? *(1 sn sessizlik)* Calment'ın bütün ömrü yüz yirmi iki yıl sürdü. Bu köpekbalığı ise o ömrün üç katından fazlasını yaşamış olabilir. | Masada önce 122 altın mum, yanında 392 soğuk mum yanar; soğuk sıra üç kat uzar. |
| soru | 67–71 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Not:** Daha çarpıcı bir açılış istenirse şu kullanılabilir: "Bu köpekbalığı doğduğunda İstanbul'da belki Sultanahmet Camii yapılıyordu." Sultanahmet Camii 1609–1616 arasında yapıldı; 392 ± 120 yıllık tahmine göre doğum yılı 1504–1744 aralığına düşüyor (orta değer yaklaşık 1624). Bu yüzden cümlede "belki" sözcüğü şart.

**Kaçınılanlar:**
- "Eskrime 85 yaşında başladı" ve "tek kırışığım" sözü (kaynak zayıf).
- "Köpekbalığı paraziti yüzünden kör" denmez (2025–26 çalışması işe yarar bir retina buldu).
- 2018 yaş itirazı açıklamada kalır; Guinness kaydı geçerli.

**Kaynaklar:** Wikipedia (Jeanne Calment; Greenland shark), Guinness (2024), Nielsen ve ark. (Science, 2016), VIMS, Science News.

---

## № 036 · Batmayan kadın ve iki bombadan kurtulan mühendis · 8 Kasım

**Logline:** Biri üç büyük gemi kazasından kurtuldu ve ikincisinde bir bebeği kucağında taşıdı; öbürü üç gün içinde iki atom bombasını yaşadı.
**Akılda kalacak tek şey:** üç gemi, beş yıl; iki bomba, üç gün.

**Karakterler**
- **Violet Jessop (24 yaşında, 1912):**
  - Yapı: 7,2 baş, ince.
  - Saç: koyu kumral `#5A2E1E`, topuz.
  - Giysi: gemi hosteslerinin lacivert üniforması `#1E2A44`, beyaz yaka ve önlük, başlık.
  - İmza: elinde diş fırçası; Titanik'te kucağındaki bebek.
- **Tsutomu Yamaguchi (29 yaşında, 1945):**
  - Yapı: 7 baş.
  - Saç: kısa siyah.
  - Giysi: açık gri iş gömleği, evrak çantası.
  - İmza: unuttuğu hanko (isim mührü); 9 Ağustos'ta yüzünü saran sargılar.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Gemi batarken geri dönüp tek bir şey aldı: diş fırçasını. | Eğik koridor, sular yükselir; Violet ranzadan diş fırçasını kapar. Başlık. |
| 1 | 4–12 | 1912. Violet Jessop yirmi dört yaşında bir hostesti. Gece yattığı yerde alçak, yırtılan bir gıcırtı duydu. Gemi bir buzdağına çarpmıştı. Adı Titanik'ti. | Kamarada uyanış; çatlayan buz sesi; sallanan lamba. |
| 2 | 12–20 | On altı numaralı filikaya bindirildi. Filika inerken bir subay kucağına bir bebek uzattı: "Bu bebeğe göz kulak ol." | Filika iner; bebek kucağına verilir; karanlıkta ışıkları sönen dev gemi. *1 sn durak.* |
| 3 | 20–26 | Kurtarma gemisinde bir kadın bebeği kucağından kaptı ve tek kelime etmeden gitti. | Güverte; bebek elinden alınır; Violet'in boş kolları. |
| 4 | 26–35 | Dört yıl sonra Ege'de bir hastane gemisindeydi. Gemi mayına çarptı. Bu sefer önce diş fırçasını aldı. Filikası dönen pervanelere doğru çekilince suya atladı; başını çarptı ama yine kurtuldu. | Britannic yan yatar; pervaneye çekilen filika; Violet suya atlar. |
| köprü | 35–38 | Ama otuz üç yıl sonra bir adam, bir değil iki kıyameti üç gün arayla yaşadı. | Hiroşima'da bir yaz sabahı. |
| 5 | 38–45 | 6 Ağustos 1945. Gemi mühendisi Tsutomu Yamaguchi, Hiroşima'daki iş gezisinin son günü, unuttuğu mührünü almak için geri döndü. | Yamaguchi tramvaydan iner, cebini yoklar ve geri döner. |
| 6 | 45–52 | Saat sekizi on beş geçe gökyüzünde dev bir ışık parladı. Yamaguchi havaya savruldu; yüzü ve kolları yandı, kulak zarları patladı. | Beyaz parlama; patates tarlasına savrulan adam. *1 sn sessizlik.* |
| 7 | 52–58 | Yanıklarıyla trene binip evine, Nagazaki'ye döndü. Üç gün sonra, sargılar içinde patronuna Hiroşima'yı anlatıyordu. | Sargılı yüz, ofis; masada çizimler. |
| 8 | 58–62 | Patronu ona inanmadı. Tam o sırada odayı aynı beyaz ışık doldurdu. | Pencereden giren ikinci beyaz ışık; yüzündeki dehşet. |
| yüz | 62–68 | Peki ikisini aynı takvime koyarsak? *(1 sn sessizlik)* Violet'in üç kazası beş yıla yayıldı. Yamaguchi ise iki atom bombasını üç gün içinde yaşadı ve ikisinden de sağ çıktı. | Takvim: 1911–1916 arasında üç gemi işareti; Ağustos 1945'te iki gün yan yana yanar. |
| soru | 68–72 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Kaçınılanlar:**
- Violet'in başını omurgaya çarptığı ve bebeğin kim olduğu (tartışmalı); yıllar sonra gelen "o bebek bendim" telefonu.
- Patronunun tam sözleri; "dünyanın en şanssız adamı" çerçevesi.

**Kaynaklar:** Wikipedia (Violet Jessop; Tsutomu Yamaguchi), National Geographic, History.com, The Independent.

---

## № 064 · Damlayı hiç göremeyen adam ve 185 yıldır çalan çan · 9 Kasım

**Logline:** Biri hayatı boyunca bir zift damlasının düşmesini bekledi ve hiç göremedi; öbürü 1840'tan beri susmadan çalıyor.
**Akılda kalacak tek şey:** bir damla düşene kadar çan yarım milyar kez çalıyor.

**Karakterler**
- **Thomas Parnell (1927):**
  - Bıyıklı profesör; tüvit ceket, papyon.
  - Sıcak zifti huniye döker.
- **John Mainstone (1961–2013):**
  - Uzun yıllar bekçi; beyaz sakal, gözlük, hırka.
  - İmza: camın önünde bekleyen sabırlı yüz.
- **Zift damlası:**
  - Siyah, parlak, gözyaşı biçimli.
- **Oxford çanı:**
  - İki pirinç çan, aralarında 4 mm'lik bilye.
  - İki kat camın ardında.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Bu adam, bir damlanın düşmesini görmek için ömrünü bekledi. | Camın önünde yaşlı Mainstone; huninin ucunda asılı siyah damla. Başlık. |
| 1 | 4–12 | 1927, Avustralya. Profesör Thomas Parnell ısıttığı zifti bir huniye döktü. Zift o kadar sertti ki çekiçle vurunca paramparça oluyordu. | Sıcak zift huniye akar; çekiç darbesi, kırılan zift. |
| 2 | 12–19 | Parnell üç yıl bekledi, sonra huninin ucunu kesti. İlk damla ancak sekiz yıl sonra düştü. | Takvim yaprakları akar; damla yavaşça uzar. |
| 3 | 19–28 | 1961'de deneyin başına John Mainstone geçti. Elli iki yıl boyunca bekledi. Bir damlayı bir gün farkla kaçırdı. Bir sonrakini beş dakika farkla. | Mainstone kahvesini almaya çıkar, döndüğünde damla düşmüştür. *0,8 sn durak.* |
| 4 | 28–35 | 2000'de damla düşerken kamera çekiyordu. Tam o anda yirmi dakikalık bir elektrik kesintisi oldu. | Ekranda kayıt ışığı söner; karanlık. *1 sn durak.* |
| 5 | 35–40 | Mainstone 2013'te öldü. Bir damlanın düşüşünü bir kez bile görmedi. | Boş sandalye; camın ardında damla. |
| köprü | 40–43 | Oxford'da ise bir cam fanusun altında yüz seksen beş yıldır bir şey hiç durmuyor. | Laboratuvar koridoru, vitrin. |
| 6 | 43–50 | İki küçük çanın arasında minik bir bilye var. Bilye 1840'tan beri sallanıyor ve saniyede iki kez çanlara vuruyor. | Yakın plan: bilye gidip gelir; tın, tın. |
| 7 | 50–57 | Ses o kadar zayıf ki iki kat camın ardından duyulmuyor. Pilin içinde ne olduğunu kimse bilmiyor, çünkü açmak deneyi bitirebilir. | Camın ardında sessizlik; bilim insanları yalnızca bakar. |
| 8 | 57–60 | Bugüne kadar on milyar kezden fazla çaldı. | Sayaç akar. |
| yüz | 60–68 | Peki ikisini aynı saatle ölçersek? *(1 sn sessizlik)* Zift ortalama dokuz yılda bir damlıyor. O tek damla düşene kadar çan yaklaşık yarım milyar kez çalıyor. | Saat: damla bir milim uzarken çanın sayacı fırlar; damla düştüğü an sayaç 500 milyonda durur. |
| soru | 68–72 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Kontrol edilecek:**
- 9 yıl × yaklaşık 2 Hz ≈ 570 milyon; anlatımdaki "yaklaşık yarım milyar" tutarlı.
- Mainstone'un ölüm tarihi: Nature 23 Ağustos, Wikipedia metni 13 Ağustos diyor. Anlatımda yalnız yıl söylenir.
- Trinity College 2013'te bir zift damlasını ilk kez filme aldı. Bunu açıklamaya eklemek iyi bir kanca olur.

**Kaçınılanlar:** "Sürekli hareket makinesi" denmez; "çanı kim yaptı" söylenmez.

**Kaynaklar:** UQ, Wikipedia (Pitch drop experiment; Oxford Electric Bell), Nature, Oxford Physics.

---

## № 061 · Zamanı kaybeden adam ve yolunu kaybeden adam · 11 Kasım

**Logline:** Biri 130 metre yerin altında saatsiz kalıp 25 günü fark etmeden kaybetti; öbürü bir kum fırtınasında yolunu kaybetti ve 291 km ötede, başka bir ülkede bulundu.
**Akılda kalacak tek şey:** biri yerinden kıpırdamadan 25 gün kaybetti, öbürü 9 günde 291 km saptı.

**Karakterler**
- **Michel Siffre (23 yaşında, 1962):**
  - Yapı: 7,2 baş, ince.
  - Saç: koyu, karışık; zamanla uzayan sakal.
  - Giysi: kaz tüyü mont, madenci kaskı ve lambası.
  - Eşya: tek yönlü sahra telefonu; mağaradan çıkarken kayak gözlüğü.
- **Mauro Prosperi (38 yaşında, 1994):**
  - Yapı: 7,4 baş, atletik pentatloncu.
  - Saç: kısa, koyu.
  - Giysi: koşucu kıyafeti, sırt çantası, başında bez.
  - Eşya: işaret fişeği, cep aynası.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Saatini çıkardı ve yerin yüz otuz metre altına indi. | Bilekten çıkan saat; ip merdivenden karanlığa iniş. Başlık. |
| 1 | 4–12 | 1962. Fransız mağaracı Michel Siffre yirmi üç yaşındaydı. Bir buzulun yanındaki mağarada, saatsiz ve takvimsiz, iki ay yaşamaya karar verdi. | Buz duvarı, küçük çadır, lamba ışığı. |
| 2 | 12–20 | Ayakları hep ıslaktı, vücut sıcaklığı otuz dört dereceye kadar düştü. Uyandığında, yemek yediğinde ve uyumadan önce yukarıdaki ekibi aradı. Ekibin ona saati söylemesi yasaktı. | Telefonla konuşan titrek adam; yukarıda kayıt tutan ekip. |
| 3 | 20–27 | Bir gün yüz yirmiye kadar saymayı denedi. Ona göre iki dakika sürdü. Gerçekte beş dakika geçmişti. | Lambanın ışığında saymaya çalışan dudaklar; arkada akan gerçek zaman. |
| 4 | 27–34 | Ekip deneyin bittiğini söylediğinde, takvimine göre daha 20 Ağustos'tu. Oysa günlerden 14 Eylül'dü. | Takvim sayfası 20 Ağustos'ta; dış dünyada 14 Eylül. *1 sn durak.* |
| köprü | 34–37 | Zamanı kaybetmek bir şey. Ya yönünü kaybetmek? | Kesme: Sahra, kum tepeleri. |
| 5 | 37–44 | 1994. İtalyan polis memuru Mauro Prosperi Sahra'daki bir ultramaratonda dördüncü sıradaydı. Kırk altı derecede bir kum fırtınası çıktı. | Koşan Prosperi; ufuktan gelen kum duvarı. |
| 6 | 44–51 | Fırtına sekiz saat sürdü. Dindiğinde ne işaretler kalmıştı ne de başka koşucular. | Kum dinince bomboş ufuk; tek başına bir adam. *1 sn durak.* |
| 7 | 51–58 | Kendi anlattığına göre terk edilmiş bir türbeye sığındı, kayalardaki çiyi yaladı ve yarasaları yiyerek hayatta kaldı. | Türbe, tepede bir İtalyan bayrağı; karanlıkta asılı yarasalar. |
| 8 | 58–63 | Dokuzuncu gün bir göçebe kız onu gördü ve korkuyla kaçtı. Prosperi farkında olmadan Cezayir'e geçmişti. | Keçi güden kız; aynada kendini gören zayıf adam. |
| yüz | 63–69 | Peki ikisini aynı haritaya koyarsak? *(1 sn sessizlik)* Siffre yerinden kıpırdamadan yirmi beş gün kaybetti. Prosperi ise dokuz günde yolundan iki yüz doksan bir kilometre saptı. | Harita: mağarada bir nokta ve 25 günlük boşluk; Sahra'da rotadan ayrılan 291 km'lik çizgi. |
| soru | 69–73 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Kaçınılanlar:**
- 1962'deki "48 saatlik gün" (bu 1972 deneyinden).
- Prosperi'nin intihar girişimi anlatılmaz. Yarış kurucusu hikâyeye itiraz ettiği için Prosperi'nin hikâyesi "kendi anlattığına göre" çerçevesinde verilir.
- "Olimpik pentatloncu" denmez.

**Kaynaklar:** Wikipedia (Michel Siffre; Mauro Prosperi), Cabinet Magazine, Boston Globe, Museion, Offgrid.

---

## № 065 · Duyulan en uzak ses: Krakatoa ve Tonga · 13 Kasım

**Logline:** 1883'te bir yanardağın sesi 4.800 km öteden top sesi sanıldı; 2022'de başka birinin gümbürtüsü Alaska'da evleri titretti.
**Akılda kalacak tek şey:** iki patlama, aynı dev basınç dalgası; ses neredeyse iki kat uzağa gitti.

**Karakterler**
- **James Wallis:**
  - Rodrigues adasının polis şefi (1883).
  - Beyaz sömürge üniforması, kask.
  - Elinde kayıt defteri.
- **Alaskalı bir aile (2022):**
  - Gece yarısı uyanan bir baba; kalın gecelik, el feneri.
  - Bodrumdaki bir sesten şüphelenir.
- **Yanardağlar:**
  - Kahraman olarak çizilir: Krakatoa'nın konisi; Tonga'nın denizden yükselen bulutu.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Ses dört saat yol aldı ve okyanusun öbür ucunda top sesi sanıldı. | Rodrigues kıyısı; denize dönen başlar. Başlık. |
| 1 | 4–12 | 27 Ağustos 1883, sabah saat ona doğru. Endonezya'daki Krakatoa yanardağı tarihin en gürültülü patlamalarından biriyle infilak etti. | Koni yarılır; şok dalgası denizi düzleştirir. |
| 2 | 12–19 | Altmış dört kilometre ötedeki bir geminin kaptanı, tayfasının yarısından fazlasının kulak zarlarının patladığını yazdı. | Güverte, kulaklarını tutan denizciler. *0,8 sn durak.* |
| 3 | 19–27 | Dört saat sonra, dört bin sekiz yüz kilometre ötedeki Rodrigues Adası'nda polis şefi deftere şunu yazdı: "Doğudan, uzaktan gelen ağır top sesleri." | Wallis'in kalemi deftere; ufka bakan adam. |
| 4 | 27–33 | Basınç dalgası günlerce Dünya'nın çevresinde dolaştı. Haftalar sonra New York'ta itfaiye, kızıl gökyüzünü yangın sanıp yola çıktı. | Dünyanın çevresinde dolaşan halka; New York'ta kızıl bir gün batımına koşan itfaiye arabası. |
| köprü | 33–36 | Yüz otuz dokuz yıl sonra başka bir yanardağ aynı şeyi yaptı. | Pasifik, denizin altı. |
| 5 | 36–43 | 15 Ocak 2022. Tonga açıklarında denizin altındaki bir yanardağ patladı. Bulutu elli yedi kilometreye, uzay sınırına yaklaştı. | Deniz yarılır; gökyüzüne yükselen bulut, içinde şimşekler. |
| 6 | 43–50 | Bilim insanları basınç dalgasını Krakatoa'nınkiyle aynı büyüklükte ölçtü. Dalga altı günde Dünya'nın çevresini dört kez dolaştı. | Dünyayı saran halkalar, dört tur. |
| 7 | 50–58 | Gece yarısı Alaska'da insanlar gümbürtüyle uyandı. Kimi havai fişek sandı, kimi bodrumda kazı yapan bir geyik. | Alaska'da karlı bir ev; feneriyle bodruma inen baba. *0,8 sn durak.* |
| yüz | 58–66 | Peki iki sesi yan yana koyarsak? *(1 sn sessizlik)* Krakatoa'nın sesi dört bin sekiz yüz kilometre öteden duyuldu. Tonga'nın gümbürtüleri ise yaklaşık iki kat uzağa, dokuz bin dört yüz kilometreye ulaştı. | Dünya haritasında iki halka: 4.800 ve 9.400 km. |
| soru | 66–70 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Düzeltmeler:**
- Alaska uzaklığı 10.000 değil, yaklaşık 9.360 km.
- Alaska'daki gümbürtülerin yol boyunca oluşmuş olabileceği bilim insanlarınca düşünülüyor. Bu yüzden "yanardağın sesi" yerine "patlamanın gümbürtüleri" denir.

**Kaçınılanlar:** "Dünyayı yedi kez dolaştı"; "172 dB"; "insanlığın %10'u duydu"; Munch'un Çığlık tablosu.

**Kaynaklar:** Wikipedia (1883 ve 2022 patlamaları), Nautilus, Oregon State Volcano World, Matoza ve ark. (Science, 2022), Anchorage Daily News, NASA.

---

## № 037 · Gökten düşen kız ve yedi kez yıldırım çarpan adam · 14 Kasım

**Logline:** Biri 3 km yükseklikten koltuğuyla birlikte ormana düştü ve 11 gün yürüyerek kurtuldu; öbürüne yedi kez yıldırım çarptı.
**Akılda kalacak tek şey:** bir yıldırım bir uçağı düşürdü; yedi yıldırım bir adamı yıkamadı.

**Karakterler**
- **Juliane Koepcke (17 yaşında, 1971):**
  - Yapı: 7 baş, ince.
  - Saç: açık kumral, omuz hizasında.
  - Giysi: kolsuz, kısa, fermuarı kırık pamuklu elbise; tek beyaz sandalet.
  - Palet: elbise `#E9D9B0`.
  - İmza: önünü yoklamak için yere fırlattığı sandalet.
- **Roy Sullivan (30 → 65 yaşında):**
  - Yapı: 7,6 baş, iri ve geniş yüzlü.
  - Giysi: park korucusu üniforması `#4A5A3A`, geniş kenarlı korucu şapkası.
  - İmza: yanık kaşlar, şapka.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Koltuğuna bağlı halde, üç kilometre yükseklikten düşüyordu. | Bulutların arasında dönen koltuk sırası; altta brokoli gibi orman. Başlık. |
| 1 | 4–12 | Noel arifesi, 1971, Peru. On yedi yaşındaki Juliane Koepcke annesiyle bir uçağa bindi. Babası tek bir şey demişti: "Bu şirketle uçmayın." | Lima'da uçak; cam kenarında anne ve kız. |
| 2 | 12–19 | Uçak fırtınaya girdi. Juliane sağ kanadın üstünde kör edici beyaz bir ışık gördü. Annesi sakin bir sesle şunu söyledi: "Şimdi her şey bitti." | Kanattaki yıldırım; annenin yüzü. *1 sn sessizlik.* |
| 3 | 19–27 | Bir anda uçağın dışındaydı ve her yer sessizdi. Ağaçların arasına düştü. Köprücük kemiği kırılmıştı; annesi yanında yoktu. | Koltukla düşüş; ağaç tepeleri; ormanda uyanan kız. |
| 4 | 27–36 | Babasının öğüdünü hatırladı: "Kaybolursan suyu bul ve akıntıyı izle." On bir gün boyunca derenin içinde yürüdü. Yaralarında kurtçuklar vardı. | Dereyi izleyen kız, önüne fırlattığı sandalet; geceleri yağmur. |
| 5 | 36–41 | Sonunda bir kulübe buldu. Ormancılar onu orada buldu. Uçaktaki doksan iki kişiden yalnızca o hayatta kaldı. | Kulübenin kapısında ormancılar; kızın yorgun yüzü. *1 sn durak.* |
| köprü | 41–44 | Juliane'nin uçağına tek bir yıldırım düştü. Bir adama ise tam yedi kez. | Kesme: Virginia'da dağlar, gökgürültüsü. |
| 6 | 44–51 | Roy Sullivan bir milli parkta korucuydu. 1942'de bir gözetleme kulesinden kaçarken ilk yıldırım çarptı ve ayakkabısını delip geçti. | Kuleden koşan genç korucu; çizmesinde delik. |
| 7 | 51–58 | Sonra kamyonunda kaşları yandı, bahçesinde omzu, kulübesinde saçı tutuştu. Yedinci kez balık tutarken çarptı. | Hızlı beş vuruş, her biri bir yerde; Roy'un yüzü her seferinde daha yorgun. |
| 8 | 58–62 | Yedisinden de sağ çıktı ve Guinness Rekorlar Kitabı'na girdi. | İki yanık korucu şapkası, vitrinde. |
| yüz | 62–68 | Peki ikisini aynı gökyüzünde ölçersek? *(1 sn sessizlik)* Bir insana ömrü boyunca yıldırım çarpma ihtimali on beş bin üç yüzde bir. Roy'a ise yedi kez çarptı. | Gökyüzünde 15.300 kişilik kalabalıkta tek bir yanan figür; sonra Roy'un üstüne yedi yıldırım. |
| soru | 68–72 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Düzeltmeler:**
- 9 gün değil, 11 gün.
- Yıldırımın 1942'de "ayak başparmağını kopardığı" doğru değil; tırnağını kaybetti ve ayakkabısı delindi.

**Kaçınılanlar:**
- Kurtçuklara benzin dökme sahnesi görsel olarak gösterilmez.
- Roy'un ölüm biçimi anlatılmaz. "Ayının balığını çaldığı" iddiası kullanılmaz.
- "280 milyonda bir" denmez.

**Kaynaklar:** Wikipedia (Juliane Koepcke; LANSA 508; Roy Sullivan), VICE, Explorersweb, NWS, Guinness.

---

## № 066 · Nefesini tutan adam ve yüzeye çıkmayan balina · 15 Kasım

**Logline:** Bir adam 29 dakika boyunca tek nefesle dayandı; bir balina ise 3 saat 42 dakika boyunca yüzeye çıkmadı.
**Akılda kalacak tek şey:** kronometrenin bir ucunda 29 dakika, öbür ucunda 222 dakika.

**Karakterler**
- **Vitomir Maričić (40 yaşında, 2025):**
  - Yapı: 7,4 baş.
  - Giysi: siyah dalış elbisesi, gözlük; havuzda köpük şeritlerle yüzüstü.
  - Saç: kısa.
  - İmza: elleri havuz kenarını tutar.
- **Cuvier gagalı balinası:**
  - 6 m, kaz gagasına benzeyen kısa burun.
  - Erkek: koyu gri, başı açık renk; gövde baştan sona çizik ve yara izleriyle kaplı.
  - Alt çenesinin ucunda iki küçük diş.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Yirmi dakika olmuştu ve hâlâ nefes almıyordu. | Havuzda yüzüstü bir adam; kronometre 20:00. Başlık. |
| 1 | 4–12 | Haziran 2025, Hırvatistan. Dalgıç Vitomir Maričić bir otelin havuzunun başında on dakika boyunca saf oksijen soludu. | Lobide havuz, yüz kadar seyirci, oksijen maskesi. |
| 2 | 12–19 | Son bir nefes aldı ve yüzünü suya gömdü. Beş hakem saati başlattı. | Su yüzeyi kapanır; kronometre başlar. |
| 3 | 19–27 | Diyaframı defalarca kasıldı. Kendine hep aynı şeyi söyledi: "Sadece on saniye daha." | Titreyen sırt; suya yansıyan seyirci yüzleri. *1 sn sessizlik.* |
| 4 | 27–33 | Yirminci dakikadan sonra her şey kolaylaştı. Kronometre yirmi dokuz dakika üç saniyede durdu. | Adam başını kaldırır, gözlüğünü çıkarır; alkış. |
| köprü | 33–36 | Ama insanın en uzun nefesi bile bir balinanın sıradan bir dalışından kısa. | Kesme: okyanus yüzeyi, bir sırt yüzgeci. |
| 5 | 36–44 | Cuvier gagalı balinası memeliler arasında en derine dalan tür. Yaklaşık üç bin metreye, zifiri karanlığa iniyor. | Balina yüzeyden dikine dalar; ışık azalır, mavi siyaha döner. |
| 6 | 44–51 | Tipik bir dalışı yaklaşık bir saat sürüyor. Oysa hesaplara göre oksijeni yarım saat kadar yetmeliydi. | Karanlıkta yalnız gövdesindeki yara izleri seçilir. |
| 7 | 51–58 | Bilim insanları uydu vericisi taktıkları bir balinayı izlerken o, bir türlü yüzeye çıkmadı. Bir saat geçti. İki saat. Üç saat. | Araştırma gemisinde ekran: derinlik çizgisi dipte düz kalır. *1 sn durak.* |
| 8 | 58–62 | Sonunda üç saat kırk iki dakika sonra yüzeye çıktı. | Yüzeyde bir nefes bulutu. |
| yüz | 62–68 | Peki ikisini aynı kronometreye koyarsak? *(1 sn sessizlik)* İnsanın rekoru oksijen desteğiyle bile yirmi dokuz dakika. Bu balinanın tek dalışı ise bunun yedi katından da uzun. | Kronometre: 29 dakikada duran insan çizgisi; balinanın çizgisi 222 dakikaya uzar. |
| soru | 68–72 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Düzeltmeler:**
- Maričić havuzun dibinde değil, yüzeyde köpük şeritlere tutunarak yüzüstü durdu.
- Rekorun oksijen destekli olduğu her yerde söylenir.
- 222 dakikalık dalışın derinliği bilinmiyor; o dalış için "üç bin metre" denmez (derinlik rekoru başka bir balinanındır). Bu dalışın sonar maruziyetinden sonra kaydedildiği açıklamada yazılır.

**Kaynaklar:** Guinness, ScienceNorway, The Conversation, Quick ve ark. (J. Exp. Biol., 2020), Schorr ve ark. (PLOS ONE, 2014).

---

## № 038 · Uyumayan çocuk ve hatırlayamayan adam · 16 Kasım

**Logline:** Biri bir bilim fuarı için 11 gün hiç uyumadı; öbürünün hafızası 1985'ten beri her birkaç saniyede sıfırlanıyor, ama karısını her seferinde ilk kez görmüş gibi seviyor.
**Akılda kalacak tek şey:** 11 günde en az 32 bin kez yeniden başlayan bir hafıza.

**Karakterler**
- **Randy Gardner (17 yaşında, 1963–64):**
  - Yapı: 6,9 baş, çok ince.
  - Saç: kısa, düz.
  - Giysi: lise ceketi, beyaz tişört.
  - İmza: gittikçe kızaran gözler, göz altları.
- **Clive Wearing (47 yaşında, 1985 ve sonrası):**
  - Şık giyimli bir müzisyen: takım elbise, kravat.
  - İmza: elinde günlüğü, piyanoya dokunan eller.
- **Deborah Wearing:**
  - Clive'ın eşi; sıcak bir gülümseme.
  - Odaya her girişinde Clive kollarını açar.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Günlüğüne her birkaç dakikada aynı cümleyi yazıyor: "Şimdi gerçekten uyandım." | Üstü çizili satırlarla dolu bir günlük sayfası. Başlık. |
| 1 | 4–11 | Ama önce uyumamaya karar veren bir çocuk. 1963'ün sonunda, on yedi yaşındaki Randy Gardner bir bilim fuarı için hiç uyumamaya karar verdi. | Lisede bir masa; yazı tura atılır, Randy kaybeder. |
| 2 | 11–18 | İki arkadaşı onu gece gündüz izledi. Gözlerini kapamasına izin vermediler. | Gece, sokak lambası; iki arkadaş onu dürter. |
| 3 | 18–26 | Dördüncü gece sokak tabelasını bir insan sandı. Bir süre sonra kendini ünlü bir futbolcu sanmaya başladı. | Tabela bir adama dönüşür; Randy'nin bulanık bakışı. *0,8 sn durak.* |
| 4 | 26–33 | On birinci gün yüzden geriye yedişer yedişer saydı. Altmış beşte durdu: ne yaptığını unutmuştu. Sonunda on bir gün yirmi beş dakika uyanık kaldı. | Sayılar havada; 65'te donar. Randy yatağa düşer. |
| köprü | 33–36 | İngiltere'de ise bir adam her gün yeniden uyanıyor. | Kesme: piyanolu bir oda. |
| 5 | 36–43 | Clive Wearing ünlü bir orkestra şefiydi. 1985'te bir virüs beynindeki hafıza merkezini yok etti. | Orkestranın önünde Clive; ışıklar söner. |
| 6 | 43–50 | O günden beri hafızası birkaç saniyeden fazla sürmüyor. Günlüğüne yazıyor, sonra bir önceki satırın üstünü çiziyor. | Kalem, çizgi, yeni satır; saat ilerlemiyor gibi. |
| 7 | 50–58 | Karısı odadan çıkıp birkaç dakika sonra döndüğünde, onu yıllardır görmemiş gibi kollarını açıp sarılıyor. | Deborah kapıdan girer; Clive'ın yüzü aydınlanır. *1 sn durak.* |
| 8 | 58–62 | Ama piyanonun başına oturunca zor parçaları hâlâ hatasız çalıyor. | Piyano; elleri hatırlıyor. |
| yüz | 62–68 | Peki ikisini aynı saatle ölçersek? *(1 sn sessizlik)* Randy on bir gün hiç uyumadı. O on bir günde Clive'ın hafızası en az otuz iki bin kez sıfırlanırdı. | Saat: Randy'nin uyanık geçen 264 saati; her 30 saniyede Clive'ın günlüğünde yeni bir satır açılır. |
| soru | 68–72 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Hesap:** 264,4 saat × 3600 ÷ 30 sn = 31.728 (yaklaşık 32 bin). Hafıza süresi 7–30 sn olduğu için "en az" doğru.

**Kaçınılanlar:**
- "7 saniyelik hafıza" kesin değer olarak söylenmez.
- Randy'nin "dünya rekoru" sürdüğü söylenmez (daha sonra 453 saat var); "zararsız" iddiası kullanılmaz.

**Kaynaklar:** Wikipedia (Randy Gardner; Clive Wearing), NPR/WAMC, Ross (Arch. Neurol., 1965), Oliver Sacks (The New Yorker, 2007), Deborah Wearing (Forever Today).

---

## № 039 · Türünün son üyesi ve türünü kurtaran baba · 17 Kasım

**Logline:** Biri türünün bilinen son üyesi olarak 40 yıl bir eş bekledi; öbürü 80 yıl sonra adasına döndü ve geride 800'den fazla yavru bıraktı.
**Akılda kalacak tek şey:** sıfır yavru ile 800'den fazla yavru.

**Karakterler**
- **Yalnız George:**
  - Pinta kaplumbağası; yaklaşık 75 kg.
  - Eyer biçimli kabuk, ön tarafı yukarı kalkık.
  - Uzun, kırışık boyun.
  - Gözlerinde yorgun bir bakış.
- **Fausto Llerena:**
  - 40 yıllık bakıcısı.
  - Haki gömlek, hasır şapka; kır saç, şefkatli eller.
- **Diego:**
  - Española kaplumbağası; 100 yaşın üstünde, yaklaşık 80 kg.
  - Siyah eyer kabuk, çok uzun boyun.
  - Boynunu sonuna kadar uzattığında 1,5 m.

| # | Süre | Anlatım | Ekranda |
|---|---|---|---|
| 0 | 0–4 | Bir sabah bakıcısı onu, boynu su birikintisine doğru uzanmış halde buldu. | Sabah ışığında ağıl; uzanmış bir boyun. Başlık. |
| 1 | 4–12 | Galapagos'taki Pinta Adası'na 1959'da balıkçılar üç keçi bıraktı. On yıl içinde keçiler kırk bine çıktı ve adanın bütün yeşilini yedi. | Ada yeşilden kahverengiye döner; tepelerde keçi sürüleri. |
| 2 | 12–19 | 1971'de bir bilim insanı adada tek bir kaplumbağa gördü. Türünün bilinen son üyesiydi. Ona Yalnız George dendi. | Çıplak kayalıkta tek başına yürüyen kaplumbağa. *1 sn durak.* |
| 3 | 19–27 | Ona eş bulana on bin dolar ödül kondu. Kimse bulamadı. Yanına konan başka türden dişilerin yumurtalarının hiçbiri açılmadı. | Bekleyen George; açılmayan yumurtalar. |
| 4 | 27–35 | Kırk yıl ona aynı bakıcı baktı. 24 Haziran 2012 sabahı Fausto onu ağılında buldu. Türünün bilinen son üyesi de gitmişti. | Fausto'nun yüzü; ağılda sessizlik. *1,2 sn durak.* |
| köprü | 35–38 | Ama komşu adada başka bir kaplumbağanın hikâyesi bambaşka bitti. | Kesme: Española, deniz kıyısı. |
| 5 | 38–45 | 1960'larda Española'da yalnızca on iki dişi ve iki erkek kalmıştı. Tür yok olmak üzereydi. | Boş ada; dağınık 14 kaplumbağa. |
| 6 | 45–52 | Sonra Amerika'daki bir hayvanat bahçesinde, adadan yıllar önce götürülmüş bir erkek bulundu: Diego. | San Diego'da bir bahçe; Diego'nun uzun boynu. |
| 7 | 52–58 | Diego yetiştirme programında yaklaşık sekiz yüz yavrunun babası oldu. Bugün adada iki binden fazla kaplumbağa yaşıyor. | Yavrular adaya yayılır; yeşeren ada. |
| 8 | 58–62 | 2020'de yüz yaşını geçmişken adasına geri döndü. | Diego'nun kumda yürüyüşü; dalgalar. *0,8 sn durak.* |
| yüz | 62–68 | Peki ikisini aynı soy ağacına koyarsak? *(1 sn sessizlik)* George'un ardında bıraktığı yavru sayısı sıfır. Diego'nunki ise sekiz yüzü aşkın. | Soy ağacı: George'un dalı boş; Diego'nun dalı 800'den fazla yaprakla dolar. |
| soru | 68–72 | Sen hangisine şaşırdın? Yoruma yaz. | TAKİP ET |

**Düzeltmeler:**
- "Yaklaşık 900" yerine "800'ü aşkın" (kaynaklar 800–900+ veriyor).
- Diego "türü tek başına kurtardı" denmez; yavruların yaklaşık %40'ının babası.
- George için "son üye" yerine "bilinen son üye" denir (melezler bulundu).

**Kaynaklar:** Wikipedia (Lonesome George; Diego), Galápagos Conservancy, Scientific American, Smithsonian.

---

## Not: 067 (altın küp)
067 bir Hangisi filmi değil; kahramanı yok, 3 Kasım'da yayında. İstenirse sonraki sayı filmlerinde de bir karakter ve tek bir insan anı kullanılır: 067'deki "annenin bilezikleri" cümlesi gerçek bir anne ve bileziklerle görüntülenebilirdi.

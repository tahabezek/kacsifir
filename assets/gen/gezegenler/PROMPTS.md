# 024 · Gezegenler Dünya ile Ay arasına sığar mı? · görsel promptları

Bu klasör ChatGPT'de üretilen görsellerin yeridir. Görselleri buraya kaydedin; ben bakıp seçeceğim.

## Nasıl üretilir

1. ChatGPT'de **yeni bir sohbet** açın. Bütün görseller aynı sohbette üretilmeli; böylece stil sabit kalır.
2. Önce **1. promptu** (Jüpiter) gönderin ve 3 varyant alın ("Yeniden oluştur" ile).
   Jüpiter stil çapası olduğu için en önemli görsel odur.
3. Ardından 2–9. promptları sırayla aynı sohbette gönderin. Her birinden 1–2 varyant yeterli.
4. Her görseli PNG olarak indirip bu klasöre şu adlarla kaydedin:
   `jupiter_1.png`, `jupiter_2.png`, `jupiter_3.png`, `saturn_1.png`, `dunya_1.png` …
   (adlar küçük harf, Türkçe karakter yok.)
5. Arka plan saydam gelmezse dert etmeyin; ben keserim. Görselin içine yazı girerse o varyantı atlayın.

**Stil çapası seçildi: `jupiter_2.png`.** Bu varyantta gezegenin içi beyazla dolu değil, saydam;
yalnızca mürekkep çizgileri opak. Kâğıt rengimiz içeriden göründüğü için zemine en iyi bu oturuyor.
Satürn'e geçmeden önce aynı sohbette şu mesajı bir kez gönderin:

```
Use the second Jupiter (the ink-only one) as the style reference for every image from now on. The interior of the planet must be transparent, with no white or gray fill: only the black ink marks are opaque, so the paper underneath shows through the light areas. Keep the same line weight, the same hatching density and the same thin black outline circle.
```

**Seçilenler (22 Ekim 2026):** jupiter_2 · saturn_1 · dunya_3 · ay_4_murekkep · merkur_2 · venus_1 · mars_1 ·
uranus_1 · neptun_1. İçi beyaz dolu olanlar (jupiter_1, 3, 5, dunya_1, 2, merkur_1) kullanılmıyor.

**Beyaz dolu görsel kurtarma:** ay_2–4 da içi beyaz dolu geldi. `*_murekkep.png` dosyaları beyazın
saydamlığa çevrilmiş hâli (alfa = koyuluk, renk = mürekkep #1C1B18):
`ffmpeg -i X.png -vf "format=rgba,geq=r='28':g='27':b='24':a='alpha(X,Y)*clip((255-(r(X,Y)+g(X,Y)+b(X,Y))/3)/227,0,1)'" X_murekkep.png`

### Düzeltme turu

**Ay (gerekli).** ay_1 gravür değil, gri boya lekesi gibi duruyor; açılış karesinde büyük göründüğü için yeniden üretilmeli:

```
Redraw the Moon in exactly the same engraving technique as the second Mercury image (the ink-only one): crisp crater rims drawn with fine lines, highlands in sparse stipple, and the dark maria built from dense parallel hatching and stipple dots, not from soft gray wash. Keep the real near-side layout: Mare Imbrium upper left, Mare Serenitatis and Tranquillitatis upper right of center, Mare Crisium near the right edge, Oceanus Procellarum on the left, Copernicus left of center and Tycho with its long rays in the south. Light from the upper left. Transparent interior, only black ink marks are opaque, thin black outline circle, sphere fills about 90% of a 1024x1024 canvas. No color, no gray wash, no glow, no text.
```

**Satürn (isteğe bağlı).** saturn_1'in kuşakları Jüpiter'e benziyor (fırtına lekeleri var) ve halkaların gezegene düşen gölgesi eksik:

```
Redraw Saturn in exactly the same engraving style as the Jupiter reference. Saturn's globe must look calmer than Jupiter: smooth, wide, softly hatched bands with no storms, spots or swirls. Rings tilted about 20 degrees, passing in front of the globe at the bottom and behind it at the top; the rings cast a clearly hatched shadow band across the globe, and the globe casts its shadow on the rings behind it. Clean Cassini division. Landscape canvas 1536x1024, planet and rings fill about 90% of the width. Transparent interior, only black ink marks are opaque. No color, no glow, no text.
```

---

## 1 · Jüpiter (stil çapası, 3 varyant)

```
Jupiter, drawn as a plate from a 19th-century astronomical atlas: a copperplate engraving made only of pure black ink lines on a transparent background.
Shading is done exclusively with fine parallel hatching, cross-hatching and stipple dots. Light comes from the upper left, the terminator falls on the lower right.
Show Jupiter's horizontal cloud belts and zones, the turbulent edges between them, and the Great Red Spot rendered only as denser concentric hatching (no color at all).
The sphere is perfectly round and centered, filling about 90% of a 1024x1024 square canvas.
No color, no gray wash, no gradient, no glow, no stars, no background, no text, no labels, no frame. PNG with transparent background.
```

## 2 · Satürn (yatay tuval)

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw Saturn.
Rings tilted about 20 degrees: the rings pass in front of the globe at the bottom and behind it at the top, and they cast a hatched shadow on the globe. Show the Cassini division as a clean gap.
Landscape canvas 1536x1024; planet and rings together fill about 90% of the width, centered.
Pure black ink only, no color, no glow, no stars, no text. PNG with transparent background.
```

## 3 · Dünya

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw planet Earth seen from space, centered on the Mediterranean Sea and Anatolia (Turkey), with Europe, North Africa and the Middle East visible and geographically accurate coastlines.
Oceans are lighter with sparse horizontal hatching, land is denser, and a few swirling cloud bands are drawn with fine curved lines.
Perfectly round sphere, centered, filling about 90% of a 1024x1024 square canvas.
Pure black ink only, no color, no glow, no stars, no text, no country borders. PNG with transparent background.
```

## 4 · Ay

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw the Moon's near side as seen from Earth: the dark maria rendered with dense stipple, the bright highlands with sparse stipple, and crisp crater rims including Tycho with its rays and Copernicus.
Perfectly round sphere, centered, filling about 90% of a 1024x1024 square canvas.
Pure black ink only, no color, no glow, no stars, no text. PNG with transparent background.
```

## 5 · Merkür

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw Mercury: a heavily cratered gray rocky surface with overlapping craters, a few bright ray craters and long scarps, all in hatching and stipple.
Perfectly round sphere, centered, filling about 90% of a 1024x1024 square canvas.
Pure black ink only, no color, no glow, no stars, no text. PNG with transparent background.
```

## 6 · Venüs

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw Venus: a thick, almost featureless cloud veil with very soft, sweeping V-shaped cloud streaks drawn with long thin curved lines; mostly light, little shading except on the night side.
Perfectly round sphere, centered, filling about 90% of a 1024x1024 square canvas.
Pure black ink only, no color, no glow, no stars, no text. PNG with transparent background.
```

## 7 · Mars

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw Mars: the Valles Marineris canyon across the middle, the dark Syrtis-like regions in denser hatching, three Tharsis volcanoes as small rings, and a bright north polar cap left almost white.
Perfectly round sphere, centered, filling about 90% of a 1024x1024 square canvas.
Pure black ink only, no color, no glow, no stars, no text. PNG with transparent background.
```

## 8 · Uranüs

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw Uranus: an almost featureless ice giant with very faint banding that runs nearly vertical because the planet is tipped on its side, and a slightly brighter polar region. Do not draw any rings.
Perfectly round sphere, centered, filling about 90% of a 1024x1024 square canvas.
Pure black ink only, no color, no glow, no stars, no text. PNG with transparent background.
```

## 9 · Neptün

```
Same exact engraving style, line weight and lighting as the Jupiter image. Now draw Neptune: faint horizontal cloud bands, one dark oval storm (the Great Dark Spot) in dense cross-hatching, and a few small bright cloud streaks left white. Do not draw any rings.
Perfectly round sphere, centered, filling about 90% of a 1024x1024 square canvas.
Pure black ink only, no color, no glow, no stars, no text. PNG with transparent background.
```

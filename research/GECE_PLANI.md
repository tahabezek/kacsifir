# Gece planı (2 → 3 Kasım 2026): 12 Hangisi filmi, karakterli ve yavaş

Kullanıcı: "Tüm karar sende, izin alma, hepsini bitir, sabah kontrol edeceğim." Hikâye temeli: research/HIKAYELER.md. Kullanıcının asıl derdi şu: izleyici olayın içine girsin. Bunun için insan (yüz, el, bakış) ekranda olmalı, film yavaş akmalı, bilgi az olmalı ve sayı yalnızca en sonda bir kez gelmeli.

## Kararlar
- **Merkez an:** Her kahramanın tek bir merkez anı var ve o ana 6–10 sn verilir. Geri kalan bilgi bu anı kurmak için 2–3 cümleyle geçer.
- **Sahne sayısı:** Her hikâyede en fazla 4 sahne. Film 62–70 sn.
- **Anlatım:** Hız `rate +2%`. Önemli cümleden sonra 0,8–1,2 sn durulur. Merkez anda anlatım 1,5 sn susar.
- **Ekrandaki yazı:** Başlık, isim kartı, altyazı ve en sonda tek karşılaştırma. Sahne ortasındaki sayaçlar kaldırıldı.
- **Karakterler:** `engine/figure.js`. Tek bir rig ile stilize 3B insan çizilir: eklem açılarıyla poz, kapsül hacimler, basit yüz (göz, kaş, ağız), saç türleri, giysi renkleri ve aksesuarlar. Her kahramanın bir kartı var. Hayvanlar ayrı modellerle çizilir.
- **Render:** `KACSIFIR_SAMPLES=10`, ardından CRF 21 ile yeniden kodlama, `prebuilt/` klasörüne kopyalama ve commit. CI, gönderiyi yayından yaklaşık 48 saat önce Buffer'a yükler. Gönderi daha önce yüklenmişse `tools/remedia.mjs <id>` kullanılır.
- **Sıra:** yayın tarihine göre: 041 (4 Kas), 060 (5), 035 (6), 063 (7), 036 (8), 064 (9), 061 (11), 065 (13), 037 (14), 066 (15), 038 (16), 039 (17).

## Durum
| Bölüm | Hikâye | Sahne | Render | Commit |
|---|---|---|---|---|
| figure.js | — | ⏳ | — | — |

# Kaç Sıfır? (@kacsifir)

Kafada canlanmayan sayıları tek hareketle kavranır hâle getiren, kodla çizilmiş ölçek videoları.
Günde 3 Reels: 08:30 · 13:00 · 20:30 (TR).

## Nasıl çalışır

```
episodes/*.json ──► tools/render.mjs ──► out/<id>/video.mp4
  (veri)              headless Chrome kare kare          │
                      + sentez ses, −14 LUFS              ▼
                                         'media' dalı ──► GitHub Pages (yönlendirmesiz statik URL)
                                                          │
tools/run.mjs (GitHub Actions, günde 4 kez) ─────────────►│ Buffer createPost
  önümüzdeki 48 saatin boş yuvalarını doldurur             customScheduled + dueAt
                                                          ▼
                                                   Instagram Reels
```

- **Motor:** `engine/core.js` (zaman çizelgesi, easing, yaylar; görüntü ve ses aynı saati okur) ve
  `engine/tower.js` ("kule" şablonu). Her kare `render(t)`'nin saf fonksiyonu, rastgelelik tohumlu.
- **Ses:** `tools/audio.mjs` görüntüyle aynı zaman çizelgesinden sentezlenir (La minör, 96 bpm, tek
  riser, tek impact, doruktan önce sessizlik), iki geçişli loudnorm ile −14 LUFS / ≤ −1 dBTP.
- **Kritik:** `npm run critique -- episodes/<dosya>.json` → temas kâğıdı, hızlı hareket şeridi,
  telefon testi, Reels arayüzü bindirmesi ve otomatik kapılar (donma, döngü dikişi, ses, determinizm).

## Güvenlik önlemleri (cinefia dersleri)

| Risk | Önlem |
|---|---|
| GitHub cron saatlerce gecikir/çalışmaz | Günde 4 deneme; her biri 48 saati doldurur. Gönderi saati Buffer `dueAt` ile kesin. |
| Çift paylaşım | Gerçeğin kaynağı Buffer kuyruğu: yuvada gönderi varsa atlanır; yayın çağrısından hemen önce tekrar bakılır. |
| Yeniden deneme çift gönderi yaratır | `createPost` tek deneme. Hata olursa sonraki çalıştırma Buffer'a bakar, boşsa yeniden dener. |
| Geç çalışan iş anında paylaşır | `shareNow` hiç kullanılmaz; 25 dk'dan yakın yuvalar planlanmaz. |
| Instagram sessizce reddeder | `firstComment` kullanılmaz (ücretsiz planda IG gönderisini düşürür). |
| Medya erişilemez | Pages dosyası 200 + `video/mp4` + birebir boyut doğrulanmadan Buffer'a verilmez; dosyalar 4 gün tutulur. |
| Aynı anda iki çalıştırma | `concurrency: kacsifir`, iptal yok. |
| Font makineye göre değişir | Fontlar yerel; glif kapısı, fontta olmayan karakter varsa render'ı durdurur. |
| Anahtar sızıntısı | `BUFFER_API_KEY` yalnızca GitHub Secrets'ta ve yerel `.env`'de (gitignore). |

## İşletme

| İş | Nasıl |
|---|---|
| Durum (kanal, kuyruk, hatalar, stok) | `npm run status` |
| Acil durdurma | Repo → Settings → Variables → `KACSIFIR_PAUSED` = `true` |
| Elle çalıştırma | Actions → "kacsifir planlayıcı" → Run workflow (`dry` = sadece render) |
| Yeni bölüm | `episodes/NNN-slug.json` ekle → `npm run render -- episodes/...` → `npm run critique -- ...` → commit |
| Bir bölümü çıkar | JSON'a `"disabled": true` |

Stok 3 günün altına inince çalıştırma özetinde uyarı çıkar; stok biterse iş kırmızıya düşer
(GitHub başarısız zamanlanmış işleri e-postayla bildirir).

## Bölüm şeması (kısa)

```json
{
  "id": "004", "slug": "...", "serial": "№ 004 · KONU", "direction": "up | down",
  "bpm": 96, "silenceBeats": 0.8, "rewindBeats": 2, "startFrac": 0.3,
  "question": ["iki satır", "soru"],
  "format": { "dec": 100, "units": [{ "upTo": 1e30, "div": 1, "name": "birim" }] },
  "items": [
    { "tag": "A", "name": "…", "value": 1, "grow": 3, "hold": 2.5 },
    { "tag": "B", "name": "…", "value": 1000, "grow": 6, "hold": 9, "hero": true, "kicker": "…" }
  ],
  "caption": "… Kaynak: …", "hashtags": ["#…"]
}
```

Her sayının açıklamada kaynağı olur. Kaynağı olmayan sayı yayınlanmaz.

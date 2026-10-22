# Anlatım: bölüm dosyasındaki "voice.lines" satırlarını edge-tts ile seslendirir; her satır için mp3 ve
# ölçülmüş kelime zamanları (WordBoundary) yazar. Zaman çizelgesi bu gerçek sürelerden kurulur (ses saattir).
#   py -3.14 tools/voice_tts.py episodes/033-....json            → assets/voice/<id>/<line>.mp3 + words.json
# Değişmeyen satırlar yeniden üretilmez (metin + ses + hız özeti).
import asyncio, hashlib, json, os, sys
import edge_tts

ep_file = sys.argv[1]
ep = json.load(open(ep_file, encoding='utf-8'))
v = ep['voice']
out = os.path.join('assets', 'voice', ep['id'])
os.makedirs(out, exist_ok=True)
words_file = os.path.join(out, 'words.json')
old = json.load(open(words_file, encoding='utf-8')) if os.path.exists(words_file) else {}

async def say(line):
    # satır bazında hız ve perde (dramatik satırlar daha yavaş ve pes): yoksa bölümün genel değeri
    rate, pitch = line.get('rate', v.get('rate', '+0%')), line.get('pitch', v.get('pitch', '+0Hz'))
    key = hashlib.sha1(f"{line['tts']}|{v['name']}|{rate}|{pitch}".encode()).hexdigest()[:12]
    mp3 = os.path.join(out, line['id'] + '.mp3')
    if old.get(line['id'], {}).get('key') == key and os.path.exists(mp3):
        return line['id'], old[line['id']]
    # Türkçe seslerde WordBoundary gelmiyor: cümle sınırları alınır, kelime zamanları whisper ile ölçülür
    # (tools/voice_words.py). Servis ara sıra boş yanıt veriyor: artan beklemeyle yeniden denenir.
    for k in range(30):
        try:
            com = edge_tts.Communicate(line['tts'], v['name'], rate=rate, pitch=pitch, boundary='SentenceBoundary')
            words, audio = [], bytearray()
            async for ch in com.stream():
                if ch['type'] == 'audio':
                    audio += ch['data']
                elif ch['type'] == 'SentenceBoundary':
                    words.append({'w': ch['text'], 't0': ch['offset'] / 1e7, 't1': (ch['offset'] + ch['duration']) / 1e7})
            break
        except edge_tts.exceptions.NoAudioReceived:
            await asyncio.sleep(min(2 + 2 * k, 12))
    else:
        raise SystemExit(f"{line['id']}: ses alınamadı")
    open(mp3, 'wb').write(audio)
    return line['id'], {'key': key, 'words': words}

async def main():
    res = {}
    for line in v['lines']:
        k, r = await say(line)
        res[k] = r
        print(k, len(r['words']), 'kelime', r['words'][-1]['t1'] if r['words'] else 0)
    json.dump(res, open(words_file, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

asyncio.run(main())

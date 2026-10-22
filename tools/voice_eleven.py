# Duygulu anlatım: ElevenLabs (with-timestamps uç noktası, harf zamanlarından kelime zamanları; whisper gerekmez).
# Anahtar .env içinde ELEVENLABS_API_KEY (kullanıcı kendisi girer). Ses ve model bölüm dosyasında:
#   "voice": { "eleven": { "voice_id": "...", "model": "eleven_multilingual_v2", "stability": 0.35, "style": 0.45 }, "lines": [...] }
# Satırda "say" varsa (ör. ElevenLabs v3 ses etiketleri: "[fısıltıyla] ...") o okunur; yoksa "tts".
#   py -3.14 tools/voice_eleven.py episodes/014-....json   → assets/voice/<id>/<line>.mp3 + words.json (voice_words ile aynı biçim)
import base64, hashlib, json, os, sys, time, urllib.request

def env_key():
    for line in open('.env', encoding='utf-8'):
        if line.startswith('ELEVENLABS_API_KEY='):
            return line.split('=', 1)[1].strip()
    raise SystemExit('.env içinde ELEVENLABS_API_KEY yok')

ep = json.load(open(sys.argv[1], encoding='utf-8'))
cfg = ep['voice']['eleven']
out = os.path.join('assets', 'voice', ep['id']); os.makedirs(out, exist_ok=True)
wf = os.path.join(out, 'words.json')
data = json.load(open(wf, encoding='utf-8')) if os.path.exists(wf) else {}
KEY = env_key()

def call(text, prev, nxt):
    body = {
        'text': text, 'model_id': cfg.get('model', 'eleven_multilingual_v2'),
        'voice_settings': {'stability': cfg.get('stability', 0.35), 'similarity_boost': cfg.get('similarity', 0.8),
                           'style': cfg.get('style', 0.45), 'use_speaker_boost': True},
        # komşu satırlar tonlamayı sürdürür (cümleler arası doğal akış)
        'previous_text': prev, 'next_text': nxt,
    }
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voice_id']}/with-timestamps?output_format=mp3_44100_128",
                                 data=json.dumps(body).encode(), headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    for k in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except Exception as e:
            print('yeniden deneniyor:', e); time.sleep(3 + 3 * k)
    raise SystemExit('ElevenLabs yanıt vermedi')

lines = ep['voice']['lines']
for i, ln in enumerate(lines):
    text = ln.get('say', ln['tts'])
    key = hashlib.sha1(f"eleven|{text}|{json.dumps(cfg, sort_keys=True)}".encode()).hexdigest()[:12]
    mp3 = os.path.join(out, ln['id'] + '.mp3')
    if data.get(ln['id'], {}).get('key') == key and os.path.exists(mp3):
        continue
    prev = lines[i - 1].get('say', lines[i - 1]['tts']) if i else ''
    nxt = lines[i + 1].get('say', lines[i + 1]['tts']) if i + 1 < len(lines) else ''
    r = call(text, prev, nxt)
    open(mp3, 'wb').write(base64.b64decode(r['audio_base64']))
    al = r['alignment']; ch, t0s, t1s = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    # harflerden kelimeler: boşlukla ayrılan her parça; köşeli ses etiketleri ([...]) kelime sayılmaz
    words, cur, a, b, tag = [], '', None, None, False
    for c, s0, s1 in zip(ch, t0s, t1s):
        if c == '[': tag = True
        if tag:
            if c == ']': tag = False
            continue
        if c.isspace():
            if cur: words.append({'w': cur, 't0': round(a, 3), 't1': round(b, 3)}); cur = ''
            continue
        if not cur: a = s0
        cur += c; b = s1
    if cur: words.append({'w': cur, 't0': round(a, 3), 't1': round(b, 3)})
    # metindeki kelimelerle eşle (görsel ipuçları tts metnindeki kelimelere bağlı)
    script = ln['tts'].split()
    if len(words) == len(script):
        for w, sw in zip(words, script): w['w'] = sw
    else:
        print(f"UYARI {ln['id']}: {len(script)} kelime beklenirken {len(words)} geldi")
    data[ln['id']] = {'key': key, 'wkey': key, 'words': words, 'dur': round(t1s[-1] + 0.25, 3)}
    print(ln['id'], f"{t1s[-1]:.2f} sn", len(words), 'kelime')
json.dump(data, open(wf, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

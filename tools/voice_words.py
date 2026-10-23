# Kelime zamanları: her anlatım satırı faster-whisper ile (Türkçe, kelime zaman damgalı) dinlenir; tanınan
# kelimeler metindeki kelimelere SIRAYLA eşlenir (metin değil konum: whisper sayıları rakamla yazabilir).
#   py -3.13 tools/voice_words.py episodes/014-....json   → assets/voice/<id>/words.json içine "words"
# Tanınan kelime sayısı metinle tutmazsa aradaki kelimeler hece sayısına göre dağıtılır ve uyarı basılır.
import difflib, json, os, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

ep = json.load(open(sys.argv[1], encoding='utf-8'))
out = os.path.join('assets', 'voice', ep['id'])
wf = os.path.join(out, 'words.json')
data = json.load(open(wf, encoding='utf-8'))
FF = os.path.join('node_modules', 'ffmpeg-static', 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
# ses ffmpeg ile çözülür (faster-whisper'ın PyAV sürümüyle uyumsuzluğu atlanır): 16 kHz mono float
def load(p):
    raw = subprocess.run([FF, '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
model = WhisperModel('small', device='cpu', compute_type='int8')
VOW = set('aeıioöuüAEIİOÖUÜâî')
syl = lambda w: max(1, sum(ch in VOW for ch in w))

for line in ep['voice']['lines']:
    rec = data[line['id']]
    if rec.get('wkey') == rec['key'] and rec.get('words') and '--force' not in sys.argv:
        continue
    script = [w for w in re.split(r'\s+', line['tts'].strip()) if w]
    segs, info = model.transcribe(load(os.path.join(out, line['id'] + '.mp3')), language='tr', word_timestamps=True,
                                  vad_filter=False, beam_size=5, condition_on_previous_text=False)
    heard = [w for s in segs for w in s.words if w.word.strip()]
    end = info.duration
    # hizalama: metindekine yeterince benzeyen kelimeler sabit nokta; aradakiler hece sayısıyla paylaştırılır
    norm = lambda w: re.sub(r"[^a-zçğıöşüâî0-9]", '', w.replace('İ', 'i').replace('I', 'ı').lower().split("'")[0])
    anchors, j = {}, 0
    for i, sw in enumerate(script):
        for k in range(j, min(j + 8, len(heard))):
            hw = norm(heard[k].word)
            # yalnız uzun kelimeler sabit nokta olur: 'bir', 'on' gibi kısa kelimeler başka yerde de geçer (rakamla duyulur)
            # benzerlik oranıyla (yanlış duyulan harflere dayanıklı; 'gemi' ≠ 'gemisiyle' gibi önek tuzaklarını eler)
            if hw and len(norm(sw)) >= 4 and len(hw) >= 4 and difflib.SequenceMatcher(None, norm(sw), hw).ratio() >= 0.72:
                anchors[i] = (heard[k].start, heard[k].end); j = k + 1; break
    a0 = heard[0].start if heard else 0.05
    b0 = heard[-1].end if heard else end - 0.05
    pts = [(-1, a0, a0)] + sorted((i, *v) for i, v in anchors.items()) + [(len(script), b0, b0)]
    words = [None] * len(script)
    for (ia, _, ta), (ib, tb, _) in zip(pts, pts[1:]):
        if ia >= 0: words[ia] = {'w': script[ia], 't0': round(anchors[ia][0], 3), 't1': round(anchors[ia][1], 3)}
        mid = list(range(ia + 1, ib))
        tot = sum(syl(script[m]) for m in mid) or 1; acc = 0
        for m in mid:
            t0 = ta + (tb - ta) * acc / tot; acc += syl(script[m])
            words[m] = {'w': script[m], 't0': round(t0, 3), 't1': round(ta + (tb - ta) * acc / tot, 3)}
    if len(anchors) < len(script):
        print(f"not {line['id']}: {len(anchors)}/{len(script)} kelime sabit; duyulan: {' '.join(h.word for h in heard)}")
    rec['words'] = words
    rec['dur'] = round(end, 3)
    rec['wkey'] = rec['key']
    print(line['id'], f"{end:.2f} sn", ' '.join(f"{w['w']}@{w['t0']:.2f}" for w in words))

json.dump(data, open(wf, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

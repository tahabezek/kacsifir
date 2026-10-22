# Satır içi sessizlik kısaltma: TTS cümle aralarına 1–1,5 sn boşluk koyuyor. Boşluklar sesin enerjisinden bulunur
# (10 ms pencerelerde tepeye göre −38 dB altı); satır içindeki MAX_GAP'ten uzun her sessizlik KEEP'e indirilir,
# baştaki ve sondaki sessizlik 0,05 sn bırakılır. Dramatik duraklamalar satır aralarında (voice.gaps) verilir.
# Sıra: voice_tts → voice_trim → voice_words (kelime zamanları kırpılmış seste ölçülür).
#   py -3.13 tools/voice_trim.py episodes/014-....json
import json, os, subprocess, sys
import numpy as np

MAX_GAP, KEEP, EDGE, SR, WIN = 0.40, 0.30, 0.05, 44100, 441
FF = os.path.join('node_modules', 'ffmpeg-static', 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
ep = json.load(open(sys.argv[1], encoding='utf-8'))
out = os.path.join('assets', 'voice', ep['id']); wf = os.path.join(out, 'words.json')
data = json.load(open(wf, encoding='utf-8'))

for ln in ep['voice']['lines']:
    rec = data[ln['id']]
    if rec.get('trimmed') == rec.get('key') and '--force' not in sys.argv:
        continue
    mp3 = os.path.join(out, ln['id'] + '.mp3')
    raw = subprocess.run([FF, '-v', 'error', '-i', mp3, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).copy()
    n = len(x) // WIN
    rms = np.sqrt((x[:n * WIN].reshape(n, WIN) ** 2).mean(axis=1) + 1e-12)
    loud = 20 * np.log10(rms / rms.max()) > -38
    idx = np.flatnonzero(loud)
    if not len(idx):
        continue
    first, last = idx[0], idx[-1]
    keep = np.zeros(n, dtype=bool)
    keep[max(0, first - int(EDGE * 100)):min(n, last + 1 + int(EDGE * 100))] = True
    # iç sessizlikler: ardışık sessiz pencere koşuları
    i = first
    while i <= last:
        if not loud[i]:
            j = i
            while j <= last and not loud[j]: j += 1
            if (j - i) / 100 > MAX_GAP:
                drop0 = i + int(KEEP * 50); drop1 = j - int(KEEP * 50)
                keep[drop0:drop1] = False
            i = j
        else:
            i += 1
    # tutulan pencereleri 12 ms çapraz geçişle birleştir
    fade = int(0.012 * SR); pieces = []
    runs = np.flatnonzero(np.diff(np.concatenate([[0], keep.astype(int), [0]])))
    for a, b in zip(runs[::2], runs[1::2]):
        seg = x[a * WIN:b * WIN].copy()
        if pieces and len(seg) > fade and len(pieces[-1]) > fade:
            r = np.linspace(0, 1, fade, dtype=np.float32)
            pieces[-1][-fade:] = pieces[-1][-fade:] * (1 - r) + seg[:fade] * r
            seg = seg[fade:]
        pieces.append(seg)
    y = np.concatenate(pieces)
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '160k', mp3], input=y.tobytes(), check=True)
    print(ln['id'], f"{len(x) / SR:.2f} → {len(y) / SR:.2f} sn")
    rec['trimmed'] = rec.get('key'); rec['wkey'] = None   # kelimeler yeniden ölçülecek
json.dump(data, open(wf, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

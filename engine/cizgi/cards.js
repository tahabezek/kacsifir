// Kaç Sıfır? çizgi kadrosu: gerçek hikâyelerin kişileri. Kart değerleri DONDURULMUŞTUR (oran, palet, çizgi, siluet);
// sahnede değişmez. Biçim ve özellik adları cizgi/cast.js'te (nedenoluyor'dan): hoodie, suit, tie, jacket, vest,
// cardigan, skirt; hairMessy, hairSlick, hairSpiky, bun, baldSides; mustacheThick, mustacheThin; glassesRect, glassesCat.
// Birim: baş yüksekliği = 1. Boy (baş sayısı) ≈ head.h + neck + torso.len + leg.upper + leg.lower + shoe.h.

const base = (o) => ({
  head: { w: 0.92, h: 1, ear: 0.12 }, neck: 0.06,
  eyes: { gap: 0.34, w: 0.19, h: 0.23, y: 0.03 }, line: 0.05, idle: { blink: [2.6, 5.4] },
  ...o,
});

export const CARDS = {
  // № 041 · Carlos Kaiser: kıvırcık koyu saç, bıyık, kırmızı forma, beyaz şort
  kaiser: base({
    key: 'kaiser', name: 'Carlos Kaiser', seed: 101,
    torso: { len: 0.86, shoulder: 0.7, hip: 0.56, depth: 0.42, belly: 0, color: '#C8323A', shade: '#A4262D' },
    arm: { upper: 0.42, lower: 0.4, w: 0.18, color: '#C8323A', shade: '#A4262D', hand: 0.13 },
    leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#F4F1EA', shade: '#D9D4C8' },
    shoe: { color: '#1E1E1E', len: 0.3, h: 0.11 },
    skin: '#C48A5E', skinShade: '#A8724A', hair: '#1E1814',
    features: ['hairMessy', 'mustacheThin'],
  }),
  // kulüp başkanı: takım elbise, kalın bıyık, yanlar dökük
  patron: base({
    key: 'patron', name: 'Patron', seed: 113,
    head: { w: 0.9, h: 1.04, ear: 0.12 }, neck: 0.08,
    torso: { len: 0.96, shoulder: 0.78, hip: 0.66, depth: 0.5, belly: 0.12, color: '#2E3440', shade: '#232831' },
    arm: { upper: 0.44, lower: 0.42, w: 0.19, color: '#2E3440', shade: '#232831', hand: 0.13 },
    leg: { upper: 0.42, lower: 0.4, w: 0.2, color: '#2A2F38', shade: '#1F232A' },
    shoe: { color: '#1A1A1A', len: 0.32, h: 0.11 },
    skin: '#D9A27A', skinShade: '#C08760', hair: '#3A332C',
    features: ['suit', 'tie', 'baldSides', 'mustacheThick'],
  }),
  hakem: base({
    key: 'hakem', name: 'Hakem', seed: 127,
    torso: { len: 0.86, shoulder: 0.66, hip: 0.54, depth: 0.4, belly: 0, color: '#1F2421', shade: '#141816' },
    arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#1F2421', shade: '#141816', hand: 0.12 },
    leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#1F2421', shade: '#141816' },
    shoe: { color: '#1A1A1A', len: 0.3, h: 0.11 },
    skin: '#E9B98F', skinShade: '#D29E74', hair: '#2A211C',
    features: ['hairSlick'],
  }),
  // № 041 · Kazu (15): ince, düz siyah saç, okul ceketi
  kazu15: base({
    key: 'kazu15', name: 'Kazu (15)', seed: 131,
    head: { w: 0.9, h: 1, ear: 0.12 }, neck: 0.06,
    torso: { len: 0.78, shoulder: 0.6, hip: 0.5, depth: 0.38, belly: 0, color: '#2E4A6B', shade: '#233A55' },
    arm: { upper: 0.38, lower: 0.36, w: 0.16, color: '#2E4A6B', shade: '#233A55', hand: 0.12 },
    leg: { upper: 0.4, lower: 0.38, w: 0.18, color: '#3A3F48', shade: '#2B2F36' },
    shoe: { color: '#262626', len: 0.28, h: 0.11 },
    skin: '#F0CFA8', skinShade: '#D8B48C', hair: '#16130F',
    features: ['jacket', 'hairSlick'],
  }),
  // № 041 · Kazu (59): kır saç, kırmızı forma, hâlâ ince ve dik
  kazu59: base({
    key: 'kazu59', name: 'Kazu (59)', seed: 137,
    head: { w: 0.9, h: 1, ear: 0.12 }, neck: 0.07,
    torso: { len: 0.84, shoulder: 0.66, hip: 0.52, depth: 0.4, belly: 0, color: '#C2412F', shade: '#9E3324' },
    arm: { upper: 0.42, lower: 0.4, w: 0.17, color: '#F0CFA8', shade: '#D8B48C', hand: 0.12 },
    leg: { upper: 0.42, lower: 0.4, w: 0.19, color: '#1F2421', shade: '#141816' },
    shoe: { color: '#F4F1EA', len: 0.3, h: 0.11 },
    skin: '#F0CFA8', skinShade: '#D8B48C', hair: '#B9B4AE',
    eyes: { gap: 0.34, w: 0.18, h: 0.22, y: 0.03, lid: 0.18 },
    features: ['hairSlick'],
  }),
};

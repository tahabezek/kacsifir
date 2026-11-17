// № 081 · Bir günlük çay tek bardağa konsa? (çizgi motoru, pilot, yapı A "tek plan ölçek", iki sesli).
// Senaryo: research/pilot/081.md. Gerçekler ve hesap: episodes/081-turkiye-bir-gunde-cay.json → facts.
// 2. sürüm (bağımsız kritik sonrası): kanca iddia ("…neredeyse Galata Kulesi'ne yetişir"), başlık sahnenin içinde kara
// tahtada; damla bulutu yerine dev bardağa dökülen iki bardak sırası; kule "Galata" kelimesine kilitli; kuyruk 1,4 sn.
// TEK PLAN, KESMESİZ: kare 0'da çay ocağının masasında buharı tüten tek ince belli bardak. Kamera log uzayında sürekli
// geri çekilir: masa → çay ocağının apartmanı → mahalle → tepelere yayılan şehir. Çay içilen her pencere kehribar yanar,
// sayaç birikir (245 milyon). Sonra her pencereden çay damlası ilk bardağa uçar; bardak aynı biçimde 626 kat büyür
// (∛245.000.000). Sessizlikten sonra Galata Kulesi yerden "hop" diye yükselip yanına oturur. Döngü: bardak küçülürken
// kamera aynı hızla ona geri yaklaşır; son kare ilk kare.
// Dünya birimi metre; y yukarı negatif; zemin y = 0; masa üstü y = -0,75; bardak tabanı (0, -0,75).
// Ölçek tutarlı: her şey gerçek boyunda; dev bardak dışında hiçbir şey büyütülmez.

const GH = 0.093, TABLE = 0.75, GROW = Math.cbrt(245e6);   // bardak yüksekliği (m), masa, büyüme oranı ≈ 626
const TOWER_X = 46.5, TOWER_H = 66.9, TOWER_R = 8.2, TOWER_ROOF = 62.6;   // Galata: külah 62,59 m, süs 66,9 m, dış çap 16,45 m

// kule "Galata" kelimesinden 0,05 sn önce yükselmeye başlar (600 ms); vuruş sessizliğin sonunda, kalkışta
export function hero(T) { return T.l05 - 0.05; }
const POUR = T => [T.w('l03', 'bardak') - 0.4, T.l04end + 0.05];   // bardak sırası: ilk çıkış, son çıkış + yol
export function cues(T) {
  const H = hero(T), [p0, p1] = POUR(T);
  return {
    tick: [3.0, 3.5],                                       // masaya konan bardaklar
    flutter: [[p0 + 1.3, p1]],                               // dev bardağa dökülen çay
    whip: [[T.loop0 - 0.05, T.loop0 + 0.85]],               // döngü: bardağa geri yaklaşma
    riser: [T.l04, T.l04end + 0.05],
    silence: [T.l04end + 0.06, H],
    impact: H,
    loopEnd: T.loop0,
  };
}

// monoton kübik (Fritsch–Carlson); uçlarda eğim 0
function mono(xs, ys) {
  const n = xs.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i + 1 < n; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  for (let i = 1; i + 1 < n; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]);
  return x => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], u = (x - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}

export async function film(A) {
  const { ctx, T, D, PAL, ease, seg, lerp, clamp01, mulberry32, poly, rect, circ, ell, line, text, ch, CARDS } = A;
  const w = (id, k) => T.w(id, k);
  const H = hero(T);
  const TEA = '#B4521E', TEA_TOP = '#D9803F', GLASS = '#EEF4F2', AMBER = '#F2B544', WIN = '#7C8896', SKY = '#F3DAB4';

  // ——— kamera: (S px/m, bardak tabanının ekran konumu sx, sy); log S monoton kübikle, tek sürekli hareket ———
  const LAND = H + 0.6, Z0 = w('l05', 'Bunu') - 0.95, Z1 = w('l05', 'Bunu') - 0.1;   // kapanış: kulenin kapısına 1,6x (yay 170/26), "Bunu" ile geniş kareye dönüş
  // kapanış: kıyas çizgisinin ortasına (P) 600 ms'de 1,15x yaklaşma; P'nin ekran konumu sabit kalır
  const S0 = 10.2, X0 = 390, Y0 = 1100, PX = 39, PY = -59, about = z => { const px = X0 + PX * S0, py = Y0 + (PY + TABLE) * S0; return [z, px - PX * z, py - (PY + TABLE) * z]; };
  const K = [
    [0, 2700, 540, 1240],
    [1.2, 2700, 540, 1240],             // tahta 1,2 sn sabit okunur
    [2.6, 900, 540, 960],
    [T.l01end + 0.1, 420, 540, 900],   // yüzler altyazının üstünde kalır
    [T.l02end + 0.2, 50, 540, 1170],
    [T.l03end + 0.2, 4.6, 540, 1150],
    [T.l04end, 7.0, 470, 1120],
    [LAND, 9.9, 392, 1100],
    [T.loop0, ...about(S0 * 1.04)],
  ];
  const fz = mono(K.map(k => k[0]), K.map(k => Math.log(k[1]))), fx = mono(K.map(k => k[0]), K.map(k => k[2])), fy = mono(K.map(k => k[0]), K.map(k => k[3]));
  const loopU = t => ease.state(clamp01((t - T.loop0) / (D - 0.3 - T.loop0)));   // son 0,3 sn kare 0'ın kadrajında durur (dikiş)
  const OM = Math.sqrt(170), spring = u => u <= 0 ? 0 : 1 - (1 + OM * u) * Math.exp(-OM * u);   // 170/26 ≈ kritik sönüm
  const camAt = t => {
    if (t < T.loop0) {
      let S = Math.exp(fz(t)), sx = fx(t), sy = fy(t);
      const b = spring(t - Z0) - spring(t - Z1); if (Math.abs(b) < 1e-4) return [S, sx, sy];
      // kulenin kapısının önündeki insan (48,5; -1) ekranda (600, 1060) noktasına gelir; zoom log uzayında 2,5x
      const PXw = 48.5, PYw = -1.0, px0 = sx + PXw * S, py0 = sy + (PYw + TABLE) * S, S2 = S * Math.pow(1.6, b);
      const px = lerp(px0, 600, b), py = lerp(py0, 1060, b);
      return [S2, px - PXw * S2, py - (PYw + TABLE) * S2];
    }
    const u = loopU(t), a = K.at(-1), b = K[0];
    return [Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), u)), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
  };
  // bardağın büyüme oranı: ilk bardak ağza varınca başlar, sessizliğin sonunda 626'ya oturur; döngüde kamerayla 1'e döner
  const [P0, P1] = POUR(T), TT = 1.3, G0 = P0 + TT, GEND = H - 0.05;
  // dev bardağın çay çizgisi: bardak sırası döküldükçe %55'ten normal doluluğa yükselir (bardak büyürken içi dolar)
  // açılış: çaydanlıktan dökülen çay %80'den normal doluluğa; döngüde %80'e geri (kare 0 ile aynı)
  const fillAt = t => t >= T.loop0 ? lerp(1, 0.8, loopU(t)) : t < 1.4 ? lerp(0.8, 1, ease.state(seg(t, 0.25, 0.9))) : t < G0 ? 1 : lerp(0.55, 1, ease.state(clamp01((t - G0) / (GEND - G0))));
  // demlik eğilir (0–0,25 sn), çay akar (0,15–1,2 sn), demlik doğrulur (1,05–1,3 sn)
  const DCX = 0.24, DPV = [DCX - 0.058, -TABLE - 0.13];
  const tiltAt = t => -0.42 * (ease.state(seg(t, 0, 0.25)) - ease.state(seg(t, 1.05, 0.25)));
  const spoutAt = t => { const a = tiltAt(t), dx = (DCX - 0.085) - DPV[0], dy = (-TABLE - 0.218) - DPV[1]; return [DPV[0] + dx * Math.cos(a) - dy * Math.sin(a), DPV[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
  const pourStream = t => {
    const u1 = ease.enter(seg(t, 0.15, 0.2)), u0 = ease.exit(seg(t, 1.0, 0.2)); if (u1 <= u0 || t > 1.3) return;
    const [tx, ty] = spoutAt(t), ex = 0.004, ey = -TABLE - 0.004 - 0.077 * fillAt(t), qx = 0.06, qy = ty - 0.012;
    ctx.beginPath();
    for (let j = 0; j <= 20; j++) { const u = lerp(u0, u1, j / 20), a = 1 - u, x = a * a * tx + 2 * a * u * qx + u * u * ex, y = a * a * ty + 2 * a * u * qy + u * u * ey; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 0.007 + L(5); ctx.stroke(); ctx.strokeStyle = TEA; ctx.lineWidth = 0.007; ctx.stroke();
  };
  const growAt = t => {
    if (t >= T.loop0) return Math.exp(Math.log(GROW) * (1 - loopU(t)));
    const q = clamp01((t - G0) / (GEND - G0)); return Math.exp(Math.log(GROW) * (1 - Math.pow(1 - q, 2.2)));   // hızlı başlar, sessizlikte yavaşça oturur
  };

  // ——— şehir: tohumlu binalar, satır satır (öndeki mahalle + tepelere yayılan arka sıralar) ———
  const PALB = ['#E9DFC9', '#D9A27A', '#C9B07A', '#B9C7B0', '#E4C9A8', '#CDBBA0', '#D8B4A0', '#BFC9CF'];
  const mix = (hex, k) => { const n = parseInt(hex.slice(1), 16), s = parseInt(SKY.slice(1), 16), c = sh => Math.round(((n >> sh) & 255) * (1 - k) + ((s >> sh) & 255) * k); return `rgb(${c(16)},${c(8)},${c(0)})`; };
  const rows = [];
  const hill = (x, base, amp, ph) => base - amp * (0.5 + 0.5 * Math.sin(x / 70 + ph)) - amp * 0.3 * Math.sin(x / 23 + ph * 2);
  const ROWDEF = [   // [taban, tepe genliği, ölçek, yarı genişlik, solukluk, yanma aralığı]
    [-92, 30, 0.55, 420, 0.55, [T.l03 + 0.2, w('l03', 'milyon')]],
    [-58, 22, 0.7, 340, 0.4, [T.l03, w('l03', 'milyon') - 0.1]],
    [-26, 14, 0.85, 270, 0.22, [T.l02end - 0.4, w('l03', 'yüz')]],
    [0, 0, 1, 190, 0, [T.l02 + 0.6, w('l03', 'kırk')]],
  ];
  const r0 = mulberry32(8101);
  ROWDEF.forEach(([base, amp, k, half, fade, [on0, on1]], ri) => {
    const bs = [], ph = ri * 1.7;
    let x = -half;
    while (x < half) {
      const bw = (10 + r0() * 7) * k, floors = 3 + Math.floor(r0() * (ri === 3 ? 5 : 4)), fh = 3.1 * k;
      const front = ri === 3, heroB = front && x < 7 && x + bw > -7;
      if (heroB) { x = 7.6; continue; }   // çay ocağının apartmanı ayrıca çizilir
      const by = front ? 0 : hill(x + bw / 2, base, amp, ph), bh = floors * fh + 1.2 * k;
      const wins = [], cols = Math.max(2, Math.floor(bw / (3.4 * k)));
      for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
        const wx = x + (c + 0.5) * bw / cols, wy = by - (f + 0.5) * fh - 0.4 * k;
        const ton = on0 + (on1 - on0) * Math.pow(r0(), 0.75), tdep = P0 + (P1 - TT - P0) * Math.pow(r0(), 1.1);
        wins.push({ x: wx, y: wy, ton, tdep });
      }
      const dome = !front && ri === 0 && Math.abs(x + 150) < 9 || (ri === 1 && Math.abs(x - 210) < 8);
      bs.push({ x, w: bw, by, h: bh, col: mix(PALB[Math.floor(r0() * PALB.length)], fade), roof: r0() < 0.35, wins, k, dome });
      x += bw + (front ? 0.6 : 0.3) * k;
    }
    rows.push({ base, amp, k, half, fade, ph, bs, ri });
  });
  // çay ocağının apartmanı: 14 m, 5 kat; pencereler l02'de yanar
  const HB = { x: -7, w: 14, floors: 5, fh: 3.1, wins: [] };
  { const r = mulberry32(8102);
    for (let f = 1; f < HB.floors; f++) for (let c = 0; c < 4; c++) HB.wins.push({ x: HB.x + 1.75 + c * 3.5, y: -(f + 0.5) * HB.fh - 0.2, ton: T.l01end - 0.6 + (T.l02end - T.l01end + 0.4) * ((f - 1) * 4 + c + r() * 0.8) / 16, tdep: P0 + r() * 0.8 }); }
  const ALLW = [...HB.wins, ...rows.flatMap(r => r.bs.flatMap(b => b.wins))];
  const lit = (wn, t) => t >= wn.ton && t < wn.tdep && t < T.loop0;

  // ——— çizimler ———
  let S = 1, g = 1;                       // bu karenin ölçeği (px/m) ve bardağın büyüme oranı
  const L = (px = 6) => px / S;           // ekranda sabit mürekkep kalınlığı
  const glassPath = () => {
    ctx.beginPath();
    ctx.moveTo(-0.024, 0); ctx.quadraticCurveTo(-0.031, -0.014, -0.027, -0.026); ctx.quadraticCurveTo(-0.018, -0.044, -0.02, -0.056);
    ctx.quadraticCurveTo(-0.024, -0.076, -0.031, -GH); ctx.lineTo(0.031, -GH); ctx.quadraticCurveTo(0.024, -0.076, 0.02, -0.056);
    ctx.quadraticCurveTo(0.018, -0.044, 0.027, -0.026); ctx.quadraticCurveTo(0.031, -0.014, 0.024, 0); ctx.closePath();
  };
  // ince belli bardak, tabak, kaşık; (x, y) taban, k ölçek; steam: buhar
  const teaGlass = (x, y, k, t, steam = true, fill = 1) => {
    const px = GH * k * S; if (px < 0.8) return;
    if (px < 5) { rect(x - 0.03 * k, y - GH * k, 0.06 * k, GH * k, TEA, 0); return; }
    const lw = L(6) / k;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    // tabak
    poly([[-0.068, -0.004], [0.068, -0.004], [0.05, 0.008], [-0.05, 0.008]], '#F2EBDD', lw * 0.8);
    line(-0.066, -0.004, 0.066, -0.004, lw * 0.9, PAL.red);
    // kaşık (tabağa yaslı)
    ctx.save(); ctx.translate(-0.046, -0.006); ctx.scale(-1, 1); ctx.rotate(-0.12); rect(0, -0.003, 0.05, 0.005, '#C9CFD2', lw * 0.5, 0.002); ell(0.056, -0.0005, 0.009, 0.0045, '#C9CFD2', lw * 0.5); ctx.restore();
    // bardak: önce cam, sonra çay (cama kırpılmış), sonra çizgi
    glassPath(); ctx.fillStyle = GLASS; ctx.fill();
    ctx.save(); glassPath(); ctx.clip();
    const ty = -0.004 - 0.077 * fill;   // çay yüzeyi (fill 1 = normal doluluk)
    ctx.fillStyle = TEA; ctx.fillRect(-0.04, ty, 0.08, 0.009 - ty);
    ctx.fillStyle = TEA_TOP; ctx.fillRect(-0.04, ty, 0.08, 0.004);
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-0.019, -0.088, 0.005, 0.03); ctx.fillRect(-0.022, -0.022, 0.004, 0.016); ctx.globalAlpha = 1;
    ctx.restore();
    glassPath(); ctx.lineWidth = lw; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke();
    line(-0.031, ty, 0.031, ty, lw * 0.5, '#7A2E12');
    ctx.restore();
    if (steam) steamOf(x, y, k, t);
  };
  // buhar: üç dalgalı iz, yukarı akar (t'nin saf fonksiyonu)
  const steamOf = (x, y, k, t) => {
    const lw = L(6) / k;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    for (let i = 0; i < 3; i++) {
      const x0 = -0.012 + i * 0.012, ph = t * 1.1 + i * 0.37;
      ctx.beginPath();
      for (let j = 0; j <= 14; j++) {
        const u = j / 14, yy = -GH - 0.006 - u * 0.075, xx = x0 + Math.sin(u * 7 - t * 3.2 + i * 2) * 0.006 * (0.4 + u);
        j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      const fr = (ph % 1);
      ctx.setLineDash([0.02, 0.012]); ctx.lineDashOffset = fr * 0.032 + t * 0.03;
      ctx.lineWidth = lw * 1.3; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round'; ctx.globalAlpha = 0.85; ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    ctx.restore();
  };
  // masa (çay ocağının önünde), üstünde bardaklar, arkasında iki müşteri
  const kisi = (card, o, t) => { const c = CARDS[card]; ch({ ...c, line: L(5.5) / o.s }, o, t); };
  const table = t => {
    const lw = L(6);
    // ocak tezgâhı: önü çini kaplı (mavi-beyaz), üstü ahşap
    rect(-0.48, -TABLE + 0.03, 0.96, TABLE - 0.03, '#E9EEF0', lw);
    if (S > 60) for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) {
      const x = -0.48 + i * 0.12, y = -TABLE + 0.06 + j * 0.12;
      rect(x, y, 0.12, 0.12, j % 2 === i % 2 ? '#E9EEF0' : '#DCE6EC', L(2.5));
      ell(x + 0.06, y + 0.06, 0.03, 0.03, '#2E5E8C', L(2)); ell(x + 0.06, y + 0.06, 0.012, 0.012, '#E2B13C', 0);
    }
    { const f = 0.4 * (ease.state(seg(t, 2.85, 0.3)) - ease.state(seg(t, 5.5, 0.3)));   // altyazının arkasında çini %40 solar
      if (f > 0.002 && S > 60) { ctx.globalAlpha = f; ctx.fillStyle = '#EEF2F4'; ctx.fillRect(-0.48, -TABLE + 0.03, 0.96, TABLE - 0.03); ctx.globalAlpha = 1; } }
    rect(-0.5, -TABLE, 1.0, 0.04, '#A87A4E', lw, 0.006);
    // şekerlik: cam kâse, üstünde küp şekerler
    if (S > 60) {
      for (const [cx, cy] of [[-0.2, -0.808], [-0.186, -0.808], [-0.172, -0.808], [-0.193, -0.822], [-0.179, -0.822]]) rect(cx - 0.006, cy - 0.006, 0.012, 0.012, '#FFFFFF', lw * 0.5, 0.002);
      poly([[-0.218, -0.8], [-0.154, -0.8], [-0.162, -TABLE], [-0.21, -TABLE]], GLASS, lw);
      // çaydanlık: altta çelik kaynatan, üstte porselen demlik; demlikten ince buhar
      const cx = 0.24, b = -TABLE;
      poly([[cx - 0.085, b - 0.13], [cx + 0.085, b - 0.13], [cx + 0.095, b], [cx - 0.095, b]], '#C9CFD2', lw);
      poly([[cx - 0.085, b - 0.09], [cx - 0.14, b - 0.15], [cx - 0.128, b - 0.156], [cx - 0.085, b - 0.115]], '#C9CFD2', lw * 0.8);
      ctx.beginPath(); ctx.arc(cx, b - 0.13, 0.07, Math.PI * 1.15, Math.PI * 1.85); ctx.lineWidth = lw * 2.2; ctx.strokeStyle = PAL.ink; ctx.stroke();
      ctx.save(); ctx.translate(DPV[0], DPV[1]); ctx.rotate(tiltAt(t)); ctx.translate(-DPV[0], -DPV[1]);
      poly([[cx - 0.05, b - 0.215], [cx + 0.05, b - 0.215], [cx + 0.058, b - 0.13], [cx - 0.058, b - 0.13]], '#F4EFE3', lw);
      rect(cx - 0.055, b - 0.18, 0.11, 0.014, PAL.red, 0);
      ell(cx, b - 0.218, 0.04, 0.008, '#F4EFE3', lw * 0.8); circ(cx, b - 0.228, 0.008, PAL.red, lw * 0.6);
      poly([[cx - 0.05, b - 0.19], [cx - 0.085, b - 0.215], [cx - 0.08, b - 0.222], [cx - 0.048, b - 0.205]], '#F4EFE3', lw * 0.8);
      ctx.restore();
    }
  };
  // kara tahta: çay ocağının menü tahtası; kancanın başlığı sahnenin içinde, tebeşirle (kare 0 = kapak)
  const board = t => {
    if (S < 120) return;
    const lw = L(6), x0 = -0.15, x1 = 0.15, y0 = -1.1, y1 = -0.93;
    line(-0.06, y0, 0, y0 - 0.04, L(3)); line(0.06, y0, 0, y0 - 0.04, L(3)); circ(0, y0 - 0.04, 0.005, '#8A8A8A', L(2));
    rect(x0 - 0.012, y0 - 0.012, x1 - x0 + 0.024, y1 - y0 + 0.024, '#8A5A34', lw, 0.006);
    rect(x0, y0, x1 - x0, y1 - y0, '#2F4A3A', L(3));
    const tl = (str, y, px, col, font, weight) => {   // 1000'e bölünmüş ölçekte yazı: küçük dünya boyutunda temiz glif
      ctx.save(); ctx.translate(0, y); ctx.scale(0.001, 0.001);
      let size = px; ctx.font = `${weight} ${size}px ${font}`;
      while (ctx.measureText(str).width > 260 && size > 10) { size -= 1; ctx.font = `${weight} ${size}px ${font}`; }
      ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(str, 0, 0); ctx.textAlign = 'left'; ctx.restore();
    };
    tl('SAYILARLA TÜRKİYE · ÇAY', -1.078, 13, '#C9D3C4', 'IBM Plex Mono', 600);
    tl('Bir günlük çay', -1.035, 34, '#F4EFE3', 'Archivo', 800);
    tl('tek bardağa konsa?', -0.99, 34, '#F2C14E', 'Archivo', 800);
    line(-0.1, -0.955, 0.1, -0.955, L(3), '#C9D3C4');
  };
  // çay ocağının apartmanı
  const heroBuilding = t => {
    const lw = L(5), top = -HB.floors * HB.fh - 1.0;
    rect(HB.x, top, HB.w, -top, '#E4D3B4', lw);
    rect(HB.x - 0.3, top - 0.5, HB.w + 0.6, 0.6, '#B8936A', lw);
    for (let f = 1; f < HB.floors; f++) line(HB.x, -f * HB.fh, HB.x + HB.w, -f * HB.fh, L(2.5), '#C9B48F');
    for (const wn of HB.wins) { rect(wn.x - 0.65, wn.y - 0.8, 1.3, 1.6, lit(wn, t) ? AMBER : WIN, L(4)); line(wn.x, wn.y - 0.8, wn.x, wn.y + 0.8, L(3)); rect(wn.x - 0.85, wn.y + 0.8, 1.7, 0.18, '#C9B48F', L(3)); }
    // zemin kat: çay ocağı
    rect(-5.2, -2.6, 6.2, 2.2, '#C98E5A', lw);
    if (S > 90) for (let x = -5.2 + 0.14; x < 1.0; x += 0.14) line(x, -2.6, x, -0.4, L(2.5), '#B37A4A');
    if (S > 90) { rect(-5.2, -1.62, 6.2, 0.03, '#7A5638', L(3)); for (let x = -1.0; x < 0.95; x += 0.11) if (Math.abs(x) > 0.2) teaGlass(x, -1.62, 1, t, false); }   // raf: dizili bardaklar
    for (let i = 0; i < 4; i++) line(-5.2 + i * 1.55, -2.6, -5.2 + i * 1.55, -0.4, L(3));
    rect(2.0, -2.7, 1.6, 2.7, '#6A4A2E', lw); circ(3.35, -1.35, 0.06, '#E2B13C', L(2));
    for (let i = 0; i < 7; i++) poly([[-5.5 + i * 1.33, -3.1], [-5.5 + (i + 1) * 1.33, -3.1], [-5.5 + (i + 1) * 1.33 + 0.1, -2.55], [-5.5 + i * 1.33 + 0.1, -2.55]], i % 2 ? '#F4EFE3' : PAL.red, L(3));
    rect(-4.2, -4.0, 6.4, 0.75, '#2E4A6B', L(4), 0.1); text('ÇAY OCAĞI', -1.0, -3.42, 0.5, '#F4EFE3', 'Archivo', 800);
  };
  const building = (b, t, lw) => {
    rect(b.x, b.by - b.h, b.w, b.h + (b.k < 1 ? 6 : 0), b.col, lw);
    if (b.roof) poly([[b.x - 0.4 * b.k, b.by - b.h], [b.x + b.w / 2, b.by - b.h - 3 * b.k], [b.x + b.w + 0.4 * b.k, b.by - b.h]], mix('#B5654A', 0.2 + (1 - b.k)), lw);
    const ws = 1.0 * b.k, wh = 1.3 * b.k, big = ws * S > 2.2;
    for (const wn of b.wins) {
      const on = lit(wn, t);
      if (big) rect(wn.x - ws / 2, wn.y - wh / 2, ws, wh, on ? AMBER : mix(WIN, 1 - b.k), lw * 0.6);
      else if (on) { ctx.fillStyle = AMBER; ctx.fillRect(wn.x - ws / 2, wn.y - wh / 2, ws, wh); }
    }
    if (b.dome) {   // cami: kubbe ve iki minare (İstanbul silueti)
      const cx = b.x + b.w / 2, top = b.by - b.h;
      ctx.beginPath(); ctx.arc(cx, top, b.w * 0.42, Math.PI, 0); ctx.fillStyle = b.col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = PAL.ink; ctx.stroke();
      for (const s of [-1, 1]) { rect(cx + s * b.w * 0.62 - 0.6 * b.k, top - 26 * b.k, 1.2 * b.k, 26 * b.k + b.h * 0.5, b.col, lw); poly([[cx + s * b.w * 0.62 - 0.8 * b.k, top - 26 * b.k], [cx + s * b.w * 0.62, top - 31 * b.k], [cx + s * b.w * 0.62 + 0.8 * b.k, top - 26 * b.k]], mix('#5A6470', 0.3), lw); }
    }
  };
  const city = t => {
    const vx0 = -540 / S + camX, vx1 = 540 / S + camX;   // görünen genişlik (dünya)
    for (const r of rows) {
      if (r.ri < 3 && S > 140) continue;               // yakın planda arka sıralar görünmez
      const lw = L(r.ri === 3 ? 5 : 3.2 + r.ri * 0.4);
      if (r.ri < 3) {   // tepe dolgusu
        ctx.beginPath(); ctx.moveTo(-r.half - 60, 30);
        for (let x = -r.half - 60; x <= r.half + 60; x += 6) ctx.lineTo(x, hill(x, r.base, r.amp, r.ph) + 3);
        ctx.lineTo(r.half + 60, 30); ctx.closePath(); ctx.fillStyle = mix('#9DB08A', 0.15 + r.fade * 0.8); ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = PAL.ink; ctx.stroke();
      }
      for (const b of r.bs) if (b.x + b.w > vx0 - 5 && b.x < vx1 + 5) building(b, t, lw);
    }
  };
  // Galata Kulesi: gövde, galeri, külah (66,9 m, dış çap 16,45 m); dy: yerin altından yükselme
  const tower = (t, dy) => {
    const lw = L(6), X = TOWER_X, R = TOWER_R;
    ctx.save(); ctx.beginPath(); ctx.rect(X - 30, -120, 60, 120); ctx.clip(); ctx.translate(0, dy);
    rect(X - R, -46, 2 * R, 46, '#D8C8A6', lw);
    for (let i = 1; i < 8; i++) line(X - R, -i * 5.6, X + R, -i * 5.6, L(2.5), '#BBA987');
    for (const [yy, n] of [[-12, 2], [-24, 3], [-35, 3]]) for (let j = 0; j < n; j++) { const xx = X - (n - 1) * 2.6 + j * 5.2; rect(xx - 0.8, yy - 2.2, 1.6, 2.6, '#4A4238', L(3), 0.8); }
    rect(X - 4.5, -5.5, 9, 5.5, '#6A4A2E', L(4), 2);   // kapı kemeri
    rect(X - R - 0.8, -47.8, 2 * R + 1.6, 1.8, '#C9B48F', lw);
    rect(X - R + 0.6, -53.8, 2 * R - 1.2, 6, '#E4D6B6', lw);
    for (let j = 0; j < 5; j++) rect(X - R + 2.2 + j * 3.0, -52.8, 1.4, 4, '#3A3A40', L(3), 0.7);
    rect(X - R - 0.6, -55.6, 2 * R + 1.2, 1.8, '#C9B48F', lw);
    poly([[X - R + 0.6, -55.6], [X, -TOWER_ROOF], [X + R - 0.6, -55.6]], '#5C6773', lw);
    line(X, -TOWER_ROOF, X, -TOWER_H, L(5)); circ(X, -64.4, 0.5, '#E2B13C', L(3));
    ctx.restore();
  };
  // martılar: yavaş kanat çırpar, sürekli döngü
  const gulls = t => {
    for (let i = 0; i < 3; i++) {
      const x = -80 + ((i * 47 + t * 6) % 180), y = -78 - i * 9 + Math.sin(t * 0.7 + i) * 2, f = Math.sin(t * 7 + i * 2) * 0.5;
      if (S * 2 < 4) continue;
      ctx.beginPath(); ctx.moveTo(x - 1.1, y - f); ctx.quadraticCurveTo(x - 0.5, y - 0.6, x, y); ctx.quadraticCurveTo(x + 0.5, y - 0.6, x + 1.1, y - f);
      ctx.lineWidth = L(4); ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round'; ctx.stroke();
    }
  };
  // dev bardağa dökülen bardak sırası: iki kol (sol ve sağ tepelerden), sabit aralıklı, sürekli akış; ağza varınca
  // devrilip boşalır. Simge boyutu ekranda sabit (34 px): her biri bir bardağı temsil eden işaret.
  const glyph = (x, y, rot, px) => {
    const k = px / (GH * S), lw = L(5) / k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.translate(0, GH / 2);
    glassPath(); ctx.fillStyle = GLASS; ctx.fill();
    ctx.save(); glassPath(); ctx.clip(); ctx.fillStyle = TEA; ctx.fillRect(-0.04, -0.081, 0.08, 0.09); ctx.restore();
    glassPath(); ctx.lineWidth = lw; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  };
  const streams = t => {
    if (t < P0 || t > P1 + 0.2 || t >= T.loop0) return;
    const rimY = -TABLE - GH * g, srcs = [[-135, -66, -1], [145, -70, 1]];
    for (const [sxw, syw, side] of srcs) {
      const ex = side * 0.008 * g, cx = sxw * 0.5, cy = Math.min(-86, rimY - 12);
      for (let i = 0; ; i++) {
        const te = P0 + i * 0.05 + (side > 0 ? 0.025 : 0); if (te > P1 - TT) break;
        const u = (t - te) / TT; if (u <= 0 || u >= 1) continue;
        const a = 1 - u, x = a * a * sxw + 2 * a * u * cx + u * u * ex, y = a * a * syw + 2 * a * u * cy + u * u * (rimY - 8 / S * 3);
        const pour = ease.state(clamp01((u - 0.78) / 0.22));
        glyph(x, y, -side * 1.9 * pour, 34 * (1 - 0.35 * pour));
      }
    }
  };
  // ekranda sabit boyutlu, konturlu etiket (dünyaya bağlı)
  const label = (str, x, y, px, col, align = 'center', u = 1) => {
    if (u <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(1 / S, 1 / S); ctx.translate(0, (1 - u) * 24);
    ctx.beginPath(); ctx.rect(-600, -px * 1.1 - 4, 1200, px * 1.45); ctx.clip();
    ctx.font = `800 ${px}px Archivo`; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
    const wd = ctx.measureText(str).width, m = ctx.getTransform(), sxp = m.e;   // ekran x'i
    let x0 = align === 'center' ? -wd / 2 : align === 'right' ? -wd : 0;
    x0 += Math.min(0, 900 - (sxp + x0 + wd)) + Math.max(0, 100 - (sxp + x0));
    ctx.lineWidth = px * 0.22; ctx.strokeStyle = col; ctx.strokeText(str, x0, (1 - u) * px); ctx.fillStyle = '#FFFFFF'; ctx.fillText(str, x0, (1 - u) * px); ctx.restore();
  };

  // rıhtım ve deniz (Karaköy kıyısı gibi): dalga çizgileri akar, bir vapur yavaşça geçer
  const sea = t => {
    if (S > 400) return;
    rect(-600, 3.5, 1200, 500, '#7FA9BA', 0); line(-600, 3.5, 600, 3.5, L(6)); rect(-600, 3.5, 1200, 0.6, '#5E8799', 0);
    for (let j = 0; j < 14; j++) { const y = 7 + j * 4.5, off = ((t * (2 + j * 0.2) + j * 7) % 16);
      ctx.setLineDash([6, 10]); ctx.lineDashOffset = -off; line(-600, y, 600, y, L(3), '#A9CAD6'); ctx.setLineDash([]); }
    const vx = -70 + t * 4, vy = 12;
    if (vx > camX - 600 / S - 40 && vx < camX + 600 / S + 40) {
      poly([[vx - 16, vy - 3], [vx + 16, vy - 3], [vx + 13, vy + 2], [vx - 13, vy + 2]], '#F4EFE3', L(5));
      rect(vx - 16, vy - 1.2, 32, 1.0, '#2A2A30', 0);
      rect(vx - 10, vy - 7, 20, 4, '#F4EFE3', L(4)); for (let i = 0; i < 6; i++) rect(vx - 8.6 + i * 3, vy - 6.2, 1.6, 1.6, '#3E4A5A', L(2));
      rect(vx - 1.2, vy - 11, 2.4, 4, '#E2B13C', L(4)); rect(vx - 1.2, vy - 11, 2.4, 1.1, '#2A2A30', 0);
    }
  };
  let camX = 0;
  const CNT0 = T.l02, CNT1 = H;   // sayaç: Soran'ın sorusuyla girer, kule yükselirken çıkar (yerini boy etiketleri alır)
  return {
    cam: [[0, 1, 540, 960], [D, 1, 540, 960]],
    title: [' '], titleOut: 0, kicker: ' ',   // başlık sahnenin içinde, kara tahtada (board)
    open: true, capSize: 76, capBase: 1410,
    chunks: {
      l01: [["o bardak İstanbul'un bir simgesine neredeyse yetişir.", 7]],   // ilk yarıyı tahta ve ses taşır
      l02: [['Bir günde o kadar çay mı içiyoruz?', 0]],
      l03: [['Evet, her gün yaklaşık', 0], ['245 milyon bardak içiyoruz.', 4]],
      l04: [['Bardağın boyu 600 kattan fazla uzamalı.', 0]],
      l05: [["Galata Kulesi'ne neredeyse yetişti.", 0], ['Bunu çay demleyen birine gönder.', 4]],
    },
    draw(t) {
      const [s, sx, sy] = camAt(t); S = s; g = growAt(t);
      camX = (540 - sx) / S;
      ctx.fillStyle = SKY; ctx.fillRect(-4000, -4000, 9080, 9920);
      ctx.save(); ctx.translate(sx, sy + TABLE * S); ctx.scale(S, S);
      if (S < 200) circ(-120, -150, 22, '#F6E2B8', 0);   // güneş (uzak)
      city(t);
      gulls(t);
      heroBuilding(t);
      // kapak: tahtanın arkasında dev bardak silueti ve soru işareti gölgesi (%25), 0,6 sn'de söner; döngü sonunda geri gelir
      { const a = 0.35 * (t < T.loop0 ? 1 - ease.exit(seg(t, 0, 0.6)) : ease.enter(seg(t, D - 0.42, 0.3)));
        if (a > 0.003) {
          ctx.save(); ctx.scale(1 / S, 1 / S); ctx.translate(-sx, -(sy + TABLE * S)); ctx.globalAlpha = a; ctx.fillStyle = PAL.ink;
          ctx.save(); ctx.translate(330, 1240); ctx.scale(900 / GH, 900 / GH); glassPath(); ctx.fill(); ctx.globalAlpha = Math.min(1, a * 2.4); ctx.lineWidth = 4 * GH / 900; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore(); ctx.globalAlpha = a;
          ctx.font = '900 1050px Archivo'; ctx.textAlign = 'center'; ctx.fillText('?', 830, 1240); ctx.textAlign = 'left';
          ctx.restore();
        } }
      board(t);
      // yer: kaldırım, rıhtım, deniz
      rect(-600, 0, 1200, 3.5, '#C9BCA4', 0); line(-600, 0, 600, 0, L(6)); rect(-600, 0.0, 1200, 0.15, '#B5A88F', 0);
      sea(t);
      // iki müşteri: masanın arkasında, ellerinde çay
      if (S > 25) {
        kisi('sen', { x: -0.62, y: 0, s: 0.3, expr: 'mutlu', props: { R: 'tea' }, armR: { sh: 58, el: 75 }, head: { look: [0.5, 0.1] } }, t);
        kisi('anne', { x: 0.64, y: 0, s: 0.29, expr: 'mutlu', props: { L: 'tea' }, armL: { sh: 58, el: 75 }, head: { look: [-0.5, 0.1] } }, t);
      }
      table(t);
      // masaya konan iki bardak: yukarıdan iner, tıkırdar
      for (const [x, t0] of [[-0.38, 3.0], [0.42, 3.5]]) { const u = ease.enter(seg(t, t0 - 0.3, 0.3)); if (u > 0) teaGlass(x, -TABLE - (1 - u) * 0.12, 1, t + x, u >= 1); }
      // Galata Kulesi: "Galata" kelimesinden 0,05 sn önce yerden yükselir (600 ms); döngüde geri iner
      { const up = ease.enter(seg(t, H, 0.6)), down = ease.exit(seg(t, T.loop0, 0.55)), k = up * (1 - down);
        if (k > 0) tower(t, (1 - k) * 75); }
      // ölçek için insan: kulenin kapısının önünde duran biri (1,7 m)
      if (S > 3 && S < 400) {   // küçük ölçekte okunur sade insan (1,75 m): sarı mont, lacivert pantolon; yakınlaşmada el sallar
        const x = 48.5, lw = L(2.5), wave = t > Z0 && t < Z1 + 0.3 ? 0.5 + 0.35 * Math.sin(t * 11) : 0;
        line(x - 0.12, -0.85, x - 0.16, 0, L(2.5) + 0.16, PAL.ink); line(x + 0.12, -0.85, x + 0.16, 0, L(2.5) + 0.16, PAL.ink);
        line(x - 0.12, -0.85, x - 0.16, 0, 0.16, '#2E3A5A'); line(x + 0.12, -0.85, x + 0.16, 0, 0.16, '#2E3A5A');
        rect(x - 0.24, -1.42, 0.48, 0.62, '#E2A72E', lw, 0.1);
        line(x + 0.22, -1.38, x + 0.22 + 0.45 * Math.sin(0.3 + wave * 2.2), -1.38 + 0.45 * Math.cos(0.3 + wave * 2.2), 0.12, '#E2A72E');
        line(x - 0.22, -1.38, x - 0.3, -0.95, 0.12, '#E2A72E');
        circ(x, -1.57, 0.13, '#EAC39C', lw); ell(x, -1.66, 0.13, 0.06, '#2A2420', 0);
      }
      // dev bardak (ilk bardak) ve buharı; sayaç ekrandayken buhar sayacın altında kesilir
      teaGlass(0, -TABLE, g, t / Math.pow(g, 0.35), false, fillAt(t));
      { const cnt = t > CNT0 - 0.1 && t < CNT1 + 0.3; ctx.save();
        if (cnt) { ctx.beginPath(); ctx.rect(-5000, (620 - sy - TABLE * S) / S, 10000, 10000); ctx.clip(); }
        const tt = t >= T.loop0 ? t - D : t, st = tt - 0.5 * D / (2 * Math.PI) * Math.sin(2 * Math.PI * tt / D);   // dikişte buhar yarı hızda
        steamOf(0, -TABLE, g, st / Math.pow(g, 0.35)); ctx.restore(); }   // buhar fazı döngüde kare 0'a bağlanır
      pourStream(t);
      streams(t);
      // kıyas çizgisi: sessizlikte bardağın ağzından kuleye doğru uzar; döngüde geri çekilir
      { const u = ease.state(seg(t, T.l04end + 0.06, H - T.l04end - 0.06)) * (1 - ease.exit(seg(t, T.loop0, 0.25)));
        if (u > 0) { const y = -TABLE - GH * g, x0 = 0.031 * g + 1, x1 = lerp(x0, TOWER_X + TOWER_R + 3, u); ctx.setLineDash([L(18), L(12)]); line(x0, y, x1, y, L(6), PAL.red); ctx.setLineDash([]); } }
      // boy etiketleri: kule oturunca, okunurken sabit (kapanış yaklaşmasıyla birlikte ölçeklenmez, yalnızca kayar)
      { const u = t < T.loop0 ? ease.enter(seg(t, LAND - 0.1, 0.3)) : 0;
        label('~58 m', 0.031 * GROW + 2.5, -TABLE - GH * GROW - 2.2, 54, PAL.red, 'left', u);
        label('62,6 m', TOWER_X - 2, -TOWER_H - 3.5, 54, PAL.ink, 'center', u);
        label('1,7 m', 49.2, -0.9, 46, PAL.ink, 'left', t < Z1 + 0.1 ? ease.enter(seg(t, Z0 + 0.3, 0.25)) : 0); }
      ctx.restore();
    },
    numbers: [
      [CNT0, CNT1, t => {
        const p = clamp01((t - CNT0) / (w('l03', 'milyon') - CNT0));
        return Math.min(245e6, Math.round(5 * Math.exp(Math.log(245e6 / 5) * Math.pow(p, 2.1))));   // masadaki 5 bardaktan başlar
      }, 'BARDAK ÇAY · BİR GÜNDE'],
    ],
  };
}

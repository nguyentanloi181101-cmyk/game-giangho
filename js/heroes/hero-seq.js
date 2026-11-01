/* CHUỖI KHUNG HÌNH (sprite sheet) — mỗi sheet = 1 hàng × 12 khung nền trong suốt, mỗi khung cw × ch px.
   Ảnh nằm ở assets/images/seq/. Muốn thêm chuỗi cho tướng khác: thêm 1 dòng vào SEQ (+ SEQ_IDLE nếu là dáng đứng),
   rồi dùng seqEl / seqOverlay trong hàm tuyệt kỹ của tướng đó (xem vtdUlt, tayDocUlt trong skills/ngu-tuyet.js). */

const SEQ = {
  vtdIdle:  { src: 'assets/images/seq/vuong-trung-duong-idle.webp?v=23',  cw: 227, ch: 201, n: 12 },   // Vương Trùng Dương đứng tại chỗ
  vtdCast:  { src: 'assets/images/seq/vuong-trung-duong-ult.webp?v=23',   cw: 208, ch: 184, n: 12 },   // Vương Trùng Dương tung tuyệt kỹ
  vtdStorm: { src: 'assets/images/seq/vuong-trung-duong-storm.webp?v=23', cw: 227, ch: 201, n: 12 },   // lốc xoáy Thái Cực (đặt bên địch, lặp)
  tdIdle:   { src: 'assets/images/seq/tay-doc-idle.webp?v=23',            cw: 227, ch: 201, n: 12 },   // Tây Độc đứng tại chỗ
  tdToad:   { src: 'assets/images/seq/tay-doc-ult.webp',             cw: 225, ch: 201, n: 12 },   // cóc độc trồi lên, há miệng (độc phun là hiệu ứng riêng)
  dtIdle:   { src: 'assets/images/seq/dong-ta-idle.webp?v=23',            cw: 227, ch: 201, n: 12 },   // Đông Tà đứng thổi sáo
  dtCast:   { src: 'assets/images/seq/dong-ta-ult.webp?v=23',             cw: 227, ch: 201, n: 12 },   // Đông Tà tung tuyệt kỹ (nhảy lên, xoáy vàng)
  bcIdle:   { src: 'assets/images/seq/bac-cai-idle.webp',            cw: 301, ch: 201, n: 16 },   // Bắc Cái đứng yên (16 khung)
  acCast:   { src: 'assets/images/seq/au-co-ult.webp',               cw: 304, ch: 201, n: 16 },   // hoa sen hồng nở rồi tan cánh (Âu Cơ ulti)
  tyCast:   { src: 'assets/images/seq/thanh-y-ult.webp',             cw: 304, ch: 201, n: 16 },   // hoa sen xanh nở (Thanh Y hồi sinh)
  ndIdle:   { src: 'assets/images/seq/nam-de-idle.webp?v=23',             cw: 227, ch: 201, n: 12 },   // Nam Đế đứng tụ cầu Thái Cực
  ttpIdle:  { src: 'assets/images/seq/truong-tam-phong-idle.webp?v=28',    cw: 317, ch: 256, n: 16 },   // Trương Tam Phong đứng tại chỗ, cầu Thái Cực quay quanh (16 khung)
  ttpCast:  { src: 'assets/images/seq/truong-tam-phong-ult.webp?v=28',     cw: 354, ch: 256, n: 16 },   // Trương Tam Phong đứng tại chỗ tung Thái Cực (16 khung, không nhảy)
  ttpStorm: { src: 'assets/images/seq/truong-tam-phong-storm.webp?v=28',   cw: 283, ch: 256, n: 17 },   // lốc xoáy Thái Cực bên địch khi Trương Tam Phong ulti (17 khung, lặp)
  acIdle:   { src: 'assets/images/seq/au-co-idle.webp?v=23',               cw: 227, ch: 201, n: 12 }    // Âu Cơ đứng trên đài sen cùng hạc
};
// Dáng đứng trong trận: id tướng → { sheet, h = chiều cao hiển thị (px), ms = thời gian 1 vòng }
const SEQ_IDLE = { 17: { sheet: 'vtdIdle', h: 92, ms: 1300 }, 15: { sheet: 'tdIdle', h: 104, ms: 1300 }, 14: { sheet: 'dtIdle', h: 104, ms: 1300 }, 13: { sheet: 'bcIdle', h: 104, ms: 1300 }, 16: { sheet: 'ndIdle', h: 104, ms: 1300 }, 4: { sheet: 'ttpIdle', h: 120, ms: 1500 }, 5: { sheet: 'acIdle', h: 104, ms: 1300 } };

Object.keys(SEQ).forEach(k => { const im = new Image(); im.src = SEQ[k].src; });   // nạp sẵn để lần đầu không giật

// Đổi mili-giây theo tốc độ trận (cùng quy tắc với sleep của engine) để khung hình không lệch nhịp khi tua nhanh
const seqT = ms => (typeof battleFast !== 'undefined' && battleFast) ? 0 : ms * (typeof ultTimeScale === 'number' ? ultTimeScale : 1);

// HTML dáng đứng (thay ảnh thân tĩnh) — gọi từ applyRole trong battle/engine.js
// Ảnh gốc các chuỗi khung quay mặt sang TRÁI: đội ta (bên trái) phải lật ngang để nhìn sang phải, đội địch (bên phải) giữ nguyên → 2 đội nhìn vào nhau
function seqIdleHTML(id, hb, side) {
  const c = SEQ_IDLE[id]; if (!c) return '';
  const s = SEQ[c.sheet], h = c.h, w = Math.round(h * s.cw / s.ch), lift = h - ((hb && hb.bodyH) || 76);
  return '<div class="hero-seq" style="width:' + w + 'px;height:' + h + 'px;margin:' + (-lift) + 'px 0 0 ' + (-w / 2) + 'px;' + (side === 'hero' ? 'transform:scaleX(-1);' : '') + 'background-image:url(' + s.src + ');background-size:' + (w * s.n) + 'px ' + h + 'px;--end:' + (-w * s.n) + 'px;--ms:' + c.ms + 'ms;animation:seqRun ' + c.ms + 'ms steps(' + s.n + ') infinite"></div>';
}
// Phần tử hiển thị chuỗi khung, rộng w px. d.show(i) = dừng ở khung i; d.loop(ms) = lặp liên tục.
function seqEl(s, w) {
  const h = Math.round(w * s.ch / s.cw), d = document.createElement('div');
  d.className = 'hero-seq'; d.style.width = w + 'px'; d.style.height = h + 'px';
  d.style.backgroundImage = 'url(' + s.src + ')'; d.style.backgroundSize = (w * s.n) + 'px ' + h + 'px';
  d.show = i => { d.style.animation = 'none'; d.style.backgroundPosition = (-i * w) + 'px 0'; };
  d.loop = ms => { d.style.setProperty('--end', (-w * s.n) + 'px'); d.style.animation = 'seqRun ' + ms + 'ms steps(' + s.n + ') infinite'; };
  d.show(0); return d;
}
// Phủ chuỗi khung lên tướng u (ẩn ảnh thân/dáng đứng trong lúc diễn, căn đáy giữa). end() trả lại như cũ.
function seqOverlay(u, s, w) {
  const d = seqEl(s, w); d.classList.add('seq-over'); if (u.side === 'hero') d.style.transform = 'translateX(-50%) scaleX(-1)'; u.el.appendChild(d);   // đội ta lật ngang để nhìn sang phải (về phía địch)
  const hid = u.el.querySelectorAll('.hero-body, .hero-img, .bf-emo, .bf-sprite .hero-seq'); hid.forEach(b => { b.style.visibility = 'hidden'; });
  return { el: d, show: i => d.show(i), end() { d.remove(); hid.forEach(b => { b.style.visibility = ''; }); } };
}

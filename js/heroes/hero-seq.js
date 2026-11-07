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
  vntIdle:  { src: 'assets/images/seq/vo-nhai-tu-idle.webp?v=33',  cw: 288, ch: 300, n: 32, drop: .137 },   // Vô Nhai Tử đứng im 1 chỗ: 17 khung đã căn cố định thân, đi tới rồi quay lại (32), lặp êm
  vntCast:  { src: 'assets/images/seq/vo-nhai-tu-ult.webp?v=29',   cw: 398, ch: 355, n: 15, drop: .15 },   // Vô Nhai Tử đứng tại chỗ tung tuyệt kỹ (15 khung)
  vntFlag:  { src: 'assets/images/seq/vo-nhai-tu-flag.webp?v=29',  cw: 339, ch: 361, n: 15 },               // cây cờ phóng xuống địch (15 khung, đánh 5 lần)
  acIdle:   { src: 'assets/images/seq/au-co-idle.webp?v=23',               cw: 227, ch: 201, n: 12 },   // Âu Cơ đứng trên đài sen cùng hạc
  // ===== Hoa Mãn Lâu (id 6) — nền đã xóa sạch, thân cố định giữa khung, tất cả đều 16 khung =====
  hmlIdle:  { src: 'assets/images/seq/hoa-man-lau-idle.webp?v=40',          cw: 320, ch: 250, n: 16, drop: .04  },   // đứng yên cùng sư tử (lặp)
  hmlCast:  { src: 'assets/images/seq/hoa-man-lau-ult.webp?v=40',           cw: 560, ch: 300, n: 16, drop: .033 },   // tung tuyệt kỹ: bướm cuộn bay ra phía địch (cùng tỉ lệ + điểm neo với hmlIdle)
  // 7 chuỗi bướm ulti (16 khung) theo thứ tự đỏ-cam-vàng-lục-lam-chàm-tím: bướm rơi (0-3) → chạm đất (4-11) → bung tia nhiều hướng (12-15)
  // ===== Tiểu Yêu (id 10) — 20 khung, nền đã xóa; idle + ult cùng khung/tỉ lệ để phủ khớp nhau =====
  tyIdle:   { src: 'assets/images/seq/tieu-yeu-idle.webp?v=50',  cw: 269, ch: 202, n: 20, drop: .03 },   // đứng yên, hào quang đổi màu (lặp)
  tyCast:   { src: 'assets/images/seq/tieu-yeu-ult.webp?v=50',   cw: 269, ch: 202, n: 20, drop: .03 },   // tung tuyệt kỹ: dang tay, hào quang xoáy
  tySkull:  { src: 'assets/images/seq/tieu-yeu-skull.webp?v=50', cw: 297, ch: 228, n: 20 },               // đầu lâu lửa phun lửa xuống địch (đầu ở góc trên-trái, lửa tuôn xuống phải)
  // ===== Đoàn Dự (id 12) — nền đã xóa =====
  ddIdle:   { src: 'assets/images/seq/doan-du-idle.webp?v=50',   cw: 204, ch: 225, n: 17, drop: .03 },   // đứng yên (17 khung, lặp)
  ddCast:   { src: 'assets/images/seq/doan-du-ult.webp?v=50',    cw: 335, ch: 221, n: 16, drop: .03 },   // tung tuyệt kỹ: vung kiếm, xoáy nước (cùng tỉ lệ người với ddIdle)
  ddRun:    { src: 'assets/images/seq/doan-du-run.webp?v=50',    cw: 236, ch: 181, n: 17 },               // 1 đạo tàn ảnh lao đi (17 khung, nhìn sang PHẢI)
  // ===== Đông Phương Cô Nương (id 9) — nền đã xóa; idle + ult cùng khung/tỉ lệ =====
  dpIdle:   { src: 'assets/images/seq/dong-phuong-idle.webp?v=51',  cw: 334, ch: 225, n: 20, drop: .03 },   // đứng yên cố định 1 chỗ (20 khung, lặp)
  dpCast:   { src: 'assets/images/seq/dong-phuong-ult.webp?v=51',   cw: 334, ch: 225, n: 16, drop: .03 },   // tung tuyệt kỹ: lụa lửa xoáy quanh người (16 khung)
  dpClone:  { src: 'assets/images/seq/dong-phuong-clone.webp?v=51', cw: 366, ch: 217, n: 18 },               // phân thân lao sang địch (18 khung, nhìn sang PHẢI)
  dpFire:   { src: 'assets/images/seq/dong-phuong-fire.webp?v=51',  cw: 260, ch: 206, n: 20 },               // lốc lửa bùng lên ở bên địch (20 khung)
  hmlRed:    { src: 'assets/images/seq/hoa-man-lau-buom-red.webp?v=42',     cw: 384, ch: 256, n: 16 },   // Đỏ
  hmlOrange: { src: 'assets/images/seq/hoa-man-lau-buom-orange.webp?v=42',  cw: 384, ch: 256, n: 16 },   // Cam
  hmlYellow: { src: 'assets/images/seq/hoa-man-lau-buom-yellow.webp?v=42',  cw: 384, ch: 256, n: 16 },   // Vàng
  hmlGreen:  { src: 'assets/images/seq/hoa-man-lau-buom-green.webp?v=42',   cw: 384, ch: 256, n: 16 },   // Lục
  hmlBlue:   { src: 'assets/images/seq/hoa-man-lau-buom-blue.webp?v=42',    cw: 384, ch: 256, n: 16 },   // Lam
  hmlIndigo: { src: 'assets/images/seq/hoa-man-lau-buom-indigo.webp?v=42',  cw: 384, ch: 256, n: 16 },   // Chàm
  hmlPurple: { src: 'assets/images/seq/hoa-man-lau-buom-purple.webp?v=42',  cw: 384, ch: 256, n: 16 },   // Tím
  dcIdle:   { src: 'assets/images/seq/doc-co-idle.webp?v=60',  cw: 335, ch: 284, n: 20, drop: .03 },   // Độc Cô Cầu Bại đứng yên cố định 1 chỗ (20 khung, đã căn mặt, lặp)
  dcCast:   { src: 'assets/images/seq/doc-co-ult.webp?v=60',   cw: 366, ch: 305, n: 15, drop: -.05 },   // tung tuyệt kỹ: từ dưới đất nhảy vọt lên cao (15 khung, cùng tỉ lệ + điểm neo với dcIdle)
  dcSword:  { src: 'assets/images/seq/doc-co-sword.webp?v=60', cw: 307, ch: 256, n: 20 }                 // kiếm tím từ trên trời cắm chéo xuống địch (20 khung, mũi kiếm hướng xuống-TRÁI)
};
// Dáng đứng trong trận: id tướng → { sheet, h = chiều cao hiển thị (px), ms = thời gian 1 vòng }
const SEQ_IDLE = { 17: { sheet: 'vtdIdle', h: 92, ms: 1300 }, 15: { sheet: 'tdIdle', h: 104, ms: 1300 }, 14: { sheet: 'dtIdle', h: 104, ms: 1300 }, 13: { sheet: 'bcIdle', h: 104, ms: 1300 }, 16: { sheet: 'ndIdle', h: 104, ms: 1300 }, 4: { sheet: 'ttpIdle', h: 120, ms: 1500 }, 11: { sheet: 'vntIdle', h: 132, ms: 3200 }, 5: { sheet: 'acIdle', h: 104, ms: 1300 }, 6: { sheet: 'hmlIdle', h: 140, ms: 1600 }, 10: { sheet: 'tyIdle', h: 124, ms: 1800 }, 9: { sheet: 'dpIdle', h: 138, ms: 1800 }, 12: { sheet: 'ddIdle', h: 128, ms: 1500 }, 3: { sheet: 'dcIdle', h: 120, ms: 1500 } };

Object.keys(SEQ).forEach(k => { const im = new Image(); im.src = SEQ[k].src; });   // nạp sẵn để lần đầu không giật

// Đổi mili-giây theo tốc độ trận (cùng quy tắc với sleep của engine) để khung hình không lệch nhịp khi tua nhanh
const seqT = ms => (typeof battleFast !== 'undefined' && battleFast) ? 0 : ms * (typeof ultTimeScale === 'number' ? ultTimeScale : 1) * (typeof battleSlow === 'number' ? battleSlow : 1);

// HTML dáng đứng (thay ảnh thân tĩnh) — gọi từ applyRole trong battle/engine.js
// Ảnh gốc các chuỗi khung quay mặt sang TRÁI: đội ta (bên trái) phải lật ngang để nhìn sang phải, đội địch (bên phải) giữ nguyên → 2 đội nhìn vào nhau
function seqIdleHTML(id, hb, side) {
  const c = SEQ_IDLE[id]; if (!c) return '';
  const s = SEQ[c.sheet], h = c.h, w = Math.round(h * s.cw / s.ch), lift = h - ((hb && hb.bodyH) || 76) - Math.round((s.drop || 0) * h);
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
  const d = seqEl(s, w); d.classList.add('seq-over'); if (s.drop) d.style.bottom = (2 - Math.round(s.drop * parseFloat(d.style.height))) + 'px'; if (u.side === 'hero') d.style.transform = 'translateX(-50%) scaleX(-1)'; u.el.appendChild(d);   // đội ta lật ngang để nhìn sang phải (về phía địch)
  const hid = u.el.querySelectorAll('.hero-body, .hero-img, .bf-emo, .bf-sprite .hero-seq'); hid.forEach(b => { b.style.visibility = 'hidden'; });
  return { el: d, show: i => d.show(i), end() { d.remove(); hid.forEach(b => { b.style.visibility = ''; }); } };
}

// ẢNH ĐẠI DIỆN ĐỘNG: dáng đứng (SEQ_IDLE) dùng làm người đại diện ở Tỷ Võ + thẻ tướng trang chủ. Kích thước theo % nên co giãn theo khung chứa.
// w: số px hoặc chuỗi CSS (vd '150%'). Trả '' nếu tướng chưa có chuỗi đứng → nơi gọi dùng ảnh tĩnh như cũ.
function seqAvatarHTML(id, w, extraStyle) {
  const c = SEQ_IDLE[id]; if (!c) return '';
  const s = SEQ[c.sheet];
  return '<div class="seq-av" style="width:' + (typeof w === 'number' ? w + 'px' : w) + ';aspect-ratio:' + s.cw + '/' + s.ch + ';background-image:url(' + s.src + ');background-size:' + (s.n * 100) + '% 100%;--ms:' + c.ms + 'ms;--stp:' + (s.n - 1) + ';' + (extraStyle || '') + '"></div>';
}

/* TRẬN ĐẤU: thông số cân bằng của các tuyệt kỹ
   (tách từ index.html cũ — script) */

    let busy = false;
    // Trận 4: 3 tướng ngẫu nhiên của địch dùng chỉ số THEO ẢI (nhân hệ số ải), không dùng cấp/sao/kỹ năng đã nâng của bạn
    const B4_HERO_HP = 1000, B4_HERO_ATK = 200, B4_HERO_DEF = 30, B4_HERO_DODGE = 0;
    const GO_STONES = 5, GO_STONE_PCT = 0.06;   // Vô Nhai Tử: 5 quân cờ, mỗi quân trúng gây 6% HP hiện tại của địch bị rơi trúng
    const GO_STUN_ROUNDS = [2, 3, 4], GO_STUN_COUNT = 3;   // hiệp 2-4: choáng 3 địch ngẫu nhiên 1 hiệp
    // Ma Đao Thánh Nữ: mốc thời gian (ms tính từ lúc bắt đầu tiếng) của 7 nhát chém – khớp 7 nhịp đập trong file âm thanh
    const MADAO_T = [2900, 3150, 3300, 3450, 3650, 3800, 4100];
    const SKULL_IMG = 'assets/images/fx/skull.webp';
    const SKEL_COUNT = 3, SKEL_PCT = 0.5;   // Bạch Ma Vương: 3 bộ xương, mỗi địch mất 50% HP hiện tại (chỉ né được, bỏ qua giáp/khiên)
    const MOON_TURNS = 2, MOON_REFLECT = 0.5, MOON_TAKE = 0.3;   // Chu Nguyên Chương: khiên 2 hiệp, phản 50% sát thương cho địch, đồng đội chỉ nhận 30%
    const ULT_HITS = 3, ULT_MULT = 1.2, TAICHI_MULT = 1.5, HEAL_MULT = 1.5, RAGE_ATK = 34;
    const HTT_FLAT = 33333, HTT_LINES = 18, HTT_HP_PCT = 0.5;   // Hỏa Thiên Tướng: 33333 chuẩn (bỏ qua giáp) + Công bản thân, 18 đường lửa, giảm 50% HP hiện tại của địch
    const BFLY_HITS = 3, BFLY_MULT = 1.0, BFLY_ATK_BUFF = 0.5;
    // Hoa Mãn Lâu: mỗi màu bướm kèm 1 hiệu ứng lên địch. Mọi hiệu ứng 25%, kéo dài 2 hiệp (Chàm: choáng 2 địch ngẫu nhiên 1 hiệp)
    const REVIVE_COUNT = 2, REVIVE_HP_PCT = 0.5, IMMORTAL_TURNS = 3;   // Thanh Y Tiên Tử: hồi sinh 2 đồng đội với 50% HP; bất tử 3 hiệp đầu mỗi trận
    const BF_PCT = 0.25, BF_TURNS = 2, BF_STUN_TURNS = 1, BF_STUN_TARGETS = 2, BF_SILENCE_TARGETS = 2, BF_POISON_PCT = 0.25;
    // hue = độ xoay màu so với 🦋 gốc (xanh lam ~210°); css = màu hào quang/sóng
    const BFLY_COLORS = [
      { k: 'red',    hue: 150, css: '#ef4444' },   // Đỏ: chảy máu
      { k: 'orange', hue: 178, css: '#f97316' },   // Cam: giảm sát thương
      { k: 'yellow', hue: 202, css: '#facc15' },   // Vàng: giảm Thủ
      { k: 'green',  hue: 270, css: '#22c55e' },   // Lục: giảm hồi máu
      { k: 'blue',   hue: 0,   css: '#38bdf8' },   // Lam: giảm nộ
      { k: 'indigo', hue: 45,  css: '#6366f1' },   // Chàm: choáng 2 địch ngẫu nhiên 1 hiệp
      { k: 'purple', hue: 80,  css: '#a855f7' }    // Tím: trúng độc + câm lặng (không dùng được tuyệt kỹ)
    ];   // Hoa Mãn Lâu: 3 bướm, mỗi con rơi gây 100% Công lên TOÀN địch; +50% Công toàn đội
    const DUCO_TWISTERS = 3, DUCO_MULT = 3.6, DUCO_NOBUFF = 2;   // Độc Cô Cầu Bại: 3 lốc xoáy tím, tổng 360% Công lên toàn địch, xóa tăng phúc & khóa tăng phúc 2 hiệp
    const MADAO_SLASHES = 7, MADAO_MULT = 3.5, MADAO_GAP = 95;   // Ma Đao Thánh Nữ: 7 nhát chém tím chồng lên nhau, tổng 350% Công lên toàn địch, mỗi nhát cách nhau ~95ms
    const DRAGON_MULT = 3.5, DRAGON_TIERS = 3, BLEED_TURNS = 3, BLEED_PCT = 0.2, TAICHI_BLEED_TURNS = 2, TAICHI_BLEED_PCT = 0.4;
    const LB_TURNS = 3, LB_DODGE_MULT = 3.0, LB_SPD_MULT = 1.5, LB_HEAL_MULT = 3.0, LB_GHOSTS = 18;   // Đoàn Dự: 3 hiệp, +300% Né, +150% Tốc, hồi 300% Máu (theo chỉ số của Đoàn Dự), 18 tàn ảnh
    const LLQ_RAGE = 50, LLQ_DEF_MULT = 3.0, LLQ_TARGETS = 2;
    // ===== NGŨ TUYỆT (Bắc Cái • Đông Tà • Tây Độc • Nam Đế • Vương Trùng Dương) =====
    const BC_HITS = 18, BC_MULT = 3.6, BC_DEF_DOWN = 0.3, BC_ATK_UP = 0.3, BC_TURNS = 1;     // Bắc Cái: 18 cây tre (mỗi cây trúng toàn địch), tổng 360% Công; -30% Thủ địch, +30% Công đội 1 hiệp
    const DT_HITS = 4, DT_MULT = 3.6, DT_CRIT = 0.3, DT_TURNS = 2;                           // Đông Tà: 4 sóng âm, tổng 360% Công; -30% Bạo địch, +30% Bạo đội 2 hiệp
    const TD_DEF_DOWN = 0.7, TD_HP_DOWN = 0.5, TD_SPD_DOWN = 0.2, TD_TURNS = 3;              // Tây Độc: cóc độc phun độc: -70% Thủ, -50% máu hiện tại, -20% Tốc trong 3 hiệp
    const ND_ALL_DOWN = 0.5, ND_TURNS = 2;                                                   // Nam Đế: chưởng ấn chữ Vạn: địch giảm 50% tất cả thuộc tính 2 hiệp
    const VTD_ALL_UP = 3.0, VTD_TURNS = 2;                                                   // Vương Trùng Dương: đội tăng 300% tất cả thuộc tính (theo thuộc tính của từng người) 2 hiệp

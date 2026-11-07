/* TRẬN ĐẤU: thông số cân bằng của các tuyệt kỹ
   (tách từ index.html cũ — script) */

    let busy = false;
    // Trận 4: 3 tướng ngẫu nhiên của địch dùng chỉ số THEO ẢI (nhân hệ số ải), không dùng cấp/sao/kỹ năng đã nâng của bạn
    let B4_HERO_HP = 1000, B4_HERO_ATK = 200, B4_HERO_DEF = 30, B4_HERO_DODGE = 0;
    let GO_STONES = 5, GO_STONE_PCT = 0.06;   // Vô Nhai Tử: 5 quân cờ, mỗi quân trúng gây 6% HP hiện tại của địch bị rơi trúng
    // Ma Đao Thánh Nữ: mốc thời gian (ms tính từ lúc bắt đầu tiếng) của 7 nhát chém – khớp 7 nhịp đập trong file âm thanh
    const MADAO_T = [2900, 3150, 3300, 3450, 3650, 3800, 4100];
    let SKEL_PCT = 0.5, EXEC_PCT = 0.1;   // Tiểu Yêu: đầu lâu lửa đánh TOÀN địch, mỗi địch mất 50% HP hiện tại (chỉ né được, bỏ qua giáp/khiên); sau đòn còn ≤10% HP tối đa -> TẤT SÁT kết liễu
    let MOON_TURNS = 2, MOON_REFLECT = 0.5, MOON_TAKE = 0.3;   // Chu Nguyên Chương: khiên 2 hiệp, phản 50% sát thương cho địch, đồng đội chỉ nhận 30%
    let ULT_HITS = 3, ULT_MULT = 1.2, TAICHI_MULT = 1.5, HEAL_MULT = 1.5, RAGE_ATK = 34;
    let HTT_FLAT = 33333, HTT_LINES = 18, HTT_HP_PCT = 0.5;   // Hỏa Thiên Tướng: 33333 chuẩn (bỏ qua giáp) + Công bản thân, 18 đường lửa, giảm 50% HP hiện tại của địch
    let BFLY_HITS = 3, BFLY_MULT = 1.0, BFLY_ATK_BUFF = 0.5;
    // Hoa Mãn Lâu: mỗi màu bướm kèm 1 hiệu ứng lên địch. Mọi hiệu ứng 25%, kéo dài 2 hiệp (Chàm: choáng 2 địch ngẫu nhiên 1 hiệp)
    let REVIVE_COUNT = 2, REVIVE_HP_PCT = 0.5, IMMORTAL_TURNS = 3;   // Thanh Y Tiên Tử: hồi sinh 2 đồng đội với 50% HP; bất tử 3 hiệp đầu mỗi trận
    let BF_PCT = 0.25, BF_TURNS = 2, BF_STUN_TURNS = 1, BF_STUN_TARGETS = 2, BF_SILENCE_TARGETS = 2, BF_POISON_PCT = 0.25;
    // css = màu chớp sáng/sóng khi bướm chạm đất; ảnh bướm từng màu: SEQ.hmlRed…hmlPurple (hero-seq.js)
    const BFLY_COLORS = [
      { k: 'red',    css: '#ef4444' },   // Đỏ: chảy máu
      { k: 'orange', css: '#f97316' },   // Cam: giảm sát thương
      { k: 'yellow', css: '#facc15' },   // Vàng: giảm Thủ
      { k: 'green',  css: '#22c55e' },   // Lục: giảm hồi máu
      { k: 'blue',   css: '#38bdf8' },   // Lam: giảm nộ
      { k: 'indigo', css: '#6366f1' },   // Chàm: choáng 2 địch ngẫu nhiên 1 hiệp
      { k: 'purple', css: '#a855f7' }    // Tím: trúng độc + câm lặng (không dùng được tuyệt kỹ)
    ];   // Hoa Mãn Lâu: 3 bướm, mỗi con rơi gây 100% Công lên TOÀN địch; +50% Công toàn đội
    let DUCO_TWISTERS = 3, DUCO_MULT = 3.6, DUCO_SPD_DOWN = 0.3, DUCO_SPD_UP = 0.3, DUCO_TURNS = 3;   // Độc Cô Cầu Bại — Độc Cô Cửu Kiếm: 3 thanh kiếm (DUCO_TWISTERS) mỗi thanh cắm 1 địch, mỗi kiếm 360% Công; địch trúng -30% Tốc, cả đội ta +30% Tốc trong 3 hiệp
    let MADAO_SLASHES = 7, MADAO_MULT = 3.5, MADAO_GAP = 95;   // Ma Đao Thánh Nữ: 7 nhát chém tím chồng lên nhau, tổng 350% Công lên toàn địch, mỗi nhát cách nhau ~95ms
    let DRAGON_MULT = 3.5, DRAGON_TIERS = 3, BLEED_TURNS = 3, BLEED_PCT = 0.2, TAICHI_BLEED_TURNS = 2, TAICHI_BLEED_PCT = 0.4;
    let LB_TURNS = 3, LB_DODGE_MULT = 3.0, LB_SPD_MULT = 1.5, LB_HEAL_MULT = 3.0, LB_GHOSTS = 18;   // Đoàn Dự: 3 hiệp, +300% Né, +150% Tốc, hồi 300% Máu (theo chỉ số của Đoàn Dự), 18 tàn ảnh
    let LLQ_RAGE = 50, LLQ_DEF_MULT = 3.0, LLQ_TARGETS = 2;
    // ===== NGŨ TUYỆT (Bắc Cái • Đông Tà • Tây Độc • Nam Đế • Vương Trùng Dương) =====
    let BC_HITS = 18, BC_MULT = 3.6, BC_DEF_DOWN = 0.3, BC_ATK_UP = 0.3, BC_TURNS = 1;     // Bắc Cái: 18 cây tre (mỗi cây trúng toàn địch), tổng 360% Công; -30% Thủ địch, +30% Công đội 1 hiệp
    let DT_HITS = 4, DT_MULT = 3.6, DT_CRIT = 0.3, DT_TURNS = 2;                           // Đông Tà: 4 sóng âm, tổng 360% Công; -30% Bạo địch, +30% Bạo đội 2 hiệp
    let TD_DEF_DOWN = 0.7, TD_HP_DOWN = 0.5, TD_SPD_DOWN = 0.2, TD_TURNS = 3;              // Tây Độc: cóc độc phun độc: -70% Thủ, -50% máu hiện tại, -20% Tốc trong 3 hiệp
    let ND_ALL_DOWN = 0.5, ND_TURNS = 2;                                                   // Nam Đế: chưởng ấn chữ Vạn: địch giảm 50% tất cả thuộc tính 2 hiệp
    let VTD_ALL_UP = 3.0, VTD_TURNS = 2;                                                   // Vương Trùng Dương: đội tăng 300% tất cả thuộc tính (theo thuộc tính của từng người) 2 hiệp

/* ===== Admin chỉnh được: skill.<TÊN> (admin.html → tab "Chiêu thức"). Mỗi tên là 1 hằng số ở trên; để trống = giữ số mặc định. ===== */
const SKILL_DEF = {"B4_HERO_HP": 1000, "B4_HERO_ATK": 200, "B4_HERO_DEF": 30, "B4_HERO_DODGE": 0, "GO_STONES": 5, "GO_STONE_PCT": 0.06, "SKEL_PCT": 0.5, "EXEC_PCT": 0.1, "MOON_TURNS": 2, "MOON_REFLECT": 0.5, "MOON_TAKE": 0.3, "ULT_HITS": 3, "ULT_MULT": 1.2, "TAICHI_MULT": 1.5, "HEAL_MULT": 1.5, "RAGE_ATK": 34, "HTT_FLAT": 33333, "HTT_LINES": 18, "HTT_HP_PCT": 0.5, "BFLY_HITS": 3, "BFLY_MULT": 1.0, "BFLY_ATK_BUFF": 0.5, "REVIVE_COUNT": 2, "REVIVE_HP_PCT": 0.5, "IMMORTAL_TURNS": 3, "BF_PCT": 0.25, "BF_TURNS": 2, "BF_STUN_TURNS": 1, "BF_STUN_TARGETS": 2, "BF_SILENCE_TARGETS": 2, "BF_POISON_PCT": 0.25, "DUCO_TWISTERS": 3, "DUCO_MULT": 3.6, "DUCO_SPD_DOWN": 0.3, "DUCO_SPD_UP": 0.3, "DUCO_TURNS": 3, "MADAO_SLASHES": 7, "MADAO_MULT": 3.5, "MADAO_GAP": 95, "DRAGON_MULT": 3.5, "DRAGON_TIERS": 3, "BLEED_TURNS": 3, "BLEED_PCT": 0.2, "TAICHI_BLEED_TURNS": 2, "TAICHI_BLEED_PCT": 0.4, "LB_TURNS": 3, "LB_DODGE_MULT": 3.0, "LB_SPD_MULT": 1.5, "LB_HEAL_MULT": 3.0, "LB_GHOSTS": 18, "LLQ_RAGE": 50, "LLQ_DEF_MULT": 3.0, "LLQ_TARGETS": 2, "BC_HITS": 18, "BC_MULT": 3.6, "BC_DEF_DOWN": 0.3, "BC_ATK_UP": 0.3, "BC_TURNS": 1, "DT_HITS": 4, "DT_MULT": 3.6, "DT_CRIT": 0.3, "DT_TURNS": 2, "TD_DEF_DOWN": 0.7, "TD_HP_DOWN": 0.5, "TD_SPD_DOWN": 0.2, "TD_TURNS": 3, "ND_ALL_DOWN": 0.5, "ND_TURNS": 2, "VTD_ALL_UP": 3.0, "VTD_TURNS": 2};
cfgOnApply(() => {
  B4_HERO_HP = cfgNum('skill.B4_HERO_HP', SKILL_DEF.B4_HERO_HP);
  B4_HERO_ATK = cfgNum('skill.B4_HERO_ATK', SKILL_DEF.B4_HERO_ATK);
  B4_HERO_DEF = cfgNum('skill.B4_HERO_DEF', SKILL_DEF.B4_HERO_DEF);
  B4_HERO_DODGE = cfgNum('skill.B4_HERO_DODGE', SKILL_DEF.B4_HERO_DODGE);
  GO_STONES = cfgNum('skill.GO_STONES', SKILL_DEF.GO_STONES);
  GO_STONE_PCT = cfgNum('skill.GO_STONE_PCT', SKILL_DEF.GO_STONE_PCT);
  SKEL_PCT = cfgNum('skill.SKEL_PCT', SKILL_DEF.SKEL_PCT);
  EXEC_PCT = cfgNum('skill.EXEC_PCT', SKILL_DEF.EXEC_PCT);
  MOON_TURNS = cfgNum('skill.MOON_TURNS', SKILL_DEF.MOON_TURNS);
  MOON_REFLECT = cfgNum('skill.MOON_REFLECT', SKILL_DEF.MOON_REFLECT);
  MOON_TAKE = cfgNum('skill.MOON_TAKE', SKILL_DEF.MOON_TAKE);
  ULT_HITS = cfgNum('skill.ULT_HITS', SKILL_DEF.ULT_HITS);
  ULT_MULT = cfgNum('skill.ULT_MULT', SKILL_DEF.ULT_MULT);
  TAICHI_MULT = cfgNum('skill.TAICHI_MULT', SKILL_DEF.TAICHI_MULT);
  HEAL_MULT = cfgNum('skill.HEAL_MULT', SKILL_DEF.HEAL_MULT);
  RAGE_ATK = cfgNum('skill.RAGE_ATK', SKILL_DEF.RAGE_ATK);
  HTT_FLAT = cfgNum('skill.HTT_FLAT', SKILL_DEF.HTT_FLAT);
  HTT_LINES = cfgNum('skill.HTT_LINES', SKILL_DEF.HTT_LINES);
  HTT_HP_PCT = cfgNum('skill.HTT_HP_PCT', SKILL_DEF.HTT_HP_PCT);
  BFLY_HITS = cfgNum('skill.BFLY_HITS', SKILL_DEF.BFLY_HITS);
  BFLY_MULT = cfgNum('skill.BFLY_MULT', SKILL_DEF.BFLY_MULT);
  BFLY_ATK_BUFF = cfgNum('skill.BFLY_ATK_BUFF', SKILL_DEF.BFLY_ATK_BUFF);
  REVIVE_COUNT = cfgNum('skill.REVIVE_COUNT', SKILL_DEF.REVIVE_COUNT);
  REVIVE_HP_PCT = cfgNum('skill.REVIVE_HP_PCT', SKILL_DEF.REVIVE_HP_PCT);
  IMMORTAL_TURNS = cfgNum('skill.IMMORTAL_TURNS', SKILL_DEF.IMMORTAL_TURNS);
  BF_PCT = cfgNum('skill.BF_PCT', SKILL_DEF.BF_PCT);
  BF_TURNS = cfgNum('skill.BF_TURNS', SKILL_DEF.BF_TURNS);
  BF_STUN_TURNS = cfgNum('skill.BF_STUN_TURNS', SKILL_DEF.BF_STUN_TURNS);
  BF_STUN_TARGETS = cfgNum('skill.BF_STUN_TARGETS', SKILL_DEF.BF_STUN_TARGETS);
  BF_SILENCE_TARGETS = cfgNum('skill.BF_SILENCE_TARGETS', SKILL_DEF.BF_SILENCE_TARGETS);
  BF_POISON_PCT = cfgNum('skill.BF_POISON_PCT', SKILL_DEF.BF_POISON_PCT);
  DUCO_TWISTERS = cfgNum('skill.DUCO_TWISTERS', SKILL_DEF.DUCO_TWISTERS);
  DUCO_MULT = cfgNum('skill.DUCO_MULT', SKILL_DEF.DUCO_MULT);
  DUCO_SPD_DOWN = cfgNum('skill.DUCO_SPD_DOWN', SKILL_DEF.DUCO_SPD_DOWN);
  DUCO_SPD_UP = cfgNum('skill.DUCO_SPD_UP', SKILL_DEF.DUCO_SPD_UP);
  DUCO_TURNS = cfgNum('skill.DUCO_TURNS', SKILL_DEF.DUCO_TURNS);
  MADAO_SLASHES = cfgNum('skill.MADAO_SLASHES', SKILL_DEF.MADAO_SLASHES);
  MADAO_MULT = cfgNum('skill.MADAO_MULT', SKILL_DEF.MADAO_MULT);
  MADAO_GAP = cfgNum('skill.MADAO_GAP', SKILL_DEF.MADAO_GAP);
  DRAGON_MULT = cfgNum('skill.DRAGON_MULT', SKILL_DEF.DRAGON_MULT);
  DRAGON_TIERS = cfgNum('skill.DRAGON_TIERS', SKILL_DEF.DRAGON_TIERS);
  BLEED_TURNS = cfgNum('skill.BLEED_TURNS', SKILL_DEF.BLEED_TURNS);
  BLEED_PCT = cfgNum('skill.BLEED_PCT', SKILL_DEF.BLEED_PCT);
  TAICHI_BLEED_TURNS = cfgNum('skill.TAICHI_BLEED_TURNS', SKILL_DEF.TAICHI_BLEED_TURNS);
  TAICHI_BLEED_PCT = cfgNum('skill.TAICHI_BLEED_PCT', SKILL_DEF.TAICHI_BLEED_PCT);
  LB_TURNS = cfgNum('skill.LB_TURNS', SKILL_DEF.LB_TURNS);
  LB_DODGE_MULT = cfgNum('skill.LB_DODGE_MULT', SKILL_DEF.LB_DODGE_MULT);
  LB_SPD_MULT = cfgNum('skill.LB_SPD_MULT', SKILL_DEF.LB_SPD_MULT);
  LB_HEAL_MULT = cfgNum('skill.LB_HEAL_MULT', SKILL_DEF.LB_HEAL_MULT);
  LB_GHOSTS = cfgNum('skill.LB_GHOSTS', SKILL_DEF.LB_GHOSTS);
  LLQ_RAGE = cfgNum('skill.LLQ_RAGE', SKILL_DEF.LLQ_RAGE);
  LLQ_DEF_MULT = cfgNum('skill.LLQ_DEF_MULT', SKILL_DEF.LLQ_DEF_MULT);
  LLQ_TARGETS = cfgNum('skill.LLQ_TARGETS', SKILL_DEF.LLQ_TARGETS);
  BC_HITS = cfgNum('skill.BC_HITS', SKILL_DEF.BC_HITS);
  BC_MULT = cfgNum('skill.BC_MULT', SKILL_DEF.BC_MULT);
  BC_DEF_DOWN = cfgNum('skill.BC_DEF_DOWN', SKILL_DEF.BC_DEF_DOWN);
  BC_ATK_UP = cfgNum('skill.BC_ATK_UP', SKILL_DEF.BC_ATK_UP);
  BC_TURNS = cfgNum('skill.BC_TURNS', SKILL_DEF.BC_TURNS);
  DT_HITS = cfgNum('skill.DT_HITS', SKILL_DEF.DT_HITS);
  DT_MULT = cfgNum('skill.DT_MULT', SKILL_DEF.DT_MULT);
  DT_CRIT = cfgNum('skill.DT_CRIT', SKILL_DEF.DT_CRIT);
  DT_TURNS = cfgNum('skill.DT_TURNS', SKILL_DEF.DT_TURNS);
  TD_DEF_DOWN = cfgNum('skill.TD_DEF_DOWN', SKILL_DEF.TD_DEF_DOWN);
  TD_HP_DOWN = cfgNum('skill.TD_HP_DOWN', SKILL_DEF.TD_HP_DOWN);
  TD_SPD_DOWN = cfgNum('skill.TD_SPD_DOWN', SKILL_DEF.TD_SPD_DOWN);
  TD_TURNS = cfgNum('skill.TD_TURNS', SKILL_DEF.TD_TURNS);
  ND_ALL_DOWN = cfgNum('skill.ND_ALL_DOWN', SKILL_DEF.ND_ALL_DOWN);
  ND_TURNS = cfgNum('skill.ND_TURNS', SKILL_DEF.ND_TURNS);
  VTD_ALL_UP = cfgNum('skill.VTD_ALL_UP', SKILL_DEF.VTD_ALL_UP);
  VTD_TURNS = cfgNum('skill.VTD_TURNS', SKILL_DEF.VTD_TURNS);
});

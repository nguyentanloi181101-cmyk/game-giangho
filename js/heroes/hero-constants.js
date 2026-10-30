/* TƯỚNG: hằng số cấp / sao / kỹ năng, tên ulti, viền
   (tách từ index.html cũ — script) */

    // ================= CHỈ SỐ TƯỚNG • CẤP / SAO / KỸ NĂNG • CÀI ĐẶT =================
    const LV_MAX = 1000, STAR_MAX = 6, SKILL_MAX = 10;          // giới hạn nâng cấp
    const LV_GROWTH = 0.02, STAR_GROWTH = 0.10, SKILL_GROWTH = 0.10;  // +2%/cấp, +10%/sao (HP/Công/Thủ), +10%/cấp kỹ năng
    // Cấp & sao ban đầu của từng tướng (chỉ số cơ bản trong HEROES tương ứng với mức này)
    const START_PROG = { 0:{lv:70,star:5}, 1:{lv:73,star:5}, 2:{lv:70,star:5}, 3:{lv:70,star:4}, 4:{lv:73,star:3}, 5:{lv:70,star:5}, 6:{lv:70,star:5}, 7:{lv:70,star:5}, 8:{lv:70,star:5}, 9:{lv:70,star:5}, 10:{lv:70,star:5}, 11:{lv:70,star:5}, 12:{lv:70,star:5} };
    const HERO_BORDER = { 0:'purple', 2:'purple', 6:'purple', 10:'purple', 12:'purple' };               // còn lại viền cam
    const HERO_ULT_NAME = { 0:'Thất Trảm Ma Đao', 1:'Thanh Liên Hoàn Sinh', 2:'Nguyệt Quang Hộ Thể', 3:'Độc Cô Cửu Kiếm', 4:'Thái Cực Quyền', 5:'Liên Hoa Hồi Xuân', 6:'Hồ Điệp Kim Cầu', 7:'Song Long Hỏa Quyển', 8:'Thủy Thần Hộ Thể', 9:'Thiên Hỏa Chu Võng', 10:'Bạch Cốt Đoạt Mệnh', 11:'Hổ Khẩu Thôn Thiên', 12:'Lăng Ba Vi Bộ' };
    const STAT_FIELDS = [
      { k:'hp',    label:'HP (Máu)',   min:1, max:99999999 },
      { k:'atk',   label:'Công',       min:0, max:9999999 },
      { k:'def',   label:'Thủ',        min:0, max:99999 },
      { k:'dodge', label:'Né (%)',     min:0, max:100 },
      { k:'acc',   label:'Chuẩn (%)',  min:0, max:100 },
      { k:'spd',   label:'Tốc',        min:0, max:99999 },
      { k:'startRage', label:'Nộ khởi đầu', min:0, max:100 }
    ];

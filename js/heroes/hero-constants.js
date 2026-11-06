/* TƯỚNG: hằng số cấp / sao / kỹ năng, tên ulti, viền
   (tách từ index.html cũ — script) */

    // ================= CHỈ SỐ TƯỚNG • CẤP / SAO / KỸ NĂNG • CÀI ĐẶT =================
    const LV_MAX = 1000, STAR_MAX = 6;
    // ===== QUY TẮC TĂNG TRƯỞNG TƯỚNG — ADMIN CHỈNH ĐƯỢC (game_config → progress) =====
    //  lvPerStar     : cấp tướng cần cho mỗi sao (mặc định 10): muốn lên ★2 phải đạt cấp 20, ★3 cấp 30, ★n cấp 10×n (★1 là sao khởi đầu)
    //  starNeedsLv   : 1 = tăng sao đòi đủ cấp tướng như trên; 0 = tắt luật này
    //  accLimitsLv   : 1 = cấp tướng không được vượt cấp tài khoản; 0 = tắt luật này
    //  maxStar       : sao tối đa (≤ 15, giao diện chỉ vẽ tới ★15)
    //  lvGrowthPct / starGrowthPct / skillGrowthPct : % HP/Công/Thủ tăng mỗi cấp / mỗi sao / mỗi cấp kỹ năng
    //  skillMax      : cấp kỹ năng tối đa
    //  costSilver / costRice / costGrowthPct : chi phí lên cấp 2 (bạc, gạo) và % đắt thêm mỗi cấp
    const PROG_CFG = cfgSnap('progress', { lvPerStar: 10, maxStar: 15, starNeedsLv: 1, accLimitsLv: 1, lvGrowthPct: 2, starGrowthPct: 10, skillGrowthPct: 10, skillMax: 10, costSilver: 100, costRice: 200, costGrowthPct: 10 });
    Object.assign(PROG_CFG, cfgGet('progress', {}));
    let SKILL_MAX = 10, LV_GROWTH = 0.02, STAR_GROWTH = 0.10, SKILL_GROWTH = 0.10;   // đồng bộ từ PROG_CFG bằng progCfgSync() (gọi cuối hero-progress.js và mỗi lần admin đổi cấu hình)
    const _pn = (v, d, lo, hi) => { v = Number(v); if (!isFinite(v)) v = d; return Math.min(hi, Math.max(lo, v)); };
    // Sao tối đa mà tướng cấp `lv` được phép có (★1 luôn có; ★n cần cấp lvPerStar × n)
    const starCapByLv = lv => PROG_CFG.starNeedsLv ? Math.max(1, Math.floor(Math.max(0, lv | 0) / Math.floor(_pn(PROG_CFG.lvPerStar, 10, 1, 1000)))) : 15;
    function progCfgSync() {
      SKILL_MAX = Math.floor(_pn(PROG_CFG.skillMax, 10, 1, 100));
      LV_GROWTH = _pn(PROG_CFG.lvGrowthPct, 2, 0, 1000) / 100; STAR_GROWTH = _pn(PROG_CFG.starGrowthPct, 10, 0, 1000) / 100; SKILL_GROWTH = _pn(PROG_CFG.skillGrowthPct, 10, 0, 1000) / 100;
      try { STAR_ABS_MAX = Math.floor(_pn(PROG_CFG.maxStar, 15, 1, 15)); LV_COST_SILVER = _pn(PROG_CFG.costSilver, 100, 0, 1e12); LV_COST_RICE = _pn(PROG_CFG.costRice, 200, 0, 1e12); LV_COST_GROWTH = 1 + _pn(PROG_CFG.costGrowthPct, 10, 0, 1000) / 100; } catch (e) {}   // các biến này khai báo ở hero-progress.js
    }
    // Cấp & sao ban đầu của từng tướng (chỉ số cơ bản trong HEROES tương ứng với mức này)
    // Tài khoản bị admin "RESET TRẮNG" (cờ blank_start): mọi tướng cấp 1 ★1, cấp acc 1, tài nguyên 0, bang cấp 1
    const BLANK_START = (() => { try { return localStorage.getItem('blank_start') === '1'; } catch (e) { return false; } })();
    const START_PROG_DEF = { 0:{lv:70,star:5}, 1:{lv:73,star:5}, 2:{lv:70,star:5}, 3:{lv:70,star:4}, 4:{lv:73,star:3}, 5:{lv:70,star:5}, 6:{lv:70,star:5}, 7:{lv:70,star:5}, 8:{lv:70,star:5}, 9:{lv:70,star:5}, 10:{lv:70,star:5}, 11:{lv:70,star:5}, 12:{lv:70,star:5}, 13:{lv:70,star:5}, 14:{lv:70,star:5}, 15:{lv:70,star:5}, 16:{lv:70,star:5}, 17:{lv:70,star:5} };
    const START_PROG = (() => { if (!BLANK_START) return START_PROG_DEF; const o = {}; Object.keys(START_PROG_DEF).forEach(k => { o[k] = { lv: 1, star: 1 }; }); return o; })();
    const HERO_BORDER = { 0:'purple', 2:'purple', 6:'purple', 10:'purple', 12:'purple', 15:'purple', 16:'purple', 17:'purple' };               // còn lại viền cam
    const HERO_ULT_NAME = { 0:'Thất Trảm Ma Đao', 1:'Thanh Liên Hoàn Sinh', 2:'Nguyệt Quang Hộ Thể', 3:'Độc Cô Cửu Kiếm', 4:'Thái Cực Quyền', 5:'Liên Hoa Hồi Xuân', 6:'Hồ Điệp Kim Cầu', 7:'Song Long Hỏa Quyển', 8:'Thủy Thần Hộ Thể', 9:'Thiên Hỏa Chu Võng', 10:'Bạch Cốt Đoạt Mệnh', 11:'Hổ Khẩu Thôn Thiên', 12:'Lăng Ba Vi Bộ', 13:'Thiên Địa Trúc Vũ', 14:'Bích Hải Triều Sinh', 15:'Hà Mô Công', 16:'Nhất Dương Vạn Ấn', 17:'Cửu Chuyển Thái Cực' };
    const STAT_FIELDS = [
      { k:'hp',    label:'HP (Máu)',   min:1, max:99999999 },
      { k:'atk',   label:'Công',       min:0, max:9999999 },
      { k:'def',   label:'Thủ',        min:0, max:99999 },
      { k:'dodge', label:'Né',         min:0, max:99999 },
      { k:'acc',   label:'Chuẩn',      min:0, max:99999 },
      { k:'crit',  label:'Bạo',        min:0, max:99999 },
      { k:'critDmg', label:'Bạo Sát',  min:0, max:99999 },
      { k:'tough', label:'Bền',        min:0, max:99999 },
      { k:'pierce', label:'Phá giáp',  min:0, max:9999999 },
      { k:'block', label:'Đỡ đòn (%)', min:0, max:100 },
      { k:'heal',  label:'Hồi máu (mỗi hiệp)', min:0, max:99999999 },
      { k:'spd',   label:'Tốc',        min:0, max:99999 },
      { k:'startRage', label:'Nộ khởi đầu', min:0, max:100 },
      { k:'tia',   label:'Tia đánh',   min:1, max:99 }
    ];

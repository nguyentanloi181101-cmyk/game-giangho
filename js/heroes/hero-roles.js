/* TƯỚNG: CHẤT TƯỚNG (vai trò) và chỉ số chỉnh tay
   (tách từ index.html cũ — script) */

    // cấp / sao / kỹ năng
    // ---- CHẤT TƯỚNG: quyết định nộ đầu trận, ulti liên tục, thứ tự bị đánh (chọn trong Cài đặt) ----
    const ROLE_NAME  = { skill:'Kỹ năng', atk:'Công kích', sup:'Hỗ trợ', heal:'Trị liệu', tank:'Thủ' };
    const ROLE_ICON  = { skill:'✨', atk:'⚔️', sup:'🌟', heal:'💚', tank:'🛡️' };
    const ROLE_COLOR = { tank:'#ef4444', sup:'#facc15', heal:'#22c55e', skill:'#3b82f6', atk:'#f97316' };
    const ROLE_DESC  = {
      skill:'Kỹ năng: ULTI LIÊN TỤC – lượt nào cũng ulti, không cần đủ nộ.',
      atk:  'Công kích: vào trận với 50 nộ.',
      sup:  'Hỗ trợ: vào trận 100 nộ. Địch ưu tiên đánh THỨ 2 – khi tướng thủ đã chết thì đánh hỗ trợ trước.',
      heal: 'Trị liệu: vào trận 50 nộ. Địch ưu tiên đánh THỨ 2 – khi tướng thủ đã chết thì đánh trị liệu trước.',
      tank: 'Thủ: vào trận 100 nộ. Địch ưu tiên đánh ĐẦU TIÊN.'
    };
    const ROLE_RULE = {
      skill:{ startRage:100, alwaysUlt:true,  taunt:false, prio2:false },
      atk:  { startRage:50,  alwaysUlt:false, taunt:false, prio2:false },
      sup:  { startRage:100, alwaysUlt:false, taunt:false, prio2:true  },
      heal: { startRage:50,  alwaysUlt:false, taunt:false, prio2:true  },
      tank: { startRage:100, alwaysUlt:false, taunt:true,  prio2:false }
    };
    const ROLE_DEFAULT = { 0:'atk', 1:'heal', 2:'sup', 3:'atk', 4:'skill', 5:'heal', 6:'skill', 7:'atk', 8:'tank', 9:'atk', 10:'skill', 11:'sup', 12:'sup', 13:'skill', 14:'skill', 15:'tank', 16:'sup', 17:'sup' };
    let roleOv = loadJSON('hero_role');       // chất tướng người chơi đã chọn
    const HERO_ROLE = {};
    const roleOf = id => (ROLE_RULE[roleOv[id]] ? roleOv[id] : (ROLE_DEFAULT[id] || 'atk'));
    function applyStatOv() {
      HEROES.forEach(h => {
        const r = roleOf(h.id), rule = ROLE_RULE[r];
        HERO_ROLE[h.id] = r;
        HERO_DEFAULTS[h.id].startRage = rule.startRage;
        Object.assign(h, HERO_DEFAULTS[h.id], { alwaysUlt:rule.alwaysUlt, taunt:rule.taunt, prio2:rule.prio2 }, statOv[h.id] || {});
      });
    }
    applyStatOv();

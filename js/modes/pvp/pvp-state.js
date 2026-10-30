/* TỶ VÕ (PVP): hằng số, hạng, trạng thái, lực chiến
   (tách từ index.html cũ — script) */

    // ================= TỶ VÕ (PVP XẾP HẠNG) =================
    // • Khiêu chiến KHÔNG GIỚI HẠN lượt • Thắng: +10.000 lực chiến, mọi tướng ra trận +10.000 HP / +5.000 Công / +3.000 Thủ (cộng dồn theo số trận thắng)
    // • Hạng = vị trí trong bảng (có 3 người thì hạng 1-2-3), tài khoản mới xếp tiếp xuống cuối; thắng đối thủ hạng cao hơn thì lên đúng hạng của họ • Đối thủ = NGƯỜI CHƠI THẬT (không có NPC / người ảo)
    const PVP_DAILY = 30, PVP_START_RANK = 1, PVP_POWER = 10000, PVP_HP = 10000, PVP_ATK = 5000, PVP_DEF = 3000, PVP_MAX_ROUNDS = 10, BASE_POWER = 537647;
    // Giới hạn tối đa điểm Chiến Tích (cộng dồn theo số trận thắng): HP 1.000.000 • Công 500.000 • Thủ 300.000
    const PVP_HP_MAX = 1000000, PVP_ATK_MAX = 500000, PVP_DEF_MAX = 300000;
    const pvHp = w => Math.min(PVP_HP * w, PVP_HP_MAX), pvAtk = w => Math.min(PVP_ATK * w, PVP_ATK_MAX), pvDef = w => Math.min(PVP_DEF * w, PVP_DEF_MAX);
    const pvPow = w => Math.min(PVP_POWER * w, PVP_HP_MAX);   // lực chiến dừng cùng mốc với HP
    const PVP_TIERS = [
      { max:1,     icon:'👑', name:'Võ Lâm Minh Chủ' }, { max:10,    icon:'🐉', name:'Tông Sư' },
      { max:100,   icon:'⚔️', name:'Đại Hiệp' },        { max:500,   icon:'🗡️', name:'Cao Thủ' },
      { max:2000,  icon:'🥋', name:'Tinh Anh' },        { max:5000,  icon:'🛡️', name:'Môn Đồ' },
      { max:10000, icon:'🌱', name:'Vô Danh' }
    ];
    const pvpTier = r => PVP_TIERS.find(t => r <= t.max) || PVP_TIERS[PVP_TIERS.length - 1];
    let pvpState = (() => {
      const s = loadJSON('pvp_state');
      return { rank: Math.min(1e9, Math.max(1, Math.floor(s.rank) || PVP_START_RANK)), wins: Math.max(0, Math.floor(s.wins) || 0),
               rt: Number(s.rt) || 0, used: Math.max(0, Math.floor(s.used) || 0), winStart: Number(s.winStart) || 0, flame: Math.max(0, Math.floor(s.flame) || 0), log: Array.isArray(s.log) ? s.log.slice(0, 20) : [] };
    })();
    const pvpSave = () => saveJSON('pvp_state', pvpState);
    function pvpBonus(frame) { const w = pvpState.wins; return (frame < 0 || !w) ? { hp:0, atk:0, def:0 } : { hp:pvHp(w), atk:pvAtk(w), def:pvDef(w) }; }
    function pvpRefreshWindow() { if (pvpState.used > 0 && Date.now() - pvpState.winStart >= 86400000) { pvpState.used = 0; pvpState.winStart = 0; pvpSave(); } }
    const pvpLeft = () => Infinity;   // PvP không giới hạn lượt
    const fmtClock = ms => { const t = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(t / 3600), Math.floor(t % 3600 / 60), t % 60].map(n => String(n).padStart(2, '0')).join(':'); };
    function updatePower() { const el = document.querySelector('.power-total'); if (el) el.innerText = BASE_POWER + pvPow(pvpState.wins); }
    const unitPower = s => Math.round(s.hp / 5 + s.atk * 2 + s.def * 3);
    const pvpMyPower = () => team.reduce((a, id) => a + unitPower(heroStats(id)), 0);

    let waveRound = 1;   // số hiệp trong ải thường (Tỷ Võ dùng pvpRound)
    const curRound = () => (typeof pvp !== 'undefined' && pvp) ? pvpRound : waveRound;
    let pvpOpps = [], pvp = null, pvpRound = 0, pvpDmg = { hero: 0, enemy: 0 };   // pvpDmg: tổng sát thương mỗi bên đã gây ra trong trận

    // Tỷ Võ CHỈ có người chơi thật (tài khoản khác đăng nhập đám mây) — không có NPC / người ảo
    function pvpGenOpps() { pvpMixReal(); }
    function openPvp() { if (!pvpOpps.length) pvpGenOpps(); else pvpMixReal(); renderPvp(); switchScreen('pvp'); }

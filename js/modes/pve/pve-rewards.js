/* PVE: thưởng BẠC 🥈 và GẠO 🌾 khi thắng mỗi Bàn
   (viết mới) */

    // Bàn 1 Ải 1: 3000 bạc + 2500 gạo. Mỗi Bàn sau nhận nhiều hơn Bàn trước 10%
    // (Ải 1: Bàn 2 = 3300 bạc / 2750 gạo, Bàn 3 = 3630 bạc / 3025 gạo, ...). Bàn 1 của Ải 2 là Bàn thứ 11, v.v.
    const BAN_SILVER_BASE = 3000, BAN_RICE_BASE = 2500, BAN_REWARD_GROWTH = 1.1;
    // Thần đan 💎 & Tiên đan 🔮: Ải 1 Bàn 1 = 2 thần đan + 100 tiên đan, tăng cấp số nhân ×1,1 mỗi Bàn như bạc/gạo
    const BAN_THAN_BASE = 2, BAN_TIEN_BASE = 100;
    const _danLS = k => { try { const v = parseFloat(localStorage.getItem(k)); return isNaN(v) ? 0 : Math.max(0, v); } catch (e) { return 0; } };
    let thanDan = _danLS('thandan_val'), tienDan = _danLS('tiendan_val');
    const danSave = () => { try { localStorage.setItem('thandan_val', String(Math.floor(thanDan))); localStorage.setItem('tiendan_val', String(Math.floor(tienDan))); } catch (e) {} };
    const banIndex = (stage, battle) => (stage - 1) * 10 + battle;
    function banReward(stage, battle) {
      const m = Math.pow(BAN_REWARD_GROWTH, banIndex(stage, battle) - 1);
      return { silver: Math.round(BAN_SILVER_BASE * m), rice: Math.round(BAN_RICE_BASE * m), than: Math.round(BAN_THAN_BASE * m), tien: Math.round(BAN_TIEN_BASE * m) };
    }
    function grantBanReward(stage, battle) {
      const r = banReward(stage, battle);
      silver += r.silver; rice += r.rice; thanDan += r.than; tienDan += r.tien; resSave(); danSave();
      return `\n\n🥈 +${fmtN(r.silver)} bạc • 🌾 +${fmtN(r.rice)} gạo\n💎 +${fmtN(r.than)} thần đan • 🔮 +${fmtN(r.tien)} tiên đan`;
    }

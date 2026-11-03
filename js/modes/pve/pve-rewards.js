/* PVE: thưởng BẠC 🥈 và GẠO 🌾 khi thắng mỗi Bàn
   (viết mới) */

    // Bàn 1 Ải 1: 3000 bạc + 2500 gạo. Mỗi Bàn sau nhận nhiều hơn Bàn trước 10%
    // (Ải 1: Bàn 2 = 3300 bạc / 2750 gạo, Bàn 3 = 3630 bạc / 3025 gạo, ...). Bàn 1 của Ải 2 là Bàn thứ 11, v.v.
    const BAN_SILVER_BASE = 3000, BAN_RICE_BASE = 2500, BAN_REWARD_GROWTH = 1.1;
    const banIndex = (stage, battle) => (stage - 1) * 10 + battle;
    function banReward(stage, battle) {
      const m = Math.pow(BAN_REWARD_GROWTH, banIndex(stage, battle) - 1);
      return { silver: Math.round(BAN_SILVER_BASE * m), rice: Math.round(BAN_RICE_BASE * m) };
    }
    function grantBanReward(stage, battle) {
      const r = banReward(stage, battle);
      silver += r.silver; rice += r.rice; resSave();
      return `\n\n🥈 +${fmtN(r.silver)} bạc • 🌾 +${fmtN(r.rice)} gạo`;
    }

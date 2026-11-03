/* PVE: thưởng BẠC 🥈 và GẠO 🌾 khi thắng mỗi Bàn
   (viết mới) */

    // Bàn 1 Ải 1: 3000 bạc + 2500 gạo. Mỗi Bàn sau nhận nhiều hơn Bàn trước 10%
    // (Ải 1: Bàn 2 = 3300 bạc / 2750 gạo, Bàn 3 = 3630 bạc / 3025 gạo, ...). Bàn 1 của Ải 2 là Bàn thứ 11, v.v.
    const BAN_SILVER_BASE = 3000, BAN_RICE_BASE = 2500, BAN_REWARD_GROWTH = 1.1;
    // Thần Đan 🔮 & Tiên Đan 🔴: Ải 1 Bàn 1 = 2 Thần Đan + 100 Tiên Đan, tăng ×1,1 mỗi Bàn như bạc/gạo.
    // Ghi vào kho Túi Đồ (cùng kho mà Đột Phá / Bồi Dưỡng đang đọc).
    const BAN_THAN_BASE = 2, BAN_TIEN_BASE = 100;
    function danAdd(name, ico, n) {
      if (!(n > 0)) return;
      try { const s = gdSt(); const k = (s.kho[name] = s.kho[name] || { ico, qty: 0 }); k.qty = Math.max(0, k.qty + n); gdSave(s); } catch (e) {}
    }
    const banIndex = (stage, battle) => (stage - 1) * 10 + battle;
    function banReward(stage, battle) {
      const m = Math.pow(BAN_REWARD_GROWTH, banIndex(stage, battle) - 1);
      return { silver: Math.round(BAN_SILVER_BASE * m), rice: Math.round(BAN_RICE_BASE * m), than: Math.round(BAN_THAN_BASE * m), tien: Math.round(BAN_TIEN_BASE * m) };
    }
    function grantBanReward(stage, battle) {
      const r = banReward(stage, battle);
      silver += r.silver; rice += r.rice; resSave();
      danAdd('Thần Đan', '🔮', r.than); danAdd('Tiên Đan', '🔴', r.tien);
      return `\n\n🥈 +${fmtN(r.silver)} bạc • 🌾 +${fmtN(r.rice)} gạo\n🔮 +${fmtN(r.than)} Thần Đan • 🔴 +${fmtN(r.tien)} Tiên Đan`;
    }

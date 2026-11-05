
/* PVE: Thưởng BẠC, GẠO, THẦN ĐAN, TIÊN ĐAN */

// Bàn 1 Ải 1: 3000 bạc + 2500 gạo
// Mỗi Bàn tiếp theo tăng 10%.
// Bàn 1 Ải 2 là Bàn thứ 11.

// Rút gọn số: K, M, B, T, MB
function fmtRewardN(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '0';

  const a = Math.abs(v);
  const units = [
    [1e15, 'MB'],
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K']
  ];

  for (const [size, suffix] of units) {
    if (a >= size) {
      const x = v / size;
      const digits = Math.abs(x) >= 100 ? 0
        : Math.abs(x) >= 10 ? 1 : 2;

      return Number(x.toFixed(digits)).toString() + suffix;
    }
  }

  return Math.round(v).toLocaleString('vi-VN');
}

// Phần thưởng cơ bản
const BAN_SILVER_BASE = 3000;
 BAN_RICE_BASE = 2500;
 BAN_REWARD_GROWTH = 1.005;

const BAN_THAN_BASE = 2;
const BAN_TIEN_BASE = 100;
// Admin chỉnh được (admin-config.html → tab Thưởng PVE)
const PVE_CFG = cfgSnap('pve', { silverBase: BAN_SILVER_BASE, riceBase: BAN_RICE_BASE, growth: BAN_REWARD_GROWTH, thanBase: BAN_THAN_BASE, tienBase: BAN_TIEN_BASE });
Object.assign(PVE_CFG, cfgGet('pve', {}));

// Thêm đan vào kho Túi Đồ
function danAdd(name, ico, n) {
  if (!(n > 0)) return;

  try {
    const s = gdSt();
    const k = (s.kho[name] =
      s.kho[name] || { ico, qty: 0 });

    k.qty = Math.max(0, k.qty + n);
    gdSave(s);
  } catch (e) {}
}

// Tính số thứ tự Bàn
const banIndex = (stage, battle) =>
  (stage - 1) * 10 + battle;

// Tính phần thưởng
function banReward(stage, battle) {
  const m = Math.pow(
    Number(PVE_CFG.growth) || 1,
    banIndex(stage, battle) - 1
  );

  return {
    silver: Math.round(PVE_CFG.silverBase * m),
    rice: Math.round(PVE_CFG.riceBase * m),
    than: Math.round(PVE_CFG.thanBase * m),
    tien: Math.round(PVE_CFG.tienBase * m)
  };
}

// Nhận thưởng khi thắng PVE
function grantBanReward(stage, battle) {
  const r = banReward(stage, battle);

  silver += r.silver;
  rice += r.rice;
  resSave();

  danAdd('Thần Đan', '🔮', r.than);
  danAdd('Tiên Đan', '🔴', r.tien);

  return `\n\n🥈 +${fmtRewardN(r.silver)} bạc • 🌾 +${fmtRewardN(r.rice)} gạo\n🔮 +${fmtRewardN(r.than)} Thần Đan • 🔴 +${fmtRewardN(r.tien)} Tiên Đan`;
}

/* PVE: thưởng bạc, gạo, Thần Đan và Tiên Đan.
   Tất cả phần thưởng tăng 10% theo thứ tự bàn xuyên suốt các ải. */

const BAN_SILVER_BASE = 3000, BAN_RICE_BASE = 2500;
const BAN_THAN_DAN_BASE = 2, BAN_TIEN_DAN_BASE = 100;
const BAN_REWARD_GROWTH = 1.1;
const banIndex = (stage, battle) => (stage - 1) * 10 + battle;
const _pveItemCount = (key) => {
  try { const n = parseInt(localStorage.getItem(key), 10); return Number.isFinite(n) ? Math.max(0, n) : 0; }
  catch (e) { return 0; }
};
let thanDan = _pveItemCount('than_dan_val');
let tienDan = _pveItemCount('tien_dan_val');
function savePveDan() {
  try {
    localStorage.setItem('than_dan_val', String(Math.floor(thanDan)));
    localStorage.setItem('tien_dan_val', String(Math.floor(tienDan)));
  } catch (e) {}
}
function banReward(stage, battle) {
  const m = Math.pow(BAN_REWARD_GROWTH, banIndex(stage, battle) - 1);
  return {
    silver: Math.round(BAN_SILVER_BASE * m),
    rice: Math.round(BAN_RICE_BASE * m),
    thanDan: Math.max(1, Math.round(BAN_THAN_DAN_BASE * m)),
    tienDan: Math.round(BAN_TIEN_DAN_BASE * m)
  };
}
function grantBanReward(stage, battle) {
  const r = banReward(stage, battle);
  silver += r.silver; rice += r.rice;
  thanDan += r.thanDan; tienDan += r.tienDan;
  resSave(); savePveDan();
  return `\\n\\n🥈 +${fmtN(r.silver)} bạc • 🌾 +${fmtN(r.rice)} gạo • 🔴 +${fmtN(r.thanDan)} Thần Đan • 🟡 +${fmtN(r.tienDan)} Tiên Đan`;
}

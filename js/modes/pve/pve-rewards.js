/* PVE rewards: silver/rice + Thần Đan/Tiên Đan. All items use guild_state.kho so Túi Đồ and Đột Phá/Bồi Dưỡng share one inventory. */
const BAN_SILVER_BASE = 3000, BAN_RICE_BASE = 2500;
const BAN_THAN_DAN_BASE = 2, BAN_TIEN_DAN_BASE = 100;
const BAN_REWARD_GROWTH = 1.1;
const banIndex = (stage, battle) => (stage - 1) * 10 + battle;
function banReward(stage, battle) {
  const m = Math.pow(BAN_REWARD_GROWTH, banIndex(stage, battle) - 1);
  return { silver: Math.round(BAN_SILVER_BASE*m), rice: Math.round(BAN_RICE_BASE*m), thanDan: Math.max(1, Math.round(BAN_THAN_DAN_BASE*m)), tienDan: Math.round(BAN_TIEN_DAN_BASE*m) };
}
function grantPveDan(name, qty, ico) {
  qty = Math.max(0, Math.floor(Number(qty) || 0)); if (!qty) return;
  try {
    if (typeof gdSt === 'function' && typeof gdSave === 'function') {
      const s = gdSt(); s.kho = s.kho || {};
      const item = s.kho[name] = s.kho[name] || { ico, qty: 0 };
      item.ico = item.ico || ico; item.qty = Math.max(0, Math.floor(Number(item.qty)||0)) + qty;
      gdSave(s); return;
    }
  } catch (e) {}
  // Fallback only if the guild inventory module is not available.
  const key = name === 'Thần Đan' ? 'than_dan_val' : 'tien_dan_val';
  const old = Math.max(0, Number(localStorage.getItem(key)) || 0);
  localStorage.setItem(key, String(old + qty));
}
function grantBanReward(stage, battle) {
  const r = banReward(stage, battle);
  silver += r.silver; rice += r.rice; resSave();
  grantPveDan('Thần Đan', r.thanDan, '🔴');
  grantPveDan('Tiên Đan', r.tienDan, '🟡');
  return `\n\n🥈 +${fmtN(r.silver)} bạc • 🌾 +${fmtN(r.rice)} gạo • 🔴 +${fmtN(r.thanDan)} Thần Đan • 🟡 +${fmtN(r.tienDan)} Tiên Đan`;
}

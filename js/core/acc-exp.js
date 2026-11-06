/* CẤP TÀI KHOẢN + EXP (thay cho hệ thống Chìa Khóa 🔑 cũ)
   - Thắng mỗi Bàn PVE (và quét) nhận EXP (admin chỉnh `pve.expBase` như bạc/gạo/Thần Đan/Tiên Đan). Đủ EXP thì tự lên cấp acc.
   - Cấp acc chính là giới hạn cấp của TẤT CẢ tướng và trang bị (heroCap / eqCap).
   - Admin chỉnh ở admin-config.html → tab "Cấp & EXP":
       exp.base = EXP cần để lên cấp 2 • exp.growth = % tăng thêm mỗi cấp  (EXP nhận mỗi Bàn: tab "Thưởng PVE")
   - Cấp 1→2 cần `base` EXP; cấp k→k+1 cần base × (1 + growth/100)^(k−1)  (mặc định 3000, +10%/cấp) */

const ACC_START = BLANK_START ? 1 : 74;   // tài khoản kiểu cũ (không có cờ blank_start) vẫn bắt đầu cấp 74
const EXP_CFG = cfgSnap('exp', { base: 3000, growth: 10 });
Object.assign(EXP_CFG, cfgGet('exp', {}));

let accLevel = (() => { let v = 0; try { v = parseInt(localStorage.getItem('acc_level')) || 0; } catch (e) {}
  return Math.min(LV_MAX, Math.max(ACC_START, v)); })();
let accExp = (() => { try { return Math.max(0, Math.floor(parseFloat(localStorage.getItem('acc_exp')) || 0)); } catch (e) { return 0; } })();   // EXP đang có ở cấp hiện tại

// EXP cần để lên từ cấp `lv` → `lv+1`
const expNeed = lv => {
  const base = Math.max(1, Number(EXP_CFG.base) || 3000), g = Math.max(0, Number(EXP_CFG.growth)); const gr = 1 + (isFinite(g) ? g : 10) / 100;
  const v = Math.round(base * Math.pow(gr, Math.max(0, lv - 1)));
  return isFinite(v) ? Math.max(1, v) : Number.MAX_SAFE_INTEGER;
};

// Cấp acc chính là giới hạn cấp của TẤT CẢ tướng và trang bị
const heroCap = id => Math.max(accLevel, (START_PROG[id] || { lv:1 }).lv);
const eqCap = () => accLevel;

function accSave() {
  try { localStorage.setItem('acc_level', String(accLevel)); localStorage.setItem('acc_exp', String(Math.floor(accExp))); } catch (e) {}
}
function updateAccExp() {
  const al = document.getElementById('acc-level'); if (al) al.innerText = accLevel;
  const full = accLevel >= LV_MAX, need = expNeed(accLevel), pct = full ? 100 : Math.max(0, Math.min(100, accExp / need * 100));
  const f = document.getElementById('exp-fill'); if (f) f.style.width = pct + '%';
  const t = document.getElementById('exp-text'); if (t) t.innerText = full ? 'EXP MAX' : 'EXP ' + fmtN(accExp) + ' / ' + fmtN(need);
}
const updateKeys = updateAccExp;   // tên cũ (một số file vẫn gọi)

// Cộng EXP, tự lên cấp. Trả về số cấp vừa lên.
function addAccExp(n) {
  n = Math.max(0, Math.floor(Number(n) || 0)); if (!n || accLevel >= LV_MAX) return 0;
  const from = accLevel; accExp += n;
  while (accLevel < LV_MAX) { const need = expNeed(accLevel); if (accExp < need) break; accExp -= need; accLevel++; }
  if (accLevel >= LV_MAX) accExp = 0;
  accSave(); updateAccExp();
  if (accLevel > from) {
    try { if (typeof updatePower === 'function') updatePower(); } catch (e) {}
    try { const s = document.getElementById('screen-vohiep'); if (s && s.classList.contains('active') && typeof renderVoHiep === 'function') renderVoHiep(); } catch (e) {}
  }
  return accLevel - from;
}

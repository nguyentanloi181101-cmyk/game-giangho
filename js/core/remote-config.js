/* CẤU HÌNH DO ADMIN CHỈNH (thông số tướng, Bảo Vật, trang bị, boss bang, Lò Luyện Hỏa)
   - Admin sửa ở trang riêng admin-config.html -> lưu Firestore 'game_config/main' (1 field 'json').
   - Game tải qua REST (không cần đăng nhập), cache ở localStorage 'game_cfg' (KHÔNG theo save/đám mây của người chơi).
     Mất mạng vẫn dùng bản cache; chưa có cấu hình thì dùng số mặc định trong code.
   - File này nạp ĐẦU TIÊN. Các file dữ liệu gọi cfgSnap(...) để lưu bản mặc định, cfgApply() ghi đè lên đúng đối tượng.
   Cấu trúc JSON:
     heroes:   { "<id>": { hp, atk, def, dodge, acc, crit, critDmg, tough, pierce, block, heal, spd, startRage, tia, role } }  (chỉ trường nào khác mặc định)
     treasure: { starAdd, maxLv, maxStar, kinds: { "<loại>": [ {base, per} | null, ... 3 dòng ] } }
     equip:    { maxLv, rewardEach, rewardStartLv, per: { hat, armor, sword, boots } }
     exp:      { perStage, base, growth }                        (EXP mỗi Ải • EXP lên cấp 2 • % tăng mỗi cấp)
     pve:      { silverBase, riceBase, growth, thanBase, tienBase, extra: [ {t,n,...} ] }   (extra = thưởng thêm mỗi trận)
     boss:     { daily, baseHp, hpMult, ctMult, atkDiv, heroDmgMult, maxRounds, ptsPerDmg, killPts }
     guild:    { hp1, def1, atk, hp2, def2, pierce, heal, spd, critDmg, boss }     (mỗi cấp Lò Luyện Hỏa) */

const CFG_URL = 'https://firestore.googleapis.com/v1/projects/game-118e8/databases/(default)/documents/game_config/main';
let GAME_CFG = (() => { try { return JSON.parse(localStorage.getItem('game_cfg')) || {}; } catch (e) { return {}; } })();
const cfgBase = {};   // bản MẶC ĐỊNH nguyên gốc (chụp lúc file dữ liệu nạp, trước khi ghi đè)
function cfgSnap(name, v) { if (!(name in cfgBase)) cfgBase[name] = JSON.parse(JSON.stringify(v)); return v; }
function cfgGet(path, def) {
  let o = GAME_CFG;
  for (const k of path.split('.')) { if (o === null || typeof o !== 'object') return def; o = o[k]; }
  return (o === undefined || o === null || o === '') ? def : o;
}
const cfgNum = (path, def) => { const v = Number(cfgGet(path, def)); return isFinite(v) ? v : def; };

// Ghi đè chỉ số cơ bản tướng. Trả { stat, role } cho statOv / roleOv (chỉ phần Nộ khởi đầu & chất tướng đi đường này).
function cfgHeroPatch() {
  const ov = GAME_CFG.heroes || {}, stat = {}, role = {};
  if (typeof HERO_DEFAULTS === 'undefined' || !cfgBase.hero) return { stat, role };
  Object.keys(HERO_DEFAULTS).forEach(id => {
    Object.assign(HERO_DEFAULTS[id], cfgBase.hero[id]);
    const c = ov[id]; if (!c) return;
    Object.keys(c).forEach(k => {
      if (k === 'role') role[id] = c[k];
      else if (k === 'startRage') (stat[id] = stat[id] || {}).startRage = Number(c[k]);
      else if (k in HERO_DEFAULTS[id] && isFinite(Number(c[k]))) HERO_DEFAULTS[id][k] = Number(c[k]);
    });
  });
  return { stat, role };
}

function cfgApply(refresh) {
  try {
    if (typeof statOv !== 'undefined' && typeof applyStatOv === 'function' && cfgBase.hero) {
      const p = cfgHeroPatch(); statOv = p.stat; roleOv = p.role; applyStatOv();
    }
    if (typeof TS_DEFS !== 'undefined' && cfgBase.ts) {
      const kinds = cfgGet('treasure.kinds', {});
      Object.keys(TS_DEFS).forEach(k => TS_DEFS[k].stats.forEach((st, i) => {
        const b = cfgBase.ts[k].stats[i], o = ((kinds[k] || [])[i]) || {};
        st[1] = isFinite(parseFloat(o.base)) ? +o.base : b[1]; st[2] = isFinite(parseFloat(o.per)) ? +o.per : b[2];
      }));
      TS_STAR_ADD = cfgNum('treasure.starAdd', cfgBase.tsStarAdd); TS_MAX = cfgNum('treasure.maxLv', cfgBase.tsMax); TS_STAR_MAX = cfgNum('treasure.maxStar', cfgBase.tsStarMax);
    }
    if (typeof EQUIP !== 'undefined' && cfgBase.eqper) {
      EQUIP.forEach((e, i) => { e.per = cfgNum('equip.per.' + e.k, cfgBase.eqper[i]); });
      EQUIP_MAX = cfgNum('equip.maxLv', cfgBase.eqMax);
      EQ_REWARD.each = cfgNum('equip.rewardEach', cfgBase.eqReward.each); EQ_REWARD.startLv = cfgNum('equip.rewardStartLv', cfgBase.eqReward.startLv);
    }
    if (typeof GD_PER !== 'undefined' && cfgBase.gdper) Object.assign(GD_PER, cfgBase.gdper, GAME_CFG.guild || {});
    if (typeof BOSS_CFG !== 'undefined' && cfgBase.boss) Object.assign(BOSS_CFG, cfgBase.boss, GAME_CFG.boss || {});
    if (typeof PVE_CFG !== 'undefined' && cfgBase.pve) Object.assign(PVE_CFG, cfgBase.pve, GAME_CFG.pve || {});
    if (typeof EXP_CFG !== 'undefined' && cfgBase.exp) { Object.assign(EXP_CFG, cfgBase.exp, GAME_CFG.exp || {}); try { updateAccExp(); } catch (e) {} }
    if (refresh) {
      try { renderHomeTeam(); } catch (e) {} try { updatePower(); } catch (e) {} try { if (typeof renderPvp === 'function') renderPvp(); } catch (e) {}
    }
  } catch (e) { console.warn('cfgApply', e); }
}

// Tải cấu hình mới nhất (gọi 1 lần lúc khởi động). Có thay đổi -> lưu cache + áp dụng ngay.
async function cfgFetch() {
  try {
    const r = await fetch(CFG_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (r.status === 404) { if (localStorage.getItem('game_cfg') !== null) { localStorage.removeItem('game_cfg'); GAME_CFG = {}; cfgApply(true); } return; }
    if (!r.ok) return;
    const d = await r.json(), txt = d && d.fields && d.fields.json && d.fields.json.stringValue;
    if (typeof txt !== 'string' || txt === localStorage.getItem('game_cfg')) return;
    GAME_CFG = JSON.parse(txt); localStorage.setItem('game_cfg', txt); cfgApply(true);
  } catch (e) { /* mất mạng: dùng bản cache */ }
}

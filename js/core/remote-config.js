/* CẤU HÌNH DO ADMIN CHỈNH (thông số tướng, Bảo Vật, trang bị, boss bang, Lò Luyện Hỏa)
   - Admin sửa ở trang riêng admin-config.html -> lưu Firestore 'game_config/main' (1 field 'json').
   - Game tải qua REST (không cần đăng nhập), cache ở localStorage 'game_cfg' (KHÔNG theo save/đám mây của người chơi).
     Mất mạng vẫn dùng bản cache; chưa có cấu hình thì dùng số mặc định trong code.
   - File này nạp ĐẦU TIÊN. Các file dữ liệu gọi cfgSnap(...) để lưu bản mặc định, cfgApply() ghi đè lên đúng đối tượng.
   Cấu trúc JSON:
     heroes:   { "<id>": { hp, atk, def, dodge, acc, crit, critDmg, tough, pierce, block, heal, spd, startRage, tia, role } }  (chỉ trường nào khác mặc định)
     treasure: { starAdd, maxLv, maxStar, kinds: { "<loại>": [ {base, per} | null, ... 3 dòng ] } }
     equip:    { maxLv, rewardEach, rewardStartLv, per: { hat, armor, sword, boots } }
     progress: { lvPerStar, maxStar, starNeedsLv, accLimitsLv, lvGrowthPct, starGrowthPct, skillGrowthPct, skillMax, costSilver, costRice, costGrowthPct }   (luật cấp/sao tướng)
     exp:      { base, growth }                                  (EXP lên cấp 2 • % tăng mỗi cấp)
     pve:      { silverBase, riceBase, growth, thanBase, tienBase, expBase, pillBase, extra: [ {t,n,...} ] }   (extra = thưởng thêm mỗi trận)
     foe:      { hp, atk, def, dodge, growth, bossMult, counts:[t1,t2,t3,t4], rules:[{from,to,c:[..]}] }   (địch PVE)
     boss:     { daily, baseHp, hpMult, ctMult, atkDiv, heroDmgMult, maxRounds, ptsPerDmg, killPts }
     guild:    { hp1, def1, atk, hp2, def2, pierce, heal, spd, critDmg, boss }     (mỗi cấp Lò Luyện Hỏa)
     stamina:  { max, regenSec, perWave, waves, pill }            (thể lực: tối đa • giây hồi 1 điểm • tốn/trận • số trận/Bàn • mỗi viên +bao nhiêu)
     recruit:  { lam|tim|ten: { cdMin, n, cost }, mergeCost, shardPerStar, weights: { "<idTướng>": trọng số } }   (Chiêu Mộ + ghép mảnh)
     pvp:      { power, hp, atk, def, hpMax, atkMax, defMax, rounds, flameWin, flameLose, flameCost }   (Tỷ Võ)
     mail:     { daily (1/0), days, gifts: [ {t,n,...} ], letters: [ {id,title,body,gifts,from,to} ] }   (Hộp Thư: quà hằng ngày + thư admin gửi)
     quest:    { tasks: { "<id>": { name, n, pts, off } }, chests: [ { pts, gifts: [ {t,n,...} ] } ] }    (Nhiệm Vụ / Tích Cực)
     event:    { list: [ { id, name, ico, kind: 'daily'|'once'|'soon', gifts, from, to, off } ] }        (Sự Kiện)
     misc:     { sweepN, ttFeed: {"Thú Hồn","Thú Linh"}, bagPrice: {"<vật phẩm>": giá bán}, bossBeastRage }
   Quà (reward) dùng chung 1 định dạng với Gift Code: { t: 'silver'|'rice'|'gold'|'than'|'tien'|'pill'|'hammer'|'exp'|'shard'|'treasure'|'beast'|'tshard'|'item', n, id?, name?, ico? } */

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

// Các file dữ liệu đăng ký hàm đọc cấu hình: chạy ngay 1 lần khi đăng ký và chạy lại mỗi lần cfgApply (khi admin đổi số).
const cfgHooks = [];
function cfgOnApply(fn) { cfgHooks.push(fn); try { fn(); } catch (e) { console.warn('cfgHook', e); } }

// ----- Quà (reward): cùng định dạng với Gift Code. Dùng cho Hộp Thư, Nhiệm Vụ, Sự Kiện. -----
const RW_GOLD_ICO = '<img class="gi-g" src="assets/images/items/thoi-vang.svg" alt="vàng">';
const rwOk = r => !!(r && r.t && Number(r.n) > 0);
const rwList = v => (Array.isArray(v) ? v : []).filter(rwOk);
// Trả { ico (HTML), name, n } để hiển thị 1 phần quà
function rwInfo(r) {
  const n = Math.floor(Number(r.n)) || 0;
  const simple = { silver: ['🥈', 'Bạc'], rice: ['🌾', 'Gạo'], gold: [RW_GOLD_ICO, 'Vàng'], than: ['🔮', 'Thần Đan'], tien: ['🔴', 'Tiên Đan'], pill: ['💊', 'Viên Thể Lực'], hammer: ['🔨', 'Búa'], exp: ['✨', 'EXP'] };
  if (simple[r.t]) return { ico: simple[r.t][0], name: simple[r.t][1], n };
  if (r.t === 'shard') { let nm = 'tướng #' + r.id; try { nm = heroById(Number(r.id)).name; } catch (e) {} return { ico: '🧩', name: 'Mảnh ' + nm, n }; }
  if (r.t === 'treasure') { let nm = 'Bảo Vật'; try { nm = TS_DEFS[r.id].name; } catch (e) {} return { ico: '🏺', name: nm, n }; }
  if (r.t === 'beast') return { ico: '🦄', name: 'Thần thú ' + (r.name || ''), n: 1 };
  if (r.t === 'tshard') return { ico: '🧩', name: 'Mảnh ' + (r.name || ''), n };
  if (r.t === 'item') return { ico: r.ico || '🎁', name: r.name || 'Vật phẩm', n };
  return { ico: '🎁', name: String(r.t), n };
}
const rwText = r => { const i = rwInfo(r); return i.ico + ' ' + (typeof fmtN === 'function' ? fmtN(i.n) : i.n) + ' ' + i.name; };
const rwTextAll = L => rwList(L).map(rwText).join(' • ');
// Nhận cả danh sách quà (dùng gcGrant của giftcode.js). Trả chuỗi mô tả những gì đã nhận.
function rwGrantAll(L) { const got = []; rwList(L).forEach(r => { try { const t = gcGrant(r); if (t) got.push(t); } catch (e) {} }); return got.join(', '); }

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
    if (typeof FOE_CFG !== 'undefined' && cfgBase.foe) Object.assign(FOE_CFG, cfgBase.foe, GAME_CFG.foe || {});
    if (typeof PROG_CFG !== 'undefined' && cfgBase.progress) { Object.assign(PROG_CFG, cfgBase.progress, GAME_CFG.progress || {}); try { progCfgSync(); } catch (e) {} }
    if (typeof EXP_CFG !== 'undefined' && cfgBase.exp) { Object.assign(EXP_CFG, cfgBase.exp, GAME_CFG.exp || {}); try { updateAccExp(); } catch (e) {} }
    cfgHooks.forEach(fn => { try { fn(); } catch (e) { console.warn('cfgHook', e); } });
    if (refresh) {
      try { if (typeof updateMailBadge === 'function') updateMailBadge(); } catch (e) {} try { if (typeof staRender === 'function') staRender(); } catch (e) {}
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

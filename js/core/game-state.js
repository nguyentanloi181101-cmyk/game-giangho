/* TRẠNG THÁI CHUNG: tiện ích loadJSON/saveJSON/fmtN, vàng, mảnh tướng, bản gốc chỉ số
   (tách từ index.html cũ — script) */

   
const fmtN = n => {
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
};

    const heroById = id => HEROES.find(h => h.id === id);

    const HERO_DEFAULTS = {};
    HEROES.forEach(h => { HERO_DEFAULTS[h.id] = { hp:h.hp, atk:h.atk, def:h.def, dodge:h.dodge, acc:h.acc || 0, crit:h.crit || 0, critDmg:h.critDmg || 0, tough:h.tough || 0, pierce:h.pierce || 0, block:h.block || 0, heal:h.heal || 0, spd:h.spd, startRage:h.startRage || 0, tia:h.tia || 1 }; });
    cfgSnap('hero', HERO_DEFAULTS);   // bản mặc định để admin ghi đè (remote-config.js)
    const loadJSON = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
    const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    let statOv = cfgHeroPatch().stat;   // chỉ số tướng do ADMIN chỉnh (không còn chỉnh trong Cài đặt)
    let gold = (() => { try { const v = parseInt(localStorage.getItem('gold_val')); return isNaN(v) ? (BLANK_START ? 0 : 2291) : Math.max(0, v); } catch (e) { return BLANK_START ? 0 : 2291; } })();
    const updateGold = () => { ['gold-val', 'rc-gold'].forEach(i => { const el = document.getElementById(i); if (el) el.innerText = gold; }); };
    const goldSave = () => { try { localStorage.setItem('gold_val', String(gold)); } catch (e) {} updateGold(); };
    // BẠC 🥈 và GẠO 🌾: nhận khi thắng mỗi Bàn PVE, dùng để tăng cấp tướng. (VÀNG 🪙 ở trên: dùng Chiêu Mộ, nhận quà Hộp Thư mỗi ngày)
    const _numLS = (k, d) => { try { const v = parseFloat(localStorage.getItem(k)); return isNaN(v) ? d : Math.max(0, v); } catch (e) { return d; } };
    let silver = _numLS('silver_val', BLANK_START ? 0 : 21873054), rice = _numLS('rice_val', BLANK_START ? 0 : 2549836);
    // THẦN ĐAN 💎 và TIÊN ĐAN 🔮: thưởng khi thắng mỗi Bàn PVE (xem trong Túi Đồ)
    let thanDan = _numLS('thandan_val', 0), tienDan = _numLS('tiendan_val', 0);
    const updateRes = () => { [['silver-val', silver], ['rice-val', rice]].forEach(([i, v]) => { const el = document.getElementById(i); if (el) el.innerText = fmtN(v); }); };
    const resSave = () => { try { localStorage.setItem('silver_val', String(Math.floor(silver))); localStorage.setItem('rice_val', String(Math.floor(rice))); localStorage.setItem('thandan_val', String(Math.floor(thanDan))); localStorage.setItem('tiendan_val', String(Math.floor(tienDan))); } catch (e) {} updateRes(); };
    updateRes();
    let heroShards = loadJSON('hero_shards');   // mảnh tướng: { heroId: số mảnh }
    let recState = loadJSON('rec_state');       // thời điểm được quay miễn phí kế tiếp: { lam, tim, ten }
    let SHARD_PER_STAR = 10;                    // lên ★N cần N × 10 mảnh của chính tướng đó (★6 = 60 mảnh) — admin chỉnh: recruit.shardPerStar
    cfgOnApply(() => { SHARD_PER_STAR = Math.max(1, Math.floor(cfgNum('recruit.shardPerStar', 10))); });
    const shardsOf = id => Math.max(0, heroShards[id] | 0);
    const starCost = star => star * SHARD_PER_STAR;   // chi phí để đạt ★star
    let heroProg = loadJSON('hero_prog');

    // ===== SỞ HỮU TƯỚNG: chỉ có tướng khi đủ 10 MẢNH rồi GHÉP MẢNH (Võ Hiệp → Ghép Mảnh). Mảnh lấy từ Chiêu Mộ / Gift Code =====
    // Áp dụng cho tài khoản kiểu mới "tất cả về 1" (cờ blank_start). Tài khoản kiểu cũ (tướng 70+) vẫn có đủ tướng như trước.
    const OWN_ON = BLANK_START;
    let heroOwned = loadJSON('hero_owned');   // { idTướng: 1 }
    (function () {
      if (!OWN_ON) return;
      let raw = null; try { raw = localStorage.getItem('hero_owned'); } catch (e) {}
      if (raw === null) Object.keys(heroProg).forEach(k => { heroOwned[k] = 1; });   // tài khoản đã reset trắng từ trước: tướng đã có tiến độ thì giữ lại
      saveJSON('hero_owned', heroOwned);
    })();
    const heroIsOwned = id => !OWN_ON || !!heroOwned[id];
    const ownedHeroes = () => HEROES.filter(h => heroIsOwned(h.id));
    let MERGE_COST = 10;   // đủ 10 mảnh ghép thành 1 tướng — admin chỉnh: recruit.mergeCost
    cfgOnApply(() => { MERGE_COST = Math.max(1, Math.floor(cfgNum('recruit.mergeCost', 10))); });
    // Ghép mảnh: tốn MERGE_COST mảnh của tướng `id` để có tướng đó (cấp 1 ★1). Trả về true nếu thành công.
    function heroGain(id) {
      if (!OWN_ON || heroOwned[id] || !heroById(id) || shardsOf(id) < MERGE_COST) return false;
      heroShards[id] = shardsOf(id) - MERGE_COST; saveJSON('hero_shards', heroShards);
      heroOwned[id] = 1; saveJSON('hero_owned', heroOwned);
      if (team.length < 5 && !team.includes(id)) {   // tướng mới tự vào đội nếu đội chưa đủ 5 (tài khoản mới có đội ngay)
        team.push(id); team.sort((a, b) => a - b);
        try { localStorage.setItem('team_ids', JSON.stringify(team)); } catch (e) {}
      }
      return true;
    }
    if (OWN_ON) team = team.filter(heroIsOwned);   // đội hình chỉ gồm tướng đã sở hữu (có thể trống với tài khoản mới)

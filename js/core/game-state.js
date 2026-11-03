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
    let gold = (() => { try { const v = parseInt(localStorage.getItem('gold_val')); return isNaN(v) ? 2291 : Math.max(0, v); } catch (e) { return 2291; } })();
    const updateGold = () => { ['gold-val', 'rc-gold'].forEach(i => { const el = document.getElementById(i); if (el) el.innerText = gold; }); };
    const goldSave = () => { try { localStorage.setItem('gold_val', String(gold)); } catch (e) {} updateGold(); };
    // BẠC 🥈 và GẠO 🌾: nhận khi thắng mỗi Bàn PVE, dùng để tăng cấp tướng. (VÀNG 🪙 ở trên: dùng Chiêu Mộ, nhận quà Hộp Thư mỗi ngày)
    const _numLS = (k, d) => { try { const v = parseFloat(localStorage.getItem(k)); return isNaN(v) ? d : Math.max(0, v); } catch (e) { return d; } };
    let silver = _numLS('silver_val', 21873054), rice = _numLS('rice_val', 2549836);
    // THẦN ĐAN 💎 và TIÊN ĐAN 🔮: thưởng khi thắng mỗi Bàn PVE (xem trong Túi Đồ)
    let thanDan = _numLS('thandan_val', 0), tienDan = _numLS('tiendan_val', 0);
    const updateRes = () => { [['silver-val', silver], ['rice-val', rice]].forEach(([i, v]) => { const el = document.getElementById(i); if (el) el.innerText = fmtN(v); }); };
    const resSave = () => { try { localStorage.setItem('silver_val', String(Math.floor(silver))); localStorage.setItem('rice_val', String(Math.floor(rice))); localStorage.setItem('thandan_val', String(Math.floor(thanDan))); localStorage.setItem('tiendan_val', String(Math.floor(tienDan))); } catch (e) {} updateRes(); };
    updateRes();
    let heroShards = loadJSON('hero_shards');   // mảnh tướng: { heroId: số mảnh }
    let recState = loadJSON('rec_state');       // thời điểm được quay miễn phí kế tiếp: { lam, tim, ten }
    const SHARD_PER_STAR = 10;                  // lên ★N cần N × 10 mảnh của chính tướng đó (★6 = 60 mảnh)
    const shardsOf = id => Math.max(0, heroShards[id] | 0);
    const starCost = star => star * SHARD_PER_STAR;   // chi phí để đạt ★star
    let heroProg = loadJSON('hero_prog');

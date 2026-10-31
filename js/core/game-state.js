/* TRẠNG THÁI CHUNG: tiện ích loadJSON/saveJSON/fmtN, vàng, mảnh tướng, bản gốc chỉ số
   (tách từ index.html cũ — script) */

    const fmtN = n => Math.round(n).toLocaleString('vi-VN');
    const heroById = id => HEROES.find(h => h.id === id);

    const HERO_DEFAULTS = {};
    HEROES.forEach(h => { HERO_DEFAULTS[h.id] = { hp:h.hp, atk:h.atk, def:h.def, dodge:h.dodge, acc:h.acc || 0, crit:h.crit || 0, critDmg:h.critDmg || 0, tough:h.tough || 0, pierce:h.pierce || 0, block:h.block || 0, spd:h.spd, startRage:h.startRage || 0 }; });
    const loadJSON = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
    const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    let statOv = loadJSON('hero_stat_ov');   // chỉnh sửa trong Cài đặt
    let gold = (() => { try { const v = parseInt(localStorage.getItem('gold_val')); return isNaN(v) ? 2291 : Math.max(0, v); } catch (e) { return 2291; } })();
    const updateGold = () => { ['gold-val', 'rc-gold'].forEach(i => { const el = document.getElementById(i); if (el) el.innerText = gold; }); };
    const goldSave = () => { try { localStorage.setItem('gold_val', String(gold)); } catch (e) {} updateGold(); };
    // BẠC 🥈 và GẠO 🌾: nhận khi thắng mỗi Bàn PVE, dùng để tăng cấp tướng. (VÀNG 🪙 ở trên: dùng Chiêu Mộ, nhận quà Hộp Thư mỗi ngày)
    const _numLS = (k, d) => { try { const v = parseFloat(localStorage.getItem(k)); return isNaN(v) ? d : Math.max(0, v); } catch (e) { return d; } };
    let silver = _numLS('silver_val', 21873054), rice = _numLS('rice_val', 2549836);
    const updateRes = () => { [['silver-val', silver], ['rice-val', rice]].forEach(([i, v]) => { const el = document.getElementById(i); if (el) el.innerText = fmtN(v); }); };
    const resSave = () => { try { localStorage.setItem('silver_val', String(Math.floor(silver))); localStorage.setItem('rice_val', String(Math.floor(rice))); } catch (e) {} updateRes(); };
    updateRes();
    let heroShards = loadJSON('hero_shards');   // mảnh tướng: { heroId: số mảnh }
    let recState = loadJSON('rec_state');       // thời điểm được quay miễn phí kế tiếp: { lam, tim, ten }
    const SHARD_PER_STAR = 10;                  // lên ★N cần N × 10 mảnh của chính tướng đó (★6 = 60 mảnh)
    const shardsOf = id => Math.max(0, heroShards[id] | 0);
    const starCost = star => star * SHARD_PER_STAR;   // chi phí để đạt ★star
    let heroProg = loadJSON('hero_prog');

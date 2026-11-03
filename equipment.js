/* TRANG BỊ: túi đồ, khung, cộng chỉ số
   (tách từ index.html cũ — script) */

    const eqType = k => EQUIP.find(e => e.k === k);
    // Túi đồ: mảng các món { id, k: loại, lv: cấp, f: số khung 0-4 đang gắn (-1 = nằm trong túi) }
    let eqBag = (() => {
      try {
        const a = JSON.parse(localStorage.getItem('eq_bag'));
        if (Array.isArray(a)) return a.filter(i => i && eqType(i.k)).map(i => ({
          id: Math.floor(i.id) || 0, k: i.k, lv: Math.min(EQUIP_MAX, Math.max(1, Math.floor(i.lv) || 1)),
          f: (Number.isInteger(i.f) && i.f >= 0 && i.f < FRAMES) ? i.f : -1 }));
      } catch (e) {}
      // Chuyển dữ liệu bản trước (mỗi loại 1 món) sang túi đồ
      const lv = loadJSON('eq_lv'), mt = loadJSON('eq_mount'), out = [];
      EQUIP.forEach(e => {
        const l = Math.floor(lv[e.k] || 0), m = mt[e.k];
        if (l > 0 || (m !== undefined && m !== null)) out.push({ id: out.length + 1, k: e.k, lv: Math.min(EQUIP_MAX, Math.max(1, l)), f: (m >= 0 && m < FRAMES) ? m : -1 });
      });
      return out;
    })();
    const frameOf = id => team.indexOf(id);      // khung hiện tại của tướng (-1 = không ra trận)
    const eqAt = (f, k) => f >= 0 ? eqBag.find(i => i.f === f && i.k === k) : undefined;   // món loại k đang gắn ở khung f
    function equipBonus(frame) {
      const b = { hp:0, atk:0, def:0, spd:0 };
      if (frame < 0) return b;
      eqBag.forEach(i => { if (i.f === frame) { const e = eqType(i.k); b[e.stat] += i.lv * e.per; } });
      return b;
    }

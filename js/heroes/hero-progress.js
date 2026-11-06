/* TƯỚNG: cấp / sao / hệ số tăng trưởng
   (tách từ index.html cũ — script) */

    // Cứ 10 cấp tướng được tăng thêm 1 sao (cấp 150 → tối đa ★15); thấp nhất vẫn là ★6 như cũ
    let STAR_ABS_MAX = 15;   // sao tối đa (admin chỉnh PROG_CFG.maxStar, ≤ 15)
    // Sao tối đa theo cấp tướng: cấp 20 → ★2, cấp 30 → ★3 ... (cấp 10 mỗi sao; admin chỉnh PROG_CFG.lvPerStar)
    const starCapOf = lv => Math.min(STAR_ABS_MAX, starCapByLv(lv));
    // CÁCH HIỂN THỊ SAO (dùng chung thẻ tướng, Tỷ Võ, Tăng Sao):
    //  ★1-5  : n sao thường (vàng)
    //  ★6-10 : sao LỚN = 2 sao → ★6 = 1 lớn + 4 nhỏ, ★7 = 2 lớn + 3 nhỏ … ★10 = 5 lớn
    //  ★11-15: luôn 5 sao lớn, đổi dần từ vàng sang ĐỎ → ★11 = 1 đỏ + 4 vàng, ★12 = 2 đỏ + 3 vàng … ★15 = 5 đỏ (tối đa)
    // opt.off: luôn hiện đủ 5 ô (sao chưa đạt mờ) • opt.bigPx: cỡ chữ sao lớn (mặc định 12)
    const heroStarsHTML = (n, opt) => {
      opt = opt || {}; n = Math.max(0, Math.min(STAR_ABS_MAX, n | 0));
      const big = n <= 5 ? 0 : Math.min(5, n - 5), red = n > 10 ? n - 10 : 0, px = opt.bigPx || 12;
      const one = (cls, bigStar) => '<i class="hs ' + cls + '"' + (bigStar ? ' style="font-size:' + px + 'px"' : '') + '>★</i>';
      let h = '';
      for (let k = 0; k < big; k++) h += one('b' + (k < red ? ' r' : ''), true);
      const sm = n <= 5 ? n : 5 - big;
      for (let k = 0; k < sm; k++) h += one('', false);
      if (opt.off && n < 5) for (let k = n; k < 5; k++) h += one('off', false);
      return h;
    };
    const homeStars = n => heroStarsHTML(n);
    const starStr = n => n <= STAR_MAX ? '★'.repeat(n) : '★×' + Math.min(n, STAR_ABS_MAX);
    function getProg(id) {
      const s = START_PROG[id] || { lv:1, star:1 }, p = heroProg[id] || {};
      const lv = Math.min(LV_MAX, Math.max(s.lv, p.lv || s.lv));
      return {
        lv,
        star: Math.min(starCapOf(lv), Math.max(s.star, p.star || s.star)),
        sk:   Math.min(SKILL_MAX, Math.max(1,     p.sk   || 1))
      };
    }
    function growth(id) {
      const s = START_PROG[id] || { lv:1, star:1 }, p = getProg(id);
      return (1 + LV_GROWTH * (p.lv - s.lv)) * (1 + STAR_GROWTH * (p.star - s.star));
    }
    const skillMult = id => 1 + SKILL_GROWTH * (getProg(id).sk - 1);

    // ---- CHI PHÍ LÊN CẤP TƯỚNG: cấp 2 = 100 bạc + 200 gạo; mỗi cấp sau đắt hơn cấp trước 10% (cấp 3 = cấp 2 + 10%, cấp 4 = cấp 3 + 10%, ...) ----
    let LV_COST_SILVER = 100, LV_COST_RICE = 200, LV_COST_GROWTH = 1.1;
    const lvCost = lv => { const m = Math.pow(LV_COST_GROWTH, Math.max(0, lv - 2)); return { silver: Math.round(LV_COST_SILVER * m), rice: Math.round(LV_COST_RICE * m) }; };   // chi phí để LÊN cấp `lv`
    const lvCostRange = (from, n) => { let s = 0, r = 0; for (let i = 1; i <= n; i++) { const c = lvCost(from + i); s += c.silver; r += c.rice; } return { silver: s, rice: r }; };
    // Với số bạc/gạo hiện có, lên được tối đa bao nhiêu cấp (không quá n)
    const lvAffordable = (from, n) => { let k = 0, s = silver, r = rice; while (k < n) { const c = lvCost(from + k + 1); if (s < c.silver || r < c.rice) break; s -= c.silver; r -= c.rice; k++; } return k; };

progCfgSync();   // áp thông số admin (sau khi các biến ở trên đã khai báo)

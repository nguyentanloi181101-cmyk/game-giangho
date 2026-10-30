/* TƯỚNG: cấp / sao / hệ số tăng trưởng
   (tách từ index.html cũ — script) */

    // Cứ 10 cấp tướng được tăng thêm 1 sao (cấp 150 → tối đa ★15); thấp nhất vẫn là ★6 như cũ
    const starCapOf = lv => Math.max(STAR_MAX, Math.floor(lv / 10));
    // Thẻ tướng ngoài trang chủ: tối đa 5 ô sao; từ 6 sao trở lên thì 1 sao lớn = 2 sao (6★ = 1 lớn + 4 nhỏ)
    const homeStars = n => { n = Math.max(0, Math.min(10, n | 0)); const b = Math.max(0, n - 5), sm = n - 2 * b;
      return '<span style="font-size:12px;letter-spacing:0">★</span>'.repeat(b) + '★'.repeat(sm); };
    const starStr = n => n <= STAR_MAX ? '★'.repeat(n) : '★×' + n;
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
    const LV_COST_SILVER = 100, LV_COST_RICE = 200, LV_COST_GROWTH = 1.1;
    const lvCost = lv => { const m = Math.pow(LV_COST_GROWTH, Math.max(0, lv - 2)); return { silver: Math.round(LV_COST_SILVER * m), rice: Math.round(LV_COST_RICE * m) }; };   // chi phí để LÊN cấp `lv`
    const lvCostRange = (from, n) => { let s = 0, r = 0; for (let i = 1; i <= n; i++) { const c = lvCost(from + i); s += c.silver; r += c.rice; } return { silver: s, rice: r }; };
    // Với số bạc/gạo hiện có, lên được tối đa bao nhiêu cấp (không quá n)
    const lvAffordable = (from, n) => { let k = 0, s = silver, r = rice; while (k < n) { const c = lvCost(from + k + 1); if (s < c.silver || r < c.rice) break; s -= c.silver; r -= c.rice; k++; } return k; };

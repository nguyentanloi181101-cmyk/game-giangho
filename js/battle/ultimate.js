/* TRẬN ĐẤU: điều phối tuyệt kỹ (ultimate) và hồi máu
   (tách từ index.html cũ — script) */

    // ★6: ulti 2 lần • ★11: ulti 3 lần • ★16: gộp 3 lần thành 1 lần ulti, sát thương ×3 (vd 300 × 3 lần = 900 → 1 lần đánh 900)
    function ultPlan(star) { return { casts: 1, mult: 1 }; }   // đã bỏ cơ chế ★6/★11/★16: mọi tướng chỉ ulti 1 lần
    function ultStarOf(u) {
      if (u.id === undefined || u.id === null) return 1;
      if (u.side === 'hero') return getProg(u.id).star;
      if (u.star) return u.star;   // đối thủ người thật: số sao thật của họ
      return pvp ? ((START_PROG[u.id] || {}).star || 5) : 1;   // địch trong ải thường không có sao
    }
    const QUICK_CHAIN = new Set([4, 7, 0]);   // Trương Tam Phong, Hỏa Long, Mã Đạo
    async function ultimate(u, tok) {
      const plan = ultPlan(ultStarOf(u));
      const sk0 = u.sk, z0 = u.el.style.zIndex;
      const chain = QUICK_CHAIN.has(u.id);   // tướng bay lên / nhảy qua đầu: giữ nguyên tư thế, chỉ đánh liên tiếp
      try {
        if (plan.mult !== 1) u.sk = (u.sk || 1) * plan.mult;     // ×3 hiệu lực/sát thương tuyệt kỹ
        for (let i = 0; i < plan.casts; i++) {
          if (tok !== battleToken || !u.alive) return;
          if (i > 0) { if (!foesOf(u).some(e => e.alive)) return; await sleep(chain ? 60 : 200); if (tok !== battleToken || !u.alive) return; }
          u.qRepeat = i > 0; u.qKeep = chain && i < plan.casts - 1; ultTimeScale = i > 0 ? 0.5 : 1;
          await ultimateOnce(u, tok);
        }
      } finally {
        u.sk = sk0; ultTimeScale = 1; u.qRepeat = false; u.qKeep = false;
        if (plan.casts > 1) { try { u.el.getAnimations().forEach(a => a.cancel()); } catch (e) {} u.el.style.zIndex = z0; }
      }
    }
    function ultimateOnce(u, tok) {
      if (!(u.qRepeat && u.id === 0)) playHeroSound(u.id);   // Mã Đạo: tiếng dài, lần lặp không phát lại để khỏi cắt tiếng
      if (u.id === 2) return moonUlt(u, tok);
      if (u.id === 10) return skullUlt(u, tok);
      if (u.id === 11) return goUlt(u, tok);
      if (u.id === 12) return lingBaUlt(u, tok);
      if (u.id === 0) return madaoUlt(u, tok);
      if (u.id === 4) return taichiUlt(u, tok);
      if (u.id === 3) return duCoUlt(u, tok);
      if (u.id === 1) return reviveUlt(u, tok);
      if (u.id === 6) return butterflyUlt(u, tok);
      if (u.id === 7) return dragonUlt(u, tok);
      if (u.id === 8) return waterUlt(u, tok);
      if (u.id === 9) return fireWebUlt(u, tok);
      if (u.id === 5) return lotusUlt(u, tok);
      if (u.id === 13) return bacCaiUlt(u, tok);
      if (u.id === 14) return dongTaUlt(u, tok);
      if (u.id === 15) return tayDocUlt(u, tok);
      if (u.id === 16) return namDeUlt(u, tok);
      if (u.id === 17) return vtdUlt(u, tok);
      return attack(u, foesOf(u), ULT_HITS, u.atk * ULT_MULT * (u.sk || 1), tok);
    }

    function heal(u, amt) {
      if (!u.alive) return;
      if (u.dn && u.dn.heal > 0) amt = Math.round(amt * (1 - BF_PCT));   // bướm Lục: giảm hồi máu 25%
      const before = u.hp;
      u.hp = Math.min(u.max, u.hp + amt);
      setHpBar(u);
      const d = document.createElement('div'); d.className = 'bf-dmg bf-heal'; d.textContent = '+' + formatNumber(Math.round(u.hp - before));
      u.el.appendChild(d); setTimeout(() => d.remove(), 800);
      const fx = document.createElement('div'); fx.className = 'bf-fx'; fx.textContent = '🌸';
      u.el.appendChild(fx); setTimeout(() => fx.remove(), 350);
      refreshPanel();
    }

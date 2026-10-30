/* ĐOÀN DỰ (id 12): tuyệt kỹ Lăng Ba Vi Bộ
   (tách từ index.html cũ — script) */

    // Đoàn Dự – Lăng Ba Vi Bộ: 18 tàn ảnh chạy rất nhanh từ đội ta sang đội địch; toàn đội 3 hiệp: +300% Né, +150% Tốc, hồi 300% Máu (của Đoàn Dự)
    function clearLB(u) {
      if (u.lbDodge) { u.dodge -= u.lbDodge; u.lbDodge = 0; }
      if (u.lbSpd) { u.spd -= u.lbSpd; u.lbSpd = 0; }
      u.lb = 0;
      const ic = u.el.querySelector('.bf-lb'); if (ic) ic.remove();
    }
    function tickLB(units) {
      units.forEach(u => {
        if (!(u.lb > 0)) return;
        u.lb--;
        if (!u.alive || u.lb <= 0) { clearLB(u); return; }
        if (u.lbHeal) heal(u, u.lbHeal);                       // mỗi hiệp còn lại hồi máu tiếp
        const b = u.el.querySelector('.bf-lb b'); if (b) b.textContent = '💨' + u.lb;
      });
    }
    async function lingBaUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)', made = [];
      const allies = alliesOf(u).filter(h => h.alive), foes = foesOf(u).filter(e => e.alive);
      const avg = (a, k) => a.reduce((s, x) => s + x[k], 0) / Math.max(1, a.length);
      const sx = avg(allies, 'x'), sy = avg(allies, 'y');
      const dir = foes.length ? (avg(foes, 'x') >= sx ? 1 : -1) : (u.side === 'hero' ? 1 : -1);
      const ex = foes.length ? avg(foes, 'x') + dir * 6 : sx + dir * 40, ey = foes.length ? avg(foes, 'y') : sy;
      // Chỉ số buff tính theo Đoàn Dự (lúc ulti)
      const dodgeB = (u.dodge - (u.lbDodge || 0)) * LB_DODGE_MULT, spdB = (u.spd - (u.lbSpd || 0)) * LB_SPD_MULT, healAmt = Math.round(u.max * LB_HEAL_MULT);
      try {
        u.el.animate([{ transform: base }, { transform: base + ' scale(1.25)' }, { transform: base }], { duration: 320 });
        await sleep(300); if (tok !== battleToken) return;
        // 18 tàn ảnh dồn dập: mỗi bóng cách nhau 45ms, bay rất nhanh (~320ms) từ đội ta sang đội địch
        const runs = [];
        for (let i = 0; i < LB_GHOSTS; i++) {
          runs.push((async () => {
            await sleep(i * 45); if (tok !== battleToken) return;
            const g = document.createElement('div'); g.className = 'bf-lbghost'; { const sp = u.el.querySelector('.bf-sprite'); g.innerHTML = '<div class="bf-sprite">' + (sp ? sp.innerHTML : (u.emoji || '')) + '</div>'; }
            const oy = (Math.random() - 0.5) * 26;
            g.style.left = sx + '%'; g.style.top = (sy + oy) + '%'; g.style.opacity = 0;
            box.appendChild(g); made.push(g);
            const dx = (ex - sx) * W / 100, dy = (ey - sy) * H / 100;
            const a = g.animate([
              { transform: base + ' scale(.9)', opacity: .0 },
              { transform: base + ' scale(1)', opacity: .85, offset: .15 },
              { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1.1)`, opacity: .0 }
            ], { duration: 340 + Math.random() * 80, easing: 'ease-in', fill: 'forwards' });
            await a.finished.catch(() => {});
            g.remove();
          })());
        }
        // Buff toàn đội ngay khi những tàn ảnh đầu tiên lướt qua
        await sleep(240); if (tok !== battleToken) return;
        allies.forEach((a, i) => setTimeout(() => {
          if (!a.alive) return;
          if (noBuff(a)) { floatText(a, '🚫 KHÓA TĂNG PHÚC'); return; }
          clearLB(a);                                         // không cộng dồn: làm mới 3 hiệp
          a.lb = LB_TURNS; a.lbDodge = dodgeB; a.lbSpd = spdB; a.lbHeal = healAmt;
          a.dodge += dodgeB; a.spd += spdB;
          const ic = document.createElement('div'); ic.className = 'bf-lb'; ic.innerHTML = '<b>💨' + a.lb + '</b>'; a.el.appendChild(ic);
          floatText(a, '💨 NÉ +' + fmtN(dodgeB) + '%');
          setTimeout(() => floatText(a, '⚡ TỐC +' + fmtN(spdB)), 220);
          heal(a, healAmt);                                   // hiệp 1 hồi ngay
        }, i * 90));
        await Promise.all(runs); if (tok !== battleToken) return;
        await sleep(400);
        refreshPanel();
      } finally {
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
      }
    }

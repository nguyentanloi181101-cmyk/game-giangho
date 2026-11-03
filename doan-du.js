/* ĐOÀN DỰ (id 12): tuyệt kỹ Lăng Ba Vi Bộ
   (tách từ index.html cũ — script) */

    // Đoàn Dự – Lăng Ba Vi Bộ: tung chiêu (SEQ.ddCast) rồi 18 tàn ảnh (SEQ.ddRun) chạy rất nhanh từ đội ta sang đội địch; toàn đội 3 hiệp: +300% Né, +150% Tốc, hồi 300% Máu (của Đoàn Dự)
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
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)', made = [], timers = [], oldZ = u.el.style.zIndex;
      const allies = alliesOf(u).filter(h => h.alive), foes = foesOf(u).filter(e => e.alive);
      const avg = (a, k) => a.reduce((s, x) => s + x[k], 0) / Math.max(1, a.length);
      const sx = avg(allies, 'x'), sy = avg(allies, 'y');
      const dir = foes.length ? (avg(foes, 'x') >= sx ? 1 : -1) : (u.side === 'hero' ? 1 : -1);
      const ex = foes.length ? avg(foes, 'x') + dir * 6 : sx + dir * 40, ey = foes.length ? avg(foes, 'y') : sy;
      // Chỉ số buff tính theo Đoàn Dự (lúc ulti)
      const dodgeB = (u.dodge - (u.lbDodge || 0)) * LB_DODGE_MULT, spdB = (u.spd - (u.lbSpd || 0)) * LB_SPD_MULT, healAmt = Math.round(u.max * LB_HEAL_MULT);
      const CAST_FR = 70, GW = 180, RUN_MS = 460;                                         // ms mỗi khung tung chiêu; rộng 1 tàn ảnh; thời gian 1 đạo chạy
      const castW = Math.round(128 / SEQ.ddIdle.ch * SEQ.ddCast.cw);                      // cùng tỉ lệ người với dáng đứng (h = 128)
      const cast = seqOverlay(u, SEQ.ddCast, castW);
      const at = (ms, fn) => timers.push(setTimeout(() => { if (tok === battleToken) fn(); }, seqT(ms)));
      try {
        u.el.style.zIndex = 95;
        // 1. Đứng tại chỗ vung kiếm, nước xoáy quanh người (16 khung)
        for (let i = 0; i < SEQ.ddCast.n; i++) at(i * CAST_FR, () => cast.show(i));
        at(SEQ.ddCast.n * CAST_FR, () => cast.end());
        await sleep(560); if (tok !== battleToken) return;
        // 2. 18 đạo tàn ảnh (chuỗi SEQ.ddRun, 17 khung) dồn dập chạy từ đội ta sang đội địch; mỗi bóng cách nhau 45ms
        const GH = Math.round(GW * SEQ.ddRun.ch / SEQ.ddRun.cw);
        const runs = [];
        for (let i = 0; i < LB_GHOSTS; i++) {
          runs.push((async () => {
            await sleep(i * 45); if (tok !== battleToken) return;
            const g = document.createElement('div'); g.className = 'bf-lbghost'; g.style.width = GW + 'px'; g.style.height = GH + 'px';
            const sc = seqEl(SEQ.ddRun, GW); if (dir < 0) sc.style.transform = 'scaleX(-1)';   // ảnh gốc nhìn sang phải; địch ulti thì lật lại
            sc.style.setProperty('--end', (-GW * (SEQ.ddRun.n - 1)) + 'px');
            sc.style.animation = 'seqRun ' + RUN_MS + 'ms steps(' + (SEQ.ddRun.n - 1) + ') forwards';
            g.appendChild(sc);
            const oy = (Math.random() - 0.5) * 26;
            g.style.left = sx + '%'; g.style.top = (sy + oy) + '%'; g.style.opacity = 0;
            box.appendChild(g); made.push(g);
            const dx = (ex - sx) * W / 100, dy = (ey - sy) * H / 100;
            const a = g.animate([
              { transform: base + ' scale(.9)', opacity: .0 },
              { transform: base + ' scale(1)', opacity: .9, offset: .15 },
              { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1.05)`, opacity: .0 }
            ], { duration: RUN_MS + Math.random() * 80, easing: 'ease-in', fill: 'forwards' });
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
        timers.forEach(clearTimeout); cast.end();
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
        u.el.style.zIndex = oldZ;
      }
    }

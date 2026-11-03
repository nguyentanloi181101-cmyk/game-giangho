/* TIỂU YÊU (id 10): tuyệt kỹ đầu lâu lửa */

    // Tiểu Yêu: đứng TẠI CHỖ dang tay tung chiêu (chuỗi SEQ.tyCast, 20 khung) -> trên đầu MỖI địch còn sống hiện 1 đầu lâu lửa
    // (chuỗi SEQ.tySkull, 20 khung) phun lửa xuống. Đòn trúng ở khung lửa mạnh nhất: mỗi địch mất 50% HP HIỆN TẠI
    // (bỏ qua giáp, khiên, bất tử – chỉ Né mới tránh được). Địch sau đòn còn ≤ 10% HP tối đa -> TẤT SÁT, chết ngay. Bản thân không mất máu.
    async function tieuYeuUlt(u, tok) {
      const box = document.getElementById('bf-units');
      const foes = foesOf(u).filter(e => e.alive);
      if (!foes.length) return;
      const dir = foes.reduce((s, e) => s + e.x, 0) / foes.length >= u.x ? 1 : -1;     // địch bên phải: lửa tuôn sang phải; địch bên trái: lật ngược
      const CAST_FR = 75, SKULL_FR = 55, HIT_FRAME = 12;                                  // ms mỗi khung; khung lửa phun mạnh nhất
      const made = [], timers = [], oldZ = u.el.style.zIndex;
      const castW = Math.round(124 * SEQ.tyCast.cw / SEQ.tyCast.ch);                     // cùng cỡ với dáng đứng (h = 124)
      const cast = seqOverlay(u, SEQ.tyCast, castW);
      const at = (ms, fn) => timers.push(setTimeout(() => { if (tok === battleToken) fn(); }, seqT(ms)));
      try {
        u.el.style.zIndex = 95;
        // 1. Dang tay tung chiêu (20 khung)
        for (let i = 0; i < SEQ.tyCast.n; i++) at(i * CAST_FR, () => cast.show(i));
        at(SEQ.tyCast.n * CAST_FR, () => cast.end());                                       // xong 20 khung thì trả dáng đứng
        await sleep(600); if (tok !== battleToken) return;
        // 2. Đầu lâu lửa phun xuống TOÀN BỘ địch, lần lượt cách nhau ~70ms
        const SW = 175, SH = Math.round(SW * SEQ.tySkull.ch / SEQ.tySkull.cw);
        const strikes = foes.map(async (t, k) => {
          await sleep(k * 70); if (tok !== battleToken) return;
          const el = document.createElement('div'); el.className = 'bf-ty-skull';
          el.style.cssText = `left:${t.x}%;top:calc(${t.y}% + 26px);width:${SW}px;height:${SH}px;transform:translate(-62%,-72%)${dir < 0 ? ' scaleX(-1)' : ''}`;
          const sc = seqEl(SEQ.tySkull, SW); el.appendChild(sc); box.appendChild(el); made.push(el);
          for (let i = 0; i < SEQ.tySkull.n; i++) setTimeout(() => { if (tok === battleToken) sc.show(i); }, seqT(i * SKULL_FR));
          await sleep(HIT_FRAME * SKULL_FR); if (tok !== battleToken) return;
          if (t.alive) {                                                                    // chỉ NÉ mới tránh được
            if (Math.random() * 100 < dodgeChance(t, u)) floatText(t, 'NÉ');
            else {
              floatText(t, '💀 -' + Math.round(SKEL_PCT * 100) + '% HP');
              hit(t, Math.max(1, Math.round(t.hp * SKEL_PCT)), true, u, true);
              if (t.alive && t.hp <= t.max * EXEC_PCT) {                                    // TẤT SÁT: còn ≤10% HP tối đa -> kết liễu
                await sleep(260); if (tok !== battleToken) return;
                if (t.alive) {
                  floatText(t, '☠️ TẤT SÁT');
                  if (t.dn) t.dn.immortal = 0;                                              // kết liễu bỏ qua cả bất tử
                  hit(t, t.hp, true, u, true);
                }
              }
            }
          }
          await sleep((SEQ.tySkull.n - HIT_FRAME) * SKULL_FR); if (tok !== battleToken) return;
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
        });
        await Promise.all(strikes); if (tok !== battleToken) return;
        await sleep(250);
      } finally {
        timers.forEach(clearTimeout); cast.end();
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
        u.el.style.zIndex = oldZ;
      }
    }

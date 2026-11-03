/* ĐÔNG PHƯƠNG CÔ NƯƠNG (id 9): tuyệt kỹ phân thân + lốc lửa
   Toàn bộ hình ảnh là chuỗi khung (SEQ.dpIdle / dpCast / dpClone / dpFire trong js/heroes/hero-seq.js).
   Đã xóa mạng lửa 3D bằng canvas và ngọn lửa/đốm lửa trên đầu cũ. */

    // Đứng TẠI CHỖ tung chiêu (SEQ.dpCast, 16 khung) -> PHÂN THÂN (SEQ.dpClone, 18 khung) lao sang đội địch
    // -> phân thân tới nơi, lốc lửa (SEQ.dpFire, 20 khung) bùng lên trên MỖI địch.
    // Cơ chế sát thương như cũ: mỗi địch chịu HTT_FLAT + Công bản thân (chuẩn, bỏ qua giáp) và mất thêm 50% HP hiện tại.
    async function fireWebUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)';
      const es0 = foesOf(u).filter(e => e.alive); if (!es0.length) return;
      const avg = (a, k) => a.reduce((s, x) => s + x[k], 0) / a.length;
      const tx = avg(es0, 'x'), ty = avg(es0, 'y');
      const dir = tx >= u.x ? 1 : -1;                                  // ảnh phân thân nhìn sang phải; địch ulti thì lật lại
      const PX = 138 / SEQ.dpIdle.ch;                                  // px mỗi px ảnh: cùng cỡ dáng đứng (h = 138)
      const CAST_FR = 70, CLONE_FR = 62, FIRE_FR = 55, HIT_FRAME = 8;
      const made = [], timers = [], oldZ = u.el.style.zIndex;
      const cast = seqOverlay(u, SEQ.dpCast, Math.round(SEQ.dpCast.cw * PX));
      const at = (ms, fn) => timers.push(setTimeout(() => { if (tok === battleToken) fn(); }, seqT(ms)));
      const add = (cls, x, y) => { const d = document.createElement('div'); d.className = cls; d.style.left = x + '%'; d.style.top = y + '%'; box.appendChild(d); made.push(d); return d; };
      try {
        u.el.style.zIndex = 95;
        // 1. Tung chiêu tại chỗ (16 khung)
        for (let i = 0; i < SEQ.dpCast.n; i++) at(i * CAST_FR, () => cast.show(i));
        at(SEQ.dpCast.n * CAST_FR, () => cast.end());
        await sleep(6 * CAST_FR); if (tok !== battleToken) return;
        // 2. Phân thân lao sang giữa đội địch trong ~11 khung đầu, 7 khung cuối tung đòn tại chỗ
        const CW = Math.round(SEQ.dpClone.cw * PX), CH = Math.round(SEQ.dpClone.ch * PX);
        const clone = add('bf-dp-clone', u.x, u.y);
        clone.style.width = CW + 'px'; clone.style.height = CH + 'px';
        const cs = seqEl(SEQ.dpClone, CW); if (dir < 0) cs.style.transform = 'scaleX(-1)'; clone.appendChild(cs);
        for (let i = 0; i < SEQ.dpClone.n; i++) setTimeout(() => { if (tok === battleToken) cs.show(i); }, seqT(i * CLONE_FR));
        const dx = (tx - u.x) * W / 100 - dir * 20, dy = (ty - u.y) * H / 100;
        clone.animate([{ transform: base + ' scale(.9)', opacity: .2 }, { transform: base + ' scale(1)', opacity: 1, offset: .12 },
          { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1)`, opacity: 1, offset: .62 },
          { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1)`, opacity: 1, offset: .92 },
          { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1)`, opacity: 0 }],
          { duration: SEQ.dpClone.n * CLONE_FR, easing: 'ease-in-out', fill: 'forwards' });
        await sleep(Math.round(SEQ.dpClone.n * CLONE_FR * .55)); if (tok !== battleToken) return;
        // 3. Phân thân tới nơi: lốc lửa bùng lên trên MỖI địch
        const FW = 190, FH = Math.round(FW * SEQ.dpFire.ch / SEQ.dpFire.cw);
        f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 400);
        const flat = HTT_FLAT * (u.sk || 1) + u.atk;
        const strikes = es0.map(async (e, k) => {
          await sleep(k * 60); if (tok !== battleToken) return;
          const el = add('bf-seq-fx', e.x, e.y); el.style.top = `calc(${e.y}% + 34px)`; el.style.width = FW + 'px'; el.style.height = FH + 'px'; el.style.transform = 'translate(-50%,-80%)';
          const fs = seqEl(SEQ.dpFire, FW); el.appendChild(fs);
          for (let i = 0; i < SEQ.dpFire.n; i++) setTimeout(() => { if (tok === battleToken) fs.show(i); }, seqT(i * FIRE_FR));
          await sleep(HIT_FRAME * FIRE_FR); if (tok !== battleToken) return;
          if (e.alive) {                                             // sát thương chuẩn + 50% HP hiện tại (như cũ)
            for (let r = 0, n = tiaOf(u); r < n && e.alive; r++) hit(e, flat + Math.round(e.hp * HTT_HP_PCT), false, undefined, false, undefined, { i: r, wait: rayWait(r) });   // mỗi tia 1 lần
            const w = add('bf-wave', e.x, e.y);
            w.style.borderColor = '#fb923c'; w.style.boxShadow = '0 0 24px #ef4444, inset 0 0 24px #f97316';
            setTimeout(() => w.remove(), 650);
          }
          await sleep((SEQ.dpFire.n - HIT_FRAME) * FIRE_FR); if (tok !== battleToken) return;
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' });
        });
        await Promise.all(strikes); if (tok !== battleToken) return;
        await sleep(250);
      } finally {
        timers.forEach(clearTimeout); cast.end();
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(a => a.cancel());
        u.el.style.zIndex = oldZ;
      }
    }

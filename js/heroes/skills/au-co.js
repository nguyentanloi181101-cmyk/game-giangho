/* ÂU CƠ (id 5): tuyệt kỹ hoa sen
   (tách từ index.html cũ — script) */

    // Âu Cơ: nâng hoa sen 3D nở rộ (ảnh hoa sen xếp nhiều lớp theo chiều sâu, xoay có khối), hồi máu toàn đội = 150% × (công + thủ) của bản thân
    async function lotusUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight;
      const base = 'translate(-50%,-50%)', made = [], timers = [];
      const amount = Math.round(HEAL_MULT * (u.sk || 1) * (u.atk + u.def));
      const ly = Math.max(14, u.y - 14);                       // vị trí hoa sen (hơi nhô lên trên đầu tướng)
      // Hoa sen hồng: chuỗi 16 khung (SEQ.acCast) — nụ → nở → rụng cánh
      const LW = Math.round(Math.max(170, Math.min(W * 0.4, 260)));
      const root = document.createElement('div'); root.className = 'bf-seq-fx'; root.style.left = u.x + '%'; root.style.top = ly + '%';
      root.style.width = LW + 'px'; root.style.height = Math.round(LW * SEQ.acCast.ch / SEQ.acCast.cw) + 'px';
      const sc = seqEl(SEQ.acCast, LW); root.appendChild(sc); box.appendChild(root);
      try {
        u.el.animate([{ transform: base }, { transform: 'translate(-50%,calc(-50% - 14px))' }, { transform: base }], { duration: 700 });
        root.animate([{ transform: base + ' scale(.3)', opacity: 0 }, { transform: base + ' scale(1)', opacity: 1 }], { duration: 400, easing: 'ease-out', fill: 'forwards' });
        for (let i = 0; i < 16; i++) timers.push(setTimeout(() => { if (tok === battleToken) sc.show(i); }, seqT(i * 110)));
        await sleep(1100); if (tok !== battleToken) return;       // hoa nở rộ
        const burst = n => {                                     // hạt sáng hồng bùng lên trời
          for (let k = 0; k < n; k++) {
            const d = document.createElement('div'); d.className = 'l3-spark';
            const sz = 3 + Math.random() * 5; d.style.width = d.style.height = sz + 'px';
            d.style.left = (u.x + (Math.random() - .5) * 6) + '%'; d.style.top = ly + '%';
            box.appendChild(d); made.push(d);
            const dx = (Math.random() - .5) * 90, dy = 60 + Math.random() * H * 0.45;
            d.animate([{ transform: base + ' scale(.2)', opacity: 0 }, { transform: 'translate(calc(-50% + ' + (dx * .4) + 'px),calc(-50% - ' + (dy * .3) + 'px)) scale(1)', opacity: 1, offset: .25 },
              { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% - ' + dy + 'px)) scale(.2)', opacity: 0 }],
              { duration: 900 + Math.random() * 900, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => d.remove(), 1900);
          }
        };
        burst(50);
        await sleep(660); if (tok !== battleToken) return;       // cánh rụng
        // 3. Hoa sen nở bung, cánh hoa bay về từng đồng đội rồi hồi máu
        root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, fill: 'forwards' });
        const allies = alliesOf(u).filter(h => h.alive);
        allies.forEach((h, i) => {
          const o = document.createElement('div'); o.className = 'bf-fxorb'; o.textContent = '🌸';
          o.style.left = u.x + '%'; o.style.top = ly + '%'; o.style.filter = 'drop-shadow(0 0 8px #f0abfc)';
          box.appendChild(o); made.push(o);
          o.animate([{ transform: base + ' scale(1.3)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + ((h.x - u.x) * W / 100) + 'px),calc(-50% + ' + ((h.y - ly) * H / 100) + 'px)) scale(.9)', opacity: 1 }], { duration: 480, delay: i * 50, easing: 'ease-in', fill: 'forwards' });
        });
        await sleep(480 + allies.length * 50); if (tok !== battleToken) return;
        made.forEach(d => d.remove());
        allies.forEach(h => { if (h.alive) heal(h, amount); });
        await sleep(300);
      } finally {
        timers.forEach(clearTimeout); root.remove(); made.forEach(d => d.remove());
        u.el.getAnimations().forEach(a => a.cancel());
      }
    }

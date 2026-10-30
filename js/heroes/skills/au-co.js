/* ÂU CƠ (id 5): tuyệt kỹ hoa sen
   (tách từ index.html cũ — script) */

    // Âu Cơ: nâng hoa sen 3D nở rộ (ảnh hoa sen xếp nhiều lớp theo chiều sâu, xoay có khối), hồi máu toàn đội = 150% × (công + thủ) của bản thân
    async function lotusUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight;
      const base = 'translate(-50%,-50%)', tilt = 'rotateX(10deg)', made = [];
      const amount = Math.round(HEAL_MULT * (u.sk || 1) * (u.atk + u.def));
      const ly = Math.max(14, u.y - 14);                       // vị trí hoa sen (hơi nhô lên trên đầu tướng)
      const root = document.createElement('div'); root.className = 'bf-lotus3d';
      root.style.left = u.x + '%'; root.style.top = ly + '%';
      root.innerHTML = '<div class="l3-glow"></div><div class="l3-water"><i></i><i></i><i></i></div>';
      const stage = document.createElement('div'); stage.className = 'l3-stage';
      stage.style.transform = tilt.replace('10deg', '-52deg');                 // nhìn hoa từ trên xuống
      const spin = document.createElement('div'); spin.className = 'l3-spin'; stage.appendChild(spin);
      const pivots = [];
      const ring = (count, offset, w, len, cls) => {                           // 12 cánh ngoài + 8 cánh trong như Unity
        for (let k = 0; k < count; k++) {
          const ang = k * 360 / count + offset * 17;
          const pv = document.createElement('div'); pv.className = 'l3-pv';
          pv.style.transform = 'rotateY(' + ang + 'deg) rotateX(-8deg)';       // cánh dựng đứng (khép)
          const pt = document.createElement('div'); pt.className = 'l3-petal ' + cls;
          pt.style.width = w + 'px'; pt.style.height = len + 'px'; pt.style.left = (-w / 2) + 'px'; pt.style.top = (-len) + 'px';
          pv.appendChild(pt); spin.appendChild(pv);
          pivots.push({ pv, ang, idx: k + offset });
        }
      };
      ring(12, 0, 30, 58, 'out'); ring(8, 12, 22, 40, 'in');
      const core = document.createElement('div'); core.className = 'l3-core'; stage.appendChild(core);
      root.appendChild(stage); box.appendChild(root);
      try {
        u.el.animate([{ transform: base }, { transform: 'translate(-50%,calc(-50% - 14px))' }, { transform: base }], { duration: 700 });
        // 1. Hoa sen nở: từ nhỏ -> to, vừa xoay 3D vừa hiện ra
        root.animate([{ transform: base + ' scale(.1)', opacity: 0 }, { transform: base + ' scale(1)', opacity: 1 }], { duration: 600, easing: 'ease-out', fill: 'forwards' });
        // từng cánh lần lượt mở ra (SmoothStep), hoa xoay chậm
        pivots.forEach(o => o.pv.animate(
          [{ transform: 'rotateY(' + o.ang + 'deg) rotateX(-8deg)' }, { transform: 'rotateY(' + o.ang + 'deg) rotateX(-84deg)' }],
          { duration: 900, delay: o.idx * 38, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'both' }));
        spin.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(360deg)' }], { duration: 3600, iterations: Infinity });
        core.animate([{ transform: 'scale(.5)', opacity: .6 }, { transform: 'scale(1.5)', opacity: 1 }], { duration: 700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
        await sleep(1700); if (tok !== battleToken) return;
        // 2. Xoay trọn 1 vòng, bồng bềnh trên mặt nước
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
        burst(70); setTimeout(() => burst(24), 250);
        root.animate([{ transform: base }, { transform: 'translate(-50%,calc(-50% - 10px))' }, { transform: base }], { duration: 700, easing: 'ease-in-out' });
        await sleep(720); if (tok !== battleToken) return;
        // 3. Hoa sen nở bung, cánh hoa bay về từng đồng đội rồi hồi máu
        root.animate([{ transform: base + ' scale(1)', opacity: 1 }, { transform: base + ' scale(2.6)', opacity: 0 }], { duration: 480, easing: 'ease-in', fill: 'forwards' });
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
        root.remove(); made.forEach(d => d.remove());
        u.el.getAnimations().forEach(a => a.cancel());
      }
    }

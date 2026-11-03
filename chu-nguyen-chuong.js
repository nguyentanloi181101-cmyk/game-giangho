/* CHU NGUYÊN CHƯƠNG (id 2): tuyệt kỹ khiên mặt trăng
   (tách từ index.html cũ — script) */

    // Chu Nguyên Chương: trăng khuyết chiếu sáng, hạt sáng rơi xuống; giải hiệu ứng xấu + khiên phản 50% / nhận 30% trong 2 hiệp
    async function moonUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)', made = [];
      const allies = alliesOf(u).filter(h => h.alive);
      const cx = allies.reduce((a, h) => a + h.x, 0) / allies.length;
      const bw = Math.min(W * 0.66, W), bx = Math.max(0, Math.min(W - bw, cx * W / 100 - bw / 2));
      try {
        u.el.animate([{ transform: base }, { transform: 'translate(-50%,calc(-50% - 16px))' }, { transform: base }], { duration: 600 });
        const moon = document.createElement('div'); moon.className = 'bf-moon'; moon.textContent = '🌙';
        moon.style.left = cx + '%'; moon.style.top = '13%'; box.appendChild(moon); made.push(moon);
        await sleep(350); if (tok !== battleToken) return;
        const beam = document.createElement('div'); beam.className = 'bf-moonbeam';
        beam.style.left = bx + 'px'; beam.style.width = bw + 'px'; beam.style.height = (H * 0.92) + 'px';
        box.appendChild(beam); made.push(beam);
        for (let i = 0; i < 34; i++) {                      // hạt ánh sáng lấp lánh rơi xuống
          const sp = document.createElement('div'); sp.className = 'bf-spark'; sp.textContent = rand(['✨', '✦', '✧', '⭐']);
          sp.style.left = (bx + bw * (0.15 + Math.random() * 0.7)) + 'px'; sp.style.top = (H * (0.1 + Math.random() * 0.12)) + 'px';
          sp.style.fontSize = (10 + Math.random() * 12) + 'px';
          sp.style.setProperty('--d', (0.9 + Math.random() * 0.7) + 's'); sp.style.setProperty('--dl', (Math.random() * 1.0) + 's');
          sp.style.setProperty('--h', (H * (0.4 + Math.random() * 0.4)) + 'px');
          box.appendChild(sp); made.push(sp);
        }
        await sleep(450); if (tok !== battleToken) return;
        cleanse(allies);                                     // giải hết hiệu ứng bất lợi
        allies.forEach((a, i) => setTimeout(() => { if (!a.alive) return; applyMoon(a); floatText(a, '🌙 KHIÊN PHẢN 50%'); }, i * 120));
        await sleep(1300); if (tok !== battleToken) return;
      } finally {
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
      }
    }

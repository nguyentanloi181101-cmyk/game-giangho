/* KIỀU PHONG (id 7): tuyệt kỹ rồng
   (tách từ index.html cũ — script) */

    // Kiều Phong: nhảy qua địch -> 2 hỏa long quấn chéo 2 vòng, 3 tầng sát thương -> chảy máu
    async function dragonUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight;
      const alive = () => foesOf(u).filter(e => e.alive);
      const base = 'translate(-50%,-50%)';
      const es0 = alive(); if (!es0.length) return;
      const cx = es0.reduce((a, e) => a + e.x, 0) / es0.length, cy = es0.reduce((a, e) => a + e.y, 0) / es0.length;
      const landX = u.side === 'hero' ? Math.min(94, Math.max(...es0.map(e => e.x)) + 9) : Math.max(6, Math.min(...es0.map(e => e.x)) - 9), landY = cy;
      const dx = (landX - u.x) * W / 100, dy = (landY - u.y) * H / 100;
      const mid = `translate(calc(-50% + ${dx / 2}px),calc(-50% + ${dy / 2 - 150}px))`, land = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      const made = [], oldZ = u.el.style.zIndex, quick = !!u.qRepeat, keep = !!u.qKeep;   // quick: đã đứng sẵn sau lưng địch -> không nhảy lại
      const mk = (cls, txt) => { const d = document.createElement('div'); d.className = cls; d.textContent = txt; box.appendChild(d); made.push(d); return d; };
      try {
        // 1. Nhảy qua đầu địch
        u.el.style.zIndex = 99;
        if (!quick) {
          u.el.animate([{ transform: base }, { transform: mid, offset: .5 }, { transform: land }], { duration: 650, easing: 'ease-in-out', fill: 'forwards' });
          await sleep(680); if (tok !== battleToken) return;
        }
        // 2. Hai hỏa long quấn chéo nhau 2 vòng (xoắn đôi), mỗi 1/3 hành trình là 1 tầng sát thương
        const dA = mk('bf-dragon', '🐉'), dB = mk('bf-dragon', '🐉');
        const yT = Math.max(12, cy - 24), yB = Math.min(88, cy + 10), R = Math.min(70, W * 0.16);
        const total = u.atk * DRAGON_MULT * (u.sk || 1), per = total / DRAGON_TIERS;
        let tier = 0, lastEmber = 0;
        const doTier = () => {
          tier++;
          alive().forEach(e => skillHit(e, per));
          const w = document.createElement('div'); w.className = 'bf-wave'; w.style.left = cx + '%'; w.style.top = cy + '%';
          w.style.borderColor = '#fb923c'; w.style.boxShadow = '0 0 24px #ef4444, inset 0 0 24px #f97316';
          box.appendChild(w); setTimeout(() => w.remove(), 650);
          f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 250);
        };
        const t0 = performance.now(), DUR = 1500;
        await new Promise(res => {
          const step = now => {
            const k = Math.min(1, (now - t0) / DUR);
            if (tok !== battleToken) return res();
            const th = k * Math.PI * 4;                       // 2 vòng
            [[dA, 0], [dB, Math.PI]].forEach(([d, ph]) => {
              const a = th + ph, px = Math.sin(a) * R, top = yT + (yB - yT) * k;
              d.style.left = cx + '%'; d.style.top = top + '%';
              d.style.transform = `translate(calc(-50% + ${px}px),-50%) scaleX(${Math.cos(a) >= 0 ? 1 : -1}) scale(${1 + Math.cos(a) * 0.25})`;
              d.style.zIndex = Math.cos(a) >= 0 ? 93 : 60;
              if (now - lastEmber > 70) {
                const e = document.createElement('div'); e.className = 'bf-ember'; e.textContent = '🔥';
                e.style.left = cx + '%'; e.style.top = top + '%'; e.style.marginLeft = px + 'px'; box.appendChild(e); setTimeout(() => e.remove(), 450);
              }
            });
            if (now - lastEmber > 70) lastEmber = now;
            while (tier < DRAGON_TIERS && k >= (tier + 1) / DRAGON_TIERS - 0.001) doTier();
            if (k >= 1) return res();
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        if (tok !== battleToken) return;
        while (tier < DRAGON_TIERS) doTier();
        // 3. Chảy máu 3 hiệp
        alive().forEach(e => {
          e.bleed = BLEED_TURNS;
          if (!e.el.querySelector('.bf-bleed')) { const ic = document.createElement('div'); ic.className = 'bf-bleed'; ic.textContent = '🩸'; e.el.appendChild(ic); }
          floatText(e, 'CHẢY MÁU');
        });
        made.forEach(d => d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
        await sleep(keep ? 100 : 350); if (tok !== battleToken) return;
        if (!keep) {
          // 4. Nhảy về chỗ cũ
          u.el.animate([{ transform: land }, { transform: mid, offset: .5 }, { transform: base }], { duration: 550, easing: 'ease-in-out', fill: 'forwards' });
          await sleep(580);
        }
      } finally {
        made.forEach(d => d.remove());
        if (!keep) { u.el.getAnimations().forEach(a => a.cancel()); u.el.style.zIndex = oldZ; }
      }
    }

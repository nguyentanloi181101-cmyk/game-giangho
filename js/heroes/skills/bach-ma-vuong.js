/* BẠCH MA VƯƠNG (id 10): tuyệt kỹ bộ xương
   (tách từ index.html cũ — script) */

    // Bạch Ma Vương: triệu hồi 3 bộ xương khô lao tới 3 địch; mỗi địch mất 50% HP hiện tại; bỏ qua mọi thứ trừ Né; bản thân không mất máu
    // Mốc thời gian canh theo file âm thanh (ms từ lúc bắt đầu tiếng): 0.5s tiếng triệu hồi mạnh nhất -> xương trồi lên; 0.9–1.3s xương đập trúng
    async function skullUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)', made = [];
      const foes = foesOf(u).filter(e => e.alive).sort(() => Math.random() - 0.5).slice(0, SKEL_COUNT);
      if (!foes.length) return;
      const t0 = performance.now(), at = ms => sleep(Math.max(0, t0 + ms - performance.now()));
      const ring = (x, y) => {
        const w = document.createElement('div'); w.className = 'bf-wave'; w.style.left = x + '%'; w.style.top = y + '%';
        w.style.borderColor = '#a855f7'; w.style.boxShadow = '0 0 24px #7e22ce, inset 0 0 24px #a855f7';
        box.appendChild(w); setTimeout(() => w.remove(), 650);
      };
      const dir = foes[0].x >= u.x ? 1 : -1;
      try {
        u.el.animate([{ transform: base }, { transform: 'translate(-50%,calc(-50% - 16px))' }, { transform: base }], { duration: 600 });
        await at(150); if (tok !== battleToken) return;
        ring(u.x, u.y);
        await at(470); if (tok !== battleToken) return;
        const skels = foes.map((t, i) => {            // 3 bộ xương trồi lên cạnh Bạch Ma Vương
          const el = document.createElement('div'); el.className = 'bf-skel';
          { let fl = ''; for (let k = 0; k < 14; k++) fl += `<i style="--a:${k * 360 / 14}deg;--dl:${(-Math.random() * .4).toFixed(2)}s;${k % 2 ? 'height:26px;top:-26px;' : ''}"></i>`;
            el.innerHTML = `<div class="sk-glow"></div><div class="sk-fire">${fl}</div><img class="sk-img" src="${SKULL_IMG}">`; }
          const sx = u.x + dir * 8, sy = Math.max(12, Math.min(88, u.y + (i - (foes.length - 1) / 2) * 16));
          el.style.left = sx + '%'; el.style.top = sy + '%'; box.appendChild(el); made.push(el); ring(sx, sy);
          el.animate([{ transform: base + ' scale(.2)', opacity: 0 }, { transform: base + ' scale(1.2)', opacity: 1 }, { transform: base + ' scale(1)', opacity: 1 }], { duration: 250, fill: 'forwards' });
          return { el, sx, sy };
        });
        await at(640); if (tok !== battleToken) return;
        await Promise.all(foes.map(async (t, i) => {
          await at(640 + i * 160); if (tok !== battleToken) return;
          const { el, sx, sy } = skels[i];
          let dx = (t.x - sx) * W / 100, dy = (t.y - sy) * H / 100; dx -= Math.sign(dx || dir) * 40;
          const go = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
          el.animate([{ transform: base }, { transform: go }], { duration: 260, easing: 'ease-in', fill: 'forwards' });
          await at(640 + i * 160 + 265); if (tok !== battleToken) return;
          el.animate([{ transform: go + ' scale(1)' }, { transform: go + ' scale(1.5)' }, { transform: go + ' scale(1)' }], { duration: 200, fill: 'forwards' });
          if (t.alive) {                               // chỉ NÉ mới tránh được; còn lại bỏ qua giáp, khiên, bất tử
            if (Math.random() * 100 < dodgeChance(t, u)) floatText(t, 'NÉ');
            else { floatText(t, '💀 -50% HP'); hit(t, Math.max(1, Math.round(t.hp * SKEL_PCT)), true, u, true); }
          }
          await sleep(240);
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
        }));
        await sleep(300);
      } finally {
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
      }
    }

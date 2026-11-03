/* LẠC LONG QUÂN (id 8): tuyệt kỹ nước
   (tách từ index.html cũ — script) */

    // Tướng thủ (taunt) bị địch đánh trước; chỉ khi nó chết mới đánh tướng khác
    // Thứ tự: tướng THỦ trước → khi thủ chết thì TRỊ LIỆU (ưu tiên thứ 2) → rồi mới tới tướng còn lại
    function pickTarget(foes) {
      const a = foes.filter(x => x.alive), tk = a.filter(x => x.taunt);
      if (tk.length) return rand(tk);
      const sp = a.filter(x => x.prio2);
      return rand(sp.length ? sp : a);
    }

    // Lạc Long Quân: mưa bong bóng hộ thể – +50 nộ & +300% Thủ (của bản thân) cho 2 đồng đội ngẫu nhiên trong 1 hiệp
    async function waterUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)', made = [];
      const allies = alliesOf(u).filter(h => h.alive && h !== u).sort(() => Math.random() - 0.5).slice(0, LLQ_TARGETS);
      const ring = (x, y) => {
        const w = document.createElement('div'); w.className = 'bf-wave'; w.style.left = x + '%'; w.style.top = y + '%';
        w.style.borderColor = '#38bdf8'; w.style.boxShadow = '0 0 24px #0ea5e9, inset 0 0 24px #38bdf8';
        box.appendChild(w); setTimeout(() => w.remove(), 650);
      };
      const bonus = Math.round(u.def * LLQ_DEF_MULT * (u.sk || 1));
      const applyBuff = a => {                                  // buff khi sóng cuốn qua đồng đội
        if (noBuff(a)) { floatText(a, '🚫 KHÓA TĂNG PHÚC'); return; }
        ring(a.x, a.y);
        if (a.rage != null) gainRage(a, LLQ_RAGE);
        a.def += bonus; a.defBuff = (a.defBuff || 0) + bonus;
        if (!a.el.querySelector('.bf-shield')) { const ic = document.createElement('div'); ic.className = 'bf-shield'; ic.textContent = '🛡️'; a.el.appendChild(ic); }
        if (a.rage != null) floatText(a, '+' + LLQ_RAGE + ' NỘ'); setTimeout(() => floatText(a, 'THỦ +' + fmtN(bonus)), 250);
        refreshPanel();
      };

      // ===== Mưa bong bóng từ trên trời rơi xuống phe ta: bong bóng chạm tướng thì vỡ, đồng đội được chọn nhận buff khi bóng đầu tiên chạm =====
      const bubbleRain = () => new Promise(res => {
        const alive = alliesOf(u).filter(h => h.alive);
        const pool = alive.slice(); allies.forEach(a => { pool.push(a, a); });                   // đồng đội được buff hứng nhiều bong bóng hơn
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        cv.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;pointer-events:none;z-index:98';
        f.appendChild(cv); made.push(cv);
        const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
        const SPAN = battleFast ? 450 : 1700, SPD = battleFast ? 2.6 : 1, N = 120;
        const bubs = [], pops = [], drops = [];
        for (let k = 0; k < N; k++) {
          const tg = pool[Math.floor(Math.random() * pool.length)];
          const lx = tg.x * W / 100 + (Math.random() - .5) * 64, ly = tg.y * H / 100 + (Math.random() - .35) * 34;
          bubs.push({ tg, lx, ly, y: -30 - Math.random() * 50, at: Math.random() * SPAN, sp: (150 + Math.random() * 190) * SPD, r: 5 + Math.random() * 13, ph: Math.random() * 6.283, sw: 6 + Math.random() * 12, on: false, x: lx });
        }
        const t0 = performance.now(); let last = t0;
        const popAt = b => {
          pops.push({ x: b.x, y: b.y, r: b.r, age: 0 });
          for (let k = 0; k < 4; k++) drops.push({ x: b.x, y: b.y, vx: (Math.random() - .5) * 140, vy: -(30 + Math.random() * 110), age: 0, life: 0.45 });
          if (allies.includes(b.tg) && !b.tg.__wb) { b.tg.__wb = true; applyBuff(b.tg); }       // bong bóng đầu tiên chạm -> buff
        };
        const frame = now => {
          if (tok !== battleToken) return res();
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          const el = now - t0, time = el / 1000;
          ctx.clearRect(0, 0, W, H);
          let pending = 0;
          for (let n = 0; n < bubs.length; n++) {
            const b = bubs[n]; if (b.done) continue;
            if (el < b.at) { pending++; continue; }
            pending++; b.on = true;
            b.y += b.sp * dt; b.x = b.lx + Math.sin(time * 2.2 + b.ph) * b.sw;
            if (b.y >= b.ly) { b.done = true; popAt(b); continue; }
            const r = b.r, g = ctx.createRadialGradient(b.x - r * .3, b.y - r * .3, r * .1, b.x, b.y, r);
            g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(.4, 'rgba(186,230,253,.22)'); g.addColorStop(1, 'rgba(56,189,248,.38)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, 6.283); ctx.fill();
            ctx.strokeStyle = 'rgba(186,230,253,.9)'; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(b.x - r * .35, b.y - r * .38, Math.max(1, r * .2), 0, 6.283); ctx.fill();
          }
          for (let n = pops.length - 1; n >= 0; n--) {                                          // vòng nước loang ra khi bóng vỡ
            const p = pops[n]; p.age += dt; const k = p.age / 0.3;
            if (k >= 1) { pops.splice(n, 1); continue; }
            ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + 1.4 * k), 0, 6.283); ctx.stroke();
          }
          ctx.fillStyle = '#e0f2fe';
          for (let n = drops.length - 1; n >= 0; n--) {                                         // giọt nước li ti bắn ra
            const d = drops[n]; d.age += dt;
            if (d.age >= d.life) { drops.splice(n, 1); continue; }
            d.vy += 420 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
            ctx.globalAlpha = 1 - d.age / d.life; ctx.beginPath(); ctx.arc(d.x, d.y, 2, 0, 6.283); ctx.fill();
          }
          ctx.globalAlpha = 1;
          if (!pending && !pops.length && !drops.length || el > SPAN + 4500) { allies.forEach(a => { if (!a.__wb) applyBuff(a); delete a.__wb; }); return res(); }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });

      try {
        u.el.animate([{ transform: base }, { transform: 'translate(-50%,calc(-50% - 16px))' }, { transform: base }], { duration: 500 });
        ring(u.x, u.y);
        await sleep(500); if (tok !== battleToken) return;
        await bubbleRain(); if (tok !== battleToken) return;
        await sleep(300);
      } finally {
        allies.forEach(a => { delete a.__wb; });
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
      }
    }

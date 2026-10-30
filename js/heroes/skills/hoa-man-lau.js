/* HOA MÃN LÂU (id 6): tuyệt kỹ bướm
   (tách từ index.html cũ — script) */

    // Pháo xẹt: tiếng gió rít tăng dần + tiếng huýt cao dần, vút lên rồi tắt
    function sfxRocket() {
      const ctx = sfxGet(); if (!ctx) return;
      try {
        const t = ctx.currentTime, D = 0.65;
        const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(0.5, t + 0.05); out.gain.exponentialRampToValueAtTime(0.0001, t + D); out.connect(ctx.destination);
        const nz = sfxNoise(ctx, D), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
        bp.frequency.setValueAtTime(700, t); bp.frequency.exponentialRampToValueAtTime(6000, t + D);
        nz.connect(bp); bp.connect(out); nz.start(t); nz.stop(t + D);
        const o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(3000, t + D);
        const og = ctx.createGain(); og.gain.value = 0.25; o.connect(og); og.connect(out); o.start(t); o.stop(t + D);
      } catch (e) {}
    }
    // Chuông chùa: tiếng gõ trầm + các hài âm lệch (inharmonic) ngân dài, tắt dần
    function sfxBell() {
      const ctx = sfxGet(); if (!ctx) return;
      try {
        const t = ctx.currentTime, f0 = 240;
        const out = ctx.createGain(); out.gain.value = 0.55; out.connect(ctx.destination);
        [[1, 1, 3.2], [2.0, 0.55, 2.4], [2.76, 0.4, 1.8], [5.4, 0.22, 1.0], [8.93, 0.12, 0.6]].forEach(([r, a, dec]) => {
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f0 * r;
          const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(a * 0.5, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
          o.connect(g); g.connect(out); o.start(t); o.stop(t + dec + 0.05);
        });
        const nz = sfxNoise(ctx, 0.05), ng = ctx.createGain(); ng.gain.setValueAtTime(0.25, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
        nz.connect(lp); lp.connect(ng); ng.connect(out); nz.start(t); nz.stop(t + 0.06);
      } catch (e) {}
    }
    async function butterflyUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight;
      const alive = () => foesOf(u).filter(e => e.alive);
      const anim = (el, kf, d, e) => el.animate(kf, { duration: d, easing: e || 'ease-in-out', fill: 'forwards' });
      const es0 = alive(); if (!es0.length) return;
      const cx = es0.reduce((a, e) => a + e.x, 0) / es0.length, cy = es0.reduce((a, e) => a + e.y, 0) / es0.length;
      const dmg = u.atk * BFLY_MULT * (u.sk || 1);          // chốt sát thương trước khi buff Công
      const made = [];
      const mk = (cls, txt, x, y) => { const d = document.createElement('div'); d.className = cls; d.textContent = txt; d.style.left = x + '%'; d.style.top = y + '%'; box.appendChild(d); made.push(d); return d; };
      try {
        // 1. Triệu hồi 3 con bướm phát sáng, xoay quanh thân (orbit) – chuyển thể từ ButterflySkill.cs
        const picks = BFLY_COLORS.slice().sort(() => Math.random() - 0.5).slice(0, BFLY_HITS);   // 3 màu khác nhau trong 7 màu
        const flies = picks.map((c, i) => {
          const b = mk('bf-bfly flap', '🦋', u.x, u.y - 4);
          b.style.filter = `hue-rotate(${c.hue}deg) saturate(1.8) brightness(1.15) drop-shadow(0 0 8px ${c.css}) drop-shadow(0 0 16px ${c.css})`;
          return { b, c, hue: c.hue, off: i * (Math.PI * 2 / BFLY_HITS), px: 0, py: 0 };
        });
        u.el.animate([{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(-50%,calc(-50% - 12px))' }, { transform: 'translate(-50%,-50%)' }], { duration: 300 });
        const t0 = performance.now(), ORBIT = 750;
        await new Promise(res => {
          const step = now => {
            const k = (now - t0) / ORBIT;
            if (tok !== battleToken || k >= 1) return res();
            flies.forEach((fl, i) => {
              const a = fl.off + k * ORBIT / 1000 * 5.6;                 // tốc độ xoay 2.8 rad/s như Unity
              fl.px = Math.cos(a) * 44; fl.py = Math.sin(a) * 26 - 8 + Math.sin(a * 2 + i) * 4;
              fl.b.style.transform = `translate(calc(-50% + ${fl.px}px),calc(-50% + ${fl.py}px)) scale(${1 + Math.sin(a) * 0.22}) rotate(${Math.cos(a) * 14}deg)`;
              fl.b.style.zIndex = Math.sin(a) > 0 ? 95 : 5;
            });
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        if (tok !== battleToken) return;

        // 2. Cả 3 con cùng bay vút lên trời (smooth-step + cung vòng nhẹ)
        const SKY_Y = 3;
        const skyX = i => u.x + (i - (flies.length - 1) / 2) * 12;
        flies.forEach((fl, i) => {
          const dx = (skyX(i) - u.x) * W / 100, dy = (SKY_Y - (u.y - 4)) * H / 100;
          fl.b.style.zIndex = 95;
          fl.sky = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(2.2)`;
          anim(fl.b, [
            { transform: `translate(calc(-50% + ${fl.px}px),calc(-50% + ${fl.py}px)) scale(1)` },
            { transform: `translate(calc(-50% + ${dx * 0.4}px),calc(-50% + ${dy * 0.55}px)) scale(1.6) rotate(-14deg)`, offset: 0.55 },
            { transform: fl.sky }
          ], 500, 'ease-in-out');
        });
        sfxRocket();
        await sleep(525); if (tok !== battleToken) return;

        // 3. Lần lượt từng con lao xuống đất (cung vòng), nổ ánh sáng ma thuật rồi gây sát thương
        for (let i = 0; i < flies.length; i++) {
          const fl = flies[i];
          const es1 = alive(); if (!es1.length) { fl.b.remove(); break; }
          const tx = es1.reduce((a, e) => a + e.x, 0) / es1.length + (i - 1) * 7, ty = es1.reduce((a, e) => a + e.y, 0) / es1.length;
          const sx = (skyX(i) - u.x) * W / 100, sy = (SKY_Y - (u.y - 4)) * H / 100;
          const ex = (tx - u.x) * W / 100, ey = (ty - (u.y - 4)) * H / 100;
          const at = (t, sc, rot) => `translate(calc(-50% + ${sx + (ex - sx) * t}px),calc(-50% + ${sy + (ey - sy) * t - Math.sin(t * Math.PI) * 26}px)) scale(${sc}) rotate(${rot}deg)`;
          anim(fl.b, [
            { transform: fl.sky }, { transform: at(0.25, 2.0, 12) }, { transform: at(0.5, 1.8, -12) },
            { transform: at(0.75, 1.6, 8) }, { transform: at(1, 1.4, 0) }
          ], 325, 'ease-in');
          await sleep(330); if (tok !== battleToken) return;
          sfxBell();
          fl.b.remove();
          const col = fl.c.css;
          const fx = document.createElement('div'); fx.className = 'bf-bflash'; fx.style.left = tx + '%'; fx.style.top = ty + '%'; fx.style.setProperty('--fc', col);
          box.appendChild(fx); made.push(fx); setTimeout(() => fx.remove(), 400);
          anim(fx, [{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(8)', opacity: 0 }], 350, 'ease-out');   // nổ to dần ×8 như ExpandImpact
          const es = alive(); if (!es.length) break;
          es.forEach(e => {
            skillHit(e, dmg);
            const w = document.createElement('div'); w.className = 'bf-wave'; w.style.left = e.x + '%'; w.style.top = e.y + '%';
            w.style.borderColor = col; w.style.boxShadow = `0 0 20px ${col}, inset 0 0 20px ${col}`;
            box.appendChild(w); setTimeout(() => w.remove(), 650);
          });
          bflyEffect(fl.c, es);                                   // hiệu ứng theo màu bướm
          f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 200);
          if (i < flies.length - 1) await sleep(175);              // delayBetweenDives
          if (tok !== battleToken) return;
        }

        // 4. Tăng 50% Công cho toàn đội (không cộng dồn)
        alliesOf(u).filter(h => h.alive).forEach(h => {
          if (noBuff(h)) { floatText(h, '🚫 KHÓA TĂNG PHÚC'); return; }
          if (!h.atkBuff) {
            h.atkBuff = Math.round(h.atk * BFLY_ATK_BUFF);
            h.atk += h.atkBuff;
            const ic = document.createElement('div'); ic.className = 'bf-atkup'; ic.textContent = '⚔️'; h.el.appendChild(ic);
          }
          floatText(h, 'CÔNG +' + Math.round(BFLY_ATK_BUFF * 100) + '%');
        });
        refreshPanel();
        await sleep(225);
      } finally {
        made.forEach(d => d.remove());
      }
    }

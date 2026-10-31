/* TRƯƠNG TAM PHONG (id 4): tuyệt kỹ Thái Cực
   (tách từ index.html cũ — script) */

    // Trương Tam Phong: tụ khối cầu Thái Cực -> nhảy lên trời -> ném xuống gây sát thương toàn địch + choáng ngẫu nhiên 1 địch trong 2 hiệp
    // ===== Âm thanh Trương Tam Phong: "đùng" ly vỡ khi chọi xuống =====
    function sfxGlassBreak() {
      const ctx = sfxGet(); if (!ctx) return;
      try {
        const t = ctx.currentTime;
        const out = ctx.createGain(); out.gain.value = 2.2;
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 8;
        out.connect(comp); comp.connect(ctx.destination);
        // "đùng": cú đập trầm
        const o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.28);
        const og = ctx.createGain(); og.gain.setValueAtTime(1, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.4);
        // vỡ ly: xoẹt nhiễu cao + nhiều mảnh thủy tinh leng keng rơi lả tả
        const nz = sfxNoise(ctx, 0.35), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500;
        const ng = ctx.createGain(); ng.gain.setValueAtTime(0.7, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.33);
        nz.connect(hp); hp.connect(ng); ng.connect(out); nz.start(t); nz.stop(t + 0.36);
        for (let i = 0; i < 14; i++) {
          const at = t + 0.01 + Math.random() * 0.45, f = 2200 + Math.random() * 4800;
          const s2 = ctx.createOscillator(); s2.type = 'sine'; s2.frequency.value = f;
          const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(0.18 + Math.random() * 0.15, at + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12 + Math.random() * 0.15);
          s2.connect(g); g.connect(out); s2.start(at); s2.stop(at + 0.3);
        }
      } catch (e) {}
    }
    async function taichiUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight;
      const alive = () => foesOf(u).filter(e => e.alive);
      const base = 'translate(-50%,-50%)';
      const ju = u.y * H / 100 + 120;
      const up = `translate(-50%, calc(-50% - ${ju}px))`;
      const anim = (el, kf, d, e) => el.animate(kf, { duration: d, easing: e || 'ease-in-out', fill: 'forwards' });
      const quick = !!u.qRepeat, keep = !!u.qKeep;   // quick: đang lơ lửng trên trời -> chọi tiếp ngay, không nhảy lại
      const ball = document.createElement('div');
      ball.className = 'bf-yy';
      ball.style.left = u.x + '%'; ball.style.top = (u.y - 10) + '%'; ball.style.zIndex = 90;
      box.appendChild(ball);
      try {
        if (quick) {
          anim(ball, [{ transform: up + ' scale(.6)', opacity: 0 }, { transform: up + ' scale(1.8)', opacity: 1 }], 220, 'ease-out');
          await sleep(240); if (tok !== battleToken) return;
        } else {
          // 1. Tụ khối cầu Thái Cực
          anim(ball, [{ transform: base + ' scale(.1) rotate(0deg)', opacity: 0 }, { transform: base + ' scale(1.4) rotate(540deg)', opacity: 1 }], 700, 'ease-out');
          await sleep(750); if (tok !== battleToken) return;
          // 2. Nhảy lên trời cùng khối cầu
          anim(u.el, [{ transform: base }, { transform: up }], 450, 'ease-in');
          anim(ball, [{ transform: base + ' scale(1.4)' }, { transform: up + ' scale(1.8)' }], 450, 'ease-in');
          await sleep(550); if (tok !== battleToken) return;
        }
        // 3. Chọi xuống giữa đám địch
        const es = alive(); if (!es.length) return;
        const cx = es.reduce((a, e) => a + e.x, 0) / es.length, cy = es.reduce((a, e) => a + e.y, 0) / es.length;
        const dx = (cx - u.x) * W / 100, dy = (cy - (u.y - 10)) * H / 100;
        anim(ball, [{ transform: up + ' scale(1.8)' }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(2.6)` }], 320, 'ease-in');
        await sleep(320); if (tok !== battleToken) return;
        ball.remove(); sfxGlassBreak();
        // Va chạm trắng đen: 2 sóng trắng/đen lan ra + cả sàn đấu chớp đơn sắc
        [0, 160].forEach(d => setTimeout(() => {
          const w = document.createElement('div'); w.className = 'bf-yyfx'; w.style.left = cx + '%'; w.style.top = cy + '%';
          if (d) { w.style.borderColor = '#000'; w.style.boxShadow = '0 0 24px #000, inset 0 0 26px #fff'; }
          box.appendChild(w); setTimeout(() => w.remove(), 850);
        }, d));
        f.style.transition = 'filter .08s'; f.style.filter = 'contrast(1.35) brightness(1.25)';
        setTimeout(() => { f.style.filter = 'contrast(1.2) brightness(.8)'; }, 90);
        setTimeout(() => { f.style.filter = ''; }, 380);
        f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 400);
        es.forEach(e => skillHit(e, u.atk * TAICHI_MULT * (u.sk || 1), u));              // sát thương toàn địch
        const left = alive();
        // ★5: choáng 1 địch ngẫu nhiên 2 hiệp, không chảy máu • ★6: choáng 2 địch ngẫu nhiên 2 hiệp + chảy máu 40%
        const six = (u.side === 'hero' ? getProg(4).star : (u.star || 0)) >= STAR_MAX;
        shuffled(left).slice(0, six ? 2 : 1).forEach(v => { stunEnemy(v, Math.max(2, v.stun || 0)); floatText(v, 'CHOÁNG 2 HIỆP'); });
        if (six) left.forEach(e => {
          e.bleed = Math.max(e.bleed || 0, TAICHI_BLEED_TURNS); e.bleedPct = Math.max(e.bleedPct || 0, TAICHI_BLEED_PCT);
          if (!e.el.querySelector('.bf-bleed')) { const ic = document.createElement('div'); ic.className = 'bf-bleed'; ic.textContent = '🩸'; e.el.appendChild(ic); }
          floatText(e, 'CHẢY MÁU ' + Math.round(TAICHI_BLEED_PCT * 100) + '%');
        });
        await sleep(keep ? 120 : 350); if (tok !== battleToken) return;
        if (!keep) {
          // 4. Hạ xuống
          anim(u.el, [{ transform: up }, { transform: base }], 350, 'ease-out');
          await sleep(380);
        }
      } finally {
        ball.remove();
        if (!keep) u.el.getAnimations().forEach(a => a.cancel());
      }
    }

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
      // Đứng TẠI CHỖ tung tuyệt kỹ (không nhảy): chuỗi 16 khung SEQ.ttpCast phủ lên tướng, lốc xoáy SEQ.ttpStorm mở ra bên địch rồi gây sát thương toàn địch + choáng
      const g = nt(u), { f, W, H, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0), S = SEQ.ttpStorm;
      const SW = Math.round(Math.max(190, Math.min(W * 0.5, H * 0.85)) * 1.4), SH = Math.round(SW * S.ch / S.cw), hw = SW * 0.5 / W * 100, hh = SH * 0.5 / H * 100;
      const cx = Math.max(hw + 1, Math.min(99 - hw, b.cx)), cy = Math.max(hh + 2, Math.min(98 - hh, b.cy - 3));
      const cast = seqOverlay(u, SEQ.ttpCast, 172), timers = [], oldZ = u.el.style.zIndex; let storm = null;
      const at = (ms, fn) => timers.push(setTimeout(() => { if (tok === battleToken) fn(); }, seqT(ms)));
      try {
        u.el.style.zIndex = 99;
        for (let i = 0; i < 16; i++) at(i * 100, () => cast.show(i));          // 16 khung: tụ cầu → tung ra
        at(780, () => {                                                         // cầu Thái Cực đã lớn → lốc xoáy mở ra bên địch
          storm = g.mk('bf-seq-fx', '', cx, cy); storm.style.width = SW + 'px'; storm.style.height = SH + 'px';
          const sc = seqEl(S, SW); sc.loop(1300); storm.appendChild(sc);
          storm.animate([{ transform: 'translate(-50%,-50%) scale(.15,.05)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.08,1.12)', opacity: 1, offset: .65 }, { transform: 'translate(-50%,-50%) scale(1,1)', opacity: 1 }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
        });
        await sleep(1450); if (tok !== battleToken) return;
        // Lốc xoáy giáng xuống: va chạm
        const es = g.es(); if (!es.length) return;
        sfxGlassBreak();
        f.style.transition = 'filter .08s'; f.style.filter = 'contrast(1.35) brightness(1.25)';
        setTimeout(() => { f.style.filter = 'contrast(1.2) brightness(.8)'; }, 90);
        setTimeout(() => { f.style.filter = ''; }, 380);
        f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 400);
        es.forEach(e => skillHit(e, u.atk * TAICHI_MULT * (u.sk || 1), u));              // sát thương toàn địch
        const left = g.es();
        // ★5: choáng 1 địch ngẫu nhiên 2 hiệp, không chảy máu • ★6: choáng 2 địch ngẫu nhiên 2 hiệp + chảy máu 40%
        const six = (u.side === 'hero' ? getProg(4).star : (u.star || 0)) >= STAR_MAX;
        shuffled(left).slice(0, six ? 2 : 1).forEach(v => { stunEnemy(v, Math.max(2, v.stun || 0)); floatText(v, 'CHOÁNG 2 HIỆP'); });
        if (six) left.forEach(e => {
          e.bleed = Math.max(e.bleed || 0, TAICHI_BLEED_TURNS); e.bleedPct = Math.max(e.bleedPct || 0, TAICHI_BLEED_PCT);
          if (!e.el.querySelector('.bf-bleed')) { const ic = document.createElement('div'); ic.className = 'bf-bleed'; ic.textContent = '🩸'; e.el.appendChild(ic); }
          floatText(e, 'CHẢY MÁU ' + Math.round(TAICHI_BLEED_PCT * 100) + '%');
        });
        await sleep(900); if (tok !== battleToken) return;
        if (storm) storm.animate([{ opacity: 1, transform: 'translate(-50%,-50%) scale(1,1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.6,1.25)' }], { duration: 480, fill: 'forwards' });
        await sleep(500);
      } finally {
        timers.forEach(clearTimeout); cast.end(); u.el.style.zIndex = oldZ; made.forEach(d => d.remove());
      }
    }

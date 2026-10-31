/* ĐỘC CÔ CẦU BẠI (id 3): tuyệt kỹ lốc xoáy + sấm sét
   (tách từ index.html cũ — script) */

    // Độc Cô Cầu Bại: triệu hồi 3 lốc xoáy tím có tia sét bao quanh, lần lượt từng xoáy quét từ đội ta sang đội địch
    // -> mỗi xoáy gây sát thương TOÀN địch; xoáy cuối xóa sạch tăng phúc của địch + 2 hiệp không thể nhận tăng phúc

    // ===== Âm thanh Độc Cô Cầu Bại: gió lốc rít + sấm sét =====
    function sfxWhirl(dur) {
      const ctx = sfxGet(); if (!ctx) return;
      try {
        const t = ctx.currentTime, out = ctx.createGain();
        out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.9, t + dur * 0.25);
        out.gain.setValueAtTime(0.9, t + dur * 0.7); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        out.connect(ctx.destination);
        const nz = sfxNoise(ctx, dur + 0.1), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3.5;
        bp.frequency.setValueAtTime(380, t); bp.frequency.exponentialRampToValueAtTime(1500, t + dur * 0.5); bp.frequency.exponentialRampToValueAtTime(520, t + dur);
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 9; lg.gain.value = 260; lfo.connect(lg); lg.connect(bp.frequency);   // quay vù vù
        nz.connect(bp); bp.connect(out); nz.start(t); nz.stop(t + dur + 0.1); lfo.start(t); lfo.stop(t + dur + 0.1);
        const lo = ctx.createOscillator(); lo.type = 'sawtooth'; lo.frequency.setValueAtTime(70, t); lo.frequency.linearRampToValueAtTime(110, t + dur * 0.5); lo.frequency.linearRampToValueAtTime(65, t + dur);
        const lof = ctx.createBiquadFilter(); lof.type = 'lowpass'; lof.frequency.value = 260; const log = ctx.createGain(); log.gain.value = 0.35;
        lo.connect(lof); lof.connect(log); log.connect(out); lo.start(t); lo.stop(t + dur + 0.1);
      } catch (e) {}
    }
    function sfxThunder() {
      const ctx = sfxGet(); if (!ctx) return;
      try {
        const t = ctx.currentTime, out = ctx.createGain(); out.gain.value = 1.6;
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 8; out.connect(comp); comp.connect(ctx.destination);
        const nz = sfxNoise(ctx, 0.5), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.setValueAtTime(5000, t); hp.frequency.exponentialRampToValueAtTime(900, t + 0.25);   // tiếng "tách" xé khí
        const ng = ctx.createGain(); ng.gain.setValueAtTime(0.9, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        nz.connect(hp); hp.connect(ng); ng.connect(out); nz.start(t); nz.stop(t + 0.5);
        const rn = sfxNoise(ctx, 0.9), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(700, t); lp.frequency.exponentialRampToValueAtTime(90, t + 0.8);   // sấm ì ầm
        const rg = ctx.createGain(); rg.gain.setValueAtTime(0.0001, t); rg.gain.exponentialRampToValueAtTime(1.0, t + 0.04); rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
        rn.connect(lp); lp.connect(rg); rg.connect(out); rn.start(t); rn.stop(t + 0.9);
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.4);
        const og = ctx.createGain(); og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.5);
      } catch (e) {}
    }
    function stripBuffs(e) {
      let had = false;
      if (e.moon > 0) { removeMoon(e); had = true; }
      if (e.lb > 0) { clearLB(e); had = true; }
      if (e.defBuff) { e.def -= e.defBuff; e.defBuff = 0; const ic = e.el.querySelector('.bf-shield'); if (ic) ic.remove(); had = true; }
      if (e.atkBuff) { e.atk -= e.atkBuff; e.atkBuff = 0; const ic = e.el.querySelector('.bf-atkup'); if (ic) ic.remove(); had = true; }
      if (e.dn && e.dn.immortal > 0) { e.dn.immortal = 0; had = true; }
      (e.dn = e.dn || {}).nobuff = DUCO_NOBUFF;
      refreshDbf(e);
      floatText(e, had ? '🌀 XÓA TĂNG PHÚC' : '🚫 KHÓA TĂNG PHÚC');
    }
    function twBoltPath(x1, y1, x2, y2, segs) {
      let d = 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1);
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      for (let i = 1; i < segs; i++) {
        const t = i / segs, o = (Math.random() - 0.5) * len * 0.34;
        d += ' L' + (x1 + dx * t + nx * o).toFixed(1) + ' ' + (y1 + dy * t + ny * o).toFixed(1);
      }
      return d + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }
    function makeTwister() {
      const el = document.createElement('div'); el.className = 'bf-tw';
      let h = '<div class="tw-dust"></div><div class="tw-core"></div>';
      for (let i = 0; i < 9; i++) {
        const w = 112 - i * 10, top = i * 20 - w / 2 + 14;
        h += `<div class="tw-ring" style="width:${w}px;height:${w}px;left:${(110 - w) / 2}px;top:${top}px;--d:${(0.42 + i * 0.05).toFixed(2)}s;animation-direction:${i % 2 ? 'reverse' : 'normal'}"></div>`;
      }
      h += '<svg class="tw-bolts" viewBox="-40 -10 190 210"></svg>';
      el.innerHTML = h;
      const svg = el.querySelector('.tw-bolts');
      const draw = () => {          // sét tím chớp liên tục quanh thân xoáy
        let g = '';
        const n = 5 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) {
          const y = 8 + Math.random() * 176, hw = 10 + 44 * (1 - y / 190), side = Math.random() < 0.5 ? -1 : 1;
          const x1 = 55 + side * hw, y1 = y, x2 = 55 + side * (hw + 16 + Math.random() * 30), y2 = y + (Math.random() - 0.5) * 50;
          const dd = twBoltPath(x1, y1, x2, y2, 4 + Math.floor(Math.random() * 2));
          g += `<path d="${dd}" fill="none" stroke="#a855f7" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><path d="${dd}" fill="none" stroke="#f5e9ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        if (Math.random() < 0.55) {   // tia sét dài xuyên từ đỉnh xuống thân
          const dd = twBoltPath(55 + (Math.random() - 0.5) * 40, -8, 55 + (Math.random() - 0.5) * 24, 120 + Math.random() * 60, 7);
          g += `<path d="${dd}" fill="none" stroke="#c084fc" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/><path d="${dd}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        svg.innerHTML = g;
      };
      draw(); el._iv = setInterval(draw, 70);
      return el;
    }
    async function duCoUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)';
      const alive = () => foesOf(u).filter(e => e.alive);
      const es0 = alive(); if (!es0.length) return;
      const allies = alliesOf(u);
      const DSP = 1.5, wait = ms => new Promise(r => setTimeout(r, ms / (battleFast ? 4 : DSP)));
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const fx = es0.map(e => e.x), fy = es0.map(e => e.y), ax = allies.map(a => a.x);
      const cx = fx.reduce((a, b) => a + b, 0) / fx.length, cy = fy.reduce((a, b) => a + b, 0) / fy.length;
      const dir = cx >= ax.reduce((a, b) => a + b, 0) / ax.length ? 1 : -1;
      const sx = clamp((dir > 0 ? Math.min(...ax) : Math.max(...ax)) - dir * 6, 4, 96);
      const ex = clamp((dir > 0 ? Math.max(...fx) : Math.min(...fx)) + dir * 10, 4, 96);
      const hitFrac = clamp((cx - sx) / (ex - sx), 0.35, 0.8);
      const lanes = [-7, 7, 0];
      const per = u.atk * DUCO_MULT * (u.sk || 1) / DUCO_TWISTERS;
      const made = [], oldZ = u.el.style.zIndex;
      const strike = list => {      // sét tím giáng xuống từng địch
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'bf-tw-strike'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        let g = '';
        list.forEach(e => {
          const x = e.x / 100 * W, y = e.y / 100 * H;
          for (let k = 0; k < 2; k++) {
            const dd = twBoltPath(x + (Math.random() - 0.5) * 50, 0, x + (Math.random() - 0.5) * 14, y, 9);
            g += `<path d="${dd}" fill="none" stroke="#a855f7" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/><path d="${dd}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
          }
        });
        svg.innerHTML = '<g style="filter:drop-shadow(0 0 8px #a855f7) drop-shadow(0 0 16px #7c3aed)">' + g + '</g>';
        box.appendChild(svg); setTimeout(() => svg.remove(), 260);
      };
      try {
        // 1. Tụ lực: hào quang tím quanh Độc Cô
        u.el.style.zIndex = 99;
        u.el.animate([{ filter: 'brightness(1) drop-shadow(0 0 0 #a855f7)' }, { filter: 'brightness(1.6) drop-shadow(0 0 22px #a855f7)' }, { filter: 'brightness(1.3) drop-shadow(0 0 14px #c084fc)' }], { duration: (3 * 1000 + 600) / DSP, fill: 'forwards' });
        const ring = document.createElement('div'); ring.className = 'bf-wave'; ring.style.left = u.x + '%'; ring.style.top = u.y + '%';
        ring.style.borderColor = '#a855f7'; ring.style.boxShadow = '0 0 24px #7e22ce, inset 0 0 24px #c084fc';
        box.appendChild(ring); setTimeout(() => ring.remove(), 650);
        await wait(450); if (tok !== battleToken) return;
        // 2. Lần lượt từng lốc xoáy quét từ đội ta sang đội địch
        for (let i = 0; i < DUCO_TWISTERS; i++) {
          const tw = makeTwister(), ly = clamp(cy + lanes[i % lanes.length], 18, 78);
          tw.style.left = sx + '%'; tw.style.top = ly + '%'; tw.style.opacity = 0;
          box.appendChild(tw); made.push(tw);
          const dur = 1050;
          const spd = (battleFast ? 4 : DSP);
          sfxWhirl(dur / 1000 / spd);
          tw.animate([
            { left: sx + '%', top: (ly + 2) + '%', opacity: 0, transform: base + ' scale(.5)' },
            { left: (sx + (ex - sx) * .12) + '%', top: ly + '%', opacity: 1, transform: base + ' scale(1)', offset: .12 },
            { left: (sx + (ex - sx) * .5) + '%', top: (ly - 2.5) + '%', opacity: 1, transform: base + ' scale(1.08)', offset: .5 },
            { left: (sx + (ex - sx) * .88) + '%', top: (ly + 1.5) + '%', opacity: 1, transform: base + ' scale(1.05)', offset: .88 },
            { left: ex + '%', top: ly + '%', opacity: 0, transform: base + ' scale(.8)' }
          ], { duration: dur / spd, easing: 'ease-in-out', fill: 'forwards' });
          await wait(dur * hitFrac); if (tok !== battleToken) return;
          const es = alive();
          if (es.length) {
            strike(es); sfxThunder();
            f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 160);
            es.forEach(e => {
              skillHit(e, per, u);
              const fl = document.createElement('div'); fl.className = 'bf-bflash'; fl.style.left = e.x + '%'; fl.style.top = e.y + '%'; fl.style.setProperty('--fc', '#a855f7');
              box.appendChild(fl); setTimeout(() => fl.remove(), 450);
            });
            refreshPanel();
          }
          await wait(dur * (1 - hitFrac)); if (tok !== battleToken) return;
          clearInterval(tw._iv); tw.remove();
          if (!alive().length) break;
          if (i < DUCO_TWISTERS - 1) await wait(120);
        }
        // 3. Xóa sạch tăng phúc của địch + khóa tăng phúc 2 hiệp
        alive().forEach(e => stripBuffs(e));
        refreshPanel();
        await wait(500); if (tok !== battleToken) return;
      } finally {
        made.forEach(d => { clearInterval(d._iv); d.remove(); });
        u.el.getAnimations().forEach(a => a.cancel());
        u.el.style.zIndex = oldZ;
      }
    }

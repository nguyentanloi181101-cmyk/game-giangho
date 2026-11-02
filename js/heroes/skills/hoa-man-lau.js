/* HOA MÃN LÂU (id 6): tuyệt kỹ bướm (dùng ảnh chuỗi khung, không còn emoji)
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
    // Hoa Mãn Lâu: đứng TẠI CHỖ tung tuyệt kỹ (SEQ.hmlCast). 3 chuỗi bướm màu ngẫu nhiên (trong 7 màu, mỗi chuỗi 16 khung) lần lượt RƠI CHÉO từ góc trên màn hình
    // xuống đội địch (nhỏ -> to dần, nghiêng theo đường rơi); phát hết các khung rơi, chạm đất mới bung tia nhiều hướng (khung 12-15)
    // + sát thương TOÀN địch + hiệu ứng theo màu; cuối cùng +50% Công toàn đội
    const BFLY_SEQ = { red: 'hmlRed', orange: 'hmlOrange', yellow: 'hmlYellow', green: 'hmlGreen', blue: 'hmlBlue', indigo: 'hmlIndigo', purple: 'hmlPurple' };
    async function butterflyUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight;
      const alive = () => foesOf(u).filter(e => e.alive);
      const es0 = alive(); if (!es0.length) return;
      const dmg = u.atk * BFLY_MULT * (u.sk || 1);          // chốt sát thương trước khi buff Công
      const made = [], timers = [], oldZ = u.el.style.zIndex;
      const at = (ms, fn) => timers.push(setTimeout(() => { if (tok === battleToken) fn(); }, seqT(ms)));
      // khung tung chiêu phủ lên tướng: cùng tỉ lệ & điểm neo với dáng đứng (SEQ_IDLE[6]) nên thân không xê dịch
      const CAST_W = Math.round(SEQ.hmlCast.cw * SEQ_IDLE[6].h / SEQ.hmlIdle.ch), CAST_FR = 75;
      const cast = seqOverlay(u, SEQ.hmlCast, CAST_W);
      const FR = 50, FALL = 8, DIVE = 12, BFR = 70, GAP = 420;   // khung 0-7 = rơi chéo (bay tới đích) • khung 8-11 = chạm đất, đứng yên tại đích • khung 12-15 = bung tia; GAP = ms giữa 2 con
      const FW = Math.round(Math.max(260, Math.min(W * 0.66, 470))), FH = Math.round(FW * 256 / 384);
      const fromX = u.side === 'hero' ? 7 : 93;               // góc trên màn hình, phía tướng ra đòn (đội ta: góc trên-trái)
      const fromY = 8;
      const strike = async (c, i) => {
        await sleep(i * GAP); if (tok !== battleToken) return;
        const es1 = alive(); if (!es1.length) return;
        const tx = es1.reduce((a, e) => a + e.x, 0) / es1.length + (i - 1) * 4, ty = es1.reduce((a, e) => a + e.y, 0) / es1.length + (i - 1) * 2;
        const sx = (fromX - tx) * W / 100, sy = (fromY - ty) * H / 100;       // điểm xuất phát so với đích (px)
        const ang = Math.atan2(sx, -sy) * 180 / Math.PI;                      // nghiêng theo đường chéo
        const el = document.createElement('div'); el.className = 'bf-seq-fx';
        el.style.left = tx + '%'; el.style.top = `calc(${ty}% + 10px)`; el.style.width = FW + 'px'; el.style.height = FH + 'px';
        const sc = seqEl(SEQ[BFLY_SEQ[c.k]], FW); el.appendChild(sc); box.appendChild(el); made.push(el);
        el.animate([
          { transform: `translate(calc(-50% + ${sx}px),calc(-50% + ${sy}px)) scale(.28) rotate(${ang}deg)`, opacity: 0 },
          { transform: `translate(calc(-50% + ${sx * 0.88}px),calc(-50% + ${sy * 0.88}px)) scale(.34) rotate(${ang}deg)`, opacity: 1, offset: 0.06 },
          { transform: `translate(calc(-50% + ${sx * 0.35}px),calc(-50% + ${sy * 0.35}px)) scale(.7) rotate(${ang * 0.55}deg)`, opacity: 1, offset: 0.65 },
          { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 }
        ], { duration: battleFast ? 1 : FALL * FR, easing: 'ease-in', fill: 'both' });   // bay tới đích đúng lúc hết khung 7; khung 8-11 phát tại chỗ
        for (let k = 0; k < DIVE; k++) at(k * FR, () => sc.show(k));          // khung 0-7 rơi, 8-11 chạm đất
        await sleep(DIVE * FR); if (tok !== battleToken) return;

        // Sau khi chạm đất (khung 8-11): BUNG TIA nhiều hướng (khung 12-15) + chuông + chớp sáng + sóng + sát thương toàn địch + hiệu ứng theo màu
        for (let k = 0; k < 4; k++) at(k * BFR, () => sc.show(DIVE + k));
        at(4 * BFR + 80, () => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }));
        sfxBell();
        const col = c.css;
        const fx = document.createElement('div'); fx.className = 'bf-bflash'; fx.style.left = tx + '%'; fx.style.top = ty + '%'; fx.style.setProperty('--fc', col);
        box.appendChild(fx); made.push(fx); setTimeout(() => fx.remove(), 400);
        fx.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(8)', opacity: 0 }], { duration: 350, easing: 'ease-out', fill: 'forwards' });
        const es = alive(); if (!es.length) return;
        es.forEach(e => {
          skillHit(e, dmg, u);
          const w = document.createElement('div'); w.className = 'bf-wave'; w.style.left = e.x + '%'; w.style.top = e.y + '%';
          w.style.borderColor = col; w.style.boxShadow = `0 0 20px ${col}, inset 0 0 20px ${col}`;
          box.appendChild(w); setTimeout(() => w.remove(), 650);
        });
        bflyEffect(c, es);                                     // hiệu ứng theo màu
        f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 200);
        await sleep(4 * BFR + 200);
      };
      try {
        u.el.style.zIndex = 95;
        // 1. Đứng yên tung chiêu (16 khung)
        for (let i = 0; i < 16; i++) at(i * CAST_FR, () => cast.show(i));
        at(16 * CAST_FR, () => cast.end());
        sfxRocket();
        await sleep(400); if (tok !== battleToken) return;

        // 2. 3 màu khác nhau trong 7 màu, lần lượt rơi chéo từ góc trên màn hình xuống đội địch
        const picks = BFLY_COLORS.slice().sort(() => Math.random() - 0.5).slice(0, BFLY_HITS);
        await Promise.all(picks.map((c, i) => strike(c, i)));
        if (tok !== battleToken) return;
        cast.end();

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
        timers.forEach(clearTimeout); cast.end();
        made.forEach(d => d.remove());
        u.el.style.zIndex = oldZ;
      }
    }

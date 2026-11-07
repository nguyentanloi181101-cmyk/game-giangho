/* ĐỘC CÔ CẦU BẠI (id 3): tuyệt kỹ Độc Cô Cửu Kiếm
   Đứng im 1 chỗ (SEQ.dcIdle) → tung chiêu: từ dưới đất nhảy vọt lên cao (SEQ.dcCast) + trận pháp tím dưới chân
   → 3 thanh kiếm (DUCO_TWISTERS) rơi CHÉO từ chỗ Thần Thú phía trên đầu tướng xuống 3 địch (SEQ.dcSword, 20 khung, phóng to khi cắm)
   → mỗi kiếm gây DUCO_MULT × Công lên 1 địch • địch trúng kiếm giảm DUCO_SPD_DOWN Tốc • cả đội ta tăng DUCO_SPD_UP Tốc (DUCO_TURNS hiệp)
   Tham số chỉnh ở admin.html → tab "Chiêu thức & chiến đấu" → Độc Cô Cầu Bại. */

// ===== Âm thanh: kiếm rít trên không + tiếng cắm xuống =====
function sfxSwordFly() {
  const ctx = sfxGet(); if (!ctx) return;
  try {
    const t = ctx.currentTime, out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.55, t + 0.12); out.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); out.connect(ctx.destination);
    const nz = sfxNoise(ctx, 0.6), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 5;
    bp.frequency.setValueAtTime(2600, t); bp.frequency.exponentialRampToValueAtTime(700, t + 0.45);   // vút từ cao xuống thấp
    nz.connect(bp); bp.connect(out); nz.start(t); nz.stop(t + 0.55);
  } catch (e) {}
}
function sfxSwordStab() {
  const ctx = sfxGet(); if (!ctx) return;
  try {
    const t = ctx.currentTime, out = ctx.createGain(); out.gain.value = 1.1;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; out.connect(comp); comp.connect(ctx.destination);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.3);   // bịch nặng
    const og = ctx.createGain(); og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); o.connect(og); og.connect(out); o.start(t); o.stop(t + 0.4);
    const nz = sfxNoise(ctx, 0.25), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;   // tiếng kim loại "keng"
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.55, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); nz.connect(hp); hp.connect(ng); ng.connect(out); nz.start(t); nz.stop(t + 0.25);
    const r = ctx.createOscillator(); r.type = 'triangle'; r.frequency.setValueAtTime(1320, t); const rg = ctx.createGain(); rg.gain.setValueAtTime(0.18, t); rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    r.connect(rg); rg.connect(out); r.start(t); r.stop(t + 0.55);
  } catch (e) {}
}

async function duCoUlt(u, tok) {
  const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
  const W = f.clientWidth, H = f.clientHeight;
  const es0 = foesOf(u).filter(e => e.alive); if (!es0.length) return;
  const allies = alliesOf(u).filter(a => a.alive);
  const made = [], timers = [], oldZ = u.el.style.zIndex;
  const at = (ms, fn) => timers.push(setTimeout(() => { if (tok === battleToken) fn(); }, seqT(ms)));
  const add = (cls, x, y) => { const d = document.createElement('div'); d.className = cls; d.style.left = x + '%'; d.style.top = y + '%'; box.appendChild(d); made.push(d); return d; };
  const heroSide = u.side === 'hero';
  // --- chọn mục tiêu: mỗi thanh kiếm 1 địch (khác nhau; ít địch hơn số kiếm thì lặp lại) ---
  const nSw = Math.max(1, Math.floor(DUCO_TWISTERS)), pool = es0.slice().sort(() => Math.random() - 0.5);
  const targets = Array.from({ length: nSw }, (_, i) => pool[i % pool.length]);
  const per = u.atk * DUCO_MULT * (u.sk || 1);
  // --- điểm xuất phát của kiếm: chỗ Thần Thú phía trên đầu tướng (không có thần thú thì góc trên phía mình) ---
  const bst = f.querySelector('.bf-bst.' + (heroSide ? 'l' : 'r'));
  let sx = W * (heroSide ? 0.12 : 0.88), sy = H * 0.1;
  if (bst) { const a = f.getBoundingClientRect(), b = bst.getBoundingClientRect(); sx = b.left + b.width / 2 - a.left; sy = b.top + b.height / 2 - a.top; }
  const SW = Math.round(Math.max(140, Math.min(175, W * 0.4))), SH = Math.round(SW * SEQ.dcSword.ch / SEQ.dcSword.cw), FR = 46;   // FR = ms mỗi khung kiếm
  const castW = Math.round(SEQ.dcCast.cw * SEQ_IDLE[3].h / SEQ.dcIdle.ch), CFR = 86;                                           // cùng tỉ lệ người với dáng đứng
  const cast = seqOverlay(u, SEQ.dcCast, castW);
  try {
    u.el.style.zIndex = 95;
    // 1. Trận pháp tím dưới chân + nhảy vọt lên cao (15 khung)
    const cw = Math.round(Math.min(300, W * 0.62)), circ = add('bf-dc-circle', u.x, u.y); circ.style.width = cw + 'px';
    circ.innerHTML = '<img src="assets/images/fx/doc-co-circle.webp?v=60" alt="">';
    circ.animate([{ opacity: 0, transform: 'translate(-50%,-34%) scale(.35)' }, { opacity: 1, transform: 'translate(-50%,-34%) scale(1)', offset: .25 }, { opacity: 1, transform: 'translate(-50%,-34%) scale(1.04)', offset: .8 }, { opacity: 0, transform: 'translate(-50%,-34%) scale(1.1)' }],
      { duration: seqT(2300) || 1, easing: 'ease-out', fill: 'forwards' });
    for (let i = 0; i < 15; i++) at(i * CFR, () => cast.show(i));
    // 2. 3 thanh kiếm từ trên trời cắm chéo xuống 3 địch, lần lượt cách nhau ~250ms
    const T0 = 700, STAG = 250, FLY = 10 * FR;
    const swords = targets.map((e, k) => (async () => {
      await sleep(T0 + k * STAG); if (tok !== battleToken) return;
      const tx = e.x / 100 * W, ty = e.y / 100 * H + 26;                      // mũi kiếm cắm xuống chân địch
      const el = add('bf-dc-sword' + (heroSide ? ' mir' : ''), e.x, 0); el.style.top = ty + 'px'; el.style.width = SW + 'px'; el.style.height = SH + 'px';
      const sc = seqEl(SEQ.dcSword, SW); el.appendChild(sc);
      for (let i = 0; i < 20; i++) setTimeout(() => { if (tok === battleToken) sc.show(i); }, seqT(i * FR));
      const dx = sx - tx, dy = sy - ty + SH * 0.5, base = 'translate(-50%,-92%)';
      sfxSwordFly();
      // bay chéo từ chỗ Thần Thú xuống địch (10 khung đầu: thu nhỏ → bình thường), rồi PHÓNG TO khi cắm (khung 10-13), giữ & tan (14-19)
      el.animate([
        { transform: `translate(calc(-50% + ${dx}px),calc(-92% + ${dy}px)) scale(.45)`, opacity: .2 },
        { transform: `translate(calc(-50% + ${dx * 0.55}px),calc(-92% + ${dy * 0.55}px)) scale(.75)`, opacity: 1, offset: .35 },
        { transform: base + ' scale(1)', opacity: 1, offset: 1 }
      ], { duration: seqT(FLY) || 1, easing: 'cubic-bezier(.45,0,.9,.55)', fill: 'forwards' });
      await sleep(FLY); if (tok !== battleToken) return;
      el.animate([{ transform: base + ' scale(1)' }, { transform: base + ' scale(1.35)' }], { duration: seqT(4 * FR) || 1, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'forwards' });
      sfxSwordStab(); f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 150);
      if (e.alive) {
        skillHit(e, per, u);
        const fl = add('bf-bflash', e.x, e.y); fl.style.setProperty('--fc', '#a855f7'); setTimeout(() => fl.remove(), 450);
        if (e.alive) { pctMod(e, 'spd', -DUCO_SPD_DOWN, DUCO_TURNS, 'debuff', 'duco'); floatText(e, '⚡ TỐC -' + Math.round(DUCO_SPD_DOWN * 100) + '%'); }
        refreshPanel();
      }
      await sleep(4 * FR + 6 * FR); if (tok !== battleToken) return;
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: seqT(300) || 1, fill: 'forwards' });
    })());
    await Promise.all(swords); if (tok !== battleToken) return;
    // 3. Cả đội ta tăng Tốc
    allies.filter(a => a.alive).forEach((a, i) => {
      pctMod(a, 'spd', DUCO_SPD_UP, DUCO_TURNS, 'buff', 'duco');
      setTimeout(() => { if (a.el.isConnected) floatText(a, '⚡ TỐC +' + Math.round(DUCO_SPD_UP * 100) + '%'); }, seqT(i * 140));
      const w = add('bf-wave', a.x, a.y); w.style.borderColor = '#c084fc'; w.style.boxShadow = '0 0 22px #a855f7, inset 0 0 22px #c084fc'; setTimeout(() => w.remove(), 650);
    });
    refreshPanel();
    await sleep(700); if (tok !== battleToken) return;
  } finally {
    timers.forEach(clearTimeout); cast.end();
    made.forEach(d => d.remove());
    u.el.getAnimations().forEach(a => a.cancel());
    u.el.style.zIndex = oldZ;
  }
}

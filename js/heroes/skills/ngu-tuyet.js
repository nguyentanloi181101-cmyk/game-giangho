/* NGŨ TUYỆT: Bắc Cái (13) • Đông Tà (14) • Tây Độc (15) • Nam Đế (16) • Vương Trùng Dương (17)
   Tăng/giảm chỉ số dùng addMod (engine.js): hết hạn tự trả lại đúng số đã cộng/trừ. */

    // Bộ dựng chung cho các chiêu: sân đấu, kích thước, danh sách địch/ta còn sống, tạo hiệu ứng tạm
    function nt(u) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units'), made = [];
      const es = () => foesOf(u).filter(e => e.alive), as = () => alliesOf(u).filter(a => a.alive);
      const box0 = list => { const xs = list.map(e => e.x), ys = list.map(e => e.y); return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }; };
      const mk = (cls, txt, x, y) => { const d = document.createElement('div'); d.className = cls; if (txt) d.innerHTML = txt; d.style.left = x + '%'; d.style.top = y + '%'; box.appendChild(d); made.push(d); return d; };
      const ring = (x, y, c) => { const w = mk('bf-wave', '', x, y); w.style.borderColor = c; w.style.boxShadow = '0 0 24px ' + c + ', inset 0 0 24px ' + c; setTimeout(() => w.remove(), 650); };
      const shake = () => { f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 130); };
      return { f, box, W: f.clientWidth, H: f.clientHeight, made, es, as, box0, mk, ring, shake, base: 'translate(-50%,-50%)' };
    }
    // Đổi 1 chỉ số theo % hiện có (âm = giảm). Chỉ số "block" (Đỡ đòn %) không vượt 100.
    function pctMod(t, k, pct, turns, kind, tag) {
      if (typeof t[k] !== 'number' || !isFinite(t[k])) return 0;
      let d = Math.round(t[k] * pct); if (k === 'block' && d > 0) d = Math.min(d, 100 - (t.block || 0));
      if (k === 'atk' && d < 0) d = Math.max(d, -(t.atk - 1));
      addMod(t, k, d, turns, kind, tag); return d;
    }
    const sayLater = (t, txt, ms) => setTimeout(() => { if (t.el.isConnected) floatText(t, txt); }, ms || 300);

    // ---------- BẮC CÁI: bay qua đội hình địch, phóng 18 cây tre từ góc chéo trên xuống ----------
    async function bacCaiUlt(u, tok) {
      const g = nt(u), { f, W, H, base, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0), landX = u.side === 'hero' ? Math.min(94, b.maxX + 9) : Math.max(6, b.minX - 9), landY = b.cy;
      const dx = (landX - u.x) * W / 100, dy = (landY - u.y) * H / 100, oldZ = u.el.style.zIndex;
      const mid = `translate(calc(-50% + ${dx / 2}px),calc(-50% + ${dy / 2 - 130}px))`, land = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      const per = u.atk * BC_MULT * (u.sk || 1) / BC_HITS, dir = u.side === 'hero' ? 1 : -1;
      try {
        u.el.style.zIndex = 99;
        u.el.animate([{ transform: base }, { transform: mid, offset: .5 }, { transform: land }], { duration: 650, easing: 'ease-in-out', fill: 'forwards' });
        await sleep(680); if (tok !== battleToken) return;
        g.ring(landX, landY, '#84cc16');
        for (let k = 0; k < BC_HITS; k++) {
          const es = g.es(); if (!es.length) break;
          const tx = Math.max(6, Math.min(94, b.cx + (Math.random() - 0.5) * (b.maxX - b.minX + 16))), ty = Math.max(12, Math.min(88, b.cy + (Math.random() - 0.5) * (b.maxY - b.minY + 18)));
          const r = g.mk('bf-bamboo', '', tx, ty), sx = dir * 170, sy = -430;
          r.style.setProperty('--r', (dir * 21) + 'deg');
          r.animate([{ transform: `translate(calc(-50% + ${sx}px),calc(-50% + ${sy}px)) rotate(${dir * 21}deg)`, opacity: 0 }, { opacity: 1, offset: .15 },
                     { transform: `translate(-50%,-50%) rotate(${dir * 21}deg)`, opacity: 1 }], { duration: 230, easing: 'ease-in', fill: 'forwards' });
          setTimeout(() => { if (tok !== battleToken) return; g.ring(tx, ty, '#a3e635'); g.es().forEach(e => skillHit(e, per, u)); if (k % 3 === 0) g.shake(); setTimeout(() => r.remove(), 120); }, 230);
          await sleep(75); if (tok !== battleToken) return;
        }
        await sleep(420); if (tok !== battleToken) return;
        g.es().forEach(e => { const d = pctMod(e, 'def', -BC_DEF_DOWN, BC_TURNS, 'debuff', 'bc'); sayLater(e, '🛡️ THỦ -' + Math.round(BC_DEF_DOWN * 100) + '%'); });
        g.as().forEach(a => { if (noBuff(a)) { floatText(a, '🚫 KHÓA TĂNG PHÚC'); return; } pctMod(a, 'atk', BC_ATK_UP, BC_TURNS, 'buff', 'bc'); sayLater(a, '⚔️ CÔNG +' + Math.round(BC_ATK_UP * 100) + '%'); });
        refreshPanel(); await sleep(450); if (tok !== battleToken) return;
        u.el.getAnimations().forEach(a => a.cancel());
        u.el.animate([{ transform: land }, { transform: mid, offset: .5 }, { transform: base }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' });
        await sleep(480);
      } finally { made.forEach(d => d.remove()); u.el.getAnimations().forEach(a => a.cancel()); u.el.style.zIndex = oldZ; }
    }

    // ---------- ĐÔNG TÀ: nhảy lên cao thổi sóng âm 4 lần ----------
    async function dongTaUlt(u, tok) {
      const g = nt(u), { H, base, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0), oldZ = u.el.style.zIndex, up = `translate(-50%,calc(-50% - ${Math.round(H * 0.2)}px))`, per = u.atk * DT_MULT * (u.sk || 1) / DT_HITS;
      try {
        u.el.style.zIndex = 99;
        u.el.animate([{ transform: base }, { transform: up }], { duration: 420, easing: 'ease-out', fill: 'forwards' });
        await sleep(450); if (tok !== battleToken) return;
        u.el.animate([{ transform: up, filter: 'drop-shadow(0 0 0 #a3e635)' }, { transform: up, filter: 'drop-shadow(0 0 16px #bef264)' }], { duration: 300, fill: 'forwards' });
        const sy = u.y - (H * 0.2) / H * 100;
        for (let k = 0; k < DT_HITS; k++) {
          const es = g.es(); if (!es.length) break;
          const w = g.mk('bf-sonic', '🎵', u.x, Math.max(4, sy)), tx = b.cx - u.x, ty = b.cy - Math.max(4, sy);
          const Wd = g.W / 100, Hd = H / 100;
          w.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { opacity: .95, offset: .2 },
                     { transform: `translate(calc(-50% + ${tx * Wd}px),calc(-50% + ${ty * Hd}px)) scale(2.6)`, opacity: 0.15 }], { duration: 520, easing: 'ease-out', fill: 'forwards' });
          await sleep(430); if (tok !== battleToken) return;
          g.ring(b.cx, b.cy, '#bef264'); g.shake(); g.es().forEach(e => skillHit(e, per, u)); setTimeout(() => w.remove(), 150);
          await sleep(190); if (tok !== battleToken) return;
        }
        g.es().forEach(e => { pctMod(e, 'crit', -DT_CRIT, DT_TURNS, 'debuff', 'dt'); sayLater(e, '💥 BẠO -' + Math.round(DT_CRIT * 100) + '%'); });
        g.as().forEach(a => { if (noBuff(a)) { floatText(a, '🚫 KHÓA TĂNG PHÚC'); return; } pctMod(a, 'crit', DT_CRIT, DT_TURNS, 'buff', 'dt'); sayLater(a, '💥 BẠO +' + Math.round(DT_CRIT * 100) + '%'); });
        refreshPanel(); await sleep(450); if (tok !== battleToken) return;
        u.el.getAnimations().forEach(a => a.cancel());
        u.el.animate([{ transform: up }, { transform: base }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
        await sleep(350);
      } finally { made.forEach(d => d.remove()); u.el.getAnimations().forEach(a => a.cancel()); u.el.style.zIndex = oldZ; }
    }

    // ---------- TÂY ĐỘC: triệu hồi cóc độc phun độc qua đội địch ----------
    async function tayDocUlt(u, tok) {
      const g = nt(u), { W, H, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0), dir = u.side === 'hero' ? 1 : -1, tx0 = Math.max(6, Math.min(94, u.x + dir * 12)), ty0 = u.y;
      try {
        const toad = g.mk('bf-toad', '🐸', tx0, ty0);
        toad.animate([{ transform: 'translate(-50%,-50%) scale(0) rotate(-30deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 1, offset: .6 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 500, fill: 'forwards' });
        g.ring(tx0, ty0, '#84cc16'); await sleep(620); if (tok !== battleToken) return;
        toad.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.35,.8)', offset: .5 }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 420 });
        for (let i = 0; i < 26; i++) {   // luồng độc phun qua đội hình địch
          const p = g.mk('bf-venom', '', tx0, ty0), ex = b.minX + Math.random() * (b.maxX - b.minX + 8) - 2, ey = b.minY + Math.random() * (b.maxY - b.minY + 10) - 3;
          const dx = (ex - tx0) * W / 100, dy = (ey - ty0) * H / 100, s = 0.7 + Math.random() * 1.1;
          p.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { transform: `translate(calc(-50% + ${dx * 0.5}px),calc(-50% + ${dy * 0.5 - 40}px)) scale(${s})`, opacity: 1, offset: .5 },
                     { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${s * 1.6})`, opacity: 0 }], { duration: 650 + Math.random() * 250, delay: i * 28, easing: 'ease-out', fill: 'forwards' });
        }
        await sleep(900); if (tok !== battleToken) return;
        g.es().forEach(e => {
          g.ring(e.x, e.y, '#a3e635');
          pctMod(e, 'def', -TD_DEF_DOWN, TD_TURNS, 'debuff', 'td'); pctMod(e, 'spd', -TD_SPD_DOWN, TD_TURNS, 'debuff', 'td');
          floatText(e, '☠️ TRÚNG ĐỘC'); sayLater(e, '🛡️ THỦ -' + Math.round(TD_DEF_DOWN * 100) + '%', 260); sayLater(e, '⚡ TỐC -' + Math.round(TD_SPD_DOWN * 100) + '%', 520);
          const cut = Math.max(1, Math.round(e.hp * TD_HP_DOWN)); setTimeout(() => { if (e.alive) { hit(e, cut, true, u, true); floatText(e, '💔 -' + Math.round(TD_HP_DOWN * 100) + '% MÁU'); } }, 360);   // mất 50% máu hiện tại (bỏ qua giáp)
        });
        g.shake(); refreshPanel(); await sleep(1000); if (tok !== battleToken) return;
        toad.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }); await sleep(320);
      } finally { made.forEach(d => d.remove()); }
    }

    // ---------- NAM ĐẾ: chưởng ấn chữ Vạn (Phật Như Lai) rơi từ trời xuống ----------
    async function namDeUlt(u, tok) {
      const g = nt(u), { H, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0);
      try {
        u.el.animate([{ filter: 'drop-shadow(0 0 0 #fde047)' }, { filter: 'drop-shadow(0 0 18px #fde047)' }, { filter: 'drop-shadow(0 0 0 #fde047)' }], { duration: 700 });
        const halo = g.mk('bf-wan-halo', '', b.cx, b.cy); halo.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 700, fill: 'forwards' });
        const palm = g.mk('bf-wan', '<span>卍</span>', b.cx, b.cy);
        palm.animate([{ transform: `translate(-50%,calc(-50% - ${H}px)) scale(.5)`, opacity: 0 }, { opacity: 1, offset: .2 },
                      { transform: 'translate(-50%,-50%) scale(1.5)', opacity: 1, offset: .75 }, { transform: 'translate(-50%,-50%) scale(1.25)', opacity: 1 }], { duration: 1050, easing: 'ease-in', fill: 'forwards' });
        await sleep(900); if (tok !== battleToken) return;
        g.ring(b.cx, b.cy, '#fde047'); g.shake(); setTimeout(() => g.ring(b.cx, b.cy, '#f59e0b'), 160);
        g.es().forEach(e => { MOD_STATS.forEach(k => pctMod(e, k, -ND_ALL_DOWN, ND_TURNS, 'debuff', 'nd:' + k)); floatText(e, '卍 ẤN PHONG'); sayLater(e, '⬇ TẤT CẢ -' + Math.round(ND_ALL_DOWN * 100) + '%', 280); });
        refreshPanel(); await sleep(1100); if (tok !== battleToken) return;
        palm.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: 'forwards' }); halo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: 'forwards' }); await sleep(440);
      } finally { made.forEach(d => d.remove()); }
    }

    // ---------- VƯƠNG TRÙNG DƯƠNG: Thái Cực bát quái, đội tăng 300% mọi thuộc tính ----------
    async function vtdUlt(u, tok) {
      const g = nt(u), { made } = g, as = g.as(); if (!as.length) return;
      const b = g.box0(as);
      try {
        const tc = g.mk('bf-taiji', '☯', b.cx, Math.max(8, b.minY - 8));
        tc.animate([{ transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3) rotate(360deg)', opacity: 1, offset: .6 }, { transform: 'translate(-50%,-50%) scale(1.1) rotate(540deg)', opacity: 1 }], { duration: 1100, easing: 'ease-out', fill: 'forwards' });
        await sleep(900); if (tok !== battleToken) return;
        as.forEach((a, i) => setTimeout(() => {
          if (!a.alive) return;
          if (noBuff(a)) { floatText(a, '🚫 KHÓA TĂNG PHÚC'); return; }
          g.ring(a.x, a.y, '#60a5fa'); MOD_STATS.forEach(k => pctMod(a, k, VTD_ALL_UP, VTD_TURNS, 'buff', 'vtd:' + k));
          floatText(a, '☯ TẤT CẢ +' + Math.round(VTD_ALL_UP * 100) + '%'); refreshPanel();
        }, i * 140));
        await sleep(as.length * 140 + 900); if (tok !== battleToken) return;
        tc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: 'forwards' }); await sleep(400);
      } finally { made.forEach(d => d.remove()); }
    }

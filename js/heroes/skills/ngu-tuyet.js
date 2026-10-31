/* NGŨ TUYỆT: Bắc Cái (13) • Đông Tà (14) • Tây Độc (15) • Nam Đế (16) • Vương Trùng Dương (17)
   Tăng/giảm chỉ số dùng addMod (engine.js): hết hạn tự trả lại đúng số đã cộng/trừ. */

    const BC_IMG = 'assets/images/fx/bac-cai-bamboo.webp';   // ảnh cây tre Bắc Cái (Đả Cẩu Bổng)
    ['assets/images/fx/dt-notes.webp', 'assets/images/fx/td-toad3d.webp', 'assets/images/fx/td-coin.webp', 'assets/images/fx/bac-cai-bamboo.webp', 'assets/images/fx/vtd-taiji-vortex.webp', 'assets/images/fx/vtd-taiji-core.webp'].forEach(src => { const im = new Image(); im.src = src; });   // nạp sẵn để lần đầu thi triển không bị giật

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
          // Tre 3D: đội TRÁI (hero) rơi từ trên-trái xuống địch; đội PHẢI rơi từ trên-phải xuống ta. Trục tre nghiêng ~25° nên rơi đúng theo trục.
          const hh = Math.round(Math.max(140, Math.min(220, H * 0.42))), fall = Math.round(Math.max(280, Math.min(520, H * 0.9)));
          const sx = -dir * Math.round(fall * 0.466), sy = -fall;
          const r = g.mk('bf-bamboo3d' + (dir > 0 ? ' mir' : ''), '<i class="bt-trail"></i><img src="' + BC_IMG + '" alt="">', tx, ty);
          r.style.height = hh + 'px'; r.style.width = Math.round(hh * 0.645) + 'px'; r.style.setProperty('--lean', (-dir * 25) + 'deg');
          const T = (x, y, ry, sc) => `perspective(700px) translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotateY(${ry}deg) scale(${sc})`;
          r.animate([{ transform: T(sx, sy, -dir * 70, .65), opacity: 0 }, { opacity: 1, offset: .2 },
                     { transform: T(0, 0, 0, 1.12), opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.35,0,.85,.55)', fill: 'forwards' });
          setTimeout(() => {
            if (tok !== battleToken) return;
            g.ring(tx, ty, '#bef264');
            g.es().forEach(e => skillHit(e, per, u)); if (k % 3 === 0) g.shake();
            if (k % 2 === 0) for (let j = 0; j < 3; j++) {   // lá tre bung ra khi chạm đất
              const lf = g.mk('bf-leaf', '🍃', tx, ty), a = Math.random() * Math.PI * 2, d = 24 + Math.random() * 36;
              lf.animate([{ transform: 'translate(-50%,-50%) scale(.6) rotate(0deg)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d - 22}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: 520, easing: 'ease-out', fill: 'forwards' });
              setTimeout(() => lf.remove(), 540);
            }
            r.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }); setTimeout(() => r.remove(), 190);
          }, 380);
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
        // 2 dải nhạc vàng bay từ Đông Tà sang, rồi lượn vòng 3D (hai quỹ đạo nghiêng khác nhau, ngược chiều) quanh đội địch; mỗi nhịp gây sát thương 1 lần
        const sy = Math.max(4, u.y - (H * 0.2) / H * 100), Rr = Math.round(Math.max(80, (b.maxX - b.minX) * g.W / 200 + 90)), IW = Math.round(Math.max(120, Math.min(g.W * 0.26, 220)));
        const mkRing = (cls) => `<div class="nt-ring ${cls}"><div class="nt-spin"><div class="nt-item"><img src="assets/images/fx/dt-notes.webp" alt=""></div></div></div>`;
        const notes = g.mk('bf-notes3d', mkRing('r1') + mkRing('r2'), b.cx, b.cy);
        notes.style.setProperty('--R', Rr + 'px'); notes.style.setProperty('--iw', IW + 'px');
        const fx = (u.x - b.cx) * g.W / 100, fy = (sy - b.cy) * H / 100;
        notes.animate([{ transform: `translate(calc(-50% + ${fx}px),calc(-50% + ${fy}px)) scale(.25)`, opacity: 0 }, { opacity: 1, offset: .4 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 480, easing: 'ease-out', fill: 'forwards' });
        await sleep(480); if (tok !== battleToken) return;
        for (let k = 0; k < DT_HITS; k++) {
          const es = g.es(); if (!es.length) break;
          await sleep(430); if (tok !== battleToken) return;
          g.ring(b.cx, b.cy, '#fde047'); g.shake();
          es.forEach(e => {
            skillHit(e, per, u); g.ring(e.x, e.y, '#bef264');
            const n = g.mk('bf-sonic', ['🎵', '🎶'][k % 2], e.x, e.y);
            n.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 1 }, { transform: `translate(calc(-50% + ${(Math.random() - .5) * 50}px),calc(-50% - 60px)) scale(1.5)`, opacity: 0 }], { duration: 600, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => n.remove(), 620);
          });
          await sleep(190); if (tok !== battleToken) return;
        }
        notes.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: 'forwards' });
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
      const b = g.box0(es0), dir = u.side === 'hero' ? 1 : -1, tx0 = Math.max(6, Math.min(94, u.x + dir * 14)), ty0 = Math.max(18, Math.min(82, u.y - 4));
      try {
        // Cóc ngọc 3D (ảnh thật): thân thở/lắc lư theo chiều sâu, mắt đỏ phát sáng, tiền vàng xoay quanh. Đội phải thì lật ảnh để cóc nhìn về phía ta.
        const TW = Math.round(Math.max(150, Math.min(W * 0.34, H * 0.62))), TH = Math.round(TW / 1.5);
        const coins = Array.from({ length: 6 }, (_, i) => `<b style="--i:${i}"></b>`).join('');
        const toad = g.mk('bf-toad3d' + (dir > 0 ? '' : ' mir'), `<div class="td-glow"></div><div class="td-ground"><i></i><i></i></div><div class="td-orbit"><div class="td-orbit-spin">${coins}</div></div><div class="td-stage"><div class="td-body"></div><i class="td-eye" style="left:56%;top:16.6%"></i><i class="td-eye" style="left:73.8%;top:19.7%"></i></div>`, tx0, ty0);
        toad.style.width = TW + 'px'; toad.style.height = TH + 'px'; toad.style.setProperty('--w', TW + 'px');
        toad.animate([{ transform: 'translate(-50%,-50%) scale(0)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 1, offset: .6 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 500, fill: 'forwards' });
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

    // ---------- VƯƠNG TRÙNG DƯƠNG: Thái Cực bát quái 3D (lốc xoáy âm dương), đội tăng 300% mọi thuộc tính ----------
    // Lốc xoáy cắt thành 14 lát ngang, mỗi lát lắc lư lệch pha theo chiều sâu (translateZ) → nhìn như xoáy 3D; lõi Thái Cực xoay như đồng xu; vòng Bát Quái quay quanh; vòng sáng vàng loang dưới đất.
    async function vtdUlt(u, tok) {
      const g = nt(u), { W, H, made } = g, as = g.as(); if (!as.length) return;
      const b = g.box0(as), S = Math.round(Math.max(170, Math.min(W * 0.55, H * 0.85))), N = 14, step = S / N;
      const hw = S * 0.5 / W * 100, cx = Math.max(hw + 1, Math.min(99 - hw, b.cx)), cy = Math.max(S * 0.5 / H * 100 + 2, Math.min(96 - S * 0.5 / H * 100, b.cy - 2));
      const strips = Array.from({ length: N }, (_, i) => {
        const t = i / (N - 1), amp = (4 + 9 * Math.sin(Math.PI * Math.min(1, t * 1.15))).toFixed(1);   // giữa/dưới lắc mạnh hơn, đỉnh/chân lắc nhẹ
        return `<i class="vt-strip" style="top:${(i * step).toFixed(1)}px;height:${(step + 5).toFixed(1)}px;background-size:${S}px ${S}px;background-position:0 -${(i * step).toFixed(1)}px;--a:${amp}%;animation-delay:-${(i * 0.17).toFixed(2)}s"></i>`;
      }).join('');
      const bagua = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'].map((c, i) => `<b style="--i:${i}">${c}</b>`).join('');
      const root = g.mk('bf-vtd3d', `<div class="vt-glow"></div><div class="vt-ground"><i></i><i></i><i></i></div><div class="vt-orbit"><div class="vt-orbit-spin">${bagua}</div></div><div class="vt-stage"><div class="vt-strips">${strips}</div><div class="vt-core"></div></div>`, cx, cy);
      root.style.setProperty('--s', S + 'px'); const iso = g.box.style.isolation; g.box.style.isolation = 'isolate';   // để lốc xoáy nằm SAU các tướng (z-index âm) mà vẫn trên nền sân
      try {
        root.animate([{ transform: 'translate(-50%,-50%) scale(.15,.05)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.08,1.12)', opacity: 1, offset: .65 }, { transform: 'translate(-50%,-50%) scale(1,1)', opacity: 1 }],
                     { duration: 900, easing: 'ease-out', fill: 'forwards' });
        g.ring(cx, Math.min(94, cy + S * 0.4 / H * 100), '#fde047');
        await sleep(900); if (tok !== battleToken) return;
        const cxp = cx * W / 100, cyp = (cy - S * 0.08 / H * 100) * H / 100;
        as.forEach((a, i) => setTimeout(() => {
          if (tok !== battleToken || !a.alive) return;
          const orb = g.mk('bf-vtd-orb', '', cx, cy - S * 0.08 / H * 100), dx = a.x * W / 100 - cxp, dy = a.y * H / 100 - cyp;
          orb.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1.2)`, opacity: 1 }], { duration: 420, easing: 'ease-in', fill: 'forwards' });
          setTimeout(() => {
            orb.remove(); if (tok !== battleToken || !a.alive) return;
            if (noBuff(a)) { floatText(a, '🚫 KHÓA TĂNG PHÚC'); return; }
            g.ring(a.x, a.y, '#fde047'); setTimeout(() => g.ring(a.x, a.y, '#60a5fa'), 90);
            MOD_STATS.forEach(k => pctMod(a, k, VTD_ALL_UP, VTD_TURNS, 'buff', 'vtd:' + k));
            floatText(a, '☯ TẤT CẢ +' + Math.round(VTD_ALL_UP * 100) + '%'); refreshPanel();
          }, 420);
        }, i * 140));
        await sleep(as.length * 140 + 1250); if (tok !== battleToken) return;
        root.animate([{ opacity: 1, transform: 'translate(-50%,-50%) scale(1,1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.6,1.25)' }], { duration: 480, fill: 'forwards' }); await sleep(500);
      } finally { made.forEach(d => d.remove()); g.box.style.isolation = iso; }
    }

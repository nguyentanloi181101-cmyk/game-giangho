/* NGŨ TUYỆT: Bắc Cái (13) • Đông Tà (14) • Tây Độc (15) • Nam Đế (16) • Vương Trùng Dương (17)
   Tăng/giảm chỉ số dùng addMod (engine.js): hết hạn tự trả lại đúng số đã cộng/trừ. */

    const BC_IMG = 'assets/images/fx/bac-cai-bamboo.webp';   // ảnh cây tre Bắc Cái (Đả Cẩu Bổng)
    // Chuỗi 13 khung hành động khi tung tuyệt kỹ (lưới 5 cột x 3 hàng, mỗi ô cw x ch px, k = hệ số phóng khi hiển thị)
    //  khung 0-4 chạy đà • 5-7 bật lên, vung gậy • 8-9 đập đất • 10-12 thu thế
    const BC_SEQ = { src: 'assets/images/heroes/bac-cai-ult.webp', cw: 280, ch: 200, cols: 5, k: 0.78 };
    { const im = new Image(); im.src = BC_SEQ.src; }
    ['assets/images/fx/dt-burst.webp', 'assets/images/fx/td-toad3d.webp', 'assets/images/fx/td-coin.webp', 'assets/images/fx/bac-cai-bamboo.webp', 'assets/images/fx/vtd-taiji-vortex.webp', 'assets/images/fx/vtd-taiji-core.webp'].forEach(src => { const im = new Image(); im.src = src; });   // nạp sẵn để lần đầu thi triển không bị giật

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
    // Phủ chuỗi khung lên tướng (ẩn ảnh thân thường trong lúc diễn). show(i, lật?) đổi khung; end() trả lại ảnh thân.
    function bcSeq(u) {
      const S = BC_SEQ, d = document.createElement('div'); d.className = 'bc-seq';
      d.style.width = S.cw * S.k + 'px'; d.style.height = S.ch * S.k + 'px';
      d.style.backgroundImage = 'url(' + S.src + ')'; d.style.backgroundSize = (S.cw * S.cols * S.k) + 'px ' + (S.ch * 3 * S.k) + 'px';
      u.el.appendChild(d);
      const bodies = u.el.querySelectorAll('.hero-body, .hero-img, .bf-emo'); bodies.forEach(b => { b.style.visibility = 'hidden'; });
      const api = {
        show(i, flip) {   // ảnh gốc quay mặt sang PHẢI: đội trái giữ nguyên, đội phải lật
          if (flip === undefined) flip = u.side !== 'hero';
          d.style.backgroundPosition = (-(i % S.cols) * S.cw * S.k) + 'px ' + (-Math.floor(i / S.cols) * S.ch * S.k) + 'px';
          d.style.transform = 'translateX(-50%) scaleX(' + (flip ? -1 : 1) + ')';
        },
        end() { d.remove(); bodies.forEach(b => { b.style.visibility = ''; }); }
      };
      api.show(0); return api;
    }
    async function bacCaiUlt(u, tok) {
      const g = nt(u), { f, W, H, base, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0), landX = u.side === 'hero' ? Math.min(94, b.maxX + 9) : Math.max(6, b.minX - 9), landY = b.cy;
      const dx = (landX - u.x) * W / 100, dy = (landY - u.y) * H / 100, oldZ = u.el.style.zIndex;
      const mid = `translate(calc(-50% + ${dx / 2}px),calc(-50% + ${dy / 2 - 130}px))`, land = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      const per = u.atk * BC_MULT * (u.sk || 1) / BC_HITS, dir = u.side === 'hero' ? 1 : -1;
      const seq = bcSeq(u), timers = [], at = (ms, i, flip) => timers.push(setTimeout(() => { if (tok === battleToken) seq.show(i, flip); }, seqT(ms)));
      try {
        u.el.style.zIndex = 99;
        u.el.animate([{ transform: base }, { transform: mid, offset: .5 }, { transform: land }], { duration: 650, easing: 'ease-in-out', fill: 'forwards' });
        [0, 80, 160, 240, 320, 400, 480, 560].forEach((ms, i) => at(ms, i));   // chạy đà → bật lên → vung gậy
        await sleep(680); if (tok !== battleToken) return;
        seq.show(8);                                                          // chạm đất, bung hào quang vàng
        at(120, 9); at(380, 10); at(640, 11); at(900, 12);                    // đập gậy → thu thế trong lúc tre rơi
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
        const back = u.side === 'hero';                                       // quay đầu chạy về: lật ngược hướng nhìn
        [1, 2, 1, 2].forEach((fr, i) => at(i * 110, fr, back));
        await sleep(480);
      } finally { timers.forEach(clearTimeout); seq.end(); made.forEach(d => d.remove()); u.el.getAnimations().forEach(a => a.cancel()); u.el.style.zIndex = oldZ; }
    }

    // ---------- ĐÔNG TÀ: nhảy lên cao thổi sóng âm 4 lần ----------
    async function dongTaUlt(u, tok) {
      const g = nt(u), { H, base, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0), oldZ = u.el.style.zIndex, per = u.atk * DT_MULT * (u.sk || 1) / DT_HITS;
      // Chuỗi 12 khung (SEQ.dtCast) phủ lên tướng: khung 0-3 nhảy lên • 4-10 xoáy vàng, thổi sáo • 11 đáp đất bung hào quang
      const cast = seqOverlay(u, SEQ.dtCast, 122), timers = [], fr = (ms, i) => timers.push(setTimeout(() => { if (tok === battleToken) cast.show(i); }, seqT(ms)));
      try {
        u.el.style.zIndex = 99;
        [0, 110, 220, 330].forEach((ms, i) => fr(ms, i));
        [4, 5, 6, 7, 8, 9, 10].forEach((fi, i) => fr(450 + i * 340, fi));
        await sleep(450); if (tok !== battleToken) return;
        // Mỗi nhịp: nốt nhạc vàng bung ra từ tâm (chữ ♪ lớn ở giữa) lan rộng khắp đội địch rồi tan biến; thêm nốt ♪ bắn tỏa tròn theo mọi hướng
        const BW = Math.round(Math.max(240, Math.min(g.W * 0.62, 520)));
        for (let k = 0; k < DT_HITS; k++) {
          const es = g.es(); if (!es.length) break;
          const tilt = (k % 2 ? -1 : 1) * 14;
          const bu = g.mk('bf-notesburst', '<img src="assets/images/fx/dt-burst.webp" alt="">', b.cx, b.cy);
          bu.style.width = BW + 'px'; bu.style.height = Math.round(BW / 1.4766) + 'px';
          const T = (sc, rz, rx) => `translate(-50%,-50%) perspective(800px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${sc})`;
          bu.animate([{ transform: T(.06, -tilt, 35), opacity: 0 }, { transform: T(.5, -tilt / 2, 22), opacity: 1, offset: .25 },
                      { transform: T(1.05, 0, 10), opacity: 1, offset: .6 }, { transform: T(1.3, tilt / 2, 0), opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' });
          for (let j = 0; j < 9; j++) {   // nốt nhỏ bắn ra từ tâm
            const n = g.mk('bf-nparticle', ['🎵', '🎶'][(j + k) % 2], b.cx, b.cy), an = (j / 9) * Math.PI * 2 + k * .35, d = BW * (.4 + Math.random() * .25);
            n.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { opacity: 1, offset: .2 },
                       { transform: `translate(calc(-50% + ${Math.cos(an) * d}px),calc(-50% + ${Math.sin(an) * d * .6}px)) scale(1.1) rotate(${(Math.random() - .5) * 60}deg)`, opacity: 0 }], { duration: 800, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => n.remove(), 820);
          }
          setTimeout(() => bu.remove(), 920);
          await sleep(300); if (tok !== battleToken) return;
          g.ring(b.cx, b.cy, '#fde047'); g.shake(); g.es().forEach(e => { skillHit(e, per, u); g.ring(e.x, e.y, '#bef264'); });
          await sleep(320); if (tok !== battleToken) return;
        }
        g.es().forEach(e => { pctMod(e, 'crit', -DT_CRIT, DT_TURNS, 'debuff', 'dt'); sayLater(e, '💥 BẠO -' + Math.round(DT_CRIT * 100) + '%'); });
        g.as().forEach(a => { if (noBuff(a)) { floatText(a, '🚫 KHÓA TĂNG PHÚC'); return; } pctMod(a, 'crit', DT_CRIT, DT_TURNS, 'buff', 'dt'); sayLater(a, '💥 BẠO +' + Math.round(DT_CRIT * 100) + '%'); });
        refreshPanel(); await sleep(450); if (tok !== battleToken) return;
        cast.show(11);   // đáp đất
        await sleep(350);
      } finally { timers.forEach(clearTimeout); cast.end(); made.forEach(d => d.remove()); u.el.getAnimations().forEach(a => a.cancel()); u.el.style.zIndex = oldZ; }
    }

    // ---------- TÂY ĐỘC: triệu hồi cóc độc phun độc qua đội địch ----------
    async function tayDocUlt(u, tok) {
      const g = nt(u), { W, H, made } = g, es0 = g.es(); if (!es0.length) return;
      const b = g.box0(es0), dir = u.side === 'hero' ? 1 : -1, tx0 = Math.max(6, Math.min(94, u.x + dir * 14)), ty0 = Math.max(18, Math.min(82, u.y - 4));
      const timers = [];
      try {
        // Cóc độc (chuỗi 12 khung): trồi từ đất lên (khung 1-5) → há miệng (6-7) → phun bong bóng độc (8-12). Đội phải thì lật để cóc nhìn về phía ta.
        const TW = Math.round(Math.max(150, Math.min(W * 0.36, H * 0.62))), sc = seqEl(SEQ.tdToad, TW), TH = parseInt(sc.style.height);
        const cx0 = Math.max(TW * 0.5 / W * 100, Math.min(100 - TW * 0.5 / W * 100, tx0 + dir * 0.12 * TW / W * 100)), cy0 = Math.max(TH * 0.5 / H * 100 + 1, u.y + 40 / H * 100 - TH * 0.5 / H * 100 + 3);
        const toad = g.mk('bf-seq-fx' + (dir > 0 ? '' : ' mir'), '', cx0, cy0); toad.style.width = TW + 'px'; toad.style.height = TH + 'px'; toad.appendChild(sc);
        const mx0 = cx0 + dir * 0.03 * TW / W * 100, my0 = cy0 - 0.3 * TH / H * 100;   // miệng cóc: nơi bong bóng độc bắn ra
        toad.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: 'forwards' });
        for (let i = 0; i < 12; i++) timers.push(setTimeout(() => { if (tok === battleToken) sc.show(i); }, seqT(i * 110)));
        g.ring(tx0, ty0, '#84cc16'); await sleep(770); if (tok !== battleToken) return;
        for (let i = 0; i < 26; i++) {   // luồng độc phun qua đội hình địch
          const p = g.mk('bf-venom', '', mx0, my0), ex = b.minX + Math.random() * (b.maxX - b.minX + 8) - 2, ey = b.minY + Math.random() * (b.maxY - b.minY + 10) - 3;
          const dx = (ex - mx0) * W / 100, dy = (ey - my0) * H / 100, s = 0.7 + Math.random() * 1.1;
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
      } finally { timers.forEach(clearTimeout); made.forEach(d => d.remove()); }
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

    // ---------- VƯƠNG TRÙNG DƯƠNG: tung Thái Cực (chuỗi 12 khung), lốc xoáy âm dương mở ra bên ĐỊCH, đội ta tăng 300% mọi thuộc tính ----------
    // Khung tung chiêu phủ lên tướng (hero-seq.js › seqOverlay) • lốc xoáy là chuỗi khung lặp (SEQ.vtdStorm) đặt giữa đội địch • cầu Thái Cực bay từ tướng sang từng đồng đội.
    async function vtdUlt(u, tok) {
      const g = nt(u), { W, H, made } = g, as = g.as(); if (!as.length) return;
      const es0 = g.es(), b = g.box0(es0.length ? es0 : as);
      const SW = Math.round(Math.max(190, Math.min(W * 0.5, H * 0.85))), SH = Math.round(SW * SEQ.vtdStorm.ch / SEQ.vtdStorm.cw), hw = SW * 0.5 / W * 100, hh = SH * 0.5 / H * 100;
      const cx = Math.max(hw + 1, Math.min(99 - hw, b.cx)), cy = Math.max(hh + 2, Math.min(98 - hh, b.cy - 3));
      const cast = seqOverlay(u, SEQ.vtdCast, 150), timers = [], oldZ = u.el.style.zIndex; let storm = null;
      try {
        u.el.style.zIndex = 99;
        for (let i = 0; i < 12; i++) timers.push(setTimeout(() => { if (tok === battleToken) cast.show(i); }, seqT(i * 110)));
        timers.push(setTimeout(() => {   // đĩa Thái Cực đã lên cao → lốc xoáy mở ra bên địch
          if (tok !== battleToken) return;
          storm = g.mk('bf-seq-fx', '', cx, cy); storm.style.width = SW + 'px'; storm.style.height = SH + 'px';
          const sc = seqEl(SEQ.vtdStorm, SW); sc.loop(1250); storm.appendChild(sc);
          storm.animate([{ transform: 'translate(-50%,-50%) scale(.15,.05)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.08,1.12)', opacity: 1, offset: .65 }, { transform: 'translate(-50%,-50%) scale(1,1)', opacity: 1 }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
          g.ring(cx, Math.min(94, cy + hh * 0.8), '#fde047');
        }, seqT(660)));
        await sleep(1350); if (tok !== battleToken) return;
        const ox = u.x, oy = Math.max(6, u.y - 9);   // đĩa Thái Cực trên đầu tướng
        as.forEach((a, i) => setTimeout(() => {
          if (tok !== battleToken || !a.alive) return;
          const orb = g.mk('bf-vtd-orb', '', ox, oy), dx = (a.x - ox) * W / 100, dy = (a.y - oy) * H / 100;
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
        if (storm) storm.animate([{ opacity: 1, transform: 'translate(-50%,-50%) scale(1,1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.6,1.25)' }], { duration: 480, fill: 'forwards' });
        await sleep(500);
      } finally { timers.forEach(clearTimeout); cast.end(); u.el.style.zIndex = oldZ; made.forEach(d => d.remove()); }
    }

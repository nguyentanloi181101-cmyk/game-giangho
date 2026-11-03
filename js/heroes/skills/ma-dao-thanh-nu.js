/* MA ĐAO THÁNH NỮ (id 0): tuyệt kỹ chém
   (tách từ index.html cũ — script) */

    // Hiệu ứng NỨT MÀN HÌNH: mỗi nhát chém bung ra 1 mạng vết nứt (tia chính + nhánh gấp khúc) tại điểm chém, các nhát sau chồng thêm lên
    function crackFx(f, W, H, px, py, strong, state) {
      const NS = 'http://www.w3.org/2000/svg';
      if (!state.svg) { const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('class', 'bf-crack'); sv.setAttribute('viewBox', `0 0 ${W} ${H}`); sv.setAttribute('preserveAspectRatio', 'none'); f.appendChild(sv); state.svg = sv; }
      const sv = state.svg, R = Math.max(W, H), rnd = (a, b) => a + Math.random() * (b - a);
      const jag = (x, y, ang, len, wid, depth) => {                 // 1 vết nứt gấp khúc + nhánh con
        let d = `M${x.toFixed(1)} ${y.toFixed(1)}`, cx = x, cy = y, a = ang, run = 0; const pts = [];
        while (run < len) {
          const st = rnd(14, 30); a += rnd(-0.38, 0.38); cx += Math.cos(a) * st; cy += Math.sin(a) * st; run += st;
          d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`; pts.push([cx, cy, a, run]);
        }
        const path = document.createElementNS(NS, 'path'); path.setAttribute('d', d); path.style.strokeWidth = wid;
        sv.appendChild(path);
        const L = path.getTotalLength ? path.getTotalLength() : len; path.style.strokeDasharray = L;
        path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 110, easing: 'ease-out', fill: 'forwards' });
        if (depth < 2) pts.forEach(([bx, by, ba, r]) => { if (Math.random() < 0.28) jag(bx, by, ba + (Math.random() < 0.5 ? -1 : 1) * rnd(0.5, 1.1), len * rnd(0.25, 0.45) * (1 - r / len * 0.5), Math.max(0.6, wid * 0.55), depth + 1); });
      };
      const rays = strong ? 11 : 6, base = rnd(0, Math.PI * 2);
      for (let i = 0; i < rays; i++) jag(px, py, base + i * (Math.PI * 2 / rays) + rnd(-0.3, 0.3), R * (strong ? rnd(0.3, 0.6) : rnd(0.18, 0.4)), strong ? rnd(1.6, 2.6) : rnd(1.1, 1.9), 0);
      // điểm va chạm: vòng vỡ nhỏ
      const hub = document.createElementNS(NS, 'circle'); hub.setAttribute('cx', px); hub.setAttribute('cy', py); hub.setAttribute('r', strong ? 7 : 4);
      hub.setAttribute('fill', 'rgba(250,235,255,.85)'); sv.appendChild(hub);
      const fl = document.createElement('div'); fl.className = 'bf-crackflash'; fl.style.setProperty('--fx', px + 'px'); fl.style.setProperty('--fy', py + 'px'); f.appendChild(fl);
      fl.animate([{ opacity: strong ? 1 : .65 }, { opacity: 0 }], { duration: strong ? 380 : 220, easing: 'ease-out', fill: 'forwards' }); setTimeout(() => fl.remove(), 420);
    }

    // Ma Đao Thánh Nữ: nhảy qua đội hình địch (tiếng gió rít) -> dồn lực lơ lửng (đoạn lặng) -> 7 nhát chém tím KHỚP 7 nhịp đập trong tiếng -> nhảy về
    async function madaoUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)';
      const alive = () => foesOf(u).filter(e => e.alive);
      const es0 = alive(); if (!es0.length) return;
      const xs = es0.map(e => e.x), ys = es0.map(e => e.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const landX = u.side === 'hero' ? Math.min(94, Math.max(...xs) + 9) : Math.max(6, Math.min(...xs) - 9), landY = cy;
      const dx = (landX - u.x) * W / 100, dy = (landY - u.y) * H / 100;
      const mid = `translate(calc(-50% + ${dx / 2}px),calc(-50% + ${dy / 2 - 140}px))`, land = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      const made = [], oldZ = u.el.style.zIndex, crack = { svg: null }, quick = !!u.qRepeat, keep = !!u.qKeep;   // quick: đã đứng sẵn giữa đội địch -> chém tiếp ngay
      const per = u.atk * MADAO_MULT * (u.sk || 1) / MADAO_SLASHES;
      const ANG = [-32, 38, -62, 18, -80, 58, -8];                    // mỗi nhát một góc khác nhau -> đan chéo
      const spanX = (Math.max(...xs) - Math.min(...xs)) * W / 100 + 140, spanY = (Math.max(...ys) - Math.min(...ys)) * H / 100 + 140;
      const len = Math.max(190, Math.min(W * 0.85, Math.max(spanX, spanY) * 1.25));
      const t0 = performance.now(), at = ms => sleep(Math.max(0, t0 + ms - performance.now()));   // t0 = lúc tiếng bắt đầu phát
      try {
        // 1. 0.1s–0.9s: nhảy qua đầu đội hình địch, chạm đất đúng lúc tiếng gió rít cao nhất
        u.el.style.zIndex = 99;
        if (!quick) {
          await at(100); if (tok !== battleToken) return;
          u.el.animate([{ transform: base }, { transform: mid, offset: .5 }, { transform: land }], { duration: 800, easing: 'ease-in-out', fill: 'forwards' });
          await at(900); if (tok !== battleToken) return;
        }
        // 2. 0.9s–2.8s: dồn lực – hào quang tím rực dần, vòng sóng tím nổ đúng nhịp 1.55s
        if (!quick) u.el.animate([{ filter: 'brightness(1) drop-shadow(0 0 0 #a855f7)' }, { filter: 'brightness(1.5) drop-shadow(0 0 18px #a855f7)' }, { filter: 'brightness(1.9) drop-shadow(0 0 34px #c084fc)' }], { duration: 1850, fill: 'forwards' });
        const ring = (x, y) => { const w = document.createElement('div'); w.className = 'bf-wave'; w.style.left = x + '%'; w.style.top = y + '%'; w.style.borderColor = '#a855f7'; w.style.boxShadow = '0 0 24px #7e22ce, inset 0 0 24px #a855f7'; box.appendChild(w); setTimeout(() => w.remove(), 650); };
        ring(landX, landY);
        if (!quick) {
          await at(1550); if (tok !== battleToken) return;
          ring(landX, landY);
          await at(2860); if (tok !== battleToken) return;
        }
        const tS = quick ? performance.now() : 0, gapQ = k => tS + (k + 1) * 150;   // lần lặp: 7 nhát chém dồn dập, cách nhau 150ms
        // 3. 7 nhát chém tím, mỗi nhát rơi đúng 1 nhịp đập trong tiếng (2.9s … 4.1s)
        for (let k = 0; k < MADAO_SLASHES; k++) {
          const sl = document.createElement('div'); sl.className = 'bf-mdslash';
          sl.style.left = (cx + (Math.random() - 0.5) * 6) + '%'; sl.style.top = (cy + (Math.random() - 0.5) * 8) + '%';
          sl.style.width = len + 'px'; sl.style.setProperty('--r', (ANG[k % ANG.length] + (Math.random() - 0.5) * 8) + 'deg');
          box.appendChild(sl); made.push(sl); setTimeout(() => sl.remove(), 420);
          alive().forEach(e => skillHit(e, per, u));
          f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 120);
          crackFx(f, W, H, (cx + (Math.random() - 0.5) * 16) / 100 * W, (cy + (Math.random() - 0.5) * 20) / 100 * H, k === MADAO_SLASHES - 1, crack);   // nứt màn hình
          if (!alive().length) break;
          if (k < MADAO_SLASHES - 1) {
            if (quick) await sleep(Math.max(0, (gapQ(k) - performance.now()) / (ultTimeScale || 1)));
            else await at((MADAO_T[k + 1] || (MADAO_T[k] + MADAO_GAP)) - 30);
            if (tok !== battleToken) return;
          }
        }
        if (quick) await sleep(250); else await at(4450);
        if (tok !== battleToken) return;
        // 4. Nhảy về chỗ cũ khi tiếng tắt dần; vết nứt mờ dần rồi biến mất
        if (crack.svg) crack.svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, fill: 'forwards' });
        if (!keep) {
          u.el.getAnimations().forEach(a => a.cancel());
          u.el.animate([{ transform: land }, { transform: mid, offset: .5 }, { transform: base }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' });
          await sleep(480);
        }
      } finally {
        if (crack.svg) crack.svg.remove();
        made.forEach(d => d.remove());
        if (!keep) { u.el.getAnimations().forEach(a => a.cancel()); u.el.style.zIndex = oldZ; }
      }
    }

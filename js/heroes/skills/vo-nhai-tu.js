/* VÔ NHAI TỬ (id 11): tuyệt kỹ cờ vây
   (tách từ index.html cũ — script) */

    // Vô Nhai Tử: ném hủ cờ vây lên phía địch -> 1 bàn cờ lớn trùm cả đội địch, 5 quân cờ trắng/đen rơi từ trên xuống từng quân (nhanh)
    // Hiệp 2-4: choáng 3 địch 1 hiệp. Sau đó HOÁN ĐỔI với boss mạnh nhất: lần 1 nhận hết; lần sau so từng chỉ số với lần trước, lấy số cao hơn
    async function goUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)', made = [], oldZ = u.el.style.zIndex;
      const foes = foesOf(u).filter(e => e.alive);
      if (!foes.length) return;
      const allies = alliesOf(u).filter(h => h.alive);
      const boss = foes.reduce((b, e) => e.max > b.max ? e : b, foes[0]);        // boss mạnh nhất = nhiều HP tối đa nhất
      const dir = foes[0].x >= u.x ? 1 : -1;
      const xs = foes.map(e => e.x), ys = foes.map(e => e.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const own = u.gob || { atk: 0, def: 0, max: 0 };
      const orig = { atk: u.atk - own.atk, def: (u.def || 0) - own.def, max: u.max - own.max };   // chỉ số gốc của Vô Nhai Tử (không tính phần nhận từ boss)
      const round = curRound();
      const add = (cls, txt, x, y) => { const d = document.createElement('div'); d.className = cls; if (txt) d.textContent = txt; d.style.left = x + '%'; d.style.top = y + '%'; box.appendChild(d); made.push(d); return d; };
      try {
        u.el.style.zIndex = 95;
        // 1. Vung tay ném hủ cờ vây lên phía địch
        u.el.animate([{ transform: base }, { transform: `translate(calc(-50% + ${dir * 14}px),calc(-50% - 6px)) scale(1.12)` }, { transform: base }], { duration: 420, easing: 'ease-out' });
        await sleep(150); if (tok !== battleToken) return;
        const pot = add('bf-gopot', '', u.x, u.y - 4);
        const dx = (cx - u.x) * W / 100, dy = (cy - u.y) * H / 100;
        pot.animate([
          { transform: base + ' rotate(0deg)' },
          { transform: `translate(calc(-50% + ${dx / 2}px),calc(-50% + ${dy / 2 - 150}px)) rotate(200deg)`, offset: .5 },
          { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(420deg)` }
        ], { duration: 620, easing: 'ease-in-out', fill: 'forwards' });
        await sleep(640); if (tok !== battleToken) return;
        // 2. Hủ vỡ -> 1 bàn cờ lớn hiện ra trùm cả đội địch
        pot.remove();
        const wv = add('bf-wave', '', cx, cy); wv.style.borderColor = '#fde047'; wv.style.boxShadow = '0 0 24px #f59e0b, inset 0 0 24px #fde047'; setTimeout(() => wv.remove(), 650);
        {   // 1 bàn cờ lớn duy nhất trùm TOÀN BỘ đội địch (tính cả thân sprite của từng tướng, kể cả tướng đã gục)
          const all = foesOf(u).length ? foesOf(u) : foes;
          const px = all.map(e => e.x / 100 * W), py = all.map(e => e.y / 100 * H);
          const padX = 62, padTop = 62, padBot = 52;                       // nửa bề ngang sprite + thanh máu / đầu / chân
          let L = Math.min(...px) - padX, R = Math.max(...px) + padX;
          let T = Math.min(...py) - padTop, B = Math.max(...py) + padBot;
          L = Math.max(4, L); R = Math.min(W - 4, R); T = Math.max(4, T); B = Math.min(H - 4, B);   // không tràn ra ngoài sân đấu
          const bw = Math.max(160, R - L), bh = Math.max(120, B - T);        // kích thước THẤY ĐƯỢC của bàn cờ
          const cell = Math.max(18, Math.round(bw / 13));
          const b = add('bf-goboard', '', 0, 0);
          b.style.left = L + 'px'; b.style.top = (T + bh / 2 - bh) + 'px';  // phần tử cao bh*2 (bị ép scaleY .5) nên căn tâm theo bh
          b.style.width = bw + 'px'; b.style.height = (bh * 2) + 'px'; b.style.margin = '0';
          b.style.backgroundSize = `${cell}px ${cell}px,${cell}px ${cell}px,auto`;
          b.animate([{ opacity: 0, transform: 'scale(.2,.1)' }, { opacity: 1, transform: 'scale(1,.5)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
        }
        await sleep(300); if (tok !== battleToken) return;
        // 3. 5 quân cờ trắng/đen ngẫu nhiên rơi từ trên đầu xuống, từng quân nhanh
        const stones = Array.from({ length: GO_STONES }, () => ({ t: rand(foes), w: Math.random() < 0.5 }));
        await Promise.all(stones.map(async (st, k) => {
          await sleep(k * 120); if (tok !== battleToken) return;
          const e = st.t, sx = e.x + (Math.random() - 0.5) * 5, sy = e.y + (Math.random() - 0.5) * 3;
          const el = add('bf-gostone ' + (st.w ? 'w' : 'b'), '', sx, sy); el.style.top = `calc(${sy}% + 30px)`;
          const fall = -(sy / 100 * H + 90);
          el.animate([{ transform: base + ` translateY(${fall}px) scale(1.5)` }, { transform: base + ' translateY(0) scale(1)' }], { duration: 230, easing: 'cubic-bezier(.5,0,1,.6)', fill: 'both' });
          await sleep(230); if (tok !== battleToken) return;
          playGoStone();                                   // viên cờ chạm bàn -> 1 tiếng
          el.animate([{ transform: base + ' scale(1.3,.8)' }, { transform: base + ' scale(1)' }], { duration: 120, fill: 'both' });
          if (e.alive) hit(e, Math.max(1, Math.round(e.hp * GO_STONE_PCT)), false, u);
        }));
        await sleep(350); if (tok !== battleToken) return;
        // 4. Hiệp 2, 3, 4: choáng 3 địch ngẫu nhiên 1 hiệp
        if (GO_STUN_ROUNDS.includes(round)) {
          const pick = shuffled(foes.filter(e => e.alive)).slice(0, GO_STUN_COUNT);
          pick.forEach(e => { stunEnemy(e, Math.max(1, e.stun || 0)); floatText(e, '💫 CHOÁNG 1 HIỆP'); });
          if (pick.length) { await sleep(500); if (tok !== battleToken) return; }
        }
        // 5. Hoán đổi chỉ số với boss mạnh nhất
        if (boss.alive) {
          const sa = boss.atk, sd = boss.def || 0, sm = boss.max;
          floatText(boss, '⭐ HOÁN ĐỔI');
          allies.forEach((a, i) => {
            const o = add('bf-fxorb', rand(['⚫', '⚪']), boss.x, boss.y);
            o.animate([{ transform: base + ' scale(1.2)', opacity: 1 }, { transform: `translate(calc(-50% + ${(a.x - boss.x) * W / 100}px),calc(-50% + ${(a.y - boss.y) * H / 100}px)) scale(.8)`, opacity: 1 }], { duration: 650, delay: i * 90, easing: 'ease-in', fill: 'both' });
          });
          await sleep(700 + allies.length * 90); if (tok !== battleToken) return;
          allies.forEach(a => {
            const old = a.gob || { atk: 0, def: 0, max: 0 };
            const nw = { atk: Math.max(old.atk, sa), def: Math.max(old.def, sd), max: Math.max(old.max, sm) };   // lần 1 cao hơn -> giữ; lần 2 cao hơn -> lấy lần 2
            const dA = nw.atk - old.atk, dD = nw.def - old.def, dM = nw.max - old.max;
            a.atk += dA; a.def = (a.def || 0) + dD; a.max += dM; a.hp += dM; a.gob = nw; setHpBar(a);
            if (!dA && !dD && !dM) { if (a === u) floatText(a, '✋ GIỮ CHỈ SỐ LẦN TRƯỚC'); return; }
            let d = 0;
            if (dA) { floatText(a, '+' + formatNumber(dA) + ' CÔNG'); d += 220; }
            if (dD) setTimeout(() => floatText(a, '+' + formatNumber(dD) + ' THỦ'), d), d += 220;
            if (dM) setTimeout(() => floatText(a, '+' + formatNumber(dM) + ' HP'), d);
          });
          if (boss.alive) {                                                       // boss nhận chỉ số gốc của Vô Nhai Tử
            boss.atk = orig.atk; boss.def = orig.def; boss.max = orig.max; boss.hp = Math.min(boss.hp, boss.max); setHpBar(boss);
            floatText(boss, '🔄 HOÁN ĐỔI');
          }
          refreshPanel();
          await sleep(700); if (tok !== battleToken) return;
        }
        made.forEach(d => d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' }));   // bàn cờ + quân cờ mờ dần
        await sleep(300);
      } finally {
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
        u.el.style.zIndex = oldZ;
      }
    }

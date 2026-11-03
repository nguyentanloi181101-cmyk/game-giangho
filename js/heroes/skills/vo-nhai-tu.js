/* VÔ NHAI TỬ (id 11): tuyệt kỹ cờ vây
   (tách từ index.html cũ — script) */

    // Vô Nhai Tử: đứng TẠI CHỖ tung tuyệt kỹ (chuỗi SEQ.vntCast) -> 5 cây cờ Thái Cực phóng nhanh xuống đội địch, từng cây (chuỗi SEQ.vntFlag)
    // Sau đó SAO CHÉP chỉ số của boss mạnh nhất (boss giữ nguyên): lần 1 nhận hết; lần sau so từng chỉ số với lần trước, lấy số cao hơn
    async function goUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)', made = [], oldZ = u.el.style.zIndex;
      const foes = foesOf(u).filter(e => e.alive);
      if (!foes.length) return;
      const allies = alliesOf(u).filter(h => h.alive);
      const boss = foes.reduce((b, e) => e.max > b.max ? e : b, foes[0]);        // boss mạnh nhất = nhiều HP tối đa nhất
      const add = (cls, txt, x, y) => { const d = document.createElement('div'); d.className = cls; if (txt) d.textContent = txt; d.style.left = x + '%'; d.style.top = y + '%'; box.appendChild(d); made.push(d); return d; };
      const cast = seqOverlay(u, SEQ.vntCast, 190), timers = [];
      const at = (ms, fn) => timers.push(setTimeout(() => { if (tok === battleToken) fn(); }, seqT(ms)));
      try {
        u.el.style.zIndex = 95;
        // 1. Đứng yên tung chiêu: 15 khung, cờ bay lên rồi tỏa ra
        for (let i = 0; i < 15; i++) at(i * 80, () => cast.show(i));
        await sleep(900); if (tok !== battleToken) return;
        // 2. 5 cây cờ phóng nhanh xuống địch (mỗi cây chọn ngẫu nhiên 1 địch), từng cây cách nhau ~130ms
        const FW = 170, FH = Math.round(FW * SEQ.vntFlag.ch / SEQ.vntFlag.cw), FR = 46;   // FR = ms mỗi khung
        const strikes = Array.from({ length: tiaOf(u, GO_STONES) }, () => ({ t: rand(foes) }));   // số tia = số cờ, mỗi cờ vẫn 6% HP
        await Promise.all(strikes.map(async (st, k) => {
          await sleep(k * 130); if (tok !== battleToken) return;
          const e = st.t, sx = e.x + (Math.random() - 0.5) * 5, sy = e.y + (Math.random() - 0.5) * 3;
          const el = add('bf-seq-fx', '', sx, sy); el.style.top = `calc(${sy}% + 34px)`; el.style.width = FW + 'px'; el.style.height = FH + 'px'; el.style.transform = 'translate(-50%,-90%)';
          const sc = seqEl(SEQ.vntFlag, FW); el.appendChild(sc);
          for (let i = 0; i < 15; i++) setTimeout(() => { if (tok === battleToken) sc.show(i); }, seqT(i * FR));
          sc.animate([{ transform: 'translateY(-300px)', opacity: .2 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 5 * FR, easing: 'cubic-bezier(.5,0,1,.6)', fill: 'both' });   // phóng từ trên xuống trong 5 khung đầu
          await sleep(5 * FR); if (tok !== battleToken) return;
          playGoStone();                                   // cờ cắm xuống -> 1 tiếng
          if (e.alive) hit(e, Math.max(1, Math.round(e.hp * GO_STONE_PCT)), false, u);
          await sleep(10 * FR); if (tok !== battleToken) return;
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
        }));
        cast.end();
        await sleep(350); if (tok !== battleToken) return;
        // 4. Sao chép chỉ số của boss mạnh nhất (boss không đổi)
        if (boss.alive) {
          const sa = boss.atk, sd = boss.def || 0, sm = boss.max;
          floatText(boss, '⭐ SAO CHÉP');
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
          refreshPanel();
          await sleep(700); if (tok !== battleToken) return;
        }
        made.forEach(d => d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' }));   // hiệu ứng mờ dần
        await sleep(300);
      } finally {
        timers.forEach(clearTimeout); cast.end();
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(x => x.cancel());
        u.el.style.zIndex = oldZ;
      }
    }

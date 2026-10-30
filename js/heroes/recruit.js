/* CHIÊU MỘ
   (tách từ index.html cũ — script) */

    // ================= CHIÊU MỘ =================
    // Phổ Thông: 5 phút miễn phí 1 lần → 1 mảnh • Cao Cấp: 5 giờ miễn phí 1 lần → 10 mảnh • 10 Lần: 1 ngày miễn phí 1 lần → 100 mảnh, quay tiếp tốn 300 vàng
    // Không cộng dồn lượt: chỉ quay xong mới tính lại thời gian chờ. Mỗi mảnh rơi ngẫu nhiên vào 1 tướng bất kỳ.
    const REC = {
      lam: { name: 'Phổ Thông', cd: 5 * 60e3, n: 1, art: 0 },
      tim: { name: 'Cao Cấp', cd: 5 * 3600e3, n: 10, art: 1 },
      ten: { name: '10 Lần', cd: 24 * 3600e3, n: 100, art: 2, cost: 300 }
    };
    const recLeft = k => Math.max(0, (Number(recState[k]) || 0) - Date.now());
    function openRecruit() { renderRecruit(); switchScreen('chieumo'); const b = document.getElementById('nav-btn-chieumo'); if (b) b.classList.add('active'); }
    function renderRecruit() {
      updateGold();
      document.getElementById('rc-body').innerHTML =
        `<div class="rc-row">${Object.keys(REC).map(k => { const r = REC[k], h = HEROES[(r.art * 3 + 1) % HEROES.length];
          return `<div class="rc-p ${k}"><div class="rc-ttl">${r.name}</div><div class="rc-art">${heroIcon(h)}</div><div class="rc-info" id="rc-st-${k}"></div><button class="rc-btn" id="rc-btn-${k}" onclick="doRecruit('${k}')"></button></div>`; }).join('')}</div>
        <div class="set-note" style="margin-top:8px">🧩 Mỗi mảnh rơi ngẫu nhiên vào 1 tướng bất kỳ. Tăng sao cần mảnh của chính tướng đó: lên ★N cần N × ${SHARD_PER_STAR} mảnh (★6 = ${starCost(6)} mảnh). Lượt miễn phí không cộng dồn, quay xong mới tính lại thời gian.</div>
        <div class="vm-up-info" style="margin:6px 0 2px"><b>🧩 Kho mảnh tướng</b></div><div class="hero-chips" id="rc-inv" style="flex-wrap:wrap;overflow:visible"></div>`;
      renderRecruitInv(); recTick();
    }
    function renderRecruitInv() {
      const el = document.getElementById('rc-inv'); if (!el) return;
      el.innerHTML = [...HEROES].sort((a, b) => shardsOf(b.id) - shardsOf(a.id)).map(h => { const p = getProg(h.id), n = shardsOf(h.id);
        return `<div class="hchip ${n ? 'sel' : ''}" style="${n ? '' : 'opacity:.5;'}cursor:default"><div class="e">${heroIcon(h)}</div><div class="n">${h.name}</div><div class="s">${n} mảnh${p.star < starCapOf(p.lv) ? `<br>★${p.star + 1}: ${starCost(p.star + 1)}` : '<br>★ tối đa'}</div></div>`; }).join('');
    }
    function recTick() {
      Object.keys(REC).forEach(k => {
        const st = document.getElementById('rc-st-' + k), bt = document.getElementById('rc-btn-' + k); if (!st || !bt) return;
        const r = REC[k], left = recLeft(k), free = left <= 0;
        st.innerHTML = `+${r.n} mảnh tướng bất kỳ<br>` + (free ? '<b>Miễn phí 1 lần</b>' : `<span class="tm">⏳ ${fmtClock(left)}</span>`);
        if (free) { bt.disabled = false; bt.innerHTML = 'Miễn phí<small>Mời</small>'; }
        else if (r.cost) { bt.disabled = false; bt.innerHTML = `🪙 ${r.cost}<small>10 Lần</small>`; }
        else { bt.disabled = true; bt.innerHTML = 'Chờ<small>miễn phí</small>'; }
      });
    }
    setInterval(() => { if (document.getElementById('screen-chieumo').classList.contains('active')) recTick(); }, 1000);
    function doRecruit(k) {
      const r = REC[k]; if (!r) return;
      if (recLeft(k) <= 0) { recState[k] = Date.now() + r.cd; saveJSON('rec_state', recState); }   // lượt miễn phí: bắt đầu tính lại thời gian chờ
      else if (r.cost) {
        if (gold < r.cost) { alert(`Không đủ vàng! Cần ${r.cost} 🪙 (có ${gold}).`); return; }
        gold -= r.cost; goldSave();
      } else return;
      const got = {};
      for (let i = 0; i < r.n; i++) { const h = rand(HEROES); got[h.id] = (got[h.id] || 0) + 1; heroShards[h.id] = shardsOf(h.id) + 1; }
      saveJSON('hero_shards', heroShards);
      const list = Object.keys(got).map(Number).sort((a, b) => got[b] - got[a]).map(id => { const h = heroById(id);
        return `<div class="hchip sel" style="cursor:default"><div class="e">${heroIcon(h)}</div><div class="n">${h.name}</div><div class="s">+${got[id]} mảnh</div></div>`; }).join('');
      pvShow(pvHead(`🎴 Chiêu Mộ ${r.name}`, `Nhận ${r.n} mảnh tướng`) + `<div class="hero-chips" style="flex-wrap:wrap;overflow:visible;justify-content:center">${list}</div>` +
        `<button class="btn-attack pv-go" onclick="pvClose()">Xong</button>`);
      renderRecruit();
    }
    updateGold();

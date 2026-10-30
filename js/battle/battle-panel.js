/* TRẬN ĐẤU: bảng đội hình
   (tách từ index.html cũ — script) */

    function refreshPanel() {
      if (pvp) { renderPvpPanel(); return; }
      const hs = waveUnits.heroes;
      let orbs = '', readyCount = 0;
      for (let i = 0; i < 5; i++) {
        const u = hs[i];
        if (!u) { orbs += '<div class="bf-orb empty"></div>'; continue; }
        const can = isPlayerTurn && !busy && u.alive && !u.acted;
        const silenced = isSilenced(u), ready = u.rage >= 100 && !ultBlocked(u);
        if (can && ready) readyCount++;
        orbs += `<div class="bf-orb ${ready && can ? 'ready' : ''} ${u.alive ? '' : 'dead'}" onclick="heroAct(${i},'ult')">${ready ? 'ULTI' : silenced ? '🤐' : u.rage >= 100 ? '🪷' : Math.floor(u.rage) + '%'}</div>`;
      }
      const es = waveUnits.enemies || [];
      const prow = (arr, opp) => { let r = ''; for (let k = 0; k < 5; k++) r += arr[k] ? pvCard(arr[k], opp, true, k) : '<div class="pv-c empty"></div>'; return r; };
      document.getElementById('pv-panel').innerHTML = `<div class="pv-row">${prow(es, true)}</div><div class="pv-row">${prow(hs, false)}</div>`;
      document.getElementById('bf-orbs').innerHTML = orbs;
      const myTurn = isPlayerTurn && !busy;
      document.getElementById('bf-hint').innerText = pvp ? 'TỶ VÕ: ra đòn theo TỐC ĐỘ • tối đa 10 lượt, hết lượt bên gây nhiều sát thương hơn thắng' : (isPlayerTurn && autoMode) ? 'TỰ ĐỘNG: tướng tự đánh & tự ulti' : isPlayerTurn
        ? 'Chạm tướng để đánh thường (+nộ) • chạm cầu khi đầy nộ để ulti'
        : 'Địch đang đánh...';
      const all = document.getElementById('btn-all'), end = document.getElementById('btn-end');
      all.disabled = !(myTurn && readyCount > 0);
      all.innerText = readyCount > 0 ? `Ulti Tất Cả (${readyCount})` : 'Ulti Tất Cả';
      end.disabled = !myTurn;
      updateAutoBtn();
    }

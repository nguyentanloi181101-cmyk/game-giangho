/* PVE: vòng lặp trận (loadWave, enemyTurn, nextWave, closeBattle)
   (tách từ index.html cũ — script) */

    function loadWave() {
      setBattleBg();
      document.getElementById('battle-overlay').classList.toggle('pvp-mode', !!pvp);
      if (pvp) { loadPvpWave(); return; }
      const tok = battleToken;
      document.getElementById('ui-stage-title').innerText = `Ải ${currentStage} - Bàn ${currentBattle}`;
      document.getElementById('ui-wave-title').innerText = `Trận ${currentWave}/4`;
      waveUnits.enemies.forEach(e => e.el.remove());

      const B = (currentStage - 1) * 10 + currentBattle;
      mult = Math.pow(1.32, B - 1);
      const m2 = mult * 1.2;

      if (currentWave === 1 || currentWave === 2 || currentWave === 4) {
        // Trận 1: 2 tướng ngẫu nhiên • Trận 2: 3 tướng • Trận 4 (boss): 5 tướng (chỉ số theo ải)
        const n = currentWave === 1 ? 2 : currentWave === 2 ? 3 : 5;
        const r = heroFoes(n, currentWave === 4 ? m2 : mult);
        waveUnits.enemies = r.foes;
        document.getElementById('ui-enemy-name').innerText = (currentWave === 4 ? 'BOSS: ' : '') + r.picks.map(h => h.name.toUpperCase()).join(' • ');
      } else {
        const zs = shuffled(ZODIAC);
        document.getElementById('ui-enemy-name').innerText = '5 CON GIÁP: ' + zs.slice(0, 5).map(z => z[1].toUpperCase()).join(' • ');
        waveUnits.enemies = HERO_POS[5].map((p, i) => makeUnit('enemy', zs[i][0], 100 - p[0], p[1] + HERO_DY, 40 * mult, 20 * mult, false, zs[i][1]));
      }
      waveRound = 1;
    // Quân ta đánh trước: sang trận mới thì hồi lại lượt cho cả đội, xóa choáng / chảy máu / buff cũ
      waveUnits.heroes.forEach(h => {
        h.acted = false; h.stun = 0; h.bleed = 0; h.bleedPct = 0; clearDebuffs(h); grantStart(h);
        h.el.classList.remove('stunned');
        h.el.querySelectorAll('.bf-stun, .bf-bleed').forEach(ic => ic.remove());
      });
      clearDefBuff(waveUnits.heroes);
      busy = false; isPlayerTurn = true;
      refreshPanel();
      setTimeout(() => { if (tok === battleToken) autoStep(); }, 600);
    }

    function loseBattle() { if (pvp) { pvpFinish(false); return; } alert('Thua rồi! Đội ngũ đã gục ngã.'); closeBattle(); }

    async function enemyTurn() {
      const tok = battleToken;
      if (pvp && ++pvpRound > PVP_MAX_ROUNDS) { pvpTimeout(); return; }   // hết số hiệp tối đa của Tỷ Võ
      isPlayerTurn = false;
      refreshPanel();
      clearDefBuff(waveUnits.enemies);                       // buff Thủ của Lạc Long Quân địch chỉ kéo dài 1 hiệp
      tickMoon(waveUnits.enemies);                           // khiên Trăng Khuyết của địch giảm 1 hiệp
      tickLB(waveUnits.enemies);
      tickDebuffs(waveUnits.heroes);                         // hiệu ứng bướm trên tướng ta giảm 1 hiệp
      // Chảy máu: đầu mỗi hiệp địch, mỗi địch đang chảy máu mất 20% HP hiện tại
      if (await tickBleed(waveUnits.enemies)) { await sleep(500); if (tok !== battleToken) return; }
      const es = waveUnits.enemies.filter(e => e.alive);
      await Promise.all(es.map(async (e, i) => {
        await sleep(i * 200); if (tok !== battleToken) return;
        if (!e.alive) return;
        if (e.stun > 0) {
          e.stun--; floatText(e, 'CHOÁNG');
          if (e.stun === 0) { const ic = e.el.querySelector('.bf-stun'); if (ic) ic.remove(); e.el.classList.remove('stunned'); }
          return;
        }
        if (!waveUnits.heroes.some(h => h.alive)) return;
        if (e.isHero) {
          // Tướng địch: đủ nộ (hoặc alwaysUlt) thì ulti giống hệt tướng của ta, còn lại đánh thường (+nộ)
          if ((e.alwaysUlt || e.rage >= 100) && !ultBlocked(e)) { e.rage = e.alwaysUlt ? 100 : 0; await ultimate(e, tok); }
          else { gainRage(e, RAGE_ATK); await normalAttack(e, waveUnits.heroes, tok); }
        } else {
          await attack(e, waveUnits.heroes, 1, e.atk, tok);
        }
      }));
      if (tok !== battleToken) return;
      tickImmortal(waveUnits.heroes); tickImmortal(waveUnits.enemies);   // hết 1 hiệp: bất tử giảm 1
      waveRound++;
      tickDebuffs(waveUnits.enemies);                        // hiệu ứng bướm trên địch giảm 1 hiệp (sau khi địch đã ra đòn)
      // Hết 1 hiệp: gỡ buff Thủ của Lạc Long Quân bên ta
      clearDefBuff(waveUnits.heroes);
      tickMoon(waveUnits.heroes);                            // khiên Trăng Khuyết bên ta giảm 1 hiệp
      tickLB(waveUnits.heroes);                              // buff Lăng Ba Vi Bộ giảm 1 hiệp (+ hồi máu)
      if (waveUnits.heroes.every(h => !h.alive)) { loseBattle(); return; }
      if (waveUnits.enemies.every(e => !e.alive)) { await sleep(400); if (tok !== battleToken) return; nextWave(); return; }   // địch gục vì sát thương phản
      // Tướng ta dính chảy máu từ chiêu của địch
      if (await tickBleed(waveUnits.heroes)) {
        await sleep(500); if (tok !== battleToken) return;
        if (waveUnits.heroes.every(h => !h.alive)) { loseBattle(); return; }
      }
      // Tướng ta dính choáng thì mất lượt
      waveUnits.heroes.forEach(h => {
        if (h.alive && h.stun > 0) {
          h.stun--; h.acted = true; floatText(h, 'CHOÁNG');
          if (h.stun === 0) { const ic = h.el.querySelector('.bf-stun'); if (ic) ic.remove(); h.el.classList.remove('stunned'); }
        } else h.acted = false;
      });
      isPlayerTurn = true;
      refreshPanel();
      if (waveUnits.heroes.filter(h => h.alive).every(h => h.acted)) {   // cả đội bị choáng -> qua lượt
        setTimeout(() => { if (tok === battleToken) endTurn(); }, 800);
        return;
      }
      autoStep();
    }

    // Đánh thường (chạm thẻ tướng) hoặc ulti (chạm cầu nộ) — người chơi tự chọn tướng nào đánh trước
    async function heroAct(i, type) {
      const u = waveUnits.heroes[i];
      if (!u || !isPlayerTurn || busy || !u.alive || u.acted) return;
      if (type === 'ult' && (u.rage < 100 || ultBlocked(u))) return;
      busy = true; u.acted = true;
      const tok = battleToken;
      if (type === 'ult') u.rage = u.alwaysUlt ? 100 : 0; else gainRage(u, RAGE_ATK);
      refreshPanel();
      if (type === 'ult') await ultimate(u, tok);
      else await normalAttack(u, waveUnits.enemies, tok);
      afterAction(tok);
    }

    // Ulti cùng lúc cho mọi tướng đã đầy nộ
    async function castAll() {
      if (!isPlayerTurn || busy) return;
      const rs = waveUnits.heroes.filter(h => h.alive && !h.acted && h.rage >= 100 && !ultBlocked(h)).sort((a, b) => b.spd - a.spd);
      if (!rs.length) return;
      busy = true;
      const tok = battleToken;
      rs.forEach(h => { h.acted = true; h.rage = h.alwaysUlt ? 100 : 0; });
      refreshPanel();
      await Promise.all(rs.map(async (h, i) => {
        await sleep(i * 120); if (tok !== battleToken) return;
        await ultimate(h, tok);
      }));
      afterAction(tok);
    }

    async function afterAction(tok) {
      if (tok !== battleToken) return;
      busy = false;
      await sleep(300); if (tok !== battleToken) return;
      if (waveUnits.heroes.every(h => !h.alive)) { loseBattle(); return; }   // tướng ta gục vì sát thương phản của khiên địch
      if (waveUnits.enemies.every(e => !e.alive)) {
        isPlayerTurn = false; refreshPanel();
        await sleep(400); if (tok !== battleToken) return;
        nextWave();
        return;
      }
      if (waveUnits.heroes.filter(h => h.alive).every(h => h.acted)) { endTurn(); return; }
      refreshPanel();
      autoStep();
    }

    function endTurn() {
      if (!isPlayerTurn || busy) return;
      enemyTurn();
    }

    function nextWave() {
      if (pvp) { pvpFinish(true); return; }
      if (currentWave < 4) {
        currentWave++;
        loadWave();
      } else {
        const keyMsg = currentBattle === 10 ? claimStageKey(currentStage) : '';
        const hamMsg = currentBattle === 10 ? claimStageHammer(currentStage) : '';
        const rewardMsg = grantBanReward(currentStage, currentBattle) + grantStageReward(currentStage, currentBattle) + keyMsg + hamMsg + grantPills();
        pvpToast(`Hoàn thành Ải ${currentStage} - Bàn ${currentBattle}!` + rewardMsg, true);   // tự qua bàn, thông báo tự tắt
        const st = currentStage, bt = currentBattle;
        closeBattle();
        unlockNextLevel(st, bt);
        if (bt === 10) {
          if (st < 100) selectStage(st + 1); else backToStages();
        } else {
          selectStage(st);
        }
      }
    }

    function closeBattle() {
      battleToken++;
      stopHeroSounds();
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
      stopBgm(); battleFast = false;
      if (pvp) { pvp = null; pvpGenOpps(); renderPvp(); }   // thoát giữa trận Tỷ Võ = bỏ cuộc
      busy = false;
      document.getElementById('battle-overlay').style.display = 'none';
      isPlayerTurn = false;
    }

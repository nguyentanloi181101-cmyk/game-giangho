/* PVE: bắt đầu trận (startBattleSequence)
   (tách từ index.html cũ — script) */

    function startBattleSequence(stage, battle) {
      const staCost = STA_WAVES * STA_PER_WAVE;
      if (!staSpend(staCost)) { alert('⚡ Không đủ thể lực! Cần ' + staCost + ' thể lực (có ' + staState.v + ').\nThể lực hồi 1 mỗi phút, hoặc dùng 💊 Viên Thể Lực trong Túi đồ (bấm vào ô Thể Lực).'); return; }
      battleToken++;
      playBgm(); playBattleOpen();
      currentStage = stage; currentBattle = battle; currentWave = 1;
      busy = false;
      document.getElementById('bf-units').innerHTML = '';
      const sel = HEROES.filter(h => team.includes(h.id));
      const pos = HERO_POS[sel.length].map(p => [p[0], p[1] + HERO_DY]);
      const _tm = ttMine(); ttSetupUI(_tm, ttFake('pve' + stage));
      waveUnits = {
        heroes: sel.map((h, i) => {
          const s = ttApply(Object.assign({}, heroStats(h.id)), ttBonus(_tm && _tm.pt));
          const u = makeUnit('hero', heroIcon(h), pos[i][0], pos[i][1], s.hp, s.atk, false, h.name);
          u.id = h.id; u.emoji = heroIcon(h); u.def = s.def; u.spd = s.spd; u.dodge = s.dodge; u.acc = s.acc; u.crit = s.crit; u.critDmg = s.critDmg; u.tough = s.tough; u.pierce = s.pierce; u.block = s.block; u.sk = skillMult(h.id); u.alwaysUlt = !!h.alwaysUlt; u.taunt = !!h.taunt; u.prio2 = !!h.prio2;
          u.rage = h.startRage || 0; grantStart(u); u.acted = false;
          return u;
        }),
        enemies: []
      };
      document.getElementById('battle-overlay').style.display = 'flex';
      loadWave();
    }

/* PVE: chọn Ải / Bàn, tiến trình mở khóa
   (tách từ index.html cũ — script) */

    // --- PVE SYSTEM ---
    let progress = JSON.parse(localStorage.getItem('pve_progress')) || { maxStage: 1, maxBattle: 1 };

    function renderStages() {
      const container = document.getElementById('stage-list-container');
      let html = '<div class="stage-grid">';
      for (let i = 1; i <= 100; i++) {
        let isLocked = i > progress.maxStage;
        html += `
          <div class="stage-item ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `selectStage(${i})`}">
            ${isLocked ? '🔒 Ải ' + i : 'Ải ' + i}
          </div>
        `;
      }
      html += '</div>';
      container.innerHTML = html;
    }

    function selectStage(stageNum) {
      document.getElementById('pve-stage-screen').style.display = 'none';
      document.getElementById('pve-battle-screen').style.display = 'flex';
      document.getElementById('ui-selected-stage').innerText = `Ải ${stageNum} - Chọn Bàn`;

      const container = document.getElementById('battle-list-container');
      // Bàn 1 nằm DƯỚI CÙNG, bàn 2 ở trên nó... Chỉ hiện các bàn đã mở: xong bàn 1 thì bàn 2 mới hiện ra
      const shown = stageNum < progress.maxStage ? 10 : (stageNum === progress.maxStage ? progress.maxBattle : 0);
      container.style.display = 'flex'; container.style.flexDirection = 'column';
      let html = '<div class="battle-list" style="margin-top:auto">';
      for (let i = 10; i >= 1; i--) {
        if (i > shown) continue;
        let isLocked = false;
        if (stageNum === progress.maxStage && i > progress.maxBattle) isLocked = true;
        if (stageNum > progress.maxStage) isLocked = true;

        html += `
          <div class="battle-item ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `startBattleSequence(${stageNum}, ${i})`}">
            <div>
              <div class="battle-item-title">Bàn ${i} ${isLocked ? '🔒' : ''}</div>
              <div class="battle-item-desc">🥈 ${fmtN(banReward(stageNum, i).silver)} bạc • 🌾 ${fmtN(banReward(stageNum, i).rice)} gạo<br>🔮 ${fmtN(banReward(stageNum, i).than)} Thần Đan • 🔴 ${fmtN(banReward(stageNum, i).tien)} Tiên Đan<br>⚡ Tốn ${STA_WAVES * STA_PER_WAVE} thể lực • 💊 Thưởng ${PILL_PER_CLEAR} viên thể lực${extraList().length ? '<br>🎁 Thêm: ' + extraRewardText() : ''}${i === 10 && expPerStage() > 0 ? '<br>✨ Vượt Ải: +' + fmtN(expPerStage()) + ' EXP' : ''}${stageNum === EQ_REWARD.stage && i === EQ_REWARD.battle ? '<br>🎁 Thưởng: ' + EQ_REWARD.each + ' Mũ, ' + EQ_REWARD.each + ' Áo, ' + EQ_REWARD.each + ' Kiếm, ' + EQ_REWARD.each + ' Giày' : ''}</div>
            </div>
            ${isLocked ? '<div class="battle-item-btn disabled">Chưa mở</div>' : `<div class="battle-btns">${isCleared(stageNum, i) ? `<div class="battle-item-btn sweep" onclick="event.stopPropagation();sweepBattle(${stageNum}, ${i})">Quét ×${SWEEP_N}<small>⚡${SWEEP_N * STA_WAVES * STA_PER_WAVE}</small></div>` : ''}<div class="battle-item-btn">Đánh ▶</div></div>`}
          </div>
        `;
      }
      html += '</div>';
      container.innerHTML = html;
      container.scrollTop = container.scrollHeight;   // cuộn xuống đáy để thấy bàn 1 và bàn đang đánh
    }

    // ===== QUÉT: đánh nhanh 10 lần 1 Bàn ĐÃ THẮNG, tốn 10 × 4 = 40 thể lực, nhận thưởng x10 (bạc, gạo, viên thể lực) =====
    const SWEEP_N = 10;
    const isCleared = (stage, battle) => stage < progress.maxStage || (stage === progress.maxStage && battle < progress.maxBattle);
    function sweepBattle(stage, battle) {
      if (!isCleared(stage, battle)) return;
      const cost = SWEEP_N * STA_WAVES * STA_PER_WAVE;
      if (!staSpend(cost)) { alert('⚡ Không đủ thể lực để quét! Cần ' + cost + ' thể lực (có ' + staState.v + ').\nDùng 💊 Viên Thể Lực trong Túi đồ để hồi thêm.'); return; }
      const r = banReward(stage, battle); let extra = '';
      for (let n = 0; n < SWEEP_N; n++) { grantBanReward(stage, battle); grantPills(); if (n === 0) extra = grantStageReward(stage, battle); }
      extra = grantExtraReward(SWEEP_N) + extra;
      if (typeof updatePower === 'function') updatePower();
      pvpToast(`⚔️ Quét Ải ${stage} - Bàn ${battle} ×${SWEEP_N}!\n\n🥈 +${fmtN(r.silver * SWEEP_N)} bạc • 🌾 +${fmtN(r.rice * SWEEP_N)} gạo\n🔮 +${fmtN(r.than * SWEEP_N)} Thần Đan • 🔴 +${fmtN(r.tien * SWEEP_N)} Tiên Đan\n💊 +${PILL_PER_CLEAR * SWEEP_N} Viên Thể Lực (có ${staState.pills})\n⚡ -${cost} thể lực` + extra, true);
    }

    function backToStages() {
      document.getElementById('pve-battle-screen').style.display = 'none';
      document.getElementById('pve-stage-screen').style.display = 'flex';
      renderStages();
    }

    function unlockNextLevel(currentStage, currentBattle) {
      if (currentStage === progress.maxStage && currentBattle === progress.maxBattle) {
        if (currentBattle < 10) {
          progress.maxBattle++;
        } else if (currentStage < 100) {
          progress.maxStage++;
          progress.maxBattle = 1;
        }
        localStorage.setItem('pve_progress', JSON.stringify(progress));
      }
    }

    function resetProgress() {
      return;   // đã tắt chức năng xóa tiến trình PVE
      if (confirm("Xóa toàn bộ tiến trình PVE và quay về Ải 1 Bàn 1?")) {
        progress = { maxStage: 1, maxBattle: 1 };
        localStorage.setItem('pve_progress', JSON.stringify(progress));
        renderStages();
      }
    }

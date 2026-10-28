let progress = JSON.parse(localStorage.getItem('pve_progress')) || { maxStage: 1, maxBattle: 1 };

document.addEventListener('DOMContentLoaded', () => { renderStages(); });

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
  html += `<button onclick="resetProgress()" style="margin-top:20px; width:100%; background:#dc2626; color:#fff; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer;">Xóa Tiến Trình (Test)</button>`;
  
  container.innerHTML = html;
}

function selectStage(stageNum) {
  document.getElementById('pve-stage-screen').classList.remove('active');
  document.getElementById('pve-battle-screen').classList.add('active');
  document.getElementById('ui-selected-stage').innerText = `Ải ${stageNum} - Chọn Bàn`;

  const container = document.getElementById('battle-list-container');
  let html = '<div class="battle-list">';
  
  for (let i = 1; i <= 10; i++) {
    let isLocked = false;
    if (stageNum === progress.maxStage && i > progress.maxBattle) isLocked = true;
    if (stageNum > progress.maxStage) isLocked = true;

    html += `
      <div class="battle-item ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `startBattleSequence(${stageNum}, ${i})`}">
        <div>
          <div class="battle-item-title">Bàn ${i} ${isLocked ? '🔒' : ''}</div>
          <div class="battle-item-desc">4 Trận: Corona -> Lợn Rừng -> Corona -> Lợn Rừng</div>
        </div>
        ${isLocked ? '<div class="battle-item-btn disabled">Chưa mở</div>' : '<div class="battle-item-btn">Đánh ▶</div>'}
      </div>
    `;
  }
  html += '</div>';
  container.innerHTML = html;
}

function backToStages() {
  document.getElementById('pve-battle-screen').classList.remove('active');
  document.getElementById('pve-stage-screen').classList.add('active');
  renderStages();
}

function unlockNextLevel(currentStage, currentBattle) {
  if (currentStage === progress.maxStage && currentBattle === progress.maxBattle) {
    if (currentBattle < 10) {
      progress.maxBattle++;
    } else {
      if (currentStage < 100) {
        progress.maxStage++;
        progress.maxBattle = 1;
      }
    }
    localStorage.setItem('pve_progress', JSON.stringify(progress));
  }
}

function resetProgress() {
  if (confirm("Xóa toàn bộ tiến trình PVE và quay về Ải 1 Bàn 1?")) {
    progress = { maxStage: 1, maxBattle: 1 };
    localStorage.setItem('pve_progress', JSON.stringify(progress));
    renderStages();
  }
}
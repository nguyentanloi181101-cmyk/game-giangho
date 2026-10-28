let battleHero3D = null;

let currentStage = 1;
let currentBattle = 1;
let currentWave = 1;

let enemyCurrentHP = 0;
let enemyMaxHP = 0;
let enemyATK = 0;

let heroCurrentHP = 500000;
let heroMaxHP = 500000;

let isPlayerTurn = false;
let battleDamageInterval = null;

function formatNumber(num) {
  if (num < 1000) return Math.floor(num);
  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
  const i = Math.floor(Math.log10(num) / 3);
  if (i >= units.length) return num.toExponential(2);
  return (num / Math.pow(10, i * 3)).toFixed(2) + units[i];
}

console.log('battle.js v3 loaded');

// Đảm bảo luôn có thẻ emoji + hiệu ứng stun, kể cả khi pve.html là bản cũ
function ensureBossDom() {
  const avatar = document.getElementById('battle-boss-avatar');
  let emoji = document.getElementById('battle-boss-emoji');
  let stun = document.getElementById('battle-stun-effect');

  if (!emoji) {
    Array.from(avatar.childNodes).forEach(n => { if (n.nodeType === 3) n.remove(); });
    emoji = document.createElement('span');
    emoji.id = 'battle-boss-emoji';
    avatar.insertBefore(emoji, avatar.firstChild);
  }
  if (!stun) {
    stun = document.createElement('div');
    stun.id = 'battle-stun-effect';
    stun.textContent = '💫';
    avatar.appendChild(stun);
  }
  return { avatar, emoji, stun };
}

function startBattleSequence(stage, battle) {
  currentStage = stage;
  currentBattle = battle;
  currentWave = 1;
  heroCurrentHP = heroMaxHP;

  document.getElementById('battle-overlay').style.display = 'flex';

  if (battleHero3D) battleHero3D.init();
  else battleHero3D = new Hero3D('battle-hero-container', { heroId: 4, name: "Trương Tam Phong" });

  updateHeroHPBar();
  loadWave();
}

function loadWave() {
  document.getElementById('ui-stage-title').innerText = `Ải ${currentStage} - Bàn ${currentBattle}`;
  document.getElementById('ui-wave-title').innerText = `Trận ${currentWave}/4`;
  const { avatar: bossAvatar, emoji: bossEmoji, stun } = ensureBossDom();
  stun.style.display = 'none';
  bossAvatar.classList.remove('boss-stunned', 'enemy-attack-anim', 'boss-hit');
  bossAvatar.style.opacity = '1';

  const B = (currentStage - 1) * 10 + currentBattle;
  const multiplierBoss1 = Math.pow(1.32, B - 1);
  const multiplierBoss2 = multiplierBoss1 * 1.2;

  const isBossWave = (currentWave === 2 || currentWave === 4);

  if (isBossWave) {
    if (currentWave === 2) {
      document.getElementById('ui-enemy-name').innerText = "LỢN RỪNG (BOSS 1)";
      enemyMaxHP = 1000 * multiplierBoss1;
      enemyATK = 200 * multiplierBoss1;
    } else {
      document.getElementById('ui-enemy-name').innerText = "LỢN RỪNG ĐẦU ĐÀN";
      enemyMaxHP = 1000 * multiplierBoss2;
      enemyATK = 200 * multiplierBoss2;
    }
    bossEmoji.textContent = "🐗";
  } else {
    document.getElementById('ui-enemy-name').innerText = "5 VIRUS CORONA";
    enemyMaxHP = 200 * multiplierBoss1;
    enemyATK = 100 * multiplierBoss1;
    bossEmoji.textContent = "🦠";
  }

  enemyCurrentHP = enemyMaxHP;

  document.getElementById('ui-enemy-hp-text').innerText = `${formatNumber(enemyCurrentHP)}/${formatNumber(enemyMaxHP)}`;
  document.getElementById('ui-enemy-atk').innerText = `Công: ${formatNumber(enemyATK)}`;
  document.getElementById('battle-boss-hp').style.width = `100%`;

  if (battleHero3D) battleHero3D.playAnimation('idle', 0);

  isPlayerTurn = false;
  document.getElementById('btn-player-attack').disabled = true;
  document.getElementById('btn-player-attack').innerText = "Địch đang đánh...";

  setTimeout(enemyTurn, 1000);
}

function enemyTurn() {
  const bossAvatar = document.getElementById('battle-boss-avatar');
  const heroContainer = document.getElementById('battle-hero-container');

  bossAvatar.classList.add('enemy-attack-anim');

  setTimeout(() => {
    heroContainer.classList.add('hero-hurt-anim');
    heroCurrentHP -= enemyATK;
    if (heroCurrentHP < 0) heroCurrentHP = 0;
    updateHeroHPBar();
    showDamageText(enemyATK, 'hero');

    const arena = document.querySelector('.battle-arena');
    if (arena) {
      arena.classList.add('screen-shake');
      setTimeout(() => arena.classList.remove('screen-shake'), 400);
    }
    setTimeout(() => heroContainer.classList.remove('hero-hurt-anim'), 400);
  }, 300);

  setTimeout(() => {
    bossAvatar.classList.remove('enemy-attack-anim');

    if (heroCurrentHP <= 0) {
      alert("Thua rồi! Trương Tam Phong đã gục ngã.");
      closeBattle();
      return;
    }

    isPlayerTurn = true;
    const btn = document.getElementById('btn-player-attack');
    btn.disabled = false;
    btn.innerText = "Tung Chiêu";
  }, 1200);
}

function updateHeroHPBar() {
  const percent = Math.max(0, (heroCurrentHP / heroMaxHP) * 100);
  document.getElementById('hero-hp').style.width = `${percent}%`;
  document.getElementById('ui-hero-hp-text').innerText = `${formatNumber(heroCurrentHP)}/${formatNumber(heroMaxHP)}`;
}

function executeUltimate() {
  if (!isPlayerTurn) return;
  isPlayerTurn = false;

  const btnAttack = document.getElementById('btn-player-attack');
  btnAttack.disabled = true;
  btnAttack.innerText = "Đang Tung...";

  battleHero3D.playAnimation('skill', 2500);

  const pedestal = document.querySelector('#battle-hero-container .hero-3d-pedestal');
  if (pedestal) pedestal.classList.add('ultimate-active');

  const overlay = document.getElementById('battle-overlay');
  const tornado = document.createElement('div');
  tornado.className = 'tornado-effect active';
  overlay.appendChild(tornado);

  let hitCount = 0;
  const damagePerHit = enemyMaxHP / 3;

  if (battleDamageInterval) clearInterval(battleDamageInterval);

  battleDamageInterval = setInterval(() => {
    hitCount++;

    const bossAvatar = document.getElementById('battle-boss-avatar');
    if (bossAvatar) {
      bossAvatar.classList.add('boss-hit');
      setTimeout(() => bossAvatar.classList.remove('boss-hit'), 200);
    }

    // 3 đòn đầu hạ gục địch (tránh sai số số thực), đòn 4 chỉ là hiệu ứng
    enemyCurrentHP = (hitCount >= 3) ? 0 : Math.max(0, enemyCurrentHP - damagePerHit);

    document.getElementById('battle-boss-hp').style.width = `${(enemyCurrentHP / enemyMaxHP) * 100}%`;
    document.getElementById('ui-enemy-hp-text').innerText = `${formatNumber(enemyCurrentHP)}/${formatNumber(enemyMaxHP)}`;

    showDamageText(damagePerHit, 'enemy');

    if (hitCount >= 4) {
      clearInterval(battleDamageInterval);

      setTimeout(() => {
        if (bossAvatar) bossAvatar.classList.add('boss-stunned');
        const stun = document.getElementById('battle-stun-effect');
        if (stun) stun.style.display = 'block';

        setTimeout(() => {
          if (pedestal) pedestal.classList.remove('ultimate-active');
          tornado.remove();

          if (enemyCurrentHP <= 0) {
            nextWave();
          }
        }, 1000);
      }, 300);
    }
  }, 400);
}

function showDamageText(amount, target) {
  const overlay = document.getElementById('battle-overlay');
  const dmgText = document.createElement('div');
  dmgText.className = 'damage-number';
  dmgText.innerText = `-${formatNumber(amount)}`;

  if (target === 'enemy') {
    dmgText.style.color = '#fde047';
    dmgText.style.top = `120px`;
    dmgText.style.left = `${40 + Math.random() * 20}%`;
  } else {
    dmgText.style.color = '#ef4444';
    dmgText.style.top = `60%`;
    dmgText.style.left = `${40 + Math.random() * 20}%`;
  }

  overlay.appendChild(dmgText);
  setTimeout(() => dmgText.remove(), 800);
}

function nextWave() {
  if (currentWave < 4) {
    currentWave++;
    loadWave();
  } else {
    // ĐÃ THẮNG CẢ 4 TRẬN
    alert(`Chúc mừng! Bạn đã hoàn thành Ải ${currentStage} - Bàn ${currentBattle}!`);
    closeBattle();

    // Mở khóa tiến trình
    if (typeof unlockNextLevel === 'function') {
      unlockNextLevel(currentStage, currentBattle);
    }

    // Chuyển hướng giao diện
    if (currentBattle === 10) {
      if (currentStage < 100) {
        selectStage(currentStage + 1); // Qua ải tiếp
      } else {
        backToStages(); // Phá đảo
      }
    } else {
      selectStage(currentStage); // Ở lại ải, hiển thị bàn tiếp
    }
  }
}

function closeBattle() {
  document.getElementById('battle-overlay').style.display = 'none';
  isPlayerTurn = false;
  if (battleDamageInterval) clearInterval(battleDamageInterval);

  const btnAttack = document.getElementById('btn-player-attack');
  if (btnAttack) {
    btnAttack.disabled = true;
    btnAttack.innerText = "Tung Chiêu";
  }

  document.querySelectorAll('.tornado-effect').forEach(t => t.remove());
}

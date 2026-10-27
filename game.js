/* ================= DATA ================= */
const BASE_HEROES = [
  { id: 0, name: "Trương Tam Phong", emoji: "🧙🏻‍♂️", baseHp: 5000, baseAtk: 500, speed: 75 },
  { id: 1, name: "Sóc Vàng", emoji: "🐿️", baseHp: 4000, baseAtk: 400, speed: 60 },
  { id: 2, name: "Độc Cô Kiếm", emoji: "🧔🏻", baseHp: 4500, baseAtk: 600, speed: 85 },
  { id: 3, name: "Thanh Y Nữ Hiệp", emoji: "🥷🏻", baseHp: 3800, baseAtk: 520, speed: 70 },
  { id: 4, name: "Tiểu Long Nữ", emoji: "👸🏻", baseHp: 3600, baseAtk: 450, speed: 65 }
];

let state = {
  gold: 1000000, gems: 10000,
  heroes: {
    0: { level: 73, stars: 5 },
    1: { level: 70, stars: 5 },
    2: { level: 70, stars: 4 },
    3: { level: 70, stars: 4 },
    4: { level: 70, stars: 3 }
  },
  team: [0, 1, 2, 3, 4], // 5 tướng
  currentRound: 1
};

const $ = id => document.getElementById(id);

/* ================= UI INIT ================= */
function updateHome() {
  $('top-gold').textContent = state.gold.toLocaleString();
  $('top-gems').textContent = state.gems.toLocaleString();
  $('home-team-slots').innerHTML = Array.from({length: 5}).map((_, i) => {
    const id = state.team[i];
    if (id !== undefined) {
      const h = BASE_HEROES.find(x => x.id === id);
      const d = state.heroes[id];
      return `<div class="home-slot" style="border-color:${id===0?'#ff9f43':'#b06aff'}">
          <div class="lvl">${d.level}</div>
          ${h.emoji}
          <div class="stars">${'★'.repeat(d.stars)}</div>
        </div>`;
    }
    return '';
  }).join('');
}

function switchTab(tabId, el) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = $(`screen-${tabId}`);
  if(target) target.classList.add('active');
  else $('screen-home').classList.add('active');
  if(el) el.classList.add('active');
}

/* ================= COMBAT SYSTEM ================= */
let allies = [];
let enemies = [];
let turnQueue = [];
let currentUnit = null;
let battleRunning = false;
let currentStage = 1;
let isAuto = false;

function startBattle() {
  allies = state.team.map((id, index) => {
    const base = BASE_HEROES.find(x => x.id === id);
    const data = state.heroes[id];
    const hp = Math.floor(base.baseHp * (1 + data.level * 0.1) * (1 + data.stars * 0.2));
    const atk = Math.floor(base.baseAtk * (1 + data.level * 0.1) * (1 + data.stars * 0.2));
    const def = Math.floor(hp * 0.1); 
    
    return {
      uid: 'ally_' + id, heroId: id, name: base.name, emoji: base.emoji,
      maxHp: hp, hp: hp, atk: atk, def: def, speed: base.speed,
      maxMp: 100, mp: 0, isAlly: true, alive: true, stunned: false,
      dodge: 5, crit: 150, index: index
    };
  });

  currentStage = 1;
  $('battle-round').textContent = state.currentRound;
  $('boss-screen').style.display = 'flex';
  
  spawnStage();
}

function spawnStage() {
  const roundMult = Math.pow(1.25, state.currentRound - 1);
  
  if (currentStage === 1) {
    $('stage-indicator').textContent = "1 (Lính)";
    const minionNames = ["Sói Đen", "Cướp Núi", "Dơi Độc"];
    const minionEmojis = ["🐺", "🥷", "🦇"];
    
    enemies = Array.from({length: 3}).map((_, i) => {
      const hp = Math.floor(1500 * roundMult);
      const atk = Math.floor(250 * roundMult);
      return {
        uid: 'enemy_' + i, name: minionNames[i], emoji: minionEmojis[i],
        maxHp: hp, hp: hp, atk: atk, def: Math.floor(25 * roundMult), speed: 50,
        maxMp: 0, mp: 0, isAlly: false, alive: true, stunned: false,
        dodge: 2, crit: 150, index: i
      };
    });
  } else {
    $('stage-indicator').textContent = "2 (BOSS)";
    const hp = Math.floor(3000 * roundMult);
    const atk = Math.floor(500 * roundMult);
    
    enemies = [{
      uid: 'boss_0', name: "Hắc Phong Yêu Vương", emoji: "👹",
      maxHp: hp, hp: hp, atk: atk, def: Math.floor(50 * roundMult), speed: 80,
      maxMp: 0, mp: 0, isAlly: false, alive: true, stunned: false,
      dodge: 2, crit: 300, index: 0
    }];
  }

  renderArena();
  renderHUD();
  battleRunning = true;
  nextRound();
}

function nextRound() {
  if (!battleRunning) return;
  let allUnits = [...allies, ...enemies].filter(u => u.alive);
  if (allUnits.length === 0) return;

  turnQueue = allUnits.sort((a, b) => (b.speed + Math.random()*5) - (a.speed + Math.random()*5));
  processTurn();
}

function processTurn() {
  if (!battleRunning) return;

  if (turnQueue.length === 0) { nextRound(); return; }

  currentUnit = turnQueue.shift();
  if (!currentUnit.alive) { processTurn(); return; }

  if (currentUnit.isAlly) {
    if (currentUnit.stunned) {
      showDmg(currentUnit, "CHOÁNG", "miss");
      currentUnit.stunned = false;
      setTimeout(processTurn, 1000);
      return;
    }

    // Logic Treo (Auto)
    if (isAuto) {
      setTimeout(() => {
        if (currentUnit.mp >= 100 && Math.random() > 0.3) {
          playerUltimate();
        } else {
          playerNormalAttack();
        }
      }, 800);
    } else {
      updateHUDButtons(); // Bật nút cho người chơi bấm
    }

  } else {
    // Lượt quái
    if (currentUnit.stunned) {
      showDmg(currentUnit, "CHOÁNG", "miss");
      currentUnit.stunned = false;
      setTimeout(processTurn, 1000);
      return;
    }
    disableHUDButtons();
    setTimeout(() => enemyAction(currentUnit), 1000);
  }
}

function calculateDamage(attacker, target, multiplier) {
  if (Math.random() * 100 < target.dodge) return { dmg: 0, isCrit: false, isMiss: true };
  let dmg = (attacker.atk * multiplier) - target.def;
  if (dmg < 1) dmg = 1;
  let isCrit = false;
  if (Math.random() * 100 < 15) {
    dmg = dmg * (attacker.crit / 100);
    isCrit = true;
  }
  return { dmg: Math.floor(dmg), isCrit, isMiss: false };
}

function dealDamage(attacker, target, amount, isCrit = false, isMiss = false) {
  if (isMiss) {
    showDmg(target, "MISS", "miss");
    return;
  }
  target.hp -= amount;
  if (target.hp < 0) target.hp = 0;
  
  showDmg(target, isCrit ? `CRIT -${amount}` : `-${amount}`, isCrit ? 'crit' : 'dmg');
  
  const el = $(`unit-${target.uid}`);
  if(el) {
    el.classList.add('hit-flash');
    setTimeout(() => el.classList.remove('hit-flash'), 300);
  }

  renderHUD();
  if (target.hp <= 0) {
    target.alive = false;
    renderArena();
  }
}

function renderArena() {
  const arena = $('battle-arena');
  arena.innerHTML = '';
  
  // Render Allies (Trái)
  allies.forEach((u, i) => {
    const div = document.createElement('div');
    div.className = `ally-unit pos-${i} ${u.mp>=100?'ult-ready':''}`;
    div.id = `unit-${u.uid}`;
    if(!u.alive) div.style.opacity = '0';
    div.innerHTML = `
      <div class="taichi-base"></div>
      <div class="unit-sprite" id="sprite-${u.uid}">${u.emoji}</div>
      <div class="hp-bar-float"><div class="hp-fill" style="width:${(u.hp/u.maxHp)*100}%"></div></div>
    `;
    arena.appendChild(div);
  });

  // Render Enemies (Phải)
  enemies.forEach((u, i) => {
    const div = document.createElement('div');
    div.className = `enemy-unit ${currentStage===2 ? 'boss-pos' : 'enemy-pos-'+i}`;
    div.id = `unit-${u.uid}`;
    if(!u.alive) div.style.opacity = '0';
    div.innerHTML = `
      <div class="unit-sprite ${currentStage===2?'boss-sprite':''}" id="sprite-${u.uid}">${u.emoji}</div>
      <div class="hp-bar-float"><div class="hp-fill" style="width:${(u.hp/u.maxHp)*100}%; background:${currentStage===2?'#ff0000':'#0f0'}"></div></div>
    `;
    arena.appendChild(div);
  });
}

function showDmg(target, text, type) {
  const el = $(`unit-${target.uid}`);
  if(!el) return;
  const dmg = document.createElement('div');
  dmg.className = `dmg-text ${type}`;
  dmg.textContent = text;
  dmg.style.left = '20%';
  dmg.style.top = '10px';
  el.appendChild(dmg);
  setTimeout(() => dmg.remove(), 800);
}

function renderHUD() {
  // Hàng 1 + 2
  let pHtml = '', bHtml = '';
  allies.forEach(u => {
    const hpPct = (u.hp/u.maxHp)*100;
    const mpPct = (u.mp/u.maxMp)*100;
    pHtml += `
      <div class="hud-char">
        <div class="hud-portrait-box" style="border-color:${u.heroId===0?'#ff9f43':'#b06aff'}">
          <span class="hud-lvl">${state.heroes[u.heroId].level}</span>
          ${u.emoji}
        </div>
        <div class="hud-power">${Math.floor(u.maxHp+u.atk)}</div>
      </div>
    `;
    bHtml += `
      <div class="hud-bars-inner">
        <div class="hud-hp-bg"><div class="hud-hp-fill" style="width:${hpPct}%"></div></div>
        <div class="hud-mp-bg"><div class="hud-mp-fill" style="width:${mpPct}%"></div></div>
      </div>
    `;
  });
  $('hud-portraits').innerHTML = pHtml;
  $('hud-bars').innerHTML = bHtml;
}

function updateHUDButtons() {
  const ultBtn = $('hud-ult-btn');
  if (currentUnit && currentUnit.isAlly) {
    if (currentUnit.mp >= 100) {
      ultBtn.classList.add('ready');
    } else {
      ultBtn.classList.remove('ready');
    }
  } else {
    ultBtn.classList.remove('ready');
  }
  // Update Taichi visibility
  const el = $(`unit-${currentUnit.uid}`);
  if(el) {
    if(currentUnit.mp >= 100) el.classList.add('ult-ready');
    else el.classList.remove('ult-ready');
  }
}

function disableHUDButtons() {
  $('hud-ult-btn').classList.remove('ready');
}

/* ================= ACTIONS ================= */
function playerNormalAttack() {
  if (!currentUnit || !currentUnit.isAlly) return;
  disableHUDButtons();
  
  const target = enemies.find(e => e.alive);
  if (!target) return;

  const sprite = $(`sprite-${currentUnit.uid}`);
  sprite.classList.add('attacking-right'); // Animation 3D

  setTimeout(() => {
    sprite.classList.remove('attacking-right');
    const { dmg, isCrit, isMiss } = calculateDamage(currentUnit, target, 1.0);
    dealDamage(currentUnit, target, dmg, isCrit, isMiss);
    
    if (!isMiss) currentUnit.mp = Math.min(100, currentUnit.mp + 50);
    
    updateHUDButtons();
    renderHUD();
    checkWinCondition();
  }, 400);
}

function playerUltimate() {
  if (!currentUnit || !currentUnit.isAlly || currentUnit.mp < 100) return;
  disableHUDButtons();
  const heroId = currentUnit.heroId;
  const sprite = $(`sprite-${currentUnit.uid}`);

  if (heroId === 0) {
    // Trương Tam Phong
    let hits = 0;
    let target = enemies.find(e => e.alive);
    if(!target) return;
    
    function doHit() {
      if (hits >= 4 || !target || !target.alive) {
        if (target && target.alive) target.stunned = true;
        currentUnit.mp = 0;
        updateHUDButtons();
        renderHUD();
        checkWinCondition();
        return;
      }
      
      sprite.classList.add('attacking-right');
      setTimeout(() => {
        sprite.classList.remove('attacking-right');
        const { dmg, isCrit, isMiss } = calculateDamage(currentUnit, target, 1.2);
        dealDamage(currentUnit, target, dmg, isCrit, isMiss);
        hits++;
        if (target.alive) setTimeout(doHit, 250);
        else doHit();
      }, 300);
    }
    setTimeout(doHit, 200);

  } else if (heroId === 1) {
    // Sóc Vàng
    triggerHeartExplosion(currentUnit);
    sprite.style.transform = 'translateY(-30px) scale(1.2)';
    setTimeout(() => { sprite.style.transform = ''; }, 600);

    setTimeout(() => {
      const healAmount = currentUnit.atk;
      allies.forEach(a => {
        if (a.alive) {
          const amount = (a === currentUnit) ? Math.floor(healAmount * 0.7) : healAmount;
          a.hp = Math.min(a.maxHp, a.hp + amount);
          showDmg(a, `+${amount}`, 'heal');
        }
      });
      currentUnit.mp = 0;
      renderHUD();
      updateHUDButtons();
      checkWinCondition();
    }, 600);
  }
}

function enemyAction(enemy) {
  if (!enemy.alive) { processTurn(); return; }
  const target = allies.find(a => a.alive);
  if (!target) return;

  const sprite = $(`sprite-${enemy.uid}`);
  if(sprite) sprite.classList.add('attacking-left');

  setTimeout(() => {
    if(sprite) sprite.classList.remove('attacking-left');
    const { dmg, isCrit, isMiss } = calculateDamage(enemy, target, 1.0);
    dealDamage(enemy, target, dmg, isCrit, isMiss);
    checkWinCondition();
  }, 400);
}

function checkWinCondition() {
  const aliveEnemies = enemies.filter(e => e.alive).length;
  const aliveAllies = allies.filter(a => a.alive).length;

  if (aliveEnemies === 0) {
    if (currentStage === 1) {
      battleRunning = false;
      setTimeout(() => { currentStage = 2; spawnStage(); }, 1000);
    } else {
      battleRunning = false;
      setTimeout(() => {
        state.gold += 10000; state.gems += 500; state.currentRound++;
        updateHome();
        alert(`Chiến thắng! Chuyển sang trận ${state.currentRound}.`);
        exitBattle();
      }, 1000);
    }
    return;
  }
  if (aliveAllies === 0) {
    battleRunning = false;
    setTimeout(() => { alert("Thất bại!"); exitBattle(); }, 1000);
    return;
  }

  if (battleRunning) setTimeout(processTurn, 600);
}

function exitBattle() {
  battleRunning = false;
  $('boss-screen').style.display = 'none';
  switchTab('map', null);
}

function toggleAuto() {
  isAuto = !isAuto;
  $('auto-toggle').checked = isAuto;
  $('hud-treo-btn').textContent = isAuto ? 'Hủy Treo' : 'Treo';
  $('hud-treo-btn').style.background = isAuto ? 'radial-gradient(circle, #ffd700, #ff8f00)' : 'radial-gradient(circle, #4caf50, #1b5e20)';
  $('hud-treo-btn').style.color = isAuto ? '#000' : '#fff';

  // Nếu đang đến lượt người chơi và bật Auto, chạy tiếp
  if (isAuto && currentUnit && currentUnit.isAlly && battleRunning) {
    if (currentUnit.mp >= 100) playerUltimate();
    else playerNormalAttack();
  }
}

/* ================= HEART EXPLOSION ================= */
function triggerHeartExplosion(unit) {
  const overlay = $('heart-overlay');
  overlay.innerHTML = '';
  overlay.classList.add('active');

  const core = document.createElement('div');
  core.className = 'heart-core';
  core.textContent = '💚';
  overlay.appendChild(core);

  const heartColors = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤'];
  
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'heart-particle';
    p.textContent = heartColors[i % heartColors.length];
    
    const angle = (Math.PI * 2 / 18) * i;
    const distance = 150 + Math.random() * 150;
    
    p.style.left = '50%';
    p.style.top = '50%';
    p.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    p.style.setProperty('--rot', `${Math.random() * 360}deg`);

    overlay.appendChild(p);
  }

  setTimeout(() => {
    overlay.classList.remove('active');
    overlay.innerHTML = '';
  }, 1500);
}

updateHome();
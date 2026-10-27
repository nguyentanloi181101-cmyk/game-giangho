/* ================= DATA & STATE ================= */
const BASE_HEROES = [
  { id: 0, name: "U Cốc Âm Ma", emoji: "🥷", baseHp: 5000, baseAtk: 500, speed: 75, border: "purple" },
  { id: 1, name: "Thanh Y Nữ Hiệp", emoji: "🧔🏻", baseHp: 4000, baseAtk: 400, speed: 60, border: "orange" },
  { id: 2, name: "Tiểu Long Nữ", emoji: "👦🏻", baseHp: 3600, baseAtk: 450, speed: 65, border: "purple" },
  { id: 3, name: "Độc Cô Kiếm", emoji: "🧔🏻‍♂️", baseHp: 4500, baseAtk: 600, speed: 85, border: "orange" },
  { id: 4, name: "Trương Tam Phong", emoji: "🧙🏻‍♂️", baseHp: 5000, baseAtk: 500, speed: 75, border: "orange" }
];

let state = {
  gold: 21873054,
  gems: 2291,
  power: 537647,
  heroes: {
    0: { level: 70, stars: 5 },
    1: { level: 73, stars: 5 },
    2: { level: 70, stars: 5 },
    3: { level: 70, stars: 4 },
    4: { level: 73, stars: 3 }
  },
  team: [0, 1, 2, 3, 4],
  currentRound: 1
};

const $ = id => document.getElementById(id);

/* ================= UI INITIALIZATION ================= */
function updateHomeUI() {
  const container = $('home-team-slots');
  if (!container) return;

  container.innerHTML = state.team.map((id) => {
    const hero = BASE_HEROES.find(x => x.id === id);
    const data = state.heroes[id];
    return `
      <div class="hero-card border-${hero.border}">
        <div class="hero-top-left">
          <div class="hero-star-badge">★${data.stars}</div>
        </div>
        <div class="hero-bg-icon">${hero.emoji}</div>
        <div class="hero-bottom-info">
          <div class="hero-lvl">${data.level}</div>
          <div class="hero-stars-bottom">${'★'.repeat(data.stars)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function switchTab(tabId, el) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const target = $(`screen-${tabId}`);
  if (target) target.classList.add('active');
  else $('screen-home').classList.add('active');
  
  if (el) el.classList.add('active');
}

/* ================= COMBAT SYSTEM ================= */
let allies = [];
let enemies = [];
let battleRunning = false;
let isAuto = false;

function startBattle() {
  allies = state.team.map((id, index) => {
    const base = BASE_HEROES.find(x => x.id === id);
    const data = state.heroes[id];
    const hp = Math.floor(base.baseHp * (1 + data.level * 0.1));
    const atk = Math.floor(base.baseAtk * (1 + data.level * 0.1));
    
    return {
      uid: 'ally_' + id, heroId: id, name: base.name, emoji: base.emoji,
      maxHp: hp, hp: hp, atk: atk, speed: base.speed,
      maxMp: 100, mp: 0, isAlly: true, alive: true, index: index
    };
  });

  enemies = [
    { uid: 'boss_0', name: "Hắc Phong Yêu Vương", emoji: "👹", maxHp: 15000, hp: 15000, atk: 800, speed: 50, isAlly: false, alive: true }
  ];

  $('boss-screen').style.display = 'flex';
  renderArena();
  renderHUD();
  battleRunning = true;
}

function renderArena() {
  const arena = $('battle-arena');
  arena.innerHTML = '';
  
  allies.forEach((u, i) => {
    if (!u.alive) return;
    const div = document.createElement('div');
    div.className = `ally-unit pos-${i}`;
    div.id = `unit-${u.uid}`;
    div.innerHTML = `
      <div class="unit-sprite">${u.emoji}</div>
      <div class="hp-bar-float"><div class="hp-fill" style="width:${(u.hp/u.maxHp)*100}%"></div></div>
    `;
    arena.appendChild(div);
  });

  enemies.forEach((u) => {
    if (!u.alive) return;
    const div = document.createElement('div');
    div.className = `enemy-unit boss-pos`;
    div.id = `unit-${u.uid}`;
    div.innerHTML = `
      <div class="unit-sprite boss-sprite">${u.emoji}</div>
      <div class="hp-bar-float"><div class="hp-fill" style="width:${(u.hp/u.maxHp)*100}%; background:#ef4444"></div></div>
    `;
    arena.appendChild(div);
  });
}

function renderHUD() {
  let pHtml = '', bHtml = '';
  allies.forEach(u => {
    const hpPct = (u.hp/u.maxHp)*100;
    const mpPct = (u.mp/u.maxMp)*100;
    pHtml += `
      <div class="hud-char">
        <div class="hud-portrait-box">${u.emoji}</div>
        <div class="hud-power">${Math.floor(u.maxHp/10)}</div>
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

function playerNormalAttack() {
  if (!battleRunning) return;
  const target = enemies.find(e => e.alive);
  if (!target) return;

  target.hp -= 1500;
  if (target.hp <= 0) {
    target.hp = 0;
    target.alive = false;
    alert("Chiến thắng!");
    exitBattle();
  }
  renderArena();
  renderHUD();
}

function playerUltimate() {
  playerNormalAttack();
}

function toggleAuto() {
  isAuto = !isAuto;
  const btn = $('hud-treo-btn');
  btn.textContent = isAuto ? 'Hủy Treo' : 'Treo';
  btn.style.background = isAuto ? 'radial-gradient(circle, #facc15, #ca8a04)' : 'radial-gradient(circle, #22c55e, #15803d)';
  btn.style.color = isAuto ? '#000' : '#fff';
}

function exitBattle() {
  battleRunning = false;
  $('boss-screen').style.display = 'none';
}

// Khởi chạy ban đầu
document.addEventListener('DOMContentLoaded', () => {
  updateHomeUI();
});

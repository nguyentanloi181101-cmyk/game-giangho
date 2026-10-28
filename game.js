/* ================= DATA VÀ STATE CỦA GAME ================= */
const BASE_HEROES = [
  { id: 0, name: "U Cốc Âm Ma", emoji: "🥷", border: "purple" },
  { id: 1, name: "Thanh Y Nữ Hiệp", emoji: "🧔🏻", border: "orange" },
  { id: 2, name: "Tiểu Long Nữ", emoji: "👦🏻", border: "purple" },
  { id: 3, name: "Độc Cô Kiếm", emoji: "🧔🏻‍♂️", border: "orange" },
  { id: 4, name: "Trương Tam Phong", emoji: "🧙🏻‍♂️", border: "orange", use3D: true }
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
  team: [0, 1, 2, 3, 4]
};

const $ = id => document.getElementById(id);

/* ================= KHỞI TẠO TƯỚNG VÀ GIAO DIỆN ================= */
function renderHomeTeam() {
  const container = $('home-team-slots');
  if (!container) return;

  container.innerHTML = state.team.map((id) => {
    const hero = BASE_HEROES.find(x => x.id === id);
    const data = state.heroes[id];

    // Thẻ tướng thứ 5 sẽ ưu tiên hiển thị từ thư mục heroes_3d nếu có
    const spriteHTML = hero.use3D 
      ? `<div class="hero-bg-sprite" style="background-image: url('heroes_3d/truong_tam_phong.png'); background-size: contain; background-repeat: no-repeat; background-position: center bottom;"></div>`
      : `<div class="hero-bg-sprite">${hero.emoji}</div>`;

    return `
      <div class="hero-card border-${hero.border}">
        <div class="hero-top-star">
          <div class="star-icon-tag">★${data.stars}</div>
        </div>
        ${spriteHTML}
        <div class="hero-bottom-bar">
          <div class="hero-lvl">${data.level}</div>
          <div class="hero-stars">${'★'.repeat(data.stars)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function switchTab(tabId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen-${tabId}`);
  if (target) target.classList.add('active');
  else $('screen-home').classList.add('active');
}

/* ================= HỆ THỐNG TRẬN ĐẤU PVE ================= */
let battleRunning = false;
let isAuto = false;

function startBattle() {
  $('boss-screen').style.display = 'flex';
  battleRunning = true;
}

function exitBattle() {
  battleRunning = false;
  $('boss-screen').style.display = 'none';
}

function toggleAuto() {
  isAuto = !isAuto;
  const btn = $('hud-treo-btn');
  btn.textContent = isAuto ? 'Hủy Treo' : 'Treo';
  btn.style.background = isAuto ? 'radial-gradient(circle, #facc15, #ca8a04)' : 'radial-gradient(circle, #22c55e, #15803d)';
  btn.style.color = isAuto ? '#000' : '#fff';
}

function playerNormalAttack() {
  alert("Tấn công thường!");
}

function playerUltimate() {
  alert("Tuyệt kỹ Bát Quái Thái Cực!");
}

// Chạy khởi tạo khi trang nạp xong
document.addEventListener('DOMContentLoaded', () => {
  renderHomeTeam();
});
/* HUB "VÕ HIỆP" (thanh dưới) + MÀN CHỌN TƯỚNG TĂNG CẤP (nút Tăng Cấp ở trang chủ) */
function openVhub() { switchScreen('vhub'); }
function vhGo(k) {
  if (k === 'manh') return openRecruit();
  if (k === 'sao' || k === 'boiduong' || k === 'kynang') return openPicker(k);
  scToast('Tính năng sắp ra mắt');
}
let pkMode = 'boiduong';
function openPicker(mode) {
  pkMode = mode || 'boiduong';
  const t = { boiduong: 'Chọn Võ Hiệp thăng cấp', sao: 'Chọn Võ Hiệp tăng sao', kynang: 'Chọn Võ Hiệp nâng kỹ năng' }[pkMode];
  document.getElementById('pk-title').textContent = t;
  const order = HEROES.slice().sort((a, b) => (team.includes(b.id) - team.includes(a.id)) || (getProg(b.id).lv - getProg(a.id).lv));
  document.getElementById('pk-grid').innerHTML = order.map(h => {
    const p = getProg(h.id), inTeam = team.includes(h.id);
    return `<div class="pk-card ${(HERO_BORDER[h.id] || 'orange') === 'purple' ? 'purple' : ''}" onclick="openVoHiep(${h.id})">${inTeam ? '<div class="pk-tag">Đội</div>' : ''}<div class="e">${heroIcon(h)}</div><div class="n">${h.name}</div><div class="st">${'★'.repeat(Math.min(p.star, 5)) || '☆'}</div><div class="lv">Lv${p.lv}</div><button>Cấp Độ</button></div>`;
  }).join('');
  switchScreen('picker');
}

/* GHÉP MẢNH: đủ 10 mảnh của 1 tướng thì ghép thành tướng đó (cấp 1 ★1). Mở từ Võ Hiệp → Ghép Mảnh. */
(function () {
  const mc = document.querySelector('.main-content'); if (!mc) return;
  const sc = document.createElement('div'); sc.className = 'screen'; sc.id = 'screen-ghep';
  sc.innerHTML = '<div class="pve-header"><button class="btn-back" onclick="openVhub()">Trở về</button><h2 class="pve-title">Ghép Mảnh</h2></div><div class="pk-sub" id="gh-sub"></div><div class="pk-grid" id="gh-grid"></div>';
  mc.appendChild(sc);
  const canMerge = id => OWN_ON && !heroIsOwned(id) && shardsOf(id) >= MERGE_COST;
  window.ghepBadge = function () {
    const n = OWN_ON ? HEROES.filter(h => canMerge(h.id)).length : 0, b = document.getElementById('ghep-bd');
    if (b) { b.textContent = n; b.style.display = n ? '' : 'none'; }
  };
  window.ghepRender = function () {
    document.getElementById('gh-sub').textContent = OWN_ON ? `Đủ ${MERGE_COST} mảnh của một tướng để ghép thành tướng đó` : 'Tài khoản này đã có đủ tướng';
    const order = HEROES.slice().sort((a, b) => (heroIsOwned(a.id) - heroIsOwned(b.id)) || (canMerge(b.id) - canMerge(a.id)) || (shardsOf(b.id) - shardsOf(a.id)) || (a.id - b.id));
    document.getElementById('gh-grid').innerHTML = order.map(h => {
      const own = heroIsOwned(h.id), n = shardsOf(h.id), ok = canMerge(h.id);
      return `<div class="pk-card ${(HERO_BORDER[h.id] || 'orange') === 'purple' ? 'purple' : ''}" style="${own ? 'opacity:.55;' : ''}cursor:default"><div class="e">${heroIcon(h)}</div><div class="n">${h.name}</div>` +
        (own ? '<div class="lv">✔ Đã có</div>' : `<div class="lv">🧩 ${n}/${MERGE_COST}</div><button class="rc-btn" style="margin-top:4px;padding:3px 10px;font-size:12px" ${ok ? '' : 'disabled'} onclick="ghepDo(${h.id})">Ghép</button>`) + '</div>';
    }).join('');
    ghepBadge();
  };
  window.ghepDo = function (id) {
    if (!heroGain(id)) { if (typeof scToast === 'function') scToast(`Chưa đủ ${MERGE_COST} mảnh`); return; }
    try { renderHomeTeam(); updatePower(); renderPvp(); } catch (e) {}
    if (typeof scToast === 'function') scToast('🎉 Đã ghép thành tướng ' + heroById(id).name + '!');
    ghepRender();
  };
  const _go = vhGo;
  vhGo = function (k) { if (k === 'ghep') { ghepRender(); return switchScreen('ghep'); } return _go(k); };
  const _ov = window.openVhub; window.openVhub = function () { ghepBadge(); return _ov.apply(this, arguments); };
  setInterval(ghepBadge, 3000); ghepBadge();
})();

/* ĐỘI NGŨ + TRỢ HỖ TRỢ
   - Chạm tướng trong đội để mở màn chọn tướng và thay vị trí đó.
   - Có 6 ô hỗ trợ; chỉ số Bồi Dưỡng (HP/Công/Thủ/Hồi) được nhân theo sao / 10
     rồi cộng cho từng tướng đang ra trận. Ví dụ 100 HP bồi dưỡng: ★10 = +100 HP, ★15 = +150 HP.
*/
(function () {
  const TEAM_MAX = 5, SUPPORT_MAX = 6;
  const TEAM_KEY = 'team_ids', SUPPORT_KEY = 'team_support_ids';
  let supportIds = [];
  let pickMode = 'team', pickIndex = 0, teamReturnScreen = 'home';

  try { supportIds = JSON.parse(localStorage.getItem(SUPPORT_KEY)) || []; } catch (e) { supportIds = []; }
  const seenSupport = new Set();
  supportIds = Array.from({ length: SUPPORT_MAX }, (_, i) => {
    const id = supportIds[i];
    if (!HEROES.some(h => h.id === id) || team.includes(id) || seenSupport.has(id)) return null;
    seenSupport.add(id); return id;
  });
  function saveTeam() {
    try { localStorage.setItem(TEAM_KEY, JSON.stringify(team)); } catch (e) {}
  }
  function saveSupport() {
    try { localStorage.setItem(SUPPORT_KEY, JSON.stringify(supportIds)); } catch (e) {}
  }
  if (typeof SV_KEYS !== 'undefined' && !SV_KEYS.includes(SUPPORT_KEY)) SV_KEYS.push(SUPPORT_KEY);

  const starOf = id => { try { return Math.max(1, Math.min(15, getProg(id).star || 1)); } catch (e) { return 1; } };
  function supportBaseStats(id) {
    try {
      if (typeof getCultivationBonusForSupport === 'function') return getCultivationBonusForSupport(id);
      const all = JSON.parse(localStorage.getItem('dp_prog') || '{}'), exp = Math.max(0, Number((all[id] || {}).exp) || 0);
      return { hp: Math.round(exp * .5), atk: Math.round(exp * .3), def: Math.round(exp * .1), heal: Math.round(exp * .1) };
    } catch (e) { return { hp: 0, atk: 0, def: 0, heal: 0 }; }
  }
  function contribution(id) {
    const raw = supportBaseStats(id), factor = starOf(id) / 10;
    return { hp: Math.round((raw.hp || 0) * factor), atk: Math.round((raw.atk || 0) * factor), def: Math.round((raw.def || 0) * factor), heal: Math.round((raw.heal || 0) * factor) };
  }
  function teamSupportTotal() {
    const total = { hp: 0, atk: 0, def: 0, heal: 0 };
    supportIds.forEach(id => {
      if (id == null || team.includes(id)) return;
      const b = contribution(id);
      total.hp += b.hp; total.atk += b.atk; total.def += b.def; total.heal += b.heal;
    });
    return total;
  }
  window.teamSupportTotal = teamSupportTotal;

  // Áp trợ lực vào chỉ số của mỗi tướng đang ra trận (PVE, PVP và màn chi tiết).
  const _heroStatsWithSupport = heroStats;
  heroStats = function (id, base) {
    const s = _heroStatsWithSupport(id, base);
    if (team.includes(id)) {
      const b = teamSupportTotal();
      s.hp = (s.hp || 0) + b.hp;
      s.atk = (s.atk || 0) + b.atk;
      s.def = (s.def || 0) + b.def;
      s.heal = (s.heal || 0) + b.heal;
    }
    return s;
  };

  const host = document.getElementById('screen-home').parentNode;
  const makeScreen = (id, html) => {
    if (document.getElementById('screen-' + id)) return;
    const el = document.createElement('div'); el.className = 'screen'; el.id = 'screen-' + id; el.innerHTML = html; host.appendChild(el);
  };
  makeScreen('team', `
    <div class="tf-head"><button class="btn-back" onclick="teamFormationBack()">Trở về</button><h2>Đội Ngũ</h2><button class="tf-small" onclick="openThanThu()">Thần Thú</button></div>
    <div class="tf-body" id="tf-body"></div>`);
  makeScreen('team-pick', `
    <div class="tf-head"><button class="btn-back" onclick="teamPickBack()">Trở về</button><h2 id="tf-pick-title">Chọn Võ Hiệp</h2><button class="tf-small" onclick="teamPickClear()">Bỏ ô</button></div>
    <div class="tf-body"><div class="tf-tip" id="tf-pick-tip"></div><div class="tf-pick-grid" id="tf-pick-grid"></div></div>`);

  const _switchScreenTeam = switchScreen;
  switchScreen = function (id) {
    _switchScreenTeam(id);
    if (id === 'team' || id === 'team-pick') {
      document.getElementById('app-header').style.display = 'block';
      document.getElementById('app-nav').style.display = 'flex';
    }
  };

  function portrait(h) { return `<div class="tf-portrait">${heroIcon(h)}</div>`; }
  function statText(n) {
    try { return typeof fmtN === 'function' ? fmtN(n || 0) : String(n || 0); } catch (e) { return String(n || 0); }
  }
  function renderTeamFormation() {
    const body = document.getElementById('tf-body'); if (!body) return;
    const support = teamSupportTotal();
    const slots = Array.from({ length: TEAM_MAX }, (_, i) => {
      const id = team[i], h = id == null ? null : heroById(id);
      if (!h) return `<button class="tf-hero-slot empty" onclick="teamPickOpen('team',${i})"><span class="tf-plus">＋</span><b>Thêm tướng</b></button>`;
      const p = getProg(id), s = heroStats(id);
      return `<button class="tf-hero-slot" onclick="teamPickOpen('team',${i})">${portrait(h)}<b class="tf-name">${h.name}</b><span class="tf-lv">Lv.${p.lv} · ★${p.star}</span><span class="tf-stat">HP ${statText(s.hp)}</span><span class="tf-stat">Công ${statText(s.atk)}</span></button>`;
    }).join('');
    const supports = Array.from({ length: SUPPORT_MAX }, (_, i) => {
      const id = supportIds[i], h = id == null ? null : heroById(id);
      if (!h) return `<button class="tf-support-slot empty" onclick="teamPickOpen('support',${i})"><span class="tf-plus">＋</span><b>Chọn hỗ trợ</b></button>`;
      const p = getProg(id), raw = supportBaseStats(id), b = contribution(id);
      return `<button class="tf-support-slot" onclick="teamPickOpen('support',${i})">${portrait(h)}<b class="tf-name">${h.name}</b><span class="tf-lv">★${p.star} · x${(p.star / 10).toFixed(1)}</span><span class="tf-stat">HP +${statText(b.hp)}</span><span class="tf-stat">Công +${statText(b.atk)} · Thủ +${statText(b.def)}</span><span class="tf-stat">Hồi +${statText(b.heal)}</span></button>`;
    }).join('');
    body.innerHTML = `
      <div class="tf-section-title">⚔️ ĐỘI RA TRẬN <small>${team.length}/${TEAM_MAX}</small></div>
      <div class="tf-heroes">${slots}</div>
      <div class="tf-hint">Chạm vào tướng hoặc ô trống để chọn/thay tướng. Đội ra trận tối đa 5 tướng.</div>
      <div class="tf-section-title support-title">🤝 TRỢ HỖ TRỢ <small>${supportIds.filter(x => x != null).length}/${SUPPORT_MAX}</small></div>
      <div class="tf-support-grid">${supports}</div>
      <div class="tf-bonus"><b>✨ Trợ lực cộng cho MỖI tướng trong đội</b><div>❤️ HP <strong>+${statText(support.hp)}</strong></div><div>⚔️ Công <strong>+${statText(support.atk)}</strong></div><div>🛡️ Thủ <strong>+${statText(support.def)}</strong></div><div>💚 Hồi <strong>+${statText(support.heal)}</strong></div><small>Chỉ số lấy từ Bồi Dưỡng của tướng hỗ trợ × số sao ÷ 10. ★10 nhận 100%; ★15 nhận 150%.</small></div>
      <button class="tf-done" onclick="teamFormationBack()">Xong</button>`;
  }

  window.openTeam = function () {
    const active = document.querySelector('.screen.active');
    const activeId = active ? active.id.replace(/^screen-/, '') : 'home';
    teamReturnScreen = (activeId && !['team', 'team-pick'].includes(activeId)) ? activeId : 'home';
    renderTeamFormation(); switchScreen('team');
  };
  window.teamFormationBack = function () {
    renderHomeTeam();
    try { updatePower(); } catch (e) {}
    try { renderPvp(); } catch (e) {}
    switchScreen(teamReturnScreen || 'home');
  };
  window.teamPickOpen = function (mode, index) {
    pickMode = mode; pickIndex = index;
    document.getElementById('tf-pick-title').textContent = mode === 'team' ? 'Chọn Võ Hiệp ra trận' : 'Chọn tướng hỗ trợ';
    document.getElementById('tf-pick-tip').textContent = mode === 'team'
      ? 'Chọn tướng để thay vào vị trí đã chạm. Chọn tướng đang ở vị trí khác sẽ đổi chỗ.'
      : 'Tướng hỗ trợ không được trùng với 5 tướng ra trận hoặc các ô hỗ trợ khác.';
    const ids = mode === 'team' ? team : supportIds;
    document.getElementById('tf-pick-grid').innerHTML = HEROES.map(h => {
      const p = getProg(h.id), activeTeam = team.includes(h.id), activeSupport = supportIds.includes(h.id);
      const disabled = mode === 'support' ? activeTeam : false;
      const badge = activeTeam ? 'ĐỘI RA TRẬN' : activeSupport ? 'ĐANG HỖ TRỢ' : '';
      return `<button class="tf-pick-card ${disabled ? 'disabled' : ''} ${ids[pickIndex] === h.id ? 'selected' : ''}" ${disabled ? 'disabled' : ''} onclick="teamPickChoose(${h.id})">${badge ? `<span class="tf-tag">${badge}</span>` : ''}${portrait(h)}<b>${h.name}</b><span>Lv.${p.lv} · ★${p.star}</span></button>`;
    }).join('');
    switchScreen('team-pick');
  };
  window.teamPickChoose = function (id) {
    if (!HEROES.some(h => h.id === id)) return;
    if (pickMode === 'team') {
      const oldIndex = team.indexOf(id), current = team[pickIndex];
      if (oldIndex >= 0) {
        if (oldIndex !== pickIndex && pickIndex < team.length) {
          team[oldIndex] = current; team[pickIndex] = id;
        }
      } else if (pickIndex < team.length) team[pickIndex] = id;
      else if (team.length < TEAM_MAX) team.push(id);
      team = team.filter((x, i, a) => a.indexOf(x) === i).slice(0, TEAM_MAX);
      supportIds = supportIds.map(x => team.includes(x) ? null : x);
      saveTeam(); saveSupport();
    } else {
      if (team.includes(id)) return;
      const other = supportIds.indexOf(id);
      const old = supportIds[pickIndex];
      if (other >= 0 && other !== pickIndex) supportIds[other] = old == null ? null : old;
      supportIds[pickIndex] = id;
      saveSupport();
    }
    renderTeamFormation();
    try { renderHomeTeam(); } catch (e) {}
    try { updatePower(); } catch (e) {}
    try { renderPvp(); } catch (e) {}
    switchScreen('team');
  };
  window.teamPickClear = function () {
    if (pickMode === 'team') {
      if (team.length <= 1) { if (typeof scToast === 'function') scToast('Đội phải có ít nhất 1 tướng.'); return; }
      team.splice(pickIndex, 1);
      saveTeam();
    } else {
      supportIds[pickIndex] = null; saveSupport();
    }
    renderTeamFormation(); switchScreen('team');
  };
  window.teamPickBack = function () { renderTeamFormation(); switchScreen('team'); };

  // Nếu cài đặt/đột phá thay đổi chỉ số thì cập nhật giao diện đội khi đang mở.
  const _renderHomeTeamTF = renderHomeTeam;
  renderHomeTeam = function () {
    _renderHomeTeamTF();
    if (document.getElementById('screen-team') && document.getElementById('screen-team').classList.contains('active')) renderTeamFormation();
  };
})();

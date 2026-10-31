/* MÀN NÂNG CẤP 1 TƯỚNG: Tăng Sao / Thăng Cấp (Bồi Dưỡng) / Nâng Kỹ Năng.
   Luồng: Võ Hiệp -> chọn mục -> chọn tướng -> màn này (trước ➜ sau). Tăng sao chỉ cần MẢNH của chính tướng. */

    let upgId = 0;
    const UPG_TITLE = { sao: 'Tăng Sao', boiduong: 'Thăng Cấp', kynang: 'Nâng Kỹ Năng' };
    (function () {
      const sc = document.createElement('div'); sc.className = 'screen'; sc.id = 'screen-upg';
      sc.innerHTML = '<div class="pve-header"><button class="btn-back" onclick="openPicker(pkMode)">Trở về</button><h2 class="pve-title" id="upg-title"></h2></div><div class="upg-body" id="upg-body"></div>';
      document.getElementById('screen-picker').parentNode.appendChild(sc);
    })();
    function statsAt(id, patch) {   // chỉ số nếu tướng có cấp / sao / kỹ năng như `patch`
      const old = heroProg[id], had = Object.prototype.hasOwnProperty.call(heroProg, id);
      heroProg[id] = Object.assign({}, getProg(id), patch);
      try { return heroStats(id); } finally { if (had) heroProg[id] = old; else delete heroProg[id]; }
    }
    function openUpg(id) { upgId = id; vmId = id; switchScreen('upg'); renderUpg(); }
    function upgNav(d) {
      const ids = HEROES.map(h => h.id), i = ids.indexOf(upgId); upgId = vmId = ids[(i + d + ids.length) % ids.length]; renderUpg();
    }
    function renderUpg() {
      const sc = document.getElementById('screen-upg'); if (!sc || !sc.classList.contains('active')) return;
      const h = heroById(upgId), p = getProg(upgId), cs = heroStats(upgId), mode = pkMode;
      document.getElementById('upg-title').textContent = UPG_TITLE[mode];
      const capLv = heroCap(upgId), capStar = starCapOf(p.lv);
      let patch = null, maxed = false;
      if (mode === 'sao') { maxed = p.star >= capStar; patch = { star: p.star + 1 }; }
      else if (mode === 'boiduong') { maxed = p.lv >= capLv; patch = { lv: p.lv + 1 }; }
      else { maxed = p.sk >= SKILL_MAX; patch = { sk: p.sk + 1 }; }
      const ns = maxed ? cs : statsAt(upgId, patch), np = maxed ? p : Object.assign({}, p, patch);
      const row = (l, a, b) => `<div class="up-r"><span>${l}</span><b>${a}</b><b class="${b !== a ? 'up' : ''}">${b}</b></div>`;
      let rows;
      if (mode === 'kynang') {
        const eff = s => Math.round(100 * skillMultOf(s)) + '%';
        rows = row('Kỹ năng', 'Lv ' + p.sk, 'Lv ' + np.sk) + row('Hiệu lực tuyệt kỹ', eff(p.sk), eff(np.sk)) + row('Tuyệt kỹ', HERO_ULT_NAME[upgId] || 'Tuyệt Kỹ', HERO_ULT_NAME[upgId] || 'Tuyệt Kỹ');
      } else {
        const f = (k, fn) => row(k[0], (fn || fmtN)(cs[k[1]]), (fn || fmtN)(ns[k[1]]));
        rows = row('Cấp', p.lv, np.lv) + [['HP', 'hp'], ['Công', 'atk'], ['Thủ', 'def'], ['Tốc', 'spd'], ['Bạo', 'crit'], ['Bạo Sát', 'critDmg'], ['Bền', 'tough'], ['Chuẩn', 'acc'], ['Né', 'dodge'], ['Phá giáp', 'pierce'], ['Đỡ đòn', 'block']].map(k => f(k, k[1] === 'block' ? (v => tsFmt(v) + '%') : (v => (k[1] === 'hp' || k[1] === 'atk' || k[1] === 'def' || k[1] === 'pierce') ? fmtN(v) : tsFmt(v)))).join('');
      }
      const art = (star, cls) => `<div class="up-hero ${cls}"><div class="up-fig">${h.body ? `<img src="${h.body}" alt="${h.name}">` : heroIcon(h)}</div><div class="up-plat"></div><div class="up-stars">${'★'.repeat(Math.min(star, 5)) + '☆'.repeat(Math.max(0, 5 - star))}${star > 5 ? ' ×' + star : ''}</div></div>`;
      let cost = '', btns = '';
      if (mode === 'sao') {
        const need = starCost(p.star + 1), have = shardsOf(upgId), ok = have >= need;
        cost = maxed ? '<div class="up-max">Đã đạt sao tối đa theo cấp hiện tại — tăng cấp tướng để mở thêm sao</div>' : `<div class="up-cost"><div class="up-it"><div class="e">${heroIcon(h)}</div><b class="${ok ? '' : 'bad'}">${have}/${need}</b><small>Mảnh ${h.name}</small></div></div>`;
        btns = `<button class="up-go" ${maxed || !ok ? 'disabled' : ''} onclick="upgradeHero('star',1)">Tăng Sao</button>`;
      } else if (mode === 'boiduong') {
        const c = lvCost(p.lv + 1), k = lvAffordable(p.lv, 1) >= 1;
        cost = maxed ? '<div class="up-max">Đã đạt cấp tối đa hiện tại (cần 🔑 để mở thêm)</div>' : `<div class="up-cost"><div class="up-it"><div class="e">🥈</div><b class="${silver >= c.silver ? '' : 'bad'}">${fmtN(silver)}/${fmtN(c.silver)}</b><small>Bạc</small></div><div class="up-it"><div class="e">🌾</div><b class="${rice >= c.rice ? '' : 'bad'}">${fmtN(rice)}/${fmtN(c.rice)}</b><small>Gạo</small></div></div>`;
        btns = `<button class="up-go" ${maxed || !k ? 'disabled' : ''} onclick="upgradeHero('lv',1)">+1 Cấp</button><button class="up-go alt" ${maxed || !k ? 'disabled' : ''} onclick="upgradeHero('lv',10)">+10 Cấp</button>`;
      } else {
        cost = maxed ? '<div class="up-max">Kỹ năng đã tối đa</div>' : '<div class="up-max" style="color:#86efac">Nâng kỹ năng miễn phí</div>';
        btns = `<button class="up-go" ${maxed ? 'disabled' : ''} onclick="upgradeHero('sk',1)">Nâng Kỹ Năng</button>`;
      }
      document.getElementById('upg-body').innerHTML = `
        <div class="up-name"><button onclick="upgNav(-1)">◀</button><b>${h.name}</b><button onclick="upgNav(1)">▶</button></div>
        <div class="up-stage ${mode}">${art(p.star, 'l')}<div class="up-tbl"><div class="up-r hd"><span></span><b>Hiện tại</b><b>Sau</b></div>${rows}</div>${art(np.star, 'r')}</div>
        ${mode === 'kynang' ? `<div class="up-desc">${heroSkills(upgId)[1].desc}</div>` : ''}${cost}<div class="up-btns">${btns}</div>
        <div class="up-note">${mode === 'sao' ? 'Tăng sao chỉ cần mảnh tướng. Cấp tướng được giữ nguyên, chỉ số tăng mạnh.' : mode === 'boiduong' ? 'Tăng cấp tốn bạc + gạo (nhận khi thắng Bàn PVE).' : 'Mỗi cấp kỹ năng tăng hiệu lực tuyệt kỹ.'}</div>`;
    }
    const skillMultOf = sk => 1 + SKILL_GROWTH * (sk - 1);

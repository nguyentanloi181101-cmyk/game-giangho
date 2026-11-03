/* QUẢN LÝ VÕ HIỆP: vẽ màn hình
   (tách từ index.html cũ — script) */

    function renderVoHiep() {
      const h = heroById(vmId), p = getProg(vmId), st = heroStats(vmId);
      const chips = HEROES.map(x => { const q = getProg(x.id);
        return `<div class="hchip ${x.id === vmId ? 'sel' : ''}" onclick="vmSelect(${x.id})"><div class="e">${heroIcon(x)}</div><div class="n">${x.name}</div><div class="s">Lv${q.lv} ★${q.star}</div></div>`; }).join('');
      const up = (title, cur, next, note, btns) => `<div class="vm-up"><div class="vm-up-info"><b>${title}</b><span>${next ? cur + ' → ' + next : cur + ' (tối đa)'}</span><small>${note}</small></div><div class="vm-up-btns">${btns}</div></div>`;
      const lvCap = heroCap(vmId), lvMax = p.lv >= lvCap, lvFull = p.lv >= LV_MAX, starMax = p.star >= starCapOf(p.lv), skMax = p.sk >= SKILL_MAX;
      document.getElementById('vm-body').innerHTML = `
        <div class="hero-chips">${chips}</div>
        <div class="vm-hero"><div class="hd-ico">${heroIcon(h)}</div><div class="hd-info"><div class="hd-name">${h.name}</div><div class="hd-sub">Cấp ${p.lv}/${LV_MAX} • ★${p.star}/${starCapOf(p.lv)} • Kỹ năng ${p.sk}/${SKILL_MAX}</div><div class="hd-sub">HP ${fmtN(st.hp)} • Công ${fmtN(st.atk)} • Thủ ${fmtN(st.def)} • Tốc ${st.spd}</div></div></div>
        ${up('⬆ Tăng Cấp', 'Cấp ' + p.lv + '/' + lvCap, lvMax ? '' : 'Cấp ' + (p.lv + 1), `+${LV_GROWTH * 100}% HP / Công / Thủ mỗi cấp` + (lvMax ? '' : ` • Lên cấp ${p.lv + 1} tốn 🥈 ${fmtN(lvCost(p.lv + 1).silver)} + 🌾 ${fmtN(lvCost(p.lv + 1).rice)} (có 🥈 ${fmtN(silver)} • 🌾 ${fmtN(rice)}). +10 cấp: nâng tối đa 10 cấp trong khả năng`) + ` • 🔑 ${keyCount()} (bấm 🔒 trang chủ: 1 🔑 = +${KEY_LV} cấp)` + (lvMax ? (lvFull ? ' • Đã đạt cấp tối đa' : ' • 🔒 Dùng 🔑 bấm 🔒 ở trang chủ để mở thêm cấp') : ''),
             `<button ${lvMax || lvAffordable(p.lv, 1) < 1 ? 'disabled' : ''} onclick="upgradeHero('lv',1)">+1 cấp</button><button ${lvMax || lvAffordable(p.lv, 1) < 1 ? 'disabled' : ''} onclick="upgradeHero('lv',10)">+10 cấp</button>`)}
        ${up('⭐ Tăng Sao', '★' + p.star, starMax ? '' : '★' + (p.star + 1), `+${STAR_GROWTH * 100}% HP / Công / Thủ mỗi sao` + (starMax ? '' : ` • 🧩 Cần ${starCost(p.star + 1)} mảnh (có ${shardsOf(vmId)})`),
             `<button ${starMax || shardsOf(vmId) < starCost(p.star + 1) ? 'disabled' : ''} onclick="upgradeHero('star',1)">Tăng sao</button>`)}
        ${up('📖 Tăng Cấp Kỹ Năng', 'Kỹ năng ' + p.sk, skMax ? '' : 'Kỹ năng ' + (p.sk + 1), `+${SKILL_GROWTH * 100}% hiệu lực tuyệt kỹ mỗi cấp`,
             `<button ${skMax ? 'disabled' : ''} onclick="upgradeHero('sk',1)">Nâng cấp</button>`)}
        <div class="vm-links"><button onclick="openEquip()">🎒 Trang bị</button><button onclick="openHeroDetail(${vmId})">📊 Xem thông số &amp; kỹ năng</button><button onclick="resetHeroProgress()">↺ Đặt lại tất cả (Test)</button></div>`;
    }

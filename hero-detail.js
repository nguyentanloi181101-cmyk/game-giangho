/* TƯỚNG: thẻ tướng trang chủ và bảng chi tiết tướng
   (tách từ index.html cũ — script) */

    // ---- Thẻ tướng ở trang chủ ----
    function renderHomeTeam() {
      const row = document.getElementById('home-team-row'); if (!row) return;
      row.innerHTML = team.map(id => {
        const h = heroById(id); if (!h) return '';
        const p = getProg(id), b = HERO_BORDER[id] || 'orange';
        return `<div class="hero-card border-${b}" onclick="openHeroDetail(${id})"><div class="hero-top-star"></div><div class="hero-bg-sprite">${heroIcon(h)}</div><div class="hero-bottom-bar"><div class="hero-lvl">${p.lv}</div><div class="hero-stars">${homeStars(p.star)}</div></div></div>`;
      }).join('');
    }

    // ---- Chi tiết tướng (bấm vào thẻ tướng ở trang chủ) ----
    let detailId = null;
    function openHeroDetail(id) {
      detailId = id;
      const h = heroById(id), p = getProg(id), st = heroStats(id), g = growth(id), f = frameOf(id), eb = equipBonus(f), pb = pvpBonus(f);
      document.getElementById('hd-ico').innerHTML = heroIcon(h);
      document.getElementById('hd-name').innerHTML = h.name + (f >= 0 ? `<span class="hd-frame">Khung ${f + 1}</span>` : '');
      document.getElementById('hd-sub').innerText = `Cấp ${p.lv}/${LV_MAX} • ${starStr(p.star)} (${p.star}/${starCapOf(p.lv)}) • Kỹ năng ${p.sk}/${SKILL_MAX}`;
      const gb = (typeof gdBonus === 'function') ? gdBonus() : {};   // cộng từ Lò Luyện Hỏa của bang (đã nằm sẵn trong heroStats → dùng cho cả PVE lẫn Tỷ Võ)
      const line = (label, val, bonus, pv, ts, gd) => `<div class="hd-line"><span>${label}</span><span>${val}${bonus ? ` <em>+${fmtN(bonus)}</em>` : ''}${pv ? ` <em class="pv" title="Cộng từ Tỷ Võ">+${fmtN(pv)}🏅</em>` : ''}${ts ? ` <em class="ts" title="Cộng từ Bảo Vật">+${fmtN(ts)}🔮</em>` : ''}${gd ? ` <em class="gd" title="Cộng từ Bang (Lò Luyện Hỏa)">+${fmtN(gd)}🏰</em>` : ''}</span></div>`;
      const tb = tsBonus(id);
      document.getElementById('hd-stats').innerHTML =
        line('❤️ HP', fmtN(st.hp), eb.hp, pb.hp, tb.hpFlat, gb.hp) + line('⚔️ Công', fmtN(st.atk), eb.atk, pb.atk, tb.atkFlat, gb.atk) + line('🛡️ Thủ', fmtN(st.def), eb.def, pb.def, 0, gb.def) +
        line('⚡ Tốc', st.spd, eb.spd, 0, tb.spd, gb.spd) + line('💨 Né', tsFmt(st.dodge)) + line('🎯 Chuẩn', tsFmt(st.acc)) + line('💥 Bạo', tsFmt(st.crit)) + line('🔥 Bạo Sát', tsFmt(st.critDmg), 0, 0, 0, gb.critDmg) + line('🧱 Bền', tsFmt(st.tough)) + line('🗡️ Phá giáp', fmtN(st.pierce), 0, 0, 0, gb.pierce) + line('💚 Hồi máu', fmtN(st.heal || 0) + '/hiệp', 0, 0, 0, gb.heal) + line('🛡️ Đỡ đòn', tsFmt(st.block) + '%') +
        line('🎭 Chất tướng', ROLE_ICON[HERO_ROLE[id]] + ' ' + ROLE_NAME[HERO_ROLE[id]]) + line('🔥 Nộ khởi đầu', st.rage) +
        line('📈 Hệ số cấp/sao', '×' + g.toFixed(2)) +
        (f < 0 ? '<div class="set-note" style="margin-top:6px">Tướng chưa ra trận nên không có khung để gắn trang bị.</div>' : '');
      document.getElementById('hd-slots').innerHTML = EQUIP.map(e => {
        const it = eqAt(f, e.k);
        return `<div class="hd-slot ${it ? '' : 'empty'}" onclick="openEquip('${e.k}',${f})"><span>${e.icon}</span><small>${it ? 'Lv.' + it.lv : 'Gắn'}</small></div>`;
      }).join('');
      const tl = tsOfFrame(f);
      document.getElementById('hd-ts').innerHTML = Array.from({ length: TS_PER_HERO }, (_, i) => {
        const x = tl[i], act = f >= 0 ? `tsOpen(${f})` : '';
        return x ? `<div class="hd-slot" onclick="${act}"><span>${tsIcon(x.id)}</span><small>Lv.${x.lv}</small>${x.star ? `<small class="st">★${x.star}</small>` : ''}</div>` : `<div class="hd-slot empty" onclick="${act}"><span>📜</span><small>Gắn</small></div>`;
      }).join('');
      document.getElementById('hd-skills').innerHTML = heroSkills(id).map(k =>
        `<div class="sk-card"><div class="sk-name">${k.name}<span class="sk-tag">${k.tag}</span>${k.lv ? `<span class="sk-lv">Lv ${k.lv}</span>` : ''}</div><div class="sk-desc">${k.desc}</div></div>`).join('');
      document.getElementById('hero-modal').style.display = 'flex';
    }
    function closeHeroDetail() { document.getElementById('hero-modal').style.display = 'none'; }
    function upgradeFromDetail() { const id = detailId; closeHeroDetail(); openVoHiep(id); }

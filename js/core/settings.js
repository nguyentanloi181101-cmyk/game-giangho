/* CÀI ĐẶT: âm thanh, chỉnh thông số tướng
   (tách từ index.html cũ — script) */

    // ---- Cài đặt: chỉnh thông số cơ bản ----
    let setId = 0, savedTimer = null;
    // ---- Cài đặt âm thanh: bật/tắt nhạc nền & âm skill (lưu trong trình duyệt) ----
    let audioSet = Object.assign({ bgm: true, skill: true }, loadJSON('audio_set'));
    function renderAudioSwitches() {
      ['bgm', 'skill'].forEach(k => {
        const b = document.getElementById('sw-' + k); if (!b) return;
        b.className = 'snd-sw ' + (audioSet[k] ? 'on' : 'off');
        b.innerText = audioSet[k] ? 'BẬT' : 'TẮT';
      });
    }
    function toggleAudio(k) {
      audioSet[k] = !audioSet[k]; saveJSON('audio_set', audioSet);
      if (k === 'bgm') { if (audioSet.bgm) { if (document.getElementById('battle-overlay').style.display === 'flex') playBgm(); } else stopBgm(); }
      if (k === 'skill' && !audioSet.skill) { stopHeroSounds(); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }
      renderAudioSwitches();
    }
    function updateRoster() {
      const ico = document.getElementById('ru-ico');
      if (ico) ico.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 700, easing: 'ease-in-out' });
      let n = 0;
      try { n = enemyPool().length; pvpGenOpps(); } catch (e) {}
      try { renderTeam(); renderHomeTeam(); renderSettings(); renderPvp(); } catch (e) {}
      const m = document.getElementById('ru-msg');
      if (m) m.textContent = `✅ Đã cập nhật ${n} tướng vào PvE (trận 1, 2, 4) và Tỷ Võ. Đối thủ Tỷ Võ đã được làm mới.`;
    }
    function toggleSvBox(force) {
      const w = document.getElementById('sv-wrap'), b = document.getElementById('sv-open-btn');
      const show = force === undefined ? w.style.display === 'none' : force;
      w.style.display = show ? 'block' : 'none'; b.innerHTML = show ? '✕ Đóng' : '📂 Mở';
    }
    function toggleSetEdit(force) {
      const w = document.getElementById('set-edit-wrap'), b = document.getElementById('set-edit-btn');
      const show = force === undefined ? w.style.display === 'none' : force;
      w.style.display = show ? 'block' : 'none'; b.innerHTML = show ? '✕ Đóng' : '✏️ Chỉnh sửa';
    }
    function openSettings() { toggleSetEdit(false); toggleSvBox(false); setId = HEROES[0].id; renderAudioSwitches(); if (typeof clRender === 'function') clRender(); renderSettings(); document.getElementById('settings-modal').style.display = 'flex'; }
    function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; renderHomeTeam(); }
    function setSetHero(id) { setId = id; renderSettings(); }
    function renderSettings() {
      const h = heroById(setId);
      document.getElementById('set-chips').innerHTML = HEROES.map(x =>
        `<div class="hchip ${x.id === setId ? 'sel' : ''}" onclick="setSetHero(${x.id})"><div class="e">${heroIcon(x)}</div><div class="n">${x.name}</div></div>`).join('');
      const rcur = HERO_ROLE[setId];
      const roleHtml = `<div class="role-box"><div class="role-title">🎭 Chất tướng<small>${ROLE_DESC[rcur]}</small></div><div class="role-btns">` +
        ['skill', 'atk', 'sup', 'tank'].map(r => `<button class="role-btn ${rcur === r ? 'on' : ''}" style="--rc:${ROLE_COLOR[r]}" onclick="setRole(${setId},'${r}')">${ROLE_ICON[r]}<br>${ROLE_NAME[r]}</button>`).join('') + `</div></div>`;
      document.getElementById('set-form').innerHTML = roleHtml + STAT_FIELDS.map(f =>
        `<div class="set-row"><label for="st-${f.k}">${f.label}<small>Mặc định: ${fmtN(HERO_DEFAULTS[setId][f.k])}</small></label><input id="st-${f.k}" type="number" inputmode="numeric" min="${f.min}" max="${f.max}" value="${h[f.k]}" onchange="saveStat(${setId},'${f.k}',this.value)"></div>`).join('');
      renderSetPreview();
    }
    function renderSetPreview() {
      const p = getProg(setId), st = heroStats(setId);
      document.getElementById('set-preview').innerHTML = `Chỉ số thực tế trong trận (Cấp ${p.lv}, ★${p.star}): HP <b>${fmtN(st.hp)}</b> • Công <b>${fmtN(st.atk)}</b> • Thủ <b>${fmtN(st.def)}</b> • Né <b>${tsFmt(st.dodge)}</b> • Chuẩn <b>${tsFmt(st.acc)}</b> • Bạo <b>${tsFmt(st.crit)}</b> • Bạo Sát <b>${tsFmt(st.critDmg)}</b> • Bền <b>${tsFmt(st.tough)}</b> • Phá giáp <b>${fmtN(st.pierce)}</b> • Đỡ đòn <b>${tsFmt(st.block)}%</b> • Tốc <b>${fmtN(st.spd)}</b> • Nộ đầu <b>${st.rage}</b>`;
    }
    function flashSaved() {
      const el = document.getElementById('set-saved'); el.innerText = '✔ Đã lưu';
      clearTimeout(savedTimer); savedTimer = setTimeout(() => { el.innerText = ''; }, 1200);
    }
    function saveStat(id, k, v) {
      const f = STAT_FIELDS.find(x => x.k === k);
      let n = (v === '' || v == null) ? HERO_DEFAULTS[id][k] : Math.round(Number(v));
      if (!isFinite(n)) n = HERO_DEFAULTS[id][k];
      n = Math.min(f.max, Math.max(f.min, n));
      (statOv[id] = statOv[id] || {})[k] = n;
      saveJSON('hero_stat_ov', statOv); applyStatOv();
      const inp = document.getElementById('st-' + k); if (inp) inp.value = n;
      renderSetPreview(); flashSaved();
    }
    function setRole(id, r) {
      if (!ROLE_RULE[r]) return;
      roleOv[id] = r; saveJSON('hero_role', roleOv);
      if (statOv[id]) { delete statOv[id].startRage; saveJSON('hero_stat_ov', statOv); }   // nộ đầu trận theo chất tướng mới
      applyStatOv(); renderSettings(); flashSaved();
    }
    function resetHeroStats() { delete roleOv[setId]; saveJSON('hero_role', roleOv); delete statOv[setId]; saveJSON('hero_stat_ov', statOv); applyStatOv(); renderSettings(); flashSaved(); }
    function resetAllStats() { if (!confirm('Khôi phục chỉ số cơ bản mặc định của TẤT CẢ tướng?')) return; statOv = {}; roleOv = {}; saveJSON('hero_role', roleOv); saveJSON('hero_stat_ov', statOv); applyStatOv(); renderSettings(); flashSaved(); }

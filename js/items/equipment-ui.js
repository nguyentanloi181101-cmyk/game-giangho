/* TRANG BỊ: giao diện túi đồ, nâng cấp, gắn/tháo + thưởng ải
   (tách từ index.html cũ — script) */

    // ---- Túi đồ trang bị: nâng cấp / gắn vào khung / tháo ----
    let eqTab = 'sword', eqCtx = -1, eqLock = false;
    function openEquip(k, ctx) {
      if (k) eqTab = k;
      eqCtx = (ctx === undefined) ? -1 : ctx;
      eqLock = !!k && eqCtx >= 0;           // bấm ô trang bị của khung: chỉ hiện loại đó để chọn gắn
      renderEquip(); document.getElementById('equip-modal').style.display = 'flex';
    }
    function closeEquip() { document.getElementById('equip-modal').style.display = 'none'; renderHomeTeam(); }
    function eqSetTab(k) { eqTab = k; renderEquip(); }
    function eqSave() { saveJSON('eq_bag', eqBag); }
    function eqRefresh() {
      eqSave(); renderEquip();
      if (document.getElementById('hero-modal').style.display === 'flex' && detailId !== null) openHeroDetail(detailId);
      if (document.getElementById('screen-vohiep').classList.contains('active')) renderVoHiep();
    }
    function eqUpgrade(id, n) {
      const it = eqBag.find(i => i.id === id); if (!it || it.lv >= eqCap()) return;
      it.lv = Math.min(eqCap(), it.lv + n); eqRefresh();
    }
    function eqMountTo(id, f) {
      const it = eqBag.find(i => i.id === id); if (!it || team[f] === undefined) return;
      const old = eqAt(f, it.k); if (old && old !== it) old.f = -1;    // khung đã có món cùng loại -> món cũ về túi
      it.f = f; eqRefresh();
    }
    function eqToggle(id) { const it = eqBag.find(i => i.id === id); if (it) { if (it.f === eqCtx) eqUnmount(id); else eqMountTo(id, eqCtx); } }
    function eqUnmount(id) { const it = eqBag.find(i => i.id === id); if (it) { it.f = -1; eqRefresh(); } }
    // Thưởng qua ải: cộng vào túi đồ, trả về nội dung thông báo ('' nếu không có thưởng)
    function grantStageReward(stage, battle) {
      if (stage !== EQ_REWARD.stage || battle !== EQ_REWARD.battle) return '';
      let done = false; try { done = localStorage.getItem('eq_reward_done') === '1'; } catch (e) {}
      if (EQ_REWARD.once && done) return '';
      let id = eqBag.reduce((m, i) => Math.max(m, i.id), 0);
      EQUIP.forEach(e => { for (let n = 0; n < EQ_REWARD.each; n++) eqBag.push({ id: ++id, k: e.k, lv: EQ_REWARD.startLv, f: -1 }); });
      try { localStorage.setItem('eq_reward_done', '1'); } catch (e) {}
      eqSave();
      return `\n\n🎁 Nhận thưởng vào Túi đồ: ${EQ_REWARD.each} Mũ, ${EQ_REWARD.each} Áo, ${EQ_REWARD.each} Kiếm, ${EQ_REWARD.each} Giày!`;
    }
    function renderEquip() {
      const e = eqType(eqTab);
      document.getElementById('eq-pills').innerHTML = eqLock ? '' : pillPanelHtml();
      document.getElementById('eq-sub').innerText = eqLock
        ? `Chọn ${e.name} gắn vào Khung ${eqCtx + 1}. Tướng đứng ở khung nào thì nhận chỉ số của khung đó.`
        : `Cấp acc ${accLevel} → trang bị nâng tối đa tới cấp ${eqCap()} (🔑 ${keyCount()}). Gắn vào khung nào thì tướng đứng ở khung đó được cộng chỉ số.`;
      document.getElementById('eq-tabs').innerHTML = eqLock ? '' : EQUIP.map(x =>
        `<button class="eq-tab ${x.k === eqTab ? 'on' : ''}" onclick="eqSetTab('${x.k}')">${x.icon} ${x.name} <small>${eqBag.filter(i => i.k === x.k).length}</small></button>`).join('');
      const all = eqBag.filter(i => i.k === eqTab).sort((a, b) => a.id - b.id);
      const rank = it => all.indexOf(it) + 1;
      const list = eqLock
        ? [...all].sort((a, b) => ((b.f === eqCtx) - (a.f === eqCtx)) || ((b.f < 0) - (a.f < 0)) || b.lv - a.lv)
        : all;
      let html = list.map(it => {
        const cap = eqCap(), max = it.lv >= cap, fr = it.f;
        const hero = (fr >= 0 && team[fr] !== undefined) ? heroById(team[fr]) : null;
        const act = eqLock ? `eqToggle(${it.id})` : `frPick('eq',${it.id})`;
        return `<div class="ts-row"><div class="ts-ico"><div class="ts-em">${e.icon}</div><div class="ts-nm">${e.name} ${rank(it)}</div></div><div class="ts-link">🔗</div>${frSlot(fr, act, `eqUnmount(${it.id})`)}` +
          `<div class="ts-st"><b>Cấp ${it.lv}/${cap}${max ? (it.lv >= EQUIP_MAX ? ' (tối đa)' : ' 🔒') : ''}</b><div>+${fmtN(e.per)} ${e.label}/cấp</div><div>Hiện +${fmtN(it.lv * e.per)} ${e.label}</div>` +
          `<div class="ts-cnt">${fr < 0 ? '📦 Trong túi đồ' : `Khung ${fr + 1}${hero ? ' – ' + hero.name : ' (trống)'}`}</div></div>` +
          `<div class="ts-btns"><button class="btn-attack" ${max ? 'disabled' : ''} onclick="eqUpgrade(${it.id},1)">Tăng</button><button class="btn-close-battle" ${max ? 'disabled' : ''} onclick="eqUpgrade(${it.id},10)">+10</button><button class="btn-close-battle" ${max ? 'disabled' : ''} onclick="eqUpgrade(${it.id},${EQUIP_MAX})">Tối đa</button></div></div>`;
      }).join('');
      if (!list.length) html = `<div class="eq-empty">${eqBag.length ? `Chưa có ${e.name} nào.` : `🎒 Túi đồ trống.<br>Thắng <b>Ải ${EQ_REWARD.stage} - Bàn ${EQ_REWARD.battle}</b> để nhận ${EQ_REWARD.each} Mũ, ${EQ_REWARD.each} Áo, ${EQ_REWARD.each} Kiếm, ${EQ_REWARD.each} Giày.`}</div>`;
      if (eqLock) html += `<div class="md-acts"><button class="btn-close-battle" onclick="openEquip('${eqTab}')">Xem toàn bộ túi đồ</button></div>`;
      document.getElementById('eq-body').innerHTML = html;
    }
    function resetHeroProgress() {
      if (!confirm('Đặt lại cấp, sao, kỹ năng và trang bị của TẤT CẢ tướng về ban đầu?')) return;
      eqBag = []; eqSave(); try { localStorage.removeItem('eq_reward_done'); } catch (e) {}
      heroProg = {}; saveJSON('hero_prog', heroProg); renderVoHiep(); renderHomeTeam();
    }

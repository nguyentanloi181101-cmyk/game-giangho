/* QUẢN LÝ VÕ HIỆP: chọn tướng, tăng cấp
   (tách từ index.html cũ — script) */

    // ---- Quản lý Võ Hiệp: tăng cấp / tăng sao / tăng cấp kỹ năng ----
    let vmId = 0;
    function openVoHiep(id) {
      vmId = (id !== undefined && heroById(id)) ? id : (team.length ? team[0] : HEROES[0].id);
      renderVoHiep(); switchScreen('vohiep');
    }
    function vmSelect(id) { vmId = id; renderVoHiep(); }
    function upgradeHero(kind, n) {
      const cap = { lv:heroCap(vmId), star:starCapOf(getProg(vmId).lv), sk:SKILL_MAX }[kind], p = getProg(vmId);
      if (p[kind] >= cap) return;
      if (kind === 'star') {   // tăng sao tốn mảnh tướng
        const need = starCost(p.star + 1);
        if (shardsOf(vmId) < need) { alert(`Cần ${need} mảnh ${heroById(vmId).name} để lên ★${p.star + 1} (có ${shardsOf(vmId)}).\nQuay Chiêu Mộ để nhận mảnh tướng.`); return; }
        heroShards[vmId] = shardsOf(vmId) - need; saveJSON('hero_shards', heroShards); n = 1;
      }
      if (kind === 'lv') {     // tăng cấp tốn bạc + gạo; +10 cấp thì lên tối đa 10 cấp trong khả năng chi trả
        const k = lvAffordable(p.lv, Math.min(n, cap - p.lv));
        if (k < 1) { const c = lvCost(p.lv + 1); alert(`Không đủ bạc/gạo!\nLên cấp ${p.lv + 1} cần ${fmtN(c.silver)} bạc + ${fmtN(c.rice)} gạo\n(đang có ${fmtN(silver)} bạc, ${fmtN(rice)} gạo).\nĐánh PVE thắng từng Bàn để nhận thêm.`); return; }
        const tot = lvCostRange(p.lv, k); silver -= tot.silver; rice -= tot.rice; resSave(); n = k;
      }
      heroProg[vmId] = Object.assign({}, p, { [kind]: Math.min(cap, p[kind] + n) });
      saveJSON('hero_prog', heroProg); renderVoHiep(); renderHomeTeam();
    }

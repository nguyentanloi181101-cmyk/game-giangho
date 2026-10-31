/* TỶ VÕ (PVP): trận đấu, đồng hồ, kết thúc
   (tách từ index.html cũ — script) */

    // ---- Panel chiến đấu Tỷ Võ: hàng đội địch (trên) + hàng đội ta (dưới), tướng + sao + máu + nộ + Tốc ----
    // Sao hiển thị luôn 5 ô: ★1-5 = số sao sáng (sao mờ là ô còn thiếu) • ★6 trở lên = 1 sao TO + 4 sao nhỏ (★7+ thêm "×số")
    function pvStars(star) {
      let h = '';
      if (star >= STAR_MAX) { h = '<i class="big">★</i>' + '<i>★</i>'.repeat(4); if (star > STAR_MAX) h += '<b>×' + star + '</b>'; }
      else for (let k = 0; k < 5; k++) h += '<i class="' + (k < star ? '' : 'off') + '">★</i>';
      return h;
    }
    function pvCard(u, opp, pve, idx) {
      const h = heroById(u.id);
      if (!h && !pve) return '<div class="pv-c"></div>';
      const star = !h ? 0 : opp ? (u.star || (START_PROG[u.id] || {}).star || 5) : getProg(u.id).star;
      const stars = h ? pvStars(star) : '<i style="visibility:hidden">★</i>';
      const portrait = h ? heroIcon(h) : ((u.el.querySelector('.bf-sprite') || {}).innerHTML || '');
      const rl = HERO_ROLE[u.id];
      let cls = opp ? 'opp' : '', click = '';
      if (pve && !opp) {   // PVE: giữ điều khiển — chạm thẻ để đánh thường
        const can = isPlayerTurn && !busy && u.alive && !u.acted;
        cls += ' pve-h' + (can ? ' can' : '') + (u.acted ? ' acted' : '');
        click = ` onclick="heroAct(${idx},'normal')"`;
      }
      let orbHtml = '';
      if (pve && !opp) {
        const can2 = isPlayerTurn && !busy && u.alive && !u.acted;
        const sil = isSilenced(u), rdy = u.rage >= 100 && !ultBlocked(u);
        orbHtml = `<div class="bf-orb in-card ${rdy && can2 ? 'ready' : ''} ${u.alive ? '' : 'dead'}" onclick="event.stopPropagation();heroAct(${idx},'ult')">${rdy ? 'ULTI' : sil ? '🤐' : u.rage >= 100 ? '🪷' : Math.floor(u.rage) + '%'}</div>`;
      }
      return `<div class="pv-c ${cls} ${u.alive ? '' : 'dead'}"${click}><div class="pv-cb" style="border-color:${ROLE_COLOR[rl] || '#b45309'}${rl ? ';--rc:' + ROLE_COLOR[rl] : ''}">${rl ? `<div class="bf-cardic">${BF_ROLE_BADGE[rl]}</div>` : ''}<div class="pv-p">${portrait}</div><div class="pv-st">${stars}</div>${orbHtml}` +
        `<div class="pv-b h"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i></div><div class="pv-b r"><i style="width:${Math.min(100, u.rage || 0)}%"></i></div></div>${pve ? '' : `<div class="pv-sp">Tốc ${Math.round(u.spd || 0)}</div>`}</div>`;
    }
    const pwFs = s => String(s).length > 11 ? 13 : String(s).length > 9 ? 16 : 19;   // số lực chiến dài thì thu nhỏ chữ cho khỏi tràn ô
    function renderPvpPanel() {
      const el = document.getElementById('pv-panel'); if (!el || !pvp) return;
      const H = waveUnits.heroes || [], E = waveUnits.enemies || [], o = pvp.opp;
      el.innerHTML =
        `<div class="pv-row"><div class="pv-side"><b style="font-size:${pwFs(fmtN(o.power))}px">${fmtN(o.power)}</b><span>${o.name}</span></div>${E.map(u => pvCard(u, true)).join('')}</div>` +
        `<div class="pv-row"><div class="pv-side"><b style="font-size:${pwFs(fmtN(pvpMyPower()))}px">${fmtN(pvpMyPower())}</b><span>${pvName()}</span></div>${H.map(u => pvCard(u, false)).join('')}</div>`;
    }
    function pvpSkip() { battleFast = true; }
    function pvpTimerTick() {
      const el = document.getElementById('pvp-timer'); if (!el) return;
      if (pvpState.used > 0) {
        const rest = pvpState.winStart + 86400000 - Date.now();
        if (rest <= 0) { pvpRefreshWindow(); renderPvp(); return; }
        el.innerHTML = '⏳ Hồi phục sau <b>' + fmtClock(rest) + '</b>';
      } else el.innerHTML = '⏳ Lượt đang đầy';
    }
    setInterval(pvpTimerTick, 1000);

    function startPvp(i) {
      const o = pvpOpps[i]; if (!o) return;
      if (!team.length) { alert('Hãy chọn Đội ngũ ra trận trước!'); return; }
      battleToken++; playBgm(); playBattleOpen(); battleFast = false;
      pvp = { opp: o }; pvpRound = 0; pvpDmg = { hero: 0, enemy: 0 }; currentWave = 1; busy = false;
      document.getElementById('bf-units').innerHTML = '';
      const sel = HEROES.filter(h => team.includes(h.id));
      const pos = HERO_POS[sel.length].map(p => [p[0], p[1] + HERO_DY]);
      const _tm = ttMine(); ttSetupUI(_tm, o.beast ? { beast: o.beast, pt: o.pt || [] } : ttFake(o.name));
      waveUnits = {
        heroes: sel.map((h, k) => {
          const s = ttApply(Object.assign({}, heroStats(h.id, true)), ttBonus(_tm && _tm.pt));   // Tỷ Võ: chỉ chỉ số cơ bản + trang bị/Bảo Vật/cộng dồn, không lấy số chỉnh trong Cài đặt
          const u = makeUnit('hero', heroIcon(h), pos[k][0], pos[k][1], s.hp, s.atk, false, h.name);
          u.id = h.id; u.emoji = heroIcon(h); u.def = s.def; u.spd = s.spd; u.dodge = s.dodge; u.acc = s.acc; u.crit = s.crit; u.critDmg = s.critDmg; u.tough = s.tough; u.pierce = s.pierce; u.block = s.block; u.sk = skillMult(h.id); u.alwaysUlt = !!h.alwaysUlt; u.taunt = !!h.taunt; u.prio2 = !!h.prio2;
          u.rage = h.startRage || 0; grantStart(u); u.acted = false;
          return u;
        }),
        enemies: []
      };
      document.getElementById('battle-overlay').style.display = 'flex';
      loadWave();
    }
    function loadPvpWave() {
      const tok = battleToken, o = pvp.opp;
      document.getElementById('ui-stage-title').innerText = `Tỷ Võ • ${o.name} (Hạng ${fmtN(o.rank)})`;
      document.getElementById('ui-wave-title').innerText = 'Hiệp 0/' + PVP_MAX_ROUNDS;
      document.getElementById('ui-enemy-name').innerText = o.heroes.map(h => h.name.toUpperCase()).join(' • ');
      waveUnits.enemies.forEach(e => e.el.remove());
      const S = HERO_POS[5].map(p => [100 - p[0], p[1] + HERO_DY]);
      waveUnits.enemies = o.stats.map((x, i) => {
        const h = x.h, u = makeUnit('enemy', heroIcon(h), S[i][0], S[i][1], x.hp, x.atk, false, h.name);
        u.id = h.id; u.isHero = true; u.def = x.def; u.spd = x.spd !== undefined ? x.spd : h.spd; u.dodge = x.dodge !== undefined ? x.dodge : h.dodge; u.acc = x.acc !== undefined ? x.acc : (h.acc || 0); u.crit = x.crit || 0; u.critDmg = x.critDmg || 0; u.tough = x.tough || 0; u.pierce = x.pierce || 0; u.block = x.block || 0; u.sk = x.sk || 1; if (x.star) u.star = x.star;
        u.alwaysUlt = !!h.alwaysUlt; u.taunt = !!h.taunt; u.prio2 = !!h.prio2; u.rage = h.startRage || 0; grantStart(u);
        return u;
      });
      waveUnits.heroes.forEach(h => {
        h.acted = false; h.stun = 0; h.bleed = 0; h.bleedPct = 0; clearDebuffs(h); grantStart(h); h.el.classList.remove('stunned');
        h.el.querySelectorAll('.bf-stun, .bf-bleed').forEach(ic => ic.remove());
      });
      clearDefBuff(waveUnits.heroes);
      busy = true; isPlayerTurn = false; pvpRound = 0;
      refreshPanel();
      setTimeout(() => { if (tok === battleToken) pvpBattleLoop(tok); }, 800);
    }

    // Tỷ Võ: mỗi hiệp mọi tướng (cả 2 bên) ra đòn lần lượt từng con theo TỐC ĐỘ giảm dần.
    // Cùng tốc: bên nào tổng lực chiến cao hơn đánh trước (bằng nhau thì bên ta); cùng bên cùng tốc thì theo thứ tự khung.
    function pvpOrder() {
      const myP = pvpMyPower(), opP = pvp.opp.power, heroFirst = myP >= opP;
      const all = [...waveUnits.heroes.map((u, i) => ({ u, side: 0, i })), ...waveUnits.enemies.map((u, i) => ({ u, side: 1, i }))].filter(x => x.u.alive);
      return all.sort((a, b) => (b.u.spd || 0) - (a.u.spd || 0)
        || (a.side !== b.side ? (heroFirst ? a.side - b.side : b.side - a.side) : a.i - b.i)).map(x => x.u);
    }
    async function pvpBattleLoop(tok) {
      const H = waveUnits.heroes, E = waveUnits.enemies, dead = arr => arr.every(u => !u.alive);
      const ended = () => {
        if (dead(H)) { loseBattle(); return true; }
        if (dead(E)) { nextWave(); return true; }
        return false;
      };
      while (tok === battleToken) {
        if (++pvpRound > PVP_MAX_ROUNDS) { pvpTimeout(); return; }
        document.getElementById('ui-wave-title').innerText = `Hiệp ${pvpRound}/${PVP_MAX_ROUNDS}`;
        clearDefBuff(H); clearDefBuff(E); tickMoon(H); tickMoon(E); tickLB(H); tickLB(E); tickDebuffs(H); tickDebuffs(E);
        if (pvpRound > 1) { tickImmortal(H); tickImmortal(E); }
        const bl = (await tickBleed(E)) | (await tickBleed(H));
        if (tok !== battleToken) return;
        if (bl) { await sleep(500); if (tok !== battleToken) return; }
        if (ended()) return;
        for (const u of pvpOrder()) {
          if (tok !== battleToken) return;
          if (!u.alive) continue;
          const mine = H.includes(u), foes = mine ? E : H;
          if (u.stun > 0) {
            u.stun--; floatText(u, 'CHOÁNG');
            if (u.stun === 0) { const ic = u.el.querySelector('.bf-stun'); if (ic) ic.remove(); u.el.classList.remove('stunned'); }
            await sleep(300); continue;
          }
          if ((u.alwaysUlt || u.rage >= 100) && !ultBlocked(u)) { u.rage = u.alwaysUlt ? 100 : 0; await ultimate(u, tok); }
          else { gainRage(u, RAGE_ATK); await normalAttack(u, foes, tok); }
          if (tok !== battleToken) return;
          refreshPanel();
          await sleep(250); if (tok !== battleToken) return;
          if (ended()) return;
        }
      }
    }
    function pvpTimeout() {          // hết 10 lượt chưa phân thắng bại: bên gây nhiều sát thương hơn thắng
      const f = a => a.reduce((x, u) => x + Math.max(0, u.hp), 0) / a.reduce((x, u) => x + u.max, 0);
      let win;
      if (pvpDmg.hero !== pvpDmg.enemy) win = pvpDmg.hero > pvpDmg.enemy;
      else win = f(waveUnits.heroes) > f(waveUnits.enemies);   // hòa sát thương: xét % máu còn lại, vẫn hòa thì tính thua
      pvpFinish(win, true);
    }
    function pvpFinish(win, timeout) {
      const m = pvp, dmgLine = timeout ? `\nSát thương: bạn ${fmtN(pvpDmg.hero)} • đối thủ ${fmtN(pvpDmg.enemy)}` : '';
      closeBattle();
      try { pvpState.log.unshift({ t: Date.now(), win: !!win, opp: m.opp.name, rank: m.opp.rank }); pvpState.log.length = Math.min(pvpState.log.length, 20); pvpSave(); } catch (e) {}
      let msg, rankP = null;
      if (win) {
        const old = pvpState.rank;
        pvpState.wins++; pvpState.flame = (pvpState.flame || 0) + PVP_FLAME_WIN;
        // đối thủ hạng cao hơn: bạn chèn lên ngay trên họ, nhận đúng hạng của họ (họ và người ở giữa tụt 1 hạng)
        const newRank = m.opp.rank < pvpState.rank ? m.opp.rank : (m.opp.rank === pvpState.rank ? Math.max(1, pvpState.rank - 1) : pvpState.rank);
        if (newRank < pvpState.rank) { pvpState.rank = newRank; pvpState.rt = Date.now(); rankP = pvpRankCloud(m.opp); }
        pvpSave(); updatePower();
        msg = `🏆 THẮNG${timeout ? ' (hết ' + PVP_MAX_ROUNDS + ' lượt, gây nhiều sát thương hơn)' : ''}!\n\n` + (pvpState.rank < old ? `Hạng ${fmtN(old)} → ${fmtN(pvpState.rank)} (${pvpTier(pvpState.rank).icon} ${pvpTier(pvpState.rank).name})\n` : `Giữ vững hạng ${fmtN(old)}\n`) +
          `+${fmtN(PVP_POWER)} lực chiến\nMọi tướng ra trận cộng dồn: +${fmtN(PVP_HP)} HP, +${fmtN(PVP_ATK)} Công, +${fmtN(PVP_DEF)} Thủ\n(tổng ${pvpState.wins} trận thắng: HP +${fmtN(pvHp(pvpState.wins))}, Công +${fmtN(pvAtk(pvpState.wins))}, Thủ +${fmtN(pvDef(pvpState.wins))})\n🔥 +${PVP_FLAME_WIN} đốm lửa (có ${pvpState.flame})`;
      } else {
        const had = pvpState.flame || 0; pvpState.flame = Math.max(0, had - PVP_FLAME_LOSE); pvpSave();
        msg = `💀 THUA${timeout ? ' (hết ' + PVP_MAX_ROUNDS + ' lượt, gây ít sát thương hơn)' : ''}!\nKhông mất hạng, cứ khiêu chiến lại (không giới hạn lượt).\n🔥 ${had > 0 ? '-' + PVP_FLAME_LOSE + ' đốm lửa' : 'Chưa có đốm lửa để trừ'} (còn ${pvpState.flame})`;
      }
      renderPvp(); renderHomeTeam();
      Promise.resolve(rankP).then(() => pvpGenOpps());   // đợi ghi hạng xong rồi mới tải lại bảng
      pvpToast(msg + dmgLine, win);
    }
    // Thông báo tự tắt (không cần bấm OK), kết quả đã được ghi nhận ngay
    function pvpToast(msg, win) {
      let t = document.getElementById('pvp-toast');
      if (!t) {
        t = document.createElement('div'); t.id = 'pvp-toast';
        t.style.cssText = 'position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:99999;max-width:min(92vw,420px);padding:12px 16px;border-radius:12px;font-size:13px;line-height:1.5;color:#fff;white-space:pre-line;text-align:center;pointer-events:none;box-shadow:0 6px 24px rgba(0,0,0,.6);transition:opacity .4s';
        document.body.appendChild(t);
      }
      t.style.background = win ? 'linear-gradient(#14532d,#052e16)' : 'linear-gradient(#7f1d1d,#450a0a)';
      t.style.border = '2px solid ' + (win ? '#fde047' : '#f87171');
      t.textContent = msg; t.style.opacity = '1';
      clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = '0'; }, 3500);
    }

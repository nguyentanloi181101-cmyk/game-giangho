/* TỶ VÕ (PVP): màn hình núi mây, chi tiết đối thủ, chiến tích
   (tách từ index.html cũ — script) */

    const SPOTS = [[50, 15], [19, 29], [81, 37], [26, 54], [76, 65]];     // 5 đối thủ, vị trí như cảnh núi mây
    const ME_SPOT = [50, 82];
    const pvBody = h => !h ? '❔' : h.body ? `<img class="pv-body" style="height:${Math.round((h.bodyH || 76) * 1.55)}px" src="${h.body}">` : h.img ? `<img class="pv-body" style="height:118px" src="${h.img}">` : h.emoji;   // tướng đứng nguyên hình (không khung tròn)
    const pvMainOf = stats => stats.reduce((b, x) => unitPower(x) > unitPower(b) ? x : b, stats[0]).h;   // tướng mạnh nhất làm đại diện
    function pvClose() { document.getElementById('pv-modal').style.display = 'none'; }
    function pvShow(html) { document.getElementById('pv-box').innerHTML = html; document.getElementById('pv-modal').style.display = 'flex'; }
    function pvHead(title, sub) { return `<div class="hd-head"><div class="hd-info"><div class="hd-name">${title}</div><div class="hd-sub">${sub || ''}</div></div><button class="md-x" onclick="pvClose()">✕</button></div>`; }
    const pvCardL = (h, hp, atk, def) => `<div class="pv-lc"><div class="e">${heroIcon(h)}</div><div class="n">${h.name}</div>HP ${fmtN(hp)}<br>Công ${fmtN(atk)}<br>Thủ ${fmtN(def)}</div>`;
    function renderPvp() {
      const el = document.getElementById('pvp-body'); if (!el) return;
      const st = pvpState, my = pvpMyPower();
      // Sắp xếp từ trên xuống: hạng nhỏ (mạnh nhất) ở trên cùng, hạng lớn dần xuống dưới (gồm cả bản thân)
      const SLOTS = [[50, 13], [19, 27], [81, 37], [26, 53], [76, 64], [50, 82]];
      const entries = pvpOpps.slice(0, 5).map((o, i) => ({ me: false, o, i, rank: o.rank }));
      entries.push({ me: true, rank: st.rank });
      entries.sort((x, y) => x.rank - y.rank || (x.me ? 1 : -1));
      const pos = entries.length === SLOTS.length ? SLOTS : [...SLOTS.slice(0, entries.length - 1), SLOTS[SLOTS.length - 1]];
      const mainId = team.length ? team.reduce((b, id) => unitPower(heroStats(id)) > unitPower(heroStats(b)) ? id : b, team[0]) : null;
      const me = mainId !== null ? heroById(mainId) : null;
      const spots = entries.map((e, k) => {
        const l = pos[k][0], t = pos[k][1];
        if (e.me) return `<div class="pv-spot me" style="left:${l}%;top:${t}%" onclick="pvpOpenSelf()"><div class="pv-hero full">${pvBody(me)}</div><div class="pv-lotus"></div><div class="pv-name">Cấp ${accLevel} ${pvName()}<br>Hạng ${fmtN(st.rank)}</div></div>`;
        const o = e.o, main = pvMainOf(o.stats);
        return `<div class="pv-spot" style="left:${l}%;top:${t}%" onclick="pvpOpen(${e.i})"><div class="pv-hero full" style="animation-delay:${-k * 0.6}s">${pvBody(main)}</div><div class="pv-lotus"></div><div class="pv-name">Cấp ${o.lvl} ${o.name}<br>Hạng ${fmtN(o.rank)}</div></div>`;
      }).join('');
      const logged = typeof clUser !== 'undefined' && clUser;
      const note = pvpOpps.length ? '' : `<div style="position:absolute;left:8%;right:8%;top:34%;z-index:5;text-align:center;padding:10px 12px;background:rgba(0,0,0,.6);border:1px dashed #fde047;border-radius:10px;color:#fde68a;font-size:12px;line-height:1.5;pointer-events:none">${logged ? '👤 Chưa có tài khoản nào khác vào Tỷ Võ.<br>Hãy rủ thêm bạn bè đăng nhập đám mây nhé!' : '☁️ Tỷ Võ chỉ đấu với người chơi thật.<br>Hãy đăng nhập tài khoản đám mây để thấy đối thủ.'}</div>`;
      el.innerHTML = spots + note +
        `<div class="pv-info">Lực chiến<b>${fmtN(my)}</b>Đã thắng<b>${st.wins} trận</b></div><button class="pv-log-btn" onclick="pvpShowLog()">Chiến Tích</button>`;
    }
    // Bấm 1 đối thủ: xem đủ đội hình rồi bấm Chiến Đấu
    function pvpOpen(i) {
      const o = pvpOpps[i]; if (!o) return;
      const my = pvpMyPower(), ratio = my ? o.power / my : 9, ot = pvpTier(o.rank);
      const d = ratio < 0.8 ? ['Dễ', '#4ade80'] : ratio < 1.25 ? ['Vừa', '#fde047'] : ratio < 2.5 ? ['Khó', '#fb923c'] : ['Rất khó', '#f87171'];
      pvShow(pvHead(`Cấp ${o.lvl} ${o.name}`, `Hạng ${fmtN(o.rank)} • ${ot.icon} ${ot.name}`) +
        `<div style="font-size:12px;color:#cbd5e1">Lực chiến <b style="color:#fde047">${fmtN(o.power)}</b> • Độ khó: <b style="color:${d[1]}">${d[0]}</b> ${o.real ? ' • 👤 Người chơi thật' : ' • Cộng dồn ×' + o.steps}</div>` +
        `<div class="pv-lineup">${o.stats.map(x => pvCardL(x.h, x.hp, x.atk, x.def)).join('')}</div>` +
        `<button class="btn-attack pv-go" ${!team.length ? 'disabled' : ''} onclick="pvpGo(${i})">⚔️ Chiến Đấu</button>`);
    }
    function pvpGo(i) { pvClose(); startPvp(i); }
    function pvpOpenSelf() {
      const st = pvpState, t = pvpTier(st.rank);
      pvShow(pvHead(`Cấp ${accLevel} ${pvName()}`, `Hạng ${fmtN(st.rank)} • ${t.icon} ${t.name}`) +
        `<div style="font-size:12px;color:#cbd5e1">Lực chiến <b style="color:#fde047">${fmtN(pvpMyPower())}</b> • Đã thắng ${st.wins} trận</div>` +
        `<div class="pv-lineup">${team.map(id => { const s2 = heroStats(id); return pvCardL(heroById(id), s2.hp, s2.atk, s2.def); }).join('')}</div>` +
        `<button class="btn-attack pv-go" onclick="pvClose();openTeam()">⛩️ Đổi Đội Hình</button>` +
        `<button class="btn-close-battle pv-go" style="margin-top:6px" onclick="pvClose();renamePlayer()">✏️ Đổi Tên</button>`);
    }
    function pvpShowTiers() {
      let prev = 0;
      const rows = PVP_TIERS.map(t => { const l = `<div class="pv-row-log"><span>${t.icon} ${t.name}</span><b>${prev + 1 === t.max ? 'hạng ' + t.max : 'hạng ' + (prev + 1) + ' – ' + t.max}</b></div>`; prev = t.max; return l; }).join('');
      const cur = pvpTier(pvpState.rank);
      pvShow(pvHead('🏅 Xếp Hạng Tỷ Võ', `Bạn: hạng ${fmtN(pvpState.rank)} • ${cur.icon} ${cur.name}`) + rows +
        `<div class="set-note" style="margin-top:8px">Bắt đầu ở hạng ${fmtN(PVP_START_RANK)} (thấp nhất). Thắng đối thủ hạng cao hơn sẽ lên đúng hạng của đối thủ.</div>`);
    }
    function pvpShowLog() {
      const st = pvpState, w = st.wins, log = st.log || [];
      const fmtT = t => { const d = new Date(t); return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ' ' + d.getDate() + '/' + (d.getMonth() + 1); };
      pvShow(pvHead('📜 Chiến Tích', `Đã thắng ${w} trận • Hạng ${fmtN(st.rank)}`) +
        `<div class="set-note">🏆 Mỗi trận thắng: <b>+${fmtN(PVP_POWER)} lực chiến</b>, mọi tướng ra trận cộng dồn <b>+${fmtN(PVP_HP)} HP, +${fmtN(PVP_ATK)} Công, +${fmtN(PVP_DEF)} Thủ</b>.<br>Đang cộng: HP +${fmtN(pvHp(w))} • Công +${fmtN(pvAtk(w))} • Thủ +${fmtN(pvDef(w))}.<br>Tối đa: HP +${fmtN(PVP_HP_MAX)} • Công +${fmtN(PVP_ATK_MAX)} • Thủ +${fmtN(PVP_DEF_MAX)}.</div>` +
        (log.length ? log.map(e => `<div class="pv-row-log"><span>${e.win ? '✅ Thắng' : '❌ Thua'} ${e.opp} (Hạng ${fmtN(e.rank)})</span><span>${fmtT(e.t)}</span></div>`).join('') : '<div class="eq-empty">Chưa có trận nào.</div>'));
    }

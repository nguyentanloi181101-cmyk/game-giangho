/* BẢO VẬT (Tôn Sư Ký) + BÚA 🔨
   (tách từ index.html cũ — script) */

    // ---- BẢO VẬT ----
    // 4 LOẠI: Tôn Sư Ký (id 1) · Bá Vương Kiếm (6) · Thủy Hoàng Đăng (7) · Trống Lôi Âm (8).
    // Có thể sở hữu NHIỀU BẢN của cùng 1 loại (cùng tên, cùng thông số; mỗi bản có cấp/sao riêng, đổi thêm bằng 🔥 ở Tỷ Võ).
    // Mỗi món có mã riêng `u`, `id` là LOẠI. Mỗi KHUNG chỉ gắn tối đa 3 Bảo Vật và KHÔNG được trùng loại (1 Tôn Sư Ký / khung).
    // Tôn Sư Ký: Né +(15+Lv)%, Công +(20+1.5×Lv)%, HP +(55+Lv)%
    const TS_NAME = 'Tôn Sư Ký', TS_KINDS = [1, 6, 7, 8], TS_PER_HERO = 3, TS_MAX = 100, TS_FRAMES = 5, TS_STAR_MAX = 10;   // Bảo Vật tối đa 10★   // gắn theo KHUNG (tướng đứng ở khung nào nhận chỉ số khung đó), tối đa 3 Bảo Vật / khung
    const TS_STAR_MULT = 1.5;   // mỗi ★: thuộc tính hiện tại của Bảo Vật ×1.5 (+50%, cộng dồn)

    // ---- Bảo Vật đặc biệt (id 6-8): Chuẩn / Bạo (tỉ lệ bạo kích) / Bạo Sát (sát thương bạo) / Bền (giảm tỉ lệ bị bạo kích) / Công cố định / Công % ----
    // Chỉ số = (gốc + mỗi cấp × Lv) × (1 + 0.5 × số ★). Khớp mốc: Bá Vương Kiếm Lv20, Thủy Hoàng Đăng Lv0, Trống Lôi Âm Lv13
    const TS_DEFS = {
      6: { name:'Bá Vương Kiếm',   base:{ acc:20, crit:10, critDmg:10 },       per:{ acc:4, crit:1.75, critDmg:2 } },
      7: { name:'Thủy Hoàng Đăng', base:{ tough:10, crit:10, critDmg:20 },     per:{ tough:1, crit:1, critDmg:2 } },
      8: { name:'Trống Lôi Âm',    base:{ crit:15, atkFlat:750, atk:17 },      per:{ crit:1, atkFlat:400, atk:2 } }
    };
    const TS_IMG = { 6:'assets/images/items/treasure-06.jpg', 7:'assets/images/items/treasure-07.jpg', 8:'assets/images/items/treasure-08.jpg' };
    const tsName = id => TS_DEFS[id] ? TS_DEFS[id].name : TS_NAME;
    const tsIcon = id => TS_IMG[id] ? `<img class="eq-img" src="${TS_IMG[id]}">` : '📜';
    let tsRefund = 0;   // búa hoàn lại cho Bảo Vật đang quá 10★ (dữ liệu cũ)
    const tsStat = (lv, star) => { const m = Math.pow(TS_STAR_MULT, star | 0); return { dodge: (15 + lv) * m, atk: (20 + 1.5 * lv) * m, hp: (55 + lv) * m }; };
    function tsStatOf(t) {
      const o = { dodge:0, atk:0, hp:0, acc:0, crit:0, critDmg:0, tough:0, atkFlat:0 }, d = TS_DEFS[t.id];
      if (!d) return Object.assign(o, tsStat(t.lv, t.star));
      const m = 1 + 0.5 * (t.star | 0);
      Object.keys(d.base).forEach(k => { o[k] = (d.base[k] + d.per[k] * t.lv) * m; });
      return o;
    }
    function tsLines(t) {
      const s = tsStatOf(t), f = tsFmt, d = TS_DEFS[t.id];
      if (!d) return `<div>Né +${f(s.dodge)}%</div><div>Công +${f(s.atk)}%</div><div>HP +${f(s.hp)}%</div>`;
      return (s.acc ? `<div>Chuẩn +${f(s.acc)}%</div>` : '') + (s.tough ? `<div>Bền +${f(s.tough)}%</div>` : '') + (s.crit ? `<div>Bạo +${f(s.crit)}%</div>` : '') +
             (s.critDmg ? `<div>Bạo Sát +${f(s.critDmg)}%</div>` : '') + (s.atkFlat ? `<div>Công +${fmtN(Math.round(s.atkFlat))}</div>` : '') + (s.atk ? `<div>Công +${f(s.atk)}%</div>` : '');
    }
    // Loại của dữ liệu cũ: id 1-5 (5 Tôn Sư Ký) -> loại 1; 6/7/8 giữ nguyên
    const tsKindOf = id => (id >= 1 && id <= 5) ? 1 : id;
    let tsBag = (() => {
      let b = []; try { b = JSON.parse(localStorage.getItem('ts_bag')) || []; } catch (e) {}
      if (!Array.isArray(b)) b = [];
      b = b.filter(x => x && Number.isInteger(x.id) && TS_KINDS.includes(tsKindOf(x.id)));
      const legacy = b.length > 0 && b.every(x => x.u === undefined);   // dữ liệu cũ: id = mã riêng (1-8)
      const have = new Set(b.map(x => x.u === undefined ? x.id : x.u));
      if (!b.length || legacy) for (let i = 1; i <= 8; i++) if (!have.has(i)) b.push({ id: i });   // bộ gốc: 5 Tôn Sư Ký + 3 Bảo Vật đặc biệt
      const out = [], usedU = new Set(), frame = {};
      b.forEach(o => {
        let u = Number.isInteger(o.u) ? o.u : o.id; while (usedU.has(u)) u++; usedU.add(u);
        const kind = tsKindOf(o.id);
        let f = Number.isInteger(o.f) && o.f >= 0 && o.f < TS_FRAMES ? o.f : -1;
        if (o.f === undefined && o.hero !== null && o.hero !== undefined) f = team.indexOf(o.hero);   // dữ liệu cũ (gắn theo tướng) -> khung hiện tại của tướng đó
        if (f >= TS_FRAMES) f = -1;
        const fr = f >= 0 ? (frame[f] = frame[f] || []) : null;
        if (fr && (fr.length >= TS_PER_HERO || fr.includes(kind))) f = -1;   // khung đầy hoặc đã có loại này -> tháo ra túi
        else if (fr) fr.push(kind);
        let st = Math.max(0, o.star | 0); if (st > TS_STAR_MAX) { tsRefund += st - TS_STAR_MAX; st = TS_STAR_MAX; }
        out.push({ u, id: kind, lv: Math.max(0, Math.min(TS_MAX, o.lv | 0)), star: st, f });
      });
      return out.sort((x, y) => TS_KINDS.indexOf(x.id) - TS_KINDS.indexOf(y.id) || x.u - y.u);
    })();
    const tsFind = u => tsBag.find(x => x.u === u);
    const tsCount = kind => tsBag.filter(x => x.id === kind).length;
    // Thêm 1 bản mới của 1 loại Bảo Vật (cấp 0, 0★) — dùng khi đổi 🔥 ở Tỷ Võ
    function tsAdd(kind) {
      if (!TS_KINDS.includes(kind)) return null;
      const t = { u: tsBag.reduce((m, x) => Math.max(m, x.u), 0) + 1, id: kind, lv: 0, star: 0, f: -1 };
      tsBag.push(t); tsBag.sort((x, y) => TS_KINDS.indexOf(x.id) - TS_KINDS.indexOf(y.id) || x.u - y.u);
      tsSave(); return t;
    }
    const tsSave = () => saveJSON('ts_bag', tsBag);
    // ---- BÚA 🔨: đánh xong 1 Ải (Bàn 10, lần đầu) nhận 10 búa; mỗi búa tăng 1 ★ cho 1 Bảo Vật ----
    const HAMMER_PER_STAGE = 10;
    let hamClaimed = (() => { let k = 0; try { k = parseInt(localStorage.getItem('ham_claimed')) || 0; } catch (e) {} return Math.max(k, (progress.maxStage || 1) - 1); })();   // số Ải đã nhận búa (người chơi cũ tính bù)
    let hamSpent = (() => { try { return parseInt(localStorage.getItem('ham_spent')) || 0; } catch (e) { return 0; } })();
    if (tsRefund > 0) { hamSpent = Math.max(0, hamSpent - tsRefund); try { localStorage.setItem('ham_spent', String(hamSpent)); } catch (e) {} tsSave(); tsRefund = 0; }
    const hammerCount = () => Math.max(0, hamClaimed * HAMMER_PER_STAGE - hamSpent);
    function claimStageHammer(stage) {
      if (stage <= hamClaimed) return '';
      hamClaimed = stage;
      try { localStorage.setItem('ham_claimed', String(hamClaimed)); } catch (e) {}
      return `\n\n🔨 Nhận ${HAMMER_PER_STAGE} Búa! Mỗi búa tăng 1★ cho Bảo Vật, +50% thuộc tính (còn ${hammerCount()} 🔨).`;
    }
    function tsStarUp(u) {
      const t = tsFind(u); if (!t) return;
      if ((t.star | 0) >= TS_STAR_MAX) { alert('⭐ ' + tsName(t.id) + ' đã đạt tối đa ' + TS_STAR_MAX + ' sao.'); return; }
      if (hammerCount() <= 0) { alert('🔨 Hết búa! Đánh xong 1 Ải (Bàn 10) để nhận thêm ' + HAMMER_PER_STAGE + ' búa.'); return; }
      hamSpent++; try { localStorage.setItem('ham_spent', String(hamSpent)); } catch (e) {}
      t.star = (t.star | 0) + 1; tsSave(); tsRender(); tsRefreshOthers();
    }
    const tsOfFrame = f => f >= 0 ? tsBag.filter(t => t.f === f) : [];
    const tsOf = heroId => tsOfFrame(frameOf(heroId));   // Bảo Vật của khung mà tướng đang đứng
    function tsBonus(heroId) {
      const b = { dodge: 0, atk: 0, hp: 0, acc: 0, crit: 0, critDmg: 0, tough: 0, atkFlat: 0 };
      tsOf(heroId).forEach(t => { const s = tsStatOf(t); Object.keys(b).forEach(k => { b[k] += s[k]; }); });
      return b;
    }
    const tsFmt = v => String(Math.round(v * 10) / 10);
    function tsRefreshOthers() {
      try { renderHomeTeam(); } catch (e) {}
      try { if (document.getElementById('hero-modal').style.display === 'flex' && detailId !== null) openHeroDetail(detailId); } catch (e) {}
      try { if (document.getElementById('screen-vohiep').classList.contains('active')) renderVoHiep(); } catch (e) {}
    }
    let tsCtx = -1;
    function tsOpen(ctx) { tsCtx = (ctx === undefined || ctx < 0) ? -1 : ctx; tsRender(); document.getElementById('ts-modal').style.display = 'flex'; }
    function tsClose() { document.getElementById('ts-modal').style.display = 'none'; tsPickClose(); }
    // Ô khung dùng chung cho Bảo Vật & Trang bị: hiện tướng đang đứng ở khung đó
    function frSlot(f, act, unEq) {
      if (f < 0) return `<div class="ts-hero empty" onclick="${act}">＋</div>`;
      const h = team[f] !== undefined ? heroById(team[f]) : null;
      return `<div class="ts-hero" onclick="${act}">${h ? heroIcon(h) : '—'}<small class="ts-fr">Khung ${f + 1}</small><div class="ts-x" onclick="event.stopPropagation();${unEq}">✕</div></div>`;
    }
    function tsRender() {
      const lock = tsCtx >= 0;
      document.getElementById('ts-note').innerHTML = lock
        ? `<b>🔨 Búa: ${hammerCount()}</b> • Chọn Bảo Vật gắn vào <b>Khung ${tsCtx + 1}</b> (${tsOfFrame(tsCtx).length}/${TS_PER_HERO}). Bấm ô khung để gắn / tháo.`
        : `<b>🔨 Búa: ${hammerCount()}</b> — mỗi búa tăng 1★ cho Bảo Vật, thuộc tính hiện tại +50%. Bảo Vật giúp tăng sức mạnh Võ Hiệp. Mỗi khung gắn tối đa ${TS_PER_HERO} Bảo Vật và không được trùng loại, gắn vào khung nào thì tướng đứng ở khung đó nhận chỉ số (giống trang bị). Bấm ô khung để gắn / đổi, bấm ✕ để tháo.`;
      document.getElementById('ts-list').innerHTML = tsBag.map(t => {
        const act = lock ? `tsToggle(${t.u})` : `frPick('ts',${t.u})`;
        return `<div class="ts-row"><div class="ts-ico"><div class="ts-em">${tsIcon(t.id)}</div><div class="ts-nm">${tsName(t.id)}</div></div><div class="ts-link">🔗</div>${frSlot(t.f, act, `tsUnequip(${t.u})`)}
          <div class="ts-st"><b>Lv.${t.lv} <span style="color:#fbbf24">★${t.star}/${TS_STAR_MAX}</span></b>${tsLines(t)}${t.f >= 0 ? `<div class="ts-cnt">Khung ${t.f + 1} (${tsOfFrame(t.f).length}/${TS_PER_HERO})</div>` : ''}</div>
          <div class="ts-btns"><button class="btn-attack" ${t.lv >= TS_MAX ? 'disabled' : ''} onclick="tsUp(${t.u},1)">Tăng</button><button class="btn-close-battle" ${t.lv >= TS_MAX ? 'disabled' : ''} onclick="tsUp(${t.u},10)">+10</button><button class="btn-attack" style="background:linear-gradient(180deg,#a855f7,#6b21a8)" ${(t.star | 0) >= TS_STAR_MAX ? 'disabled' : ''} onclick="tsStarUp(${t.u})">🔨 ★</button></div></div>`;
      }).join('');
    }
    function tsUp(u, n) {
      const t = tsFind(u); if (!t || t.lv >= TS_MAX) return;
      t.lv = Math.min(TS_MAX, t.lv + n); tsSave(); tsRender(); tsRefreshOthers();
    }
    // Khung f đã có Bảo Vật CÙNG LOẠI với t (không tính chính t)?
    const tsDupInFrame = (t, f) => tsOfFrame(f).some(x => x.id === t.id && x.u !== t.u);
    function tsMount(u, f) {
      const t = tsFind(u); if (!t || team[f] === undefined) return;
      if (t.f !== f && tsOfFrame(f).length >= TS_PER_HERO) return;   // khung đủ 3 món
      if (tsDupInFrame(t, f)) { alert('Khung ' + (f + 1) + ' đã có ' + tsName(t.id) + ' rồi.\nMỗi khung chỉ gắn 1 Bảo Vật mỗi loại (không được trùng).'); return; }
      t.f = f; tsSave(); tsRender(); tsRefreshOthers();
    }
    function tsToggle(u) { const t = tsFind(u); if (t) { if (t.f === tsCtx) tsUnequip(u); else tsMount(u, tsCtx); } }
    function tsUnequip(u) { const t = tsFind(u); if (!t) return; t.f = -1; tsSave(); tsRender(); tsRefreshOthers(); }
    // Chọn khung để gắn (Bảo Vật 'ts' hoặc Trang bị 'eq')
    let frPickRef = null;
    function frPick(kind, id) {
      frPickRef = { kind, id };
      const it = kind === 'ts' ? tsFind(id) : eqBag.find(x => x.id === id); if (!it) return;
      document.getElementById('ts-pick-title').textContent = kind === 'ts' ? `Gắn ${tsName(it.id)} vào khung` : `Gắn ${eqType(it.k).name} vào khung`;
      document.getElementById('ts-pick-list').innerHTML = Array.from({ length: FRAMES }, (_, i) => {
        const h = team[i] !== undefined ? heroById(team[i]) : null;
        const n = kind === 'ts' ? tsOfFrame(i).length : 0, mine = it.f === i, full = kind === 'ts' && ((n >= TS_PER_HERO && !mine) || tsDupInFrame(it, i)), dis = !h || full;
        return `<div class="hchip ${mine ? 'sel' : ''}" style="${dis ? 'opacity:.35;' : ''}" onclick="${dis ? '' : `frPickDo(${i})`}"><div class="e">${h ? heroIcon(h) : '—'}</div><div class="n">Khung ${i + 1}</div>${kind === 'ts' ? `<div class="ts-cnt">${n}/${TS_PER_HERO}</div>` : ''}</div>`;
      }).join('');
      document.getElementById('ts-pick').style.display = 'flex';
    }
    function frPickDo(i) { const r = frPickRef; tsPickClose(); if (!r) return; if (r.kind === 'ts') tsMount(r.id, i); else eqMountTo(r.id, i); }
    function tsPickClose() { document.getElementById('ts-pick').style.display = 'none'; frPickRef = null; }

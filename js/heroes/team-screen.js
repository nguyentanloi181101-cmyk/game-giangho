/* ĐỘI NGŨ (màn hình đầy đủ) + DÀN HỖ TRỢ + màn chọn tướng để đổi
   - Bấm vào 1 tướng (ô đội ngũ hoặc ô hỗ trợ) → sang màn "Chọn Võ Hiệp" để đổi; "Gỡ Ra" để bỏ tướng khỏi ô.
   - Chọn tướng đang ở chỗ khác (đội ↔ hỗ trợ) thì 2 tướng ĐỔI CHỖ cho nhau.
   - Dữ liệu: team (roster.js, key 'team_ids') và supIds (hero-stats.js, key 'support_ids'). Công thức cộng chỉ số: supTotal() ở hero-stats.js. */

let tnTarget = null;     // ô đang đổi: { kind:'team'|'sup', idx }
let tnSortMode = 'lv';   // 'lv' = theo sao/cấp, 'id' = mặc định

const tnToast = m => { if (typeof scToast === 'function') scToast(m); else alert(m); };
const tnNum = v => v >= 1e6 ? fmtN(v) : Math.round(v).toLocaleString('vi-VN');
const tnBorder = id => ((typeof HERO_BORDER !== 'undefined' && HERO_BORDER[id]) || 'orange') === 'purple' ? 'purple' : '';
const tnSaveAll = () => { try { localStorage.setItem('team_ids', JSON.stringify(team)); } catch (e) {} supSave(); };
const tnCur = t => t.kind === 'team' ? (team[t.idx] == null ? null : team[t.idx]) : supIds[t.idx];
// tướng đang đứng ở đâu: { kind, idx } hoặc null
function tnLoc(id) {
  const t = team.indexOf(id); if (t >= 0) return { kind: 'team', idx: t };
  const s = supIds.indexOf(id); return s >= 0 ? { kind: 'sup', idx: s } : null;
}

/* Đặt tướng hid vào ô (kind, idx). hid = null → gỡ ra. Trả về false nếu bị chặn. */
function tnPlace(kind, idx, hid) {
  const cur = tnCur({ kind, idx });
  if (hid == null) {
    if (cur == null) return true;
    if (kind === 'team') { if (team.length <= 1) { tnToast('Đội phải có ít nhất 1 tướng ra trận'); return false; } team.splice(idx, 1); }
    else supIds[idx] = null;
    return true;
  }
  if (hid === cur) return true;
  const L = tnLoc(hid);
  // rút khỏi đội mà ô đích trống (hỗ trợ trống) → đội sẽ thiếu 1 tướng
  if (L && L.kind === 'team' && cur == null && team.length <= 1) { tnToast('Đội phải có ít nhất 1 tướng ra trận'); return false; }
  if (L) {   // tướng đang ở ô cũ → nhường chỗ cho tướng cũ của ô đích (hoặc bỏ trống)
    if (L.kind === 'team') { if (cur != null) team[L.idx] = cur; else team.splice(L.idx, 1); }
    else supIds[L.idx] = cur;
  }
  if (kind === 'team') { if (cur != null) team[idx] = hid; else team.push(hid); }
  else supIds[idx] = hid;
  return true;
}

/* ---------- màn Đội Ngũ ---------- */
function tnOpen() { tnRender(); switchScreen('team'); }
function tnBack() { switchScreen('home'); if (typeof renderHomeTeam === 'function') renderHomeTeam(); if (typeof updatePower === 'function') updatePower(); }
function tnPet() { if (typeof openThanThu === 'function') openThanThu(); else tnToast('Tính năng sắp ra mắt'); }

function tnRender() {
  const cards = [];
  for (let i = 0; i < 5; i++) {
    const id = team[i];
    if (id == null) { cards.push(`<div class="tn-card empty" onclick="tnOpenPick('team',${i})"><span>＋</span></div>`); continue; }
    const h = heroById(id), p = getProg(id);
    cards.push(`<div class="tn-card ${tnBorder(id)}" onclick="tnOpenPick('team',${i})">${i === 0 ? '<div class="tn-flag">🚩</div>' : ''}<div class="tn-img">${heroIcon(h)}</div><div class="tn-nm">${h.name}</div><div class="tn-lv">${p.lv}</div><div class="tn-st">${heroStarsHTML(p.star, { bigPx: 9 })}</div></div>`);
  }
  const sups = supIds.map((id, i) => {
    if (id == null) return `<div class="tn-sup empty" onclick="tnOpenPick('sup',${i})"><span>＋</span></div>`;
    const h = heroById(id), p = getProg(id);
    return `<div class="tn-sup ${tnBorder(id)}" onclick="tnOpenPick('sup',${i})"><div class="tn-img">${heroIcon(h)}</div><div class="tn-st">${heroStarsHTML(p.star, { bigPx: 8 })}</div></div>`;
  });
  const t = supTotal(false);
  document.getElementById('tn-main').innerHTML = `
    <div class="tn-row">${cards.join('')}</div>
    <div class="tn-bar"><b>Hỗ Trợ</b><span>Cộng chỉ số cho cả đội theo số sao</span></div>
    <div class="tn-srow">${sups.join('')}</div>
    <div class="tn-panel">
      <div class="tn-ptitle">Hỗ Trợ</div>
      <button class="tn-rule" onclick="tnRules()">📜<span>Quy Tắc</span></button>
      <div class="tn-stats">
        <div><i>HP</i><b>${tnNum(t.hp)}</b></div><div><i>Công</i><b>${tnNum(t.atk)}</b></div>
        <div><i>Thủ</i><b>${tnNum(t.def)}</b></div><div><i>Hồi</i><b>${tnNum(t.heal)}</b></div>
      </div>
    </div>
    <div class="tn-acts"><button class="tn-big green" onclick="tnToast('Tính năng sắp ra mắt')">Duyên</button><button class="tn-big blue" onclick="tnDetail()">Chỉ Số</button></div>`;
}

/* ---------- hộp thoại nhỏ: Quy Tắc / Chỉ Số ---------- */
function tnModal(title, html) {
  const old = document.getElementById('tn-modal'); if (old) old.remove();
  const m = document.createElement('div');
  m.id = 'tn-modal'; m.className = 'tn-modal';
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.innerHTML = `<div class="tn-mbox"><div class="tn-mt">${title}</div>${html}<button class="btn-attack tn-mok" onclick="document.getElementById('tn-modal').remove()">Đóng</button></div>`;
  document.body.appendChild(m);
}
function tnRules() {
  tnModal('📜 Quy Tắc Hỗ Trợ', `<p>Dàn Hỗ Trợ có <b>${SUP_SLOTS} ô</b>. Mỗi tướng đặt vào sẽ cộng cho <b>TOÀN ĐỘI</b> các chỉ số <b>HP, Công, Thủ, Hồi</b>.</p>
    <p>Số cộng = chỉ số bồi dưỡng của chính tướng hỗ trợ × (số sao ÷ ${SUP_STAR_DIV}).</p>
    <p>Ví dụ: tướng có 100 HP — <b>10★</b> cộng <b>+100 HP</b>, <b>15★</b> cộng <b>+150 HP</b>.</p>
    <p>Mỗi tướng chỉ đứng ở 1 chỗ: chọn tướng đang ở đội hoặc ô khác thì hai tướng sẽ đổi chỗ cho nhau.</p>`);
}
function tnDetail() {
  const rows = supIds.map(id => {
    if (id == null) return '';
    const h = heroById(id), p = getProg(id), g = supGive(id);
    return `<div class="tn-drow"><b>${h.name}</b> <i>${p.star}★ · Lv${p.lv}</i><div>HP +${tnNum(g.hp)} · Công +${tnNum(g.atk)} · Thủ +${tnNum(g.def)} · Hồi +${tnNum(g.heal)}</div></div>`;
  }).join('');
  const t = supTotal(false);
  tnModal('Chỉ Số Hỗ Trợ', (rows || '<p>Chưa có tướng nào trong dàn Hỗ Trợ.</p>') +
    `<div class="tn-drow tot"><b>Tổng cộng cho cả đội</b><div>HP +${tnNum(t.hp)} · Công +${tnNum(t.atk)} · Thủ +${tnNum(t.def)} · Hồi +${tnNum(t.heal)}</div></div>`);
}

/* ---------- màn chọn tướng để đổi ---------- */
function tnOpenPick(kind, idx) { tnTarget = { kind, idx }; tnRenderPick(); switchScreen('tpick'); }
function tnPickBack() { switchScreen('team'); }
function tnToggleSort() { tnSortMode = tnSortMode === 'lv' ? 'id' : 'lv'; tnRenderPick(); }
function tnRenderPick() {
  if (!tnTarget) return;
  const cur = tnCur(tnTarget), P = id => getProg(id);
  const list = ownedHeroes();   // chỉ tướng đã Chiêu Mộ ra
  if (tnSortMode === 'lv') list.sort((a, b) => (P(b.id).star - P(a.id).star) || (P(b.id).lv - P(a.id).lv) || (a.id - b.id));
  document.getElementById('tn-sort').textContent = tnSortMode === 'lv' ? 'Cấp Sao' : 'Mặc Định';
  document.getElementById('tn-pgrid').innerHTML =
    `<div class="tn-pc"><div class="tn-pi rm" onclick="tnPick(null)">Gỡ Ra</div></div>` +
    (list.length ? '' : '<div class="tn-pc" style="grid-column:1/-1;width:100%;opacity:.8;text-align:center">Chưa có tướng nào — hãy vào Chiêu Mộ để nhận tướng.</div>') +
    list.map(h => {
      const loc = tnLoc(h.id), p = P(h.id);
      const tag = loc ? (loc.kind === 'team' ? 'Đội' : 'Trợ') : '';
      return `<div class="tn-pc"><div class="tn-pi ${tnBorder(h.id)} ${h.id === cur ? 'sel' : ''}" onclick="tnPick(${h.id})">${heroIcon(h)}${tag ? `<i class="tn-tag">${tag}</i>` : ''}</div><div class="tn-pn">${h.name}</div><div class="tn-pl">${p.star}★ · Lv${p.lv}</div></div>`;
    }).join('');
}
function tnPick(id) {
  if (!tnTarget) return;
  if (!tnPlace(tnTarget.kind, tnTarget.idx, id)) return;
  tnSaveAll(); tnRender(); switchScreen('team');
}

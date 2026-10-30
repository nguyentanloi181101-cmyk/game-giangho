/* NHIỆM VỤ (Tích Cực hằng ngày) + SỰ KIỆN
   Đếm tiến độ bằng cách bọc các hàm có sẵn (không sửa logic cũ). */
const QS_TASKS = [   // [id, tên, mục tiêu, điểm, nhãn]
  ['gh', 'Vượt 10 phó bản Giang Hồ', 10, 10], ['rec', 'Chiêu mộ võ hiệp 1 lần', 1, 10], ['rec2', 'Chiêu Mộ Cao Cấp 1 lần', 1, 15], ['eq', 'Cường hóa trang bị 2 lần', 2, 10],
  ['pvp', 'Tỷ võ 3 lần', 3, 15], ['dtl', 'Vượt ải Danh Tướng Lầu 1 lần', 1, 10, 1], ['bd', 'Bồi dưỡng 10 lần', 10, 10], ['bd2', 'Bồi dưỡng cao cấp 1 lần', 1, 10], ['lk', 'Tham gia Luận Kiếm 1 lần', 1, 10, 1]];
const QS_CHESTS = [[25, [['Vải Xanh', '🧵', 2], ['Túi Xanh', '👝', 2], ['Thú Hồn', '🟠', 100]]], [50, [['Vải Xanh', '🧵', 2], ['Túi Xanh', '👝', 2], ['Ngọc Tím', '🟣', 5]]],
  [75, [['@gold', '🪙', 200], ['Vải Xanh', '🧵', 2], ['Túi Lam', '👜', 1]]], [100, [['@gold', '🪙', 1000], ['Vải Xanh', '🧵', 2], ['Túi Lam', '👜', 1]]]];
function qsSt() {
  const s = loadJSON('quest_state'), dk = new Date().toDateString();
  if (s.day !== dk) { s.day = dk; s.p = {}; s.claimed = {}; s.free = 0; saveJSON('quest_state', s); }
  s.p = s.p || {}; s.claimed = s.claimed || {}; return s;
}
const qsPts = s => QS_TASKS.reduce((a, t) => a + ((s.p[t[0]] || 0) >= t[2] ? t[3] : 0), 0);
function qsAdd(id, n) { try { const s = qsSt(), t = QS_TASKS.find(x => x[0] === id); s.p[id] = Math.min(t[2], (s.p[id] || 0) + (n || 1)); saveJSON('quest_state', s); } catch (e) {} }
function qsKho(name, ico, qty) { if (name === '@gold') { gold += qty; resSave(); return; } const k = gdSt(); const s = gdSt(); (s.kho[name] = s.kho[name] || { ico, qty: 0 }).qty += qty; gdSave(s); }
function openQuest() { renderQuest(); switchScreen('quest'); }
function renderQuest() {
  const s = qsSt(), pts = qsPts(s);
  document.getElementById('qs-chests').innerHTML = `<div class="qs-bar"><i style="width:${Math.min(100, pts)}%"></i></div>` + QS_CHESTS.map(([th], i) => { const st = s.claimed[th] ? 'done' : pts >= th ? 'ready' : '';
    return `<div class="qs-ch ${st}" style="left:${(i + 1) * 25 * .86 + 3}%" onclick="qsChest(${th})"><span>🎁</span><small>${th}Điểm</small></div>`; }).join('');
  document.getElementById('qs-list').innerHTML = `<div class="dv-uy">Điểm Tích Cực: ${pts}/100</div>` + QS_TASKS.map(t => { const v = s.p[t[0]] || 0, ok = v >= t[2];
    return `<div class="qs-row ${ok ? 'ok' : ''}" ${t[4] && !ok ? `onclick="qsManual('${t[0]}')"` : ''}><div><b>${t[1]}</b><div>${v}/${t[2]}lần</div></div><div class="qs-pt">🎯 +${t[3]}<small>${ok ? 'Đã xong' : 'Tích Cực'}</small></div></div>`; }).join('');
}
function qsManual(id) { if (confirm('Chế độ này chưa mở trong game. Tạm tính hoàn thành nhiệm vụ?')) { qsAdd(id, 99); renderQuest(); } }
function qsChest(th) {
  const s = qsSt(), c = QS_CHESTS.find(x => x[0] === th); if (s.claimed[th]) return scToast('Đã nhận rồi');
  const m = document.getElementById('qs-modal'), ok = qsPts(s) >= th;
  m.innerHTML = `<div class="md-box"><div class="hd-name" style="text-align:center;color:#fde047">Quà Tích Cực (${th} điểm)</div><div class="qs-gifts">${c[1].map(g => `<div>${g[1]}<em>${fmtN(g[2])}</em><small>${g[0] === '@gold' ? 'Vàng' : g[0]}</small></div>`).join('')}</div>
    <div class="gs-act"><button style="margin:auto" ${ok ? '' : 'disabled'} onclick="qsClaim(${th})">${ok ? 'Nhận' : 'Chưa đủ điểm'}</button></div></div>`; m.style.display = 'flex';
}
function qsClaim(th) { const s = qsSt(); if (s.claimed[th] || qsPts(s) < th) return; QS_CHESTS.find(x => x[0] === th)[1].forEach(g => qsKho(g[0], g[1], g[2])); const s2 = qsSt(); s2.claimed[th] = 1; saveJSON('quest_state', s2); document.getElementById('qs-modal').style.display = 'none'; renderQuest(); scToast('Đã nhận quà, xem trong Túi Đồ'); }
/* ---- Sự Kiện (đã bỏ toàn bộ mục nạp / tiêu phí) ---- */
const QS_EVENTS = [['Quà Free', '🎁', 'free'], ['Đổi', '🔁'], ['Đập Rượu', '🏺'], ['Rút Thẻ', '🎴'], ['Quà Online', '🎀'], ['Dã Tẩu', '📜'], ['Tụ Linh Đàn', '🏅'], ['Kỳ Cuộc', '🪷'], ['Thiên Cơ', '🔮']];
function openEvents() {
  const s = qsSt(), m = document.getElementById('qs-modal');
  m.innerHTML = `<div class="md-box"><button class="md-x" onclick="document.getElementById('qs-modal').style.display='none'">✕</button><div class="hd-name" style="text-align:center;color:#fde047">Sự kiện</div><div class="qs-ev">${QS_EVENTS.map(e => `<div onclick="evGo('${e[2] || ''}','${e[0]}')"><i>${e[1]}${e[2] === 'free' && !s.free ? '<b>1</b>' : ''}</i>${e[0]}</div>`).join('')}</div></div>`; m.style.display = 'flex';
}
function evGo(k, n) {
  if (k !== 'free') return scToast(n + ' — sắp ra mắt');
  const s = qsSt(); if (s.free) return scToast('Hôm nay đã nhận Quà Free'); s.free = 1; saveJSON('quest_state', s); silver += 20000; rice += 10000; resSave(); openEvents(); scToast('Nhận 20.000 bạc + 10.000 gạo');
}
/* ---- bọc hàm có sẵn để đếm tiến độ ---- */
(function () {
  const wrap = (name, fn) => { const o = window[name]; if (typeof o !== 'function') return; window[name] = function () { return fn(o, arguments); }; };
  wrap('grantBanReward', (o, a) => { qsAdd('gh'); return o.apply(null, a); });
  wrap('pvpFinish', (o, a) => { qsAdd('pvp'); return o.apply(null, a); });
  wrap('eqUpgrade', (o, a) => { const it = eqBag.find(i => i.id === a[0]), b = it ? it.lv : 0; const r = o.apply(null, a); if (it && it.lv > b) qsAdd('eq'); return r; });
  wrap('doRecruit', (o, a) => { const tot = () => Object.values(heroShards).reduce((x, y) => x + y, 0), b = tot(); const r = o.apply(null, a); if (tot() > b) { qsAdd('rec'); if (a[0] !== 'lam') qsAdd('rec2'); } return r; });
  wrap('upgradeHero', (o, a) => { const b = getProg(vmId).lv; const r = o.apply(null, a); const d = getProg(vmId).lv - b; if (a[0] === 'lv' && d > 0) { qsAdd('bd', d); if (a[1] >= 10) qsAdd('bd2'); } return r; });
})();
(function () { const d = document.createElement('div'); d.id = 'qs-modal'; d.className = 'md-wrap'; d.onclick = e => { if (e.target === d) d.style.display = 'none'; }; document.body.appendChild(d);
  const sc = document.createElement('div'); sc.className = 'screen'; sc.id = 'screen-quest'; sc.innerHTML = `<div class="pve-header"><button class="btn-back" onclick="switchScreen('home')">Trở về</button><h2 class="pve-title">Nhiệm Vụ</h2></div><div class="qs-chests" id="qs-chests"></div><div id="qs-list"></div>`; document.querySelector('.main-content').appendChild(sc); })();

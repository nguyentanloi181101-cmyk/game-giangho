/* NHIỆM VỤ (Tích Cực hằng ngày) + SỰ KIỆN
   Đếm tiến độ bằng cách bọc các hàm có sẵn (không sửa logic cũ). */
/* Admin chỉnh ở admin.html → tab "🎯 Nhiệm Vụ" / "🎪 Sự Kiện" (game_config/main):
     quest.tasks  = { "<id nhiệm vụ>": { name, n (mục tiêu), pts (điểm Tích Cực), off (1 = ẩn nhiệm vụ) } }
     quest.chests = [ { pts: mốc điểm, gifts: [quà...] } ]   (có thì thay hoàn toàn rương mặc định)
     event.list   = [ { id, name, ico, kind: 'daily' | 'once' | 'soon', gifts: [quà...], from, to, off } ]   (có thì thay hoàn toàn danh sách mặc định)
   Quà dùng chung định dạng Gift Code (xem remote-config.js). */
const QS_TASKS_DEF = [   // [id, tên, mục tiêu, điểm, nhãn]
  ['gh', 'Vượt 10 phó bản Giang Hồ', 10, 10], ['rec', 'Chiêu mộ võ hiệp 1 lần', 1, 10], ['rec2', 'Chiêu Mộ Cao Cấp 1 lần', 1, 15], ['eq', 'Cường hóa trang bị 2 lần', 2, 10],
  ['pvp', 'Tỷ võ 3 lần', 3, 15], ['dtl', 'Vượt ải Danh Tướng Lầu 1 lần', 1, 10, 1], ['bd', 'Bồi dưỡng 10 lần', 10, 10], ['bd2', 'Bồi dưỡng cao cấp 1 lần', 1, 10], ['lk', 'Tham gia Luận Kiếm 1 lần', 1, 10, 1]];
const QS_CHESTS_DEF = [[25, [{ t: 'item', name: 'Vải Xanh', ico: '🧵', n: 2 }, { t: 'item', name: 'Túi Xanh', ico: '👝', n: 2 }, { t: 'item', name: 'Thú Hồn', ico: '🟠', n: 100 }]],
  [50, [{ t: 'item', name: 'Vải Xanh', ico: '🧵', n: 2 }, { t: 'item', name: 'Túi Xanh', ico: '👝', n: 2 }, { t: 'item', name: 'Ngọc Tím', ico: '🟣', n: 5 }]],
  [75, [{ t: 'gold', n: 200 }, { t: 'item', name: 'Vải Xanh', ico: '🧵', n: 2 }, { t: 'item', name: 'Túi Lam', ico: '👜', n: 1 }]],
  [100, [{ t: 'gold', n: 1000 }, { t: 'item', name: 'Vải Xanh', ico: '🧵', n: 2 }, { t: 'item', name: 'Túi Lam', ico: '👜', n: 1 }]]];
/* Nhiệm vụ tự thêm (quest.custom = [{ id, name, n, pts, trigger }]): trigger là hành động trong game sẽ được tính (xem QS_TRIGGERS) */
const QS_TRIGGERS = ['pve', 'pvp', 'rec', 'eq', 'bd', 'boss', 'tt', 'mail', 'donate', 'basin', 'skill', 'login'];
function qsTrig(tr, n) { try { QS_TASKS.filter(t => t[5] === tr).forEach(t => qsAdd(t[0], n || 1)); } catch (e) {} }
let QS_TASKS = QS_TASKS_DEF, QS_CHESTS = QS_CHESTS_DEF, QS_MAX = 100;
cfgOnApply(() => {
  const ov = cfgGet('quest.tasks', {}) || {};
  QS_TASKS = QS_TASKS_DEF.map(t => {
    const o = ov[t[0]]; if (!o) return t; if (Number(o.off) === 1) return null;
    const n = Math.floor(Number(o.n)), pts = Number(o.pts);
    return [t[0], o.name || t[1], n >= 1 ? n : t[2], isFinite(pts) && pts >= 0 ? pts : t[3], t[4]];
  }).filter(Boolean);
  const cu = cfgGet('quest.custom', []); (Array.isArray(cu) ? cu : []).forEach(x => {
    if (!x || !x.id || !x.name || !QS_TRIGGERS.includes(x.trigger) || Number(x.off) === 1) return;
    QS_TASKS.push(['c_' + String(x.id).replace(/[^A-Za-z0-9_]/g, ''), String(x.name), Math.max(1, Math.floor(Number(x.n)) || 1), Math.max(0, Number(x.pts) || 0), undefined, x.trigger]);
  });
  const c = cfgGet('quest.chests', null);
  QS_CHESTS = Array.isArray(c) && c.length ? c.filter(x => x && Number(x.pts) > 0).map(x => [Math.floor(Number(x.pts)), rwList(x.gifts)]).sort((a, b) => a[0] - b[0]) : QS_CHESTS_DEF;
  if (!QS_CHESTS.length) QS_CHESTS = QS_CHESTS_DEF;
  QS_MAX = Math.max(1, ...QS_CHESTS.map(x => x[0]));
});
function qsSt() {
  const s = loadJSON('quest_state'), dk = new Date().toDateString();
  if (s.day !== dk) { s.day = dk; s.p = {}; s.claimed = {}; s.free = 0; s.ev = {}; saveJSON('quest_state', s); }
  s.p = s.p || {}; s.claimed = s.claimed || {}; s.ev = s.ev || {}; s.evOnce = s.evOnce || {}; return s;
}
const qsPts = s => QS_TASKS.reduce((a, t) => a + ((s.p[t[0]] || 0) >= t[2] ? t[3] : 0), 0);
function qsAdd(id, n) { try { const s = qsSt(), t = QS_TASKS.find(x => x[0] === id); s.p[id] = Math.min(t[2], (s.p[id] || 0) + (n || 1)); saveJSON('quest_state', s); } catch (e) {} }
function qsKho(name, ico, qty) { if (name === '@gold') { gold += qty; resSave(); return; } const k = gdSt(); const s = gdSt(); (s.kho[name] = s.kho[name] || { ico, qty: 0 }).qty += qty; gdSave(s); }
function openQuest() { renderQuest(); switchScreen('quest'); }
function renderQuest() {
  const s = qsSt(), pts = qsPts(s);
  document.getElementById('qs-chests').innerHTML = `<div class="qs-bar"><i style="width:${Math.min(100, pts / QS_MAX * 100)}%"></i></div>` + QS_CHESTS.map(([th]) => { const st = s.claimed[th] ? 'done' : pts >= th ? 'ready' : '';
    return `<div class="qs-ch ${st}" style="left:${th / QS_MAX * 100 * .86 + 3}%" onclick="qsChest(${th})"><span>🎁</span><small>${th}Điểm</small></div>`; }).join('');
  document.getElementById('qs-list').innerHTML = `<div class="dv-uy">Điểm Tích Cực: ${pts}/${QS_MAX}</div>` + QS_TASKS.map(t => { const v = s.p[t[0]] || 0, ok = v >= t[2];
    return `<div class="qs-row ${ok ? 'ok' : ''}" ${t[4] && !ok ? `onclick="qsManual('${t[0]}')"` : ''}><div><b>${t[1]}</b><div>${v}/${t[2]}lần</div></div><div class="qs-pt">🎯 +${t[3]}<small>${ok ? 'Đã xong' : 'Tích Cực'}</small></div></div>`; }).join('');
}
function qsManual(id) { if (confirm('Chế độ này chưa mở trong game. Tạm tính hoàn thành nhiệm vụ?')) { qsAdd(id, 99); renderQuest(); } }
function qsChest(th) {
  const s = qsSt(), c = QS_CHESTS.find(x => x[0] === th); if (!c) return; if (s.claimed[th]) return scToast('Đã nhận rồi');
  const m = document.getElementById('qs-modal'), ok = qsPts(s) >= th;
  m.innerHTML = `<div class="md-box"><div class="hd-name" style="text-align:center;color:#fde047">Quà Tích Cực (${th} điểm)</div><div class="qs-gifts">${c[1].map(g => { const i = rwInfo(g); return `<div>${i.ico}<em>${fmtN(i.n)}</em><small>${i.name}</small></div>`; }).join('')}</div>
    <div class="gs-act"><button style="margin:auto" ${ok ? '' : 'disabled'} onclick="qsClaim(${th})">${ok ? 'Nhận' : 'Chưa đủ điểm'}</button></div></div>`; m.style.display = 'flex';
}
function qsClaim(th) {
  const s = qsSt(), c = QS_CHESTS.find(x => x[0] === th); if (!c || s.claimed[th] || qsPts(s) < th) return;
  rwGrantAll(c[1]); const s2 = qsSt(); s2.claimed[th] = 1; saveJSON('quest_state', s2);
  document.getElementById('qs-modal').style.display = 'none'; renderQuest(); scToast('Đã nhận quà, xem trong Túi Đồ');
  if (typeof clPush === 'function') { try { clPush(); } catch (e) {} }
}
/* ---- Sự Kiện (đã bỏ toàn bộ mục nạp / tiêu phí) ---- */
const QS_EVENTS_DEF = [{ id: 'free', name: 'Quà Free', ico: '🎁', kind: 'daily', gifts: [{ t: 'silver', n: 20000 }, { t: 'rice', n: 10000 }] }, { id: 'e2', name: 'Đổi', ico: '🔁', kind: 'soon' }, { id: 'e3', name: 'Đập Rượu', ico: '🏺', kind: 'soon' },
  { id: 'e4', name: 'Rút Thẻ', ico: '🎴', kind: 'soon' }, { id: 'e5', name: 'Quà Online', ico: '🎀', kind: 'soon' }, { id: 'e6', name: 'Dã Tẩu', ico: '📜', kind: 'soon' }, { id: 'e7', name: 'Tụ Linh Đàn', ico: '🏅', kind: 'soon' },
  { id: 'e8', name: 'Kỳ Cuộc', ico: '🪷', kind: 'soon' }, { id: 'e9', name: 'Thiên Cơ', ico: '🔮', kind: 'soon' }];
function evList() {
  const L = cfgGet('event.list', null), src = (Array.isArray(L) && L.length) ? L : QS_EVENTS_DEF;
  return src.filter(e => e && e.id && e.name && Number(e.off) !== 1);
}
const evClaimed = (s, e) => e.kind === 'once' ? !!s.evOnce[e.id] : !!(s.ev[e.id] || (e.id === 'free' && s.free));
function evWindow(e) { const n = Date.now(); return e.from && n < e.from ? 'wait' : (e.to && n > e.to ? 'end' : 'ok'); }
const evReady = (s, e) => (e.kind === 'daily' || e.kind === 'once') && rwList(e.gifts).length && evWindow(e) === 'ok' && !evClaimed(s, e);
function openEvents() {
  const s = qsSt(), m = document.getElementById('qs-modal'), L = evList().filter(e => evWindow(e) !== 'end' || e.kind === 'soon');
  m.innerHTML = `<div class="md-box"><button class="md-x" onclick="document.getElementById('qs-modal').style.display='none'">✕</button><div class="hd-name" style="text-align:center;color:#fde047">Sự kiện</div><div class="qs-ev">${L.map(e => `<div onclick="evGo('${String(e.id).replace(/'/g, '')}')"><i>${e.ico || '🎁'}${evReady(s, e) ? '<b>1</b>' : ''}</i>${String(e.name).replace(/[<>&]/g, '')}</div>`).join('')}</div></div>`; m.style.display = 'flex';
}
function evGo(id) {
  const e = evList().find(x => String(x.id).replace(/'/g, '') === id); if (!e) return;
  if (e.kind !== 'daily' && e.kind !== 'once') return scToast(e.name + ' — sắp ra mắt');
  const w = evWindow(e); if (w === 'wait') return scToast(e.name + ' — chưa mở (bắt đầu ' + new Date(e.from).toLocaleString('vi-VN') + ')'); if (w === 'end') return scToast(e.name + ' — đã kết thúc');
  const s = qsSt(); if (evClaimed(s, e)) return scToast(e.kind === 'once' ? 'Bạn đã nhận ' + e.name + ' rồi' : 'Hôm nay đã nhận ' + e.name);
  if (!rwList(e.gifts).length) return scToast(e.name + ' — chưa có quà');
  if (e.kind === 'once') s.evOnce[e.id] = 1; else { s.ev[e.id] = 1; if (e.id === 'free') s.free = 1; }
  saveJSON('quest_state', s);
  const got = rwGrantAll(e.gifts); openEvents(); scToast('Nhận: ' + got);
  if (typeof clPush === 'function') { try { clPush(); } catch (er) {} }
}
/* ---- bọc hàm có sẵn để đếm tiến độ ---- */
(function () {
  const wrap = (name, fn) => { const o = window[name]; if (typeof o !== 'function') return; window[name] = function () { return fn(o, arguments); }; };
  wrap('grantBanReward', (o, a) => { qsAdd('gh'); qsTrig('pve'); return o.apply(null, a); });
  wrap('pvpFinish', (o, a) => { qsAdd('pvp'); qsTrig('pvp'); return o.apply(null, a); });
  wrap('eqUpgrade', (o, a) => { const it = eqBag.find(i => i.id === a[0]), b = it ? it.lv : 0; const r = o.apply(null, a); if (it && it.lv > b) { qsAdd('eq'); qsTrig('eq'); } return r; });
  wrap('doRecruit', (o, a) => { const tot = () => Object.values(heroShards).reduce((x, y) => x + y, 0), b = tot(); const r = o.apply(null, a); if (tot() > b) { qsAdd('rec'); qsTrig('rec'); if (a[0] !== 'lam') qsAdd('rec2'); } return r; });
  wrap('upgradeHero', (o, a) => { const b = getProg(vmId).lv; const r = o.apply(null, a); const d = getProg(vmId).lv - b; if (a[0] === 'lv' && d > 0) { qsAdd('bd', d); qsTrig('bd', d); if (a[1] >= 10) qsAdd('bd2'); } return r; });
})();
/* thêm các hành động mới cho nhiệm vụ tự tạo */
(function () {
  const wrap = (name, tr) => { const o = window[name]; if (typeof o !== 'function') return; window[name] = function () { const r = o.apply(this, arguments); qsTrig(tr); return r; }; };
  wrap('bbFight', 'boss'); wrap('ttFeed', 'tt'); wrap('mailClaim', 'mail'); wrap('mailClaimAll', 'mail'); wrap('mailClaimLetter', 'mail'); wrap('dsGive', 'donate'); wrap('basinPut', 'basin'); wrap('dvLearn', 'skill');
  document.addEventListener('DOMContentLoaded', () => qsTrig('login'));
})();
(function () { const d = document.createElement('div'); d.id = 'qs-modal'; d.className = 'md-wrap'; d.onclick = e => { if (e.target === d) d.style.display = 'none'; }; document.body.appendChild(d);
  const sc = document.createElement('div'); sc.className = 'screen'; sc.id = 'screen-quest'; sc.innerHTML = `<div class="pve-header"><button class="btn-back" onclick="switchScreen('home')">Trở về</button><h2 class="pve-title">Nhiệm Vụ</h2></div><div class="qs-chests" id="qs-chests"></div><div id="qs-list"></div>`; document.querySelector('.main-content').appendChild(sc); })();

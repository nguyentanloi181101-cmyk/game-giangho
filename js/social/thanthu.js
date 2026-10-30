/* THẦN THÚ (Bang Hội): 18 thần thú, cấp / sao / phụ thể (Lĩnh Ngộ), Cấm Địa (nhận mảnh) */
const TT_BEASTS = [   // [tên, hạng, mảnh cần, icon, [hiệu quả phụ thể: tên, giá trị, là điểm?]]
  ['Kỳ Lân', 'A+', 0, '🦄', [['Bạo Tức', 10], ['Cường Công', 5]]], ['Xích Vũ', 'A+', 30, '🦅', [['Kích Phá', 2000, 1], ['Cường Công', 8], ['Đẩy Lui', 10]]],
  ['Tiên Lộc', 'A+', 40, '🦌', [['Kích Sát', 10], ['Bạo Tức', 10], ['Cấp Tốc', 5]]], ['Long Quy', 'A+', 50, '🐢', [['Chiến Thuẫn', 15], ['Thần Thuẫn', 15], ['Kích Phá', 3000, 1]]],
  ['Báo Tuyết', 'A+', 100, '🐆', [['Thần Tốc', 4], ['Cấp Tốc', 8], ['Bạo Tức', 12], ['Tinh Chuẩn', 15]]], ['Hắc Điêu', 'A+', 150, '🦅', [['Thần Tốc', 8], ['Sát Lục', 12], ['Ẩn Thân', 12], ['Tàn Ảnh', 10]]],
  ['Cuồng Ngưu', 'A+', 150, '🐂', [['Trợ Tốc', 8], ['Cường Công', 12], ['Thần Thuẫn', 10], ['Kích Phá', 5000, 1]]], ['Lân Sư', 'A+', 200, '🦁', [['Thần Tốc', 11], ['Trợ Tốc', 11], ['Cấp Tốc', 11], ['Gia Tốc', 11]]],
  ['Thiên Lân', 'S', 250, '🦄', [['Tàn Ảnh', 25], ['Cường Công', 10], ['Bạo Tức', 15], ['Trợ Tốc', 5]]], ['Xích Tinh', 'S', 250, '🦩', [['Kích Phá', 10000, 1], ['Cường Công', 12], ['Đẩy Lui', 20], ['Trợ Tốc', 5]]],
  ['Kim Quy', 'S', 250, '🐢', [['Thần Thuẫn', 25], ['Chiến Thuẫn', 25], ['Tàn Ảnh', 25], ['Ngự Thuẫn', 20]]], ['Thiên Lộc', 'S', 250, '🦌', [['Kích Sát', 20], ['Bạo Tức', 30], ['Kích Phá', 20000, 1], ['Cấp Tốc', 10]]],
  ['Mai Hoa Báo', 'S', 250, '🐆', [['Thần Tốc', 10], ['Cấp Tốc', 12], ['Bạo Tức', 22], ['Tinh Chuẩn', 30]]], ['Tử Sắc Điêu', 'S', 250, '🦅', [['Cấp Tốc', 14], ['Kích Phá', 40000, 1], ['Bạo Tức', 24], ['Tàn Ảnh', 30]]],
  ['Nham Ngưu', 'S', 250, '🐂', [['Chiến Thuẫn', 30], ['Thần Tốc', 12], ['Bạo Tức', 25], ['Kích Sát', 25]]], ['Thiên Niên Thú', 'S', 250, '🦁', [['Thần Tốc', 13], ['Cấp Tốc', 13], ['Bạo Tức', 20], ['Cường Công', 25]]],
  ['Địa Niên Thú', 'S', 250, '👹', [['Trợ Tốc', 13], ['Gia Tốc', 13], ['Kích Phá', 20000, 1], ['Tàn Ảnh', 22]]], ['Kim Sư', 'S', 250, '🦁', [['Trợ Tốc', 12], ['Tàn Ảnh', 25], ['Kích Phá', 40000, 1], ['Cường Công', 20]]], ['Tản Viên Thần', 'S', 250, '🗿', [['Thần Thuẫn', 20], ['Thần Tốc', 11], ['Ngự Thuẫn', 25], ['Kỳ Thuẫn', 25]]], ['Giáp Thìn', 'S', 250, '🐉', [['Cấp Tốc', 12], ['Kích Sát', 25], ['Bạo Tức', 23], ['Cường Công', 23]]],
  ['Cửu Vỹ Hồ', 'S', 250, '🦊', [['Thần Tốc', 12], ['Tàn Ảnh', 24], ['Kỳ Thuẫn', 25], ['Cường Công', 20]]], ['Hỏa Kỳ Lân', 'S', 250, '🔥', []], ['Khổng Tước', 'S', 250, '🦚', [['Thần Tốc', 17], ['Cấp Tốc', 17], ['Trợ Tốc', 14], ['Cường Công', 30]]]];
const TT_PT = ['Huyết Bạo', 'Ngự Thuẫn', 'Hoạt Khí', 'Cường Công', 'Sát Lục', 'Thần Huyết', 'Tái Sinh', 'Thần Thuẫn', 'Chiến Thuẫn', 'Bá Thuẫn', 'Bạo Nộ', 'Bạo Tức', 'Tinh Chuẩn', 'Cấp Tốc', 'Ẩn Thân', 'Kích Sát', 'Kích Phá', 'Đẩy Lui', 'Trợ Thuẫn', 'Tàn Ảnh', 'Kỳ Thuẫn', 'Thần Tốc', 'Trợ Tốc', 'Hộ Tốc', 'Gia Tốc'];
const TT_PT_ICO = ['🩸', '🛡️', '💠', '⚔️', '🗡️', '❤️‍🔥', '💚', '🔰', '🧱', '🐯', '💪', '⚡', '🎯', '🏃', '🌫️', '🔪', '👹', '💨', '🛡️', '👤', '☯️', '👢', '👟', '👞', '🥾'];
const TT_QC = ['#9ca3af', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b'], TT_FEED = { 'Thú Hồn': 100, 'Thú Linh': 500 };
const ttBeast = n => TT_BEASTS.find(b => b[0] === n);
function ttSt() {
  const s = gdSt();
  if (!s.tt) { s.tt = { cur: 'Kỳ Lân', own: { 'Kỳ Lân': { lv: 1, star: 1, exp: 0 } }, sh: {}, slots: {}, sel: 0, prev: null, freeAt: 0, cc: { day: '', left: 3 } };
    s.kho['Thú Hồn'] = { ico: '🟠', qty: 100 }; s.kho['Thú Linh'] = { ico: '🔥', qty: 10 }; s.kho['Quỷ Linh'] = { ico: '🎭', qty: 10 }; s.kho['Đá Nữ Oa'] = { ico: '🔻', qty: 400 }; gdSave(s); }   // quà khởi đầu
  const t = s.tt; Object.keys(s.kho).forEach(k => { if (k.indexOf('Châu ') === 0 && s.kho[k].qty > 0 && ttBeast(k.slice(5))) { t.sh[k.slice(5)] = (t.sh[k.slice(5)] || 0) + s.kho[k].qty; s.kho[k].qty = 0; } });   // Châu = mảnh thần thú
  return s;
}
const ttCur = s => s.tt.own[s.tt.cur];
const ttCap = o => 20 * o.star + 20, ttNeed = lv => Math.round(2.7 * lv * lv * lv) + 100;
const ttStat = (b, o) => { const hp = Math.round(963.5 * o.lv * (1 + .15 * (o.star - 4)) * (b[1] === 'S' ? 1.5 : 1)); return { pts: Math.round(hp * .4008), hp, heal: Math.round(hp / 5), pha: 800 * o.star, dodge: 10 * o.star }; };
const ttSlotsOpen = (b, o) => Math.min(o.star, 5) + (b[1] === 'S' ? 5 : 0);
const ttItem = (s, n) => (s.kho[n] && s.kho[n].qty) || 0;
const ttTake = (s, n, q) => { s.kho[n].qty -= q; };
let ttTab = 'thu', ttTimerOn = false;
const ttHome = () => { const d = document.getElementById('tt-body'); return d; };
function openThanThu() { ttSt(); renderThanThu(); switchScreen('thanthu'); }
function ttTabSet(t) { ttTab = t; renderThanThu(); }
function ttSlotDesc(sl) { return sl ? `Hiệu quả ${sl.n} +${[4, 6, 8, 12, 16][sl.q - 1]}%` : 'Trống'; }
function ttRoll(max) { const r = Math.random(); const q = r < .45 ? 1 : r < .75 ? 2 : r < .92 ? 3 : r < .985 ? 4 : 5; return { n: TT_PT[Math.floor(Math.random() * TT_PT.length)], q: Math.min(q, max || 5) }; }
function ttFeed() {
  const s = ttSt(), o = ttCur(s), cap = ttCap(o); let gain = 0;
  Object.keys(TT_FEED).forEach(k => { const q = ttItem(s, k); if (q > 0) { gain += q * TT_FEED[k]; s.kho[k].qty = 0; } });
  if (!gain) return scToast('Không có vật liệu (Thú Hồn / Thú Linh)');
  o.exp += gain; while (o.lv < cap && o.exp >= ttNeed(o.lv)) { o.exp -= ttNeed(o.lv); o.lv++; } if (o.lv >= cap) o.exp = Math.min(o.exp, ttNeed(o.lv));
  gdSave(s); renderThanThu(); scToast('+' + fmtN(gain) + ' kinh nghiệm');
}
function ttStarUp() {
  const s = ttSt(), o = ttCur(s); if (o.star >= 5) return scToast('Đã tối đa sao');
  const ql = 10 * o.star, da = 400 * o.star; if (ttItem(s, 'Quỷ Linh') < ql || ttItem(s, 'Đá Nữ Oa') < da) return scToast('Không đủ vật liệu');
  ttTake(s, 'Quỷ Linh', ql); ttTake(s, 'Đá Nữ Oa', da); o.star++; gdSave(s); renderThanThu(); scToast('Lên ' + o.star + ' sao!');
}
function ttSel(i) { const s = ttSt(); s.tt.sel = i; gdSave(s); renderThanThu(); }
function ttReroll(n) {
  const s = ttSt(), t = s.tt, o = ttCur(s), b = ttBeast(t.cur), arr = t.slots[t.cur] = t.slots[t.cur] || [];
  if (t.sel >= ttSlotsOpen(b, o)) return scToast('Ô này chưa mở');
  if (n === 1) { if (Date.now() < t.freeAt) return scToast('Chưa hết thời gian miễn phí'); t.freeAt = Date.now() + 120000; }
  else { if (gold < 500) return scToast('Cần 500 Vàng'); gold -= 500; resSave(); }
  let best = null; for (let i = 0; i < n; i++) { const r = ttRoll(); if (!best || r.q > best.q) best = r; }
  t.prev = { i: t.sel, v: arr[t.sel] || null }; arr[t.sel] = best; gdSave(s); renderThanThu();
}
function ttRevert() { const s = ttSt(), t = s.tt, arr = t.slots[t.cur] = t.slots[t.cur] || []; if (!t.prev) return scToast('Chưa có lần tẩy trước'); const cur = arr[t.prev.i] || null; arr[t.prev.i] = t.prev.v; t.prev = { i: t.prev.i, v: cur }; gdSave(s); renderThanThu(); }
function ttList() {
  document.getElementById('tt-modal').innerHTML = `<div class="md-box"><button class="md-x" onclick="ttClose()">✕</button><div class="hd-name" style="text-align:center">Phụ Thể</div><div class="tt-pgrid">${TT_PT.map((n, i) => `<div style="border-color:${TT_QC[i % 5]}"><i>${TT_PT_ICO[i]}</i>${n}</div>`).join('')}</div></div>`; document.getElementById('tt-modal').style.display = 'flex';
}
function ttClose() { document.getElementById('tt-modal').style.display = 'none'; }
function ttChange() {
  const s = ttSt(), t = s.tt, bx = b => { const own = t.own[b[0]], sh = t.sh[b[0]] || 0, cur = t.cur === b[0];
    return `<div class="tt-bc"><div class="tt-bp"><span class="rk ${b[1] === 'S' ? 's' : ''}">${b[1]}</span>${own ? '' : `<span class="ct">${sh}/${b[2]}</span>`}<div class="pic">${b[3]}</div><b>${b[0]}</b></div><div class="fx">${(b[4].length ? b[4] : [0, 0, 0, 0]).map(f => !f ? '<div><u>Coming soon...</u>Coming soon...</div>' : `<div><u>${f[0]}</u>Hiệu quả phụ thể ${f[0]} tăng ${f[1]}${f[2] ? ' điểm' : '%'}</div>`).join('')}</div>
    ${own ? `<button ${cur ? 'disabled' : ''} onclick="ttUse('${b[0]}')">${cur ? 'Đang dùng' : 'Dùng'}</button>` : `<button class="g" ${sh < b[2] ? 'disabled' : ''} onclick="ttGet('${b[0]}')">Nhận</button>`}</div>`; };
  document.getElementById('tt-modal').innerHTML = `<div class="md-box"><button class="md-x" onclick="ttClose()">✕</button><div class="hd-name" style="text-align:center;color:#fde047">Thần Thú</div><div class="tt-bgrid">${TT_BEASTS.map(bx).join('')}</div><div style="text-align:center;color:#4ade80;margin-top:6px;font-weight:700">Mảnh Thần Thú nhận từ Cấm Địa</div></div>`; document.getElementById('tt-modal').style.display = 'flex';
}
function ttUse(n) { const s = ttSt(); s.tt.cur = n; s.tt.sel = 0; s.tt.prev = null; gdSave(s); ttClose(); renderThanThu(); }
function ttGet(n) { const s = ttSt(), b = ttBeast(n); if ((s.tt.sh[n] || 0) < b[2]) return; s.tt.sh[n] -= b[2]; s.tt.own[n] = { lv: 1, star: 1, exp: 0 }; gdSave(s); ttChange(); scToast('Đã nhận ' + n); }
function renderThanThu() {
  const s = ttSt(), t = s.tt, o = ttCur(s), b = ttBeast(t.cur), st = ttStat(b, o), nx = o.star < 5 ? ttStat(b, Object.assign({}, o, { star: o.star + 1 })) : null;
  document.getElementById('tt-tabs').innerHTML = [['thu', 'Thần Thú'], ['lv', 'Cấp'], ['star', 'Sao'], ['phu', 'Phụ Thể']].map(([k, n]) => `<button class="${ttTab === k ? 'on' : ''}" onclick="ttTabSet('${k}')">${n}</button>`).join('');
  const stars = `<span class="gold">${'★'.repeat(o.star)}${'☆'.repeat(5 - o.star)}</span>`, open = ttSlotsOpen(b, o), arr = t.slots[t.cur] || [];
  const slotRow = (cnt, offs) => Array.from({ length: cnt }, (_, k) => { const i = k + offs, sl = arr[i], on = i < open;
    return `<div class="tt-sk ${t.sel === i && on ? 'use' : ''}" onclick="${on ? `ttSel(${i})` : ''}"><i style="${on && sl ? 'border-color:' + TT_QC[sl.q - 1] : ''}">${!on ? '🔒' : sl ? TT_PT_ICO[TT_PT.indexOf(sl.n)] : '＋'}</i>${!on ? (i < 5 ? (i + 1) + ' Sao mở' : 'Cấp S mở') : sl ? sl.n : 'Trống'}</div>`; }).join('');
  let body = '';
  if (ttTab === 'thu') body = `<div class="tt-card"><div class="tt-pic">${b[3]}<button onclick="ttChange()">Đổi</button></div><div class="tt-info"><div class="tt-nm">${b[0]} <small>${b[1]}</small></div><div>Điểm: <b class="gold">${fmtN(st.pts)}</b></div><div>Sao: ${stars} &nbsp; Cấp: ${o.lv}</div><div>HP: ${fmtN(st.hp)} &nbsp; Hồi: ${fmtN(st.heal)}</div><div>Phá Giáp: ${fmtN(st.pha)} &nbsp; Đỡ Đòn: ${st.dodge}%</div></div></div>
    <div class="gs-bar">Kỹ Năng <span>Không thể dùng trong Tỷ Võ</span></div><div class="tt-row">${['Thanh Diệp', 'Thanh Tâm', 'Tái Sinh', 'Hùng Đàm', '5 Sao mở'].map((n, i) => `<div class="tt-sk ${i === 2 ? 'use' : ''}"><em>${i === 2 ? 'Dùng' : 'Chọn'}</em><i>${['🍃', '🌊', '✨', '🐺', '🔒'][i]}</i>${n}</div>`).join('')}</div>
    <div class="gs-bar">Phụ Thể <span>Lĩnh Ngộ để đạt được</span><button class="tt-ngo" onclick="ttTabSet('phu')">Ngộ</button></div><div class="tt-row">${slotRow(5, 0)}</div>`;
  if (ttTab === 'lv') { const need = ttNeed(o.lv), have = Object.keys(TT_FEED).map(k => ttItem(s, k));
    body = `<div class="tt-lv"><div class="tt-pic big">${b[3]}</div><div class="tt-info box">Cấp: ${o.lv}<br>Sao: ${stars}<br>Phá Giáp: ${fmtN(st.pha)}<br>Đỡ Đòn: ${st.dodge}%<br>HP: ${fmtN(st.hp)}<br>Hồi: ${fmtN(st.heal)}</div></div><div class="tt-exp">${fmtN(o.exp)}/${fmtN(need)}<i style="width:${Math.min(100, o.exp / need * 100)}%"></i></div>
    <div class="gs-bar">Vật Liệu <span>Giới hạn cấp ${ttCap(o)} (tăng theo sao)</span></div><div class="tt-row">${['Thú Hồn', 'Thú Linh'].map((k, i) => `<div class="tt-sk"><i>${['🟠', '🔥'][i]}</i>${k}<br>×${fmtN(have[i])}<br><small>+${TT_FEED[k]} EXP</small></div>`).join('')}</div><div class="gs-act"><div>Tự động dùng toàn bộ Thú Hồn & Thú Linh</div><button onclick="ttFeed()">Cho Ăn</button></div>`; }
  if (ttTab === 'star') { const ql = 10 * o.star, da = 400 * o.star, hq = ttItem(s, 'Quỷ Linh'), hd = ttItem(s, 'Đá Nữ Oa');
    body = o.star >= 5 ? '<div class="ch-empty" style="padding:40px">Thần thú đã đạt 5 sao</div>' : `<div class="tt-lv"><div class="tt-pic big">${b[3]}</div><div class="tt-info box"><div>HP:</div><div class="cmp">${fmtN(st.hp)} → ${fmtN(nx.hp)}</div><div>Hồi:</div><div class="cmp">${fmtN(st.heal)} → ${fmtN(nx.heal)}</div><div>Phá Giáp:</div><div class="cmp">${st.pha} → ${nx.pha}</div><div>Đỡ Đòn:</div><div class="cmp">${st.dodge}% → ${nx.dodge}%</div><small class="gr">Thăng sao sẽ mở thêm 1 ô Phụ Thể</small></div></div>
    <div class="gs-bar">Tăng Sao</div><div class="tt-row cost"><div class="tt-sk"><small>Quỷ Linh</small><i>🎭</i>${hq}/${ql}</div><div class="tt-sk"><small>Đá Nữ Oa</small><i>🔻</i>${hd}/${da}</div></div><div class="gs-act"><div>Cần Quỷ Linh & Đá Nữ Oa (rơi từ Boss bang)</div><button onclick="ttStarUp()">Tăng</button></div>`; }
  if (ttTab === 'phu') { const sl = arr[t.sel] || null, left = Math.max(0, Math.ceil((t.freeAt - Date.now()) / 1000));
    body = `<div class="tt-row">${slotRow(10, 0)}</div><div class="gs-bar">Lĩnh Ngộ <button class="tt-ngo" onclick="ttList()">Danh Sách</button></div>
    <div class="tt-ngo2"><div class="c"><h4>Hiện Tại</h4><div class="cb" style="${sl ? 'border-color:' + TT_QC[sl.q - 1] : ''}"><i>${sl ? TT_PT_ICO[TT_PT.indexOf(sl.n)] : '＋'}</i><b>${sl ? sl.n : 'Trống'}</b><p>${ttSlotDesc(sl)}</p></div></div>
    <div class="c"><h4>Tẩy phụ thể</h4><div class="cb dark"><p>Tẩy để có Phụ Thể mới.</p><div>Miễn phí 🪙</div><button ${left ? 'disabled' : ''} onclick="ttReroll(1)">Tẩy</button><div style="margin-top:6px">500 🪙 <em>Siêu</em></div><button onclick="ttReroll(10)">Tẩy 10 lần</button></div></div></div>
    <div class="gs-act"><button class="red" onclick="ttRevert()">Lần trước tẩy</button><div id="tt-free">Miễn phí: ${[left / 3600 | 0, left / 60 % 60 | 0, left % 60].map(v => String(v).padStart(2, '0')).join(':')}</div></div>`; }
  document.getElementById('tt-body').innerHTML = body;
}
setInterval(() => { const e = document.getElementById('tt-free'); if (e && gdSt().tt) { const l = Math.max(0, Math.ceil((gdSt().tt.freeAt - Date.now()) / 1000)); e.textContent = 'Miễn phí: ' + [l / 3600 | 0, l / 60 % 60 | 0, l % 60].map(v => String(v).padStart(2, '0')).join(':'); } }, 1000);
/* Cấm Địa: 3 lượt/ngày, nhận Mảnh Thần Thú + Thú Hồn */
function openCamDia() {
  const s = ttSt(), t = s.tt, dk = new Date().toDateString(); if (t.cc.day !== dk) { t.cc = { day: dk, left: 3 }; gdSave(s); }
  const m = document.getElementById('tt-modal'); m.innerHTML = `<div class="md-box"><button class="md-x" onclick="ttClose()">✕</button><div class="hd-name" style="text-align:center">⛰️ Cấm Địa</div><div class="set-note">Thám hiểm để nhận Mảnh Thần Thú và Thú Hồn. Hôm nay còn: <b>${t.cc.left}</b> lượt</div><div class="gs-act"><div>Mỗi lượt: 5–10 mảnh + 30 Thú Hồn</div><button onclick="ttExplore()">Thám hiểm</button></div></div>`; m.style.display = 'flex';
}
function ttExplore() {
  const s = ttSt(), t = s.tt; if (t.cc.left < 1) return scToast('Hết lượt hôm nay');
  const pool = TT_BEASTS.filter(b => !t.own[b[0]] && b[1] === 'A+'); const b = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null, n = 5 + Math.floor(Math.random() * 6);
  if (b) t.sh[b[0]] = (t.sh[b[0]] || 0) + n; (s.kho['Thú Hồn'] = s.kho['Thú Hồn'] || { ico: '🟠', qty: 0 }).qty += 30; t.cc.left--; gdSave(s); openCamDia(); scToast(b ? `+${n} mảnh ${b[0]}, +30 Thú Hồn` : '+30 Thú Hồn');
}
(function () { const d = document.createElement('div'); d.id = 'tt-modal'; d.className = 'md-wrap'; d.onclick = e => { if (e.target === d) ttClose(); }; document.body.appendChild(d); })();

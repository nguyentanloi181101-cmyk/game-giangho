/* ĐẠI SẢNH (thông tin bang, thành viên, tin tức, quyên góp) + TỤ BẢO BỒN */
function gdBang() {
  const s = gdSt(); s.bang = Object.assign({ name: 'Văn Lang', notice: 'Chạm vào đây để sửa công cáo bang.', exp: 0, news: [], basin: 0 }, s.bang || {}); return s;
}
const gdExpMax = lv => 500000 * lv;
function gdNews(text) { try { const s = gdBang(); s.bang.news.unshift({ t: Date.now(), x: text }); s.bang.news.length = Math.min(s.bang.news.length, 30); gdSave(s); } catch (e) {} }
let dsTab = 'bang';
function openDaiSanh() { renderDaiSanh(); switchScreen('daisanh'); }
function dsTabSet(t) { dsTab = t; renderDaiSanh(); }
function dsNotice() { const s = gdBang(), v = prompt('Công cáo bang (tối đa 80 ký tự):', s.bang.notice); if (v === null) return; s.bang.notice = String(v).replace(/[<>&"'`]/g, '').slice(0, 80) || s.bang.notice; gdSave(s); renderDaiSanh(); }
function dsLeave() { scToast('Bạn là thành viên duy nhất của bang'); }
function renderDaiSanh() {
  const s = gdBang(), b = s.bang, max = gdExpMax(s.bangLv);
  document.getElementById('ds-tabs').innerHTML = [['bang', 'Bang Hội'], ['tv', 'Thành Viên'], ['tin', 'Tin Tức']].map(([k, n]) => `<button class="${dsTab === k ? 'on' : ''}" onclick="dsTabSet('${k}')">${n}</button>`).join('');
  let body = '';
  if (dsTab === 'bang') body = `<div class="ds-head"><div class="ds-logo">🔥</div><div class="ds-nm"><b><i class="lvb">${s.bangLv}</i> ${chEsc(b.name)}</b><div>Nhân Số 1/45 <small>(Cần cấp 60)</small></div></div><button class="ds-leave" onclick="dsLeave()">Rời Bang</button></div>
    <div class="ds-body"><div class="ds-paper"><div onclick="dsNotice()" style="cursor:pointer"><span class="k">Công Cáo :</span> ${chEsc(b.notice)}</div><div><span class="k">Chức Vụ :</span> Bang Chủ</div><div><span class="k">Uy Tín :</span> ${fmtN(s.uytin)}/${fmtN(s.uyMax)}</div><div><span class="k">EXP Bang :</span> ${fmtN(b.exp)}/${fmtN(max)}</div>
      <div><span class="k">Kỹ Năng :</span></div><div class="ds-sk">${GD_SKILLS.slice(0, 6).map((k, i) => { const lock = GD_SKILL_UNLOCK[i] > s.bangLv; return `<i class="${lock ? 'lock' : ''}">${lock ? GD_SKILL_UNLOCK[i] + ' Cấp Mở' : k[1]}</i>`; }).join('')}</div></div>
      <div class="ds-side"><button onclick="scToast('Tiệm Bang — sắp ra mắt')">Tiệm Bang</button><button onclick="openDienVo()">Kỹ Năng</button><button onclick="openBasin()">Tụ Bảo Bồn</button><button onclick="scToast('Xếp Hạng bang — sắp ra mắt')">Xếp Hạng</button></div></div>
    <div class="ds-foot"><button onclick="dsDonate()">🏅 Quyên Góp</button><button onclick="openDienVo()">💪 Cường Thân</button></div>`;
  if (dsTab === 'tv') body = `<div class="dv-uy">Nhân số 1/45</div><div class="bm-row"><div class="bm-ico">🧙</div><div class="bm-info"><b>${chEsc(pvName())}</b><small>Bang Chủ • Cấp ${document.getElementById('acc-level').textContent}</small></div><div class="bm-qty">${document.querySelector('.power-total').textContent}</div></div><div class="ch-empty">Chưa có thành viên khác. Tính năng mời người chơi sẽ cập nhật sau.</div>`;
  if (dsTab === 'tin') body = `<div class="ds-news">${b.news.length ? b.news.map(n => { const d = new Date(n.t); return `<div><small>${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}</small> ${chEsc(n.x)}</div>`; }).join('') : '<div class="ch-empty">Chưa có tin tức.</div>'}</div>`;
  document.getElementById('ds-body').innerHTML = body;
}
const DS_DONATE = [['🥈 100.000 bạc', () => silver >= 100000, () => { silver -= 100000; }, 40, 10000], ['🌾 100.000 gạo', () => rice >= 100000, () => { rice -= 100000; }, 40, 10000], ['🪙 100 vàng', () => gold >= 100, () => { gold -= 100; }, 150, 50000]];
function dsDonate() {
  const m = document.getElementById('qs-modal');
  m.innerHTML = `<div class="md-box"><button class="md-x" onclick="document.getElementById('qs-modal').style.display='none'">✕</button><div class="hd-name" style="text-align:center;color:#fde047">Quyên Góp</div>${DS_DONATE.map((d, i) => `<div class="bm-row"><div class="bm-info"><b>${d[0]}</b><small>+${d[3]} Uy Tín • +${fmtN(d[4])} EXP Bang</small></div><button class="btn-attack" onclick="dsGive(${i})">Góp</button></div>`).join('')}</div>`; m.style.display = 'flex';
}
function dsGive(i) {
  const d = DS_DONATE[i]; if (!d[1]()) return scToast('Không đủ tài nguyên');
  d[2](); resSave(); const s = gdBang(); s.uytin = Math.min(s.uyMax, s.uytin + d[3]); s.bang.exp += d[4];
  while (s.bangLv < 10 && s.bang.exp >= gdExpMax(s.bangLv)) { s.bang.exp -= gdExpMax(s.bangLv); s.bangLv++; s.bang.news.unshift({ t: Date.now(), x: 'Bang lên cấp ' + s.bangLv + '!' }); }
  s.bang.news.unshift({ t: Date.now(), x: `${pvName()} quyên góp ${d[0]}` }); gdSave(s); scToast(`+${d[3]} Uy Tín`); dsDonate(); renderDaiSanh();
}
/* ---- Tụ Bảo Bồn ---- */
const BASIN_REW = [['Thú Hồn', '🟠', 20], ['Thú Linh', '🔥', 5], ['Dị Linh', '🎭', 1], ['Đá Nữ Oa', '🔻', 20]];
function openBasin() { renderBasin(); document.getElementById('qs-modal').style.display = 'flex'; }
function renderBasin() {
  const s = gdBang(), v = s.bang.basin, m = document.getElementById('qs-modal');
  m.innerHTML = `<div class="md-box"><button class="md-x" onclick="document.getElementById('qs-modal').style.display='none'">✕</button><div class="hd-name" style="text-align:center;color:#fde047">💰 Tụ Bảo Bồn</div><img class="bz-pic" src="assets/images/items/tu-bao-bon.webp" alt="Tụ Bảo Bồn"><div class="set-note">Góp bảo vật vào bồn: mỗi lần góp nhận ngay 1 phần thưởng ngẫu nhiên, đầy bồn nhận thêm quà lớn.</div>
  <div class="qs-bar" style="position:relative;left:0;right:0;top:0;margin:10px 0"><i style="width:${v / 10}%"></i></div><div class="dv-uy">${v}/1000</div>
  <div class="gs-act"><div>🥈 100.000 bạc → +50 bồn</div><button onclick="basinPut(0)">Góp</button></div><div class="gs-act"><div>🪙 50 vàng → +300 bồn</div><button onclick="basinPut(1)">Góp</button></div></div>`;
}
function basinPut(k) {
  const cost = k ? 50 : 100000, add = k ? 300 : 50; if ((k ? gold : silver) < cost) return scToast('Không đủ tài nguyên');
  if (k) gold -= cost; else silver -= cost; resSave();
  const s = gdBang(), r = BASIN_REW[Math.floor(Math.random() * BASIN_REW.length)]; (s.kho[r[0]] = s.kho[r[0]] || { ico: r[1], qty: 0 }).qty += r[2]; let msg = `Nhận ${r[2]} ${r[0]}`;
  s.bang.basin += add; if (s.bang.basin >= 1000) { s.bang.basin -= 1000; s.kho['Thú Linh'] = s.kho['Thú Linh'] || { ico: '🔥', qty: 0 }; s.kho['Thú Linh'].qty += 50; gold += 100; resSave(); msg += ' • BỒN ĐẦY: +50 Thú Linh, +100 vàng'; s.bang.news.unshift({ t: Date.now(), x: pvName() + ' làm đầy Tụ Bảo Bồn' }); }
  gdSave(s); renderBasin(); scToast(msg);
}
(function () { const sc = document.createElement('div'); sc.className = 'screen'; sc.id = 'screen-daisanh'; sc.innerHTML = `<div class="pve-header"><button class="btn-back" onclick="openGuild()">Trở về</button><h2 class="pve-title">Đại Sảnh</h2></div><div class="gs-tabs" id="ds-tabs"></div><div id="ds-body"></div>`; document.querySelector('.main-content').appendChild(sc); })();

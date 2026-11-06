/* ĐẠI SẢNH (thông tin bang, thành viên, tin tức, quyên góp) + TỤ BẢO BỒN */
function gdBang() {
  const s = gdSt(); s.bang = Object.assign({ name: 'Văn Lang', notice: 'Chạm vào đây để sửa công cáo bang.', exp: 0, news: [], basin: 0 }, s.bang || {}); return s;
}
const gdExpMax = lv => G2.expBase * Math.pow(G2.expMult, Math.max(0, lv - 1));   // cấp 1 = 5.000 EXP, mỗi cấp sau nhân 2, không giới hạn cấp
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
    <div class="ds-body"><div class="ds-paper"><div onclick="dsNotice()" style="cursor:pointer"><span class="k">Công Cáo :</span> ${chEsc(b.notice)}</div><div><span class="k">Chức Vụ :</span> Bang Chủ</div><div><span class="k">Uy Tín :</span> ${fmtN(s.uytin)}</div><div><span class="k">EXP Bang :</span> ${fmtN(b.exp)}/${fmtN(max)}</div>
      <div><span class="k">Kỹ Năng :</span></div><div class="ds-sk">${GD_SKILLS.slice(0, 6).map((k, i) => { const lock = GD_SKILL_UNLOCK[i] > s.bangLv; return `<i class="${lock ? 'lock' : ''}">${lock ? GD_SKILL_UNLOCK[i] + ' Cấp Mở' : k[1]}</i>`; }).join('')}</div></div>
      <div class="ds-side"><button onclick="scToast('Tiệm Bang — sắp ra mắt')">Tiệm Bang</button><button onclick="openDienVo()">Kỹ Năng</button><button onclick="openBasin()">Tụ Bảo Bồn</button><button onclick="scToast('Xếp Hạng bang — sắp ra mắt')">Xếp Hạng</button></div></div>
    <div class="ds-foot"><button onclick="dsDonate()">🏅 Quyên Góp</button><button onclick="openDienVo()">💪 Cường Thân</button></div>`;
  if (dsTab === 'tv') body = `<div class="dv-uy">Nhân số 1/45</div><div class="bm-row"><div class="bm-ico">🧙</div><div class="bm-info"><b>${chEsc(pvName())}</b><small>Bang Chủ • Cấp ${document.getElementById('acc-level').textContent}</small></div><div class="bm-qty">${document.querySelector('.power-total').textContent}</div></div><div class="ch-empty">Chưa có thành viên khác. Tính năng mời người chơi sẽ cập nhật sau.</div>`;
  if (dsTab === 'tin') body = `<div class="ds-news">${b.news.length ? b.news.map(n => { const d = new Date(n.t); return `<div><small>${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}</small> ${chEsc(n.x)}</div>`; }).join('') : '<div class="ch-empty">Chưa có tin tức.</div>'}</div>`;
  document.getElementById('ds-body').innerHTML = body;
}
// [nhãn, tài nguyên đang có, số lượng / 1 lần góp, trừ tài nguyên(n), Uy Tín / lần, EXP Bang / lần]
const DS_DONATE = [['🥈 bạc', () => silver, 100000, n => { silver -= n; }, 40, 10000], ['🌾 gạo', () => rice, 100000, n => { rice -= n; }, 40, 10000], ['<img class="gi-g" src="assets/images/items/thoi-vang.svg" alt="vàng"> vàng', () => gold, 100, n => { gold -= n; }, 150, 50000]];
const DS_DEF = DS_DONATE.map(d => [d[2], d[4], d[5]]);
cfgOnApply(() => DS_DONATE.forEach((d, i) => { const g = k => cfgNum('guild2.donate.' + i + '.' + k, null); const n = Math.floor(cfgNum('guild2.donate.' + i + '.n', DS_DEF[i][0])), uy = cfgNum('guild2.donate.' + i + '.uy', DS_DEF[i][1]), ex = cfgNum('guild2.donate.' + i + '.exp', DS_DEF[i][2]); d[2] = Math.max(1, n); d[4] = Math.max(0, uy); d[5] = Math.max(0, ex); }));   // admin chỉnh: guild2.donate.<0 bạc|1 gạo|2 vàng>.{n,uy,exp}
let dsQty = [1, 1, 1];   // số lần góp người chơi đã nhập cho từng dòng (1 lần = DS_DONATE[i][2] tài nguyên)
const dsMax = i => Math.floor(DS_DONATE[i][1]() / DS_DONATE[i][2]);
function dsQtyGet(i) { const el = document.getElementById('ds-q' + i); let q = Math.floor(Number(el ? el.value : dsQty[i])); if (!Number.isFinite(q) || q < 1) q = 1; return q; }
function dsQtyRefresh(i) {   // cập nhật số tiền & phần thưởng khi gõ số lượng
  const d = DS_DONATE[i], q = dsQtyGet(i); dsQty[i] = q;
  const t = document.getElementById('ds-t' + i); if (t) t.innerHTML = `${fmtN(d[2] * q)} ${d[0]}`;
  const r = document.getElementById('ds-r' + i); if (r) r.textContent = `+${fmtN(d[4] * q)} Uy Tín • +${fmtN(d[5] * q)} EXP Bang`;
}
function dsQtyMax(i) { const el = document.getElementById('ds-q' + i); el.value = Math.max(1, dsMax(i)); dsQtyRefresh(i); }
function dsDonate() {
  const m = document.getElementById('qs-modal');
  m.innerHTML = `<div class="md-box"><button class="md-x" onclick="document.getElementById('qs-modal').style.display='none'">✕</button><div class="hd-name" style="text-align:center;color:#fde047">Quyên Góp</div>${DS_DONATE.map((d, i) => `<div class="bm-row" style="flex-wrap:wrap"><div class="bm-info"><b id="ds-t${i}">${fmtN(d[2] * dsQty[i])} ${d[0]}</b><small id="ds-r${i}">+${fmtN(d[4] * dsQty[i])} Uy Tín • +${fmtN(d[5] * dsQty[i])} EXP Bang</small><small>Có: ${fmtN(d[1]())} • góp tối đa ${fmtN(dsMax(i))} lần (mỗi lần ${fmtN(d[2])})</small></div><div class="ds-qbox"><input type="number" class="ds-q" id="ds-q${i}" min="1" step="1" inputmode="numeric" value="${dsQty[i]}" oninput="dsQtyRefresh(${i})" aria-label="Số lần góp"><button class="ds-qmax" onclick="dsQtyMax(${i})">Tối đa</button><button class="btn-attack" onclick="dsGive(${i})">Góp</button></div></div>`).join('')}</div>`; m.style.display = 'flex';
}
function dsGive(i) {
  const d = DS_DONATE[i], q = dsQtyGet(i), cost = d[2] * q; if (d[1]() < cost) return scToast('Không đủ tài nguyên');
  d[3](cost); resSave(); const s = gdBang(), uy = d[4] * q, ex = d[5] * q; s.uytin = s.uytin + uy; s.bang.exp += ex;
  while (s.bang.exp >= gdExpMax(s.bangLv)) { s.bang.exp -= gdExpMax(s.bangLv); s.bangLv++; s.bang.news.unshift({ t: Date.now(), x: 'Bang lên cấp ' + s.bangLv + '!' }); }
  s.bang.news.unshift({ t: Date.now(), x: `${pvName()} quyên góp ${fmtN(cost)} ${d[0].replace(/<[^>]+>/g, "").replace(/^\S+\s/, "")}` }); gdSave(s); scToast(`+${uy} Uy Tín`); dsDonate(); renderDaiSanh();
}
/* ---- Tụ Bảo Bồn ---- */
const BASIN_REW_DEF = [['Thú Hồn', '🟠', 20], ['Thú Linh', '🔥', 5], ['Dị Linh', '🎭', 1], ['Đá Nữ Oa', '🔻', 20]];
const BASIN_DEF = { full: 1000, silverCost: 100000, silverAdd: 50, goldCost: 50, goldAdd: 300 };
const BASIN = Object.assign({}, BASIN_DEF), BASIN_FULL_DEF = [{ t: 'item', name: 'Thú Linh', ico: '🔥', n: 50 }, { t: 'gold', n: 100 }];
let BASIN_REW = BASIN_REW_DEF, BASIN_FULL = BASIN_FULL_DEF;
cfgOnApply(() => {   // admin chỉnh: guild2.basin.{full,silverCost,silverAdd,goldCost,goldAdd,rewards:[{name,ico,n}],fullGifts:[quà]}
  Object.keys(BASIN_DEF).forEach(k => { BASIN[k] = Math.max(1, Math.floor(cfgNum('guild2.basin.' + k, BASIN_DEF[k]))); });
  const r = cfgGet('guild2.basin.rewards', null); BASIN_REW = Array.isArray(r) && r.filter(x => x && x.name && Number(x.n) > 0).length ? r.filter(x => x && x.name && Number(x.n) > 0).map(x => [String(x.name), x.ico || '🎁', Math.floor(Number(x.n))]) : BASIN_REW_DEF;
  const f = cfgGet('guild2.basin.fullGifts', null); BASIN_FULL = Array.isArray(f) && rwList(f).length ? rwList(f) : BASIN_FULL_DEF;
});
function openBasin() { renderBasin(); document.getElementById('qs-modal').style.display = 'flex'; }
function renderBasin() {
  const s = gdBang(), v = s.bang.basin, m = document.getElementById('qs-modal');
  m.innerHTML = `<div class="md-box"><button class="md-x" onclick="document.getElementById('qs-modal').style.display='none'">✕</button><div class="hd-name" style="text-align:center;color:#fde047">💰 Tụ Bảo Bồn</div><div class="gd-img bz-pic" style="--a:1.475;width:72%;margin:6px auto"><img src="assets/images/guild/tu-bao-bon.webp?v=28" alt="Tụ Bảo Bồn"></div><div class="set-note">Góp bảo vật vào bồn: mỗi lần góp nhận ngay 1 phần thưởng ngẫu nhiên, đầy bồn nhận thêm quà lớn.</div>
  <div class="qs-bar" style="position:relative;left:0;right:0;top:0;margin:10px 0"><i style="width:${Math.min(100, v / BASIN.full * 100)}%"></i></div><div class="dv-uy">${v}/${fmtN(BASIN.full)}</div>
  <div class="gs-act"><div>🥈 ${fmtN(BASIN.silverCost)} bạc → +${fmtN(BASIN.silverAdd)} bồn</div><button onclick="basinPut(0)">Góp</button></div><div class="gs-act"><div><img class="gi-g" src="assets/images/items/thoi-vang.svg" alt="vàng"> ${fmtN(BASIN.goldCost)} vàng → +${fmtN(BASIN.goldAdd)} bồn</div><button onclick="basinPut(1)">Góp</button></div></div>`;
}
function basinPut(k) {
  const cost = k ? BASIN.goldCost : BASIN.silverCost, add = k ? BASIN.goldAdd : BASIN.silverAdd; if ((k ? gold : silver) < cost) return scToast('Không đủ tài nguyên');
  if (k) gold -= cost; else silver -= cost; resSave();
  const s = gdBang(), r = BASIN_REW[Math.floor(Math.random() * BASIN_REW.length)]; (s.kho[r[0]] = s.kho[r[0]] || { ico: r[1], qty: 0 }).qty += r[2]; let msg = `Nhận ${r[2]} ${r[0]}`;
  s.bang.basin += add; let full = false; if (s.bang.basin >= BASIN.full) { s.bang.basin -= BASIN.full; full = true; s.bang.news.unshift({ t: Date.now(), x: pvName() + ' làm đầy Tụ Bảo Bồn' }); }
  gdSave(s); if (full) msg += ' • BỒN ĐẦY: ' + rwGrantAll(BASIN_FULL); renderBasin(); scToast(msg);
}
(function () { const sc = document.createElement('div'); sc.className = 'screen'; sc.id = 'screen-daisanh'; sc.innerHTML = `<div class="pve-header"><button class="btn-back" onclick="openGuild()">Trở về</button><h2 class="pve-title">Đại Sảnh</h2></div><div class="gs-tabs" id="ds-tabs"></div><div id="ds-body"></div>`; document.querySelector('.main-content').appendChild(sc); })();

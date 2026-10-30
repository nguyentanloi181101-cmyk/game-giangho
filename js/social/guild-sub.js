/* BANG HỘI: Thần Thú, Diễn Võ Trường, Bang Chiến (Boss bang)
   Boss thứ 1 = 2.000.000 HP, mỗi boss sau nhân đôi; Chí Tôn = HP & sát thương x2. Kỹ năng boss: chờ mô tả. */
const GD_SKILLS = [['Cường Tráng', '🧍', 'Mỗi cấp tăng 1000 điểm HP tối đa'], ['Hộ Thuẫn', '🛡️', 'Mỗi cấp tăng 50 điểm thủ'], ['Lợi Kiếm', '🗡️', 'Mỗi cấp tăng 50 điểm công'],
  ['Cường Thân', '💪', 'Mỗi cấp tăng 800 điểm HP tối đa'], ['Kiên Cố', '🔰', 'Mỗi cấp tăng 40 điểm thủ'], ['Phá Giáp', '🪓', 'Mỗi cấp tăng phá giáp'], ['Hồi Phục', '💚', 'Mỗi cấp tăng hồi máu'],
  ['Thần Tốc', '⚡', 'Mỗi cấp tăng tốc độ'], ['Bạo Kích', '💥', 'Mỗi cấp tăng bạo kích'], ['Chí Tôn', '👑', 'Mỗi cấp tăng sát thương lên boss']];
const GD_SKILL_UNLOCK = [1, 1, 1, 1, 1, 7, 8, 9, 10, 10], GD_SKILL_MAX = [60, 60, 60, 60, 60, 60, 60, 60, 60, 40];
function gdSt() {
  const s = loadJSON('guild_state');
  s.beast = Object.assign({ lv: 1, star: 1, name: 'Kỳ Lân' }, s.beast || {});
  s.uytin = s.uytin === undefined ? 3000 : s.uytin; s.uyMax = 9500; s.bangLv = s.bangLv || 5;
  s.kho = s.kho || {}; s.tt = s.tt || null; s.pts = s.pts || 0; s.lots = s.lots || []; s.ct = s.ct || {}; s.bossCt = s.bossCt || {}; s.dv = s.dv || GD_SKILLS.map(() => 0); s.boss = s.boss || {}; s.left = s.left === undefined ? 2 : s.left;
  return s;
}
const gdSave = s => saveJSON('guild_state', s);
(function mk() {
  const mc = document.querySelector('.main-content'), add = (id, html) => { const d = document.createElement('div'); d.className = 'screen'; d.id = 'screen-' + id; d.innerHTML = html; mc.appendChild(d); };
  const hd = (t, back) => `<div class="pve-header"><button class="btn-back" onclick="${back || "openGuild()"}">Trở về</button><h2 class="pve-title">${t}</h2></div>`;
  add('thanthu', hd('Thần Thú') + '<div class="gs-tabs" id="tt-tabs"></div><div id="tt-body"></div>');
  add('dienvo', hd('Diễn Võ Trường') + '<div id="dv-body"></div>');
  add('bangboss', hd('Bang Chiến') + '<div class="gs-tabs" id="bb-tabs"></div><div id="bb-body"></div>');
})();
/* ---- Diễn Võ Trường ---- */
let dvSel = 0;
function openDienVo() { renderDienVo(); switchScreen('dienvo'); }
function dvPick(i) { dvSel = i; renderDienVo(); }
const dvCost = lv => ({ uy: 300, silver: 50000 * (lv + 1) });
function dvLearn() {
  const s = gdSt(), i = dvSel, lv = s.dv[i];
  if (GD_SKILL_UNLOCK[i] > s.bangLv) return scToast('Chưa mở');
  if (lv >= GD_SKILL_MAX[i]) return scToast('Đã tối đa');
  const c = dvCost(lv);
  if (s.uytin < c.uy) return scToast('Không đủ Uy Tín'); if (silver < c.silver) return scToast('Không đủ bạc');
  s.uytin -= c.uy; silver -= c.silver; s.dv[i]++; resSave(); gdSave(s); renderDienVo();
}
function renderDienVo() {
  const s = gdSt(), i = dvSel, lv = s.dv[i], c = dvCost(lv);
  document.getElementById('dv-body').innerHTML = `<div class="dv-uy">🏅 Uy Tín: ${fmtN(s.uytin)}/${fmtN(s.uyMax)}</div>
  <div class="dv-grid">${GD_SKILLS.map((k, j) => { const lock = GD_SKILL_UNLOCK[j] > s.bangLv; return `<div class="dv-sk ${j === i ? 'sel' : ''} ${lock ? 'lock' : ''}" onclick="dvPick(${j})"><i>${lock ? 'Cấp ' + GD_SKILL_UNLOCK[j] + ' mở' : k[1]}</i><span>${s.dv[j]}/${GD_SKILL_MAX[j]}</span></div>`; }).join('')}</div>
  <div class="dv-desc"><b>${GD_SKILLS[i][0]}</b><p>${GD_SKILLS[i][2]}</p><p>Kỹ năng cấp ${lv} → cấp ${lv + 1}</p></div>
  <div class="gs-act"><div>Cần 🏅 ${c.uy} &nbsp; 🥈 ${fmtN(c.silver)}</div><button onclick="dvLearn()">Học</button></div>`;
}
/* ---- Bang Chiến / Boss ---- */
const GD_BOSS = [   // [tên, bang cấp, icon, cách đánh, đặc điểm, [4 kỹ năng], tên Chí Tôn]
  ['Kỳ Lân', 2, '🦄', 'Đơn công', 'Có kỹ năng choáng và miễn dịch', ['Dẫn Lôi', 'Thiết Mã', 'Mã Đề Tiễn', 'Tất Sát'], 'Thiên Lân'],
  ['Xích Vũ', 3, '🦅', 'Đơn công', 'Có kỹ năng né tránh và miễn dịch', ['Hạc Minh', 'Nhàn Vân', 'Hạc Sí', 'Tất Sát'], 'Xích Tinh'],
  ['Tiên Lộc', 4, '🦌', 'Đơn công', 'Có kỹ năng trị liệu và miễn dịch', ['Tùng Lâm', 'Câu Hồn', 'Trường Xuân', 'Tất Sát'], 'Chí Tôn Tiên Lộc'],
  ['Long Quy', 5, '🐢', 'Đơn công', 'Có kỹ năng thôn phệ và miễn dịch', ['Quy Giáp', 'Phong Vân', 'Thôn Phệ', 'Tất Sát'], 'Kim Quy'],
  ['Báo Tuyết', 7, '🐆', 'Chủ yếu là tấn công đơn', 'Quái vật này có đặc điểm nổi bật là rất xấu và rất mạnh', ['Thiết Mã', 'Hạc Minh', 'Tất Sát', 'Mã Đề Tiễn'], 'Chí Tôn Báo Tuyết'],
  ['Hắc Điêu', 8, '🦅', 'Đơn công', 'Thực lực vượt trội so với BOSS thường', ['Thiết Mã', 'Hạc Minh', 'Tất Sát', 'Mã Đề Tiễn'], 'Chí Tôn Hắc Điêu'],
  ['Cuồng Ngưu', 9, '🐂', 'Đơn công', 'Thực lực vượt trội so với BOSS thường', ['Thiết Mã', 'Hạc Minh', 'Tất Sát', 'Mã Đề Tiễn'], 'Chí Tôn Cuồng Ngưu']];
const gdBossHp = (k, ct) => 2000000 * Math.pow(2, k) * (ct ? 2 : 1);
const gdBossAtk = (k, ct) => Math.round(gdBossHp(k, 0) / 4000) * (ct ? 2 : 1);   // sát thương 1 đòn lên 1 tướng
const gdDrops = k => { const b = GD_BOSS[k][0]; return k < 4
  ? [['Thú Hồn', '🟠'], ['Thú Linh', '🔥'], ['Hỏa Tinh', '🔶'], ['Đá Nữ Oa', '🔻'], ['Quỷ Linh', '🎭'], ['Châu ' + b, '🔮'], ['Đào Tiên', '🍑'], ['Thạch ' + b, '🪨']]
  : [['Đào Tiên Vương', '🍑'], ['Đá Nữ Oa', '🔻'], ['Châu ' + b, '🔮'], ['Quỷ Linh', '💀'], ['Lá Linh', '🍃'], ['Hộp Linh', '📦'], ['Hộp Tinh', '🎁'], ['Ngọc Tím', '🟣']]; };
let bbTab = 'thuong', bbCur = null;
function gdTick() {   // đổi ngày: +lượt; thứ 2 & thứ 5 3h: boss hồi đầy; 12h: kết thúc đấu giá
  const s = gdSt(), now = new Date(), dk = now.toDateString(); let ch = false;
  if (s.day !== dk) { s.day = dk; s.left = 2; ch = true; }
  const r = new Date(now.getTime() - 3 * 3600e3); while (r.getDay() !== 1 && r.getDay() !== 4) r.setDate(r.getDate() - 1);
  const rid = r.toDateString(); if (s.rid !== rid) { s.rid = rid; s.boss = {}; s.bossCt = {}; ch = true; }
  const keep = [];
  s.lots.forEach(l => { if (l.exp > Date.now()) return keep.push(l);
    if (l.bid > 0 && l.mine) { const k = s.kho[l.name] || (s.kho[l.name] = { ico: l.ico, qty: 0 }); k.qty += l.qty; }   // thắng đấu giá -> Kho
    ch = true; });
  if (keep.length !== s.lots.length) s.lots = keep;
  if (ch) gdSave(s); return s;
}
function bbTabSet(t) { bbTab = t; renderBangBoss(); }
function openBangBoss() { renderBangBoss(); switchScreen('bangboss'); }
function bbCtUnlock(k) { const s = gdSt(); if (gold < 5000) return scToast('Cần 5000 Vàng'); if (!confirm('Mở khóa Boss Chí Tôn bằng 5000 Vàng?')) return; gold -= 5000; resSave(); s.ct[k] = 1; gdSave(s); renderBangBoss(); }
function bbInfo(k, ct) {
  bbCur = [k, ct]; const b = GD_BOSS[k], m = document.getElementById('boss-modal');
  m.innerHTML = `<div class="md-box"><button class="md-x" onclick="document.getElementById('boss-modal').style.display='none'">✕</button><div class="hd-name" style="text-align:center;color:#fde047">BOSS${ct ? ' CHÍ TÔN' : ''}</div>
  <div class="bm-top"><div class="bm-pic">${b[2]}</div><div class="bm-desc">Cách đánh: ${b[3]}<br><br>Đặc điểm: ${b[4]}${ct ? '<br>HP & sát thương x2' : ''}<br><br>HP ${fmtN(gdBossHp(k, ct))}</div></div>
  <div class="bm-sk">${b[5].map((n, i) => `<span>Kỹ Năng ${i + 1}:${n}</span>`).join('')}<span>Kỹ Năng 5:</span></div>
  <div class="gs-bar">Vật Phẩm <span>(Chuyển vào Kho)</span></div><div class="bm-drops">${gdDrops(k).map(d => `<div title="${d[0]}">${d[1]}</div>`).join('')}${'<div class="e">+</div>'.repeat(4)}</div>
  <div class="gs-act"><div>Hôm nay còn: ${gdSt().left}</div><button onclick="bbFight()">Khiêu chiến</button></div></div>`;
  m.style.display = 'flex';
}
function bbFight() {   // trận tự động mô phỏng bằng chỉ số đội hình (kỹ năng boss sẽ cập nhật khi có mô tả)
  const [k, ct] = bbCur, s = gdTick(), key = ct ? 'bossCt' : 'boss', mx = gdBossHp(k, ct), cur = s[key][k] === undefined ? mx : s[key][k];
  if (s.left < 1) return scToast('Hết lượt hôm nay'); if (cur <= 0) return scToast('Boss đã bị hạ');
  const heroes = team.map(id => { const t = heroStats(id); return { hp: t.hp, atk: t.atk, def: t.def }; });
  if (!heroes.length) return scToast('Chưa có tướng trong đội');
  let boss = cur, dmgDone = 0, rounds = 0; const bAtk = gdBossAtk(k, ct);
  while (boss > 0 && rounds < 30 && heroes.some(h => h.hp > 0)) {
    rounds++;
    heroes.forEach(h => { if (h.hp > 0) { const d = Math.round(h.atk * 3 * (.9 + Math.random() * .2)); boss -= d; dmgDone += d; } });
    if (boss <= 0) break;
    const alive = heroes.filter(h => h.hp > 0), tgt = alive[Math.floor(Math.random() * alive.length)];
    tgt.hp -= Math.max(1, bAtk - Math.round(tgt.def * .5));
  }
  const killed = boss <= 0; boss = Math.max(0, boss); dmgDone = Math.min(dmgDone, cur);
  s[key][k] = boss; s.left--; const pts = Math.floor(dmgDone / 20000) + (killed ? 100 : 0); s.pts += pts;
  let msg = `Gây ${fmtN(dmgDone)} sát thương • +${pts} Điểm BOSS`;
  if (killed) {   // rơi vật phẩm vào mục Đổi, hết hạn 12h trưa kế tiếp
    const e = new Date(); e.setHours(12, 0, 0, 0); if (e <= Date.now()) e.setDate(e.getDate() + 1);
    gdDrops(k).slice(0, 4 + Math.floor(Math.random() * 3)).forEach(d => { const q = [5, 10][Math.floor(Math.random() * 2)]; s.lots.push({ name: d[0], ico: d[1], qty: q, buy: q * 99999 * (ct ? 2 : 1) + (q === 5 ? 0 : 0), bid0: Math.max(10, q * Math.ceil(Math.random() * 6) * (ct ? 2 : 1)), bid: 0, mine: 0, exp: e.getTime() }); });
    msg += ' • BOSS BỊ HẠ! Vật phẩm đã rơi vào mục Đổi';
  }
  gdSave(s); document.getElementById('boss-modal').style.display = 'none'; renderBangBoss(); alert(msg);
}
function renderBangBoss() {
  const s = gdTick(), tabs = document.getElementById('bb-tabs');
  tabs.innerHTML = [['thuong', 'Thường'], ['chiton', 'Chí Tôn'], ['doi', 'Đổi']].map(([k, n]) => `<button class="${bbTab === k ? 'on' : ''}" onclick="bbTabSet('${k}')">${n}</button>`).join('');
  const body = document.getElementById('bb-body');
  if (bbTab === 'doi') return renderBossShop(s, body);
  const ct = bbTab === 'chiton';
  body.innerHTML = `<div class="bb-top"><span>Hôm nay còn:${s.left}</span><span>Làm mới vào 3h-4h thứ 2, thứ 5</span></div>` + GD_BOSS.map((b, k) => {
    const open = ct ? !!s.ct[k] : b[1] <= s.bangLv, mx = gdBossHp(k, ct), h = (ct ? s.bossCt : s.boss)[k], cur = h === undefined ? mx : h, pct = Math.ceil(cur / mx * 100);
    const act = open ? `bbInfo(${k},${ct ? 1 : 0})` : ct ? `bbCtUnlock(${k})` : '';
    return `<div class="bb-card ${open ? '' : 'lock'}"><div class="bb-h"><b>${ct ? b[6] : b[0]}</b><span class="${open ? 'ok' : 'no'}">Bang cấp ${ct ? 10 : b[1]}</span><button onclick="scToast('Bảng xếp hạng sắp ra mắt')">Hạng</button></div>
    <div class="bb-pic" onclick="${act}"><div class="bb-ico">${open ? b[2] : '⛓️'}</div>${open ? `<div class="bb-hp"><div style="width:${pct}%"></div></div><div class="bb-t">${cur <= 0 ? 'Đã hạ' : 'HP BOSS: ' + pct + '%'}</div>` : `${ct ? '<div class="bb-mid">Mở cần 5000 Vàng</div>' : ''}<div class="bb-t">Chưa mở</div>`}</div></div>`;
  }).join('');
}
function renderBossShop(s, body) {
  const t = n => { const x = Math.max(0, Math.floor(n / 1000)); return [x / 3600 | 0, x / 60 % 60 | 0, x % 60].map(v => String(v).padStart(2, '0')).join(':'); };
  body.innerHTML = `<div class="dv-uy">Điểm BOSS: ${fmtN(s.pts)}</div><div class="bs-list">${s.lots.length ? s.lots.map((l, i) => `<div class="bs-row"><div class="bs-ico">${l.ico}<em>${l.qty}</em></div><div class="bs-mid"><b>${l.name}</b>
    <div>Giá cao nhất: ${l.bid ? l.bid + (l.mine ? ' (bạn)' : '') : 'Chưa có'}<br>Mua ${fmtN(l.buy)} 🪙 &nbsp; Giá đấu: ${l.bid ? l.bid + 1 : l.bid0}</div></div>
    <div class="bs-t" data-exp="${l.exp}">Còn:${t(l.exp - Date.now())}</div><div class="bs-b"><button class="g" onclick="bsBuy(${i})">Mua</button><button onclick="bsBid(${i})">Đấu Giá</button></div></div>`).join('') : '<div class="ch-empty" style="padding:30px">Chưa có vật phẩm. Hạ Boss để vật phẩm rơi vào đây.</div>'}</div>
    <div class="bs-note">Lưu ý: Vật phẩm trong phó bản Bang Hội sẽ chuyển vào Kho, dùng Điểm BOSS để đấu giá trước 12h00 mỗi ngày. Kho xem trong Túi Đồ.</div>`;
}
function bsBuy(i) {
  const s = gdTick(), l = s.lots[i]; if (!l) return; if (gold < l.buy) return scToast('Không đủ Vàng');
  gold -= l.buy; resSave(); const k = s.kho[l.name] || (s.kho[l.name] = { ico: l.ico, qty: 0 }); k.qty += l.qty;
  if (l.bid && l.mine) s.pts += l.bid; s.lots.splice(i, 1); gdSave(s); renderBangBoss(); scToast('Đã chuyển vào Kho');
}
function bsBid(i) {
  const s = gdTick(), l = s.lots[i]; if (!l) return; const min = l.bid ? l.bid + 1 : l.bid0;
  const v = parseInt(prompt(`Đặt giá (Điểm BOSS, tối thiểu ${min}). Có ${s.pts}:`, min), 10); if (!(v >= min)) return;
  const back = l.mine ? l.bid : 0; if (s.pts + back < v) return scToast('Không đủ Điểm BOSS');
  s.pts = s.pts + back - v; l.bid = v; l.mine = 1; gdSave(s); renderBangBoss();
}
function gdKhoRows(row, sec) { const k = gdSt().kho, n = Object.keys(k).filter(x => k[x].qty > 0); return n.length ? sec('🏯 Kho Bang Hội') + n.map(x => row(k[x].ico, x, '× ' + fmtN(k[x].qty), '', '')).join('') : ''; }
setInterval(() => { document.querySelectorAll('.bs-t').forEach(e => { const x = Math.max(0, Math.floor((e.dataset.exp - Date.now()) / 1000)); e.textContent = 'Còn:' + [x / 3600 | 0, x / 60 % 60 | 0, x % 60].map(v => String(v).padStart(2, '0')).join(':'); }); }, 1000);
(function () { const d = document.createElement('div'); d.id = 'boss-modal'; d.className = 'md-wrap'; d.onclick = e => { if (e.target === d) d.style.display = 'none'; }; document.body.appendChild(d); })();

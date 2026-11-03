/* ĐỘT PHÁ + BỒI DƯỠNG — file lẻ, tự chứa giao diện + CSS + logic.
   Cách gắn: chép vào js/heroes/dotpha.js, thêm 1 dòng vào index.html, đặt NGAY TRÊN dòng kinhmach.js (và trước boot.js):
       <script src="js/heroes/dotpha.js?v=1"></script>
   Vào game: Võ Hiệp (thanh dưới) -> Đột Phá  hoặc  Bồi Dưỡng -> chọn tướng.
   Trong màn Bồi Dưỡng bấm nút "Đột Phá" (góc phải) để sang Đột Phá, và ngược lại. */
(function () {

  /* ================= CẤU HÌNH (sửa số ở đây) ================= */
  const DP_MAX      = Infinity; // KHÔNG giới hạn cấp đột phá (cấp n -> n+1 tốn 2^n Thần Đan: 1, 2, 4, 8, 16, ...)
  const DP_EXP_BASE = 10000;    // giới hạn exp bồi dưỡng khi chưa đột phá (+0)
  const DP_EXP_UP   = 10000;    // mỗi cấp đột phá mở thêm bấy nhiêu exp
  const DP_ATTR_PCT = 5;        // mỗi cấp đột phá cộng % HP/Công/Thủ/Hồi (theo hình "Thuộc tính +5%"); đặt 0 nếu không muốn
  const DP_PER_PILL = 10;       // 1 Tiên Đan = 10 exp bồi dưỡng
  const DP_RATIO    = { hp: 0.5, atk: 0.3, def: 0.1, heal: 0.1 };   // 10 exp = 5 HP + 3 Công + 1 Thủ + 1 Hồi
  const DP_GOD = 'Thần Đan', DP_PILL = 'Tiên Đan';                  // tên vật phẩm (nằm trong Túi Đồ)
  /* ============================================================ */

  const dpCost = lv => Math.pow(2, lv);                    // Thần Đan để đột phá từ +lv lên +lv+1
  const dpCap  = lv => DP_EXP_BASE + DP_EXP_UP * lv;       // giới hạn exp ở cấp đột phá lv
  let dpProg = loadJSON('dp_prog');                        // { heroId: { bp: cấp đột phá, exp: exp bồi dưỡng đã dùng } }
  let dpHero = 0, dpMode = 'dp';

  const dpGet = id => { const p = dpProg[id] || {}; return { bp: Math.max(0, Math.min(DP_MAX, p.bp | 0)), exp: Math.max(0, p.exp | 0) }; };
  const dpSet = (id, p) => { dpProg[id] = { bp: p.bp, exp: p.exp }; saveJSON('dp_prog', dpProg); };

  /* ---- Vật phẩm: dùng kho sẵn có của game -> tự hiện trong Túi Đồ, nhập được bằng Gift Code ---- */
  const hasKho = () => typeof gdSt === 'function' && typeof gdSave === 'function';
  const itemQty = n => { try { const k = gdSt().kho[n]; return k ? Math.max(0, Math.floor(k.qty)) : 0; } catch (e) { return 0; } };
  function itemAdd(n, d, ico) { const s = gdSt(); const k = (s.kho[n] = s.kho[n] || { ico: ico || '🎁', qty: 0 }); k.qty = Math.max(0, k.qty + d); gdSave(s); }
  window.dpAddItem = (name, n) => itemAdd(name, n, name === DP_GOD ? '🔮' : '🔴');   // dùng khi muốn cho đan từ PVE / cửa tiệm...
  try {
    if (typeof BAG_PRICE !== 'undefined') { BAG_PRICE[DP_GOD] = 500; BAG_PRICE[DP_PILL] = 10; }
    if (typeof BAG_DESC !== 'undefined') { BAG_DESC[DP_GOD] = 'Dùng để Đột Phá tướng (Võ Hiệp → Đột Phá).'; BAG_DESC[DP_PILL] = 'Dùng để Bồi Dưỡng tướng: mỗi viên +' + DP_PER_PILL + ' exp.'; }
    if (typeof GIFT_CODES !== 'undefined') GIFT_CODES['DOTPHA'] = { rewards: [{ t: 'item', name: DP_GOD, ico: '🔮', n: 100 }, { t: 'item', name: DP_PILL, ico: '🔴', n: 5000 }] };   // mã thử
  } catch (e) {}

  /* ---- Gắn vào chỉ số tướng (PVE, Tỷ Võ, chi tiết tướng đều ăn) ---- */
  const _heroStats = heroStats;
  heroStats = function (id, base) {
    const s = _heroStats(id, base), p = dpGet(id);
    if (!p.bp && !p.exp) return s;
    const m = 1 + DP_ATTR_PCT * p.bp / 100;
    s.hp   = Math.round(s.hp * m)   + Math.round(p.exp * DP_RATIO.hp);
    s.atk  = Math.round(s.atk * m)  + Math.round(p.exp * DP_RATIO.atk);
    s.def  = Math.round(s.def * m)  + Math.round(p.exp * DP_RATIO.def);
    s.heal = Math.round((s.heal || 0) * m) + Math.round(p.exp * DP_RATIO.heal);
    return s;
  };
  function statsWith(id, patch) {   // chỉ số nếu tướng có đột phá/exp như `patch`
    const old = dpProg[id], had = Object.prototype.hasOwnProperty.call(dpProg, id);
    dpProg[id] = Object.assign({}, dpGet(id), patch);
    try { return heroStats(id); } finally { if (had) dpProg[id] = old; else delete dpProg[id]; }
  }
  if (typeof SV_KEYS !== 'undefined' && SV_KEYS.indexOf('dp_prog') < 0) SV_KEYS.push('dp_prog');   // sao lưu + đồng bộ mây

  /* ---- Nối nút ở Hub Võ Hiệp ---- */
  const _vhGo = vhGo;
  vhGo = function (k) {
    if (k === 'dotpha') return dpOpenPicker('dp');
    if (k === 'boiduong') return dpOpenPicker('bd');
    return _vhGo(k);
  };
  /* ---- Giữ thanh trên + thanh dưới ở các màn này ---- */
  const _sw = switchScreen;
  switchScreen = function (id) {
    _sw(id);
    if (id === 'dppick' || id === 'dp' || id === 'bd') {
      document.getElementById('app-header').style.display = 'block';
      document.getElementById('app-nav').style.display = 'flex';
      const b = document.getElementById('nav-btn-vhub'); if (b) b.classList.add('active');
    }
  };

  /* ================= CSS ================= */
  const css = document.createElement('style');
  css.textContent = `
.dp-bar{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,.4);border-bottom:2px solid #fde047}
.dp-bar h2{flex:1;margin:0;font-size:19px;color:#fff;text-shadow:0 2px 3px #000}
.dp-sw{background:linear-gradient(180deg,#38bdf8,#1d4ed8);border:2px solid #bae6fd;border-radius:10px;color:#fff;font-weight:900;font-size:15px;padding:7px 14px;cursor:pointer;text-shadow:0 1px 2px #000}
.dp-body{flex:1;overflow-y:auto;padding:10px 10px 24px}
.dp-card{background:linear-gradient(#aeaeaa,#8f8f8a);border:3px solid #6b6b66;border-radius:8px;padding:10px 8px;color:#fff;box-shadow:0 3px 8px #0006}
.dp-t{text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0 2px 3px #000;font-weight:800}
.dp-top{display:grid;grid-template-columns:1fr 96px 1fr;gap:2px;align-items:start}
.dp-col{text-align:center;font-size:14px;line-height:1.55}
.dp-col .nm{font-size:15px;line-height:1.15;margin:3px 0}
.dp-pt{width:62px;height:62px;margin:0 auto;border:3px solid #d4a24c;border-radius:9px;overflow:hidden;background:#3b2a1a}
.dp-pt.purple{border-color:#a855f7}.dp-pt .hero-img,.dp-pt img{width:100%;height:100%;object-fit:cover}
.dp-mid{text-align:center;font-size:12px;line-height:1.25}
.dp-arrow{font-size:34px;color:#e5e5e0;line-height:1;margin-top:10px;text-shadow:0 2px 2px #000}
.dp-pct{color:#86efac;font-size:12px;margin:2px 0 8px;white-space:nowrap}
.dp-vl{color:#fde047;font-size:14px;margin-bottom:3px}
.dp-orb{width:54px;height:54px;margin:0 auto 2px;background:#3b2a1a;border:2px solid #6b4a2a;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:32px}
.dp-bad{color:#f87171}
.dp-ghd{margin-top:10px;background:linear-gradient(#92d94f,#3f7d1d);border:2px solid #c6f59a;border-radius:4px;text-align:center;font-size:15px;padding:2px 4px;color:#fff}
.dp-gbd{background:#34402b;border:2px solid #1f2918;border-radius:0 0 6px 6px;padding:8px 10px}
.dp-cap{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:13px}
.dp-cap div{display:flex;align-items:center;justify-content:space-between;gap:3px;color:#fff}
.dp-cap i{font-style:normal;color:#4ade80;font-weight:900}
.dp-cap b{color:#86efac}
.dp-go{display:block;margin:14px auto 0;min-width:190px;padding:10px 26px;font-size:22px;font-weight:900;color:#fff;border-radius:14px;border:3px solid #bbf7d0;background:linear-gradient(180deg,#34d058,#15803d);text-shadow:0 2px 2px #000;box-shadow:0 3px 0 #14532d,0 5px 8px #0008;cursor:pointer}
.dp-go:disabled{filter:grayscale(1) brightness(.7)}
.dp-msg{min-height:18px;text-align:center;margin-top:8px;font-size:13px;font-weight:800;color:#fde047;text-shadow:0 1px 3px #000}
.bd-hd{display:flex;gap:12px;align-items:center}
.bd-hd .dp-pt{margin:0;width:70px;height:70px}
.bd-st{display:grid;grid-template-columns:1fr 1fr;gap:0 10px;flex:1;font-size:15px;line-height:1.5}
.bd-st .nm{grid-column:1/3;font-size:17px}
.bd-row{display:flex;align-items:center;gap:8px;margin:7px 0;font-size:15px;color:#fff}
.bd-row>span:first-child{width:74px}
.bd-track{flex:1;height:14px;background:#4a3322;border:2px solid #2b1c10;border-radius:4px;overflow:hidden}
.bd-fill{height:100%;background:linear-gradient(#bef264,#4d9a1d);transition:width .25s}
.bd-row>span:last-child{width:84px;text-align:right;font-size:14px}
.bd-note{color:#fde047;font-size:14px;text-align:center;margin-top:4px}
.bd-types{display:flex;justify-content:space-around;gap:6px;color:#fff;padding:6px 4px}
.bd-ty{display:flex;align-items:flex-start;gap:6px;font-size:15px}
.bd-ck{width:34px;height:34px;border:3px solid #4b3a2a;border-radius:5px;background:#6b5a48;display:flex;align-items:center;justify-content:center;color:#4ade80;font-size:26px;font-weight:900;flex:none}
.bd-ty small{display:block;font-size:12px;color:#e5e7eb}
.bd-left{text-align:center;color:#fff;font-size:15px;padding-bottom:2px}
.bd-btns{display:flex;justify-content:center;gap:8px;margin-top:12px}
.bd-btns .dp-go{margin:0;min-width:0;flex:1;max-width:120px;padding:9px 0;font-size:19px}
`;
  document.head.appendChild(css);

  /* ================= KHUNG MÀN HÌNH ================= */
  const host = document.getElementById('screen-picker').parentNode;
  const mk = (id, html) => { const d = document.createElement('div'); d.className = 'screen'; d.id = 'screen-' + id; d.innerHTML = html; host.appendChild(d); };
  mk('dppick', `<div class="dp-bar"><button class="btn-back" onclick="switchScreen('vhub')">Trở về</button><h2 id="dpk-title"></h2></div>
    <div class="dp-body" style="padding:0"><div class="pk-grid" id="dpk-grid"></div></div>`);
  mk('dp', `<div class="dp-bar"><button class="btn-back" onclick="dpOpenPicker('dp')">Trở về</button><h2>Đột Phá</h2><button class="dp-sw" onclick="dpGo('bd')">Bồi Dưỡng</button></div>
    <div class="dp-body" id="dp-body"></div>`);
  mk('bd', `<div class="dp-bar"><button class="btn-back" onclick="dpOpenPicker('bd')">Trở về</button><h2>Bồi Dưỡng</h2><button class="dp-sw" onclick="dpGo('dp')">Đột Phá</button></div>
    <div class="dp-body" id="bd-body"></div>`);

  /* ================= CHỌN TƯỚNG ================= */
  window.dpOpenPicker = function (mode) {
    dpMode = mode;
    document.getElementById('dpk-title').textContent = mode === 'dp' ? 'Chọn Võ Hiệp đột phá' : 'Chọn Võ Hiệp bồi dưỡng';
    const order = HEROES.slice().sort((a, b) => (team.includes(b.id) - team.includes(a.id)) || (getProg(b.id).lv - getProg(a.id).lv));
    document.getElementById('dpk-grid').innerHTML = order.map(h => {
      const p = getProg(h.id), d = dpGet(h.id), inTeam = team.includes(h.id);
      return `<div class="pk-card ${(HERO_BORDER[h.id] || 'orange') === 'purple' ? 'purple' : ''}" onclick="dpOpen(${h.id})">${inTeam ? '<div class="pk-tag">Đội</div>' : ''}<div class="e">${heroIcon(h)}</div><div class="n">${h.name}${d.bp ? '+' + d.bp : ''}</div><div class="st">${'★'.repeat(Math.min(p.star, 5)) || '☆'}</div></div>`;
    }).join('');
    switchScreen('dppick');
  };
  window.dpOpen = function (id) { dpHero = id; dpGo(dpMode); };
  window.dpGo = function (m) { dpMode = m; if (m === 'dp') renderDP(''); else renderBD(''); switchScreen(m); };

  const portrait = h => `<div class="dp-pt ${(HERO_BORDER[h.id] || 'orange') === 'purple' ? 'purple' : ''}">${heroIcon(h)}</div>`;
  const statCol = (s, cap) => `<div>HP ${fmtN(s.hp)}</div><div>Công ${fmtN(s.atk)}</div><div>Thủ ${fmtN(s.def)}</div><div>Hồi ${fmtN(s.heal || 0)}</div>`;
  const nameOf = (h, bp) => h.name + (bp ? '+' + bp : '');
  const refresh = () => { try { renderHomeTeam(); } catch (e) {} };

  /* ================= MÀN ĐỘT PHÁ ================= */
  function renderDP(msg) {
    const id = dpHero, h = heroById(id), p = dpGet(id), maxed = p.bp >= DP_MAX;
    const cur = heroStats(id), nxt = maxed ? cur : statsWith(id, { bp: p.bp + 1 });
    const need = dpCost(p.bp), have = itemQty(DP_GOD), ok = have >= need;
    const c0 = dpCap(p.bp), c1 = maxed ? c0 : dpCap(p.bp + 1);
    const cr = (l, k) => `<div><span>${l} ${fmtN(c0 * DP_RATIO[k])}</span><i>➜</i><b>${fmtN(c1 * DP_RATIO[k])}</b></div>`;
    document.getElementById('dp-body').innerHTML = `
      <div class="dp-card dp-t">
        <div class="dp-top">
          <div class="dp-col">${portrait(h)}<div class="nm">${nameOf(h, p.bp)}</div><div>Cấp: ${getProg(id).lv}</div>${statCol(cur)}</div>
          <div class="dp-mid"><div class="dp-arrow">➡</div><div class="dp-pct">${maxed ? 'Đã tối đa' : 'Thuộc tính +' + DP_ATTR_PCT + '%'}</div>
            <div class="dp-vl">Vật Liệu</div><div class="dp-orb">🔮</div><div>${DP_GOD}</div><div class="${ok || maxed ? '' : 'dp-bad'}">${fmtN(have)} / ${maxed ? '-' : fmtN(need)}</div></div>
          <div class="dp-col">${portrait(h)}<div class="nm">${nameOf(h, maxed ? p.bp : p.bp + 1)}</div><div>Cấp: ${getProg(id).lv}</div>${statCol(nxt)}</div>
        </div>
        <div class="dp-ghd">Đột Phá giúp tăng giới hạn Bồi Dưỡng</div>
        <div class="dp-gbd"><div class="dp-cap">${cr('HP', 'hp')}${cr('Công', 'atk')}${cr('Thủ', 'def')}${cr('Hồi', 'heal')}</div></div>
      </div>
      <button class="dp-go" ${maxed ? 'disabled' : ''} onclick="dpBreak()">${maxed ? 'Đã tối đa' : 'Đột Phá'}</button>
      <div class="dp-msg">${msg || ''}</div>`;
  }
  window.dpBreak = function () {
    const id = dpHero, p = dpGet(id);
    if (p.bp >= DP_MAX) return renderDP('Đã đột phá tối đa.');
    if (!hasKho()) return renderDP('Chưa nạp kho vật phẩm.');
    const need = dpCost(p.bp), have = itemQty(DP_GOD);
    if (have < need) return renderDP(`Thiếu ${DP_GOD}: cần ${fmtN(need)}, đang có ${fmtN(have)}.`);
    itemAdd(DP_GOD, -need);
    dpSet(id, { bp: p.bp + 1, exp: p.exp });
    refresh(); scToast('Đột phá thành công! ' + nameOf(heroById(id), p.bp + 1));
    renderDP('Đột phá thành công: giới hạn bồi dưỡng tăng ' + fmtN(DP_EXP_UP) + ' exp.');
  };

  /* ================= MÀN BỒI DƯỠNG ================= */
  function renderBD(msg) {
    const id = dpHero, h = heroById(id), p = dpGet(id), cap = dpCap(p.bp), st = heroStats(id), have = itemQty(DP_PILL), full = p.exp >= cap;
    const row = (l, k) => { const v = p.exp * DP_RATIO[k], c = cap * DP_RATIO[k]; return `<div class="bd-row dp-t"><span>${l}</span><div class="bd-track"><div class="bd-fill" style="width:${Math.min(100, v / c * 100)}%"></div></div><span>${fmtN(v)}/${fmtN(c)}</span></div>`; };
    document.getElementById('bd-body').innerHTML = `
      <div class="dp-card dp-t">
        <div class="bd-hd">${portrait(h)}<div class="bd-st"><div class="nm">${nameOf(h, p.bp)}</div><div>HP:${fmtN(st.hp)}</div><div>Công:${fmtN(st.atk)}</div><div>Thủ:${fmtN(st.def)}</div><div>Hồi:${fmtN(st.heal || 0)}</div></div></div>
        <div class="dp-ghd" style="text-align:left;padding-left:10px">Tăng Bồi Dưỡng</div>
        <div class="dp-gbd">${row('Tăng HP', 'hp')}${row('Tăng Công', 'atk')}${row('Tăng Thủ', 'def')}${row('Tăng Hồi', 'heal')}
          <div class="bd-note dp-t">${full ? 'Đã đầy! Hãy Đột Phá để mở thêm giới hạn' : 'Đột phá để tăng giới hạn (exp ' + fmtN(p.exp) + '/' + fmtN(cap) + ')'}</div></div>
        <div class="dp-ghd" style="text-align:left;padding-left:10px">Loại Bồi Dưỡng</div>
        <div class="bd-types">
          <div class="bd-ty"><div class="bd-ck">✔</div><div>Thường<small>🔴 x1 = +${DP_PER_PILL} exp</small></div></div>
          <div class="bd-ty" style="opacity:.55" onclick="scToast('Cao Cấp sắp ra mắt')"><div class="bd-ck"></div><div>Cao Cấp (Đề Cử)<small>Sắp ra mắt</small></div></div>
        </div>
        <div class="bd-left">Còn ${DP_PILL} 🔴 : ${fmtN(have)}</div>
      </div>
   

<div class="bd-btns"><button class="dp-go" ${full ? 'disabled' : ''} onclick="dpTrain(10)">10 lần</button><button class="dp-go" ${full ? 'disabled' : ''} onclick="dpTrain(100)">100 lần</button><button class="dp-go" ${full ? 'disabled' : ''} onclick="dpTrain(1000)">1000 lần</button></div>
   
  }
  window.dpTrain = function (times) {
    const id = dpHero, p = dpGet(id), cap = dpCap(p.bp);
    if (!hasKho()) return renderBD('Chưa nạp kho vật phẩm.');
    const room = Math.floor((cap - p.exp) / DP_PER_PILL);
    if (room < 1) return renderBD('Đã đầy exp, cần Đột Phá để tăng thêm.');
    const have = itemQty(DP_PILL);
    if (have < 1) return renderBD(`Hết ${DP_PILL}.`);
    const k = Math.min(times, room, have), e = k * DP_PER_PILL;
    itemAdd(DP_PILL, -k);
    dpSet(id, { bp: p.bp, exp: p.exp + e });
    refresh();
    renderBD(`Dùng ${fmtN(k)} ${DP_PILL}: +${fmtN(e)} exp (HP +${fmtN(e * DP_RATIO.hp)}, Công +${fmtN(e * DP_RATIO.atk)}, Thủ +${fmtN(e * DP_RATIO.def)}, Hồi +${fmtN(e * DP_RATIO.heal)})`);
  };

})();

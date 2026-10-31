/* TÚI ĐỒ: lưới ô vật phẩm. Chọn 1 món -> Bán Ra (nhập mật khẩu bán 0000) hoặc Sử Dụng.
   Tiền tệ hiện ở thanh trên; mảnh tướng, trang bị, bảo vật không nằm ở đây. */

    const BAG_SELL_PASS = '0000';
    const BAG_PRICE = { 'Viên Thể Lực': 10, 'Thú Noãn': 50, 'Thú Hồn': 100, 'Thú Linh': 500, 'Đá Nữ Oa': 100, 'Dị Linh': 300, 'Đào Tiên': 200, 'Đào Tiên Vương': 1000, 'Tử Linh Thạch': 400, 'Lá Linh': 50, 'Hộp Linh': 200, 'Hộp Tinh': 400, 'Ngọc Tím': 300 };
    const BAG_DESC = { 'Thú Noãn': 'Nguyên liệu thần thú, rơi từ Boss bang.', 'Thú Hồn': 'Cho thần thú ăn: +100 EXP.', 'Thú Linh': 'Cho thần thú ăn: +500 EXP.', 'Đá Nữ Oa': 'Dùng tăng sao thần thú.', 'Dị Linh': 'Dùng tăng sao thần thú.', 'Đào Tiên': 'Vật phẩm rơi từ Boss bang.', 'Đào Tiên Vương': 'Vật phẩm rơi từ Boss bang.', 'Tử Linh Thạch': 'Vật phẩm rơi từ Boss bang.' };
    let bagSel = null, bagQty = 1;

    function bagItems() {   // [{k, name, ico, qty, price, desc, use}]
      const it = [{ k: 'pill', name: 'Viên Thể Lực', ico: '💊', qty: staState.pills, price: BAG_PRICE['Viên Thể Lực'], desc: `Mỗi viên +${PILL_STA} thể lực (hiện ${staState.v}/${STA_MAX}).`, use: 'pill' },
        { k: 'hammer', name: 'Búa', ico: '🔨', qty: hammerCount(), price: 0, desc: 'Tăng 1★ cho Bảo Vật.', use: 'hammer' },
        { k: 'key', name: 'Chìa Khóa', ico: '🔑', qty: keyCount(), price: 0, desc: `1 🔑 mở thêm ${KEY_LV} cấp trang bị.`, use: 'key' }];
      if (typeof gdSt === 'function') { const kho = gdSt().kho; Object.keys(kho).forEach(n => { if (kho[n].qty > 0) it.push({ k: 'g:' + n, name: n, ico: gdIco(n, kho[n].ico), qty: kho[n].qty, price: BAG_PRICE[n] || 100, desc: BAG_DESC[n] || 'Vật phẩm Bang Hội.', use: 'gd' }); }); }
      return it.filter(x => x.qty > 0);
    }
    function renderBag() {
      const items = bagItems(); if (!items.some(x => x.k === bagSel)) { bagSel = items.length ? items[0].k : null; bagQty = 1; }
      const cur = items.find(x => x.k === bagSel);
      const cells = items.map(x => `<div class="bg-cell ${x.k === bagSel ? 'sel' : ''}" onclick="bagPick('${x.k.replace(/'/g, "\\'")}')"><span class="bg-i">${x.ico}</span><em>${x.qty > 999 ? '999+' : 'x' + fmtN(x.qty)}</em></div>`).join('');
      const empty = Math.max(0, 20 - items.length); const blanks = '<div class="bg-cell empty"></div>'.repeat(empty);
      document.getElementById('bag-list').innerHTML =
        `<div class="bg-top">Túi Đồ <b>${items.length}/90</b></div><div class="bg-grid">${cells}${blanks}</div>` +
        (cur ? `<div class="bg-info"><div class="bg-l"><div>Có <b>${fmtN(cur.qty)}</b></div><div>Giá <b>${cur.price ? fmtN(cur.price) + ' 🥈' : 'Không bán'}</b></div>
          <div class="bg-q"><button onclick="bagStep(-1)">−</button><span>${Math.min(bagQty, cur.qty)}</span><button onclick="bagStep(1)">+</button><button onclick="bagStep(0)">Tất cả</button></div></div>
          <div class="bg-m"><div class="bg-big">${cur.ico}</div><b>${cur.name}</b></div>
          <div class="bg-r"><button class="bg-sell" ${cur.price ? '' : 'disabled'} onclick="bagSellOpen()">Bán Ra</button><button class="bg-use" onclick="bagUse()">Sử Dụng</button></div>
          <div class="bg-d">${cur.desc}</div></div>` : '<div class="bg-info"><div class="bg-d" style="text-align:center">Túi đồ trống</div></div>');
    }
    function bagPick(k) { bagSel = k; bagQty = 1; renderBag(); }
    function bagStep(d) { const c = bagItems().find(x => x.k === bagSel); if (!c) return; bagQty = d === 0 ? c.qty : Math.max(1, Math.min(c.qty, Math.min(bagQty, c.qty) + d)); renderBag(); }
    function bagUse() {
      const c = bagItems().find(x => x.k === bagSel); if (!c) return; const n = Math.min(bagQty, c.qty);
      if (c.use === 'pill') { usePills(n); renderBag(); return; }
      if (c.use === 'hammer' || c.use === 'key') { closeBag(); if (typeof tsOpen === 'function') tsOpen(); return; }
      closeBag(); if (c.name === 'Thú Hồn' || c.name === 'Thú Linh') { if (typeof openThanThu === 'function') openThanThu(); } else if (typeof openBangBoss === 'function') openBangBoss();
    }
    function bagSellOpen() {
      const c = bagItems().find(x => x.k === bagSel); if (!c || !c.price) return; const n = Math.min(bagQty, c.qty), m = document.getElementById('bag-sell');
      m.innerHTML = `<div class="md-box" style="max-width:320px"><div class="hd-name" style="text-align:center">Bán ${n} × ${c.name}</div><div class="set-note" style="text-align:center">Nhận <b>${fmtN(c.price * n)}</b> 🥈 bạc. Nhập mật khẩu bán để xác nhận.</div>
        <input id="bag-pass" type="password" inputmode="numeric" maxlength="8" placeholder="Mật khẩu bán" class="bg-pass" autocomplete="off">
        <div class="gs-act" style="justify-content:center;gap:10px;margin:8px 0 0"><button onclick="document.getElementById('bag-sell').style.display='none'">Hủy</button><button onclick="bagSellDo()">Đồng ý</button></div></div>`;
      m.style.display = 'flex'; setTimeout(() => { const i = document.getElementById('bag-pass'); if (i) i.focus(); }, 50);
    }
    function bagSellDo() {
      const c = bagItems().find(x => x.k === bagSel); if (!c) return;
      if (document.getElementById('bag-pass').value !== BAG_SELL_PASS) return (typeof scToast === 'function' ? scToast('Sai mật khẩu bán') : alert('Sai mật khẩu bán'));
      const n = Math.min(bagQty, c.qty);
      if (c.use === 'pill') { staState.pills -= n; staSave(); }
      else if (c.use === 'gd') { const s = gdSt(); s.kho[c.name].qty -= n; gdSave(s); }
      else return;
      silver += c.price * n; resSave(); document.getElementById('bag-sell').style.display = 'none'; bagQty = 1; renderBag();
      if (typeof scToast === 'function') scToast(`Đã bán ${n} ${c.name}, +${fmtN(c.price * n)} bạc`);
    }
    function openBag() { renderBag(); document.getElementById('bag-modal').style.display = 'flex'; }
    function closeBag() { document.getElementById('bag-modal').style.display = 'none'; }
    (function () { const d = document.createElement('div'); d.id = 'bag-sell'; d.className = 'md-wrap'; d.style.zIndex = 400; d.onclick = e => { if (e.target === d) d.style.display = 'none'; }; document.body.appendChild(d); })();

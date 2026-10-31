/* TÚI ĐỒ: tiền tệ và vật phẩm đang có
   (viết mới) */

    function renderBag() {
      const row = (ico, name, qty, sub, btns) => `<div class="bm-row"><div class="bm-ico">${ico}</div><div class="bm-info"><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</div><div class="bm-qty">${qty}</div>${btns || ''}</div>`;
      const sec = t => `<div class="bm-sec">${t}</div>`;
      const pills = staState.pills;
      document.getElementById('bag-list').innerHTML =
        sec('💰 Tiền tệ') +
        row('🥈', 'Bạc', fmtN(silver), 'Thắng Bàn PVE để nhận • tăng cấp tướng') +
        row('🌾', 'Gạo', fmtN(rice), 'Thắng Bàn PVE để nhận • tăng cấp tướng') +
        row('<img class="gi-g" src="assets/images/items/thoi-vang.svg" alt="vàng">', 'Vàng', fmtN(gold), 'Quà Hộp Thư mỗi ngày • Chiêu Mộ') +
        sec('🎒 Vật phẩm') +
        row('💊', 'Viên Thể Lực', '× ' + fmtN(pills), `Mỗi viên +${PILL_STA} thể lực (hiện ${staState.v}/${STA_MAX})`,
            `<button class="btn-attack" ${pills < 1 ? 'disabled' : ''} onclick="usePills(1);renderBag()">Dùng 1</button><button class="btn-close-battle" ${pills < 1 ? 'disabled' : ''} onclick="usePills(10);renderBag()">Dùng 10</button>`) +
        row('🔨', 'Búa', '× ' + fmtN(hammerCount()), 'Tăng 1★ cho Bảo Vật') +
        row('🔑', 'Chìa Khóa', '× ' + fmtN(keyCount()), `1 🔑 mở thêm ${KEY_LV} cấp`) +
        (typeof gdKhoRows === 'function' ? gdKhoRows(row, sec) : '');
    }
    function openBag() { renderBag(); document.getElementById('bag-modal').style.display = 'flex'; }
    function closeBag() { document.getElementById('bag-modal').style.display = 'none'; }

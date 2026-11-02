/* GIFT CODE: nút 🎁 Gift Code dưới Túi Đồ -> nhập mã nhận quà.
   Mỗi mã chỉ nhập được 1 lần trên mỗi tài khoản (lưu ở 'giftcode_used', đã nằm trong SV_KEYS nên theo save/cloud).

   THÊM MÃ MỚI: thêm 1 dòng vào GIFT_CODES (viết HOA, không dấu cách).
   Loại quà (t):
     'pill'   Viên Thể Lực          { t: 'pill', n: 10 }
     'silver' Bạc                   { t: 'silver', n: 100000 }
     'rice'   Gạo                   { t: 'rice', n: 50000 }
     'gold'   Vàng                  { t: 'gold', n: 100 }
     'item'   Vật phẩm Bang Hội     { t: 'item', name: 'Thú Linh', ico: '🔥', n: 5 }   (vào kho bang -> hiện trong Túi)
   Lưu ý: mã nằm trong file JS nên người chơi mở mã nguồn là thấy; muốn mã bí mật thật sự cần kiểm tra phía máy chủ. */

const GIFT_CODES = {
  // Mã mẫu — sửa / xoá / thêm tuỳ ý
  'CHAOBAN':   { rewards: [{ t: 'pill', n: 10 }, { t: 'silver', n: 100000 }] },
  'MONGHUYEN': { rewards: [{ t: 'gold', n: 100 }, { t: 'item', name: 'Thú Linh', ico: '🔥', n: 5 }] }
};

function gcNorm(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
function gcUsed() { const u = loadJSON('giftcode_used'); return (u && typeof u === 'object') ? u : {}; }

function gcGrant(r) {
  const n = Math.max(0, Math.floor(r.n) || 0); if (!n) return '';
  if (r.t === 'pill') { staState.pills += n; staSave(); return `${fmtN(n)} Viên Thể Lực`; }
  if (r.t === 'silver') { silver += n; resSave(); return `${fmtN(n)} bạc`; }
  if (r.t === 'rice') { rice += n; resSave(); return `${fmtN(n)} gạo`; }
  if (r.t === 'gold') { gold += n; goldSave(); return `${fmtN(n)} vàng`; }
  if (r.t === 'item' && typeof gdSt === 'function') {
    const s = gdSt(); (s.kho[r.name] = s.kho[r.name] || { ico: r.ico || '🎁', qty: 0 }).qty += n; gdSave(s);
    return `${fmtN(n)} ${r.name}`;
  }
  return '';
}

function gcRedeem() {
  const inp = document.getElementById('gc-input'); if (!inp) return;
  const code = gcNorm(inp.value);
  if (!code) return scToast('Hãy nhập Gift Code');
  const def = GIFT_CODES[code];
  if (!def) return scToast('Gift Code không hợp lệ');
  const used = gcUsed();
  if (used[code]) return scToast('Bạn đã nhập mã này rồi');
  used[code] = Date.now(); saveJSON('giftcode_used', used);
  const got = def.rewards.map(gcGrant).filter(Boolean);
  inp.value = '';
  document.getElementById('gc-modal').style.display = 'none';
  if (document.getElementById('bag-modal').style.display === 'flex') renderBag();
  scToast('🎁 Nhận: ' + got.join(', '));
}

function openGiftCode() {
  const m = document.getElementById('gc-modal');
  m.innerHTML = `<div class="md-box" style="max-width:320px"><button class="md-x" onclick="closeGiftCode()">✕</button>
    <div class="hd-name" style="text-align:center;color:#fde047">🎁 Gift Code</div>
    <div class="set-note" style="text-align:center">Nhập mã để nhận quà. Mỗi mã chỉ dùng được 1 lần.</div>
    <input id="gc-input" type="text" maxlength="32" placeholder="Nhập Gift Code" class="gc-input" autocomplete="off" autocapitalize="characters" spellcheck="false" onkeydown="if(event.key==='Enter')gcRedeem()">
    <div class="gs-act" style="justify-content:center;gap:10px;margin:8px 0 0"><button onclick="closeGiftCode()">Hủy</button><button onclick="gcRedeem()">Nhận Quà</button></div></div>`;
  m.style.display = 'flex'; setTimeout(() => { const i = document.getElementById('gc-input'); if (i) i.focus(); }, 50);
}
function closeGiftCode() { document.getElementById('gc-modal').style.display = 'none'; }

(function () { const d = document.createElement('div'); d.id = 'gc-modal'; d.className = 'md-wrap'; d.style.zIndex = 400; d.onclick = e => { if (e.target === d) d.style.display = 'none'; }; document.body.appendChild(d); })();

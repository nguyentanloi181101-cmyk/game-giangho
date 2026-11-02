/* GIFT CODE: nút 🎁 Gift Code dưới Túi Đồ -> nhập mã nhận quà.
   NGUỒN MÃ:
     1) ĐÁM MÂY (chính): mã tạo bằng trang admin-giftcode.html, lưu ở Firestore 'gift_codes/{MÃ}'.
        Có giới hạn lượt dùng, hạn dùng, bật/tắt; mỗi tài khoản chỉ nhập 1 lần (ghi ở 'gift_codes/{MÃ}/redeemed/{uid}').
        Cần đăng nhập tài khoản đám mây mới nhập được.
     2) GIFT_CODES bên dưới (dự phòng, viết cứng trong file): dùng khi chưa đăng nhập / mất mạng.
        Mỗi mã chỉ nhập 1 lần trên mỗi tài khoản (lưu ở 'giftcode_used', nằm trong SV_KEYS nên theo save/cloud).
   Loại quà (t):
     'pill'     Viên Thể Lực          { t: 'pill', n: 10 }
     'silver'   Bạc                   { t: 'silver', n: 100000 }
     'rice'     Gạo                   { t: 'rice', n: 50000 }
     'gold'     Vàng                  { t: 'gold', n: 100 }
     'shard'    Mảnh tướng            { t: 'shard', id: 6, n: 10 }      (id = id tướng trong HEROES)
     'treasure' Bảo Vật (bản mới)     { t: 'treasure', id: 6, n: 1 }    (id = loại trong TS_DEFS)
     'item'     Vật phẩm Bang Hội     { t: 'item', name: 'Thú Linh', ico: '🔥', n: 5 }   (vào kho bang -> hiện trong Túi)
   Lưu ý: mã dự phòng nằm trong file JS nên người chơi xem mã nguồn là thấy; mã bí mật thật sự hãy tạo ở trang admin. */

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
  if (r.t === 'shard' && typeof heroById === 'function' && heroById(r.id)) {
    heroShards[r.id] = (heroShards[r.id] || 0) + n; saveJSON('hero_shards', heroShards);
    return `${fmtN(n)} mảnh ${heroById(r.id).name}`;
  }
  if (r.t === 'treasure' && typeof tsAdd === 'function' && TS_DEFS[r.id]) {
    const c = Math.min(n, 50); for (let i = 0; i < c; i++) tsAdd(r.id);
    return `${c} ${TS_DEFS[r.id].name}`;
  }
  if (r.t === 'item' && typeof gdSt === 'function') {
    const s = gdSt(); (s.kho[r.name] = s.kho[r.name] || { ico: r.ico || '🎁', qty: 0 }).qty += n; gdSave(s);
    return `${fmtN(n)} ${r.name}`;
  }
  return '';
}

// Hỏi máy chủ: kiểm tra + ghi nhận lượt dùng trong CÙNG 1 transaction (không thể vượt lượt hoặc nhập 2 lần dù bấm nhanh)
async function gcRedeemCloud(code) {
  const ref = clDb.collection('gift_codes').doc(code), mine = ref.collection('redeemed').doc(clUser.uid);
  return clDb.runTransaction(async tx => {
    const [s, m] = await Promise.all([tx.get(ref), tx.get(mine)]);
    if (!s.exists) return { err: 'none' };
    const d = s.data();
    if (d.enabled === false) return { err: 'off' };
    if (d.exp && Date.now() > d.exp) return { err: 'expired' };
    if (m.exists) return { err: 'used' };
    if (d.max && (d.used || 0) >= d.max) return { err: 'full' };
    tx.update(ref, { used: (d.used || 0) + 1 });
    tx.set(mine, { t: firebase.firestore.FieldValue.serverTimestamp() });
    return { rewards: d.rewards || [] };
  });
}
const GC_ERR = { none: 'Gift Code không hợp lệ', off: 'Gift Code đã bị khóa', expired: 'Gift Code đã hết hạn', used: 'Bạn đã nhập mã này rồi', full: 'Gift Code đã hết lượt sử dụng' };
let gcBusy = false;

async function gcRedeem() {
  if (gcBusy) return;
  const inp = document.getElementById('gc-input'); if (!inp) return;
  const code = gcNorm(inp.value);
  if (!code) return scToast('Hãy nhập Gift Code');
  if (!/^[A-Z0-9_-]{1,32}$/.test(code)) return scToast('Gift Code không hợp lệ');
  gcBusy = true;
  try {
    let rewards = null;
    if (typeof clUser !== 'undefined' && clUser && clDb) {
      try {
        const r = await gcRedeemCloud(code);
        if (r.rewards) rewards = r.rewards;
        else if (!(r.err === 'none' && GIFT_CODES[code])) return scToast(GC_ERR[r.err] || GC_ERR.none);   // 'none' + có mã dự phòng -> thử mã dự phòng
      } catch (e) {
        if (!GIFT_CODES[code]) return scToast(e && e.code === 'permission-denied' ? 'Chưa cấu hình quy tắc Firestore cho Gift Code' : 'Không kết nối được máy chủ, thử lại sau');
      }
    }
    if (!rewards) {   // mã dự phòng viết cứng
      const def = GIFT_CODES[code];
      if (!def) return scToast(typeof clUser !== 'undefined' && clUser ? GC_ERR.none : 'Hãy đăng nhập tài khoản để nhập Gift Code');
      const used = gcUsed();
      if (used[code]) return scToast(GC_ERR.used);
      used[code] = Date.now(); saveJSON('giftcode_used', used);
      rewards = def.rewards;
    }
    const got = rewards.map(gcGrant).filter(Boolean);
    inp.value = '';
    document.getElementById('gc-modal').style.display = 'none';
    if (document.getElementById('bag-modal').style.display === 'flex') renderBag();
    scToast('🎁 Nhận: ' + got.join(', '));
    if (typeof clPush === 'function') clPush();   // lưu ngay lên đám mây để quà không bị mất
  } finally { gcBusy = false; }
}

function openGiftCode() {
  const m = document.getElementById('gc-modal');
  m.innerHTML = `<div class="md-box" style="max-width:320px"><button class="md-x" onclick="closeGiftCode()">✕</button>
    <div class="hd-name" style="text-align:center;color:#fde047">🎁 Gift Code</div>
    <div class="set-note" style="text-align:center">Nhập mã để nhận quà. Mỗi mã chỉ dùng được 1 lần trên mỗi tài khoản.</div>
    <input id="gc-input" type="text" maxlength="32" placeholder="Nhập Gift Code" class="gc-input" autocomplete="off" autocapitalize="characters" spellcheck="false" onkeydown="if(event.key==='Enter')gcRedeem()">
    <div class="gs-act" style="justify-content:center;gap:10px;margin:8px 0 0"><button onclick="closeGiftCode()">Hủy</button><button onclick="gcRedeem()">Nhận Quà</button></div></div>`;
  m.style.display = 'flex'; setTimeout(() => { const i = document.getElementById('gc-input'); if (i) i.focus(); }, 50);
}
function closeGiftCode() { document.getElementById('gc-modal').style.display = 'none'; }

(function () { const d = document.createElement('div'); d.id = 'gc-modal'; d.className = 'md-wrap'; d.style.zIndex = 400; d.onclick = e => { if (e.target === d) d.style.display = 'none'; }; document.body.appendChild(d); })();

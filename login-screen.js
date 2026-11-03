/* MÀN HÌNH ĐĂNG NHẬP: hiện khi chưa đăng nhập
   (tách từ index.html cũ — script) */

/* ===== MÀN HÌNH ĐĂNG NHẬP: hiện khi chưa đăng nhập, tự ẩn khi đã đăng nhập ===== */
let lgReady = false;
const lgEl = id => document.getElementById(id);
function lgShow(on) { const e = lgEl('login-screen'); if (e) e.style.display = on ? 'block' : 'none'; }
function lgReg(on) { const e = lgEl('lg-reg'); if (!e) return; e.style.display = on ? 'flex' : 'none'; if (on) { const m = lgEl('rg-msg'); if (m) m.innerText = ''; setTimeout(() => { const i = lgEl('rg-user'); if (i) i.focus(); }, 50); } }
function lgOfflineShow() { const o = lgEl('lg-off'); if (o) o.style.display = 'block'; }
function lgUpdate(u) {
  try { _lsSet.call(localStorage, 'cl_was_in', u ? '1' : '0'); } catch (e) {}
  if (u) {
    try { _lsSet.call(localStorage, 'cl_last_name', (u.email || '').replace(CL_DOMAIN, '')); } catch (e) {}
    lgReg(false); lgShow(false);
    const p = lgEl('lg-pass'); if (p) p.value = '';
    return;
  }
  if (!lgReady) { lgReady = true; clMsg(''); }   // lần đầu kết nối xong: xóa dòng "Đang kết nối..."
  lgShow(true);
  const un = lgEl('lg-user'), pw = lgEl('lg-pass');
  if (pw) pw.value = '';
  try { if (un && !un.value) un.value = _lsGet.call(localStorage, 'cl_last_name') || ''; } catch (e) {}
}
function lgLogin() { clLogin('lg'); }
function lgRegister() {
  const p1 = lgEl('rg-pass').value || '', p2 = lgEl('rg-pass2').value || '';
  if (p1 !== p2) { clMsg('Mật khẩu nhập lại không khớp.', false); return; }
  clRegister('rg');
}
clInit();

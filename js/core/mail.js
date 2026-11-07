/* HỘP THƯ: quà hằng ngày + thư do admin gửi.
   Admin chỉnh ở admin.html → tab "📬 Hộp Thư" (lưu ở game_config/main → mail):
     mail.daily   1 = có quà hằng ngày, 0 = tắt           (mặc định 1)
     mail.days    thư chưa nhận giữ bao nhiêu ngày         (mặc định 7)
     mail.gifts   danh sách quà mỗi ngày                   (mặc định 10.000 vàng)
     mail.letters thư riêng: [{ id, title, body, gifts, from, to }]  (from/to = mốc thời gian ms, 0/trống = không giới hạn)
   Trạng thái người chơi (mail_state, đồng bộ đám mây): first = ngày đầu chơi • claimed = { 'yyyy-mm-dd': true } • letters = { idThư: true } */

const MAIL_DEF_GIFTS = [{ t: 'gold', n: 10000 }];
let MAIL_GIFTS = MAIL_DEF_GIFTS, MAIL_DAYS = 7, MAIL_DAILY_ON = true;
cfgOnApply(() => {
  const g = cfgGet('mail.gifts', null);
  MAIL_GIFTS = Array.isArray(g) ? rwList(g) : MAIL_DEF_GIFTS;
  MAIL_DAYS = Math.max(1, Math.min(60, Math.floor(cfgNum('mail.days', 7))));
  MAIL_DAILY_ON = Number(cfgGet('mail.daily', 1)) !== 0 && MAIL_GIFTS.length > 0;
});
let mailState = (() => { const s = loadJSON('mail_state'); return { first: typeof s.first === 'string' ? s.first : '', claimed: (s.claimed && typeof s.claimed === 'object') ? s.claimed : {}, letters: (s.letters && typeof s.letters === 'object') ? s.letters : {} }; })();
const mailSave = () => saveJSON('mail_state', mailState);
const mailDayKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const mailDayText = k => k.split('-').reverse().join('/');
// Các ngày có thư (mới nhất trước): từ ngày đầu chơi tới hôm nay, tối đa MAIL_DAYS ngày
function mailDays() {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  if (!mailState.first) { mailState.first = mailDayKey(today); mailSave(); }
  if (!MAIL_DAILY_ON) return [];
  const days = [];
  for (let i = 0; i < MAIL_DAYS; i++) { const d = new Date(today); d.setDate(d.getDate() - i); const k = mailDayKey(d); if (k >= mailState.first) days.push(k); }
  return days;
}
// Thư có danh sách uids chỉ hiện cho đúng những tài khoản đó (admin gửi riêng); không có uids = gửi cho tất cả
const mailForMe = l => !Array.isArray(l.uids) || !l.uids.length || (typeof clUser !== 'undefined' && !!clUser && l.uids.includes(clUser.uid));
// Thư admin gửi còn trong thời hạn
function mailLetters() {
  const now = Date.now(), L = cfgGet('mail.letters', []);
  return (Array.isArray(L) ? L : []).filter(l => l && l.id && rwList(l.gifts).length && (!l.from || now >= l.from) && (!l.to || now <= l.to) && mailForMe(l));
}
const mailLetterOpen = () => mailLetters().filter(l => !mailState.letters[l.id]);
const mailUnclaimed = () => mailDays().filter(k => !mailState.claimed[k]);
/* ----- Thư riêng do admin gửi cho TỪNG người chơi: Firestore mail_inbox/{uid}/msgs/{id} = { title, body, gifts, t, exp, claimed } -----
   Nhận = đánh dấu claimed trên máy chủ TRƯỚC (luật Firestore chỉ cho false -> true) rồi mới cộng quà => không nhận trùng dù mở 2 máy. */
let mailInbox = [], mailInboxBusy = false;
async function mailInboxFetch() {
  if (mailInboxBusy || typeof clUser === 'undefined' || !clUser || typeof clDb === 'undefined' || !clDb) return;
  mailInboxBusy = true;
  try {
    const s = await clDb.collection('mail_inbox').doc(clUser.uid).collection('msgs').get(), now = Date.now(), L = [];
    s.forEach(d => { const x = d.data() || {}; if (x.exp && now > x.exp && !x.claimed) return; if (!rwList(x.gifts).length) return; L.push({ id: d.id, title: x.title || '', body: x.body || '', gifts: rwList(x.gifts), t: x.t || 0, claimed: !!x.claimed }); });
    L.sort((a, b) => b.t - a.t); mailInbox = L.slice(0, 40);
  } catch (e) { /* mất mạng / chưa có quyền: giữ danh sách cũ */ }
  mailInboxBusy = false; updateMailBadge();
  const m = document.getElementById('mail-modal'); if (m && m.style.display === 'flex') renderMail();
}
const mailInboxOpen = () => mailInbox.filter(m => !m.claimed);
async function mailClaimInbox(id) {
  const m = mailInbox.find(x => x.id === id); if (!m || m.claimed || mailInboxBusy) return;
  mailInboxBusy = true;
  try { await clDb.collection('mail_inbox').doc(clUser.uid).collection('msgs').doc(id).update({ claimed: true, claimedAt: Date.now() }); }
  catch (e) { mailInboxBusy = false; if (typeof scToast === 'function') scToast('Không nhận được thư (mất mạng hoặc đã nhận rồi)'); mailInboxFetch(); return; }
  mailInboxBusy = false; m.claimed = true; mailDone(rwGrantAll(m.gifts));
}
function updateMailBadge() {
  const el = document.getElementById('mail-badge'); if (!el) return;
  const n = mailUnclaimed().length + mailLetterOpen().length + mailInboxOpen().length; el.innerText = n; el.style.display = n ? 'flex' : 'none';
}
function mailDone(got) { mailSave(); renderMail(); updateMailBadge(); if (got && typeof scToast === 'function') scToast('🎁 Nhận: ' + got); if (typeof clPush === 'function') { try { clPush(); } catch (e) {} } }
function mailClaim(k) {
  if (mailState.claimed[k] || !mailDays().includes(k)) return;
  mailState.claimed[k] = true; mailDone(rwGrantAll(MAIL_GIFTS));
}
function mailClaimAll() {
  const list = mailUnclaimed(); if (!list.length) return;
  const got = []; list.forEach(k => { mailState.claimed[k] = true; got.push(rwGrantAll(MAIL_GIFTS)); });
  mailDone(got[0] ? got.length + ' ngày quà hằng ngày' : '');
}
function mailClaimLetter(id) {
  const l = mailLetters().find(x => x.id === id); if (!l || mailState.letters[id]) return;
  mailState.letters[id] = true; mailDone(rwGrantAll(l.gifts));
}
const mailEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function renderMail() {
  const days = mailDays(), un = days.filter(k => !mailState.claimed[k]), letters = mailLetters(), inbox = mailInbox;
  document.getElementById('mail-note').innerHTML = (MAIL_DAILY_ON ? `Mỗi ngày nhận <b>${rwTextAll(MAIL_GIFTS)}</b> miễn phí. Thư chưa nhận được giữ ${MAIL_DAYS} ngày.` : 'Hiện không có quà hằng ngày.') + (un.length > 1 ? ` <button class="btn-attack" style="padding:4px 12px;font-size:12px;margin-left:6px" onclick="mailClaimAll()">Nhận tất cả</button>` : '');
  const P = inbox.map(l => {
    const got = !!l.claimed;
    return `<div class="bm-row ${got ? 'done' : ''}"><div class="bm-ico">${got ? '📭' : '💌'}</div><div class="bm-info"><b>${mailEsc(l.title || 'Quà từ quản trị viên')}</b><small>${l.body ? mailEsc(l.body) + '<br>' : ''}+ ${rwTextAll(l.gifts)}</small></div>` +
      (got ? '<div class="bm-qty">Đã nhận ✔</div>' : `<button class="btn-attack" onclick="mailClaimInbox('${mailEsc(l.id)}')">Nhận</button>`) + '</div>';
  }).join('');
  const L = letters.map(l => {
    const got = !!mailState.letters[l.id];
    return `<div class="bm-row ${got ? 'done' : ''}"><div class="bm-ico">${got ? '📭' : '📩'}</div><div class="bm-info"><b>${mailEsc(l.title || 'Thư từ hệ thống')}</b><small>${l.body ? mailEsc(l.body) + '<br>' : ''}+ ${rwTextAll(l.gifts)}</small></div>` +
      (got ? '<div class="bm-qty">Đã nhận ✔</div>' : `<button class="btn-attack" onclick="mailClaimLetter('${mailEsc(l.id)}')">Nhận</button>`) + '</div>';
  }).join('');
  const D = days.map(k => {
    const got = !!mailState.claimed[k];
    return `<div class="bm-row ${got ? 'done' : ''}"><div class="bm-ico">${got ? '📭' : '🎁'}</div><div class="bm-info"><b>Quà hằng ngày</b><small>Ngày ${mailDayText(k)} • +${rwTextAll(MAIL_GIFTS)}</small></div>` +
      (got ? '<div class="bm-qty">Đã nhận ✔</div>' : `<button class="btn-attack" onclick="mailClaim('${k}')">Nhận</button>`) + '</div>';
  }).join('');
  document.getElementById('mail-list').innerHTML = (P + L + D) || '<div class="set-note" style="text-align:center">Hộp thư trống.</div>';
}
function openMail() { mailInboxFetch(); renderMail(); document.getElementById('mail-modal').style.display = 'flex'; }
function closeMail() { document.getElementById('mail-modal').style.display = 'none'; }
updateMailBadge();
setInterval(updateMailBadge, 60000);
setInterval(() => { if (document.visibilityState === 'visible') mailInboxFetch(); }, 30000);   // thư mới từ admin: kiểm tra 30 giây / lần
setTimeout(mailInboxFetch, 4000); setTimeout(mailInboxFetch, 12000);   // sau khi đăng nhập đám mây xong   // qua nửa đêm: thư mới của ngày mới hiện chấm đỏ

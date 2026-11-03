/* KHUNG CHAT GIỮA CÁC TÀI KHOẢN ONLINE (Thẻ Tháng + Bang Hội)
   Firestore: collection chat_messages {uid, name, text, t} — cần quy tắc ở README */
let chUnsub = null, chMsgs = [];
function scToast(t) { const d = document.createElement('div'); d.className = 'sc-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 1800); }
function chEsc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function chRender() {
  const el = document.getElementById('chat-list'); if (!el) return;
  const me = clUser && clUser.uid;
  el.innerHTML = chMsgs.length ? chMsgs.map(m => {
    const d = new Date(m.t || Date.now()), tm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return `<div class="ch-msg ${m.uid === me ? 'me' : ''}"><b>${chEsc(m.name || '?')}</b>${chEsc(m.text)}<small>${tm}</small></div>`;
  }).join('') : '<div class="ch-empty">Chưa có tin nhắn nào. Hãy là người nói trước!</div>';
  el.scrollTop = el.scrollHeight;
}
function openChat() {
  document.getElementById('chat-modal').style.display = 'flex';
  const note = document.getElementById('chat-note');
  if (!clDb || !clUser) { note.textContent = 'Cần đăng nhập tài khoản đám mây (và có mạng) để trò chuyện với người chơi khác.'; chMsgs = []; chRender(); return; }
  note.textContent = 'Kênh chung của tất cả người chơi đang online.';
  if (chUnsub) chUnsub();
  chUnsub = clDb.collection('chat_messages').orderBy('t', 'desc').limit(50).onSnapshot(s => {
    chMsgs = s.docs.map(d => d.data()).reverse(); chRender();
  }, e => { note.textContent = (e && e.code === 'permission-denied') ? 'Chưa cấu hình quy tắc Firestore cho chat (xem README).' : 'Không tải được tin nhắn.'; });
}
function closeChat() { document.getElementById('chat-modal').style.display = 'none'; if (chUnsub) { chUnsub(); chUnsub = null; } }
let chLast = 0;
async function sendChat() {
  const inp = document.getElementById('chat-input'), text = inp.value.trim().slice(0, 200);
  if (!text) return;
  if (!clDb || !clUser) { scToast('Chưa đăng nhập đám mây'); return; }
  if (Date.now() - chLast < 1500) { scToast('Gửi chậm lại một chút'); return; }
  chLast = Date.now(); inp.value = '';
  try { await clDb.collection('chat_messages').add({ uid: clUser.uid, name: pvName(), text, t: Date.now() }); }
  catch (e) { scToast('Gửi thất bại'); }
}

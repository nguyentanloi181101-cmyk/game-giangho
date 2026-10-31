/* LƯU ĐÁM MÂY (Firebase): đăng ký / đăng nhập, đồng bộ, đăng đội hình PVP
   (tách từ index.html cũ — script) */

/* ===== LƯU ĐÁM MÂY (FIREBASE) - đăng nhập tên + mật khẩu, đồng bộ mọi máy / mọi web ===== */
// >>> DÁN CẤU HÌNH FIREBASE CỦA BẠN VÀO ĐÂY (xem hướng dẫn) <<<
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOWlrfsWTx0HNWQAYvPHw7fWHlFP3UNu4",
  authDomain: "game-118e8.firebaseapp.com",
  projectId: "game-118e8",
  storageBucket: "game-118e8.firebasestorage.app",
  messagingSenderId: "612432319937",
  appId: "1:612432319937:web:0e2ba2a7ecc032d8150b40"
};
const CL_DOMAIN = '@mhgh-game.app';
const CL_SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const _lsGet = Storage.prototype.getItem, _lsSet = Storage.prototype.setItem, _lsDel = Storage.prototype.removeItem;
let clAuth = null, clDb = null, clUser = null, clTimer = null, clDirty = false, clAsk = false, clBusy = false, clInited = false, clFresh = false, clWiping = false, clReady = '';
const clOwner = () => { try { return _lsGet.call(localStorage, 'cloud_owner') || ''; } catch (e) { return ''; } };
const clSetOwner = u => { try { _lsSet.call(localStorage, 'cloud_owner', u); } catch (e) {} };
function clReadyOk(uid) { clReady = uid; clSetOwner(uid); if (clDirty && !clTimer) clTimer = setTimeout(clPush, 3000); }
const clCfgOk = () => !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
const clLocalT = () => Number(_lsGet.call(localStorage, 'cloud_local_t')) || 0;
const clHasLocal = () => SV_KEYS.some(k => _lsGet.call(localStorage, k) !== null);

function clMsg(t, ok) { ['cl-msg', 'lg-msg', 'rg-msg'].forEach(id => { const e = document.getElementById(id); if (!e) return; e.style.color = ok === false ? '#f87171' : '#4ade80'; e.innerText = t || ''; }); }

// Mỗi khi game ghi dữ liệu -> đánh dấu thay đổi và tự đẩy lên đám mây sau 10 giây (không bị dời lại nếu đã hẹn giờ)
function clTouch() {
  try { _lsSet.call(localStorage, 'cloud_local_t', String(Date.now())); } catch (e) {}
  clDirty = true;
  if (clUser && !clTimer) { clTimer = setTimeout(clPush, 10000); }
}
Storage.prototype.setItem = function (k, v) { if (clWiping && this === localStorage && SV_KEYS.indexOf(k) >= 0) return; _lsSet.call(this, k, v); if (this === localStorage && SV_KEYS.indexOf(k) >= 0) clTouch(); };
Storage.prototype.removeItem = function (k) { if (clWiping && this === localStorage && SV_KEYS.indexOf(k) >= 0) return; _lsDel.call(this, k); if (this === localStorage && SV_KEYS.indexOf(k) >= 0) clTouch(); };

function clLoadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(s); });
}
async function clInit() {
  if (clInited) return; clInited = true;
  clRender();
  if (!clCfgOk()) { lgOfflineShow(); return; }
  try {
    await clLoadScript(CL_SDK + 'firebase-app-compat.js');
    await Promise.all([clLoadScript(CL_SDK + 'firebase-auth-compat.js'), clLoadScript(CL_SDK + 'firebase-firestore-compat.js')]);
    firebase.initializeApp(FIREBASE_CONFIG);
    clAuth = firebase.auth(); clDb = firebase.firestore();
    clAuth.onAuthStateChanged(u => { clUser = u; clRender(); lgUpdate(u); if (u) clSync(); });
  } catch (e) { clMsg('Không tải được Firebase (mất mạng hoặc bị chặn). Game vẫn chơi bình thường.', false); lgOfflineShow(); }
}

function clErr(e) {
  const c = (e && e.code) || '';
  if (c === 'auth/email-already-in-use') return 'Tên tài khoản này đã có người dùng.';
  if (c === 'auth/invalid-credential' || c === 'auth/wrong-password' || c === 'auth/user-not-found' || c === 'auth/invalid-login-credentials') return 'Sai tên tài khoản hoặc mật khẩu.';
  if (c === 'auth/weak-password') return 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
  if (c === 'auth/network-request-failed') return 'Mất kết nối mạng.';
  if (c === 'auth/too-many-requests') return 'Thử quá nhiều lần, hãy đợi một lát.';
  if (c === 'auth/operation-not-allowed') return 'Chưa bật đăng nhập Email/Password trong Firebase.';
  if (c === 'permission-denied') return 'Chưa cấu hình quy tắc Firestore (xem hướng dẫn).';
  return 'Lỗi: ' + (c || (e && e.message) || 'không rõ');
}
function clCred(pfx) {
  pfx = pfx || 'cl';
  const u = (document.getElementById(pfx + '-user').value || '').trim().toLowerCase();
  const p = document.getElementById(pfx + '-pass').value || '';
  if (!/^[a-z0-9_]{3,20}$/.test(u)) { clMsg('Tên tài khoản: 3-20 ký tự, chỉ chữ thường không dấu, số, dấu _', false); return null; }
  if (p.length < 6) { clMsg('Mật khẩu tối thiểu 6 ký tự.', false); return null; }
  return { email: u + CL_DOMAIN, pass: p, name: u };
}
async function clRegister(pfx) {
  const c = clCred(pfx); if (!c) return;
  if (!clAuth) { clMsg('Đang kết nối máy chủ, vui lòng thử lại sau giây lát.', false); return; }
  if (clHasLocal() && !confirm('Đăng ký tài khoản mới sẽ CHƠI LẠI TỪ ĐẦU.\nDữ liệu đang có trên máy này sẽ bị xóa (hãy đăng nhập tài khoản cũ để lưu trước nếu cần).\n\nTiếp tục đăng ký?')) return;
  clMsg('Đang tạo tài khoản...'); clFresh = true;
  try { await clAuth.createUserWithEmailAndPassword(c.email, c.pass); clMsg('✔ Đã tạo tài khoản mới, đang bắt đầu lại từ đầu...'); }
  catch (e) { clFresh = false; clMsg(clErr(e), false); }
}
// Tài khoản vừa đăng ký: xóa dữ liệu cũ trên máy rồi tải lại để chơi từ đầu (không đẩy dữ liệu cũ lên tài khoản mới)
function clStartFresh(uid) {
  clWiping = true;
  clearTimeout(clTimer); clTimer = null; clDirty = false;
  try {
    SV_KEYS.forEach(k => _lsDel.call(localStorage, k));
    _lsSet.call(localStorage, 'cloud_local_t', String(Date.now()));
    if (uid) _lsSet.call(localStorage, 'cloud_owner', uid);
  } catch (e) {}
  setTimeout(() => location.reload(), 600);
}
async function clLogin(pfx) {
  const c = clCred(pfx); if (!c) return;
  if (!clAuth) { clMsg('Đang kết nối máy chủ, vui lòng thử lại sau giây lát.', false); return; }
  clMsg('Đang đăng nhập...'); clAsk = true;
  try { await clAuth.signInWithEmailAndPassword(c.email, c.pass); }
  catch (e) { clAsk = false; clMsg(clErr(e), false); }
}
async function clLogout() {
  if (!clAuth) return;
  let ok = true;
  try { ok = await clPush(); } catch (e) { ok = false; }
  if (!ok && !confirm('Không lưu được tiến trình lên đám mây (mất mạng?).\nĐăng xuất bây giờ sẽ MẤT phần chưa lưu của tài khoản này.\n\nVẫn đăng xuất?')) return;
  clWiping = true; clearTimeout(clTimer); clTimer = null; clDirty = false;
  try { await clAuth.signOut(); } catch (e) { clWiping = false; clMsg(clErr(e), false); return; }
  // dữ liệu thuộc về tài khoản đã nằm trên đám mây -> xóa khỏi máy để tài khoản khác không dùng chung
  try { SV_KEYS.forEach(k => _lsDel.call(localStorage, k)); _lsDel.call(localStorage, 'cloud_owner'); _lsDel.call(localStorage, 'cloud_local_t'); } catch (e) {}
  location.reload();
}

async function clPush() {
  if (!clUser || !clDb) return false;
  clearTimeout(clTimer); clTimer = null;
  if (clReady !== clUser.uid) return false;   // chưa đồng bộ xong / dữ liệu trên máy không thuộc tài khoản này
  const t = clLocalT() || Date.now();
  try {
    await clDb.collection('saves').doc(clUser.uid).set({ t: t, data: svCollect().data });
    _lsSet.call(localStorage, 'cloud_local_t', String(t)); clDirty = false; clSetOwner(clUser.uid);
    clPublishPvp().catch(() => {});   // cập nhật đội hình Tỷ Võ cho người chơi khác
    clMsg('☁️ Đã lưu lên đám mây ' + new Date().toLocaleTimeString());
    return true;
  } catch (e) { clMsg(clErr(e), false); return false; }
}
// Đăng "ảnh chụp" đội hình Tỷ Võ (chỉ số đã tính đủ trang bị / Bảo Vật / cộng dồn Tỷ Võ) để tài khoản khác đấu được với mình
async function clPublishPvp() {
  if (!clUser || !clDb) return;
  const ids = (team || []).filter(id => heroById(id)); if (!ids.length) return;
  const _tt = (typeof ttMine === 'function' && ttMine()) || null, _bn = _tt ? ttBonus(_tt.pt) : {};
  const tm = ids.map(id => { const s = ttApply(Object.assign({}, heroStats(id, true)), _bn); return { id, hp: s.hp, atk: s.atk, def: s.def, spd: s.spd, dodge: s.dodge, acc: s.acc, crit: s.crit, critDmg: s.critDmg, tough: s.tough, pierce: s.pierce, block: s.block, star: getProg(id).star, sk: skillMult(id) }; });
  const ref = clDb.collection('pvp_players').doc(clUser.uid);
  const data = { name: pvName(), lvl: accLevel, wins: pvpState.wins,
    power: tm.reduce((a, s) => a + unitPower(s), 0), t: Date.now(), team: tm, beast: _tt ? _tt.beast : '', pt: _tt ? _tt.pt : [] };
  const cur = await ref.get();
  if (!cur.exists) { data.rank = await pvpNewKey(); data.rt = Date.now(); }   // tài khoản mới xếp tiếp xuống cuối bảng; sau đó đổi qua pvpRankCloud
  await ref.set(data, { merge: true });
}
function clApplyCloud(cloud, uid) {
  try {
    SV_KEYS.forEach(k => _lsDel.call(localStorage, k));
    Object.keys(cloud.data || {}).forEach(k => { if (SV_KEYS.includes(k)) _lsSet.call(localStorage, k, cloud.data[k]); });
    _lsSet.call(localStorage, 'cloud_local_t', String(cloud.t || 0));
    if (uid) _lsSet.call(localStorage, 'cloud_owner', uid);
  } catch (e) { clMsg('Không ghi được dữ liệu vào máy này.', false); return; }
  clMsg('✔ Đã tải dữ liệu từ đám mây, đang tải lại game...');
  setTimeout(() => location.reload(), 500);
}
// Đồng bộ theo TÀI KHOẢN: dữ liệu trên máy có "chủ" (cloud_owner). Khác chủ -> luôn lấy dữ liệu đám mây của tài khoản đang đăng nhập
// (không bao giờ đẩy dữ liệu của tài khoản khác lên). Cùng chủ -> bản nào MỚI HƠN thì thắng.
async function clSync() {
  if (!clUser || !clDb || clBusy) return; clBusy = true;
  const ask = clAsk; clAsk = false;
  const fresh = clFresh; clFresh = false;
  const uid = clUser.uid;
  if (fresh) { clStartFresh(uid); clBusy = false; return; }
  try {
    const snap = await clDb.collection('saves').doc(uid).get();
    const cloud = snap.exists ? snap.data() : null, lt = clLocalT(), has = clHasLocal();
    let owner = clOwner();
    if (!owner && !ask && has) owner = uid;   // phiên đăng nhập cũ (trước khi có cơ chế gắn chủ): coi dữ liệu máy là của tài khoản này
    if (owner && owner !== uid) {             // dữ liệu trên máy là của tài khoản khác
      if (cloud) clApplyCloud(cloud, uid); else clStartFresh(uid);
    }
    else if (!cloud) { clReadyOk(uid); if (has) await clPush(); else clMsg('✔ Đã đăng nhập. Chưa có dữ liệu trên đám mây.'); }
    else if (owner !== uid) { clApplyCloud(cloud, uid); }   // máy chưa thuộc ai: ưu tiên dữ liệu đã lưu của tài khoản
    else if (cloud.t === lt) { clReadyOk(uid); clMsg('☁️ Dữ liệu đã đồng bộ.'); }
    else if (!has || cloud.t > lt) { clApplyCloud(cloud, uid); }
    else { clReadyOk(uid); await clPush(); }
  } catch (e) { clMsg(clErr(e), false); }
  clBusy = false;
}

function clRender() {
  try { applyPlayerName(); } catch (e) {}
  const box = document.getElementById('cl-box'); if (!box) return;
  if (!clCfgOk()) {
    box.innerHTML = '<div class="cl-status">⚠️ Chưa cấu hình Firebase. Mở file game, tìm <b>FIREBASE_CONFIG</b> và dán thông tin dự án Firebase của bạn vào. Khi chưa cấu hình, game vẫn lưu trên máy như bình thường.</div>';
  } else if (clUser) {
    const n = (clUser.email || '').replace(CL_DOMAIN, '');
    box.innerHTML = '<div class="cl-status">Đang đăng nhập: <b>' + n + '</b><br>Tiến trình tự động lưu lên đám mây sau 10 giây kể từ khi thay đổi.</div>' +
      '<div class="md-acts"><button class="btn-attack" onclick="clPush()">☁️ Lưu ngay</button><button class="btn-close-battle" onclick="clLogout()">Đăng xuất</button></div>';
  } else {
    box.innerHTML = '<div class="cl-status">Tạo tài khoản (hoặc đăng nhập) để chơi tiếp trên mọi máy và mọi web.</div>' +
      '<input class="cl-in" id="cl-user" placeholder="Tên tài khoản (a-z, 0-9, _)" autocapitalize="none" autocomplete="username" maxlength="20">' +
      '<input class="cl-in" id="cl-pass" type="password" placeholder="Mật khẩu (từ 6 ký tự)" autocomplete="current-password">' +
      '<div class="md-acts"><button class="btn-attack" onclick="clLogin()">Đăng nhập</button><button class="btn-close-battle" onclick="clRegister()">Đăng ký</button></div>';
  }
}
// Khi rời trang / chuyển tab: đẩy dữ liệu chưa lưu
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && clDirty && clUser) clPush(); });
window.addEventListener('pagehide', () => { if (clDirty && clUser) clPush(); });

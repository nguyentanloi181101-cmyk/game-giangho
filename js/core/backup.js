/* SAO LƯU / CHUYỂN DỮ LIỆU GIỮA CÁC MÁY
   (tách từ index.html cũ — script) */

/* ===== SAO LƯU / CHUYỂN DỮ LIỆU GIỮA CÁC MÁY ===== */
const SV_KEYS = ['pve_progress','team_ids','hero_stat_ov','hero_role','hero_prog','keys_claimed','acc_level',
                 'player_name','ts_bag','eq_bag','eq_lv','eq_mount','eq_reward_done','auto_battle','pvp_state','audio_set','sta_state',
                 'gold_val','silver_val','rice_val','mail_state','ham_claimed','ham_spent','hero_shards','rec_state','guild_state','quest_state'];
function svMsg(t, ok) { const e = document.getElementById('sv-msg'); e.style.color = ok === false ? '#f87171' : '#4ade80'; e.innerText = t; }
function svCollect() {
  const d = {};
  SV_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v !== null) d[k] = v; } catch (e) {} });
  return { game: 'pve-heroes', v: 1, t: Date.now(), data: d };
}
function svEncode(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
function svDecode(s) {
  s = (s || '').trim();
  if (!s) throw new Error('empty');
  const o = s[0] === '{' ? JSON.parse(s) : JSON.parse(decodeURIComponent(escape(atob(s))));
  if (!o || o.game !== 'pve-heroes' || !o.data) throw new Error('bad');
  return o;
}
function svExportCode() {
  const code = svEncode(svCollect());
  const box = document.getElementById('sv-box'); box.value = code; box.select();
  const done = () => svMsg('✔ Đã tạo mã và copy. Dán mã này vào máy khác (mục Nhập mã).');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, () => svMsg('✔ Đã tạo mã. Hãy copy thủ công trong ô trên.'));
  else { try { document.execCommand('copy'); } catch (e) {} svMsg('✔ Đã tạo mã. Hãy copy thủ công trong ô trên.'); }
}
function svExportFile() {
  const blob = new Blob([JSON.stringify(svCollect())], { type: 'application/json' });
  const a = document.createElement('a');
  const d = new Date(), z = n => String(n).padStart(2, '0');
  a.href = URL.createObjectURL(blob);
  a.download = `save-game-${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  svMsg('✔ Đã tải file lưu. Chép file này sang máy khác rồi chọn "Nhập từ file".');
}
function svApply(o) {
  if (!confirm('Dữ liệu hiện tại trên máy này sẽ bị GHI ĐÈ bằng dữ liệu đã lưu. Tiếp tục?')) return;
  try {
    SV_KEYS.forEach(k => localStorage.removeItem(k));
    Object.keys(o.data).forEach(k => { if (SV_KEYS.includes(k)) localStorage.setItem(k, o.data[k]); });
  } catch (e) { svMsg('Không ghi được dữ liệu (trình duyệt chặn lưu trữ?).', false); return; }
  svMsg('✔ Nhập thành công, đang tải lại game...');
  setTimeout(() => location.reload(), 600);
}
function svImportCode() {
  try { svApply(svDecode(document.getElementById('sv-box').value)); }
  catch (e) { svMsg('Mã không hợp lệ. Hãy dán đúng toàn bộ mã đã xuất.', false); }
}
function svImportFile(inp) {
  const f = inp.files && inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { try { svApply(svDecode(String(r.result))); } catch (e) { svMsg('File không hợp lệ.', false); } inp.value = ''; };
  r.readAsText(f);
}

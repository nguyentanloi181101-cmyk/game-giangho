/* Thần Thú ra trận: bệ đứng 2 góc trên + Phụ Thể cộng % chỉ số theo từng tướng */
// tên phụ thể -> chỉ số tăng (mapping tạm, có thể chỉnh)
const TT_FXMAP = { 'Cường Công': 'atk', 'Sát Lục': 'atk', 'Thần Thuẫn': 'hp', 'Bá Thuẫn': 'hp', 'Thần Huyết': 'hp', 'Hoạt Khí': 'hp', 'Tái Sinh': 'hp',
  'Chiến Thuẫn': 'def', 'Ngự Thuẫn': 'def', 'Trợ Thuẫn': 'def', 'Kỳ Thuẫn': 'block', 'Huyết Bạo': 'crit', 'Kích Sát': 'crit', 'Bạo Tức': 'critDmg', 'Bạo Nộ': 'critDmg',
  'Kích Phá': 'pierce', 'Tinh Chuẩn': 'acc', 'Ẩn Thân': 'dodge', 'Tàn Ảnh': 'dodge', 'Cấp Tốc': 'spd', 'Thần Tốc': 'spd', 'Trợ Tốc': 'spd', 'Hộ Tốc': 'spd', 'Gia Tốc': 'spd' };
// danh sách phụ thể đang có: hiệu quả của thần thú + các ô đã lắp  -> [{n, v, pt?}]
function ttPtList(cur, slotsArr, star) {
  const b = TT_BEASTS.find(x => x[0] === cur); if (!b) return [];
  const out = (b[4] || []).map(e => ({ n: e[0], v: e[1], pts: !!e[2] }));
  const open = ttSlotsOpen(b, { star: star || 1 });
  (slotsArr || []).slice(0, open).forEach(sl => { if (sl && sl.n) out.push({ n: sl.n, v: [4, 6, 8, 12, 16][sl.q - 1], pts: false }); });
  return out;
}
function ttMine() {
  try { const s = ttSt(), c = ttCur(s); if (!c) return null; return { beast: s.tt.cur, pt: ttPtList(s.tt.cur, s.tt.slots[s.tt.cur], c.star) }; } catch (e) { return null; }
}
// cộng dồn theo chỉ số: % hoặc điểm (Kích Phá)
function ttBonus(pt) {
  const b = {}; (pt || []).forEach(p => { const k = TT_FXMAP[p.n]; if (!k) return; const o = b[k] = b[k] || { pct: 0, pts: 0 }; if (p.pts) o.pts += p.v; else o.pct += p.v; });
  return b;
}
// áp lên 1 bộ chỉ số (unit hoặc snapshot): % của chính chỉ số tướng đó
function ttApply(u, bonus) {
  Object.keys(bonus || {}).forEach(k => { const o = bonus[k], v = Number(u[k]) || 0; u[k] = k === 'spd' ? +(v * (1 + o.pct / 100)).toFixed(2) : Math.round(v * (1 + o.pct / 100) + o.pts); });
  return u;
}
const ttPtIco = n => TT_PT_ICO[TT_PT.indexOf(n)] || '✨';
function ttSetupUI(my, foe) {
  const ar = document.getElementById('battle-arena'); if (!ar) return;
  ar.querySelectorAll('.bf-bst, .bf-ptrow').forEach(e => e.remove());
  [[my, 'l'], [foe, 'r']].forEach(([x, side]) => {
    if (!x) return;
    const st = document.createElement('div'); st.className = 'bf-bst ' + side;
    st.innerHTML = `<div class="bf-bst-sp">${ttImg(x.beast)}</div><i class="bf-bst-pl"></i>`; ar.appendChild(st);
    if (x.pt && x.pt.length) { const r = document.createElement('div'); r.className = 'bf-ptrow ' + side;
      r.innerHTML = x.pt.map(p => `<span title="${p.n} +${p.v}${p.pts ? '' : '%'}">${ttPtIco(p.n)}</span>`).join(''); ar.appendChild(r); }
  });
}
// đối thủ giả (bot / PVE): thần thú ngẫu nhiên cố định theo tên, chỉ để trang trí
function ttFake(seed) { let h = 0; String(seed || '').split('').forEach(c => h = (h * 31 + c.charCodeAt(0)) | 0); const b = TT_BEASTS[Math.abs(h) % 8]; return { beast: b[0], pt: [], deco: true }; }

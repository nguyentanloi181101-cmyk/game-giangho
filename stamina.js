/* THỂ LỰC và VIÊN THỂ LỰC
   (tách từ index.html cũ — script) */

    // ================= THỂ LỰC & VIÊN THỂ LỰC =================
    // • PvE: mỗi TRẬN tốn 1 thể lực (1 Bàn = 4 trận → tốn 4, trừ ngay khi vào Bàn) • 1 thể lực hồi sau 1 phút, hồi tối đa tới 200
    // • Đánh xong 1 Bàn nhận 10 Viên Thể Lực vào Túi đồ, mỗi viên +30 thể lực • PvP không tốn thể lực, không giới hạn lượt
    const STA_MAX = 200, STA_REGEN_MS = 60000, STA_PER_WAVE = 1, STA_WAVES = 4, PILL_PER_CLEAR = 10, PILL_STA = 30;
    let staState = (() => {
      const s = loadJSON('sta_state'), now = Date.now();
      return { v: Number.isFinite(s.v) ? Math.max(0, Math.floor(s.v)) : STA_MAX, t: Number(s.t) || now, pills: Math.max(0, Math.floor(s.pills) || 0) };
    })();
    const staSave = () => saveJSON('sta_state', staState);
    function staTick() {
      const now = Date.now();
      if (staState.v >= STA_MAX) { staState.t = now; return; }
      const n = Math.floor((now - staState.t) / STA_REGEN_MS);
      if (n > 0) {
        staState.v = Math.min(STA_MAX, staState.v + n);
        staState.t = staState.v >= STA_MAX ? now : staState.t + n * STA_REGEN_MS;
        staSave();
      }
    }
    function staRender() {
      staTick();
      const v = document.getElementById('sta-val'), t = document.getElementById('sta-title');
      if (v) v.innerText = staState.v + '/' + STA_MAX;
      if (t) {
        if (staState.v >= STA_MAX) t.innerText = 'Thể Lực Đầy';
        else { const rest = Math.max(0, STA_REGEN_MS - (Date.now() - staState.t)); t.innerText = 'Thể Lực • +1 sau ' + Math.ceil(rest / 1000) + 's'; }
      }
    }
    function staSpend(n) {
      staTick();
      if (staState.v < n) return false;
      if (staState.v >= STA_MAX) staState.t = Date.now();   // bắt đầu tính giờ hồi từ lúc tụt dưới mức đầy
      staState.v -= n; staSave(); staRender();
      return true;
    }
    function grantPills() {
      staState.pills += PILL_PER_CLEAR; staSave();
      if (document.getElementById('equip-modal').style.display === 'flex') renderEquip();
      return `\n\n💊 Nhận ${PILL_PER_CLEAR} Viên Thể Lực vào Túi đồ (có ${staState.pills} viên)!`;
    }
    function usePills(n) {
      n = Math.min(n, staState.pills);
      if (n < 1) return;
      staTick();
      if (staState.v >= STA_MAX) staState.t = Date.now();
      staState.pills -= n; staState.v += n * PILL_STA; staSave();
      staRender(); renderEquip();
    }
    function pillPanelHtml() {
      const c = staState.pills;
      return `<div class="pill-box"><div class="pb-info">💊 <b>Viên Thể Lực</b> × ${c}<br><small>Mỗi viên +${PILL_STA} thể lực • Hiện có ${staState.v}/${STA_MAX}</small></div>` +
        `<button ${c < 1 ? 'disabled' : ''} onclick="usePills(1)">Dùng 1</button><button ${c < 1 ? 'disabled' : ''} onclick="usePills(10)">Dùng 10</button></div>`;
    }
    setInterval(staRender, 1000); staRender();

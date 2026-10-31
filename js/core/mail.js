/* HỘP THƯ: quà hằng ngày 10.000 vàng
   (viết mới) */

    // Mỗi ngày có 1 thư quà 10.000 vàng. Thư chưa nhận được giữ lại tối đa 7 ngày gần nhất.
    const MAIL_GOLD = 10000, MAIL_DAYS = 7;
    let mailState = (() => { const s = loadJSON('mail_state'); return { first: typeof s.first === 'string' ? s.first : '', claimed: (s.claimed && typeof s.claimed === 'object') ? s.claimed : {} }; })();
    const mailSave = () => saveJSON('mail_state', mailState);
    const mailDayKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const mailDayText = k => k.split('-').reverse().join('/');
    // Các ngày có thư (mới nhất trước): từ ngày đầu chơi tới hôm nay, tối đa 7 ngày
    function mailDays() {
      const today = new Date(); today.setHours(12, 0, 0, 0);
      if (!mailState.first) { mailState.first = mailDayKey(today); mailSave(); }
      const days = [];
      for (let i = 0; i < MAIL_DAYS; i++) { const d = new Date(today); d.setDate(d.getDate() - i); const k = mailDayKey(d); if (k >= mailState.first) days.push(k); }
      return days;
    }
    const mailUnclaimed = () => mailDays().filter(k => !mailState.claimed[k]);
    function updateMailBadge() {
      const el = document.getElementById('mail-badge'); if (!el) return;
      const n = mailUnclaimed().length; el.innerText = n; el.style.display = n ? 'flex' : 'none';
    }
    function mailClaim(k) {
      if (mailState.claimed[k] || !mailDays().includes(k)) return;
      mailState.claimed[k] = true; gold += MAIL_GOLD; goldSave(); mailSave();
      renderMail(); updateMailBadge();
    }
    function mailClaimAll() {
      const list = mailUnclaimed(); if (!list.length) return;
      list.forEach(k => { mailState.claimed[k] = true; }); gold += MAIL_GOLD * list.length; goldSave(); mailSave();
      renderMail(); updateMailBadge();
    }
    function renderMail() {
      const days = mailDays(), un = days.filter(k => !mailState.claimed[k]);
      document.getElementById('mail-note').innerHTML = `Mỗi ngày nhận <b>${fmtN(MAIL_GOLD)} <img class="gi-g" src="assets/images/items/thoi-vang.svg" alt="vàng"> vàng</b> miễn phí. Thư chưa nhận được giữ ${MAIL_DAYS} ngày.` + (un.length > 1 ? ` <button class="btn-attack" style="padding:4px 12px;font-size:12px;margin-left:6px" onclick="mailClaimAll()">Nhận tất cả</button>` : '');
      document.getElementById('mail-list').innerHTML = days.map(k => {
        const got = !!mailState.claimed[k];
        return `<div class="bm-row ${got ? 'done' : ''}"><div class="bm-ico">${got ? '📭' : '🎁'}</div><div class="bm-info"><b>Quà hằng ngày</b><small>Ngày ${mailDayText(k)} • +${fmtN(MAIL_GOLD)} <img class="gi-g" src="assets/images/items/thoi-vang.svg" alt="vàng"> vàng</small></div>` +
          (got ? '<div class="bm-qty">Đã nhận ✔</div>' : `<button class="btn-attack" onclick="mailClaim('${k}')">Nhận</button>`) + '</div>';
      }).join('');
    }
    function openMail() { renderMail(); document.getElementById('mail-modal').style.display = 'flex'; }
    function closeMail() { document.getElementById('mail-modal').style.display = 'none'; }
    updateMailBadge();
    setInterval(updateMailBadge, 60000);   // qua nửa đêm: thư mới của ngày mới hiện chấm đỏ

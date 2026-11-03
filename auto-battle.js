/* TRẬN ĐẤU: chế độ TỰ ĐỘNG
   (tách từ index.html cũ — script) */

   // Lạc Long Quân: +50 nộ & +300% Thủ bản thân cho 2 đồng đội ngẫu nhiên trong 1 hiệp   // Kiều Phong: tổng 350% Công / 3 tầng; chảy máu 3 hiệp, 20% HP hiện tại   // Hoa Mãn Lâu: 7 đòn, mỗi đòn 100% Công

    // ===== TỰ ĐỘNG: tất cả tướng tự đánh thường, đủ nộ (hoặc alwaysUlt) thì tự ulti =====
    let autoMode = (() => { try { return localStorage.getItem('auto_battle') !== '0'; } catch (e) { return true; } })();
    function updateAutoBtn() {
      const b = document.getElementById('btn-auto'); if (!b) return;
      b.innerText = 'Tự Động: ' + (autoMode ? 'BẬT' : 'TẮT');
      b.style.filter = autoMode ? '' : 'grayscale(100%)';
    }
    function toggleAuto() {
      autoMode = !autoMode;
      try { localStorage.setItem('auto_battle', autoMode ? '1' : '0'); } catch (e) {}
      updateAutoBtn();
      if (autoMode) autoStep();
    }
    function autoStep() {
      if (!autoMode) return;
      const tok = battleToken;
      setTimeout(() => {
        if (!autoMode || tok !== battleToken || !isPlayerTurn || busy) return;
        const hs = waveUnits.heroes;
        if (hs.some(h => h.alive && !h.acted && h.rage >= 100 && !ultBlocked(h))) { castAll(); return; }   // ulti đồng loạt
        const i = hs.findIndex(h => h.alive && !h.acted);
        if (i >= 0) heroAct(i, 'normal');                                                  // còn lại đánh thường
        else endTurn();
      }, 350);
    }

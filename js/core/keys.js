/* CHÌA KHÓA 🔑 và cấp tài khoản
   (tách từ index.html cũ — script) */

    // ---- CHÌA KHÓA: thắng xong 1 Ải (Bàn 10) nhận 1 🔑. Mỗi 🔑 mở thêm 10 cấp cho tướng và trang bị ----
    const KEY_LV = 10, ACC_START = 74;     // cấp acc ban đầu 74; mỗi lần mở khóa +10, tối đa 1000
    let keysClaimed = (() => { let k = 0; try { k = parseInt(localStorage.getItem('keys_claimed')) || 0; } catch (e) {}
      return Math.max(k, (progress.maxStage || 1) - 1); })();   // tổng chìa khóa đã nhận (người chơi cũ tính bù)
    let accLevel = (() => { let v = 0; try { v = parseInt(localStorage.getItem('acc_level')) || 0; } catch (e) {}
      return Math.min(LV_MAX, Math.max(ACC_START, v)); })();
    const keysSpent = () => Math.round((accLevel - ACC_START) / KEY_LV);
    const keyCount = () => Math.max(0, keysClaimed - keysSpent());   // chìa khóa còn lại
    // Cấp acc chính là giới hạn cấp của TẤT CẢ tướng và trang bị
    const heroCap = id => Math.max(accLevel, (START_PROG[id] || { lv:1 }).lv);
    const eqCap = () => accLevel;
    function updateKeys() {
      const el = document.getElementById('key-count'); if (el) el.innerText = keyCount();
      const al = document.getElementById('acc-level'); if (al) al.innerText = accLevel;
      const b = document.getElementById('lock-btn');
      if (b) { const full = accLevel >= LV_MAX; b.innerText = full ? '🔓 Max' : '🔒 ' + keyCount() + '🔑'; b.classList.toggle('max', full); b.classList.toggle('glow', !full && keyCount() > 0); }
    }
    function unlockTier() {
      if (accLevel >= LV_MAX) { alert('Cấp acc đã đạt tối đa ' + LV_MAX + '!'); return; }
      if (keyCount() < 1) { alert('🔒 Cần 1 🔑 để mở khóa.\nThắng xong 1 Ải (Bàn 10) để nhận chìa khóa!'); return; }
      if (!confirm('Dùng 1 🔑 để mở khóa?\nCấp acc ' + accLevel + ' → ' + Math.min(LV_MAX, accLevel + KEY_LV) + '\nTất cả Tướng & Trang bị được nâng cấp thêm ' + KEY_LV + ' cấp.')) return;
      accLevel = Math.min(LV_MAX, accLevel + KEY_LV);
      try { localStorage.setItem('acc_level', String(accLevel)); } catch (e) {}
      updateKeys();
      if (typeof renderVoHiep === 'function' && document.getElementById('screen-vohiep').classList.contains('active')) renderVoHiep();
      alert('🔓 Mở khóa thành công! Cấp acc: ' + accLevel + '. Tướng & Trang bị nâng được tới cấp ' + accLevel + '.');
    }
    function claimStageKey(stage) {
      if (stage <= keysClaimed) return '';
      keysClaimed = stage;
      try { localStorage.setItem('keys_claimed', String(keysClaimed)); } catch (e) {}
      updateKeys();
      return `\n\n🔑 Nhận 1 Chìa Khóa! Bấm 🔒 ở đầu trang chủ để mở thêm ${KEY_LV} cấp (còn ${keyCount()} 🔑).`;
    }

/* CÀI ĐẶT: âm thanh + cập nhật kho tướng + lưu đám mây.
   (Đã bỏ: nhạc nền, chỉnh thông số tướng, sao lưu thủ công. Thông số tướng / bảo vật / trang bị / boss bang
    nay do ADMIN chỉnh ở trang riêng admin-config.html, game tự tải về — xem js/core/remote-config.js.) */

    // ---- Cài đặt âm thanh: bật/tắt âm skill (lưu trong trình duyệt) ----
    let audioSet = Object.assign({ skill: true }, loadJSON('audio_set'));
    function renderAudioSwitches() {
      ['skill'].forEach(k => {
        const b = document.getElementById('sw-' + k); if (!b) return;
        b.className = 'snd-sw ' + (audioSet[k] ? 'on' : 'off');
        b.innerText = audioSet[k] ? 'BẬT' : 'TẮT';
      });
    }
    function toggleAudio(k) {
      audioSet[k] = !audioSet[k]; saveJSON('audio_set', audioSet);
      if (k === 'skill' && !audioSet.skill) { stopHeroSounds(); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }
      renderAudioSwitches();
    }
    function updateRoster() {
      const ico = document.getElementById('ru-ico');
      if (ico) ico.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 700, easing: 'ease-in-out' });
      let n = 0;
      try { n = enemyPool().length; pvpGenOpps(); } catch (e) {}
      try { renderTeam(); renderHomeTeam(); renderPvp(); } catch (e) {}
      const m = document.getElementById('ru-msg');
      if (m) m.textContent = `✅ Đã cập nhật ${n} tướng vào PvE (trận 1, 2, 4) và Tỷ Võ. Đối thủ Tỷ Võ đã được làm mới.`;
    }
    function openSettings() { renderAudioSwitches(); if (typeof clRender === 'function') clRender(); document.getElementById('settings-modal').style.display = 'flex'; }
    function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; renderHomeTeam(); }

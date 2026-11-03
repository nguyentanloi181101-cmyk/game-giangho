/* TÊN NGƯỜI CHƠI
   (tách từ index.html cũ — script) */

    const pvCleanName = s => String(s || '').replace(/[<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);   // bỏ ký tự nguy hiểm (tên hiện bằng innerHTML)
    const pvName = () => {
      let n = ''; try { n = pvCleanName(localStorage.getItem('player_name')); } catch (e) {}
      if (!n && typeof clUser !== 'undefined' && clUser) n = pvCleanName((clUser.email || '').replace(CL_DOMAIN, ''));   // chưa tự đặt: dùng tên tài khoản
      return n || 'Bạn';
    };
    function applyPlayerName() {
      let custom = ''; try { custom = pvCleanName(localStorage.getItem('player_name')); } catch (e) {}
      const el = document.querySelector('.user-name'); if (!el) return;
      if (custom || (typeof clUser !== 'undefined' && clUser)) el.textContent = pvName();   // chưa đăng nhập & chưa đặt tên: giữ tên mặc định
    }
    function renamePlayer() {
      const v = prompt('Đổi tên hiển thị (trang chủ & Tỷ Võ), 2–16 ký tự:', pvName()); if (v === null) return;
      const n = pvCleanName(v);
      if (n.length < 2) { alert('Tên cần từ 2 ký tự trở lên (không dùng các ký tự < > & dấu nháy).'); return; }
      try { localStorage.setItem('player_name', n); } catch (e) {}
      applyPlayerName();
      try { renderPvp(); } catch (e) {}
      try { if (typeof clPublishPvp === 'function') clPublishPvp().catch(() => {}); } catch (e) {}   // cập nhật tên cho người chơi khác
    }
    applyPlayerName();

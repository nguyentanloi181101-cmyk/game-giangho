/* KHỞI ĐỘNG: vẽ lại giao diện khi trang tải xong (nạp CUỐI CÙNG)
   (tách từ index.html cũ — script) */

    document.addEventListener('DOMContentLoaded', () => {
      renderHomeTeam();
      renderStages();
      updateKeys();
      updatePower();
      updateRes();
      updateMailBadge();
    });

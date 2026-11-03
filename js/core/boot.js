/* KHỞI ĐỘNG: vẽ lại giao diện khi trang tải xong (nạp CUỐI CÙNG)
   (tách từ index.html cũ — script) */

    cfgApply();   // áp cấu hình admin (bản cache) lên dữ liệu game, rồi tải bản mới nhất
    cfgFetch();
    document.addEventListener('DOMContentLoaded', () => {
      renderHomeTeam();
      renderStages();
      updateKeys();
      updatePower();
      updateRes();
      updateMailBadge();
    });

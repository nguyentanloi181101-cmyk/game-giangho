/* ================= QUẢN LÝ VÕ HIỆP SCRIPT ================= */

// Chuyển về trang chủ
function goToHome() {
  // Thử chuyển hướng sang index.html, nếu không được sẽ dùng lịch sử trình duyệt quay lại
  try {
    window.location.href = 'index.html';
  } catch (e) {
    window.history.back();
  }
}

// Xử lý khi nhấn vào từng tính năng trong Quản lý Võ Hiệp
function openVoHiepFeature(featureKey) {
  switch (featureKey) {
    case 'manh_vo_hiep':
      alert("Mở giao diện: Mảnh Võ Hiệp");
      break;
    case 'ghep_manh':
      alert("Mở giao diện: Ghép Mảnh Võ Hiệp (Đang có 4 mảnh có thể ghép)");
      break;
    case 'tang_sao':
      alert("Mở giao diện: Tăng Sao Võ Hiệp");
      break;
    case 'boi_duong':
      alert("Mở giao diện: Bồi Dưỡng Võ Hiệp");
      break;
    case 'dot_pha':
      alert("Mở giao diện: Đột Phá Võ Hiệp");
      break;
    case 'ky_nang':
      alert("Mở giao diện: Kỹ Năng Võ Hiệp");
      break;
    case 'kinh_mach':
      alert("Mở giao diện: Kinh Mạch Võ Hiệp");
      break;
    case 'giang_ho_ky':
      alert("Mở giao diện: Giang Hồ Ký");
      break;
    default:
      console.log("Chức năng chưa phát triển:", featureKey);
  }
}
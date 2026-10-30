# Mộng Huyễn Giang Hồ — cấu trúc mã nguồn

Đã tách từ 1 file `index.html` (5MB) thành nhiều file theo mảng. Chạy y như cũ: mở `index.html`
(hoặc đưa cả thư mục lên GitHub Pages / hosting). Không cần build, không cần server riêng.

```
index.html            khung HTML (các màn hình, hộp thoại) + danh sách <link>/<script>
assets/               ảnh + âm thanh (trước đây nhúng base64 trong code)
  images/heroes/      ảnh từng tướng (<tên>.webp) và ảnh thân (<tên>-body.webp)
  images/items/       Bảo Vật (treasure-*), trang bị (equipment-*)
  images/giangho/     banner Giang Hồ
  images/fx/          ảnh hiệu ứng
  audio/              nhạc nền, âm đánh thường, âm mở trận, âm theo tướng
css/
  core/               nền, thanh trên, trang chủ, cài đặt, thể lực
  modes/              giangho.css · pve.css · pvp.css
  battle/             sân đấu, hero 3D
  heroes/             team, hero-detail, vohiep, recruit + 1 file hiệu ứng cho mỗi tướng
  items/              treasure.css (Bảo Vật) · equipment.css (Trang bị)
  cloud/              login.css
  cascade-fixes.css   13 luật phải nạp cuối để giữ đúng thứ tự ghi đè như bản gốc
js/
  core/               navigation, game-state, keys, stamina, settings, player-name, backup, boot
  heroes/             roster (danh sách tướng) · hero-stats · hero-roles · hero-detail · vohiep · recruit
    skills/           MỖI TƯỚNG 1 FILE tuyệt kỹ (ma-dao-thanh-nu.js, au-co.js, ...)
  items/              treasure.js (Bảo Vật + Búa) · equipment*.js (Trang bị)
  battle/             engine, ultimate (điều phối), audio, synth-sfx, skill-config, auto-battle, battle-panel
  modes/giangho/      giangho.js
  modes/pve/          pve-stages, pve-start, pve-enemies, pve-battle
  modes/pvp/          pvp-state, pvp-ranking, pvp-flame, pvp-view, pvp-battle
  cloud/              cloud.js (Firebase) · login-screen.js
```

## Quy tắc quan trọng
- **Thứ tự `<script>` trong `index.html` là bắt buộc.** Các file dùng chung biến toàn cục (như khi còn 1 file),
  file sau dùng được hàm/biến của file trước. Đừng đảo thứ tự. `boot.js` luôn nạp cuối cùng.
- **Thứ tự `<link>` CSS cũng quan trọng** (luật nạp sau ghi đè luật nạp trước). Đã được tính để giống hệt bản gốc.
- Sửa một mảng nào thì chỉ mở file của mảng đó: PVP → `js/modes/pvp/`, PVE → `js/modes/pve/`,
  Giang Hồ → `js/modes/giangho/`, tuyệt kỹ → `js/heroes/skills/<tướng>.js`.

## Thêm một tướng mới
1. Thêm dòng vào `HEROES` trong `js/heroes/roster.js` (ảnh bỏ vào `assets/images/heroes/`).
2. Viết tuyệt kỹ `js/heroes/skills/<ten-tuong>.js` (hàm `xxxUlt(u, tok)`), thêm `<script>` vào `index.html`
   (sau `skills/` khác, trước `battle/skill-config.js` là được).
3. Đăng ký trong `js/battle/ultimate.js`: `if (u.id === N) return xxxUlt(u, tok);`
4. Nếu có hiệu ứng CSS riêng: tạo `css/heroes/<ten-tuong>.css` và thêm `<link>` (đặt sau `css/battle/battle.css`).

## Quy tắc Tỷ Võ và Bảo Vật (bản cập nhật)
- **Hạng Tỷ Võ = vị trí trong bảng** (có 3 người thì hạng 1-2-3). Tài khoản mới vào tự xếp tiếp xuống cuối bảng.
  Thắng người hạng cao hơn thì chèn lên ngay trên họ (họ và những người ở giữa tụt 1 hạng). Chỉ ghi vào doc của chính mình
  nên chạy được với Firestore rules chặt (mỗi người chỉ ghi `pvp_players/{uid}` của mình). Code: `js/modes/pvp/pvp-ranking.js`.
- **Bảo Vật có 4 loại** (Tôn Sư Ký, Bá Vương Kiếm, Thủy Hoàng Đăng, Trống Lôi Âm). Mỗi loại có thể có nhiều bản
  (cùng tên, cùng thông số, cấp/sao riêng). Mỗi khung gắn tối đa 3 Bảo Vật và **không được trùng loại**.
  Đổi 10🔥 ở Tỷ Võ = thêm 1 bản mới (Lv.0 ★0) của loại đã chọn. Code: `js/items/treasure.js`, `js/modes/pvp/pvp-flame.js`.

## Tài nguyên: bạc / gạo / vàng
- 🥈 Bạc, 🌾 Gạo (góc trái dưới VIP): thắng mỗi Bàn PVE nhận `3000 × 1.1^(số Bàn−1)` bạc và `2500 × 1.1^(số Bàn−1)` gạo
  (`js/modes/pve/pve-rewards.js`). Dùng để lên cấp tướng: cấp 2 tốn 100 bạc + 200 gạo, mỗi cấp sau đắt hơn 10%
  (`lvCost` trong `js/heroes/hero-progress.js`, trừ tiền trong `js/heroes/vohiep.js`).
- 🪙 Vàng (dưới chữ "Văn Lang"): dùng Chiêu Mộ; Hộp Thư (`js/core/mail.js`) tặng 10.000 vàng mỗi ngày.
- 🎒 Túi Đồ (`js/core/bag.js`) thay nút "Ưu Đãi": xem bạc/gạo/vàng, viên thể lực, búa, chìa khóa, Bảo Vật, trang bị, mảnh tướng.

## Bạc, Gạo, Vàng, Túi Đồ, Hộp Thư
- **Bạc 🥈 / Gạo 🌾** (góc trái dưới nhãn VIP): thắng mỗi Bàn PVE nhận (`js/modes/pve/pve-rewards.js`): Ải 1 Bàn 1 = 3000 bạc + 2500 gạo,
  mỗi Bàn sau nhiều hơn 10% (Ải 2 Bàn 1 là Bàn thứ 11). Dùng để tăng cấp tướng: lên cấp 2 tốn 100 bạc + 200 gạo, mỗi cấp sau +10% (`js/heroes/hero-progress.js`).
- **Vàng 🪙** (góc phải, dưới chữ Văn Lang): dùng Chiêu Mộ. **Hộp Thư** (`js/core/mail.js`) tặng 10.000 vàng mỗi ngày, thư chưa nhận giữ 7 ngày.
- **Túi Đồ** (thay nút Ưu Đãi, `js/core/bag.js`): bạc, gạo, vàng, viên thể lực, búa, chìa khóa, Bảo Vật, trang bị, mảnh tướng.

## Chat, chọn tướng, Võ Hiệp, Bang Hội (mới)
- `js/social/chat.js` – chat chung giữa các tài khoản online (nút **Thẻ Tháng** và nút 💬 trong Bang Hội). Dùng collection Firestore `chat_messages`.
- `js/social/vohiep-hub.js` – màn "Quản lý Võ Hiệp" (8 nút, tab VÕ HIỆP) và lưới chọn tướng (nút **Tăng Cấp** ở trang chủ).
- `js/social/guild.js` – cảnh Bang Hội (tab BANG HỘI). `css/core/social.css` – giao diện.
- `switchScreen` giữ thanh trên + thanh dưới cho home / picker / vhub / guild.

### Quy tắc Firestore cần THÊM cho chat
```
match /chat_messages/{id} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.uid == request.auth.uid
    && request.resource.data.text is string
    && request.resource.data.text.size() <= 200;
}
```

## Bang Hội – Thần Thú / Diễn Võ Trường / Bang Chiến
`js/social/guild-sub.js`. Boss bang cấp 2 = 2.000.000 HP, mỗi cấp sau nhân đôi (`gdBossHp`). Nút "Khiêu chiến" boss chờ mô tả kỹ năng. Dữ liệu lưu ở key `guild_state` (đồng bộ đám mây).

## Boss bang (cập nhật)
- 7 boss thường (Kỳ Lân, Xích Vũ, Tiên Lộc, Long Quy, Báo Tuyết, Hắc Điêu, Cuồng Ngưu): HP boss đầu 2.000.000, mỗi boss sau x2. Chí Tôn = cùng boss, HP & sát thương x2, mở bằng 5000 Vàng.
- Hạ boss → vật phẩm rơi vào tab **Đổi** (Mua bằng Vàng / Đấu Giá bằng Điểm BOSS, chốt 12h trưa), trúng thì vào **Kho Bang Hội** (xem trong Túi Đồ).
- Trận đánh hiện là mô phỏng tự động theo chỉ số đội hình; chờ mô tả kỹ năng boss để làm trận thật. Sửa số trong `bbFight` / `gdBossAtk` (js/social/guild-sub.js).

## Thần Thú v2 + Cấm Địa + Túi Đồ
- `js/social/thanthu.js`: 18 thần thú (8 A+, 10 S) với hiệu quả phụ thể, tab Cấp (Cho Ăn bằng Thú Hồn/Thú Linh), Sao (Quỷ Linh + Đá Nữ Oa), Phụ Thể (Lĩnh Ngộ: Tẩy miễn phí/2 phút, Tẩy 10 lần 500 Vàng, Danh Sách). Cấm Địa: 3 lượt/ngày nhận mảnh + Thú Hồn.
- Túi Đồ chỉ chứa tiền tệ + vật phẩm (không còn mảnh tướng, trang bị, bảo vật). Vật phẩm từ Boss bang nằm ở mục "Kho Bang Hội".
- Thần thú hiện chưa tham gia chiến đấu (chỉ số/phụ thể mới để hiển thị & tích lũy).

## Cập nhật
- Hoa Mãn Lâu, bướm Tím: trúng độc TOÀN địch, câm lặng chỉ 2 địch ngẫu nhiên (`BF_SILENCE_TARGETS` trong skill-config.js).
- Thần Thú thêm 5 con S: Tản Viên Thần, Giáp Thìn, Cửu Vỹ Hồ, Hỏa Kỳ Lân (coming soon), Khổng Tước — tổng 23.

## Nhiệm Vụ (Tích Cực) + Sự Kiện
- `js/social/quests.js`: 9 nhiệm vụ ngày, mốc 25/50/75/100 điểm mở rương quà (vào Túi Đồ; vàng cộng thẳng). Tiến độ đếm bằng cách bọc các hàm cũ (PVE, Tỷ Võ, Chiêu Mộ, cường hóa trang bị, bồi dưỡng). Reset mỗi ngày.
- "Danh Tướng Lầu" và "Luận Kiếm" chưa có chế độ nên bấm vào là tạm tính hoàn thành.
- Sự Kiện: đã bỏ hết mục nạp/tiêu phí; chỉ còn Quà Free (nhận mỗi ngày) và các mục "sắp ra mắt".

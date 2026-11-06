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
  images/seq/         chuỗi khung hình (sprite sheet 1 hàng × N khung): dáng đứng + tuyệt kỹ của các tướng (Tiểu Yêu: tieu-yeu-idle/ult/skull · Đoàn Dự: doan-du-idle/ult/run · Vương Trùng Dương, Tây Độc…)
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
  core/               navigation, game-state, acc-exp, stamina, settings, player-name, backup, boot
  heroes/             roster (danh sách tướng) · hero-stats · hero-roles · hero-detail · vohiep · recruit
    skills/           MỖI TƯỚNG 1 FILE tuyệt kỹ (ma-dao-thanh-nu.js, au-co.js, ...)
    hero-seq.js       khai báo các chuỗi khung hình (SEQ, SEQ_IDLE) + hàm seqEl / seqOverlay / seqIdleHTML
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
- **Bảo Vật có 5 loại** (Tôn Sư Ký, Bá Vương Kiếm, Thủy Hoàng Đăng, Trống Lôi Âm, Kim Giao Tiễn; thông số ở `TS_DEFS` trong `js/items/treasure.js`; công thức: gốc × (1 + 0.5×★) × (1 + điểm/cấp × Lv)). Mỗi loại có thể có nhiều bản
  (cùng tên, cùng thông số, cấp/sao riêng). Mỗi khung gắn tối đa 3 Bảo Vật và **không được trùng loại**.
  Đổi 10🔥 ở Tỷ Võ = thêm 1 bản mới (Lv.0 ★0) của loại đã chọn. Code: `js/items/treasure.js`, `js/modes/pvp/pvp-flame.js`.

## Tài nguyên: bạc / gạo / vàng
- 🥈 Bạc, 🌾 Gạo (góc trái dưới VIP): thắng mỗi Bàn PVE nhận `3000 × 1.1^(số Bàn−1)` bạc và `2500 × 1.1^(số Bàn−1)` gạo
  (`js/modes/pve/pve-rewards.js`). Dùng để lên cấp tướng: cấp 2 tốn 100 bạc + 200 gạo, mỗi cấp sau đắt hơn 10%
  (`lvCost` trong `js/heroes/hero-progress.js`, trừ tiền trong `js/heroes/vohiep.js`).
- 🪙 Vàng (dưới chữ "Văn Lang"): dùng Chiêu Mộ; Hộp Thư (`js/core/mail.js`) tặng 10.000 vàng mỗi ngày.
- 🎒 Túi Đồ (`js/core/bag.js`) thay nút "Ưu Đãi": xem bạc/gạo/vàng, viên thể lực, búa, Bảo Vật, trang bị, mảnh tướng.

## Bạc, Gạo, Vàng, Túi Đồ, Hộp Thư
- **Bạc 🥈 / Gạo 🌾** (góc trái dưới nhãn VIP): thắng mỗi Bàn PVE nhận (`js/modes/pve/pve-rewards.js`): Ải 1 Bàn 1 = 3000 bạc + 2500 gạo,
  mỗi Bàn sau nhiều hơn 10% (Ải 2 Bàn 1 là Bàn thứ 11). Dùng để tăng cấp tướng: lên cấp 2 tốn 100 bạc + 200 gạo, mỗi cấp sau +10% (`js/heroes/hero-progress.js`).
- **Vàng 🪙** (góc phải, dưới chữ Văn Lang): dùng Chiêu Mộ. **Hộp Thư** (`js/core/mail.js`) tặng 10.000 vàng mỗi ngày, thư chưa nhận giữ 7 ngày.
- **Túi Đồ** (thay nút Ưu Đãi, `js/core/bag.js`): bạc, gạo, vàng, viên thể lực, búa, Bảo Vật, trang bị, mảnh tướng.

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

## Ảnh thần thú, Cấm Địa, Đại Sảnh
- `assets/images/thanthu/*.webp`: 8 ảnh thần thú đã xóa phông (Kỳ Lân, Xích Vũ, Tiên Lộc, Long Quy, Báo Tuyết, Hắc Điêu, Cuồng Ngưu, Lân Sư); có chuyển động thở/nhấp nhô nhẹ (`.tt-img`). Dùng chung cho Thần Thú và Boss bang.
- Cấm Địa = màn Boss (Thường / Chí Tôn / Đổi). Bang Chiến để trống "sắp ra mắt".
- `js/social/daisanh.js`: Đại Sảnh (Bang Hội / Thành Viên / Tin Tức, Quyên Góp, Cường Thân) và Tụ Bảo Bồn.
- Nút Cài đặt nằm cạnh chữ "Văn Lang". Tướng đã đánh xong không còn bị xám (PVE & Tỷ Võ).

## Icon vật phẩm bang (ảnh thật)
`assets/images/items/`: Thú Noãn, Thú Hồn, Thú Linh, Đá Nữ Oa, Dị Linh (đổi tên từ Quỷ Linh), Châu (mọi thần thú), Đào Tiên, Tử Linh Thạch (thay "Thạch <thú>"), Tụ Bảo Bồn. Hàm `gdIco(tên, emoji)` trong guild-sub.js trả về ảnh; kho cũ tự đổi tên khi load.

## Hệ thống tính sát thương (theo bảng của bạn)
Code: `js/battle/engine.js` (`calcDmg`, `strike`, `missed`), dữ liệu: `HERO_COMBAT` trong `js/heroes/roster.js`.
- Trúng khi Chuẩn ≥ Né + 200 (Né = 0 vẫn cần Chuẩn 200). Trượt: hiện "NÉ", không mất máu, hiệu ứng chiêu vẫn dính.
- **Tia đánh (`tia`)**: số lần sát thương của MỖI nhịp đánh (đòn thường và từng nhịp tuyệt kỹ), mặc định 1. Mỗi tia = đủ 3 loại sát thương (Công−Thủ • Bạo • Phá giáp) mỗi loại 100%, hiện từng con số riêng (không cộng dồn). Số nhịp của chiêu giữ nguyên (Bắc Cái 18 cây tre, 5 tia = mỗi cây 5 lần). Sửa trong `HERO_TIA` (`js/heroes/roster.js`) hoặc ô "Số tia đánh" ở admin-config (`heroes.<id>.tia`). Code: `strike`/`tiaOf` trong `js/battle/engine.js`; Vô Nhai Tử và Đông Phương (sát thương % HP) lặp riêng trong file kỹ năng.
- 1 tia = 3 loại sát thương riêng: Công − Thủ (trắng) • (Bạo − Bền) × Bạo Sát (vàng) • Phá giáp (tím, bỏ qua giáp).
- Đỡ đòn (%) giảm sát thương Công và Bạo, không giảm Phá giáp. Bạo và Phá giáp là sát thương riêng, cố định mỗi tia, không nhân theo Công hay hệ số chiêu.
- Sát thương Công tối thiểu 10% (tránh còn 1 khi Thủ quá cao).
- Tỷ Võ chỉ lấy chỉ số cơ bản gốc + trang bị/Bảo Vật/cộng dồn Tỷ Võ, không lấy số chỉnh trong Cài đặt.
- Cài đặt → Chỉnh thông số tướng có thêm Bạo, Bạo Sát, Bền, Phá giáp, Đỡ đòn. Số 13 tướng là số tạm, chỉnh trong `HERO_COMBAT`.

## Ngũ Tuyệt: 5 tướng mới (id 13-17)
Bắc Cái, Đông Tà (Kỹ năng) • Tây Độc (Thủ) • Nam Đế, Vương Trùng Dương (Hỗ trợ). Chiêu: `js/heroes/skills/ngu-tuyet.js`, hằng số: cuối `skill-config.js`, chỉ số: `HERO_COMBAT` + `HEROES` trong `roster.js`.
Tăng/giảm chỉ số theo hiệp dùng `addMod` (engine.js), hết hạn tự trả đúng số. Chất tướng theo bảng: Kỹ năng (ulti liên tục) • Công kích 50 nộ • Hỗ trợ 100 nộ, ưu tiên 2 • Trị liệu 50 nộ, ưu tiên 2 • Thủ 100 nộ, ưu tiên 1 (Chất tướng "Trị liệu" tách mới khỏi "Hỗ trợ").

## Thần Thú ra trận & Phụ Thể
- `js/social/thanthu-battle.js`: 2 bệ đứng ở góc trên (trái = thần thú mình đang chọn, phải = đối thủ), hàng icon phụ thể (hiệu quả thần thú + các ô Lĩnh Ngộ đã mở) hiển thị trên cùng.
- Phụ thể cộng **% theo chỉ số của từng tướng** lúc vào trận (PVE + Tỷ Võ). `Kích Phá` của thần thú là điểm cộng thẳng.
- Mapping tên → chỉ số (`TT_FXMAP`, đoán tạm, sửa tại đó): Cường Công/Sát Lục→Công; Thần Thuẫn/Bá Thuẫn/Thần Huyết/Hoạt Khí/Tái Sinh→HP; Chiến Thuẫn/Ngự Thuẫn/Trợ Thuẫn→Thủ; Kỳ Thuẫn→Đỡ đòn; Huyết Bạo/Kích Sát→Bạo; Bạo Tức/Bạo Nộ→Bạo sát; Kích Phá→Phá giáp; Tinh Chuẩn→Chuẩn; Ẩn Thân/Tàn Ảnh→Né; các loại Tốc→Tốc độ. Đẩy Lui chưa có hiệu ứng.
- Tỷ Võ người thật: snapshot đã gồm chỉ số sau phụ thể + tên thần thú/phụ thể. Bot/PVE: thần thú đối thủ chỉ trang trí.


## Hiệu ứng 3D Ngũ Tuyệt
- Bắc Cái: tre `assets/images/fx/bac-cai-bamboo.webp` rơi chéo 25° (đội trái rơi từ trên-trái xuống địch, đội phải rơi từ trên-phải xuống ta). Code: `js/heroes/skills/ngu-tuyet.js` (`bacCaiUlt`), CSS: `css/heroes/ngu-tuyet.css`.
- Vương Trùng Dương: lốc xoáy Thái Cực 3D (`vtd-taiji-vortex.webp` cắt 14 lát lắc lệch pha, `vtd-taiji-core.webp` xoay như đồng xu, vòng Bát Quái, vòng sáng đất). Code: `vtdUlt`.
- Tây Độc: cóc ngọc 3D (`td-toad3d.webp`, `td-coin.webp`) thay emoji 🐸 — thở/lắc theo chiều sâu, mắt đỏ phát sáng, tiền vàng quay quanh. Code: `tayDocUlt`.
- Tụ Bảo Bồn: ảnh `assets/images/items/tu-bao-bon.webp`.
- Đông Tà: nốt nhạc `dt-burst.webp` bung ra từ tâm rồi tan biến, 4 nhịp (`dongTaUlt`).
- Thần thú ra trận: .bf-bst top:34px, cao min(196px,29vh) (đã đưa sát lên và thu nhỏ).

## Chuỗi khung hành động tuyệt kỹ (sprite sheet) — mẫu cho tướng khác
- Bắc Cái: `assets/images/heroes/bac-cai-ult.webp` = 13 khung nền trong suốt, lưới **5 cột × 3 hàng**, mỗi ô 280×200 px (căn đáy, giữa ô).
  Khung 0-4 chạy đà · 5-7 bật lên, vung gậy · 8-9 đập đất · 10-12 thu thế. Ảnh gốc quay mặt sang phải (đội phải được lật tự động).
- Code: `bcSeq(u)` + `BC_SEQ` + lịch đổi khung trong `bacCaiUlt` (`js/heroes/skills/ngu-tuyet.js`); CSS `.bc-seq` ở `css/heroes/ngu-tuyet.css`.
- Muốn đổi tốc độ: sửa các mốc ms trong `[0, 80, 160, ...]` và `at(120, 9); at(380, 10)...`. Muốn nhân vật to/nhỏ hơn: sửa `k` trong `BC_SEQ`.
- Thêm chuỗi khung cho tướng khác: tạo sheet cùng quy cách, copy `bcSeq` đổi hằng số, gọi `show(i)` theo mốc thời gian trong hàm tuyệt kỹ của tướng đó.

## Chuỗi khung hình: Vương Trùng Dương (17) và Tây Độc (15)
Mỗi sheet là 1 hàng × 12 khung nền trong suốt (`assets/images/seq/`), khai báo trong `js/heroes/hero-seq.js` (`SEQ`).
- **Dáng đứng trong trận** (`SEQ_IDLE`): tướng nào có tên trong `SEQ_IDLE` thì `applyRole` (engine.js) thay ảnh thân tĩnh bằng chuỗi khung tự lặp.
  Chỉnh cỡ: `h` (chiều cao hiển thị, px); chỉnh tốc độ: `ms` (thời gian 1 vòng 12 khung).
- **Vương Trùng Dương — tuyệt kỹ** (`vtdUlt` trong `skills/ngu-tuyet.js`): 12 khung tung chiêu phủ lên tướng (`seqOverlay`, rộng 150 px) →
  khoảng 0,66 s sau, lốc xoáy Thái Cực (`SEQ.vtdStorm`, lặp) mở ra **giữa đội địch** → cầu Thái Cực bay từ tướng sang từng đồng đội, tăng 300% mọi chỉ số như cũ.
- **Tây Độc — tuyệt kỹ** (`tayDocUlt`): cảnh cóc độc (`SEQ.tdToad`, 12 khung × 110 ms) trồi lên bên cạnh tướng, khung 8 trở đi phun bong bóng độc; luồng độc bay sang địch rồi trừ Thủ/Tốc/máu như cũ. Đội phải tự lật ảnh.
- Thêm chuỗi khung cho tướng khác: tạo sheet cùng quy cách → thêm vào `SEQ` (và `SEQ_IDLE` nếu là dáng đứng) → dùng `seqEl(SEQ.xxx, rộng)` hoặc `seqOverlay(u, SEQ.xxx, rộng)` trong hàm tuyệt kỹ.
- Mọi mốc thời gian chuỗi khung dùng `seqT(ms)` để khớp với chế độ tua nhanh của trận.

## Chuỗi khung hình: Đông Tà (14) và Bắc Cái (13)
Cùng quy cách (1 hàng × 12 khung, 227×201 px) trong `assets/images/seq/`, khai báo trong `SEQ` / `SEQ_IDLE` (`hero-seq.js`):
- `dong-ta-idle.webp` (`dtIdle`) và `bac-cai-idle.webp` (`bcIdle`): dáng đứng trong trận, tự lặp.
- `dong-ta-ult.webp` (`dtCast`): tuyệt kỹ Đông Tà (`dongTaUlt`): khung 0-3 nhảy lên, 4-10 xoáy vàng theo 4 nhịp sóng âm, 11 đáp đất. Bắc Cái vẫn dùng `bac-cai-ult.webp` cũ cho tuyệt kỹ.
- Nam Đế (16): `nam-de-idle.webp` (`ndIdle`, dáng đứng). Tuyệt kỹ giữ hiệu ứng cũ (chữ Vạn + vòng sáng).
- Trương Tam Phong (4): `truong-tam-phong-idle.webp` (`ttpIdle`) + `truong-tam-phong-ult.webp` (`ttpCast`, dùng trong `taichiUlt`: khung 0-4 tụ cầu, 5-7 nhảy lên, 8-11 chọi xuống; quả cầu bay chỉ hiện lúc chọi). Âu Cơ (5): `au-co-idle.webp` (`acIdle`, dáng đứng).


## Hoa Mãn Lâu (v38)
- Dáng đứng: `SEQ.hmlIdle` (+ `SEQ_IDLE[6]`) • Tung tuyệt kỹ: `SEQ.hmlCast` • 7 chuỗi bướm ulti: `SEQ.hmlRed → hmlOrange → hmlYellow → hmlGreen → hmlBlue → hmlIndigo → hmlPurple` (đỏ, cam, vàng, lục, lam, chàm, tím), ảnh ở `assets/images/seq/hoa-man-lau-*.webp`.
- Nền đã xóa sạch (trong suốt), thân căn cố định giữa khung; đã bỏ hoàn toàn emoji bướm.


## Cập nhật v45: Tiểu Yêu (id 10, trước là Bạch Ma Vương) + Đoàn Dự (id 12)
- **Tiểu Yêu**: đứng yên = `SEQ.tyIdle` (20 khung) · tung chiêu = `SEQ.tyCast` (20 khung) · đầu lâu lửa = `SEQ.tySkull` (20 khung).
  Đánh **TOÀN BỘ địch còn sống**, mỗi địch mất **50% HP hiện tại** (bỏ qua giáp/khiên/bất tử, chỉ Né mới tránh được).
  Sau đòn nếu HP còn **≤ 10% HP tối đa** (`EXEC_PCT` trong `js/battle/skill-config.js`) → **TẤT SÁT** kết liễu ngay (bỏ qua cả bất tử). Code: `js/heroes/skills/tieu-yeu.js`.
- **Đoàn Dự**: đứng yên = `SEQ.ddIdle` (17 khung) · tung chiêu = `SEQ.ddCast` (16 khung) · 18 đạo tàn ảnh chạy = `SEQ.ddRun` (17 khung). Code: `js/heroes/skills/doan-du.js`.
- Đã xóa hiệu ứng/ảnh cũ: bộ xương + lửa CSS + `fx/skull.webp`, emoji/ảnh tàn ảnh chạy cũ, ảnh Bạch Ma Vương cũ.

## Cập nhật v46: Đông Phương Cô Nương (id 9)
- Đứng yên = `SEQ.dpIdle` (20 khung) · tung chiêu = `SEQ.dpCast` (16 khung) · phân thân chạy sang địch = `SEQ.dpClone` (18 khung) · lốc lửa trên địch = `SEQ.dpFire` (20 khung). Code: `js/heroes/skills/dong-phuong-co-nuong.js`.
- Đã xóa mạng lửa 3D (canvas), ngọn lửa và đốm lửa trên đầu cũ. Cơ chế sát thương giữ nguyên (HTT_FLAT + Công chuẩn bỏ qua giáp, mất thêm 50% HP hiện tại, hiệu ứng vòng sóng khi trúng).

## Cập nhật v47
- Tỷ Võ: bục dưới chân tướng đổi thành **đài sen** (`assets/images/fx/lotus.webp`, tướng đứng trên nhụy vàng); hạng 2 và hạng 3 đứng cùng hàng, hạng 4 và 5 cùng hàng.
- PVE: nút **Quét ×10** cạnh nút Đánh (chỉ hiện ở Bàn đã thắng): tốn 10 × 4 = 40 thể lực, nhận thưởng x10 (bạc, gạo, Viên Thể Lực). Code: `sweepBattle` trong `js/modes/pve/pve-stages.js`.
- Trang chủ: **Lực chiến** (số vàng dưới Thể Lực) = tổng Công của toàn đội đang ra trận (`teamAtkTotal` trong `js/modes/pvp/pvp-state.js`), tự cập nhật mỗi giây.

## Gift Code (admin tạo mã trên máy chủ)
- **Trang admin**: `admin-giftcode.html` (mở trực tiếp hoặc đưa lên cùng hosting). Đăng nhập bằng tài khoản game của bạn, tạo mã, chọn quà
  (Thể Lực, Bạc, Gạo, Vàng, Mảnh tướng, Bảo Vật, vật phẩm Bang), đặt số lượt tối đa / hạn dùng, bật-tắt hoặc xoá mã. Dùng app Firebase tên riêng nên **không** làm văng đăng nhập game trên cùng trình duyệt.
- **Cài đặt 1 lần**: (1) dán quy tắc trong `firestore-admin.rules.txt` vào Firestore Rules; (2) tạo collection `admins`, thêm document có ID = UID tài khoản admin
  (trang admin tự hiện UID nếu tài khoản chưa có quyền).
- **Người chơi**: Túi Đồ → 🎁 Gift Code. `js/core/giftcode.js` kiểm tra mã bằng transaction Firestore (đúng lượt, đúng hạn, mỗi tài khoản 1 lần qua `gift_codes/{MÃ}/redeemed/{uid}`).
  Mã viết cứng `GIFT_CODES` vẫn dùng được làm dự phòng.
- **Thêm loại quà mới**: thêm 1 nhánh trong `gcGrant` (giftcode.js) + 1 mục trong `TYPES` / `renderRw` / `rwText` (admin-giftcode.html).


## Thông số game do ADMIN chỉnh (trang riêng) + thay đổi v53
- **Trang `admin-config.html`**: admin (tài khoản có document `admins/{uid}`) chỉnh: chỉ số cơ bản + chất tướng của từng tướng; thông số Bảo Vật (gốc / điểm mỗi cấp / sao thêm / cấp & sao tối đa);
  trang bị (cộng mỗi cấp, cấp tối đa, thưởng); boss bang (HP đầu, hệ số, Chí Tôn, sát thương, điểm) và Lò Luyện Hỏa (mỗi cấp cộng bao nhiêu).
  Lưu vào Firestore `game_config/main` (1 field `json`). Ô để trống = dùng số mặc định trong code.
- **Game đọc cấu hình**: `js/core/remote-config.js` (nạp đầu tiên) tải qua REST, cache ở `localStorage['game_cfg']` (không theo save người chơi), áp bằng `cfgApply()` (gọi ở `boot.js`).
  Các file dữ liệu dùng `cfgSnap(...)` để giữ số mặc định: `game-state.js` (HERO_DEFAULTS), `treasure.js` (TS_DEFS, TS_MAX, TS_STAR_MAX, TS_STAR_ADD),
  `equipment-data.js` (EQUIP.per, EQUIP_MAX, EQ_REWARD), `guild-sub.js` (GD_PER, BOSS_CFG).
  Thêm tham số mới: khai báo trong file dữ liệu bằng `cfgSnap`/`cfgGet`, thêm nhánh trong `cfgApply`, thêm ô trong admin-config.html (+ số mặc định trong khối `DEF`).
- **Đã bỏ khỏi Cài đặt**: Nhạc nền, "Chỉnh thông số tướng", "Sao lưu / Chuyển dữ liệu". Dữ liệu `hero_stat_ov` / `hero_role` cũ của người chơi không còn được dùng.
- **Âm thanh**: không còn nhạc nền. Mỗi tướng (id 0-17) có âm tuyệt kỹ riêng `assets/audio/heroes/NN-ten.mp3` (tạo bằng tổng hợp âm), phát lúc bắt đầu tung chiêu (`HERO_SND_SRC` trong `js/battle/audio.js`).
  Còn giữ `normal-attack.mp3` (đánh thường), `battle-open.mp3` (âm mở trận), `go-stone.mp3` (Vô Nhai Tử, đã tạo lại).
- **Bảo Vật**: tăng sao bằng cách tiêu 1 Bảo Vật CÙNG LOẠI chưa gắn khung (`tsStarUp`). Búa 🔨 vẫn nằm trong Túi Đồ nhưng không dùng để tăng sao.
- **Lò Luyện Hỏa**: nâng cấp không giới hạn (`GD_SKILL_MAX` = Infinity).
- **Trang chủ**: thẻ tướng dùng ảnh tĩnh (không chuỗi khung); nút 🎁 Gift Code nằm dưới Túi Đồ. Tỷ Võ: đã bỏ đài sen.


## Tài khoản mặc định (tất cả về 1) + Sở hữu tướng + Reset Bang (v54)
- **Tài khoản mới = tài khoản mặc định**: đăng ký mới (hoặc đăng nhập tài khoản chưa có dữ liệu ở đâu) tự gắn cờ `blank_start` (`cloud.js` → `clStartFresh`):
  tướng cấp 1 ★1, cấp acc 1, bang cấp 1, vàng/bạc/gạo = 0. Tài khoản cũ không có cờ này vẫn giữ kiểu cũ (tướng 70+).
- **Sở hữu tướng** (`game-state.js`: `OWN_ON`, `heroOwned`, `heroIsOwned`, `ownedHeroes`, `heroGain`; lưu key `hero_owned`): với tài khoản có cờ `blank_start`, chỉ tướng đã **Ghép Mảnh** (đủ 10 mảnh của tướng đó → Võ Hiệp → Ghép Mảnh, màn `js/heroes/ghep-manh.js`, tốn 10 mảnh) mới dùng được. Mảnh lấy từ Chiêu Mộ / Gift Code. Tướng chưa có không hiện trong chọn đội / hỗ trợ / thăng cấp / tăng sao / kỹ năng / kinh mạch / đột phá.
  Tướng mới tự vào đội nếu đội chưa đủ 5. Đội trống thì không vào được PVE / Tỷ Võ / Boss bang. `heroGain(id)` = ghép mảnh (kiểm tra đủ `MERGE_COST` và trừ mảnh).
- **Admin (`admin-players.html`)**: kiểu reset mặc định = "tất cả về 1" (tùy chọn "kiểu cũ" chỉ để test); thêm **Reset BANG riêng** (tất cả hoặc từng người — chỉ ghi lại `guild_state` về bang cấp 1, giữ nguyên mọi thứ khác);
  mục "Tướng sở hữu" (tick để tặng / bỏ tick để thu hồi tướng của tài khoản kiểu mới).


## Cấp tài khoản & EXP (thay cho Chìa Khóa 🔑 — đã bỏ hẳn)
- `js/core/acc-exp.js`: thắng mỗi Bàn PVE (và quét) nhận EXP như bạc/gạo/Thần Đan/Tiên Đan (hiện trong mô tả từng Bàn), đủ EXP tự lên cấp acc. Cấp acc vẫn là giới hạn cấp của mọi tướng và trang bị.
- Thanh EXP nằm ngay dưới dòng "Cấp / tên" ở trang chủ (vạch đỏ trong ảnh). Không còn nút 🔒 và số 🔑.
- Công thức: cấp 1 → 2 cần `base` EXP (mặc định 3000); cấp k → k+1 cần `base × (1 + growth/100)^(k−1)` (mặc định +10%/cấp: 3000, 3300, 3630…).
- Admin chỉnh ở `admin-config.html` → tab **✨ Cấp & EXP**: `exp.base` (3000) và `exp.growth` (10) + bảng xem trước. EXP nhận mỗi Bàn chỉnh ở tab **Thưởng PVE** (`pve.expBase`, mặc định 100 ở Bàn 1, tăng theo hệ số Bàn như bạc/gạo).
- Chìa khóa chưa dùng của tài khoản cũ không còn tác dụng.
- Gift Code: loại quà `key` đổi thành `exp` (mã cũ có `key` sẽ bị bỏ qua). Admin-players: ô "Chìa khóa tặng" đổi thành "EXP".

## Thưởng thêm mỗi trận (PVE)
- `admin-config.html` → tab **🎁 Thưởng PVE** → "➕ Thưởng thêm mỗi trận": thêm bao nhiêu dòng cũng được (Bạc, Gạo, Vàng, Thần Đan, Tiên Đan, Viên Thể Lực, Búa, EXP, Mảnh tướng, Bảo Vật, Mảnh thần thú, Vật phẩm Bang Hội).
- Mỗi lần thắng 1 Bàn nhận đủ các dòng này (số cố định, không tăng theo Bàn); Quét ×10 nhận ×10. Hiện ở mô tả từng Bàn. Lưu trong `game_config/main` → `pve.extra`. Code: `grantExtraReward` trong `js/modes/pve/pve-rewards.js`.

## Reset (admin-players.html)
- Chỉ còn 1 kiểu reset: **tất cả về 1** (đã bỏ lựa chọn "kiểu cũ — chỉ để test").

## Địch PVE (admin chỉnh được)
- `admin-config.html` → tab **👹 Địch PVE** (lưu ở `foe` trong `game_config/main`). Code: `FOE_CFG`, `foeCount` trong `js/modes/pve/pve-enemies.js`; dùng ở `loadWave` (`js/modes/pve/pve-battle.js`).
- Chỉnh: HP / Công / Thủ / Né nền của tướng địch (mặc định 1000 / 200 / 30 / 0), hệ số nhân HP & Công mỗi Bàn (1.32), hệ số boss Trận 4 (1.2).
- Số tướng địch mỗi trận mặc định 2 / 3 / 4 / 5 (tối đa 5). Có thêm **luật riêng theo Bàn**: từ Bàn X đến Bàn Y đổi số tướng của từng Trận (Bàn đếm liên tục: Ải 2 Bàn 1 = Bàn 11); ô trống = giữ mặc định.


## TRANG ADMIN DUY NHẤT: `admin.html` (thay admin-config / admin-giftcode / admin-players — có thể xóa 3 file cũ)
Đăng nhập 1 lần, các mục: ⚙️ Thông số game (Tướng, Cấp/Sao, Bảo Vật, Trang bị, Boss & Lò, Địch PVE, Cấp & EXP, Thưởng PVE, Thể lực, Chiêu Mộ, Tỷ Võ, Khác) • 📬 Hộp Thư • 🎯 Nhiệm Vụ • 🎪 Sự Kiện • 🎁 Gift Code • 👥 Người chơi • 🧰 Nâng cao (JSON).
Mọi mục cấu hình dùng chung nút **Lưu cấu hình** (Firestore `game_config/main`). Quy tắc Firestore không đổi.
- **Quà** (Hộp Thư / rương Nhiệm Vụ / Sự Kiện / Gift Code / thưởng PVE) dùng chung 1 định dạng `{t,n,id?,name?,ico?}` và hàm `gcGrant`. Hàm tiện ích: `rwList`, `rwInfo`, `rwTextAll`, `rwGrantAll` (`remote-config.js`).
- **Thêm tham số mới**: trong file dữ liệu dùng `let X = mặcDịnh; cfgOnApply(() => { X = cfgNum('đường.dẫn', mặcĐịnh); });` (hook chạy lại mỗi khi admin đổi số), rồi thêm ô trong admin.html (+ số mặc định trong khối `DEF`).
- Mới: `mail` (quà hằng ngày + thư riêng), `quest` (sửa nhiệm vụ / rương), `event.list` (thêm sự kiện quà, giới hạn thời gian), `stamina`, `recruit` (thời gian chờ, số mảnh, giá, tỷ lệ rơi từng tướng, số mảnh ghép / mỗi sao), `pvp`, `misc` (số Bàn quét, EXP thần thú, giá bán Túi Đồ, nộ thần thú), `progress` (đã có UI).

## Bổ sung (lần 2): chỉnh nốt các phần còn lại từ admin.html
- **⚔️ Chiêu thức & chiến đấu** (`skill.<TÊN>`): toàn bộ hằng số trong `js/battle/skill-config.js` (hệ số, số hiệp, số đòn, % của từng tuyệt kỹ) + luật trúng `HIT_GAP` và sát thương tối thiểu `MIN_DMG_PCT` (`engine.js`). Thêm hằng số mới vào skill-config.js (dạng `let X = số;`) rồi thêm vào `SKILL_GROUPS` trong admin.html và danh sách trong khối `SKILL_DEF` cuối file.
- **🦄 Thần Thú** (`tt.*`, `tt.beasts.<tên>`): công thức cấp / EXP / HP / sao / chi phí tăng sao / tẩy phụ thể / phẩm chất, và từng thần thú (hạng, mảnh cần, hiệu quả phụ thể). Code: `js/social/thanthu.js` (`TT_P`, `TT_BEASTS`).
- **🏰 Bang Hội & Đại Sảnh** (`guild2.*`): EXP bang, chi phí Lò Luyện Hỏa, bang cấp mở kỹ năng / boss, vàng mở Chí Tôn, vật phẩm rơi, đổi vật phẩm boss (`G2` trong guild-sub.js), Quyên Góp (`DS_DONATE`), Tụ Bảo Bồn (`BASIN`, `BASIN_REW`, quà đầy bồn) trong daisanh.js.
- **Đổi tên** tướng / tuyệt kỹ: `heroes.<id>.name`, `heroes.<id>.ultName`.
- **Nhiệm vụ tự thêm** (`quest.custom`): gắn với 1 trong các hành động: pve, pvp, rec, eq, bd, boss, tt, mail, donate, basin, skill, login (`QS_TRIGGERS` trong quests.js). Thêm hành động mới = bọc hàm tương ứng bằng `qsTrig('<tên>')` và thêm vào `QS_TRIG_LABEL` trong admin.html.

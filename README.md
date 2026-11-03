# Cách chạy
1. Cài Node.js (https://nodejs.org)
2. Mở terminal trong thư mục này:
   npm install
   ADMIN_PASSWORD=matkhaucuaban npm start      (Windows CMD: set ADMIN_PASSWORD=matkhaucuaban && npm start)
3. Mở http://localhost:3000/admin.html

# Game đọc dữ liệu
GET /api/heroes/bac-cai  ->  { "id":"bac-cai", "hit_count":18, "damage_per_hit":50, ... }
Dùng hit_count và damage_per_hit như trong gameLogic.js.

# Thêm tướng mới
Thêm một dòng vào heroes.json (id không dấu, không trùng).

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// ĐỔI MẬT KHẨU NÀY (hoặc đặt biến môi trường ADMIN_PASSWORD)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'doi-mat-khau-nay';
const DATA_FILE = path.join(__dirname, 'heroes.json');
const MIN_HITS = 1;
const MAX_HITS = 100;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const load = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const save = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

function requireAdmin(req, res, next) {
  if (req.get('x-admin-password') !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Sai mật khẩu admin' });
  }
  next();
}

// ===== API cho GAME đọc (không cần mật khẩu) =====
app.get('/api/heroes', (req, res) => res.json(load()));

app.get('/api/heroes/:id', (req, res) => {
  const hero = load().find((h) => h.id === req.params.id);
  if (!hero) return res.status(404).json({ error: 'Không tìm thấy tướng' });
  res.json(hero);
});

// ===== API cho ADMIN =====
app.put('/api/admin/heroes/:id/hit-count', requireAdmin, (req, res) => {
  const hitCount = Number(req.body.hit_count);
  if (!Number.isInteger(hitCount) || hitCount < MIN_HITS || hitCount > MAX_HITS) {
    return res.status(400).json({ error: `Số tia phải là số nguyên từ ${MIN_HITS} đến ${MAX_HITS}` });
  }
  const heroes = load();
  const hero = heroes.find((h) => h.id === req.params.id);
  if (!hero) return res.status(404).json({ error: 'Không tìm thấy tướng' });

  hero.hit_count = hitCount; // dame mỗi tia giữ nguyên
  save(heroes);
  res.json({ ok: true, ...hero, total_damage: hero.hit_count * hero.damage_per_hit });
});

app.get('/api/admin/check', requireAdmin, (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Chạy tại http://localhost:${PORT}/admin.html`);
});

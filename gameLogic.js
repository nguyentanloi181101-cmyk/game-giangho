// Ví dụ logic game: dùng số tia từ dữ liệu admin chỉnh
// Nếu game của bạn là server Node, require file này; nếu không, copy hàm useSkill sang game.
function applyDamage(target, dmg) {
  target.hp -= dmg;
}

function useSkill(hero, target) {
  for (let i = 0; i < hero.hit_count; i++) {
    applyDamage(target, hero.damage_per_hit); // dame mỗi tia không đổi
  }
  return hero.hit_count * hero.damage_per_hit; // tổng dame
}

module.exports = { useSkill, applyDamage };

/* PVE: kho địch (12 con giáp, khủng long, tướng làm địch), ảnh nền
   (tách từ index.html cũ — script) */

    // Địch thường = 12 con giáp ngẫu nhiên; boss = khủng long ngẫu nhiên
    const ZODIAC = [['🐭','Tý'],['🐮','Sửu'],['🐯','Dần'],['🐱','Mão'],['🐲','Thìn'],['🐍','Tỵ'],['🐴','Ngọ'],['🐐','Mùi'],['🐵','Thân'],['🐔','Dậu'],['🐶','Tuất'],['🐷','Hợi']];
    const DINOS = [['🦖','Khủng Long Bạo Chúa',0],['🦕','Khủng Long Cổ Dài',0],['🦖','Khủng Long Tím',120],['🦕','Khủng Long Lam',200]];
    const dinoIcon = d => d[2] ? `<span style="display:inline-block;filter:hue-rotate(${d[2]}deg)">${d[0]}</span>` : d[0];
    const shuffled = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    // Kho tướng làm địch (PvE trận 1/2/4 & Tỷ Võ): LẤY TỪ HEROES mỗi lần tạo trận nên tướng mới thêm vào tự có mặt.
    // Đặt true nếu muốn loại các tướng gắn noEnemy (chiêu quá mạnh) khỏi PvE.
    const PVE_SKIP_NOENEMY = false;
    const enemyPool = () => HEROES.filter(h => !(PVE_SKIP_NOENEMY && h.noEnemy));
    // n tướng ngẫu nhiên (không trùng) làm địch, chỉ số theo ải
    function heroFoes(n, k) {
      const picks = shuffled(enemyPool()).slice(0, n), S = HERO_POS[n].map(p => [100 - p[0], p[1] + HERO_DY]);
      return { picks, foes: picks.map((h, i) => {
        const u = makeUnit('enemy', heroIcon(h), S[i][0], S[i][1], B4_HERO_HP * k, B4_HERO_ATK * k, false, h.name);
        u.id = h.id; u.isHero = true;
        u.def = B4_HERO_DEF; u.dodge = B4_HERO_DODGE; u.acc = 0; u.sk = 1;     // skill cấp 1, không cộng cấp/sao
        u.alwaysUlt = !!h.alwaysUlt; u.taunt = !!h.taunt; u.prio2 = !!h.prio2; u.rage = h.startRage || 0; grantStart(u);
        return u;
      }) };
    }

    // ===== Ảnh nền trận đấu: random mỗi trận (ải thường & Tỷ Võ), không lặp liền nhau =====
    const BATTLE_BGS = [];   // đã xóa ảnh nền trận đấu
    let lastBgIdx = -1;
    function setBattleBg() {
      try {
        const f = document.getElementById('battle-arena'); if (!f || !BATTLE_BGS.length) return;
        let i; do { i = Math.floor(Math.random() * BATTLE_BGS.length); } while (BATTLE_BGS.length > 1 && i === lastBgIdx);
        lastBgIdx = i;
        f.classList.add('has-bg');
        f.style.backgroundImage = 'linear-gradient(rgba(0,0,0,.18),rgba(0,0,0,.38)), url(' + BATTLE_BGS[i] + ')';
      } catch (e) {}
    }

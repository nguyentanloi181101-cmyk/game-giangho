/* PVE: kho địch (khủng long, tướng làm địch), ảnh nền
   (tách từ index.html cũ — script) */

    // Địch = tướng ngẫu nhiên; boss = khủng long ngẫu nhiên
    const DINOS = [['🦖','Khủng Long Bạo Chúa',0],['🦕','Khủng Long Cổ Dài',0],['🦖','Khủng Long Tím',120],['🦕','Khủng Long Lam',200]];
    const dinoIcon = d => d[2] ? `<span style="display:inline-block;filter:hue-rotate(${d[2]}deg)">${d[0]}</span>` : d[0];
    const shuffled = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    // Kho tướng làm địch (PvE trận 1/2/4 & Tỷ Võ): LẤY TỪ HEROES mỗi lần tạo trận nên tướng mới thêm vào tự có mặt.
    // Đặt true nếu muốn loại các tướng gắn noEnemy (chiêu quá mạnh) khỏi PvE.
    const PVE_SKIP_NOENEMY = false;
    const enemyPool = () => HEROES.filter(h => !(PVE_SKIP_NOENEMY && h.noEnemy));
    // ===== ĐỊCH PVE (admin chỉnh ở admin-config.html → tab "Địch PVE" → GAME_CFG.foe) =====
    // hp/atk/def/dodge: chỉ số nền của tướng địch • growth: nhân HP & Công mỗi Bàn (Bàn k nhân growth^(k−1)) • bossMult: nhân thêm cho Trận 4 (boss)
    // counts: số tướng địch ở Trận 1..4 • rules: [{from,to,c:[t1,t2,t3,t4]}] = ghi đè số tướng cho Bàn from..to (đếm liên tục: Ải a Bàn b = (a−1)*10+b; ô trống = giữ mặc định)
    const FOE_CFG = cfgSnap('foe', { hp: 1000, atk: 200, def: 30, dodge: 0, growth: 1.32, bossMult: 1.2, counts: [2, 3, 4, 5], rules: [] });
    Object.assign(FOE_CFG, cfgGet('foe', {}));
    const foeNum = (v, d) => { v = Number(v); return (isFinite(v) && v > 0) ? v : d; };
    // Số tướng địch ở trận `wave` (1..4) của Bàn thứ `B` (đếm liên tục). Tối thiểu 1, tối đa 5 (đội hình chỉ có 5 vị trí).
    function foeCount(B, wave) {
      const dc = [2, 3, 4, 5][wave - 1], base = Array.isArray(FOE_CFG.counts) ? foeNum(FOE_CFG.counts[wave - 1], dc) : dc;
      let n = base;
      (Array.isArray(FOE_CFG.rules) ? FOE_CFG.rules : []).forEach(r => {
        if (!r || !Array.isArray(r.c)) return;
        const from = foeNum(r.from, 1), to = foeNum(r.to, Infinity);
        if (B >= from && B <= to) n = foeNum(r.c[wave - 1], n);
      });
      return Math.max(1, Math.min(5, Math.floor(n), enemyPool().length));
    }
    // n tướng ngẫu nhiên (không trùng) làm địch, chỉ số theo ải
    function heroFoes(n, k) {
      const picks = shuffled(enemyPool()).slice(0, n), S = HERO_POS[n].map(p => [100 - p[0], p[1] + HERO_DY]);
      return { picks, foes: picks.map((h, i) => {
        const u = makeUnit('enemy', heroIcon(h), S[i][0], S[i][1], foeNum(FOE_CFG.hp, 1000) * k, foeNum(FOE_CFG.atk, 200) * k, false, h.name);
        u.id = h.id; u.isHero = true;
        u.def = Math.max(0, Number(FOE_CFG.def) || 0); u.spd = h.spd; u.dodge = Math.max(0, Number(FOE_CFG.dodge) || 0); u.acc = 300; u.crit = h.crit || 0; u.critDmg = h.critDmg || 0; u.tough = h.tough || 0; u.pierce = h.pierce || 0; u.tia = Math.max(1, Math.floor(h.tia || 1)); u.block = h.block || 0; u.sk = 1;     // skill cấp 1, không cộng cấp/sao
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

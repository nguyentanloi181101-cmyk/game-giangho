/* TRẬN ĐẤU: âm thanh (tướng, đánh thường, nhạc nền)
   (tách từ index.html cũ — script) */

    // Chiêu cuối: tướng thường dùng kiểu lao vào đánh 3 đòn, Trương Tam Phong có chiêu riêng
    // Âm thanh tuyệt kỹ theo tướng (nhúng sẵn): id 0 = Ma Đao Thánh Nữ, id 2 = Chu Nguyên Chương, id 5 = Âu Cơ, id 8 = Lạc Long Quân, id 9 = Hỏa Thiên Tướng, id 10 = Bạch Ma Vương (Vô Nhai Tử: không có âm lúc bắt đầu chiêu, mỗi viên cờ rơi kêu 1 tiếng – xem playGoStone)
    const HERO_SND_SRC = { 0: 'assets/audio/heroes/00-ma-dao-thanh-nu.mp3', 2: 'assets/audio/heroes/02-chu-nguyen-chuong.mp3', 5: 'assets/audio/heroes/05-au-co.mp3', 9: 'assets/audio/heroes/09-dong-phuong-co-nuong.mp3', 8: 'assets/audio/heroes/08-lac-long-quan.mp3', 10: 'assets/audio/heroes/10-bach-ma-vuong.mp3' };
    const heroSnd = {};
    Object.keys(HERO_SND_SRC).forEach(id => { try { const a = new Audio(HERO_SND_SRC[id]); a.preload = 'auto'; heroSnd[id] = a; } catch (e) {} });
    function playHeroSound(id) {
      try {
        if (!audioSet.skill) return;
        const src = HERO_SND_SRC[id]; if (!src) return;
        const a = heroSnd[id] || (heroSnd[id] = new Audio(src));
        a.pause(); a.currentTime = 0;
        const p = a.play(); if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    }
    // Vô Nhai Tử: mỗi viên cờ rơi xuống kêu 1 tiếng (không phát lúc bắt đầu chiêu; mỗi viên 1 âm riêng nên tạo Audio mới để chồng được lên nhau)
    const GO_STONE_SND = 'assets/audio/go-stone.mp3';
    function playGoStone() {
      try {
        if (!audioSet.skill) return;
        const a = new Audio(GO_STONE_SND); a.volume = 1;
        const p = a.play(); if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    }
    // Âm mở màn: phát 1 lần mỗi khi vào trận (ải thường, Tỷ Võ… ở đâu cũng phát)
    const BATTLE_OPEN_SND = 'assets/audio/battle-open.mp3';
    let openSnd = null;
    function playBattleOpen() {
      try {
        if (!audioSet.skill) return;
        if (openSnd) { openSnd.pause(); openSnd.currentTime = 0; }
        openSnd = new Audio(BATTLE_OPEN_SND); openSnd.volume = 1;
        const p = openSnd.play(); if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    }
    // Âm đánh thường: tướng chưa đủ nộ để ulti hoặc đang bị câm lặng thì đánh thường kèm âm này (mỗi đòn 1 Audio mới để chồng được)
    const NORMAL_ATK_SND = 'assets/audio/normal-attack.mp3';
    function playNormalAtk() {
      try {
        if (!audioSet.skill) return;
        const a = new Audio(NORMAL_ATK_SND); a.volume = 0.9;
        const p = a.play(); if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    }
    const normalAttack = (u, foes, tok) => { playNormalAtk(); return attack(u, foes, 1, u.atk, tok); };
    // Nhạc nền trong mọi trận (ải thường & Tỷ Võ), lặp lại, nhỏ hơn âm tuyệt kỹ
    const BGM_SRC = 'assets/audio/bgm.mp3';
    let bgm = null;
    function playBgm() {
      try {
        if (!audioSet.bgm) return;
        if (!bgm) { bgm = new Audio(BGM_SRC); bgm.loop = true; bgm.volume = 0.35; }
        if (bgm.paused) { bgm.currentTime = 0; const p = bgm.play(); if (p && p.catch) p.catch(() => {}); }
      } catch (e) {}
    }
    function stopBgm() { try { if (bgm) { bgm.pause(); bgm.currentTime = 0; } if (openSnd) { openSnd.pause(); openSnd.currentTime = 0; } } catch (e) {} }
    function stopHeroSounds() { try { Object.values(heroSnd).forEach(a => { a.pause(); a.currentTime = 0; }); } catch (e) {} }

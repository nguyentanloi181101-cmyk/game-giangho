/* TRẬN ĐẤU: động cơ chung (đơn vị, sát thương, buff/debuff, hồi sinh)
   (tách từ index.html cũ — script) */

    // --- BATTLE SYSTEM (sàn đấu ngang, 1-5 tướng) ---
    let currentStage = 1, currentBattle = 1, currentWave = 1;
    let waveUnits = { heroes: [], enemies: [] };
    let isPlayerTurn = false, battleToken = 0, mult = 1;
    const HERO_HP = 100000;
    const HERO_POS = {
      1: [[30,55]],
      2: [[28,48],[28,64]],
      3: [[32,56],[22,44],[22,68]],
      4: [[30,47],[30,65],[19,47],[19,65]],
      5: [[34,56],[26,43],[26,69],[16,50],[16,62]]
    };
    // Dịch đội hình ra 2 bên 8% và xuống dưới 12% (giữ nguyên kích thước); địch lấy đối xứng nên cũng dịch theo
    // Chia ngang 10 phần: đội ta chiếm phần 0–4 (tâm x=20%), đội địch phần 6–10 (đối xứng, tâm x=80%), phần 4–6 ở giữa để trống
    Object.keys(HERO_POS).forEach(k => { HERO_POS[k] = HERO_POS[k].map(p => [20 + (p[0] - 8 - 17) * 1.2, p[1] + 12]); });
    const HERO_DY = -1;   // tâm đội hình nằm giữa vùng sân đấu (phần 2.5→7.5 trên 10 phần); địch dịch giống đội ta để 2 bên ngang nhau
    // Co nội dung bảng đội hình để luôn vừa đúng 2.5/10 chiều cao màn hình (điện thoại hay máy tính đều không lệch)
    function fitBattlePanel() {
      const p = document.querySelector('#battle-overlay .bf-panel'), c = p && p.querySelector('.bf-fit'); if (!c) return;
      const H = p.clientHeight; if (!H) return;
      c.style.transform = 'none'; c.style.width = '100%'; c.style.top = '0px';
      let k = 1, v = c.offsetHeight;
      for (let i = 0; i < 8 && v > H + 0.5; i++) { k = Math.max(0.3, k * H / v); c.style.width = (100 / k) + '%'; v = c.offsetHeight * k; }
      c.style.transform = k < 1 ? 'scale(' + k + ')' : 'none';
      c.style.top = Math.max(0, (H - v) / 2) + 'px';
    }
    (() => {
      let raf = 0; const go = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fitBattlePanel); };
      const p = document.querySelector('#battle-overlay .bf-panel'); if (!p) return;
      try { new ResizeObserver(go).observe(p); } catch (e) { window.addEventListener('resize', go); }
      try { new MutationObserver(go).observe(p.querySelector('.bf-fit'), { childList: true, subtree: true, characterData: true }); } catch (e) {}
      window.addEventListener('resize', go);
    })();
    let battleFast = false;   // Tỷ Võ: bấm "Bỏ Qua" để tua nhanh trận đấu
    let ultTimeScale = 1;   // các lần ulti lặp (lần 2, 3) chạy nhanh gấp đôi: thu ngắn cả thời gian chờ lẫn hoạt ảnh
    const sleep = ms => new Promise(r => setTimeout(r, battleFast ? 0 : ms * ultTimeScale));
    (() => {
      const _an = Element.prototype.animate;
      Element.prototype.animate = function (kf, opt) {
        if (ultTimeScale !== 1) {
          if (typeof opt === 'number') opt *= ultTimeScale;
          else if (opt && typeof opt === 'object') { opt = Object.assign({}, opt); ['duration', 'delay', 'endDelay'].forEach(k => { if (typeof opt[k] === 'number') opt[k] *= ultTimeScale; }); }
        }
        return _an.call(this, kf, opt);
      };
    })();
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];

    function formatNumber(num) {
      if (num < 1000) return Math.floor(num);
      const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
      const i = Math.floor(Math.log10(num) / 3);
      if (i >= units.length) return num.toExponential(2);
      return (num / Math.pow(10, i * 3)).toFixed(2) + units[i];
    }

    function makeUnit(side, emoji, x, y, hp, atk, big, name) {
      const el = document.createElement('div');
      el.className = `bf-unit ${side}${big ? ' big' : ''}`;
      el.style.left = x + '%'; el.style.top = y + '%'; el.style.zIndex = Math.round(y);
      el.innerHTML = `<div class="bf-name">${name || ''}</div><div class="bf-hp"><i></i><b class="bf-hpn">${formatNumber(hp)}</b></div><div class="bf-sprite">${emoji}</div><div class="bf-shadow"></div>`;
      document.getElementById('bf-units').appendChild(el);
      return { el, side, hp, max: hp, atk, x, y, alive: true, def: 0 };
    }

    function setHpBar(u) {
      u.el.querySelector('.bf-hp i').style.width = (u.hp / u.max * 100) + '%';
      const n = u.el.querySelector('.bf-hpn'); if (n) n.textContent = formatNumber(u.hp);
    }
    function removeMoon(u) { u.moon = 0; u.el.classList.remove('moon-on'); const ic = u.el.querySelector('.bf-moonshield'); if (ic) ic.remove(); }
    const noBuff = u => !!(u.dn && u.dn.nobuff > 0);          // Độc Cô Cầu Bại: đang bị khóa tăng phúc
    function applyMoon(u) {
      if (noBuff(u)) { floatText(u, '🚫 KHÓA TĂNG PHÚC'); return; }
      u.moon = MOON_TURNS;
      let ic = u.el.querySelector('.bf-moonshield');
      if (!ic) { ic = document.createElement('div'); ic.className = 'bf-moonshield'; u.el.appendChild(ic); }
      ic.innerHTML = '<b>🌙' + u.moon + '</b>';
    }
    function tickMoon(units) {
      units.forEach(u => { if (!(u.moon > 0)) return; u.moon--;
        if (u.moon <= 0) removeMoon(u); else { const b = u.el.querySelector('.bf-moonshield b'); if (b) b.textContent = '🌙' + u.moon; } });
    }
    // Giải TẤT CẢ hiệu ứng bất lợi (chảy máu, choáng) của phe
    function cleanse(units) {
      units.filter(a => a.alive).forEach(a => {
        let had = false;
        if (a.bleed > 0) { a.bleed = 0; a.bleedPct = 0; const ic = a.el.querySelector('.bf-bleed'); if (ic) ic.remove(); had = true; }
        if (a.dn && ['atk', 'def', 'heal', 'rage', 'silence', 'poison'].some(k => a.dn[k] > 0)) { clearDebuffs(a); had = true; }
        if (a.stun > 0) { a.stun = 0; a.el.classList.remove('stunned'); const ic = a.el.querySelector('.bf-stun'); if (ic) ic.remove(); had = true; }
        if (had) floatText(a, '✨ GIẢI HIỆU ỨNG');
      });
    }
    function hit(u, dmg, noRage, src, noRefl) {
      if (!u.alive) return;
      dmg = Math.round(dmg);
      let crit = false;
      if (src && !noRage && src.crit > 0 && src.side !== u.side) {   // Bạo kích: tỉ lệ = Bạo của người đánh − Bền của mục tiêu; sát thương ×(1.5 + Bạo Sát)
        if (Math.random() * 100 < Math.min(100, Math.max(0, src.crit - (u.tough || 0)))) { dmg = Math.round(dmg * (1.5 + (src.critDmg || 0) / 100)); crit = true; }
      }
      let refl = 0;
      if (u.moon > 0 && !noRage && !noRefl) {      // Khiên Trăng Khuyết: nhận 30%, phản 50% về địch
        refl = Math.round(dmg * MOON_REFLECT); dmg = Math.max(1, Math.round(dmg * MOON_TAKE));
        const ic = u.el.querySelector('.bf-moonshield'); if (ic) ic.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 260 });
      }
      if (u.dn && u.dn.immortal > 0 && dmg >= u.hp) { dmg = Math.max(0, u.hp - 1); floatText(u, '✨ BẤT TỬ'); }   // Thanh Y: không thể chết
      const hpBefore = u.hp;
      u.hp = Math.max(0, u.hp - dmg);
      if (pvp) pvpDmg[u.side === 'hero' ? 'enemy' : 'hero'] += hpBefore - u.hp;   // Tỷ Võ: cộng sát thương cho bên gây ra
      setHpBar(u);
      const d = document.createElement('div'); d.className = 'bf-dmg'; d.textContent = (crit ? '💥 ' : '') + formatNumber(dmg); if (crit) d.style.color = '#fbbf24';
      u.el.appendChild(d); setTimeout(() => d.remove(), 800);
      const fx = document.createElement('div'); fx.className = 'bf-fx'; fx.textContent = u.side === 'enemy' ? '⚔️' : '💥';
      u.el.appendChild(fx); setTimeout(() => fx.remove(), 350);
      u.el.classList.add('hurt'); setTimeout(() => u.el.classList.remove('hurt'), 180);
      if (u.hp <= 0) { u.alive = false; u.el.classList.add('dead'); u.stun = 0; if (u.moon) removeMoon(u); const ic = u.el.querySelector('.bf-stun'); if (ic) ic.remove(); }
      else if (u.rage != null && !noRage) gainRage(u, 20);
      refreshPanel();
      if (refl > 0) {
        const tgt = (src && src.alive && src.side !== u.side) ? src : rand(foesOf(u).filter(x => x.alive));
        if (tgt) { floatText(u, '🌙 PHẢN'); hit(tgt, refl, true, null, true); }
      }
    }

    // u lao tới mục tiêu, đánh `hits` đòn, rồi quay về
    async function attack(u, foes, hits, dmg, tok) {
      let t = pickTarget(foes);
      if (!t) return;
      const f = document.getElementById('battle-arena');
      let dx = (t.x - u.x) * f.clientWidth / 100, dy = (t.y - u.y) * f.clientHeight / 100;
      dx -= Math.sign(dx) * 55;
      const base = 'translate(-50%,-50%)';
      const go = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      u.el.animate([{ transform: base }, { transform: go }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
      await sleep(230); if (tok !== battleToken) return;
      for (let k = 0; k < hits; k++) {
        if (!t.alive) t = pickTarget(foes);
        if (!t) break;
        if (Math.random() * 100 < dodgeChance(t, u)) floatText(t, 'NÉ');   // Né của mục tiêu trừ Chuẩn của người đánh
        else hit(t, Math.max(1, dmg * 100 / (100 + (t.def || 0))), false, u);
        await sleep(150); if (tok !== battleToken) return;
      }
      u.el.animate([{ transform: go }, { transform: base }], { duration: 220, fill: 'forwards' });
      await sleep(230);
      u.el.getAnimations().forEach(a => a.cancel());
    }

    
    // Né vs Chuẩn tính theo ĐIỂM: Chuẩn phải cao hơn Né ít nhất ACC_GAP (300) điểm thì chắc chắn trúng (VD né 3000 -> chuẩn 3300).
    // Chuẩn ≤ Né: tỉ lệ né đầy đủ (= Né, tối đa 100%); ở giữa giảm dần theo đường thẳng.
    const ACC_GAP = 300;
    function dodgeChance(t, u) {
      const d = t.dodge || 0; if (d <= 0) return 0;
      const f = Math.min(1, Math.max(0, (d + ACC_GAP - (u.acc || 0)) / ACC_GAP));
      return Math.min(100, d) * f;
    }
    function floatText(u, t) {
      const d = document.createElement('div'); d.className = 'bf-dmg'; d.style.fontSize = '16px'; d.textContent = t;
      u.el.appendChild(d); setTimeout(() => d.remove(), 800);
    }
    // ---- Helper 2 phe: tướng địch (Trận 4) dùng lại đúng skill của tướng ta ----
    const foesOf   = u => u.side === 'hero' ? waveUnits.enemies : waveUnits.heroes;
    const alliesOf = u => u.side === 'hero' ? waveUnits.heroes  : waveUnits.enemies;
    const skillHit = (t, dmg) => hit(t, Math.max(1, dmg * 100 / (100 + (t.def || 0))));   // sát thương chiêu cũng trừ Thủ
    function clearDefBuff(units) {
      units.forEach(h => { if (h.defBuff) { h.def -= h.defBuff; h.defBuff = 0; const ic = h.el.querySelector('.bf-shield'); if (ic) ic.remove(); } });
    }
    // Chảy máu: mỗi hiệp mất 20% HP hiện tại
    async function tickBleed(units) {
      let bled = false;
      units.filter(u => u.alive).forEach(u => {
        if (u.bleed > 0) {
          const d = Math.round(u.hp * (u.bleedPct || BLEED_PCT));
          if (d >= 1) { hit(u, d, true); bled = true; }
          u.bleed--;
          if (u.bleed === 0) { u.bleedPct = 0; const ic = u.el.querySelector('.bf-bleed'); if (ic) ic.remove(); }
        }
        // Trúng độc (bướm Tím): mỗi hiệp mất 25% HP hiện tại
        if (u.alive && u.dn && u.dn.poison > 0) {
          const d = Math.round(u.hp * BF_POISON_PCT);
          if (d >= 1) { hit(u, d, true); bled = true; }
          u.dn.poison--; refreshDbf(u);
        }
      });
      return bled;
    }
    // ---- Hiệu ứng bất lợi của bướm Hoa Mãn Lâu (lưu trong u.dn: số hiệp còn lại theo từng loại) ----
    const BF_DN_ICON = { atk: '⚔️↓', def: '🛡️↓', heal: '💔', rage: '⚡↓', silence: '🤐', poison: '☠️', immortal: '✨', nobuff: '🚫✨' };
    function refreshDbf(u) {
      let ic = u.el.querySelector('.bf-dbf');
      const s = u.dn ? Object.keys(BF_DN_ICON).filter(k => u.dn[k] > 0).map(k => BF_DN_ICON[k]).join('') : '';
      if (!s) { if (ic) ic.remove(); return; }
      if (!ic) { ic = document.createElement('div'); ic.className = 'bf-dbf'; u.el.appendChild(ic); }
      ic.textContent = s;
    }
    const isSilenced = u => !!(u.dn && u.dn.silence > 0);
    // Thanh Y Tiên Tử: bất tử 3 hiệp đầu mỗi trận (HP không xuống dưới 1)
    // Vai trò (viền): tank = thủ đỏ • sup = hỗ trợ vàng • skill = kỹ năng xanh dương • atk = công kích cam
    const BF_ROLE_BADGE = { sup: '<svg viewBox="0 0 24 24"><rect x="10.6" y="0.8" width="2.8" height="3" rx="1" fill="#a16207"/><path d="M12 3.6c-1.5 0-2.5 1-2.5 2.3 0 .9.5 1.6 1.2 2-1.7.7-2.7 2.1-2.7 3.8 0 1.3.6 2.3 1.6 3-1.9.8-3.1 2.5-3.1 4.6 0 2.9 2.4 5.2 5.5 5.2s5.5-2.3 5.5-5.2c0-2.1-1.2-3.8-3.1-4.6 1-.7 1.6-1.7 1.6-3 0-1.7-1-3.1-2.7-3.8.7-.4 1.2-1.1 1.2-2 0-1.3-1-2.3-2.5-2.3z" fill="#f59e0b" stroke="#92400e" stroke-width="1"/><path d="M9.2 13.8h5.6" stroke="#dc2626" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="9.6" cy="18" rx="1.2" ry="2" fill="#fde68a" opacity=".7"/></svg>', atk: '🗡️', skill: '☯️', tank: '🛡️' };   // hỗ trợ/trị liệu = hồ lô • công kích = kiếm • kỹ năng = thái cực • thủ = khiên
    function applyRole(u) {
      const r = HERO_ROLE[u.id]; if (!r || !u.el) return;
      u.el.dataset.role = r; u.el.style.setProperty('--rc', ROLE_COLOR[r]);
      const sp = u.el.querySelector('.bf-sprite'), hb = heroById(u.id);
      if (sp && hb && hb.body && !sp.querySelector('.hero-body')) { sp.innerHTML = '<img class="hero-body" style="height:' + (hb.bodyH || 76) + 'px" src="' + hb.body + '">'; return; }
      if (sp && hb && hb.img && !hb.body && !sp.querySelector('.hero-body')) { sp.innerHTML = '<img class="hero-body hero-portrait" style="height:80px" src="' + hb.img + '">'; return; }
      if (sp && !sp.querySelector('.hero-img, .bf-emo, .hero-body')) sp.innerHTML = '<span class="bf-emo">' + sp.innerHTML + '</span>';
    }
    function grantStart(u) { applyRole(u); if (u.id === 1) { (u.dn = u.dn || {}).immortal = IMMORTAL_TURNS; refreshDbf(u); } }
    function tickImmortal(units) { units.forEach(u => { if (u.dn && u.dn.immortal > 0) { u.dn.immortal--; refreshDbf(u); } }); }
    const deadAllies = u => alliesOf(u).filter(a => !a.alive);
    // Không ulti được tuyệt kỹ: bị câm lặng, hoặc là Thanh Y mà chưa có đồng đội nào gục để hồi sinh
    const ultBlocked = u => isSilenced(u) || (u.id === 1 && !deadAllies(u).length);

    // Thanh Y Tiên Tử: mưa cánh hoa sen rơi từ trời xuống chỗ đồng đội đã gục -> hoa sen xanh nở -> tướng đó sống lại
    async function reviveUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight;
      const targets = shuffled(deadAllies(u)).slice(0, REVIVE_COUNT);
      if (!targets.length) return;
      const made = [];
      const mk = (cls, txt, x, y) => { const d = document.createElement('div'); d.className = cls; d.textContent = txt; d.style.left = x + '%'; d.style.top = y + '%'; box.appendChild(d); made.push(d); return d; };
      try {
        // 1. Mưa cánh hoa sen từ trời rơi xuống chỗ từng tướng đã gục
        sfxRocket();
        targets.forEach((t, ti) => {
          for (let i = 0; i < 18; i++) {
            const sx = t.x + (Math.random() - 0.5) * 26;
            const p = mk('bf-petal', '🪷', sx, -4); p.style.fontSize = (11 + Math.random() * 11) + 'px'; p.style.opacity = '0';
            const dx = (t.x - sx) * W / 100 + (Math.random() - 0.5) * 26, dy = (t.y + 3) * H / 100, sw = (Math.random() - 0.5) * 50;
            const T = (a, b, r) => `translate(calc(-50% + ${a}px),calc(-50% + ${b}px)) rotate(${r}deg)`;
            p.animate([
              { transform: T(0, 0, 0), opacity: 0 },
              { transform: T(dx * 0.3 + sw, dy * 0.3, 120), opacity: 1, offset: 0.15 },
              { transform: T(dx * 0.65 - sw, dy * 0.65, 260), opacity: 1, offset: 0.65 },
              { transform: T(dx, dy, 400), opacity: 0.9, offset: 0.92 },
              { transform: T(dx, dy, 420), opacity: 0 }
            ], { duration: 950 + Math.random() * 450, delay: ti * 350 + i * 55, easing: 'ease-in', fill: 'forwards' });
          }
        });
        await sleep(2000 + (targets.length - 1) * 350); if (tok !== battleToken) return;
        // 2. Hoa sen xanh nở ra tại chỗ tướng gục, tướng sống lại
        for (const t of targets) {
          const lt = mk('bf-lotus', '🪷', t.x, t.y);
          lt.animate([{ transform: 'translate(-50%,-50%) scale(0) rotate(-40deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.7) rotate(0deg)', opacity: 1, offset: 0.55 },
                      { transform: 'translate(-50%,-50%) scale(2.1) rotate(0deg)', opacity: 0 }], { duration: 1100, easing: 'ease-out', fill: 'forwards' });
          const w = mk('bf-wave', '', t.x, t.y); w.style.borderColor = '#4ade80'; w.style.boxShadow = '0 0 22px #22c55e, inset 0 0 22px #22c55e'; setTimeout(() => w.remove(), 650);
          sfxBell();
          t.alive = true; t.hp = Math.max(1, Math.round(t.max * REVIVE_HP_PCT)); t.rage = 0; t.stun = 0; t.bleed = 0; t.bleedPct = 0;
          clearDebuffs(t); t.el.classList.remove('dead', 'stunned', 'hurt');
          t.el.querySelectorAll('.bf-stun, .bf-bleed').forEach(ic => ic.remove());
          if (t.side === 'hero') t.acted = true;           // vừa hồi sinh: chưa ra đòn ngay trong lượt này
          setHpBar(t); floatText(t, '🪷 HỒI SINH'); refreshPanel();
          await sleep(450); if (tok !== battleToken) return;
        }
        await sleep(700);
      } finally {
        made.forEach(d => d.remove());
      }
    }
    function gainRage(u, n) {                                  // Lam: nhận nộ ít hơn 25%
      if (u.dn && u.dn.rage > 0) n = Math.round(n * (1 - BF_PCT));
      u.rage = Math.min(100, u.rage + n);
    }
    function endDebuff(u, k) {
      const d = u.dn; if (!d) return;
      if (k === 'atk') { u.atk += d.atkV || 0; d.atkV = 0; }
      if (k === 'def') { u.def = (u.def || 0) + (d.defV || 0); d.defV = 0; }
      d[k] = 0;
    }
    function tickDebuffs(units) {                              // giảm 1 hiệp các hiệu ứng (độc do tickBleed xử lý)
      units.forEach(u => {
        const d = u.dn; if (!d) return;
        ['atk', 'def', 'heal', 'rage', 'silence', 'nobuff'].forEach(k => { if (d[k] > 0 && --d[k] <= 0) endDebuff(u, k); });
        refreshDbf(u);
      });
    }
    function clearDebuffs(u) {
      if (!u.dn) return;
      ['atk', 'def', 'heal', 'rage', 'silence', 'poison', 'nobuff'].forEach(k => endDebuff(u, k));
      refreshDbf(u);
    }
    // Hiệu ứng của 1 con bướm đáp xuống: targets = toàn bộ địch
    function bflyEffect(c, targets) {
      const alive = targets.filter(e => e.alive);
      const say = (e, t) => setTimeout(() => { if (e.el.isConnected) floatText(e, t); }, 350);
      if (c.k === 'indigo') {                                   // Chàm: choáng 2 địch ngẫu nhiên 1 hiệp
        alive.slice().sort(() => Math.random() - 0.5).slice(0, BF_STUN_TARGETS).forEach(e => {
          stunEnemy(e, Math.max(BF_STUN_TURNS, e.stun || 0)); say(e, '💫 CHOÁNG ' + BF_STUN_TURNS + ' HIỆP');
        });
        return;
      }
      const mute = c.k === 'purple' ? alive.slice().sort(() => Math.random() - 0.5).slice(0, BF_SILENCE_TARGETS) : [];   // Tím: độc TOÀN địch, câm lặng chỉ 2 địch ngẫu nhiên
      alive.forEach(e => {
        const d = e.dn || (e.dn = {});
        if (c.k === 'red') {
          e.bleed = Math.max(e.bleed || 0, BF_TURNS); e.bleedPct = Math.max(e.bleedPct || 0, BF_PCT);
          if (!e.el.querySelector('.bf-bleed')) { const ic = document.createElement('div'); ic.className = 'bf-bleed'; ic.textContent = '🩸'; e.el.appendChild(ic); }
          say(e, '🩸 CHẢY MÁU');
        } else if (c.k === 'orange') {
          if (!(d.atk > 0)) { d.atkV = Math.min(e.atk - 1, Math.round(e.atk * BF_PCT)); e.atk -= d.atkV; }
          d.atk = BF_TURNS; say(e, '⚔️ GIẢM SÁT THƯƠNG ' + Math.round(BF_PCT * 100) + '%');
        } else if (c.k === 'yellow') {
          if (!(d.def > 0)) { d.defV = Math.round((e.def || 0) * BF_PCT); e.def = (e.def || 0) - d.defV; }
          d.def = BF_TURNS; say(e, '🛡️ GIẢM THỦ ' + Math.round(BF_PCT * 100) + '%');
        } else if (c.k === 'green') {
          d.heal = BF_TURNS; say(e, '💔 GIẢM HỒI MÁU ' + Math.round(BF_PCT * 100) + '%');
        } else if (c.k === 'blue') {
          d.rage = BF_TURNS; say(e, '⚡ GIẢM NỘ ' + Math.round(BF_PCT * 100) + '%');
        } else if (c.k === 'purple') {
          d.poison = BF_TURNS; if (mute.includes(e)) { d.silence = BF_TURNS; say(e, '☠️ ĐỘC + 🤐 CÂM LẶNG'); } else say(e, '☠️ TRÚNG ĐỘC');
        }
        refreshDbf(e);
      });
    }
    function stunEnemy(e, turns) {
      e.stun = turns;
      e.el.classList.add('stunned');
      if (!e.el.querySelector('.bf-stun')) {
        const d = document.createElement('div'); d.className = 'bf-stun'; d.textContent = '💫'; e.el.appendChild(d);
      }
    }

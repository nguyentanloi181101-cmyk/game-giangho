/* BOSS BANG: đánh trên đúng sàn đấu PVE (engine chung: hoạt ảnh skill thật của từng tướng, thẻ đội hình, Tự Động / Ulti Tất Cả / Hết Lượt / Chậm).
   Nạp SAU guild-sub.js. Dùng lại: bbCur, gdTick, gdSave, gdBossHp, gdBossAtk, gdBonus, gdDrops, BOSS_CFG, GD_BOSS, heroStats, team, ttImg, ttSt.
   Các móc vào engine (bossB != null): engine.js (hit / stunEnemy), pve-battle.js (loadWave, enemyTurn, nextWave, loseBattle, closeBattle).
   - Boss = 1 "địch" cỡ lớn bên phải; HP = HP còn lại của boss; sát thương lên boss ×BOSS_CFG.heroDmgMult; boss miễn choáng, mỗi nhát tối đa 3% HP.
   - Thần thú CỦA ĐỘI MÌNH đứng bệ góc trên trái (không có thần thú địch). Mỗi hiệp tích 20 nộ; đủ 100 nộ thì mượn thân 1 tướng NGẪU NHIÊN
     trong TẤT CẢ tướng của game để tung đúng tuyệt kỹ của tướng đó. Thần thú của mình đứng ngoài trận (không bị đánh).
   BOSS BANG (chính là 1 thần thú) mới là bên MIỄN NHIỄM mọi hiệu ứng bất lợi, có thanh nộ riêng: nộ đầu trận = BOSS_CFG.bossRage (100); đủ 100 nộ thì tung ulti NGẪU NHIÊN của 1 tướng bất kỳ. */
const BBT_BEAST_RAGE = 20;   // nộ thần thú nhận mỗi hiệp

function bbFight() {
  if (bossB) return;
  const [k, ct] = bbCur, s = gdTick(), key = ct ? 'bossCt' : 'boss', mx = gdBossHp(k, ct), cur = s[key][k] === undefined ? mx : s[key][k];
  if (s.left < 1) return scToast('Hết lượt hôm nay'); if (cur <= 0) return scToast('Boss đã bị hạ');
  if (!team.length) return scToast('Chưa có tướng trong đội');
  battleToken++; playBattleOpen(); battleFast = false; busy = false; currentWave = 1; currentStage = 1; currentBattle = 1;
  bossB = { k, ct, key, mx, cur, gb: gdBonus(), unit: null, tt: (typeof ttSt === 'function') ? ttSt().tt.cur : null, ttRage: 0, fin: false };
  document.getElementById('bf-units').innerHTML = '';
  const sel = HEROES.filter(h => team.includes(h.id)), pos = HERO_POS[sel.length].map(p => [p[0], p[1] + HERO_DY]);
  const _tm = ttMine(); ttSetupUI(_tm, null);   // chỉ thần thú của mình (bệ trái); không dựng bệ thần thú địch
  bbtBeastBar();
  waveUnits = {
    heroes: sel.map((h, i) => {
      const st = ttApply(Object.assign({}, heroStats(h.id)), ttBonus(_tm && _tm.pt));
      const u = makeUnit('hero', heroIcon(h), pos[i][0], pos[i][1], st.hp, st.atk, false, h.name);
      u.id = h.id; u.emoji = heroIcon(h); u.def = st.def; u.spd = st.spd; u.dodge = st.dodge; u.acc = st.acc; u.crit = st.crit; u.critDmg = st.critDmg; u.tough = st.tough; u.pierce = st.pierce; u.tia = st.tia || 1; u.block = st.block; u.regen = st.heal || 0; u.sk = skillMult(h.id); u.alwaysUlt = !!h.alwaysUlt; u.taunt = !!h.taunt; u.prio2 = !!h.prio2;
      u.rage = h.startRage || 0; grantStart(u); u.acted = false;
      return u;
    }),
    enemies: []
  };
  document.getElementById('battle-overlay').style.display = 'flex';
  loadWave();   // -> loadBossWave() vì bossB != null
}

function loadBossWave() {
  const B = bossB, tok = battleToken, b = GD_BOSS[B.k], nm = B.ct ? b[6] : b[0];
  document.getElementById('ui-stage-title').innerText = `${nm} • Bang cấp ${B.ct ? 10 : b[1]}`;
  document.getElementById('ui-wave-title').innerText = `Hiệp 1/${BOSS_CFG.maxRounds}`;
  document.getElementById('ui-enemy-name').innerText = 'BOSS BANG: ' + String(nm).toUpperCase();
  waveUnits.enemies.forEach(e => e.el.remove());
  const faceL = TT_FACE_LEFT.includes(b[0]);   // ảnh gốc quay trái thì giữ, quay phải thì lật để boss nhìn sang đội ta
  const u = makeUnit('enemy', ttImg(b[0], B.ct), 76, 58, B.cur, gdBossAtk(B.k, B.ct), true, nm);
  u.el.classList.add('bossu'); if (!faceL) u.el.classList.add('flip');
  u.max = B.mx; u.hp = B.cur; u.acc = 99999; u.def = 0; u.spd = 0; u.tia = 1; setHpBar(u);
  u.rage = Math.max(0, Math.min(100, Number(BOSS_CFG.bossRage) || 0));   // nộ đầu trận của boss
  bossProof(u);
  u.el.insertAdjacentHTML('beforeend', '<div class="bf-imm">🛡️ MIỄN NHIỄM</div><div class="bf-brg"><i></i></div>');
  bbtBossBar();
  B.unit = u; waveUnits.enemies = [u]; waveRound = 1;
  waveUnits.heroes.forEach(h => {
    h.acted = false; h.stun = 0; h.bleed = 0; h.bleedPct = 0; clearDebuffs(h); clearMods(h); grantStart(h);
    h.el.classList.remove('stunned'); h.el.querySelectorAll('.bf-stun, .bf-bleed').forEach(ic => ic.remove());
  });
  clearDefBuff(waveUnits.heroes);
  busy = false; isPlayerTurn = true; refreshPanel();
  setTimeout(() => { if (tok === battleToken) autoStep(); }, 600);
}

// Boss miễn nhiễm TẤT CẢ hiệu ứng bất lợi: choáng, chảy máu, độc, câm lặng, giảm Công/Thủ/hồi máu/nộ, khóa tăng phúc (đọc luôn ra 0, ghi bị bỏ qua)
function bossProof(u) {
  ['stun', 'bleed', 'bleedPct'].forEach(k => Object.defineProperty(u, k, { get: () => 0, set() {}, configurable: true }));
  const dn = new Proxy({}, { get: () => 0, set: () => true });
  Object.defineProperty(u, 'dn', { get: () => dn, set() {}, configurable: true });
}
function bbtBossBar() {
  const B = bossB, u = B && B.unit; if (!u) return;
  const i = u.el.querySelector('.bf-brg i'); if (i) i.style.width = Math.min(100, u.rage || 0) + '%';
}
// Lượt của boss: đủ nộ -> tung ulti của 1 tướng NGẪU NHIÊN trong tất cả tướng của game (mượn id/skill của tướng đó); chưa đủ nộ -> đánh thường +nộ
async function bossAct(e, tok) {
  if (e.rage >= 100 && !ultBlocked(e)) {
    e.rage = 0;
    const id = rand(HEROES.map(h => h.id).filter(i => i !== 1));   // Thanh Y (hồi sinh đồng đội) vô nghĩa với boss đơn
    floatText(e, '💥 ' + ((typeof HERO_ULT_NAME !== 'undefined' && HERO_ULT_NAME[id]) || 'Tuyệt kỹ'));
    Object.assign(e, { id, isHero: true, star: 5, sk: skillMult(id) * (Number(BOSS_CFG.ultMult) || 1) });
    refreshPanel();
    try { await ultimate(e, tok); } catch (err) { console.warn('boss ult', err); }
    finally { e.isHero = false; e.id = undefined; e.sk = 1; try { e.el.getAnimations().forEach(a => a.cancel()); } catch (x) {} }
  } else { gainRage(e, RAGE_ATK); await attack(e, waveUnits.heroes, 1, e.atk, tok); }
  refreshPanel();
}

function bbtBeastBar() {   // thanh nộ + nhãn miễn nhiễm của thần thú trên bệ trái
  const B = bossB, st = document.querySelector('#battle-arena .bf-bst.l'); if (!B || !st) return;
  let bar = st.querySelector('.bf-bst-rg');
  if (!bar) { bar = document.createElement('div'); bar.className = 'bf-bst-rg'; bar.innerHTML = '<span>🐾 ' + (B.tt || '') + '</span><div><i></i></div>'; st.appendChild(bar); }
  bar.querySelector('i').style.width = B.ttRage + '%';
}

// Hết mỗi hiệp: thần thú +nộ; đủ 100 nộ -> mượn thân 1 tướng ngẫu nhiên (trong tất cả tướng) tung tuyệt kỹ của tướng đó lên boss / cả đội.
async function bossBeastTick(tok) {
  const B = bossB; if (!B || !B.tt) return;
  B.ttRage = Math.min(100, B.ttRage + BBT_BEAST_RAGE); bbtBeastBar();
  if (B.ttRage < 100) return;
  const alive = waveUnits.heroes.filter(h => h.alive); if (!alive.length || !waveUnits.enemies.some(e => e.alive)) return;
  B.ttRage = 0; bbtBeastBar();
  let ids = HEROES.map(h => h.id); if (!waveUnits.heroes.some(h => !h.alive)) ids = ids.filter(i => i !== 1);   // Thanh Y chỉ có tác dụng khi có tướng gục
  const id = rand(ids), h = heroById(id), ref = alive.reduce((a, x) => x.atk > a.atk ? x : a, alive[0]);
  const g = makeUnit('hero', heroIcon(h), 24, 28, 1, Math.round(alive.reduce((a, x) => a + x.atk, 0) / alive.length), false, h.name);
  Object.assign(g, { id, emoji: heroIcon(h), def: ref.def, spd: ref.spd, dodge: ref.dodge, acc: 99999, crit: ref.crit, critDmg: ref.critDmg, tough: ref.tough, pierce: ref.pierce, tia: ref.tia || 1, block: ref.block, sk: skillMult(id), rage: 0, isGhost: true });
  try {
    applyRole(g); g.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
    floatText(g, '🐾 ' + B.tt); await sleep(500); if (tok !== battleToken) return;
    await ultimate(g, tok);
  } catch (e) { console.warn('beast ult', e); }
  finally { g.alive = false; try { g.el.remove(); } catch (e) {} }
  if (tok === battleToken) refreshPanel();
}

// Kết toán (giữ nguyên luật thưởng của bản cũ): ghi HP boss còn lại, trừ 1 lượt, điểm BOSS, rơi đồ khi hạ boss.
function bossFinish(title) {
  const B = bossB; if (!B || B.fin) return; B.fin = true;
  const left = Math.max(0, Math.round(B.unit ? B.unit.hp : B.cur)), killed = left <= 0, dmgDone = Math.max(0, Math.min(B.cur, B.cur - left));
  const s = gdTick(), k = B.k, ct = B.ct, key = B.key;
  s[key][k] = left; s.left--; const pts = Math.floor(dmgDone / BOSS_CFG.ptsPerDmg) + (killed ? BOSS_CFG.killPts : 0); s.pts += pts;
  let msg = `Gây ${fmtN(dmgDone)} sát thương\n+${pts} Điểm BOSS`;
  if (killed) {
    const e = new Date(); e.setHours(12, 0, 0, 0); if (e <= Date.now()) e.setDate(e.getDate() + 1);
    gdDrops(k).slice(0, 4 + Math.floor(Math.random() * 3)).forEach(d => { const q = [5, 10][Math.floor(Math.random() * 2)]; s.lots.push({ name: d[0], ico: d[1], qty: q, buy: q * 99999 * (ct ? 2 : 1), bid0: Math.max(10, q * Math.ceil(Math.random() * 6) * (ct ? 2 : 1)), bid: 0, mine: 0, exp: e.getTime() }); });
    msg += '\nBOSS BỊ HẠ! Vật phẩm đã rơi vào mục Đổi'; if (typeof gdNews === 'function') gdNews(`${pvName()} hạ ${GD_BOSS[k][0]}${ct ? ' Chí Tôn' : ''}`);
  }
  gdSave(s); const m = document.getElementById('boss-modal'); if (m) m.style.display = 'none';
  closeBattle();   // bossB.fin = true -> đóng bình thường (đặt bossB = null)
  if (typeof renderBangBoss === 'function') renderBangBoss();
  pvpToast(`${title}\n\n${msg}`, killed || title === 'CHIẾN THẮNG!');
}

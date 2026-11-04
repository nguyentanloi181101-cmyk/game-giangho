/* BOSS BANG: màn đánh trực quan (thay bbFight mô phỏng trong guild-sub.js).
   Nạp SAU guild-sub.js. Dùng lại: bbCur, gdTick, gdSave, gdBossHp, gdBossAtk, gdBonus, gdDrops, BOSS_CFG, heroStats, heroById, team, ttImg, ttSt. */
let bbtS = null;
const BBT_POS = [[60, 14], [46, 32], [72, 34], [58, 54], [76, 56]];

function bbFight() {
  if (bbtS) return;
  const [k, ct] = bbCur, s = gdTick(), key = ct ? 'bossCt' : 'boss', mx = gdBossHp(k, ct), cur = s[key][k] === undefined ? mx : s[key][k];
  if (s.left < 1) return scToast('Hết lượt hôm nay'); if (cur <= 0) return scToast('Boss đã bị hạ');
  if (!team.length) return scToast('Chưa có tướng trong đội');
  const gb = gdBonus();
  const heroes = team.map(id => { const t = heroStats(id), h = heroById(id) || {};
    return { id, name: h.name || '', img: h.img || '', body: h.body || h.img || '', hp: t.hp, max: t.hp, atk: t.atk, def: t.def, heal: gb.heal, rage: h.startRage || 0 }; });
  const tt = (typeof ttSt === 'function') ? ttSt().cur : null;
  bbtS = { k, ct, key, mx, cur, boss: cur, dmg: 0, round: 0, speed: 1, auto: false, gb, heroes, tt, ttRage: 0, bAtk: gdBossAtk(k, ct), done: false, timer: null };
  bbtBuild(); bbtDraw();
  bbtS.timer = setInterval(bbtStep, 900);
  bbtSpeed(1);
}
function bbtEl() { let e = document.getElementById('bbt'); if (!e) { e = document.createElement('div'); e.id = 'bbt'; document.body.appendChild(e); } return e; }
function bbtBuild() {
  const S = bbtS, b = GD_BOSS[S.k], root = bbtEl();
  root.innerHTML = `<div class="bbt-box"><div class="bbt-top"><b>${S.ct ? b[6] : b[0]} • Bang cấp ${S.ct ? 10 : b[1]}</b><button onclick="bbtQuit()">Thoát</button></div>
  <div class="bbt-res"><span>🪙 X0</span><span>🌾 X0</span><span>🧑 X0</span><span class="bbt-fast" id="bbt-fast" onclick="bbtSpeed()"><em>✔</em>Nhanh</span></div>
  <div class="bbt-arena" id="bbt-arena"><div class="bbt-boss" id="bbt-boss"><div class="bbt-bn">${fmtN(S.boss)}</div><div class="bbt-bhp"><i id="bbt-bhp"></i></div>${ttImg(b[0], S.ct)}</div>
  ${S.heroes.map((h, i) => { const p = BBT_POS[i] || BBT_POS[0]; return `<div class="bbt-h" id="bbt-h${i}" style="left:${p[0]}%;top:${p[1]}%"><img src="${h.body}" alt="${h.name}"><div class="hb"><i></i></div></div>`; }).join('')}
  <div class="bbt-timer" id="bbt-time">03:00</div><button class="bbt-treo off" id="bbt-treo" onclick="bbtAuto()">Treo</button></div>
  <div class="bbt-team"><div class="bbt-cards" id="bbt-cards"></div><div class="bbt-orbs" id="bbt-orbs" onclick="bbtOrb(event)"></div></div>
  <div class="bbt-end" id="bbt-end"></div></div>`;
  root.classList.add('on');
}
function bbtPop(host, txt, cls, big) {
  const a = document.getElementById('bbt-arena'); if (!a || !host) return; const r = host.getBoundingClientRect(), ar = a.getBoundingClientRect();
  const d = document.createElement('div'); d.className = 'bbt-dmg ' + (cls || ''); d.textContent = txt; d.style.left = (r.left - ar.left + r.width / 2 - 14 + Math.random() * 20) + 'px'; d.style.top = (r.top - ar.top + r.height * .3) + 'px'; d.style.fontSize = big ? '24px' : '14px';
  a.appendChild(d); setTimeout(() => d.remove(), 900);
}
function bbtFlash(el, c) { if (!el) return; el.classList.add(c); setTimeout(() => el.classList.remove(c), 160); }
function bbtHitBoss(d, i, big) {
  const S = bbtS; S.boss -= d; S.dmg += d;
  const bo = document.getElementById('bbt-boss'); bbtPop(bo, (big ? '💥' : '-') + fmtN(d), '', big); bbtFlash(bo, 'hit'); if (i >= 0) bbtFlash(document.getElementById('bbt-h' + i), 'atk');
}
function bbtStep() {
  const S = bbtS; if (!S || S.done) return; S.round++;
  S.heroes.forEach((h, i) => { if (h.hp <= 0) return; bbtHitBoss(Math.round(h.atk * BOSS_CFG.heroDmgMult * (.9 + Math.random() * .2)) + S.gb.boss, i, false); h.rage = Math.min(100, h.rage + 25); });
  if (S.tt) S.ttRage = Math.min(100, S.ttRage + 20);
  if (S.auto) { S.heroes.forEach((h, i) => bbtUlt(i)); if (S.tt) bbtBeast(); }
  if (S.boss > 0) {
    const alive = S.heroes.map((h, i) => i).filter(i => S.heroes[i].hp > 0);
    if (alive.length) { const i = alive[Math.floor(Math.random() * alive.length)], t = S.heroes[i], d = Math.max(1, S.bAtk - Math.round(t.def * .5)); t.hp -= d;
      const he = document.getElementById('bbt-h' + i); bbtPop(he, '-' + fmtN(d), 'r'); bbtFlash(he, 'hurt'); bbtFlash(document.getElementById('bbt-boss'), 'atk'); }
    S.heroes.forEach(h => { if (h.hp > 0 && h.heal) h.hp = Math.min(h.max, h.hp + h.heal); });
  }
  bbtDraw();
  if (S.boss <= 0) bbtFinish('CHIẾN THẮNG!'); else if (!S.heroes.some(h => h.hp > 0)) bbtFinish('THẤT BẠI'); else if (S.round >= BOSS_CFG.maxRounds) bbtFinish('HẾT GIỜ');
}
function bbtUlt(i) {
  const S = bbtS, h = S && S.heroes[i]; if (!S || S.done || !h || h.hp <= 0 || h.rage < 100) return;
  h.rage = 0; bbtHitBoss(Math.round(h.atk * BOSS_CFG.heroDmgMult * 3), i, true); bbtDraw();
}
function bbtBeast() {
  const S = bbtS; if (!S || S.done || !S.tt || S.ttRage < 100) return; S.ttRage = 0;
  S.heroes.forEach((h, i) => { if (h.hp > 0) { const v = Math.round(h.max * .15); h.hp = Math.min(h.max, h.hp + v); bbtPop(document.getElementById('bbt-h' + i), '+' + fmtN(v), 'g'); } }); bbtDraw();
}
function bbtOrb(e) { const o = e.target.closest('.bbt-o'); if (!o || !o.classList.contains('ready')) return; o.dataset.i === 'tt' ? bbtBeast() : bbtUlt(+o.dataset.i); if (bbtS && bbtS.boss <= 0 && !bbtS.done) bbtFinish('CHIẾN THẮNG!'); }
function bbtAuto() { const S = bbtS; if (!S) return; S.auto = !S.auto; document.getElementById('bbt-treo').classList.toggle('off', !S.auto); }
function bbtSpeed(force) {
  const S = bbtS; if (!S) return; S.speed = force ? 1 : (S.speed === 1 ? 3 : 1);
  clearInterval(S.timer); if (!S.done) S.timer = setInterval(bbtStep, 900 / S.speed);
  const f = document.getElementById('bbt-fast'); if (f) f.classList.toggle('on', S.speed > 1);
}
function bbtDraw() {
  const S = bbtS; if (!S) return;
  document.getElementById('bbt-bhp').style.width = Math.max(0, S.boss / S.mx * 100) + '%';
  const bn = document.querySelector('#bbt-boss .bbt-bn'); if (bn) bn.textContent = fmtN(Math.max(0, Math.round(S.boss)));
  const rem = Math.max(0, Math.round(180 * (1 - S.round / BOSS_CFG.maxRounds)));
  document.getElementById('bbt-time').textContent = String(Math.floor(rem / 60)).padStart(2, '0') + ':' + String(rem % 60).padStart(2, '0');
  S.heroes.forEach((h, i) => { const e = document.getElementById('bbt-h' + i); if (!e) return; e.classList.toggle('dead', h.hp <= 0); e.querySelector('.hb i').style.width = Math.max(0, h.hp / h.max * 100) + '%'; });
  let c = '', o = '';
  S.heroes.forEach((h, i) => { c += `<div class="bbt-c ${h.hp > 0 ? '' : 'dead'}"><div class="pic"><img src="${h.img}" alt=""></div><div class="pw">⚔ ${fmtN(h.atk)}</div><div class="b1"><i style="width:${Math.max(0, h.hp / h.max * 100)}%"></i></div><div class="b2"><i style="width:${h.rage}%"></i></div></div>`;
    o += `<div class="bbt-o ${h.rage >= 100 && h.hp > 0 ? 'ready' : ''}" data-i="${i}">${h.rage >= 100 ? 'ULTI' : h.rage}</div>`; });
  if (S.tt) { c += `<div class="bbt-c"><div class="pic">${ttImg(S.tt, 0)}</div><div class="pw">Thần Thú</div><div class="b1"><i style="width:100%"></i></div><div class="b2"><i style="width:${S.ttRage}%"></i></div></div>`; o += `<div class="bbt-o tt ${S.ttRage >= 100 ? 'ready' : ''}" data-i="tt">${S.ttRage >= 100 ? 'HỒI' : S.ttRage}</div>`; }
  document.getElementById('bbt-cards').innerHTML = c; document.getElementById('bbt-orbs').innerHTML = o;
}
function bbtQuit() { if (!bbtS || bbtS.done) return; if (confirm('Thoát trận? Sát thương đã gây vẫn được tính và mất 1 lượt.')) bbtFinish('ĐÃ THOÁT'); }
function bbtFinish(title) {   // kết toán: giữ nguyên luật thưởng của bản cũ
  const S = bbtS; if (!S || S.done) return; S.done = true; clearInterval(S.timer);
  const s = gdTick(), k = S.k, ct = S.ct, key = S.key; const killed = S.boss <= 0; const boss = Math.max(0, S.boss), dmgDone = Math.min(S.dmg, S.cur);
  s[key][k] = boss; s.left--; const pts = Math.floor(dmgDone / BOSS_CFG.ptsPerDmg) + (killed ? BOSS_CFG.killPts : 0); s.pts += pts;
  let msg = `Gây ${fmtN(dmgDone)} sát thương<br>+${pts} Điểm BOSS`;
  if (killed) {
    const e = new Date(); e.setHours(12, 0, 0, 0); if (e <= Date.now()) e.setDate(e.getDate() + 1);
    gdDrops(k).slice(0, 4 + Math.floor(Math.random() * 3)).forEach(d => { const q = [5, 10][Math.floor(Math.random() * 2)]; s.lots.push({ name: d[0], ico: d[1], qty: q, buy: q * 99999 * (ct ? 2 : 1), bid0: Math.max(10, q * Math.ceil(Math.random() * 6) * (ct ? 2 : 1)), bid: 0, mine: 0, exp: e.getTime() }); });
    msg += '<br>BOSS BỊ HẠ! Vật phẩm đã rơi vào mục Đổi'; if (typeof gdNews === 'function') gdNews(`${pvName()} hạ ${GD_BOSS[k][0]}${ct ? ' Chí Tôn' : ''}`);
  }
  gdSave(s); const m = document.getElementById('boss-modal'); if (m) m.style.display = 'none';
  const en = document.getElementById('bbt-end'); en.innerHTML = `<h2>${title}</h2><p>${msg}</p><button onclick="bbtClose()">Xác nhận</button>`; en.classList.add('on');
}
function bbtClose() { const r = document.getElementById('bbt'); if (r) { r.classList.remove('on'); r.innerHTML = ''; } bbtS = null; if (typeof renderBangBoss === 'function') renderBangBoss(); }

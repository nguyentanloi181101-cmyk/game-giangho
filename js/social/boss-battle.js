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

/* ===== HIỆU ỨNG KỸ NĂNG (mỗi tướng 1 kiểu; tên ulti lấy từ HERO_ULT_NAME) =====
   kiểu: slash = nhát chém • beam = cột sáng từ trên • burst = vòng nổ • rain = mưa vật thể • shot = đạn bay từ tướng tới boss */
const BBT_FX = {
  0: ['🌀', '#c084fc', 'slash'], 1: ['🌿', '#4ade80', 'rain'], 2: ['🌙', '#fde68a', 'beam'], 3: ['🌪️', '#a855f7', 'burst'], 4: ['☯️', '#93c5fd', 'burst'],
  5: ['🪷', '#f9a8d4', 'rain'], 6: ['🦋', '#c4b5fd', 'rain'], 7: ['🐉', '#fbbf24', 'shot'], 8: ['🌊', '#38bdf8', 'shot'], 9: ['🔥', '#fb923c', 'burst'],
  10: ['💀', '#f87171', 'shot'], 11: ['♟️', '#67e8f9', 'rain'], 12: ['👤', '#60a5fa', 'shot'], 13: ['🎋', '#86efac', 'rain'], 14: ['🎵', '#fda4af', 'burst'],
  15: ['🐸', '#a3e635', 'shot'], 16: ['☀️', '#fde047', 'beam'], 17: ['🗡️', '#fcd34d', 'beam']
};
const bbtSp = () => (bbtS && bbtS.speed) || 1;
function bbtArena() { return document.getElementById('bbt-arena'); }
function bbtCtr(el) {   // tâm của el, toạ độ theo đấu trường
  const a = bbtArena(); if (!a || !el) return null; const r = el.getBoundingClientRect(), ar = a.getBoundingClientRect();
  return { x: r.left - ar.left + r.width / 2, y: r.top - ar.top + r.height / 2, w: r.width, h: r.height };
}
function bbtFxEl(txt, css, ms) {
  const a = bbtArena(); if (!a) return null; const e = document.createElement('div'); e.className = 'bbt-fx'; if (txt) e.textContent = txt;
  Object.assign(e.style, css || {}); a.appendChild(e); setTimeout(() => e.remove(), ms + 60); return e;
}
function bbtShot(from, to, ico, ms, jit) {   // 1 viên bay từ from -> to
  const A = bbtCtr(from), B = bbtCtr(to); if (!A || !B) return; ms = ms / bbtSp();
  const e = bbtFxEl(ico, { fontSize: '20px' }, ms); if (!e) return;
  const jx = (Math.random() - .5) * (jit || 0), jy = (Math.random() - .5) * (jit || 0);
  e.animate([{ transform: `translate(${A.x - 10}px,${A.y - 10}px) scale(.8)`, opacity: 1 }, { transform: `translate(${B.x - 10 + jx}px,${B.y - 10 + jy}px) scale(1.3)`, opacity: .9 }], { duration: ms, easing: 'ease-in' });
}
function bbtRing(at, color, size, ms) {
  const C = bbtCtr(at); if (!C) return; ms = ms / bbtSp();
  const e = bbtFxEl('', { left: (C.x - size / 2) + 'px', top: (C.y - size / 2) + 'px', width: size + 'px', height: size + 'px', borderRadius: '50%', border: '4px solid ' + color, boxShadow: `0 0 18px ${color},inset 0 0 18px ${color}` }, ms);
  if (e) e.animate([{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: ms, easing: 'ease-out' });
}
function bbtSlashAt(at, color, n) {
  const C = bbtCtr(at); if (!C) return;
  for (let k = 0; k < n; k++) setTimeout(() => {
    const L = C.w * .9, e = bbtFxEl('', { left: (C.x - L / 2 + (Math.random() - .5) * C.w * .4) + 'px', top: (C.y + (Math.random() - .5) * C.h * .6) + 'px', width: L + 'px', height: '5px', borderRadius: '5px', background: `linear-gradient(90deg,transparent,${color},#fff,${color},transparent)`, boxShadow: '0 0 10px ' + color }, 300);
    if (e) e.animate([{ transform: `rotate(${-35 + Math.random() * 70}deg) scaleX(0)`, opacity: 1 }, { transform: `rotate(${-35 + Math.random() * 70}deg) scaleX(1)`, opacity: 1, offset: .5 }, { transform: `rotate(${-35 + Math.random() * 70}deg) scaleX(1)`, opacity: 0 }], { duration: 300 / bbtSp() });
  }, k * 70 / bbtSp());
}
function bbtShake(px, ms) { const a = bbtArena(); if (!a) return; ms /= bbtSp(); a.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${-px}px,${px / 2}px)` }, { transform: `translate(${px}px,${-px / 2}px)` }, { transform: `translate(${-px / 2}px,0)` }, { transform: 'translate(0,0)' }], { duration: ms }); }
function bbtFlashScreen(color, ms) { const e = bbtFxEl('', { inset: '0', background: color, zIndex: 6 }, ms / bbtSp()); if (e) e.animate([{ opacity: .45 }, { opacity: 0 }], { duration: ms / bbtSp() }); }
function bbtBanner(host, txt, color) {   // tên tuyệt kỹ bay lên trên đầu tướng
  const C = bbtCtr(host); if (!C) return; const ms = 1100 / bbtSp();
  const e = bbtFxEl(txt, { left: Math.max(4, Math.min(C.x - 60, (bbtArena().clientWidth - 130))) + 'px', top: (C.y - C.h / 2 - 16) + 'px', width: '130px', textAlign: 'center', fontSize: '12px', fontWeight: '900', color: '#fff', textShadow: `0 0 6px ${color},0 0 3px #000,0 0 3px #000`, zIndex: 9 }, ms);
  if (e) e.animate([{ transform: 'translateY(8px) scale(.6)', opacity: 0 }, { transform: 'translateY(-4px) scale(1.15)', opacity: 1, offset: .25 }, { transform: 'translateY(-26px) scale(1)', opacity: 0 }], { duration: ms });
}
function bbtUltFx(i) {   // hiệu ứng tuyệt kỹ của tướng i lên boss
  const S = bbtS, h = S.heroes[i], he = document.getElementById('bbt-h' + i), bo = document.getElementById('bbt-boss'), B = bbtCtr(bo); if (!he || !bo || !B) return;
  const [ico, color, kind] = BBT_FX[h.id] || ['💥', '#fde047', 'burst'];
  bbtBanner(he, (typeof HERO_ULT_NAME !== 'undefined' && HERO_ULT_NAME[h.id]) || 'Tuyệt kỹ', color);
  he.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25) translateY(-8px)', filter: `drop-shadow(0 0 14px ${color})` }, { transform: 'scale(1)' }], { duration: 600 / bbtSp() });
  bbtFlashScreen(color, 450);
  const sp = bbtSp(), at = (ms, fn) => setTimeout(fn, ms / sp);
  if (kind === 'slash') { at(150, () => bbtSlashAt(bo, color, 7)); at(150, () => bbtRing(bo, color, B.w)); }
  else if (kind === 'beam') {
    const W = 70, ms = 700 / sp, e = bbtFxEl('', { left: (B.x - W / 2) + 'px', top: '0', width: W + 'px', height: (B.y + B.h * .2) + 'px', background: `linear-gradient(180deg,transparent,${color},#fff)`, boxShadow: `0 0 26px ${color}`, transformOrigin: '50% 0' }, ms);
    if (e) e.animate([{ transform: 'scaleY(0)', opacity: 1 }, { transform: 'scaleY(1)', opacity: 1, offset: .35 }, { transform: 'scaleY(1)', opacity: 0 }], { duration: ms });
    at(250, () => { bbtRing(bo, color, B.w * .9); for (let k = 0; k < 10; k++) bbtShot(bo, bo, ico, 500, B.w * 1.2); });
  } else if (kind === 'burst') {
    at(180, () => { bbtRing(bo, color, B.w * .8, 600); const c = bbtFxEl(ico, { left: (B.x - 30) + 'px', top: (B.y - 30) + 'px', fontSize: '60px' }, 700 / sp); if (c) c.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.8) rotate(120deg)', opacity: 0 }], { duration: 700 / sp }); });
    at(320, () => bbtRing(bo, color, B.w * 1.2, 600));
  } else if (kind === 'rain') {
    for (let k = 0; k < 14; k++) at(120 + k * 45, () => { const x = B.x + (Math.random() - .5) * B.w, ms = 520 / sp, e = bbtFxEl(ico, { fontSize: (16 + Math.random() * 12) + 'px' }, ms);
      if (e) e.animate([{ transform: `translate(${x}px,${B.y - B.h * .8}px)`, opacity: 1 }, { transform: `translate(${x + (Math.random() - .5) * 30}px,${B.y + B.h * .15}px)`, opacity: .85 }], { duration: ms, easing: 'ease-in' }); });
    at(700, () => bbtRing(bo, color, B.w * .8, 500));
  } else {   // shot
    for (let k = 0; k < 8; k++) at(100 + k * 60, () => bbtShot(he, bo, ico, 380, B.h * .5));
    at(560, () => bbtRing(bo, color, B.w * .9, 500));
  }
  at(260, () => bbtShake(7, 380));
}
function bbtAtkFx(i) { const he = document.getElementById('bbt-h' + i), bo = document.getElementById('bbt-boss'); if (he && bo) bbtShot(he, bo, '✦', 240, 30); }
function bbtBossAtkFx(i) { const he = document.getElementById('bbt-h' + i); if (!he) return; bbtSlashAt(he, '#ff5a5a', 3); bbtShake(4, 220); }
function bbtBeastFx() {
  const S = bbtS, bo = document.getElementById('bbt-boss'); bbtBanner(bo, 'Thần Thú ' + S.tt, '#6dff8a'); bbtFlashScreen('#6dff8a', 500);
  S.heroes.forEach((h, i) => { if (h.hp > 0) { const he = document.getElementById('bbt-h' + i); bbtRing(he, '#6dff8a', 70, 700); const e = bbtFxEl('💚', { fontSize: '18px' }, 800 / bbtSp()), C = bbtCtr(he); if (e && C) e.animate([{ transform: `translate(${C.x - 9}px,${C.y}px)`, opacity: 1 }, { transform: `translate(${C.x - 9}px,${C.y - 50}px)`, opacity: 0 }], { duration: 800 / bbtSp() }); } });
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
  S.heroes.forEach((h, i) => { if (h.hp <= 0) return; bbtAtkFx(i); bbtHitBoss(Math.round(h.atk * BOSS_CFG.heroDmgMult * (.9 + Math.random() * .2)) + S.gb.boss, i, false); h.rage = Math.min(100, h.rage + 25); });
  if (S.tt) S.ttRage = Math.min(100, S.ttRage + 20);
  if (S.auto) { S.heroes.forEach((h, i) => bbtUlt(i)); if (S.tt) bbtBeast(); }
  if (S.boss > 0) {
    const alive = S.heroes.map((h, i) => i).filter(i => S.heroes[i].hp > 0);
    if (alive.length) { const i = alive[Math.floor(Math.random() * alive.length)], t = S.heroes[i], d = Math.max(1, S.bAtk - Math.round(t.def * .5)); t.hp -= d;
      const he = document.getElementById('bbt-h' + i); bbtPop(he, '-' + fmtN(d), 'r'); bbtFlash(he, 'hurt'); bbtFlash(document.getElementById('bbt-boss'), 'atk'); bbtBossAtkFx(i); }
    S.heroes.forEach(h => { if (h.hp > 0 && h.heal) h.hp = Math.min(h.max, h.hp + h.heal); });
  }
  bbtDraw();
  if (S.boss <= 0) bbtFinish('CHIẾN THẮNG!'); else if (!S.heroes.some(h => h.hp > 0)) bbtFinish('THẤT BẠI'); else if (S.round >= BOSS_CFG.maxRounds) bbtFinish('HẾT GIỜ');
}
function bbtUlt(i) {
  const S = bbtS, h = S && S.heroes[i]; if (!S || S.done || !h || h.hp <= 0 || h.rage < 100) return;
  h.rage = 0; bbtUltFx(i); bbtHitBoss(Math.round(h.atk * BOSS_CFG.heroDmgMult * 3), i, true); bbtDraw();
}
function bbtBeast() {
  const S = bbtS; if (!S || S.done || !S.tt || S.ttRage < 100) return; S.ttRage = 0; bbtBeastFx();
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

/* KINH MẠCH — file lẻ, tự chứa cả giao diện + CSS + logic.
   Cách gắn: chép file này vào js/heroes/kinhmach.js, thêm 1 dòng vào index.html (ngay TRƯỚC boot.js):
       <script src="js/heroes/kinhmach.js?v=1"></script>
   Vào game: Võ Hiệp (thanh dưới) -> Kinh Mạch -> chọn tướng -> bản đồ 9 chấm mạch -> bấm chấm để tăng cấp. */
(function () {

  /* ================= CẤU HÌNH (sửa số ở đây) ================= */
  const KM_BASE   = 5000;      // điểm mạch của chấm đầu; mỗi chấm sau GẤP ĐÔI chấm trước
  const KM_PTS    = 100;       // mỗi lần "Tăng cấp" cộng bao nhiêu điểm mạch
  const KM_SHARD  = 5;         // mỗi lần tốn bao nhiêu mảnh của CHÍNH tướng đó
  const KM_SILVER = 200000;    // mỗi lần tốn bao nhiêu bạc
  // Thuộc tính cộng khi chấm mạch ĐỦ điểm. spd/def/dodge: nhân (1 + %). tough/block: gốc = 0 nên cộng thẳng điểm.
  const KM_NODES = [
    { name: 'Xích Viêm',   b: { spd: 10 } },
    { name: 'Thiết Bích',  b: { def: 75 } },
    { name: 'Phong Hành',  b: { spd: 10 } },
    { name: 'Vân Ảnh',     b: { dodge: 35, spd: 10 } },
    { name: 'Kim Cang',    b: { def: 75, spd: 15 } },
    { name: 'Linh Phong',  b: { spd: 10, dodge: 35 } },
    { name: 'Địa Căn',     b: { spd: 15, tough: 40 } },
    { name: 'Thiên Căn',   b: { spd: 20, tough: 40 } },
    { name: 'Hỗn Nguyên',  b: { spd: 20, block: 10 } }
  ];
  // Vị trí từng chấm trên bản đồ (% theo chiều ngang, % theo chiều dọc) — đúng hình mẫu
  const KM_POS = [[7.3, 82.3], [20.5, 57.3], [34.2, 38.8], [57.7, 50.9], [31.6, 66.8], [48.7, 81], [78.2, 65.5], [90.6, 44.4], [61.1, 28.9]];
  const KM_STAT = { spd: 'Tốc', def: 'Thủ', dodge: 'Né', tough: 'Bền', block: 'Đỡ đòn' };
  /* ============================================================ */

  const N = KM_NODES.length;
  const kmReq = i => KM_BASE * Math.pow(2, i);                 // điểm cần của chấm i (i từ 0)
  let kmProg = loadJSON('km_prog');                             // { heroId: [điểm chấm 1..9] }
  let kmHero = 0, kmNode = 0;

  const kmPts   = (id, i) => Math.min(kmReq(i), Math.max(0, ((kmProg[id] || [])[i]) | 0));
  const kmDone  = (id, i) => kmPts(id, i) >= kmReq(i);
  const kmOpenN = (id, i) => i === 0 || kmDone(id, i - 1);      // chấm trước đủ điểm mới mở chấm sau
  const kmCur   = id => { for (let i = 0; i < N; i++) if (!kmDone(id, i)) return i; return N; };
  const kmCount = id => { let c = 0; for (let i = 0; i < N; i++) if (kmDone(id, i)) c++; return c; };
  const kmSave  = () => saveJSON('km_prog', kmProg);
  const fmtB = (k, v) => `${KM_STAT[k]} +${v}%`;

  // Tổng thuộc tính cộng từ các chấm ĐÃ ĐỦ điểm
  function kmBonus(id) {
    const t = { spd: 0, def: 0, dodge: 0, tough: 0, block: 0 }; let any = false;
    for (let i = 0; i < N; i++) if (kmDone(id, i)) { any = true; for (const k in KM_NODES[i].b) t[k] += KM_NODES[i].b[k]; }
    return any ? t : null;
  }

  /* ---- Gắn vào chỉ số tướng (mọi nơi dùng heroStats đều ăn: PVE, Tỷ Võ, chi tiết tướng...) ---- */
  const _heroStats = heroStats;
  heroStats = function (id, base) {
    const s = _heroStats(id, base), b = kmBonus(id);
    if (!b) return s;
    s.spd   = Math.round(s.spd * (1 + b.spd / 100));
    s.def   = Math.round(s.def * (1 + b.def / 100));
    s.dodge = Math.round(s.dodge * (1 + b.dodge / 100) * 10) / 10;
    s.tough = (s.tough || 0) + b.tough;
    s.block = Math.min(100, (s.block || 0) + b.block);
    return s;
  };
  window.kmBonus = kmBonus;
  if (typeof SV_KEYS !== 'undefined' && SV_KEYS.indexOf('km_prog') < 0) SV_KEYS.push('km_prog');   // sao lưu + đồng bộ mây

  /* ---- Nối nút "Kinh Mạch" ở Hub Võ Hiệp ---- */
  const _vhGo = vhGo;
  vhGo = function (k) { if (k === 'kinhmach') return kmOpenPicker(); return _vhGo(k); };

  /* ---- Giữ thanh trên + thanh dưới khi ở màn Kinh Mạch ---- */
  const _sw = switchScreen;
  switchScreen = function (id) {
    _sw(id);
    if (id === 'kmpick' || id === 'km' || id === 'kmnode') {
      document.getElementById('app-header').style.display = 'block';
      document.getElementById('app-nav').style.display = 'flex';
      const b = document.getElementById('nav-btn-vhub'); if (b) b.classList.add('active');
    }
  };

  /* ================= CSS ================= */
  const css = document.createElement('style');
  css.textContent = `
.km-body{flex:1;overflow-y:auto;padding:0}
.km-bar{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,.4);border-bottom:2px solid #fde047}
.km-bar h2{flex:1;margin:0;font-size:18px;color:#fff;text-shadow:0 2px 3px #000}
.km-btn{background:linear-gradient(180deg,#38bdf8,#1d4ed8);border:1px solid #bae6fd;border-radius:8px;color:#fff;font-weight:900;font-size:12px;padding:6px 12px;cursor:pointer}
.km-sky{position:relative;background:
 radial-gradient(1.2px 1.2px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 28% 72%,#fff,transparent),radial-gradient(1.4px 1.4px at 44% 10%,#fff,transparent),
 radial-gradient(1px 1px at 63% 38%,#fff,transparent),radial-gradient(1.3px 1.3px at 80% 20%,#fff,transparent),radial-gradient(1px 1px at 90% 78%,#fff,transparent),
 radial-gradient(1px 1px at 8% 50%,#fff,transparent),radial-gradient(1.2px 1.2px at 72% 88%,#fff,transparent),radial-gradient(1px 1px at 52% 60%,#fff,transparent),
 radial-gradient(ellipse at 50% 45%,#7a4a6b55 0,transparent 55%),radial-gradient(ellipse at 50% 50%,#2b3a8c 0,#0b1030 70%,#05071a 100%)}
.km-map{aspect-ratio:1/1;width:100%;max-height:calc(100vh - 230px);margin:0 auto}
.km-sil{position:absolute;inset:0;width:100%;height:100%;opacity:.55;pointer-events:none}
.km-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.km-lines line{stroke:#38bdf8;stroke-width:3.5;stroke-linecap:round;vector-effect:non-scaling-stroke;opacity:.35}
.km-lines line.on{opacity:.95;filter:drop-shadow(0 0 3px #38bdf8)}
.km-n{position:absolute;width:15%;aspect-ratio:1;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent}
.km-n .o{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center}
.km-n.sw .o{background:conic-gradient(from 0deg,#fff,#8a8a8a,#fff,#6f6f6f,#fff,#9a9a9a,#fff);-webkit-mask:radial-gradient(circle,#000 38%,transparent 71%);mask:radial-gradient(circle,#000 38%,transparent 71%)}
.km-n.fl .o{font-size:min(9vw,52px);filter:grayscale(1) brightness(1.7) drop-shadow(0 0 4px #fff)}
.km-n.lock{filter:brightness(.8)}
.km-n.cur.sw .o{background:conic-gradient(from 0deg,#d1fae5,#10b981,#d1fae5,#059669,#d1fae5,#34d399,#d1fae5);animation:kmspin 5s linear infinite}
.km-n.cur.fl .o{filter:hue-rotate(95deg) drop-shadow(0 0 6px #4ade80);animation:kmpulse 1.4s ease-in-out infinite}
.km-n.done.sw .o{background:conic-gradient(from 0deg,#fff7c2,#f59e0b,#fff7c2,#d97706,#fff7c2,#fbbf24,#fff7c2)}
.km-n.done.fl .o{filter:drop-shadow(0 0 7px #f97316)}
.km-n.cur{filter:drop-shadow(0 0 8px #4ade80)}
.km-n.done{filter:drop-shadow(0 0 8px #fbbf24)}
.km-n small{position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);font-size:9px;font-weight:800;color:#e2e8f0;text-shadow:0 1px 2px #000;white-space:nowrap}
@keyframes kmspin{to{transform:rotate(360deg)}}
@keyframes kmpulse{50%{transform:scale(1.12)}}
.km-sum{padding:6px 10px;display:flex;flex-wrap:wrap;gap:5px;justify-content:center;background:rgba(0,0,0,.35)}
.km-sum span{font-size:11px;font-weight:800;color:#fde047;background:#0007;border:1px solid #fde04788;border-radius:10px;padding:2px 8px}
.km-sum em{font-style:normal;color:#cbd5e1;font-size:11px}
.km-nm{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#fff;font-size:16px;padding:6px 8px;background:rgba(0,0,0,.25)}
.km-nm b{flex:1;min-width:0;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.km-nm button{flex:none;background:#0006;border:2px solid #fde047;color:#fde047;border-radius:50%;width:28px;height:28px;font-weight:900}
.kd{padding:6px 10px 20px;display:flex;flex-direction:column;align-items:center}
.kd h3{margin:4px 0 6px;font-size:22px;color:#fff;text-shadow:0 2px 4px #000;text-align:center}
.kd-ring{width:min(62vw,300px);aspect-ratio:1;border-radius:50%;padding:7px;background:conic-gradient(var(--c) calc(var(--p)*1%),rgba(255,255,255,.14) 0)}
.kd-orb{width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#0b1030cc 0,#05071a 100%);display:flex;align-items:center;justify-content:center;position:relative}
.kd-orb .sp{position:absolute;inset:8%;border-radius:50%;background:conic-gradient(from 0deg,#fff,#8a8a8a,#fff,#6f6f6f,#fff,#9a9a9a,#fff);-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 30%,transparent 70%);opacity:.9}
.kd-orb.fl .sp{background:none;-webkit-mask:none;mask:none;display:flex;align-items:center;justify-content:center;font-size:min(30vw,140px);filter:grayscale(1) brightness(1.7)}
.kd-orb.done .sp{background:conic-gradient(from 0deg,#fff7c2,#f59e0b,#fff7c2,#d97706,#fff7c2,#fbbf24,#fff7c2)}
.kd-orb.fl.done .sp{background:none;filter:drop-shadow(0 0 8px #f97316)}
.kd-orb.cur .sp{animation:kmspin 7s linear infinite}
.kd-orb b{position:relative;z-index:2;font-size:24px;color:#fff;text-shadow:0 0 5px #000,0 0 5px #000}
.kd-bn{margin:10px 0 4px;min-width:60%;text-align:center;background:#0007;border:1px solid #38bdf866;border-radius:10px;padding:8px 14px}
.kd-bn div{font-size:18px;font-weight:900;color:#7dd3fc;text-shadow:0 1px 3px #000}
.kd-bn.off div{color:#64748b}
.kd-bn small{display:block;font-size:11px;color:#cbd5e1;margin-top:2px}
.kd-mat{width:100%;margin-top:8px;background:#2a1f1a;border-top:2px solid #6b4a2a;border-bottom:2px solid #6b4a2a;padding:8px 10px;display:flex;align-items:center;gap:12px}
.kd-mat .tag{align-self:flex-start;background:linear-gradient(180deg,#d4a24c,#8a5a1c);color:#fff;font-weight:900;font-size:13px;padding:3px 14px 3px 8px;clip-path:polygon(0 0,88% 0,100% 50%,88% 100%,0 100%)}
.kd-it{width:62px;text-align:center;color:#fff;font-size:13px;font-weight:800}
.kd-it .e{height:62px;border:2px solid #d4a24c;border-radius:8px;background:#3b2a1a;display:flex;align-items:center;justify-content:center;font-size:34px;overflow:hidden}
.kd-it .e img{width:100%;height:100%;object-fit:cover}.kd-it .bad{color:#f87171}
.kd-rt{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;color:#fff;font-size:15px;font-weight:800}
.kd-go{width:100%;max-width:190px;padding:9px 0;font-size:19px;font-weight:900;color:#fff;border-radius:10px;border:2px solid #bbf7d0;background:linear-gradient(180deg,#22c55e,#15803d);text-shadow:0 1px 2px #000}
.kd-go.alt{background:linear-gradient(180deg,#f59e0b,#b45309);border-color:#fde68a;font-size:15px;padding:6px 0}
.kd-go:disabled{filter:grayscale(1) brightness(.7)}
.kd-cost{font-size:16px}.kd-cost.bad{color:#f87171}
.kd-msg{color:#fca5a5;font-size:12px;font-weight:700;text-align:center;margin-top:6px}
#km-rules .md-box{max-width:420px}
#km-rules li{font-size:13px;color:#f1e4c8;margin:5px 0;line-height:1.35}
`;
  document.head.appendChild(css);

  /* ================= KHUNG MÀN HÌNH ================= */
  const host = document.getElementById('screen-picker').parentNode;
  const mk = (id, html) => { const d = document.createElement('div'); d.className = 'screen'; d.id = 'screen-' + id; d.innerHTML = html; host.appendChild(d); };
  mk('kmpick', `<div class="km-bar"><button class="btn-back" onclick="switchScreen('vhub')">Trở về</button><h2>Kinh Mạch</h2><button class="km-btn" onclick="kmRules()">Quy tắc</button></div>
    <div class="pk-sub" style="text-align:center;color:#cbd5e1;font-size:12px;padding:6px">Chọn tướng để mở Kinh Mạch</div><div class="km-body"><div class="pk-grid" id="km-grid"></div></div>`);
  mk('km', `<div class="km-bar"><button class="btn-back" onclick="kmOpenPicker()">Trở về</button><h2>Kinh Mạch</h2><button class="km-btn" onclick="kmRules()">Quy tắc</button></div>
    <div class="km-body" id="km-body"></div>`);
  mk('kmnode', `<div class="km-bar"><button class="btn-back" onclick="kmBackMap()">Trở về</button><h2>Kinh Mạch</h2><button class="km-btn" onclick="kmRules()">Quy tắc</button></div>
    <div class="km-body km-sky" id="kn-body"></div>`);
  const rules = document.createElement('div');
  rules.id = 'km-rules'; rules.className = 'md-wrap'; rules.setAttribute('onclick', 'if(event.target===this)kmRulesClose()');
  rules.innerHTML = `<div class="md-box"><div class="hd-head"><div class="hd-info"><div class="hd-name">🌀 Quy tắc Kinh Mạch</div></div><button class="md-x" onclick="kmRulesClose()">✕</button></div><ul id="km-rules-list" style="padding-left:18px;margin:8px 0"></ul></div>`;
  document.body.appendChild(rules);

  /* ================= MÀN 1: CHỌN TƯỚNG ================= */
  window.kmOpenPicker = function () {
    const order = HEROES.slice().sort((a, b) => (team.includes(b.id) - team.includes(a.id)) || (getProg(b.id).lv - getProg(a.id).lv));
    document.getElementById('km-grid').innerHTML = order.map(h => {
      const p = getProg(h.id), inTeam = team.includes(h.id);
      return `<div class="pk-card ${(HERO_BORDER[h.id] || 'orange') === 'purple' ? 'purple' : ''}" onclick="kmOpen(${h.id})">${inTeam ? '<div class="pk-tag">Đội</div>' : ''}<div class="e">${heroIcon(h)}</div><div class="n">${h.name}</div><div class="st">${'★'.repeat(Math.min(p.star, 5)) || '☆'}</div><div class="lv">${kmCount(h.id)}/${N} mạch</div></div>`;
    }).join('');
    switchScreen('kmpick');
  };

  /* ================= MÀN 2: BẢN ĐỒ 9 CHẤM MẠCH ================= */
  window.kmOpen = function (id) { kmHero = id; renderMap(); switchScreen('km'); };
  window.kmNav = function (d) { const ids = HEROES.map(h => h.id), i = ids.indexOf(kmHero); kmHero = ids[(i + d + ids.length) % ids.length]; renderMap(); };
  window.kmBackMap = function () { renderMap(); switchScreen('km'); };

  function renderMap() {
    const id = kmHero, h = heroById(id), cur = kmCur(id), b = kmBonus(id);
    let lines = '', nodes = '';
    for (let i = 0; i < N - 1; i++) lines += `<line x1="${KM_POS[i][0]}" y1="${KM_POS[i][1]}" x2="${KM_POS[i + 1][0]}" y2="${KM_POS[i + 1][1]}" class="${kmDone(id, i) ? 'on' : ''}"/>`;
    for (let i = 0; i < N; i++) {
      const st = kmDone(id, i) ? 'done' : (i === cur ? 'cur' : 'lock'), fl = i >= 6;
      nodes += `<div class="km-n ${fl ? 'fl' : 'sw'} ${st}" style="left:${KM_POS[i][0]}%;top:${KM_POS[i][1]}%" onclick="kmOpenNode(${i})"><div class="o">${fl ? '🔥' : ''}</div><small>${Math.floor(kmPts(id, i) / kmReq(i) * 100)}%</small></div>`;
    }
    const sil = `<svg class="km-sil" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><g fill="#1b2a7a"><circle cx="50" cy="12" r="7"/><path d="M38 24 Q50 19 62 24 L70 52 Q76 62 84 72 Q92 80 86 88 L14 88 Q8 80 16 72 Q24 62 30 52 Z"/></g></svg>`;
    const sum = b ? Object.keys(b).filter(k => b[k]).map(k => `<span>${fmtB(k, b[k])}</span>`).join('') : '<em>Chưa mở chấm mạch nào</em>';
    document.getElementById('km-body').innerHTML = `
      <div class="km-nm"><button onclick="kmNav(-1)">◀</button><b>${h.name} · ${kmCount(id)}/${N}</b><button onclick="kmNav(1)">▶</button></div>
      <div class="km-sum">${sum}</div>
      <div class="km-sky"><div class="km-map" style="position:relative">${sil}<svg class="km-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>${nodes}</div></div>`;
  }

  /* ================= MÀN 3: CHI TIẾT 1 CHẤM MẠCH ================= */
  window.kmOpenNode = function (i) { kmNode = i; renderNode(''); switchScreen('kmnode'); };

  function renderNode(msg) {
    const id = kmHero, i = kmNode, h = heroById(id), n = KM_NODES[i], req = kmReq(i), pts = kmPts(id, i);
    const done = kmDone(id, i), open = kmOpenN(id, i), cur = open && !done, fl = i >= 6;
    const have = shardsOf(id), okS = have >= KM_SHARD, okG = silver >= KM_SILVER;
    const pct = Math.min(100, pts / req * 100), per = Math.min(100, KM_PTS / req * 100);
    const col = done ? '#fbbf24' : '#4ade80';
    const bonus = Object.keys(n.b).map(k => `<div>${fmtB(k, n.b[k])}</div>`).join('');
    const state = done ? '✔ Đã kích hoạt' : (open ? 'Đủ ' + fmtN(req) + ' điểm mạch để kích hoạt' : '🔒 Cần kích hoạt chấm mạch ' + i + ' trước');
    const can = open && !done;
    document.getElementById('kn-body').innerHTML = `<div class="kd">
      <h3>${n.name}</h3>
      <div class="kd-ring" style="--p:${pct.toFixed(2)};--c:${col}"><div class="kd-orb ${fl ? 'fl' : ''} ${done ? 'done' : ''} ${cur ? 'cur' : ''}"><div class="sp">${fl ? '🔥' : ''}</div><b>${fmtN(pts)}/${fmtN(req)}</b></div></div>
      <div class="kd-bn ${done ? '' : 'off'}">${bonus}<small>${state}</small></div>
      <div class="kd-mat"><div style="display:flex;flex-direction:column;gap:6px;align-self:stretch"><span class="tag">Vật Liệu</span>
        <div class="kd-it"><div class="e">${heroIcon(h)}</div><span class="${okS ? '' : 'bad'}">${fmtN(have)}/${KM_SHARD}</span></div></div>
        <div class="kd-rt"><div>Tỉ lệ: ${per < 1 ? per.toFixed(2) : Math.round(per * 10) / 10}%</div>
          <button class="kd-go" ${can ? '' : 'disabled'} onclick="kmUpgrade(1)">Tăng cấp</button>
          <button class="kd-go alt" ${can ? '' : 'disabled'} onclick="kmUpgrade(10)">Tăng 10 lần</button>
          <div class="kd-cost ${okG ? '' : 'bad'}">🥈 ${fmtN(KM_SILVER)}</div></div></div>
      <div class="kd-msg">${msg || ''}</div></div>`;
  }

  window.kmUpgrade = function (times) {
    const id = kmHero, i = kmNode, req = kmReq(i);
    if (!kmOpenN(id, i)) return renderNode('Cần kích hoạt chấm mạch trước.');
    const left = req - kmPts(id, i); if (left <= 0) return renderNode('Chấm mạch này đã đủ điểm.');
    const byNeed = Math.ceil(left / KM_PTS), byShard = Math.floor(shardsOf(id) / KM_SHARD), bySilver = Math.floor(silver / KM_SILVER);
    const k = Math.min(times, byNeed, byShard, bySilver);
    if (k < 1) return renderNode(byShard < 1 ? `Thiếu mảnh ${heroById(id).name} (cần ${KM_SHARD} mảnh mỗi lần).` : `Không đủ bạc (cần ${fmtN(KM_SILVER)} bạc mỗi lần).`);
    const arr = (kmProg[id] || []).slice(); while (arr.length < N) arr.push(0);
    const was = kmDone(id, i);
    arr[i] = Math.min(req, kmPts(id, i) + k * KM_PTS); kmProg[id] = arr; kmSave();
    heroShards[id] = shardsOf(id) - k * KM_SHARD; saveJSON('hero_shards', heroShards);
    silver -= k * KM_SILVER; resSave();
    try { renderHomeTeam(); } catch (e) {}
    const now = kmDone(id, i);
    if (!was && now) { scToast('Mở chấm mạch ' + KM_NODES[i].name + '!'); return renderNode('+' + fmtN(k * KM_PTS) + ' điểm mạch — ĐÃ KÍCH HOẠT'); }
    renderNode('+' + fmtN(k * KM_PTS) + ' điểm mạch');
  };

  /* ================= QUY TẮC ================= */
  window.kmRules = function () {
    document.getElementById('km-rules-list').innerHTML = [
      `Mỗi tướng có ${N} chấm mạch, mở lần lượt từ chấm 1. Chấm trước đủ điểm mới mở được chấm sau.`,
      `Chấm 1 cần ${fmtN(KM_BASE)} điểm mạch; mỗi chấm sau cần GẤP ĐÔI chấm trước.`,
      `Mỗi lần Tăng cấp: tốn ${KM_SHARD} mảnh của chính tướng đó + ${fmtN(KM_SILVER)} bạc, được +${KM_PTS} điểm mạch.`,
      `Chấm mạch ĐỦ điểm mới cộng thuộc tính. Tốc / Thủ / Né: cộng thêm % trên chỉ số hiện có. Bền / Đỡ đòn: cộng thẳng điểm.`,
      ...KM_NODES.map((n, i) => `<b>${i + 1}. ${n.name}</b> (${fmtN(kmReq(i))}): ` + Object.keys(n.b).map(k => fmtB(k, n.b[k])).join(', '))
    ].map(t => `<li>${t}</li>`).join('');
    document.getElementById('km-rules').style.display = 'flex';
  };
  window.kmRulesClose = function () { document.getElementById('km-rules').style.display = 'none'; };

})();

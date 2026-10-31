/* TỶ VÕ (PVP): đối thủ người thật, xếp hạng đám mây
   (tách từ index.html cũ — script) */

    // ---- Tỷ Võ: đối thủ là người chơi THẬT (tài khoản khác đăng nhập đám mây), không có NPC ----
    // Đội hình đăng ở Firestore pvp_players/{uid}. Mỗi tài khoản có 1 "khóa xếp hạng" (field rank, số thực).
    // HẠNG HIỂN THỊ = vị trí trong bảng sắp theo khóa (1, 2, 3, ...), nên có 3 người thì hạng là 1-2-3.
    // Tài khoản mới vào: khóa = khóa lớn nhất + 1 => xếp tiếp xuống cuối bảng.
    // Thắng người có hạng cao hơn: chèn lên NGAY TRÊN đối thủ (đối thủ và những người ở giữa tụt 1 hạng). Chỉ ghi vào doc của chính mình.
    const PVP_BOARD_MAX = 500;   // đọc tối đa 500 tài khoản đầu bảng
    let pvpRealSeq = 0;
    function pvpRealFromDoc(d, pos) {
      const x = d.data(), num = v => (typeof v === 'number' && isFinite(v) ? v : 0);
      const stats = (Array.isArray(x.team) ? x.team : []).slice(0, 5).map(m => {
        const h = heroById(m && m.id); if (!h || num(m.hp) <= 0) return null;
        return { h, hp: Math.round(num(m.hp)), atk: Math.round(num(m.atk)), def: Math.round(num(m.def)), spd: num(m.spd) || h.spd, dodge: num(m.dodge), acc: num(m.acc), crit: num(m.crit), critDmg: num(m.critDmg), tough: num(m.tough), pierce: num(m.pierce), block: num(m.block), sk: Math.max(1, num(m.sk)), star: Math.max(1, num(m.star)) };
      }).filter(Boolean);
      if (!stats.length) return null;
      return { real: true, beast: (TT_SLUG[x.beast] ? x.beast : ''), pt: Array.isArray(x.pt) ? x.pt.slice(0, 20).filter(p => p && TT_PT.includes(p.n)).map(p => ({ n: p.n, v: num(p.v), pts: !!p.pts })) : [], uid: d.id, rank: pos, steps: 0, heroes: stats.map(s => s.h), stats,
               name: pvCleanName(x.name) || 'Người chơi', lvl: Math.max(1, Math.floor(num(x.lvl)) || 1), power: stats.reduce((a, s) => a + unitPower(s), 0) };
    }
    const pvpKeyOf = d => { const v = d.data().rank; return (typeof v === 'number' && isFinite(v)) ? v : 1e9; };
    // Bảng xếp hạng: [{ id, key, doc }] đã sắp (khóa tăng dần; trùng khóa thì theo uid để ổn định)
    async function pvpFetchBoard() {
      const snap = await clDb.collection('pvp_players').orderBy('rank').limit(PVP_BOARD_MAX).get();
      const arr = []; snap.forEach(d => arr.push({ id: d.id, key: pvpKeyOf(d), doc: d }));
      arr.sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      return arr;
    }
    // Khóa cho tài khoản mới: ngay sau người cuối bảng
    async function pvpNewKey() {
      let mx = 0;
      try { const top = await clDb.collection('pvp_players').orderBy('rank', 'desc').limit(1).get(); top.forEach(d => { const v = d.data().rank; if (typeof v === 'number' && isFinite(v)) mx = Math.max(mx, v); }); } catch (e) {}
      return Math.floor(mx) + 1;
    }
    // Tài khoản cũ đang trùng khóa (vd cùng 10.000): thứ tự tạm theo uid. Người đứng ĐẦU hoặc CUỐI cụm trùng tự tách khóa nhích đi
    // 1 chút (vẫn nằm giữa khóa kế bên) => thứ hạng của mọi người KHÔNG đổi, dần dần hết trùng.
    async function pvpUntie(board) {
      const i = board.findIndex(x => x.id === clUser.uid); if (i < 0) return;
      const K = board[i].key, tiedPrev = i > 0 && board[i - 1].key === K, tiedNext = i + 1 < board.length && board[i + 1].key === K;
      let nk = null;
      if (tiedPrev && !tiedNext) { const next = i + 1 < board.length ? board[i + 1].key : Infinity; nk = next === Infinity ? K + 1e-4 : K + (next - K) / 2; if (!(nk > K && nk < next)) return; }   // cuối cụm: nhích lên
      else if (!tiedPrev && tiedNext) { const prev = i > 0 ? board[i - 1].key : -Infinity; nk = prev === -Infinity ? K - 1e-4 : K - (K - prev) / 2; if (!(nk < K && nk > prev)) return; }   // đầu cụm: nhích xuống
      if (nk === null) return;
      board[i].key = nk;
      await clDb.collection('pvp_players').doc(clUser.uid).set({ rank: nk, rt: Date.now() }, { merge: true });
    }
    async function pvpMixReal() {
      if (typeof clUser === 'undefined' || !clUser || !clDb || !team.length) { pvpOpps = []; try { renderPvp(); } catch (e) {} return; }   // chưa đăng nhập: không có người thật nào để đấu
      const seq = ++pvpRealSeq;
      try {
        await clPublishPvp();                                 // đăng đội hình của mình (tài khoản mới tự xếp cuối bảng)
        if (seq !== pvpRealSeq) return;
        const board = await pvpFetchBoard();
        if (seq !== pvpRealSeq) return;
        await pvpUntie(board);
        board.sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        const me = board.findIndex(x => x.id === clUser.uid);
        if (me >= 0) { pvpState.rank = me + 1; pvpSave(); }
        const P = pvpState.rank, cands = [];
        board.forEach((x, i) => { if (x.id !== clUser.uid) { const o = pvpRealFromDoc(x.doc, i + 1); if (o) cands.push(o); } });
        cands.sort((x, y) => Math.abs(x.rank - P) - Math.abs(y.rank - P) || x.rank - y.rank);
        pvpOpps = cands.slice(0, 5);                          // chỉ người thật, tối đa 5 đối thủ (giao diện có 5 ô)
        renderPvp();
      } catch (e) {}
    }
    // Sau khi thắng đối thủ đang hạng cao hơn: chèn lên ngay trên đối thủ (khóa nằm giữa người đứng trước đối thủ và đối thủ)
    async function pvpRankCloud(opp) {
      if (typeof clUser === 'undefined' || !clUser || !clDb || !opp || !opp.real) return;
      try {
        const board = await pvpFetchBoard();
        const me = board.findIndex(x => x.id === clUser.uid), op = board.findIndex(x => x.id === opp.uid);
        if (me < 0 || op < 0 || op > me) return;              // đối thủ không còn đứng trên bạn
        const o = board[op], pred = op > 0 ? board[op - 1] : null;
        let key;
        if (!pred) key = o.key - 1;
        else if (o.key - pred.key > 1e-9) key = (pred.key + o.key) / 2;
        else key = o.key - 1e-6;                              // trùng khóa (tài khoản cũ chưa tách): vượt cả cụm
        await clDb.collection('pvp_players').doc(clUser.uid).set({ rank: key, rt: Date.now() }, { merge: true });
      } catch (e) {}
    }
    function pvpReroll() { pvpGenOpps(); renderPvp(); }

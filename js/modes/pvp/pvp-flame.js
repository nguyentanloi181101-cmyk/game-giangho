/* TỶ VÕ (PVP): đổi đốm lửa 🔥 lấy Bảo Vật
   (tách từ index.html cũ — script) */

    // ---- Đổi đốm lửa 🔥 lấy Bảo Vật: thắng +2, thua -1 (không âm); 10 đốm lửa = thêm 1 Bảo Vật GIỐNG HỆT loại đã chọn (cùng tên, cùng thông số) ----
    const PVP_FLAME_WIN = 2, PVP_FLAME_LOSE = 1, PVP_FLAME_COST = 10;
    function pvpExchange() {
      const f = pvpState.flame || 0;
      const rows = TS_KINDS.map(k => {
        const ok = f >= PVP_FLAME_COST;
        return `<div class="pv-row-log" style="align-items:center;padding:7px 2px"><span style="display:flex;align-items:center;gap:8px"><span style="width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center">${tsIcon(k)}</span><span><b>${tsName(k)}</b><br><small style="color:#fbbf24">Đang có: ${tsCount(k)}</small></span></span>` +
          `<button class="btn-attack" style="padding:6px 12px;font-size:13px" ${ok ? '' : 'disabled'} onclick="pvpExchangeDo(${k})">Đổi ${PVP_FLAME_COST}🔥</button></div>`;
      }).join('');
      pvShow(pvHead('🔥 Đổi Bảo Vật', `Đốm lửa: ${f}`) +
        `<div class="set-note">Thắng 1 trận: <b>+${PVP_FLAME_WIN} 🔥</b> • Thua 1 trận: <b>-${PVP_FLAME_LOSE} 🔥</b><br>${PVP_FLAME_COST} 🔥 đổi được thêm 1 Bảo Vật giống hệt loại đã chọn (cùng tên, cùng thông số, bắt đầu từ Lv.0 ★0).<br>Lưu ý: mỗi khung chỉ gắn được 1 Bảo Vật mỗi loại, không được trùng.</div>` + rows);
    }
    function pvpExchangeDo(kind) {
      if (!TS_KINDS.includes(kind) || (pvpState.flame || 0) < PVP_FLAME_COST) return;
      pvpState.flame -= PVP_FLAME_COST; tsAdd(kind);
      pvpSave(); try { tsRefreshOthers(); } catch (e) {}
      pvpExchange();
    }

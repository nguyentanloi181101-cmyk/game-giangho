/* TRẬN ĐẤU: bộ tạo âm thanh tổng hợp dùng chung
   (tách từ index.html cũ — script) */

    // Hoa Mãn Lâu: 3 bướm 3 màu ngẫu nhiên xoay quanh thân -> lần lượt bay lên trời -> lần lượt từ từ rơi xuống trúng TOÀN BỘ địch -> +50% Công toàn đội
    // ===== Âm thanh tổng hợp cho Hoa Mãn Lâu (không cần file): pháo xẹt khi bướm bay lên, chuông chùa khi bướm đáp =====
    let sfxCtx = null;
    function sfxGet() {
      try {
        if (!audioSet.skill) return null;
        if (!sfxCtx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; sfxCtx = new C(); }
        if (sfxCtx.state === 'suspended') sfxCtx.resume();
        return sfxCtx;
      } catch (e) { return null; }
    }
    function sfxNoise(ctx, dur) {
      const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; return src;
    }

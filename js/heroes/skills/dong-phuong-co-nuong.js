/* ĐÔNG PHƯƠNG CÔ NƯƠNG (id 9): tuyệt kỹ mạng lửa
   (tách từ index.html cũ — script) */

    // Hỏa Thiên Tướng: 18 đường lửa chém CÙNG LÚC, chồng chéo như tơ nhện lên toàn địch
    // -> mỗi địch: HTT_FLAT sát thương chuẩn + Công bản thân (không trừ giáp) và mất thêm 50% HP hiện tại
    async function fireWebUlt(u, tok) {
      const f = document.getElementById('battle-arena'), box = document.getElementById('bf-units');
      const W = f.clientWidth, H = f.clientHeight, base = 'translate(-50%,-50%)';
      const es0 = foesOf(u).filter(e => e.alive); if (!es0.length) return;
      const xs = es0.map(e => e.x), ys = es0.map(e => e.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const ex = (Math.max(...xs) - Math.min(...xs)) * W / 100 + 90, ey = (Math.max(...ys) - Math.min(...ys)) * H / 100 + 90;
      const len = Math.max(ex, ey) * 1.6 + 60;
      const made = [];
      // ===== Ngọn lửa trên đầu: nhiều lưỡi lửa lắc lư theo nhiễu, lõi trắng-vàng, tia lửa bay lên, quầng sáng nhấp nháy =====
      const headFlame = () => {
        const CWd = 150, CHt = 190, bx = 75, by = 175, dpr = Math.min(2, window.devicePixelRatio || 1);
        const cv = document.createElement('canvas'); cv.width = CWd * dpr; cv.height = CHt * dpr;
        cv.style.cssText = 'position:absolute;pointer-events:none;z-index:99;width:' + CWd + 'px;height:' + CHt + 'px;left:' + (u.x * W / 100 - bx) + 'px;top:' + (u.y * H / 100 - 40 - by) + 'px';
        f.appendChild(cv); made.push(cv);
        const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
        const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
        const parts = [], t0 = performance.now(); let last = t0, fadeAt = 0;
        const tongue = (cx, w, h, sway, c0, c1, c2) => {                       // 1 lưỡi lửa hình giọt nước, ngọn cong theo sway
          const g = ctx.createLinearGradient(0, by, 0, by - h);
          g.addColorStop(0, c0); g.addColorStop(.55, c1); g.addColorStop(1, c2);
          ctx.fillStyle = g; ctx.beginPath();
          ctx.moveTo(cx - w, by);
          ctx.bezierCurveTo(cx - w * 1.25, by - h * .38, cx + sway * .4 - w * .5, by - h * .72, cx + sway, by - h);
          ctx.bezierCurveTo(cx + sway * .4 + w * .5, by - h * .72, cx + w * 1.25, by - h * .38, cx + w, by);
          ctx.quadraticCurveTo(cx, by + w * .6, cx - w, by); ctx.fill();
        };
        const frame = now => {
          if (!cv.isConnected) return;
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          const t = (now - t0) / 1000, grow = sm(t / 0.5) , fa = fadeAt ? Math.max(0, 1 - (now - fadeAt) / 400) : 1;
          if (fa <= 0) return;
          const nz = (k, sp) => (Math.sin(t * sp + k * 2.3) + Math.sin(t * sp * 1.73 + k * 5.1) * .6) / 1.6;   // nhiễu mượt -> lửa nhảy múa
          ctx.clearRect(0, 0, CWd, CHt); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fa;
          const pulse = 0.85 + nz(9, 14) * 0.15;
          const gl = ctx.createRadialGradient(bx, by - 45, 4, bx, by - 45, 78 * grow * pulse);       // quầng sáng toả ra
          gl.addColorStop(0, 'rgba(255,170,40,.55)'); gl.addColorStop(.5, 'rgba(255,80,10,.22)'); gl.addColorStop(1, 'rgba(255,40,0,0)');
          ctx.fillStyle = gl; ctx.fillRect(0, 0, CWd, CHt);
          const NT = 7;
          for (let k = 0; k < NT; k++) {                                                              // 7 lưỡi lửa, 3 lớp màu
            const m = k - (NT - 1) / 2, edge = 1 - Math.abs(m) / (NT / 2 + .3);
            const h = (62 + 46 * (0.5 + 0.5 * nz(k, 9)) + 22 * edge) * grow * edge * (0.9 + nz(k + 3, 17) * 0.12), cx = bx + m * 9 + nz(k + 7, 6) * 4, sw = nz(k + 1, 8) * 20 + m * 3, w = (15 - Math.abs(m) * 2) * (0.9 + 0.1 * grow);
            tongue(cx, w, h, sw, 'rgba(255,60,0,.85)', 'rgba(255,110,10,.7)', 'rgba(255,40,0,0)');
            tongue(cx, w * .68, h * .78, sw * .8, 'rgba(255,170,20,.9)', 'rgba(255,200,40,.75)', 'rgba(255,120,0,0)');
            tongue(cx, w * .38, h * .5, sw * .55, 'rgba(255,255,230,.95)', 'rgba(255,240,150,.8)', 'rgba(255,200,60,0)');
          }
          if (!fadeAt || fa > .3) for (let k = 0; k < 3 && parts.length < 90; k++)                    // tia lửa bay lên
            parts.push({ x: bx + (Math.random() - .5) * 34, y: by - 8 - Math.random() * 30, vx: (Math.random() - .5) * 36, vy: -(50 + Math.random() * 100), age: 0, life: 0.5 + Math.random() * 0.8, sz: 1 + Math.random() * 2.6, ph: Math.random() * 6.283 });
          for (let n = parts.length - 1; n >= 0; n--) {
            const p = parts[n]; p.age += dt;
            if (p.age >= p.life) { parts.splice(n, 1); continue; }
            p.x += (p.vx + Math.sin(t * 8 + p.ph) * 18) * dt; p.y += p.vy * dt;
            const q = p.age / p.life;
            ctx.fillStyle = 'rgba(255,' + ((220 - 150 * q) | 0) + ',' + ((80 - 70 * q) | 0) + ',' + (1 - q) + ')';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * (1 - q * .6), 0, 6.283); ctx.fill();
          }
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        return { fade() { fadeAt = performance.now(); } };
      };
      // ===== Mạng lửa 3D (chuyển thể từ FireWebEffect3D.cs): 18 tia + 3 vòng + đường chéo, mỗi sợi 9 điểm lắc lư, nhấp nháy, tia lửa bay =====
      const fireWeb3D = () => new Promise(res => {
        const RAYS = HTT_LINES, R = 5, HGT = 2, FLK = 12, PULSE = 0.25, SWAY = 0.25;
        const HOT = [255, 217, 38], FIRE = [255, 31, 3];
        const S = Math.max(ex, ey) * 0.55 / R, cxp = cx * W / 100, cyp = cy * H / 100;
        const THE = 52 * Math.PI / 180, cT = Math.cos(THE), sT = Math.sin(THE), D = 30;
        const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        cv.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;pointer-events:none;z-index:98';
        f.appendChild(cv); made.push(cv);
        const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
        const lines = [], rnd = (a, b) => a + Math.random() * (b - a);
        for (let i = 0; i < RAYS; i++) {                                         // 18 tia chính toả từ tâm
          const a = i * Math.PI * 2 / RAYS;
          lines.push({ s: [0, 0, 0], e: [Math.cos(a) * R, rnd(-HGT, HGT), Math.sin(a) * R] });
        }
        for (let ring = 1; ring <= 3; ring++) {                                  // 3 vòng mạng nhện + đường chéo
          const r = R * ring / 3;
          for (let i = 0; i < RAYS; i++) {
            const a = i * Math.PI * 2 / RAYS, b = (i + 1) * Math.PI * 2 / RAYS;
            lines.push({ s: [Math.cos(a) * r, Math.sin(a * 3) * 0.25, Math.sin(a) * r], e: [Math.cos(b) * r, Math.sin(b * 3) * 0.25, Math.sin(b) * r] });
          }
          for (let i = 0; i < RAYS; i += 2) {
            const a = i * Math.PI * 2 / RAYS, b = (i + 3) * Math.PI * 2 / RAYS;
            lines.push({ s: [Math.cos(a) * r, 0, Math.sin(a) * r], e: [Math.cos(b) * r, 0.2, Math.sin(b) * r] });
          }
        }
        const K = battleFast ? 0.3 : 1, GROW = 350 * K, FADE0 = 1250 * K, END = 1650 * K;
        const sparks = [], PS = new Float32Array(18);
        const t0 = performance.now(); let last = t0;
        const proj = (x, y, z, yaw, out, o) => {
          const cy2 = Math.cos(yaw), sy2 = Math.sin(yaw), xr = x * cy2 + z * sy2, zr = -x * sy2 + z * cy2;
          const yB = y * cT - zr * sT, zB = y * sT + zr * cT, k = D / (D - zB);
          out[o] = cxp + xr * k * S; out[o + 1] = cyp - yB * k * S; out[o + 2] = k;
        };
        const frame = now => {
          if (tok !== battleToken) return res();
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          const el = now - t0, time = el / 1000, g = sm(el / GROW), yaw = time * 0.45;
          const alpha = el < FADE0 ? 1 : Math.max(0, 1 - (el - FADE0) / (END - FADE0));
          ctx.clearRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          const P = []; 
          for (let i = 0; i < lines.length; i++) {
            const ln = lines[i];
            const fl = 1 + Math.sin(time * FLK + i * 1.7) * PULSE;
            const pp = Math.abs(((time * 4 + i) % 2) - 1);                       // PingPong
            const c1 = [0, 1, 2].map(q => Math.min(255, (FIRE[q] + (HOT[q] - FIRE[q]) * pp) * fl));
            const pts = [];
            for (let j = 0; j < 9; j++) {
              const tt = j / 8 * g;
              let x = ln.s[0] + (ln.e[0] - ln.s[0]) * tt, y = ln.s[1] + (ln.e[1] - ln.s[1]) * tt, z = ln.s[2] + (ln.e[2] - ln.s[2]) * tt;
              const wv = Math.sin(time * FLK + j * 1.8 + i) * SWAY; y += wv; x += wv * 0.4;
              proj(x, y, z, yaw, PS, 0); pts.push([PS[0], PS[1], PS[2]]);
            }
            for (let j = 0; j < 8; j++) {
              const u0 = j / 8, wd = (0.07 * (1 - u0) + 0.015 * u0) * fl * S * (pts[j][2] + pts[j + 1][2]) / 2;
              const cr = c1[0] + (FIRE[0] - c1[0]) * u0, cg = c1[1] + (FIRE[1] - c1[1]) * u0, cb = c1[2] + (FIRE[2] - c1[2]) * u0;
              ctx.beginPath(); ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(pts[j + 1][0], pts[j + 1][1]);
              ctx.strokeStyle = 'rgba(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ',' + (0.22 * alpha) + ')'; ctx.lineWidth = wd * 3.2; ctx.stroke();   // quầng sáng
              ctx.strokeStyle = 'rgba(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ',' + (0.95 * alpha) + ')'; ctx.lineWidth = Math.max(1, wd); ctx.stroke();  // lõi lửa
            }
          }
          // tia lửa bay lên (Emit 8 mỗi frame với xác suất 70%)
          if (el < FADE0 && Math.random() < 0.7) for (let k = 0; k < 8 && sparks.length < 600; k++) {
            const r = R * 0.6 * Math.cbrt(Math.random()), a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
            proj(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a), yaw, PS, 0);
            sparks.push({ x: PS[0], y: PS[1], vx: (Math.random() - .5) * 60, vy: -(30 + Math.random() * 120), age: 0, life: 0.4 + Math.random() * 1.1, sz: 1 + Math.random() * 3, hot: Math.random() });
          }
          for (let n = sparks.length - 1; n >= 0; n--) {
            const p = sparks[n]; p.age += dt;
            if (p.age >= p.life) { sparks.splice(n, 1); continue; }
            p.x += p.vx * dt; p.y += p.vy * dt;
            const k = p.age / p.life, cr = HOT[0] + (FIRE[0] - HOT[0]) * k, cg = HOT[1] + (FIRE[1] - HOT[1]) * k, cb = HOT[2] + (FIRE[2] - HOT[2]) * k;
            ctx.fillStyle = 'rgba(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ',' + (1 - k) + ')';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * (1 - k * .5), 0, 6.283); ctx.fill();
          }
          ctx.globalCompositeOperation = 'source-over';
          if (el >= END && !sparks.length) return res();
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      try {
        // 1. Tụ lửa quanh người
        const flame = headFlame();
        u.el.animate([{ transform: base }, { transform: 'translate(-50%,calc(-50% - 14px))' }, { transform: base }], { duration: 600 });
        await sleep(600); if (tok !== battleToken) return;
        // 2. Mạng lửa 3D bung ra phủ lên toàn đội địch (18 tia + 3 vòng tơ nhện chằng chịt)
        const web = fireWeb3D();
        await sleep(330); if (tok !== battleToken) return;
        // 3. Trúng toàn địch: sát thương chuẩn (bỏ qua giáp) + 50% HP hiện tại
        const flat = HTT_FLAT * (u.sk || 1) + u.atk;
        f.classList.add('screen-shake'); setTimeout(() => f.classList.remove('screen-shake'), 400);
        foesOf(u).filter(e => e.alive).forEach(e => {
          const cut = Math.round(e.hp * HTT_HP_PCT);
          hit(e, flat + cut);
          const w = document.createElement('div'); w.className = 'bf-wave'; w.style.left = e.x + '%'; w.style.top = e.y + '%';
          w.style.borderColor = '#fb923c'; w.style.boxShadow = '0 0 24px #ef4444, inset 0 0 24px #f97316';
          box.appendChild(w); setTimeout(() => w.remove(), 650);
        });
        await web; if (tok !== battleToken) return;
        flame.fade();                                           // ngọn lửa trên đầu tắt dần sau khi mạng lửa tan
        await sleep(450);
      } finally {
        made.forEach(d => d.remove());
        u.el.getAnimations().forEach(a => a.cancel());
      }
    }

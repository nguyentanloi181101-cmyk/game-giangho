/* TƯỚNG: danh sách HEROES (dữ liệu gốc) và Đội ngũ
   (tách từ index.html cũ — script) */

    // --- ĐỘI NGŨ ---
    const HEROES = [
      // hp: máu • atk: công • def: thủ • spd: tốc • dodge: né (%) • startRage: nộ khi vào trận
      {id:0,name:'Ma Đao Thánh Nữ',emoji:'⚔️',img:'assets/images/heroes/ma-dao-thanh-nu.webp',body:'assets/images/heroes/ma-dao-thanh-nu-body.webp',bodyH:82,hp:2800,atk:340,def:30,spd:60,dodge:10},
      // Thanh Y Tiên Tử: vào trận KHÔNG có nộ, BẤT TỬ 3 hiệp đầu mỗi trận; tuyệt kỹ (đủ 100 nộ): mưa cánh hoa sen hồi sinh tối đa 2 đồng đội đã gục
      {id:1,name:'Thanh Y Tiên Tử',emoji:'🧔🏻',img:'assets/images/heroes/thanh-y-tien-tu.webp',body:'assets/images/heroes/thanh-y-tien-tu-body.webp',bodyH:80,hp:3200,atk:280,def:45,spd:45,dodge:5},
      // Chu Nguyên Chương: tuyệt kỹ không cần nộ (alwaysUlt) – lượt nào cũng ulti: giải hiệu ứng bất lợi + khiên Trăng Khuyết phản 50% sát thương, nhận 30% (2 hiệp)
      {id:2,name:'Chu Nguyên Chương',emoji:'🌊',img:'assets/images/heroes/chu-nguyen-chuong.webp',body:'assets/images/heroes/chu-nguyen-chuong-body.webp',bodyH:82,hp:3000,atk:300,def:40,spd:55,dodge:8,startRage:100,alwaysUlt:true},
      {id:3,name:'Độc Cô Cầu Bại',emoji:'🧔🏻‍♂️',img:'assets/images/heroes/doc-co-cau-bai.webp',body:'assets/images/heroes/doc-co-cau-bai-body.webp',bodyH:80,hp:2900,atk:360,def:35,spd:50,dodge:10},
      // Trương Tam Phong: tuyệt kỹ không cần nộ (alwaysUlt) – lượt nào cũng ulti được; đạt 6 sao thì gây chảy máu
      {id:4,name:'Trương Tam Phong',emoji:'🧙🏻‍♂️',img:'assets/images/heroes/truong-tam-phong.webp',body:'assets/images/heroes/truong-tam-phong-body.webp',bodyH:80,hp:3500,atk:290,def:60,spd:40,dodge:5,startRage:100,alwaysUlt:true},
      {id:5,name:'Âu Cơ',emoji:'🪷',img:'assets/images/heroes/au-co.webp',body:'assets/images/heroes/au-co-body.webp',bodyH:74,hp:3000,atk:300,def:50,spd:50,dodge:10,startRage:50},
      // Hoa Mãn Lâu: tuyệt kỹ không cần nộ (alwaysUlt) – lượt nào cũng ulti được
      {id:6,name:'Hoa Mãn Lâu',emoji:'🦋',img:'assets/images/heroes/hoa-man-lau.webp',body:'assets/images/heroes/hoa-man-lau-body.webp',bodyH:80,hp:2000,atk:500,def:500,spd:77,dodge:50,startRage:100,alwaysUlt:true},
      // Kiều Phong: nhảy qua địch, 2 hỏa long quấn chéo (3 tầng sát thương) + chảy máu 3 hiệp
      {id:7,name:'Kiều Phong',emoji:'🐉',img:'assets/images/heroes/kieu-phong.webp',body:'assets/images/heroes/kieu-phong-body.webp',bodyH:84,hp:1000,atk:2500,def:500,spd:65,dodge:2,startRage:0},
      // Lạc Long Quân: tướng thủ (bị đánh đầu tiên), tuyệt kỹ không cần nộ – buff nộ + thủ cho 2 đồng đội
      {id:8,name:'Lạc Long Quân',emoji:'🐲',img:'assets/images/heroes/lac-long-quan.webp',body:'assets/images/heroes/lac-long-quan-body.webp',bodyH:80,hp:5000,atk:300,def:2000,spd:1000,dodge:70,startRage:100,alwaysUlt:true,taunt:true},
      // Hỏa Thiên Tướng: tuyệt kỹ không cần nộ – 18 đường lửa chồng chéo như tơ nhện, sát thương chuẩn bỏ qua giáp + giảm 50% HP địch
      // noEnemy: không nằm trong 3 tướng ngẫu nhiên của boss trận 4 (33333 sát thương chuẩn sẽ diệt cả đội ngay)
      {id:9,name:'Đông Phương Cô Nương',emoji:'🔥',img:'assets/images/heroes/dong-phuong-co-nuong.webp',body:'assets/images/heroes/dong-phuong-co-nuong-body.webp',bodyH:80,hp:3000,atk:300,def:500,spd:50,dodge:20,acc:300,startRage:100,alwaysUlt:true,noEnemy:true},
      // Bạch Ma Vương: tuyệt kỹ không cần nộ – triệu hồi 3 bộ xương khô, mỗi địch mất 50% HP hiện tại (bỏ qua mọi thứ trừ Né); bản thân không bị trừ máu
      // noEnemy: không nằm trong 3 tướng ngẫu nhiên của boss trận 4 (đấm 1 phát chết 3 tướng ta)
      {id:10,name:'Bạch Ma Vương',emoji:'💀',img:'assets/images/heroes/bach-ma-vuong.webp',body:'assets/images/heroes/bach-ma-vuong-body.webp',hp:3600,atk:320,def:50,spd:58,dodge:8,startRage:100,alwaysUlt:true,noEnemy:true},
      // Vô Nhai Tử: tướng hỗ trợ – tuyệt kỹ không cần nộ (alwaysUlt), hiệp nào cũng ulti. Chiêu: ném hủ cờ vây lên phía địch, 5 quân cờ trắng/đen rơi xuống bàn cờ dưới chân địch; hiệp 2-4 choáng 3 địch 1 hiệp; hoán đổi chỉ số với boss mạnh nhất (lần sau so chỉ số, giữ số cao hơn)
      // noEnemy: không nằm trong 3 tướng ngẫu nhiên của boss trận 4
      {id:11,name:'Vô Nhai Tử',emoji:'♟️',img:'assets/images/heroes/vo-nhai-tu.webp',body:'assets/images/heroes/vo-nhai-tu-body.webp',bodyH:80,hp:3200,atk:260,def:45,spd:62,dodge:12,startRage:100,alwaysUlt:true,noEnemy:true},
      // Đoàn Dự: ra trận ĐẦY NỘ. Lăng Ba Vi Bộ – 18 tàn ảnh lao từ đội ta sang đội địch; toàn đội 3 hiệp: +300% Né, +150% Tốc, hồi 300% máu (theo chỉ số Đoàn Dự)
      // noEnemy: không nằm trong 3 tướng ngẫu nhiên của boss trận 4
      {id:12,name:'Đoàn Dự',emoji:'🪭',img:'assets/images/heroes/doan-du.webp',body:'assets/images/heroes/doan-du-body.webp',bodyH:80,hp:3000,atk:300,def:40,spd:70,dodge:30,startRage:100,noEnemy:true},
    ];
    const heroIcon = h => h.img ? `<img class="hero-img" src="${h.img}">` : h.emoji;
    let team = [];
    try { team = JSON.parse(localStorage.getItem('team_ids')) || []; } catch (e) {}
    team = team.filter(id => HEROES.some(h => h.id === id));
    if (!team.length) team = [0,1,2,3,4];
    team.sort((a, b) => a - b);

    function renderTeam() {
      document.getElementById('tm-list').innerHTML = HEROES.map(h => {
        const on = team.includes(h.id);
        return `<div class="tm-card ${on ? 'on' : ''}" onclick="toggleHero(${h.id})"><div class="e">${heroIcon(h)}</div><div class="n">${h.name}</div><div class="s">${on ? 'Ra trận' : 'Dự bị'}</div></div>`;
      }).join('');
      document.getElementById('tm-sub').innerText = `Đang ra trận: ${team.length}/5 tướng (tối thiểu 1)`;
    }
    function toggleHero(id) {
      if (team.includes(id)) { if (team.length === 1) return; team = team.filter(x => x !== id); }
      else { if (team.length >= 5) return; team.push(id); }
      team.sort((a, b) => a - b);
      try { localStorage.setItem('team_ids', JSON.stringify(team)); } catch (e) {}
      renderTeam();
    }
    function openTeam() { renderTeam(); document.getElementById('team-modal').style.display = 'flex'; }
    function closeTeam() { document.getElementById('team-modal').style.display = 'none'; renderHomeTeam(); }

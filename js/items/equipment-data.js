/* TRANG BỊ: định nghĩa loại trang bị và phần thưởng
   (tách từ index.html cũ — script) */

    // Chỉ số thực dùng trong trận = cơ bản × hệ số cấp/sao
    // ---- TRANG BỊ: gắn vào KHUNG (vị trí 1-5 ở trang chủ). Tướng đang đứng ở khung nào thì nhận chỉ số của khung đó ----
    const EQUIP_MAX = 1000, FRAMES = 5;
    const EQUIP = [
      { k:'hat',   name:'Mũ',   icon:'<img class="eq-img" src="assets/images/items/equipment-hat.jpg">', stat:'hp',  per:1000, label:'HP'   },
      { k:'armor', name:'Áo',   icon:'<img class="eq-img" src="assets/images/items/equipment-armor.jpg">', stat:'def', per:50,   label:'Thủ'  },
      { k:'sword', name:'Kiếm', icon:'<img class="eq-img" src="assets/images/items/equipment-sword.jpg">', stat:'atk', per:300,  label:'Công' },
      { k:'boots', name:'Giày', icon:'<img class="eq-img" src="assets/images/items/equipment-boots.jpg">', stat:'spd', per:1,    label:'Tốc'  }
    ];
    // Phần thưởng: đánh thắng Ải 4 - Bàn 10 nhận mỗi loại 4 món vào Túi đồ (once = chỉ nhận lần đầu thắng)
    const EQ_REWARD = { stage:4, battle:10, each:4, startLv:1, once:true };

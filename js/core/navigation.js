/* CHUYỂN MÀN HÌNH CHÍNH (switchScreen)
   (tách từ index.html cũ — script) */

    function switchScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      
      document.getElementById(`screen-${screenId}`).classList.add('active');
      const navBtn = document.getElementById(`nav-btn-${screenId}`);
      if(navBtn) navBtn.classList.add('active');
      
      if(['home','picker','vhub','guild','thanthu','dienvo','quest'].includes(screenId)) {
        document.getElementById('app-header').style.display = 'block';
        document.getElementById('app-nav').style.display = 'flex';
      } else {
        document.getElementById('app-header').style.display = 'none';
        document.getElementById('app-nav').style.display = 'none';
      }
    }

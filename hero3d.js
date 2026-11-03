/* HERO 3D: lớp Hero3D
   (tách từ index.html cũ — script) */

    // --- HERO 3D CLASS (Tích hợp sẵn) ---
    class Hero3D {
      constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.init();
      }
      init() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.stage = document.createElement('div');
        this.stage.className = 'hero-3d-stage';
        
        this.pedestal = document.createElement('div');
        this.pedestal.className = 'hero-3d-pedestal';
        this.pedestal.innerHTML = `<div class="pedestal-ring ring-outer"></div><div class="pedestal-ring ring-inner"></div><div class="taichi-symbol"></div>`;

        this.sprite = document.createElement('div');
        this.sprite.className = 'hero-3d-sprite idle';
        this.sprite.innerText = "🧙🏻‍♂️";

        this.aura = document.createElement('div');
        this.aura.className = 'hero-3d-aura';
        this.aura.innerHTML = `<div class="yin-yang-ball ball-left">☯</div><div class="yin-yang-ball ball-right">☯</div>`;

        this.shadow = document.createElement('div');
        this.shadow.className = 'hero-3d-shadow';

        this.stage.appendChild(this.pedestal);
        this.stage.appendChild(this.shadow);
        this.stage.appendChild(this.aura);
        this.stage.appendChild(this.sprite);
        this.container.appendChild(this.stage);
      }
      playAnimation(animName, duration = 1500) {
        this.sprite.className = 'hero-3d-sprite';
        this.aura.className = 'hero-3d-aura';
        this.stage.className = 'hero-3d-stage';
        setTimeout(() => {
          this.sprite.classList.add(animName);
          this.aura.classList.add(animName + '-aura');
          if (animName === 'skill') this.stage.classList.add('screen-shake');
        }, 10);
        if (animName !== 'idle') setTimeout(() => { this.playAnimation('idle', 0); }, duration);
      }
    }

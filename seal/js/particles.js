/**
 * 可愛風愛心與閃亮星光粒子引擎
 */
class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.symbols = ['❤️', '💖', '✨', '🌸', '⭐', '🐾', '🎀'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      const size = 16 + Math.random() * 18;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5, // 向上初速
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        size,
        symbol,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.02
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // 重力
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.font = `${p.size}px 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.symbol, 0, 0);
      this.ctx.restore();
    }

    requestAnimationFrame(this.loop);
  }
}

window.ParticleEngine = ParticleEngine;

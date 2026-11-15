// Particles, floating score text and screen shake for Simmerdown.
// Everything here is cosmetic: it never changes the simulation, only how
// juicy it feels — steam over the grill, a burst when a dish is served,
// a shake when a customer walks out.

export class Particles {
  constructor() {
    this.list = [];
    this.texts = [];
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
  }

  burst(x, y, color, count = 14, speed = 160) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.4 + Math.random() * 0.6);
      this.list.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 40,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        size: 3 + Math.random() * 4,
        color,
        gravity: 260,
      });
    }
  }

  steam(x, y) {
    this.list.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 12,
      vy: -34 - Math.random() * 20,
      life: 0.8,
      maxLife: 0.8,
      size: 5 + Math.random() * 5,
      color: 'rgba(255,255,255,0.55)',
      gravity: -30,
    });
  }

  floatText(x, y, text, color = '#ffd94d') {
    this.texts.push({ x, y, text, color, life: 1.1, maxLife: 1.1 });
  }

  shake(magnitude, seconds) {
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
    this.shakeTime = Math.max(this.shakeTime, seconds);
  }

  update(dt) {
    for (const particle of this.list) {
      particle.vy += particle.gravity * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }
    this.list = this.list.filter((particle) => particle.life > 0);
    for (const text of this.texts) {
      text.y -= 42 * dt;
      text.life -= dt;
    }
    this.texts = this.texts.filter((text) => text.life > 0);
    if (this.shakeTime > 0) this.shakeTime -= dt;
    else this.shakeMagnitude = 0;
  }

  offset() {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };
    const magnitude = this.shakeMagnitude * (this.shakeTime / 0.4);
    return {
      x: (Math.random() - 0.5) * magnitude,
      y: (Math.random() - 0.5) * magnitude,
    };
  }

  draw(ctx) {
    for (const particle of this.list) {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const text of this.texts) {
      const alpha = Math.max(0, text.life / text.maxLife);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(43,26,18,0.85)';
      ctx.strokeText(text.text, text.x, text.y);
      ctx.fillStyle = text.color;
      ctx.fillText(text.text, text.x, text.y);
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * NUTRITION FIRE - Subtle Ambient Electric Texture Engine
 * Redesigned from aggressive gaming lightning into an extremely subtle,
 * high-end DTC atmospheric electric texture with ultra-low opacity.
 * Does NOT distract from products or typography.
 */

(function () {
  let canvas, ctx;
  let width, height;
  let dpr = 1;
  let particles = [];
  let bolts = [];
  let mouse = { x: -1000, y: -1000, active: false };
  let lastBoltTime = 0;
  let boltInterval = 4200; // Much calmer, slower ambient intervals

  function isDarkMode() {
    return document.documentElement.classList.contains("dark") || document.body.classList.contains("dark");
  }

  // Micro-ambient particle
  class SubtleParticle {
    constructor(x, y) {
      this.reset(x, y);
    }

    reset(x, y) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -Math.random() * 0.45 - 0.15;
      this.size = Math.random() * 1.5 + 0.8;
      this.alpha = Math.random() * 0.25 + 0.08;
      this.decay = Math.random() * 0.002 + 0.001;

      const dark = isDarkMode();
      this.color = dark ? "#3B82F6" : "#0284C7";
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;

      if (this.alpha <= 0 || this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset(Math.random() * width, height + 10);
      }
      return true;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Very faint, delicate electric line
  class DelicateElectricArc {
    constructor(startX, startY, endX, endY) {
      this.segments = [];
      this.alpha = 0.35; // Faint, subtle opacity
      this.decay = 0.025;

      const dark = isDarkMode();
      this.color = dark ? "#3B82F6" : "#0284C7";
      this.width = 1.2;

      this.generate(startX, startY, endX, endY);
    }

    generate(x1, y1, x2, y2) {
      this.segments = [{ x: x1, y: y1 }];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(6, Math.floor(distance / 45));

      let curX = x1;
      let curY = y1;

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const targetX = x1 + dx * progress;
        const targetY = y1 + dy * progress;
        const roughness = (1 - Math.abs(progress - 0.5) * 1.5) * 24;
        const nx = -dy / distance;
        const ny = dx / distance;
        const offset = (Math.random() - 0.5) * roughness;

        curX = targetX + nx * offset;
        curY = targetY + ny * offset;
        this.segments.push({ x: curX, y: curY });
      }
      this.segments.push({ x: x2, y: y2 });
    }

    update() {
      this.alpha -= this.decay;
      return this.alpha > 0;
    }

    draw() {
      if (this.segments.length < 2) return;
      const dark = isDarkMode();
      ctx.save();
      // Ultra-subtle background texture
      ctx.globalAlpha = Math.max(0, this.alpha * (dark ? 0.35 : 0.18));
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function spawnSubtleArc() {
    const startX = Math.random() * width;
    const startY = Math.random() * (height * 0.35);
    const endX = startX + (Math.random() - 0.5) * 350;
    const endY = startY + Math.random() * (height * 0.5) + 80;

    bolts.push(new DelicateElectricArc(startX, startY, endX, endY));
  }

  function init() {
    canvas = document.getElementById("lightning-canvas");
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);

    // Minimal floating particles
    const particleCount = Math.min(25, Math.floor((width * height) / 50000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new SubtleParticle());
    }

    requestAnimationFrame(renderLoop);
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.scale(dpr, dpr);
  }

  function renderLoop(timestamp) {
    ctx.clearRect(0, 0, width, height);

    if (timestamp - lastBoltTime > boltInterval) {
      if (Math.random() < 0.65) {
        spawnSubtleArc();
      }
      lastBoltTime = timestamp;
    }

    for (let i = bolts.length - 1; i >= 0; i--) {
      if (!bolts[i].update()) {
        bolts.splice(i, 1);
      } else {
        bolts[i].draw();
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(renderLoop);
  }

  window.LightningEngine = {
    init,
    strikeAt: (x, y) => {
      // Gentle subtle arc on demand if needed
      const sx = x + (Math.random() - 0.5) * 150;
      const sy = Math.max(0, y - 180);
      bolts.push(new DelicateElectricArc(sx, sy, x, y));
    },
    triggerSurge: () => {
      // Gentle single arc on checkout
      spawnSubtleArc();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

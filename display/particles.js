const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

const MAX_PARTICLES = 2000;
const particles = [];

function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(x, y, color, vx, vy, size, lifetime) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.alpha = 1;
  }

  update(dt) {
    this.vy += 80 * dt; // gravity
    this.vx *= 0.99;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;
    this.alpha = Math.max(0, this.lifetime / this.maxLifetime);
    this.size *= 0.998;
    return this.lifetime > 0 && this.alpha > 0;
  }

  draw(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.size * 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function spawnCheerParticles(color) {
  const count = 12 + Math.floor(Math.random() * 8);
  const cx = Math.random() * window.innerWidth;
  const cy = Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.1;

  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 80 + Math.random() * 120;
    particles.push(new Particle(
      cx, cy, color,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 50,
      3 + Math.random() * 5,
      1.5 + Math.random() * 1.0
    ));
  }
}

function triggerFireworks() {
  const colors = ['#FF4757', '#FFDD59', '#2ED573', '#1E90FF', '#A855F7', '#FF69B4'];
  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const cx = Math.random() * window.innerWidth;
      const cy = Math.random() * window.innerHeight * 0.5 + 50;
      for (let i = 0; i < 40; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const angle = (Math.PI * 2 * i) / 40;
        const speed = 150 + Math.random() * 100;
        particles.push(new Particle(
          cx, cy, color,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed - 80,
          4 + Math.random() * 4,
          2.0 + Math.random() * 0.5
        ));
      }
    }, burst * 200);
  }
}

function triggerWave() {
  const colors = ['#1E90FF', '#70A1FF', '#2ED573', '#7BED9F'];
  const y = window.innerHeight * 0.6;
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const color = colors[i % colors.length];
      particles.push(new Particle(
        (i / 60) * window.innerWidth,
        y + Math.sin(i * 0.3) * 30,
        color,
        (Math.random() - 0.5) * 20,
        -60 - Math.random() * 80,
        4 + Math.random() * 3,
        2.0 + Math.random() * 1.0
      ));
    }, i * 30);
  }
}

function triggerRainbow() {
  const rainbow = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
  for (let r = 0; r < rainbow.length; r++) {
    setTimeout(() => {
      for (let i = 0; i < 25; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        particles.push(new Particle(
          Math.random() * window.innerWidth,
          -10,
          rainbow[r],
          (Math.random() - 0.5) * 40,
          100 + Math.random() * 60,
          3 + Math.random() * 4,
          2.5 + Math.random() * 0.5
        ));
      }
    }, r * 150);
  }
}

let lastTime = performance.now();

function animate() {
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
  ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update(dt)) {
      particles.splice(i, 1);
    } else {
      particles[i].draw(ctx);
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  requestAnimationFrame(animate);
}

animate();

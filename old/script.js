const canvas = document.getElementById("fireCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.size = Math.random() * 5 + 2;
    this.speedY = Math.random() * -2 - 1;
    this.speedX = (Math.random() - 0.5) * 2;
    this.life = 700;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
  }

  draw() {
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    );
    gradient.addColorStop(0, "rgba(255,255,200,1)");
    gradient.addColorStop(0.3, "rgba(255,150,0,0.8)");
    gradient.addColorStop(1, "rgba(255,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let particles = [];

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (particles.length < 1000) {
    particles.push(new Particle());
  }

  particles.forEach((p, index) => {
    p.update();
    p.draw();

    if (p.life <= 0) {
      particles.splice(index, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate();
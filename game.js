import { updateBullets, updateParticles, spawnBullet, spawnFlame } from "./logic";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const SIZE = Math.min(window.innerWidth - 32, window.innerHeight - 60, 600);
canvas.width = SIZE;
canvas.height = SIZE;

// ── Ship state ───────────────────────────────────────────────
const ship = {
	x: SIZE / 2,
	y: SIZE / 2,
	angle: -Math.PI / 2, // pointing up
	vx: 0,
	vy: 0,
	rotSpeed: 0.055,
	thrust: 0.18,
	drag: 0.985,
	size: 14,
};

// ── Input ────────────────────────────────────────────────────
const keys = {};
window.addEventListener("keydown", e => {
	keys[e.key] = true;
	e.preventDefault();
});
window.addEventListener("keyup", e => {
	keys[e.key] = false;
});

const isLeft = () => keys["ArrowLeft"] || keys["a"] || keys["A"];
const isRight = () => keys["ArrowRight"] || keys["d"] || keys["D"];
const isThrust = () => keys["ArrowUp"] || keys["w"] || keys["W"];
const isShoot = () => keys[" "];

// ── Bullets ───────────────────────────────────────
let lastShotTime = 0;
const SHOOT_COOLDOWN = 250; // ms
const bullets = [];

function drawBullets() {
	for (const b of bullets) {
		// outer glow
		ctx.beginPath();
		ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(255, 60, 60, 0.2)";
		ctx.fill();

		// core
		ctx.beginPath();
		ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
		ctx.fillStyle = "#f44";
		ctx.fill();
	}
}

// ── Thruster particles ───────────────────────────────────────
const particles = [];

function drawParticles() {
	for (const p of particles) {
		ctx.beginPath();
		ctx.arc(p.x, p.y, 1.5 * p.life, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255, ${Math.round(p.life * 160)}, 0, ${p.life})`;
		ctx.fill();
	}
}

// ── Draw ship ─────────────────────────────────────────────────
function drawShip() {
	const { x, y, angle, size } = ship;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);

	ctx.shadowColor = "#7af";
	ctx.shadowBlur = 12;
	ctx.strokeStyle = "#cce";
	ctx.lineWidth = 1.5;
	ctx.lineJoin = "round";
	ctx.lineCap = "round";

	ctx.beginPath();
	ctx.moveTo(size, 0);
	ctx.lineTo(-size * 0.65, -size * 0.6);
	ctx.lineTo(-size * 0.3, 0);
	ctx.lineTo(-size * 0.65, size * 0.6);
	ctx.closePath();
	ctx.stroke();

	ctx.restore();
}

// ── Update game state ─────────────────────────────────────────
function update() {
	if (isLeft()) ship.angle -= ship.rotSpeed;
	if (isRight()) ship.angle += ship.rotSpeed;

	if (isThrust()) {
		ship.vx += Math.cos(ship.angle) * ship.thrust;
		ship.vy += Math.sin(ship.angle) * ship.thrust;
		spawnFlame(ship, particles);
		spawnFlame(ship, particles);
	}

	if (isShoot() && Date.now() - lastShotTime > SHOOT_COOLDOWN) {
		spawnBullet(ship, bullets);
		lastShotTime = Date.now();
	}

	ship.vx *= ship.drag;
	ship.vy *= ship.drag;
	ship.x += ship.vx;
	ship.y += ship.vy;

	// Wrap edges
	if (ship.x < 0) ship.x += SIZE;
	if (ship.x > SIZE) ship.x -= SIZE;
	if (ship.y < 0) ship.y += SIZE;
	if (ship.y > SIZE) ship.y -= SIZE;

	updateParticles(particles);
	updateBullets(bullets, SIZE);
}

// ── Render ────────────────────────────────────────────────────
function draw() {
	ctx.fillStyle = "#111";
	ctx.fillRect(0, 0, SIZE, SIZE);
	drawParticles();
	drawBullets();
	drawShip();
}

// ── Loop ──────────────────────────────────────────────────────
function loop() {
	update();
	draw();
	requestAnimationFrame(loop);
}

loop();

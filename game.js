import { updateBullets, updateParticles, spawnBullet, spawnFlame } from "./logic";
import { drawBullets, drawParticles, drawShip } from "./render";

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

// ── Thruster particles ───────────────────────────────────────
const particles = [];

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
	drawParticles(ctx, particles);
	drawBullets(ctx, bullets);
	drawShip(ctx, ship);
}

// ── Loop ──────────────────────────────────────────────────────
function loop() {
	update();
	draw();
	requestAnimationFrame(loop);
}

loop();

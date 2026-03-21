import { updateBullets, updateParticles, spawnBullet, spawnFlame } from "./logic";
import { drawBullets, drawParticles, drawShip } from "./render";
import { SIZE, ship, bullets, particles, lastShotTime, setLastShotTime } from "./state";
import { SHOOT_COOLDOWN } from "./constants";
import { isLeft, isRight, isThrust, isShoot } from "./input";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = SIZE;
canvas.height = SIZE;

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
		setLastShotTime(Date.now());
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

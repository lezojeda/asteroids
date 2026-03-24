import {
	updateBullets,
	updateParticles,
	spawnBullet,
	spawnFlame,
	updateShipPosition,
	updateShipVelocity,
	updateAsteroids,
	spawnAsteroids,
} from "./logic";
import { drawAsteroids, drawBullets, drawParticles, drawShip } from "./render";
import { SIZE, ship, bullets, particles, asteroids, lastShotTime, setLastShotTime } from "./state";
import { SHOOT_COOLDOWN } from "./constants";
import { isLeft, isRight, isThrust, isShoot } from "./input";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = SIZE;
canvas.height = SIZE;

// ── Update game state ─────────────────────────────────────────
function update() {
	if (asteroids.length < 6) {
		spawnAsteroids(asteroids);
	}

	if (isLeft()) ship.angle -= ship.rotSpeed;
	if (isRight()) ship.angle += ship.rotSpeed;

	if (isShoot() && Date.now() - lastShotTime > SHOOT_COOLDOWN) {
		spawnBullet(ship, bullets);
		setLastShotTime(Date.now());
	}

	if (isThrust()) {
		updateShipVelocity(ship);
		spawnFlame(ship, particles);
		spawnFlame(ship, particles);
	}

	updateShipPosition(ship);
	updateParticles(particles);
	updateBullets(bullets, SIZE);
	updateAsteroids(asteroids)
}

// ── Render ────────────────────────────────────────────────────
function draw() {
	ctx.fillStyle = "#111";
	ctx.fillRect(0, 0, SIZE, SIZE);
	drawParticles(ctx, particles);
	drawBullets(ctx, bullets);
	drawShip(ctx, ship);
	drawAsteroids(ctx, asteroids);
}

// ── Loop ──────────────────────────────────────────────────────
function loop() {
	update();
	draw();
	requestAnimationFrame(loop);
}

loop();

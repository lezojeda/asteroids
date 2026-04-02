import {
	updateBullets,
	updateShipParticles,
	spawnBullet,
	spawnFlame,
	spawnExplosion,
	updateShipPosition,
	updateShipVelocity,
	updateAsteroids,
	spawnAsteroids,
	splitAsteroid,
} from "./logic";
import { drawAsteroids, drawBullets, drawParticles, drawShip } from "./render";
import {
	SIZE,
	ship,
	bullets,
	particles,
	asteroids,
	lastShotTime,
	setLastShotTime,
	gameOver,
	setGameOver,
} from "./state";
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

	updateShipPosition(ship, asteroids);
	updateShipParticles(particles);
	const hits = updateBullets(bullets, SIZE, asteroids);
	for (const hit of hits) {
		spawnExplosion(hit.x, hit.y, particles);
		if (hit.asteroid.size > 1) splitAsteroid(asteroids, hit.asteroid, hit.asteroid.size - 1);
	}
	updateAsteroids(asteroids);
}

// ── Render ────────────────────────────────────────────────────
function draw() {
	if (!gameOver) {
		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, SIZE, SIZE);
		drawParticles(ctx, particles);
		drawBullets(ctx, bullets);
		drawShip(ctx, ship);
		drawAsteroids(ctx, asteroids);
	} else {
		ctx.font = "48px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText("GAME OVER", SIZE / 2, SIZE / 2);
	}
}

// ── Loop ──────────────────────────────────────────────────────
function loop() {
	update();
	draw();
	if (!gameOver) requestAnimationFrame(loop);
}

loop();

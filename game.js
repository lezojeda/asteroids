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
import { isLeft, isRight, isThrust, isShoot, onAnyKeyOrClick } from "./input";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = SIZE;
canvas.height = SIZE;

const bgGradient = ctx.createRadialGradient(
    SIZE / 2, SIZE / 2, 0,
    SIZE / 2, SIZE / 2, SIZE * 0.8
);
bgGradient.addColorStop(0, "#131322");
bgGradient.addColorStop(1, "#080810");

function resetGame() {
	setGameOver(false);
	bullets.length = 0;
	particles.length = 0;
	asteroids.length = 0;
	ship.x = SIZE / 2;
	ship.y = SIZE / 2;
	ship.angle = -Math.PI / 2;
	ship.vx = 0;
	ship.vy = 0;
}

onAnyKeyOrClick(() => {
	if (!gameOver) return;
	resetGame();
	loop();
});

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
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, SIZE, SIZE);

		drawParticles(ctx, particles);
		drawBullets(ctx, bullets);
		drawShip(ctx, ship);
		drawAsteroids(ctx, asteroids);
	} else {
		// dim the last frame
		ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
		ctx.fillRect(0, 0, SIZE, SIZE);

		ctx.font = "48px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText("GAME OVER", SIZE / 2, SIZE / 2);

		ctx.font = "16px monospace";
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.fillText("press any key or click to restart", SIZE / 2, SIZE / 2 + 48);
	}
}

// ── Loop ──────────────────────────────────────────────────────
function loop() {
	update();
	draw();
	if (!gameOver) requestAnimationFrame(loop);
}

loop();

import {
	updateBullets,
	updateShipParticles,
	spawnBullet,
	spawnFlame,
	spawnAsteroidExplosion,
	updateShipPosition,
	updateShipVelocity,
	updateAsteroids,
	updateSaucers,
	spawnAsteroids,
	splitAsteroid,
	spawnSaucer,
} from "./logic.js";
import {
	drawAsteroids,
	drawBullets,
	drawGameOver,
	drawParticles,
	drawPaused,
	drawScore,
	drawPlayerShip,
	drawLives,
	drawWave,
	drawSaucers,
} from "./render.js";
import {
	SIZE,
	ship,
	bullets,
	particles,
	asteroids,
	saucers,
	lastShotTime,
	setLastShotTime,
	gameOver,
	setGameOver,
	score,
	addScore,
	setScore,
	paused,
	togglePause,
	wave,
	incrementWave,
	setWave,
	lives,
	setLives,
	clearSaucers,
} from "./state.js";
import { POINTS_BY_SIZE, SHOOT_COOLDOWN } from "./constants.js";
import { isLeft, isRight, isThrust, isShoot } from "./input.js";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = SIZE;
canvas.height = SIZE;

const bgGradient = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE * 0.8);
bgGradient.addColorStop(0, "#131322");
bgGradient.addColorStop(1, "#080810");

// ── Game input handlers ─────────────────────────────────────────
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
	setScore(0);
	setWave(0);
	setLives(3);
	clearSaucers();
}

window.addEventListener("keydown", e => {
	if (e.code === "KeyP" && !gameOver) togglePause();
});

window.addEventListener("keydown", e => {
	if (!gameOver) return;
	resetGame();
	loop();
});

window.addEventListener("click", e => {
	if (!gameOver) return;
	resetGame();
	loop();
});

// ── Update game state ─────────────────────────────────────────
function update() {
	// Ship
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

	// Bullets
	const hits = updateBullets(bullets, SIZE, asteroids);
	for (const hit of hits) {
		const size = hit.asteroid.size;
		spawnAsteroidExplosion(hit.x, hit.y, particles, size);

		if (size > 1) {
			splitAsteroid(asteroids, hit.asteroid, size - 1);
		}
		addScore(POINTS_BY_SIZE[size]);
	}

	// Asteroids
	updateAsteroids(asteroids);

	// Saucers
	if (saucers.length === 0 && !gameOver && !paused) {
		spawnSaucer(saucers, score);
	}
	if (saucers.length > 0) {
		updateSaucers(saucers);
	}

	if (asteroids.length === 0) {
		incrementWave(); // all asteroids hit, start next wave
		spawnAsteroids(asteroids, wave);
		clearSaucers();
	}
}

// ── Render ────────────────────────────────────────────────────
function draw() {
	if (gameOver) {
		drawGameOver(ctx, SIZE);
	} else {
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, SIZE, SIZE);
		drawParticles(ctx, particles);
		drawBullets(ctx, bullets);
		drawPlayerShip(ctx, ship);
		drawAsteroids(ctx, asteroids);
		drawScore(ctx, score, SIZE);
		drawLives(ctx, lives);
		drawWave(ctx, wave);
		drawSaucers(ctx, saucers);

		if (paused) drawPaused(ctx, SIZE);
	}
}

// ── Loop ──────────────────────────────────────────────────────

function loop() {
	if (!paused) update();
	draw();
	if (!gameOver) requestAnimationFrame(loop);
}

loop();

import {
	updateShipBullets,
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
	handleShipHit,
	handleBulletHits,
	checkSaucerBulletsHitShip,
	updateSaucerBullets,
	checkSaucersHitShip,
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
	drawSaucerBullets,
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
	setScore,
	paused,
	togglePause,
	wave,
	incrementWave,
	setWave,
	lives,
	setLives,
	clearSaucers,
	saucerBullets,
	saucerSpawnTimer,
	setSaucerSpawnTimer,
	clearSaucerBullets,
} from "./state.js";
import { SHOOT_COOLDOWN } from "./constants.js";
import { isLeft, isRight, isThrust, isShoot } from "./input.js";
import { muteAll, unmuteAll, playThrustSound, stopThrustSound } from "./sound.js";

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
	saucerBullets.length = 0;
	ship.x = SIZE / 2;
	ship.y = SIZE / 2;
	ship.angle = -Math.PI / 2;
	ship.vx = 0;
	ship.vy = 0;
	ship.invulnerable = 0;
	setScore(0);
	setWave(0);
	setLives(3);
	clearSaucers();
	clearSaucerBullets();
	setSaucerSpawnTimer(0);
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

const muteBtn = document.getElementById("mute");
muteBtn.addEventListener("click", () => {
	if (muteBtn.textContent === "♪") {
		muteAll();
		muteBtn.textContent = "✕";
	} else {
		unmuteAll();
		muteBtn.textContent = "♪";
	}
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
		playThrustSound();
	} else {
		stopThrustSound();
	}

	updateShipPosition(ship, asteroids, particles);
	updateShipParticles(particles);

	// Bullets
	const hits = updateShipBullets(bullets, SIZE, asteroids, saucers);
	handleBulletHits(hits, asteroids, particles);

	// Saucer bullets
	const saucerBulletHits = updateSaucerBullets(saucerBullets, SIZE, asteroids);
	handleBulletHits(saucerBulletHits, asteroids, particles, false);
	checkSaucerBulletsHitShip(saucerBullets, ship, particles);

	// Asteroids
	updateAsteroids(asteroids);

	// Saucers
	if (saucers.length === 0 && !gameOver && !paused) {
		if (saucerSpawnTimer <= 0) {
			spawnSaucer(saucers, score);
			setSaucerSpawnTimer(400 + Math.floor(Math.random() * 400));
		} else {
			setSaucerSpawnTimer(saucerSpawnTimer - 1);
		}
	} else {
		updateSaucers(saucers, saucerBullets, ship.x, ship.y);
		checkSaucersHitShip(saucers, ship, particles);
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
		drawSaucerBullets(ctx, saucerBullets);

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

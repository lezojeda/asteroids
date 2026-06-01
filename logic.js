import { decreaseLives, lives, setGameOver, SIZE } from "./state.js";
import {
	BULLET_SPEED,
	ASTEROID_RADIUS_SCALE,
	ASTEROID_SPEED,
	SMALL_SAUCER_SCORE_THRESHOLD,
} from "./constants.js";
import { playLaserSound, playExplosionSound } from "./sound.js";

/** State loop updates */

export function updateShipVelocity(ship) {
	ship.vx += Math.cos(ship.angle) * ship.thrust;
	ship.vy += Math.sin(ship.angle) * ship.thrust;
}

export function updateShipPosition(ship, asteroids) {
	ship.vx *= ship.drag;
	ship.vy *= ship.drag;
	ship.x += ship.vx;
	ship.y += ship.vy;

	if (ship.invulnerable > 0) {
		ship.invulnerable--;
	}

	if (ship.invulnerable === 0) {
		for (let j = asteroids.length - 1; j >= 0; j--) {
			const asteroid = asteroids[j];
			const dx = ship.x - asteroid.x;
			const dy = ship.y - asteroid.y;

			const shipRadius = ship.size * 0.8;

			if (dx * dx + dy * dy < (asteroid.radius + shipRadius) ** 2) {
				decreaseLives();

				if (lives <= 0) {
					setGameOver(true);
				} else {
					// Respawn ship in center
					ship.x = SIZE / 2;
					ship.y = SIZE / 2;
					ship.vx = 0;
					ship.vy = 0;
					ship.angle = -Math.PI / 2;

					// Give 2 seconds of invulnerability (~120 frames at 60fps)
					ship.invulnerable = 120;
				}

				splitAsteroid(asteroids, asteroids[j], asteroids[j].size - 1);
				asteroids.splice(j, 1);

				break;
			}
		}
	}

	// Wrap edges
	if (ship.x < 0) ship.x += SIZE;
	if (ship.x > SIZE) ship.x -= SIZE;
	if (ship.y < 0) ship.y += SIZE;
	if (ship.y > SIZE) ship.y -= SIZE;
}

export function updateBullets(bullets, size, asteroids = [], saucers = []) {
	const hits = [];
	for (let i = bullets.length - 1; i >= 0; i--) {
		const b = bullets[i];
		b.x += b.vx;
		b.y += b.vy;

		/** Has it reached the end of the screen? */
		const outOfBounds = b.x < 0 || b.x > size || b.y < 0 || b.y > size;
		if (outOfBounds) {
			bullets.splice(i, 1);
			continue;
		}

		let hit = false;

		/** Has it hit any asteroid? */
		for (let j = asteroids.length - 1; j >= 0; j--) {
			const asteroid = asteroids[j];
			const dx = b.x - asteroid.x;
			const dy = b.y - asteroid.y;
			if (dx * dx + dy * dy < asteroid.radius * asteroid.radius) {
				bullets.splice(i, 1);
				asteroids.splice(j, 1);
				hits.push({ type: "asteroid", x: asteroid.x, y: asteroid.y, asteroid });
				hit = true;
				break;
			}
		}

		if (hit) continue;

		/** Has it hit any saucer? */
		for (let j = saucers.length - 1; j >= 0; j--) {
			const saucer = saucers[j];
			const dx = b.x - saucer.x;
			const dy = b.y - saucer.y;
			if (dx * dx + dy * dy < saucer.radius * saucer.radius) {
				bullets.splice(i, 1);
				saucers.splice(j, 1);
				hits.push({ type: "saucer", x: saucer.x, y: saucer.y, saucer });
				hit = true;
				break;
			}
		}
	}
	return hits;
}

export function updateShipParticles(particles) {
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.x += p.vx;
		p.y += p.vy;
		p.life -= p.decay;
		if (p.life <= 0) particles.splice(i, 1);
	}
}

export function updateAsteroids(asteroids) {
	for (let i = asteroids.length - 1; i >= 0; i--) {
		const a = asteroids[i];
		a.x += a.vx;
		a.y += a.vy;

		// Wrap edges
		if (a.x + a.radius < 0) a.x = SIZE + a.radius;
		if (a.x - a.radius > SIZE) a.x = -a.radius;
		if (a.y + a.radius < 0) a.y = SIZE + a.radius;
		if (a.y - a.radius > SIZE) a.y = -a.radius;
	}
}

export function updateSaucers(saucers) {
	for (let i = saucers.length - 1; i >= 0; i--) {
		const s = saucers[i];

		s.x += s.vx;
		s.y += s.vy;

		// gentle vertical movement
		s.vy += (Math.random() - 0.5) * 0.1;
		if (Math.abs(s.vy) > 1.3) s.vy *= 0.92;

		// wrap horizontally
		if (s.x < -50) s.x = SIZE + 50;
		if (s.x > SIZE + 50) s.x = -50;

		// keep vertical bounds
		if (s.y < 30) s.vy = Math.abs(s.vy) * 0.8;
		if (s.y > SIZE - 30) s.vy = -Math.abs(s.vy) * 0.8;
	}
}

/** Entities spawn */
export function spawnBullet(ship, bullets) {
	const noseX = ship.x + Math.cos(ship.angle) * ship.size;
	const noseY = ship.y + Math.sin(ship.angle) * ship.size;

	bullets.push({
		x: noseX,
		y: noseY,
		vx: Math.cos(ship.angle) * BULLET_SPEED + ship.vx,
		vy: Math.sin(ship.angle) * BULLET_SPEED + ship.vy,
	});

	playLaserSound();
}

export function spawnFlame(ship, particles) {
	const rearX = ship.x - Math.cos(ship.angle) * ship.size;
	const rearY = ship.y - Math.sin(ship.angle) * ship.size;
	const spread = (Math.random() - 0.5) * 0.6;
	const speed = 1.5 + Math.random() * 2;
	particles.push({
		x: rearX,
		y: rearY,
		vx: -Math.cos(ship.angle + spread) * speed,
		vy: -Math.sin(ship.angle + spread) * speed,
		life: 1.0,
		decay: 0.06 + Math.random() * 0.04,
	});
}

export function spawnAsteroidExplosion(x, y, particles, asteroidSize = 1) {
	const scale = asteroidSize;
	const baseSize = 2.2 + scale * 2.1;
	const baseDecay = 0.022 + 0.018 / scale;

	const count = Math.floor(8 + Math.random() * 6 * scale);
	for (let i = 0; i < count; i++) {
		const angle = Math.random() * Math.PI * 2;
		const speed = (1.1 + Math.random() * 2.3) * (0.9 + scale * 0.5);

		particles.push({
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 1.0,
			decay: baseDecay + Math.random() * 0.012,
			size: baseSize * (0.65 + Math.random() * 0.85),
		});
	}

	playExplosionSound(asteroidSize);
}

export function spawnAsteroids(asteroids, wave) {
	const count = Math.min(4 + (wave - 1) * 2, 11);
	for (let i = 0; i < count; i++) {
		const { x, y } = randomEdgePosition();
		spawnAsteroid(asteroids, x, y, 3);
	}
}

function randomEdgePosition() {
	const side = Math.floor(Math.random() * 4);
	switch (side) {
		case 0:
			return { x: Math.random() * SIZE, y: 0 }; // top
		case 1:
			return { x: Math.random() * SIZE, y: SIZE }; // bottom
		case 2:
			return { x: 0, y: Math.random() * SIZE }; // left
		case 3:
			return { x: SIZE, y: Math.random() * SIZE }; // right
	}
}

export function spawnAsteroid(asteroids, x, y, size) {
	const sides = Math.floor(Math.random() * 6) + 5;
	const { vx, vy } = getInitialAsteroidVelocities(x, y, size);
	asteroids.push({
		x,
		y,
		vx,
		vy,
		size,
		radius: size * ASTEROID_RADIUS_SCALE,
		sides,
		offsets: getRandomAsteroidVertexOffsets(sides),
		lineWidth: size * 0.6 + (Math.random() - 0.5) * 0.3,
	});
}

/** Asteroids utilities */

export function getInitialAsteroidVelocities(x, y, size) {
	const angle = Math.atan2(SIZE / 2 - y, SIZE / 2 - x); // atan2 turns a direction into an angle
	const spread = (Math.random() - 0.5) * (Math.PI / 2); // ±45° slightly spread
	const finalAngle = angle + spread;
	const speed = ASTEROID_SPEED / size;
	const vx = Math.cos(finalAngle) * speed;
	const vy = Math.sin(finalAngle) * speed;

	return { vx, vy };
}

export function splitAsteroid(asteroids, asteroid, childSize) {
	const parentAngle = Math.atan2(asteroid.vy, asteroid.vx);
	const speed = 1.5; // children move faster than parent
	const offsets = [Math.PI / 4, -Math.PI / 4]; // split apart

	for (const angleOffset of offsets) {
		const angle = parentAngle + angleOffset;
		const sides = Math.floor(Math.random() * 6) + 5;
		asteroids.push({
			x: asteroid.x,
			y: asteroid.y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: childSize,
			radius: childSize * ASTEROID_RADIUS_SCALE,
			sides,
			offsets: getRandomAsteroidVertexOffsets(sides),
		});
	}
}

export function getRandomAsteroidVertexOffsets(sides) {
	// random per-vertex radius offsets, generated once to keep the shape stable across frames
	return Array.from({ length: sides }, () => (Math.random() - 0.5) * 0.4);
}

export function spawnSaucer(saucers, playerScore) {
	const small = shouldSpawnSmallSaucer(playerScore);

	const type = small ? "small" : "big";
	const spawnFromLeft = Math.random() < 0.5;

	saucers.push({
		x: spawnFromLeft ? -25 : SIZE + 25,
		y: 60 + Math.random() * (SIZE - 120),
		vx: (spawnFromLeft ? 1 : -1) * (small ? 2.5 : 1.7),
		vy: (Math.random() - 0.5) * 1.0,
		radius: small ? 14 : 24,
		type,
		shootTimer: 60 + Math.floor(Math.random() * 60),
	});
}

function shouldSpawnSmallSaucer(score) {
	// Above this score, always spawn small
	if (score >= SMALL_SAUCER_SCORE_THRESHOLD) return true;

	// Below the threshold, probability increases linearly with score.
	// At score 0 → 0% chance, at SMALL_SAUCER_SCORE_THRESHOLD → 100% chance.
	const spawnChance = score / SMALL_SAUCER_SCORE_THRESHOLD;

	return Math.random() < spawnChance;
}

import { setGameOver, SIZE } from "./state";
import { BULLET_SPEED, ASTEROID_RADIUS_SCALE } from "./constants";

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

	// check if ship impacted any asteroid
	for (let j = asteroids.length - 1; j >= 0; j--) {
		const asteroid = asteroids[j];
		const dx = ship.x - asteroid.x;
		const dy = ship.y - asteroid.y;

		const shipRadius = ship.size * 0.8;
		if (dx * dx + dy * dy < (asteroid.radius + shipRadius) ** 2) {
			setGameOver(true);

			break;
		}
	}

	// Wrap edges
	if (ship.x < 0) ship.x += SIZE;
	if (ship.x > SIZE) ship.x -= SIZE;
	if (ship.y < 0) ship.y += SIZE;
	if (ship.y > SIZE) ship.y -= SIZE;
}

export function updateBullets(bullets, size, asteroids = []) {
	const hits = [];
	for (let i = bullets.length - 1; i >= 0; i--) {
		const b = bullets[i];
		b.x += b.vx;
		b.y += b.vy;

		const outOfBounds = b.x < 0 || b.x > size || b.y < 0 || b.y > size;
		if (outOfBounds) {
			bullets.splice(i, 1);
		} else {
			// check if bullet collides with any one of the asteroids
			for (let j = asteroids.length - 1; j >= 0; j--) {
				const asteroid = asteroids[j];
				const dx = b.x - asteroid.x;
				const dy = b.y - asteroid.y;

				if (dx * dx + dy * dy < asteroid.radius * asteroid.radius) {
					bullets.splice(i, 1);
					asteroids.splice(j, 1);
					hits.push({ x: asteroid.x, y: asteroid.y, asteroid });
					break;
				}
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

export function spawnExplosion(x, y, particles) {
	const count = Math.floor(Math.random() * 5) + 8; // 8 to 12
	for (let i = 0; i < count; i++) {
		const angle = Math.random() * Math.PI * 2;
		const speed = 1 + Math.random() * 2;
		particles.push({
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 1.0,
			decay: 0.04 + Math.random() * 0.03,
		});
	}
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
	const { vx, vy } = getInitialAsteroidVelocities(x, y);
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

export function getInitialAsteroidVelocities(x, y) {
	const angle = Math.atan2(SIZE / 2 - y, SIZE / 2 - x); // atan2 turns a direction into an angle
	const spread = (Math.random() - 0.5) * (Math.PI / 2); // ±45° slightly spread
	const finalAngle = angle + spread;
	const speed = 1; // tune later per size
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

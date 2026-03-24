import { SIZE } from "./state";

/** State loop updates */

export function updateShipVelocity(ship) {
	ship.vx += Math.cos(ship.angle) * ship.thrust;
	ship.vy += Math.sin(ship.angle) * ship.thrust;
}

export function updateShipPosition(ship) {
	ship.vx *= ship.drag;
	ship.vy *= ship.drag;
	ship.x += ship.vx;
	ship.y += ship.vy;

	// Wrap edges
	if (ship.x < 0) ship.x += SIZE;
	if (ship.x > SIZE) ship.x -= SIZE;
	if (ship.y < 0) ship.y += SIZE;
	if (ship.y > SIZE) ship.y -= SIZE;
}

export function updateBullets(bullets, size) {
	for (let i = bullets.length - 1; i >= 0; i--) {
		const b = bullets[i];
		b.x += b.vx;
		b.y += b.vy;

		const outOfBounds = b.x < 0 || b.x > size || b.y < 0 || b.y > size;
		if (outOfBounds) bullets.splice(i, 1);
	}
}

export function updateParticles(particles) {
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
	const BULLET_SPEED = 3;
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

export function spawnAsteroids(asteroids) {
	// Go over each of the 4 sides and spawn a certain amount of asteroids
	const top = { x: Math.random() * SIZE, y: SIZE };
	const right = { x: SIZE, y: Math.random() * SIZE };
	const bottom = { x: Math.random() * SIZE, y: 0 };
	const left = { x: 0, y: Math.random() * SIZE };

	const sides = [top, right, bottom, left];

	for (const side of sides) {
		// get random size between 1, 2 or 3
		const randomSize = Math.floor(Math.random() * 3) + 1;
		const { vx, vy } = getAsteroidVelocities(side.x, side.y);

		asteroids.push({
			x: side.x,
			y: side.y,
			vx,
			vy,
			size: randomSize,
			radius: randomSize * 20,
		});
	}
}

function getAsteroidVelocities(x, y) {
	const angle = Math.atan2(SIZE / 2 - y, SIZE / 2 - x); // atan2 turns a direction into an angle
	const spread = (Math.random() - 0.5) * (Math.PI / 2); // ±45° slightly spread
	const finalAngle = angle + spread;
	const speed = 1; // tune later per size
	const vx = Math.cos(finalAngle) * speed;
	const vy = Math.sin(finalAngle) * speed;

	return { vx, vy };
}

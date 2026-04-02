import { describe, it, expect, vi } from "vitest";
import {
	updateBullets,
	updateShipParticles,
	spawnBullet,
	spawnFlame,
	splitAsteroid,
	spawnAsteroid,
	getInitialAsteroidVelocities,
} from "./logic.js";

// ── updateBullets ─────────────────────────────────────────────

describe("updateBullets", () => {
	it("moves bullet by its velocity", () => {
		const bullets = [{ x: 100, y: 100, vx: 5, vy: 3 }];
		updateBullets(bullets, 600);
		expect(bullets[0].x).toBe(105);
		expect(bullets[0].y).toBe(103);
	});

	it("removes bullet when x < 0", () => {
		const bullets = [{ x: 1, y: 300, vx: -5, vy: 0 }];
		updateBullets(bullets, 600);
		expect(bullets).toHaveLength(0);
	});

	it("removes bullet when x > size", () => {
		const bullets = [{ x: 598, y: 300, vx: 5, vy: 0 }];
		updateBullets(bullets, 600);
		expect(bullets).toHaveLength(0);
	});

	it("removes bullet when y < 0", () => {
		const bullets = [{ x: 300, y: 1, vx: 0, vy: -5 }];
		updateBullets(bullets, 600);
		expect(bullets).toHaveLength(0);
	});

	it("removes bullet when y > size", () => {
		const bullets = [{ x: 300, y: 598, vx: 0, vy: 5 }];
		updateBullets(bullets, 600);
		expect(bullets).toHaveLength(0);
	});

	it("keeps bullet when still in bounds", () => {
		const bullets = [{ x: 300, y: 300, vx: 1, vy: 1 }];
		updateBullets(bullets, 600);
		expect(bullets).toHaveLength(1);
	});

	it("handles multiple bullets, only removes out-of-bounds ones", () => {
		const bullets = [
			{ x: 300, y: 300, vx: 1, vy: 0 },
			{ x: 598, y: 300, vx: 5, vy: 0 },
			{ x: 200, y: 200, vx: -1, vy: 0 },
		];
		updateBullets(bullets, 600);
		expect(bullets).toHaveLength(2);
	});

	it("does not remove asteroids if none have been hit", () => {
		const asteroids = [
			{
				x: 400,
				y: 400,
				radius: 20,
				size: 1,
				vx: 0,
				vy: 0,
				sides: 6,
				offsets: Array(6).fill(0),
			},
		];
		const bullets = [{ x: 100, y: 100, vx: 0, vy: 0 }];
		updateBullets(bullets, 600, asteroids);
		expect(asteroids).toHaveLength(1);
	});

	it("removes asteroid of size 1 on hit", () => {
		const asteroids = [
			{
				x: 100,
				y: 100,
				radius: 20,
				size: 1,
				vx: 0,
				vy: 0,
				sides: 6,
				offsets: Array(6).fill(0),
			},
		];
		const bullets = [{ x: 100, y: 100, vx: 0, vy: 0 }];
		updateBullets(bullets, 600, asteroids);
		expect(asteroids).toHaveLength(0);
	});

	it("divides asteroid of size 2 into two of size 1 on hit", () => {
		const asteroids = [
			{
				x: 100,
				y: 100,
				radius: 40,
				size: 2,
				vx: 1,
				vy: 0,
				sides: 6,
				offsets: Array(6).fill(0),
			},
		];
		const bullets = [{ x: 100, y: 100, vx: 0, vy: 0 }];
		updateBullets(bullets, 600, asteroids);
		expect(asteroids).toHaveLength(2);
		expect(asteroids.every(a => a.size === 1)).toBe(true);
	});

	it("divides asteroid of size 3 into two of size 2 on hit", () => {
		const asteroids = [
			{
				x: 100,
				y: 100,
				radius: 60,
				size: 3,
				vx: 1,
				vy: 0,
				sides: 6,
				offsets: Array(6).fill(0),
			},
		];
		const bullets = [{ x: 100, y: 100, vx: 0, vy: 0 }];
		updateBullets(bullets, 600, asteroids);
		expect(asteroids).toHaveLength(2);
		expect(asteroids.every(a => a.size === 2)).toBe(true);
	});
});

// ── updateShipParticles ───────────────────────────────────────────

describe("updateShipParticles", () => {
	it("moves particle by its velocity", () => {
		const particles = [{ x: 100, y: 100, vx: 2, vy: -3, life: 1.0, decay: 0.1 }];
		updateShipParticles(particles);
		expect(particles[0].x).toBe(102);
		expect(particles[0].y).toBe(97);
	});

	it("reduces life by decay each frame", () => {
		const particles = [{ x: 0, y: 0, vx: 0, vy: 0, life: 1.0, decay: 0.1 }];
		updateShipParticles(particles);
		expect(particles[0].life).toBeCloseTo(0.9);
	});

	it("removes particle when life reaches 0", () => {
		const particles = [{ x: 0, y: 0, vx: 0, vy: 0, life: 0.05, decay: 0.1 }];
		updateShipParticles(particles);
		expect(particles).toHaveLength(0);
	});

	it("keeps particle when life still positive", () => {
		const particles = [{ x: 0, y: 0, vx: 0, vy: 0, life: 0.5, decay: 0.1 }];
		updateShipParticles(particles);
		expect(particles).toHaveLength(1);
	});

	it("handles multiple particles independently", () => {
		const particles = [
			{ x: 0, y: 0, vx: 0, vy: 0, life: 0.05, decay: 0.1 },
			{ x: 0, y: 0, vx: 0, vy: 0, life: 0.8, decay: 0.1 },
		];
		updateShipParticles(particles);
		expect(particles).toHaveLength(1);
		expect(particles[0].life).toBeCloseTo(0.7);
	});
});

// ── spawnBullet ───────────────────────────────────────────────

describe("spawnBullet", () => {
	it("adds one bullet to the array", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14, vx: 0, vy: 0 };
		const bullets = [];
		spawnBullet(ship, bullets);
		expect(bullets).toHaveLength(1);
	});

	it("spawns bullet at the nose position", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14, vx: 0, vy: 0 };
		const bullets = [];
		spawnBullet(ship, bullets);
		expect(bullets[0].x).toBeCloseTo(314); // 300 + cos(0)*14
		expect(bullets[0].y).toBeCloseTo(300); // 300 + sin(0)*14
	});

	it("bullet velocity points in ship direction", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14, vx: 0, vy: 0 };
		const bullets = [];
		spawnBullet(ship, bullets);
		expect(bullets[0].vx).toBeCloseTo(3); // cos(0) * 3
		expect(bullets[0].vy).toBeCloseTo(0); // sin(0) * 3
	});

	it("inherits ship velocity", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14, vx: 2, vy: 1 };
		const bullets = [];
		spawnBullet(ship, bullets);
		expect(bullets[0].vx).toBeCloseTo(5); // 3 + 2
		expect(bullets[0].vy).toBeCloseTo(1); // 0 + 1
	});

	it("works for upward-facing ship (angle = -π/2)", () => {
		const ship = { x: 300, y: 300, angle: -Math.PI / 2, size: 14, vx: 0, vy: 0 };
		const bullets = [];
		spawnBullet(ship, bullets);
		expect(bullets[0].x).toBeCloseTo(300);
		expect(bullets[0].y).toBeCloseTo(286); // 300 + sin(-π/2)*14 = 300 - 14
		expect(bullets[0].vy).toBeCloseTo(-3);
	});
});

// ── spawnFlame ────────────────────────────────────────────────

describe("spawnFlame", () => {
	it("adds one particle to the array", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14 };
		const particles = [];
		spawnFlame(ship, particles);
		expect(particles).toHaveLength(1);
	});

	it("spawns particle near the rear of the ship", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14 };
		const particles = [];
		spawnFlame(ship, particles);
		// rear is at x=286 for angle=0, allow spread tolerance
		expect(particles[0].x).toBeCloseTo(286, 0);
		expect(particles[0].y).toBeCloseTo(300, 0);
	});

	it("particle starts with full life", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14 };
		const particles = [];
		spawnFlame(ship, particles);
		expect(particles[0].life).toBe(1.0);
	});

	it("particle decay is within expected range", () => {
		const ship = { x: 300, y: 300, angle: 0, size: 14 };
		const particles = [];
		// run many times to cover random range
		for (let i = 0; i < 100; i++) spawnFlame(ship, particles);
		for (const p of particles) {
			expect(p.decay).toBeGreaterThanOrEqual(0.06);
			expect(p.decay).toBeLessThan(0.11);
		}
	});

	it("particle velocity points away from nose (negative for angle=0)", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5); // neutralize spread and speed variance
		const ship = { x: 300, y: 300, angle: 0, size: 14 };
		const particles = [];
		spawnFlame(ship, particles);
		expect(particles[0].vx).toBeLessThan(0); // moving left = away from nose
		vi.restoreAllMocks();
	});
});

describe("Asteroids", () => {
	// ── spawnAsteroid ─────────────────────────────────────────────

	describe("spawnAsteroid", () => {
		it("adds one asteroid to the array", () => {
			const asteroids = [];
			spawnAsteroid(asteroids, 0, 300, 2);
			expect(asteroids).toHaveLength(1);
		});

		it("sets position from parameters", () => {
			const asteroids = [];
			spawnAsteroid(asteroids, 100, 200, 1);
			expect(asteroids[0].x).toBe(100);
			expect(asteroids[0].y).toBe(200);
		});

		it("sets radius as size * 20", () => {
			const asteroids = [];
			spawnAsteroid(asteroids, 0, 0, 3);
			expect(asteroids[0].radius).toBe(60);
		});

		it("sets size from parameter", () => {
			const asteroids = [];
			spawnAsteroid(asteroids, 0, 0, 2);
			expect(asteroids[0].size).toBe(2);
		});

		it("sides is between 5 and 10", () => {
			const asteroids = [];
			for (let i = 0; i < 50; i++) spawnAsteroid(asteroids, 0, 0, 1);
			for (const a of asteroids) {
				expect(a.sides).toBeGreaterThanOrEqual(5);
				expect(a.sides).toBeLessThanOrEqual(10);
			}
		});

		it("offsets length matches sides", () => {
			const asteroids = [];
			for (let i = 0; i < 20; i++) spawnAsteroid(asteroids, 0, 0, 1);
			for (const a of asteroids) {
				expect(a.offsets).toHaveLength(a.sides);
			}
		});
	});

	// ── getInitialAsteroidVelocities ──────────────────────────────

	describe("getInitialAsteroidVelocities", () => {
		it("returns vx and vy", () => {
			const result = getInitialAsteroidVelocities(0, 300);
			expect(result).toHaveProperty("vx");
			expect(result).toHaveProperty("vy");
		});

		it("speed is approximately 1", () => {
			// neutralize spread
			vi.spyOn(Math, "random").mockReturnValue(0.5);
			const { vx, vy } = getInitialAsteroidVelocities(0, 300);
			const speed = Math.sqrt(vx * vx + vy * vy);
			expect(speed).toBeCloseTo(1);
			vi.restoreAllMocks();
		});

		it("points roughly toward center from left edge", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.5);
			const { vx } = getInitialAsteroidVelocities(0, 300);
			expect(vx).toBeGreaterThan(0); // spawned on left, should move right
			vi.restoreAllMocks();
		});

		it("points roughly toward center from right edge", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.5);
			const { vx } = getInitialAsteroidVelocities(600, 300);
			expect(vx).toBeLessThan(0); // spawned on right, should move left
			vi.restoreAllMocks();
		});

		it("points roughly toward center from top edge", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.5);
			const { vy } = getInitialAsteroidVelocities(300, 0);
			expect(vy).toBeGreaterThan(0); // spawned on top, should move down
			vi.restoreAllMocks();
		});
	});

	// ── splitAsteroid ─────────────────────────────────────────────

	describe("splitAsteroid", () => {
		const parent = { x: 200, y: 200, vx: 1, vy: 0, size: 2, radius: 40 };

		it("spawns exactly two children", () => {
			const asteroids = [];
			splitAsteroid(asteroids, parent, 1);
			expect(asteroids).toHaveLength(2);
		});

		it("children have the correct size", () => {
			const asteroids = [];
			splitAsteroid(asteroids, parent, 1);
			expect(asteroids.every(a => a.size === 1)).toBe(true);
		});

		it("children spawn at parent position", () => {
			const asteroids = [];
			splitAsteroid(asteroids, parent, 1);
			expect(asteroids[0].x).toBe(200);
			expect(asteroids[0].y).toBe(200);
			expect(asteroids[1].x).toBe(200);
			expect(asteroids[1].y).toBe(200);
		});

		it("children have radius of childSize * 20", () => {
			const asteroids = [];
			splitAsteroid(asteroids, parent, 1);
			expect(asteroids.every(a => a.radius === 20)).toBe(true);
		});

		it("children move in different directions", () => {
			const asteroids = [];
			splitAsteroid(asteroids, parent, 1);
			const [a, b] = asteroids;
			// symmetric split means vx is equal but vy is opposite
			expect(a.vy).not.toBeCloseTo(b.vy);
		});

		it("children speed is approximately 1.5", () => {
			const asteroids = [];
			splitAsteroid(asteroids, parent, 1);
			for (const a of asteroids) {
				const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
				expect(speed).toBeCloseTo(1.5);
			}
		});

		it("offsets length matches sides", () => {
			const asteroids = [];
			splitAsteroid(asteroids, parent, 1);
			for (const a of asteroids) {
				expect(a.offsets).toHaveLength(a.sides);
			}
		});
	});
});

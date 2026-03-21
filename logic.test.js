import { describe, it, expect, vi } from "vitest";
import { updateBullets, updateParticles, spawnBullet, spawnFlame } from "./logic.js";

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
});

// ── updateParticles ───────────────────────────────────────────

describe("updateParticles", () => {
	it("moves particle by its velocity", () => {
		const particles = [{ x: 100, y: 100, vx: 2, vy: -3, life: 1.0, decay: 0.1 }];
		updateParticles(particles);
		expect(particles[0].x).toBe(102);
		expect(particles[0].y).toBe(97);
	});

	it("reduces life by decay each frame", () => {
		const particles = [{ x: 0, y: 0, vx: 0, vy: 0, life: 1.0, decay: 0.1 }];
		updateParticles(particles);
		expect(particles[0].life).toBeCloseTo(0.9);
	});

	it("removes particle when life reaches 0", () => {
		const particles = [{ x: 0, y: 0, vx: 0, vy: 0, life: 0.05, decay: 0.1 }];
		updateParticles(particles);
		expect(particles).toHaveLength(0);
	});

	it("keeps particle when life still positive", () => {
		const particles = [{ x: 0, y: 0, vx: 0, vy: 0, life: 0.5, decay: 0.1 }];
		updateParticles(particles);
		expect(particles).toHaveLength(1);
	});

	it("handles multiple particles independently", () => {
		const particles = [
			{ x: 0, y: 0, vx: 0, vy: 0, life: 0.05, decay: 0.1 },
			{ x: 0, y: 0, vx: 0, vy: 0, life: 0.8, decay: 0.1 },
		];
		updateParticles(particles);
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

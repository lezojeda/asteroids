import { describe, it, expect, vi, beforeEach } from "vitest";
import { drawBullets, drawParticles, drawShip, drawAsteroids } from "./render.js";

function makeMockCtx() {
	return {
		beginPath: vi.fn(),
		arc: vi.fn(),
		fill: vi.fn(),
		stroke: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		closePath: vi.fn(),
		save: vi.fn(),
		restore: vi.fn(),
		translate: vi.fn(),
		rotate: vi.fn(),
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 0,
		lineJoin: "",
		lineCap: "",
		shadowColor: "",
		shadowBlur: 0,
	};
}

function makeAsteroid(overrides = {}) {
	const sides = 6;
	return {
		x: 100,
		y: 100,
		radius: 30,
		sides,
		offsets: Array(sides).fill(0),
		...overrides,
	};
}

// ── drawBullets ───────────────────────────────────────────────

describe("drawBullets", () => {
	let ctx;
	beforeEach(() => {
		ctx = makeMockCtx();
	});

	it("does nothing for empty array", () => {
		drawBullets(ctx, []);
		expect(ctx.beginPath).not.toHaveBeenCalled();
	});

	it("calls beginPath twice per bullet (glow + core)", () => {
		drawBullets(ctx, [{ x: 100, y: 100 }]);
		expect(ctx.beginPath).toHaveBeenCalledTimes(2);
	});

	it("calls arc twice per bullet", () => {
		drawBullets(ctx, [{ x: 100, y: 100 }]);
		expect(ctx.arc).toHaveBeenCalledTimes(2);
	});

	it("draws glow arc with radius 5 at bullet position", () => {
		drawBullets(ctx, [{ x: 200, y: 300 }]);
		expect(ctx.arc).toHaveBeenCalledWith(200, 300, 5, 0, Math.PI * 2);
	});

	it("draws core arc with radius 2 at bullet position", () => {
		drawBullets(ctx, [{ x: 200, y: 300 }]);
		expect(ctx.arc).toHaveBeenCalledWith(200, 300, 2, 0, Math.PI * 2);
	});

	it("calls fill twice per bullet", () => {
		drawBullets(ctx, [{ x: 100, y: 100 }]);
		expect(ctx.fill).toHaveBeenCalledTimes(2);
	});

	it("scales draw calls with bullet count", () => {
		const bullets = [
			{ x: 10, y: 10 },
			{ x: 20, y: 20 },
			{ x: 30, y: 30 },
		];
		drawBullets(ctx, bullets);
		expect(ctx.beginPath).toHaveBeenCalledTimes(6);
		expect(ctx.arc).toHaveBeenCalledTimes(6);
	});
});

// ── drawParticles ─────────────────────────────────────────────

describe("drawParticles", () => {
	let ctx;
	beforeEach(() => {
		ctx = makeMockCtx();
	});

	it("does nothing for empty array", () => {
		drawParticles(ctx, []);
		expect(ctx.beginPath).not.toHaveBeenCalled();
	});

	it("calls beginPath, arc, fill once per particle", () => {
		drawParticles(ctx, [{ x: 10, y: 10, life: 0.5 }]);
		expect(ctx.beginPath).toHaveBeenCalledTimes(1);
		expect(ctx.arc).toHaveBeenCalledTimes(1);
		expect(ctx.fill).toHaveBeenCalledTimes(1);
	});

	it("arc radius scales with life", () => {
		drawParticles(ctx, [{ x: 50, y: 50, life: 0.5 }]);
		expect(ctx.arc).toHaveBeenCalledWith(50, 50, 0.75, 0, Math.PI * 2);
	});

	it("arc radius is 1.5 at full life", () => {
		drawParticles(ctx, [{ x: 50, y: 50, life: 1.0 }]);
		expect(ctx.arc).toHaveBeenCalledWith(50, 50, 1.5, 0, Math.PI * 2);
	});

	it("arc radius approaches 0 at near-zero life", () => {
		drawParticles(ctx, [{ x: 50, y: 50, life: 0.01 }]);
		const [, , radius] = ctx.arc.mock.calls[0];
		expect(radius).toBeCloseTo(0.015);
	});

	it("fillStyle encodes life in green channel", () => {
		drawParticles(ctx, [{ x: 0, y: 0, life: 1.0 }]);
		expect(ctx.fillStyle).toBe("rgba(255, 160, 0, 1)");
	});

	it("fillStyle green channel is 0 at zero life", () => {
		drawParticles(ctx, [{ x: 0, y: 0, life: 0 }]);
		expect(ctx.fillStyle).toBe("rgba(255, 0, 0, 0)");
	});
});

// ── drawShip ──────────────────────────────────────────────────

describe("drawShip", () => {
	let ctx;
	beforeEach(() => {
		ctx = makeMockCtx();
	});

	const ship = { x: 300, y: 300, angle: 0, size: 14 };

	it("calls save and restore", () => {
		drawShip(ctx, ship);
		expect(ctx.save).toHaveBeenCalledTimes(1);
		expect(ctx.restore).toHaveBeenCalledTimes(1);
	});

	it("translates to ship position", () => {
		drawShip(ctx, ship);
		expect(ctx.translate).toHaveBeenCalledWith(300, 300);
	});

	it("rotates by ship angle", () => {
		const rotated = { ...ship, angle: Math.PI / 4 };
		drawShip(ctx, rotated);
		expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 4);
	});

	it("sets strokeStyle", () => {
		drawShip(ctx, ship);
		expect(ctx.strokeStyle).toBe("#cce");
	});

	it("sets lineWidth", () => {
		drawShip(ctx, ship);
		expect(ctx.lineWidth).toBe(1.5);
	});

	it("calls beginPath, closePath, stroke", () => {
		drawShip(ctx, ship);
		expect(ctx.beginPath).toHaveBeenCalledTimes(1);
		expect(ctx.closePath).toHaveBeenCalledTimes(1);
		expect(ctx.stroke).toHaveBeenCalledTimes(1);
	});

	it("draws nose at (size, 0)", () => {
		drawShip(ctx, ship);
		expect(ctx.moveTo).toHaveBeenCalledWith(14, 0);
	});

	it("shape scales with ship size", () => {
		const big = { ...ship, size: 20 };
		drawShip(ctx, big);
		expect(ctx.moveTo).toHaveBeenCalledWith(20, 0);
	});
});

// ── drawAsteroids ─────────────────────────────────────────────

describe("drawAsteroids", () => {
	let ctx;
	beforeEach(() => {
		ctx = makeMockCtx();
	});

	it("does nothing for empty array", () => {
		drawAsteroids(ctx, []);
		expect(ctx.beginPath).not.toHaveBeenCalled();
	});

	it("calls beginPath, closePath, stroke once per asteroid", () => {
		drawAsteroids(ctx, [makeAsteroid()]);
		expect(ctx.beginPath).toHaveBeenCalledTimes(1);
		expect(ctx.closePath).toHaveBeenCalledTimes(1);
		expect(ctx.stroke).toHaveBeenCalledTimes(1);
	});

	it("sets strokeStyle to #aaa", () => {
		drawAsteroids(ctx, [makeAsteroid()]);
		expect(ctx.strokeStyle).toBe("#aaa");
	});

	it("calls moveTo once and lineTo (sides - 1) times per asteroid", () => {
		const asteroid = makeAsteroid({ sides: 6 });
		drawAsteroids(ctx, [asteroid]);
		expect(ctx.moveTo).toHaveBeenCalledTimes(1);
		expect(ctx.lineTo).toHaveBeenCalledTimes(5);
	});

	it("first vertex uses moveTo at correct position", () => {
		// offsets all 0 so r = radius exactly, angle 0 → x = x + radius, y = y
		const asteroid = makeAsteroid({ x: 100, y: 100, radius: 30, sides: 6 });
		drawAsteroids(ctx, [asteroid]);
		expect(ctx.moveTo).toHaveBeenCalledWith(130, 100);
	});

	it("applies offsets to vertex radius", () => {
		// offset of 0.5 on first vertex → r = 30 + 0.5 * 30 = 45
		const offsets = [0.5, 0, 0, 0, 0, 0];
		const asteroid = makeAsteroid({ x: 100, y: 100, radius: 30, sides: 6, offsets });
		drawAsteroids(ctx, [asteroid]);
		expect(ctx.moveTo).toHaveBeenCalledWith(145, 100);
	});

	it("scales draw calls with asteroid count", () => {
		drawAsteroids(ctx, [makeAsteroid(), makeAsteroid()]);
		expect(ctx.beginPath).toHaveBeenCalledTimes(2);
		expect(ctx.stroke).toHaveBeenCalledTimes(2);
	});

	it("draws correct number of lineTo calls for different side counts", () => {
		const asteroid = makeAsteroid({ sides: 8, offsets: Array(8).fill(0) });
		drawAsteroids(ctx, [asteroid]);
		expect(ctx.lineTo).toHaveBeenCalledTimes(7);
	});
});

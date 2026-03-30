// ── Draw bullets ──────────────────────────────────────────────
export function drawBullets(ctx, bullets) {
	for (const b of bullets) {
		// outer glow
		ctx.beginPath();
		ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(255, 60, 60, 0.2)";
		ctx.fill();

		// core
		ctx.beginPath();
		ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
		ctx.fillStyle = "#f44";
		ctx.fill();
	}
}

// ── Draw particles ────────────────────────────────────────────
export function drawParticles(ctx, particles) {
	for (const p of particles) {
		ctx.beginPath();
		ctx.arc(p.x, p.y, 1.5 * p.life, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(255, ${Math.round(p.life * 160)}, 0, ${p.life})`;
		ctx.fill();
	}
}

// ── Draw ship ─────────────────────────────────────────────────
export function drawShip(ctx, ship) {
	const { x, y, angle, size } = ship;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);

	ctx.shadowColor = "#7af";
	ctx.shadowBlur = 12;
	ctx.strokeStyle = "#cce";
	ctx.lineWidth = 1.5;
	ctx.lineJoin = "round";
	ctx.lineCap = "round";

	ctx.beginPath();
	ctx.moveTo(size, 0);
	ctx.lineTo(-size * 0.65, -size * 0.6);
	ctx.lineTo(-size * 0.3, 0);
	ctx.lineTo(-size * 0.65, size * 0.6);
	ctx.closePath();
	ctx.stroke();

	ctx.restore();
}

// ── Draw asteroids ────────────────────────────────────────────
export function drawAsteroids(ctx, asteroids) {
	for (const asteroid of asteroids) {
		ctx.beginPath();
		ctx.strokeStyle = "#aaa";

		const { sides } = asteroid;

		for (let i = 0; i < sides; i++) {
			const angle = (i / sides) * Math.PI * 2;
			const r = asteroid.radius + asteroid.offsets[i] * asteroid.radius;
			const x = asteroid.x + Math.cos(angle) * r;
			const y = asteroid.y + Math.sin(angle) * r;

			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.stroke();
	}
}

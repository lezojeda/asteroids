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
export function drawPlayerShip(ctx, ship) {
	const { x, y, angle, size, invulnerable } = ship;

	// Flicker when invulnerable
	if (invulnerable > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
		return;
	}

	drawShip(ctx, x, y, size, angle);
}

export function drawLives(ctx, lives) {
	for (let i = 0; i < lives; i++) {
		const x = 24 + i * 24;
		const y = 24;
		const size = 8;

		drawShip(ctx, x, y, size);
	}
}

function drawShip(ctx, x, y, size, angle) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle ?? -Math.PI / 2);
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
		ctx.lineWidth = asteroid.lineWidth;

		const { sides } = asteroid;

		// Step around the circle in equal angle increments, one step per side.
		// Each vertex is offset from the base radius to create a jagged, rocky shape.
		// First vertex starts the path, the rest extend it.
		for (let i = 0; i < sides; i++) {
			const angle = (i / sides) * Math.PI * 2;
			const r = asteroid.radius + asteroid.offsets[i] * asteroid.radius;
			const x = asteroid.x + Math.cos(angle) * r;
			const y = asteroid.y + Math.sin(angle) * r;

			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
		ctx.fill();
		ctx.strokeStyle = "#aaa";
		ctx.stroke();
		ctx.closePath();
		ctx.stroke();
	}
}

// ── Draw game over ────────────────────────────────────────────
function dim(ctx, size) {
	// dim the last frame
	ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	ctx.fillRect(0, 0, size, size);
}

export function drawGameOver(ctx, size) {
	dim(ctx, size);

	ctx.font = "48px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "white";
	ctx.fillText("GAME OVER", size / 2, size / 2);

	ctx.font = "16px monospace";
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	ctx.fillText("press any key or click to restart", size / 2, size / 2 + 48);
}

// ── Draw pause ────────────────────────────────────────────
export function drawPaused(ctx, size) {
	dim(ctx, size);

	ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	ctx.fillRect(0, 0, size, size);

	ctx.font = "32px monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "white";
	ctx.fillText("PAUSED", size / 2, size / 2);

	ctx.font = "16px monospace";
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	ctx.fillText("press P to resume", size / 2, size / 2 + 48);
}

// ── Draw score ────────────────────────────────────────────────
export function drawScore(ctx, score, size) {
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.font = "24px monospace";
	ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
	ctx.fillText(`${score}`, size - 16, 24);
}

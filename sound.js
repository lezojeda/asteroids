const laserSound = new Audio("/sounds/laser1.wav");
const explosionSound = new Audio("/sounds/asteroid_explosion.mp3");

laserSound.preload = "auto";
explosionSound.preload = "auto";

export function playLaserSound() {
	if (!laserSound) return;

	laserSound.currentTime = 0;
	laserSound.volume = 0.65;
	laserSound.playbackRate = 0.7 + (Math.random() - 0.5) * 0.1;
	laserSound.play().catch(() => {});
}

let activeExplosions = 0;
const MAX_SIMULTANEOUS_EXPLOSIONS = 3;
const EXPLOSION_TIMEOUT = 300;
export function playExplosionSound(size = 1) {
	if (!explosionSound) {
		console.error("Missing asteroid explosion file");
		return;
	}

	// Limit maximum simultaneous explosions
	if (activeExplosions >= MAX_SIMULTANEOUS_EXPLOSIONS) {
		return; // don't play more than 3 at once
	}

	let rate = 1.0;
	let volume = 1.0;

	// vary sound according to asteroid size
	if (size === 3) {
		rate = 0.75;
		volume = 1.0;
	} else if (size === 2) {
		rate = 1.25;
		volume = 0.8;
	} else {
		rate = 1.75;
		volume = 0.65;
	}

	rate += (Math.random() - 0.5) * 0.18;

	// Clone the sound so multiple can play at the same time
	const soundClone = explosionSound.cloneNode();
	soundClone.playbackRate = Math.max(0.5, Math.min(2.0, rate));
	soundClone.volume = volume;

	soundClone.play().catch(() => {});

	// Decrease counter when sound finishes
	soundClone.onended = () => {
		activeExplosions = Math.max(0, activeExplosions - 1);
	};

	// Safety timeout in case onended doesn't fire
	setTimeout(() => {
		activeExplosions = Math.max(0, activeExplosions - 1);
	}, EXPLOSION_TIMEOUT);
}

// Future extensions:
export function playThrustSound() {
	/* ... */
}
export function playShipExplosionSound() {
	/* ... */
}

export function muteAll() {
	laserSound.volume = 0;
	explosionSound.volume = 0;
}

export function unmuteAll() {
	laserSound.volume = 0.9;
	explosionSound.volume = 1.0;
}

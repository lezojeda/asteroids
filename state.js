import { SHIP_ROT_SPEED, SHIP_THRUST, SHIP_DRAG, SHIP_SIZE } from "./constants";

export const SIZE = Math.min(window.innerWidth - 32, window.innerHeight - 60, 800);

export const ship = {
	x: SIZE / 2,
	y: SIZE / 2,
	angle: -Math.PI / 2,
	vx: 0,
	vy: 0,
	rotSpeed: SHIP_ROT_SPEED,
	thrust: SHIP_THRUST,
	drag: SHIP_DRAG,
	size: SHIP_SIZE,
};

export const bullets = [];
export const particles = [];
export const asteroids = [];

export let lastShotTime = 0;
export function setLastShotTime(t) {
	lastShotTime = t;
}

export let gameOver = false;
export function setGameOver(value) {
	gameOver = value;
}

export let paused = false;
export function togglePause() { paused = !paused; }

export let score = 0;
export function addScore(value) {
	score += value;
}
export function setScore(value) {
	score = value;
}

export let wave = 0;
export function incrementWave() {
	wave += 1;
}
export function setWave(value) {
	wave = value;
}
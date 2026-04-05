const keys = {};

window.addEventListener("keydown", e => {
    keys[e.code] = true;
    e.preventDefault();
});

window.addEventListener("keyup", e => {
    keys[e.code] = false;
});

export const isLeft   = () => keys["ArrowLeft"]  || keys["KeyA"];
export const isRight  = () => keys["ArrowRight"] || keys["KeyD"];
export const isThrust = () => keys["ArrowUp"]    || keys["KeyW"];
export const isShoot  = () => keys["Space"];
import Application from "./Application.js";
import Process from "./Process.js";

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("sim-canvas"));

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const app = new Application(canvas);

let lastTimestamp = 0;
function mainLoop(timestamp) {
    const deltaTime = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    app.clear();
    app.update(deltaTime);
    app.draw();

    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);


document.getElementById('add-process')?.addEventListener('click', (event) => {
    document.getElementById('processModal')?.classList.add('show');
});

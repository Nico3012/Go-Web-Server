import { addPage } from "./ram/ram.1.2.0.js";
import { initPointerAndTouchEvents } from "./pointer/pointer.1.1.1.js";
import { renderAnimationFrame, renderPredictionPaths } from "./render/render.1.3.0.js";

/** @type {import("./pointer/pointer.1.1.1.js").PointerOptions} */
let pointerOptions = {
    relativeLineWidth: 0.002,
    pencilActive: true,
    eraserActive: false,
    drawWithoutPencil: true,
    color: "#2f8bd7",
    delayToStraight: 1000,
    maxPixelDifferenceForStraight: 2
};

/** @type {import("./render/render.1.3.0.js").PredictionRenderOptions} */
let predictionRenderOptions = {
    predictionFactor: 20.33,
    maxPredictionPixelDistance: 60,

    pixelDistanceBetweenPredictionPoints: 6,
    minIndexesToNextPredictionPoint: 1,

    calcPointFrom3Factor: 2,
    calcPointFrom2Factor: 3
};

addPage(0, "#ffffff", "canvas#page-1-active-paths-canvas", "canvas#page-1-prediction-paths-canvas", "canvas#page-1-completed-paths-canvas");

initPointerAndTouchEvents(0, pointerOptions, predictionRenderOptions);

let animationFrame = () => {
    renderAnimationFrame(0, predictionRenderOptions);

    window.requestAnimationFrame(animationFrame);
};

animationFrame();

// config beta

const setButtonOptionColor = () => {
    // @ts-ignore
    document.querySelector("button#toggle-pencil-eraser").style.backgroundColor = pointerOptions.pencilActive ? "green" : pointerOptions.eraserActive ? "red" : "black";

    // @ts-ignore
    document.querySelector("button#toggle-draw-without-pencil").style.backgroundColor = pointerOptions.drawWithoutPencil ? "green" : "red";
}

// @ts-ignore
document.querySelector("button#toggle-pencil-eraser").addEventListener("click", () => {
    pointerOptions.pencilActive = !pointerOptions.pencilActive;
    pointerOptions.eraserActive = !pointerOptions.pencilActive;
    setButtonOptionColor();
});

// @ts-ignore
document.querySelector("button#toggle-draw-without-pencil").addEventListener("click", () => {
    pointerOptions.drawWithoutPencil = !pointerOptions.drawWithoutPencil;
    setButtonOptionColor();
});

// @ts-ignore
document.querySelector("input#current-line-width").addEventListener("change", (event) => {
    // @ts-ignore
    pointerOptions.relativeLineWidth = Number(event.target.value) / 1000;
});

// @ts-ignore
document.querySelector("input#current-color").addEventListener("change", (event) => {
    // @ts-ignore
    pointerOptions.color = event.target.value;
});

// initially set button color
setButtonOptionColor();

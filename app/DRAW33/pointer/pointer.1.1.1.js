import { getActivePathsCanvasAndContext, getPredictionPathsCanvasAndContext, addActivePath, getActivePaths, addPointToActivePath, addPointToActiveStraightPath, moveActivePathToCompletedPaths, removeCompletedPathsAtPoint, bresenhamLineAlgorithm } from "../ram/ram.1.2.0.js";
import { renderPaths, renderPredictionPaths } from "../render/render.1.3.0.js";

/**
 * @typedef {{[identifier: number]: true}} PointerDown
 */

/**
 * @typedef InteractionPoint
 * @property {number} relativeX
 * @property {number} relativeY
 * @property {number} timeoutId
 */

/**
 * @typedef PointerOptions
 * @property {boolean} drawWithoutPencil
 * @property {boolean} pencilActive
 * @property {boolean} eraserActive
 * @property {number} relativeLineWidth - [0, 1]
 * @property {string} color
 * @property {number} delayToStraight
 * @property {number} maxPixelDifferenceForStraight
 */

/** @type {PointerDown} */
let pointerDown = {};

/** @type {{[identifier: number]: import("../ram/ram.1.2.0.js").Point}} */
let activePoints = {};

/** @type {{[identifier: number]: InteractionPoint}} */
let lastInteractionPoints = {};

/** @type {{[identifier: number]: true}} */
let drawStraight = {};

/**
 * @param {number} pageIndex
 * @param {PointerOptions} pointerOptions
 * @param {import("../render/render.1.3.0.js").PredictionRenderOptions} predictionRenderOptions
 * @param {HTMLCanvasElement} activePathsCanvas
 * @param {CanvasRenderingContext2D} activePathsContext
 * @param {HTMLCanvasElement} predictionPathsCanvas
 * @param {CanvasRenderingContext2D} predictionPathsContext
 * @param {PointerEvent} event
 * @returns {undefined}
 */
let pointerdownFunction = (pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvas, activePathsContext, predictionPathsCanvas, predictionPathsContext, event) => {
    pointerDown[event.pointerId] = true;

    if (pointerOptions.drawWithoutPencil || event.pointerType == "pen") {
        /** @type {import("../ram/ram.1.2.0.js").Point} */
        let point = {
            relativeX: event.offsetX / activePathsCanvas.offsetWidth,
            relativeY: event.offsetY / activePathsCanvas.offsetWidth
        };

        activePoints[event.pointerId] = point;

        if (pointerOptions.pencilActive) {
            lastInteractionPoints[event.pointerId] = {
                relativeX: point.relativeX,
                relativeY: point.relativeY,
                timeoutId: setTimeout(() => {
                    drawStraight[event.pointerId] = true;

                    pointermoveFunction(pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvas, activePathsContext, predictionPathsCanvas, predictionPathsContext, event);
                }, pointerOptions.delayToStraight)
            };

            addActivePath(pageIndex, event.pointerId, pointerOptions.relativeLineWidth, pointerOptions.color, event.offsetX / activePathsCanvas.offsetWidth, event.offsetY / activePathsCanvas.offsetWidth);
        }

        if (pointerOptions.eraserActive) {
            removeCompletedPathsAtPoint(pageIndex, activePathsCanvas, activePathsContext, point.relativeX, point.relativeY);
        }
    }
};

/**
 * @param {number} pageIndex
 * @param {PointerOptions} pointerOptions
 * @param {import("../render/render.1.3.0.js").PredictionRenderOptions} predictionRenderOptions
 * @param {HTMLCanvasElement} activePathsCanvas
 * @param {CanvasRenderingContext2D} activePathsContext
 * @param {HTMLCanvasElement} predictionPathsCanvas
 * @param {CanvasRenderingContext2D} predictionPathsContext
 * @param {PointerEvent} event
 * @returns {undefined}
 */
let pointermoveFunction = (pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvas, activePathsContext, predictionPathsCanvas, predictionPathsContext, event) => {
    if (pointerDown[event.pointerId] != true) {
        return;
    }

    if (pointerOptions.drawWithoutPencil || event.pointerType == "pen") {
        /** @type {import("../ram/ram.1.2.0.js").Point | undefined} */
        let lastPoint = activePoints[event.pointerId];

        if (lastPoint == undefined) {
            console.log("lastPoint == undefined at pointermoveFunction");
            return;
        }

        /** @type {import("../ram/ram.1.2.0.js").Point} */
        let point = {
            relativeX: event.offsetX / activePathsCanvas.offsetWidth,
            relativeY: event.offsetY / activePathsCanvas.offsetWidth
        };

        activePoints[event.pointerId] = point;

        if (pointerOptions.pencilActive) {
            { // check for moving to straight mode
                let lastInteractionPoint = lastInteractionPoints[event.pointerId];

                if (lastInteractionPoint == undefined) {
                    console.log("lastInteractionPoint == undefined at pointermoveFunction");
                    return;
                }

                let maxRelativeDifferenceForStraight = pointerOptions.maxPixelDifferenceForStraight / activePathsCanvas.clientWidth;

                if (Math.abs(point.relativeX - lastInteractionPoint.relativeX) >= maxRelativeDifferenceForStraight || Math.abs(point.relativeY - lastInteractionPoint.relativeY) >= maxRelativeDifferenceForStraight) {
                    // zählt als bewegung

                    clearTimeout(lastInteractionPoint.timeoutId);

                    lastInteractionPoint.relativeX = point.relativeX;
                    lastInteractionPoint.relativeY = point.relativeY;
                    lastInteractionPoint.timeoutId = setTimeout(() => {
                        drawStraight[event.pointerId] = true;

                        pointermoveFunction(pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvas, activePathsContext, predictionPathsCanvas, predictionPathsContext, event);
                    }, pointerOptions.delayToStraight);
                }
            }

            if (drawStraight[event.pointerId] == true) {
                addPointToActiveStraightPath(pageIndex, event.pointerId, point.relativeX, point.relativeY);

                let activePaths = getActivePaths(pageIndex);

                activePathsContext.clearRect(0, 0, activePathsCanvas.width, activePathsCanvas.height);
                renderPaths(activePathsCanvas, activePathsContext, activePaths);
            } else {
                activePathsContext.beginPath();
                activePathsContext.lineWidth = Math.round(pointerOptions.relativeLineWidth * activePathsCanvas.width);
                activePathsContext.moveTo(Math.round(lastPoint.relativeX * activePathsCanvas.width), Math.round(lastPoint.relativeY * activePathsCanvas.width));
                activePathsContext.lineTo(Math.round(point.relativeX * activePathsCanvas.width), Math.round(point.relativeY * activePathsCanvas.width));
                activePathsContext.strokeStyle = pointerOptions.color;
                activePathsContext.stroke();

                addPointToActivePath(pageIndex, event.pointerId, point.relativeX, point.relativeY);

                // let activePaths = getActivePaths(pageIndex);
                // predictionPathsContext.clearRect(0, 0, predictionPathsCanvas.width, predictionPathsCanvas.height);
                // renderPredictionPaths(predictionPathsCanvas, predictionPathsContext, activePaths, predictionRenderOptions);
            }
        }

        if (pointerOptions.eraserActive) {
            /** @type {import("../ram/ram.1.2.0.js").Point[]} */
            let points = bresenhamLineAlgorithm(activePathsCanvas, lastPoint.relativeX, lastPoint.relativeY, point.relativeX, point.relativeY);

            for (let index = 0; index < points.length; index += 1) {
                /** @type {import("../ram/ram.1.2.0.js").Point | undefined} */
                let pointIndex = points[index];

                if (pointIndex == undefined) {
                    console.log(`point${index.toString()} == undefined at pointermoveFunction`);
                    continue;
                }

                removeCompletedPathsAtPoint(pageIndex, activePathsCanvas, activePathsContext, pointIndex.relativeX, pointIndex.relativeY);
            }
        }
    }
};

/**
 * @param {number} pageIndex
 * @param {PointerOptions} pointerOptions
 * @param {import("../render/render.1.3.0.js").PredictionRenderOptions} predictionRenderOptions
 * @param {HTMLCanvasElement} activePathsCanvas
 * @param {CanvasRenderingContext2D} activePathsContext
 * @param {HTMLCanvasElement} predictionPathsCanvas
 * @param {CanvasRenderingContext2D} predictionPathsContext
 * @param {PointerEvent} event
 * @returns {undefined}
 */
let pointerupFunction = (pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvas, activePathsContext, predictionPathsCanvas, predictionPathsContext, event) => {
    if (pointerDown[event.pointerId] != true) {
        return;
    }

    delete pointerDown[event.pointerId];

    if (pointerOptions.drawWithoutPencil || event.pointerType == "pen") {
        /** @type {import("../ram/ram.1.2.0.js").Point | undefined} */
        let lastPoint = activePoints[event.pointerId];

        if (lastPoint == undefined) {
            console.log("lastPoint == undefined at pointerupFunction");
            return;
        }

        /** @type {import("../ram/ram.1.2.0.js").Point} */
        let point = {
            relativeX: event.offsetX / activePathsCanvas.offsetWidth,
            relativeY: event.offsetY / activePathsCanvas.offsetWidth
        };

        delete activePoints[event.pointerId];

        if (pointerOptions.pencilActive) {
            { // clearTimeout for straight mode
                let lastInteractionPoint = lastInteractionPoints[event.pointerId];

                if (lastInteractionPoint == undefined) {
                    console.log("lastInteractionPoint == undefined at pointermoveFunction");
                    return;
                }

                clearTimeout(lastInteractionPoint.timeoutId);
            }

            if (drawStraight[event.pointerId] == true) {
                addPointToActiveStraightPath(pageIndex, event.pointerId, point.relativeX, point.relativeY);

                let activePaths = getActivePaths(pageIndex);

                activePathsContext.clearRect(0, 0, activePathsCanvas.width, activePathsCanvas.height);
                renderPaths(activePathsCanvas, activePathsContext, activePaths);

                delete drawStraight[event.pointerId];
            } else {
                activePathsContext.beginPath();
                activePathsContext.lineWidth = Math.round(pointerOptions.relativeLineWidth * activePathsCanvas.width);
                activePathsContext.moveTo(Math.round(lastPoint.relativeX * activePathsCanvas.width), Math.round(lastPoint.relativeY * activePathsCanvas.width));
                activePathsContext.lineTo(Math.round(point.relativeX * activePathsCanvas.width), Math.round(point.relativeY * activePathsCanvas.width));
                activePathsContext.strokeStyle = pointerOptions.color;
                activePathsContext.stroke();

                addPointToActivePath(pageIndex, event.pointerId, point.relativeX, point.relativeY);

                // predictionPathsContext.clearRect(0, 0, predictionPathsCanvas.width, predictionPathsCanvas.height);
            }

            moveActivePathToCompletedPaths(pageIndex, event.pointerId);
        }

        if (pointerOptions.eraserActive) {
            /** @type {import("../ram/ram.1.2.0.js").Point[]} */
            let points = bresenhamLineAlgorithm(activePathsCanvas, lastPoint.relativeX, lastPoint.relativeY, point.relativeX, point.relativeY);

            for (let index = 0; index < points.length; index += 1) {
                /** @type {import("../ram/ram.1.2.0.js").Point | undefined} */
                let pointIndex = points[index];

                if (pointIndex == undefined) {
                    console.log(`point${index.toString()} == undefined at pointerupFunction`);
                    continue;
                }

                removeCompletedPathsAtPoint(pageIndex, activePathsCanvas, activePathsContext, pointIndex.relativeX, pointIndex.relativeY);
            }
        }
    }
};

/**
 * @param {number} pageIndex
 * @param {PointerOptions} pointerOptions
 * @param {import("../render/render.1.3.0.js").PredictionRenderOptions} predictionRenderOptions
 * @returns {undefined}
 */
export let initPointerAndTouchEvents = (pageIndex, pointerOptions, predictionRenderOptions) => {
    /** @type {import("../ram/ram.1.2.0.js").CanvasAndContext} */
    let activePathsCanvasAndContext = getActivePathsCanvasAndContext(pageIndex);

    /** @type {import("../ram/ram.1.2.0.js").CanvasAndContext} */
    let predictionPathsCanvasAndContext = getPredictionPathsCanvasAndContext(pageIndex);

    activePathsCanvasAndContext.canvas.addEventListener("pointerdown", (event) => {
        pointerdownFunction(pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvasAndContext.canvas, activePathsCanvasAndContext.context, predictionPathsCanvasAndContext.canvas, predictionPathsCanvasAndContext.context, event);
    }, {
        passive: true
    });

    activePathsCanvasAndContext.canvas.addEventListener("pointermove", (event) => {
        pointermoveFunction(pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvasAndContext.canvas, activePathsCanvasAndContext.context, predictionPathsCanvasAndContext.canvas, predictionPathsCanvasAndContext.context, event);
    }, {
        passive: true
    });

    activePathsCanvasAndContext.canvas.addEventListener("pointerup", (event) => {
        pointerupFunction(pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvasAndContext.canvas, activePathsCanvasAndContext.context, predictionPathsCanvasAndContext.canvas, predictionPathsCanvasAndContext.context, event);
    }, {
        passive: true
    });

    activePathsCanvasAndContext.canvas.addEventListener("pointerleave", (event) => {
        pointerupFunction(pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvasAndContext.canvas, activePathsCanvasAndContext.context, predictionPathsCanvasAndContext.canvas, predictionPathsCanvasAndContext.context, event);
    }, {
        passive: true
    });

    activePathsCanvasAndContext.canvas.addEventListener("pointercancel", (event) => {
        pointerupFunction(pageIndex, pointerOptions, predictionRenderOptions, activePathsCanvasAndContext.canvas, activePathsCanvasAndContext.context, predictionPathsCanvasAndContext.canvas, predictionPathsCanvasAndContext.context, event);
    }, {
        passive: true
    });

    // preventDefault

    activePathsCanvasAndContext.canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
    }, {
        passive: false
    });

    activePathsCanvasAndContext.canvas.addEventListener("touchmove", (event) => {
        event.preventDefault();
    }, {
        passive: false
    });

    activePathsCanvasAndContext.canvas.addEventListener("touchend", (event) => {
        event.preventDefault();
    }, {
        passive: false
    });
};

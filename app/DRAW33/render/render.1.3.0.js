import { resizePageCanvases, getActivePathsCanvasAndContext, getPredictionPathsCanvasAndContext, getCompletedPathsCanvasAndContext, getActivePaths, getCompletedPaths } from "../ram/ram.1.2.0.js";
import { calcPointFrom2, calcPointFrom3, getDist } from "../prediction/prediction.1.0.7b.js";

/**
 * @typedef PredictionRenderOptions
 * @property {number} predictionFactor
 * @property {number} maxPredictionPixelDistance
 * @property {number} pixelDistanceBetweenPredictionPoints
 * @property {number} minIndexesToNextPredictionPoint
 * @property {number} calcPointFrom3Factor
 * @property {number} calcPointFrom2Factor
 */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @param {import("../ram/ram.1.2.0.js").Path[]} paths
 * @returns {undefined}
 */
export let renderPaths = (canvas, context, paths) => {
    for (let index = 0; index < paths.length; index += 1) {
        let path = paths[index];

        if (path == undefined) {
            console.log("path == undefined at renderPaths");
            return;
        }

        context.beginPath();

        context.lineWidth = Math.round(path.relativeLineWidth * canvas.width);

        /** @type {import("../ram/ram.1.2.0.js").Point | undefined} */
        let point0 = path.points[0];

        if (point0 == undefined) {
            console.log("point0 == undefined at renderPaths");
            return;
        }

        context.moveTo(Math.round(point0.relativeX * canvas.width), Math.round(point0.relativeY * canvas.width));

        for (let index = 1; index < path.points.length; index += 1) {
            /** @type {import("../ram/ram.1.2.0.js").Point | undefined} */
            let pointIndex = path.points[index];

            if (pointIndex == undefined) {
                console.log(`point${index.toString()} == undefined at renderPaths`);
                return;
            }

            context.lineTo(Math.round(pointIndex.relativeX * canvas.width), Math.round(pointIndex.relativeY * canvas.width));
        }

        context.strokeStyle = path.color;
        context.stroke();
    }
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @param {import("../ram/ram.1.2.0.js").Path[]} activePaths
 * @param {PredictionRenderOptions} predictionRenderOptions
 * @returns {undefined}
 */
export let renderPredictionPaths = (canvas, context, activePaths, predictionRenderOptions) => {
    for (let index = 0; index < activePaths.length; index += 1) {
        let path = activePaths[index];

        if (path == undefined) {
            console.log("path == undefined at renderPredictionPaths");
            return;
        }

        if (path.points.length >= 3) { // error maybe points are the same
            let lastPoint = path.points[path.points.length - 1];
            let secondLastPoint = path.points[path.points.length - 2];
            let thirdLastPoint = path.points[path.points.length - 3];

            if (lastPoint == undefined) {
                throw "lastPoint == undefined at renderPredictionPaths";
            }
            if (secondLastPoint == undefined) {
                throw "secondLastPoint == undefined at renderPredictionPaths";
            }
            if (thirdLastPoint == undefined) {
                throw "secondLastPoint == undefined at renderPredictionPaths";
            }

            let relativeDistanceBetweenPoints = (getDist(secondLastPoint.relativeX, secondLastPoint.relativeY, lastPoint.relativeX, lastPoint.relativeY) + getDist(thirdLastPoint.relativeX, thirdLastPoint.relativeY, secondLastPoint.relativeX, secondLastPoint.relativeY)) / 2;

            let relativeDistanceBetweenPredictionPoints = predictionRenderOptions.pixelDistanceBetweenPredictionPoints / canvas.offsetWidth; // 8

            let indexesToNextPredictionPoint = Math.round(relativeDistanceBetweenPredictionPoints / relativeDistanceBetweenPoints); // 4

            if (indexesToNextPredictionPoint < predictionRenderOptions.minIndexesToNextPredictionPoint) {
                indexesToNextPredictionPoint = predictionRenderOptions.minIndexesToNextPredictionPoint;
            }

            if (path.points.length >= Math.round(2 * indexesToNextPredictionPoint + 1)) {
                let indexP2 = Math.round(path.points.length - 1);
                let indexP1 = Math.round(path.points.length - indexesToNextPredictionPoint - 1);
                let indexP0 = Math.round(path.points.length - 2 * indexesToNextPredictionPoint - 1);

                let p2 = path.points[indexP2];
                let p1 = path.points[indexP1];
                let p0 = path.points[indexP0];

                if (p2 == undefined) {
                    throw "p2 == undefined at renderPredictionPaths";
                }
                if (p1 == undefined) {
                    throw "p1 == undefined at renderPredictionPaths";
                }
                if (p0 == undefined) {
                    throw "p0 == undefined at renderPredictionPaths";
                }

                let p3_2 = calcPointFrom2(p1.relativeX, p1.relativeY, p2.relativeX, p2.relativeY, predictionRenderOptions.predictionFactor, predictionRenderOptions.maxPredictionPixelDistance / canvas.offsetWidth);
                let p3_3 = calcPointFrom3(p0.relativeX, p0.relativeY, p1.relativeX, p1.relativeY, p2.relativeX, p2.relativeY, predictionRenderOptions.predictionFactor, predictionRenderOptions.maxPredictionPixelDistance / canvas.offsetWidth);

                /** @type {import("../ram/ram.1.2.0.js").Point} */
                let p3 = {
                    relativeX: (predictionRenderOptions.calcPointFrom2Factor * p3_2.relativeX + predictionRenderOptions.calcPointFrom3Factor * p3_3.relativeX) / (predictionRenderOptions.calcPointFrom2Factor + predictionRenderOptions.calcPointFrom3Factor),
                    relativeY: (predictionRenderOptions.calcPointFrom2Factor * p3_2.relativeY + predictionRenderOptions.calcPointFrom3Factor * p3_3.relativeY) / (predictionRenderOptions.calcPointFrom2Factor + predictionRenderOptions.calcPointFrom3Factor)
                };

                context.beginPath();

                context.lineWidth = Math.round(path.relativeLineWidth * canvas.width);

                context.moveTo(Math.round(p2.relativeX * canvas.width), Math.round(p2.relativeY * canvas.width));
                context.lineTo(Math.round(p3.relativeX * canvas.width), Math.round(p3.relativeY * canvas.width));

                context.strokeStyle = path.color;

                context.stroke();
            }
        }
    }
};

/**
 * @param {number} pageIndex
 * @param {PredictionRenderOptions} predictionRenderOptions
 * @returns {undefined}
 */
export let renderAnimationFrame = (pageIndex, predictionRenderOptions) => {
    /** @type {import("../ram/ram.1.2.0.js").Path[]} */
    let activePaths = getActivePaths(pageIndex);

    if (activePaths.length == 0) {
        /** @type {import("../ram/ram.1.2.0.js").Path[]} */
        let completedPaths = getCompletedPaths(pageIndex);

        /** @type {import("../ram/ram.1.2.0.js").CanvasAndContext} */
        let activePathsCanvasAndContext = getActivePathsCanvasAndContext(pageIndex);
        /** @type {import("../ram/ram.1.2.0.js").CanvasAndContext} */
        let predictionsPathsCanvasAndContext = getPredictionPathsCanvasAndContext(pageIndex);
        /** @type {import("../ram/ram.1.2.0.js").CanvasAndContext} */
        let completedPathsCanvasAndContext = getCompletedPathsCanvasAndContext(pageIndex);

        if (
            completedPathsCanvasAndContext.canvas.width != Math.round(completedPathsCanvasAndContext.canvas.offsetWidth * window.devicePixelRatio) ||
            completedPathsCanvasAndContext.canvas.height != Math.round(completedPathsCanvasAndContext.canvas.offsetHeight * window.devicePixelRatio)
        ) {
            resizePageCanvases(pageIndex);
        }

        activePathsCanvasAndContext.context.clearRect(0, 0, activePathsCanvasAndContext.canvas.width, activePathsCanvasAndContext.canvas.height);
        predictionsPathsCanvasAndContext.context.clearRect(0, 0, predictionsPathsCanvasAndContext.canvas.width, predictionsPathsCanvasAndContext.canvas.height);
        completedPathsCanvasAndContext.context.clearRect(0, 0, completedPathsCanvasAndContext.canvas.width, completedPathsCanvasAndContext.canvas.height);
        renderPaths(completedPathsCanvasAndContext.canvas, completedPathsCanvasAndContext.context, completedPaths);
        // renderPredictionPaths(predictionsPathsCanvasAndContext.canvas, predictionsPathsCanvasAndContext.context, activePaths, predictionRenderOptions);
    }
};

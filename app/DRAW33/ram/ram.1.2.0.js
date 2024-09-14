/**
 * @typedef CanvasAndContext
 * @property {HTMLCanvasElement} canvas
 * @property {CanvasRenderingContext2D} context
 */

/**
 * @typedef Page
 * @property {CanvasAndContext} activePathsCanvasAndContext
 * @property {CanvasAndContext} predictionPathsCanvasAndContext
 * @property {CanvasAndContext} completedPathsCanvasAndContext
 * @property {{[identifier: number]: Path}} activePaths
 * @property {Path[]} completedPaths
 * @property {string} backgroundColor
 */

/**
 * @typedef Path
 * @property {Point[]} points
 * @property {number} relativeLineWidth - [0, 1]
 * @property {string} color
 * @property {Point} minPoint
 * @property {Point} maxPoint
 */

/**
 * @typedef Point
 * @property {number} relativeX - [0, 1]
 * @property {number} relativeY - [0, 1]
 */

/** @type {Page[]} */
let pages = [];

/**
 * @param {string} canvasQuerySelector
 * @returns {CanvasAndContext}
 */
let createCanvasAndContext = (canvasQuerySelector) => {
    /** @type {HTMLCanvasElement | null} */
    let canvas = document.querySelector(canvasQuerySelector);

    if (canvas == null) {
        throw "canvas == null at createCanvasAndContext";
    }

    /** @type {CanvasRenderingContext2D | null} */
    let context = canvas.getContext("2d");

    if (context == null) {
        throw "context == null at createCanvasAndContext";
    }

    return {
        canvas: canvas,
        context: context
    };
};

/**
 * @param {CanvasAndContext} canvasAndContext
 * @returns {undefined}
 */
let setupCanvasAndContext = (canvasAndContext) => {
    canvasAndContext.canvas.width = Math.round(canvasAndContext.canvas.offsetWidth * window.devicePixelRatio);
    canvasAndContext.canvas.height = Math.round(canvasAndContext.canvas.offsetHeight * window.devicePixelRatio);

    canvasAndContext.context.lineCap = "round";
    canvasAndContext.context.lineJoin = "round";
};

// export page functions

/**
 * @param {number} pageIndex
 * @param {string} backgroundColor
 * @param {string} activePathsCanvasQuerySelector
 * @param {string} predictionPathsCanvasQuerySelector
 * @param {string} completedPathsCanvasQuerySelector
 * @returns {undefined}
 */
export let addPage = (pageIndex, backgroundColor, activePathsCanvasQuerySelector, predictionPathsCanvasQuerySelector, completedPathsCanvasQuerySelector) => {
    let activePathsCanvasAndContext = createCanvasAndContext(activePathsCanvasQuerySelector);
    let predictionPathsCanvasAndContext = createCanvasAndContext(predictionPathsCanvasQuerySelector);
    let completedPathsCanvasAndContext = createCanvasAndContext(completedPathsCanvasQuerySelector);

    setupCanvasAndContext(activePathsCanvasAndContext);
    setupCanvasAndContext(predictionPathsCanvasAndContext);
    setupCanvasAndContext(completedPathsCanvasAndContext);

    pages.splice(pageIndex, 0, {
        activePathsCanvasAndContext: activePathsCanvasAndContext,
        predictionPathsCanvasAndContext: predictionPathsCanvasAndContext,
        completedPathsCanvasAndContext: completedPathsCanvasAndContext,
        activePaths: {},
        completedPaths: [],
        backgroundColor: backgroundColor
    });
};

/**
 * @param {number} pageIndex
 * @returns {CanvasAndContext}
 */
export let getActivePathsCanvasAndContext = (pageIndex) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        throw "page == undefined at getActivePathsCanvasAndContext";
    }

    return page.activePathsCanvasAndContext;
};

/**
 * @param {number} pageIndex
 * @returns {CanvasAndContext}
 */
export let getPredictionPathsCanvasAndContext = (pageIndex) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        throw "page == undefined at getPredictionPathsCanvasAndContext";
    }

    return page.predictionPathsCanvasAndContext;
};

/**
 * @param {number} pageIndex
 * @returns {CanvasAndContext}
 */
export let getCompletedPathsCanvasAndContext = (pageIndex) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        throw "page == undefined at getCompletedPathsCanvasAndContext";
    }

    return page.completedPathsCanvasAndContext;
};

/**
 * @param {number} pageIndex
 * @returns {undefined}
 */
export let resizePageCanvases = (pageIndex) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at resizePage");
        return;
    }

    setupCanvasAndContext(page.activePathsCanvasAndContext);
    setupCanvasAndContext(page.predictionPathsCanvasAndContext);
    setupCanvasAndContext(page.completedPathsCanvasAndContext);
};

/**
 * @param {number} pageIndex
 * @param {string} backgroundColor
 * @returns {undefined}
 */
export let changePageColor = (pageIndex, backgroundColor) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at changePageColor");
        return;
    }

    page.backgroundColor = backgroundColor;
};

/**
 * @param {number} pageIndex
 * @returns {undefined}
 */
export let removePage = (pageIndex) => {
    if (pages[pageIndex] == undefined) {
        console.log("page == undefined at removePage");
        return;
    }
    pages.splice(pageIndex, 1);
};

// export path functions

/**
 * @param {number} pageIndex
 * @param {number} identifier
 * @param {number} relativeLineWidth - [0, 1]
 * @param {string} color
 * @param {number} relativeX - [0, 1]
 * @param {number} relativeY - [0, 1]
 * @returns {undefined}
 */
export let addActivePath = (pageIndex, identifier, relativeLineWidth, color, relativeX, relativeY) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at addActivePath");
        return;
    }

    page.activePaths[identifier] = {
        points: [{
            relativeX: relativeX,
            relativeY: relativeY
        }],
        relativeLineWidth: relativeLineWidth,
        color: color,
        minPoint: {
            relativeX: relativeX - relativeLineWidth / 2,
            relativeY: relativeY - relativeLineWidth / 2
        },
        maxPoint: {
            relativeX: relativeX + relativeLineWidth / 2,
            relativeY: relativeY + relativeLineWidth / 2
        }
    };
};

/**
 * @param {number} pageIndex
 * @param {number} identifier
 * @param {number} relativeX - [0, 1]
 * @param {number} relativeY - [0, 1]
 * @returns {undefined}
 */
export let addPointToActivePath = (pageIndex, identifier, relativeX, relativeY) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at addPointToActivePath");
        return;
    }

    /** @type {Path | undefined} */
    let activePath = page.activePaths[identifier];

    if (activePath == undefined) {
        console.log("activePath == undefined at addPointToActivePath");
        return;
    }

    let lastPoint = activePath.points[activePath.points.length - 1];

    if (lastPoint == undefined) {
        console.log("lastPoint == undefined at addPointToActivePath");
        return;
    }

    if (lastPoint.relativeX == relativeX && lastPoint.relativeY == relativeY) {
        return;
    }

    activePath.points.push({
        relativeX: relativeX,
        relativeY: relativeY
    });

    /** @type {number} */
    let minRelativeX = relativeX - activePath.relativeLineWidth / 2;
    /** @type {number} */
    let minRelativeY = relativeY - activePath.relativeLineWidth / 2;
    /** @type {number} */
    let maxRelativeX = relativeX + activePath.relativeLineWidth / 2;
    /** @type {number} */
    let maxRelativeY = relativeY + activePath.relativeLineWidth / 2;

    if (activePath.minPoint.relativeX > minRelativeX) {
        activePath.minPoint.relativeX = minRelativeX;
    } else if (activePath.maxPoint.relativeX < maxRelativeX) {
        activePath.maxPoint.relativeX = maxRelativeX;
    }

    if (activePath.minPoint.relativeY > minRelativeY) {
        activePath.minPoint.relativeY = minRelativeY;
    } else if (activePath.maxPoint.relativeY < maxRelativeY) {
        activePath.maxPoint.relativeY = maxRelativeY;
    }
};

/**
 * @param {number} pageIndex
 * @param {number} identifier
 * @param {number} relativeX - [0, 1]
 * @param {number} relativeY - [0, 1]
 * @returns {undefined}
 */
export let addPointToActiveStraightPath = (pageIndex, identifier, relativeX, relativeY) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at addPointToActivePath");
        return;
    }

    /** @type {Path | undefined} */
    let activePath = page.activePaths[identifier];

    if (activePath == undefined) {
        console.log("activePath == undefined at addPointToActivePath");
        return;
    }

    let lastPoint = activePath.points[activePath.points.length - 1];

    if (lastPoint == undefined) {
        console.log("lastPoint == undefined at addPointToActivePath");
        return;
    }

    if (lastPoint.relativeX == relativeX && lastPoint.relativeY == relativeY && activePath.points.length == 2) {
        return;
    }

    activePath.points.splice(1, activePath.points.length - 1, {
        relativeX: relativeX,
        relativeY: relativeY
    });

    let minRelativeX = (() => {
        if (lastPoint.relativeX < relativeX) {
            return lastPoint.relativeX - activePath.relativeLineWidth / 2;
        } else {
            return relativeX - activePath.relativeLineWidth / 2;
        }
    })();

    let minRelativeY = (() => {
        if (lastPoint.relativeY < relativeY) {
            return lastPoint.relativeY - activePath.relativeLineWidth / 2;
        } else {
            return relativeY - activePath.relativeLineWidth / 2;
        }
    })();

    let maxRelativeX = (() => {
        if (lastPoint.relativeX > relativeX) {
            return lastPoint.relativeX + activePath.relativeLineWidth / 2;
        } else {
            return relativeX + activePath.relativeLineWidth / 2;
        }
    })();

    let maxRelativeY = (() => {
        if (lastPoint.relativeY > relativeY) {
            return lastPoint.relativeY + activePath.relativeLineWidth / 2;
        } else {
            return relativeY + activePath.relativeLineWidth / 2;
        }
    })();

    if (activePath.minPoint.relativeX > minRelativeX) {
        activePath.minPoint.relativeX = minRelativeX;
    } else if (activePath.maxPoint.relativeX < maxRelativeX) {
        activePath.maxPoint.relativeX = maxRelativeX;
    }

    if (activePath.minPoint.relativeY > minRelativeY) {
        activePath.minPoint.relativeY = minRelativeY;
    } else if (activePath.maxPoint.relativeY < maxRelativeY) {
        activePath.maxPoint.relativeY = maxRelativeY;
    }
};

/**
 * @param {number} pageIndex
 * @param {number} identifier
 * @returns {undefined}
 */
export let moveActivePathToCompletedPaths = (pageIndex, identifier) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at moveActivePathToCompletedPaths");
        return;
    }

    /** @type {Path | undefined} */
    let activePath = page.activePaths[identifier];

    if (activePath == undefined) {
        console.log("activePath == undefined at moveActivePathToCompletedPaths");
        return;
    }

    page.completedPaths.push(activePath);

    delete page.activePaths[identifier];
};

/**
 * @param {number} pageIndex
 * @returns {Path[]}
 */
export let getActivePaths = (pageIndex) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at getActivePaths");
        return [];
    }

    return Object.values(page.activePaths);
};

/**
 * @param {number} pageIndex
 * @returns {Path[]}
 */
export let getCompletedPaths = (pageIndex) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at getCompletedPaths");
        return [];
    }

    return page.completedPaths;
};

/**
 * @param {number} pageIndex
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @param {number} relativeX - [0, 1]
 * @param {number} relativeY - [0, 1]
 * @returns {undefined}
 */
export let removeCompletedPathsAtPoint = (pageIndex, canvas, context, relativeX, relativeY) => {
    /** @type {Page | undefined} */
    let page = pages[pageIndex];

    if (page == undefined) {
        console.log("page == undefined at removeCompletedPathsAtPoint");
        return;
    }

    for (let index = 0; index < page.completedPaths.length; index += 1) {
        /** @type {Path | undefined} */
        let completedPath = page.completedPaths[index];

        if (completedPath == undefined) {
            console.log("completedPath == undefined at removeCompletedPathsAtPoint");
            continue;
        }

        if (completedPath.minPoint.relativeX < relativeX && completedPath.maxPoint.relativeX > relativeX && completedPath.minPoint.relativeY < relativeY && completedPath.maxPoint.relativeY > relativeY) {
            context.beginPath();

            context.lineWidth = Math.round(completedPath.relativeLineWidth * canvas.width);

            /** @type {Point | undefined} */
            let point0 = completedPath.points[0];

            if (point0 == undefined) {
                console.log("point0 == undefined at removeCompletedPathsAtPoint");
                continue;
            }

            context.moveTo(Math.round(point0.relativeX * canvas.width), Math.round(point0.relativeY * canvas.width));

            for (let index = 1; index < completedPath.points.length; index += 1) {
                /** @type {Point | undefined} */
                let pointIndex = completedPath.points[index];

                if (pointIndex == undefined) {
                    console.log(`point${index.toString()} == undefined at removeCompletedPathsAtPoint`);
                    continue;
                }

                context.lineTo(Math.round(pointIndex.relativeX * canvas.width), Math.round(pointIndex.relativeY * canvas.width));
            }

            if (context.isPointInStroke(Math.round(relativeX * canvas.width), Math.round(relativeY * canvas.width))) {
                page.completedPaths.splice(index, 1);
                index -= 1;
            }
        }
    }
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} relativeX0
 * @param {number} relativeY0
 * @param {number} relativeX1
 * @param {number} relativeY1
 * @returns {Point[]} - including relativeX1, relativeY1
 */
export let bresenhamLineAlgorithm = (canvas, relativeX0, relativeY0, relativeX1, relativeY1) => {
    let x0 = Math.round(relativeX0 * canvas.width);
    let y0 = Math.round(relativeY0 * canvas.width);
    let x1 = Math.round(relativeX1 * canvas.width);
    let y1 = Math.round(relativeY1 * canvas.width);

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);

    let px = x0;
    let py = y0;

    /** @type {number} */
    let sx;
    /** @type {number} */
    let sy;

    if (x0 < x1) {
        sx = 1;
    } else {
        sx = -1;
    }

    if (y0 < y1) {
        sy = 1;
    } else {
        sy = -1;
    }

    /** @type {Point[]} */
    let points = [];

    /** @type {number} */
    let d = dx - dy;

    /** @type {boolean} */
    let condition = true;

    while (condition) {
        /** @type {number} */
        let doubleD = 2 * d;

        if (doubleD > -dy) {
            d -= dy;
            px += sx;
        }

        if (doubleD < dx) {
            d += dx;
            py += sy;
        }

        if ((px == x1) && (py == y1)) {
            condition = false;
        }

        points.push({
            relativeX: px / canvas.width,
            relativeY: py / canvas.width
        });
    }

    return points;
};

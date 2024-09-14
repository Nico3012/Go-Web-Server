let getAngleBetweenKoordinatensysteme = (x1, y1, x2, y2) => {
    let dx = x2 - x1;
    let dy = y2 - y1;

    let a = Math.atan(dy / dx);

    if (dx < 0) a += Math.PI;

    return -a;
};

let getAngleBetweenPointAndXAxis = (x, y) => {
    let a = Math.atan(y / x);

    if (x < 0) a += Math.PI;

    return a;
};

let getDistFromPointTo0 = (x, y) => {
    return Math.sqrt(x * x + y * y);
};

let getPointInAlphaRotatedKoordinatensystem = (x, y, a) => {
    let aPoint = getAngleBetweenPointAndXAxis(x, y) + a;
    let dist = getDistFromPointTo0(x, y);
    return {
        x: dist * Math.cos(aPoint),
        y: dist * Math.sin(aPoint)
    };
};

let getM2n = (x0, y0, x1, y1, alphaBetweenKoordinatensystems) => {
    let { x: x0n, y: y0n } = getPointInAlphaRotatedKoordinatensystem(x0, y0, alphaBetweenKoordinatensystems);
    let { x: x1n, y: y1n } = getPointInAlphaRotatedKoordinatensystem(x1, y1, alphaBetweenKoordinatensystems);

    //console.log("here", y1n - y0n, "/", x1n - x0n);

    let dxn = x1n - x0n;
    let dyn = y1n - y0n;

    let mn = dyn / dxn;

    return {
        m2n: -mn,
        invert: dxn < 0 && dyn < 0
    };
};

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export let getDist = (x1, y1, x2, y2) => {
    return Math.sqrt(
        (x2 - x1) ** 2 + (y2 - y1) ** 2
    );
};

let getPoint3 = (x2, y2, m2, invert, dist) => {
    let a = Math.atan(m2);

    let x3;
    let y3;

    if (invert) {
        x3 = x2 - Math.cos(a) * dist;
        y3 = y2 - Math.sin(a) * dist;
    } else {
        x3 = x2 + Math.cos(a) * dist;
        y3 = y2 + Math.sin(a) * dist;
    }


    return {
        x: x3,
        y: y3
    };
};

/**
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} predictionFactor
 * @param {number} maxDist
 * @returns {import("../ram/ram.1.2.0.js").Point}
 */
export let calcPointFrom3 = (x0, y0, x1, y1, x2, y2, predictionFactor, maxDist) => {
    // let m2 = getExperimentalM2(x0, y0, x1, y1, x2, y2);

    let alphaBetweenKoordinatensystems = getAngleBetweenKoordinatensysteme(x1, y1, x2, y2);
    //console.log(alphaBetweenKoordinatensystems);
    let { m2n, invert } = getM2n(x0, y0, x1, y1, alphaBetweenKoordinatensystems);
    //console.log(m2n, invert);
    let { x: x2n, y: y2n } = getPointInAlphaRotatedKoordinatensystem(x2, y2, alphaBetweenKoordinatensystems);

    let dist = predictionFactor * (getDist(x1, y1, x2, y2) + getDist(x0, y0, x1, y1)) / 2;

    if (dist > maxDist) {
        dist = maxDist;
    }

    let { x: x3n, y: y3n } = getPoint3(x2n, y2n, m2n, invert, dist);

    let p3 = getPointInAlphaRotatedKoordinatensystem(x3n, y3n, -alphaBetweenKoordinatensystems);

    return {
        relativeX: p3.x,
        relativeY: p3.y
    };
};

/**
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} predictionFactor
 * @param {number} maxDist
 * @returns {import("../ram/ram.1.2.0.js").Point}
 */
export let calcPointFrom2 = (x0, y0, x1, y1, predictionFactor, maxDist) => {
    let dist = predictionFactor * getDist(x0, y0, x1, y1);

    if (dist > maxDist) {
        return {
            relativeX: x1 + predictionFactor * (x1 - x0) * (maxDist / dist),
            relativeY: y1 + predictionFactor * (y1 - y0) * (maxDist / dist)
        };
    }

    return {
        relativeX: x1 + predictionFactor * (x1 - x0),
        relativeY: y1 + predictionFactor * (y1 - y0)
    };
};

const canvas = document.querySelector("canvas");

if (canvas === null) {
    throw new Error("canvas not found.");
}

const context = canvas.getContext("2d");

if (context === null) {
    throw new Error("context 2d is not available.");
}

console.log(context);

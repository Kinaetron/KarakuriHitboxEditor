// get references to the canvas and context
var canvas = document.getElementById("canvas");
var overlay = document.getElementById("overlay");
var ctx = canvas.getContext("2d");
var ctxo = overlay.getContext("2d");

// style the context
ctx.strokeStyle = "blue";
ctx.lineWidth = 3;
ctxo.strokeStyle = "blue";
ctxo.lineWidth = 3;

// calculate where the canvas is on the window
function calculateCanvasOffset() {
    var canvasOffset = canvas.getBoundingClientRect();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
}

// initial calculation
calculateCanvasOffset();

let isDrawing = false;
let isSelecting = true;

// this flag is true when the user is dragging the mouse
let isDown = false;

// these vars will hold the starting mouse position
let startX;
let startY;

let prevStartX = 0;
let prevStartY = 0;

let prevWidth = 0;
let prevHeight = 0;

function handleMouseDown(e) {

    if(!isDrawing) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    // save the starting x/y of the rectangle
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    // set a flag indicating the drag has begun
    isDown = true;
}

function handleMouseUp(e) {

    if(!isDrawing) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the dragging flag
    isDown = false;
    ctxo.strokeRect(prevStartX, prevStartY, prevWidth, prevHeight);
}

function handleMouseOut(e) {

    if(!isDrawing) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    // the drag is over, clear the dragging flag
    isDown = false;
}

function handleMouseMove(e) {

    if(!isDrawing) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    // if we're not dragging, just return
    if (!isDown) {
        return;
    }

    // get the current mouse position
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // calculate the rectangle width/height based
    // on starting vs current mouse position
    var width = mouseX - startX;
    var height = mouseY - startY;

    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw a new rect from the start position 
    // to the current mouse position
    ctx.strokeRect(startX, startY, width, height);

    prevStartX = startX;
    prevStartY = startY;

    prevWidth = width;
    prevHeight = height;
}

function IsDrawing() {
    isDrawing = true;
    isSelecting = false;
}

function IsSelecting() {
    isSelecting = true;
    isDrawing = false;
}

// listen for mouse events
canvas.addEventListener("mousedown", function (e) {
    handleMouseDown(e);
});

canvas.addEventListener("mousemove", function (e) {
    handleMouseMove(e);
});

canvas.addEventListener("mouseup", function (e) {
    handleMouseUp(e);
});

canvas.addEventListener("mouseout", function (e) {
    handleMouseOut(e);
});

// listen for window resize events
window.addEventListener("resize", function () {
    // recalculate the canvas offset when the window is resized
    calculateCanvasOffset();
});
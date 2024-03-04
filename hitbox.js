// get references to the canvas and context
var canvas = document.getElementById("canvas");
var overlay = document.getElementById("overlay");
var ctx = canvas.getContext("2d");
var ctxo = overlay.getContext("2d");

var xTextBox = document.getElementById("x");
var yTextBox = document.getElementById("y");
var widthTextBox = document.getElementById("width");
var heightTextBox = document.getElementById("height");

ctx.lineWidth = 2;
ctxo.lineWidth = 2;
// style the context
ctx.strokeStyle = "blue";
ctxo.strokeStyle = "blue";

function pointRectangleCollide(x, y, rectangle) {
    const left = rectangle.x * currentZoom + xPositionImage;
    const right = (left + (rectangle.width * currentZoom));
    const top = rectangle.y * currentZoom + yPositionImage;
    const bottom = (top + (rectangle.height * currentZoom));

    return x >= left &&
           x <= right &&
           y >= top &&
           y <= bottom;
}

function rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

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

let selectedRectangleIndex = -1;

function resizeRectangles() {
    reDrawBoxes();
    reDrawSelectedBox();
}

function handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    // save the starting x/y of the rectangle
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    // set a flag indicating the drag has begun
    isDown = true;
}

function handleMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();

    isDown = false;

    if(isDrawing) {
        frameRectangles[frameIndex].push(
            new rectangle(
                Math.round((prevStartX - xPositionImage) / currentZoom), 
                Math.round((prevStartY - yPositionImage) / currentZoom),
                Math.round(prevWidth / currentZoom),
                Math.round(prevHeight / currentZoom)));

        ctxo.strokeRect(prevStartX, prevStartY, prevWidth, prevHeight);
    }
    else if(isSelecting) {
        if(!frameRectangles) {
            return;
        }

        for(var i = 0; i < frameRectangles[frameIndex].length; i++) 
        {
            if(pointRectangleCollide(
                startX, 
                startY, 
                frameRectangles[frameIndex][i])) {

                selectedRectangleIndex = i;
                ctx.clearRect(0, 0, overlay.width, overlay.height);

                for(var j = 0; j < frameRectangles[frameIndex].length; j++) {

                    if(selectedRectangleIndex == j){
                        continue;
                    }

                    ctxo.strokeRect(
                        frameRectangles[frameIndex][j].x * currentZoom + xPositionImage, 
                        frameRectangles[frameIndex][j].y * currentZoom + yPositionImage, 
                        frameRectangles[frameIndex][j].width * currentZoom, 
                        frameRectangles[frameIndex][j].height * currentZoom);
                }

                reDrawSelectedBox();
                                
                xTextBox.value = Math.round(frameRectangles[frameIndex][selectedRectangleIndex].x * currentZoom + xPositionImage);
                yTextBox.value = Math.round(frameRectangles[frameIndex][selectedRectangleIndex].y * currentZoom + yPositionImage);
                widthTextBox.value = Math.round(frameRectangles[frameIndex][selectedRectangleIndex].width * currentZoom);
                heightTextBox.value = Math.round(frameRectangles[frameIndex][selectedRectangleIndex].height * currentZoom);
            }
        }
    }
}

function handleMouseOut(e) {

    if(isDrawing) {
        e.preventDefault();
        e.stopPropagation();

        // the drag is over, clear the dragging flag
        isDown = false;
    }
}

function handleMouseMove(e) {
    if(isDrawing) {
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
}

function IsDrawing() 
{
    isDrawing = true;
    isSelecting = false;

    selectedRectangleIndex = - 1;

    reDrawBoxes();

    xTextBox.value = "";
    yTextBox.value = "";
    widthTextBox.value = "";
    heightTextBox.value = "";
}

function IsSelecting() {
    isSelecting = true;
    isDrawing = false;
}

function Delete() {
    if (isSelecting) 
    {
        frameRectangles[frameIndex].splice(selectedRectangleIndex, 1);
        selectedRectangleIndex = - 1;

        reDrawBoxes();

        xTextBox.value = "";
        yTextBox.value = "";
        widthTextBox.value = "";
        heightTextBox.value = "";
    }
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

xTextBox.addEventListener("input", function() {
    frameRectangles[frameIndex][selectedRectangleIndex].x = Math.round((xTextBox.value - xPositionImage) / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});

yTextBox.addEventListener("input", function() {
    frameRectangles[frameIndex][selectedRectangleIndex].y = Math.round((yTextBox.value - yPositionImage) / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});

widthTextBox.addEventListener("input", function() {
    frameRectangles[frameIndex][selectedRectangleIndex].width = Math.round(widthTextBox.value / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});

heightTextBox.addEventListener("input", function() {
    frameRectangles[frameIndex][selectedRectangleIndex].height = Math.round(heightTextBox.value / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});


function reDrawBoxes() {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctxo.clearRect(0, 0, overlay.width, overlay.height);

    for(var i = 0; i < frameRectangles[frameIndex].length; i++) {
        if(selectedRectangleIndex == i){
            continue;
        }
        
        ctxo.strokeRect(
            frameRectangles[frameIndex][i].x * currentZoom + xPositionImage, 
            frameRectangles[frameIndex][i].y * currentZoom + yPositionImage, 
            frameRectangles[frameIndex][i].width * currentZoom, 
            frameRectangles[frameIndex][i].height * currentZoom);
    }
}

function reDrawSelectedBox() {
    if(selectedRectangleIndex == -1) {
        return;
    }

    ctxo.strokeStyle = "red";

    ctxo.strokeRect(
        frameRectangles[frameIndex][selectedRectangleIndex].x * currentZoom + xPositionImage, 
        frameRectangles[frameIndex][selectedRectangleIndex].y * currentZoom + yPositionImage, 
        frameRectangles[frameIndex][selectedRectangleIndex].width * currentZoom, 
        frameRectangles[frameIndex][selectedRectangleIndex].height * currentZoom);
    
    ctxo.strokeStyle = "blue";
}
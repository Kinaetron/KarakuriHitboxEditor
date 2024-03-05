
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

const hitboxType = "hitbox";
const hurtboxType = "hurtbox";
const colliderType = "colliderbox";

const hitboxColour = "blue";
const hurtboxColour = "red";
const colliderboxColour  = "green";
const selectedboxColour = "yellow";

// style the context
ctx.strokeStyle = hitboxColour;
ctxo.strokeStyle = hitboxColour;

let currentType = hitboxType;
let currentColour = hitboxColour;

function pointBoxCollide(x, y, box) {
    const left = box.x * currentZoom + xPositionImage;
    const right = (left + (box.width * currentZoom));
    const top = box.y * currentZoom + yPositionImage;
    const bottom = (top + (box.height * currentZoom));

    return x >= left &&
           x <= right &&
           y >= top &&
           y <= bottom;
}

function box(x, y, width, height, boxType) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.boxType = boxType;
}

// calculate where the canvas is on the window
function calculateCanvasOffset() {
    var canvasOffset = canvas.getBoundingClientRect();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
}

// initial calculation
calculateCanvasOffset();

let isDrawing = true;
let isSelecting = false;

// this flag is true when the user is dragging the mouse
let isDown = false;

// these vars will hold the starting mouse position
let startX;
let startY;

let prevStartX = 0;
let prevStartY = 0;

let prevWidth = 0;
let prevHeight = 0;

let selectedBoxIndex = -1;

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
        frameBoxes[frameIndex].push(
            new box(
                Math.round((prevStartX - xPositionImage) / currentZoom), 
                Math.round((prevStartY - yPositionImage) / currentZoom),
                Math.round(prevWidth / currentZoom),
                Math.round(prevHeight / currentZoom),
                currentType));

        ctxo.strokeRect(prevStartX, prevStartY, prevWidth, prevHeight);
    }
    else if(isSelecting) {
        if(!frameBoxes) {
            return;
        }

        for(var i = 0; i < frameBoxes[frameIndex].length; i++) 
        {
            if(pointBoxCollide(
                startX, 
                startY, 
                frameBoxes[frameIndex][i])) {

                selectedBoxIndex = i;
                ctx.clearRect(0, 0, overlay.width, overlay.height);

                for(var j = 0; j < frameBoxes[frameIndex].length; j++) {

                    if(selectedBoxIndex == j){
                        continue;
                    }

                    ctxo.strokeRect(
                        frameBoxes[frameIndex][j].x * currentZoom + xPositionImage, 
                        frameBoxes[frameIndex][j].y * currentZoom + yPositionImage, 
                        frameBoxes[frameIndex][j].width * currentZoom, 
                        frameBoxes[frameIndex][j].height * currentZoom);
                }
                
                reDrawSelectedBox();

                xTextBox.value = Math.round(frameBoxes[frameIndex][selectedBoxIndex].x * currentZoom + xPositionImage);
                yTextBox.value = Math.round(frameBoxes[frameIndex][selectedBoxIndex].y * currentZoom + yPositionImage);
                widthTextBox.value = Math.round(frameBoxes[frameIndex][selectedBoxIndex].width * currentZoom);
                heightTextBox.value = Math.round(frameBoxes[frameIndex][selectedBoxIndex].height * currentZoom);
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

function boxModeSelection() {
    var selectedValue = document.getElementById("boxMode").value;

    if (selectedValue === "drawingMode") {
        isDrawing = true;
        isSelecting = false;
    
        selectedRectangleIndex = - 1;
    
        reDrawBoxes();
    
        xTextBox.value = "";
        yTextBox.value = "";
        widthTextBox.value = "";
        heightTextBox.value = "";
    }
    else if (selectedValue == "selectMode") {
        isSelecting = true;
        isDrawing = false;
    }
}

function boxTypeSelection() {
    var selectedValue = document.getElementById("boxType").value;

    if(selectedValue === "hitbox") {
        currentType = hitboxType;
        ctx.strokeStyle = hitboxColour;
        ctxo.strokeStyle = hitboxColour;
    }
    else if (selectedValue === "hurtbox") {
        currentType = hurtboxType;
        ctx.strokeStyle = hurtboxColour;
        ctxo.strokeStyle = hurtboxColour;
    }
    else if (selectedValue === "colliderbox") {
        currentType = colliderType;
        ctx.strokeStyle = colliderboxColour;
        ctxo.strokeStyle = colliderboxColour;
    }

}

function Delete() {
    if (isSelecting) 
    {
        frameBoxes[frameIndex].splice(selectedBoxIndex, 1);
        selectedBoxIndex = - 1;

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
    frameBoxes[frameIndex][selectedBoxIndex].x = Math.round((xTextBox.value - xPositionImage) / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});

yTextBox.addEventListener("input", function() {
    frameBoxes[frameIndex][selectedBoxIndex].y = Math.round((yTextBox.value - yPositionImage) / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});

widthTextBox.addEventListener("input", function() {
    frameBoxes[frameIndex][selectedBoxIndex].width = Math.round(widthTextBox.value / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});

heightTextBox.addEventListener("input", function() {
    frameBoxes[frameIndex][selectedBoxIndex].height = Math.round(heightTextBox.value / currentZoom);

    reDrawBoxes();
    reDrawSelectedBox();
});


function reDrawBoxes() {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctxo.clearRect(0, 0, overlay.width, overlay.height);

    for(var i = 0; i < frameBoxes[frameIndex].length; i++) {
        if(selectedBoxIndex == i){
            continue;
        }

        if(frameBoxes[frameIndex][i].boxType === hitboxType) {
            ctx.strokeStyle  = hitboxColour;
            ctxo.strokeStyle = hitboxColour;
        }
        else if(frameBoxes[frameIndex][i].boxType === hurtboxType) {
            ctx.strokeStyle  = hurtboxColour;
            ctxo.strokeStyle = hurtboxColour;
        }
        else if(frameBoxes[frameIndex][i].boxType === colliderType) {
            ctx.strokeStyle  = colliderboxColour;
            ctxo.strokeStyle = colliderboxColour;
        }
        
        ctxo.strokeRect(
            frameBoxes[frameIndex][i].x * currentZoom + xPositionImage, 
            frameBoxes[frameIndex][i].y * currentZoom + yPositionImage, 
            frameBoxes[frameIndex][i].width * currentZoom, 
            frameBoxes[frameIndex][i].height * currentZoom);
    }

    ctx.strokeStyle  = currentColour;
    ctxo.strokeStyle = currentColour;

}

function reDrawSelectedBox() {
    if(selectedBoxIndex == -1) {
        return;
    }

    currentColour = ctxo.strokeStyle;
    ctxo.strokeStyle = selectedboxColour;

    ctxo.strokeRect(
        frameBoxes[frameIndex][selectedBoxIndex].x * currentZoom + xPositionImage, 
        frameBoxes[frameIndex][selectedBoxIndex].y * currentZoom + yPositionImage, 
        frameBoxes[frameIndex][selectedBoxIndex].width * currentZoom, 
        frameBoxes[frameIndex][selectedBoxIndex].height * currentZoom);
    
    ctxo.strokeStyle = currentColour;
}
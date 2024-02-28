const containerDiv = document.getElementById('middle');
const frameCanvas = document.getElementById('frameImage');
const frameContext = frameCanvas.getContext('2d');
const decrementButton = document.getElementById('decrement-btn');
const incrementButton = document.getElementById('increment-btn');

let width = 0;
let height = 0;
let sourceImage;

const maxZoom = 10;
const minZoom = 0.50;
let currentZoom = 1;

let xPositionImage = 0;
let yPositionImage = 0;

window.karakuriAPI.onUpdateFrame((value) => 
{
    width = value.width;
    height = value.height;
    sourceImage = value.source;

    xPositionImage = (frameCanvas.width / 2) - (width / 2);
    yPositionImage = (frameCanvas.height / 2) - (height / 2);

    const image = new Image();

    image.onload = () => 
    {
        frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
        
        const x = (frameCanvas.width - width * currentZoom) / 2;
        const y = (frameCanvas.height - height * currentZoom) / 2;
        frameContext.drawImage(image, x, y, width * currentZoom, height * currentZoom);
    };
    image.src = sourceImage;
});

decrementButton.addEventListener('click', () => {
    window.karakuriAPI.decrementFrame();
});

incrementButton.addEventListener('click', () => {
    window.karakuriAPI.incrementFrame();
});
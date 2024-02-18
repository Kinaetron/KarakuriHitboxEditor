const containerDiv = document.getElementById('middle');
const frameCanvas = document.getElementById('frameImage');
const frameContext = frameCanvas.getContext('2d');
const decrementButton = document.getElementById('decrement-btn');
const incrementButton = document.getElementById('increment-btn');

let width = 0;
let height = 0;
let sourceImage;

window.karakuriAPI.onUpdateFrame((value) => 
{
    width = value.width;
    height = value.height;
    sourceImage = value.source;

    console.log(containerDiv.width);
    console.log(containerDiv.height);

    const image = new Image();

    image.onload = () => 
    {
        frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);

        const x = (frameCanvas.width - width) / 2;
        const y = (frameCanvas.height - height) / 2;
        frameContext.drawImage(image, x, y, width, height);
    };
    image.src = sourceImage;
});

decrementButton.addEventListener('click', () => {
    window.karakuriAPI.decrementFrame();
});

incrementButton.addEventListener('click', () => {
    window.karakuriAPI.incrementFrame();
});
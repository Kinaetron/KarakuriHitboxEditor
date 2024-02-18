const frameCanvas = document.getElementById('frameImage');
const frameContext = frameCanvas.getContext('2d');
const decrementButton = document.getElementById('decrement-btn');
const incrementButton = document.getElementById('increment-btn');

window.karakuriAPI.onUpdateFrame((value) => 
{
    frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
    const image = new Image();

    image.onload = () => {
        frameContext.drawImage(image, value.width, value.height);
    };
    
    image.src = value.source;
});

decrementButton.addEventListener('click', () => {
    window.karakuriAPI.decrementFrame();
});

incrementButton.addEventListener('click', () => {
    window.karakuriAPI.incrementFrame();
});
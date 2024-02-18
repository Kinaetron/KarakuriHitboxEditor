function ZoomIn() 
{
    const img = new Image();
    img.src = sourceImage;

    frameContext.imageSmoothingEnabled = false;

    frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);

    const x = (frameCanvas.width - width * 5) / 2;
    const y = (frameCanvas.height - height * 5) / 2;
    frameContext.drawImage(img, x, y, width * 5, height * 5);
}
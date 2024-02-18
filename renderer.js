const frameContainer = document.getElementById('frameContainer');
const decrementButton = document.getElementById('decrement-btn');
const incrementButton = document.getElementById('increment-btn');

window.karakuriAPI.onUpdateFrame((value) => {
    frameContainer.src = value
    window.karakuriAPI.frameValue(value)
});

decrementButton.addEventListener('click', () => {
    window.karakuriAPI.decrementFrame();
});

incrementButton.addEventListener('click', () => {
    window.karakuriAPI.incrementFrame();
});
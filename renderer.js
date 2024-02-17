const frameContainer = document.getElementById('frameContainer');

window.karakuriAPI.onUpdateFrame((value) => {
    frameContainer.src = value
    window.karakuriAPI.frameValue(value)
})
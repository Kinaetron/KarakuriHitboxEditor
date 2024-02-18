var currentZoom = 1.0; // Initial zoom level
var maximumZoom = 2.0; // Maximum zoom level
var minimumZoom = 0.5; // Minimum zoom level

function zoomIn() {
    console.log("zooming in");
    if (currentZoom < maximumZoom) {
      currentZoom += 0.1;
      updateZoom();
    }
  }

  function zoomOut() {
    console.log("zooming out");
    if (currentZoom > minimumZoom) {
      currentZoom -= 0.1;
      updateZoom();
    }
  }

function updateZoom()
{
    var image = document.getElementById('frameImage');
    image.style.width = (currentZoom * 100) + '%';
}
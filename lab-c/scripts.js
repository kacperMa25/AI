const saveButton = document.getElementById("saveButton");
const getLocation = document.getElementById("getLocation");

const dropBox = document.getElementById("dropCanvas")
const puzzleBox = document.getElementById("puzzleBox")

let map = L.map('map').setView([53.430127, 14.564802], 18);
// L.tileLayer.provider('OpenStreetMap.DE').addTo(map);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);
let marker = L.marker([53.430127, 14.564802]).addTo(map);
marker.bindPopup("<strong>Hello!</strong><br>This is a popup.");

let howManyPuzzlesInRow = 4;
let howManyPuzzlesInCol = 4;
let totalPuzzles = howManyPuzzlesInCol * howManyPuzzlesInRow;

function checkIfCorrect() {
  let isCorrect = true;
  for (let i = 0; i < dropBox.children.length; i++) {
    let dropZone = dropBox.children[i];
    let puzzle = dropZone.firstElementChild;
    if (puzzle == null || Number(puzzle.id.split('-')[1]) !== i) {
      isCorrect = false;
      break;
    }
  }
  return isCorrect
}

function createDropZone(width, height, id) {
  let dropZone = document.createElement('div');
  dropZone.id = id;
  dropZone.style.width = width + "px";
  dropZone.style.height = height + "px";
  dropZone.addEventListener('dragover', (e) =>
    e.preventDefault()
  )
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();

    const id = e.dataTransfer.getData('text/plain');
    let draggedElement = document.getElementById(id);

    let dropZonePuzzle = dropZone.firstElementChild;
    if (dropZonePuzzle != null) {
      let previousParent = draggedElement.parentElement;
      previousParent.appendChild(dropZonePuzzle)
    }

    dropZone.appendChild(draggedElement);

    if (checkIfCorrect()) alert("You win!");
  })
  return dropZone;
}

function createPuzzle(width, height, id) {
  let puzzle = document.createElement('canvas');
  puzzle.draggable = true;
  puzzle.width = width;
  puzzle.height = height;
  puzzle.id = id;

  puzzle.addEventListener('dragstart', (e) =>
    e.dataTransfer.setData('text/plain', e.target.id)
  )
  return puzzle;
}

saveButton.addEventListener("click", function () {
  puzzleBox.replaceChildren();
  dropBox.replaceChildren();

  leafletImage(map, function (err, mapCanvas) {
    let ctx = mapCanvas.getContext("2d");
    ctx.drawImage(mapCanvas, 0, 0);


    let puzzleWidth = mapCanvas.width / howManyPuzzlesInRow;
    let puzzleHeight = mapCanvas.height / howManyPuzzlesInCol;

    let puzzleArray = [];
    for (let row = 0; row < howManyPuzzlesInCol; row++) {
      for (let col = 0; col < howManyPuzzlesInRow; col++) {
        let currentIterationString = (row * howManyPuzzlesInCol + col).toString();

        // DropZoneIn
        let dropZoneId = "dropZoneIn-" + currentIterationString;
        let dropZone = createDropZone(puzzleWidth, puzzleHeight, dropZoneId);
        puzzleBox.appendChild(dropZone);

        // DropZoneOut
        dropZoneId = "dropZoneOut-" + currentIterationString;
        dropZone = createDropZone(puzzleWidth, puzzleHeight, dropZoneId);
        dropBox.appendChild(dropZone)

        // Configuring puzzle element
        let puzzleId = "puzzle-" + currentIterationString;
        let puzzle = createPuzzle(puzzleWidth, puzzleHeight, puzzleId);
        puzzleArray.push(puzzle);

        // Drawing each puzzle
        let ctx = puzzle.getContext('2d');
        ctx.drawImage(mapCanvas, col * puzzleWidth, row * puzzleHeight, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);

      }
    }

    for (let i = 0; i < totalPuzzles; i++) {
      const randomIdx = Math.floor(Math.random() * puzzleArray.length);
      let randomPuzzle = puzzleArray.splice(randomIdx, 1)[0];

      let dropZone = puzzleBox.children.item(i);
      dropZone.appendChild(randomPuzzle);
    }
  });
});

getLocation.addEventListener("click", function (event) {
  if (!navigator.geolocation) {
    console.log("No geolocation.");
  }

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    map.setView([lat, lon]);
  }, positionError => {
    console.error(positionError);
  });
});


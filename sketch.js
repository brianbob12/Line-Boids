const sizeX = 800
const sizeY = 800

var myBoids = []

var myGrid = null


var frameNum = 0;

let encoder
const frate = 30
const numFrames = 5000
let recording = false
let recordedFrames = 0
var paused = false
var hideBoids = false

var n = 300

let pauseButton, recordButton, resetButton
let drawConnectionsCheckbox, debugCheckbox, hideBoidsCheckbox
let numBoidsInput

function preload() {
  HME.createH264MP4Encoder().then(enc => {
    encoder = enc
    encoder.outputFilename = 'test'
    encoder.width = sizeX * 2
    encoder.height = sizeY * 2
    encoder.frameRate = frate
    encoder.kbps = 50000 // video quality
    encoder.groupOfPictures = 10 // lower if you have fast actions.
    encoder.initialize()
  })
}

function setup() {
  createCanvas(sizeX, sizeY);

  //buttons
  pauseButton = createButton("PAUSE")
  pauseButton.position(sizeX, 0)
  pauseButton.mousePressed(pause)
  pauseButton.id("pauseButton")
  recordButton = createButton("RECORD")
  recordButton.position(sizeX, 20)
  recordButton.mousePressed(startRecording)
  recordButton.id("recordButton")
  resetButton = createButton("RESET")
  resetButton.position(sizeX, 40)
  resetButton.mousePressed(reset)

  //checkboxes
  drawConnectionsCheckbox = createCheckbox("Show Connections", false)
  drawConnectionsCheckbox.position(sizeX, 60)
  drawConnectionsCheckbox.changed(toggleShowConnections)
  debugCheckbox = createCheckbox("Debug Mode", false)
  debugCheckbox.position(sizeX, 80)
  debugCheckbox.changed(toggleDebug)
  hideBoidsCheckbox = createCheckbox("Hide Boids", false)
  hideBoidsCheckbox.position(sizeX, 100)
  hideBoidsCheckbox.changed(toggleHideBoids)

  //input
  numBoidsInput = createInput(n)
  numBoidsInput.position(sizeX, 120)

  myGrid = new Grid(100, sizeX / 100, sizeY / 100)

  generateBoids(n)


  myBoids.forEach((b) => {
    b.move(1, myGrid, sizeX, sizeY)
  })
  myBoids.forEach((b) => {
    b.collisionCheck(1, myGrid, sizeX, sizeY, frameNum)
  })

  frameRate(frate)
}

function draw() {
  if (!paused) {
    frameNum += 1
    background(0);
    myGrid.clearGrid()
    myBoids.forEach((b) => {
      b.move(1, myGrid, sizeX, sizeY)
    })
    myBoids.forEach((b) => {
      b.collisionCheck(1, myGrid, sizeX, sizeY, frameNum)
    })
    if (!hideBoids) {
      myBoids.forEach((b) => {
        b.draw()
      })
    }

    // keep adding new frame
    if (recording) {
      console.log('recording')
      encoder.addFrameRgba(drawingContext.getImageData(0, 0, encoder.width, encoder.height).data);
      recordedFrames++
    }
    // finalize encoding and export as mp4
    if (recordedFrames === numFrames) {
      recording = false
      recordedFrames = 0
      console.log('recording stopped')

      encoder.finalize()
      const uint8Array = encoder.FS.readFile(encoder.outputFilename);
      const anchor = document.createElement('a')
      anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }))
      anchor.download = encoder.outputFilename
      anchor.click()
      encoder.delete()

      preload() // reinitialize encoder
    }
  }
}

function startRecording() {
  recording = true
  recordButton.html("STOP RECORDING")
  recordButton.mousePressed(stopRecording)
}
function stopRecording() {
  recordButton.html("RECORD")
  recordButton.mousePressed(startRecording)

  recording = false
  recording = false
  recordedFrames = 0
  console.log('recording stopped')

  encoder.finalize()
  const uint8Array = encoder.FS.readFile(encoder.outputFilename);
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }))
  anchor.download = encoder.outputFilename
  anchor.click()
  encoder.delete()

  preload() // reinitialize encoder
}

function generateBoids(n) {
  for (var i = 0; i < n; i++) {
    myBoids.push(new Boid(i, Math.random() * sizeX, Math.random() * sizeY, Math.random() * PI * 2, 5))
  }
}

function pause() {
  paused = !paused
  if (paused) {
    pauseButton.html("PLAY")
  }
  else {
    pauseButton.html("PAUSE")
  }
}

function reset() {
  myBoids = []
  try {
    generateBoids(int(numBoidsInput.value()))
  }
  catch {
    generateBoids(n)
  }
  drawConnectionsCheckbox.value(false)
  debugCheckbox.value(false)
}

function toggleShowConnections() {
  myBoids.forEach((value) => { value.toggleShowConnection() })
}
function toggleDebug() {
  myBoids.forEach((value) => { value.toggleDebug() })
}

function toggleHideBoids() {
  hideBoids = !hideBoids
}
class Grid {
  constructor(cellSize, sizeX, sizeY) {
    this.cellSize = cellSize
    this.gridCells = new Map()
    this.sizeX = sizeX
    this.sizeY = sizeY
  }
  //MUST input ints
  hash(x, y) {
    let out = ""
    out += (x).toString()
    out += "B"
    out += (y).toString()
    return out
  }
  //can take floats
  getCell(x, y) {
    let cellX = Math.floor(x / this.cellSize)
    let cellY = Math.floor(y / this.cellSize)
    let myHash = this.hash(cellX, cellY)
    if (this.gridCells.has(myHash)) {
      return (this.gridCells.get(myHash))
    }
    else {
      let newCell = []
      this.gridCells.set(myHash, newCell)
      return newCell
    }
  }

  clearGrid() {
    this.gridCells = new Map()
  }

  getNeighboringCells(x, y) {
    var cellX = Math.floor(x / this.cellSize)
    var cellY = Math.floor(y / this.cellSize)
    const out = []
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        var myX = cellX + i
        myX %= this.sizeX
        if (myX < 0) { myX += this.sizeX }
        var myY = cellY + j
        myY %= this.sizeY
        if (myY < 0) { myY += this.sizeY }

        const myKey = this.hash(myX, myY)
        if (!this.gridCells.has(myKey)) {
        }
        else {
          out.push(this.gridCells.get(myKey))
        }
      }
    }
    return out
  }
}
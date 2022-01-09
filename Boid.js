class Boid {
  constructor(id, x, y, angle, size) {
    this.id = id
    this.x = x
    this.y = y
    this.size = size
    this.angle = angle

    this.v = 1
    this.turningSpeed = 0.05
    this.relativeRange = 10
    this.relativeFollowDistance = 2
    this.fov = PI / 4
    this.drafting = false
    this.relativeDraftDistance = 5
    this.maximumSpeed = 1
    this.minimumSpeed = 1
    this.acceleration = 0.01

    this.debug = false
    this.showConnections = false
    this.showTargetAngle = false

    this.myConnections = new Map()//maps id of other boid to 

    this.colliding = false
  }
  draw() {
    strokeWeight(0)
    fill(255, 255, 255)
    translate(this.x, this.y)
    rotate(this.angle)
    triangle(0, 0, 0.5 * this.size, 0.866 * this.size, -0.5 * this.size, 0.866 * this.size)

    strokeWeight(1)
    stroke(255)
    line(0, 0, 0, -this.size)

    if (this.debug) {
      if (this.colliding) {
        stroke(0, 255, 0)
      }
      else {
        stroke(255, 0, 0)
      }
      noFill()
      circle(0, 0, this.relativeRange * this.size * 2)

      line(0, 0, Math.sin(this.fov) * this.relativeRange * this.size, -Math.cos(this.fov) * this.relativeRange * this.size)
      line(0, 0, -Math.sin(this.fov) * this.relativeRange * this.size, -Math.cos(this.fov) * this.relativeRange * this.size)
    }

    rotate(-this.angle)
    translate(-this.x, -this.y)
  }

  move(deltaT, grid, screenX, screenY) {
    //move
    this.x = (this.x + Math.sin(this.angle) * this.v) * deltaT
    this.y = (this.y - Math.cos(this.angle) * this.v) * deltaT

    //map
    this.x %= screenX
    if (this.x < 0) { this.x += screenX }
    this.y %= screenY
    if (this.y < 0) { this.y += screenY }

    //add to new grid cell
    const myGridCell = grid.getCell(this.x, this.y)
    myGridCell.push(this)

  }
  collisionCheck(deltaT, grid, mapSizeX, mapSizeY, frameNum) {
    this.colliding = false
    //check gridcells
    var closestBoidDistance = null
    var closestBoidX = null
    var closestBoidY = null
    var closestBoidAngle = null

    const cellsToCheck = grid.getNeighboringCells(this.x, this.y)
    cellsToCheck.forEach((myList) => {
      myList.forEach((boid) => {
        if (boid != this) {
          //get boid effective coordinates
          //could be a connection through mapping
          var shortestDistance = null
          var effectiveX = null
          var effectiveY = null
          for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
              const testX = boid.x + sizeX * i
              const testY = boid.y + sizeY * j
              const distance = Math.sqrt(Math.pow((testX - this.x), 2) + Math.pow((testY - this.y), 2))
              if (shortestDistance != null) {
                if (shortestDistance < distance) {
                  continue
                }
              }
              //new shortest
              shortestDistance = distance
              effectiveX = testX
              effectiveY = testY
            }
          }

          //check if distance is within range
          if (shortestDistance < this.relativeRange * this.size) {
            //check relative angle
            const dx = effectiveX - this.x
            const dy = effectiveY - this.y
            var boidToMeAngle = Math.atan(dx / dy)
            var relativeAngle = 0
            if (dy > 0 && dx < 0) {
              boidToMeAngle = PI + boidToMeAngle
            }
            else if (dy > 0 && dx > 0) {
              boidToMeAngle = -PI + boidToMeAngle
            }
            if (this.angle > PI) {
              relativeAngle = 2 * PI - this.angle - boidToMeAngle
            }
            else {
              relativeAngle = this.angle + boidToMeAngle
            }




            if (Math.abs(relativeAngle) < this.fov) {

              this.colliding = true

              if (this.showConnections) {
                this.drawConnection(effectiveX, effectiveY, boid.id, frameNum)
              }
              if (closestBoidDistance != null) {
                if (shortestDistance < closestBoidDistance) {
                  closestBoidDistance = shortestDistance
                  closestBoidX = effectiveX
                  closestBoidY = effectiveY
                  closestBoidAngle = boid.angle
                }
              }
              else {
                closestBoidDistance = shortestDistance
                closestBoidX = effectiveX
                closestBoidY = effectiveY
                closestBoidAngle = boid.angle
              }
            }
          }
        }
      })
    })
    if (this.colliding) {
      //turn to closest boid
      const targetX = closestBoidX - Math.sin(closestBoidAngle) * this.relativeFollowDistance * this.size
      const targetY = closestBoidY + Math.cos(closestBoidAngle) * this.relativeFollowDistance * this.size
      this.turnTo(targetX, targetY)

      //check speed prams
      if (this.drafting) {
        if (closestBoidDistance < this.relativeDraftDistance * this.size) {
          this.v += this.acceleration
          if (this.v > this.maximumSpeed) {
            this.v = this.maximumSpeed
          }
        }
        else {
          this.v0 = this.acceleration
          if (this.v < this.minimumSpeed) {
            this.v = this.minimumSpeed
          }
        }
      }

      //clear unused connections
      this.myConnections.forEach((value, key, myMap) => {
        if (value.last < frameNum - 1) {
          this.myConnections.delete(key)
        }
      })
    }
    else {
      if (this.drafting) {
        this.v -= this.acceleration
        if (this.v < this.minimumSpeed) {
          this.v = this.minimumSpeed
        }
      }
      //no connections, restet map
      this.myConnections = new Map()
    }

  }

  turnTo(x, y) {
    if (this.showTargetAngle) {
      strokeWeight(1)
      stroke(0, 0, 255)
      line(this.x, this.y, x, y)
    }

    const dx = x - this.x
    const dy = y - this.y
    var targetAngle = Math.atan(dx / dy)
    if (dy > 0 && dx < 0) {
      targetAngle = PI + targetAngle
    }
    else if (dy > 0 && dx > 0) {
      targetAngle = -PI + targetAngle
    }

    //angle conversion

    if (targetAngle < 0) {
      targetAngle = -targetAngle
    }
    else {
      targetAngle = 2 * PI + targetAngle
    }

    //TODO slow turn
    var angleDifference = targetAngle - this.angle
    if (angleDifference > PI) {
      //reverse direction
      angleDifference = -2 * PI + angleDifference
    }
    else if (angleDifference < -PI) {
      //reverse direction
      angleDifference = -2 * PI + angleDifference
    }

    if (Math.abs(angleDifference) < this.turningSpeed) {
      //don't bother
      return
    }

    if (angleDifference < 0) {
      this.angle -= this.turningSpeed
      if (this.angle < 0) {
        this.angle += 2 * PI
      }
    }
    else {
      this.angle += this.turningSpeed
      if (this.angle > 2 * PI) {
        this.angle -= 2 * PI
      }
    }

  }

  drawConnection(x, y, id, frameNum) {
    var age = 0
    if (this.myConnections.has(id)) {
      const connectionData = this.myConnections.get(id)
      if (connectionData.last < frameNum - 1) {
        //age still zero
        connectionData.first = frameNum
        connectionData.last = frameNum
        //flash
        stroke(0, 255, 0)
        strokeWeight(1)
      }
      else {
        connectionData.last = frameNum
        age = frameNum - connectionData.first
        const sigmoid255 = 255 / (1 + Math.exp(-0.001 * age))
        stroke(sigmoid255, 255 - sigmoid255, 0)
        strokeWeight(1)
      }
    }
    else {
      this.myConnections.set(id, { first: frameNum, last: frameNum })
      //flash
      stroke(0, 255, 0)
      strokeWeight(1)
    }


    line(x, y, this.x, this.y)
  }

  toggleShowConnection() {
    this.showConnections = !this.showConnections
  }
  toggleDebug() {
    this.debug = !this.debug
    this.showTargetAngle = !this.showTargetAngle
  }
}
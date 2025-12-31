const socket = io("/");

const canvas = document.getElementById("canvas");

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width*2;
canvas.height = height*2;
canvas.style.width = width+"px";
canvas.style.height = height+"px";
const dpi = window.devicePixelRatio;

const ctx = canvas.getContext("2d");
ctx.scale(dpi, dpi);

ctx.font = "20px sans-serif";
ctx.lineWidth = 2;
ctx.strokeStyle = "red";

let tileset = loadTileset()

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function generateAgents(numberOfAgents) {
  let agentsGenerated = []
  for (let i = 0; i < numberOfAgents; i++) {
    agentsGenerated.push(new Agent(new Vector2(getRandomInt(tilesetDimensions.x), getRandomInt(tilesetDimensions.y))))
  }
  return agentsGenerated
}

function loadTileset() {
  let tileset = []

  for (i=1;i<22;i++) {
    let image = new Image()
    image.src = `/assets/tileset/Pixelcity_64_${i}.bmp`
    tileset.push(image)
  }
  return tileset
}

function findSelectedTile(event) {
  newX = Math.floor((event.clientX-tilesetOffset.x)/tileSize)
  newY = Math.floor((event.clientY-tilesetOffset.y)/tileSize)
  if (newX<0 || newX>=tilesetDimensions.x) {
    newX = null
  }
  if (newY<0 || newY>=tilesetDimensions.y) {
    newY = null
  }
  return new Vector2(newX, newY)
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function findPossibleMoves(currentPosition) {
  fields = [
    new Vector2(mod(currentPosition.x - 1, tilesetDimensions.x), mod(currentPosition.y - 1, tilesetDimensions.y)),  // Top-left
    new Vector2(mod(currentPosition.x, tilesetDimensions.x), mod(currentPosition.y - 1, tilesetDimensions.y)),      // Top-center
    new Vector2(mod(currentPosition.x + 1, tilesetDimensions.x), mod(currentPosition.y - 1, tilesetDimensions.y)),  // Top-right
    new Vector2(mod(currentPosition.x - 1, tilesetDimensions.x), mod(currentPosition.y, tilesetDimensions.y)),      // Middle-left
    new Vector2(mod(currentPosition.x + 1, tilesetDimensions.x), mod(currentPosition.y, tilesetDimensions.y)),      // Middle-right
    new Vector2(mod(currentPosition.x - 1, tilesetDimensions.x), mod(currentPosition.y + 1, tilesetDimensions.y)),  // Bottom-left
    new Vector2(mod(currentPosition.x, tilesetDimensions.x), mod(currentPosition.y + 1, tilesetDimensions.y)),      // Bottom-center
    new Vector2(mod(currentPosition.x + 1, tilesetDimensions.x), mod(currentPosition.y + 1, tilesetDimensions.y)),  // Bottom-right
  ]
  return fields
}

class Vector2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Tile {
  constructor(position, tileMapIndex) {
    this.position = position
    this.tileMapIndex = tileMapIndex
  }
  draw() {
    ctx.drawImage(tileset[this.tileMapIndex], tileSize*this.position.x+tilesetOffset.x, tileSize*this.position.y+tilesetOffset.y, tileSize, tileSize)
  }
  select(color) {
    ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.strokeRect(this.position.x*tileSize + tilesetOffset.x + 1,this.position.y*tileSize + tilesetOffset.y + 1, tileSize - 2, tileSize - 2);
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`
    ctx.fillRect(this.position.x*tileSize + tilesetOffset.x + 1,this.position.y*tileSize + tilesetOffset.y + 1, tileSize - 2, tileSize - 2);
  }
}

class Agent {
  constructor(position) {
    this.position = position
    this.hasMoved = false
  }
  move(newPosition) {
    this.position = newPosition
    this.hasMoved = true
  }
  nextTurn() {
    this.hasMoved = false
  }
}

tilemap = []
let tileSize = 64
tilesetDimensions = new Vector2(18, 10)
tilesetOffset = new Vector2(50, 50)
selectedSquare = new Vector2(0, 0)
let ownAgentCount = 3
let agents = generateAgents(ownAgentCount)
let agentSelected = false

setTimeout(() => {
  for (y=0;y<tilesetDimensions.y;y++) {
    xList = []
    for (x=0;x<tilesetDimensions.x;x++) {
      numberGenerated = getRandomInt(21)
      newTile = new Tile(new Vector2(x, y), numberGenerated)
      newTile.draw()
      xList.push(newTile)
    }
    tilemap.push(xList)
  }
  for (let i = 0; i < agents.length; i++) {
    tilemap[agents[i].position.y][agents[i].position.x].select([255, 255, 0])
  }
}, 200)

addEventListener("click", (event) => {
  let newTilePosition = findSelectedTile(event)
  if (selectedSquare.x != null && selectedSquare.y != null) {
    tilemap[selectedSquare.y][selectedSquare.x].draw()
  }
  agents.forEach(agent => {
    if (agent.position.x == selectedSquare.x && agent.position.y == selectedSquare.y) {
      tilemap[selectedSquare.y][selectedSquare.x].draw()
      tilemap[selectedSquare.y][selectedSquare.x].select([255, 255, 0])
    }
    if (agent.position.x == newTilePosition.x && agent.position.y == newTilePosition.y) { // Agent gets selected
    tilemap[newTilePosition.y][newTilePosition.x].draw()
      tilemap[newTilePosition.y][newTilePosition.x].select([255, 0, 0])
      let possiblePositions = findPossibleMoves(newTilePosition)
      console.log(possiblePositions)
      possiblePositions.forEach(position => {
        tilemap[position.y][position.x].select([255, 165, 0])
      })
    }
  })
  selectedSquare.x = newTilePosition.x
  selectedSquare.y = newTilePosition.y
})

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
    agentsGenerated.push(new Vector2(getRandomInt(tilesetDimensions.x), getRandomInt(tilesetDimensions.y)))
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
    ctx.strokeStyle = color;
    ctx.strokeRect(this.position.x*tileSize + tilesetOffset.x + 1,this.position.y*tileSize + tilesetOffset.y + 1, tileSize - 2, tileSize - 2);
  }
}

tilemap = []
let tileSize = 64
tilesetDimensions = new Vector2(18, 10)
tilesetOffset = new Vector2(50, 50)
selectedSquare = new Vector2(0, 0)
let ownAgentCount = 3
let agentPositions = generateAgents(ownAgentCount)

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
  for (let i = 0; i < agentPositions.length; i++) {
    tilemap[agentPositions[i].y][agentPositions[i].x].select("yellow")
  }
}, 200)

addEventListener("click", (event) => {
  let newTilePosition = findSelectedTile(event)
  if (selectedSquare.x != null && selectedSquare.y != null) {
    tilemap[selectedSquare.y][selectedSquare.x].draw()
  }
  agentPositions.forEach(agent => {
    if (agent.x == selectedSquare.x && agent.y == selectedSquare.y) {
      tilemap[selectedSquare.y][selectedSquare.x].select("yellow")
    }
    if (agent.x == newTilePosition.x && agent.y == newTilePosition.y) { // Agent gets selected
      tilemap[newTilePosition.y][newTilePosition.x].select("red")
    }
  })
  selectedSquare.x = newTilePosition.x
  selectedSquare.y = newTilePosition.y
})

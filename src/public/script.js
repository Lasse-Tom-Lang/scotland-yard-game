const socket = io("/");
const canvas = document.getElementById("canvas");
const width = window.innerWidth;
const height = window.innerHeight;
const dpi = window.devicePixelRatio;
const ctx = canvas.getContext("2d");

canvas.width = width*2;
canvas.height = height*2;
canvas.style.width = width+"px";
canvas.style.height = height+"px";
ctx.scale(dpi, dpi);

ctx.font = "20px sans-serif";
ctx.lineWidth = 0;

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
  let newX = Math.floor((event.clientX-tilesetOffset.x)/tileSize)
  let newY = Math.floor((event.clientY-tilesetOffset.y)/tileSize)
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

function drawGameBoard() {
  for (y=0;y<tilesetDimensions.y;y++) {
    for (x=0;x<tilesetDimensions.x;x++) {
      tilemap[y][x].draw()
    }
  }
  for (let i = 0; i < agents.length; i++) {
    if (agents[i].hasMoved) { // Agent has moved
      tilemap[agents[i].position.y][agents[i].position.x].select([0, 255, 0])
      continue
    }
    if (agentSelected == i) { // Agent is selected
      tilemap[agents[i].position.y][agents[i].position.x].select([255, 0, 0])
      let possiblePositions = findPossibleMoves(agents[i].position)
      possiblePositions.forEach(position => {
        tilemap[position.y][position.x].select([255, 165, 0])
      })
      continue
    }
    tilemap[agents[i].position.y][agents[i].position.x].select([255, 255, 0]) // Agent hasn't moved and isn't selected
  }
}

function nextTurn() {
  currentTurn += 1
  agents.forEach(agent => {
    agent.nextTurn()
  })
  let possibleNewPosisiton = findPossibleMoves(antagonistPosition)
  antagonistPosition = possibleNewPosisiton[Math.floor(Math.random()*possibleNewPosisiton.length)]
  ctx.drawImage(tileset[tilemap[antagonistPosition.y][antagonistPosition.x].tileMapIndex], tileSize*currentTurn+previousTurnsOffset.x, previousTurnsOffset.y, tileSize, tileSize)
}

function tryToArrest() {
  if (agentSelected != null && agents[agentSelected].position.x == antagonistPosition.x && agents[agentSelected].position.y == antagonistPosition.y) {
    alert("You Won!")
  }
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

class ButtonManager {
  constructor() {
    this.buttons = []
  }
  newButton(text, position, dimensions, backgroundColor, textColor, borderRadius, onClick) {
    let newButton = new Button(text, position, dimensions, backgroundColor, textColor, borderRadius, onClick)
    this.buttons.push(newButton)
    return newButton
  }
  checkClicks(clickPosition) {
    for(let i = 0; i<this.buttons.length; i++) {
      if (this.buttons[i].position.x <= clickPosition.x && this.buttons[i].position.y <= clickPosition.y && this.buttons[i].position.x + this.buttons[i].dimensions.x >= clickPosition.x && this.buttons[i].position.y + this.buttons[i].dimensions.y >= clickPosition.y) {
        this.buttons[i].onClick()
      }
    }
  }
}

class Button {
  constructor(text, position, dimensions, backgroundColor, textColor, borderRadius, onClick) {
    this.text = text
    this.position = position
    this.dimensions = dimensions
    this.backgroundColor = backgroundColor
    this.textColor = textColor
    this.borderRadius = borderRadius
    this.onClick = onClick
    this.draw()
  }

  draw() {
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.backgroundColor

    ctx.beginPath();
    ctx.arc(this.position.x + this.borderRadius, this.position.y + this.borderRadius, this.borderRadius-1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.position.x + this.dimensions.x - this.borderRadius, this.position.y + this.borderRadius, this.borderRadius-1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.position.x + this.borderRadius, this.position.y + this.dimensions.y - this.borderRadius, this.borderRadius-1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.position.x + this.dimensions.x - this.borderRadius, this.position.y + this.dimensions.y - this.borderRadius, this.borderRadius-1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(this.position.x + this.borderRadius, this.position.y, this.dimensions.x - 2*this.borderRadius, this.dimensions.y);
    ctx.fillRect(this.position.x, this.position.y + this.borderRadius, this.dimensions.x, this.dimensions.y - 2*this.borderRadius);


    ctx.fillStyle = this.textColor;
    ctx.fillText(this.text, this.position.x+5, this.position.y + (this.dimensions.y/2+5));
  }
}

let buttonManager = new ButtonManager()
buttonManager.newButton("Next turn", new Vector2(15, 15), new Vector2(100, 40), "green", "white", 20, nextTurn)
buttonManager.newButton("Arrest", new Vector2(130, 15), new Vector2(70, 40), "red", "white", 20, tryToArrest)

let tileset = loadTileset()
let tilemap = []
let tileSize = 64
let tilesetDimensions = new Vector2(18, 10)
let tilesetOffset = new Vector2(70, 70)
let selectedSquare = new Vector2(0, 0)
let ownAgentCount = 3
let agents = generateAgents(ownAgentCount)
let agentSelected = null
let currentTurn = 0
let previousTurnsOffset = new Vector2(70, tilesetOffset.y + tilesetDimensions.y*tileSize + 15)
let antagonistPosition = new Vector2(getRandomInt(tilesetDimensions.x), getRandomInt(tilesetDimensions.y))

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
  ctx.drawImage(tileset[tilemap[antagonistPosition.y][antagonistPosition.x].tileMapIndex], tileSize*currentTurn+previousTurnsOffset.x, previousTurnsOffset.y, tileSize, tileSize)
}, 200)

addEventListener("click", (event) => {
  let newTilePosition = findSelectedTile(event)

  buttonManager.checkClicks(new Vector2(event.clientX, event.clientY))

  if (agentSelected != null) { // Checks if an agent gets moved
    let possiblePositions = findPossibleMoves(selectedSquare)
    possiblePositions.forEach(position => {
      if (position.x != newTilePosition.x || position.y != newTilePosition.y) {
        return
      }
      agents[agentSelected].move(newTilePosition)
    })
    agentSelected = null
  }

  for (let i = 0; i < agents.length; i++) { // Checks if an agent got selected
    if (agents[i].position.x == newTilePosition.x && agents[i].position.y == newTilePosition.y && !agents[i].hasMoved) {
      agentSelected = i
      break
    }
  }

  drawGameBoard()
  selectedSquare.x = newTilePosition.x
  selectedSquare.y = newTilePosition.y
})

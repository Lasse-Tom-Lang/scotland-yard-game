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

let tileset = []

for (i=1;i<22;i++) {
  let image = new Image()
  image.src = `/assets/tileset/Pixelcity_64_${i}.bmp`
  tileset.push(image)
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

class Vector2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

tilesetDimensions = new Vector2(18, 10)
tilemap = []
let tileSize = 64
tilesetOffset = new Vector2(50, 50)


setTimeout(() => {
  for (y=0;y<tilesetDimensions.y;y++) {
    xList = []
    for (x=0;x<tilesetDimensions.x;x++) {
      numberGenerated = getRandomInt(21)
      xList.push(numberGenerated)
      ctx.drawImage(tileset[numberGenerated], tileSize*x+tilesetOffset.x, tileSize*y+tilesetOffset.y, tileSize, tileSize)
    }
    tilemap.push(xList)
  }
}, 200)

addEventListener("mousemove", (event) => { 
  console.log(event.clientX, event.clientY)
})

// ctx.moveTo(0, 0);
// ctx.lineTo(200, 100);
// ctx.stroke();
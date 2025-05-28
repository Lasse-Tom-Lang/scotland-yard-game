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


ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
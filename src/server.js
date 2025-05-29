http = require("http")
express = require("express");
const app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);


app.use(express.static('public'));


server.listen(80, () => {
    console.log("Server running on port 80")
})

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id)
  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id)
  })
})
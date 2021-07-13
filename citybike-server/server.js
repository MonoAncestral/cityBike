const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const citybikeurl = "http://api.citybik.es/v2/networks/decobike-miami-beach"
const client = require('socket.io-client');
const axios = require('axios');


const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();


app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!

const bik = client('wss://ws.citybik.es', {
  path: '/socket.io'
})

io.on("connection", socket => {
  bik.on('diff', (value) => {
    if (value.message.network === 'decobike-miami-beach') {
      socket.emit('diff', value.message.station);
    }
  });

  var socketId = socket.id;

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  
  socket.on("conected", () => {
    axios.get(citybikeurl).then((res) => {
      socket.emit('init', res.data.network);
    });
  });
});



server.listen(port, () => console.log(`Listening on port ${port}`));




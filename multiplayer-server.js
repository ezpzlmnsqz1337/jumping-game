import { createServer } from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const app = express()
const server = createServer(app)
const io = new Server(server)
const port = 3000
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'))
})

app.use(express.static("./dist"))

server.listen(port, () => console.log(`Example app listening on port ${port}!`))

const gameInfo = {
  players: {}
}

// event handlers
function playerConnected(socket) {
  console.log('player connected', socket.id)
  // create a new player and add it to our players object
  gameInfo.players[socket.id] = { position: null, rotation: null }
  // update all other players of the new player
  io.emit(EventType.PLAYER_CONNECTED, socket.id)
  console.log(Object.keys(gameInfo.players))
}

function playerDisconnected(socket) {
  console.log('Player disconnected', socket.id)
  // remove this player from our players object
  delete gameInfo.players[socket.id]
  // emit a message to all players to remove this player
  io.emit(EventType.PLAYER_DISCONNECTED, socket.id)
  console.log(Object.keys(gameInfo.players))
}

// events
const EventType = Object.freeze({
  CURRENT_PLAYERS: 'currentPlayers',
  PLAYER_CONNECTED: 'player:connected',
  PLAYER_DISCONNECTED: 'player:disconnected',
  PLAYER_INFO: 'player:info',
  PLAYER_ID: 'player:id',
  GAME_INFO: 'game:info'
})

let broadcasting = false;
let stopRequested = false;

io.on('connection', socket => {
  if (!broadcasting) {
    broadcastPlayerInfo(socket);
  }
  playerConnected(socket);

  socket.on(EventType.PLAYER_INFO, playerInfo => {
    gameInfo.players[socket.id] = playerInfo;
  })

  socket.emit(EventType.PLAYER_ID, socket.id);

  socket.on('disconnect', () => {
    playerDisconnected(socket);
    if (Object.keys(gameInfo.players).length === 0) {
      stopRequested = true;
    }
  })
})

const broadcastPlayerInfo = (socket) => {
  if (stopRequested) {
    broadcasting = false;
    stopRequested = false;
    return
  }

  socket.broadcast.emit(EventType.GAME_INFO, {id: socket.id, gameInfo});

  setTimeout(() => broadcastPlayerInfo(socket), 10)
};
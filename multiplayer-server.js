import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

const app = express()
const server = createServer(app)
const io = new Server(server)
const port = 13370
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'))
})

app.use(express.static("./dist"))

server.listen(port, () => console.log(`Example app listening on port ${port}!`))

const gameInfo = {
  players: {},
  objects: {},
  times: [
    { nickname: 'ezpzlmnsqz1337', time: 184055, timeStr: '03:04.055', checkpoints: 15 },
    { nickname: 'ezpzlmnsqz1337', time: 203082, timeStr: '03:23.082', checkpoints: 17 },
    { nickname: 'ezpzlmnsqz1337', time: 202316, timeStr: '03:22.316', checkpoints: 24 },
    { nickname: 'ezpzlmnsqz1337', time: 274392, timeStr: '04:34.392', checkpoints: 25 }
  ]
}

// event handlers
function playerConnected(socket) {
  console.log('player connected', socket.id);
  // create a new player and add it to our players object
  gameInfo.players[socket.id] = { position: null, rotation: null, status: 'in_lobby' };
  // update all other players of the new player
  io.emit(EventType.PLAYER_CONNECTED, socket.id);
  broadCastChatMessage(socket, 'server', 'Player connected.');
}

function playerDisconnected(socket) {
  console.log('Player disconnected', socket.id);
  // remove this player from our players object
  delete gameInfo.players[socket.id];
  // emit a message to all players to remove this player
  io.emit(EventType.PLAYER_DISCONNECTED, socket.id);
  broadCastChatMessage(socket, 'server', 'Player disconnected.');
}

const broadCastChatMessage = (socket, playerId, text) => {
  const player = gameInfo.players[playerId];
  const nickname = player ? player.nickname : 'Server';
  const color = player ? player.color : 'gray';
  socket.broadcast.emit(EventType.CHAT_UPDATE, {
    playerId: playerId || 'server',
    nickname,
    color,
    text
  });
}

const logData = () => {
  console.log('Players:', Object.values(gameInfo.players).map(player => [player.nickname, player.status]));
  console.log('Objects:', Object.entries(gameInfo.objects).map(([name, data]) => ({name, ...data})));
  console.log('');
  setTimeout(logData, 5000)
}
logData()

// events
const EventType = Object.freeze({
  CURRENT_PLAYERS: 'currentPlayers',
  PLAYER_CONNECTED: 'player:connected',
  PLAYER_DISCONNECTED: 'player:disconnected',
  PLAYER_INFO: 'player:info',
  PLAYER_ID: 'player:id',
  GAME_INFO: 'game:info',
  ADD_TIME: 'add:time',
  CHAT_MESSAGE: 'chat:message',
  CHAT_UPDATE: 'chat:update',
  OBJECTS_INFO: 'objects:info',
})

let broadcasting = false;
let stopRequested = false;

io.on('connection', socket => {
  if (!broadcasting) {
    broadcastPlayerInfo(socket);
    broadcastPlayerInfo(socket);
  }
  playerConnected(socket);

  socket.on(EventType.PLAYER_INFO, playerInfo => {
    gameInfo.players[socket.id] = playerInfo;
  });

  socket.on(EventType.OBJECTS_INFO, objectInfo => {
    gameInfo.objects = objectInfo;
  });

  socket.on(EventType.ADD_TIME, time => {
    gameInfo.times.push(time);
    gameInfo.times.sort((a, b) => {
      if (a.checkpoints === b.checkpoints) {
        return a.time - b.time;
      }
      return a.checkpoints - b.checkpoints;
    });
  });

  socket.emit(EventType.PLAYER_ID, socket.id);

  socket.on(EventType.CHAT_MESSAGE, message => {
    console.log('Chat message:', message);
    broadCastChatMessage(socket, message.playerId, message.text);
  });

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
    return;
  }

  socket.broadcast.emit(EventType.GAME_INFO, { id: socket.id, gameInfo });

  setTimeout(() => broadcastPlayerInfo(socket), 10);
};
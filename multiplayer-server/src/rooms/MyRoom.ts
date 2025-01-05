import { Room, Client } from "@colyseus/core";
import { ChatMessage, MyRoomState, Player, TimeEntry } from "./schema/MyRoomState";

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

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;  

  onCreate(options: any) {
    this.setState(new MyRoomState());

    // stored best times
    this.state.times.push(
      new TimeEntry({ nickname: 'ezpzlmnsqz1337', time: 184055, timeStr: '03:04.055', checkpoints: 15 }),
      new TimeEntry({ nickname: 'ezpzlmnsqz1337', time: 179384, timeStr: '02:59.384', checkpoints: 17 }),
      new TimeEntry({ nickname: 'ezpzlmnsqz1337', time: 203082, timeStr: '03:23.082', checkpoints: 17 }),
      new TimeEntry({ nickname: 'ezpzlmnsqz1337', time: 202316, timeStr: '03:22.316', checkpoints: 24 }),
      new TimeEntry({ nickname: 'ezpzlmnsqz1337', time: 274392, timeStr: '04:34.392', checkpoints: 25 })
    );

    this.onMessage(EventType.PLAYER_INFO, (client, playerInfo) => {
      this.updatePlayerInfo(client.sessionId, playerInfo);      
    });

    this.onMessage(EventType.OBJECTS_INFO, (client, message) => {
      
    });

    this.onMessage(EventType.ADD_TIME, (client, time) => {
      this.addTime(new TimeEntry(time));
    });

    this.onMessage(EventType.CHAT_MESSAGE, (client, message) => {
     this.handleChatMessage(client.sessionId, message);
    });
  }

  onJoin(client: Client, options: any) {
    // create Player instance
    const player = new Player();

    // place player in the map of players by its sessionId
    // (client.sessionId is unique per connection!)
    this.state.players.set(client.sessionId, player);
    // emit essage to chat
    this.broadCastServerMessage(`Player connected.`);
  }

  onLeave(client: Client, consented: boolean) {
    const playerName = this.state.players.get(client.sessionId).nickname;
    // remove this player from server
    this.state.players.delete(client.sessionId);
    // emit a message to all players to remove this player
    this.broadcast(EventType.PLAYER_DISCONNECTED, client.sessionId);
    // emit essage to chat
    this.broadCastServerMessage(`Player ${playerName} disconnected.`)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  updatePlayerInfo(playerId: string, playerInfo: Player) {
    const player = this.state.players.get(playerId)
    player.position.x = playerInfo.position.x;
    player.position.y = playerInfo.position.y;
    player.position.z = playerInfo.position.z;

    player.rotation.x = playerInfo.rotation.x;
    player.rotation.y = playerInfo.rotation.y;
    player.rotation.z = playerInfo.rotation.z;
    player.rotation.w = playerInfo.rotation.w;

    player.nickname = playerInfo.nickname;
    player.collissionEnabled = playerInfo.collissionEnabled;
    player.color = playerInfo.color;
    player.status = playerInfo.status;
  }

  addTime(time: TimeEntry) {
    this.state.times.push(time);
    this.state.times.sort((a, b) => {
      if (a.checkpoints === b.checkpoints) {
        return a.time - b.time;
      }
      return a.checkpoints - b.checkpoints;
    });
  }

  handleChatMessage(playerId: string, text: string) {
    const player = this.state.players.get(playerId);
    const message = new ChatMessage();
    message.nickname = player.nickname;
    message.text = text;
    this.state.chatMessages.push(message);
    this.broadCastPlayerMessage(playerId, text);
  }

  broadCastPlayerMessage(playerId: string, text: string) {    
    const player = this.state.players.get(playerId);
    if (player) {
      this.broadcast(EventType.CHAT_UPDATE, {
        playerId: playerId,
        nickname: player.nickname,
        color: player.color,
        text: text
      });
    }
  }

  broadCastServerMessage(text: string) {    
    this.broadcast(EventType.CHAT_UPDATE, {
      playerId: 'server',
      nickname: 'Server',
      color: 'gray',
      text
    });
  }
}

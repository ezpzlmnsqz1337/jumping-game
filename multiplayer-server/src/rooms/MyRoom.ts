import { Room, Client } from '@colyseus/core';
import { ChatMessage, MyRoomState, Player, TimeEntry } from './schema/MyRoomState';

// events
const EventType = Object.freeze({
  CURRENT_PLAYERS: 'currentPlayers',
  PLAYER_CONNECTED: 'player:connected',
  PLAYER_DISCONNECTED: 'player:disconnected',
  PLAYER_INFO: 'player:info',
  PLAYER_CORRECTION: 'player:correction',
  PLAYER_ID: 'player:id',
  GAME_INFO: 'game:info',
  ADD_TIME: 'add:time',
  CHAT_MESSAGE: 'chat:message',
  CHAT_UPDATE: 'chat:update',
  OBJECTS_INFO: 'objects:info',
});

// Maximum allowed speed in units per second before server rejects update
const MAX_ALLOWED_SPEED = 250;
const MAX_TELEPORT_RATE_MS = 1000;

// Bounds for client-submitted run data. These mirror LevelTimer.isValidRun() on
// the client so legitimate runs are never rejected.
const MIN_TIME_MS = 100;
const MAX_TIME_MS = 3600000; // 1 hour
const MAX_CHECKPOINTS = 1000;
const MAX_NICKNAME_LENGTH = 40;
const MAX_CHAT_MESSAGE_LENGTH = 500;
const MAX_CHAT_HISTORY = 100;

function formatTime(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((timeMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const milliseconds = Math.floor(timeMs % 1000)
    .toString()
    .padStart(3, '0');
  return `${minutes}:${seconds}.${milliseconds}`;
}

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  playerLastUpdate: Map<string, number> = new Map();
  playerLastTeleport: Map<string, number> = new Map();

  onCreate(_options: Record<string, unknown>) {
    this.setState(new MyRoomState());

    // DEMO SEED DATA — the six placeholder leaderboard entries below are written
    // into every room instance, including production. They are kept for local demos
    // for now. Move them to a dedicated seed script (or gate them behind an explicit
    // env flag) before relying on the production leaderboard.
    // TODO(leaderboard-seed): decide the production seeding strategy and remove this block.
    this.state.times.push(
      new TimeEntry({
        nickname: 'ezpzlmnsqz1337',
        time: 184055,
        timeStr: '03:04.055',
        checkpoints: 15,
      }),
      new TimeEntry({
        nickname: 'ezpzlmnsqz1337',
        time: 179384,
        timeStr: '02:59.384',
        checkpoints: 17,
      }),
      new TimeEntry({
        nickname: 'ezpzlmnsqz1337',
        time: 186865,
        timeStr: '03:06.865',
        checkpoints: 17,
      }),
      new TimeEntry({
        nickname: 'ezpzlmnsqz1337',
        time: 203082,
        timeStr: '03:23.082',
        checkpoints: 17,
      }),
      new TimeEntry({
        nickname: 'ezpzlmnsqz1337',
        time: 202316,
        timeStr: '03:22.316',
        checkpoints: 24,
      }),
      new TimeEntry({
        nickname: 'ezpzlmnsqz1337',
        time: 274392,
        timeStr: '04:34.392',
        checkpoints: 25,
      })
    );

    this.onMessage(EventType.PLAYER_INFO, (client, playerInfo) => {
      this.updatePlayerInfo(client, playerInfo);
    });

    this.onMessage(EventType.OBJECTS_INFO, (_client, _message) => {});

    this.onMessage(EventType.ADD_TIME, (client, time) => {
      if (!this.addTime(time)) {
        console.warn(`[add:time] rejected invalid time entry from ${client.sessionId}`);
      }
    });

    this.onMessage(EventType.CHAT_MESSAGE, (client, message) => {
      this.handleChatMessage(client.sessionId, message);
    });
  }

  onJoin(client: Client, _options: Record<string, unknown>) {
    // create Player instance
    const player = new Player();

    // place player in the map of players by its sessionId
    // (client.sessionId is unique per connection!)
    this.state.players.set(client.sessionId, player);
    this.playerLastUpdate.set(client.sessionId, Date.now());
    // emit essage to chat
    this.broadCastServerMessage(`Player connected.`);
  }

  onLeave(client: Client, _consented: boolean) {
    const playerName = this.state.players.get(client.sessionId)?.nickname ?? client.sessionId;
    // remove this player from server
    this.state.players.delete(client.sessionId);
    this.playerLastUpdate.delete(client.sessionId);
    this.playerLastTeleport.delete(client.sessionId);
    // emit a message to all players to remove this player
    this.broadcast(EventType.PLAYER_DISCONNECTED, client.sessionId);
    // emit essage to chat
    this.broadCastServerMessage(`Player ${playerName} disconnected.`);
  }

  onDispose() {
    console.warn('room', this.roomId, 'disposing...');
  }

  updatePlayerInfo(client: Client, playerInfo: Player & { teleported?: boolean }) {
    const playerId = client.sessionId;
    const player = this.state.players.get(playerId);
    if (!player) return;

    const now = Date.now();
    const lastUpdateAt = this.playerLastUpdate.get(playerId) || now;
    // Set a minimum delta time to avoid extremely large speed calculations from sub-millisecond deltas
    const deltaTime = Math.max(0.016, (now - lastUpdateAt) / 1000); // minimum 16ms
    this.playerLastUpdate.set(playerId, now);

    // Calculate distance moved
    const dx = player.position.x - playerInfo.position.x;
    const dy = player.position.y - playerInfo.position.y;
    const dz = player.position.z - playerInfo.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const speed = distance / deltaTime;

    // Handle teleport flag from client
    let isTeleport = false;
    if (playerInfo.teleported) {
      const lastTeleportAt = this.playerLastTeleport.get(playerId) || 0;
      if (now - lastTeleportAt > MAX_TELEPORT_RATE_MS) {
        isTeleport = true;
        this.playerLastTeleport.set(playerId, now);
      }
    }

    // Server authoritative speed validation
    if (!isTeleport && distance > 0.1 && speed > MAX_ALLOWED_SPEED) {
      console.warn(
        `[Correction] Player ${playerId} moved too fast (${speed.toFixed(2)} u/s). Rubber-banding to last valid position.`
      );
      client.send(EventType.PLAYER_CORRECTION, {
        position: { x: player.position.x, y: player.position.y, z: player.position.z },
        rotation: {
          x: player.rotation.x,
          y: player.rotation.y,
          z: player.rotation.z,
          w: player.rotation.w,
        },
      });
      return; // Reject the update
    }

    player.position.x = playerInfo.position.x;
    player.position.y = playerInfo.position.y;
    player.position.z = playerInfo.position.z;

    player.rotation.x = playerInfo.rotation.x;
    player.rotation.y = playerInfo.rotation.y;
    player.rotation.z = playerInfo.rotation.z;
    player.rotation.w = playerInfo.rotation.w;

    player.nickname = playerInfo.nickname;
    player.collisionEnabled = playerInfo.collisionEnabled;
    player.color = playerInfo.color;
    player.status = playerInfo.status;
  }

  addTime(entry: Partial<TimeEntry> | null | undefined): boolean {
    const time = Number(entry?.time);
    const checkpoints = Number(entry?.checkpoints);
    const nickname =
      typeof entry?.nickname === 'string'
        ? entry.nickname.trim().slice(0, MAX_NICKNAME_LENGTH)
        : '';

    // Reject anything outside the same bounds the client enforces for a valid run.
    if (!Number.isFinite(time) || time < MIN_TIME_MS || time > MAX_TIME_MS) return false;
    if (!Number.isInteger(checkpoints) || checkpoints < 0 || checkpoints > MAX_CHECKPOINTS) {
      return false;
    }
    if (!nickname) return false;

    const validEntry = new TimeEntry();
    validEntry.nickname = nickname;
    validEntry.time = time;
    // Derive timeStr server-side so a tampered client cannot rank one time while
    // displaying another.
    validEntry.timeStr = formatTime(time);
    validEntry.checkpoints = checkpoints;

    this.state.times.push(validEntry);
    this.state.times.sort((a, b) => {
      if (a.checkpoints === b.checkpoints) {
        return a.time - b.time;
      }
      return a.checkpoints - b.checkpoints;
    });
    return true;
  }

  handleChatMessage(playerId: string, text: unknown) {
    const player = this.state.players.get(playerId);
    if (!player) return;
    if (typeof text !== 'string') return;

    const trimmed = text.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
    if (!trimmed) return;

    const message = new ChatMessage();
    message.nickname = player.nickname || 'player';
    message.text = trimmed;
    this.state.chatMessages.push(message);

    // Bound history so a client cannot grow room state without limit.
    while (this.state.chatMessages.length > MAX_CHAT_HISTORY) {
      this.state.chatMessages.shift();
    }

    this.broadCastPlayerMessage(playerId, trimmed);
  }

  broadCastPlayerMessage(playerId: string, text: string) {
    const player = this.state.players.get(playerId);
    if (player) {
      this.broadcast(EventType.CHAT_UPDATE, {
        playerId: playerId,
        nickname: player.nickname,
        color: player.color,
        text: text,
      });
    }
  }

  broadCastServerMessage(text: string) {
    this.broadcast(EventType.CHAT_UPDATE, {
      playerId: 'server',
      nickname: 'Server',
      color: 'gray',
      text,
    });
  }
}

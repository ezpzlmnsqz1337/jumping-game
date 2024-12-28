import * as BABYLON from '@babylonjs/core';
import io, { Socket } from 'socket.io-client';
import { PlayerEntity } from './entities/player';
import { TimeEntry } from './timer';
import { updateTimes } from './ui';

interface MultiplayerData {
  gameInfo: MultiplayerGameInfo
}

interface MultiplayerGameInfo {
  times: TimeEntry[]
  players: MultiplayerPlayers
}

interface MultiplayerPlayers {
  [key: string]: PlayerInfo
}
interface PlayerInfo {
  position?: number[]
  rotation?: number[]
  mesh?: BABYLON.Mesh
}

interface MultiplayerSession {
  ws: Socket
  sendTimeToServer: (timeEntry: TimeEntry) => void
}

let playerMpId = '';
let players: MultiplayerPlayers = {};
let mp: MultiplayerSession;

export const createMultiplayer = (scene: BABYLON.Scene, player: PlayerEntity): MultiplayerSession => {
  const ws = io('http://localhost:3000');
  // socket status
  ws.on('connect', () => console.log('connected'));
  ws.on('disconnect', () => console.log('disconnect'));
  ws.on('player:id', (data: string) => (playerMpId = data));
  ws.on('game:info', (data: MultiplayerData) => {
    updatePlayers(scene, data.gameInfo.players);
    updateTimes(data.gameInfo.times);
  });

  scene.onBeforeRenderObservable.add(() => {
    sendPlayerInfo(ws, player);
  });

  mp = {
    ws: ws,
    sendTimeToServer: (timeEntry: TimeEntry) => {
      ws.emit('add:time', timeEntry);
    }
  }

  return mp
}

export const getMultiplayerSession = () => {
  return mp;
}

const sendPlayerInfo = (ws: Socket, player: PlayerEntity) => {
  ws.emit('player:info', {
    position: [player.mesh.position.x, player.mesh.position.y, player.mesh.position.z],
    rotation: [player.mesh.rotationQuaternion?.x, player.mesh.rotationQuaternion?.y, player.mesh.rotationQuaternion?.z, player.mesh.rotationQuaternion?.w],
  });
};

const updatePlayers = (scene: BABYLON.Scene, playerInfo: PlayerInfo) => {
  Object.entries(playerInfo).forEach(([id, playerInfo]) => {
    if (id === playerMpId) return;
    if (!players[id]) (players[id] = {});
    // update local player positions based on server response
    players[id].position = playerInfo.position;
    players[id].rotation = playerInfo.rotation;

    // create mesh for another player if player mesh doesn't exist
    if (!players[id].mesh) {
      players[id].mesh = BABYLON.MeshBuilder.CreateBox('player-mp', {
        width: 0.4,
        height: 0.4,
        depth: 0.4
      }, scene);
    }
    if (playerInfo.position && playerInfo.rotation) {
      players[id].mesh.position = new BABYLON.Vector3(...playerInfo.position);
      players[id].mesh.rotationQuaternion = new BABYLON.Quaternion(...playerInfo.rotation);
    }
  });
}
import * as BABYLON from '@babylonjs/core';
import io from 'socket.io-client';
import { PlayerEntity } from './entities/player';

interface MultiplayerData {
  gameInfo: MultiplayerGameInfo
}

interface MultiplayerGameInfo {
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

export const createMultiplayer = (scene: BABYLON.Scene, player: PlayerEntity) => {
  let playerMpId = '';
  let players: MultiplayerPlayers = {};

  const ws = io('http://localhost:3000');
  // socket status
  ws.on('connect', () => console.log('connected'));
  ws.on('disconnect', () => console.log('disconnect'));
  ws.on('player:id', (data: string) => (playerMpId = data));
  ws.on('game:info', (data: MultiplayerData) => {
    Object.entries(data.gameInfo.players).forEach(([id, playerInfo]) => {
      if (id === playerMpId) return;
      if (!players[id]) (players[id] = {});
      players[id].position = playerInfo.position;
      players[id].rotation = playerInfo.rotation;
    });

    updatePlayers();
  });

  const updatePlayers = () => {
    Object.entries(players).forEach(([id, playerInfo]) => {
      if (id === playerMpId) return;
      if (!players[id].mesh) {
        players[id].mesh = BABYLON.MeshBuilder.CreateBox('player-mp', {
          width: 0.4,
          height: 0.4,
          depth: 0.4
        }, scene);
      }
      if (playerInfo.position && playerInfo.rotation) {
        players[id].mesh.position = new BABYLON.Vector3(playerInfo.position[0], playerInfo.position[1], playerInfo.position[2]);
        players[id].mesh.rotationQuaternion = new BABYLON.Quaternion(playerInfo.rotation[0], playerInfo.rotation[1], playerInfo.rotation[2], playerInfo.rotation[3]);
      }
    });
  }

  const sendPlayerInfo = (player: PlayerEntity) => {
    ws.emit('player:info', {
      position: [player.mesh.position.x, player.mesh.position.y, player.mesh.position.z],
      rotation: [player.mesh.rotationQuaternion?.x, player.mesh.rotationQuaternion?.y, player.mesh.rotationQuaternion?.z, player.mesh.rotationQuaternion?.w],
    });
    setTimeout(() => sendPlayerInfo(player), 10);
  };
  sendPlayerInfo(player);
}
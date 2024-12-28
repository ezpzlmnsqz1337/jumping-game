import * as BABYLON from '@babylonjs/core';
import { createPlayer, PlayerEntity } from '../entities/player.ts';
import { createPhysics } from '../physics.ts';
import { createControls } from '../controls.ts';
import { createGround } from '../entities/ground.ts';
import { createArcRotateCamera, createFollowCamera } from '../camera.ts';
import { createShadowGenerator } from '../shadows.ts';
import { bindUI } from '../ui.ts';
import { createWalls } from '../entities/walls.ts';
import io from 'socket.io-client';

export const createScene1 = async (engine: BABYLON.Engine) => {
  const scene = new BABYLON.Scene(engine);

  await createPhysics(scene);

  const followCamera = createFollowCamera(scene);

  const controls = createControls(scene);
  const ground = createGround(scene);
  const player = createPlayer(scene, { startPosition: new BABYLON.Vector3(10, 13, -10) });
  controls.player = player;

  const walls = createWalls(scene);

  followCamera.lockedTarget = player.mesh;

  const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  const light1 = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(-6, 6, 0), scene);
  light1.intensity = 0.4;
  light1.shadowEnabled = true;
  light1.shadowMinZ = 0.1;
  light1.shadowMaxZ = 100;
  const lightGizmo1 = new BABYLON.LightGizmo(utilLayer);
  lightGizmo1.light = light1;

  createShadowGenerator(scene, light1, [player.mesh, ...walls], [player.mesh, ground, ...walls]);

  // fog
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 20;
  scene.fogEnd = 40;

  // UI
  bindUI(scene, player);

  // multiplayer
  createMultiplayer(scene, player);

  return scene;
}

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

const createMultiplayer = (scene: BABYLON.Scene, player: PlayerEntity) => {
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
import * as BABYLON from '@babylonjs/core';
import io, { Socket } from 'socket.io-client';
import { createNameTag, PlayerEntity } from './entities/player';
import { TimeEntry } from './entities/timer';
import { updateTimes } from './ui/ui';
import { getModel, ModelId as ModelId } from './assets/models';

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
let mp: MultiplayerSession | null = null;
let updating = false; // avoid running multiple updatePlayers at the same time

export const createMultiplayer = (scene: BABYLON.Scene, player: PlayerEntity): MultiplayerSession => {
  const ws = io(window.location.origin);
  // socket status
  ws.on('connect', () => console.log('connected'));
  ws.on('disconnect', () => console.log('disconnect'));
  ws.on('player:id', (data: string) => (playerMpId = data));
  ws.on('game:info', async (data: MultiplayerData) => {
    await updatePlayers(scene, data.gameInfo.players);
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
    nickname: player.nickname
  });
};

const updatePlayers = async (scene: BABYLON.Scene, playerInfo: PlayerInfo) => {
  if (updating) return;
  updating = true;

  for (let [id, info] of Object.entries(playerInfo)) {
    if (id === playerMpId) continue;
    if (!players[id]) (players[id] = {});
    // update local player positions based on server response
    players[id].position = info.position;
    players[id].rotation = info.rotation;

    // create mesh for another player if player mesh doesn't exist
    if (!players[id].mesh) {
      players[id].mesh = await createMpPlayer(scene, info.nickname);
    }
    if (info.position && info.rotation) {
      players[id].mesh.physicsBody!.disablePreStep = true;
      players[id].mesh.position = new BABYLON.Vector3(...info.position);
      players[id].mesh.rotationQuaternion = new BABYLON.Quaternion(...info.rotation);
      players[id].mesh.physicsBody!.disablePreStep = false;
    }
  }
  
  updating = false;
}

const createMpPlayer = async (scene: BABYLON.Scene, nickname: string) => {
  const models = Object.keys(ModelId).filter(model => model.includes('player'));
  const index = Math.round(Math.random() * (models.length - 1));
  const model = models[index];

  const box = BABYLON.MeshBuilder.CreateBox('player-mp', {
    width: 0.4,
    height: 0.4,
    depth: 0.4
  }, scene);
  box.visibility = 0;

  const playerModel = await getModel(scene, ModelId[model as keyof typeof ModelId]);
  playerModel.meshes.forEach(mesh => mesh.setParent(box));

  const boxAggregate = new BABYLON.PhysicsAggregate(
    box,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 10, restitution: 0, friction: 0.7 },
    scene
  );

  createNameTag(scene, box, nickname);

  return box;
}
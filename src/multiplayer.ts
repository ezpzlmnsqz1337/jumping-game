import * as BABYLON from '@babylonjs/core';
import io, { Socket } from 'socket.io-client';
import { createNameTag, PlayerEntity, PlayerStatus } from './entities/player';
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
  nickname?: string
  status: PlayerStatus
  color?: string
}

interface MultiplayerSession {
  ws: Socket
  sendTimeToServer: (timeEntry: TimeEntry) => void
}

let localPlayerId = '';
let players: MultiplayerPlayers = {};
let mp: MultiplayerSession | null = null;
let updating = false; // avoid running multiple updatePlayers at the same time

export const createMultiplayer = (scene: BABYLON.Scene, player: PlayerEntity): MultiplayerSession => {
  const ws = io(window.location.origin);
  // socket status
  ws.on('connect', () => console.log('connected'));
  ws.on('disconnect', () => console.log('disconnect'));
  ws.on('player:id', (data: string) => (localPlayerId = data));

  ws.on('player:connected', e => console.log('connected', e));
  ws.on('player:disconnected', e => {
    console.log('disconnected', e);
    removePlayer(scene, e);
  });

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
    nickname: player.nickname,
    color: player.color,
    status: player.status
  });
};

const updatePlayers = async (scene: BABYLON.Scene, playerInfo: MultiplayerPlayers) => {
  if (updating) return;
  updating = true;

  for (let [id, info] of Object.entries(playerInfo)) {
    if (id === localPlayerId) continue;
    const nickname = info.nickname || 'player';
    const color = info.color || 'blue';
    if (!players[id]) (players[id] = { status: 'in_lobby' });
    // if player changes color, remove him and reload
    if (players[id].mesh && players[id].color && players[id].color !== color) {
      players[id].mesh?.physicsBody?.dispose();
      scene.removeMesh(players[id].mesh, true);
      continue;
    }
    // update local player positions based on server response
    players[id].position = info.position;
    players[id].rotation = info.rotation;
    players[id].status = info.status || 'in_lobby';
    players[id].color = color;

    // create mesh for another player if player mesh doesn't exist
    if (!players[id].mesh) {
      players[id].mesh = await createMpPlayer(scene, nickname, color);
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

const createMpPlayer = async (scene: BABYLON.Scene, nickname: string, color?: string) => {
  const box = BABYLON.MeshBuilder.CreateBox('player-mp', {
    width: 0.4,
    height: 0.4,
    depth: 0.4
  }, scene);
  box.visibility = 0;

  const playerModel = await getModel(scene, `player-${color || 'red'}.glb`);
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

const removePlayer = (scene: BABYLON.Scene, id: string) => {
  console.log(players[id]);
  console.log('Removing player', id)
  if (players[id].mesh) {
    players[id].mesh?.physicsBody?.dispose();
    scene.removeMesh(players[id].mesh, true);
  }
  delete players[id];
  console.log(players[id]);
}
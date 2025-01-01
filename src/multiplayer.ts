import * as BABYLON from '@babylonjs/core';
import io, { Socket } from 'socket.io-client';
import { createNameTag, PlayerEntity, PlayerStatus } from './entities/player';
import { TimeEntry } from './entities/timer';
import { renderingCanvas, updateTimes } from './ui/ui';
import { getModel, ModelId as ModelId } from './assets/models';
import { FILTER_GROUP_PLAYER_MP, FILTER_MASK_PLAYER_MP_NO_COLLISSIONS, FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS, FILTER_MASK_PLAYER_NO_COLLISSIONS, FILTER_MASK_PLAYER_WITH_COLLISSIONS } from './collission-groups';


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
  collissionEnabled?: boolean
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
    // if player changes color, or nickname remove him and skip to next iteration
    const colorChange = players[id].mesh && players[id].color && players[id].color !== color
    const nicknameChange = players[id].mesh && players[id].nickname && players[id].nickname !== nickname;
    if (colorChange || nicknameChange) {
      removePlayer(scene, id);
      continue;
    }
    // update local player positions based on server response
    players[id].position = info.position;
    players[id].rotation = info.rotation;
    players[id].status = info.status || 'in_lobby';
    players[id].nickname = nickname;
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
  playerModel.meshes.forEach(mesh => {
    if (mesh.parent === null) {
      mesh.setParent(box);
      mesh.position = new BABYLON.Vector3(0, 0.0001, 0);
    }
  });

  const boxAggregate = new BABYLON.PhysicsAggregate(
    box,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 10, restitution: 0, friction: 0.7 },
    scene
  );

  boxAggregate.body.setLinearDamping(1);
  boxAggregate.shape.filterMembershipMask = FILTER_GROUP_PLAYER_MP;
  boxAggregate.shape.filterCollideMask = FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS;


  createNameTag(scene, box, nickname);

  return box;
}

const removePlayer = (scene: BABYLON.Scene, id: string) => {
  console.log('Removing player', id)
  if (players[id].mesh) {
    players[id].mesh?.physicsBody?.dispose();
    scene.removeMesh(players[id].mesh, true);
  }
  delete players[id];
}

export const toggleCollissions = (player: PlayerEntity) => {
  player.collissionEnabled = !player.collissionEnabled;
  // player mask
  const body = player.mesh.physicsBody;

  const playerMask = player.collissionEnabled ? FILTER_MASK_PLAYER_WITH_COLLISSIONS : FILTER_MASK_PLAYER_NO_COLLISSIONS;
  const playerMpMask = player.collissionEnabled ? FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS : FILTER_MASK_PLAYER_MP_NO_COLLISSIONS;

  if (!body || !body.shape) return;
  body.shape.filterCollideMask = playerMask;

  // multipalyer boxes masks
  player.mesh.getScene().meshes.forEach(mesh => {
    if (mesh.name !== 'player-mp') return;
    mesh.getChildMeshes().forEach(x => {
      if (!x.name.includes('player')) return;
      const material = x.material as BABYLON.PBRMaterial;
      material.alpha = player.collissionEnabled ? 1 : 0.5;
      material.transparencyMode = player.collissionEnabled ? 0 : 2;
    })
    const mpBody = mesh.physicsBody;
    if (!mpBody || !mpBody.shape) return;
    mpBody.shape.filterCollideMask = playerMpMask;
  })

  const collissions = document.querySelector('.collissions-enabled') as HTMLInputElement;
  collissions.checked = !!player.collissionEnabled;
  renderingCanvas.focus();
}
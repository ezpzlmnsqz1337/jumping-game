import * as BABYLON from '@babylonjs/core';
import io, { Socket } from 'socket.io-client';
import { getModel } from './assets/models';
import { FILTER_GROUP_PLAYER_MP, FILTER_MASK_PLAYER_MP_NO_COLLISSIONS, FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS, FILTER_MASK_PLAYER_NO_COLLISSIONS, FILTER_MASK_PLAYER_WITH_COLLISSIONS } from './collission-groups';
import { PlayerEntity, PlayerStatus } from './entities/player';
import gameRoot from './game-root';
import { TimeEntry } from './timer';
import { renderingCanvas } from './ui/ui-manager';
import { GameEntity } from './entities/game-entity';


interface MultiplayerData {
  gameInfo: MultiplayerGameInfo
}

interface MultiplayerGameInfo {
  times: TimeEntry[]
  players: MultiplayerPlayers
  objects: MultiplayerObjects
}

interface MultiplayerPlayers {
  [key: string]: PlayerInfo
}

interface MultiplayerObjects {
  [key: string]: ObjectInfo
}

interface ObjectInfo {
  position?: number[]
  rotation?: number[]
  mesh?: BABYLON.Mesh
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

export interface ChatMessage {
  id: string
  nickname: string
  color: string
  text: string
}

export class MultiplayerSession {
  ws: Socket;
  player: PlayerEntity;
  scene: BABYLON.Scene;
  updating = false;
  updatingObjects = false;
  localPlayerId = '';
  players: MultiplayerPlayers = {};
  objects: MultiplayerObjects = {};
  
  constructor(scene: BABYLON.Scene, player: PlayerEntity, objects: BABYLON.Mesh[]) {
    this.scene = scene;
    this.player = player;
    this.ws = io(window.location.origin);
    // socket status
    this.ws.on('connect', () => console.log('connected'));
    this.ws.on('disconnect', () => console.log('disconnect'));
    this.ws.on('player:id', (data: string) => (this.localPlayerId = data));

    this.ws.on('player:connected', e => console.log('connected', e));
    this.ws.on('player:disconnected', e => {
      console.log('disconnected', e);
      this.removePlayer(e);
    });

    this.ws.on('game:info', async (data: MultiplayerData) => {
      this.updatePlayers(data.gameInfo.players);
      this.updateObjects(data.gameInfo.objects);
      gameRoot.uiManager?.timeTableUI.updateUI(data.gameInfo.times);
    });

    this.ws.on('chat:update', async (message: ChatMessage) => {
      gameRoot.uiManager?.chatUI.addChatMessage(message);
    });

    scene.onBeforeRenderObservable.add(() => {
      this.sendPlayerInfo();
      this.sendObjectInfo(objects);
    });
  }

  sendTimeToServer(timeEntry: TimeEntry) {
    this.ws.emit('add:time', timeEntry);
  }

  sendChatMessage(text: string) { 
    this.ws.emit('chat:message', { playerId: this.localPlayerId, text });
  }

  sendPlayerInfo() {
    const mesh = this.player.mesh as BABYLON.Mesh;
    this.ws.emit('player:info', {
      position: [mesh.position.x, mesh.position.y, mesh.position.z],
      rotation: [mesh.rotationQuaternion?.x, mesh.rotationQuaternion?.y, mesh.rotationQuaternion?.z, mesh.rotationQuaternion?.w],
      nickname: this.player.nickname,
      color: this.player.color,
      status: this.player.status
    });
  };

  async updatePlayers(playerInfo: MultiplayerPlayers) {
    if (this.updating) return;
    this.updating = true;

    for (let [id, info] of Object.entries(playerInfo)) {
      if (id === this.localPlayerId) continue;
      const nickname = info.nickname || 'player';
      const color = info.color || 'blue';
      if (!this.players[id]) (this.players[id] = { status: 'in_lobby' });
      // if player changes color, or nickname remove him and skip to next iteration
      const colorChange = this.players[id].mesh && this.players[id].color && this.players[id].color !== color
      const nicknameChange = this.players[id].mesh && this.players[id].nickname && this.players[id].nickname !== nickname;
      if (colorChange || nicknameChange) {
        this.removePlayer(id);
        continue;
      }
      // update local player positions based on server response
      this.players[id].position = info.position;
      this.players[id].rotation = info.rotation;
      this.players[id].status = info.status || 'in_lobby';
      this.players[id].nickname = nickname;
      this.players[id].color = color;

      // create mesh for another player if player mesh doesn't exist
      if (!this.players[id].mesh) {
        this.players[id].mesh = await this.createMpPlayer(this.scene, nickname, color);
      }
      if (info.position && info.rotation) {
        this.players[id].mesh.physicsBody!.disablePreStep = true;
        this.players[id].mesh.position = new BABYLON.Vector3(...info.position);
        this.players[id].mesh.rotationQuaternion = new BABYLON.Quaternion(...info.rotation);
        this.players[id].mesh.physicsBody!.disablePreStep = false;
      }
    }

    this.updating = false;
  }

  async createMpPlayer(scene: BABYLON.Scene, nickname: string, color?: string) {
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


    GameEntity.createNameTag(scene, box, nickname);

    return box;
  }

  removePlayer(id: string) {
    console.log('Removing player', id)
    if (this.players[id].mesh) {
      this.players[id].mesh?.physicsBody?.dispose();
      this.scene.removeMesh(this.players[id].mesh, true);
    }
    delete this.players[id];
  }

  toggleCollissions() {
    if (!this.player.mesh) return;
    this.player.collissionEnabled = !this.player.collissionEnabled;
    // player mask
    const body = this.player.mesh.physicsBody;

    const playerMask = this.player.collissionEnabled ? FILTER_MASK_PLAYER_WITH_COLLISSIONS : FILTER_MASK_PLAYER_NO_COLLISSIONS;
    const playerMpMask = this.player.collissionEnabled ? FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS : FILTER_MASK_PLAYER_MP_NO_COLLISSIONS;

    if (!body || !body.shape) return;
    body.shape.filterCollideMask = playerMask;

    // multipalyer boxes masks
    this.player.mesh.getScene().meshes.forEach(mesh => {
      if (mesh.name !== 'player-mp') return;
      mesh.getChildMeshes().forEach(x => {
        if (!x.name.includes('player')) return;
        const material = x.material as BABYLON.PBRMaterial;
        material.alpha = this.player.collissionEnabled ? 1 : 0.5;
        material.transparencyMode = this.player.collissionEnabled ? 0 : 2;
      })
      const mpBody = mesh.physicsBody;
      if (!mpBody || !mpBody.shape) return;
      mpBody.shape.filterCollideMask = playerMpMask;
    })

    renderingCanvas.focus();
  }

  sendObjectInfo(meshes: BABYLON.Mesh[]) {
    this.ws.emit('objects:info', meshes.reduce((acc: any, cur) => {
      acc[cur.name] = {
        position: [cur.position.x, cur.position.y, cur.position.z],
        rotation: [cur.rotationQuaternion?.x, cur.rotationQuaternion?.y, cur.rotationQuaternion?.z, cur.rotationQuaternion?.w]
      }
      return acc;
    }, {}));
  };

  updateObjects(objectInfo: MultiplayerObjects) {
    if (this.updatingObjects) return;
    this.updatingObjects = true;

    for (let [id, info] of Object.entries(objectInfo)) {
      if (!this.objects[id]) (this.objects[id] = {});
      // update local player positions based on server response
      this.objects[id].position = info.position;
      this.objects[id].rotation = info.rotation;

      // create mesh for another player if player mesh doesn't exist
      if (!this.objects[id].mesh) {
        const mesh = this.scene.getMeshByName(id);
        if (!mesh) continue;
        this.objects[id].mesh = mesh as BABYLON.Mesh;
      }
      if (info.position && info.rotation) {
        this.objects[id].mesh.physicsBody!.disablePreStep = true;
        this.objects[id].mesh.position = new BABYLON.Vector3(...info.position);
        this.objects[id].mesh.rotationQuaternion = new BABYLON.Quaternion(...info.rotation);
        this.objects[id].mesh.physicsBody!.disablePreStep = false;
      }
    }

    this.updatingObjects = false;
  }
}
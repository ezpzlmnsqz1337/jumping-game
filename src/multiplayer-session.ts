import * as BABYLON from '@babylonjs/core';
import * as Colyseus from "colyseus.js";
import { getModel } from './assets/models';
import { FILTER_GROUP_PLAYER_MP, FILTER_MASK_PLAYER_MP_NO_COLLISSIONS, FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS, FILTER_MASK_PLAYER_NO_COLLISSIONS, FILTER_MASK_PLAYER_WITH_COLLISSIONS } from './collission-groups';
import { GameEntity } from './entities/game-entity';
import { PlayerEntity, PlayerStatus } from './entities/player-entity';
import gameRoot from './game-root';
import { TimeEntry } from './level-timer';

const UPDATE_SPEED_MS = 1000 / 60;

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Rotation {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface MultiplayerGameInfo {
  players: Map<string, PlayerInfo>;
  objects: Map<string, ObjectInfo>;
  times: TimeEntry[];
}

interface ObjectInfo {
  position?: Position;
  rotation?: Rotation;
  mesh?: BABYLON.Mesh;
}

interface PlayerInfo {
  position?: Position;
  rotation?: Rotation;
  nickname?: string;
  mesh?: BABYLON.Mesh;
  status: PlayerStatus;
  color?: string;
  collissionEnabled?: boolean;
}

export interface ChatMessage {
  id: string;
  nickname: string;
  color: string;
  text: string;
}

export class MultiplayerSession {
  ws: Colyseus.Client;
  player: PlayerEntity;
  scene: BABYLON.Scene;
  updating = false;
  updatingObjects = false;
  localPlayerId = '';
  players: Map<string, PlayerInfo> = new Map();
  objects: Map<string, ObjectInfo> = new Map();
  times: TimeEntry[] = [];
  room!: Colyseus.Room;
  lastTimeSent = performance.now();

  constructor(scene: BABYLON.Scene, player: PlayerEntity, objects: BABYLON.Mesh[]) {
    this.scene = scene;
    this.player = player;
    this.ws = new Colyseus.Client(`ws://${window.location.host}`);
    this.ws.joinOrCreate<MultiplayerGameInfo>("my_room").then(room => {
      this.room = room;
      console.log(room.sessionId, "joined", room.name);
      this.localPlayerId = room.sessionId;

      room.onStateChange(async state =>  {
        if (performance.now() - this.lastTimeSent < UPDATE_SPEED_MS) return;
        this.lastTimeSent = performance.now();
        await this.updatePlayers((state.players as any).$items);

        gameRoot.uiManager?.timeTableUI.updateUI((state.times as any).$items);
      });

      room.onMessage("player:disconnected", (message) => {
        this.removePlayer(message);
      });

      room.onMessage("chat:update", (message) => {
        if (message.playerId === this.localPlayerId) return;
        gameRoot.uiManager?.chatUI.addChatMessage(message);
      });

      room.onError((code, message) => {
        console.log(room.sessionId, "couldn't join", room.name, code, message);
      });

      room.onLeave((code) => {
        console.log(room.sessionId, "player left", room.name);
      });

      scene.onBeforeRenderObservable.add(() => {
        this.sendPlayerInfo();
        // this.sendObjectInfo(objects);
      });
    }).catch(e => {
      console.log("JOIN ERROR", e);
    });
  }

  async updatePlayers(playerInfo: Map<string, PlayerInfo>) {
    if (this.updating) return;
    this.updating = true;

    for (let [id, info] of playerInfo) {
      if (id === this.localPlayerId) continue;
      const nickname = info.nickname || 'player';
      const color = info.color || 'blue';

      let player = this.players.get(id);
      if (!player) {
        player = { status: 'in_lobby' };
        this.players.set(id, player);
      }
      // if player changes color, or nickname remove him and skip to next iteration
      const colorChange = player.mesh && player.color && player.color !== color
      const nicknameChange = player.mesh && player.nickname && player.nickname !== nickname;
      if (colorChange || nicknameChange) {
        this.removePlayer(id);
        continue;
      }
      // update local player positions based on server response
      player.position = info.position;
      player.rotation = info.rotation;
      player.status = info.status;
      player.nickname = nickname;
      player.color = color;
      player.collissionEnabled = info.collissionEnabled;

      // create mesh for another player if player mesh doesn't exist
      if (!player.mesh) {
        player.mesh = await this.createMpPlayer(this.scene, nickname, color);
      }
      if (info.position && info.rotation) {
        player.mesh.physicsBody!.disablePreStep = true;
        const targetPosition = new BABYLON.Vector3(info.position.x, info.position.y, info.position.z);
        const targetRotation = new BABYLON.Quaternion(info.rotation.x, info.rotation.y, info.rotation.z, info.rotation.w);
        player.mesh.position = targetPosition;
        player.mesh.rotationQuaternion = targetRotation;
        player.mesh.physicsBody!.disablePreStep = false;
      }

      // collissions toggle
      const shouldHaveCollission = this.player.collissionEnabled && player.collissionEnabled;
      player.mesh.getChildMeshes().forEach(x => {
        if (!x.name.includes('player')) return;
        const material = x.material as BABYLON.PBRMaterial;
        material.alpha = shouldHaveCollission ? 1 : 0.5;
        material.transparencyMode = shouldHaveCollission ? 0 : 2;
      })
      const mpBody = player.mesh.physicsBody;
      if (!mpBody || !mpBody.shape) return;
      const playerMpMask = shouldHaveCollission ? FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS : FILTER_MASK_PLAYER_MP_NO_COLLISSIONS;
      mpBody.shape.filterCollideMask = playerMpMask;      
    }

    this.updating = false;
  }

  sendObjectInfo(meshes: BABYLON.Mesh[]) {
    this.room.send('objects:info', meshes.reduce((acc: any, cur) => {
      acc[cur.name] = {
        position: { x: cur.position.x, y: cur.position.y, z: cur.position.z },
        rotation: { x: cur.rotationQuaternion?.x, y: cur.rotationQuaternion?.y, z: cur.rotationQuaternion?.z, w: cur.rotationQuaternion?.w }
      }
      return acc;
    }, {}));
  };

  updateObjects(objectInfo: Map<string, ObjectInfo>) {
    if (this.updatingObjects) return;
    this.updatingObjects = true;

    for (let [id, info] of objectInfo) {
      if (!this.objects.get(id)) this.objects.set(id, {});
      const o = this.objects.get(id) as ObjectInfo;
      // update local player positions based on server response
      o.position = info.position;
      o.rotation = info.rotation;

      // create mesh for another player if player mesh doesn't exist
      if (!o.mesh) {
        const mesh = this.scene.getMeshByName(id);
        if (!mesh) continue;
        o.mesh = mesh as BABYLON.Mesh;
      }
      if (info.position && info.rotation) {
        o.mesh.physicsBody!.disablePreStep = true;
        o.mesh.position = new BABYLON.Vector3(info.position.x, info.position.y, info.position.z);
        o.mesh.rotationQuaternion = new BABYLON.Quaternion(info.rotation.x, info.rotation.y, info.rotation.z, info.rotation.w);
        o.mesh.physicsBody!.disablePreStep = false;
      }
    }

    this.updatingObjects = false;
  }

  sendTimeToServer(timeEntry: TimeEntry) {
    this.room.send('add:time', timeEntry);
  }

  sendChatMessage(text: string) {
    this.room.send('chat:message', text);
  }

  sendPlayerInfo() {
    const mesh = this.player.mesh as BABYLON.Mesh;
    this.room.send('player:info', {
      position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
      rotation: { x: mesh.rotationQuaternion?.x, y: mesh.rotationQuaternion?.y, z: mesh.rotationQuaternion?.z, w: mesh.rotationQuaternion?.w },
      nickname: this.player.nickname,
      color: this.player.color,
      status: this.player.status,
      collissionEnabled: this.player.collissionEnabled
    });
  };

  async createMpPlayer(scene: BABYLON.Scene, nickname: string, color?: string) {
    console.log('Creating player', nickname);
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
        mesh.position = new BABYLON.Vector3(0, 0.001, 0);
      }
    });

    const boxAggregate = new BABYLON.PhysicsAggregate(
      box,
      BABYLON.PhysicsShapeType.BOX,
      { mass: 0, restitution: 0, friction: 0.5 },
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
    const player = this.players.get(id);
    if (player && player.mesh) {
      player.mesh?.physicsBody?.dispose();
      this.scene.removeMesh(player.mesh, true);
    }
    this.players.delete(id);
  }

  toggleCollissions() {
    if (!this.player.mesh) return;
    this.player.collissionEnabled = !this.player.collissionEnabled;
    // player mask
    const body = this.player.mesh.physicsBody;

    const playerMask = this.player.collissionEnabled ? FILTER_MASK_PLAYER_WITH_COLLISSIONS : FILTER_MASK_PLAYER_NO_COLLISSIONS;    

    if (!body || !body.shape) return;
    body.shape.filterCollideMask = playerMask;
  }
}
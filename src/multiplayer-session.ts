import * as BABYLON from '@babylonjs/core';
import * as Colyseus from 'colyseus.js';
import { getModel } from './assets/models';
import {
  FILTER_GROUP_PLAYER_MP,
  FILTER_MASK_PLAYER_MP_NO_COLLISSIONS,
  FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS,
  FILTER_MASK_PLAYER_NO_COLLISSIONS,
  FILTER_MASK_PLAYER_WITH_COLLISSIONS,
} from './collission-groups';
import { GameEntity } from './entities/game-entity';
import { PlayerEntity, PlayerStatus } from './entities/player-entity';
import gameRoot from './game-root';
import { TimeEntry } from './level-timer';

const UPDATE_SPEED_MS = 1000 / 60;
const PLAYER_INFO_SEND_INTERVAL_MS = 1000 / 30;
export const MAX_EXTRAPOLATION_MS = 150;
export const MAX_EXTRAPOLATION_DISTANCE = 1.2;

interface PlayerInfoMessage {
  position: Position;
  rotation: Rotation;
  nickname: string;
  color: string;
  status: PlayerStatus;
  collissionEnabled: boolean;
}

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
  targetPosition?: BABYLON.Vector3;
  targetRotation?: BABYLON.Quaternion;
  interpolationStartTime?: number;
  interpolationDuration: number;
  interpolationActive?: boolean; // Track if disablePreStep is currently enabled
  lastServerPosition?: BABYLON.Vector3;
  lastServerRotation?: BABYLON.Quaternion;
  lastServerUpdateAt?: number;
  predictedVelocity?: BABYLON.Vector3;
  extrapolationStartAt?: number;
  lastExtrapolationAt?: number;
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
  lastStateSyncAt = performance.now();
  lastPlayerInfoSentAt = 0;
  lastPlayerInfoSignature = '';

  constructor(scene: BABYLON.Scene, player: PlayerEntity, _objects: BABYLON.Mesh[]) {
    this.scene = scene;
    this.player = player;
    this.ws = new Colyseus.Client(`ws://${window.location.host}`);
    this.ws
      .joinOrCreate<MultiplayerGameInfo>('my_room')
      .then(room => {
        this.room = room;
        console.warn(room.sessionId, 'joined', room.name);
        this.localPlayerId = room.sessionId;
        gameRoot.uiManager?.timerUI.showConnectionStatus('online', room.name);

        room.onStateChange(async state => {
          if (performance.now() - this.lastStateSyncAt < UPDATE_SPEED_MS) return;
          this.lastStateSyncAt = performance.now();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await this.updatePlayers((state.players as any).$items);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gameRoot.uiManager?.timeTableUI.updateUI((state.times as any).$items);
        });

        room.onMessage('player:disconnected', message => {
          this.removePlayer(message);
        });

        room.onMessage('chat:update', message => {
          if (message.playerId === this.localPlayerId) return;
          gameRoot.uiManager?.chatUI.addChatMessage(message);
        });

        room.onError((_code, message) => {
          console.warn(room.sessionId, "couldn't join", room.name, message);
          gameRoot.uiManager?.timerUI.showConnectionStatus('offline', 'join error');
        });

        room.onLeave(_code => {
          console.warn(room.sessionId, 'player left', room.name);
          gameRoot.uiManager?.timerUI.showConnectionStatus('offline', 'session closed');
        });

        scene.onBeforeRenderObservable.add(() => {
          this.maybeSendPlayerInfo();
          this.applyInterpolation();
          // this.sendObjectInfo(objects);
        });
      })
      .catch(e => {
        console.warn('JOIN ERROR', e);
        gameRoot.uiManager?.timerUI.showConnectionStatus('offline', 'cannot connect');
      });
  }

  async updatePlayers(playerInfo: Map<string, PlayerInfo>) {
    if (this.updating) return;
    this.updating = true;

    try {
      for (const [id, info] of playerInfo) {
        if (id === this.localPlayerId) continue;
        const nickname = info.nickname || 'player';
        const color = info.color || 'blue';

        let player = this.players.get(id);
        if (!player) {
          player = { status: 'in_lobby', interpolationDuration: PLAYER_INFO_SEND_INTERVAL_MS };
          this.players.set(id, player);
        }
        // if player changes color, or nickname remove him and skip to next iteration
        const colorChange = player.mesh && player.color && player.color !== color;
        const nicknameChange = player.mesh && player.nickname && player.nickname !== nickname;
        if (colorChange || nicknameChange) {
          this.removePlayer(id);
          continue;
        }
        // update status and metadata
        player.status = info.status;
        player.nickname = nickname;
        player.color = color;
        player.collissionEnabled = info.collissionEnabled;

        // create mesh for another player if player mesh doesn't exist
        if (!player.mesh) {
          player.mesh = await this.createMpPlayer(this.scene, nickname, color);
        }
        if (info.position && info.rotation) {
          const now = performance.now();
          const nextServerPosition = new BABYLON.Vector3(
            info.position.x,
            info.position.y,
            info.position.z
          );
          const nextServerRotation = new BABYLON.Quaternion(
            info.rotation.x,
            info.rotation.y,
            info.rotation.z,
            info.rotation.w
          );

          if (player.lastServerPosition && player.lastServerUpdateAt) {
            const deltaMs = now - player.lastServerUpdateAt;
            if (deltaMs > 0) {
              player.predictedVelocity = nextServerPosition
                .subtract(player.lastServerPosition)
                .scale(1000 / deltaMs);
            }
          }

          player.lastServerPosition = nextServerPosition.clone();
          player.lastServerRotation = nextServerRotation.clone();
          player.lastServerUpdateAt = now;
          player.extrapolationStartAt = now;
          player.lastExtrapolationAt = now;

          // set interpolation targets for next frame lerp
          player.targetPosition = nextServerPosition;
          player.targetRotation = nextServerRotation;
          player.interpolationStartTime = now;
          // Store current position for interpolation
          player.position = player.position || info.position;
          player.rotation = player.rotation || info.rotation;
        }

        // collissions toggle
        const shouldHaveCollission = this.player.collissionEnabled && player.collissionEnabled;
        player.mesh.getChildMeshes().forEach(x => {
          if (!x.name.includes('player')) return;
          const material = x.material as BABYLON.PBRMaterial;
          material.alpha = shouldHaveCollission ? 1 : 0.5;
          material.transparencyMode = shouldHaveCollission ? 0 : 2;
        });
        const mpBody = player.mesh.physicsBody;
        if (!mpBody || !mpBody.shape) return;
        const playerMpMask = shouldHaveCollission
          ? FILTER_MASK_PLAYER_MP_WITH_COLLISSIONS
          : FILTER_MASK_PLAYER_MP_NO_COLLISSIONS;
        mpBody.shape.filterCollideMask = playerMpMask;
      }
    } finally {
      this.updating = false;
    }
  }

  applyInterpolation() {
    const now = performance.now();
    for (const [, player] of this.players) {
      if (!player.mesh) {
        continue;
      }

      if (!player.targetPosition || !player.targetRotation || !player.interpolationStartTime) {
        this.applyExtrapolation(player, now);

        // Cleanup: re-enable physics if interpolation was cleared but disablePreStep is still set
        if (player.interpolationActive && player.mesh.physicsBody) {
          player.mesh.physicsBody.disablePreStep = false;
          player.interpolationActive = false;
        }
        continue;
      }

      const elapsed = now - player.interpolationStartTime;
      const t = Math.min(1, elapsed / player.interpolationDuration);

      // Enable physics suspension at start of interpolation
      if (!player.interpolationActive && player.mesh.physicsBody) {
        player.mesh.physicsBody.disablePreStep = true;
        player.interpolationActive = true;
      }

      if (t < 1) {
        // Interpolate towards target (keep disablePreStep = true throughout)
        const currentPos = player.mesh.position.clone();
        const newPos = BABYLON.Vector3.Lerp(currentPos, player.targetPosition, t);
        const newRot = BABYLON.Quaternion.Slerp(player.mesh.rotationQuaternion || BABYLON.Quaternion.Identity(), player.targetRotation, t);

        player.mesh.position = newPos;
        player.mesh.rotationQuaternion = newRot;
      } else {
        // Interpolation complete: snap to target, re-enable physics, and cleanup
        player.mesh.position = player.targetPosition.clone();
        player.mesh.rotationQuaternion = player.targetRotation.clone();

        // Re-enable physics after interpolation is complete
        if (player.mesh.physicsBody) {
          player.mesh.physicsBody.disablePreStep = false;
        }
        player.interpolationActive = false;

        player.interpolationStartTime = undefined;
        player.targetPosition = undefined;
        player.targetRotation = undefined;
      }
    }
  }

  applyExtrapolation(player: PlayerInfo, now: number) {
    if (
      !player.mesh ||
      !player.lastServerPosition ||
      !player.extrapolationStartAt ||
      !player.predictedVelocity
    ) {
      return;
    }

    const elapsedTotal = now - player.extrapolationStartAt;
    if (elapsedTotal > MAX_EXTRAPOLATION_MS) return;

    const previousStepAt = player.lastExtrapolationAt ?? now;
    const stepMs = now - previousStepAt;
    player.lastExtrapolationAt = now;
    if (stepMs <= 0) return;

    const extrapolated = player.mesh.position
      .clone()
      .add(player.predictedVelocity.scale(stepMs / 1000));
    const offset = extrapolated.subtract(player.lastServerPosition);
    if (offset.length() > MAX_EXTRAPOLATION_DISTANCE) {
      offset.normalize().scaleInPlace(MAX_EXTRAPOLATION_DISTANCE);
      player.mesh.position = player.lastServerPosition.add(offset);
    } else {
      player.mesh.position = extrapolated;
    }

    if (player.lastServerRotation && player.mesh.rotationQuaternion) {
      player.mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(
        player.mesh.rotationQuaternion,
        player.lastServerRotation,
        0.2
      );
    }
  }

  sendObjectInfo(meshes: BABYLON.Mesh[]) {
    if (!this.room) return;
    this.room.send(
      'objects:info',
      meshes.reduce((acc: Record<string, unknown>, cur) => {
        acc[cur.name] = {
          position: { x: cur.position.x, y: cur.position.y, z: cur.position.z },
          rotation: {
            x: cur.rotationQuaternion?.x,
            y: cur.rotationQuaternion?.y,
            z: cur.rotationQuaternion?.z,
            w: cur.rotationQuaternion?.w,
          },
        };
        return acc;
      }, {})
    );
  }

  updateObjects(objectInfo: Map<string, ObjectInfo>) {
    if (this.updatingObjects) return;
    this.updatingObjects = true;

    for (const [id, info] of objectInfo) {
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
        o.mesh.rotationQuaternion = new BABYLON.Quaternion(
          info.rotation.x,
          info.rotation.y,
          info.rotation.z,
          info.rotation.w
        );
        o.mesh.physicsBody!.disablePreStep = false;
      }
    }

    this.updatingObjects = false;
  }

  sendTimeToServer(timeEntry: TimeEntry) {
    if (!this.room) return;
    this.room.send('add:time', timeEntry);
  }

  sendChatMessage(text: string) {
    if (!this.room) return;
    this.room.send('chat:message', text);
  }

  maybeSendPlayerInfo() {
    if (!this.room || !this.player.mesh) return;

    const message = this.getPlayerInfoMessage();
    const signature = this.getPlayerInfoSignature(message);
    const now = performance.now();
    const isUnchanged = signature === this.lastPlayerInfoSignature;
    const isTooSoon = now - this.lastPlayerInfoSentAt < PLAYER_INFO_SEND_INTERVAL_MS;

    if (isUnchanged && isTooSoon) return;

    this.lastPlayerInfoSignature = signature;
    this.lastPlayerInfoSentAt = now;
    this.room.send('player:info', message);
  }

  getPlayerInfoMessage(): PlayerInfoMessage {
    const mesh = this.player.mesh as BABYLON.Mesh;
    return {
      position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
      rotation: {
        x: mesh.rotationQuaternion?.x ?? 0,
        y: mesh.rotationQuaternion?.y ?? 0,
        z: mesh.rotationQuaternion?.z ?? 0,
        w: mesh.rotationQuaternion?.w ?? 1,
      },
      nickname: this.player.nickname,
      color: this.player.color,
      status: this.player.status as PlayerStatus,
      collissionEnabled: this.player.collissionEnabled,
    };
  }

  getPlayerInfoSignature(message: PlayerInfoMessage) {
    const { position, rotation, nickname, color, status, collissionEnabled } = message;
    return [
      position.x,
      position.y,
      position.z,
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w,
      nickname,
      color,
      status,
      collissionEnabled ? '1' : '0',
    ].join('|');
  }

  async createMpPlayer(scene: BABYLON.Scene, nickname: string, color?: string) {
    console.warn('Creating player', nickname);
    const box = BABYLON.MeshBuilder.CreateBox(
      'player-mp',
      {
        width: 0.4,
        height: 0.4,
        depth: 0.4,
      },
      scene
    );
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
    console.warn('Removing player', id);
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

    const playerMask = this.player.collissionEnabled
      ? FILTER_MASK_PLAYER_WITH_COLLISSIONS
      : FILTER_MASK_PLAYER_NO_COLLISSIONS;

    if (!body || !body.shape) return;
    body.shape.filterCollideMask = playerMask;
  }
}

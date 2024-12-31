import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { PlayerColor } from '../assets/colors';
import { getModel } from '../assets/models';
import { FILTER_GROUP_PLAYER, FILTER_MASK_PLAYER_NO_COLLISSIONS, FILTER_MASK_PLAYER_WITH_COLLISSIONS } from '../collission-groups';

export type PlayerStatus = 'in_lobby' | 'playing' | 'afk';
export interface Checkpoint {
  position: BABYLON.Vector3
  rotationQuaternion: BABYLON.Quaternion
}

export interface PlayerEntity {
  nickname: string
  moving: boolean
  speed: number
  rotationSpeed: number
  jumpingPower: number
  jumping: boolean
  mesh: BABYLON.Mesh
  physics: BABYLON.PhysicsAggregate
  checkpoints: Checkpoint[]
  lastCheckpointIndex: number
  color: string
  status: PlayerStatus
  collissionEnabled?: boolean
}

export interface CreatePlayerOptions {
  nickname: string
  color: PlayerColor
  startPosition: BABYLON.Vector3
}

export const createPlayer = async (scene: BABYLON.Scene, opts: CreatePlayerOptions) => {
  const box = BABYLON.MeshBuilder.CreateBox('player', {
    width: 0.4,
    height: 0.4,
    depth: 0.4,
  }, scene);

  const playerModel = await getModel(scene, `player-${opts.color}.glb`);
  playerModel.meshes.forEach(mesh => mesh.setParent(box));

  box.visibility = 0;
  box.position = opts.startPosition || new BABYLON.Vector3(0, 0, 0);

  // physics
  const boxAggregate = new BABYLON.PhysicsAggregate(
    box,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 10, restitution: 0, friction: 0.7 },
    scene
  );

  const player: PlayerEntity = {
    speed: 1.3,
    rotationSpeed: 4,
    jumpingPower: 60,
    jumping: false,
    moving: false,
    mesh: box,
    physics: boxAggregate,
    checkpoints: [],
    lastCheckpointIndex: 0,
    nickname: opts.nickname,
    color: opts.color,
    status: 'in_lobby',
    collissionEnabled: true
  }

  boxAggregate.body.setCollisionCallbackEnabled(true);
  boxAggregate.body.setLinearDamping(1);

  const observable = boxAggregate.body.getCollisionObservable();
  const observer = observable.add(collisionEvent => {
    if (collisionEvent.collidedAgainst === null) return;
    if (!collisionEvent.normal) return;
    const collidedAgainstNode = collisionEvent.collidedAgainst.transformNode;
    if (['ground', 'wall', 'player-mp'].includes(collidedAgainstNode.name)) {
      if (collisionEvent.type === BABYLON.PhysicsEventType.COLLISION_STARTED) {
        const upCollission = collisionEvent.normal?.dot(BABYLON.Vector3.Up()) ?? -1;
        // console.log('upCollission', upCollission);
        if (upCollission < -0.9 && upCollission > -1.1) {
          player.jumping = false;
        } else {
          const power = ['ground', 'wall'].includes(collidedAgainstNode.name) ? 1 : 5;
          // push player away
          player.physics.body.applyImpulse(
            collisionEvent.normal.scale(-power),
            player.mesh.getAbsolutePosition()
          );
        }
      }
    }
  });

  createNameTag(scene, box, opts.nickname);

  boxAggregate.shape.filterMembershipMask = FILTER_GROUP_PLAYER;
  const playerMask = player.collissionEnabled ? FILTER_MASK_PLAYER_WITH_COLLISSIONS : FILTER_MASK_PLAYER_NO_COLLISSIONS;
  boxAggregate.shape.filterCollideMask = playerMask;

  return player;
}

export const changePlayerColor = async (player: PlayerEntity, color: PlayerColor) => {
  // remove old meshes
  player.mesh.getChildMeshes().filter(mesh => mesh.name.includes('player')).forEach(mesh => {
    player.mesh.getScene().removeMesh(mesh, true);
  });

  // load new model
  const playerModel = await getModel(player.mesh.getScene(), `player-${color}.glb`);
  playerModel.meshes.forEach(mesh => {
    if (mesh.parent === null) {
      mesh.setParent(player.mesh);
      // Ensure the new meshes are positioned correctly
      mesh.position = new BABYLON.Vector3(0, 0.0001, 0);
      mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
      // Apply a 180-degree rotation around the X-axis to flip the model
      const flipX = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI);
      const flipY = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI);
      mesh.rotationQuaternion = flipX.multiply(mesh.rotationQuaternion);
      mesh.rotationQuaternion = flipY.multiply(mesh.rotationQuaternion);
    }
  });

  // save settings
  player.color = color;

  createNameTag(player.mesh.getScene(), player.mesh, player.nickname);
}

export const createNameTag = (scene: BABYLON.Scene, mesh: BABYLON.Mesh, nickname: string) => {
  // name tag
  const nickNameTextPlane = BABYLON.MeshBuilder.CreatePlane('nickname', { size: 2 }, scene);
  nickNameTextPlane.rotation = new BABYLON.Vector3(0, 0, 0);
  nickNameTextPlane.parent = mesh;
  nickNameTextPlane.position.y = 0.7;
  nickNameTextPlane.isPickable = false;
  nickNameTextPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(nickNameTextPlane);

  const nickNameText = new GUI.TextBlock("nickNameText", nickname);
  nickNameText.color = "white";
  nickNameText.fontSize = "70px";
  nickNameText.shadowBlur = 0;
  nickNameText.outlineWidth = 10;
  nickNameText.outlineColor = "black";
  advancedTexture.addControl(nickNameText);
}

export const removeNameTag = (player: PlayerEntity) => {
  player.mesh.getChildMeshes().forEach(mesh => {
    if (mesh.name === 'nickname') {
      mesh.getScene().removeMesh(mesh);
    }
  });
}
import * as BABYLON from '@babylonjs/core';
import { playerColor } from '../assets/colors';

export interface Checkpoint {
  position: BABYLON.Vector3
  rotationQuaternion: BABYLON.Quaternion
}

export interface PlayerEntity {
  nickname?: string
  moving: boolean
  speed: number
  rotationSpeed: number
  jumpingPower: number
  jumping: boolean
  mesh: BABYLON.Mesh
  physics: BABYLON.PhysicsAggregate
  checkpoints: Checkpoint[]
}

export interface CreatePlayerOptions {
  startPosition?: BABYLON.Vector3
  color?: BABYLON.Color3
}

export const createPlayer = async (scene: BABYLON.Scene, opts: CreatePlayerOptions) => {
  const playerModel = await BABYLON.SceneLoader.ImportMeshAsync('', './assets/models/', 'player.glb', scene);
  
  const box = BABYLON.MeshBuilder.CreateBox('player', {
    width: 0.4,
    height: 0.4,
    depth: 0.4,
  }, scene);
  
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
    checkpoints: []
  }

  boxAggregate.body.setCollisionCallbackEnabled(true);
  boxAggregate.body.setLinearDamping(1);

  const observable = boxAggregate.body.getCollisionObservable();
  const observer = observable.add(collisionEvent => {
    if (collisionEvent.collidedAgainst === null) return;
    if (['ground', 'wall'].includes(collisionEvent.collidedAgainst.transformNode.name)) {
      if (collisionEvent.type === BABYLON.PhysicsEventType.COLLISION_STARTED) {
        const upCollission = collisionEvent.normal?.dot(BABYLON.Vector3.Up()) ?? -1;
        console.log('upCollission', upCollission);
        if (upCollission < -0.9 && upCollission > -1.1) {
          player.jumping = false;
        }
      }
    }
  });

  return player;
}

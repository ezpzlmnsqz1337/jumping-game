import * as BABYLON from '@babylonjs/core';
import { PlayerColor } from '../assets/colors';
import { getModel } from '../assets/models';
import { FILTER_GROUP_PLAYER, FILTER_MASK_PLAYER_NO_COLLISSIONS, FILTER_MASK_PLAYER_WITH_COLLISSIONS } from '../collission-groups';
import { GameEntity } from './game-entity';
import { GameLevel } from '../game-level';

export type PlayerStatus = 'in_lobby' | 'playing' | 'afk' | 'in_chat';
export interface Checkpoint {
  position: BABYLON.Vector3
  rotationQuaternion: BABYLON.Quaternion
}

export class PlayerEntity extends GameEntity {
  nickname = 'player';
  speed = 2.3;
  rotationSpeed = 4;
  strafeBoostSpeed = 1.4;
  jumpingPower = 60;
  jumping = false;
  moving = false;
  physics!: BABYLON.PhysicsAggregate;
  checkpoints: Checkpoint[] = [];
  lastCheckpointIndex = 0;
  color = 'blue';
  status = 'in_lobby';
  collissionEnabled = true;

  constructor(nickname: string = 'player', level: GameLevel, scene: BABYLON.Scene, color: PlayerColor) {
    super('player', level, scene);
    this.nickname = nickname;

    this.mesh = BABYLON.MeshBuilder.CreateBox('player', {
      width: 0.4,
      height: 0.4,
      depth: 0.4,
    }, scene);

    this.changeColor(color);

    this.mesh.visibility = 0;
    this.mesh.position = new BABYLON.Vector3(0, 0.001, 0);

    this.createPhysics(scene);
  }

  async changeColor(color: string) {
    // remove old meshes
    this.mesh!.getChildMeshes().filter(mesh => mesh.name.includes('player')).forEach(mesh => {
      this.scene.removeMesh(mesh, true);
    });

    // load new model
    const playerModel = await getModel(this.scene, `player-${color}.glb`);
    playerModel.meshes.forEach(mesh => {
      if (mesh.parent === null) {
        mesh.setParent(this.mesh);
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
    this.color = color;

    this.changeNickname(this.nickname);
  }

  changeNickname(nickname: string) {
    this.nickname = nickname;
    GameEntity.removeNameTag(this.scene, this.mesh!);
    GameEntity.createNameTag(this.scene, this.mesh!, nickname);
  }

  handleCollissions(collisionEvent: BABYLON.IPhysicsCollisionEvent) {
    if (collisionEvent.collidedAgainst === null) return;
    if (!collisionEvent.normal) return;
    if (!this.mesh) return;

    const collidedAgainstNode = collisionEvent.collidedAgainst.transformNode;
    if (!['ground', 'wall', 'player-mp'].includes(collidedAgainstNode.name))return;
    
    if (collisionEvent.type === BABYLON.PhysicsEventType.COLLISION_STARTED) {
      const upCollission = collisionEvent.normal?.dot(BABYLON.Vector3.Up()) ?? -1;
      // console.log('upCollission', upCollission);
      if (upCollission < -0.9 && upCollission > -1.1) {
        this.jumping = false;
      } else {
        const power = ['ground', 'wall'].includes(collidedAgainstNode.name) ? 1 : 5;
        // push player away
        this.physics.body.applyImpulse(
          collisionEvent.normal.scale(-power),
          this.mesh.getAbsolutePosition()
        );
      }
    }
  }

  jump() {
    if (!this.mesh) return;
    this.jumping = true;
    this.moving = true;

    this.physics.body.applyImpulse(
      BABYLON.Vector3.Up().scale(this.jumpingPower),
      this.mesh.getAbsolutePosition()
    );
    this.physics.body.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
  }

  createPhysics(scene: BABYLON.Scene): void {
    if (!this.mesh) return;
    // physics
    this.physics = new BABYLON.PhysicsAggregate(
      this.mesh,
      BABYLON.PhysicsShapeType.BOX,
      { mass: 10, restitution: 0, friction: 0.5 },
      scene
    );

    this.physics.body.setCollisionCallbackEnabled(true);
    this.physics.body.setLinearDamping(1);

    const observable = this.physics.body.getCollisionObservable();
    const observer = observable.add(collisionEvent => this.handleCollissions(collisionEvent));

    this.changeNickname(this.nickname);

    this.physics.shape.filterMembershipMask = FILTER_GROUP_PLAYER;
    const playerMask = this.collissionEnabled ? FILTER_MASK_PLAYER_WITH_COLLISSIONS : FILTER_MASK_PLAYER_NO_COLLISSIONS;
    this.physics.shape.filterCollideMask = playerMask;
  }
}
import * as BABYLON from '@babylonjs/core';
import { getDarkTexture } from '../assets/textures.ts';
import { FILTER_GROUP_WALL } from '../collission-groups.ts';
import { GameEntity } from './game-entity.ts';
import { GameLevel } from '../game-level.ts';

export type WallType = 'box' | 'sphere' | 'cylinder';

export class WallEntity extends GameEntity {
  friction = 0.4;
  wallType = 'box';

  constructor(scene: BABYLON.Scene, level: GameLevel, wallType: WallType, opts: any, position: BABYLON.Vector3, rotation?: BABYLON.Quaternion) {
    super('wall', level, scene);
    switch (wallType) {
      case 'box':
        this.mesh = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
        break;
      case 'sphere':
        this.mesh = BABYLON.MeshBuilder.CreateSphere('wall', opts, scene);
        break;
      case 'cylinder':
        this.mesh = BABYLON.MeshBuilder.CreateCylinder('wall', opts, scene);
        break;
      default:
        this.mesh = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
    }
    const wallMaterial = new BABYLON.StandardMaterial('wallMaterial');
    wallMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    wallMaterial.diffuseTexture = getDarkTexture({ uScale: opts.uScale, vScale: opts.vScale }, scene);
    wallMaterial.roughness = 0.3;
    this.mesh.material = wallMaterial;
    this.mesh.metadata = {...this.mesh.metadata, opts};
    this.mesh.position = position;
    if (rotation) this.mesh.rotationQuaternion = rotation;

    this.wallType = opts.wallType;
    this.friction = opts.friction;

    this.createPhysics(scene);
  }

  createPhysics(scene: BABYLON.Scene) {
    if (!this.mesh) return;

    let physicsShapeType: BABYLON.PhysicsShapeType;
    switch (this.wallType) {
      case 'box':
        physicsShapeType = BABYLON.PhysicsShapeType.BOX;
        break;
      case 'sphere':
        physicsShapeType = BABYLON.PhysicsShapeType.SPHERE;
        break;
      case 'cylinder':
        physicsShapeType = BABYLON.PhysicsShapeType.CYLINDER;
        break;
      default:
        physicsShapeType = BABYLON.PhysicsShapeType.BOX;
    }

    const wallAggregate = new BABYLON.PhysicsAggregate(
      this.mesh,
      physicsShapeType,
      { mass: 0, friction: this.friction },
      scene
    );
    wallAggregate.shape.filterMembershipMask = FILTER_GROUP_WALL;
  }
}
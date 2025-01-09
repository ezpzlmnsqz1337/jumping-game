import * as BABYLON from '@babylonjs/core';
import { getDarkTexture } from '../assets/textures.ts';
import { FILTER_GROUP_WALL } from '../collission-groups.ts';
import { GameEntity } from './game-entity.ts';
import { GameLevel } from '../game-level.ts';

export type WallType = 'box' | 'sphere' | 'cylinder';

export class WallEntity extends GameEntity {
  mesh: BABYLON.Mesh;

  constructor(scene: BABYLON.Scene, level: GameLevel, type: WallType, opts: any, position: BABYLON.Vector3, rotation?: BABYLON.Quaternion) {
    super('wall', level, scene);
    let physicsShapeType: BABYLON.PhysicsShapeType;
    switch (type) {
      case 'box':
        this.mesh = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
        physicsShapeType = BABYLON.PhysicsShapeType.BOX;
        break;
      case 'sphere':
        this.mesh = BABYLON.MeshBuilder.CreateSphere('wall', opts, scene);
        physicsShapeType = BABYLON.PhysicsShapeType.SPHERE;
        break;
      case 'cylinder':
        this.mesh = BABYLON.MeshBuilder.CreateCylinder('wall', opts, scene);
        physicsShapeType = BABYLON.PhysicsShapeType.CYLINDER;
        break;
      default:
        this.mesh = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
        physicsShapeType = BABYLON.PhysicsShapeType.BOX;
    }
    const wallMaterial = new BABYLON.StandardMaterial('wallMaterial');
    wallMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    wallMaterial.diffuseTexture = getDarkTexture({ uScale: opts.uScale, vScale: opts.vScale }, scene);
    wallMaterial.roughness = 0.3;
    this.mesh.material = wallMaterial;
    this.mesh.metadata = opts;
    this.mesh.position = position;
    if (rotation) this.mesh.rotationQuaternion = rotation;

    const wallAggregate = new BABYLON.PhysicsAggregate(
      this.mesh,
      physicsShapeType,
      { mass: 0, friction: opts.friction || 0.4 },
      scene
    );
    wallAggregate.shape.filterMembershipMask = FILTER_GROUP_WALL;
  }
}
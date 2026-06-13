import * as BABYLON from '@babylonjs/core';
import { getDarkTexture } from '../assets/textures.ts';
import { FILTER_GROUP_WALL } from '../collission-groups.ts';
import { GameEntity } from './game-entity.ts';
import { GameLevel } from '../game-level.ts';

export type WallType = 'box' | 'sphere' | 'cylinder';

export class WallEntity extends GameEntity {
  mesh: BABYLON.Mesh;

  constructor(
    scene: BABYLON.Scene,
    level: GameLevel,
    type: WallType,
    opts: Record<string, unknown>,
    position: BABYLON.Vector3,
    rotation?: BABYLON.Quaternion
  ) {
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
    const uScale = typeof opts.uScale === 'number' ? opts.uScale : 1;
    const vScale = typeof opts.vScale === 'number' ? opts.vScale : 1;
    const friction = typeof opts.friction === 'number' ? opts.friction : 0.4;
    wallMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    wallMaterial.diffuseTexture = getDarkTexture({ uScale, vScale }, scene);
    wallMaterial.roughness = 0.3;
    this.mesh.material = wallMaterial;
    this.mesh.metadata = opts;
    this.mesh.position = position;
    this.mesh.checkCollisions = true;
    if (rotation) this.mesh.rotationQuaternion = rotation;

    const wallAggregate = new BABYLON.PhysicsAggregate(
      this.mesh,
      physicsShapeType,
      { mass: 0, friction },
      scene
    );
    wallAggregate.shape.filterMembershipMask = FILTER_GROUP_WALL;
  }
}

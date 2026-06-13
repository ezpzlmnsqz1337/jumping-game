import * as BABYLON from '@babylonjs/core';
import { getDarkTexture, getLightTexture, getRedTexture } from '../assets/textures.ts';
import { FILTER_GROUP_WALL } from '../collission-groups.ts';
import { GameEntity } from './game-entity.ts';
import { GameLevel } from '../game-level.ts';
import { serializeQuaternion, serializeVector3, TextureVariant } from '../level-document';

export type WallType = 'box' | 'sphere' | 'cylinder';

export class WallEntity extends GameEntity {
  mesh: BABYLON.Mesh;
  wallType: WallType;
  opts: Record<string, unknown>;
  textureVariant: TextureVariant;

  private detectTextureVariant(): TextureVariant {
    const material = this.mesh.material as BABYLON.StandardMaterial | null;
    const texture = material?.diffuseTexture as BABYLON.Texture | null;
    const name = texture?.name || '';

    if (name.includes('/light/')) return 'light';
    if (name.includes('/red/')) return 'red';
    return 'dark';
  }

  constructor(
    scene: BABYLON.Scene,
    level: GameLevel,
    type: WallType,
    opts: Record<string, unknown>,
    position: BABYLON.Vector3,
    rotation?: BABYLON.Quaternion
  ) {
    super('wall', level, scene);
    this.wallType = type;
    this.opts = opts;
    const variantFromOpts = opts.textureVariant;
    this.textureVariant =
      variantFromOpts === 'light' || variantFromOpts === 'red' ? variantFromOpts : 'dark';
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
    if (this.textureVariant === 'light') {
      wallMaterial.diffuseTexture = getLightTexture({ uScale, vScale }, scene);
    } else if (this.textureVariant === 'red') {
      wallMaterial.diffuseTexture = getRedTexture({ uScale, vScale }, scene);
    } else {
      wallMaterial.diffuseTexture = getDarkTexture({ uScale, vScale }, scene);
    }
    wallMaterial.roughness = 0.3;
    this.mesh.material = wallMaterial;
    this.mesh.metadata = { wallType: type, opts, textureVariant: this.textureVariant };
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

  serialize() {
    const textureVariant = this.detectTextureVariant();
    return {
      wallType: this.wallType,
      opts: this.opts,
      textureVariant,
      scaling: serializeVector3(this.mesh.scaling),
      position: serializeVector3(this.mesh.position),
      rotation: this.mesh.rotationQuaternion
        ? serializeQuaternion(this.mesh.rotationQuaternion)
        : undefined,
    };
  }
}

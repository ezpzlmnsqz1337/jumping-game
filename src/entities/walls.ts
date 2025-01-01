import * as BABYLON from '@babylonjs/core';
import { getDarkTexture } from '../assets/textures.ts';
import { FILTER_GROUP_WALL } from '../collission-groups.ts';

export type WallType = 'box' | 'sphere' | 'cylinder';

export const createWall = (scene: BABYLON.Scene, type: WallType, opts: any, position: BABYLON.Vector3, rotation?: BABYLON.Quaternion) => {
  let wall: BABYLON.Mesh;
  let physicsShapeType:  BABYLON.PhysicsShapeType;

  switch (type) {
    case 'box':
      wall = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
      physicsShapeType = BABYLON.PhysicsShapeType.BOX;
      break;
    case 'sphere':
      wall = BABYLON.MeshBuilder.CreateSphere('wall', opts, scene);
      physicsShapeType = BABYLON.PhysicsShapeType.SPHERE;
      break;
    case 'cylinder':
      wall = BABYLON.MeshBuilder.CreateCylinder('wall', opts, scene);
      physicsShapeType = BABYLON.PhysicsShapeType.CYLINDER;
      break;
    default:
      wall = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
      physicsShapeType = BABYLON.PhysicsShapeType.BOX;
  }
  const wallMaterial = new BABYLON.StandardMaterial('wallMaterial');
  wallMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  wallMaterial.diffuseTexture = getDarkTexture({ uScale: opts.uScale, vScale: opts.vScale }, scene);
  wallMaterial.roughness = 0.3;
  wall.material = wallMaterial;
  wall.metadata = opts;
  wall.position = position;
  if (rotation) wall.rotationQuaternion = rotation;

  const wallAggregate = new BABYLON.PhysicsAggregate(wall, physicsShapeType, { mass: 0, friction: opts.friction || 1 }, scene);
  wallAggregate.shape.filterMembershipMask = FILTER_GROUP_WALL;

  return wall;
};
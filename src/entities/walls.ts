import * as BABYLON from '@babylonjs/core';
import { getDarkTexture, getRedTexture } from '../assets/textures';

export type WallType = 'box' | 'sphere' | 'cylinder';

export const createWalls = (scene: BABYLON.Scene) => {
  const walls = [
    // wide pillars
    createWall(scene, new BABYLON.Vector3(-3, 0.5, 1), 'box', { width: 2, depth: 2, height: 1 }),
    createWall(scene, new BABYLON.Vector3(-3, 0.8, -2), 'box', { width: 2, depth: 2, height: 1.6 }),
    createWall(scene, new BABYLON.Vector3(-3, 1.1, -5), 'box', { width: 2, depth: 2, height: 2.2 }),
    createWall(scene, new BABYLON.Vector3(0, 1.4, -5), 'box', { width: 2, depth: 2, height: 2.8 }),
    createWall(scene, new BABYLON.Vector3(0, 1.7, -2), 'box', { width: 2, depth: 2, height: 3.4 }),
    createWall(scene, new BABYLON.Vector3(0, 2, 1), 'box', { width: 2, depth: 2, height: 4 }),
    createWall(scene, new BABYLON.Vector3(3, 2.3, 1), 'box', { width: 2, depth: 2, height: 4.6 }),
    createWall(scene, new BABYLON.Vector3(3, 2.6, -2), 'box', { width: 2, depth: 2, height: 5.2 }),
    createWall(scene, new BABYLON.Vector3(3, 2.9, -5), 'box', { width: 2, depth: 2, height: 5.8 }),
    // second stage
    createWall(scene, new BABYLON.Vector3(10, 2.9, -2), 'box', { width: 10, depth: 10, height: 5.8 }),
    
    // narrow pillars
    createWall(scene, new BABYLON.Vector3(7.4, 6, 0), 'box', { width: 0.2, depth: 0.3, height: 0.5 }),
    createWall(scene, new BABYLON.Vector3(8, 6.3, 0), 'box', { width: 1, depth: 1, height: 1 }),
    createWall(scene, new BABYLON.Vector3(8, 6.6, -2), 'box', { width: 1, depth: 1, height: 1.6 }),
    createWall(scene, new BABYLON.Vector3(8, 6.9, -4), 'box', { width: 1, depth: 1, height: 2.2 }),
    createWall(scene, new BABYLON.Vector3(10, 7.2, -4), 'box', { width: 1, depth: 1, height: 2.8 }),
    createWall(scene, new BABYLON.Vector3(10, 7.5, -2), 'box', { width: 1, depth: 1, height: 3.4 }),
    createWall(scene, new BABYLON.Vector3(10, 7.8, 0), 'box', { width: 1, depth: 1, height: 4 }),
    createWall(scene, new BABYLON.Vector3(12, 8.1, 0), 'box', { width: 1, depth: 1, height: 4.6 }),
    createWall(scene, new BABYLON.Vector3(12, 8.4, -2), 'box', { width: 1, depth: 1, height: 5.2 }),
    createWall(scene, new BABYLON.Vector3(12, 8.7, -4), 'box', { width: 1, depth: 1, height: 5.8 }),

    // third stage
    createWall(scene, new BABYLON.Vector3(10, 6, -12), 'box', { width: 10, depth: 10, height: 12 }),
    // side walls
    createWall(scene, new BABYLON.Vector3(14.9, 17, -12), 'box', { width: 0.2, depth: 10, height: 10 }),
    createWall(scene, new BABYLON.Vector3(5.1, 17, -12), 'box', { width: 0.2, depth: 10, height: 10 }),
    createWall(scene, new BABYLON.Vector3(10, 17, -16.9), 'box', { width: 9.6, depth: 0.2, height: 10 }),
    createWall(scene, new BABYLON.Vector3(10, 19.5, -7.1), 'box', { width: 9.6, depth: 0.2, height: 5 }),
    // jumps
    // left side
    createWall(scene, new BABYLON.Vector3(14.4, 12.7, -8), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(14.4, 13.1, -10), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(14.4, 13.6, -12), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(14.4, 14, -14.5), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    // back side
    createWall(scene, new BABYLON.Vector3(13, 14.7, -16.4), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(11, 15.1, -16.4), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(9, 15.6, -16.4), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(6.5, 16.3, -16.4), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    // right side
    createWall(scene, new BABYLON.Vector3(5.5, 17, -14.5), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(5.5, 17.5, -12), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(5.5, 18.1, -10), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(5.5, 18.7, -8), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    // front side
    createWall(scene, new BABYLON.Vector3(7.5, 19.1, -7.6), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(9.3, 19.6, -7.6), 'box', { width: 0.3, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(11, 20, -7.6), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(13, 20.5, -7.6), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    // left side
    createWall(scene, new BABYLON.Vector3(14.4, 21, -10), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),
    createWall(scene, new BABYLON.Vector3(14.4, 21.4, -13), 'box', { width: 0.8, depth: 0.8, height: 0.2 }),

    // fourth stage
    createWall(scene, new BABYLON.Vector3(0, 11, -12), 'box', { width: 10, depth: 10, height: 22 }),

  ];

  walls.forEach(wall => {
    (wall.material as BABYLON.StandardMaterial).diffuseTexture = getDarkTexture({ uScale: 1, vScale: 1 }, scene);
  });

  // last wall
  (walls[walls.length-1].material as BABYLON.StandardMaterial).diffuseTexture = getRedTexture({ uScale:1, vScale:1 }, scene);

  return walls;
};

const createWall = (scene: BABYLON.Scene, position: BABYLON.Vector3, type: WallType, opts: any) => {
  let wall: BABYLON.Mesh;
  switch (type) {
    case 'box':
      wall = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
      break;
    case 'sphere':
      wall = BABYLON.MeshBuilder.CreateSphere('wall', opts, scene);
      break;
    case 'cylinder':
      wall = BABYLON.MeshBuilder.CreateCylinder('wall', opts, scene);
      break;
    default:
      wall = BABYLON.MeshBuilder.CreateBox('wall', opts, scene);
  }
  const wallMaterial = new BABYLON.StandardMaterial('wallMaterial');
  wallMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  wallMaterial.roughness = 0.3;
  wall.material = wallMaterial;
  wall.position = position;
  wall.metadata = opts;

  const wallAggregate = new BABYLON.PhysicsAggregate(wall, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 1 }, scene);

  return wall;
};
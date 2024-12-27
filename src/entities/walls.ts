import * as BABYLON from '@babylonjs/core';

export type WallType = 'box' | 'sphere' | 'cylinder';

export const createWalls = (scene: BABYLON.Scene) => {
  const walls = [
    createWall(scene, new BABYLON.Vector3(0, 0.5, 0), 'box', { width: 1, depth: 1, height: 1 }),
    createWall(scene, new BABYLON.Vector3(0, 0.8, -2), 'box', { width: 1, depth: 1, height: 1.6 }),
    createWall(scene, new BABYLON.Vector3(0, 1.1, -4), 'box', { width: 1, depth: 1, height: 2.2 }),
    createWall(scene, new BABYLON.Vector3(2, 1.4, -4), 'box', { width: 1, depth: 1, height: 2.8 }),
    createWall(scene, new BABYLON.Vector3(2, 1.7, -2), 'box', { width: 1, depth: 1, height: 3.4 }),
    createWall(scene, new BABYLON.Vector3(2, 2, 0), 'box', { width: 1, depth: 1, height: 4 }),
    createWall(scene, new BABYLON.Vector3(4, 2.3, 0), 'box', { width: 1, depth: 1, height: 4.6 }),
    createWall(scene, new BABYLON.Vector3(4, 2.6, -2), 'box', { width: 1, depth: 1, height: 5.2 }),
    createWall(scene, new BABYLON.Vector3(4, 2.9, -4), 'box', { width: 1, depth: 1, height: 5.8 }),
    // second stage
    createWall(scene, new BABYLON.Vector3(10, 2.9, -2), 'box', { width: 10, depth: 10, height: 5.8 }),
    
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
  ];

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

  const wallAggregate = new BABYLON.PhysicsAggregate(wall, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.7 }, scene);

  return wall;
};
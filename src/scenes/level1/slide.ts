import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';
import { PlayerEntity } from '../../entities/player';
import { machtinSS, warFlag } from '../../assets/textures';

export const createSlide = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const walls = []

  walls.push(
    // big slide
    createWall(scene, 'box', { width: 9, depth: 0.5, height: 42, friction: 0.1 }, new BABYLON.Vector3(-10.00, 19.83, 18.88), new BABYLON.Quaternion(-0.15, 0.00, 0.00, 0.99)),
    // slides right
    createWall(scene, 'box', { width: 0.5, depth: 25, height: 9, friction: 0.1 }, new BABYLON.Vector3(-25.59, 38.34, 12.28), new BABYLON.Quaternion(0.00, 0.00, 0.34, 0.94)),
    createWall(scene, 'box', { width: 0.5, depth: 25, height: 9, friction: 0.1 }, new BABYLON.Vector3(-25.59, 20.34, 12.28), new BABYLON.Quaternion(0.00, 0.00, 0.34, 0.94)),
    // slides left
    createWall(scene, 'box', { width: 0.5, depth: 25, height: 9, friction: 0.1 }, new BABYLON.Vector3(-18.07, 29.07, 11.84), new BABYLON.Quaternion(0.34, 0.94, 0, 0)),
    createWall(scene, 'box', { width: 0.5, depth: 25, height: 9, friction: 0.1 }, new BABYLON.Vector3(-18.07, 11.07, 11.84), new BABYLON.Quaternion(0.34, 0.94, 0, 0)),
    // long sticks
    createWall(scene, 'box', { width: 15, depth: 0.2, height: 0.2 }, new BABYLON.Vector3(-28.37, 7.77, 18.04)),
    createWall(scene, 'box', { width: 15, depth: 0.2, height: 0.2 }, new BABYLON.Vector3(-28.37, 7.77, 5.54)),
    // bunker
    createWall(scene, 'box', { width: 0.2, depth: 6.05, height: 9.5 }, new BABYLON.Vector3(-36.00, 4.72, 21.29)), // front1
    createWall(scene, 'box', { width: 0.2, depth: 5.95, height: 9.5 }, new BABYLON.Vector3(-36.00, 4.72, 2.31)), // front2
    createWall(scene, 'box', { width: 0.2, depth: 12, height: 9.5 }, new BABYLON.Vector3(-36.00, 4.72, 11.75)), // front-mid
    createWall(scene, 'box', { width: 0.2, depth: 0.5, height: 7.9 }, new BABYLON.Vector3(-36.00, 3.92, 5.51)), // front-small1
    createWall(scene, 'box', { width: 0.2, depth: 0.5, height: 7.9 }, new BABYLON.Vector3(-36.00, 3.92, 18.01)), // front-small2
    createWall(scene, 'box', { width: 0.2, depth: 0.5, height: 1 }, new BABYLON.Vector3(-36.00, 8.97, 5.51)), // front-small-top1
    createWall(scene, 'box', { width: 0.2, depth: 0.5, height: 1 }, new BABYLON.Vector3(-36.00, 8.97, 18.01)), // front-small-top2
    createWall(scene, 'box', { width: 13.9, depth: 0.2, height: 9.5 }, new BABYLON.Vector3(-43.05, 4.72, -0.59)), // left
    createWall(scene, 'box', { width: 13.9, depth: 0.2, height: 9.5 }, new BABYLON.Vector3(-43.05, 4.72, 24.21)), // right
    createWall(scene, 'box', { width: 15, depth: 25, height: 0.2 }, new BABYLON.Vector3(-42.95, 9.62, 11.81)), // roof    
  )

  const decoration1 = createWall(scene, 'box', { width: 0.1, depth: 4, height: 6.5, friction: 0.1 }, new BABYLON.Vector3(-49.95, 2.98, 5.79), new BABYLON.Quaternion(0.71, 0.00, 0.00, 0.70));
  const material1 = new BABYLON.StandardMaterial('decoration', scene);
  material1.diffuseTexture = machtinSS({ uScale: 1, vScale: 1 }, scene);
  decoration1.material = material1;

  const decoration2 = createWall(scene, 'box', { width: 0.1, depth: 4, height: 6.5, friction: 0.1 }, new BABYLON.Vector3(-49.85, 2.83, 17.32), new BABYLON.Quaternion(0.71, 0.00, 0.00, 0.70));
  const material2 = new BABYLON.StandardMaterial('decoration', scene);
  material2.diffuseTexture = warFlag({ uScale: 1, vScale: 1 }, scene);
  decoration2.material = material2
  return walls;
}
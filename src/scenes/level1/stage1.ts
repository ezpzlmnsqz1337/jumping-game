import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';

export const createStage1 = (scene: BABYLON.Scene) => {
  const walls = []

  // wide pillars
  walls.push(
    createWall(scene, 'box', { width: 2, depth: 2, height: 1 }, new BABYLON.Vector3(-3, 0.5, 1)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 1.6 }, new BABYLON.Vector3(-3, 0.8, -2)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 2.2 }, new BABYLON.Vector3(-3, 1.1, -5)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 2.8 }, new BABYLON.Vector3(0, 1.4, -5)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 3.4 }, new BABYLON.Vector3(0, 1.7, -2)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 4 }, new BABYLON.Vector3(0, 2, 1)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 4.6 }, new BABYLON.Vector3(3, 2.3, 1)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 5.2 }, new BABYLON.Vector3(3, 2.6, -2)),
    createWall(scene, 'box', { width: 2, depth: 2, height: 5.8 }, new BABYLON.Vector3(3, 2.9, -5))
  )
  return walls;
}
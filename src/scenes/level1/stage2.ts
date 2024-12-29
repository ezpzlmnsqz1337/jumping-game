import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';

export const createStage2 = (scene: BABYLON.Scene) => {
  const walls = []

  walls.push(
    // second stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 5.8 }, new BABYLON.Vector3(10, 2.9, -2)),

    // narrow pillars
    createWall(scene, 'box', { width: 0.2, depth: 0.3, height: 0.5 }, new BABYLON.Vector3(7.4, 6, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 1 }, new BABYLON.Vector3(8, 6.3, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 1.6 }, new BABYLON.Vector3(8, 6.6, -2)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 2.2 }, new BABYLON.Vector3(8, 6.9, -4)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 2.8 }, new BABYLON.Vector3(10, 7.2, -4)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 3.4 }, new BABYLON.Vector3(10, 7.5, -2)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 4 }, new BABYLON.Vector3(10, 7.8, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 4.6 }, new BABYLON.Vector3(12, 8.1, 0)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 5.2 }, new BABYLON.Vector3(12, 8.4, -2)),
    createWall(scene, 'box', { width: 1, depth: 1, height: 5.8 }, new BABYLON.Vector3(12, 8.7, -4))
  )
  return walls;
}
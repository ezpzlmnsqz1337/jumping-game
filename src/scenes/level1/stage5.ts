import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';
import { PlayerEntity } from '../../entities/player';

export const createStage5 = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const walls = []

  walls.push(
    // fifth stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 32 }, new BABYLON.Vector3(-10, 16, -12)),

    // left side
    createWall(scene, 'box', { width: 8, depth: 3, height: 2 }, new BABYLON.Vector3(-10, 33.00, -14.80)),
    createWall(scene, 'box', { width: 0.5, depth: 1, height: 1 }, new BABYLON.Vector3(-5.80, 32.50, -14.80)),
    createWall(scene, 'box', { width: 0.5, depth: 3, height: 2 }, new BABYLON.Vector3(-8.20, 35, -14.80)),
    createWall(scene, 'box', { width: 0.5, depth: 3, height: 3 }, new BABYLON.Vector3(-10.00, 35.50, -14.80)),
    createWall(scene, 'box', { width: 0.5, depth: 3, height: 4 }, new BABYLON.Vector3(-12.10, 36.00, -14.80)),
    createWall(scene, 'box', { width: 0.5, depth: 1, height: 1 }, new BABYLON.Vector3(-12.60, 34.50, -15.80)),
    createWall(scene, 'box', { width: 0.5, depth: 1, height: 1.7 }, new BABYLON.Vector3(-10.50, 34.85, -15.80)),

    // right side
    createWall(scene, 'box', { width: 0.5, depth: 3, height: 11 }, new BABYLON.Vector3(-8.20, 36.90, -9.00)),
    createWall(scene, 'box', { width: 0.5, depth: 3, height: 12 }, new BABYLON.Vector3(-10.00, 37.40, -9.00)),
    createWall(scene, 'box', { width: 3, depth: 0.5, height: 10 }, new BABYLON.Vector3( -12.10, 36.90, -9.00), new BABYLON.Quaternion(0.00, 0.30, 0.00, 0.9)),
    createWall(scene, 'box', { width: 0.5, depth: 3, height: 1.7 }, new BABYLON.Vector3(-7.70, 37.15, -9.00)),
    createWall(scene, 'box', { width: 0.8, depth: 1, height: 0.2 }, new BABYLON.Vector3(-11.66, 37.10, -8.45), new BABYLON.Quaternion(0.00, 0.30, -0.00, 0.96)),
    createWall(scene, 'box', { width: 0.8, depth: 1, height: 0.2 }, new BABYLON.Vector3(-12.54, 38.30, -7.81), new BABYLON.Quaternion(0.00, 0.30, -0.00, 0.96)),
    createWall(scene, 'box', { width: 0.8, depth: 3, height: 0.2 }, new BABYLON.Vector3(-9.35, 39.59, -8.94), new BABYLON.Quaternion(0.10, 0.00, 0.00, 1.00)),
    createWall(scene, 'box', { width: 0.8, depth: 1, height: 0.2 }, new BABYLON.Vector3(-12.60, 40.60, -9.20)),    

  )
  return walls;
}
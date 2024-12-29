import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';

export const createStage4 = (scene: BABYLON.Scene) => {
  const walls = []

  walls.push(
    // fourth stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 22 }, new BABYLON.Vector3(0, 11, -12)),
    // main cylinder
    createWall(scene, 'cylinder', { diameter: 5, height: 20 }, new BABYLON.Vector3(0, 22, -12)),
    // cylinder walls
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(2.60, 23.00, -12.00)),
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(1.29, 24.20, -14.18), new BABYLON.Quaternion(0.00, -0.30, 0.00, 0.96)),
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(-1.19, 25.50, -14.28), new BABYLON.Quaternion(-0.00, 0.25, -0.00, 0.97)),
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(-2.55, 26.70, -12.0), new BABYLON.Quaternion(0.00, 0.68, 0.00, 0.73)),
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(-0.65, 27.60, -9.53), new BABYLON.Quaternion(0.00, 0.00, 0.00, 1.00)),
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(1.84, 28.60, -10.15), new BABYLON.Quaternion(0.00, 0.92, 0.00, -0.3)),
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(2.43, 29.70, -12.77), new BABYLON.Quaternion(0.00, -0.60, 0.00, 0.80)),
    createWall(scene, 'box', { width: 0.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(1.34, 30.90, -14.23), new BABYLON.Quaternion(0.00, -0.24, 0.00, 0.97))
  )
  return walls;
}
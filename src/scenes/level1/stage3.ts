import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';

export const createStage3 = (scene: BABYLON.Scene) => {
  const walls = []

  walls.push(
    // third stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 12 }, new BABYLON.Vector3(10, 6, -12)),
    // side walls
    createWall(scene, 'box', { width: 0.2, depth: 10, height: 10 }, new BABYLON.Vector3(14.9, 17, -12)),
    createWall(scene, 'box', { width: 0.2, depth: 10, height: 10 }, new BABYLON.Vector3(5.1, 17, -12)),
    createWall(scene, 'box', { width: 9.6, depth: 0.2, height: 10 }, new BABYLON.Vector3(10, 17, -16.9)),
    createWall(scene, 'box', { width: 9.6, depth: 0.2, height: 5 }, new BABYLON.Vector3(10, 19.5, -7.1)),
    // jumps
    // left side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 12.7, -8)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 13.1, -10)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 13.6, -12)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 14, -14.5)),
    // back side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(13, 14.7, -16.4)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(11, 15.1, -16.4)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(9, 15.6, -16.4)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(6.5, 16.3, -16.4)),
    // right side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 17, -14.5)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 17.5, -12)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 18.1, -10)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(5.5, 18.7, -8)),
    // front side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(7.5, 19.1, -7.6)),
    createWall(scene, 'box', { width: 0.3, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(9.3, 19.6, -7.6)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(11, 20, -7.6)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(13, 20.5, -7.6)),
    // left side
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 21, -10)),
    createWall(scene, 'box', { width: 0.8, depth: 0.8, height: 0.2 }, new BABYLON.Vector3(14.4, 21.4, -13)),
    createWall(scene, 'box', { width: 5.8, depth: 0.5, height: 0.2 }, new BABYLON.Vector3(8.1, 21.4, -13))
  )
  return walls;
}
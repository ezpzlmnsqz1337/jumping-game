import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';

export const createStage6 = (scene: BABYLON.Scene) => {
  const walls = []

  walls.push(
    // sixth stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 42 }, new BABYLON.Vector3(-10, 21, 8.00)),

  )
  return walls;
}
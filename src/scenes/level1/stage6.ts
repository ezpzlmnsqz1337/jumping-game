import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';
import { PlayerEntity } from '../../entities/player';

export const createStage6 = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const walls = []

  walls.push(
    // sixth stage
    createWall(scene, 'box', { width: 10, depth: 10, height: 42 }, new BABYLON.Vector3(-10, 21, 8.00)),

  )
  return walls;
}
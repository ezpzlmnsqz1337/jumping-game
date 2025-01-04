import * as BABYLON from '@babylonjs/core';
import { WallEntity } from '../../entities/walls';
import { GameLevel } from '../../game-level';

export const createStage6 = (scene: BABYLON.Scene, level: GameLevel) => {
  const walls = []

  walls.push(
    // sixth stage
    new WallEntity(scene, level, 'box', { width: 10, depth: 10, height: 42 }, new BABYLON.Vector3(-10, 21, 8.00)),

  )
  return walls;
}
import * as BABYLON from '@babylonjs/core';
import { WallEntity } from '../../entities/wall-entity';
import { GameLevel } from '../../game-level';

export const createStage5 = (scene: BABYLON.Scene, level: GameLevel) => {
  const walls = [];

  walls.push(
    // fifth stage
    new WallEntity(
      scene,
      level,
      'box',
      { width: 10, depth: 10, height: 32 },
      new BABYLON.Vector3(-10, 16, -12)
    ),

    // left side
    new WallEntity(
      scene,
      level,
      'box',
      { width: 8, depth: 3, height: 2 },
      new BABYLON.Vector3(-10, 33.0, -14.8)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 1, height: 1 },
      new BABYLON.Vector3(-5.8, 32.5, -14.8)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 3, height: 2 },
      new BABYLON.Vector3(-8.2, 35, -14.8)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 3, height: 3 },
      new BABYLON.Vector3(-10.0, 35.5, -14.8)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 3, height: 4 },
      new BABYLON.Vector3(-12.1, 36.0, -14.8)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 1, height: 1 },
      new BABYLON.Vector3(-12.6, 34.5, -15.8)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 1, height: 1.7 },
      new BABYLON.Vector3(-10.5, 34.85, -15.8)
    ),

    // right side
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 3, height: 11 },
      new BABYLON.Vector3(-8.2, 36.9, -9.0)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 3, height: 12 },
      new BABYLON.Vector3(-10.0, 37.4, -9.0)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 3, depth: 0.5, height: 10 },
      new BABYLON.Vector3(-12.1, 36.9, -9.0),
      new BABYLON.Quaternion(0.0, 0.3, 0.0, 0.9)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.5, depth: 3, height: 1.7 },
      new BABYLON.Vector3(-7.7, 37.15, -9.0)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.8, depth: 1, height: 0.2 },
      new BABYLON.Vector3(-11.66, 37.1, -8.45),
      new BABYLON.Quaternion(0.0, 0.3, -0.0, 0.96)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.8, depth: 1, height: 0.2 },
      new BABYLON.Vector3(-12.54, 38.3, -7.81),
      new BABYLON.Quaternion(0.0, 0.3, -0.0, 0.96)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.8, depth: 3, height: 0.2 },
      new BABYLON.Vector3(-9.35, 39.59, -8.94),
      new BABYLON.Quaternion(0.1, 0.0, 0.0, 1.0)
    ),
    new WallEntity(
      scene,
      level,
      'box',
      { width: 0.8, depth: 1, height: 0.2 },
      new BABYLON.Vector3(-12.6, 40.6, -9.2)
    )
  );
  return walls;
};

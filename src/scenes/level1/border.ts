import * as BABYLON from '@babylonjs/core';
import { WallEntity } from '../../entities/wall-entity';
import { GameLevel } from '../../game-level';

export const createBorder = (scene: BABYLON.Scene, level: GameLevel) => {
  const xMin = 0;
  const xMax = 50.25;

  const yMin = -50.25;
  const yMax = 0;

  const height = 9.5;

  const walls = []

  walls.push(
    new WallEntity(scene, level, 'box', { width: 100, depth: 0.5, height, uScale: 10, vScale: 1 }, new BABYLON.Vector3(xMin, height/2, xMax)),
    new WallEntity(scene, level, 'box', { width: 100, depth: 0.5, height, uScale: 10, vScale: 1}, new BABYLON.Vector3(-xMin, height/2, -xMax)),

    new WallEntity(scene, level, 'box', { width: 0.5, depth: 101, height , uScale: 1, vScale: 10}, new BABYLON.Vector3(yMin, height/2, yMax)),
    new WallEntity(scene, level, 'box', { width: 0.5, depth: 101, height , uScale: 1, vScale: 10}, new BABYLON.Vector3(-yMin, height/2, -yMax)),
  )
  
  return walls;
}
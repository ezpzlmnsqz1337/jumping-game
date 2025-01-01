import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';
import { PlayerEntity } from '../../entities/player';

export const createSlide = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const walls = []

  walls.push(
    // sixth stage
    createWall(scene, 'box', { width: 9, depth: 0.5, height: 42, friction: 0.1 }, new BABYLON.Vector3(-10.00, 19.83, 18.88),  new BABYLON.Quaternion(-0.15, 0.00, 0.00, 0.99))
  )
  return walls;
}
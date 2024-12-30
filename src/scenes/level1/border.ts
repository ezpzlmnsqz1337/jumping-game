import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';

export const createBorder = (scene: BABYLON.Scene) => {
  const xMin = 0;
  const xMax = 50.25;

  const yMin = -50.25;
  const yMax = 0;

  const height = 3;

  const walls = []

  walls.push(
    createWall(scene, 'box', { width: 100, depth: 0.5, height, uScale: 10, vScale: 1 }, new BABYLON.Vector3(xMin, 1.50, xMax)),
    createWall(scene, 'box', { width: 100, depth: 0.5, height, uScale: 10, vScale: 1}, new BABYLON.Vector3(-xMin, 1.50, -xMax)),

    createWall(scene, 'box', { width: 0.5, depth: 101, height , uScale: 1, vScale: 10}, new BABYLON.Vector3(yMin, 1.50, yMax)),
    createWall(scene, 'box', { width: 0.5, depth: 101, height , uScale: 1, vScale: 10}, new BABYLON.Vector3(-yMin, 1.50, -yMax)),
  )
  
  return walls;
}
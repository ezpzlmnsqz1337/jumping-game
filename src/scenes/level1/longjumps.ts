import * as BABYLON from '@babylonjs/core';
import { createWall } from '../../entities/walls';
import { getLightTexture } from '../../assets/textures';

export const createLongJumps = (scene: BABYLON.Scene) => {
  const initialJumpZ = -45;
  const spacing = 6;

  const height = 0.8;
  const depth = 4;

  const walls = []

  // first jump 40 - 31,5 = 8,5 units

  // last jump 40 - 30,7 = 9,3 units

  for(let i = 0; i < 16; i++) {
    walls.push(
      createWall(scene, 'box', { width: 8 - (0.1*i), depth, height }, new BABYLON.Vector3( 23.50, 0.00, initialJumpZ+spacing*i)),
      createWall(scene, 'box', { width: 8, depth, height }, new BABYLON.Vector3(40, 0.00, initialJumpZ+spacing*i)),
    )
  }
  walls.forEach(wall => (wall.material as BABYLON.StandardMaterial).diffuseTexture = getLightTexture({ uScale:1, vScale:1 }, scene));
  return walls;
}
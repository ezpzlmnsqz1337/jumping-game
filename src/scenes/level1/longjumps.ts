import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { easyColor, hardColor, mediumColor } from '../../assets/colors';
import { getLightTexture } from '../../assets/textures';
import { WallEntity } from '../../entities/walls';
import { GameLevel } from '../../game-level';

export const createLongJumps = (scene: BABYLON.Scene, level: GameLevel, numberOfJumps: number = 19) => {
  const initialJumpZ = -45;
  const initialJumpX = 46;
  const initialJumpLength = 9.5;

  const spacing = 5;

  const height = 0.6;
  const depth = 4;

  const walls = []

  for (let i = 0; i < numberOfJumps; i++) {
    const nextJumpLengthDelta = (0.1 * i);
    const jumpLength = (initialJumpLength + nextJumpLengthDelta) * 10;

    const jumpLengthText = BABYLON.MeshBuilder.CreateText('', `${jumpLength}`, scene.metadata.fonts.fontMontserratRegular, { size: 1, depth: 0.3 }, scene, earcut) as BABYLON.Mesh;
    jumpLengthText.position = new BABYLON.Vector3(initialJumpX + 4, 1.3, initialJumpZ + spacing * i);
    jumpLengthText.rotationQuaternion = new BABYLON.Quaternion(0, -0.7, 0, -0.7);

    const material = new BABYLON.StandardMaterial('jumpLengthTextMaterial', scene);
    material.diffuseColor = jumpLength <= 100 ? easyColor : jumpLength <= 110 ? mediumColor : hardColor;
    jumpLengthText.material = material;

    walls.push(
      new WallEntity(scene, level, 'box', { width: 8, depth, height }, new BABYLON.Vector3(initialJumpX, 0.30, initialJumpZ + spacing * i)),
      new WallEntity(scene, level, 'box', { width: 8, depth, height }, new BABYLON.Vector3(initialJumpX - nextJumpLengthDelta - 17.5, 0.30, initialJumpZ + spacing * i)),
    )
  }

  walls.forEach(wall => (wall.mesh.material as BABYLON.StandardMaterial).diffuseTexture = getLightTexture({ uScale: 1, vScale: 1 }, scene));
  return walls;
}